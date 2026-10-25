// qa/mobile-probe.js — реальные замеры вёрстки в headless Chrome через CDP. Без зависимостей.
// Запуск: node qa/mobile-probe.js [страницы...]   (по умолчанию — все страницы репо)
// Ловит: горизонтальные переполнения, кто именно вылезает, мелкий текст, тап-зоны <44px,
//        «пляску» отступов и центрирования, fixed-фоны, ловушки 100vh, состояние плазмы.
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const REPO = path.resolve(__dirname, '..');
const VIEWPORTS = [[360, 740], [390, 844], [768, 1024], [1440, 900]];
const SKIP = new Set(['polygon.html']);
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(REPO).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();

const PROBE = `(() => {
  const vw = innerWidth, vh = innerHeight;
  const de = document.documentElement;
  const sel = el => {
    const bits = []; let n = el;
    while (n && n.tagName && n !== document.body && bits.length < 3) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; bits.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        const c = n.className.trim().split(/\\s+/).filter(x => !/^(rv|on|active)$/.test(x)).slice(0, 2).join('.');
        if (c) s += '.' + c;
      }
      bits.unshift(s); n = n.parentElement;
    }
    return bits.join(' > ');
  };
  const vis = el => { const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && cs.position !== 'fixed'; };
  // элемент внутри горизонтально прокручиваемого контейнера — это задумано, не баг
  const inScroller = el => { let n = el.parentElement;
    while (n && n !== document.body) { const o = getComputedStyle(n).overflowX;
      if (o === 'auto' || o === 'scroll') return true; n = n.parentElement; }
    return false; };
  const offenders = [], tiny = [], taps = [], nowrap = [], wide = [], vhtrap = [], fixedBg = [];
  const aligns = {}, pads = {}, sectPads = [];
  let nodeCount = 0;
  document.querySelectorAll('body *').forEach(el => {
    nodeCount++;
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (!vis(el)) return;
    const cnt = sel(el);
    if ((r.right > vw + 1 || r.left < -1) && !inScroller(el)) {
      if (offenders.length < 14) offenders.push({ sel: cnt, left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), txt: (el.textContent || '').trim().slice(0, 40) });
    }
    if (el.children.length === 0 && (el.textContent || '').trim() && parseFloat(cs.fontSize) < 12) {
      if (tiny.length < 10) tiny.push({ sel: cnt, fs: cs.fontSize, txt: el.textContent.trim().slice(0, 34) });
    }
    const tag = el.tagName;
    if ((tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || el.getAttribute('role') === 'button') && r.height < 44 && r.width > 8) {
      if (taps.length < 10) taps.push({ sel: cnt, h: Math.round(r.height), txt: (el.textContent || el.value || '').trim().slice(0, 26) });
    }
    if (cs.whiteSpace === 'nowrap' && el.scrollWidth > vw + 1) nowrap.push({ sel: cnt, sw: el.scrollWidth });
    if ((tag === 'IMG' || tag === 'CANVAS' || tag === 'VIDEO') && r.width > vw + 1) wide.push({ sel: cnt, w: Math.round(r.width) });
    const h = parseFloat(cs.height);
    if (!isNaN(h) && h >= vh * 0.92 && el.children.length > 0 && h <= vh * 1.05) vhtrap.push({ sel: cnt, h: Math.round(h) });
    if (cs.backgroundAttachment === 'fixed') fixedBg.push({ sel: cnt });
    const txt = (el.textContent || '').trim();
    if (txt && el.children.length === 0) {
      const a = cs.textAlign; aligns[a] = (aligns[a] || 0) + 1;
    }
    if (tag === 'SECTION' && r.height > 40) {
      const pt = cs.paddingTop, pb = cs.paddingBottom;
      sectPads.push({ sel: cnt, pt: pt, pb: pb, mt: cs.marginTop });
    }
    const p = cs.paddingTop + '/' + cs.paddingBottom;
    pads[p] = (pads[p] || 0) + 1;
  });
  const canvases = [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, cw: Math.round(c.getBoundingClientRect().width) }));
  const fonts = {
    loaded: document.fonts ? document.fonts.size : -1,
    h1: (() => { const e = document.querySelector('h1'); return e ? getComputedStyle(e).fontFamily : null; })(),
    h2: (() => { const e = document.querySelector('h2'); return e ? getComputedStyle(e).fontFamily : null; })(),
    body: getComputedStyle(document.body).fontFamily,
    bodySize: parseFloat(getComputedStyle(document.body).fontSize)
  };
  return JSON.stringify({
    vw, vh, scrollW: de.scrollWidth, bodyScrollW: document.body.scrollWidth,
    overflow: de.scrollWidth - vw, nodeCount,
    offenders, tiny, taps, nowrap, wide, vhtrap, fixedBg, canvases, fonts,
    aligns, sectPads: sectPads.slice(0, 8), padVariants: Object.keys(pads).length,
    viewportMeta: (document.querySelector('meta[name=viewport]') || {}).content || null,
    plasma: !!document.querySelector('canvas[aria-hidden="true"]'),
    plasmaState: window.__dsPlasma ? { mode: window.__dsPlasma.mode, running: window.__dsPlasma.running, fps: window.__dsPlasma.fps, size: window.__dsPlasma.size } : null,
    plasmaStatic: matchMedia('(max-width: 719px)').matches,
    cyrDisplay: (document.fonts && document.fonts.check) ? document.fonts.check('700 32px Onest', 'Привет') : null,
    onestReady: (document.fonts && document.fonts.check) ? document.fonts.check('16px Onest', 'Привет') : null
  });
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsprobe-'));
  const ch = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', '--force-device-scale-factor=1',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'
  ], { stdio: 'ignore' });

  let list = null;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); list = await r.json(); if (list.find(t => t.type === 'page')) break; } catch (e) {}
  }
  const target = (list || []).find(t => t.type === 'page');
  if (!target) { console.error('НЕ поднялся Chrome. Проверь путь:', CHROME); process.exit(1); }

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

  await send('Page.enable');
  const report = {}; const problems = [];
  for (const page of PAGES) {
    const url = 'file:///' + path.join(REPO, page).replace(/\\/g, '/');
    report[page] = {};
    for (const vp of VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', { width: vp[0], height: vp[1], deviceScaleFactor: 1, mobile: vp[0] < 800 });
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url });
      await Promise.race([loaded, sleep(9000)]);
      await sleep(900); // шрифты + deferred-скрипты
      let data = null;
      try {
        const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
        data = JSON.parse(r.result.value);
      } catch (e) { data = { error: String(e.message).slice(0, 120) }; }
      report[page][vp[0]] = data;
      if (data && data.overflow > 1) problems.push({ page, w: vp[0], kind: 'OVERFLOW', v: data.overflow, by: (data.offenders || []).slice(0, 3).map(o => o.sel + ' (' + o.w + 'px)').join(' | ') });
      if (data && (data.offenders || []).length > 3) problems.push({ page, w: vp[0], kind: 'OFFENDERS', v: data.offenders.length, by: data.offenders.slice(0, 2).map(o => o.sel).join(' | ') });
      if (data && (data.taps || []).length) problems.push({ page, w: vp[0], kind: 'TAP<44', v: data.taps.length, by: data.taps.slice(0, 2).map(t => t.sel + ' ' + t.h + 'px').join(' | ') });
      // ритм секций: допустимы ровно два значения вертикали (mobile 56 / desktop 96) + hero 84
      if (data && data.sectPads && data.sectPads.length) {
        const vals = [...new Set(data.sectPads.map(s => s.pt))].filter(v => v !== '84px');
        const expect = vp[0] < 760 ? '56px' : '96px';
        const bad = vals.filter(v => v !== expect);
        if (bad.length) problems.push({ page, w: vp[0], kind: 'РИТМ', v: bad.join(','), by: 'ожидалось ' + expect + ' на ' + data.sectPads.length + ' секциях' });
      }
      if (data && (data.tiny || []).length >= 5) problems.push({ page, w: vp[0], kind: 'МЕЛКИЙ ТЕКСТ', v: data.tiny.length, by: data.tiny.slice(0, 3).map(t => t.fs + ' × ' + t.sel.split(' > ').pop()).join(' | ') });
      if (data && (data.taps || []).length > 12) problems.push({ page, w: vp[0], kind: 'TAP-МНОГО', v: data.taps.length, by: (data.taps || []).slice(0, 2).map(t => t.sel).join(' | ') });
      await sleep(120);
    }
  }
  const out = path.join(REPO, 'qa', 'mobile-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('=== ПРОБЛЕМ: ' + problems.length + ' | отчёт: qa/mobile-report.json ===');
  problems.slice(0, 60).forEach(p => console.log(`[${p.kind}] ${p.page} @${p.w}px  n=${p.v}  ${p.by}`));
  // сводка по мобилке отдельно
  console.log('\n=== МОБИЛКА 390: плазма и шрифты ===');
  for (const page of PAGES) {
    const d = report[page][390]; if (!d) continue;
    console.log(`${page}: overflow=${d.overflow} offenders=${(d.offenders || []).length} taps=${(d.taps || []).length} plasma=${d.plasma} static=${d.plasmaStatic} h1=${String(d.fonts && d.fonts.h1).split(',')[0]}`);
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
  await sleep(300);
  try { spawnSync('cmd', ['/c', 'rmdir', '/s', '/q', tmp]); } catch (e) {}
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
