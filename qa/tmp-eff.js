// qa/tmp-eff.js — эффективный размер шрифта (с учётом масштаба SVG), группы мелкого текста
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9343;
const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAGES = ['IA-JOURNEY.html', 'SERVICE-BLUEPRINT.html', 'value-chain.html', 'karta-resheniy.html'];

const EXPR = `(() => {
  const vw = innerWidth;
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
    const fs = parseFloat(c.fontSize);
    let scale = 1;
    if (el instanceof SVGElement && el.getScreenCTM) scale = el.getScreenCTM().a;
    const eff = fs * scale;
    if (eff < 12) {
      // в скроллере?
      let n = el.parentElement, scroller = false;
      while (n && n !== document.body) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') { scroller = true; break; } n = n.parentElement; }
      out.push({ sel: sel(el), fs: fs, scale: +scale.toFixed(2), eff: +eff.toFixed(1), scroller, txt: t.slice(0, 28) });
    }
  });
  return JSON.stringify({ vw, n: out.length, items: out });
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsef-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
  let target = null;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); target = (await r.json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  for (const page of PAGES) {
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
    await sleep(2600);
    const r = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    const d = JSON.parse(r.result.value);
    const grp = {};
    d.items.forEach(i => { const k = i.eff + (i.scroller ? ' (в скроллере)' : ''); (grp[k] = grp[k] || []).push(i); });
    console.log('\n=== ' + page + ' мелких=' + d.n);
    Object.entries(grp).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).forEach(([k, arr]) => {
      console.log('  ' + k + 'px × ' + arr.length + '  e.g. ' + arr.slice(0, 3).map(x => x.sel + ' «' + x.txt + '»' + (x.scale !== 1 ? ' [scale ' + x.scale + ']' : '')).join(' || '));
    });
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill(); await sleep(300);
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
