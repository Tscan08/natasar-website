// Downloads every photo listed in data/images.json from Google Sites into
// public/images/<key>.<ext>. Run once (before the old Google Site is retired):
//   npm run fetch-images
// then commit public/images/. The build uses local copies automatically.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/images.json'), 'utf8'));
const OUT = path.join(ROOT, 'public/images');
fs.mkdirSync(OUT, { recursive: true });

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
let ok = 0, failed = 0;

for (const [key, url] of Object.entries(images)) {
  if (key.startsWith('_') || !url) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get('content-type') || '').split(';')[0];
    const ext = EXT[type] || 'jpg';
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT, `${key}.${ext}`), buf);
    console.log(`  ✓ ${key}.${ext} (${Math.round(buf.length / 1024)} KB)`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${key}: ${e.message}`);
    failed++;
  }
}
console.log(`\nDownloaded ${ok} image(s)${failed ? `, ${failed} failed` : ''}. Now run: npm run build`);
