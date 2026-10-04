# Passaggio di consegne (2026-10-04, notte)

## Stato attuale
- Ramo `ccr-402d6602-imjwpw`, tutto committato e pushato. **v28** (`APP_VER=28`, `CACHE=jona-ordini-v32`) contiene anche la v27: **non ancora pubblicate**. **Mario ha detto di pubblicare** («fai l'aggiornamento dell'app»): PR → squash merge → controllo online → `git fetch origin main && git merge origin/main` sul ramo → `git push` normale.
- **v27**: reazioni in chat (`messaggi/<id>.r.<persona>`, `CH_RE`, `chRx`, `chRb`, `chReact`, `chReOpen`, `chReClose`, `chRbFix`, `chLp`) e «Copia».
- **v28 vocali iPhone**: Chrome Android con `audio/mp4` senza codec registra **Opus dentro l'MP4** (verificato), illeggibile su iPhone; su iPhone il play dopo lo scaricamento può essere rifiutato. `chRec`: MediaRecorder solo con `mp4a.40.2`, MP4 semplice solo su iPhone/Safari (`chApple`), altrimenti `aacRec` (WebCodecs `AudioEncoder` AAC 32 kbps + intestazioni ADTS, `audio/aac`, già accettato dal Worker), WebM/Opus per ultimo. `chPlay`: lettore unico `chAu` sbloccato con `ALG_SIL` dentro il tocco; barra con `dur` del messaggio se il file non dice la durata (`chAuPaint`). I vocali vecchi (Opus) restano illeggibili su iPhone → messaggio «chiedi di rimandarlo».
- **v28 indietro del telefono**: `NAV` (`trap`, `skip`, `tabs`), `navSync` (in `render`, `openSheet`, `closeSheet`, `chOpen`: una voce in più nella cronologia finché c'è qualcosa da chiudere, tolta con `history.back()` + `skip` quando non serve più), `navBack` (foto, reazioni, registrazione, conversazione → lista, chat, `sugBack`/`impBack`, foglio, scheda precedente da `NAV.tabs`, max 10), `popstate`.
- Prove verdi: `test-v28` (27), `test-v27` (20, controllo versione reso `>=27`), `test-firebase-allegati` (22), `test-firebase-chat` (17), `test-firebase-telefoni` (24), `test-v26`, `test-v17`, `test-staff`, `test-orari`, `test-news`, `test-registrazione`, `test-scaglione2`, `test-voice`, `test-invio-anim`, `test-v16`. `test-firebase-sync` fallisce **già da prima** (aspetta la schermata di configurazione, ora c'è «Collega questo telefono»): da aggiornare.
- Online e attivi: foto e vocali (D1 `"allegati":4`), Gemini sul Worker (`"gemini":true`).

## Da provare dal vero dopo la pubblicazione
1. Vocale Android → iPhone (Mauro Loi) e iPhone → Android.
2. Gesto indietro su Android (foglio, chat, scheda precedente, uscita).

## Richieste di Mario da fare (in ordine)
1. **Pubblicare v27+v28** (autorizzato).
2. **Maurizio Lai (chef amministratore) non compare in Staff**: il codice non c'entra, la lista mostra tutti i profili del database (gestori sotto «Gestione», in attesa sotto «Da approvare», telefoni sotto «Telefoni da approvare», anche disattivati). Quindi il profilo non esiste nel database condiviso: Maurizio deve registrarsi dal link d'invito, poi Mario approva e mette il ruolo amministratore. Istruzioni già date; chiedere a Mario l'esito.
3. **Pallino (badge) sull'icona anche con le notifiche spente**, iPhone e Android, solo per le cose importanti (messaggi in chat, ordini/richieste da approvare, ecc.), non per gli aggiornamenti dell'app. Strada: `navigator.setAppBadge(n)` / `clearAppBadge()` dall'app (conteggio: chat non lette + cose da fare per il ruolo) e dal service worker all'arrivo di una push. Limiti da spiegare: su iPhone il badge funziona solo con l'app installata sulla schermata Home **e** permesso notifiche concesso (iOS lega il badge alle notifiche); su Android il pallino dipende dal launcher e di solito compare solo se c'è una notifica: senza permesso non si può forzare. Dire chiaramente a Mario cosa è possibile.
4. **Forma d'onda nei vocali** come WhatsApp: barre che seguono il volume (linea piatta se silenzio), colorate (colore dell'app, parte ascoltata più intensa). Calcolare ~40 picchi durante la registrazione (AnalyserNode/AudioContext sul flusso del microfono, o dai campioni in `aacRec`) e salvarli nel messaggio (es. `wf`: stringa di 40 cifre 0–9 o base64 corta); per i vocali vecchi senza `wf` barre piatte/neutre. Disegno in `chMsgBody` (`.cht-bar`) e avanzamento in `chAuPaint`.
5. «Chi c'è in turno oggi»: tasto ben visibile in «Orari» dello staff e in Staff → Orari (da `tp` della settimana pubblicata, con orari).
6. Promemoria ordini (Maurizio crea regole «ordinare X entro data/ora», a chi: staff/reparto/sé stesso, ripetibili; avviso all'apertura + push all'orario; promemoria personali). Proporre prima lo schema se ci sono dubbi.
7. «Consumi e costi» più interattivo e moderno (caricare la skill `dataviz` prima dei grafici).
8. Mauro Loi in «F&B Manager»: da confermare (Staff → Mauro Loi → Reparto → **Salva**).
- Mario ha scritto «a seguire tutte le altre cose che ti scrivo qui sotto», ma non c'era altro: chiedergli se vuole aggiungere qualcosa.

## Idee parcheggiate (non farle finché Mario non le chiede)
Foto della confezione → carrello, allarme quantità strana, «Rifai come martedì scorso», mancanti riordinati, risposta del fornitore dallo screenshot; listini (PDF, fattura XML che aggiorna i prezzi, sinonimi/unità, storico prezzi).

## File e funzioni utili (`index.html` salvo dove indicato)
- Chat: `CHAT`, `chWatch`, `chPaint`, `chSend`, `chOpen`, `chClose`, `chMsgBody`, `chAll` (const, non sostituibile nelle prove). Allegati: `ALG`, `algUp`, `algGet` (cache `jona-allegati`), `algImg`, `chFile`.
- Notifiche: `notify()` → `pushSend()`, `sw.js` mostra la notifica, `PUSH_DENY`, `pushDenied()`.
- Worker: `worker/src/index.js` (`/chiave`, `/invia`, `/gemini`, `/allegati`, `membro()`), workflow `.github/workflows/cloudflare-worker.yml`.
- Regole: `firebase/firestore.rules` (Mario le incolla a mano in Firebase).

## Prove
`tools/README.md`. Server: `python3 -m http.server 8765`; emulatore: `npx -y firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`, poi svuotare `demo-jona` e `jona-ordini` prima di ogni prova Firebase. In questa sessione è rimasto acceso anche un server sulla porta 8766 (inutile).

## Rischi aperti
- `/invia` del Worker non controlla chi chiama.
- Tutti i telefoni approvati leggono tutti i messaggi e scaricano gli allegati conoscendo l'id.
- `test-firebase-flow` fallisce tra le 23:30 e mezzanotte.
- Chrome può ignorare le voci di cronologia aggiunte senza un tocco: se il gesto indietro salta passi sul telefono vero, guardare `navSync` dopo `popstate`.
