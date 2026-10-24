// qa/shots.js — честные скриншоты: эмуляция устройства через CDP (как в mobile-probe).
// Запуск: node qa/shots.js <outDir> [ширина] [страницы...]
// Пример: node qa/shots.js ../shots 390 index.html clarity.html
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9336;
const REPO = path.resolve(__dirname, '..');
const outDir = process.argv[2] || path.join(REPO, 'qa', 'shots');
const WIDTH = parseInt(process.argv[3] || '390', 10);
const SKIP = new Set(['polygon.html', 'lost-accounts-infographic.html']);
const PAGES = process.argv.slice(4).length
  ? process.argv.slice(4)
  : ['index.html', 'clarity.html', 'calculator.html', 'market.html', 'proof.html', 'system.html', 'channel.html'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsshot-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });

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

  for (const page of PAGES) {
    if (SKIP.has(page)) continue;
    await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 844, deviceScaleFactor: 2, mobile: WIDTH < 800 });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: 'file:///' + path.join(REPO, page).replace(/\\/g, '/') });
    await Promise.race([loaded, sleep(9000)]);
    await sleep(1200);
    // прокатываем страницу: иначе контент ниже сгиба остаётся в .rv (opacity:0)
    // и на снимке видны «пустоты», которых у живого пользователя нет
    await send('Runtime.evaluate', {
      expression: `(async () => { const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
        window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500)); })()`,
      awaitPromise: true
    });
    const h = (await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result.value;
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: Math.min(h, 12000), scale: 1 } });
    const file = path.join(outDir, page.replace('.html', '') + '-' + WIDTH + '.png');
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(`${file}  (${WIDTH}x${Math.min(h, 12000)}, ${Math.round(shot.data.length * 0.75 / 1024)} КБ)`);
  }
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
