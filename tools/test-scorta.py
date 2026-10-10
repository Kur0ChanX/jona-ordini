#!/usr/bin/env python3
# Prova della scorta automatica (.claude/hooks/scorta.py e controllo in avvio-check.py), su repo finti in una cartella temporanea.
# Uso: python3 tools/test-scorta.py
import json, os, subprocess, sys, tempfile, time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOKS = os.path.join(QUI, "..", ".claude", "hooks")
ok_n = 0


def sh(*a, cwd, inp=None, env=None):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True, input=inp, env=env)
    return r.stdout.strip()


def git(cwd, *a):
    return sh("git", *a, cwd=cwd)


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1
    print("ok", nome)


def hook(repo, arg, dati=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo)
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                   text=True, env=env, timeout=90)


def remoto_scorta(repo):
    for _ in range(100):  # il push parte in background
        out = git(repo, "ls-remote", "origin", "refs/heads/scorta/claude/prova-1")
        locale = git(repo, "rev-parse", "-q", "--verify", "refs/scorta/claude/prova-1")
        if out and out.split()[0] == locale:
            return out.split()[0]
        time.sleep(0.1)
    return git(repo, "ls-remote", "origin", "refs/heads/scorta/claude/prova-1").split("\t")[0]


with tempfile.TemporaryDirectory() as tmp:
    nudo = os.path.join(tmp, "origin.git")
    repo = os.path.join(tmp, "lavoro")
    sh("git", "init", "-q", "--bare", nudo, cwd=tmp)
    sh("git", "clone", "-q", nudo, repo, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    git(repo, "checkout", "-q", "-b", "claude/prova-1")
    open(os.path.join(repo, "a.txt"), "w").write("uno\n")
    open(os.path.join(repo, ".gitignore"), "w").write("segreto.txt\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    git(repo, "push", "-q", "-u", "origin", "claude/prova-1")
    head0 = git(repo, "rev-parse", "HEAD")

    # 1. messaggio + lavoro non salvato
    hook(repo, "msg", {"prompt": "Ciao Jona, prova della scorta"})
    controlla(git(repo, "status", "--porcelain") == "", "il messaggio salvato non sporca git status")
    open(os.path.join(repo, "a.txt"), "w").write("due\n")
    open(os.path.join(repo, "nuovo.txt"), "w").write("nuovo\n")
    open(os.path.join(repo, "segreto.txt"), "w").write("chiave\n")
    hook(repo, "stop")
    s1 = remoto_scorta(repo)
    controlla(bool(s1), "scorta mandata su GitHub")
    controlla(git(repo, "rev-parse", "HEAD") == head0, "il ramo di lavoro non si muove")
    controlla(git(repo, "rev-parse", "origin/claude/prova-1") == head0, "il ramo su GitHub non si muove")
    controlla("M a.txt" in git(repo, "status", "--porcelain") and git(repo, "diff", "--cached", "--name-only") == "",
              "indice vero non toccato")
    controlla(git(repo, "show", f"{s1}:a.txt") == "due", "file modificato nella scorta")
    controlla(git(repo, "show", f"{s1}:nuovo.txt") == "nuovo", "file nuovo nella scorta")
    controlla("segreto.txt" not in git(repo, "ls-tree", "-r", "--name-only", s1).split(), "file in .gitignore escluso")
    controlla("prova della scorta" in git(repo, "show", f"{s1}:docs/ULTIMO-MESSAGGIO.md"), "ultimo messaggio nella scorta")

    # 2. niente cambiato = niente scorta nuova
    hook(repo, "stop")
    time.sleep(1)
    controlla(remoto_scorta(repo) == s1, "niente cambiato, niente push")

    # 3. commit nuovo: scorta in avanti (contiene la precedente)
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "secondo")
    hook(repo, "msg", {"prompt": "secondo messaggio"})
    hook(repo, "stop")
    s2 = remoto_scorta(repo)
    controlla(s2 != s1, "scorta nuova dopo il commit")
    controlla(subprocess.run(["git", "merge-base", "--is-ancestor", s1, s2], cwd=repo).returncode == 0,
              "push sempre in avanti (la scorta nuova contiene la vecchia)")
    controlla("secondo messaggio" in git(repo, "show", f"{s2}:docs/ULTIMO-MESSAGGIO.md"), "messaggio aggiornato")

    # 3b. un avviso automatico (GitHub, promemoria) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<task-notification>\n<task-type>queued-remote-notifications</task-type>\n</task-notification>"})
    open(os.path.join(repo, "a.txt"), "w").write("tre\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "avviso di sistema ignorato")
    hook(repo, "msg", {"prompt": "ecco https://script.google.com/macros/s/AKfycbSEGRETO123/exec fatto"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    u = git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md")
    controlla("SEGRETO" not in u and "nascosto" in u and "fatto" in u, "indirizzo dello script di Google Drive nascosto")

    # 4. sessione nuova da un altro clone: avvio-check segnala la scorta e il merge è in avanti
    altro = os.path.join(tmp, "altro")
    sh("git", "clone", "-q", "-b", "claude/prova-1", nudo, altro, cwd=tmp)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=altro)
    out = sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=altro, inp="{}", env=env)
    controlla("SCORTA: origin/scorta/claude/prova-1" in out, "avvio-check segnala la scorta")
    git(altro, "merge", "-q", "--ff-only", "origin/scorta/claude/prova-1")
    controlla(git(altro, "rev-parse", "HEAD") == s3, "la scorta si unisce in avanti")
    out = sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=altro, inp="{}", env=env)
    controlla("SCORTA" not in out, "dopo l'unione nessun avviso")

print(f"Scorta: {ok_n} controlli riusciti")
