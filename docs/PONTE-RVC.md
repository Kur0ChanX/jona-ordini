# Ponte Jona ↔ RVC (D17 di Jona, C18 di RVC)

Copia del file `docs/PONTE-JONA.md` del repo RVC (`RVC-Operation-by-YNOY-CORP/RVC`, ramo `claude/rvc-ramo-definitivo`, commit `afa8b8b`), aggiornata nella sessione Jona #67. In fondo la parte di Jona (§7). Se i due file non coincidono, vale l'ultimo accordo scritto in entrambi.

Stato: **proposta** (sessione #30, 09/10/2026). Fase di progetto: niente codice vero finché Mario non lo chiede.
Jona Ordini (`Kur0ChanX/jona-ordini`) è l'app del ristorante Jona di Villa Carola. RVC è il gestionale dei reparti dell'hotel.
Richiesta di Mario (#28): «dai la possibilità di lasciare un ponte con l'app Jona per informazioni condivise … possono essere 2 app che lavorano a stretto contatto».
Cosa condividere lo sceglie Mario; come farlo lo sceglie Claude (regola «decido io sul tecnico»).
I nomi dei campi definitivi arrivano dalla sessione Jona #47 (send_message): fino ad allora i nomi qui sotto sono provvisori.

## 1. Come collegarle: 3 strade

| Strada | Come funziona | Pro | Contro |
|---|---|---|---|
| A. Stesso Firebase | Le due app usano un solo progetto Firebase, con raccolte comuni | Tempo reale e offline già pronti | Jona andrebbe traslocata; i limiti gratuiti di Spark (letture e scritture al giorno) si dividono in due; un errore di un'app può toccare i dati dell'altra |
| B. **Ponte su Cloudflare Worker** (scelta) | Ogni app manda i «messaggi del ponte» a un piccolo servizio (Worker) con una chiave segreta; il Worker li salva (D1) e avvisa l'altra app (notifica push o lettura ogni tanto) | Le due app restano separate e indipendenti; un solo punto da controllare, con lo storico di tutto; il Worker serve comunque a RVC (notifiche, foto); gratuito (100.000 richieste al giorno) | Un pezzo in più da scrivere; non è tempo reale «puro» (secondi di ritardo, ma basta) |
| C. Ognuna legge il Firebase dell'altra | L'app RVC si collega anche al Firebase di Jona e viceversa | Nessun servizio in mezzo | Chiavi e permessi incrociati nelle app: rischio privacy alto, regole difficili; se un'app cambia, l'altra si rompe |

**Scelta: B.** Motivo: è la più sicura e stabile. Ogni app resta padrona dei suoi dati e ne manda solo una parte, decisa da Mario. Se il ponte si ferma, le due app continuano a lavorare (offline-first: i messaggi aspettano in coda e partono dopo).

## 2. Regole del ponte
- Si condivide **il minimo indispensabile**: numero di camera prima del nome. Il cognome dell'ospite solo se serve davvero.
- **Allergie e salute** sono dati «particolari» (GDPR art. 9): fuori dal ponte all'inizio. Si aggiungono solo con il consenso dell'ospite e il parere del consulente (voce M5).
- Ogni messaggio ha: chi l'ha mandato (app, persona), quando, cosa, e la conferma di ricezione dall'altra parte (regola S1: niente «falsi ok»).
- Ogni messaggio ha un numero unico: se arriva due volte, conta una volta sola.
- I messaggi vecchi si cancellano da soli dopo un tempo da decidere con il consulente (proposta: 30 giorni; gli addebiti fino alla chiusura del conto).
- La chiave segreta del ponte sta solo nei Worker e nei segreti di GitHub, mai nel codice pubblico (Jona è un repo pubblico).

## 3. Cosa si potrebbe condividere (Mario sceglie)

| N. | Informazione | Verso | A chi serve |
|---|---|---|---|
| P1 | Camere occupate oggi, numero di ospiti, arrivi e partenze | RVC → Jona | Ristorante: coperti attesi, colazioni, chi parte |
| P2 | Addebito in camera (consumo al ristorante da mettere sul conto) | Jona → RVC | Ricevimento: lista da addebitare in 5stelle e spunta «addebitato» (come il minibar) |
| P3 | Vassoi o piatti del servizio in camera da ritirare | RVC → Jona | La ragazza li trova in camera; il ristorante li ritira |
| P4 | Guasto segnalato al ristorante (luce, frigo, perdita) | Jona → RVC | Manutenzione: entra nei ticket di RVC |
| P5 | Richieste speciali dell'ospite (es. torta in camera, colazione in camera, cena tardi) | Jona ↔ RVC | Ricevimento, HK, ristorante |
| P6 | Biancheria del ristorante (tovaglie, tovaglioli) da mandare in lavanderia | Jona → RVC | Lavanderia, facchini |
| P7 | Eventi (cene, gruppi) con orari e numero di persone | Jona → RVC | Facchini, HK (aree comuni), manutenzione |

Proposta di Claude: P1, P2, P3, P4. **Scelta di Mario (#30, 09/10/2026)**: «p1 p4 p5 p7», poi chiarito «si segnalano vassoi da ritirare da p1 a p4 no addebiti per ora» → prima versione con **P1, P3, P4, P5, P7**. **P2 addebiti: no per ora**. P6 biancheria: fuori.

## 4. Forma dei messaggi (allineata con Jona #67, 10/10/2026)

```
{
  id: "uuid",                 // numero unico, creato sul telefono (niente doppioni se si rimanda)
  tipo: "...",                // vedi elenco sotto
  da: "jona" | "rvc",
  struttura: "villa-carola",
  camera: "104" | null,
  quando: "2026-10-09T12:30:00Z",   // ora del tocco sul telefono
  chi: "id della persona",
  dati: { ... },              // dipende dal tipo
  stato: "inviato" | "arrivato" | "visto" | "fatto" | "annullato"
}
```

Tipi (stessi nomi nelle due app):
| Tipo | Da | Dati | In RVC va a | In Jona |
|---|---|---|---|---|
| `oggi` | rvc | camere, ospiti, arrivi, partenze (solo numeri, niente nomi) | — | «Oggi in hotel» |
| `richiesta` | rvc | sottotipo (`colazione`, `torta`, `cena-tardi`, `benvenuto`, `speciale`, `altro`), giorno, ora, persone, nota | — | messaggio «Richiesta» |
| `vassoio` | rvc | camera | — | «Ritira vassoio» |
| `guasto` | jona | dove, cosa, urgente, foto | Manutenzione | tasto «🔧 Guasto» |
| `evento` | jona | giorno, ora, persone, dove | Porter · HK aree comuni | tasto «📅 Evento» |
| `richiesta-ospite` | jona | camera, cosa, ora | Ricevimento | tasto «🛎 Richiesta ospite» |
| `serve-a-noi` | jona | cosa, per quando | Ricevimento e Chiara (linguetta «🍽️ Ristorante»; possono girarlo ai Porter) | tasto «📦 Serve a noi» |
| `testo` | tutte e due | testo libero, camera facoltativa | linguetta «🍽️ Ristorante» | chat «Messaggi con l'hotel» |

Stati: `inviato` (partito dal telefono) → `arrivato` (l'altra app l'ha ricevuto) → `visto` (qualcuno l'ha aperto: «Ho letto») → `fatto`. Si mostra solo quello che conferma il server (regola S1). Niente addebiti, niente allergie o salute.

Indirizzi del Worker (provvisori): `POST /ponte/messaggi` (manda), `GET /ponte/messaggi?dopo=<data>` (legge i nuovi), `POST /ponte/messaggi/<id>/stato` (conferma). Chiave nell'intestazione `Authorization`.

## 5. Prossimi passi
1. ~~Mario sceglie cosa condividere~~ fatto: P1, P3, P4, P5, P7 (P2 no per ora, P6 fuori).
2. ~~Allineare i nomi con Jona~~ fatto nella #55 (tabella §4, mandata a Jona #67).
3. Si scrive il codice solo con la Tappa 2 (C1), insieme al Worker di RVC, e solo col via di Mario.

## 5b. Icona «🍽️ Ristorante» (approvata da Mario, #54, 10/10/2026, foto 33 `archivio/sessione-54/foto-33-proposta-c18-ristorante.png`)
Richiesta di Mario (#53): «mettiamo un'icona per condividere informazioni dei clienti al ristorante o necessità dall'hotel al ristorante Jona». Risposta alla foto 33: «Sì, va bene».
- **Chi la vede**: ricevimento e Chiara (linguetta «🍽️ Ristorante» con il numero dei messaggi nuovi). Le ragazze hanno solo il tasto «🍽️ Vassoio da ritirare» nella camera (P3). I guasti di Jona vanno alla manutenzione (P4).
- **Oggi per il ristorante (P1, parte da solo)**: ospiti, camere, arrivi (camera·persone), partenze; «✓ Jona l'ha ricevuto alle …».
- **Manda al ristorante (P5)**: tasti grandi 🍳 Colazione in camera · 🎂 Torta / sorpresa · 🌙 Cena tardi · 🥂 Benvenuto in camera · ⭐ Ospite speciale · ✍️ Altro. Ogni richiesta: camera a tocchi, Oggi/Domani, ora a tocchi, persone, nota (✍️ Scrivi / 🎤 Detta), «Manda a Jona». Stato: ⏳ sul telefono → ✓ arrivato a Jona → ✓ fatto (regola S1). Senza rete aspetta e parte da sola.
- **Dal ristorante**: guasti (→ Manutenzione), eventi (P7, → Porter · HK aree comuni), richieste fatte dall'ospite al ristorante (→ Ricevimento), «Serve a noi» (cose che servono al ristorante, es. 20 tovaglie: → Ricevimento e Chiara, che possono girarlo ai Porter; aggiunto nella #55 dal disegno di Jona), con «Ho letto».
- **Privacy**: allergie e salute non passano dal ponte (scritta fissa sulla schermata).
- Online serve il Worker (D5, Cloudflare); prima si costruisce e si prova col simulatore.

## 6. Messaggio per la sessione Jona (pronto dalla #31, 09/10/2026)
Mario (#31): «2 e 3 dopo guardo l'app» → mandare a Jona le scelte senza aspettare la #47. Nella #31 nessuna sessione Jona era raggiungibile con send_message: il testo è qui, si manda appena una sessione Jona è attiva (o Mario lo incolla in Jona).

> Da RVC #31 a Jona. Ponte RVC ↔ Jona (voce C18 di RVC, D17 di Jona). Proposta completa: `docs/PONTE-JONA.md` del repo `RVC-Operation-by-YNOY-CORP/RVC`, ramo `ccr-21870003-1jtfk9`.
> Strada scelta: **B**, un Worker Cloudflare con chiave segreta fa da ponte; le due app restano separate e offline-first (coda dei messaggi).
> Scelte di Mario: **P1** camere occupate, ospiti, arrivi e partenze (RVC → Jona); **P3** vassoi da ritirare in camera (RVC → Jona); **P4** guasti segnalati dal ristorante (Jona → RVC, diventano ticket); **P5** richieste speciali dell'ospite (in entrambi i versi); **P7** eventi con orari e persone (Jona → RVC). **P2 addebiti in camera: no per ora.** P6 biancheria del ristorante: fuori. Allergie e salute: fuori dal ponte (GDPR art. 9).
> Forma provvisoria dei messaggi: `{id, tipo, da, struttura, camera, quando, chi, dati, stato}` (§4). Mandateci i nomi dei vostri campi per P4, P5 e P7 e cosa vi serve dentro P1 e P3: allineiamo i nomi qui e copiamo il file anche in Jona.
> Niente codice vero finché Mario non dà il via (Tappa 2 di RVC).

## 7. Parte di Jona (sessione #67, 10/10/2026)
Mario ha approvato (#67, «Sì») l'immagine `docs/img/ponte/d17-unita.png`: icona 🏨 «Hotel» in alto in Jona, con le 3 idee unite.
- **Pagina «Hotel»**: in cima «Oggi in hotel» (P1, solo numeri e camere, mai nomi); 4 pulsanti «Manda all'hotel»: 🔧 Guasto (P4), 🛎 Richiesta ospite (P5), 📅 Evento (P7), 📦 Serve a noi (`serve-a-noi`, nuovo); sotto il filo dei messaggi con l'hotel, come una chat con etichette, con stati ✓ arrivato · ✓✓ visto · ✔ fatto, e risposta libera.
- **Da soli nel resto di Jona**: vassoio (P3) → compito «Ritira vassoio · camera N» nella home dello staff con **✔ Fatto**; ospiti di domani (P1) → ordine suggerito in Invii; evento dell'agenda → domanda «Mando l'evento all'hotel?» (Sì/No, mai in automatico); richieste dall'hotel → campanella.
- **Chi vede «Oggi in hotel»**: tutti, staff compreso (Mario #67): solo numeri, niente nomi.
- **«Serve a noi»** (`serve-a-noi`, nuovo, Jona → RVC): necessità del ristorante verso l'hotel (es. 20 tovaglie pulite per stasera). Richiesta di Mario in Jona #66 («necessità del Ristorante Jona all'hotel»). Copre in parte la vecchia P6 biancheria, ma come richiesta libera.

### Nomi dei campi (accordo con RVC #55, 10/10/2026)
Valgono i nomi di RVC (§4 aggiornato nel repo RVC, commit `dba35f1`, già usati nel codice RVC C18): Jona li adotta così come sono.
- Busta: `{id (uuid dal telefono), tipo, da, struttura, camera|null, quando, chi, dati, stato}`; stati `inviato → arrivato → visto → fatto` (+ `annullato`), mostrati solo se confermati dal server (S1).
- Da RVC: `oggi` (camere, ospiti, arrivi, partenze: solo numeri) · `richiesta` (`sottotipo` colazione|torta|cena-tardi|benvenuto|speciale|altro, giorno, ora, persone, nota) · `vassoio` (camera).
- Da Jona: `guasto` (dove, cosa, urgente, foto) · `evento` (giorno, ora, persone, dove) · `richiesta-ospite` (camera, cosa, ora) · `serve-a-noi` (cosa, per quando) · in tutte e due le direzioni `testo` (testo libero, camera facoltativa).
- Aggiunte chieste da Jona a RVC (#67, in attesa di risposta): `oggi` anche con i numeri di **domani** (servono all'ordine suggerito); `rif` = id del messaggio a cui si risponde; `nome` breve di chi manda da mostrare; evento con id fisso `ev_<id agenda>` (cambiato → si rimanda, cancellato → `annullato`).

### Dove vive il ponte (proposta tecnica di Jona)
Dentro il Worker di Jona già online (`worker/`, D1 `jona-allegati-0`, deploy automatico), indirizzi `/ponte/...` di §4, tabella `ponte` a parte e chiave segreta `PONTE_KEY` diversa dalla chiave del ristorante: RVC chiama con `Authorization: Bearer <PONTE_KEY>`, Jona con il gettone Firebase dei membri (come `/gemini`). Così il ponte funziona prima che il Worker di RVC (D5) esista; si può spostare in un Worker a sé più avanti senza cambiare gli indirizzi. Foto: `POST /ponte/allegati` (stesso sistema di `/allegati`), nel messaggio solo l'id. Messaggi cancellati dopo 30 giorni (proposta §2).

### Prossimi passi lato Jona
1. Conferma dei nomi da RVC (send_message).
2. Codice: prima Jona con dati finti (simulatore dell'hotel nella barra Test), poi `/ponte` nel Worker con le prove; online solo quando RVC è in uso.
