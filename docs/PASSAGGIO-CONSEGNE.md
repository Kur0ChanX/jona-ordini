# Passaggio di consegne (2026-10-10, fine sessione #52)

Sessione attuale: #53

Ramo di lavoro: `claude/jona-sessione-53` (regola nuova: un ramo per sessione; all'handoff della #53 → `claude/jona-sessione-54`).

## Ultimo messaggio di Mario (#52), parola per parola
«controlla la migliore app per il nostro progetto e valuta i limiti imposti per caricamento foto

Metti come regola su Claude di cercare una soluzione smart se serve»

- Seconda parte FATTA in #52: regola «SOLUZIONE SMART» in `CLAUDE.md` (REGOLE TRASVERSALI, prima di «UNA DOMANDA PER VOLTA»).
- Prima parte DA FARE in #53 (non iniziata per l'handoff obbligatorio): vedi «Prossimo lavoro» punto 1.

Messaggio prima (#52): «non sò» (alla domanda «ricevi le fatture XML?») e «non sò se possiamo integrare chat gpt se la versione gratuita è migliore di gemini o se ci permette le api di caricare diverse foto e leggerle o possiamo metterle entrambe nel caso... non saprei aspetto la tua analisi».

## Fatto in #52
- **v67 online**: PR #77 verde (run 38030681005), squash `e66274c`, sito controllato (APP_VER=67, CACHE `jona-ordini-v71`). `main` unito nel ramo consegne (`1c05b06`), pushato. Disiscritto dalla PR #77, controllo di sicurezza cancellato.
- Arrivato dalla #51 (messaggio tra sessioni) la regola di Mario: pallino RVC 🟢 (prima 🟣), Jona 🟤; ramo nuovo a ogni handoff `claude/jona-sessione-<NN>` / `claude/rvc-sessione-<NN>` (già in CLAUDE.md, commit `a00f3cb`). Passato al ramo `claude/jona-sessione-52`. Rinominata la sessione RVC attiva in «🟢 ▶ ATTIVA · #47 · RVC …» (`session_011dwxsZScU2sWWPEAApFT3X`) e mandata la regola con il messaggio di Mario parola per parola (consegnato; quella sessione era ferma su una domanda a Mario). Le sessioni RVC chiuse restano 🟣 (non richiesto rinominarle).
- Analisi ChatGPT/alternative (BRAINSTORMING) mandata a Mario con immagine `docs/img/scelte/lettura-fatture-3-strade.png`: A XML (consigliata), B Gemini + secondo lettore gratis (Mistral o Groq, riga rossa se non coincidono), C ChatGPT (app gratis non collegabile; API OpenAI solo a pagamento, pochi centesimi a foto, non legge meglio di Gemini in modo dimostrato). Dato a Mario il testo da mandare al commercialista per avere gli XML (M28). Domanda aperta: «preparo intanto la strada B? Sì / No» — Mario ha risposto col messaggio sopra (= valuta tu la migliore e i limiti).
- Ricerca web fatta (fonti non ufficiali e in disaccordo): limiti gratuiti di Gemini Flash dichiarati tra ~100 e 1500 richieste/giorno, Pro tolto dal gratis ad aprile 2026; Mistral e Gemini non pubblicano più i limiti gratuiti (aspettarsi 429); OCR.space 25.000 richieste/mese gratis (OCR semplice, non tabelle); OpenAI: niente piano gratuito confermato. Da verificare sulle pagine ufficiali.
- `docs/DA-FARE.md`: D21 chiusa; nuove D22 (scelta strada lettura fatture) e M28 (commercialista → XML).

## Consegne precedenti (#51), ancora valide

## File ricevuti (#50, già committati)
- `docs/img/listini/`: `dac-fattura-054851-2026-09-01-pag1.jpg` (pag. 1 di 2, «SEGUE»), `dac-fattura-054851-2026-09-01.jpg` (pag. 2), `dac-fattura-252792-2026-09-08.jpg`, `dac-fattura-057162-2026-09-08.jpg`, `dac-fattura-065742-2026-10-06.jpg`, `dac-fattura-269380-2026-09-23.jpg`, `mariano-fattura-13960-2026-09-08.jpg` (F.lli Mariano, 24 righe), `nieddittas-fattura-5274-2026-09-22.jpg` (3 molluschi + consegna CDS).
- `docs/img/segnalazioni/v65-dac-controlla-1.jpg`, `v65-dac-controlla-2-gambero-vuoto.jpg`.
- Nessun file nuovo in #51.

## Fatto in #51
- **v66 online**: PR #76 unita (squash `35f2f3a`), sito controllato (APP_VER=66 con `curl -sL …/`, CACHE `jona-ordini-v70`). `main` unito nel ramo consegne (merge `5fd968c`) e pushato. Nota: `curl` senza `-L` su `/index.html` dà vuoto (Cloudflare Pages reindirizza a `/`).
- **Giro completo dopo la v65** (run 38029278135, workflow_dispatch `tutto`): **verde**.
- **v67 «lettura fatture più precisa»**: ramo `claude/v67-fatture` (commit `99a1390` + merge di main `b04161b`), **PR #77** aperta ~06:21 UTC, «Prove automatiche» in corso (run 38030681005). Dettagli sotto.
- `docs/DA-FARE.md`: D20 → D21 (v67 PR #77), M27 riscritta per la v67. `CLAUDE.md`: riga «Import listini» con v66/v67 (commit `00eaf0b`).
- Iscrizione eventi: tolta la PR #76, messa la PR #77 (questa sessione); **la #52 deve iscriversi alla PR #77** (`subscribe_pr_activity` Kur0ChanX/jona-ordini 77). Il controllo di sicurezza delle 07:00 UTC (trigger `trig_01Eu85BrBvLRaw1orAUZ9Eoc`) è stato cancellato all'handoff: la #52 ne arma uno suo se serve.

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

## Alternative a Gemini (risposta a Mario, da sviluppare con lui)
Gemini non è l'unico punto debole: con la v67 una lettura sbagliata dei numeri si vede (riga rossa), non passa più in silenzio. Strade gratuite proposte:
1. **Fattura elettronica XML** (consigliata): in Italia le fatture tra aziende passano tutte dallo SDI; l'XML ha codici, descrizioni, unità e prezzi esatti, zero errori di lettura. L'app la importa già (`parseFatturaPA`). Si scarica gratis dal cassetto fiscale (Agenzia delle Entrate → «Fatture e Corrispettivi») o la manda il commercialista; Nieddittas lo scrive in fondo alla fattura. Lavoro possibile: import di più XML insieme e dei file firmati `.p7m` (oggi danno errore `p7m`: si può estrarre l'XML dentro dal browser).
2. **Due lettori invece di uno**: Gemini + un secondo servizio di visione gratuito (da verificare oggi prezzi/limiti: es. Cloudflare Workers AI con un modello vision nel piano gratuito, Groq, Mistral OCR, OpenRouter modelli free). Si confrontano i numeri: dove non coincidono, riga rossa. Più affidabile, più lavoro sul Worker.
3. **Controlli in più senza IA**: somma delle righe = totale della fattura; prezzo molto diverso dall'ultimo a listino (es. +/- 40%) → avviso; foto fatte bene (foglio piatto, luce, pagina intera). OCR sul telefono (Tesseract.js) scartato come lettore principale: con tabelle fotografate legge peggio di Gemini.
Raccomandazione data: XML come strada principale per le fatture, Gemini + controlli per listini di carta e WhatsApp. Per CLAUDE.md, alla scelta mandare a Mario un'immagine di confronto (non fatto in #51 per l'handoff obbligatorio).

## Prossimo lavoro (#53), in ordine
1. **Richiesta di Mario**: «la migliore app per il nostro progetto e i limiti per il caricamento foto». Modalità SOLUZIONE SMART: controllare sulle pagine UFFICIALI (oggi) piano gratuito e limiti di: Gemini (Flash e Flash-Lite: richieste/minuto, /giorno, dimensione immagini), Mistral (OCR / Pixtral, piano «Experiment»), Groq (modelli vision Llama), OpenRouter (modelli `:free` con vision), Cloudflare Workers AI (modelli vision, neuroni gratis al giorno: vantaggio, già nel nostro Worker), OpenAI (per completezza, a pagamento). Per ognuno: foto per richiesta, peso massimo, richieste/giorno, serve carta?, dati usati per addestramento? Poi stimare il nostro uso (quante foto/settimana) e proporre UNA scelta con immagine di confronto (tabella colorata, come `lettura-fatture-3-strade.png`). Se possibile provare davvero sulle 8 foto in `docs/img/listini/` confrontando con le trascrizioni a mano di `tools/test-fatture.mjs` (serve una chiave: Cloudflare Workers AI si può usare dal Worker senza account nuovo).
2. Aspettare: screenshot di «Controlla e salva» con la v67 (M27) e risposta del commercialista (M28).
3. Chiedere se vede v64-v67 nelle Novità (vista Sviluppatore o Admin Chef, E21).
4. Poi `docs/DA-FARE.md` (D17 ponte RVC, D14…).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta.

## Rischi aperti
- Gemini vero non provato con il prompt v67 (niente chiave qui).
- Limiti gratuiti dei servizi IA cambiano spesso: ogni scelta va riverificata sulle pagine ufficiali.
