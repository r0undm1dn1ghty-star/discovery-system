// qa/mobile-360-text.js — эффективный размер текста <12px на 360px по всем страницам (с учётом scale SVG)
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9347;
const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SKIP = new Set(['polygon.html']);
const PAGES = fs.readdirSync(REPO).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();

const EXPR = `(() => {
  const out = [];
  const sel = el => { const bits = []; let n = el;
    while (n && n.tagName && n !== document.body && bits.length < 3) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; bits.unshift(s); break; }
      if (n.className && typeof n.className === 'string') { const c = n.className.trim().split(/\\s+/)[0]; if (c) s += '.' + c; }
      bits.unshift(s); n = n.parentElement; }
    return bits.join('>'); };
  document.querySelectorAll('body *').forEach(el => {
    if (el.children.length) return;
    const t = (el.textContent || '').trim(); if (!t) return;
    const c = getComputedStyle(el);
    if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const fs = parseFloat(c.fontSize);
    let scale = 1;
    if (el instanceof SVGElement && el.getScreenCTM) scale = el.getScreenCTM().a;
    const eff = fs * scale;
    if (eff >= 11.9) return;
    let n = el.parentElement, scroller = false;
    while (n && n !== document.body) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') { scroller = true; break; } n = n.parentElement; }
    out.push({ svg: el instanceof SVGElement, sel: sel(el), fs: fs, scale: +scale.toFixed(2), eff: +eff.toFixed(1), scroller, txt: t.slice(0, 30) });
  });
  return JSON.stringify(out);
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dstx-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
  let target = null;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); target = (await r.json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0; const pending = new Map(); const waiters = [];
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) waiters.filter(w => w.method === m.method).forEach(w => w.fire()); });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = m => new Promise(res => { const w = { method: m, fire: () => { waiters.splice(waiters.indexOf(w), 1); res(); } }; waiters.push(w); });
  await send('Page.enable');
  const report = {};
  for (const page of PAGES) {
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
    await Promise.race([loaded, sleep(10000)]);
    await sleep(1000);
    await send('Runtime.evaluate', { expression: `(async () => { const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
      window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 300)); })()`, awaitPromise: true });
    const r = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    report[page] = JSON.parse(r.result.value);
    const it = report[page];
    const svgN = it.filter(x => x.svg).length, htmlN = it.length - svgN;
    const minEff = it.length ? Math.min(...it.map(x => x.eff)) : null;
    console.log(`${page.padEnd(30)} мелких=${String(it.length).padStart(3)} (svg=${svgN}, html=${htmlN}) min=${minEff}`);
  }
  fs.writeFileSync(path.join(REPO, 'qa', 'mobile-360-text.json'), JSON.stringify(report, null, 1));
  try { await send('Browser.close'); } catch (e) {}
  ch.kill(); await sleep(300);
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
