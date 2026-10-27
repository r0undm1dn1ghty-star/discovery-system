// Проверка линз: клик по названию перестраивает тексты и подсказывает старт
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  const d = w.document;
  console.log('01 переключатель на месте:', d.querySelectorAll('.lens-switch button').length === 3 ? 'ok' : 'FAIL');
  console.log('02 стартовая линза — время:', w.eval('lens') === 'time' ? 'ok' : 'FAIL');
  // Линза «плачу человеку»
  w.eval('setLens("people")');
  console.log('03 title переписался:', d.getElementById('heroTitle').textContent.includes('твой человек') ? 'ok' : 'FAIL');
  console.log('04 старт подсказан people:', w.eval('start') === 'people' ? 'ok' : 'FAIL');
  console.log('05 ws1 стал «уже выбран»:', d.getElementById('ws1title').textContent.includes('уже выбран') ? 'ok' : 'FAIL');
  console.log('06 ws2 говорит о доле зарплаты:', d.getElementById('ws2sub').textContent.includes('освобождённая доля зарплаты') ? 'ok' : 'FAIL');
  console.log('07 next1 разблокирован:', !d.getElementById('next1').disabled ? 'ok' : 'FAIL');
  // Пройти до финала: тег линзы на месте, таблица людей
  w.eval('goals=["leads"];goStep(5)');
  console.log('08 финал: ага-тег линзы:', d.getElementById('ahaTag').textContent.includes('Доля рутины') ? 'ok' : 'FAIL');
  console.log('09 финал: таблица людей:', d.getElementById('heroCompare').textContent.includes('Рутина человека') ? 'ok' : 'FAIL');
  // Линза «подписка» на финале — старт переключается, пересчёт, сравнение подписки
  w.eval('setLens("sub")');
  console.log('10 старт переключился на sub:', w.eval('start') === 'sub' ? 'ok' : 'FAIL');
  console.log('11 сравнение подписки на финале:', d.getElementById('heroCompare').textContent.includes('Подписка') ? 'ok' : 'FAIL');
  console.log('12 офферы не пропали:', d.getElementById('offerBox').style.display === 'block' ? 'ok' : 'FAIL');
  // Обратно во «время» — старт не трогаем (выбор клиента)
  w.eval('setLens("time")');
  console.log('13 линза время не трогает старт:', w.eval('start') === 'sub' ? 'ok' : 'FAIL');
  console.log('14 title вернулся к рутине:', d.getElementById('heroTitle').textContent.includes('рутина') ? 'ok' : 'FAIL');
  process.exit(0);
}, 800);
