// v104: promemoria del turno. Parte 1: Worker (/turni e cron, D1 finto). Parte 2: app in modalità locale (piano dei turni per il server).
import { DatabaseSync } from 'node:sqlite';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { oraFissa } from './ora-fissa.mjs';
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

// --- parte 1: Worker ---
function d1() { const db = new DatabaseSync(':memory:');
  const st = (sql, args = []) => ({ bind: (...a) => st(sql, a), first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }), run: async () => { const r = db.prepare(sql).run(...args); return { success: true, meta: { changes: Number(r.changes) } }; } });
  return { prepare: sql => st(sql), batch: async l => { for (const x of l) await x.run(); }, raw: db }; }
const realNow = Date.now; let T = Date.parse('2026-10-08T08:00:00Z'); // giovedì, 10:00 a Roma
Date.now = () => T;
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const tok = (sub = 'uidGestore1') => b64u({ alg: 'RS256' }) + '.' + b64u({ sub, exp: T / 1000 + 3600 }) + '.firma';
const pushes = []; const membroDoc = { fields: { k: { stringValue: 'K'.repeat(24) } } };
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
const req = (path, body, t = tok()) => W.fetch(new Request('https://w' + path, { method: 'POST', headers: t ? { authorization: 'Bearer ' + t } : {}, body: JSON.stringify(body || {}) }), env);
const cron = c => new Promise(res => W.scheduled({ cron: c }, env, { waitUntil: p => p.then(res, res) }));
const H = 3600000;
let r = await req('/turni', { pp: { anna: [sub('anna1'), sub('anna2')], luca: [sub('luca')], vuoto: [{ endpoint: 'http://cattivo' }] },
  ev: [{ k: 'anna|1', at: T + 10 * 60000, x: 'Giovedì 11:10–15:00', u: 'anna' },
    { k: 'luca|1', at: T - 5 * 60000, x: 'Giovedì 10:55–15:00', u: 'luca' },
    { k: 'luca|0', at: T - H, x: 'Vecchio', u: 'luca' },
    { k: 'vuoto|1', at: T, x: 'Senza telefoni', u: 'vuoto' },
    { k: 'nessuno|1', at: T, x: 'Persona sconosciuta', u: 'nessuno' }] });
let j = await r.json();
ok(r.ok && j.turni === 3 && j.persone === 2, '/turni salva 3 turni di 2 persone (iscrizioni non valide e persone senza telefono scartate) ' + JSON.stringify(j));
r = await req('/turni', { pp: {}, ev: [] }, ''); ok(r.status === 403, '/turni senza gettone: 403');
r = await req('/turni', { ev: [] }); ok(r.status === 400, '/turni senza «pp»: 400');
await cron('*/5 * * * *');
ok(pushes.length === 1 && pushes[0].endsWith('/luca'), 'ore 10:00: parte solo il turno di Luca (Anna fra 10 minuti, il vecchio è scaduto): ' + pushes.join(' '));
pushes.length = 0; await cron('*/5 * * * *'); ok(pushes.length === 0, 'secondo giro: niente doppioni');
T += 11 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 2 && pushes.every(u => /anna[12]$/.test(u)), 'dopo 11 minuti il promemoria arriva su tutti e due i telefoni di Anna: ' + pushes.join(' '));
pushes.length = 0;
// funzione spenta: il telefono manda un piano vuoto e non parte più niente
r = await req('/turni', { pp: {}, ev: [] }); j = await r.json(); ok(r.ok && j.turni === 0, 'piano vuoto accettato: ' + JSON.stringify(j));
T += 5 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 0, 'con il piano vuoto non parte niente');
T += 3 * 864e5; await cron('*/5 * * * *'); ok(!Object.keys(JSON.parse(A0.raw.prepare("SELECT v FROM prom WHERE id='tufatto'").get().v)).length, 'dopo 3 giorni la memoria degli invii si svuota');
// un errore nei promemoria degli ordini non ferma i turni
A0.raw.prepare("INSERT OR REPLACE INTO prom (id, v) VALUES ('piano', 'non json')").run();
await req('/turni', { pp: { anna: [sub('anna1')] }, ev: [{ k: 'anna|2', at: T, x: 'Domenica 12:00–15:00', u: 'anna' }] });
pushes.length = 0; await cron('*/5 * * * *'); ok(pushes.length === 1, 'turni mandati anche con il piano degli ordini rotto: ' + pushes.join(' '));
Date.now = realNow;

// --- parte 2: app ---
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
await ctx.route('**/firebase-config.js', r => r.fulfill({ contentType: 'application/javascript', body: 'self.JONA_FIREBASE=null' }));
await oraFissa(ctx);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
const wait = ms => pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for (const [k, v] of [['nome', 'Mario'], ['cognome', 'Rossi'], ['username', 'mario'], ['pw', 'password123'], ['pw2', 'password123']]) await pg.fill(`input[data-k="${k}"]`, v);
await pg.click('[data-a="setupGo"]'); await pg.waitForSelector('.testbar'); await wait(300);
await pg.evaluate(async () => {
  const p = { stato: 'attivo', ruolo: 'staff', creato: now() };
  await put('staff', 'tA', Object.assign({ id: 'tA', nome: 'Anna', reparto: 'sala' }, p));
  await put('staff', 'tB', Object.assign({ id: 'tB', nome: 'Bruno', reparto: 'cucina' }, p));
  await put('staff', 'tR', Object.assign({ id: 'tR', nome: 'Rita', reparto: 'resp', contratto: { libero: true } }, p));
  await put('staff', 'tN', Object.assign({ id: 'tN', nome: 'Nino', reparto: 'sala' }, p));
  const sub = n => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/' + n, keys: { p256dh: 'x', auth: 'y' } });
  PUSH.subs = { a1: { u: 'tA', sub: sub('a1') }, b1: { u: 'tB', sub: sub('b1') }, r1: { u: 'tR', sub: sub('r1') } };
  const cur = orLun(), nx = orShift(cur, 1), row = v => Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(g => [g, v]));
  // settimana corrente: Anna cena tutti i giorni, Bruno solo in bozza (non pubblicato), Rita libera, Nino senza telefono
  await put('config', 'orari_' + cur, { tipo: 'orari', lun: cur, t: { tA: row('18:00-23:30'), tB: row('10:00-15:00') }, tp: { tA: row('18:00-23:30'), tR: row('10:00-15:00'), tN: row('18:00-23:30') }, pub: 1 });
  // settimana dopo: Anna spezzato; la cucina non è ancora pubblicata (pubR per reparto)
  await put('config', 'orari_' + nx, { tipo: 'orari', lun: nx, t: {}, tp: { tA: row('10:00-15:00,18:00-23:00'), tB: row('10:00-15:00') }, pub: 1, pubR: { sala: 1 } });
});
await wait(300);
const P = await pg.evaluate(() => { const p = JSON.parse(turPlan()), t = now(), d = new Date(t); d.setHours(17, 0, 0, 0);
  const nx = orDay(orShift(orLun(), 1), 0), nm = [9, 17].map(h => { const x = new Date(nx); x.setHours(h, 0, 0, 0); return x.getTime(); });
  return { p, t, oggi17: d.getTime(), nm, g: OR_GGL[0] }; });
const ev = P.p.ev;
ok(Object.keys(P.p.pp).join() === 'tA', 'nel piano solo Anna (Bruno non pubblicato, Rita libera, Nino senza telefono): ' + Object.keys(P.p.pp).join());
ok(ev.length > 0 && ev.every(e => e.u === 'tA'), 'turni solo di Anna: ' + ev.length);
ok(ev.some(e => e.at === P.oggi17 && /18:00–23:30$/.test(e.x)), 'oggi: avviso alle 17:00 per la cena delle 18:00');
ok(ev.every(e => e.at >= P.t - 20 * 60000 && e.at <= P.t + 8 * 864e5), 'nessun turno passato né oltre 8 giorni');
ok(P.nm.every(at => ev.some(e => e.at === at)) && ev.some(e => e.x === P.g + ' 10:00–15:00') && ev.some(e => e.x === P.g + ' 18:00–23:00'),
  'spezzato di lunedì prossimo: due avvisi, alle 9:00 e alle 17:00');
ok(new Set(ev.map(e => e.k)).size === ev.length, 'chiavi tutte diverse');
// interruttore in Impostazioni → Funzioni
await pg.evaluate(() => settingsSheet()); await wait(300);
ok(await pg.locator('.sheet [data-a="funzSet"][data-k="turni"]').count() > 0 && /Promemoria del turno/.test(await pg.locator('.sheet').last().innerText()), 'Impostazioni → Funzioni: «Promemoria del turno»');
await pg.click('.sheet [data-a="funzSet"][data-k="turni"][data-v="0"]'); await wait(300);
const vuoto = await pg.evaluate(() => JSON.parse(turPlan()));
ok(!vuoto.ev.length && !Object.keys(vuoto.pp).length, 'funzione spenta: piano vuoto (il server smette di mandare)');
ok(!errs.length, 'nessun errore: ' + errs.join(' | '));
await b.close();
process.exit(fail ? 1 : 0);
