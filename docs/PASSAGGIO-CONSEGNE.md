# Passaggio di consegne (2026-10-07)

Sessione attuale: #25

## Ultimo messaggio di Mario (#24)
«ok vai avanti» (dopo il mio avviso che il giro completo stava girando e poi sarebbe venuta la PR v41). Vale ancora quello di #23: «vai sii più autonomo possibile e procedi con tutto fermati se ti servo urgente per decisioni importanti problemi ecc». Leggere per intero quello che Mario scrive in «Altro».

## Messaggio di Mario arrivato dopo l'apertura di #25 (risposta alla domanda sui reparti)
«Si potrebbe scegliere mauro e maurizio creano evento o informazione o aggiornamento operativo ecc ecc e scelgono chi puó vederlo se é solo loro memo personale o da mandare ai gruppi operativi»
→ Da fare nella v42 (ramo `v42-agenda`), prima della PR v42:
- **Chi crea**: Maurizio (gm) e **Mauro** (Mauro Loi, reparto `fb` F&B Manager, oggi forse ruolo `staff`: controllare). Proposta: possono creare `isMgr` + staff con reparto `fb` o `resp` (funzione `agCanEdit(me)`), oppure un elenco scelto in Impostazioni.
- **Tipo** nel modulo: Evento | Informazione | Aggiornamento operativo | Memo (campo `k` in `ev`, icona/etichetta nella lista e nella striscia).
- **Chi lo vede** c'è già: Solo io (memo personale) | Tutti | Reparti (= gruppi operativi). Valutare se «gruppi operativi» = reparti o i gruppi della chat; chiedere a Mario in una riga se non è chiaro.
- Domanda su «i gestori vedono tutti i reparti»: Mario non ha detto no; lasciare così salvo sua indicazione.

## Fatto in #24
- Il ramo locale `ccr-4a01d00e-6ay25e` era di nuovo vecchio (sessione #12): rinominato `vecchio-sessione12` (solo in quel container), ramo preso da origin. Probabile anche nella prossima sessione: se `merge --ff-only` fallisce, fare lo stesso (`git branch -m` + `git checkout -b <ramo> --track origin/<ramo>`), mai reset.
- **`test-v40` rossa era un bug vero** (non del merge): dopo «Crea profilo» `invMonoSend` leggeva `D().staff[sid]` prima che arrivasse dallo snapshot → usciva in silenzio. Corretto: `createProfile` passa il profilo (`invMonoSend(id,{...doc,id})`), `S.invM.u` per `invMonoSheet`. Prova: chiude la scheda «Invito pronto» con la X prima del secondo invito. Commit `878b4bd` sul ramo `ccr-4a01d00e-6ay25e`.
- `test-v40` 32/32, `test-firebase-push` 29/29 (da sole). **Giro completo sul ramo v41 (`878b4bd`): 39/39 RIUSCITE.**
- **v42 scritta** sul ramo separato **`v42-agenda`** (commit `d43b497`, su GitHub), partito da `878b4bd`:
  - `config/app.funz` + Impostazioni → «Funzioni» (`FUNZ`, `funzOn`, `funzSet`, `funzRows`), conta d'uso `config/uso_<AAAA-MM>` (`usoSegna`, `usoInfo`, chiave `jona_uso`).
  - Agenda come da progetto (#23): `agOpen`, `agSheet`, `agParse`, `agMic`, `agForm`/`agSave`/`agDel`, `agFotoGo` (Gemini), `agStrip`, `agBtn`; CSS `.ag-*`. Scelta mia (chiesta a Mario, senza risposta): per reparto lo staff vede i suoi, **i gestori tutti**; «Solo io» degli altri nascosto.
  - `APP_VER` 42, `CACHE` v46, `NEWS` v42 (chiave `chef`, non `gm`). `CLAUDE.md` e `tools/README.md` aggiornati.
  - Prove: nuova `tools/test-agenda.mjs` 51/51; `tools/test-giro.mjs` accende l'agenda con un evento e prova `agOpen`: nessun problema (aveva trovato «Nuovo evento» fuori schermo a 320 px, corretto con `.ag-2`).

## Prossimi passi (#25)
1. **PR v41**: dal ramo `ccr-4a01d00e-6ay25e` verso `main` (giro completo già verde su `878b4bd`; se il ramo ha solo commit di consegne in più, non serve rifarlo). Squash merge da Claude → controllo online (https://jona-ristorante-by-ynoy-corp.pages.dev/, `APP_VER` 41) → riallineare il ramo (`git fetch origin main && git merge origin/main`, push normale).
2. Dire a Mario di fare **M18** (regole Firebase nuove + «Apri per 48 ore» se serve), con link e passi piccoli (`docs/FIREBASE.md`).
3. **v42**: unire `origin/main` (dopo la v41) in `v42-agenda`, rifare `test-agenda` + `test-giro` (+ `test-news`), chiedere a Mario «giro completo ora o dopo?» (è un cambio medio: interfaccia + config, niente regole), poi PR v42 → squash → controllo online. Dire a Mario come accendere l'agenda (Impostazioni → Funzioni).
4. Dopo: v43 notifica del mattino «Oggi in hotel» e promemoria prima dell'evento dal Worker (cron, come `scadTick`), poi V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).
5. Domanda aperta a Mario: va bene che i gestori vedano gli eventi di tutti i reparti?

## Rischi aperti
- Telefono in attesa `ISLyK5…` (M17).
- `test-firebase-flow` tra 23:30 e mezzanotte (noto).
- Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
- Elenco completo: `docs/DA-FARE.md`.
