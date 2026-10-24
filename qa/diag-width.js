// qa/diag-width.js — почему страница не сжимается: ищем элементы, раздувающие layout.
// Запуск: node qa/diag-width.js clarity.html 390
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9338;
const REPO = path.resolve(__dirname, '..');
const page = process.argv[2] || 'clarity.html';
const W = parseInt(process.argv[3] || '390', 10);
const MOBILE = process.argv[4] !== 'desktop';  // desktop → честный поиск переполнения
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  const sel = el => { const b = []; let n = el;
    while (n && n.tagName && n !== document.body && b.length < 3) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; b.unshift(s); break; }
      if (typeof n.className === 'string' && n.className.trim()) s += '.' + n.className.trim().split(/\\s+/).slice(0,2).join('.');
      b.unshift(s); n = n.parentElement; }
    return b.join(' > '); };
  const rows = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect(); if (!r.width) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    rows.push({ sel: sel(el), w: Math.round(r.width), right: Math.round(r.right),
      minW: cs.minWidth, width: cs.width, ws: cs.whiteSpace, ovf: cs.overflowX,
      inner: el.scrollWidth - el.clientWidth });
  });
  rows.sort((a, b) => b.w - a.w);
  const innerOverflow = rows.filter(r => r.inner > 4).slice(0, 10);
  const offenders = rows.filter(r => r.right > innerWidth + 1).slice(0, 14);
  return JSON.stringify({ vw: innerWidth, scrollW: document.documentElement.scrollWidth,
    widest: rows.slice(0, 8), innerOverflow, offenders }, null, 1);
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsdiag-'));
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
  const once = method => new Promise(res => { const w = { method, fire: () => { waiters.splice(waiters.indexOf(w), 1); res(); } }; waiters.push(w); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 1, mobile: MOBILE });
  const loaded = once('Page.loadEventFired');
  const pageUrl = /^https?:/.test(page) ? page : 'file:///' + path.join(REPO, page).replace(/\\/g, '/');
  await send('Page.navigate', { url: pageUrl });
  await Promise.race([loaded, sleep(9000)]);
  await sleep(1200);
  const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
  console.log(r.result.value);
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
