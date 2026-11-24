// GitHub Releases hold the app files: unlimited downloads for a public repository.
const REPO = () => process.env.GITHUB_REPO || 'osamaleeto84/Ooz-downloads';
async function gh(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const r = await (global.__OOZ_FETCH__ || fetch)('https://api.github.com/repos/' + REPO() + path, {
    method: opts.method || 'GET',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ooz-downloads', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await r.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  return { status: r.status, data };
}
// A release per version: tag "<slug>-v<version>". Created if missing; its assets are listed so a repeated upload can replace a file.
async function releaseFor(slug, version, appName) {
  const tag = (slug + '-v' + version).replace(/[^A-Za-z0-9._-]/g, '-');
  let r = await gh('/releases/tags/' + encodeURIComponent(tag));
  if (r.status === 404) {
    r = await gh('/releases', { method: 'POST', body: { tag_name: tag, name: appName + ' ' + version, body: appName + ' ' + version, draft: false, prerelease: false } });
    if (r.status === 422) r = await gh('/releases/tags/' + encodeURIComponent(tag));
  }
  if (r.status >= 300) throw new Error('GitHub: ' + r.status + ' ' + (r.data && r.data.message || ''));
  const uploadUrl = String(r.data.upload_url || '').replace(/\{.*$/, '');
  return { id: r.data.id, tag, uploadUrl, assets: (r.data.assets || []).map(a => ({ id: a.id, name: a.name })) };
}
async function deleteAsset(id) { if (id) await gh('/releases/assets/' + Number(id), { method: 'DELETE' }); }
async function check() { const r = await gh(''); return { ok: r.status === 200, status: r.status, private: r.data && r.data.private, name: r.data && r.data.full_name }; }
module.exports = { releaseFor, deleteAsset, check, REPO };
