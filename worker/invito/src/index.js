// Link corto dell'invito di Jona Ordini: https://invito.<sottodominio>.workers.dev/<CODICE>
// Mostra l'anteprima (WhatsApp legge i meta Open Graph) e apre l'app con il codice; la chiave la dà il Worker jona-notifiche.
// Il codice va solo dopo «#»: non arriva ai server di GitHub.

const APP = "https://kur0chanx.github.io/jona-ordini/";
const CODICE = /^[A-HJ-NP-Z2-9]{6}$/;

const pagina = dest => `<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Benvenuto nella squadra del Jona</title>
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jona Ristorante">
<meta property="og:title" content="Benvenuto nella squadra del Jona">
<meta property="og:description" content="Ordini, turni e chat della brigata, tutto in un'app.">
<meta property="og:image" content="${APP}media/invito.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${dest}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#3A2F2C;color:#F3EDE7;font:300 20px system-ui,sans-serif}a{color:#9fd3d7}</style>
</head><body><p>Apro l'app del Jona… <a href="${dest}">tocca qui se non si apre</a></p>
<script>location.replace(${JSON.stringify(dest)})</script></body></html>`;

export default {
  async fetch(request) {
    const c = new URL(request.url).pathname.slice(1).replace(/\/$/, "").toUpperCase();
    const dest = CODICE.test(c) ? APP + "#i=" + c : APP;
    return new Response(pagina(dest), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" },
    });
  },
};
