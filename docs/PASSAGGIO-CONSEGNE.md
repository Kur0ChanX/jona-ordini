# Passaggio di consegne (2026-10-09, fine sessione #43)

Sessione attuale: #44

## Ultimo messaggio di Mario (#43), parola per parola
«non mi piace ne il punto luminoso che passa in YNOY pensavo che facessi scrivere il logo come se fosse stato scritto in tempo reale riga per riga in ordine come in scrittura e le animazioni di uscita YNOY non mi piacciono sono pacchiane»

Messaggi prima (#43), parola per parola:
- «magari come se il mio logo entra come se si stà scrivendo il by arriva da solo prima con animazione diversa  e non va via quando il logo va verso lo schermo non vanno assieme come foto unica»
- «non mi piace quando va via il mio logo proponi qlkosa di innovativo»

## Stato
- Online: **v61** (`sw.js` CACHE `jona-ordini-v65`). Nessuna PR aperta.
- Ramo `claude/v62-logo` (pushato, ultimo commit «v62 (bozza): BY cade lettera per lettera…»), **NON pubblicato**. `APP_VER=62`, CACHE `jona-ordini-v66`, tolto `cutoutFix()`.
- Le prove su `claude/v62-logo` vanno aggiornate: `tools/test-apertura-v62.mjs` controlla ancora `byOut` sulla `.wall-by` (tolta nella bozza) → oggi FALLISCE. `tools/test-logo.mjs` già adeguato (apertura ≥3 s). NEWS v62 da riscrivere alla fine (testo attuale parla della firma che «vola verso di te»).

## Cosa c'è nel ramo v62 (index.html, CSS nel blocco «/* v62 schermata d'apertura…» dopo `@keyframes ynoyShine`; HTML in `if(S.splash){const ESCI=…` riga ~1798)
JONA (Mario non l'ha criticato, sembra andare bene):
- `jonaIn` 1,2 s sul `.logo-full` (scala 4,2 → 1 in 0,55 s accelerando, poi schiacciamento 1,1×0,84, rimbalzo, assestamento), origine 50% 88%.
- Al colpo (0,55 s): `jShake` sulla `.splash`; dentro `.jhit` (contenitore nuovo del logo, `margin-top:auto`): ombra `.jsh`/`jShadow`, bagliore `.jfl`/`jFlash`, 2 onde `.jrg`/`jRing` (fill `forwards`, non `both`: prima del colpo non si vedono), 12 granelli `.jd`/`jDust` (valori `--x/--y` fissi nell'HTML).
- `.wall-sub` rise da 1 s. `jAway` (sfuma + scala .93) su `.jhit`, `.wall-sub`, BY da 3,4 s.
- `S.splash` finisce a **3800** ms, `.intro` tolta a **4100** (`setTimeout` in fondo a index.html, riga ~5300).
Firma (bozza da rifare in parte):
- Solo nell'apertura la firma ha un markup proprio: `<div class="wall-by"><span><em>b</em><em>y</em></span><div class="yn"><i class="y0"></i>…pezzi uscita…<b class="pen"></b></div></div>` (la schermata d'ingresso usa ancora `BY` normale, non toccata).
- BY: le due lettere cadono una alla volta (`byDrop`, 0,85 s e 1 s). **Mario OK** («il by arriva da solo prima con animazione diversa»).
- YNOY `.y0`: doppia maschera (logo + sfumatura) con `mask-composite:intersect`, `yWrite` sposta la sfumatura (tendina da sinistra 1,25-2,45 s) + `ynoyShine`. Punta di luce `.pen`/`yPen`. **Mario NO**: via la punta di luce, via la tendina.
- 3 uscite di prova con classe sulla `.splash` (`ea` polvere 30 pezzi `.yp` con clip-path, `eb` TV `.yn`+`.yw`+`.ydot`, `ec` taglio `.yh1/.yh2/.ycut`); `self.JONA_ESCI` sceglie (predefinita `ec`). **Mario NO a tutte e tre** («pacchiane»). Da togliere tutte quando c'è la nuova uscita.
- Attenzione scoperta: un elemento con maschera + `transform` + strato bianco `::after` mostrava un riquadro chiaro attorno al logo (uscita B); risolto con copia separata. Conferma la regola: niente effetti strani su elementi con maschera (anche `filter:blur`, nota v53).

## Prossimo lavoro (#44): D13
1. **Scrittura vera di YNOY** «riga per riga in ordine come in scrittura» (come una mano in tempo reale): Y, N, O, Y, svolazzo sotto, trattini a sinistra, CORP. Strada tecnica scelta: SVG con il logo `media/ynoy.png` come maschera e, sopra, tratti spessi (`stroke-width` ≈ spessore lettera) lungo le linee centrali di ogni tratto, animati con `stroke-dasharray`/`stroke-dashoffset` uno dopo l'altro: il tratto che avanza «disegna» il logo. Linee centrali: ricavarle con lo scheletro dell'immagine (`skimage.morphology.skeletonize` su `media/ynoy.png`, 496×190, canale A), poi ripulirle e ordinarle a mano per tratto (percorsi SVG in coordinate 496×190). Durata scrittura ~1,2-1,6 s, velocità come una penna (più lenta nelle curve). Niente punta di luce. Mascherare con SVG `<mask>` (non CSS mask + transform) e controllare su Android che non compaiano righe/riquadri.
2. **Uscita di YNOY**: nuove proposte sobrie ed eleganti (E19: prima 1 immagine con 2-3 bozze ferme, Mario sceglie, poi si costruisce solo quella). Idee: (a) YNOY e BY restano e sfumano insieme a JONA quando entra l'app; (b) la scrittura si «ritira» al contrario, piano; (c) inchiostro che si asciuga: lieve sfumatura verso il colore dello sfondo. Ricorda: Mario vuole che BY e YNOY non escano «come foto unica».
3. Poi: aggiornare `tools/test-apertura-v62.mjs` (stati a istanti fissi con `getAnimations()`), NEWS v62, prove legate con `TZ=Europe/Rome` (test-apertura-v62, test-logo, test-barra, test-news, test-giro), video d'anteprima a Mario, «ti piace?», poi pubblicare (PR da `claude/v62-logo`, squash, controllo online, merge di `main` nel ramo di lavoro).

## Strumenti
- `tools/video-apertura.mjs` (su questo ramo consegne, aggiornato): `node tools/video-apertura.mjs <cartella> [ea|eb|ec]` con server `python3 -m http.server 8765` nella cartella del progetto; ignora i `setTimeout` 3800/4100, ferma le animazioni a 30 fps fino a 3,9 s; poi `ffmpeg -framerate 30 -i f%04d.png … -c:v libx264 -pix_fmt yuv420p` → mp4. Fogli di fotogrammi con `ffmpeg … select=…,crop=780:520:0:1168,tile=…` (zona della firma). NON metterlo sul ramo v62 (conflitto con questo ramo, E7).
- File mandati a Mario (sul ramo v62): `docs/img/v62-apertura.mp4`, `docs/img/v62-apertura-fotogrammi.png`, `docs/img/v62-uscita-A/B/C.mp4`, `docs/img/v62-uscita-scelta.png`.

## Ancora da chiedere (dopo D13)
- Esito di M25 (prova dell'agenda con Mauro): senza risposta.
- D10 (riquadro «Inviato allo chef»: solo «Continua»): senza risposta.
- Poi `docs/DA-FARE.md`.

## Rischi aperti
- Server locale ed emulatore si spengono a ogni riavvio del contenitore (`tools/README.md`).
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #44 · Jona Ordini · da v61 · 09/10/2026 · prossimo: YNOY scritto a mano v62`.
