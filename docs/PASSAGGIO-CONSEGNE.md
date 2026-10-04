# Passaggio di consegne (2026-10-04, pomeriggio)

## Stato attuale
- **Online: v29** (`APP_VER=29`, `CACHE=jona-ordini-v33`), PR #37 (v27+v28) e #38 (v29) unite, ramo riallineato.
- **Sul ramo, NON pubblicata: v30** (`APP_VER=30`, `CACHE=jona-ordini-v34`), commit «v30 in corso»:
  - **Pallino sull'icona** (fatto, `test-v30` verde per questa parte): `badgeCount` (chat non lette + avvisi non letti + badge delle schede, senza `carrello` e `invii`) + coda push, `appBadge()` in `render`, `obxBadge` → `appBadge`; numero nella cache `jona-badge` (`./badge-n`); `sw.js`: `badgeGet`/`badgeSet`/`badgeBump` (+1 a ogni push con app non in vista), `obxFlush` cala il numero, cache `jona-badge` non cancellata. Limiti detti a Mario: iPhone solo app su Home + notifiche permesse; Android dipende dal launcher, di solito solo con notifiche.
  - **Forma d'onda vocali** (scritta, da finire di provare): `WF_N=40`, `wfStart`/`wfStop` (AnalyserNode sul microfono ogni 100 ms, `R.lv`), `wfCode` (40 cifre 0–9, campo `wf` del messaggio, 0 = silenzio), `wfBars`, barre dal vivo `#ch-rw` durante la registrazione, `.cht-wf` al posto di `.cht-bar`, `chAuPaint` colora le barre ascoltate, `chSeek` (tocco sulle barre). `test-v28` adattato e verde.
  - **Prova rossa**: in `test-v30` il microfono finto di Chromium (`--use-fake-device-for-media-stream`) dà livelli 0 → «live bars move» e «message gets wf» falliscono. Capire se il finto è muto con i vincoli `echoCancellation/noiseSuppression` o con `AudioContext` (sonda in scratchpad scritta male, rifarla). Se è solo il finto: in prova iniettare un flusso con `OscillatorNode` → `createMediaStreamDestination` al posto di `getUserMedia`.
- `CLAUDE.md`: nuova regola handoff (nuova sessione solo dopo push confermato; la nuova sessione fa `git fetch` + `merge --ff-only` prima di leggere).

## Richieste di Mario da fare (in ordine)
1. **Invito rifatto («fa schifo così»)**. Gli screenshot mostrano che sul suo telefono girava ancora il testo vecchio (app non aggiornata: chiudere e riaprire). L'anteprima WhatsApp con `media/invito.jpg` funziona. Vuole **nascondere «Kur0ChanX» o non avere proprio il link**. Proporre (BRAINSTORMING, 2-3 strade):
   - a) **dominio proprio** (es. `jona.team` o `jonaristorante.app`, ~10–15 €/anno) su Cloudflare: il Worker fa da redirect `https://<dominio>/entra/<codice>` → app; l'app resta su github.io (nessun dato perso).
   - b) **organizzazione GitHub gratuita** (es. `jona-ristorante`) e repository spostato lì → `jona-ristorante.github.io/jona-ordini`: gratis, ma cambia l'origine → i telefoni installati perdono login/dati locali e vanno ricollegati.
   - c) **codice d'invito senza link**: cartolina/QR + codice corto di 6 lettere da scrivere nell'app (`/invito/<codice>` nel Worker che restituisce la chiave solo una volta e scade), ma serve comunque aprire l'app una volta.
   - Rifare anche la grafica dell'invito (testo + cartolina `inviteCard`) in modo più curato; chiedere a Mario cosa non gli piace.
2. **Finire v30** (prova forma d'onda), poi pubblicare (PR → squash → controllo online → `git fetch origin main && git merge origin/main` → push).
3. Maurizio Lai: deve registrarsi dal link d'invito, poi Mario approva e mette amministratore (istruzioni date).
4. «Chi c'è in turno oggi» (Orari dello staff e Staff → Orari, da `tp`).
5. Promemoria ordini (schema prima, se dubbi).
6. «Consumi e costi» più interattivo (skill `dataviz` prima).
7. Mauro Loi in «F&B Manager»: da confermare.
8. Da provare dal vero: vocale Android → iPhone, gesto indietro Android, pallino.

## Memoria per tutte le chat
Mario vuole la regola dell'handoff (sessione nuova solo dopo il push confermato, fetch all'avvio) in tutte le chat: il contenitore cloud non conserva file utente, quindi dargli il testo da incollare in claude.ai → Impostazioni → Profilo → preferenze personali (dove c'è già la regola dei titoli). Non ancora fatto.

## Prove
`tools/README.md`. Server `python3 -m http.server 8765`. Nuove: `test-v29` (8, invito), `test-v30` (pallino verde, onda rossa come sopra). Verdi: `test-v28`, `test-v27`, `test-news`, `test-staff`, `test-v26`.

## Rischi aperti
- `/invia` del Worker non controlla chi chiama; tutti i telefoni approvati leggono tutti i messaggi e allegati.
- Il link d'invito contiene la chiave del ristorante (`#k=`): chi lo ha entra (resta l'approvazione del telefono).
- `test-firebase-sync` già rotto da prima; `test-firebase-flow` fallisce 23:30–24:00.
