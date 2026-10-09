# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-09 (sessione #41: v54→v61 online, agenda smart v58-v61, prova zona fotocamera v60; sessione #30: v45→v50 online (PR #54-#60), S1-S3 stabilità e D9 fatti, prove su GitHub attive; v45 online con la PR #54, D7 fatta; v46 online con la PR #55: bug della richiesta di Maurizio corretto, D8 fatta; sessione #29: D7 strada A fatta, v45 «app dimostrativa» pronta sul ramo; sessione #28: v44 online (PR #53), proposta D7 vetrina, C6 tolta perché v42 e v43 sono online; consigliato a Mario l'invito personale per Maurizio; sessione #27: v43 online con la PR #52, vista «F&B Mauro» nella barra Test, diario degli errori; sessione #26: v42 online con la PR #51, M18 e M4 fatti, v43 responsabili con orario libero, giro completo v42 rimandato da Mario; sessione #25: v41 online con la PR #50; v42 con tipi e F&B/Responsabile, prove legate riuscite; sessione #24: test-v40 corretta, giro completo v41 39/39, v42 agenda scritta nel ramo `v42-agenda`; sessione #23: merge di main nel ramo, v41 in prova; sessione #22: giro completo v40 38/38 riuscito; piano dell'inverno approvato; v40 online con la PR #49, notifiche funzionanti sul telefono di Mario (C1, C2 fatti); il lavoro inviti/entrata libera diventa v41). Copia in Word data a Mario in #14. Ogni cosa ha un **numero fisso** (M1…, D1…): per dirmi «fatto M4» basta il numero. Quello che è fatto si toglie. Le cose sono in ordine: la prima è la più urgente.

**⏸ Maurizio (M1, M2, M3, M6) è in stand-by: Mario avvisa lui quando è il momento. Nessuna fretta, l'app ha tutto l'inverno.**

**🔴 = blocca il lavoro nuovo** (regola di Mario: prima si chiudono queste, poi si va avanti; le rifiniture estetiche non bloccano).

## Riassunto: cosa manca, in ordine

| N. | Cosa | Di chi | Quando |
|----|------|--------|--------|
| M22 | v53 online: chiudi e riapri l'app (o tocca «App da aggiornare»), manda un ordine e guarda l'animazione nuova; dimmi se il bordo bianco su mani e polsini è sparito e se il logo B ti piace | Mario | ora |
| M23 | Impostazioni del telefono → cerca «schermo intero» → **App a schermo intero** → Jona Ordini → **Schermo intero** (anche zona fotocamera): toglie la banda nera in alto. Dire a che passo è arrivato | Mario | ora |
| D13 | v62 apertura: PR #72 aperta (https://github.com/Kur0ChanX/jona-ordini/pull/72), prove locali tutte verdi. Tutto scelto da Mario: YNOY scritto a mano, colpo variante **B** (granelli rasoterra), uscita **C** (prima JONA poi la firma). DA FARE: aspettare «Prove automatiche» verdi → squash merge → controllo online → merge di `main` nel ramo consegne; poi controllo su Android della maschera SVG (righe/riquadri). | Claude, poi ok di Mario sull'aspetto | ora |
| C8 | Banda nera chiusa (Mario 09/10: «per ora lo lascio così»): anche «Mostra sempre il notch» di Xiaomi non la toglie (`docs/img/segnalazioni/v62-*.jpg`). Alla prossima versione togliere `cutoutFix()` (v60, inutile) e aggiornare `tools/test-barra.mjs`. Riempirla solo nella schermata d'ingresso non si può: serve la richiesta di schermo intero (avviso di Chrome, v55) e solo dopo un tocco | Claude | prossima versione |
| M25 | v61 online: agenda come Admin Chef o F&B Mauro (NON «Staff»). Prova «Giorno» con gli appunti, un evento per «Persone» (es. solo Maurizio) con «Avvisa subito», «visto da». Poi falla provare a Mauro e dimmi cosa manca per lasciare l'agenda di carta | Mario | ora |
| D11 | Agenda passo B (dopo la prova di Mauro): ripetizioni complete (ogni giorno, giorni scelti), appunti veloci dalla home, coperti → ordine suggerito; «Per te in agenda» e «visto da» sono già fatti (v61) | Claude, dopo la tua scelta | dopo M25 |
| D10 | Riquadro «Inviato allo chef»: togliere «Esci dal profilo», solo «Continua» (immagine mandata, attesa risposta di Mario) | Claude, dopo la tua scelta | sessione #41 |
| M21 | Maurizio riapre l'app (si aggiorna alla v46): se compare «La richiesta non è ancora arrivata» tocca **Riprova**; poi tu lo approvi dalla striscia in cima | Mario | ora |
| M20 | Dalla v52: Staff → in fondo «Versione di prova» → **Manda la versione di prova** a Chiara, consulenti e proprietari (prima provarla da https://jona-ristorante-by-ynoy-corp.pages.dev/#demo) | Mario | ora (v45 online) |
| C7 | Dopo D7: riga riga «“Oggi si ordina” arriva a» più chiara (prima immagine a Mario), giro completo v42-v45 (chiedere «ora o dopo?»), A, C, G, H, I, J, K, O, R, U | Claude | ora |
| C3 | `test-firebase-bulk` e `test-firebase-sync` non controllano niente (solo `console.log`): aggiungere i controlli | Claude | quando vuoi |
| M14 | Inviti nuovi allo staff dall'app (Staff → Invita) + togliere la vecchia icona | Mario | prima dell'apertura (staff ancora in prova) |
| M17 | Telefono in attesa `ISLyK5…` (nome «Mari…», cognome «S…»): chi è? approvarlo o rifiutarlo (Staff → Telefoni da approvare) | Mario | quando vuoi |
| M15 | Cancellare `invito` e `jona-notifiche` dal VECCHIO account Cloudflare (non `fruguponte`) | Mario | dopo M14 |
| M1 | Maurizio crea il profilo e tu lo approvi | Mario | in stand-by |
| M2 | Dare a Maurizio il ruolo Admin Chef | Mario | in stand-by, dopo M1 |
| M3 | «Oggi si ordina» arriva a Maurizio | Mario | in stand-by, dopo M2 |
| M19 | Mauro e Maurizio: contratto «Full time Responsabile» (orario libero) | Mario | ora (v43 online) |
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
- **M19 · Responsabili**: con la vista Admin Chef, **Staff** → tocca **Mauro Loi** → «Contratto e orari» → **Full time Responsabile** → **Salva**. Lo stesso per Maurizio quando ha il profilo (dopo M2). (M4 fatto il 07/10.)
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
