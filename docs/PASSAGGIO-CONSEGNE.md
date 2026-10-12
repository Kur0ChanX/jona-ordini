# Passaggio di consegne (2026-10-12, fine sessione #97)

Sessione attuale: #98

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 unita** (PR #101, `630ad48`).

## ✅ SUBITO (#98)
1. **D42 cocktail più dettagliati: lavoro a metà, NON pubblicato.** Scelta di Mario #97 (tocco + conferma): **«A lista + B scheda»** (lista con i dettagli; scheda grande illustrata). Fatto e committato (commit «D42 in corso»):
   - `tools/bar-disegni.mjs`: blocco nuovo da `// guarnizioni` a `cocktail()`: `joinX`, `iceC` (cubetti con facce), `wheel` (agrumi con spicchi, mezza fetta d'arancia se «mezza/spicchio»), `leafX`/`sprig` (menta con venature), `bean` (chicchi), `DET` (per ogni bicchiere: `h` riflesso, `sh` ombra, `f` linee fini, `bot` fondo, `dr` goccioline), `splash` (macchia), gambo con 2 linee fini, bordo di sale/zucchero a cristalli (metà se «metà»), menta pestata nel bicchiere (`ml|`), bollicine con contorno, ghiaccio tritato (`it|`). `data/bar-disegni.json` rigenerato (~27,7 KB compressi, limite prova 30 KB).
   - `index.html`: `brTinta`, `BR_LG`, nuovo `brCkDis` (lista = dettagli; scheda senza `cl` = sfumatura `linearGradient` `br-lg<N>`, macchia, goccioline) e CSS `.br-ck .ink.br-f`, `.br-h`, `.br-sh`, `.br-dr` dopo `.br-ckd .wa{filter:none}`.
   - `tools/test-bar-disegni.mjs`: 6 controlli nuovi (tutti verdi, 57 PASS).
   - Già fatti anche: APP_VER 92 + voce NEWS v92, `CACHE` di sw.js v96, riga v92 in CLAUDE.md. **Mancano** (Mario ha interrotto qui): punto 2, poi aggiornare NEWS/CLAUDE.md, `test-news`, `test-giro`, PR e pubblicazione.
2. **Richiesta nuova di Mario (ultimo messaggio)**: «Cerca di mettere meno foto simili possibili e falle inerenti al cocktail». Oggi molti cocktail si somigliano (stesso bicchiere + stesso colore + stessa fetta di lime/limone sul bordo, es. Gin Lemon/Gin Fizz/Tom Collins, Screwdriver/Harvey Wallbanger, coppette sour tutte con lime+ciliegina). Da fare PRIMA di pubblicare:
   - guarnizione vera di ogni cocktail (leggere `gu` in `data/cocktail.json`): ombrellino tiki, foglia/fetta d'ananas, cetriolo a nastro, rametto di rosmarino, sedano, stecca di cannella, fragola, more, ciliegina sul fondo, scorza a spirale, chicchi, noce moscata sulla schiuma ecc.;
   - cosa c'è DENTRO: schiuma bianca dei sour (albume) con gocce di angostura, strati (B-52, Tequila Sunrise sfumata rossa in basso, Black Velvet, Irish coffee panna), crema, foglie/frutti pestati, fette nel bicchiere (Pimm's, Sangria), peperoncino, ecc.;
   - colori più distinti tra cocktail dello stesso bicchiere;
   - prova nuova in `test-bar-disegni`: misurare la somiglianza (es. stesso bicchiere + colore vicino + stessi pezzi → max N coppie) e una lista a mano dei cocktail «famosi» col loro segno (Tequila Sunrise strati, Piña Colada ananas, Whiskey Sour schiuma…).
   - Poi foto HD a Mario (griglia di tutti, `deviceScaleFactor:2`) e domanda a tocco + doppio tocco prima di pubblicare? No: scelta già fatta, pubblicare in automatico se le prove sono verdi (regola PUBBLICA SEMPRE IN AUTOMATICO), mandando la foto.
3. Testo pronto per NEWS v92: tutti: «I cocktail del Bar hanno disegni più belli: vetro con i riflessi, cubetti di ghiaccio, menta con le venature, fette di agrumi con gli spicchi.» / «Aprendo un cocktail lo vedi in grande, come un acquerello: colore che sfuma e goccioline di freddo.» (+ «ogni cocktail con la sua guarnizione vera» quando fatto il punto 2).
4. Script foto (scratchpad perso): Playwright demo → Fornitori → `main [data-a="brOpen"]`; griglia di tutti: `await brCk()` poi `brCkDis(c)` dentro `.br-ckbig`, togliere `lite` da `<html>`. Bozze: `tools/bozze/cocktail-d42.mjs`, immagine `docs/img/sessione-97/d42-cocktail-dettagli.png`.
5. v91 confermata online (APP_VER=91) in #97. Giro completo del lunedì: se il cron non parte neanche il 19/10, scriverlo in ERRORI.md.

## Fatto in #97 (12/10, ~8:40-9:30)
- Scorta più vecchia unita due volte con `-s ours` (avvio e dopo il riavvio della sessione).
- Bozze D42 (Oggi / A Più dettagli / B Illustrazione) → Mario: «A lista + B scheda», confermato. DA-FARE D42 aggiunta.
- Costruzione D42 (punto 1 sopra).

## Fatto in #96 (12/10, 7:58-8:30 ora italiana)
- Avvio: scorta vecchia unita con `-s ours` (conteneva solo il prompt di avvio salvato per sbaglio come messaggio di Mario).
- **E43**: `scorta.py` salta i testi che iniziano con `git fetch origin claude/` (prompt dell'handoff); prova 3c-quinquies in `tools/test-scorta.py` (26 controlli verdi).
- `APP_VER=90` confermata online; giro completo lanciato a mano (workflow_dispatch, `tutto`, `main`).
- **D33**: immagine 3 strade `docs/img/sessione-96/d33-tre-strade.png`. Mario ha risposto a mano: «Decide mauro per la sala e maurizio per la cucinacosa fare e quando, lo staff non decide quando non andare ecc» → tolta la strada «Non posso» dello staff (regola: i giorni liberi li decidono Mauro per la sala e Maurizio per la cucina). Seconda domanda → scelta «Avviso coperti/persone», confermata.
- **v91** (PR #101, commit `bb1af20`): `orCop`/`orCopH`/`OR_SRV`/`orMed` in index.html prima di `vOrari`; riquadro `.or-cp` (azzurro = ok, ocra = avviso) dopo `orOggi()`, solo settimane da quella corrente e con la funzione agenda accesa. Pranzo = eventi con ora <17, cena ≥17, senza ora = tutto il giorno. Persone che servono = mediana delle persone dei giorni senza coperti della stessa settimana (per reparto e servizio, giorni chiusi esclusi) × (normale+coperti)/normale, arrotondato su. Senza `config/app.copNorm` campo «Coperti in un giorno normale» (`orCn`, `orCnSave`). Reparto «altro» escluso. NEWS v91 (chef, fb), `CACHE` v95, CLAUDE.md riga v91, DA-FARE D33 aggiornata. Prova `tools/test-orari-coperti.mjs` (15 controlli, anche con `TZ=Europe/Rome`, usa `oraFissa`), aggiunta alle VELOCI di `prova-ci.sh`. Verdi in locale: test-orari-reparto, test-orari-resp, test-giro, test-news. Foto `docs/img/sessione-96/v91-coperti.png`.
- Perché la mediana dei giorni normali e non un numero fisso «coperti per persona»: non chiede altri numeri a Mauro/Maurizio e si adatta da sola a come fanno gli orari.
- D33 restano (da proporre solo quando serve): promemoria del turno via push; «Proponi la settimana» (bozza automatica, senza indisponibilità dello staff).

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite. Fino alla risposta resta «− Venduta».

## Prossimi lavori
1. SUBITO sopra.
2. Idee per il Bar (solo se utili): «Cocktail della casa», costo del cocktail dal prezzo delle bottiglie, foto della bottiglia letta dall'IA.
3. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura.

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #97 `session_012kt4UwsGjC3SCruV9oiyM6` (chiusa), #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~9:30 ora italiana, #97, interrompendo la pubblicazione) «Cerca di mettere meno foto simili possibili e falle inerenti al cocktail»
Prima, a tocco: «A lista + B scheda (Consigliato)» + «Sì, confermo lo stile». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
