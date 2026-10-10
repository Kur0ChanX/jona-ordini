# Passaggio di consegne (2026-10-10, fine sessione #58)

Sessione attuale: #59

Ramo di lavoro: `claude/jona-sessione-59`. App online: **v68** (main `7ff2c34`). Nessuna versione nuova in #57 e #58.

## Ultimo messaggio di Mario (#58), parola per parola
«guarda tutti i servizi che abbiamo utilizzato sui due progetti uno Jonah e uno RVC che mi sono registrato e fammi un file scaricabile che lo tengo sempre con me con che cosa ho utilizzato che insomma se devo rimettere se devo riaprire un progetto ho tutto salvato a prova di stupido creami un file per piacere che me lo salvo e me lo custodisco»

## PRIMA COSA DA FARE (#59): il file dei servizi per Mario
- Fare un file scaricabile (PDF consigliato, più HTML) «a prova di stupido» con TUTTI i servizi usati da Jona e da RVC: a cosa serve, account/email, nome del progetto, link diretto, segreti (solo DOVE stanno, mai il valore), come riaprire il progetto da zero.
- **Non salvarlo in `jona-ordini`**: il repo è PUBBLICO e contiene email. Salvarlo nello scratchpad e mandarlo con `SendUserFile` (display attach). Eventuale copia solo nel repo RVC (privato), chiedendo prima.
- Dati già raccolti in #58:
  - Jona: GitHub **Kur0ChanX** `jona-ordini` (pubblico). Cloudflare NUOVO: Pages + Worker `jona-notifiche`, `invito`, D1 `jona-allegati-0..3`, Workers AI; sottodominio `jona-ristorante-by-ynoy-corp`; app https://jona-ristorante-by-ynoy-corp.pages.dev/. Cloudflare VECCHIO: resta `fruguponte` (non toccare), da cancellare `invito` e `jona-notifiche` (M15). Firebase progetto `jona-ordini` (Firestore + accesso anonimo, regole `firebase/firestore.rules`). Gemini (Google AI Studio): chiave nel segreto GitHub `GEMINI_API_KEY` → segreto Worker `GEMINI_KEY`. Open-Meteo (meteo, senza account). Segreti GitHub: vedi `.github/workflows/*.yml` (`grep -o 'secrets\.[A-Z_]*'`). **Email di Cloudflare (nuovo e vecchio), Firebase e Gemini NON scritte da nessuna parte**: chiesto a Mario in #58, senza risposta → nel file lasciare la riga da compilare a mano.
  - RVC: GitHub organizzazione **RVC-Operation-by-YNOY-CORP** (posseduta dall'account personale di Mario), repo `RVC` privato. Firebase e Cloudflare **non ancora creati** (RVC D5): email scelta relaisvillacarola.operation@gmail.com. Clone in sola lettura fatto in #58 in `/home/user/rvc` (sparisce col contenitore: rifare `add_repo` read + `git clone --depth 1`). Guardare anche `worker/wrangler.toml`, `docs/APP.md`, `docs/PROGETTO.md` di RVC.
  - Claude: mario.miscera@gmail.com (Pro, in uso) + account Hotmail (Pro, riserva).

## Fatto in #58
- Giro completo su GitHub (run 38046156932, main v68, partito alle 12:47): finito alle 13:12 **VERDE (success)**, già detto a Mario. Prima di chiudere la #58 risultava (strano: di solito ~25 min). **Controllarlo**: https://github.com/Kur0ChanX/jona-ordini/actions/runs/38046156932 (rosso = priorità; bloccato da troppo = guardare i job). Dirlo a Mario in una riga.
- Messaggi dalla #57 (chiusa): Mario ha cancellato `scorta/prova-permesso`; può cancellare anche `claude/prova-lettori` (PR #78 chiusa) e `claude/v63-listini-prova`. Nota tolta da D27 in DA-FARE.
- Domanda di Mario sui due GitHub: confermato che Jona sta su `Kur0ChanX` e RVC su `RVC-Operation-by-YNOY-CORP`, tutti e due visibili collegando **Kur0ChanX**. Aggiunta la nota in `docs/CAMBIO-ACCOUNT.md` (passo 2, con link per installare l'app Claude sull'organizzazione RVC se non compare). Detto a Mario cosa si salva al cambio account (codice e consegne su GitHub, scorta automatica; chat vecchie no; preferenze a mano) e che un account aziendale si può fare (i progetti stanno su GitHub), costa di più: se ne parla se vuole.
- `scorta/claude/jona-sessione-58` contiene solo `docs/ULTIMO-MESSAGGIO.md` del messaggio d'avvio: non unito, innocuo.
- **E12 di nuovo**: questa sessione è a «lineage depth 8»: niente `send_later`, niente sessione nuova. Mario apre la #59 a mano da https://claude.ai/code con il prompt di 3 righe.

## Prossimo lavoro (#59), in ordine
1. File dei servizi (sopra).
2. (Giro completo: verde, niente da fare.)
3. D23 (più XML + `.p7m`), poi D24, D25, D26 (`docs/DA-FARE.md`).
4. Proporre a Mario un'idea SOLUZIONE SMART (non fatta in #56-#58).

## Ancora da chiedere
- Email dei servizi di Jona (sopra). M26 (prodotti finti spariti?), M25, D10: senza risposta. In attesa: M27, M28, M29/M30.

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00: commit+push dopo ogni passo (c'è anche la scorta).
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
