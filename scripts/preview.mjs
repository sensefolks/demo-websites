// Local development only: serves the same files Netlify publishes, with its headers.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sites = ['orbitdesk', 'moss-and-mug', 'fieldnotes'];
const requested = process.argv[2];
if (requested && !sites.includes(requested)) throw new Error(`Choose ${sites.join(', ')}.`);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const servers = [];
for (const site of requested ? [requested] : sites) {
  const directory = path.join(root, site);
  const port = Number(process.argv[3] || (4171 + sites.indexOf(site)));
  const headerFile = await readFile(path.join(directory, '_headers'), 'utf8').catch(() => '');
  const headers = Object.fromEntries(headerFile.split('\n').filter((line) => /^\s+[^:]+:/.test(line)).map((line) => {
    const colon = line.indexOf(':');
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }));
  const server = http.createServer(async (request, response) => {
    for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      let file = path.resolve(directory, `.${pathname}`);
      if (!file.startsWith(directory + path.sep) && file !== directory) throw new Error('Outside site');
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
          return;
        }
        file = path.join(file, 'index.html');
      }
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      const page = await readFile(path.join(directory, '404.html')).catch(() => 'Page not found');
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : page);
    }
  });
  server.listen(port, '127.0.0.1', () => console.log(`${site}: http://127.0.0.1:${port}`));
  servers.push(server);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { servers.forEach((server) => server.close()); });
