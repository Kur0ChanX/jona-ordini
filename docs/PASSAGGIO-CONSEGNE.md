# Passaggio di consegne (2026-10-06)

Sessione attuale: #16

## Ultimo messaggio di Mario (#15)
«esce prima la schermata poi il mio logo in animazione lenta e fluida premium poi il caricamento» (arrivato dopo l'apertura di #16) → DA FARE in #16: all'avvio prima la schermata Jona, POI il logo YNOY con un'entrata più lenta e fluida, «premium», e solo dopo il caricamento/l'app. Oggi l'entrata di YNOY parte a 0,8 s e l'apertura dura 2,7 s (`S.splash`, `.intro`, `byIn`/`ynoyIn`/`ynoyShine`): allungare in modo coerente e aggiornare `tools/test-logo.mjs`. Mandare a Mario un video di anteprima.

Messaggio prima: «A» → ha scelto: prima fa **M12** (chiave + ID del nuovo account Cloudflare nei segreti GitHub), poi si pubblica la v37 (trasloco + logo) con le prove **brevi** (5-10 min). Chiedergli a che passo di M12 è (passi già dati in #15: token con template «Edit Cloudflare Workers» + Account › D1 › Edit + Account › Cloudflare Pages › Edit, All zones; segreti `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` su https://github.com/Kur0ChanX/jona-ordini/settings/secrets/actions).

Messaggi precedenti di #15 (in ordine):
- «fatto» → M11 (account Cloudflare nuovo + sottodominio) fatto.
- Logo YNOY&CORP (immagine allegata) «sotto l'apertura dell'app, Jona By + logo, professionale come le app moderne» → fatto.
- «entra subito dopo con un'animazione in entrata, spessore e prestigio» → fatto.
- «anche quando apri l'app già loggato aspetta che finisca l'animazione» → fatto (apertura 2,7 s, un tocco la salta).
- «non lo vedo» → spiegato: non è online finché la PR #46 non è unita.
- «un'ora per un logo non va bene» → regola nuova (vedi sotto).
- «pubblica ora il logo» → spiegato che unire #46 prima di M12 romperebbe notifiche/chat/inviti/Gemini (`WK_SUB` nuovo); proposte A (M12 poi tutto insieme) e B (PR separata); scelta **A**.

## Fatto in sessione #15 (ramo `ccr-4a01d00e-6ay25e`, PR #46 aperta, non unita)
- **Logo** `media/ynoy.png` (maschera 480×174 ricavata da `tools/originale-ynoy.jpg`, colorata via CSS). In `index.html`: costante `BY`, classi `.wall-by` (in fondo alla `.wall`, `margin-top:auto`), al posto della vecchia firma `.wall-brand`. Nella schermata d'ingresso e in «Un momento…». In `FILES` di `sw.js`. Voce `NEWS` v37 (dev) aggiornata. APP_VER/CACHE non cambiati (v37 non ancora pubblicata).
- **Animazione** solo con `.intro` (classe tolta dopo 3,0 s): `byIn` (lettere che si stringono), `ynoyIn` (svelato da sinistra, sfocatura, scala), `ynoyShine` (riflesso). Finisce a ~2,55 s.
- **Apertura da già entrati**: `S.splash` in `boot()` se c'è `jona_me`, per 2,7 s; un tocco la salta; spenta con «riduci movimento» (`animOff`) e con `navigator.webdriver` (le prove automatiche non la vedono).
- **Prova nuova** `tools/test-logo.mjs` (logo, posizione, niente scorrimento a 320/390, animazioni, apertura da entrati con webdriver finto, tocco). Riuscita. Citata in `tools/README.md`.
- `CLAUDE.md`: regola **SCELTA DELLE PROVE** (completo ~1 h / breve 5-10 min / subito; sceglie Mario ogni volta, senza risposta completo; con breve o subito il completo parte dopo la pubblicazione).
- Giro completo avviato in #15 sull'ultimo codice: 14/37 riuscite, nessuna fallita quando la sessione è stata chiusa (risultati persi col container: in #16 non serve rifarlo prima, Mario ha scelto «breve»).

## Prossimi passi (#16)
1. Seguire Mario su M12. Poi prove **brevi**: `tools/test-logo.mjs`, `tools/test-giro.mjs`, `tools/test-news.mjs`, `tools/test-inviti.mjs` (server `python3 -m http.server 8765`). Se verdi, dare a Mario i passi per unire la PR #46 (M13, squash merge, dal telefono).
2. Dopo il merge: controllare l'app sul nuovo indirizzo (apertura con logo), `jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/salute`, `invito.jona-ristorante-by-ynoy-corp.workers.dev/ABCDEF`, workflow Actions verdi, Firebase dal nuovo indirizzo. Subito dopo `bash tools/prova-tutto.sh` in background.
3. Riallineare il ramo (`git fetch origin main && git merge origin/main`, push normale). Poi M14, M15.
4. Ancora senza risposta: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository? Quali?

## Rischi aperti
- Chiave Firebase (`apiKey`) con possibili limiti di dominio su Google Cloud: se l'app sul nuovo indirizzo non si collega, controllare lì.
- Account Cloudflare nuovo: foto/vocali vecchi della chat persi, chiave VAPID nuova (notifiche da riattivare sui telefoni).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Il resto: `docs/DA-FARE.md`.
