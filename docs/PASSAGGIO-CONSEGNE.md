# Passaggio di consegne (2026-10-12, fine sessione #113)

Sessione attuale: #114

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Stato all'handoff: **v97 online** (controllato `APP_VER` 97 su https://jona-ristorante-by-ynoy-corp.pages.dev/ alle 17:14). Nel ramo: `APP_VER` 97, `CACHE` `jona-ordini-v101`, nessuna PR aperta.

## ✅ SUBITO (#114)
1. ✅ CHIUSO in #114: Mario ha visto che Cantina e Cocktail sono già in Fornitori («scusa visto ora che si trova in fornitori»). Niente da cambiare. Vecchia nota: **Richiesta di Mario (#113, 17:16)**: «metti cantina vini e cocktail anche dallo chef ovviamente». Stato oggi (letto in #113, niente cambiato):
   - Gestori (`isMgr`, quindi Maurizio Admin Chef) vedono già Ricette, Cantina e Bar come pulsanti nella scheda **Fornitori** (`${rcCta(meU())}${vnCta(meU())}${brCta(meU())}`).
   - Staff: in «Cosa serve?» `vnCta` solo se `me.reparto!=='cucina'`, `brCta` per chi non è gestore ma il Bar si apre solo con `brCan` (gestori, fb, resp, bartender/barman/barback). Quindi **il personale di cucina non vede né Cantina né Cocktail**.
   - Interpretazione più probabile: dare Cantina (sola lettura: carta, «Consiglia», scheda «Al tavolo») e Cocktail (lettura, ricette e passaggi) anche al reparto `cucina` / alla vista «Admin Chef» in modo visibile. Da chiarire con UNA domanda (E38: scritta nel testo, risposta a parole): «Per "chef" intendi Maurizio (Admin Chef, oggi li trova in Fornitori) o tutta la cucina (cuochi, che oggi non li vedono)?». Se tutta la cucina: in sola lettura o anche modifica/inventario? Poi fare la versione v98 (NEWS, `APP_VER` 98, `CACHE` v102, riga in CLAUDE.md), prove `test-cantina`, `test-bar`, `test-testbar`, `test-news`, `test-giro` + `test-dispositivi`.
2. Mario proverà la foto del vino sull'iPhone (v96) quando torna in hotel («non sono in hotel ora»). Va bene anche una bottiglia a casa.
3. #114: Mario «si» alla prova → bozza `tools/bozze/cocktail-bellissimi.mjs` (Spritz, Mojito, Negroni disegnati a mano: vetro trasparente, luce a pennello, ghiaccio che rifrange, frutta dentro, goccioline, linee colorate; foto `docs/img/sessione-114/cocktail-prova-*.png`, servono le foto «oggi» dall'app demo). Domanda: «Ti piace? Così per tutti i 212 è un lavoro grande.» In attesa. Vecchia domanda: «Ora preparo un disegno di prova per i cocktail "bellissimi", senza toccare l'app. Ti va bene?» (Mario ha risposto con la richiesta sopra, non con sì/no). Proposta SMART: vedi «Idee».
4. Mario prova D44 (v93) e D43 (passaggi dei cocktail) quando può.

## Fatto in #113 (12/10, ~16:49-17:16 ora italiana)
- Avvio: scorta unita due volte (solo ULTIMO-MESSAGGIO: «non sono in hotel ora», poi «ok»).
- PR #107 v97: prove verdi su `428cc55` → squash `c7b631e` (17:13), `main` unito nel ramo + push, **v97 online alle 17:14** (controllato). Routine di controllo `trig_01ArZvGTU7DCKwEGRiWtpKL8` cancellata, iscrizione alla PR tolta.
- Handoff per l'avviso dell'hook (contesto ~140k) subito dopo la richiesta nuova di Mario.

## Fatto in #112 (12/10, ~15:20-16:20 ora italiana)
- Scorta unita (vecchia, solo ULTIMO-MESSAGGIO). Il giro «bloccato» della #111 non lo era: 31 minuti di installazione dei browser su GitHub.
- v96 ONLINE (PR #106 squash `9879904`, 16:13; main unito nel ramo).
- v97 difetto 18: in `garn` di `tools/bar-disegni.mjs` la scorza con `slot > 1` (dopo una fetta) va `x -= 10` (distanza 24 invece di 14). Nel JSON cambia solo `k.Americano` (controllato). Controllo nuovo in `test-bar-disegni` (73 PASS); test-bar 38, test-news 94, test-testbar 13. Solo l'Americano ha fetta + scorza. Foto prima/dopo mandata a Mario. NEWS v97, `APP_VER` 97, `CACHE` v101, riga v97 in CLAUDE.md, D42 in DA-FARE aggiornato.
- Giro su `4014f1b`: `test-foto-vino` Mac «page.reload: Page crashed» (ricarica con la finestra dei file aperta). Corretto: «fotocamera aperta + app chiusa» = pagina nuova nello stesso contesto (`nuova()`), la vecchia chiusa (`54fd0ed`). E49 in ERRORI.

## Fatto in #111 (12/10, ~13:25-14:45 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO «via»), push.
- `test-news` rossa: lo staff vedeva «Gemini» nella NEWS v96 → testo «Se l'IA passa a un lettore di riserva, la scheda dice il motivo vero.» (94 PASS).
- `test-foto-vino` rossa solo sul Mac (WebKit desktop), 3 giri su GitHub per capire:
  1. `1ebde2e`: attesa della richiesta all'IA da 1,2 s a fino a 10 s (non era quello).
  2. `0ee5b06`: diagnosi DENTRO la riga FAIL (GitHub mostra solo le righe FAIL) + errori console → «richieste 0, console 400»: la richiesta andava al vero Google con la chiave finta.
  3. `dd7f978`: causa = service worker attivo: Playwright su WebKit desktop non intercetta (route) la richiesta. Contesto con `serviceWorkers:'block'` (come test-agenda*). L'app vera non c'entra: sw.js lascia passare POST e altri siti. E48 in ERRORI. Risultato: passati foto all'IA e «Chiudi», poi `page.reload` scaduto (30 s) alla riga «fotocamera aperta + ricarica»: con la finestra dei file aperta WebKit desktop non dà «load».
  4. `7415c27`: quella ricarica con `{waitUntil:'commit'}` (poi aspetta `.vn-rip`). In locale 36 PASS (WebKit SALTATA). Su GitHub il giro di `7415c27` era ANCORA IN CORSO dopo 40 minuti (di solito ~20): probabile prova bloccata sul Mac (WebKit desktop) senza tempo massimo, forse `test-foto-vino` dopo la ricarica con la finestra dei file aperta. Il push delle consegne ha fatto ripartire il giro: se si blocca ancora, nella vista Mac saltare il solo passo «fotocamera aperta + ricarica» NON si fa (vietato spegnere prove): mettere un tempo massimo a quel passo, chiudere prima la finestra dei file in WebKit desktop (es. `fc.setFiles([])` dove serve) oppure aprire una pagina nuova al posto della ricarica, e capire la causa.
- Handoff fatto per il contesto (avviso dell'hook) mentre girava il giro di `7415c27`.

## Fatto in #110 (12/10, ~13:05-13:25 ora italiana)
- Avvio: scorta unita (solo ULTIMO-MESSAGGIO con la domanda «Lite», già nota), push.
- **PR #106** aperta dal ramo verso `main` (v96 D45), prove partite 13:06, ROSSE alle 13:23 (test-foto-vino Mac, test-news: vedi SUBITO 1).
- Messaggio dalla #109: dopo l'handoff Mario ha scritto solo «ok» (nessuna richiesta nuova).
- Mario in #110: «via» → ho continuato con D46 mentre giravano le prove.
- **D46** `tools/test-dispositivi.mjs`: lancia `test-giro.mjs` in processi separati con `GIRO_DEV` (nomi dei dispositivi di Playwright separati da «|», contesto `{...devices[nome], deviceScaleFactor:1}`): Chromium «Pixel 7|Galaxy Tab S4», WebKit «iPhone 15|iPad (gen 7)|Desktop Safari» (SALTATA in locale, FAIL su GitHub senza WebKit). PC già coperto da `test-giro-computer` (1280/1440). In `VELOCI` di `tools/prova-ci.sh`. Locale: PASS Android (2 min), `test-giro` normale ancora PASS. Riga in CLAUDE.md (regola dispositivi) e D46 in DA-FARE.
- Commit D46 NON pushato durante le prove (E39); l'hook di fine risposta lo chiedeva a ogni messaggio: normale, si ignora finché le prove girano.

## Fatto in #109 (riassunto)
- v96 D45 scritta (`fotoPiccola`, bozza del vino, lettori falliti). Dettagli nella riga v96 di CLAUDE.md e in E47.

## Fatto in #107 (riassunto)
- Collaudo mandato a RVC #92 e SPA #14. v95 difetti dei colori dei cocktail (`COLX`, `LAY`, `wavy`, Painkiller, fiamma). E46: i disegni leggono le vecchie frasi da `tools/cocktail-frasi.json`. Dettagli nella riga v95 di CLAUDE.md.

## Fatto in #106 (riassunto)
- v93 (PR #103) e v94 D43 passaggi dei cocktail (PR #104, squash `81921b5`) online. Dettagli nella riga v94 di CLAUDE.md e nei commit.

## Fatto in #105 (riassunto)
- PR #102 v92 (FAIL di `test-testbar` per un commento con il nome del creatore → corretto in `(#101)`). v93 D44 dalle bozze `tools/bozze/d44-*.py`; vista «Bar» nella barra Test (`VIEW_AS.bar`, barista vede Bar e Cantina, ordina e invia allo chef). Lezione: controllare `test-testbar` anche dopo commenti nuovi nel codice.

## Fatto in #103-#104 (riassunto)
- #104: D44 progettata in bozza. Context7 aveva finito la quota mensile gratuita: usare la ricerca web o chiedere a Mario una chiave gratis su context7.com/dashboard.
- #103: regola di stile applicata ai pezzi dei cocktail (`c`/`cf`/`cp` col tono scuro del pezzo, `LEGNO`), tazza di rame dei Mule (`rm|`, `sf|`, `oc`), niente `badge`, cannuccia e ombrellino, agrumi con albedo e `twist`. Dettagli nella riga v92 di CLAUDE.md e nella storia dei commit.

## Idee (da #100)
- **SMART per cocktail «bellissimi»** (Mario «non bellissime… mi accontento»): UNA strada più ambiziosa, con bozza ferma e domanda (E19/E38). Spunti: ghiaccio a tanti cerchietti chiari, frutta grande DENTRO il bicchiere (spicchi di lime nel Mojito), contorni delle guarnizioni colorati, tratto a pennello con spessore che cambia, superficie schiumosa, ciliegina con riflesso.

## Fatto in #100-#102 (riassunto)
- Stile C dei cocktail, panna `cream`, `spiral`, bollicine nei calici, arco della Piña Colada, elenco dei 21 difetti. Dettagli nella riga v92 di CLAUDE.md e nei commit.

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
- Jona #113 `session_01Rs2wW3qtEsVmaZtPkUz1Ei` (chiusa), #112 `session_01BE2ryA88ArUAZd9NyaGvrx` (chiusa), #111 `session_014JToN22uoTmG4osX9ScPhz` (chiusa), #110 `session_01QbaaAWWe28daKawzaaSb87` (chiusa), #109 `session_01N97sLf9HZ1a5TGP2TnTRsD` (chiusa), #108 `session_019f4wJG2gdxbuqrEvomUcYx` (chiusa), #107 `session_018zMHKEtsWAECS8Kf4wLjhw` (chiusa), #106 `session_019NMEenGwfWR4T8nH4n1bTV` (chiusa), #105 (chiusa, id nelle consegne di #105 nella storia), #104 `session_01EJmeBxR3qSz8gs4Zxtxwdc`, #103 `session_01PQwMNp8FBcD6HAGnbTtBEB`, #102 `session_01X1y9TToVXuFHrms1cxvCyw`, #101 `session_0141yTsGHB7Ns7NrFjZ7sn5j`, #100 `session_012UpbnoEghY7djrbt8t3jBq`, #99 `session_01EJWztt4yYAtG2FhL7ryBnw`, #98 `session_01PgAxZzTSbFoVtpzVYVdnxK`, #97 `session_012kt4UwsGjC3SCruV9oiyM6`, #96 `session_01Sj7TpaG8q6Ffu7CiJ6mgWR`, #95 `session_01QsPmY12GJ337y47Kax1f2a`, #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#92** `session_01Mc34LWsJw9PKUiUJvYcPxB`. SPA attiva: **#14** `session_016iyo14hpB7Qq4UWfhfCqgV` (nomi da ricontrollare con `list_sessions` prima di mandare messaggi).
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
(12/10/2026 ~17:16 ora italiana, #113) «metti cantina vini e cocktail anche dallo chef ovviamente»
(12/10/2026 ~16:51, #113) «ok» (dopo: controllo di sicurezza alle 17:41).
(12/10/2026 ~16:30, #112) «non sono in hotel ora» (risposta a: prova la foto del vino sull'iPhone).
Messaggi più vecchi: nella storia di questo file. Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
