# Passaggio di consegne (2026-10-04, sera)

## Stato attuale
- Online la **v25** (`APP_VER=25`, `CACHE=jona-ordini-v29`), ramo `backup-automatico` riallineato con `main`. Prove tutte verdi.
- Versioni di oggi: v21 primo collegamento con tempo massimo (`fbTmo`, `fb_slow`, Riprova, `jona_fb_lp`); v22 foto profilo ridotta (`fileToAvatar`), bozza `jona_reg`, attesa `jona_wait`/`screenWait`; v23 nome utente automatico (`userSug`, `normUser` senza accenti, errori chiari); v24 **telefoni approvati** e chat al ritorno in primo piano; v25 **Wi-Fi lento** (`netWatch`) e avviso «Usa questa chat in modo responsabile e solo per lavoro» (`.cht-rule`).
- v24: telefono nuovo = `membri/<uid>.ok=false`, legge solo il suo documento e scrive `req` (profilo nuovo con `sid`+`pass`, o «ho già un profilo»). Gestori: Staff → «Telefoni da approvare» (`PH`, `phWatch`, `phApprove`, `phReject`), approvando un profilo nuovo si crea anche lo staff. `approval()` accetta solo la conferma del server. Senza `ok` = approvato (telefoni vecchi); chi attiva il database entra con `chiave/ristorante.uid`. Worker `/gemini` rifiuta `ok:false`. **Regole pubblicate da Mario.**
- v25: scrittura non confermata in 4 s con rete accesa → long polling e ricarica solo a scritture finite, senza fogli né testo in chat (Wi-Fi UniFi dell'hotel con filtri).
- Handoff rafforzato: `.claude/hooks/handoff-check.py` con soglia fissa 140k token (70% di 200k), avviso a ogni messaggio oltre soglia, e hook `SessionStart` «compact» in `.claude/settings.json` che rimette l'obbligo dopo una compressione. Causa del mancato passaggio: l'avviso (89%) è scattato insieme a un cambio di modello e alla compressione automatica, che l'ha cancellato; lo script poi presumeva una finestra da 1M sopra 200k token.

## Richieste di Mario da fare ora (in quest'ordine)
1. **Allegati in chat su Cloudflare D1 (strada B scelta da Mario)**: foto e vocali salvati nel database D1 del Worker `jona-notifiche` (gratis ~5 GB, righe fino a 2 MB: verificare i limiti attuali prima). Endpoint nel Worker protetti come `/gemini` (gettone Firebase + `membri` non in attesa). Messaggio in `messaggi` con `{tipo:'foto'|'audio', m:<id>, w,h|dur, mini:<anteprima piccola>}`; file scaricato solo quando si apre. **Ottimizzazione per non saturare mai i 5 GB**: foto a 1280 px JPEG/WebP ~0,7 (≈150 KB), anteprima 64 px dentro il messaggio, vocali mono 16-24 kbps (MediaRecorder: Android webm/opus, iPhone mp4/aac → provare la riproduzione incrociata) max 2 min, pulizia automatica dei file più vecchi di 60 giorni (cron del Worker), tetto per sicurezza (es. 4 GB: oltre, cancella i più vecchi), indicatore spazio per lo sviluppatore. Il workflow deve creare il database D1 e il binding in `worker/wrangler.toml`: probabilmente serve il permesso «D1 Edit» sul token `CLOUDFLARE_API_TOKEN` (dare a Mario i passi). Chiedere a Mario se vuole anche reazioni veloci (👍 ❤️ 😂 ✅) e sticker Jona («Arrivato!», «Manca!», «Urgente», «Grazie chef»): proposti, non ancora confermati.
2. **Mini guida «notifiche bloccate per sbaglio»**: oggi quando le notifiche sono bloccate o si vuole riattivarle esce la guida su risparmio energetico/sospensione attività (`PUSH_HELP`, `pushHelp`), che è un altro caso. Se `Notification.permission==='denied'` mostrare passi specifici per sbloccare il permesso: iPhone (app dalla Home: Impostazioni → Notifiche → Jona → Consenti), Android Chrome (lucchetto/Impostazioni sito → Notifiche → Consenti, oppure Impostazioni app → Notifiche), poi «Riprova ad attivare». Usare i nomi esatti dei menu.
3. **Reparti**: «Altro» diventa **F&B Manager**; in registrazione aggiungere i tasti **Responsabile** e **Altro** (`REPARTI`, scelta reparto in `profileForm`, chat `rep_<reparto>`, orari per reparto). Attenzione alla chiave `altro` già usata dai profili esistenti: decidere la migrazione (proposta: chiave `altro` → etichetta «F&B Manager», nuove chiavi `resp` e `altro2` per Responsabile/Altro, oppure chiedere a Mario chi c'è oggi in «Altro»).
4. Gemini: risposto a Mario che va bene un **account Google personale** (no aziendale), creato apposta per il ristorante. Resta da fare: chiave su aistudio.google.com → segreto GitHub `GEMINI_API_KEY` → rilanciare il workflow «Pubblica server notifiche (Cloudflare Worker)».

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
