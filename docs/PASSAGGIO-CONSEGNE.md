# Passaggio di consegne (2026-10-13, fine sessione #120)

Sessione attuale: #121

La #120 (aperta dalla #119, profondità 3) apre la #121.

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v100**. Nel ramo: **v101** (`APP_VER` 101, `CACHE` `jona-ordini-v105`), **PR #110 aperta** (https://github.com/Kur0ChanX/jona-ordini/pull/110), sessione iscritta alla PR (la nuova deve iscriversi di nuovo con `subscribe_pr_activity`).

## Fatto in #120 (13/10, ~12:30-13:40 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO), motore Opus ok, `effort_level` non visibile in `get_session`.
- **v101 D50 «app più leggera»** (strada 3 Geniale di Mario #119), dettagli nella riga v101 di CLAUDE.md:
  - Bar in `moduli/bar.js` (19 KB, 7,5 KB compressi): `modLoad(n)` in index.html (script globale, una volta, su errore si può riprovare), `brOpen` → `modLoad('bar')` → `brApri`; in index restano `isBar`, `brCan`, `brOn`, `brAll`, `brGet`, `brTot`, `brMese`, `brCta`, azioni `br*` in `A`. Avviso «Il Bar non si apre senza rete. Riprova tra poco.».
  - Novità dalla v89 in giù in `data/news.json` (le novità erano 85 KB / 32 KB compressi: la parte più pesante, idea mia oltre al piano); in `NEWS` restano v90-v101. `newsOld()`, `newsList()`, `newsSheet` le scarica e ridisegna; senza rete `.news-old` «Le versioni più vecchie si vedono con la rete».
  - `sw.js` FILES + `./moduli/bar.js`, `./data/news.json`; deploy `cp -r lib media data moduli sito/`.
  - Misura (`node tools/misura-velocita.mjs`): index.html 912 → 796 KB (297 → 263 KB compresso), prima schermata sul telefono lento 4525 ms (OLTRE il tetto 4500) → 3253 ms, blocco più lungo 699 → 196 ms.
  - Prove aggiornate: `test-news`, `test-bar` (+ controllo «Bar non caricato all'avvio», poi `modLoad('bar')`), `test-bar-disegni` (legge anche `moduli/bar.js`), `test-testbar`, `test-v27/28/29/30` (usano `await newsOld(); newsList()`). Prova nuova `tools/test-moduli.mjs` (in VELOCI di `prova-ci.sh`). Locale: tutte verdi + `test-giro` verde.
- Misura dell'aiutante `ottimizza` arrivata da #119 → ordine dei prossimi moduli in DA-FARE D50 (Cantina, Ricette; Agenda NO).
- Regola nuova da RVC #102 (`session_01HQxtExvET3RJtVvyibVrgQ`) «SCHEDA DELLE DOMANDE CHE SPARISCE» scritta in CLAUDE.md (approvata da Mario per tutti).

## 🔴 PR #110 ROSSA: `test-moduli` solo su WebKit (Desktop Safari e iPhone 15; iPad PASSA)
Diagnosi dentro la riga FAIL (commit `cd3b3af`): «senza rete il Bar si apre (20011 ms) script:0 · brApri:undefined · avvisi: · onLine:false · ctrl:true · cache:200 · fetch err:Load failed»; anche «novità vecchie (12 versioni)» = `data/news.json` non arrivato.
Cioè: pagina controllata dal service worker, file presente nella cache (`caches.match` 200), ma `fetch('moduli/bar.js')` dalla pagina dà «Load failed» → il service worker non risponde dalla cache con `ctx.setOffline(true)` su WebKit di Playwright (lo script è stato tolto da `onerror`; l'avviso era già sparito dopo 20 s).
Da capire PRIMA di toccare l'app (non pubblicare finché non è chiaro):
1. Controllo: nella stessa prova su WebKit, offline, `fetch('index.html')` / `pg.reload()` funzionano? Se falliscono anche loro = limite dell'emulazione offline di Playwright WebKit (il service worker non viene usato offline) → la parte «senza rete col service worker» si verifica su WebKit con un altro modo (es. `fetch` dalla cache con `caches.match` già provato, o route che fa fallire la rete verso il server ma lascia il service worker), scritto nella prova con il motivo, NON spenta. Se `index.html` offline invece va → problema vero nel `fetch` di `sw.js` per i file nuovi: guardare `sw.js` righe 18-28 (`caches.match(req)` con richiesta di tipo script, `ignoreSearch`/`ignoreVary`?).
2. Perché iPad passa e iPhone no? (tempo? stesso WebKit). Utile come indizio.
3. Prima di ogni push: E39 (ogni push fa ripartire le prove della PR, ~25 min).
Dopo il verde: squash, `git fetch origin main && git merge origin/main`, push, controllo online (`APP_VER` 101 su https://jona-ristorante-by-ynoy-corp.pages.dev/), poi dire a Mario su quali dispositivi è stata provata.

## ✅ PROSSIMI PASSI (#121, continuare da sola)
0. All'avvio: `get_session` (motore Opus?), `subscribe_pr_activity` PR #110, server locale `python3 -m http.server 8765` (si spegne quando il contenitore riparte).
1. 🔴 PR #110 come sopra.
2. Se Mario risponde su Maurizio (notifiche iPhone, v100): aiutarlo; se con l'app installata le notifiche non arrivano → guida «bloccate» vera. Domanda aperta: «A che passo è arrivato Maurizio?».
3. Dopo la v101 online: modulo Cantina (DA-FARE D50), poi Ricette.
4. Restano: Mario proverà foto del vino su iPhone (v96), D44, D43. D48 rimandata. Aiutanti: «aiutanti sì» con annuncio.
5. Misura del consumo: riga #120 sotto (fatta), #121 alla sua chiusura (ultima delle 3).

## Consumo (misura per 3 sessioni, regola RVC #97)
| Sessione | cache_read | cache_write | output | cost_usd | contesto alla chiusura |
|---|---|---|---|---|---|
| #118 | 4.914.969 | 222.117 | 10.822 | 2,98 | ~187-221k |
| #119 | 6.643.470 | 244.374 | 20.405 | 3,24 | ~188-225k |
| #120 | 11.730.738 | 170.252 | 37.304 | 4,46 | ~227k |

## Fatto in #117 (12/10, ~20:57-21:25 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO «per schermo intero è ancora cosí»), push `bd39060` → le prove della PR #108 sono ripartite (E39). Iscritta alla PR, titolo messo.
- Foto di Mario `docs/img/sessione-116/chat-tastiera-*.jpg` guardate: campo «Scrivi un messaggio» mezzo sotto la tastiera, intestazione della chat fuori in alto (la pagina è stata spostata dal telefono = caso `vv.offsetTop>0`, già coperto da `chVV`). Sono della versione vecchia.
- Codice di `chVV` (index.html riga ~4650) riletto: giusto (`top=vv.offsetTop`, `height=vv.height`, classe `kb`).
- RVC #95 (`session_01FkfToE8frofY9A1By5DgXK`) ha chiesto come funzionano le versioni in Jona (C76): risposto con send_message (`APP_VER`, `NEWS`, `newsFor`, `newsBtn`/`newsSheet`, `jona_news_<id>`, «App da aggiornare», `test-news`).
- Prove rosse (vedi SUBITO 0), commento sulla PR #108 con la causa. Handoff per l'avviso dell'hook (~140k).

## Fatto in #116 (12/10, ~20:32-20:55 ora italiana)
- Avvio: scorta unita (conflitto solo nell'intestazione di ULTIMO-MESSAGGIO, risolto), iscritta alla PR #108. `send_later` e `create_session` negati: profondità 8 (E12).
- Messaggi di Mario girati dalla #115 (chiusa) salvati sotto. D48 «cocktail bellissimi» RIMANDATA da Mario (in Idee e in DA-FARE, in fondo).
- **v99 D49** (Mario: «mi risolvi questo problema della tastiera che va sopra la scrittura», foto `docs/img/sessione-116/chat-tastiera-1.jpg` e `-2.jpg`: Android, app installata, tema scuro, chat con Mauro Loi, barra di scrittura sotto la tastiera). Causa: con `display: fullscreen` (e in generale `resizes-visual`) Android non accorcia la pagina, `.cht` usa `100dvh`. Correzione in `index.html`: `chVV()` dopo `chClose` su `visualViewport` resize/scroll: se `innerHeight − vv.height > 60` → `CHAT.box.style.top=vv.offsetTop`, `height=vv.height`, `bottom:auto`, classe `kb`, scorre `#ch-m` in fondo quando si apre; tastiera chiusa → stili tolti. CSS `.cht.kb .cht-l,.cht.kb .cht-c{height:100%}.cht.kb .cht-in{padding-bottom:8px}`. Su iPhone se `innerHeight` si accorcia insieme alla tastiera non cambia niente (come prima). Scelta di non usare `interactive-widget` (vedi SUBITO 1).
- Prova nuova `tools/test-chat-tastiera.mjs` (visualViewport finto con `__kb(k,offset)`; Pixel 7 e Galaxy Tab S4 PASS 10, iPhone 15 e iPad SALTATA in locale; sul codice vecchio 4 FAIL), aggiunta a `VELOCI` in `tools/prova-ci.sh`. test-news e test-testbar PASS. NEWS v99, `APP_VER` 99, `CACHE` `jona-ordini-v103`, riga v99 in CLAUDE.md, D49 in DA-FARE. Titolo PR #108 aggiornato.
- Regole nuove da RVC #94 (approvate da Mario per tutti i progetti) scritte in CLAUDE.md: MOTORE IN SILENZIO, INTERRUTTORE DEGLI AIUTANTI.
- Handoff per l'avviso dell'hook (~155k).

## Fatto in #115 (12/10, ~20:12-20:32 ora italiana)
- Scorta unita due volte (solo ULTIMO-MESSAGGIO).
- v98: in `tools/bar-disegni.mjs` la cannuccia (`s|`: Mojito Highball, Scorpion Tiki, Mint Julep) passa per il centro dell'apertura (32, `g.y0`); pendenza `min(.3,(rx-4)/(y1-y0))`, opachi .25; `x1/x2` = 30.9 ± … (1.1 = metà larghezza). Prova nuova in `tools/test-bar-disegni.mjs` «cannucce dal centro dell'apertura» (FAIL sul vecchio JSON, controllato). NEWS v98, `APP_VER` 98, `CACHE` v102, riga v98 in CLAUDE.md. Foto `docs/img/sessione-115/cannuccia-prima-dopo.png` mandata. Prove locali: test-bar-disegni 74, test-bar 38, test-news 94, test-testbar 13 PASS. Commit `6749eb8`, PR #108.
- Bozza: Mojito di `tools/bozze/cocktail-bellissimi.mjs` con `rotate(16 60 20)` e rect x=58 (centro dell'ellisse 60,20). Foto prova rifatta e mandata in 2 pezzi (le foto «oggi» si fanno con un overlay `.br-ckbig` sulla pagina demo dopo `brOpen`, `brCkDis({n})`).
- Handoff per l'avviso dell'hook (~141k).

## Fatto in #114 (12/10, ~18:05-18:20 ora italiana)
- Avvio: scorta unita (due volte, solo ULTIMO-MESSAGGIO), push. Titolo sessione messo.
- Richiesta «cantina e cocktail allo chef»: chiesto chi è lo chef; Mario «scusa visto ora che si trova in fornitori» → niente da fare (chiusa).
- Prova «cocktail bellissimi» (Mario «si»): bozza `tools/bozze/cocktail-bellissimi.mjs`, foto `docs/img/sessione-114/cocktail-prova-1di2.png` e `-2di2.png` mandate (oggi a sinistra, prova a destra). Pezzi: `ruota` (agrume con albedo e vescicole), `foglia` (menta con venature), `cubo` (ghiaccio trasparente col colore del drink, parametro `k` per drink scuri), `bolle`, `gocce`, `luce` (riflesso a pennello pieno), acquerello con feTurbulence. Avvertito Mario: per tutti i 212 serve rifare il generatore, lavoro di più sessioni; nella lista (44 px) i dettagli si vedono poco.
- Handoff per l'avviso dell'hook (contesto ~150k).

## Fatto in #113 (12/10, ~16:49-17:16 ora italiana)
- Avvio: scorta unita due volte (solo ULTIMO-MESSAGGIO: «non sono in hotel ora», poi «ok»).
- PR #107 v97: prove verdi su `428cc55` → squash `c7b631e` (17:13), `main` unito nel ramo + push, **v97 online alle 17:14** (controllato). Routine di controllo `trig_01ArZvGTU7DCKwEGRiWtpKL8` cancellata, iscrizione alla PR tolta.
- Handoff per l'avviso dell'hook (contesto ~140k) subito dopo la richiesta nuova di Mario.

## Fatto in #110-#112 (riassunto)
- v96 online (PR #106, 16:13). v97 Americano (riga v97 di CLAUDE.md). D46 `tools/test-dispositivi.mjs`. Prove Mac di `test-foto-vino`: E48 (service worker bloccato nel contesto), E49 (pagina nuova invece di ricaricare con la finestra dei file aperta).

## Fatto in #109 (riassunto)
- v96 D45 scritta (`fotoPiccola`, bozza del vino, lettori falliti). Dettagli nella riga v96 di CLAUDE.md e in E47.

## Fatto in #107 (riassunto)
- Collaudo mandato a RVC #92 e SPA #14. v95 difetti dei colori dei cocktail (`COLX`, `LAY`, `wavy`, Painkiller, fiamma). E46: i disegni leggono le vecchie frasi da `tools/cocktail-frasi.json`. Dettagli nella riga v95 di CLAUDE.md.

## Fatto in #106 (riassunto)
- v93 (PR #103) e v94 D43 passaggi dei cocktail (PR #104, squash `81921b5`) online. Dettagli nella riga v94 di CLAUDE.md e nei commit.

## Fatto in #105 (riassunto)
- PR #102 v92 (FAIL di `test-testbar` per un commento con il nome del creatore → corretto in `(#101)`). v93 D44 dalle bozze `tools/bozze/d44-*.py`; vista «Bar» nella barra Test (`VIEW_AS.bar`, barista vede Bar e Cantina, ordina e invia allo chef). Lezione: controllare `test-testbar` anche dopo commenti nuovi nel codice.

## Fatto in #103-#104 (riassunto)
- #104: D44 progettata in bozza. Context7 aveva finito la quota mensile gratuita: usare la ricerca web o chiedere a Mario una chiave gratis su context7.com/dashboard.
- #103: regola di stile applicata ai pezzi dei cocktail (`c`/`cf`/`cp` col tono scuro del pezzo, `LEGNO`), tazza di rame dei Mule (`rm|`, `sf|`, `oc`), niente `badge`, cannuccia e ombrellino, agrumi con albedo e `twist`. Dettagli nella riga v92 di CLAUDE.md e nella storia dei commit.

## Idee (da #100)
- **D48 cocktail «bellissimi» per tutti i 212** — RIMANDATA da Mario 12/10 ~20:45 («tienila come opzione la faremo più avanti»). Bozza `tools/bozze/cocktail-bellissimi.mjs`, foto `docs/img/sessione-114/cocktail-prova-1di2.png` e `-2di2.png`. Piano: rifare `tools/bar-disegni.mjs` a passi (bicchieri → ghiaccio → frutta → luce) con sfumature, vetro trasparente, luce a pennellata, cubo trasparente col colore del drink, frutta/menta dentro, bolle, gocce, acquerello (feTurbulence, spento con `lite`); vincoli peso < 30 KB compressi, lista 44 px, regola #101, cannuccia dal centro. Voce D48 in DA-FARE.
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
- Jona #120 `session_0163UBBPpxTPFrpKzmTJf8q6` (chiusa), #119 `session_01VzprLAnmjTUe4pZMSH5J5o` (chiusa), #118 `session_01AfBcMxPZTDeEmgsGBGSHXS` (chiusa), #117 `session_013BeB8J6Uc3jK39wSM9YbFB` (chiusa), #116 `session_01A2a8HzRNtt6PUug97SBJy9` (chiusa), #115 `session_01BHdALVpytDytxMRjAAHmzY` (chiusa), #114 `session_01Uzvha9HgPqw6pyPumPMSSw` (chiusa), #113 `session_01Rs2wW3qtEsVmaZtPkUz1Ei` (chiusa), #112 `session_01BE2ryA88ArUAZd9NyaGvrx` (chiusa), #111 `session_014JToN22uoTmG4osX9ScPhz` (chiusa), #110 `session_01QbaaAWWe28daKawzaaSb87` (chiusa), #109 `session_01N97sLf9HZ1a5TGP2TnTRsD` (chiusa), #108 `session_019f4wJG2gdxbuqrEvomUcYx` (chiusa), #107 `session_018zMHKEtsWAECS8Kf4wLjhw` (chiusa), #106 `session_019NMEenGwfWR4T8nH4n1bTV` (chiusa), #105 (chiusa, id nelle consegne di #105 nella storia), #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc`, #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC: ultima vista attiva #102 `session_01HQxtExvET3RJtVvyibVrgQ` (prima #101 `session_012uieedTtFyqonpGfgZ3yBR`); messaggi arrivati prima da #96 `session_01HcU3X6qjywWKKKXoz3cba6` e #97 `session_01Eob4hXJkfiHDSKwWDhugj2` (la più alta è l'attiva; ricontrollare con `list_sessions`). SPA attiva: **#14** `session_016iyo14hpB7Qq4UWfhfCqgV` (nomi da ricontrollare con `list_sessions` prima di mandare messaggi).
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
(13/10/2026 ~11:56 ora italiana, #119; in #120 nessun messaggio nuovo di Mario) «Ok però prima risolviami le notifiche nell'iphone di Maurizio che non trova l'app per abilitarle risolvi subito e pubblica poi il resto fatti aiutare per risolvere le notifiche»
Prima (#119): «avvia plan mode : Consigli? senza appesantire» → scelta a tocco «3 Geniale (Consigliata)», «Sì, confermo il lavoro».
Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
