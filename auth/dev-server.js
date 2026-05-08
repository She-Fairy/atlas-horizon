// auth/dev-server.js
// Simple static file server with logging for /auth/callback requests.
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const reqPath = parsed.pathname;
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url} - Host: ${req.headers.host}`);

  // Log callback specifics
  if (reqPath === '/auth/callback') {
    console.log('--- /auth/callback requested ---');
    console.log('Query:', parsed.query);
    console.log('Headers:', req.headers);
  }

  // Serve files from project root
  let fsPath = path.join(ROOT, decodeURIComponent(reqPath));
  // If path is a directory, serve index.html with or without a trailing slash.
  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()) {
    fsPath = path.join(fsPath, 'index.html');
  } else if (reqPath.endsWith('/')) {
    fsPath = path.join(fsPath, 'index.html');
  }
  // If file doesn't exist, try appending .html
  if (!fs.existsSync(fsPath)) {
    if (fs.existsSync(fsPath + '.html')) fsPath = fsPath + '.html';
  }

  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) {
    sendFile(res, fsPath);
    return;
  }

  // Fallback to serving root index.html for SPA routes
  const indexPath = path.join(ROOT, 'index.html');
  if (fs.existsSync(indexPath)) {
    sendFile(res, indexPath);
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Dev server serving ${ROOT} at http://localhost:${PORT}`);
  console.log('Logs will show /auth/callback requests and query parameters.');
});
