# Passaggio di consegne (2026-10-04, sera)

## Stato attuale
- **v27** sul ramo `ccr-402d6602-imjwpw` (`APP_VER=27`, `CACHE=jona-ordini-v31`), da pubblicare: reazioni in chat 👍 ❤️ 😂 ✅ 😢 👎 (tenere premuto il messaggio o tasto destro) e «Copia» del testo. Dati in `messaggi/<id>.r.<persona>` (tolta con `FieldValue.delete()`), nessuna regola nuova. Funzioni: `CH_RE`, `chRx`, `chRb`, `chReact`, `chReOpen` (inserisce la barra senza ridisegnare: su iPhone il tocco non si perde), `chReClose`, `chRbFix` (barra sotto il messaggio se sopra non c'è posto), `chLp`. Prove: `test-v27` (20), `test-firebase-chat` (17, con le reazioni tra due telefoni), `test-v17`, `test-v26`, `test-firebase-allegati` (22) verdi.
- **Gemini sul server attivo** (4 ottobre, 14:17): segreto `GEMINI_API_KEY` aggiunto, workflow #15 verde, `/salute` → `"gemini":true`; «Chiedi a Jona» provato da Mario sul telefono.
- **v26** pronta (`APP_VER=26`, `CACHE=jona-ordini-v30`): foto e vocali in chat, reparti F&B Manager/Responsabile, guida «notifiche bloccate». Prove tutte verdi (nuove: `test-allegati-server` 25, `test-firebase-allegati` 22, `test-v26` 15).
- Versioni precedenti (v21–v25: collegamento lento, foto profilo, nome utente, telefoni approvati, Wi-Fi lento) già online.
- **Allegati (v26)**: `worker/src/index.js` `/allegati` (POST testo base64 + `x-tipo`, GET `/allegati/<db>-<id>`, GET `/allegati/spazio`, solo `membro()`), `scheduled` = pulizia oltre 60 giorni (`[triggers]` in `worker/wrangler.toml`, ore 3:17 UTC). Workflow: passo «Database di foto e vocali» crea `jona-allegati-0..3` via API e aggiunge i binding `ALLEGATI0..3` a `wrangler.toml` solo nel CI; senza permesso D1 avvisa e pubblica senza allegati. App: `ALG`, `algCheck` (`/salute` → `allegati`), `algUp`, `algGet` (cache `jona-allegati`, max 400 file), `algImg`, `chFile`, `chPhoto`, `chRec`/`chRecStop`, `chPlay`/`chAuPaint`, `chView`, `chImgs` (IntersectionObserver), `chMsgBody`, `chPush`. Tasti foto/microfono solo se `algOn()`.
- Reparti: `REPARTI` con `fb` e `resp`; `altro` resta «Altro» (nessuna migrazione: chi è F&B Manager va spostato a mano dal profilo). Notifiche: `PUSH_DENY`, `pushDenied()`, `S.pushAll`, foglio non duplicato (`ph:1`).

## Decisioni e motivi (v26)
- D1 gratuito = **500 MB per database** (5 GB totali, 10 database): 4 database da 440 MB ≈ 1,7 GB. Si può salire fino a 10 cambiando `QUANTI` nel workflow.
- File salvati come **testo base64**: D1 restituisce i BLOB come liste di numeri, troppo lente per i 10 ms di CPU del piano gratuito. Decodifica sul telefono.
- Vocali: prima MP4/AAC (iPhone e Android), poi WebM/Opus; 24 kbps, 2 minuti. Foto 1280 px WebP 0,7 (JPEG su iPhone), anteprima 40 px nel messaggio.
- `t` del messaggio («📷 Foto», «🎤 Messaggio vocale (0:12)») per liste, avvisi e versioni vecchie dell'app.

## Da fare / in sospeso
1. **Fatto (4 ottobre, 13:40)**: token Cloudflare nuovo «Jona Ordini» (Token API dell'account, modello Edit Cloudflare Workers + policy Intero account → D1 Write) nel segreto `CLOUDFLARE_API_TOKEN`; workflow #14 verde, `/salute` → `"allegati":4`. Foto e vocali attivi.
   **Fatto (14:17)**: `GEMINI_API_KEY` e workflow #15, Gemini attivo.
2. Reazioni fatte (v27, da pubblicare). Sticker Jona: non chiesti. **Mauro Loi** è il F&B Manager: Mario/Maurizio lo spostano a mano (Staff → Mauro Loi → Reparto «F&B Manager» → **Salva**).
3. Vocali: Android ↔ Android funzionano; manca la prova con iPhone.
4. Il repository ora è `Kur0ChanX/jona-ordini` (GitHub segnala lo spostamento, i push funzionano).

## Richieste di Mario da fare (in ordine)
1. **Vocale iPhone (urgente)**: Mauro Loi (iPhone) non sente il vocale mandato da Mario (Android, probabilmente WebM/Opus o MP4 da Chrome). Controllare `chRec` (formato scelto: su Android Chrome forse `audio/webm`, che Safari vecchio non legge) e `chPlay`; soluzione probabile: registrare sempre MP4/AAC se `MediaRecorder.isTypeSupported('audio/mp4')`, altrimenti avviso/ripiego; per i vocali WebM già inviati valutare messaggio chiaro su iPhone. Verificare anche Android ← iPhone.
2. **Pubblicare v27** (Mario non ha ancora detto sì): PR → squash merge → controllo online → `git merge origin/main` sul ramo.
3. **«Chi c'è in turno oggi»**: tasto ben visibile nella voce «Orari» dello staff e nel pianificatore (Staff → Orari) che mostra chi lavora oggi (da `tp` della settimana pubblicata), con orari.
4. **Promemoria ordini**: Maurizio crea regole («ordinare Dolpa entro data e ora», a chi: staff/reparto/sé stesso, eventualmente ripetute); avviso appena l'utente entra nell'app (+ push all'orario); anche promemoria personali per Maurizio. Proporre prima lo schema (BRAINSTORMING) se ci sono dubbi.
5. **Consumi e costi** più interattivo, animazioni moderne, facile da leggere (caricare la skill `dataviz` prima di toccare i grafici).
6. Mauro Loi in «F&B Manager»: istruzioni date a Mario (Staff → Mauro Loi → Reparto → **Salva**), da confermare.

## Idee parcheggiate (non farle finché Mario non le chiede)
Foto della confezione → carrello, allarme quantità strana, «Rifai come martedì scorso», mancanti riordinati, risposta del fornitore dallo screenshot; codice a barre scartato. Domanda sui listini (PDF, fattura XML che aggiorna prezzi e controlla la merce, sinonimi/unità, storico prezzi, listino vecchio): proposte da fare se la riprende.

## File e funzioni (`index.html` salvo dove indicato)
- Collegamento: `FirebaseStore` (`connect`, `approval`, `newMember`, ritorno in primo piano con `disableNetwork`/`enableNetwork`), `fbInit` (long polling con `jona_fb_lp`), `fbTmo`, `netWatch`, `wallFb`, `screenPhone`, `phoneSheet`, `phSend`.
- Registrazione: `profileForm`, `checkForm`, `userSug`, `createProfile`, `regKeep`/`regRestore`, `screenWait`/`waitCheck`.
- Chat: `CHAT`, `chWatch`, `chPaint`, `chSend` (avviso `.cht-rule`).
- Worker: `worker/src/index.js` (`/chiave`, `/invia`, `/gemini`, `membro()` con controllo `ok`), `worker/wrangler.toml`, `.github/workflows/cloudflare-worker.yml`.
- Regole: `firebase/firestore.rules` (Mario le incolla a mano in Firebase → Firestore Database → Regole → Pubblica).

## Decisioni e motivi
- Approvazione del telefono nel database (non solo nell'app): chi ha il link non legge nulla finché non è approvato.
- Long polling solo quando serve (passa i filtri del Wi-Fi, costa qualche decimo di secondo).
- Pubblicazione: squash merge, poi `git merge origin/main` sul ramo e push normale, mai force.

## Prove
`tools/README.md`. Nuove oggi: `test-invito-bloccato`, `test-registrazione` (21), `test-firebase-telefoni` (24), `test-firebase-wifi-lento` (13); le prove Firebase approvano il secondo telefono da A. Dopo un riavvio: `python3 -m http.server 8765` e l'emulatore (`npx firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`), poi caricare le regole nell'emulatore e svuotare `demo-jona` e `jona-ordini`.

## Rischi aperti
- `/invia` del Worker non controlla chi chiama.
- Il telefono in attesa non può mandare push ai gestori: li avvisa la lista in Staff.
- Tutti i telefoni approvati leggono tutti i messaggi, anche privati.
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte.
- Foto e vocali: chiunque sia approvato può scaricarli conoscendo l'id (come per i messaggi privati).
