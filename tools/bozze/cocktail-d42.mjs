// Bozze D42: cocktail più dettagliati (solo per l'immagine di confronto, non va nell'app)
import { readFileSync, writeFileSync } from 'fs';
const J = JSON.parse(readFileSync('/home/user/jona-ordini/data/bar-disegni.json', 'utf8'));
const OUT = process.argv[2];
const f = n => +(+n).toFixed(1);
// ── OGGI (come brCkDis nell'app)
function oggi(n) {
  const k = J.k[n], B = J.b[k[0]], ps = k.slice(2).map(x => J.pz[x]).filter(Boolean);
  const w = [[B.op || k[1], `<path d="${B.l}"/>`]].concat(...ps.map(x => x.w || []));
  return `<svg class="br-dis" viewBox="0 0 64 64">${w.map(x => `<g class="wa" transform="translate(1.5 1.5)" fill="${x[0]}">${x[1]}</g>`).join('')}<g class="ink">${B.d + ps.map(x => x.d || '').join('')}</g><g class="inkp">${ps.map(x => x.p || '').join('')}</g></svg>`;
}
// ── pezzi comuni delle bozze
const wash = (c, s, op = .62) => `<g class="wa" style="opacity:${op}" fill="${c}">${s}</g>`;
const ink = (s, w = 2) => `<g class="ink" style="stroke-width:${w}">${s}</g>`;
const fine = s => ink(s, 1.1);
const dots = (pts, r = .7) => `<g class="inkp">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
const hi = (d, w = 1.6, op = .85) => `<path d="${d}" style="fill:none;stroke:#fff;stroke-width:${w};stroke-linecap:round;opacity:${op}"/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="1.8" style="fill:#2a2420;opacity:.13"/>`;
// cubetto con le facce (davanti, sopra, lato) e un riflesso
function cube(x, y, s = 5, a = 0) {
  const g = `<g transform="translate(${x} ${y}) rotate(${a})">`;
  const front = `M${-s} ${-s * .6}L${s * .7} ${-s * .8}L${s * .8} ${s}L${-s * .9} ${s}Z`;
  const top = `M${-s} ${-s * .6}L${-s * .4} ${-s * 1.3}L${s * 1.2} ${-s * 1.4}L${s * .7} ${-s * .8}Z`;
  const side = `M${s * .7} ${-s * .8}L${s * 1.2} ${-s * 1.4}L${s * 1.3} ${s * .3}L${s * .8} ${s}Z`;
  return { w: `${g}<path d="${top}" style="fill:#fff;opacity:.55"/><path d="${side}" style="fill:#fff;opacity:.25"/></g>`,
    d: `${g}<path d="${front}"/><path d="${top}"/><path d="${side}"/></g>`, h: `${g}${hi(`M${-s * .6} ${-s * .2}L${-s * .5} ${s * .5}`, 1.1, .9)}</g>` };
}
// fetta d'agrume tonda vista di fronte, con buccia, polpa e spicchi
function wheel(cx, cy, r, peel, pulp, n = 8, a = 0) {
  const sp = Array.from({ length: n }, (_, i) => { const t = (a + i * 360 / n) * Math.PI / 180; return `M${f(cx + r * .18 * Math.cos(t))} ${f(cy + r * .18 * Math.sin(t))}L${f(cx + r * .76 * Math.cos(t))} ${f(cy + r * .76 * Math.sin(t))}`; }).join('');
  return wash(peel, `<circle cx="${cx}" cy="${cy}" r="${r}"/>`, .75) + wash(pulp, `<circle cx="${cx}" cy="${cy}" r="${r * .82}"/>`, .7)
    + ink(`<circle cx="${cx}" cy="${cy}" r="${r}"/>`, 1.6) + fine(`<circle cx="${cx}" cy="${cy}" r="${r * .82}"/><path d="${sp}"/>`) + dots([[cx, cy]], .6);
}
// mezza fetta (spicchio d'arancia sul bordo): semicerchio
function half(cx, cy, r, peel, pulp, a = 0, n = 5) {
  const arc = (rr) => `M${cx - rr} ${cy}A${rr} ${rr} 0 0 0 ${cx + rr} ${cy}Z`;
  const sp = Array.from({ length: n - 1 }, (_, i) => { const t = (i + 1) * 180 / n * Math.PI / 180; return `M${cx} ${cy}L${f(cx + r * .8 * Math.cos(t))} ${f(cy + r * .8 * Math.sin(t))}`; }).join('');
  return `<g transform="rotate(${a} ${cx} ${cy})">` + wash(peel, `<path d="${arc(r)}"/>`, .8) + wash(pulp, `<path d="${arc(r * .82)}"/>`, .7)
    + ink(`<path d="${arc(r)}"/>`, 1.6) + fine(`<path d="${arc(r * .82)}"/><path d="${sp}"/>`) + '</g>';
}
// foglia di menta con nervature
function leaf(x, y, a, s = 1, c = '#5FAE6E') {
  const L = 'M0 0C5-7 15-8 22-1C15 6 5 6 0 0Z';
  const v = 'M1 0L20-1M6 0L9-4M11-.3L14-4.4M6 .4L9 3.6M11 .2L14 3.8';
  return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${wash(c, `<path d="${L}"/>`, .8)}<g class="ink" style="stroke-width:${f(1.5 / s)}"><path d="${L}"/></g><g class="ink" style="stroke-width:${f(.8 / s)}"><path d="${v}"/></g></g>`;
}
const bean = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})">${wash('#4A2C1E', '<ellipse rx="3" ry="2"/>', .95)}${ink('<ellipse rx="3" ry="2"/>', 1.2)}${fine('<path d="M-2.4 .3C-1 -.8 1 1 2.4 -.3"/>')}${hi('M-1.8 -1.1L.2 -1.5', .7, .8)}</g>`;
const drops = pts => pts.map(([x, y, r = .9]) => `<g><ellipse cx="${x}" cy="${y}" rx="${r * .8}" ry="${r}" style="fill:#fff;opacity:.8"/><ellipse cx="${x}" cy="${y}" rx="${r * .8}" ry="${r}" class="ink" style="stroke-width:.6"/></g>`).join('');
const bubbles = pts => pts.map(([x, y, r = .9]) => `<circle cx="${x}" cy="${y}" r="${r}" class="ink" style="stroke-width:.6;fill:#fff;fill-opacity:.5"/>`).join('');
const svg = (body, defs) => `<svg class="br-dis" viewBox="0 0 64 64">${defs || ""}${body}</svg>`;
// gradiente verticale del liquido (solo stile C)
let gid = 0;
const grad = (top, bot) => { const id = 'lg' + (++gid); return { id, def: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>` }; };
const splash = (c, d) => `<g style="opacity:.4" fill="${c}"><g class="wa"><path d="${d}"/></g></g>`;

// ── NEGRONI (Old fashioned)
function negroni(C) {
  const liq = 'M15.8 33L18 54H46L48.2 33Z';
  const g = C && grad('#D2484A', '#8E2A2E');
  const ic1 = cube(25, 40, 5.2, -8), ic2 = cube(37, 43, 5, 10);
  return svg(
    (C ? splash('#E8A07A', 'M6 46C4 34 14 26 26 30C36 22 54 24 58 36C62 48 52 58 40 57C28 62 10 58 6 46Z') : '')
    + shadow(32, 59.6, 17)
    + (C ? `<path d="${liq}" fill="url(#${g.id})" style="opacity:.85"/>` : wash('#B2393D', `<path d="${liq}"/>`, .7))
    + wash('#E26A5E', '<ellipse cx="32" cy="33" rx="16.2" ry="2"/>', .8)
    + ic1.w + ic2.w + ink(ic1.d + ic2.d, 1.3) + ic1.h + ic2.h
    + wash('#fff', 'M18 54H46L46 58H18Z', .35)
    + ink('<path d="M15 24L18 58H46L49 24"/><ellipse cx="32" cy="24" rx="17" ry="2.2"/>', 2)
    + fine('<path d="M16.7 25.5L19.2 54.5H44.8L47.3 25.5M15.8 33Q32 37 48.2 33"/>')
    + hi('M19.6 28L21.6 51', 1.8) + hi('M44.6 30L43.6 44', 1, .6)
    + (C ? fine('<path d="M24 56.5L26 54.5M28 56.5L30 54.5M32 56.5L34 54.5M36 56.5L38 54.5"/>') : '')
    + half(44, 25, 9.5, '#F0A23A', '#F7C266', -18)
    + (C ? drops([[23, 47], [42, 50, 1], [40, 38, .8]]) : '')
  , C && g.def);
}
// ── MOJITO (Highball)
function mojito(C) {
  const liq = 'M20.5 15L22 56H42L43.5 15Z';
  const g = C && grad('#E4F0C8', '#9EC07A');
  const ice = [[27, 22, 3.2, 10], [36, 25, 3, -15], [30, 31, 3.1, 25], [38, 35, 2.8, 0], [27, 40, 3, -20]].map(([x, y, s, a]) => cube(x, y, s, a));
  return svg(
    (C ? splash('#9CCB8A', 'M8 30C6 16 20 8 32 12C46 6 60 16 56 32C60 46 48 58 34 56C18 60 8 46 8 30Z') : '')
    + shadow(32, 60.5, 13)
    + (C ? `<path d="${liq}" fill="url(#${g.id})" style="opacity:.85"/>` : wash('#C5D79A', `<path d="${liq}"/>`, .65))
    + leaf(23, 50, -30, .45, '#4E9A5E') + leaf(40, 47, 200, .42, '#4E9A5E') + leaf(28, 45, 20, .38, '#5FAE6E')
    + wash('#8DB33A', '<path d="M30 49L38 44L39 52Z"/>', .8) + fine('<path d="M30 49L38 44L39 52Z"/>')
    + ice.map(i => i.w).join('') + ink(ice.map(i => i.d).join(''), 1) + ice.map(i => i.h).join('')
    + bubbles([[33, 46, .8], [25, 34, .7], [41, 29, .7], [34, 53, .6], [24, 54, .6], [40, 40, .6]])
    + wash('#fff', 'M22 56H42L42 59H22Z', .35)
    + ink('<path d="M20 8L22 59H42L44 8"/><ellipse cx="32" cy="8" rx="12" ry="1.6"/>', 2)
    + fine('<path d="M21.6 9.5L23.3 56.4H40.7L42.4 9.5M20.5 15Q32 18 43.5 15"/>')
    + hi('M23.4 12L24.6 52', 1.8)
    + ink('<path d="M37 40L50 1M39.6 40.6L52.4 1.8"/>', 1.2) + wash('#E8E2D4', '<path d="M37 40L50 1L52.4 1.8L39.6 40.6Z"/>', .5)
    + leaf(29, 9, -70, .55) + leaf(29, 9, -115, .5) + leaf(29, 6, -92, .42, '#6CBF7A')
    + wheel(18, 10, 6.2, '#7FA83A', '#C8DE7A', 8, 10)
    + (C ? drops([[24, 30], [41, 44, 1], [23, 50, .8], [40, 20, .8]]) : '')
  , C && g.def);
}
// ── MARGARITA (Coppa margarita)
function margarita(C) {
  const liq = 'M9.5 18C12 22 19 23.5 23 25C23 31 27 35 32 35C37 35 41 31 41 25C45 23.5 52 22 54.5 18Z';
  const g = C && grad('#EEF0B8', '#AFC46A');
  const salt = Array.from({ length: 13 }, (_, i) => [f(10 + i * 2.1), f(13.6 + Math.sin(i * 1.7) * .6 + (i < 6 ? 0 : .3))]);
  return svg(
    (C ? splash('#D9E58A', 'M4 22C6 10 22 6 32 10C44 4 60 12 58 26C60 38 44 44 32 40C18 44 2 34 4 22Z') : '')
    + shadow(32, 59.6, 11)
    + (C ? `<path d="${liq}" fill="url(#${g.id})" style="opacity:.85"/>` : wash('#B9CB78', `<path d="${liq}"/>`, .65))
    + wash('#F2F4D0', '<ellipse cx="32" cy="18" rx="22.5" ry="2.2"/>', .85)
    + ink('<path d="M8 13C9 21 18 23 23 25C23 31 27 35 32 35C37 35 41 31 41 25C46 23 55 21 56 13M22 59Q32 55 42 59Z"/><ellipse cx="32" cy="13" rx="24" ry="2.4"/>', 2)
    + fine('<path d="M30.6 35V56.5M33.4 35V56.5M23.5 26Q32 28.5 40.5 26"/>')
    + hi('M12 16C14 20 19 22 22 23', 1.5) + hi('M30.8 40V53', 1, .7)
    + `<g style="fill:#fff">${salt.map(([x, y]) => `<rect x="${x - .8}" y="${y - .8}" width="1.6" height="1.6" transform="rotate(${(x * 37) % 90} ${x} ${y})" class="ink" style="stroke-width:.5"/>`).join('')}</g>`
    + wheel(52, 12, 7.5, '#7FA83A', '#C8DE7A', 8, 5)
    + fine('<path d="M45.6 15.5L48 13"/>')
    + (C ? drops([[16, 19, .8], [47, 21, .9], [36, 30, .8]]) : '')
  , C && g.def);
}
// ── ESPRESSO MARTINI (Coppa martini)
function espresso(C) {
  const liq = 'M14 18H50L32 36.5Z';
  const g = C && grad('#6A4532', '#2E1A12');
  return svg(
    (C ? splash('#C9A27E', 'M4 20C4 8 20 4 32 8C46 2 62 10 60 24C62 36 46 42 32 38C18 42 4 32 4 20Z') : '')
    + shadow(32, 59.6, 11)
    + (C ? `<path d="${liq}" fill="url(#${g.id})" style="opacity:.92"/>` : wash('#4A2E22', `<path d="${liq}"/>`, .85))
    + wash('#D9B88A', 'M14 18H50L47.8 20.3Q32 22.5 16.2 20.3Z', .95)
    + fine('<path d="M16.2 20.3Q32 22.5 47.8 20.3"/>')
    + `<g class="inkp" style="opacity:.5">${[[20, 19.3], [26, 20], [33, 19.6], [40, 20.1], [45, 19.4], [23, 21], [37, 21.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".45"/>`).join('')}</g>`
    + ink('<path d="M10 14L32 37L54 14M22 59Q32 55 42 59Z"/><ellipse cx="32" cy="14" rx="22" ry="2.2"/>', 2)
    + fine('<path d="M30.7 36V56.5M33.3 36V56.5"/>')
    + hi('M16 20L26 30.5', 1.5) + hi('M30.9 41V53', 1, .7)
    + bean(26, 17.6, -15) + bean(32, 16.8, 5) + bean(38, 17.6, 20)
    + (C ? drops([[44, 24, .9], [20, 25, .8]]) : '')
  , C && g.def);
}
const NOMI = [['Negroni', negroni], ['Mojito', mojito], ['Margarita', margarita], ['Espresso Martini', espresso]];
const col = (tit, sub, fn) => `<div class="col"><h2>${tit}</h2><p>${sub}</p>${NOMI.map(([n, d]) => `<div class="row"><div class="big">${fn(n, d)}</div><div class="sm">${fn(n, d)}</div><span>${n}</span></div>`).join('')}</div>`;
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#f7f2e8;font:15px system-ui;color:#3a302b;padding:22px;width:1150px}
h1{font-size:26px;margin:0 0 4px}.lead{margin:0 0 16px;color:#6b5d52}
.wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.col{background:#fffdf8;border:2px solid #e2d8c8;border-radius:16px;padding:14px}
.col h2{margin:0;font-size:22px}.col p{margin:4px 0 10px;color:#6b5d52;font-size:14px;min-height:38px}
.row{display:flex;align-items:center;gap:14px;border-top:1px solid #eee3d3;padding:8px 0}
.big .br-dis{width:150px;height:150px}.sm .br-dis{width:44px;height:44px}.row span{font-weight:600}
.br-dis{overflow:visible;display:block}.br-dis .wa{filter:url(#br-wash)}
.br-dis .ink{fill:none;stroke:#2a2420;stroke-linecap:round;stroke-linejoin:round}.br-dis .inkp{fill:#2a2420}
.br-dis>.wa{opacity:.62}
.tag{display:inline-block;background:#3a302b;color:#fff;border-radius:8px;padding:2px 8px;font-size:13px;margin-right:6px}
</style>
<svg width="0" height="0" style="position:absolute"><defs><filter id="br-wash" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="5"/><feGaussianBlur stdDeviation=".7"/></filter></defs></svg>
<h1>Cocktail con più dettagli: 3 strade</h1><p class="lead">Grande = scheda del cocktail · piccolo = lista (grandezza vera sul telefono)</p>
<div class="wrap">
${col('<span class="tag">Oggi</span>v90', 'Come sono adesso nell\'app.', (n) => oggi(n))}
${col('<span class="tag">A</span>Più dettagli', 'Vetro spesso, riflessi, cubetti con le facce, menta con le venature, spicchi negli agrumi, ombra.', (n, d) => d(false))}
${col('<span class="tag">B</span>Illustrazione', 'Come A + colore che sfuma, macchia d\'acquerello dietro, goccioline di freddo.', (n, d) => d(true))}
</div>`;
writeFileSync(OUT, html);
