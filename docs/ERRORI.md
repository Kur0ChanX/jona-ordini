# Diario degli errori (lezioni)

Si legge a ogni avvio. Una lezione per riga, numeri E invariati. Storia completa (date, cosa è successo, cause) in `docs/ERRORI-STORIA.md`, da leggere solo se serve. Le lezioni che servono solo per SCRIVERE codice o prove stanno in `.claude/rules/struttura.md` e `.claude/rules/prove.md` (regole a richiesta). Errore nuovo = una riga qui (o nella regola a richiesta della sua zona) + la riga completa in ERRORI-STORIA.md, poi commit.

## Avvio e rami Git
- **E1** Se la sessione parte su «HEAD staccato»: `git checkout <ramo>` + `git merge --ff-only origin/<ramo>` prima di lavorare (lo segnala `avvio-check.py`).
- **E5** Se `--ff-only` fallisce per ramo locale vecchio: `git branch -m <ramo> vecchio-locale-…`, poi `git checkout -b <ramo> --track origin/<ramo>`; mai `reset --hard`.
- **E13** Ramo locale stantio con storia diversa («unrelated histories»): lo ripara `avvio-check.py` rinominandolo `vecchio-<ramo>-<data>`; non cancellare niente.
- **E7** Gli appunti (`DA-FARE.md`, consegne) si cambiano in un solo ramo; unire `main` subito dopo ogni squash.
- **E44** Dopo `git merge` controllare SEMPRE l'esito prima di altri comandi (mai `git commit -a` nella stessa riga); in conflitto sugli appunti tenere la versione del ramo con `git checkout <commit> -- file`.
- **E39** Mentre `prove` gira sulla PR non fare push (annulla e rifà ripartire le prove): commit in locale, push dopo lo squash.
- **E11** Push rifiutato con «Internal Server Error»: non forzare, far controllare a Mario githubstatus.com («Git Operations»), riprovare quando è verde.
- **E9** Se i comandi non partono all'avvio (controllo permessi guasto): leggere le consegne, riprovare più tardi, non insistere.

## Handoff e sessioni
- **E12** Se l'handoff dà «lineage depth 8, limit 8»: consegne pushate, Mario apre a mano una sessione nuova da claude.ai/code e incolla il prompt di 3 righe.
- **E15** L'handoff apre la sessione nuova sempre con `source_url` + `source_revision`; per unire una PR basta che Mario scriva «unisci la PR N».
- **E23** Un tema diverso dal programma ha la sua catena di sessioni (es. «Servizio account», ramo `claude/servizio-sessione-<NN>`) con le consegne nel suo file.
- **E25** Un ambiente per progetto con nome chiaro (Jona = rete Full, RVC = Trusted); all'handoff passare `environment_id` (`docs/CAMBIO-ACCOUNT.md`).
- **E31** Non aggiungere altri repo (`add_repo`) a una sessione Jona: gli hook non si caricano più; i file di RVC si chiedono con `send_message`. Se serve, commit e push a mano dopo ogni passo e `get_session` (oltre 140k handoff).
- **E4** Si lavora solo in Claude Code, mai nella chat di claude.ai; ogni file ricevuto si salva subito nel progetto e si committa.
- **E45** Un agente appena creato in `.claude/agents/` si carica solo dalla sessione dopo: nella stessa usare `general-purpose` con «Prima leggi .claude/agents/<nome>.md».

## Scorta automatica (`scorta.py`)
- **E28** `scorta.py` salta come «ultimo messaggio di Mario» i testi di sistema (`<task-notification`, `<system-reminder`, `<wake `, `[SYSTEM NOTIFICATION`).
- **E32** `togli_segreti()` in `scorta.py` toglie i link segreti (repo pubblico); controllare la scorta con `git show <commit>:docs/ULTIMO-MESSAGGIO.md`, non `git log -p`.
- **E34** Anche `<cross-session-message` va saltato (`AVVISI_DI_SISTEMA`, prova 3c-bis in `tools/test-scorta.py`).
- **E40** Anche `<agent-message` va saltato (prova 3c-ter).
- **E42** Anche l'avviso «This session's worker process was restarted…» va saltato (prova 3c-quater).
- **E43** Anche il prompt di avvio dell'handoff (`git fetch origin claude/`) va saltato (prova 3c-quinquies).

## Comunicazione con Mario e domande
- **E2** Una domanda per volta, con le scelte pronte da toccare.
- **E3** Per scelte e confronti mandare un'immagine (prima/dopo).
- **E29** Domande a tocco sempre con il doppio tocco («Confermi?») nella stessa chiamata.
- **E30** Se la risposta scritta a mano contiene una domanda o «roba così» non è una scelta: rispondere e rifare la domanda a tocco.
- **E37** Ogni domanda a Mario SEMPRE con lo strumento delle domande + doppio tocco, mai solo nel testo.
- **E38** (aperto, causa non chiara: tocco fantasma o risposta automatica) Prima di lavori grossi dopo una risposta a tocco ripetere la scelta in chiaro; se Mario dice di non aver toccato, fermare subito le sessioni aperte (interrupt).
- **E6** Regole di Firebase: nelle istruzioni dire «menù a sinistra → icona **Firestore** → scheda **Regole**» (il link diretto porta alla home).
- **E51** Nelle guide per iPhone chiedere prima «la apri dall'icona o da Safari?» (le notifiche esistono solo nell'app dalla Home).
- **E21** Prima di dare colpa all'aggiornamento controllare la vista della barra Test: le Novità dipendono dal ruolo.

## Leggere i file
- **E53** File con righe lunghissime (tabelle, index.html): `grep -n -o '.\{0,80\}parola.\{0,80\}'`, mai `grep` semplice (una riga sola = migliaia di token).

## Prove e GitHub
- **E10** `test-firebase-flow` può fallire tra le 23:30 e mezzanotte: non è un guasto, rilanciarla dopo.
- **E14** Aggiungendo un indirizzo al Worker aggiornare tutti i Worker finti (`grep -l jona-notifiche tools/*.mjs`) e dopo una versione che tocca il Worker lanciare il giro `tutto` su GitHub.
- **E26** Prova rossa legata all'ora: rilanciare in locale; se fallisce sempre cercare un'ora fissa nei dati di prova (togliere l'ora limite agli altri fornitori di prova).
- **E33** Controlli: check `prove` senza badare alle maiuscole, indirizzo `https://jona-ristorante-by-ynoy-corp.pages.dev/` senza index.html; prima di un'attesa lunga provare il comando una volta.
- **E49** «App chiusa con la fotocamera aperta» = pagina nuova (`nuova()`), non reload; prima di dire «bloccato» guardare il passo del lavoro (`list_workflow_jobs`).

## Immagini, animazioni e disegni
- **E16** Difetto segnalato in un'immagine: segnare le zone sullo screenshot di Mario e fargliele scegliere prima di correggere; poi prima/dopo sullo stesso punto.
- **E17** Dopo ogni correzione di un'immagine animata: foglio con 9-12 fotogrammi sulla zona segnalata e sui bordi vicini, guardato sul video generato.
- **E19** Per richieste di gusto: prima 1 immagine con 2-3 bozze ferme e conferma di Mario, poi si costruisce solo quella; «scrivere» = tratti in ordine come una mano.

## App e codice
