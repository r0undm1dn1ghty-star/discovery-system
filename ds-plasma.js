/**
 * DS Plasma — процедурный фон. Поле шума центрируется на бренд-тоне страницы
 * (#111524 = rgb(17,21,36)): средний тон кадра равен бренду ПО ПОСТРОЕНИЮ,
 * плазма — только мягкие отклонения от него (небо-синяя дымка), поэтому фон
 * читается тёмно-синим, а не чёрным. Отклонение ограничено ±9*TONE (≤11.7 на
 * канал) — фон не уходит за бренд-допуск. Виньетка больше НЕ затемняет края,
 * а сжимает контраст плазмы к бренду (фокус в центре без чёрных углов).
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

  // База фона = токен страницы --bg (#111524). Это не «ещё один цвет темы»,
  // а точка привязки: кадр плазмы центрируется на неё каждый кадр.
  // Читаем её у самой страницы, чтобы плазма не разъехалась с фоном при смене
  // темы; если прочитать не удалось или вышло почти чёрным — константа #111524.
  var BRAND = (function () {
    var FALLBACK = [17, 21, 36], els = [document.body, document.documentElement];
    for (var i = 0; i < els.length; i++) {
      if (!els[i]) continue;
      var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/.exec(
        getComputedStyle(els[i]).backgroundColor);
      if (!m) continue;
      var a = (m[4] === undefined) ? 1 : parseFloat(m[4]);
      var c = [+m[1], +m[2], +m[3]];
      if (a > 0.99 && Math.max(c[0], c[1], c[2]) >= 20) return c; // не прозрачный и не чёрный
    }
    return FALLBACK;
  })();
  var AMP = 9;                    // амплитуда отклонения от BRAND
  var TONE = [0.72, 0.92, 1.3];   // синий уклон: подсветка уходит в синий, тень — в нейтрально-тёмный
  var MID_CURVE = 0.8;            // мягкая кривая середины — дымка шире, крайние значения реже
  var EDGE_MAX = 0.55;            // максимум сжатия контраста на самых углах (0.45 остаётся)
  var EDGE_K = 0.5;               // как быстро включается виньетка от центра

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  // z-index:-1 (не 0): позиционированный слой с z-index:0 рисуется ПОВЕРХ
  // неспозиционированного контента — на страницах без <main> (calculator,
  // services, policy) плазма накрывала карточки. Отрицательный слой всегда
  // под контентом независимо от структуры страницы.
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
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
  // палитра убрана: кадр считается прямо от бренд-тона (BRAND) — см. drawFrame
  var buf = null, bufCtx = null, field = null;
  function drawFrame() {
    if (!W || !H) return; // размер ещё не посчитан (reduced-motion рисует первый кадр до rAF resize)
    if (!buf) { buf = document.createElement('canvas'); bufCtx = buf.getContext('2d'); }
    if (buf.width !== W || buf.height !== H) { buf.width = W; buf.height = H; }
    var cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(H / CELL) + 1;
    var cells = cols * rows;
    if (!field || field.length !== cells) field = new Float64Array(cells);
    var img = bufCtx.createImageData(cols, rows);
    var data = img.data;
    var ox = (px - 0.5) * 0.9, oy = (py - 0.5) * 0.9; // pointer distortion
    var i, j, v;
    // ── проход 1: поле шума + среднее/размах кадра ───────────────────────────
    var sum = 0;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        v = fbm(i * 0.028 + ox * 1.6, j * 0.028 + oy * 1.6, t);
        field[j * cols + i] = v;
        sum += v;
      }
    }
    var mean = sum / cells, maxdev = 1e-6;
    for (i = 0; i < cells; i++) {
      var dd = field[i] - mean; if (dd < 0) dd = -dd;
      if (dd > maxdev) maxdev = dd;
    }
    var sSum = 0;
    for (i = 0; i < cells; i++) {
      var sv = (field[i] - mean) / maxdev;             // [-1..1] — размах кадра всегда используется
      sv = (sv < 0 ? -1 : 1) * Math.pow(sv < 0 ? -sv : sv, MID_CURVE);
      field[i] = sv; sSum += sv;
    }
    var sMean = sSum / cells;                          // центрируем ещё раз → средний тон кадра = BRAND
    // ── проход 2: цвет = BRAND + AMP*s*TONE, к краям контраст сжимается ──────
    var p = 0;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        // виньетка: фокус в центре через сжатие контраста плазмы, БЕЗ затемнения фона
        var vx = Math.abs(i / cols - 0.5) * 2, vy = Math.abs(j / rows - 0.5) * 2;
        var edge = Math.max(0, (vx * vx + vy * vy) - 0.42) * 1.4;
        var k = 1 - Math.min(EDGE_MAX, edge * EDGE_K);
        var s = field[j * cols + i] - sMean;
        if (s > 1) s = 1; else if (s < -1) s = -1;     // |отклонение| ≤ AMP*TONE < 12
        data[p++] = BRAND[0] + AMP * s * TONE[0] * k;
        data[p++] = BRAND[1] + AMP * s * TONE[1] * k;
        data[p++] = BRAND[2] + AMP * s * TONE[2] * k;
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
    get size() { return [W, H]; },
    get brand() { return BRAND.slice(); } // база фона, к которой привязан кадр (для QA-замера)
  };
})();
