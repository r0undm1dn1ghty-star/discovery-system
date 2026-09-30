/* ============================================================
   ГНЕЗДО СЧЁТЧИКОВ — discovery-system.ru
   Активен счётчик 113187640 (создан Виктором 29.09.2026,
   webvisor + clickmap). Действует на все 17 страниц.
   Второй счётчик (если появится) — добавить блок по образцу
   ниже; window.__ymId = основной счётчик для целей goal().
   ============================================================ */

/* ===== НАЧАЛО ГНЕЗДА ===== */

/* Yandex.Metrika counter — 113187640 */
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113187640', 'ym');

ym(113187640, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
/* /Yandex.Metrika counter */

/* ===== КОНЕЦ ГНЕЗДА ===== */

/* Основной счётчик для целей goal(): cta_calculator, tg_click,
   personal_calc, funnel_view → идут в 113187640. */
window.__ymId = 113187640;

/* ── Куки-нотис (одна строка, внизу слева; закрытие пишется в localStorage) ── */
(function(){
  try{
    if (localStorage.getItem('ds-cookie-ok')) return;
    var b = document.createElement('div');
    b.id = 'ds-cookie-note';
    b.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9999;max-width:340px;'
      + 'background:#111524;border:1px solid rgba(255,255,255,.14);border-radius:6px;'
      + 'padding:10px 14px;font:400 12.5px/1.5 "IBM Plex Sans",system-ui,sans-serif;'
      + 'color:#b8c3d6;box-shadow:0 4px 18px rgba(0,0,0,.35)';
    b.innerHTML = 'Сайт использует cookie и Яндекс.Метрику для статистики. '
      + '<a href="/policy.html" style="color:#7bc4a8;text-decoration:underline">Политика</a>';
    var x = document.createElement('button');
    x.textContent = 'понятно';
    x.style.cssText = 'margin-left:10px;background:none;border:1px solid rgba(255,255,255,.25);'
      + 'border-radius:4px;color:#e8ecf4;font:600 12px "IBM Plex Sans",sans-serif;'
      + 'padding:3px 10px;cursor:pointer';
    x.onclick = function(){ try{localStorage.setItem('ds-cookie-ok','1');}catch(e){} b.remove(); };
    b.appendChild(x);
    document.body.appendChild(b);
  }catch(e){}
})();
