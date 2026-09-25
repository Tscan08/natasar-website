#!/usr/bin/env node
// Builds the static site into dist/. No dependencies — just Node 18+.
//   node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './src/lib.mjs';
import { layout } from './src/layout.mjs';
import * as pages from './src/pages.mjs';

const OUT = path.join(ROOT, 'dist');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), OUT, { recursive: true });

const all = [
  pages.home(),
  pages.schedulePage(),
  ...pages.archivePages(),
  pages.boatsTuning(),
  pages.findABoat(),
  pages.contact(),
  pages.notFound(),
];

for (const page of all) {
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`;
  fs.writeFileSync(path.join(OUT, file), layout(page));
  console.log('  ✓', page.path.padEnd(18), '→ dist/' + file);
}
console.log(`Built ${all.length} pages.`);
