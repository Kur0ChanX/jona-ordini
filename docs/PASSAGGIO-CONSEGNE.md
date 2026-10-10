# Passaggio di consegne (2026-10-10, fine sessione #50)

Sessione attuale: #51

## Ultimo messaggio di Mario (#50), parola per parola
«su queste 2 foto ha trovato solo questo puoi risolvere?»
(con 4 immagini: le 2 fatture DAC già salvate e 2 schermate di «Controlla e salva»: 3 prodotti «da Tabella incollata»; il gambero ha Unità e Prezzo vuoti e categoria «Altro»; nomi senza virgolette: «SPORA200G», «ROSSOVERITAS335/50PZ»)

Messaggio prima (#50): il prompt di avvio della sessione (riprendere la pubblicazione della v65).

## File ricevuti (#50)
- Le 2 fatture DAC: identiche (md5) a `docs/img/listini/dac-fattura-054851-2026-09-01.jpg` e `dac-fattura-252792-2026-09-08.jpg`, non duplicate.
- `docs/img/segnalazioni/v65-dac-controlla-1.jpg` e `v65-dac-controlla-2-gambero-vuoto.jpg` (committati sul ramo consegne, `f1e3c9b`).

## Fatto in #50
- **v65 online**: PR #75 unita (squash `14847d4`), sito controllato (APP_VER=65, CACHE `jona-ordini-v69`), workflow «Pubblica server notifiche (Cloudflare Worker)» riuscito (anche «Prova del server»), `main` unito nel ramo consegne. Giro completo su GitHub lanciato (prove.yml, workflow_dispatch modo `tutto`, ref `main`, ~10/10 05:58 UTC): **risultato da guardare** (E14).
- Con la v65 Gemini ha letto le 2 foto DAC senza errore 524 (confermato dalle schermate di Mario).
- «Ha trovato solo questo»: le 2 fatture contengono davvero solo 3 prodotti (POLLO COSCE 37807 kg 4,027; POLLO SOVRACOSCIO 805161 kg 7,842; GAMBERO ROSSO 88563 pz 45,90). Spiegato a Mario.
- Il guasto vero: gambero senza unità/prezzo, categoria «Altro», virgolette sparite. Diario: E22.

## v66: virgolette nei nomi (PR #76, ramo `claude/v66-virgolette`, commit `7c62451`)
Causa: `splitLine` (index.html, prima di `parseTable`) prendeva ogni `"` come apertura/chiusura di cella CSV. `GAMBERO ROSSO"VERITAS"3"35/50PZ` ha 3 virgolette → cella aperta fino a fine riga → `;pz;45,90;Pesce` finiva nel nome. Nei nomi con 2 virgolette spariva solo la virgoletta.
- `splitLine`: le virgolette contano solo se iniziano la cella (cella vuota finora); si chiudono solo se seguite da separatore o fine riga (spazi ammessi); `""` = virgoletta; virgoletta aperta mai chiusa → `l.split(dl)`. Tabelle con `|` invariate.
- `parseTable`: se una riga ha meno celle dell'intestazione e la divisione semplice dà il numero giusto, usa quella (toglie le virgolette che racchiudono tutta la cella, `uq`).
- `geminiPrompt`: «listino prezzi (o la fattura, o la bolla)»; regola per fatture/bolle (solo righe prodotto, prezzo unitario colonna PREZZO, U.M. K./KG = kg, PZ = pz anche attaccata alla descrizione); «copia la descrizione com'è, virgolette comprese, e non usare il punto e virgola dentro le celle».
- APP_VER 66, CACHE `jona-ordini-v70`, NEWS v66 (chef + dev correzioni).
- Prova nuova `tools/test-virgolette.mjs` (16 controlli: righe DAC vere, CSV con `;` e `""`, virgola, nomi che iniziano con virgolette, virgoletta mai chiusa, `|`, import fino a `S.rev.items`, prompt). Sul codice di `main` falliscono 8 controlli (verificato con una copia di origin/main). Aggiunta a `VELOCI` in `tools/prova-ci.sh` (dopo test-gemini-server).
- Riuscite in locale (TZ=Europe/Rome): test-virgolette 16, test-gemini-server 39, test-listini-doppi 14, test-listini-prova 7, test-scaglione2 20, test-news 94, test-testbar 7, test-giro.
- PR #76 aperta alle ~06:07 UTC, «Prove automatiche» in corso. La #50 era iscritta agli eventi della PR: **la #51 deve iscriversi di nuovo** (`subscribe_pr_activity` Kur0ChanX/jona-ordini 76) o controllare i check a mano.
- Decisioni: correzione nel lettore (non solo nel prompt), perché anche CSV/Excel veri possono avere virgolette nei nomi; scartato «togliere tutte le virgolette» (perde i nomi veri e rompe i CSV con `;` tra virgolette). Categoria del gambero: con la cella giusta arriva «Pesce» da Gemini, nessuna logica nuova.
- CLAUDE.md non toccato per la v66 (nessuna struttura nuova).

## Prossimo lavoro (#51), in ordine
1. D20: PR #76. «Prove automatiche» verdi → squash, controllo online (APP_VER 66, CACHE v70), subito `git fetch origin main && git merge origin/main` nel ramo consegne + push. Non tocca il Worker: niente giro completo extra. Se rosse: capire la causa e correggere.
2. Guardare il risultato del giro completo lanciato dopo la v65 (Actions → «Prove automatiche», evento workflow_dispatch). Se rosso: priorità.
3. Avvisare Mario: v66 online → M27 (rifare l'import delle 2 foto DAC, controllare che il gambero abbia pz, 45,90, Pesce). Gli ho detto di non salvare ancora il gambero com'era. Se l'aveva già salvato, dopo il nuovo import potrebbe comparire come «simile» (v64): spiegarglielo.
4. Chiedere se ora vede v64/v65/v66 nelle Novità (vista Sviluppatore o Admin Chef, E21).
5. Poi `docs/DA-FARE.md` (D17 ponte RVC, D14…).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta.

## Rischi aperti
- Gemini potrebbe ancora lasciare vuota l'unità del gambero (U.M. «PZ» attaccata a «GEL##PZ»): il prompt ora lo spiega, non verificato con il Gemini vero.
- Server di prova `python3 -m http.server 8766` lasciato acceso nello scratchpad (innocuo, il contenitore si chiude da solo).
