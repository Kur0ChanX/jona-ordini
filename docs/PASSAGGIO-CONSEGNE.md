# Passaggio di consegne (2026-10-13, fine sessione #128)

Sessione attuale: #129

Versione lunga delle consegne vecchie (#85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR). Nessuna PR aperta.
- **Online: v108** (app invariata in #128). Ultimo squash su `main`: PR #119 `b515562` (13/10 21:39).
- Sul ramo ma NON ancora su `main` (arrivano con la prossima PR, solo regole/documenti): regole V3 (CLAUDE.md, `tools/README.md`, hook di soglia), file `docs/regole-rvc/Regole_New_Claude_V3.txt`, consegne ~1.000 parole, `docs/STORIA-REGOLE.md`, `docs/DA-FARE.md` D53.
- Limite: a fine #128 `get_session` mostrava `five_hour` allowed (prima `seven_day` in avviso, si azzera lun 19/10 20:00): continuare con commit e push dopo ogni passo.

## Fatto in #128 (13/10, ~20:28-21:45 ora italiana)
- Mario: «leggilo tutto e applica» (file RVC `docs/kit-progetto/FIX-TUTTI-I-PROGETTI.md`). Repo RVC privato e E31 (niente `add_repo`): testo chiesto alla sessione RVC #118 con `send_message`, arrivato completo.
- **PR #118** (squash `82cbcc8`, 21:06): `tools/taglia-foto.py` (provato: pezzi 1079/1080/841 px su foto finta 3000 px), passo «Solo documenti?» (C87) primo in `.github/workflows/prove.yml` con `permissions: contents: read, actions: read` e `if: steps.doc.outputs.salta != 'true'` sugli altri passi (registri: `always() && …`), regole foto/token/controlli in CLAUDE.md, titoli 🟢/🔴 nel testo di `.claude/hooks/handoff-check.py`.
- **PR #119** (squash `b515562`, 21:39): regola minuti da RVC #118. Domanda a tocco, Mario: «Solo la bozza» + conferma. `prove.yml`: `pull_request.types: [opened, synchronize, reopened, ready_for_review]` e job `if: github.event_name != 'pull_request' || github.event.pull_request.draft == false`. CLAUDE.md «Pubblicazione»: PR aperta in BOZZA → `update_pull_request draft:false` quando pronta → un giro. Provato dal vero: in bozza «prove» = skipped, da pronta = verde. SCARTATO (scelta di Mario): giro completo locale prima di ogni push e unione solo su suo ok (Jona è pubblico, minuti gratis; le versioni vanno online da sole).
- **V3** (file caricato da Mario, salvato in `docs/regole-rvc/Regole_New_Claude_V3.txt`): fatto solo ciò che mancava. Testi «a ogni PR» → «a ogni PR pronta (non in bozza)» in CLAUDE.md e `tools/README.md`.
- **Consegne più corte**: prima risposta di Mario «attendi per ora»; dopo il V3 a tocco «Sì, ~1.000 e max 1.750» + «Sì, confermo la scelta». Regola 🔒 §3 cambiata col consenso (CLAUDE.md §3 punto 1 + testo dell'hook). Storia in `docs/STORIA-REGOLE.md` (2 righe nuove).
- Preferenze claude.ai di questo account: manca la frase «La PR resta in bozza (draft) mentre lavori…» → hanno ancora la versione vecchia (detto a Mario).
- Scorta unita due volte (solo `docs/ULTIMO-MESSAGGIO.md`); conflitti in `docs/ULTIMO-MESSAGGIO.md` e `docs/DA-FARE.md` risolti tenendo la versione del ramo (E44).
- Push tenuti fermi mentre le prove giravano (E39), nonostante l'avviso dello stop-hook: spiegato a Mario.

## ✅ PROSSIMI PASSI (#129, continuare da sola)
1. Niente lavoro aperto. Aspettare la prova di Mario dei vini: Cantina Vini → Carta → scrivi un nome → **Cerca «…» nel mondo con l'IA**; e **Rileggila tu più tardi** quando l'IA dà errore.
2. Prossima PR: aprirla in BOZZA (regola nuova); porterà su `main` anche le regole V3 del ramo.
3. Proporre UNA idea nuova (regola 7) solo se Mario chiede cosa fare. Seguito possibile di D52: strada Geniale (Catalogo Jona + codice a barre) solo se Mario la chiede.
4. Lunedì 19/10: controllare una volta il giro `tutto` delle 3:17 (il passo «Solo documenti?» non tocca `schedule`). Rosso = priorità.

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Sessioni Jona: #128 `session_016n58ZsVbDPafmfh4Rpp1QH` (chiusa), #127 `session_01ESm6VyarK1aRqd5R44MzBo`.
- RVC attiva: #118 `session_01GB5eMCr6YKKHPgyPkZ34yu` (in #128 già c'era RVC #119 che ha scritto il V3: ricontrollare con `list_sessions` limit 4). SPA: #14 `session_016iyo14hpB7Qq4UWfhfCqgV`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- Prove in locale: server `python3 -m http.server 8765` in background.
- Impegno: `high` (`.claude/settings.json` `"effortLevel": "high"`; `get_session` non mostra `effort_level`).

## Consumo #128
cache_read 6.140.790 · cache_write 97.540 · output 11.399 · cost_usd 2,24. Contesto alla chiusura ~218k.

## Ultimo messaggio di Mario, parola per parola
(#128): file allegato «Regole_New_Claude_V3.txt» (senza testo). Poi a tocco: «Sì, ~1.000 e max 1.750» + «Sì, confermo la scelta». Prima: «leggilo tutto e applica» (link al FIX di RVC); «attendi per ora»; «Solo la bozza (Consigliato)» + «Sì, confermo la scelta». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
