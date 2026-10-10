# Passaggio di consegne (2026-10-10, fine sessione #66)

Sessione attuale: #67

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v71** (main `41cb365`, PR #82). CACHE `jona-ordini-v75`. Nessun codice dell'app cambiato in #66.

## Fatto in #66 (18:54-19:20)
- Avvio: due scorte unite (contenevano solo `docs/ULTIMO-MESSAGGIO.md`), push confermato.
- Detto a Mario che la v71 (logo JONA vettoriale) è online; M33 resta aperto (deve riaprire l'app e guardare il logo).
- **Limite settimanale**: Mario: «forse è del vecchio account». Verificato con `get_session`: nell'account attuale c'è solo `five_hour`, «allowed». Corretto in «Rischi aperti». Niente più commit dopo ogni passo per questo motivo (la scorta automatica resta).
- **Ponte con RVC (D17)**: Mario ha chiesto (parola per parola sotto) un'icona in Jona per mandare all'hotel informazioni dei clienti e necessità del ristorante. La stessa richiesta l'ha fatta anche a RVC #53 (C18 di RVC).
  - Letto il progetto di RVC: repo `RVC-Operation-by-YNOY-CORP/RVC` (privato), ramo `claude/rvc-ramo-definitivo`, file `docs/PONTE-JONA.md`. Aggiunto a questa sessione con `add_repo` (sola lettura), copia in `/home/user/rvc` (sparisce col contenitore). Il nome giusto del repo NON è `Kur0ChanX/RVC` (errore 404).
  - Lì è già deciso: **strada B** = ponte su Cloudflare Worker con chiave segreta, D1, le due app restano separate e offline-first (coda). Scelte di Mario (RVC #30): **P1** camere occupate, ospiti, arrivi, partenze (RVC→Jona); **P3** vassoi da ritirare in camera (RVC→Jona); **P4** guasti del ristorante (Jona→RVC, diventano ticket); **P5** richieste speciali dell'ospite (entrambi i versi); **P7** eventi con orari e persone (Jona→RVC). **P2 addebiti in camera: no per ora.** P6 biancheria: fuori. Allergie/salute fuori (GDPR art. 9). Forma messaggio provvisoria `{id, tipo, da, struttura, camera, quando, chi, dati, stato}`, stati `inviato|ricevuto|fatto|annullato`; indirizzi provvisori `POST /ponte/messaggi`, `GET /ponte/messaggi?dopo=`, `POST /ponte/messaggi/<id>/stato`, chiave in `Authorization`. La chiave mai nel codice (Jona è pubblico). RVC non è ancora in uso in hotel (Tappa 2 in costruzione, il suo Worker serve D5 Cloudflare): il ponte si può costruire e provare con dati finti, ma funziona davvero solo quando RVC è in uso.
  - Proposte a Mario 3 strade per l'icona 🏨 «Hotel» in alto in Jona, immagine `docs/img/ponte/d17-tre-strade.png` (sorgente HTML nella cartella temporanea, persa: rifarla se serve, stile Jona: colori `--lagoon #1F7F86`, `--corallo #AE4E37`, `--ocra #94661C`, `--mirto #3B7A57`, `--solid #3A2F2C`, font Jost):
    1. **Ovvia**: pulsanti grandi «Manda all'hotel» (🔧 Guasto, 🛎 Richiesta ospite, 📅 Evento, 📦 Serve a noi) che aprono un modulo breve (dove, cosa, foto, urgente); sotto «Dall'hotel» elenchi per tipo.
    2. **Furba**: chat «Hotel» con etichette (Vassoio, Guasto, Richiesta, Evento, Serve a noi), numero camera, foto, stati ✓ arrivato / ✓✓ visto da reparto. Riusa la chat di Jona.
    3. **Geniale**: in cima «Oggi in hotel» (camere, ospiti, partenze, arrivi); ospiti → colazioni attese nell'ordine suggerito (`sugStats`); eventi dell'agenda mandati da soli all'hotel (Porter, Housekeeping); vassoio in camera → compito «Ritira» nella home dello staff.
  - **Risposta di Mario: gli piace la 3 («che vedono anche le camere ecc») e chiede di unire le 3 idee in modo ordinato.** Risposta data in breve: sì.
  - Avvisata RVC #54 (`session_01EFMQTbkHtDuvmV2vH9Y97i`) con send_message: le 3 strade, etichette comuni, aspetto la scelta di Mario, poi mando i campi di Jona; niente codice senza il via di Mario.
- `docs/DA-FARE.md` D17 aggiornato.

## Prossimo lavoro (in quest'ordine)
### 1. Ponte: immagine della versione UNITA (subito, primo messaggio a Mario)
Proposta ordinata da disegnare (una pagina «Hotel» dall'icona 🏨, dall'alto in basso):
- **In cima (Geniale)**: «Oggi in hotel» = camere occupate, ospiti, arrivi, partenze (P1). Chi lo vede: da decidere (proposta: tutti; numeri senza nomi degli ospiti).
- **Sotto (Ovvia)**: 4 pulsanti grandi «Manda all'hotel»: 🔧 Guasto (P4), 🛎 Richiesta ospite (P5), 📅 Evento (P7), 📦 Serve a noi (necessità del ristorante). Ognuno apre un modulo corto con camera/dove, testo, foto.
- **Sotto (Furba)**: il filo dei messaggi con l'hotel come una chat, con etichette colorate e stati (✓ arrivato, ✓✓ visto, ✔ fatto). Qui arrivano anche Vassoio (P3) e Richieste dall'hotel. Si può rispondere.
- **Da soli (Geniale)**: ospiti → colazioni/coperti attesi nell'ordine suggerito; eventi dell'agenda → proposta «Manda all'hotel?» (meglio chiedere che mandare da soli: scelta da far fare a Mario); vassoio → compito «Ritira» nella home dello staff.
Fare UNA immagine (stile della prima, telefono 390 px, 1-2 schermate) e chiedere conferma (E19: per il gusto prima l'immagine, poi si costruisce). Poi una domanda per volta (es. chi vede «Oggi in hotel»; eventi in automatico o con conferma). Dopo la conferma: mandare a RVC (send_message alla sessione RVC attiva) i campi di Jona e copiare `docs/PONTE-JONA.md` in Jona.
Tecnica da decidere io (non chiedere a Mario): dove vive il ponte. Idea: dentro il Worker di Jona già online (`worker/`, D1 già pronto) con indirizzi `/ponte/...` e chiave segreta per RVC, così funziona prima che RVC abbia il suo Worker; da confrontare con un Worker «ponte» a sé. Niente codice del ponte senza il via di Mario (regola di RVC: Tappa 2).

### 2. v72 (D29 strada 2 «Furba», Claude da solo; promesso a Mario «parto appena mi rispondi»)
Cosa c'è già (non rifare): `viewport-fit=cover`, `safe-area-inset-top/bottom`, `apple-touch-icon`, `apple-mobile-web-app-capable`/`-title`, `theme-color` dinamico, media query per computer (700/760/900/980/1260 px), controllo `PushManager`, manifest fullscreen.
1. **Zoom dei campi su iPhone**: Safari ingrandisce se un campo ha testo <16 px (visto `select.v-alt` 15px). Misurare con Playwright ogni `input/select/textarea` visibile nelle schede (riusare il giro di `test-giro`), portarli a 16px solo dove serve, controllare l'aspetto con `test-giro`.
2. **Barra in alto su iPhone installata**: manca `apple-mobile-web-app-status-bar-style`. Con `black-translucent` l'ora è bianca: controllare prima che la zona in alto (`body::before`, v54) sia scura in tema chiaro e scuro; se dubbio lasciare e annotare.
3. **Prove con Safari e computer su GitHub**: variabili in `test-giro.mjs` (es. `GIRO_BROWSER=webkit`, `GIRO_W=1280,1440`); in `.github/workflows/prove.yml` installare WebKit (`/opt/pw-npm/node_modules/.bin/playwright install --with-deps webkit` o il percorso giusto su GitHub) e far girare il giro con WebKit 390 e Chromium 1280/1440 dentro `tools/prova-ci.sh`. In locale WebKit non c'è e NON si scarica.
4. NEWS v72, `APP_VER` 72, `CACHE` `jona-ordini-v76`, riga v72 in CLAUDE.md, prova nuova (testo dei campi ≥16 px).
5. Pubblicare da solo se le prove sono verdi, poi `git fetch origin main && git merge origin/main` sul ramo definitivo + push. Avvisare Mario.

## Ancora aperto per Mario
- D17 ponte: conferma dell'immagine unita (prossima sessione).
- M33: guardare il logo JONA nuovo all'apertura (riaprire l'app).
- M31: scelta della miglioria del logo YNOY (Ovvia/Furba/Geniale/Nessuna): nessuna risposta.
- Provare v69 (riga verde «costa … in meno» → **Passa**) e v70 (apertura con YNOY nuovo).
- Elenco completo: `docs/DA-FARE.md`.

## Note tecniche
- In locale: emulatore Firebase `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`, server `python3 -m http.server 8765`. Playwright globale `/opt/node22/lib/node_modules/playwright`.
- Per guardare l'apertura ferma a un istante: copia di `tools/video-apertura.mjs` (serve `webdriver` falso, profilo entrato, `getAnimations()` fermate a `currentTime`).
- Seguire le prove su GitHub: ciclo in background con `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/actions/runs?head_sha=<sha>` finché `completed` (repo pubblico).
- Controllo online: `curl -sSL "https://jona-ristorante-by-ynoy-corp.pages.dev/?x=…" | grep APP_VER`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.

## Rischi aperti
- Limite settimanale: era dell'account vecchio (Mario, #66). Nell'account attuale solo `five_hour`, «allowed» (10/10 19:13).
- Logo JONA: le «R», «S», «O» piccole di RISTORANTE ricostruite da pochi pixel; se Mario vede un difetto, segnare la zona sul suo screenshot (E16) e correggere `tools/logo-jona.py`.
- Android: maschera SVG intorno a YNOY (D14) e logo JONA SVG mai provati da Mario su Android.
- Ponte: due sessioni (Jona e RVC) lavorano sulla stessa cosa: tenersi allineati con send_message e non dare a Mario due proposte diverse.

## Ultimo messaggio di Mario, parola per parola
«Mi piace la 3 che vedono anche le camere ecc ecc ma si possono unire le 3 idee in modo ordinato ?»

Messaggi prima in #66: «limite settinanale forse è del vecchio account / poi / Ti ricordi di creare un ponte con l'app RVC magari mettiamo un icona per condividere alcuni informazioni o mandare informazioni dei clienti al All'hotel o necessità del Ristorante Jona all hotel»
