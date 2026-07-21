import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'site');
const outputDir = join(projectRoot, 'dist');
const siteUrl = (process.env.SITE_URL || 'http://localhost:4173').replace(/\/+$/, '');
const parsedUrl = new URL(siteUrl);
const basePath = `${parsedUrl.pathname.replace(/\/+$/, '')}/`.replace(/^\/\//, '/');

if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
  throw new Error('SITE_URL must use http or https.');
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(fullPath) : [fullPath]));
  }
  return files;
}

const replaceable = new Set(['.html', '.xml', '.txt']);
for (const file of await walk(outputDir)) {
  if (!replaceable.has(extname(file))) continue;
  const original = await readFile(file, 'utf8');
  const rendered = original
    .replaceAll('{{SITE_URL}}', siteUrl)
    .replaceAll('{{BASE_PATH}}', basePath);
  await writeFile(file, rendered, 'utf8');
}

console.log(`Built ${relative(projectRoot, outputDir)} for ${siteUrl}`);
