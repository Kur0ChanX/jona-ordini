# D58 · Nessuno resta fuori dall'app (rientro dopo un telefono svuotato)

Richiesta di Mario del 20/11/2026 (#144, urgenza). Regola sua per tutti i progetti: **nessuno deve mai restare bloccato fuori dall'app**.
Ragionamento fatto con Fable; si costruisce a pezzi con Opus (un pezzo = una versione, prove verdi, foto a Mario prima di andare online). Le scelte tecniche qui sotto sono chiuse: non rifarle, costruirle.

## Cosa è successo
- Il telefono di Mario (Xiaomi, app dalla Home) ha perso la memoria di Chrome per i siti: Jona e RVC insieme. Non è il codice.
- Il telefono svuotato perde 3 cose: `jona_key` (chiave del ristorante), l'accesso anonimo di Firebase (`membri/<uid>` approvato) e `jona_me` (profilo aperto) → `screenJoin` «Collega questo telefono».
- Profilo (`staff/<id>`) e dati stanno sul server, legati al profilo: svuotare il telefono non li tocca.
- Rientro di oggi: codice o QR di un collega → «Ho già un profilo» → un gestore approva → nome utente e password. Punti deboli: serve un collega, un gestore e la password; «Sono nuovo: creo il mio profilo» (pulsante principale) crea un doppione.
- Su iPhone la stessa cosa capita da Safari dopo 7 giorni senza aprire il sito (non dall'icona sulla Home).

## Fatti del codice su cui poggia il piano (letti in #144)
- Il profilo aperto è solo sul telefono (`login(id)` → `jona_me`): il vero cancello sono chiave + telefono approvato. Ogni telefono approvato legge e scrive tutto `staff` e ogni `membri/<uid>` (regola `membro()`); un telefono in attesa può scrivere solo il suo `req`.
- `staff.pass = sha(id+':'+password)` (`sha` = SHA-256 esadecimale, index.html).
- Worker: `membro(request, env)` legge `membri/<uid>` col gettone del telefono (la firma la controlla Firestore) e tiene la chiave in `membriK`; `richiesta()` fa lo stesso per un telefono in attesa; `invCrea`/`invLeggi` (D1 `inviti (c, k, scade)`, sbagli per IP in `inv_err`, 20 l'ora); `send(env,{titolo,testo,tag,subs})` e `promGet(db,'piano').gest` per le push ai gestori.
- Il Worker non ha accesso da amministratore a Firestore: usa sempre il gettone di chi chiama.
- **Nessuna regola nuova di Firestore**: tutto il piano gira con le regole di oggi (Mario non deve incollare niente).

## Scelta tecnica chiusa: il «telefono del server»
Il Worker diventa un telefono approvato del ristorante (un accesso anonimo suo, il gettone di rinnovo in D1). Così, da solo e in ogni momento, può: leggere `staff` (controllare nome utente, password e stato sul dato vero) e approvare `membri/<uid>` di chi rientra scrivendo `{ok:true, sid}`.
Scartato: «biglietti» `inviti/<gettone>` preparati dai telefoni (le regole li fanno scadere dopo 8 giorni: servirebbero rinnovi da ogni telefono e una copia delle password in D1 che invecchia).
Scartato: chiave di servizio di Firebase nel Worker (segreto potente, passi a mano per Mario).
Rischio accettato: chi ruba D1 ha un accesso da telefono approvato (D1 tiene già la chiave del ristorante); si spegne cancellando `membri/<uid del server>`.

### Nascita e cura del telefono del server
- `POST /rientro/robot` (solo telefoni approvati, corpo `{api}` = `fbCfg().apiKey`): se in D1 c'è già e funziona (rinnovo del gettone riuscito, `membri/<uid>` letto, `ok` non falso, stessa `k`) → `{ok:true}`; se `ok` è falso → `{ok:false, uid}`; altrimenti lo crea: `accounts:signUp` (anonimo, `returnSecureToken`), poi crea `membri/<uid>` `{k, ok:false, robot:true, creato, ua:'jona-notifiche'}` col suo gettone, salva `{uid, rt, k, api}` in D1 → `{ok:false, uid}`.
- App: il telefono di chi può sbloccare, una volta al giorno dopo `ready` (`jona_rb`), chiama `/rientro/robot`; con `ok:false` fa `membri/<uid>.update({ok:true, approvato, da})`. Si ripara da solo se D1 si perde. Il robot non ha `req`: `phPend()` non lo mostra.
- Gettone del robot: `securetoken …/v1/token` (`grant_type=refresh_token`), tenuto in memoria fino alla scadenza. Mandare l'intestazione `Referer` con l'indirizzo dell'app (chiave web con limiti di provenienza).
- Indirizzi di Google in variabili (`FS_BASE`, `ID_BASE`, `TOK_BASE`, di base quelli veri) per puntare agli emulatori nelle prove; togliere l'indirizzo fisso da `membro()` e `richiesta()`.
- Tabelle D1 nuove (create alla prima chiamata, come `invDb`): `rie (id TEXT PRIMARY KEY, v TEXT NOT NULL, scade INTEGER NOT NULL)` per `robot` e permessi `g_<32 caratteri>`; `rie_err (chi TEXT PRIMARY KEY, n INTEGER NOT NULL, t INTEGER NOT NULL)`. In `inviti` una colonna in più `sid` (`ALTER TABLE` protetto da try): riga con `sid` = codice di rientro.

### Un solo modo di entrare, per tre strade
Il telefono in attesa diventa approvato con `membri/<uid> {ok:true, sid}`. In `approval()` (index.html), quando arriva l'`ok` dal server: `st.entra = x.sid || ''`. Poi `rieCheck()` (chiamata in `render()` accanto a `waitCheck()`): senza `S.me`, con tutto caricato e `st.entra` di un profilo `attivo` → `login(sid)` una volta sola, «Bentornato <nome>!». Mai moduli, mai profili nuovi. Chi scrive `{ok, sid}`:
1. il gestore da «Telefoni da approvare» (Pezzo 2a, solo app);
2. il robot dopo un codice di 6 lettere dato da chi può sbloccare (Pezzo 2b);
3. il robot dopo nome utente e password giusti (Pezzo 3).

## Pezzi (in ordine; ognuno con la sua prova)

### Pezzo 1 · Memoria protetta (non si vede; online per primo)
- `boot()`: `mpAsk()` non attesa, mai in demo: `S.mp = await navigator.storage.persisted() || await navigator.storage.persist()` dentro try (manca la funzione → `null`, nessun errore a video). Firefox chiede il permesso con un riquadro: lì `persist()` al massimo ogni 30 giorni (`jona_mp_t`). Prima di scrivere il codice: skill `ricerca-aggiornata` su `StorageManager.persist` (Chrome Android, Safari, Firefox).
- Telefono approvato con profilo aperto: al massimo una scrittura ogni 20 ore (`jona_mpw`), o subito se cambia qualcosa, su `membri/<uid>`: `{mp: S.mp===true, visto: now(), sid: S.me}`. Anche subito dopo `login(id)`.
- Gestori: nella scheda del profilo (`profileSheet`) una riga «Telefono: memoria protetta sì/no · aperto il …» (lettura di `membri` all'apertura di Staff, tenuta 5 minuti). Nessun avviso allo staff.
- Da dire a Mario: ferma la pulizia automatica per poco spazio, non «Cancella dati» a mano né le app di pulizia.
- Prova `tools/test-memoria-protetta.mjs`: chiamata a ogni apertura; senza la funzione l'app parte; scrittura di `mp`/`visto`/`sid`.

### Pezzo 2a · Sblocco dall'elenco «Telefoni da approvare» (solo app, niente Worker)
- Riga «ha già un profilo»: menù «È: <profilo>» già messo sul profilo con lo stesso nome (`normUser(nome+' '+cognome)`, o `req.sid` se c'è) + pulsante «Ricollega» → `phApprove(id, sid)` scrive anche `sid`. Voce «Non lo so» = approvazione di oggi (poi nome utente e password).
- Riga «nuovo profilo» con lo stesso nome di un profilo che c'è: avviso «Sembra <nome>, che ha già un profilo» con «È lui: ricollega» (nessun `staff` nuovo) e «È una persona nuova» (come oggi).
- `screenPhone` «Benvenuto!»: sotto i pulsanti «Hai già usato Jona? Tocca Ho già un profilo.»; «Ho già un profilo» diventa il pulsante principale.
- Chi può sbloccare: `canUnlock(u) = isMgr(u) || !!u.sblocca`; interruttore «Può ricollegare i telefoni» in `profileSheet` (lo mettono i gestori). `phWatch`, `phStrip` e l'elenco valgono per `canUnlock`. Chi non ha la scheda Staff (es. Mauro, ruolo staff): voce «Ricollega un telefono» in `meMenu` con telefoni in attesa e, dal Pezzo 2b, le persone attive.
- «Sempre almeno 2»: `unlockers()` = profili attivi con `canUnlock`. `sdel`, `stoggle`, `psaveProfile` (cambio ruolo o interruttore) ed `endSeason` rifiutano di scendere sotto 2: «Resterebbe una sola persona che può ricollegare i telefoni: prima scegline un'altra». Striscia ai gestori se sono già meno di 2.
- Avviso ai gestori a ogni rientro: lo manda il telefono rientrato dopo `login` (`notify('gestori', …)`, come `itGo`), solo per le strade 2 e 3.

### Pezzo 2b · Codice di rientro dato da chi può sbloccare (Worker + app)
- `POST /rientro/codice` `{sid}` (telefono approvato): il robot legge `staff/<sid>`, deve essere `attivo`; cancella i codici di rientro vecchi di quel `sid`; inserisce in `inviti` un codice di 6 lettere (`INV_ABC`) con `sid`, 24 ore → `{codice, scade}`. Robot non pronto → 503 (l'app lancia `/rientro/robot` e dice «Riprova tra un minuto»).
- `GET /invito/<codice>`: se la riga ha `sid` risponde `{k, r:1}`.
- App di chi sblocca: `profileSheet` di un profilo attivo → «Ricollega il telefono» → foglio «Ricollega il telefono di <nome>»: codice grande, QR di `INV_URL/<codice>`, «Fagli scrivere queste 6 lettere in "Collega questo telefono". Vale 24 ore, una volta sola. Entra nel suo profilo di prima, senza password.», «Manda su WhatsApp» (il codice per primo nel testo: su iPhone il link apre Safari, non l'app della Home), «Copia».
- Telefono svuotato: `fbJoinKey` e `jona_icode` con `r:1` → `ls('jona_rc', codice)` insieme alla chiave → ricarica → in `connect()`, col telefono in attesa: `POST /rientro/apri` `{c}` con il gettone del telefono.
- `POST /rientro/apri` `{c}` (telefono in attesa): legge `membri/<uid>` col gettone di chi chiama (deve esistere, stessa `k` del robot; già approvato → `{ok:true, gia:true}`); `c` = codice di 6 lettere con `sid` oppure permesso `g_…`, non scaduto (sbagliato → 404 e conta per IP); il robot rilegge `staff/<sid>` (attivo); `PATCH membri/<uid>` con maschera `ok, sid, approvato, da, req` → `{ok:true, sid, approvato, da:'rientro'}`; cancella codice o permesso (una volta sola) → `{ok:true, sid}`.
- Durante l'attesa `screenPhone` mostra «Bentornato! Ti faccio rientrare…» (non i due pulsanti). Codice scaduto → via `jona_rc`, avviso, schermata normale. Senza rete → 3 tentativi, poi «Riprova».

> #147: fatto nella v122 con una variante: l'accesso è PER PERSONA (app secondaria, `membri` con `sv:true`), non il telefono anonimo collegato; così reggono tablet condivisi, più telefoni, telefono tolto e cambio password del gestore (`staff.svh`/`svo`). Dettagli in `.claude/rules/struttura.md` riga v122.

### Pezzo 3 NUOVA STRADA (#146, D59 «salvagente plug and play», Mario 20/11: «vai di tuo consiglio… iPhone e Android… plug and play»)
Scelta tecnica cambiata (decisa da Claude, detta a Mario): niente robot nel Worker per il pezzo 3. Il telefono anonimo di ogni persona viene **collegato a un accesso Firebase con nome utente e password** (`linkWithCredential` con `EmailAuthProvider`, email finta `<nome utente>@utenti.jona`): l'`uid` non cambia, quindi `membri/<uid>` resta approvato con `sid`. Telefono svuotato: «Bentornato!» → il gestore delle password di Google o iCloud riempie i campi → «Rientra» = `signInWithEmailAndPassword` → stesso `uid`, già approvato → legge `membri/<uid>` (`k`, `sid`) → dentro. Niente codici, niente Worker, niente regole nuove di Firestore. Firebase blocca da solo i tentativi in serie.
- Passo a mano di Mario (una volta): https://console.firebase.google.com/project/jona-ordini/authentication/providers (Sicurezza → Authentication → scheda «Sign-in method» → «Email/password» → primo interruttore «Attiva», NON «Link via email» → «Salva»; nomi dal manuale Firebase del 10/11/2026) (oggi risponde PASSWORD_LOGIN_DISABLED, controllato il 20/11).
- Si collega: alla registrazione, a ogni accesso con password (`doLogin`), al cambio password (`updatePassword`), e per chi è già dentro con una scheda una tantum «Metti al sicuro il tuo accesso» (scrive la password una volta: controllo con `staff.pass`, collegamento, il telefono propone di salvarla). Campi dentro un vero `<form>` con `autocomplete="username"`/`current-password`/`new-password`; su Chrome anche `navigator.credentials.store(new PasswordCredential(…))`.
- Persona con più telefoni: l'email è già usata → quel telefono entra con `signInWithEmailAndPassword` (stesso account per tutti i suoi telefoni). Telefono già collegato a un'altra persona (tablet di cucina): non si tocca.
- Cambio nome utente: `unlink('password')` + nuovo collegamento. «Non ricordo la password» → resta la strada della v121 (chi sblocca tocca «Ricollega»).
- Prova `tools/test-firebase-salvagente.mjs` (emulatori): registrazione → telefono svuotato → nome utente e password → stesso `sid` e stesso `uid`, nessun profilo nuovo; password sbagliata → resta fuori; secondo telefono della stessa persona; scheda una tantum.
- Poi (D59 seconda parte): impronta o viso (passkey) dal Worker.

### Pezzo 3 · Rientro da soli, ben visibile (VECCHIA strada col robot, sostituita dalla sezione sopra) (dopo la risposta di Mario alla domanda 1)
- `screenJoin`, dall'alto: riquadro «Avevi già l'app? Rientra nel tuo profilo di prima.» con Nome utente, Password, pulsante grande «Rientra», sotto «Non ricordo la password»; poi «Hai un codice? (6 lettere)» + «Collega»; in fondo «È la prima volta? Chiedi allo chef il QR code o il link.»
- `POST /rientro` `{u, p}` (aperto a tutti): limiti prima di tutto (`rie_err`: 20 sbagli l'ora per IP, 5 l'ora e 15 al giorno per nome utente → 429 «pausa»); il robot cerca `staff` per `username` (`runQuery`), calcola `sha256(sid+':'+p)` e confronta con `pass` a tempo costante (`ponteUguali`; nome che non c'è: stesso tempo, stessa risposta `sbagliati`); password giusta ma profilo non attivo → `non_attivo`; giusto → permesso `g_<32>` in `rie` (15 minuti, `{sid}`) → `{k, g, nome}`. La password non si salva e non finisce mai nei registri. Al 5° sbaglio su un profilo vero: push ai gestori «Qualcuno prova a rientrare come <nome>».
- App: `rieGo` → `ls('jona_key',k)`, `ls('jona_member',null)`, `ls('jona_rc',g)`, ricarica → stesso giro del Pezzo 2b (`/rientro/apri`).
- «Non ricordo la password»: `POST /rientro/aiuto` `{u}` (3 l'ora per IP, una ogni 30 minuti per nome) → push a chi può sbloccare «<nome> non riesce a rientrare: Staff → <nome> → Ricollega il telefono»; risponde sempre `{ok:true}`. A video: «Ho avvisato lo chef e i responsabili: ti danno un codice di 6 lettere, scrivilo qui sotto.» Il piano dei promemoria manda al Worker anche `sbl` (iscrizioni di chi può sbloccare); il Worker usa `sbl` o, se manca, `gest`.
- Worker non aggiornato o robot non pronto → «Il rientro da soli non è ancora pronto: chiedi il codice di 6 lettere».
- `checkForm`: rifiuta le password nuove troppo facili (uguali a nome o nome utente, `123456`, `000000`, `password`, `qwerty`…): «Scegli una password meno facile da indovinare».

### Pezzo 4 · Controllo e pulizia
- Striscia ai gestori se meno di 2 persone che possono sbloccare hanno un telefono aperto negli ultimi 30 giorni (`membri` con `sid` e `visto`): «Tra chi può ricollegare i telefoni solo <nome> ha l'app attiva».
- Telefoni non aperti da 90 giorni e robot vecchi (`robot:true` con uid diverso da quello in uso): elenco ai gestori con «Togli». Mai cancellazioni da sole.

## Prove
- `tools/test-rientro-server.mjs` (Worker vero, D1 finto con `node:sqlite` e `fetch` di Google finto, sul modello di `tools/test-ponte-server.mjs`): robot nasce, si ripara, `k` diversa rifiutata; codice una volta sola e scaduto; limiti e pause; risposta uguale per nome sbagliato e password sbagliata; profilo non attivo.
- `tools/test-firebase-rientro.mjs` (emulatori, sul modello di `tools/test-firebase-telefoni.mjs`; le chiamate a `PUSH_URL/rientro*` e `/invito/*` passano al Worker vero dentro la prova, puntato agli emulatori). «Telefono svuotato» = contesto nuovo del browser. In ogni parte: stesso `sid` di prima in `jona_me`, numero di documenti in `staff` invariato, ordini e chat di prima visibili.
  - A: codice normale → «Ho già un profilo» → il gestore tocca «Ricollega» → dentro senza password.
  - B: «Ricollega il telefono» → codice → dentro senza approvazione; lo stesso codice una seconda volta non vale.
  - C: nome utente e password → dentro subito; 6 password sbagliate → pausa; profilo disattivato → rifiutato.
  - D: «Sono nuovo» con lo stesso nome → avviso al gestore → «È lui: ricollega» → nessun profilo nuovo.
  - E: non si scende sotto 2 persone che sbloccano.
- Tutte e due in `VELOCI` di `tools/prova-ci.sh`. Aggiornare ogni Worker finto (E14: `grep -l jona-notifiche tools/*.mjs`). A ogni versione: `CACHE`, `NEWS`, `APP_VER`, riga in `.claude/rules/struttura.md`.

## Scelte di Mario: «tutto come consiglio» (20/11/2026 19:42)
- Decise: 1 = rientro da soli con nome utente e password; 2 = Mauro più l'interruttore nel profilo.

### Testo delle domande (storia)
1. Pezzo 3: rientro da soli con nome utente e password (consiglio) oppure solo tramite chi può sbloccare.
2. Pezzo 2a: chi può sbloccare oltre a Maurizio e allo sviluppatore (consiglio: Mauro, più l'interruttore nel profilo).
Pezzi 1 e 2b non dipendono dalle risposte.

## Idea per dopo (non ora)
«Rientra con Google»: identità fissa che non dipende dalla memoria del browser. Serve accendere Google in Firebase e non copre gli iPhone senza account Google.
