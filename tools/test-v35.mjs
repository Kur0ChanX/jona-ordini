// v35: scadenze per lo staff, destinatari di «Oggi si ordina», QR da cucina, avviso ai gestori per i telefoni in attesa, «App da aggiornare».
// Parte 1: Worker con D1 finto (node:sqlite), Firestore e push finti. Parte 2: app con l'emulatore Firebase (Worker intercettato).
import { DatabaseSync } from 'node:sqlite';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

// --- parte 1: Worker ---
function d1() { const db = new DatabaseSync(':memory:');
  const st = (sql, args = []) => ({ bind: (...a) => st(sql, a), first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }), run: async () => { const r = db.prepare(sql).run(...args); return { success: true, meta: { changes: Number(r.changes) } }; } });
  return { prepare: sql => st(sql), batch: async l => { for (const x of l) await x.run(); }, raw: db }; }
const realNow = Date.now; let T = Date.parse('2026-10-05T08:00:00Z'); // lunedì, 10:00 a Roma
Date.now = () => T;
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const tok = (sub = 'uidGestore1') => b64u({ alg: 'RS256' }) + '.' + b64u({ sub, exp: T / 1000 + 3600 }) + '.firma';
const pushes = []; let membroDoc = { fields: { k: { stringValue: 'K'.repeat(24) } } };
globalThis.fetch = async (u, o = {}) => { u = String(u);
  if (u.includes('firestore.googleapis.com')) return new Response(JSON.stringify(membroDoc), { status: 200 });
  pushes.push(u); return new Response('', { status: 201 }); };
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const p256dh = Buffer.from(await crypto.subtle.exportKey('raw', ua.publicKey)).toString('base64url');
const sub = n => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/' + n, keys: { p256dh, auth: Buffer.alloc(16, 1).toString('base64url') } });
const W = (await import('../worker/src/index.js')).default;
const A0 = d1(); const env = { ALLEGATI0: A0, VAPID_JWK: JSON.stringify(jwk) };
const req = (path, body, t = tok(), m = 'POST', h = {}) => W.fetch(new Request('https://w' + path, { method: m, headers: Object.assign(t ? { authorization: 'Bearer ' + t } : {}, h), body: m === 'POST' ? JSON.stringify(body || {}) : undefined }), env);
const cron = c => new Promise(res => W.scheduled({ cron: c }, env, { waitUntil: p => p.then(res, res) }));
const piano = () => JSON.parse(A0.raw.prepare("SELECT v FROM prom WHERE id='piano'").get().v);
// piano vecchio (v34, senza gest e scad) non rompe il cron
A0.raw.exec("CREATE TABLE IF NOT EXISTS prom (id TEXT PRIMARY KEY, v TEXT NOT NULL)");
A0.raw.prepare("INSERT INTO prom (id, v) VALUES ('piano', ?)").run(JSON.stringify({ tz: 'Europe/Rome', forn: [], subs: [] }));
await cron('*/5 * * * *'); ok(pushes.length === 0, 'piano della v34 senza scadenze: nessun errore, nessun avviso');
let r = await req('/promemoria', { tz: 'Europe/Rome', subs: [sub('maurizio')], gest: [sub('maurizio'), sub('mario')], forn: [], scad: [
  { id: 'S1', nome: '', g: [0], avv: 570, entro: 660, subs: [sub('cuoco'), sub('cameriere')] },   // lunedì avviso 9:30, entro le 11:00
  { id: 'S2', nome: 'Pescheria', g: [0], avv: 630, entro: 690, subs: [sub('cuoco')] },          // avviso 10:30
  { id: 'S3', nome: 'Martedì', g: [1], avv: 570, entro: 660, subs: [sub('cuoco')] },
  { id: 'S4', nome: 'Sbagliata', g: [0], avv: 700, entro: 660, subs: [sub('cuoco')] },          // avviso dopo la scadenza: scartata
  { id: 'S5', nome: 'Nessuno', g: [0], avv: 570, entro: 660, subs: [] }] });
let j = await r.json();
ok(r.ok && j.scadenze === 4 && piano().gest.length === 2, 'piano con 4 scadenze valide e 2 gestori ' + JSON.stringify(j));
await cron('*/5 * * * *');
ok(pushes.length === 2 && pushes.every(u => /cuoco|cameriere/.test(u)), 'alle 10:00 avviso S1 a cuoco e cameriere, non ai gestori: ' + pushes.join(' '));
pushes.length = 0; T += 5 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 0, 'alle 10:05 niente doppioni');
T += 25 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 1 && pushes[0].endsWith('/cuoco'), 'alle 10:30 avviso S2 per la Pescheria');
pushes.length = 0; T = Date.parse('2026-10-05T09:05:00Z'); await cron('*/5 * * * *'); ok(pushes.length === 0, 'dopo l\'ora «entro» niente avviso');
pushes.length = 0; T = Date.parse('2026-10-06T08:00:00Z'); await cron('*/5 * * * *'); ok(pushes.length === 1, 'martedì solo S3');
// /richiesta: telefono in attesa avvisa i gestori
pushes.length = 0;
membroDoc = { fields: { ok: { booleanValue: true } } };
r = await req('/richiesta', {}, tok('uidNuovo1')); ok(r.status === 409 && !pushes.length, 'telefono già approvato: nessun avviso');
membroDoc = { fields: { ok: { booleanValue: false }, req: { mapValue: { fields: { nome: { stringValue: 'Luca' }, cognome: { stringValue: 'Rossi' } } } } } };
r = await req('/richiesta', {}, ''); ok(r.status === 403, 'senza gettone: 403');
r = await req('/richiesta', {}, tok('uidNuovo1')); j = await r.json();
ok(r.ok && pushes.length === 2 && pushes.some(u => u.endsWith('/mario')), 'richiesta in attesa: avviso ai 2 gestori ' + JSON.stringify(j));
r = await req('/richiesta', {}, tok('uidNuovo1')); j = await r.json(); ok(j.gia && pushes.length === 2, 'seconda richiesta entro 10 minuti: niente doppione');
// /inviti fisso e limite ai tentativi
membroDoc = { fields: { k: { stringValue: 'K'.repeat(24) } } };
r = await req('/inviti', { fisso: true }); const c1 = (await r.json()).codice;
const sc1 = A0.raw.prepare('SELECT scade FROM inviti WHERE c = ?').get(c1).scade;
ok(/^[A-HJ-NP-Z2-9]{6}$/.test(c1) && sc1 - T > 40 * 365 * 864e5, 'QR da cucina: codice che non scade');
r = await req('/inviti', {}); const c7 = (await r.json()).codice;
r = await req('/inviti', { fisso: true, vecchio: c1 }); const c2 = (await r.json()).codice;
const has = c => !!A0.raw.prepare('SELECT c FROM inviti WHERE c = ?').get(c);
ok(c2 !== c1 && !has(c1) && has(c2) && has(c7), 'Cambia QR: il vecchio fisso cancellato, l\'invito di 7 giorni resta');
const ip = { 'cf-connecting-ip': '1.2.3.4' };
r = await req('/invito/' + c2, null, '', 'GET', ip); ok(r.ok && (await r.json()).k === 'K'.repeat(24), 'codice del QR da cucina dà la chiave');
let st = []; for (let i = 0; i < 21; i++) st.push((await req('/invito/AAAAA' + 'BCDEFGHJ'[i % 8], null, '', 'GET', ip)).status);
ok(st.slice(0, 20).every(s => s === 404) && st[20] === 429, '20 codici sbagliati, poi 429 per un\'ora');
r = await req('/invito/' + c2, null, '', 'GET', ip); ok(r.status === 429, 'bloccato anche col codice giusto');
r = await req('/invito/' + c2, null, '', 'GET', { 'cf-connecting-ip': '5.6.7.8' }); ok(r.ok, 'un altro telefono entra');
T += 61 * 60000; r = await req('/invito/' + c2, null, '', 'GET', ip); ok(r.ok, 'dopo un\'ora si riprova');
Date.now = realNow;

// --- parte 2: app con l'emulatore ---
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG = { apiKey: 'fake-key', authDomain: 'demo-jona.firebaseapp.com', projectId: 'demo-jona', appId: '1:1:web:1' };
const proms = [], invia = [], inviti = [];
const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
await c.addInitScript(cfg => { localStorage.setItem('jona_fb_emu', JSON.stringify('127.0.0.1')); if (!localStorage.getItem('jona_fb')) localStorage.setItem('jona_fb', JSON.stringify(cfg)); }, CFG);
await c.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**', async rt => { const u = rt.request().url();
  if (u.endsWith('/promemoria')) { proms.push(JSON.parse(rt.request().postData())); return rt.fulfill({ status: 503, json: {} }); }
  if (u.endsWith('/invia')) { invia.push(JSON.parse(rt.request().postData())); return rt.fulfill({ json: { inviati: 1, scaduti: [], errori: [] } }); }
  if (u.endsWith('/inviti')) { const bd = JSON.parse(rt.request().postData() || '{}'); inviti.push(bd); return rt.fulfill({ json: { codice: bd.fisso ? (bd.vecchio ? 'QRNEW2' : 'QRCUC2') : 'SETTE7' } }); }
  rt.fulfill({ json: { ok: true } }); });
const A = await c.newPage(); const errs = []; A.on('pageerror', e => errs.push(e.message));
await A.goto('http://localhost:8765/index.html'); await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for (const [k, v] of Object.entries({ nome: 'Mario', cognome: 'Test', username: 'mario', pw: 'prova1234', pw2: 'prova1234' })) await A.fill('input[data-k="' + k + '"]', v);
await A.click('[data-a="setupGo"]'); await A.waitForTimeout(1200);
await A.evaluate(() => { fbActivate() }); await A.waitForTimeout(300); await A.click('#ask-ok'); await A.waitForTimeout(8000);
ok(await A.evaluate(() => S.db.kind === 'firebase' && S.db.status().ready), 'app su Firebase (emulatore)');
await A.evaluate(async () => {
  for (const [id, u] of Object.entries({ mau: { nome: 'Maurizio', cognome: 'Lai', ruolo: 'gm', reparto: 'cucina' }, chef2: { nome: 'Altro', cognome: 'Chef', ruolo: 'gm', reparto: 'cucina' },
    cuoco: { nome: 'Cuoco', cognome: 'Uno', ruolo: 'staff', reparto: 'cucina' }, cam: { nome: 'Cameriere', cognome: 'Uno', ruolo: 'staff', reparto: 'sala' } }))
    await put('staff', id, Object.assign({ username: id, stato: 'attivo', creato: now() }, u));
  for (const id of ['mau', 'chef2', 'cuoco', 'cam']) await fbInit().fs.collection('push').doc('p_' + id).set({ u: id, sub: { endpoint: 'https://fcm.googleapis.com/fcm/send/' + id, keys: { p256dh: 'BX', auth: 'Y' } }, creato: now() });
  await put('fornitori', 'pesce', { nome: 'Pescheria', metodo: 'email', categoria: 'Pesce', giorniOrdine: [0, 1, 2, 3, 4, 5, 6], oraPromemoria: '00:00', oraLimite: '' });
});
await A.waitForTimeout(2500);
// impostazioni: «Oggi si ordina» solo a Maurizio
await A.evaluate(() => { S.viewAs = 'gm'; render(); }); await A.click('[data-a="meMenu"]'); await A.click('[data-a="settings"]'); await A.waitForTimeout(500);
ok(await A.isVisible('text=«Oggi si ordina» arriva a') && await A.isVisible('text=Scadenze per lo staff') && await A.isVisible('text=QR da cucina'), 'Impostazioni: righe nuove visibili');
await A.click('[data-a="promA"][data-v="mau"]'); await A.waitForTimeout(800);
ok(await A.evaluate(() => JSON.stringify(cfg().promA) === '["mau"]'), 'scelto Maurizio');
// scadenza per la sala, avviso a mezzanotte, entro le 23:59, tutti i giorni
await A.click('[data-a="scEdit"][data-v=""]'); await A.waitForTimeout(400);
for (const g of ['6']) await A.click('[data-a="scDay"][data-v="' + g + '"]');
await A.fill('#sc-entro', '23:59'); await A.fill('#sc-avv', '23:59'); await A.click('[data-a="scSave"]'); await A.waitForTimeout(300);
ok(await A.evaluate(() => /prima/.test(document.querySelector('.toast')?.textContent || '')), 'avviso dopo «Entro le»: errore spiegato');
await A.fill('#sc-avv', '00:00'); await A.click('[data-a="scRep"][data-v="sala"]'); await A.selectOption('#sc-f', 'pesce'); await A.click('[data-a="scSave"]'); await A.waitForTimeout(800);
const sc = await A.evaluate(() => cfg().scad);
ok(sc.length === 1 && sc[0].g.length === 7 && sc[0].entro === '23:59' && sc[0].avv === '00:00' && sc[0].f === 'pesce' && JSON.stringify(sc[0].rep) === '["sala"]', 'scadenza salvata ' + JSON.stringify(sc));
ok(await A.isVisible('text=Pescheria · entro le 23:59'), 'scadenza in elenco');
await A.screenshot({ path: '/tmp/v35-impostazioni.png', fullPage: false });
await A.evaluate(() => { while (sheets.length) closeSheet(true); });
// promemoria come Admin Chef (server giù: push dall'app)
await A.evaluate(() => { ls('jona_rem', null); S.me = 'mau'; ls('jona_me', 'mau'); S.viewAs = null; render(); });
await A.waitForTimeout(500); await A.evaluate(() => deadlineTick()); await A.waitForTimeout(2500);
const pl = proms[proms.length - 1];
ok(pl && pl.subs.length === 1 && pl.subs[0].endpoint.endsWith('/mau') && pl.gest.length >= 2 && pl.scad.length === 1 && pl.scad[0].subs.length === 1 && pl.scad[0].subs[0].endpoint.endsWith('/cam') && pl.scad[0].nome === 'Pescheria',
  'piano: «Oggi si ordina» solo a Maurizio, scadenza solo al cameriere (sala)');
const notifs = await A.evaluate(() => Object.values(D().notifiche).map(n => ({ a: n.a, t: n.titolo, tipo: n.tipo })));
ok(notifs.some(n => n.a === 'mau' && /^Oggi si ordina da Pescheria/.test(n.t)) && !notifs.some(n => n.a === 'gm' && /^Oggi si ordina/.test(n.t)), 'campanella: «Oggi si ordina» solo per Maurizio');
ok(notifs.filter(n => n.tipo === 'scadenza' && /^Richieste per Pescheria entro le 23:59/.test(n.t)).map(n => n.a).join() === 'cam', 'campanella: scadenza solo al cameriere');
ok(invia.some(x => /^Oggi si ordina/.test(x.titolo) && JSON.stringify(x).includes('/mau') && !JSON.stringify(x).includes('/chef2')), 'server giù: push «Oggi si ordina» solo a Maurizio');
ok(invia.some(x => /^Richieste per Pescheria/.test(x.titolo) && JSON.stringify(x).includes('/cam') && !JSON.stringify(x).includes('/cuoco')), 'server giù: push della scadenza al cameriere');
const n0 = invia.length; await A.evaluate(() => deadlineTick()); await A.waitForTimeout(1500);
ok(invia.length === n0, 'secondo giro: niente doppioni');
// lo staff vede il suo avviso a schermo
await A.evaluate(() => { ls('jona_rem', null); S.me = 'cam'; ls('jona_me', 'cam'); render(); }); await A.waitForTimeout(300);
await A.evaluate(() => deadlineTick()); await A.waitForTimeout(800);
ok(await A.evaluate(() => [...document.querySelectorAll('.toast')].some(t => /Richieste per Pescheria/.test(t.textContent))), 'cameriere: avviso a schermo');
ok(await A.evaluate(() => myNotifs(meU()).some(n => /Richieste per Pescheria/.test(n.titolo))), 'cameriere: avviso nella sua campanella');
// QR da cucina
await A.evaluate(() => { S.me = 'mau'; ls('jona_me', 'mau'); render(); }); await A.click('[data-a="meMenu"]'); await A.click('[data-a="settings"]'); await A.waitForTimeout(400);
await A.evaluate(() => { navigator.canShare = () => false; });
const dl = A.waitForEvent('download', { timeout: 15000 }).catch(() => null);
await A.click('[data-a="qfNew"][data-v=""]'); const d1f = await dl; await A.waitForTimeout(800);
ok(inviti[0] && inviti[0].fisso === true && await A.evaluate(() => cfg().qrFisso.c === 'QRCUC2'), 'Crea il QR: codice fisso salvato');
ok(d1f && d1f.suggestedFilename() === 'qr-cucina-jona.png', 'immagine del QR da cucina pronta ' + (d1f && d1f.suggestedFilename()));
if (d1f) await d1f.saveAs('/tmp/v35-qr-cucina.png');
await A.click('[data-a="qfNew"][data-v="1"]'); await A.waitForTimeout(300); await A.click('#ask-ok'); await A.waitForTimeout(1500);
ok(inviti[1] && inviti[1].vecchio === 'QRCUC2' && await A.evaluate(() => cfg().qrFisso.c === 'QRNEW2'), 'Cambia QR: manda il vecchio da cancellare');
await A.evaluate(() => { while (sheets.length) closeSheet(true); });
// «App da aggiornare»
ok(!(await A.isVisible('text=App da aggiornare')), 'nessun avviso di aggiornamento all\'inizio');
await A.evaluate(() => updOn()); await A.waitForTimeout(400);
ok(await A.isVisible('text=App da aggiornare') && await A.isVisible('[data-a="reload"]:has-text("Aggiorna ora")'), 'avviso «App da aggiornare» con «Aggiorna ora»');
await A.screenshot({ path: '/tmp/v35-aggiorna.png' });
ok(!errs.length, 'nessun errore nella pagina ' + errs.join(' | '));

// telefono in attesa: dopo la richiesta chiama /richiesta
const rq = [];
const cB = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
const key = await A.evaluate(() => ls('jona_key'));
await cB.addInitScript(cfg => { localStorage.setItem('jona_fb_emu', JSON.stringify('127.0.0.1')); localStorage.setItem('jona_fb', JSON.stringify(cfg)); }, CFG);
await cB.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**', rt => { if (rt.request().url().endsWith('/richiesta')) rq.push(rt.request().headers().authorization || ''); rt.fulfill({ json: { ok: true } }); });
const B = await cB.newPage(); B.on('pageerror', e => errs.push('B: ' + e.message));
await B.goto('http://localhost:8765/index.html#k=' + key); await B.waitForTimeout(7000);
await B.click('[data-a="phOld"]'); await B.fill('#ph-nome', 'Luca'); await B.click('[data-a="phSend"]'); await B.waitForTimeout(2500);
ok(rq.length === 1 && rq[0].startsWith('Bearer '), 'telefono in attesa: avviso ai gestori chiesto al server');
ok(!errs.length, 'nessun errore nel telefono in attesa ' + errs.join(' | '));
await b.close();
process.exit(fail ? 1 : 0);
