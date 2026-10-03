# Prove automatiche

Servono Playwright e Chromium (`/opt/pw-browsers/chromium`, già presenti nelle sessioni cloud di Claude Code).

1. Sito in locale, dalla cartella del progetto: `python3 -m http.server 8765`
2. Interfaccia staff, soliti, doppioni (modalità locale): `node tools/test-staff.mjs`
3. Firebase con l'emulatore (serve Java):
   - `cd tools && npx firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`
   - prima di ogni prova svuota l'emulatore:
     `curl -X DELETE "http://127.0.0.1:8080/emulator/v1/projects/demo-jona/databases/(default)/documents"` e
     `curl -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-jona/accounts"`
   - `node tools/test-firebase-sync.mjs` (attivazione, invito, sincronizzazione, senza rete, chiave sbagliata)
   - `node tools/test-firebase-bulk.mjs` (300 prodotti, backup e ripristino)
   - `node tools/test-firebase-flow.mjs` (dati di prova, approvazione, ora limite, riepilogo)

Le prove Firebase impostano `localStorage.jona_fb_emu` e una configurazione finta (`projectId: demo-jona`).
