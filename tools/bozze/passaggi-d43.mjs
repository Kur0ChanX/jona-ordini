// D43 bozza: «Come si fa» oggi (una frase) e nuovo (passi numerati). Uso: node tools/bozze/passaggi-d43.mjs <uscita-senza-.png>
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const C = [
 ['Mojito', 'Pesta piano menta, lime e zucchero (senza rompere le foglie), ghiaccio tritato, rum, completa con soda.', [
  'Nel bicchiere alto metti le foglie di menta, lo zucchero di canna e il succo di lime.',
  'Pesta piano 4-5 volte: la menta va schiacciata, non strappata (se no diventa amara).',
  'Riempi il bicchiere di ghiaccio tritato fino all\'orlo.',
  'Versa il rum e mescola dal basso verso l\'alto con il cucchiaio lungo.',
  'Completa con la soda, aggiungi un po\' di ghiaccio e metti il rametto di menta e il lime.']],
 ['Negroni', 'Versa sul ghiaccio e mescola qualche secondo.', [
  'Riempi il bicchiere basso di ghiaccio (meglio un cubo grande, si scioglie piano).',
  'Versa gin, Campari e vermouth rosso: 3 cl ciascuno.',
  'Mescola con il cucchiaio lungo per 10-15 secondi.',
  'Metti la mezza fetta d\'arancia dentro il bicchiere.']],
 ['Margarita', 'Bordo con il sale, shakera e filtra.', [
  'Raffredda la coppa: riempila di ghiaccio e acqua, poi svuotala.',
  'Passa uno spicchio di lime su metà bordo e appoggialo nel sale.',
  'Nello shaker metti tequila, triple sec, succo di lime e tanto ghiaccio.',
  'Shakera forte per 10-12 secondi, finché lo shaker è freddo.',
  'Filtra nella coppa (senza ghiaccio) e metti la rotella di lime sul bordo.']]];
const page = ([n, old, st], i) => `<div class="ph" id="p${i}"><h1>${n}</h1>
<div class="lb">Oggi</div><div class="box old"><p>${old}</p></div>
<div class="lb">Nuovo · ${st.length} passi</div><div class="box"><ol>${st.map(s => `<li><span>${s}</span></li>`).join('')}</ol></div><div class="pn">${i + 1} di ${C.length}</div></div>`;
const html = `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#EFEBE6;font:16px "Jost",system-ui;color:#2B2321;width:390px}
.ph{padding:18px 16px 10px;background:#fff;margin-bottom:8px}h1{font-weight:500;font-size:26px;margin:0 0 14px}.lb{font-size:13px;color:#8A7F76;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em}
.box{background:#F6F3EF;border-radius:14px;padding:12px 14px}.old p{margin:0;line-height:1.45;color:#5E534D}ol{margin:0;padding:0;list-style:none;counter-reset:n}
li{counter-increment:n;display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #E4DDD5;line-height:1.4}li:last-child{border:0}
li::before{content:counter(n);flex:none;width:26px;height:26px;border-radius:50%;background:#1F7F86;color:#fff;font-weight:600;font-size:14px;display:grid;place-items:center}.pn{text-align:right;color:#9a8d80;font-size:12px;margin-top:10px}</style>${C.map(page).join('')}`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.setContent(html);
for (let i = 0; i < C.length; i++) await p.locator('#p' + i).screenshot({ path: `${process.argv[2]}-${i + 1}.png` });
await br.close();
