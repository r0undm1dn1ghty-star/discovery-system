// qa/tmp-class.js — раскладка тапов по классам + список конкретных нарушителей
const r = require('../qa/mobile-360.json');
const cls = t => {
  const s = t.sel;
  if (/nav-items/.test(s)) return 'nav';
  if (/sig-c/.test(s)) return 'footer-legal';
  if (/ds-cookie-note/.test(s)) return 'cookie';
  if (/sources-inline|source-list|sig-src|sig-meta|accept-links|m-row|\.src|res-more|sig-meta/.test(s)) return 'source';
  return 'inline';
};
const tot = {};
console.log('page'.padEnd(30) + 'nav foot cook src  inl  | 44-tall violators');
for (const [p, d] of Object.entries(r)) {
  const c = { nav: 0, 'footer-legal': 0, cookie: 0, source: 0, inline: 0 };
  (d.taps || []).forEach(t => c[cls(t)]++);
  Object.keys(c).forEach(k => tot[k] = (tot[k] || 0) + c[k]);
  const viol = (d.taps || []).filter(t => t.h >= 25 && t.h < 44).map(t => `${t.w}x${t.h} ${t.txt}`).join('; ');
  console.log(`${p.padEnd(30)}${String(c.nav).padStart(3)}${String(c['footer-legal']).padStart(5)}${String(c.cookie).padStart(5)}${String(c.source).padStart(4)}${String(c.inline).padStart(5)}  | ${viol}`);
}
console.log('\nИТОГО по классам:', JSON.stringify(tot));

console.log('\n--- footer sig-c уникальные ярлыки ---');
const s = new Set();
for (const [p, d] of Object.entries(r)) (d.taps || []).filter(t => /sig-c/.test(t.sel)).forEach(t => s.add(`${t.w}x${t.h} «${t.txt}»`));
console.log([...s].join('\n'));

console.log('\n--- nav ---');
const n = new Set();
for (const [p, d] of Object.entries(r)) (d.taps || []).filter(t => /nav-items/.test(t.sel)).forEach(t => n.add(`${t.w}x${t.h} «${t.txt}»`));
console.log([...n].join('\n'));
