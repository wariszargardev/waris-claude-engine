const http = require('http');
const fs = require('fs');
const path = require('path');
const { stats } = require('./lib');

const PORT = Number(process.env.USAGE_DASHBOARD_PORT || 4317);

if (process.argv.includes('--report')) {
  const days = Number(process.argv[process.argv.indexOf('--report') + 1]) || 7;
  const s = stats(days);
  s.prompts = s.prompts.slice(0, 25).map(p => ({ start: p.start, project: p.project, text: p.text.slice(0, 120), total: p.total, calls: p.calls, bagMax: p.bagMax, durMs: p.durMs, tools: p.tools, bigOutputs: p.bigOutputs, agents: p.agents }));
  s.live = undefined;
  process.stdout.write(JSON.stringify(s, null, 1));
  process.exit(0);
}

const page = path.join(__dirname, 'public', 'index.html');

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/ping') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('usage-dashboard');
    }
    if (url.pathname === '/api/stats') {
      const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 14, 1), 60);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(stats(days)));
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(page));
    }
    res.writeHead(404);
    res.end('not found');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e && e.stack || e));
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`usage dashboard on http://localhost:${PORT}`);
});
