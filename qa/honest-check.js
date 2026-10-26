// Финальная проверка честных цифр после фиксов роя: РФ-хостинг, железо, люди, окупаемость
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  // A) cpu + РФ-сервер: раньше 417 ₽ (недосчёт), теперь хостинг входит
  w.eval('start="new";device="cpu";data="ru";goals=["repeat"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('A err:', err.message); }
  const eA = w.eval('JSON.stringify(estimate())');
  const a = JSON.parse(eA);
  console.log('A) cpu/ru: monthly =', a.monthly, '(хост', a.hostCost, '+ шлюз', a.gateway, '+ модель', a.modelCost + ')');
  // B) hardware + облако: раньше «Провайдеру 0 ₽», теперь реальные расходы
  w.eval('start="hardware";device="cpu";data="cloud";goals=["repeat"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('B err:', err.message); }
  const hb = w.document.getElementById('heroCompare');
  console.log('B) hardware hero:', hb.textContent.replace(/\s+/g, ' ').trim().slice(0, 150));
  // C) people: разница по доле рутины, не вся зарплата
  w.eval('start="people";device="vps";data="ru";goals=["leads","remind"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (err) { console.log('C err:', err.message); }
  const hp = w.document.getElementById('heroCompare');
  console.log('C) people:', hp.textContent.replace(/\s+/g, ' ').trim().slice(0, 300));
  // D) 60К кнопка существует и ведёт на ссылку
  const btn = w.document.querySelector('[data-tier="mid"]');
  console.log('D) кнопка 60К:', btn ? btn.textContent.trim() : 'ОТСУТСТВУЕТ');
  process.exit(0);
}, 700);
