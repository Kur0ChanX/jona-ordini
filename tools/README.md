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
   - `node tools/test-firebase-backup.mjs` (copie automatiche: pezzi sotto 1 MB, lista, scarica, ripristina, pulizia oltre 14 giorni, modalità locale)

Le prove Firebase impostano `localStorage.jona_fb_emu` e una configurazione finta (`projectId: demo-jona`), ma `firebase-config.js` ha la precedenza: svuota anche il progetto `jona-ordini` (stessi due `curl` con `jona-ordini` al posto di `demo-jona`). Le prove in modalità locale (`test-staff`, `test-news`, `test-voice`, `test-report`) nascondono da sole `firebase-config.js` (`route` che risponde `self.JONA_FIREBASE=null`). `test-firebase-flow` fallisce tra le 23:30 e mezzanotte (ora limite «tra 30 minuti» cade nel giorno dopo).

## Altre prove
- `node tools/test-scaglione2.mjs`: prodotto urgente (carrello, richiesta in cima, notifica «URGENTE», riga d'ordine), controllo merce con chi aveva chiesto (notifica a Maurizio e a chi aveva chiesto), aumento prezzi all'import (avviso con percentuale, riepilogo, notifica).
- `node tools/test-voice.mjs`: ordine a voce (parser di 35 frasi, riconoscimento vocale finto, conferma, carrello, campo di testo se il telefono non ha il riconoscimento).
- `node tools/test-report.mjs`: Consumi e costi (totali calcolati a mano, filtri, grafico, Excel). Serve una copia di SheetJS: `curl -o /tmp/xlsx.full.min.js https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`.
- `node tools/test-firebase-report.mjs` (con l'emulatore): con più di 300 ordini il resoconto scarica dal database quelli più vecchi.
- `node tools/test-news.mjs`: Novità (contatore per ruolo, contenuto per staff/chef/sviluppatore, intestazione a 320 px, tema scuro).
