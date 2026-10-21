// QA-харнесс движка калькулятора (методика discovery-config-calculator)
// R1 целостность, R2 экономика, R5 полный перебор, монотонность, инвариант cpu<=vps<=host
const fs = require('fs'), vm = require('vm');
const js = fs.readFileSync(__dirname + '/engine.js', 'utf8');

// --- минимальные стабы DOM ---
const elCache = new Map();
const elStub = (id) => {
  if (id && elCache.has(id)) return elCache.get(id);
  const el = { id, style: {}, classList: { add(){}, remove(){}, toggle(){} }, textContent: '', innerHTML: '',
    addEventListener(){}, appendChild(){}, setAttribute(){}, value: '400', children: [] };
  if (id) elCache.set(id, el);
  return el;
};
const sandbox = {
  console,
  document: { getElementById: (id) => elStub(id), querySelector: () => null,
    querySelectorAll: () => [], addEventListener(){}, createElement: () => elStub(),
    body: elStub('body') },
  window: { matchMedia: () => ({ matches: false }), open: () => {} },
  sessionStorage: { getItem: () => null, setItem(){} },
  localStorage: { getItem: () => null, setItem(){} },
  performance: { now: () => Date.now() },
  requestAnimationFrame(){}, setTimeout(){}, URLSearchParams: class { get(){return null} },
  location: { search: '' }, navigator: { userAgent: 'qa' }
};
vm.createContext(sandbox);
const shim = `
;globalThis.__qa = {
  L: {STARTS, DEVICES, GOALS, TASKS, AUTONOMY, CONNS, DATA, PAY, BUDGETS, MODELS},
  estimate,
  set(o){ start=(o.start===undefined?null:o.start); device=(o.device===undefined?'cpu':o.device);
    autonomy=(o.autonomy===undefined?'review':o.autonomy); data=(o.data===undefined?'local':o.data);
    pay=(o.pay===undefined?'rucard':o.pay); budget=(o.budget===undefined?null:o.budget);
    goals=o.goals||[]; tasks=o.tasks||[]; conns=o.conns||[]; }
};
`;
vm.runInContext(js + shim, sandbox, { filename: 'engine.js' });
const Q = sandbox.__qa;
const { STARTS, DEVICES, GOALS, TASKS, AUTONOMY, CONNS, DATA, PAY, BUDGETS, MODELS } = Q.L;
const estimate = Q.estimate;
let fails = [], n = 0;

function set(state) { Q.set(state); }

const base = { device:'cpu', autonomy:'review', data:'local', pay:'rucard', budget:'b' };
const goalIds = GOALS.filter(g=>g.id!=='unsure').map(g=>g.id);
const taskIds = TASKS.map(t=>t.id);
const connIds = CONNS.map(c=>c.id);

// --- R5: полный перебор на краши/NaN/отрицательные ---
const subsets = arr => { const out=[[]]; for (const x of arr){ out.forEach(s=>out.push([...s,x])); } return out; };
const goalSubs = subsets(goalIds), taskSubs = subsets(taskIds), connSubs = subsets(connIds);
for (const st of STARTS) for (const dv of DEVICES) for (const au of AUTONOMY) for (const dt of DATA)
  for (const pay of PAY) for (const bu of BUDGETS) for (const gs of goalSubs) for (const ts of taskSubs) for (const cs of connSubs) {
    n++;
    set({ start:st.id, device:dv.id, autonomy:au.id, data:dt.id, pay:pay.id, budget:bu.id, goals:gs, tasks:ts, conns:cs });
    let e; try { e = estimate(); } catch (err) { fails.push(`CRASH ${st.id}/${dv.id}/${gs}/${ts}: ${err.message}`); continue; }
    if (!e) continue; // guard: не всё выбрано — ок
    if (!isFinite(e.monthly) || e.monthly < 0) fails.push(`BAD monthly=${e.monthly} ${st.id}/${dv.id}/${gs}/${ts}`);
    if (!isFinite(e.hours) || e.hours < 0) fails.push(`BAD hours=${e.hours} ${st.id}/${dv.id}`);
    if (e.modelCost < 0 || e.hostCost < 0 || e.connTotal < 0) fails.push(`NEG parts ${st.id}/${dv.id}`);
  }

// --- монотонность: добавление цели/задачи не понижает цену ---
for (const dv of ['cpu','vps','host','gpu12']) for (const bu of ['b3','b6','b']) {
  set({ ...base, device:dv, budget:bu, start:'nothing', goals:[] , tasks:[]});
  let prev = estimate(); if (!prev) continue;
  for (const g of goalIds) {
    set({ ...base, device:dv, budget:bu, start:'nothing', goals:[g] });
    const cur = estimate();
    if (cur && cur.monthly < prev.monthly - 0.5)
      fails.push(`MONOTONIC goal +${g}: ${prev.monthly} -> ${cur.monthly} (${dv}/${bu})`);
  }
  set({ ...base, device:dv, budget:bu, start:'nothing', goals:['repeat'] });
  prev = estimate();
  for (const t of taskIds) {
    set({ ...base, device:dv, budget:bu, start:'nothing', goals:['repeat'], tasks:[t] });
    const cur = estimate();
    if (cur && cur.monthly < prev.monthly - 0.5)
      fails.push(`MONOTONIC task +${t}: ${prev.monthly} -> ${cur.monthly} (${dv}/${bu})`);
    set({ ...base, device:dv, budget:bu, start:'nothing', goals:['repeat'], tasks:[t,'docs','data','sales','design','video'].filter(x=>x!==t) });
  }
}

// --- инвариант: cpu(облако) <= vps <= host ---
for (const bu of ['b3','b6','b']) for (const dt of ['local','cloud','ru']) {
  const mk = extra => { set({ ...base, budget:bu, data:dt, start:'sub', goals:['repeat'], conns:['tg'], ...extra }); return estimate(); };
  const cpu = mk({ device:'cpu' }), vps = mk({ device:'vps' }), host = mk({ device:'host' });
  if (cpu && vps && host && !(cpu.monthly <= vps.monthly && vps.monthly <= host.monthly))
    fails.push(`INVARIANT cpu<=vps<=host нарушен (${bu}/${dt}): ${cpu.monthly} / ${vps.monthly} / ${host.monthly}`);
}

// --- автономность: больше автономности -> цена не падает и часы не растут ---
set({ ...base, start:'nothing', goals:['repeat','leads','report'] });
let prevH = null;
for (const a of ['draft','review','auto','full']) {
  set({ ...base, start:'nothing', goals:['repeat','leads','report'], autonomy:a });
  const e = estimate();
  if (prevH !== null && e.hours > prevH + 0.5) fails.push(`AUTONOMY hours растут с автономностью при ${a}`);
  prevH = e.hours;
}

// --- свободный сценарий не даёт 0 при платной инфре (утечка цены) ---
set({ ...base, start:'nothing', device:'host', data:'cloud', budget:'b6', goals:['repeat'], conns:['tg'] });
const leak = estimate();
if (leak && leak.monthly === 0) fails.push('LEAK: host+cloud+tg = 0 ₽');

console.log(`комбинаций: ${n}`);
console.log(`провалок: ${fails.length}`);
[...new Set(fails)].slice(0, 40).forEach(f => console.log('  ✗ ' + f));
console.log(fails.length ? 'ПРОВАЛЕН' : 'ПРОЙДЕН');
