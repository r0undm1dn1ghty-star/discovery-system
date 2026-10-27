// Проверка воронки 01–05: навигация, валидация, финальный экран
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  const d = w.document;
  const vis = (id) => !d.getElementById(id).hidden;
  console.log('01 шагов в DOM:', [1,2,3,4,5].every(i => d.getElementById('wstep' + i) ? 1 : 0) === true ? 5 : 'FAIL');
  console.log('02 старт: виден шаг 1, скрыты 2-5:', vis('wstep1') && !vis('wstep2') && !vis('wstep5') ? 'ok' : 'FAIL');
  console.log('03 next1 заблокирован до выбора:', d.getElementById('next1').disabled ? 'ok' : 'FAIL');
  // Прыжок на 3 без старта — должен остаться на 1
  w.eval('goStep(3)');
  console.log('04 защита: без выбора старта шаг не меняется:', vis('wstep1') ? 'ok' : 'FAIL');
  // Выбор старта
  w.eval('start="people";pickOption();');
  console.log('05 next1 разблокирован после выбора:', !d.getElementById('next1').disabled ? 'ok' : 'FAIL');
  console.log('06 цена ещё скрыта без целей (честно):', d.getElementById('wizPrice').style.display === 'none' ? 'ok' : 'FAIL');
  // Прыжок на 5 без целей — защита
  w.eval('goStep(5)');
  console.log('07 защита: без целей на финал не пускает:', vis('wstep1') ? 'ok' : 'FAIL');
  // Цели + вперёд
  w.eval('goals=["leads","remind"];deriveTasks();');
  w.eval('goStep(2)');
  console.log('08 next2 разблокирован:', !d.getElementById('next2').disabled ? 'ok' : 'FAIL');
  w.eval('goStep(5)');
  console.log('09 финал виден:', vis('wstep5') ? 'ok' : 'FAIL');
  console.log('10 офферы на финале:', d.getElementById('offerBox').style.display === 'block' ? 'ok' : 'FAIL');
  console.log('11 таблица людей заполнена:', d.getElementById('heroCompare').textContent.includes('Рутина человека') ? 'ok' : 'FAIL');
  // Уход с финала — офферы прячутся
  w.eval('goStep(2)');
  console.log('12 ушёл с финала — офферы скрыты:', d.getElementById('offerBox').style.display === 'none' ? 'ok' : 'FAIL');
  w.eval('goStep(5)');
  console.log('13 вернулся — офферы снова видны:', d.getElementById('offerBox').style.display === 'block' ? 'ok' : 'FAIL');
  console.log('14 прогресс: шаг 5 активен:', d.querySelector('.wp[data-step="5"]').classList.contains('act') ? 'ok' : 'FAIL');
  console.log('15 автокарточки рендерятся:', d.querySelectorAll('#autoOpts .auto-card').length === 4 ? 'ok' : 'FAIL');
  process.exit(0);
}, 800);
