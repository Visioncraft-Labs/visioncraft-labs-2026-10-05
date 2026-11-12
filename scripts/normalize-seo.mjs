import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const origin = 'https://visioncraft-labs.com';
const pages = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name === 'index.html') pages.push(path);
  }
}
walk(root);
const routes = new Set(pages.map(path => '/' + relative(root, path).replaceAll('\\', '/').replace(/index\.html$/, '')));
function normalize(value) {
  const absolute = value.startsWith(origin + '/') || value === origin;
  if (!absolute && !value.startsWith('/')) return value;
  const local = absolute ? value.slice(origin.length) || '/' : value;
  const match = local.match(/^([^?#]*)(.*)$/);
  const path = match[1];
  const slash = path.endsWith('/') ? path : path + '/';
  return routes.has(slash) ? (absolute ? origin : '') + slash + match[2] : value;
}
for (const path of pages) {
  const before = readFileSync(path, 'utf8');
  // Match quoted URL values in HTML attributes and JSON-LD, leaving assets and external URLs intact.
  const after = before.replace(/(["'])(https:\/\/visioncraft-labs\.com(?:\/[^"'<>\s]*)?|\/(?!\/)[^"'<>\s]*)\1/g,
    (_, quote, value) => quote + normalize(value) + quote);
  if (after !== before) writeFileSync(path, after);
}
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
for (const [, url] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
  if (normalize(url) !== url || !existsSync(join(root, url.slice(origin.length), 'index.html'))) {
    throw new Error('Sitemap URL must point directly to an existing canonical page: ' + url);
  }
}
console.log(`SEO URL normalization passed for ${pages.length} pages.`);
