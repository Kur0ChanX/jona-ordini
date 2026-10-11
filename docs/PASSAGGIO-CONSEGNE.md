# Passaggio di consegne (2026-10-11, fine sessione #84)

Sessione attuale: #85

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v81** (PR #92 squash `e13dfc1`, controllato `APP_VER=81` alle 17:33). Ramo riallineato a `main` dopo lo squash.

## Fatto in #84 (11/10, ~17:05-17:45 ora italiana)
- Unite due scorte (contenevano solo `docs/ULTIMO-MESSAGGIO.md`).
- Le prove legate della v81 le aveva già finite la #83 (tutte verdi, TZ Roma: test-agenda 61, -v58 26, -v59 30, -v61 22, -v81 39, test-v16 42, test-hotel 43, test-demo 30, test-news 94, test-giro ok): fermato il mio doppione (regola MENO CONTROLLI DOPPI).
- PR #92 v81 → controllo GitHub `prove` verde su `c0b922d` → push di un merge della scorta con file identici (stesso albero `66523607…`, controllato) → squash `e13dfc1` → merge di `main` nel ramo + push → online v81.
- `docs/DA-FARE.md`: D11 chiusa; nuova **M42 5stelle**.
- Mario ha continuato a scrivere nella #83 chiusa; la #83 mi ha girato i messaggi con send_message e io le ho chiesto di rimandarlo alla sessione attiva.

## 5stelle (M42, tema dell'hotel → progetto RVC, ponte P1)
- Mario vuole sapere in automatico check-in, check-out, walk-in, camere occupate da 5stelle (gestionale dell'hotel).
- 3 strade date (dalla #83): Ovvia = API di 5stelle; **Furba (consigliata)** = rapporto automatico per email ogni mattina (PDF/Excel) letto dall'app; Geniale = dati che 5stelle manda già fuori (channel manager con API, Alloggiati Web, chiavi elettroniche); ripiego = foto del foglio arrivi letta da Gemini. Avviso privacy (dati ospiti).
- Mario: «se arriva un walk-in… si aggiorna solo la mattina, l'app diventa quasi inutile». Risposta: soluzione mista. Base da 5stelle (email, chiedere anche ogni ora; API se la danno) + novità in tempo reale: la reception tocca in RVC «Check-in camera 12, 2 ospiti» → ponte P1 → Jona in pochi secondi. Con l'API il tocco sparisce, il ponte resta uguale.
- Mario: la reception usa **già RVC ogni giorno** → strada mista confermata come direzione; la #83 l'ha girata alla sessione RVC.
- Mario deve chiedere alla reception: rapporti per email da 5stelle (anche ogni ora?) e quale channel manager usano; risposte nella sessione RVC.

## Prossimi passi (in ordine)
1. Chiedere a Mario a tocco (doppio tocco) da cosa ripartire: candidati **D10** (riquadro «Inviato allo chef» solo «Continua», immagine già mandata in #41) e **C7** (rifiniture, riga «“Oggi si ordina” arriva a» più chiara, A, C, G…).
2. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sotto).
3. M42: aspettare le risposte della reception (lavoro in RVC).
Elenco completo in `docs/DA-FARE.md`. NON chiedere a Mario prove dal vero (M…).

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #84 `session_01YDpAVby2ft8GwjUK4qGiUZ` (chiusa), #83 `session_01LzEDJuhMnDxtkkFmJoMu1G` (chiusa), #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiusa), #81 `session_014yinZg1B2R2g39VnAWDWH5` (chiusa). #80 `session_01B4hWXa4uTY1e2ik1qt27Qq`, #79 `session_016ZY2JpTeYidZNnv7E1hABh` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: #08 `session_01Ta4N7WcGt86qybK8z3uJG4` (per la regola «regole per tutti i progetti»).
- Ponte con l'hotel: RVC dice che **D5 non è fatto** (mancano gli account Firebase e Cloudflare dell'hotel, li crea Mario con la guida di RVC). `PONTE_KEY` serve solo quando il Worker RVC va online → prove dell'anno prossimo.

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
(nella #84 dopo l'handoff) «non ho cliccato il touch della risposta è si è persa... dove trovo la domanda e perché non c'è stata la regola doppio tocco». Risposta: in #84 le domande erano nel testo, non a tocco (errore E37). La #85 rifà con lo strumento + doppio tocco la domanda D10/C7.
