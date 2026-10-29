// SessionStart hook: on the first Claude session of the day, starts daily-repo-sync.ps1
// in the background (it waits 5 minutes, then fast-forwards main/develop). Returns at once.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const stateDir = path.join(os.homedir(), '.claude', 'daily-repo-sync');
const stampFile = path.join(stateDir, 'last-run.txt');
const lockFile = path.join(stateDir, 'pending.lock');
const today = new Date().toLocaleDateString('en-CA');

try {
  fs.mkdirSync(stateDir, { recursive: true });
  if (fs.existsSync(stampFile) && fs.readFileSync(stampFile, 'utf8').trim() === today) process.exit(0);
  if (fs.existsSync(lockFile) && Date.now() - fs.statSync(lockFile).mtimeMs < 15 * 60 * 1000) process.exit(0);
  fs.writeFileSync(lockFile, String(Date.now()));

  // Created through WMI so the worker is not killed with Claude's hook process tree.
  const worker = `powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${path.join(__dirname, 'daily-repo-sync.ps1')}"`;
  spawnSync('powershell.exe', [
    '-NoProfile', '-Command',
    `Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '${worker}' } | Out-Null`,
  ], { stdio: 'ignore', windowsHide: true, timeout: 20000 });
} catch (e) {
  // never block Claude from starting
}
process.exit(0);
