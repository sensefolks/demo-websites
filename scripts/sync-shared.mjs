import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
for (const site of ['orbitdesk', 'moss-and-mug', 'fieldnotes']) {
  for (const file of ['demo.js', 'demo.css', 'survey-catalog.js', 'survey-examples.js', 'survey-examples.css']) {
    const source = await readFile(path.join(root, 'shared', file));
    const target = path.join(root, site, 'assets', file);
    if (check) {
      const actual = await readFile(target).catch(() => Buffer.from(''));
      if (!actual.equals(source)) throw new Error(`${site}/assets/${file} is stale. Run npm run sync.`);
    } else {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, source);
    }
  }
}
console.log(check ? 'Shared browser assets match.' : 'Shared browser assets copied to all three sites.');
