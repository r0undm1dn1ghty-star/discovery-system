/* ============================================================
   ГНЕЗДО СЧЁТЧИКОВ — discovery-system.ru
   Счётчик 113187640 (создан 29.09.2026, webvisor + clickmap).
   Стартует ТОЛЬКО после согласия на cookie: до него поднимается
   заглушка window.ym, чтобы goal() на страницах не падал.
   ============================================================ */

window.__ymId = 113187640;

(function(){
  var KEY = 'ds-cookie';                 /* 'all' | 'essential' */
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch(e){}

  window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };

  function startCounter(){
    if (window.__ymStarted) return;
    window.__ymStarted = 1;
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113187640', 'ym');

    ym(113187640, 'init', {
      ssr:true, webvisor:true, clickmap:true, ecommerce:'dataLayer',
      referrer: document.referrer, url: location.href,
      accurateTrackBounce:true, trackLinks:true
    });
  }

  if (choice === 'all') { startCounter(); }

  /* ── плашка: карточка снизу справа; на телефоне — лист во всю ширину ── */
  function showNotice(){
    if (choice) return;

    var css = document.createElement('style');
    css.textContent = [
      '#ds-cookie{position:fixed;left:20px;bottom:20px;z-index:900;width:min(340px,calc(100vw - 40px));',
      'background:#fff;border:1px solid rgba(16,20,31,.09);border-radius:14px;',
      'box-shadow:0 20px 44px -26px rgba(16,20,31,.42);padding:13px 15px 13px;',
      'font-family:"IBM Plex Sans",system-ui,sans-serif;color:#10141f;',
      'opacity:0;transform:translateY(10px);transition:opacity .28s cubic-bezier(.22,1,.36,1),transform .28s cubic-bezier(.22,1,.36,1)}',
      '#ds-cookie.in{opacity:1;transform:none}',
      '#ds-cookie .ck-t{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:9.5px;letter-spacing:.14em;',
      'text-transform:uppercase;color:#98a1b5;margin:0 0 6px}',
      '#ds-cookie .ck-x{font-size:13px;line-height:1.45;color:#3c4557;margin:0 0 12px}',
      '#ds-cookie .ck-x a{color:#24368f;text-decoration:underline;text-underline-offset:2px}',
      '#ds-cookie .ck-row{display:flex;gap:8px;align-items:stretch}',
      '#ds-cookie button{border-radius:8px;font:500 12.5px/1 "IBM Plex Sans",sans-serif;padding:0 12px;height:36px;cursor:pointer;border:1px solid transparent;white-space:nowrap}',
      '#ds-cookie .ck-yes{background:#24368f;color:#fff;flex:1 1 auto}',
      '#ds-cookie .ck-yes:hover{background:#1b2a6b}',
      '#ds-cookie .ck-no{background:#fff;border-color:rgba(16,20,31,.18);color:#3c4557;flex:0 0 auto}',
      '#ds-cookie .ck-no:hover{border-color:rgba(16,20,31,.32);color:#10141f}',
      '#ds-cookie button:focus-visible{outline:2px solid #7d97ff;outline-offset:2px}',
      '@media(max-width:560px){#ds-cookie{left:12px;right:12px;bottom:12px;width:auto;padding:14px}',
      '#ds-cookie .ck-row{flex-direction:row}',
      '#ds-cookie button{height:40px;font-size:13px}}',
      '@media(prefers-reduced-motion:reduce){#ds-cookie{transition:none;transform:none;opacity:1}}'
    ].join('');

    /* плашка подстраивается под фон страницы: на тёмных страницах белый лист выглядит чужим */
    var bodyBg = getComputedStyle(document.body).backgroundColor || '';
    var m = bodyBg.match(/\d+(\.\d+)?/g) || [];
    var lum = m.length >= 3 ? (+m[0]*0.2126 + +m[1]*0.7152 + +m[2]*0.0722) / 255 : 1;
    if (lum < 0.45) {
      css.textContent += [
        '#ds-cookie{background:rgba(19,26,48,.97);border-color:rgba(255,255,255,.14);',
        'box-shadow:0 22px 50px -26px rgba(0,0,0,.7);color:#eef2fb}',
        '#ds-cookie .ck-t{color:#8a94ad}',
        '#ds-cookie .ck-x{color:#c8d0e2}',
        '#ds-cookie .ck-x a{color:#a9bcff;text-decoration:none;border-bottom:1px solid rgba(169,188,255,.35)}',
        '#ds-cookie .ck-yes{background:#8fa8ff;color:#0f1730}',
        '#ds-cookie .ck-yes:hover{background:#a9bcff}',
        '#ds-cookie .ck-no{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.22);color:#c8d0e2}',
        '#ds-cookie .ck-no:hover{border-color:rgba(255,255,255,.4);color:#f4f7fe}'
      ].join('');
    }

    document.head.appendChild(css);

    var b = document.createElement('div');
    b.id = 'ds-cookie';
    b.setAttribute('role','dialog');
    b.setAttribute('aria-live','polite');
    b.setAttribute('aria-label','Cookie и статистика');
    b.innerHTML = '<p class="ck-t">cookie</p>'
      + '<p class="ck-x">Метрика нужна, чтобы видеть, какие разделы читают. Сайт работает и без неё. '
      + '<a href="/policy.html">Политика</a></p>'
      + '<div class="ck-row">'
      + '<button type="button" class="ck-yes">Принять</button>'
      + '<button type="button" class="ck-no">Только необходимые</button>'
      + '</div>';

    function close(val){
      choice = val;
      try { localStorage.setItem(KEY, val); } catch(e){}
      if (val === 'all') startCounter();
      b.classList.remove('in');
      setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b); }, 260);
    }
    b.querySelector('.ck-yes').addEventListener('click', function(){ close('all'); });
    b.querySelector('.ck-no').addEventListener('click', function(){ close('essential'); });
    document.body.appendChild(b);
    requestAnimationFrame(function(){ b.classList.add('in'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showNotice);
  else showNotice();
})();
