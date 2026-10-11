# Passaggio di consegne (2026-10-11, fine sessione #81)

Sessione attuale: #82

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). App: **v80 unita in `main`** (PR #91, squash `f0a4541`, 16:2x ora italiana); alle 16:25 il sito diceva ancora `APP_VER=79` (deploy Cloudflare in corso). **PRIMA COSA della #82**: controllare `https://jona-ristorante-by-ynoy-corp.pages.dev/` → `APP_VER=80`. Poi finire la **v81** (sotto).

## Fatto in #81 (11/10, ~15:59-16:25 ora italiana)
- Unita la scorta (solo `ULTIMO-MESSAGGIO.md`).
- **PR #91 rossa** su `7f2e823`: `test-agenda-v61` «Avvisa subito: No: nessuna notifica in più». Causa: prova legata all'ora. L'evento di prova è alle 16:00 con avviso «30 min prima»; alle 15:44 il controllo automatico (`deadlineTick`, a 4 s e ogni 60 s) creava il promemoria per chi l'ha scritto e la prova lo contava. L'app era giusta. Riprodotto con una copia della prova nello scratchpad (evento a «adesso + 14 min» + `deadlineTick()` forzato). Corretto in `tools/test-agenda-v61.mjs`: conta solo le notifiche «Nuovo/Cambiato in agenda» e chiama `deadlineTick()` apposta. **E36** in `docs/ERRORI.md`. Prove GitHub verdi su `65f3b91` → squash merge della #91 → `main` unito nel ramo (`6176d85`).
- **Mario ha confermato (doppio tocco)** le 2 regole girate da RVC #75: scritte in `CLAUDE.md` (REGOLE TRASVERSALI): «FOTO IN HD SENZA PIÙ TOKEN» e «REGOLE PER TUTTI I PROGETTI» (per ogni nuova regola su come lavoro: domanda a tocco «La mando anche a RVC e SPA Sensorial?», se sì `send_message` alle sessioni attive). Non le ho rimandate a RVC/SPA: vengono da RVC.
- **Mario ha scelto (doppio tocco): «Agenda passo 2 (D11)»** come prossimo lavoro. Le prove dal vero restano rimandate all'anno prossimo.

## v81 (D11) in corso: codice scritto, commit `5d2b011`
Tutto in `index.html`. Già verdi (in locale, TZ Roma): `test-agenda`, `test-agenda-v58`, `test-agenda-v59`, `test-agenda-v61`.
1. **Ripetizioni complete**: `AG_R` (No, Ogni giorno `g`, Giorni scelti `gs` con `rg` 0=lun..6=dom, Ogni settimana `s`, Ogni mese `m`, Ogni anno `a`), `rf` «Fino al» (facoltativo, compreso), `rx` giorni saltati. `agOnDay` riscritta, `agRg`, `agRLbl` (etichetta «ogni lun, mer» / «fino al 3 novembre»). Modulo: chip «Ripeti» (`agfR`), chip dei giorni (`agfRg`), campo `#agf-rf`, pulsante «Salta solo <giorno>» (`agSkip`, `.ag-skip`) se l'evento salvato è ripetuto e aperto da un giorno (`agEdit` passa `dg` da `data-g`). `agSave` controlla: almeno un giorno per `gs`, «fino al» non prima della data; tiene `rx` e `ckd`. «Avvisa subito» aggiunge «· ogni …» al testo.
   - **Cose da fare negli eventi ripetuti**: la spunta vale solo per quel giorno (`ckd.d<AAAAMMGG>` = indici fatti, potati oltre 60 giorni; `agCkK`, `agCkOk`). `agEvH(e,me,mgr,next,g)` ha ora il giorno `g`; `agCk` riceve `id|i|g`.
   - Riga veloce `agParse`: «ogni giorno», «tutti i giorni», «ogni settimana/mese/anno», «ogni lunedì»/«tutti i lunedì» → `r` (il giorno della settimana dà la data di partenza). Restituisce anche `r`.
2. **Appunti veloci dalla home**: per chi scrive in agenda (`agCan`) la striscia diventa `.ag-strip.ag-can` con il testo (eventi di oggi o «Oggi niente in agenda» + «N appunti») e il pulsante **Appunto** (`agNtQ` → `agNtQuick`: foglio «Appunti di oggi» con `agNotesH`, tastiera subito aperta, «Apri l'agenda» `agFull`). Senza eventi oggi la striscia c'è solo nella prima scheda (`GM_TABS[0]`/`DEV_TABS[0]`/`STAFF_TABS[0]`). Lo staff semplice ha la striscia di prima. Dettatura anche per gli appunti: `agMic(dst)` con `dst` `q` (riga veloce) o `nt` (appunto, poi `A.agNtAdd`), `S.ag.mic` ora vale `'q'|'nt'|false`.
3. **Coperti in agenda → ordine suggerito**: `sugAgenda(cad)` somma i coperti degli eventi da domani per `cad` giorni (come il meteo); fattore = 1 + coperti / (coperti di un giorno normale × giorni), max ×3, moltiplicato al meteo in `sugRows`. `sugAgH(st)` sotto «Quanta gente ti aspetti?»: «In agenda: N coperti · sab Gruppo Rossi 40…»; se manca `config/app.copNorm` campo «Coperti in un giorno normale» + Salva (`sugCnSave`), altrimenti «Eventi: +X% (giorno normale N coperti · cambia)» con «Usa l'agenda / Ignora» (`sugAg`, `S.sug.useAg`). Solo con la funzione agenda accesa. Scelta mia: i coperti degli eventi contano «in più» rispetto a un giorno normale (gruppi, matrimoni); il gestore può sempre toccare «Ignora».
   - CSS nuovi: `.sug-lnk`, `.ag-skip`. IN nuovo: `sugCn`.

**Da fare per chiudere la v81** (in ordine):
1. Prova nuova `tools/test-agenda-v81.mjs` (modalità locale, come `test-agenda-v61`): `agOnDay` per tutti i tipi (giorno, giorni scelti, anno, fino al, saltati), modulo (chip, giorni, «Scegli almeno un giorno», «fino al» prima della data), «Salta solo …», spunta per giorno negli eventi ripetuti, `agParse` «ogni lunedì»/«tutti i giorni», striscia con «Appunto» (gestore sì, staff no; vuota solo nella prima scheda), foglio appunti veloci (aggiungi, spunta), ordine suggerito con coperti (servono 2+ ordini inviati del fornitore: vedi come fa `test-v40`/`test-hotel` per `sugStats`), `copNorm` salvato, «Ignora», 320 px senza scorrimento. Rilanciare anche con `TZ=Europe/Rome` (E18). Aggiungerla a `VELOCI` in `tools/prova-ci.sh`.
2. `APP_VER=81`, voce NEWS v81 (chef + dev), `CACHE` v85 in `sw.js`, riga v81 in `CLAUDE.md`.
3. Prove legate: test-agenda*, test-v40 (ordine suggerito?), test-hotel (usa `htSugH`), test-demo, test-giro (la striscia cambia: E35). Poi PR dal ramo unico, «prove» verde → squash → `git fetch origin main && git merge origin/main` → push → controllo online.
4. `docs/DA-FARE.md`: togliere D11 quando online.

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #81 `session_014yinZg1B2R2g39VnAWDWH5` (chiusa). #80 `session_01B4hWXa4uTY1e2ik1qt27Qq`, #79 `session_016ZY2JpTeYidZNnv7E1hABh` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#75** `session_01WavGbXKh2pPo9jSrRipbbc`. SPA attiva: #08 `session_01Ta4N7WcGt86qybK8z3uJG4` (per la regola «regole per tutti i progetti»).
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
Risposte a tocco (doppio tocco) di Mario in #81:
- «RVC dice che mi hai dato 2 regole per tutti i progetti… Le scrivo anche in Jona?» → «Sì, tutte e due (Consigliato)» · «Sì, confermo le regole».
- «Le prove dal vero sono rimandate all'anno prossimo. Da cosa parto per completare l'app?» → «Agenda passo 2 (Consigliato)» · «Sì, confermo da dove parto».
