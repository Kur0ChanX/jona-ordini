# Passaggio di consegne (2026-10-10, fine sessione #55)

Sessione attuale: #56

Ramo di lavoro: `claude/jona-sessione-56` (all'handoff della #56 → `claude/jona-sessione-57`). App online: v67. **v68 pronta e committata** (commit `27a77fb` sul ramo, prove legate verdi), NON ancora pubblicata.

## Ultimo messaggio di Mario (#55), parola per parola
«Mi deve avvisare che il motore sta lavorando, su il flash, se è normale, e perché sta lavorando lì. Che problemi ha avuto l'altro? Se è in sovraccarico o no? Mi raccomando, attenzione ai falsi feedback, perché spesso ci possono essere dei falsi. Mi è capitato in altri programmi.»

- Messaggio prima: «Sicuro di utilizzare la versione Gemini Flash Lite. Flash Lite fa un po' schifo, perché non la versione normale, Flash normale, che funziona molto molto bene? La versione Pro, no perché consuma troppo e poi non abbiamo un abbonamento Pro.» → risposto: l'app usa già Flash per primo, Lite solo di riserva; Pro no. Ordine v68: Flash → Flash-Lite → Cloudflare Llama 4.
- Il suo ultimo messaggio è la richiesta realizzata nella v68 (sotto). Va ancora detto a Mario che è fatta, appena pubblicata.

## Fatto in #55
- **Secondo giro prova lettori** (run 38034926723, 9:35→10:00 ora italiana, artifact 11663702836): permessi Cloudflare OK. Gemini Flash-Lite 20/20, 0 errori, 17 s; **CF `@cf/meta/llama-4-scout-17b-16e-instruct` 19/20**, 0 errori, 72 s; Gemini Flash 6/6 ma 2 foto perse per 503, 376 s; CF qwen3.8 13/20 (398 s), mistral-small-3.1 11/20, gemma-4 0 righe (non usarla). Immagine `docs/img/scelte/prova-lettori-risultato-2.png` mandata a Mario (fatta con HTML + Playwright, script nello scratchpad, non nel repo).
- Iscritto alla PR #78 (`subscribe_pr_activity`). Controllo di riserva cancellato.
- **Messaggio da un'altra sessione di Mario** («Account switch strategy», `session_01T6FSLJ14J9cy5jTtgWQKnE`): unito il ramo `ccr-c4aaeb72-tfz1na` (solo `docs/CAMBIO-ACCOUNT.md` nuovo + regola «CAMBIO ACCOUNT» in CLAUDE.md › REGOLE TRASVERSALI). Aggiunta **M29** in `docs/DA-FARE.md` (preparare l'account Hotmail, passi 1-6). Regola: quando Mario scrive «cambio account» → handoff fino al push e al ramo nuovo, ma NON aprire la sessione nuova: dargli il prompt di 3 righe per l'altro account. D22 aggiornata in DA-FARE.
- **v68 costruita** (commit `27a77fb`):
  - `worker/src/index.js`: `LETTORI` {flash, lite, cf}, `CF_MS` 80 s, `motivoDi` (503 sovraccarico, 429 limite, 504 lento, 404 manca), `lettoreErr` → `{error:{message,codice,motivo,lettore}}`, `leggiCf` (Workers AI via `env.AI.run`, messaggio chat con `image_url` data:base64, risposta riportata nel formato Gemini con `lettore:'cf'`; errori 3040 → 503, 4006/quota → 429, tempo scaduto → 504). In `gemini()`: con `req.lettore` prova SOLO quel lettore, una volta, timeout `GEM_TRY_MS` (45 s); senza `lettore` (Chiedi a Jona, app vecchie) la catena di prima, invariata.
  - `worker/wrangler.toml`: aggiunto `[ai] binding = "AI"` (statico; il token ha Workers AI Read+Edit dal 10/10). Il workflow aggiunge i D1 in fondo: TOML valido.
  - `index.html` (zona importazione listini): `gemCall(body, lettore)` (con chiave sul telefono: flash/lite diretti a Google, `cf` → `{salta:true}`; dal server: risposta `lettore` solo se il server lo dice, altrimenti '' → mostrato «Gemini» generico, per non inventare). `GEM_LETT` (nome e ruolo), `gemNome`, `gemPerche` (testo SOLO dal codice HTTP vero), `gemLive` (banner `#gem-live`: ✗ lettore: motivo · secondi, ⏳ Legge X (ruolo) · contasecondi `#gem-sec`), `gemTick` (aggiorna solo il numero ogni secondo). `gemRun`: per ogni foto prova i lettori in ordine; passa al successivo con 429/500/502/503/504/524/404; si ferma subito con altri codici (403, chiave non valida); se tutti falliscono, errore con ogni lettore e il suo codice. Tolta la vecchia «seconda prova dopo `GEM_PAUSA`» (sostituita dalla catena; `GEM_PAUSA` resta dichiarata). `I.gnote` → `S.rev.lett` → riquadro `#rv-lett` «Chi ha letto le foto» in `reviewSheet`; `fonte` = «N foto lette».
  - APP_VER 68, CACHE `jona-ordini-v72`, NEWS v68 (chef + dev.aggiunte), riga v68 in CLAUDE.md.
  - `tools/test-gemini-server.mjs`: 59 controlli (nuovi: lettore lite/flash/pro/cf, Workers AI finto con 3040/4006/lento, formato messaggio, catena vecchia senza lettore; app: ordine flash,flash,lite,cf, errore con i 3 codici veri, nota «Flash-Lite dopo 503», banner dal vivo con contasecondi, server vecchio → «Gemini», riquadro «Chi ha letto», chiave sul telefono). Il finto `fbInit` ora ha `fs` (Proxy) perché durante l'attesa partiva un render.
  - Prove riuscite in locale (TZ=Europe/Rome): test-gemini-server 59, test-fatture 28, test-virgolette 16, test-news 94, test-listini-doppi 14, test-listini-prova 7, test-scaglione2 20, test-testbar 7, test-giro.
- Decisioni: l'app guida la catena (non il Worker) così il banner dal vivo dice la verità su chi lavora in quel momento; ogni richiesta resta sotto i 100 s di Cloudflare (E20). Scartato: banner con stima/tempo inventato; mostrare il messaggio inglese grezzo di Google (meglio il codice + traduzione fissa). Pro scartato (costi, Mario).

## Prossimo lavoro (#56), in ordine
1. **Pubblicare v68**: aprire PR da `claude/jona-sessione-56` (contiene `27a77fb`) verso `main`, attendere «Prove automatiche» verde, squash merge, controllare online (APP_VER 68) e che il workflow del Worker (`cloudflare-worker.yml`) sia verde (prima volta con `[ai]`: se il deploy fallisce per il binding AI, capire il motivo, avvisare Mario). Subito dopo: `git fetch origin main && git merge origin/main` nel ramo e push.
2. Tocca il Worker → **giro completo extra su GitHub** (workflow «Prove automatiche», workflow_dispatch modo `tutto`, E14) e dirlo a Mario in una riga.
3. Dire a Mario (breve, con immagine se serve) che la v68 è online: cosa vedrà mentre legge le foto. Proporre UNA idea nuova (regola SOLUZIONE SMART).
4. Chiudere la PR #78 senza unirla (state closed) e disiscriversi; gli strumenti `tools/prova-lettori.py` + `.github/workflows/prova-lettori.yml` sono solo sul ramo `claude/prova-lettori`: eventualmente portarli su main più avanti.
5. Poi D23 (più XML + `.p7m`), D24, D25, D26 (`docs/DA-FARE.md`).

## Consegne della #54 (in breve)
- Primo giro prova lettori (run 38033661843): Flash 7/8 foto perse per 503, Flash-Lite 20/20 (dopo correzione unità «K»), Cloudflare 403. Mario ha aggiunto al token Cloudflare Workers AI Read + Edit. Regola orari in ora italiana in CLAUDE.md.
- Prova lettori: `tools/prova-lettori.py` + `.github/workflows/prova-lettori.yml` (on pull_request, solo se cambiano quei file); PR bozza #78 «Prova lettori foto (bozza, NON unire)», ramo `claude/prova-lettori`. I push dalla sessione non fanno partire `on: push`.

## Consegne della #53 (in breve)
- «Migliore opzione gratuita» = secondo lettore Cloudflare Workers AI (D22). Mistral solo se Cloudflare legge peggio (ora non serve).
- Regole in CLAUDE.md: RISPOSTE CORTE, SOLUZIONE SMART rafforzata (3 strade ovvia/furba/geniale + 1 idea spontanea, controllare che non esista già). Già nell'app (non riproporre): avviso aumenti prezzi, dettatura vocale, QR/BarcodeDetector, link WhatsApp, ordine suggerito.
- Idee approvate da Mario: D24 (fornitore più conveniente nel carrello), D25 (foto bolla vs ordine), D26 (costo piatti da ricette); idea fatture da Gmail scartata → D23 (più XML + `.p7m`, oggi errore `p7m` in `impRun`).

## v67 nel dettaglio (index.html, tutto nella zona «importazione listini»)
- `GEM_HEAD = TEMPLATE_HEAD + ';quantita;importo'`: usato nel prompt e in `gemJoin` (che ora conosce entrambe le intestazioni). `TEMPLATE_HEAD` resta per modello CSV e segnaposto.
- `geminiPrompt` riscritto: stesso ordine del foglio senza saltare righe; fornitore = chi vende scritto in alto (DAC, F.lli Mariano, Nieddittas), mai il cliente/destinatario (ORMA DI CHEF LAI, Villa Carola); codice copiato com'è con gli zeri (040); nome com'è, virgolette comprese, via puntini e `#`/`*`; righe di continuazione (ECOLABEL, CLASSE A, nome scientifico, ALLEVATO FRANCIA) non sono prodotti; U.M. K./KG=kg, PZ=pz, CF=conf, CT=cartone, LT=l anche attaccata (`##PZ`); prezzo unitario con tutti i decimali, già scontato se c'è sconto; quantita = QUANTITÀ o PESO NETTO; importo = IMPORTO/IMPORTO NETTO; niente intestazioni, asterischi, totali, IVA; le spese si possono mettere (l'app le riconosce); cifra illeggibile = vuota.
- `mapRows`: colonna «prezzo» preferita (`iP0`), se no il vecchio regex (anche «importo» come prezzo, file vecchi invariati); `iQ` quantità, `iI` importo (solo se c'è «prezzo»); gli item hanno `q`, `imp`.
- Funzioni nuove prima di `guessSupplier`: `UNITA`/`normUnita` (applicata a tutti gli import), `pulisciNome` (solo `kind==='txt'`: incollato/Gemini), `isSpesa` (spese/consegna/trasporto/contributo/cauzione/imballo/nolo/porto/addebito/bancale/pallet a inizio nome; «Spezie», «Porro» no), `rigaNonTorna` (|q×prezzo − importo| > max(0,06; 1,5% importo)).
- `impRun`: righe con `spesa` (non selezionate), `q`, `imp`. `reviewSheet`: `chk(i)` calcolato a ogni disegno (se Mario corregge il prezzo l'avviso sparisce), banner `#rv-chk` «N righe da controllare», banner `#rv-spese`, pillole «da controllare: q × prezzo € non fa importo» (rossa) e «spesa, non è un prodotto».
- Quantità e importo NON si salvano nel prodotto (decisione: servono solo al controllo; il listino resta uguale).
- APP_VER 67, CACHE `jona-ordini-v71`, NEWS v67 (chef + `dev.aggiunte`; attenzione: chiavi valide `aggiunte`/`correzioni`/`risolti`, non `novita`).
- Prova nuova `tools/test-fatture.mjs` (28 controlli): trascrizioni a mano di DAC pag1 (11 righe, vitello con prezzo sbagliato apposta 5,936), Mariano (6 righe con 040/027/405), Nieddittas (4 righe con CDS), passate come 3 risposte finte di `gemCall` dentro `gemRun`; salvataggio di 20 prodotti; formati vecchi. Sul codice v66 fallisce (verificato). Aggiunta a `VELOCI` in `tools/prova-ci.sh` dopo test-virgolette.
- Riuscite in locale (TZ=Europe/Rome): test-fatture 28, test-virgolette 16, test-gemini-server 39, test-listini-doppi 14, test-listini-prova 7, test-scaglione2 20, test-news 94, test-testbar 7, test-giro.
- Non tocca il Worker: niente giro completo extra.
- Decisioni scartate: filtrare le spese togliendole del tutto (Mario non le vedrebbe: meglio senza spunta e avviso); normalizzare i nomi anche per Excel/XML (rischio di toccare file buoni); arrotondare i prezzi a 4 decimali (`num` tiene 3: basta per DAC; Nieddittas 2,0000 ok).
- Non fatto ancora (idee per dopo): controllo somma righe = «totale merce/imponibile» della fattura; prezzo mostrato con 3 decimali nel listino (`eur` ne mostra 2: 4,988 → 4,99 €, ma il valore salvato è giusto).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta. In attesa: M27 (screenshot «Controlla e salva» v67), M28 (commercialista → XML).

## Rischi aperti
- Gemini Flash sovraccarico (503) nelle ore di punta: Flash-Lite regge, ma un solo fornitore = un solo punto di guasto.
- Limiti gratuiti dei servizi IA cambiano spesso: riverificare sulle pagine ufficiali.
