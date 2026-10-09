# Passaggio di consegne (2026-10-09, fine sessione #46)

Sessione attuale: #47

## Ultimo messaggio di Mario (#46), parola per parola
«Ho caricato 2 listini per mariano visto che sono veri cancella tutti i vecchi finti listini da tutti i fornitori»

Messaggi prima (#46), parola per parola, in ordine:
- «vai» (unire la PR #72 dopo le prove verdi)

Domanda rimasta senza risposta (fatta da Claude in #46): «Per l'immagine in conflitto: va bene tenere le bozze A, B e C e rinominare quella vecchia?» (vedi D16).

Messaggio arrivato da un'altra sessione (RVC #28, `session_0134ut54jXS5mPGLRM7Qnbj9`), con le parole di Mario: «dai la possibilità di lasciare un ponte con l'app Jona per informazioni condivise Jona è il ristorante di questa struttura quindi possono essere 2 app che lavorano a stretto contatto, comunicalo anche a jona e organizzatevi». Salvato come D17. Non ancora risposto.

## Stato
- Online: **v62** (PR #72 unita con squash, commit `4cd2fca` su `main`; controllato `APP_VER=62` e CACHE `jona-ordini-v66` sul sito). Iscrizione alla PR #72 tolta.
- **v63 pronta sul ramo `claude/v63-listini-prova`** (commit `f7fdfe6`, pushato, NIENTE PR ancora). Lavorata nella cartella `/home/user/v63` (worktree, sparisce col contenitore: nella nuova sessione `git worktree add ../v63 claude/v63-listini-prova`).
- Ramo consegne `claude/sessione-41-consegne-p7tepk`: `main` (v62) NON ancora unito per un conflitto su un'immagine (D16). Merge annullato con `git merge --abort`: nessun lavoro perso, niente a metà.

## Fatto in #46
1. PR #72 (v62): «Prove automatiche» verdi (06:46 UTC) → squash merge → v62 online verificata.
2. Merge di `main` nel ramo consegne: **conflitto add/add** su `docs/img/v62-uscita-scelta.png`. Le due immagini hanno lo stesso nome ma contenuto diverso:
   - ramo consegne (commit `7c07e3f`): bozze ferme A «Tutto insieme» / B «Si cancella al contrario» / C «JONA prima, poi la firma» (quella da cui Mario ha scelto la C);
   - `main` (arrivata col ramo v62): vecchie uscite bocciate A polvere / B vecchia TV / C taglio di luce.
   Per regola (conflitto → fermarsi) ho chiesto a Mario. Proposta: tenere A/B/C con il nome attuale, salvare quella di `main` come `docs/img/v62-uscita-scelta-vecchia.png` (`git show origin/main:docs/img/v62-uscita-scelta.png > …`), poi chiudere il merge e push.
3. **v63 «Prodotti di prova»** (richiesta di Mario sopra). Perché così:
   - Claude non può entrare nel Firestore vero (nessuna credenziale). E cancellare dati veri è irreversibile: la cancellazione la fa Mario dal telefono con un tocco, dopo aver visto i numeri.
   - Prodotti finti = quelli di `seedIfEmpty`: i 10 `demo01..demo10` (`demo:true`; Metro, Dolpa, Nieddittas, Pascucci) e i 19 `mar01..mar19` di F.lli Mariano (senza prezzo).
   - Un import di listino (`reviewSave`) scrive `caricatoDa:S.me`; se trova lo stesso prodotto (`matchProd`) lo aggiorna con `upd`. Quindi un `marNN` aggiornato dal listino vero ha `caricatoDa` e **resta**. I prodotti scritti a mano (`saveProd`) hanno id `uid()` casuale e restano.
   - Regola: `const fintoP=p=>!!p.demo||(/^mar\d\d$/.test(p.id)&&!p.caricatoDa);` (subito prima di `seedIfEmpty`).
   - Impostazioni: la riga «Prodotti di esempio» diventa «Prodotti di prova» («N prodotti finti messi all'inizio»); `demoDel` cancella tutti i `fintoP`, la conferma `ask` mostra il conto per fornitore («F.lli Mariano: 14 · Metro: 5 …. Restano i prodotti caricati da voi.»).
   - Il carrello regge prodotti cancellati (`cartLines` filtra quelli mancanti).
   - Scartato: script che cancella dal server (serve accesso e rischio alto); cancellare anche prodotti importati prima di oggi (non sappiamo quali sono di prova: se Mario ne vede ancora di finti, li toglie a mano o si decide insieme).
   - `APP_VER=63`, `sw.js` CACHE `jona-ordini-v67`, NEWS v63 (parte `chef` + `dev`).
   - Prova nuova `tools/test-listini-prova.mjs` (riuscita), aggiunta in testa a `VELOCI` di `tools/prova-ci.sh`.
   - Prove veloci locali (`TZ=Europe/Rome bash tools/prova-ci.sh veloce`) in corso al momento dell'handoff: le prime 13 riuscite (listini-prova, apertura-v62, barra, agenda-v58/59/61, demo-invito, richieste-gestite, errori, errori-server, falsi-ok, firebase-telefoni, v35). Il giro si interrompe con questa sessione: la nuova sessione deve rifarlo (oppure basta il controllo «Prove automatiche» della PR, che fa lo stesso giro veloce) + `test-firebase-bulk` e `test-v16`.

## Prossimo lavoro (#47)
1. D15: aprire la PR da `claude/v63-listini-prova` verso `main` (titolo «v63: via i prodotti di prova»), iscriversi, con «Prove automatiche» verdi → squash → controllo online (versione 63) → merge di `main` nel ramo consegne (prima risolvere D16).
2. Dire a Mario i passi M26 (Impostazioni → Prodotti di prova → Elimina) e chiedere se dopo vede ancora prodotti finti.
3. D16 CHIUSA in #47: Mario «lascia com è adesso» → tenuta l'immagine A/B/C, `main` (v62) unito nel ramo consegne (commit `c109ffd`).
4. D17 ponte RVC: rispondere alla sessione RVC #29 (`session_012YP8hknRTGPF6chZDGPEbV`) con send_message: cosa può dare Jona e cosa le serve, con i nomi dei campi già usati. Spunti: Jona dà `agenda_<AAAA-MM>` (eventi `ev={k,t,g,h,cop,note,vis,rep}`, coperti), orari/turni `config/orari_<lunedì>.tp`, staff `staff` (nome, reparto); a Jona servono ospiti/camere presenti, partenze, allergie, eventi della struttura (→ coperti e ordine suggerito `sugStats`). Tecnica da valutare: Worker Cloudflare con chiave condivisa (le due app hanno Firebase separati). Solo progetto, niente codice.
5. Poi D14 (prova Android di Mario) e il resto di `docs/DA-FARE.md`.

## Strumenti
- Server: `python3 -m http.server 8765` nella cartella del ramo da provare; prove da `tools/` o con `bash tools/prova-ci.sh veloce <cartella risultati>` (avvia anche emulatore).
- Prove con `TZ=Europe/Rome` (E18).

## Ancora da chiedere
- Esito di M25 (prova dell'agenda con Mauro): senza risposta.
- D10 (riquadro «Inviato allo chef»: solo «Continua»): senza risposta.
- Il resto in `docs/DA-FARE.md`.

## Rischi aperti
- Server locale ed emulatore si spengono a ogni riavvio del contenitore.
- Maschera SVG su Android non ancora verificata su un telefono vero.
- Se Mario ha caricato i listini in un nome di fornitore diverso da `mariano` (es. un fornitore nuovo), i `marNN` vecchi non vengono aggiornati e sono cancellati come finti: è quello che vuole.
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #47 · Jona Ordini · da v62 · 09/10/2026 · prossimo: pubblicare v63 (prodotti di prova)`.
