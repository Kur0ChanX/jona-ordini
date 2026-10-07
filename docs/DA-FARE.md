# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-07 (sessione #26: v42 online con la PR #51, M18 fatto, giro completo v42 rimandato da Mario; sessione #25: v41 online con la PR #50; v42 con tipi e F&B/Responsabile, prove legate riuscite; sessione #24: test-v40 corretta, giro completo v41 39/39, v42 agenda scritta nel ramo `v42-agenda`; sessione #23: merge di main nel ramo, v41 in prova; sessione #22: giro completo v40 38/38 riuscito; piano dell'inverno approvato; v40 online con la PR #49, notifiche funzionanti sul telefono di Mario (C1, C2 fatti); il lavoro inviti/entrata libera diventa v41). Copia in Word data a Mario in #14. Ogni cosa ha un **numero fisso** (M1…, D1…): per dirmi «fatto M4» basta il numero. Quello che è fatto si toglie. Le cose sono in ordine: la prima è la più urgente.

**⏸ Maurizio (M1, M2, M3, M6) è in stand-by: Mario avvisa lui quando è il momento. Nessuna fretta, l'app ha tutto l'inverno.**

**🔴 = blocca il lavoro nuovo** (regola di Mario: prima si chiudono queste, poi si va avanti; le rifiniture estetiche non bloccano).

## Riassunto: cosa manca, in ordine

| N. | Cosa | Di chi | Quando |
|----|------|--------|--------|
| C6 | v42 interruttori + agenda (tipi Evento/Informazione/Aggiornamento operativo/Memo; scrivono anche F&B Manager e Responsabile): main unito, `test-agenda` 60/60, `test-giro` e `test-news` riusciti nel ramo `v42-agenda`; manca: giro completo (ora o dopo, chiedere a Mario), PR. Poi v43 (avvisi agenda dal Worker), A, C, G, H, I, J, K, O, R, U | Claude | subito |
| C3 | `test-firebase-bulk` e `test-firebase-sync` non controllano niente (solo `console.log`): aggiungere i controlli | Claude | quando vuoi |
| M14 | Inviti nuovi allo staff dall'app (Staff → Invita) + togliere la vecchia icona | Mario | prima dell'apertura (staff ancora in prova) |
| M17 | Telefono in attesa `ISLyK5…` (nome «Mari…», cognome «S…»): chi è? approvarlo o rifiutarlo (Staff → Telefoni da approvare) | Mario | quando vuoi |
| M15 | Cancellare `invito` e `jona-notifiche` dal VECCHIO account Cloudflare (non `fruguponte`) | Mario | dopo M14 |
| M1 | Maurizio crea il profilo e tu lo approvi | Mario | in stand-by |
| M2 | Dare a Maurizio il ruolo Admin Chef | Mario | in stand-by, dopo M1 |
| M3 | «Oggi si ordina» arriva a Maurizio | Mario | in stand-by, dopo M2 |
| M4 | Mauro Loi: reparto «F&B Manager» (serve anche per scrivere nell'agenda v42) | Mario | ora (v42 online) |
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
- **Fatto M13 (07/10)**: v37 online, indirizzi nuovi controllati (app, notifiche, invito). La prova del workflow del Worker era fallita solo per il sottodominio appena creato: ora riprova fino a 3 minuti (sul ramo, va con la prossima PR).

## 2. Claude, dopo la tua scelta o approvazione
- **D6 · Video dell'invio**: approvati così (#11), da migliorare più avanti. Copia sicura nel ramo `scorta-video-invio-v1` (video, script `tools/anim-invio.py`, filmato originale): si riparte da lì, non da zero.
- **D3 · Sicurezza del Worker**: non fatta perché crea un malus (`/invia` senza controllo: col controllo le push ferme da più di un'ora partirebbero solo riaprendo l'app; `/promemoria` modificabile da qualsiasi telefono approvato). Se ne riparla solo se lo chiedi.

## 3. Mario a mano
- **M14 · Trasloco v37** (M11, M12, M13 fatti; Mario rientrato il 07/10 incollando la chiave del ristorante presa da Firebase, `chiave/ristorante` campo `v`, e approvandosi da Firebase): ora mandare gli inviti allo staff dall'app (prima, se serve: Impostazioni → **Entrata libera** → **Apri per 48 ore**; le regole sono già pubblicate, M18 fatto il 07/10). Il QR da cucina (M5) va fatto DOPO il trasloco.
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
