# Passaggio di consegne (2026-10-12, fine sessione #102)

Sessione attuale: #103

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v91 online** (PR #101). **v92 (D42 stile C + correzioni #101-#102) committata e pushata, NON ancora pubblicata.**

## ✅ SUBITO (#103)
0. **Prima della v92: nuovi difetti di Mario + regola di stile.** Mario ha scritto nella #101 (chiusa) dopo l'apertura della #102; la #101 li ha girati alla #102 (parola per parola qui sotto in «Ultimo messaggio»). Rispondere a Mario con foto prima/dopo.
   - **REGOLA DI STILE (vale per TUTTI i 212, sopra ogni difetto)**: «segui le linee del disegno non mettere a caso tratti neri grossi perché perde il senso dello stile mantieni coerente la foto». Coerenza con lo spunto C (#99: `docs/img/sessione-99/`, bozza `tools/bozze/cocktail-spunto.mjs`) prima di tutto. Via probabile: contorni delle guarnizioni sottili e del tono scuro del loro colore (non neri spessi), pezzi dentro il bicchiere senza contorno nero (solo colore o `vd`/`vf` color vetro, come fatto in #102). Nell'app il nero è `.br-ck .ink` 2,1 px fisso (`non-scaling-stroke`, `!important`): valutare un gruppo nuovo per «contorno colorato» (es. pezzi con `cd` → `<g class="ink br-c" style="stroke:…">`, o stroke nel pezzo con classe che non ha `!important` sul colore) e/o spessore minore per i pezzi piccoli. Scritta anche in CLAUDE.md (riga v92).
   - **a) Moscow Mule: «bicchiere sbagliato»**: la `Tazza di rame` (opaca, `op`) non si riconosce → colore rame, riflessi, manico chiaro.
   - **b) Cannucce fuori posto** (es. Piña Colada): pezzo `s|<bicchiere>` in `cocktail()` di `tools/bar-disegni.mjs` (cerca `put('s|'`) parte da `B.top + 20` e va a (50,2): sistemare la posizione per bicchiere (Hurricane della Piña Colada) e controllare tutti.
   - **c) London Mule: «una bottiglia nel bicchiere»** = etichetta del distillato `badge()` (`m|Tazza di rame|gin`, ultima parte di `cocktail()`, nei bicchieri opachi). Mario non la capisce → toglierla e distinguere i Mule in altro modo (guarnizione, colore del bordo), controllando la prova «niente doppioni» di `test-bar-disegni` e `--simili`.
   - **d) «mezze lune gialle… pezzi di limone… orribili e tutti uguali brutti»** = scorze `twist` (nastro con contorno nero) e/o spicchi `wedge` / mezze fette `limoneM`: ridisegnarle più belle e varie (spessore della buccia, polpa con spicchi, colore diverso limone/lime/arancia/pompelmo, contorno sottile colorato).
   - Restano dall'elenco #101 (dopo, o in v92.1): colori 5-8, 13-15, 21 (Kir, Kir Royal, Blue Lagoon/AMF, White Port Tonic, Russian Spring Punch, El Diablo, Mirto Spritz, Bramble, Espresso Tonic, Stinger, Arnold Palmer → `COLX`), 9 White Russian, 10 Illegal, 11 Painkiller, 12 Oaxaca (fiamma staccata), 15 schiume grigie dei sour (`foam`/`wavy`: linea `wavy` nera → color vetro), 18 Americano (fetta e scorza sovrapposte), 19 Woo Woo/Cape Codder gemelli, 20 guarnizioni alte.
   - **FATTO in #102** (commit `v92: panna, spirale…`, prima di `3f681d5`): difetti 1-4, 16-17 dell'elenco #101 (qui sotto) + sale del bordo. Dettagli in «Fatto in #102».
   - Strumenti: griglia `DSF=2 SOLO="A,B" node tools/bozze/griglia-cocktail.mjs <scratch>/g.png 760` (guardare una copia ≤1000 px); «prima» = cartella con `git show 935be6b:index.html`, `git show 935be6b:data/bar-disegni.json`, `data/cocktail.json` e lo script della griglia copiato in `tools/bozze/` (lo script legge `../../index.html`). Foto prima/dopo con PIL: celle a larghezza 150 (una per foto), ritagliate sul contenuto, coppie affiancate 780 px, ≤1730 px di altezza (come `docs/img/sessione-102/prima-dopo-1..2.png`).
   - Dopo ogni modifica: `node tools/bar-disegni.mjs`, peso con la prova (usa zlib di node: `gzip -9` dà numeri un po' diversi) < 30.000: oggi **29.439**, poco margine (in #102 alleggeriti spirale `ribbon(..,5)` e cristalli del bordo come path); `node tools/test-bar-disegni.mjs` (oggi **64 PASS**, anche TZ Roma).
   - **Elenco #101 (aiutante collaudo, griglia dei 212), per riferimento:** Mario #100: «attenzione anche al resto». Decidere (scelta tecnica mia) quali sistemare PRIMA della v92: consiglio i punti 1-4 e 16-17 (linee nere che non si capiscono, bollicine fuori dal liquido: stessa famiglia dell'arco della Piña Colada); i colori (5-8, 13-15, 21) e i gemelli (19) possono andare in una v92.1/v94 se allungano troppo. Elenco dell'aiutante, i più gravi prima:
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
1. **Pubblicare la v92** (dopo il punto 0): prove legate (in #102 lanciate con l'aiutante su `3f681d5` ma la sessione ha chiuso prima del risultato: rifarle dopo il punto 0) (test-bar-disegni, test-bar, test-news, test-giro chiaro+scuro, test-demo: in #100 tutte PASS tranne il controllo ora corretto) con l'aiutante `collaudo`, poi PR dal ramo unico, «Prove automatiche» verdi, squash, controllo online, `git fetch origin main && git merge origin/main` + push. `APP_VER`=92, `CACHE` `jona-ordini-v96` (controllare che sia diverso da quello online). Aggiornare NEWS v92 se i difetti corretti meritano una riga (es. «Frullati, schiume e vapore con linee leggere»).
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

## Fatto in #102 (12/10, ~10:15-10:45 ora italiana)
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
- Jona #102 `session_01X1y9TToVXuFHrms1cxvCyw` (chiusa), #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(12/10/2026 ~10:30 ora italiana, scritto nella #102 dopo la chiusura, girato alla #103 con send_message) «vedo anche moscow mule bicchiere sbagliato e le nei cocktail cannucce fuori tipo in pigna colada  posizione e esempio london mule non sò perché ha disegnato una bottiglia nel bicchiere... e poi le mezze lune gialle forse sono pezzi di limone non sò sono orribili e tutti uguali brutti / segui le linee del disegno non mettere a caso tratti neri grossi perché perde il senso dello stile mantieni coerente la foto / Fatti aiutare da un agente per fare prima / Attenzione ananas ecc linee teoppo grosse e cannucce pigna colada fiori posto la nuova schiuma mi piace quello stile» → novità: aiutanti in parallelo; anche ananas e altre guarnizioni con linee troppo grosse; la panna/cupola piena color vetro della #102 («la nuova schiuma») è lo stile che gli piace.
Prima, scritti nella #101 (chiusa) e girati alla #102:
(12/10/2026 ~10:22 ora italiana) «segui le linee del disegno non mettere a caso tratti neri grossi perché perde il senso dello stile mantieni coerente la foto»
(~10:20) «vedo anche moscow mule bicchiere sbagliato e le nei cocktail cannucce fuori tipo in pigna colada  posizione e esempio london mule non sò perché ha disegnato una bottiglia nel bicchiere... e poi le mezze lune gialle forse sono pezzi di limone non sò sono orribili e tutti uguali brutti»
(~10:16) «vai» (via libera al punto 0, difetti dei disegni → v92).
Prima (#100): «in pina colada esemlio perche ha quel l'arco nero sopra il bicchiere stona un pò non capisco cosa volevi fare.... attenzione anche al resto». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
