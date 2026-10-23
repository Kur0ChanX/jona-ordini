#!/usr/bin/env python3
# Prova della scorta automatica (.claude/hooks/scorta.py e controllo in avvio-check.py), su repo finti in una cartella temporanea.
# C148: una scorta per chat (principale e parallela), ruolo dal prompt di avvio o dalla trascrizione, push non in avanti.
# C252: la scorta di un altro contenitore non si copre mai (E154).
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


def hook(repo, arg, dati=None, nopush=False):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="1" if nopush else "0")
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                   text=True, env=env, timeout=90)


def remoto_scorta(repo, ruolo="principale"):
    nome = f"scorta-{ruolo}/claude/prova-1"
    for _ in range(150):  # il push parte in background
        out = git(repo, "ls-remote", "origin", f"refs/heads/{nome}")
        locale = git(repo, "rev-parse", "-q", "--verify", f"refs/{nome}")
        if out and out.split()[0] == locale:
            return out.split()[0]
        time.sleep(0.1)
    return git(repo, "ls-remote", "origin", f"refs/heads/{nome}").split("\t")[0]


def hook_out(repo, arg, dati=None):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, JONA_SCORTA_NOPUSH="0")
    return subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), arg], cwd=repo, input=json.dumps(dati or {}),
                          text=True, env=env, timeout=90, capture_output=True).stdout


def aspetta_file(percorso):
    for _ in range(150):  # lo scrive il push in background
        if os.path.exists(percorso):
            return True
        time.sleep(0.1)
    return False


def clona(tmp, nome):
    cartella = os.path.join(tmp, nome)
    sh("git", "clone", "-q", "-b", "claude/prova-1", os.path.join(tmp, "origin.git"), cartella, cwd=tmp)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(cartella, "config", k, v)
    return cartella


def ruolo_file(repo):
    try:
        return open(os.path.join(git(repo, "rev-parse", "--absolute-git-dir"), "scorta-ruolo")).read().strip()
    except OSError:
        return ""


AVVIO_PAR = "[AVVIO] Sei la chat parallela P40 di RVC (ramo claude/prova-1): git fetch origin claude/prova-1\nLeggi CLAUDE.md"


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

    # 3c. il prompt di avvio della sessione nuova (segno «[AVVIO]») non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "[AVVIO] git fetch origin claude/prova-1 && git merge --ff-only origin/claude/prova-1"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "prompt di avvio ignorato")

    # 3c-bis. un messaggio di un'altra sessione (send_message, es. Jona) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<cross-session-message from-session=\"session_FINTA\">\nciao da Jona\n</cross-session-message>"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-bis\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "messaggio di un'altra sessione ignorato")

    # 3c-ter. il rapporto di un aiutante (strumento Agent, #73) non prende il posto del messaggio di Mario
    hook(repo, "msg", {"prompt": "<agent-message from=\"a0000\">\n[Subagent hand-back] C41 fatto\n</agent-message>"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-ter\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "rapporto di un aiutante ignorato")
    # 3c-quater (Jona, E42). l'avviso di riavvio della sessione non è un messaggio di Mario
    hook(repo, "msg", {"prompt": "This session's worker process was restarted. If your previous turn was already complete, take no action and wait for the next event."})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-quater\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "avviso di riavvio della sessione ignorato")
    # 3c-quinquies (Jona, E43). il prompt di avvio dell'handoff non è un messaggio di Mario
    hook(repo, "msg", {"prompt": "git fetch origin claude/jona-ramo-definitivo && git merge --ff-only origin/claude/jona-ramo-definitivo\nLeggi CLAUDE.md"})
    open(os.path.join(repo, "a.txt"), "w").write("quattro-quinquies\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    controlla("secondo messaggio" in git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md"), "prompt di avvio dell'handoff ignorato")

    # 3d. E29: un segreto incollato in chat non arriva su GitHub (resto del messaggio intatto)
    url = "https://script.google.com/macros/s/AKfycbFINTO0123456789abcdefghijklmnopqrstuvwxyz_-ABCDEF/exec"
    segreti = [url, "AIzaSyFINTA0123456789abcdefghijklmnopq", "ghp_FINTO0123456789abcdefghijklmnop",
               "sk-ant-api03-FINTA0123456789abcdef", "FINTO9x8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3", "valore-env-segreto-123"]
    testo = ("ecco il link " + url + " e la chiave " + " ".join(segreti[1:5]) + " e " + segreti[5] +
             " · normale https://claude.ai/code perché è così")
    env_prova = dict(os.environ, CLAUDE_PROJECT_DIR=repo, PROVA_DRIVE_URL=segreti[5])
    subprocess.run([sys.executable, os.path.join(HOOKS, "scorta.py"), "msg"], cwd=repo, input=json.dumps({"prompt": testo}),
                   text=True, env=env_prova, timeout=90)
    open(os.path.join(repo, "a.txt"), "w").write("cinque\n")
    hook(repo, "stop")
    s3 = remoto_scorta(repo)
    salvato = git(repo, "show", f"{s3}:docs/ULTIMO-MESSAGGIO.md")
    controlla(not any(s in salvato for s in segreti) and "AKfyc" not in salvato, "segreti tolti dalla scorta")
    controlla(salvato.count("[segreto tolto dalla scorta]") == 6, "ogni segreto segnato come tolto")
    controlla("ecco il link" in salvato and "https://claude.ai/code perché è così" in salvato, "il resto del messaggio resta")

    # 3e. Mario 17/10: «salva» scritto col limite finito → la scorta parte già col messaggio, senza aspettare la fine risposta
    open(os.path.join(repo, "a.txt"), "w").write("sei\n")
    hook(repo, "msg", {"prompt": "salva 99%"})
    s4 = remoto_scorta(repo)
    controlla(s4 != s3 and git(repo, "show", f"{s4}:a.txt") == "sei", "il messaggio fa subito la scorta del lavoro")
    controlla("salva 99%" in git(repo, "show", f"{s4}:docs/ULTIMO-MESSAGGIO.md"), "messaggio nella scorta subito")

    # 3f. scorta a metà risposta (dopo uno strumento), al massimo ogni 2 minuti
    gitdir = git(repo, "rev-parse", "--absolute-git-dir")
    segno = os.path.join(gitdir, "scorta-ora")
    if os.path.exists(segno):
        os.remove(segno)
    open(os.path.join(repo, "a.txt"), "w").write("sette\n")
    hook(repo, "tool")
    s5 = remoto_scorta(repo)
    controlla(s5 != s4 and git(repo, "show", f"{s5}:a.txt") == "sette", "scorta dopo uno strumento")
    open(os.path.join(repo, "a.txt"), "w").write("otto\n")
    hook(repo, "tool")
    time.sleep(1)
    controlla(remoto_scorta(repo) == s5, "seconda scorta entro 2 minuti saltata")
    os.utime(segno, (time.time() - 200, time.time() - 200))
    hook(repo, "tool")
    s3 = remoto_scorta(repo)
    controlla(s3 != s5 and git(repo, "show", f"{s3}:a.txt") == "otto", "dopo 2 minuti la scorta riparte")

    # 4. sessione nuova da un altro clone: avvio-check segnala la scorta e il merge è in avanti
    altro = os.path.join(tmp, "altro")
    sh("git", "clone", "-q", "-b", "claude/prova-1", nudo, altro, cwd=tmp)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=altro)
    avvio = lambda: sh(sys.executable, os.path.join(HOOKS, "avvio-check.py"), cwd=altro, inp="{}", env=env)
    out = avvio()
    controlla("SCORTA della chat principale: origin/scorta-principale/claude/prova-1" in out, "avvio-check segnala la scorta")
    git(altro, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    controlla(git(altro, "rev-parse", "HEAD") == s3, "la scorta si unisce in avanti")
    controlla("SCORTA" not in avvio(), "dopo l'unione nessun avviso")

    # 5. C148: la chat parallela ha la sua scorta (ruolo dal prompt di avvio) e il suo file del messaggio
    controlla(ruolo_file(repo) == "principale", "sessione aperta a mano (niente [AVVIO]) → principale")
    par = clona(tmp, "parallela")
    hook(par, "msg", {"prompt": AVVIO_PAR})
    controlla(ruolo_file(par) == "parallela", "prompt «Sei la chat parallela» → ruolo parallela")
    hook(par, "msg", {"prompt": "ciao dalla parallela"})
    open(os.path.join(par, "b.txt"), "w").write("parallela\n")
    hook(par, "stop")
    p1 = remoto_scorta(par, "parallela")
    controlla(bool(p1) and git(par, "show", f"{p1}:b.txt") == "parallela", "scorta della parallela nel suo ramo")
    controlla("ciao dalla parallela" in git(par, "show", f"{p1}:docs/ULTIMO-MESSAGGIO-PARALLELA.md"),
              "messaggio della parallela nel suo file")
    controlla(remoto_scorta(repo) == s3, "la scorta della principale non si muove")

    # 6. il ruolo: avvio della principale che nomina la parallela, riavvio (trascrizione), a mano
    prin = clona(tmp, "principale2")
    hook(prin, "msg", {"prompt": "[AVVIO] Sei la sessione principale #283 di RVC (la chat parallela P40 resta): git fetch"},
         nopush=True)
    controlla(ruolo_file(prin) == "principale", "avvio della principale che nomina la parallela → principale")
    riav = clona(tmp, "riavvio")
    trascr = os.path.join(tmp, "trascrizione.jsonl")
    with open(trascr, "w") as f:
        f.write(json.dumps({"type": "system"}) + "\nnon json\n")
        f.write(json.dumps({"type": "user", "message": {"role": "user", "content": AVVIO_PAR}}) + "\n")
    hook(riav, "msg", {"prompt": "eccomi, continua", "transcript_path": trascr}, nopush=True)
    controlla(ruolo_file(riav) == "parallela", "riavvio in un contenitore nuovo: ruolo ritrovato nella trascrizione")
    out = sh(sys.executable, "-I", os.path.join(HOOKS, "scorta.py"), "ruolo", "parallela", cwd=prin,
             env=dict(os.environ, CLAUDE_PROJECT_DIR=prin))
    controlla(out.endswith("parallela") and ruolo_file(prin) == "parallela", "ruolo scritto a mano")

    # 7. C252: push non in avanti (un altro contenitore ha scritto nella stessa scorta): niente unione col proprio
    #    albero (copriva i suoi file, E154), niente push; avviso «SCORTA FERMA» finché il ramo non la contiene
    intruso = clona(tmp, "intruso")
    git(intruso, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    open(os.path.join(intruso, "c.txt"), "w").write("intruso\n")
    git(intruso, "add", "-A")
    git(intruso, "commit", "-q", "-m", "intruso")
    git(intruso, "push", "-q", "origin", "HEAD:refs/heads/scorta-principale/claude/prova-1")
    estraneo = git(intruso, "rev-parse", "HEAD")
    open(os.path.join(repo, "a.txt"), "w").write("nove\n")
    hook(repo, "stop")
    ferma = os.path.join(gitdir, "scorta-ferma")
    controlla(aspetta_file(ferma), "push rifiutato da una scorta estranea: segno «ferma»")
    remota = git(repo, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0]
    controlla(remota == estraneo and git(repo, "show", f"{remota}:c.txt") == "intruso",
              "la scorta dell'altro contenitore resta intatta su GitHub")
    out = hook_out(repo, "msg", {"prompt": "come va?"})
    controlla("SCORTA FERMA" in out and "git merge origin/scorta-principale/claude/prova-1" in out,
              "al messaggio dopo l'avviso con il merge da fare")
    git(repo, "checkout", "-q", "--", "a.txt")
    git(repo, "fetch", "-q", "origin")
    git(repo, "merge", "-q", "--ff-only", "origin/scorta-principale/claude/prova-1")
    open(os.path.join(repo, "a.txt"), "w").write("nove\n")
    out = hook_out(repo, "msg", {"prompt": "unita"})
    s6 = remoto_scorta(repo)
    controlla("SCORTA FERMA" not in out and not os.path.exists(ferma), "dopo l'unione niente avviso")
    controlla(subprocess.run(["git", "merge-base", "--is-ancestor", estraneo, s6], cwd=repo).returncode == 0
              and git(repo, "show", f"{s6}:a.txt") == "nove" and git(repo, "show", f"{s6}:c.txt") == "intruso",
              "dopo l'unione la scorta riparte con il lavoro di tutti e due")

    # 7b. E154 (avvio della #290): contenitore nuovo, la scorta di prima è su GitHub e non nel ramo → niente scorta
    nuovo_c = clona(tmp, "contenitore-nuovo")
    hook(nuovo_c, "msg", {"prompt": "[AVVIO] Sei la sessione principale #2: git fetch"})
    controlla(git(nuovo_c, "rev-parse", "-q", "--verify", "refs/scorta-principale/claude/prova-1") == ""
              and git(nuovo_c, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0] == s6,
              "contenitore nuovo: niente scorta finché quella di prima non è unita")
    controlla(os.path.exists(os.path.join(git(nuovo_c, "rev-parse", "--absolute-git-dir"), "scorta-ferma")),
              "contenitore nuovo: segno «ferma» scritto")
    # stessa cosa se il riferimento remoto non è ancora stato scaricato: lo ferma il push rifiutato
    cieco = clona(tmp, "contenitore-cieco")
    git(cieco, "update-ref", "-d", "refs/remotes/origin/scorta-principale/claude/prova-1")
    open(os.path.join(cieco, "d.txt"), "w").write("cieco\n")
    hook(cieco, "stop")
    controlla(aspetta_file(os.path.join(git(cieco, "rev-parse", "--absolute-git-dir"), "scorta-ferma"))
              and git(cieco, "ls-remote", "origin", "refs/heads/scorta-principale/claude/prova-1").split("\t")[0] == s6,
              "contenitore nuovo senza fetch: push fermato, la scorta di prima resta")

    # 8. avvio-check con due scorte: ruolo non ancora noto → tutte e due; ruolo noto → la sua e una notizia
    out = avvio()
    controlla("SCORTA della chat principale" in out and "SCORTA della chat parallela" in out and "Ruolo:" in out,
              "ruolo non noto: avvisa delle due scorte e dice come scegliere")
    open(os.path.join(git(altro, "rev-parse", "--absolute-git-dir"), "scorta-ruolo"), "w").write("principale\n")
    out = avvio()
    controlla("SCORTA della chat principale" in out and "Notizia: anche origin/scorta-parallela/claude/prova-1" in out
              and "SCORTA della chat parallela" not in out, "ruolo noto: la sua scorta, l'altra solo notizia")

print(f"Scorta: {ok_n} controlli riusciti")
