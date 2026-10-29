const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = Number(process.env.USAGE_DASHBOARD_PORT || 4317);
const open = process.argv.includes('--open');

function launchBrowser() {
  if (!open) return;
  spawn('cmd', ['/c', 'start', '', `http://localhost:${PORT}`], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/ping', timeout: 400 }, res => {
  res.resume();
  launchBrowser();
  process.exit(0);
});
req.on('timeout', () => req.destroy());
req.on('error', () => {
  const dataDir = path.join(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const log = fs.openSync(path.join(dataDir, 'server.log'), 'a');
  spawn(process.execPath, [path.join(__dirname, 'server.js')], { detached: true, stdio: ['ignore', log, log], windowsHide: true }).unref();
  setTimeout(() => { launchBrowser(); process.exit(0); }, open ? 1500 : 0);
});
