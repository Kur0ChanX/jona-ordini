# Passaggio di consegne (2026-10-07)

Sessione attuale: #31

## Ultimo messaggio di Mario (#30), parola per parola
**S1 (v48) pronta**: `syncPill` mostra «N modifiche non arrivate · Riprova» se la rete è accesa ma le scritture non sono confermate da 8 s (`PEND_MS`, `st.pendT`, `syncRetry`/`netRetry`); `phReject` con tempo massimo. Controllati gli altri punti: chat ha già lo stato «in invio» (`pend` da `hasPendingWrites`), avvisi al chef hanno già «Non ancora arrivata/Arrivata ✓» (`obxBar`), `phApprove` ha `fbTmo`. Prova nuova `tools/test-falsi-ok.mjs` (8 PASS) aggiunta alle veloci di GitHub. Prove legate riuscite. Poi: S3 scatola nera, D9.

«perché mettili la stessa regola che valuti al meglio ed è autonomo no come hai fatto tu lo stesso mi chiede solo cose innerenti a cambiamenti del programma come abbiamo fatto noi» + 2 foto della sessione RVC (rifiuta le regole mandate da un'altra sessione: giusto, sicurezza). Dato a Mario il testo da incollare lui nella sessione RVC. **S2 FATTO**: PR #57 verde su GitHub (12 min) e unita (`7f62cac`), main unito nel ramo. Prossimo: S1 caccia ai «falsi ok», poi S3, poi D9.

«abbiamo detto Una volta a settimana il controllo da 1 ora? va bene o consumiamo troppo? valutabe aggiorna anche rvc» → valutato: repo Jona PUBBLICO = minuti di GitHub Actions gratis e illimitati, le prove non consumano token di Claude; si tiene il giro completo settimanale + veloci a ogni PR. Mandata la valutazione a RVC (se privato: 2000 min/mese condivisi).

«Puoi mettere la regola anche su RVC» → mandato alla sessione RVC #11 (`session_01NTWJZpaWY9weMSfovHruJv`) il testo delle regole: decido io sul tecnico, link cliccabili, pubblica senza chiedere, piano stabilità S1-S3. **S2 in corso**: PR #57 aperta (workflow `prove.yml` + `tools/prova-ci.sh`), primo giro su GitHub in esecuzione; se verde → squash + merge main nel ramo; se rosso → capire e correggere. Poi S1, S3, D9.

«devi capire che ne capisci piú tu di me mi chiedi cose che non só mai cosa è il meglio io mi fido di te la maggior parte delle volte se tu sbagli siamo fregati» → regola «DECIDO IO SUL TECNICO» in `CLAUDE.md`. Decisione: S2 subito (workflow GitHub con prove veloci a ogni PR + giro completo settimanale), poi S1 (caccia ai «falsi ok»), poi S3 (scatola nera degli errori), poi D9. Prima Mario aveva chiesto «ok consumero molti token 1 2 3?» (stima: S2 basso, S3 medio-basso, S1 alto).

«tutti questi problemi ogni volta fixati anzi fi mettere una pezza non si ouò rendere tutto stabile ho sempre l'ansia che c'è sempre un problema è lo risolvi poi si ripresenta e metti una pezza / sicuramente anche il progetto rvc ha qst problema» (citando: «Non sono riuscito a cancellare il ramo fix-hook-avvio…»).
Risposta data (brainstorming): due famiglie di problemi — (1) ambiente/strumenti (limite 8 sessioni E12, cancellazione rami bloccata dal proxy, guasti GitHub E11, ramo vecchio all'avvio E5/E13 ora riparato dall'hook): non sono bug dell'app; (2) bug veri dell'app trovati dall'uso reale, corretti alla radice con una prova permanente. Proposta stabilità: **S1** controllo «verità della rete» in tutta l'app (ovunque l'app dice «inviato/salvato» leggendo la cache, come il bug di Maurizio), **S2** prove automatiche su GitHub a ogni PR (workflow CI con emulatore), **S3** diario degli errori dei telefoni (errori JS salvati in Firestore/Worker per vederli prima degli utenti). Consigliato S1+S2 prima di D9. Da portare anche a RVC (sessione RVC #11 `session_01NTWJZpaWY9weMSfovHruJv`) dopo la scelta di Mario.

«si se non serve mai più. riesci a mettere ordine nelle richieste un sistema funzionale e comodo» + foto (`docs/immagini/mario-richieste-gestite.jpg`: scheda Richieste, «Gestite oggi 7», tutte «Rifiutata», con date di creazione miste 4 ott/ieri/11 min fa perché la riga mostra quando è stata CREATA ma l'ordine è per decisione). v47 ONLINE (PR #56). Ramo `fix-hook-avvio`: cancellazione rifiutata dal proxy («unexpected disconnect»), resta su GitHub: Mario può cancellarlo da https://github.com/Kur0ChanX/jona-ordini/branches. **Prossimo (D9)**: riordino della scheda Richieste — proposta: sotto-schede «Da approvare (n)» | «Gestite», gestite raggruppate per giorno (Oggi, Ieri, …) con ora della decisione e chi ha deciso, filtro Approvate/Rifiutate; chiedere a Mario con immagine prima di scrivere codice (`vRichieste` ~riga 2213, `reqSummary`).

«adesso è arrivata perfetto, una cosa ae clicco dall'app il tasto è uscita una nuova versione diventa cosí spaginata» + foto (`docs/immagini/mario-aggiorna-spaginata.jpg`): dopo «Aggiorna ora» la schermata di apertura sbordava (firma YNOY tagliata in basso). Corretto in v47: `.wall` alta 100dvh meno le zone sicure, logo centrato nella splash (`docs/immagini/splash-v47.png`). Richiesta di Maurizio ARRIVATA dopo la v46 (bug confermato risolto). Domanda aperta: cancellare il ramo remoto `fix-hook-avvio`?

**Stato (dopo l'ultimo messaggio)**: v46 ONLINE (PR #55, squash `3354d88`), controllato `APP_VER=46`, `CACHE` v50. Prove legate tutte riuscite. Unito `main` nel ramo e poi `origin/fix-hook-avvio` (hook di avvio che ripara il ramo, mandato dalla sessione RVC #11, E13). Il ramo remoto `fix-hook-avvio` NON è stato cancellato: la sessione RVC dice che Mario è d'accordo, da confermare con Mario. Nuova M21 (Maurizio riapre l'app e tocca Riprova).

«Se devi pubblicare la buova versione se non ci sono problemi pubblica sempre senza chiedere» → regola in `CLAUDE.md` (PUBBLICA SENZA CHIEDERE). v46 si pubblica da sola appena le prove legate sono riuscite.

Prima: «trova il bug non possiamo gregarce e dai non posso fare figuracce» (= niente aggiramento: trovare e correggere il bug).

**Bug trovato e riprodotto (emulatore)**: il telefono in attesa mostrava «Richiesta inviata» leggendo la propria cache anche se la scrittura di `req` non era arrivata al server (Wi-Fi con filtri, come in hotel). Il telefono di Mario quindi non riceveva niente. **v46 sul ramo (non ancora pubblicata)**: `st.reqOk`, «Sto inviando…» → dopo 12 s avviso + **Riprova** (`phRetry`: long polling + ricarica), `phStrip` (richieste in cima a ogni scheda dei gestori con Approva/Rifiuta = D8), `phWatch` riprova in 30 s. `APP_VER=46`, NEWS v46, `CACHE` v50. `tools/test-firebase-telefoni.mjs` estesa: 30 PASS. Prove legate in corso (v35, v40, news, demo, testbar, agenda, responsabile, firebase-flow, giro). Poi: scelta prove a Mario, PR, squash, controllo online, merge main nel ramo; dire a Mario che Maurizio deve riaprire l'app (si aggiorna) e toccare **Riprova** se compare.

Prima: Foto da WhatsApp del telefono di Maurizio (`docs/immagini/maurizio-richiesta-inviata.jpg`, senza testo): «Ciao Maurizio! Richiesta inviata… devono approvare questo telefono», «Nuovo profilo · nome utente maurizio.lai». Quindi Maurizio è nella schermata d'attesa (A) ma sul telefono di Mario (Admin Chef, Staff → Persone) «Telefoni da approvare» NON compare → **BUG da trovare in D8**: richiesta scritta in `membri/<uid>` (ok=false, req) ma `phWatch`/`phPend` di Mario non la mostra. Ipotesi da verificare con l'emulatore: ascolto fallito in silenzio (`PH.retry`), scrittura rimasta solo nella cache offline del telefono di Maurizio, regola `membri` che nega la lista, chiave cambiata. Nel frattempo a Mario: invito personale (aggira il problema).

Prima: «non lo so» (risposta a: cosa vede Maurizio sul telefono, A attesa / B errore / C demo / D non so).
Proposto: invito personale (Staff → **Aggiungi** → nome Maurizio → Password «La sceglie lui (invito WhatsApp)» → **Crea profilo** → manda il link): entra subito senza approvazione, aggira il problema. D8 resta da fare.

Prima: «ho problemi pensaci tu in automatico»
(= non riesce ad aprire a mano la sessione nuova. Claude non può aprirla: limite «lineage depth 8», E12, bloccati anche promemoria e routine. Decisione: si continua nella sessione #30 con la D8.)

Messaggio prima: «mettila piú in vista non nascosta» (= D8).

Poi Mario ha mandato una foto (`docs/immagini/mario-staff-senza-richiesta.jpg`): vista Admin Chef, Staff → Persone, NESSUNA sezione «Telefoni da approvare»; profili: Mario (sviluppatore), Mauro Loi (F&B), Mario Test Prova (Responsabile). Quindi la richiesta di Maurizio non arriva all'app (non è solo nascosta): da capire cosa vede Maurizio sul suo telefono (schermata d'attesa? errore? demo?) e se a Mario è arrivata la notifica «chiede di entrare». Possibile anche ascolto `phWatch` fallito (lista vuota, riprova dopo 5 min, nessun avviso): in D8 mostrare un avviso se l'ascolto fallisce.

## Messaggi di Mario in #30
1. «ok riscontri problemi in Generale?» → progetto in ordine; GitHub in guasto (githubstatus: Actions, Pull Requests, Webhooks rossi).
2. Due foto di githubstatus (ancora gialli/rossi) → aspettato.
3. «verdi» → mandate le 2 immagini demo, chiesta la scelta delle prove.
4. «2» (prove brevi, già fatte in #29) → pubblicata la v45.
5. «metti la regola sempre in ogni progetto, quando mi mandi un link deve essere sempre cliccabile e copiabile» → regola in `CLAUDE.md` + testo da incollare nelle preferenze dell'account (https://claude.ai/settings/general). Non ha ancora detto se l'ha incollato.
6. «Maurizio ha inviato la richiesta ma non la vedo» → spiegato dove compare + 6 passi di controllo. Non ha risposto sì/no.
7. «mettila piú in vista non nascosta» → D8.
8. «ho problemi pensaci tu in automatico» → nuova sessione impossibile (E12): si continua in #30.

## Fatto in #30
- Avvio: ramo locale vecchio (#12), `merge --ff-only` fallito → rimedio E5 (`git branch -m … scorta-locale-vecchia-12`, `git checkout -b <ramo> origin/<ramo>`).
- **v45 «App dimostrativa» ONLINE**: PR #54 squash (commit `0a3fff1` su main), poi `git merge origin/main` nel ramo + push. Controllato online: `APP_VER=45`, `CACHE` `jona-ordini-v49`, `#demo` mostra «Benvenuto in Jona Ordini», **Entra nella demo** funziona, barra «Dati di esempio» presente.
- `docs/DA-FARE.md`: tolta D7, M20 → «ora», C7 → «ora».
- `CLAUDE.md`: nuova regola «Link cliccabili e copiabili» (vale per ogni progetto): link interi e semplici, mai tra virgolette rovesciate; se va copiato/inoltrato, ripeterlo sotto in un riquadro da copiare. È solo sul ramo: arriva in main con la prossima PR.

## Richiesta di Maurizio non visibile: cosa si sa
- Le richieste di telefono compaiono solo in **Staff → Persone**, in cima, sezione «Telefoni da approvare» (`phPend()`, lista `PH.list` da `phWatch()`, `index.html` ~riga 1731 e ~2988). Profili «in_attesa» in «Da approvare» (~2989).
- `phWatch` parte solo con Firebase pronto e `realU()` gestore; se l'ascolto fallisce riprova dopo 5 minuti e la lista resta vuota (`PH.retry`).
- Nascosta se: sotto-scheda **Orari**, barra Test su «Staff» (niente scheda Staff), app vecchia/aperta da tanto. C'è già un toast «X chiede di entrare» che sparisce subito.
- Non verificato se Maurizio ha davvero mandato la richiesta (potrebbe aver aperto `#demo`, o essere entrato con invito → già attivo). Chiedere a Mario l'esito dei 6 passi se serve.

## Da fare in #31 (subito): D8 «richieste ben in vista»
Proposta (fare una domanda per volta, con immagine prima/dopo):
- Riquadro fisso in cima alla **Home** dei gestori (e dello sviluppatore con qualunque vista gestore): «🔔 Maurizio chiede di entrare» con **Approva** / **Rifiuta**, uguale a quello di Staff (`phOk`/`phNo`, `sok`/`sno`).
- Pallino col numero sulla scheda **Staff** della barra in basso.
- Toast più lungo / avviso nella campanella con link alla scheda Staff → Persone (imposta `S.staffSub='persone'`).
- Prova nuova (es. `tools/test-richieste.mjs` o estendere una esistente) che controlli il riquadro in Home. Poi `APP_VER=46`, NEWS v46, `CACHE` v50, scelta prove (1/2/3), PR, squash, controllo online, merge main nel ramo.
- Intanto aiutare Mario ad approvare Maurizio (M1) appena lo vede.

## Prossimi passi (dopo)
1. Chiedere a Mario se ha incollato la regola dei link nelle preferenze dell'account.
2. M20: Mario prova `https://jona-ristorante-by-ynoy-corp.pages.dev/#demo` e lo manda a Chiara/consulenti/proprietari.
3. C7: riga «“Oggi si ordina” arriva a» più chiara (immagine prima/dopo), giro completo v42-v46 (chiedere «Lo faccio partire ora o dopo?»), avvisi agenda dal Worker, poi `docs/PIANO-INVERNO.md`.

## Rischi aperti
- Il ramo locale delle sessioni nuove parte spesso vecchio: rimedio E5.
- GitHub ha avuto guasti oggi (E11): se push/PR falliscono, far guardare https://www.githubstatus.com
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (E10).
- Elenco completo: `docs/DA-FARE.md`. Errori: `docs/ERRORI.md`.
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
