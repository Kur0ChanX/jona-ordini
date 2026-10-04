# Passaggio di consegne (2026-10-04, sera)

Sessione attuale: #03

## Ultimo messaggio di Mario
«non voglio che avvisa i gestori ma avvisi maurizio di ordinare e lo staff che va fatto l'ordine entro un orario specifico deciso da Maurizio anche ricorrente»

## Da fare SUBITO (sessione #03): v35, destinatari dei promemoria
Richiesta di Mario sui promemoria della v34 (prima di scrivere codice, proporre il piano in 3 punti e chiedere conferma sui dubbi qui sotto):
1. **«Oggi si ordina da…» solo a Maurizio** (amministratore/chef), non a tutti i gestori. Oggi `promPlan` (index.html) mette nel piano le iscrizioni push di tutti gli staff con `ruolo==='gm'` attivi, e `deadlineTick` scrive l'avviso con `notify('gm',…)`.
2. **Avviso allo staff: «le richieste vanno inviate entro le HH:MM»**, con orario scelto da Maurizio, anche ricorrente (giorni della settimana + ora). Probabilmente un'impostazione nuova (es. `config/app` o per fornitore/reparto), mandata nel piano al Worker con le iscrizioni dello staff; `promTick` (worker/src/index.js) manda la push anche ad app chiusa.
- Dubbi da chiedere a Mario: «Maurizio» = un profilo preciso scelto nelle impostazioni o tutti i `gm`? Lo staff riceve l'avviso per fornitore (es. «Pescheria entro le 11:00») o una scadenza unica delle richieste? Tutto lo staff o per reparto? Quanto prima dell'orario (es. 1 ora prima + all'orario)?
- Ricordare: Worker cambia → il workflow Cloudflare si rilancia da solo con il merge in `main` (path `worker/**`); `APP_VER` 35, `NEWS`, `CACHE` `jona-ordini-v39`, prova `tools/test-v35.mjs` (sulla falsariga di `tools/test-v34.mjs`), rilanciare `test-v34`, `test-v31`, `test-firebase-push`, `test-giro`.

## Fatto in sessione #02
- **v33 pubblicata** (PR #42, squash `6b8d597`): vocali da iPhone. Online verificata (`APP_VER=33`, `CACHE` v37).
- **v34 pubblicata** (PR #43, squash `3aaacdd`): promemoria ordini dal server. Online verificata (`APP_VER=34`, `CACHE` `jona-ordini-v38`); workflow Cloudflare run 37227282663 verde; `/salute` → `promemoria:true`; `/promemoria` senza gettone → 403.
  - `worker/src/index.js`: `/promemoria` (solo membri, `membro()`), tabella `prom` nel primo D1 (righe `piano` = {tz, forn[{id,nome,g,at,lim,s}], subs, agg} e `fatto` = {fid: giorno}); `promTick` col cron `*/5 * * * *` (in `scheduled`, `event.cron===PROM_CRON`; la pulizia notturna resta sugli altri cron); fuso con `Intl` (`promOra`); iscrizioni 404/410 tolte dal piano.
  - `worker/wrangler.toml`: crons `["17 3 * * *", "*/5 * * * *"]`.
  - `index.html`: `promPlan`, `promSrv` (impronta `sha` in `jona_prom`, rimanda se cambia o ogni 6 h, ripiego dopo errore ogni 15 min), `PUSH.ld`, `notify(...,np)` = solo campanella senza push quando il server è attivo.
  - `tools/test-v34.mjs` (23 verdi, Worker con `node:sqlite` + app con emulatore), `tools/README.md`, `CLAUDE.md` aggiornati.
- Ramo riallineato con main dopo ogni merge (nota: all'avvio la copia locale era in «detached HEAD»; risolto con checkout del ramo + `merge --ff-only`, senza force).

## Dati / risposte di Mario
- **Mauro Loi è il collega con l'iPhone**: in chat scriveva «Mi fa mandare solo messaggi». Era ancora sulla v32. Mario deve fargli chiudere/riaprire l'app (v33) e riferire cosa succede toccando il microfono (niente / permesso / messaggio con testo esatto). Vocale iPhone **in sospeso** finché Mauro non risponde.
- Mauro Loi mostra «F&B manager, Altro»: è un dato, non codice (campo Mansione = «F&B manager», Reparto = «Altro»). Spiegato a Mario come correggerlo: Staff → Mauro Loi → Reparto **F&B Manager**, svuotare Mansione, Salva.
- «Lo staff può vedere chi c'è in turno ma non…»: messaggio di Mario troncato, **chiedere come finiva**.
- Link dell'app con `kur0chanx`: spiegato che serve un dominio proprio (~10 €/anno) o Cloudflare Pages (`*.pages.dev`), con reinstallazione dell'app per tutti; il «malus di qualche ora senza notifiche» riguarda invece il cambio del sottodominio Worker `mario-miscera`. Mario non ha ancora scelto.
- Prova della v34 data a Mario (passi numerati: fornitore con giorno di oggi e ora promemoria tra 10 minuti, app chiusa, notifica entro 5 minuti). Esito non ancora ricevuto; la v35 cambierà comunque i destinatari.

## NON fatto (da prima)
- Cambio sottodominio workers.dev: bloccato dal controllo di sicurezza della sessione; resta `mario-miscera`. Se Mario lo cambia: `WK_SUB` (index.html), `PUSH_URL` (sw.js), workflow, test Firebase/Gemini/v34, `CLAUDE.md`, `CACHE`.
- Maurizio Lai (registrazione/ruolo): lo fa Mario.

## Prossimi passi dopo la v35
1. Risposta di Mauro sul vocale iPhone.
2. Prove dal vero di Mario: vocale Android→iPhone, gesto indietro Android, pallino, invito con codice, In turno oggi, consumi, promemoria dal server.
3. Decisioni per Mario: sottodominio/dominio, netWatch, fine della frase su «In turno oggi», `/invia` e inviti senza limiti.

## Rischi aperti
- `/invia` del Worker non controlla chi chiama; tutti i telefoni approvati leggono tutti i messaggi e allegati.
- `/invito/<codice>` senza limite di tentativi.
- `/promemoria`: qualsiasi telefono approvato può sovrascrivere il piano (oggi lo manda solo `deadlineTick`, che gira solo per i `gm`).
- `test-firebase-flow` fallisce 23:30–24:00.
- netWatch: con molte scritture di fila passa al long polling per sempre e ricarica una volta.
