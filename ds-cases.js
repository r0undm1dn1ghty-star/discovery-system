/**
 * ds-cases.js — секция «Доказательства» (главная + Система, один источник).
 * Канон 15A: кейс отвечает на джобу посетителя «можно ли доверить деньги».
 * Спина: что агент ДЕЛАЕТ каждый день (глаголы) + доказательство открытым
 * инструментом (бенчмарк из EVAL.md — воспроизводимо) + названные грабли
 * с фиксами + ключ «каждому — своё доказательство».
 * Платёжный след НЕ публикуется (решение Виктора 27.10.2026): суммы и
 * история покупок наружу не выносятся.
 */
(function () {
  'use strict';

  var CASE = {
    tag: 'внедрение · малый бизнес',
    title: 'Учёт и смены: агент ведёт рутину 24/7',
    body: 'Николай ведёт учёт голосом: диктует в Telegram — строка сама падает в таблицу, фото накладной вкладывается рядом. Сотрудники пишут боту под своими именами, в 9:00 и 21:00 сводка за день уходит сама. Сервер его, данные его — агент работает круглосуточно и абонентки не берёт.',
    transform: 'В ИИ до этого был ноль. Через неделю — диктует голосом и сам принёс вторую задачу: вечерние сводки.',
    meta: 'расход на моделей платит своему провайдеру, не мне · имя и стек не публикую'
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
      '<p class="lead rv">Одно внедрение живёт у клиента, один инструмент открыт с бенчмарком. Без слайдов: глаголы, цифры и названные грабли.</p>';
    root.appendChild(head);
  }

  function buildCase(root) {
    var box = el('article', 'pv-case rv');
    var main = el('div', 'pv-main');
    main.appendChild(el('span', 'pv-tag', CASE.tag));
    main.appendChild(el('h3', 'pv-title', CASE.title));
    main.appendChild(el('p', 'pv-body', CASE.body));
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
      pit.appendChild(el('span', 'lb', 'грабля'));
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
