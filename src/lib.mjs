// Shared helpers for the static site build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

export const site = readJSON('data/site.json');
const imageMap = readJSON('data/images.json');

/** Escape text for safe insertion into HTML. */
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Resolve an image key to a URL. Uses a local copy in public/images/ if one
 * exists (after `npm run fetch-images`), otherwise the original Google URL.
 */
export function img(key) {
  if (!key) return '';
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
    if (fs.existsSync(path.join(ROOT, 'public/images', `${key}.${ext}`))) return `/images/${key}.${ext}`;
  }
  return imageMap[key] || '';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parse = (d) => { const [y, m, day] = d.split('-').map(Number); return { y, m: m - 1, day }; };

/** "Mar 28–29", "Jul 14–21", "Aug 30 – Sep 1", "Mar 1" */
export function dateRange(start, end) {
  const a = parse(start), b = parse(end || start);
  if (start === end || !end) return `${MONTHS[a.m]} ${a.day}`;
  if (a.m === b.m) return `${MONTHS[a.m]} ${a.day}–${b.day}`;
  return `${MONTHS[a.m]} ${a.day} – ${MONTHS[b.m]} ${b.day}`;
}
export const monthAbbr = (d) => MONTHS[parse(d).m];
export const dayNum = (d) => parse(d).day;

export const extLink = (url, label, cls = '') =>
  `<a href="${esc(url)}"${cls ? ` class="${cls}"` : ''}${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''}>${esc(label)}</a>`;
