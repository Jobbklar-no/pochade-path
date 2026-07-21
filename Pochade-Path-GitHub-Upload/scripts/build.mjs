import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncSiteUrl } from './sync-site-url.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'site');
const outputDir = join(projectRoot, 'dist');
const { productionUrl } = await syncSiteUrl();

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

console.log(`Built ${relative(projectRoot, outputDir)} for ${productionUrl}`);
