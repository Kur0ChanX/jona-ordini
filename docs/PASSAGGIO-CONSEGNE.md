# Passaggio di consegne (2026-10-07)

Sessione attuale: #27

## Ultimo messaggio di Mario (#26), parola per parola
(con una foto di Impostazioni: «Scadenze per lo staff» con la riga «Avviso sul telefono dello staff: «Richieste allo chef entro le...»» e sopra «“Oggi si ordina” arriva a — Tutti gli Admin Chef. Tocca un nome per mandarlo solo a lui — [Mario Miscera]»)
«Dice entro le.... e si perde.... nelle scadenze

e poi oggi  si ordina e arriva a mario miscera, in che senso»

Risposta già data in #26 (breve):
- «entro le…» non è un testo perso: è l'esempio dell'avviso che arriva allo staff (l'ora la scegli tu quando aggiungi la scadenza). Però si capisce male → **da riscrivere** (vedi Prossimi passi 2).
- «Oggi si ordina arriva a»: senza scelta va a tutti gli Admin Chef. Oggi l'unico Admin Chef è il profilo di Mario, per questo vede solo il suo nome. Toccando un nome arriva solo a quella persona. Quando Maurizio sarà Admin Chef (M2) comparirà anche lui.

## Messaggi precedenti di Mario in #26 (per non perdere le richieste)
- Consenso esplicito a cambiare la regola bloccata dell'handoff: 6 modifiche (consegne fino a 2500 parole e più complete; condizione «nessun comando dell'handoff fallito…»; regola sui comandi falliti; tolta la riga «FERMATI immediatamente» dalle trasversali; merge di main SUBITO dopo ogni squash; testo AZIONE di `.claude/hooks/handoff-check.py`). **Fatte**, commit `23b9538` e `454e4bc`, solo sul ramo `ccr-4a01d00e-6ay25e`, non in main (vedi Rischi).
- «dopo» → giro completo delle prove v42 rimandato.
- «pubblica» → v42 pubblicata.
- Firebase M18: fatto da Mario (regole incollate e pubblicate). Ha avuto difficoltà: il link diretto `…/firestore/rules` lo riporta alla home; funziona il menù a sinistra (icona Firestore → scheda **Regole**). Usare questa strada nelle istruzioni future.
- «si ma non devi far reinstallare l'app ha senso spostare mauro?» → risposto: no, il reparto si legge in diretta.
- «spostato mauro ricordati mauro e maurizio non hanno orari essendo responsabili hanno carta bianca e fai modificare contratto a piacinento magari con una voce Full Time Per responsabile scivi meglio ma il senso è questo» → M4 fatto; fatta la v43 (sotto).

## Fatti nuovi
- **Mauro (Loi) è F&B Manager e Maurizio è Admin Chef: sono responsabili, NON hanno orari, «carta bianca».** Salvato in `CLAUDE.md` (riga v43, ramo `v43-responsabili`).
- Mario usa la vista Admin Chef (barra Test) per modificare i contratti: solo `isGM` li vede.

## Fatto in #26
- Ramo locale vecchio: rinominato `vecchio-locale-ccr`, preso `ccr-4a01d00e-6ay25e` da origin (procedura delle consegne, mai reset).
- **v42 online**: PR #51 squash (`9a3a5d9`), sito con `APP_VER` 42 verificato. Subito dopo merge di main nel ramo ccr, push (`93e6a5e`).
- `docs/DA-FARE.md`: M18 tolto (fatto), «Entrata libera 48 ore» spostata dentro M14.
- **v43 nel ramo `v43-responsabili`** (commit `5fe5305`, su GitHub, NON ancora PR):
  - `index.html`: contratto «Tipo di contratto»: **Ore fisse** | **Full time Responsabile** in `orContrForm` (`S.form.libero`, `formset` con `data-v="1"`/`""`). Salvato come `staff.contratto={libero:true}` (`orContr`); `orFree(u)`; `contrOf` restituisce null per i liberi; `orPeople` li esclude (pianificatore, controlli, export Excel, cambi turno); `checkForm` non controlla le ore se libero; `profileSheet` porta `libero` nel modulo; «I miei orari» mostra «Orario libero» se non ha turni; `jonaCtx` scrive «Full time Responsabile, orario libero». NEWS v43, `APP_VER` 43, `CACHE` v47 in `sw.js`.
  - Scelta: escluderli da `orPeople` invece di mostrarli con un'etichetta, perché Mario ha detto «non hanno orari». Alternativa scartata: contratto con 0 ore (avrebbe generato avvisi nei controlli).
  - Prova nuova `tools/test-responsabile.mjs` (15/15 riuscite), aggiunta a `tools/README.md`. `prova-tutto.sh` la prende da sola (`tools/test-*.mjs`).
  - `docs/DA-FARE.md` (in quel ramo): M4 fatto, nuova **M19** (Mario mette «Full time Responsabile» a Mauro e poi a Maurizio, dopo la v43 online).
  - Prove legate lanciate in #26: `test-orari`, `test-staff`, `test-news`, `test-v16` riuscite; `test-agenda` e `test-giro` erano ancora in corso alla chiusura → **rilanciarle**.

## Prossimi passi (#27)
1. Nel ramo `v43-responsabili`: rilanciare `test-agenda` e `test-giro` (server `python3 -m http.server 8765`). Se riuscite, chiedere a Mario le 3 opzioni di prova (consiglio: breve, già fatta) → PR → squash → controllo online `APP_VER` 43 → SUBITO merge di main nel ramo ccr e push. Poi dire a Mario come fare M19.
2. Testo di «Scadenze per lo staff» in Impostazioni: «Avviso sul telefono dello staff: «Richieste allo chef entro le…»» sembra tagliato. Riscriverlo chiaro, es. «Esempio di avviso: «Richieste allo chef entro le 18»». Cercare con `grep -n -o '.\{0,80\}Richieste allo chef entro.\{0,120\}' index.html`. Si può unire alla v43 o fare v44.
3. Anche la riga «“Oggi si ordina” arriva a» si può rendere più chiara (es. «Ora arriva a: tutti gli Admin Chef (oggi: Mario Miscera)»). Proporlo a Mario prima.
4. Giro completo delle prove (v42+v43): rimandato da Mario. Chiedere «Lo faccio partire ora o dopo?» prima di avviarlo.
5. Dopo: notifica del mattino «Oggi in hotel» e promemoria prima dell'evento dal Worker (cron, come `scadTick`), poi V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).

## Rischi aperti
- Le regole nuove di `CLAUDE.md` (handoff 2500 parole, comandi falliti, merge subito dopo lo squash) e il pallino 🟤 sono **solo sul ramo ccr**: il ramo `v43-responsabili` parte da main e ha il `CLAUDE.md` vecchio + la riga v43. Al merge di main nel ramo ccr possibile conflitto in `CLAUDE.md`: tenere entrambe le parti.
- Il ramo locale nella nuova sessione potrebbe essere vecchio: se `merge --ff-only` fallisce, `git branch -m` + `git checkout -b <ramo> --track origin/<ramo>`, mai reset.
- Una cartella di lavoro temporanea (`git worktree`) è stata usata per scrivere queste consegne: nella nuova sessione non esiste, nessun effetto.
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (noto). Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
- Elenco completo: `docs/DA-FARE.md` (versione aggiornata nel ramo `v43-responsabili`).
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
