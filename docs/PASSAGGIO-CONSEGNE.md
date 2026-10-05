# Passaggio di consegne (2026-10-05)

Sessione attuale: #09

## Ultimo messaggio di Mario (sessione #08)
«ancora flickerano vestiti di entrambi unghie ecc e seghettato logo ok» → logo OK. Fatto nella #08 (sotto): unghie e sfarfallio. Ancora aperto: «seghettato» (bordo dei vestiti a gradini). Domanda fatta a Mario e senza risposta: si riferisce al vestito nero della ragazza, alla giacca dello chef o a entrambi?

## Fatto in sessione #08 (dopo il logo)
- Unghie scure/trasparenti in certi fotogrammi: le schiariva `mosso()` (unghie chiare e poco colorate = «bianco mescolato»). Ora `mosso()` agisce solo dove nei fotogrammi vicini c'è sfondo (`bianco`, dilatato 6).
- Sfarfallio: lista `fermo` (colore uguale ai vicini, sfocato 4, < 20); nei punti fermi la trasparenza è la mediana su 5 fotogrammi, altrove quella del fotogramma.
- Video rifatti, `test-invio-anim` verde, anteprime su fondo scuro **da mandare a Mario** (rifarle col comando ffmpeg `alphamerge` su fondo `0x1c1c1e`; M9).

## Video dell'invio (#06-#08, riassunto)
- `tools/anim-invio.py` crea `media/invio-chef.mp4` (specchiato, logo e ricamo incollati dritti; logo girato di `-2×inclinazione` del menù, fotogramma per fotogramma) e `media/invio-fornitore.mp4` (invertito nel tempo). Serve `pip install scipy pillow`; calcolo ~1 ora in background.
- Giacca: contorno chiuso (`CHIUDI`) e lisciato (`LISCIO`). Dita veloci: `mosso()`. Unghie e sfarfallio: vedi sopra. Mario: logo OK.
- `index.html`: `ANIM_SRC={chef,forn}`, `sendAnim(k,testo)`; `markSent` mostra `sendAnim('forn',…)`. `sw.js`: `invio-fornitore.mp4` in `FILES`. Prova: `node tools/test-invio-anim.mjs` (serve `python3 -m http.server 8765`).
- Mario nella #07: «non rifare tutto», solo i ritocchi che chiede lui.

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
