// Website suggestions from the exec committee (form at /suggest). Vercel serverless function.
//   POST /api/suggest  { name, passcode, page, suggestion }  → { number }
// Each suggestion becomes a GitHub issue labelled "suggestion". Unless
// SUGGESTIONS_AUTOBUILD is "false", it is also labelled "claude", which starts the
// Claude workflow (.github/workflows/claude.yml): Claude makes the change on a new
// claude/… branch, Vercel builds a preview, and the preview link is posted on the issue.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   SUGGEST_PASSCODE      shared passcode for the committee
//   GITHUB_SUGGEST_TOKEN  fine-grained GitHub token for this repo with Issues: read & write
//   GITHUB_REPO           optional "owner/name"; defaults to the repo Vercel deploys from
import crypto from 'node:crypto';
import { store } from './_store.js';

const SUBMITS_PER_HOUR = 10; // per IP address

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
const oneLine = (s) => s.replace(/\s+/g, ' ');
const clientIp = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

/** Constant-time passcode comparison. */
function passcodeOk(given) {
  const want = process.env.SUGGEST_PASSCODE;
  if (!want) return false;
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(given), h(want));
}

async function github(path, body) {
  const repo = process.env.GITHUB_REPO || `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`;
  const res = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repo}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_SUGGEST_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'natasar-website-suggestions',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub ${path} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.SUGGEST_PASSCODE || !process.env.GITHUB_SUGGEST_TOKEN) {
    return res.status(503).json({ error: 'Suggestions aren’t set up yet.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (store && (await store.hit('rl-suggest:' + clientIp(req), 3600)) > SUBMITS_PER_HOUR) {
      return res.status(429).json({ error: 'Too many suggestions — please try again later.' });
    }
    if (body.website) return res.status(400).json({ error: 'Suggestion rejected.' }); // bot honeypot
    if (!passcodeOk(body.passcode)) return res.status(403).json({ error: 'That passcode isn’t right.' });

    const name = oneLine(clean(body.name, 80));
    const page = oneLine(clean(body.page, 120)) || 'Not specified';
    const suggestion = clean(body.suggestion, 4000);
    if (!name) return res.status(400).json({ error: 'Please enter your name.' });
    if (suggestion.length < 10) return res.status(400).json({ error: 'Please describe the change you’d like.' });

    const firstLine = oneLine(suggestion.split('\n')[0]);
    const title = `Website suggestion: ${firstLine.length > 70 ? firstLine.slice(0, 67) + '…' : firstLine}`;
    const issueBody = [
      `**From:** ${name} (exec committee, via the website suggestion form)`,
      `**Page:** ${page}`,
      '',
      '**Suggestion:**',
      '',
      suggestion.split('\n').map((l) => '> ' + l).join('\n'),
      '',
      '---',
      '_Make this change on a new branch following CLAUDE.md. Keep it focused on what was asked._',
    ].join('\n');

    const issue = await github('/issues', { title, body: issueBody, labels: ['suggestion'] });
    // Added separately so the "labeled" event that starts Claude fires exactly once.
    if (process.env.SUGGESTIONS_AUTOBUILD !== 'false') await github(`/issues/${issue.number}/labels`, { labels: ['claude'] });
    return res.status(201).json({ number: issue.number });
  } catch (e) {
    console.error('suggest error:', e);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
}
