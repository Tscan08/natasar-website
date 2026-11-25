// Daily write to the sign-up database so Upstash's free plan doesn't remove it for
// inactivity during quiet months. Called by the Vercel Cron job in vercel.json.
// If CRON_SECRET is set in Vercel, only Vercel Cron (which sends it) can call this.
import { store } from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized.' });
  if (!store) return res.status(503).json({ error: 'Database not connected.' });
  try {
    const at = new Date().toISOString();
    await store.set('meta', 'keepalive', { at });
    return res.status(200).json({ ok: true, at });
  } catch (e) {
    console.error('keepalive error:', e);
    return res.status(500).json({ error: 'Database unreachable.' });
  }
}
