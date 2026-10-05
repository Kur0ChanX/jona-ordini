# Passaggio di consegne (2026-10-05)

Sessione attuale: #08

## Ultimo messaggio di Mario (sessione #07)
«guarda questo fotogramma puoi migliorare il video nelle mani della ragazza la parte bianca tra le dita» (foto: video al fornitore, mani della ragazza che entrano veloci, chiazze bianche tra le dita).

## Fatto in sessione #07 (ritocco chiesto da Mario)
- Causa: con le mani veloci il filmato sfoca le dita sul fondo bianco; quei punti (misto pelle+bianco, minimo canali 170-249, poco colore) restavano pieni.
- `tools/anim-invio.py`: nuova `mosso(rgb, vicini)`. Solo dove c'è movimento forte (differenza coi fotogrammi vicini, sfocata 6, > 90) e fuori da giacca (stoffa grande > 8000 punti, entro 45) e logo del menù (buchi nel marrone `mx<170`, `R-B<40`, > 30000 punti): trasparenza = quanta pelle c'è (`(SOGLIA+2-mn)/(SOGLIA+2-pelle vicina)`×1,15) e colore "smescolato" dal bianco. Fotogrammi fermi, unghie, logo e giacca: invariati (provato su fotogrammi 3, 55, 70, 79, 80).
- Commit pushato (`Animazione invio: dita in movimento…`). **I video in `media/` NON sono ancora rifatti**: il calcolo (molto lento, ~1 min a fotogramma, 101 fotogrammi) è stato fermato per l'handoff.
- Nota della #06 «non rifare i video»: vale per il lavoro già fatto; questo è un ritocco chiesto da Mario dopo.

## Messaggio di Mario (sessione #06)
«Sistema la giacca dello chef nell'animazione: bordi della giacca seghettati. E fai 2 file: uno così fatto bene e uno che la ragazza a sinistra consegna il menù allo chef a destra, stando attento a non specchiare l'immagine se no il logo viene al contrario (ti giro il logo se ti serve). Quello senza sfondo fatto bene con la ragazza a sinistra mettilo nel programma quando lo staff invia l'ordine; quello con lo chef a sinistra con sfondo scontornato bene quando lo invia al fornitore.» (Allegato: logo JONA; non è servito.)

Messaggio successivo di Mario (dopo l'apertura della #07): «hai già fatto quasi il lavoro completo nella chat precedente non rifare tutto» → nella #07 **non rifare** i video né lo script: sono finiti e nel ramo. Solo ritocchi se Mario li chiede.

→ **Fatto e committato, NON pubblicato**. Mario deve guardare l'anteprima mandata in chat #06 e dire se va bene (M9). Se va bene: chiudere la v36 (vedi sotto) e pubblicare.

## Fatto in sessione #06
- `tools/anim-invio.py`: ora crea DUE video da `tools/originale-invio.mp4` (~25 min di calcolo, serve `pip install scipy pillow`):
  - `media/invio-chef.mp4`: specchiato e avanti nel tempo, la ragazza a sinistra porge il menù allo chef. Logo/«PORTO CERVO» del menù e ricamo della giacca rimessi dritti: `riquadri()` trova i riquadri nel fotogramma originale, `stabili()` li stabilizza (mediana su 5), poi si incolla il riquadro originale nel punto specchiato con bordo sfumato 10 punti. Leggermente inclinato al contrario del menù (pochi gradi): accettabile.
  - `media/invio-fornitore.mp4`: invertito nel tempo, lo chef a sinistra porge il menù (come la vecchia).
  - Giacca: entro 30 punti dalla stoffa il contorno si chiude (`CHIUDI`=14, fessure strette = pieghe bruciate) e si liscia (`LISCIO`=8, sfocatura e soglia a metà); poi buchi chiusi riempiti se attorno è stoffa (≥70%, o ≥50% se < 8000 punti). Mani, menù, vestito: contorno di prima.
- `index.html`: `ANIM_SRC={chef,forn}`, `animUrl` per tipo, `animPrefetch(k)`, `sendAnim(k,testo)`; `markSent` precarica `forn` prima di `ask` e dopo «Sì, inviato» mostra `sendAnim('forn','Inviato a <fornitore>')`, poi il solito avviso. NEWS v36 aggiornata (tutti, chef, dev).
- `sw.js`: aggiunto `./media/invio-fornitore.mp4` in `FILES` (CACHE resta `jona-ordini-v40`, la v36 non è ancora uscita).
- `tools/test-invio-anim.mjs`: converte entrambi i video in WebM e prova anche `sendAnim('forn',…)`. Verde (18 PASS). `test-news` verde.
- `CLAUDE.md` (riga media) e `docs/DA-FARE.md` (M9) aggiornati.
- Nota: la prova `formset` in timeout di #05 (test-v35) poteva essere un errore di sintassi in pagina: ricontrollare.

## Sessione #05
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
1. Rifare i video: `pip install scipy pillow` poi in background `python3 tools/anim-invio.py tools/originale-invio.mp4` (1-2 ore). Controllare i fotogrammi 18-26 del video al fornitore su sfondo scuro, `node tools/test-invio-anim.mjs`, commit dei due mp4, mandare l'anteprima a Mario (M9).
2. Finire la v36 (prove `test-orari`, `test-v35` sotto), chiedere D4 e D5, pubblicare (PR → squash → controllo online → riallineamento).
3. Il resto: `docs/DA-FARE.md`.

## Rischi aperti
- Il ramo `ccr-4a01d00e-6ay25e` è nato in questa sessione (la #03 lavorava su `ccr-402d6602-imjwpw`). Il ramo da usare è quello indicato all'avvio della nuova sessione.
- `test-firebase-flow` sistemata, ma la fascia 23:30-24:00 UTC (01:30-02:00 in Italia) non è stata provata dal vero.
