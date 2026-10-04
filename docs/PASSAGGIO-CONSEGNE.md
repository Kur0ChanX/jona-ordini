# Passaggio di consegne (2026-10-04)

## Stato attuale
- Online la **v14 Orari del personale** (PR #24, squash `ff329a2`): `APP_VER=14`, `sw.js` `CACHE=jona-ordini-v18`. File online identici a quelli provati. Ramo `backup-automatico` riallineato con `git merge origin/main`.
- Prove verdi: `test-orari` (62), `test-firebase-orari` (14, emulatore), `test-staff`, `test-news`, `test-scaglione2`, `test-voice`, `test-report`, `test-firebase-*`.
- Mario deve ancora provare sul telefono la v13 (carrello «È urgente?», import con prezzo più alto, controllo merce con un mancante) e la v14 (contratto nel profilo, Staff → Orari, pubblica, vista «Orari» dello staff).

## Orari (v14): com'è fatto
- **Dati in `config`** (nessuna regola Firestore nuova): `config/orari_<lunedì AAAA-MM-GG>` = `{tipo:'orari',lun,t:{<persona>:{'0'..'6':valore}},tp,pub,pubDa,mod}`; valori `"10:00-15:00"`, `"10:00-15:00,18:00-23:00"` (fine ≤ inizio = dopo mezzanotte), `R`/`F`/`M`/`P`. Turni tipo in `config/orari_tipi` `{l:[{id,n,v}]}` (predefiniti `OR_TIPI0`). Contratto in `staff.contratto` `{ore,pausa,liberi}` (predefinito `CONTR0` 40/30/1).
- **Scrittura di una persona**: `orSaveRow` → `upd('config',id,{['t.'+persona]:riga})`, `put` se la settimana non esiste. `LocalStore.update` ora applica i percorsi con il punto come Firestore.
- **Codice** (`index.html`, blocco `/* orari del personale */` prima di «notifiche, menu, impostazioni»): `orCheck` (sovrapposizioni, 11 ore anche dalla domenica prima, 13 ore, 24 ore di fila, giorni liberi, un solo avviso «senza pausa» con tutte le caselle segnate `gs`, contratto = avviso, 48 ore = errore), `orProblems`, `orStato`, `vOrari` (pianificatore), `orCellSheet`/`orSaveCell`, `orCopy`, `orTipiSheet`, `orPublish` (notifica tipo `orari` solo a chi cambia, mai a sé stessi), `vMieiOrari` (staff, solo `tp`), `orContrForm` nel `profileForm` (opzione `contr`, nascosta per il ruolo dev, flag `S.form._c`). Azioni in `Object.assign(A,…)` prima di `guard`; CSS «orari del personale» prima di `</style>`.
- **Interfaccia**: scheda Staff con interruttore Persone | Orari (`S.staffSub`, `jona_staffsub`); voce «Orari» nello `STAFF_TABS` (5 voci: a 320 px le scritte vanno a capo); icone `calendar` e `chevl` in `IC`. Nella tabella gli orari sono compatti (`orHMc`: «10–15», «18–23:30»).

## Prossimi passi
- Chiedere a Mario se gli orari vanno bene dopo la prova sul telefono (passi da dargli: profilo → contratto; Staff → Orari → casella → turno tipo → «Uguale anche per» → Salva → Pubblica; entrare come staff dalla barra **Test** → voce «Orari»).
- **In coda (prossimo gruppo di 3):** «È urgente?» → «È urgente» nel carrello dello staff (`index.html`: pulsante `curg` in `vCarrello` e frase di aiuto; la voce NEWS v13 resta). Poi le idee scelte da Mario tra le 10 in `docs/RICHIESTE-MARIO.md`.
- **Scaglione 4** (da proporre a Mario): condividi/stampa degli orari (PDF, WhatsApp), riepilogo ore del mese, richieste di cambio turno o ferie dallo staff.
- **Scaglione 5:** più lingue per lo staff (scelta per persona; ordini e prodotti in italiano).
- Idee non scelte: vedi `docs/RICHIESTE-MARIO.md`.

## Decisioni e motivi
- Pubblicazione senza force: dopo lo squash merge si fa `git merge origin/main` sul ramo e push normale.
- Push: Cloudflare Worker, iscrizioni fuori da `S.db` (un `permission-denied` lì bloccherebbe l'app). Urgenza riconosciuta da `sw.js` dal titolo «URGENTE».
- Orari in `config` e non in una collezione nuova: una collezione nuova richiederebbe di ripubblicare le regole, e fino ad allora ogni scrittura darebbe `permission-denied`, che blocca l'app.
- Un documento per settimana (non per persona): circa 52 documenti l'anno letti all'avvio, invece di centinaia.
- Lo staff vede solo la copia pubblicata `tp`: Maurizio può preparare la bozza senza che i ragazzi vedano turni a metà.
- Il controllo delle 24 ore di riposo guarda solo dentro la settimana (più la domenica prima): un riposo a cavallo tra due settimane può essere segnalato; i giorni liberi lo coprono comunque.

## Rischi e note aperte
- Se due gestori creano la stessa settimana nello stesso istante, il secondo `put` può sovrascrivere il primo (caso molto raro: dopo il primo salvataggio si usa `upd`).
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte: non è un errore dell'app.
- Le prove locali nascondono da sole `firebase-config.js`. Con l'emulatore vanno svuotati sia `demo-jona` sia `jona-ordini`.
- Nella sessione cloud il browser di prova non accetta il certificato del proxy per il sito online: il controllo online si fa confrontando gli hash dei file pubblicati con quelli provati.
- Background Sync non esiste su iPhone: lì il ritentativo avviene solo ad app aperta.
- Il promemoria del contesto non conosce la finestra vera (forzabile con `JONA_CTX_WINDOW`): può segnalare troppo presto.
