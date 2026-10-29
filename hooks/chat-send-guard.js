// PreToolUse (Google Chat write tools): scheduled runs never send, mark read or change settings in Google Chat.
// A scheduled run's first user message starts with <scheduled-task …>; normal sessions are allowed (their permission prompts still apply).
// Can't read the transcript → block (fail closed). Exit 2 = block (stderr goes to Claude).
const fs = require('fs');

const MSG = 'Scheduled runs never send in Google Chat — drafts only. Say "send N" in a Claude session to send a draft.';

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { block('could not parse the hook input'); }
  const first = firstUserMessage(input.transcript_path);
  if (first === null) block('could not read this session\'s transcript');
  if (/^\s*<scheduled-task\b/.test(first)) block(`${input.tool_name || 'Chat write tool'} in a scheduled run`);
  process.exit(0);
});

function block(reason) {
  process.stderr.write(`BLOCKED: ${reason}\n${MSG}\n`);
  process.exit(2);
}

function firstUserMessage(file) {
  if (!file) return null;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    if (entry.type !== 'user' || !entry.message) continue;
    const c = entry.message.content;
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) {
      const t = c.find(p => p && p.type === 'text');
      if (t) return t.text || '';
    }
  }
  return null;
}
