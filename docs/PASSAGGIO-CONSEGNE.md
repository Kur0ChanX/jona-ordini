# Passaggio di consegne (2026-10-14, fine sessione #135)

Sessione attuale: #136

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v112 online**. **v113 + v114 + v115 nella PR #124** (https://github.com/Kur0ChanX/jona-ordini/pull/124, pronta, non in bozza). Il giro `prove` della v113+v114 (partito 15:13 UTC dopo il push della scorta chiesto dall'hook) era ancora in corso alla chiusura; **il push delle consegne di questo handoff (con la v115, commit `08943d4`) lo fa ripartire** (E39 violata per forza dall'handoff, come in #134): copre tutte e tre le versioni. **Prima cosa: guardare UNA volta lo stato** (`pull_request_read` `get_check_runs`, E54; in corso → aspettare l'evento della PR o ≥15 min dal push, niente push intanto). Verde → squash merge (`commit_message` corto, `expectedHeadSha`), controllo online `APP_VER=115` su https://jona-ristorante-by-ynoy-corp.pages.dev/, poi `git fetch origin main && git merge origin/main` sul ramo e push normale. Rosso → leggere il log (`get_job_logs` con `failed_only`), capire, correggere, prove in locale, un solo push.
- L'iscrizione alla PR #124 era della #135: la #136 deve iscriversi di nuovo (`subscribe_pr_activity`) o controllare da sé.
- Nessuna sveglia attiva. Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Limite: `five_hour` allowed. Motore `claude-fable-5-1`. `get_session` non dà `effort_level` in questo ambiente: `.claude/settings.json` resta `medium` (se Mario vuole Extra lo dice).
- Emulatore Firebase e server 8765 vanno riaccesi nella sessione nuova (`tools/README.md`).

## Fatto in #135 (14/10, 17:11 → 17:40 ora italiana)
- Scorta unita e pushata; consegne di #134 (domanda di Mario sulla memoria delle foto) unite nel ramo.
- Prove della v114 rimaste a metà in #134, rifatte dall'aiutante `collaudo`: `test-foto-vino`, `test-moduli`, `test-news`, `test-firebase-approva-arrivi`, `test-giro` **tutte verdi** (viste Apple SALTATE in locale, come sempre).
- **M45** scritta in `docs/DA-FARE.md` (tabella 🔴 + parte 3): regole Firestore con `coda` da pubblicare a mano. **Da chiedere a Mario con i passi** (E6: https://console.firebase.google.com/ → progetto → menù a sinistra → icona **Firestore Database** → scheda **Regole** → incolla tutto `firebase/firestore.rules` → **Pubblica**). Senza, la coda delle bolle e dei listini funziona solo nel telefono che ha scattato.
- **v115 «Foto dei listini: scatta e basta» (D54 c)**, commit `08943d4`, dettagli tecnici nella riga v115 di `.claude/rules/struttura.md`: «Trascrivi con Gemini» → `codaListino` (una voce `tipo:'listino'` per foto, gruppo `grp`), testo letto nel documento della voce, gruppo completo → risultato `coda/<grp>` (`tipo:'ris'`, creato una volta sola con `runTransaction`), avviso `listino` ai gestori con prezzi aumentati / conti che non tornano / senza fornitore / prodotti nuovi / foto illeggibili; striscia «Listino … letto» in Fornitori (`codaRisCta`, ✕ «Togli») → «Controlla e salva» (`S.rev.grp`, tolto al salvataggio); foglio «Importa listino» con lo stato della coda (`codaListStatoH`) e apertura automatica del controllo al gestore (`codaRisArrivo`). `gemRun` resta solo per `test-fatture`. `APP_VER` 115, `CACHE` v119, NEWS v115 (v95 spostata in `data/news.json`, E55). `impRighe` = righe dell'import, riusata dall'avviso.
- Prove v115: `test-coda` parte 4 nuova (2 foto unite, avviso, salvataggio, Gemini di A spento → legge B, striscia, Togli): **verde da sola** (tutti i PASS nel giro a mano), poi nel giro in sequenza 4 FAIL di soli tempi (emulatore lento: lucchetto scaduto, cancellazione del risultato, Togli) → controlli resi `fino(...)` con attese più lunghe (`fino` ora accetta un argomento), **da rifare una volta in locale** (`node tools/test-coda.mjs` con l'emulatore pulito) se il giro su GitHub è rosso lì. `test-bolla`, `test-fatture`, `test-moduli`, `test-news` verdi; `test-giro` era ancora in corso alla chiusura (log in `/tmp/claude-0/.../scratchpad/prove/v115-giro.log` di questa sessione, non più leggibile: rifarlo se serve).
- Scelte: lettura dal vivo (`gemRun`) tolta dal pulsante perché Mario vuole «scatta e basta» anche per i listini; risultato in un documento separato `coda/<grp>` (le voci con la foto stanno sotto 1 MB una per foto; il testo è piccolo); il foglio «Prezzi aumentati» dopo il salvataggio resta com'era (la prova lo chiude).

## ✅ PROSSIMI PASSI (#136, continuare da sola)
1. **PR #124 (v113+v114+v115)**: stato una volta, poi merge e messa online come in «Stato». Se `test-coda` è rosso su GitHub: rilanciarlo in locale con l'emulatore pulito; se è solo lento, alzare le attese; mai spegnerlo.
2. **M45 a Mario** (passi sopra, con il doppio tocco «fatto?» solo se serve). Dopo la v115 online: chiedergli di provare una bolla vera e una foto di listino, «si legge bene?» e quanti secondi.
3. **Idea D55 da proporre a tocco** (da #134, dopo la domanda di Mario «non occupa Memoria…?»): pulizia automatica delle foto piccole dei controlli merce vecchi (es. 60 giorni, `ricezione.foto`). Strade: ovvia (cancella dopo N giorni), furba (tiene solo l'ultima per fornitore), geniale (foto nel Worker/D1 come gli allegati della chat, con pulizia). Scriverla in DA-FARE se la vuole.
4. **D54 (d) letture sicure** (Mario: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»): righe lette < 80% dell'ordine o troppi `rigaNonTorna` → seconda lettura con l'altro lettore e confronto; righe diverse → «da controllare a mano». Prova con foto vere di Mario (E22). (v116)
5. M44: quando Mario dice i secondi di «cannonau» (v112).
6. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-fable-5-1`.
- Sessioni Jona: #135 `session_01KMqiXFg3AuXsP1WJ9tHVHf` (chiusa, depth 1), #134 `session_01SHG9zZeuWRfEHzR2eRLgHg`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (Java c'è). Foto da Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs`.

## Consumo #135
`get_session` senza campo `usage` in questo ambiente: non misurabile (l'hook stimava ~227k alla chiusura; aiutante `collaudo` ~26k).

## Ultimo messaggio di Mario, parola per parola
(#134, arrivato dopo l'handoff, ~17:15): «non occupa Memoria nel cellulare e nell'app tutte le bolle listini ecc salvate in questo  modo?» — la #134 ha risposto: no (foto nel telefono e sul cloud solo finché non è letta, poi cancellata; restano il testo letto e la foto piccola del controllo merce ~200-300 KB come da v77; listini: nessuna foto salvata).
Prima (#134, schede a tocco): «3 Geniale (consigliata)» · «Sì, confermo la strada scelta»; scritto a mano: «se non c'è nessuna app aperta la salva ugualmente che non ho capito bene il sistema geniale».
Prima (#133): «Penso la 3 però ci mette già un minuto a caricarla possiamo fare di meglio? o soluzioni grauite migliori comunque penso la 3 voglio un sistema super stabile e che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli
aggiungo non deve mai bloccarsi anche quando non c'è connessione quando la riaggancia la manda cosí uno non stà a guardare il telefono fino a quando non la carica che perde tempo questa regola anche su carica listino e controllo consegna ecc». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
