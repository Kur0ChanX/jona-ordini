# Passaggio di consegne (2026-10-14, fine sessione #134)

Sessione attuale: #135

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v112 online**. **v113 + v114 nella PR #124** (https://github.com/Kur0ChanX/jona-ordini/pull/124, pronta, non in bozza). La #134 ha pushato la v114 (commit `6811299` + consegne) mentre girava il giro `prove` della v113 (partito 14:49 UTC dopo l'unione della scorta, che l'hook ha chiesto di pushare: E39 violata per forza dall'handoff): il push fa ripartire UN giro che copre tutte e due. **Prima cosa da fare: guardare UNA volta lo stato** (`pull_request_read` `get_check_runs`, E54; se è ancora in corso, aspettare l'evento della PR o ≥15 min, E39: niente push intanto). Verde → squash merge (`commit_message` corto, `expectedHeadSha`), controllo online `APP_VER=114` su https://jona-ristorante-by-ynoy-corp.pages.dev/, poi `git fetch origin main && git merge origin/main` sul ramo e push normale. Rosso → capire la causa, correggere, prove in locale, un solo push.
- L'iscrizione alla PR #124 era della #134: la #135 deve iscriversi di nuovo (`subscribe_pr_activity`) o controllare da sé.
- Nessuna modifica pendente dopo il commit delle consegne. Nessuna sveglia attiva. Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Limite: `five_hour` allowed. Motore `claude-fable-5-1`. Impegno letto da `get_session` alla chiusura: `medium` (scritto in `.claude/settings.json`; prima era `high`: se Mario vuole Extra lo dice).
- Emulatore Firebase e server 8765 vanno riaccesi nella sessione nuova (`tools/README.md`).

## Fatto in #134 (14/10, 16:48 → 17:15 ora italiana)
- Scorta unita e pushata (`docs/ULTIMO-MESSAGGIO.md`, messaggio #132 di Mario: bolla in background, Gemini Flash non Lite, niente Gemini 3, discrepanze a Maurizio anche per DDT/bolle/fatture del listino).
- **Scelta D54 confermata da Mario con il doppio tocco: strada 3 «Geniale»**. Alla prima domanda ha chiesto «se non c'è nessuna app aperta la salva ugualmente?»: risposto (foto salvata SUBITO nel telefono, poi in coda sul cloud; se nessuna app è aperta la coda aspetta il primo telefono che apre l'app, anche lo stesso; su iPhone il background vero non esiste) e domanda rifatta → «3 Geniale» + «Sì, confermo».
- **v114 «Bolla di consegna: scatta e basta»** (commit `6811299`, dettagli tecnici nella riga v114 di `.claude/rules/struttura.md`): `setBolla` mette la foto in coda (`codaFoto` ≤1600 px, base64 sotto 900 KB; mini 1200 px per il foglio/`ricezione.foto`), `CODA` in IndexedDB `jona-kv` (`coda_q`) + Firestore `coda/<id>` (regola aggiunta in `firebase/firestore.rules`: **da pubblicare su Firebase a mano da Mario? NO: le regole le pubblica Mario incollandole, come M18. Senza la regola nuova la coda sul cloud fallisce in silenzio e resta locale → M45 sotto**). Lucchetto con `runTransaction` (`jona_dev`), lettura `codaLeggi` con `GEM_LETT`, `codaApplica` → `ordini.bolla` (o `ricezione.bolla` + `prezziDiversi`) + avviso `tipo:'bolla'` ai `gm` (prezzi diversi, ordinati non sulla bolla, quantità minore, non ordinati, conti che non tornano). Ritentativi 2 min × 5 poi ogni 10 min, mai arrendersi; 2 letture senza righe → avviso «foto non leggibile» a chi ha scattato e ai gestori. Altri telefoni: `codaWatch`/`codaRaccogli` (20 s di vantaggio a chi ha scattato, lucchetto scade dopo 150 s). Foglio del controllo: niente più pulsante «Confronta»: stato `codaStatoH` (Riprovo tra m:ss / Manca la rete / Riprova adesso), `bolInR` precompila solo le righe non toccate, `live` quando arriva la lettura; «È arrivato tutto» salva lo stesso la bolla letta. Arrivi: etichette «bolla in coda»/«bolla letta». `idbKv` spostata da `moduli/cantina.js` a index.html. `APP_VER` 114, `CACHE` v118, NEWS v114 (v94 spostata in `data/news.json`, E55).
- Prove: `tools/test-bolla.mjs` riscritta per la coda (34/34: Gemini guasto → coda, IndexedDB, riapertura della pagina → lettura da sola, avviso «4 cose da vedere», Togli, 400 → senza thinkingConfig); **`tools/test-coda.mjs` nuova** con l'emulatore (B fotografa con Gemini guasto e legge A, B senza rete → parte al ritorno della rete, ordine già controllato → `ricezione.bolla`, lucchetto fresco rispettato / scaduto preso), tutte verdi; aggiunta alle `VELOCI` di `tools/prova-ci.sh` e a `tools/README.md`. `test-cantina` verde. **Erano ancora in corso alla chiusura (da rifare in #135): `test-foto-vino`, `test-moduli`, `test-news`, `test-firebase-approva-arrivi`, `test-giro`** (la PR su GitHub li copre comunque con `veloce`).
- `docs/DA-FARE.md`: D54 aggiornata (tabella + parte 2: restano c e d).
- Scelte scartate: leggere la bolla dentro `sw.js` con Background Sync (su iPhone non esiste, su Android a tratti); tenere il pulsante «Confronta» (Mario: «scannerizzare e il programma la deve caricare»); foto nel documento `ordini` (doppione da 300 KB: resta solo `ricezione.foto` del telefono che ha scattato, chi conferma da un altro telefono non ha la foto).

## ✅ PROSSIMI PASSI (#135, continuare da sola)
1. **PR #124 (v113+v114)**: stato una volta, poi merge e messa online come in «Stato». Rifare in locale le 5 prove rimaste a metà (sopra) prima del merge se il giro su GitHub non è ancora finito.
2. **M45 (Mario a mano, bloccante per la coda sul cloud)**: pubblicare le regole nuove di Firestore (`firebase/firestore.rules` con `coda`): guida come M18 (E6: menù a sinistra → icona **Firestore** → scheda **Regole**, incolla, **Pubblica**). Finché non le pubblica, la coda funziona solo nel telefono che ha scattato (nessun errore a video). Scriverla in `docs/DA-FARE.md` parte 3 e chiederla a Mario con i passi.
3. **D54 (c)**: stessa coda per le foto dei listini (Fornitori → Importa listini → foto, `gemRun`/`fotoStage`): voce `tipo:'listino'` con più foto, risultato = righe da rivedere in «Controlla e salva» aperto da un avviso ai gestori con i prezzi cambiati (`rvUps`). Versione piccola e provata (v115).
4. **D54 (d) letture sicure** (Mario: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»): righe lette < 80% dell'ordine o troppi `rigaNonTorna` → seconda lettura con l'altro lettore e confronto; righe diverse → «da controllare a mano». Prova con foto vere di Mario (E22). (v116)
5. Chiedere a Mario, dopo la v114 online, di provare una bolla vera e dire se «si legge bene» e quanti secondi ci mette (prima foto vera: chiedere «si leggono bene?»).
6. M44: quando Mario dice i secondi di «cannonau» (v112).
7. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-fable-5-1`.
- Sessioni Jona: #134 `session_01SHG9zZeuWRfEHzR2eRLgHg` (chiusa, depth 0), #133 `session_0134bRDgcQv5VmLGKerpgq33`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (Java c'è). Foto da Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs`.

## Consumo #134
`get_session` senza campo `usage` in questo ambiente: non misurabile (`context_usage.used_tokens` 101k alla chiusura; l'hook stimava ~286k).

## Ultimo messaggio di Mario, parola per parola
(#134, risposte alle schede a tocco): prima scheda: «3 Geniale (consigliata)» e, alla conferma, scritto a mano: «se non c'è nessuna app aperta la salva ugualmente che non ho capito bene il sistema geniale». Seconda scheda: «3 Geniale (consigliata)» · «Sì, confermo la strada scelta».
Prima (#133): «Penso la 3 però ci mette già un minuto a caricarla possiamo fare di meglio? o soluzioni grauite migliori comunque penso la 3 voglio un sistema super stabile e che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli
aggiungo non deve mai bloccarsi anche quando non c'è connessione quando la riaggancia la manda cosí uno non stà a guardare il telefono fino a quando non la carica che perde tempo questa regola anche su carica listino e controllo consegna ecc». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
