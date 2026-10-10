# Passaggio di consegne (2026-10-10, fine sessione #49)

Sessione attuale: #50

## Ultimo messaggio di Mario (#49), parola per parola
«ho pravato a caricare su dac queste e mi dà questo errore...risolvi in qlk modo»
(con 3 immagini: schermata «Gemini non ha risposto (errore 524). Riprova o usa l'app Gemini.» nell'Importa listino di DAC con 2 foto, e le due fatture DAC)

Messaggi prima (#49), parola per parola:
- «ok»
- «metti in automatico sempre la nuova versione se non ci sono problemi»
- «?»
- «ho la 62 e non aggiorna» → «mandami il link» → screenshot Novità con v62 in cima + «ora»

## File ricevuti (#49)
- `docs/img/listini/dac-fattura-054851-2026-09-01.jpg` (GAMBERO ROSSO "VERITAS" 3 35/50PZ 1KG, cod. 88563, 45,90 €/pz)
- `docs/img/listini/dac-fattura-252792-2026-09-08.jpg` (POLLO COSCE GR 180/220*10 PZ FILENI cod. 37807 4,027 €/kg; POLLO SOVRACOSCIO SP "ORA" 200G cod. 805161 7,842 €/kg)
- `docs/img/segnalazioni/v64-gemini-errore-524.jpg`
Committati sul ramo consegne.

## Stato
- **v64 online** (PR #74, squash `95ca4cb`; nel CI era fallita `test-testbar` per un «Mario» in un commento di `reviewSave`: sostituito con «chi importa»). Online APP_VER=64, CACHE v68. `main` unito nel ramo consegne.
- Regola nuova di Mario: **pubblica sempre in automatico** se le prove sono verdi (scritta in CLAUDE.md). L'auto-merge di GitHub è spento nel repo: non serve, unisco io quando arrivano le prove verdi.
- «Ho la 62»: in realtà Mario era nella vista **Staff** della barra Test; le Novità v63/v64 sono solo `chef`/`dev` (E21). Gli ho detto di passare a Sviluppatore; non ha confermato.
- **v65 nella PR #75** (ramo `claude/v65-gemini-lento`, commit `2d7c93d`, pushato e confermato), «Prove automatiche» partite. NON ancora unita.
- Questa sessione è a **lineage 8**: `send_later` e `create_session` non funzionano → Mario apre a mano la sessione #50 (E12).

## v65: Gemini senza errore 524
Causa: 524 = Cloudflare chiude dopo 100 s; il Worker `/gemini` mandava tutte le foto insieme e, tra modello lento, riprove e attese, superava i 100 s.
- `worker/src/index.js`: `GEM_BUDGET` 85 s, `GEM_TRY_MS` 45 s (sovrascrivibili da `env` per le prove); ogni fetch con `AbortSignal.timeout(min(tryMs, resto))`, anche la lettura (`r.text()`); timeout/errore di rete → modello dopo (Lite); fuori tempo → `geminiErr(...,504)`.
- `index.html`: `gemCall` restituisce anche `st`; messaggio «Gemini ci ha messo troppo a rispondere.» per 502/504/524. `gemRun`: una richiesta per foto, `I.prog` «Gemini legge la foto i di n…», seconda prova dopo `GEM_PAUSA` (3 s) per `GEM_RETRY` 429/502/503/504/524, risultati per foto in `I.gres` (WeakMap: un nuovo tocco legge solo le mancanti), `gemJoin` unisce le tabelle (toglie intestazione ripetuta e ```).
- APP_VER 65, CACHE `jona-ordini-v69`, NEWS v65 (chef + dev correzioni). CLAUDE.md (riga v20 Gemini) aggiornata nel ramo v65.
- Prove: `tools/test-gemini-server.mjs` estesa (8 controlli nuovi), messa in testa a `VELOCI` di `tools/prova-ci.sh`; 3 giri riusciti. Riuscite anche test-news, test-listini-doppi, test-scaglione2, test-testbar, test-giro (TZ=Europe/Rome).
- Decisioni: non toccato il «thinking» di Gemini (parametri diversi tra modelli, rischio 400 senza poter provare con la chiave vera); una foto per richiesta = richieste più corte; risultati parziali tenuti per non rifare le foto già lette.
- Non verificato con il Gemini vero (non ho la chiave): dopo la pubblicazione chiedere a Mario di riprovare le 2 foto DAC.

## Prossimo lavoro (#50), in ordine
1. D19: PR #75. Se «Prove automatiche» verdi → squash, controllo online (APP_VER 65, CACHE v69), subito `git fetch origin main && git merge origin/main` nel ramo consegne + push. Controllare che il workflow «cloudflare-worker» sia andato bene (tocca il Worker), poi lanciare il giro completo su GitHub (prove.yml, modo `tutto`, E14). Se rosse: capire la causa e correggere.
2. Avvisare Mario: v65 online, riprovare le 2 foto DAC (anche insieme). Nota: sono fatture, non listini; l'import ne ricava i prodotti con il prezzo.
3. Chiedere se ora vede la v64/v65 nelle Novità (vista Sviluppatore).
4. Poi `docs/DA-FARE.md` (D17 ponte RVC, D14…).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta.

## Rischi aperti
- Se Gemini resta lento anche con una foto: valutare `thinkingConfig` per modello con prova sulla chiave vera, o foto più piccole (`shrinkImg` 2000 px, JPEG 0,85).
