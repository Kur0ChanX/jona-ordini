# Passaggio di consegne (2026-10-14, fine sessione #131)

Sessione attuale: #132

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **v111 unita in `main`** (squash PR #122 `72fbe50`, prove verdi alle 00:25 ora italiana). Online NON ancora controllato (`APP_VER=111` sul sito): farlo per primo.
- Main unito sul ramo (merge `9785338`: conflitti risolti tenendo la versione del ramo, che contiene v111 + v112; E44).
- **v112 sul ramo, NON pubblicata, NON approvata da Mario**: niente PR aperta. Non aprire la PR finché Mario non dice che il calice animato gli piace.
- Limite: `five_hour` allowed.

## Fatto in #131 (14/10, ~00:02 → ~07:30 ora italiana, con pausa notturna)
- Scorta unita due volte (solo `docs/ULTIMO-MESSAGGIO.md`).
- Domanda «falla a mano?» → Mario: **calice disegnato a mano** (confermato col doppio tocco).
- Bozze 1 (`docs/img/v111/5-bozze-calice-a-mano.png`: A Inchiostro, B Acquerello, C Schizzo) → Mario: «b ma il bicchiere è pessimo» / «nessuno fanno pena».
- Bozze 2 (`docs/img/v111/6-calice-tre-forme.png`: Bordeaux, Borgogna, Degustazione, stile B) → Mario: «fai un calice bello da vino rosso disegnalo tu».
- **ERRORE MIO**: ho capito «scegli tu» e ho messo nell'app il Borgogna (commit `0a002dd`, foto `docs/img/v112/1-*.png`, `2-*.png`). Mario si è arrabbiato: **«no scegli tu / come ti permetti / non scegli tu / ho detto fai un calice bello da vino rosso e disegnalo tu»**. Voleva un disegno NUOVO fatto da me, non una scelta tra bozze che non gli piacevano. Lezione da scrivere in `docs/ERRORI.md` (E56, vedi Prossimi passi).
- Calice nuovo disegnato da zero, stile a mano (`docs/img/v112/3-calice-a-mano-bozza.png`): tratti d'inchiostro a spessore variabile e un po' tremanti, generati da `tools/calice-mano.mjs` (scrive `mano.json` → costanti `VN_CAL`, `VN_CALW` in `moduli/cantina.js`), acquerello rosa dietro, riflesso azzurrino sul vetro, ombra del piede. Mario: «ti piace?» → **«anima il vino rendilo vivo fluido»** (confermato «Sì»): quindi il disegno va bene, voleva il vino vivo.
- **Animazione nuova** (commit «v112: calice disegnato a mano con il vino versato e che oscilla (da approvare)»): getto di vino dall'alto (`.vn-getto`, riga chiara che scorre `vnGetto`), cerchi dove cade (`.vn-c1/.vn-c2`, `vnCerchio`), vino che oscilla (`.vn-slosh`, `vnSlosh` ±3,2°), sale (`#vn-liv` translateY, `vnCalY(v)=116−46·v`), superficie larga come la coppa (`#vn-sup` scaleX, `vnCalSx`). A risposta arrivata `vnCalSet(1,…)` aggiunge `.fine` a `.vn-cal`: il getto e i cerchi spariscono. Acquerello in un SVG fermo a parte (`.vn-calw`, nascosto con `html.lite`). CSS in `index.html` (riga ~653, `.vn-cal…@keyframes vnCerchio`).
- Video mandato a Mario: `docs/img/v112/4-vino-vivo.mp4` (8 s). Risposta di Mario al video: non ancora arrivata (il suo ultimo messaggio ripete «no scegli tu…», forse rimandato dopo il riavvio del contenitore).
- Versione v112 già preparata: `APP_VER=112`, `CACHE` `jona-ordini-v116`, voce NEWS v112 (testo del Borgogna: **da aggiornare** al calice a mano con il vino versato), v92 spostata in `data/news.json`, riga v112 in `.claude/rules/struttura.md` (**da aggiornare**: descrive ancora il Borgogna 120×200, `VN_CALW` da 52 a 128, pieno 74; ora coppa da 44 a 116, pieno 70, getto, cerchi, oscillazione, `tools/calice-mano.mjs`).
- Prove locali sull'ultima versione: `test-cantina` 82/82 verdi. `test-moduli` 75/75 e `test-news` 95/95 verdi sulla prima v112 (da rifare); `test-giro` fermato a metà (da rifare).

## ✅ PROSSIMI PASSI (#132, continuare da sola)
1. Controllare online la v111: https://jona-ristorante-by-ynoy-corp.pages.dev/ → `APP_VER=111`.
2. Scrivere la lezione **E56** in `docs/ERRORI.md` (sezione «Comunicazione con Mario e domande») + riga completa in `docs/ERRORI-STORIA.md`: «Se Mario boccia tutte le bozze e dice "fallo tu", NON scegliere una delle bozze bocciate: disegnare una cosa nuova e mostrargliela prima di metterla nell'app». Commit.
3. Chiedere a Mario (domanda a tocco + doppio tocco + scelte numerate nel testo) se il video `4-vino-vivo.mp4` gli piace: 1 «Sì, mettilo online» · 2 «No, cambia (scrivi cosa)». NON decidere al suo posto.
4. Se sì: aggiornare voce NEWS v112 e riga v112 di `struttura.md`; rifare `test-cantina`, `test-moduli`, `test-news`, `test-giro`; PR dal ramo in bozza → pronta → prove verdi → squash (`commit_message` corto) → controllo online `APP_VER=112` → `git fetch origin main && git merge origin/main` (in conflitto tenere la versione del ramo con `git checkout HEAD -- <file>`, E44) → push.
5. Il minuto della ricerca «cannonau»: dopo la v111 online chiedere a Mario di riprovare e dire i secondi. Se resta lento: scatola nera («Vino nel mondo: …»), idea tetto 20 s per tentativo (AbortController in `gemCall` o tempo massimo nel Worker per `l25`/`f25`), poi risposta «dalla memoria».
6. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #131 `session_017havyiAofN9wKUgXPxeHJR` (chiusa), #130 `session_01RogNmwXwcxYKVbAxJt2x4K`.
- RVC attiva: #121 `session_01WgGBAxC3Pu8CyLrcvuXL1D`. SPA: #19 chiusa `session_01X8MjDTxctEEGuQGiLbPm2T`. EdilCannas Fornitori #15 `session_01B67cFRJxX2F4gzrDKbognj`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Foto e video del calice (gli script restano nello scratchpad e si perdono): Playwright `createRequire('/opt/node22/lib/node_modules/')`, `ctx.route('**/firebase-config.js')` → `self.JONA_FIREBASE=null`, `/#demo` → `demoGo` (solo se c'è) → `await modLoad('cantina')` → div fisso con `vnCaliceH({busy:true,t0:Date.now()})` e `vnCalSet(v)` ogni 500 ms; togliere `lite` da `<html>` per vedere l'acquerello. Video: `recordVideo` con viewport = misura del video, poi `ffmpeg … -c:v libx264 -pix_fmt yuv420p`.
- Server locale `python3 -m http.server 8765` (rilanciarlo dopo un riavvio).
- Impegno: `high` (`.claude/settings.json`).

## Consumo #131
Non disponibile da `get_session` (campo usage assente).

## Ultimo messaggio di Mario, parola per parola
(#131, ~07:28): «no scegli tu
come ti permetti
non scegli tu»
Prima (#131): «no scegli tu / come ti permetti / non scegli tu / ho detto fai un calice bello da vino rosso e disegnalo tu»; risposta al calice a mano: «anima il vino rendilo vivo fluido». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
