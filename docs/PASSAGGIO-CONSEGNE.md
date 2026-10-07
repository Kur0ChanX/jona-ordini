# Passaggio di consegne (2026-10-07)

Sessione attuale: #21

## Ultimo messaggio di Mario (#20)
«devi fare tu in automatico» = il **merge delle PR lo fa Claude da solo** (squash, `merge_pull_request`), senza chiedere. Se GitHub lo nega: dirlo a Mario e proporre l'unione automatica con un workflow. Attenzione: `CLAUDE.md` su `main` dice ancora «il merge lo fa lui»; quello di questo ramo dice «lo fa Claude». Vale l'ultimo messaggio di Mario: allineare `CLAUDE.md` di `main` nella prossima PR.
Domanda ancora aperta a Mario: il riquadro «Attiva le notifiche» compare anche per lo staff (oggi sì): va bene?

## Notifiche (sessione #20)
- Telefono di Mario: Oppo/OnePlus ColorOS, permesso concesso, ma `pushManager.subscribe` dà `AbortError` (servizio push di Google). Chiave VAPID del Worker controllata: corretta (65 byte, inizia con 4). Niente DNS privato, solo hotspot. Non ha confermato se ha aggiornato Google Play Services/Chrome.
- Mario: «troppo macchinoso girare 15 telefoni». Scelta **A**: richiesta automatica + pallini in Staff; **B** (bot Telegram di riserva) solo se i 🔴 restano più di 2-3; C (app sullo store) scartata; WhatsApp scartato (a pagamento).

## Fatto in #20: ramo `hotfix-notifiche` (da `main`, pushato, commit 2) = **v40**
- `index.html`: `pushOn` riprova dopo `AbortError` (toglie iscrizione vecchia, 1,5 s, riprova), `S.pushErr` mostrato in `pushHelp` (`.ph-err`), `schedule()` a fine attivazione; guida Oppo completa (`PUSH_HELP` 'oppo'); `pushAsk()` sotto `banner()` (Attiva / Più tardi 3 giorni in `jona_push_ask` / Come fare se bloccate), azione `pushLater`; `vStaff` pallini 🟢/🔴 (`.pst`) e «N senza avvisi»; `pushWatch` → `schedule()`. `APP_VER` 40, NEWS v40 «Notifiche più semplici», `sw.js` `CACHE` v44.
- `tools/test-firebase-push.mjs`: prove nuove (secondo tentativo, errore esatto, guida Oppo, avviso e «Più tardi», pallini in Staff, foto con `SHOT_DIR`). Riuscita.
- **Difetto delle prove corretto**: in `test-firebase-{approva-arrivi,backup,flow,push,report}.mjs` un FAIL non cambiava il codice d'uscita (lo script le dava per riuscite). Ora `process.exitCode=1`. Il giro completo può quindi trovare errori vecchi, prima nascosti: vanno capiti e corretti.
- Riuscite anche `test-news` e `test-giro`. Il giro completo era partito in #20 ma la sessione è chiusa: **rifarlo**.
- Nuova chiave localStorage `jona_push_ask` (aggiungerla in `CLAUDE.md`).

## Prossimi passi (#21)
1. `git checkout hotfix-notifiche`, avviare `bash tools/prova-tutto.sh` in background, correggere ciò che fallisce.
2. Tutte riuscite → PR verso `main` → merge squash da Claude → controllo online (`APP_VER=40`) → dire a Mario di riprovare le notifiche (C2) e mandare la foto della riga rossa.
3. Riportare `main` nel ramo `ccr-4a01d00e-6ay25e` (`git merge origin/main`): conflitti attesi su `APP_VER`/`NEWS`/`CACHE`: il lavoro inviti/entrata libera diventa **v41** (`APP_VER` 41, `CACHE` v45, NEWS v41).
4. Poi quanto scritto in #19: finire `test-v40` punto 4 (ora v41: la scheda «Invito pronto» non compare dopo «Crea profilo»; sospetti: `fetch` al Worker vero in `invNew`, `invDel` respinto dalle regole), Mauro con ordini bloccati, M18, M14, M15. Elenco in `docs/DA-FARE.md`.

## Rischi aperti
- Un telefono in attesa da prima (`ISLyK5…`, M17) resta da approvare a mano.
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Se `AbortError` capita a molti Oppo/OnePlus, valutare la strada B (Telegram).
