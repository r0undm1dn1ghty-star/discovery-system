// qa/mobile-360.js — аудит вёрстки ровно на 360px. Без зависимостей, headless Chrome через CDP.
// Запуск: node qa/mobile-360.js [страницы...]
// Пишет qa/mobile-360.json: переполнения, вылезающие элементы, тап-зоны <44, текст <12px — БЕЗ обрезки списков.
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9338;
const REPO = path.resolve(__dirname, '..');
const W = 360, H = 740;
const SKIP = new Set(['polygon.html']);
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(REPO).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();

const PROBE = `(() => {
  const vw = innerWidth, vh = innerHeight;
  const de = document.documentElement;
  const sel = el => {
    const bits = []; let n = el;
    while (n && n.tagName && n !== document.body && bits.length < 4) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; bits.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        const c = n.className.trim().split(/\\s+/).filter(x => !/^(rv|on|active|in|show)$/.test(x)).slice(0, 2).join('.');
        if (c) s += '.' + c;
      }
      bits.unshift(s); n = n.parentElement;
    }
    return bits.join(' > ');
  };
  const cs_ = el => getComputedStyle(el);
  const vis = el => { const c = cs_(el);
    return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05; };
  const isFixed = el => { let n = el; while (n && n !== document.body) { if (cs_(n).position === 'fixed') return true; n = n.parentElement; } return false; };
  const inScroller = el => { let n = el.parentElement;
    while (n && n !== document.body) { const o = cs_(n).overflowX;
      if (o === 'auto' || o === 'scroll') return true; n = n.parentElement; }
    return false; };
  const txtOf = el => (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60);

  const offenders = [], tiny = [], taps = [], wide = [], nowrap = [], fixedWide = [], traps = [];
  let nodes = 0;
  document.querySelectorAll('body *').forEach(el => {
    nodes++;
    const c = cs_(el); const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (!vis(el)) return;
    const s = sel(el);
    const over = r.right > vw + 1 || r.left < -1;
    if (over && !inScroller(el)) {
      const rec = { sel: s, left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), txt: txtOf(el) };
      if (isFixed(el)) { if (fixedWide.length < 40) fixedWide.push(rec); }
      else offenders.push(rec);
    }
    if (el.children.length === 0) {
      const t = txtOf(el);
      if (t && parseFloat(c.fontSize) < 12) {
        tiny.push({ sel: s, fs: c.fontSize, lh: c.lineHeight, txt: t.slice(0, 40) });
      }
    }
    const tag = el.tagName;
    const role = el.getAttribute('role');
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || role === 'button' || el.hasAttribute('onclick')) {
      const hh = Math.round(r.height), ww = Math.round(r.width);
      if (hh < 44 || ww < 44) {
        taps.push({ sel: s, w: ww, h: hh, txt: (el.textContent || el.value || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').replace(/\\s+/g, ' ').trim().slice(0, 32) });
      }
    }
    if (c.whiteSpace === 'nowrap' && el.scrollWidth > vw + 1) nowrap.push({ sel: s, sw: el.scrollWidth, txt: txtOf(el).slice(0, 40) });
    if ((tag === 'IMG' || tag === 'CANVAS' || tag === 'VIDEO' || tag === 'IFRAME' || tag === 'SVG') && r.width > vw + 1) wide.push({ sel: s, w: Math.round(r.width), tag });
    // контент, обрезанный собственным overflow:hidden контейнера
    const ox = c.overflowX;
    if ((ox === 'hidden' || ox === 'clip') && el.scrollWidth > Math.round(r.width) + 2 && r.width > vw * 0.5) {
      traps.push({ sel: s, sw: el.scrollWidth, cw: Math.round(r.width) });
    }
  });

  return JSON.stringify({
    vw, vh,
    scrollW: de.scrollWidth, bodyScrollW: document.body.scrollWidth,
    overflow: de.scrollWidth - vw,
    pageH: de.scrollHeight,
    nodes,
    offenders, fixedWide, tiny, taps, wide, nowrap, traps,
    viewportMeta: (document.querySelector('meta[name=viewport]') || {}).content || null,
    bodyFont: parseFloat(getComputedStyle(document.body).fontSize),
    h1: (() => { const e = document.querySelector('h1'); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize)) : null; })()
  });
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ds360-'));
  const ch = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', '--force-device-scale-factor=1',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
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

  await send('Page.enable');
  const report = {};
  for (const page of PAGES) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
    await Promise.race([loaded, sleep(10000)]);
    await sleep(900);
    // прокатка: иначе .rv-блоки остаются opacity:0 и не меряются
    await send('Runtime.evaluate', {
      expression: `(async () => { const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); })()`,
      awaitPromise: true
    });
    let data = null;
    try {
      const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
      data = JSON.parse(r.result.value);
    } catch (e) { data = { error: String(e.message).slice(0, 200) }; }
    report[page] = data;
    const d = data || {};
    console.log(`${page.padEnd(30)} ovf=${String(d.overflow).padStart(3)} offenders=${String((d.offenders||[]).length).padStart(2)} fixed=${String((d.fixedWide||[]).length).padStart(2)} tiny=${String((d.tiny||[]).length).padStart(2)} taps=${String((d.taps||[]).length).padStart(2)} wide=${(d.wide||[]).length} nowrap=${(d.nowrap||[]).length} traps=${(d.traps||[]).length} h=${d.pageH}`);
  }
  fs.writeFileSync(path.join(REPO, 'qa', 'mobile-360.json'), JSON.stringify(report, null, 1));
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
  await sleep(300);
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
