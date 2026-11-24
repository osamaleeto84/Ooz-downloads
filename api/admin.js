// Everything Ooz Drop (the owner's app) does: one function, the operation in ?op=. Every call needs the x-admin-key header.
const { q, TZ } = require('./_db');
const { send, isAdmin, validSlug } = require('./_http');
const gh = require('./_gh');

const str = (v, max) => String(v == null ? '' : v).slice(0, max);
const int = v => (Number.isFinite(+v) ? Math.trunc(+v) : 0);
async function counts(where, params) {
  const tz = TZ();
  const rows = await q(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE (at AT TIME ZONE $${params.length + 1})::date = (now() AT TIME ZONE $${params.length + 1})::date)::int AS today,
      count(*) FILTER (WHERE at > now() - interval '7 days')::int AS week,
      count(*) FILTER (WHERE at > now() - interval '30 days')::int AS month
    FROM downloads ${where}`, [...params, tz]);
  return rows[0];
}
async function series(days, where, params) {
  const tz = TZ(), n = params.length;
  const rows = await q(`SELECT to_char(d, 'YYYY-MM-DD') AS day, coalesce(c.n, 0)::int AS n
    FROM generate_series((now() AT TIME ZONE $${n + 1})::date - ($${n + 2}::int - 1), (now() AT TIME ZONE $${n + 1})::date, interval '1 day') AS d
    LEFT JOIN (SELECT (at AT TIME ZONE $${n + 1})::date AS day, count(*) AS n FROM downloads ${where} GROUP BY 1) c ON c.day = d::date ORDER BY d`, [...params, tz, days]);
  return rows;
}
function appOut(a) {
  return { id: a.id, slug: a.slug, name: a.name, tagline: a.tagline, description: a.description, features: a.features || [], platform: a.platform,
    package: a.package, icon: a.icon_id ? '/img/' + a.icon_id : null, icon_id: a.icon_id, shots: a.shots || [], published: a.published, sort: a.sort };
}
const OPS = {
  async ping() {
    await q('SELECT 1', []);
    let github = { ok: false };
    try { github = await gh.check(); } catch (e) { github = { ok: false, error: e.message }; }
    return { ok: true, db: true, github, repo: gh.REPO(), tz: TZ() };
  },
  async summary() {
    const totals = await counts('', []);
    const last7 = await series(7, '', []);
    const tz = TZ();
    const apps = await q(`SELECT a.*, v.version_name, v.size,
        (SELECT count(*) FROM downloads d WHERE d.app_id = a.id)::int AS total,
        (SELECT count(*) FROM downloads d WHERE d.app_id = a.id AND (d.at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date)::int AS today,
        (SELECT count(*) FROM downloads d WHERE d.app_id = a.id AND d.at > now() - interval '7 days')::int AS week
      FROM apps a LEFT JOIN versions v ON v.app_id = a.id AND v.is_current ORDER BY a.sort, a.id`, [tz]);
    return { totals, last7, apps: apps.map(a => ({ ...appOut(a), version: a.version_name, size: a.size == null ? null : +a.size, total: a.total, today: a.today, week: a.week })) };
  },
  async app(req) {
    const rows = await q('SELECT * FROM apps WHERE slug = $1', [str(req.query.slug, 40)]);
    if (!rows.length) throw Object.assign(new Error('not found'), { status: 404 });
    const a = rows[0];
    const versions = await q(`SELECT v.*, (SELECT count(*) FROM downloads d WHERE d.version_id = v.id)::int AS downloads FROM versions v WHERE v.app_id = $1 ORDER BY v.created_at DESC, v.id DESC`, [a.id]);
    return { app: appOut(a), totals: await counts('WHERE app_id = $1', [a.id]), last30: await series(30, 'WHERE app_id = $1', [a.id]),
      devices: await q(`SELECT device, count(*)::int AS n FROM downloads WHERE app_id = $1 GROUP BY 1 ORDER BY 2 DESC`, [a.id]),
      countries: await q(`SELECT country, count(*)::int AS n FROM downloads WHERE app_id = $1 AND country <> '' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`, [a.id]),
      versions: versions.map(v => ({ id: v.id, version: v.version_name, code: +v.version_code, notes: v.notes, size: +v.size, file: v.file_name, url: v.asset_url, current: v.is_current, at: v.created_at, downloads: v.downloads })) };
  },
  async saveApp(req) {
    const b = req.body || {};
    const slug = str(b.slug, 40).toLowerCase(), orig = b.origSlug ? str(b.origSlug, 40) : null;
    if (!validSlug(slug)) throw Object.assign(new Error('رابط غير صالح: حروف إنجليزية صغيرة وأرقام وشرطة فقط'), { status: 400 });
    const name = str(b.name, 80).trim();
    if (!name) throw Object.assign(new Error('اكتب اسم التطبيق'), { status: 400 });
    const features = (Array.isArray(b.features) ? b.features : []).slice(0, 12).map(f => ({ t: str(f && f.t, 80), d: str(f && f.d, 240) })).filter(f => f.t);
    const shots = (Array.isArray(b.shots) ? b.shots : []).slice(0, 8).map(int).filter(n => n > 0);
    const platform = ['android', 'windows'].includes(b.platform) ? b.platform : 'android';
    const vals = [slug, name, str(b.tagline, 140), str(b.description, 4000), JSON.stringify(features), platform, str(b.package, 120), b.icon_id ? int(b.icon_id) : null, JSON.stringify(shots), b.published !== false, int(b.sort)];
    try {
      if (orig) {
        const r = await q(`UPDATE apps SET slug=$1, name=$2, tagline=$3, description=$4, features=$5::jsonb, platform=$6, package=$7, icon_id=$8, shots=$9::jsonb, published=$10, sort=$11 WHERE slug=$12 RETURNING *`, [...vals, orig]);
        if (!r.length) throw Object.assign(new Error('not found'), { status: 404 });
        return { app: appOut(r[0]) };
      }
      const r = await q(`INSERT INTO apps (slug, name, tagline, description, features, platform, package, icon_id, shots, published, sort) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9::jsonb,$10,$11) RETURNING *`, vals);
      return { app: appOut(r[0]) };
    } catch (e) {
      if (String(e.code) === '23505' || /duplicate|unique/i.test(e.message)) throw Object.assign(new Error('هذا الرابط مستخدم لتطبيق آخر'), { status: 409 });
      throw e;
    }
  },
  async deleteApp(req) {
    const slug = str((req.body || {}).slug, 40);
    const vs = await q('SELECT v.asset_id FROM versions v JOIN apps a ON a.id = v.app_id WHERE a.slug = $1', [slug]);
    for (const v of vs) { try { await gh.deleteAsset(v.asset_id); } catch (e) {} }
    await q('DELETE FROM apps WHERE slug = $1', [slug]);
    return { ok: true };
  },
  async image(req) {
    const b = req.body || {};
    const mime = ['image/png', 'image/jpeg', 'image/webp'].includes(b.mime) ? b.mime : null;
    const b64 = String(b.base64 || '');
    if (!mime || !b64 || b64.length > 3 * 1024 * 1024 || !/^[A-Za-z0-9+/=]+$/.test(b64)) throw Object.assign(new Error('صورة غير صالحة أو كبيرة'), { status: 400 });
    const r = await q('INSERT INTO images (mime, b64) VALUES ($1, $2) RETURNING id', [mime, b64]);
    return { id: r[0].id, url: '/img/' + r[0].id };
  },
  // Where Ooz Drop sends the file itself (straight to GitHub, too big to pass through here).
  async ticket(req) {
    const b = req.body || {};
    const rows = await q('SELECT * FROM apps WHERE slug = $1', [str(b.slug, 40)]);
    if (!rows.length) throw Object.assign(new Error('not found'), { status: 404 });
    const version = str(b.version, 40).trim(), file = str(b.fileName, 120).replace(/[^A-Za-z0-9._-]/g, '-');
    if (!version || !file) throw Object.assign(new Error('الإصدار واسم الملف مطلوبان'), { status: 400 });
    const dup = await q('SELECT id FROM versions WHERE app_id = $1 AND version_name = $2', [rows[0].id, version]);
    if (dup.length && !b.replace) throw Object.assign(new Error('هذا الإصدار مرفوع من قبل'), { status: 409, code: 'exists' });
    const rel = await gh.releaseFor(rows[0].slug, version, rows[0].name);
    const old = rel.assets.find(a => a.name === file);
    if (old) await gh.deleteAsset(old.id);
    return { uploadUrl: rel.uploadUrl + '?name=' + encodeURIComponent(file), token: process.env.GITHUB_TOKEN, release: rel.tag };
  },
  async version(req) {
    const b = req.body || {};
    const rows = await q('SELECT * FROM apps WHERE slug = $1', [str(b.slug, 40)]);
    if (!rows.length) throw Object.assign(new Error('not found'), { status: 404 });
    const url = str(b.asset_url, 500);
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//.test(url)) throw Object.assign(new Error('رابط الملف غير صالح'), { status: 400 });
    const app = rows[0], version = str(b.version, 40).trim();
    await q('DELETE FROM versions WHERE app_id = $1 AND version_name = $2', [app.id, version]);
    const current = b.current !== false;
    if (current) await q('UPDATE versions SET is_current = false WHERE app_id = $1', [app.id]);
    const r = await q(`INSERT INTO versions (app_id, version_name, version_code, notes, size, file_name, asset_url, asset_id, is_current) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [app.id, version, int(b.code), str(b.notes, 3000), int(b.size), str(b.file, 120), url, b.asset_id ? int(b.asset_id) : null, current]);
    const any = await q('SELECT count(*)::int AS n FROM versions WHERE app_id = $1 AND is_current', [app.id]);
    if (!any[0].n) await q('UPDATE versions SET is_current = true WHERE id = $1', [r[0].id]);
    if (!app.package && b.package) await q('UPDATE apps SET package = $1 WHERE id = $2', [str(b.package, 120), app.id]);
    return { id: r[0].id };
  },
  async setCurrent(req) {
    const id = int((req.body || {}).id);
    const v = await q('SELECT app_id FROM versions WHERE id = $1', [id]);
    if (!v.length) throw Object.assign(new Error('not found'), { status: 404 });
    await q('UPDATE versions SET is_current = (id = $1) WHERE app_id = $2', [id, v[0].app_id]);
    return { ok: true };
  },
  async editVersion(req) {
    const b = req.body || {};
    await q('UPDATE versions SET notes = $1 WHERE id = $2', [str(b.notes, 3000), int(b.id)]);
    return { ok: true };
  },
  async deleteVersion(req) {
    const id = int((req.body || {}).id);
    const v = await q('SELECT * FROM versions WHERE id = $1', [id]);
    if (!v.length) return { ok: true };
    try { await gh.deleteAsset(v[0].asset_id); } catch (e) {}
    await q('DELETE FROM versions WHERE id = $1', [id]);
    if (v[0].is_current) await q(`UPDATE versions SET is_current = true WHERE id = (SELECT id FROM versions WHERE app_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1)`, [v[0].app_id]);
    return { ok: true };
  },
};
const POSTS = new Set(['saveApp', 'deleteApp', 'image', 'ticket', 'version', 'setCurrent', 'editVersion', 'deleteVersion']);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
  const op = String((req.query && req.query.op) || '');
  const fn = Object.prototype.hasOwnProperty.call(OPS, op) ? OPS[op] : null;
  if (!fn) return send(res, 404, { error: 'unknown op' });
  if (POSTS.has(op) !== (req.method === 'POST')) return send(res, 405, { error: 'method' });
  try { send(res, 200, await fn(req)); }
  catch (e) { send(res, e.status || 500, { error: e.message || 'error', code: e.code }); }
};
