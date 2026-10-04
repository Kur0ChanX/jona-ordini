# Passaggio di consegne (2026-10-05)

Sessione attuale: #04

## Ultimo messaggio di Mario
«1 Non ho capito questa prova
2 scelta A fallo quando vuoi Fai un QR code con richiesta di approvazione senza tempo con bella grafica
A arriva solo a Maurizio ma per ora
B puoi fare tutti e 2
C selezioni i reparti o tutti
D ai può decidere l'orario
telefoni collegati non ce bisogno
Sicurezza server falla se non crea malus
Si va bene ma meglio che riavviarsi per le troppe modifiche segnalalo hai una versione non aggiornata potresti avere problemi o funzioni in meno si consiglia di chiudere e riaprire l'app... scrivilo bene
cloudfire gratis va bene, domanda ma è uguale a quello che ho già o ha migliorie?
ho provato da ipad al mio Cell e funziona l'audio e il vocale»

Tutto fatto nella v35, tranne le risposte, che la sessione #03 ha dato a Mario nel suo ultimo messaggio:
- **«Non ho capito questa prova»**: è la prova automatica `tools/test-firebase-flow`, che sbaglia solo tra le 23:30 e le 24:00. È un problema della prova, non dell'app. Si sistema da soli (vedi `docs/DA-FARE.md`).
- **Cloudflare Pages**: è la stessa app con le stesse funzioni. Cambia il link (senza «kur0chanx») e il sito è un po' più veloce. Svantaggio: ogni telefono va ricollegato (invito, approvazione, accesso) e le notifiche riattivate. Prima di farlo Mario sceglie il giorno.

## Fatto in sessione #03
- **Maurizio non compare nello Staff**: non si è ancora registrato. La schermata mandata era il telefono di Mario. Mario gli fa l'account domani. Spiegati QR (portone) e approvazione (portiere).
- **Regola nuova** in `CLAUDE.md`: `docs/DA-FARE.md` sempre aggiornato, diviso in 3 parti (Claude da solo / dopo la scelta di Mario / Mario a mano). Le consegne rimandano lì.
- **v35 pubblicata** (PR #44, squash `7dcdf58`, ramo riallineato con `292f1ce`). Verificata online: `APP_VER=35`, `CACHE` `jona-ordini-v39`, `/salute` ok, `/richiesta` senza gettone → 403 (Worker nuovo attivo).
  - `index.html`: `scadL`/`scadAvv`/`scadDue`/`scadTick` (scadenze `config/app.scad`, notifica per persona `scad_<id>_<giorno>_<persona>`, toast una volta al giorno); `promDest`/`promTo` (`config/app.promA`, vuoto = tutti i `gm`); `promPlan` con `subs`, `gest`, `scad`; `deadlineTick` gira per tutti (scadenze) e poi solo per i `gm`; Impostazioni: `qfRow` (QR da cucina), `promRows`, `scSheet`/`scSave`; `inviteCard(fx)` per la cartolina del QR fisso; `phSend` chiama `/richiesta`; `banner`/`updOn` («App da aggiornare» su `controllerchange` e da `netWatch`, che non ricarica più).
  - `worker/src/index.js`: scadenze in `promTick` (`s_<id>` in `fatto`, piano vecchio compatibile), `richiesta()` (telefono `ok:false` con `req` → push ai `gest`, una volta ogni 10 min, chiave `rq_<uid>` in `prom`), `/inviti` `{fisso, vecchio}` (50 anni), `invLeggi` con `inv_err` (20 codici sbagliati/ora per IP → 429).
  - Prove: `tools/test-v35.mjs` (39 verdi); verdi anche `test-v34`, `test-v31`, `test-firebase-push`, `test-inviti`, `test-firebase-telefoni`, `test-firebase-wifi-lento` (aggiornata: niente ricarica, «Aggiorna ora»), `test-giro`, `test-news`, `test-v16`, `test-firebase-flow`, `test-registrazione`, `test-firebase-sync`.
- **Decisioni**:
  - «Telefoni collegati» non serve.
  - «Porta aperta» scartata: solo QR fisso con approvazione.
  - Sicurezza `/invia` e `/promemoria` non fatta perché crea un malus (spiegato in `docs/DA-FARE.md`).
  - Vocale da iPad verso il telefono Android di Mario: funziona.

## Prossimi passi
Vedi `docs/DA-FARE.md`. Prima cosa: chiedere a Mario come sono andate le prove dal vero della v35 e se Maurizio si è registrato.

## Rischi aperti
- Dopo questo aggiornamento chi ha l'app aperta vede «App da aggiornare» solo se il nuovo service worker subentra. Chi ha già la v34 aperta riceve la v35 alla riapertura, come sempre.
- La copia di lavoro all'avvio della sessione può essere in «detached HEAD»: fare `git checkout <ramo>` + `merge --ff-only`, mai forzare.
- `test-firebase-flow` fallisce tra le 23:30 e le 24:00.
