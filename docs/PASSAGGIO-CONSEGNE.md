# Passaggio di consegne (2026-10-11, fine sessione #83)

Sessione attuale: #84

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v80** (controllato in #83: `APP_VER=80`). **v81 pronta sul ramo, NON ancora pubblicata.**

## Fatto in #83 (11/10, ~17:00-17:35 ora italiana)
- Unita la scorta, controllo online v80 ok.
- Via libera di Mario per la v81 arrivato dalla #82 («ok vai», girato con send_message).
- Scritta `tools/test-agenda-v81.mjs` (39 PASS, anche con `TZ=Europe/Rome`): agOnDay per ogni tipo, etichette, `agParse` «ogni lunedì / tutti i giorni / ogni mese / tutti i venerdì», modulo (6 chip Ripeti, 7 giorni, «Scegli almeno un giorno», «fino al» prima), «Salta solo…», spunta per giorno (`ckd`), striscia con «Appunto» (dev sì, staff no, vuota solo nella prima scheda), foglio «Appunti di oggi», coperti nell'ordine suggerito (`copNorm` 60, +22%, «Ignora»), 320 px, agenda spenta → `sugAgenda` null. Aggiunta a `VELOCI` in `tools/prova-ci.sh`.
- `APP_VER=81`, NEWS v81 (chef + dev), `CACHE` `jona-ordini-v85` in `sw.js`, riga v81 in `CLAUDE.md`. Commit e push sul ramo.
- Lanciate in background le prove legate (test-agenda, -v58, -v59, -v61, -v81, test-v16 (ordine suggerito), test-hotel, test-demo, test-news, test-giro) con TZ Roma: **l'esito è rimasto nella #83** (handoff scattato a 142k). La #84 le rilancia.
- Mario ha chiesto come collegare **5stelle** (il programma gestionale dell'hotel, PMS). Risposto in breve: serve un'interfaccia (API) dal fornitore di 5stelle; è un tema dell'hotel → va nel progetto RVC (ponte, P2 addebiti in `docs/PONTE-RVC.md`, «no per ora» da #30). Datogli un messaggio da mandare al fornitore. Aspettare la sua risposta (documentazione API, costi).

## Da fare in #84 (in ordine)
1. Rilanciare le prove legate qui sopra (TZ=Europe/Rome). Se verdi: PR dal ramo unico verso `main`, controllo GitHub «prove» verde → squash merge → SUBITO `git fetch origin main && git merge origin/main` + push → controllo online `APP_VER=81` (PUBBLICA SEMPRE IN AUTOMATICO).
2. `docs/DA-FARE.md`: togliere D11 quando online; aggiungere voce per 5stelle (Mario: chiedere API al fornitore; poi Claude studia con RVC).
3. Poi chiedere a Mario a tocco (doppio tocco) da cosa ripartire (candidati D10, C7).

## v81 (D11): codice (commit `5d2b011`) + prova e versione (commit di #83)
Tutto in `index.html`. Già verdi (in locale, TZ Roma): `test-agenda`, `test-agenda-v58`, `test-agenda-v59`, `test-agenda-v61`.
1. **Ripetizioni complete**: `AG_R` (No, Ogni giorno `g`, Giorni scelti `gs` con `rg` 0=lun..6=dom, Ogni settimana `s`, Ogni mese `m`, Ogni anno `a`), `rf` «Fino al» (facoltativo, compreso), `rx` giorni saltati. `agOnDay` riscritta, `agRg`, `agRLbl` (etichetta «ogni lun, mer» / «fino al 3 novembre»). Modulo: chip «Ripeti» (`agfR`), chip dei giorni (`agfRg`), campo `#agf-rf`, pulsante «Salta solo <giorno>» (`agSkip`, `.ag-skip`) se l'evento salvato è ripetuto e aperto da un giorno (`agEdit` passa `dg` da `data-g`). `agSave` controlla: almeno un giorno per `gs`, «fino al» non prima della data; tiene `rx` e `ckd`. «Avvisa subito» aggiunge «· ogni …» al testo.
   - **Cose da fare negli eventi ripetuti**: la spunta vale solo per quel giorno (`ckd.d<AAAAMMGG>` = indici fatti, potati oltre 60 giorni; `agCkK`, `agCkOk`). `agEvH(e,me,mgr,next,g)` ha ora il giorno `g`; `agCk` riceve `id|i|g`.
   - Riga veloce `agParse`: «ogni giorno», «tutti i giorni», «ogni settimana/mese/anno», «ogni lunedì»/«tutti i lunedì» → `r` (il giorno della settimana dà la data di partenza). Restituisce anche `r`.
2. **Appunti veloci dalla home**: per chi scrive in agenda (`agCan`) la striscia diventa `.ag-strip.ag-can` con il testo (eventi di oggi o «Oggi niente in agenda» + «N appunti») e il pulsante **Appunto** (`agNtQ` → `agNtQuick`: foglio «Appunti di oggi» con `agNotesH`, tastiera subito aperta, «Apri l'agenda» `agFull`). Senza eventi oggi la striscia c'è solo nella prima scheda (`GM_TABS[0]`/`DEV_TABS[0]`/`STAFF_TABS[0]`). Lo staff semplice ha la striscia di prima. Dettatura anche per gli appunti: `agMic(dst)` con `dst` `q` (riga veloce) o `nt` (appunto, poi `A.agNtAdd`), `S.ag.mic` ora vale `'q'|'nt'|false`.
3. **Coperti in agenda → ordine suggerito**: `sugAgenda(cad)` somma i coperti degli eventi da domani per `cad` giorni (come il meteo); fattore = 1 + coperti / (coperti di un giorno normale × giorni), max ×3, moltiplicato al meteo in `sugRows`. `sugAgH(st)` sotto «Quanta gente ti aspetti?»: «In agenda: N coperti · sab Gruppo Rossi 40…»; se manca `config/app.copNorm` campo «Coperti in un giorno normale» + Salva (`sugCnSave`), altrimenti «Eventi: +X% (giorno normale N coperti · cambia)» con «Usa l'agenda / Ignora» (`sugAg`, `S.sug.useAg`). Solo con la funzione agenda accesa. Scelta mia: i coperti degli eventi contano «in più» rispetto a un giorno normale (gruppi, matrimoni); il gestore può sempre toccare «Ignora».
   - CSS nuovi: `.sug-lnk`, `.ag-skip`. IN nuovo: `sugCn`.

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #83 `session_01LzEDJuhMnDxtkkFmJoMu1G` (chiusa), #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiusa), #81 `session_014yinZg1B2R2g39VnAWDWH5` (chiusa). #80 `session_01B4hWXa4uTY1e2ik1qt27Qq`, #79 `session_016ZY2JpTeYidZNnv7E1hABh` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: #08 `session_01Ta4N7WcGt86qybK8z3uJG4` (per la regola «regole per tutti i progetti»).
- Ponte con l'hotel: RVC dice che **D5 non è fatto** (mancano gli account Firebase e Cloudflare dell'hotel, li crea Mario con la guida di RVC). `PONTE_KEY` serve solo quando il Worker RVC va online → prove dell'anno prossimo.

## Prossimi passi (in ordine)
1. Controllo online v80 (sopra).
2. Finire la v81 (sopra) e pubblicarla in automatico se le prove sono verdi.
3. Poi altre funzioni che mancano (Mario vuole un software «praticamente pronto con tutte le funzioni» prima delle prove dell'anno prossimo): candidati D10 (riquadro «Inviato allo chef» solo «Continua»), C7 rifiniture; chiedere a Mario a tocco (doppio tocco) da cosa partire.
4. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sopra).
Elenco completo in `docs/DA-FARE.md`. NON chiedere a Mario prove dal vero (M…); M29 la gestisce lui.

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
«/Btw come collego il progtamma a 5 stelle cosí mi porto avanti»
