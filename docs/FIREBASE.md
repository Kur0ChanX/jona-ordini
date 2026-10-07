# Collegare Jona Ordini a Firebase (database centrale)

Serve una volta sola. Senza Firebase l'app funziona lo stesso, ma ogni telefono tiene i suoi dati.

## 1. Crea il progetto (5 minuti, gratis)
1. Apri https://console.firebase.google.com con il tuo account Google.
2. **Crea un progetto** → nome `jona-ordini` → Google Analytics: **disattiva** → **Crea progetto**.

## 2. Accesso anonimo
1. Menu a sinistra: **Build → Authentication** → **Inizia**.
2. Scheda **Metodo di accesso** → **Anonimo** → attiva l'interruttore → **Salva**.

## 3. Database
1. Menu a sinistra: **Build → Firestore Database** → **Crea database**.
2. Posizione: `eur3 (europe-west)` → modalità **produzione** → **Crea**.
3. Scheda **Regole**: cancella tutto, incolla il contenuto di [`firebase/firestore.rules`](../firebase/firestore.rules) → **Pubblica**.

## 4. Configurazione dell'app web
1. Ingranaggio in alto a sinistra → **Impostazioni progetto** → in basso **Le tue app** → icona **`</>`** (Web).
2. Nome `Jona Ordini` → **Registra app** (Hosting non serve).
3. Copia il blocco `firebaseConfig = { ... }` e mandalo a Claude: lo inserisce in `firebase-config.js` e lo pubblica.
   In alternativa, per provare subito: nell'app, profilo Sviluppatore → Impostazioni → Database centrale → **Configurazione** e incollalo lì.

La configurazione non è segreta. I dati li protegge la chiave del ristorante (vedi sotto).

## 5. Attiva e collega i telefoni
1. Dal telefono che ha già i dati (Mario): Impostazioni → Database centrale → **Attiva**. I dati del telefono vengono copiati sul database.
2. Impostazioni → Database centrale → **Invita**: compare un QR code.
3. Gli altri telefoni inquadrano il QR con la fotocamera e aprono il link. Il telefono resta **in attesa** e non vede nessun dato: la persona scrive chi è (profilo nuovo o già esistente) e tu la approvi in **Staff → Telefoni da approvare**. Con un profilo nuovo l'app si apre da sola.

## Come funziona
- Ogni telefono entra con un accesso anonimo e si iscrive con la **chiave del ristorante**, che sta nel link e nel QR. Senza chiave non si leggono i dati (regole in `firebase/firestore.rules`).
- Dalla versione 24 la chiave non basta: il telefono nuovo nasce con `membri/<uid>.ok = false` e legge solo il proprio documento finché un telefono già approvato non mette `ok` a vero. I telefoni collegati prima (senza `ok`) restano approvati. Dopo l'aggiornamento della versione 24 le regole vanno **incollate di nuovo**: finché non lo fai, i telefoni nuovi restano in attesa e «Approva» dice di aggiornare le regole.
- Dalla versione 40 c'è l'**entrata libera** (Impostazioni): per 48 ore un telefono nuovo con la chiave si approva da solo (`pubblico/porta` con `fino`, al massimo 49 ore avanti) e, se nuovo, crea il suo profilo. Servono le regole **incollate di nuovo**: finché non lo fai, «Apri per 48 ore» dice di aggiornare le regole e tutto il resto funziona come prima.
- I dati restano anche sul telefono: senza rete l'app funziona e manda le modifiche quando la connessione torna.
- I prodotti stanno in un documento per fornitore (`listini/<fornitore>`), così ogni apertura dell'app legge pochi documenti. Il piano gratuito (50.000 letture e 20.000 scritture al giorno) basta per il ristorante.
- Backup: Impostazioni → Backup dei dati → Esporta / Ripristina (il ripristino vale per tutti i telefoni).
- Copie automatiche: ogni giorno il primo telefono di chi gestisce salva una copia di tutto nel database (collezione `backup`); restano 14 giorni. Impostazioni → Copie automatiche → Scarica / Ripristina. Se le regole sono state incollate prima di questa funzione, incollale di nuovo.

## Chat tra colleghi
- I messaggi stanno nella collezione `messaggi`. Dopo l'aggiornamento della versione 17 le regole vanno **incollate di nuovo** (scheda Regole → Pubblica): finché non lo fai la chat mostra «La chat va attivata» e il resto dell'app funziona normalmente.
- Tutti i telefoni collegati leggono tutti i messaggi (anche i privati): non scrivete password o dati delicati in chat.

## Notifiche push
- Ogni telefono le attiva da sé: foto del profilo → **Attiva le notifiche** → Consenti. L'iscrizione va nella collezione `push`.
- Le manda il server `worker/` su Cloudflare (gratis), pubblicato dal workflow GitHub a ogni modifica di `worker/`.
- Lo stesso server fa da tramite per Gemini (`/gemini`): con il segreto GitHub `GEMINI_API_KEY` la chiave del ristorante va nel Worker e «Chiedi a Jona» e le foto dei listini funzionano su tutti i telefoni collegati senza chiave propria. Rispondono solo i telefoni registrati in `membri`.
- Dopo questo aggiornamento le regole vanno **incollate di nuovo** (scheda Regole → Pubblica): senza la collezione `push` le notifiche non si attivano (il resto dell'app funziona lo stesso).
- iPhone: solo con l'app aperta dall'icona sulla schermata Home (iOS 16.4 o successivo).
