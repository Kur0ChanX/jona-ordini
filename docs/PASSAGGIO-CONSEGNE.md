# Passaggio di consegne (2026-10-04)

## Stato attuale
- Online la **v15** (PR #25, squash `81d7022`): animazione «Inviato allo chef» + «È urgente» senza punto di domanda. `APP_VER=15`, `CACHE=jona-ordini-v19`. File online identici a quelli provati; ramo riallineato con `git merge origin/main`.
- Prove verdi: `test-invio-anim` (14), `test-orari` (62), `test-firebase-orari` (14), `test-staff`, `test-news`, `test-scaglione2`, `test-voice`, `test-report`, `test-firebase-*`.
- Mario deve ancora provare sul telefono v13 (urgente, prezzi, controllo merce), v14 (orari) e v15 (animazione dopo «Invia allo chef», anche su iPhone).

## Animazione invio (v15): com'è fatta
- `media/invio-chef.mp4` (265 KB, 4,8 s, 24 fps): H.264 720×808, sopra il colore e sotto la trasparenza («alpha impilato»: i video trasparenti WebM/HEVC non vanno su tutti i telefoni). `sendAnim` lo carica come blob (`animPrefetch`, all'apertura del carrello e all'invio), lo unisce con WebGL su un canvas trasparente sopra l'app (`.snd-anim`, sfondo sfocato), scritta «Inviato allo chef» verso la fine, poi il solito foglio. Si salta con «riduci movimento», senza WebGL, se il video non parte o con un tocco; massimo 9 s.
- Rifarlo: `python3 tools/anim-invio.py <filmato>` (rembg isnet + u2net, colori caldi, bordi sfumati). Il Chromium di Playwright non legge l'H.264: `test-invio-anim` usa una copia WebM e blocca il service worker.

## Orari (v14): com'è fatto
- **Dati in `config`** (nessuna regola Firestore nuova): `config/orari_<lunedì AAAA-MM-GG>` = `{tipo:'orari',lun,t:{<persona>:{'0'..'6':valore}},tp,pub,pubDa,mod}`; valori `"10:00-15:00"`, `"10:00-15:00,18:00-23:00"` (fine ≤ inizio = dopo mezzanotte), `R`/`F`/`M`/`P`. Turni tipo in `config/orari_tipi` `{l:[{id,n,v}]}` (predefiniti `OR_TIPI0`). Contratto in `staff.contratto` `{ore,pausa,liberi}` (predefinito `CONTR0` 40/30/1).
- **Scrittura di una persona**: `orSaveRow` → `upd('config',id,{['t.'+persona]:riga})`, `put` se la settimana non esiste. `LocalStore.update` ora applica i percorsi con il punto come Firestore.
- **Codice** (`index.html`, blocco `/* orari del personale */` prima di «notifiche, menu, impostazioni»): `orCheck` (sovrapposizioni, 11 ore anche dalla domenica prima, 13 ore, 24 ore di fila, giorni liberi, un solo avviso «senza pausa» con tutte le caselle segnate `gs`, contratto = avviso, 48 ore = errore), `orProblems`, `orStato`, `vOrari` (pianificatore), `orCellSheet`/`orSaveCell`, `orCopy`, `orTipiSheet`, `orPublish` (notifica tipo `orari` solo a chi cambia, mai a sé stessi), `vMieiOrari` (staff, solo `tp`), `orContrForm` nel `profileForm` (opzione `contr`, nascosta per il ruolo dev, flag `S.form._c`). Azioni in `Object.assign(A,…)` prima di `guard`; CSS «orari del personale» prima di `</style>`.
- **Interfaccia**: scheda Staff con interruttore Persone | Orari (`S.staffSub`, `jona_staffsub`); voce «Orari» nello `STAFF_TABS` (5 voci: a 320 px le scritte vanno a capo); icone `calendar` e `chevl` in `IC`. Nella tabella gli orari sono compatti (`orHMc`: «10–15», «18–23:30»).

## Prossimi passi
- Chiedere a Mario se gli orari vanno bene dopo la prova sul telefono (passi da dargli: profilo → contratto; Staff → Orari → casella → turno tipo → «Uguale anche per» → Salva → Pubblica; entrare come staff dalla barra **Test** → voce «Orari»).
- **In coda:** le idee scelte da Mario tra le 10 in `docs/RICHIESTE-MARIO.md` (consigliate: timbratura con QR, bolla letta dalla foto, bacheca del servizio).
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
