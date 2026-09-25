// Storage for /api/rsvp. Uses Upstash Redis over its REST API (no dependencies).
// Connect it in Vercel → Project → Storage → Upstash (Redis); that sets the env vars below.
// Without them, local dev keeps sign-ups in memory (lost on restart).
// Each event is a Redis hash "rsvp:<event id>" of entry id → JSON entry.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function pipeline(cmds) {
  const res = await fetch(url.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  return (await res.json()).map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

const values = (flat) => flat.filter((_, i) => i % 2).map((v) => JSON.parse(v));

const redis = {
  async readAll(keys) {
    return keys.length ? (await pipeline(keys.map((k) => ['HGETALL', k]))).map(values) : [];
  },
  async count(key) { return (await pipeline([['HLEN', key]]))[0]; },
  async get(key, field) {
    const [v] = await pipeline([['HGET', key, field]]);
    return v ? JSON.parse(v) : null;
  },
  async set(key, field, value) { await pipeline([['HSET', key, field, JSON.stringify(value)]]); },
  async del(key, field) { await pipeline([['HDEL', key, field]]); },
  /** Increment a counter that expires `ttl` seconds after its first hit; returns the new count. */
  async hit(key, ttl) { return (await pipeline([['INCR', key], ['EXPIRE', key, ttl, 'NX']]))[0]; },
};

const mem = new Map();
const memory = {
  async readAll(keys) { return keys.map((k) => [...(mem.get(k)?.values() || [])]); },
  async count(key) { return mem.get(key)?.size || 0; },
  async get(key, field) { return mem.get(key)?.get(field) || null; },
  async set(key, field, value) {
    if (!mem.has(key)) mem.set(key, new Map());
    mem.get(key).set(field, value);
  },
  async del(key, field) { mem.get(key)?.delete(field); },
  async hit() { return 0; },
};

// On Vercel without a database connected, report "not set up" rather than silently
// using memory that isn't shared between function instances.
export const store = url && token ? redis : process.env.VERCEL ? null : memory;
