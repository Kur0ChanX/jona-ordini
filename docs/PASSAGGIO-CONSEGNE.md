# Passaggio di consegne (2026-10-10, fine sessione #56)

Sessione attuale: #57

Ramo di lavoro: `claude/jona-sessione-57` (all'handoff della #57 → `claude/jona-sessione-58`). App online: **v68** (PR #79 unita con squash, commit main `7ff2c34`, controllato online: `gem-live` presente, CACHE `jona-ordini-v72`; Worker e Pages verdi).

## Ultimo messaggio di Mario (#56), parola per parola
«Il problema è che se, se finisco l'account all'improvviso, se finisco il token all'improvviso, cioè tu no, no, non perdi, se, non spendi troppo token, eh, ogni, l'avviso di quello settimanale è fatto da 75%, da 75% fino al 100% ci sono tantissimi messaggi e ogni volta tu non salvi questa regola, ogni volta nelle, nel, nel, nel, nel, nel passaggio e non sprechi un sacco di token, non si riesce a trovare una nuova soluzione.

Ho mandato anche questo messaggio uguale al progetto RVC. Mettetevi d'accordo per lavorare insieme.»

## Domanda aperta a Mario (attendere la risposta, poi D27)
Gli ho proposto 3 strade (tabella in chat):
1. Ovvia: Claude fa commit+push dopo ogni passo quando il limite è in avviso (costa token, dipende dalla memoria di Claude).
2. Furba: hook «scorta» a zero token.
3. **Geniale (consigliata)**: la 2 + frase fissa nelle preferenze dei due account «riparti dal ramo col numero più alto» → al cambio account non serve preparare niente.
Domanda: «Mi dai l'ok per la strada 3? Rispondi "sì 3", oppure "2" o "1"». Se dice sì → costruire D27 (sotto).

### Progetto D27 (hook scorta), già pensato
- `.claude/hooks/scorta.py`, registrato in `.claude/settings.json`.
- UserPromptSubmit: scrive l'ultimo messaggio di Mario (campo `prompt` dello stdin JSON) in `.git/scorta-msg.md` (FUORI dal working tree: `git status` resta pulito, l'handoff non vede modifiche pendenti).
- Stop: indice temporaneo (`GIT_INDEX_FILE` in `.git/`) → `git add -A` (rispetta `.gitignore`, niente segreti) + `docs/ULTIMO-MESSAGGIO.md` iniettato con `hash-object -w` + `update-index --cacheinfo` → `write-tree`; se l'albero è uguale all'ultima scorta non fa niente; `commit-tree` con genitori HEAD e la scorta precedente (se diversa) → `git push origin <sha>:refs/heads/scorta/<ramo>` in background con timeout. Sempre fast-forward, niente force. Ramo di lavoro e app non toccati. I push dalla sessione non fanno partire workflow.
- `avvio-check.py`: se `origin/scorta/<ramo>` contiene commit non presenti nel ramo, lo segnala (e la sessione la unisce con `git merge`, fast-forward perché HEAD è antenato).
- Coordinamento RVC (sessione `session_01M9K5UqXKXCqWTSKRggCWw9`, «🟢 ▶ ATTIVA · #50 · RVC», ha proposto a Mario la stessa idea e attende il suo «via»): Jona scrive il file una volta, RVC lo copia identico (`git fetch https://github.com/Kur0ChanX/jona-ordini <ramo>`). Il mio messaggio a RVC è stato BLOCCATO dal controllo automatico dei permessi («Unauthorized Persistence»: hook che pusha da solo senza consenso esplicito di Mario). Quindi: prima il «sì» scritto di Mario, poi mandare il messaggio a RVC e costruire.
- Poi aggiornare `docs/CAMBIO-ACCOUNT.md` (sezione «Se i token finiscono di colpo» + testo Preferenze con la frase fissa) e la regola in CLAUDE.md (CAMBIO ACCOUNT: «push dopo ogni passo» sostituito dalla scorta automatica).
- Prova: script in `tools/` che crea un repo finto, simula UserPromptSubmit + Stop e controlla ramo scorta, messaggio, `git status` pulito, nessun push se niente cambia.

## Fatto in #56
- PR #79 (v68) aperta, «Prove automatiche» verde, squash merge, `main` unito nel ramo e pushato (`00f405c`). Worker (prima volta con `[ai]`) e Pages verdi.
- Giro completo extra su GitHub lanciato (workflow «Prove automatiche», `modo: tutto`, ref main, ~12:50 ora italiana): **controllare l'esito** (E14) e dirlo a Mario in una riga.
- PR #78 (bozza prova lettori) chiusa senza unirla. Nota: `tools/prova-lettori.py` e `.github/workflows/prova-lettori.yml` sono finiti su main con la v68 (erano nel ramo di lavoro): innocui (il workflow parte solo su PR che cambiano quei file). Sulla PR #79 è partito anche il job «prova» (prova lettori, usa quota Gemini): non bloccava il merge.
- Unito il ramo `ccr-c4aaeb72-tfz1na` (guida `docs/CAMBIO-ACCOUNT.md` aggiornata, regola CAMBIO ACCOUNT in CLAUDE.md, riga E23 in ERRORI.md). La catena «⚪ Servizio account» (#02, `session_01U6vJDxXtWf1quE4M8j74ks`, ramo `claude/servizio-sessione-02`) gestisce preferenze/memorie/piano dei due account: NON è lavoro di Jona. A Jona resta solo il «cambio account» quando Mario lo scrive qui.
- Limite settimanale (`seven_day`) in **avviso** in tutte le sessioni; si azzera mercoledì 14/10 alle 12:00 ora italiana.
- Detto a Mario che la v68 è online e cosa vede (banner «⏳ Legge Gemini Flash · 12 s», motivo vero se un lettore fallisce). Idea nuova SOLUZIONE SMART non proposta questa volta (risposta già lunga): proporla alla prossima occasione.

## Prossimo lavoro (#57), in ordine
1. Attendere la risposta di Mario sulla strada (1/2/3) e costruire D27; coordinarsi con RVC.
2. Controllare il giro completo su GitHub (rosso = priorità).
3. Poi D23 (più XML + `.p7m`), D24, D25, D26 (`docs/DA-FARE.md`).

## Ancora da chiedere
- M26 (prodotti finti spariti?), M25, D10: senza risposta. In attesa: M27 (screenshot «Controlla e salva» v67), M28 (commercialista → XML).

## Rischi aperti
- Gemini Flash sovraccarico (503) nelle ore di punta: ora c'è la catena Flash-Lite → Cloudflare.
- Limite settimanale in avviso: se finisce prima dell'hook D27, si riparte dal ramo col numero più alto (tutto è pushato).

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
