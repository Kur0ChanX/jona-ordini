# Passaggio di consegne (2026-10-12, fine sessione #110)

Sessione attuale: #111

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Stato all'handoff: **v96 nella PR #106** (vedi SUBITO 1). v95 online (controllato: `APP_VER` 95 su https://jona-ristorante-by-ynoy-corp.pages.dev/). Nel ramo: `APP_VER` 96, `CACHE` `jona-ordini-v100`.

## ✅ SUBITO (#111)
1. 🔴 **PR #106 (v96, D45)**: aperta in #110 alle 13:06. Controllare il controllo «prove» sull'ultimo commit della PR. Se VERDE e non ancora unita: squash (titolo «v96: foto del vino su iPhone non fa più ripartire l'app (D45)»), `git fetch origin main && git merge origin/main` nel ramo + push, controllo online `APP_VER` 96 su https://jona-ristorante-by-ynoy-corp.pages.dev/. Se ROSSO: log con `mcp__github__get_job_logs`, guardare soprattutto `test-foto-vino` e `test-dispositivi` su WebKit (Mac/iPhone/iPad). Se `createImageBitmap` con `resizeWidth` fallisce su WebKit, riserva = `loadImg`. (Lo stato preciso al momento dell'handoff è scritto sotto in «Fatto in #110».)
2. Poi dire a Mario in poche righe: v96 online → riprovare Cantina → **Fotografa una bottiglia** sull'iPhone; se l'IA passa a Flash-Lite ora la scheda scrive il motivo vero («Letto da … Prima: … (errore N)»). Già detto a Mario in #110: Lite parte solo se Flash dà un errore; dalla v96 il motivo si vede.
3. **D46 fatta in #110** (commit `8e83b4d`): guardare che `test-dispositivi` sia verde su GitHub nella PR (prima volta che gira con WebKit su iPhone 15, iPad gen 7, Desktop Safari). Se WebKit trova problemi d'aspetto veri → correggerli (sono difetti dell'app su Apple).
4. Dopo: difetto 18 (Americano: arancia e scorza sovrapposte) e proposta SMART cocktail «bellissimi» (vedi «Idee»). Mario #102: «la nuova schiuma mi piace quello stile».
5. Mario (#106): **«pubblica ogni tanto gli aggiornamenti»**: una versione online appena un pezzo è pronto.
6. Mario prova D44 (v93) e D43 (passaggi dei cocktail) quando può.

## Fatto in #110 (12/10, ~13:05-13:25 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO con la domanda «Lite», già nota), push.
- **PR #106** aperta dal ramo verso `main` (v96 D45), prove partite 13:06.
- Messaggio dalla #109: dopo l'handoff Mario ha scritto solo «ok» (nessuna richiesta nuova).
- Mario in #110: «via» → ho continuato con D46 mentre giravano le prove.
- **D46** `tools/test-dispositivi.mjs`: lancia `test-giro.mjs` in processi separati con `GIRO_DEV` (nomi dei dispositivi di Playwright separati da «|», contesto `{...devices[nome], deviceScaleFactor:1}`): Chromium «Pixel 7|Galaxy Tab S4», WebKit «iPhone 15|iPad (gen 7)|Desktop Safari» (SALTATA in locale, FAIL su GitHub senza WebKit). PC già coperto da `test-giro-computer` (1280/1440). In `VELOCI` di `tools/prova-ci.sh`. Locale: PASS Android (2 min), `test-giro` normale ancora PASS. Riga in CLAUDE.md (regola dispositivi) e D46 in DA-FARE.
- Commit D46 NON pushato durante le prove (E39); l'hook di fine risposta lo chiedeva a ogni messaggio: normale, si ignora finché le prove girano.

## Fatto in #109 (12/10, ~12:55-13:15 ora italiana)
- Avvio: scorta vecchia (12:33, superata) registrata con `git merge -s ours` + push; poi la #108 ha mandato un messaggio (domanda «Lite») e un commit `2dec221` → merge normale.
- **v96 D45** (piano della #108 seguito, commit `a87ab1c`, `09a2b11` + correzione commento):
  - `index.html` vicino a `shrinkImg`: `jpgInfo` (orientamento EXIF + misure dai primi 512 KB), `FP_T` (trasformazioni 5-8), `fotoPiccola(file,max=2000,mini=0)` → {b File JPEG .85, mini dataURL .7}; `createImageBitmap` con `resizeWidth` solo per orientamenti 1 e 5-8 non quadrate; bitmap troppo grande → `loadImg`; bitmap coricata → giro a mano; `finally` chiude bitmap, svuota `im.src` e tela. `shrinkImg` = `fotoPiccola(file).then(r=>r.b)` (aiuta listini, bolla, agenda). Scelta: orientamenti 2-4 restano su `Image` perché non si può capire se la bitmap li ha applicati (rari).
  - Vino: `vnFotoAdd` async (una per volta, «Preparo la foto…» con `f.ld`), tiene `{file: blob piccolo, url: miniatura}`, `VN_PIC` WeakSet → `vnIaGo` non le rimpicciolisce di nuovo; niente più `createObjectURL`.
  - Bozza: `jona_vn` {f,t,cam,u} (ls, con «demo:» in demo) + IndexedDB `jona-kv` chiave `vn_fotos` (`idbKv`, `VN_IDB`), `vnBozza(cam,conF)`, `vnBozzaFoto`, `vnBozzaVia`; `vnFoto` scrive `cam:true` prima del picker; `onClose` di `vnForm` → `f.chiusa`, `S.vnf=null`, bozza via; `vnRestore()` dopo `regRestore()` in `boot` (aspetta splash/dati/utente max 20 s, 30 min, stesso utente, `funzOn('cantina')`, `vnCan`), nota `.vn-rip` + «Galleria» nella prima riga; picker `cancel` e `visibilitychange` (nascosta → bozza; tornata con picker ancora aperto dopo 2,5 s → `cam:false`).
  - Lettori: `vnIaGo` salva `f.lg` [{l,st}] e `f.lt`; nel riquadro «L'IA sta…» le righe ✗ con `gemPerche`; dopo la lettura `.vn-lt` «Letto da … Prima: …»; `errLog('Vino: <lettore> non ha letto (errore N) …')`.
  - Prova nuova `tools/test-foto-vino.mjs` (in `VELOCI`), foto `tools/foto-prova/vino-or6.jpg` (4000×3000, EXIF 6, metà rossa/blu). Controllo nuovo in `test-cantina` (503 → «Letto da Gemini Flash-Lite» + scatola nera).
  - NEWS v96, `APP_VER` 96, `CACHE` v100, riga v96 in CLAUDE.md, D45 in DA-FARE, E47 in ERRORI.
- Prove sul computer di lavoro (Chromium PC, Pixel 7, Galaxy Tab S4; WebKit SALTATA): test-foto-vino 36 PASS, test-cantina 54, test-bolla 23, test-fatture 28, test-agenda 61, test-news 94, test-testbar 13 (prima FAIL per «Mario» in un commento `//` nuovo → tolto, lezione già in #105), test-giro PASS.

## Fatto in #108 (12/10, ~12:34-12:55 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO), poi il ramo su GitHub aveva un commit in più della #107 (consegne): merge normale, push confermato.
- Titolo sessione messo. PR #105 (v95): prove partite 12:34, verdi 12:51 → squash `1cdc755`, `main` riunito nel ramo (`eff415d`).
- D45 analizzato (piano sopra). Ricerche: report di app iOS che ripartono dopo la fotocamera per memoria (Capacitor/WebKit 206219/198751); `createImageBitmap` con `resizeWidth` da Safari 15 (caniuse); bug WebKit 237895 (`createImageBitmap` da Blob non gira la foto secondo l'EXIF).
- Handoff fatto per il contesto pieno (avviso dell'hook).

## Fatto in #107 (12/10, ~12:15-12:45 ora italiana)
- **Collaudo a RVC e SPA** (sì di Mario in #106): mandato con `send_message` il modello adattato di `.claude/agents/collaudo.md` a RVC #92 `session_01Mc34LWsJw9PKUiUJvYcPxB` (con nota repo privato: niente giri su GitHub salvo richiesta) e SPA #14 `session_016iyo14hpB7Qq4UWfhfCqgV`. Consegnato (delivered); lo creano loro nel loro repo. Nota E45 inclusa.
- **v95 difetti dei disegni (#101)** in `tools/bar-disegni.mjs`:
  - `COLX` nuovi: Kir `#D8687A`, Kir Royal `#C2385A`, Blue Lagoon `#2E8ED6`, AMF (Adios) `#3A9FD8`, White Port Tonic `#F0DC98`, Oaxaca `#C27A2C`, Russian Spring Punch `#B23A5E`, El Diablo `#9C2C4C`, Mirto Spritz `#7C2848`, Bramble `#8C2244`, Espresso Tonic `#E6E0CC`, Woo Woo `#E8607E`, Cape Codder `#A8142C`, Stinger `#C88A3C`, Arnold Palmer `#A8682E`; White Russian `#7A5236`.
  - `LAY`: White Russian panna `['#F7F2E8',0,.46,.97]` (era 0-.3), Espresso Tonic caffè sopra `['#3A2418',0,.34,.95]` (le bollicine spariscono: strato da 0, voluto).
  - `wavy` (onda della schiuma) color `--vetro2` invece di `--ink2` grigio (Illegal, Gin/Amaretto/Pisco Sour).
  - Painkiller: dopo i colori `TIKI`, `COL.Painkiller = viv('#E2A65E')` (crema/arancio).
  - Fiamma della scorza fiammata attaccata: `flame(.6, -6.2)` (era `flame(9,-9)`, staccata).
  - Bloody Maria: il sedano oggi è già a posto (destra del lime), niente da fare.
  - **Bug trovato (E46)**: la v94 ha reso `c[6]` di `data/cocktail.json` una lista di passaggi; il generatore leggeva lì la preparazione e rifacendo i disegni 31 cocktail perdevano/guadagnavano il ghiaccio («shaker senza ghiaccio», «filtra»). Soluzione: `tools/cocktail-frasi.json` (212 vecchie frasi, prese da `81921b5~1:data/cocktail.json`), letto dal generatore; cocktail nuovo senza frase → passaggi uniti. Confronto prima/dopo: cambia solo l'Espresso Tonic (voluto). Scartato: cambiare le regole per leggere i passaggi (rischio di spostare altri disegni).
  - Peso `bar-disegni.json` compresso 29.192 (< 30.000).
- `tools/test-bar-disegni.mjs`: 4 controlli nuovi (colori per tinta: Kir/Kir Royal/Bramble/… rossi, Blue Lagoon/AMF blu, Stinger/Arnold Palmer/Oaxaca ambra; schiuma senza `--ink2`; White Russian e Espresso Tonic con strato; ghiaccio in White Russian, Gin Fizz, Hurricane, Russian Spring Punch, Mai Tai). **72 PASS** (anche TZ Roma).
- Aiutante `collaudo` (ora si carica col nome): test-bar-disegni, test-bar, test-news, test-giro tutte PASS.
- NEWS v95 «Bar: colori dei cocktail più giusti», `APP_VER` 95, `CACHE` v99, riga v95 in CLAUDE.md, D42 in `docs/DA-FARE.md`, E46 in `docs/ERRORI.md`.
- Foto mandate a Mario: 4 foto prima/dopo (16 cocktail, 780 px, scratchpad: non salvate nel repo). Script: per ogni nome `SOLO="<nome>" DSF=2 node tools/bozze/griglia-cocktail.mjs out.png 150` (il «prima» da una copia in scratchpad con index.html e data di `HEAD~`), poi PIL due colonne PRIMA/DOPO, 4 cocktail per foto.

## Fatto in #106 (riassunto)
- v93 (PR #103) e v94 D43 passaggi dei cocktail (PR #104, squash `81921b5`) online. Dettagli nella riga v94 di CLAUDE.md e nei commit.

## Fatto in #105 (riassunto)
- PR #102 v92 (FAIL di `test-testbar` per un commento con il nome del creatore → corretto in `(#101)`). v93 D44 dalle bozze `tools/bozze/d44-*.py`; vista «Bar» nella barra Test (`VIEW_AS.bar`, barista vede Bar e Cantina, ordina e invia allo chef). Lezione: controllare `test-testbar` anche dopo commenti nuovi nel codice.

## Fatto in #103-#104 (riassunto)
- #104: D44 progettata in bozza. Context7 aveva finito la quota mensile gratuita: usare la ricerca web o chiedere a Mario una chiave gratis su context7.com/dashboard.
- #103: regola di stile applicata ai pezzi dei cocktail (`c`/`cf`/`cp` col tono scuro del pezzo, `LEGNO`), tazza di rame dei Mule (`rm|`, `sf|`, `oc`), niente `badge`, cannuccia e ombrellino, agrumi con albedo e `twist`. Dettagli nella riga v92 di CLAUDE.md e nella storia dei commit.

## Idee (da #100)
- **SMART per cocktail «bellissimi»** (Mario «non bellissime… mi accontento»): UNA strada più ambiziosa, con bozza ferma e domanda (E19/E38). Spunti: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati, tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #100-#102 (riassunto)
- Stile C dei cocktail, panna `cream`, `spiral`, bollicine nei calici, arco della Piña Colada, elenco dei 21 difetti. Dettagli nella riga v92 di CLAUDE.md e nei commit.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite. Fino alla risposta resta «− Venduta».

## Prossimi lavori
1. SUBITO sopra.
2. Idee per il Bar (solo se utili): «Cocktail della casa», costo del cocktail dal prezzo delle bottiglie, foto della bottiglia letta dall'IA.
3. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura.

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #110 `session_01QbaaAWWe28daKawzaaSb87` (chiusa), #109 `session_01N97sLf9HZ1a5TGP2TnTRsD` (chiusa), #108 `session_019f4wJG2gdxbuqrEvomUcYx` (chiusa), #107 `session_018zMHKEtsWAECS8Kf4wLjhw` (chiusa), #106 `session_019NMEenGwfWR4T8nH4n1bTV` (chiusa), #105 (chiusa, id nelle consegne di #105 nella storia), #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc`, #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#92** `session_01Mc34LWsJw9PKUiUJvYcPxB`. SPA attiva: **#14** `session_016iyo14hpB7Qq4UWfhfCqgV` (nomi da ricontrollare con `list_sessions` prima di mandare messaggi).
- Ponte con l'hotel: RVC dice che **D5 non è fatto**. M42 5stelle: si aspettano le risposte della reception (in RVC).

## Note tecniche
- Foto per Mario (script persi con lo scratchpad, si rifanno in 2 minuti): Playwright `createRequire('/opt/node22/lib/node_modules/')`, `deviceScaleFactor:2`: `/#demo` → `[data-a="demoGo"]` → `nav [data-a="tab"][data-v="fornitori"]` → `main [data-a="brOpen"]` / `main [data-a="vnOpen"]`; schede Cantina `.sheet [data-a="vnV"]`, Bar `[data-a="brV"][data-v="inv"]`; riga Negroni = `getByText('Gin · Campari · Vermouth rosso')`. Tema scuro: `document.documentElement.dataset.theme='dark'`.
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (java c'è).
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare (per questo l'attesa con la scatola nera).
- URL del Drive: se finisse in un file pubblico, Mario fa un nuovo deployment.

## E38 (aperto)
Risposte a tocco arrivate senza che Mario toccasse (#85). Finché non è chiaro: domande scritte nel testo, risposta a parole.

## Ultimo messaggio di Mario, parola per parola
(12/10/2026 ~13:12 ora italiana, #110) «via» → continuato: pubblicazione v96 e D46.
Prima (12/10/2026 ~13:09, nella #109 chiusa, dopo l'handoff) «ok».
Prima, in #109 Mario non aveva scritto (sessione partita dal prompt della #108).
(12/10/2026 ~13:00, scritto nella #108 dopo l'handoff) «dopo il problema segnalato nella chat precedente ho notato che la foto del vino viene passata per gemini lite? ma perché??? non quello normale?» → SUBITO 0-ter.
Prima:
(12/10/2026 ~12:55 ora italiana, #108) «no si è tiavviata l'app dall:iphone da sola dopo aver caricato la foto scattata quindi scattaesso ok e riavviata l'spp da sola» → lo scatto va bene, l'app riparte dopo aver ricevuto la foto: confermata la causa «foto a grandezza piena» (SUBITO 0).
Prima:
(12/10/2026, nella #107 chiusa) «sì, mandala anche a RVC e SPA» → regola dei dispositivi mandata a RVC #92 e SPA #14.
Prima:
(12/10/2026, nella #107 chiusa) «le prove ricordati vanno fatte sempre su pc mac tablet , telefoni android e iphone e ipad» → regola in CLAUDE.md + SUBITO 0-bis.
Prima:
(12/10/2026, scritto nella #107 già chiusa, dopo l'handoff) «correggi nel iphone quando scatta a un vino dopo la foto si riavvia l'applicazione» → SUBITO 0.
Prima, in #107 Mario non aveva scritto (sessione partita dal prompt di avvio della #106).
(12/10/2026 ~12:05 ora italiana, #106) «ok» (risposta alle 2 domande scritte nel testo: collaudo anche a RVC e SPA = sì; sistemare i difetti rimasti nei disegni dei cocktail = sì).
Prima (#106, 11:35): «ok poi vai con la D43  comunque pubblica ogni tanto gli aggiornamenti» (fatto: v94 online).
Prima (#106, 11:33): «quanto tempo resta?» (risposto).
Prima (#105, ~11:05): «ok poi pubblica direttamente» (v92 e v93 pubblicate). Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
