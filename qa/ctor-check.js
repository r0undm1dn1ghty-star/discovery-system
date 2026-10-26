// Проверка живого конструктора: тапы слева → результат справа, без экранов
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
const t = id => { const el = w.document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : '—'; };

setTimeout(() => {
  const out = [];
  // 1. До тапов: заглушка, результата нет
  out.push('до тапов: заглушка видна = ' + (w.document.getElementById('ctorEmpty').style.display !== 'none'));
  // 2. Один тап на старт — результата ещё нет (нужна рутина)
  w.eval('pickOption()');
  out.push('после тапа «откуда»: результат показан = ' + w.document.getElementById('result').classList.contains('show'));
  // 3. Тап на цель — результат появляется СРАЗУ, на том же экране
  w.eval('toggleGoal("repeat")');
  out.push('после тапа на рутину: результат = ' + w.document.getElementById('result').classList.contains('show')
    + ', цена = ' + t('ahaCost'));
  // 4. Вторая цель меняет цену live
  const before = t('ahaCost');
  w.eval('toggleGoal("leads")');
  out.push('вторая рутина: цена ' + before + ' → ' + t('ahaCost') + ' (live)');
  // 5. Смена автономности меняет цену
  w.eval('setAuto("full")');
  out.push('полная автономность: ' + t('ahaCost'));
  // 6. Кап на 4-й цели
  const g3 = w.eval('goals.length');
  w.eval('toggleGoal("scan");toggleGoal("write")');
  out.push('кап: было ' + g3 + ' целей → стало ' + w.eval('goals.length') + ' (не больше 3)');
  // 7. Экранов больше нет
  out.push('карточек-шагов в DOM: ' + w.document.querySelectorAll('.card[id^="card"]').length
    + ', кнопок «Далее»: ' + w.document.querySelectorAll('#nextBtn').length);
  // 8. TG-сообщение
  let opened = null; w.open = u => { opened = u; return null; };
  w.eval('openInstallChat("integ")');
  const txt = decodeURIComponent((opened || '').split('?text=')[1] || '');
  out.push('TG: ' + txt.split('\n').length + ' строк, ' + txt.length + ' символов, есть лайнеры: ' + txt.includes('Моё:'));
  console.log(out.join('\n'));
  process.exit(0);
}, 700);
