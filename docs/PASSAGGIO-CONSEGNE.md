# Passaggio di consegne (2026-11-20 ~20:15 ora italiana, chiusura della #144)

Sessione chiusa: #144 (Fable per il piano, poi Opus 5.5; ambiente `env_01PHQTdrmzBJ65UoCn8yQSqE`; impegno `medium`). La prossima è #145.

- **Già deciso da Mario (non richiedere)**: D58 «tutto come consiglio» (20/11 19:42): rientro da soli con nome utente e password (pezzo 3); possono ricollegare i telefoni Maurizio, lo sviluppatore, **Mauro** e chi ha l'interruttore «Può ricollegare i telefoni» nel profilo (pezzo 2a). Riga «Telefono» nella scheda della persona: approvata («va bene», FOTO `docs/img/v120/scheda-telefono.png`). Regola di Mario per tutti i progetti: **nessuno deve mai restare bloccato fuori dall'app**. Ragionare con Fable, costruire con Opus (Mario: «fermati il lavoro pesante che ragioniamo con Opus per risparmiare token»).
- **Da non rifare**: il piano e le scelte tecniche di `docs/RIENTRO.md` (chiuse da Fable: «telefono del server», un solo modo di entrare, prove); la ricerca su `navigator.storage.persist` (fatta il 20/11: Chrome e Safari decidono da soli senza chiedere, Chrome concede di solito all'app installata sulla Home; Firefox mostra un riquadro); la v120 (pezzo 1, fatta e provata); unire le scorte del 23/10 (unite).
- **Cosa preme a Mario adesso**: D58 🔴 urgenza: che nessuno resti fuori. Il suo Xiaomi è uscito da Jona e da RVC (Chrome ha perso la memoria dei siti, non è il codice).

## Stato
- **PR #129** (v120, pezzo 1: memoria protetta + riga «Telefono») segnata pronta il 20/11 ~20:10: «prove» su GitHub in corso sull'ultimo commit `9cc8eb9` (il commit delle consegne è solo documenti). Verde → squash (titolo corto, `commit_message` corto, E54), poi merge di `main` sul ramo. Rosso → capire la causa, correggere, rifare il giro.
- Prove in locale verdi (solo Chrome): `test-memoria-protetta` (nuova, nelle veloci), `test-firebase-telefoni`, `test-moduli`, `test-news`, `test-testbar`, `test-giro`. La v100 delle novità spostata in `data/news.json` (E55).
- Mario: non so se è già rientrato in Jona (gli ho dato i 6 passi: codice d'invito da Maurizio → **Ho già un profilo** → Maurizio approva → nome utente e password). Se scrive che è bloccato: guidarlo da Firebase come il 07/10 (DA-FARE M14).
- Dal server il suo profilo non l'ho potuto controllare (nessuna chiave di Firebase nel contenitore); dal codice: profilo e dati sono sul server, legati al profilo, il telefono svuotato non li tocca.

## ✅ PROSSIMI PASSI (#145, continuare da sola)
1. Esito della PR #129 (una volta, con `pull_request_read` `get_check_runs`): verde → squash e merge di `main` sul ramo; dire a Mario «v120 online».
2. **Pezzo 2a** di `docs/RIENTRO.md` (solo app): «Ricollega» con scelta del profilo in «Telefoni da approvare» (`phApprove(id,sid)` scrive `sid`; `approval()` → `st.entra`; `rieCheck()` in `render` → `login(sid)`), avviso doppione per «Sono nuovo» con lo stesso nome, «Ho già un profilo» pulsante principale, `canUnlock(u)=isMgr(u)||u.reparto==='fb'||!!u.sblocca` (Mauro = reparto `fb`; interruttore nel profilo), «sempre almeno 2» in `sdel`/`stoggle`/`psaveProfile`/`endSeason`, voce in `meMenu` per chi sblocca senza scheda Staff. Prova `tools/test-firebase-rientro.mjs` parti A, D, E. Foto a Mario prima di andare online.
3. **Pezzo 2b** (Worker «telefono del server» + codice di rientro), poi **pezzo 3** (rientro da soli), poi **pezzo 4**: tutto scritto in `docs/RIENTRO.md`. Ogni pezzo = una versione, prove, foto, PR.
4. Dopo D58: aggiornare il kit di Jona (installato 27.3 con Preferenze v27; Mario ha le Preferenze v38) e mandare a Mario a fine giornata il testo di `docs/kit-progetto/PREFERENZE-CHAT.txt` se più vecchio delle sue (regola dell'hook).
5. Poi i passi vecchi (bolla vera dal Controllo merce, M44), vedi `docs/DA-FARE.md`.

## Sessione #144 in breve
- Letto come Jona lega telefono e profilo (`jona_key`, accesso anonimo `membri/<uid>`, `jona_me`; `screenJoin`, `screenPhone`, `phApprove`, `fbJoinKey`, inviti v30/v40, Worker `membro`/`invCrea`/`invLeggi`/`richiesta`).
- Piano D58 in `docs/RIENTRO.md`, voce 🔴 D58 in `docs/DA-FARE.md`, lezione E59 in `docs/ERRORI.md` e `ERRORI-STORIA.md`.
- v120: `mpAsk` in `boot`, `mpSave` in `render` (`membri/<uid>` {mp, visto, sid}, ogni 20 ore), `mpRow` nella scheda del profilo, `status().uid`; riga in `.claude/rules/struttura.md`.
- Server locale ed emulatori avviati in sottofondo (persi col contenitore): `python3 -m http.server 8765` e `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Controllo Da fare: 0 voci aggiunte (D58 già scritta; la richiesta «aggiorna il kit» è nei prossimi passi).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`, `model` `claude-opus-5-5`.
- Sessioni: #144 `session_01WTjqUuhyPadg3fSaD15EQe` (questa), #142 `session_01NZxnf2nfrCUMQYNZLJHtYL`.
- RVC: la causa è stata trovata lì (telefono svuotato, profilo sul server intatto); i blocchi di RVC sono il modello di D58.

## Ultimo messaggio di Mario, parola per parola
«va bene» (risposta 1 alla domanda sulla riga «Telefono»: la metto online e passo al pezzo 2). Prima: «tutto come consiglio».
