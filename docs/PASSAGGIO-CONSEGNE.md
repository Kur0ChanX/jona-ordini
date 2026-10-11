# Passaggio di consegne (2026-10-11, fine sessione #87)

Sessione attuale: #88

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v83** (PR #94, squash `4507927`, 11/10 ~22:00). **v84 Cantina Vini nella PR #95** (aperta 22:24, controllo `prove` in corso).

## ✅ SUBITO (#88): chiudere la PR #95 (v84 Cantina Vini)
- Controllo `prove` sul commit `56a1c1a` partito alle 22:24 ora italiana. Se è verde: squash della PR #95 → subito `git fetch origin main && git merge origin/main` sul ramo + push → controllo online `APP_VER=84` su https://jona-ristorante-by-ynoy-corp.pages.dev/ (E33). Se rosso: capire la causa e correggere (non saltare prove).
- Prove già fatte in #87, tutte verdi: `test-cantina` (43 PASS, anche con TZ Roma), `test-news`, `test-demo`, `test-campi-16`, `test-ricette`, `test-giro`. Non rifarle.
- Dopo la pubblicazione: in `docs/DA-FARE.md` segnare D34 come fatta (resta solo la domanda delle vendite, sotto).

## Ultima richiesta di Mario (#87, 22:2x): grafica e leggerezza — vale per D34-D36 e d'ora in poi
«cura la grafica in stile moderno e attinente all'app e non appesantire l'app deve andare su anche telefoni normali non troppo performanti ultimi usciti» + «Vai avanti da solo chiedimi solo scelte importanti».
- Quindi: aspetto moderno nello stile dell'app (variabili `--lagoon`, `--ocra`, `--surface`, `.sug-cta`, `.chip`, `.seg`, fogli `.sheet`); niente immagini pesanti, niente librerie nuove, niente animazioni continue; liste lunghe (es. 200 cocktail) senza appesantire: dati compatti, filtro/ricerca, al massimo ~60 righe disegnate alla volta (come `rcPick` fa con `slice(0,80)`).
- Possibile controllo per D34: guardare la Cantina Vini anche in tema scuro e a 320 px (foto fatta solo a 390 chiaro: andava bene). Se serve una rifinitura, in una versione piccola dopo la v84.
- Mario vuole che si vada avanti da soli: chiedere solo scelte importanti (gusti grossi, soldi, cose del ristorante). Domande scritte nel testo (E38).

## Fatto in #87 (11/10, 21:50-22:30 ora italiana)
- Unita la scorta della #86 (solo `docs/ULTIMO-MESSAGGIO.md`, messaggio delle 20:09 già gestito).
- **v83 pubblicata**: PR #94 → prove verdi → squash → ramo riallineato → online `APP_VER=83`. D32 tolta da DA-FARE.
- **Richiesta nuova di Mario** arrivata dalla #86 (scritta lì per sbaglio, girata con send_message): salvata parola per parola in `docs/richieste/cantina-vini-cocktail.md`; in DA-FARE: **D34** Cantina Vini, **D35** Chef de rang e ruoli mancanti, **D36** Bartender: Cocktail (~200 più famosi) + inventario alcolici (bottiglie intera / 2/3 / metà / 1/3).
- **v84 Cantina Vini (D34)** fatta (dettagli in CLAUDE.md, riga v84; NEWS v84; `CACHE` v88; demo con 4 vini e 3 vendite). Scelte prese e perché:
  - Dati in `config/cantina` (un documento, come le ricette: le regole Firestore permettono già `config` a ogni membro, niente regole nuove) + movimenti per mese in `config/cantina_mov_<AAAA-MM>` (vendite del mese senza documenti enormi).
  - Niente foto salvate (peserebbero sul documento e sul telefono): pallino colorato per tipo di vino.
  - IA: `gemCall` (stessa via di agenda e listini; con Firebase passa dal Worker `/gemini`, niente chiave sul telefono). Prompt: premi mai inventati, annata e gradi solo se letti; `sicuro:false` → avviso «controlla bene». Riempie solo i campi vuoti (non cancella quello scritto a mano). Doppione (stesso nome, cantina, annata) → apre quello già in cantina.
  - «Supporto al tavolo» inventato per Mario: riquadro «Al tavolo in 10 secondi» (frase da dire ≤25 parole + 3 parole chiave + va con + servizio + prezzo), e «Consiglia» per piatto con solo i vini in casa, i più venduti prima.
  - Vendite: per ora pulsante «− Venduta» (e − / + nell'Inventario); vendita con 0 in casa chiede conferma, mai sotto zero.
  - Chi vede: gestori in Fornitori; staff non di cucina in «Cosa serve?» (Catalogo). Modifica: gestori, `fb`, `resp`, `sala` (`vnCan`). Prezzo d'acquisto solo `isMgr`; se l'F&B salva, il prezzo d'acquisto resta.
- Foto per Mario: `cantina-v84.png` (Carta, Consiglia «Pesce», scheda, Inventario) mandata; script nello scratchpad della #87 (si rifà con Playwright su `/#demo` → `demoGo` → Fornitori → `vnOpen`).

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, poi pubblicare in automatico se le prove sono verdi)
1. PR #95 (sopra).
2. **D35 ruoli**: `MANSIONI` (index.html, riga ~1465) oggi = Chef, Sous chef, Cuoco, Commis, Pasticcere, Lavapiatti, Maître, Cameriere, Sommelier, Barman, F&B manager, Altro. Aggiungere almeno **Chef de rang**, **Bartender** (Mario usa questa parola; tenere «Barman» per i profili vecchi o rinominare con cura), Commis di sala, Chef de partie, Pizzaiolo?, Barback?, Receptionist/Hostess? (scegliere da soli quelli tipici di un ristorante d'hotel). Valutare un reparto `bar` in `REPARTI` (oggi cucina, sala, fb, resp, altro): attenzione a chat `rep_<reparto>`, `OR_PLAN`, orari per reparto, `newsFor`, prove `test-orari-reparto`/`test-responsabile`.
3. **D36 Bartender**: sezione **Cocktail** (circa 200 cocktail famosi: ingredienti con dosi, metodo, bicchiere, guarnizione, passaggi brevi da manuale IBA) — dati in un file statico leggero (es. `data/cocktail.json` caricato solo quando si apre, aggiunto a `FILES` di `sw.js` e al passo «Prepara i file» del workflow Cloudflare), ricerca e filtri; + **inventario alcolici** con bottiglia intera / 2/3 / metà / 1/3 (simile a `vnMov`, con `config/bar` e movimenti). Ingresso per chi ha mansione Bartender/Barman (e gestori).
4. D33 (funzioni smart per orari e agenda): proposta con 3 strade (dettagli sotto).

## v83 (D32) — riassunto
- Orari dei responsabili (`resp.<id>`, striscia «Chi c'è adesso» `rsStrip`/`rsChat`) + orari per reparto (sopra). Dettagli in CLAUDE.md (riga v83). `APP_VER=83`, `CACHE` v87.
- Foto per Mario (non nel repo): script nello scratchpad della #86, si rifanno con Playwright se servono.

## D34-D36 — richiesta nuova di Mario (scritta per sbaglio nella #86, girata alla #87 alle 22:12)
Cantina Vini (D34), ruolo Chef de rang e ruoli mancanti (D35), Cocktail e inventario alcolici per il Bartender (D36). Testo parola per parola in `docs/richieste/cantina-vini-cocktail.md`. Da fare «in coda senza fermarsi» dopo la v83. Domande a Mario scritte nel testo (E38); chiedere solo cose del ristorante (es. vendite da scontrini o cassa).

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Proporre con immagine + domanda a tocco con doppio tocco (3 strade: ovvia/furba/geniale). Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima, il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiusa), #86 `session_01XaFfJiACdkE4pXQs6PbCok` (chiusa), #85 `session_01YBt4KxQa3Z4RMeKrQdvghK`, #84 `session_01YDpAVby2ft8GwjUK4qGiUZ`, #83 `session_01LzEDJuhMnDxtkkFmJoMu1G`, #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: **#09** `session_011dYniwuL2fEfLGEsTVRWrp`. Una sessione ferma su una domanda o un permesso non legge i messaggi delle altre finché Mario non risponde lì.
- Ponte con l'hotel: RVC dice che **D5 non è fatto**. M42 5stelle: si aspettano le risposte della reception (in RVC).
- D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sotto).

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

## E38 (aperto)
Risposte a tocco arrivate senza che Mario toccasse (#85). Causa non capita. Finché non è chiaro: domande scritte nel testo, risposta a parole. Rimedi possibili in ERRORI.md E38.

## Ultimo messaggio di Mario, parola per parola
«cura la grafica in stile moderno e attinente all'app e non appesantire l'app deve andare su anche telefoni normali non troppo performanti ultimi usciti

Vai avanti da solo chiedimi solo scelte importanti»
(Arrivato dopo il messaggio sulla v84 e la domanda sulle vendite dei vini.)
