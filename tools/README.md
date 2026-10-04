# Prove automatiche

Servono Playwright e Chromium (`/opt/pw-browsers/chromium`, già presenti nelle sessioni cloud di Claude Code).

1. Sito in locale, dalla cartella del progetto: `python3 -m http.server 8765`
2. Interfaccia staff, soliti, doppioni (modalità locale): `node tools/test-staff.mjs`
3. Firebase con l'emulatore (serve Java):
   - dalla cartella del progetto (usa `firebase.json` e le regole vere): `npx firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`
   - prima di ogni prova svuota l'emulatore:
     `curl -X DELETE "http://127.0.0.1:8080/emulator/v1/projects/demo-jona/databases/(default)/documents"` e
     `curl -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-jona/accounts"`
   - `node tools/test-firebase-sync.mjs` (attivazione, invito, sincronizzazione, senza rete, chiave sbagliata)
   - `node tools/test-firebase-bulk.mjs` (300 prodotti, backup e ripristino)
   - `node tools/test-firebase-flow.mjs` (dati di prova, approvazione, ora limite, riepilogo)
   - `node tools/test-firebase-push.mjs` (notifiche push: attiva, prova, chi riceve cosa, iscrizioni scadute, uscita e rientro, spegni)
   - `node tools/test-firebase-approva-arrivi.mjs` (approvazione a blocchi per fornitore con «+ Aggiungi», controllo arrivo a semaforo e invio parziale, invii in sospeso: coda delle push, avviso, SMS, «Arrivata ✓», telefono senza rete)
   - `node tools/test-firebase-orari.mjs` (orari: `t.<persona>` su Firestore cambia solo quella persona, pubblica, notifica e vista dello staff su un altro telefono; timbratura annidata e cambio turno approvato)
   - `node tools/test-firebase-chat.mjs` (chat: con le regole vecchie l'app non si blocca e la chat spiega come attivarla; poi messaggi tra due telefoni, avviso, spunte blu, `messaggi/letti` annidato). Cambia le regole dell'emulatore con l'indirizzo `:securityRules` e alla fine rimette quelle del file.
   - `node tools/test-firebase-telefoni.mjs` (v24: telefono nuovo in attesa senza dati, regole, profilo nuovo che entra da solo, «ho già un profilo», rifiuto e nuova richiesta, telefoni vecchi senza `ok`, chat subito dopo il ritorno in primo piano). Le altre prove Firebase approvano B da A subito dopo l'invito.
   - `node tools/test-firebase-backup.mjs` (copie automatiche: pezzi sotto 1 MB, lista, scarica, ripristina, pulizia oltre 14 giorni, modalità locale)

Le prove Firebase impostano `localStorage.jona_fb_emu` e una configurazione finta (`projectId: demo-jona`), ma `firebase-config.js` ha la precedenza: svuota anche il progetto `jona-ordini` (stessi due `curl` con `jona-ordini` al posto di `demo-jona`). Le prove in modalità locale (`test-staff`, `test-news`, `test-voice`, `test-report`, `test-scaglione2`, `test-orari`) nascondono da sole `firebase-config.js` (`route` che risponde `self.JONA_FIREBASE=null`). `test-firebase-flow` fallisce tra le 23:30 e mezzanotte (ora limite «tra 30 minuti» cade nel giorno dopo).

## Altre prove
- `node tools/test-scaglione2.mjs`: prodotto urgente (carrello, richiesta in cima, notifica «URGENTE», riga d'ordine), controllo merce con chi aveva chiesto (notifica a Maurizio e a chi aveva chiesto), aumento prezzi all'import (avviso con percentuale, riepilogo, notifica).
- `node tools/test-voice.mjs`: ordine a voce (parser di 35 frasi, riconoscimento vocale finto, conferma, carrello, campo di testo se il telefono non ha il riconoscimento).
- `node tools/test-report.mjs`: Consumi e costi (totali calcolati a mano, filtri, grafico, Excel). Serve una copia di SheetJS: `curl -o /tmp/xlsx.full.min.js https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`.
- `node tools/test-firebase-report.mjs` (con l'emulatore): con più di 300 ordini il resoconto scarica dal database quelli più vecchi.
- `node tools/test-orari.mjs`: Orari del personale (contratto nel profilo, turno tipo su più giorni, controlli 11 ore / giorni liberi / ore / pausa, turni tipo, copia settimana, pubblica e notifiche solo a chi cambia, lo staff vede solo i suoi turni pubblicati, 320 px senza scorrimento della pagina, tema scuro).
- `node tools/test-invio-anim.mjs`: animazione «Inviato allo chef» (pulsante «È urgente», canvas trasparente con mani e menù, scritta finale, foglio solito dopo, tocco per saltare, tema scuro, «riduci movimento» e video mancante). Il Chromium di Playwright non legge l'H.264: la prova crea con ffmpeg una copia WebM in `/tmp` e blocca il service worker.
- `node tools/test-v16.mjs`: ordine suggerito (storico finto e meteo finto: cadenza, uso al giorno, pioggia −10%, «Evento», quantità cambiate a mano, aggiunta all'ordine), timbratura (spenta di partenza, accensione, QR da stampare, «Timbra senza QR», dopo mezzanotte, fotocamera finta che legge il QR vero con `--use-file-for-fake-video-capture`, QR vecchio rifiutato, tabella e presenze in Excel), cambio turno (chiesto, accettato, approvato con il controllo delle regole, annullato). Serve `/tmp/xlsx.full.min.js` (la scarica da sola).
- `node tools/test-v17.mjs`: «Chiedi a Jona» con Gemini finto (dati mandati, grassetto ed elenco, chiave sbagliata, senza rete, contratti solo per l'amministratore) e chat (gruppi per ruolo e reparto, messaggi diretti, Invio e Maiusc+Invio, letti e spunte blu, avviso, 320 px, tema scuro).
- `node tools/test-gemini-server.mjs`: v20, `/gemini` del Worker con fetch finto (solo membri, 429 → attesa `retryDelay` e modello Lite, errori) e `gemCall` nell'app senza chiave sul telefono (gettone Firebase, messaggi d'errore, «Chiedi a Jona»).
- `node tools/test-invito-bloccato.mjs`: v21, link d'invito con i server di Google che non rispondono (Firestore e accesso fermati con `route`): subito «Collegamento al ristorante…», dopo 20 s «Il collegamento non riesce» con Riprova, `jona_fb_lp` e long polling al tentativo dopo. Non serve l'emulatore.
- `node tools/test-registrazione.mjs`: v22, registrazione dello staff (modulo salvato in `jona_reg` e ripristinato se la pagina si ricarica durante la foto, foto 4000×3000 ridotta, «In attesa di approvazione», entrata automatica quando il profilo diventa attivo, «Entra con un altro profilo», profilo cancellato; v23: nome utente proposto da nome e cognome, accenti e apostrofi, messaggi d'errore). Serve ffmpeg.
- `node tools/test-news.mjs`: Novità (contatore per ruolo, contenuto per staff/chef/sviluppatore, intestazione a 320 px, tema scuro).
