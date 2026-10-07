# Jona Ordini · piano dell'inverno (sessione #22, 07/10/2026, approvato da Mario)

## Contesto
- App in prova (Mario e pochi altri). Apertura vera: prossima stagione. Tutto l'inverno per migliorarla.
- Giro completo sulla v40: **38 prove su 38 riuscite** (C4 chiuso).
- M14 (inviti allo staff) non è più 🔴: lo staff non usa ancora l'app. Da aggiornare in `docs/DA-FARE.md`.
- Regola nuova di Mario: **l'app deve restare pulita**. Le funzioni nuove si accendono/spengono nelle Impostazioni.

## Risposta: offline
| Cosa | Senza rete |
|---|---|
| Aprire l'app, vedere listini, ordini, orari | ✅ copia sul telefono (`sw.js` + `enablePersistence`) |
| Creare/modificare ordini, consegne, orari, chat testo | ✅ salvati sul telefono, partono da soli al ritorno della rete (app aperta o alla riapertura) |
| Notifiche agli altri | ✅ in coda (`jona-outbox`), partono dopo |
| Foto/vocali in chat, Gemini, inviti, meteo, prima apertura | ❌ servono internet |

## Cosa ha scritto Mario in «altro» (punto per punto)
| Richiesta di Mario | Dove è nel piano |
|---|---|
| Agenda per Mauro al posto dell'agenda di carta, da convertire «a tutti i costi» | Punto 1 (foto dell'agenda → eventi) |
| Rapida, pratica, funzionale, innovativa | Punto 1 (una riga scritta o detta, pulsanti grandi) |
| Condividerla con lo staff: «oggi c'è quell'evento» | Punto 1 (privato/condiviso, «Oggi in hotel», notifica del mattino) |
| Altre idee mie per l'agenda smart | Punto 1 + idee V, W, X sotto |
| Altre idee per l'app | Punto 3 |
| Calendario consegne e le altre funzioni scelte: accese/spente nelle Impostazioni | Punto 0 |
| Tante funzioni ma «non so quali useranno», schermata pulita | Punto 0 + idea Z (conta d'uso) |

## Ordine di lavoro proposto

### 0. Base: interruttori delle funzioni (prima di tutto)
- Impostazioni → **Funzioni**: un interruttore per ogni funzione nuova (`config/app.funz`, valida per tutto il ristorante, solo i gestori la cambiano).
- Spenta = sparisce da menù, home e notifiche. Partono tutte spente.
- Pro: app pulita, si prova una funzione alla volta. Contro: una prova in più per ogni funzione (accesa/spenta).

### 1. Agenda smart per Mauro (priorità di Mario: «convertirlo a tutti i costi»)
- **Foto dell'agenda di carta → eventi**: Gemini legge la pagina e crea gli eventi (così Mauro non riscrive niente).
- **Scrivi o detta in una riga**: «giovedì 20 matrimonio 120 coperti ore 19» → data, ora, titolo, coperti capiti da soli.
- **Privato o condiviso**: ogni evento è solo suo, oppure per tutti o per reparti scelti.
- **«Oggi in hotel»**: riga in cima alla home e notifica al mattino ai reparti scelti (riusa il cron del Worker e `scadTick`).
- **Promemoria** prima dell'evento; **ricorrenze** (ogni lunedì, ogni mese).
- Viste: Oggi · Settimana · Mese. Pulsanti grandi.
- Collegamento con gli ordini: evento con coperti → l'ordine suggerito ne tiene conto (idea F).
- V. **Evento → cose da fare**: a un evento si attacca una lista («ordinare fiori», «chiamare il DJ») con spunta e responsabile.
- W. **Conferma di lettura**: Mauro vede chi dello staff ha letto l'avviso dell'evento.
- X. **Appunti veloci**: un tocco dalla home per una nota a voce o scritta, da trasformare dopo in evento.
- Z. **Conta d'uso delle funzioni**: in Impostazioni → Funzioni, accanto a ogni interruttore, quante volte è stata usata nell'ultimo mese. Così Mario vede cosa usano davvero e spegne il resto.

### 2. Già scelte da Mario
| N. | Idea | Note |
|---|---|---|
| A | Bolla letta da sola | Gemini confronta foto della bolla e ordine (`setBolla`, `gemCall`) |
| C | Food cost ricette | Costo del piatto dai listini, si aggiorna con gli aumenti |
| G | Confronto prezzi tra fornitori | Al momento dell'ordine indica chi costa meno |
| H | Più lingue | Inglese e altre per lo staff stagionale |
| I | Ordine a voce | Frase → carrello da controllare (Gemini) |
| J | Budget per reparto | Tetto mensile con avviso (riusa «Consumi e costi») |
| K | Riepilogo della settimana | Notifica del lunedì al gestore |
| O | Calendario consegne | Cosa arriva e quando, avviso se in ritardo (si unisce all'agenda) |

### 3. Altre idee nuove — Mario sceglie **R** e **U** (S e T restano da valutare). Regola di Mario: leggere sempre per intero quello che scrive in «Altro».
- R. **«Il mio giorno»** per il gestore: una schermata con ordini da fare, consegne attese, eventi, chi è in turno.
- S. **Pagella dei fornitori**: puntualità ed errori nelle consegne, calcolati dalle consegne registrate.
- T. **Scadenze di pagamento** delle fatture dei fornitori, con promemoria.
- U. **Ricerca unica**: una barra che trova prodotti, persone, messaggi ed eventi.

## Prove in hotel per Mario (senza codice)
1. Importa listini → **Excel** con colonne codice, nome, categoria, prezzo.
2. Importa → **Fattura elettronica XML**.
3. Importa → **foto** di un listino stampato.
4. Ordine → «Sì, inviato» → consegna con foto della bolla.
5. Modalità aereo: crea un ordine, poi riattiva la rete e guarda che arrivi.

## Come si procede
- Una funzione per versione (v41 = inviti/entrata libera già pronta; poi v42 = interruttori + agenda).
- Per ogni funzione: piano operativo breve, prova automatica nuova in `tools/`, `tools/test-giro.mjs`, scelta delle prove come da `CLAUDE.md`.
- File toccati: `index.html` (interfaccia e logica), `worker/` (notifiche del mattino e promemoria), `firebase/firestore.rules` (collezione agenda), `sw.js`, `docs/DA-FARE.md`.
