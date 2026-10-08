// v58: agenda smart. Parte 1: Worker (/agenda e cron, D1 finto). Parte 2: app in modalità locale (avvisi, cose da fare, spunte, piano per il server).
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
const agDoc = () => JSON.parse(A0.raw.prepare("SELECT v FROM prom WHERE id='ag'").get().v);
T = Date.parse('2026-10-08T08:00:00Z');
let r = await req('/agenda', { ev: [{ k: 'E1|' + (T + 600000), at: T + 600000, t: 'Matrimonio Rossi', x: 'Tra 1 ora', subs: [sub('mauro'), sub('chef')] },
  { k: 'E2|' + (T - 5 * 60000), at: T - 5 * 60000, t: 'Consegna vini', x: 'Adesso', subs: [sub('mauro')] },
  { k: 'E3|' + (T - 3600000), at: T - 3600000, t: 'Vecchio', x: 'Adesso', subs: [sub('mauro')] },
  { k: 'E4|' + T, at: T, t: 'Senza telefoni', x: 'Adesso', subs: [] }] });
let j = await r.json();
ok(r.ok && j.avvisi === 3, '/agenda salva 3 avvisi validi (senza iscrizioni scartato) ' + JSON.stringify(j));
r = await req('/agenda', { ev: [] }, ''); ok(r.status === 403, '/agenda senza gettone: 403');

r = await req('/agenda', { x: 1 }); ok(r.status === 400, '/agenda con corpo sbagliato: 400');
await cron('*/5 * * * *');
ok(pushes.length === 1 && pushes[0].endsWith('/mauro'), 'ora 10:00: parte solo E2 (E1 è fra 10 minuti, E3 troppo vecchio): ' + pushes.join(' '));
pushes.length = 0; await cron('*/5 * * * *'); ok(pushes.length === 0, 'secondo giro: niente doppioni');
T += 11 * 60000; await cron('*/5 * * * *'); ok(pushes.length === 2, 'dopo 11 minuti parte E1 a mauro e chef: ' + pushes.join(' '));
pushes.length = 0; T += 3 * 864e5; await cron('*/5 * * * *'); ok(pushes.length === 0 && !Object.keys(JSON.parse(A0.raw.prepare("SELECT v FROM prom WHERE id='agfatto'").get().v)).length, 'dopo 3 giorni la memoria degli invii si svuota');

// --- parte 2: app ---
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const _nc = b.newContext.bind(b); b.newContext = async o => { const c = await _nc(o); await c.route('**/firebase-config.js', r => r.fulfill({ contentType: 'application/javascript', body: 'self.JONA_FIREBASE=null' })); return c; };
const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
const wait = ms => pg.waitForTimeout(ms);
const txt = async (sel = '#app') => (await pg.locator(sel).last().innerText()).replace(/\s+/g, ' ');
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for (const [k, v] of [['nome', 'Mario'], ['cognome', 'Rossi'], ['username', 'mario'], ['pw', 'password123'], ['pw2', 'password123']]) await pg.fill(`input[data-k="${k}"]`, v);
await pg.click('[data-a="setupGo"]'); await pg.waitForSelector('.testbar'); await wait(300);
await pg.evaluate(() => settingsSheet()); await wait(300); await pg.click('.sheet [data-a="funzSet"][data-k="agenda"][data-v="1"]'); await wait(300);
await pg.evaluate(() => { while (sheets.length) closeSheet(true); }); await wait(150);

// nuovo evento: avviso di partenza 30 minuti, lista di cose da fare
const t0 = await pg.evaluate(() => { const d = new Date(Date.now() + 40 * 60000); return { g: today(d), h: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), ora: d.getHours() * 60 + d.getMinutes() }; });
await pg.evaluate(() => agOpen()); await wait(300); await pg.click('[data-a="agNew"]'); await wait(300);
ok(await pg.locator('.sheet [data-a="agfAv"][data-v="30"][aria-pressed="true"]').count() === 1, 'nuovo evento: avviso di partenza «30 min prima»');
await pg.fill('#agf-t', 'Matrimonio Rossi'); await pg.fill('#agf-g', t0.g); await pg.fill('#agf-h', t0.h);
ok(/anche con l'app chiusa/.test(await txt('.sheet')) && /alle 09:00/.test(await txt('.sheet')), 'nota sugli avvisi: anche con l\'app chiusa, senza ora alle 09:00');
await pg.click('.sheet [data-a="agfAv"][data-v="0"]');
await pg.fill('#agf-cl', 'Ordinare i fiori'); await pg.click('.sheet [data-a="agClAdd"]'); await wait(200);
await pg.fill('#agf-cl', 'Chiamare il DJ'); await pg.click('.sheet [data-a="agClAdd"]'); await wait(200);
await pg.fill('#agf-cl', 'Controllare i tavoli');   // non aggiunta con il pulsante: si salva lo stesso
ok(await pg.locator('.sheet .ag-ci').count() === 2, 'due cose da fare nell\'elenco del modulo');
await pg.click('[data-a="agSave"]'); await wait(500);
const ev = await pg.evaluate(() => { const e = agAll().find(x => x.t === 'Matrimonio Rossi'); return e && { av: e.av, cl: e.cl }; });
ok(ev && ev.av.join() === '0,30' && ev.cl.length === 3 && ev.cl[2].t === 'Controllare i tavoli', 'evento salvato con avvisi 0 e 30 e tre cose da fare ' + JSON.stringify(ev));
let tt = await txt('.sheet');
ok(/avviso all'ora, 30 min prima/.test(tt) && /0\/3 fatte/.test(tt), 'lista: «avviso all\'ora, 30 min prima» e «0/3 fatte»');
ok(await pg.locator('.sheet .ag-next').count() === 1, 'l\'evento che viene dopo ha la barra «prossimo»');
await pg.click('.sheet [data-a="agCk"]'); await wait(500);
tt = await txt('.sheet'); ok(/1\/3 fatte/.test(tt) && await pg.locator('.sheet .ag-ck[aria-pressed="true"]').count() === 1, 'spunta di una cosa da fare: 1/3 fatte');
ok(await pg.evaluate(() => agAll().find(x => x.t === 'Matrimonio Rossi').cl[0].ok === true), 'spunta salvata nell\'evento');

// avvisi calcolati
const inst = await pg.evaluate(t => { const n = Date.now(); return agInst(n, n + 48 * 36e5).map(a => ({ m: a.m, dt: Math.round((a.at - n) / 60000) })); }, 0);
ok(inst.length === 1 && inst[0].m === 30 && Math.abs(inst[0].dt + 40 - 40 - (40 - 30)) <= 1 || inst.length === 2, 'avvisi dei prossimi 2 giorni calcolati: ' + JSON.stringify(inst));
const sempio = await pg.evaluate(() => { const e = { id: 'x', g: '2026-10-10', h: '19:00', av: [60, 1440] }; return [agTs(e.g, e.h, 60), agTs(e.g, '', 0), agTs(e.g, e.h, 1440)].map(v => new Date(v).toISOString().slice(0, 16)); });
ok(new Date(sempio[0]).getHours() === 18 && new Date(sempio[1]).getHours() === 9 && new Date(sempio[2]).getDate() === 9, 'orari degli avvisi: 1 ora prima = 18:00, senza ora = 09:00, 1 giorno prima = giorno prima');
ok(await pg.evaluate(() => agAvTxt(0, '19:00') === 'Adesso · 19:00' && agAvTxt(30) === 'Tra 30 minuti' && agAvTxt(60) === 'Tra 1 ora' && agAvTxt(1440, '19:00') === 'Domani alle 19:00'), 'testi degli avvisi');

// avviso a schermo e nella campanella: evento con avviso già scattato 5 minuti fa
await pg.evaluate(async () => { const me = realU(), d = new Date(Date.now() + 25 * 60000);
  await agPut('agenda_' + today(d).slice(0, 7), { zz1: { k: 'ev', t: 'Consegna vini', g: today(d), h: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), cop: 0, note: '', vis: 'tutti', rep: [], da: me.id, cr: 1, mod: 1, r: '', av: [30], cl: [] } }); });
await wait(300);
await pg.evaluate(() => agTick(meU())); await wait(600);
const n1 = await pg.evaluate(() => Object.values(D().notifiche).filter(n => n.tipo === 'agenda').map(n => n.titolo + '|' + n.testo));
ok(n1.length === 1 && /Consegna vini\|Tra 30 minuti/.test(n1[0]), 'avviso scattato: notifica nella campanella ' + JSON.stringify(n1));
await pg.evaluate(() => agTick(meU())); await wait(400);
ok(await pg.evaluate(() => Object.values(D().notifiche).filter(n => n.tipo === 'agenda').length) === 1, 'secondo giro: niente doppione');
// piano per il server: senza Firebase non parte, ma il piano contiene solo chi ha iscrizioni
const pl = await pg.evaluate(() => JSON.parse(agPlan()));
ok(Array.isArray(pl.ev) && pl.ev.length === 0, 'piano per il server vuoto senza iscrizioni push');
ok(await pg.evaluate(async () => (await agSrv()) === false), 'senza Firebase agSrv non fa nulla');
// vecchi eventi (senza av né cl) si modificano senza avvisi
await pg.evaluate(async () => { const me = realU(); await agPut('agenda_2030-01', { old1: { k: 'ev', t: 'Vecchio evento', g: '2030-01-10', h: '10:00', cop: 0, note: '', vis: 'tutti', rep: [], da: me.id, cr: 1, mod: 1, r: '' } }); });
await pg.evaluate(() => agForm(Object.assign({ id: 'old1' }, { k: 'ev', t: 'Vecchio evento', g: '2030-01-10', h: '10:00' }))); await wait(300);
ok(await pg.locator('.sheet [data-a="agfAv"][aria-pressed="true"]').count() === 0, 'evento vecchio: nessun avviso acceso da sé');
await pg.evaluate(() => { while (sheets.length) closeSheet(true); }); await wait(150);
// 320 px senza scorrimento orizzontale
await pg.setViewportSize({ width: 320, height: 700 }); await pg.evaluate(() => agOpen()); await wait(300);
ok(await pg.evaluate(() => { const s = document.querySelector('.sheet'); return s.scrollWidth <= s.clientWidth + 1; }), 'agenda a 320 px senza scorrimento orizzontale');
await pg.click('[data-a="agNew"]'); await wait(300);
ok(await pg.evaluate(() => { const s = document.querySelector('.sheet'); return s.scrollWidth <= s.clientWidth + 1; }), 'modulo evento a 320 px senza scorrimento orizzontale');
ok(!errs.length, 'nessun errore: ' + errs.join(' | '));
await b.close();
process.exit(fail ? 1 : 0);
