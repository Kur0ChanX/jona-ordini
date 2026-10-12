// D42: griglia di tutti i cocktail (scheda grande + lista) per guardarli a occhio. Uso: [DSF=2] [SOLO=Negroni,Mojito] node tools/bozze/griglia-cocktail.mjs <uscita.png> [larghezza]
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const src = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const a = src.indexOf('const brTinta='), b = src.indexOf('function brCk(){');
const code = src.slice(a, b);
const css = (src.match(/\.br-dis\{flex:none[^]*?\.br-ckbig \.br-dis\{[^}]*\}/) || [''])[0];
const wash = src.match(/<filter id="br-wash"[^]*?<\/filter>/)[0];
const dis = readFileSync(new URL('../../data/bar-disegni.json', import.meta.url), 'utf8');
const ck = JSON.parse(readFileSync(new URL('../../data/cocktail.json', import.meta.url), 'utf8')).c;
const W = +process.argv[3] || 2200, SOLO = process.env.SOLO ? process.env.SOLO.split(',') : null;
const html = `<!doctype html><meta charset="utf-8"><style>:root{--ink2:#3a302b;--vetro:#6F9EA6;--vetro2:#8DB5BB;--vetro3:#4D7F87}body{margin:0;background:#f7f2e8;font:11px system-ui;color:#3a302b;padding:10px;width:${W}px}
${css}.g{display:grid;grid-template-columns:repeat(${Math.floor(W / 150)},1fr);gap:4px}.it{text-align:center}.it .br-ckbig .br-dis{width:110px;height:110px}.it .br-ckbig{margin:0}.l{display:flex;justify-content:center}</style>
<svg width="0" height="0" style="position:absolute"><defs>${wash}</defs></svg><div class="g" id="g"></div>
<script>const BR_DIS=${dis};const CK=${JSON.stringify(ck.map(c => c[0]).filter(n => !SOLO || SOLO.includes(n)))};${code};
document.getElementById('g').innerHTML=CK.map(n=>'<div class="it"><div class="br-ckbig">'+brCkDis({n})+'</div><div class="l">'+brCkDis({n},'br-ckd')+'</div>'+n+'</div>').join('')</script>`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: W + 20, height: 800 }, deviceScaleFactor: +process.env.DSF || 1 });
await p.setContent(html); await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[2], fullPage: true }); await br.close();
