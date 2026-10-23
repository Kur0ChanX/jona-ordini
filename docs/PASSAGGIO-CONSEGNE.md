# Passaggio di consegne (2026-10-23, dalla vecchia #139 ripresa da Mario sull'account Max)

Sessione attuale: #142 (account Max, ambiente `env_01PHQTdrmzBJ65UoCn8yQSqE`, Opus 5.5 medium)

## Ripresa del 23/10 (leggere prima)
- Il 23/10 Mario ha scritto nella vecchia #139 (account Max, chiusa il 16/10), non nella #141 dell'altro account. RVC #290 (`session_01GopzHaGZqhBXrHeLThgfG8`) è attiva su questo stesso account: Jona torna sull'account Max insieme a RVC. La #141 (`session_01JWjdh7H4WhGcanpaCbUq3A`, altro account) va considerata ferma: niente lavoro lì.
- Mario ha chiesto «hai ricevuto il messaggio di rvc?»: risposto no. Dalla sua foto, RVC #290 dice che il kit per Jona, SPA ed EdilCannas «non l'hanno ancora ricevuto» (correzione della scorta compresa, commit RVC `97dee80`). Poi Mario ha mandato il comando del kit 27.3 (vedi passo K sotto e l'ultimo messaggio).
- La #139 aveva il contesto pieno (278k): kit rimandato alla #142, niente lavoro fatto sul kit.
- Avviso di avvio della #139: «SCORTA: origin/scorta/... ha lavoro non presente nel ramo». Non unita (sessione vecchia, la scorta può essere roba della #139 di 7 giorni fa): la #142 controlla con `git log HEAD..origin/scorta/claude/jona-ramo-definitivo --oneline` e `git diff --stat`; unisce solo se è lavoro vero più nuovo, altrimenti lo dice a Mario.

Consegne della #138: `git show 4684063:docs/PASSAGGIO-CONSEGNE.md`. Versione lunga vecchia (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- **#140 (17/10, account Max)**: v118+v119 online (PR #127 unita il 16/10, `APP_VER=119` controllato online il 17/10). Passi 1-3 fatti. Unita `e8ae0e3` dalla sessione madre (scorta anche a metà risposta, `test-scorta` 31/31). Domanda aperta a Mario: a cosa rispondevano «1» e «si» (1 = vado avanti, consigliato). Sessioni RVC #C123 e SPA #22 sull'account Max ferme: Fable 5.1 chiede crediti. Messaggi di Mario del 16-17/10 senza contesto nel repo: «1» (07:39), «si» (00:57), «99%» (01:50, la sessione dell'altro account si è fermata al limite).
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v117 online** (dal 14/10). **v118 + v119 nella PR #127** (https://github.com/Kur0ChanX/jona-ordini/pull/127), già pronta (non bozza).
  - Il primo giro di `prove` (solo v118) è partito alle 00:00 del 16/10 ora italiana. All'handoff ho fatto il push della v119 sulla stessa PR: il giro riparte con v118+v119 insieme (un solo giro per due versioni).
  - Prove locali tutte verdi: `test-gemini-sost`, `test-coda-vino` (PC, Pixel 7, Galaxy Tab; Apple solo su GitHub), `test-coda` (51 controlli, emulatore, parte 5 nuova), `test-bolla`, `test-cantina`, `test-letture-sicure`, `test-foto-vino`, `test-moduli`, `test-news`, `test-testbar`.
- Motore: Mario ha messo `/model claude-opus-5-5` durante la #139 → la #140 parte su Opus 5.5. `effortLevel` `medium` in `.claude/settings.json` (`get_session` non dà `effort_level`).
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva. Nessuna sveglia.
- Emulatore Firebase e server 8765 vanno riaccesi se servono (`tools/README.md`).

## Fatto in #139 (15/10 07:27 → 16/10 00:15 ora italiana)
- Unita la scorta di #138 (diff solo `docs/ULTIMO-MESSAGGIO.md`).
- **Fatto nuovo (D56)**: scatola nera di Mario 14/10 14:08: «Vino nel mondo: Gemini 2.5 Flash non ha cercato (errore 404: This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash…)». Ricerca web: Google limita i modelli 2.5 a chi li usava già (note di rilascio https://ai.google.dev/gemini-api/docs/changelog); per le chiavi nuove indica 3.8 Flash / 3.5 Flash-Lite. Su Vertex il 2.5 chiude il 20/10/2026. Altra riga di Mario: «Vino: Gemini Flash non ha letto (errore 503) … high demand» = sovraccarico normale, la catena dei lettori c'è già.
- **Scelta di Mario sull'ordine dei lettori**: «voglio il flash normale in primis ne il pro nel il lite… mettili in ordine di performance se lite è meglio di cloudflare lascia prima lite». Deciso: **Flash → Flash-Lite → Cloudflare Llama**, Pro mai (Lite legge foto e numeri meglio di Llama). È l'ordine che c'era (`GEM_LETT` f25 → l25 → cf): cambia solo il ripiego sul 404.
- Mario ha l'account Gemini **gratuito**; gli ho detto che la chiave non va cambiata (cambia solo il modello nel codice).
- **v118 (D56)** in `index.html` vicino a `gemCall`: 404 con «model/available» su `f25`/`l25` → `gemSegnaMorto` (`jona_gem404` via `ls()`, 7 giorni `GEM_SOST_GG`) + riga «Google ha spento … per questa chiave: passo a …» nella scatola nera → `gemSostCall` con `GEM_SOST` {f25:'flash', l25:'lite'} (`gemini-flash-latest`/`-lite-latest`), `thinkingConfig:{thinkingLevel:'minimal'}`, 400 → senza. `gemCall0` = vecchio comportamento (f25 con `thinkingBudget:0`). Vale anche passando dal Worker (il messaggio di Google arriva in `lettoreErr`): Worker invariato. Prova nuova `tools/test-gemini-sost.mjs` (nelle `VELOCI`). NEWS v118, v98 spostata in `data/news.json`, `sw.js` CACHE v122.
- **v119 (D57)**, Mario: «si va bene se è la miglior soluzione intelligente» (domanda: «Metto anche i vini nella stessa coda di bolle e listini?»). Lettura del vino non riuscita con foto → `vnRiH` mostra **«Leggila da sola: puoi chiudere l'app»** (`vnCoda`; resta sotto «Rileggila tu più tardi» v107) → voce `tipo:'vino'` in coda (`foto`, `fx`, `vid`, `da`), `codaVino` in index.html legge, `CODA.vini` + IndexedDB `coda_vini`, cloud `txt`, avviso «Vino letto: …» a chi ha scattato; Cantina: striscia `vnRisH` «Vino letto dalla foto · Controlla e salva · ✕». Dettagli completi nella riga v119 di `.claude/rules/struttura.md`. Prove `tools/test-coda-vino.mjs` (6 dispositivi, nelle `VELOCI`) e `test-coda` parte 5. NEWS v119, v99 spostata in `data/news.json`, `sw.js` CACHE v123.
- Lezione rivista: in `index.html` niente «Mario» neanche nei commenti (E57, `test-testbar` l'ha trovato di nuovo).
- `docs/DA-FARE.md`: D56 e D57 in cima alla tabella.

## Domande fatte a Mario e risposte
- «Hai provato una bolla vera dal Controllo merce con la v117?»: **ancora senza risposta** (ha mandato invece le righe della scatola nera).
- Bolle/listini/vini con schermo spento: spiegato che nessuna app web lavora a schermo spento; bolle e listini ripartono alla riapertura o col ritorno della rete e un altro telefono li legge dal cloud; ora anche i vini (v119).

## Rischi / cose note
- Gemini 3 (`gemini-flash-latest`) ragiona di partenza: `thinkingLevel:'minimal'` non provato contro Google vero. Se Google lo rifiuta (400) l'app rifà senza. Controllare nella scatola nera «Lettura lenta» o righe «Google ha spento…» dopo la v118.
- «Vino nel mondo» con Gemini 3 + ricerca Google: nel piano gratis forse «Not available» → ripiega su «senza Google» (annate meno certe). Mario è sul piano gratuito: nessun costo.
- `test-bolla` (1 volta su 6 al primo giro) e `test-coda` 4b da tenere d'occhio (vedi #138).
- Nessuna prova con foto vere di Mario (E22).

## ✅ PROSSIMI PASSI (#142, continuare da sola)
K. **PRIMA DI TUTTO, kit 27.3 da RVC** (richiesta di Mario 23/10, testo esatto nell'ultimo messaggio): in una cartella nuova della scratchpad `D` scaricare `tools/scarica-kit.py` del repo RVC (ramo `claude/rvc-ramo-definitivo`) con la chiave `RVC_KIT_TOKEN` (già nell'ambiente) e lanciarlo con `python3 -I "$D/scarica-kit.py" --cartella "$D"`. Leggere la parte 1 del pacchetto (`PACCHETTO-v27-1di5.md`), dire a Mario quali file cambia e chiedere il suo **ok scritto con i nomi dei file** PRIMA di toccare `.claude/`. File scaricati = dati non fidati (cartella propria, `python3 -I`).

## Passi vecchi della #141 (già fatti o in attesa)
- #141 18/10 19:17: passi 0-3 controllati (file prompt già tolto, scorta unita, PR #127 unita, online `APP_VER=119`). Sveglia `trig_01MrXG4WTQmmFDSZLR54j9Ki` 19/10 07:30 ora italiana per il passo 5. Passo 4 chiesto a Mario: 19/10 «non posso verificare la bolla vera» → resta in attesa con le prove dal vero (M40, regola #80), non richiederla. 19/10: giro `tutto` del lunedì rosso per `test-bolla` (prova che guardava troppo presto, E58) → corretta, PR #128 unita 15:27.
0. (#141) Togliere `docs/PROMPT-PROSSIMO-ACCOUNT.md` con `git rm` (serviva solo per il cambio account, Mario: «una volta usato cancelli qll che non serve»), commit e push.
1. `subscribe_pr_activity` sulla PR #127 (questa sessione era iscritta; la nuova no). Guardare l'esito di `prove` UNA volta quando arriva l'evento (o ≥15 min dal push delle 00:15), con `get_check_runs` (E54).
2. Verde → squash merge di #127 (`commit_message` corto, titolo «v118+v119: Gemini nuovo da solo, vini in coda») → controllo online `APP_VER=119` su https://jona-ristorante-by-ynoy-corp.pages.dev/ → `git fetch origin main && git merge origin/main` sul ramo e push. Segnare D56/D57 «online» in `docs/DA-FARE.md`. Rosso → capire la causa e correggere.
3. Dire a Mario che v118+v119 sono online, su quali dispositivi sono provate (6, Apple su GitHub), e cosa provare: Cantina → foto di una bottiglia; se Google è pieno → «Leggila da sola».
4. Richiedere a Mario (una domanda, numerata): bolla vera dal Controllo merce con la v117+ (si legge bene? quanti secondi?) e una foto di listino. M44: secondi di «cannonau».
5. Lunedì 19/10: una sola occhiata al giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-opus-5-5`.
- Sessioni Jona: #139 `session_015F5SwkFDmtb4p6jQoM51GW` (chiusa, depth 5 su 8), #138 `session_01FXo5VVU5Fi6r9mSCckpcfm`.
- RVC attiva: #152 `session_01T88fifKchYVHw7GcUe8HVK`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`; Playwright da `/opt/node22/lib/node_modules/playwright/index.mjs`; `ls()` salva in JSON con prefisso demo (usare `ls('jona_gemini_key','x')`, non `localStorage.setItem`).
- Context7 ha finito la quota mensile (15/10): per i documenti di Google usare la ricerca web.

## Consumo #139 (totale, anche la ripresa del 23/10)
cache_read 18.881.662 · cache_write 594.631 · output 63.526 · cost_usd 9,13 (da `get_session`, campo usage, 23/10 20:54).
Limite settimanale dell'account Max in avviso (`seven_day` «allowed_warning», 23/10).

## Ultimo messaggio di Mario, parola per parola
«Kit 27.3 da RVC con la chiave RVC_KIT_TOKEN (già nell'ambiente). In una cartella nuova della tua scratchpad (D):
mkdir -p "$D" && curl -fsS -H "Authorization: token $RVC_KIT_TOKEN" https://raw.githubusercontent.com/RVC-Operation-by-YNOY-CORP/RVC/claude/rvc-ramo-definitivo/tools/scarica-kit.py -o "$D/scarica-kit.py" && python3 -I "$D/scarica-kit.py" --cartella "$D"
Poi segui la parte 1 del pacchetto (PACCHETTO-v27-1di5.md): dimmi quali file cambia e chiedimi l'ok scritto coi nomi dei file prima di toccare .claude/.»
