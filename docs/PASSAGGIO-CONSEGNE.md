# Passaggio di consegne (2026-10-07)

Sessione attuale: #24

## Ultimo messaggio di Mario (#23)
«vai sii più autonomo possibile e procedi con tutto fermati se ti servo urgente per decisioni importanti problemi ecc» → lavorare da soli (C5, poi C6), fermarsi solo per decisioni importanti o problemi. Regola sempre valida: leggere per intero quello che Mario scrive in «Altro».

## Fatto in #23
- Il ramo locale `ccr-4a01d00e-6ay25e` era vecchio e diverso da origin: tenuto come `vecchio-locale-ccr` (solo in quel container), ramo rifatto da `origin/ccr-4a01d00e-6ay25e`.
- **C5 (in corso)**: commit `6e0baef` = merge di `origin/main` (v40 notifiche) nel ramo. Conflitti risolti in `index.html`:
  - `NEWS`: v40 di main («Notifiche più semplici») + nuova voce **v41** «Invito WhatsApp con profilo pronto» (era la v40 del ramo); `APP_VER=41`.
  - Testo «Dopo la registrazione Maurizio o lo sviluppatore approvano» (di main) + `invOpt` (del ramo) in `profileForm`.
  - `vStaff`: pallini 🟢/🔴 di main + «invito non ancora usato» del ramo.
  - `sw.js`: `CACHE` `jona-ordini-v45`.
- Prove brevi sul merge (in `/tmp/claude-0/prove`, perse col container): riuscite `test-news`, `test-testbar`, `test-inviti`, `test-staff`, `test-registrazione`, `test-firebase-telefoni`, `test-giro`.
  - ❌ `test-firebase-push`: fallita perché l'ho disturbata io (ho cancellato l'emulatore mentre girava). **Da rifare da sola.**
  - ❌ `test-v40`: dopo «Aggiungi» (invito monouso, punto 4) non compare la scheda «Invito pronto» (`.sheet` assente dopo `addGo`, riga 66). Forse rotta dal merge (es. `addGo` con `invOpt`/pallini). **Da capire per prima cosa**: rifarla da sola, se fallisce ancora stampare `A.errs` e i toast dopo `addGo`.
- Non c'è ancora nessuna PR per la v41.

## Prossimi passi (#24)
1. Rifare da sole `test-v40` e `test-firebase-push` (una alla volta, mai due prove insieme sull'emulatore). Correggere la causa se `test-v40` fallisce ancora.
2. Giro completo `bash tools/prova-tutto.sh` (cambio importante: entrata libera e regole). Mario ha detto «procedi con tutto»: si può far partire senza chiedere. Poi PR v41 → squash merge (da Claude) → controllo online → riallineamento del ramo → dire a Mario di fare **M18** (regole Firebase + «Apri per 48 ore»), con link e passi.
3. **C6 · v42 = interruttori + agenda** (progetto già studiato in #23, nessun codice scritto):
   - **Interruttori**: `config/app.funz` {agenda:true}; `FUNZ=[{id,l,d}]`, `funzOn(k)`; Impostazioni → sezione «Funzioni» con `.seg` Accesa/Spenta (come `tbSet`), partono spente. Spenta = sparisce pulsante e striscia.
   - **Conta d'uso (Z)**: `config/uso_<AAAA-MM>` {`<funz>.<sid>`: giorni}; al massimo una scrittura al giorno per persona (chiave nuova `jona_uso`, da aggiungere in `CLAUDE.md`). In Funzioni: «usata da N persone, M volte questo mese».
   - **Agenda senza regole nuove**: eventi in `config/agenda_<AAAA-MM>` {tipo:'agenda', e:{<id>:ev}}, ricorrenti in `config/agenda_ric`. `ev={t,g:'AAAA-MM-GG',h:'HH:MM'|'',cop,note,vis:'io'|'tutti'|'rep',rep:[],da:sid,cr,mod,r:''|'s'|'m'}`. Scrittura `upd` con `e.<id>` se il documento esiste, altrimenti `put` (come `orari_`); cancellare = `e.<id>: null` (va bene sia in LocalStore sia in Firestore). Cambio mese = null nel vecchio + set nel nuovo. «Privato» è nascosto solo nell'interfaccia (tutti i membri possono leggere `config`, come per il resto dell'app).
   - Chi vede: autore, `tutti`, o reparto in `rep`. Chi crea: solo `isMgr`. Staff in sola lettura.
   - **Interfaccia**: icona `calendar` in `header.top` (data-a `agOpen`) per i gestori; striscia «Oggi in hotel» dopo `pushAsk()` in `shell` per chi ha eventi oggi (tocco → agenda). Foglio Agenda: `.seg` Oggi | Settimana | Mese, frecce ‹ ›, riga veloce «Scrivi o detta» + microfono (`vSR()`, errori `VERR`) + «Foto dell'agenda» + «Nuovo evento». Mese: griglia 7 colonne con pallini, tocco sul giorno → elenco.
   - **Riga veloce** `agParse(testo)`: oggi/domani/dopodomani, giorni della settimana (prossimo ≥ oggi), «20», «20/10», «20 ottobre», «ore 19», «alle 19:30», «120 coperti/persone/pax/ospiti»; il resto = titolo. Apre il modulo già compilato da confermare.
   - **Foto**: `shrinkImg` + `b64` + `gemCall` (come `gemRun`), Gemini risponde JSON [{data,ora,titolo,coperti,note}] con anno e data di oggi nel testo; elenco con spunte, «Aggiungi N eventi», scelta Solo io / Tutti.
   - Modulo: Titolo, Data (`type=date`), Ora, Coperti, Note, Chi lo vede (Solo io | Tutti | Reparti + chip `REPARTI`), Ripeti (No | Ogni settimana | Ogni mese), Elimina, Salva.
   - Prove: nuova `tools/test-agenda.mjs` (LocalStore: interruttore, parser, eventi privati/condivisi, ricorrenze, striscia per lo staff); in `tools/test-giro.mjs` accendere l'agenda dopo `makeTestData` e aggiungere `agOpen` ai pulsanti dell'header provati. Controllare l'header a 320 px.
   - v42: `APP_VER` 42, `CACHE` v46, `NEWS` v42.
   - Dopo (v43): notifica del mattino «Oggi in hotel» e promemoria prima dell'evento dal Worker (cron, come `scadTick`), poi V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).
4. Mario potrebbe fare prove in hotel (import, bolla, modalità aereo): aspettare le sue foto.

## Rischi aperti
- `test-v40` rossa dopo il merge (vedi sopra): la v41 non si pubblica finché non è verde.
- Telefono in attesa `ISLyK5…` (M17).
- `test-firebase-flow` tra 23:30 e mezzanotte (noto).
- Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
- Elenco completo delle cose da fare: `docs/DA-FARE.md`.
