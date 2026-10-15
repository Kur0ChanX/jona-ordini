# Passaggio di consegne (2026-10-15, fine sessione #138)

Sessione attuale: #139

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`. Consegne della #137: `git show 7b83c8b~3:docs/PASSAGGIO-CONSEGNE.md` (stesso file prima di questa riscrittura).

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR), allineato a `main` dopo la v117.
- **v116 online** (14/10 20:46 ora italiana). **v117 online** (PR #126, squash `78b082c`, unita 14/10 ~21:28; `APP_VER=117` controllato sul sito alle 21:29).
- Nessuna PR aperta, nessuna sveglia attiva. Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Motore: Mario ha cambiato a mano il motore di questa sessione in `claude-sonnet-5-5` (comando `/model`) a fine #138; anche RVC #152 gira su Sonnet 5.5. La nuova sessione parte con lo stesso motore della #138 (Sonnet 5.5). `effortLevel` `medium` in `.claude/settings.json` (`get_session` non dà `effort_level`).
- Emulatore Firebase (`npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`) e server 8765 vanno riaccesi se servono (`tools/README.md`). Svuotare l'emulatore prima di ogni prova (`curl -X DELETE` come in README).

## Fatto in #138 (14/10, 20:44 → 15/10, 09:30 ora italiana)
- **D54 (d) letture sicure = v117** (Mario #134: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»). In `index.html` vicino a `codaLeggi`:
  - `letDubbia`: ≥2 righe o >20% con `rigaNonTorna`, oppure bolla con meno dell'80% (`LET2.min`) dei prodotti dell'ordine abbinati da `bolMatch` → `codaSeconda` prova gli altri lettori di `GEM_LETT`; `letPunti` tiene la lettura migliore (a pari punti la prima). Banner «Ricontrollo la bolla con un secondo lettore…» (`it.bis`).
  - `codaApplica(it,rows,lett,alt)` scrive `bolla.lett2` e `bolla.dc` (righe dell'ordine con presenza/quantità/prezzo diversi tra le due letture, soglia 1%, `letNumDiv`). `bolInR` non le precompila (`L.bdc`): «Da controllare a mano: le due letture sono diverse»; escono da prezzi diversi/non sulla bolla/meno e vanno nell'avviso ai gestori «N prodotti da controllare a mano (due letture diverse)». `bolRiga` lo dice anche dopo l'invio.
  - Listini: stesso controllo solo per conti che non tornano (non c'è un ordine); `codaRisPezzo` riceve il testo della lettura migliore.
  - Seconda lettura fallita → resta la prima, riga «Seconda lettura non riuscita» nella scatola nera.
  - Due difetti VECCHI chiusi trovati con `test-coda`: (1) `CODA.fatte` — uno snapshot del cloud in ritardo (voce ancora «lettura» col proprio lucchetto) rimetteva in coda la bolla appena letta → seconda lettura doppia; (2) `codaErrCloud` — un telefono che fallisce scriveva «errore» sopra una voce già «fatta» da un altro telefono (transazione: se è fatta la toglie dalla sua coda). Dopo il secondo `test-coda` ha fatto 4 giri su 4 verdi in locale.
  - Prova nuova `tools/test-letture-sicure.mjs` (nelle `VELOCI` di `tools/prova-ci.sh`): lettura buona, 2 su 4, conti che non tornano, secondo lettore guasto, letture uguali, listino. `test-coda` aggiornata (2 su 3 prodotti → f25 + l25, «ricontrollata da»).
  - NEWS v117 aggiunta; v97 spostata in cima a `data/news.json` (E55, max 20 voci). `sw.js` CACHE `jona-ordini-v121`. Riga v117 in `.claude/rules/struttura.md`. D54 in `docs/DA-FARE.md` segnato «v117 online 14/10».
  - Prove: `prove` su GitHub verde (giro sul commit `40733c8`, ~24 min, tutti i dispositivi del giro veloce); in locale verdi `test-letture-sicure`, `test-coda` (4 giri), `test-bolla`, `test-moduli`, `test-news`, `test-testbar`, `test-foto-pulizia`.
- D55 (v116) segnato «online 14/10 20:46» in `docs/DA-FARE.md`.
- Scorta di #137 controllata: diff vuoto, niente da unire.

## Rischi / cose note
- `test-bolla` è caduta 1 volta su 6 al PRIMO giro (poi sempre verde): non capita su GitHub finora. Se ricapita, guardare «Gemini guasto: Riprovo tra…» (banner «Sto leggendo… 0 s» ancora visibile = la prova guardava troppo presto).
- `test-coda` parte 4b («Gemini di B tornato… Controlla e salva», «1 riga Carote») cadeva ogni tanto anche col codice VECCHIO; con la v117 non è più caduta in 4 giri, ma resta da tenere d'occhio.
- Nessun test con foto vere di Mario ancora (E22): Mario non ha provato bolla e listino veri sulla v115/v116/v117.

## ✅ PROSSIMI PASSI (#139, continuare da sola)
1. Chiedere a Mario (già chiesto in #138, senza risposta): fotografare una bolla vera dal Controllo merce con la v117, dirmi se si legge bene e in quanti secondi; stessa cosa per una foto di listino.
2. M44: quando Mario dice i secondi di «cannonau» (v112).
3. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17 (una sola occhiata, mai in ciclo).
4. Se Mario non chiede altro: idea nuova per l'uso del momento nel ristorante (CLAUDE.md §7), dopo aver controllato che non esista già. Prima leggere `docs/DA-FARE.md` (voci 🔴 in cima).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` = lo stesso della sessione che chiude (ora `claude-sonnet-5-5`).
- Sessioni Jona: #138 `session_01FXo5VVU5Fi6r9mSCckpcfm` (chiusa, depth 4 su 8), #137 `session_01MR84DW6YWy6XyCNtNUHozp`.
- RVC attiva: #152 `session_01T88fifKchYVHw7GcUe8HVK`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Server locale `python3 -m http.server 8765`. Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs`. Nelle prove locali `firebase-config.js` si sostituisce con `self.JONA_FIREBASE=null` (`ctx.route`); profilo con `formset dev` + `setupGo` (come `test-bolla`); `S` non è su `window` (`typeof S`).
- Confronto col codice vecchio: `git worktree add --detach <cartella> HEAD` + server su un'altra porta (nella #138 rimasta una worktree in `scratchpad/orig`, nello scratchpad della sessione chiusa: non serve più).

## Consumo #138
cache_read 12.707.681 · cache_write 163.265 · output 38.341 · cost_usd 4,62 (da `get_session`, campo usage, 15/10 09:26).

## Ultimo messaggio di Mario, parola per parola
«no» (risposta alla domanda «Ti serve ancora l'aiuto per far "disegnare meglio" l'altro progetto?»; la domanda originale di Mario, 14/10 19:30, era: «per un altro progetto come faccio a dirgli di disegnare meglio mi fà vettoriali basic senza dettagli»). Poco prima Mario ha dato il comando `/model claude-sonnet-5-5`.
