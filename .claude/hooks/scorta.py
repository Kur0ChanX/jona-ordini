#!/usr/bin/env python3
# Scorta automatica (D27, autorizzata da Mario il 10/10/2026): se i token finiscono di colpo, su GitHub c'è già tutto.
#   scorta.py msg  (UserPromptSubmit): salva l'ultimo messaggio di Mario in .git/scorta-msg.md (fuori dal progetto).
#   scorta.py stop (Stop): fotografa il lavoro (anche non salvato) con l'ultimo messaggio in docs/ULTIMO-MESSAGGIO.md
#                  e lo manda su GitHub nel ramo scorta/<ramo>, senza toccare il ramo di lavoro né l'indice vero.
# Ogni scorta contiene HEAD e la scorta prima: il push è sempre in avanti, mai forzato. Niente cambiato = niente push.
# Per riprendere: git fetch origin scorta/<ramo> && git merge origin/scorta/<ramo> (avvio-check.py lo segnala).
import datetime, json, os, subprocess, sys, re

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
FILE_MSG = "docs/ULTIMO-MESSAGGIO.md"
AVVISI_DI_SISTEMA = ("<task-notification", "<system-reminder", "<wake ", "[SYSTEM NOTIFICATION")


def run(*args, env=None, inp=None, timeout=30):
    try:
        r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=CWD,
                           env=env, input=inp)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args, **kw):
    rc, out = run(*args, **kw)
    return out if rc == 0 else ""


def ora_italiana():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Rome")).strftime("%d/%m/%Y %H:%M")
    except Exception:
        return datetime.datetime.utcnow().strftime("%d/%m/%Y %H:%M UTC")


def salva_msg(dati, gitdir):
    testo = str(dati.get("prompt") or "").strip()
    if not testo or testo.startswith(AVVISI_DI_SISTEMA):
        return  # avvisi automatici (GitHub, promemoria): non sono messaggi di Mario
    # l'indirizzo dello script di Google Drive vale come una chiave: il repo è pubblico, non si salva
    testo = re.sub(r"https://script\.google(?:usercontent)?\.com/\S+", "[indirizzo di Google Drive nascosto]", testo)
    with open(os.path.join(gitdir, "scorta-msg.md"), "w", encoding="utf-8") as f:
        f.write(f"# Ultimo messaggio di Mario ({ora_italiana()} ora italiana)\n\n{testo}\n")


def scorta(gitdir, push=True):
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    head = git("rev-parse", "-q", "--verify", "HEAD")
    if not ramo or not head or ramo.startswith("scorta/"):
        return
    rif = f"refs/scorta/{ramo}"  # ultima scorta fatta da questo container
    prima = git("rev-parse", "-q", "--verify", rif) or git("rev-parse", "-q", "--verify", f"refs/remotes/origin/scorta/{ramo}")

    env = dict(os.environ, GIT_INDEX_FILE=os.path.join(gitdir, "scorta-index"))
    if run("read-tree", head, env=env)[0] or run("add", "-A", env=env, timeout=60)[0]:
        return
    msg = os.path.join(gitdir, "scorta-msg.md")
    if os.path.exists(msg):
        blob = git("hash-object", "-w", msg)
        if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{FILE_MSG}", env=env)[0]:
            return
    albero = git("write-tree", env=env)
    if not albero:
        return
    if prima and git("rev-parse", f"{prima}^{{tree}}") == albero and run("merge-base", "--is-ancestor", head, prima)[0] == 0:
        return  # niente di nuovo dall'ultima scorta
    genitori = ["-p", head]
    if prima and run("merge-base", "--is-ancestor", prima, head)[0] != 0:
        genitori += ["-p", prima]
    nuovo = git("commit-tree", albero, *genitori, inp=f"Scorta automatica {ora_italiana()} (ramo {ramo})\n")
    if not nuovo:
        return
    run("update-ref", rif, nuovo)
    if push:  # in background: la risposta a Mario non aspetta la rete
        subprocess.Popen(["timeout", "60", "git", "push", "-q", "origin", f"{nuovo}:refs/heads/scorta/{ramo}"],
                         cwd=CWD, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         start_new_session=True)


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    gitdir = git("rev-parse", "--absolute-git-dir")
    if not gitdir:
        return
    if "msg" in sys.argv[1:]:
        salva_msg(dati, gitdir)
    elif "stop" in sys.argv[1:]:
        scorta(gitdir, push=os.environ.get("JONA_SCORTA_NOPUSH") != "1")


try:
    main()
except Exception:
    pass
sys.exit(0)
