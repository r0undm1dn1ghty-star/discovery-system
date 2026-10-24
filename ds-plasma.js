/**
 * DS Plasma — процедурный фон (оригинальная палитра Closing Plasma: #0d0d14 / #1f2540 / #4a6191).
 * Vanilla JS + Canvas 2D, без зависимостей. Fixed-слой за контентом, pointer-reactive.
 * Правила: reduced-motion → статичный кадр; мобильные → ЖИВОЙ экономный режим
 * (меньше сетка, dpr 1, 16 fps — анимированный фон работает и на телефоне);
 * kill-switch: localStorage 'ds-plasma=off'. Вкладка скрыта → анимация паркуется.
 * Размер берётся от clientWidth/clientHeight (адресная строка не дёргает кадр),
 * сам CSS-размер закреплён в ds-base.css.
 */
(function () {
  'use strict';
  try {
    if (localStorage.getItem('ds-plasma') === 'off') return;
  } catch (e) {}

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqSmall = window.matchMedia('(max-width: 760px)');
  var LITE = mqSmall.matches;          // экономный режим для телефона
  var STATIC = reduced;                // статичный кадр — только по просьбе системы
  var FPS = LITE ? 16 : 24;
  var DPR_CAP = LITE ? 1 : 2;
  var CELL_BASE = LITE ? 34 : 26;      // крупнее сетка = меньше работы на кадр

  var A = [13, 13, 20];    // #0d0d14 dark base
  var B = [31, 37, 64];    // #1f2540 mid
  var C = [74, 97, 145];   // #4a6191 highlight

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';
  document.body.appendChild(cv);
  // контент выше
  document.body.style.position = 'relative';
  var style = document.createElement('style');
  style.textContent = 'main,nav,header,footer,section{position:relative;z-index:1}';
  document.head.appendChild(style);

  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  var W = 0, H = 0;

  function metrics() {
    // clientWidth/Height стабильнее innerWidth/Height: адресная строка не дёргает кадр
    var w = document.documentElement.clientWidth || innerWidth || 320;
    var h = document.documentElement.clientHeight || innerHeight || 480;
    return [Math.max(1, w), Math.max(1, h)];
  }
  var resizeQueued = false;
  function resize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () {
      resizeQueued = false;
      var m = metrics();
      W = cv.width = Math.floor(m[0] * dpr);
      H = cv.height = Math.floor(m[1] * dpr);
      // CSS-размер закреплён в ds-base.css (100%/inset:0) — здесь не трогаем
      if (STATIC) drawStatic();
    });
  }

  var px = 0.5, py = 0.5, tx = 0.5, ty = 0.5; // указатель (норм.)
  var t = 0;
  var CELL = CELL_BASE * dpr; // сетка плазмы (режим задаёт плотность)

  // value-noise: 3 октавы, быстрый hash-based
  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
    h = (h ^ (h >> 13)) * 1274126177 | 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function noise(x, y, s) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
    var c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, t) {
    var n = 0, amp = 0.55, f = 1;
    for (var o = 0; o < 3; o++) {
      n += amp * noise(x * f + t * (o + 1) * 0.35, y * f - t * (o + 1) * 0.22, o * 7 + 3);
      amp *= 0.5; f *= 2.1;
    }
    return n;
  }
  // палитра: n∈[0,1] → A→B→C
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function shade(n) {
    var base = mix(A, B, Math.min(1, n * 1.6));
    var hi = (n > 0.62) ? (n - 0.62) / 0.38 : 0; // highlights редко
    var c = mix(base, C, hi * 0.8);
    return c;
  }

  var buf = null, bufCtx = null;
  function drawFrame() {
    if (!buf) { buf = document.createElement('canvas'); bufCtx = buf.getContext('2d'); }
    if (buf.width !== W || buf.height !== H) { buf.width = W; buf.height = H; }
    var cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(H / CELL) + 1;
    var img = bufCtx.createImageData(cols, rows);
    var data = img.data;
    var p = 0;
    var ox = (px - 0.5) * 0.9, oy = (py - 0.5) * 0.9; // pointer distortion
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var nx = i * 0.028 + ox * 1.6, ny = j * 0.028 + oy * 1.6;
        var n = fbm(nx, ny, t);
        // виньетка к краям — фокус в центре
        var vx = Math.abs(i / cols - 0.5) * 2, vy = Math.abs(j / rows - 0.5) * 2;
        var edge = Math.max(0, (vx * vx + vy * vy) - 0.42) * 1.4;
        var c = shade(n + edge * 0.35);
        var dim = 1 - Math.min(0.55, edge); // затемнение краёв
        data[p++] = c[0] * dim;
        data[p++] = c[1] * dim;
        data[p++] = c[2] * dim;
        data[p++] = 255;
      }
    }
    bufCtx.putImageData(img, 0, 0);
    // растягиваем малую сетку на весь экран (сглаживание = мягкость)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(buf, 0, 0, cols, rows, 0, 0, W, H);
  }

  function drawStatic() { t = 7.3; drawFrame(); } // фиксированный красивый кадр

  var running = false, raf = 0, last = 0;
  function loop(ts) {
    if (!running) return;
    if (ts - last > 1000 / FPS) { // fps по режиму: 24 desktop / 16 mobile
      last = ts;
      t += 0.012;
      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      drawFrame();
    }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running && !STATIC) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  if (mqSmall.addEventListener) {
    mqSmall.addEventListener('change', function (e) {
      LITE = e.matches; FPS = LITE ? 16 : 24; DPR_CAP = LITE ? 1 : 2;
      CELL_BASE = LITE ? 34 : 26; CELL = CELL_BASE * (dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP));
      resize();
    });
  }
  if (!STATIC) {
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / innerWidth; ty = e.clientY / innerHeight;
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  resize();
  if (STATIC) drawStatic(); else start();
  // статус для QA-замера: живая ли анимация и в каком режиме (без данных пользователя)
  window.__dsPlasma = {
    get mode() { return STATIC ? 'static' : (LITE ? 'lite' : 'full'); },
    get running() { return running; },
    get fps() { return FPS; },
    get size() { return [W, H]; }
  };
})();
