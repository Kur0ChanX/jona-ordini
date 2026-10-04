# Passaggio di consegne (2026-10-04)

## Stato attuale
- Online la **v13 = Scaglione 2** (PR #23, squash `4562ed6`, controllata online): `APP_VER=13`, `sw.js` `CACHE=jona-ordini-v17`. Ramo `backup-automatico` riallineato a `main`.
- Prove tutte verdi: `test-staff`, `test-voice`, `test-scaglione2`, `test-news` (riscritta: conteggi calcolati da `NEWS`, contatore «9+»), e con l'emulatore `test-firebase-approva-arrivi`, `-push`, `-flow`, `-sync`, `-backup`, `-bulk`, `-report`.

## File toccati nello Scaglione 2 (v13)
- `index.html`:
  - Aumento prezzi: `pctUp`, `pctS`, `rvUps` (prima di `matchProd`); banner in cima a `reviewSheet` e pill rosso «aumentato +X%, era …» sulla riga; `reviewSave` calcola gli aumenti prima di salvare, poi `notify('gm',…,'prezzi')` e `upsSheet` (riepilogo «Prezzi aumentati»). Nel listino il pill «era …» diventa rosso con la percentuale se è aumentato.
  - Urgente: in `vCarrello` pulsante «È urgente?» (`.urg-b`, azione `curg`, campo `S.cart[i].urg`) e banner; `sendCart` mette `urgente:true` sulle righe e manda `notify('gm','URGENTE: …','urgente')`; `reqUrg` mette le richieste urgenti in cima in `vRichieste`; `reqCard` con `.panel.urg` e tag URGENTE; tag anche in `gmLine`, `bySupplier`, `itemsRO`, righe d'ordine (`L.urgente` in `approve`). CSS `.tag.urg`, `.panel.urg`, `.urg-b`. `NI` con `prezzi` e `urgente`.
  - Controllo merce: `ricezione.righe[i]` ora ha `key` e `da` (nomi); `rcvDiffTxt`; notifica a Maurizio con «(chiesto da …)» fino a 5 righe; avviso a ogni persona che aveva chiesto prodotti mancanti/arrivati in meno (salta chi fa il controllo); `receiptView` mostra «chiesto da».
- `sw.js`: titolo che inizia per «URGENTE» → `requireInteraction` e vibrazione lunga (il Worker non va cambiato).
- `tools/test-scaglione2.mjs`, `tools/README.md`.

## Decisioni e motivi
- Push in coda risolte **al momento dell'invio** (si salvano le iscrizioni): così anche `sw.js` può mandarle senza Firestore.
- Background Sync registrato solo se non ci sono scritture Firestore in sospeso: evita che la push arrivi prima della richiesta.
- Semaforo: il tocco gira ok → ko → meno → ok (il grigio resta solo all'inizio); con «meno» la quantità proposta è `qta-1` (o metà se `qta ≤ 1`).
- Pubblicazione senza force: dopo lo squash merge si fa `git merge origin/main` sul ramo e push normale.
- Push: Cloudflare Worker (gratis), iscrizioni fuori da `S.db` (un `permission-denied` lì bloccherebbe l'app).
- Urgenza riconosciuta da `sw.js` dal titolo «URGENTE»: così non serve ripubblicare il Worker (che passa solo titolo, testo, tag).
- Urgenza per singolo prodotto (non per richiesta intera), come chiesto; la richiesta va in cima se ha almeno un prodotto urgente.
- Avviso aumento prezzi solo per prodotti già a listino con prezzo vecchio > 0.

**Le richieste originali di Mario (orari, lingue, notifiche) sono parola per parola in `docs/RICHIESTE-MARIO.md`: leggerle prima di ogni scaglione.**

## Piano a scaglioni
Metodo: 3 funzioni → prove → PR → squash merge → controllo online → scaglione successivo. A ogni versione: `APP_VER`+1, voce `NEWS`, `CACHE` in `sw.js`.

**Scaglione 2: pubblicato (v13)**
1. Prove Firebase: fatte, tutte verdi.
2. PR #23 → squash merge → online → ramo riallineato: fatto.
3. Mario prova sul telefono (carrello «È urgente?», import di un listino con un prezzo più alto, controllo merce con un prodotto mancante).

**Scaglione 3 (prossimo)**
- **Più lingue** per lo staff (scelta per persona; ordini e prodotti restano in italiano).

**Scaglioni 4-5: Orari del personale** (nuova sezione, grafica coerente con l'app)
- Nel profilo dipendente, prima di caricarlo: ore settimanali di contratto, pausa, giorni liberi a settimana.
- Pianificatore settimanale grafico (righe = persone, colonne = giorni, turni a blocchi colorati per reparto), basato sulle funzioni più usate: copia la settimana precedente, turni tipo (pranzo/cena/spezzato).
- Controlli: ore oltre il contratto, pause mancanti, giorni liberi non dati, 11 ore di riposo tra due turni e 24 ore di riposo settimanale (D.Lgs. 66/2003), turni sovrapposti.
- Lo staff vede solo i propri orari.

**Idee in lista, non ancora scelte**: HACCP all'arrivo, contestazione fornitore, giorni di consegna, scorte minime, foto prodotto, prezzo migliore in approvazione, vuoti a rendere, budget per reparto, conferma del fornitore via link, ricette e costo del piatto.

## Rischi e note aperte
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte (ora limite «tra 30 minuti»): non è un errore dell'app.
- `test-staff` e `test-news` vanno lanciati con `firebase-config.js` nascosto (vedi `tools/README.md`). Con l'emulatore vanno svuotati sia `demo-jona` sia `jona-ordini`.
- Background Sync non esiste su iPhone: lì il ritentativo avviene solo ad app aperta.
- Il promemoria non conosce la finestra vera: sopra 200k token assume 1M, sotto assume 200k (forzabile con `JONA_CTX_WINDOW`). Con finestra 1M e meno di 200k usati può segnalare troppo presto.
