# Passaggio di consegne (2026-10-10, fine sessione #48)

Sessione attuale: #49

## Ultimo messaggio di Mario (#48), parola per parola
«nella nuova chat scrivi solo scrivi solo metti extra o che qll c'è su impegno nella vecchia chat e di mettere via. il tutto per risparmiare token

poi continua»

Come l'ho capito: il prompt della nuova sessione deve essere minimo («riprendi il lavoro in corso della vecchia sessione»), per risparmiare token; poi si continua il lavoro senza fermarsi ad aspettare. Se non è così, chiedere a Mario in una riga.

Messaggi prima (#48), parola per parola:
- «sì procedi, avvisami quando è online» (v63)
- «nel carico listini con i prodotti i file che ti mando o facciamo scannerizzare potrebbero capitare dei prodotti uguali se ci sono avvisami  cosí scegliamo se tenerli o meno, non caricarli uguali dello stesso fornitore 2 volte, però solo se è uguale in tutto ok? aggiorna il programma ora devo caricare file»

## Stato
- #49: **v64 online** (PR #74, squash `95ca4cb`; corretto un «Mario» in un commento che faceva fallire `test-testbar`; online APP_VER=64, CACHE v68). `main` unito nel ramo consegne. Mario: «metti in automatico sempre la nuova versione se non ci sono problemi» → regola in CLAUDE.md. Sessione a lineage 8: all'handoff Mario apre a mano la nuova (E12).
- Online: **v63** (PR #73 unita, squash `32e9a56`; controllato online APP_VER=63, CACHE v67). `main` unito nel ramo consegne. Mario avvisato; M26 (vede ancora prodotti finti?) senza risposta.
- **v64 pronta, NON ancora pubblicata**: ramo `claude/v64-doppioni`, commit `68da176`, pushato e confermato. **Il PR non è stato aperto**: `create_pull_request` ha dato due volte «invalid session» (guasto dello strumento GitHub). Mario aspetta la v64 («ora devo caricare file»): URGENTE.
- Worktree `/home/user/v64` (sparisce col contenitore: `git worktree add ../v64 claude/v64-doppioni`).

## v64: listini senza prodotti doppi
Richiesta: nell'import (file, foto Gemini, tabella) avvisare dei prodotti uguali per scegliere se tenerli; non caricare due volte una riga dello stesso fornitore se è uguale in tutto.
- `index.html`: `sameProd(a,b)` (stesso codice; se una delle due non ha codice, stesso nome). `matchProd` ora usa `sameProd` (**correzione**: prima due codici diversi con lo stesso nome si sovrascrivevano). `rvDiff(a,b,cat)` = campi diversi (nome, codice, unità, prezzo, categoria; `norm` per i testi, `num` per il prezzo). `rvDup(items)` per riga: `{twin:j}` uguale in tutto alla riga j dello stesso fornitore; `{sim:j,dif}` stesso prodotto ma qualcosa cambia; `{ex:p}` uguale in tutto a un prodotto già a listino (categoria contata solo se scritta nel file: `catF` nella riga di `impRun`).
- `impRun`: le righe con un doppio partono senza spunta.
- `reviewSheet`: banner `#rv-dup` «Prodotti doppi» con i conteggi; etichette «uguale alla riga N: non la carico due volte», «simile alla riga N, cambia: prezzo», «uguale, già a listino», «nuovo: stesso nome di uno già a listino, codice diverso». Casella spenta per le righe uguali in tutto; `rvall` non le spunta mai.
- `reviewSave`: esclude sempre le righe uguali in tutto; decide prima dove va ogni riga (`plan`): una riga simile spuntata dopo un'altra dello stesso prodotto diventa un prodotto separato (Mario ha scelto di tenerle).
- Decisioni: righe simili senza spunta di partenza (più sicuro: niente doppioni non voluti, Mario sceglie). Doppi cercati solo nello stesso fornitore (come chiesto). Il prezzo nuovo di un prodotto già a listino lo aggiorna come prima.
- `APP_VER=64`, CACHE `jona-ordini-v68`, NEWS v64 (chef + dev).
- Prova nuova `tools/test-listini-doppi.mjs` (14 PASS), in testa a `VELOCI` di `tools/prova-ci.sh`. Riuscite anche `test-scaglione2`, `test-news`, `test-listini-prova`, `test-giro` (TZ=Europe/Rome).

## Prossimo lavoro (#49), in ordine
1. Aprire il PR `claude/v64-doppioni` → `main` (titolo «v64: listini senza prodotti doppi»), iscriversi; con «Prove automatiche» verdi: squash, controllo online (APP_VER 64, CACHE v68), subito `git fetch origin main && git merge origin/main` nel ramo consegne + push. Pubblicare senza chiedere.
2. Avvisare Mario che la v64 è online e può caricare i file: vedrà il riquadro giallo «Prodotti doppi» e le righe doppie senza spunta, da spuntare se vuole tenerle.
3. Se Mario manda file di listini: salvarli subito nel progetto e committarli.
4. D17 ponte RVC, poi D14 e il resto di `docs/DA-FARE.md`.

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25 (agenda con Mauro), D10: senza risposta.

## Rischi aperti
- Se lo strumento GitHub resta guasto: riprovare più tardi, non forzare (E11).
- Maschera SVG su Android non verificata.
