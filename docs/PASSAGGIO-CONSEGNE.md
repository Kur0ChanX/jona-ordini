# Passaggio di consegne (2026-10-11, fine sessione #80)

Sessione attuale: #81

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). App online: **v79**. **v80 nella PR #91** (https://github.com/Kur0ChanX/jona-ordini/pull/91), head `f696a0f`: alle 15:39 il controllo «prove» era in corso. **PRIMA COSA della #81**: leggere il check `prove` di `f696a0f` (o dell'head attuale). Se è verde: squash merge della #91, poi `git fetch origin main && git merge origin/main` sul ramo e push, controllo online `APP_VER=80`. Se è rosso: capire la causa e correggere.

## Fatto in #80 (11/10, ~10:30-15:40 ora italiana)
- Unite due scorte (solo `ULTIMO-MESSAGGIO.md`).
- **Fatto nuovo, importante (Mario):** «le prove non posso farle adesso, si proverà tutto il prossimo anno: devo creare un software praticamente pronto con tutte le funzioni prima». Quindi NON chiedere a Mario prove dal vero (M…): si costruiscono le funzioni che mancano. Scritto in cima a `docs/DA-FARE.md`. **M29 (Hotmail) la gestisce Mario da solo**: non ricordarla.
- Riassunto «cosa ci rimane» dato a Mario (tabella in 3 parti). Spiegato «passaggio server»: per ora Mario non deve fare niente.
- Chiesto a RVC #75 (`session_01WavGbXKh2pPo9jSrRipbbc`, attiva) lo stato del D5. Risposta: **D5 non fatto**, mancano gli account Firebase e Cloudflare dell'hotel (li crea Mario con la guida di RVC, email relaisvillacarola.operation@gmail.com). Lato app RVC il ponte c'è già (messaggi `da:'rvc'`, 7 lingue); manca il pezzo nel Worker RVC (POST/GET `/ponte/messaggi` verso il nostro), dopo D5. `PONTE_KEY` serve solo quando il Worker RVC va online → prove dell'anno prossimo. Da dire a Mario in breve (non ancora detto in dettaglio: gli ho detto solo «D5 non pronto, la chiave servirà l'anno prossimo»).
- **C3 fatta**: `tools/test-firebase-bulk.mjs` (8 controlli) e `tools/test-firebase-sync.mjs` (19 controlli) ora hanno `ok()` PASS/FAIL ed escono con codice 1 se qualcosa fallisce. In sync gli errori di rete attesi senza rete («Failed to load resource») non contano. Verdi con l'emulatore.
- **C8 tolta**: `cutoutFix` era già stato tolto nella v62 (prova in `test-barra`). Tolte anche D32 (v78 online) e D24 (v69 online) da DA-FARE.
- **v80 (PR #91)** «Chiedi a Jona conosce le ricette» (era l'idea proposta in #79): `jonaRc()` in index.html aggiunge a `jonaCtx` `ricette_colonne`/`ricette` (piatto, porzioni, prezzo menù, costo a porzione, food cost %, prezzo al 30%, ingredienti senza prezzo, ingredienti [nome,q,u,costo,da]), solo se `funzOn('ricette')` e `isMgr(meU())`. Suggerimento `JONA_TIP_RC` «Quale piatto ha il food cost più alto?» nei chip se ci sono ricette. `APP_VER=80`, NEWS v80 (chef+dev), `CACHE` v84, riga v80 in CLAUDE.md. Controlli aggiunti in `tools/test-ricette.mjs` (36 verdi, anche TZ=Europe/Rome): contesto con la ricetta, niente ricette per lo staff (`S.viewAs='staff'` dentro evaluate: cliccare la barra Test con il foglio aperto andava in timeout) e con funzione spenta. Verdi anche test-news, test-giro.

## Domanda a Mario senza risposta
- «Visto che le prove dal vero sono rimandate, posso costruire le funzioni che aspettavano una prova? Per esempio l'agenda passo 2 (D11)». Da rifare col doppio tocco (strumento delle domande) se Mario non risponde. Candidati dopo: D11 (ripetizioni complete, appunti veloci dalla home, coperti → ordine suggerito), D10 (riquadro «Inviato allo chef» solo «Continua»), C7 rifiniture.

## Fatto in #79 (11/10, ~9:45-10:35 ora italiana)
- Mario: «vai» → finita la v78 e fatta la D26 (v79). Tutte e due online.
- **v78 (PR #89, squash `f5a6e8f`)**: logo YNOY CORP con 4 lune nell'apertura. La prova `test-logo-nitido` falliva solo perché la versione di prima della v75 cercava `docs/img/logo/jona-maschera-480.png`; rimessa la versione v75 della prova (percorso `docs/img/logo/jona/`). Apertura guardata a occhio: 4 lune come la foto di Mario.
- **v79 (PR #90, D26) «Ricette e costo dei piatti»**, solo gestori (`isMgr`):
  - Ingresso: riquadro `rcCta` in **Fornitori** sotto «Importa listini» (NON icona in alto: la prima versione con la pentola nella barra faceva uscire la barra a 390 px, `test-demo`/`test-giro` rossi su GitHub → E35). Striscia `rcStrip` «Costo dei piatti salito … +X%» con «Ok, visto» (`rcVisto` → `rcSnap`).
  - Funzione `ricette` in `FUNZ` con `on:true`: `funzOn` ora usa il valore di partenza se `config/app.funz` non l'ha mai toccata (agenda e hotel restano spente).
  - Dati `config/ricette` {tipo, r:{<id>:{id,n,por,pv,ing:[{pid,nome,fid,pu,q,u,pz}],rif,rifG,da,cr,mod}}}, `rcPut` (upd `r.<id>` o put), cancellare = `r.<id>: null`. Nessuna regola Firestore nuova.
  - `rcPrezzo`: prodotto del listino con la stessa unità → stesso `gkey`+unità (prima stesso fornitore, poi il più economico, «da <fornitore>») → ultimo `pz` («non più a listino, ultimo prezzo»). `rcCalc`: g/kg e ml/l (`rcU`), costo a porzione, food cost = costo / (prezzo menù / 1,10), prezzo per stare al 30%; ingredienti senza quantità o prezzo fuori dal costo con avviso. `rcSalito` ≥3% sopra `rif`. Food cost >35% in rosso.
  - Fogli `rcList`, `rcFormH` (nome, porzioni, prezzo nel menù, ingredienti con quantità + unità + costo, Togli, Elimina), `rcPick` (cerca in tutti i listini). Salvare rimette `rif` al costo attuale.
  - `APP_VER=79`, NEWS v79 (chef + dev), `CACHE` v83, riga v79 in CLAUDE.md. Prova `tools/test-ricette.mjs` (31 controlli, anche TZ=Europe/Rome), aggiunta a `VELOCI`. Verdi: test-ricette, test-agenda, test-news, test-demo, test-giro; «prove» GitHub verde.
  - Scelte tecniche: ingresso in Fornitori (dove stanno i prezzi; barra in alto piena); niente food cost senza prezzo del menù; prezzi solo per gestori (lo staff non li vede, E24).
- DA-FARE: tolta D26, aggiunta **M41** (Mario prova una ricetta vera). ERRORI: **E35**.

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni RVC
- RVC attiva: **#75** `session_01WavGbXKh2pPo9jSrRipbbc` (#63-#74 chiuse). Prima: #60 (C33 dettatura Porter). Ha mandato a Jona il codice del filtro segreti. Le ho scritto (#72) di far incollare a Mario **Codice.gs v2** PRIMA del nuovo deployment dello script del Drive (lo script è UNO per Jona e RVC), e che il nuovo URL va in `JONA_DRIVE_URL` di tutti e due gli ambienti.
- Jona #80 `session_01B4hWXa4uTY1e2ik1qt27Qq` (chiusa). Jona #79 `session_016ZY2JpTeYidZNnv7E1hABh` (chiusa). Jona #75 `session_01QPzuujHhDE3xqGshobfAn3` e #76 `session_01Ada4vhK6uEQRyN1yrqjQTF` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.

## Prossimi passi (in ordine)
1. Finire la v80 (PR #91, sopra).
2. Rifare a Mario la domanda su D11 (sopra) e costruire le funzioni che mancano. Niente richieste di prove dal vero.
3. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sopra).
5. Ponte con l'hotel: quando RVC ha D5, guida per `PONTE_KEY`. Elenco completo in `docs/DA-FARE.md`.

## Note tecniche
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…` (risposta JSON `{ok,link,cartella}`; per avere il link di una cartella si carica un file dentro). `cairosvg` e `potracer` vanno installati con pip a ogni sessione.
- Server locale `python3 -m http.server 8765`; Playwright `/opt/node22/lib/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini (cambierà dopo D30), `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare; chi ha ancora l'icona vecchia deve reinstallare (per questo l'attesa con la scatola nera).
- Repo privato: le prove su GitHub consumeranno minuti (2000/mese dell'organizzazione).
- URL del Drive: se finisse in un file pubblico, chiunque potrebbe caricare file nella cartella di Mario → in quel caso Mario fa un nuovo deployment e l'URL vecchio si spegne.

## Ultimo messaggio di Mario, parola per parola
«si e poi procedi  con il resto

le prove non posso farle adesso si proverà tutto il prossimo anno devo creare un software praticamente pronto con tutte le funzioni prima
 m29 ci penserò io»
