// The public pages: / (all apps) and /<slug> (one app's download page).
const { q } = require('./_db');
const { send, validSlug } = require('./_http');
const P = require('./_page');
module.exports = async (req, res) => {
  const slug = String((req.query && req.query.slug) || '');
  const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
  const html = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' };
  try {
    const apps = await q(`SELECT a.*, v.version_name, v.size, v.notes, v.created_at AS released,
        (SELECT count(*) FROM downloads d WHERE d.app_id = a.id)::int AS total
      FROM apps a LEFT JOIN versions v ON v.app_id = a.id AND v.is_current WHERE a.published ORDER BY a.sort, a.id`, []);
    if (!slug) return send(res, 200, P.home(apps, origin), html);
    const app = validSlug(slug) && apps.find(a => a.slug === slug);
    if (!app) return send(res, 404, P.notFound(apps, origin), html);
    send(res, 200, P.app(app, apps.filter(a => a.id !== app.id), origin), html);
  } catch (e) { send(res, 500, P.error(), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); }
};
