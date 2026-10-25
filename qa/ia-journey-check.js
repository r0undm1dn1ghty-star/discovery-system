// qa/ia-journey-check.js — проверка артефакта IA-JOURNEY.html в headless Chrome (CDP, без зависимостей).
// Ловит: ошибки консоли и исключения, горизонтальное переполнение (documentElement.scrollWidth vs innerWidth),
// видимую раскладку (широкая/узкая), готовность шрифтов. Пишет скриншоты в qa/shots-ia/.
// Запуск: node qa/ia-journey-check.js
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9338;
const REPO = path.resolve(__dirname, '..');
const PAGE = 'IA-JOURNEY.html';
const OUT = path.join(REPO, 'qa', 'shots-ia');
const WIDTHS = [390, 768, 1440];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  const de = document.documentElement, vw = innerWidth;
  const wide = document.querySelector('.jmap-wide'), narrow = document.querySelector('.jmap-narrow');
  const vis = el => el && getComputedStyle(el).display !== 'none';
  const r = el => el ? el.getBoundingClientRect() : null;
  const offenders = [];
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest('svg')) return;               // внутри svg — масштабируется, не переполняет
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'fixed') return;
    let p = el.parentElement, scroller = false;
    while (p && p !== document.body) { const o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') { scroller = true; break; } p = p.parentElement; }
    if (!scroller && (b.right > vw + 1 || b.left < -1))
      offenders.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ' w=' + Math.round(b.width));
  });
  const w = r(wide), n = r(narrow);
  // геометрия видимой схемы: текст за пределами viewBox и наложения текста на текст
  const svg = vis(narrow) ? narrow : wide;
  const vb = (svg.getAttribute('viewBox') || '').split(/\\s+/).map(Number);
  const vbW = vb[2], vbH = vb[3];
  const texts = [...svg.querySelectorAll('text')].map(t => {
    const b = t.getBBox();
    return { t: (t.textContent || '').slice(0, 26), x: b.x, y: b.y, w: b.width, h: b.height };
  });
  const outOfBox = texts.filter(o => o.x < -0.5 || o.x + o.w > vbW + 0.5 || o.y + o.h > vbH + 0.5)
    .map(o => o.t + ' [' + Math.round(o.x) + '..' + Math.round(o.x + o.w) + ']');
  const collisions = [];
  const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
                          Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j], ov = inter(a, b);
    if (ov > 0.12 * Math.min(a.w * a.h, b.w * b.h)) collisions.push(a.t + ' × ' + b.t + ' (' + Math.round(ov) + 'px2)');
  }
  // широкая схема: колонки 160 + i*196, ширина 176 → текст не должен выходить из своей колонки
  const outOfBand = [];
  if (!vis(narrow)) {
    const PL = 160, COL = 176, GUT = 20, NST = 5, TOL = 6;
    texts.filter(t => t.y < 640).forEach(o => {
      const inMargin = o.x + o.w <= PL - TOL;
      const inCol = [...Array(NST).keys()].some(i => { const x0 = PL + i * (COL + GUT);
        return o.x >= x0 - TOL && o.x + o.w <= x0 + COL + TOL; });
      if (!inMargin && !inCol) outOfBand.push(o.t + ' [' + Math.round(o.x) + '..' + Math.round(o.x + o.w) + ']');
    });
  }
  return JSON.stringify({
    vw, scrollW: de.scrollWidth, bodyScrollW: document.body.scrollWidth,
    overflow: de.scrollWidth - vw, offenders: offenders.slice(0, 10),
    wideVisible: vis(wide), narrowVisible: vis(narrow),
    wideBox: w ? { w: Math.round(w.width), h: Math.round(w.height) } : null,
    narrowBox: n ? { w: Math.round(n.width), h: Math.round(n.height) } : null,
    pageH: de.scrollHeight, svgViewBox: [vbW, vbH], scale: svg ? +(svg.getBoundingClientRect().width / vbW).toFixed(3) : null,
    texts: texts.length, outOfBox, outOfBand, collisions: collisions.slice(0, 12),
    fonts: {
      onest: document.fonts.check('600 20px Onest', '\u041f\u0440\u0438\u0432\u0435\u0442'),
      plex: document.fonts.check('16px "IBM Plex Sans"', '\u041f\u0440\u0438\u0432\u0435\u0442'),
      mono: document.fonts.check('16px "IBM Plex Mono"', '01'),
      size: document.fonts.size
    },
    h1: (() => { const e = document.querySelector('h1'); return e ? { ff: getComputedStyle(e).fontFamily, fs: getComputedStyle(e).fontSize } : null; })(),
    svgCount: document.querySelectorAll('svg').length,
    minSvgFont: Math.min(...[...svg.querySelectorAll('text')].map(t => parseFloat(getComputedStyle(t).fontSize))),
    title: document.title
  });
})()`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsia-'));
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + tmp, 'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      target = (await r.json()).find(t => t.type === 'page'); } catch (e) {}
  }
  if (!target) { console.error('Chrome не поднялся'); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0; const pending = new Map(); const waiters = [];
  const problems = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); return; }
    if (m.method === 'Runtime.exceptionThrown')
      problems.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type))
      problems.push('CONSOLE.' + m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level))
      problems.push('LOG.' + m.params.entry.level + ': ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
    if (m.method) waiters.filter(w => w.method === m.method).forEach(w => w.fire());
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = method => new Promise(res => { const w = { method, fire: () => {
    waiters.splice(waiters.indexOf(w), 1); res(); } }; waiters.push(w); });

  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

  const first = once('Page.loadEventFired');
  await send('Page.navigate', { url: 'file:///' + path.join(REPO, PAGE).replace(/\\/g, '/') });
  await Promise.race([first, sleep(9000)]);

  const report = {};
  for (const W of WIDTHS) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 800 });
    const loaded = once('Page.loadEventFired');
    await send('Page.reload', { ignoreCache: true });
    await Promise.race([loaded, sleep(9000)]);
    await sleep(900);
    const res = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const d = JSON.parse(res.result.value);
    report[W] = d;
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: W, height: Math.min(d.pageH, 14000), scale: 1 } });
    const file = path.join(OUT, 'ia-journey-' + W + '.png');
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(`${PAGE} @${W}px  overflow=${d.overflow}  scrollW=${d.scrollW}/${d.vw}  ` +
      `wide=${d.wideVisible}(${d.wideBox ? d.wideBox.w + 'x' + d.wideBox.h : '-'})  ` +
      `narrow=${d.narrowVisible}(${d.narrowBox ? d.narrowBox.w + 'x' + d.narrowBox.h : '-'})  ` +
      `pageH=${d.pageH}  offenders=${d.offenders.length}  шрифты onest=${d.fonts.onest} plex=${d.fonts.plex} mono=${d.fonts.mono}`);
    console.log(`  схема ${d.svgViewBox.join('x')} scale=${d.scale} текстовых узлов=${d.texts} вне viewBox=${d.outOfBox.length} вне колонки=${d.outOfBand.length} наложений=${d.collisions.length} minFont=${d.minSvgFont}px`);
    if (d.offenders.length) console.log('  вылезает:', d.offenders.join(' | '));
    if (d.outOfBox.length) console.log('  за пределами viewBox:', d.outOfBox.join(' | '));
    if (d.outOfBand.length) console.log('  выходит из колонки:', d.outOfBand.join(' | '));
    if (d.collisions.length) console.log('  наложения:', d.collisions.join(' | '));
    console.log(`  скриншот: ${path.relative(REPO, file).replace(/\\/g, '/')}`);
  }

  console.log('\n=== ошибки консоли и исключения: ' + problems.length + ' ===');
  [...new Set(problems)].slice(0, 20).forEach(p => console.log('  ' + p));
  console.log('\n=== 390px ===');
  console.log('  scrollWidth==innerWidth: ' + (report[390].scrollW === report[390].vw));
  console.log('  min font в svg: ' + report[390].minSvgFont + 'px, svg-блоков: ' + report[390].svgCount);
  fs.writeFileSync(path.join(REPO, 'qa', 'ia-journey-report.json'), JSON.stringify({ report, problems }, null, 1));
  console.log('  отчёт: qa/ia-journey-report.json');

  try { await send('Browser.close'); } catch (e) {}
  ch.kill();
}
main().catch(e => { console.error('FAIL', e); process.exit(1); });
