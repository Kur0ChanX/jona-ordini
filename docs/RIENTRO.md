# D58 · Nessuno resta fuori dall'app (rientro dopo un telefono svuotato)

Richiesta di Mario del 20/11/2026 (#144, urgenza). Regola sua per tutti i progetti: **nessuno deve mai restare bloccato fuori dall'app**.
Piano scritto con Fable, da costruire a pezzi con Opus (un pezzo = una versione, prove verdi, foto a Mario prima di andare online).

## Cosa è successo
- Il telefono di Mario (Xiaomi, app dalla Home) ha perso la memoria di Chrome per i siti: Jona e RVC insieme. Non è il codice.
- In Jona il telefono svuotato perde 3 cose: `jona_key` (chiave del ristorante), l'accesso anonimo di Firebase (`membri/<uid>` approvato) e `jona_me` (profilo aperto). Mostra «Collega questo telefono» (`screenJoin`).
- Il profilo (`staff/<id>`) e tutti i dati stanno sul server e sono legati al profilo, non al telefono: svuotare il telefono non li tocca.
- Rientro di oggi: codice o QR di un collega → «Ho già un profilo» → un gestore approva → nome utente e password. Tre punti deboli: serve un collega, serve un gestore, serve la password; e «Sono nuovo: creo il mio profilo» crea un doppione.

## Mattoni che ci sono già (niente regole nuove di Firestore)
- Invito monouso v40: `inviti/<gettone> {sid, fino}` (max 8 giorni), il telefono col gettone si approva da solo (`S.db.phone.tk`, regole `invitoBuono`/`mioInvito`). Oggi vale solo per i profili `invitato`.
- Un telefono approvato può scrivere in ogni `membri/<uid>` (regola `membro()`); ogni telefono legge il suo.
- Worker `jona-notifiche`: `membro()` (controlla il gettone Firebase e prende la chiave da `membri/<uid>.k`), D1, limite di codici sbagliati per IP (`inv_err`).
- L'accesso al profilo è solo sul telefono (`jona_me`): il vero cancello sono la chiave e il telefono approvato.

## Il mattone nuovo: «biglietto di rientro»
`inviti/<gettone> {sid, fino, r:1}` per un profilo **attivo**. Il telefono che lo presenta: si approva da solo (stessa scrittura di oggi, senza toccare `staff`), poi apre il profilo `sid` (`login(sid)`), senza password e senza creare niente. Vale una volta sola.
In `screenInvite`/`itGo`: se l'invito ha `r:1` (o il profilo è `attivo`) → «Bentornato <nome>!» ed entra; mai il modulo della password.

## Pezzi (in ordine)

### Pezzo 1 · Memoria protetta (invisibile, va online per primo)
- In `boot()`: `navigator.storage.persist()` a ogni apertura (se esiste; mai errori a video). Esito in `S.mp` e in `membri/<uid>.mp` + `visto` (una scrittura al giorno al massimo, solo se cambia o è passato un giorno; solo telefoni approvati).
- Per i gestori, in Staff, sotto la persona: «Memoria protetta: sì/no · visto il …» (serve a capire chi è a rischio). Se il browser dice no: nessun avviso allo staff.
- Limite da dire a Mario: protegge dalla pulizia automatica per poco spazio, non da «Cancella dati» fatto a mano o da un'app di pulizia.
- Prova: `tools/test-memoria-protetta.mjs` (la funzione viene chiamata a ogni apertura; senza la funzione l'app parte lo stesso).

### Pezzo 2 · Sblocco tramite un gestore, senza password e senza doppioni
- **Telefoni da approvare** (`vStaff`, `phApprove`): per «ha già un profilo» il gestore sceglie il profilo (già scelto quello con lo stesso nome) → «Ricollega»: `membri/<uid> {ok:true, sid}`. Il telefono, appena approvato, legge il suo `sid` ed entra in quel profilo senza password.
- Richiesta «nuovo profilo» con nome e cognome uguali a un profilo che c'è (confronto con `normUser`): avviso «Sembra <nome>, che ha già un profilo» con «È lui: ricollega» (niente profilo nuovo) e «È una persona nuova».
- **Staff → persona → «Ricollega il telefono»**: crea il biglietto (1 giorno) e chiede al Worker un codice di 6 lettere (`/inviti` con `{rientro: gettone}`; `/invito/<codice>` risponde `{k, t}`). A video: codice grande, QR, «Manda su WhatsApp». La persona scrive le 6 lettere in «Collega questo telefono» (va anche su iPhone dall'icona) ed è dentro, nel suo profilo.
- **Chi può sbloccare**: `canUnlock(u) = isMgr(u) || u.sblocca` (interruttore «Può ricollegare i telefoni» nel profilo, lo mettono i gestori). Regola «sempre almeno 2»: striscia ai gestori se sono meno di 2; disattivare, eliminare o togliere l'interruttore al penultimo → rifiuto con «Prima scegli un'altra persona». «Fine stagione» non tocca chi può sbloccare.
- Avviso ai gestori a ogni rientro («<nome> è rientrato da un telefono nuovo»).
- Prova: `tools/test-firebase-rientro.mjs` parti A (approvazione con profilo) e B (codice del gestore): telefono svuotato (contesto nuovo del browser) → stesso `sid`, numero di profili invariato.

### Pezzo 3 · Rientro da soli, ben visibile in «Collega questo telefono»
- `screenJoin`: in alto «Avevi già l'app? Rientra» con nome utente e password e pulsante grande «Rientra»; sotto, come oggi, QR e codice d'invito per chi è nuovo. «Non ricordo la password» → «Chiedi allo chef o a un responsabile: ti dà un codice di 6 lettere» + avviso push ai gestori (Worker, limitato).
- Worker, tabella D1 `rientro (u, sid, v, k, tk, fino)`:
  - `POST /rientro/salva` (solo telefoni approvati): righe `{u, sid, v, tk, fino}` con `v = sha256('jona-rientro:' + staff.pass)`; `k` lo prende il Worker da `membri/<uid>.k`.
  - `POST /rientro` `{u, p}`: il Worker calcola `sha256(sid+':'+p)` e confronta con `v`; giusto → `{k, t, sid}` (se il biglietto è scaduto: `{k, sid}` e il telefono chiede l'approvazione già col suo profilo). Sbagliato: sempre la stessa risposta. Limiti: 5 sbagli per nome utente e 20 per IP ogni ora, poi pausa.
- Chi tiene vivi i biglietti: ogni telefono approvato, una volta al giorno, rinnova il suo (8 giorni) se ne restano meno di 4; i telefoni di chi può sbloccare rinnovano quelli di tutti i profili attivi e cancellano gli scaduti.
- Cambio password o nome utente → riga aggiornata subito.
- Prova: parte C di `test-firebase-rientro.mjs` (svuotato → nome utente e password → stesso profilo, niente attesa; password sbagliata 6 volte → pausa; biglietto scaduto → approvazione col profilo già scelto). Aggiornare tutti i Worker finti (E14: `grep -l jona-notifiche tools/*.mjs`).

### Pezzo 4 · Pulizia e controllo
- Telefoni morti: `membri` con `visto` più vecchio di 90 giorni → elenco ai gestori con «Togli» (mai da soli).
- La prova `test-firebase-rientro` entra in `tools/prova-ci.sh`; riga in `.claude/rules/struttura.md` a ogni versione.

## Scelte di Mario che servono (chieste il 20/11)
1. Rientro da soli con nome utente e password (consiglio) oppure solo tramite un gestore.
2. Chi può sbloccare oltre a Maurizio e allo sviluppatore (consiglio: Mauro, più l'interruttore nel profilo).

## Idea per dopo (non ora)
«Rientra con Google»: identità fissa che non dipende dalla memoria del browser. Serve accendere Google in Firebase e non copre gli iPhone senza account Google.
