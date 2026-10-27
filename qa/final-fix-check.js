// Проверка фиксов финального экрана: заглушка удалена, «чистыми» показывается, done-шаги
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  w.eval('start="sub";goals=["repeat"];conns=["tg"];goStep(5)');
  const d = w.document;
  console.log('01 livebar-заглушка удалена:', d.getElementById('livebar') ? 'ЕЩЁ ЕСТЬ' : 'ok');
  const sv = d.getElementById('ahaSaving').textContent;
  console.log('02 «чистыми после владения» показано:', sv.includes('чистыми после владения') ? 'ok' : 'FAIL');
  console.log('03 текст:', sv.trim().slice(0, 150));
  console.log('04 done-шагов из 4 пройденных:', [...d.querySelectorAll('.wp')].filter(b => b.classList.contains('done')).length);
  process.exit(0);
}, 800);
