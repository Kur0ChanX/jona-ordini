# Passaggio di consegne (2026-10-04)

## Stato attuale
- Online la **v13** (PR #23, squash `4562ed6`): `APP_VER=13`, `sw.js` `CACHE=jona-ordini-v17`. Ramo `backup-automatico` allineato a `main`.
- Prove tutte verdi: `test-staff`, `test-voice`, `test-scaglione2`, `test-news` (riscritta: conteggi da `NEWS`, contatore «9+»), `test-firebase-*` con l'emulatore.
- Mario deve ancora provare la v13 sul telefono (carrello «È urgente?», import con prezzo più alto, controllo merce con un mancante).
- **In corso: Orari del personale (Scaglione 3, v14). Progetto deciso qui sotto, codice NON ancora scritto.** Mario: «vai punto 1 fallo bene bene un lavoro d'arte» (prima gli orari, poi le lingue). Testo originale in `docs/RICHIESTE-MARIO.md`.

## Progetto Orari (v14)
**Dati, tutto in `config`** (nessuna regola Firestore nuova, niente da ripubblicare per Mario):
- Settimana: `config/orari_<lunedì YYYY-MM-DD>` = `{tipo:'orari', lun, t:{<idPersona>:{'0'..'6':valore}}, tp:copia pubblicata, pub:ora pubblicazione, pubDa, mod:ultima modifica}`.
- Valore del giorno: stringa `"10:00-15:00"` o `"10:00-15:00,18:00-23:00"` (fine ≤ inizio = finisce dopo mezzanotte); `R` riposo, `F` ferie, `M` malattia, `P` permesso; chiave assente = niente. Stringhe perché Firestore non accetta array di array.
- Turni tipo: `config/orari_tipi` `{l:[{id,n,v}]}`; predefiniti Pranzo `10:00-15:00`, Cena `18:00-23:30`, Spezzato `10:00-15:00,18:00-23:00`, Giornata `09:00-17:30`.
- Contratto: `staff.contratto` `{ore, pausa (min), liberi}`, predefinito 40/30/1.
- Scrittura di una persona: `upd('config',id,{['t.'+idPersona]:riga, mod:now()})`, `put` se la settimana non esiste. **`LocalStore.update` va esteso ai percorsi con il punto** (oggi fa solo `Object.assign`); Firestore li capisce già.

**Funzione 1, contratto nel profilo:** in `profileForm` nuova opzione `contr` con sezione «Contratto e orari»: ore a settimana (chip 40/36/30/24/20 + campo), pausa nei turni oltre 6 ore (No/15/30/45/60 min), giorni liberi (1/2/3). Mostrata in `registerSheet('admin')` e `profileSheet` solo ai gestori (anche sul proprio profilo), mai per il ruolo dev. Controllo in `checkForm` (ore da 1 a 60), salvataggio in `createProfile`/`saveProfile`.

**Funzione 2, pianificatore (gestori):** nella scheda Staff un interruttore «Persone | Orari» (ricordato in `jona_staffsub`: aggiungerlo alle chiavi in `CLAUDE.md`). Niente 7ª voce nel menu: a 320 px non ci sta.
- Barra settimana ‹ 5 – 11 ottobre ›; pulsanti «Copia settimana prima» (chiede conferma se c'è già qualcosa), «Turni tipo» (lista, aggiungi, elimina), «Pubblica» / «Avvisa delle modifiche».
- Tabella che scorre in orizzontale con la colonna dei nomi fissa (avatar, nome, ore/contratto con barretta), righe per reparto, blocchi colorati per reparto (cucina `--ocra`, sala `--lagoon`, altro `--mirto`, così vale anche il tema scuro), assenze in grigio, oggi evidenziato, riga finale «In servizio» per giorno.
- Tocco su una cella: foglio con chip dei turni tipo, chip delle assenze, orari a mano (`input type=time`, fino a 2 turni), ore del giorno, «Uguale anche per» (Lun–Dom, per applicare a più giorni), «Togli» e «Salva». Dopo il salvataggio un messaggio con il primo problema trovato.
- Persone: staff e gestori attivi; il dev solo se ha un contratto.

**Funzione 3, controlli e vista staff:**
- `orCheck(persona, settimana, settimanaPrima)`: turni sovrapposti; meno di 11 ore di riposo tra giorni diversi (usa anche la domenica della settimana prima); giornata oltre 13 ore; 24 ore di riposo di fila nella settimana; giorni lavorati oltre 7 − liberi; più di 6 ore senza pausa (pausa del contratto < 10); ore nette (pausa tolta nei turni oltre 6 ore) oltre il contratto = avviso, oltre 48 = errore. Ferie, malattia e permesso valgono ore/(7 − liberi).
- Riquadro «N da controllare» sopra la tabella (il tocco apre la cella); celle con bordo rosso (errore) od ocra (avviso); nota per chi non ha il contratto. Le ore in meno compaiono solo nel totale, non come problema.
- Pubblica: copia `t` in `tp` e manda `notify(idPersona,'Orari pubblicati: …',…,'orari',lun)` a chi ha turni (prima volta) o a chi ha la riga cambiata (confronto giorno per giorno, non con JSON). Se ci sono errori chiede conferma. Stato: Bozza / Pubblicata / Modifiche da avvisare; puntino sulle celle cambiate dopo la pubblicazione.
- Staff: voce «Orari» in `STAFF_TABS` (icona `calendar` da aggiungere in `IC`; verificare che 5 voci stiano a 320 px, «I miei ordini» può andare a capo). Mostra «I miei orari»: solo la copia pubblicata `tp` della propria riga, una card grande per giorno, «Oggi», totale ore e avviso se è pronta la settimana dopo. `NI.orari='calendar'` in `notifSheet`.

**Dove scrivere:** codice nuovo prima di `/* ================= notifiche, menu, impostazioni` (riga ~2346); azioni con `Object.assign(A,…)`, `CH`, `IN` prima di `async function guard`; CSS prima di `</style>` (riga 612); `V.orari` in `shell`.

**Chiusura:** `APP_VER` 14, voce `NEWS` v14 (tutti/chef/dev), `CACHE` v18. Nuova `tools/test-orari.mjs` (contratto, turno tipo su più giorni, errori 11 ore / giorni liberi / ore, copia settimana, pubblica e notifica, lo staff vede solo i suoi, 320 px senza scorrimento della pagina, tema scuro) più una prova con l'emulatore per `t.<id>`; `tools/README.md`. Poi PR → squash → controllo online → `git merge origin/main` e push normale.

## Dopo
- **Scaglione 4** (da proporre a Mario): condividi/stampa degli orari (PDF, WhatsApp), riepilogo ore del mese, richieste di cambio turno o ferie dallo staff.
- **Scaglione 5:** più lingue per lo staff (scelta per persona; ordini e prodotti in italiano).
- Idee non scelte: vedi `docs/RICHIESTE-MARIO.md`.

## Decisioni e motivi
- Pubblicazione senza force: dopo lo squash merge si fa `git merge origin/main` sul ramo e push normale.
- Push: Cloudflare Worker, iscrizioni fuori da `S.db` (un `permission-denied` lì bloccherebbe l'app). Urgenza riconosciuta da `sw.js` dal titolo «URGENTE».
- Orari in `config` e non in una collezione nuova: una collezione nuova richiederebbe di ripubblicare le regole, e fino ad allora ogni scrittura darebbe `permission-denied`, che blocca l'app.
- Un documento per settimana (non per persona): circa 52 documenti l'anno letti all'avvio, invece di centinaia.

## Rischi e note aperte
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte: non è un errore dell'app.
- `test-staff` e `test-news` vanno lanciati con `firebase-config.js` nascosto (vedi `tools/README.md`). Con l'emulatore vanno svuotati sia `demo-jona` sia `jona-ordini`.
- Background Sync non esiste su iPhone: lì il ritentativo avviene solo ad app aperta.
- Il promemoria del contesto non conosce la finestra vera (forzabile con `JONA_CTX_WINDOW`): può segnalare troppo presto.
