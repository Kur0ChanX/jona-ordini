# Passaggio di consegne (2026-10-08, fine sessione #34)

Sessione attuale: #35

## Ultimo messaggio di Mario (#34), parola per parola
«Devo guardare ancora l'animazione, ancora non ho controllato, ti offro altre due domande. Una, se la versione di prova che invierò adesso non gli chiederà nessuna registrazione né nulla, eh, perché secondo me deve essere proprio così. Eh, cosa numero due, per il, il mio progetto RVC, ehm, mi consigli di, fare un passaggio, di fargli un passaggio di consegna per applicargli quel, quelle regole a quel problema PR? E poi e tante altre cose che hai riscontrato?»

Risposte già date in #34:
1. Versione di prova: NESSUNA registrazione. Il link `…/#demo` apre il benvenuto (`screenDemo`) → un tocco su «Entra nella demo» → dentro come «Ospite» con dati di esempio. Niente arriva al ristorante.
2. RVC: sì, consigliato. Claude ha dato a Mario un testo da incollare nella sessione RVC (RVC accetta regole solo da Mario): handoff con `source_url` + `source_revision`, E15, installare l'app Claude GitHub sull'account GitHub di RVC (altro account: da https://claude.ai/connect-github entrando con quell'account), accettare «Review request» dei permessi, unire PR solo con prove verdi e «unisci la PR N» di Mario.

## Da fare SUBITO in #35
1. Attendere Mario. Chiedergli (una domanda per volta): animazione v51 sullo Xiaomi ok? (non l'ha ancora guardata).
2. Se Mario chiede di RVC: le regole si applicano solo dalla sessione RVC (🟣), non da qui.

## Fatto in #34 (08/10)
- La sessione #34 è partita SENZA repo (handoff di #33 senza `source_url`). Ricollegato con `add_repo` dopo l'ok di Mario. Mario ha l'account GitHub collegato e ha installato l'app Claude su Kur0ChanX (repo jona-ordini); gli ho chiesto di accettare «Review request» (aggiornamento permessi dell'app) su https://github.com/settings/installations.
- PR #62 (v52) unita con squash (`4e309aa`) dopo prove verdi e «unisci la PR 62» di Mario. Main riunito nel ramo (`2b069db`). Online controllato: `sw.js` = `jona-ordini-v56`. Mandata a Mario l'immagine `docs/img/v52-versione-di-prova.png` con i passi (Staff → in fondo → «Manda la versione di prova»; anche Impostazioni → Database centrale → Invita).
- E15 nel diario errori (`5163811`). `CLAUDE.md`, regola bloccata, punto 3 dell'handoff: nuova sessione sempre con `source_url` + `source_revision` (ok esplicito di Mario, `10d3ddf`).
- Il controllo automatico dei permessi blocca: `add_repo`, unione PR («Merge Without Review»), modifica di `.claude/settings.json` («Self-Modification») e push di `CLAUDE.md` senza un ok scritto di Mario in chat. Correzione «permesso fisso in settings.json» NON fatta (bloccata); non serve: basta «unisci la PR N».
- Account separato per Jona (jona.ristorante@gmail.com): consigliato NO per ora (A: restare così). Più avanti B: organizzazione GitHub gratuita «jona-ristorante» quando si consegna l'app al ristorante. C (account GitHub + Claude nuovi) sconsigliato: secondo abbonamento e trasloco. Mario non ha ancora scelto.

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
