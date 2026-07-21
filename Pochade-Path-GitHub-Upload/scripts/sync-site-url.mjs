import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'site');
const configPath = join(projectRoot, 'site.config.json');

function normalizeProductionUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== 'https:') throw new Error('productionUrl must use HTTPS.');
  if (parsed.search || parsed.hash) throw new Error('productionUrl cannot contain a query or fragment.');
  parsed.pathname = `${parsed.pathname.replace(/\/+$/, '')}/`;
  return parsed.href;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(fullPath) : [fullPath]));
  }
  return files;
}

function routeForFile(file) {
  const webPath = relative(sourceDir, file).split(sep).join('/');
  if (webPath === 'index.html') return '/';
  if (webPath === '404.html') return null;
  return `/${webPath.replace(/index\.html$/, '')}`;
}

function replaceMeta(content, attribute, key, value) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${value}">`;
  if (pattern.test(content)) return content.replace(pattern, tag);
  return content.replace('</head>', `  ${tag}\n</head>`);
}

function rootRelativeReferences(content, pageUrl, productionOrigin) {
  return content.replace(/\b(href|src)="(\.\.?\/[^"#?]*[^" ]*|\.\.?\/)"/gi, (full, attribute, rawValue) => {
    const resolved = new URL(rawValue, pageUrl);
    if (resolved.origin !== productionOrigin) return full;
    return `${attribute}="${resolved.pathname}${resolved.search}${resolved.hash}"`;
  });
}

export async function syncSiteUrl() {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const productionUrl = normalizeProductionUrl(config.productionUrl);
  const origin = new URL(productionUrl).origin;
  const socialImageUrl = new URL(config.socialImagePath, productionUrl).href;

  for (const file of await walk(sourceDir)) {
    if (!file.endsWith('.html')) continue;
    const route = routeForFile(file);
    let content = await readFile(file, 'utf8');

    if (route) {
      const canonicalUrl = new URL(route.replace(/^\//, ''), productionUrl).href;
      content = content.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}">`);
      content = replaceMeta(content, 'property', 'og:url', canonicalUrl);
      content = replaceMeta(content, 'property', 'og:image', socialImageUrl);
      content = replaceMeta(content, 'name', 'twitter:image', socialImageUrl);

      if (route === '/' && /<script\s+type="application\/ld\+json">/i.test(content)) {
        content = content
          .replace(/"url"\s*:\s*"[^"]*"/g, `"url": "${productionUrl}"`)
          .replace(/"logo"\s*:\s*"[^"]*"/g, `"logo": "${new URL('/assets/img/logo.svg', productionUrl).href}"`);
      }

      content = rootRelativeReferences(content, canonicalUrl, origin);
    } else {
      content = rootRelativeReferences(content, productionUrl, origin);
    }

    if (/\{\{[A-Z0-9_]+\}\}/.test(content)) {
      throw new Error(`Unresolved template marker in ${relative(projectRoot, file)}`);
    }
    await writeFile(file, content, 'utf8');
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...config.publicRoutes.map((route) => `  <url><loc>${new URL(route.replace(/^\//, ''), productionUrl).href}</loc><lastmod>${config.lastModified}</lastmod></url>`),
    '</urlset>',
    ''
  ].join('\n');
  await writeFile(join(sourceDir, 'sitemap.xml'), sitemap, 'utf8');

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap.xml', productionUrl).href}`,
    ''
  ].join('\n');
  await writeFile(join(sourceDir, 'robots.txt'), robots, 'utf8');

  return { productionUrl, publicRoutes: config.publicRoutes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await syncSiteUrl();
  console.log(`Synchronized public URLs for ${result.productionUrl}`);
}
