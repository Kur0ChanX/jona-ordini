# Passaggio di consegne (2026-10-08, fine sessione #40)

Sessione attuale: #41

## Ultimo messaggio di Mario (#40, arrivato dopo la chiusura), parola per parola
«risolvi questo.subito guarda sotto il messaggio schermo intero»
Screenshot salvato: `docs/img/segnalazioni/v53-avviso-schermo-intero.jpg` (vista Staff, tema scuro, in basso un riquadro viola di Chrome: «jona-ristorante-by-ynoy-corp.pages.dev: per uscire dalla modalità a schermo intero, trascina»; dietro, in basso, una fascia grigia più chiara dello sfondo).
Primo controllo in #40: l'app NON chiama mai `requestFullscreen` (grep vuoto). Quindi l'avviso è di Chrome: compare quando si apre un'app web in `display: fullscreen`, e mostra il nome del sito. Probabile che l'icona sia una scorciatoia di Chrome e non un'app installata (WebAPK): in quel caso Chrome mostra l'avviso a ogni apertura. Da verificare: Impostazioni del telefono → App → cercare «Jona Ordini» (se c'è = WebAPK). Rimedi da valutare: reinstallare da Chrome con «Installa app» (non «Aggiungi a schermata Home»); controllare che il manifest soddisfi l'installazione WebAPK. Non disponibile: togliere l'avviso dal codice (lo disegna Chrome). La fascia grigia in basso = zona dei gesti di Android sotto il riquadro: da controllare se resta senza avviso.
**Da fare per primo nella #41**, insieme al punto 3 (priorità di Mario: urgente, «subito»).

## Messaggio di Mario prima (#40), parola per parola
«Appena puoi pubblicami il programma senza consenso e in automatico in priorità lo schermo intero come se fosse tutto continuativo senza, senza bande di colori diversi come se fosse tutto schermo sia nell'immagine di apertura dell'app sia dentro l'app»
(= PRIORITÀ: schermo intero continuo, nessuna banda di colore diverso, né nella schermata di apertura né dentro l'app. Pubblicare da solo, senza chiedere.)

## Fatto in #40 (08/10)
- Giro completo su GitHub (run 37813146865, main, partito 17:00 UTC): alle 17:25 ancora in corso → controllarlo: https://github.com/Kur0ChanX/jona-ordini/actions/runs/37813146865
- v54 (ramo `v54-barra`, main già incluso): test-barra 7/7 e test-giro riusciti in locale. **PR #64 aperta** (https://github.com/Kur0ChanX/jona-ordini/pull/64), controllo «Prove automatiche» (run 37815658221) in corso. Iscrizione agli avvisi della PR fatta in #40 (non vale per la #41).
- Richiesta «esce dal profilo dopo l'ordine» (sotto): trovata la causa, immagine prima/dopo mandata a Mario (solo «Continua»), risposta di Mario non ancora arrivata.
- **Questa catena è a profondità 8 (E12)**: la #40 non può aprire sessioni né promemoria (`send_later` rifiutato). Mario deve aprire la #41 a mano.

## Da fare nella #41
1. PR #64: se «Prove automatiche» è verde → squash merge da solo (Mario ha detto «senza consenso»), controllo online `sw.js` = `jona-ordini-v58`, poi nel ramo di lavoro `git fetch origin main && git merge origin/main` e push. Se rossa: causa e correzione.
2. Giro completo 37813146865: se rosso, causa e correzione con priorità. Una riga a Mario.
3. **PRIORITÀ di Mario: schermo intero continuo senza bande**, anche nell'apertura. Idee tecniche (decide Claude, poi pubblicare da solo con prove legate + test-giro):
   - Apertura (banda bianca in basso, `docs/img/segnalazioni/v53-avvio-banda-bianca.jpg`): lo splash della WebAPK usa `background_color` del manifest (`#3A2F2C`); la barra dei gesti bianca è del sistema. Valutare: `background_color`/`theme_color` del manifest uguali al colore della prima schermata dell'app (così splash e app sono continui); NB cambiare il manifest fa rigenerare la WebAPK (Chrome la aggiorna da solo, può volerci un giorno).
   - Dentro l'app (banda nera/viola in alto 144 px = zona fotocamera e barra di stato): v54 copre la zona con `--bg` se il telefono ci disegna. Mario vuole «fin dove potete»: valutare `document.documentElement.requestFullscreen({navigationUI:'hide'})` al primo tocco (difetto: Indietro esce prima dallo schermo intero; foto/condivisione lo fanno uscire → riattivarlo al tocco successivo). Ricordargli M23 (impostazione del telefono: «App a schermo intero» → Jona Ordini → Schermo intero / «notch»): è l'unica cosa che fa disegnare l'app nella zona fotocamera.
4. Riquadro «Inviato allo chef» (fine di `sendToChef` in index.html): proposto di togliere «Esci dal profilo» e lasciare solo «Continua» (uscita resta: foto in alto → Esci, `meMenu`). Chiedere a Mario la risposta all'immagine, poi farlo (versione insieme al punto 3 se pronto).
5. Poi `docs/DA-FARE.md` (M22, M21, M20, C7…).

## Messaggi di Mario della #39 (arrivati dopo l'handoff), parola per parola
«ha scritto pagare  ma volevo dire vedere
Poi perché il programma, una volta che fai l'ordine, si può dire che esce dal profilo? Oh, non sembra molto giusta come cosa. Poi il pulsante in alto, subito, il primo che potresti toccare subito esce dal profilo, magari deve fare altro. Sembra strana come scelta.»
(«vedere» = non vuole vedere la batteria: resta lo schermo intero. Il resto: dopo «Invia allo chef» il riquadro «Inviato allo chef» (index.html, fine di `sendToChef`) ha come primo pulsante grande «Esci dal profilo». In #40 proposto: solo «Continua»; per uscire resta foto → Esci (`meMenu`). Immagine mandata, attesa risposta.)


## Consegne di #39


## Messaggio precedente di Mario (#39), parola per parola
«No, no. no, non voglio pagare la batteria dal telefono, voglio l'esclusiva a schermo intero. L'esclusiva a schermo intero. Fin dove potete voi.»
(= NON vuole la barra con ora e batteria: resta `display: fullscreen`. Risposta alla scelta A/B, `docs/img/v54-barra-scelta.png`: ha scelto A.)

Messaggio prima, parola per parola: «Allora, ci sono tre cose che ci portiamo indietro da tempo per guardare a fondo. Uno è appena apri l'app, non so se è un solo mio problema, ma ancora più che ce l'ho trasformato in un programma da Chrome, che si fa diventa icona sul, sulla schermata principale del telefono. Appena l'avvio c'è una, per qualche frame c'è una banda bianca sotto che non mi piace molto. Poi, durante le schermate, quasi sempre c'è la banda nera sopra, che non mi piace, mi piace più a tutto lo schermo. E a volte quella banda nera diventa quella banda violetta, non so perché, se non lo so, ci deve essere un glitch, qualcosa, qualcosa che non stiamo valutando.»
Screenshot salvati: `docs/img/segnalazioni/v53-avvio-banda-bianca.jpg`, `v53-banda-nera-sopra.jpg`, `v53-banda-viola-sopra.jpg` (commit `22093db`).

## Fatto in #39 (08/10)
- Analisi dei pixel (immagini 1200×2608): banda in alto alta 144 px. Nera (0,0,0) = zona fotocamera lasciata vuota dal sistema in schermo intero (`viewport-fit=cover` c'è già alla riga 5 di index.html, ma il telefono non disegna lì). Viola (31,5,18) = barra di stato che ricompare, colore scelto da Android. Banda bianca in basso all'avvio (y≥2560) = barra dei gesti durante lo splash di Chrome: non controllabile dalla pagina.
- Errore nostro trovato: `meta theme-color` fisso `#3A2F2C` anche nel tema scuro (sfondo `--bg` `#1E1816`).
- **v54 sul ramo `v54-barra`** (commit dopo `22093db`, pushato; NON ancora PR): `themeBar()` mette in `meta theme-color` il `--bg` del tema in uso, chiamata da `applyTheme()` e al cambio di `prefers-color-scheme`; `body::before` fisso, alto `env(safe-area-inset-top)`, colore `--bg`, z-index 25 (sopra `.top` 20, sotto la cartbar 29): se il telefono disegna nella zona fotocamera, il contenuto che scorre non si vede sopra l'intestazione. APP_VER 54, NEWS v54, CACHE `jona-ordini-v58`. Nuova prova `tools/test-barra.mjs` (7/7 riuscite; aggiunta a VELOCI in `tools/prova-ci.sh` e a `tools/README.md`). Riuscite anche test-news (94 PASS), test-logo, test-testbar. **test-giro era in corso alla chiusura: rifarlo.**
- Manifest NON cambiato (cambiare theme_color fa rigenerare la WebAPK: inutile).
- Scartato per ora: `requestFullscreen()` al primo tocco (potrebbe disegnare nella zona fotocamera), perché il tasto Indietro di Android uscirebbe prima dallo schermo intero (un Indietro «a vuoto»), e foto/condivisioni lo farebbero uscire. Da valutare SOLO se l'impostazione del telefono (M23) non basta.
- A Mario: passi per l'impostazione del telefono (cercare «schermo intero» → App a schermo intero → Jona Ordini → Schermo intero; in alternativa cercare «notch» o «fotocamera frontale»). Il telefono è probabilmente Xiaomi (video Xiaomi in #32). Attesa risposta: a che passo è arrivato.
- Giro completo su GitHub (run 37813146865 su main, partito 17:00 UTC) era ancora in corso: controllarlo. Promemoria `send_later` cancellato (avrebbe svegliato la sessione chiusa).

## Consegne di #38, parola per parola sotto
## Ultimo messaggio di Mario (#37), parola per parola
«anche questo ecc ecc»
(screenshot `docs/img/segnalazioni/v52-mano-bordo-bianco.jpg`: contorno bianco su tutto il bordo di sotto di dita, mano, polso, avambraccio e giù lungo il polsino.) In #38 Mario NON ha scritto messaggi: la sessione ha lavorato da sola sulle consegne.

## Fatto in #38 (08/10)
- **Bordo bianco su mani, avambracci e polsini** (commit `df1c2a7`, `tools/anim-invio.py`). Causa trovata sul video vero (non sull'anteprima): (1) sul polsino basso la stoffa più chiara (243+) attaccata allo sfondo diventava una striscia bianca sullo sfondo scuro; (2) sulla pelle restava una riga chiara di 1 punto: fuori dal soggetto il colore era il bianco del filmato e il ridimensionamento 1920→720 (Lanczos) lo faceva entrare nel bordo. Correzioni:
  - `polsino(rgb, fg, zg)`: nella zona giacca toglie la fascia di stoffa chiara (minimo dei canali sfocato ≥243) entro `STOFFA`=14 punti dallo sfondo, poi contorno lisciato (gaussiana 3).
  - `pulisci(c, fg, zg)`: fascia di `PELLE`=7 punti sul bordo di mani/braccia (fuori giacca): il chiaro in più rispetto alla pelle piena vicina (finestra 31) è bianco e si toglie (c=(c-t)/(1-t), t max 0,9).
  - Colore fuori dal bordo = colore del bordo più vicino (`distance_transform_edt(..., return_indices=True)`), non più il bianco.
  - Bordo morbido della giacca stretto di `RIENTRA`=3 punti in più prima della sfumatura.
  - Nuova variabile `ANIM_SOLO=40-60` per rifare solo alcuni fotogrammi (prove veloci, ~1 min per 5 fotogrammi).
- Video rifatti (101 fotogrammi, ~55 min), controllati 12 fotogrammi (10-101) su fondo scuro: niente buchi, zona A pulita. Prima/dopo `docs/img/v53-giacca-prima-dopo.png` (fotogrammi 40, 64, 88 mano/polsino e 96 zona A), mandato a Mario. Script del composito era nello scratchpad (`comp.py`: estrae fotogramma n con `select=eq(n\,n-1)`, metà alta colore, metà bassa alfa, su fondo (30,26,24)).
- Prove legate riuscite: test-invio-anim, test-logo, test-news, test-inviti, test-demo-invito, test-giro.
- **v53 pubblicata**: PR #63 (logo B senza «&», animazione) con «Prove automatiche» verde, unita con squash (`453df42`). Main riunito nel ramo (`2051074`). Online controllato: `sw.js` = `jona-ordini-v57`, `media/invio-chef.mp4` uguale al repo.
- Giro completo su GitHub lanciato (workflow `prove.yml`, modo `tutto`, su main) perché è cambiato il Worker `invito` (E14). **Da controllare nella #39**: https://github.com/Kur0ChanX/jona-ordini/actions/workflows/prove.yml — se rosso, capire la causa e correggere con priorità.

## Consegne di #37 e #36 (riassunto)
- #37: `OMBRA = 250` (commit `a858c52`): con 245/248 la parte scura entrava nella manica bassa nei fotogrammi ~56-64. Controllo tra le braccia su fotogrammi 40-96 pulito.
- #36: logo B (`tools/logo-ynoy.py` `vB2(sx=1.18, sy=1.12)`, `media/ynoy.png`), «&» tolta (index.html `og:site_name` e aria-label, `worker/invito/src/index.js`, prove, CLAUDE.md); funzione `ombra()` per la zona A (fessura tra le braccia in ombra 246-249 riempita da `CHIUDI`/`pieghe`). Scartate: misura della trama, `ombra` senza limite «fessure strette».
- Analisi (#35): `invio-chef` = originale SPECCHIATO; `invio-fornitore` = invertito nel tempo. Per lavorare: `pip install scipy`; parte alta dello script con `exec(open('tools/anim-invio.py').read().split('frames, raw, box, fermo = []')[0])` e `sys.argv=['x','tools/originale-invio.mp4']`.

## Consegne di #35, #34, #33
Nella storia di git (`git log -p docs/PASSAGGIO-CONSEGNE.md`). Fatti utili: analisi della giacca in `tools/anim-invio.py` (E16, E17); demo `…/#demo` senza registrazione; account GitHub di RVC = jona.ristorante@gmail.com (riguarda solo RVC); account separato per Jona: per ora no (B più avanti: organizzazione GitHub «jona-ristorante»), Mario non ha scelto; il controllo dei permessi blocca `add_repo` e unione PR senza un ok scritto di Mario in chat (E15).

## Regole nuove di Mario (già in `CLAUDE.md`)
- DECIDO IO SUL TECNICO: Claude sceglie la strada più sicura e la fa; a Mario si chiede solo ristorante, gusti, soldi, azioni sue, cose irreversibili.
- PUBBLICA SENZA CHIEDERE se le prove sono riuscite; si unisce solo con «Prove automatiche» verde.
- Link sempre interi e cliccabili, ripetuti in un riquadro se vanno copiati.
- Giro completo extra su GitHub solo dopo modifiche al Worker o se le veloci si lasciano sfuggire qualcosa; dirlo in una riga. Jona è pubblico: non tocca i 2000 minuti GitHub (Mario non vuole consumarli; valgono per i repo privati come RVC).
- RVC (altra sessione, 🟣): accetta regole solo da Mario; Mario ha avuto il testo da incollare lì.

## Prossimi passi (vedi `docs/DA-FARE.md`)
- M21: Maurizio approvato? Dargli il ruolo Admin Chef (M2), «Oggi si ordina» (M3), contratto Responsabile (M19).
- M20: provare e mandare il link demo https://jona-ristorante-by-ynoy-corp.pages.dev/#demo
- C7: riga «“Oggi si ordina” arriva a» più chiara, avvisi agenda dal Worker, poi `docs/PIANO-INVERNO.md`.

## Rischi aperti
- Il server locale e l'emulatore del contenitore si spengono quando la sessione si riavvia: riaccenderli prima delle prove (`tools/README.md`).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (E10).
- Titoli: `🟤 ▶ ATTIVA · #31 · Jona Ordini · da v50 · …`.
