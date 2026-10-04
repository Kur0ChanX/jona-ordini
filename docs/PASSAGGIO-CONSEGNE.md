# Passaggio di consegne (2026-10-04)

## Stato attuale
- **v12 (Scaglione 1) fatta**: `APP_VER=12`, `sw.js` `CACHE=jona-ordini-v16`. Prova: `tools/test-firebase-approva-arrivi.mjs` (36 controlli).
  - Approvazione: `reqCard` a blocchi `.fsec.fblk` per fornitore, `reqPickSheet` (`rpick`/`rpadd`, righe `aggiunto:true`, `qtaOrig:0`), blocco rosso `.nof` senza fornitore.
  - Arrivo a semaforo: `SEM`, `SEM_NEXT`, `rcvDiff`, azione `rst`, `rcvState().lines[i].st`; `ricezione.righe` uguale a prima + motivo `nonctrl`; campo `nonControllati` sull'ordine.
  - Invii in sospeso: `obx*` in `index.html` (IndexedDB `jona-outbox`, `obxBar` in `shell` e `screenLogin`, `obxTick` in `render`), `sync` in `sw.js`, `setAppBadge`, SMS con `sms:?&body=`.
- Prima della v12: v11 su `main` = `8aa1024`.
- Notifiche push **funzionanti** (provate sul Xiaomi di Mario). iPhone di Maurizio ancora da attivare (serve iOS ≥ 16.4 e app aperta dall'icona Home).
- Regole Firestore con la collezione `push` **già pubblicate** da Mario.

## File toccati in questa sessione
- `worker/src/index.js`: Cloudflare Worker `jona-notifiche` (`/salute`, `/chiave`, `/invia`). Web Push RFC 8291 + VAPID RFC 8292 con WebCrypto, solo host push noti, max 50 iscrizioni a chiamata, risposta `{inviati, scaduti, errori}`.
- `.github/workflows/cloudflare-worker.yml`: deploy con Wrangler 4. Crea il segreto `VAPID_JWK` solo se manca (se `secret list` fallisce si ferma), poi prova `/salute` e `/chiave`.
- `index.html`: blocco «notifiche push» (`PUSH_URL`, `pushWatch`, `pushSave`, `pushSync`, `pushOn`, `pushOff`, `pushSend`, `pushTest`, `pushHelp` + `PUSH_HELP`). `notify()` chiama `pushSend()`. Pulsanti nel menu profilo (`meMenu`), `pushSync()` in `login()`, `pushUnlink()` in `logout()`, stili `.ph-*`.
- `sw.js`: eventi `push` e `notificationclick`.
- `firebase/firestore.rules`: aggiunta la collezione `push`.
- `tools/test-firebase-push.mjs` (nuovo), `tools/README.md`, `docs/FIREBASE.md`, `CLAUDE.md` (regola SPIEGAZIONI PER MARIO).

## Decisioni e motivi
- **Cloudflare Worker** al posto di Firebase Blaze: gratis, deploy automatico da GitHub.
- Le iscrizioni push si leggono e scrivono **fuori da `S.db`** (Firestore diretto con errori gestiti): un `permission-denied` dentro `S.db` blocca tutta l'app (`fb_perm`).
- Push solo con `FirebaseStore`, verso utente, `gm` o `gestori` (ruolo vero da `D().staff`), escluso il telefono di chi invia.
- Xiaomi: la causa del rifiuto (errore 20, `AbortError`) era «Sospendi l'attività dell'app se inutilizzata». È nella guida `PUSH_HELP`.
- Notifiche a Maurizio già esistenti: nuova richiesta (`notify('gm',…)`, riga ~1278) e controllo merce (`notify('gm',…)`, riga ~1712).

## Piano a scaglioni (deciso con Mario)
Metodo: 3 funzioni → test → PR → squash merge → controllo online → versione e NEWS → scaglione successivo. A ogni versione: `APP_VER`+1, voce `NEWS`, `CACHE` in `sw.js`.

**Scaglione 1 (fatto, v12)**
1. **Approvazione divisa per fornitore** (scelta 1A + regola C): in approvazione la richiesta è a blocchi colorati per fornitore; «+ Aggiungi» dentro ogni blocco cerca solo nel listino di quel fornitore. Un prodotto scritto a mano non si approva senza fornitore (già c'è il controllo in `approve()`, riga ~1397: va esteso all'aggiunta).
2. **Controllo arrivo a semaforo** (2A): righe grandi, tocchi grigio→verde «c'è»→rosso «manca»→giallo «meno» (si apre la quantità), ordine libero, contatore «9 di 14», invio anche parziale (non toccati = «non controllato»). Resta «È arrivato tutto». Oggi c'è menu `MOTIVI` + stepper (`rcvState`, righe ~1675-1715): da sostituire con il semaforo, mantenendo il formato `ricezione.righe` usato da Storico/report (righe ~2023, ~2147).
3. **Invii in sospeso**: coda locale delle push non partite con ritentativo su `online`, apertura app e `visibilitychange`; Background Sync in `sw.js` su Android; numero sull'icona (`navigator.setAppBadge`) finché c'è qualcosa da inviare; avviso fisso «⚠ Non ancora arrivata a Maurizio» e «Arrivata ✓» con vibrazione. SMS solo come pulsante manuale, per la richiesta rimasta in sospeso. Nota: le scritture Firestore offline partono già da sole a rete tornata (`syncPill`); mancano la push e un avviso chiaro per lo staff.

**Scaglione 2 (prossimo)**
- Avviso aumento prezzi (all'import listino o fattura: prodotti aumentati con %).
- Urgenza sul **singolo prodotto** da parte dello staff (in cima per Maurizio, notifica importante).
- Notifica controllo merce più ricca: prodotti mancanti con chi li aveva chiesti.

**Scaglione 3**
- **Più lingue** per lo staff (scelta per persona; ordini e prodotti restano in italiano).

**Scaglioni 4-5: Orari del personale** (nuova sezione, grafica coerente con l'app)
- Nel profilo dipendente, prima di caricarlo: ore settimanali di contratto, pausa, giorni liberi a settimana.
- Pianificatore settimanale grafico (righe = persone, colonne = giorni, turni a blocchi colorati per reparto), basato sulle funzioni più usate: copia la settimana precedente, turni tipo (pranzo/cena/spezzato).
- Controlli: ore oltre il contratto, pause mancanti, giorni liberi non dati, 11 ore di riposo tra due turni e 24 ore di riposo settimanale (D.Lgs. 66/2003), turni sovrapposti.
- Lo staff vede solo i propri orari.

**Idee in lista, non ancora scelte**: HACCP all'arrivo, contestazione fornitore, giorni di consegna, scorte minime, foto prodotto, prezzo migliore in approvazione, vuoti a rendere, budget per reparto, conferma del fornitore via link, ricette e costo del piatto.

## Rischi e note aperte
- `tools/test-news.mjs` è indietro (si aspetta `APP_VER` 7, conteggi scritti a mano): da riscrivere calcolando i conteggi da `NEWS`.
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte (ora limite «tra 30 minuti»): non è un errore dell'app.
- `test-staff` e `test-news` vanno lanciati con `firebase-config.js` nascosto (vedi `tools/README.md`). Con l'emulatore vanno svuotati sia `demo-jona` sia `jona-ordini`.
- Background Sync non esiste su iPhone: lì il ritentativo avviene solo ad app aperta.
