/**
 * ds-cases.js — секция «Доказательства» (главная + Система, один источник).
 * Канон 15A: кейс отвечает на джобу посетителя «можно ли доверить деньги».
 * Спина: что агент ДЕЛАЕТ каждый день (глаголы) + доказательство открытым
 * инструментом (бенчмарк из EVAL.md — воспроизводимо) + разобранные ошибки
 * с решениями + ключ «каждому — своё доказательство».
 * Платёжный след НЕ публикуется (решение Виктора 27.10.2026): суммы и
 * история покупок наружу не выносятся.
 */
(function () {
  'use strict';

  var EXPERTISE = [
    { n: 'учёт и смены',
      d: 'Диктовка голосом: строка — в таблицу, фото накладной рядом.',
      w: 'сводки собирались вручную каждый вечер',
      b: 'сами в 9:00 и 21:00 · 24/7 на его сервере',
      deep: true,
      scr: ['$ hermes gateway status', '● gateway: running', 'vault/смены/2026-09-11.md', '- [09:20] приход 12 000 · Николай', 'отчёт 21:00 · собран сам'] },
    { n: 'бухгалтерия',
      d: 'Сверка и первичка для 12 компаний — агент забирает рутину, обезличивая данные до модели.',
      w: 'сверка и первичка съедали неделю главбуха',
      b: 'агент забирает сверку, подпись — за главбухом',
      scr: ['152-ФЗ ст.3 п.9: обезличено до модели', 'сверка: 34 документа разложены', 'регистры по 402-ФЗ ст.9–10', 'подпись — за главбухом'] },
    { n: 'дизайн и геймдев',
      d: 'Агент ведёт проект по шагам: ассеты, сцены, сборка.',
      w: 'разработка стояла — нужен был программист',
      b: 'от макетов до собственной игры',
      scr: ['[unity] assets: 34 файла импортированы', '[scene] main.unity собран', '[build] 0 ошибок · 0 предупреждений', 'префаб готов к сборке'] },
    { n: 'видео и контент',
      d: 'Первичные нарезки, сценарии и склейки — локально, без монтажных подписок.',
      w: 'часы сырья лежали неразобранными',
      b: 'нарезки, сценарии и склейки без подписок',
      scr: ['нарезка 01 · 00:14–00:31 ✓', 'сценарий: 3 варианта склейки', 'экспорт: локально, без подписок'] },
    { n: 'карьера',
      d: 'Вакансии собираются сами из открытых источников, письмо — под каждую.',
      w: 'отклики вручную, письма по шаблону',
      b: 'вакансии сами, письмо — под каждую',
      scr: ['парсер: 62 вакансии · фильтр PM / AI', 'письмо под вакансию #17 ✓', 'стратегия: 3 приоритетных направления'] },
    { n: 'исследования рынков',
      d: 'Срез за один прогон, а не к концу недели; помечено, чего данные НЕ доказывают.',
      w: 'данные старели к концу недели',
      b: 'срез с источниками и датами за прогон',
      scr: ['14 источников · даты сверены', 'что НЕ доказано: помечено отдельно', 'выгрузка: md + таблица'] },
    { n: 'радар ниши · ювелирка',
      d: 'Свой сбор вместо платных зависимостей: 251 видео разобрано, аутлаеры найдены.',
      w: '5–6 000 ₽/мес чужим подпискам',
      b: '150 ₽/мес своему сбору · 251 видео',
      scr: ['yt-dlp: 251 видео · 4 платформы', 'аутлаер z 4.94 · 20 млн против 2.7K средних', 'слой мастерских: процесс вместо рекламы', 'расход: ~150 ₽/мес'] },
    { n: 'поиск заказов',
      d: 'Сбор заявок с площадок, мусор отсеивает скоринг; контекст клиента — в скор: компания, договор, реквизиты.',
      w: 'половина заявок мимо при ручном поиске',
      b: '63% против 47% · бенчмарк ниже',
      scr: ['площадок: 7 · карточек: 1106', 'точность 63% против 47% (F1 0.61 / 0.39)', 'FL.ru: 79% на 286 постах', 'код открыт: EVAL.md'] }
  ];

  var CASE = {
    tag: 'внедрение · малый бизнес',
    title: 'Учёт и смены: агент ведёт рутину 24/7',
    body: 'Николай ведёт учёт голосом: диктует в Telegram — строка сама падает в таблицу, фото накладной вкладывается рядом. Сотрудники пишут боту под своими именами, в 9:00 и 21:00 сводка за день уходит сама. Сервер его, данные его — агент работает круглосуточно и абонентки не берёт.',
    transform: 'В ИИ до этого был ноль. Через неделю — диктует голосом и сам принёс вторую задачу: вечерние сводки.',
    meta: 'расход на моделей — у его провайдера, не мне',
    steps: [
      { t: 'голос', d: 'Диктует в Telegram — пара секунд на строку.',
        art: '[голос] «приход 12 000, направление один, Николай»' },
      { t: 'таблица', d: 'Строка сама падает в таблицу, фото накладной вкладывается рядом.',
        art: 'vault/смены/2026-09-11.md · - [09:20] приход 12 000' },
      { t: 'сводка', d: 'В 9:00 и 21:00 сводка за день уходит сама.',
        art: 'отчёт 21:00 · собрано автоматически' },
      { t: 'рост', d: 'Через неделю сам принёс вторую задачу — вечерние сводки.',
        art: 'второй агент · 0 ₽ абонентки' }
    ]
  };

  var BENCH = {
    title: 'Парсер тёплых лидов — код открыт, проверяется у себя',
    rows: [
      ['Точность', '63% против 47% у поиска по словам'],
      ['F1', '0.61 против 0.39'],
      ['FL.ru', '79% на 286 постах'],
      ['Разметка', '1106 карточек с 7 площадок · 110 размечены вручную']
    ],
    note: 'цифры — из EVAL.md репозитория: бенчмарк воспроизводится, не со слайда'
  };

  var PITFALLS = [
    { p: 'Заявки отсеивались «на глаз» — половина мимо', f: 'скоринг по признакам: срок, бюджет, история заказчика' },
    { p: 'Замер ниши висел на трёх платных подписках', f: 'свой сбор через yt-dlp и код — ~150 ₽/мес вместо 5–6 000' },
    { p: 'Клиентские данные ушли бы в модель как есть', f: 'обезличивание до модели (152-ФЗ ст.3 п.9), подпись — за человеком' }
  ];

  var KEY = [
    { w: 'боишься доступов', s: 'смотри архитектуру: сервер твой, ключи твои, чек-лист приёмки до старта', href: 'clarity.html', cta: 'Ясность →' },
    { w: 'покупаешь результат', s: 'смотри строки работы на этой странице — что агент делает каждый день', href: 'system.html', cta: 'Система →' },
    { w: 'скептик', s: 'скачай парсер и прогони бенчмарк на своих данных', href: 'https://github.com/r0undm1dn1ghty-star', cta: 'GitHub →' }
  ];

  var QUOTE = {
    t: '«Нужно было перенести с текстового документа на интерактивную карту большой объём координат. Работа выполнена быстро, качественно и по привлекательной стоимости. Рекомендую исполнителя!»',
    s: 'заказчик с Авито · недвижимость, координаты на карту'
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildHead(root) {
    var head = el('div', 'cases-head');
    head.innerHTML = '<p class="eyebrow rv">доказательства · построчно</p>' +
      '<h2 class="rv">Что уже работает — и как это проверить</h2>' +
      '<p class="lead rv">Внедрений — больше восьми: от учёта до радара ниши, каждое под задачу клиента. Одно разобрано построчно ниже, инструмент с бенчмарком открыт. Без слайдов: глаголы, цифры и разобранные ошибки.</p>';
    root.appendChild(head);
  }

  function buildExpertise(root) {
    var wrap = el('div', 'pv-xgrid rv');
    EXPERTISE.forEach(function (x) {
      var row = el('div', 'pv-xrow' + (x.deep ? ' deep' : ''));
      row.appendChild(el('span', 'pv-xn', x.n));
      row.appendChild(el('p', 'pv-xd', x.d));
      // было → стало: глаз цепляет контраст, а не серую строку
      var xr = el('p', 'pv-xr');
      xr.appendChild(el('span', 'was', x.w));
      xr.appendChild(el('span', 'arr', ' → '));
      xr.appendChild(el('span', 'became', x.b));
      row.appendChild(xr);
      // след работы: реальный лог, не описание
      if (x.scr && x.scr.length) {
        var xs = el('div', 'pv-xs');
        x.scr.forEach(function (line, i) {
          xs.appendChild(el('div', i === x.scr.length - 1 ? 'ok' : null, line));
        });
        row.appendChild(xs);
      }
      wrap.appendChild(row);
    });
    root.appendChild(wrap);
  }

  function buildCase(root) {
    root.appendChild(el('p', 'pv-sub rv', 'один из восьми — построчно'));
    var box = el('article', 'pv-case rv');
    var main = el('div', 'pv-main');
    main.appendChild(el('span', 'pv-tag', CASE.tag));
    main.appendChild(el('h3', 'pv-title', CASE.title));
    main.appendChild(el('p', 'pv-body', CASE.body));
    // степпер: переход от голоса до второй задачи — по шагам, у шага свой артефакт
    var steps = el('div', 'pv-steps');
    var art = el('div', 'pv-art', CASE.steps[0].art);
    var desc = el('p', 'pv-stepdesc', CASE.steps[0].d);
    CASE.steps.forEach(function (s, i) {
      var b = el('button', 'pv-step' + (i === 0 ? ' on' : ''), '0' + (i + 1) + ' · ' + s.t);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        steps.querySelectorAll('.pv-step').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on');
        b.setAttribute('aria-pressed', 'true');
        art.textContent = s.art;
        desc.textContent = s.d;
      });
      steps.appendChild(b);
    });
    main.appendChild(steps);
    main.appendChild(art);
    main.appendChild(desc);
    box.appendChild(main);
    var aside = el('div', 'pv-aside');
    aside.appendChild(el('p', 'pv-transform', CASE.transform));
    aside.appendChild(el('p', 'pv-meta', CASE.meta));
    box.appendChild(aside);
    root.appendChild(box);
  }

  function buildBench(root) {
    var b = el('div', 'pv-bench rv');
    b.appendChild(el('h3', null, BENCH.title));
    BENCH.rows.forEach(function (r) {
      var row = el('div', 'pv-brow');
      row.appendChild(el('span', 'k', r[0]));
      row.appendChild(el('span', 'v', r[1]));
      b.appendChild(row);
    });
    b.appendChild(el('p', 'pv-note', BENCH.note));
    root.appendChild(b);
  }

  function buildPitfalls(root) {
    var wrap = el('div', 'pv-pits rv');
    PITFALLS.forEach(function (x) {
      var pit = el('div', 'pv-pit');
      pit.appendChild(el('span', 'lb', 'ошибка → решение'));
      pit.appendChild(el('p', 'p', x.p));
      pit.appendChild(el('p', 'f', x.f));
      wrap.appendChild(pit);
    });
    root.appendChild(wrap);
  }

  function buildKey(root) {
    var key = el('div', 'pv-key rv');
    KEY.forEach(function (x) {
      var row = el('div', 'pv-keyrow');
      row.appendChild(el('span', 'w', x.w));
      row.appendChild(el('span', 's', x.s));
      var a = el('a', null, x.cta);
      a.href = x.href;
      if (x.href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
      row.appendChild(a);
      key.appendChild(row);
    });
    root.appendChild(key);
  }

  function buildQuote(root) {
    var q = el('blockquote', 'pv-quote rv');
    q.appendChild(el('p', null, QUOTE.t));
    q.appendChild(el('span', null, QUOTE.s));
    root.appendChild(q);
  }

  function buildCta(root) {
    var cta = el('p', 'pv-cta rv');
    var a = el('a', 'btn btn-primary', 'Посчитать свою связку');
    a.href = 'calculator.html';
    cta.appendChild(a);
    root.appendChild(cta);
  }

  function build(root) {
    buildHead(root);
    buildExpertise(root);
    buildCase(root);
    buildBench(root);
    buildPitfalls(root);
    buildKey(root);
    buildQuote(root);
    buildCta(root);
    // страховка проявления: не зависим от IntersectionObserver
    setTimeout(function () {
      root.querySelectorAll('.rv:not(.in)').forEach(function (n) { n.classList.add('in'); });
    }, 1200);
  }

  function init() {
    document.querySelectorAll('[data-ds-cases]').forEach(function (root) {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';
      build(root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
