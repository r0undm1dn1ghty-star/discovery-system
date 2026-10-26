// Изоляция: где виснет? Проверяем чанками в vm без DOM
const fs = require('fs'), vm = require('vm');
const js = fs.readFileSync(__dirname + '/engine.js', 'utf8');
console.log('движок прочитан:', js.length, 'символов');
// Инструментируем: логируем каждую top-level функцию вызова? Проще: определить виснущую строку через вставку логов.
// Быстрый тест: пустой DOM-стаб + прогон только инициализации
const elCache = new Map();
const elStub = (id) => {
  if (id && elCache.has(id)) return elCache.get(id);
  const el = { id, style: {}, classList: { add(){}, remove(){}, toggle(){} }, textContent: '', innerHTML: '',
    addEventListener(){}, appendChild(){}, setAttribute(){}, value: '400', children: [] };
  if (id) elCache.set(id, el);
  return el;
};
const sandbox = { console,
  document: { getElementById: (id) => elStub(id), querySelector: () => null, querySelectorAll: () => [],
    addEventListener(){}, createElement: () => elStub(), body: elStub('body') },
  window: { matchMedia: () => ({ matches: false }), open: () => {} },
  sessionStorage: { getItem: () => null, setItem(){} }, localStorage: { getItem: () => null, setItem(){} },
  performance: { now: () => Date.now() }, requestAnimationFrame(){}, setTimeout(){},
  URLSearchParams: class { get(){return null} }, location: { search: '' }, navigator: { userAgent: 'qa' } };
vm.createContext(sandbox);
console.log('запуск движка...');
const t0 = Date.now();
try {
  vm.runInContext(js, sandbox, { filename: 'engine.js', timeout: 8000 });
  console.log('инициализация OK за', Date.now() - t0, 'мс');
} catch (e) {
  console.log('ОШИБКА/ТАЙМАУТ:', e.message);
}
// Если инициализация прошла — тапаем цели и смотрим, где виснет
try {
  const probe = `
;globalThis.__p = { set(o){ start=(o.start===undefined?null:o.start); device=(o.device||'cpu');
    data=(o.data||'cloud'); autonomy=(o.autonomy||'review'); budget='b'; pay='rucard';
    goals=o.goals||[]; tasks=o.tasks||[]; conns=o.conns||[]; }, estimate, toggleGoal, calculate };
`;
  vm.runInContext(probe, sandbox, { filename: 'probe.js' });
  console.log('probe OK');
  const steps = [['leads'], ['leads','remind'], ['leads','remind','report']];
  for (const g of steps) {
    const t1 = Date.now();
    vm.runInContext(`__p.set({device:'vps',data:'ru',goals:${JSON.stringify(g)},conns:['tg']}); calculate();`, sandbox, { timeout: 8000 });
    console.log('goals', JSON.stringify(g), '→', Date.now() - t1, 'мс');
  }
  const t2 = Date.now();
  vm.runInContext(`__p.set({device:'vps',data:'ru',goals:['leads'],conns:['tg']}); toggleGoal('remind');`, sandbox, { timeout: 8000 });
  console.log('toggleGoal remind →', Date.now() - t2, 'мс');
} catch (e) {
  console.log('PROBE ОШИБКА:', e.message);
}
process.exit(0);
