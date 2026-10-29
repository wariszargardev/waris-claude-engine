const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const MAX_AGE_DAYS = 60;
const BIG_LINE = 200 * 1024;
const BIG_TOOL_TOKENS = 20000;

const files = new Map();
const sessions = new Map();
const calls = [];
const warnings = new Set();
const seenMessages = new Set();
const seenPrompts = new Set();
const seenResults = new Set();

function estimateTokens(text) {
  let media = 0, mediaChars = 0;
  for (const m of text.matchAll(/"data":"[A-Za-z0-9+/=]{2000,}"/g)) { media++; void m; }
  for (const m of text.matchAll(/[A-Za-z0-9+/=]{2000,}/g)) mediaChars += m[0].length;
  return Math.round((text.length - mediaChars) / 4) + media * 1600;
}

function projectName(dir) {
  const name = dir.replace(/^[a-z]--/i, '').replace(/^Afia-Insurance-Projects-Office-/i, '');
  return name.toLowerCase();
}

function getSession(id, project) {
  if (!sessions.has(id)) {
    sessions.set(id, {
      id, project, title: '', cwd: '', start: null, end: null, costUSD: 0,
      prompts: [], toolUses: new Map(), current: null,
    });
  }
  return sessions.get(id);
}

function listTranscripts() {
  const out = [];
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true }).filter(d => d.isDirectory()); } catch { return out; }
  for (const d of dirs) {
    const projDir = path.join(PROJECTS_DIR, d.name);
    let entries = [];
    try { entries = fs.readdirSync(projDir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.jsonl')) {
        out.push({ file: path.join(projDir, e.name), project: projectName(d.name), session: e.name.slice(0, -6), agent: null });
      } else if (e.isDirectory()) {
        const subDir = path.join(projDir, e.name, 'subagents');
        let subs = [];
        try { subs = fs.readdirSync(subDir); } catch { continue; }
        for (const s of subs) {
          if (!s.endsWith('.jsonl')) continue;
          let agentType = s.replace(/^agent-a?/, '').replace(/-[0-9a-f]{8,}\.jsonl$/, '').replace(/\.jsonl$/, '');
          try { agentType = JSON.parse(fs.readFileSync(path.join(subDir, s.replace(/\.jsonl$/, '.meta.json')), 'utf8')).agentType || agentType; } catch {}
          if (/^[0-9a-f]+$/.test(agentType)) agentType = 'subagent';
          out.push({ file: path.join(subDir, s), project: projectName(d.name), session: e.name, agent: agentType });
        }
      }
    }
  }
  return out.filter(f => { try { return fs.statSync(f.file).mtimeMs >= cutoff; } catch { return false; } });
}

function promptText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter(c => c.type === 'text').map(c => c.text).join(' ');
  return '';
}

function isRealPrompt(rec) {
  if (rec.type !== 'user' || rec.isMeta || rec.isSidechain || rec.toolUseResult) return false;
  const c = rec.message && rec.message.content;
  if (Array.isArray(c) && c.some(x => x.type === 'tool_result')) return false;
  const text = promptText(c).trim();
  if (!text || text.startsWith('<local-command') || text.startsWith('<command-name>') || text.startsWith('Caveat:')) return false;
  return true;
}

function toolLabel(tu) {
  const i = tu.input || {};
  if (tu.name === 'Skill') return 'Skill:' + (i.skill || '?');
  if (tu.name === 'Agent' || tu.name === 'Task') return 'Agent:' + (i.subagent_type || 'general');
  if (tu.name.startsWith('mcp__ccd_')) return 'App:' + tu.name.split('__').slice(-1)[0];
  if (tu.name.startsWith('mcp__')) return 'MCP:' + tu.name.split('__').slice(-1)[0];
  return tu.name;
}

function toolDetail(tu) {
  const i = tu.input || {};
  return String(i.file_path || i.command || i.pattern || i.skill || i.description || i.query || i.url || '').slice(0, 140);
}

function handleMain(rec, meta, sizeHint) {
  if (rec.type === 'custom-title' || rec.type === 'agent-name') {
    const s = getSession(rec.sessionId || meta.session, meta.project);
    if (rec.customTitle || rec.agentName) s.title = rec.customTitle || rec.agentName;
    return;
  }
  if (rec.type === 'cost-state') {
    const s = getSession(rec.sessionId || meta.session, meta.project);
    if (typeof rec.totalCostUSD === 'number') s.costUSD = rec.totalCostUSD;
    return;
  }
  const s = getSession(rec.sessionId || meta.session, meta.project);
  if (rec.cwd && !s.cwd) s.cwd = rec.cwd;
  const ts = rec.timestamp ? Date.parse(rec.timestamp) : null;
  if (ts) {
    if (!s.start || ts < s.start) s.start = ts;
    if (!s.end || ts > s.end) s.end = ts;
  }

  if (isRealPrompt(rec)) {
    if (seenPrompts.has(rec.uuid)) { s.current = null; return; }
    seenPrompts.add(rec.uuid);
    const text = promptText(rec.message.content).replace(/\s+/g, ' ').trim();
    const p = {
      id: rec.uuid, session: s.id, project: s.project, start: ts, end: ts, text: text.slice(0, 300),
      calls: 0, toolCalls: 0, tools: {}, details: [], bigOutputs: [],
      bagStart: 0, bagMax: 0, fresh: 0, cacheRead: 0, cacheWrite: 0, out: 0,
      subTokens: 0, subCalls: 0, agents: {}, gapMin: null,
    };
    const prev = s.prompts[s.prompts.length - 1];
    if (prev && prev.end && ts) p.gapMin = Math.round((ts - prev.end) / 60000);
    s.prompts.push(p);
    s.current = p;
    return;
  }

  const p = s.current;
  if (rec.type === 'user' && p) {
    const c = rec.message && rec.message.content;
    if (Array.isArray(c)) {
      for (const x of c) {
        if (x.type !== 'tool_result' || seenResults.has(x.tool_use_id)) continue;
        seenResults.add(x.tool_use_id);
        const tokens = sizeHint || estimateTokens(JSON.stringify(x.content || ''));
        if (tokens >= BIG_TOOL_TOKENS) {
          const tu = s.toolUses.get(x.tool_use_id) || { label: '?', detail: '' };
          p.bigOutputs.push({ tool: tu.label, detail: tu.detail, tokens });
        }
      }
    }
    if (ts && ts > p.end) p.end = ts;
    return;
  }

  if (rec.type === 'assistant' && rec.message) {
    const m = rec.message;
    for (const tu of (m.content || []).filter(c => c.type === 'tool_use')) {
      const label = toolLabel(tu);
      s.toolUses.set(tu.id, { label, detail: toolDetail(tu) });
      if (!p) continue;
      p.toolCalls++;
      p.tools[label] = (p.tools[label] || 0) + 1;
      if (p.details.length < 60) p.details.push({ tool: label, detail: toolDetail(tu) });
    }
    if (ts && p && ts > p.end) p.end = ts;
    const u = m.usage;
    if (!u || !m.id || seenMessages.has(m.id) || m.model === '<synthetic>') return;
    seenMessages.add(m.id);
    const fresh = u.input_tokens || 0, cr = u.cache_read_input_tokens || 0, cw = u.cache_creation_input_tokens || 0, out = u.output_tokens || 0;
    const bag = fresh + cr + cw;
    calls.push({ ts, project: s.project, session: s.id, model: m.model, agent: null, fresh, cacheRead: cr, cacheWrite: cw, out, bag });
    if (!p) return;
    if (!p.calls) p.bagStart = bag;
    p.calls++;
    p.fresh += fresh; p.cacheRead += cr; p.cacheWrite += cw; p.out += out;
    if (bag > p.bagMax) p.bagMax = bag;
  }
}

function handleSub(rec, meta) {
  if (rec.type !== 'assistant' || !rec.message || !rec.message.usage) return;
  const m = rec.message;
  if (!m.id || seenMessages.has(m.id) || m.model === '<synthetic>') return;
  seenMessages.add(m.id);
  const u = m.usage;
  const fresh = u.input_tokens || 0, cr = u.cache_read_input_tokens || 0, cw = u.cache_creation_input_tokens || 0, out = u.output_tokens || 0;
  calls.push({
    ts: rec.timestamp ? Date.parse(rec.timestamp) : null, project: meta.project, session: meta.session,
    model: m.model, agent: meta.agent, fresh, cacheRead: cr, cacheWrite: cw, out, bag: fresh + cr + cw,
  });
}

function processLine(line, meta) {
  if (!line) return;
  if (line.includes('"type":"api-request-blob"') || line.includes('"type":"file-history')) return;
  let sizeHint = 0;
  if (line.length > BIG_LINE) {
    if (!meta.agent && line.includes('"tool_result"')) {
      const ids = [...line.matchAll(/"tool_use_id":"([^"]+)"/g)].map(x => x[1]);
      const sid = (line.match(/"sessionId":"([^"]+)"/) || [])[1] || meta.session;
      const ts = (line.match(/"timestamp":"([^"]+)"/) || [])[1];
      const rec = { type: 'user', sessionId: sid, timestamp: ts, message: { content: ids.map(id => ({ type: 'tool_result', tool_use_id: id })) } };
      handleMain(rec, meta, Math.round(estimateTokens(line) / Math.max(ids.length, 1)));
      return;
    }
    if (!line.includes('"type":"assistant"')) return;
  }
  let rec;
  try { rec = JSON.parse(line); } catch { warnings.add('Some transcript lines could not be read (format change?)'); return; }
  if (meta.agent) handleSub(rec, meta); else handleMain(rec, meta, sizeHint);
}

function scan() {
  for (const meta of listTranscripts()) {
    let st;
    try { st = fs.statSync(meta.file); } catch { continue; }
    let f = files.get(meta.file);
    if (!f) { f = { offset: 0, rest: '' }; files.set(meta.file, f); }
    if (st.size < f.offset) { f.offset = 0; f.rest = ''; }
    if (st.size === f.offset) continue;
    const fd = fs.openSync(meta.file, 'r');
    const len = st.size - f.offset;
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, f.offset);
    fs.closeSync(fd);
    f.offset = st.size;
    const text = f.rest + buf.toString('utf8');
    const lines = text.split('\n');
    f.rest = lines.pop();
    for (const line of lines) processLine(line, meta);
  }
}

function attachSubagents() {
  const bySession = new Map();
  for (const s of sessions.values()) bySession.set(s.id, s.prompts.slice().sort((a, b) => a.start - b.start));
  for (const s of sessions.values()) for (const p of s.prompts) { p.subTokens = 0; p.subCalls = 0; p.agents = {}; }
  for (const c of calls) {
    if (!c.agent) continue;
    const ps = bySession.get(c.session);
    if (!ps || !ps.length) continue;
    let target = ps[0];
    for (const p of ps) { if (p.start <= c.ts) target = p; else break; }
    target.subCalls++;
    target.subTokens += c.bag + c.out;
    target.agents[c.agent] = (target.agents[c.agent] || 0) + c.bag + c.out;
  }
}

function skillDescriptionStats(cwd) {
  const dirs = [path.join(CLAUDE_DIR, 'skills')];
  if (cwd) dirs.push(path.join(cwd, '.claude', 'skills'));
  const seen = new Map();
  for (const dir of dirs) {
    let names = [];
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const n of names) {
      try {
        const text = fs.readFileSync(path.join(dir, n, 'SKILL.md'), 'utf8');
        const fm = (text.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
        const m = fm.match(/^description:[ \t]*(.*(?:\r?\n[ \t]+.*)*)/m);
        const desc = m ? m[1].replace(/\s*\r?\n\s*/g, ' ').trim().replace(/^(['"])([\s\S]*)\1$/, '$2').replace(/^[>|]-?\s*/, '') : '';
        seen.set(n, desc.length);
      } catch {}
    }
  }
  const lens = [...seen.entries()];
  return {
    count: lens.length,
    totalChars: lens.reduce((a, [, l]) => a + l, 0),
    over1024: lens.filter(([, l]) => l > 1024).sort((a, b) => b[1] - a[1]).map(([n, l]) => ({ name: n, chars: l })),
  };
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function median(arr) {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
}

function promptTotal(p) { return p.fresh + p.cacheRead + p.cacheWrite + p.out + p.subTokens; }

function buildTips(prompts, sessList, projects) {
  const tips = [];
  for (const pr of projects) {
    if (pr.baseline >= 80000) {
      const sk = pr.skills;
      tips.push({
        level: 'high', area: 'Baseline', title: `${pr.name} starts every session at ~${Math.round(pr.baseline / 1000)}k tokens`,
        why: `Every call in ${pr.name} re-sends this before your first word. ${sk.count} skill descriptions (~${Math.round(sk.totalChars / 4000)}k tokens) load each time${sk.over1024.length ? `, and ${sk.over1024.length} are over 1024 chars` : ''}.`,
        how: sk.over1024.length
          ? `Shorten: ${sk.over1024.slice(0, 5).map(s => `${s.name} (${s.chars})`).join(', ')}. Disable plugins you don't use in this repo (/plugin), and keep CLAUDE.md lean.`
          : 'Disable plugins you don\'t use in this repo (/plugin), and keep CLAUDE.md lean.',
      });
    }
  }
  const big = prompts.filter(p => p.bigOutputs.length).sort((a, b) => Math.max(...b.bigOutputs.map(o => o.tokens)) - Math.max(...a.bigOutputs.map(o => o.tokens))).slice(0, 3);
  const seenBig = new Set();
  for (const p of big) {
    const o = p.bigOutputs.slice().sort((a, b) => b.tokens - a.tokens)[0];
    if (seenBig.has(o.detail)) continue;
    seenBig.add(o.detail);
    tips.push({
      level: 'medium', area: 'Big tool output', promptId: p.id,
      title: `One ${o.tool} result added ~${Math.round(o.tokens / 1000)}k tokens`,
      why: `"${p.text.slice(0, 70)}" — ${o.detail || o.tool}. It stays in the bag for every later call in that session.`,
      how: 'Read a slice (offset/limit), grep for the part you need, or send the search to a subagent so only its summary comes back.',
    });
  }
  const heavy = sessList.filter(s => s.bagMax >= 160000).sort((a, b) => b.bagMax - a.bagMax).slice(0, 3);
  for (const s of heavy) {
    tips.push({
      level: 'medium', area: 'Long session', sessionId: s.id,
      title: `"${s.title || s.id.slice(0, 8)}" grew to ${Math.round(s.bagMax / 1000)}k`,
      why: `${s.prompts} prompts in one bag. Each call re-sends all of it, and older details start getting compacted.`,
      how: 'One task per session: /clear (or a new chat) when the task changes; /compact with "keep X" if you must continue.',
    });
  }
  const misses = prompts.filter(p => p.gapMin >= 60 && p.cacheWrite >= 50000);
  if (misses.length) {
    const tot = misses.reduce((a, p) => a + p.cacheWrite, 0);
    tips.push({
      level: 'low', area: 'Cache', title: `${misses.length} prompts re-wrote the cache after a break (~${Math.round(tot / 1000)}k tokens)`,
      why: 'The prompt cache expires after about an hour. The first prompt after a break pays to re-cache the whole bag.',
      how: 'After a long break on a big session, start a fresh one (or /compact first) instead of continuing.',
    });
  }
  const chatty = prompts.filter(p => p.calls >= 15 && p.toolCalls / p.calls < 1.3).sort((a, b) => b.calls - a.calls).slice(0, 2);
  for (const p of chatty) {
    tips.push({
      level: 'low', area: 'Many calls', promptId: p.id,
      title: `${p.calls} model calls for one prompt`,
      why: `"${p.text.slice(0, 70)}" ran tools one by one; each call re-sent the ~${Math.round(p.bagMax / 1000)}k bag.`,
      how: 'Ask for independent reads/commands in parallel, or move the routine steps into a skill script.',
    });
  }
  return tips;
}

function stats(days = 14) {
  scan();
  attachSubagents();
  const since = Date.now() - days * 86400000;
  const today = dayKey(Date.now());
  const recent = calls.filter(c => c.ts && c.ts >= since);
  const allPrompts = [];
  for (const s of sessions.values()) for (const p of s.prompts) if (p.start >= since) allPrompts.push(p);
  allPrompts.sort((a, b) => b.start - a.start);

  const dayMap = {};
  for (const c of recent) {
    const k = dayKey(c.ts);
    const d = dayMap[k] || (dayMap[k] = { day: k, tokens: 0, cacheRead: 0, cacheWrite: 0, fresh: 0, out: 0, calls: 0, byProject: {} });
    const t = c.bag + c.out;
    d.tokens += t; d.cacheRead += c.cacheRead; d.cacheWrite += c.cacheWrite; d.fresh += c.fresh; d.out += c.out; d.calls++;
    d.byProject[c.project] = (d.byProject[c.project] || 0) + t;
  }
  for (const p of allPrompts) {
    const d = dayMap[dayKey(p.start)];
    if (!d) continue;
    d.prompts = (d.prompts || 0) + 1;
    d.workMs = (d.workMs || 0) + Math.max(0, (p.end || p.start) - p.start);
  }
  const daysList = Object.values(dayMap).sort((a, b) => a.day.localeCompare(b.day));

  const firstBag = new Map();
  for (const c of calls) if (!c.agent && !firstBag.has(c.session)) firstBag.set(c.session, c.bag);
  const sessList = [...sessions.values()].filter(s => s.end && s.end >= since).map(s => {
    const ps = s.prompts;
    return {
      id: s.id, project: s.project, title: s.title, start: s.start, end: s.end, costUSD: s.costUSD,
      prompts: ps.length, baseline: firstBag.get(s.id) || 0,
      bagMax: ps.reduce((a, p) => Math.max(a, p.bagMax), 0),
      tokens: ps.reduce((a, p) => a + promptTotal(p), 0),
    };
  }).sort((a, b) => b.end - a.end);

  const projMap = {};
  for (const s of sessList) {
    const pr = projMap[s.project] || (projMap[s.project] = { name: s.project, sessions: 0, tokens: 0, baselines: [], cwd: '' });
    pr.sessions++; pr.tokens += s.tokens; if (s.baseline) pr.baselines.push(s.baseline);
    const src = sessions.get(s.id); if (src && src.cwd && !pr.cwd) pr.cwd = src.cwd;
  }
  const projects = Object.values(projMap).map(p => ({
    name: p.name, sessions: p.sessions, tokens: p.tokens, baseline: median(p.baselines), skills: skillDescriptionStats(p.cwd),
  })).sort((a, b) => b.tokens - a.tokens);

  const usage = {};
  for (const p of allPrompts) {
    for (const [k, n] of Object.entries(p.tools)) {
      if (!k.startsWith('Skill:') && !k.startsWith('Agent:') && !k.startsWith('MCP:')) continue;
      const u = usage[k] || (usage[k] = { name: k, uses: 0, prompts: 0, tokens: 0 });
      u.uses += n; u.prompts++; u.tokens += promptTotal(p);
    }
  }
  const usageList = Object.values(usage).map(u => ({ ...u, avgPromptTokens: Math.round(u.tokens / u.prompts) })).sort((a, b) => b.uses - a.uses);
  const agentTokens = {};
  for (const c of recent) if (c.agent) agentTokens[c.agent] = (agentTokens[c.agent] || 0) + c.bag + c.out;

  const todayCalls = recent.filter(c => dayKey(c.ts) === today);
  const todayPrompts = allPrompts.filter(p => dayKey(p.start) === today);
  const sumCR = todayCalls.reduce((a, c) => a + c.cacheRead, 0);
  const sumIn = todayCalls.reduce((a, c) => a + c.bag, 0);
  const live = sessList[0] ? sessions.get(sessList[0].id) : null;

  let improvements = null;
  try { improvements = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'improvements.json'), 'utf8')); } catch {}

  return {
    generatedAt: Date.now(), days,
    today: {
      tokens: todayCalls.reduce((a, c) => a + c.bag + c.out, 0), output: todayCalls.reduce((a, c) => a + c.out, 0),
      prompts: todayPrompts.length, sessions: new Set(todayPrompts.map(p => p.session)).size, calls: todayCalls.length,
      workMs: todayPrompts.reduce((a, p) => a + Math.max(0, p.end - p.start), 0),
      cacheHitPct: sumIn ? Math.round((sumCR / sumIn) * 100) : 0,
      costUSD: sessList.filter(s => dayKey(s.end) === today).reduce((a, s) => a + (s.costUSD || 0), 0),
    },
    daysList, projects,
    sessions: sessList.slice(0, 40),
    prompts: allPrompts.slice(0, 300).map(p => ({ ...p, total: promptTotal(p), durMs: Math.max(0, p.end - p.start) })),
    live: live ? {
      id: live.id, title: live.title, project: live.project,
      series: calls.filter(c => c.session === live.id && !c.agent).map(c => ({ ts: c.ts, bag: c.bag, out: c.out })),
    } : null,
    usage: usageList.slice(0, 40), agentTokens,
    tips: buildTips(allPrompts, sessList, projects),
    improvements, warnings: [...warnings],
  };
}

module.exports = { stats, scan };
