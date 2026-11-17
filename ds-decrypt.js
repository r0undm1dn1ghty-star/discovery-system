/* DS decrypt-reveal карточка канала — ванильный WebGL2-порт, канон §8 КАНОН-факты-лендинга.
   Грузить с разметкой секции #profile (stage + fallback): см. channel.html — эталон. */
(() => {
"use strict";
const LOGO_DATA = "data:image/jpeg;base64,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";
// ---------- конфиг карточки ----------
const C = {
  card:"#131c2b", ink:"#eef2fb", body:"#b9c1d6", meta:"#8a94ad",
  hair:"rgba(255,255,255,.14)", hair2:"rgba(255,255,255,.08)",
  navy:"#1b2a6b", acc:"#8fa8ff",
  chipBg:"rgba(255,255,255,.06)",
};
const NAME = "Discovery System // Виктор Зайцев про рынок ИИ-агентов";
const HANDLE = "t.me/discoverysystem";
const CHIPS = ["сигнал","скилл","исследование","бизнес-модель"];
const BIO = "Канал с исследованиями российского рынка ИИ-агентов — для самозанятых, владельцев малого бизнеса и ИИ-предпринимателей. Я внедряю ИИ-агентов и показываю экономику владения сборками, которые не заблокируют.";
const STATS = [["2–4 дня", "новый сигнал"], ["500+", "сигналов в базе"], ["дальше", "карта смерти рынков"]];
const TG = "https://t.me/discoverysystem";

// ---------- можно ли эффект ----------
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const useFx = fine && !reduced;

// ---------- раскладка и отрисовка карточки в 2D ----------
const logo = new Image();
logo.src = LOGO_DATA;
let layout = null;

function paintCard(ctx, W, dpr) {
  const pad = 26, gap = 14;
  let y = pad;
  // шапка: аватар + название
  const avS = 52;
  const tx = pad + avS + gap;
  const nameLines = wrapText(ctx, NAME, "500 17px Onest, IBM Plex Sans, sans-serif", W - tx - pad);
  const nameH = nameLines.length * 23;
  const headH = Math.max(avS, nameH + 20);
  layout = { W, pad, av: {x: pad, y, s: avS}, nameLines, tx };
  // аватар (круг с обрезкой) + кольцо, за которое цепляется шифр
  ctx.save();
  ctx.beginPath(); ctx.arc(pad + avS/2, y + avS/2, avS/2, 0, Math.PI*2); ctx.clip();
  if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, pad, y, avS, avS);
  else { ctx.fillStyle = C.navy; ctx.fillRect(pad, y, avS, avS); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(pad + avS/2, y + avS/2, avS/2 + 1, 0, Math.PI*2);
  ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.stroke();
  // название: дословно как в телеграме
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  let ny = y + (headH - nameH - 20) / 2 + 2;
  ctx.fillStyle = C.ink;
  ctx.font = "500 17px Onest, IBM Plex Sans, sans-serif";
  nameLines.forEach(l => { ctx.fillText(l, tx, ny); ny += 23; });
  ctx.fillStyle = C.meta;
  ctx.font = "500 14px IBM Plex Mono, monospace";
  ctx.fillText(HANDLE, tx, ny + 3);
  y += headH + 16;
  // чипы
  ctx.font = "500 13px IBM Plex Mono, monospace";
  const chips = [];
  let cx = pad;
  for (const ch of CHIPS) {
    const w = ctx.measureText(ch).width + 28;
    chips.push({x: cx, y, w, h: 31, label: ch});
    cx += w + 8;
  }
  layout.chips = chips;
  for (const ch of chips) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(ch.x, ch.y, ch.w, ch.h, 999); else ctx.rect(ch.x, ch.y, ch.w, ch.h);
    ctx.fillStyle = C.chipBg; ctx.fill();
    ctx.strokeStyle = C.hair2; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C.body;
    ctx.fillText(ch.label, ch.x + 14, ch.y + 8);
  }
  y += 31 + 18;
  // описание — вариант A
  ctx.font = "400 15.5px IBM Plex Sans, sans-serif";
  const bioLines = wrapText(ctx, BIO, "400 15.5px IBM Plex Sans, sans-serif", W - pad*2);
  layout.bioLines = bioLines;
  ctx.fillStyle = C.body;
  const bioLH = 24;
  bioLines.forEach(l => { ctx.fillText(l, pad, y); y += bioLH; });
  y += 18;
  // метрики: одна строка
  ctx.font = "500 16px IBM Plex Mono, monospace";
  const statParts = [];
  for (const [n, l] of STATS) statParts.push({n, l});
  ctx.strokeStyle = C.hair2;
  ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
  y += 16;
  let sx = pad;
  for (const p of statParts) {
    ctx.fillStyle = C.ink;
    ctx.fillText(p.n, sx, y);
    sx += ctx.measureText(p.n).width + 6;
    ctx.fillStyle = C.meta;
    ctx.font = "500 14px IBM Plex Sans, sans-serif";
    ctx.fillText(p.l, sx, y + 2);
    sx += ctx.measureText(p.l).width + 14;
    ctx.font = "500 16px IBM Plex Mono, monospace";
    if (p !== statParts[statParts.length - 1]) {
      ctx.fillStyle = C.meta;
      ctx.fillText("·", sx, y);
      sx += 14;
    }
  }
  y += 34;
  // кнопка
  const b = {x: pad, y, w: W - pad*2, h: 52, r: 10};
  layout.btn = b;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, b.r); else ctx.rect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = C.navy; ctx.fill();
  ctx.fillStyle = "#f2f6ff";
  ctx.font = "500 15.5px IBM Plex Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Подписаться", b.x + b.w/2, b.y + 17);
  ctx.textAlign = "left";
  y += b.h + pad;
  layout.H = y;
}

function wrapText(ctx, text, font, maxW) {
  ctx.font = font;
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------- decrypt-reveal: ванильный порт createDecryptReveal ----------
// шейдеры и атлас — из Canvas UI (canvasui.dev/docs/components/decrypt-reveal), без React-обёртки
const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const CELL_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uShapes;
uniform vec2 uContentRes;
uniform vec2 uCellPx;
uniform int uGlyphCount;
uniform float uContrast;
uniform float uExposure;
uniform float uThreshold;
uniform vec3 uBg;

const vec2 INNER[6] = vec2[6](
  vec2(0.28, 0.26), vec2(0.72, 0.14),
  vec2(0.28, 0.56), vec2(0.72, 0.44),
  vec2(0.28, 0.86), vec2(0.72, 0.74)
);
const vec2 OUTER[10] = vec2[10](
  vec2(0.28, -0.2), vec2(0.72, -0.2),
  vec2(-0.22, 0.25), vec2(1.22, 0.25),
  vec2(-0.22, 0.5), vec2(1.22, 0.5),
  vec2(-0.22, 0.75), vec2(1.22, 0.75),
  vec2(0.28, 1.2), vec2(0.72, 1.2)
);
const vec2 RING[6] = vec2[6](
  vec2(1.0, 0.0), vec2(0.5, 0.8660254), vec2(-0.5, 0.8660254),
  vec2(-1.0, 0.0), vec2(-0.5, -0.8660254), vec2(0.5, -0.8660254)
);

vec2 cellBase;

vec4 fetchTap (vec2 p) {
  vec2 uv = p / uContentRes;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uContent, uv);
}

vec4 sampleCircle (vec2 c) {
  vec2 middle = cellBase + c * uCellPx;
  float r = uCellPx.y * 0.161;
  vec4 acc = fetchTap(middle);
  for (int k = 0; k < 6; k++) acc += fetchTap(middle + RING[k] * r);
  return acc / 7.0;
}

float tapLevel (vec4 t) {
  vec3 straight = t.rgb / max(t.a, 1e-4);
  return dot(abs(straight - uBg), vec3(0.299, 0.587, 0.114)) * t.a;
}

float circleSig (vec4 acc) {
  return clamp(tapLevel(acc) * uExposure, 0.0, 1.0);
}

float dirContrast (float value, float ext) {
  float peak = max(value, ext);
  if (peak < 1e-4) return value;
  return pow(value / peak, uContrast) * peak;
}

void main () {
  cellBase = floor(gl_FragCoord.xy) * uCellPx;
  float v[6];
  vec3 colAcc = vec3(0.0);
  float alphaAcc = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 acc = sampleCircle(INNER[i]);
    v[i] = circleSig(acc);
    colAcc += acc.rgb;
    alphaAcc += acc.a;
  }
  float e[10];
  for (int i = 0; i < 10; i++) e[i] = circleSig(sampleCircle(OUTER[i]));
  v[0] = dirContrast(v[0], max(max(e[0], e[1]), max(e[2], e[4])));
  v[1] = dirContrast(v[1], max(max(e[0], e[1]), max(e[3], e[5])));
  v[2] = dirContrast(v[2], max(e[2], max(e[4], e[6])));
  v[3] = dirContrast(v[3], max(e[3], max(e[5], e[7])));
  v[4] = dirContrast(v[4], max(max(e[4], e[6]), max(e[8], e[9])));
  v[5] = dirContrast(v[5], max(max(e[5], e[7]), max(e[8], e[9])));
  float gm[6];
  for (int i = 0; i < 6; i++) gm[i] = 0.0;
  float levSum = 0.0;
  float inkLev = 0.0;
  vec3 inkCol = vec3(0.0);
  int nx = int(clamp(uCellPx.x, 6.0, 20.0));
  int ny = int(clamp(uCellPx.y, 8.0, 32.0));
  float fx = float(nx - 1);
  float fy = float(ny - 1);
  for (int gy = 0; gy < ny; gy++) {
    for (int gx = 0; gx < nx; gx++) {
      vec2 p = vec2(float(gx) / fx, float(gy) / fy);
      vec4 t = fetchTap(cellBase + p * uCellPx);
      float lev = tapLevel(t);
      int idx = (p.y < 0.41 ? 0 : (p.y < 0.71 ? 2 : 4)) + (p.x < 0.5 ? 0 : 1);
      gm[idx] = max(gm[idx], lev);
      levSum += lev;
      if (lev > inkLev) {
        inkLev = lev;
        inkCol = t.rgb / max(t.a, 1e-4);
      }
    }
  }
  inkLev *= uExposure;
  for (int i = 0; i < 6; i++)
    v[i] = max(v[i], clamp(gm[i] * uExposure, 0.0, 1.0));
  float peak = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));
  vec3 avgCol = colAcc / max(alphaAcc, 1e-4);
  if (peak < uThreshold) {
    outColor = vec4(avgCol, 0.0);
    return;
  }
  float mean = levSum * uExposure / float(nx * ny);
  float sharp = inkLev / max(mean, 1e-4);
  float solid = smoothstep(uThreshold, uThreshold * 1.6, inkLev);
  float lift = smoothstep(1.5, 3.0, sharp) * solid;
  float lifted = mix(peak, 1.0, lift);
  for (int i = 0; i < 6; i++)
    v[i] = pow(min(v[i] / max(peak, 1e-4), 1.0), uContrast) * lifted;
  vec3 cellCol = mix(avgCol, inkCol, lift);
  int best = 0;
  float bestD = 1e9;
  for (int g = 0; g < uGlyphCount; g++) {
    float d = 0.0;
    for (int i = 0; i < 6; i++) {
      float diff = v[i] - texelFetch(uShapes, ivec2(i, g), 0).r;
      d += diff * diff;
    }
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  outColor = vec4(cellCol, float(best) / 255.0);
}`;

const MAIN_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uCells;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uCellPx;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform vec2 uAtlasPad;
uniform vec2 uAtlasInner;
uniform int uGlyphCount;
uniform vec2 uPointer;
uniform float uActive;
uniform float uRadius;
uniform float uSoftness;
uniform float uColored;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uLegibility;
uniform float uScramble;
uniform float uScrambleSpeed;
uniform float uEdgeWidth;
uniform float uEdgeFlicker;
uniform float uEdgeGlow;
uniform float uEdgeTint;
uniform float uAberration;
uniform float uPassthrough;
uniform vec3 uBg;
uniform float uTime;
uniform float uMaxX;
uniform float uCrisp;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 samp (vec2 p) {
  vec2 uv = p / uRes;
  uv = clamp(uv, vec2(0.001), vec2(uMaxX - 0.001, 0.999));
  return texture(uContent, uv);
}

void main () {
  vec2 pc = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  if (pc.x > uMaxX * uRes.x) {
    outColor = vec4(0.0);
    return;
  }
  if (uCrisp > 0.5) {
    outColor = samp(pc);
    return;
  }

  float dist = length(pc - uPointer);
  float radius = max(uRadius, 1.0);
  float inner = radius * (1.0 - clamp(uSoftness, 0.02, 1.0));
  float e = (1.0 - smoothstep(inner, radius, dist)) * uActive;

  float bandW = max(radius * clamp(uEdgeWidth, 0.0, 1.0) * 0.5, 6.0);
  float bandD = dist - mix(inner, radius, 0.5);
  float ring = exp(-bandD * bandD / (2.0 * bandW * bandW)) * uActive;

  vec2 dir = (pc - uPointer) / max(dist, 1e-3);
  float ca = uAberration * ring;
  vec4 rC = samp(pc);
  vec3 real = vec3(samp(pc + dir * ca).r, rC.g, samp(pc - dir * ca).b);

  vec2 cellPos = pc * uDpr / uCellPx;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 info = texelFetch(uCells, ivec2(cell), 0);
  float glyph = floor(info.a * 255.0 + 0.5);

  float rerollP = clamp(uScramble * 0.35 + ring * uEdgeFlicker, 0.0, 1.0);
  float speed = max(uScrambleSpeed, 0.001) * (1.0 + ring * 2.5);
  float ft = floor(uTime * speed);
  float swap = step(1.0 - rerollP, hash(cell * 3.3 + vec2(ft * 0.717, ft * 0.523)))
    * step(0.5, glyph);
  float pick = hash(cell + vec2(ft * 0.613, ft * 0.831));
  glyph = mix(glyph, floor(pick * float(uGlyphCount - 1)) + 1.0, swap);

  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x);
  float gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2(
    (gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x,
    (gy + uAtlasPad.y + local.y * uAtlasInner.y) / uAtlasGrid.y
  );
  vec2 atlasStep = uAtlasInner / uAtlasGrid;
  float mask = textureGrad(
    uAtlas,
    atlasUv,
    dFdx(cellPos) * atlasStep,
    dFdy(cellPos) * atlasStep
  ).a * step(0.5, glyph);

  vec3 cellCol = info.rgb;
  vec3 lw = vec3(0.299, 0.587, 0.114);
  vec3 dev = cellCol - uBg;
  float mag = dot(abs(dev), lw);
  float target = clamp(uLegibility, 0.0, 1.0) * 0.75;
  float boost = clamp(target / max(mag, 0.01), 1.0, 32.0);
  vec3 vivid = clamp(uBg + dev * boost, 0.0, 1.0);
  float vividMag = dot(abs(vivid - uBg), lw);
  vec3 ink = mix(vec3(1.0), vec3(0.06), step(0.5, dot(uBg, lw)));
  vivid = mix(vivid, ink, clamp((target - vividMag) / max(target, 1e-3), 0.0, 1.0));
  float cellSig = clamp(mag * 1.6, 0.0, 1.0);
  vec3 mono = uColor * mix(0.35, 1.2, cellSig);
  vec3 glyphColor = mix(mono, vivid, clamp(uColored, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * uBrightness, 0.0, 1.0);
  float cellLum = dot(vivid, lw);
  glyphColor = mix(
    glyphColor,
    uColor * max(uBrightness, 1.0) * (0.6 + cellLum),
    ring * clamp(uEdgeTint, 0.0, 1.0)
  );
  glyphColor = clamp(
    uBg + (glyphColor - uBg) * (1.0 + ring * uEdgeGlow * 1.6),
    0.0,
    1.0
  );

  vec3 base = mix(uBg, real, clamp(uPassthrough, 0.0, 1.0));
  vec3 encrypted = mix(base, glyphColor, mask);
  vec3 col = mix(encrypted, real, e);
  float alpha = mix(max(rC.a, mask), rC.a, e);
  outColor = vec4(col, alpha);
}`;

const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
const ATLAS_CELL = 64, ATLAS_PAD = 8, MAX_GLYPHS = 255;
const INNER_CIRCLES = [[0.28,0.26],[0.72,0.14],[0.28,0.56],[0.72,0.44],[0.28,0.86],[0.72,0.74]];

function parseColor(input) {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const p = probe.getContext("2d");
  p.fillStyle = "#000000"; p.fillStyle = input;
  p.clearRect(0,0,1,1); p.fillRect(0,0,1,1);
  const d = p.getImageData(0,0,1,1).data;
  return [d[0]/255, d[1]/255, d[2]/255];
}
function buildGlyphList(charset) {
  const seen = new Set([" "]);
  const glyphs = [" "];
  for (const ch of charset) {
    if (glyphs.length >= MAX_GLYPHS) break;
    if (ch === "\n" || ch === "\r" || ch === "\t" || seen.has(ch)) continue;
    seen.add(ch); glyphs.push(ch);
  }
  return glyphs;
}
function glyphShapes(image, cols, cellW, cellH, count) {
  const vectors = new Float32Array(count * 6);
  const radius = cellH * 0.26;
  const padW = cellW + ATLAS_PAD*2, padH = cellH + ATLAS_PAD*2;
  for (let g = 0; g < count; g++) {
    const ox = (g % cols) * padW + ATLAS_PAD, oy = Math.floor(g / cols) * padH + ATLAS_PAD;
    for (let c = 0; c < 6; c++) {
      const cx = INNER_CIRCLES[c][0] * cellW, cy = INNER_CIRCLES[c][1] * cellH;
      let sum = 0, total = 0;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          const dx = x + .5 - cx, dy = y + .5 - cy;
          if (dx*dx + dy*dy > radius*radius) continue;
          total++;
          if (x < -ATLAS_PAD || y < -ATLAS_PAD || x >= cellW + ATLAS_PAD || y >= cellH + ATLAS_PAD) continue;
          sum += image.data[((oy + y) * image.width + ox + x) * 4 + 3];
        }
      }
      vectors[g*6 + c] = total ? sum / (total * 255) : 0;
    }
  }
  for (let c = 0; c < 6; c++) {
    let peak = 0;
    for (let g = 0; g < count; g++) peak = Math.max(peak, vectors[g*6 + c]);
    if (peak > 0) for (let g = 0; g < count; g++) vectors[g*6 + c] /= peak;
  }
  return vectors;
}
const clampAspect = a => Math.min(Math.max(a || 0.75, 0.35), 1.25);

// адаптация: контент — моя 2D-канва (source), не html-in-canvas
function createDecrypt(sourceCanvas, outputCanvas, opts) {
  const config = Object.assign({
    radius: 340, softness: .5, cell: 12, aspect: .75, charset: PRINTABLE_ASCII,
    colored: .3, color: C.acc, brightness: .95, legibility: .85, contrast: 1, exposure: 1,
    scramble: .08, scrambleSpeed: 6, edgeWidth: .2, edgeFlicker: 1, edgeGlow: 2, edgeTint: .75,
    aberration: 8, passthrough: .22, threshold: .025, background: C.card, smoothing: .2,
  }, opts);
  const gl = outputCanvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: false });
  if (!gl || gl.isContextLost()) return null;

  let contentDirty = false, cellsDirty = true, wake = () => {};
  function compile(type, text) {
    const s = gl.createShader(type);
    gl.shaderSource(s, text); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  function link(frag) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(p);
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      uniforms[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { program: p, uniforms };
  }
  const cellPass = link(CELL_FRAG), mainPass = link(MAIN_FRAG);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function makeTexture(filter) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const contentTexture = makeTexture(gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
  const cellTexture = makeTexture(gl.NEAREST);
  const cellFbo = gl.createFramebuffer();
  let cellCols = 0, cellRows = 0;
  const shapeTexture = makeTexture(gl.NEAREST);
  const atlasTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let glyphCount = 0, atlasCols = 1, atlasRows = 1, atlasPad = [0,0], atlasInner = [1,1];
  let builtCharset = "", builtAspect = 0;

  function rebuildAtlas() {
    const aspect = clampAspect(config.aspect);
    if (builtCharset === config.charset && builtAspect === aspect) return;
    const glyphs = buildGlyphList(config.charset);
    const cellH = ATLAS_CELL, cellW = Math.max(Math.round(cellH * aspect), 8);
    const padW = cellW + ATLAS_PAD*2, padH = cellH + ATLAS_PAD*2;
    const cols = Math.ceil(Math.sqrt(glyphs.length)), rows = Math.ceil(glyphs.length / cols);
    const surface = document.createElement("canvas");
    surface.width = cols * padW; surface.height = rows * padH;
    const ctx = surface.getContext("2d");
    builtCharset = config.charset; builtAspect = aspect;
    ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fontPx = Math.floor(Math.min(cellH * .92, cellW / .58));
    ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    for (let g = 0; g < glyphs.length; g++)
      ctx.fillText(glyphs[g], (g % cols) * padW + padW/2, Math.floor(g / cols) * padH + padH/2);
    const image = ctx.getImageData(0, 0, surface.width, surface.height);
    const vectors = glyphShapes(image, cols, cellW, cellH, glyphs.length);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, shapeTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 6, glyphs.length, 0, gl.RED, gl.FLOAT, vectors);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    glyphCount = glyphs.length;
    atlasCols = cols; atlasRows = rows;
    atlasPad = [ATLAS_PAD / padW, ATLAS_PAD / padH];
    atlasInner = [cellW / padW, cellH / padH];
    cellsDirty = true;
  }

  let bgKey = "", bg = [0,0,0], colorKey = "", fg = [0,0,0];

  function cellSizePx(dpr) {
    const h = Math.min(Math.max(config.cell, 4), 40) * dpr;
    return [h * clampAspect(config.aspect), h];
  }
  function syncSize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(outputCanvas.clientWidth * dpr));
    const H = Math.max(1, Math.round(outputCanvas.clientHeight * dpr));
    if (outputCanvas.width !== W || outputCanvas.height !== H) {
      outputCanvas.width = W; outputCanvas.height = H;
    }
    if (sourceCanvas.width !== W || sourceCanvas.height !== H) {
      sourceCanvas.width = W; sourceCanvas.height = H;
      contentDirty = true;
    }
    cellsDirty = true;
  }
  function syncCellGrid() {
    const dpr = outputCanvas.width / Math.max(outputCanvas.clientWidth, 1);
    const [cw, ch] = cellSizePx(dpr);
    const cols = Math.max(Math.ceil(outputCanvas.width / cw), 1);
    const rows = Math.max(Math.ceil(outputCanvas.height / ch), 1);
    if (cols === cellCols && rows === cellRows) return;
    cellCols = cols; cellRows = rows;
    gl.bindTexture(gl.TEXTURE_2D, cellTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cellTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    cellsDirty = true;
  }
  function uploadContent() {    if (!contentDirty) return;
    contentDirty = false; cellsDirty = true;
    gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
  }
  function renderCells() {
    if (!cellsDirty) return;
    cellsDirty = false;
    const dpr = outputCanvas.width / Math.max(outputCanvas.clientWidth, 1);
    const [cw, ch] = cellSizePx(dpr);
    const u = cellPass.uniforms;
    gl.useProgram(cellPass.program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.uniform1i(u.uContent, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shapeTexture);
    gl.uniform1i(u.uShapes, 1);
    gl.uniform2f(u.uContentRes, outputCanvas.width, outputCanvas.height);
    gl.uniform2f(u.uCellPx, cw, ch);
    gl.uniform1i(u.uGlyphCount, glyphCount);
    gl.uniform1f(u.uContrast, Math.min(Math.max(config.contrast, .3), 3));
    gl.uniform1f(u.uExposure, Math.min(Math.max(config.exposure, .2), 3));
    gl.uniform1f(u.uThreshold, Math.max(config.threshold, .005));
    gl.uniform3f(u.uBg, bg[0], bg[1], bg[2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
    gl.viewport(0, 0, cellCols, cellRows);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  const pointer = { x: -1e5, y: -1e5, tx: -1e5, ty: -1e5, active: 0, target: 0 };
  let time = 0;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;

  rebuildAtlas(); syncSize();

  function render() {
    uploadContent();
    if (config.background !== bgKey) { bgKey = config.background; bg = parseColor(config.background); cellsDirty = true; }
    if (config.color !== colorKey) { colorKey = config.color; fg = parseColor(config.color); }
    rebuildAtlas(); syncCellGrid(); renderCells();
    const w = Math.max(outputCanvas.clientWidth, 1), h = Math.max(outputCanvas.clientHeight, 1);
    const dpr = outputCanvas.width / w;
    const [cw, ch] = cellSizePx(dpr);
    const u = mainPass.uniforms;
    gl.useProgram(mainPass.program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.uniform1i(u.uContent, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, cellTexture);
    gl.uniform1i(u.uCells, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.uniform1i(u.uAtlas, 2);
    gl.uniform2f(u.uRes, w, h);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform2f(u.uCellPx, cw, ch);
    gl.uniform2f(u.uGrid, cellCols, cellRows);
    gl.uniform2f(u.uAtlasGrid, atlasCols, atlasRows);
    gl.uniform2f(u.uAtlasPad, atlasPad[0], atlasPad[1]);
    gl.uniform2f(u.uAtlasInner, atlasInner[0], atlasInner[1]);
    gl.uniform1i(u.uGlyphCount, glyphCount);
    gl.uniform2f(u.uPointer, pointer.x, pointer.y);
    gl.uniform1f(u.uActive, pointer.active);
    gl.uniform1f(u.uRadius, Math.max(config.radius, 1));
    gl.uniform1f(u.uSoftness, config.softness);
    gl.uniform1f(u.uColored, config.colored);
    gl.uniform3f(u.uColor, fg[0], fg[1], fg[2]);
    gl.uniform1f(u.uBrightness, Math.min(Math.max(config.brightness, .2), 3));
    gl.uniform1f(u.uLegibility, Math.min(Math.max(config.legibility, 0), 1));
    gl.uniform1f(u.uScramble, Math.min(Math.max(config.scramble, 0), 1));
    gl.uniform1f(u.uScrambleSpeed, Math.min(Math.max(config.scrambleSpeed, 0), 30));
    gl.uniform1f(u.uEdgeWidth, config.edgeWidth);
    gl.uniform1f(u.uEdgeFlicker, Math.min(Math.max(config.edgeFlicker, 0), 1));
    gl.uniform1f(u.uEdgeGlow, Math.min(Math.max(config.edgeGlow, 0), 3));
    gl.uniform1f(u.uEdgeTint, config.edgeTint);
    gl.uniform1f(u.uAberration, Math.max(config.aberration, 0));
    gl.uniform1f(u.uPassthrough, config.passthrough);
    gl.uniform3f(u.uBg, bg[0], bg[1], bg[2]);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uMaxX, 1);
    gl.uniform1f(u.uCrisp, reducedMotion ? 1 : 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, outputCanvas.width, outputCanvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  let raf = 0, lastTime = performance.now(), destroyed = false, running = false;
  function frame(now) {
    if (destroyed) return;    try {
    const delta = Math.min((now - lastTime) / 1000, 1/30);
    lastTime = now;
    time += delta;
    const tau = Math.max(config.smoothing, 1e-4);
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta / tau);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    pointer.active += (pointer.target - pointer.active) * k;
    render();
    const settled = Math.abs(pointer.tx - pointer.x) < .1 && Math.abs(pointer.ty - pointer.y) < .1 && Math.abs(pointer.target - pointer.active) < 1e-3;
    const churning = (config.scramble > 0 && config.scrambleSpeed > 0) || (pointer.active > 1e-3 && config.edgeFlicker > 0);
    if (settled && !contentDirty && (reducedMotion || !churning)) { running = false; return; }
    raf = requestAnimationFrame(frame);
    } catch (err) {
      running = false;
    }
  }
  function start() {
    if (destroyed || running) return;
    running = true; lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }
  wake = start; start();

  motionQuery.addEventListener("change", () => { reducedMotion = motionQuery.matches; start(); });

  let resizeTimer = 0;
  const ro = new ResizeObserver(() => { syncSize(); paint(); start(); });
  ro.observe(outputCanvas);

  function paint() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = outputCanvas.clientWidth;
    const ctx = sourceCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, 9999);
    ctx.fillStyle = C.card;
    ctx.fillRect(0, 0, W, sourceCanvas.height / dpr);
    paintCard(ctx, W, dpr);
    contentDirty = true;
    start();
  }

  const rectOf = () => outputCanvas.getBoundingClientRect();
  function onMove(e) {
    const r = rectOf();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (pointer.target === 0 && pointer.active < 1e-3) { pointer.x = x; pointer.y = y; }
    pointer.tx = x; pointer.ty = y; pointer.target = 1;
    start();
    const b = layout && layout.btn;
    outputCanvas.style.cursor = b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h ? "pointer" : "default";
  }
  function onLeave() { pointer.target = 0; outputCanvas.style.cursor = "default"; start(); }
  outputCanvas.addEventListener("pointermove", onMove, { passive: true });
  outputCanvas.addEventListener("pointerleave", onLeave, { passive: true });
  outputCanvas.addEventListener("pointerdown", e => {
    const r = rectOf();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const b = layout && layout.btn;
    if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
      window.open(TG, "_blank", "noopener");
  });
  addEventListener("resize", () => { syncSize(); paint(); start(); });

  return { paint, destroy() { destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); } };
}

// ---------- запуск ----------
async function init() {
  const stage = document.getElementById("dsx-stage");
  const fallback = document.getElementById("dsx-fallback");
  if (!stage || !fallback) return;
  const showFallback = () => { fallback.hidden = false; stage.hidden = true; };

  if (!useFx) {
    document.getElementById("dsx-logo").src = LOGO_DATA;
    showFallback(); return;
  }
  await document.fonts.ready;

  stage.hidden = false;
  const stageW = Math.min(620, stage.clientWidth || 620);
  // высоту узнаём после первой отрисовки: рисуем в офф-канве, меряем, ставим высоту
  const probe = document.createElement("canvas");
  probe.width = stageW * 2; probe.height = 900 * 2;
  const pctx = probe.getContext("2d");
  pctx.setTransform(2, 0, 0, 2, 0, 0);
  paintCard(pctx, stageW, 2);
  const cardH = Math.ceil(layout.H);

  stage.hidden = false;
  const output = document.getElementById("dsx-output");
  output.style.height = cardH + "px";
  const source = document.createElement("canvas");

  const inst = createDecrypt(source, output, {});
  if (!inst) { showFallback(); return; }
  document.getElementById("dsx-fallback").hidden = true;

  const repaint = () => { inst.paint(); };
  if (logo.complete) repaint();
  else logo.onload = repaint;
  repaint();
}
init();
})();
