# Passaggio di consegne (2026-10-07, fine sessione #30)

Sessione attuale: #31

## Ultimo messaggio di Mario (#30), parola per parola
«chiudi se vuoi sessione passo all'altro account cosa devo digli all'altro account oncosa vuoi digli di questa sessione/progetto»
(= Mario passa a un altro account Claude: la sessione #31 parte lì, da questo stesso ramo.)

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
