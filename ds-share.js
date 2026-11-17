/* ============================================================
   DS-SHARE — слаг «поделиться исследованием» discovery-system.ru
   Самовставка: один <script src="ds-share.js" defer></script> на страницу.
   Блок появляется перед <footer>, структуру страницы не трогает.
   Счётчики: Метрику не касается; на клик отправляет цель
   share_research через window.__ymId (гнездо ym-slot.js).
   Канон движения: только transform/opacity, ease .22,1,.36,1,
   prefers-reduced-motion — без анимации.
   ============================================================ */
(function () {
  'use strict';
  var REDUCE = false;
  try { REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function init() {
    if (document.getElementById('ds-share')) return;

    var url = '';
    var title = document.title || '';
    try {
      var canon = document.querySelector('link[rel="canonical"]');
      url = (canon && canon.href) || '';
      var ogT = document.querySelector('meta[property="og:title"]');
      if (ogT && ogT.content) title = ogT.content;
    } catch (e) {}
    if (!url) { try { url = location.href; } catch (e) { url = 'https://discovery-system.ru/'; } }
    var eu = encodeURIComponent(url);
    var et = encodeURIComponent(title);

    var sec = document.createElement('section');
    sec.id = 'ds-share';
    sec.setAttribute('aria-label', 'Поделиться исследованием');

    /* стили инлайном: нулевой риск для CSS страницы */
    var css = ''
      + '#ds-share{max-width:760px;margin:0 auto;padding:26px 20px 10px;'
      + 'border-top:1px solid rgba(16,20,31,.10);'
      + 'font-family:"IBM Plex Sans",system-ui,Arial,sans-serif}'
      + '#ds-share .ds-sh-h{font-size:14px;font-weight:600;color:#10141f;margin:0 0 4px}'
      + '#ds-share .ds-sh-sub{font-size:13px;line-height:1.5;color:#666f85;margin:0 0 14px}'
      + '#ds-share .ds-sh-row{display:flex;flex-wrap:wrap;gap:10px}'
      + '#ds-share button,#ds-share a{display:inline-flex;align-items:center;gap:7px;'
      + 'height:44px;padding:0 18px;border-radius:999px;cursor:pointer;'
      + 'font:600 13.5px "IBM Plex Sans",system-ui,Arial,sans-serif;'
      + 'text-decoration:none;-webkit-tap-highlight-color:transparent;'
      + 'transition:transform .3s cubic-bezier(.22,1,.36,1),background-color .3s cubic-bezier(.22,1,.36,1),color .3s cubic-bezier(.22,1,.36,1)}'
      + '#ds-share button:active{transform:scale(.95)}'
      + '#ds-share button:focus-visible,#ds-share a:focus-visible{outline:2px solid #24368f;outline-offset:2px}'
      + '#ds-share .ds-sh-main{border:0;background:#24368f;color:#fff}'
      + '#ds-share .ds-sh-main:hover{background:#2b3f9e}'
      + '#ds-share .ds-sh-ghost{background:#fff;border:1px solid rgba(16,20,31,.16);color:#10141f}'
      + '#ds-share .ds-sh-ghost:hover{border-color:#24368f;color:#24368f}'
      + '#ds-share .ds-sh-ok{background:#1f7a4d!important;border-color:#1f7a4d!important;color:#fff!important}'
      + '#ds-share svg{width:16px;height:16px;flex:none}'
      + '#ds-share svg.ic-fill{fill:currentColor;stroke:none}'
      + '#ds-share svg.ic-line{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
      + '@media (prefers-reduced-motion:reduce){#ds-share button,#ds-share a{transition:none!important}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var h = document.createElement('h2');
    h.className = 'ds-sh-h';
    h.textContent = 'Понравился разбор — отправь тому, кто теряет на этом деньги';
    var sub = document.createElement('p');
    sub.className = 'ds-sh-sub';
    sub.textContent = title;
    var row = document.createElement('div');
    row.className = 'ds-sh-row';
    sec.appendChild(h); sec.appendChild(sub); sec.appendChild(row);

    var GOAL = 'share_research';
    function goal(kind) {
      try {
        if (window.ym && window.__ymId) window.ym(window.__ymId, 'reachGoal', GOAL, { page: location.pathname, kind: kind });
      } catch (e) {}
    }

    var NATIVE = false;
    try { NATIVE = !!(navigator.share && navigator.canShare && navigator.canShare({ url: url, title: title })); } catch (e) {}
    /* native-кнопка только на тач-устройствах: на десктопе системный шаринг непривычен */
    var TOUCH = false;
    try { TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches; } catch (e) {}

    var ICON_TG = '<svg class="ic-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-.633-.416-.421-.652.097-1.055.444-.344 2.414-2.166 2.559-2.34.076-.095.148-.246.02-.352-.128-.106-.352-.05-.5.05-.248.17-2.107 1.351-2.98 1.914-.235.149-.449.227-.615.222-.204-.005-.595-.093-.887-.171-.374-.097-.672-.148-.672-.296 0-.06.09-.123.26-.187.28-.114 2.678-1.234 3.315-1.53.588-.273 1.09-.42 1.414-.496.386-.09.855-.105 1.24-.064z"/></svg>';
    var ICON_COPY = '<svg class="ic-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1.5 1.5M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1.5-1.5"/></svg>';
    var ICON_SHARE = '<svg class="ic-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/><path d="M12 3v12"/><path d="M8.5 6.5L12 3l3.5 3.5"/></svg>';

    if (NATIVE && TOUCH) {
      var bN = document.createElement('button');
      bN.type = 'button';
      bN.className = 'ds-sh-main';
      bN.innerHTML = ICON_SHARE + '<span>Поделиться</span>';
      bN.addEventListener('click', function () {
        goal('native');
        navigator.share({ title: title, url: url, text: title + ' — ' + url }).catch(function () {});
      });
      row.appendChild(bN);
    }

    if (true) {
      var aTg = document.createElement('a');
      aTg.href = 'https://t.me/share/url?url=' + eu + '&text=' + et;
      aTg.target = '_blank'; aTg.rel = 'noopener';
      aTg.className = 'ds-sh-ghost';
      aTg.innerHTML = ICON_TG + '<span>Telegram</span>';
      aTg.addEventListener('click', function () { goal('tg'); });
      row.appendChild(aTg);

      var bC = document.createElement('button');
      bC.type = 'button';
      bC.className = 'ds-sh-ghost';
      bC.innerHTML = ICON_COPY + '<span>Скопировать ссылку</span>';
      bC.addEventListener('click', function () {
        goal('copy');
        var done = function (ok) {
          var label = bC.querySelector('span');
          if (!ok) { label.textContent = 'Не удалось — скопируйте из адресной строки'; return; }
          label.textContent = 'Ссылка скопирована';
          bC.classList.add('ds-sh-ok');
          if (!REDUCE) {
            bC.style.transform = 'scale(1.04)';
            setTimeout(function () { bC.style.transform = ''; }, 180);
          }
          setTimeout(function () {
            label.textContent = 'Скопировать ссылку';
            bC.classList.remove('ds-sh-ok');
          }, 2400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(fallbackCopy(url)); });
        } else { done(fallbackCopy(url)); }
      });
      row.appendChild(bC);
    }

    function fallbackCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        ta.remove(); return ok;
      } catch (e) { return false; }
    }

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(sec, footer);
    else document.body.appendChild(sec);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
