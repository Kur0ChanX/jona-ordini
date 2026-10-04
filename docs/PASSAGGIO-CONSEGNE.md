# Passaggio di consegne (2026-10-04, notte)

## Stato attuale
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
1. **Mario**: aggiungere al token Cloudflare `CLOUDFLARE_API_TOKEN` il permesso **Account › D1 › Edit**, poi rilanciare il workflow «Pubblica server notifiche (Cloudflare Worker)» e controllare nel log «Foto e vocali: 4 database collegati».
2. Gemini: chiave su aistudio.google.com (account Google privato va bene) → segreto GitHub `GEMINI_API_KEY` → rilanciare lo stesso workflow.
3. Domande aperte a Mario: reazioni veloci (👍 ❤️ 😂 ✅) e sticker Jona; chi spostare in «F&B Manager».
4. Provare sui telefoni veri il vocale iPhone → Android e viceversa.

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
