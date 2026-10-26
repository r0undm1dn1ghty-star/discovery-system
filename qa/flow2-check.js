// Проверка 2-шагового флоу после рефакторинга
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  const t = id => { const el = w.document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : '—'; };
  console.log('N=2, nextBtn:', w.document.getElementById('nextBtn').textContent);
  // шаг 2: цели + автономность + бюджет на одном экране
  w.eval('start="people"; device="vps"; data="ru"; goals=["leads","report"]; tasks=[]; conns=["tg","crm"]; autonomy="auto"; budget="b";');
  try { w.eval('calculate()'); } catch (e) {}
  console.log('цифра:', t('ahaCost'));
  console.log('экономика:', t('ahaSaving').slice(0, 80));
  console.log('шаги:', t('stepsCount'));
  const auto = w.document.getElementById('autoOpts');
  console.log('автономность на шаге 2:', auto ? (auto.children.length + ' кнопок') : 'НЕТ');
  // кап: попытка 4-й цели
  w.eval('toggleGoal("scan")');
  console.log('после 4-й цели: goals =', w.eval('goals.join(",")'));
  process.exit(0);
}, 700);
