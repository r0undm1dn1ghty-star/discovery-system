// qa/check-w3.js — проверка трёх раскладок: overflow, ошибки консоли, шрифты, скриншоты.
// Запуск: node qa/check-w3.js
// Пишет: qa/shots-w3/{editorial,story,datafirst}-{390,1440}.png
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9362;
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'shots-w3');
const PAGES = ['editorial/index.html', 'story/index.html', 'datafirst/index.html'];
const WIDTHS = [[390, 844], [1440, 900]];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  const vw = innerWidth;
  const de = document.documentElement;
  const sel = el => {
    const bits = []; let n = el;
    while (n && n.tagName && n !== document.body && bits.length < 3) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; bits.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        const c = n.className.trim().split(/\\s+/).filter(Boolean).slice(0, 2).join('.');
        if (c) s += '.' + c;
      }
      bits.unshift(s); n = n.parentElement;
    }
    return bits.join(' > ');
  };
  const offenders = [], tiny = [], taps = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (r.width === 0 || r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      let inScroller = false, n = el.parentElement;
      while (n && n !== document.body) {
        const o = getComputedStyle(n).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { inScroller = true; break; }
        n = n.parentElement;
      }
      if (!inScroller && offenders.length < 8) offenders.push({ sel: sel(el), left: Math.round(r.left), right: Math.round(r.right), txt: (el.textContent || '').trim().slice(0, 32) });
    }
    if (el.children.length === 0 && (el.textContent || '').trim() && parseFloat(cs.fontSize) < 12) {
      if (tiny.length < 8) tiny.push({ sel: sel(el), fs: cs.fontSize, txt: el.textContent.trim().slice(0, 28) });
    }
    const tag = el.tagName;
    if ((tag === 'A' || tag === 'BUTTON') && r.height < 44 && r.width > 8) {
      if (taps.length < 8) taps.push({ sel: sel(el), h: Math.round(r.height), txt: (el.textContent || '').trim().slice(0, 22) });
    }
  });
  return JSON.stringify({
    vw,
    overflow: de.scrollWidth - vw,
    bodyOverflow: document.body.scrollWidth - vw,
    offenders, tiny, taps,
    height: de.scrollHeight,
    fonts: {
      onest: document.fonts.check('700 32px Onest', 'Привет'),
      plex: document.fonts.check('400 16px "IBM Plex Sans"', 'Привет'),
      mono: document.fonts.check('400 14px "IBM Plex Mono"', 'Привет'),
      h1: (() => { const e = document.querySelector('h1'); return e ? getComputedStyle(e).fontFamily : null; })()
    },
    agentLines: document.querySelectorAll('#log .ln').length,
    titles: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim().slice(0, 60)).length
  });
})()`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsw3-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--force-device-scale-factor=1',
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
  let errors = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    } else if (m.method) {
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push('console.error: ' + (m.params.args || []).map(a => a.value || a.description || a.type).join(' '));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        errors.push('exception: ' + (d.exception && d.exception.description || d.text || 'unknown'));
      }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
      }
      waiters.filter(w => w.method === m.method).forEach(w => w.fire());
    }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const once = method => new Promise(res => {
    const w = { method, fire: () => { waiters.splice(waiters.indexOf(w), 1); res(); } };
    waiters.push(w);
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  const report = {};
  let problems = 0;

  for (const page of PAGES) {
    report[page] = {};
    const fileUrl = 'file:///' + path.join(ROOT, page).replace(/\\/g, '/');
    for (const [w, h] of WIDTHS) {
      errors = [];
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url: fileUrl });
      await Promise.race([loaded, sleep(9000)]);
      await sleep(1400);

      // прокрутка: проявляем контент и запускаем консоль агента
      await send('Runtime.evaluate', {
        expression: `(async () => {
          const H = document.documentElement.scrollHeight;
          for (let y = 0; y < H; y += 420) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 55)); }
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 3200));
        })()`,
        awaitPromise: true
      });

      const raw = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
      const data = JSON.parse(raw.result.value);
      report[page][w] = data;

      const shot = await send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: w, height: Math.min(data.height, 14000), scale: 1 }
      });
      const out = path.join(OUT, page.split('/')[0] + '-' + w + '.png');
      fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));

      const bad = data.overflow > 1;
      if (bad) problems++;
      if (data.tiny.length) problems++;
      if (errors.length) problems++;
      console.log(`\n── ${page} @${w}`);
      console.log(`   overflow=${data.overflow}px (body ${data.bodyOverflow}px) · высота ${data.height}px · строк агента ${data.agentLines}`);
      console.log(`   шрифты: Onest=${data.fonts.onest} PlexSans=${data.fonts.plex} PlexMono=${data.fonts.mono} · h1: ${String(data.fonts.h1).split(',')[0]}`);
      console.log(`   ошибки консоли: ${errors.length ? errors.join(' | ') : '0'}`);
      console.log(`   вылеты за вьюпорт: ${data.offenders.length ? data.offenders.map(o => o.sel + ' ' + o.right + 'px').join(' | ') : '0'}`);
      console.log(`   текст <12px: ${data.tiny.length ? data.tiny.map(t => t.fs + ' ' + t.sel).join(' | ') : '0'}`);
      console.log(`   тап-зоны <44px: ${data.taps.length ? data.taps.map(t => t.sel + ' ' + t.h).join(' | ') : '0'}`);
      console.log(`   скриншот: ${path.relative(ROOT, out)}`);
    }
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log('\n=== ПРОБЛЕМ: ' + problems + ' · отчёт qa/shots-w3/report.json ===');
  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
  await sleep(300);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
