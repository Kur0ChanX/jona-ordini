// D39 / v89: disegni degli ingredienti del Bar, stile B «inchiostro e acquerello» (scelta di Mario #93).
// Ogni disegno sta in un quadrato 64×64: w = macchie d'acquerello [colore, forme], d = linee a penna, p = punti pieni.
// r = regole (sul nome in minuscolo, in ordine, vince la prima) → [espressione, disegno, colore che sostituisce il primo acquerello].
// Uso: node tools/bar-disegni.mjs  → scrive data/bar-disegni.json e tools/bar-disegni-anteprima.html
import { readFileSync, writeFileSync } from 'fs';
const f1 = n => +n.toFixed(1);
const P = (x, y) => f1(x) + ' ' + f1(y);
const C = (cx, cy, r) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}"/>`;
const E = (cx, cy, rx, ry, a = 0) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"${a ? ` transform="rotate(${a} ${f1(cx)} ${f1(cy)})"` : ''}/>`;
const L = (d) => `<path d="${d}"/>`;
const LEAF = 'M0 0C6-8 18-9 25-2C18 6 6 6 0 0Z';
const leaf = (x, y, a, s = 1, vena = true) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${LEAF}"/>${vena ? '<path d="M2 0L21-2"/>' : ''}</g>`;
const leafF = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${LEAF}"/></g>`;
const rad = a => a * Math.PI / 180;
// bottiglia: collo largo nw da top a nb, spalla fino a sh, corpo largo bw fino a bot
function bottle({ x = 32, top, nw, nb, sh, bw, bot, r = 3 }) {
  const a = x - nw / 2, b = x + nw / 2, l = x - bw / 2, rr = x + bw / 2;
  return `M${P(a, top)}L${P(a, nb)}Q${P(l, nb)} ${P(l, sh)}L${P(l, bot - r)}Q${P(l, bot)} ${P(l + r, bot)}L${P(rr - r, bot)}Q${P(rr, bot)} ${P(rr, bot - r)}L${P(rr, sh)}Q${P(rr, nb)} ${P(b, nb)}L${P(b, top)}Z`;
}
// fetta d'agrume: cerchio, buccia, spicchi a raggi
const spokes = (cx, cy, r0, r1, n, rot = 0) => Array.from({ length: n }, (_, i) => { const t = rad(rot + i * 360 / n); return L(`M${P(cx + r0 * Math.cos(t), cy + r0 * Math.sin(t))}L${P(cx + r1 * Math.cos(t), cy + r1 * Math.sin(t))}`) }).join('');
// cubetto (ghiaccio, zucchero)
function cube(cx, cy, s) {
  const h = s / 2, q = s / 4;
  const top = `M${P(cx, cy - h)}L${P(cx + h, cy - q)}L${P(cx, cy)}L${P(cx - h, cy - q)}Z`;
  const sides = `M${P(cx - h, cy - q)}L${P(cx - h, cy + q + h / 1.2)}L${P(cx, cy + h + h / 1.2 - q)}L${P(cx, cy)}M${P(cx + h, cy - q)}L${P(cx + h, cy + q + h / 1.2)}L${P(cx, cy + h + h / 1.2 - q)}`;
  const out = `M${P(cx, cy - h)}L${P(cx + h, cy - q)}L${P(cx + h, cy + q + h / 1.2)}L${P(cx, cy + h + h / 1.2 - q)}L${P(cx - h, cy + q + h / 1.2)}L${P(cx - h, cy - q)}Z`;
  return { top, sides, out };
}
// righe dentro un'ellisse (per l'ananas): famiglia y = m·x + k
function ellLines(cx, cy, rx, ry, m, ks, pad = 1.6) {
  return ks.map(k => {
    // (x-cx)²/rx² + (m x + k - cy)²/ry² = 1
    const A = 1 / rx ** 2 + m * m / ry ** 2, B = -2 * cx / rx ** 2 + 2 * m * (k - cy) / ry ** 2, Cc = cx * cx / rx ** 2 + (k - cy) ** 2 / ry ** 2 - 1;
    const D = B * B - 4 * A * Cc; if (D <= 0) return '';
    let x1 = (-B - Math.sqrt(D)) / (2 * A), x2 = (-B + Math.sqrt(D)) / (2 * A);
    const dx = pad / Math.sqrt(1 + m * m); x1 += dx; x2 -= dx; if (x2 <= x1) return '';
    return L(`M${P(x1, m * x1 + k)}L${P(x2, m * x2 + k)}`);
  }).join('');
}
function stick(x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy), px = -dy / n * w / 2, py = dx / n * w / 2, a = Math.atan2(dy, dx) * 180 / Math.PI;
  const out = `M${P(x1 + px, y1 + py)}L${P(x2 + px, y2 + py)}A${f1(w / 4)} ${f1(w / 2)} ${f1(a)} 0 0 ${P(x2 - px, y2 - py)}L${P(x1 - px, y1 - py)}`;
  const end = E(x1, y1, w / 4, w / 2, a);
  const spir = L(`M${P(x1 + px * .4, y1 + py * .4)}Q${P(x1 - px * .2 + dx / n, y1 - py * .2 + dy / n)} ${P(x1 - px * .1, y1 - py * .1)}`);
  return { f: out + `Z`, d: L(out) + end + spir };
}

const G = {};
// ── agrumi e frutta
G.lime = { w: [['#8DB33A', C(32, 32, 26)]], d: C(32, 32, 26) + C(32, 32, 21.5) + spokes(32, 32, 3, 19, 8) };
{
  const lem = 'M9 35Q11 32 13.5 31C16 22 24 19 32 19C40 19 48 22 50.5 31Q53 32 55 35Q53 38 50.5 39C48 48 40 51 32 51C24 51 16 48 13.5 39Q11 38 9 35Z';
  G.limone = { w: [['#F2CF3B', L(lem)], ['#6FA35A', leafF(35, 20, -38, .75)]], d: L(lem) + L('M19 29Q22 25 28 23.5') + leaf(35, 20, -38, .75) };
}
G.arancia = { w: [['#F0A23A', L('M6 44A26 26 0 0 1 58 44Z')]], d: L('M6 44A26 26 0 0 1 58 44Z') + L('M10.5 44A21.5 21.5 0 0 1 53.5 44') + [150, 120, 90, 60, 30].map(a => L(`M32 42L${P(32 + 18 * Math.cos(rad(a)), 44 - 18 * Math.sin(rad(a)))}`)).join('') };
// pompelmo: fetta intera rosa, 10 spicchi e centro (il lime ha 8 raggi ed è verde)
G.pompelmo = { w: [['#EE8577', C(32, 32, 27)]], d: C(32, 32, 27) + C(32, 32, 22.5) + spokes(32, 32, 3.5, 20.5, 10, 18) + C(32, 32, 2.5) };
{
  const cx = 32, cy = 44, rx = 13.5, ry = 16;
  const body = E(cx, cy, rx, ry);
  const crown = [leafF(32, 29, -112, .95), leafF(32, 29, -68, .95), leafF(32, 30, -140, .7), leafF(32, 30, -40, .7), leafF(32, 29, -90, 1.05)].join('');
  const crownD = [leaf(32, 29, -112, .95, false), leaf(32, 29, -68, .95, false), leaf(32, 30, -140, .7, false), leaf(32, 30, -40, .7, false), leaf(32, 29, -90, 1.05, false)].join('');
  G.ananas = { w: [['#E8B64A', body], ['#6FA35A', crown]], d: body + ellLines(cx, cy, rx, ry, 1, [-8, 0, 8, 16, 24]) + ellLines(cx, cy, rx, ry, -1, [64, 72, 80, 88, 96]) + crownD };
}
{
  const bb = [[21, 43, 10], [43, 43, 10], [32, 27, 10]];
  const star = (x, y) => L(`M${P(x - 2, y - 2)}L${P(x + 2, y + 2)}M${P(x + 2, y - 2)}L${P(x - 2, y + 2)}`);
  G.mirtillo = { w: [['#B8323E', bb.map(b => C(...b)).join('')]], d: bb.map(b => C(...b)).join('') + star(21, 37) + star(43, 37) + star(32, 21) + L('M15 47Q16 50 19 51') + L('M37 47Q38 50 41 51') };
}
{
  const body = 'M32 60C22 56 13 44 13 34C13 25 21 22 32 24C43 22 51 25 51 34C51 44 42 56 32 60Z';
  const cal = 'M32 25L22 19L28 20L25 13L31 18L32 11L34 18L39 13L37 20L43 19Z';
  const seeds = [[22, 31], [32, 31], [42, 31], [27, 39], [37, 39], [21, 41], [43, 41], [32, 47], [27, 51], [37, 51]].map(([x, y]) => L(`M${x} ${y}l.6 1.8`)).join('');
  G.fragola = { w: [['#D9443F', L(body)], ['#5E9E4E', L(cal)]], d: L(body) + L(cal) + seeds };
}
{
  const body = 'M32 19C20 15 11 26 11 38C11 51 21 59 32 59C43 59 53 51 53 38C53 26 44 15 32 19Z';
  G.pesca = { w: [['#F4A26B', L(body)], ['#6FA35A', leafF(33, 19, -30, .8)]], d: L(body) + L('M32 19C27 28 27 44 31 57') + L('M32 19L30 12') + leaf(33, 19, -30, .8) };
}
G.ciliegia = { w: [['#C8323C', C(22, 47, 10) + C(43, 49, 10)], ['#6FA35A', L('M38 10C44 3 54 5 57 9C51 14 43 14 38 10Z')]], d: C(22, 47, 10) + C(43, 49, 10) + L('M22 37C24 24 30 15 38 10M43 39C41 27 39 18 38 10') + L('M38 10C44 3 54 5 57 9C51 14 43 14 38 10Z') + L('M18 43Q19 41 21 41') + L('M39 45Q40 43 42 43') };
{
  const body = 'M26 20C16 22 11 30 11 39C11 51 21 59 32 59C43 59 53 51 53 39C53 30 48 22 38 20Z';
  const cr = 'M26 20L25 12L29 16L32 10L35 16L39 12L38 20';
  G.melograno = { w: [['#B9323F', L(body + 'L38 20L26 20Z')]], d: L(body) + L(cr) + L('M17 34Q18 28 23 26') };
}
{
  const body = E(32, 40, 22, 18);
  const sep = [-150, -110, -70, -30].map(a => leafF(32, 23, a, .48)).join('') + leafF(32, 23, -90, .3);
  const sepD = [-150, -110, -70, -30].map(a => leaf(32, 23, a, .48, false)).join('');
  G.pomodoro = { w: [['#D9443F', body], ['#5E9E4E', sep]], d: body + sepD + L('M32 23L33 15') + L('M17 36Q18 31 23 28') };
}
{
  const shell = 'M8 30C8 47 19 58 32 58C45 58 56 47 56 30';
  G.cocco = { w: [['#8A5A3B', L(shell + 'Q32 40 8 30Z')], ['#EDE3CF', L('M13 30Q32 23 51 30Q32 37 13 30Z')]], d: L('M8 30Q32 20 56 30Q32 40 8 30Z') + L('M13 30Q32 23.5 51 30') + L(shell) + L('M18 44l3 2M27 50l3 1M38 49l3-1M46 42l2-2M22 52l2 1') };
}
{
  const ap = 'M32 22C27 16 12 17 12 34C12 48 22 59 30 57Q32 56 34 57C42 59 52 48 52 34C52 17 37 16 32 22Z';
  G.mela = { w: [['#9CC04A', L(ap)], ['#5E9E4E', leafF(34, 13, -20, .6)]], d: L(ap) + L('M32 22C32 17 32 13 33 9') + leaf(34, 13, -20, .6) + L('M18 30Q19 25 23 23') };
}
{
  const seeds = [[26, 28], [36, 26], [40, 36], [30, 38], [24, 34], [34, 44], [42, 30], [29, 46], [38, 41]].map(([x, y]) => C(x, y, 1.7)).join('');
  G.passione = { w: [['#7A3D63', C(32, 35, 24)], ['#E9C14A', C(32, 35, 18.5)]], d: C(32, 35, 24) + C(32, 35, 18.5), p: seeds };
}
{
  const gg = [[20, 24], [31, 23], [42, 24], [25, 34], [36, 34], [47, 33], [30, 44], [41, 44], [35, 54]].map(([x, y]) => C(x, y, 6));
  G.uva = { w: [['#7D4E8C', gg.join('')], ['#6FA35A', leafF(31, 15, -165, .8)]], d: gg.join('') + L('M31 17C31 12 33 9 36 6') + leaf(31, 15, -165, .8) };
}
{
  G.cetriolo = { w: [['#7FB36A', C(41, 26, 15) + C(25, 40, 17)], ['#D4E6B5', C(25, 40, 13)]], d: L('M28.5 23.5A15 15 0 1 1 41 41') + C(25, 40, 17) + C(25, 40, 13) + [0, 60, 120, 180, 240, 300].map(a => E(25 + 6 * Math.cos(rad(a)), 40 + 6 * Math.sin(rad(a)), 1.8, 1, a)).join('') };
}
{
  const pep = 'M21 21C29 22 31 31 37 41C43 51 50 56 57 58C45 61 32 55 24 45C18 37 16 27 21 21Z';
  G.peperoncino = { w: [['#D33A32', L(pep)], ['#5E9E4E', L('M15 23Q20 16 26 22Q22 20 21 21Z')]], d: L(pep) + L('M21 21C18 16 17 12 19 7') + L('M15 23Q20 16 26 22') + L('M25 30Q28 38 34 45') };
}
{
  const o1 = E(25, 39, 9, 6.5, -45), o2 = E(40, 24, 9, 6.5, -45);
  G.oliva = { w: [['#8E9E3A', o1 + o2], ['#D33A32', C(27.5, 36.5, 2.6) + C(42.5, 21.5, 2.6)]], d: L('M9 55L54 10') + o1 + o2 + C(27.5, 36.5, 2.6) + C(42.5, 21.5, 2.6) + L('M54 10L57 6') };
}
// ── erbe, spezie, fiori
G.menta = { w: [['#4FA36B', leafF(32, 46, -25) + `<g transform="translate(32 46) scale(-1 1)">${leafF(0, 0, -25)}</g>` + leafF(32, 30, -30, .85) + `<g transform="translate(32 30) scale(-1 1)">${leafF(0, 0, -30, .85)}</g>` + leafF(32, 14, -90, .6)]],
  d: L('M32 60C31 46 33 30 32 9') + leaf(32, 46, -25) + `<g transform="translate(32 46) scale(-1 1)">${leaf(0, 0, -25)}</g>` + leaf(32, 30, -30, .85) + `<g transform="translate(32 30) scale(-1 1)">${leaf(0, 0, -30, .85)}</g>` + leaf(32, 14, -90, .6, false) };
{
  const s1 = stick(8, 40, 56, 20, 9), s2 = stick(10, 54, 56, 35, 9);
  G.cannella = { w: [['#A0623A', L(s1.f) + L(s2.f)]], d: s1.d + s2.d };
}
{
  const pet = 'M0 0C-7-6-6-17 0-20C6-17 7-6 0 0Z';
  const ps = [0, 72, 144, 216, 288].map(a => `<g transform="translate(32 33) rotate(${a})"><path d="${pet}"/></g>`).join('');
  G.fiore = { w: [['#F2E3A0', ps], ['#E8B83A', C(32, 33, 4.5)]], d: ps + C(32, 33, 4.5) + L('M32 54C31 50 31 47 32 44') };
}
// ── zucchero, miele, sciroppi
{
  const a = cube(24, 36, 20), b = cube(42, 40, 18);
  G.zucchero = { w: [['#E9D9B0', L(a.out) + L(b.out)]], d: L(a.top) + L(a.sides) + L(b.top) + L(b.sides) + L('M49 18l0 5M46.5 20.5l5 0M14 18l0 3M12.5 19.5l3 0') };
}
{
  const jar = 'M18 27H46C50 32 50 52 46 58H18C14 52 14 32 18 27Z';
  G.miele = { w: [['#E6A93A', L(jar)], ['#C98A4A', L('M16 18H48V27H16Z')]], d: L(jar) + L('M16 18H48V27H16Z') + L('M22 27C22 31 24 32 24 34C24 36 21 36 21 34') + L('M27 39L32 36L37 39L37 45L32 48L27 45Z') };
}
{
  const body = bottle({ top: 16, nw: 9, nb: 23, sh: 31, bw: 24, bot: 60 });
  G.sciroppo = { w: [['#E8C98A', L(body)]], d: L(body) + L('M28 16V11H36V16') + L('M34 11L42 5L44 7L37 12') + L('M50 16C52 20 54 22 54 25C54 28 50 28 50 25C50 22 50 20 50 16Z') + `<rect x="24" y="38" width="16" height="12" rx="1.5"/>` };
}
// ── uova, latte, caffè
{
  const egg = 'M32 8C44 8 52 30 52 42C52 54 43 60 32 60C21 60 12 54 12 42C12 30 20 8 32 8Z';
  G.uovo = { w: [['#EFDDBA', L(egg)]], d: L(egg) + L('M20 38Q21 26 27 18') };
}
{
  const jug = 'M18 20H44C46 32 48 46 44 58H20C16 46 16 32 18 20Z';
  G.panna = { w: [['#EFE2C6', L(jug)]], d: L(jug) + L('M44 20L53 16L46 27') + L('M18 27C9 29 9 45 18 47') + L('M18 27C13 29 13 43 18 45') + L('M18 20Q31 25 44 20') };
}
{
  const cup = 'M13 29H47C47 44 41 52 30 52C19 52 13 44 13 29Z';
  G.caffe = { w: [['#7A4A2E', L('M13 29Q30 35 47 29Q30 23 13 29Z')]], d: L(cup) + L('M13 29Q30 35 47 29') + L('M46.5 34C55 34 55 44 44 45') + L('M7 56Q30 62 53 56Q30 50 7 56Z') + L('M23 21C19 17 27 13 23 9M33 21C29 17 37 13 33 9') };
}
// ── acqua, bibite, ghiaccio, sale
{
  const liq = 'M19 22L22.5 58H41.5L45 22Z';
  const bub = [[27, 50, 1.8], [36, 44, 1.5], [30, 38, 2], [38, 31, 1.6], [26, 29, 1.4], [34, 53, 1.4]].map(b => C(...b)).join('');
  G.soda = { w: [['#BFE0EA', L(liq)]], d: L('M18 10L22.5 58H41.5L46 10') + L('M19 22H45') + L('M22.5 58H41.5') + bub + L('M40 3L35 30') };
}
G.acqua = { w: [['#9CCBE4', L('M32 8C38 20 48 30 48 42C48 52 41 58 32 58C23 58 16 52 16 42C16 30 26 20 32 8Z')]], d: L('M32 8C38 20 48 30 48 42C48 52 41 58 32 58C23 58 16 52 16 42C16 30 26 20 32 8Z') + L('M23 42C23 48 26 51 30 52') };
G.ghiaccio = { w: [['#8EC3DD', L('M32 10L52 20L52 42L32 52L12 42L12 20Z')]], d: L('M32 10L52 20L32 30L12 20Z') + L('M12 20L12 42L32 52L32 30M52 20L52 42L32 52') + L('M17 26L17 36M47 26L47 31') };
{
  const glass = 'M20 28L44 28L46 58L18 58Z';
  G.sale = { w: [['#D9D3C8', L('M19.2 42L44.8 42L46 58L18 58Z')], ['#B9B2A6', L('M20 28C20 15 44 15 44 28Z')]], d: L(glass) + L('M20 28C20 15 44 15 44 28') + L('M19.2 42H44.8'), p: [[28, 21], [32, 19.5], [36, 21], [30, 24.5], [34, 24.5]].map(([x, y]) => C(x, y, 1)).join('') + [[51, 57], [54, 55], [52, 53], [56, 58]].map(([x, y]) => C(x, y, .9)).join('') };
}
G.bitter = { w: [['#8A3A22', L(bottle({ top: 11, nw: 8, nb: 17, sh: 24, bw: 24, bot: 60 }))], ['#E8C43A', `<rect x="27" y="4" width="10" height="8" rx="1.5"/>`]],
  d: L(bottle({ top: 11, nw: 8, nb: 17, sh: 24, bw: 24, bot: 60 })) + `<rect x="27" y="4" width="10" height="8" rx="1.5"/><rect x="17" y="25" width="30" height="27" rx="2"/>` + L('M23 32H41M25 37H39M23 45H41') };
// ── distillati e bottiglie
G.gin = { w: [['#9BC8C0', L('M28 9L28 20C28 24 18 26 18 32L18 57Q18 60 21 60L43 60Q46 60 46 57L46 32C46 26 36 24 36 20L36 9Z')]], d: L('M28 9L28 20C28 24 18 26 18 32L18 57Q18 60 21 60L43 60Q46 60 46 57L46 32C46 26 36 24 36 20L36 9Z') + `<rect x="27" y="4" width="10" height="6" rx="1"/><rect x="21" y="37" width="22" height="13" rx="1.5"/>` + L('M25 42H39M27 46H37') };
{
  const b = bottle({ top: 9, nw: 7, nb: 24, sh: 33, bw: 20, bot: 60 });
  G.vodka = { w: [['#CFE3EE', L(b)]], d: L(b) + `<rect x="27.5" y="4" width="9" height="6" rx="1"/>` + L('M32 41V53M27 44L37 50M37 44L27 50') + L('M25 36V56') };
}
{
  const b = bottle({ top: 12, nw: 9, nb: 20, sh: 30, bw: 28, bot: 60, r: 4 });
  G.rum = { w: [['#B8692A', L(b)]], d: L(b) + `<rect x="26.5" y="6" width="11" height="7" rx="1.5"/>` + E(32, 44, 10, 7) + L('M27 45Q32 41 37 45') };
}
{
  const lf = 'M0 0C3.5-10 3-24 0-38C-3-24-3.5-10 0 0Z';
  const ls = [[-62, .75], [-38, .9], [-14, 1], [10, 1], [34, .9], [58, .75]].map(([a, s]) => `<g transform="translate(32 56) rotate(${a}) scale(${s})"><path d="${lf}"/></g>`).join('');
  G.agave = { w: [['#7FB0A0', ls]], d: ls + L('M12 57H52') };
}
{
  const liq = 'M15.6 36L18 58H46L48.4 36Z';
  G.whisky = { w: [['#C98A2E', L(liq)]], d: L('M14 22L18 58H46L50 22') + L('M18 58H46M18.5 53H45.5') + L('M15.6 36H48.4') + `<rect x="21" y="27" width="11" height="11" rx="1.5" transform="rotate(-12 26.5 32.5)"/><rect x="31" y="29" width="10" height="10" rx="1.5" transform="rotate(10 36 34)"/>` };
}
{
  const bowl = 'M22 14C14 22 10 30 12 38C14 46 22 50 32 50C42 50 50 46 52 38C54 30 50 22 42 14';
  G.brandy = { w: [['#B5652A', L('M12.3 37C14 46 22 50 32 50C42 50 50 46 51.7 37Q32 40 12.3 37Z')]], d: L(bowl) + L('M22 14H42') + L('M12.3 37Q32 40 51.7 37') + L('M32 50V58M22 59Q32 56 42 59') };
}
{
  const dec = 'M28 9V18C16 22 12 32 12 42C12 54 20 60 32 60C44 60 52 54 52 42C52 32 48 22 36 18V9Z';
  G.liquore = { w: [['#C98A6A', L(dec)]], d: L(dec) + `<rect x="26.5" y="3" width="11" height="7" rx="2"/>` + E(32, 43, 10, 7) + L('M27 43H37') };
}
{
  const b = bottle({ top: 9, nw: 8, nb: 21, sh: 31, bw: 22, bot: 60 });
  G.bottiglia = { w: [['#C98A6A', L(b)]], d: L(b) + `<rect x="27.5" y="4" width="9" height="6" rx="1"/><rect x="23" y="38" width="18" height="14" rx="1.5"/>` + L('M26 43H38M28 47H36') };
}
{
  const bowl = 'M20 8C18 22 20 34 32 36C44 34 46 22 44 8';
  G.vino = { w: [['#8E2A3E', L('M19.4 20C20 30 24 35 32 36C40 35 44 30 44.6 20Z')]], d: L(bowl) + L('M20 8H44') + L('M19.4 20H44.6') + L('M32 36V56M21 59Q32 54 43 59Z') };
}
{
  const bowl = 'M25 4C24 16 25 30 32 34C39 30 40 16 39 4';
  G.spumante = { w: [['#F0DC8A', L('M24.6 12C24.5 21 26 30 32 34C38 30 39.5 21 39.4 12Z')]], d: L(bowl) + L('M25 4H39M24.6 12H39.4') + L('M32 34V55M23 58Q32 54 41 58Z') + C(30, 27, 1.2) + C(34, 22, 1) + C(31, 17, 1.1) + C(33, 29, .9) };
}
{
  const mug = 'M14 20H44V56Q44 60 40 60H18Q14 60 14 56Z';
  G.birra = { w: [['#E8A93A', L('M14 24H44V56Q44 60 40 60H18Q14 60 14 56Z')]], d: L(mug) + L('M44 27H50Q54 27 54 31V45Q54 49 50 49H44M44 32H48.5V44H44') + L('M12 21C9 15 15 10 20 13C22 7 31 7 33 12C36 7 44 9 45 14C50 15 49 23 44 23C38 25 30 24 24 25C18 26 13 25 12 21Z') + L('M22 31V53M29 31V53M36 31V53') };
}

// ── v90 (D41): ogni liquore la sua bottiglia, distillati simili con un segno, disegno per ogni cocktail
// v90: un disegno esistente rimpicciolito dentro un altro (tratto un po' più sottile, punti nel CSS)
const mini = (k, x, y, s, col, rot = 0) => {
  const g = G[k]; s = +s.toFixed(3); const t = `translate(${f1(x - 32 * s)} ${f1(y - 32 * s)}) scale(${s})${rot ? ` rotate(${rot} 32 32)` : ''}`;
  return { w: g.w.map((w, i) => [i === 0 && col || w[0], `<g transform="${t}">${w[1]}</g>`]), d: `<g transform="${t}" style="stroke-width:${f1(1.5 / s)}">${g.d}</g>`, p: g.p ? `<g transform="${t}">${g.p}</g>` : '' };
};
const join = (...p) => ({ w: p.flatMap(x => x.w || []), d: p.map(x => x.d || '').join(''), p: p.map(x => x.p || '').join('') });
const clean = o => ({ w: o.w, d: o.d, ...(o.p ? { p: o.p } : {}) });
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
  // v90: segni per distinguere i distillati simili
  decusse: (x, y) => ({ d: L(`M${x - 5} ${y - 5}L${x + 5} ${y + 5}M${x + 5} ${y - 5}L${x - 5} ${y + 5}`), w: [['#3F6FB0', C(x, y, 7)]] }),
  trifoglio: (x, y) => { const c = C(x, y - 3.2, 2.8) + C(x - 3, y + .6, 2.8) + C(x + 3, y + .6, 2.8); return { d: c + L(`M${x} ${y + 2}Q${x + 1} ${y + 5} ${x + 3} ${y + 7}`), w: [['#5E9E4E', c]] }; },
  spiga: (x, y) => ({ d: L(`M${x} ${y + 7}V${y - 7}`) + [-4, -.5, 3].map(dy => E(x - 2, y + dy, 2.4, 1.2, -35) + E(x + 2, y + dy, 2.4, 1.2, 35)).join('') + E(x, y - 6.5, 1.2, 2.2), w: [['#D9A846', C(x, y, 6)]] }),
  botte: (x, y) => { const b = `M${x - 5} ${y - 6}Q${x - 7.5} ${y} ${x - 5} ${y + 6}H${x + 5}Q${x + 7.5} ${y} ${x + 5} ${y - 6}Z`; return { d: L(b) + L(`M${x - 6.4} ${y - 2.5}H${x + 6.4}M${x - 6.4} ${y + 2.5}H${x + 6.4}`), w: [['#9A6A3A', L(b)]] }; },
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
  const [s, col, sb] = Array.isArray(n) ? n : LQ[n], S = SAG[s], [x, y, r] = S.lab;
  const sym = SIMB[sb] ? SIMB[sb](x, y) : mini(sb, x, y, r * 1.6 / 64 * 1.6, null);
  return join({ w: [[col, L(S.o)]], d: L(S.o) + S.cap + C(x, y, r + 1.5) }, { w: [['#FBF6EC', C(x, y, r + 1.5)]] }, sym);
}

// etichetta tonda con un segno (in basso a destra): distingue prodotti simili (whisky, brandy…)
function badge(sb, x = 51, y = 51, r = 9) {
  return join({ w: [['#FBF6EC', C(x, y, r)]], d: C(x, y, r) }, SIMB[sb] ? SIMB[sb](x, y) : mini(sb, x, y, r * .04));
}
const variant = (base, col, sb) => { const g = G[base]; return clean(join({ w: g.w.map((w, i) => [i === 0 && col || w[0], w[1]]), d: g.d, p: g.p || '' }, badge(sb))); };
const slug = n => 'lq_' + n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
// chiodi di garofano (prima erano la cannella)
{
  const cl = [[22, 18, -20], [34, 16, 8], [44, 24, 30]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 4V34"/>${C(0, 0, 4.5)}<path d="M-5 5L0 3L5 5"/></g>`).join('');
  G.garofano = { w: [['#7A4A2E', cl]], d: cl };
}
for (const n of Object.keys(LQ)) G[slug(n)] = clean(liq(n));
G.w_bourbon = variant('whisky', '#B0602A', 'botte'); G.w_rye = variant('whisky', '#C47A35', 'spiga'); G.w_scotch = variant('whisky', '#C98A2E', 'decusse');
G.w_torbato = variant('whisky', '#8A5A2A', 'fumo'); G.w_irl = variant('whisky', '#D9A040', 'trifoglio');
G.br_cognac = variant('brandy', '#A8562A', 'uva'); G.br_calvados = variant('brandy', '#C98A3A', 'mela');
G.grappa = clean(liq(['alta', '#EDEBE2', 'uva'])); G.rum_cachaca = variant('rum', '#E3D6B0', 'lime');
G.spu_prosecco = variant('spumante', '#DDE39A', 'uva'); G.tabasco = variant('bitter', '#C8322A', 'peperoncino');
const R0 = [...Object.keys(LQ).map(n => [n, slug(n)]),
  ['torbato', 'w_torbato'], ['irlandese', 'w_irl'], ['bourbon', 'w_bourbon'], ['rye', 'w_rye'], ['scotch', 'w_scotch'],
  ['cognac', 'br_cognac'], ['calvados', 'br_calvados'], ['grappa', 'grappa'], ['cachaça', 'rum_cachaca'], ['prosecco', 'spu_prosecco'],
  ['tabasco', 'tabasco'], ['garofano', 'garofano'], ['granatina', 'sciroppo', '#C0283A'], ['ginger ale', 'soda', '#EAD7A8'], ['basilico', 'menta', '#3E7A3A']];

// ── regole: nome dell'ingrediente (minuscolo) → disegno [, colore]
const R = [...R0,
  ['crema di whisky', 'liquore', '#D9B98A'], ['cherry brandy', 'liquore', '#B8323E'],
  ['peychaud', 'bitter', '#B8323E'], ['orange bitters', 'bitter', '#E9862E'], ['angostura', 'bitter'], ['worcestershire', 'bitter', '#5A3A2A'],
  ['^gin(?!ger)', 'gin'], ['vodka', 'vodka'], ['rum bianco|cachaça', 'rum', '#E3D6B0'], ['rum', 'rum'],
  ['tequila', 'agave'], ['mezcal', 'agave', '#9AA67A'],
  ['bourbon|rye|scotch|whisky', 'whisky'], ['drambuie', 'liquore', '#C98A2E'],
  ['pisco', 'brandy', '#E3D6B0'], ['cognac|brandy|calvados', 'brandy'],
  ['prosecco|champagne', 'spumante'], ['porto', 'vino', '#6E1F2E'], ['vino rosso', 'vino'], ['vino bianco', 'vino', '#EAD27A'],
  ['birra scura', 'birra', '#5A2E1E'], ['birra', 'birra'],
  ['campari', 'bottiglia', '#D0333A'], ['aperol', 'bottiglia', '#F07A2A'], ['vermouth rosso', 'bottiglia', '#8E2A2E'], ['vermouth dry|lillet', 'bottiglia', '#EAD27A'],
  ['suze', 'bottiglia', '#E8D45A'], ["pimm's", 'bottiglia', '#B5652A'], ['fernet|amaro|jägermeister', 'bottiglia', '#3E2A22'],
  ['triple sec', 'liquore', '#F0A23A'], ['amaretto', 'liquore', '#B5652A'], ['galliano', 'liquore', '#E8C43A'], ['curaçao', 'liquore', '#3F8FD2'],
  ['cassis', 'liquore', '#5B2A4E'], ['chartreuse verde|absinthe|melone|mela verde', 'liquore', '#8DBA3A'], ['chartreuse gialla|limoncello', 'liquore', '#E8D45A'],
  ['bénédictine', 'liquore', '#C98A2E'], ['liquore alla pesca|albicocca', 'liquore', '#F2A65A'], ['liquore al caffè|crème de cacao', 'liquore', '#5A3A2A'],
  ['sambuco', 'liquore', '#EDE3B0'], ['falernum', 'liquore', '#E3C98A'], ['crème de menthe', 'liquore', '#7FC08A'], ['mûre|mirto', 'liquore', '#4A2A55'],
  ['violette', 'liquore', '#8E6FC1'], ['liquore al lampone', 'liquore', '#D9445F'], ['liquore al frutto della passione', 'liquore', '#E9A13A'],
  ["liquore all'uovo", 'liquore', '#F2D27A'], ['sambuca', 'liquore', '#E6E8EE'], ['maraschino', 'liquore', '#EAE4D6'], ['liquore', 'liquore'],
  ['ghiaccio', 'ghiaccio'], ['tabasco|peperoncino', 'peperoncino'],
  ['lemon soda|limonata', 'soda', '#EAE07A'], ['soda al pompelmo', 'soda', '#F2B3A5'], ['cola', 'soda', '#6B3A2A'], ['ginger beer|ginger ale', 'soda', '#D8B36A'],
  ['energy', 'soda', '#9BCB4A'], ['tè freddo', 'soda', '#C98A4A'], ['tonica', 'soda', '#D9EEF0'], ['soda|frizzante', 'soda'],
  ['lime', 'lime'], ['sorbetto al limone|limone', 'limone'], ['pompelmo', 'pompelmo'], ["fiori d'arancio|sambuco|basilico", 'fiore'],
  ['arancia|mandarino', 'arancia'], ['ananas', 'ananas'], ['mirtillo', 'mirtillo'], ['lampone', 'mirtillo', '#D9445F'], ['fragol', 'fragola'],
  ['pesca', 'pesca'], ['granatina|melograno', 'melograno'], ['pomodoro', 'pomodoro'], ['cocco', 'cocco'], ['frutto della passione', 'passione'],
  ['cetriolo', 'cetriolo'], ['olive', 'oliva'], ['menta', 'menta'], ['cannella|garofano', 'cannella'],
  ['miele', 'miele'], ['zucchero di canna', 'zucchero', '#C9965A'], ['zollett|^zucchero', 'zucchero'], ['agave', 'sciroppo', '#D8B45A'], ['orzata', 'sciroppo', '#EDE3CF'], ['vaniglia', 'sciroppo', '#EAD9A8'], ['sciroppo', 'sciroppo'],
  ['albume|tuorlo|uovo', 'uovo'], ['panna|latte|gelato', 'panna'],
  ['camomilla', 'caffe', '#E2B84A'], ['caffè', 'caffe'], ['sale', 'sale'], ['acqua', 'acqua'],
];
for (const [, k] of R) if (!G[k]) throw new Error('disegno mancante: ' + k);
// ── cocktail (v90): bicchiere + colore del drink calcolato dagli ingredienti + ghiaccio, bollicine, guarnizione
const CKS = JSON.parse(readFileSync(new URL('../data/cocktail.json', import.meta.url), 'utf8')).c;
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
const ruleOf = n => R.find(r => new RegExp(r[0]).test(n.toLowerCase().replace(/\s*\(.*\)$/, '')));
const ingCol = n => { const r = ruleOf(n); return r ? (r[2] || G[r[1]].w[0][0]) : null; };
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
// pezzi del disegno, salvati una volta sola (PZ) e richiamati per nome da ogni cocktail (K)
// v92 (D42, scelta di Mario #97 «A lista + B scheda»): w = [colore, forme, opacità?], d = penna, f = penna fine, p = punti, h = riflessi bianchi
const PZ = {}, K = {};
const joinX = (...p) => { const o = { w: p.flatMap(x => x.w || []) }; for (const k of ['d', 'f', 'p', 'h']) { const s = p.map(x => x[k] || '').join(''); if (s) o[k] = s; } return o; };
const put = (key, part) => { if (!PZ[key]) PZ[key] = joinX(...[].concat(part)); return key; };
const sw = (w, s) => `<g style="stroke-width:${w}">${s}</g>`;
// cubetto di ghiaccio con le facce (davanti, sopra, lato) e un riflesso
function iceC(x, y, s, a = 0) {
  const t = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a})">`, q = n => f1(n * s);
  const top = `M${q(-1)} ${q(-.6)}L${q(-.4)} ${q(-1.3)}L${q(1.2)} ${q(-1.4)}L${q(.7)} ${q(-.8)}Z`, side = `M${q(.7)} ${q(-.8)}L${q(1.2)} ${q(-1.4)}L${q(1.3)} ${q(.3)}L${q(.8)} ${q(1)}Z`;
  return { w: [['#fff', `${t}<path d="${top}"/></g>`, .55], ['#fff', `${t}<path d="${side}"/></g>`, .25]],
    f: `${t}<path d="M${q(-1)} ${q(-.6)}L${q(.7)} ${q(-.8)}L${q(.8)} ${q(1)}L${q(-.9)} ${q(1)}Z"/><path d="${top}"/><path d="${side}"/></g>`,
    h: `${t}<path d="M${q(-.6)} ${q(-.2)}L${q(-.5)} ${q(.5)}"/></g>` };
}
// fetta d'agrume intera (buccia, polpa, spicchi) o mezza fetta
const AGR = { lime: ['#7FA83A', '#C8DE7A', 8], limone: ['#E2BC2C', '#F7E58A', 8], arancia: ['#E8932E', '#F7C266', 9], pompelmo: ['#E0705E', '#F4B0A0', 10] };
function wheel(k, cx, cy, r, mezza) {
  const [peel, pulp, n] = AGR[k];
  if (mezza) {
    const arc = rr => `M${f1(cx - rr)} ${f1(cy)}A${f1(rr)} ${f1(rr)} 0 0 0 ${f1(cx + rr)} ${f1(cy)}Z`;
    const sp = Array.from({ length: 4 }, (_, i) => { const t = rad((i + 1) * 36); return `M${f1(cx)} ${f1(cy)}L${P(cx + r * .8 * Math.cos(t), cy + r * .8 * Math.sin(t))}`; }).join('');
    const g = s => `<g transform="rotate(-18 ${f1(cx)} ${f1(cy)})">${s}</g>`;
    return { w: [[peel, g(`<path d="${arc(r)}"/>`), .8], [pulp, g(`<path d="${arc(r * .82)}"/>`), .7]], d: sw(1.6, g(`<path d="${arc(r)}"/>`)), f: g(`<path d="${arc(r * .82)}"/><path d="${sp}"/>`) };
  }
  const sp = Array.from({ length: n }, (_, i) => { const t = rad(10 + i * 360 / n); return `M${P(cx + r * .18 * Math.cos(t), cy + r * .18 * Math.sin(t))}L${P(cx + r * .76 * Math.cos(t), cy + r * .76 * Math.sin(t))}`; }).join('');
  return { w: [[peel, C(cx, cy, r), .75], [pulp, C(cx, cy, r * .82), .7]], d: sw(1.6, C(cx, cy, r)), f: C(cx, cy, r * .82) + `<path d="${sp}"/>`, p: C(cx, cy, .6) };
}
// foglia di menta/basilico con le nervature
const LF = 'M0 0C5-7 15-8 22-1C15 6 5 6 0 0Z', LV = 'M1 0L20-1M6 0L9-4M11-.3L14-4.4M6 .4L9 3.6M11 .2L14 3.8';
const leafX = (x, y, a, s, c = '#5FAE6E') => { const t = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a}) scale(${s})">`; return { w: [[c, `${t}<path d="${LF}"/></g>`, .8]], d: `${t}<path d="${LF}" style="stroke-width:${f1(1.5 / s)}"/></g>`, f: `${t}<path d="${LV}" style="stroke-width:${f1(.8 / s)}"/></g>` }; };
const sprig = (x, y, c) => joinX(leafX(x, y, -70, .55, c), leafX(x, y, -115, .5, c), leafX(x, y - 3, -92, .42, c));
const bean = (x, y, a) => { const t = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a})">`; return { w: [['#4A2C1E', `${t}<ellipse rx="3" ry="2"/></g>`, .95]], d: sw(1.2, `${t}<ellipse rx="3" ry="2"/></g>`), f: `${t}<path d="M-2.4 .3C-1-.8 1 1 2.4-.3"/></g>`, h: `${t}<path d="M-1.8-1.1L.2-1.5" style="stroke-width:.7"/></g>` }; };
// guarnizioni: parola nella guarnizione → disegno (max 2)
const GAR = [[/oliv/i, 'oliva'], [/cipollin/i, 'cipolla'], [/ciliegin|amarena/i, 'ciliegia'], [/scorza (lunga )?di limone|scorza di lime/i, 'scorzaL'], [/scorza d'arancia|scorza di pompelmo/i, 'scorzaA'],
  [/lime/i, 'lime'], [/limone/i, 'limone'], [/pompelmo/i, 'pompelmo'], [/arancia|agrumi/i, 'arancia'], [/menta/i, 'menta'], [/basilico/i, 'basilico'], [/ananas/i, 'ananas'], [/fragol/i, 'fragola'], [/lampon|more/i, 'mirtillo'],
  [/mela/i, 'mela'], [/cetriolo/i, 'cetriolo'], [/peperoncino/i, 'peperoncino'], [/sedano/i, 'sedano'], [/caffè/i, 'chicchi'], [/noce moscata|cacao|cannella/i, 'polvere'], [/panna/i, 'pannaS'], [/cocco/i, 'polvere'], [/frutto della passione/i, 'passione']];
function garn(txt, B, bk) {
  const out = [], [rx, ry] = B.rim; const seen = new Set();
  for (const [re, k] of GAR) { if (out.length >= 2) break; if (re.test(txt) && !seen.has(k)) { seen.add(k); out.push(k); } }
  return out.map((k, i) => {
    const x = rx - i * 11, y = ry; let p, key = k;
    if (k === 'scorzaL' || k === 'scorzaA') { const col = k === 'scorzaL' ? '#F2CF3B' : '#F0A23A'; const d = `M${x - 6} ${y - 6}C${x - 2} ${y - 12} ${x + 4} ${y - 2} ${x + 8} ${y - 8}`; p = { w: [[col, `<path d="${d}" style="stroke:${col};stroke-width:4;fill:none"/>`]], d: L(d), f: L(`M${x - 4} ${y - 8.6}C${x - 1} ${y - 11} ${x + 3} ${y - 5} ${x + 6} ${y - 9}`) }; }
    else if (AGR[k]) { const mz = k === 'arancia' && /mezza|spicchio/i.test(txt); key += mz ? 'M' : ''; p = wheel(k, x, y, 6.2, mz); }
    else if (k === 'menta' || k === 'basilico') p = sprig(x - 3, y + 1, k === 'menta' ? '#5FAE6E' : '#3F8F4E');
    else if (k === 'chicchi') p = joinX(bean(26, B.top - .4, -15), bean(32, B.top - 1.2, 5), bean(38, B.top - .4, 20));
    else if (k === 'polvere') p = { p: [[-8, 0], [-3, -1], [2, 0], [7, -1], [-5, 1], [5, 1], [0, 1]].map(([a, b]) => C(32 + a, B.top + b, .7)).join('') };
    else if (k === 'pannaS') p = { d: L(`M18 ${B.top}Q32 ${B.top - 7} 46 ${B.top}`), w: [['#FBF6EC', L(`M18 ${B.top}Q32 ${B.top - 7} 46 ${B.top}Z`), .9]], f: L(`M23 ${B.top - 2}Q28 ${B.top - 4.5} 33 ${B.top - 3}`) };
    else if (k === 'sedano') p = { d: L(`M${x - 4} ${y + 14}L${x + 4} ${y - 10}M${x - 1} ${y + 14}L${x + 7} ${y - 9}`) + E(x + 6, y - 12, 4, 2.5, -30), w: [['#9CC25A', E(x + 6, y - 12, 4, 2.5, -30)]], f: L(`M${x - 2.5} ${y + 12}L${x + 5} ${y - 9}`) };
    else if (k === 'cipolla') p = { d: L(`M${x - 8} ${y - 10}L${x + 4} ${y + 10}`) + C(x - 4, y - 3, 2.6) + C(x, y + 3, 2.6), w: [['#EFE9D8', C(x - 4, y - 3, 2.6) + C(x, y + 3, 2.6)]], h: L(`M${x - 5.2} ${y - 4}L${x - 4.4} ${y - 4.6}M${x - 1.2} ${y + 2}L${x - .4} ${y + 1.4}`) };
    else if (k === 'oliva') p = joinX({ d: L(`M${x - 9} ${y - 12}L${x + 3} ${y + 12}`) }, mini('oliva', x - 2, y + 2, .3), { h: L(`M${x - 4} ${y}L${x - 3} ${y - 1}`) });
    else { p = mini(k, x, y, .34); p.d = p.d.replace(/stroke-width:[\d.]+/, 'stroke-width:3.6'); }
    return put(`g|${bk}|${key}|${i}`, p);
  });
}
// dettagli dei bicchieri (D42): h riflesso, sh ombra [y, larghezza], f linee fini (spessore del vetro), bot fondo del liquido, dr goccioline (solo scheda)
const DET = {
  'Old fashioned': { h: 'M19.6 28L21.6 51', sh: [59.6, 17], f: 'M16.7 25.5L19.2 54.5H44.8L47.3 25.5', bot: 54, dr: [[23, 47], [42, 50, 1], [40, 38, .8]] },
  'Highball': { h: 'M23.4 12L24.6 52', sh: [60.4, 13], f: 'M21.6 9.5L23.3 56.4H40.7L42.4 9.5', bot: 56, dr: [[24, 30], [41, 44, 1], [40, 20, .8]] },
  'Collins': { h: 'M24.6 10L25.4 53', sh: [60.4, 12], f: 'M23.5 7.5L24.3 56.4H39.7L40.5 7.5', bot: 56, dr: [[26, 32], [39, 46, 1], [38, 22, .8]] },
  'Coppa martini': { h: 'M16 20L26 30.5', sh: [59.6, 11], dr: [[44, 24, .9], [20, 25, .8]] },
  'Coppetta': { h: 'M14 21C15 27 19 30 23 31.5', sh: [59.6, 11], dr: [[44, 27, .9], [36, 32, .8]] },
  'Coppa margarita': { h: 'M12 16C14 20 19 22 22 23', sh: [59.6, 11], dr: [[16, 19, .8], [47, 21, .9], [36, 30, .8]] },
  'Flûte': { h: 'M27 8C26.6 16 27 24 29 29', sh: [58.6, 10], dr: [[36, 16, .8], [35, 26, .7]] },
  'Calice': { h: 'M21 12C20 20 21 28 25 32', sh: [59.6, 12], dr: [[40, 24, .9], [36, 31, .8]] },
  'Balloon': { h: 'M17 18C14 24 14 30 17 35', sh: [59.6, 12], bot: 38, dr: [[44, 30, .9], [36, 36, .8], [22, 33, .8]] },
  'Hurricane': { h: 'M24 10C23.5 15 27 19 28.5 24M22 44Q21.5 50 24 52', sh: [60.6, 10], bot: 53, dr: [[38, 46, .9], [34, 26, .8], [26, 50, .8]] },
  'Tiki': { h: 'M21.5 12L22.8 54', sh: [61, 14] },
  'Tazza di rame': { h: 'M18 18V52', sh: [61, 18], f: 'M14 17.5H44M41 18V54' },
  'Julep': { h: 'M20 16L22 52', sh: [59.4, 15], f: 'M17.5 15H46.5' },
  'Irish coffee': { h: 'M20.5 12C20 22 22 30 26 34', sh: [59.6, 11], dr: [[40, 28, .9], [36, 34, .8]] },
  'Tazza': { h: 'M15.5 26V48', sh: [60.6, 21], f: 'M14.5 21.5H43.5' },
  'Boccale': { h: 'M17.5 20V54', sh: [61, 18], f: 'M16.5 16V56Q16.5 57.6 18 57.6H40Q41.5 57.6 41.5 56V16', dr: [[37, 30, 1], [24, 44, .9], [39, 50, .8]] },
  'Shot': { h: 'M25 32L26.5 54', sh: [59.4, 9], f: 'M23.4 29.5L25.9 56.2H38.1L40.6 29.5', dr: [[37, 46, .8]] },
};
// macchia d'acquerello dietro il bicchiere (solo scheda grande): contorno ondulato intorno al bicchiere
function splash(o) {
  const n = o.match(/-?[\d.]+/g).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 4, rx = Math.min(30, (x1 - x0) / 2 + 9), ry = Math.min(30, (y1 - y0) / 2 + 2);
  const W = [1, .86, 1.04, .9, 1.06, .84, 1, .92];
  const pt = i => { const t = rad(i * 45 + 20); return [cx + rx * W[i % 8] * Math.cos(t), cy + ry * W[(i + 3) % 8] * Math.sin(t)]; };
  let d = `M${P(...pt(0))}`;
  for (let i = 0; i < 8; i++) { const a = pt(i), b = pt(i + 1), t = rad(i * 45 + 42.5), k = 1.12; d += `Q${P(cx + (a[0] - cx + b[0] - cx) / 2 * k + Math.cos(t), cy + (a[1] - cy + b[1] - cy) / 2 * k + Math.sin(t))} ${P(...b)}`; }
  return d + 'Z';
}
// bicchieri per l'app: l = forma del liquido, d = linee, f = linee fini, h = riflessi, m = superficie del drink, sh = ombra, x = macchia, dr = goccioline, op = colore se non trasparente
const BO = {};
for (const [k, B] of Object.entries(BIC)) {
  const lx = +B.liq.match(/^M([\d.]+)/)[1], D = DET[k], [x0, y0] = B.o.match(/^M([\d.]+) ([\d.]+)/).slice(1).map(Number);
  // gambo: due linee fini invece di una grossa
  let o = B.o, f = D.f ? L(D.f) : '';
  o = o.replace(/M32 ([\d.]+)V([\d.]+)/, (_, a, b) => { f += L(`M30.7 ${a}V${+b - .5}M33.3 ${a}V${+b - .5}`); return ''; });
  const rim = !B.opaco && !/^Tazza$|Boccale|Tazza di rame/.test(k) ? E(32, y0, 32 - x0, Math.max(1.2, (32 - x0) * .1)) : '';
  BO[k] = { l: B.liq, d: L(o) + rim + (B.extra || ''), ...(f ? { f } : {}), h: L(D.h), sh: D.sh, x: splash(B.o),
    ...(!B.opaco && B.top > B.rim[1] ? { m: E(32, B.top, 32 - lx, 1.9) } : {}), ...(D.dr ? { dr: D.dr } : {}), ...(B.opaco ? { op: B.opaco } : {}) };
}
const BASE = k => /^w_/.test(k) ? 'whisky' : /^br_/.test(k) ? 'brandy' : k;
const ICE_S = { 'Old fashioned': 5.2, Balloon: 4.4, Hurricane: 4 };
function cocktail(ck) {
  const [nome, , , bic, ing, gar, prep] = ck; const bk = BIC[bic] ? bic : 'Old fashioned', B = BIC[bk], D = DET[bk];
  const ks = [];
  const tritato = /ghiaccio tritato|crushed/i.test(prep);
  if (/ghiaccio/i.test(prep) && !/filtra|senza ghiaccio/i.test(prep) && B.ice && !B.opaco) {
    if (tritato) ks.push(put('it|' + bk, B.ice.flatMap(([x, y], i) => [iceC(x - 3, y - 2, 2.6, i * 23 % 40 - 20), iceC(x + 3, y + 3, 2.5, i * 31 % 50 - 25)])));
    else ks.push(put('i|' + bk, B.ice.map(([x, y], i) => iceC(x, y, ICE_S[bk] || 3.4, [-8, 10, -15, 20][i % 4]))));
  }
  // foglie pestate dentro il bicchiere
  const pesta = ing.find(i => /foglie di (menta|basilico)/i.test(i[2])) && /pesta/i.test(prep);
  if (pesta && !B.opaco && D.bot) { const b = D.bot, c = /basilico/i.test(ing.map(i => i[2]).join()) ? '#3F8F4E' : '#4E9A5E';
    ks.push(put('ml|' + bk + '|' + c, [leafX(25, b - 5, -30, .45, c), leafX(40, b - 8, 200, .42, c), leafX(29, b - 10, 20, .38, '#5FAE6E')])); }
  if ((B.bub || ing.some(i => /soda|tonica|ginger|prosecco|champagne|cola|frizzante|lemon|birra/i.test(i[2]))) && !B.opaco) {
    const pts = [[-4, 10, .9], [3, 16, .8], [-1, 22, .7], [5, 27, .8], [-6, 30, .6]].map(([a, b, r]) => [32 + a, B.top + b, r]).filter(([, y]) => !D.bot || y < D.bot - 1);
    ks.push(put('b|' + bk, [{ w: [['#fff', pts.map(([x, y, r]) => C(x, y, r)).join(''), .5]], f: pts.map(([x, y, r]) => C(x, y, r)).join('') }]));
  }
  if (/Tiki|Hurricane|Highball|Collins|Tazza di rame|Julep/.test(bk) && /ghiaccio tritato|cannuccia|crushed/i.test(prep + gar)) ks.push(put('s|' + bk, [{ w: [['#E8E2D4', L(`M37 ${B.top + 20}L50 2L52.4 2.8L39.6 ${B.top + 20.6}Z`), .5]], d: sw(1.2, L(`M37 ${B.top + 20}L50 2M39.6 ${B.top + 20.6}L52.4 2.8`)) }]));
  if (/bordo/i.test(gar)) {
    const [x0, y0] = B.o.match(/^M([\d.]+) ([\d.]+)/).slice(1).map(Number), rx = 32 - x0, ry = Math.max(1.2, rx * .1), half = /metà/i.test(gar), n = half ? 7 : 12;
    const pts = Array.from({ length: n }, (_, i) => { const x = x0 + 2 + i * (half ? rx - 2 : 2 * rx - 4) / (n - 1); return [x, y0 + ry * Math.sqrt(Math.max(0, 1 - ((x - 32) / rx) ** 2)) + (i % 2) * .5]; });
    const sq = pts.map(([x, y]) => `<rect x="${f1(x - .8)}" y="${f1(y - .8)}" width="1.6" height="1.6" transform="rotate(${Math.round(x * 37 % 90)} ${f1(x)} ${f1(y)})"/>`).join('');
    ks.push(put('r|' + bk + (half ? '|m' : ''), [{ w: [['#fff', sq, 1]], f: `<g style="stroke-width:.5">${sq}</g>` }]));
  }
  ks.push(...garn(gar, B, bk));
  // bicchiere non trasparente (tazza di rame, julep): etichetta con il distillato, se no i Mule sarebbero tutti uguali
  if (B.opaco && bk !== 'Tiki') {
    const al = ing.filter(x => x[3]).sort((a, b) => (+String(b[0]).replace(',', '.') || 0) - (+String(a[0]).replace(',', '.') || 0))[0];
    const r = al && ruleOf(al[2]);
    if (r) ks.push(put('m|' + bk + '|' + BASE(r[1]), badge(BASE(r[1]), 26, 46, 8.5)));
  }
  K[nome] = [bk, mix(ing), ...ks];
}
for (const ck of CKS) cocktail(ck);
const out = { v: 2, g: G, r: R, b: BO, pz: PZ, k: K };
writeFileSync(new URL('../data/bar-disegni.json', import.meta.url), JSON.stringify(out));
// anteprima per l'occhio (non va nell'app)
const svg = (g, c) => `<svg viewBox="0 0 64 64" class="br-dis">${g.w.map((w, i) => `<g class="wa" transform="translate(1.5 1.5)" fill="${i === 0 && c || w[0]}">${w[1]}</g>`).join('')}<g class="ink">${g.d}</g>${g.p ? `<g class="inkp">${g.p}</g>` : ''}</svg>`;
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f7f2e8;font:14px system-ui;color:#3a302b;padding:16px;width:1180px}
.g{display:grid;grid-template-columns:repeat(9,1fr);gap:10px}.it{text-align:center}.it .br-dis{width:96px;height:96px}.sm .br-dis{width:44px;height:44px}
.br-dis{overflow:visible;display:block;margin:0 auto}.br-dis .wa{opacity:.62;filter:url(#br-wash)}.br-dis .ink{fill:none;stroke:#2a2420;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.br-dis .inkp{fill:#2a2420}</style>
<svg width="0" height="0" style="position:absolute"><defs><filter id="br-wash" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="5"/><feGaussianBlur stdDeviation=".7"/></filter></defs></svg>
<div class="g">${Object.entries(G).map(([k, g]) => `<div class="it">${svg(g)}${k}</div>`).join('')}</div>
<div class="g sm" style="margin-top:20px">${Object.entries(G).map(([k, g]) => `<div class="it">${svg(g)}</div>`).join('')}</div>`;
writeFileSync(new URL('./bar-disegni-anteprima.html', import.meta.url), html);
console.log('disegni', Object.keys(G).length, 'regole', R.length, 'byte', JSON.stringify(out).length);
