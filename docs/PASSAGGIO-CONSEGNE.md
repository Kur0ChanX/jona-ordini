# Passaggio di consegne (2026-10-12, fine sessione #94)

Sessione attuale: #95

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v89 unita** (PR #99 squash `910e862`, prove verdi). Alle ~7:40 online c'era ancora v88 (pubblicazione in corso).

## ✅ SUBITO (#95)
1. Controllare che sia online `APP_VER=89` su https://jona-ristorante-by-ynoy-corp.pages.dev/ (E33: senza index.html). Se sì, dirlo a Mario in 1 riga.
2. **D41 = v90 Bar** (scelta di Mario a tocco + doppio tocco: «Sì, falla così» / «Sì, confermo la prova»). Costruirla e pubblicarla da sola se le prove sono verdi:
   - Bozza funzionante in **`tools/bar-prova-v90.mjs`** (scrive `/tmp/bar-prova-liquori.html` e `/tmp/bar-prova-cocktail.html`). Foto mostrate a Mario: `docs/img/sessione-94/liquori-piccola.png`, `cocktail-piccola.png`.
   - **Liquori**: tabella `LQ` nome → [sagoma, colore, simbolo]. 7 sagome `SAG` (tonda, alta, quadra, monaco, goccia, fiasca, aperitivo) con etichetta tonda; simbolo = disegno esistente rimpicciolito (`mini`) o simboli nuovi `SIMB` (cacao, anice, mandorla, croce, erbe, stella, fumo, spezie, scritta). 40 prodotti (tutti quelli che prima erano «liquore»/«bottiglia»). Da portare in `tools/bar-disegni.mjs`: un disegno per liquore (es. `G['lq_amaretto']`) e regole che puntano lì; le regole vecchie con colore restano solo come riserva.
   - **Cocktail**: `cocktail(ck)` = bicchiere `BIC` (17 tipi = campo 3 di `cocktail.json`) + colore del drink `mix()` (media pesata per cl in spazio lineare; trasparenti ×0,15, colori forti ×3) + guarnizione `GAR`/`garn()` (max 2, dal campo 5) + ghiaccio (se la preparazione dice ghiaccio) + bollicine + bordo di sale/zucchero. Da fare nell'app: generare il disegno a runtime (bicchieri e simboli dentro `data/bar-disegni.json`, funzione in index.html), mostrarlo nella lista dei cocktail e in cima alla scheda del cocktail.
   - **Doppioni**: 212 cocktail → 209 disegni. Restano uguali London Mule=Mexican Mule e Moscow/Kentucky/Virgin Mule (tazza di rame opaca): aggiungere un segno del distillato (es. piccolo simbolo o colore del bordo) per renderli diversi. La prova deve controllare 212 disegni diversi.
   - **Bug v89 trovato**: «ginger beer»/«ginger ale» prendono il disegno del gin (regola `'^gin'`). Correggere con `'^gin(?!ger)'` + controllo nella prova.
   - Altri doppioni veri tra ingredienti (stesso disegno e colore): whisky (bourbon, rye, scotch, torbato, irlandese), brandy (calvados, brandy, cognac), pisco=grappa, rum bianco=cachaça, champagne=prosecco. Mario ha detto «controlla i doppioni… senza doppioni o provaci»: renderli diversi anche questi (es. simbolo `fumo` per il torbato, mela per il calvados).
   - Ricordare: `CACHE` in sw.js, `APP_VER=90`, NEWS v90, riga in CLAUDE.md, aggiornare `tools/test-bar-disegni.mjs`, `test-giro`, foto HD a Mario (chiaro e scuro).
3. Poi D33 (sotto): proposta con immagine e 3 strade.
4. Guardare il giro delle prove del lunedì (3:17 del 12/10).

## Fatto in #94 (12/10, ~7:15-7:45 ora italiana)
- Avvio: scorta unita. Conteneva come «ultimo messaggio» l'avviso «This session's worker process was restarted…» (non di Mario) → **E42**: aggiunto ad `AVVISI_DI_SISTEMA` in `.claude/hooks/scorta.py`, prova 3c-quater in `tools/test-scorta.py` (25 controlli ok), ripristinato «vai».
- Prove PR #99 verdi → squash merge, `main` unito nel ramo.
- Mario: «bastano solo 40 immagini di ingredienti?» → contati: 143 ingredienti, tutti con disegno (43 disegni, 91 regole); il «liquore» copriva 30 prodotti, «bottiglia» 10, «soda» 10. Fatta la prova liquori+cocktail, mandata in HD, scelta e confermata.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite. Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. D41 v90 (sopra).
2. D33 (funzioni smart per orari e agenda): proposta con immagine + 3 strade. Domanda a tocco con doppio tocco, ripetendo in chiaro la scelta prima di costruire (E37/E38).
3. Idee per il Bar (solo se utili): «Cocktail della casa», costo del cocktail dal prezzo delle bottiglie, foto della bottiglia letta dall'IA.
4. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura.

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = lo staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima; il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #94 `session_01KtgXU5jt71weBBriYJGSpK` (chiusa), #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
«si

bastano solo 40 immagini di ingredienti?»
(12/10/2026 ~7:25 ora italiana, in #94). Poi, a tocco: «controlla i doppioni e se riesci fallo anche per i cooktail nello stesso stile senza doppioni o provaci» / «manda prova cocktail e liquori». Dopo la foto, a tocco: «Sì, falla così (Consigliato)» + «Sì, confermo la prova». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
