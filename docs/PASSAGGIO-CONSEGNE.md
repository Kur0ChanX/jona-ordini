# Passaggio di consegne (2026-10-06)

Sessione attuale: #13

## Ultimo messaggio di Mario (#12)
«La & dimentichi» → capito: togliere la `&` dall'indirizzo. Proposto `jona-ristorante-by-ynoycorp` (invito `invito.jona-ristorante-by-ynoycorp.workers.dev/CODICE`, app `jona-ristorante-by-ynoycorp.pages.dev`); scritta esatta «Jona_Ristorante By YNOY&CORP» in anteprima invito e app. Chiedere conferma (o versione corta) poi procedere.

Messaggi precedenti:
«In http e invito ovunque deve apparire Jona_Ristorante By YNOY&CORP»
- Risposto: nell'indirizzo non sono ammessi `_`, `&`, spazi, maiuscole. Il più vicino possibile: `jona-ristorante-by-ynoy-corp` (es. `invito.jona-ristorante-by-ynoy-corp.workers.dev`, app `jona-ristorante-by-ynoy-corp.pages.dev`), oppure nome corto + scritta esatta «Jona_Ristorante By YNOY&CORP» nel titolo e nell'anteprima dell'invito e nell'app. Attendere la scelta di Mario.

Messaggio precedente:
«Indirizzo Jona-Ristorante by YNOY&CORP anche invito. YNOY&CORP é il mio nome di sviluppo software»
- Da chiarire subito: negli indirizzi `&`, spazi e maiuscole non sono ammessi (solo lettere minuscole, cifre, trattini). Proposta da fare a Mario:
  - app: `jona-ristorante.pages.dev` (progetto Cloudflare Pages `jona-ristorante`);
  - sottodominio Worker: `ynoy-corp` → `invito.ynoy-corp.workers.dev/CODICE` e `jona-notifiche.ynoy-corp.workers.dev` (oppure `jona-ristorante`, se preferisce);
  - scritta «Jona Ristorante · by YNOY&CORP» nell'anteprima dell'invito (`worker/invito/src/index.js`, og:site_name/description) e in fondo all'app.
- Chiedere conferma dei nomi, poi procedere.

## Fatto in sessione #12
- Regole nuove in `CLAUDE.md`: niente nome del creatore (Mario Miscera, `mario-miscera`, `kur0chanx`) in link, inviti e testi per gli utenti (nome di chi invita sì; vale anche per RVC); «Link sempre»: per ogni passo a mano link diretto, perché, cosa inserire, pulsanti in grassetto.
- Mario ha unito la regola nelle sue preferenze di claude.ai (testo dato, conferma non arrivata).
- `index.html`: Novità con «Beta v<numero>» (al posto di «Versione»); voce v36 per lo staff ridotta all'animazione (titolo «Animazione dell'invio rifatta»), le ore nascoste restano solo in `chef`. `tools/test-news.mjs` aggiornato, verde. `APP_VER` ancora 36, `CACHE` non cambiata (lo fa la v37).
- Le consegne: limite 1000 parole confermato; storia vecchia tolta (è nei commit).

## Decisioni di Mario (#12)
- D2 strada **A**: cambiare il sottodominio Cloudflare dei Worker.
- Togliere anche `kur0chanx` dall'indirizzo dell'app → spostare l'app su **Cloudflare Pages**. Non sui progetti carte/tierlist (lì va bene).
- App in prova: solo Maurizio (che oggi non compare tra gli utenti: rientrando si sistema, poi controllare), Mauro e Mario. Rientrano con invito nuovo: niente pulsante di trasloco automatico.
- News per Maurizio e Mauro: chiare ma brevi.

## BLOCCO: modifica degli indirizzi negata
- Il classificatore di sicurezza di Claude Code ha negato («Traffic Redirection») la sostituzione degli indirizzi. Non aggirarlo. Serve la conferma scritta di Mario («sì, cambia gli indirizzi»); se viene negata ancora, spiegare a Mario come dare il permesso.
- Modifiche preparate ma NON fatte (v37), tutte con i nomi confermati:
  - `index.html`: `WK_SUB`; `og:image`; testi `PUSH_HELP` con `kur0chanx.github.io` (3 punti); `APP_VER=37`; voce NEWS v37 (tutti: nuovo indirizzo, reinstallare, invito nuovo; chef: link invito nuovi, approvare i telefoni in Staff → Telefoni da approvare); script in `<head>` che da `*.github.io` passa al nuovo indirizzo solo se risponde (`fetch` no-cors) portando `search`+`hash`.
  - `sw.js`: `PUSH_URL`, `CACHE` nuova.
  - `worker/src/index.js` riga ~71 (`sub` VAPID) e `worker/invito/src/index.js` (`APP`).
  - `.github/workflows/cloudflare-worker.yml`: 3 prove con il sottodominio.
  - Nuovo `.github/workflows/cloudflare-pages.yml`: su push a `main` (+ manuale), crea il progetto Pages se manca (API, errore chiaro se manca il permesso «Account › Cloudflare Pages › Edit»), copia `index.html sw.js manifest.webmanifest firebase-config.js *.png lib/ media/` in una cartella e `wrangler pages deploy … --branch main`, poi prova con curl.
  - `tools/*.mjs`: route `mario-miscera` e URL `kur0chanx` nei test (test-v29, test-inviti, test-v34, test-v35, test-firebase-*, test-gemini-server).
  - `CLAUDE.md`: indirizzo dell'app.
- Firebase non limita i domini (controllato `docs/FIREBASE.md`); Worker con CORS `*`.

## Ordine del trasloco (spiegato a Mario)
1. Claude: v37 su ramo + PR.
2. Mario: permesso Pages sul token Cloudflare (link diretti e pulsanti esatti).
3. Mario: cambio sottodominio su Cloudflare (Workers & Pages → sottodominio → Change).
4. Mario: merge della PR subito dopo (notifiche ferme pochi minuti).
5. Claude: controllo nuovi indirizzi, rilancio workflow Worker se serve.
6. Telefoni: installare dal nuovo indirizzo ed entrare con invito nuovo; QR fisso della cucina da rifare (chiedere se è stampato).

## Rischi aperti
- Se Pages non è pubblicato, lo script di passaggio non sposta nessuno (controlla che risponda).
- `test-firebase-flow`: fascia 01:30-02:00 italiane mai provata dal vero.
- Il resto: `docs/DA-FARE.md`.
