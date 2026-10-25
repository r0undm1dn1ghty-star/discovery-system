// qa/blueprint-check.js — проверка SERVICE-BLUEPRINT.html:
// ошибки консоли, overflow на 390 и 1440, скриншоты в qa/shots-blueprint/.
// Запуск: node qa/blueprint-check.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
const REPO = path.resolve(__dirname, '..');
const PAGE = 'file:///' + path.join(REPO, 'SERVICE-BLUEPRINT.html').replace(/\\/g, '/');
const OUT = path.join(REPO, 'qa', 'shots-blueprint');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsbp-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); target = (await r.json()).find(t => t.type === 'page'); } catch (e) {}
  }
  if (!target) { console.error('FAIL: chrome не поднялся'); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });

  const consoleErrors = [];
  const origSend = send;
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
      consoleErrors.push(m.params.entry.text);
    if (m.method === 'Runtime.exceptionThrown')
      consoleErrors.push('EXCEPTION: ' + (m.params.exceptionDetails.text || '') + ' ' + ((m.params.exceptionDetails.exception || {}).description || ''));
  });

  await origSend('Runtime.enable');
  await origSend('Page.enable');
  await origSend('Log.enable');
  await origSend('Emulation.setScriptExecutionDisabled', { value: false });
  await origSend('Page.navigate', { url: PAGE });
  await sleep(1800);

  const results = [];
  for (const W of [390, 1440]) {
    await origSend('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 2, mobile: W < 700 });
    await sleep(600);
    const m = await origSend('Runtime.evaluate', { returnByValue: true, expression: `(() => {
      const d = document.documentElement;
      return {
        scrollW: d.scrollWidth, clientW: d.clientWidth,
        scrollH: d.scrollHeight, clientH: d.clientHeight,
        bodyScrollW: document.body.scrollWidth,
        svgCount: document.querySelectorAll('svg').length,
        title: document.title
      };
    })()` });
    const r = m.result.value;
    const overflowX = Math.max(r.scrollW, r.bodyScrollW) - r.clientW;
    results.push({ width: W, ...r, overflow: overflowX });
    // полный кадр: высота вьюпорта = высоте контента (легенда и футер попадают в скриншот)
    const fullH = Math.min(Math.max(r.scrollH, 900), 5000);
    await origSend('Emulation.setDeviceMetricsOverride', { width: W, height: fullH, deviceScaleFactor: 2, mobile: W < 700 });
    await sleep(500);
    const shot = await origSend('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(path.join(OUT, `blueprint-${W}.png`), Buffer.from(shot.data, 'base64'));
  }

  try { ch.kill(); } catch (e) {}

  let fail = false;
  for (const r of results) {
    const ok = r.overflow <= 0 && r.svgCount >= 1;
    if (!ok) fail = true;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.width}px  overflow=${r.overflow}  scrollW=${r.scrollW} clientW=${r.clientW}  svg=${r.svgCount}  title="${r.title}"`);
  }
  if (consoleErrors.length) {
    fail = true;
    console.log('FAIL console errors:');
    consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('OK   консоль без ошибок (Log + Runtime)');
  }
  console.log('Скриншоты: ' + OUT);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FAIL: ' + e.message); process.exit(1); });
