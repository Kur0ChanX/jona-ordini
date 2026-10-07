// Server delle notifiche di Jona Ordini: riceve dall'app titolo, testo e iscrizioni dei telefoni,
// cifra il messaggio (Web Push, RFC 8291) e lo consegna al servizio push di ogni telefono (firma VAPID, RFC 8292).
// La chiave VAPID (JWK P-256) sta nel segreto VAPID_JWK, creato dal workflow GitHub alla prima pubblicazione.
// /gemini: fa da tramite verso Google Gemini con la chiave del ristorante (segreto GEMINI_KEY), solo per i telefoni
// registrati (membri/<uid> in Firestore); se Gemini è occupato (429) aspetta quanto chiede e riprova, poi prova il modello Lite.
// /allegati: foto e vocali della chat nei database D1 ALLEGATI0, ALLEGATI1… (creati dal workflow; piano gratuito: 500 MB l'uno).
// Il telefono manda il file in base64 (testo) con il tipo in «x-tipo»: D1 restituirebbe i BLOB come liste di numeri,
// troppo lente da convertire nei 10 ms del piano gratuito. Ogni file va nel database più vuoto; oltre il tetto si cancellano i più vecchi, e ogni notte (cron) quelli oltre 60 giorni.
// /inviti: un telefono del ristorante chiede un codice d'invito di 6 lettere (vale 7 giorni, tabella «inviti» nel primo database D1);
// /invito/<codice>: il telefono nuovo lo scambia con la chiave del ristorante (resta l'approvazione del telefono).
// /promemoria: il telefono di un gestore manda giorni e ore dei promemoria ordini con le iscrizioni push dei gestori (tabella «prom»
// nel primo database D1); ogni 5 minuti (cron) il server manda «Oggi si ordina da …» anche con l'app chiusa su tutti i telefoni.
// Dalla v35 il piano porta anche le scadenze per lo staff («Richieste allo chef entro le…», con le iscrizioni dello staff scelto)
// e le iscrizioni dei gestori («gest») per /richiesta: un telefono in attesa avvisa i gestori che chiede di entrare.
// /inviti con {fisso:true}: codice del «QR da cucina» che non scade (il vecchio, se indicato, viene cancellato).
// /invito/<codice>: al massimo INV_ERR codici sbagliati all'ora per indirizzo IP.

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-expose-headers": "x-tipo",
  "access-control-allow-headers": "content-type, authorization, x-tipo",
};
const PUSH_HOSTS = /(^|\.)(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/;
const MAX_SUBS = 50;
const enc = new TextEncoder();

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } });

const b64u = buf => {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const ub64u = s => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "=".repeat((4 - (s.length % 4)) % 4)), c => c.charCodeAt(0));
};
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8));
}

let vapidCache = null;
async function vapid(env) {
  if (vapidCache) return vapidCache;
  if (!env.VAPID_JWK) throw new Error("manca VAPID_JWK");
  const jwk = JSON.parse(env.VAPID_JWK);
  const priv = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, d: jwk.d },
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const pub = b64u(concat(new Uint8Array([4]), ub64u(jwk.x), ub64u(jwk.y)));
  vapidCache = { priv, pub, jwts: new Map() };
  return vapidCache;
}

async function vapidAuth(v, endpoint) {
  const aud = new URL(endpoint).origin;
  const hit = v.jwts.get(aud);
  const t = Math.floor(Date.now() / 1000);
  if (hit && hit.exp - t > 3600) return hit.h;
  const exp = t + 12 * 3600;
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud, exp, sub: "https://jona-ristorante-by-ynoy-corp.pages.dev/" })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, v.priv, enc.encode(head + "." + body));
  const h = `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
  v.jwts.set(aud, { h, exp });
  return h;
}

export async function encrypt(sub, payload) {
  const uaPub = ub64u(sub.keys.p256dh);
  const auth = ub64u(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, shared, concat(enc.encode("WebPush: info\0"), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const data = concat(enc.encode(payload), new Uint8Array([2]));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, data));
  const head = new Uint8Array(21);
  head.set(salt);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPub.length;
  return concat(head, asPub, ct);
}

const validSub = s => {
  try {
    const u = new URL(s.endpoint);
    return u.protocol === "https:" && PUSH_HOSTS.test(u.hostname) && typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string";
  } catch { return false; }
};

async function send(env, body) {
  const v = await vapid(env);
  const subs = Array.isArray(body.subs) ? body.subs.slice(0, MAX_SUBS).filter(validSub) : [];
  const payload = JSON.stringify({
    titolo: String(body.titolo || "Jona Ordini").slice(0, 120),
    testo: String(body.testo || "").slice(0, 400),
    tag: String(body.tag || "").slice(0, 60),
  });
  const res = await Promise.all(subs.map(async s => {
    try {
      const r = await fetch(s.endpoint, {
        method: "POST",
        headers: {
          authorization: await vapidAuth(v, s.endpoint),
          "content-encoding": "aes128gcm",
          "content-type": "application/octet-stream",
          ttl: "86400",
          urgency: "high",
        },
        body: await encrypt(s, payload),
      });
      return { endpoint: s.endpoint, status: r.status };
    } catch {
      return { endpoint: s.endpoint, status: 0 };
    }
  }));
  return {
    inviati: res.filter(r => r.status >= 200 && r.status < 300).length,
    scaduti: res.filter(r => r.status === 404 || r.status === 410).map(r => r.endpoint),
    errori: res.filter(r => r.status === 0 || (r.status >= 400 && r.status !== 404 && r.status !== 410)).map(r => r.status),
  };
}

const GEM_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
const GEM_MAX_WAIT = 25000;
const GEM_MAX_BODY = 20 * 1024 * 1024;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const geminiErr = (message, status) => json({ error: { message } }, status);

// il telefono manda il suo gettone Firebase: se con quel gettone può leggere membri/<uid> e non è in attesa, è del ristorante
const membriOk = new Map();
async function membro(request, env) {
  const tok = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const now = Date.now();
  if (membriOk.get(tok) > now) return membriUid.get(tok) || true;
  let uid = "", exp = 0;
  try {
    const p = JSON.parse(new TextDecoder().decode(ub64u(tok.split(".")[1])));
    uid = String(p.sub || "");
    exp = Number(p.exp || 0) * 1000;
  } catch (e) { return false; }
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid) || exp < now) return false;
  const progetto = env.FB_PROJECT || "jona-ordini";
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${progetto}/databases/(default)/documents/membri/${uid}`,
    { headers: { authorization: "Bearer " + tok } });
  if (!r.ok) return false;
  // telefono in attesa di approvazione («ok» falso): non è ancora del ristorante
  const d = await r.json().catch(() => ({}));
  if (d.fields && d.fields.ok && d.fields.ok.booleanValue === false) return false;
  if (membriOk.size > 200) { membriOk.clear(); membriUid.clear(); }
  membriOk.set(tok, Math.min(exp, now + 10 * 60 * 1000));
  membriUid.set(tok, uid);
  membriK.set(tok, (d.fields && d.fields.k && d.fields.k.stringValue) || "");
  return uid;
}
const membriUid = new Map();
const membriK = new Map();

const INV_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INV_GIORNI = 7;
const INV_FISSO = 50 * 365 * 864e5;
const INV_ERR = 20;
let invPronto = false;
async function invDb(env) {
  const d = algDbs(env)[0];
  if (!d) return null;
  if (!invPronto) {
    await d[1].prepare("CREATE TABLE IF NOT EXISTS inviti (c TEXT PRIMARY KEY, k TEXT NOT NULL, scade INTEGER NOT NULL)").run();
    await d[1].prepare("CREATE TABLE IF NOT EXISTS inv_err (ip TEXT PRIMARY KEY, n INTEGER NOT NULL, t INTEGER NOT NULL)").run();
    invPronto = true;
  }
  return d[1];
}
async function invCrea(request, env) {
  const uid = await membro(request, env);
  if (!uid) return json({ errore: "Telefono non collegato al ristorante" }, 403);
  const tok = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const k = membriK.get(tok) || "";
  if (!/^[A-Za-z0-9]{16,64}$/.test(k)) return json({ errore: "chiave non trovata" }, 409);
  const db = await invDb(env);
  if (!db) return json({ errore: "inviti non attivi sul server" }, 503);
  const b = await request.json().catch(() => ({})) || {};
  const fisso = b.fisso === true;
  const scade = Date.now() + (fisso ? INV_FISSO : INV_GIORNI * 864e5);
  const vecchio = String(b.vecchio || "").toUpperCase();
  if (fisso && /^[A-HJ-NP-Z2-9]{6}$/.test(vecchio)) await db.prepare("DELETE FROM inviti WHERE c = ? AND k = ? AND scade > ?").bind(vecchio, k, Date.now() + 365 * 864e5).run();
  for (let i = 0; i < 5; i++) {
    const c = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => INV_ABC[b & 31]).join("");
    const r = await db.prepare("INSERT OR IGNORE INTO inviti (c, k, scade) VALUES (?, ?, ?)").bind(c, k, scade).run();
    if (r.meta && r.meta.changes) return json({ codice: c, scade });
  }
  return json({ errore: "riprova" }, 500);
}
async function invLeggi(c, env, ip = "") {
  c = String(c || "").toUpperCase();
  const db = await invDb(env);
  if (!db) return json({ errore: "inviti non attivi sul server" }, 503);
  // troppi codici sbagliati dallo stesso indirizzo: stop per un'ora
  const ora = Date.now(), e = ip ? await db.prepare("SELECT n, t FROM inv_err WHERE ip = ?").bind(ip).first() : null;
  const err = e && ora - e.t < 36e5 ? e.n : 0;
  if (err >= INV_ERR) return json({ errore: "troppi tentativi: riprova tra un'ora" }, 429);
  const r = /^[A-HJ-NP-Z2-9]{6}$/.test(c) ? await db.prepare("SELECT k FROM inviti WHERE c = ? AND scade > ?").bind(c, ora).first() : null;
  if (r) return json({ k: r.k });
  if (ip) await db.prepare("INSERT OR REPLACE INTO inv_err (ip, n, t) VALUES (?, ?, ?)").bind(ip, err + 1, err ? e.t : ora).run();
  return json({ errore: "codice scaduto o sbagliato" }, 404);
}

const PROM_CRON = "*/5 * * * *";
const PROM_GG = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const promMin = v => Number.isInteger(v) && v >= 0 && v < 1440;
let promPronto = false;
async function promDb(env) {
  const d = algDbs(env)[0];
  if (!d) return null;
  if (!promPronto) {
    await d[1].prepare("CREATE TABLE IF NOT EXISTS prom (id TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
    promPronto = true;
  }
  return d[1];
}
const promGet = async (db, id) => { const r = await db.prepare("SELECT v FROM prom WHERE id = ?").bind(id).first(); try { return r ? JSON.parse(r.v) : null; } catch { return null; } };
const promPut = (db, id, v) => db.prepare("INSERT OR REPLACE INTO prom (id, v) VALUES (?, ?)").bind(id, JSON.stringify(v)).run();
// giorno (AAAA-MM-GG), giorno della settimana (0=lun) e minuti dalla mezzanotte nel fuso del ristorante
function promOra(tz, t) {
  const p = {};
  for (const x of new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(new Date(t))) p[x.type] = x.value;
  return { d: `${p.year}-${p.month}-${p.day}`, g: PROM_GG.indexOf(p.weekday), m: (+p.hour % 24) * 60 + +p.minute };
}
async function promSalva(request, env) {
  if (!(await membro(request, env))) return json({ errore: "Telefono non collegato al ristorante" }, 403);
  const db = await promDb(env);
  if (!db) return json({ errore: "promemoria non attivi sul server" }, 503);
  const b = await request.json().catch(() => null);
  if (!b || !Array.isArray(b.forn)) return json({ errore: "richiesta non valida" }, 400);
  let tz = String(b.tz || "Europe/Rome").slice(0, 64);
  try { promOra(tz, Date.now()); } catch { tz = "Europe/Rome"; }
  const forn = b.forn.slice(0, 100).map(f => ({
    id: String(f && f.id || "").slice(0, 64),
    nome: String(f && f.nome || "").slice(0, 60),
    g: Array.isArray(f && f.g) ? [...new Set(f.g.filter(x => Number.isInteger(x) && x >= 0 && x < 7))] : [],
    at: promMin(f && f.at) ? f.at : 600,
    lim: promMin(f && f.lim) ? f.lim : null,
    s: Number(f && f.s) || 0,
  })).filter(f => f.id && f.g.length);
  const lista = v => (Array.isArray(v) ? v : []).filter(validSub).slice(0, MAX_SUBS);
  const subs = lista(b.subs), gest = lista(b.gest);
  const scad = (Array.isArray(b.scad) ? b.scad : []).slice(0, 50).map(x => ({
    id: String(x && x.id || "").slice(0, 64),
    nome: String(x && x.nome || "").slice(0, 60),
    g: Array.isArray(x && x.g) ? [...new Set(x.g.filter(y => Number.isInteger(y) && y >= 0 && y < 7))] : [],
    avv: promMin(x && x.avv) ? x.avv : null,
    entro: promMin(x && x.entro) ? x.entro : null,
    subs: lista(x && x.subs),
  })).filter(x => x.id && x.g.length && x.avv != null && x.entro != null && x.avv < x.entro);
  await promPut(db, "piano", { tz, forn, subs, gest, scad, agg: Date.now() });
  return json({ ok: true, fornitori: forn.length, telefoni: subs.length, scadenze: scad.length });
}
const promHm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
async function promTick(env, t = Date.now()) {
  const db = await promDb(env);
  if (!db) return;
  const p = await promGet(db, "piano");
  if (!p) return;
  p.forn = p.forn || []; p.subs = p.subs || []; p.scad = p.scad || [];
  const o = promOra(p.tz, t);
  const fatto = await promGet(db, "fatto") || {};
  for (const k in fatto) if (fatto[k] !== o.d) delete fatto[k];
  const morti = new Set();
  let cambiato = false;
  for (const f of p.subs.length ? p.forn : []) {
    if (fatto[f.id] === o.d || !f.g.includes(o.g) || o.m < f.at || (f.lim != null && o.m >= f.lim)) continue;
    if (f.s && promOra(p.tz, f.s).d === o.d) continue;
    fatto[f.id] = o.d; cambiato = true;
    const r = await send(env, { titolo: "Oggi si ordina da " + f.nome, testo: "Prepara e invia l'ordine" + (f.lim != null ? " entro le " + promHm(f.lim) : ""), tag: "prom_" + f.id, subs: p.subs.filter(s => !morti.has(s.endpoint)) });
    for (const e of r.scaduti) morti.add(e);
  }
  for (const x of p.scad) {
    const k = "s_" + x.id;
    if (fatto[k] === o.d || !x.g.includes(o.g) || o.m < x.avv || o.m >= x.entro || !x.subs.length) continue;
    fatto[k] = o.d; cambiato = true;
    const r = await send(env, { titolo: (x.nome ? "Richieste per " + x.nome : "Richieste allo chef") + " entro le " + promHm(x.entro),
      testo: "Manda allo chef le richieste" + (x.nome ? " per " + x.nome : "") + " entro le " + promHm(x.entro) + ".", tag: "scad_" + x.id, subs: x.subs.filter(s => !morti.has(s.endpoint)) });
    for (const e of r.scaduti) morti.add(e);
  }
  if (cambiato) await promPut(db, "fatto", fatto);
  if (morti.size) {
    const vivi = l => (l || []).filter(s => !morti.has(s.endpoint));
    p.subs = vivi(p.subs); p.gest = vivi(p.gest); for (const x of p.scad) x.subs = vivi(x.subs);
    await promPut(db, "piano", p);
  }
}

// telefono in attesa (membri/<uid> con ok falso e la richiesta «req»): avvisa i gestori, al massimo una volta ogni 10 minuti
async function richiesta(request, env) {
  const tok = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  let uid = "";
  try { uid = String(JSON.parse(new TextDecoder().decode(ub64u(tok.split(".")[1]))).sub || ""); } catch (e) { return json({ errore: "gettone non valido" }, 403); }
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return json({ errore: "gettone non valido" }, 403);
  const progetto = env.FB_PROJECT || "jona-ordini";
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${progetto}/databases/(default)/documents/membri/${uid}`, { headers: { authorization: "Bearer " + tok } });
  if (!r.ok) return json({ errore: "Telefono non registrato" }, 403);
  const f = ((await r.json().catch(() => ({}))).fields) || {};
  const req = f.req && f.req.mapValue && f.req.mapValue.fields;
  if (!(f.ok && f.ok.booleanValue === false) || !req) return json({ errore: "nessuna richiesta in attesa" }, 409);
  const db = await promDb(env);
  if (!db) return json({ errore: "avvisi non attivi sul server" }, 503);
  const k = "rq_" + uid, prima = await promGet(db, k);
  if (prima && Date.now() - prima < 10 * 60000) return json({ ok: true, gia: true });
  const p = await promGet(db, "piano");
  const gest = (p && p.gest) || [];
  if (!gest.length) return json({ ok: true, telefoni: 0 });
  await promPut(db, k, Date.now());
  const s = x => String(x && x.stringValue || "").slice(0, 40);
  const nome = [s(req.nome), s(req.cognome)].filter(Boolean).join(" ") || "Un telefono nuovo";
  const out = await send(env, { titolo: "Telefono da approvare", testo: nome + " chiede di entrare: apri Staff e approvalo.", tag: "rq_" + uid, subs: gest });
  return json({ ok: true, telefoni: out.inviati });
}

const attesa = j => {
  const d = ((j.error && j.error.details) || []).find(x => x && x.retryDelay);
  const s = d ? parseFloat(d.retryDelay) : NaN;
  return Number.isFinite(s) ? Math.max(1000, s * 1000) : 4000;
};

async function gemini(request, env) {
  if (!env.GEMINI_KEY) return geminiErr("Gemini non è configurato sul server", 503);
  if (!(await membro(request, env))) return geminiErr("Telefono non collegato al ristorante", 403);
  const raw = await request.text();
  if (raw.length > GEM_MAX_BODY) return geminiErr("Foto troppo grandi", 413);
  let req;
  try { req = JSON.parse(raw); } catch (e) { return geminiErr("richiesta non valida", 400); }
  if (!req || !Array.isArray(req.contents)) return geminiErr("richiesta non valida", 400);
  const body = JSON.stringify({ contents: req.contents, system_instruction: req.system_instruction, generationConfig: req.generationConfig });
  const start = Date.now();
  let last = "Gemini è occupato", stato = 429;
  for (const m of GEM_MODELS) {
    for (let t = 0; t < 2; t++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_KEY },
        body,
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) return json(j);
      last = (j.error && j.error.message) || "errore " + r.status;
      stato = r.status;
      if (r.status === 404) break;
      if (r.status !== 429 && r.status !== 503) return geminiErr(last, r.status);
      const w = attesa(j);
      if (t === 1 || Date.now() - start + w > GEM_MAX_WAIT) break;
      await sleep(w);
    }
  }
  return geminiErr(last, stato === 404 ? 502 : 429);
}

/* ---- allegati della chat ---- */
const ALG_MAX = 1850 * 1000;             // un file in base64 (circa 1,35 MB veri): sotto i 2 MB di una riga D1
const ALG_CAP = 440 * 1000 * 1000;       // tetto di ogni database (il piano gratuito si ferma a 500 MB)
const ALG_GIORNI = 60;
const ALG_TIPI = /^(image\/(jpeg|webp|png)|audio\/(mp4|aac|mpeg|webm|ogg))$/;
const algErr = (errore, status) => json({ errore }, status);
const algDbs = env => Object.keys(env).filter(k => /^ALLEGATI\d+$/.test(k) && env[k] && env[k].prepare).sort().map(k => [k.slice(8), env[k]]);
const algPronti = new Set();
async function algSchema(n, db) {
  if (algPronti.has(n)) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS f (id TEXT PRIMARY KEY, tipo TEXT NOT NULL, dim INTEGER NOT NULL, creato INTEGER NOT NULL, da TEXT, dati TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS f_creato ON f (creato, dim)"),
  ]);
  algPronti.add(n);
}
const algUsato = async db => (await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(dim), 0) AS b FROM f").first()) || { n: 0, b: 0 };

async function algSalva(request, env, uid) {
  const dbs = algDbs(env);
  if (!dbs.length) return algErr("Foto e vocali non sono attivi sul server", 503);
  const tipo = (request.headers.get("x-tipo") || "").split(";")[0].trim().toLowerCase();
  if (!ALG_TIPI.test(tipo)) return algErr("tipo di file non accettato", 415);
  const len = Number(request.headers.get("content-length") || 0);
  if (len > ALG_MAX) return algErr("file troppo grande", 413);
  const dati = await request.text();
  if (!dati.length) return algErr("file vuoto", 400);
  if (dati.length > ALG_MAX) return algErr("file troppo grande", 413);
  // il database più vuoto
  let scelto = null;
  for (const [n, db] of dbs) {
    await algSchema(n, db);
    const u = await algUsato(db);
    if (!scelto || u.b < scelto.b) scelto = { n, db, b: u.b };
  }
  // oltre il tetto: via i file più vecchi di quel database
  let libera = scelto.b + dati.length - ALG_CAP;
  while (libera > 0) {
    const { results } = await scelto.db.prepare("SELECT id, dim FROM f ORDER BY creato LIMIT 40").all();
    if (!results.length) break;
    const via = [];
    for (const r of results) { if (libera <= 0) break; via.push(r.id); libera -= r.dim; }
    await scelto.db.prepare(`DELETE FROM f WHERE id IN (${via.map(() => "?").join(",")})`).bind(...via).run();
  }
  const id = scelto.n + "-" + b64u(crypto.getRandomValues(new Uint8Array(15)));
  await scelto.db.prepare("INSERT INTO f (id, tipo, dim, creato, da, dati) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, tipo, dati.length, Date.now(), typeof uid === "string" ? uid : "", dati).run();
  return json({ id, dim: dati.length });
}

async function algLeggi(id, env) {
  const m = /^(\d+)-[A-Za-z0-9_-]{20}$/.exec(id);
  const db = m && env["ALLEGATI" + m[1]];
  if (!db || !db.prepare) return algErr("non trovato", 404);
  await algSchema(m[1], db);
  const r = await db.prepare("SELECT tipo, dati FROM f WHERE id = ?").bind(id).first();
  if (!r) return algErr("non trovato", 404);
  return new Response(r.dati, { headers: { "content-type": "text/plain; charset=us-ascii", "x-tipo": r.tipo, "x-content-type-options": "nosniff",
    "cache-control": "private, max-age=31536000, immutable", ...CORS } });
}

async function algSpazio(env) {
  const out = { tetto: 0, usato: 0, file: 0, giorni: ALG_GIORNI };
  for (const [n, db] of algDbs(env)) {
    await algSchema(n, db);
    const u = await algUsato(db);
    out.tetto += ALG_CAP; out.usato += u.b; out.file += u.n;
  }
  return out;
}

async function algPulizia(env) {
  const prima = Date.now() - ALG_GIORNI * 864e5;
  for (const [n, db] of algDbs(env)) {
    await algSchema(n, db);
    await db.prepare("DELETE FROM f WHERE creato < ?").bind(prima).run();
  }
}

export default {
  async scheduled(event, env, ctx) {
    if (event && event.cron === PROM_CRON) return ctx.waitUntil(promTick(env));
    ctx.waitUntil(algPulizia(env));
    ctx.waitUntil(invDb(env).then(db => db && db.prepare("DELETE FROM inviti WHERE scade < ?").bind(Date.now()).run()));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      if (url.pathname === "/salute") return json({ ok: true, servizio: "jona-notifiche", push: !!env.VAPID_JWK, promemoria: algDbs(env).length > 0, gemini: !!env.GEMINI_KEY, allegati: algDbs(env).length });
      if (url.pathname === "/chiave" && request.method === "GET") return json({ chiave: (await vapid(env)).pub });
      if (url.pathname === "/gemini" && request.method === "POST") return await gemini(request, env);
      if (url.pathname === "/inviti" && request.method === "POST") return await invCrea(request, env);
      if (url.pathname.startsWith("/invito/") && request.method === "GET") return await invLeggi(url.pathname.slice(8), env, request.headers.get("cf-connecting-ip") || "");
      if (url.pathname === "/richiesta" && request.method === "POST") return await richiesta(request, env);
      if (url.pathname === "/promemoria" && request.method === "POST") return await promSalva(request, env);
      if (url.pathname.startsWith("/allegati")) {
        const uid = await membro(request, env);
        if (!uid) return algErr("Telefono non collegato al ristorante", 403);
        if (url.pathname === "/allegati" && request.method === "POST") return await algSalva(request, env, uid);
        if (url.pathname === "/allegati/spazio" && request.method === "GET") return json(await algSpazio(env));
        if (request.method === "GET") return await algLeggi(url.pathname.slice(10), env);
      }
      if (url.pathname === "/invia" && request.method === "POST") {
        const body = await request.json().catch(() => null);
        if (!body) return json({ errore: "richiesta non valida" }, 400);
        return json(await send(env, body));
      }
    } catch (e) {
      return json({ errore: String(e.message || e) }, 500);
    }
    return new Response("Non trovato", { status: 404, headers: CORS });
  },
};
