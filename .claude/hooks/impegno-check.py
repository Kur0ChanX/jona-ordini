#!/usr/bin/env python3
"""Impegno vero del turno (C225; Mario #245: «quando fai il passaggio me lo ritrovo su medio… va a lavorare male»).

PostToolUse: Claude Code passa agli hook l'impegno APPLICATO al turno (`effort.level` nell'entrata, oppure la variabile
CLAUDE_EFFORT), dopo le scelte del selettore dell'app. Se è diverso da `effortLevel` di `.claude/settings.json`,
lo dice a Claude UNA volta per sessione e per valore, così Mario lo sa nel messaggio finale. Uguale o assente: silenzio.
Il selettore dell'app può mostrare «Medio» anche quando il turno gira su xhigh: conta solo questo valore.
Qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-impegno-check.py
"""
import json
import os
import re
import sys
import tempfile

NOMI = {'low': 'Basso', 'medium': 'Medio', 'high': 'Alto', 'xhigh': 'Extra', 'max': 'Max'}


def atteso(progetto):
    try:
        with open(os.path.join(progetto, '.claude', 'settings.json'), encoding='utf-8') as f:
            return json.load(f).get('effortLevel')
    except Exception:
        return None


def applicato(dati):
    e = dati.get('effort')
    if isinstance(e, dict):
        e = e.get('level')
    return e if isinstance(e, str) and e else os.environ.get('CLAUDE_EFFORT') or None


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or os.getcwd()
    voluto, vero = atteso(progetto), applicato(dati)
    if not voluto or not vero or vero == voluto:
        return 0
    cartella = os.environ.get('IMPEGNO_STATO') or tempfile.gettempdir()  # cartella finta solo nella prova
    stato = os.path.join(cartella, f'impegno-{re.sub(r"[^A-Za-z0-9_-]", "", dati.get("session_id") or "x")}.txt')
    try:
        with open(stato, encoding='utf-8') as f:
            if f.read().strip() == vero:
                return 0
    except OSError:
        pass
    try:
        with open(stato, 'w', encoding='utf-8') as f:
            f.write(vero)
    except OSError:
        pass
    testo = (f'IMPEGNO (C225): questo turno gira su «{vero}» ({NOMI.get(vero, vero)}), non su «{voluto}» '
             f'({NOMI.get(voluto, voluto)}) come in .claude/settings.json. Nel messaggio finale a Mario una riga: '
             f'«⚠️ Impegno su {NOMI.get(vero, vero)}: nel selettore dell\'app scegli **{NOMI.get(voluto, voluto)}**».')
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': testo}}))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
