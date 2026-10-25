// qa/audit-density.js — замер перегруза страниц: экраны, блоки, CTA, слова.
// Запуск: node qa/audit-density.js
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9362; const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PAGES = ['index.html','system.html','proof.html','market.html','channel.html','clarity.html','calculator.html','value-chain.html','nacenka.html','agent-failures.html','lost-accounts.html'];

const READ = `(() => {
  const vh = innerHeight;
  const H = document.documentElement.scrollHeight;
  const words = document.body.innerText.trim().split(/\\s+/).length;
  const btns = [...document.querySelectorAll('a.btn, button.btn, .btn-primary, .btn-buy, .btn-tg, .btn-cta')];
  const ctaLabels = [...new Set(btns.map(b => b.textContent.trim().replace(/\\s+/g,' ').slice(0,28)))];
  const sec = [...document.querySelectorAll('section')];
  const cards = document.querySelectorAll('.case, .ic, .res-card, .tool, .sig, .sub-card, .prob-item, .g-card, .rs, .m-item, .kpi').length;
  const links = document.querySelectorAll('main a, header a, footer a').length;
  const grids = new Set([...document.querySelectorAll('main [class*="grid"], main [class*="track"], main [class*="rows"], main [class*="list"]')].map(e=>e.className.split(' ')[0])).size;
  // CTA на калькулятор
  const calc = [...document.querySelectorAll('a[href*="calculator"]')].length;
  // форматы, которые надо выучить читателю (уникальные типы карточек)
  const cardTypes = new Set([...document.querySelectorAll('main [class*="card"], main [class*="row"], main [class*="item"], main .case, main .rs, main .kpi')].map(e=>e.className.split(' ')[0])).size;
  return JSON.stringify({
    screens: +(H/vh).toFixed(1),
    sections: sec.length,
    words,
    cards,
    cardTypes,
    grids,
    links,
    ctaCount: btns.length,
    ctaLabels,
    calcLinks: calc
  });
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsden-'));
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
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  console.log('страница                экраны  секций  карточек  форматов  CTA  слов  ссылок  из них в кальк.');
  for (const page of PAGES) {
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate',{url:'file:///'+path.join(REPO,page).replace(/\\/g,'/')});
    await Promise.race([loaded, sleep(9000)]); await sleep(900);
    const d = JSON.parse((await send('Runtime.evaluate',{expression:READ,returnByValue:true})).result.value);
    console.log(
      page.padEnd(22) + String(d.screens).padStart(6) + String(d.sections).padStart(8) +
      String(d.cards).padStart(9) + String(d.cardTypes).padStart(9) +
      String(d.ctaCount).padStart(5) + String(d.words).padStart(6) + String(d.links).padStart(8) +
      String(d.calcLinks).padStart(15)
    );
  }
  try{ await send('Browser.close'); }catch(e){}
  ch.kill();
}
main().catch(e=>{console.error('FAIL',e);process.exit(1);});
