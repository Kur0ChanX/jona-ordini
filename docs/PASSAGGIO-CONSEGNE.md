# Passaggio di consegne (2026-10-07)

Sessione attuale: #19

## Ultimo messaggio di Mario (#18)
«quello della cucina 48 ore quello invece che invio whats app valido solo una volta e senza codice tanto lo mando via whatsapp».
Cioè: **QR della cucina** → entrata libera 48 ore (come la v40, ma solo per il QR fisso). **Invito mandato su WhatsApp** → vale **una volta sola** e chi lo usa entra **senza approvazione** (Mario lo manda di persona). Mario non ha ancora scelto il livello delle prove (1 completo / 2 breve / 3 subito) per la v40: chiederlo di nuovo quando la nuova versione è pronta.

## Fatto in sessione #18
- **Merge delle PR**: su scelta di Mario («sì», 07/10) Claude unisce di nuovo le PR da solo (squash, `merge_pull_request` funziona). Riga cambiata in `CLAUDE.md` (sezione «GitHub dal telefono»), con il consenso esplicito di Mario. Mario precisa: l'unica regola intoccabile è quella del risparmio token / handoff automatico.
- **v39 online**: PR #48 unita da Claude, controllato `APP_VER=39`, `CACHE` v43. Ramo riallineato a `main`. Giro completo `tools/prova-tutto.sh` sulla v39: **37/37 riuscite**.
- Ambiente cloud rinominato da Mario: «Anime Manga Hotmail» → «Mario Hotmail» (lo usano tutti i progetti).
- **v40 nel ramo (non pubblicata, nessuna PR)**, commit «v40: entrata libera per 48 ore»:
  - `index.html`: `phone.auto` / `phone.porta` / `phone.portaGet` in FirebaseStore (`pubblico/porta` {fino, da, quando}); `phStaff(r,st,da)` condiviso con `phApprove`; in `phSend`, dopo la richiesta, prova `S.db.phone.auto(r)` (se la porta è aperta: `ok:true`, `da:'porta'`, profilo creato, `req` tolta); Impostazioni → riga `ptRow` «Entrata libera» con **Apri per 48 ore** / **Chiudi ora** (`ptSet`, `PT`, `ptLoad`); azione `ptSet` registrata. `approval()` ora usa `onSnapshot({includeMetadataChanges:true},…)`: senza, il telefono che si approva da solo non vedeva la conferma del server (bug trovato dalla prova). `APP_VER` 40, Novità v40, `sw.js` `CACHE` v44.
  - `firebase/firestore.rules`: `portaAperta()`, `match /pubblico/porta` (legge chi è collegato; scrive solo `membro()`, `fino` int ≤ ora+49 h), in `membri` update in più: sé stesso con porta aperta, `ok==true`, solo chiavi `ok/approvato/da`.
  - `tools/test-v40.mjs` (emulatore) riuscita; riuscite anche `test-firebase-telefoni` e `test-news`. `docs/FIREBASE.md` e `docs/DA-FARE.md` (M16 tolta, M18 regole nuove) aggiornati.

## Prossimi passi (#19)
1. **Rifare la v40 come chiede Mario**:
   - La porta a 48 ore deve valere **solo per il QR della cucina** (`config/app.qrFisso`), non per ogni invito. Idea: il telefono sa con quale codice è arrivato (`jona_icode`, `#i=`); serve una prova lato server che il codice è quello fisso, altrimenti chiunque abbia la chiave si approva. Strada probabile: il Worker `/invito/<codice>` restituisce un gettone/segno che le regole possano controllare, oppure si salva in `pubblico/porta` anche il codice fisso e in `membri/<uid>` il codice usato (`ic`), e le regole confrontano `request.resource.data.ic == porta.c`. Attenzione: il codice del QR fisso non è segreto (è appeso), quindi va bene confrontarlo.
   - **Invito WhatsApp monouso senza approvazione**: il Worker `/inviti` (tabella `inviti` nel primo D1) crea un codice normale; va segnato come usato al primo `/invito/<codice>` (o alla prima entrata) e chi entra con esso deve approvarsi da solo. Serve un segreto per invito non indovinabile (il codice a 6 lettere ha il limite di 20 errori/ora per IP); valutare un gettone lungo nel link (`#i=` + segreto) salvato in Firestore (es. `pubblico/inviti/<hash>` scritto dal gestore) che le regole controllano e che il telefono consuma (delete) entrando. «Senza codice» = il link non mostra/chiede le 6 lettere.
   - Riscrivere `tools/test-v40.mjs` per i due casi; rilanciare le prove legate.
2. Proporre a Mario le 3 opzioni di prova (CLAUDE.md), poi PR → merge da Claude → controllo online → riallineamento.
3. Guidare Mario a incollare le regole nuove (M18) con link diretto alla console Firebase.
4. M14 (inviti allo staff, vecchia icona), poi M15. Il resto in `docs/DA-FARE.md`.
5. Ancora senza risposta: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository?

## Rischi aperti
- Un telefono in attesa da prima (es. `ISLyK5…`, M17) resta da approvare a mano anche con la porta aperta.
- Righe bianche del logo: viste solo su telefoni veri; se tornano, guardare `ynoyShine`.
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
