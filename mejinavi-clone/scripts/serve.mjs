import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.mp4':'video/mp4'};
http.createServer((req,res) => {
  let request;
  try { request = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (request.endsWith('/') ? request+'index.html' : request));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {res.writeHead(404).end('Not found'); return;}
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':stat.size});
    fs.createReadStream(file).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
