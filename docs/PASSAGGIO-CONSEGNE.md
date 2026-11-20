# Passaggio di consegne (2026-11-20 ~20:40 ora italiana, chiusura della #145)

Sessione chiusa: #145 (Opus 5.5; ambiente `env_01PHQTdrmzBJ65UoCn8yQSqE`; impegno vero Extra, in `settings.json` resta `medium` come scelto da Mario). La prossima è #146. Catena 2 di 8.

- **Già deciso da Mario (non richiedere)**: D58 «tutto come consiglio» (20/11 19:42): rientro da soli con nome utente e password (pezzo 3); sbloccano Maurizio, lo sviluppatore, Mauro (reparto `fb`) e chi ha l'interruttore. Regola «nessuno resta fuori» per TUTTI i progetti («Non deve mai ricapitare in nessun progetto», 20/11): scritta in E59, mandata al kit di RVC.
- **Da non rifare**: il piano e le scelte tecniche di `docs/RIENTRO.md`; la ricerca su Google nelle app installate (20/11, sotto); il codice e le prove della v121 (fatti, verdi in locale); le foto della v121 (`archivio/foto-v121/`) e le bozze del salvagente (`archivio/bozze-salvagente/`), già mandate a Mario.
- **Cosa preme a Mario adesso**: è ANCORA FUORI da Jona (foto: «Collega questo telefono»). Vuole un salvagente per ogni profilo che non dipenda dalla memoria del telefono.

## Stato
- **PR #129** (v120, memoria protetta): «prove» su GitHub in corso dalle 19:00 UTC sul commit `121ee6c` (unione della scorta, solo documenti). Sottoscritta con `subscribe_pr_activity`: la #146 si deve iscrivere di nuovo.
- **4-6 commit locali NON ancora su GitHub** (E39: niente push mentre girano le prove della PR): unione della scorta `225b22d`, **v121** `fc9b882`, foto `1553afb`, regola E59 `b6389b2`, consegne. Coperti dalla scorta automatica. Se la #146 non li trova su `origin/claude/jona-ramo-definitivo`: sono in `origin/scorta-principale/claude/jona-ramo-definitivo`, unirla.
- **v121** (D58 pezzo 2a) fatta: «Approva» chiede «Di chi è questo telefono?» (profilo già scelto se il nome coincide) → «Ricollega» scrive `membri/<uid>.sid` → il telefono entra da solo (`jona_rie`, `rieCheck` in `view`); «Profilo doppio?» per «Sono nuovo» con nome già presente; `canUnlock` (gestori, `fb`, interruttore `sblocca` nel profilo); «sempre almeno 2» (`ulKeep`); voce «Ricollega un telefono» nel menù di chi sblocca senza scheda Staff; «Ho già un profilo» pulsante principale. Dettagli in `.claude/rules/struttura.md` (riga v121) e nella voce NEWS. Regole Firestore invariate (`membro()` può già scrivere `sid`).
- Prove in locale verdi (solo Chrome): `test-firebase-rientro` NUOVA 24/24 (nelle VELOCI di `tools/prova-ci.sh`), `test-firebase-telefoni` 31/31 (aggiornata: passa da «Non lo so»), `test-news`, `test-moduli`, `test-testbar`, `test-memoria-protetta`, `test-demo`, `test-giro`. NEWS: v101 spostata in cima a `data/news.json` (E55).
- Server ed emulatori locali erano accesi in sottofondo (persi col contenitore). In locale l'emulatore va svuotato tra una prova Firebase e l'altra (come fa `prova-ci.sh`), sennò `test-firebase-telefoni` non trova la schermata iniziale.

## Ricerca 20/11/2026 (Google nelle app installate)
- `signInWithRedirect` su un dominio non Firebase (pages.dev) richiede un proxy di `/__/auth` (documentazione Firebase aggiornata 12/11/2026); `signInWithPopup` va su Android.
- iPhone/iPad con l'app dalla Home (WKWebView): Google rifiuta l'accesso nel redirect e il popup non riesce a restituire il risultato → Google NON funziona lì (Maurizio ha l'iPhone).
- Idea tecnica utile: collegare Google all'utente anonimo con `linkWithCredential` tiene lo stesso `uid` → `membri/<uid>` resta approvato con `sid`: su un telefono svuotato basterebbe entrare con Google (niente Worker). `membro()` controlla solo `membri/<auth.uid>`.
- Le password salvate nel gestore delle password di Google o iCloud NON si cancellano quando si svuotano i dati del sito: con campi `autocomplete="username"`/`"current-password"` il pezzo 3 diventa già un salvagente su tutti i telefoni.
- Passkey (impronta o viso, salvata in Google o iCloud): funziona anche su iPhone, ma va verificata dal Worker (robot del pezzo 2b).

## Domande aperte (rifarle per prime, in 2 righe, se Mario non ha risposto)
1. Mario rientra stasera con Maurizio (codice d'invito)? 1 · Sì · 2 · No, guidami da Firebase. Consiglio 1. Il suo nome utente dovrebbe essere mario.miscera.
2. Foto della v121 (4 foto mandate): 1 · Sì, online dopo la 120 · 2 · Cambia qualcosa. Consiglio 1.
3. Salvagente per tutti i profili (3 bozze mandate): 1 · Google · 2 · Password salvata dal telefono · 3 · Impronta o viso. Consiglio: 2 subito (è il pezzo 3, va su tutti i telefoni) e 3 subito dopo; Google no (non va su iPhone). La domanda NON è ancora stata scritta a Mario per intero: scriverla con «📌 Di cosa parliamo», le foto ci sono già.

## ✅ PROSSIMI PASSI (#146, continuare da sola)
1. `subscribe_pr_activity` PR #129. Esito delle prove (una volta): verde → squash (`unione-pr`), merge di `main` sul ramo, poi push dei commit locali (v121 + documenti) e PR nuova per la v121 in bozza; dire a Mario «v120 online». Rosso → capire la causa.
2. v121: con l'ok di Mario alle foto, PR pronta, «prove» verde, squash. Senza risposta: aspettare, intanto il punto 3.
3. Rifare le domande aperte (sopra). Poi D59 secondo la scelta: con il consiglio = pezzo 2b (robot) + pezzo 3 con `autocomplete` per il gestore delle password, poi la passkey.
4. Pezzo 4 di `docs/RIENTRO.md`; aggiornare il kit di Jona (installato 27.3 con Preferenze v27; Mario ha le Preferenze v38) e, a fine giornata, il testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` se più vecchio delle sue.
5. RVC ha risposto (20/11): il kit RVC è già al **47** e ha la regola «Nessuno resta mai fuori» (REGOLE.md riga 29); la sessione RVC «Accessi 6» aggiunge memoria protetta, 2 strade di rientro e la prova del telefono svuotato. Jona ha il kit 27.3: aggiornarlo (punto 4) porta anche questa regola.

## Sessione #145 in breve
- Unita la scorta della #144 (solo l'ultimo messaggio «va bene»), poi un'altra scorta vuota (in locale).
- Mario ha scritto 4 volte: foto fuori da Jona; «Non deve mai ricapitare in nessun progetto»; nome utente e salvagente. A tutte risposto; guida di 8 passi per rientrare con Maurizio.
- Controllo Da fare: 3 voci aggiunte (D59 salvagente, M47 Mario rientra, «regola da portare nel kit» nella parte 1).

## Ultimo messaggio di Mario (20/11/2026 ~20:30)
«dovrebbe essere mario.miscera
fammi loggare con Gmail come salvagente o inventati qualcosa però come regola per tutti gli account per abituare questi problemi di oggi e futuri problemi»
