# Passaggio di consegne (2026-10-12, fine sessione #92)

Sessione attuale: #93

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v88** (controllato `APP_VER=88` su https://jona-ristorante-by-ynoy-corp.pages.dev/ ). Nessuna PR aperta.

## ✅ SUBITO (#93)
1. Niente di bloccante. Guardare il prossimo giro delle prove del lunedì (3:17): se rosso, priorità.
2. **D39 disegni degli ingredienti del Bar**: si aspetta la scelta di Mario sullo stile (immagine `docs/img/sessione-91/d39-stili.png`, sorgente `tools/d39-stili.html`): A matita colorata, **B inchiostro e acquerello (consigliato)**, C linea unica. Chiedere a tocco con doppio tocco se non ha risposto, poi costruire solo quello scelto (riga D39 in `docs/DA-FARE.md`).
3. Poi D33 (sotto): proposta con immagine e 3 strade.

## Fatto in #92 (12/10, ~0:15-0:55 ora italiana)
- Scorta unita all'avvio (conflitto su `docs/ULTIMO-MESSAGGIO.md`: tenuto il messaggio più nuovo, quello della scossa).
- **E41 risolto**: le prove rosse della PR #97 (`test-agenda-v59` «Settimana: domani mostra 1 appunto», `test-richieste-gestite` «Gestite: Oggi poi Ieri» e «3 giorni») erano girate alle 0:00 in punto (22:00 UTC). Causa: la prova calcola oggi/domani all'inizio e il giorno cambia a metà; `now-60000` subito dopo mezzanotte cade in «Ieri». App giusta. Nuovo `tools/ora-fissa.mjs`: `await oraFissa(ctx)` sostituisce `Date` nella pagina in modo che parta alle 12:00 di oggi e poi scorra normale. Usato nelle due prove. Riprodotto il fallimento spostando l'ora a 23:59:52 e 0:00:20 (stessi FAIL di GitHub), verde a mezzogiorno. Riga E41 in `docs/ERRORI.md`. Da usare in ogni prova nuova con giorni/settimane.
- **PR #97 (v86+v87) unita** (squash `b0133e0`), v87 online. Titolo aggiornato «v86-v87: app più leggera, apertura pulita».
- **D40 fatto, v88** (PR #98, squash `04d9f3c`, online): video di confronto `docs/img/sessione-92/d40-confronto.mp4` (Attuale | A Ovvia | B Furba micro-zoom | C Geniale colpo+zoom+ombra ai bordi; velocità vera poi rallentato ×4; script `tools/colpo-d40.mjs`). Mario ha scelto a tocco **A Ovvia** (confermata col doppio tocco). Ora `jShake` = `0%,100% none; 20% translateY(4px); 48% translateY(-1px); 74% translateY(.4px)`, `.intro .splash{animation:jShake .34s .55s cubic-bezier(.25,.6,.3,1) both}`. `APP_VER=88`, `CACHE` `jona-ordini-v92`, NEWS v88 «Colpo dell'apertura più elegante», riga v88 in CLAUDE.md. Prova nuova in `tools/test-apertura-v62.mjs`: da 560 a 960 ms ogni 40 ms la traslazione orizzontale è 0, verticale tra -1,5 e 4,5, massimo >2,5, a 960 ms ferma.
- Vibrazione del telefono al colpo: NON fatta. Chrome blocca `navigator.vibrate` senza un tocco dell'utente, e all'apertura non c'è. Detto a Mario.
- Mario ha chiesto se Context7 è installato: sì (`.mcp.json`, strumenti attivi). Risposto.
- Dopo ogni squash: main identico al ramo (controllato con `git diff`), quindi unito con `git merge` tenendo il ramo, poi push normale.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. D39 dopo la scelta di Mario.
2. D33 (funzioni smart per orari e agenda): proposta con immagine + 3 strade (sotto). È una scelta di Mario: domanda nel testo (E38).
3. Idee per il Bar (da proporre solo se utili): «Cocktail della casa» (ricette del bartender), costo del cocktail dal prezzo delle bottiglie (come le ricette), foto della bottiglia letta dall'IA per aggiungerla.
4. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura (i tempi su GitHub cambiano).

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = lo staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima; il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #92 `session_01XEe2wGYr9SNdFKhqLniFbG` (chiusa), #91 `session_01DWN2LgoPJUedg9xmjS3opj`, #90 `session_01MAqfbJ8neGEZiNgRVBCjCA`, #89 `session_01Y1ek4ZACQwmsRsQn8vWqyn`, #88 `session_0199ANgsgVouZX79Xd7QJFZX`, #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: **#09** `session_011dYniwuL2fEfLGEsTVRWrp` (nomi da ricontrollare con `list_sessions` prima di mandare messaggi).
- Ponte con l'hotel: RVC dice che **D5 non è fatto**. M42 5stelle: si aspettano le risposte della reception (in RVC).

## Note tecniche
- Foto per Mario (script persi con lo scratchpad, si rifanno in 2 minuti): Playwright `createRequire('/opt/node22/lib/node_modules/')`, `deviceScaleFactor:2`: `/#demo` → `[data-a="demoGo"]` → `nav [data-a="tab"][data-v="fornitori"]` → `main [data-a="brOpen"]` / `main [data-a="vnOpen"]`; schede Cantina `.sheet [data-a="vnV"]`, Bar `[data-a="brV"][data-v="inv"]`; riga Negroni = `getByText('Gin · Campari · Vermouth rosso')`. Tema scuro: `document.documentElement.dataset.theme='dark'`.
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (java c'è).
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare (per questo l'attesa con la scatola nera).
- URL del Drive: se finisse in un file pubblico, Mario fa un nuovo deployment.

## E38 (aperto)
Risposte a tocco arrivate senza che Mario toccasse (#85). Finché non è chiaro: domande scritte nel testo, risposta a parole.

## Ultimo messaggio di Mario, parola per parola
«hai installato context 7?»
(12/10/2026 ~0:40 ora italiana, in #92). Già risposto: sì.
Prima, a tocco: scossa «A Ovvia», confermata. Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
