# Passaggio di consegne (2026-10-07)

Sessione attuale: #22

## Ultimo messaggio di Mario (#21)
«quando vuoi far partire le prove automatiche chiedimi vuoi farle partire ora o dopo? le prove devi farle partire meno spesso e per cose urgenti o cambiamenti importanti di sistema dove il codice potrebbe avere problemi per la stabilità del programma»
→ Regola nuova scritta in `CLAUDE.md` (STABILITÀ → QUANDO). **Prima cosa da fare in #22: chiedere a Mario «Il giro completo sulla v40 lo faccio partire ora o dopo?»** (la v40 tocca le notifiche: è un cambiamento importante, il giro completo serve).

Risposte di Mario in #21:
- Riquadro «Attiva le notifiche» anche per lo staff: «funziona sì» = va bene così.
- «chiedi a Mario» nell'app non gli piace → «chiedi allo sviluppatore» (fatto).
- Barra Test: cambiando vista veloce gli avvisi si accumulavano in coda → tolti, pulsante attivo colorato (fatto).

## Fatto in #21 (ramo `hotfix-notifiche`, pushato, ultimo commit `df970ef`)
- `index.html`: l'avviso della coda (`obxBar`) ha la classe `obx obx-q`; `tools/test-firebase-approva-arrivi.mjs` cerca `.obx-q` (prima confondeva il riquadro `pushAsk`, che usa `.obx`). Prova riuscita.
- `index.html`: «Mario» → «lo sviluppatore» in tutti i testi visibili (17 punti; il poster QR dice «Registrati: un gestore approva il tuo telefono»). Restano solo note tecniche `dev` in NEWS, un commento e un dato di prova.
- `index.html`: azione `viewAs` senza `toast`; CSS `.testbar .seg button[aria-pressed="true"]` color laguna. Nota in NEWS v40 (`dev.correzioni`).
- Nuova prova `tools/test-testbar.mjs` (cambio vista veloce senza avvisi, pulsante colorato, nessun «Mario»/creatore nei testi). Riuscita; riuscita anche `test-news`.
- Il giro completo è stato fermato due volte (modifiche in corso, poi chiusura sessione): **non c'è ancora un giro completo valido sul commit `df970ef`**. Nel giro interrotto le prime 6 prove (fino a `test-firebase-chat`) erano riuscite.

## Prossimi passi (#22)
1. Chiedere a Mario «ora o dopo?» per il giro completo (`git checkout hotfix-notifiche`, `bash tools/prova-tutto.sh` in background). Correggere ciò che fallisce.
2. Tutte riuscite → PR `hotfix-notifiche` → `main` (allineare anche `CLAUDE.md` di `main`: merge fatto da Claude, regola QUANDO, chiave `jona_push_ask`) → merge squash da Claude → controllo online (`APP_VER=40`) → Mario riprova le notifiche (C2) e manda la foto della riga rossa.
3. Riportare `main` nel ramo `ccr-4a01d00e-6ay25e`: conflitti attesi su `APP_VER`/`NEWS`/`CACHE`; il lavoro inviti/entrata libera diventa **v41** (`APP_VER` 41, `CACHE` v45, NEWS v41).
4. Poi quanto in `docs/DA-FARE.md` (test-v40 punto 4 «Invito pronto», M18, M14, M15…).

## Rischi aperti
- Telefono in attesa `ISLyK5…` (M17) da approvare a mano.
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Se `AbortError` capita a molti Oppo/OnePlus: strada B (bot Telegram).
