#!/usr/bin/env python3
# Prova di tools/pulisci-scorte.py (C352) su un repo finto: via solo le scorte vecchie E già nel ramo; resta tutto il resto.
import datetime, importlib.util, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(QUI, "pulisci-scorte.py")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print(f"ERRORE: {nome}")
        sys.exit(1)
    ok_n += 1
    print(f"ok {nome}")


def git(cwd, *a):
    return subprocess.run(["git", *a], cwd=cwd, capture_output=True, text=True).stdout.strip()


def pulisci(repo, *a):
    r = subprocess.run([sys.executable, "-I", SCRIPT, *a], cwd=repo, capture_output=True, text=True,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=repo))
    return r.returncode, r.stdout + r.stderr


def rami_remoti(repo):
    return sorted(r.split("\t")[1].removeprefix("refs/heads/") for r in git(repo, "ls-remote", "--heads", "origin").splitlines())


with tempfile.TemporaryDirectory() as tmp:
    nudo = os.path.join(tmp, "origin.git")
    repo = os.path.join(tmp, "lavoro")
    subprocess.run(["git", "init", "-q", "--bare", nudo], check=True)
    subprocess.run(["git", "clone", "-q", nudo, repo], check=True, capture_output=True)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    ramo = "claude/prova-1"
    git(repo, "checkout", "-q", "-b", ramo)
    os.makedirs(os.path.join(repo, ".claude"))
    open(os.path.join(repo, ".claude", "ramo-di-lavoro.txt"), "w").write(ramo + "\n")
    open(os.path.join(repo, "a.txt"), "w").write("uno\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    base = git(repo, "rev-parse", "HEAD")
    oggi = datetime.date.today()
    vecchia = (oggi - datetime.timedelta(days=40)).strftime("%Y%m%d")
    recente = (oggi - datetime.timedelta(days=3)).strftime("%Y%m%d")
    # scorte già nel ramo (puntano a un commit del ramo): una vecchia per sessione, una vecchia -ferma-, una recente
    git(repo, "push", "-q", "origin", ramo,
        f"{base}:refs/heads/scorta-parallela-{vecchia}-01AAAAAA/{ramo}",
        f"{base}:refs/heads/scorta-principale/{ramo}-ferma-{vecchia}-120000-abcd",
        f"{base}:refs/heads/scorta-principale-{recente}-01BBBBBB/{ramo}",
        f"{base}:refs/heads/scorta-principale/{ramo}",  # nome vecchio senza data: resta sempre
        f"{base}:refs/heads/scorta-parallela-{vecchia}-01CCCCCC/claude/altro-ramo",  # di un altro ramo: non si tocca
        f"{base}:refs/heads/versione-v1")
    # scorta vecchia con lavoro NON nel ramo
    git(repo, "checkout", "-q", "-b", "tmp")
    open(os.path.join(repo, "lavoro-perso.txt"), "w").write("non unito\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "lavoro non nel ramo")
    git(repo, "push", "-q", "origin", f"HEAD:refs/heads/scorta-parallela-{vecchia}-01DDDDDD/{ramo}")
    git(repo, "checkout", "-q", ramo)
    git(repo, "branch", "-q", "-D", "tmp")
    prima = rami_remoti(repo)
    controlla(len(prima) == 8, "repo finto pronto: 8 rami su origin")

    # 1. prova a secco: dice cosa toglierebbe, non tocca niente
    rc, out = pulisci(repo)
    controlla(rc == 0 and "già nel ramo: 2;" in out and "da guardare): 1." in out and "Prova a secco" in out
              and f"scorta-parallela-{vecchia}-01AAAAAA/{ramo}" in out and f"ferma-{vecchia}-120000-abcd" in out
              and f"tenuta: scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in out, "prova a secco: 2 da togliere, 1 tenuta con lavoro")
    controlla(rami_remoti(repo) == prima, "prova a secco: nessun ramo toccato")

    # 2. --cancella: via solo le 2 vecchie già nel ramo
    rc, out = pulisci(repo, "--cancella")
    dopo = rami_remoti(repo)
    controlla(rc == 0 and "Cancellate 2 di 2." in out and len(dopo) == 6
              and f"scorta-parallela-{vecchia}-01AAAAAA/{ramo}" not in dopo
              and f"scorta-principale/{ramo}-ferma-{vecchia}-120000-abcd" not in dopo, "--cancella: via le 2 vecchie già nel ramo")
    controlla(f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in dopo, "la vecchia con lavoro non nel ramo resta")
    controlla(f"scorta-principale-{recente}-01BBBBBB/{ramo}" in dopo and f"scorta-principale/{ramo}" in dopo, "recente e nome vecchio restano")
    controlla(f"scorta-parallela-{vecchia}-01CCCCCC/claude/altro-ramo" in dopo and "versione-v1" in dopo and ramo in dopo,
              "altro ramo, versione-vNN e ramo di lavoro intatti")

    # 3. seconda passata: niente da fare; --giorni 1 toglie anche la recente (già nel ramo), mai quella col lavoro
    rc, out = pulisci(repo, "--cancella")
    controlla(rc == 0 and "già nel ramo: 0;" in out and rami_remoti(repo) == dopo, "seconda passata: niente da togliere")
    rc, out = pulisci(repo, "--cancella", "--giorni", "1")
    controlla(rc == 0 and "Cancellate 1 di 1." in out and f"scorta-principale-{recente}-01BBBBBB/{ramo}" not in rami_remoti(repo)
              and f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in rami_remoti(repo), "--giorni 1: via la recente, tenuta quella col lavoro")

    # 4. C450 --unite: a ogni età, solo le scorte di sessioni CHIUSE (non aperte in docs/CHI-FA-COSA.md, non la mia)
    #    già nel ramo; quella con lavoro non nel ramo resta anche se chiusa.
    os.makedirs(os.path.join(repo, "docs"))
    with open(os.path.join(repo, "docs", "CHI-FA-COSA.md"), "w") as f:
        f.write("# Chi fa cosa\n\n## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n|---|---|---|---|---|---|\n"
                "| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 12 | `session_01EEEEEEEEEEaaaaaaaaaaaa` (aperta dalla 11); 11 = `session_01FFFFFFFFFFbbbbbbbbbbbb` | — |\n"
                "| Dov'è | quadrati | 🟩 🟨 🟥 ⬛ | 3 | `session_01GGGGGGGGGGcccccccccccc` | 02/11 |\n\n## Altro\n")
    git(repo, "push", "-q", "origin",
        f"{base}:refs/heads/scorta-principale-{recente}-01EEEEEEEEEE/{ramo}",  # sessione aperta: resta
        f"{base}:refs/heads/scorta-principale-{recente}-01FFFFFFFFFF/{ramo}",  # chiusa (precedente della catena): via
        f"{base}:refs/heads/scorta-parallela-{recente}-01GGGGGGGGGG/{ramo}",  # catena chiusa: via
        f"{base}:refs/heads/scorta-parallela-{recente}-01HHHHHHHHHH/{ramo}")  # questa sessione (--mia): resta
    rc, out = pulisci(repo, "--unite", "--mia", "01HHHHHHHHHH")
    if os.environ.get("PROVA_VERBOSA"):
        print(rc, out)
    controlla(rc == 0 and "già nel ramo (o col solo commit automatico): 2;" in out and "da guardare): 1." in out and "(1 aperte in docs/CHI-FA-COSA.md, più questa)" in out
              and "01FFFFFFFFFF" in out and "01GGGGGGGGGG" in out and "01EEEEEEEEEE" not in out.split("Toglierebbe")[1]
              and "01DDDDDD" not in out.split("Toglierebbe")[1], "--unite a secco: via le 2 di sessioni chiuse, tenuta quella col lavoro")
    rc, out = pulisci(repo, "--unite", "--cancella", "--mia", "01HHHHHHHHHH")
    dopo = rami_remoti(repo)
    controlla(rc == 0 and "Cancellate 2 di 2." in out
              and f"scorta-principale-{recente}-01FFFFFFFFFF/{ramo}" not in dopo and f"scorta-parallela-{recente}-01GGGGGGGGGG/{ramo}" not in dopo,
              "--unite --cancella: via le 2 di sessioni chiuse")
    controlla(f"scorta-principale-{recente}-01EEEEEEEEEE/{ramo}" in dopo and f"scorta-parallela-{recente}-01HHHHHHHHHH/{ramo}" in dopo
              and f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in dopo and f"scorta-principale/{ramo}" in dopo,
              "--unite: restano la sessione aperta, la mia, quella col lavoro e il nome vecchio")
    # 4b. C469 C2: scorte di sessioni chiuse col SOLO commit automatico (file della scorta) mai unito: via se ogni messaggio
    #     di Mario della sua sessione è già arrivato nel ramo; tenuta se ne porta uno mai arrivato (E290).
    reg = os.path.join(repo, "docs", "MESSAGGI-MARIO.md")
    ultimo = os.path.join(repo, "docs", "ULTIMO-MESSAGGIO.md")
    open(reg, "w").write("# Messaggi di Mario\n\n## 2026-11-01 10:00 · 01JJJJJJJJJJ\nciao\n")
    git(repo, "add", reg)
    git(repo, "commit", "-q", "-m", "registro nel ramo")
    git(repo, "push", "-q", "origin", ramo)
    for sess, extra in (("01JJJJJJJJJJ", ""), ("01KKKKKKKKKK", "\n## 2026-11-02 11:00 · 01KKKKKKKKKK\nmessaggio mai arrivato\n")):
        git(repo, "checkout", "-q", "-b", "tmp")
        open(ultimo, "w").write(f"# Ultimo messaggio ({sess})\n")
        open(reg, "a").write(extra)
        git(repo, "add", ultimo, reg)
        git(repo, "commit", "-q", "-m", f"Scorta automatica {sess}")
        git(repo, "push", "-q", "origin", f"HEAD:refs/heads/scorta-principale-{recente}-{sess}/{ramo}")
        git(repo, "checkout", "-q", ramo)
        git(repo, "checkout", "-q", "--", ".")
        git(repo, "branch", "-q", "-D", "tmp")
    rc, out = pulisci(repo, "--unite", "--cancella", "--mia", "01HHHHHHHHHH")
    dopo = rami_remoti(repo)
    if os.environ.get("PROVA_VERBOSA"):
        print(rc, out)
    controlla(rc == 0 and "Cancellate 1 di 1." in out and f"scorta-principale-{recente}-01JJJJJJJJJJ/{ramo}" not in dopo,
              "C2: via la scorta chiusa col solo commit automatico e i messaggi già nel ramo")
    controlla(f"scorta-principale-{recente}-01KKKKKKKKKK/{ramo}" in dopo and f"scorta-parallela-{vecchia}-01DDDDDD/{ramo}" in dopo,
              "C2: restano quella con un messaggio di Mario mai arrivato e quella col lavoro")
    # 4c. C469: cancellazione rifiutata dal remoto (come il contenitore in cloud, 09/11 «0 di 171»): dopo 3 rifiuti si ferma
    for sess in ("01MMMMMMMMMM", "01NNNNNNNNNN", "01PPPPPPPPPP", "01QQQQQQQQQQ"):
        git(repo, "push", "-q", "origin", f"{base}:refs/heads/scorta-principale-{recente}-{sess}/{ramo}")
    subprocess.run(["git", "config", "receive.denyDeletes", "true"], cwd=nudo, check=True)
    rc, out = pulisci(repo, "--unite", "--cancella", "--mia", "01HHHHHHHHHH")
    subprocess.run(["git", "config", "--unset", "receive.denyDeletes"], cwd=nudo, check=True)
    controlla(rc != 0 and "Cancellate 0 di 4." in out and "rifiutata da qui" in out
              and f"scorta-principale-{recente}-01QQQQQQQQQQ/{ramo}" in rami_remoti(repo),
              "C469: cancellazione rifiutata → si ferma dopo 3 e lo dice")
    rc, out = pulisci(repo, "--unite", "--cancella", "--mia", "01HHHHHHHHHH")
    dopo = rami_remoti(repo)
    controlla(rc == 0 and "Cancellate 4 di 4." in out, "C469: col permesso tornato le 4 vanno via")
    # 5. Sicura: senza docs/CHI-FA-COSA.md (checkout parziale, hook mancante) --unite si ferma, non cancella niente
    os.rename(os.path.join(repo, "docs", "CHI-FA-COSA.md"), os.path.join(repo, "docs", "CHI-FA-COSA.via"))
    rc, out = pulisci(repo, "--unite", "--cancella", "--mia", "01HHHHHHHHHH")
    controlla(rc != 0 and "mi fermo" in out and "Cancellate" not in out and rami_remoti(repo) == dopo,
              "--unite senza CHI-FA-COSA.md: si ferma e non tocca niente")
    # 6. E381 (11/11): copia SENZA i file, come quella che fa GitHub (actions/checkout con sparse-checkout =
    #    --filter=blob:none). Lo script scarica in due viaggi i file piccoli di tutti i rami e tutte le versioni
    #    dell'archivio dei messaggi (anche oltre il filtro), poi dà lo stesso esito della copia intera.
    os.rename(os.path.join(repo, "docs", "CHI-FA-COSA.via"), os.path.join(repo, "docs", "CHI-FA-COSA.md"))
    os.makedirs(os.path.join(repo, "archivio", "messaggi-mario"))
    with open(os.path.join(repo, "archivio", "messaggi-mario", "2026-11.md"), "w") as f:  # ~300 KB: oltre il filtro (200 KB)
        f.write("# Archivio\n\n## 2026-11-01 10:00 · 01JJJJJJJJJJ\nciao\n" + "".join(f"riga {i} dell'archivio dei messaggi\n" for i in range(9000)))
    git(repo, "add", "archivio")
    git(repo, "commit", "-q", "-m", "archivio grande nel ramo")
    git(repo, "push", "-q", "origin", ramo)
    git(repo, "checkout", "-q", "-b", "tmp")  # scorta chiusa col solo commit automatico, messaggi già nel ramo: via
    open(ultimo, "w").write("# Ultimo messaggio (01RRRRRRRRRR)\n")
    git(repo, "add", ultimo)
    git(repo, "commit", "-q", "-m", "Scorta automatica 01RRRRRRRRRR")
    git(repo, "push", "-q", "origin", f"HEAD:refs/heads/scorta-principale-{recente}-01RRRRRRRRRR/{ramo}")
    git(repo, "checkout", "-q", ramo)
    git(repo, "branch", "-q", "-D", "tmp")
    rc, intera = pulisci(repo, "--unite", "--elenco", "--mia", "01HHHHHHHHHH")
    controlla(rc == 0 and "01RRRRRRRRRR" in intera.split("Toglierebbe")[1] and "tenuta: " in intera, "copia intera: 1 da togliere e le tenute")
    for k in ("uploadpack.allowFilter", "uploadpack.allowAnySHA1InWant"):
        subprocess.run(["git", "config", k, "true"], cwd=nudo, check=True)
    parziale = os.path.join(tmp, "parziale")
    subprocess.run(["git", "clone", "-q", "--filter=blob:none", "--no-checkout", "file://" + nudo, parziale], check=True, capture_output=True)
    git(parziale, "config", "gc.auto", "0")  # come actions/checkout: niente riordino in sottofondo (sporca la cartella a fine prova)
    git(parziale, "sparse-checkout", "set", "--no-cone", ".claude/ramo-di-lavoro.txt")
    git(parziale, "checkout", "-q", ramo)
    os.makedirs(os.path.join(parziale, "docs"))
    shutil.copy(os.path.join(repo, "docs", "CHI-FA-COSA.md"), os.path.join(parziale, "docs"))

    def mancano():
        return sum(r.startswith("?") for r in git(parziale, "rev-list", "--objects", "--missing=print", "--remotes=origin").splitlines())

    controlla(git(parziale, "config", "--get", "remote.origin.partialclonefilter") == "blob:none" and mancano() > 3,
              "E381: copia senza file pronta (i file della storia mancano)")
    os.environ["CLAUDE_PROJECT_DIR"] = parziale  # il modulo legge la cartella quando nasce
    spec = importlib.util.spec_from_file_location("pulisci_scorte", SCRIPT)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    fatto = modulo.file_della_storia()
    controlla(fatto and git(parziale, "config", "--get", "remote.origin.partialclonefilter") == "blob:limit=200k" and mancano() == 0,
              "E381: due viaggi e nessun file della storia manca più (anche l'archivio oltre il filtro)")
    controlla(modulo.file_della_storia() is False, "E381: seconda volta (o copia intera) non rifà lo scarico")
    rc, out = pulisci(parziale, "--unite", "--elenco", "--mia", "01HHHHHHHHHH")
    controlla(rc == 0 and out == intera, "E381: sulla copia senza file lo stesso esito della copia intera")
    os.environ["CLAUDE_PROJECT_DIR"] = repo
    spec.loader.exec_module(modulo)
    controlla(modulo.file_della_storia() is False and modulo.run("version", timeout=0.000001)[0] == 124,
              "E381: copia intera = niente scarico; tempo scaduto = rc 124, mai un'eccezione")

# Risparmio 25 (14/11): 23 scorte su 25 tenute portavano solo il proprio file di archivio/consumo/. --consumo porta nel
# ramo la versione più avanti delle scorte CHIUSE (mai di una aperta, mai una più indietro del ramo); poi --unite le toglie.
with tempfile.TemporaryDirectory() as tmp:
    nudo, repo, ramo = os.path.join(tmp, "o.git"), os.path.join(tmp, "l"), "claude/prova-1"
    subprocess.run(["git", "init", "-q", "--bare", nudo], check=True)
    subprocess.run(["git", "clone", "-q", nudo, repo], check=True, capture_output=True)
    for k, v in (("user.name", "Prova"), ("user.email", "prova@example.com"), ("commit.gpgsign", "false")):
        git(repo, "config", k, v)
    git(repo, "checkout", "-q", "-b", ramo)
    for d in (".claude", "docs", "archivio/consumo"):
        os.makedirs(os.path.join(repo, d))
    scrivi = lambda rel, testo: open(os.path.join(repo, rel), "w").write(testo)
    scrivi(".claude/ramo-di-lavoro.txt", ramo + "\n")
    scrivi("docs/CHI-FA-COSA.md", "## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n|---|---|---|---|---|---|\n"
           "| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 2 | `session_01AAAAAAAAAAaaaaaaaaaaaa` (aperta dalla 1); 1 = `session_01BBBBBBBBBBbbbbbbbbbbbb` | — |\n")
    scrivi("archivio/consumo/g-vecchia.json", '{"turni": 3, "peso": 30}\n')
    scrivi("docs/MESSAGGI-MARIO.md", "# Registro\n\n## 2026-11-13 10:00 · 01BBBBBBBBBB\nciao\n")  # messaggi già arrivati
    git(repo, "add", "-A"); git(repo, "commit", "-q", "-m", "base"); git(repo, "push", "-q", "-u", "origin", ramo)

    def scorta(nome, file, testo):
        git(repo, "checkout", "-q", "-b", "tmp-" + nome, ramo)
        scrivi(file, testo); git(repo, "add", "-A"); git(repo, "commit", "-q", "-m", "Scorta automatica")
        git(repo, "push", "-q", "origin", f"HEAD:refs/heads/{nome}/{ramo}"); git(repo, "checkout", "-q", ramo)
    scorta("scorta-principale-20261113-01BBBBBBBBBB", "archivio/consumo/g-chiusa.json", '{"turni": 5, "peso": 50}\n')
    scorta("scorta-parallela-20261113-01BBBBBBBBBB", "archivio/consumo/g-vecchia.json", '{"turni": 1, "peso": 10}\n')
    scorta("scorta-principale-20261113-01AAAAAAAAAA", "archivio/consumo/g-aperta.json", '{"turni": 9, "peso": 90}\n')
    rc, out = pulisci(repo, "--consumo")
    if os.environ.get("PROVA_VERBOSA"):
        print(rc, sorted(os.listdir(os.path.join(repo, "archivio/consumo"))), [open(os.path.join(repo, "archivio/consumo", x)).read() for x in sorted(os.listdir(os.path.join(repo, "archivio/consumo")))])
    leggi = lambda rel: open(os.path.join(repo, rel)).read() if os.path.exists(os.path.join(repo, rel)) else None
    controlla(rc == 0 and "1 file più avanti" in out and leggi("archivio/consumo/g-chiusa.json") == '{"turni": 5, "peso": 50}\n'
              and leggi("archivio/consumo/g-aperta.json") is None and '"turni": 3' in leggi("archivio/consumo/g-vecchia.json")
              and not rami_remoti(repo).count("x"),
              "--consumo: solo la versione più avanti delle scorte chiuse, uguale byte per byte; niente dell'aperta: " + out[-160:])
    git(repo, "add", "-A"); git(repo, "commit", "-q", "-m", "consumo"); git(repo, "push", "-q", "origin", ramo)
    rc, out = pulisci(repo, "--unite")
    controlla("già nel ramo (o col solo commit automatico): 1;" in out,
              "dopo --consumo la scorta chiusa col solo consumo è «già nel ramo»: " + out[:220])

print(f"Pulisci scorte: {ok_n} controlli riusciti")
