#!/usr/bin/env python3
"""Giri fermi su GitHub (hook Stop; C476 P13c, E396): prima di chiudere il turno, il giro chiesto con un push è partito?

L'11/11/2026, durante un guasto di GitHub, i giri nati dai push sono rimasti «in coda» senza lavori per 45 minuti
mentre Claude aspettava. Qui: solo se da questo contenitore nell'ultima ora è partito un push su un file d'innesco di
un flusso (`on: push` con `paths`), chiede a `tools/giri-fermi.py` com'è andata. Senza push di quel tipo: zero
chiamate a GitHub. Tutto bene, strumento assente, non è un repo, secondo giro (`stop_hook_active`): silenzio, uscita 0.
Blocca la fine del turno UNA volta (uscita 2, testo su stderr) se:
- un giro è in coda senza lavori, o non è mai nato, da oltre 5 minuti → il rilancio a mano esatto;
- un giro appena chiesto non parte: riguarda per ~40 secondi (di solito parte in 10), poi chiede una sveglia, perché a
  turno chiuso nessuno guarderebbe più;
- GitHub non risponde → lo dice (mai «tutto bene» senza aver letto).
Ogni giro lo dice una volta sola per stato (memoria in `.git/giri-fermi-detti.txt`).
Prova: python3 -I tools/test-giri-fermi.py
"""
import datetime
import importlib.util
import json
import os
import pathlib
import sys
import time

PASSO = 8  # secondi fra due letture mentre un giro appena chiesto non è ancora partito


def strumento():
    file = pathlib.Path('tools') / 'giri-fermi.py'
    if not file.exists():
        return None
    spec = importlib.util.spec_from_file_location('giri_fermi', file)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def chiave(voce):
    return f"{voce['flusso']} {(voce['giro'] or {}).get('id') or voce['commit'][:12]} {voce['stato']}"


def nuove_soltanto(gf, chiavi):
    """Le chiavi mai dette finora (e le segna come dette)."""
    memoria = pathlib.Path(gf.comando('git', 'rev-parse', '--git-path', 'giri-fermi-detti.txt').strip())
    dette = memoria.read_text().splitlines() if memoria.exists() else []
    nuove = [c for c in chiavi if c not in dette]
    if nuove:
        memoria.write_text('\n'.join((dette + nuove)[-200:]) + '\n')
    return nuove


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:  # noqa: BLE001
        return 0
    if dati.get('stop_hook_active'):
        return 0
    os.chdir(os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or '.')
    gf = strumento()
    if gf is None:
        return 0
    adesso = datetime.datetime.now(gf.UTC)
    try:
        ramo, flussi, attesi = gf.locale(adesso)
    except SystemExit:
        return 0
    if not attesi:
        return 0
    attesa = int(os.environ.get('GIRI_FERMI_ATTESA', '40'))
    fine = time.monotonic() + attesa
    try:
        while True:
            voci = gf.in_rete(attesi, datetime.datetime.now(gf.UTC))
            if gf.esito_di(voci) != 10 or time.monotonic() + PASSO > fine:
                break
            time.sleep(PASSO)
    except SystemExit as errore:
        if not nuove_soltanto(gf, [f'{f} {c[:12]} MUTO' for f, (c, _) in attesi.items()]):
            return 0
        print(f"GIRI FERMI (hook, C476 P13): non ho potuto leggere i giri ({errore}). Hai fatto un push che doveva far "
              f"partire: {', '.join(sorted(attesi))}. Guardali con actions_list (`list_workflow_runs`) prima di "
              'chiudere: in coda da oltre 5 minuti senza lavori = lancio a mano (E396).', file=sys.stderr)
        return 2
    dette = nuove_soltanto(gf, [chiave(v) for v in voci])
    voci = [v for v in voci if chiave(v) in dette]
    if not voci:
        return 0
    peggio = gf.esito_di(voci)
    testo = gf.righe(voci, flussi, ramo, gf.leggi_guasti() if any(v['stato'] in gf.GUASTO for v in voci) else None)
    if peggio == 10:
        testo.append('Non chiudere il turno così: a turno chiuso nessuno riguarda. Riguarda tu fra poco '
                     '(`python3 -I tools/giri-fermi.py`) o metti una sveglia (`send_later`, 6 minuti) con quel comando.')
    print('GIRI FERMI (hook, C476 P13): ' + '\n'.join(testo), file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        sys.exit(main())
    except SystemExit as uscita:
        sys.exit(uscita.code if isinstance(uscita.code, int) else 0)
    except Exception:  # noqa: BLE001
        sys.exit(0)
