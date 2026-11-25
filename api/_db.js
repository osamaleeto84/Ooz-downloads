// Database access. Production: Neon over HTTP (DATABASE_URL). Tests: an in-memory Postgres (global.__OOZ_DB__).
let impl = null, ready = null;
function db() {
  if (impl) return impl;
  if (global.__OOZ_DB__) return (impl = global.__OOZ_DB__);
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  return (impl = { q: (text, params = []) => sql.query(text, params) });
}
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS images (id SERIAL PRIMARY KEY, mime TEXT NOT NULL, b64 TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS apps (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '',
     description TEXT NOT NULL DEFAULT '', features JSONB NOT NULL DEFAULT '[]', platform TEXT NOT NULL DEFAULT 'android', package TEXT NOT NULL DEFAULT '',
     icon_id INT, shots JSONB NOT NULL DEFAULT '[]', published BOOLEAN NOT NULL DEFAULT true, sort INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS versions (id SERIAL PRIMARY KEY, app_id INT NOT NULL REFERENCES apps(id) ON DELETE CASCADE, version_name TEXT NOT NULL, version_code BIGINT NOT NULL DEFAULT 0,
     notes TEXT NOT NULL DEFAULT '', size BIGINT NOT NULL DEFAULT 0, file_name TEXT NOT NULL DEFAULT '', asset_url TEXT NOT NULL, asset_id BIGINT, is_current BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS downloads (id BIGSERIAL PRIMARY KEY, app_id INT NOT NULL REFERENCES apps(id) ON DELETE CASCADE, version_id INT REFERENCES versions(id) ON DELETE SET NULL,
     at TIMESTAMPTZ NOT NULL DEFAULT now(), country TEXT NOT NULL DEFAULT '', device TEXT NOT NULL DEFAULT '')`,
  `ALTER TABLE apps ADD COLUMN IF NOT EXISTS price_label TEXT NOT NULL DEFAULT 'مجاني'`,
  `CREATE INDEX IF NOT EXISTS downloads_app_at ON downloads (app_id, at)`,
  `CREATE INDEX IF NOT EXISTS versions_app ON versions (app_id)`,
];
async function q(text, params) { await ensure(); return db().q(text, params); }
function ensure() {
  if (!ready) ready = (async () => { for (const s of SCHEMA) await db().q(s, []); })().catch(e => { ready = null; throw e; });
  return ready;
}
const TZ = () => process.env.OOZ_TZ || 'Africa/Cairo';
module.exports = { q, ensure, TZ, _reset: () => { impl = null; ready = null; } };
