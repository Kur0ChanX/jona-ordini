# Passaggio di consegne (2026-10-09, fine sessione #44)

Sessione attuale: #45

## Ultimo messaggio di Mario (#44), parola per parola
«b»
(risposta alla domanda «Per il colpo di JONA quale scegli: A, B, C o Nessuna?» → scelta **B**, granelli piccolissimi rasoterra)

Messaggi prima (#44), parola per parola:
- «scrittuta normale veloce molto bella e fluida quasi tutto perfetto se riesci a migliorare la polvere o bagliore nuvola in jona quando sbatte che lo vedo bruttino e amatoriale invece quelli sotto i cerchi sono belli»
- «si» (parti con la scrittura a mano di YNOY)

## Stato
- Online: **v61** (`sw.js` CACHE `jona-ordini-v65`). Nessuna PR aperta.
- Ramo `claude/v62-logo` (pushato, ultimo commit `4a6801e` «anteprime delle 3 proposte per il colpo di JONA»), **NON pubblicato**. `APP_VER=62`, CACHE `jona-ordini-v66`.
- Lavorare sul ramo `claude/v62-logo` per il codice; appunti (consegne, DA-FARE, strumenti di anteprima) solo su questo ramo consegne (E7).

## Fatto in #44 (sul ramo v62)
- **YNOY scritto a mano** — Mario: «molto bella e fluida», da tenere così.
  - `tools/ynoy-tratti.py` (sul ramo v62): scheletro di `media/ynoy.png` (skimage, al doppio 992×380), 19 tratti con punti di passaggio in ordine di scrittura (Y, N in 3 tratti, O, Y, grande ricciolo unico dalla punta della Y fino all'estremità sinistra dello svolazzo, trattini con linea Catmull-Rom, curva interna, C-O-R-P). Stampa JSON `{l,w,len,d}` (coordinate 496×190); controlla la copertura (99,7%, i pochi pixel scoperti spariscono quando compare `.y0`). Con un argomento-cartella salva `copertura.png`. Serve `pip install scikit-image`.
  - In `index.html`: dentro `.yn` uno `<svg class="ywr" viewBox="0 0 496 190">` con `<mask id="ylg" style="mask-type:alpha">` (immagine del logo) e `<mask id="ywm">` (i 19 `<path pathLength="100">` bianchi, `stroke-width` per tratto, `--o` = offset iniziale che nasconde anche il tappo tondo, `animation-delay`/`duration` calcolati: inizio 1,2 s, fine 2,8 s, velocità uguale per tutti, pausa fissa 0,03 s (0,015 per CORP)); `<rect fill="#DDD3C8">` mascherato da entrambi. Poi `.y0` (vecchio div con maschera CSS) compare a 2,80 s con `ynoyShine` (riflesso). Animazione CSS `yStroke` (`stroke-dasharray:100 300`, offset `var(--o)`→0).
  - Tolti: punta di luce `.pen`/`yPen`, tendina `yWrite`, le 3 uscite `ea/eb/ec` (`.yp`, `.yw`, `.ydot`, `.ycut`, `.yh1/.yh2`, `self.JONA_ESCI`). Uscita provvisoria: `.yn` fa `jAway` a 3,4 s insieme a JONA e BY.
  - La riga di commento in cima al blocco CSS v62 (riga ~89, «la firma fa un passo indietro e poi vola verso chi guarda») è VECCHIA: aggiornarla.
- **Colpo di JONA**: Mario trova «bruttino e amatoriale» il bagliore `.jfl`/`jFlash` (alone grande quasi quadrato) e i 12 puntini `.jd`/`jDust`. **Gli piacciono le onde `.jrg`** (e l'ombra resta). Proposte A (nebbiolina), **B (scelta)**, C (riga di luce): `docs/img/v62-colpo-scelta.png/.mp4` sul ramo v62.

## Prossimo lavoro (#45)
1. **Mettere la variante B nel ramo v62**: togliere da HTML e CSS `.jfl`/`jFlash` e i 12 `.jd`/`jDust`; aggiungere 34 granelli `.jpb`. Il prototipo esatto è in `tools/colpo-varianti.mjs` (su QUESTO ramo consegne; variante `B`): ogni granello `<b class="jpb" style="--x;--y;--s(1-3px);--o(.35-.9);--t(.7-1.3s);--d(.55-.63s);margin-left">`, generati con numeri pseudo-casuali fissi (`sin(i*k)`), metà a sinistra metà a destra, `bottom:-6%`, colore `#EDE6DF`, keyframe `pb` (sale a `--o`, poi va a `translate(--x,--y)` e sparisce). Nel codice vero: scrivere i valori fissi nell'HTML come per i vecchi `.jd`, selettori `.intro .splash .jpb`. Controllare con un foglio di 9-12 fotogrammi (E17) e un video.
2. **Uscita di YNOY**: nuove proposte sobrie (E19: prima 1 immagine con 2-3 bozze ferme, Mario sceglie, poi si costruisce solo quella). Idee: (a) BY e YNOY sfumano insieme a JONA (è la provvisoria di adesso); (b) la scrittura si ritira al contrario, piano (gli stessi tratti con offset da 0 a `--o`); (c) inchiostro che si asciuga e sfuma verso il colore dello sfondo. Ricordo: Mario non vuole BY e YNOY che escono «come foto unica».
3. Poi: aggiornare `tools/test-apertura-v62.mjs` (oggi FALLISCE: cerca ancora `byOut`/`.wall-by` vecchi e le uscite; controllare a istanti fissi con `getAnimations()`: SVG `.ywr` con 19 path, `.y0` visibile dopo 2,8 s, niente `.jfl`/`.jd`, granelli `.jpb` presenti), NEWS v62 da riscrivere (ora parla della firma che «vola verso di te»), prove legate con `TZ=Europe/Rome` (test-apertura-v62, test-logo, test-barra, test-news, test-giro), video d'anteprima finale a Mario, poi pubblicare senza chiedere se le prove sono verdi (PR da `claude/v62-logo`, squash, controllo online, merge di `main` nel ramo di lavoro).
4. Controllare su Android che la maschera SVG non mostri righe o riquadri (nota v53: niente effetti strani su elementi con maschera).

## Strumenti (su questo ramo consegne, NON metterli sul ramo v62)
- `tools/video-apertura.mjs`: `node tools/video-apertura.mjs <cartella>` (il secondo argomento delle uscite non serve più) con `python3 -m http.server 8765` nella cartella del progetto; ferma le animazioni a 30 fps fino a 3,9 s. Va lanciato da dentro `tools/` del progetto (importa Playwright da `/opt/node22/lib/node_modules/playwright`). Poi `ffmpeg -framerate 30 -i f%04d.png -c:v libx264 -pix_fmt yuv420p` → mp4. Inquadratura firma: `crop=440:340:170:1250` (schermo 780×1688). Inquadratura colpo: `crop=780:600:0:560`.
- `tools/colpo-varianti.mjs`: `node tools/colpo-varianti.mjs <cartella>` → fotogrammi `A/B/C0000.png` 0-1,9 s (toglie `.jfl`/`.jd` e inietta la variante). Nota: il prefisso automatico dei selettori nel CSS iniettato copre solo il primo selettore di una lista.
- File mandati a Mario in #44 (sul ramo v62): `docs/img/v62-scrittura.mp4`, `v62-scrittura-lenta.mp4`, `v62-scrittura-fotogrammi.png`, `v62-colpo-scelta.png/.mp4`.

## Ancora da chiedere (dopo D13)
- Esito di M25 (prova dell'agenda con Mauro): senza risposta.
- D10 (riquadro «Inviato allo chef»: solo «Continua»): senza risposta.
- Il resto in `docs/DA-FARE.md`.

## Rischi aperti
- Server locale ed emulatore si spengono a ogni riavvio del contenitore (`tools/README.md`).
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #45 · Jona Ordini · da v61 · 09/10/2026 · prossimo: colpo JONA variante B v62`.
