// qa/experiment-shrink.js — кто именно раздувает layout страницы на телефоне.
// Метод: загрузить при 390, по очереди убирать подозреваемых, форсить relayout
// (повторный setDeviceMetricsOverride) и смотреть, вернётся ли innerWidth к 390.
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9340;
const REPO = path.resolve(__dirname, '..');
const page = process.argv[2] || 'clarity.html';
const W = 390;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CASES = [
  ['как есть', 'void 0'],
  ['убрать #stickyCta', "var e=document.getElementById('stickyCta'); if(e) e.remove();"],
  ['убрать плазму', "document.querySelectorAll('canvas[aria-hidden]').forEach(function(c){c.remove()})"],
  ['убрать оба', "var e=document.getElementById('stickyCta'); if(e) e.remove(); document.querySelectorAll('canvas[aria-hidden]').forEach(function(c){c.remove()})"],
  ['убрать <svg>', "document.querySelectorAll('svg').forEach(function(s){s.remove()})"],
  ['убрать всё fixed', "document.querySelectorAll('body *').forEach(function(e){ if(getComputedStyle(e).position==='fixed') e.remove(); })"],
];

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsexp-'));
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
  const url = 'file:///' + path.join(REPO, page).replace(/\\/g, '/');

  for (const [label, js] of CASES) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 1, mobile: true });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url });
    await Promise.race([loaded, sleep(9000)]);
    await sleep(1000);
    if (js !== 'void 0') { await send('Runtime.evaluate', { expression: js }); }
    // форсим пересчёт геометрии
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: true });
    await sleep(500);
    const r = await send('Runtime.evaluate', { expression: 'innerWidth + "|" + document.documentElement.scrollWidth', returnByValue: true });
    console.log(`${label.padEnd(24)} → ${r.result.value}   ${r.result.value.startsWith('390') ? '✅ 390' : '❌ всё ещё раздут'}`);
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
