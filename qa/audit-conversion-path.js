// Аудит 20 — критический путь конверсии: 6 полных путей (линза × старт × цели × статус)
// + CTA-пробы, buildTgText (все ветки), платёжные ссылки, согласованность линз.
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const HTML = fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8');
// живые ссылки из pay-links.js (verbatim) — jsdom не грузит внешние скрипты
const LINKS = {
  guide: 'https://auth.robokassa.ru/merchant/Invoice/GEV6reyqiEWXzYG_Mkulbw?p=guide',
  build: 'https://auth.robokassa.ru/merchant/Invoice/RjF3Mh-GhUmFIiCWVxkMFA?p=build',
  pc: 'https://auth.robokassa.ru/merchant/Invoice/xp2UNX65i0GBewjBqkgJOw',
  self: 'https://auth.robokassa.ru/merchant/Invoice/AuPs4sLt3USvwXypMewUDw?p=self',
  smb: 'https://auth.robokassa.ru/merchant/Invoice/jjPrDM9xSkK1qKCLSGB-MA?p=smb',
  mid: 'https://auth.robokassa.ru/merchant/Invoice/ga2H8Nr6zUadphD3DvygDQ?p=mid',
  optimize: 'https://auth.robokassa.ru/merchant/Invoice/qCJpZ0vYGUaNVkfbhMj7og?p=optimize'
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
function makeDom() {
  const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
  return new JSDOM(HTML, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://discovery-system.ru/calculator.html', virtualConsole: vc });
}
function instrument(w) {
  w.eval(`
    window.__clicks=[];window.__toasts=[];window.__opens=[];window.__scrolls=0;
    const __origToast=toast; window.toast=function(m){window.__toasts.push(m);__origToast(m);};
    window.open=function(u){window.__opens.push(String(u));return null;};
    if(!Element.prototype.scrollIntoView)Element.prototype.scrollIntoView=function(){};
    const __siv=Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView=function(){window.__scrolls++;try{__siv.apply(this,arguments)}catch(e){}};
    window.scrollTo=function(){window.__scrolls++;};
    const __click=HTMLElement.prototype.click;
    HTMLElement.prototype.click=function(){try{window.__clicks.push((this.id?'#'+this.id:this.tagName+':'+(this.textContent||'').trim().replace(/\\s+/g,' ').slice(0,38)));}catch(e){}return __click.apply(this,arguments);};
  `);
}
function injectLinks(w) {
  w.eval(`window.PAY_LINK_ROBOKASSA_GUIDE='${LINKS.guide}';window.PAY_LINK_ROBOKASSA_BUILD='${LINKS.build}';
  window.PAY_LINK_ROBOKASSA_INSTALL_PC='${LINKS.pc}';window.PAY_LINK_ROBOKASSA_INSTALL_VPS='${LINKS.self}';
  window.PAY_LINK_ROBOKASSA_INSTALL_INTEG='${LINKS.smb}';window.PAY_LINK_ROBOKASSA_INSTALL_MID='${LINKS.mid}';
  window.PAY_LINK_ROBOKASSA_OPTIMIZATION='${LINKS.optimize}';`);
}
function clickText(w, sel, text) {
  const els = [...w.document.querySelectorAll(sel)];
  const el = els.find(e => (e.textContent || '').includes(text));
  if (!el) return 'НЕ НАЙДЕН: ' + sel + ' «' + text + '»';
  el.click(); return null;
}
function snap(w, tag, log) {
  const d = w.document;
  const vis = id => { const e = d.getElementById(id); return e ? (e.hidden ? 0 : 1) : -1; };
  log.push({ at: tag, step: w.eval('wizStep'), toasts: w.__toasts.slice(), opens: w.__opens.length,
    price: (d.getElementById('livePrice') || {}).textContent || '', next1: (d.getElementById('next1') || {}).disabled,
    next2: (d.getElementById('next2') || {}).disabled });
}
async function runPath(spec) {
  const w = makeDom().window; instrument(w); injectLinks(w);
  await sleep(700);
  const d = w.document, log = { name: spec.name, timeline: [], taps: [], toasts: [], opens: [], scrolls: 0, finals: {}, notes: [] };
  try {
    for (const a of spec.actions) {
      let err = null;
      if (a.lens) err = clickText(w, '.lens-switch button', a.lens);
      else if (a.start) err = clickText(w, '#startOpts .opt', a.start);
      else if (a.sub) err = clickText(w, '#subPick .opt', a.sub);
      else if (a.use) err = clickText(w, '#useOpts .pill', a.use);
      else if (a.tax) err = clickText(w, '#taxOpts .pill', a.tax);
      else if (a.goal) err = clickText(w, '#goalOpts .opt', a.goal);
      else if (a.auto) err = clickText(w, '#autoOpts .auto-card', a.auto);
      else if (a.conn) err = clickText(w, '#connChips button', a.conn);
      else if (a.device) err = clickText(w, '#deviceOpts .opt', a.device);
      else if (a.data) err = clickText(w, '#dataOpts .opt', a.data);
      else if (a.payopt) err = clickText(w, '#payOpts .opt', a.payopt);
      else if (a.click) { const el = d.querySelector(a.click); if (el) el.click(); else err = 'НЕ НАЙДЕН ' + a.click; }
      if (err) log.notes.push(err);
      if (a.snap !== false) snap(w, a.lens || a.start || a.goal || a.click || a.sub || a.use || a.tax || a.auto || a.conn || a.device || a.data || a.payopt || '?', log.timeline);
      await sleep(30);
    }
    // финальное состояние
    const rec = d.querySelector('.offer-opt.recommended');
    log.finals = {
      wizStep: w.eval('wizStep'),
      resultShown: d.getElementById('result').classList.contains('show'),
      offersShown: d.getElementById('offerBox').style.display,
      recommended: rec ? (rec.querySelector('.o-name') || {}).textContent : 'НЕТ',
      recBadge: rec ? (rec.textContent.includes('тебе сюда') ? 'да' : 'нет') : '—',
      ahaTag: d.getElementById('ahaTag').textContent,
      ahaTitle: d.getElementById('ahaTitle').textContent.slice(0, 80),
      ahaCost: d.getElementById('ahaCost').textContent,
      ahaSaving: d.getElementById('ahaSaving').textContent.slice(0, 120),
      pbRes: d.getElementById('pbRes').textContent.slice(0, 160),
      yearPayback: (d.getElementById('yearBox').textContent.match(/Окупаемость[^]*/) || [''])[0].slice(0, 100),
      acceptPay: (d.getElementById('acceptBox').textContent.match(/Оплата вперёд[^]*/) || [''])[0].slice(0, 200),
      diagShown: d.getElementById('diagBox').style.display,
      specShown: d.getElementById('specBox').style.display,
      legalShown: d.getElementById('legalBox').style.display,
      legalFirst: (d.getElementById('legalBox').textContent.match(/Что это значит[^]*/) || [''])[0].slice(0, 60),
      orderCta: d.getElementById('orderCta').style.display,
      heroCompareHasTable: d.getElementById('heroCompare').textContent.includes('Рутина человека'),
      scenBox: d.getElementById('scenBox').textContent.slice(0, 140),
      startVar: w.eval('start'), subPickVar: w.eval('subPick'),
      dsOrder: w.eval('localStorage.getItem("ds_order")||""').slice(0, 120)
    };
    log.taps = w.__clicks.slice(); log.toasts = w.__toasts.slice();
    log.opens = w.__opens.map(u => { const m = String(u).match(/^([^?]+)/); return { base: m ? m[1] : String(u), hasP: /[?&]p=/.test(String(u)), text: /t\.me/.test(String(u)) ? decodeURIComponent((String(u).split('text=')[1] || '')).slice(0, 500) : '' }; });
    log.scrolls = w.__scrolls;
  } catch (e) { log.notes.push('ОШИБКА: ' + e.message); }
  try { w.close(); } catch (e) {}
  return log;
}

(async () => {
  const R = { paths: [], probes: {}, tg: [], lens: {}, pay: [] };

  /* ── 6 полных путей ── */
  const paths = [
    { name: 'P1 время/с нуля/1 рутина/физлицо → сборка 7К', actions: [
      { start: 'Ничего нет' }, { use: 'Для себя' }, { tax: 'Физлицо' }, { click: '#next1' },
      { goal: 'Отвечаю на одни и те же' }, { click: '#next2' },
      { auto: 'Готовит + проверка' }, { click: '#wstep3 .wiz-next' },
      { conn: 'Telegram' }, { data: 'На РФ-сервере' }, { click: '#wstep4 .wiz-next' },
      { click: '.offer-opt.recommended .btn-cta', snap: false }] },
    { name: 'P2 линза человек/платишь людям/2 рутины/самозанятый + CRM → внедрение 30К', actions: [
      { lens: 'Плачу человеку' }, { use: 'В бизнесе' }, { tax: 'Самозанятый' }, { click: '#next1' },
      { goal: 'Отвечаю на одни и те же' }, { goal: 'Разгребаю заявки' }, { click: '#next2' },
      { auto: 'Работает сам' }, { click: '#wstep3 .wiz-next' },
      { conn: 'Telegram' }, { conn: 'CRM и рассылки' }, { data: 'На РФ-сервере' }, { click: '#wstep4 .wiz-next' },
      { click: '.offer-opt.recommended .tier-primary, .offer-opt.recommended button[data-tier]', snap: false }] },
    { name: 'P3 линза подписка/плюс/1 рутина/ИП → сборка 7К', actions: [
      { lens: 'Плачу подписке' }, { sub: 'ChatGPT Plus' }, { use: 'В бизнесе' }, { tax: 'ИП' }, { click: '#next1' },
      { goal: 'Держу клиентов в курсе' }, { click: '#next2' },
      { auto: 'Готовит + проверка' }, { click: '#wstep3 .wiz-next' },
      { conn: 'Telegram' }, { click: '#wstep4 .wiz-next' },
      { click: '.offer-opt.recommended .btn-cta', snap: false }] },
    { name: 'P4 время/связка уже есть/отчёт/ООО + VPS → оптимизация 25К', actions: [
      { start: 'Связка есть' }, { use: 'В бизнесе' }, { tax: 'ООО' }, { click: '#next1' },
      { goal: 'Каждую неделю собираю' }, { click: '#next2' },
      { auto: 'Работает сам' }, { click: '#wstep3 .wiz-next' },
      { conn: 'Telegram' }, { device: 'Свой сервер / VPS' }, { click: '#wstep4 .wiz-next' },
      { click: '.offer-opt.recommended .btn-cta', snap: false }] },
    { name: 'P5 время/железо есть/2 рутины/физлицо + GPU локально → гайд 5К', actions: [
      { start: 'Есть железо' }, { use: 'Для себя' }, { tax: 'Физлицо' }, { click: '#next1' },
      { goal: 'Ищу информацию и слежу' }, { goal: 'Пишу тексты с нуля' }, { click: '#next2' },
      { auto: 'Готовит + проверка' }, { click: '#wstep3 .wiz-next' },
      { device: 'Видеокарта 12–16 GB' }, { data: 'Локально' }, { click: '#wstep4 .wiz-next' },
      { click: '.offer-opt.recommended .btn-cta', snap: false }] },
    { name: 'P6 время/с нуля/«не могу назвать»/физлицо → диагностика в TG', actions: [
      { start: 'Ничего нет' }, { use: 'Для себя' }, { tax: 'Физлицо' }, { click: '#next1' },
      { goal: 'Пока не могу назвать' }, { click: '#next2' },
      { auto: 'Черновики и идеи' }, { click: '#wstep3 .wiz-next' },
      { conn: 'Telegram' }, { click: '#wstep4 .wiz-next' },
      { click: '#diagBox .btn-cta', snap: false }] }
  ];
  for (const spec of paths) R.paths.push(await runPath(spec));

  /* ── CTA-пробы: валидация и защита ── */
  {
    const w = makeDom().window; instrument(w); injectLinks(w); await sleep(700);
    const d = w.document, P = {};
    d.querySelector('.wp[data-step="5"]').click();
    P.jumpTo5NoStart = { toast: w.__toasts.slice(), step: w.eval('wizStep') };
    w.__toasts.length = 0;
    clickText(w, '#startOpts .opt', 'Ничего нет');
    d.querySelector('.wp[data-step="5"]').click();
    P.jumpTo5NoGoals = { toast: w.__toasts.slice(), step: w.eval('wizStep') };
    w.__toasts.length = 0;
    clickText(w, '#goalOpts .opt', 'Отвечаю на одни');
    // cap: 4-я цель
    ['Разгребаю заявки', 'Держу клиентов в курсе', 'Каждую неделю собираю'].forEach(g => { w.__toasts.length = 0; clickText(w, '#goalOpts .opt', g); P['cap' + g.slice(0, 6)] = w.__toasts.slice(); });
    // «не могу назвать» исчезла?
    P.unsureCardStillThere = !!clickText(w, '#goalOpts .opt', 'не могу назвать') || [...d.querySelectorAll('#goalOpts .opt')].some(e => e.textContent.includes('не могу назвать'));
    // шаг 3: можно пройти не выбирая (автодефолт review)
    P.autoDefaultOn = [...d.querySelectorAll('#autoOpts .auto-card')].findIndex(e => e.classList.contains('on'));
    d.querySelector('#wstep3 .wiz-next').click();
    P.step3PassedWithoutClick = w.eval('wizStep');
    w.close();
    R.probes = P;
  }

  /* ── Линзы: что переписывается, что остаётся чужим языком ── */
  {
    const w = makeDom().window; await sleep(700);
    const d = w.document, L = {};
    for (const k of ['people', 'sub']) {
      w.eval(`setLens('${k}')`);
      L[k] = {
        heroTitle: d.getElementById('heroTitle').textContent,
        ws1t: d.getElementById('ws1title').textContent,
        ws2H2: d.querySelector('#wstep2 .ws-title').textContent,
        ws3H2: d.querySelector('#wstep3 .ws-title').textContent,
        next1Label: d.getElementById('next1').textContent,
        next2Label: d.getElementById('next2').textContent,
        ahaTag: d.getElementById('ahaTag').textContent,
        subPickSelected: w.eval('subPick'),
        subPickNote: (d.getElementById('subPickNote') || {}).textContent || '',
        startOptsSelected: [...d.querySelectorAll('#startOpts .opt')].filter(e => e.classList.contains('selected')).map(e => (e.querySelector('.t') || {}).textContent)
      };
    }
    // перезапись явного выбора клиента линзой
    w.eval(`setLens('time')`); clickText(w, '#startOpts .opt', 'Ничего нет');
    const before = w.eval('start');
    w.eval(`setLens('people')`);
    L.overrideUserStart = { before, after: w.eval('start') };
    // конфликт копирайта линзы people и сценария на финале
    w.eval('start="people";goals=["repeat"];deriveTasks();');
    w.eval('goStep(5)');
    L.peopleFinalConflict = {
      lensLead: d.getElementById('heroLead').textContent.slice(0, 80),
      ahaTitle: d.getElementById('ahaTitle').textContent.slice(0, 60),
      ahaDesc: d.getElementById('ahaDesc').textContent.slice(0, 160),
      compareNote: (d.getElementById('heroCompare').textContent.match(/Человек остаётся[^]*/) || [''])[0].slice(0, 100)
    };
    w.close(); R.lens = L;
  }

  /* ── buildTgText: все ветки ── */
  {
    const w = makeDom().window; await sleep(700);
    w.eval(`start="people";goals=["repeat","leads"];deriveTasks();autonomy="auto";conns=["tg","crm"];data="ru";device="cpu";`);
    for (const k of ['config', 'table', 'optimization', 'diagnostic']) {
      const t = w.eval(`buildTgText('${k}')`);
      const lines = t.split('\n');
      R.tg.push({ kind: k, title: lines[0], lines: lines.length, liners: lines.filter(l => l.startsWith('•')).length,
        next: (t.match(/Дальше: (.+)/) || [])[1] || 'НЕТ', hasSnapshot: /Рутина:|Старт:|Данные:/.test(t) });
    }
    for (const tier of ['pc', 'vps', 'integ', 'mid']) {
      const t = w.eval(`installTier='${tier}';buildTgText('install')`);
      const lines = t.split('\n');
      R.tg.push({ kind: 'install:' + tier, title: lines[0], lines: lines.length, liners: lines.filter(l => l.startsWith('•')).length,
        next: (t.match(/Дальше: (.+)/) || [])[1] || 'НЕТ' });
    }
    // openChat('paid') без ссылки (фолбэк): «Оплатил» при оптимизации, где оплаты нет
    w.eval(`chosenOffer='optimization';`);
    R.tgPaidPrefix = w.eval('openChatPaidProbe = (typeof buildTgText==="function") ? "Оплатил. Скрин перевода прилагаю.\\n\\n"+buildTgText("optimization") : ""');
    R.tgPaidPrefix = R.tgPaidPrefix.slice(0, 120);
    // orderBtn: собственный текст, теряет контекст
    R.orderBtnMsg = w.eval(`(function(){var e=estimate();var monthly=(e&&e.monthly)?e.monthly.toLocaleString('ru-RU')+' ₽/мес':'ещё не посчитано';
      return 'Виктор, привет! Хочу внедрить агента — расчёт из калькулятора прилагаю.\\n\\nЧто за рутина: [двумя словами]\\nЧто делается руками: [что забрать у агента]\\nКогда нужно: [срок]\\nБюджет на запуск: [есть / нет]\\n\\nРасчёт из калькулятора: '+monthly;})()`);
    w.close();
  }

  /* ── Платёжные ссылки и фолбэк payPanel ── */
  {
    const w = makeDom().window; instrument(w); await sleep(700);
    const d = w.document;
    // фолбэк: БЕЗ ссылок — goCheckout('config') открывает payPanel?
    clickText(w, '#startOpts .opt', 'Ничего нет');
    w.eval('goals=["repeat"];deriveTasks();autonomy="review";');
    w.eval('goStep(5)');
    w.eval(`goCheckout('config')`);
    R.pay.push({ probe: 'фолбэк goCheckout(config) без ссылок → payPanel', panelShown: d.getElementById('payPanel').style.display,
      payRows: d.getElementById('payPanel').textContent.replace(/\s+/g, ' ').slice(0, 260),
      hasCardOrPhone: /\+7|8\d{10}|\d{4}\s?\d{4}/.test(d.getElementById('payPanel').textContent) });
    // openChat('paid') в фолбэке
    w.__opens.length = 0; w.eval(`openChat('paid')`);
    R.pay.push({ probe: 'фолбэк «Я оплатил» → TG-текст начинается с', open: w.__opens[0] ? decodeURIComponent(w.__opens[0].split('text=')[1]).slice(0, 80) : 'НЕТ' });
    // живые ссылки: каждая с ?p=?
    for (const [k, u] of Object.entries(LINKS)) R.pay.push({ link: k, url: u, hasP: /[?&]p=/.test(u) });
    w.close();
  }

  fs.writeFileSync(path.join(__dirname, 'conversion-path-report.json'), JSON.stringify(R, null, 1));
  console.log('OK: путей', R.paths.length, '| tg-веток', R.tg.length, '| pay-проб', R.pay.length);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
