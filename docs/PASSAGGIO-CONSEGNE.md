# Passaggio di consegne (2026-10-12, fine sessione #100)

Sessione attuale: #101

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 online** (PR #101). **v92 (D42 stile C) costruita e pushata, NON ancora pubblicata.**

## ✅ SUBITO (#101)
0. **PRIMA della v92: arco nero della Piña Colada (Mario #100: «in pina colada esemlio perche ha quel l'arco nero sopra il bicchiere stona un pò non capisco cosa volevi fare.... attenzione anche al resto»).** È il pezzo `dome` (frullati, `tools/bar-disegni.mjs` riga ~490: cupola sopra il bordo con `d: sw(1.4, L(arco))`): il riempimento è crema quasi bianca e si vede solo l'arco nero. Correggere: cupola con il colore del drink (o schiuma visibile), contorno sottile color vetro/colore scuro del drink invece del nero, oppure togliere la cupola. Poi **controllo a occhio di TUTTI i 212** con `tools/bozze/griglia-cocktail.mjs` (foto a fasce, copia piccola max 1000 px, meglio con l'aiutante collaudo) cercando altre linee nere che non si capiscono: `foamTall` (Ramos, arco sopra), `steam` (tazze calde), `spiral`, `twist`, `flame`, guarnizioni ingrandite ×1,35 che escono troppo (ombrellino Piña Colada sopra la scheda). Mandare a Mario foto prima/dopo dei cocktail corretti prima di pubblicare.
1. **Sistemare 1 controllo di `tools/test-bar-disegni.mjs` (riga ~89)** e pubblicare la v92. Esito prove #100 (aiutante collaudo): test-bar PASS, test-news PASS, test-giro chiaro+scuro PASS, test-demo PASS; test-bar-disegni FAIL solo su «scheda: riflessi e linee fini del vetro» (anche TZ Roma). Causa: la prova vuole `big.locator('.br-f').count()===1`, ma con lo stile C nel Negroni ci sono 2 gruppi `.br-f`: `ink br-v br-f` (vetro, linee `vf` del bicchiere) e `ink br-f` (mezza fetta d'arancia `g|aranciaM`, linee `f`). È giusto così → cambiare il controllo in: `.br-v.br-f` count===1 e `.br-v` (vetro) presente; aggiungere anche controlli dello stile C (gruppo `.br-v` con `stroke` = `--vetro`, `vector-effect` non-scaling su `.br-ck .ink`, `scale(1.35)` nel pezzo spostato). Rilanciare test-bar-disegni (anche TZ Roma) con `subagent_type: collaudo`, poi: PR dal ramo unico, attesa «Prove automatiche» verdi, squash, controllo online, `git fetch origin main && git merge origin/main` + push. Pubblicare da solo se verdi. `APP_VER`=92 e `CACHE` `jona-ordini-v96` già a posto (impostati in #97 per la v92: controllare che `CACHE` sia diverso da quello online, altrimenti +1).
2. **D43 passaggi dei cocktail → v93** (Mario #100 a tocco + conferma: «Come le foto», cioè **4-5 passi** una-due righe, con i dettagli utili al bancone; bozza `tools/bozze/passaggi-d43.mjs`, foto `docs/img/sessione-100/d43-passaggi-1..3.png` Mojito, Negroni, Margarita).
   - Testi dei 212 scritti da 4 aiutanti in #100 → salvati in `tools/d43-passi/parte1..4.txt` (righe «Nome|passo / passo / …», stesso ordine di `tools/cocktail.txt`; parte1 righe 1-60, parte2 61-115, parte3 116-170, parte4 171-224). **Se una parte manca o è incompleta, rifarla** con un aiutante (prompt: 3-5 passi, max ~110 caratteri, parole semplici, imperativo, niente «/» nei passi, usare solo ingredienti/bicchiere/guarnizione della riga; Mojito, Negroni, Margarita = testi della bozza).
   - Controllare a campione la qualità (ingredienti giusti, niente inventato, metodo rispettato: dry shake con l'albume, strati versati piano, frullati).
   - Mettere i passi nel campo 6 di `tools/cocktail.txt` separati da « / » (scelta tecnica #100); `tools/cocktail.py` li divide in lista → `data/cocktail.json` `c[6]` = array di stringhe (controllo: 3-5 passi, nessun passo vuoto). App: in `brCk` (riga ~5821, `<p class="vn-tx br-pas">${esc(c.p)}</p>`) se `Array.isArray(c.p)` lista numerata (`<ol>` con cerchietti color `--lagoon` come la bozza), altrimenti la frase (vecchio file in cache). Cerca anche altri usi di `c.p`/`BR_CK` (ricerca `k:` non usa p). Peso: oggi `cocktail.json` 45,7 KB (8,7 KB compressi): diventerà ~+20 KB compressi, va bene (si scarica solo aprendo il Bar), dirlo all'aiutante `ottimizza` se serve. Prova nuova in `test-bar` (Mojito: 5 passi numerati) + `test-giro`. NEWS v93 («Ogni cocktail ha i passaggi numerati, uno per riga, con i trucchi del bancone»), `APP_VER` 93, `CACHE` +1, riga v93 in CLAUDE.md.
3. **Chiedere a Mario** a tocco + doppio tocco: «L'aiutante collaudo lo mando anche a RVC e SPA Sensorial?» (non ancora chiesto). Se sì: `send_message` alle sessioni attive (nomi con `list_sessions`), con `.claude/agents/collaudo.md` da adattare.
4. Dopo v92/v93, regola SOLUZIONE SMART: Mario «non bellissime… mi accontento» → proporre UNA strada più ambiziosa per i cocktail «bellissimi», con bozza ferma e domanda a tocco (E19). Spunti non ancora presi: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati (non neri), tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #100 (12/10, ~10:05-10:40 ora italiana)
- **Stile C (v92) costruito** (commit `v92 stile C…`, pushato):
  - `tools/bar-disegni.mjs`: `VETRO = /^(i|it|b)\|/` in `put()` → linee `d`/`f` di cubetti, tritato e bollicine diventano `vd`/`vf`. NB: `fr|` (fragole) e `cu|` (cetriolo) NON sono vetro: esclusi (la consegna #99 li includeva per errore). `viv()` (dalla bozza) sui colori del drink prima di `separa` (`c: viv(COLX||mix)`) e sulle tazze `TIKI`. Rifatto il JSON: 0 coppie troppo simili, 29.208 byte compressi (< 30.000), 17 pezzi con `vd`/`vf`.
  - `index.html`: `brMove` con `scale(1.35)`; `brTinta(col,255,.18)`; `brCkDis` disegna `<g class="ink br-v">B.d+vd</g>`, `<g class="ink br-v br-f">B.f+vf</g>`, poi `<g class="ink">d</g>` e `<g class="ink br-f">f</g>`; CSS dopo `.br-ck .br-dr`: `vector-effect:non-scaling-stroke` su `.br-ck .ink`, spessori fissi con `!important` (scheda 2.1/1.1px, vetro 1.9/1px; lista 1.25/.7px, vetro 1.2px), colori `--vetro` #6F9EA6, `--vetro2` #8DB5BB, `--vetro3` #4D7F87 in `:root`; scuro (2 blocchi) #86BCC4 / #5F8F96 / #7EB2BA. Visto a occhio chiaro e scuro: ok.
  - NEWS v92 con i 3 testi (colori vivi, vetro sottile…; acquerello; guarnizione vera), nota dev dello stile C; riga v92 in CLAUDE.md aggiornata.
  - `tools/bozze/griglia-cocktail.mjs`: aggiunte le variabili `--vetro*` nel `:root` della pagina di prova.
- Unita la consegna della #99 arrivata dopo (D43, ultimo messaggio): merge pulito.
- **D43**: bozza `tools/bozze/passaggi-d43.mjs` + foto (3) mandate a Mario; scelta a tocco «Come le foto (Recommended)» + «Sì, confermo la lunghezza». 4 aiutanti hanno scritto i passi dei 212.

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
- Jona #100 `session_012UpbnoEghY7djrbt8t3jBq` (chiusa), #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~10:45 ora italiana, #100) «in pina colada esemlio perche ha quel l'arco nero sopra il bicchiere stona un pò non capisco cosa volevi fare.... attenzione anche al resto» → SUBITO punto 0. Risposta data: è la cupola del frullato, la crema quasi bianca non si vede e resta solo l'arco nero; si corregge nella #101 con controllo di tutti i 212.
Prima (#100, ~10:35): risposta a tocco «Come le foto (Recommended)» per i passaggi (4-5 passi), confermata «Sì, confermo la lunghezza». (#99 chiusa, ~10:00): «Aggiungi i passaggi come si fà nei  cocktail in modo piú chiaro con qualche dettaglio in piú senza essere troppo corto al troppo lungo». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
