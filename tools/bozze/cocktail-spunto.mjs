// D42 spunto di Mario (#98, docs/img/sessione-98/spunto-cocktail-mario.jpg): bozza A Oggi / B Più vivaci / C Come lo spunto.
// B: colori del drink più pieni, guarnizioni del bordo più grandi (×1,35, tratto uguale). C: come B + vetro e ghiaccio a linea fine azzurrina.
// Uso: node tools/bozze/cocktail-spunto.mjs <uscita-senza-.png> [Nome,Nome…]  → <uscita>-1.png, -2.png… (3 cocktail per foto, 780 px)
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const src = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const code = src.slice(src.indexOf('const brTinta='), src.indexOf('function brCk(){'));
const css = src.match(/\.br-dis\{flex:none;width:44px[^]*?\.br-ckbig \.br-dis\{[^}]*\}/)[0];
const wash = src.match(/<filter id="br-wash"[^]*?<\/filter>/)[0];
const DIS = JSON.parse(readFileSync(new URL('../../data/bar-disegni.json', import.meta.url), 'utf8'));
const NOMI = (process.argv[3] || 'Mojito,Cosmopolitan,Old Fashioned,Margarita,Mai Tai,Piña Colada').split(',');
// vetro e ghiaccio: linee in un gruppo a parte (vd/vf), così C le colora come il vetro
const VETRO = /^(i|it|b|fr|cu)\|/;
for (const [id, p] of Object.entries(DIS.pz)) if (VETRO.test(id)) { if (p.d) { p.vd = p.d; delete p.d } if (p.f) { p.vf = p.f; delete p.f } }
const split = c => c.replace('<g class="ink">${B.d+all(\'d\')}</g>${B.f||ps.some(p=>p.f)?`<g class="ink br-f">${(B.f||\'\')+all(\'f\')}</g>`:\'\'}',
  '<g class="ink br-v">${B.d+all(\'vd\')}</g><g class="ink br-v br-f">${(B.f||\'\')+all(\'vf\')}</g><g class="ink">${all(\'d\')}</g><g class="ink br-f">${all(\'f\')}</g>');
if (split(code) === code) throw new Error('pezzo delle linee non trovato in brCkDis');
const S = 1.35;
const grande = c => c.replace('const brMove=(p,t)=>{const g=s=>`<g transform="translate(${t.replace(\',\',\' \')})">${s}</g>`,o={};for(const k in p)o[k]=Array.isArray(p[k])?p[k].map(w=>[w[0],g(w[1]),w[2]]):g(p[k]);return o};',
  `const brMove=(p,t)=>{const SW={d:'--sw,2px',f:'--swf,1.1px',h:'--swh,1.6px',vd:'--sw,2px',vf:'--swf,1.1px'},g=(s,k)=>\`<g transform="translate(\${t.replace(',',' ')}) scale(${S})"\${SW[k]?\` style="stroke-width:calc(var(\${SW[k]}) / ${S})"\`:''}>\${s}</g>\`,o={};for(const k in p)o[k]=Array.isArray(p[k])?p[k].map(w=>[w[0],g(w[1],k),w[2]]):g(p[k],k);return o};`)
  .replace('brTinta(col,255,.4)', 'brTinta(col,255,.18)');
if (grande(code) === code) throw new Error('brMove non trovato');
const V = { A: split(code), B: grande(split(code)), C: grande(split(code)) };
for (const k in V) V[k] = V[k].replace(/'br-l([gq])'\+/g, `'br-l$1${k}'+`);
// colori più pieni (HSL: saturazione su, luce un po' giù se molto chiara)
function viv(h) {
  let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let H = 0, Sa = 0, L = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; Sa = L > .5 ? d / (2 - mx - mn) : d / (mx + mn); H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; H /= 6 }
  Sa = Math.min(1, Sa * 1.6 + .1); L = L > .78 ? L - .05 : L * .97;
  const q = L < .5 ? L * (1 + Sa) : L + Sa - L * Sa, pp = 2 * L - q, t = x => { x = (x + 1) % 1; return x < 1 / 6 ? pp + (q - pp) * 6 * x : x < .5 ? q : x < 2 / 3 ? pp + (q - pp) * (2 / 3 - x) * 6 : pp };
  return '#' + [t(H + 1 / 3), t(H), t(H - 1 / 3)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
const DV = JSON.parse(JSON.stringify(DIS)); for (const n in DV.k) DV.k[n][1] = viv(DV.k[n][1]);
const html = `<!doctype html><meta charset="utf-8"><style>:root{--ink2:#3a302b}*{box-sizing:border-box}body{margin:0;background:#f7f2e8;font:13px system-ui;color:#3a302b;width:390px}
${css}
.br-dis .ink{stroke-width:var(--sw,2px)}.br-ck .ink.br-f{stroke-width:var(--swf,1.1px)}.br-ck .br-h{stroke-width:var(--swh,1.6px)}
/* C: tratto in pixel dello schermo (non cresce con la guarnizione ingrandita), vetro e ghiaccio azzurrini */
.vC .ink,.vC .ink *{vector-effect:non-scaling-stroke}
.vC .br-ckbig .ink,.vC .br-ckbig .ink *{stroke-width:2.1px!important}.vC .br-ckbig .br-f,.vC .br-ckbig .br-f *{stroke-width:1.1px!important}
.vC .br-ckbig .br-v,.vC .br-ckbig .br-v *{stroke:#6f9ea6;stroke-width:1.9px!important}.vC .br-ckbig .br-v.br-f,.vC .br-ckbig .br-v.br-f *{stroke:#8db5bb;stroke-width:1px!important}
.vC .br-ckd .ink,.vC .br-ckd .ink *{stroke-width:1.25px!important}.vC .br-ckd .br-f,.vC .br-ckd .br-f *{stroke-width:.7px!important}
.vC .br-ckd .br-v,.vC .br-ckd .br-v *{stroke:#4d7f87;stroke-width:1.2px!important}
.pg{padding:10px 6px 4px}.h{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;font-weight:700;font-size:13px;margin-bottom:2px}
.h small{display:block;font-weight:400;color:#7a6d63;font-size:11px}.r{display:grid;grid-template-columns:repeat(3,1fr);padding:30px 0 4px}
.it{text-align:center}.it .br-ckbig{margin:0}.it .br-ckbig .br-dis{width:112px;height:112px}.l{display:flex;justify-content:center;margin-top:14px}
.n{text-align:center;font-weight:700;font-size:14px;padding-top:6px;border-top:1px solid #e3d9c8}.pn{text-align:right;color:#9a8d80;font-size:11px;padding:2px 4px}</style>
<svg width="0" height="0" style="position:absolute"><defs>${wash}</defs></svg><div id="out"></div>
<script>const NOMI=${JSON.stringify(NOMI)},DIS=${JSON.stringify(DIS)},DV=${JSON.stringify(DV)};
const F={};${Object.entries(V).map(([k, c]) => `F.${k}=(function(BR_DIS){${c};return brCkDis})(${k === 'A' ? 'DIS' : 'DV'});`).join('\n')}
const fogli=[];for(let i=0;i<NOMI.length;i+=3)fogli.push(NOMI.slice(i,i+3));
document.getElementById('out').innerHTML=fogli.map((f,j)=>'<div class="pg" id="p'+j+'"><div class="h"><div>A · Oggi<small>com\\'è adesso</small></div><div>B · Più vivaci<small>colori e guarnizioni</small></div><div>C · Come lo spunto<small>+ vetro fine azzurro</small></div></div>'
 +f.map(n=>'<div class="n">'+n+'</div><div class="r">'+['A','B','C'].map(v=>'<div class="it v'+v+'"><div class="br-ckbig">'+F[v]({n})+'</div><div class="l">'+F[v]({n},'br-ckd')+'</div></div>').join('')+'</div>').join('')
 +'<div class="pn">'+(j+1)+' di '+fogli.length+'</div></div>').join('')</script>`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.waitForTimeout(300);
const n = await p.locator('.pg').count();
for (let i = 0; i < n; i++) await p.locator('#p' + i).screenshot({ path: `${process.argv[2]}-${i + 1}.png` });
await br.close(); console.log(n, 'foto');
