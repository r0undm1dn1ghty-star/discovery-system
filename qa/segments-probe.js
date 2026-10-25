// Что видит КАЖДЫЙ сегмент на экране результата — сравнение
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8');

const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
  url: 'https://discovery-system.ru/calculator.html', virtualConsole: vc });
const w = dom.window;

const SEGMENTS = [
  { name: 'Новичок с нуля',        code: 'start="nothing"; device="cpu"; data="local"; goals=["repeat"]; tasks=[]; conns=[]; autonomy="review"; budget="b3";' },
  { name: 'Уходит с подписки',     code: 'start="sub"; device="cpu"; data="cloud"; goals=["repeat","leads"]; tasks=[]; conns=["tg"]; autonomy="review"; budget="b6";' },
  { name: 'ИП с командой',         code: 'start="people"; device="vps"; data="ru"; goals=["leads","report"]; tasks=["sales"]; conns=["tg","crm"]; autonomy="auto"; budget="b";' },
  { name: 'Есть железо',           code: 'start="hardware"; device="gpu12"; data="local"; goals=["write"]; tasks=["text"]; conns=[]; autonomy="draft"; budget="b";' },
  { name: 'Связка сломана',        code: 'start="legacy"; device="host"; data="cloud"; goals=["paper"]; tasks=["docs"]; conns=["tg"]; autonomy="review"; budget="b";' },
];

setTimeout(() => {
  for (const seg of SEGMENTS) {
    w.eval('start=null;device="cpu";data="cloud";pay="rucard";budget=null;goals=[];tasks=[];conns=[];autonomy="review";');
    try { w.eval(seg.code); } catch (e) { console.log(seg.name + ': ОШИБКА ' + e.message); continue; }
    try { w.eval('calculate()'); } catch (e) { /* scrollIntoView в jsdom */ }

    const t = id => { const el = w.document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : '—'; };
    const offers = [...w.document.querySelectorAll('.offer-opt[data-prod]')].map(el => {
      const inMore = !!el.closest('#offerMore');
      return el.getAttribute('data-prod') + (el.classList.contains('recommended') ? '*' : '') + (inMore ? '(свёрнут)' : '');
    });
    const more = w.document.getElementById('offerMore');
    const moreSum = more ? more.querySelector('summary').textContent.trim() : '—';

    console.log('\n════ ' + seg.name + ' ════');
    console.log('заголовок: ' + t('ahaTitle').slice(0, 90));
    console.log('цифра:     ' + t('ahaCost'));
    console.log('экономия:  ' + t('ahaSaving').slice(0, 70));
    console.log('разбивка:  ' + t('brkTable').slice(0, 90));
    console.log('офферы:    ' + offers.join(', '));
    console.log('свёрнуто:  ' + moreSum);
    console.log('персона:   ' + t('personaWhy').slice(0, 80));
  }
  process.exit(0);
}, 700);
