# Passaggio di consegne (2026-10-14, fine sessione #132)

Sessione attuale: #133

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v112 online** (PR #123, squash `ba4fc79`, prove verdi su tutti e 6 i dispositivi alle 09:34 ora italiana; `APP_VER=112` controllato sul sito). Main unito sul ramo (`4872300`), niente modifiche pendenti.
- Nessuna PR aperta. Nessuna sveglia attiva (quella della PR #123 cancellata). Iscrizione alla PR #123 tolta.
- Limite: `five_hour` allowed. Motore della sessione: Mario ha cambiato a **`claude-fable-5-1`** con `/model` alle ~16:27 (prima Opus). La nuova sessione nasce con lo stesso motore (`claude-fable-5-1`). Attribuzione dei commit ora «Claude Fable 5.1».

## Fatto in #132 (14/10, 07:30 → 16:30 ora italiana)
- v111 controllata online. Lezione **E56** scritta (`docs/ERRORI.md` + `docs/ERRORI-STORIA.md`): bozze bocciate + «fallo tu» = disegno nuovo, non una bozza bocciata.
- Scorta unita (`docs/ULTIMO-MESSAGGIO.md` «ok va bene»); la #131 ha avvisato con send_message che quell'«ok» non era l'approvazione del video.
- Video del calice mandato a Mario. Risposta: **«ci mette un minuto la ricerca e non sò se è normale cosí tanto l'animazione non va bene 8secondi o modifichi la ricerca e la migliori piú fast o allunghi l'animazione»** → scelta mia: ricerca più veloce (il calice segue già il tempo vero).
- **v112** (`moduli/cantina.js`, `index.html`, `tools/test-cantina.mjs`, `.claude/rules/struttura.md`):
  - `vnMondoCerca(q)`: gara tra `l25` e `f25` con la ricerca Google (prima erano in fila: un lettore fermo = fino a 45 s del Worker, poi l'altro → ~1 minuto). Vince la prima risposta; chi perde riceve lo stop con `AbortController` (`gemCall(body,lettore,sig)`, `signal` sulle 3 `fetch`). Dopo `VN_MONDO.mem` (15 s) o se tutti e due falliscono parte la domanda senza Google (`lite`, poi `flash`), usata solo se Google non risponde entro `VN_MONDO.max` (22 s, `M.mem` → avviso giallo). Stop a `VN_MONDO.stop` (50 s) con «Riprova». Ricerca riuscita oltre 15 s → riga «Vino nel mondo lenta» nella scatola nera.
  - `vnMondoT()` = min(tempo solito, 22): il calice si riempie sul tempo nuovo anche se le ricerche vecchie erano lente.
  - Calice a mano con vino versato e che oscilla (fatto in #131) pubblicato così com'era: Mario non ha bocciato il disegno, solo la durata.
  - Voce NEWS v112 e riga v112 in `struttura.md` riscritte. Prove: `test-cantina` 85/85 (3 nuove sulla gara con `VN_MONDO` corti), `test-moduli` 75/75, `test-news` 95/95, `test-giro` verde.
- Mario ha approvato «Sì, mettila online» col doppio tocco. Squash con `expectedHeadSha`, `commit_message` corto (E54).
- `docs/DA-FARE.md`: **M44** = Mario prova «cannonau» su internet e dice i secondi.
- Scelta tecnica scartata: allungare l'animazione a 8 s fissi (Mario l'aveva proposta come alternativa) — il calice legato al tempo vero è più onesto; cambiare il Worker (`GEM_TRY_MS` 45 s) — la gara risolve senza toccare il server.

## ✅ PROSSIMI PASSI (#133, continuare da sola)
1. **Nuova richiesta di Mario (ultimo messaggio, qui sotto): bolla di consegna all'arrivo dell'ordine, anche in background.** Prima BRAINSTORMING (3 strade: ovvia, furba, geniale, con immagine), poi domanda a tocco. Punti da coprire:
   a. All'arrivo dell'ordine lo staff fotografa la bolla del fornitore (oggi: Controllo merce → «Confronta la bolla con l'ordine», `bolLeggi` v77, lettori `GEM_LETT` flash → lite → cf). La foto va **salvata subito e mai persa** anche se l'app si chiude (già c'è il modello della cantina: IndexedDB `jona-kv`/`vn_fotos`, `idbKv`, `vnBozza`/`vnRestore` v96; e `jona-outbox` + Background Sync nel `sw.js` per le push). Strada probabile: coda delle bolle in IndexedDB + Background Sync (`sw.js`) + ritentativi finché la lettura non riesce (modello «Rileggila tu più tardi» v107: `vnRiAuto`, `VN_RI_MS` 2 min, `VN_RI_MAX` 5), anche dopo riapertura.
   b. **Gemini Flash (non Lite) si blocca dopo 45 s**: Mario pensa che `GEM_TRY_MS` (45 s per lettore nel Worker, `worker/src/index.js` riga ~146) sia troppo basso per una bolla e l'app lo vede come errore 504. Da controllare: tempi veri delle letture di `flash` nella scatola nera (`/errori`) e in `jona_ia_t`; se serve alzare il tempo per lettore per le foto (tetto 100 s di Cloudflare: E20, `GEM_BUDGET` 85 s) o spegnere il ragionamento (`thinkingConfig.thinkingBudget:0`, come fatto per `vnMondo` v111) che su `gemini-flash-latest` (Gemini 3) può essere la vera causa della lentezza. Mario: **«Non usare gemini 3 che probabilmente è il pro nel piano gratuito che abbiamo non va bene»** → preferire `gemini-2.5-flash` (`f25`) e `gemini-2.5-flash-lite` (`l25`) per le foto di bolle, fatture e listini; controllare i limiti gratis di Google con Context7/pagina prezzi prima di decidere.
   c. Stessa regola (salvataggio sicuro + ritentativi + Gemini 2.5) anche per la scansione di DDT, bolle e fatture che carica il listino (Fornitori → Importa listini → foto, `gemRun`/`gemJoin`, `fotoStage`).
   d. Dopo il caricamento riuscito: rilevare **discrepanze di prezzo, mancanze e anomalie** rispetto all'ordine/listino (già esistono `bolMatch`, `bolPrezzoDiv` ≥1%, `rigaNonTorna`, «Non è sulla bolla» / «Sulla bolla ma non ordinati» v77) e **mandarle a Maurizio** (push `notify()`/`pushSend()` ai `gm`, o messaggio in chat/agenda). Riusare, non rifare.
   e. Aggiungere la voce **D54** in `docs/DA-FARE.md` (parte 2, dopo scelta di Mario) con queste lettere.
2. M44: quando Mario dice i secondi di «cannonau», se resta lento guardare la scatola nera «Vino nel mondo lenta».
3. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-fable-5-1`. Lineage di questa sessione: depth 7/8 (E12 se la nuova non si apre).
- Sessioni Jona: #132 `session_01TxVKG86JJ1Jv98ZSMb1TLK` (chiusa), #131 `session_017havyiAofN9wKUgXPxeHJR`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Foto e video del calice: vedi `docs/img/v112/` (bozze e video `4-vino-vivo.mp4`); ricetta Playwright nelle consegne #131 (`git show 9afc121:docs/PASSAGGIO-CONSEGNE.md`).
- Server locale `python3 -m http.server 8765` (rilanciarlo dopo un riavvio).
- Impegno: `high` (`.claude/settings.json`).

## Consumo #132
cache_read 8.059.887 · cache_write 242.274 · output 23.668 · input 1.115 · cost_usd 4,03.

## Ultimo messaggio di Mario, parola per parola
(#132, ~16:27, subito dopo `/model claude-fable-5-1`): «in arrivo dell'ordine i ragazzi devono scannerizzare la nuova bolla del fornitore di consegna e il programma la deve caricare
Attenzione il programma deve andare anche in background deve salvare la foto e non la deve perdere anche se si chiude l'app e deve provarla a caricare nel sistema per scannerizzarla fin che non va, fai uno sguardo a gemini flash non lite perché dopo 45 secondi si blocca forse limite di tempo basso per elaborarla e il programma lo vede come un errore penso.
Non usare gemini 3 che probabilmente è il pro
nel piano gratuito che abbiamo non va bene

 poi una volta che il programma l'ha caricata senza intoppi e questa regola mettila anche nel programma in scansione ddt bolle e fatture per caricare il listino , deve rilevare discrepanze prezzi mancanze e anomalie con l'invio a maurizio.»
Prima (#132): «ci mette un minuto la ricerca e non sò se è normale cosí tanto l'animazione non va bene 8secondi o modifichi la ricerca e la migliori piú fast o allunghi l'animazione». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
