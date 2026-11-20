---
name: minuti-github
description: Minuti del mese (GitHub, Blacksmith) e dove far girare le prove (`scegli-giro.py`). Usala all'avvio se dall'ultimo conteggio è partita una PR, prima di segnare pronta una PR e prima di un push che fa partire le prove fuori.
---

# Minuti e smistatore dei giri

Quattro posti per le prove, ognuno con la sua bravura e i suoi limiti. GitHub non dà il contatore: li conto io. Si azzerano il 1° del mese.

| Posto | Minuti | Giro completo | Bravo per | Limiti |
|---|---|---|---|---|
| **PC di casa** (solo se è acceso ai giri: lo legge `scegli-giro.py`) | nessun minuto | — | **primo posto per versioni e urgenze** (C482) | spento, in pausa o occupato a lungo: si ripiega con `--senza-casa` (skill `pr` «Ordine dei posti») |
| **Blacksmith** (`blacksmith-2vcpu-ubuntu-2404`, acceso dal 24/10) | 3000 al mese, gratis | ~17 min | **giro completo delle versioni e urgenze** quando il PC di casa non lo prende (Mario #296 «1», E162): stesse prove di GitHub in metà tempo | niente segreti (i workflow coi segreti restano su GitHub); 4 vCPU = minuti doppi |
| **GitHub** (`ubuntu-latest`) | 2000 al mese (repo privato, solo di questo progetto) | ~87 min (10/11, C471) | **secondo parere del lunedì** (macchina più lenta = escono le prove instabili rare, più l'iPhone); versioni solo se Blacksmith è fermo o finito; sempre pubblicazione, anteprima, letture coi segreti | i minuti delle pubblicazioni vanno tenuti da parte (riserva) |
| **Contenitore di Claude** | illimitati, zero token mentre gira | ~35 min | prove della parte cambiata, prove rosse da rifare (`--repeat-each`), giro di riserva se fuori non c'è più niente | non è una macchina indipendente; occupa la sessione |

## Come scelgo (ogni volta)
1. `python3 -I tools/scegli-giro.py <caso>` (`lavoro` · `versione` · `urgenza` · `rosso` · `lunedi`): conta i minuti (~40 s) e scrive «DOVE» e il perché. Regole dentro: prove della parte cambiata e prove rosse sempre qui; versione e urgenza sul PC di casa se è acceso ai giri, sennò su Blacksmith (~17 min), poi GitHub oltre la riserva, poi il contenitore; il lunedì su GitHub (secondo parere, `prove.yml` lo manda lì da solo), sennò Blacksmith se avanza, sennò si salta. Niente doppio giro completo nel contenitore prima della PR (Mario #296): stesse prove, ~35 min persi (E162).
2. PC di casa scelto → etichetta `giro-casa` sulla PR PRIMA di segnarla pronta, poi i passi della skill `pr` («Ordine dei posti»). GitHub scelto → etichetta `giro-github` sulla PR PRIMA di segnarla pronta. Contenitore scelto → giro completo verde qui, poi etichetta `giro-locale` (il giro fuori si salta), pronta e unione. Senza etichetta: Blacksmith (variabile `PROVE_RUNNER`).
3. Il numero dei minuti nelle consegne con la data (serve a sapere se ricontare all'avvio).

## Perché non finiscono più (E113, storia in `docs/ERRORI-STORIA.md`)
- Regole dei giri (contano quante volte girano, uno per versione, niente `synchronize`, unione solo col verde sull'ultimo commit): skill `pr` «Minuti» e «Dalla bozza all'unione».
- Un giro fuori rosso: prima la prova rossa nel contenitore, mai rilanciare alla cieca (E22).

## Oltre 2000 minuti di GitHub
- Oltre 2000 nessuna prova sui computer di GitHub fino al 1° (un giro partito lì lo annullo appena lo vedo); Blacksmith e contenitore vanno avanti (E160). Tetto «Budgets and alerts» di Actions: 0 $ (Mario #295: «poi non più a pagamento tanto c'è black in supporto»; il passo è di Mario, M18; finché la pagina dice 11 $, oltre 2000 GitHub paga ~0,006 $ al minuto fino a 11 $, foto `archivio/sessione-295/`). Al tetto si fermano anche pubblicazione e anteprima: la riserva per pubblicazioni e anteprime non si tocca mai.
- Avviso dei minuti oltre 2000: **una riga sola, una volta al giorno** (prima risposta della giornata), e di nuovo solo se scelgo un giro che costa soldi. Mai in testa a ogni messaggio (Mario #296: «questo è spam», E163).
- Sotto 2000: nessuna domanda e nessun avviso.

## Lezioni dal diario
- **E516** «Minuti di GitHub finiti» detto a Mario con una 🛑 (Giri 96): `conta-minuti.py` contava anche i giri del PC di casa (`self-hosted`); veri ~1155 su 2000. Prima di «è finito» una prova dal vero (un lavoro piccolo che parte); macchina nuova = rifaccio la verifica dei conti.
- **E168** (Mario 31/10 23:50) L'Atlante si aggiorna da solo ogni 3 ore di giorno, a ogni versione su `main` e a mano: niente più giri a ogni consegna (457 partenze in 2,5 giorni); a mano solo se Mario lo chiede.
- **E215** Un conto che legge un elenco dal server si confronta col `total_count` (le ricerche di GitHub si fermano a 1000 giri: 853 minuti segnati, 3830 veri).
- **E218** Un lavoro fermo per un tetto di GitHub passa su Blacksmith da solo, in una riga, senza chiedere (C290, E162; 29/10 «non dovresti neanche chiederlo»).
- **E396 (C476 P13, kit 38.28)** Giro chiesto con un push in coda da oltre 5 minuti senza lavori, o mai nato: lancio a mano (`actions_run_trigger` › `run_workflow`), UNA volta; mai «si sblocca da solo». Quale e come lo dice `python3 -I tools/giri-fermi.py` (sola lettura; l'hook `giri-fermi.py` lo chiede da solo a fine turno, solo dopo un push su un file d'innesco). Fermo anche il lancio a mano: non si rilancia ancora, si dice a Mario coi fatti. Lavoro che aspetta da oltre 3 minuti una macchina di casa (kit 38.29): lo stesso strumento dice come passarlo al server. La causa solo se sta scritta nella pagina dei guasti di GitHub (E398).
- **E334** · **E337** · **E340** · **E361** · **E364** · **E368** · **E371** C476: file ricevuto ~1600 px; `cmd | grep -q` con `pipefail` mente; «scritto» = prova che sa diventare rossa; prezzo coi requisiti; file dei controlli nello `sparse-checkout`; Docker: `reset-failed` prima di ogni `restart`; PS: `"$($x):"`.
