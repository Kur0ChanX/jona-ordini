# Passaggio di consegne (2026-10-05)

Sessione attuale: #05

## Ultimo messaggio di Mario
«quindi nel link c'è ancora Kur0ChanX o nok c'è piú nel QRcode non ho capito bene cosa ho cambiato?»

Risposta già data dalla sessione #04: non ha cambiato niente. Il link dell'app contiene ancora kur0chanx (GitHub Pages). Toglierlo è la voce D1 (Cloudflare Pages) di `docs/DA-FARE.md`. Il QR porta a `invito.mario-miscera.workers.dev`, poi all'app con kur0chanx.

Ultimo messaggio di Mario in sessione #05 (video caricato in chat): «Nel video togli lo sfondo ma lascia la divisa bianca dello chef a sinistra […] togli tutto il bianco e lo sfondo ma lascia il vestito della ragazza […] togli lo sfondo bianco tra le braccia della ragazza a destra».
→ **Fatto in #05**: `media/invio-chef.mp4` rifatto con `tools/anim-invio.py` nuovo (niente IA: le IA vedevano solo il menù). Sfondo = bianco bruciato (min canali ≥ 250); zone bianche chiuse tolte, tranne i riflessi sulla giacca (anello ≥ 70% stoffa); via l'alone chiaro sottile; sfumatura ai lati ridotta (4%/3%) per far vedere divisa e vestito. Prova `test-invio-anim` aggiornata (sfondo trasparente > 30%) e verde. Il filmato originale NON è nel repo (era in `/root/.claude/uploads/`, si perde con la sessione). Mario deve approvare l'anteprima (M9).

## Fatto in sessione #04
- `tools/test-firebase-flow.mjs`: l'ora limite di prova si ferma alle 23:59 (prima sbagliava tra 23:30 e 24:00 UTC). Verde.
- `docs/DA-FARE.md` riordinato: tabella in cima per urgenza, numeri fissi (M1…, D1…), Maurizio (M1, M2, M3, M6) **in stand-by**: Mario avvisa lui.
- `CLAUDE.md`, sezione COMUNICAZIONE: risposte a blocchi fissi (✅ FATTO, 👉 DA FARE TU, ❓ DOMANDE, ⚠️ ATTENZIONE, separatori `───`), frasi corte. Termine tecnico + spiegazione tra parentesi. Blocco 📚 IMPARI solo a volte (1 risposta su 3-4), max 3 righe, solo programmazione (Mario conosce bene hardware e informatica generale). Termini già spiegati: commit, push, variabile, dato/schermata, regola di accesso.
- Ora: usare l'ora italiana (`TZ=Europe/Rome date`); il container è in UTC.
- **Decisioni di Mario**:
  - Il contratto (ore dovute, confronto con le ore fatte) lo vedono solo i capi: **Chef, Responsabili e Mario**. Lo staff mai.
  - M7: **nascondere** allo staff il totale delle ore della settimana.

## Lavoro in corso: v36 (commit sul ramo, NON pubblicata)
- `index.html`: `APP_VER=36`; voce `NEWS` v36; `vMieiOrari` senza il riquadro `or-mtot` (totale settimana); avviso «orari pubblicati» (`orPublish`) senza le ore totali.
- `sw.js`: `CACHE` `jona-ordini-v40`.
- `tools/test-orari.mjs`: il controllo «weekly total shown» ora verifica che il totale sia nascosto.
- Prove: verdi `test-giro`, `test-v16`, `test-news`. **Da sistemare prima di pubblicare**:
  - `test-orari`: FAIL «staff sees only their own shifts» (verificare se dipende dalla modifica o era già così);
  - `test-v35`: TimeoutError alla riga 89 (`formset` dev) con l'emulatore appena riavviato. Rilanciarla dopo aver svuotato l'emulatore.
- Ancora da decidere/fare per la v36:
  - Le ore di ogni giorno («X di lavoro» sotto ogni turno) restano visibili allo staff. Chiedere a Mario se nascondere anche quelle (sommandole si ricava il totale).
  - Il contratto oggi è nascosto solo nelle schermate (`isGM`). Mario vuole che lo vedano anche i **Responsabili** (reparto `resp`), che oggi non sono `gm`. Un segreto vero (regola Firestore) non è possibile così: la collezione `staff` è leggibile da tutti i membri e le regole non sanno il ruolo del telefono. Proporre a Mario le strade (brainstorming).

## Prossimi passi
1. Finire la v36 (prove sopra), chiedere le due scelte, pubblicare (PR → squash → controllo online → riallineamento).
2. Video dell'invio (vedi sopra).
3. Il resto: `docs/DA-FARE.md`.

## Rischi aperti
- Il ramo `ccr-4a01d00e-6ay25e` è nato in questa sessione (la #03 lavorava su `ccr-402d6602-imjwpw`). Il ramo da usare è quello indicato all'avvio della nuova sessione.
- `test-firebase-flow` sistemata, ma la fascia 23:30-24:00 UTC (01:30-02:00 in Italia) non è stata provata dal vero.
