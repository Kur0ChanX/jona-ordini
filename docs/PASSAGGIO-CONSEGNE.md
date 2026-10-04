# Passaggio di consegne (2026-10-04)

## Stato attuale
- **v21**: un iPhone nuovo aperto dal link d'invito restava per sempre su «Un momento…». Ora `connect` in `FirebaseStore` ha tempi massimi (`fbTmo`, 20 s su accesso e iscrizione `membri`, 12 s su `pubblico/stato`), errore `fb_slow` → schermata «Il collegamento non riesce» con Riprova, e `jona_fb_lp` forza il long polling di Firestore al tentativo dopo (`fbInit`). `render()` subito dopo la creazione del database. `APP_VER=21`, `CACHE=jona-ordini-v25`. Prova `tools/test-invito-bloccato.mjs`. Causa esatta sull'iPhone del collega non ancora confermata: farlo riprovare.
- Online la **v20** (PR #30, squash `98363e3`): Gemini dal server del ristorante. `APP_VER=20`, `CACHE=jona-ordini-v24`. File online identici, Worker pubblicato (`/salute` → `gemini:false` finché Mario non mette il segreto). Ramo riallineato con `git merge origin/main`.
- v20: Worker `/gemini` (segreto `GEMINI_KEY` copiato dal segreto GitHub `GEMINI_API_KEY` dal workflow; solo telefoni in `membri/<uid>` col gettone Firebase; 429 → attesa `retryDelay`, poi `gemini-flash-lite-latest`; tetto ~25 s). App: `gemCall`, `gemSrvOk`, `gemOn` (chiave del telefono se c'è, altrimenti server, solo con Firebase). Prova `tools/test-gemini-server.mjs` (29). Foto già ridotte a 2000 px (`shrinkImg`).
- **Da fare per Mario:** creare la chiave su aistudio.google.com, metterla nel segreto GitHub `GEMINI_API_KEY`, rilanciare il workflow «Pubblica server notifiche».
- Versioni di oggi: v14 orari, v15 animazione invio + «È urgente», v16 ordine suggerito / timbratura QR (spenta) / cambi turno / contratto solo per l'amministratore + consenso sugli errori, v17 chat + «Chiedi a Jona», v18 fornitori con logo e schede grandi + animazione nuova.
- Regole Firestore con `messaggi` pubblicate da Mario: chat verificata sul suo telefono (spunta ✓ = scritto sul server).
- Prove tutte verdi: `test-invio-anim` 14, `test-v16` 42, `test-v17` 29, `test-orari` 70, `test-staff` 35, `test-news` 94, `test-scaglione2` 20, `test-voice` 83, `test-report` 63; con l'emulatore `test-firebase-chat` 13, `test-firebase-orari` 18, flow, push, approva-arrivi, backup.
- Mario non ha accesso al telefono di Maurizio: le prove a due telefoni si fanno con una scheda in incognito e i «Dati di prova» (test1 / prova123).

## Idee parcheggiate da Mario (non farle finché non le richiede)
Foto della confezione → carrello (via `/gemini`), allarme quantità strana, «Rifai come martedì scorso», mancanti riordinati, risposta del fornitore letta dallo screenshot. Codice a barre scartato (molti prodotti non lo hanno). Anche le idee personale/HACCP/allergeni/inventario/stagione: non servono per ora.
- Rischio noto: `/invia` del Worker non controlla chi chiama (proteggerlo come `/gemini`, attenzione a `sw.js` Background Sync che non ha il gettone).

## Domanda aperta di Mario (in attesa, parcheggiata)
> «pensi che la parte dei caricamenti dei listini sia abbastanza potente automatizzata e completa?»
Già esiste: Excel/CSV, fattura XML (FatturaPA), tabella incollata, foto lette da Gemini, revisione con abbinamento ai prodotti (`matchProd`) e avviso aumenti (`rvUps`). Mancano (idee da proporre e far scegliere): PDF dei listini (pdf.js è già in `LIB`), fattura XML che aggiorna i prezzi e controlla la merce arrivata in un colpo, abbinamento intelligente dei nomi (sinonimi, unità diverse kg/conf), storico prezzi per prodotto con grafico, listino condiviso da email o WhatsApp direttamente nell'app, avviso «listino vecchio» dopo N giorni.

## File e funzioni principali di oggi (`index.html` salvo dove indicato)
- Orari: `config/orari_<lunedì>` (`t` bozza, `tp` pubblicata, `ok.<persona>` errori accettati, `cambi.<id>`), `orCheck`, `vOrari`, `orCellSheet`, `orPublish`, `vMieiOrari`, `orConsent`. Contratto in `staff.contratto`, modificabile solo con `isGM`.
- Timbratura: `config/app.timbra` (spenta), `timbraK`, `config/timbr_<lunedì>`, `tbPunch`, `tbOpen`, `tbScanSheet`, `tbExcel`; `lib/jsqr-1.4.0.js`.
- Ordine suggerito: `sugStats`, `sugRows`, `sugSheet`, `sugAdd`, `meteo()` (Open-Meteo, `METEO_POS` Porto Cervo).
- Chat: collezione `messaggi` fuori da `S.db` (come le push), `CHAT`, `chWatch`, `chPaint`, `messaggi/letti`; chat `tutti`, `rep_<reparto>`, `dm_<a>--<b>`.
- «Chiedi a Jona»: `jonaCtx`, `jonaAsk`, `jonaMic` (Gemini, chiave `jona_gemini_key`).
- Fornitori: `fDot` (logo o iniziale), `fornitori.logo` (data URL ≤320 px, `fileToLogo`), `.fgrid`/`.fcard`.
- Animazione: `media/invio-chef.mp4` (alpha impilato 720×808, v19: invertito nel tempo con ffmpeg `reverse`, lo chef a sinistra porge il menù; non specchiare, il logo si leggerebbe al contrario), `sendAnim`; rifare con `python3 tools/anim-invio.py <video> 4.2 0.12 0.12` e poi `reverse` (rembg + scipy + ffmpeg; memoria in `/tmp/anim-invio-cache`). Sorgente attuale: il video nuovo di Mario (menù verticale), tagliato a 4,2 s.
- Prove nuove: `tools/test-orari.mjs`, `test-invio-anim.mjs`, `test-v16.mjs`, `test-v17.mjs`, `test-firebase-orari.mjs`, `test-firebase-chat.mjs` (vedi `tools/README.md`).

## Decisioni e motivi
- Pubblicazione senza force: squash merge, poi `git merge origin/main` sul ramo e push normale.
- Orari, timbrature e cambi in `config` (nessuna regola nuova); la chat ha la sua collezione e parla con Firestore direttamente, così con regole vecchie l'app non si blocca.
- Video con trasparenza «impilata» in H.264 + WebGL: i video trasparenti WebM/HEVC non vanno su tutti i telefoni (iPhone).
- Gli errori dei turni non bloccano: si salvano solo con «Salva lo stesso» (consenso registrato).
- Contratti nascosti allo staff (lamentele sulle ore fuori contratto), mandati a Gemini solo se chiede l'amministratore.

## Prossimi passi
1. Rispondere a Mario sulla domanda dei listini (2-3 strade con pro e contro), poi fare quella scelta.
2. Altre idee in coda (`docs/RICHIESTE-MARIO.md`): bolla letta dalla foto, scadenze «da usare oggi», registro sprechi, bacheca del servizio, checklist apertura/chiusura; più lingue; notifiche in più per i ragazzi.
3. Mario deve provare sul telefono v13-v18.

## Rischi e note aperte
- Animazione: per circa un decimo di secondo la mano dello staff, mossa e sfocata, si perde nello scontorno; si nota appena.
- Chat: tutti i telefoni collegati scaricano tutti i messaggi, anche privati (scritto in `docs/FIREBASE.md`).
- Il Chromium di Playwright non legge l'H.264: `test-invio-anim` usa una copia WebM. Nella sessione cloud il controllo online si fa confrontando gli hash.
- Dopo un riavvio della sessione va riacceso il server locale (`python3 -m http.server 8765`) e, per le prove Firebase, l'emulatore (svuotare `demo-jona` e `jona-ordini`).
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte: non è un errore dell'app.
- Background Sync non esiste su iPhone; il promemoria del contesto può segnalare troppo presto.
