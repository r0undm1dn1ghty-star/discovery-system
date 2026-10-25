// qa/shots-plasma/sim.js — точная офлайн-модель кадра плазмы (те же hash/noise/fbm/drawFrame).
// Печатает статистику по сетке кадра и по точкам фона из JSON (empty[] из shoot.js).
// Запуск: node qa/shots-plasma/sim.js <points.json> [candidates.json]
const fs = require('fs');

// --- копия математики из ds-plasma.js (legacy-режим) ---
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

// --- геометрия кадра как в drawFrame() ---
function buildGrid(W, H, cell, t) {
  const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
  const g = new Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const nx = i * 0.028, ny = j * 0.028; // ox=oy=0 (мышь не двигалась)
    const vx = Math.abs(i / cols - 0.5) * 2, vy = Math.abs(j / rows - 0.5) * 2;
    const edge = Math.max(0, (vx * vx + vy * vy) - 0.42) * 1.4;
    g[j * cols + i] = { n: fbm(nx, ny, t), edge };
  }
  return { cols, rows, g };
}

const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
function shadeLegacy(n, A, B, C) {
  var base = mix(A, B, Math.min(1, n * 1.6));
  var hi = (n > 0.62) ? (n - 0.62) / 0.38 : 0;
  return mix(base, C, hi * 0.8);
}
function shadeBrand(n, cfg) {
  var d = (n - cfg.kT) * 2;                       // [-1..1] вокруг базовой точки
  var s = cfg.soft ? d * (0.55 + 0.45 * d * d) : d; // мягкая нелинейность
  return [cfg.brand[0] + cfg.amp * s * cfg.tone[0],
          cfg.brand[1] + cfg.amp * s * cfg.tone[1],
          cfg.brand[2] + cfg.amp * s * cfg.tone[2]];
}
// --- НОВАЯ СХЕМА (то, что пойдёт в ds-plasma.js) ---
// 1) поле n центрируется по среднему кадра и нормируется на размах кадра,
//    поэтому средний тон кадра == brand ПО ПОСТРОЕНИЮ (любой t, любой вьюпорт);
// 2) отклонение от brand ограничено ±amp*tone — кадр не уходит за допуск ±12;
// 3) виньетка не затемняет, а сжимает контраст плазмы к brand (фокус в центре).
function brandField(grid, cfg) {
  const n = grid.cols * grid.rows;
  const s = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += grid.g[i].n;
  const mean = sum / n;
  let maxdev = 1e-6;
  for (let i = 0; i < n; i++) maxdev = Math.max(maxdev, Math.abs(grid.g[i].n - mean));
  const pow = cfg.pow === undefined ? 1 : cfg.pow;
  for (let i = 0; i < n; i++) {
    let v = (grid.g[i].n - mean) / maxdev;          // [-1..1]
    const a = Math.abs(v);
    v = (v < 0 ? -1 : 1) * Math.pow(a, pow);        // мягкая кривая середины
    s[i] = v;
  }
  // ещё раз центруем (кривая нечётная, но распределение не идеально симметрично)
  let s2 = 0;
  for (let i = 0; i < n; i++) s2 += s[i];
  s2 /= n;
  for (let i = 0; i < n; i++) s[i] = Math.max(-1, Math.min(1, s[i] - s2));
  return s;
}
function gridColor(cell, cfg) {
  const { n, edge } = cell;
  if (cfg.mode === 'legacy') {
    const c = shadeLegacy(n + edge * cfg.edgeAmp, cfg.A, cfg.B, cfg.C);
    const dim = 1 - Math.min(cfg.dimMax, edge);
    return [c[0] * dim, c[1] * dim, c[2] * dim];
  }
  const c = shadeBrand(n + edge * cfg.edgeAmp, cfg);
  const dim = 1 - Math.min(cfg.dimMax, edge * cfg.dimK);
  return [c[0] * dim + cfg.brand[0] * (1 - dim), c[1] * dim + cfg.brand[1] * (1 - dim), c[2] * dim + cfg.brand[2] * (1 - dim)];
}
// цвет клетки в новой схеме: brand + amp*s*tone, контраст к краям сжимается
function brandColor(cell, sIdx, s, cfg) {
  const { edge } = cell;
  const k = 1 - Math.min(cfg.dimMax, edge * cfg.dimK);
  const sv = s[sIdx];
  return [cfg.brand[0] + cfg.amp * sv * cfg.tone[0] * k,
          cfg.brand[1] + cfg.amp * sv * cfg.tone[1] * k,
          cfg.brand[2] + cfg.amp * sv * cfg.tone[2] * k];
}
// --- цвет всего кадра в сетке (до растяжения) ---
function frameColors(grid, cfg) {
  const n = grid.cols * grid.rows;
  const out = new Array(n);
  const s = cfg.mode === 'brand' ? brandField(grid, cfg) : null;
  for (let i = 0; i < n; i++) out[i] = cfg.mode === 'brand' ? brandColor(grid.g[i], i, s, cfg) : gridColor(grid.g[i], cfg);
  return out;
}
// билинейный сэмпл растянутого кадра в пикселе (x,y)
function sample(colors, grid, W, H, x, y) {
  const { cols, rows } = grid;
  const sx = (x + 0.5) * cols / W - 0.5, sy = (y + 0.5) * rows / H - 0.5;
  const x0 = Math.floor(sx), y0 = Math.floor(sy);
  const fx = sx - x0, fy = sy - y0;
  const cl = (i, j) => colors[Math.min(rows - 1, Math.max(0, j)) * cols + Math.min(cols - 1, Math.max(0, i))];
  const c00 = cl(x0, y0), c10 = cl(x0 + 1, y0), c01 = cl(x0, y0 + 1), c11 = cl(x0 + 1, y0 + 1);
  const out = [];
  for (let k = 0; k < 3; k++) {
    const a = c00[k] + (c10[k] - c00[k]) * fx, b = c01[k] + (c11[k] - c01[k]) * fx;
    out.push(a + (b - a) * fy);
  }
  return out;
}

const ptsFile = process.argv[2];
const candFile = process.argv[3];
const PTS = JSON.parse(fs.readFileSync(ptsFile, 'utf8'));
const W = PTS.w, H = PTS.h;
const EMPTY = PTS.empty;
const TARGET = [17, 21, 36];

const legacy = {
  mode: 'legacy', name: 'legacy (как сейчас)', A: [13, 13, 20], B: [31, 37, 64], C: [74, 97, 145], edgeAmp: 0.35, dimMax: 0.55,
};

function report(cfg, t, cell) {
  const grid = buildGrid(W, H, cell || 26, t);
  const colors = frameColors(grid, cfg);
  let nsum = 0, nmin = 9, nmax = -9;
  for (const c of grid.g) { nsum += c.n; nmin = Math.min(nmin, c.n); nmax = Math.max(nmax, c.n); }
  const vals = EMPTY.map(([x, y]) => sample(colors, grid, W, H, x, y));
  const mean = [0, 1, 2].map(k => vals.reduce((s, v) => s + v[k], 0) / vals.length);
  const min = [0, 1, 2].map(k => Math.min(...vals.map(v => v[k])));
  const max = [0, 1, 2].map(k => Math.max(...vals.map(v => v[k])));
  const outside = vals.filter(v => v.some((x, k) => Math.abs(x - TARGET[k]) > 12)).length;
  let gmin = [1e9, 1e9, 1e9], gmax = [-1e9, -1e9, -1e9], gsum = [0, 0, 0];
  for (const c of colors) for (let k = 0; k < 3; k++) { gmin[k] = Math.min(gmin[k], c[k]); gmax[k] = Math.max(gmax[k], c[k]); gsum[k] += c[k]; }
  const n = colors.length;
  const gmean = gsum.map(v => v / n);
  const r = v => v.map(x => Math.round(x));
  console.log(`  t=${t.toFixed(1)} n̄=${(nsum / n).toFixed(3)} n∈[${nmin.toFixed(2)},${nmax.toFixed(2)}] | точки: mean=${r(mean)} min=${r(min)} max=${r(max)} вне±12=${outside}/${vals.length} | сетка: mean=${r(gmean)} min=${r(gmin)} max=${r(gmax)}`);
}

const candidates = candFile ? JSON.parse(fs.readFileSync(candFile, 'utf8')) : [legacy];
const CELL = PTS.w < 760 ? 34 : 26;
for (const cfg of candidates) {
  console.log('='.repeat(100));
  console.log(`КОНФИГ: ${cfg.name || cfg.mode}  cell=${CELL} ${PTS.w}x${PTS.h}`);
  for (const t of [0.5, 1.5, 3.0, 7.3, 11.9]) report(cfg, t, CELL);
}
