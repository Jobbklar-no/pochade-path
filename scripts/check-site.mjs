import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const errors = [];
let htmlCount = 0;
const sitemapText = await readFile(join(root, 'sitemap.xml'), 'utf8');
const siteUrlMatch = sitemapText.match(/<loc>(https?:\/\/[^<]+?)<\/loc>/i);
const deployedBasePath = siteUrlMatch ? new URL(siteUrlMatch[1]).pathname.replace(/\/$/, '') : '';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(full) : [full]));
  }
  return files;
}

function resolveInternal(file, rawUrl) {
  const clean = rawUrl.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean.startsWith('/')) {
    const withoutBase = deployedBasePath && clean.startsWith(`${deployedBasePath}/`)
      ? clean.slice(deployedBasePath.length)
      : clean;
    return join(root, withoutBase.replace(/^\/+/, ''));
  }
  return resolve(dirname(file), clean);
}

for (const file of await walk(root)) {
  if (!['.html', '.xml', '.txt', '.css', '.js'].includes(extname(file))) continue;
  const content = await readFile(file, 'utf8');
  if (content.includes('{{SITE_URL}}') || content.includes('{{BASE_PATH}}')) errors.push(`${file}: unresolved build token`);
  if (extname(file) !== '.html') continue;
  htmlCount += 1;
  if (!/<html\s+lang="en"/i.test(content)) errors.push(`${file}: missing html lang`);
  if (!/<meta\s+name="viewport"/i.test(content)) errors.push(`${file}: missing viewport`);
  if (!/<title>[^<]+<\/title>/i.test(content)) errors.push(`${file}: missing title`);
  if (!/404\.html$/.test(file) && !/<link\s+rel="canonical"/i.test(content)) errors.push(`${file}: missing canonical`);
  if (!/<h1[\s>]/i.test(content)) errors.push(`${file}: missing h1`);

  const attributePattern = /(?:href|src)="([^"]+)"/gi;
  for (const match of content.matchAll(attributePattern)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)) continue;
    const target = resolveInternal(file, url);
    if (!target) continue;
    const candidates = extname(target) ? [target] : [target, join(target, 'index.html')];
    let exists = false;
    for (const candidate of candidates) {
      try { await access(candidate); exists = true; break; } catch {}
    }
    if (!exists) errors.push(`${file}: broken local reference ${url}`);
  }
}

const home = await readFile(join(root, 'index.html'), 'utf8');
if (!home.includes('As an Amazon Associate I earn from qualifying purchases.')) errors.push('Homepage lacks the required Amazon Associate statement.');
if (/<script[^>]+(?:analytics|gtag|facebook|hotjar)/i.test(home)) errors.push('Unexpected tracking script found.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlCount} HTML pages: links, assets, metadata, tokens, and disclosure passed.`);
