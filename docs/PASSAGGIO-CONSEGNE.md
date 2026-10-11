# Passaggio di consegne (2026-10-11, fine sessione #76)

Sessione attuale: #77

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v76**. **PR #88 (v77, D25) APERTA** dal ramo `claude/jona-v77-bolla` (stesso contenuto del ramo di lavoro a `ffe4590` + consegne): https://github.com/Kur0ChanX/jona-ordini/pull/88

## 🔴 Primo lavoro della #77
1. Controllare il check «prove» della PR #88 (nome minuscolo, E33). Se verde: squash merge, controllo online `APP_VER=77` su https://jona-ristorante-by-ynoy-corp.pages.dev/ , poi `git fetch origin main && git merge origin/main` nel ramo di lavoro e push (E7: conflitti solo negli appunti → tenere quelli del ramo di lavoro). Se rosso: capire la causa e correggere.
2. Dire a Mario che v77 è online e cosa provare (M40).

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
1. PR #88 (v77): vedi «Primo lavoro» in cima.
2. Attendere Mario. M39 (fattura .p7m vera) e M40 (bolla vera): se manda foto o file, salvarli (solo senza dati sensibili) e usarli nelle prove (`tools/test-bolla.mjs`, `tools/test-p7m.mjs`).
3. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sopra).
4. Lavoro «Claude da solo» già approvato: D26 (costo dei piatti dalle ricette). Proporlo a Mario.
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
«no lascia stare anche in jona digli di lasciare com era che c'era la regola del ramo singolo se non xrea problemi ed è ottimale per il drive solo ordine con cartelle e si carica solo l'essenziale che può servirmi veramente e basta e poi qll che devido io» (scritto in RVC #63, 4:25, girato dalla #76 alla #77). Fatto in #77: regola DRIVE IN ORDINE scritta e passata a SPA #03 (Mario: «passa a spa le regole drive nuove»); RAMO SINGOLO confermato col doppio tocco (anche le PR dal ramo unico).

Prima: «si» (scritto nella #75 chiusa, ~4:13, girato qui). Poi nella #76 ha scelto col doppio tocco «D25 foto bolla (Consigliata)» + «Sì, confermo il lavoro». Nessun messaggio dopo.
