// Tiny local preview server for dist/ (mimics Vercel's cleanUrls). No dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json' };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/home') { res.writeHead(301, { Location: '/' }); return res.end(); }
  const candidates = url === '/' ? ['index.html'] : [url.slice(1), url.slice(1) + '.html'];
  for (const c of candidates) {
    const file = path.join(DIST, c);
    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
  }
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  fs.createReadStream(path.join(DIST, '404.html')).pipe(res);
}).listen(PORT, () => console.log(`Preview at http://localhost:${PORT}`));
