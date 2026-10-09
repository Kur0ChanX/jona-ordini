# Passaggio di consegne (2026-10-09, fine sessione #47)

Sessione attuale: #48

## Ultimo messaggio di Mario (#47), parola per parola
«i prodotti finti che hai messo tu devi cancellarli tu»

Messaggi prima (#47), parola per parola, in ordine:
- «rimanda immagine a b c per scegliere o domanda»
- «lascia com è adesso» (risposta su D16: immagine)
- «ok avvisami quando è online» (la v63)

Promesse fatte a Mario e ancora da mantenere: **avvisarlo quando la v63 è online**. Gli ho detto «Tu non devi fare niente».

## Stato
- Online: **v62**.
- **PR #73 «v63: via i prodotti di prova»** aperta: https://github.com/Kur0ChanX/jona-ordini/pull/73 (ramo `claude/v63-listini-prova`, ultimo commit `30caa1c`, pushato e confermato). Le «Prove automatiche» ripartono sul nuovo commit. Questa sessione era iscritta alla PR: l'iscrizione la toglie questa sessione; **la nuova sessione deve iscriversi** (`subscribe_pr_activity` Kur0ChanX/jona-ordini 73).
- Ramo consegne `claude/sessione-41-consegne-p7tepk`: `main` (v62) unito (commit `c109ffd`), D16 chiusa.
- Cartella `/home/user/v63` = worktree del ramo v63 (sparisce col contenitore: `git worktree add ../v63 claude/v63-listini-prova`).

## Fatto in #47
1. D16 chiusa: Mario «lascia com è adesso» → nel ramo consegne resta `docs/img/v62-uscita-scelta.png` con le bozze A/B/C (quella del ramo consegne); la versione di `main` (vecchie uscite polvere/TV/taglio) NON è stata salvata a parte (resta nella cronologia di git). Merge con `git checkout --ours`, commit `c109ffd`, poi `bdb17d1` (DA-FARE).
2. Arrivato messaggio dalla sessione #46 (`session_012mgHQaR4WnuUgrwW2kdMVw`): giro veloce locale della v63 su `f7fdfe6` TUTTE RIUSCITE (21) + `test-firebase-bulk` e `test-v16`.
3. Aperta PR #73.
4. **Richiesta di Mario: cancellare io i prodotti finti, non lui a mano.** Claude non ha accesso al Firestore vero, quindi la cancellazione la fa l'app da sola, una volta. Aggiunto alla v63 (commit `30caa1c`):
   - `fintoP` più stretto: `!!p.demo || (/^mar\d\d$/.test(p.id) && !p.caricatoDa && p.prezzo==null)` (i `marNN` del seed hanno `prezzo:null`; uno con prezzo scritto a mano resta).
   - `provaVia()` subito dopo `fintoP`: parte da `deadlineTick` (ogni minuto e al ritorno in primo piano). Condizioni: non `DEMO`, `S.db.kind==='firebase'`, `config/app.provaVia` assente, utente vero (`realU`, non `viewAs`) attivo `gm` o `dev`. Con `jona_fb_emu` (prove con emulatore) non fa niente salvo `localStorage.jona_t_provavia` (così le altre prove tengono i prodotti di prova). Legge i prodotti dal server con il nuovo `S.db.prodServer()` (FirebaseStore, `listini` con `source:'server'`): niente cancellazioni sbagliate da una copia vecchia del telefono. Cancella con `runPool`+`del`, poi scrive `config/app.provaVia=now()` e un toast. Senza rete: errore preso, riprova al giro dopo.
   - Scartato: anche in modalità locale (rompeva le prove locali che usano i prodotti di prova; il ristorante usa Firebase). Il pulsante manuale «Prodotti di prova → Elimina» resta.
   - NEWS v63 riscritta (chef: spariscono da soli; dev: `provaVia`, `prodServer`).
   - Prova nuova `tools/test-firebase-provavia.mjs` (emulatore): RIUSCITA (7 PASS). `test-listini-prova` rilanciata: riuscita. Aggiunta in `VELOCI` di `tools/prova-ci.sh` (dopo `test-listini-prova`).
   - Il giro veloce locale completo NON è stato rifatto sul nuovo commit: basta il controllo «Prove automatiche» della PR (stesso giro veloce). Se è rosso: capire la causa, correggere.

## Prossimo lavoro (#48)
1. Iscriversi alla PR #73; con «Prove automatiche» verdi → squash merge → controllo online (APP_VER 63, CACHE `jona-ordini-v67` su https://jona-ristorante-by-ynoy-corp.pages.dev/) → subito `git fetch origin main && git merge origin/main` nel ramo consegne + push.
2. **Avvisare Mario che la v63 è online**: apre l'app (o tocca «App da aggiornare»), i prodotti finti spariscono da soli; chiedergli se ne vede ancora (M26).
3. D17 ponte RVC: rispondere alla sessione RVC attiva (#29, `session_012YP8hknRTGPF6chZDGPEbV`) con send_message: cosa dà Jona (agenda `agenda_<AAAA-MM>` con `ev={k,t,g,h,cop,note,vis,rep}`, coperti; orari `config/orari_<lunedì>.tp`; `staff` nome/reparto) e cosa serve a Jona (ospiti/camere presenti, partenze, allergie, eventi della struttura → coperti e `sugStats`). Tecnica da valutare: Worker Cloudflare con chiave condivisa (Firebase separati). Solo progetto, niente codice.
4. Poi D14 (prova Android di Mario) e il resto di `docs/DA-FARE.md`.

## Strumenti
- Server: `python3 -m http.server 8765` nella cartella del ramo; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`; svuotarlo prima di ogni prova Firebase (vedi `tools/prova-ci.sh`).
- Prove con `TZ=Europe/Rome` (E18).

## Ancora da chiedere
- Esito di M25 (agenda con Mauro): senza risposta.
- D10 (riquadro «Inviato allo chef»: solo «Continua»): senza risposta.

## Rischi aperti
- La pulizia automatica è irreversibile sui dati veri: la regola è stretta (solo `demo` e `marNN` mai caricati e senza prezzo) e legge dal server. Se Mario ha caricato i listini sotto un fornitore diverso da `mariano`, i `marNN` vecchi vengono tolti: è quello che vuole.
- Maschera SVG su Android non ancora verificata su un telefono vero.
- Titolo nuova sessione: `🟤 ▶ ATTIVA · #48 · Jona Ordini · da v62 · 09/10/2026 · prossimo: pubblicare v63 (pulizia automatica prodotti di prova)`.
