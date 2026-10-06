# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-06 (sessione #14). Copia in Word data a Mario in #14. Ogni cosa ha un **numero fisso** (M1…, D1…): per dirmi «fatto M4» basta il numero. Quello che è fatto si toglie. Le cose sono in ordine: la prima è la più urgente.

**⏸ Maurizio (M1, M2, M3, M6) è in stand-by: Mario avvisa lui quando è il momento. Nessuna fretta, l'app ha tutto l'inverno.**

**🔴 = blocca il lavoro nuovo** (regola di Mario: prima si chiudono queste, poi si va avanti; le rifiniture estetiche non bloccano).

## Riassunto: cosa manca, in ordine

| N. | Cosa | Di chi | Quando |
|----|------|--------|--------|
| 🔴 M11 | Account Cloudflare NUOVO solo per Jona + sottodominio `jona-ristorante-by-ynoy-corp` | Mario | subito (trasloco v37) |
| 🔴 M12 | Chiave e ID del nuovo account nei segreti GitHub | Mario | subito, dopo M11 |
| 🔴 M13 | Unire la PR della v37 | Mario | subito dopo M12 |
| 🔴 M14 | Reinstallare l'app dal nuovo indirizzo + inviti nuovi | Mario | dopo M13 |
| M15 | Cancellare `invito` e `jona-notifiche` dal VECCHIO account Cloudflare (non `fruguponte`) | Mario | dopo M14 |
| M1 | Maurizio crea il profilo e tu lo approvi | Mario | in stand-by |
| M2 | Dare a Maurizio il ruolo Admin Chef | Mario | in stand-by, dopo M1 |
| M3 | «Oggi si ordina» arriva a Maurizio | Mario | in stand-by, dopo M2 |
| M4 | Mauro Loi: reparto «F&B Manager» | Mario | quando vuoi (2 minuti) |
| M5 | Stampare e appendere il QR da cucina | Mario | quando vuoi |
| M6 | Maurizio imposta le scadenze dello staff | Maurizio | in stand-by, dopo M2 |
| M8 | Prove dal vero della v35 | Mario | con calma |
| M10 | Prova la v36 sul telefono (orari dello staff, video dell'invio) | Mario | quando vuoi |
| D4 | Contratto visibile anche ai Responsabili; segreto vero? | Claude, dopo la tua scelta | da decidere |
| D6 | Video dell'invio: migliorarli ancora (macchiolina tra le maniche) | Claude, quando lo chiedi | più avanti |
| D3 | Sicurezza del Worker (`/invia`, `/promemoria`) | Claude, solo se lo chiedi | in pausa |


---

## 1. Claude da solo
- **Dopo M14**: far cancellare a Mario i Worker `invito` e `jona-notifiche` dal VECCHIO account (lì resta `fruguponte`, da non toccare).
- **Dopo M13**: controllare i nuovi indirizzi (app, notifiche, invito), rilanciare il workflow del Worker se la prova fallisce.

## 2. Claude, dopo la tua scelta o approvazione
- **D6 · Video dell'invio**: approvati così (#11), da migliorare più avanti. Copia sicura nel ramo `scorta-video-invio-v1` (video, script `tools/anim-invio.py`, filmato originale): si riparte da lì, non da zero.
- **D3 · Sicurezza del Worker**: non fatta perché crea un malus (`/invia` senza controllo: col controllo le push ferme da più di un'ora partirebbero solo riaprendo l'app; `/promemoria` modificabile da qualsiasi telefono approvato). Se ne riparla solo se lo chiedi.

## 3. Mario a mano
- **M11 → M14 · Trasloco v37**: passi con link in chat (#13). Ordine: account Cloudflare nuovo solo per Jona (il vecchio ha `fruguponte` e altri progetti: il sottodominio è unico per account, non si tocca), sottodominio, chiave + ID nei segreti GitHub, unire la PR, poi telefoni da reinstallare con invito nuovo. Il QR da cucina (M5) va fatto DOPO il trasloco.
- **M10 · Prova la v36**: apri l'app, se esce «App da aggiornare» tocca il banner. Da staff: «I miei orari» mostra solo inizio e fine. Manda un ordine e guarda l'animazione.

### ⏸ In stand-by, con Maurizio (M1 → M2 → M3, in questo ordine)
- **M1 · Profilo di Maurizio**: Maurizio crea il suo profilo con l'invito; poi tu vai in **Staff** e lo approvi.
- **M2 · Ruolo**: sempre in **Staff**, tocca **Maurizio** e mettigli il ruolo **Admin Chef**.
- **M3 · Promemoria ordini**: **Impostazioni** → «Oggi si ordina» arriva a → tocca **Maurizio**.

### Piccole cose, quando vuoi
- **M4 · Mauro Loi**: **Staff** → **Mauro Loi** → Reparto «F&B Manager», svuota **Mansione**, **Salva**.
- **M5 · QR da cucina**: **Impostazioni** → **QR da cucina** → **Crea il QR**, stampalo e appendilo.
- **M6 · Scadenze dello staff**: le imposta Maurizio in **Impostazioni** → **Scadenze per lo staff** (dopo M2).

### M8 · Prove dal vero della v35, con calma
Una alla volta; dimmi solo «ok» o cosa non va:
1. Gesto indietro su Android
2. Pallino delle novità
3. Invito con codice
4. «In turno oggi»
5. Consumi e costi
6. Promemoria ordini dal server
7. Scadenze dello staff (dopo M6)
8. QR da cucina (dopo M5)

Regola decisa da Mario: **il contratto (ore dovute, confronto con le ore fatte) lo vedono solo i capi servizio, mai lo staff.**

Già provato e funziona: vocale da iPad verso Android.
