// D39 / v89: disegni degli ingredienti del Bar, stile B «inchiostro e acquerello» (scelta di Mario #93).
// Ogni disegno sta in un quadrato 64×64: w = macchie d'acquerello [colore, forme], d = linee a penna, p = punti pieni.
// r = regole (sul nome in minuscolo, in ordine, vince la prima) → [espressione, disegno, colore che sostituisce il primo acquerello].
// Uso: node tools/bar-disegni.mjs  → scrive data/bar-disegni.json e tools/bar-disegni-anteprima.html
import { writeFileSync } from 'fs';
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

// ── regole: nome dell'ingrediente (minuscolo) → disegno [, colore]
const R = [
  ['crema di whisky', 'liquore', '#D9B98A'], ['cherry brandy', 'liquore', '#B8323E'],
  ['peychaud', 'bitter', '#B8323E'], ['orange bitters', 'bitter', '#E9862E'], ['angostura', 'bitter'], ['worcestershire', 'bitter', '#5A3A2A'],
  ['^gin', 'gin'], ['vodka', 'vodka'], ['rum bianco|cachaça', 'rum', '#E3D6B0'], ['rum', 'rum'],
  ['tequila', 'agave'], ['mezcal', 'agave', '#9AA67A'],
  ['bourbon|rye|scotch|whisky', 'whisky'], ['drambuie', 'liquore', '#C98A2E'],
  ['pisco|grappa', 'brandy', '#E3D6B0'], ['cognac|brandy|calvados', 'brandy'],
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
const out = { v: 1, g: G, r: R };
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
