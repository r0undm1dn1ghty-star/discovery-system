// Проверка: демо убрано, fallback demo→config, бриф диагностики из 5 строк
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
let opened = null;
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
dom.window.open = (u) => { opened = u; return null; };
const w = dom.window;
setTimeout(() => {
  w.eval('start="new";device="vps";data="ru";goals=["leads"];tasks=[];conns=["tg"];autonomy="auto";budget="b";');
  try { w.eval('calculate()'); } catch (e) { console.log('calc err:', e.message); }
  console.log('демо-кнопок в DOM:', (w.document.body.innerHTML.match(/openTg\(.demo./g) || []).length);
  w.eval('openTg("demo")');
  let txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  console.log('fallback demo→config:', txt.split('\n')[0]);
  opened = null; w.eval('openDiagChat()');
  txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  console.log('--- БРИФ (лайниры) ---');
  txt.split('\n').filter(l => l.startsWith('•')).forEach(l => console.log(l));
  console.log('NEXT:', txt.split('\n').slice(-1)[0]);
  process.exit(0);
}, 700);
