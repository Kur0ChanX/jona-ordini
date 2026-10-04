# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-04 (sessione #03). Si aggiorna a ogni cambiamento: quello che è fatto si toglie.

## 1. Claude da solo (nessuna scelta di Mario)
- `tools/test-firebase-flow` fallisce tra le 23:30 e le 24:00: sistemare la prova (non l'app).

## 2. Claude, dopo la scelta o l'approvazione di Mario
- **v35 promemoria ordini**: «Oggi si ordina da…» solo a Maurizio; allo staff «le richieste vanno inviate entro le HH:MM» con giorni e ora decisi da Maurizio. Servono 4 risposte: Maurizio = profilo scelto o tutti gli Admin Chef? Scadenza unica o per fornitore? Tutto lo staff o per reparto? Quando avvisare (es. 1 ora prima + all'orario)?
- **Telefoni collegati** (proposta in attesa di sì): in Staff, solo gestori e sviluppatore, elenco dei telefoni (iPhone/iPad/Android, stato, ultimo profilo entrato con data e ora).
- **Sicurezza del Worker**: `/invia` non controlla chi chiama; `/invito/<codice>` senza limite di tentativi; `/promemoria` modificabile da qualsiasi telefono approvato.
- **netWatch**: con molte scritture di fila passa al long polling per sempre e ricarica una volta.
- **Link dell'app** senza `kur0chanx`: dominio proprio (~10 €/anno) o Cloudflare Pages; tutti reinstallano l'app.
- **Sottodominio Worker** `mario-miscera`: cambiarlo? (qualche ora senza notifiche).

## 3. Mario a mano
- **Maurizio**: domani crea il suo profilo con l'invito, Mario lo approva in Staff e gli mette il ruolo Admin Chef.
- **Mauro Loi**: chiudere e riaprire l'app (v33), provare il microfono in chat e riferire cosa succede.
- **Mauro Loi**: Staff → Mauro Loi → Reparto «F&B Manager», svuotare Mansione, Salva.
- **Rispondere**: come finiva la frase «Lo staff può vedere chi c'è in turno ma non…».
- **Prove dal vero**: vocale Android→iPhone, gesto indietro Android, pallino, invito con codice, In turno oggi, consumi, promemoria dal server (v34).
