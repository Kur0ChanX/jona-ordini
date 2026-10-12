# Passaggio di consegne (2026-10-12, fine sessione #101)

Sessione attuale: #102

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 online** (PR #101). **v92 (D42 stile C + correzioni #101) committata e pushata, NON ancora pubblicata.**

## ✅ SUBITO (#102)
0. **Difetti dei disegni trovati in #101 (aiutante collaudo, griglia di tutti i 212).** Mario #100: «attenzione anche al resto». Decidere (scelta tecnica mia) quali sistemare PRIMA della v92: consiglio i punti 1-4 e 16-17 (linee nere che non si capiscono, bollicine fuori dal liquido: stessa famiglia dell'arco della Piña Colada); i colori (5-8, 13-15, 21) e i gemelli (19) possono andare in una v92.1/v94 se allungano troppo. Elenco dell'aiutante, i più gravi prima:
   1. Irish Coffee: arco nero spesso sulla cima del liquido, manca lo strato bianco di panna.
   2. Bombardino: panna = solo contorno nero a nuvola sopra il bordo, vuota dentro; sotto macchie rosa sfocate (pezzo `pm|` panna montata, `tools/bar-disegni.mjs` riga ~687, e `dust` cannella?).
   3. Horse's Neck: spirale di limone (`spiral`) = scarabocchio nero spesso su tutto il bicchiere, esce sopra il bordo.
   4. Bicchieri a stelo con bollicine (`b|`): bollicine sotto la coppa, lungo il gambo, fuori dal liquido (Pornstar Martini, Old Cuban, Barracuda, French 75, Sgroppino, Spritz, Campari Spritz, Hugo, Limoncello/Mirto Spritz, Bicicletta, Bellini, Rossini, Puccini, Tintoretto, Mimosa, Kir Royal, Champagne Cocktail, Black Velvet, Sangria). Causa probabile: `pts` usa `B.top + 10..30` e filtra solo con `D.bot`; per i calici serve il fondo della coppa (`g.yb`) → filtrare `y < g.yb - 1` (o ritagliare con il `q` sul liquido).
   5. Kir giallo paglierino (manca il rosso del cassis). 6. Kir Royal marrone/kaki invece di rosa-rubino. 7. Blue Lagoon e AMF verde oliva invece di blu (curaçao + giallo). 8. White Port Tonic viola/malva (dovrebbe essere chiaro dorato). → `COLX` a mano o colori degli ingredienti in `ingCol`.
   9. White Russian quasi uguale al Black Russian (panna poco visibile). 10. Illegal: schiuma grigia sporca su metà coppa. 11. Painkiller: tazza tiki verde (atteso crema/arancio), puntini grigi sfocati sopra il bordo. 12. Oaxaca Old Fashioned: goccia arancione staccata sopra il bicchiere (fiamma della scorza `flame`), liquido verde oliva invece di ambra.
   13. Russian Spring Punch, El Diablo, Mirto Spritz, Bramble: kaki/fango invece di rosso-viola. 14. Espresso Tonic grigio-azzurro, senza strato scuro di caffè.
   15. Gin Sour, Amaretto Sour, Pisco Sour: schiuma = banda grigia ondulata sfocata, sembra sporco (Pisco anche macchie rosse sfocate) → `foam`/`wavy`.
   16. Mojito e Mojito alla fragola: menta pestata sul fondo = grossa macchia nera (`ml|`, `leafX`). 17. Batida de coco: scaglie di cocco = scarabocchi neri (`flakes`).
   18. Americano: fetta d'arancia e scorza di limone sovrapposte sul bordo. 19. Woo Woo e Cape Codder quasi identici. 20. Guarnizioni alte escono di ~5/64 sopra (voluto in #101: la scheda ha 12 px di margine; nella griglia coprono il nome sopra, nell'app no). 21. Stinger verde (atteso ambrato), Arnold Palmer giallo (atteso bruno tè).
   - Griglia da rifare: `DSF=2 node tools/bozze/griglia-cocktail.mjs <scratch>/g.png 1200` (lo scratchpad si perde), guardare con l'aiutante `collaudo` (ora si carica col suo nome).
   - Dopo le correzioni: `node tools/bar-disegni.mjs` (usa Playwright per misurare i pezzi: serve `/opt/pw-browsers/chromium`), controllare peso compresso < 30.000 (`gzip -9c data/bar-disegni.json | wc -c`, oggi **29.443**: quasi al limite! Le copie `~scala` costano; se si sfora, alleggerire), `node tools/test-bar-disegni.mjs` (oggi 62 PASS, anche `TZ=Europe/Rome`).
   - **Mandare a Mario foto prima/dopo** (regola foto: un telefono per foto, max ~1700 px di altezza) almeno di Piña Colada, Frozen Margarita, Ramos, Irish Coffee e dei corretti. Il «prima» = commit `935be6b` (`git show 935be6b:data/bar-disegni.json`, idem `index.html`), copia in una cartella con `data/` e `tools/bozze/griglia-cocktail.mjs`.
1. **Pubblicare la v92**: prove legate (test-bar-disegni, test-bar, test-news, test-giro chiaro+scuro, test-demo: in #100 tutte PASS tranne il controllo ora corretto) con l'aiutante `collaudo`, poi PR dal ramo unico, «Prove automatiche» verdi, squash, controllo online, `git fetch origin main && git merge origin/main` + push. `APP_VER`=92, `CACHE` `jona-ordini-v96` (controllare che sia diverso da quello online). Aggiornare NEWS v92 se i difetti corretti meritano una riga (es. «Frullati, schiume e vapore con linee leggere»).
2. **D43 passaggi → v93** (dopo lo squash della v92, per non far ripartire le prove: E39). I 212 testi in `tools/d43-passi/parte1..4.txt` **controllati in #101**: 212/212 nomi uguali a `tools/cocktail.txt`, tutti 3-5 passi, nessun passo vuoto, nessun «/», il più lungo 112 caratteri; a campione (Ramos, B-52, Piña Colada, Irish Coffee, Tequila Sunrise, Pisco Sour, Espresso Martini, Bombardino, Sangria, Jägerbomb) giusti: metodo rispettato, niente inventato. Resta da fare tutto il resto (vedi «Dettagli da #100» qui sotto: campo 6 con « / », `tools/cocktail.py` → lista, `brCk` con `<ol>`, prova Mojito 5 passi, NEWS v93, `APP_VER` 93, `CACHE` +1, riga v93 in CLAUDE.md). In `tools/cocktail.py` il campo 6 è `pas` (riga ~33: `nome, met, bic, ing, gu, pas, iba = p`); nell'app `brCk` mostra `<p class="vn-tx br-pas">${esc(c.p)}</p>` dopo `<span class="lbl">Come si fa</span><p class="vn-tx">${esc(met[1])}</p>`.
3. Chiedere a Mario a tocco + doppio tocco: «L'aiutante collaudo lo mando anche a RVC e SPA Sensorial?» (non ancora chiesto).
4. Dopo v92/v93: proposta SOLUZIONE SMART per cocktail «bellissimi» (vedi «Dettagli da #100»).

## Dettagli da #100 (D43 e idee)
- **D43 passaggi** (Mario #100 a tocco + conferma: «Come le foto», cioè **4-5 passi** di una-due righe con i dettagli utili al bancone; bozza `tools/bozze/passaggi-d43.mjs`, foto `docs/img/sessione-100/d43-passaggi-1..3.png` Mojito, Negroni, Margarita). Righe di `tools/d43-passi/parte1..4.txt` = «Nome|passo / passo / …», stesso ordine di `tools/cocktail.txt`.
  - Mettere i passi nel campo 6 di `tools/cocktail.txt` separati da « / » (scelta tecnica #100); `tools/cocktail.py` li divide in lista → `data/cocktail.json` `c[6]` = array di stringhe (controllo: 3-5 passi, nessun passo vuoto).
  - App: in `brCk` se `Array.isArray(c.p)` lista numerata (`<ol>` con cerchietti color `--lagoon` come la bozza), altrimenti la frase (vecchio file in cache). Cercare altri usi di `c.p` (la ricerca `k:` non usa p).
  - Peso: oggi `cocktail.json` 45,7 KB (8,7 KB compressi), diventerà ~+20 KB compressi: va bene (si scarica solo aprendo il Bar).
  - Prova nuova in `test-bar` (Mojito: 5 passi numerati) + `test-giro`. NEWS v93 («Ogni cocktail ha i passaggi numerati, uno per riga, con i trucchi del bancone»), `APP_VER` 93, `CACHE` +1, riga v93 in CLAUDE.md.
- **Idea SMART dopo v92/v93** (Mario «non bellissime… mi accontento»): proporre UNA strada più ambiziosa per cocktail «bellissimi», con bozza ferma e domanda a tocco (E19). Spunti: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati (non neri), tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #101 (12/10, ~10:06-10:30 ora italiana)
- Avvio: scorta vecchia (09:57) unita tenendo l'ULTIMO-MESSAGGIO più nuovo (conflitto risolto con `--ours`, E44 rispettato); poi unito `d5dcc2b` (parte 2 dei passi, arrivata dopo). Push confermato.
- **Arco nero della Piña Colada** (commit `09d62b7`): era la cupola dei frullati (`dome`) con riempimento quasi bianco e contorno nero. Ora: `VETRO = /^(i|it|b|dm|ft|vp)\|/` → cupola dei frullati, schiuma alta (Ramos) e vapore (tazze calde) disegnati color vetro (azzurrino), non neri; cupola più bassa (−11 invece di −15) e riempita col colore del drink (`tinta(col,255,.1)`).
- **Guarnizioni che uscivano dal disegno** (ananas della Piña Colada tagliato in alto): in `tools/bar-disegni.mjs`, prima di scrivere il JSON, Playwright misura ogni pezzo spostato (`getBBox`) e lo rimette dentro: sopra può uscire di 5 (la scheda ha spazio), ai lati di 2, sotto mai. Pezzi alti (ananas con ciliegina, rametti, sedano) invece di scendere nel bicchiere si rimpiccioliscono (copia `id~0.75`, minimo 0,75). Scartato: rimpicciolire fino a 0,6 per stare tutto dentro (troppe guarnizioni piccole, file +10%). `index.html`: `.br-ckbig{margin:12px 0 10px}` (prima 2px) per lo spazio sopra.
- `tools/test-bar-disegni.mjs`: controllo del vetro corretto (`.br-v.br-f` = 1, motivo #100); nuovi controlli stile C (colore `--vetro`, `non-scaling-stroke`, `scale(1.35)`), «nessuna guarnizione del bordo esce dal suo spazio» (misura solo i gruppi `translate(..) scale(1.35)`), «cupola, schiuma alta e vapore non neri»; `pid()` e `SEGNI` capiscono `~scala`. **62 PASS** (anche TZ Roma).
- Controllo a occhio dei 212 con l'aiutante (elenco sopra). Server locale 8765 acceso in #101 (va riacceso).

## Fatto in #100 (12/10, ~10:05-10:40 ora italiana)
- **Stile C (v92) costruito** (commit `v92 stile C…`, pushato):
  - `tools/bar-disegni.mjs`: `VETRO = /^(i|it|b)\|/` in `put()` → linee `d`/`f` di cubetti, tritato e bollicine diventano `vd`/`vf`. NB: `fr|` (fragole) e `cu|` (cetriolo) NON sono vetro: esclusi (la consegna #99 li includeva per errore). `viv()` (dalla bozza) sui colori del drink prima di `separa` (`c: viv(COLX||mix)`) e sulle tazze `TIKI`. Rifatto il JSON: 0 coppie troppo simili, 29.208 byte compressi (< 30.000), 17 pezzi con `vd`/`vf`.
  - `index.html`: `brMove` con `scale(1.35)`; `brTinta(col,255,.18)`; `brCkDis` disegna `<g class="ink br-v">B.d+vd</g>`, `<g class="ink br-v br-f">B.f+vf</g>`, poi `<g class="ink">d</g>` e `<g class="ink br-f">f</g>`; CSS dopo `.br-ck .br-dr`: `vector-effect:non-scaling-stroke` su `.br-ck .ink`, spessori fissi con `!important` (scheda 2.1/1.1px, vetro 1.9/1px; lista 1.25/.7px, vetro 1.2px), colori `--vetro` #6F9EA6, `--vetro2` #8DB5BB, `--vetro3` #4D7F87 in `:root`; scuro (2 blocchi) #86BCC4 / #5F8F96 / #7EB2BA. Visto a occhio chiaro e scuro: ok.
  - NEWS v92 con i 3 testi (colori vivi, vetro sottile…; acquerello; guarnizione vera), nota dev dello stile C; riga v92 in CLAUDE.md aggiornata.
  - `tools/bozze/griglia-cocktail.mjs`: aggiunte le variabili `--vetro*` nel `:root` della pagina di prova.
- Unita la consegna della #99 arrivata dopo (D43, ultimo messaggio): merge pulito.
- **D43**: bozza `tools/bozze/passaggi-d43.mjs` + foto (3) mandate a Mario; scelta a tocco «Come le foto (Recommended)» + «Sì, confermo la lunghezza». 4 aiutanti hanno scritto i passi dei 212.

## Fatto in #98-#99 (riassunto; dettagli nella storia dei commit)
- #99: aiutante `collaudo` (`.claude/agents/collaudo.md`, E45); bozza dello spunto `tools/bozze/cocktail-spunto.mjs` (foto `docs/img/sessione-99/`), scelta di Mario **C**.
- #98 (D42 passo 2): in `tools/bar-disegni.mjs` `geo(bk)`, guarnizione letta frase per frase (`gTipo`, solo la prima alternativa prima di « o »), tanti pezzi nuovi (`wedge`, `cherry`, `pine`, `twist`, `flame`, `spiral`, `umbrella`, `foam`/`foamTall`, `dome`, `steam`, `pick`, `flakes`…), strati `LAY`, colori a mano `COLX`, `SCHIUMA`, `CREMA`, pezzo `q` (acquerelli ritagliati sul liquido), `separa()` (ΔE<13), tazze `TIKI`, misura `somiglia` (`--simili`, `--col Nome`), guarnizioni salvate una volta e richiamate con `chiave@x,y`. App: `brMove`, `brCkDis` capisce `@x,y` e `q`. Bozza griglia `tools/bozze/griglia-cocktail.mjs` (`DSF`, `SOLO`).

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
- Jona #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j` (chiusa), #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(#101: Mario non ha scritto; la sessione è partita dal prompt dell'handoff e ha chiuso per la soglia del contesto.)
(12/10/2026 ~10:50 ora italiana, #100) «ok vai» (dopo l'avviso che stavo aspettando gli aiutanti per chiudere: handoff subito).
(12/10/2026 ~10:45 ora italiana, #100) «in pina colada esemlio perche ha quel l'arco nero sopra il bicchiere stona un pò non capisco cosa volevi fare.... attenzione anche al resto» → SUBITO punto 0. Risposta data: è la cupola del frullato, la crema quasi bianca non si vede e resta solo l'arco nero; si corregge nella #101 con controllo di tutti i 212.
Prima (#100, ~10:35): risposta a tocco «Come le foto (Recommended)» per i passaggi (4-5 passi), confermata «Sì, confermo la lunghezza». (#99 chiusa, ~10:00): «Aggiungi i passaggi come si fà nei  cocktail in modo piú chiaro con qualche dettaglio in piú senza essere troppo corto al troppo lungo». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
