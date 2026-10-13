---
paths:
  - "tools/**"
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
