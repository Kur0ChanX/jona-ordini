#!/usr/bin/env python3
"""Dopo Edit/Write di un file .js (anche .mjs, .cjs) del codice: `node --check` (solo sintassi, ~50 ms).

Zone del codice: `.claude/zone-codice.txt` (in RVC app/, worker/, tests/); senza il file, tutto il
progetto tranne docs/, archivio/, .claude/, node_modules/, dist/ (kit per gli altri progetti).
Errore di sintassi → uscita 2 con il messaggio su stderr: Claude lo vede subito e corregge
prima di costruire o lanciare le prove (C207, Mario #221). Ogni altro caso (anche node assente): silenzio, uscita 0.
Prova: python3 -I tools/test-controlla-js.py
"""
import json
import os
import subprocess
import sys

ESTENSIONI = ('.js', '.mjs', '.cjs')
FUORI = ('docs/', 'archivio/', '.claude/', 'node_modules/', 'dist/', '.git/')


def zone(progetto):
    try:
        with open(os.path.join(progetto, '.claude', 'zone-codice.txt'), encoding='utf-8') as f:
            righe = [r.strip() for r in f if r.strip() and not r.startswith('#')]
    except OSError:
        return None
    return tuple(righe) or None


def nel_codice(relativo, progetto):
    if '/node_modules/' in '/' + relativo or '/dist/' in '/' + relativo:
        return False
    scelte = zone(progetto)
    if scelte is None:
        return not relativo.startswith(FUORI)
    return any(relativo == z or (z.endswith('/') and relativo.startswith(z)) for z in scelte)


def da_controllare(percorso, progetto):
    if not percorso or not percorso.endswith(ESTENSIONI):
        return None
    pieno = os.path.realpath(percorso if os.path.isabs(percorso) else os.path.join(progetto, percorso))
    radice = os.path.realpath(progetto) + os.sep
    if not pieno.startswith(radice):
        return None
    if not nel_codice(pieno[len(radice):], progetto):
        return None
    return pieno if os.path.isfile(pieno) else None


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    entrata = dati.get('tool_input') or {}
    file_js = da_controllare(entrata.get('file_path') or entrata.get('notebook_path'), progetto)
    if not file_js:
        return 0
    try:
        esito = subprocess.run(['node', '--check', file_js], cwd=progetto, capture_output=True, text=True, timeout=20)
    except Exception:
        return 0
    if esito.returncode == 0:
        return 0
    righe = (esito.stderr or esito.stdout).strip().splitlines()[:8]
    print('node --check: errore di sintassi in ' + os.path.relpath(file_js, progetto) + '\n' + '\n'.join(righe), file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main())
