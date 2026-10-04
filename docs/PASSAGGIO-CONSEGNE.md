# Passaggio di consegne (2026-10-04, notte)

## Ultimo messaggio di Mario (arrivato nella sessione precedente, girato qui)
«Alla fine fai un bel controllo accurato di tutte le funzioni dell'app, in modo autonomo. Mancherò per qualche ora: vai da solo, e le decisioni importanti lasciale a me per quando torno in chat, alla fine di tutto.»

## Messaggio di Mario prima di questo
«Procedi con il cambio del sottodominio Cloudflare (accetto qualche ora senza notifiche), poi procedi con tutto il resto senza fermarti. Se devi cambiare sessione fallo da solo: ho un impegno, non posso dare consensi. Fermati solo quando hai finito tutta la lista, poi fammi una lista dettagliata di tutto ciò che hai fatto.»

## Stato
- **v32 unita in main** (PR #41, squash `9ed0d26`), online verificata (`APP_VER=32`, `sw.js` `jona-ordini-v36`). Ramo riallineato. Punto 0 (controllo completo) FATTO: 20 prove locali + 12 Firebase verdi, nuovo `tools/test-giro.mjs` (ogni scheda × 3 ruoli × 320/390 px × chiaro/scuro) senza problemi. Corretti: righe delle richieste a 320 px (`gmLine` `line wrap big`), `.seg.wide` a capo sotto 360 px, `.fadd` a capo; `test-firebase-report` con `jona_fb_lp` (netWatch ricaricava a metà). `test-firebase-sync` ora passa.
- **v31 unita in main** (PR #40, squash `964585a`), online verificata (`APP_VER=31`, `sw.js` `jona-ordini-v35`). Ramo riallineato (merge di main, nessuna differenza).
- v30 verificata online: workflow Cloudflare run 37210528836 verde, `invito.mario-miscera.workers.dev/ABCDEF` → `#i=ABCDEF`, `/salute` ok (push, gemini, 4 allegati).

## v31 (fatto)
- `orOggi()` in `index.html`: «In turno oggi» da `tp` della settimana corrente (solo persone `attivo`, riposi/assenze esclusi, tag «Adesso»), in `vMieiOrari` (non sulla settimana «Prossima») e in `vOrari` (solo settimana corrente). Lo staff vede nomi e orari di oggi dei colleghi (scelta voluta dalla richiesta).
- Promemoria ordini: `fornitori.giorniOrdine` [0=lun..6=dom] + `oraPromemoria` (vuota = 1 h prima di `oraLimite`, altrimenti 10:00); chip giorni in `supForm` (azione `feDay`), tag 🔔 sulla card; `promInfo` + ciclo in `deadlineTick` (solo gestori, `jona_rem` chiave `p_<fid>`, notifica `tipo:'promemoria'` non ripetuta fra telefoni; niente avviso se oggi è già partito un ordine al fornitore o se l'ora limite è passata).
- Consumi e costi: `rpCalc(R,rng)`, `rpPrev`/`rpCmp` (confronto con lo stesso tratto del periodo prima: mese→mese prima, settimana, anno, altrimenti stessa durata), `rpDrill` (tocco: 1° valore, 2° entra; mouse: clic; tastiera: Invio), pila `S.rp.back` + `rpBack`, `rpProd` (tocco sul nome prodotto).
- Prova `tools/test-v31.mjs` (30 verdi). Verdi: test-report, orari, news, staff, v16, v29, v30 (aggiornato a `APP_VER>=30`), inviti, scaglione2.

## NON fatto
- **Cambio sottodominio workers.dev**: bloccato dal controllo di sicurezza automatico della sessione (categoria «DNS / Domain / Cert Changes») mentre preparavo lo step del workflow. Non aggirato. Resta `mario-miscera`. Quando Mario lo cambia a mano (o autorizza), serve una v32: `WK_SUB` in `index.html`, `PUSH_URL` in `sw.js`, prova del workflow, route nei test (`tools/test-firebase-*.mjs`, `test-gemini-server.mjs`), `CLAUDE.md`, `CACHE` v36. Finché l'app non è aggiornata: niente notifiche/foto/vocali/«Chiedi a Jona».
- Maurizio Lai (registrazione/approvazione/ruolo): niente codice, lo fa Mario.
- Mauro Loi in «F&B Manager»: da confermare con Mario.

## Prossimi passi
0. ~~Controllo completo~~ (fatto in v32). Testo originale: Tutte le prove in `tools/` (anche quelle Firebase con l'emulatore, vedi `tools/README.md`), più un giro con Playwright su ogni schermata e ruolo (Staff, Admin Chef, Sviluppatore) a 320 e 390 px, tema chiaro e scuro. Correggere i difetti chiari (nuova versione v32: `APP_VER`, `NEWS`, `CACHE` v36, PR → squash → controllo online → riallineamento). Le scelte importanti NON prenderle: elencarle in fondo al resoconto finale come «Decisioni per Mario». Alla fine: resoconto dettagliato + prove numerate.
1. Risposta di Mario sul sottodominio → v32 come sopra.
2. Prove dal vero di Mario: vocale Android→iPhone, gesto indietro Android, pallino, invito con codice, v31 (In turno oggi, promemoria, consumi).

## Rischi aperti
- `/invia` del Worker non controlla chi chiama; tutti i telefoni approvati leggono tutti i messaggi e allegati.
- `/invito/<codice>` senza limite di tentativi (resta l'approvazione del telefono).
- Promemoria: parte solo se un telefono di un gestore ha l'app aperta (o in background attivo) dopo l'ora scelta; con l'app chiusa su tutti i telefoni l'avviso arriva alla prima apertura del giorno (prima dell'ora limite). Un cron nel Worker lo renderebbe puntuale.
- `test-firebase-flow` fallisce 23:30–24:00.
- netWatch: con molte scritture di fila (>4 s di attesa) l'app crede che il Wi-Fi sia filtrato, passa al long polling per sempre e si ricarica una volta. Innocuo ma da valutare (decisione per Mario).
