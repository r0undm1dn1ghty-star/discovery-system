// qa/tmp-scroll.js — проверяет, лежат ли проблемные широкие блоки в горизонтальном скроллере
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CASES = [
  ['value-chain.html', 'svg#map'],
  ['value-chain.html', '.wide'],
  ['SERVICE-BLUEPRINT.html', '.diagram'],
  ['IA-JOURNEY.html', '.diagram'],
  ['karta-resheniy.html', 'table'],
  ['karta-resheniy.html', 'td.p'],
  ['karta-resheniy.html', 'table th'],
];

const EXPR = sel => `(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  if (!el) return JSON.stringify({ sel: ${JSON.stringify(sel)}, missing: true });
  const chain = []; let n = el;
  while (n && n !== document.body) {
    const c = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    chain.push({ t: n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\\s+/)[0] : ''),
      ox: c.overflowX, oy: c.overflowY, w: Math.round(r.width), sw: n.scrollWidth, fs: c.fontSize });
    n = n.parentElement;
  }
  const r = el.getBoundingClientRect();
  return JSON.stringify({ sel: ${JSON.stringify(sel)}, w: Math.round(r.width), h: Math.round(r.height),
    sw: el.scrollWidth, sh: el.scrollHeight, fs: getComputedStyle(el).fontSize, chain });
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dssc-'));
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
  let cur = '';
  for (const [page, sel] of CASES) {
    if (cur !== page) {
      await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
      await sleep(2500); cur = page;
    }
    const r = await send('Runtime.evaluate', { expression: EXPR(sel), returnByValue: true });
    const d = JSON.parse(r.result.value);
    console.log('\n' + page + ' :: ' + sel + '  w=' + d.w + ' sw=' + d.sw + ' fs=' + d.fs);
    (d.chain || []).slice(0, 6).forEach(c => console.log(`   ${c.t} w=${c.w} sw=${c.sw} ox=${c.ox} fs=${c.fs}`));
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill(); await sleep(300);
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
