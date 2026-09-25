# natasar.org — North America Tasar Association website

A fast, dependency-free static site that replaces the Google Sites version of
[natasar.org](https://www.natasar.org). It's hosted on **Vercel** and the source
lives on **GitHub**: anyone with access to the repo can edit a file, commit, and
the live site updates automatically about 30 seconds later.

## What's where

| To change…                               | Edit this file                  |
|------------------------------------------|---------------------------------|
| Events on the 2026 schedule              | `data/schedule-2026.json`       |
| Leaders, emails, Google group / Facebook links, nav | `data/site.json`     |
| Page text (home, boats & tuning, find a boat, contact) | `src/pages.mjs`    |
| Colors, fonts, layout                    | `public/css/site.css`           |
| Photos                                   | `data/images.json` + `public/images/` |
| Past seasons (2024, 2025)                | `data/schedule-archive.json`    |

### Adding or editing an event

Each event in `data/schedule-2026.json` looks like this:

```json
{
  "start": "2026-09-26", "end": "2026-09-27",
  "title": "Puget Sound Sailing Championship (PSSC)",
  "location": "CYC Seattle, Shilshole Bay Marina",
  "description": "PSSC Small Boats regatta hosted at CYC Seattle…",
  "links": [{ "label": "Register", "url": "https://…" }],
  "image": "ev-pssc",
  "tag": "Championship"
}
```

`links`, `image` and `tag` are optional. Events are sorted by date automatically,
and visitors' browsers mark past events as **Completed** and highlight the
**Next up** event, so the page never goes stale between edits.

You can edit JSON right on github.com (open the file → pencil icon → *Commit
changes*). Vercel rebuilds on every commit to `main`.

### Starting a new season

1. Move the finished season's events into `data/schedule-archive.json` under a new `"2026"` key.
2. Rename `data/schedule-2026.json` → `schedule-2027.json` (and update the import in `src/pages.mjs`), fill in the new events.
3. In `data/site.json`, set `"currentYear": 2027` and update the nav label/link.
4. In `vercel.json`, point the `/schedule` redirect at `/2027-schedule`.

## Photos

All photos live in `public/images/` (copied from the old Google Site in Sept 2026).
The Google URLs in `data/images.json` are signed links that expire, so they're only a
fallback and `npm run fetch-images` will usually fail — the build prefers the local copy.
To add a new photo, drop `my-photo.jpg` into `public/images/` and reference it as
`"image": "my-photo"` in the JSON.

## Running it locally

Needs [Node.js](https://nodejs.org) 18 or newer. No `npm install` required.

```bash
npm run dev      # builds, then serves at http://localhost:3000
npm run build    # just builds into dist/
```

## One-time setup: GitHub + Vercel

1. **GitHub:** create a new repository (e.g. `natasar-website`) and push this folder:
   ```bash
   git init && git add -A && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<you>/natasar-website.git
   git push -u origin main
   ```
2. **Vercel:** at [vercel.com/new](https://vercel.com/new), import the GitHub repo.
   Settings are read from `vercel.json` (build command `node build.mjs`,
   output `dist`) — just click **Deploy**. You'll get a `*.vercel.app` preview URL.
3. **Domain:** in Vercel → Project → Settings → Domains, add `natasar.org` and
   `www.natasar.org`. Vercel shows the DNS records to set at your domain registrar
   (typically an `A` record for the apex and a `CNAME` for `www` pointing at Vercel).
   Once DNS switches over, Google Sites stops serving the domain — remove the
   custom URL from the Google Site settings too.

Old URLs keep working: `/home` redirects to `/`, and `/2026-schedule`,
`/boats-tuning`, `/find-a-boat`, `/contact-us`, `/2025-schedule` and
`/2024-schedule` are unchanged.

## Not yet migrated

The old site has regatta write-up pages that were linked from the 2024/2025
schedules (e.g. `/pssr-report`, `/lake-crescent-report`, `/west-sound-report`,
`/skamania-coves-report`, `/jericho-north-americans`, `/summertide-2024`,
`/turkey-bowl-2025`). They'll stop working when the domain moves unless they're
ported — add them as pages in `src/pages.mjs`.
