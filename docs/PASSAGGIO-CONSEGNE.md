# Passaggio di consegne (2026-10-10, fine sessione #57)

Sessione attuale: #58

Ramo di lavoro: `claude/jona-sessione-58` (all'handoff della #58 → `claude/jona-sessione-59`). App online: **v68** (main `7ff2c34`). Nessuna versione nuova in #57.

## Ultimo messaggio di Mario (#57), parola per parola
«Autorizzo Claude a creare l'hook .claude/hooks/scorta.py, a registrarlo in .claude/settings.json e a fargli fare push automatici sui rami scorta/<ramo> di jona-ordini e rvc.»
(Prima aveva risposto «si» alla strada 3. Dopo l'ultimo messaggio è arrivata solo la conferma di RVC #50, che ha passato i file alla RVC #51.)

## Fatto in #57
- **D27 scorta automatica, FATTA e attiva** (strada 3 scelta da Mario). Il controllo automatico dei permessi aveva bloccato la scrittura dell'hook con il solo «si» (Self-Modification). Ho chiesto a Mario la frase di autorizzazione esplicita e lui l'ha scritta (sopra). Senza quella frase un hook che fa push da solo non passa: tenerlo a mente per RVC e per hook futuri.
  - `.claude/hooks/scorta.py`: `msg` (UserPromptSubmit) salva il prompt in `.git/scorta-msg.md`; `stop` (Stop) usa un indice temporaneo `.git/scorta-index` (read-tree HEAD + `add -A`, rispetta `.gitignore`) più `docs/ULTIMO-MESSAGGIO.md` → write-tree. Se l'albero è uguale e HEAD è già dentro, non fa niente. `commit-tree` con genitori HEAD + scorta precedente (se non è già antenata) → `refs/scorta/<ramo>` locale e push in background (`timeout 60`) su `scorta/<ramo>`. Sempre in avanti, mai forzato. `JONA_SCORTA_NOPUSH=1` = niente push.
  - `.claude/settings.json`: aggiunti UserPromptSubmit «scorta.py msg» e Stop «scorta.py stop».
  - `avvio-check.py`: `controlla_scorta()` fa fetch di `scorta/<ramo>`. Se ha commit che il ramo non ha → avviso «SCORTA: … git merge origin/scorta/<ramo>, poi git push».
  - Prova `python3 tools/test-scorta.py` (16 controlli, repo finti). Non è in `prova-ci.sh` (lì solo `.mjs` dell'app).
  - **Verificato dal vivo**: `scorta/claude/jona-sessione-57` è comparso su GitHub (`57ed1fa`) già nella stessa sessione.
  - Documenti: `docs/CAMBIO-ACCOUNT.md` (sezione «Se i token finiscono di colpo» + riga nuova nelle Preferenze), CLAUDE.md (regola CAMBIO ACCOUNT: la scorta si aggiunge, commit+push dopo ogni passo resta), DA-FARE (D27, M30 nuova).
  - Fatto nuovo: GitHub (tramite il proxy) accetta push su `scorta/*`, ma **non lascia cancellare rami remoti** («Everything up-to-date»). È rimasto `scorta/prova-permesso` (= `dc607f3`, innocuo). Mario può cancellarlo da https://github.com/Kur0ChanX/jona-ordini/branches oppure lasciarlo.
  - RVC: mandato messaggio alla RVC #50. Risposta: chiusa, file passati alla RVC #51 con le consegne. A Jona non resta niente da fare per RVC.
- Giro completo su GitHub (run 38046156932, main v68, partito alle 12:47) **ancora in corso** quando ho chiuso (dura ~25 min). **Controllarlo per primo** (E14) e dirlo a Mario in una riga. La sveglia delle 13:19 l'ho cancellata (sarebbe arrivata alla sessione chiusa).
- Il nuovo ramo `scorta/claude/jona-sessione-58` nascerà da solo alla prima risposta della #58.

## Prossimo lavoro (#58), in ordine
1. Esito del giro completo: https://github.com/Kur0ChanX/jona-ordini/actions/runs/38046156932 (rosso = priorità).
2. D23 (più XML + `.p7m`), poi D24, D25, D26 (`docs/DA-FARE.md`).
3. Proporre a Mario un'idea SOLUZIONE SMART (non fatta né in #56 né in #57).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta. In attesa: M27 (screenshot «Controlla e salva» v67), M28 (commercialista → XML), M29/M30 (account Hotmail e preferenze).

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00. Ora c'è la scorta, e commit+push dopo ogni passo resta.
- Gemini Flash sovraccarico (503) nelle ore di punta: catena Flash-Lite → Cloudflare.

## v68 (in breve, dettagli nella riga v68 di CLAUDE.md)
Worker: `LETTORI` {flash, lite, cf}, `leggiCf` (Workers AI), errori `{codice,motivo,lettore}`. App: `gemRun` prova `GEM_LETT` in ordine per ogni foto, banner `gemLive`/`gemTick`, `gemPerche` solo da codici veri, riquadro «Chi ha letto le foto». Prova `tools/test-gemini-server.mjs` (59 controlli).

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
