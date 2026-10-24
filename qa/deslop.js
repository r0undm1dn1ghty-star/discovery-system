// qa/deslop.js — чистка визуального нейрослопа по DS-DESIGN.md.
// Правила: пилюли → радиус 10px (круги-точки 50% не трогаем), заливные бейджи → обводные,
// фиолетовые акценты → брендовый изумруд, декоративные многоцветные градиенты → плоский цвет.
// Каждая правка печатается в журнал. Идемпотентно.
const fs = require('fs'); const path = require('path');
const REPO = path.resolve(__dirname, '..');
const pages = fs.readdirSync(REPO).filter(f => f.endsWith('.html') && f !== 'polygon.html');

// порядок важен: сначала точные многоцветные градиенты, потом общие радиусы
const RULES = [
  // 1. фиолет → бренд (его правило: purple→pink вон)
  ['виолет→изумруд', /--violet:\s*#c4a8ff/g, '--violet:#8fd6bb'],

  // 2. многоцветные декоративные градиенты → плоский цвет
  ['прогресс: accent+синий → accent', /linear-gradient\(90deg,var\(--accent\),#5da8e8\)/g, 'var(--accent)'],
  ['прогресс: красный+оранж → красный', /linear-gradient\(90deg,#ff5c5c,#f2b665\)/g, '#ff5c5c'],
  ['прогресс: зелёный+изумруд → изумруд', /linear-gradient\(90deg,#5ed9a8,#7bc4a8\)/g, '#7bc4a8'],
  ['полоса gap → полупрозрачный', /linear-gradient\(90deg,rgba\(123,196,168,\.55\),rgba\(123,196,168,\.28\)\)/g, 'rgba(123,196,168,.42)'],
  ['полоса gap-low → полупрозрачный', /linear-gradient\(90deg,rgba\(240,160,158,\.5\),rgba\(240,160,158,\.25\)\)/g, 'rgba(240,160,158,.38)'],

  // 3. заливной бейдж → обводной (фон прозрачный, текст акцентный)
  ['заливной бейдж .rec-badge → обводной',
    /(\.rec-badge\{[^}]*?)background:var\(--primary-l\);([^}]*?)color:#0e1220;/g,
    '$1background:transparent;border:1px solid var(--primary-l);$2color:var(--primary-l);'],

  // 4. пилюли → мягкий прямоугольник (круги-точки 50% и аватары не трогаем)
  ['пилюля 999px → 10px', /border-radius:\s*9999?px/g, 'border-radius:10px'],
  ['пилюля 100px → 8px', /border-radius:\s*100px/g, 'border-radius:8px'],
  ['капсула чипа 20px → 8px', /(\.head \.chip\{[^}]*?)border-radius:20px/g, '$1border-radius:8px'],

  // 5. прогресс-бары: маленький радиус вместо капсулы
  ['прогресс-бар капсула → 4px',
    /((?:\.pbar|\.pfill|\.vs-bar|\.vs-fill|\.checkbar \.pbar|\.checkbar \.pfill)[^{]*\{[^}]*?)border-radius:\s*(?:10px|999px|9999px|100px)/g,
    '$1border-radius:4px'],
];

let total = 0;
for (const page of pages) {
  const p = path.join(REPO, page);
  let s = fs.readFileSync(p, 'utf8');
  let log = [];
  for (const [label, re, to] of RULES) {
    const before = s;
    s = s.replace(re, to);
    if (s !== before) {
      const n = (before.match(re) || []).length;
      log.push(`${label} ×${n}`);
      total += n;
    }
  }
  if (log.length) { fs.writeFileSync(p, s, 'utf8'); console.log(`· ${page}: ${log.join(' | ')}`); }
}
console.log(`\nвсего правок: ${total}`);
