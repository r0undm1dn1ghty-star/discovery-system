const r = require('../qa/mobile-360.json');
for (const [p, d] of Object.entries(r)) {
  console.log(p.padEnd(30), 'vw=' + d.vw, 'scrollW=' + d.scrollW, 'meta=' + JSON.stringify(d.viewportMeta), 'bodyFont=' + d.bodyFont, 'h1=' + d.h1, 'nodes=' + d.nodes);
}
