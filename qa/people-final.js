// Финальная проверка: таблица людей, напоминания, демо-гейтинг
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
let opened = null;
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
dom.window.open = (u) => { opened = u; return null; };
const w = dom.window;
setTimeout(() => {
  w.eval('start="people";device="vps";data="ru";goals=["leads","remind"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (e) { console.log('calculate err:', e.message); }
  const h = w.document.getElementById('heroCompare');
  console.log('=== ТАБЛИЦА (люди + напоминания) ===');
  console.log(h.textContent.replace(/\s+/g, ' ').trim().slice(0, 300));
  w.eval('openTg("demo")');
  const txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  const lines = txt.split('\n');
  console.log('\n=== ДЕМО: последняя строка ===');
  console.log(lines[lines.length - 1]);
  process.exit(0);
}, 700);
