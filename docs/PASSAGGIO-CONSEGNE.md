# Passaggio di consegne (2026-10-04)

## Stato attuale
- Online la **v12** (Scaglione 1): `APP_VER=12`, `sw.js` `CACHE=jona-ordini-v16`, `main` = `96ff6b8` (PR #20). Ramo di lavoro `backup-automatico`.
- Notifiche push funzionanti (Xiaomi di Mario). iPhone di Maurizio da attivare (iOS ≥ 16.4, app aperta dall'icona Home). Regole Firestore con `push` già pubblicate.
- Regole di lavoro aggiornate in `CLAUDE.md`: handoff al 70% (`.claude/hooks/handoff-check.py`, `SOGLIA = 70`), nuova sessione aperta in automatico, force push vietato.

## File toccati nello Scaglione 1 (v12)
- `index.html`:
  - Approvazione: `reqCard` a blocchi `.fsec.fblk` per fornitore, `reqPickSheet` (azioni `rpick`/`rpadd`; righe `aggiunto:true`, `qtaOrig:0`, escluse da `rimossi`), blocco rosso `.nof` senza fornitore (`approve()` già lo blocca).
  - Arrivo a semaforo in `receiveSheet`: `SEM`, `SEM_NEXT`, `rcvDiff`, azione `rst`, `rcvState().lines[i].st` (`''`/`ok`/`ko`/`meno`); `confirmReceipt` chiede conferma se ci sono non controllati. `ricezione.righe` invariato + motivo `nonctrl`; campo `nonControllati` sull'ordine.
  - Invii in sospeso: `pushSend` mette in coda le push fallite (IndexedDB `jona-outbox`); `obxLoad`/`obxFlush` (online, apertura, `visibilitychange`, ogni minuto, solo a pagina visibile), `obxBar` in `shell` e `screenLogin`, `obxTick` in `render` («Arrivata ✓»), `setAppBadge`, SMS `sms:?&body=`. `notify` verso `gm`/`gestori` imposta `S.obxWait` per seguire le scritture Firestore in sospeso.
- `sw.js`: evento `sync` (tag `jona-outbox`), non invia se c'è una finestra visibile.
- `tools/test-firebase-approva-arrivi.mjs` (36 controlli); `test-staff/news/voice/report` nascondono da sole `firebase-config.js`; `tools/README.md`, `CLAUDE.md`.

## Decisioni e motivi
- Push in coda risolte **al momento dell'invio** (si salvano le iscrizioni): così anche `sw.js` può mandarle senza Firestore.
- Background Sync registrato solo se non ci sono scritture Firestore in sospeso: evita che la push arrivi prima della richiesta.
- Semaforo: il tocco gira ok → ko → meno → ok (il grigio resta solo all'inizio); con «meno» la quantità proposta è `qta-1` (o metà se `qta ≤ 1`).
- Pubblicazione senza force: dopo lo squash merge si fa `git merge origin/main` sul ramo e push normale.
- Push: Cloudflare Worker (gratis), iscrizioni fuori da `S.db` (un `permission-denied` lì bloccherebbe l'app).

## Piano a scaglioni
Metodo: 3 funzioni → prove → PR → squash merge → controllo online → scaglione successivo. A ogni versione: `APP_VER`+1, voce `NEWS`, `CACHE` in `sw.js`.

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
- Il promemoria non conosce la finestra vera: sopra 200k token assume 1M, sotto assume 200k (forzabile con `JONA_CTX_WINDOW`). Con finestra 1M e meno di 200k usati può segnalare troppo presto.
