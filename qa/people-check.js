// Проверка: детальное сравнение «человек vs агент» + демо-запрос
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
let opened = null;
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
dom.window.open = (u) => { opened = u; return null; };
const w = dom.window;
setTimeout(() => {
  w.eval('start="people";device="vps";data="ru";goals=["leads","report"];tasks=[];conns=["tg","crm"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (e) {}
  const h = w.document.getElementById('heroCompare');
  console.log('=== СРАВНЕНИЕ (детальное) ===');
  console.log(h.textContent.replace(/\s+/g, ' ').trim());
  w.eval('openTg("demo")');
  const txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  console.log('\n=== ДЕМО-ЗАПРОС ===');
  console.log(txt);
  process.exit(0);
}, 700);
