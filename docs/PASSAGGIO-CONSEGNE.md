# Passaggio di consegne (2026-10-07)

Sessione attuale: #23

## Ultimi messaggi di Mario (#22)
- Su «Altre idee nuove (da valutare)»: «da valutare scelgo (R) e (U) ma definire di leggere tutto» → scelte R («Il mio giorno») e U (ricerca unica). **Regola: leggere sempre per intero quello che Mario scrive in «Altro» delle domande** (in #22 si era lamentato due volte: «ti ho scritto delle cose che non hai letto», «ho perso lo schema pensiero»).
- Poi ha approvato il piano dell'inverno.

## Fatto in #22
- **v40 pubblicata**: PR #49 (squash, merge fatto da Claude dopo il «sì» di Mario), online `APP_VER=40`. Mario: notifiche funzionanti sul suo telefono (C1, C2 chiusi).
- Ramo `hotfix-notifiche` riallineato a `main` (`f4ad39f`).
- **Giro completo sulla v40: 38 prove su 38 riuscite.**
- `CLAUDE.md` su `main` allineato (merge da Claude, regola QUANDO).
- Spiegato a Mario perché si pubblica meno spesso (app per hotel, regola STABILITÀ, giro di 1 ora): non vuole cambiare metodo.
- Risposto sull'offline (tabella in `docs/PIANO-INVERNO.md`).
- **Piano dell'inverno approvato**: `docs/PIANO-INVERNO.md`. App ancora in prova (Mario e pochi altri), apertura la prossima stagione → M14 non più 🔴.
- `docs/DA-FARE.md` aggiornato (C5, C6).

## Prossimi passi (#23)
1. **C5**: riportare `main` nel ramo `ccr-4a01d00e-6ay25e` (`git fetch origin main && git merge origin/main`): conflitti attesi su `APP_VER`/`NEWS`/`CACHE`; il lavoro inviti/entrata libera diventa **v41** (`APP_VER` 41, `CACHE` v45, NEWS v41). Poi scelta delle prove a Mario e pubblicazione v41 → M18 (regole Firebase) per Mario.
2. **C6**: piano dell'inverno, nell'ordine: passo 0 interruttori delle funzioni (`config/app.funz`, partono spente, conta d'uso Z) → agenda smart di Mauro (foto dell'agenda di carta → eventi, una riga scritta o detta, privato/condiviso, «Oggi in hotel», promemoria, V/W/X) con calendario consegne O → poi A, C, G, H, I, J, K, R, U. Una funzione per versione, piano operativo breve prima di ognuna (BRAINSTORMING → «Procediamo»).
3. Mario potrebbe fare prove in hotel (import Excel/XML/foto, bolla, modalità aereo): aspettare le sue foto.

## Rischi aperti
- Telefono in attesa `ISLyK5…` (M17).
- `test-firebase-flow` tra 23:30 e mezzanotte (noto).
- Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
