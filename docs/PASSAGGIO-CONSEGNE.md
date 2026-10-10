# Passaggio di consegne (2026-10-10, fine sessione #60)

Sessione attuale: #61

Ramo di lavoro: `claude/jona-ramo-definitivo` (ramo unico permanente da #61; i rami `claude/jona-sessione-<NN>` non si usano più). **v69 online** (PR #80, main `76c3416`). Prossimo: D29 (Android, iPhone, Mac, Windows).

## Ultimo messaggio di Mario (#60), parola per parola
«Non so se l'avevi già ottimizzato, ma mi raccomando, ottimizza l'app sia per telefoni Android, sia per iPhone, sia per Mac, computer Mac e computer Windows.»
→ Risposto solo in breve (handoff obbligatorio). È la voce nuova **D29** in `docs/DA-FARE.md`. Da fare DOPO aver pubblicato la v69.

## PRIMA COSA DA FARE (#61): pubblicare la v69
1. Ramo della versione: `claude/jona-v69-conveniente` (commit `f8d003f`, già su GitHub). Lavora lì per la PR. Gli appunti (consegne, DA-FARE) cambiali solo in `claude/jona-sessione-61` (E7).
2. Prove legate già fatte in #60 (TZ=Europe/Rome): `test-conveniente` 10/10, `test-news`, `test-richieste-gestite`, `test-testbar`, `test-staff` senza FAIL. `test-firebase-approva-arrivi` → TimeoutError perché **l'emulatore Firebase non era avviato** (serve Java, vedi `tools/README.md` punto 3): rilanciarla CON l'emulatore prima della PR. `test-giro` era ancora in corso alla chiusura: rilanciarlo.
3. Se tutto verde: PR verso `main` → controllo «Prove automatiche» verde → squash → controllo online → `git fetch origin main && git merge origin/main` su `claude/jona-sessione-61` + push. Pubblica senza chiedere (regola PUBBLICA SEMPRE IN AUTOMATICO). Non tocca il Worker: niente giro completo extra.
4. Dire a Mario che è online e cosa provare (M nuovo: approvare una richiesta con un prodotto che c'è da 2 fornitori).

## v69 nel dettaglio (D24, idea approvata da Mario in #53)
- `index.html`: `cheaperOf(pid)` prima di `altsOf`: stesso gruppo `gkey` (`S.gidx`), altro fornitore, prezzo non nullo, stessa unità (`normUnita(...).toLowerCase()`), prezzo < 99% dell'attuale → il più economico. `cheapHTML(p,b,qta,attr)`: pulsante `.cheap` (verde mirto) «Da **X** costa N € in meno / unità (risparmi M €) · Passa», testo dentro uno `<span>` (senza, l'inline-flex lo spezzava in colonne: visto nello screenshot).
- `gmLine` (approvazione richieste): riga verde se `cheaperOf` trova qualcosa; azione `rbest` → `rswapTo(rid,i,pid)`. `rswapTo` è il vecchio corpo di `rswap` (menù «Cambia fornitore»), ora condiviso.
- CSS `.cheap` dopo `.tag.best`. APP_VER 69, NEWS v69 (chef + dev.aggiunte), `sw.js` CACHE `jona-ordini-v73`.
- Prova nuova `tools/test-conveniente.mjs` (10 controlli: unità diversa, differenza < 1%, già il più economico, staff senza suggerimento, approvazione con risparmio, «Passa», 320/390 px, nessun errore). Aggiunta a `VELOCI` in `tools/prova-ci.sh`. Con `SHOT0=…png` fa lo screenshot della riga verde.
- CLAUDE.md: riga v69. DA-FARE: D24 aggiornata.

## Decisioni (#60) e perché
- **D24 prima di D23**: Mario «possibile ma non saprei ora» su D23. D23 (più XML + `.p7m`) serve solo quando il commercialista manda gli XML (M28, aperto); D24 funziona subito con i listini già caricati.
- **Già esisteva** nel catalogo: etichetta «più conveniente» (`groupHTML`) e per lo staff `defOpt` sceglie già il più economico. Mancava solo nell'approvazione.
- **Niente suggerimento nel carrello**: il gestore NON ha la scheda Carrello (`GM_TABS`/`DEV_TABS`), lo staff ce l'ha ma non vede i prezzi (`showPrices` = `isMgr`). L'avevo costruito e poi tolto (codice che non sarebbe mai girato) → E24.
- Soglia 1%: evita suggerimenti per pochi centesimi (es. 1,00 contro 0,995).
- Unità diverse non si confrontano (kg contro cassa): niente conversioni, troppo rischioso.

## Regola dei rami cambiata (Mario, #60)
- Mario: «Ho paura di cancellare un ramo sbagliato … calcella allora la regola in entrambi i progetti di cancellare i rami tanto non si può ma rinnominarli bene in ordine si».
- Fatto: CLAUDE.md «RAMI IN ORDINE» = solo nomi in ordine, **mai cancellare rami** (né Claude né Mario); i vecchi non si rinominano (rinominare = cancellare, 403). M31 tolta. Detto a Mario che i rami in più non danno problemi.
- Mandato messaggio alla sessione RVC #52 (`session_01JsFRVrgkAm7xSebe2EK7op`) con la regola nuova da mettere nel CLAUDE.md di RVC quando Mario dà il via. D28 aggiornata.

## D29 nuova (ultimo messaggio di Mario): app ottimizzata per Android, iPhone, Mac, Windows
- Cosa c'è già (da verificare, non rifare): app installabile (PWA, `manifest.webmanifest` fullscreen), `test-giro.mjs` a 320/390 px chiaro/scuro, barra laterale su schermi larghi (`.nav-brand`).
- Proposta per #61 (dopo la v69): giro di prova con Playwright anche con WebKit (motore di Safari su iPhone e Mac) se installabile senza download pesanti, e Chromium a 1280/1440 px (Windows/Mac); controllare: zona sicura iPhone (`env(safe-area-inset-*)`, `viewport-fit=cover`), `apple-touch-icon`, `apple-mobile-web-app-*`, notifiche push su iPhone (solo con app installata, iOS 16.4+), tastiera su iPhone che copre i campi, scorciatoie e mouse/rotellina su computer, input `type=date/time` su Safari. Proporre a Mario 3 strade (ovvia/furba/geniale) con immagine, poi fare.
- Mario non ha detto che qualcosa non va: è una raccomandazione generale.

## Errori nuovi
- E24 in `docs/ERRORI.md` (suggerimento costruito nel carrello del gestore, che non esiste).

## Ancora aperto (da prima)
- Email dei servizi di Jona, M26, M25, D10: senza risposta. In attesa: M27, M28, M29/M30. D23, D25, D26 da fare. Elenco completo in `docs/DA-FARE.md`.

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00 (ora italiana): commit+push dopo ogni passo.
- Gemini Flash sovraccarico (503) nelle ore di punta: catena Flash-Lite → Cloudflare.

## Consegne precedenti (#59) in breve
- File dei servizi fatto e mandato a Mario (solo scratchpad, non nel repo pubblico). Giro completo run 38046156932 verde. Pulizia rami impossibile (403) → ora regola cambiata, niente pulizia.
