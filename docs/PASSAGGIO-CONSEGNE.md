# Passaggio di consegne (2026-10-07)

Sessione attuale: #20

## Ultimo messaggio di Mario (#19)
«le notifiche non vanno eppure ho seguito la guida» + 7 schermate del suo Android (ColorOS/OnePlus-Oppo: «Notifiche in evidenza», «Chiudi le app dopo 10 minuti…»). Dalle schermate: app installata «Jona Ordini» (WebAPK, «Versione: 1»), Notifiche **Sì**, tutti gli interruttori accesi, batteria **Nessuna restrizione** sia per Jona Ordini sia per Chrome, «Sospendi se inutilizzata» spento. Quindi il telefono è a posto: il guasto è lato app/iscrizione.
Server push controllato: `jona-notifiche…/chiave` risponde 200 con la chiave VAPID.
**Da fare subito (#20)**: chiedere a Mario di aprire Impostazioni dell'app → «Notifiche sul telefono» → cosa c'è scritto («Attive»?) e toccare **Prova** (`pushTest`, riga ~1568); se «Attive» ma non arriva niente: controllare `push/<id>` in Firestore, la risposta di `/invia` (410/404 = iscrizione morta → rifarla), `sw.js` evento `push`, `jona_push_k` diverso dalla chiave attuale (chiave VAPID cambiata dal workflow?). Possibile aggiunta: pulsante «Rifai l'iscrizione» e diagnosi visibile.

## Messaggio di Mario #19 sulle scelte (prima delle notifiche)
«QR code Libero lasciamelo può servirmi nelle impostazioni va sempre autorizzato poi quello whatsapp mono accesso diretto / quando creo account poi gli chiede metti la tua password e non dimenticarla / 3 ok / 4 ok».
Interpretazione applicata: QR della cucina → sempre con approvazione; resta l'interruttore «Entrata libera 48 ore» in Impostazioni (v40 così com'è). Invito WhatsApp → monouso, entra direttamente, profilo pronto creato dal gestore e la persona sceglie la password («scegli la tua password e non dimenticarla»). «3 ok» = Mauro Loi (F&B Manager) con poteri dello chef ma ordini bloccati, sbloccabile solo da Mario (dev) e Maurizio Lai (Chef Amministratore). «4 ok» = guida notifiche per modello (un'app web non può aprire da sola le impostazioni del telefono: pulsante richiesta permesso + guida con passi per Android/Samsung/ColorOS/iPhone).

## Fatto in sessione #19 (commit 253691e «v40 (in corso)», NON pubblicato)
- `index.html`: invito monouso. FirebaseStore `phone.inv/tk/invNew/invDel`; avvio legge `#t=` → `jona_itk`; `IT`, `itLoad`, `screenInvite`, `itGo` (batch: membro `ok:true,da:'invito',tk`, cancella `inviti/<t>`, `staff/<sid>` `pass`+`stato:'attivo'`), azioni `itGo/itRetry/itSkip/invMono/invMonoGo`. Gestore: `registerSheet('admin')` con scelta «La sceglie lui (invito WhatsApp)» (`_inv`, valori 1/''), `createProfile` → stato `invitato` senza password → `invMonoSend(sid)` (gettone `randKey(32)`, 7 giorni, link `INV_URL/<codice>/<gettone>` o `inviteLink()+'&t='`), `invMonoSheet` (Manda su WhatsApp `wa.me`, Condividi, Copia), riga staff «invito non ancora usato», in `profileSheet` «Nuovo link d'invito»; `saveProfile` con password attiva un `invitato`; `sdel` cancella l'invito. NEWS v40 aggiornata (titolo «Invito WhatsApp con profilo pronto»).
- `firebase/firestore.rules`: `invitoBuono`, `mioInvito`, ramo `membri` update con `tk` e `!existsAfter`, `match /inviti/{tk}`, `match /staff/{sid}` (solo `pass/stato/attivato`, da `invitato` ad `attivo`).
- `worker/invito/src/index.js`: `/<CODICE>/<GETTONE>` → `#i=…&t=…` (`GETTONE`).
- `tools/test-v40.mjs`: aggiunto punto 4. Le parti 1-3 passano; il punto 4 **si ferma** dopo «Crea profilo»: la scheda «Invito pronto» non compare entro 3 s (timeout su `.sheet`). Cause probabili da verificare: `invNew()` fa `fetch` al Worker vero `/inviti` (rete lenta/bloccata nel test → attesa lunga) oppure `invDel` (query `where sid`) respinta dalle regole. Guardare `A.errs`, aumentare l'attesa o far fallire subito il fetch con `route`.

## Prossimi passi (#20)
1. Notifiche di Mario (sopra), è l'app in uso: priorità.
2. Finire la prova `test-v40` punto 4, poi `test-firebase-telefoni`, `test-news`, `test-giro.mjs`; `docs/FIREBASE.md` (regole nuove inviti) e `docs/DA-FARE.md` (M18 regole da incollare).
3. Proporre le 3 opzioni di prova, PR → merge da Claude → controllo online → riallineamento. Guidare Mario a incollare le regole (link console Firebase).
4. Poi: Mauro con ordini bloccati (punto 3), guida notifiche per modello (punto 4), M14, M15. Resto in `docs/DA-FARE.md`.
5. Ancora senza risposta: copiare la regola bloccata e l'hook negli altri repository?

## Fatto in sessione #18
- **Merge delle PR**: su scelta di Mario («sì», 07/10) Claude unisce di nuovo le PR da solo (squash, `merge_pull_request` funziona). Riga cambiata in `CLAUDE.md` (sezione «GitHub dal telefono»), con il consenso esplicito di Mario. Mario precisa: l'unica regola intoccabile è quella del risparmio token / handoff automatico.
- **v39 online**: PR #48 unita da Claude, controllato `APP_VER=39`, `CACHE` v43. Ramo riallineato a `main`. Giro completo `tools/prova-tutto.sh` sulla v39: **37/37 riuscite**.
- Ambiente cloud rinominato da Mario: «Anime Manga Hotmail» → «Mario Hotmail» (lo usano tutti i progetti).
- **v40 nel ramo (non pubblicata, nessuna PR)**, commit «v40: entrata libera per 48 ore»:
  - `index.html`: `phone.auto` / `phone.porta` / `phone.portaGet` in FirebaseStore (`pubblico/porta` {fino, da, quando}); `phStaff(r,st,da)` condiviso con `phApprove`; in `phSend`, dopo la richiesta, prova `S.db.phone.auto(r)` (se la porta è aperta: `ok:true`, `da:'porta'`, profilo creato, `req` tolta); Impostazioni → riga `ptRow` «Entrata libera» con **Apri per 48 ore** / **Chiudi ora** (`ptSet`, `PT`, `ptLoad`); azione `ptSet` registrata. `approval()` ora usa `onSnapshot({includeMetadataChanges:true},…)`: senza, il telefono che si approva da solo non vedeva la conferma del server (bug trovato dalla prova). `APP_VER` 40, Novità v40, `sw.js` `CACHE` v44.
  - `firebase/firestore.rules`: `portaAperta()`, `match /pubblico/porta` (legge chi è collegato; scrive solo `membro()`, `fino` int ≤ ora+49 h), in `membri` update in più: sé stesso con porta aperta, `ok==true`, solo chiavi `ok/approvato/da`.
  - `tools/test-v40.mjs` (emulatore) riuscita; riuscite anche `test-firebase-telefoni` e `test-news`. `docs/FIREBASE.md` e `docs/DA-FARE.md` (M16 tolta, M18 regole nuove) aggiornati.

## Rischi aperti
- Un telefono in attesa da prima (es. `ISLyK5…`, M17) resta da approvare a mano anche con la porta aperta.
- Righe bianche del logo: viste solo su telefoni veri; se tornano, guardare `ynoyShine`.
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
