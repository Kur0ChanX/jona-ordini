# Passaggio di consegne (2026-10-12, fine sessione #105)

Sessione attuale: #106

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Stato all'handoff: **v92 = PR #102** (vedi sotto se già unita). **v93 committata sul ramo, prove legate VERDI, da pubblicare SUBITO** (Mario #105: «ok poi pubblica direttamente»). `APP_VER`=93, `CACHE` `jona-ordini-v97`.

## ✅ SUBITO (#106)
1. **Controllare la v92**: PR #102 (https://github.com/Kur0ChanX/jona-ordini/pull/102). Se la #105 l'ha già unita (squash) e riallineata, `main` ha la v92: controllo online `https://jona-ristorante-by-ynoy-corp.pages.dev/` (`APP_VER` 92 o 93). Se è ancora aperta: aspettare `prove` verdi → squash → `git fetch origin main && git merge origin/main` + push.
2. **Pubblicare la v93 SUBITO, senza chiedere** (Mario #105). Prove legate già verdi in #105: `test-cantina` (53 PASS), `test-news`, `test-campi-16`, `test-giro` 320/390 chiaro/scuro, `test-testbar` (tutte PASS). → nuova PR dal ramo unico → `prove` verdi → squash → controllo online → `git fetch origin main && git merge origin/main` + push. Niente push sul ramo mentre `prove` gira (E39).
3. **D43 passaggi → v94** (dettagli in «Dettagli da #100», invariati).
4. Resti dell'elenco #101 dei cocktail (colori 5-8, 13-15, 21 → `COLX`; 9 White Russian, 10 Illegal, 11 Painkiller, 12 Oaxaca fiamma staccata, 15 schiume grigie `wavy` → color vetro, 19 Woo Woo/Cape Codder; sedano della Bloody Maria fuori posto a sinistra) in una versione dopo. Mario (#102): «Fatti aiutare da un agente per fare prima».
5. Chiedere a Mario a tocco + doppio tocco: «L'aiutante collaudo lo mando anche a RVC e SPA Sensorial?» (non ancora chiesto).
6. Dopo v92-v94: proposta SOLUZIONE SMART per cocktail «bellissimi» (vedi «Dettagli da #100»). Mario #102: «la nuova schiuma mi piace quello stile».
7. Mario prova la D44 quando è online: Cantina → **Fotografa una bottiglia** → fronte → **Fotografa il retro** → **Leggi le 2 foto con l'IA** (voce D44 in `docs/DA-FARE.md`).

## Fatto in #105 (12/10, ~10:47-11:15 ora italiana)
- Avvio: scorta più vecchia (ULTIMO-MESSAGGIO 10:43) in conflitto → tenuta la versione di #104; push confermato (`880e7d1`).
- **PR #102 v92** aperta (prove partite 10:48). Durante la v93 `test-testbar` ha trovato un FAIL della v92: commento `// v92 regola di stile (Mario)` in `index.html` (la prova vieta «Mario» nei testi dell'app, toglie solo i commenti `/* */`). Corretto in `(#101)` con un worktree a parte sopra `origin` (commit `a741e1e`, test-testbar 7 PASS), push → prove ripartite alle 10:58. Poi unito nel lavoro v93 con un merge normale.
- **v93 D44** applicata dalle bozze (`tools/bozze/d44-modifiche.py`, `d44-prova.py`: gli script restano in `tools/bozze/`), `CACHE` v97, riga v93 in CLAUDE.md, D44 in `docs/DA-FARE.md` → «fatto in #105 (v93)». Il collaudo ha trovato un errore della PROVA (non dell'app): il blocco «Cloudflare non accetta 2 foto» chiama `vnForm(null)` che apre un'altra scheda sopra il Turriga; la prova ne chiudeva una sola → aggiunto un secondo `closeSheet` (commit `24a1f48`).
- **Barra Test: vista «Bar» in fondo** (Mario #105: «Nel mio test aggiungi Bar alla fine ha lui quella funzione cocktail ecc mauro ha cantina vini anche Maurizio»): `VIEW_AS.bar={ruolo:'staff',reparto:'sala',mansione:'Bartender'}`, pulsante `['bar','Bar']` dopo «Sviluppatore» (solo barra dello sviluppatore, la barra della demo invariata). Scelta di Mario a tocco + conferma: il barista vede **Bar e Cantina Vini**, «e deve avere anche la possibilità di ordinare la sua roba e inviarla a Maurizio» → già così (staff: Catalogo, Carrello, «Invia allo chef» = approvazione del gestore). Prove nuove in `tools/test-testbar.mjs` (ordine gm,fb,staff,dev,bar; barista non gestore con `brOn`/`vnOn`; dentro 320 px; Catalogo/Carrello/I miei ordini; `cadd` → «Invia allo chef»). Nota dev nella NEWS v93, riga v93 in CLAUDE.md.
- Lezione: un'occhiata a `test-testbar` (controllo del nome) va fatta anche dopo commenti nuovi nel codice.

## Fatto in #104 (12/10, ~10:43-11:00 ora italiana)
- Avvio: scorta con un ULTIMO-MESSAGGIO più vecchio (10:26) in conflitto → tenuto quello di #103 (10:45). Push confermato.
- Messaggio dalla #103 (chiusa): il suo collaudo su `3dda320` era tutto verde.
- Collaudo su `0c83f7e`: 6/6 PASS (sopra).
- D44 progettata e scritta in bozza (sopra). Nota: Context7 ha finito la quota mensile gratuita («Monthly quota exceeded»): usare la ricerca web finché non riparte, o chiedere a Mario se vuole una chiave gratis su context7.com/dashboard.

## Fatto in #103 (12/10, ~10:30-10:45 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO), push confermato. Messaggi della #102 (chiusa) ricevuti: nuovo messaggio di Mario (in «Ultimo messaggio») e prove legate verdi su `3f681d5`.
- **Regola di stile** (`tools/bar-disegni.mjs`): `joinX` passa ogni parte da `colora`: `d`/`f`/`p` → `c`/`cf`/`cp` = [[colore, forme]] col tono scuro del pezzo (`scuro(w[0][0])`, o `x.k` se dato; parti senza colore = `LEGNO` #8A6440, es. stecchini). `put` per le chiavi `VETRO` rimette `c`/`cf` in `vd`/`vf`. `sw()` ora non fa niente (lo spessore lo decide il CSS). App (`index.html`): `brCol(ps,x,cl,pr)` disegna i gruppi `<g class="br-c" style="stroke:…">`; CSS `.br-c` 1,25 px scheda / 0,8 lista, `.br-c.br-f` 0,75 / 0,5; bicchieri pieni (`op`) con `oc` = contorno nel tono scuro (`.br-o` 2 / 1,2 px), linee fini del bicchiere nello stesso colore; goccioline `.br-dr` color vetro. Colore `*` nei pezzi = colore del drink `k[1]`, `*l` = più chiaro (`cr|<bicchiere>`, `dm|<bicchiere>`, `sf|<bicchiere>`: un pezzo per bicchiere invece che per colore → file più leggero).
- **Tazza di rame** (Mule): `opaco` #C46E3A, contorno aperto in alto (`o` senza linea sopra), pezzo `rm|` (ombra a destra, luce a sinistra, martellato chiaro, manico pieno, riflessi), `sf|` (apertura ellittica col drink e due cubetti). Per i Mule `fisso` = false → `separa` distanzia i colori del drink (London/Mexican, Moscow/Kentucky/Virgin diversi).
- **Etichetta con la bottiglia** (`badge` in `m|`) tolta dai bicchieri pieni; i gemelli non la ricevono più (oggi 0 coppie simili, `--simili`).
- **Cannuccia** `s|`: parte dal liquido (x 34) e passa dentro l'apertura (pendenza ≤ 0,35), nei bicchieri pieni solo sopra il bordo; bianca con una riga rossa. **Ombrellino** sul bordo a sinistra, stecchino dentro il bicchiere.
- **Agrumi**: `wheel`/`wedge` con albedo bianco tra buccia e polpa, spicchi sottili; `twist(x,y,col,ag)`: riccio per agrume (`TW`: limone lungo con ricciolo, lime corto, arancia larga, pompelmo larga con ricciolo), albedo chiaro dove gira, pori. `SLOT` 14 (Americano).
- Prova `tools/test-bar-disegni.mjs` (68 PASS): pezzi senza contorno nero, niente `m|`, tazza di rame con `rm|`/`sf|`/`oc`, cannucce poco inclinate e dentro il disegno; somiglianze e «disegni diversi» contano il colore del drink quando c'è `sf|` (`colV`). Le 3 nuove falliscono sul file vecchio (verificato).
- Foto per Mario `prima-dopo-1..3.png` (12 cocktail: Mule, Piña Colada, Old Fashioned, Gin Tonic, Americano, Mojito, Cosmopolitan, Mint Julep, Mai Tai, Negroni, Tom Collins) mandate; rifatte dallo scratchpad (non salvate nel repo).
- NEWS v92: riga «Linee sottili del colore di ogni frutto, tazza di rame vera per i Mule, scorze d'agrume arricciate» + nota dev; riga v92 in CLAUDE.md aggiornata. D44 in `docs/DA-FARE.md`.
- Risposta data a Mario sulla domanda dell'IA: l'app non usa i token di Claude; listini = catena Gemini Flash → Flash-Lite → Cloudflare Llama 4 (`GEM_LETT`); la Cantina oggi solo Gemini Flash → Lite (sarà allineata con la D44).

## Dettagli da #100 (D43 e idee)
- **D43 passaggi** (Mario #100 a tocco + conferma: «Come le foto», cioè **4-5 passi** di una-due righe con i dettagli utili al bancone; bozza `tools/bozze/passaggi-d43.mjs`, foto `docs/img/sessione-100/d43-passaggi-1..3.png` Mojito, Negroni, Margarita). Righe di `tools/d43-passi/parte1..4.txt` = «Nome|passo / passo / …», stesso ordine di `tools/cocktail.txt`.
  - Mettere i passi nel campo 6 di `tools/cocktail.txt` separati da « / » (scelta tecnica #100); `tools/cocktail.py` li divide in lista → `data/cocktail.json` `c[6]` = array di stringhe (controllo: 3-5 passi, nessun passo vuoto).
  - App: in `brCk` se `Array.isArray(c.p)` lista numerata (`<ol>` con cerchietti color `--lagoon` come la bozza), altrimenti la frase (vecchio file in cache). Cercare altri usi di `c.p` (la ricerca `k:` non usa p).
  - Peso: oggi `cocktail.json` 45,7 KB (8,7 KB compressi), diventerà ~+20 KB compressi: va bene (si scarica solo aprendo il Bar).
  - Prova nuova in `test-bar` (Mojito: 5 passi numerati) + `test-giro`. NEWS v93 («Ogni cocktail ha i passaggi numerati, uno per riga, con i trucchi del bancone»), `APP_VER` 93, `CACHE` +1, riga v93 in CLAUDE.md.
- **Idea SMART dopo v92/v93** (Mario «non bellissime… mi accontento»): proporre UNA strada più ambiziosa per cocktail «bellissimi», con bozza ferma e domanda a tocco (E19). Spunti: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati (non neri), tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #102 (riassunto)
- Avvio: scorta (vuota) unita, push confermato.
- `tools/bar-disegni.mjs`: `cream(g)` = panna montata (strato `q` bianco sul liquido + nuvola piena a 3 gobbe, linee in `vd`/`vf` color vetro), usata da `pm|` (ingrediente «panna montata») e dalla guarnizione `panna` (Irish Coffee: l'arco nero era la vecchia guarnizione con `L()` = senza riempimento). `spiral` = nastro `ribbon(segs, 1.5, 5)` pieno con bordo `vf` (prima: tratto giallo + linea nera). Menta pestata `ml|`: solo colore. `flakes` (cocco): ombra crema invece del contorno. Bollicine `b|`: nei bicchieri `COPPA` posizioni in proporzione tra superficie e fondo della coppa (prima finivano sul gambo); `VETRO` ora `/^(i|it|b|dm|ft|vp|r)\|/` (sale/zucchero del bordo color vetro); cristalli del bordo come un solo path (quadratini e rombi) per il peso; `joinX` porta anche `vd`/`vf`; `ribbon` ha il parametro `n` (campioni per tratto).
- `tools/test-bar-disegni.mjs`: 2 controlli nuovi (panna/menta/spirale senza contorno nero; bollicine dentro il liquido con `isPointInFill`), verificati: FAIL sul file vecchio, PASS sul nuovo. 64 PASS.
- NEWS v92: nota dev aggiornata (#101-#102). Foto `docs/img/sessione-102/prima-dopo-1..2.png` mandate a Mario (Batida/frullati, Irish, Bombardino, Horse's Neck, Mojito, Spritz, Margarita, Bellini).

## Fatto in #101 (riassunto)
- Arco della Piña Colada: `VETRO` con `dm|ft|vp` (cupola dei frullati, schiuma alta, vapore color vetro), cupola più bassa e piena. Guarnizioni misurate con Playwright (`getBBox`) e rimesse dentro (sopra max 5, lati 2, pezzi alti rimpiccioliti `id~0.75`); `.br-ckbig{margin:12px 0 10px}`. Controlli nuovi in `test-bar-disegni`. Elenco dei 21 difetti (sopra).

## Fatto in #100 (riassunto)
- Stile C (v92) costruito in `tools/bar-disegni.mjs` (`VETRO`, `viv()`) e `index.html` (`brMove` ×1,35, `brCkDis` con gruppi `.br-v`, CSS `non-scaling-stroke`, colori `--vetro*`), NEWS v92, riga v92 in CLAUDE.md. D43: bozza `tools/bozze/passaggi-d43.mjs`, scelta «Come le foto», 212 testi in `tools/d43-passi/`. Dettagli nella storia dei commit.

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
- Jona #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc` (chiusa), #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~11:05 ora italiana, #105) «ok poi pubblica direttamente» (= pubblica v92 e poi la v93 senza chiedere).
Prima (#105, ~10:55): «Nel mio test aggiungi Bar alla fine ha lui quella funzione cocktail ecc mauro ha cantina vini anche Maurizio»; a tocco: «si tutti e 2 e 2 e deve avere anche la possibilità di ordinare la sua roba e inviarla a Maurizio» (fatto).
Prima (#104, ~10:50): «vai con la D44 dopo la v92»
Prima (#103, ~10:45): «in coda nell app dammi la possibilità di fare piú foto del vino per prendere anche il retro per caricare scheda del vino, poi domanda: quando lavora l'intelligenza artificiale nell'app lavora con il sistema scansione listini con tutte le ia un'ordine di priorità senza usare i token claude giusto?» (risposta data in #103). Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
