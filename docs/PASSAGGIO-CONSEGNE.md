# Passaggio di consegne (2026-10-11, fine sessione #86)

Sessione attuale: #87

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v82**. Sul ramo, pronta e approvata da Mario: **v83**.

## ✅ SUBITO (#87): pubblicare la v83 — Mario ha scritto «si vai»
- Mario ha visto le 7 foto e ha detto di pubblicare. Passi: PR dal ramo verso `main` → controllo `prove` verde → squash → subito `git fetch origin main && git merge origin/main` sul ramo + push → controllo online `APP_VER=83` su https://jona-ristorante-by-ynoy-corp.pages.dev/ (E33).
- Prove già fatte in #86 (tutte verdi): `test-orari-reparto` (nuova, anche TZ Roma), `test-orari-resp`, `test-orari`, `test-v31`, `test-v16`, `test-responsabile`, `test-news`, `test-demo`, `test-giro`. Non rifarle (MENO CONTROLLI DOPPI). `test-firebase-orari` lo fa GitHub.
- La v83 tocca solo index.html (niente Worker): niente giro completo extra.

## Fatto in #86 (11/10, ~18:30-19:30 ora italiana)
- **⛔ STOP chiarito**: Mario, nella #85, ha scritto di non aver toccato le risposte a tocco (E38). Da allora le scelte si chiedono **scritte nel testo**, e Mario risponde a parole (niente strumento a tocco per cose importanti finché E38 non è capito). Mario ha risposto «si» a «tieni o togli la v82» → **v82 resta** (presa come «tieni», detto a Mario). Poi ha chiesto «foto mi servono» → mandate 4 foto v83.
- Errore trovato con le foto: in «In turno oggi» nome e orario si sovrapponevano. Corretto (`.or-nw` in `orOggi`, colore `rep-resp` per i responsabili).
- **Nuova richiesta di Mario**: «mauro deve fare gli orari per la sala e maurizio per la cucina». Scelta A di Mario: **Mauro pubblica da solo** la sala. Contesto (salvato in CLAUDE.md, riga v83): Maurizio = proprietario e capo cucina, ristorante in gestione nelle mura dell'hotel; Mauro = F&B Manager dell'hotel, ponte tra hotel/camere e ristorante (di solito sopra lo chef come ruolo).
- Fatto nella v83 (index.html): `OR_PLAN={fb:['sala']}`, `orPlanner`, `orScope` (gestori: chips Tutti/Cucina/Sala, ricordato in `jona_or_rep`), `orInSc`, `orPubAt` (`pubR.<reparto>`; settimane vecchie senza `pubR` = tutte pubblicate). `orStato`, `orCopy` (copia solo il reparto, lascia gli altri), `orPublish` (tp aggiornato solo per il reparto, avviso ai `gm` quando pubblica l'F&B), `cmGmBox(sc)`, `orCellSheet` (l'F&B non apre caselle fuori dalla sala). `vMieiOrari`: per l'F&B selettore «I miei orari | Turni della sala» (`S.orPl`, azione `orPl`); staff: «Orari non ancora pronti» finché il suo reparto non è pubblicato. NEWS v83: righe nuove per chef e gruppo nuovo `fb` (in `newsFor`, solo staff con `OR_PLAN`). Prova `tools/test-orari-reparto.mjs` (26 PASS).
- Commit pushati: correzione «In turno oggi», orari per reparto, CLAUDE.md.

## v83 (D32) — riassunto
- Orari dei responsabili (`resp.<id>`, striscia «Chi c'è adesso» `rsStrip`/`rsChat`) + orari per reparto (sopra). Dettagli in CLAUDE.md (riga v83). `APP_VER=83`, `CACHE` v87.
- Foto per Mario (non nel repo): script nello scratchpad della #86, si rifanno con Playwright se servono.

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
- Jona #86 `session_01XaFfJiACdkE4pXQs6PbCok` (chiusa), #85 `session_01YBt4KxQa3Z4RMeKrQdvghK`, #84 `session_01YDpAVby2ft8GwjUK4qGiUZ`, #83 `session_01LzEDJuhMnDxtkkFmJoMu1G`, #82 `session_01WCJjhdxi1ghKYpkvJFJEd6` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
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
«si vai»
(Risposta a: «Pubblico la v83? Scrivi "pubblica" oppure dimmi cosa cambiare.»)
