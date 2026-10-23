---
paths:
  - "tools/**"
  - ".github/workflows/**"
---
# Lezioni del diario per SCRIVERE le prove (regola a richiesta, da docs/ERRORI.md)
Per LANCIARE le prove valgono le lezioni rimaste in `docs/ERRORI.md` (sezione «Prove e GitHub»).
- **E8** Le prove cercano i testi solo nella parte giusta della pagina, non in tutto `main`.
- **E18** Le prove non dipendono dall'ora: date fisse o «oggi»; rilanciare le prove nuove anche con `TZ=Europe/Rome`.
- **E22** Le prove di import usano righe vere dalle foto di Mario (`tools/test-virgolette.mjs`), non solo righe pulite.
- **E41** Nelle prove con giorni o settimane usare `await oraFissa(ctx)` di `tools/ora-fissa.mjs` (pagina alle 12:00).
- **E48** Prove che intercettano richieste: `serviceWorkers:'block'` nel contesto; la diagnosi va dentro la riga FAIL.
- **E50** Le prove che misurano posizioni aspettano la fine delle animazioni (`waitForFunction`, `document.getAnimations()`), mai un tempo fisso.
- **E52** Per provare «senza rete» con il service worker: server proprio da spegnere (`server()`/`spegni()` in `tools/test-moduli.mjs`), non `setOffline`.
- **E36** Come E26: la prova conta solo le notifiche che interessano e chiama `deadlineTick()` apposta; riprodurre con orario spostato nello scratchpad.
- **E58** Aspettare lo STATO giusto (testo), non un pulsante che c'è in più stati: in `test-bolla` «Riprova adesso» c'è già in «la leggo tra poco» (giro del lunedì 19/10 rosso).

## Regole delle prove di Jona (dal vecchio CLAUDE.md, kit 27.3: qui vincono sul kit perché fanno parte delle PR, scelta di Mario #143)
- Prove: `tools/README.md` (server locale, Playwright con Chromium `/opt/pw-browsers/chromium`, emulatore Firebase con `localStorage.jona_fb_emu`).
  - Stabilità (l'app serve a un hotel): ogni bug corretto riceve una prova che l'avrebbe trovato. Una prova fallita non si salta né si spegne: si capisce la causa.
  - Sul computer di lavoro solo le prove legate alla modifica (la nuova + quelle della stessa schermata) e `tools/test-giro.mjs` se cambia l'aspetto. Niente prove rifatte due volte: il resto lo fa GitHub.
  - GitHub: `.github/workflows/prove.yml` gira `tools/prova-ci.sh veloce` a ogni PR pronta (non in bozza) verso `main` e `tutto` ogni lunedì alle 3:17. Si unisce una PR SOLO con il controllo «prove» verde; rosso → si capisce la causa e si corregge. Lunedì rosso = lavoro con priorità. Repo pubblico → minuti gratis e illimitati (nei repo privati come RVC prove su GitHub al minimo: Mario non vuole consumare i 2000 minuti mensili).
  - Su GitHub SOLO le prove essenziali (scelta di Mario #127): `veloce` sulla PR + `tutto` del lunedì. Niente giri completi extra (workflow_dispatch), nemmeno dopo una versione che tocca il Worker: li copre il lunedì. Più modifiche in un solo push quando la PR è pronta (ogni push su una PR pronta rifà le prove); niente push di codice mentre un giro corre. L'esito si guarda una volta sola, quando arriva l'evento (o dopo ≥15 min dal push), mai in ciclo; niente sveglie sotto i 50 minuti. Push di soli documenti ok: se il giro prima era verde, `prove.yml` non rifà le prove (C87 di RVC, primo passo «Solo documenti?»).
  - Giro completo sul computer di lavoro (`bash tools/prova-tutto.sh`, ~1 ora, in background): solo per cose urgenti o cambiamenti di sistema che toccano la stabilità; prima chiedo a Mario «Lo faccio partire ora o dopo?».
  - Tutti i dispositivi: ogni prova dell'aspetto e di ogni funzione nuova gira su PC (`Desktop Chrome`), Mac (`Desktop Safari`), tablet Android (`Galaxy Tab S4`), telefono Android (`Pixel 7`), iPhone (`iPhone 15`), iPad (`iPad (gen 7)`). Giro di ogni scheda: `tools/test-dispositivi.mjs` (`GIRO_DEV` in `test-giro`). WebKit c'è solo su GitHub: in locale le viste Apple dicono SALTATA, quindi la PR aspetta «prove» verde. A Mario dico su quali dispositivi è stata provata una versione. L'emulazione non trova i limiti di memoria veri di iPhone/iPad: codice prudente e ultima prova sul telefono di Mario.
  - Emergenza (app rotta in uso): correggo, solo prove legate al problema, pubblico subito; il giro completo parte subito dopo e ciò che trova si corregge con priorità.
- Aiutante «collaudo» (`.claude/agents/collaudo.md`): prove legate + `test-giro`, griglie dei disegni su copia piccola, attesa del controllo `prove` su GitHub; in background, risponde con un riassunto corto. Non tocca il codice, niente commit/push/merge.
