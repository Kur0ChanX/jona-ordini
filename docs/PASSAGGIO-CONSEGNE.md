# Passaggio di consegne (2026-10-04, sera)

## Ultimo messaggio di Mario (da eseguire SENZA fermarsi)
«Procedi con il cambio del sottodominio Cloudflare (accetto qualche ora senza notifiche), poi procedi con tutto il resto senza fermarti. Se devi cambiare sessione fallo da solo: ho un impegno, non posso dare consensi. Fermati solo quando hai finito tutta la lista, poi fammi una lista dettagliata di tutto ciò che hai fatto.»
Detto a Mario: il disagio, sui telefoni non ancora aggiornati, riguarda notifiche + invio foto/vocali + «Chiedi a Jona» finché non riaprono l'app; nessun dato perso.

## Stato
- **v30 unita in main** (PR #39, squash `d9f038c`), ramo riallineato (merge di main, nessuna differenza). `APP_VER=30`, `CACHE=jona-ordini-v34`.
- v30 contiene: pallino sull'icona, forma d'onda dei vocali (`test-v30` ora verde: il microfono finto di Chromium fa solo un bip al secondo, la prova gli passa un WAV con `--use-file-for-fake-audio-capture`), **inviti con codice**.
- **Controllo online da completare**: alla chiusura il workflow Cloudflare (run 37210528836) e Pages erano in corso. Verificare: `curl https://invito.mario-miscera.workers.dev/ABCDEF` contiene `#i=ABCDEF`; `sw.js` online ha `jona-ordini-v34`; run del workflow verde (se rosso: `get_job_logs`).

## Inviti con codice (v30, fatto)
- `worker/invito/` (Worker `invito`, nessun binding): `GET /<CODICE>` → pagina con meta Open Graph (`media/invito.jpg`) + redirect a `https://kur0chanx.github.io/jona-ordini/#i=<CODICE>`. Workflow: step «Pubblica il link corto degli inviti» + curl di prova.
- `worker/src/index.js`: `POST /inviti` (solo membri; chiave presa da `membri/<uid>.k`, mappa `membriK`) → `{codice, scade}`; `GET /invito/<codice>` → `{k}` o 404; tabella `inviti` nel primo D1 (`invDb`), 7 giorni, pulizia nel cron. Alfabeto senza I/O/0/1.
- `index.html`: `WK_SUB`, `PUSH_URL`, `INV_URL`; `invNew` (codice dal server, ripiego link lungo `#k=` in modalità locale/senza server), `invRedeem`, avvio con `#i=` → `jona_icode` → chiave in `boot`; `fbJoinKey` accetta codice o link corto; schermata «Collega» con «codice d'invito (6 lettere)»; testo invito con `🔑 … *CODICE*`; cartolina con QR più piccolo (430) e riga «Codice d'invito»; foglio Invita mostra il codice.
- `media/invito.jpg` rifatta senza il finto pulsante «Tocca per entrare» (HTML + Jost locale renderizzato con Playwright; PIL non c'è). `og:description` senza «Tocca per entrare».
- Prova `tools/test-inviti.mjs` (17 verdi). Verdi anche: test-v26..v30, news, staff, registrazione, invito-bloccato, allegati-server, gemini-server.

## Lista da fare (in ordine, senza fermarsi)
1. **Finire il controllo online della v30** (sopra).
2. **Cambio sottodominio workers.dev** da `mario-miscera` a uno senza nome (proposto `jonaristorante`; se occupato `jona-ristorante`, `jonaportocervo`). Mario non è disponibile → farlo **dal workflow**: step opzionale che chiama `PUT /accounts/$CF_ACCOUNT/workers/subdomain` `{"subdomain":"<nuovo>"}` (prima `GET` per vedere quello attuale; se il token non ha il permesso, lasciare un avviso e NON rompere il deploy). Ordine per ridurre il buco: (a) app e `sw.js` con il nuovo `WK_SUB`/`PUSH_URL` + workflow (rinomina, poi deploy, prove curl col nuovo nome) in una sola PR; (b) dopo l'unione verificare `/salute` sul nuovo indirizzo. Nuova versione v31 (`APP_VER`, `NEWS`, `CACHE` v35). Aggiornare `CLAUDE.md` (indirizzo Worker). Se l'API rifiuta: non forzare, scrivere a Mario i passi a mano in Cloudflare (pannello **Workers & Pages** → sottodominio → **Change**: verificare i nomi esatti prima di scriverli) e tenere `mario-miscera`.
3. Maurizio Lai: registrazione dal link d'invito, approvazione e ruolo amministratore (istruzioni già date a Mario; niente codice).
4. **«Chi c'è in turno oggi»** in Orari dello staff e Staff → Orari, dalla settimana pubblicata `tp`.
5. **Promemoria ordini** (scegliere da soli lo schema più semplice: per fornitore, giorno/ora, notifica push a gestori).
6. **«Consumi e costi» più interattivo** (caricare prima la skill `dataviz`).
7. Mauro Loi in «F&B Manager»: da confermare con Mario (solo chiedere nel resoconto).
8. Da provare dal vero (Mario): vocale Android → iPhone, gesto indietro Android, pallino, invito con codice.
Ogni versione: PR → squash → controllo online → `git fetch origin main && git merge origin/main` → push. Alla fine: **lista dettagliata di tutto il fatto** per Mario + istruzioni numerate per le prove.

## Rischi aperti
- `/invia` del Worker non controlla chi chiama; tutti i telefoni approvati leggono tutti i messaggi e allegati.
- `/invito/<codice>` senza limite di tentativi (32^6 combinazioni, 7 giorni; resta l'approvazione del telefono). Il link lungo `#k=` resta solo come ripiego.
- iPhone: l'app sulla Home ha memoria separata da Safari → al primo avvio chiede il codice (ora corto, si scrive a mano).
- Dopo il cambio sottodominio: i link d'invito già mandati con `mario-miscera` smettono di aprirsi (il codice scritto a mano funziona ancora).
- `test-firebase-sync` già rotto da prima; `test-firebase-flow` fallisce 23:30–24:00.
