# Passaggio di consegne (2026-10-09, fine sessione #41)

Sessione attuale: #42

## Ultimo messaggio di Mario (#41), parola per parola
«@"/root/.claude/uploads/5641e3e6-bae9-5537-b086-21ef8921bee1/6ca1fe3e-Screenrecorder-2026-10-09-05-29-13-867.mp4" vedi c'è la barra nera sopra nella schermata di avvio poi dentro l'app uguale ma che strano se tocco le notifiche si mette a schermo intero come vorrei riesci a dare un controllo accurato per trovare una soluzione senza che chrone mi faccia  uscire l'avviso che è a schermo intero ogni volta che tocco un tasto.


una volta finito nell'agenda di mauro ricordati che può inviare gli allerts in base a gli eventi o suoi appunti ai ragazzi singoli o per posizione cucina sala tutti solo per lui come memo solo a Maurizio ecc ecc studia un modo per far vedere l'evento all'interessato in modo che non si dimentichi senza influire troppo negativamente sull'esperienza dell'app»
(Fatto tutto e pubblicato: v60 per la banda nera, v61 per l'agenda alla persona giusta. Risposta a Mario non ancora mandata: la manda la #42 con il riassunto qui sotto, se Mario chiede.)

Messaggi prima (#41), in breve: «no tieni pure il giro extra» (il giro completo extra su GitHub dopo modifiche al Worker RESTA); «si mettilo una possibilità di vederla poi per mese giorno settimana deve sostituire la sua agenda cartacea…» (→ v59); «L'agenda è attiva… volevo un'agenda super smart per Mauro… con alerts… prendi spunto dai programmi di agende serie» (→ v58, scelta «A · Giornata + avvisi»); «giro completo era una volta a settimana ricordi?» (spiegato: lunedì automatico + extra solo dopo il Worker).

## Fatto in #41 (08-09/10): v54 → v61 online
| Versione | PR | Cosa | CACHE |
|---|---|---|---|
| v54 | #64 | barra in tinta (poi tolta in v57) | v58 |
| v55 | #65 | `requestFullscreen` al primo tocco → Chrome mostrava l'avviso «per uscire… trascina» | v59 |
| v56 | #66 | tolto `requestFullscreen` (avviso di sistema, non nascondibile) | v60 |
| v57 | #67 | tolti `themeBar()` e `body::before` della v54 (Mario: «com'era nella v45»); manifest e viewport identici dalla v37 | v61 |
| v58 | #68 | agenda: avvisi `ev.av` (0/15/30/60/120/1440 min, senza ora = 09:00, di partenza 30), push dal Worker `/agenda` + cron `agTickSrv`, «Cose da fare» `ev.cl` con spunta, evento successivo evidenziato | v62 |
| v59 | #69 | agenda per pianificare: Giorno a ore 7-23 con «Appunti del giorno» personali (`config/agnote_<AAAA-MM>`, `n.d<AAAAMMGG>.<persona>`), «Sposta a domani i non fatti», ora vuota → evento, Settimana/Mese toccabili, «Torna a oggi», scorrimento col dito, Invio | v63 |
| v60 | #70 | `cutoutFix()`: prova per la banda nera (vedi sotto) | v64 |
| v61 | #71 | agenda alla persona giusta: `vis:'pers'` + `per:[id]`, «Avvisa subito», `visto.<persona>` (valido se ≥ `mod`), «visto da x/y», striscia «Per te in agenda» + «Ok, visto», appunto → informazione (`agNtSend`) | v65 |
- Online controllato: `sw.js` = `jona-ordini-v65`. Giro completo su GitHub dopo la v58 (Worker): verde.
- Prove nuove: `tools/test-agenda-v58.mjs` (26), `test-agenda-v59.mjs` (30), `test-agenda-v61.mjs` (22), tutte in VELOCI di `tools/prova-ci.sh` e in `tools/README.md`; `test-barra.mjs` riscritta (v57+v60); `test-agenda.mjs` aggiornata (prima «Per te in agenda», poi «Ok, visto»).
- Immagini mandate: `docs/img/v59-agenda.png`, `docs/img/v61-agenda-destinatari.png`. Segnalazioni: `docs/img/segnalazioni/v56-video-*.jpg`, `v59-zona-fotocamera-prima-dopo-tendina.png`.
- Errore nuovo E18 (`docs/ERRORI.md`): prova che dipendeva dall'ora → rossa su GitHub (fuso Roma). Rimedio: date fisse e prove nuove anche con `TZ=Europe/Rome`.

## Banda nera in alto (zona fotocamera) — stato
- Analisi del video del 09/10: all'avvio la finestra è spostata in basso di 144 px (zona sicura 0, nero del sistema). Tirando giù la tendina delle notifiche Android ridisegna la finestra e l'app usa la zona fotocamera (zona sicura 144, colore dell'app): quindi il telefono LO PERMETTE, si applica in ritardo.
- v60 `cutoutFix()` (index.html, prima di `applyTheme`): solo app installata `display-mode: fullscreen`, se `env(safe-area-inset-top)`=0 → `viewport-fit` `auto` e dopo 150 ms di nuovo `cover`, al `load` (+300 ms) e al ritorno in primo piano. NON verificata sul telefono: aspettiamo M24.
- Se non basta, idee successive (decide Claude): ripetere il cambio più tardi (es. dopo 1-2 s o alla chiusura della schermata d'apertura), oppure provare con `<meta name="theme-color">` cambiato una volta all'avvio; MAI `requestFullscreen` (avviso di Chrome, v55-v56). M23 (impostazione del telefono) resta un'alternativa.
- Reinstallare l'icona: Mario ha scelto di provarci (passi mandati); esito non detto.

## Agenda di Mauro — come funziona ora
- Icona calendario solo per `agCan` (gestori, sviluppatore, reparti `fb`/`resp`); con la vista «Staff» non c'è (Mario non la vedeva per questo).
- Avvisi: `agTick` ogni minuto in `deadlineTick` (avviso + notifica `ag_<id>_<at>_<persona>`); `agSrv`/`agPlan` → Worker `/agenda` dal telefono di chi può scrivere (serve aprire l'app dopo aver scritto); il cron manda una volta sola (finestra 20 min).
- Destinatari: `agDest(e)`; per `rep` solo i reparti scelti; `pers` solo le persone scelte (anche i gestori non lo vedono).
- Mario chiede in #41 di prendere spunto dalle agende serie: altre idee in D11 di `docs/DA-FARE.md`.

## Da fare nella #42
1. Rispondere a Mario (se non l'ha già avuto): v60 e v61 online, cosa provare (M24, M25 in `docs/DA-FARE.md`), l'immagine `docs/img/v61-agenda-destinatari.png` è già stata mandata.
2. Attendere l'esito di M24 (banda nera) e M25 (prova di Mauro); poi D11 o il passo successivo per la banda nera.
3. D10 (riquadro «Inviato allo chef»: solo «Continua»): Mario non ha ancora risposto; richiederlo una volta.
4. Poi `docs/DA-FARE.md` (M22, M21, M20, C7…).

## Regole confermate in #41
- Giro completo extra su GitHub dopo modifiche al Worker: RESTA (Mario 09/10).
- Pubblicare da solo con prove legate + test-giro verdi (fatto per v54-v61).

## Rischi aperti
- `cutoutFix` può far vedere un piccolo scatto all'avvio (solo se il telefono era nel modo nero): da chiedere a Mario.
- «Avvisa subito» manda una notifica per persona: con «Tutti» e molto staff sono molte scritture (ok per il piano gratuito con lo staff del Jona).
- Server locale e emulatore si spengono a ogni riavvio del contenitore (`tools/README.md`).
- Titoli: `🟤 ▶ ATTIVA · #42 · Jona Ordini · da v61 · …`.
