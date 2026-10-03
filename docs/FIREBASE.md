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
3. Gli altri telefoni inquadrano il QR con la fotocamera, aprono il link, installano l'app e accedono. Chi è nuovo si registra e tu lo approvi in Staff.

## Come funziona
- Ogni telefono entra con un accesso anonimo e si iscrive con la **chiave del ristorante**, che sta nel link e nel QR. Senza chiave non si leggono i dati (regole in `firebase/firestore.rules`).
- I dati restano anche sul telefono: senza rete l'app funziona e manda le modifiche quando la connessione torna.
- I prodotti stanno in un documento per fornitore (`listini/<fornitore>`), così ogni apertura dell'app legge pochi documenti. Il piano gratuito (50.000 letture e 20.000 scritture al giorno) basta per il ristorante.
- Backup: Impostazioni → Backup dei dati → Esporta / Ripristina (il ripristino vale per tutti i telefoni).
- Copie automatiche: ogni giorno il primo telefono di chi gestisce salva una copia di tutto nel database (collezione `backup`); restano 14 giorni. Impostazioni → Copie automatiche → Scarica / Ripristina. Se le regole sono state incollate prima di questa funzione, incollale di nuovo.
