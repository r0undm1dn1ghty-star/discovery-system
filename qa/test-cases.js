// qa/test-cases.js — проверка дорожки кейсов: авто-прокрутка, гашение при касании,
// одинаковость карточек (одна форма), отсутствие переполнения, работа стрелок.
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9350; const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const READ = `(() => {
  const t = document.querySelector('.cases-track');
  const cards = [...document.querySelectorAll('.case')];
  const shapes = cards.map(c => ({
    h: Math.round(c.getBoundingClientRect().height),
    w: Math.round(c.getBoundingClientRect().width),
    screen: !!c.querySelector('.c-screen'),
    bsRows: c.querySelectorAll('.c-bs > div').length,
    tag: (c.querySelector('.c-tag') || {}).textContent,
    num: !!c.querySelector('.c-num')
  }));
  return JSON.stringify({
    exists: !!t,
    scrollLeft: t ? Math.round(t.scrollLeft) : null,
    scrollW: t ? t.scrollWidth : null,
    clientW: t ? t.clientWidth : null,
    cards: cards.length,
    heights: [...new Set(shapes.map(s => s.h))],
    widths: [...new Set(shapes.map(s => s.w))],
    allHaveScreen: shapes.every(s => s.screen),
    allBs: shapes.every(s => s.bsRows === 2),
    allNum: shapes.every(s => s.num),
    docOverflow: document.documentElement.scrollWidth - window.innerWidth,
    quotes: document.querySelectorAll('.cq').length,
    nav: document.querySelectorAll('.cases-btn').length
  });
})()`;

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dstc-'));
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
  const evalJs = async expr => JSON.parse((await send('Runtime.evaluate',{expression:expr,returnByValue:true})).result.value);

  await send('Page.enable');
  for (const [page, width] of [['index.html',1440],['index.html',390],['proof.html',1440],['proof.html',390]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate',{url:'file:///'+path.join(REPO,page).replace(/\\/g,'/')});
    await Promise.race([loaded, sleep(9000)]); await sleep(1200);
    // прокрутить страницу до дорожки, чтобы она была в кадре
    await send('Runtime.evaluate',{expression:`document.querySelector('#cases') && document.querySelector('#cases').scrollIntoView({block:'center'})`});
    await sleep(400);
    const a = await evalJs(READ);
    await sleep(2600);
    const b = await evalJs(READ);
    const moved = (b.scrollLeft - a.scrollLeft);
    console.log(`\n── ${page} @${width}`);
    console.log(`   дорожка: ${a.exists ? 'есть' : 'НЕТ'} | карточек: ${a.cards} | цитат: ${a.quotes} | стрелок: ${a.nav}`);
    console.log(`   высоты карточек: ${a.heights.join(', ')} px | ширины: ${a.widths.join(', ')}`);
    console.log(`   один формат: экран ${a.allHaveScreen ? '✓' : '✗'} | было/стало ${a.allBs ? '✓' : '✗'} | цифра ${a.allNum ? '✓' : '✗'}`);
    console.log(`   авто-прокрутка за 2.6с: ${moved} px  ${moved > 20 ? '✓ ЕДЕТ' : (moved > 0 ? '~ медленно' : '✗ стоит')}`);
    console.log(`   переполнение страницы: ${a.docOverflow} px`);
    if (width === 390 && page === 'index.html') {
      // гашение при наведении
      await send('Runtime.evaluate',{expression:`document.querySelector('.cases-track').dispatchEvent(new Event('pointerenter'))`});
      await sleep(1500);
      const c = await evalJs(READ);
      console.log(`   после касания/наведения: сдвиг ${c.scrollLeft - b.scrollLeft} px ${(c.scrollLeft - b.scrollLeft) <= 1 ? '✓ погасла' : '✗ всё ещё едет'}`);
    }
  }
  try{ await send('Browser.close'); }catch(e){}
  ch.kill();
}
main().catch(e=>{console.error('FAIL',e);process.exit(1);});
