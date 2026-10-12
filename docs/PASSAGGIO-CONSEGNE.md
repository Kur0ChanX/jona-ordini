# Passaggio di consegne (2026-10-12, fine sessione #107)

Sessione attuale: #108

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Stato all'handoff: **v94 ONLINE, v95 PRONTA** (commit `225dd67` + consegne) e **PR della v95 aperta** dalla #107 subito dopo il push di queste consegne (numero: guardare le PR aperte). `APP_VER` 95, `CACHE` `jona-ordini-v99`.

## ✅ SUBITO (#108)
0. 🔴 **BUG iPhone (Mario, 12/10 dopo l'handoff, scritto nella #107 chiusa)**: «correggi nel iphone quando scatta a un vino dopo la foto si riavvia l'applicazione». Cantina → **Fotografa una bottiglia** (v93, D44): dopo lo scatto l'app installata su iPhone ripartisce da capo. Ipotesi da verificare (#107 ha solo guardato il codice, niente prove): `vnFotoAdd` (index.html ~riga 5741) tiene il file originale della fotocamera (12-48 MP) e mostra le miniature con `URL.createObjectURL(file)` a piena risoluzione → iOS decodifica foto enormi e, con la fotocamera aperta sopra l'app installata, chiude la pagina per memoria → al ritorno la ricarica. Rimedi da valutare insieme: (a) rimpicciolire SUBITO ogni foto (es. `shrink(file,1600)` già in index.html ~riga 1172, o `createImageBitmap`) e tenere solo il blob piccolo per miniature e IA; (b) salvare la bozza prima di aprire la fotocamera (come `jona_reg` della registrazione, stesso problema già risolto lì) e riaprire la scheda del vino dopo un riavvio; (c) foto già lette salvate in IndexedDB. Prova nuova (es. in `tools/test-cantina.mjs`: foto grande 4000×3000 → miniatura e invio piccoli; bozza ripresa dopo ricarica). È un bug dell'app in uso: viene PRIMA della v95 se le prove della PR #105 non sono ancora verdi; altrimenti pubblicare la v95 e poi correggere come v96.
0-bis. **Prove su tutti i dispositivi (regola nuova di Mario, in CLAUDE.md «PROVE SU TUTTI I DISPOSITIVI»)**: oggi esistono solo `test-giro` (Chromium 320/390), `test-giro-safari` (WebKit, solo GitHub) e `test-giro-computer` (1280/1440). Da fare: un giro con la matrice PC, Mac, tablet Android, telefono Android, iPhone, iPad (descrittori `devices` di Playwright, `hasTouch`/`isMobile`) dentro `test-giro` o una prova nuova `test-dispositivi`, in `tools/prova-ci.sh veloce` e `prove.yml` (WebKit già installato lì). La correzione D45 va provata su tutta la matrice. Domanda a Mario ancora senza risposta (scritta nel testo, E38): «La regola la mando anche a RVC e SPA Sensorial?».
1. **Pubblicare la v95**: aspettare il controllo `prove` sulla PR aperta (NON pushare sul ramo mentre gira: E39), poi squash, controllo online (`APP_VER` 95 su https://jona-ristorante-by-ynoy-corp.pages.dev/), poi `git fetch origin main && git merge origin/main` + push. Se `prove` è rosso: capire la causa e correggere. Poi dire a Mario in 2 righe che la v95 è online (le foto prima/dopo le ha già ricevute in #107).
2. Dopo la v95: difetto 18 rimasto (Americano: fetta d'arancia e scorza di limone sovrapposte sul bordo) e proposta SOLUZIONE SMART per cocktail «bellissimi» (vedi «Idee»: bozza ferma + domanda a tocco con doppio tocco, E19/E38). Mario #102: «la nuova schiuma mi piace quello stile».
3. Mario (#106): **«pubblica ogni tanto gli aggiornamenti»** = non accumulare: una versione online appena un pezzo è pronto e provato.
4. Mario prova la D44 (v93) quando può (Cantina → **Fotografa una bottiglia** → fronte → **Fotografa il retro** → **Leggi le 2 foto con l'IA**) e la D43 (Fornitori → Bar → un cocktail → passaggi numerati).

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

## Fatto in #106 (12/10, ~11:15-12:05 ora italiana)
- Avvio: scorta vecchia (ULTIMO-MESSAGGIO 10:43) unita con `git merge -s ours` (teneva il messaggio più nuovo), push. Al riavvio della sessione (12:0x) altra scorta (solo ULTIMO-MESSAGGIO 11:35) unita con merge normale.
- v92 controllata online. **v93 pubblicata**: PR #103, `prove` verdi (partite 11:18), squash `8353476`, `main` riunito nel ramo, online `APP_VER` 93.
- **v94 D43 passaggi dei cocktail** (PR #104, squash `81921b5`, online 11:58): `tools/cocktail.txt` campo 6 = passi dai file `tools/d43-passi/parte1..4.txt` (212/212, 3-5 passi ciascuno, separati da « / »; intestazione del file aggiornata); `tools/cocktail.py` divide i passi e controlla 3-5 non vuoti → `data/cocktail.json` `c[6]` lista (98 KB, 16,7 KB compressi; si scarica solo aprendo il Bar). `index.html`: in `brCk` `Array.isArray(c.p)` → `<ol class="br-ol">` (CSS: cerchietti `--lagoon`/`--on-lagoon`, righe `--line`), altrimenti la vecchia `.br-pas`. NEWS v94 «Bar: passaggi numerati», `APP_VER` 94, `CACHE` v98, riga v94 in CLAUDE.md, D43 in `docs/DA-FARE.md` → fatto. Prove: `test-bar` 38 PASS (3 nuove: 4 passi del Negroni in `.br-ol`, cerchietto dentro lo schermo, testo), `test-news`, `test-bar-disegni`, `test-giro` «nessun problema», `prove` su GitHub verdi.
- Foto mandate a Mario: Mojito e Negroni con i passaggi (scratchpad, non salvate nel repo; script: `/#demo` → `demoGo` → Fornitori → `brOpen` → `#brq` → riga → `.br-ol` in vista; chiudere con `.sheet [data-a="closeSheet"]` `.last()`: ce ne sono due).
- Mario ha chiesto «quanto tempo resta?» durante le prove: risposto con l'ora di partenza delle prove (11:18) e la durata solita (~15 min + 3 per pubblicare).

## Fatto in #105 (riassunto)
- PR #102 v92 (FAIL di `test-testbar` per un commento con il nome del creatore → corretto in `(#101)`). v93 D44 dalle bozze `tools/bozze/d44-*.py`; vista «Bar» nella barra Test (`VIEW_AS.bar`, barista vede Bar e Cantina, ordina e invia allo chef). Lezione: controllare `test-testbar` anche dopo commenti nuovi nel codice.

## Fatto in #103-#104 (riassunto)
- #104: D44 progettata in bozza. Context7 aveva finito la quota mensile gratuita: usare la ricerca web o chiedere a Mario una chiave gratis su context7.com/dashboard.
- #103: regola di stile applicata ai pezzi dei cocktail (`c`/`cf`/`cp` col tono scuro del pezzo, `LEGNO`), tazza di rame dei Mule (`rm|`, `sf|`, `oc`), niente `badge`, cannuccia e ombrellino, agrumi con albedo e `twist`. Dettagli nella riga v92 di CLAUDE.md e nella storia dei commit.

## Idee (da #100)
- **SMART per cocktail «bellissimi»** (Mario «non bellissime… mi accontento»): UNA strada più ambiziosa, con bozza ferma e domanda (E19/E38). Spunti: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati, tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #102 (riassunto)
- Avvio: scorta (vuota) unita, push confermato.
- `tools/bar-disegni.mjs`: `cream(g)` = panna montata (strato `q` bianco sul liquido + nuvola piena a 3 gobbe, linee in `vd`/`vf` color vetro), usata da `pm|` (ingrediente «panna montata») e dalla guarnizione `panna` (Irish Coffee: l'arco nero era la vecchia guarnizione con `L()` = senza riempimento). `spiral` = nastro `ribbon(segs, 1.5, 5)` pieno con bordo `vf` (prima: tratto giallo + linea nera). Menta pestata `ml|`: solo colore. `flakes` (cocco): ombra crema invece del contorno. Bollicine `b|`: nei bicchieri `COPPA` posizioni in proporzione tra superficie e fondo della coppa (prima finivano sul gambo); `VETRO` ora `/^(i|it|b|dm|ft|vp|r)\|/` (sale/zucchero del bordo color vetro); cristalli del bordo come un solo path (quadratini e rombi) per il peso; `joinX` porta anche `vd`/`vf`; `ribbon` ha il parametro `n` (campioni per tratto).
- `tools/test-bar-disegni.mjs`: 2 controlli nuovi (panna/menta/spirale senza contorno nero; bollicine dentro il liquido con `isPointInFill`), verificati: FAIL sul file vecchio, PASS sul nuovo. 64 PASS.
- NEWS v92: nota dev aggiornata (#101-#102). Foto `docs/img/sessione-102/prima-dopo-1..2.png` mandate a Mario (Batida/frullati, Irish, Bombardino, Horse's Neck, Mojito, Spritz, Margarita, Bellini).

## Fatto in #101 (riassunto)
- Arco della Piña Colada: `VETRO` con `dm|ft|vp` (cupola dei frullati, schiuma alta, vapore color vetro), cupola più bassa e piena. Guarnizioni misurate con Playwright (`getBBox`) e rimesse dentro (sopra max 5, lati 2, pezzi alti rimpiccioliti `id~0.75`); `.br-ckbig{margin:12px 0 10px}`. Controlli nuovi in `test-bar-disegni`. Elenco dei 21 difetti (sopra).

## Fatto in #100 (riassunto)
- Stile C (v92) costruito in `tools/bar-disegni.mjs` (`VETRO`, `viv()`) e `index.html` (`brMove` ×1,35, `brCkDis` con gruppi `.br-v`, CSS `non-scaling-stroke`, colori `--vetro*`), NEWS v92, riga v92 in CLAUDE.md. D43: bozza `tools/bozze/passaggi-d43.mjs`, scelta «Come le foto», 212 testi in `tools/d43-passi/`. Dettagli nella storia dei commit.

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
- Jona #107 `session_018zMHKEtsWAECS8Kf4wLjhw` (chiusa), #106 `session_019NMEenGwfWR4T8nH4n1bTV` (chiusa), #105 (chiusa, id nelle consegne di #105 nella storia), #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc`, #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026, nella #107 chiusa) «le prove ricordati vanno fatte sempre su pc mac tablet , telefoni android e iphone e ipad» → regola in CLAUDE.md + SUBITO 0-bis.
Prima:
(12/10/2026, scritto nella #107 già chiusa, dopo l'handoff) «correggi nel iphone quando scatta a un vino dopo la foto si riavvia l'applicazione» → SUBITO 0.
Prima, in #107 Mario non aveva scritto (sessione partita dal prompt di avvio della #106).
(12/10/2026 ~12:05 ora italiana, #106) «ok» (risposta alle 2 domande scritte nel testo: collaudo anche a RVC e SPA = sì; sistemare i difetti rimasti nei disegni dei cocktail = sì).
Prima (#106, 11:35): «ok poi vai con la D43  comunque pubblica ogni tanto gli aggiornamenti» (fatto: v94 online).
Prima (#106, 11:33): «quanto tempo resta?» (risposto).
Prima (#105, ~11:05): «ok poi pubblica direttamente» (v92 e v93 pubblicate). Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
