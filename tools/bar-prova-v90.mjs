// Prova (solo anteprima per Mario): bottiglie diverse per i liquori + disegno generato per ogni cocktail.
import { readFileSync, writeFileSync } from 'fs';
const ROOT = '/home/user/jona-ordini/';
const D = JSON.parse(readFileSync(ROOT + 'data/bar-disegni.json'));
const CK = JSON.parse(readFileSync(ROOT + 'data/cocktail.json')).c;
const G = D.g;
const f1 = n => +n.toFixed(1);
const C = (cx, cy, r) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}"/>`;
const E = (cx, cy, rx, ry, a = 0) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"${a ? ` transform="rotate(${a} ${f1(cx)} ${f1(cy)})"` : ''}/>`;
const L = d => `<path d="${d}"/>`;
// un disegno esistente rimpicciolito dentro un altro (tratto un po' più sottile)
const mini = (k, x, y, s, col, rot = 0) => {
  const g = G[k]; const t = `translate(${f1(x - 32 * s)} ${f1(y - 32 * s)}) scale(${s})${rot ? ` rotate(${rot} 32 32)` : ''}`;
  return { w: g.w.map((w, i) => [i === 0 && col || w[0], `<g transform="${t}">${w[1]}</g>`]), d: `<g transform="${t}" style="stroke-width:${f1(1.5 / s)}">${g.d}${g.p ? `<g style="fill:#2a2420;stroke:none">${g.p}</g>` : ''}</g>` };
};
const join = (...p) => ({ w: p.flatMap(x => x.w || []), d: p.map(x => x.d || '').join(''), p: p.map(x => x.p || '').join('') });

// ── 1. LIQUORI: sagoma + simbolo sull'etichetta (= il sapore)
const SAG = {
  tonda: { o: 'M28 9V18C16 22 12 32 12 42C12 54 20 60 32 60C44 60 52 54 52 42C52 32 48 22 36 18V9Z', cap: '<rect x="26.5" y="3" width="11" height="7" rx="2"/>', lab: [32, 43, 9] },
  alta: { o: 'M29.5 8V20L23 58Q23 60 25 60H39Q41 60 41 58L34.5 20V8Z', cap: '<rect x="28" y="2" width="8" height="7" rx="1"/>', lab: [32, 46, 7] },
  quadra: { o: 'M28 9V15Q28 17 26 17H19Q16 17 16 20V57Q16 60 19 60H45Q48 60 48 57V20Q48 17 45 17H38Q36 17 36 15V9Z', cap: '<rect x="26.5" y="3" width="11" height="7" rx="1"/>', lab: [32, 39, 9] },
  monaco: { o: 'M28.5 8V18Q28.5 20 24 22Q16 25 16 32V57Q16 60 19 60H45Q48 60 48 57V32Q48 25 40 22Q35.5 20 35.5 18V8Z', cap: '<rect x="27" y="3" width="10" height="6" rx="1"/>' + C(32, 15, 3), lab: [32, 42, 9] },
  goccia: { o: 'M29 7V18C22 26 15 35 15 45C15 55 23 60 32 60C41 60 49 55 49 45C49 35 42 26 35 18V7Z', cap: '<rect x="27.5" y="2" width="9" height="6" rx="3"/>', lab: [32, 45, 9] },
  fiasca: { o: 'M28.5 8V17C20 19 15 23 15 30V56Q15 60 19 60H45Q49 60 49 56V30C49 23 44 19 35.5 17V8Z', cap: '<rect x="27" y="3" width="10" height="6" rx="1"/>', lab: [32, 40, 9] },
  aperitivo: { o: 'M28 8V21Q28 23 25 24Q18 26 18 32V57Q18 60 21 60H43Q46 60 46 57V32Q46 26 39 24Q36 23 36 21V8Z', cap: '<rect x="27" y="3" width="10" height="6" rx="1"/>', lab: [32, 44, 8] },
};
// simboli piccoli disegnati qui (mancano tra gli ingredienti)
const SIMB = {
  cacao: (x, y) => ({ d: E(x, y, 4, 6.5) + L(`M${x} ${y - 6}V${y + 6}M${x - 2.5} ${y - 4}Q${x - 3.5} ${y} ${x - 2.5} ${y + 4}M${x + 2.5} ${y - 4}Q${x + 3.5} ${y} ${x + 2.5} ${y + 4}`), w: [['#6B3A2A', E(x, y, 4, 6.5)]] }),
  anice: (x, y) => ({ d: [0, 45, 90, 135, 180, 225, 270, 315].map(a => E(x + 3.6 * Math.cos(a * Math.PI / 180), y + 3.6 * Math.sin(a * Math.PI / 180), 2.6, 1.3, a)).join('') + C(x, y, .8), w: [['#8A5A3A', C(x, y, 5.5)]] }),
  mandorla: (x, y) => ({ d: L(`M${x} ${y - 7}C${x + 5} ${y - 3} ${x + 5} ${y + 4} ${x} ${y + 6}C${x - 5} ${y + 4} ${x - 5} ${y - 3} ${x} ${y - 7}Z`) + L(`M${x - 1} ${y - 3}Q${x - 2} ${y + 1} ${x} ${y + 4}`), w: [['#C9965A', L(`M${x} ${y - 7}C${x + 5} ${y - 3} ${x + 5} ${y + 4} ${x} ${y + 6}C${x - 5} ${y + 4} ${x - 5} ${y - 3} ${x} ${y - 7}Z`)]] }),
  croce: (x, y) => ({ d: L(`M${x} ${y - 6}V${y + 6}M${x - 5} ${y - 2}H${x + 5}`) + C(x, y, 8), w: [] }),
  erbe: (x, y) => ({ d: L(`M${x} ${y + 7}V${y - 6}`) + [[-5, -3, -40], [5, -1, 40], [-5, 3, -40], [5, 5, 40]].map(([dx, dy, a]) => E(x + dx / 2 + (dx > 0 ? 1 : -1), y + dy, 3, 1.4, a)).join(''), w: [['#5E8A3A', C(x, y, 6)]] }),
  stella: (x, y) => ({ d: L(`M${x} ${y - 6}L${x + 1.8} ${y - 1.8}L${x + 6} ${y - 1.5}L${x + 2.6} ${y + 1.4}L${x + 3.6} ${y + 5.8}L${x} ${y + 3.3}L${x - 3.6} ${y + 5.8}L${x - 2.6} ${y + 1.4}L${x - 6} ${y - 1.5}L${x - 1.8} ${y - 1.8}Z`), w: [] }),
  fumo: (x, y) => ({ d: L(`M${x - 4} ${y + 6}C${x - 8} ${y + 1} ${x} ${y} ${x - 3} ${y - 5}M${x + 2} ${y + 6}C${x - 2} ${y + 1} ${x + 6} ${y} ${x + 3} ${y - 6}`), w: [] }),
  spezie: (x, y) => ({ d: [[-3, -3], [3, -2], [0, 2], [-3, 4], [4, 4]].map(([a, b]) => C(x + a, y + b, 1.6)).join(''), w: [['#B5652A', C(x, y, 6)]] }),
  scritta: (x, y) => ({ d: L(`M${x - 6} ${y - 3}H${x + 6}M${x - 5} ${y + 1}H${x + 5}M${x - 3} ${y + 5}H${x + 3}`), w: [] }),
};
// liquore → [sagoma, colore, simbolo (disegno esistente o SIMB)]
const LQ = {
  'campari': ['aperitivo', '#D0333A', 'scritta'], 'aperol': ['aperitivo', '#F07A2A', 'arancia'], 'vermouth rosso': ['aperitivo', '#8E2A2E', 'uva'],
  'vermouth dry': ['aperitivo', '#EAD27A', 'erbe'], 'lillet blanc': ['tonda', '#EAD27A', 'arancia'], 'suze': ['alta', '#E8D45A', 'fiore'],
  "pimm's": ['quadra', '#B5652A', 'cetriolo'], 'fernet': ['alta', '#3E2A22', 'erbe'], 'amaro': ['aperitivo', '#3E2A22', 'spezie'], 'jägermeister': ['quadra', '#2F4A2A', 'stella'],
  'triple sec': ['quadra', '#F0A23A', 'arancia'], 'blue curaçao': ['goccia', '#3F8FD2', 'arancia'], 'maraschino': ['fiasca', '#EAE4D6', 'ciliegia'], 'cherry brandy': ['tonda', '#B8323E', 'ciliegia'],
  'crème de violette': ['goccia', '#8E6FC1', 'fiore'], 'crème de mûre': ['tonda', '#4A2A55', 'mirtillo'], 'mirto': ['fiasca', '#4A2A55', 'mirtillo'], 'crème de cassis': ['goccia', '#5B2A4E', 'uva'],
  'chartreuse verde': ['monaco', '#8DBA3A', 'croce'], 'chartreuse gialla': ['monaco', '#E8D45A', 'croce'], 'bénédictine': ['monaco', '#C98A2E', 'spezie'], 'drambuie': ['quadra', '#C98A2E', 'miele'],
  'absinthe': ['alta', '#8DBA3A', 'erbe'], 'liquore alla mela verde': ['tonda', '#8DBA3A', 'mela'], 'liquore al melone': ['goccia', '#B5D86A', 'cetriolo'], 'limoncello': ['fiasca', '#E8D45A', 'limone'],
  "liquore all'albicocca": ['goccia', '#F2A65A', 'pesca'], 'liquore alla pesca': ['tonda', '#F2A65A', 'pesca'], 'liquore al caffè': ['quadra', '#5A3A2A', 'caffe'], 'crème de cacao': ['tonda', '#5A3A2A', 'cacao'],
  'galliano': ['alta', '#E8C43A', 'stella'], 'amaretto': ['quadra', '#B5652A', 'mandorla'], 'liquore ai fiori di sambuco': ['goccia', '#EDE3B0', 'fiore'], 'falernum': ['fiasca', '#E3C98A', 'lime'],
  'crème de menthe': ['alta', '#7FC08A', 'menta'], 'liquore al lampone': ['goccia', '#D9445F', 'fragola'], 'liquore al frutto della passione': ['fiasca', '#E9A13A', 'passione'],
  "liquore all'uovo": ['tonda', '#F2D27A', 'uovo'], 'sambuca': ['alta', '#E6E8EE', 'anice'], 'crema di whisky': ['tonda', '#D9B98A', 'panna'],
};
function liq(n) {
  const [s, col, sb] = LQ[n], S = SAG[s], [x, y, r] = S.lab;
  const sym = SIMB[sb] ? SIMB[sb](x, y) : mini(sb, x, y, r * 1.6 / 64 * 1.6, null);
  return join({ w: [[col, L(S.o)]], d: L(S.o) + S.cap + C(x, y, r + 1.5) }, { w: [['#FBF6EC', C(x, y, r + 1.5)]] }, sym);
}

// ── 2. COCKTAIL: bicchiere + colore del drink (dagli ingredienti) + guarnizione + ghiaccio/bollicine
const BIC = {
  'Old fashioned': { o: 'M15 24L18 58H46L49 24', liq: 'M15.8 33L18 58H46L48.2 33Z', top: 33, rim: [47, 24], ice: [[24, 40], [37, 42]], extra: L('M18 58H46') },
  'Highball': { o: 'M20 8L22 59H42L44 8', liq: 'M20.5 17L22 59H42L43.5 17Z', top: 17, rim: [42.5, 8], ice: [[27, 26], [36, 36], [28, 46]] },
  'Collins': { o: 'M22 6L23 59H41L42 6', liq: 'M22.2 15L23 59H41L41.8 15Z', top: 15, rim: [41, 6], ice: [[29, 25], [35, 37], [29, 48]] },
  'Coppa martini': { o: 'M10 14L32 37L54 14M32 37V57M22 59Q32 55 42 59Z', liq: 'M14 18H50L32 36.5Z', top: 18, rim: [51, 14] },
  'Coppetta': { o: 'M11 16C11 31 22 35 32 35C42 35 53 31 53 16M32 35V57M22 59Q32 55 42 59Z', liq: 'M11.5 21C13 30 22 35 32 35C42 35 51 30 52.5 21Z', top: 21, rim: [51, 16] },
  'Coppa margarita': { o: 'M8 13C9 21 18 23 23 25C23 31 27 35 32 35C37 35 41 31 41 25C46 23 55 21 56 13M32 35V57M22 59Q32 55 42 59Z', liq: 'M9.5 18C12 22 19 23.5 23 25C23 31 27 35 32 35C37 35 41 31 41 25C45 23.5 52 22 54.5 18Z', top: 18, rim: [53, 13] },
  'Flûte': { o: 'M25 4C24 16 25 30 32 34C39 30 40 16 39 4M32 34V55M23 58Q32 54 41 58Z', liq: 'M24.6 11C24.5 21 26 30 32 34C38 30 39.5 21 39.4 11Z', top: 11, rim: [38.5, 4], bub: 1 },
  'Calice': { o: 'M19 8C17 22 20 34 32 36C44 34 47 22 45 8M32 36V56M21 59Q32 54 43 59Z', liq: 'M18.4 19C19 30 23 35 32 36C41 35 45 30 45.6 19Z', top: 19, rim: [44, 8] },
  'Balloon': { o: 'M20 10C10 18 10 32 16 37C22 42 42 42 48 37C54 32 54 18 44 10M32 41V56M21 59Q32 54 43 59Z', liq: 'M12.5 26C12 32 14 35 16 37C22 42 42 42 48 37C50 35 52 32 51.5 26Z', top: 26, rim: [44, 10], ice: [[26, 31], [37, 32]] },
  'Hurricane': { o: 'M22 6C20 16 27 21 27 29C27 37 18 40 19 50Q20 56 32 56Q44 56 45 50C46 40 37 37 37 29C37 21 44 16 42 6M24 60H40M32 56V60', liq: 'M21.5 14C22 19 27 23 27 29C27 37 18 40 19 50Q20 56 32 56Q44 56 45 50C46 40 37 37 37 29C37 23 42 19 42.5 14Z', top: 14, rim: [42, 6], ice: [[29, 44]] },
  'Tiki': { o: 'M18 8H46L44 58Q44 60 42 60H22Q20 60 20 58Z', liq: 'M18 8H46L44 58Q44 60 42 60H22Q20 60 20 58Z', top: 8, rim: [45, 8], extra: L('M24 24Q27 21 30 24M34 24Q37 21 40 24M26 36H38M27 36V42M31 36V42M35 36V42M24 48Q32 52 40 48'), opaco: '#B07A4A' },
  'Tazza di rame': { o: 'M14 14H44V55Q44 60 39 60H19Q14 60 14 55Z', liq: 'M14 14H44V55Q44 60 39 60H19Q14 60 14 55Z', top: 14, rim: [43, 14], extra: L('M44 22H50Q54 22 54 26V40Q54 44 50 44H44') + [[20, 24], [28, 30], [36, 22], [22, 40], [33, 44], [39, 36], [26, 52]].map(([a, b]) => E(a, b, 1.6, 1)).join(''), opaco: '#C87A4A' },
  'Julep': { o: 'M16 12H48L45 58H19Z', liq: 'M16 12H48L45 58H19Z', top: 12, rim: [46, 12], extra: L('M22 22V30M30 26V36M38 20V28M41 34V42M25 40V48M34 44V52'), opaco: '#C8CFD4' },
  'Irish coffee': { o: 'M18 8C17 24 20 36 32 38C44 36 47 24 46 8M32 38V55M22 59Q32 55 42 59ZM46.5 14H50Q54 14 53 20Q52 28 45 30', liq: 'M17.6 16C18 28 22 36 32 38C42 36 46 28 46.4 16Z', top: 16, rim: [45, 8] },
  'Tazza': { o: 'M12 20H46V48Q46 58 36 58H22Q12 58 12 48ZM46 26H51Q55 26 55 31V36Q55 41 50 41H45M8 60H50', liq: 'M12.3 25H45.7V48Q45.7 57.7 36 57.7H22Q12.3 57.7 12.3 48Z', top: 25, rim: [45, 20] },
  'Boccale': { o: 'M14 14H44V56Q44 60 40 60H18Q14 60 14 56ZM44 22H50Q54 22 54 26V42Q54 46 50 46H44', liq: 'M14 20H44V56Q44 60 40 60H18Q14 60 14 56Z', top: 20, rim: [43, 14], bub: 1 },
  'Shot': { o: 'M22 28L25 58H39L42 28M25 58H39', liq: 'M22.9 36L25 58H39L41.1 36Z', top: 36, rim: [41, 28] },
};
// colore di un ingrediente: regola → colore, se no primo acquerello del disegno
const ingCol = n => { n = n.toLowerCase(); if (LQ[n]) return LQ[n][1]; const r = D.r.find(r => new RegExp(r[0]).test(n)); return r ? (r[2] || G[r[1]].w[0][0]) : null; };
const TRASP = /^(gin|vodka|rum bianco|cachaça|tequila|soda|acqua|tonica|ghiaccio|pisco|grappa|sambuca|maraschino|triple sec|prosecco|champagne|soda molto fredda|acqua frizzante|sciroppo di zucchero|zucchero|zolletta)/;
const FORTE = /campari|aperol|curaçao|granatina|cola|caffè|cassis|crème de menthe|pomodoro|mirtillo|melograno|violette|mûre|vino rosso|porto|lampone|fragol|cacao|jägermeister|fernet|amaro|vermouth rosso|birra scura|panna|latte|cocco|uovo|tuorlo/;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function mix(ing) {
  let t = 0, a = [0, 0, 0];
  for (const [q, u, n] of ing) {
    const c = ingCol(n); if (!c || /ghiaccio|scorza|fetta|spicchi|foglie|rametti|zolletta|sale|chiodi|stecca/i.test(n)) continue;
    let w = u === 'cl' ? (+String(q).replace(',', '.') || 1) : u === 'ml' ? (+q || 1) / 10 : .4;
    const nl = n.toLowerCase(); if (TRASP.test(nl)) w *= .15; if (FORTE.test(nl)) w *= 3;
    const v = hex(c).map(x => (x / 255) ** 2.2); a = a.map((s, i) => s + v[i] * w); t += w;
  }
  if (!t) return '#E8E4D8';
  return '#' + a.map(s => Math.round(((s / t) ** (1 / 2.2)) * 255).toString(16).padStart(2, '0')).join('');
}
// guarnizioni: parola nella guarnizione → disegno (max 2)
const GAR = [[/oliv/i, 'oliva'], [/cipollin/i, 'cipolla'], [/ciliegin|amarena/i, 'ciliegia'], [/scorza (lunga )?di limone|scorza di lime/i, 'scorzaL'], [/scorza d'arancia|scorza di pompelmo/i, 'scorzaA'],
  [/lime/i, 'lime'], [/limone/i, 'limone'], [/pompelmo/i, 'pompelmo'], [/arancia|agrumi/i, 'arancia'], [/menta/i, 'menta'], [/basilico/i, 'menta'], [/ananas/i, 'ananas'], [/fragol/i, 'fragola'], [/lampon|more/i, 'mirtillo'],
  [/mela/i, 'mela'], [/cetriolo/i, 'cetriolo'], [/peperoncino/i, 'peperoncino'], [/sedano/i, 'sedano'], [/caffè/i, 'chicchi'], [/noce moscata|cacao|cannella/i, 'polvere'], [/panna/i, 'pannaS'], [/cocco/i, 'polvere'], [/frutto della passione/i, 'passione']];
function garn(txt, B) {
  const out = [], [rx, ry] = B.rim; const seen = new Set();
  for (const [re, k] of GAR) { if (out.length >= 2) break; if (re.test(txt) && !seen.has(k)) { seen.add(k); out.push(k); } }
  const p = [];
  out.forEach((k, i) => {
    const x = rx - i * 11, y = ry;
    if (k === 'scorzaL' || k === 'scorzaA') { const col = k === 'scorzaL' ? '#F2CF3B' : '#F0A23A'; const d = `M${x - 6} ${y - 6}C${x - 2} ${y - 12} ${x + 4} ${y - 2} ${x + 8} ${y - 8}`; p.push({ w: [[col, `<path d="${d}" style="stroke:${col};stroke-width:4;fill:none"/>`]], d: L(d) }); }
    else if (k === 'chicchi') [[-6, 0], [0, -1], [6, 0]].forEach(([a, b]) => p.push({ d: E(32 + a, B.top - 1 + b, 2.2, 1.5) + L(`M${30 + a} ${B.top - 1 + b}H${34 + a}`), w: [['#5A3A2A', E(32 + a, B.top - 1 + b, 2.2, 1.5)]] }));
    else if (k === 'polvere') p.push({ p: [[-8, 0], [-3, -1], [2, 0], [7, -1], [-5, 1], [5, 1], [0, 1]].map(([a, b]) => C(32 + a, B.top + b, .7)).join('') });
    else if (k === 'pannaS') p.push({ d: L(`M18 ${B.top}Q32 ${B.top - 7} 46 ${B.top}`), w: [['#FBF6EC', L(`M18 ${B.top}Q32 ${B.top - 7} 46 ${B.top}Z`)]] });
    else if (k === 'sedano') p.push({ d: L(`M${x - 4} ${y + 14}L${x + 4} ${y - 10}M${x - 1} ${y + 14}L${x + 7} ${y - 9}`) + E(x + 6, y - 12, 4, 2.5, -30), w: [['#9CC25A', E(x + 6, y - 12, 4, 2.5, -30)]] });
    else if (k === 'cipolla') p.push({ d: L(`M${x - 8} ${y - 10}L${x + 4} ${y + 10}`) + C(x - 4, y - 3, 2.6) + C(x, y + 3, 2.6), w: [['#EFE9D8', C(x - 4, y - 3, 2.6) + C(x, y + 3, 2.6)]] });
    else if (k === 'oliva') p.push({ d: L(`M${x - 9} ${y - 12}L${x + 3} ${y + 12}`) }, mini('oliva', x - 2, y + 2, .3));
    else p.push(mini(k, x, y, .34));
  });
  return p;
}
const cube = (x, y) => ({ d: L(`M${x - 5} ${y - 4}L${x + 4} ${y - 5}L${x + 5} ${y + 4}L${x - 4} ${y + 5}Z`) + L(`M${x - 3} ${y - 2}L${x + 1} ${y - 3}`) });
function cocktail(ck) {
  const [nome, , , bic, ing, gar, prep] = ck; const B = BIC[bic] || BIC['Old fashioned'];
  const col = mix(ing); const parts = [];
  const m = B.liq.match(/^M([\d.]+) ([\d.]+)/), lx = +m[1];
  const sup = !B.opaco && B.top > B.rim[1] ? L(`M${lx} ${B.top}H${64 - lx}`) : '';
  parts.push({ w: [[B.opaco || col, L(B.liq)]], d: L(B.o) + sup + (B.extra || '') });
  const ghiaccio = /ghiaccio/i.test(prep) && !/filtra|senza ghiaccio/i.test(prep) && B.ice;
  if (ghiaccio && !B.opaco) B.ice.forEach(([x, y]) => parts.push(cube(x, y)));
  const bolle = B.bub || ing.some(i => /soda|tonica|ginger|prosecco|champagne|cola|frizzante|lemon|birra/i.test(i[2]));
  if (bolle && !B.opaco) parts.push({ p: [[-4, 10], [3, 16], [-1, 22], [5, 27]].map(([a, b]) => C(32 + a, B.top + b, .9)).join('') });
  if (/Tiki|Hurricane|Highball|Collins|Tazza di rame|Julep/.test(bic) && /ghiaccio tritato|cannuccia|crushed/i.test(prep + gar)) parts.push({ d: L(`M38 ${B.top + 20}L50 2`) });
  if (/bordo/i.test(gar)) parts.push({ p: Array.from({ length: 9 }, (_, i) => C(B.rim[0] - 30 + i * 3.5 + (bic === 'Coppa margarita' ? -2 : 0), B.rim[1] + (i % 2) * .8, .8)).join('') });
  parts.push(...garn(gar, B));
  return join(...parts);
}

// ── foglio di prova
const svg = g => `<svg viewBox="0 0 64 64" class="br-dis">${g.w.map(w => `<g class="wa" transform="translate(1.5 1.5)" fill="${w[0]}">${w[1]}</g>`).join('')}<g class="ink">${g.d}</g>${g.p ? `<g class="inkp">${g.p}</g>` : ''}</svg>`;
const old = n => { const r = D.r.find(r => new RegExp(r[0]).test(n)); const g = G[r[1]]; return { w: g.w.map((w, i) => [i === 0 && r[2] || w[0], w[1]]), d: g.d, p: g.p }; };
const LQK = Object.keys(LQ);
// doppioni tra i cocktail: stessa impronta del disegno
const imp = {}; let dup = 0; for (const ck of CK) { const k = svg(cocktail(ck)); if (imp[k]) { dup++; imp[k].push(ck[0]); } else imp[k] = [ck[0]]; }
const dups = Object.values(imp).filter(v => v.length > 1);
console.log('cocktail', CK.length, 'disegni diversi', Object.keys(imp).length, 'doppioni', dups.map(v => v.join('=')).join(' | '));
const scelti = ['Negroni', 'Mojito', 'Margarita', 'Dry Martini', 'Spritz', 'Moscow Mule', 'Piña Colada', 'Cosmopolitan', 'Old Fashioned', 'Daiquiri', 'Bloody Mary', 'Espresso Martini', 'Mai Tai', 'Irish Coffee', 'Bellini', 'Blue Lagoon', 'Whiskey Sour', 'Gin Tonic', 'Americano', 'Cuba Libre', 'Mint Julep', 'Hugo', 'Tequila Sunrise', 'Paloma'];
const sel = scelti.map(n => CK.find(c => c[0].toLowerCase() === n.toLowerCase())).filter(Boolean);
for (const n of scelti) if (!CK.find(c => c[0].toLowerCase() === n.toLowerCase())) console.log('manca', n);
const css = `body{margin:0;background:#f7f2e8;font:15px system-ui;color:#3a302b;padding:20px;width:1160px}h2{margin:18px 0 8px;font-size:22px}p{margin:0 0 10px;color:#6a5e55}
.g{display:grid;grid-template-columns:repeat(8,1fr);gap:8px 10px}.it{text-align:center;font-size:13px;line-height:1.2}.it .br-dis{width:100px;height:100px}
.cmp{display:grid;grid-template-columns:repeat(8,1fr);gap:8px 10px}.br-dis{overflow:visible;display:block;margin:0 auto}.br-dis .wa{opacity:.62;filter:url(#br-wash)}
.br-dis .ink{fill:none;stroke:#2a2420;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.br-dis .inkp{fill:#2a2420}
.old{display:flex;gap:4px;justify-content:center}.old .br-dis{width:44px;height:44px;margin:0}.tag{font-size:12px;color:#8a7d72}`;
const defs = `<svg width="0" height="0" style="position:absolute"><defs><filter id="br-wash" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="5"/><feGaussianBlur stdDeviation=".7"/></filter></defs></svg>`;
writeFileSync('/tmp/bar-prova-liquori.html', `<!doctype html><meta charset="utf-8"><style>${css}</style>${defs}
<h2>Liquori e aperitivi: ognuno la sua bottiglia</h2><p>Sagoma diversa + simbolo del sapore sull'etichetta. Prima erano 2 bottiglie uguali per ${LQK.length} prodotti.</p>
<div class="g">${LQK.map(n => `<div class="it">${svg(liq(n))}${n}</div>`).join('')}</div>`);
writeFileSync('/tmp/bar-prova-cocktail.html', `<!doctype html><meta charset="utf-8"><style>${css}</style>${defs}
<h2>Cocktail: un disegno per ognuno, fatto da solo</h2><p>Bicchiere giusto + colore del drink calcolato dagli ingredienti + guarnizione + ghiaccio e bollicine. ${CK.length} cocktail → ${Object.keys(imp).length} disegni diversi.</p>
<div class="g">${sel.map(c => `<div class="it">${svg(cocktail(c))}<b>${c[0]}</b><br><span class="tag">${c[3]}</span></div>`).join('')}</div>`);
