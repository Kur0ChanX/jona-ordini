# Passaggio di consegne (2026-10-13, fine sessione #127)

Sessione attuale: #128

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR). Nessuna PR aperta.
- **Online: v108** (PR #117 = v107 + v108, squash `697d0fc`, 13/10 20:18). Worker pubblicato (workflow verde). APP_VER=108 controllato sul sito.
- Prove della PR #117 verdi (PC, Android, tablet, iPhone, iPad, Mac).
- Giro `tutto` extra fermato su richiesta di Mario (nuova regola sotto). Il Worker della v108 lo controlla il giro del **lunedì 19/10 alle 3:17**.
- **Limite settimanale in avviso** (`seven_day` allowed_warning, si azzera lun 19/10 20:00 ora italiana): commit e push dopo ogni passo.

## Fatto in #127 (13/10, ~19:53-20:30 ora italiana)
- Scorta unita (solo `docs/ULTIMO-MESSAGGIO.md`), motore Opus ok.
- PR #117: titolo aggiornato, prove verdi, squash, `main` unito nel ramo (conflitto solo in `docs/DA-FARE.md`, tenuta la versione del ramo, E44), push.
- `docs/DA-FARE.md`: D52 aggiunta, D51 e D52 «online 13/10 20:18». Manca solo la prova di Mario.
- **Regole da RVC #115** (confermate da Mario a tocco, due volte per E38):
  - Handoff SOLO a 200k token (niente 20 messaggi): `.claude/hooks/handoff-check.py` senza `MAX_PROMPTS`, CLAUDE.md §3, prova nuova `python3 -I tools/test-handoff-check.py` (5 PASS).
  - CLAUDE.md §5: risposte essenziali, niente cronaca dei passi.
- **Regola nuova di Mario** («Fai troppe prove su github fai solo quelle essenziali», scelta «Solo PR + lunedì», confermata; **solo Jona**, non a RVC/SPA): su GitHub solo `veloce` sulla PR + `tutto` del lunedì; niente giri extra nemmeno dopo il Worker. Scritta in CLAUDE.md (Prove) ed E14.
- **Regole da RVC #117** (send_message dalla sessione RVC `session_01U9gzdWMjVUyxWHdGT2k1ug`): punti 1-4 applicati in CLAUDE.md (domanda riproposta subito in 3 righe; foto ≤ ~1100 px, max 4 per messaggio, script RVC `tools/taglia-foto.py`; token: uscite lunghe in file; prove guardate una volta a giro finito, più modifiche in un push). Punto 5 (🔒 titoli col pallino 🟢 attiva / 🔴 chiusa) confermato da Mario a tocco: CLAUDE.md §3 punto 5.
- Lezione nuova **E54**: mai `list_workflow_runs` (stampa il messaggio intero dello squash, migliaia di token); stato con `get_check_runs` (id del giro nel suo `html_url`).
- E38 di nuovo: Mario ha scritto «hai tolto la domanda» dopo una risposta a tocco arrivata da sola. Rifatta la domanda: stessa risposta. Tenere il ripasso in chiaro.

## ✅ PROSSIMI PASSI (#128, continuare da sola)
1. Niente lavoro aperto. Aspettare la prova di Mario dei vini: Cantina Vini → Carta → scrivi un nome → **Cerca «…» nel mondo con l'IA**; e **Rileggila tu più tardi** quando l'IA dà errore.
2. Proporre UNA idea nuova (regola 7) solo se Mario chiede cosa fare. Seguito possibile di D52: strada Geniale (Catalogo Jona + codice a barre) solo se Mario la chiede.
3. Lunedì 19/10: controllare il giro `tutto` delle 3:17 (`get_check_runs` non serve: guardare la routine o il workflow una volta sola). Rosso = priorità.
4. Limite settimanale in avviso: commit e push dopo ogni passo; se finisce, cambio account (`docs/CAMBIO-ACCOUNT.md`).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #127 `session_01ESm6VyarK1aRqd5R44MzBo` (chiusa), #126 `session_01P4WCPhYrQdjVkexH74k27m`.
- RVC attiva: #117 `session_01U9gzdWMjVUyxWHdGT2k1ug` (ricontrollare con `list_sessions` limit 4). SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Prove in locale: server `python3 -m http.server 8765` in background.
- Impegno: `high` (`.claude/settings.json` `"effortLevel": "high"`; `get_session` non mostra `effort_level`).

## Consumo #127
cache_read 6.860.636 · cache_write 100.503 · output 14.874 · cost_usd 2,48. Contesto alla chiusura ~200k.

## Ultimo messaggio di Mario, parola per parola
(#127): «Fai troppe prove su github fai solo quelle essenziali». Poi a tocco: «Solo PR + lunedì» + «Sì, confermo»; «No, solo Jona» + «Sì, confermo»; titoli «Sì, col pallino» + «Sì, confermo». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
