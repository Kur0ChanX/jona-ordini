# Passaggio di consegne (2026-10-12, fine sessione #108)

Sessione attuale: #109

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Stato all'handoff: **v95 ONLINE** (PR #105 verde alle 12:51, squash `1cdc755`, `main` già riunito nel ramo con merge normale). `APP_VER` 95, `CACHE` `jona-ordini-v99`. Controllo online di `APP_VER` 95 su https://jona-ristorante-by-ynoy-corp.pages.dev/ ancora da fare (il deploy parte da solo dopo lo squash).

## ✅ SUBITO (#109)
0. 🔴 **BUG iPhone foto del vino (D45) → v96**. Mario (#108, 12:5x): «no si è riavviata l'app dall'iphone da sola dopo aver caricato la foto scattata quindi scatta esso ok e riavviata l'app da sola» = lo scatto va bene, l'app ripartisce DOPO aver ricevuto la foto («Usa foto»). Quindi la causa principale è la foto tenuta a grandezza piena, non la fotocamera. Stesso bug già visto con la foto profilo (NEWS v46: «la foto profilo veniva aperta a grandezza piena (fino a 48 MP) e Safari ricaricava la pagina», risolto con `createImageBitmap` + `resizeWidth`).
   - Codice oggi (index.html ~5739-5750): `vnFoto` → `pickFile` → callback `vnForm(null)` + `vnFotoAdd(fs)`; `vnFotoAdd` mette `{file, url:URL.createObjectURL(file)}` e `vnFotoH` mostra `<img src=url>` = foto da 12-48 MP decodificata intera (48-192 MB) e tenuta nella pagina anche quando si apre la fotocamera per il retro. `vnFotoGo` → `vnIaGo(f.fotos.map(x=>x.file))` → `shrinkImg` (~3311, `new Image()` piena + tela mai svuotata). Listini (`gemAdd` 3315) e bolla (3096) rimpiccioliscono SUBITO con `shrinkImg`: solo il vino tiene l'originale.
   - **Piano deciso in #108** (scelte tecniche mie, niente domande a Mario):
     a. Helper nuovo `fotoPiccola(file,max=2000,mini=0)` vicino a `shrinkImg`: legge dall'intestazione JPEG (primi 128 KB, `DataView`) orientamento EXIF (tag 0x0112) e misure (marcatore SOF); se JPEG con orientamento 1 o 5-8 e non quadrato → `createImageBitmap(file,{resizeWidth,resizeQuality:'high'})` (Safari ≥15 la supporta; NON fidarsi che giri la foto: bug WebKit 237895) → se la bitmap è più grande di quanto chiesto (opzioni ignorate) → strada `Image`; se l'orientamento non è stato applicato (bitmap orizzontale ma serve verticale) → giro a mano sulla tela (trasformazioni classiche: 5 `(0,1,1,0,0,0)`, 6 `(0,1,-1,0,h,0)`, 7 `(0,-1,-1,0,h,w)`, 8 `(0,-1,1,0,0,w)`, tela h×w). Altri casi (PNG, 2-4, quadrate) → `new Image()` (gira da sola). Uscita: JPEG .85 lato lungo ≤2000 + miniatura `mini` (dataURL ~240 px). Dopo l'uso SEMPRE `bm.close()` e tela `width=height=0` (Safari ha un tetto alla memoria delle tele). `shrinkImg` usa lo stesso helper (stesso errore `{code:'img'}`) → aiuta anche listini, bolla, agenda.
     b. `vnFotoAdd` async: una foto per volta → `fotoPiccola(x,2000,240)`; tiene solo `{b:blob piccolo, url:mini}` (niente più objectURL: togliere i `revokeObjectURL` in `vnFotoDel`/`vnFotoVia`); `VN_PIC=new WeakSet()` dei blob già piccoli; `vnIaGo` fa `b64(VN_PIC.has(x)?x:await shrinkImg(x))` (la prova di test-cantina ~riga 117 chiama `vnIaGo` con File PNG veri: deve restare valida).
     c. Bozza per quando il telefono chiude l'app (come `jona_reg`/`regRestore`): `jona_vn` in localStorage {f campi senza fotos/busy/bl, t, cam, u utente} scritto in `vnFoto` prima del picker (`cam:true`; con `nuovo` f=null), dopo `vnFotoAdd` (`cam:false`) e su `visibilitychange` nascosto (tiene `cam`); foto piccole in IndexedDB (helper `idbKv(k,v)` db `jona-kv`, chiave `vn_fotos` con prefisso `demo:` in DEMO, valori {a:ArrayBuffer,m:mini}). Evento `cancel` del picker → `cam:false`. `onClose` del foglio del vino → `f.chiusa=true` + cancella bozza (vale anche per Salva, Elimina, doppione). Avvio: `vnRestore()` dopo `regRestore()` in `boot` (~6275), aspetta `!S.splash && allLoaded() && meU()` (max 20 s), entro 30 min, stesso utente, `funzOn('cantina')`, `vnCan(me)` → `vnForm(d.f)`, rimette le foto, `f.rip='cam'|'si'` → nota `.vn-al` nel foglio: con `cam` «Il telefono ha chiuso l'app mentre c'era la fotocamera. Ho ripreso la scheda: rifai la foto. Se succede ancora: scatta con la Fotocamera del telefono, poi qui tocca «Galleria».» + pulsante «Galleria» nella prima riga (solo con `rip`); senza `cam` «Il telefono aveva chiuso l'app: ho ripreso la scheda del vino». Bozza vuota (niente nome, foto né cam) → ignorata.
     d. Prova nuova `tools/test-foto-vino.mjs` (aggiungerla a `VELOCI` di `tools/prova-ci.sh`): file di prova JPEG 4000×3000 con EXIF orientamento 6 (metà sinistra rossa, destra blu; fatto con PIL e salvato in `tools/foto-prova/`) → copia 1500×2000 verticale con il rosso in alto; miniatura `data:image/jpeg` ≤240 px; foto mandata a Gemini ≤2000 px; `createImageBitmap` finto che ignora le opzioni o l'orientamento (`imageOrientation:'none'`) → risultato giusto lo stesso; bozza: nome scritto + foto → ricarica → foglio ripreso con nome e foto; picker aperto senza foto + ricarica → nota «fotocamera» e «Galleria»; bozza vecchia di 31 min → niente; Chiudi → bozza cancellata (localStorage e IndexedDB). Matrice dispositivi (regola D46): Chromium desktop, `Pixel 7`, `Galaxy Tab S4`, WebKit `iPhone 15`, `iPad (gen 7)`, `Desktop Safari` (WebKit solo su GitHub: in locale «SALTATA» come `test-giro-safari`). Prove legate: test-cantina, test-bolla, test-fatture, test-agenda (foto), test-giro.
     e. v96: NEWS (staff: «iPhone: la foto del vino non fa più ripartire l'app»), `APP_VER` 96, `CACHE` v100, riga v96 in CLAUDE.md, D45 in `docs/DA-FARE.md`, E47 in `docs/ERRORI.md` («foto del vino tenuta a grandezza piena: stesso errore della foto profilo v46 → ogni foto nuova passa da `fotoPiccola`»). Poi PR, prove verdi, squash, online, dire a Mario di riprovare (Cantina → **Fotografa una bottiglia**).
   - Nessuna riga di codice scritta in #108 (solo analisi): si parte da zero.
0-bis. **Prove su tutti i dispositivi** (regola D46 in CLAUDE.md): giro con la matrice PC, Mac, tablet Android, telefono Android, iPhone, iPad dentro `test-giro` o prova nuova `test-dispositivi`, in `tools/prova-ci.sh veloce` e `prove.yml` (WebKit già installato lì). Dopo la v96.
1. Dire a Mario in 2 righe che la v95 è online (colori dei cocktail) dopo il controllo di `APP_VER` 95.
2. Dopo: difetto 18 rimasto (Americano: fetta d'arancia e scorza di limone sovrapposte sul bordo) e proposta SOLUZIONE SMART per cocktail «bellissimi» (vedi «Idee»: bozza ferma + domanda a tocco con doppio tocco, E19/E38). Mario #102: «la nuova schiuma mi piace quello stile».
3. Mario (#106): **«pubblica ogni tanto gli aggiornamenti»** = non accumulare: una versione online appena un pezzo è pronto e provato.
4. Mario prova la D44 (v93) quando può e la D43 (Fornitori → Bar → un cocktail → passaggi numerati).

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
- Jona #108 `session_019f4wJG2gdxbuqrEvomUcYx` (chiusa), #107 `session_018zMHKEtsWAECS8Kf4wLjhw` (chiusa), #106 `session_019NMEenGwfWR4T8nH4n1bTV` (chiusa), #105 (chiusa, id nelle consegne di #105 nella storia), #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc`, #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
