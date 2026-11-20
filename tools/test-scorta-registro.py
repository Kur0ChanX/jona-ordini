#!/usr/bin/env python3
# E479 (Risparmio 26, 14/11): la scorta scritta DOPO che il ramo ha ricevuto messaggi di un'altra chat non li toglie più.
# Prima il registro della scorta era solo quello del contenitore: unita all'avvio, git non chiamava il driver «registro»
# (cambiava solo la scorta) e il registro del ramo tornava indietro. Ora = registro di HEAD + quello del contenitore.
# A parte da tools/test-scorta.py, che è al tetto di una parte del pacchetto del kit.
# Uso: python3 -I tools/test-scorta-registro.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOKS = os.path.join(QUI, "..", ".claude", "hooks")
os.environ.pop("CLAUDE_CODE_REMOTE_SESSION_ID", None)  # scorte finte senza id di sessione (come test-scorta.py)
sys.path.insert(0, HOOKS)
import scorta  # noqa: E402


def sh(*a, cwd):
    return subprocess.run(list(a), cwd=cwd, capture_output=True, text=True).stdout.strip()


def git(cwd, *a):
    return sh("git", *a, cwd=cwd)


def hook(repo, arg, dati=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="1")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                   text=True, env=env, timeout=90)


with tempfile.TemporaryDirectory() as tmp:
    sh("git", "init", "-q", "--bare", os.path.join(tmp, "origin.git"), cwd=tmp)
    r = os.path.join(tmp, "r")
    sh("git", "clone", "-q", os.path.join(tmp, "origin.git"), r, cwd=tmp)
    for k, v in (("user.name", "P"), ("user.email", "p@example.com"), ("commit.gpgsign", "false")):
        git(r, "config", k, v)
    git(r, "checkout", "-q", "-b", "claude/prova-1")
    os.makedirs(os.path.join(r, "docs"))
    open(os.path.join(r, "a.txt"), "w").write("uno\n")
    git(r, "add", "-A"); git(r, "commit", "-q", "-m", "base"); git(r, "push", "-q", "-u", "origin", "claude/prova-1")
    hook(r, "msg", {"prompt": "mio messaggio"})
    altra = ("2026-01-01 10:00", "01FFFFFFFFFF", "messaggio dell'altra chat")
    open(os.path.join(r, "docs", "MESSAGGI-MARIO.md"), "w").write(scorta.scrivi_voci([altra]))  # arrivato nel ramo intanto
    git(r, "add", "-A"); git(r, "commit", "-q", "-m", "ramo unito")
    hook(r, "stop")
    reg = git(r, "show", "refs/scorta-principale/claude/prova-1:docs/MESSAGGI-MARIO.md")
    if not ("mio messaggio" in reg and "messaggio dell'altra chat" in reg and reg.count("\n## ") == 2):
        print("FALLITA: E479: il registro della scorta tiene anche le voci entrate nel ramo dopo il primo messaggio:", reg[-200:])
        sys.exit(1)
print("Scorta e registro: 1 controllo riuscito")
