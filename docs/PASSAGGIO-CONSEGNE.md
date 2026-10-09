# Passaggio di consegne (2026-10-09, fine sessione #42)

Sessione attuale: #43

## Ultimo messaggio di Mario (#42), parola per parola
«il mio logo fa' un effetto contrario soarisce veloce e si avvia subito  l'app con l'animazione logo netflix dai per capirci e il logo Jona quando arriva nella sua posizione della pagina deve dare un senso di appoggio pesantezza colpo non animazioni banali le voglio elaborate»
(Risposta non ancora data nel merito: la #43 rifà l'animazione, vedi sotto.)

Messaggio prima: «puoi fare un effetto nel logo jona che arriva zommato e si posiziona nel suo posto come se dovesse arrivare dal davanti allo schermo e poi il mio logo va via nello schermo commandosi e sparendo hai capito l'idea? prova»

## Stato
- Online: **v61** (`sw.js` CACHE `jona-ordini-v65`). Nessuna PR aperta.
- Ramo `claude/v62-logo` (da `main`, pushato, commit `6917c4f`), **NON pubblicato**: v62 = prima prova dell'apertura + tolto `cutoutFix()`. `APP_VER=62`, NEWS v62, CACHE `jona-ordini-v66`. Prove legate verdi (test-apertura-v62, test-barra, test-logo, test-news, test-giro, con `TZ=Europe/Rome`).
- Anteprima mandata: `docs/img/v62-apertura.mp4` (sul ramo v62). Mario: NON va bene così (ultimo messaggio).

## D13 — apertura da rifare (prossimo lavoro)
Cosa c'è ora nel ramo v62 (index.html, CSS dopo `@keyframes ynoyShine`): `.intro .splash .logo-full` → `jonaIn` (scala 3,4 → 1, 1,3 s); `.wall-sub` da 0,9 s; firma `.wall-by` entra 1,1-2,3 s (`byIn`/`ynoyIn`/`ynoyShine`) e `byOut` (scala 0,05, 3,5-4,3 s); `.splash{overflow:hidden}`. Fine apertura: `setTimeout(end,4400)` in `S.splash` (riga ~5239 «if(ls('jona_me')&&!animOff()…»), `.intro` tolta a 4700.
Cosa vuole Mario:
- JONA: arriva e si posa con **peso, appoggio, colpo** (impatto): es. arrivo veloce da grande, schiacciamento all'impatto (scala 0,96 / leggero squash), piccolo rimbalzo, scossa della pagina, onda d'urto/polvere o ombra che si allarga sotto, bagliore. «Non banali, elaborate».
- Firma YNOY: effetto «contrario», **come il logo Netflix**: arriva/si accende e poi sparisce veloce zoomando VERSO chi guarda (si ingrandisce e passa attraverso lo schermo), e l'app parte subito dopo (accorciare il tempo totale dopo l'uscita).
- Attenzione: niente `filter:blur` su elementi con maschera (`.logo-full`, `.wall-by i`): righe bianche su Android (nota v53). Ombre/onde con elementi separati o pseudo-elementi senza maschera. `overflow:hidden` sulla `.splash` per lo zoom.
- Metodo: video d'anteprima con `tools/video-apertura.mjs` (uso: `node tools/video-apertura.mjs <cartella>`, server su 8765; Playwright, `navigator.webdriver` finto false, `setTimeout` 4400/4700 ignorati, animazioni ferme con `getAnimations()` e `currentTime` a 30 fps, poi `ffmpeg` → mp4 780 px) + foglio di 10 fotogrammi da guardare PRIMA di mandare (E17). Aggiornare `tools/test-apertura-v62.mjs` (controlla gli stati a istanti fissi, non dipende dai tempi; nomi delle animazioni `jonaIn`/`byOut` da adeguare) e NEWS v62. Poi chiedere a Mario «ti piace?» (aspetto = sua scelta) e pubblicare: PR da `claude/v62-logo`, squash, controllo online, merge di `main` nel ramo di lavoro.

## Banda nera in alto — CHIUSA
- Causa trovata: con `display: fullscreen` Chrome mette apposta il nero nella zona fotocamera (`LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT`); `viewport-fit=cover` vale solo con la richiesta di schermo intero (avviso di Chrome). Fonte: https://github.com/whisper-money/whisper-money/pull/1080
- Scelta A/B mandata (`docs/img/v62-barra-scelta.png`): Mario voleva «B senza orario e batteria» → impossibile dall'app.
- Telefono di Mario: **Xiaomi 17 Ultra** (HyperOS). Impostazioni › Notifiche e barra di stato › **Notch nelle singole app** (scelte «Automatico» / «Mostra sempre il notch»): messo Jona Ordini su «Mostra sempre il notch» → nessun cambiamento. Mario: «per ora lo lascio così». Confermato che nemmeno nella sola schermata d'apertura si può.
- Screenshot di Mario salvati: `docs/img/segnalazioni/v62-ricerca-*.jpg`, `v62-notch-*.jpg`, `v62-notch-dopo.jpg`.
- `cutoutFix()` tolto nel ramo v62 (C8 in `docs/DA-FARE.md`, si chiude con la pubblicazione della v62).

## Da fare nella #43 (ordine)
1. D13: rifare l'apertura come sopra, anteprima a Mario, poi pubblicare la v62.
2. Chiedere l'esito di M25 (prova dell'agenda con Mauro); la domanda era stata fatta, senza risposta.
3. D10 (riquadro «Inviato allo chef»: solo «Continua»): ancora senza risposta.
4. Poi `docs/DA-FARE.md`.

## Rischi aperti
- Server locale ed emulatore si spengono a ogni riavvio del contenitore (`tools/README.md`).
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #43 · Jona Ordini · da v61 · 09/10/2026 · prossimo: apertura logo v62`.
