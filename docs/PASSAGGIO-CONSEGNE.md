# Passaggio di consegne (2026-10-05)

Sessione attuale: #09

## Ultimo messaggio di Mario (sessione #09)
«le ore complessive non si devono fare i conti ecco ma vedere gli orari si» (D5) e «tutti e 2» (il «seghettato» è sia sul vestito sia sulla giacca).

## Fatto in sessione #09
- D5: in «I miei orari» lo staff vede solo inizio e fine dei turni; tolte le ore di ogni giorno (`or-dm` resta solo per «Finisci dopo mezzanotte»). Voce `NEWS` v36 aggiornata.
- `tools/test-orari.mjs`: nuovo controllo «daily hours hidden»; «staff sees only their own shifts» guarda solo le schede dei giorni (i colleghi in «In turno oggi» sono voluti, v31). Verde.
- `test-v35`: 39 OK, 1 errore «immagine del QR da cucina pronta» presente anche senza le modifiche (download del QR nel container: probabilmente i caratteri di Google bloccati). Non è della v36.
- `test-giro`, `test-news`, `test-invio-anim` verdi.
- Seghettato: `anim-invio.py` con `LISCIO` 14 e `MORBIDO` 3 (bordo della giacca più morbido, `mask()` restituisce anche la zona giacca); vestito nero/capelli: nella fascia del contorno la trasparenza viene dal grigio del filmato (`lum`). `ANIM_OUT` = cartella di prova. Calcolo completo ~15 min. Video rifatti e committati; anteprime su fondo scuro mandate a Mario.

## Video dell'invio (#06-#08, riassunto)
- `tools/anim-invio.py` crea `media/invio-chef.mp4` (specchiato, logo e ricamo incollati dritti; logo girato di `-2×inclinazione` del menù, fotogramma per fotogramma) e `media/invio-fornitore.mp4` (invertito nel tempo). Serve `pip install scipy pillow`; calcolo ~1 ora in background.
- Giacca: contorno chiuso (`CHIUDI`) e lisciato (`LISCIO`). Dita veloci: `mosso()`. Unghie e sfarfallio: vedi sopra. Mario: logo OK.
- `index.html`: `ANIM_SRC={chef,forn}`, `sendAnim(k,testo)`; `markSent` mostra `sendAnim('forn',…)`. `sw.js`: `invio-fornitore.mp4` in `FILES`. Prova: `node tools/test-invio-anim.mjs` (serve `python3 -m http.server 8765`).
- Mario nella #07: «non rifare tutto», solo i ritocchi che chiede lui.

## Fatto in sessione #04
- `docs/DA-FARE.md` riordinato: tabella in cima per urgenza, numeri fissi (M1…, D1…), Maurizio (M1, M2, M3, M6) **in stand-by**: Mario avvisa lui.
- Ora: usare l'ora italiana (`TZ=Europe/Rome date`); il container è in UTC.
- **Decisioni di Mario**:
  - Il contratto (ore dovute, confronto con le ore fatte) lo vedono solo i capi: **Chef, Responsabili e Mario**. Lo staff mai.
  - M7: **nascondere** allo staff il totale delle ore della settimana.

## v36 (sul ramo, NON pubblicata)
- `index.html`: `APP_VER=36`; voce `NEWS` v36; `vMieiOrari` senza il riquadro `or-mtot` (totale settimana); avviso «orari pubblicati» (`orPublish`) senza le ore totali.
- `sw.js`: `CACHE` `jona-ordini-v40`.
- `tools/test-orari.mjs`: il controllo «weekly total shown» ora verifica che il totale sia nascosto.
- Prove: vedi «Fatto in sessione #09».
- D4 ancora aperta:
  - Il contratto oggi è nascosto solo nelle schermate (`isGM`). Mario vuole che lo vedano anche i **Responsabili** (reparto `resp`), che oggi non sono `gm`. Un segreto vero (regola Firestore) non è possibile così: la collezione `staff` è leggibile da tutti i membri e le regole non sanno il ruolo del telefono. Proporre a Mario le strade (brainstorming).

## Prossimi passi
1. Aspettare l'ok di Mario sui video (M9). Se va bene: pubblicare la v36 (PR → squash → controllo online → riallineamento).
2. D4 (contratto ai Responsabili): brainstorming con Mario.
3. Il resto: `docs/DA-FARE.md`.

## Rischi aperti
- Il ramo `ccr-4a01d00e-6ay25e` è nato in questa sessione (la #03 lavorava su `ccr-402d6602-imjwpw`). Il ramo da usare è quello indicato all'avvio della nuova sessione.
- `test-firebase-flow` sistemata, ma la fascia 23:30-24:00 UTC (01:30-02:00 in Italia) non è stata provata dal vero.
