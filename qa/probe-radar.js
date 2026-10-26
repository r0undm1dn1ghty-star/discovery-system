// qa/probe-radar.js — что реально рендерится в консоли героя на вкладке «Радар ниши»
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9370; const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsrad-'));
  const ch = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',
    '--remote-debugging-port=' + PORT,'--user-data-dir=' + tmp,'about:blank'], { stdio: 'ignore' });
  let t=null; for (let i=0;i<40&&!t;i++){ await sleep(250);
    try{ const r=await fetch('http://127.0.0.1:'+PORT+'/json/list'); t=(await r.json()).find(x=>x.type==='page'); }catch(e){} }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.addEventListener('open',res);ws.addEventListener('error',rej);});
  let id=0; const pending=new Map(); const waiters=[];
  const logs=[];
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);
    if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}
    else if(m.method==='Runtime.consoleAPICalled'){logs.push((m.params.args||[]).map(a=>a.value).join(' '));}
    else if(m.method==='Runtime.exceptionThrown'){logs.push('EXCEPTION: '+(m.params.exceptionDetails&&m.params.exceptionDetails.text));}
    else if(m.method) waiters.filter(w=>w.method===m.method).forEach(w=>w.fire());});
  const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
  const once=m=>new Promise(res=>{const w={method:m,fire:()=>{waiters.splice(waiters.indexOf(w),1);res();}};waiters.push(w);});
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate',{url:'file:///'+path.join(REPO,'index.html').replace(/\\/g,'/')});
  await Promise.race([loaded, sleep(9000)]); await sleep(1500);

  // клик по вкладке «Радар ниши»
  await send('Runtime.evaluate',{expression:`document.getElementById('tab-radar').click()`});
  await sleep(300);
  // снимаем состояние через 1с, 4с, 9с, 15с
  for (const T of [1000, 4000, 9000, 15000]) {
    await sleep(T === 1000 ? 1000 : 3000);
    const r = await send('Runtime.evaluate',{returnByValue:true, expression:`(() => {
      const body = document.getElementById('stream');
      const kids = [...body.children].map(c => ({cls: c.className, txt: (c.textContent||'').trim().slice(0,70)}));
      return JSON.stringify({
        t: ${T},
        state: window.__dsHero ? {asm: window.__dsHero.asm, lines: window.__dsHero.lines, total: window.__dsHero.total, running: window.__dsHero.running, timers: window.__dsHero.timers} : null,
        children: kids.length,
        kinds: kids.map(k => k.cls),
        scrollH: body.scrollHeight, clientH: body.clientHeight,
        last: kids.slice(-3)
      });
    })()`});
    const d = JSON.parse(r.result.value);
    console.log(`\n── через ${T}мс: детей ${d.children}, state=${JSON.stringify(d.state)}`);
    console.log(`   виды: ${d.kinds.join(', ')}`);
    console.log(`   скролл ${d.scrollH} / видимая ${d.clientH}`);
    console.log(`   последние: ${d.last.map(x => x.cls + ' → ' + x.txt).join(' | ')}`);
  }
  console.log('\nлоги консоли:', logs.length ? logs.slice(0,6) : 'чисто');
  try{ await send('Browser.close'); }catch(e){}
  ch.kill();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
