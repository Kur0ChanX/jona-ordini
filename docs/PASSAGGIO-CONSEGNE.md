# Passaggio di consegne (2026-10-13, fine sessione #125)

Sessione attuale: #126

La #125 era a profondità 8 su 8: **non può aprire sessioni** (`create_session` e `send_later` danno «lineage depth 8, limit 8», E12). La #126 la apre Mario a mano da claude.ai/code, ramo `claude/jona-ramo-definitivo`, col prompt di 3 righe. Con la sessione aperta a mano la profondità riparte da capo: dalla #126 l'handoff torna automatico.

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v106 online** (PR #116, squash `c3b5227`, main unito nel ramo e pushato). Pages risponde APP_VER=106. Worker pubblicato (workflow `cloudflare-worker.yml` run 38436266311 verde), `/salute` ok.
- **PR #115 unita** (squash `51247c2`): i Worker finti delle prove rispondono a `/turni`.
- **Giro `tutto` su main in corso**: run **38436308516** (workflow_dispatch di `prove.yml`, modo `tutto`, partito 17:09 UTC = 19:09 ora italiana). Copre #115 + v106 (che tocca il Worker, E14). Nessuna PR aperta.

## Fatto in #125 (13/10, ~18:18-19:15 ora italiana)
- Avvio: scorta unita (era solo un salvataggio vuoto con `docs/ULTIMO-MESSAGGIO.md`), motore Opus ok.
- PR #115: prove verdi → squash → main nel ramo.
- **Richiesta di Mario** (foto `docs/foto-mario/2026-10-13-vino-ia-errore-503.jpg`): «Gemini errore 503… senza senso… mi serve un caricamento vero».
  - Verifica: la chiave Gemini c'è sul server (POST `/gemini` senza gettone → 403 «Telefono non collegato», non 503 «non configurato»). Il 503 arriva davvero da Google («model is overloaded»): dipende dal carico dei computer di Google, non dall'uso della chiave. La chiave gratuita ha meno precedenza. Spiegato a Mario con le fonti.
  - **v106**:
    - `moduli/cantina.js`: `vnBusyH`/`vnTick`/`vnSecTxt` (contasecondi `#vn-sec`, barra `#vn-bar` sul tempo solito del lettore).
    - Il tempo solito è la media delle ultime 5 letture riuscite in `jona_ia_t`; di partenza `VN_TSOLITO` flash 20, lite 12, cf 30.
    - Ogni tentativo fallito mostra i suoi secondi (`f.lg[].sec`). CSS `.vn-bar` in index.html vicino a `.vn-busy`.
    - Worker: con `lettore` un 503 di Google si riprova una volta dopo 2,5 s (`GEM_503_MS`), se restano 8 s del tempo del lettore.
  - Prove: `test-cantina` +4 (58 PASS), `test-gemini-server` +2 (503 poi ok; 503 due volte), `test-news`, `test-moduli` verdi in locale. PR #116 «prove» verde su GitHub.
  - Scartato: cambiare modello o ordine dei lettori. Non si sa quale modello è meno carico e Google suggerisce di riprovare.
- `.claude/rules/struttura.md`: riga v106 e chiave `jona_ia_t` scritte.

## ✅ PROSSIMI PASSI (#126, continuare da sola)
1. Controllare il giro `tutto` run 38436308516 (`actions_get` o `list_workflow_runs` di `prove.yml`, event `workflow_dispatch`, `perPage` 1: l'output è lunghissimo, usare `actions_get`).
   - Verde → dirlo a Mario in 1 riga.
   - Rosso → capire la causa (`get_job_logs`), correggere, PR.
2. Chiedere a Mario se il nuovo caricamento dei vini gli va bene. Gli ho chiesto di provarlo (chiudere e riaprire l'app, Cantina Vini, foto di un vino).
3. Poi proporre a Mario UNA idea nuova (regola 7), controllando che non esista già. Lavori aperti in `docs/DA-FARE.md`: D48 cocktail bellissimi (rimandata da Mario), D50 altri moduli.
4. Se arriva E68 da RVC («aiutanti vicino alla soglia»): applicarla.
5. Dalla #126 l'handoff torna automatico (profondità nuova).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #126 (aperta a mano da Mario), #125 `session_016t7JLtWgmdVp4LkBupairU`, #124 `session_01Ry4R9GUUTLRVFezkQaFrxE` (chiuse).
- RVC attiva: **#108** `session_01JrHtLhxau36KHsV59PNRY2` (ricontrollare con `list_sessions` limit 4). SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- E38 (aperto): prima di lavori grossi ripetere la scelta in chiaro.
- Prove in locale: server `python3 -m http.server 8765` in background (si spegne dopo il tempo massimo: riaccenderlo).
- Impegno: `high` (da `effort_level` della #125), scritto in `.claude/settings.json` come `"effortLevel": "high"`.

## Consumo #125
cache_read 8.069.362 · cache_write 127.041 · output 22.342 · cost_usd 3,07 (da `set_session_title`, campo usage). Contesto alla chiusura ~213k.

## Ultimo messaggio di Mario, parola per parola
(#125, con la foto `docs/foto-mario/2026-10-13-vino-ia-errore-503.jpg`): «Gemini errore 503 oer lettura viti attenzione senza senso non in sovraccarico ha un apo gemini sua non utilizzata da nessuno e mi serve una caricamento vero per far vedere che non si è bloccato e quanto ci mette effettivamente l'ia». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
