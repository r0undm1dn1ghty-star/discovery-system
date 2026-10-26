// qa/probe-radar-mobile.js — радар на 390px: переполнение, скорость, полная видимость файла в момент появления
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9371; const REPO = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsradm-'));
  const ch = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',
    '--remote-debugging-port='+PORT,'--user-data-dir='+tmp,'about:blank'], {stdio:'ignore'});
  let t=null; for(let i=0;i<40&&!t;i++){await sleep(250);
    try{const r=await fetch('http://127.0.0.1:'+PORT+'/json/list'); t=(await r.json()).find(x=>x.type==='page');}catch(e){}}
  const ws=new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.addEventListener('open',res);ws.addEventListener('error',rej);});
  let id=0; const pending=new Map(); const waiters=[];
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);
    if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}
    else if(m.method) waiters.filter(w=>w.method===m.method).forEach(w=>w.fire());});
  const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
  const once=m=>new Promise(res=>{const w={method:m,fire:()=>{waiters.splice(waiters.indexOf(w),1);res();}};waiters.push(w);});
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  const loaded=once('Page.loadEventFired');
  await send('Page.navigate',{url:'file:///'+path.join(REPO,'index.html').replace(/\\/g,'/')});
  await Promise.race([loaded,sleep(9000)]); await sleep(1200);
  // ставим наблюдатель: фиксируем, был ли блок файла полностью в кадре в момент появления
  await send('Runtime.evaluate',{expression:`window.__probe={files:[],done:0}; (function(){
    var st=document.getElementById('stream');
    new MutationObserver(function(){
      st.querySelectorAll('.l-file').forEach(function(el){
        if(el.__seen) return; el.__seen=1; setTimeout(function(){var sr2=st.getBoundingClientRect(),er2=el.getBoundingClientRect();var i=window.__probe.files.length-1;if(window.__probe.files[i]){window.__probe.files[i].after=Math.round(Math.min(er2.bottom,sr2.bottom)-Math.max(er2.top,sr2.top));window.__probe.files[i].fullAfter=er2.top>=sr2.top-1&&er2.bottom<=sr2.bottom+1;}},600);
        var sr=st.getBoundingClientRect(), er=el.getBoundingClientRect();
        window.__probe.files.push({full: er.top>=sr.top-1 && er.bottom<=sr.bottom+1, h:Math.round(er.height), vis:Math.round(Math.min(er.bottom,sr.bottom)-Math.max(er.top,sr.top))});
      });
    }).observe(st,{childList:true});
  })();`});
  await send('Runtime.evaluate',{expression:`document.getElementById('tab-radar').click()`});
  await sleep(9000);
  const r = await send('Runtime.evaluate',{returnByValue:true, expression:`(() => {
    var st=document.getElementById('stream');
    return JSON.stringify({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyH: st.clientHeight, contentH: st.scrollHeight,
      lines: window.__dsHero.lines, total: window.__dsHero.total, running: window.__dsHero.running,
      files: window.__probe.files
    });
  })()`});
  console.log(r.result.value);
  try{await send('Browser.close');}catch(e){}
  ch.kill();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
