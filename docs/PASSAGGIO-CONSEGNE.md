# Passaggio di consegne (2026-10-07)

Sessione attuale: #30

## Ultimo messaggio di Mario (#29), parola per parola
«si»
(= risposta a «Parto con la D7 (app dimostrativa)?». D7 strada A fatta, vedi sotto.)

## Messaggi di Mario in #29
1. «si» → D7 fatta (v45 sul ramo, non ancora pubblicata).

## Fatto in #29
- Avvio: di nuovo il ramo locale era vecchio (#12) → rimedio E5: `git branch -m … vecchio-locale-sessione12`, `git checkout -b <ramo> --track origin/<ramo>`. Il ramo vecchio esiste solo nel container, niente lavoro unico.
- **v45 «App dimostrativa»** (commit `e57f5d3` sul ramo `ccr-4a01d00e-6ay25e`, NON ancora in main):
  - Link: `https://jona-ristorante-by-ynoy-corp.pages.dev/#demo`. La scelta resta per la scheda (sessionStorage `jona_demo`), anche se l'indirizzo perde `#demo`. Aprire `#demo` con l'app già aperta ricarica in demo (`hashchange`).
  - `index.html`: `DEMO` e `lsK` definiti prima di `ls()`; `ls` e `LocalStore` usano chiavi «demo:» (dati, profilo, carrello, vista); `fbCfg`→null; in demo `window.fetch` verso altri siti rifiutato (tranne Open-Meteo; i font Google sono CSS, non fetch) → niente Worker, Gemini, push, inviti; `obxDb` rifiuta (niente coda invii, non tocca quella vera); `appBadge` spento.
  - `view()`: `if(DEMO&&!meU())return screenDemo()` (benvenuto: logo, «Anteprima del progetto», «Benvenuto in Jona Ordini», 4 righe con icone, **Entra nella demo**, «Niente di quello che fai qui arriva al ristorante o ai fornitori.», firma BY).
  - `demoGo`: `S.db.load({})` + `seedIfEmpty()` + `demoSeed()`, segna Novità già viste, `login('demo_gm')`. `demoSeed`: 6 persone (Ospite gm libero, Paolo Serra F&B libero, Luca Bianchi cuoco, Sara Conti cameriera, Giulia Marras pasticcera, Andrea Piras barman; nomi inventati), 2 richieste in attesa (una urgente) + 1 approvata con 2 ordini aperti, 24 ordini inviati in 8 settimane (l'ultimo da ricevere → Arrivi), orari della settimana pubblicati, 4 eventi agenda (uno oggi → striscia «Oggi in hotel»), `funz.agenda` accesa, 4 messaggi chat, 2 avvisi.
  - `testBar()` in demo mostra `.demobar`: «Anteprima · Dati di esempio: niente arriva al ristorante.» + **Esci** + «Guarda l'app come» Chef / F&B Manager / Staff. `meU` usa `VIEW_AS` anche in demo. `demoOut` cancella le chiavi «demo:» e il flag, torna all'indirizzo senza hash.
  - `APP_VER=45`, NEWS v45 (chef + dev), `sw.js` `CACHE` `jona-ordini-v49`. Nessun file nuovo dell'app (niente da aggiungere a `FILES` o al workflow).
- Prova nuova `tools/test-demo.mjs` (30 PASS, usa il firebase-config vero; i dati «veri» si scrivono da `manifest.webmanifest` per non collegarsi a Firestore vero). Prove brevi tutte riuscite: test-demo 30, test-testbar 7, test-news 94, test-responsabile 15, test-agenda 60, test-giro «nessun problema».
- Immagini: `docs/immagini/demo-benvenuto.png`, `docs/immagini/demo-dentro.png` (da mostrare a Mario).
- Aggiornati: `CLAUDE.md` (riga v45), `tools/README.md`, `docs/DA-FARE.md` (D7 = manca la pubblicazione, nuova M20).

## Decisioni e perché
- Chiavi separate «demo:» invece di un altro sito: stesso indirizzo, zero manovre; un telefono vero che apre la demo non mescola dati.
- Demo rifatta da zero a ogni «Entra nella demo»: ogni ospite trova dati puliti.
- Profilo `gm` con cambio vista (non `dev`): così non vede gli strumenti dello sviluppatore.
- «Chiedi a Jona» (Gemini) resta visibile ma non chiama la rete: accettato, da migliorare solo se Mario lo chiede (es. messaggio «non disponibile nella demo»).

## Da fare in #30 (subito)
1. Mostrare a Mario le 2 immagini e proporre le 3 opzioni di prove per pubblicare: (1) completo, (2) breve (GIÀ FATTA, tutte riuscite → consigliata), (3) subito. Una domanda per volta.
2. Pubblicare: PR dal ramo → squash merge (lo fa Claude) → controllo online (`APP_VER=45`, `CACHE` v49, `#demo` mostra il benvenuto) → subito `git fetch origin main && git merge origin/main` sul ramo + push.
3. Dare a Mario i passi M20 (aprire il link dal telefono, provarlo, mandarlo a Chiara/consulenti/proprietari) con il link pronto da copiare.

## Prossimi passi (dopo)
1. Chiedere a Mario a che passo è con l'invito di Maurizio (passi in `docs/DA-FARE.md`, M1/M2/M19).
2. Riga «“Oggi si ordina” arriva a» più chiara: immagine prima/dopo.
3. Giro completo prove v42-v45: chiedere «Lo faccio partire ora o dopo?».
4. Poi notifica del mattino «Oggi in hotel», promemoria evento dal Worker, V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).

## Rischi aperti
- Una domanda per volta, con immagine per le scelte (E2, E3).
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (E10).
- Elenco completo: `docs/DA-FARE.md`. Errori: `docs/ERRORI.md`.
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
