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
| Race reports / regatta write-ups         | `data/reports/*.md`             |

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

## "Who's going" sign-ups

Each event on the current schedule page has a **Who's going** list where people add
their name (plus an optional note like "need crew") as *going* or *maybe*. Sign-ups
close the day after an event ends, and past events show a "Who went" list.

- Sign-ups are stored by the serverless function `api/rsvp.js` in an **Upstash Redis**
  database. One-time setup: Vercel → Project → **Storage** → *Create Database* →
  **Upstash** (Redis, free plan) → connect it to this project → redeploy. Until that's
  done the lists just don't appear.
- People can remove their own sign-up from the same browser. To remove anything else
  (spam, duplicates), open the database in Upstash's **Data Browser**: each event is a
  hash named `rsvp:<event id>` — delete the entry there.
- An event's id is `<year>-<title as a slug>` (e.g. `2026-turkey-bowl`). **Renaming an
  event starts a fresh list**, so if you rename one that already has sign-ups, add
  `"id": "<old id>"` to it in the JSON to keep them.
- Locally, `npm run dev` runs the same function with an in-memory store.
- Upstash's free plan deletes databases that go unused, so a daily **Vercel Cron**
  job (`crons` in `vercel.json`) calls `api/keepalive.js`, which writes one small
  record. Check it in Vercel → Project → Settings → Cron Jobs. Optionally set a
  `CRON_SECRET` env var so only Vercel can trigger it.

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

## Committee suggestions → Claude drafts → you review

Exec committee members send ideas at **natasar.org/suggest** (not in the menu;
protected by a shared passcode). Each one becomes a GitHub issue labelled
`suggestion` + `claude`, then:

1. The **Claude** workflow (`.github/workflows/claude.yml`) makes the change on a new
   `claude/issue-N-…` branch, following `CLAUDE.md`. It never touches `main`.
2. Vercel builds a preview of that branch, and the **Preview link** workflow posts
   the URL on the issue (GitHub emails you).
3. You review the preview, then either click **Open a pull request** in that comment
   and merge it to publish, or reply on the issue with `@claude …` to ask for changes.
   Close the issue to reject it.

Committee members with GitHub accounts can also open an issue with the *Website
suggestion* template; add the `claude` label yourself to start a draft.

### One-time setup

1. **Claude GitHub app + key:** install the Claude GitHub app on this repo at
   <https://github.com/apps/claude>, then add one repository secret (GitHub → repo →
   Settings → Secrets and variables → Actions): either `ANTHROPIC_API_KEY` (from
   console.anthropic.com, pay per use) or `CLAUDE_CODE_OAUTH_TOKEN` (run
   `claude setup-token` in a terminal to use your Claude subscription).
   Running `/install-github-app` inside the `claude` terminal app does both steps for you.
2. **GitHub token for the form:** create a fine-grained token at
   <https://github.com/settings/personal-access-tokens/new> — repository access *only
   this repo*, permission **Issues: Read and write**.
3. **Vercel env vars** (Project → Settings → Environment Variables), then redeploy:
   `GITHUB_SUGGEST_TOKEN` = that token, `SUGGEST_PASSCODE` = a passcode to share with the
   committee. Optional: `SUGGESTIONS_AUTOBUILD=false` to have suggestions wait for you to
   add the `claude` label instead of drafting automatically.
4. **Protect main (recommended):** GitHub → Settings → Branches → add a rule for `main`
   requiring a pull request, so nothing reaches the live site without your merge.

Vercel previews may require a Vercel login to view (Project → Settings → Deployment
Protection). That's fine for you; turn it off for previews if committee members
should see them too.

## Race reports

Each regatta write-up is a Markdown file in `data/reports/`, and the file name is
its web address (`data/reports/pssr-report.md` → `/pssr-report`, same URLs as the
old site). To add one, copy an existing file and edit it on github.com:

```markdown
---
title: Summertide 2026
event: Summertide at Hood Canal
dates: September 19–20, 2026
author: Your Name
start: 2026-09-19
---

First paragraph. Blank lines separate paragraphs. [Link text](https://…), **bold**.

- Lines starting with "- " make a list (handy for results)
```

`start` is used for ordering and for the "Back to the <year> schedule" link. To show a
**Race report** button on the event, add `{ "label": "Race report", "url": "/summertide-2026" }`
to that event's `links`.
