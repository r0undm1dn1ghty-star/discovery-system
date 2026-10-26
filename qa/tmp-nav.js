// qa/tmp-nav.js — все элементы мобильного нава: размеры и тап-зоны
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9345;
const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const EXPR = `(() => {
  const out = [];
  document.querySelectorAll('nav.top a, nav.top button, nav.top [role=button], .sticky-cta a, .sticky-cta button, #ds-cookie-note a, footer a').forEach(el => {
    const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
    out.push({ tag: el.tagName, txt: (el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26),
      w: Math.round(r.width), h: Math.round(r.height), fs: c.fontSize, disp: c.display, vis: c.visibility,
      pad: c.padding, box: el.className && typeof el.className === 'string' ? el.className.slice(0,24) : '' });
  });
  return JSON.stringify(out);
})()`;
async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsnv-'));
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
  for (const page of ['index.html', 'clarity.html', 'policy.html']) {
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
    await sleep(2400);
    const r = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    console.log('\n=== ' + page);
    JSON.parse(r.result.value).forEach(x => console.log(`  ${String(x.w).padStart(4)}x${String(x.h).padStart(3)} ${x.fs.padStart(6)} ${x.tag} «${x.txt}» ${x.box}`));
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill(); await sleep(300);
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
