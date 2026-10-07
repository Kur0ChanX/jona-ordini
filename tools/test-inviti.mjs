// v30: inviti con codice di 6 lettere. Parte 1: Worker (/inviti, /invito/<codice>, link corto) con D1 e Firestore finti.
// Parte 2: app (modalità locale, Worker simulato con page.route): apertura da #i=, codice scritto a mano, testo e cartolina.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = 'http://localhost:8765/'; let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const KEY = 'ChiaveDiProva1234567890';

// --- parte 1: Worker ---
const righe = new Map();
const d1 = { prepare: sql => ({ args: [], bind(...a) { this.args = a; return this; },
  async run() { if (/^INSERT/.test(sql)) { const [c, k, s] = this.args; if (righe.has(c)) return { meta: { changes: 0 } }; righe.set(c, { k, s }); return { meta: { changes: 1 } }; }
    if (/^DELETE FROM inviti/.test(sql)) { for (const [c, r] of righe) if (r.s < this.args[0]) righe.delete(c); } return { meta: { changes: 0 } }; },
  async first() { const r = righe.get(this.args[0]); return r && r.s > this.args[1] ? { k: r.k } : null; } }) };
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => String(u).includes('firestore.googleapis.com')
  ? new Response(JSON.stringify({ fields: { k: { stringValue: KEY } } }), { status: 200 }) : realFetch(u, o);
const tok = 'x.' + Buffer.from(JSON.stringify({ sub: 'uidProva1', exp: Date.now() / 1000 + 3600 })).toString('base64url') + '.y';
const W = (await import('../worker/src/index.js')).default;
const env = { ALLEGATI0: d1 };
let r = await W.fetch(new Request('https://w/inviti', { method: 'POST' }), env);
ok(r.status === 403, 'senza gettone niente codice');
r = await W.fetch(new Request('https://w/inviti', { method: 'POST', headers: { authorization: 'Bearer ' + tok } }), env);
const j = await r.json(); ok(r.ok && /^[A-HJ-NP-Z2-9]{6}$/.test(j.codice), 'codice creato ' + j.codice);
r = await W.fetch(new Request('https://w/invito/' + j.codice.toLowerCase()), env);
ok(r.ok && (await r.json()).k === KEY, 'codice → chiave (anche in minuscolo)');
r = await W.fetch(new Request('https://w/invito/ZZZZZZ'), env); ok(r.status === 404, 'codice sbagliato 404');
righe.get(j.codice).s = Date.now() - 1;
r = await W.fetch(new Request('https://w/invito/' + j.codice), env); ok(r.status === 404, 'codice scaduto 404');
await new Promise(res => W.scheduled({}, env, { waitUntil: p => p.then(res, res) }));
ok(!righe.has(j.codice), 'pulizia notturna dei codici scaduti');
r = await W.fetch(new Request('https://w/inviti', { method: 'POST', headers: { authorization: 'Bearer ' + tok } }), {});
ok(r.status === 503, 'senza D1: 503');
const L = (await import('../worker/invito/src/index.js')).default;
let h = await (await L.fetch(new Request('https://invito.x.workers.dev/k7m4qx'))).text();
ok(h.includes('location.replace("https://jona-ristorante-by-ynoy-corp.pages.dev/#i=K7M4QX")') && h.includes('og:image'), 'link corto → app con #i= e anteprima');
h = await (await L.fetch(new Request('https://invito.x.workers.dev/<script>'))).text();
ok(!h.includes('<script>"') && h.includes('location.replace("https://jona-ristorante-by-ynoy-corp.pages.dev/")'), 'percorso strano → solo app');
globalThis.fetch = realFetch;

// --- parte 2: app ---
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext(); const errs = [];
await ctx.route(/workers\.dev\/invito\//, rt => rt.request().url().endsWith('/K7M4QX')
  ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ k: KEY }) })
  : rt.fulfill({ status: 404, contentType: 'application/json', body: '{"errore":"x"}' }));
await ctx.route(/googleapis\.com|gstatic\.com\/firebasejs/, rt => rt.abort());
const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)));
await p.goto(URL + '#i=k7m4qx'); await p.waitForTimeout(1500);
ok(await p.evaluate(() => JSON.parse(localStorage.jona_key || 'null')) === 'ChiaveDiProva1234567890', 'aperto da #i=: chiave salvata');
ok(!(await p.evaluate(() => location.hash)) && !(await p.evaluate(() => localStorage.jona_icode)), 'codice tolto dall\'indirizzo');
// codice scritto a mano nella schermata «Collega»
await p.evaluate(() => { localStorage.clear(); });
await p.evaluate(() => { window.__toast = []; const t = toast; toast = (m, k) => { __toast.push(m); return t(m, k); }; });
await p.evaluate(() => fbJoinKey('abcdef')); await p.waitForTimeout(300);
ok(await p.evaluate(() => __toast.some(m => m.includes('scaduto'))) && !(await p.evaluate(() => localStorage.jona_key)), 'codice sbagliato: avviso, nessuna chiave');
await Promise.all([p.waitForNavigation(), p.evaluate(() => fbJoinKey('https://invito.x.workers.dev/K7M4QX'))]);
ok(await p.evaluate(() => JSON.parse(localStorage.jona_key || 'null')) === 'ChiaveDiProva1234567890', 'link corto incollato: chiave salvata');
// testo e cartolina con il codice
const t = await p.evaluate(() => inviteText('https://invito.x.workers.dev/K7M4QX', 'K7M4QX'));
ok(t.includes('*K7M4QX*') && t.endsWith('👉 https://invito.x.workers.dev/K7M4QX') && !t.includes('kur0chanx'), 'testo con codice e link corto');
await p.evaluate(() => { S.invL = { l: 'https://invito.x.workers.dev/K7M4QX', c: 'K7M4QX' }; S.qrImg = ''; navigator.canShare = () => false; });
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.evaluate(() => inviteCard())]);
const fs = await import('fs'); fs.copyFileSync(await dl.path(), process.env.CARD_OUT || '/tmp/invito-codice.png');
ok(dl.suggestedFilename() === 'invito-jona.png', 'cartolina con codice scaricata');
// in modalità locale: link lungo di ripiego
await p.evaluate(() => { S.invL = null; });
ok((await p.evaluate(() => invNew())).c === '', 'senza database centrale: link lungo, nessun codice');
ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
await b.close(); console.log(fail ? fail + ' FAIL' : 'OK'); process.exit(fail ? 1 : 0);
