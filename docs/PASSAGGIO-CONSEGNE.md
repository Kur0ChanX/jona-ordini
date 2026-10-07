# Passaggio di consegne (2026-10-07)

Sessione attuale: #29

## Ultimo messaggio di Mario (#28), parola per parola
«Facciamo A»
(= sceglie la strada A per l'accesso «vetrina»: app dimostrativa con link dedicato. Da fare in #29, sotto.)

## Messaggi di Mario in #28 (per non perdere le richieste)
1. «si procedi e dimmi subito come invitare l'amministratore Maurizio Chef qual è la scelta migliore?» → risposto + v44 preparata.
2. «si pubblica e poi vorrei creare per chi si registra un utente per far vedere l'app in che fase è ad esempio i consulenti alberghieri o i proprietari o la Resident Manager (Chiara) come posso fare? senza troppe manovre per entrare nell'app molto plug and play link dedicato per loro entrano e guardano tutte le impostazioni e le funzioni per farsi un idea del progetto magari crei un link dedicato con una bel welcome professionale per provarla» → v44 pubblicata; 3 strade proposte con immagine; scelta A.
3. «Facciamo A».

## Fatto in #28
- Avvio: il ramo locale era vecchio (sessione #12) e diverso da origin → rimedio E5 (`git branch -m … vecchio-locale-20261007`, `git checkout -b <ramo> --track origin/<ramo>`). Il ramo `vecchio-locale-20261007` esiste solo nel container, nessun lavoro unico (commit già in main).
- **v44 online** (PR #53 squash `96f189d`, sito controllato: `APP_VER=44`, `CACHE` `jona-ordini-v48`, testo presente). Impostazioni → Scadenze per lo staff: «Esempio di avviso sul telefono dello staff: «Richieste allo chef entro le 18»». NEWS v44. Prove breve: `test-news` 94 PASS, `test-giro` «nessun problema». Main riunito nel ramo subito dopo.
- `docs/DA-FARE.md`: tolta C6 (vecchia), C7 (v44 online, poi le altre cose), D7 (vetrina).
- `docs/immagini/scelta-vetrina.png`: confronto delle 3 strade (A app dimostrativa, B profilo osservatore, C video).

## Risposta data a Mario: invitare Maurizio (scelta migliore = invito personale)
Staff → **+ Aggiungi** → Nome Maurizio → Ruolo **Amministratore** → Tipo di contratto **Full time Responsabile** → Nome utente `maurizio.chef` → Password **La sceglie lui (invito WhatsApp)** → **Crea profilo** → «Invito pronto» → **Manda su WhatsApp**. Link monouso 7 giorni, entra senza approvazione (`registerSheet('admin')`, `createProfile`, `invMonoSend`). Mario non ha ancora detto se l'ha fatto (M1/M2/M19).

## Da fare in #29: D7 strada A «App dimostrativa» (scelta di Mario)
Obiettivo: link dedicato (es. `https://jona-ristorante-by-ynoy-corp.pages.dev/#demo`), pagina di benvenuto professionale («Jona Ordini · Anteprima del progetto», logo, firma «Jona_Ristorante By YNOY&CORP», pulsante **Entra nella demo**), un tocco ed è dentro, vede tutto (viste Admin Chef / F&B / Staff, Impostazioni, funzioni come l'agenda accese), dati di esempio realistici, zero contatto con i dati veri.
Idea tecnica (da confermare leggendo il codice, non ancora scritta niente):
- All'avvio, se `location.hash` è `#demo` (o flag `jona_demo`): niente Firebase (forzare `LocalStore` come fanno le prove con `self.JONA_FIREBASE=null`), store su una chiave SEPARATA (es. `jona_demo_db`, non `jona_db_v2`) così un telefono vero non mescola i dati; niente push, Worker, Gemini, inviti, backup verso il server.
- Dati: partire da `makeTestData` (riga ~3225, solo sviluppatore) o scrivere un seme dedicato più ricco (fornitori, listini, ordini in vari stati, orari pubblicati, agenda, chat finta).
- Utente demo: profilo «Ospite» con barra di cambio vista tipo `VIEW_AS` (Admin Chef / F&B / Staff) visibile anche se non `dev`; banner fisso «Modalità dimostrativa — i dati sono di esempio» con «Esci dalla demo».
- Attenzione: `sw.js` e `CACHE`, `APP_VER` 45, NEWS v45; aggiungere eventuali file nuovi a `FILES` e al passo «Prepara i file» del workflow Cloudflare.
- Prova nuova `tools/test-demo.mjs` (entra da `#demo`, nessuna chiamata a Firestore/Worker, `jona_db_v2` intatto, cambio viste, uscita) + `test-giro`.
- Niente nome del creatore nei testi visibili.
- Prima delle prove proporre a Mario le 3 opzioni (completo/breve/subito); è una funzione isolata → consigliare breve.

## Prossimi passi (dopo D7)
1. Chiedere a Mario a che passo è con l'invito di Maurizio.
2. Riga «“Oggi si ordina” arriva a» più chiara: proporla con immagine prima/dopo.
3. Giro completo prove v42-v45: chiedere «Lo faccio partire ora o dopo?».
4. Poi notifica del mattino «Oggi in hotel», promemoria evento dal Worker, V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).

## Rischi aperti
- Una domanda per volta, con immagine per le scelte (E2, E3).
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (E10).
- Elenco completo: `docs/DA-FARE.md`. Errori: `docs/ERRORI.md`.
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
