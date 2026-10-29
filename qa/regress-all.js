// Полный регресс после фиксов роя
const { execSync } = require('child_process');
const run = (cmd) => { try { return execSync(cmd, { encoding: 'utf8', timeout: 120000, cwd: __dirname }); } catch (e) { return (e.stdout || '') + 'ERR:' + e.status; } };
console.log('=== WIZARD ===');
console.log(run('node wizard-check.js').split('\n').filter(l => l.includes('FAIL')).join('\n') || 'все ok');
console.log('=== LENS ===');
console.log(run('node lens-check.js').split('\n').filter(l => l.includes('FAIL')).join('\n') || 'все ok');
console.log('=== LEGAL ===');
console.log(run('node legal-check.js').split('\n').filter(l => l.includes('FAIL')).join('\n') || 'все ok');
console.log('=== ECON ===');
console.log(run('node qa-econ.js').split('\n').slice(-2).join(' | '));
console.log('=== FINAL-FIX ===');
console.log(run('node final-fix-check.js').split('\n').slice(0, 2).join(' | '));
console.log('=== HONEST (таблица людей) ===');
console.log(run('node honest-check.js').split('\n')[2].slice(0, 120));
console.log('=== AUTO-PICK ===');
console.log(run('node auto-pick-check.js').split('\n').slice(0, 3).join(' | '));
process.exit(0);
