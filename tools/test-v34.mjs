// v34: promemoria ordini dal server. Parte 1: Worker (/promemoria, cron ogni 5 minuti) con D1 finto (node:sqlite), Firestore e push finti.
// Parte 2: app con l'emulatore Firebase (server worker/ intercettato): piano mandato solo se cambia, niente push doppia, ripiego se il server non risponde.
import { DatabaseSync } from 'node:sqlite';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

// --- parte 1: Worker ---
function d1() { const db = new DatabaseSync(':memory:');
  const st = (sql, args = []) => ({ bind: (...a) => st(sql, a), first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }), run: async () => { db.prepare(sql).run(...args); return { success: true, meta: {} }; } });
  return { prepare: sql => st(sql), raw: db }; }
const realNow = Date.now; let T = Date.parse('2026-10-05T08:00:00Z'); // lunedì, 10:00 a Roma
Date.now = () => T;
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const tok = () => b64u({ alg: 'RS256' }) + '.' + b64u({ sub: 'uidGestore1', exp: T / 1000 + 3600 }) + '.firma';
const pushes = [];
globalThis.fetch = async (u, o = {}) => { u = String(u);
  if (u.includes('firestore.googleapis.com')) return new Response('{}', { status: 200 });
  pushes.push(u); return new Response('', { status: u.endsWith('/morto') ? 410 : 201 }); };
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const p256dh = Buffer.from(await crypto.subtle.exportKey('raw', ua.publicKey)).toString('base64url');
const sub = n => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/' + n, keys: { p256dh, auth: Buffer.alloc(16, 1).toString('base64url') } });
const W = (await import('../worker/src/index.js')).default;
const A0 = d1(); const env = { ALLEGATI0: A0, VAPID_JWK: JSON.stringify(jwk) };
const post = (body, e = env, t = tok()) => W.fetch(new Request('https://w/promemoria', { method: 'POST', headers: t ? { authorization: 'Bearer ' + t } : {}, body: JSON.stringify(body) }), e);
const cron = c => new Promise(res => W.scheduled({ cron: c }, env, { waitUntil: p => p.then(res, res) }));
const piano = () => JSON.parse(A0.raw.prepare("SELECT v FROM prom WHERE id='piano'").get().v);
ok((await post({ forn: [] }, env, '')).status === 403, 'senza gettone: 403');
ok((await post({ forn: [] }, { VAPID_JWK: env.VAPID_JWK })).status === 503, 'senza D1: 503');
let r = await post({ tz: 'Europe/Rome', subs: [sub('chef'), sub('morto'), { endpoint: 'https://cattivo.example/x', keys: {} }], forn: [
  { id: 'A', nome: 'Pescheria', g: [0, 2], at: 570, lim: 660 },            // dovuto: lunedì, 9:30, entro le 11:00
  { id: 'B', nome: 'Martedì', g: [1], at: 570, lim: 660 },                 // non è il giorno
  { id: 'C', nome: 'Limite passato', g: [0], at: 540, lim: 600 },          // alle 10:00 l'ora limite è passata
  { id: 'D', nome: 'Già partito', g: [0], at: 570, lim: null, s: Date.parse('2026-10-05T06:00:00Z') },
  { id: 'E', nome: 'Più tardi', g: [0], at: 630, lim: null },              // 10:30
  { id: 'F', nome: 'Partito ieri', g: [0], at: 570, lim: null, s: Date.parse('2026-10-04T09:00:00Z') },
  { id: 'G', nome: 'Senza giorni', g: [9], at: 570 }] });
let j = await r.json();
ok(r.ok && j.fornitori === 6 && j.telefoni === 2, 'piano salvato: 6 fornitori, 2 telefoni (indirizzo estraneo scartato) ' + JSON.stringify(j));
await cron('17 3 * * *'); ok(pushes.length === 0, 'la pulizia notturna non manda promemoria');
await cron('*/5 * * * *');
ok(pushes.length === 3 && pushes.filter(u => u.endsWith('/morto')).length === 1, 'alle 10:00 avvisi solo per A (2 telefoni) e F (il telefono scaduto non si riprova): ' + pushes.length);
ok(piano().subs.length === 1 && piano().subs[0].endpoint.endsWith('/chef'), 'iscrizione scaduta (410) tolta dal piano');
pushes.length = 0; T += 5 * 60000; await cron('*/5 * * * *');
ok(pushes.length === 0, 'alle 10:05 niente doppioni');
T += 25 * 60000; await cron('*/5 * * * *');
ok(pushes.length === 1, 'alle 10:30 arriva E: ' + pushes.length);
pushes.length = 0; T = Date.parse('2026-10-06T08:00:00Z'); await cron('*/5 * * * *');
ok(pushes.length === 1, 'martedì 10:00 solo B: ' + pushes.length);
pushes.length = 0; T = Date.parse('2026-10-07T07:00:00Z'); await cron('*/5 * * * *');
ok(pushes.length === 0, 'mercoledì 9:00: A ancora no (parte alle 9:30)');
T += 30 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 1, 'mercoledì 9:30: A');
r = await post({ tz: 'Marte/Olimpo', forn: [{ id: 'X', nome: 'x'.repeat(200), g: [0, 0, 7, 'a'], at: 5000 }] }); j = await r.json();
const p = piano(); ok(r.ok && p.tz === 'Europe/Rome' && p.forn[0].nome.length === 60 && JSON.stringify(p.forn[0].g) === '[0]' && p.forn[0].at === 600 && p.subs.length === 0, 'dati strani ripuliti (fuso, nome, giorni, ora)');
Date.now = realNow;

// --- parte 2: app con l'emulatore ---
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const CFG = { apiKey: 'fake-key', authDomain: 'demo-jona.firebaseapp.com', projectId: 'demo-jona', appId: '1:1:web:1' };
const proms = [], invia = []; let promStatus = 200;
const c = await b.newContext({ viewport: { width: 400, height: 800 }, serviceWorkers: 'block' });
await c.addInitScript(cfg => { localStorage.setItem('jona_fb_emu', JSON.stringify('127.0.0.1')); if (!localStorage.getItem('jona_fb')) localStorage.setItem('jona_fb', JSON.stringify(cfg)); }, CFG);
await c.route('https://jona-notifiche.mario-miscera.workers.dev/**', async rt => { const u = rt.request().url();
  if (u.endsWith('/promemoria')) { proms.push({ auth: rt.request().headers().authorization || '', body: JSON.parse(rt.request().postData()) }); return rt.fulfill({ status: promStatus, json: { ok: promStatus === 200 } }); }
  if (u.endsWith('/invia')) { invia.push(JSON.parse(rt.request().postData())); return rt.fulfill({ json: { inviati: 1, scaduti: [], errori: [] } }); }
  rt.fulfill({ json: { ok: true } }); });
const A = await c.newPage(); const errs = []; A.on('pageerror', e => errs.push(e.message));
await A.goto('http://localhost:8765/index.html'); await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for (const [k, v] of Object.entries({ nome: 'Mario', cognome: 'Test', username: 'mario', pw: 'prova1234', pw2: 'prova1234' })) await A.fill('input[data-k="' + k + '"]', v);
await A.click('[data-a="setupGo"]'); await A.waitForTimeout(1200);
await A.evaluate(() => { fbActivate() }); await A.waitForTimeout(300); await A.click('#ask-ok'); await A.waitForTimeout(8000);
ok(await A.evaluate(() => S.db.kind === 'firebase' && S.db.status().ready), 'app su Firebase (emulatore)');
await A.evaluate(() => makeTestData()); await A.waitForTimeout(3000);
// un gestore con le notifiche attive e un fornitore con promemoria già dovuto (tutti i giorni, da mezzanotte, senza ora limite)
const fid = await A.evaluate(async () => { let gm = Object.values(D().staff).find(u => isGM(u) && u.stato === 'attivo');
  if (!gm) { await put('staff', 'chef_t', { nome: 'Chef', cognome: 'Prova', username: 'chef', ruolo: 'gm', reparto: 'cucina', stato: 'attivo', creato: now() }); gm = { id: 'chef_t' }; }
  await fbInit().fs.collection('push').doc('pgm').set({ u: gm.id, sub: { endpoint: 'https://fcm.googleapis.com/fcm/send/chef', keys: { p256dh: 'BX', auth: 'Y' } }, creato: now() });
  const f = Object.values(D().fornitori)[0]; await upd('fornitori', f.id, { giorniOrdine: [0, 1, 2, 3, 4, 5, 6], oraPromemoria: '00:00', oraLimite: '' });
  S.viewAs = 'gm'; ls('jona_rem', null); return f.id; });
await A.waitForTimeout(2500);
await A.evaluate(() => deadlineTick()); await A.waitForTimeout(1500);
const pr = proms[0];
ok(proms.length === 1 && pr.auth.startsWith('Bearer ') && pr.body.forn.some(f => f.id === fid && f.g.length === 7 && f.at === 0 && f.lim === null), 'piano mandato al server con il gettone del telefono');
ok(pr && pr.body.subs.length === 1 && pr.body.subs[0].endpoint.endsWith('/chef'), 'nel piano solo le iscrizioni dei gestori');
ok(!invia.some(x => /^Oggi si ordina/.test(x.titolo)), 'server attivo: l\'app non manda la sua push');
ok(await A.evaluate(f => Object.values(D().notifiche).some(z => z.tipo === 'promemoria' && z.rif === f), fid), 'avviso nella campanella scritto lo stesso');
await A.evaluate(() => deadlineTick()); await A.waitForTimeout(800);
ok(proms.length === 1, 'piano uguale: non rimandato');
// piano cambiato e server giù: l'app manda la push come prima
promStatus = 503;
await A.evaluate(async f => { await upd('fornitori', f, { oraPromemoria: '00:01' }); for (const z of Object.values(D().notifiche)) if (z.tipo === 'promemoria') await del('notifiche', z.id); ls('jona_rem', null); }, fid);
await A.waitForTimeout(2000); await A.evaluate(() => deadlineTick()); await A.waitForTimeout(1500);
ok(proms.length === 2 && proms[1].body.forn.find(f => f.id === fid).at === 1, 'piano cambiato: rimandato');
ok(invia.some(x => /^Oggi si ordina/.test(x.titolo)), 'server giù: l\'app manda la push come prima');
ok(!errs.length, 'nessun errore nella pagina ' + errs.join(' | '));
await b.close();
process.exit(fail ? 1 : 0);
