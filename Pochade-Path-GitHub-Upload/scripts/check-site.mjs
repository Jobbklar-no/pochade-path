import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(projectRoot, 'dist');
const config = JSON.parse(await readFile(join(projectRoot, 'site.config.json'), 'utf8'));
const productionUrl = new URL(config.productionUrl).href;
const productionOrigin = new URL(productionUrl).origin;
const socialImageUrl = new URL(config.socialImagePath, productionUrl).href;
const errors = [];
let htmlCount = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(full) : [full]));
  }
  return files;
}

function routeForFile(file) {
  const webPath = relative(root, file).split(sep).join('/');
  if (webPath === 'index.html') return '/';
  if (webPath === '404.html') return null;
  return `/${webPath.replace(/index\.html$/, '')}`;
}

function metaValue(content, attribute, key) {
  const match = content.match(new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="([^"]+)"`, 'i'));
  return match?.[1];
}

async function referenceExists(rawUrl) {
  const clean = rawUrl.split('#')[0].split('?')[0];
  if (!clean) return true;
  const target = join(root, clean.replace(/^\/+/, ''));
  const candidates = extname(target) ? [target] : [target, join(target, 'index.html')];
  for (const candidate of candidates) {
    try { await access(candidate); return true; } catch {}
  }
  return false;
}

for (const file of await walk(root)) {
  if (!['.html', '.xml', '.txt', '.css', '.js'].includes(extname(file))) continue;
  const content = await readFile(file, 'utf8');
  if (/\{\{[A-Z0-9_]+\}\}/.test(content)) errors.push(`${file}: unresolved template marker`);
  if (extname(file) !== '.html') continue;

  htmlCount += 1;
  const route = routeForFile(file);
  if (!/<html\s+lang="en"/i.test(content)) errors.push(`${file}: missing html lang`);
  if (!/<meta\s+name="viewport"/i.test(content)) errors.push(`${file}: missing viewport`);
  if (!/<title>[^<]+<\/title>/i.test(content)) errors.push(`${file}: missing title`);
  if (!/<h1[\s>]/i.test(content)) errors.push(`${file}: missing h1`);

  if (route) {
    const expectedCanonical = new URL(route.replace(/^\//, ''), productionUrl).href;
    const canonical = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const ogUrl = metaValue(content, 'property', 'og:url');
    const ogImage = metaValue(content, 'property', 'og:image');
    const twitterImage = metaValue(content, 'name', 'twitter:image');
    if (canonical !== expectedCanonical) errors.push(`${file}: canonical must be ${expectedCanonical}`);
    if (ogUrl !== canonical) errors.push(`${file}: og:url does not match canonical`);
    if (ogImage !== socialImageUrl) errors.push(`${file}: og:image must be the configured absolute HTTPS image`);
    if (twitterImage !== socialImageUrl) errors.push(`${file}: twitter:image must be the configured absolute HTTPS image`);
  } else {
    if (!/<meta\s+name="robots"\s+content="noindex"/i.test(content)) errors.push(`${file}: 404 must be noindex`);
    if (/<link\s+rel="canonical"/i.test(content)) errors.push(`${file}: 404 must not have a canonical`);
  }

  for (const match of content.matchAll(/(?:href|src)="([^"]+)"/gi)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)) continue;
    if (!url.startsWith('/')) errors.push(`${file}: internal reference is not root-relative: ${url}`);
    if (!(await referenceExists(url))) errors.push(`${file}: broken local reference ${url}`);
    const clean = url.split('#')[0].split('?')[0];
    if (clean && !extname(clean) && clean !== '/' && !clean.endsWith('/')) errors.push(`${file}: page URL lacks trailing slash: ${url}`);
  }
}

if (new URL(productionUrl).protocol !== 'https:') errors.push('Production URL must use HTTPS.');
if (!productionUrl.endsWith('/')) errors.push('Production URL must end with a slash.');

const expectedLocs = config.publicRoutes.map((route) => new URL(route.replace(/^\//, ''), productionUrl).href);
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const actualLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (JSON.stringify(actualLocs) !== JSON.stringify(expectedLocs)) errors.push('Sitemap routes differ from configured public routes.');
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${new URL('sitemap.xml', productionUrl).href}`)) errors.push('robots.txt has the wrong sitemap URL.');

const home = await readFile(join(root, 'index.html'), 'utf8');
if (!home.includes('As an Amazon Associate I earn from qualifying purchases.')) errors.push('Homepage lacks the required Amazon Associate statement.');
if (!home.includes(`"url": "${productionUrl}"`)) errors.push('Homepage structured data has the wrong site URL.');
if (/<script[^>]+(?:analytics|gtag|facebook|hotjar)/i.test(home)) errors.push('Unexpected tracking script found.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlCount} HTML pages and ${actualLocs.length} sitemap URLs for production URL consistency.`);
