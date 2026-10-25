
/* ========== SVG ICONS ========== */
const ICONS={
  laptop:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>',
  gpu:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>',
  server:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
  rocket:'<svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8-.8-.7-2-.7-3 0z"/><path d="M12 15l-3-3c1-4 4-8 9-9 0 5-4 8-9 9z"/><path d="M9 12H4s.5-3 2-4.5C8 6 12 6 12 6"/><path d="M12 15v5s3-.5 4.5-2c1.5-1.5 1.5-5.5 1.5-5.5"/></svg>',
  money:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.5-1-1.7-1.5-3-1.5-1.4 0-2.5.7-2.5 1.8 0 2.7 5.5 1.3 5.5 4 0 1.2-1.2 1.9-2.7 1.9-1.4 0-2.6-.6-3-1.7"/></svg>',
  pen:'<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  brain:'<svg viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.6A2.5 2.5 0 0 0 4.5 7.5c0 .5.15 1 .4 1.4A2.5 2.5 0 0 0 5 13.5 2.5 2.5 0 0 0 7 18v1.5A2.5 2.5 0 0 0 9.5 22c.9 0 1.7-.5 2.1-1.2.4.7 1.2 1.2 2.1 1.2a2.5 2.5 0 0 0 2.5-2.5V18a2.5 2.5 0 0 0 2-4.5c.25-.4.4-.9.4-1.4a2.5 2.5 0 0 0-2.9-2.5v-.6A2.5 2.5 0 0 0 13 2c-.9 0-1.7.5-2.1 1.2A2.5 2.5 0 0 0 9.5 2z"/></svg>',
  bot:'<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M8 13h.01M16 13h.01M9 17c1-1 5-1 6 0"/></svg>',
  chart:'<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  doc:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
  globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
  megaphone:'<svg viewBox="0 0 24 24"><path d="M3 11l18-7v16L3 13v-2z"/><path d="M11 6v13"/></svg>',
  phone2:'<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  cart:'<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  video:'<svg viewBox="0 0 24 24"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  shield:'<svg viewBox="0 0 24 24"><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z"/></svg>',
  card:'<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  cloud:'<svg viewBox="0 0 24 24"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 7 19h10.5z"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  zap:'<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  refresh:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></svg>',
  wallet:'<svg viewBox="0 0 24 24"><path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2"/><path d="M21 12a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2z"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  users:'<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  sparkles:'<svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>'
};
function ic(name){return '<div class="ic">'+(ICONS[name]||ICONS.bot)+'</div>';}

/* ========== ДАННЫЕ ========== */
/* ====== СТАРТОВОЕ СОСТОЯНИЕ (5 сценариев по ДКЦП) ======
   Откуда человек приходит считать — это база сравнения экономики.
   base — что он уже платит в месяц за эту работу (0 = ничего).
   cost — разовый чек продукта-входа (для окупаемости).
   product — какой продукт рекомендовать. */
const STARTS=[
  {id:'nothing', t:'Ничего нет — начинаю с нуля', d:'сейчас за ИИ не плачу', short:'с нуля', base:0, cost:5000, ic:'sparkles', product:'build'},
  {id:'sub', t:'Плачу за подписку', d:'ChatGPT, бот-сервис или подобное', short:'платишь за подписку', base:2000, cost:7000, ic:'card', product:'install'},
  {id:'legacy', t:'Связка есть — дорогая или тормозит', d:'уже собрал, но жрёт токены или время', short:'связка уже есть', base:3500, cost:20000, ic:'gear', product:'optimization'},
  {id:'hardware', t:'Есть железо — простаивает', d:'GPU или сервер, платишь за облако', short:'железо уже есть', base:1400, cost:3000, ic:'gpu', product:'table'},
  {id:'people', t:'Плачу людям за рутину', d:'фрилансер, ассистент, сотрудник', short:'платишь людям', base:40000, cost:5000, ic:'users', product:'build'}
];
/* Подача под стартовое состояние. Экономика одна — меняется база и что показываем. */
const SCENARIO={
  nothing:{tag:'С нуля', title:'Твой агент — <em>с нуля</em>',
    note:'Считаешь от нуля: во владении только модель, хостинг и подключения. Всё, что освобождает агент, — чистая экономия времени.'},
  sub:{tag:'Уход с подписки', title:'Ты <em>уходишь с подписки</em>',
    note:'Сравниваем с тем, что платишь сейчас. Своя связка на РФ-провайдерах — это не только дешевле, но и то, что нельзя отключить: аккаунт и данные твои.'},
  legacy:{tag:'Оптимизация связки', title:'Твоя связка — <em>дешевле и чище</em>',
    note:'Не пересобираем с нуля: смотрим, где утекают токены и время, и убираем утечку. Замер «до/после» — до работ.'},
  hardware:{tag:'Своё железо', title:'Твоё железо — <em>в дело</em>',
    note:'Железо уже куплено — маржинальная стоимость связки почти ноль. Собираешь сам по проверенной схеме, поддержка не навязывается.'},
  people:{tag:'Рутина без людей', title:'Рутина — <em>без людей</em>',
    note:'Сравниваем с тем, что платишь человеку. Агент не болеет и не уходит: фикс-цена запуска и владение вместо зарплаты каждый месяц.'}
};
const DEVICES=[
  {id:'cpu',t:'Ноутбук / ПК без видеокарты',d:'CPU-only · облако',ic:'laptop'},
  {id:'gpu8',t:'Видеокарта 4–8 GB',d:'слабая · только мелкие модели',ic:'gpu'},
  {id:'gpu12',t:'Видеокарта 12–16 GB',d:'ComfyUI · модели до ~14B',ic:'gpu'},
  {id:'gpu24',t:'Видеокарта 24 GB+',d:'RTX 4090 · большие локальные',ic:'gpu'},
  {id:'vps',t:'Свой сервер / VPS (РФ)',d:'постоянный сервер',ic:'server'},
  {id:'host',t:'Облачный сервер (не у меня)',d:'хостинг провайдера',ic:'cloud'},
  {id:'phone',t:'Только телефон',d:'облако через API',ic:'phone'}
];
const GOALS=[
  {id:'repeat',t:'Отвечаю на одни и те же вопросы',sn:'Ответы на частые вопросы',d:'клиенты, заявки, переписка',econ:16,ic:'bot'},
  {id:'leads',t:'Разгребаю заявки, пока не остыли',sn:'Разбор и квалификация заявок',d:'отклики, лиды, воронка',econ:14,ic:'search'},
  {id:'report',t:'Каждую неделю собираю один и тот же отчёт',sn:'Регулярный отчёт',d:'выгрузки, сверки, таблицы',econ:14,ic:'doc'},
  {id:'scan',t:'Ищу и проверяю информацию по кускам',sn:'Сбор и проверка информации',d:'сайты, сравнение, выжимки',econ:10,ic:'globe'},
  {id:'write',t:'Пишу тексты с нуля каждый раз',sn:'Конвейер текстов',d:'посты, реклама, план',econ:18,ic:'pen'},
  {id:'paper',t:'Разбираю документы и выписки',sn:'Разбор документов',d:'сверки, письма, классификация',econ:12,ic:'chart'},
  {id:'unsure',t:'Пока не могу назвать — надо разобраться',sn:'Диагностика процесса',d:'опиши день, найдём повторяющееся',econ:10,ic:'sparkles'}
];
const TASKS=[
  {id:'text',label:'Тексты и посты',d:'план, редактура, реклама',econ:8,base:'qwen',ic:'pen'},
  {id:'design',label:'Дизайн и картинки',d:'брифы, генерация',econ:9,base:'multimodal',ic:'gpu'},
  {id:'docs',label:'Документы и отчёты',d:'сверки, письма',econ:12,base:'deepseek',ic:'doc'},
  {id:'data',label:'Данные и аналитика',d:'выгрузки, сводки',econ:10,base:'deepseek',ic:'chart'},
  {id:'web',label:'Браузер / интернет',d:'сбор с сайтов, проверка',econ:8,base:'qwen',ic:'globe'},
  {id:'social',label:'Соцсети и публикации',d:'каналы, сторис',econ:9,base:'qwen',ic:'megaphone'},
  {id:'sales',label:'Продажи и звонки',d:'скрипты, разбор звонков',econ:12,base:'deepseek',ic:'phone2'},
  {id:'research',label:'Исследования и резюме',d:'сбор, структура, выводы',econ:8,base:'qwen',ic:'search'}
];
const AUTONOMY=[
  {id:'draft',t:'Черновики и идеи',d:'агент готовит, я проверяю',mult:1,label:'Низкая',ic:'pen'},
  {id:'review',t:'Готовит + проверка',d:'я утверждаю перед отправкой',mult:1.25,label:'Средняя',ic:'eye'},
  {id:'auto',t:'Работает сам',d:'делает и отправляет',mult:1.6,label:'Высокая',ic:'gear'},
  {id:'full',t:'Автономный процесс',d:'сам ведёт и отчитывается',mult:2.0,label:'Полная',ic:'brain'}
];
const CONNS=[
  {id:'tg',label:'Telegram',d:'общение, уведомления',cost:0,ic:'bot',grp:'Общение'},
  {id:'bot',label:'Чат-бот для аудитории',d:'отвечает 24/7',cost:450,ic:'bot',grp:'Общение'},
  {id:'wa',label:'WhatsApp',d:'клиенты через Wazzup/TextBack',cost:5000,ic:'bot',grp:'Общение'},
  {id:'pub',label:'Публикация постов',d:'соцсети, канал',cost:400,ic:'megaphone',grp:'Общение'},
  {id:'crm',label:'CRM и рассылки',d:'клиенты, воронки',cost:550,ic:'users',grp:'Клиенты'},
  {id:'avito',label:'Авито-переписка',d:'нужен тариф Авито',cost:5000,ic:'search',grp:'Клиенты'},
  {id:'analytics',label:'Аналитика',d:'метрики, отчёты',cost:400,ic:'chart',grp:'Клиенты'},
  {id:'sheets',label:'Таблицы и документы',d:'Sheets, Notion',cost:250,ic:'doc',grp:'Данные'},
  {id:'obs',label:'Заметки и база знаний',d:'Obsidian',cost:0,ic:'book',grp:'Данные'},
  {id:'mem',label:'Память между проектами',d:'помнит контекст',cost:150,ic:'brain',grp:'Данные'}
];
const DATA=[
  {id:'local',t:'Локально — на моём устройстве',d:'полный контроль, никуда не уходит',ic:'lock'},
  {id:'cloud',t:'В облаке — не у меня',d:'доступ откуда угодно, хостинг +цена',ic:'cloud'},
  {id:'ru',t:'На РФ-сервере',d:'данные в России · для Telegram-бота нужен шлюз (+300₽/мес)',ic:'shield'},
  {id:'hybrid',t:'Гибрид — чувствительное локально',d:'контроль + скорость',ic:'refresh'}
];
const PAY=[
  {id:'rucard',t:'Карта РФ / СБП',d:'оплата рублями, без VPN',ic:'card'},
  {id:'crypto',t:'Крипта',d:'USDT и другие',ic:'wallet'},
  {id:'proxy',t:'Через посредников',d:'виртуальные карты, сервисы',ic:'refresh'}
];
const BUDGETS=[
  {id:'b3',label:'до 3 000 ₽/мес',max:3000},
  {id:'b6',label:'до 6 000 ₽/мес',max:6000},
  {id:'b',label:'сколько нужно',max:Infinity}
];
const MODELS={ /* подписи — нейтральные классы, без вендоров: тариф считается в estimate() по реальным ставкам */
  qwen:{cost:260,name:'Базовая модель (Lite-класс)',cat:'Облако',dets:['Простые ответы, классификация, FAQ','Тариф считается по объёму токенов','Без VPN, рубли']},
  deepseek:{cost:500,name:'Усиленная модель (Pro-класс)',cat:'Облако',dets:['Сложные ответы, документы, расчёты','Дороже базовой в 5–8 раз за токен','Без VPN, рубли']},
  multimodal:{cost:285,name:'Мультимодальная (Pro-класс)',cat:'Облако',dets:['Картинки, брифы, распознавание','Оплата за изображение отдельно','Без VPN, рубли']},
  open:{cost:150,name:'Эконом-класс (старт)',cat:'Облако',dets:['Дешёвый вход для пилота','Ниже качество на сложном','Апгрейд в один клик']},
  local:{cost:0,name:'Локальная модель (твоё железо)',cat:'Локально',dets:['Провайдеру не платишь','Настройка ~20–40 ч или сборкой 7 000 ₽','Данные никуда не уходят']},
  hybrid:{cost:400,name:'Гибрид: локально + API',cat:'Гибрид',dets:['Черновики локально','Сложное — через API','Безопасный контур']}
};

/* ====== STATE ====== */
let start=null,device='cpu',goal=null,goals=[],tasks=[],autonomy='review',conns=[],data='cloud',pay='rucard',budget=null;
let _mc=null; try{_mc=JSON.parse(sessionStorage.getItem('ds_mc')||'null');}catch(e){}
let _mcScenario=null; try{_mcScenario=sessionStorage.getItem('ds_mc_scenario');}catch(e){}
let step=1; const N=3;

/* ========== RENDER ========== */
function renderBridge(){ const m=mcHint(); const el=document.getElementById('mcBridge'); if(!m||!el) return; const s=sessionStorage.getItem('ds_mc_scenario')||''; const label=s?(' · сценарий: '+s.toUpperCase()):''; el.textContent='с главной: '+Math.round(m.handsHours)+' ч руками → '+Math.round(m.agentHours)+' ч с агентом · экономия '+Math.round(m.saveHours)+' ч/мес'+label; el.style.display='block';
  // если много часов — подсказываем стек: высокая автономность выгоднее
  if(m.saveHours>60){ /* hint for autonomy selection */ }
}
const STEP_NAMES=['Откуда','Рутина','Задачи'];
function renderSteps(){
  var h='';
  for(var i=1;i<=N;i++){
    h+='<button class="stepname '+(i===step?'cur':'')+(i<step?' done':'')+'" onclick="go('+(i-step)+')"><span class="sn">'+i+'</span>'+STEP_NAMES[i-1]+'</button>';
  }
  document.getElementById('steps').innerHTML=h;
}
function renderCards(){
  var so=document.getElementById('startOpts');
  if(so)so.innerHTML=STARTS.map(s=>`<div class="opt ${start===s.id?'selected':''}" onclick="start='${s.id}';pickOption();">${ic(s.ic)}<div class="body"><div class="t">${s.t}</div><div class="d">${s.d}</div></div></div>`).join('');
  const showUnsure=goals.length===0||goals.includes('unsure');
  document.getElementById('goalOpts').innerHTML=GOALS.filter(g=>g.id!=='unsure'||showUnsure).map(g=>`<div class="opt ${goals.includes(g.id)?'selected':''}" onclick="toggleGoal('${g.id}')">${ic(g.ic)}<div class="body"><div class="t">${g.t}</div><div class="d">${g.d}</div><div class="tag">до ${days(g.econ)}</div></div></div>`).join('');
  document.getElementById('taskOpts').innerHTML=TASKS.map(t=>`<div class="task ${tasks.includes(t.id)?'selected':''}" onclick="toggleTask('${t.id}')">${ic(t.ic)}<div class="body"><div class="t">${t.label}</div><div class="d">${t.d}</div><div class="econ">до ${days(t.econ)}</div></div></div>`).join('');
  document.getElementById('budgetOpts').innerHTML=BUDGETS.map(b=>`<div class="pill ${budget===b.id?'selected':''}" onclick="budget='${b.id}';pickOption();">${b.label}</div>`).join('');
  a11y();
}
/* Пресеты задач: один клик вместо 8 отметок */
const TASK_PRESETS=[
  {id:'content',label:'Контент-конвейер',tasks:['text','social','design']},
  {id:'sales',label:'Заявки и продажи',tasks:['sales','data','docs']},
  {id:'research',label:'Исследования',tasks:['research','web','docs']}
];
function renderPresets(){
  var el=document.getElementById('taskPresets'); if(!el)return;
  el.innerHTML=TASK_PRESETS.map(p=>{
    var on=p.tasks.every(t=>tasks.includes(t))&&tasks.length===p.tasks.length;
    return '<button type="button" class="'+(on?'on':'')+'" onclick="applyPreset(\''+p.id+'\')">'+p.label+'</button>';
  }).join('');
}
function applyPreset(id){
  var p=TASK_PRESETS.find(x=>x.id===id); if(!p)return;
  var same=p.tasks.every(t=>tasks.includes(t))&&tasks.length===p.tasks.length;
  tasks=same?[]:p.tasks.slice();
  renderCards(); renderPresets(); updateLive(); stepRender();
}
/* Конфигуратор в результате: цена меняется на глазах */
function renderConfig(){
  var seg=document.getElementById('autoSeg');
  if(seg)seg.innerHTML=AUTONOMY.map(a=>'<button type="button" class="'+(autonomy===a.id?'on':'')+'" onclick="setAuto(\''+a.id+'\')">'+a.label+'</button>').join('');
  var ch=document.getElementById('connChips');
  if(ch){
    var groups={};
    CONNS.forEach(c=>{(groups[c.grp]=groups[c.grp]||[]).push(c);});
    ch.innerHTML=Object.keys(groups).map(g=>'<div class="chip-grp"><div class="chip-grp-t">'+g+'</div><div class="chip-grp-b">'+
      groups[g].map(c=>'<button type="button" class="'+(conns.includes(c.id)?'on':'')+'" onclick="toggleConn(\''+c.id+'\')">'+c.label+(c.cost?' · +'+c.cost+'₽':'')+'</button>').join('')+
      '</div></div>').join('');
  }
  var de=document.getElementById('deviceOpts');
  if(de)de.innerHTML=DEVICES.map(d=>`<div class="opt ${device===d.id?'selected':''}" onclick="device='${d.id}';cfgChange();">${ic(d.ic)}<div class="body"><div class="t">${d.t}</div><div class="d">${d.d}</div></div></div>`).join('');
  var da=document.getElementById('dataOpts');
  if(da)da.innerHTML=DATA.map(d=>`<div class="opt ${data===d.id?'selected':''}" onclick="data='${d.id}';cfgChange();">${ic(d.ic)}<div class="body"><div class="t">${d.t}</div><div class="d">${d.d}</div></div></div>`).join('');
  var pa=document.getElementById('payOpts');
  if(pa)pa.innerHTML=PAY.map(p=>`<div class="opt ${pay===p.id?'selected':''}" onclick="pay='${p.id}';cfgChange();">${ic(p.ic)}<div class="body"><div class="t">${p.t}</div><div class="d">${p.d}</div></div></div>`).join('');
  a11y();
}
function setAuto(id){autonomy=id;cfgChange();}
/* Конфигуратор: перерисовываем только его + цену (шаги скрыты — renderCards/stepRender не нужны) */
function cfgChange(){renderConfig();updateLive();if(document.getElementById('result').classList.contains('show'))calculate();}

/* Доступность: кликабельные div становятся фокусируемыми и работают с клавиатуры */
function a11y(){
  document.querySelectorAll('[onclick]').forEach(el=>{
    if(el.tagName==='BUTTON'||el.tagName==='A')return;
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role'))el.setAttribute('role','button');
  });
}
document.addEventListener('keydown',function(ev){
  if(ev.key!=='Enter'&&ev.key!==' '&&ev.key!=='Spacebar')return;
  var el=ev.target;
  if(el&&el.getAttribute&&el.hasAttribute&&el.hasAttribute('onclick')&&el.tagName!=='BUTTON'&&el.tagName!=='A'){
    ev.preventDefault(); el.click();
  }
});
function toggleTask(id){tasks=tasks.includes(id)?tasks.filter(x=>x!==id):[...tasks,id];renderCards();updateLive();stepRender();renderBridge();}
function toggleGoal(id){
  if(id==='unsure'){goals=goals.includes(id)?[]:['unsure'];goal=goals[0]||null;renderCards();updateLive();stepRender();updateGoalMeta();return;}
  goals=goals.filter(x=>x!=='unsure');
  if(goals.includes(id)){goals=goals.filter(x=>x!==id);}
  else{goals.push(id);}
  goal=goals[0]||null;
  renderCards();updateLive();stepRender();updateGoalMeta();
}
function startBase(){ const s=STARTS.find(x=>x.id===start); return s?s.base:0; }
function segProfile(){
  // профиль по выбору шага 01: unsure -> новичок; иначе владелец-оператор
  return goals.includes('unsure') ? 'newbie' : 'owner';
}
/* ====== ПЕРСОНА (по AJTBD: работа, а не отрасль) ======
   P1 «Отрезанный»  — хочет свой контур, который не отключат: локально, свой сервер
   P2 «Делегатор»   — хочет, чтобы рутина делалась без него: высокая автономность
   P3 «Скептик»     — хочет понять, окупится ли, до оплаты: не может назвать / считает
   P4 «Строитель»   — хочет собрать сам: есть GPU/железо, выбирает гайд
   Определяется по ответам, не по демографии. */
function persona(){
  /* Персона выводится из того, что человек реально выбрал в шагах 01–04,
     а не только из шага 06 («продвинутые», его большинство пропускает).
     Иначе P1/P4 были недостижимы и персонализация умирала. */
  /* Стартовое состояние — самый сильный сигнал: он называет боль прямо. */
  if(start==='hardware') return 'P4';                       // есть железо → собирает сам
  if(start==='sub')      return 'P1';                       // платит за подписку → свой контур
  if(start==='people')   return 'P2';                       // платит людям → результат под ключ
  if(start==='legacy')   return 'P3';                       // связка есть → считает и чинит
  if(goals.includes('unsure')) return 'P3';                 // пришёл разобраться, не знает процесс
  const highAuto=(autonomy==='auto'||autonomy==='full');
  const lowAuto=(autonomy==='draft');
  const ownGPU=(device==='gpu8'||device==='gpu12'||device==='gpu24'); // своё железо
  const wantsOwn=(data==='local'||data==='ru'||device==='vps');       // контур у него, не отключат
  if(ownGPU&&!highAuto) return 'P4';                        // есть GPU, собирает сам → гайд
  if(highAuto) return 'P2';                                 // хочет, чтобы работало без него
  if(wantsOwn) return 'P1';                                 // хочет свой контур (локально/VPS)
  if(lowAuto) return 'P4';                                  // сам делает черновики → гайд
  return 'P3';                                              // по умолчанию — считающий
}
/* ====== РЕКОМЕНДАЦИЯ ПРОДУКТА ПО СЕГМЕНТУ ======
   Раньше бралось pc.best из персоны: «хочет результат» → сборка 7К.
   Из-за этого ИП с командой и CRM получал сборку вместо внедрения 30К.
   Теперь смотрим на масштаб: сервер/команда/интеграции → внедрение. */
function teamScale(){
  return (device==='vps'||device==='host')
    || conns.includes('crm') || conns.includes('avito')
    || goals.filter(g=>g!=='unsure').length>=3;
}
function recommendProduct(){
  if(start==='legacy') return 'optimization';       // связка есть и сломана — чинить, не строить
  if(start==='hardware') return 'table';            // железо есть — собирает сам
  if(start==='people') return teamScale()?'install':'build';
  if(start==='sub') return teamScale()?'install':'build';
  if(budget==='b3') return 'table';                 // денег мало — входной продукт
  return teamScale()?'install':'build';
}
function recWhy(key){
  if(key==='optimization') return 'У тебя уже есть связка, и она мешает. Сначала аудит: где утекают токены и время, потом пересборка. Новое строить не надо.';
  if(key==='table') return 'Тебе дешевле собрать самому: 20 готовых конфигураций с промптами и ценами запуска. 3–4 часа — и агент работает.';
  if(key==='install') return 'У тебя не один процесс и не один человек. Нужна связка на сервере с ролями и интеграциями — её ставим под ключ, с приёмкой по чек-листу.';
  return 'Один-два процесса, один человек. Персональная сборка 7 000 ₽: разберу твой случай, дам готовую конфигурацию и инструкцию.';
}
/* Рекомендованный оффер — первым, остальные свёрнуты: пять карточек на выбор = перегруз */
function arrangeOffers(recKey){
  const box=document.getElementById('offerBox'); if(!box) return;
  const why=document.getElementById('personaWhy');
  const opts=[...box.querySelectorAll('.offer-opt[data-prod]')];
  let more=box.querySelector('#offerMore');
  if(!more){
    more=document.createElement('details');
    more.id='offerMore';
    more.innerHTML='<summary class="offer-more-sum">Другие варианты, если это не то</summary>';
    box.appendChild(more);
  }
  opts.forEach(el=>{
    const isRec=el.getAttribute('data-prod')===recKey;
    el.classList.toggle('recommended',isRec);
    const badge=el.querySelector('.rec-badge');
    if(isRec&&!badge){
      const sp=document.createElement('span'); sp.className='rec-badge'; sp.textContent='тебе сюда';
      (el.querySelector('.o-top')||el).appendChild(sp);
    }
    if(!isRec&&badge) badge.remove();
    if(isRec){ (why&&why.parentNode===box) ? box.insertBefore(el,why.nextSibling) : box.insertBefore(el,box.firstChild); }
    else more.appendChild(el);
  });
  /* внутри «внедрения» тоже была развилка 15/20/30 — поднимаем нужный масштаб первым */
  if(recKey==='install'){
    const inst=box.querySelector('.offer-opt[data-prod="install"]');
    const btns=[...inst.querySelectorAll('button[data-tier]')];
    const tier = (conns.includes('crm')||conns.includes('avito')||goals.filter(g=>g!=='unsure').length>=3) ? 'integ'
               : (device==='vps'||device==='host') ? 'vps' : 'pc';
    const pick=btns.find(b=>b.getAttribute('data-tier')===tier);
    if(pick){
      btns.forEach(b=>{b.classList.remove('tier-primary');b.style.marginTop='8px';});
      pick.classList.add('tier-primary');
      pick.style.marginTop='0';
      /* физически первым: order не сработает, контейнер не flex */
      const firstBtn=btns[0];
      if(pick!==firstBtn) inst.insertBefore(pick,firstBtn);
      if(!inst.querySelector('.tier-hint')){
        const h=document.createElement('p'); h.className='tier-hint';
        h.textContent='Твой масштаб — остальные варианты ниже';
        pick.parentNode.insertBefore(h,pick);
      }
    }
  }
}

const PERSONA_COPY={  P1:{tag:'Твой путь — свой контур',
      title:'Агент, который <em>нельзя отключить</em>',
      desc:'Данные и агент — на твоём железе. Никто не может закрыть аккаунт и отобрать доступ: это не обещание, а архитектура. Оплата рублями, без VPN.',
      spec:['Агент и данные физически у тебя','Оплата картой РФ / СБП','Работает без VPN'],
      best:'install',why:'Тебе важнее всего, чтобы контур был твой. Внедрение на своё устройство (15 000 ₽) — данные остаются на диске; для бизнеса (30 000 ₽) — если нужны CRM и заявки.'},
  P2:{tag:'Твой путь — результат под ключ',
      title:'Связка, которая <em>работает без тебя</em>',
      desc:'Ты покупаешь результат, а не инструмент. Соберу под твой процесс и отдам работающим — правки до приёмки, тебе не нужно быть техзаказчиком.',
      spec:['Сборка и настройка — на мне','Правки до приёмки','Не нужно разбираться в стеке'],
      best:'build',why:'Ты хочешь результат, а не возню. Персональная сборка 7 000 ₽ — соберу под твою рутину, дальше можно поставить под ключ.'},
  P3:{tag:'Твой путь — расчёт и доказательства',
      title:'Считай, <em>прежде чем платить</em>',
      desc:'Ниже — часы и деньги до старта. Если цифра не сойдётся — честно скажу «не надо». Решение на доказательствах, а не на обещаниях.',
      spec:['Расчёт до оплаты','Честный вердикт — можно и «не надо»','Границы данных названы'],
      best:'build',why:'Ты решаешь на цифрах. Сборка 7 000 ₽ — ограниченный эксперимент с приёмкой.'},
  P4:{tag:'Твой путь — собрать самому',
      title:'Собери <em>своими руками</em>',
      desc:'У тебя есть железо и желание разобраться. Гайд — 20 конфигураций с моделями, промптами и ценами запуска: соберёшь сам за 3–4 часа.',
      spec:['Проверено вживую, не теория','Грабли названы заранее','Конфиг принадлежит тебе'],
      best:'table',why:'Ты собираешь сам. Гайд 5 000 ₽ — 20 конфигураций с моделями и промптами; апгрейд до персоналки +2К, без доплат.'}
};
function updateGoalMeta(){
  const el=document.getElementById('goalMeta'); if(!el) return;
  if(!goals.length){el.style.display='none';return;}
  const names=goals.map(id=>{const g=GOALS.find(x=>x.id===id);return g?(g.sn||g.t):id;});
  const hours=goals.reduce((s,id)=>s+(GOALS.find(x=>x.id===id)||{econ:0}).econ,0);
  el.textContent='\u2248 '+hours+' \u0447/\u043c\u0435\u0441 \u0440\u0443\u043a\u0430\u043c\u0438: '+names.join(' + ');
  el.style.display='block';
  const seg=document.getElementById('segBadge');
  if(seg){
    const p=segProfile();
    const multi=goals.filter(g=>g!=='unsure').length>1;
    let tag='',txt='';
    if(p==='newbie'){
      tag='\u0422\u0432\u043e\u0439 \u043f\u0443\u0442\u044c \u2014 \u0434\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430';
      txt='<b>\u041d\u0435 \u0437\u043d\u0430\u0442\u044c \u0441 \u0447\u0435\u0433\u043e \u043d\u0430\u0447\u0430\u0442\u044c \u2014 \u043d\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e: \u044d\u0442\u043e \u0443 43% \u0432\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u0435\u0432</b>. '
        + '\u0412 \u043a\u043e\u043d\u0446\u0435 \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u043f\u043e\u043a\u0430\u0436\u0443 \u0440\u0430\u0437\u0431\u043e\u0440 \u0442\u0432\u043e\u0435\u0433\u043e \u0434\u043d\u044f \u2014 \u043d\u0430\u0439\u0434\u0435\u043c \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u044e\u0449\u0435\u0435\u0441\u044f, \u0447\u0442\u043e \u043c\u043e\u0436\u043d\u043e \u043e\u0442\u0434\u0430\u0442\u044c \u0430\u0433\u0435\u043d\u0442\u0443. \u0411\u0435\u0437 \u043f\u0440\u043e\u0434\u0430\u0436\u0438 \u0432\u043e\u0437\u0434\u0443\u0445\u0430.';
    } else {
      tag='\u0422\u0432\u043e\u0439 \u043f\u0443\u0442\u044c \u2014 \u0441\u0432\u044f\u0437\u043a\u0430 \u043f\u043e\u0434 \u043f\u0440\u043e\u0446\u0435\u0441\u0441'+(multi?' \u00b7 \u043c\u0443\u043b\u044c\u0442\u0438\u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439':'');
      txt='<b>\u0423 \u0442\u0435\u0431\u044f \u043f\u0440\u043e\u0446\u0435\u0441\u0441 \u0435\u0441\u0442\u044c \u2014 \u0441\u0447\u0438\u0442\u0430\u0435\u043c \u0434\u0435\u043d\u044c\u0433\u0438.</b> '
        + '\u0412 \u0440\u0430\u0441\u0447\u0451\u0442\u0435: \u0447\u0430\u0441\u044b \u0440\u0443\u043a\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u0438\u0432 \u0447\u0430\u0441\u043e\u0432 \u0441 \u0430\u0433\u0435\u043d\u0442\u043e\u043c, \u0440\u0430\u0437\u0431\u0438\u0432\u043a\u0430 \u043f\u043e \u0441\u0442\u0430\u0442\u044c\u044f\u043c \u0438 \u043e\u043a\u0443\u043f\u0430\u0435\u043c\u043e\u0441\u0442\u044c \u043f\u043e \u0442\u0432\u043e\u0435\u0439 \u0446\u0435\u043d\u0435 \u0447\u0430\u0441\u0430.';
    }
    seg.innerHTML='<span class="seg-tag">'+tag+'</span><br/>'+txt;
    seg.style.display='block';
  }
}
function toggleConn(id){conns=conns.includes(id)?conns.filter(x=>x!==id):[...conns,id];cfgChange();renderBridge();}
function goalLabel(){return goals.map(id=>{const g=GOALS.find(x=>x.id===id);return g?(g.sn||g.t):'';}).filter(Boolean).join(' + ')||'';}
function deviceLabel(){const d=device?DEVICES.find(x=>x.id===device):null;return d?d.t:(device||'');}
function budgetLabel(){const b=budget?BUDGETS.find(x=>x.id===budget):null;return b?b.label:'';}
function days(h){return h+' ч/мес';}

/* ========== LIVE PRICE ========== */
function mcHint(){ try{ const m=JSON.parse(sessionStorage.getItem('ds_mc')||'null'); if(!m) return null; return m; }catch(e){ return null; } }
function estimate(){
  if(!device||!goals.length||!autonomy||!budget)return null;
  const gs=goals.map(id=>GOALS.find(x=>x.id===id)).filter(Boolean);
  const b=BUDGETS.find(x=>x.id===budget);
  const aut=AUTONOMY.find(x=>x.id===autonomy);
  const autoMult=aut.mult;
  let base='qwen';
  /* класс модели = МАКСИМУМ по выбранным задачам (решение 10.10: самый требовательный
     выигрывает; приоритет расчёта над картинкой — иначе «Дизайн» обрушивал цену) */
  const needCompute=tasks.some(t=>['docs','data','sales'].includes(t));
  const needVision=tasks.some(t=>['design','video'].includes(t));
  if(needVision)base='multimodal';
  if(needCompute)base='deepseek'; /* расчётная всегда не дешевле визуальной — перекрывает */
  let modelKey,cat;
  /* локальная модель возможна только с видеокартой; на CPU/телефоне честно уходим в облако */
  const canRunLocal=(device==='gpu8'||device==='gpu12'||device==='gpu24');
  if(canRunLocal&&(data==='local'||data==='hybrid')){modelKey=data==='hybrid'?'hybrid':'local';cat=data==='hybrid'?'Гибрид':'Локально';}
  else if(device==='gpu12'||device==='gpu24'){modelKey='local';cat='Локально';}
  else if(data==='hybrid'){modelKey='hybrid';cat='Гибрид';}
  else {
    cat='Облако';
    /* Бюджет больше не подменяет модель: раньше стоял гейт по m.cost (260/500 ₽) —
       константе, не связанной с реальным расходом токенов. Теперь модель выбирается
       по задаче, а бюджет только предупреждает (см. updateLive). */
    modelKey=base;
  }
  const m=MODELS[modelKey];
  /* ── ЭКОНОМИКА ВЛАДЕНИЯ (источник: research/01-gigachat.md, 02-yandex.md) ──
     Считаем ТОКЕНЫ × ТАРИФ, а не «стоимость за функцию».
     Раньше стояло m.cost*(0.6+0.4n) — плоская цена: 6 функций по 145 ₽ (скидка ×1.9),
     а против Pro-тарифа недосчёт в 5–10 раз. Заменено 24.10.

     Тарифы GigaChat async, ₽ за 1 млн токенов (официальный прайс developers.sber.ru):
       Lite 32,5 · Pro 250 · Max 325.
     Объёмы — допущения из типовой рутины МСБ; калибровать на живых клиентах. */
  const TARIFF={lite:32.5,pro:250,max:325};
  const TOK_MONTH={repeat:3.6e6, leads:2.25e6, report:1.2e5, scan:1.8e6, write:1.6e5, paper:1.5e5, unsure:0};
  const TIER_OF={repeat:'lite', leads:'lite', scan:'lite', report:'pro', write:'pro', paper:'pro'};
  const TASK_TOK={text:1.2e5,design:6e4,docs:1.8e5,data:1.5e5,web:1.2e5,social:8e4,sales:1.5e5,research:1.2e5};
  const AUTO_TOK={draft:0.8,review:1,auto:1.4,full:2.0};
  let tokenCost=0;
  gs.forEach(g=>{ if(g.id==='unsure')return;
    const tok=TOK_MONTH[g.id]||0;
    tokenCost+=tok/1e6*TARIFF[TIER_OF[g.id]||'lite'];
  });
  tasks.forEach(t=>{ tokenCost+=(TASK_TOK[t]||1e5)/1e6*TARIFF.pro; });
  tokenCost=tokenCost*(AUTO_TOK[autonomy]||1);
  /* локальная модель — расход провайдера 0 (электричество не считаем);
     гибрид — половина уходит в API */
  const MODEL_SHARE={qwen:1,deepseek:1,multimodal:1,open:0.8,local:0,hybrid:0.5};
  const modelCost=Math.round(tokenCost*(MODEL_SHARE[modelKey]??1));

  /* ── ХОСТИНГ ПО ЧИСЛУ АГЕНТОВ ──
     Плоские 2190 на любое число функций = 6 агентов на одной VPS по цене одного.
     Тиры по факту RAM (research/03-hosting-gpu.md, Timeweb MSK, цены после 08–14.10):
       1 агент  → Cloud-50  4 ГБ  ≈ 1 100
       2–3      → Cloud-80  8 ГБ  ≈ 2 190
       4–5      → Cloud-160 16 ГБ ≈ 4 300
       6+       → 2×8 ГБ / 32 ГБ  ≈ 4 800
     2 ГБ одного агента не тянет (кейс Николая: 4 ГБ уже тупит с голосом). */
  const nAgents=Math.max(1, gs.filter(g=>g.id!=='unsure').length + Math.ceil(tasks.length/2));
  const HOST_TIERS=[[1,1100],[3,2190],[5,4300],[999,4800]];
  const hostBase=(HOST_TIERS.find(t=>nAgents<=t[0])||[999,4800])[1];

  const tgNeeded=conns.includes('tg')||conns.includes('bot');
  /* Свой VPS — это тоже деньги каждый месяц, а не «бесплатно». Раньше device='vps' давал
     hostCost=0 и клиент видел связку на 2190 ₽ дешевле, чем она стоит. Считаем как есть,
     а в интерфейсе помечаем «сервер уже оплачен». */
  const hosted=(device==='host'||(data==='cloud'&&device!=='vps')||device==='vps');
  const rfColo=hosted||data==='ru'||device==='vps';
  /* Шлюз для Telegram на РФ-хостинге: api.telegram.org из дата-центров РФ не отвечает (ТСПУ).
     MTProxy/реверс-прокси на дешёвом VPS — 200–400 ₽/мес, берём середину. */
  const gateway=(tgNeeded&&rfColo)?300:0;
  const hosting=(hosted?hostBase:0)+gateway;
  const connCost=conns.reduce((s,c)=>s+CONNS.find(x=>x.id===c).cost,0);
  let handsHours=gs.reduce((s,g)=>s+g.econ,0); tasks.forEach(t=>{const tt=TASKS.find(x=>x.id===t); if(tt)handsHours+=tt.econ;});
  const hostCost=hosting;
  const connTotal=connCost;
  const monthly=Math.round(modelCost+hostCost+connTotal);
  // с агентом: что осталось человеку — контроль и правки, доля от автономности
  const agentShare=draft=>({draft:0.4,review:0.3,auto:0.2,full:0.1}[draft]||0.3);
  const agentHours=Math.round(handsHours*(1-agentShare(autonomy))*1);
  const handsTotal=handsHours;
  const startMoney=startBase();
  return {monthly,hours:agentHours,handsHours:handsTotal,cat,modelKey,modelCost,hostCost,connTotal,gateway,modelName:m.name,base:startMoney};
}
function updateLive(){
  const lb=document.getElementById('livebar');
  const e=estimate();
  if(!e){if(lb)lb.style.display='none';document.getElementById('livePrice').innerHTML='— <span>₽/мес</span>';return;}
  if(lb)lb.style.display='';
  document.getElementById('livePrice').innerHTML=e.monthly.toLocaleString('ru-RU')+' <span>₽/мес</span>';
  const b=BUDGETS.find(x=>x.id===budget);
  if(b&&b.max!==Infinity&&e.monthly>b.max){
    document.getElementById('liveHint').textContent='⚠ превышает бюджет '+b.max.toLocaleString('ru-RU')+' ₽ — убери подключения';
  }else{
    document.getElementById('liveHint').textContent='сейчас уходит '+e.handsHours+' ч/мес · агент освободит ~'+e.hours+' ч — '+e.cat;
  }
}

/* ========== NAV ========== */
function show(cardNo){
  for(let i=1;i<=N;i++)document.getElementById('card'+i).style.display=(i===cardNo)?'':'none';
  document.getElementById('stepsCount').textContent=step+' / '+N;
  renderSteps();
  if(cardNo===N) updatePreSummary();
}
function stepValid(){
  if(step===1)return !!start;
  if(step===2)return goals.length>0&&!!budget;
  if(step===3)return true; // задачи и автономность — опционально, есть дефолты
  return true;
}
function stepRender(){
  show(step);
  updateLive();
  document.getElementById('backBtn').style.visibility=step===1?'hidden':'visible';
  document.getElementById('nextBtn').textContent=step===N?'Посчитать связку →':'Далее →';
  const valid=stepValid();
  document.getElementById('nextBtn').disabled=!valid;
  document.getElementById('nextBtn').style.opacity=valid?'1':'.35';
  document.getElementById('nextBtn').style.cursor=valid?'pointer':'not-allowed';
}
function pickOption(){
  if(step===1&&start){step=2;}
  renderCards();
  updateLive();stepRender();
  updatePreSummary();
}
function updatePreSummary(){
  const el=document.getElementById('preSummary'); if(!el) return;
  const b=budget?BUDGETS.find(x=>x.id===budget):null;
  const names=goals.map(id=>{const g=GOALS.find(x=>x.id===id);return g?(g.sn||g.t):'';}).filter(Boolean);
  const st=STARTS.find(x=>x.id===start);
  el.textContent=(st?st.short:'старт не выбран')+' · '+(names.length?names.join(' + '):'—')+(tasks.length?' · '+tasks.length+' задач':'');
}
function go(delta){step=Math.min(N,Math.max(1,step+delta));stepRender();}
function next(){
  if(step===1&&!start){toast('Выбери, с чем работаешь сейчас');return;}
  if(step===2&&!goals.length){toast('Отметь хотя бы одну вещь');return;}
  if(step===2&&!budget){toast('Выбери бюджет');return;}
  if(step<N){step++;stepRender();}
  else calculate();
}
function toast(m){
  const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}

/* ========== ENGINE ========== */
function countUp(el,to,suffix){
  const dur=900,start=performance.now();
  const rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(rm){el.textContent=to.toLocaleString('ru-RU')+(suffix||'');return;}
  function frame(t){
    const p=Math.min(1,(t-start)/dur);
    const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e).toLocaleString('ru-RU')+(suffix||'');
    if(p<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function recalcPayback(){
  const rate=+document.getElementById('pbSlider').value;
  const e=estimate(); if(!e)return;
  document.getElementById('pbRate').textContent=rate.toLocaleString('ru-RU')+' \u20bd';
  const st=STARTS.find(x=>x.id===start)||STARTS[0];
  const timeMoney=e.hours*rate;              // сколько стоит освобождённое время
  /* дублируем экономику в верхний блок, чтобы ползунок менял и её */
  const _sv=document.getElementById('ahaSaving');
  if(_sv&&e.hours)_sv.innerHTML='освобождает ~'+days(e.hours)+' · <b>≈ '+Math.round(timeMoney).toLocaleString('ru-RU')+' ₽/мес</b> по ставке '+rate.toLocaleString('ru-RU')+' ₽/ч';
  const noDouble=(start==='people');         // зарплату уже платили за эти часы — не двоим
  const money=(noDouble?0:timeMoney)+e.base; // экономия = время + уход с текущих расходов
  const netMonthly=money-e.monthly;          // минус владение
  const res=document.getElementById('pbRes');
  if(netMonthly<=0){
    res.innerHTML='\u041f\u0440\u0438 \u044d\u0442\u0438\u0445 \u0432\u0432\u043e\u0434\u043d\u044b\u0445 \u0430\u0433\u0435\u043d\u0442 \u043d\u0435 \u043e\u043a\u0443\u043f\u0430\u0435\u0442\u0441\u044f \u2014 <b>\u0441\u043c\u0435\u043d\u0438 \u0440\u0435\u0436\u0438\u043c</b> \u043d\u0430 \u0448\u0430\u0433\u0435 05 \u0438\u043b\u0438 \u0443\u0431\u0435\u0440\u0438 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f.';
  }else{
    const months=st.cost/netMonthly;
    const paybackTxt=(months<=1)?'\u043e\u043a\u0443\u043f\u0430\u0435\u0442\u0441\u044f \u0432 \u043f\u0435\u0440\u0432\u044b\u0439 \u0436\u0435 \u043c\u0435\u0441\u044f\u0446'
      :'\u043e\u043a\u0443\u043f\u0430\u0435\u0442\u0441\u044f \u0437\u0430 <em>'+Math.ceil(months)+' \u043c\u0435\u0441</em>';
    res.innerHTML='\u042d\u043a\u043e\u043d\u043e\u043c\u0438\u044f <b>'+netMonthly.toLocaleString('ru-RU')+' \u20bd/\u043c\u0435\u0441</b> \u00b7 '+st.short+' '+st.cost.toLocaleString('ru-RU')+' \u20bd '+paybackTxt;
  }
  document.getElementById('pbNote').textContent='\u0421\u0447\u0438\u0442\u0430\u0435\u043c \u0447\u0435\u0441\u0442\u043d\u043e: \u044d\u043a\u043e\u043d\u043e\u043c\u0438\u044f = \u0447\u0430\u0441\u044b \u0430\u0433\u0435\u043d\u0442\u0430 \u00d7 \u0442\u0432\u043e\u044f \u0446\u0435\u043d\u0430 \u0447\u0430\u0441\u0430'+(e.base>0?' + \u0443\u0445\u043e\u0434 \u0441 \u0442\u0435\u043a\u0443\u0449\u0438\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432':'')+' \u2212 \u0432\u043b\u0430\u0434\u0435\u043d\u0438\u0435.';
  updateYearBox(e,netMonthly,st);
}
function updateYearBox(e,net,st){
  var box=document.getElementById('yearBox'); if(!box)return;
  if(!net||net<=0){
    box.innerHTML='<div class="y-head">Деньги и окупаемость</div>'
      +'<div class="brow"><span>При этих вводных агент не окупается</span><b>смени режим на шаге 05</b></div>';
    box.style.display='block'; updateLimits(e); updateAcceptance(e,net); return;
  }
  var year=net*12, months=st.cost/net;
  var pay=(months<=1)?'первый месяц':'за '+Math.ceil(months)+' мес';
  var rows='<div class="brow"><span>Экономия в месяц</span><b>'+net.toLocaleString('ru-RU')+' ₽</b></div>'
    +'<div class="brow"><span>Экономия в год</span><b>'+year.toLocaleString('ru-RU')+' ₽</b></div>'
    +'<div class="brow total"><span>Окупаемость сборки ('+st.cost.toLocaleString('ru-RU')+' ₽)</span><b>'+pay+'</b></div>';
  if(start==='people'){
    rows+='<div class="brow"><span>Менеджер с налогами (рынок 2026)</span><b>80 000–140 000 ₽/мес</b></div>';
  }
  box.innerHTML='<div class="y-head">Деньги и окупаемость · МСБ</div>'+rows
    +'<div class="pb-note">Считаем честно: экономия = освобождённые часы × твоя цена часа'+(e.base>0?' + уход с текущих расходов':'')+' − владение. Год — та же экономия × 12.</div>';
  box.style.display='block';
  updateLimits(e);
  updateAcceptance(e,net);
}
function updateLimits(e){
  var box=document.getElementById('limitsBox'); if(!box)return;
  var rows=[
    ['in','Входит','сборка под твои сценарии, промпты, приёмка по чек-листу'],
    ['out','Не входит','токены модели, хостинг, VPS — платишь провайдерам напрямую'+(e&&e.monthly?(' (~'+e.monthly.toLocaleString('ru-RU')+' ₽/мес)'):'')],
    ['out','Агент не берёт','спорные и денежные решения — только с твоим «да» (human approval)'],
    ['out','Нужно от тебя','доступы (Telegram, таблицы) и ~2 ч на приёмку — без них срок не стартует']
  ];
  box.innerHTML='<div class="lim-head">Что входит и где границы</div>'
    +rows.map(function(r){return '<div class="lim-row '+r[0]+'"><span class="m">'+r[1]+':</span><span>'+r[2]+'</span></div>';}).join('');
  box.style.display='block';
}

function updateAcceptance(e,net){
  var box=document.getElementById('acceptBox'); if(!box)return;
  var items=[];
  var g=goals.slice();
  if(g.includes('repeat')) items.push('Агент отвечает на повторяющиеся вопросы по твоей базе — проверяем на 3 живых примерах');
  if(g.includes('leads')) items.push('Заявка доходит до тебя в Telegram; замер ответа 3 раза в рабочее время');
  if(g.includes('report')) items.push('Регулярный отчёт приходит по расписанию — сверяем с твоим ручным за день');
  if(g.includes('scan')) items.push('Сбор и проверка информации по источникам — выжимка со ссылками, без выдумок');
  if(g.includes('write')) items.push('Черновики текстов в твоём тоне — 3 прогона, правишь на месте');
  if(g.includes('paper')) items.push('Разбор документов/выписок — классификация на твоём образце');
  if(goal==='unsure'||items.length===0) items.push('Сначала диагностика: находим процесс, который автоматизируем первым');
  if(conns.includes('mem')) items.push('Помнит контекст между чатами — проверяем вживую');
  if(data==='local'||data==='ru'||data==='hybrid') items.push('Данные на твоём устройстве или РФ-сервере — показываю, где именно');
  items.push('Откат на заглушку, если агент упал — показываю, как');
  items.push('Лог первых задач: что сделал, что нет — отдаю тебе');
  var pay=(net&&net>0)?('Окупается за '+( (STARTS.find(x=>x.id===start)||STARTS[0]).cost/Math.max(net,1)<=1?'первый месяц':Math.ceil((STARTS.find(x=>x.id===start)||STARTS[0]).cost/Math.max(net,1))+' мес' )):'не окупается — не начинаем';
  box.innerHTML='<div class="acc-head">Чек-лист приёмки твоей сборки</div>'
    +'<div class="acc-sub">Это то, что ты примешь до оплаты. Пункт не работает — довожу без доплат (до 10 рабочих дней).</div>'
    +'<ol>'+items.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ol>'
    +'<div class="acc-foot">Оплата вперёд, но риск снят: <b>критерии зафиксированы здесь и в оферте</b>, а не «оплатишь — разберёмся». '+pay+'.</div>';
  box.style.display='block';
}

function calculate(){
  const e=estimate(); if(!e)return;
  const g=GOALS.find(x=>x.id===goal)||GOALS.find(x=>x.id===goals[0])||null;
  const aut=AUTONOMY.find(x=>x.id===autonomy);
  const m=MODELS[e.modelKey];
  const isUnsure=(goal==='unsure'||goals.includes('unsure'));
  const goalName=isUnsure?'\u0434\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430':(goals.length>1?goals.length+' \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0430':(g?('\u00ab'+(g.sn||g.t)+'\u00bb'):'\u0442\u0432\u043e\u044f \u0440\u0443\u0442\u0438\u043d\u0430'));
  const multiTag=goals.length>1?' \u00b7 \u043c\u0443\u043b\u044c\u0442\u0438\u0441\u0446\u0435\u043d\u0430\u0440\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u043a\u0430':'';

  const per=persona(); const pc=PERSONA_COPY[per];
  const scn=SCENARIO[start]||null;
  document.getElementById('ahaTitle').innerHTML=isUnsure
    ?'Начнём с <em>диагностики</em>'
    :(scn?scn.title:(pc?pc.title:('Твой агент — <em>'+goalName+'</em>')));
  document.getElementById('ahaDesc').innerHTML=isUnsure
    ?'Ты не смог назвать процесс — это не проблема, а точка входа. Большинство не может: процесс нигде не описан. Опиши день — покажу, что автоматизировать первым.'
    :((scn?scn.note+' ':'')+'Из <b>'+e.handsHours+' ч/мес руками</b> агент забирает <b>'+e.hours+' ч</b> — тебе остаётся '+(e.handsHours-e.hours)+' ч на контроль. Автономность «'+aut.label+'». '
      +(pc?pc.desc:''));
  document.getElementById('ahaCost').innerHTML=e.monthly.toLocaleString('ru-RU')+' <span>\u20bd/\u043c\u0435\u0441</span>';
  /* Экономика сегмента сразу, а не за ползунком: часы × ставка клиента.
     Ползунок остаётся, чтобы пересчитать под свою ставку. */
  const _rate=+(document.getElementById('pbSlider')||{value:700}).value||700;
  const _saved=Math.round(e.hours*_rate);
  document.getElementById('ahaSaving').innerHTML='\u043e\u0441\u0432\u043e\u0431\u043e\u0436\u0434\u0430\u0435\u0442 ~'+days(e.hours)
    +' \u00b7 <b>\u2248 '+_saved.toLocaleString('ru-RU')+' \u20bd/\u043c\u0435\u0441</b> \u043f\u043e \u0441\u0442\u0430\u0432\u043a\u0435 '+_rate.toLocaleString('ru-RU')+' \u20bd/\u0447';
  document.getElementById('ahaSavingNote').textContent='\u041d\u0430 \u00ab'+aut.label+'\u00bb \u0430\u0432\u0442\u043e\u043d\u043e\u043c\u043d\u043e\u0441\u0442\u0438 \u0430\u0433\u0435\u043d\u0442 \u0431\u0435\u0440\u0451\u0442 \u043d\u0430 \u0441\u0435\u0431\u044f \u0440\u0443\u0442\u0438\u043d\u0443, \u0430 \u0442\u044b \u0437\u0430\u0431\u0438\u0440\u0430\u0435\u0448\u044c \u0432\u0440\u0435\u043c\u044f. \u0421\u0442\u0430\u0432\u043a\u0443 \u043c\u0435\u043d\u044f\u0435\u0448\u044c \u043f\u043e\u043b\u0437\u0443\u043d\u043a\u043e\u043c \u043d\u0438\u0436\u0435.';

  const detail=document.getElementById('detailBox');
  detail.style.display='block';
  if(true){
    const max=Math.max(e.handsHours,e.hours,1);
    document.getElementById('vsHandsVal').textContent=e.handsHours+' \u0447/\u043c\u0435\u0441';
    document.getElementById('vsAgentVal').textContent=e.hours+' \u0447/\u043c\u0435\u0441 (\u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c)';
    setTimeout(()=>{
      document.getElementById('vsHands').style.width=Math.round(e.handsHours/max*100)+'%';
      document.getElementById('vsAgent').style.width=Math.round((e.handsHours-e.hours)/max*100)+'%';
    },60);
    const rows=[['\u041c\u043e\u0434\u0435\u043b\u044c \u2014 '+e.modelName,e.modelCost],['\u0425\u043e\u0441\u0442\u0438\u043d\u0433'+(e.gateway?' (\u0441 \u0448\u043b\u044e\u0437\u043e\u043c \u0434\u043b\u044f Telegram)':''),e.hostCost],['\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f',e.connTotal]];
    document.getElementById('brkTable').innerHTML=
      rows.filter(r=>r[1]>0).map(r=>'<div class="brow"><span>'+r[0]+'</span><b>'+r[1].toLocaleString('ru-RU')+' \u20bd</b></div>').join('')
      +(e.monthly===0?'<div class="brow"><span>Итого</span><b>0 ₽ провайдеру — модель на твоём железе</b></div>':'<div class="brow total"><span>Итого</span><b>'+e.monthly.toLocaleString('ru-RU')+' ₽/мес</b></div>');
    recalcPayback();
  }

  // сравнение по стартовому состоянию: откуда → куда
  var sb=document.getElementById('scenBox');
  if(sb){
    if(isUnsure||!start){sb.style.display='none';}
    else{
      var st=STARTS.find(x=>x.id===start)||STARTS[0];
      var m0=e.monthly.toLocaleString('ru-RU');
      var line='';
      if(start==='nothing') line='<span class="sb-k">С нуля:</span> владение <b>'+m0+' ₽/мес</b> · окупается за счёт освобождённых часов';
      else if(start==='sub') line='<span class="sb-k">Платишь сейчас ~'+st.base.toLocaleString('ru-RU')+' ₽/мес за подписку</span> → владение <b>'+m0+' ₽/мес</b> · плюс нельзя отключить';
      else if(start==='legacy') line='<span class="sb-k">Связка сейчас ~'+st.base.toLocaleString('ru-RU')+' ₽/мес</span> → после оптимизации <b>'+m0+' ₽/мес</b> · замер до/после';
      else if(start==='hardware') line='<span class="sb-k">Железо уже твоё</span> → связка <b>'+m0+' ₽/мес</b> вместо ~'+st.base.toLocaleString('ru-RU')+' ₽ за облако';
      else if(start==='people') line='<span class="sb-k">Платишь человеку ~'+st.base.toLocaleString('ru-RU')+' ₽/мес</span> → агент+владение <b>'+m0+' ₽/мес</b> · не болеет и не уходит';
      sb.innerHTML=line;
      sb.style.display='block';
    }
  }

  document.getElementById('specName').innerHTML=isUnsure?'\u0414\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430<span>\u0440\u0430\u0437\u0431\u043e\u0440</span>':('Связка под '+goalName+'<span>'+e.cat+'</span>');
  const dets=[];
  if(goals.includes('write'))dets.push('\u041a\u043e\u043d\u0432\u0435\u0439\u0435\u0440 \u043a\u043e\u043d\u0442\u0435\u043d\u0442\u0430 \u0431\u0435\u0437 \u0432\u044b\u0433\u043e\u0440\u0430\u043d\u0438\u044f');
  if(isUnsure)dets.push('\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0434\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430: \u043d\u0430\u0439\u0434\u0435\u043c, \u0447\u0442\u043e \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0435\u0440\u0432\u044b\u043c');
  if(conns.includes('bot'))dets.push('Telegram-\u0431\u043e\u0442 \u0434\u043b\u044f \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u0438\u0438 24/7');
  if(conns.includes('obs'))dets.push('Obsidian \u2014 \u0431\u0430\u0437\u0430 \u0437\u043d\u0430\u043d\u0438\u0439 \u043e \u0436\u0438\u0437\u043d\u0438');
  if(data==='ru')dets.push('\u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0430 \u0420\u0424-\u0441\u0435\u0440\u0432\u0435\u0440\u0435 \u2014 \u043b\u043e\u043a\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f (242-\u0424\u0417)');
  if(data==='local')dets.push((device==='gpu8'||device==='gpu12'||device==='gpu24')
    ? 'Данные локально — полный контроль'
    : 'Локальная модель требует GPU 8 ГБ+ — на этом железе пойдёт облако');
  if(pay==='rucard')dets.push('\u041e\u043f\u043b\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u043e\u0439 \u0420\u0424 / \u0421\u0411\u041f \u2014 \u0431\u0435\u0437 VPN');
  if(pay==='crypto')dets.push('\u041e\u043f\u043b\u0430\u0442\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0439 (USDT)');
  if(pay==='proxy')dets.push('\u041e\u043f\u043b\u0430\u0442\u0430 \u0447\u0435\u0440\u0435\u0437 \u043f\u043e\u0441\u0440\u0435\u0434\u043d\u0438\u043a\u043e\u0432');
  if(goals.length>1)dets.push(goals.length+' \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0430 \u0432 \u043e\u0434\u043d\u043e\u0439 \u0441\u0432\u044f\u0437\u043a\u0435');
  if(pc){ dets.unshift.apply(dets, pc.spec.map(s=>'<b>'+s+'</b>')); }
  document.getElementById('specList').innerHTML=dets.map(d=>'<li>'+ic('check')+d+'</li>').join('');

  // рекомендованный продукт: сегмент + масштаб, а не только «тип персоны»
  const recKey=recommendProduct();
  arrangeOffers(recKey);
  var why=document.getElementById('personaWhy');
  if(why&&pc){why.innerHTML='<b>Почему именно так:</b> '+recWhy(recKey);why.style.display='block';}
  var pt=document.getElementById('personaTag');
  if(pt&&pc){pt.textContent=pc.tag;pt.style.display='inline-block';}

  document.getElementById('diagBox').style.display=isUnsure?'block':'none';
  document.getElementById('specBox').style.display=isUnsure?'none':'block';
  if(isUnsure){
    document.getElementById('ahaCost').innerHTML='0 <span>\u20bd \u0437\u0430 \u0440\u0430\u0437\u0431\u043e\u0440</span>';
    document.getElementById('ahaSaving').textContent='\u0440\u0430\u0437\u0431\u043e\u0440 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439';
    document.getElementById('ahaSavingNote').textContent='\u0414\u0430\u043b\u044c\u0448\u0435 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0435\u0441\u043b\u0438 \u0443\u0432\u0438\u0434\u0438\u0448\u044c \u0441\u043c\u044b\u0441\u043b. \u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0432\u044f\u0437\u044b\u0432\u0430\u0435\u043c.';
  }
  const rcard=document.querySelector('.rcard');
  if(rcard){rcard.style.animation='none';rcard.offsetHeight;rcard.style.animation='';}
  countUp(document.getElementById('ahaCost'),e.monthly,' \u20bd/\u043c\u0435\u0441');
  if(!document.getElementById('result').classList.contains('show'))renderConfig();
  document.getElementById('result').classList.add('show');
  document.getElementById('offerBox').style.display='block';
  document.getElementById('result').scrollIntoView({behavior:'smooth'});
}

/* ========== ОПЛАТА: прямой перевод + личка ========== */
/* Никаких ботов и автоматизации: СБП/карта → личка Виктора с готовым текстом. */
const TG_ME='https://t.me/soulvictor';
let chosenOffer=null;

function payConfig(){
  if(chosenOffer==='config')return{amount:'7 000 ₽',title:'Персональная сборка — оплата',sub:'Переведи 7 000 ₽ и напиши мне: соберу связку под твои задачи за 1–3 дня.',btn:'Я оплатил — начать сборку →'};
  if(chosenOffer==='optimization')return{amount:'от 25 000 ₽',title:'Оптимизация агента — заявка',sub:'Напиши мне: сначала аудит связки, потом назову точную цену до начала работ.',btn:'Обсудить аудит →'};
  return{amount:'5 000 ₽',title:'Гайд: 20 конфигураций — оплата',sub:'Переведи 5 000 ₽ и напиши мне: отправлю таблицу сразу после подтверждения.',btn:'Я оплатил — получить гайд →'};
}

function goCheckout(kind){
  chosenOffer=kind;
  /* Разовые продукты: если ссылка Robokassa заполнена — идём сразу на оплату.
     Панель ручного перевода — только фолбэк, когда ссылки нет. */
  var plink = kind==='table' ? (typeof PAY_LINK_ROBOKASSA_GUIDE!=='undefined'?PAY_LINK_ROBOKASSA_GUIDE:'')
            : kind==='config' ? (typeof PAY_LINK_ROBOKASSA_BUILD!=='undefined'?PAY_LINK_ROBOKASSA_BUILD:'')
            : kind==='optimization' ? (typeof PAY_LINK_ROBOKASSA_OPTIMIZATION!=='undefined'?PAY_LINK_ROBOKASSA_OPTIMIZATION:'') : '';
  if(plink){
    try{localStorage.setItem('ds_order',JSON.stringify({offer:kind,paid:false,ts:Date.now(),goals:goals,device:device,monthly:(estimate()||{}).monthly}));}catch(e){}
    window.open(plink,'_blank','noopener');
    return;
  }
  const c=payConfig();
  const panel=document.getElementById('payPanel');
  document.getElementById('payTitle').textContent=c.title;
  document.getElementById('paySub').textContent=c.sub;
  document.getElementById('payAmount').textContent=c.amount;
  document.getElementById('btnPaid').textContent=c.btn;
  panel.style.display='block';
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}

/* Текст сообщения, которое клиент пришлёт тебе в личку */
function orderText(paid){
  const est=estimate()||{};
  const offer=chosenOffer==='config'?'Персональная сборка (7 000 ₽)':chosenOffer==='optimization'?'Оптимизация агента (от 25 000 ₽)':'Гайд: 20 конфигураций (5 000 ₽)';
  const lines=[];
  if(paid){
    lines.push('Оплатил '+offer+'. Скрин перевода прилагаю.');
    if(goalLabel())lines.push('Задачи: '+goalLabel());
    if(est.monthly)lines.push('Расчёт калькулятора: ~'+est.monthly+' ₽/мес');
    if(device)lines.push('Железо: '+deviceLabel());
  }else{
    lines.push('Здравствуйте! Хочу '+offer+'.');
    if(goalLabel())lines.push('Задачи: '+goalLabel());
    lines.push('Подскажи, как оплатить и что нужно от меня.');
  }
  return lines.join('\n');
}

/* Установка (15/20/30/60К): раздельная ссылка Robokassa на каждый вариант, пока пусто — личка с контекстом */
function goInstall(kind){
  const link=kind==='pc'?PAY_LINK_ROBOKASSA_INSTALL_PC:kind==='vps'?PAY_LINK_ROBOKASSA_INSTALL_VPS:kind==='integ'?PAY_LINK_ROBOKASSA_INSTALL_INTEG:'';
  if(link){window.open(link,'_blank','noopener');return;}
  openInstallChat(kind);
}
function openInstallChat(kind){
  const est=estimate()||{};
  const k=kind==='pc'?'Личный агент на ПК (15 000 ₽)':kind==='vps'?'для самозанятого (20 000 ₽)':kind==='integ'?'для микро/малого бизнеса (30 000 ₽)':'(15 / 20 / 30 / 60К)';
  const lines=['Здравствуйте! Интересует установка под ключ '+k+'.'];
  if(goal)lines.push('Задачи: '+goalLabel());
  if(device)lines.push('Железо: '+deviceLabel());
  if(est.monthly)lines.push('Расчёт калькулятора: ~'+est.monthly+' ₽/мес');
  lines.push('Какой вариант подойдёт и когда сможете сделать?');
  try{localStorage.setItem('ds_order',JSON.stringify({offer:'install',paid:false,ts:Date.now(),goals,device,monthly:est.monthly}));}catch(e){}
  window.open(TG_ME+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
}

function openDiagChat(){
  const lines=['Здравствуйте! Прошёл калькулятор, но не могу назвать процесс, который надо автоматизировать.'];
  const est=estimate()||{};
  if(est.monthly)lines.push('Расчёт калькулятора: ~'+est.monthly+' ₽/мес');
  if(device)lines.push('Железо: '+deviceLabel());
  if(budget)lines.push('Бюджет: '+budgetLabel());
  lines.push('Помогите разобраться, что автоматизировать первым.');
  try{localStorage.setItem('ds_order',JSON.stringify({offer:'diagnostic',paid:false,ts:Date.now(),goals,device,monthly:est.monthly}));}catch(e){}
  window.open(TG_ME+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
}

function openChat(paid){
  const plink=(chosenOffer==='table'&&PAY_LINK_ROBOKASSA_GUIDE)?PAY_LINK_ROBOKASSA_GUIDE:(chosenOffer==='config'&&PAY_LINK_ROBOKASSA_BUILD)?PAY_LINK_ROBOKASSA_BUILD:(chosenOffer==='optimization'&&typeof PAY_LINK_ROBOKASSA_OPTIMIZATION!=='undefined')?PAY_LINK_ROBOKASSA_OPTIMIZATION:'';
  if(plink&&paid){window.open(plink,'_blank','noopener');return;}
  const url=TG_ME+'?text='+encodeURIComponent(orderText(paid));
  try{localStorage.setItem('ds_order',JSON.stringify({offer:chosenOffer,paid,ts:Date.now(),goals,device,monthly:(estimate()||{}).monthly}));}catch(e){}
  window.open(url,'_blank','noopener');
}

/* Копирование реквизитов по тапу */
function copyTxt(row){
  const v=row.querySelector('.pay-v').textContent.trim();
  const t=(navigator.clipboard&&navigator.clipboard.writeText)?navigator.clipboard.writeText(v):Promise.reject();
  t.then(()=>toast('Скопировано: '+v)).catch(()=>{
    const ta=document.createElement('textarea');ta.value=v;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');toast('Скопировано: '+v)}catch(_){toast(v)}
    ta.remove();
  });
}

/* ========== PAY LINK SOCKET (Robokassa/Tribute) ==========
   Значения — в едином файле pay-links.js (подключён выше).
   Разовые продукты (гайд, сборка, установка, оптимизация) — только Robokassa.
   Подписочные продукты — только Tribute, в отдельной карточке продукта.
   Пока ссылки пусты, текущий текст и переход в личку сохраняются. */
/* ========== INIT ========== */
renderCards();
renderPresets();
renderConfig();
renderSteps();
updateLive();
a11y();
var _sc=document.getElementById('stepsCount'); if(_sc)_sc.textContent='1 / '+N;
