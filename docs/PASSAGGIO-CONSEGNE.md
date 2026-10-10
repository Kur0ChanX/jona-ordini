# Passaggio di consegne (2026-10-10, fine sessione #61)

Sessione attuale: #62

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (ramo unico e permanente da #61, nome in `.claude/ramo-di-lavoro.txt`; l'hook di avvio ci passa da solo). App online: **v69** (main `76c3416`, online dalle 14:07 del 10/10, controllato: `APP_VER=69`, CACHE `jona-ordini-v73`).

## Ultimo messaggio di Mario (#61), parola per parola
«Si applica la regola in modo permanente e rinnominala vhe sia visibile esempio Jovan Ramo definitivo o qlkosa di meglio o del genere»
→ Fatto (ramo `claude/jona-ramo-definitivo`). Poi v69 pubblicata e comunicata con i passi di prova. Gli ho chiesto se ha cambiato la riga nelle preferenze personali (vedi sotto): **risposta non ancora arrivata**.

## Fatto in #61
1. Scorta `origin/scorta/claude/jona-sessione-61` unita (conteneva solo `docs/ULTIMO-MESSAGGIO.md`).
2. **v69 pubblicata**: `test-firebase-approva-arrivi` rifatta con l'emulatore (36 PASS, 0 FAIL; le righe «errors … navigator.serviceWorker.addEventListener» vengono dal serviceWorker finto della prova, non dall'app). `test-giro` già verde in #60 (messaggio della sessione #60). PR #80 → «Prove automatiche» verde → squash `76c3416` → online verificato. Main unito nel ramo definitivo: conflitti solo negli appunti (CLAUDE.md, CAMBIO-ACCOUNT, DA-FARE, ERRORI, consegne) perché lo squash rifaceva le stesse righe: tenuta la versione del ramo (più nuova); file dell'app identici a main.
3. **Meno controlli doppi** (Mario: «Secondo me fai troppi controlli poi non sò sei tu l'esperto», poi «si» a scriverlo): riga in CLAUDE.md sotto STABILITÀ. Sul computer di lavoro solo le prove legate alla modifica (+ `test-giro` se cambia l'aspetto); il resto alle prove automatiche di GitHub (gratis, zero token). Niente prove rifatte due volte.
4. **Ramo unico permanente** (proposta arrivata da RVC #52 via sessione #60; Mario: sì, permanente, nome visibile):
   - `.claude/ramo-di-lavoro.txt` = `claude/jona-ramo-definitivo`.
   - `.claude/hooks/avvio-check.py`: `ramo_di_lavoro()` legge prima quel file (ha la precedenza sul ramo attuale). Provato: partendo da `claude/jona-sessione-61` passa da solo al ramo definitivo.
   - CLAUDE.md: «RAMO NUOVO A OGNI HANDOFF» sostituita da «RAMO DEFINITIVO, UNICO E PERMANENTE» (all'handoff niente ramo nuovo; `source_revision` = ramo definitivo); RAMI IN ORDINE e CAMBIO ACCOUNT aggiornate. Restano solo i rami delle versioni per le PR (`claude/jona-v<NN>-<argomento>`). I vecchi `claude/jona-sessione-<NN>` restano su GitHub, non si toccano.
   - `docs/CAMBIO-ACCOUNT.md`: ramo fisso ovunque, e testo delle preferenze aggiornato.
   - Mandato a RVC #52 (`session_01JsFRVrgkAm7xSebe2EK7op`) l'esito, con invito ad allineare il CAMBIO-ACCOUNT di RVC.
5. DA-FARE: D24 segnata ✅ online.

## Da fare per Mario (aperto)
- Cambiare nelle **preferenze personali** (https://claude.ai/settings/general, in tutti e due gli account Gmail e Hotmail) la riga «- A ogni passaggio crea un ramo nuovo…» con:
  «- Si lavora sempre su un ramo unico per progetto (Jona: claude/jona-ramo-definitivo; RVC: il suo ramo fisso). Niente rami nuovi a ogni passaggio.»
  Finché non lo fa, le preferenze dicono ancora «ramo nuovo»: vale CLAUDE.md (scelta più recente di Mario, 10/10 #61).
- Provare la v69: vista Admin Chef, richiesta con un prodotto venduto da 2 fornitori (stessa unità, almeno 1% in meno) → riga verde «Da … costa … in meno» → **Passa**.

## Prossimo lavoro: D29 (ultimo messaggio di Mario in #60)
«ottimizza l'app sia per telefoni Android, sia per iPhone, sia per Mac, computer Mac e computer Windows.» Dettagli e proposta in `docs/DA-FARE.md` (D29): verificare l'esistente (PWA, `test-giro` 320/390, barra laterale larga), poi giro con WebKit (Safari) se installabile senza download pesanti e Chromium a 1280/1440; controllare zona sicura iPhone, `apple-touch-icon`, `apple-mobile-web-app-*`, push su iPhone (solo app installata, iOS 16.4+), tastiera che copre i campi, mouse/rotellina, `type=date/time` su Safari. Proporre 3 strade (ovvia/furba/geniale) con immagine, poi fare. Mario non ha segnalato guasti: è una raccomandazione generale. Prove: solo quelle legate (regola nuova).

## Note tecniche utili
- Emulatore Firebase: `npx firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (Java c'è; primo avvio scarica il jar, ~2 min). Svuotarlo per `demo-jona` e `jona-ordini` prima di ogni prova (curl in `tools/README.md`). Server: `python3 -m http.server 8765`.
- Il controllo dei permessi a volte blocca modifiche a CLAUDE.md o a `.claude/` («Self-Modification»): serve un sì esplicito di Mario in chat, poi riprovare.

## Ancora aperto (da prima)
- Email dei servizi di Jona, M26, M25, D10: senza risposta. In attesa: M27, M28, M29/M30. D23, D25, D26 da fare. Elenco completo in `docs/DA-FARE.md`.

## Rischi aperti
- Limite settimanale in avviso fino a mercoledì 14/10 alle 12:00 (ora italiana): commit+push dopo ogni passo.
- Gemini Flash sovraccarico (503) nelle ore di punta: catena Flash-Lite → Cloudflare.
