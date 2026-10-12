# Passaggio di consegne (2026-10-12, fine sessione #93)

Sessione attuale: #94

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v88**. **PR #99 (v89) aperta**, da unire appena il controllo `prove` è verde.

## ✅ SUBITO (#94)
1. **PR #99 (v89, D39 disegni del Bar)**: aspettare il controllo `prove` (minuscolo, E33) sull'ultimo commit del ramo. Se verde → squash merge da solo (regola «pubblica sempre in automatico»), controllo online (`APP_VER=89` su https://jona-ristorante-by-ynoy-corp.pages.dev/ ), poi `git fetch origin main && git merge origin/main` sul ramo e push normale. Se rosso → capire la causa (E41: prove a mezzanotte? usare `tools/ora-fissa.mjs`). Mentre `prove` gira NON fare push sul ramo (E39). Dire a Mario in 2 righe che v89 è online.
2. Poi D33 (sotto): proposta con immagine e 3 strade.
3. Guardare il giro delle prove del lunedì (3:17): se rosso, priorità.

## Fatto in #93 (12/10, ~0:55-1:40 ora italiana)
- Avvio: scorta unita due volte (conflitto solo sull'intestazione di `docs/ULTIMO-MESSAGGIO.md`, tenuta la più nuova). Push confermati.
- Mario ha detto «vai»: rimandata l'immagine `docs/img/sessione-91/d39-stili.png`, domanda a tocco con doppio tocco. **Scelta: B · Inchiostro e acquerello, confermata** («Sì, confermo lo stile»). Ripetuta in chiaro nel testo (E38).
- **D39 fatto, v89** (commit `4d88b2a`, PR #99):
  - `tools/bar-disegni.mjs` → `data/bar-disegni.json` (43 disegni, 91 regole, 26 KB) e `tools/bar-disegni-anteprima.html` (foglio con tutti i disegni grandi e a 44 px). Disegni: lime, limone, arancia, pompelmo (fetta rosa a 10 spicchi), ananas, mirtillo, fragola, pesca, ciliegia, melograno, pomodoro, cocco, mela, passione, uva, cetriolo, peperoncino, oliva, menta, cannella, fiore, zucchero, miele, sciroppo, uovo, panna, caffe, soda, acqua, ghiaccio, sale, bitter, gin, vodka, rum, agave (tequila/mezcal), whisky, brandy, liquore (bottiglia tonda, colore dalla regola), bottiglia (aperitivi/vermouth/amari), vino, spumante, birra.
  - Principio delle regole: alcolici → bottiglia o bicchiere (colore secondo il prodotto), analcolici → frutto/oggetto. Prima regola che corrisponde vince (es. «cherry brandy» e «crema di whisky» prima di brandy/whisky). Senza regola: liquore se alcolico, acqua se no.
  - index.html: `brDisLoad` (fetch all'apertura del Bar e in `brShowC`, inietta una volta `<svg id="br-defs">` con il filtro `#br-wash`), `brDisK`, `brDis(nome,alc)`. Scheda del cocktail: `.br-ing.br-carta` (carta chiara anche nel tema scuro, testo #2a2420, margine rosso a 60 px), disegno 44 px per ingrediente. Inventario: `.lbl.br-gl` con disegno 30 px (linee `var(--ink2)`, così si vedono nel tema scuro). `html.lite` spegne il filtro e i puntini della carta.
  - sw.js: `CACHE` `jona-ordini-v93`, `./data/bar-disegni.json` in `FILES`. Il deploy copia già tutta `data`.
  - `APP_VER=89`, NEWS v89 «Bar: ingredienti disegnati», riga v89 in CLAUDE.md, D39 aggiornata in `docs/DA-FARE.md`.
  - Prova `tools/test-bar-disegni.mjs` (24 PASS; ogni ingrediente di `cocktail.json` e ogni tipo di `BR_CAT` ha una regola; lite spegne l'acquerello; tema scuro; file mancante con `serviceWorkers:'block'` → lista di prima senza errori). Aggiunta a `VELOCI` in `tools/prova-ci.sh`.
  - Verdi in locale: test-bar-disegni, test-bar, test-news, test-demo, test-leggera, test-giro.
  - Foto mandata a Mario: Negroni, Mojito, inventario, chiaro e scuro (rifarla: demo → Fornitori → Bar → cerca nel campo `#brq`).

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. Unire PR #99 (sopra).
2. D33 (funzioni smart per orari e agenda): proposta con immagine + 3 strade (sotto). È una scelta di Mario: domanda a tocco con doppio tocco, ripetendo in chiaro la scelta prima di costruire (E37/E38).
3. Idee per il Bar (da proporre solo se utili): «Cocktail della casa» (ricette del bartender, con disegni già pronti), costo del cocktail dal prezzo delle bottiglie (come le ricette), foto della bottiglia letta dall'IA per aggiungerla.
4. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura.

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = lo staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima; il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #93 `session_01Q2KYN7TKMEbWP23X6HfPYB` (chiusa), #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj`, #90 `session_01MAqfbJ8neGEZiNgRVBCjCA`, #89 `session_01Y1ek4ZACQwmsRsQn8vWqyn`, #88 `session_0199ANgsgVouZX79Xd7QJFZX`, #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
«vai»
(12/10/2026 ~0:55 ora italiana, in #93, in risposta a «vuoi che ti rimandi l'immagine dei 3 stili?»). Poi, a tocco: stile **B Inchiostro**, «Sì, confermo lo stile». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
