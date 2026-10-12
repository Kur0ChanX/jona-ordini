// Bozza #114 «cocktail bellissimi» (idea SMART da #100): 3 cocktail disegnati a mano con luce, vetro trasparente,
// ghiaccio che rifrange, frutta dentro il bicchiere, goccioline e linee colorate (mai nere), per confronto con l'app.
// Non tocca l'app. Uso: node tools/bozze/cocktail-bellissimi.mjs <cartella>  (servono <cartella>/oggi-<Nome>.png)
// → <cartella>/prova-bellissimi.png (780 px, foto da telefono) e prova-<Nome>.svg
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const DIR = process.argv[2] || '.';

// --- pezzi comuni -------------------------------------------------------------------------------
const defs = id => `
<linearGradient id="${id}vetro" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".22" stop-color="#e6f1f2" stop-opacity=".25"/><stop offset=".7" stop-color="#e6f1f2" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient>
<radialGradient id="${id}ombra"><stop offset="0" stop-color="#5a4a3c" stop-opacity=".28"/><stop offset="1" stop-color="#5a4a3c" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}luce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".95"/><stop offset=".8" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}ghi" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></radialGradient>
<radialGradient id="${id}spic" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffc04a"/><stop offset="1" stop-color="#ff9a1f"/></radialGradient>
<radialGradient id="${id}spicL" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#f4ffd0"/><stop offset=".55" stop-color="#b8e04e"/><stop offset="1" stop-color="#86c22a"/></radialGradient>
<linearGradient id="${id}foglia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fd46a"/><stop offset=".6" stop-color="#3fa04a"/><stop offset="1" stop-color="#23753a"/></linearGradient>
<filter id="${id}acq" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="9"/><feGaussianBlur stdDeviation=".6"/></filter>`;

// ruota d'agrume: peel colore buccia, polpa con gradiente, albedo bianco tra gli spicchi
function ruota(id, cx, cy, r, buccia, grad, bordo, mezza = false) {
  const n = 9, sp = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + .05, a1 = ((i + 1) / n) * Math.PI * 2 - .05, rr = r * .74;
    if (mezza && (a0 > Math.PI + .01 || a1 < 0)) continue;
    const p = (a, k) => `${(cx + Math.cos(a) * rr * k).toFixed(2)} ${(cy + Math.sin(a) * rr * k).toFixed(2)}`;
    sp.push(`<path d="M${p((a0 + a1) / 2, .1)}L${p(a0, 1)}A${rr} ${rr} 0 0 1 ${p(a1, 1)}Z" fill="url(#${id}${grad})"/>`);
    // vescicole: due punti chiari per spicchio
    sp.push(`<circle cx="${p((a0 + a1) / 2, .6).split(' ')[0]}" cy="${p((a0 + a1) / 2, .6).split(' ')[1]}" r="${(r * .06).toFixed(2)}" fill="#fff" opacity=".55"/>`);
  }
  const clip = mezza ? `<clipPath id="${id}m${cx | 0}"><rect x="${cx - r - 1}" y="${cy}" width="${2 * r + 2}" height="${r + 1}"/></clipPath>` : '';
  const cp = mezza ? ` clip-path="url(#${id}m${cx | 0})"` : '';
  return `${clip}<g${cp}><circle cx="${cx}" cy="${cy}" r="${r}" fill="${buccia}" stroke="${bordo}" stroke-width=".7"/>
<circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="#fffaf0"/>${sp.join('')}
<circle cx="${cx}" cy="${cy}" r="${r * .1}" fill="#fffaf0"/>
<path d="M${cx - r * .7} ${cy - r * .55}A${r * .9} ${r * .9} 0 0 1 ${cx - r * .1} ${cy - r * .88}" fill="none" stroke="#fff" stroke-width="${r * .09}" stroke-linecap="round" opacity=".7"/></g>`;
}
// foglia di menta con venature
function foglia(id, x, y, l, rot, scuro = '#23753a') {
  const w = l * .42;
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C${w} ${-l * .2} ${w * .9} ${-l * .8} 0 ${-l}C${-w * .9} ${-l * .8} ${-w} ${-l * .2} 0 0Z" fill="url(#${id}foglia)" stroke="${scuro}" stroke-width=".55"/>
<path d="M0 -1V${-l * .92}" stroke="${scuro}" stroke-width=".5" opacity=".7"/>${[.3, .5, .7].map(k => `<path d="M0 ${-l * k}l${w * .55} ${-l * .13}M0 ${-l * k}l${-w * .55} ${-l * .13}" stroke="${scuro}" stroke-width=".35" opacity=".55" fill="none"/>`).join('')}
<path d="M${-w * .35} ${-l * .35}Q${-w * .45} ${-l * .6} ${-w * .15} ${-l * .82}" stroke="#fff" stroke-width=".9" opacity=".45" fill="none" stroke-linecap="round"/></g>`;
}
// cubetto trasparente: facce chiare, spigoli luminosi, rifrazione del colore del drink
function cubo(id, x, y, s, rot, drink, k = 1) {
  const r = s * .16;
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${r}" fill="${drink}" opacity=".35"/>
<rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${r}" fill="url(#${id}ghi)" fill-opacity="${k}" stroke="#fff" stroke-opacity=".9" stroke-width=".7"/>
<path d="M${-s / 2 + r} ${-s / 2 + s * .28}H${s / 2 - r * .6}M${-s / 2 + s * .3} ${-s / 2 + r}V${s / 2 - r}" stroke="#fff" stroke-opacity=".55" stroke-width=".5"/>
<path d="M${-s / 2 + s * .12} ${-s / 2 + s * .5}Q${-s / 2 + s * .12} ${-s / 2 + s * .12} ${-s / 2 + s * .5} ${-s / 2 + s * .12}" fill="none" stroke="#fff" stroke-width="${s * .07}" stroke-linecap="round" opacity=".9"/></g>`;
}
const bolle = (pts, col) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".85" stroke-width=".4"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .3}" fill="#fff" opacity=".9"/>`).join('');
const gocce = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * .8}" ry="${r}" fill="#fff" fill-opacity=".55" stroke="#7fa7ae" stroke-opacity=".5" stroke-width=".35"/><circle cx="${x - r * .25}" cy="${y - r * .35}" r="${r * .25}" fill="#fff"/>`).join('');
// riflesso a pennello (spessore che cambia): una forma piena, non una linea
const luce = (id, x, y1, y2, w, curva = 0) => `<path d="M${x} ${y1}Q${x - w + curva} ${(y1 + y2) / 2} ${x} ${y2}Q${x + w * .2 + curva} ${(y1 + y2) / 2} ${x} ${y1}Z" fill="url(#${id}luce)"/>`;
const svg = (id, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 4 84 140" class="bel"><defs>${defs(id)}${extra}</defs>${body}</svg>`;

// --- SPRITZ: calice, arancione caldo, bollicine, fetta d'arancia dentro e sul bordo ----------------
function spritz() {
  const id = 'sp', bowl = 'M33 30C32 64 44 82 60 84C76 82 88 64 87 30Z';
  return svg(id, `
<ellipse cx="62" cy="62" rx="42" ry="34" fill="#ffb877" opacity=".45" filter="url(#${id}acq)"/>
<ellipse cx="60" cy="136" rx="30" ry="5" fill="url(#${id}ombra)"/>
<path d="M58.4 83L57.6 131H62.4L61.6 83Z" fill="url(#${id}vetro)" stroke="#8fb3ba" stroke-width=".7"/>
<ellipse cx="60" cy="132" rx="21" ry="3.6" fill="url(#${id}vetro)" stroke="#8fb3ba" stroke-width=".8"/>
<path d="M44 131.5Q60 129 76 131.5" stroke="#fff" stroke-width="1" fill="none" opacity=".9"/>
<g clip-path="url(#${id}bowl)"><rect x="30" y="41" width="60" height="45" fill="url(#${id}liq)"/>
${ruota(id, 50, 62, 12, '#f28a1b', 'spic', '#c9650f')}
<rect x="30" y="41" width="60" height="45" fill="url(#${id}liq)" opacity=".45"/>
${cubo(id, 70, 56, 13, 14, '#ffd09a')}${cubo(id, 63, 70, 11, -10, '#ffd09a')}
${bolle([[44, 50, 1.1], [47, 75, .8], [57, 47, .7], [74, 72, .9], [79, 49, 1.2], [66, 79, .6], [41, 64, .7], [76, 61, .6]])}
<ellipse cx="60" cy="41.5" rx="26.4" ry="2.6" fill="#ffd6a0" stroke="#fff" stroke-opacity=".8" stroke-width=".5"/>
${bolle([[52, 41.5, .7], [66, 42, .6], [72, 41.2, .5]])}</g>
<path d="${bowl}" fill="url(#${id}vetro)" stroke="#8fb3ba" stroke-width=".9"/>
${luce(id, 38, 36, 66, 3.5, -1)}${luce(id, 82.5, 38, 56, -1.6)}
${ruota(id, 85, 28, 12, '#f28a1b', 'spic', '#c9650f')}
<path d="M33 30A27 3.4 0 0 0 87 30" fill="none" stroke="#8fb3ba" stroke-width=".9"/>
<path d="M33 30A27 3.4 0 0 1 87 30" fill="none" stroke="#8fb3ba" stroke-width=".6" opacity=".7"/>
${gocce([[36.5, 52, 1.1], [84, 63, .9], [40, 70, .7]])}`,
    `<clipPath id="${id}bowl"><path d="${bowl}"/></clipPath>
<linearGradient id="${id}liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb24a"/><stop offset=".55" stop-color="#f6732a"/><stop offset="1" stop-color="#d9481a"/></linearGradient>`);
}

// --- MOJITO: highball, verde chiaro, ghiaccio tritato, menta e lime DENTRO, zucchero sul fondo -----
function mojito() {
  const id = 'mo', body = 'M38 20L41.5 132Q41.7 136 45.5 136H74.5Q78.3 136 78.5 132L82 20Z';
  const ghiaccio = [];
  const R = [[47, 40, 8, 12], [62, 34, 9, -8], [73, 44, 8, 25], [52, 56, 9, -20], [68, 60, 8, 8], [46, 76, 7, 30], [60, 82, 9, -5], [72, 90, 7, -25], [50, 100, 8, 12], [66, 106, 7, 40], [57, 118, 6, -15]];
  for (const [x, y, s, r] of R) ghiaccio.push(cubo(id, x, y, s, r, '#e9f6c8'));
  const zucchero = []; for (let i = 0; i < 46; i++) { const x = 44 + (i * 37 % 32), y = 126 + (i * 13 % 7); zucchero.push(`<circle cx="${x}" cy="${y}" r="${.45 + (i % 3) * .2}" fill="${['#c98a3a', '#e3b066', '#a8682a'][i % 3]}"/>`) }
  return svg(id, `
<ellipse cx="60" cy="80" rx="36" ry="52" fill="#cfe7a0" opacity=".45" filter="url(#${id}acq)"/>
<ellipse cx="60" cy="138" rx="27" ry="4.5" fill="url(#${id}ombra)"/>
<g clip-path="url(#${id}body)"><rect x="35" y="28" width="50" height="99" fill="url(#${id}liq)"/>
${zucchero.join('')}
${foglia(id, 50, 120, 15, -50)}${foglia(id, 66, 112, 14, 35)}${foglia(id, 56, 96, 13, 70)}
${ruota(id, 64, 76, 9, '#5a9a1e', 'spicL', '#3f7a12', true)}${ruota(id, 50, 64, 8.5, '#5a9a1e', 'spicL', '#3f7a12')}
${foglia(id, 70, 70, 12, -35)}
${ghiaccio.join('')}
${bolle([[44, 112, .8], [70, 120, .6], [75, 98, .9], [45, 88, .6], [62, 50, .7], [76, 66, .5], [55, 72, .6], [48, 30, .6], [73, 32, .8]])}
<rect x="35" y="27" width="50" height="2.2" fill="#f2f9de" opacity=".9"/></g>
<path d="M41.6 127.5H78.4L78.5 132Q78.3 136 74.5 136H45.5Q41.7 136 41.5 132Z" fill="#fff" fill-opacity=".5"/>
<path d="${body}" fill="url(#${id}vetro)" stroke="#8fb3ba" stroke-width=".9"/>
${luce(id, 42, 26, 120, 3.5)}${luce(id, 78, 30, 80, -1.6)}
<g transform="rotate(16 66 60)"><rect x="64.5" y="2" width="4" height="78" rx="1" fill="#f5f1e8" stroke="#3f7a12" stroke-opacity=".5" stroke-width=".4"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M64.5 ${6 + i * 9}l4 4v3l-4 -4z" fill="#59a34a" opacity=".85"/>`).join('')}<rect x="65" y="2" width="1" height="78" fill="#fff" opacity=".6"/></g>
${ruota(id, 41, 20, 10.5, '#5a9a1e', 'spicL', '#3f7a12')}
<ellipse cx="60" cy="20" rx="22" ry="2.6" fill="none" stroke="#8fb3ba" stroke-width=".8"/>
${foglia(id, 72, 18, 13, 25)}${foglia(id, 72, 18, 15, -10)}${foglia(id, 72, 18, 11, -45)}${foglia(id, 71, 19, 10, 60)}
${gocce([[39.8, 50, 1.1], [80.6, 62, .9], [40.6, 92, .8], [79.8, 104, 1.2], [80.4, 40, .6]])}`,
    `<clipPath id="${id}body"><path d="M39.2 20L42.6 127.5H77.4L80.8 20Z"/></clipPath>
<linearGradient id="${id}liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f8d8"/><stop offset=".6" stop-color="#d5ea9e"/><stop offset="1" stop-color="#b9d777"/></linearGradient>`);
}

// --- NEGRONI: bicchiere basso col fondo spesso, rosso rubino, un cubo grande, mezza fetta e scorza -
function negroni() {
  const id = 'ne', body = 'M31 62L34.5 132Q34.8 136 39 136H81Q85.2 136 85.5 132L89 62Z';
  return svg(id, `
<ellipse cx="60" cy="100" rx="40" ry="34" fill="#f07e88" opacity=".42" filter="url(#${id}acq)"/>
<ellipse cx="60" cy="138" rx="33" ry="5" fill="url(#${id}ombra)"/>
<g clip-path="url(#${id}body)"><rect x="28" y="74" width="64" height="50" fill="url(#${id}liq)"/>
<ellipse cx="54" cy="100" rx="20" ry="16" fill="url(#${id}rubino)"/>
<g transform="translate(70 104) rotate(-18)"><path d="M-14 0C-8 -6 6 -6 14 -1C8 2 -6 3 -14 0Z" fill="#f28a1b" stroke="#b8560c" stroke-width=".5"/><path d="M-12 -.5C-6 -3.5 5 -3.5 11 -1" stroke="#ffe0a8" stroke-width=".8" fill="none"/>${[-8, -3, 2, 7].map(x => `<circle cx="${x}" cy="-1.6" r=".35" fill="#b8560c"/>`).join('')}</g>
${cubo(id, 54, 99, 24, -7, '#e0384a', .45)}
${bolle([[44, 112, .6], [74, 86, .5], [48, 82, .5]])}
<ellipse cx="60" cy="74.4" rx="28" ry="2.8" fill="#d63a48" stroke="#ff9aa2" stroke-width=".5"/>
<path d="M40 74.2Q60 72.6 78 74.4" stroke="#fff" stroke-width=".6" opacity=".6" fill="none"/></g>
<path d="M34.9 124H85.1L85.5 132Q85.2 136 81 136H39Q34.8 136 34.5 132Z" fill="#fff" fill-opacity=".55"/>
<path d="M35.6 125Q60 127 84.4 125" stroke="#9cbfc5" stroke-width=".5" fill="none"/>
<path d="${body}" fill="url(#${id}vetro)" stroke="#8fb3ba" stroke-width=".9"/>
${luce(id, 35.5, 66, 128, 3.8)}${luce(id, 84.5, 70, 100, -1.6)}
${ruota(id, 85, 58, 12, '#f28a1b', 'spic', '#c9650f')}
<ellipse cx="60" cy="62" rx="29" ry="3.2" fill="none" stroke="#8fb3ba" stroke-width=".8"/>
${gocce([[33.6, 88, 1.1], [86.6, 96, .9], [34.8, 112, .7], [85.6, 116, 1.1]])}`,
    `<clipPath id="${id}body"><path d="M32.2 62L35 124H85L87.8 62Z"/></clipPath>
<linearGradient id="${id}liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8202f"/><stop offset=".55" stop-color="#9a0f24"/><stop offset="1" stop-color="#5e0716"/></linearGradient>
<radialGradient id="${id}rubino"><stop offset="0" stop-color="#ff6a6a" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a6a" stop-opacity="0"/></radialGradient>`);
}

const PROVE = { Spritz: spritz(), Mojito: mojito(), Negroni: negroni() };
for (const [n, s] of Object.entries(PROVE)) writeFileSync(`${DIR}/prova-${n}.svg`, s);
const img = n => 'data:image/png;base64,' + readFileSync(`${DIR}/oggi-${n}.png`).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#fff;font:13px system-ui;color:#3a302b;width:390px}
.t{padding:14px 12px 4px;font-weight:800;font-size:16px}.t small{display:block;font-weight:400;font-size:12px;color:#7a6d63}
.h{display:grid;grid-template-columns:1fr 1fr;text-align:center;font-weight:700;padding:6px 0 0}.h small{display:block;font-weight:400;color:#7a6d63;font-size:11px}
.n{text-align:center;font-weight:700;font-size:14px;padding-top:8px;margin:6px 10px 0;border-top:1px solid #e3d9c8}
.r{display:grid;grid-template-columns:1fr 1fr;align-items:end;padding:2px 0 6px}.c{display:flex;flex-direction:column;align-items:center;gap:6px}
.c img{height:130px;width:auto}.c svg.bel{width:170px;height:212px}.c .pic{display:flex;gap:6px;align-items:center;font-size:11px;color:#7a6d63}
.c .pic img,.c .pic svg{width:44px;height:44px}.pn{text-align:right;color:#9a8d80;font-size:11px;padding:4px 8px}</style>
<div class="t">Cocktail più belli · prova<small>A sinistra com'è oggi, a destra la prova. L'app non è cambiata.</small></div>
<div class="h"><div>Oggi</div><div>Prova<small>luce, vetro, frutta dentro</small></div></div>
${Object.keys(PROVE).map(n => `<div class="n">${n}</div><div class="r"><div class="c"><img src="${img(n)}"><div class="pic"><img src="${img(n)}">nella lista</div></div><div class="c">${PROVE[n]}<div class="pic">${PROVE[n].replace(/id="(\w+)"/g, 'id="$1L"').replace(/url\(#(\w+)\)/g, 'url(#$1L)').replace(/filter="url\(#\w+acqL\)"/g, '')}nella lista</div></div></div>`).join('')}
<div class="pn">1 di 1</div>`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 390, height: 600 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.waitForTimeout(300);
await p.screenshot({ path: `${DIR}/prova-bellissimi.png`, fullPage: true });
await br.close();
console.log('ok', `${DIR}/prova-bellissimi.png`);
