const r = require('../qa/mobile-360-text.json');
for (const [p, it] of Object.entries(r)) {
  const html = it.filter(x => !x.svg);
  if (!html.length) continue;
  console.log('\n=== ' + p + ' html-мелкий=' + html.length);
  html.forEach(x => console.log(`  ${x.eff}px (fs=${x.fs}) scroller=${x.scroller} ${x.sel} «${x.txt}»`));
}
console.log('\n=== value-chain: распределение по eff');
const vc = r['value-chain.html'];
const g = {};
vc.forEach(x => g[x.eff] = (g[x.eff] || 0) + 1);
console.log(JSON.stringify(g));
