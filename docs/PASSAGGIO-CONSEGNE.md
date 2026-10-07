# Passaggio di consegne (2026-10-07)

Sessione attuale: #26

## Ultimo messaggio di Mario (#25)
«scusa il messaggio e foto bloccata non era per te» (una foto di un foglio arrivi dell'hotel, mandata per errore: ignorarla, non salvarla, contiene dati di clienti).
Prima: «manca il pallino marrone sul progetto jona…» (fatto, vedi sotto), «cucina sala ecc» (= i gruppi operativi dell'agenda sono i reparti) e «vai». Vale ancora «procedi con tutto, fermati se ti servo per decisioni importanti» (#23).

## Fatto in #25
- Ramo locale vecchio di nuovo: rinominato `vecchio-sessione-locale`, ramo preso da origin (stessa procedura di #24, mai reset).
- **v41 online**: PR #50 squash (`275f4c0`), sito con `APP_VER` 41. Ramo `ccr-4a01d00e-6ay25e` riallineato a main con merge.
- **v42 nel ramo `v42-agenda`** (ultimo commit `21d7fb4`, su GitHub):
  - main unito (conflitti solo per lo squash: codice preso da v42, consegne/DA-FARE da main; verificato che main = base di v42 + docs).
  - Tipo dell'evento `ev.k` (`AG_K`: ev Evento, info Informazione, op Aggiornamento operativo, memo Memo; vecchi eventi = ev, `agK`). Chip «Tipo» nel modulo (`agfK`), Memo mette «Solo io». Etichetta `.ag-k` in lista, prefisso «Tipo: » nella striscia.
  - Chi crea/modifica: `agCan(u)` = `isMgr` o reparto `fb`/`resp` (Mauro). Usato in `agSheet` e `agBtn`. `agSee` invariato (i gestori vedono tutti i reparti: Mario non ha detto no).
  - Le regole Firestore permettono già ai membri di scrivere `config`: niente regole nuove.
  - NEWS v42 e `CLAUDE.md` aggiornati. `APP_VER` 42, `CACHE` v46.
  - Prove: `test-agenda` 60/60 (9 nuove), `test-giro` nessun problema, `test-news` riuscita.
- **Pallino 🟤**: tutte le 35 sessioni Jona con ▶/✓ rinominate con 🟤 davanti (🟣 = RVC). La #03 era rimasta «▶ ATTIVA»: corretta in CHIUSA. Regola in `CLAUDE.md` (Regole di lavoro) su questo ramo, commit `f6b01cf`.

## Prossimi passi (#26)
1. Chiedere a Mario la risposta ancora aperta: **giro completo v42 ora o dopo?** (`bash tools/prova-tutto.sh` in background, ~1 ora; cambio medio). Poi PR `v42-agenda` → main, squash, controllo online (`APP_VER` 42), riallineare `ccr-4a01d00e-6ay25e` e `v42-agenda` con merge di main. Dire a Mario come accendere l'agenda: Impostazioni → Funzioni → Agenda.
2. Nel `v42-agenda` manca la regola 🟤 di `CLAUDE.md` (sta sul ramo ccr): si unisce da sola passando da main; se c'è conflitto in `CLAUDE.md` tenere entrambe le righe.
3. Mario: **M18** (regole Firebase nuove, passi già dati in #25: link GitHub raw → console https://console.firebase.google.com/project/jona-ordini/firestore/rules → **Pubblica**) e **M4** (Mauro → reparto F&B Manager, serve per scrivere in agenda). Chiedergli a che passo è.
4. Dopo: v43 notifica del mattino «Oggi in hotel» e promemoria prima dell'evento dal Worker (cron, come `scadTick`), poi V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).

## Rischi aperti
- Il ramo locale nella nuova sessione potrebbe essere vecchio: se `merge --ff-only` fallisce, `git branch -m` + `git checkout -b <ramo> --track origin/<ramo>`, mai reset.
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (noto). Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
- Elenco completo: `docs/DA-FARE.md` (aggiornato nel ramo `v42-agenda`).
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
