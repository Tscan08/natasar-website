// "Who's going" sign-ups for events on the current schedule. Vercel serverless function.
//   GET    /api/rsvp                                      → { "<event id>": [entry, …], … }
//   POST   /api/rsvp  { event, name, status, note }       → { entry, token }
//   DELETE /api/rsvp  { event, id, token }                → { ok: true }
// The token returned by POST is kept in the visitor's browser so they can remove
// their own sign-up. Fleet admins can remove anything from the Upstash data browser.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { eventId } from '../src/event-id.mjs';
import { store } from './_store.js';

const MAX_PER_EVENT = 150;
const WRITES_PER_HOUR = 30; // per IP address
const STATUSES = ['going', 'maybe'];

function currentEvents() {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(process.cwd(), f), 'utf8'));
  const { currentYear } = read('data/site.json');
  return new Map(read(`data/schedule-${currentYear}.json`).events.map((e) => [eventId(e), e]));
}

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const hash = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const publicEntry = ({ id, name, status, note, at }) => ({ id, name, status, note, at });
const clientIp = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

/** Sign-ups close the day after an event ends (a day of slack covers time zones). */
function isOver(ev) {
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return (ev.end || ev.start) < yesterday;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!store) return res.status(503).json({ error: 'Sign-ups aren’t set up yet.' });

  try {
    const events = currentEvents();

    if (req.method === 'GET') {
      const ids = [...events.keys()];
      const lists = await store.readAll(ids.map((id) => 'rsvp:' + id));
      const out = {};
      ids.forEach((id, i) => { out[id] = lists[i].map(publicEntry).sort((a, b) => a.at - b.at); });
      return res.status(200).json(out);
    }

    if (req.method !== 'POST' && req.method !== 'DELETE') {
      res.setHeader('Allow', 'GET, POST, DELETE');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const ev = events.get(body.event);
    if (!ev) return res.status(404).json({ error: 'That event isn’t on the schedule.' });
    if ((await store.hit('rl:' + clientIp(req), 3600)) > WRITES_PER_HOUR) {
      return res.status(429).json({ error: 'Too many changes — please try again later.' });
    }
    const key = 'rsvp:' + body.event;

    if (req.method === 'POST') {
      if (body.website) return res.status(400).json({ error: 'Sign-up rejected.' }); // bot honeypot
      if (isOver(ev)) return res.status(400).json({ error: 'Sign-ups for this event are closed.' });
      const name = clean(body.name, 60);
      if (!name) return res.status(400).json({ error: 'Please enter your name.' });
      const status = STATUSES.includes(body.status) ? body.status : 'going';
      if ((await store.count(key)) >= MAX_PER_EVENT) return res.status(400).json({ error: 'This list is full.' });

      const token = crypto.randomBytes(18).toString('base64url');
      const entry = { id: crypto.randomBytes(6).toString('base64url'), name, status, note: clean(body.note, 80), at: Date.now() };
      await store.set(key, entry.id, { ...entry, th: hash(token) });
      return res.status(201).json({ entry, token });
    }

    // DELETE: only with the token handed out when the entry was created.
    const existing = await store.get(key, String(body.id || ''));
    if (!existing) return res.status(200).json({ ok: true });
    if (!body.token || hash(body.token) !== existing.th) return res.status(403).json({ error: 'You can only remove your own sign-up.' });
    await store.del(key, existing.id);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('rsvp error:', e);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
}
