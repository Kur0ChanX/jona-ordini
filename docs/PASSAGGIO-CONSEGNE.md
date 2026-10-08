# Passaggio di consegne (2026-10-08, fine sessione #33)

Sessione attuale: #34

## Ultimo messaggio di Mario (#33), parola per parola
«a

poi nonn vedo l'invito prova da inviare per Consulenti propietari ecc che avevamo già parlato»
(«a» = scelta A: l'app resta a schermo intero, vedi sotto.)

## Da fare SUBITO in #34
1. PR #62 (v52, «Manda la versione di prova») aperta, prove GitHub «prove» partite alle 14:06 UTC (run 37789788815). Se verde: squash merge (expectedHeadSha = HEAD del ramo, 40 caratteri), poi SUBITO `git fetch origin main && git merge origin/main` sul ramo e push; controllo online: `sw.js` con `jona-ordini-v56`. Se rossa: capire la causa e correggere.
2. Dire a Mario dove trovarlo: Staff → in fondo «Versione di prova» → **Manda la versione di prova** (immagine `docs/img/v52-versione-di-prova.png`). Anche in Impostazioni → Database centrale → Invita, in fondo.
3. Chiedere a Mario se l'animazione v51 sullo Xiaomi ora va bene.

## Fatto in #33 (08/10)
- I 3 video di Mario sono in `docs/video/` (Xiaomi 17 Ultra). v51 online (PR #61, `07b77d5`), controllato: `sw.js` v55 e `media/invio-chef.mp4` uguale al ramo.
- Video 3 (giacca): la trasparenza era piena fino ai bordi del filmato → giacca tagliata dritta. `edges` in `tools/anim-invio.py` ora a ovale squadrato (P=4, dal 70%). v51, PR #61 unita (prove verdi), online controllato. Prima/dopo: `docs/img/v51-animazione-prima-dopo.png`.
- Video 1 (barra in alto con lo swipe): è Android in schermo intero (barre di sistema temporanee, colore scelto da HyperOS, non dall'app). Non correggibile dall'app; alternativa: `display: standalone` (barra sempre visibile col colore dell'app) → Mario ha scelto **A: resta a schermo intero**.
- v52: «Versione di prova» in fondo a Staff → Persone e nel foglio Invita (`demoShare`/`demoCopy`/`demoLink`/`demoText`), prova `tools/test-demo-invito.mjs` (anche nelle veloci di `prova-ci.sh`). Mario: «non vedo l'invito prova da inviare per Consulenti propietari ecc».
- Video 2 (bianco sotto): dura 0,2 s all'apertura, durante la schermata d'avvio di Android (barra di navigazione bianca). È del sistema, non dell'app.

## Stato a fine #32 (superato: v51 online, v52 in PR #62)
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

## Prossimi passi (vedi `docs/DA-FARE.md`)
- M21: Maurizio approvato? Dargli il ruolo Admin Chef (M2), «Oggi si ordina» (M3), contratto Responsabile (M19).
- M20: provare e mandare il link demo https://jona-ristorante-by-ynoy-corp.pages.dev/#demo
- C7: riga «“Oggi si ordina” arriva a» più chiara, avvisi agenda dal Worker, poi `docs/PIANO-INVERNO.md`.

## Rischi aperti
- Il server locale e l'emulatore del contenitore si spengono quando la sessione si riavvia: riaccenderli prima delle prove (`tools/README.md`).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (E10).
- Titoli: `🟤 ▶ ATTIVA · #31 · Jona Ordini · da v50 · …`.
