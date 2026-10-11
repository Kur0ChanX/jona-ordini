# Passaggio di consegne (2026-10-11, fine sessione #90)

Sessione attuale: #91

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v85**. **v86 nella PR #97**, da unire.

## ✅ SUBITO (#91)
1. **PR #97 (v86 app leggera)**: le prove su GitHub erano partite sul commit `896f99d`; il push delle consegne #90 le fa ripartire (E39). **Aspettare il controllo `prove` sull'ultimo commit del ramo** (`curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`, ~15 min) SENZA push nel frattempo. Verde → squash PR #97 (titolo «v86: app più leggera sui telefoni economici (#97)», `expectedHeadSha` = SHA intero di 40 caratteri) → subito `git fetch origin main && git merge origin/main` + push → controllo online `APP_VER=86` su https://jona-ristorante-by-ynoy-corp.pages.dev/ . Prove legate già fatte in #90 (verdi): non rifarle.
   - Se il merge di main dà conflitto su file di `docs/` (succede se si committa in locale prima dello squash): controllare che `git diff --stat <testa della PR> origin/main` sia vuoto, poi `git checkout --ours <file>` (è quello che ho fatto in #90, sicuro solo con il diff vuoto).
2. **Bordo chiaro nell'intro (richiesta nuova di Mario, D38)**: foto `docs/img/sessione-90/intro-bordo-bianco.jpg` (telefono Android, app installata). Si vede una striscia chiara ~1% della larghezza sul lato destro (da sotto la barra nera di stato fino in fondo) e una striscia chiara in basso, intorno allo sfondo scuro dell'apertura. Mario: «è la prima volta che lo vedo». Online c'era la v85 (la v86 non era ancora online, quindi non è la classe `lite`). Ipotesi da verificare (non ancora guardato): il livello dell'apertura (`html.intro`, `applyTheme();document.documentElement.classList.add('intro')` riga ~6143) non copre tutto lo schermo (es. `100vw/100vh` invece di `inset:0`, un `transform: scale` dell'animazione, o lo sfondo chiaro di `body`/`--bg` del tema chiaro che si vede ai bordi). Riprodurre con Playwright 412×915 e `deviceScaleFactor` 2.6 (Android tipico) e anche con barra di sistema; correggere, prova nuova che controlla che l'apertura copra tutto lo schermo (es. `elementFromPoint` agli angoli = livello dell'intro). Va nella v87 (o nella PR #97 se non ancora unita? NO: non aggiungere commit alla PR in corso, E39; farla dopo come v87).
3. Dopo: dire a Mario cosa c'è di nuovo (v86 più fluida sui telefoni meno potenti) in 2-3 righe.

## Fatto in #90 (11/10, 23:30-23:55 ora italiana)
- **Scorta** aveva salvato il rapporto di un agente (subagente) come «ultimo messaggio di Mario» → `<agent-message` aggiunto ad `AVVISI_DI_SISTEMA` in `.claude/hooks/scorta.py`, prova 3c-ter in `tools/test-scorta.py` (24 controlli verdi), E40 in ERRORI. Ripristinato il vero ultimo messaggio (domanda su Perplexity delle 23:12).
- **PR #96 (v85) unita** (squash `9cb988a`), ramo riallineato, **v85 online** (controllato `APP_VER=85`). Foto del Bar mandata a Mario (3 schermate: lista cocktail, Negroni, inventario).
- **Context7**: `.mcp.json` e `enabledMcpjsonServers` ci sono, ma nella sessione cloud `claude mcp list` dice «⏸ Pending approval» e gli strumenti non compaiono. Strada che funziona: connettore personalizzato su claude.ai (M43, Mario a mano: https://claude.ai/customize/connectors, URL `https://mcp.context7.com/mcp`, nei due account). Non ancora detto a Mario con la guida a passi: darla quando lo chiede o a fine v86/v87 in 4-5 passi.
- **v86 (D37, alleggerimenti dell'agente `ottimizza`)** nella PR #97:
  1. classe `lite` su `<html>` (script in `<head>` dopo il manifest: `deviceMemory`≤4 o `hardwareConcurrency`≤4) → `.top` e `.nav` senza `backdrop-filter`, sfondo pieno (`var(--bg)` / `var(--surface)`). Sui telefoni potenti come prima. Nota: Chromium qui e su GitHub ha 4 processori → tutte le prove girano in «lite».
  2. `deadlineTick`: `if(S.tab==='invii'&&!document.hidden)render();` (al ritorno in primo piano ci pensa `visibilitychange`).
  3. `chWatch` (Firebase): `q.docChanges({includeMetadataChanges:true})` vuoto (solo cache/rete) → niente `schedule()`; le spunte (pendenti→arrivate) cambiano ancora.
  - Scartati per ora (rischio): limite 100 della chat a chat chiusa (i non letti dei canali poco letti sarebbero sbagliati), `sugStats` in memoria.
  - Prove: nuova `tools/test-leggera.mjs` (14 controlli, aggiunta in testa alle VELOCI di `tools/prova-ci.sh`); `test-firebase-chat` + 2 controlli («solo rete cambiata: chat non ridisegnata» fallisce con il codice vecchio: verificato). Verdi in locale: test-leggera, test-firebase-chat, test-firebase-flow, test-agenda-v61, test-demo, test-giro, test-scorta.py. `APP_VER=86`, `CACHE` `jona-ordini-v90`, voce NEWS v86, riga v86 in CLAUDE.md.
- **Controllo Cantina e Bar in tema scuro a 320 px** (punto 5 dei prossimi lavori): tutto leggibile, niente fuori schermo, nessun errore. Unica rifinitura trovata: in Cantina → Inventario → «Più venduti questo mese» il numero va a capo da solo («…Riserva 2019 / **1**»). Provata la correzione (`<li><b>${n}</b>${vnTit(v)}</li>` + `.vn-top b{float:right;margin-left:12px}`, bella) ma `tools/test-cantina.mjs` riga 111 controlla il testo `Più venduti questo mese Tignanello 2020 2` → tolta per non rompere la PR. Da rifare nella v87 aggiornando la prova (es. `/Tignanello 2020/` e il numero nel `<b>`).

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. PR #97 (sopra), poi v87: bordo dell'intro (D38) + «Più venduti» allineati.
2. D33 (funzioni smart per orari e agenda): proposta con immagine + 3 strade (sotto). È una scelta di Mario: domanda nel testo (E38).
3. Idee per il Bar (da proporre solo se utili): «Cocktail della casa» (ricette del bartender), costo del cocktail dal prezzo delle bottiglie (come le ricette), foto della bottiglia letta dall'IA per aggiungerla.
4. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura (i tempi su GitHub cambiano).

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = lo staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima; il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #90 `session_01MAqfbJ8neGEZiNgRVBCjCA` (chiusa), #89 `session_01Y1ek4ZACQwmsRsQn8vWqyn`, #88 `session_0199ANgsgVouZX79Xd7QJFZX`, #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
«in coda guarda nell'intro ha un problema da poco vhe si vede un bordo bianco a destra e sotto è la prima volta che lo vedo risolvi»
(con la foto, salvata in `docs/img/sessione-90/intro-bordo-bianco.jpg`; arrivato in #90 alle ~23:54).

Prima, alle 23:12 (sessione parallela, già gestito: scelto «Solo Context7»): «Scusa, ho incollato per sbaglio. Mi hanno consigliato come MCP perché Claude Perplexity. Mi conviene installarlo, a cosa serve e se funziona in tutti i miei progetti. Ho letto che mi fa delle ricerche più approfondite, guarda su un database molto più ampio. Cosa mi consigli?»
Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
