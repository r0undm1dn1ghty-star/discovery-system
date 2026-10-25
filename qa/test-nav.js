// qa/test-nav.js — проверка системы нава: единство состава/регистра/активного пункта
// на всех страницах, отсутствие нава на возвратах Робокассы, поведение на мобилке.
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9352; const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PAGES = ['index.html','system.html','proof.html','market.html','channel.html','clarity.html',
  'calculator.html','agent-failures.html','nacenka.html','value-chain.html','lost-accounts.html',
  'pay.html','oferta.html','policy.html','services.html','thanks.html','fail.html'];

const READ = `(() => {
  const nav = document.querySelector('nav.top');
  if (!nav) return JSON.stringify({ nav: false });
  const links = [...nav.querySelectorAll('a')].map(a => ({
    t: a.textContent.trim(), on: a.classList.contains('on'), h: a.getAttribute('href')
  }));
  return JSON.stringify({
    nav: true,
    items: links.map(l => l.t),
    active: links.filter(l => l.on).map(l => l.t),
    h: Math.round(nav.getBoundingClientRect().height),
    overflow: document.documentElement.scrollWidth - window.innerWidth
  });
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsn-'));
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

  const compositions = new Map();
  for (const w of [1440, 390]) {
    console.log(`\n═══ ширина ${w} ═══`);
    for (const page of PAGES) {
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:false});
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate',{url:'file:///'+path.join(REPO,page).replace(/\\/g,'/')});
      await Promise.race([loaded, sleep(9000)]); await sleep(600);
      let d; try { d = JSON.parse((await send('Runtime.evaluate',{expression:READ,returnByValue:true})).result.value); } catch(e) { d = {nav:false,error:true}; }
      if (!d.nav) { console.log(`  ${page.padEnd(24)} нава нет`); continue; }
      const key = d.items.join(' | ');
      compositions.set(key, (compositions.get(key)||0)+1);
      console.log(`  ${page.padEnd(24)} активен: ${(d.active.join(',')||'—').padEnd(12)} высота ${d.h}px  переполнение ${d.overflow}px`);
      if (d.items.join(' | ') !== [...compositions.keys()][0] && compositions.size > 1) {
        console.log(`      ⚠ состав отличается: ${key}`);
      }
    }
  }
  console.log('\n=== УНИКАЛЬНЫХ СОСТАВОВ НАВА:', compositions.size, '===');
  for (const [k,v] of compositions) console.log(`  ×${v}: ${k}`);
  console.log('\n=== возвраты Робокассы (нава быть НЕ должно) ===');
  for (const page of ['thanks.html','fail.html']) {
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate',{url:'file:///'+path.join(REPO,page).replace(/\\/g,'/')});
    await Promise.race([loaded, sleep(9000)]); await sleep(500);
    const d = JSON.parse((await send('Runtime.evaluate',{expression:READ,returnByValue:true})).result.value);
    console.log(`  ${page.padEnd(24)} ${d.nav ? '⚠ НАВ ЕСТЬ — УБРАТЬ' : '✓ нава нет, страница сфокусирована'}`);
  }
  try{ await send('Browser.close'); }catch(e){}
  ch.kill();
}
main().catch(e=>{console.error('FAIL',e);process.exit(1);});
