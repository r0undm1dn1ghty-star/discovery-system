// Проверка в реальном DOM (jsdom): страница грузится, движок работает, цены рендерятся
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));

const html = fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: undefined,           // внешние скрипты не тянем
  pretendToBeVisual: true,
  url: 'https://discovery-system.ru/calculator.html',
  virtualConsole: new (require(path.join(__dirname, '..', 'node_modules', 'jsdom')).VirtualConsole)()
    .on('jsdomError', e => errors.push('jsdomError: ' + e.message))
    .on('error', (...a) => errors.push('console.error: ' + a.join(' ')))
});

const w = dom.window;

setTimeout(() => {
  const out = [];
  out.push('ошибки загрузки: ' + (errors.length ? errors.join(' | ') : 'нет'));

  // состояние живёт в лексическом скоупе скрипта — ставим через eval в глобальном контексте
  const run = (code) => w.eval(code);

  out.push('движок доступен: ' + (typeof w.estimate === 'function'));

  const scenario = (label, code) => {
    try {
      run(code);
      const e = run('estimate()');
      if (!e) { out.push(label + ': null'); return null; }
      out.push(label + ': ' + e.monthly + ' ₽/мес (модель ' + e.modelCost + ', хост ' + e.hostCost + ', подкл ' + e.connTotal + ')');
      return e;
    } catch (err) { out.push(label + ': ОШИБКА ' + err.message); return null; }
  };

  const base = 'start="nothing"; autonomy="review"; pay="rucard"; budget="b"; tasks=[]; conns=[];';
  const e1 = scenario('1 функция локально', base + 'device="cpu"; data="local"; goals=["repeat"];');
  const e3 = scenario('3 функции + аренда + TG', base + 'device="host"; data="cloud"; goals=["repeat","leads","report"]; conns=["tg"];');
  const e5 = scenario('5 функций + аренда + TG', base + 'device="host"; data="cloud"; goals=["repeat","leads","report","scan","write"]; conns=["tg"];');
  const e6 = scenario('6 функций + аренда', base + 'device="host"; data="cloud"; goals=["repeat","leads","report","scan","write","paper"];');
  const evps = scenario('свой VPS + TG', base + 'device="vps"; data="ru"; goals=["repeat"]; conns=["tg"];');

  if (e1 && e5) {
    const p1 = e1.modelCost, p5 = e5.modelCost / 5;
    out.push('цена модели за функцию: 1→' + p1 + '₽, 5→' + p5.toFixed(0) + '₽ ' + (p5 >= p1 * 0.85 ? '✓ без скидки' : '✗ СКИДКА'));
    out.push('хостинг растёт: ' + (e5.hostCost > e1.hostCost ? '✓ ' + e1.hostCost + '→' + e5.hostCost : '✗ не растёт'));
  }
  if (evps) out.push('свой VPS не бесплатный: ' + (evps.hostCost > 0 ? '✓ ' + evps.hostCost + '₽' : '✗ 0₽'));

  // рендер результата в DOM
  try { run('calculate()'); } catch (err) { out.push('calculate() упал: ' + err.message); }
  const txt = id => { const el = w.document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : 'нет элемента'; };
  out.push('DOM #ahaCost: ' + txt('ahaCost'));
  out.push('DOM #livePrice: ' + txt('livePrice'));
  out.push('DOM разбивка: ' + txt('brkTable').slice(0, 140));
  out.push('DOM подпись хостинга: ' + (txt('brkTable').includes('шлюз') ? '✓ шлюз показан' : 'шлюз не показан'));

  console.log(out.join('\n'));
  process.exit(0);
}, 700);
