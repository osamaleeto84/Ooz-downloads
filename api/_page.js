// HTML of the public pages, written to match the approved design (dark olive, lime; IBM Plex Sans Arabic + Fredoka).
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = {
  dl: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>', wa: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  check: '<path d="M5 12l5 5 9-10"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>', pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
};
const ic = (k, s = 22) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;
const mb = n => (n > 0 ? (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + ' MB' : '');
const num = n => Number(n || 0).toLocaleString('en-US');
const CSS = `
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
html,body{overflow-x:hidden}body{margin:0;background:#171A13;color:#F3F5EC;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;line-height:1.6}
a{color:#B6EE4E}a:hover{color:#D3FA86}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px;position:relative}
.glow{position:absolute;top:-140px;left:0;right:0;margin:0 auto;width:min(640px,100%);height:460px;background:radial-gradient(circle,rgba(182,238,78,.15),transparent 65%);pointer-events:none}
.top{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #343A2C}
.top img{width:108px;height:auto;display:block}.top a.all{font-size:14px;font-weight:600;text-decoration:none}
.hero{display:flex;flex-wrap:wrap;gap:36px;align-items:center;padding:40px 0 20px}
.hero .main{flex:999 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px}
.id{display:flex;align-items:center;gap:18px}
.icon{width:112px;height:112px;border-radius:28px;background:#fff;overflow:hidden;flex-shrink:0;box-shadow:0 18px 40px -18px rgba(0,0,0,.7)}
.icon img{width:100%;height:100%;object-fit:cover;display:block}
h1{margin:0;font-size:40px;line-height:1.2;font-weight:700}.by{font-size:14px;color:#A9B09C}
.tag{margin:0;font-size:19px;color:#F3F5EC}
.badges{display:flex;gap:8px;flex-wrap:wrap}.badges span{font-size:13px;font-weight:600;background:#2C3224;border-radius:999px;padding:5px 12px}
.fn{font-family:Fredoka,sans-serif}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:58px;padding:0 28px;border-radius:18px;background:#B6EE4E;color:#1A1D16!important;text-decoration:none;font-size:18px;font-weight:700;box-shadow:0 16px 36px -14px rgba(160,230,60,.6)}
.btn small{font-size:13px;opacity:.75;font-weight:600}.btn:hover{background:#C8F56C}
.btn.off{background:#2C3224;color:#A9B09C!important;box-shadow:none;pointer-events:none}
.hint{font-size:13px;color:#A9B09C}
.shots{flex:1 1 360px;min-width:0;display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x mandatory}
.shots img{height:390px;width:auto;border-radius:18px;border:1px solid #343A2C;scroll-snap-align:start;flex-shrink:0;background:#22261D}
h2{margin:0 0 12px;font-size:20px;font-weight:700}
section{padding:18px 0}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.card{background:#22261D;border:1px solid #343A2C;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:6px}
.card .k{width:40px;height:40px;border-radius:12px;background:#2C3224;color:#B6EE4E;display:flex;align-items:center;justify-content:center}
.card b{font-size:15px}.card span{font-size:14px;color:#A9B09C}
.two{display:flex;flex-wrap:wrap;gap:16px}.two>div{flex:1 1 340px;min-width:0}
.pre{white-space:pre-line;font-size:15px;color:#C9CEBF}
ol.steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
ol.steps li{display:flex;gap:12px;align-items:flex-start;font-size:15px}
ol.steps li i{font-style:normal;font-family:Fredoka,sans-serif;width:30px;height:30px;flex-shrink:0;border-radius:50%;background:#B6EE4E;color:#1A1D16;font-weight:700;display:flex;align-items:center;justify-content:center}
.others{display:flex;gap:10px;flex-wrap:wrap}
.other{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;background:#22261D;border:1px solid #343A2C;border-radius:16px;text-decoration:none;color:#F3F5EC!important;flex:1 1 220px;min-width:0}
.other .icon{width:48px;height:48px;border-radius:13px;box-shadow:none}.other b{font-size:15px;display:block}.other span{font-size:12px;color:#A9B09C;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
footer{border-top:1px solid #343A2C;margin-top:20px;padding:26px 0 34px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
footer img{width:150px;height:auto}footer .c{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
footer .c a{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #343A2C;text-decoration:none;font-size:14px;font-weight:600}
footer small{color:#A9B09C;font-size:13px}
.homehero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:44px 0 18px}
.homehero img{width:min(360px,80vw);height:auto}.homehero p{margin:0;font-size:20px;font-weight:700}.homehero p span{color:#B6EE4E}
.apps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.appcard{display:flex;gap:14px;align-items:center;padding:16px;background:#22261D;border:1px solid #343A2C;border-radius:20px;text-decoration:none;color:#F3F5EC!important}
.appcard .icon{width:72px;height:72px;border-radius:18px;box-shadow:none}.appcard b{font-size:17px;display:block}.appcard span{font-size:13px;color:#A9B09C;display:block}
.appcard em{font-style:normal;font-size:12px;font-weight:700;color:#B6EE4E}
@media (max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.apps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){.hero{padding-top:26px;gap:22px}.id{flex-direction:column;text-align:center}.hero .main{align-items:center;text-align:center}
 h1{font-size:30px}.tag{font-size:16px}.badges{justify-content:center}.cta{width:100%}.btn{width:100%}.shots img{height:300px}.apps{grid-template-columns:1fr}.icon{width:104px;height:104px}}
@media (max-width:380px){.grid{grid-template-columns:1fr}}
`;
function shell({ title, desc, image, url, body }) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#171A13">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary">
<link rel="icon" href="/mascot.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Fredoka:wght@500;600;700&display=swap">
<style>${CSS}</style></head><body><div class="glow" aria-hidden="true"></div><div class="wrap">${body}</div></body></html>`;
}
const top = all => `<header class="top"><a href="/" aria-label="Ooz apps"><img src="/logo.png" alt="Ooz apps"></a>${all ? '<a class="all" href="/">كل التطبيقات</a>' : ''}</header>`;
const foot = `<footer><img src="/logo.png" alt="Ooz apps"><small>برامج وتطبيقات لشغلك</small><div class="c">
<a href="https://wa.me/249912606138">${ic('wa', 18)}<span dir="ltr">+249 91 260 6138</span></a>
<a href="https://wa.me/201553483027">${ic('wa', 18)}<span dir="ltr">+20 155 348 3027</span></a>
<a href="mailto:ooz85@outlook.com">${ic('mail', 18)}<span dir="ltr">ooz85@outlook.com</span></a></div><small>تصميم م. أسامة أبو الحسن</small></footer>`;
const iconOf = a => (a.icon_id ? `/img/${a.icon_id}` : '/mascot.png');
const STEPS = {
  android: ['اضغط زر «تحميل» وانتظر حتى يكتمل الملف', 'افتح الملف من الإشعارات أو مجلد التنزيلات', 'إذا طلب الجوال، اسمح بالتثبيت من هذا المصدر ثم اضغط «تثبيت»'],
  windows: ['اضغط زر «تحميل» وانتظر حتى يكتمل الملف', 'افتح الملف من مجلد التنزيلات (فك الضغط أولاً إن كان ZIP)', 'إذا ظهرت رسالة حماية ويندوز اضغط «More info» ثم «Run anyway»'],
};
function app(a, others, origin) {
  const android = a.platform !== 'windows', has = !!a.version_name;
  const feats = (a.features || []).filter(f => f && f.t);
  const shots = (a.shots || []).map(id => `<img src="/img/${+id}" alt="لقطة شاشة من ${esc(a.name)}" loading="lazy">`).join('');
  const price = a.price_label == null ? 'مجاني' : String(a.price_label).trim(), free = price === 'مجاني';
  const badges = [price ? esc(price) : '', android ? 'أندرويد' : 'ويندوز', has ? `الإصدار <span dir="ltr">${esc(a.version_name)}</span>` : '', a.total > 0 ? `<span class="fn">${num(a.total)}</span>&nbsp;تحميل` : '']
    .filter(Boolean).map(b => `<span>${b}</span>`).join('');
  const btn = has ? `<a class="btn" href="/d/${esc(a.slug)}" rel="nofollow">${ic('dl')}<span>${free ? 'تحميل مجاناً' : 'تحميل'}</span>${a.size > 0 ? `<small dir="ltr">${mb(+a.size)}</small>` : ''}</a>`
    : `<span class="btn off">قريباً</span>`;
  const body = `${top(true)}
<section class="hero"><div class="main">
<div class="id"><div class="icon"><img src="${iconOf(a)}" alt=""></div><div><h1 dir="ltr">${esc(a.name)}</h1><div class="by">من <span dir="ltr">Ooz apps</span></div></div></div>
${a.tagline ? `<p class="tag">${esc(a.tagline)}</p>` : ''}<div class="badges">${badges}</div>
<div class="cta">${btn}</div>${android && has ? '<span class="hint">على الكمبيوتر؟ افتح هذه الصفحة من جوالك</span>' : ''}</div>
${shots ? `<div class="shots">${shots}</div>` : ''}</section>
${feats.length ? `<section><h2>المميزات</h2><div class="grid">${feats.map(f => `<div class="card"><div class="k">${ic('star', 20)}</div><b>${esc(f.t)}</b>${f.d ? `<span>${esc(f.d)}</span>` : ''}</div>`).join('')}</div></section>` : ''}
${a.description ? `<section><h2>عن التطبيق</h2><div class="pre">${esc(a.description)}</div></section>` : ''}
<section class="two">${has && a.notes ? `<div class="card"><b>ما الجديد في <span dir="ltr">${esc(a.version_name)}</span></b><div class="pre">${esc(a.notes)}</div></div>` : ''}
<div class="card"><b>طريقة التثبيت</b><ol class="steps">${STEPS[android ? 'android' : 'windows'].map((s, i) => `<li><i>${i + 1}</i><span>${s}</span></li>`).join('')}</ol></div></section>
${others.length ? `<section><h2>تطبيقات أخرى من Ooz apps</h2><div class="others">${others.map(o => `<a class="other" href="/${esc(o.slug)}"><div class="icon"><img src="${iconOf(o)}" alt=""></div><div style="min-width:0"><b dir="ltr">${esc(o.name)}</b><span>${esc(o.tagline)}</span></div></a>`).join('')}</div></section>` : ''}
${foot}`;
  return shell({ title: a.name + (free ? ' — تحميل مجاني' : ' — تحميل'), desc: a.tagline || ('حمّل ' + a.name + (free ? ' مجاناً' : '') + ' من Ooz apps'), image: origin + iconOf(a), url: origin + '/' + a.slug, body });
}
function home(apps, origin) {
  const body = `${top(false)}<div class="homehero"><img src="/logo.png" alt="Ooz apps"><p>برامج وتطبيقات <span>لشغلك</span></p><span class="hint">للمحلات والمدارس والصيدليات وشركات الأدوية</span></div>
<section><h2>تطبيقاتنا</h2><div class="apps">${apps.map(a => `<a class="appcard" href="/${esc(a.slug)}"><div class="icon"><img src="${iconOf(a)}" alt=""></div><div style="min-width:0"><b dir="ltr">${esc(a.name)}</b><span>${esc(a.tagline)}</span>${a.version_name ? `<em>${a.platform === 'windows' ? 'ويندوز' : 'أندرويد'} · <span dir="ltr" style="display:inline">${esc(a.version_name)}</span></em>` : '<em>قريباً</em>'}</div></a>`).join('') || '<p class="hint">قريباً</p>'}</div></section>${foot}`;
  return shell({ title: 'Ooz apps — برامج وتطبيقات لشغلك', desc: 'حمّل تطبيقات Ooz apps مجاناً', image: origin + '/logo.png', url: origin + '/', body });
}
const notFound = (apps, origin) => home(apps, origin).replace('<section><h2>تطبيقاتنا</h2>', '<section><h2>هذه الصفحة غير موجودة، اختر من تطبيقاتنا</h2>');
const error = () => shell({ title: 'Ooz apps', desc: '', image: '/logo.png', url: '/', body: `${top(false)}<div class="homehero"><p>حدث خطأ مؤقت، حاول بعد قليل</p></div>${foot}` });
module.exports = { app, home, notFound, error, esc };
