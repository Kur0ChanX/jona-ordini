#!/usr/bin/env python3
"""Pacchetto del kit allineato prima del push (kit 38.22, E358: Principale 573 il 10/11 ha mandato `tools/scegli-giro.py`
cambiato senza rigenerare il pacchetto; `tools/test-pacchetto-nuovo.py` è rimasta rossa ~20 minuti sul ramo comune).

PreToolUse (Bash): prima di un `git push` (anche «commit && push» nello stesso comando), solo nel progetto che FA il kit
(c'è `tools/fai-pacchetto.py`), se i MIEI file cambiati (rispetto al punto comune con `origin/<ramo>`: commit non ancora
mandati, file non salvati e file nuovi) stanno in `.claude/`, `tools/` o `docs/kit-progetto/`: lancia
`python3 -I tools/fai-pacchetto.py --controlla` (~0,5 s; controlla anche il kit) e ferma il push («deny» col motivo) se non
è allineato. Chi non tocca quei file non viene fermato (un pacchetto indietro per colpa d'altri non blocca il suo lavoro).
Negli altri progetti (niente `fai-pacchetto.py`) e a qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-kit-push.py
"""
import json
import os
import re
import subprocess
import sys

PUSH = re.compile(r'(^|[;&|(]\s*)git\s+push\b')  # come numeri-doppi.py: solo il comando vero, non la parola in un testo
ZONE = ('.claude/', 'tools/', 'docs/kit-progetto/')
SCRIPT = os.path.join('tools', 'fai-pacchetto.py')


def git(cartella, *a):
    r = subprocess.run(['git', *a], cwd=cartella, capture_output=True, text=True, timeout=5)
    return r.stdout.strip() if r.returncode == 0 else ''


def miei_file_del_kit(cartella):
    ramo = git(cartella, 'rev-parse', '--abbrev-ref', 'HEAD')
    base = git(cartella, 'merge-base', f'origin/{ramo}', 'HEAD') if ramo and ramo != 'HEAD' else ''
    if not base:
        return []
    cambiati = git(cartella, 'diff', '--name-only', base).splitlines()
    cambiati += git(cartella, 'ls-files', '--others', '--exclude-standard').splitlines()
    return sorted({f for f in cambiati if f.startswith(ZONE)})


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:  # noqa: BLE001
        return 0
    cmd = (dati.get('tool_input') or {}).get('command') or ''
    if not PUSH.search(cmd):
        return 0
    cartella = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    if not os.path.isfile(os.path.join(cartella, SCRIPT)):
        return 0
    file = miei_file_del_kit(cartella)
    if not file:
        return 0
    r = subprocess.run([sys.executable, '-I', SCRIPT, '--controlla'], cwd=cartella, capture_output=True, text=True,
                       timeout=8)
    if r.returncode == 0:
        return 0
    motivo = (r.stderr.strip() or r.stdout.strip()).splitlines()
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
        'permissionDecisionReason': (
            f"Pacchetto del kit indietro (E358), hai cambiato {', '.join(file[:4])}{' …' if len(file) > 4 else ''}: "
            f"{(motivo[0] if motivo else 'controllo fallito')[:300]}. Rigenera (python3 -I tools/fai-kit.py e "
            "python3 -I tools/fai-pacchetto.py), lancia le prove (anche tools/test-pacchetto-nuovo.py), poi commit e push.")}},
        ensure_ascii=False))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:  # noqa: BLE001
        sys.exit(0)
