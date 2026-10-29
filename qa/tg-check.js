// Проверка паспорта расчёта, который клиент отправляет в Telegram.
// Что гарантируем: в сообщении есть рутина, бэкграунд, стек, ограничения и цифры;
// на iOS ссылка идёт через share-шит (там текст в поле ввода), на Android/десктопе — через ?text=.
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8');

let fails = 0, checks = 0;
function ok(cond, label, extra) {
  checks++;
  if (!cond) { fails++; console.log('  x ' + label + (extra ? ' — ' + extra : '')); }
  else console.log('  + ' + label);
}

function run(ua, scenario) {
  const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/calculator.html', virtualConsole: vc, userAgent: ua });
  const w = dom.window;
  let opened = null;
  w.open = (u) => { opened = u; return null; };
  return new Promise(res => setTimeout(() => {
    w.eval(scenario);
    try { w.eval('calculate()'); } catch (e) {}
    res({ w, getOpened: () => opened, reset: () => { opened = null; } });
  }, 700));
}

const SCEN_IP = 'start="people";device="vps";data="ru";goals=["leads","report"];tasks=[];conns=["tg","crm"];autonomy="auto";budget="b";useGoal="business";taxForm="ip";pay="rucard";';
const SCEN_NEW = 'start="nothing";device="cpu";data="cloud";goals=["write"];tasks=[];conns=["tg"];autonomy="draft";budget="b3";useGoal="business";taxForm="samozan";pay="rucard";';

(async () => {
  const ANDROID = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
  const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';

  /* 1. Android: личка + ?text= */
  let t = await run(ANDROID, SCEN_IP);
  t.w.eval('openInstallChat("integ")');
  let url = decodeURIComponent(t.getOpened() || '');
  let text = url.split('?text=')[1] || '';
  console.log('=== ПАСПОРТ (внедрение ИП, Android) ===');
  console.log(text + '\n');
  console.log('=== длина:', text.length, 'символов, строк:', text.split('\n').length, '\n');
  console.log('Android:');
  ok(url.indexOf('https://t.me/victorpinksight?text=') === 0, 'ссылка открывает личку Виктора с текстом');
  ok(/РУТИНА: Заявки и отклики/.test(text), 'рутина названа');
  ok(/БЭКГРАУНД: .*платишь людям/.test(text), 'бэкграунд: что уже есть и сколько платит');
  ok(/СТЕК: .*Свой сервер \/ VPS \(РФ\)/.test(text) && /модель:/.test(text) && /подключения: Telegram, CRM/.test(text), 'стек: железо, данные, модель, подключения');
  ok(/ОГРАНИЧЕНИЯ: .*статус: В бизнесе — работаю с клиентами, ИП/.test(text) && /бюджет:/.test(text) && /оплата:/.test(text), 'ограничения: статус, бюджет, оплата');
  ok(/ЦИФРЫ: агент забирает ~\d+ ч\/мес из \d+ ч/.test(text) && /владение ~[\d\s]+ ₽\/мес/.test(text), 'цифры: часы, экономия, владение');
  ok(/РЕКОМЕНДАЦИЯ КАЛЬКУЛЯТОРА: ИП\/малый бизнес — 30 000 ₽/.test(text), 'рекомендация с ценой');
  ok(/ДАЛЬШЕ: /.test(text), 'следующий шаг назван');
  ok(text.length < 1600, 'сообщение короче ссылочного лимита', text.length + ' символов');

  /* 2. iOS: share-шит (черновик ?text= теряется) */
  t = await run(IOS, SCEN_IP);
  /* jsdom не принимает userAgent-опцию — подменяем свойство перед вызовом */
  Object.defineProperty(t.w.navigator, 'userAgent', { value: IOS, configurable: true });
  t.reset();
  t.w.eval('openInstallChat("integ")');
  let iosUrl = t.getOpened() || '';
  let iosText = decodeURIComponent(iosUrl.split('&text=')[1] || '');
  console.log('iOS:');
  ok(iosUrl.indexOf('https://t.me/share/url?url=') === 0, 'iOS уходит через share-шит, а не в пустой чат');
  ok(iosText.indexOf('РУТИНА:') > 0 && iosText.indexOf('СТЕК:') > 0, 'в share-тексте тот же паспорт');

  /* 3. Кнопка «Отправить расчёт» в блоке результата */
  t = await run(ANDROID, SCEN_IP);
  t.reset();
  t.w.eval('document.getElementById("orderBtn").click()');
  let btnText = decodeURIComponent((t.getOpened() || '').split('?text=')[1] || '');
  console.log('orderBtn:');
  ok(/РУТИНА:/.test(btnText) && /СТЕК:/.test(btnText) && /РЕКОМЕНДАЦИЯ/.test(btnText), 'CTA результата шлёт тот же паспорт, а не «сколько стоит»');
  ok(/ИП\/малый бизнес — 30 000 ₽/.test(btnText), 'CTA подставляет рекомендованный масштаб (30 000 ₽)');

  /* 4. Диагностика: без выдуманных цифр */
  t = await run(ANDROID, 'start=null;goals=["unsure"];device="cpu";data="cloud";autonomy="review";conns=[];budget="b";');
  t.reset();
  t.w.eval('openDiagChat()');
  let diag = decodeURIComponent((t.getOpened() || '').split('?text=')[1] || '');
  console.log('Диагностика:');
  ok(/РУТИНА: пока не назвал/.test(diag), 'диагностика честно говорит, что процесс не назван');
  ok(!/агент забирает ~0 ч/.test(diag) && !/экономия ~0 ₽/.test(diag), 'нет выдуманных нулей вместо цифр');
  ok(/ДОПОЛНЮ СВОИМИ СЛОВАМИ/.test(diag), 'клиенту предложено дописать своими словами');

  /* 5. Снимок для других страниц (clarity/pay/thanks) */
  t = await run(ANDROID, SCEN_NEW);
  t.reset();
  t.w.eval('openInstallChat("pc")');
  let snap = t.w.eval('localStorage.getItem("ds_brief")');
  console.log('Снимок:');
  ok(!!snap && snap.indexOf('РУТИНА:') > 0, 'паспорт кладётся в localStorage для остальных страниц');


  /* 6. Другие страницы (clarity/pay/thanks): тот же механизм + дописанный паспорт из калькулятора */
  {
    const vc2 = new VirtualConsole(); vc2.on('jsdomError', () => {});
    const brief = 'РУТИНА: Заявки и отклики — со скринингом\\nСТЕК: Свой сервер / VPS (РФ)';
    const cdom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'clarity.html'), 'utf8'), {
      runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/clarity.html', virtualConsole: vc2,
      beforeParse(win) { try { win.localStorage.setItem('ds_brief', JSON.stringify({ ts: Date.now(), offer: 'config', text: brief })); } catch (e) {} }
    });
    await new Promise(r => setTimeout(r, 400));
    const cw = cdom.window;
    Object.defineProperty(cw.navigator, 'userAgent', { value: ANDROID, configurable: true });
    /* jsdom не грузит внешние скрипты — подключаем pay-links.js вручную (как это делает страница) */
    cw.eval(fs.readFileSync(path.join(__dirname, '..', 'pay-links.js'), 'utf8'));
    console.log('Другие страницы:');
    ok(String(cw.eval('dsTgUrl("тест")')).indexOf('https://t.me/victorpinksight?text=') === 0, 'clarity.html: ссылка собирается тем же dsTgUrl');
    Object.defineProperty(cw.navigator, 'userAgent', { value: IOS, configurable: true });
    ok(String(cw.eval('dsTgUrl("тест")')).indexOf('https://t.me/share/url?url=') === 0, 'clarity.html: на iOS тоже share-шит');
    const tgEl = cw.document.querySelector('[data-tg]');
    const href = tgEl ? decodeURIComponent(tgEl.getAttribute('href') || '') : '';
    ok(href.indexOf('https://t.me/victorpinksight?text=') === 0 && href.indexOf('РУТИНА:') > 0, 'кнопка услуги дописывает паспорт из калькулятора');
  }
  console.log('\n' + (fails ? 'ПРОВАЛЕНО ' + fails + ' из ' + checks : 'все ' + checks + ' проверок пройдены'));
  process.exit(fails ? 1 : 0);
})();
