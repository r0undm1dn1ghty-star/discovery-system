// QA-экономика (R6–R8): проверки, которых НЕ было в qa-v2.
// qa-v2 ловит поломки и монотонность, но пропускает «скидку за объём» и плоский хостинг.
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
    querySelectorAll: () => [], addEventListener(){}, createElement: () => elStub(), body: elStub('body') },
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
};`;
vm.runInContext(js + shim, sandbox, { filename: 'engine.js' });
const Q = sandbox.__qa;
const { GOALS, TASKS, DEVICES, AUTONOMY } = Q.L;
const fails = [];

const goalIds = GOALS.filter(g => g.id !== 'unsure').map(g => g.id);
const taskIds = TASKS.map(t => t.id);
const est = (o) => { Q.set(Object.assign({ budget: 'b' }, o)); return Q.estimate(); };

// ── R6: НЕТ СКИДКИ ЗА ОБЪЁМ ──
// Цена модели за функцию не должна падать при добавлении функций.
// Раньше было m.cost*(0.6+0.4n): 1 функция = 291 ₽, 6 функций = 145 ₽/шт (скидка ×1.9).
for (const dv of ['cpu', 'host', 'vps']) {
  for (const au of AUTONOMY.map(a => a.id)) {
    let prevPerFn = null;
    for (let n = 1; n <= goalIds.length; n++) {
      const e = est({ device: dv, data: dv === 'vps' ? 'ru' : 'local', autonomy: au, goals: goalIds.slice(0, n) });
      if (!e || !e.modelCost) continue;
      const perFn = e.modelCost / n;
      if (prevPerFn !== null && perFn < prevPerFn * 0.85) {
        fails.push(`R6 СКИДКА ЗА ОБЪЁМ: ${dv}/${au} n=${n} — ${perFn.toFixed(0)} ₽/функция против ${prevPerFn.toFixed(0)} ₽ на n-1`);
        break;
      }
      prevPerFn = perFn;
    }
  }
}

// ── R7: ХОСТИНГ РАСТЁТ С ЧИСЛОМ АГЕНТОВ ──
// Плоский хостинг = 6 агентов на одной VPS по цене одного.
for (const dv of ['host', 'vps']) {
  let prevHost = -1;
  for (let n = 1; n <= goalIds.length; n++) {
    const e = est({ device: dv, data: 'cloud', goals: goalIds.slice(0, n) });
    if (!e) continue;
    if (e.hostCost < prevHost - 0.5) fails.push(`R7 ХОСТИНГ ПАДАЕТ: ${dv} n=${n} — ${e.hostCost} < ${prevHost}`);
    prevHost = e.hostCost;
  }
  const big = est({ device: dv, data: 'cloud', goals: goalIds.slice(0, 5) });
  if (big && big.hostCost < 3000) fails.push(`R7 ХОСТИНГ НЕДОСЧЁТ: ${dv}, 5+ агентов — ${big.hostCost} ₽ (нужно ≥3000: 16 ГБ)`);
}

// ── R8: СВОЙ VPS НЕ БЕСПЛАТНЫЙ ──
// device='vps' раньше давал hostCost=0: клиент видел связку на 2190 ₽ дешевле, чем она стоит.
const own = est({ device: 'vps', data: 'ru', goals: ['repeat'] });
if (own && own.hostCost < 1000) fails.push(`R8 СВОЙ VPS БЕСПЛАТНЫЙ: hostCost=${own.hostCost} (сервер — реальные деньги)`);

// ── R9: TELEGRAM НА РФ-ХОСТИНГЕ ТРЕБУЕТ ШЛЮЗА ──
// api.telegram.org из дата-центров РФ не отвечает (ТСПУ с 03.2026).
for (const dv of ['host', 'vps']) {
  const withTg = est({ device: dv, data: 'ru', goals: ['repeat'], conns: ['tg'] });
  const noTg = est({ device: dv, data: 'ru', goals: ['repeat'], conns: [] });
  if (withTg && noTg && withTg.hostCost <= noTg.hostCost)
    fails.push(`R9 НЕТ ШЛЮЗА ДЛЯ TG: ${dv} — с TG ${withTg.hostCost} = без TG ${noTg.hostCost}`);
}

// ── R10: ВИЛКА СОВПАДАЕТ С РЕСЁРЧЕМ ──
// scenario-map-v3-FINAL.md: локально 150–500, VPS 2000–3500 (с TG), 5 агентов 3800–7500.
const local = est({ device: 'cpu', data: 'local', goals: ['repeat'] });
if (local && (local.monthly < 100 || local.monthly > 600)) fails.push(`R10 ЛОКАЛЬНО вне вилки 100–600: ${local.monthly}`);
const vpsTg = est({ device: 'host', data: 'ru', goals: ['repeat', 'leads'], conns: ['tg'] });
if (vpsTg && (vpsTg.monthly < 1800 || vpsTg.monthly > 4500)) fails.push(`R10 VPS+TG вне вилки 1800–4500: ${vpsTg.monthly}`);

console.log(`экономических проверок: R6 скидка · R7 хостинг · R8 свой VPS · R9 шлюз TG · R10 вилка ресёрча`);
console.log(`провалок: ${fails.length}`);
[...new Set(fails)].slice(0, 30).forEach(f => console.log('  ✗ ' + f));
console.log(fails.length ? 'ПРОВАЛЕН' : 'ПРОЙДЕН');
process.exit(fails.length ? 1 : 0);
