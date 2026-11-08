/**
 * ds-mnav.js — единая мобильная навигация Discovery System.
 *
 * Один компонент на все живые страницы: на ≤720px лого-5 остаётся слева,
 * справа появляется бургер 44×44, ссылки переезжают в панель на весь экран.
 *
 * Почему отдельный файл, а не правка шести копий нава:
 *   • состав ссылок и активный пункт уже лежат в разметке каждой страницы —
 *     панель читает ИХ, а не свою копию, поэтому не разъезжается с десктопом;
 *   • стили живут в ds-mnav.css, механика — здесь: одна правка чинит все страницы;
 *   • страницы с ds-nav.js (nav.top) подхватываются тем же кодом: ds-nav строит
 *     .nav-items на DOMContentLoaded, наш init идёт следом за ним.
 *
 * Что делает:
 *   1. ставит html.mnav-ready — только после этого CSS прячет старую строку ссылок
 *      (без JS нав остаётся живым, а не пустым);
 *   2. вставляет кнопку-бургер в полосу нава и панель в body;
 *   3. открытие/закрытие: тап, Esc, тап по ссылке, ресайз за 720;
 *   4. блокирует скролл тела (html.mnav-lock) и держит фокус внутри панели;
 *   5. reduced-motion отключает анимацию панели (это в CSS).
 */
(function () {
  'use strict';

  var BP = 720;
  var svgNS = 'http://www.w3.org/2000/svg';
  var state = { btn: null, panel: null, lastFocus: null, links: [] };

  function isMobile() {
    return window.innerWidth <= BP;
  }

  /* ── сбор ссылок: десктопный нав — единственный источник ────────────────── */
  function pickLinks() {
    var header = document.querySelector('header.nav .nav-in > nav');
    if (header) return Array.prototype.slice.call(header.querySelectorAll('a'));

    var items = document.querySelector('nav.top .nav-items');
    if (items) return Array.prototype.slice.call(items.querySelectorAll('a'));

    var top = document.querySelector('nav.top');
    if (top) {
      return Array.prototype.slice.call(top.querySelectorAll('a')).filter(function (a) {
        return !a.classList.contains('home');
      });
    }
    return [];
  }

  function activeOf(a) {
    return a.hasAttribute('aria-current') ||
      a.classList.contains('on') ||
      a.classList.contains('cur');
  }

  /* ── тема панели по фону полосы нава ───────────────────────────────────── */
  function luminance(rgb) {
    var m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[1].split(',').map(function (v) { return parseFloat(v); });
    if (p.length > 3 && p[3] < 0.05) return null; /* прозрачный — смотрим выше */
    var c = p.slice(0, 3).map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function themeOf(bar) {
    var el = bar;
    while (el && el !== document.documentElement) {
      var bg = window.getComputedStyle(el).backgroundColor;
      var l = luminance(bg || '');
      if (l !== null) return l > 0.55 ? 'light' : 'dark';
      el = el.parentElement;
    }
    return 'dark';
  }

  /* ── разметка панели ────────────────────────────────────────────────────── */
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function closeIcon() {
    var s = document.createElementNS(svgNS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    var p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', 'M2 2 L14 14 M14 2 L2 14');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.6');
    p.setAttribute('stroke-linecap', 'round');
    s.appendChild(p);
    return s;
  }

  function buildPanel(links) {
    var panel = el('div', 'mnav', {
      id: 'ds-mnav',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Меню сайта',
      'data-open': '0'
    });
    panel.setAttribute('aria-hidden', 'true');

    /* верх: лого слева, крестик справа */
    var head = el('div', 'mnav-head');
    var brand = el('a', 'mnav-brand', { href: 'index.html' });
    var img = el('img', null, { src: 'logo-5.png', alt: 'Discovery System', width: '26', height: '26' });
    brand.appendChild(img);
    brand.appendChild(document.createTextNode('discovery system'));
    head.appendChild(brand);

    var close = el('button', 'mnav-close', { type: 'button', 'aria-label': 'Закрыть меню' });
    close.appendChild(closeIcon());
    head.appendChild(close);
    panel.appendChild(head);

    var body = el('div', 'mnav-body');
    var list = el('ul', 'mnav-list');
    links.forEach(function (src) {
      var li = el('li');
      var a = el('a', null, { href: src.getAttribute('href') || '#' });
      if (activeOf(src)) a.setAttribute('aria-current', 'page');
      a.appendChild(document.createTextNode((src.textContent || '').trim()));
      if (activeOf(src)) {
        var tick = el('span', 'mnav-tick', { 'aria-hidden': 'true' });
        tick.textContent = '●';
        a.appendChild(tick);
      }
      li.appendChild(a);
      list.appendChild(li);
    });
    body.appendChild(list);

    /* низ: личка и канал — двери, которые на мобилке иначе теряются в футере */
    var foot = el('div', 'mnav-foot');
    var lab = el('span', 'mnav-lab');
    lab.textContent = 'Связаться';
    foot.appendChild(lab);
    var dm = el('a', null, { href: 'https://t.me/victorpinksight' });
    dm.textContent = 'Написать лично · t.me/victorpinksight';
    foot.appendChild(dm);
    var ch = el('a', null, { href: 'https://t.me/discoverysystem' });
    ch.textContent = 'Канал · t.me/discoverysystem';
    foot.appendChild(ch);
    body.appendChild(foot);

    panel.appendChild(body);
    return panel;
  }

  function buildButton() {
    var b = el('button', 'mnav-btn', {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'ds-mnav',
      'aria-label': 'Открыть меню'
    });
    b.appendChild(el('span'));
    return b;
  }

  /* ── открытие / закрытие ────────────────────────────────────────────────── */
  function focusables() {
    if (!state.panel) return [];
    return Array.prototype.slice.call(
      state.panel.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }

  function open() {
    if (!state.panel || state.panel.getAttribute('data-open') === '1') return;
    state.lastFocus = document.activeElement;
    state.panel.setAttribute('data-open', '1');
    state.panel.setAttribute('aria-hidden', 'false');
    state.btn.setAttribute('aria-expanded', 'true');
    state.btn.setAttribute('aria-label', 'Закрыть меню');
    document.documentElement.classList.add('mnav-lock');
    var first = state.panel.querySelector('.mnav-list a') || state.panel.querySelector('a, button');
    if (first) first.focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  function close(restore) {
    if (!state.panel || state.panel.getAttribute('data-open') !== '1') return;
    state.panel.setAttribute('data-open', '0');
    state.panel.setAttribute('aria-hidden', 'true');
    state.btn.setAttribute('aria-expanded', 'false');
    state.btn.setAttribute('aria-label', 'Открыть меню');
    document.documentElement.classList.remove('mnav-lock');
    document.removeEventListener('keydown', onKey, true);
    if (restore !== false) {
      var back = state.lastFocus && document.contains(state.lastFocus) ? state.lastFocus : state.btn;
      if (back && back.focus) back.focus({ preventScroll: true });
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !state.panel.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ── сборка ─────────────────────────────────────────────────────────────── */
  function init() {
    if (document.querySelector('.mnav-btn')) return;

    var links = pickLinks();
    if (!links.length) return;

    var bar = document.querySelector('header.nav .nav-in') || document.querySelector('nav.top .wrap') || document.querySelector('nav.top');
    if (!bar) return;

    state.links = links;
    state.panel = buildPanel(links);
    state.btn = buildButton();
    state.panel.setAttribute('data-theme', themeOf(bar));

    document.body.appendChild(state.panel);
    bar.appendChild(state.btn);

    state.btn.addEventListener('click', function () {
      if (state.panel.getAttribute('data-open') === '1') close(); else open();
    });
    state.panel.querySelector('.mnav-close').addEventListener('click', function () { close(); });
    Array.prototype.forEach.call(state.panel.querySelectorAll('.mnav-list a, .mnav-foot a'), function (a) {
      a.addEventListener('click', function () { close(false); });
    });

    var onResize = function () {
      if (!isMobile()) close(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    document.documentElement.classList.add('mnav-ready');
  }

  if (document.readyState === 'loading') {
    /* ловим момент ПОСЛЕ ds-nav.js: его слушатель DOMContentLoaded зарегистрирован
       раньше нашего, значит .nav-items к этому времени уже построен */
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init); /* догоняем, если нав достроился позже */
  } else {
    init();
  }
})();