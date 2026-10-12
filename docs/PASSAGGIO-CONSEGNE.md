# Passaggio di consegne (2026-10-12, fine sessione #98)

Sessione attuale: #99

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 online** (PR #101). **v92 (D42) NON ancora pubblicata.**

## ✅ SUBITO (#99)
0. **Aiutante nuovo (richiesta di Mario a fine #98, «valuta tu»)**: decisione presa in #98 = agente **`collaudo`** in `.claude/agents/collaudo.md` (come `ottimizza.md`). Perché: le sessioni si riempiono soprattutto con i risultati delle prove, delle foto e delle attese di GitHub (#98 è arrivata a 255k token e ha dovuto chiudere a metà lavoro). Cosa fa, in background, rispondendo SOLO con un riassunto corto (PASS/FAIL, la riga d'errore, il file:riga): (a) fa girare le prove legate + `test-giro` (server 8765 acceso da sé), anche con `TZ=Europe/Rome` (E18); (b) per i disegni: griglia HD con `tools/bozze/griglia-cocktail.mjs`, guardata da lui su una copia piccola, dice cosa non va; (c) dopo la PR aspetta il controllo `prove` su GitHub (E33: nome minuscolo) e riferisce verde/rosso con la causa. Non fa push, merge né modifiche al codice (resta alla sessione principale). Scartati: agente che pubblica da solo (rischioso: squash e merge restano a chi ha il contesto), più agenti insieme (più token). Dopo averlo creato: chiedere a Mario a tocco + doppio tocco «La mando anche a RVC e SPA Sensorial?» (regola REGOLE PER TUTTI I PROGETTI) e scriverlo in CLAUDE.md (Regole di lavoro) e in `docs/DA-FARE.md`.
1. **Guardare lo spunto di Mario** `docs/img/sessione-98/spunto-cocktail-mario.jpg` (arrivato a fine #98: «vedi ad esempio questi per prendere spunto che dettagli e carini»). Cosa piace lì e cosa si può prendere nel nostro stile SVG 64×64:
   - ghiaccio come tanti cerchietti/bolle chiare dentro il liquido (non solo 2 cubi), contorni del vetro azzurrini e sottili;
   - guarnizioni GRANDI e colorate che escono dal bicchiere (lime grande sul bordo, foglie di menta grandi, ciliegina con gambo lungo + pezzo d'ananas + foglia sopra il bicchiere, cannuccia rossa);
   - frutta dentro il bicchiere ben visibile (spicchi di lime nel Mojito);
   - superficie del drink chiara e «schiumosa» (margarita), bordo di sale fatto a crosta;
   - colori pieni e vivi (rosa del Cosmopolitan, arancio, ambra), ciliegia con riflesso.
   Proposta: ingrandire le guarnizioni del bordo (scala ~1,4), contorno del vetro con linea più fine nella scheda grande, bollicine/ghiaccio più «disegnati». Prima di costruire: 1 immagine con prima/dopo di 4-6 cocktail e domanda a tocco + doppio tocco (E19: per il gusto prima bozza, poi costruzione).
2. **Finire D42 e pubblicare v92**: girare `node tools/test-bar-disegni.mjs` (server `python3 -m http.server 8765` acceso; la prova NON è ancora stata fatta dopo le modifiche di #98: le parti nuove della prova potrebbero dover essere sistemate), poi `test-news`, `test-giro`, aggiornare la voce NEWS v92 e la riga v92 in CLAUDE.md (testo sotto), PR dal ramo unico, squash, controllo online, merge di main nel ramo. Pubblicare in automatico se verdi (regola PUBBLICA SEMPRE IN AUTOMATICO), mandando a Mario la foto HD della griglia.
3. Testo NEWS v92 da completare: «I cocktail del Bar hanno disegni più belli: vetro con i riflessi, cubetti di ghiaccio, menta con le venature, fette di agrumi con gli spicchi.» / «Aprendo un cocktail lo vedi in grande, come un acquerello: colore che sfuma e goccioline di freddo.» + «Ogni cocktail ha la sua guarnizione vera (ombrellino, ananas, sedano, scorza a spirale…) e si vede cosa c'è dentro: schiuma dei sour, strati, frutta.»

## Fatto in #98 (12/10, ~9:00-9:35) — D42 passo 2 «meno foto simili, inerenti al cocktail» (committato, NON pubblicato)
- `tools/bar-disegni.mjs` (blocco «D42 passo 2» tra `// dettagli dei bicchieri` e `// macchia d'acquerello`, e nuovo `cocktail()`):
  - `geo(bk)` geometria (bordo, superficie, fondo `YB`), `COPPA` (ciliegina sul fondo in coppe/flûte/calice).
  - Guarnizione letta frase per frase (`gTipo`): si prende solo la PRIMA alternativa prima di « o » (Dry Martini oliva, Vodka Martini scorza), frasi divise da «,» e « e ». Pezzi nuovi: `wedge` (spicchio ≠ fetta), `cherry`, `pine` (ananas con foglie), `strawb`, `appleFan`, `twist` (scorza = nastro calcolato con `ribbon`), `flame` (scorza fiammata), `spiral` (Horse's Neck), `umbrella` (Tiki/Hurricane solo con rum/ananas/cocco/passione), `foam`/`foamTall` (sour con albume, Ramos), `dome` (frullati), `steam` (tazze calde), `dust`, `flakes` (cocco, cioccolato), `angoDrops` (Pisco Sour), `passion`, `berry` (more/lamponi), `pick` (stecchino con olive, cipolline, uva, mirto, zenzero, ciliegina), `flower` (gardenia), `cuke`, `celery`, `chiliRings`, `chips` (Sangria), `sugarCube` (Champagne Cocktail), `seeds` (melograno), `grains` (zucchero di canna), `shotIn` (Jägerbomb), `cinnamon`, panna montata (Bombardino), «fetta e ciliegina» = bandierina (`flag`).
  - Strati `LAY` (Tequila Sunrise, B-52, Baby Guinness, Slippery Nipple, Black Velvet, Dark 'n' Stormy, White Russian, New York Sour, Shirley Temple, Roy Rogers, Sex on the Beach, Bay Breeze), colori a mano `COLX`, schiume colorate `SCHIUMA`, drink cremosi `CREMA` (liquido più pieno).
  - Pezzo nuovo `q` = acquerelli RITAGLIATI sulla forma del liquido (strati, schiuma con linea ondulata `wavy`).
  - Colori: in `mix` succo di lime/limone quasi trasparente, crema/latte di cocco bianco, quantità «top» = 10 cl (prima la cola contava pochissimo: Batanga era verde). `separa()`: nello stesso bicchiere colori troppo vicini (ΔE Lab < 13) si allontanano di max 11 punti. Tazze Tiki di colori diversi (`TIKI`, in `b.Tiki` niente più `op`).
  - Misura `somiglia` (stesso bicchiere: ΔE + 12 per pezzo diverso; < 10 = troppo simili) → oggi **0 coppie**. Gemelli rimasti: colore spostato fino a 20, poi etichetta del distillato (oggi nessuna). `node tools/bar-disegni.mjs --simili` stampa le coppie; `--col Nome…` stampa i colori.
  - **Peso**: guarnizioni del bordo salvate una volta intorno a (0,0) e richiamate con `chiave@x,y` → 28,6 KB compressi (limite prova 30 KB; prima di questo era 33,8).
- `index.html`: `brMove(p,t)` (sposta un pezzo con `translate`), `brCkDis` capisce `id@x,y` e i pezzi `q` (`<clipPath id="br-lq<N>">` con la forma del liquido, disegnati dopo la superficie).
- `tools/test-bar-disegni.mjs`: `pid()` toglie `@x,y`; Negroni ora `/^g\|aranciaM@/`; controlli nuovi: nessuna coppia troppo simile, 28 «cocktail famosi con il loro segno» (`SEGNI`), tazze tiki diverse, Negroni con pezzo spostato (`translate`). **Da far girare.**
- `tools/bozze/griglia-cocktail.mjs`: foto della griglia di tutti i cocktail (`DSF=2`, `SOLO=Nome,Nome`, larghezza). Foto: `docs/img/sessione-98/d42-griglia-pezzo.png` (prima riga).
- Perché così: Mario voleva cocktail meno simili e «inerenti»: invece di etichette o numeri, ogni drink mostra la guarnizione scritta nella ricetta e cosa c'è dentro (strati, schiuma, frutta); i colori si separano poco per restare credibili. Scartato: etichetta tonda del distillato su tutti (sui bicchieri trasparenti sembrava un adesivo strano).

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
- Jona #98 `session_01PgAxZzTSbFoVtpzVYVdnxK` (chiusa), #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~9:40 ora italiana, #98) «se ti aiuta aggiungi un aiutante per il tuo progetto e valuta tu cosa fargli fare per ottimizzare al meglio tutto tempi e qualità» → punto 0 di SUBITO.
Prima (#98, ~9:35, con l'immagine `docs/img/sessione-98/spunto-cocktail-mario.jpg`: 6 cocktail disegnati a mano e acquerellati) «vedi ad esemlio questi per prendere spunto che dettagli e carini». Prima ancora (#97): «Cerca di mettere meno foto (png) simili possibili e falle inerenti al cocktail». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
