# Passaggio di consegne (2026-10-12, fine sessione #95)

Sessione attuale: #96

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). **v90 unita** (PR #100 squash `7635ca3`, prove verdi, `main` riunito nel ramo `3babb7b`). Alle ~8:15 la pubblicazione su Cloudflare era appena partita.

## ✅ SUBITO (#96)
1. Controllare che sia online `APP_VER=90` su https://jona-ristorante-by-ynoy-corp.pages.dev/ (E33: senza index.html; `curl -s … | grep -o 'APP_VER=[0-9]*'`). Se sì, dirlo a Mario in 1 riga.
2. **Giro del lunedì mai partito**: il cron di `prove.yml` (`17 3 * * 1` = 5:17 italiane) il 12/10 non è partito (API: `actions/workflows/prove.yml/runs?event=schedule` → total_count 0; il workflow c'è dal 07/10, era il primo lunedì). Lanciare a mano il giro completo su GitHub (workflow «Prove automatiche», workflow_dispatch, modo `tutto`, ramo `main`) con `mcp__github__actions_run_trigger`; gratis, dirlo a Mario in una riga. Se il cron non parte neanche il 19/10: scriverlo in ERRORI.md e valutare un orario diverso (GitHub salta i cron nelle ore cariche; minuto non tondo già usato).
3. Poi D33 (sotto): proposta con immagine e 3 strade, domanda a tocco + doppio tocco.

## Fatto in #95 (12/10, ~7:37-8:15 ora italiana)
- Avvio: scorta unita (conteneva solo `docs/ULTIMO-MESSAGGIO.md`, l'ultimo messaggio vero di Mario «si / bastano solo 40 immagini di ingredienti?»), push.
- `APP_VER=89` confermata online.
- **v90 (D41) fatta e pubblicata** (scelta di Mario #94):
  - `tools/bar-disegni.mjs` ora genera tutto (la bozza `tools/bar-prova-v90.mjs` è stata tolta: il suo codice è dentro). `data/bar-disegni.json` v2 = `g` (95 disegni: 40 `lq_<nome>` con sagoma `SAG` + simbolo `SIMB`; varianti con etichetta tonda `badge()`: `w_bourbon` botte, `w_rye` spiga, `w_scotch` croce di S. Andrea, `w_torbato` fumo, `w_irl` trifoglio, `br_cognac` uva, `br_calvados` mela, `grappa` (bottiglia alta), `rum_cachaca` lime, `spu_prosecco` uva, `tabasco`, `garofano` nuovo), `r` regole (prima le 40 dei liquori `R0`, poi le vecchie come riserva), `b` 17 bicchieri, `pz` 118 pezzi, `k` 212 cocktail → [bicchiere, colore, pezzi].
  - Perché pezzi precalcolati e non il codice della bozza nell'app: index.html resta piccolo (solo `brSvg` + `brCkDis`, 4 righe); la logica (colore `mix`, guarnizioni, ghiaccio) gira una volta sul computer. Peso: 170 KB, 20 KB compressi, scaricato solo all'apertura del Bar.
  - Mule (tazza di rame opaca) distinti con etichetta del distillato principale. 212 cocktail → 212 disegni diversi.
  - Bug v89 corretto: ginger beer/ale col disegno del gin (`^gin(?!ger)`). Granatina ≠ succo di melograno, basilico = foglia (non fiore), ginger ale più chiaro.
  - App: disegno a sinistra in ogni riga della lista (`.br-ckd`, acquerello spento per non pesare con 60 righe) e grande (128 px) in cima alla scheda (`.br-ckbig`); tema scuro: linee `var(--ink2)`.
  - Prova `tools/test-bar-disegni.mjs` (46 controlli: 212 diversi, niente bottiglie generiche, gruppi di prodotti simili diversi, lista e scheda, senza file). Verdi anche `test-bar`, `test-giro`, prove GitHub.
  - Foto HD mandata a Mario: `docs/img/sessione-95/v90-confronto.png` (lista + Mojito, chiaro e scuro).
  - CLAUDE.md: riga v90; DA-FARE: tolta D41.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite. Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. Giro completo a mano (sopra).
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
- Jona #95 `session_01QsPmY12GJ337y47Kax1f2a` (chiusa), #94 `session_01KtgXU5jt71weBBriYJGSpK`, #93 `session_01Q2KYN7TKMEbWP23X6HfPYB`, #92 `session_01XEe2wGYr9SNdFKhqLniFbG`, #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
In #95 Mario non ha scritto nulla (sessione partita dall'handoff, lavoro da solo). L'ultimo resta quello di #94: «si

bastano solo 40 immagini di ingredienti?»
(12/10/2026 ~7:25 ora italiana). Poi, a tocco: «controlla i doppioni e se riesci fallo anche per i cooktail nello stesso stile senza doppioni o provaci» / «manda prova cocktail e liquori» → «Sì, falla così (Consigliato)» + «Sì, confermo la prova» (fatto: v90). Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
