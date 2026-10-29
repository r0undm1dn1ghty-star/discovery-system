// Проверка паспорта расчёта, который клиент отправляет в Telegram.
// Контракт: текст едет в ?text= (кириллица в URL ~6 знаков на букву), поэтому
// ссылка обязана оставаться короткой (<2000) — иначе переход в Telegram падает.
// iOS: t.me/<user>?text= теряет черновик → идём через share-шит.
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
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/calculator.html', virtualConsole: vc });
  const w = dom.window;
  let opened = null;
  w.open = (u) => { opened = u; return null; };
  return new Promise(res => setTimeout(() => {
    if (ua) Object.defineProperty(w.navigator, 'userAgent', { value: ua, configurable: true });
    w.eval(scenario);
    try { w.eval('calculate()'); } catch (e) {}
    res({ w, getOpened: () => opened, reset: () => { opened = null; } });
  }, 700));
}

const SCEN_IP = 'start="people";device="vps";data="ru";goals=["leads","report"];tasks=[];conns=["tg","crm"];autonomy="auto";budget="b";useGoal="business";taxForm="ip";pay="rucard";';
const SCEN_NEW = 'start="nothing";device="cpu";data="cloud";goals=["write"];tasks=[];conns=["tg"];autonomy="draft";budget="b3";useGoal="business";taxForm="samozan";pay="rucard";';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';

(async () => {
  /* 1. Паспорт и его размер на типовом кейсе */
  let t = await run(ANDROID, SCEN_IP);
  t.w.eval('installTier="integ"');
  t.reset();
  t.w.eval('openInstallChat("integ")');
  let url = decodeURIComponent(t.getOpened() || '');
  let text = url.split('?text=')[1] || '';
  console.log('=== ПАСПОРТ (внедрение ИП, Android) ===');
  console.log(text + '\n');
  console.log('=== текст:', text.length, '| ссылка:', (t.getOpened() || '').length, '\n');
  console.log('Паспорт:');
  ok(/РУТИНА: Заявки и отклики/.test(text), 'рутина + старт');
  ok(/СТЕК: .*VPS/.test(text) && /Telegram\+CRM/.test(text), 'стек: железо, данные, модель, автономность, подключения');
  ok(/ЦИФРЫ: агент забирает ~\d+ ч\/мес из \d+/.test(text) && /владение [\d\s]+ ₽\/мес/.test(text), 'цифры: часы и владение');
  ok(/ХОЧУ: ИП\/малый бизнес — 30 000 ₽/.test(text), 'рекомендация с ценой');
  ok(/СТАТУС: бизнес, ИП/.test(text) && /бюджет/.test(text) && /оплата картой РФ/.test(text), 'статус и ограничения');
  ok((t.getOpened() || '').length < 1900, 'ссылка короче 1900 знаков', (t.getOpened() || '').length + '');

  /* 2. Размер ссылки по всем комбинациям воронки — ?text= не должен ломать переход */
  const sweep = t.w.eval(`(function(){
    var starts=['nothing','sub','legacy','hardware','people'], devices=['cpu','gpu8','gpu12','gpu24','vps','host','phone'],
        datas=['local','cloud','ru','hybrid'], autos=['draft','review','auto','full'], budgets=['b3','b6','b'],
        pays=['rucard','crypto','proxy'], uses=['','personal','business'], taxes=['','fiz','samozan','ip','ooo'],
        connsets=[[],['tg'],['tg','bot','wa','pub','crm','avito','analytics','sheets','obs','mem']],
        goalsets=[['repeat'],['leads'],['remind'],['report'],['scan'],['write'],['quote'],['paper'],['unsure'],['leads','report'],['leads','report','scan']],
        kinds=['config','table','optimization','install','diagnostic'], tiers=['','pc','vps','integ','mid'],
        max=0, maxAt='', n=0;
    for(var a=0;a<starts.length;a++)for(var b=0;b<devices.length;b++)for(var c=0;c<datas.length;c++)
    for(var d=0;d<autos.length;d++)for(var e=0;e<goalsets.length;e++)for(var f=0;f<connsets.length;f++){
      start=starts[a]; device=devices[b]; data=datas[c]; autonomy=autos[d]; goals=goalsets[e]; conns=connsets[f];
      budget=budgets[(a+b+c+d+e+f)%3]; pay=pays[(a+c+e)%3]; useGoal=uses[(b+f)%3]; taxForm=taxes[(a+d)%5];
      subPick='pro'; installTier=null; tasks=deriveTasks();
      for(var g=0;g<kinds.length;g++)for(var h=0;h<tiers.length;h++){
        installTier=tiers[h]||null; n++;
        var u=tgUrl(briefText(kinds[g]));
        if(u.length>max){max=u.length; maxAt=[starts[a],devices[b],datas[c],autos[d],goalsets[e].join('+'),kinds[g],tiers[h]].join('/');}
      }
    }
    return {n:n, max:max, maxAt:maxAt};
  })()`);
  console.log('Ссылка по комбинациям:');
  console.log('   проверено комбинаций: ' + sweep.n + ' | максимум ссылки: ' + sweep.max + ' (' + sweep.maxAt + ')');
  ok(sweep.max < 2000, 'во всех комбинациях ссылка < 2000 знаков', 'максимум ' + sweep.max);
  ok(sweep.max < 1900, 'и даже < 1900 (запас на предел обработчика Windows)', 'максимум ' + sweep.max);

  /* 3. iOS */
  t = await run(IOS, SCEN_IP);
  t.reset();
  t.w.eval('openInstallChat("integ")');
  let iosUrl = t.getOpened() || '';
  console.log('iOS:');
  ok(iosUrl.indexOf('https://t.me/share/url?url=') === 0, 'на iOS — share-шит (текст в поле ввода), а не пустой чат');
  ok(decodeURIComponent(iosUrl.split('&text=')[1] || '').indexOf('РУТИНА:') > 0, 'в share-тексте тот же паспорт');

  /* 4. Кнопка результата: старая, без кнопки копирования */
  t = await run(ANDROID, SCEN_IP);
  const btnLabel = t.w.eval('document.getElementById("orderBtn").textContent');
  ok(/У меня заказ — хочу решить сейчас/.test(btnLabel), 'кнопка вернулась к прежнему виду', btnLabel);
  ok(t.w.eval('document.querySelectorAll("#orderCta button").length') === 1, 'под кнопкой нет второй кнопки «скопировать»');
  t.reset();
  t.w.eval('document.getElementById("orderBtn").click()');
  let btnUrl = t.getOpened() || '';
  ok(/РУТИНА:/.test(decodeURIComponent(btnUrl.split('?text=')[1] || '')), 'кнопка отправляет паспорт');
  ok(btnUrl.length < 1900, 'ссылка кнопки короткая', btnUrl.length + '');

  /* 5. Диагностика: без выдуманных цифр */
  t = await run(ANDROID, 'start=null;goals=["unsure"];device="cpu";data="cloud";autonomy="review";conns=[];budget="b";');
  t.reset();
  t.w.eval('openDiagChat()');
  let diag = decodeURIComponent((t.getOpened() || '').split('?text=')[1] || '');
  console.log('Диагностика:');
  ok(/РУТИНА: пока не назвал/.test(diag), 'честно: процесс не назван');
  ok(!/забирает ~0 ч/.test(diag) && !/экономия 0 ₽/.test(diag), 'нет выдуманных нулей');
  ok((t.getOpened() || '').length < 1900, 'ссылка диагностики короткая');

  /* 6. Снимок для других страниц */
  t = await run(ANDROID, SCEN_NEW);
  t.reset();
  t.w.eval('openInstallChat("pc")');
  ok(!!t.w.eval('localStorage.getItem("ds_brief")'), 'паспорт кладётся в localStorage');

  /* 7. clarity/pay/thanks: тот же механизм, хвост подрезан под лимит */
  {
    const vc2 = new VirtualConsole(); vc2.on('jsdomError', () => {});
    const brief = 'РУТИНА: Заявки и отклики — со скринингом + Регулярный отчёт · платишь людям\nСТЕК: Свой сервер / VPS (РФ) · На РФ-сервере · Pro · высокая · Telegram+CRM\nЦИФРЫ: агент забирает ~21 ч/мес из 28 · экономия 7 000 ₽/мес · владение 3 184 ₽/мес\nХОЧУ: ИП/малый бизнес — 30 000 ₽\nСТАТУС: В бизнесе, ИП · бюджет сколько нужно · Карта РФ / СБП';
    const cdom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'clarity.html'), 'utf8'), {
      runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/clarity.html', virtualConsole: vc2,
      beforeParse(win) { try { win.localStorage.setItem('ds_brief', JSON.stringify({ ts: Date.now(), offer: 'config', text: brief })); } catch (e) {} }
    });
    await new Promise(r => setTimeout(r, 400));
    const cw = cdom.window;
    Object.defineProperty(cw.navigator, 'userAgent', { value: ANDROID, configurable: true });
    cw.eval(fs.readFileSync(path.join(__dirname, '..', 'pay-links.js'), 'utf8'));
    console.log('Другие страницы:');
    ok(String(cw.eval('dsTgUrl("тест")')).indexOf('https://t.me/victorpinksight?text=') === 0, 'clarity.html: тот же dsTgUrl');
    Object.defineProperty(cw.navigator, 'userAgent', { value: IOS, configurable: true });
    ok(String(cw.eval('dsTgUrl("тест")')).indexOf('https://t.me/share/url?url=') === 0, 'clarity.html: на iOS share-шит');
    const els = Array.from(cw.document.querySelectorAll('[data-tg]'));
    const hrefs = els.map(e => e.getAttribute('href') || '');
    ok(hrefs.every(h => h.indexOf('https://t.me/victorpinksight?text=') === 0), 'кнопки услуг ведут в личку');
    ok(hrefs.some(h => decodeURIComponent(h).indexOf('Мой расчёт из калькулятора') > 0), 'кнопки услуг дописывают паспорт из калькулятора');
    const worst = Math.max.apply(null, hrefs.map(h => h.length));
    ok(worst < 1900, 'и эти ссылки тоже короткие', 'максимум ' + worst);
  }

  console.log('\n' + (fails ? 'ПРОВАЛЕНО ' + fails + ' из ' + checks : 'все ' + checks + ' проверок пройдены'));
  process.exit(fails ? 1 : 0);
})();
