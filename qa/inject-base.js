// qa/inject-base.js — codemod: подключает ds-base.css ПОСЛЕДНИМ в <head> каждой страницы.
// Идемпотентно. Отчёт: где вставлено, есть ли <style> после </head> (он перебьёт слой),
// какие страницы вообще без <style>.
const fs = require('fs'); const path = require('path');
const REPO = path.resolve(__dirname, '..');
const LINK = '<link rel="stylesheet" href="ds-base.css"/>\n';
const SKIP = new Set(['polygon.html']);
const pages = fs.readdirSync(REPO).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();

let changed = 0; const risky = [];
for (const page of pages) {
  const p = path.join(REPO, page);
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('ds-base.css')) { console.log('· уже есть  ' + page); continue; }
  const headEnd = s.indexOf('</head>');
  if (headEnd < 0) { console.log('!! нет </head> ' + page); continue; }
  // есть ли <style> в body (после head) — он перебьёт наш слой
  const afterHead = s.slice(headEnd + 7);
  if (/<style/i.test(afterHead)) risky.push(page + ' (style в body)');
  s = s.slice(0, headEnd) + LINK + s.slice(headEnd);
  fs.writeFileSync(p, s, 'utf8');
  changed++;
  const inline = (s.match(/<style/gi) || []).length;
  console.log(`· вставлено ${page}  (inline <style>: ${inline})`);
}
console.log('\nстраниц обновлено: ' + changed + ' из ' + pages.length);
if (risky.length) console.log('ВНИМАНИЕ, слой может не победить: ' + risky.join(', '));
