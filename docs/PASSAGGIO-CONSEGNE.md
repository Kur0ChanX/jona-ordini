# Passaggio di consegne (2026-10-11, fine sessione #88)

Sessione attuale: #89

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v84** Cantina Vini (PR #95, squash `050db8d`, online alle 22:46). **v85 nella PR #96** (aperta ~22:45, controllo `prove` in corso sul commit `9757eee`).

## ✅ SUBITO (#89): chiudere la PR #96 (v85 ruoli + Bar)
- Se `prove` è verde: squash della PR #96 → subito `git fetch origin main && git merge origin/main` sul ramo + push → controllo online `APP_VER=85` su https://jona-ristorante-by-ynoy-corp.pages.dev/ (E33). Se rosso: capire la causa e correggere.
- Prove già fatte in #88, tutte verdi: `test-bar` (35 PASS, anche TZ Roma), `test-cantina`, `test-news`, `test-demo`, `test-campi-16`, `test-giro`. Non rifarle.
- Dopo: in `docs/DA-FARE.md` togliere la riga D35-D36. Poi dire a Mario in breve cosa c'è di nuovo (v84 + v85) e mandargli una foto del Bar (Playwright su `/#demo` → `demoGo` → Fornitori → `brOpen`; in demo ci sono 10 bottiglie, Havana a ⅓ «da riordinare»).

## Fatto in #88 (11/10, 22:26-22:50 ora italiana)
- Unita la scorta (solo `docs/ULTIMO-MESSAGGIO.md`, richiesta D34-D36 già salvata).
- **v84 pubblicata** (PR #95 verde → squash → ramo riallineato → online).
- **v85 (D35 + D36)** fatta. Scelte e perché:
  - D35: niente reparto `bar` nuovo (toccherebbe chat `rep_`, orari per reparto, `OR_PLAN`, prove: rischio alto per poco). Il Bartender è una **mansione** (reparto Sala). Mansioni in gruppi con optgroup: Cucina (Chef, Sous chef, Chef de partie, Cuoco, Commis di cucina, Pasticcere, Pizzaiolo, Lavapiatti), Sala (Maître, Chef de rang, Commis di sala, Cameriere, Runner, Hostess, Sommelier), Bar (Bartender, Barback), Gestione (F&B manager), Altro. «Barman» e «Commis» dei profili vecchi restano (`mansOpt` li mette in cima scelti, non cambiano da soli). Demo: Andrea = Bartender.
  - D36: 212 cocktail (89 IBA) scritti in `tools/cocktail.txt` (una riga per cocktail, facile da correggere) → `python3 tools/cocktail.py` → `data/cocktail.json` (44 KB, scaricato solo quando si apre il Bar: l'app non pesa di più). Lista disegnata 60 alla volta («Mostra altri»). Ricerca per nome o ingrediente, filtri per famiglia (Gin, Vodka, Rum, Tequila, Whisky, Brandy, Aperitivi e bollicine, Liquori e shot, Analcolici; 14 analcolici + tocco sardo «Mirto Spritz»).
  - Inventario: per bottiglia `pi` intere chiuse + `ap` quanto resta dell'aperta (Nessuna/⅓/½/⅔/Piena), «Finita: apro la prossima», «Avvisa sotto», prezzo d'acquisto solo gestori; «Usate questo mese» dai movimenti negativi. Idea furba aggiunta: «Si possono fare» = cocktail con tutti gli alcolici in casa (il tipo della bottiglia `cat` è uguale ai nomi degli ingredienti; Cognac≈Brandy, Prosecco≈Champagne, Bourbon≈Rye). Nella scheda del cocktail «in casa / manca» per ogni alcolico.
  - Chi vede: gestori (Fornitori), fb, resp, bartender/barman/barback (in «Cosa serve?»). Funzione `bar` accesa di partenza (Impostazioni → Funzioni).
  - `test-cantina` e `test-bar` aggiunte alle prove veloci di GitHub (`tools/prova-ci.sh`): prima test-cantina non c'era.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, poi pubblicare in automatico se le prove sono verdi)
1. PR #96 (sopra).
2. **D37** (richiesta di Mario arrivata nella #87 alle 22:29, girata qui): «Aggiungi un agente per ottimizzare e velocizzare. se vuoi consigliarmi Tool Search mcp di claude se qualcosa può tornare utile al progetto o migliorarlo o evolverlo ecc»
   - Fare: agente `.claude/agents/` per ottimizzare e velocizzare (peso e velocità dell'app sui telefoni economici, regola «non appesantire»); poi cercare strumenti MCP/plugin utili (ToolSearch, SearchMcpRegistry, SearchPlugins) e proporli a Mario con 3 strade (ovvia, furba, geniale). Domande nel testo (E38).
3. Idee possibili per il Bar (non chieste, da proporre a Mario solo se utili): «Cocktail della casa» (ricette scritte dal bartender), costo del cocktail dal prezzo delle bottiglie (come le ricette), foto della bottiglia letta dall'IA per aggiungerla.
4. D33 (funzioni smart per orari e agenda): proposta con 3 strade (dettagli sotto).
5. Controllo Cantina Vini e Bar in tema scuro e a 320 px (foto), rifinitura se serve.

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
- Jona #88 `session_0199ANgsgVouZX79Xd7QJFZX` (chiusa), #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiusa), #86 `session_01XaFfJiACdkE4pXQs6PbCok` (chiusa), #85 `session_01YBt4KxQa3Z4RMeKrQdvghK`, #84 `session_01YDpAVby2ft8GwjUK4qGiUZ`, #83 `session_01LzEDJuhMnDxtkkFmJoMu1G`, #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
(Arrivato in #87 dopo il messaggio sulla v84.)

Poi, ancora nella #87 (girato da lì, 22:29): «Aggiungi un agente per ottimizzare e velocizzare. se vuoi consigliarmi Tool Search mcp di claude se qualcosa può tornare utile al progetto o migliorarlo o evolverlo ecc»
