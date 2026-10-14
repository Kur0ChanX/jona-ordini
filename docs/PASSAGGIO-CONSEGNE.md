# Passaggio di consegne (2026-10-14, fine sessione #133)

Sessione attuale: #134

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v112 online**. **v113 in PR #124** (https://github.com/Kur0ChanX/jona-ordini/pull/124), segnata pronta alle ~16:45 ora italiana: il giro `prove` era in corso alla chiusura della #133. **Prima cosa da fare: guardare UNA volta lo stato** (`pull_request_read` `get_check_runs`, E54); verde → squash merge (`commit_message` corto, `expectedHeadSha`), controllo online `APP_VER=113` su https://jona-ristorante-by-ynoy-corp.pages.dev/, poi `git fetch origin main && git merge origin/main` sul ramo e push normale (il Worker si pubblica da solo con `cloudflare-worker.yml` al merge, perché `worker/**` è cambiato). Rosso → capire la causa, niente push mentre gira (E39).
- La #133 era a **lineage depth 8/8** (E12): niente sveglie (`send_later` rifiutato) e niente `create_session`. La #134 la apre Mario a mano: nasce con depth 1, quindi sveglie e handoff automatico tornano possibili.
- Nessuna modifica pendente. Nessuna sveglia attiva. L'iscrizione alla PR #124 era di questa sessione: la nuova deve controllare da sé (nessun evento arriva).
- Limite: `five_hour` allowed. Motore `claude-fable-5-1`, impegno `high` (`.claude/settings.json`). `get_session` non mostra `effort_level` né `usage` in questo ambiente.

## Fatto in #133 (14/10, 16:30 → 16:50 ora italiana)
- Scorta unita (`docs/ULTIMO-MESSAGGIO.md` «ci mette un minuto la ricerca…»), pushata.
- Fatti controllati (web + Context7, pagina modelli di Google): oggi `gemini-flash-latest` punta ai Gemini 3.x (3.8 Flash stabile, ragionamento acceso di partenza, livello medio/alto): è la causa delle letture lente e dei blocchi a 45 s. `gemini-2.5-flash` e `gemini-2.5-flash-lite` restano serviti «fino a nuovo avviso», non deprecati; 2.5 Flash ragiona di partenza ma si spegne con `thinkingBudget:0`, 2.5 Flash-Lite non ragiona. Limiti gratis non più pubblicati in una tabella: si vedono solo su https://aistudio.google.com/rate-limit (fonti di terze parti: 2.5 Flash ~1.500 al giorno, 10 al minuto). Su iPhone/iPad il **Background Sync non esiste** (Safari): con l'app chiusa non gira niente; su Android a tratti. Quindi «in background» vero = qualcun altro legge (strada 3).
- **Brainstorming D54** con immagine `docs/img/d54/bolla-3-strade.png` (sorgente `.html` accanto): 1 Ovvia (tutto nel telefono, riprova con l'app aperta), 2 Furba (il server legge, serve un deposito nuovo), 3 Geniale (foto nel telefono + coda su Firestore, la legge il primo dispositivo aperto del ristorante, consiglio). La scheda a tocco è tornata «[No preference]» (sparita, E38); riproposta nel testo. **Mario ha risposto «Penso la 3»** (vedi ultimo messaggio) ma senza doppio tocco: la #134 conferma con una domanda a tocco in 3 righe prima di costruire.
- **v113** (parte comune a tutte le strade, commit `84f510d`): `GEM_LETT` = `f25` → `l25` → `cf`; `gemCall` = involucro di `gemCall1`: a `f25` aggiunge `thinkingConfig.thinkingBudget:0` se manca (400 → stessa richiesta senza), `gemLenta` scrive «Lettura lenta: <lettore> N s» nella scatola nera oltre `GEM_LENTA` 30 s; `gemNome` conosce anche `flash`/`lite` (note vecchie); `VN_TSOLITO` f25 15, l25 10. Worker (`worker/src/index.js`): `GEM_FOTO_MS` 70 s per lettore quando la richiesta ha `inline_data` (`conFoto`, `tMs`), mai sopra `GEM_BUDGET`; solo testo resta 45 s. `APP_VER` 113, `CACHE` v117, voce NEWS v113, v93 spostata in `data/news.json` (E55). Prove: `test-bolla` 25/25 (+3: f25 con `thinkingBudget` 0, 400 → senza, niente Gemini 3), `test-gemini-server` 68/68 (+3: foto 70 s, testo 45 s, tetto del budget; attese v68 passate a f25/l25), `test-cantina` 85/85 (nomi nuovi), `test-news` 95/95, `test-moduli` 75/75. `test-giro` non rifatto (nessun cambio di aspetto). Riga v113 e E20 aggiornati in `.claude/rules/struttura.md`.
- `docs/DA-FARE.md`: D54 aggiornata (tabella + parte 2 con le lettere a-d).
- Scelte scartate: alzare `GEM_TRY_MS` per tutti (il testo non ne ha bisogno, e 70 s × 3 lettori per il testo farebbe aspettare troppo); tenere `flash`/`lite` con `thinkingLevel` (Gemini 3 non si può spegnere del tutto e Mario non lo vuole).

## ✅ PROSSIMI PASSI (#134, continuare da sola)
1. **PR #124 (v113)**: stato una volta, poi merge e messa online come in «Stato».
2. **Confermare la scelta 3 con il doppio tocco** (E29/E37) in 3 righe: «Confermi la strada 3 Geniale?» · Sì, confermo · È una domanda o un dubbio · No, ho sbagliato. Mario ha anche chiesto «ci mette già un minuto a caricarla, possiamo fare di meglio? o soluzioni gratuite migliori»: rispondere che il minuto era Gemini 3 (ora tolto con la v113: attesa prevista 10-25 s) e che con la coda sul cloud nessuno resta a guardare il telefono.
3. **Costruire D54 strada 3 («Geniale»)**, con le regole nuove di Mario (sotto), in versioni piccole e provate:
   a. **Coda delle letture** (nome proposto: `coda/<id>` in Firestore + copia in IndexedDB `jona-kv`): all'arrivo della foto (bolla in Controllo merce, foto dei listini in Importa listini, etichette dei vini) la foto ridotta (`fotoPiccola`, ≤ ~1.200 px, sotto 1 MB in base64 per il limite del documento Firestore; se non basta, più documenti) si salva SUBITO in IndexedDB e in coda; l'app non aspetta: avviso «La bolla è in coda: ti avviso quando è letta» e si può chiudere.
   b. **Senza connessione mai bloccata**: la coda vive in IndexedDB e parte quando la rete torna (`online`, `visibilitychange`, riapertura: modello `obxFlush`/`vnRestore`); niente attese a video, niente foto perse.
   c. **Chi legge**: ogni dispositivo aperto del ristorante (tablet cucina, telefono di Maurizio, chi ha l'app aperta) prende la prima voce libera della coda (lock con `at`+`da` e scadenza 2 min per non leggere in due), chiama Gemini (`GEM_LETT` v113, ritentativi `vnRiAuto`-style: 2 min × 5, poi ogni 10 min, mai arrendersi senza avviso), scrive il risultato nella voce (`esito`) e lo applica all'ordine (`bolMatch` v77) o al listino (`impRun`).
   d. **Letture sicure (Mario: «che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli»)**: controlli dopo la lettura: numero di righe lette ≥ 80% delle righe dell'ordine atteso, totale della bolla (se letto) = somma delle righe ±2%, righe con quantità/prezzo assurdi (`rigaNonTorna`) segnate «da controllare», nessuna riga scartata in silenzio (le righe non abbinate restano visibili come «Sulla bolla ma non ordinati»); se i controlli falliscono, seconda lettura con l'altro lettore e confronto (si tiene quella coerente; se diverse → «da controllare a mano» con le due versioni). Prova con foto vere di Mario (`tools/test-virgolette.mjs`, E22).
   e. **Avvisi a Maurizio**: a lettura finita, push ai `gm` (`notify()`/`pushSend()`) con discrepanze di prezzo (`bolPrezzoDiv` ≥1%), mancanze, righe in più e righe «da controllare»; tocco → `receiptView`. Stesso avviso per il listino caricato (prezzi cambiati rispetto al listino prima).
   f. Prove per ogni pezzo (`tools/test-coda.mjs` nuovo, `test-bolla`, `test-firebase-*` con l'emulatore), giro `tutto` del lunedì.
4. M44: quando Mario dice i secondi di «cannonau» (v112).
5. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-fable-5-1`.
- Sessioni Jona: #133 `session_0134bRDgcQv5VmLGKerpgq33` (chiusa, depth 8), #132 `session_01TxVKG86JJ1Jv98ZSMb1TLK`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Server locale `python3 -m http.server 8765` (rilanciarlo dopo un riavvio). Foto da Playwright: import da `/opt/node22/lib/node_modules/playwright/index.mjs` (gli script fuori dal repo non trovano `playwright`).
- Impegno: `high` (`.claude/settings.json`).

## Consumo #133
`get_session` senza campo `usage` in questo ambiente: non misurabile. Contesto alla chiusura ~200k token (avviso dell'hook).

## Ultimo messaggio di Mario, parola per parola
(#133, ~16:50 ora italiana): «Penso la 3 però ci mette già un minuto a caricarla possiamo fare di meglio? o soluzioni grauite migliori comunque penso la 3 voglio un sistema super stabile e che non sbagli a leggere dati sbagliati fuori riga o falsi o diversi o saltarli
aggiungo non deve mai bloccarsi anche quando non c'è connessione quando la riaggancia la manda cosí uno non stà a guardare il telefono fino a quando non la carica che perde tempo questa regola anche su carica listino e controllo consegna ecc»
Prima (#132): «in arrivo dell'ordine i ragazzi devono scannerizzare la nuova bolla del fornitore di consegna e il programma la deve caricare … deve rilevare discrepanze prezzi mancanze e anomalie con l'invio a maurizio.» Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
