# Passaggio di consegne (2026-10-12, fine sessione #99)

Sessione attuale: #100

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 online** (PR #101). **v92 (D42) NON ancora pubblicata.**

## ✅ SUBITO (#100)
1. **Costruire lo stile C** (scelta di Mario #99 a tocco + conferma: «Non bellissime fai la C mi accontento....»). Modello pronto: la bozza `tools/bozze/cocktail-spunto.mjs` (colonna C), foto `docs/img/sessione-99/d42-spunto-1.png` e `-2.png`. Da portare nel vero (`tools/bar-disegni.mjs` → `data/bar-disegni.json`, `index.html` `brCkDis`/`brMove` + CSS):
   - **Vetro e ghiaccio a parte**: nei pezzi `i|` (cubetti), `it|` (tritato), `b|` (bollicine), `fr|`, `cu|` le linee `d`/`f` diventano `vd`/`vf` (farlo nel generatore; la bozza lo fa sul JSON). In `brCkDis`: `<g class="ink br-v">${B.d+all('vd')}</g><g class="ink br-v br-f">${(B.f||'')+all('vf')}</g><g class="ink">${all('d')}</g><g class="ink br-f">${all('f')}</g>` (oggi è un solo gruppo `ink` + `ink br-f`). Controllare prima che `fr|`/`cu|` siano davvero ghiaccio/vetro.
   - **Tratto fine in pixel dello schermo**: `.br-ck .ink,.br-ck .ink *{vector-effect:non-scaling-stroke}` (SOLO `.br-ck`: i disegni degli ingredienti `.br-gl` restano come sono). Scheda grande (bozza a 112 px, app `.br-ckbig .br-dis` 128 px: forse +10%): penna 2.1px, fine 1.1px, vetro `#6f9ea6` 1.9px, vetro fine `#8db5bb` 1px. Lista `.br-ckd` (44 px): penna 1.25px, fine .7px, vetro `#4d7f87` 1.2px. Nella bozza serve `!important` perché i pezzi hanno `style="stroke-width:…"` dentro (`sw()` del generatore): meglio togliere quegli stili nel generatore per i cocktail. **Tema scuro**: `--ink2` è chiaro → scegliere un azzurro del vetro che si veda sullo scuro (variabile CSS, es. `--vetro`).
   - **Colori più pieni**: funzione `viv()` della bozza (HSL: saturazione ×1,6 +0,1; luce −0,05 se >0,78, altrimenti ×0,97) nel generatore sul colore del drink `k[1]` PRIMA di `separa`/`somiglia` (rifare la misura: la prova vuole 0 coppie troppo simili). Sfumatura della scheda `brTinta(col,255,.4)` → `.18`.
   - **Guarnizioni del bordo ×1,35**: `brMove` con `translate(x y) scale(1.35)` (con il tratto non-scaling lo spessore non cresce). Controllare che non escano troppo nella lista (righe `.br-r`) e in alto nella scheda.
   - **Peso**: oggi 29.001 byte compressi, tetto della prova 30 KB. Lo stile C cambia poco il JSON; se si supera, alleggerire (non alzare il tetto senza motivo).
   - Poi: prove con l'aiutante (`subagent_type: collaudo`: test-bar-disegni anche TZ Roma, test-bar, test-news, test-giro chiaro/scuro), griglia dei 212 a fasce leggibili (`tools/bozze/griglia-cocktail.mjs`, foto «1 di N»), testo NEWS v92 (sotto) + riga v92 in CLAUDE.md (aggiungere lo stile C), `APP_VER`, `CACHE` in sw.js, PR dal ramo unico, squash, controllo online, merge di main nel ramo. Pubblicare in automatico se verdi.
   - Mario NON è entusiasta («non bellissime… mi accontento»): dopo la v92, regola SOLUZIONE SMART → proporre UNA strada più ambiziosa per renderle «bellissime», prima con bozza ferma e domanda a tocco (E19). Spunti dalla sua immagine non ancora presi: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati (non neri), tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.
2. **Chiedere a Mario** a tocco + doppio tocco: «L'aiutante collaudo lo mando anche a RVC e SPA Sensorial?» (regola REGOLE PER TUTTI I PROGETTI). Se sì: `send_message` alle sessioni attive (nomi con `list_sessions`), con il file `.claude/agents/collaudo.md` da adattare (percorsi, prove).
3. Testo NEWS v92: «I cocktail del Bar hanno disegni più belli: colori vivi, vetro sottile, cubetti di ghiaccio, menta con le venature, fette di agrumi con gli spicchi.» / «Aprendo un cocktail lo vedi in grande, come un acquerello: colore che sfuma e goccioline di freddo.» + «Ogni cocktail ha la sua guarnizione vera (ombrellino, ananas, sedano, scorza a spirale…) e si vede cosa c'è dentro: schiuma dei sour, strati, frutta.»

## Fatto in #99 (12/10, 9:49-10:00 ora italiana)
- Avvio: scorta vecchia (09:21-09:40, con un ULTIMO-MESSAGGIO più vecchio delle consegne) unita con `-s ours`, pushata.
- **Aiutante `collaudo`** in `.claude/agents/collaudo.md` (strumenti: Bash, Read, Grep, Glob, log e azioni di GitHub): prove legate + test-giro, griglie dei disegni guardate su copia piccola, attesa del controllo `prove`; risponde con un riassunto corto; niente modifiche, commit, push, merge. Perché: #98 era arrivata a 255k token soprattutto per log di prove, foto e attese. Scartati: agente che pubblica da solo (rischioso), più agenti insieme (più token). Regola in CLAUDE.md (Regole trasversali, prima di CONTEXT7). **E45**: un agente nuovo si carica solo dalla sessione dopo; in #99 usato come `general-purpose` che legge il file. Prima prova riuscita: ~74k token SUOI, nel mio contesto solo il riassunto.
- **Prove dello stato #98 di D42** (con l'aiutante): test-bar-disegni 57/57 (anche `TZ=Europe/Rome`; i controlli nuovi di #98 tutti verdi: 0 coppie simili, 28 segni, tazze tiki diverse, Negroni spostato, 212 disegni diversi), test-bar 35, test-news 94, test-giro nessun problema. Server 8765 lasciato acceso (nella sessione nuova va riacceso).
- **Bozza dello spunto**: `tools/bozze/cocktail-spunto.mjs <uscita> [Nome,Nome…]` → foto 780 px, 3 cocktail per foto, colonne A Oggi / B Più vivaci (colori + guarnizioni ×1,35) / C Come lo spunto (+ vetro e ghiaccio azzurrini, tratto fine). Foto (6 cocktail: Mojito, Cosmopolitan, Old Fashioned, Margarita, Mai Tai, Piña Colada) in `docs/img/sessione-99/`. Scelta di Mario: **C**.

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
- Jona #99 `session_01EJWztt4yYAtG2FhL7ryBnw` (chiusa), #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~9:58 ora italiana, #99) risposta a tocco alla domanda «Cocktail del Bar: quale stile vuoi?»: «Non bellissime fai la C mi accontento....», confermata col doppio tocco «Sì, confermo lo stile». Prima (#98): «vai apri»; «se ti aiuta aggiungi un aiutante per il tuo progetto e valuta tu cosa fargli fare per ottimizzare al meglio tutto tempi e qualità»; «vedi ad esemlio questi per prendere spunto che dettagli e carini». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
