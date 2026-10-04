// Server delle notifiche di Jona Ordini: riceve dall'app titolo, testo e iscrizioni dei telefoni,
// cifra il messaggio (Web Push, RFC 8291) e lo consegna al servizio push di ogni telefono (firma VAPID, RFC 8292).
// La chiave VAPID (JWK P-256) sta nel segreto VAPID_JWK, creato dal workflow GitHub alla prima pubblicazione.
// /gemini: fa da tramite verso Google Gemini con la chiave del ristorante (segreto GEMINI_KEY), solo per i telefoni
// registrati (membri/<uid> in Firestore); se Gemini è occupato (429) aspetta quanto chiede e riprova, poi prova il modello Lite.

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
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
  const body = b64u(enc.encode(JSON.stringify({ aud, exp, sub: "https://kur0chanx.github.io/jona-ordini/" })));
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

// il telefono manda il suo gettone Firebase: se con quel gettone può leggere membri/<uid>, è del ristorante
const membriOk = new Map();
async function membro(request, env) {
  const tok = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const now = Date.now();
  if (membriOk.get(tok) > now) return true;
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
  if (membriOk.size > 200) membriOk.clear();
  membriOk.set(tok, Math.min(exp, now + 10 * 60 * 1000));
  return true;
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      if (url.pathname === "/salute") return json({ ok: true, servizio: "jona-notifiche", push: !!env.VAPID_JWK, gemini: !!env.GEMINI_KEY });
      if (url.pathname === "/chiave" && request.method === "GET") return json({ chiave: (await vapid(env)).pub });
      if (url.pathname === "/gemini" && request.method === "POST") return await gemini(request, env);
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
