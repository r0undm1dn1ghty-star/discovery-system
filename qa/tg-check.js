// Проверка TG-сообщения: перехват window.open и вывод текста
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
  w.eval('openInstallChat("integ")');
  const txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  console.log('=== TG-СООБЩЕНИЕ (внедрение ИП) ===');
  console.log(txt);
  console.log('=== длина:', txt.length, 'символов, строк:', txt.split('\n').length);
  // второй сценарий: гайд
  opened = null;
  w.eval('chosenOffer="table"; openChat(false);');
  const t2 = decodeURIComponent((opened || '').split('?text=')[1] || '');
  console.log('\n=== TG-СООБЩЕНИЕ (гайд) ===');
  console.log(t2.slice(0, 400));
  process.exit(0);
}, 700);
