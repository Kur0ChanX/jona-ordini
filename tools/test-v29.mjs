// v29 (modalità locale): invito con testo di benvenuto e cartolina con QR, anteprima Open Graph.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = 'http://localhost:8765/'; let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto(URL); await p.waitForTimeout(800);
ok(await p.evaluate(() => APP_VER) === 29, 'APP_VER 29');
ok(await p.evaluate(() => NEWS[0].v === 29 && NEWS[0].chef.length === 2), 'novità v29 per i gestori');
ok(await p.locator('meta[property="og:image"]').getAttribute('content') === 'https://kur0chanx.github.io/jona-ordini/media/invito.jpg', 'og:image');
const r = await p.request.get(URL + 'media/invito.jpg'); ok(r.ok() && (await r.body()).length > 20000, 'immagine anteprima presente');
const t = await p.evaluate(() => inviteText('https://x.y/#k=abc'));
ok(t.includes('Benvenuto nella squadra') && t.endsWith('👉 https://x.y/#k=abc') && t.includes('3️⃣'), 'testo invito con link in fondo');
// cartolina: senza condivisione di file scarica il PNG
await p.evaluate(() => { localStorage.jona_key = 'prova'; navigator.canShare = () => false; });
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.evaluate(() => inviteCard())]);
ok(dl.suggestedFilename() === 'invito-jona.png', 'cartolina scaricata');
const fs = await import('fs'); const path = await dl.path(); const buf = fs.readFileSync(path);
ok(buf.readUInt32BE(16) === 1080 && buf.readUInt32BE(20) === 1350, 'cartolina 1080×1350');
fs.copyFileSync(path, process.env.CARD_OUT || '/tmp/invito-jona.png');
ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
await b.close(); console.log(fail ? fail + ' FAIL' : 'OK'); process.exit(fail ? 1 : 0);
