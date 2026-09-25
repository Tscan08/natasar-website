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

/**
 * Minimal Markdown for race reports: paragraphs, "- " lists, "## " headings,
 * [links](url) and **bold**. Single line breaks inside a paragraph are kept.
 */
export function markdown(src) {
  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => extLink(url.replace(/&amp;/g, '&'), text.replace(/&amp;/g, '&').replace(/&#39;/g, "'")));
  return src.trim().split(/\n\s*\n/).map((block) => {
    const lines = block.trim().split('\n');
    if (lines.every((l) => l.startsWith('- '))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
    if (lines[0].startsWith('## ')) return `<h2>${inline(lines[0].slice(3))}</h2>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('\n');
}

/** Race reports in data/reports/*.md: "---" front matter (key: value lines) then Markdown. */
export function readReports() {
  const dir = path.join(ROOT, 'data/reports');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const [, head, body] = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const meta = Object.fromEntries(head.split('\n').map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.trim()]));
    return { slug: f.slice(0, -3), ...meta, html: markdown(body) };
  }).sort((a, b) => a.start.localeCompare(b.start));
}
