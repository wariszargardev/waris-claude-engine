// PreToolUse (Bash | PowerShell): never push, commit, merge or rewrite on shared base branches.
// Protected branches and repo owners come from protected-branches.json next to this file (edit it when names change).
// Deploy branches like fix/x-uat-deployment-<cu> stay allowed. Exit 2 = block (stderr goes to Claude).
const { execFileSync } = require('child_process');
const path = require('path');

const fs = require('fs');
const DEFAULTS = { repoOwners: ['InsuranceMarket-ae/'], branches: ['main', 'master', 'develop', 'test-env-deployment', 'uat-env-deployment', 'new-dev-env-deployment', 'dev-env-deployment'] };
let CONFIG = DEFAULTS;
try { CONFIG = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(path.join(fs.realpathSync(__dirname), 'protected-branches.json'), 'utf8')) }; } catch {}
const PROTECTED = new Set(CONFIG.branches);
const MSG = 'Protected branch — open a PR into it instead (/create-pr). Claude never pushes, commits, merges, resets or deletes on ' + [...PROTECTED].join(', ') + ', and never merges a PR. If a human really needs this, Waris runs it himself.';

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const cmd = (input.tool_input && input.tool_input.command) || '';
  if (!/\b(git|gh)\b/.test(cmd)) process.exit(0);
  const reason = check(cmd, input.cwd || process.cwd());
  if (reason) {
    process.stderr.write(`BLOCKED: ${reason}\n${MSG}\n`);
    process.exit(2);
  }
  process.exit(0);
});

function strip(b) { return String(b || '').replace(/^refs\/heads\//, '').replace(/^\+/, '').trim(); }
function isProt(b) { return PROTECTED.has(strip(b)); }

function currentBranch(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
  } catch { return ''; }
}

function isCompanyRepo(dir) {
  try {
    const url = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 });
    return /InsuranceMarket-ae\//i.test(url);
  } catch { return false; }
}

function tokenize(s) {
  const out = []; const re = /"([^"]*)"|'([^']*)'|(\S+)/g; let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function check(cmd, cwd) {
  let dir = cwd;
  const segments = cmd.split(/&&|\|\||;|\||\r?\n/);
  for (const seg of segments) {
    const t = tokenize(seg.trim());
    if (!t.length) continue;
    let i = 0;
    while (i < t.length && /^[A-Z_]+=/.test(t[i])) i++;
    const head = (t[i] || '').replace(/\.exe$/i, '').toLowerCase();

    if (head === 'cd' || head === 'set-location' || head === 'pushd') {
      const target = t.slice(i + 1).find(x => !x.startsWith('-'));
      if (target) dir = path.resolve(dir, target.replace(/^\/([a-z])\//i, '$1:/'));
      continue;
    }

    if (head === 'gh') {
      const rest = t.slice(i + 1);
      if (rest[0] === 'pr' && rest[1] === 'merge') return 'gh pr merge (merging PRs is for a human)';
      if (rest[0] === 'api' && rest.some(x => /\/pulls\/\d+\/merge\b/.test(x))) return 'merging a PR through gh api';
      if (rest[0] === 'api' && rest.some(x => /\/git\/refs\/heads\/(main|develop|[\w-]*env-deployment)\b/.test(x)) && rest.some(x => /^(PATCH|DELETE|POST|PUT)$/i.test(x))) return 'rewriting a protected branch ref through gh api';
      continue;
    }

    if (head !== 'git') continue;
    let j = i + 1; let gdir = dir;
    while (j < t.length && t[j].startsWith('-')) {
      if (t[j] === '-C') { gdir = path.resolve(dir, t[j + 1] || '.'); j += 2; }
      else if (t[j] === '-c') j += 2;
      else j++;
    }
    const sub = t[j]; const args = t.slice(j + 1);
    if (!sub) continue;
    if (!isCompanyRepo(gdir)) continue;

    if (sub === 'push') {
      const pos = args.filter(a => !a.startsWith('-'));
      const del = args.includes('--delete') || args.includes('-d');
      const refspecs = pos.slice(1);
      if (!refspecs.length) {
        const cur = currentBranch(gdir);
        if (isProt(cur)) return `git push while on ${cur}`;
        continue;
      }
      for (const r of refspecs) {
        let dst = r.includes(':') ? r.split(':').pop() : r;
        if (dst === 'HEAD' || dst === '@') dst = currentBranch(gdir);
        if (del || r.startsWith(':')) { if (isProt(dst)) return `deleting ${strip(dst)} on the remote`; continue; }
        if (isProt(dst)) return `git push to ${strip(dst)}`;
      }
      continue;
    }

    if (['commit', 'merge', 'cherry-pick', 'revert', 'rebase', 'am', 'reset'].includes(sub)) {
      if (args.some(a => a === '--abort' || a === '--quit')) continue;
      if (sub === 'reset' && !args.includes('--hard')) continue;
      const cur = currentBranch(gdir);
      if (isProt(cur)) return `git ${sub} while HEAD is on ${cur}`;
      continue;
    }

    if (sub === 'branch' && args.some(a => ['-D', '-d', '--delete', '-f', '--force', '-m', '-M'].includes(a))) {
      if (args.some(a => !a.startsWith('-') && isProt(a))) return `git branch ${args.join(' ')} on a protected branch`;
    }
  }
  return '';
}
