const r = require('../qa/mobile-360.json');
const want = process.argv[2] || 'summary';
for (const [p, d] of Object.entries(r)) {
  if (want !== 'all' && !p.includes(want)) continue;
  console.log('\n===== ' + p + ' ovf=' + d.overflow);
  console.log('-- offenders (' + d.offenders.length + ')');
  d.offenders.slice(0, 20).forEach(o => console.log(`   [${o.left}..${o.right} w=${o.w}] ${o.sel} | ${o.txt}`));
  console.log('-- fixedWide (' + d.fixedWide.length + ')');
  d.fixedWide.slice(0, 10).forEach(o => console.log(`   [${o.left}..${o.right} w=${o.w}] ${o.sel} | ${o.txt}`));
  console.log('-- tiny (' + d.tiny.length + ')');
  const agg = {};
  d.tiny.forEach(t => { const k = t.fs; agg[k] = agg[k] || []; if (agg[k].length < 4) agg[k].push(t.sel + ' «' + t.txt.slice(0, 24) + '»'); });
  Object.entries(agg).forEach(([fs, ex]) => console.log(`   ${fs} × ${d.tiny.filter(x => x.fs === fs).length}: ` + ex.join(' || ')));
  console.log('-- taps (' + d.taps.length + ')');
  d.taps.slice(0, 40).forEach(t => console.log(`   ${t.w}x${t.h} ${t.sel} | ${t.txt}`));
  console.log('-- nowrap (' + d.nowrap.length + ')');
  d.nowrap.slice(0, 8).forEach(t => console.log(`   sw=${t.sw} ${t.sel} | ${t.txt}`));
  console.log('-- traps (' + d.traps.length + ')');
  d.traps.slice(0, 8).forEach(t => console.log(`   sw=${t.sw} cw=${t.cw} ${t.sel}`));
}
