// Проверка фиксов по итогам роя: РФ-хостинг, hardware-ветка, люди-таблица
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
let opened = null;
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
dom.window.open = (u) => { opened = u; return null; };
const w = dom.window;
setTimeout(() => {
  // Сценарий A: cpu + РФ-сервер — раньше 417 ₽ (недосчёт), должно стать ~1517 ₽
  w.eval('start="new";device="cpu";data="ru";goals=["repeat"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('calc A err:', err.message); }
  console.log('A) cpu/ru: monthly =', w.eval('estimate().monthly'), '(эталон ~1517: 117 модель + 1100 хост + 300 шлюз)');
  // Сценарий B: hardware + облако — раньше «Провайдеру 0 ₽», должно показывать реальную сумму
  w.eval('start="hardware";device="cpu";data="cloud";goals=["repeat"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('calc B err:', err.message); }
  const hb = w.document.getElementById('heroCompare');
  console.log('B) hardware hero:', hb.textContent.replace(/\s+/g, ' ').trim().slice(0, 220));
  // Сценарий C: people — разница теперь по доле рутины
  w.eval('start="people";device="vps";data="ru";goals=["leads","remind"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('calc C err:', err.message); }
  const hp = w.document.getElementById('heroCompare');
  console.log('C) people таблица:', hp.textContent.replace(/\s+/g, ' ').trim().slice(0, 360));
  process.exit(0);
}, 700);
