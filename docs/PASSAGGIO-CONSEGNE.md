# Passaggio di consegne (2026-10-05)

Sessione attuale: #09

## Ultimo messaggio di Mario (sessione #08)
«ancora flickerano vestiti di entrambi unghie ecc e seghettato logo ok» → logo OK. Fatto nella #08 (sotto): unghie e sfarfallio. Ancora aperto: «seghettato» (bordo dei vestiti a gradini). Domanda fatta a Mario e senza risposta: si riferisce al vestito nero della ragazza, alla giacca dello chef o a entrambi?

## Fatto in sessione #08 (dopo il logo)
- Unghie scure/trasparenti in certi fotogrammi: le schiariva `mosso()` (unghie chiare e poco colorate = «bianco mescolato»). Ora `mosso()` agisce solo dove nei fotogrammi vicini c'è sfondo (`bianco`, dilatato 6).
- Sfarfallio: lista `fermo` (colore uguale ai vicini, sfocato 4, < 20); nei punti fermi la trasparenza è la mediana su 5 fotogrammi, altrove quella del fotogramma.
- Video rifatti, `test-invio-anim` verde, anteprime su fondo scuro **da mandare a Mario** (rifarle col comando ffmpeg `alphamerge` su fondo `0x1c1c1e`; M9).

## Messaggio precedente di Mario (sessione #07)
«guarda questo fotogramma puoi migliorare il video nelle mani della ragazza la parte bianca tra le dita» (foto: video al fornitore, mani della ragazza che entrano veloci, chiazze bianche tra le dita).

Messaggio successivo di Mario (arrivato nella #07 dopo l'apertura della #08): «il logo sembra storto nel menù mettilo sempre in griglia in base alla posizione del menu frame by frame» → nella versione allo chef (specchiata) il riquadro del logo incollato (`riquadri()`/`stabili()` in `tools/anim-invio.py`) è inclinato al contrario del menù. Da fare: per ogni fotogramma trovare i 4 angoli/l'inclinazione del menù e incollare il logo raddrizzato (rotazione/prospettiva) allineato ai bordi del menù specchiato. Rifare i video una sola volta (dita + logo).

## Fatto in sessione #08
- Mario: «vai con il logo». `tools/anim-invio.py`: `inclinazione()` misura l'angolo del menù dal logo (righe di testo più nette, a metà risoluzione, passi 0,5° poi 0,1°), `liscia()` (mediana 5 + gaussiana 1,5); nel video allo chef il riquadro del logo prende i punti dell'originale girati di `-2×angolo` (`map_coordinates`): stessa inclinazione del menù specchiato (provato: −2,7° contro −3,0°, −5,0° contro −4,9°).
- Video rifatti (dita + logo), `test-invio-anim` verde (18 PASS), anteprima su fondo scuro mandata a Mario (M9).

## Fatto in sessione #07 (ritocco chiesto da Mario)
- Causa: con le mani veloci il filmato sfoca le dita sul fondo bianco; quei punti (misto pelle+bianco, minimo canali 170-249, poco colore) restavano pieni.
- `tools/anim-invio.py`: nuova `mosso(rgb, vicini)`. Solo dove c'è movimento forte (differenza coi fotogrammi vicini, sfocata 6, > 90) e fuori da giacca (stoffa grande > 8000 punti, entro 45) e logo del menù (buchi nel marrone `mx<170`, `R-B<40`, > 30000 punti): trasparenza = quanta pelle c'è (`(SOGLIA+2-mn)/(SOGLIA+2-pelle vicina)`×1,15) e colore "smescolato" dal bianco. Fotogrammi fermi, unghie, logo e giacca: invariati (provato su fotogrammi 3, 55, 70, 79, 80).
- Commit pushato (`Animazione invio: dita in movimento…`). **I video in `media/` NON sono ancora rifatti**: il calcolo (molto lento, ~1 min a fotogramma, 101 fotogrammi) è stato fermato per l'handoff.
- Nota della #06 «non rifare i video»: vale per il lavoro già fatto; questo è un ritocco chiesto da Mario dopo.

## Messaggio di Mario (sessione #06)
Giacca dello chef con bordi lisci e due video (allo chef con la ragazza a sinistra, logo dritto; al fornitore con lo chef a sinistra).

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
- `docs/DA-FARE.md` riordinato: tabella in cima per urgenza, numeri fissi (M1…, D1…), Maurizio (M1, M2, M3, M6) **in stand-by**: Mario avvisa lui.
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
1. Mandare a Mario le anteprime dei video rifatti nella #08 e chiedere del «seghettato». Se serve: contorno morbido (trasparenza graduata dal bianco) sul bordo di vestito/giacca, poi rifare i video: `pip install scipy pillow` poi in background `python3 tools/anim-invio.py tools/originale-invio.mp4` (1-2 ore). Controllare i fotogrammi 18-26 del video al fornitore su sfondo scuro, `node tools/test-invio-anim.mjs`, commit dei due mp4, mandare l'anteprima a Mario (M9).
2. Finire la v36 (prove `test-orari`, `test-v35` sotto), chiedere D4 e D5, pubblicare (PR → squash → controllo online → riallineamento).
3. Il resto: `docs/DA-FARE.md`.

## Rischi aperti
- Il ramo `ccr-4a01d00e-6ay25e` è nato in questa sessione (la #03 lavorava su `ccr-402d6602-imjwpw`). Il ramo da usare è quello indicato all'avvio della nuova sessione.
- `test-firebase-flow` sistemata, ma la fascia 23:30-24:00 UTC (01:30-02:00 in Italia) non è stata provata dal vero.
