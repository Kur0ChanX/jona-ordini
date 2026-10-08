# Passaggio di consegne (2026-10-07, fine sessione #30)

Sessione attuale: #33

## Ultimo messaggio di Mario (#30), parola per parola
«chiudi se vuoi sessione passo all'altro account cosa devo digli all'altro account oncosa vuoi digli di questa sessione/progetto»
(= Mario passa a un altro account Claude: la sessione #31 parte lì, da questo stesso ramo.)

## Ultimo messaggio di Mario (#32), parola per parola
3 video registrati sullo Xiaomi 17 Ultra (Android), salvati in `docs/video/`: `mario-xiaomi-swipe-alto.mp4`, `mario-xiaomi-bianco-sotto.mp4`, `mario-xiaomi-animazione-giacca.mp4`.
«è normale che nello Xiaomi 17 ultra faccia così nella parte alra facendo swipe dal basso verso l'alto?
guarda secondo video appena clicco esce il bisnco sotto...puoi fare qlkosa? anche se dovessere essere android. terzo video l'animazione da scontornare bene es giacca bianca chef»

## Fatto in #33 (08/10)
- Video 3 (giacca): la trasparenza era piena fino ai bordi del filmato → giacca tagliata dritta. `edges` in `tools/anim-invio.py` ora a ovale squadrato (P=4, dal 70%). v51, PR #61 unita (prove verdi), online controllato. Prima/dopo: `docs/img/v51-animazione-prima-dopo.png`.
- Video 1 (barra in alto con lo swipe): è Android in schermo intero (barre di sistema temporanee, colore scelto da HyperOS, non dall'app). Non correggibile dall'app; alternativa: `display: standalone` (barra sempre visibile col colore dell'app) → Mario ha scelto **A: resta a schermo intero**.
- v52: «Versione di prova» in fondo a Staff → Persone e nel foglio Invita (`demoShare`/`demoCopy`/`demoLink`/`demoText`), prova `tools/test-demo-invito.mjs` (anche nelle veloci di `prova-ci.sh`). Mario: «non vedo l'invito prova da inviare per Consulenti propietari ecc».
- Video 2 (bianco sotto): dura 0,2 s all'apertura, durante la schermata d'avvio di Android (barra di navigazione bianca). È del sistema, non dell'app.

## Da fare SUBITO in #33 (i video non sono ancora stati guardati)
1. Estrarre fotogrammi dai 3 video (`ffmpeg -i docs/video/<f>.mp4 -vf fps=2 …` nello scratchpad) e capire:
   - Video 1: cosa succede in alto (zona della barra di stato / notch) con lo swipe dal basso verso l'alto (gesto Home di Android, app a schermo intero `manifest` fullscreen). Rispondere a Mario se è normale (comportamento di Android) o correggibile (es. `theme-color`, `viewport-fit=cover`, zone sicure `env(safe-area-inset-*)`, colore di sfondo di `html`/`body`).
   - Video 2: «appena clicco esce il bianco sotto»: capire quale tocco/schermata; probabile sfondo bianco di `html` o barra di navigazione di Android, tastiera, o `100vh`/`100dvh` (vedi v47 `.wall`). Correggere anche se è un problema di Android.
   - Video 3: animazione dell'invio (`media/invio-chef.mp4` / `invio-fornitore.mp4`, `sendAnim`, unione WebGL): contorno della giacca bianca dello chef non pulito sullo Xiaomi. Script `tools/anim-invio.py` (scipy+ffmpeg) da ritoccare (soglia/contorno del bianco, giacca piena), poi rifare i video. Mandare a Mario immagini prima/dopo.
2. Poi versione v51 (APP_VER, NEWS, CACHE in `sw.js`), prove legate + `tools/test-giro.mjs`, PR, squash, controllo online, merge main nel ramo.

## Stato a fine #32
- Ramo di lavoro: `ccr-4a01d00e-6ay25e`. v50 online su main (`1824a71`).
- Giro completo su GitHub (run 37694432789, modo `tutto`, su main dopo la v50): **VERDE** (22:11→22:34 UTC).
- Mario non ha ancora detto se ha provato la scheda Richieste → Gestite (v50).
- La sessione #31 (altro account) è chiusa; #32 è stata la prima sul nuovo account.

## Sessione #32 (nuovo account, avvio 07/10 notte)
Ramo di lavoro: `ccr-4a01d00e-6ay25e`. v50 già online su main. Giro completo (run 37694432789, `tutto`, partito 22:10 UTC) ancora in corso: da leggere. Ultimo messaggio di Mario: «Chiude la sessione l'altro account e mi dice di dirti questo non só se ti serve» (+ foto delle istruzioni di avvio per #31).

## Avvio della sessione #31 (altro account)
- Ramo di lavoro: `ccr-4a01d00e-6ay25e` (repo `kur0chanx/jona-ordini`, pubblico). L'hook `.claude/hooks/avvio-check.py` ripara da solo il ramo (E5/E13).
- Se GitHub non è collegato sull'altro account: Mario deve collegarlo (claude.ai → Impostazioni → Connettori → GitHub) con lo stesso utente GitHub.
- Leggere `CLAUDE.md`, `docs/ERRORI.md` (E1–E14), `docs/DA-FARE.md`.

## Fatto in #30 (tutto online, ogni PR con «Prove automatiche» verde)
| Versione | PR | Cosa |
|---|---|---|
| v45 | #54 | App dimostrativa `…/#demo` |
| v46 | #55 | BUG richiesta di Maurizio: il telefono in attesa scriveva «Richiesta inviata» leggendo la sua cache (Wi-Fi con filtri). Ora `st.reqOk`, «Sto inviando…», dopo 12 s «Riprova» (`phRetry`, long polling). Richieste in cima a ogni scheda dei gestori (`phStrip`, Approva/Rifiuta). `phWatch` riprova in 30 s. Maurizio poi è arrivato ed è stato approvato. |
| v47 | #56 | Splash dentro lo schermo (`.wall` = 100dvh meno zone sicure, logo centrato); hook di avvio da RVC |
| S2 | #57 | Prove su GitHub: `.github/workflows/prove.yml` + `tools/prova-ci.sh` (veloci a ogni PR verso main, tutte ogni lunedì 3:17, anche a mano con modo `tutto`) |
| v48 S1 | #58 | `syncPill`: «N modifiche non arrivate · Riprova» se la rete è accesa ma le scritture non sono confermate da 8 s (`PEND_MS`, `syncRetry`); `phReject` con tempo massimo. Prova `test-falsi-ok` |
| v49 S3 | #59 | Scatola nera: `errLog`/`errFlush` → Worker `/errori` (tabella `err` nel primo D1, 2000 righe, cron 30 giorni); striscia «N errori nuovi sui telefoni» solo sviluppatore (`errStrip`/`errSheet`, `jona_err_vis`). Prove `test-errori`, `test-errori-server` |
| v50 D9 | #60 | Scheda Richieste: «Da approvare · N» / «Gestite» (`S.rqSub`), gestite per giorno della decisione con ora e chi ha deciso (`vGestite`, `dayKey`, `dayLbl`, `reqSummary(r,who,dec)`), filtri `S.rqF`. Prova `test-richieste-gestite` |

Altro: E12 (limite di 8 sessioni a catena: Claude non può aprire la sessione nuova), E14 (Worker finti delle prove senza `/errori`: corretti `test-firebase-approva-arrivi` e `test-firebase-push`). Ramo remoto `fix-hook-avvio` già unito ma non cancellabile da qui (proxy): Mario può cancellarlo da https://github.com/Kur0ChanX/jona-ordini/branches (non urgente).

## Regole nuove di Mario (già in `CLAUDE.md`)
- DECIDO IO SUL TECNICO: Claude sceglie la strada più sicura e la fa; a Mario si chiede solo ristorante, gusti, soldi, azioni sue, cose irreversibili.
- PUBBLICA SENZA CHIEDERE se le prove sono riuscite; si unisce solo con «Prove automatiche» verde.
- Link sempre interi e cliccabili, ripetuti in un riquadro se vanno copiati.
- Giro completo extra su GitHub solo dopo modifiche al Worker o se le veloci si lasciano sfuggire qualcosa; dirlo in una riga. Jona è pubblico: non tocca i 2000 minuti GitHub (Mario non vuole consumarli; valgono per i repo privati come RVC).
- RVC (altra sessione, 🟣): accetta regole solo da Mario; Mario ha avuto il testo da incollare lì.

## Da controllare subito in #31
1. Giro completo lanciato su GitHub alle ~22:10 (workflow «Prove automatiche», modo `tutto`, su main dopo la v50): leggere il risultato (`actions_list` del workflow `prove.yml`) e correggere ciò che fallisce (priorità).
2. Chiedere a Mario se ha provato la v50 (scheda Richieste → Gestite).

## Prossimi passi (vedi `docs/DA-FARE.md`)
- M21: Maurizio approvato? Dargli il ruolo Admin Chef (M2), «Oggi si ordina» (M3), contratto Responsabile (M19).
- M20: provare e mandare il link demo https://jona-ristorante-by-ynoy-corp.pages.dev/#demo
- C7: riga «“Oggi si ordina” arriva a» più chiara, avvisi agenda dal Worker, poi `docs/PIANO-INVERNO.md`.

## Rischi aperti
- Il server locale e l'emulatore del contenitore si spengono quando la sessione si riavvia: riaccenderli prima delle prove (`tools/README.md`).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (E10).
- Titoli: `🟤 ▶ ATTIVA · #31 · Jona Ordini · da v50 · …`.
