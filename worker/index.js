// Serves the upcoming page, its notify-me list and live Discord counts.
//
//   GET  /api/notify   -> { count }
//   POST /api/notify   -> { ok, already, count }   body: { email, company }
//   GET  /api/discord  -> { members, online }      cached for five minutes
//
// `company` is a honeypot field that people never see; bots fill it in.

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const MAX_BODY = 2048;
const RATE_LIMIT = 5;          // signups per network
const RATE_WINDOW = 60 * 60;   // per hour, in seconds
const DISCORD_TTL = 300;       // seconds to cache Discord counts

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/discord') {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
      return discord(env, ctx);
    }
    if (url.pathname === '/api/notify') {
      try {
        if (request.method === 'GET') return await count(env);
        if (request.method === 'POST') return await subscribe(request, env);
        return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      } catch (err) {
        console.error('notify failed', err);
        return json({ error: 'server_error' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function count(env) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM subscribers').first();
  return json({ count: row.n }, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function subscribe(request, env) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'payload_too_large' }, 413);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Pretend success for bots so they do not retry.
  if (body.company) return json({ ok: true, already: false });

  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);

  const now = Math.floor(Date.now() / 1000);
  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') || '', env.IP_SALT || 'raiku');

  const recent = await env.DB
    .prepare('SELECT COUNT(*) AS n FROM subscribers WHERE ip_hash = ?1 AND created_at > ?2')
    .bind(ipHash, now - RATE_WINDOW)
    .first();
  if (recent.n >= RATE_LIMIT) return json({ error: 'rate_limited' }, 429, { 'Retry-After': '600' });

  const insert = await env.DB
    .prepare('INSERT INTO subscribers (email, ip_hash, created_at) VALUES (?1, ?2, ?3) ON CONFLICT(email) DO NOTHING')
    .bind(email, ipHash, now)
    .run();
  const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM subscribers').first();

  return json({ ok: true, already: insert.meta.changes === 0, count: total.n });
}

// Public invite lookup; Discord returns approximate member and online counts.
async function discord(env, ctx) {
  const code = env.DISCORD_INVITE;
  if (!code) return json({ error: 'not_configured' }, 404);

  const cache = caches.default;
  const key = new Request(`https://raiku.win/__cache/discord/${encodeURIComponent(code)}`);
  const hit = await cache.match(key);
  if (hit) return hit;

  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`, {
      headers: { Accept: 'application/json', 'User-Agent': 'raiku.win (https://raiku.win)' },
    });
    if (!res.ok) return json({ error: 'discord_unavailable' }, 502);
    const data = await res.json();
    const out = json({
      members: data.approximate_member_count ?? null,
      online: data.approximate_presence_count ?? null,
    }, 200, { 'Cache-Control': `public, max-age=${DISCORD_TTL}` });
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  } catch (err) {
    console.error('discord lookup failed', err);
    return json({ error: 'discord_unavailable' }, 502);
  }
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}
