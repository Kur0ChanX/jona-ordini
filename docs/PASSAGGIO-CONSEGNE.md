# Passaggio di consegne (2026-10-10, fine sessione #54)

Sessione attuale: #55

Ramo di lavoro: `claude/jona-sessione-55` (all'handoff della #55 → `claude/jona-sessione-56`). App online: v67 (nessuna versione nuova in #53 e #54).

## Ultimo messaggio di Mario (#54), parola per parola
«posso provare l app hai fatto?»

- Risposta data: non c'è ancora una versione nuova da provare; online resta la v67. La v68 (secondo lettore) si costruisce dopo il risultato della seconda prova.

## Fatto in #54
- Iscritto alla PR #78. **Primo giro della prova lettori** (run 38033661843, finito 9:19 ora italiana): Gemini Flash 7 foto su 8 rifiutate con 503 «high demand» (sovraccarico), 1 foto letta in 59 s; **Gemini Flash-Lite 20/20 prezzi giusti** (lo script diceva 16/20 perché non contava l'unità «K» come kg: corretto in `tools/prova-lettori.py`, l'app la capisce già con `UNITA`), 79/79 righe coerenti q×prezzo=importo, 0 errori, 17 s in tutto. Cloudflare: **403** sul catalogo modelli (token senza permesso Workers AI). Risposte grezze scaricate (artifact 11663288382, scade): Flash-Lite legge bene anche Mariano (24 righe con 040/027) e Nieddittas (codice ostrica «60 V A COCKTAIL PZ» strano, CDS = consegna).
- Il Worker `/gemini` (`worker/src/index.js` ~riga 375, `GEM_MODELS` riga 140) passa GIÀ a Flash-Lite con 429 **e 503**: oggi l'app non si sarebbe bloccata, solo più lenta.
- Immagine risultato `docs/img/scelte/prova-lettori-risultato.png` mandata a Mario.
- Mario ha aggiunto al token Cloudflare (quello del segreto `CLOUDFLARE_API_TOKEN`) i permessi Account › Workers AI › **Read** e **Edit** e ha fatto **Update token** (confermato da lui). Gli ho spiegato: la scritta gialla «Origin CA Key (Deprecated)» nella pagina API Keys non ci riguarda; non toccare Change/View della Global API Key.
- Domanda di Mario: «basta caricare le foto nell'app?» → sì, controlli automatici, niente caricamento su cloud a mano.
- **Secondo giro della prova** (con permessi Cloudflare): `claude/prova-lettori` portato con fast-forward a `6ae7527`, run **38034926723** partito 9:35 ora italiana, ancora in corso all'handoff (dura più del primo: probabile che Cloudflare stia rispondendo).
- Regola nuova di Mario in `CLAUDE.md` (COMUNICAZIONE, «ORARI IN ORA ITALIANA»): orari sempre in ora italiana (Olbia), mai UTC. Ottobre fino al 25: UTC+2.
- Commit della #54: `6ae7527` (immagine + script), `e2b025f` (regola orari), consegne.

## Fatto in #55
- **Secondo giro prova lettori** (run 38034926723, 9:35→10:00, artifact 11663702836): permessi Cloudflare OK. Gemini Flash-Lite 20/20, 0 errori, 17 s; **CF `@cf/meta/llama-4-scout-17b-16e-instruct` 19/20**, 0 errori, 72 s (Nieddittas 2/3; coerenti 61/68); Gemini Flash 6/6 ma 2 foto perse per 503, 376 s; CF qwen3.8 13/20 (398 s), mistral-small-3.1 11/20, gemma-4 0 righe (risposta non in formato: da non usare). Immagine `docs/img/scelte/prova-lettori-risultato-2.png` mandata a Mario.
- Piano v68 proposto: ordine Flash-Lite → Flash → CF Llama 4 Scout (ripiego).

## Prossimo lavoro (#55), in ordine
1. Leggere il run 38034926723 (`list_workflow_jobs` → `get_job_logs` job, artifact `prova-lettori` per le risposte grezze). Iscriversi alla PR #78 (`subscribe_pr_activity` Kur0ChanX/jona-ordini 78). Se ancora 403: guida a Mario per il token giusto (forse ha modificato un altro token: chiedere il nome del token che usa GitHub). Mandare a Mario UNA immagine breve (orari italiani!).
2. Decisione tecnica (mia, poi spiegata a Mario con le 3 strade ovvia/furba/geniale): idea **furba** = mettere `gemini-flash-lite-latest` per primo in `GEM_MODELS` (stesso esito nel test, 15× più veloce, meno 503) con Flash come riserva; **geniale** = secondo lettore Cloudflare in parallelo e confronto numeri → riga rossa; ovvia = Cloudflare solo come ripiego dopo Gemini. Prima di cambiare l'ordine valutare un secondo giro di Gemini Flash (oggi non misurabile per il 503). Per Cloudflare nel Worker: `[ai] binding = "AI"` in `wrangler.toml` (aggiunto dal workflow come per D1), `env.AI.run(modello, …)`.
3. v68 → tocca il Worker → giro completo extra su GitHub dopo (E14). Aggiornare i Worker finti delle prove se cambia `/gemini`.
4. Chiudere la PR #78 senza unirla quando la prova è finita (strumenti di prova su main con la v68, trigger con `paths`).
5. Poi D23 (più XML + `.p7m`), D24, D25, D26 (`docs/DA-FARE.md`).

## Consegne della #53 (storia)

### Ultimo messaggio di Mario (#53), parola per parola
«prova la migliore opzione gratuita per ora

mi raccomando come regola non scrivere poemi ahahhaahahah attenzione ai token ma si chiaro. poi se devi spiegarmi qualche guida che devo fare manuale per me va bene anche senza un forte limite di caratteri cosí è piú chiaro per me con link e passaggi vari molto chiari»

- Regola salvata in `CLAUDE.md` (COMUNICAZIONE → «RISPOSTE CORTE»): risposte brevi; le guide manuali possono essere lunghe con link e passi.
- «Migliore opzione gratuita» = secondo lettore Cloudflare Workers AI (D22). Prova vera IN CORSO, vedi sotto.

### Prova lettori (preparata in #53)
- `tools/prova-lettori.py` + `.github/workflows/prova-lettori.yml` (on pull_request verso main, solo se cambiano questi 2 file). I push dalla sessione NON fanno partire workflow con `on: push` (provato: niente run) e un workflow nuovo non si lancia a mano finché non è su main → si usa una PR bozza.
- **PR #78 «Prova lettori foto (bozza, NON unire)»**, ramo `claude/prova-lettori` (= ramo consegne al commit `9d41691`). Run «Prova lettori foto» **38033661843** partito 07:13 UTC (anche «Prove automatiche» 38033661795 gira, è normale).
- Lo script: prompt preso da `geminiPrompt` in index.html; foto ridotte a 2000 px; lettori: Gemini `gemini-flash-latest`, `gemini-flash-lite-latest` (segreto GEMINI_API_KEY), Cloudflare via `/accounts/<acc>/ai/v1/chat/completions` con id presi da `/ai/models/search`: gemma-4-26b-a4b-it, mistral-small-3.1-24b-instruct, llama-4-scout-17b-16e-instruct, qwen3.8-27b. Punteggio: righe giuste (codice+unità+prezzo) su 3 fatture trascritte (DAC pag1 11 righe con vitello 15,936 vero, Mariano 6, Nieddittas 3) + righe coerenti q×prezzo=importo su tutte le 8 foto + errori + secondi. Tabella nel riassunto del run (`GITHUB_STEP_SUMMARY`) e nel log; risposte grezze nell'artifact `prova-lettori`.
- Da fare: leggere il risultato (`get_job_logs` del run, o `actions_list list_workflow_jobs 38033661843`). Possibili intoppi: token Cloudflare senza permesso Workers AI (403 → guida a Mario: dash.cloudflare.com/profile/api-tokens → modifica token → aggiungi Account › Workers AI › Read/Edit), id modello non trovato (stampato «-> None»), 429 Gemini. Se serve ripetere: cambiare lo script e pushare su `claude/prova-lettori` (la PR riparte da sola).
- Poi: mandare a Mario UNA immagine con il risultato (breve!) e, se Cloudflare legge bene, costruire v68: secondo lettore nel Worker (`[ai] binding` in wrangler.toml, `/gemini` → ripiego su Workers AI con 429/504 + confronto numeri → riga rossa). Tocca il Worker → giro completo extra su GitHub dopo (E14). Il miglior modello CF lo dice la prova.
- Alla fine: chiudere la PR #78 (state closed, NON unire), cancellare niente; tenere gli strumenti di prova (eventuale ingresso su main con la v68, togliendo il trigger o lasciandolo con paths).
- La #53 si è disiscritta dalla PR #78: **la #54 deve iscriversi** (`subscribe_pr_activity` Kur0ChanX/jona-ordini 78).

### Fatto in #53
- Analisi lettori (pagine ufficiali 10/10/2026), immagine `docs/img/scelte/lettore-foto-confronto.png`: Gemini free sì (limiti solo in AI Studio, dati usati da Google, 20 MB a richiesta, 258 token ogni riquadro 768 px; a pagamento ~1 cent a foto). Cloudflare Workers AI: 10.000 neuroni/giorno gratis (gemma-4-26b ≈ 55 neuroni a foto → ~150-180 foto/giorno; qwen3.8 ~500). OpenRouter :free 20/min, 50/giorno. Groq vision solo qwen3.8-27b, max 3 foto. Mistral: limiti gratis non pubblici, usa i dati, serve telefono; Mistral OCR 4 ~4 $/1000 pagine (fonti non ufficiali, <1 €/mese per noi). OpenAI niente gratis.
- Mario: «mi offri poche alternative smart innovative geniali». Regola SOLUZIONE SMART rafforzata in CLAUDE.md: 3 strade (ovvia/furba/geniale) + raccomandazione; 1 idea nuova spontanea per l'uso del momento; controllare che non esista già. Già nell'app (non riproporre): avviso aumenti prezzi, dettatura vocale, QR/BarcodeDetector, link WhatsApp, ordine suggerito.
- 4 idee (immagine `docs/img/scelte/idee-nuove-ottobre.png`). Mario: «le fatture arrivano nell'app è difficile devo chiedere e arrivano tardi al massimo carico io file il resto va bene 2 3 4 / che dici mettiamo mistral?» → idea 1 scartata (D23 diventa: più XML insieme + file `.p7m`, oggi errore `p7m` in index.html ~riga 1620); approvate D24 (fornitore più conveniente nel carrello), D25 (foto bolla vs ordine), D26 (costo piatti da ricette). Mistral: proposto Cloudflare prima, Mistral (a pagamento, pochi centesimi) solo se Cloudflare legge peggio → Mario: «prova la migliore opzione gratuita per ora».
- Ordine dei lavori deciso da me: 1 secondo lettore (dopo la prova), 2 D23 p7m/più XML, 3 D24, 4 D25, 5 D26.

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
