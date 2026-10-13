# Passaggio di consegne (2026-10-13, fine sessione #123)

Sessione attuale: #124

La #123 (aperta dalla #122, profondità 6 su 8) apre la #124 (profondità 7). **Alla #124 resta UN solo handoff automatico (limite 8, E12)**: al prossimo, se `create_session` dà «lineage depth 8», Mario apre a mano da claude.ai/code col prompt di 3 righe.

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR). PR #113 (v104) **unita** con squash `cca6c92` (~17:35); main unito nel ramo e pushato.
- Al momento dell'handoff erano IN CORSO: deploy Cloudflare Pages (run 38423220705), deploy del Worker (run 38423220670), giro completo `tutto` su main lanciato da me (run 38423241878, ~1 ora, regola E14 perché la v104 tocca il Worker). Online risultava ancora `APP_VER=103`.
- Cose da fare: `docs/DA-FARE.md`. Note pratiche: `tools/README.md` (in fondo). Struttura del codice: `.claude/rules/struttura.md` (riga v104 scritta).

## Fatto in #123 (13/10, ~16:30-17:40 ora italiana)
- Avvio: scorta unita due volte (niente di nuovo). Motore Opus ok.
- **Regole da RVC #107 giro 2** (arrivate tramite #122): A regole a richiesta `.claude/rules/struttura.md` (Struttura + Chiavi tolte da CLAUDE.md + lezioni E20 E24 E27 E35 E46 E47) e `.claude/rules/prove.md` (E8 E18 E22 E36 E41 E48 E50 E52), funzionano (si caricano aprendo i file); B consegne snelle; D lezione E53; C **guardia** dopo «Sì, mettila» + «Sì, confermo» a tocco: `.claude/hooks/guardia.py` (copia RVC + `node tools/test-`/`bash tools/prova-` in PROVE), hook PreToolUse in `.claude/settings.json`, `tools/test-guardia.py` 41/41. Attiva: blocca anche un commit nello stesso comando di un testo che CITA le prove (falso allarme → comandi separati; detto a RVC #108).
- RVC #108 (`session_01JrHtLhxau36KHsV59PNRY2`) ha chiesto se il giro 2 era arrivato: risposto «fatto». Manca solo **E68 «aiutanti vicino alla soglia»**: RVC la manda quando Mario dice sì nella chat RVC. Quando arriva: applicarla.
- Notifiche iPhone di Maurizio: **funzionano** (Mario: «si Maurizio legge le notifiche ho messo il link come app nella home»). Chiuso.
- Mario ha chiesto le idee non prese in considerazione: data tabella (costo cocktail, promemoria turno, logo lune M31, 5stelle M42, cocktail bellissimi D48, vini venduti D34). Scelta a tocco: **Promemoria del turno**, poi orario «1 ora prima» (scritto a mano) + conferma.
- **v104 promemoria del turno** (D33): Worker `/turni` + `turTickSrv` nel cron (i tre giri del cron ora con `.catch` separati), app `turPlan`/`turSrv`, funzione `turni` (accesa), NEWS v104, CACHE v108. Prova `tools/test-turni.mjs` 19/19 (aggiunta alle veloci in `prova-ci.sh`); legate verdi: news 94, agenda-v58 26, orari-reparto 26, orari-resp 20, testbar 13. Prove GitHub PR verdi.

## ✅ PROSSIMI PASSI (#124, continuare da sola)
1. Controllare che sia online: `curl -sL https://jona-ristorante-by-ynoy-corp.pages.dev/ | grep -o 'APP_VER=[0-9]*'` = 104; deploy del Worker verde (run 38423220670; `curl https://jona-notifiche.<WK_SUB>.workers.dev/salute`, `WK_SUB` in index.html); giro completo 38423241878 verde. Rosso → capire la causa e correggere (priorità).
2. Dire a Mario in 2 righe che la v104 è online e come provarla: un turno pubblicato negli Orari → notifica 1 ora prima sul telefono di quella persona (con le notifiche attive).
3. Poi **«Proponi la settimana»** negli Orari (seconda parte di D33, scelta da Mario #123 come passo dopo): l'app propone i turni della settimana (es. dalla settimana prima/turni tipo, contratti, coperti dell'agenda) e il responsabile corregge e pubblica. Prima bozza/immagine e domanda a tocco (E19), regola: lo staff NON sceglie i giorni liberi (decidono Mauro sala, Maurizio cucina).
4. Se arriva E68 da RVC: applicarla.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #124 (nuova), #123 `session_01PB9hmHD5EoYuranoSQU6N9`, #122 `session_012bxjmAc6J4rsMJxnn7fxaf` (chiuse).
- RVC attiva: **#108** `session_01JrHtLhxau36KHsV59PNRY2`. SPA attiva: #14 `session_016iyo14hpB7Qq4UWfhfCqgV` (ricontrollare con `list_sessions` limit 4).
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- E38 (aperto): prima di lavori grossi ripetere la scelta in chiaro.

## Consumo #123
cache_read 12.165.244 · cache_write 140.335 · output 42.528 · cost_usd 4,41 · contesto alla chiusura ~247k.

## Ultimo messaggio di Mario, parola per parola
(#123) risposta a tocco alla domanda «Quando deve arrivare il promemoria del turno?»: «1 ora prima» (scritto a mano) + «Sì, confermo l'orario». Prima: «mi avevi consigliato idee non prese in considerazione?» → scelta «Promemoria del turno» + «Sì, confermo la scelta». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
