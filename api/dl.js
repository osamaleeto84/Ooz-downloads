// /d/<slug>: counts the download, then hands over the file of the current version.
const { q } = require('./_db');
const { send, validSlug, device, BOT } = require('./_http');
module.exports = async (req, res) => {
  const slug = String((req.query && req.query.slug) || '');
  if (!validSlug(slug)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  try {
    const rows = await q(`SELECT a.id AS app_id, v.id AS version_id, v.asset_url FROM apps a JOIN versions v ON v.app_id = a.id AND v.is_current
      WHERE a.slug = $1 AND a.published`, [slug]);
    if (!rows.length) return send(res, 302, '', { Location: '/' + slug, 'Cache-Control': 'no-store' });
    const ua = req.headers['user-agent'] || '';
    // Link previews and robots fetch links too; they are not people downloading.
    if (!BOT.test(ua) && req.method !== 'HEAD') {
      const country = String(req.headers['x-vercel-ip-country'] || '').slice(0, 2).toUpperCase();
      await q('INSERT INTO downloads (app_id, version_id, country, device) VALUES ($1, $2, $3, $4)', [rows[0].app_id, rows[0].version_id, country, device(ua)]);
    }
    send(res, 302, '', { Location: rows[0].asset_url, 'Cache-Control': 'no-store' });
  } catch (e) { send(res, 500, 'Error', { 'Content-Type': 'text/plain; charset=utf-8' }); }
};
