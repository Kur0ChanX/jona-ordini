# Passaggio di consegne (2026-10-13, fine sessione #124)

Sessione attuale: #125

La #124 (profondità 7 su 8) apre la #125 (profondità 8, l'ultima). **Al prossimo handoff `create_session` darà «lineage depth»**: E12, consegne pushate, poi Mario apre a mano una sessione da claude.ai/code (ramo `claude/jona-ramo-definitivo`) e incolla il prompt di 3 righe. Va scritto a Mario con i passi.

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v105 online** (PR #114, squash `a61eb36`, main unito nel ramo). v104 online, Worker verde (`/salute` ok).
- **PR #115 APERTA** (solo prove, l'app non cambia): i Worker finti di `test-firebase-push`, `test-firebase-approva-arrivi` e `test-v34` ora rispondono a `/turni`. Il push delle consegne la fa ripartire. La #124 era iscritta agli eventi, la #125 NO: deve controllarla da sé.
- Cose da fare: `docs/DA-FARE.md` (D33 aggiornata). Struttura: `.claude/rules/struttura.md` (riga v105 scritta).

## Fatto in #124 (13/10, ~17:35-18:20 ora italiana)
- Avvio: scorta unita (solo `docs/ULTIMO-MESSAGGIO.md`), motore Opus ok.
- v104 online controllata (APP_VER=104, Worker `/salute` ok).
- **Giro `tutto` della v104 (run 38423241878) ROSSO**: `test-firebase-push` e `test-firebase-approva-arrivi`, «Cannot read properties of undefined (reading 'length')». Causa: la v104 chiama `/turni` e i Worker finti lo mandavano nel ramo di `/invia` (`body.subs`). E14 non applicata nella #123. Corretto nella PR #115. In locale ho visto l'errore con la vecchia versione, poi 29 + 36 + 21 PASS con l'emulatore. Diario: E14 aggiornata + riga in ERRORI-STORIA.
- **«Proponi la settimana» (D33)**: c'era già «Copia settimana prima» (`orCopy`). Immagine con 3 strade (`tools/bozze/d33-proponi-settimana.html`). Mario: «si va bene la scelta 1 ma selezionabile i turni si fanno manuali senza aiuto alcoritmo ma attivabile» + «Sì, confermo la strada». Quindi **v105** = strada 1 «Copia intelligente» come funzione `proponi` **spenta di partenza** (`orProp` vicino a `orCopy`). Cosa fa: copia la settimana prima, riposi compresi; ferie/malattia/permessi vecchi restano vuoti e sono contati nell'avviso; le assenze già messe in questa settimana restano; chiede conferma prima di sostituire turni veri. Scartate: 2 «copia + rinforzi per i coperti» (era la mia raccomandazione) e 3 «settimana da zero».
- Prova nuova `tools/test-orari-proponi.mjs`: 6 dispositivi, nelle veloci, 45/45 in locale (Apple su GitHub verde). Legate verdi: test-orari 71, coperti 15, reparto 26, resp 20, news 94, testbar 13, test-giro.

## ✅ PROSSIMI PASSI (#125, continuare da sola)
1. PR #115: leggere il controllo `prove` (`pull_request_read get_check_runs`). Verde → squash merge, poi `git fetch origin main && git merge origin/main` e push. Rosso → capire la causa. Dopo: lanciare il giro `tutto` su main (workflow_dispatch di `prove.yml`) per confermare che è verde (E14).
2. Dire a Mario in 1-2 righe quando la #115 è unita e il giro `tutto` è verde.
3. Poi proporre a Mario UNA idea nuova (regola 7), controllando che non esista già. Lavori aperti in DA-FARE: D48 cocktail bellissimi (rimandata da Mario), D50 altri moduli.
4. Se arriva E68 da RVC («aiutanti vicino alla soglia»): applicarla.
5. Il prossimo handoff è da fare a mano (profondità 8, vedi sopra).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #125 (nuova), #124 `session_01Ry4R9GUUTLRVFezkQaFrxE`, #123 `session_01PB9hmHD5EoYuranoSQU6N9` (chiuse).
- RVC attiva: **#108** `session_01JrHtLhxau36KHsV59PNRY2` (ricontrollare con `list_sessions` limit 4). SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- E38 (aperto): prima di lavori grossi ripetere la scelta in chiaro.
- Prove Firebase in locale: `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` in background + svuotare prima di ogni prova (`tools/README.md`).
- Impegno: `get_session` non mostra `effort_level`, quindi in `.claude/settings.json` non è scritto.

## Consumo #124
`get_session` non dà il campo usage: dato non disponibile. Contesto alla chiusura ~205k.

## Ultimo messaggio di Mario, parola per parola
(#124) risposta a tocco alla domanda «Quale strada per Proponi la settimana?»: «si va bene la scelta 1 ma selezionabile i turni si fanno manuali senza aiuto alcoritmo ma attivabile» + «Sì, confermo la strada». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
