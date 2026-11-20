---
name: nuova-funzione
description: Occhio critico e file da toccare quando si aggiunge o cambia una funzione (le prime due righe valgono per ogni lavoro). Usala PRIMA del codice di una funzione nuova o cambiata e di nuovo prima di dire «fatto».
metadata:
  origin: kit, nata nel progetto fonte (Mario, C207 punto 3; regola «Occhio critico» di `docs/kit-progetto/REGOLE.md`, Mario #204)
---

# Funzione nuova o cambiata

## 1. Prima del codice: occhio critico (lo dico a Mario anche se non l'ha chiesto)
Per ogni voce: va bene / manca / proposta. Le correzioni ovvie le faccio e le dico; le proposte grandi le chiedo (una domanda, scelte numerate, il mio consiglio).

| Voce | Domanda |
|---|---|
| **C'è già?** (ogni lavoro) | Una funzione, un file, una voce di Da fare o una regola fa già questo lavoro, o lo contraddice? `grep -ril <argomento> app/src docs/ .claude/` → si allarga quello: una cosa in un posto solo (E207). |
| **Come lo vede Mario** (ogni lavoro) | Dove lo tocca, in quanti tocchi dall'Inizio, senza scorrere, coi dati veri (E203, E204, E206)? Cosa chiederà leggendo il resoconto? |
| **Senza Claude** (ogni voce) | Nomi, voci, elenchi, prezzi, testi: chi li gestisce li cambia dall'app (aggiungi, rinomina, nascondi, riordina) senza programmare? Anche le voci di serie? Nei dati si salva l'id, così un nome cambiato resta giusto nello storico e nelle conte vecchie. Per le liste semplici c'è già `logica/elenchi.js` (C25): si allarga quello. **Impostazioni dev** (Mario 31/10): ogni limite, tempo, numero, ordine, voce da aggiungere/togliere/spostare o personalizzazione della funzione: si può regolare da ⚙️ Impostazioni dell'utente dev (sezione solo `dev`)? Fattibile → si fa, con minimo, massimo e passo sicuri e il valore di base scritto nel codice; non fattibile o rischioso → una riga del perché nel 💡 PARERE. **Niente blocchi per persona**: mai un limite che interrompe un cliente, un amico o un collega (sembra un'app amatoriale); un limite per persona si chiede prima a Mario. Al suo posto 3 livelli, numeri regolabili dalle Impostazioni dev con tetti sicuri: 1) avviso: tetto ampio (3-5 volte l'uso normale) → segnalazione registrata a chi gestisce, servizio intatto (molto oltre = c'è un problema, poco oltre = si alza il tetto); 2) protezione: tetto altissimo (10-20 volte) o raffica da robot (es. 10 in un minuto) → modo ridotto (es. senza AI, risposte locali) e avviso urgente; 3) quota totale del servizio: avviso all'80 %, a quota finita modo ridotto, mai errore. |
| **Mai fuori** (accessi, profili, dati sul telefono) | Cosa vive SOLO nel telefono (memoria del sito, chiavi, impronta)? Identità e dati stanno sul server: il telefono tiene copie. Telefono perso, cambiato o memoria svuotata: la persona rientra col profilo di PRIMA, da sola (nome utente e password) o sbloccata da chi gestisce (permesso a tempo che solo quel telefono legge); mai un profilo nuovo o doppio, mai password o codici su carta o su GitHub. Almeno 2 persone possono sbloccare le altre: sotto 2 un avviso a chi gestisce, mai un blocco. L'app chiede al browser la memoria protetta. Prova automatica: si svuota il telefono e si controlla il rientro (stessa identità, un solo profilo). «Sono uscito»: prima la diagnosi sul server, poi il rientro; lo strumento che ridà un profilo parte di serie in sola lettura e ha un passo per ogni lavoro (E518, E520). |
| **Motore giusto** (ogni lavoro, C454) | Il motore della chat basta per questo lavoro? **Fable**: un errore guasta dati veri, soldi o sicurezza (regole di accesso, servizi esterni, server); lavoro grande e ancora vago; Opus ha già fallito 2 volte. **Opus**: codice con un piano chiaro. **Sonnet**: domande, spiegazioni, testi. Sbagliato → una riga sotto «Ho capito» (⬇️ basta Opus · ⬆️ serve Fable); Mario lo cambia con `/model` o dal menu dell'app, meglio in una chat nuova (a metà chat il motore nuovo rilegge tutto senza memoria veloce). Lavoro grande con Fable: regola «Fable pensa, Opus esegue» (skill `fable-opus`): Fable salva il piano a pezzi, Opus lo esegue (stessa chat o nuova). Funzione grande o rischiosa fatta con Opus: aiutante `consulente-fable` al massimo 2 volte (piano prima, modifiche dopo), mai per lavori piccoli. A fine turno controlla anche l'hook `spreco-token.py`. |
| **Fermati e pensa** (lavoro difficile: dati veri, soldi, accessi, più file; o 2° tentativo fallito; C469 M12) | Prima del codice scrivo nel file del lavoro: fatto quando (la prova che senza il mio cambio è rossa)? Cosa do per vero senza averlo visto (la più rischiosa la controllo subito)? Cosa può rompersi altrove? Una prova smentisce il piano → piano nuovo, non una pezza. |
| **Chi la usa** | Chi la vede e chi no (ruoli, reparti, ospiti)? Permessi in `firestore.rules`? Cosa vede chi non ha il permesso? |
| **Doppioni** | Due tocchi veloci, due telefoni, un messaggio ripetuto: nasce due volte? (id fisso o controllo nel lotto) |
| **Annulla** | C'è il tasto Annulla? Cosa torna indietro, anche sugli altri telefoni e nello storico? |
| **Senza rete** | Si salva sul telefono e parte al ritorno della rete? «⏳ telefono» → «✓ Salvato» solo con la conferma del server (S1, mai falsi ok). Elenchi che decidono a chi mandare: mai «nessuno» prima della risposta del server (E108). |
| **Due persone insieme** | Due persone cambiano la stessa cosa nello stesso momento: chi vince? Si perde qualcosa? L'altra lo vede subito? |
| **Il giorno dopo** | A mezzanotte, il giorno dopo, a fine stagione: cosa resta, cosa si azzera, cosa si archivia? «Oggi» preso una volta (E73). |
| **Errori** | Server che rifiuta, dato che manca, foto troppo grande, telefono vecchio: cosa vede la persona? Una scrittura rifiutata non deve bloccare la coda (E114). Ogni messaggio d'errore dice il perché vero (rete, permesso, server fermo e fino a quando) e, se sconosciuto, il suo codice: una foto deve bastare a capire; mai un'ipotesi scritta come domanda («manca la rete?»). |
| **Soluzione smart** (ogni funzione) | Almeno una soluzione smart che Mario non ha chiesto (più comoda, automatica, professionale: es. modulo sicuro per le chiavi, link già compilati, promemoria prima delle scadenze); decide Mario, mai io al posto suo; il minimo che funziona non basta. Proporre non è fare: le proposte grandi si chiedono. |
| **Lavori automatici** (giri, motori, sveglie, cron) | Prima di accenderli li misuro contro i limiti gratuiti (letture × giri al giorno); ogni giro finisce con un esito scritto per ogni elemento e non resta mai fermo sullo stesso errore; ogni indirizzo esterno lo provo dal vivo, anche dal sito vero. A un avviso di limite PRIMA fermo la fonte (in un minuto), poi correggo; mai blocchi alle persone e mai i soldi di Mario per un mio errore: solo pausa del lavoro automatico e avviso a Mario. |
| **Legende** (ogni schermata, Mario 12/11) | Colori, pallini, barre, sigle, icone senza testo, numeri senza unità: chi la usa per la prima volta capisce senza chiedere? Se no, legenda corta e discreta accanto (o «ⓘ» sul telefono), che non copre il lavoro. |
| **Notifiche** | Chi deve saperlo e come (push, chat, scheda)? E se ha le notifiche spente? |
| **Cosa tocca** | Quali altre funzioni cambiano (le altre schermate, i dati in comune, i servizi esterni)? |
| **Cosa la migliorerebbe** | Un'idea in più, anche se non chiesta (poche righe). |

## 2. File da toccare sempre
- **Testi:** ogni scritta da `t('…')`, chiave nuova in `app/src/lingue/it.js` (le altre lingue escono in italiano; EN e RO a fine versione: skill `i18n-sync`).
- **Logica:** la parte che decide va in `app/src/logica/*.js` (provabile senza browser); il database in `app/src/dati/*.js` (con la riga di import del diario dei salvataggi, `dati/diario.js`); lo schermo in `app/src/ui/*.js`.
- **Storico:** ogni azione lascia chi, cosa, quando (come `dati/azioni.js`: azione + evento nello stesso lotto).
- **Regole:** `firestore.rules` + prova in `tests/regole/` (rossa prima, verde dopo; chi NON deve poter fare).
- **Prove di unità:** `tests/<zona>.test.js` per la logica.
- **Prove nel browser:** `tests/e2e/<zona>.spec.js` per il percorso vero (tocco → risultato, anche sul telefono dell'altro; skill `e2e-testing`).
- **Novità della versione:** riga in `app/src/logica/versioni.js` (linguaggio da aggiornamento d'app, mai «come chiesto» o nomi).
- **Documenti:** `docs/APP.md` (come funziona) e `docs/DA-FARE.md` (nello stesso commit).
- **Aspetto:** se cambia, foto prima/dopo e ok di Mario (skill `foto`, `design-system`, `accessibility`).
- **Zona dell'altra chat** (`docs/CHI-FA-COSA.md`): prima la riga lì e l'avviso.

## 3. Prima di dire «fatto»
1. `npm run build`, prove di unità e regole, prove nel browser della parte toccata (in locale).
2. La provo come una persona vera: azione → risultato, sul telefono (390 px) e su quello dell'altro; senza rete e al ritorno della rete.
3. Dico a Mario su quali dispositivi è provata (Pixel 7 Chromium e PC; iPhone solo le prove chiave del lavoro `apple`, il lunedì; Mac, iPad e tablet no, E88) e cosa non ho provato.

## Lezioni dal diario (regole delle correzioni di Mario; testo intero con date e parole in `docs/ERRORI-STORIA.md`)
- Prima del piano (E184 E186 E214 E242 E280): `grep -ril <argomento> archivio/ docs/` e `docs/MESSAGGI-MARIO.md` → riga «Cosa c'è già» con OGNI file di Mario; riga «Come fanno i migliori» (Opera, Mews, SevenRooms, ricerca aggiornata) anche per il nome di un tasto; prima del «come» «a Mario serve?» con l'utilità nel lavoro; per un lavoro su carta prima come gira il foglio vero (mai «Copia» per un testo scritto a penna).
- Chi lavora (E278 E285 E297): una risposta di Chiara che dice già cosa fare la porto nell'app io, intera; mai chiedere numeri che nessuno può sapere (li impara l'app dai dati: conte, arrivi, Planner); un uso proposto si pensa sulla camera vera (senza frigobar non c'è foglio).
- Come si vede (E266 E238 E188 E195 E281): funzione forte = tasto grande in cima con icona e frase su cosa fa e cosa succede dopo, mai riga grigia; due cose diverse per chi usa l'app restano due schermate anche con dati e ricerca in comune; «database» o «storico» = pagina con elenco e ricerca, e a ogni «è online» DOVE si tocca; il primo risultato ha già il VALORE descritto da Mario; modulo da stampare rifatto meglio dell'originale (logo, tabella, caselle, totali, firme) e a Mario il PDF.
- Mai togliere (E209 E189 E263): niente dati nascosti per un documento che può essere vuoto (prova col caso peggiore dei dati veri); prima di riordinare l'Atlante «a cosa ti serve?» con le foto; uno strumento nuovo accanto a uno che Mario usa = prima migliorare quello che c'è.
- Finita e spenta (E199): in cima a `docs/DA-FARE.md` 🔴 «pronta, spenta: aspetta il tuo ok», domanda ripetuta a ogni consegna.
- Limiti gratuiti (E173 E181 E178 E216 E217): un lavoro automatico non toglie margine nei mesi pieni (stagione aprile-ottobre, prima il paracadute); a Mario QUALI limiti tocca in parole semplici e di chi sono i dati (app o Atlante; Worker e D1 in comune); ogni scrittura su D1 conta le righe con un tetto al giorno; numeri sempre col confronto con la fonte (Planner contro prese, saltate e perché) prima di dirli.
