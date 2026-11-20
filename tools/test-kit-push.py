#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/kit-push.py (E358): push fermato se tocco file del kit e il pacchetto è indietro.
# Repo finti in una cartella temporanea, con un `tools/fai-pacchetto.py` finto (rosso se c'è il file ROTTO):
# nessun file vero del progetto. Uso: python3 -I tools/test-kit-push.py
import json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "kit-push.py")
ok_n = 0
FINTO = ("import os, sys\nif os.path.exists('ROTTO'):\n    sys.exit('Pacchetto indietro, rigeneralo: PARTE-FINTA.md')\n"
         "print('OK: pacchetto allineato al kit')\n")


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def git(cwd, *a):
    return subprocess.run(["git", *a], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


def scrivi(base, rel, testo):
    os.makedirs(os.path.dirname(os.path.join(base, rel)) or base, exist_ok=True)
    with open(os.path.join(base, rel), "w", encoding="utf-8") as f:
        f.write(testo)


def push(repo, cmd="git push -u origin claude/prova"):
    dati = json.dumps({"tool_name": "Bash", "tool_input": {"command": cmd}, "cwd": repo})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=repo))
    try:
        uscita = json.loads(r.stdout)["hookSpecificOutput"]
    except Exception:  # noqa: BLE001
        uscita = {}
    return r.returncode, uscita


with tempfile.TemporaryDirectory() as tmp:
    git(tmp, "init", "-q", "--bare", "origin.git")
    repo = os.path.join(tmp, "repo")
    os.makedirs(repo)
    git(repo, "init", "-q", "-b", "claude/prova")
    git(repo, "config", "user.email", "prova@example.com")
    git(repo, "config", "user.name", "prova")
    git(repo, "remote", "add", "origin", os.path.join(tmp, "origin.git"))
    scrivi(repo, "tools/fai-pacchetto.py", FINTO)
    scrivi(repo, "app/a.js", "a\n")
    scrivi(repo, ".gitignore", "ROTTO\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    git(repo, "push", "-q", "-u", "origin", "claude/prova")
    scrivi(repo, "ROTTO", "")

    # 1. Il caso vero E358: tools/ cambiato e committato, pacchetto indietro → push fermato col motivo
    scrivi(repo, "tools/scegli-giro.py", "REPO = 'nome vero'\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "scegli-giro")
    c, u = push(repo)
    motivo = u.get("permissionDecisionReason", "")
    controlla(c == 0 and u.get("permissionDecision") == "deny" and "E358" in motivo and "tools/scegli-giro.py" in motivo
              and "PARTE-FINTA.md" in motivo and "fai-pacchetto.py" in motivo, "E358: tools/ cambiato + pacchetto indietro → deny", motivo)
    # 2. «commit && push» con il file non ancora salvato: lo vede lo stesso
    git(repo, "push", "-q", "origin", "claude/prova")
    scrivi(repo, ".claude/hooks/nuovo.py", "x = 1\n")
    c, u = push(repo, 'git add -A && git commit -q -m "hook" && git push -q origin claude/prova')
    controlla(u.get("permissionDecision") == "deny" and ".claude/hooks/nuovo.py" in u.get("permissionDecisionReason", ""),
              "file nuovo non salvato in .claude/ con «commit && push» → deny", str(u))
    # 3. Pacchetto allineato → passa
    os.remove(os.path.join(repo, "ROTTO"))
    c, u = push(repo)
    controlla(c == 0 and u == {}, "pacchetto allineato → passa", str(u))
    # 4. Push che non tocca i file del kit: passa anche col pacchetto indietro (colpa d'altri)
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "hook")
    git(repo, "push", "-q", "origin", "claude/prova")
    scrivi(repo, "ROTTO", "")
    scrivi(repo, "app/a.js", "b\n")
    c, u = push(repo)
    controlla(c == 0 and u == {}, "solo app/ cambiato → passa anche col pacchetto indietro", str(u))
    # 5. Non è un push: la parola dentro un testo non conta
    scrivi(repo, "tools/altro.py", "y = 2\n")
    c, u = push(repo, 'git commit -m "prima del git push controlla"')
    controlla(c == 0 and u == {}, "«git push» dentro un messaggio di commit → silenzio", str(u))
    c, u = push(repo, "git status")
    controlla(c == 0 and u == {}, "comando senza push → silenzio", str(u))
    # 6. Progetto senza tools/fai-pacchetto.py (gli altri progetti del kit) → silenzio
    os.remove(os.path.join(repo, "tools", "fai-pacchetto.py"))
    c, u = push(repo)
    controlla(c == 0 and u == {}, "progetto che non fa il kit → silenzio", str(u))
    # 7. Ingresso illeggibile → silenzio
    r = subprocess.run([sys.executable, "-I", HOOK], input="non json", capture_output=True, text=True, timeout=30)
    controlla(r.returncode == 0 and r.stdout == "", "ingresso illeggibile → silenzio", r.stdout)

print(f"OK: {ok_n} controlli di kit-push.py")
