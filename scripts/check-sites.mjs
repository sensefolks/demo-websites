import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import '../shared/survey-placements.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const routes = {
  orbitdesk: ['', 'pricing', 'workspace', 'help', 'account', 'survey-examples'],
  'moss-and-mug': ['', 'products/starter-kit', 'cart', 'checkout', 'order', 'survey-examples'],
  fieldnotes: ['', 'articles/weekend-guide', 'search', 'membership', 'newsletter', 'survey-examples'],
};
const requiredTypes = ['PricePoint', 'UserChoice', 'FeaturePriority', 'FastPoll', 'Reaction', 'OpenFeedback'];
let pages = 0;
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
function assert(condition, message) { if (!condition) throw new Error(message); }

for (const [site, expectedRoutes] of Object.entries(routes)) {
  const directory = path.join(root, site);
  for (const type of requiredTypes) {
    const placement = globalThis.SurveyPlacements[site][type];
    assert(placement?.path && placement.anchor && placement.key, `${site}: missing ${type} placement`);
    const page = await readFile(path.join(directory, placement.path, 'index.html'), 'utf8');
    assert(page.includes(`id="${placement.anchor}"`), `${site}: missing native invitation ${placement.anchor}`);
    assert(page.includes(`data-survey="${type}"`) && page.includes(`data-survey-key="${placement.key}"`), `${site}: missing native ${type} embed mount`);
    assert(!placement.path.includes('survey-examples'), `${site}: surveys must belong to business pages`);
  }
  for (const route of expectedRoutes) await stat(path.join(directory, route, 'index.html'));
  const config = await readFile(path.join(directory, 'netlify.toml'), 'utf8');
  assert(config.includes(`base = "${site}"`) && config.includes('publish = "."'), `${site}: unexpected publish configuration`);
  const headers = await readFile(path.join(directory, '_headers'), 'utf8');
  assert(headers.includes("connect-src 'none'") && headers.includes("script-src 'self'"), `${site}: unexpected network/script policy`);
  for (const file of await walk(directory)) {
    const ext = path.extname(file);
    if (!['.html', '.css', '.js', '.svg', '.toml', '.txt'].includes(ext)) continue;
    const content = await readFile(file, 'utf8');
    assert(!/-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:postgres(?:ql)?|mongodb(?:\+srv)?):\/\/|\b(?:ghp_|github_pat_|sk_live_)[A-Za-z0-9_]+|\/Users\//.test(content), `${file}: private operational material is not allowed`);
    if (ext === '.js') {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      assert(result.status === 0, `${file}: ${result.stderr}`);
    }
    if (ext !== '.html') continue;
    pages++;
    assert(/<html[^>]+lang="en"/.test(content), `${file}: missing document language`);
    assert(/name="viewport"/.test(content), `${file}: missing responsive viewport`);
    assert(/<title>[^<]+<\/title>/.test(content), `${file}: missing title`);
    assert(/fonts\.googleapis\.com/.test(content), `${file}: missing Google Fonts`);
    assert(!/\son\w+\s*=|javascript:|<script\b(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(content), `${file}: inline scripts are not allowed`);
    assert(!/data-netlify|netlify-honeypot|type="password"|type="email"/i.test(content), `${file}: demo must not collect account or contact details`);
    if (file.endsWith('/survey-examples/index.html')) {
      assert(content.includes('/assets/survey-placements.js') && !content.includes('example-controls'), `${site}: legacy URL must forward to its natural journey`);
    } else {
      assert(!/survey-examples[./]|example=1|Try this scenario|Try this combination|example-discovery/.test(content), `${file}: public pages must not expose the retired explorer`);
    }
    const keys = [...content.matchAll(/data-survey-key="([^"]+)"/g)].map((match) => match[1]);
    assert(new Set(keys).size === keys.length, `${file}: duplicate survey keys`);
    for (const match of content.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1].replaceAll('&amp;', '&');
      if (/^(https?:|data:|mailto:|tel:)/.test(reference)) continue;
      const [pathname] = reference.split(/[?#]/);
      if (!pathname) {
        if (reference.startsWith('#')) assert(content.includes(`id="${reference.slice(1)}"`), `${file}: unresolved anchor ${reference}`);
        continue;
      }
      const target = pathname.startsWith('/') ? path.join(directory, pathname) : path.resolve(path.dirname(file), pathname);
      assert(target.startsWith(directory + path.sep), `${file}: link escapes independent site: ${reference}`);
      const info = await stat(target).catch(() => null);
      assert(info, `${file}: broken local link ${reference}`);
      if (info.isDirectory()) await stat(path.join(target, 'index.html'));
    }
  }
}
console.log(`${pages} HTML pages checked: routes, links, JavaScript syntax, deployment boundaries, survey coverage, and public-source checks.`);
