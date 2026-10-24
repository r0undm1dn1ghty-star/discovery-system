// ЭКОНОМИЧЕСКИЙ АУДИТ: сверка выхода движка с расчётом по реальным тарифам.
// Тарифы (research/01-gigachat.md, ₽ за 1 млн токенов, async):
const TARIFF = { lite: 32.5, pro: 250, max: 325 };
// Yandex (research/02-yandex.md): Lite 100, Pro 410 ₽/млн async

// Объёмы токенов в месяц по сценарию (допущения, помечены):
const VOLUME = {
  repeat: { label: 'Ответы на частые вопросы', perMonth: 100*1200*30, note: '100 диалогов/день' },
  leads:  { label: 'Разбор заявок',            perMonth: 50*1500*30,  note: '50 заявок/день' },
  report: { label: 'Регулярный отчёт',         perMonth: 4*30000,     note: '4 отчёта/мес' },
  scan:   { label: 'Сбор информации',          perMonth: 20*3000*30,  note: '20 запросов/день' },
  write:  { label: 'Тексты и посты',           perMonth: 10*4000*4,   note: '10 текстов/нед' },
  paper:  { label: 'Разбор документов',        perMonth: 30*5000,     note: '30 документов/мес' },
};
// какой тариф нужен сценарию (Lite — простые ответы, Pro — сложные)
const TIER = { repeat:'lite', leads:'lite', scan:'lite', report:'pro', write:'pro', paper:'pro' };

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
const sandbox = { console,
  document: { getElementById: (id) => elStub(id), querySelector: () => null, querySelectorAll: () => [],
    addEventListener(){}, createElement: () => elStub(), body: elStub('body') },
  window: { matchMedia: () => ({ matches: false }), open: () => {} },
  sessionStorage: { getItem: () => null, setItem(){} }, localStorage: { getItem: () => null, setItem(){} },
  performance: { now: () => Date.now() }, requestAnimationFrame(){}, setTimeout(){},
  URLSearchParams: class { get(){return null} }, location: { search: '' }, navigator: { userAgent: 'qa' } };
vm.createContext(sandbox);
vm.runInContext(js + `;globalThis.__qa={L:{GOALS},estimate,set(o){start='nothing';device=o.device||'cpu';
  autonomy=o.autonomy||'review';data=o.data||'local';pay='rucard';budget=o.budget||'b';
  goals=o.goals||[];tasks=[];conns=o.conns||[];}};`, sandbox);
const Q = sandbox.__qa;

const tokensFor = (ids) => ids.reduce((s, id) => s + (VOLUME[id] ? VOLUME[id].perMonth : 0), 0);
const costFor = (ids, tariffKey) => ids.reduce((s, id) => {
  const v = VOLUME[id]; if (!v) return s;
  return s + v.perMonth / 1e6 * TARIFF[tariffKey];
}, 0);

console.log('СЦЕНАРИЙ                          токенов/мес   эталон Lite   эталон Pro   движок   отн. Lite   отн. Pro');
console.log('─'.repeat(118));
const rows = [];
for (const id of Object.keys(VOLUME)) {
  const tok = tokensFor([id]);
  const lite = costFor([id], 'lite');
  const pro = costFor([id], 'pro');
  Q.set({ device: 'cpu', data: 'local', goals: [id], budget: 'b' });
  const e = Q.estimate();
  const eng = e ? e.modelCost : NaN;
  const rl = eng / (lite || 1), rp = eng / (pro || 1);
  rows.push({ id, tok, lite, pro, eng, rl, rp, tier: TIER[id] });
  const ref = TIER[id] === 'pro' ? pro : lite;
  console.log(
    (VOLUME[id].label + ' [' + TIER[id] + ']').padEnd(33) +
    (tok / 1e6).toFixed(2).padStart(9) + 'M' +
    lite.toFixed(0).padStart(13) + '₽' +
    pro.toFixed(0).padStart(12) + '₽' +
    String(eng).padStart(9) + '₽' +
    ('×' + (eng / (ref || 1)).toFixed(2)).padStart(12) + '  ← против нужного тарифа'
  );
}

// типовой МСБ: 3 сценария
const typ = ['repeat', 'leads', 'report'];
const tokT = tokensFor(typ);
const liteT = tokT / 1e6 * TARIFF.lite, proT = tokT / 1e6 * TARIFF.pro;
Q.set({ device: 'cpu', data: 'local', goals: typ, budget: 'b' });
const eT = Q.estimate();
console.log('─'.repeat(118));
console.log('ТИПОВОЙ МСБ (3 сценария)'.padEnd(33) + (tokT / 1e6).toFixed(1) + 'M' +
  liteT.toFixed(0).padStart(13) + '₽' + proT.toFixed(0).padStart(12) + '₽' +
  String(eT.modelCost).padStart(9) + '₽' + ('×' + (eT.modelCost / liteT).toFixed(1)).padStart(12) +
  ('×' + (eT.modelCost / proT).toFixed(1)).padStart(11));

console.log('\nВЕРДИКТ (сравнение с тарифом, который нужен сценарию):');
let bad = 0;
rows.forEach(r => {
  const ref = r.tier === 'pro' ? r.pro : r.lite;
  const ratio = r.eng / (ref || 1);
  if (ratio > 1.15 || ratio < 0.85) { bad++; console.log('  ✗ ' + r.id + ': движок ' + r.eng + '₽ против эталона ' + ref.toFixed(0) + '₽ (×' + ratio.toFixed(2) + ')'); }
});
console.log(bad ? 'РАСХОЖДЕНИЙ: ' + bad : '  ✓ все сценарии совпадают с тарифом (±15%)');
