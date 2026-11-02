/* ============================================================================
   ds-hero-field.js — GPU-слой первого экрана Discovery System (мокап v1)
   Полноэкранное световое поле за hero: тонкие нити (flow field) + студийный
   конус света + тёплый производственный отблеск, реакция на курсор.
   Запечённый артефакт (prepared-hero-field.json) вложен в страницу как
   <script id="hero-field-artifact" type="application/json"> — поэтому слой
   работает и с file://, и с http.

   Предохранители (как у остальных GPU-слоёв страницы):
     • localStorage 'ds-hero-field' = 'off' — выключить слой; 'on' — включить
     • нет navigator.gpu / reduce-motion / ширина <760 / прошлый краш — слой не
       стартует, вместо него грузится прежняя плазма (ds-plasma.js)
     • уход со вкладки — петля останавливается; уход секции за экран — не рисуем
     • адаптивное качество: рисуем в 0.7 от CSS-размера; если кадр дороже 30 мс
       — снижаем fps (30 → 20 → 12), затем замораживаем последний кадр
     • ?hq=1 — отключить адаптацию (для замеров и съёмки)
   ========================================================================== */
(function () {
  'use strict';

  var W = window, D = document;
  var state = { mode: 'off', running: false, fps: 30, avg: 0,
    forced: /[?&]hq=1/.test(location.search),
    intensity: (function () {
      var m = /[?&]field=([0-9.]+)/.exec(location.search);
      return m ? Math.max(0, Math.min(3, parseFloat(m[1]))) : 0.85;
    })() };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sess(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  W.__heroField = {
    get mode() { return state.mode; },
    get running() { return state.running; },
    get fps() { return state.fps; },
    get avgMs() { return Math.round(state.avg * 10) / 10; },
    /* сила поля на глаз: __heroField.setIntensity(1.6) или ?field=1.6 */
    get intensity() { return state.intensity; },
    setIntensity: function (k) { state.intensity = Math.max(0, Math.min(3, +k || 0)); return state.intensity; },
    toggle: function (on) { store('ds-hero-field', on === false ? 'off' : 'on'); location.reload(); }
  };

  /* ---------- фолбэк: прежняя плазма, если поле не стартует --------------- */
  function fallback(why) {
    state.mode = why;
    D.documentElement.setAttribute('data-hero-field', why);
    if (D.querySelector('script[data-ds-plasma]')) return;
    var s = D.createElement('script');
    s.src = 'ds-plasma.js'; s.defer = true; s.setAttribute('data-ds-plasma', '1');
    D.head.appendChild(s);
  }

  if (store('ds-hero-field') === 'off') { state.mode = 'killed'; return; }
  if (!W.navigator.gpu) { fallback('no-webgpu'); return; }
  if (W.matchMedia('(prefers-reduced-motion: reduce)').matches) { fallback('reduced-motion'); return; }
  if (W.innerWidth < 760) { fallback('mobile'); return; }
  if (sess('gpu-crashed') === '1') { fallback('crashed'); return; }

  var art = null;
  try {
    var node = D.getElementById('hero-field-artifact');
    if (node) art = JSON.parse(node.textContent);
  } catch (e) {}
  if (!art) { fallback('no-artifact'); return; }

  /* ---------- контент страницы поверх фиксированного канваса ------------- */
  var fix = D.createElement('style');
  fix.textContent = 'main,nav,header,footer,section{position:relative;z-index:1}';
  D.head.appendChild(fix);

  var canvas = D.createElement('canvas');
  canvas.id = 'heroField';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:0;' +
    'pointer-events:none;opacity:0;transition:opacity 1.8s ease';
  D.body.insertBefore(canvas, D.body.firstChild);
  D.documentElement.classList.add('has-hero-field');

  /* ---------- курсор: цель и сглаженное значение ------------------------- */
  var mT = [0.5, 0.42], mC = [0.5, 0.42];
  D.addEventListener('pointermove', function (e) {
    mT[0] = e.clientX / W.innerWidth; mT[1] = e.clientY / W.innerHeight;
  }, { passive: true });

  var hero = D.querySelector('.hero') || D.body;
  var heroVisible = true;
  if ('IntersectionObserver' in W) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { heroVisible = e.isIntersecting; });
    }, { threshold: 0.02 }).observe(hero);
  }

  var ACCENT = [0x7b / 255, 0xc4 / 255, 0xa8 / 255];
  var WARM = [0xd6 / 255, 0x98 / 255, 0x54 / 255];
  var INK = [0x11 / 255, 0x15 / 255, 0x24 / 255];

  function crash(e) {
    sess('gpu-crashed', '1');
    try { canvas.remove(); } catch (e2) {}
    fallback('crashed');
    console.warn('[hero-field] поле упало, страница живёт как раньше:', (e && e.message) || e);
  }

  import_().then(function (vgpu) {
    return vgpu.init().then(function (gpu) {
      var surf = vgpu.surface(gpu, canvas, {
        dpr: [0.7, Math.max(0.7, Math.min(1.5, W.devicePixelRatio || 1))],
        alphaMode: 'premultiplied'
      });
      var aspect = W.innerWidth / Math.max(1, W.innerHeight);
      var fx = vgpu.effect(gpu, art, {
        blend: 'additive',
        set: { params: {
          time: 0, texel: surf.texelSize || [1 / 1280, 1 / 720],
          accent: ACCENT, warm: WARM, ink: INK,
          mouse: [0.5, 0.42], aspect: aspect, mask: 1.0, intensity: state.intensity
        } }
      });
      var clock = vgpu.clock(gpu);
      var plan = [30, 20, 12], ix = 0, handle = null, avg = 16;

      function resize() {
        var a = W.innerWidth / Math.max(1, W.innerHeight);
        try { fx.set({ params: { texel: surf.texelSize || [1 / 1280, 1 / 720], aspect: a } }); } catch (e) {}
      }
      W.addEventListener('resize', resize, { passive: true });

      function start() {
        var t0 = performance.now(), n = 0;
        handle = vgpu.frameLoop(gpu, function (f) {
          if (!heroVisible) return;
          mC[0] += (mT[0] - mC[0]) * 0.055;
          mC[1] += (mT[1] - mC[1]) * 0.055;
          fx.set({ params: { time: (performance.now() - t0) / 1000, mouse: mC, intensity: state.intensity } });
          var a = performance.now();
          f.pass(surf, fx);
          avg = avg * 0.9 + (performance.now() - a) * 0.1;
          state.avg = avg; n++;
          if (state.forced || n < 45) return;
          if (avg > 30 && ix < plan.length - 1) {
            ix++; handle.stop(); state.fps = plan[ix];
            setTimeout(start, 0); n = 0;
          } else if (avg > 46 && ix === plan.length - 1) {
            handle.stop(); state.running = false; state.mode = 'frozen';
          }
        }, { fps: plan[ix] });
        state.running = true; state.fps = plan[ix]; state.mode = 'gpu';
        D.documentElement.setAttribute('data-hero-field', 'gpu@' + plan[ix] + 'fps');
      }
      start();

      requestAnimationFrame(function () { canvas.style.opacity = '1'; });

      D.addEventListener('visibilitychange', function () {
        if (!handle) return;
        if (D.hidden) { handle.stop(); state.running = false; }
        else if (state.mode === 'gpu') { ix = 0; start(); }
      });
    });
  }).catch(crash);

  /* runtime — классический (IIFE) бандл: file:// не блокирует такой тег */
  function import_() {
    if (W.vgpuR) return Promise.resolve(W.vgpuR);
    return new Promise(function (res, rej) {
      var s = D.createElement('script');
      s.src = 'vgpu-hero-runtime.js';
      s.onload = function () { W.vgpuR ? res(W.vgpuR) : rej(new Error('runtime не отдал vgpuR')); };
      s.onerror = function () { rej(new Error('runtime не загрузился')); };
      D.head.appendChild(s);
    });
  }
})();
