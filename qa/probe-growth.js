// Зонд: как растёт цена при добавлении функций (не входит в QA-харнесс)
const fs=require('fs'), vm=require('vm');
const js=fs.readFileSync(__dirname+'/engine.js','utf8');
const elCache=new Map();
const elStub=(id)=>{if(id&&elCache.has(id))return elCache.get(id);
  const el={id,style:{},classList:{add(){},remove(){},toggle(){}},textContent:'',innerHTML:'',
    addEventListener(){},appendChild(){},setAttribute(){},value:'400',children:[]};
  if(id)elCache.set(id,el);return el;};
const sandbox={console,
  document:{getElementById:(id)=>elStub(id),querySelector:()=>null,querySelectorAll:()=>[],
    addEventListener(){},createElement:()=>elStub(),body:elStub('body')},
  window:{matchMedia:()=>({matches:false}),open:()=>{}},
  sessionStorage:{getItem:()=>null,setItem(){}},localStorage:{getItem:()=>null,setItem(){}},
  performance:{now:()=>Date.now()},requestAnimationFrame(){},setTimeout(){},
  URLSearchParams:class{get(){return null}},location:{search:''},navigator:{userAgent:'qa'}};
vm.createContext(sandbox);
const shim=`;globalThis.__qa={L:{GOALS,MODELS},estimate,
  set(o){start='nothing';device=o.device||'cpu';autonomy=o.autonomy||'review';
    data=o.data||'local';pay='rucard';budget=o.budget||'b';
    goals=o.goals||[];tasks=[];conns=o.conns||[];}};`;
vm.runInContext(js+shim,sandbox,{filename:'engine.js'});
const Q=sandbox.__qa;

const ALL=Q.L.GOALS.filter(g=>g.id!=='unsure').map(g=>g.id);
function probe(device,data,label){
  console.log('\n=== '+label+' (device='+device+', data='+data+') ===');
  console.log('функций | model | hosting | итого | ₽ за функцию');
  for(let n=1;n<=ALL.length;n++){
    Q.set({device,data,goals:ALL.slice(0,n)});
    const e=Q.estimate();
    if(!e){console.log(n+' | нет расчёта');continue;}
    console.log(String(n).padStart(7)+' | '+String(e.modelCost).padStart(5)+' | '+
      String(e.hostCost).padStart(7)+' | '+String(e.monthly).padStart(5)+' | '+
      (e.monthly/n).toFixed(0));
  }
}
probe('cpu','local','Облако-API, данные локально');
probe('host','cloud','Аренда сервера');
probe('vps','ru','Свой РФ-VPS + TG-шлюз (conns не заданы — шлюза нет)');
Q.set({device:'vps',data:'ru',goals:ALL.slice(0,3),conns:['tg']});
const g=Q.estimate();
console.log('\nСвой VPS + Telegram: hosting='+g.hostCost+' (ожидаем +шлюз), итого='+g.monthly);
