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
 * НЕ СТАВИТЬ НА: thanks.html, fail.html — это возвраты с Робокассы,
 * там одна задача: получить оплаченное или повторить платёж.
 */
(function () {
  'use strict';

  var NAV = [
    { key: 'system',   href: 'system.html',   label: 'Система' },
    { key: 'cases',    href: 'proof.html',    label: 'Внедрения' },
    { key: 'market',   href: 'market.html',   label: 'Рынок ИИ' },
    { key: 'prices',   href: 'clarity.html',  label: 'Цены' },
    { key: 'channel',  href: 'channel.html',  label: 'Канал' }
  ];
  var CTA = { key: 'calc', href: 'calculator.html', label: 'Посчитать свою связку' };

  /* какой пункт считать активным для каждой страницы */
  var ACTIVE = {
    'index.html': null,
    'system.html': 'system',
    'proof.html': 'cases',
    'market.html': 'market',
    'channel.html': 'channel',
    'clarity.html': 'prices',
    'calculator.html': 'calc',
    // подстраницы прилипают к своему разделу
    'agent-failures.html': 'market',
    'nacenka.html': 'market',
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

      var wrap = document.createElement('div');
      wrap.className = 'wrap';

      var home = document.createElement('a');
      home.className = 'home';
      home.href = 'index.html';
      home.innerHTML = '<img src="logo-nav.png" alt="Discovery System" height="28"/>' +
        '<span>Discovery System</span>';
      wrap.appendChild(home);

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
      nav.appendChild(wrap);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
