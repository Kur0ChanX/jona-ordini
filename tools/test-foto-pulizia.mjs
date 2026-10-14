// v116 (D55): la foto della bolla nel controllo merce (`ricezione.foto`) si toglie dopo 30 giorni, una volta al giorno, dal telefono di un gestore.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = 'http://localhost:8765/'; let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
await ctx.route('**/firebase-config.js', r => r.fulfill({ contentType: 'application/javascript', body: 'self.JONA_FIREBASE=null' }));
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto(URL + 'index.html');
await p.click('[data-a="formset"][data-v="dev"]');
for (const [k, v] of [['nome', 'Prova'], ['cognome', 'Rossi'], ['username', 'prova'], ['pw', 'password123'], ['pw2', 'password123']]) await p.fill(`input[data-k="${k}"]`, v);
await p.click('[data-a="setupGo"]'); await p.waitForSelector('.testbar');
ok(await p.evaluate(() => APP_VER) >= 116, 'APP_VER 116+');
ok(await p.evaluate(async () => (await newsOld(), newsList()).some(n => n.v === 116 && n.chef.length)), 'novità v116 per i gestori');
const r = await p.evaluate(async () => {
  const st = Object.entries(D().staff), mgr = st.find(([, u]) => isMgr(u)), oth = st.find(([, u]) => !isMgr(u));
  if (!oth) { await put('staff', 'fp_staff', { id: 'fp_staff', nome: 'Staff', cognome: 'Prova', ruolo: 'staff', reparto: 'cucina' }); }
  const oth2 = oth || ['fp_staff', D().staff.fp_staff];
  const G = 864e5, t = now(), foto = 'data:image/jpeg;base64,AAAA';
  const mk = (id, gg) => put('ordini', id, { id, creato: t - gg * G, inviato: t - gg * G, ricevuto: t - gg * G, items: [], ricezione: { righe: [], note: 'n', foto } });
  await mk('fp_vecchio', 40); await mk('fp_limite', 29); await mk('fp_nuovo', 2);
  const f = id => (JSON.parse(localStorage.getItem(lsK('jona_db_v2'))).ordini[id] || {}).ricezione || {};
  const out = {};
  ls('jona_fotopul', null);
  S.me = oth2[0]; out.staffNo = !isMgr(realU()); await fotoPulisci(); out.staff = out.staffNo && f('fp_vecchio').foto === foto;
  S.me = mgr[0]; await fotoPulisci(); await new Promise(r => setTimeout(r, 300));
  out.vecchio = f('fp_vecchio').foto === '' && f('fp_vecchio').note === 'n' && Array.isArray(f('fp_vecchio').righe);
  out.limite = f('fp_limite').foto === foto; out.nuovo = f('fp_nuovo').foto === foto;
  // stesso giorno: non rifà il giro
  await mk('fp_vecchio2', 45); await fotoPulisci(); out.unaVolta = f('fp_vecchio2').foto === foto;
  // giorno dopo: guarda solo gli ordini dopo l'ultimo segno
  const s = ls('jona_fotopul'); ls('jona_fotopul', { g: 'ieri', f: s.f - G }); await mk('fp_ieri', 30.5);
  await fotoPulisci(); await new Promise(r => setTimeout(r, 300));
  out.ieri = f('fp_ieri').foto === ''; out.saltato = f('fp_vecchio2').foto === foto;
  return out;
});
ok(r.staff, 'staff non gestore: non tocca niente');
ok(r.vecchio, 'ordine di 40 giorni: foto tolta, righe e note restano');
ok(r.limite && r.nuovo, 'ordini di 29 e 2 giorni: foto restano');
ok(r.unaVolta, 'stesso giorno: una volta sola');
ok(r.ieri, 'giorno dopo: ordine passato i 30 giorni pulito');
ok(r.saltato, 'giorno dopo: non rilegge gli ordini già passati (solo dal segno in poi)');
ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
await b.close(); console.log(fail ? fail + ' FAIL' : 'OK'); process.exit(fail ? 1 : 0);
