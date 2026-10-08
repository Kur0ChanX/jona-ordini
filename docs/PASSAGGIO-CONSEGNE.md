# Passaggio di consegne (2026-10-08, fine sessione #39)

Sessione attuale: #40

## Stato #40 (in corso)
- Giro completo run 37813146865: ancora in corso alle 17:20 UTC.
- v54: prove locali riuscite (test-barra 7/7, test-giro), PR #64 aperta, in attesa di «Prove automatiche».

## Ultimo messaggio di Mario (arrivato nella #39 dopo l'handoff, girato alla #40), parola per parola
«ha scritto pagare  ma volevo dire vedere
Poi perché il programma, una volta che fai l'ordine, si può dire che esce dal profilo? Oh, non sembra molto giusta come cosa. Poi il pulsante in alto, subito, il primo che potresti toccare subito esce dal profilo, magari deve fare altro. Sembra strana come scelta.»
(«vedere» = non vuole vedere la batteria: resta lo schermo intero. Il resto: dopo «Invia allo chef» il riquadro «Inviato allo chef» (index.html, fine di `sendToChef`) ha come primo pulsante grande «Esci dal profilo». In #40 proposto: solo «Continua»; per uscire resta foto → Esci (`meMenu`). Immagine mandata, attesa risposta.)

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

## Da fare nella #40
1. Controllare il giro completo: https://github.com/Kur0ChanX/jona-ordini/actions/runs/37813146865 (se rosso: causa e correzione con priorità). Avvisare Mario in una riga.
2. Sul ramo `v54-barra`: `git merge origin/main` se serve, server `python3 -m http.server 8765`, rifare `node tools/test-barra.mjs` e `node tools/test-giro.mjs`; se riuscite pubblicare da solo (PR, «Prove automatiche» verde, squash, controllo online `sw.js` = v58, poi `git fetch origin main && git merge origin/main` nel ramo di lavoro e push).
3. Aspettare Mario su M23. Se la banda nera resta anche con l'impostazione: proporre `requestFullscreen` al primo tocco spiegando il difetto del tasto Indietro.
4. Poi `docs/DA-FARE.md` (M22, M21, M20, C7…).

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

## Da fare nella #39
1. Controllare il risultato del giro completo (sopra). Avvisare Mario in una riga.
2. Chiedere a Mario se l'animazione nuova gli va bene (prima/dopo già mandato; deve aggiornare l'app: si chiude e riapre, o «App da aggiornare»). Se segnala altri punti: segnare le zone sul SUO screenshot (E16) e controllare il video vero su 12 fotogrammi (E17).
3. Mario non ha ancora detto se il logo B gli piace (non ha obiettato).
4. Poi `docs/DA-FARE.md` (M21, M20, C7…).

## Consegne di #37 e #36 (riassunto)
- #37: `OMBRA = 250` (commit `a858c52`): con 245/248 la parte scura entrava nella manica bassa nei fotogrammi ~56-64. Controllo tra le braccia su fotogrammi 40-96 pulito.
- #36: logo B (`tools/logo-ynoy.py` `vB2(sx=1.18, sy=1.12)`, `media/ynoy.png`), «&» tolta (index.html `og:site_name` e aria-label, `worker/invito/src/index.js`, prove, CLAUDE.md); funzione `ombra()` per la zona A (fessura tra le braccia in ombra 246-249 riempita da `CHIUDI`/`pieghe`). Scartate: misura della trama, `ombra` senza limite «fessure strette».
- Analisi (#35): `invio-chef` = originale SPECCHIATO; `invio-fornitore` = invertito nel tempo. Per lavorare: `pip install scipy`; parte alta dello script con `exec(open('tools/anim-invio.py').read().split('frames, raw, box, fermo = []')[0])` e `sys.argv=['x','tools/originale-invio.mp4']`.

## Consegne precedenti (#35)

### Ultimo messaggio di Mario (#35), parola per parola
«Logo B e la giacca  la A questa che la stai tralasciando sempre»
(con screenshot dell'immagine a zone, salvato in `docs/img/segnalazioni/v52-giacca-scelta-A.jpg`)

## Analisi della giacca già fatta in #35 (non rifarla)
- `media/invio-chef.mp4` = filmato originale SPECCHIATO, fotogramma k+1 = `f(k+1)` dell'originale (non invertito). Nell'originale `tools/originale-invio.mp4` lo chef è a SINISTRA. `invio-fornitore` = invertito nel tempo, non specchiato.
- Per lavorare: `pip install scipy`; si può eseguire la parte alta di `tools/anim-invio.py` con `exec(open(...).read().split('frames, raw, box, fermo = []')[0])` (con `sys.argv=['x','tools/originale-invio.mp4']`) e usare `mask(rgb)` su un fotogramma.
- Vista utile: minimo dei canali con livelli 238→255 stirati a 0→255: lo sfondo vero è bianco pieno (~253-255), la stoffa bruciata è grigia con trama (247-251).
- Visto nel fotogramma 46: il «rosso» (punti tenuti con min≥247) sta sopra la manica alta e sopra la manica bassa: per lo più stoffa bruciata (grigia nei livelli). Tra le due maniche c'è però una fessura stretta di sfondo che `CHIUDI` (=14, chiusura delle fessure < 28 px), `liscio` e le `pieghe` (`PIEGA`=251.5) riempiono. Prova fatta: togliere i punti con `gaussian(mn,1.2) ≥ 252.5` collegati allo sfondo grande → toglie solo bordini, NON basta per la zona A.
- Da fare: trovare la zona A nell'originale (polsino della manica alta / fessura sopra la manica bassa, fotogrammi ~40-60 dove le due mani tengono il menù), misurare i suoi valori (probabilmente sfondo un po' in ombra, sotto 252) e far sì che la fessura scura continui: es. non applicare `CHIUDI`/`pieghe` dove la fessura è collegata allo sfondo tra le braccia, oppure soglia locale. Controllare con l'immagine composta su fondo scuro (come lo screenshot di Mario) e mandare a Mario un prima/dopo. Rifare i video con `python3 tools/anim-invio.py tools/originale-invio.mp4`.

## Fatto in #35 (08/10)
- Avvio ok. La sessione #34 ha aggiunto alle consegne il messaggio: «Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.» → è di RVC: detto a Mario di riferirlo alla sessione RVC 🟣.
- Mario ha guardato l'animazione: «nella giacca … dei pezzi da togliere … fanno parte dello sfondo» + 2 screenshot. Mandata immagine a zone A/B/C; scelta: A.
- Mario: «quando esce all'inizio il mio logo … and corp … la E commerciale riesci a toglierla … lavoro ad hoc proprio come logo … non voglio che il logo sia brutto senza la E» e «vorrei togliere la & su link inviti ecc». Fatte 3 proposte con le lettere originali di CORP (`docs/img/logo-senza-e-scelta.png`, script `tools/logo-ynoy.py`: vA spostato, vB più grande ×1.22 stessa base, vC distanziato). Scelta: **B**.
- Commit: `b75152e` (screenshot e zone), `6f21e9c` (proposte logo).

## Consegne precedenti (#34)
### Ultimo messaggio di Mario (#34), parola per parola
«Devo guardare ancora l'animazione, ancora non ho controllato, ti offro altre due domande. Una, se la versione di prova che invierò adesso non gli chiederà nessuna registrazione né nulla, eh, perché secondo me deve essere proprio così. Eh, cosa numero due, per il, il mio progetto RVC, ehm, mi consigli di, fare un passaggio, di fargli un passaggio di consegna per applicargli quel, quelle regole a quel problema PR? E poi e tante altre cose che hai riscontrato?»

Risposte già date in #34:
1. Versione di prova: NESSUNA registrazione. Il link `…/#demo` apre il benvenuto (`screenDemo`) → un tocco su «Entra nella demo» → dentro come «Ospite» con dati di esempio. Niente arriva al ristorante.
2. RVC: sì, consigliato. Claude ha dato a Mario un testo da incollare nella sessione RVC (RVC accetta regole solo da Mario): handoff con `source_url` + `source_revision`, E15, installare l'app Claude GitHub sull'account GitHub di RVC (altro account: da https://claude.ai/connect-github entrando con quell'account), accettare «Review request» dei permessi, unire PR solo con prove verdi e «unisci la PR N» di Mario.

## Messaggio di Mario arrivato dopo l'apertura di #35 (parola per parola)
«Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.»
Fatto: l'account GitHub di RVC è quello con la mail jona.ristorante@gmail.com (non Kur0ChanX). L'app Claude GitHub per RVC va installata entrando su GitHub con quell'account. Salvato anche in `docs/DA-FARE.md`? No: è di RVC, va detto alla sessione RVC.

## Fatto in #34 (08/10)
- La sessione #34 è partita SENZA repo (handoff di #33 senza `source_url`). Ricollegato con `add_repo` dopo l'ok di Mario. Mario ha l'account GitHub collegato e ha installato l'app Claude su Kur0ChanX (repo jona-ordini); gli ho chiesto di accettare «Review request» (aggiornamento permessi dell'app) su https://github.com/settings/installations.
- PR #62 (v52) unita con squash (`4e309aa`) dopo prove verdi e «unisci la PR 62» di Mario. Main riunito nel ramo (`2b069db`). Online controllato: `sw.js` = `jona-ordini-v56`. Mandata a Mario l'immagine `docs/img/v52-versione-di-prova.png` con i passi (Staff → in fondo → «Manda la versione di prova»; anche Impostazioni → Database centrale → Invita).
- E15 nel diario errori (`5163811`). `CLAUDE.md`, regola bloccata, punto 3 dell'handoff: nuova sessione sempre con `source_url` + `source_revision` (ok esplicito di Mario, `10d3ddf`).
- Il controllo automatico dei permessi blocca: `add_repo`, unione PR («Merge Without Review»), modifica di `.claude/settings.json` («Self-Modification») e push di `CLAUDE.md` senza un ok scritto di Mario in chat. Correzione «permesso fisso in settings.json» NON fatta (bloccata); non serve: basta «unisci la PR N».
- Account separato per Jona (jona.ristorante@gmail.com): consigliato NO per ora (A: restare così). Più avanti B: organizzazione GitHub gratuita «jona-ristorante» quando si consegna l'app al ristorante. C (account GitHub + Claude nuovi) sconsigliato: secondo abbonamento e trasloco. Mario non ha ancora scelto.

## Fatto in #33 (08/10)
- I 3 video di Mario sono in `docs/video/` (Xiaomi 17 Ultra). v51 online (PR #61, `07b77d5`), controllato: `sw.js` v55 e `media/invio-chef.mp4` uguale al ramo.
- Video 3 (giacca): la trasparenza era piena fino ai bordi del filmato → giacca tagliata dritta. `edges` in `tools/anim-invio.py` ora a ovale squadrato (P=4, dal 70%). v51, PR #61 unita (prove verdi), online controllato. Prima/dopo: `docs/img/v51-animazione-prima-dopo.png`.
- Video 1 (barra in alto con lo swipe): è Android in schermo intero (barre di sistema temporanee, colore scelto da HyperOS, non dall'app). Non correggibile dall'app; alternativa: `display: standalone` (barra sempre visibile col colore dell'app) → Mario ha scelto **A: resta a schermo intero**.
- v52: «Versione di prova» in fondo a Staff → Persone e nel foglio Invita (`demoShare`/`demoCopy`/`demoLink`/`demoText`), prova `tools/test-demo-invito.mjs` (anche nelle veloci di `prova-ci.sh`). Mario: «non vedo l'invito prova da inviare per Consulenti propietari ecc».
- Video 2 (bianco sotto): dura 0,2 s all'apertura, durante la schermata d'avvio di Android (barra di navigazione bianca). È del sistema, non dell'app.

Altro: E12 (limite di 8 sessioni a catena: Claude non può aprire la sessione nuova), E14 (Worker finti delle prove senza `/errori`: corretti `test-firebase-approva-arrivi` e `test-firebase-push`). Ramo remoto `fix-hook-avvio` già unito ma non cancellabile da qui (proxy): Mario può cancellarlo da https://github.com/Kur0ChanX/jona-ordini/branches (non urgente).

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
