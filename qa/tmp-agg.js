// qa/tmp-agg.js — сводка по mobile-360.json: классификация тапов и мелкого текста
const r = require('../qa/mobile-360.json');
const rows = [];
for (const [p, d] of Object.entries(r)) {
  const t = d.taps || [];
  const ctl = t.filter(x => !/^(p|li|dd|td|span|em|b|i)\b/.test(x.sel.split('>').pop().trim().slice(0, 2)) || x.h >= 30);
  // простая эвристика: инлайн-ссылка = высота <= 24 и внутри текстового блока
  const inline = t.filter(x => x.h <= 24);
  const big = t.filter(x => x.h > 24);
  const tags = {};
  t.forEach(x => { const k = x.sel.split('>').pop().trim().replace(/[.#].*/, ''); tags[k] = (tags[k] || 0) + 1; });
  rows.push({ p, ovf: d.overflow, off: (d.offenders || []).length, tiny: (d.tiny || []).length, taps: t.length, inline: inline.length, big: big.length, tags: JSON.stringify(tags), h: d.pageH });
}
rows.forEach(x => console.log(`${x.p.padEnd(30)} ovf=${x.ovf} off=${x.off} tiny=${String(x.tiny).padStart(3)} taps=${String(x.taps).padStart(2)} (inline=${x.inline} tall>24=${x.big}) tags=${x.tags} h=${x.h}`));
// какие тапы >24 но <44 по высоте, или узкие
console.log('\n--- тапы высотой >24 но <44 ИЛИ шириной <44 (не инлайн-текст) ---');
for (const [p, d] of Object.entries(r)) {
  (d.taps || []).filter(t => t.h > 24 || t.w < 44 && t.h >= 40).forEach(t => {
    if (t.h > 24 && t.h < 44) console.log(`${p.padEnd(30)} ${t.w}x${t.h} ${t.sel} | ${t.txt}`);
  });
}
