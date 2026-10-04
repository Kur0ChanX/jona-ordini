# Passaggio di consegne (2026-10-04, sera)

Sessione attuale: #02

## Ultimo messaggio di Mario
«sì, pubblica la v33»

## Da fare SUBITO (sessione #02)
1. **Pubblicare la v33** (già sul ramo `ccr-402d6602-imjwpw`, commit `a3e3e72` + questo handoff): PR verso `main` → squash merge → controllo online (`APP_VER=33`, `sw.js` `jona-ordini-v37`) → riallineamento senza force (`git fetch origin main && git merge origin/main`, poi `git push`).
2. Dire a Mario cosa far provare al collega con iPhone (passi numerati): aggiornare l'app (chiudi e riapri), mandare un vocale corto e uno lungo (>1 min), riferire l'eventuale messaggio d'errore con il codice.

## Stato
- **v33 pronta, NON ancora pubblicata.** Vocali da iPhone (`index.html`):
  - `chAuType(mimeType,type)`: tipo del vocale normalizzato (Safari può dare `video/mp4` o vuoto → il Worker rispondeva 415, e il telefono diceva «controlla la connessione»).
  - `chRec`: in `onstop` attesa di 400 ms prima di unire i pezzi (WebKit può mandare l'ultimo/unico pezzo DOPO `stop` → prima «Vocale non registrato»); `R.b` somma i byte e a 1,15 MB chiama `chRecStop(true)` (Safari può ignorare `audioBitsPerSecond`; limite 1,3 MB in `chFile`, `ALG_MAX` del Worker 1,85 MB in base64).
  - `chFile`: errori con codice HTTP («errore 415») e 413 → «Vocale troppo lungo».
  - `APP_VER=33`, voce v33 in `NEWS`, `sw.js` `CACHE` `jona-ordini-v37`.
  - Prova nuova `tools/test-v33.mjs` (MediaRecorder finto «alla Safari»): 7 verdi; contro la v32 falliva (provato). Verdi anche `test-v28`, `test-v30`, `test-news`, `test-firebase-allegati` (emulatore). `tools/README.md` aggiornato.
  - Limite: niente iPhone vero (solo Chromium); sono le cause più probabili, la conferma arriva dalla prova del collega.
- `CLAUDE.md`: titoli sessioni con numero `#NN` (punto 5 dell'handoff) e regola «NUMERO PROGRESSIVO DELLE SESSIONI» in REGOLE TRASVERSALI. Questa sessione era la #01; la nuova è la **#02**.
- Mario ha chiesto il prompt per portare le regole in altri progetti: dato in chat (lo copia lui, NON salvarlo nel repo).
- v32 online (PR #41, squash `9ed0d26`).

## Domande ancora aperte per Mario (sul collega con iPhone)
Modello e versione iOS, app installata in Home o Safari, cosa vede (errore? niente?), data del problema.

## NON fatto (da prima)
- Cambio sottodominio workers.dev: bloccato dal controllo di sicurezza della sessione; resta `mario-miscera`. Se Mario lo cambia: `WK_SUB` (index.html), `PUSH_URL` (sw.js), workflow, test Firebase/Gemini, `CLAUDE.md`, `CACHE`.
- Maurizio Lai (registrazione/ruolo): lo fa Mario. Mauro Loi in «F&B Manager»: da confermare.

## Prossimi passi dopo la v33
1. Risposta del collega iPhone → se c'è ancora un errore, usare il codice mostrato.
2. Prove dal vero di Mario: vocale Android→iPhone, gesto indietro Android, pallino, invito con codice, v31 (In turno oggi, promemoria, consumi).
3. «Decisioni per Mario» del resoconto v32: sottodominio, netWatch, «In turno oggi» visibile allo staff, Mauro Loi F&B, `/invia` e inviti senza limiti.

## Rischi aperti
- `/invia` del Worker non controlla chi chiama; tutti i telefoni approvati leggono tutti i messaggi e allegati.
- `/invito/<codice>` senza limite di tentativi.
- Promemoria ordini: parte solo con un telefono di un gestore aperto (un cron nel Worker lo renderebbe puntuale).
- `test-firebase-flow` fallisce 23:30–24:00.
- netWatch: con molte scritture di fila passa al long polling per sempre e ricarica una volta.
