# Passaggio di consegne (20/11/2026, chiusura della #147)

Sessione attuale: #148 (dopo la #147 `session_01WTjqUx33upTUKFSvBFFwqV`, chiusa alla soglia 20/11 21:41; la apre la #147 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere)**: v121 online (fatto). D59 salvagente «vai di tuo consiglio… plug and play». Stasera rientra «da solo da Firebase» (scelta 2, passi dati dalla #147). Foto della v122 APPROVATE (21:40 «domanda 4 va bene come consiglio»).
- **Da non rifare**: v122 scritta e provata (PR #131 bozza, 13 prove legate verdi in locale); foto in `archivio/D59/` già mandate e approvate; kit 48 già scaricato e confrontato (cambia: «sviluppatore compreso» in «Nessuno resta mai fuori», regola «Allineamenti» con `tools/allineamenti.mjs`; 10 file, 5 in `.claude/`); prova che il kit vale per i progetti futuri (risposta data: regola «Nessuno resta mai fuori» + riga «Mai fuori» di `nuova-funzione` nel kit 48).
- **Cosa preme a Mario adesso**: rientrare in Jona stasera e che il salvagente vada online; che la soluzione valga «per tutti» i progetti.

## Stato (20/11 21:45 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/jona-ramo-definitivo`). Nessun giro in corso. PR aperta: #131 (BOZZA) v122 salvagente; la #147 è iscritta alla #131 (la nuova si iscrive con `subscribe_pr_activity`).
- v121 ONLINE: PR #130 unita (squash `f856a24`), sito con `APP_VER=121` verificato 20/11 ~21:30 (`curl -s <sito> | grep -o 'APP_VER=[0-9]*'`).
- v122 sul ramo (commit `ff5d7ce` e seguenti): accesso di riserva PER PERSONA (dettagli: riga v122 di `.claude/rules/struttura.md`). Prova `tools/test-firebase-salvagente.mjs` nelle veloci; `test-firebase-rientro` resa robusta (attesa dopo la ricarica di `fbActivate`).
- Firebase Email/password: SPENTO (controllato 20/11 ~21:20: `PASSWORD_LOGIN_DISABLED`). Verifica: `K=$(grep -o "apiKey: '[^']*" firebase-config.js | cut -d"'" -f2)` poi POST a `identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$K` con Referer del sito e un'email inesistente → `PASSWORD_LOGIN_DISABLED` = spento, `INVALID_LOGIN_CREDENTIALS`/`EMAIL_NOT_FOUND` = acceso.
- CLAUDE.md ~1060 token (tetto 1000): da accorciare (avviso di `kit-check.py`).

## Prossimi passi
1. Mario rientra da solo (passi dati in #147: console → Firestore → `chiave/ristorante` campo `v` → incollato in «Collega questo telefono» → `membri` doc più recente con `ok:false` → `ok` = true → «Accedi»). Chiedergli a che passo è; aiutarlo se un pulsante ha un nome diverso.
2. Quando Mario scrive «fatto» su Email/password: verifica col curl dello Stato → PR #131 `draft:false` (un giro, skill `pr`) → «prove» verde → squash con `commit_message` corto → merge di `main` sul ramo (in conflitto: `git checkout --ours`, il contenuto di `main` = commit provato) → sito con `APP_VER=122` → a Mario «v122 online: tocca «Metti al sicuro il tuo accesso»». Poi lui stesso fa «Metti al sicuro» (👁 in Staff → profilo: «Rientro da solo con la password: pronto»).
3. Kit 48: domanda aperta (ok di Mario). Con «1»: `python3 -I tools/estrai-kit.py <scratchpad>/kit-nuovo --scrivi --anche-claude` (ri-scaricare con `tools/scarica-kit.py`), poi a mano `.claude/settings.json` (unire), `CLAUDE.md` (accorciarlo sotto 1000 token).
4. Mario 21:40 «guarda se c'è nel kit una soluzione simile per tutti»: nel kit 48 c'è la REGOLA (riga «Mai fuori»), non il CODICE. Proposta da fare a Mario (1 riga, poi a RVC Codice 39 con `send_message`): mettere nel kit la «ricetta» del salvagente (accesso di riserva per persona, `svh`/`svo`, `membri` sv, schermata «Avevi già l'app?», prova del telefono svuotato) presa dalla v122, così ogni app la copia uguale.
5. Dopo la v122: passkey (impronta o viso), D59 seconda parte; D58 pezzi 2b e 4.

## Strade provate e scartate
- Pezzo 3 col «telefono del server» (robot nel Worker, vecchio piano di `docs/RIENTRO.md`): scartato per il salvagente perché richiede molto più codice e un segreto potente in D1; l'accesso Firebase fa lo stesso con meno rischio e Firebase blocca da solo i tentativi in serie.
- Google come salvagente: non funziona sull'iPhone con l'app dalla Home (Maurizio ha l'iPhone).
- `navigator.storage.persist` (v120) da solo: non ferma la cancellazione fatta a mano da Chrome.

- Accesso di riserva legato al telefono anonimo (`linkWithCredential`, piano #146): scartato in #147 perché il cambio password e lo sganciamento chiedono un accesso recente (`requires-recent-login`, manuale Firebase), un tablet condiviso terrebbe l'accesso di una persona sola e togliere un telefono toglierebbe il salvagente. Scelto: accesso per persona con app secondaria `sv`, `staff.svh`/`svo`.

## Sessione #147 in breve
- PR #130 verde → v121 online. v122 salvagente scritta, provata (13 prove legate verdi in locale, dispositivi: solo Chrome in locale; WebKit su GitHub col giro), foto su iPhone approvate da Mario.
- Mario ha scelto (via #146) di rientrare da solo da Firebase: passi dati.
- Kit 48 scaricato (domanda aperta). Risposta a «non succederà più nei prossimi progetti?»: sì, regola del kit 48 citata.
- File toccati: `index.html`, `sw.js`, `data/news.json` (v102 spostata), `tools/test-firebase-salvagente.mjs` (nuovo), `tools/test-firebase-rientro.mjs`, `tools/prova-ci.sh`, `tools/README.md`, `.claude/rules/struttura.md`, `docs/RIENTRO.md`, `docs/DA-FARE.md`, `archivio/D59/` (3 foto).
- Controllo Da fare: 0 voci aggiunte (richiesta 21:40 scritta nella voce D59).

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Numeri liberi
Prossimo E libero: E62.

## Ultimo messaggio di Mario (20/11/2026 21:40)
«domanda 4 va bene come consiglio guarda se c'è nel kit una soluzione simile per tutti per evitare problemi»

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-20 20:52 · [AVVIO] Sessione #147 … → avvio, consegne seguite
- 2026-11-20 21:40 · domanda 4 va bene come consiglio guarda se c'è nel kit una soluzione simile per … → foto approvate (riga tolta da «Aspetta Mario»); kit: risposta + prossimo passo 4, voce D59

Ultimo, intero:
> domanda 4 va bene come consiglio guarda se c'è nel kit una soluzione simile per tutti per evitare problemi

