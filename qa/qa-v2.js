// QA-харнесс движка калькулятора (методика discovery-config-calculator)
// Сетка: синглы (все состояния) + пары (сокращённая сетка). Проверки: краши/NaN/отрицательные,
// монотонность цены, инвариант cpu<=vps<=host, утечки 0 ₽, автономность.
const fs = require('fs'), vm = require('vm');
const js = fs.readFileSync(__dirname + '/engine.js', 'utf8');

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
const set = s => Q.set(s);

let fails = [], n = 0;
const subsets = (arr, max) => { const out=[[]]; for (const x of arr){ const cur=out.length; for(let i=0;i<cur;i++) if(out[i].length<max) out.push([...out[i],x]); } return out; };
const goalIds = GOALS.filter(g=>g.id!=='unsure').map(g=>g.id);
const taskIds = TASKS.map(t=>t.id);
const connIds = CONNS.map(c=>c.id);

// --- A: синглы на ПОЛНОЙ сетке состояний ---
const g1 = subsets(goalIds,1), t1 = subsets(taskIds,1), c1 = subsets(connIds,1);
for (const st of STARTS) for (const dv of DEVICES) for (const au of AUTONOMY) for (const dt of DATA)
  for (const pay of PAY) for (const bu of BUDGETS) for (const gs of g1) for (const ts of t1) for (const cs of c1) {
    n++;
    set({ start:st.id, device:dv.id, autonomy:au.id, data:dt.id, pay:pay.id, budget:bu.id, goals:gs, tasks:ts, conns:cs });
    let e; try { e = estimate(); } catch (err) { fails.push(`CRASH ${st.id}/${dv.id}/${gs}/${ts}: ${err.message}`); continue; }
    if (!e) continue;
    if (!isFinite(e.monthly) || e.monthly < 0) fails.push(`BAD monthly=${e.monthly} ${st.id}/${dv.id}/${gs}/${ts}`);
    if (!isFinite(e.hours) || e.hours < 0) fails.push(`BAD hours ${st.id}/${dv.id}/${au.id}`);
    if (e.modelCost < 0 || e.hostCost < 0 || e.connTotal < 0) fails.push(`NEG parts ${st.id}/${dv.id}`);
  }

// --- B: пары подмножеств на сокращённой сетке ---
const g2 = subsets(goalIds,2), t2 = subsets(taskIds,2), c2 = subsets(connIds,2);
const DVS = ['cpu','host','vps','gpu12'], AUS = ['review','full'], DTS = ['local','cloud'], BUS = ['b3','b'], STS = ['nothing','sub'];
for (const st of STS) for (const dv of DVS) for (const au of AUS) for (const dt of DTS) for (const bu of BUS)
  for (const gs of g2) for (const ts of t2) for (const cs of c2) {
    n++;
    set({ start:st, device:dv, autonomy:au, data:dt, pay:'rucard', budget:bu, goals:gs, tasks:ts, conns:cs });
    let e; try { e = estimate(); } catch (err) { fails.push(`CRASH-B ${st}/${dv}/${gs}: ${err.message}`); continue; }
    if (!e) continue;
    if (!isFinite(e.monthly) || e.monthly < 0) fails.push(`BAD-B monthly=${e.monthly} ${st}/${dv}/${gs}/${ts}/${cs}`);
  }

// --- монотонность: добавление цели/задачи не понижает цену ---
for (const dv of DVS) for (const bu of BUS) {
  set({ device:dv, autonomy:'review', data:'local', pay:'rucard', budget:bu, start:'nothing', goals:[], tasks:[], conns:[] });
  const empty = estimate(); const baseM = empty ? empty.monthly : 0;
  for (const g of goalIds) {
    set({ device:dv, budget:bu, start:'nothing', goals:[g], tasks:[], conns:[] });
    const cur = estimate();
    if (cur && cur.monthly < baseM - 0.5)
      fails.push(`MONO цель +${g}: ${baseM} -> ${cur.monthly} (${dv}/${bu})`);
  }
  set({ device:dv, budget:bu, start:'nothing', goals:['repeat'], tasks:[], conns:[] });
  const one = estimate(); const oneM = one ? one.monthly : 0;
  for (const t of taskIds) {
    set({ device:dv, budget:bu, start:'nothing', goals:['repeat'], tasks:[t], conns:[] });
    const cur = estimate();
    if (cur && cur.monthly < oneM - 0.5)
      fails.push(`MONO задача +${t}: ${oneM} -> ${cur.monthly} (${dv}/${bu})`);
  }
}

// --- инвариант (скилл): свой сервер не дешевле ПК при равных данных; аренда >= свой сервер ---
// cpu сравниваем с data=local (нет отдельной статьи за чужое облако), vps/host — с их семантикой данных
for (const bu of BUS) for (const dt of ['local','ru']) for (const cs of [[],['tg'],['tg','bot']]) {
  const mk = (dev, d) => { set({ device:dev, autonomy:'review', data:d, pay:'rucard', budget:bu, start:'sub', goals:['repeat'], tasks:[], conns:cs }); return estimate(); };
  const cpu = mk('cpu','local'), vps = mk('vps',dt), host = mk('host',dt==='local'?'cloud':dt);
  if (cpu && vps && host && !(cpu.monthly <= vps.monthly && vps.monthly <= host.monthly))
    fails.push(`INVARIANT cpu<=vps<=host (${bu}/${dt}/${cs}): ${cpu.monthly} / ${vps.monthly} / ${host.monthly}`);
}

// --- автономность: цена не падает с ростом автономности (больше работы агенту = дороже) ---
let prevM = null;
for (const a of ['draft','review','auto','full']) {
  set({ device:'cpu', autonomy:a, data:'local', pay:'rucard', budget:'b', start:'nothing', goals:['repeat','leads','report'], tasks:['docs'], conns:[] });
  const e = estimate();
  if (prevM !== null && e && e.monthly < prevM - 0.5) fails.push(`AUTONOMY цена падает при ${a}: ${prevM} -> ${e.monthly}`);
  if (e) prevM = e.monthly;
}

// --- утечки цены: платная инфра не должна давать 0 ---
const leaks = [
  { start:'nothing', device:'host', data:'cloud', budget:'b6', goals:['repeat'], conns:['tg'] },
  { start:'sub', device:'host', data:'cloud', budget:'b6', goals:['repeat','leads'], conns:['tg','bot'] },
  { start:'nothing', device:'vps', data:'ru', budget:'b', goals:['report'], conns:['tg'] },
];
for (const s of leaks) {
  set({ ...s, autonomy:'review', pay:'rucard', tasks:[], conns:s.conns });
  const e = estimate();
  if (e && e.monthly === 0) fails.push(`LEAK 0₽: ${JSON.stringify(s)}`);
}

console.log(`комбинаций: ${n}`);
console.log(`провалок: ${fails.length}`);
[...new Set(fails)].slice(0, 50).forEach(f => console.log('  ✗ ' + f));
console.log(fails.length ? 'ПРОВАЛЕН' : 'ПРОЙДЕН');
