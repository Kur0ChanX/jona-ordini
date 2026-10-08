# Passaggio di consegne (2026-10-08, fine sessione #35)

Sessione attuale: #36

## Ultimo messaggio di Mario (#35), parola per parola
«Logo B e la giacca  la A questa che la stai tralasciando sempre»
(con screenshot dell'immagine a zone, salvato in `docs/img/segnalazioni/v52-giacca-scelta-A.jpg`)

## Da fare SUBITO in #36 (Mario ha già scelto: niente domande)
1. **Giacca, zona A** (Mario: «la stai tralasciando sempre» → priorità, E16). Immagine con le zone: `docs/img/segnalazioni/v52-giacca-zone.png`; screenshot originali `v52-giacca-1.jpg`, `v52-giacca-2.jpg` (stessa cartella). Zona A = il bianco SOTTO il polsino della manica in alto, a sinistra della manica bassa, SOPRA la striscia scura (fessura tra le braccia). Nell'app sembra un blocco bianco piatto che continua la striscia scura: è sfondo da togliere (la striscia scura deve proseguire fino alla giacca).
2. **Logo B** senza «&» (v53): `python3` con `tools/logo-ynoy.py` → `mask(vB())` salvata come `media/ynoy.png` (LA 496×190: L=0, A=maschera; stesso formato di prima, il CSS non cambia). Poi togliere la «&» dai testi: `index.html` riga 13 `og:site_name` e riga ~1545 `BY` (`aria-label="By YNOY CORP"`), `worker/invito/src/index.js` righe 15 e 25, `tools/test-logo.mjs` riga 34 (`'By YNOY CORP'`) e commento riga 3, `tools/README.md` riga 31, `CLAUDE.md` riga «Firma visibile» → «Jona_Ristorante By YNOY CORP» (Mario ha chiesto lui di togliere la &: ok). Le vecchie voci di `NEWS` restano (storia).
3. Versione: v53 con `NEWS`, `APP_VER`, `CACHE` in `sw.js`. Prove legate (`test-logo`, `test-giro`, prove dell'animazione se ci sono) → PR → «Prove automatiche» verde → squash → merge di main nel ramo → controllo online. Il Worker `invito` cambia: controllare che `.github/workflows/cloudflare-worker.yml` lo ripubblichi e poi lanciare il giro completo su GitHub (modo `tutto`), dirlo a Mario in una riga.
4. Unione PR: se il controllo dei permessi la blocca, chiedere a Mario di scrivere «unisci la PR N» (E15).

## Analisi della giacca già fatta in #35 (non rifarla)
- `media/invio-chef.mp4` = filmato originale SPECCHIATO, fotogramma k+1 = `f(k+1)` dell'originale (non invertito). Nell'originale `tools/originale-invio.mp4` lo chef è a SINISTRA. `invio-fornitore` = invertito nel tempo, non specchiato.
- Per lavorare: `pip install scipy`; si può eseguire la parte alta di `tools/anim-invio.py` con `exec(open(...).read().split('frames, raw, box, fermo = []')[0])` (con `sys.argv=['x','tools/originale-invio.mp4']`) e usare `mask(rgb)` su un fotogramma.
- Vista utile: minimo dei canali con livelli 238→255 stirati a 0→255: lo sfondo vero è bianco pieno (~253-255), la stoffa bruciata è grigia con trama (247-251).
- Visto nel fotogramma 46: il «rosso» (punti tenuti con min≥247) sta sopra la manica alta e sopra la manica bassa: per lo più stoffa bruciata (grigia nei livelli). Tra le due maniche c'è però una fessura stretta di sfondo che `CHIUDI` (=14, chiusura delle fessure < 28 px), `liscio` e le `pieghe` (`PIEGA`=251.5) riempiono. Prova fatta: togliere i punti con `gaussian(mn,1.2) ≥ 252.5` collegati allo sfondo grande → toglie solo bordini, NON basta per la zona A.
- Da fare: trovare la zona A nell'originale (polsino della manica alta / fessura sopra la manica bassa, fotogrammi ~40-60 dove le due mani tengono il menù), misurare i suoi valori (probabilmente sfondo un po' in ombra, sotto 252) e far sì che la fessura scura continui: es. non applicare `CHIUDI`/`pieghe` dove la fessura è collegata allo sfondo tra le braccia, oppure soglia locale. Controllare con l'immagine composta su fondo scuro (come lo screenshot di Mario) e mandare a Mario un prima/dopo. Rifare i video con `python3 tools/anim-invio.py tools/originale-invio.mp4`.

## Fatto in #35 (08/10)
- Avvio ok. La sessione #34 ha aggiunto alle consegne il messaggio: «Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.» → è di RVC: detto a Mario di riferirlo alla sessione RVC 🟣.
- Mario ha guardato l'animazione: «nella giacca … dei pezzi da togliere … fanno parte dello sfondo» + 2 screenshot. Mandata immagine a zone A/B/C; scelta: A.
- Mario: «quando esce all'inizio il mio logo … and corp … la E commerciale riesci a toglierla … lavoro ad hoc proprio come logo … non voglio che il logo sia brutto senza la E» e «vorrei togliere la & su link inviti ecc». Fatte 3 proposte con le lettere originali di CORP (`docs/img/logo-senza-e-scelta.png`, script `tools/logo-ynoy.py`: vA spostato, vB più grande ×1.22 stessa base, vC distanziato). Scelta: **B**.
- Commit: `b75152e` (screenshot e zone), `6f21e9c` (proposte logo).

## Consegne precedenti (#34)
### Ultimo messaggio di Mario (#34), parola per parola
«Devo guardare ancora l'animazione, ancora non ho controllato, ti offro altre due domande. Una, se la versione di prova che invierò adesso non gli chiederà nessuna registrazione né nulla, eh, perché secondo me deve essere proprio così. Eh, cosa numero due, per il, il mio progetto RVC, ehm, mi consigli di, fare un passaggio, di fargli un passaggio di consegna per applicargli quel, quelle regole a quel problema PR? E poi e tante altre cose che hai riscontrato?»

Risposte già date in #34:
1. Versione di prova: NESSUNA registrazione. Il link `…/#demo` apre il benvenuto (`screenDemo`) → un tocco su «Entra nella demo» → dentro come «Ospite» con dati di esempio. Niente arriva al ristorante.
2. RVC: sì, consigliato. Claude ha dato a Mario un testo da incollare nella sessione RVC (RVC accetta regole solo da Mario): handoff con `source_url` + `source_revision`, E15, installare l'app Claude GitHub sull'account GitHub di RVC (altro account: da https://claude.ai/connect-github entrando con quell'account), accettare «Review request» dei permessi, unire PR solo con prove verdi e «unisci la PR N» di Mario.

## Messaggio di Mario arrivato dopo l'apertura di #35 (parola per parola)
«Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.»
Fatto: l'account GitHub di RVC è quello con la mail jona.ristorante@gmail.com (non Kur0ChanX). L'app Claude GitHub per RVC va installata entrando su GitHub con quell'account. Salvato anche in `docs/DA-FARE.md`? No: è di RVC, va detto alla sessione RVC.

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
