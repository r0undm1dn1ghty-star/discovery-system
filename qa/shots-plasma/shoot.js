// qa/shots-plasma/shoot.js — скриншот вьюпорта + карта «пустых» точек фона (CDP).
// Запуск: node qa/shots-plasma/shoot.js <out.png> <width> <height> <url>
// env: DS_EXTRA='js на новом документе'   DS_RM=1 (prefers-reduced-motion: reduce)
//      DS_OUTJSON=<path diagnostics.json>
// Скриншот снимается БЕЗ captureBeyondViewport и с deviceScaleFactor=1,
// поэтому пиксель PNG == CSS-пиксель (читаем Pillow'ом 1:1).
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9341 + Math.floor(Math.random() * 40);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const outPng = path.resolve(process.argv[2]);
const W = parseInt(process.argv[3], 10);
const H = parseInt(process.argv[4], 10);
const URL_ = process.argv[5];
const outJson = process.env.DS_OUTJSON || outPng.replace(/\.png$/, '.json');

// точки фона (CSS-пиксели): правый верх, середина правого края, левый низ,
// низ по центру, середина левого края, верх по центру, центр
function points(w, h) {
  const m = Math.round(w * 0.028);           // отступ от края ~ 3% ширины (>=10px)
  const e = Math.max(10, m);
  return [
    ['right-top', w - e, Math.round(h * 0.033)],
    ['right-mid', w - e, Math.round(h * 0.5)],
    ['left-bottom', e, h - Math.round(h * 0.033)],
    ['bottom-center', Math.round(w / 2), h - Math.round(h * 0.033)],
    ['left-mid', e, Math.round(h * 0.5)],
    ['top-center', Math.round(w / 2), Math.round(h * 0.033)],
    ['center', Math.round(w / 2), Math.round(h * 0.5)]
  ];
}

async function main() {
  fs.mkdirSync(path.dirname(outPng), { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dspl-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--force-device-scale-factor=1', '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp,
    'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); target = (await r.json()).find(t => t.type === 'page'); } catch (e) {}
  }
  if (!target) { console.error('Chrome не поднялся'); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0; const pending = new Map(); const waiters = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) waiters.filter(w => w.method === m.method).forEach(w => w.fire());
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = method => new Promise(res => { const w = { method, fire: () => { waiters.splice(waiters.indexOf(w), 1); res(); } }; waiters.push(w); });
  const evalV = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 800 });
  if (process.env.DS_RM === '1') {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  }
  if (process.env.DS_EXTRA) {
    await send('Page.addScriptToEvaluateOnNewDocument', { source: process.env.DS_EXTRA });
  }

  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: URL_ });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(2200); // дать плазме нарисовать несколько кадров

  const PTS = points(W, H);
  const CONTENT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'span', 'li',
    'strong', 'em', 'b', 'i', 'small', 'label', 'input', 'textarea', 'select', 'img', 'svg',
    'td', 'th', 'code', 'pre', 'time', 'blockquote', 'figcaption', 'video', 'picture', 'use'];
  const js = `(() => {
    const pts = ${JSON.stringify(PTS)};
    const CONTENT = ${JSON.stringify(CONTENT_TAGS)};
    const cv = document.querySelector('canvas[aria-hidden="true"]');
    const cs = cv ? getComputedStyle(cv) : null;
    const r = cv ? cv.getBoundingClientRect() : null;
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    // «пусто» = фоновый слой плазмы виден, поверх нет непрозрачной плашки и нет текстового листа.
    function classify(x, y) {
      const stack = document.elementsFromPoint(x, y);
      const above = cv ? stack.slice(0, stack.indexOf(cv) === -1 ? stack.length : stack.indexOf(cv)) : stack;
      const reasons = [];
      for (const el of above) {
        const s = getComputedStyle(el);
        const bg = s.backgroundColor;
        const m = bg.match(/rgba?\\(([^)]+)\\)/);
        const a = m ? (m[1].split(',').length > 3 ? parseFloat(m[1].split(',')[3]) : 1) : 1;
        if (a > 0.02 && el !== document.body && el !== document.documentElement) reasons.push('opaque-bg:' + el.tagName.toLowerCase() + ':' + bg);
        if (CONTENT.includes(el.tagName.toLowerCase())) {
          // лист с реальным содержимым перекрывает точку?
          const rr = el.getBoundingClientRect();
          if (rr.width > 2 && rr.height > 2) reasons.push('content:' + el.tagName.toLowerCase());
        }
        if (s.backgroundImage !== 'none' || s.filter !== 'none' || parseFloat(s.opacity) < 1) reasons.push('fx:' + el.tagName.toLowerCase());
      }
      return { stack: stack.slice(0, 6).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/)[0] : '')), reasons };
    }
    const probes = pts.map(([name, x, y]) => {
      const el = document.elementFromPoint(x, y);
      const c = classify(x, y);
      return { name, x, y, at: el ? (el.tagName.toLowerCase() + (el === cv ? '#plasma-canvas' : '')) : null, stack: c.stack, reasons: c.reasons, empty: c.reasons.length === 0 };
    });
    // скан сетки 13x9 — ищем чистые точки фона
    const empty = [], dirty = [];
    for (let gi = 0; gi <= 12; gi++) for (let gj = 0; gj <= 8; gj++) {
      const x = Math.round(6 + ((${W} - 12) * gi) / 12), y = Math.round(6 + (${H} - 12) * gj / 8);
      const c = classify(x, y);
      (c.reasons.length === 0 ? empty : dirty).push([x, y]);
    }
    return {
      canvas: !!cv, canvasCss: cs ? { pos: cs.position, w: cs.width, h: cs.height, op: cs.opacity, zi: cs.zIndex, mix: cs.mixBlendMode } : null,
      canvasRect: r ? [Math.round(r.width), Math.round(r.height)] : null,
      canvasAttrWH: cv ? [cv.width, cv.height] : null,
      plasma: window.__dsPlasma ? { mode: window.__dsPlasma.mode, running: window.__dsPlasma.running, fps: window.__dsPlasma.fps, size: window.__dsPlasma.size } : null,
      bodyBg, htmlBg, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio,
      probes, emptyCount: empty.length, dirtyCount: dirty.length, empty, dirty
    };
  })()`;
  const diag = await evalV(js);
  diag.url = URL_; diag.w = W; diag.h = H; diag.points = PTS;
  if (process.env.DS_PROBE) diag.probe = await evalV(process.env.DS_PROBE);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outPng, Buffer.from(shot.data, 'base64'));
  fs.writeFileSync(outJson, JSON.stringify(diag, null, 2));
  console.log(path.basename(outPng) + ' | canvas=' + diag.canvas + ' mode=' + (diag.plasma ? diag.plasma.mode : '-') +
    ' running=' + (diag.plasma ? diag.plasma.running : '-') + ' attrWH=' + JSON.stringify(diag.canvasAttrWH) +
    ' bodyBg=' + diag.bodyBg + ' emptyPts=' + diag.emptyCount);
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
