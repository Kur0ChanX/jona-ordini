# Passaggio di consegne (2026-10-07)

Sessione attuale: #17

## Ultimo messaggio di Mario (#16)
Video dello schermo (07/10, 03:35): apre «Jona Ordini» dal telefono (ha DUE icone «Jona Ordini» installate), parte l'app sul nuovo indirizzo: icona Jona → «Un momento…» → **«Collega questo telefono»** (QR o codice d'invito di 6 lettere). È fuori dall'app e non ha un telefono collegato da cui creare l'invito. Da rispondere in #17: come rientra (vedi «Prossimi passi» 1).

Messaggi precedenti di #16 (in ordine): logo YNOY più lento e premium (fatto, video mandato, nessun commento di Mario sul ritmo) → M12 fatto (token nuovo con Workers + Cloudflare Pages Edit + D1 Edit, segreti GitHub aggiornati) → «Merged» della PR #46 (M13 fatto) → foto/video richiesto per M14 → video sopra.

## Fatto in sessione #16
- **Apertura più lenta** (`index.html`): `byIn` 1,3 s da 1,1 s; `ynoyIn` 2 s da 1,5 s (sfocatura 8px, 60% quasi nitido); `ynoyShine` 1,5 s da 2,9 s; `S.splash` 4,9 s (`setTimeout(end,4900)` in `boot()`); `.intro` tolta a 5,2 s. `tools/test-logo.mjs` aggiornata (attese 5,6 s / 4,0+1,6 s).
- Prove brevi riuscite (logo, giro, news, inviti). **PR #46 unita** (squash, `main` 7bbe999): v37 online su https://jona-ristorante-by-ynoy-corp.pages.dev/ (APP_VER 37, apertura nuova presente). Worker controllati a mano: `/salute` ok (push, promemoria, gemini, allegati 4), `/chiave` ok (VAPID nuova), `invito…/ABCDEF` ok.
- Workflow Worker su `main` rosso SOLO alla prova finale (sottodominio nuovo non pronto dopo 5 s). Corretto sul ramo: `.github/workflows/cloudflare-worker.yml` riprova 18×10 s (provato a mano: «Server a posto»). Va su `main` con la prossima PR.
- Ramo riallineato con `main` (merge normale), `docs/DA-FARE.md` aggiornato (M12, M13 tolti).
- Giro completo `tools/prova-tutto.sh` avviato dopo il merge: risultati persi con questo container → **rifarlo in #17** (in background).

## Prossimi passi (#17)
1. 🔴 **Rientro di Mario sul nuovo indirizzo (blocca M14)**. Sul nuovo dominio il telefono riparte vuoto (`localStorage` diverso: niente `jona_key`, `jona_me`, `jona_member`). La schermata «Collega questo telefono» (`index.html` ~riga 1647, `fbCode` ~4313, `fbJoinKey`) accetta codice o link. Lo script in `<head>` porta da `*.github.io` al nuovo indirizzo, quindi anche la vecchia icona finisce lì: nessun telefono resta collegato per creare un invito. Opzioni da verificare e proporre a Mario (brainstorming, 2-3 strade): (a) `fbJoinKey` accetta anche la chiave del ristorante: Mario la incolla (dove l'ha salvata?); (b) link con chiave nell'hash, se previsto; (c) invito creato dal vecchio indirizzo saltando il reindirizzamento (es. parametro), oppure dal Worker. Leggere prima `fbJoinKey` e lo script di `<head>`. Poi lo stesso vale per tutto lo staff: preparare un invito/QR per tutti (M14).
2. Il logo YNOY non c'è in «Collega questo telefono» (e in «Un momento…» la schermata dura poco). Mario vuole «prima Jona, poi il logo, poi il caricamento»: valutare `BY` anche lì (+ prova in `test-logo.mjs`). Non bloccante.
3. Mario ha due icone «Jona Ordini»: dopo il rientro dirgli di togliere la vecchia (GitHub Pages) e tenere/installare quella nuova.
4. Rilanciare `bash tools/prova-tutto.sh` in background; le correzioni + il workflow con i tentativi vanno in una PR nuova (prima chiedere a Mario: prove complete/brevi/subito).
5. Poi M15 (cancellare i vecchi Worker dal vecchio account, non `fruguponte`).
6. Ancora senza risposta: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository? Quali?

## Rischi aperti
- Chiave Firebase (`apiKey`) con possibili limiti di dominio: se dal nuovo indirizzo Firebase non si collega, controllare su Google Cloud.
- Notifiche da riattivare su ogni telefono (VAPID nuova); foto/vocali vecchi della chat persi.
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Il resto: `docs/DA-FARE.md`.
