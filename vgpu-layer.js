/* ==========================================================================
   vgpu-layer.js — GPU-слои для лендинга Discovery System (ПОЛИГОН)
   4 слоя: orb (hero), chaos→order (facts), field (systems), build (finale)
   Kill-switch: в консоли `localStorage.setItem('gpu-off','1')` + F5.
   Авто-отключение: нет WebGPU, reduce-motion, мобильный, 2 вкладки.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- kill-switch и предохранители ---------- */
  var KILLS = { orb: true, facts: true, systems: true, finale: true };
  try {
    var saved = JSON.parse(localStorage.getItem('gpu-layers') || 'null');
    if (saved) for (var k in saved) if (k in KILLS) KILLS[k] = !!saved[k];
  } catch (e) {}
  window.__gpuToggle = function (layer, on) {
    if (layer === 'all') { KILLS.orb = KILLS.facts = KILLS.systems = KILLS.finale = on !== false; }
    else if (layer in KILLS) KILLS[layer] = on !== false;
    localStorage.setItem('gpu-layers', JSON.stringify(KILLS));
    location.reload();
  };

  var OFF = false;
  try { OFF = localStorage.getItem('gpu-off') === '1'; } catch (e) {}
  if (OFF) return;

  if (!navigator.gpu) return;                       // нет WebGPU — фолбэк не нужен, страница как была
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 720) return;              // мобильные: не тратим батарею
  if (sessionStorage.getItem('gpu-crashed') === '1') return; // упало один раз — не зацикливаемся

  /* ---------- общая обвязка ---------- */
  var ACCENT = [0.482, 0.769, 0.659]; // #7bc4a8

  function mount(canvas, opts) {
    // canvas растянут контейнером; surface сам подхватит размер
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }

  function visibleRatio(el) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    var vh = Math.min(r.bottom, h) - Math.max(r.top, 0);
    return Math.max(0, Math.min(1, vh / Math.max(1, Math.min(r.height, h))));
  }

  /* реальная видимость секции — чтобы не жечь GPU впустую */
  function sectionWatcher(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(1); return function () {}; }
    var state = { vis: 0 };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { state.vis = e.isIntersecting ? 1 : 0; cb(state.vis); });
    }, { threshold: 0.05 });
    io.observe(el);
    return function () { io.disconnect(); };
  }

  /* ---------- запуск ---------- */
  Promise.all([
    import('./vgpu-runtime.min.js'),
    fetch('./prepared-orb.json').then(function (r) { return r.json(); }),
    fetch('./prepared-chaos.json').then(function (r) { return r.json(); }),
    fetch('./prepared-field.json').then(function (r) { return r.json(); }),
    fetch('./prepared-build.json').then(function (r) { return r.json(); }),
  ]).then(function (res) {
    var vgpu = res[0];
    var art = { orb: res[1], chaos: res[2], field: res[3], build: res[4] };

    return vgpu.init().then(function (gpu) {
      var loops = [];
      var started = 0;

      function addLoop(handle) { loops.push(handle); }

      /* ========== СЛОЙ 1: ORB — hero ========== */
      if (KILLS.orb) {
        var hero = document.querySelector('.hero');
        if (hero) {
          var stage = document.createElement('div');
          stage.style.cssText = 'position:absolute;left:0;right:0;top:0;height:62%;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0';
          var c1 = document.createElement('canvas');
          c1.style.cssText = 'width:min(620px,80vw);height:min(620px,80vw);opacity:0;transition:opacity 1.4s ease';
          stage.appendChild(c1);
          hero.insertBefore(stage, hero.firstChild);
          mount(c1);

          var s = vgpu.surface(gpu, c1, { dpr: [1, 2], alphaMode: 'premultiplied' });
          var orb = vgpu.effect(gpu, art.orb, { blend: 'additive', set: { params: { time: 0, texel: [1/640, 1/640], accent: ACCENT, ink: [0.067, 0.082, 0.141] } } });
          var clock = vgpu.clock(gpu);
          var w1 = sectionWatcher(hero, function (vis) { stage.style.display = vis ? '' : 'none'; });
          addLoop(vgpu.frameLoop(gpu, function (f) {
            orb.set({ params: { time: clock.time } });
            f.pass(s, orb);
          }, { fps: 30 }));
          started++;
          requestAnimationFrame(function () { c1.style.opacity = '0.9'; });
        }
      }

      /* ========== СЛОЙ 2: CHAOS→ORDER — секция фактов (фон цифр) ========== */
      if (KILLS.facts) {
        var facts = document.getElementById('facts');
        if (facts) {
          facts.style.position = 'relative';
          var wrapF = document.createElement('div');
          wrapF.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.55';
          var c2 = document.createElement('canvas');
          wrapF.appendChild(c2);
          facts.insertBefore(wrapF, facts.firstChild);
          // контент секции поверх (инлайн, чтобы победить любые css)
          var fwrap = facts.querySelector('.wrap');
          if (fwrap) { fwrap.style.setProperty('position', 'relative', 'important'); fwrap.style.setProperty('z-index', '3', 'important'); }
          mount(c2);

          var s2 = vgpu.surface(gpu, c2, { dpr: [1, 2], alphaMode: 'premultiplied' });
          var chaos = vgpu.effect(gpu, art.chaos, { blend: 'additive', set: { params: { time: 0, texel: [1/960, 1/480], accent: ACCENT, ink: [0.067, 0.082, 0.141] } } });
          var clock2 = vgpu.clock(gpu);
          var w2 = sectionWatcher(facts, function (vis) { wrapF.style.display = vis ? '' : 'none'; });
          addLoop(vgpu.frameLoop(gpu, function (f) {
            chaos.set({ params: { time: clock2.time } });
            f.pass(s2, chaos);
          }, { fps: 24 }));
          started++;
        }
      }

      /* ========== СЛОЙ 3: FIELD — секция систем ========== */
      if (KILLS.systems) {
        var sys = document.getElementById('systems');
        if (sys) {
          sys.style.position = 'relative';
          var wrapS = document.createElement('div');
          wrapS.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.5';
          var c3 = document.createElement('canvas');
          wrapS.appendChild(c3);
          sys.insertBefore(wrapS, sys.firstChild);
          var swrap = sys.querySelector('.wrap');
          if (swrap) { swrap.style.setProperty('position', 'relative', 'important'); swrap.style.setProperty('z-index', '3', 'important'); }
          mount(c3);

          var s3 = vgpu.surface(gpu, c3, { dpr: [1, 2], alphaMode: 'premultiplied' });
          var field = vgpu.effect(gpu, art.field, { blend: 'additive', set: { params: { time: 0, texel: [1/960, 1/400], accent: ACCENT, ink: [0.067, 0.082, 0.141], scroll: [0, 1] } } });
          var clock3 = vgpu.clock(gpu);
          var w3 = sectionWatcher(sys, function (vis) { wrapS.style.display = vis ? '' : 'none'; });
          addLoop(vgpu.frameLoop(gpu, function (f) {
            field.set({ params: { time: clock3.time, scroll: [0, visNow(sys)] } });
            f.pass(s3, field);
          }, { fps: 24 }));
          started++;
        }
      }

      /* ========== СЛОЙ 4: BUILD — финальный CTA ========== */
      if (KILLS.finale) {
        var fin = document.querySelector('.finale');
        if (fin) {
          fin.style.position = 'relative';
          var wrapB = document.createElement('div');
          wrapB.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.8';
          var c4 = document.createElement('canvas');
          wrapB.appendChild(c4);
          fin.insertBefore(wrapB, fin.firstChild);
          var bwrap = fin.querySelector('.wrap');
          if (bwrap) { bwrap.style.setProperty('position', 'relative', 'important'); bwrap.style.setProperty('z-index', '3', 'important'); }
          mount(c4);

          var s4 = vgpu.surface(gpu, c4, { dpr: [1, 2], alphaMode: 'premultiplied' });
          var build = vgpu.effect(gpu, art.build, { blend: 'additive', set: { params: { time: 0, texel: [1/960, 1/500], accent: ACCENT, ink: [0.067, 0.082, 0.141], build: 0 } } });
          var clock4 = vgpu.clock(gpu);
          var w4 = sectionWatcher(fin, function (vis) { wrapB.style.display = vis ? '' : 'none'; });
          addLoop(vgpu.frameLoop(gpu, function (f) {
            // build = доскролл до финального CTA: 0 в хаосе → 1 собрано
            var r = fin.getBoundingClientRect();
            var prog = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight * 0.9)));
            var eased = prog * prog * (3 - 2 * prog);
            build.set({ params: { time: clock4.time, build: eased } });
            f.pass(s4, build);
          }, { fps: 30 }));
          started++;
        }
      }

      window.__gpuLayersStarted = started;
      console.log('[vgpu] слоёв запущено: ' + started);

      /* остановка при уходе со вкладки */
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) loops.forEach(function (h) { try { h.stop(); } catch (e) {} });
      });
    });
  }).catch(function (e) {
    console.warn('[vgpu] слой упал, страница живёт как раньше:', e && e.message || e);
    try { sessionStorage.setItem('gpu-crashed', '1'); } catch (e2) {}
  });

  function visNow(el) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || 1;
    return Math.max(0, Math.min(1, (h - r.top) / (h * 0.6)));
  }
})();
