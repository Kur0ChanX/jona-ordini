#!/usr/bin/env python3
# Controllo e riparazione all'avvio della sessione (vedi docs/ERRORI.md, E2 ed E8).
# Riaggancia da solo il ramo di lavoro all'ultima versione su GitHub, solo con operazioni sicure:
#   - HEAD staccato → passa al ramo;
#   - ramo locale indietro → git merge --ff-only;
#   - ramo locale vecchio con storia diversa → lo RINOMINA in backup (non cancella niente)
#     e ricrea il ramo da origin.
# Non tocca niente se ci sono modifiche non salvate o se il commit attuale non è su GitHub.
import json, os, subprocess, sys, time

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or None


def run(*args, timeout=20):
    try:
        r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=CWD)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args):
    rc, out = run(*args)
    return out if rc == 0 else ""


def ok(*args):
    return run(*args)[0] == 0


def ramo_di_lavoro():
    attuale = git("symbolic-ref", "-q", "--short", "HEAD")
    if attuale:
        return attuale, False
    rami = [r.removeprefix("origin/") for r in git("branch", "-a", "--format=%(refname:short)", "--contains", "HEAD").splitlines()
            if r and not r.startswith("(") and r not in ("origin", "origin/HEAD")]
    rami.sort(key=lambda r: r in ("main", "master"))  # il ramo di lavoro prima di main
    return (rami[0] if rami else ""), True


def ripara():
    ramo, staccato = ramo_di_lavoro()
    if not ramo:
        return "ATTENZIONE: HEAD staccato e ramo di lavoro non trovato. Avvisa Mario, non lavorare."
    remoto = f"origin/{ramo}"
    if not ok("fetch", "-q", "origin", ramo):
        return f"ATTENZIONE: git fetch origin {ramo} fallito. Riprova a mano prima di lavorare."
    if not ok("rev-parse", "--verify", "-q", remoto):
        return f"Ramo {ramo} non ancora su GitHub: nessuna riparazione necessaria."
    if git("status", "--porcelain", "--untracked-files=no"):
        return f"ATTENZIONE: modifiche non salvate, riparazione automatica saltata. Controlla {ramo} a mano."
    if staccato and not ok("merge-base", "--is-ancestor", "HEAD", remoto):
        return f"ATTENZIONE: HEAD staccato con commit non presenti su {remoto}. Avvisa Mario, non lavorare."

    fatto = []
    if ok("rev-parse", "--verify", "-q", f"refs/heads/{ramo}"):
        locale_indietro = ok("merge-base", "--is-ancestor", ramo, remoto)
        locale_avanti = ok("merge-base", "--is-ancestor", remoto, ramo)
        if not locale_indietro and not locale_avanti:
            backup = f"vecchio-{ramo}-{time.strftime('%Y%m%d-%H%M%S')}"
            if not ok("branch", "-m", ramo, backup):
                return f"ATTENZIONE: non riesco a rinominare il ramo locale stantio {ramo}. Avvisa Mario."
            fatto.append(f"ramo locale stantio rinominato in {backup} (niente cancellato)")
    if not ok("rev-parse", "--verify", "-q", f"refs/heads/{ramo}"):
        if not ok("checkout", "-q", "-b", ramo, "--track", remoto):
            return f"ATTENZIONE: git checkout -b {ramo} fallito. Avvisa Mario."
        fatto.append(f"ramo {ramo} creato da {remoto}")
    else:
        if git("symbolic-ref", "-q", "--short", "HEAD") != ramo:
            if not ok("checkout", "-q", ramo):
                return f"ATTENZIONE: git checkout {ramo} fallito. Avvisa Mario."
            fatto.append(f"passato al ramo {ramo}")
        if ok("merge-base", "--is-ancestor", ramo, remoto) and git("rev-parse", ramo) != git("rev-parse", remoto):
            if not ok("merge", "-q", "--ff-only", remoto):
                return f"ATTENZIONE: git merge --ff-only {remoto} fallito. Avvisa Mario."
            fatto.append(f"aggiornato a {remoto}")
        ok("branch", "-q", "--set-upstream-to", remoto, ramo)

    stato = "allineato a GitHub" if git("rev-parse", "HEAD") == git("rev-parse", remoto) else f"avanti rispetto a {remoto} (commit da inviare)"
    dettagli = ("; ".join(fatto) + ". ") if fatto else ""
    return f"Avvio: ramo {ramo} {stato}. {dettagli}Fetch e merge già fatti dall'hook: non rifarli."


avvisi = ["Leggi docs/ERRORI.md (diario degli errori) prima di lavorare.", ripara()]
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                         "additionalContext": " ".join(avvisi)}}))
sys.exit(0)
