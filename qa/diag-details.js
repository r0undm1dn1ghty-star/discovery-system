// qa/diag-details.js — точечные проверки мобильной вёрстки, о которых спорили:
// мелкий текст, разрыв чисел, помещаются ли вкладки, отступы в блоке цены.
// Запуск: node qa/diag-details.js index.html 390
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9344;
const REPO = path.resolve(__dirname, '..');
const page = process.argv[2] || 'index.html';
const W = parseInt(process.argv[3] || '390', 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  const sel = el => { const b=[]; let n=el;
    while(n&&n.tagName&&n!==document.body&&b.length<2){let s=n.tagName.toLowerCase();
      if(n.id){s+='#'+n.id;b.unshift(s);break;}
      if(typeof n.className==='string'&&n.className.trim())s+='.'+n.className.trim().split(/\\s+/)[0];
      b.unshift(s);n=n.parentElement;} return b.join('>'); };
  const out = { tiny: [], nowrapRisk: [], rows: [], tabs: null };

  // 1. мелкий текст (<12px), включая вложенный
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden') return;
    const fs = parseFloat(cs.fontSize);
    const own = [...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim());
    if (own && fs < 12) { const r = el.getBoundingClientRect();
      out.tiny.push({ sel: sel(el), fs: fs, txt: el.textContent.trim().slice(0,32), w: Math.round(r.width) }); }
  });

  // 2. блоки со значениями цены: ширина колонки и возможный разрыв числа
  document.querySelectorAll('.op-row, .op-total, .op-name, .op-val').forEach(el => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    out.rows.push({ sel: sel(el), cls: el.className, left: Math.round(r.left), w: Math.round(r.width),
      ws: cs.whiteSpace, fs: cs.fontSize, txt: el.textContent.trim().slice(0,40) });
  });

  // 3. вкладки виджета «Проверь сам за минуту»: помещаются ли в строку
  const tabrow = document.querySelector('.tabs, .tabbar, [class*="tab"]');
  if (tabrow) { const cs = getComputedStyle(tabrow);
    out.tabs = { cls: tabrow.className, w: Math.round(tabrow.getBoundingClientRect().width),
      scrollW: tabrow.scrollWidth, overflowX: cs.overflowX, flexWrap: cs.flexWrap, count: tabrow.children.length,
      items: [...tabrow.children].map(c => ({ t: c.textContent.trim().slice(0,18), w: Math.round(c.getBoundingClientRect().width) })) }; }
  return JSON.stringify(out, null, 1);
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsdet-'));
  const ch = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',
    '--remote-debugging-port=' + PORT,'--user-data-dir=' + tmp,'about:blank'], { stdio: 'ignore' });
  let t=null; for (let i=0;i<40&&!t;i++){ await sleep(250);
    try{ const r=await fetch('http://127.0.0.1:'+PORT+'/json/list'); t=(await r.json()).find(x=>x.type==='page'); }catch(e){} }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.addEventListener('open',res);ws.addEventListener('error',rej);});
  let id=0; const pending=new Map(); const waiters=[];
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);
    if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}
    else if(m.method) waiters.filter(w=>w.method===m.method).forEach(w=>w.fire());});
  const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
  const once=m=>new Promise(res=>{const w={method:m,fire:()=>{waiters.splice(waiters.indexOf(w),1);res();}};waiters.push(w);});
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:900,deviceScaleFactor:1,mobile:false});
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate',{url:'file:///'+path.join(REPO,page).replace(/\\/g,'/')});
  await Promise.race([loaded,sleep(9000)]); await sleep(1200);
  const r = await send('Runtime.evaluate',{expression:PROBE,returnByValue:true});
  console.log(r.result.value);
  try{ await send('Browser.close'); }catch(e){}
  ch.kill();
}
main().catch(e=>{console.error('FAIL',e);process.exit(1);});
