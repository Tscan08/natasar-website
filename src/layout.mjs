import { site, esc, img } from './lib.mjs';

const icon = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 19c.8-3 3.2-4.6 6-4.6s5.2 1.6 6 4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16.5 13c2.2 0 3.8 1.3 4.5 3.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M8 3.5v4M16 3.5v4" stroke="currentColor" stroke-width="1.8"/></svg>',
};
export { icon };

/** The "stay in touch" strip that ended every page on the old site. */
export function communityStrip() {
  const c = site.community;
  return `
<section class="community" aria-labelledby="community-h">
  <div class="wrap">
    <h2 id="community-h">Stay in the loop</h2>
    <div class="community-grid">
      <a class="community-card" href="${c.googleGroup}" target="_blank" rel="noopener">
        ${icon.mail}<span><strong>NATA Tasar Sailors</strong><small>Google group mailing list</small></span>
      </a>
      <a class="community-card" href="${c.whatsappRequest}">
        ${icon.chat}<span><strong>NW Tasar Group</strong><small>Request a WhatsApp invitation</small></span>
      </a>
      <a class="community-card" href="${c.facebook}" target="_blank" rel="noopener">
        ${icon.people}<span><strong>North America Tasar Class</strong><small>Request to join on Facebook</small></span>
      </a>
      <a class="community-card" href="${c.calendarSubscribe}" target="_blank" rel="noopener">
        ${icon.cal}<span><strong>Fleet calendar</strong><small>Add to Google Calendar</small></span>
      </a>
    </div>
  </div>
</section>`;
}

export function layout({ path, title, description, body, ogImage }) {
  const pageTitle = title ? `${title} · North America Tasars` : 'North America Tasars';
  const desc = description || site.description;
  const logo = img('logo');
  const og = ogImage || img('home-fleet');
  const absolute = (u) => (u.startsWith('http') ? u : site.url + u);
  const navItems = site.nav
    .map((n) => `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.url}${path === '/' ? '/' : path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.url}${path}">
${og ? `<meta property="og:image" content="${esc(absolute(og))}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/">
      ${logo ? `<img src="${esc(logo)}" alt="" width="44" height="44">` : ''}
      <span><strong>North America Tasars</strong><small>North America Tasar Association</small></span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr">Menu</span><span class="bars" aria-hidden="true"></span></button>
    <nav id="site-nav" aria-label="Main"><ul>${navItems}</ul></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <strong>North America Tasar Association</strong>
      <p>Double-handed dinghy racing in the Pacific Northwest since the 1980s.</p>
    </div>
    <ul class="footer-links">
      ${site.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
      <li><a href="https://www.tasar.org/" target="_blank" rel="noopener">Tasar.org (international)</a></li>
    </ul>
  </div>
</footer>
<script src="/js/site.js" defer></script>
</body>
</html>`;
}
