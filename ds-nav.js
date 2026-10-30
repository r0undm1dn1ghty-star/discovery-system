/**
 * ds-nav.js — ОДИН источник правды для навигации Discovery System.
 * Причина: у каждой страницы была своя копия нава → регистр разъезжался
 * («Рынок ИИ» vs «система»), активный пункт подсвечивался неверно
 * (на главной горел «Калькулятор»), а часть страниц оставалась без нава вообще.
 *
 * Правила:
 *   • порядок — по пути клиента (ds-nav-config), не по алфавиту;
 *   • регистр единый: первая заглавная, без КАПСА;
 *   • активный пункт вычисляется по файлу страницы, а не проставлен руками;
 *   • на мобилке — одна прокручиваемая строка (не рвётся на три этажа);
 *   • последний пункт — целевое действие (калькулятор), визуально выделено.
 *
 * РЕШЕНИЕ 24.10.2026 (разбор пути клиента, см. market-intel/IA-РЕШЕНИЕ-2026-10-24.md):
 *   5 пунктов → 4. Убран «Канал». Причина: это лента сигналов, а не шаг покупки, и его
 *   подпись спорила с кнопкой «Сигналы в канале», которая ведёт в Telegram. «Рынок ИИ»
 *   переехал за «Цены»: сначала «что это» → «почему верить» → «сколько», и только потом
 *   контекст рынка для тех, кто копает. channel.html остаётся живой страницей — вход из
 *   market.html и из бесплатного узла clarity.html; в наве он прилипает к «Рынку ИИ».
 *
 * НЕ СТАВИТЬ НА: thanks.html, fail.html — это возвраты с Робокассы,
 * там одна задача: получить оплаченное или повторить платёж.
 */
(function () {
  'use strict';

  var NAV = [
    { key: 'system',   href: 'system.html',   label: 'Система' },
    { key: 'prices',   href: 'clarity.html',  label: 'Ясность' },
    { key: 'market',   href: 'market.html',   label: 'Рынок ИИ' },
    { key: 'channel',  href: 'channel.html',  label: 'Канал' }
  ];
  /* короткая подпись на узких экранах: полная не влезала в 390px и кнопка уезжала за край */
  var CTA = { key: 'calc', href: 'calculator.html',
    label: (window.innerWidth < 700) ? 'Считать' : 'Посчитать свою связку' };

  /* какой пункт считать активным для каждой страницы */
  var ACTIVE = {
    'index.html': null,
    'system.html': 'system',
    'proof.html': 'system',
    'market.html': 'market',
    'channel.html': 'channel',
    'clarity.html': 'prices',
    'calculator.html': 'calc',
    // подстраницы прилипают к своему разделу
    'agent-failures.html': 'market',
    'nacenka.html': 'market',
    'karta-resheniy.html': 'market',
    'value-chain.html': 'market',
    'lost-accounts.html': 'market',
    'pay.html': 'prices',
    'oferta.html': 'prices',
    'policy.html': 'prices',
    'services.html': 'prices'
    // ВАЖНО: thanks.html и fail.html — страницы возврата с Робокассы.
    // На них маркетингового нава НЕТ и быть не должно: клиент не должен
    // уходить гулять по сайту, пока не забрал то, за что заплатил.
  };

  function currentFile() {
    var p = location.pathname.split('/').pop();
    if (!p) return 'index.html';
    return p;
  }

  function build() {
    var hosts = document.querySelectorAll('[data-ds-nav]');
    if (!hosts.length) return;
    var active = ACTIVE[currentFile()];
    if (active === undefined) active = null;

    hosts.forEach(function (nav) {
      if (nav.dataset.ready) return;
      nav.dataset.ready = '1';

      /* Каркас берём из разметки страницы. Раньше build() всегда создавал свой .wrap
         с логотипом — рядом со статичным <a class="home"> из HTML, поэтому на каждой
         странице было ДВА «Discovery System» подряд: дубль в таб-порядке и лишняя
         строка нава на мобилке (проверка 24.10.2026: 390px, y=6 и y=56). */
      var wrap = nav.querySelector('.wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'wrap';
        nav.appendChild(wrap);
      }
      if (!wrap.querySelector('a.home')) {
        var home = document.createElement('a');
        home.className = 'home';
        home.href = 'index.html';
        home.innerHTML = '<img src="logo-nav.png" alt="Discovery System" height="28"/>' +
          '<span>Discovery System</span>';
        wrap.appendChild(home);
      }

      var items = document.createElement('div');
      items.className = 'nav-items';

      NAV.forEach(function (it) {
        var a = document.createElement('a');
        a.href = it.href;
        a.textContent = it.label;
        if (it.key === active) a.className = 'on';
        items.appendChild(a);
      });

      var cta = document.createElement('a');
      cta.className = 'calc' + (active === 'calc' ? ' on' : '');
      cta.href = CTA.href;
      cta.textContent = CTA.label;
      items.appendChild(cta);

      wrap.appendChild(items);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
