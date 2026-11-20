# Passaggio di consegne (20/11/2026, chiusura della #146)

Sessione attuale: #147 (dopo la #146 `session_01WTjqUuMXapFYVzQRUuie8s`, chiusa alla soglia 20/11 20:51; la apre la #146 con `create_session` (catena 2 di 8)).

- **Già deciso da Mario (non richiedere)**: v121 approvata («va bene, mettila online», 20/11). D59 salvagente: «vai di tuo consiglio, basta che funziona … iPhone che Android … plug and play» → strada scelta da Claude: accesso Firebase nome utente + password collegato al telefono (`docs/RIENTRO.md`, «Pezzo 3 NUOVA STRADA»), poi passkey. Kit 47 applicato («Si applica»). «Comunicalo in tutto l'account» (fatto, sotto). Causa del telefono svuotato: Mario ha usato «Cancella dati di navigazione» di Chrome con tutto spuntato tranne le password (E59).
- **Da non rifare**: installazione del kit 47 (43/43 prove degli hook verdi, commit `11b9c1e`); messaggi a RVC (Accessi 6 e Codice 39, 20/11 ~20:50); controllo del provider Firebase (oggi `PASSWORD_LOGIN_DISABLED`); domanda «conferma che tutto l'account ragiona» (risposta data: Jona sì, RVC ha la regola e Accessi 6 lavora, SPA/EdilCannas col kit; RVC Accessi 6 ha confermato alle 20:50: stessa strada già in uso in RVC, email finta `<utente>@utenti.rvc-villacarola.pages.dev`; da dire a Mario se non l'ho detto).
- **Cosa preme a Mario adesso**: è ANCORA FUORI da Jona e vuole una soluzione definitiva, in tutti i progetti: «le app devono avere una base stabile, non pendente a una cronologia».

## Stato (20/11 20:51 ora italiana)
- Ramo comune ≠ origin: PUSH DA FARE (verifica: `git rev-parse HEAD` = `origin/claude/jona-ramo-definitivo`). Giri in corso: Prove automatiche. PR aperte: #130 v121 · Ricollega un telefono al profilo . Scorte NON unite: scorta-principale-20261120-01WTjqUuMXap/claude/jona-ramo-definitivo.
- PR #130 (v121 + kit 47) aperta e pronta, controllo «prove» partito alle 19:47 UTC (giro 44805394325). Verifica: `pull_request_read get_check_runs` della #130. Verde → squash con `commit_message` corto, poi merge di `main` sul ramo e «v121 online» a Mario (sito: `APP_VER=121` nell'HTML). Rosso → causa vera.
- Commit di soli documenti fatti durante il giro: pushati dopo il giro (E39), prima di questa chiusura.
- Firebase Email/password: SPENTO finché Mario non lo accende. Verifica senza creare account: `curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<apiKey di firebase-config.js>" -H "content-type: application/json" -H "Referer: https://jona-ristorante-by-ynoy-corp.pages.dev/" -d '{"email":"prova-inesistente@jona.app","password":"xxxxxx99","returnSecureToken":true}'` → `PASSWORD_LOGIN_DISABLED` = spento; `INVALID_LOGIN_CREDENTIALS`/`EMAIL_NOT_FOUND` = acceso.
- v120 online (verificato: `APP_VER=120` nel sito, `main` `e875eb9`).

## Prossimi passi
1. PR #130: se non è ancora unita, esito di «prove» → squash → merge di `main` sul ramo → «v121 online» a Mario.
2. Codice v122 salvagente (`docs/RIENTRO.md` «Pezzo 3 NUOVA STRADA»): `linkWithCredential` (EmailAuthProvider, email `<nome utente>@utenti.jona`) a registrazione, `doLogin`, cambio password (`updatePassword`), scheda una tantum «Metti al sicuro il tuo accesso»; «Bentornato!» in `screenJoin` con `<form>` e `autocomplete`; `signInWithEmailAndPassword` → legge `membri/<uid>` (`k`, `sid`) → dentro; `PasswordCredential` su Chrome. Persona con più telefoni: email già usata → entra con quell'account. Tablet di cucina già collegato a un'altra persona: non toccare. Prova nuova `tools/test-firebase-salvagente.mjs` (emulatore auth: email e password vanno sempre) nelle VELOCI; a ogni versione `CACHE`, `NEWS`, `APP_VER`, riga in `struttura.md`. Il codice si può scrivere e provare anche prima che Mario accenda il provider; online solo dopo.
3. Rifare a Mario le domande aperte («## 0. Aspetta Mario»): come rientra stasera (consiglio: da solo da Firebase, approvando `membri/<uid>` del suo telefono dalla console), passo Firebase Email/password.
4. Dopo la v122: passkey (impronta o viso) dal Worker, D59 seconda parte.
5. Risposte di RVC (Accessi 6, Codice 39): se usano un'altra strada, allinearsi. Preferenze: kit 47 = Preferenze v38 = quelle di Mario, niente da mandare.

## Strade provate e scartate
- Pezzo 3 col «telefono del server» (robot nel Worker, vecchio piano di `docs/RIENTRO.md`): scartato per il salvagente perché richiede molto più codice e un segreto potente in D1; l'accesso Firebase fa lo stesso con meno rischio e Firebase blocca da solo i tentativi in serie.
- Google come salvagente: non funziona sull'iPhone con l'app dalla Home (Maurizio ha l'iPhone).
- `navigator.storage.persist` (v120) da solo: non ferma la cancellazione fatta a mano da Chrome.

## Sessione #146 in breve
- v120 confermata online; domande aperte rifatte con le 3 bozze del salvagente.
- Kit 27.3 → 47: `tools/scarica-kit.py` cercava solo 12 parti (E60, corretto); applicato con `estrai-kit.py --scrivi --anche-claude` + 9 file a mano (segnaposto, `settings.json` unito tenendo `impegno-check.py`, `CLAUDE.md` con i titoli nuovi). 43/43 prove verdi.
- Mario arrabbiato perché il creatore deve farsi abilitare da Maurizio: ammesso l'errore (E61).
- PR #130 aperta; salvagente progettato; RVC avvisata.
- File toccati: `tools/scarica-kit.py`, `tools/estrai-kit.py`, file del kit (`.claude/`, `tools/test-*.py`, `docs/kit-progetto/`, `.mcp.json`, `.github/workflows/pulisci-scorte.yml`, `.gitattributes`, `docs/ACCOUNT.md`, `docs/CHI-FA-COSA.md`, `docs/GUIDE-GIUSTE.md`), `CLAUDE.md` (copia vecchia in `archivio/CLAUDE-prima-del-kit47.md`), `docs/ERRORI.md`, `docs/ERRORI-STORIA.md`, `docs/RIENTRO.md`, `docs/DA-FARE.md`.
- Controllo Da fare: 0 voci aggiunte (D59 aggiornata con la strada scelta; «Aspetta Mario» con 2 righe).

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Numeri liberi
Prossimo E libero: E62.

## Ultimo messaggio di Mario (20/11/2026 ~20:50)
«Questo messaggio va bene, comunicalo in tutto l'account. Mi sono ricordato che la memoria del telefono che mi si è cancellata, se tu stai provando a indagare il motivo, te lo dico io. Probabilmente la colpa è la mia, però non è proprio una colpa, nel senso che io sono entrato, volevo cancellare la cronologia. Mi diceva un giorno, io ho messo tutto quello che c'era e ho cancellato anche dati. Mi ricordo che c'è su Chrome, c'era scritto dati, cronologia, tranne forse accessi non ho toccato, e probabilmente sono stato io, però nel senso non me ne do una colpa, io l'ho toccato su Chrome, quindi diciamo che le colpe sono 50-50, 50 mie e 50 tue. Tu dovevi salvarlo in modo in sicurezza e io non sapevo che cancellando la cronologia e dati da Chrome, io volevo cancellare solo la cronologia ma ho lasciato flaggato anche il resto, mi andasse a cancellare queste cose. Anche immaginati se un cliente, un collega cancella la cronologia, non li si deve cancellare tutto, memoria e quant'altro. Cioè, le app devono avere una base stabile, non pendente a una cronologia, dati volatili così. Mi confermi che in tutto l'account state ragionando per risolvere questo problema definitivamente?»

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-20 20:44 · Domanda 1. Ma com'è possibile che sono io il creatore e mi deve abilitare Mauriz… → risposto: errore mio ammesso (E61), scelte per rientrare rifatte; Mario non ha ancora scelto (riga in «Aspetta Mario»)
- 2026-11-20 20:45 · Domanda 2, va bene, mettila online. Domanda 3, vai di tuo consiglio, basta che f… → v121 in PR #130 (prove in corso); salvagente: strada accesso Firebase scelta, piano in `docs/RIENTRO.md`, passo Firebase chiesto a Mario
- 2026-11-20 20:49 · Questo messaggio va bene, comunicalo in tutto l'account. Mi sono ricordato che l… → mandato a RVC Accessi 6 e Codice 39; Accessi 6 ha risposto: in RVC stessa strada già in uso; causa scritta in E59

Ultimo, intero:
> Questo messaggio va bene, comunicalo in tutto l'account. Mi sono ricordato che la memoria del telefono che mi si è cancellata, se tu stai provando a indagare il motivo, te lo dico io. Probabilmente la colpa è la mia, però non è proprio una colpa, nel senso che io sono entrato, volevo cancellare la cronologia. Mi diceva un giorno, io ho messo tutto quello che c'era e ho cancellato anche dati. Mi ricordo che c'è su Chrome, c'era scritto dati, cronologia, tranne forse accessi non ho toccato, e probabilmente sono stato io, però nel senso non me ne do una colpa, io l'ho toccato su Chrome, quindi diciamo che le colpe sono 50-50, 50 mie e 50 tue. Tu dovevi salvarlo in modo in sicurezza e io non sapevo che cancellando la cronologia e dati da Chrome, io volevo cancellare solo la cronologia ma ho lasciato flaggato anche il resto, mi andasse a cancellare queste cose. Anche immaginati se un cliente, un collega cancella la cronologia, non li si deve cancellare tutto, memoria e quant'altro. Cioè, le app devono avere una base stabile, non pendente a una cronologia, dati volatili così. Mi confermi che in tutto l'account state ragionando per risolvere questo problema definitivamente?

