# Diario degli errori

Si legge a ogni avvio. Quando un errore fa perdere tempo o lavoro si aggiunge subito una riga.

| N. | Data | Errore | Causa | Rimedio |
|---|---|---|---|---|
| E1 | 07/10/2026 | Sessione nuova partita su «HEAD staccato»: push rifiutato | La sessione parte su un commit, non sul ramo | All'avvio l'hook avvio-check.py avvisa; prima di lavorare git checkout <ramo> + git merge --ff-only origin/<ramo> |
| E2 | 07/10/2026 | Tre domande insieme: Mario si perdeva | Troppe domande in un messaggio | Una domanda per volta, con le scelte pronte da toccare |
| E3 | 07/10/2026 | Spiegazione solo a parole: Mario non capiva | Niente immagini | Per scelte e confronti mandare un'immagine (prima/dopo) |
| E4 | 07/10/2026 | Ore perse a recuperare lavoro fatto nella chat normale di claude.ai | Lì niente si salva | Si lavora solo in Claude Code; ogni file ricevuto si salva subito nel progetto e si committa |
| E5 | 07/10/2026 | Nuova sessione: `git merge --ff-only` fallito sul ramo di lavoro | Il ramo locale era vecchio e diverso da origin | `git branch -m <ramo> vecchio-locale-…` poi `git checkout -b <ramo> --track origin/<ramo>`; mai `reset --hard` |
| E6 | 07/10/2026 | Mario non trovava le regole di Firebase | Il link diretto `…/firestore/rules` riporta alla home della console | Nelle istruzioni: menù a sinistra → icona **Firestore** → scheda **Regole** |
| E7 | 07/10/2026 | Conflitti in `DA-FARE.md` e consegne unendo `main` nel ramo di lavoro | Gli stessi appunti cambiati in due rami (ramo della versione e ramo di lavoro) | Gli appunti (`DA-FARE.md`, consegne) si cambiano in un solo ramo; unire `main` subito dopo ogni squash |
| E8 | 07/10/2026 | `test-responsabile` fallita dopo il pulsante «F&B Mauro» | La prova cercava «Mauro» in tutta la pagina, barra Test compresa | Le prove cercano i testi solo nella parte giusta della pagina, non in tutto `main` |
| E9 | 07/10/2026 | Avvio della sessione bloccato: i comandi non partivano | Il controllo automatico dei permessi non rispondeva (guasto passeggero) | Leggere intanto le consegne, riprovare più tardi; non insistere a vuoto |
| E10 | 2026 (noto) | `test-firebase-flow` fallisce tra le 23:30 e mezzanotte | La prova dipende dal giorno e scavalca la mezzanotte | Non è un guasto dell'app: rilanciarla fuori da quell'orario |
| E11 | 07/10/2026 | Push delle consegne rifiutato: «Internal Server Error» (anche dall'API) | Guasto passeggero di GitHub | Non forzare: fermarsi, far guardare a Mario githubstatus.com («Git Operations»), riprovare quando è verde |
| E12 | 07/10/2026 | Handoff: la nuova sessione non si apre («lineage depth 8, limit 8») | Dopo 8 sessioni aperte una dall'altra, Claude non può più aprirne | Consegne salvate e pushate; Mario apre a mano una sessione nuova da claude.ai/code (non da quella vecchia) e incolla il prompt di 3 righe: così la catena riparte da zero |
| E13 | 07/10/2026 | All'avvio (successo anche in RVC) ramo locale vecchio con storia diversa: «refusing to merge unrelated histories» | Il contenitore aveva un ramo locale stantio con lo stesso nome | L'hook `avvio-check.py` ora ripara da solo: rinomina il ramo stantio in `vecchio-<ramo>-<data>` (niente cancellato) e riprende il ramo da origin |
| E14 | 07/10/2026 | `test-firebase-approva-arrivi` e `test-firebase-push` rotte dalla v49 senza che le prove veloci se ne accorgessero | Il loro Worker finto non conosceva il nuovo indirizzo `/errori` | Quando si aggiunge un indirizzo al Worker, aggiornare tutti i Worker finti delle prove (`grep -l jona-notifiche tools/*.mjs`) e, dopo una versione che tocca il Worker, far girare il giro completo su GitHub (workflow «Prove automatiche», modo `tutto`) |
| E15 | 08/10/2026 | Sessione #34 partita senza il progetto: niente push né unione della PR; poi il controllo dei permessi ha bloccato ricollegamento e unione | L'handoff apriva la sessione nuova senza `source_url`; il controllo dei permessi vuole l'ok di Mario in chat | Handoff con `source_url` + `source_revision` (regola in CLAUDE.md, ok di Mario); app Claude GitHub installata da Mario su jona-ordini; per unire una PR basta che Mario scriva «unisci la PR N» |
