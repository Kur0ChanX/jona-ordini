# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-10 (sessione #52: v67 online (PR #77, squash `e66274c`), D21 chiusa; sessione #51: v66 online (PR #76, squash `35f2f3a`), D20 chiusa, giro completo v65 verde; v67 nella PR #77 (D21); sessione #50: v65 online (PR #75, squash `14847d4`), D19 chiusa, giro completo su GitHub lanciato; v66 nella PR #76 (D20); sessione #49: v65 nella PR #75 (Gemini 524); v64 online (PR #74, squash `95ca4cb`), D18 chiusa; regola «pubblica sempre in automatico»; sessione #48: v64 «niente prodotti doppi» pronta su `claude/v64-doppioni`, PR da aprire; v63 online (PR #73), D15 chiusa; sessione #47: D16 chiusa, PR #73 v63 con pulizia automatica; sessione #46: v62 online (PR #72), v63 «Prodotti di prova» sul ramo `claude/v63-listini-prova`, richiesta ponte RVC; sessione #41: v54→v61 online, agenda smart v58-v61, prova zona fotocamera v60; sessione #30: v45→v50 online (PR #54-#60), S1-S3 stabilità e D9 fatti, prove su GitHub attive; v45 online con la PR #54, D7 fatta; v46 online con la PR #55: bug della richiesta di Maurizio corretto, D8 fatta; sessione #29: D7 strada A fatta, v45 «app dimostrativa» pronta sul ramo; sessione #28: v44 online (PR #53), proposta D7 vetrina, C6 tolta perché v42 e v43 sono online; consigliato a Mario l'invito personale per Maurizio; sessione #27: v43 online con la PR #52, vista «F&B Mauro» nella barra Test, diario degli errori; sessione #26: v42 online con la PR #51, M18 e M4 fatti, v43 responsabili con orario libero, giro completo v42 rimandato da Mario; sessione #25: v41 online con la PR #50; v42 con tipi e F&B/Responsabile, prove legate riuscite; sessione #24: test-v40 corretta, giro completo v41 39/39, v42 agenda scritta nel ramo `v42-agenda`; sessione #23: merge di main nel ramo, v41 in prova; sessione #22: giro completo v40 38/38 riuscito; piano dell'inverno approvato; v40 online con la PR #49, notifiche funzionanti sul telefono di Mario (C1, C2 fatti); il lavoro inviti/entrata libera diventa v41). Copia in Word data a Mario in #14. Ogni cosa ha un **numero fisso** (M1…, D1…): per dirmi «fatto M4» basta il numero. Quello che è fatto si toglie. Le cose sono in ordine: la prima è la più urgente.

**⏸ Maurizio (M1, M2, M3, M6) è in stand-by: Mario avvisa lui quando è il momento. Nessuna fretta, l'app ha tutto l'inverno.**

**🔴 = blocca il lavoro nuovo** (regola di Mario: prima si chiudono queste, poi si va avanti; le rifiniture estetiche non bloccano).

## Riassunto: cosa manca, in ordine

| N. | Cosa | Di chi | Quando |
|----|------|--------|--------|
| M33 | v71 online (18:53): riapri l'app e guarda se il logo JONA all'apertura ora è nitido | Mario | ora |
| M31 | Scegliere la miglioria del logo: Ovvia (logo più grande all'apertura), Furba (lune che cadono con rimbalzo), Geniale (4 lune come segno di attesa nell'app, consigliata), Nessuna | Mario | quando vuoi |
| D29 | Ottimizzare l'app per Android, iPhone, Mac e Windows (Mario #60, strada 2 «Furba» #64). **v72 online (#67, PR #83)**: campi a 16 px (niente zoom su iPhone, prova `test-campi-16`), giro con WebKit e su computer 1280/1440 su GitHub. Resta solo (b) barra di stato su iPhone installata: non toccata (zona in alto già cambiata e tolta in v54); si guarda solo con una foto da un iPhone con l'app installata | Claude da solo | ora |
| D30 | Jona fuori dall'account GitHub personale (Mario #67: account con jona.ristorante@gmail.com). Proposte 3 strade (`docs/img/github-tre-strade.png`): Ovvia account nuovo, **Furba organizzazione gratis con proprietari ristorante + Kur0ChanX (consigliata)**, Geniale organizzazione YNOY-CORP per tutti i progetti. Da fare dopo la v73. Mario (#67): limiti separati → strada 3 scartata. **Repo pubblico**: nato così per GitHub Pages gratis e minuti di prova illimitati; ma contiene 8 foto di fatture dei fornitori (`docs/img/listini/`, prezzi) e nomi dello staff nei documenti, visibili anche nella cronologia → proposta: organizzazione + repo **privato** (minuti dell'organizzazione, 2000/mese, ~14 min per versione con le prove veloci). Prima di spostare: il vecchio indirizzo GitHub Pages (`kur0chanx.github.io/jona-ordini`, ancora attivo, rimanda a pages.dev) smette di funzionare → controllare che nessun telefono usi ancora l'app installata dal vecchio indirizzo. **SCELTA DI MARIO (#67, opzione toccata e confermata): organizzazione privata, creata dall'account jona.ristorante@gmail.com, Kur0ChanX secondo proprietario.** Prima era «Aspetta, ne parliamo». Mario: «mi sembra assurdo… che si utilizzi un mio account per ospitare un'app dell'hotel». Proposta di Claude: account del ristorante proprietario di un'organizzazione privata, Mario invitato. Scelta ancora da fare: le risposte «organizzazione + privato» e «Jona-Ordini by YNOY» erano domande scritte da Mario, non scelte (E30). Il link dell'app (pages.dev) non cambia. Nome scelto da Mario (#67, «la 3 senza -CORP finale», confermato): **`Jona-Ristorante-by-YNOY`**. Lo staff non deve rifare inviti né registrazioni: profili, inviti, QR e telefoni approvati stanno su Firebase/Cloudflare, non su GitHub. Piano: (1) Mario crea l'account GitHub con jona.ristorante@gmail.com e l'organizzazione (guida A-C data in #67 dopo la scelta; attendo «fatto»), invita Kur0ChanX come proprietario; (2) trasferimento del repo nell'organizzazione e app Claude installata lì; (3) piccolo repo pubblico `Kur0ChanX/jona-ordini` con solo la pagina che rimanda a pages.dev (il vecchio indirizzo GitHub Pages non si rompe); (4) repo privato; (5) aggiornare `source_url` in CLAUDE.md e consegne  **Stato #69 (11/10)**: organizzazione creata, Kur0ChanX Owner, app Claude installata. Mario: «non voglio vedere il mio nick nei link dei colleghi» → scelta **Geniale** (toccata e confermata): niente repo di rimando (passo 3 tolto); v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo segna nella scatola nera; quando per qualche giorno non arriva più nessuno → Transfer | Claude, dopo la scelta di Mario | v74 poi attesa |
| M35 | Mettere la variabile `JONA_DRIVE_URL` (l'URL /exec dello script del Drive) nell'ambiente di Claude Code: barra in alto → nome dell'ambiente → **Edit** → variabili d'ambiente → `JONA_DRIVE_URL=<URL>` → **Save**. In Jona e RVC, poi anche nell'account Hotmail. Guida data in #70 | Mario a mano | quando vuoi |
| M36 | Rispondere: il logo YNOY CORP con 3 lune (foto dell'11/10) va anche dentro l'app al posto di quello con 4 lune? | Mario | quando vuoi |
| D31 | Drive di Mario «Claude Code Lavoro» (sottocartelle Jona e RVC, scelta di Mario #69): **FATTO in #70** (app web Apps Script `tools/drive/Codice.gs`, caricatore `tools/drive/carica.sh`; loghi in Jona/Loghi e Jona/Loghi/YNOY CORP 3 lune). URL segreto: mai nel repo. Resta: proporre a Mario la regola «file importanti anche nel Drive»; RVC usa `sotto="RVC/…"` (detto alla RVC #57) | Claude | dopo M35 |
| M34 | Attivare l'autenticazione a due fattori (2FA) su GitHub per Kur0ChanX e per l'account del ristorante entro il **24/11/2026** (GitHub lo chiede, poi blocca le azioni). Con app Authenticator, e salvare i codici di recupero in un posto sicuro. Non blocca il trasloco di D30 | Mario a mano | entro 24/11 |
| D28 | Regola dei rami (CLAUDE.md «RAMI IN ORDINE», versione 10/10 sera: niente pulizia, solo nomi in ordine): metterla nel CLAUDE.md di RVC | Claude | prossimo contatto con RVC |
| D27 | Scorta automatica **fatta in Jona** (10/10, sessione #57, autorizzata da Mario): `.claude/hooks/scorta.py` + avviso in `avvio-check.py`, prova `tools/test-scorta.py` (16 controlli). Resta: RVC copia lo stesso file (messaggio mandato alla sessione RVC). | Claude | ora |
| M30 | Preferenze dei due account (Gmail e Hotmail): aggiungi la riga nuova di CAMBIO ACCOUNT («Se i token finiscono di colpo, riparti dal ramo col numero più alto…», testo in `docs/CAMBIO-ACCOUNT.md`) | Mario | quando prepari Hotmail (M29) |
| D22 | Lettore foto: **v68 online** (10/10, PR #79): Flash → Flash-Lite → Cloudflare Llama 4, banner dal vivo. Giro completo extra su GitHub partito alle 12:5x | Claude da solo | controllare il giro completo |
| D23 | Idea 1 (fatture da Gmail) scartata da Mario: «devo chiedere e arrivano tardi, al massimo carico io i file». Al suo posto: import di più XML insieme e dei file firmati `.p7m` (oggi errore `p7m`) | Claude da solo | da fare |
| D24 | ✅ v69 ONLINE 10/10 14:07 (PR #80): in approvazione delle richieste, «Da … costa … in meno · Passa» se lo stesso prodotto (stessa unità) costa meno da un altro fornitore. Il gestore non ha carrello e lo staff non vede i prezzi: il suggerimento sta solo lì. Prova `tools/test-conveniente.mjs` | Claude da solo | pubblicare |
| D25 | Idea 3 approvata: foto della bolla all'arrivo confrontata con l'ordine (mancanti / prezzo diverso in rosso) | Claude da solo | da fare |
| D26 | Idea 2 approvata: costo dei piatti dalle ricette (ingredienti dai listini, avviso se il costo sale) | Claude da solo | da fare |
| M29 | Preparare l'account Hotmail per il cambio account (`docs/CAMBIO-ACCOUNT.md`, passi 1-6) | Mario | prima che finisca il limite settimanale |
| M28 | Chiedere al commercialista se può mandare ogni mese le fatture dei fornitori in formato XML (file .xml o .p7m) | Mario | quando può |
| M27 | v67 online (dal 10/10): Fornitori → **Importa listini** → foto delle fatture (DAC, Mariano, Nieddittas) → **Trascrivi con Gemini**. Controlla le righe rosse «da controllare» e dimmi cosa non torna | Mario | appena v67 online |
| M22 | v53 online: chiudi e riapri l'app (o tocca «App da aggiornare»), manda un ordine e guarda l'animazione nuova; dimmi se il bordo bianco su mani e polsini è sparito e se il logo B ti piace | Mario | ora |
| M23 | Impostazioni del telefono → cerca «schermo intero» → **App a schermo intero** → Jona Ordini → **Schermo intero** (anche zona fotocamera): toglie la banda nera in alto. Dire a che passo è arrivato | Mario | ora |
| M26 | Dopo la v63 online: apri l'app (si aggiorna da sola o tocca «App da aggiornare»); i prodotti finti spariscono da soli. Dimmi se ne vedi ancora | Mario | ora (v63 online dal 09/10) |
| D14 | v62 fatta e online (PR #72). Resta solo la prova su Android della maschera SVG intorno a YNOY (righe/riquadri strani?) | Mario | quando vuoi |
| D17 | Ponte con l'app RVC (hotel). Mario (#66) lo richiede anche da Jona: «un'icona per condividere informazioni o mandare informazioni dei clienti all'hotel o necessità del ristorante all'hotel». Progetto di RVC: `docs/PONTE-JONA.md` del repo RVC (strada B, Worker con chiave; scelti P1 camere/ospiti, P3 vassoi, P4 guasti, P5 richieste ospite, P7 eventi; no addebiti, no allergie). Proposte a Mario 3 strade per l'icona 🏨 «Hotel» in Jona (`docs/img/ponte/d17-tre-strade.png`): Ovvia moduli, **Furba chat con etichette (consigliata)**, Geniale con dati che lavorano da soli. **Mario: gli piace la 3 e vuole le 3 unite in modo ordinato** → immagine della versione unita mandata (#67, `docs/img/ponte/d17-unita.png`, sorgente `.html` accanto): pagina «Hotel» = Oggi in hotel + 4 pulsanti con modulo corto + messaggi con stati; da soli: vassoio in home staff, ospiti nell'ordine suggerito, evento dell'agenda con conferma «Mando all'hotel?». **Mario: «Sì» (#67).** Campi di Jona e proposta tecnica (ponte nel Worker di Jona, `/ponte`, `PONTE_KEY`) in `docs/PONTE-RVC.md` §7, mandati a RVC #55. Prossimo: risposta di RVC, «Oggi in hotel» lo vedono **tutti** (Mario #67, a parole: «anche i nomi se clicchi non sono un problema direi tutti»): numeri in vista, al tocco l'elenco camere con il cognome dell'ospite. **v73 (#67)**: pagina «Hotel», Worker `/ponte`, hotel finto, agenda e ordine suggerito. Resta: collegamento vero quando RVC ha il suo server (D5 di RVC) + segreto `PONTE_KEY` uguale nei due progetti (Mario, guida da dare allora); notifiche push dei messaggi dell'hotel; foto dei guasti. RVC #54 avvisata | Claude, dopo la scelta di Mario | ora |
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
