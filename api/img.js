// /img/<id>: icons and screenshots, kept in the database (small, and they never change: cached for a year).
const { q } = require('./_db');
const { send } = require('./_http');
module.exports = async (req, res) => {
  const id = parseInt(String((req.query && req.query.id) || ''), 10);
  if (!(id > 0)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  try {
    const r = await q('SELECT mime, b64 FROM images WHERE id = $1', [id]);
    if (!r.length) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    send(res, 200, Buffer.from(r[0].b64, 'base64'), { 'Content-Type': r[0].mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
  } catch (e) { send(res, 500, 'Error', { 'Content-Type': 'text/plain' }); }
};
