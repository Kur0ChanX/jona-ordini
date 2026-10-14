# Passaggio di consegne (2026-10-14, fine sessione #130)

Sessione attuale: #131

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **Online: v110** (controllato `APP_VER=110` sul sito; Worker pubblicato verde con `f25`/`l25`). Squash PR #121 `a3986a5`.
- **PR #122 (v111) PRONTA, prove partite alle 00:01** (ora italiana, 14/10) sul commit `868f6f1`. Iscrizione alla PR e controllo una tantum CANCELLATI all'handoff: la nuova sessione si iscrive di nuovo.
- Limite: `five_hour` allowed.

## Fatto in #130 (13/10, ~22:42 → 14/10 ~00:10 ora italiana)
- **Rosso della v110** (PR #121): `test-moduli` «all'avvio … novità vecchie non caricati» = `NEWS` a 21 voci (max 20). v90 spostata in `data/news.json`. Lezione **E55** in `.claude/rules/struttura.md` (+ riga in `docs/ERRORI-STORIA.md`): a ogni versione, se `NEWS` arriva a 21, la più vecchia va in cima a `data/news.json`.
- Difetto vecchio corretto insieme: `newsFor` leggeva solo `dev:{aggiunte,…}`; dalla v90 le voci hanno `dev:[…]` → note tecniche invisibili allo sviluppatore. Ora array → «Aggiunte». Prova nuova in `tools/test-news.mjs` (fallisce col codice vecchio, controllato).
- v110 unita (squash), main unito sul ramo, scorta unita, online controllato.
- **Mario** (dopo la v110): «ci ha messo 50 secondi quindi non max 20 secondi / metti un caricamento stile vino che si riempie nella barra o qualche idea geniale / poi nella ricerca cerca il vino in locale se non c'è dentro c'è un tasto cerca su internet».
- Bozze del caricamento (A Calice, B Barra di vino, C Bottiglia che versa) → **Mario ha scelto A**: «a ma fai bene l'animazione non a bassi frame o scattosa falla ottimizzata senza appesantire la pagina ma che non sia amatoriale».
- **v111** (PR #122), file: `moduli/cantina.js`, `index.html` (CSS `.vn-cbox`, `.vn-cal`, `.vn-liv`, `.vn-onda`, `.vn-onda2`, `@keyframes vnOnda`; NEWS v111; `APP_VER=111`; v91 spostata in `data/news.json`), `sw.js` (`CACHE` `jona-ordini-v115`), `tools/test-cantina.mjs`, `.claude/rules/struttura.md` (riga v111), foto `docs/img/v111/` (1-carta, 2-calice, 3-lista, 4-calice-scuro, mandate a Mario).
  - Velocità: causa probabile dei 50 s = Gemini 2.5 Flash con «thinking» acceso di partenza. Ora `vnMondo` prova `l25` (Flash-Lite) poi `f25`, con `generationConfig.thinkingConfig.thinkingBudget:0`; se Google dà 400 → stessa domanda senza `thinkingConfig` (una volta). Senza Google: `lite` poi `flash`. NON verificato sul telefono vero (Context7 aveva la quota finita; la pagina di Google sul thinking non parla di `thinkingBudget`).
  - Carta: `fuori` = nessun vino col nome scritto (anche ignorando i filtri) → «‹nome› non è in cantina.» + pulsante grande `vn-mb primary` «Cerca «nome» su internet»; se esiste (anche nascosto da «Solo in casa») → piccolo `vn-mb ghost` «Non è tra questi? Cerca su internet». Titolo del foglio «Cerca su internet».
  - Calice: `vnCaliceH`, `vnCalLiv` (0,92·(1−e^(−1,6·t/T))), `vnCalY`, T = `vnTSolito('mondo')` (ultime 5 ricerche riuscite con Google in `jona_ia_t.mondo`, partenza 10 s). Solo `transform`: livello ogni 0,5 s con transizione lineare 0,6 s, due onde CSS. A risposta arrivata riempie all'orlo in 0,45 s, poi la lista. Controllati 13 fotogrammi: fluido.
  - Prove locali verdi: `test-cantina` 80/80, `test-moduli`, `test-news`, `test-giro`.
- Mario dopo le foto: **«falla a mano / Ricordati che ci ha messo quasi un minuto per trovare i vini cannonau»**. Significato di «falla a mano» NON chiaro (disegno del calice fatto a mano come i disegni del Bar? prova fatta da me a mano? altro?).

## ✅ PROSSIMI PASSI (#131, continuare da sola)
1. **Subito: domanda a tocco a Mario** (con doppio tocco e scelte numerate nel testo): «Cosa vuoi dire con "falla a mano"?» Scelte: 1 «Il calice disegnato a mano (stile inchiostro e acquerello come i cocktail)» · 2 «Una prova vera fatta da te sul telefono/sito» · 3 «Altro (scrivilo)». Intanto lavorare solo su cose indipendenti (passo 2).
2. **PR #122**: `subscribe_pr_activity`, esito delle prove UNA volta (evento o ≥15 min dopo le 00:01). Verde → squash con `commit_message` corto, controllo online `APP_VER=111`, `git fetch origin main && git merge origin/main`, push. Rosso → capire la causa (E54: niente `list_workflow_runs`; stato con `get_check_runs` o `curl` all'API pubblica `commits/<sha>/check-runs`).
3. **Il minuto della ricerca**: dopo la v111 online chiedere a Mario di riprovare «cannonau» e dire i secondi. Se resta lento: leggere la scatola nera (righe «Vino nel mondo: …») per capire se un lettore falliva prima (es. `f25` 429/503 e poi `l25`). Idea per tagliare il tempo (da proporre, non fatta): tetto di 20 s per tentativo (AbortController in `gemCall` o tempo massimo nel Worker per `l25`/`f25`), poi subito la risposta «dalla memoria».
4. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #130 `session_01RogNmwXwcxYKVbAxJt2x4K` (chiusa), #129 `session_01XYQ7AKdXwDjSzoUVAfHb9g`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T` (la #20 non risulta ancora). EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Prove in locale: server `python3 -m http.server 8765` in background (dopo un riavvio del contenitore va rilanciato). Script foto del calice: le prove passano `firebase-config.js` finto (`self.JONA_FIREBASE=null`) con `ctx.route`, altrimenti l'app chiede il codice d'invito.
- Impegno: `high` (`.claude/settings.json`).

## Consumo #130
cache_read 5.168.408 · cache_write 104.689 · output 13.632 · cost_usd 2,14.

## Ultimo messaggio di Mario, parola per parola
(#130, ~00:08): «falla a mano
Ricordatinche ci ha messo quasi un minutonper trovare i vini cannonau»
Prima: «ci ha messo 50 secondi quindi non  max 20 secondi / metti un caricamento stile vino che si riempie nella barra o qualche idea geniale / poi nella ricerca cerca il vino in locale se non c'è dentro c'è un tasto cerca su internet». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
