# Passaggio di consegne (2026-10-13, fine sessione #126)

Sessione attuale: #127

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR).
- **Online: v106.** Giro `tutto` su main dopo la v106 (run 38436308516) **VERDE** (lo ha detto la #125 con send_message).
- **PR #117 aperta** (titolo «v107: vini, «Rileggila tu più tardi»»). Al momento dell'handoff il controllo «prove» girava sul primo commit (v107). Il push dell'handoff ha aggiunto alla PR anche **v108** e gli appunti: quindi la PR #117 ora contiene **v107 + v108** e le prove ripartono (E39, costo accettato per chiudere l'handoff). Se il titolo della PR serve, aggiornarlo in «v107 + v108: vini, riprova da sola e Cerca nel mondo».
- Sessione #126 iscritta agli eventi della PR #117 (subscribe_pr_activity): la #127 deve iscriversi di nuovo.

## Fatto in #126 (13/10, ~19:15-19:55 ora italiana)
- Avvio: scorta unita (solo `docs/ULTIMO-MESSAGGIO.md`), motore Opus ok.
- Mario: non ha ancora provato il caricamento dei vini della v106 («Non ancora», confermato).
- **v107 «Rileggila tu più tardi»** (idea mia, Mario «Sì, fallo» confermato), D51:
  - `moduli/cantina.js`: dopo una lettura non riuscita `f.ko`, riquadro `vnRiH` con il pulsante; `vnRiAuto` → `f.au` {n,next,go}; `vnRiTick` ogni secondo; `vnRiProva` richiama `vnIaGo(files,true)` ogni `VN_RI_MS` (2 min) fino a `VN_RI_MAX` (5); letto → `navigator.vibrate`. «Riprova adesso» `vnRiOra`, «Smetti» `vnRiStop`. `vnIaGo` ora restituisce vero/falso; con `au` niente avviso a ogni giro.
  - index.html: azioni, CSS `.vn-ri`, APP_VER 107, NEWS. sw.js CACHE v111.
  - Prova: `test-cantina` +6. Foto `docs/img/v107/` mandate a Mario.
- **v108 «Cerca nel mondo»** (D52). Domanda di Mario (sotto, parola per parola). Proposte 3 strade con immagine `docs/img/d52/vini-cerca-tre-strade.png`: Ovvia catalogo comprato; **Furba «Cerca nel mondo» con ricerca Google dell'IA (scelta da Mario, confermata)**; Geniale Furba + «Catalogo Jona» che cresce + codice a barre (Open Food Facts).
  - Motivo: un catalogo gratis completo e aggiornato ogni mese non esiste. La ricerca Google dell'IA (grounding) è aggiornata ogni giorno, senza catalogo da mantenere. La Geniale si può aggiungere dopo sopra la Furba.
  - La ricerca dei vini «in casa» c'era già (Carta → campo di ricerca + «Solo in casa»).
  - `moduli/cantina.js`: pulsante `vnMondo` sotto la lista della Carta quando c'è un nome scritto (solo `vnCan`, `gemOn`); Flash poi Flash-Lite con `tools:[{google_search:{}}]` (niente Cloudflare, non cerca sul web); `vnMondoLeggi` (max 6 vini, annate 1900..anno+1); `S.vnM`; foglio `vnMondoH` con secondi, «Già in cantina» (`vnMondoDop`), chip delle annate; `vnMondoSel` → `vnForm` con nome/cantina/annata/den/tipo, poi `vnIaGo(null)`.
  - **Worker** `worker/src/index.js` `/gemini`: passa `tools` solo se è esattamente `[{"google_search":{}}]`. **Tocca il Worker → dopo l'unione lanciare il giro `tutto` (E14).** Nessun indirizzo nuovo: Worker finti invariati.
  - index.html: azioni `vnMondo`, `vnMondoSel`, CSS `.vn-mb`, `.vn-mo`; APP_VER 108, NEWS. sw.js CACHE v112.
  - Prove: `test-cantina` +7 (71 PASS in locale), `test-gemini-server` +2, `test-news` e `test-moduli` verdi in locale (WebKit solo su GitHub). Foto `docs/img/v108/` mandate a Mario.
  - Quota gratis della ricerca Google non chiara (fonti: 1.500 al giorno o 5.000 al mese): detto a Mario, per il ristorante basta.
- `.claude/rules/struttura.md`: righe v107 e v108 scritte. `docs/DA-FARE.md`: riga D51 (manca D52: aggiungerla).

## ✅ PROSSIMI PASSI (#127, continuare da sola)
1. `subscribe_pr_activity` sulla PR #117. Aspettare «prove» verde sull'ultimo commit (contiene v107+v108). Rosso → `get_job_logs`, capire, correggere.
2. Verde → squash merge della #117 → `git fetch origin main && git merge origin/main` sul ramo e push → controllo online (APP_VER=108 su https://jona-ristorante-by-ynoy-corp.pages.dev/) e Worker pubblicato (workflow `cloudflare-worker.yml` verde).
3. Lanciare il giro `tutto` su GitHub (workflow_dispatch di `prove.yml`, modo `tutto`): v108 tocca il Worker (E14). Dirlo a Mario in 1 riga.
4. Dire a Mario in poche righe che v107 e v108 sono online e come provarle: Cantina Vini → Carta → scrivi un nome → **Cerca «…» nel mondo con l'IA**; e, quando l'IA dà errore, **Rileggila tu più tardi**. Dispositivi provati: PC, Android, tablet in locale; iPhone, iPad, Mac su GitHub.
5. `docs/DA-FARE.md`: aggiungere D52 (Cerca nel mondo, v108) e aggiornare D51 (v107 online).
6. **Regole da RVC #115** (send_message, decise da Mario per tutti i progetti), da applicare dopo il pezzo in corso, commit e push:
   - (1) soglia dell'handoff SOLO 200k token: togliere la regola dei 20 messaggi in Jona (`.claude/hooks/handoff-check.py`, riga TRIGGER di CLAUDE.md §3, prova dell'hook se c'è). In RVC: commit d831867 (`handoff-check.py` senza MAX_PROMPTS, `tools/test-handoff-check.py`). Chiedere i dettagli alla sessione RVC attiva se servono (E31: niente add_repo).
   - (2) risposte essenziali: «solo le cose importanti e urgenti, niente cronaca dei passi, niente testi lunghissimi» (già nelle Preferenze v6 di Mario); adattare CLAUDE.md §5.
7. Dopo: UNA idea nuova (regola 7) solo se non ci sono cose aperte. Possibile seguito di D52: strada 3 Geniale (Catalogo Jona + codice a barre) solo se Mario la chiede.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #126 `session_01P4WCPhYrQdjVkexH74k27m` (chiusa), #125 `session_016t7JLtWgmdVp4LkBupairU`.
- RVC attiva: #115 `session_01ENmbu2Nx1ck14CBGU8FXqG` (ricontrollare con `list_sessions` limit 4). SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva. Promemoria `trig_01JGue5pHDfFk2zRBeQEMy2W` (controllo giro v106, 20:02) superato: il giro è già verde, se arriva ignorarlo.
- E38 (aperto): prima di lavori grossi ripetere la scelta in chiaro.
- Prove in locale: server `python3 -m http.server 8765` in background.
- Impegno: `high` (in `.claude/settings.json` come `"effortLevel": "high"`; `get_session` non mostra `effort_level`).

## Consumo #126
Vedi riga aggiunta sotto alla chiusura (se `set_session_title` restituisce l'uso). Contesto alla chiusura ~205k.

## Ultimo messaggio di Mario, parola per parola
(#126): «si può mettere un altra ricerca in vini ad esempio una vini in casa che ti cerca i tuoi e un altra che ti va a un catalogo super completo aggiornato mese per mese con tutti i nuovi vini annate ecc ci clicchi e interviene l'ia per trovare il vino cosí anche meglio se è fattibile e smart e teniamo anche le foto però». Poi a tocco: «2 Furba (Recommended)» + «Sì, confermo». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
