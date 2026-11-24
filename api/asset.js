// /logo.png and /mascot.png
const B = require('./_brand');
module.exports = (req, res) => {
  const f = String((req.query && req.query.f) || '');
  if (f !== 'logo' && f !== 'mascot') { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.end(Buffer.from(B[f], 'base64'));
};
