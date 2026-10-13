# Passaggio di consegne (2026-10-13, sessione #123 in corso)

Sessione attuale: #123

Versione lunga di prima (fatti delle sessioni #85-#122): `git show eb9eccd:docs/PASSAGGIO-CONSEGNE.md`.

## Stato
- Ramo unico **`claude/jona-ramo-definitivo`** (anche per le PR). Online: **v103** (Ricette in `moduli/ricette.js`). Nessuna PR aperta.
- Lista delle cose da fare: `docs/DA-FARE.md` (D30 in dettaglio lì, D48 rimandata, domanda sui vini venduti in D34).
- Note pratiche per prove e foto: `tools/README.md` (in fondo). Struttura del codice: `.claude/rules/struttura.md`.

## Fatto in #123 (13/10, dalle ~16:30 ora italiana)
- Avvio: scorta unita (niente di nuovo). Motore Opus ok. Il `git push -u` va ancora con i `deny` di `.claude/settings.json`.
- Secondo giro di regole da RVC #107 (arrivato tramite #122): **A** regole a richiesta: `.claude/rules/struttura.md` (Struttura + Chiavi tolte da CLAUDE.md, + lezioni E20 E24 E27 E35 E46 E47) e `.claude/rules/prove.md` (E8 E18 E22 E36 E41 E48 E50 E52); regola in CLAUDE.md sezione 8; «A OGNI versione» ora scrive la riga in `struttura.md`. **B** consegne snelle (regola in CLAUDE.md sezione 8; queste consegne rifatte corte). **D** lezione E53 (grep -o su righe lunghe). **C** guardia: Mario «Sì, mettila» + «Sì, confermo la scelta» (a tocco) → `.claude/hooks/guardia.py` (copia di RVC + prove Jona node/bash in PROVE), hook PreToolUse in `.claude/settings.json`, `tools/test-guardia.py` 41/41 verdi (non in `prova-ci.sh`: gira solo in locale), riga GUARDIA in CLAUDE.md sezione 4. Attiva da subito: blocca anche un commit nello stesso comando di un testo che cita le prove → comandi separati.

## ✅ PROSSIMI PASSI
1. ~~Guardia~~ FATTA in #123.
2. Domanda aperta: «Maurizio è riuscito ad attivare le notifiche sull'iPhone? Se no, a che passo si è fermato?» (v100, E51).
3. Restano da provare da Mario: foto del vino su iPhone (v96), D44, D43. D50: Agenda NO (intrecciata con la home).

## Riferimenti
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`. Profondità della catena: #123 = 6 su 8 (E12).
- Sessioni Jona: #123 `session_01PB9hmHD5EoYuranoSQU6N9` (attiva), #122 `session_012bxjmAc6J4rsMJxnn7fxaf`, #121 `session_019Pcx9R4JATNsWQQowh8UR6` (chiuse; elenco completo nella versione lunga).
- RVC attiva: #107 `session_01DuagRMT8Hn5tWvB896Bv8e`. SPA attiva: #14 `session_016iyo14hpB7Qq4UWfhfCqgV` (ricontrollare con `list_sessions` limit 4).
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.
- E38 (aperto): risposte a tocco arrivate senza tocco di Mario: prima di lavori grossi ripetere la scelta in chiaro.
- Rischi: ponte con l'hotel vero solo quando RVC avrà D5 e `PONTE_KEY`; URL del Drive mai in file pubblici.

## Ultimo messaggio di Mario, parola per parola
(#122, ~16:30) risposta a tocco «Sì, bloccali (Consigliato)» + «Sì, confermo il blocco». Prima (#119, ~11:56): «Ok però prima risolviami le notifiche nell'iphone di Maurizio che non trova l'app per abilitarle risolvi subito e pubblica poi il resto fatti aiutare per risolvere le notifiche». Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
