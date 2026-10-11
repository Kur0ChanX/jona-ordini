# Passaggio di consegne (2026-10-11, fine sessione #85)

Sessione attuale: #86

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v82** (PR #93 squash `f3e3809`, controllato `APP_VER=82` ~18:10). Ramo riallineato a `main`. Sul ramo, NON ancora online: **v83** (committata).

## Fatto in #85 (11/10, ~17:45-18:10 ora italiana)
- Unite scorte. Mario chiedeva perché l'icona 🫒 non cambiava in SPA: la SPA #08 era ferma su una domanda/permesso e non leggeva i messaggi delle altre sessioni (una sessione bloccata li legge solo dopo la risposta di Mario). Ora SPA #08 chiusa e #09 attiva hanno 🫒. Detto a Mario di rispondere alla domanda aperta in SPA #09.
- La #84 ha aggiunto E37 (domande scritte nel testo invece che a tocco). Rifatta la domanda a tocco con doppio tocco: Mario ha scelto **D10**.
- **v82 online** (D10): foglio «Inviato allo chef» solo «Continua» (tolto «Esci dal profilo»). Prova in `tools/test-invio-anim.mjs`.

## v83 in corso (D32) — orari di Mauro e Chef, strada «3 Geniale»
- Richiesta di Mario (vedi ultimo messaggio). Immagine con 3 strade (Ovvia: nel pianificatore come tutti; Furba: riga «Responsabili» in cima, ognuno scrive il suo; **Geniale: Furba + striscia «Chi c'è adesso» in tutta l'app con «Scrivi»**). Mario ha scelto **3 Geniale** (doppio tocco confermato).
- Fatto (index.html): `config/orari_<lun>.resp.<id>` = riga di 7 giorni per chi ha `contratto.libero` (`orFree`): scritta subito, niente bozza/pubblicazione/controlli ore. `orResp`, `orRRow`, `orRCan` (la persona stessa o `isMgr`), `orCellSheet(id,g,lun)` in modo `resp` (nota «lo vedono subito tutti», salvataggio separato in `orSaveCell`), azione `orRCell`. Pianificatore (`vOrari`): gruppo «Responsabili · lo vedono subito tutti» in cima alla tabella (`cellR`/`whoR`, colore `.rep-resp` #B5654A). `orOggi`: responsabili da `resp` con «Responsabile ·». `vMieiOrari`: per i responsabili 7 giorni da toccare («Scrivi quando ci sei») e settimana prossima sempre disponibile. `rsStrip(me)` dopo `agStrip` in `screenApp`: «Mauro in servizio fino alle…» / «arriva alle…», bottone «Scrivi» → `rsChat` → `chOpen(chDm(me,u))`; non mostra se stessi; niente se riposo/finito. Firestore: va bene così (`config` già permesso).
- `APP_VER=83`, `CACHE` v87, voce `NEWS` v83 (chef + tutti + dev).
- Prove: nuova `tools/test-orari-resp.mjs` (20 PASS, anche TZ Roma); `tools/test-responsabile.mjs` aggiornata (prima diceva «Mauro non nel pianificatore» e «Orario libero»: comportamento cambiato su richiesta); test-orari, test-v16, test-news verdi.
- **Prossimo**: far girare `test-giro` e `test-demo` (la striscia nuova sta in alto: E35) e `test-firebase-orari` (emulatore), poi PR dal ramo → `prove` verde → squash → merge `main` nel ramo → controllo online `APP_VER=83`. Pubblicare da soli (regola).
- Da aggiungere a CLAUDE.md (Struttura) dopo l'unione: riga «v83 orari dei responsabili» con i nomi qui sopra.

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Proporre con immagine + domanda a tocco con doppio tocco (3 strade: ovvia/furba/geniale). Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima, il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #85 `session_01YBt4KxQa3Z4RMeKrQdvghK` (chiusa), #84 `session_01YDpAVby2ft8GwjUK4qGiUZ`, #83 `session_01LzEDJuhMnDxtkkFmJoMu1G`, #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: **#09** `session_011dYniwuL2fEfLGEsTVRWrp`. Una sessione ferma su una domanda o un permesso non legge i messaggi delle altre finché Mario non risponde lì.
- Ponte con l'hotel: RVC dice che **D5 non è fatto**. M42 5stelle: si aspettano le risposte della reception (in RVC).
- D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sotto).

## Note tecniche
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…` (risposta JSON `{ok,link,cartella}`; per avere il link di una cartella si carica un file dentro). `cairosvg` e `potracer` vanno installati con pip a ogni sessione.
- Server locale `python3 -m http.server 8765`; Playwright `/opt/node22/lib/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini (cambierà dopo D30), `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare; chi ha ancora l'icona vecchia deve reinstallare (per questo l'attesa con la scatola nera).
- Repo privato: le prove su GitHub consumeranno minuti (2000/mese dell'organizzazione).
- URL del Drive: se finisse in un file pubblico, chiunque potrebbe caricare file nella cartella di Mario → in quel caso Mario fa un nuovo deployment e l'URL vecchio si spegne.

## Ultimo messaggio di Mario, parola per parola
«anche mauro abilitano agli orari metti il programma orari di mauro e chef in un punto visibile e controlla se c'è bisogno di migliorie o funzioni, funzioni evolute smart nel programma orari e agenda»
(La prima parte = D32 v83, la seconda = D33 da proporre.)
