# Passaggio di consegne (2026-10-05)

Sessione attuale: #06

## Ultimo messaggio di Mario (fine sessione #05)
«va quasi bene a parte la giacca dello chef che è fatta maluccio non è scontornata bene»

→ **Prossimo lavoro (subito)**: rifinire lo scontorno della **giacca bianca dello chef** in `media/invio-chef.mp4`. Il resto (sfondo tolto, bianco tra le braccia tolto, vestito nero della ragazza pieno, menù, mani) a Mario va bene: non peggiorarlo.
- Filmato originale salvato in `tools/originale-invio.mp4` (1920×1080, 60 fps, 5 s; si usano i primi 4,2 s). Rifare con `python3 tools/anim-invio.py tools/originale-invio.mp4` (serve `pip install scipy`; esce già invertito nel tempo).
- Metodo attuale (`tools/anim-invio.py`, niente IA: isnet/u2net vedevano solo il menù, birefnet va fuori memoria): sfondo = min canali ≥ 250; l'alone quasi bianco sottile si toglie con un'apertura disk(5); chiusura disk(4); zone bianche chiuse tolte salvo riflessi sulla giacca (anello ≥ 70% «stoffa»); maschera rigida, erosione disk(2), sfocatura 1,6; sfumatura ai bordi 4/3/4/5 %.
- Probabili difetti della giacca: bordo rigido e seghettato (la giacca sfuma nel bianco: la soglia fissa taglia a gradini), pezzi di bordo luminoso persi, erosione che mangia le pieghe. Idee: trasparenza morbida solo sul bordo della giacca (proporzionale a 255 − minimo dei canali), meno erosione sulla giacca, maschera stabilizzata nel tempo solo dove non c'è movimento. Controllare ingrandito (bordo sinistro/destro della giacca, spalla, maniche, polsini) su fondo scuro e chiaro; mandare a Mario un'anteprima (sopra scuro, sotto chiaro, come in #05).
- Dopo: `node tools/test-invio-anim.mjs` (server `python3 -m http.server 8765`), commit, e M9 di `docs/DA-FARE.md`.

## Fatto in sessione #05
- Animazione rifatta (commit `v36: animazione dell'invio rifatta…`): NEWS v36 aggiornata (tutti + dev), `CLAUDE.md` (riga di `media/invio-chef.mp4`), `tools/test-invio-anim.mjs` (sfondo trasparente > 30%, ora c'è la divisa), `docs/DA-FARE.md` (tolto C2, aggiunto M9). Prove verdi: `test-invio-anim`, `test-news`.
- Domanda ancora aperta a Mario: D5 (nascondere allo staff anche le ore di ogni giorno?).

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
