// Проверка выбора автономности: тап по карточке переключает .on и маркер
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  w.eval('start="people";pickOption();goals=["leads"];');
  w.eval('goStep(3)');
  const d = w.document;
  const name = (c) => c.querySelector('.ac-t').textContent;
  const on0 = d.querySelector('#autoOpts .auto-card.on');
  console.log('до тапа выбрана:', on0 ? name(on0) : '—');
  w.eval('setAuto("full")');
  const cards = [...d.querySelectorAll('#autoOpts .auto-card')];
  const sel = cards.filter(c => c.classList.contains('on')).map(name);
  console.log('после тапа «Полная» выбрана:', sel.join(',') || 'НИЧЕГО');
  console.log('выбрана ровно одна:', sel.length === 1 ? 'ok' : 'FAIL');
  console.log('aria-pressed у выбранной:', cards.find(c => c.classList.contains('on'))?.getAttribute('aria-pressed'));
  console.log('маркер-точка есть:', cards.find(c => c.classList.contains('on'))?.querySelector('.ac-dot') ? 'ok' : 'FAIL');
  process.exit(0);
}, 800);
