# Passaggio di consegne (2026-10-13, fine sessione #129)

Sessione attuale: #130

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **Online: v110** (#130, 23:20 circa: `APP_VER=110` sul sito, Worker pubblicato verde). Squash PR #121 `a3986a5`, main unito sul ramo. Causa del rosso: `NEWS` a 21 voci (E55); v90 spostata in `data/news.json`; corretto anche `newsFor` (note `dev:[…]` invisibili dalla v90).
- Prossimo: aspettare la prova di Mario su «cannonau» (passi 3-4 sotto).
- Limite: `five_hour` allowed. Commit e push dopo ogni passo.

## Fatto in #129 (13/10, ~21:41-22:42 ora italiana)
- Avvio: scorta unita due volte (solo `docs/ULTIMO-MESSAGGIO.md`). Riferimento RVC aggiornato.
- Mario ha provato «Cerca nel mondo» con «cannonau» → foto «Gemini è molto occupato adesso: riprova tra un minuto. Riprova.» (salvata in `docs/foto-mario/2026-10-13-cerca-mondo-gemini-occupato.jpg`). Errore 429 su Flash e Flash-Lite.
- **v109** (PR #120, online): `moduli/cantina.js` `vnMondo`: se la ricerca fallisce → stessa domanda senza `tools` (`vnMondoPrompt(q,true)`), `S.vnM.mem` → avviso giallo «Google adesso non fa ricerche: elenco dalla memoria dell'IA. Controlla bene nomi e annate.»; niente «Riprova» doppio (se `g.err` contiene già «riprova» non si aggiunge); scatola nera con `g.msg` (messaggio vero di Google, 160 caratteri). `index.html` `gemCall`: 429 con `per.?day|PerDay|daily` → «Gemini ha finito le richieste gratis di oggi: riprova domani mattina.». Prove nuove in `tools/test-cantina.mjs` (3).
- Mario: «cerca una soluzione». **Causa vera** (pagina ufficiale https://ai.google.dev/gemini-api/docs/pricing): grounding con Google Search nel piano GRATIS = «Not available» per tutti i Gemini 3.x (`gemini-flash-latest` e `-lite-latest` oggi sono Gemini 3); Gemini 2.5 Flash/Flash-Lite = gratis fino a 500 RPD (condivisi), azzerati a mezzanotte di Los Angeles (9:00 italiane). Pagato: Gemini 3 = 5.000 ricerche/mese gratis poi 14 $/1000; 2.5 = 1.500 RPD poi 35 $/1000. Scartato: pagare (decide Mario, non serve ora), cercatori esterni (Brave/Tavily: chiavi in più).
- **v110** (PR #121, ROSSA): ricerca con lettori nuovi `f25`/`l25` (`gemini-2.5-flash`/`gemini-2.5-flash-lite`) in `worker/src/index.js` `LETTORI`, `index.html` `GEM_DIR` e `gemNome`; `vnMondo` cerca `['f25','l25']`, poi senza ricerca `['flash','lite']` se il codice è in `GEM_RETRY` o 400. NEWS v110, `APP_VER=110`, `CACHE` `jona-ordini-v114`, riga v110 in `.claude/rules/struttura.md`. Prove nuove: `test-gemini-server` (f25/l25 con google_search, 65/65 in locale), `test-cantina` aggiornata (74/74 in locale).
- Unione dopo lo squash #120: conflitti in 6 file risolti tenendo il ramo (main = albero identico a `0cb2d48`, controllato con `git diff`) (E44).
- Durante le prove della #120 il commit v110 è stato salvato in `scorta/<ramo>` (push in avanti) invece che sul ramo, per non far ripartire le prove (E39).

## ✅ PROSSIMI PASSI (#130, continuare da sola)
1. **PR #121 rossa**: leggere il log del job (`get_job_logs` con `failed_only`, solo le righe FAIL), capire la causa, correggere, prove legate in locale, UN push. Sospetti: una prova che conta i lettori o i modelli (`grep -l "gemini-flash-latest\|'flash','lite'" tools/*.mjs`), Worker finti nelle prove (E14), `test-giro`/NEWS. Mai saltare una prova.
2. Iscriversi alla PR #121 (`subscribe_pr_activity`), aspettare il verde, squash, controllo online (`APP_VER=110`), `git fetch origin main && git merge origin/main` sul ramo, push. Controllare che il workflow `cloudflare-worker.yml` su main sia verde (il Worker deve avere `f25`/`l25`: senza, l'app v110 riceve 400 «lettore sconosciuto» e va subito alla memoria).
3. Dire a Mario quando la v110 è online: chiudere e riaprire l'app, cercare «cannonau», dire se compare la lista.
4. Se anche con Gemini 2.5 dà 429: leggere la scatola nera (ora con il messaggio vero di Google) e capire se è al minuto o al giorno.
5. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #129 `session_01XYQ7AKdXwDjSzoUVAfHb9g` (chiusa), #128 `session_016n58ZsVbDPafmfh4Rpp1QH`.
- RVC attiva: #119 `session_01JRdmqsRmgnHzvjRXEnk13X`. SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva. Il controllo una tantum `trig_012s8Kd1PtCgPqN9HoCFjs8y` di #129 è stato cancellato all'handoff.
- Prove in locale: server `python3 -m http.server 8765` in background.
- Impegno: `high` (`.claude/settings.json`).

## Consumo #129
cache_read 10.731.978 · cache_write 156.538 · output 36.911 · cost_usd 4,06. Contesto alla chiusura ~203k.

## Ultimo messaggio di Mario, parola per parola
(#129, 21:51): «cerca una soluzione». Prima: foto dell'errore «Gemini è molto occupato adesso: riprova tra un minuto. Riprova.» (ricerca «cannonau»). Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
