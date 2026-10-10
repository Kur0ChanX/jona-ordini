# Passaggio di consegne (2026-10-10, fine sessione #62)

Sessione attuale: #63

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v69** (main `76c3416`). **v70 pronta sul ramo, NON ancora pubblicata** (primo lavoro di #63).

## Sessione #63 (in corso, nuovo account)
- Cambio account fatto: ora si lavora nel secondo account (quello del Relais). Dettagli, ambienti e routine in `docs/CAMBIO-ACCOUNT.md` («Cambio del 10/10/2026»).
- Scorta unita e pushata (`c7487fc`). PR #81 (v70) già aperta da #62: prove ripartite sul nuovo commit (solo documenti in più).
- Ultimo messaggio di Mario (17:21): «Eccomi ho cambiato account passa tutto qui da mario.miscera@gmail.com eri già pronto a passare tutto ma proprio tutto / Ho messo un abiente a caso sono uguali guarda differenziamoli se no è un problema»

## Ultimi messaggi di Mario (#62), parola per parola
1. «prima aggiorna il mio logo con questa coda il resto tieni il tuo e rifai l'animazione anche vettoriale e inviami poi i file aggiornati valuta migliorie e valuto» (con il disegno `docs/img/logo/ynoy-coda-mario-2026-10-10.jpg`)
2. «ricordati il tuo nuovo quello dell'app questo in foto ho fatto screenshot prendilo come riferimento gli altri con la & eliminali» (screenshot dell'apertura: `docs/img/logo/riferimento-app-2026-10-10.jpg`)
→ Fatto (sotto). Gli ho mandato i file e chiesto quale miglioria preferisce (M31): **risposta non ancora arrivata**. La sua domanda precedente («Parto con D29?») è rimasta senza risposta: il logo è venuto prima.

## Fatto in #62
- All'avvio: scorta unita (solo `docs/ULTIMO-MESSAGGIO.md`, era un avviso GitHub della PR #80 già unita).
- **v70, logo YNOY con la coda nuova** (commit `b39b8cf` + `7f7f0e6`, pushati):
  - Il disegno di Mario è lo stesso logo con coda diversa (punta a forcella sotto lo svolazzo + 4 lune al posto dei trattini e dello svolazzo sottile). Allineato al logo dell'app con OpenCV ECC (corrispondenza 0,9986 sulle lettere), coda presa dal disegno da y≥497 e x<800 (la Y finisce a y 494), sfumata 760-800 sullo svolazzo. CORP resta quello dell'app (senza «&», v53).
  - **`media/ynoy.svg`** = nuovo originale vettoriale (potrace a 3×, 16 contorni, evenodd, viewBox 496×190 nelle stesse coordinate della maschera). Nota: `potracer` traccia i pixel False → si passa l'inchiostro negato.
  - `tools/logo-ynoy.py` riscritto: dal vettoriale fa `media/ynoy.png` (ora 992×380, più nitido) e `docs/img/logo/ynoy-2000.png` (serve `pip install cairosvg`). Scala nuova 0,304 (era 0,313) perché le lune scendono più in basso: logo largo **177 px** (era 172) in `.wall-by i` e `.splash .yn`.
  - `tools/ynoy-tratti.py`: coordinate dei tratti convertite + coda nuova (tratto `S` fino alla punta, punta della forcella, 4 tratti `K` per le lune; la luna piena ha un giro stretto). 73 pixel scoperti su 50897.
  - **`tools/ynoy-html.py`** (nuovo): mette i tratti nella maschera `#ywm` di `index.html` (durata 0,03 s + 0,000647 s/unità, scalati 1,2-2,8 s; `--o`=100+100·(w/2+0,3)/len) e scrive `docs/img/logo/ynoy-animazione.svg` (animazione vettoriale autonoma).
  - Tolti (richiesta di Mario): `tools/originale-ynoy.jpg`, `docs/img/logo-senza-e-scelta.png`, `docs/img/v53-logo-b-prima-dopo.png` (restano nella storia git). Nelle Novità vecchie «YNOY&CORP» → «YNOY CORP».
  - `APP_VER=70`, voce NEWS v70, `CACHE` `jona-ordini-v74`. `tools/test-apertura-v62.mjs`: 22 tratti (era 19). README aggiornato.
  - Prove: `test-logo` OK, `test-apertura-v62` 28 PASS, `test-giro` «nessun problema».
  - Mandati a Mario: `v70-prima-dopo.png`, `v70-apertura-app.mp4`, `ynoy-animazione.mp4`, `media/ynoy.svg`, `ynoy-animazione.svg`, `ynoy-2000.png` (tutti in `docs/img/logo/` tranne lo svg).

## Prossimi passi (#63)
1. **Pubblicare v70** (D30), senza chiedere (regola PUBBLICA SEMPRE IN AUTOMATICO): ramo `claude/jona-v70-logo-coda` da `claude/jona-ramo-definitivo` → PR verso main → «Prove automatiche» verde → squash → controllo online `APP_VER=70` → `git fetch origin main && git merge origin/main` nel ramo definitivo + push. Avvisare Mario in una riga.
2. Aspettare la scelta di Mario sulla miglioria (M31). Proposte: Ovvia = logo più grande all'apertura (le lune sul telefono sono ~2 mm); Furba = le 4 lune cadono una dopo l'altra con rimbalzo (come «BY»); **Geniale (consigliata)** = le 4 lune come segno di attesa nell'app (Gemini che legge le foto, salvataggi); Nessuna.
3. Poi D29 (ottimizzazione Android/iPhone/Mac/Windows, piano in `docs/DA-FARE.md`).

## Da fare per Mario (aperto)
- Riga del ramo nelle preferenze personali dei due account (testo in consegne #61 / `docs/CAMBIO-ACCOUNT.md`).
- Provare v69 (riga verde «costa … in meno» → **Passa**) e v70 (riaprire l'app, guardare l'apertura).
- Elenco completo: `docs/DA-FARE.md`.

## Note tecniche
- Strumenti installati con pip in #62 (non restano nel contenitore nuovo): scikit-image, opencv-python-headless, potracer, cairosvg.
- Video dell'apertura: server `python3 -m http.server 8765`, `node tools/video-apertura.mjs <cartella>` (117 fotogrammi), poi ffmpeg.

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00: commit+push dopo ogni passo.
- Android: maschera SVG intorno a YNOY (D14) mai provata da Mario; la v70 usa lo stesso metodo.
