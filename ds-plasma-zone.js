/**
 * DS Plasma Zone — зонная копия живого движка ds-plasma.js для market.html.
 * Отличие от оригинала: фон рисуется не fixed-слоем на весь вьюпорт, а отдельным
 * canvas внутри каждого хоста [data-plasma] (герой #heroFx, тёмная полка #rheroFx).
 * BRAND берётся НЕ из body (там светлый #f2f4f6), а из computed backgroundColor
 * ближайшей тёмной зоны-предка хоста (у market это --dark: #0f1730); если зона не
 * найдена или цвет не тёмный — фолбэк #0f1730. Всё остальное — механика
 * ds-plasma.js без изменений: kill-switch localStorage 'ds-plasma=off',
 * reduced-motion → статичный кадр, LITE-режим телефона (16 fps, dpr 1, сетка 34),
 * парковка при скрытой вкладке, pointer-reactive, виньетка сжимает контраст к
 * бренду (не чернит края) — и только для хостов БЕЗ data-plasma-full.
 * Не является заменой ds-plasma.js: его используют 10 страниц, этот файл — только market.html.
 */
(function () {
  'use strict';
  try {
    if (localStorage.getItem('ds-plasma') === 'off') return;
  } catch (e) {}

  var STATIC = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /(?:\?|&)static=1(?:&|$)/.test(window.location.search);
  var mqSmall = window.matchMedia('(max-width: 760px)');
  var LITE = mqSmall.matches;          // экономный режим для телефона
  var FPS = LITE ? 16 : 24;
  var DPR_CAP = LITE ? 1 : 2;
  var CELL_BASE = LITE ? 34 : 26;

  var FALLBACK = [15, 23, 48];         // #0f1730 — бренд тёмных зон market.html
  var AMP = 26;                        // амплитуда как на главной (index sfer-light-v4)
  var TONE = [0.85, 0.95, 1.35];
  var MID_CURVE = 0.8;
  var EDGE_MAX = 0.55;
  var EDGE_K = 0.5;
  var MAXPX = 1000000;                 // потолок пикселей на кадр (защита больших зон)

  // Бренд зоны = computed backgroundColor ближайшего непрозрачного тёмного предка.
  // Тёмный = непрозрачный и не светлый (max канал < 100) — светлый body (#f2f4f6)
  // не может быть базой плазмы тёмной зоны.
  function zoneBrand(host) {
    var el = host;
    while (el && el !== document.documentElement) {
      var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(
        getComputedStyle(el).backgroundColor);
      if (m) {
        var a = (m[4] === undefined) ? 1 : parseFloat(m[4]);
        var c = [+m[1], +m[2], +m[3]];
        if (a > 0.99 && Math.max(c[0], c[1], c[2]) < 100) return c;
      }
      el = el.parentElement;
    }
    return FALLBACK;
  }

  function Inst(host) {
    this.host = host;
    this.vis = true;
    this.brand = zoneBrand(host);
    this.cv = document.createElement('canvas');
    this.cv.setAttribute('aria-hidden', 'true');
    this.cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
    host.appendChild(this.cv);
    this.ctx = this.cv.getContext('2d');
    this.W = 0; this.H = 0; this.dpr = 1; this.CELL = CELL_BASE; this.edge = true;
    this.buf = null; this.bufCtx = null; this.field = null;
  }
  Inst.prototype.metrics = function () {
    var r = this.host.getBoundingClientRect();
    return [r.width, r.height];
  };
  Inst.prototype.resize = function () {
    var m = this.metrics(), w = Math.max(1, m[0]), h = Math.max(1, m[1]);
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var cap = Math.sqrt(MAXPX / (w * h)); if (cap < dpr) dpr = cap; if (dpr < 0.3) dpr = 0.3;
    this.dpr = dpr;
    this.W = this.cv.width = Math.max(1, Math.floor(w * dpr));
    this.H = this.cv.height = Math.max(1, Math.floor(h * dpr));
    this.CELL = CELL_BASE * dpr;
    // виньетка — только для зон не выше ~1.6 вьюпорта; data-plasma-full отключает её
    this.edge = !this.host.hasAttribute('data-plasma-full') && this.H <= dpr * (window.innerHeight || 900) * 1.6;
    if (STATIC) this.draw();
  };

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

  Inst.prototype.draw = function () {
    if (!this.W || !this.H) return;
    if (!this.buf) { this.buf = document.createElement('canvas'); this.bufCtx = this.buf.getContext('2d'); }
    if (this.buf.width !== this.W || this.buf.height !== this.H) { this.buf.width = this.W; this.buf.height = this.H; }
    var cols = Math.ceil(this.W / this.CELL) + 1, rows = Math.ceil(this.H / this.CELL) + 1, cells = cols * rows;
    if (!this.field || this.field.length !== cells) this.field = new Float64Array(cells);
    var img = this.bufCtx.createImageData(cols, rows), data = img.data;
    var ox = (px - 0.5) * 0.9, oy = (py - 0.5) * 0.9, i, j, v, sum = 0;
    for (j = 0; j < rows; j++) { for (i = 0; i < cols; i++) { v = fbm(i * 0.028 + ox * 1.6, j * 0.028 + oy * 1.6, t); this.field[j * cols + i] = v; sum += v; } }
    var mean = sum / cells, maxdev = 1e-6;
    for (i = 0; i < cells; i++) { var dd = this.field[i] - mean; if (dd < 0) dd = -dd; if (dd > maxdev) maxdev = dd; }
    var sSum = 0;
    for (i = 0; i < cells; i++) { var sv = (this.field[i] - mean) / maxdev; sv = (sv < 0 ? -1 : 1) * Math.pow(sv < 0 ? -sv : sv, MID_CURVE); this.field[i] = sv; sSum += sv; }
    var sMean = sSum / cells, p = 0, useEdge = this.edge;
    var B = this.brand;
    for (j = 0; j < rows; j++) { for (i = 0; i < cols; i++) {
      var k = 1;
      if (useEdge) {
        // виньетка: сжатие контраста к бренду у краёв, БЕЗ затемнения фона
        var vx = Math.abs(i / cols - 0.5) * 2, vy = Math.abs(j / rows - 0.5) * 2;
        var edge = Math.max(0, (vx * vx + vy * vy) - 0.42) * 1.4;
        k = 1 - Math.min(EDGE_MAX, edge * EDGE_K);
      }
      var s = this.field[j * cols + i] - sMean; if (s > 1) s = 1; else if (s < -1) s = -1;
      data[p++] = B[0] + AMP * s * TONE[0] * k;
      data[p++] = B[1] + AMP * s * TONE[1] * k;
      data[p++] = B[2] + AMP * s * TONE[2] * k;
      data[p++] = 255;
    } }
    this.bufCtx.putImageData(img, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.drawImage(this.buf, 0, 0, cols, rows, 0, 0, this.W, this.H);
  };

  var hosts = [].slice.call(document.querySelectorAll('[data-plasma]'));
  if (!hosts.length) return;
  var insts = hosts.map(function (h) { return new Inst(h); });

  function resizeAll() { insts.forEach(function (o) { o.resize(); }); }
  function drawAll() { insts.forEach(function (o) { if (o.vis) o.draw(); }); }
  function drawStatic() { t = 7.3; drawAll(); }

  var running = false, raf = 0, last = 0;
  var px = 0.5, py = 0.5, tx = 0.5, ty = 0.5, t = 0;
  function loop(ts) {
    if (!running) return;
    if (ts - last > 1000 / FPS) { // fps по режиму: 24 desktop / 16 mobile
      last = ts;
      t += 0.012;
      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      drawAll();
    }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running && !STATIC) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  var rq = false;
  function resize() {
    if (rq) return;
    rq = true;
    requestAnimationFrame(function () { rq = false; resizeAll(); });
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  if (mqSmall.addEventListener) {
    mqSmall.addEventListener('change', function (e) {
      LITE = e.matches; FPS = LITE ? 16 : 24; DPR_CAP = LITE ? 1 : 2;
      CELL_BASE = LITE ? 34 : 26;
      resize();
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        for (var i = 0; i < insts.length; i++) if (insts[i].host === e.target) insts[i].vis = e.isIntersecting;
      });
    }, { rootMargin: '160px' });
    insts.forEach(function (o) { io.observe(o.host); });
  }
  if (!STATIC) {
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / Math.max(1, document.documentElement.clientWidth);
      ty = e.clientY / Math.max(1, document.documentElement.clientHeight);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  resizeAll();
  if (STATIC) drawStatic(); else start();
  // статус для QA-замера: живая ли анимация и в каком режиме (без данных пользователя)
  window.__dsPlasma = {
    get mode() { return STATIC ? 'static' : (LITE ? 'lite' : 'full'); },
    get running() { return running; },
    get fps() { return FPS; },
    get hosts() { return insts.map(function (o) { return { id: o.host.id, size: [o.W, o.H], brand: o.brand, vis: o.vis }; }); }
  };
})();
