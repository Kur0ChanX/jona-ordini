# Passaggio di consegne (2026-10-14, fine sessione #137)

Sessione attuale: #138

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`. Consegne della #136: `git show 70f48f7:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR), già allineato a `main` dopo la v116.
- **v115 online** (PR #124 unita 19:59 ora italiana, squash `5989d7a`, controllato `APP_VER=115` sul sito).
- **v116 online** (PR #125, squash `a4d96b2`, unita 20:42; `APP_VER=116` controllato sul sito alle ~20:46 ora italiana).
- Nessuna PR aperta, nessuna sveglia attiva di questa sessione. Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Motore `claude-opus-5-5`, `effortLevel` `medium` in `.claude/settings.json` (`get_session` non dà `effort_level`).
- Emulatore Firebase e server 8765 vanno riaccesi nella sessione nuova se servono (`tools/README.md`).

## Fatto in #137 (14/10, 19:31 → 20:45 ora italiana)
- Prove della PR #124 verdi (giro sul commit `b0ac9e8`) → squash, v115 online, `main` unito nel ramo, scorta unita (solo `docs/ULTIMO-MESSAGGIO.md`).
- **Lezione E57** scritta in `docs/ERRORI.md` (sezione Prove) e `docs/ERRORI-STORIA.md`: prova che fallisce a caso → 5 giri sul codice originale + diagnosi prima di alzare le attese; niente «Mario» neanche nei commenti di `index.html` (`test-testbar`). Riga v115 di `.claude/rules/struttura.md` completata col segno `st:'tolto'`.
- **D55 → v116** (pulizia delle foto delle bolle). Domanda a Mario. Prima risposta (a mano): «consigliami tu cosa mi serve tenerle? e 60 giorni può essere tanto e poi perché tenerle ha un motivo?». Spiegato il motivo: contestazioni col fornitore e controllo della fattura del mese. Seconda domanda (15/30/60 giorni): «se non occupano troppo del nostro spazio va bene 30».
  - Fatto trovato: `ricezione.foto` è la miniatura di 1200 px (JPEG 0,7, ~200 KB in base64) salvata DENTRO il documento dell'ordine. Ogni telefono scarica gli ultimi 300 ordini (`COLS.ordini` limit 300) → fino a ~60 MB. Quindi la pulizia serve anche alla velocità, non solo allo spazio.
  - Codice (`index.html`, vicino a `codaAvvio`): `FOTO_GG=30`, `fotoPulisci()` solo `isMgr`, una volta al giorno (`jona_fotopul` {g giorno, f limite}), `S.db.range('ordini','ricevuto',da,fino)` con `da` = limite dell'ultimo giro (legge solo gli ordini nuovi da pulire, pochi documenti al giorno), poi `upd('ordini',id,{'ricezione.foto':''})`. Parte 15 s dopo l'avvio e nel giro di 60 s della coda. Righe, note e `bolla` restano.
  - Scartate: «tieni l'ultima per fornitore» (perdi le foto delle contestazioni) e «foto nel Worker/D1» (troppo lavoro per ora). Possibile seguito: spostare la foto fuori dall'ordine (Worker come gli allegati della chat) se l'app resta pesante.
  - NEWS v116 aggiunta; v96 spostata in cima a `data/news.json` (E55: max 20 voci). `sw.js` CACHE `jona-ordini-v120`. Riga v116 + chiave `jona_fotopul` in `.claude/rules/struttura.md`. D55 in `docs/DA-FARE.md` (tabella in cima).
  - Prova nuova `tools/test-foto-pulizia.mjs` (aggiunta a `VELOCI` in `tools/prova-ci.sh`): staff non tocca niente, 40 giorni tolta, 29 e 2 giorni restano, una volta al giorno, giorno dopo solo dal segno in poi. Verdi in locale anche `test-moduli`, `test-news`, `test-bolla`, `test-testbar`; su GitHub `prove` verde (tutti i dispositivi del giro veloce).
- Mario non ha ancora provato bolla e listino veri sulla v115.

## ✅ PROSSIMI PASSI (#138, continuare da sola)
1. Segnare D55 «online 14/10 20:46» in `docs/DA-FARE.md` (v116 già controllata online).
2. Ricordare a Mario (già chiesto in #137, in attesa): fotografare una bolla vera e una foto di listino con la v115/v116, dirmi se si legge bene e quanti secondi.
3. **D54 (d) letture sicure** (Mario: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»): righe lette < 80% dell'ordine o troppi `rigaNonTorna` → seconda lettura con l'altro lettore e confronto; righe diverse → «da controllare a mano». Prova con foto vere di Mario (E22). Sarà v117. Prima un piano in 3 punti; domanda a Mario solo se serve un gusto.
4. M44: quando Mario dice i secondi di «cannonau» (v112).
5. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-opus-5-5`.
- Sessioni Jona: #137 `session_01MR84DW6YWy6XyCNtNUHozp` (chiusa, depth 3), #136 `session_01QVGvVgjREzxgz8wssjrW5s`.
- RVC attiva: #146 `session_01CrJcNRSfSAvyyKUhNEaD4z`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`. Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs`. Nelle prove locali: `firebase-config.js` va sostituito con `self.JONA_FIREBASE=null` (`ctx.route`) e il profilo si crea con `formset dev` + `setupGo` (come `test-bolla`); `S` non è su `window` (`typeof S`).

## Consumo #137
cache_read 10.541.229 · cache_write 146.523 · output 22.887 · cost_usd 3,74 (da `get_session`, campo usage, alle 20:43).

## Ultimo messaggio di Mario, parola per parola
(20:1x, risposta a tocco) «se non occupano troppo del nostro spazio va bene 30»
Prima: «consigliami tu cosa mi serve tenerle? e 60 giorni può essere tanto e poi perché tenerle ha un motivo?»
