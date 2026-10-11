# Passaggio di consegne (2026-10-11, fine sessione #78)

Sessione attuale: #79

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR: regola RAMO SINGOLO). App online: **v77** (PR #88 unita in #77, squash `49b9aba`, controllato `APP_VER=77` online).

## Fatto in #78 (11/10, ~8:40-9:30 ora italiana) — LAVORO A METÀ, NON ONLINE
- Unite due scorte (solo ULTIMO-MESSAGGIO), push confermati.
- Mario: «si vai avanti» = SÌ a **D26** (costo dei piatti dalle ricette). Studiato il codice, NIENTE ancora scritto per D26. Progetto deciso (da fare così):
  - `FUNZ` nuova `{id:'ricette',l:'Ricette e costo dei piatti',…,on:true}` accesa di partenza: cambiare `funzOn` (riga ~4924) in `k in funz ? !!funz[k] : !!FUNZ.find(..).on` (solo `funzOn` legge `cfg().funz`).
  - Dati `config/ricette` {tipo:'ricette', r:{<id>:{id,n,por,pv,ing:[{pid,nome,fid,pu,q,u,pz}],rif,rifG,da,cr,mod}}}; scrittura `upd('config','ricette',{'r.<id>':…})` (`put` se il doc non c'è, come `agPut`), cancellare = `r.<id>: null`. Nessuna regola Firestore nuova (`config` già permessa).
  - Unità: prodotto in kg → g/kg, in l → ml/l (q/1000), altrimenti l'unità del prodotto (`normUnita`). Prezzo: `D().prodotti[pid]`, se manca stesso `gkey` + stessa unità in `S.gidx` (prima stesso fornitore, poi il più economico), se no ultimo prezzo `pz` con avviso.
  - Costo a porzione = totale/porzioni; food cost % = costo / (prezzo di vendita / 1,10 IVA). «Costo salito» se ≥ `rif`×1,03; «Ok, visto» rimette `rif` e i `pz`.
  - Solo gestori (`isMgr`): icona `pot` in alto dopo `agBtn(me)` (riga ~2179, `rcBtn`), striscia `rcStrip(me)` dopo `agStrip(me)` (stile `.ag-strip.ag-nuovo`), fogli con `openSheet` (lista, modifica, selettore prodotti come `pickSheet` riga ~2827), azioni in `A`, campi in `IN` (`data-in`), select in `CH` (`data-ch`), campi classe `inp` (16 px). Prova nuova `tools/test-ricette.mjs` (modello `tools/test-conveniente.mjs`).
- Poi Mario ha mandato la foto del logo YNOY CORP **con 4 lune** («Rimetti questa nell'animazione di apertura app»). È uguale (stesso md5) a `docs/img/logo/vecchi/ynoy-coda-mario-2026-10-10.jpg`, già salvata (e nel Drive `Jona/Loghi/Vecchi`: Mario «dovresti trovarlo già tutto in drive»). La v75 l'aveva sostituito con quello a 3 lune. Fatto (commit sul ramo, NON online):
  - rimessi da `aed77cc^` (prima della v75): `media/ynoy.svg`, `media/ynoy.png`, la riga `  if(S.splash)` di index.html, `tools/logo-ynoy.py`, `tools/ynoy-html.py`, `tools/ynoy-tratti.py`, `tools/test-logo-nitido.mjs` (dopo la v75 nessuno li aveva toccati);
  - v78: `APP_VER=78`, voce NEWS v78 «Logo YNOY CORP con 4 lune», `CACHE` jona-ordini-v82.
  - Prove: `test-logo` OK, `test-news` OK, `test-apertura-v62` OK. **`test-logo-nitido` FALLISCE** (`page.evaluate: Event` alla riga 14: fetch/immagine nella pagina). Probabile: la versione di prima della v75 della prova non va più con il resto (v75 l'aveva cambiata in 4 righe: `git show aed77cc -- tools/test-logo-nitido.mjs`). Capire la causa: forse va tenuta la versione v75 della prova (`git checkout aed77cc -- tools/test-logo-nitido.mjs`) se controlla solo JONA. Poi `test-giro`, guardare la schermata di apertura a occhio (4 lune), PR dal ramo unico → squash → controllo online v78.

## Domanda aperta
- Nessuna. D26 approvata («si vai avanti»): farla DOPO aver pubblicato la v78 del logo.

## Fatto in #77 (11/10, 4:33-~5:15 ora italiana)
- PR #88 (v77, D25 bolla) con «prove» verde → squash merge, `main` unito nel ramo (conflitto solo nelle consegne, tenute quelle del ramo, E7), v77 online verificata. Detto a Mario cosa provare (M40).
- Unita la scorta (solo ULTIMO-MESSAGGIO).
- Messaggio di Mario (scritto in RVC #63, girato dalla #76): ramo singolo + Drive solo essenziale. Fatto:
  - CLAUDE.md «DRIVE IN ORDINE» (sostituisce D31 «Furba»): Drive solo cartelle in ordine, si carica solo l'essenziale che serve davvero a Mario + ciò che decide lui; mai file di lavoro né segreti.
  - Mario: «passa a spa le regole drive nuove» → mandata la regola alla sessione **SPA Sensorial #03** (`session_01QPVtwg4JKdF87sSmQjLT33`, repo `SPA-Sensorial-by-YNOY/spa-sensorial`, pallino 🔵), da adattare alla loro cartella. Nessuna risposta richiesta.
  - Doppio tocco: Mario ha scelto **«Solo ramo unico»**, confermato. CLAUDE.md: «RAMO SINGOLO» (sostituisce «RAMI IN ORDINE»), riga nel RAMO DEFINITIVO e «Pubblicazione: PR dal ramo unico → squash…». Le prossime PR si aprono con head `claude/jona-ramo-definitivo` verso `main`. Vecchi rami restano.
  - DA-FARE: D28 e D31 chiuse.
- Mario ha chiesto «resta altro?»: risposto con M40, M39, M34, M33 e domanda «parto con D26?» (senza risposta). Poi «d 30 non ho capito»: spiegato in parole semplici (spostamento del repo nell'organizzazione del ristorante, attesa della scatola nera per il vecchio indirizzo, poi Transfer che fa lui). Non deve fare niente ora.

## Fatto in #76 (11/10, 3:00-4:35 ora italiana)
- Unite due scorte (vecchie, solo `ULTIMO-MESSAGGIO.md`).
- Richiesta di Mario (girata dalla #75): «condividi la regola con RVC» → mandate D28 (rami) e D31 (Drive) a RVC #63 (`session_01BbQ5CHa4J1ii2dr5zYUxQ1`, attiva; #62 chiusa). **RVC #63 ha chiesto a Mario col doppio tocco: «No, lascia stare», confermato** → in RVC NON si copiano. D28/D31 per RVC chiuse in DA-FARE. Non riproporle.
- Avviso di RVC #62: la scorta salvava i messaggi di altre sessioni come «ultimo messaggio di Mario». Corretto anche in Jona: `<cross-session-message` in `AVVISI_DI_SISTEMA` di `.claude/hooks/scorta.py`, prova 3c-bis in `tools/test-scorta.py` (23 verdi). E34 in ERRORI.
- Mario ha scritto «si» nella #75 chiusa: ho rifatto la domanda qui col doppio tocco → scelta **D25 foto bolla**, confermata.
- **v77 (D25) pronta, PR #88**: in Arrivi → Controllo merce, dopo la foto della bolla compare «Confronta la bolla con l'ordine» (solo se Gemini è disponibile: `gemOn()`; `setBolla` chiama `gemSrvOk()` e tiene una copia più nitida `R.bolImg` con `shrinkImg`, solo in memoria). `bolLeggi` usa `geminiPrompt` + lettori `GEM_LETT` (flash → lite → cf) via `gemCall`, poi `parseTable`/`mapRows`. `bolMatch`: codice uguale senza zeri davanti (040 = 40), altrimenti parole del nome (`bolTok`, come `gkey`) con sovrapposizione ≥50%, assegnazione golosa, ogni riga della bolla una volta. Precompila SOLO le righe non toccate: quantità ≥95% → «c'è», meno → «meno» con la quantità, 0 → «manca»; non trovato → resta da toccare con «Non è sulla bolla» in rosso; righe in più (escluse spese, `isSpesa`) → «Sulla bolla ma non ordinati». Staff non vede prezzi. Salva `ricezione.bolla` {lett, righe:[{nome,codice,unita,q,prezzo,i}], extra, auto} e `prezziDiversi` (`bolPrezzoDiv`: stessa unità o senza unità sulla bolla, differenza ≥1%); avviso al gestore con «N prezzi diversi»; `bolRiga` nel controllo inviato (prezzo bolla rosso se diverso, solo `showPrices()`); pill «prezzo diverso» nella lista Arrivi per il gestore. CSS `.bol-r`, `.bol-ok`. `APP_VER=77`, NEWS v77 (tutti + chef + dev), `CACHE` v81. CLAUDE.md riga v77. Prova `tools/test-bolla.mjs` (22 controlli, anche TZ=Europe/Rome), aggiunta a `VELOCI`. Verdi: test-bolla, test-scaglione2, test-news, test-giro.
- Scelte tecniche: precompilare invece di decidere da sola (Gemini può saltare righe: chi riceve la merce resta l'ultimo controllo); niente «manca» automatico per righe non trovate; tolleranza 5% per i pesi (bolla 4,9 kg su 5 = ok). Scartata: confronto dei prezzi per lo staff (lo staff non vede i prezzi, E24).
- DA-FARE: tolta D25, aggiunta **M40** (Mario prova con una bolla vera alla prossima consegna).

## Fatto in #75 (11/10, 1:52-2:59 ora italiana)
- Unita la scorta. Script del Drive risponde **v2** (M38 fatta: tolta da DA-FARE).
- Riordino `Jona/Loghi` FATTO: sottocartelle `JONA`, `YNOY CORP` (Originale, Vettoriale, PNG alta risoluzione, Animazione, LEGGIMI.txt: spostate da «YNOY CORP 3 lune», più l'animazione caricata), `Vecchi` (gli 8 file sparsi + `docs/img/logo/vecchi/*`). La cartella «YNOY CORP 3 lune» è vuota. Il controllo automatico ha negato il cestino (`azione.sh cestina`, «Cloud Storage Mass Delete»): la cestina Mario a mano, ha risposto «nessun problema». Non riprovare il cestino. Link: https://drive.google.com/drive/folders/1ecGLASRvK65nJ2o5yyNprtZT-oVqHStq
- **D31 regola scelta da Mario: strada «Furba»** (doppio tocco confermato). Scritta in CLAUDE.md, «FILE IMPORTANTI ANCHE NEL DRIVE»: i file da tenere vanno da soli in `Claude Code Lavoro/Jona/<tema>`, poi do il link; mai codice, prove, appunti o segreti. Scartate: Ovvia (solo su richiesta), Geniale (caricamento automatico a ogni versione + PDF delle novità). Resta da dirla a RVC, insieme a D28.
- RVC: #60 e #61 sono chiuse. La #61 chiede a Mario di aprire **a mano** la RVC #62 (repo RVC, ramo `claude/rvc-ramo-definitivo`). Per ora nessuna sessione RVC attiva: non ho mandato messaggi.
- **v76 online (D23)**: in «Fattura elettronica XML» si scelgono più file insieme (`PICK.xml.multiple`). Si aprono anche i `.p7m` firmati: `p7mXml` legge la busta CAdES (DER, BER a lunghezza indefinita con pezzi, base64/PEM) e prende l'eContent. `xmlText` usa la codifica scritta nell'XML (UTF-8 o ISO-8859-1). I file rotti si saltano, con avviso e nome del file. Prova nuova `tools/test-p7m.mjs` (14 controlli) con file finti in `tools/fatture-prova` (firmati con openssl, certificato finto, nessuna chiave nel repo); aggiunta a `VELOCI` in `tools/prova-ci.sh`. Prove locali verdi: test-p7m, test-fatture, test-news, test-giro. «prove» su GitHub verde. Aggiunta **M39** (Mario prova con una fattura vera .p7m).
- Scelta tecnica: leggere la busta ASN.1 invece di cercare `<?xml` nel file. Così il testo spezzato in pezzi da 1000 byte (BER) non si rompe. Nessuna libreria esterna.

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni RVC
- RVC attiva: **#63** `session_01BbQ5CHa4J1ii2dr5zYUxQ1` (C16 scambio turno). #60-#62 chiuse. Prima: #60 (C33 dettatura Porter). Ha mandato a Jona il codice del filtro segreti. Le ho scritto (#72) di far incollare a Mario **Codice.gs v2** PRIMA del nuovo deployment dello script del Drive (lo script è UNO per Jona e RVC), e che il nuovo URL va in `JONA_DRIVE_URL` di tutti e due gli ambienti.
- Jona #75 `session_01QPzuujHhDE3xqGshobfAn3` e #76 `session_01Ada4vhK6uEQRyN1yrqjQTF` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.

## Prossimi passi (in ordine)
1. Finire e pubblicare la v78 (logo 4 lune, sopra): sistemare `test-logo-nitido`, `test-giro`, PR, squash, `main` nel ramo, controllo online.
2. Fare D26 (progetto sopra), v79.
3. Attendere Mario. M39 (fattura .p7m vera) e M40 (bolla vera): se manda foto o file, salvarli (solo senza dati sensibili) e usarli nelle prove (`tools/test-bolla.mjs`, `tools/test-p7m.mjs`).
3. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sopra).
5. Ponte con l'hotel: quando RVC ha D5, guida per `PONTE_KEY`. Elenco completo in `docs/DA-FARE.md`.

## Note tecniche
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…` (risposta JSON `{ok,link,cartella}`; per avere il link di una cartella si carica un file dentro). `cairosvg` e `potracer` vanno installati con pip a ogni sessione.
- Server locale `python3 -m http.server 8765`; Playwright `/opt/node22/lib/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini (cambierà dopo D30), `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare; chi ha ancora l'icona vecchia deve reinstallare (per questo l'attesa con la scatola nera).
- Repo privato: le prove su GitHub consumeranno minuti (2000/mese dell'organizzazione).
- URL del Drive: se finisse in un file pubblico, chiunque potrebbe caricare file nella cartella di Mario → in quel caso Mario fa un nuovo deployment e l'URL vecchio si spegne.

## Ultimo messaggio di Mario, parola per parola
«dovresti trovarlo già tutto in drive» (prima: «Rimetti questa nell'animazione di apertura app» con la foto del logo a 4 lune; prima ancora «si vai avanti» per D26).
