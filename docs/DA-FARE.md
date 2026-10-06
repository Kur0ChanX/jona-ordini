# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-05 (sessione #12). Ogni cosa ha un **numero fisso** (M1…, D1…): per dirmi «fatto M4» basta il numero. Quello che è fatto si toglie. Le cose sono in ordine: la prima è la più urgente.

**⏸ Maurizio (M1, M2, M3, M6) è in stand-by: Mario avvisa lui quando è il momento. Nessuna fretta, l'app ha tutto l'inverno.**

## Riassunto: cosa manca, in ordine

| N. | Cosa | Di chi | Quando |
|----|------|--------|--------|
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
| D1 | Link dell'app su Cloudflare Pages | Claude, dopo la tua scelta del giorno | da decidere |
| D2 | Nuovi indirizzi senza nomi: app su Cloudflare Pages + sottodominio Worker nuovo (v37) | Claude, Mario ha scelto (#12) | subito (#13) |
| D3 | Sicurezza del Worker (`/invia`, `/promemoria`) | Claude, solo se lo chiedi | in pausa |


---

## 1. Claude da solo
- Niente in sospeso.

## 2. Claude, dopo la tua scelta o approvazione
- **D1 · Cloudflare Pages** (gratis, hai detto sì). Prima va deciso il **giorno**, perché ogni telefono va ricollegato (invito + approvazione + accesso) e le notifiche riattivate.
- **D2 · Trasloco indirizzi (v37)**: Mario ha scelto (#12) strada A (nuovo sottodominio Worker) + app su Cloudflare Pages (via `kur0chanx.github.io`). Telefoni in prova: solo Maurizio, Mauro, Mario: rientrano con invito nuovo. Nomi e permesso: vedi `docs/PASSAGGIO-CONSEGNE.md`.
- **D6 · Video dell'invio**: approvati così (#11), da migliorare più avanti. Copia sicura nel ramo `scorta-video-invio-v1` (video, script `tools/anim-invio.py`, filmato originale): si riparte da lì, non da zero.
- **D3 · Sicurezza del Worker**: non fatta perché crea un malus (`/invia` senza controllo: col controllo le push ferme da più di un'ora partirebbero solo riaprendo l'app; `/promemoria` modificabile da qualsiasi telefono approvato). Se ne riparla solo se lo chiedi.

## 3. Mario a mano
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
