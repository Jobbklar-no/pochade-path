import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile as readTextFile } from 'node:fs/promises';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const config = JSON.parse(await readTextFile(resolve(fileURLToPath(new URL('../site.config.json', import.meta.url))), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, config.productionUrl).pathname);
    const safePath = normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
    let file = join(root, safePath);
    if (!file.startsWith(root)) throw new Error('Invalid path');
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch {}
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    const body = await readFile(join(root, '404.html'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(body);
  }
}).listen(port, () => console.log(`Preview server is listening on port ${port}.`));
