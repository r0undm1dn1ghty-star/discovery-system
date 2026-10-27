// Визуальный аудит вёрстки на CDP: оверфлоу, перекрытия, мелкий текст, контраст — 1440 и 390
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function lum(r, g, b) { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(c1, c2) { const a = lum(...c1), b = lum(...c2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
function parseColor(s) { const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; }

async function audit(width, height) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsvis-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, `--window-size=${width},${height}`, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });
  let ws = null;
  for (let i = 0; i < 40 && !ws; i++) { await sleep(250); try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); const t = (await r.json()).find(t => t.type === 'page'); if (t) { ws = t.webSocketDebuggerUrl; } } catch (e) {} }
  if (!ws) { console.error('Chrome не поднялся'); process.exit(1); }
  const Ws = new WebSocket(ws); await new Promise(r => Ws.onopen = r);
  let id = 0; const pend = new Map();
  Ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); Ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width < 500 ? 2 : 1, mobile: width < 500 });
  await send('Page.navigate', { url: 'file:///' + REPO.replace(/\\/g, '/') + '/calculator.html' });
  await sleep(2500);
  const res = await send('Runtime.evaluate', { expression: `(() => {
    const parseColor=(s)=>{const m=(s||'').match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null;};
    const lum=(r,g,b)=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
    const contrast=(c1,c2)=>{const a=lum(c1[0],c1[1],c1[2]),b=lum(c2[0],c2[1],c2[2]);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);};
    const out = { overflowX: document.documentElement.scrollWidth - window.innerWidth, smallText: [], lowContrast: [], overlaps: [], tinyTaps: [], err: '' };
    try {
    const els = [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const txt = (el.textContent || '').trim();
      if (txt && fs < 11.5 && el.children.length === 0) out.smallText.push({ tag: el.tagName + '.' + ((el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '').toString().split(' ')[0], fs, txt: txt.slice(0, 26) });
      if ((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && txt && (r.height < 40 || r.width < 40)) out.tinyTaps.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), txt: txt.slice(0, 20) });
      if (el.children.length === 0 && txt && fs >= 11) {
        const cs = getComputedStyle(el); const c = parseColor(cs.color); const bgS = parseColor(cs.backgroundColor);
        let bg = bgS && bgS[3] > 0.5 ? bgS.slice(0, 3) : [17, 21, 36];
        if (c && bg && c[3] > 0.3) { const cr = contrast(c.slice(0, 3), bg); if (cr < 4.5 && fs < 18) out.lowContrast.push({ txt: txt.slice(0, 24), fs, cr: Math.round(cr * 10) / 10, col: cs.color }); }
      }
    }
    const clickables = els.filter(e => (e.tagName === 'BUTTON' || e.getAttribute('role') === 'button'));
    for (let i = 0; i < clickables.length; i++) for (let j = i + 1; j < clickables.length; j++) {
      const a = clickables[i].getBoundingClientRect(), b = clickables[j].getBoundingClientRect();
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      if (x > 8 && y > 8) out.overlaps.push(((clickables[i].textContent || '') + '').trim().slice(0, 14) + ' × ' + ((clickables[j].textContent || '') + '').trim().slice(0, 14));
    }
    out.smallText = out.smallText.slice(0, 8); out.tinyTaps = out.tinyTaps.slice(0, 8); out.overlaps = out.overlaps.slice(0, 8); out.lowContrast = out.lowContrast.slice(0, 8);
    } catch (e) { out.err = e.message; }
    return JSON.stringify(out);
  })()`, returnByValue: true });
  console.log('=== ' + width + 'px ===');
  console.log(res.result.value);
  Ws.close(); ch.kill();
}

(async () => { await audit(1440, 900); await audit(390, 844); process.exit(0); })();
