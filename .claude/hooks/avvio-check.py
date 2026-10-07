#!/usr/bin/env python3
# Controllo all'avvio della sessione (vedi docs/ERRORI.md, E2). Solo lettura: non cambia niente nel repository.
# Se la sessione parte su «HEAD staccato» avvisa Claude di riagganciare il ramo prima di lavorare,
# e ricorda sempre di leggere il diario degli errori.
import json, os, subprocess, sys


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=5,
                       cwd=os.environ.get("CLAUDE_PROJECT_DIR") or None)
    return r.stdout.strip() if r.returncode == 0 else ""


avvisi = ["Leggi docs/ERRORI.md (diario degli errori) prima di lavorare."]
if not git("symbolic-ref", "-q", "HEAD"):
    rami = [r.removeprefix("origin/") for r in git("branch", "-a", "--format=%(refname:short)", "--contains", "HEAD").splitlines()
            if r and not r.startswith("(") and r not in ("origin", "origin/HEAD")]
    rami.sort(key=lambda r: r in ("main", "master"))  # il ramo di lavoro prima di main
    ramo = rami[0] if rami else "<ramo>"
    avvisi.append(f"ATTENZIONE: HEAD staccato. Prima di qualsiasi lavoro: git checkout {ramo} "
                  f"&& git fetch origin {ramo} && git merge --ff-only origin/{ramo}.")

print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                         "additionalContext": " ".join(avvisi)}}))
sys.exit(0)
