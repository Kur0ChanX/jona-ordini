# Passaggio di consegne (2026-10-10, fine sessione #65)

Sessione attuale: #66

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v71** (main `41cb365`, PR #82 unita alle 18:52; controllato online `APP_VER=71`). CACHE `jona-ordini-v75`.

## Fatto in #65 (18:20-18:55)
- All'avvio: scorta vecchia (17:30) unita con `merge -s ours` (il ramo aveva già il messaggio più nuovo).
- La #64 ha scritto (messaggio tra sessioni) che Mario, dopo l'handoff, ha chiesto: «quando zooma all'inizio è sgranata riesci a migliorare la risoluzione o qualche soluzione per avere un logo migliore jona / il problema è solo che è bassa la risoluzione / Poi mandami il mio Logo YNOY in vettoriale è in un formato Png alta risoluzione». Il logo YNOY glielo aveva già mandato la #64.
- **v71 logo JONA nitido** (fatto e online):
  - Causa: `.logo-full` usava una maschera PNG 480×384; l'apertura (`jonaIn`) la ingrandisce 4,2 volte → sgranata.
  - Soluzione: SVG vettoriale `media/jona.svg`, messo dentro index.html come `data:image/svg+xml,` (due volte: `-webkit-mask` e `mask`). Generatore `tools/logo-jona.py <maschera.png> <uscita.svg>` (pip: numpy scipy pillow scikit-image potracer). Conchiglia = contorno ricalcato (potrace); lettere sottili = linea al centro (scheletro) con rette raddrizzate, angoli vivi (catene unite nei nodi a due vie), curve lisciate (spline), spessore = area/lunghezza, punte tagliate dritte sui bordi della riga (clipPath), le «O» senza taglio (escono un poco dalla riga).
  - Scartati: ricalco a contorno di tutto (lettere sottili spezzate, ondulate e troppo spesse); rifare le scritte con un font (rischio di cambiare il logo: è una questione di gusto, E19).
  - Maschera vecchia salvata in `docs/img/logo/jona-maschera-480.png`; immagine prima/dopo `docs/img/logo/v71-prima-dopo.png` (mandata a Mario).
  - Prova nuova `tools/test-logo-nitido.mjs` (in VELOCI di `tools/prova-ci.sh`): maschera SVG, stesso disegno della PNG entro 2 px nei due sensi, bordi netti ingranditi, SVG in index.html = `media/jona.svg`. Verdi anche test-apertura-v62, test-news, test-giro; «Prove automatiche» GitHub verdi.
  - Errore E27 (sostituzione rotta per la `)` in `url(%23r0)`) in `docs/ERRORI.md`.
- `docs/DA-FARE.md`: M33 (Mario guarda il logo nuovo), D29 ora su ramo `claude/jona-v72-dispositivi` (versione v72).

## Prossimo lavoro: D29 strada 2 «Furba» (v72, Claude da solo, SUBITO)
Cosa c'è già (non rifare): `viewport-fit=cover`, `safe-area-inset-top/bottom`, `apple-touch-icon`, `apple-mobile-web-app-capable`/`-title`, `theme-color` dinamico, media query per computer (700/760/900/980/1260 px), controllo `PushManager`, manifest fullscreen.
1. **Zoom dei campi su iPhone**: Safari ingrandisce se un campo ha testo <16 px (visto `select.v-alt` 15px). Misurare con Playwright ogni `input/select/textarea` visibile nelle schede (riusare il giro di `test-giro`), portarli a 16px solo dove serve, controllare l'aspetto con `test-giro`.
2. **Barra in alto su iPhone installata**: manca `apple-mobile-web-app-status-bar-style`. Con `black-translucent` l'ora è bianca: controllare prima che la zona in alto (`body::before`, v54) sia scura in tema chiaro e scuro; se dubbio lasciare e annotare.
3. **Prove con Safari e computer su GitHub**: variabili in `test-giro.mjs` (es. `GIRO_BROWSER=webkit`, `GIRO_W=1280,1440`); in `.github/workflows/prove.yml` installare WebKit (`/opt/pw-npm/node_modules/.bin/playwright install --with-deps webkit` o il percorso giusto su GitHub) e far girare il giro con WebKit 390 e Chromium 1280/1440 dentro `tools/prova-ci.sh`. In locale WebKit non c'è e NON si scarica.
4. NEWS v72, `APP_VER` 72, `CACHE` `jona-ordini-v76`, riga v72 in CLAUDE.md, prova nuova (testo dei campi ≥16 px).
5. Pubblicare da solo se le prove sono verdi, poi `git fetch origin main && git merge origin/main` sul ramo definitivo + push. Avvisare Mario.

## Ancora aperto per Mario
- M33: guardare il logo JONA nuovo all'apertura (riaprire l'app).
- M31: scelta della miglioria del logo YNOY (Ovvia/Furba/Geniale/Nessuna): nessuna risposta.
- Provare v69 (riga verde «costa … in meno» → **Passa**) e v70 (apertura con YNOY nuovo).
- Elenco completo: `docs/DA-FARE.md`.

## Promesse fatte a Mario in #65
- «Se le prove sono verdi pubblico da solo e ti avviso»: pubblicato (18:52). L'avviso «v71 online» va dato a Mario dalla sessione #66 nel primo messaggio, se la #65 non l'ha già detto (la #65 lo scrive nel messaggio di chiusura).

## Note tecniche
- In locale: emulatore Firebase `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`, server `python3 -m http.server 8765`. Playwright globale `/opt/node22/lib/node_modules/playwright`.
- Per guardare l'apertura ferma a un istante: copia di `tools/video-apertura.mjs` (serve `webdriver` falso, profilo entrato, `getAnimations()` fermate a `currentTime`).
- Seguire le prove su GitHub: ciclo in background con `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/actions/runs?head_sha=<sha>` finché `completed` (repo pubblico).
- Controllo online: `curl -sSL "https://jona-ristorante-by-ynoy-corp.pages.dev/?x=…" | grep APP_VER`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.

## Rischi aperti
- Limite settimanale: era dell'account vecchio (Mario, #66). Nell'account attuale `get_session` mostra solo il limite di 5 ore, «allowed» (10/10 19:13).
- Logo JONA: le «R», «S», «O» piccole di RISTORANTE sono ricostruite da pochi pixel; se Mario vede un difetto, segnare la zona sul suo screenshot (E16) e correggere `tools/logo-jona.py`.
- Android: maschera SVG intorno a YNOY (D14) mai provata da Mario. Ora anche il logo JONA è una maschera SVG: stessa tecnica, Chrome/Safari la supportano.

## Ultimo messaggio di Mario, parola per parola
Nessun messaggio nuovo di Mario in #65 (la sessione è partita col prompt di avvio). Ultimo suo messaggio (arrivato in #64 dopo l'handoff): «quando zooma all'inizio è sgranata riesci a migliorare la risoluzione o qualche soluzione per avere un logo migliore jona / il problema è solo che è bassa la risoluzione / Poi mandami il mio Logo YNOY in vettoriale è in un formato Png alta risoluzione»
