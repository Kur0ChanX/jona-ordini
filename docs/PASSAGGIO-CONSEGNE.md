# Passaggio di consegne (2026-10-09, fine sessione #45)

Sessione attuale: #46

## Ultimo messaggio di Mario (#45), parola per parola
«si»
(risposta a «Ti va bene l'uscita C? Con il sì aggiorno le prove e le Novità, e se passano pubblico la v62»)

Messaggi prima (#45), parola per parola, in ordine:
- «si» (parti con la variante B del colpo)
- «si» (variante B nel codice vero: va bene)
- «C» (uscita di YNOY: prima sfuma JONA, poi la firma)
- «si» (uscita C va bene → prove e pubblicazione)

## Stato
- Online: **v61**. **PR #72** aperta da `claude/v62-logo` verso `main`: https://github.com/Kur0ChanX/jona-ordini/pull/72 (ultimo commit `a43c650`). Al momento dell'handoff il controllo «Prove automatiche» (`prove`) era in corso.
- `APP_VER=62`, `sw.js` CACHE `jona-ordini-v66`, NEWS v62 riscritta.
- Prove locali con `TZ=Europe/Rome` tutte riuscite: test-apertura-v62, test-logo, test-barra, test-news, test-giro.
- `main` era già tutto dentro il ramo v62 (nessun conflitto).

## Fatto in #45 (ramo `claude/v62-logo`)
- **Colpo di JONA, variante B** (commit `c7b5138`): tolti `.jfl`/`jFlash` e i 12 `.jd`/`jDust`; messi 34 `<b class="jpb" style="--x;--y;--s;--o;--t;--d;margin-left">` con valori fissi nell'HTML (stessa formula `sin(i*k)` di `tools/colpo-varianti.mjs`), CSS `.splash .jpb{left:50%;bottom:-6%;…#EDE6DF}`, `.intro .splash .jpb{animation:jPb var(--t) var(--d) …}`, keyframe `jPb`. Onde `.jrg` e ombra invariate. Anteprime: `docs/img/v62-colpo-b.mp4`, `v62-colpo-b-fotogrammi.png`.
- **Uscita C** (commit `df03c42`), scelta da Mario tra A (tutto insieme), B (cancellata al contrario), C (JONA prima, poi firma); bozze ferme in `docs/img/v62-uscita-scelta.png` (ramo consegne), script `tools/uscite-ynoy.mjs` (ramo consegne). Codice: `.jhit` e `.wall-sub` `jAway .35s 3.25s`; `.wall-by>span` e `.yn` `yAway .3s 3.48s ease-in-out` (keyframe `yAway{to{opacity:0;transform:scale(1.03)}}`). Durata totale invariata (`S.splash` 3,8 s, `.intro` tolta a 4,1 s). Anteprima: `docs/img/v62-uscita-c.mp4`, `v62-uscita-c-fotogrammi.png`.
- Commento CSS in cima al blocco v62 aggiornato (niente più «vola verso chi guarda»).
- **NEWS v62** riscritta (commit `a43c650`): per tutti «il logo Jona cade… poi la firma YNOY si scrive come a mano, resta un attimo da sola e l'app parte»; parte dev con granelli, tratti SVG, uscita C.
- **`tools/test-apertura-v62.mjs`** riscritta: controlla 19 tratti, 34 granelli, niente `.jfl`/`.jd`; prima del colpo niente onde/granelli e YNOY non scritto; a 2,4 s primo tratto fatto e ultimo no; a 3 s tutto visibile e `.y0`=1; a 3,61 s JONA sfumata e firma >0,5 (sta già sfumando: è voluto); a 3,79 s firma sfumata. La soglia 0,8 iniziale era sbagliata (la firma parte a 3,48 s), corretta a 0,5.

## Prossimo lavoro (#46)
1. Iscriversi alla PR #72 (`subscribe_pr_activity`) e controllare «Prove automatiche». Se verde: squash merge da Claude, controllo online (https://jona-ristorante-by-ynoy-corp.pages.dev/ con versione 62), poi SUBITO `git fetch origin main && git merge origin/main` sul ramo consegne e push. Se rosso: capire la causa e correggere sul ramo `claude/v62-logo` (E14, E18).
2. Dopo la pubblicazione: la v62 non tocca il Worker → niente giro completo extra su GitHub; chiedere a Mario «giro completo sul computer: ora o dopo?» solo se serve (piccola modifica di aspetto: bastano le prove legate).
3. Chiedere a Mario di provarla su Android: righe o riquadri strani intorno a YNOY (maschera SVG, nota v53).
4. Poi le domande ancora aperte (sotto) e `docs/DA-FARE.md`.

## Strumenti (ramo consegne)
- Lavorare sul ramo v62 in una cartella a parte: `git worktree add ../v62 claude/v62-logo` (fatto in #45 in `/home/user/v62`, sparisce col contenitore).
- Server: `python3 -m http.server 8765` dentro la cartella del ramo da provare (si spegne a ogni riavvio).
- `tools/video-apertura.mjs <cartella>` (lanciare da `tools/`), `tools/colpo-varianti.mjs`, `tools/uscite-ynoy.mjs <cartella>` (bozze ferme A/B/C a 4 momenti).
- Foglio di fotogrammi con ffmpeg: `select='not(mod(n\,3))',crop=…,scale=390:-1,tile=3x4` con `-frames:v 1`.

## Ancora da chiedere
- Esito di M25 (prova dell'agenda con Mauro): senza risposta.
- D10 (riquadro «Inviato allo chef»: solo «Continua»): senza risposta.
- Il resto in `docs/DA-FARE.md`.

## Rischi aperti
- Server locale ed emulatore si spengono a ogni riavvio del contenitore.
- Maschera SVG su Android non ancora verificata su un telefono vero.
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #46 · Jona Ordini · da v61 · 09/10/2026 · prossimo: unire PR #72 (v62)`.
