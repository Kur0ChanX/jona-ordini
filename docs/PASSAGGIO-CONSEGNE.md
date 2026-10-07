# Passaggio di consegne (2026-10-07)

Sessione attuale: #18

## Ultimo messaggio di Mario (#17)
«sì 3»: gli piace il confronto v38/v39 del logo e vuole la v39 pubblicata **subito** (senza prove). PR #48 aperta: https://github.com/Kur0ChanX/jona-ordini/pull/48 — da far unire a Mario (squash), poi controllare online.

Poi, dopo l'apertura della #18: «perché io ogni volta ti sembra normale devo andare nel sito cliccare il tasto verde per una versione aggiornata non me lo avevi mai fatto fare». Risposta data in #17: il merge è bloccato a Claude; proposte 3 strade (1 consigliata: workflow GitHub che unisce da solo le PR del ramo di Claude; 2 pubblicare direttamente dal ramo; 3 lasciare così). **Da fare in #18: aspettare la scelta di Mario e realizzarla.**
Ultimo messaggio di Mario: «scusa prima come facevi prima dei controlli in automatico?». Verificato: fino alla PR #45 le PR le univa Claude da solo con `merge_pull_request` (GitHub MCP, account di Mario; es. #40 unita 19 s dopo l'apertura). Poi in CLAUDE.md è finito «merge bloccato a Claude». Proposto a Mario: tornare a far unire le PR a Claude (scelta 0, la più semplice). Se Mario dice sì: aggiornare la riga in CLAUDE.md («Il merge delle PR lo fa lui») e provare `merge_pull_request` sulla PR #48 (squash); se il permesso è negato, dirlo a Mario e passare all'unione automatica (1).

## Fatto in sessione #17
- **Rientro di Mario (C1)**: sul nuovo indirizzo il telefono era vuoto. Soluzione: chiave del ristorante letta dalla console Firebase (`chiave/ristorante`, campo `v`), incollata in «Collega questo telefono» (`fbJoinKey` accetta anche la chiave lunga), poi `membri/<uid>.ok` messo a `true` dalla console. Funziona: Mario è dentro. In `membri` resta in attesa `ISLyK5…` (req nome «Mari…», cognome «S…», nuovo:false): non è Mario, non approvato (M17).
- **v38 online** (PR #47 unita, controllato `APP_VER=38`, `CACHE` v42): logo YNOY senza `filter:blur` e con 8 px trasparenti attorno a `media/ynoy.png` (496×190): la riga bianca sul bordo basso su Android è sparita (confermato da Mario). Logo 155 px, entra 0,5 s prima (`byIn` .6 s, `ynoyIn` 1 s, `ynoyShine` 2,4 s), `S.splash` 4,4 s, `.intro` tolta a 4,7 s. Anche il workflow Worker con i tentativi è su `main`.
- **v39 nella PR #48**: `.wall-by i` 172 px, `gap` 2 px, padding sopra 0; schermata d'apertura con classe `splash` e `.splash .wall-by{margin-bottom:24px}` (≈40 px più in alto). In «Accedi» resta in fondo (a 390×844 la pagina è piena: più in alto scorrerebbe). `APP_VER` 39, `CACHE` v43, Novità v39. `test-logo` e `test-news` riuscite.
- Giro completo `tools/prova-tutto.sh` partito sulla v38: risultati in `/tmp/jona-prove` persi con questo container (prime 4 riuscite).

## Prossimi passi (#18)
1. Quando Mario dice «Merged» della PR #48: controllare online (`APP_VER=39`, `CACHE` v43), riallineare il ramo (`git fetch origin main && git merge origin/main`, push normale).
2. Rilanciare `bash tools/prova-tutto.sh` in background (con v39) e dire a Mario solo il risultato; ciò che fallisce si corregge con priorità.
3. M14: guidare Mario a mandare gli inviti allo staff (Staff → Invita) e a togliere la vecchia icona (GitHub Pages). Poi M15.
4. Idea non fatta: logo YNOY anche in «Collega questo telefono» (`screenJoin`, ~riga 1647) — non bloccante.
5. Ancora senza risposta: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository? Quali?

## Rischi aperti
- Righe bianche: viste solo su telefoni veri, qui non si riproducono; se tornano, guardare `ynoyShine` (sfondo animato sotto la maschera).
- Notifiche da riattivare su ogni telefono (VAPID nuova).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Il resto: `docs/DA-FARE.md`.
