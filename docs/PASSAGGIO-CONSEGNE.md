# Passaggio di consegne (2026-10-10, fine sessione #64)

Sessione attuale: #65

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v70** (main `fbd485a`, PR #81 unita alle 17:55; controllato online: `APP_VER=70`, `CACHE` `jona-ordini-v74`, `media/ynoy.svg` 200). Codice del ramo = main (dopo l'unione differiscono solo i documenti).

## Fatto in #64 (17:31-18:05)
- All'avvio: scorta unita (era più vecchia del ramo: tenuta la versione del ramo per `docs/ULTIMO-MESSAGGIO.md`).
- **Ambienti (M32) controllati e chiusi**: `list_environments` → `env_01PHQTdrmzBJ65UoCn8yQSqE` = **Jona Ordini**, `env_01XAN7jjPicGskXoYJYrNX7e` = **RVC**. Questa sessione gira in «Jona Ordini» e il sito `…pages.dev` risponde 200 → rete «Completo» giusta, non invertiti. La rete di RVC da qui non si vede (deve restare com'era).
- **Prove rosse sulla PR #81**: `test-firebase-flow` «promemoria scadenza arrivato anche a B». Riprodotta in locale 3 volte su 3: NON era un caso. Causa: `test_f1` (dati di prova `makeTestData`) ha ora limite fissa 18:00; tra le 17:00 e le 18:00 è anche lui nell'ultima ora (`dlInfo` → `soon`) → 2 promemoria invece di 1. App giusta, prova sbagliata. Correzione (commit `f3da0ea` sul ramo della v70, ora in main): prima del controllo la prova toglie l'ora limite agli altri fornitori `test_`. Verde 2 su 2 in locale, poi «Prove automatiche» verdi → squash → online. Errore **E26** in `docs/ERRORI.md`.
- Unione di main nel ramo definitivo: conflitti solo negli appunti (`DA-FARE`, `ERRORI`, consegne, `ULTIMO-MESSAGGIO`) perché il ramo della v70 portava appunti vecchi entrati con la scorta (E7). Tenuti quelli del ramo definitivo (più nuovi).
- Nota per i controlli online: `…pages.dev/index.html` risponde 308 verso `/` → controllare con `curl -sSL "https://jona-ristorante-by-ynoy-corp.pages.dev/?x=…"`.
- **D29 avviata**: controllo di cosa c'è già e immagine con 3 strade mandata a Mario. **Mario ha scelto la 2 «Furba»**.

## D29, strada 2 «Furba» (prossimo lavoro, da fare SUBITO)
Cosa c'è già (non rifare): `viewport-fit=cover`, `safe-area-inset-top/bottom` (21 usi), `apple-touch-icon`, `apple-mobile-web-app-capable` e `-title`, `theme-color` dinamico, media query per computer (700/760/900/980/1260 px), controllo `PushManager` prima delle push, `manifest` fullscreen con ripiego standalone.
Da fare (ramo `claude/jona-v71-dispositivi` da main, poi PR, versione v71):
1. **Zoom dei campi su iPhone**: Safari ingrandisce la pagina se un campo ha testo sotto 16 px. Visto `select.v-alt` 15px; misurare con Playwright ogni `input/select/textarea` visibile nelle schede (riusare il giro di `test-giro`) e portarli a 16px solo dove serve (attenzione a non rompere l'aspetto: controllare con `test-giro`).
2. **Barra in alto su iPhone (app installata)**: manca `apple-mobile-web-app-status-bar-style`. Con `black-translucent` il contenuto va sotto la barra (già gestito da `safe-area-inset-top`) ma il testo dell'ora è bianco: prima controllare che la zona in alto (`body::before`, v54) sia scura in tema chiaro e scuro, altrimenti ora illeggibile. Se dubbio, lasciare com'è e annotarlo.
3. **Prove con Safari e computer su GitHub**: `test-giro.mjs` oggi usa solo Chromium a 320/390. Aggiungere variabili (es. `GIRO_BROWSER=webkit`, `GIRO_W=1280,1440`) e in `.github/workflows/prove.yml` installare WebKit (`/opt/pw-npm/node_modules/.bin/playwright install --with-deps webkit`) e far girare il giro anche con WebKit (390) e Chromium (1280/1440), dentro `tools/prova-ci.sh` (VELOCI). In locale WebKit non c'è e NON va scaricato (regola dell'ambiente): si prova solo su GitHub con la PR (gratis, repo pubblico).
4. Voce NEWS v71, `APP_VER` 71, `CACHE` `jona-ordini-v75`, riga v71 in CLAUDE.md, prova nuova per lo zoom (testo dei campi ≥ 16 px).
5. Pubblicare in automatico se le prove sono verdi (regola PUBBLICA SEMPRE IN AUTOMATICO), poi `git fetch origin main && git merge origin/main` sul ramo definitivo + push. Avvisare Mario.

## Ancora aperto per Mario
- M31: scelta della miglioria del logo (Ovvia/Furba/Geniale/Nessuna): nessuna risposta.
- Provare v69 (riga verde «costa … in meno» → **Passa**) e v70 (riaprire l'app, guardare l'apertura con il logo nuovo).
- Riga del ramo nelle preferenze personali dei due account (`docs/CAMBIO-ACCOUNT.md`).
- Elenco completo: `docs/DA-FARE.md`.

## Promesse fatte a Mario in #64
- «Ti avviso quando la v70 è online»: fatto nel messaggio di chiusura di #64 (online alle 17:55).

## Note tecniche
- In locale: emulatore Firebase con `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (Java c'è), server `python3 -m http.server 8765`. Playwright globale in `/opt/node22/lib/node_modules/playwright`.
- Per seguire le prove su GitHub senza `subscribe_pr_activity` (non funziona in questo account): ciclo in background con `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/actions/runs/<id>` finché `status` = `completed` (repo pubblico, niente chiave).
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva (da #63).
- All'handoff: `create_session` con `environment_id` = `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00: commit+push dopo ogni passo.
- Android: maschera SVG intorno a YNOY (D14) mai provata da Mario.
- Altre prove potrebbero dipendere dall'ora come E10/E18/E26: se una fallisce sempre in una fascia, cercare orari fissi nei dati di prova.

## Messaggio arrivato in #64 DOPO l'handoff (da fare in #65, prima di D29)
Parola per parola: «quando zooma all'inizio è sgranata riesci a migliorare la risoluzione o qualche soluzione per avere un logo migliore jona / il problema è solo che è bassa la risoluzione / Poi mandami il mio Logo YNOY in vettoriale è in un formato Png alta risoluzione»
- Logo YNOY: già mandati a Mario in #64 `media/ynoy.svg` (vettoriale) e `docs/img/logo/ynoy-2000.png` (2000 px). Fatto.
- DA FARE: il logo **Jona** nell'apertura (quando si ingrandisce all'inizio) è sgranato: risoluzione bassa. Trovare l'immagine usata nell'apertura (`.splash`), farla vettoriale o ad alta risoluzione, e provare con un prima/dopo sullo stesso fotogramma (E17).

## Ultimo messaggio di Mario (#64), parola per parola
«2» (risposta alla scelta delle strade di D29: strada 2 «Furba»).
Messaggi prima: «ok avvisami quando è online» (v70) · «ok intanto parto con D29?» · «si e dimmi se ho messo gli ambienti giusti o invertiti» · «come faccio a sapere se ho fatto giusto?»
