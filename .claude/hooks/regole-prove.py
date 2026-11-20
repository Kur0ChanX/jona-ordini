#!/usr/bin/env python3
"""Lezioni delle prove prima del primo giro (#261; Mario «si»: diario snello, lezioni di prove e codice nelle regole a richiesta).

PreToolUse (Bash): `.claude/rules/prove.md` si carica da solo solo quando Claude apre un file delle prove con Read, Edit
o Write. Le lezioni per LANCIARE e leggere le prove sono lì, quindi al primo comando che lancia prove nella sessione,
se nella conversazione non c'è ancora una lettura di quel file (o di un file delle prove), il comando si ferma UNA volta
(decisione «deny» con il motivo, come la guardia): Claude legge `prove.md` e rilancia. Dopo il primo stop, mai più nella stessa sessione.
E485 (ripete E62, E477, E253): anche Edit e Write. Con le prove in corso (lucchetto `/tmp/rvc-prove.lock` preso) si
fermano i cambi a `firestore.rules` (Bash che scrive, Edit, Write) e `git merge/pull/checkout/stash`: il simulatore
ricarica le regole a metà e il giro si rompe («Unable to parse JSON»).
Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-regole-prove.py
"""
import json
import os
import re
import sys
import tempfile

try:
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None

PROVA = re.compile(r'\bnpx\s+(vitest|playwright\s+test)\b|\bnpm\s+(run\s+)?(test|prove[\w:-]*)\b|\bemulators:exec\b')
# Percorsi che caricano (o sono) la regola delle prove: gli stessi `paths:` di `.claude/rules/prove.md`.
CARICA = re.compile(r'(^|/)(tests/|playwright\.config\.js$|vitest(\.regole)?\.config\.js$|\.github/workflows/|\.claude/rules/prove\.md$)')
# E485: comandi che cambiano le regole o i file sotto le prove.
SCRIVE_REGOLE = re.compile(r'firestore\.rules')
SCRITTURA = re.compile(r"sed\s+-i|open\([^)]*['\"][wa]['\"]|>\s*\S*firestore\.rules|\b(cp|mv|tee|patch)\b|\.write\(|write_text|\bgit\s+apply\b")
GIT_CAMBIA = re.compile(r'\bgit\s+(merge|pull|checkout|stash|switch|rebase|cherry-pick)\b')
FERMO = ('E485: le prove stanno girando (lucchetto /tmp/rvc-prove.lock preso). Cambiare `firestore.rules` o fare '
         'merge/checkout adesso rompe il giro (il simulatore ricarica le regole a metà, E477). Aspetta la fine delle '
         'prove, poi rifai lo stesso comando.')


def prove_in_corso():
    """Vero se un altro processo tiene il lucchetto delle prove."""
    if fcntl is None:
        return False
    percorso = os.environ.get('REGOLE_PROVE_LUCCHETTO') or '/tmp/rvc-prove.lock'
    if not os.path.exists(percorso):
        return False
    try:
        with open(percorso, 'r') as f:
            try:
                fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                return True
            fcntl.flock(f, fcntl.LOCK_UN)
    except OSError:
        return False
    return False


def tocca_le_prove(dati):
    """Vero se lo strumento cambia le regole (o fa merge/checkout)."""
    nome = dati.get('tool_name') or 'Bash'
    ingresso = dati.get('tool_input') or {}
    if nome in ('Edit', 'Write', 'MultiEdit'):
        return bool(SCRIVE_REGOLE.search(str(ingresso.get('file_path') or '')))
    comando = str(ingresso.get('command') or '')
    return bool(GIT_CAMBIA.search(comando) or (SCRIVE_REGOLE.search(comando) and SCRITTURA.search(comando)))


MOTIVO = ('Prima di lanciare le prove leggi `.claude/rules/prove.md` (lezioni per lanciarle e leggerle: flock, CI=true '
          'e guscio E103, uscite in un file, build mai durante un giro…), poi rilancia lo stesso comando. '
          'Succede una volta sola per sessione.')


def gia_letta(percorso):
    """Vero se la conversazione ha già aperto la regola o un file delle prove con Read, Edit o Write."""
    try:
        with open(percorso, encoding='utf-8', errors='ignore') as f:
            for riga in f:
                if '"tool_use"' not in riga:
                    continue
                for blocco in (json.loads(riga).get('message') or {}).get('content') or []:
                    if (isinstance(blocco, dict) and blocco.get('type') == 'tool_use'
                            and blocco.get('name') in ('Read', 'Edit', 'Write')
                            and CARICA.search(str((blocco.get('input') or {}).get('file_path') or ''))):
                        return True
    except Exception:
        return False
    return False


def main():
    try:
        dati = json.load(sys.stdin)
        comando = (dati.get('tool_input') or {}).get('command') or ''
    except Exception:
        return 0
    try:
        if tocca_le_prove(dati) and prove_in_corso():
            print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                     'permissionDecisionReason': FERMO}}))
            return 0
    except Exception:
        pass
    if not PROVA.search(comando):
        return 0
    # Kit 21.1: un progetto senza `.claude/rules/prove.md` (senza il modulo «app con prove») non ha niente da leggere.
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    if not os.path.isfile(os.path.join(progetto, '.claude', 'rules', 'prove.md')):
        return 0
    sessione = re.sub(r'[^\w-]', '', str(dati.get('session_id') or 'senza'))[:80]
    cartella = os.environ.get('REGOLE_PROVE_STATO') or tempfile.gettempdir()
    segno = os.path.join(cartella, f'regole-prove-{sessione}')
    if os.path.exists(segno):
        return 0
    try:
        with open(segno, 'w') as f:
            f.write('1')
    except OSError:
        return 0
    if gia_letta(dati.get('transcript_path') or ''):
        return 0
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                             'permissionDecisionReason': 'Regole delle prove: ' + MOTIVO}}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
