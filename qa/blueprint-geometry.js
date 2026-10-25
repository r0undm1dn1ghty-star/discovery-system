// qa/blueprint-geometry.js — геометрия SVG: тексты не вылезают за ячейки и полотно.
// Запуск: node qa/blueprint-geometry.js
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9342;
const REPO = path.resolve(__dirname, '..');
const PAGE = 'file:///' + path.join(REPO, 'SERVICE-BLUEPRINT.html').replace(/\\/g, '/');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsgeo-'));
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
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(1800);

  const expr = `(() => {
    const svg = document.querySelector('.diagram svg');
    const out = { violations: [], texts: 0 };
    // границы полотна
    for (const t of svg.querySelectorAll('text')) {
      out.texts++;
      const b = t.getBBox();
      if (b.x < 0) out.violations.push('LEFT<0: "' + t.textContent + '" x=' + b.x.toFixed(1));
      if (b.x + b.width > 1280) out.violations.push('RIGHT>1280: "' + t.textContent + '" right=' + (b.x + b.width).toFixed(1));
      if (b.y < 8) out.violations.push('TOP: "' + t.textContent + '" y=' + b.y.toFixed(1));
      if (b.y + b.height > 620) out.violations.push('BOTTOM: "' + t.textContent + '" y=' + (b.y + b.height).toFixed(1));
    }
    // тексты внутри своих ячеек (rect с data-name, запас 4px)
    for (const r of svg.querySelectorAll('rect[data-name]')) {
      const rx = +r.getAttribute('x'), rw = +r.getAttribute('width');
      const cx = rx + rw / 2;
      for (const t of r.parentNode.querySelectorAll('text')) {
        if (Math.abs(+t.getAttribute('x') - cx) > 1) continue; // текст другой ячейки
        const b = t.getBBox();
        if (b.x < rx + 2) out.violations.push('CELL-L: "' + t.textContent + '" b.x=' + b.x.toFixed(1) + ' < ' + (rx + 2));
        if (b.x + b.width > rx + rw - 2) out.violations.push('CELL-R: "' + t.textContent + '" right=' + (b.x + b.width).toFixed(1) + ' > ' + (rx + rw - 2));
      }
    }
    return out;
  })()`;
  const m = await send('Runtime.evaluate', { returnByValue: true, expression: expr });
  const r = m.result.value;
  console.log('текстов проверено: ' + r.texts);
  if (r.violations.length) { r.violations.forEach(v => console.log('FAIL ' + v)); process.exitCode = 1; }
  else console.log('OK   геометрия чистая: за ячейки и полотно ничего не вылезает');
  try { ch.kill(); } catch (e) {}
}
main().catch(e => { console.error('FAIL: ' + e.message); process.exit(1); });
