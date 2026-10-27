// Проверка шага 1.5: выбор подписки меняет базу, статус даёт юридический блок на финале
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  const d = w.document;
  // Линза «плачу подписке» → старт sub → появляется выбор подписки
  w.eval('setLens("sub")');
  console.log('01 выбор подписки показан:', d.getElementById('subPickWrap').style.display !== 'none' ? 'ok' : 'FAIL');
  console.log('02 пять подписок в списке:', d.querySelectorAll('#subPick .opt').length === 5 ? 'ok' : 'FAIL');
  console.log('03 дефолт — Plus (2 000):', w.eval('STARTS.find(x=>x.id==="sub").base') === 2000 ? 'ok' : 'FAIL');
  // Выбор Pro за 20К — база и сравнение меняются
  w.eval('chooseSub("pro")');
  console.log('04 выбрал Pro — база 20 000:', w.eval('STARTS.find(x=>x.id==="sub").base') === 20000 ? 'ok' : 'FAIL');
  console.log('05 подпись сравнения:', w.eval('JSON.stringify(subName)').includes('Pro') ? 'ok' : 'FAIL');
  w.eval('goals=["repeat"];goStep(5)');
  console.log('06 сравнение против 20К:', d.getElementById('heroCompare').textContent.replace(/\s+/g, ' ').includes('20 000') ? 'ok' : 'FAIL');
  console.log('07 legalBox появился (статус не выбран):', d.getElementById('legalBox').textContent.includes('Статус не выбран') ? 'ok' : 'FAIL');
  // Статусы: бизнес без формы → риск; ИП → РКН; личное → спокойно
  w.eval('setUse("business");setTax("fiz")');
  console.log('08 бизнес+физлицо: предупреждение:', d.getElementById('legalBox').textContent.includes('Freemium') ? 'ok' : 'FAIL');
  w.eval('setTax("ip")');
  console.log('09 ИП: РКН и затраты:', d.getElementById('legalBox').textContent.includes('РКН') ? 'ok' : 'FAIL');
  w.eval('setUse("personal")');
  console.log('10 личное: спокойно:', d.getElementById('legalBox').textContent.includes('152-ФЗ не про тебя') ? 'ok' : 'FAIL');
  console.log('11 дисклеймер есть:', d.getElementById('legalBox').textContent.includes('не юрконсультация') ? 'ok' : 'FAIL');
  console.log('12 строка-подсказка на шаге 1 живая:', d.getElementById('legalHint').textContent.length > 10 ? 'ok' : 'FAIL');
  process.exit(0);
}, 800);
