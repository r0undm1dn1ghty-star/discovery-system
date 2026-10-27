// Дебаг: что в сравнении после выбора Pro
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'calculator.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/c.html', virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  w.eval('setLens("sub")');
  w.eval('chooseSub("pro")');
  w.eval('goals=["repeat"];goStep(5)');
  console.log('base:', w.eval('STARTS.find(x=>x.id==="sub").base'));
  console.log('COMPARE:', w.document.getElementById('heroCompare').textContent.replace(/\s+/g, ' ').slice(0, 200));
  process.exit(0);
}, 800);
