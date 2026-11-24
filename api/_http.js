// Small helpers shared by the functions.
const crypto = require('crypto');
function send(res, status, body, headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (typeof body === 'string' || Buffer.isBuffer(body)) res.end(body);
  else { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); }
}
function isAdmin(req) {
  const want = process.env.ADMIN_KEY || '';
  const got = String(req.headers['x-admin-key'] || '');
  if (want.length < 8 || got.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;
const RESERVED = new Set(['api', 'd', 'img', 'admin', 'assets', 'static', 'favicon.ico', 'robots.txt', 'logo.png', 'mascot.png']);
function validSlug(s) { return typeof s === 'string' && SLUG.test(s) && !RESERVED.has(s); }
function device(ua) {
  ua = String(ua || '');
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/windows/i.test(ua)) return 'windows';
  if (/mac os|macintosh/i.test(ua)) return 'mac';
  if (/linux/i.test(ua)) return 'linux';
  return 'other';
}
const BOT = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|curl|wget|python|httpclient|headless/i;
module.exports = { send, isAdmin, validSlug, device, BOT };
