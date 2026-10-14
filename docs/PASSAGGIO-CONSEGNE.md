# Passaggio di consegne (2026-10-14, fine sessione #136)

Sessione attuale: #137

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v112 online**. **v113 + v114 + v115 nella PR #124** (https://github.com/Kur0ChanX/jona-ordini/pull/124, pronta, non in bozza).
- Giro `prove` sul commit `c567a86` (le correzioni della #136) partito 17:24 UTC (19:24 ora italiana), **in corso alla chiusura** (run 38606359301). Il push di queste consegne (solo documenti) lo fa ripartire: va bene, copre lo stesso codice.
- **Prima cosa**: guardare UNA volta lo stato (`pull_request_read` `get_check_runs`, E54; in corso → aspettare l'evento o ≥15 min dal push, niente push intanto). Verde → squash merge (`commit_message` corto, `expectedHeadSha`), controllo online `APP_VER=115` su https://jona-ristorante-by-ynoy-corp.pages.dev/, poi `git fetch origin main && git merge origin/main` sul ramo e push normale. Rosso → `get_job_logs` del job con `tail_lines` ~80 (le righe `1 test-…` e `FAIL …` sono in fondo), capire, correggere, un solo push.
- L'iscrizione alla PR #124 era della #136: la #137 deve iscriversi di nuovo (`subscribe_pr_activity`).
- Sveglia `trig_01DyLbjbHP6rpHL3VdapKVx8` (Controllo PR #124) già scattata: nessuna sveglia attiva. Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Motore: Mario ha cambiato a mano durante la #136 (`/model`) prima a `claude-sonnet-5-5`, poi a **`claude-opus-5-5`** (ultimo). Nuova sessione con `claude-opus-5-5`. `.claude/settings.json` `effortLevel` resta `medium` (`get_session` non dà `effort_level`; sullo schermo di Mario «Opus 5.5 Medio»).
- Emulatore Firebase e server 8765 vanno riaccesi nella sessione nuova (`tools/README.md`).

## Fatto in #136 (14/10, 17:37 → 19:30 ora italiana)
- Scorta unita due volte e pushata.
- **M45 FATTA**: Mario ha pubblicato le regole di Firestore (con `coda`) alle ~17:58 («fatto incollate e inviate»). Segnata in `docs/DA-FARE.md`. Guida usata (per la prossima volta, telefono): https://console.firebase.google.com/ → progetto → menù a sinistra **Firestore Database** → scheda **Regole** (su telefono: barra delle schede scorribile) → il testo si modifica solo con Chrome in **Sito desktop** (il pulsante **Sviluppa e testa** è solo una guida, non apre l'editor) → incolla da https://raw.githubusercontent.com/Kur0ChanX/jona-ordini/claude/jona-ramo-definitivo/firebase/firestore.rules → **Pubblica**. Da aggiungere come lezione in `docs/ERRORI.md` (E6) se torna utile.
- **CI rosso della PR #124** (giro sul commit `dafefee`): due prove.
  1. `test-testbar`: un commento in `index.html` (riga ~3198, «v113 (Mario #132: …») conteneva il nome del creatore → cambiato in «v113 (richiesta: …». Regola: niente «Mario» neanche nei commenti di `index.html` (la prova legge tutto il file tranne i commenti `/* */`).
  2. `test-coda` (parte 4, listini v115): **difetto vero**, non lentezza. Sul codice originale falliva 4 giri su 5 in locale. Cause trovate con messaggi di diagnosi:
     - Dopo «Salva»/«Togli» il risultato `coda/<grp>` veniva cancellato; un telefono in ritardo (con pezzi letti vecchi o una `runTransaction` ancora in corso) lo ricreava → striscia «Listino letto» che torna e avviso doppio ai gestori.
     - Correzioni in `index.html`: (a) `codaRisVia` non cancella più: segna il documento `st:'tolto'`, `fatto:now()` (testo svuotato) con `set(...,{merge:true})`; `codaRisList` ignora i «tolto»; `codaRaccogli` cancella i «tolto» dopo `CODA_T.vecchie` (7 giorni). (b) `codaGruppo`: se la transazione la vince un altro telefono (`mio` falso), non rimette il risultato in `CODA.ris` né in `CODA.cloud` (arriva dal cloud). (c) `codaGruppi`: i pezzi letti da questo telefono escono da `CODA.ris` appena il risultato del gruppo è sul cloud. (d) `codaFlush` nel `finally` chiama `codaRaccogli()`: una voce «fatta» da un altro telefono mentre questa era occupata esce subito (prima aspettava il giro di 60 s → «B: coda vuota» falliva a caso, anche sul codice originale).
     - `tools/test-coda.mjs`: attese più lunghe (30 s) sui controlli dopo il salvataggio, «Togli», «B coda vuota»; `fino` prima di contare gli avvisi (listino e bolla `test_o2`); il controllo del cloud ora accetta il risultato «tolto» (nuovo testo: «cloud: risultato segnato «tolto» (nessun telefono lo rifà)»); al fallimento di «Togli» stampa lo stato (ris, cloud, docs, strisce).
     - Esito: **5 giri su 5 verdi** in locale (46 PASS). Verdi anche `test-testbar`, `test-bolla`, `test-fatture`.
  - Nessun cambio di versione: è tutto dentro la v115 non ancora online (la riga v115 di `.claude/rules/struttura.md` non dice ancora del segno «tolto»: aggiungerlo in una riga quando si tocca il file).
  - Lezione da scrivere in `docs/ERRORI.md` (sezione Prove): «Una prova che fallisce a caso con tempi lunghi: prima di alzare le attese, confrontare 5 giri sul codice originale e mettere messaggi di diagnosi; in `test-coda` era un difetto vero (risultato ricreato da un telefono in ritardo)». Da fare nella #137 (non fatto per l'handoff).
- **Messaggio da RVC #146** (`session_01CrJcNRSfSAvyyKUhNEaD4z`): chiedeva il metodo dei «Cocktail più belli · prova». Risposto con send_message: niente skill, metodo in `tools/bozze/cocktail-bellissimi.mjs` (SVG a mano, sfumature di luce sul vetro, ombra radiale, ghiaccio con riflesso, frutta dentro il bicchiere, niente linee nere, acquerello con feTurbulence, foto da telefono a confronto prima di toccare l'app).
- Domande di Mario sui disegni (risposte date, nessun lavoro aperto): perché i cocktail «prova» sono molto meglio di quelli vecchi (terza foto: contorni neri spessi, script automatico per 212 cocktail) → spiegato il metodo; poi «per un altro progetto come faccio a dirgli di disegnare meglio» → dato un testo pronto da incollare all'altro progetto, con l'esempio `tools/bozze/cocktail-bellissimi.mjs`. Idea D48 (tutti i 212 così) resta rimandata da Mario.

## ✅ PROSSIMI PASSI (#137, continuare da sola)
1. **PR #124 (v113+v114+v115)**: stato una volta, poi merge e messa online come in «Stato». Se rosso: log, causa, correzione, prove in locale (per `test-coda` più giri con l'emulatore svuotato tra un giro e l'altro: due `curl -X DELETE` su `localhost:8080/emulator/v1/projects/demo-jona/databases/(default)/documents` e `localhost:9099/emulator/v1/projects/demo-jona/accounts`, con l'indirizzo tra virgolette).
2. Scrivere la lezione di `test-coda` in `docs/ERRORI.md` + `docs/ERRORI-STORIA.md`, e la riga sul segno «tolto» in `.claude/rules/struttura.md` (v115). Commit insieme al merge di main.
3. Dopo la v115 online: chiedere a Mario di provare una bolla vera e una foto di listino, «si legge bene?» e quanti secondi.
4. **Idea D55 da proporre a tocco** (da #134): pulizia automatica delle foto piccole dei controlli merce vecchi (es. 60 giorni, `ricezione.foto`). Strade: ovvia (cancella dopo N giorni), furba (tiene solo l'ultima per fornitore), geniale (foto nel Worker/D1 come gli allegati della chat, con pulizia). Scriverla in DA-FARE se la vuole.
5. **D54 (d) letture sicure** (Mario: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»): righe lette < 80% dell'ordine o troppi `rigaNonTorna` → seconda lettura con l'altro lettore e confronto; righe diverse → «da controllare a mano». Prova con foto vere di Mario (E22). (v116)
6. M44: quando Mario dice i secondi di «cannonau» (v112).
7. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-opus-5-5`.
- Sessioni Jona: #136 `session_01QVGvVgjREzxgz8wssjrW5s` (chiusa, depth 2), #135 `session_01KMqiXFg3AuXsP1WJ9tHVHf`.
- RVC attiva: #146 `session_01CrJcNRSfSAvyyKUhNEaD4z`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (Java c'è). Foto da Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs`.

## Consumo #136
cache_read 14.407.038 · cache_write 444.935 · output 39.724 · cost_usd 5,39 (da `get_session`, campo usage, alle 19:30).

## Ultimo messaggio di Mario, parola per parola
(19:3x) «per un altro progetto come faccio a dirgli di disegnare meglio mi fà vettoriali basic senza dettagli» — risposto con il testo pronto da incollare (vedi sopra).
Prima: «come avevi fatto a fare un salto cosí evidente e migliore tra questi 2 che medoto avevi usato per fare i fettagli in questo modo da padsare a vettoriale a fatto a mano da un grafico prima li facevi cosí guarda la terza foto / che sistema hai usato per farli dopo cosí bene rispetto a prima» (3 foto: Negroni e Spritz/Mojito «Cocktail più belli · prova», French 75 vecchio stile).
Prima: «fatto incollate e inviate» (M45).
