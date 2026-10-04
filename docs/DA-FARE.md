# Cose da fare (Jona Ordini)

Aggiornato: 2026-10-05 (sessione #04). Si aggiorna a ogni cambiamento: quello che è fatto si toglie.

## 1. Claude da solo (nessuna scelta di Mario)
- (niente da fare per ora)

## 2. Claude, dopo la scelta o l'approvazione di Mario
- **Link dell'app su Cloudflare Pages** (gratis, Mario ha detto sì): prima di farlo Mario deve sapere che ogni telefono va ricollegato (invito + approvazione + accesso) e le notifiche riattivate. Decidere il giorno.
- **Sicurezza del Worker non fatta perché creerebbe un malus**: `/invia` senza controllo (il service worker manda le push in sospeso senza gettone: col controllo, quelle rimaste ferme più di un'ora partirebbero solo riaprendo l'app); `/promemoria` modificabile da qualsiasi telefono approvato (il server non sa quale profilo usa il telefono). Riparlarne solo se Mario lo chiede.
- **Sottodominio Worker** `mario-miscera`: cambiarlo? (qualche ora senza notifiche).

## 3. Mario a mano
- **Maurizio**: crea il suo profilo con l'invito, Mario lo approva in Staff e gli mette il ruolo Admin Chef. Poi Impostazioni → «Oggi si ordina» arriva a → toccare **Maurizio**.
- **QR da cucina**: Impostazioni → QR da cucina → **Crea il QR**, stamparlo e appenderlo.
- **Scadenze per lo staff**: Maurizio le imposta in Impostazioni → Scadenze per lo staff.
- **Mauro Loi**: Staff → Mauro Loi → Reparto «F&B Manager», svuotare Mansione, Salva.
- **Rispondere**: come finiva la frase «Lo staff può vedere chi c'è in turno ma non…».
- **Prove dal vero**: gesto indietro Android, pallino, invito con codice, In turno oggi, consumi, promemoria dal server, scadenze dello staff, QR da cucina (vocale iPad → Android: funziona, provato da Mario).
