---
name: minuti-github
description: Conta i minuti di GitHub Actions usati nel mese e ferma i giri su GitHub oltre 2000. Usala all'avvio (solo se dopo l'ultimo conteggio nelle consegne è partita una PR) e prima di ogni push che fa partire le prove su GitHub.
---

# Minuti GitHub

Repo privato: 2000 minuti gratis al mese, solo di RVC (ogni progetto ha i suoi: Mario #118), azzerati il 1° del mese. Le prove girano sui computer di GitHub e non consumano token. GitHub non dà il contatore: li conto io.

## Come contarli
1. `python3 -I .claude/conta-minuti.py` (legge da solo con `gh api`, ~40 s). Conta come GitHub: per lavoro, arrotondato al minuto, saltati a 0, coda esclusa (verificato sui minuti veri).
2. Scrivo il numero nelle consegne con la data (serve a sapere se ricontare all'avvio).

## Perché non finiscono più (E113, storia in `docs/ERRORI-STORIA.md`)
- Contano QUANTE volte girano le prove, non quanto durano.
- (1) `prove.yml` senza `synchronize`: il push su una PR pronta non fa partire niente; (2) una PR per versione, aperta in bozza; (3) giro completo in locale prima di segnarla pronta; (4) un giro su GitHub, unione solo se verde sull'ultimo commit. Stima: ~200–300 min al mese.

## Oltre 2000 minuti (unica regola sui minuti)
- Nessun giro su GitHub fino al 1° del mese; un giro partito (anche quello automatico del lunedì) lo annullo appena lo vedo. Le prove girano tutte nel contenitore e la pubblicazione segue `REGOLE.md` («Rami e PR»: giro completo verde in locale).
- Ogni mio messaggio si apre con «🚨🚨 MINUTI GITHUB: <N> SU 2000 USATI 🚨🚨 · mancano <G> giorni all'azzeramento», finché il mese non si azzera.
- Sotto 2000: nessuna domanda e nessun avviso, la regola normale sopra.
