#!/usr/bin/env python3
# Scorta automatica (D27, autorizzata da Mario il 10/10/2026): se i token finiscono di colpo, su GitHub c'è già tutto.
#   scorta.py msg  (UserPromptSubmit): salva l'ultimo messaggio di Mario in .git/scorta-msg.md (fuori dal progetto).
#                  Poi fa subito anche la scorta: un «salva» scritto quando il limite è finito arriva comunque su GitHub.
#   scorta.py tool (PostToolUse di Edit/Write/Bash): scorta anche a metà risposta, al massimo ogni 2 minuti
#                  (Mario 17/10: se il limite arriva a metà lavoro, la scorta di fine risposta non parte mai).
#   scorta.py stop (Stop): fotografa il lavoro (anche non salvato) con l'ultimo messaggio in docs/ULTIMO-MESSAGGIO.md
#                  e lo manda su GitHub nel ramo scorta-<ruolo>/<ramo>, senza toccare il ramo di lavoro né l'indice vero.
#   scorta.py ruolo [principale|parallela]: scrive (o dice) il ruolo di questa chat, se il prompt di avvio non l'ha detto.
# Ogni scorta contiene HEAD e la scorta prima: il push è sempre in avanti, mai forzato. Niente cambiato = niente push.
# C148 (Mario 23/10 «1»): una scorta per chat. Con una sola scorta le due chat si rubavano il push (non in avanti =
# scartato in silenzio) e all'avvio non si sapeva di chi era il lavoro (E97). Il ruolo resta in .git/scorta-ruolo:
# lo decide il prompt «[AVVIO] Sei la chat parallela …» (sennò principale), o la trascrizione dopo un riavvio.
# Per riprendere: git fetch origin scorta-<ruolo>/<ramo> && git merge origin/scorta-<ruolo>/<ramo> (lo segnala avvio-check.py).
# C252 (E154, Mario 23/10 «avvia la correzione»): la scorta di un ALTRO contenitore non si copre mai. Contenitore nuovo
# (niente scorta locale) con la scorta di GitHub non ancora unita al ramo → niente scorta; push rifiutato da una punta
# estranea → niente push (prima si univa col proprio albero e il lavoro dell'altro spariva dai file). In tutti e due i
# casi .git/scorta-ferma e, al messaggio dopo, l'avviso «SCORTA FERMA» con il merge da fare.
import datetime, json, os, re, subprocess, sys, time

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
RUOLI = ("principale", "parallela")
# ogni chat il suo file: unendo le due scorte nel ramo comune il messaggio non va in conflitto
FILE_MSG = {"principale": "docs/ULTIMO-MESSAGGIO.md", "parallela": "docs/ULTIMO-MESSAGGIO-PARALLELA.md"}
AVVIO_PARALLELA = re.compile(r"^\[AVVIO\][^\n]*\bSei la (?:chat|sessione) parallela\b", re.I)
# "[AVVIO]" = prompt di avvio scritto dalla sessione che chiude (#58): non è un messaggio di Mario
# "<cross-session-message" = messaggio di un'altra sessione (es. Jona, #62): non è un messaggio di Mario
# "<agent-message" = rapporto finale di un aiutante (strumento Agent, #73): non è un messaggio di Mario
# Jona: anche l'avviso di riavvio del contenitore (E42) e il prompt di avvio dell'handoff «git fetch origin claude/» (E43)
AVVISI_DI_SISTEMA = ("<task-notification", "<system-reminder", "<wake ", "[SYSTEM NOTIFICATION", "[AVVIO]",
                     "<cross-session-message", "<agent-message", "This session's worker process was restarted",
                     "git fetch origin claude/")
# E29 (#58–#59): un segreto incollato in chat non deve mai arrivare su GitHub con la scorta
TOLTO = "[segreto tolto dalla scorta]"
SEGRETI = [re.compile(p, re.S) for p in (
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?(?:-----END [A-Z ]*PRIVATE KEY-----|\Z)",  # chiavi private
    r"https?://script\.google(?:usercontent)?\.com/\S+",  # app web di Apps Script (cartella Drive)
    r"AIza[0-9A-Za-z_\-]{20,}",  # chiavi Google/Firebase
    r"\b(?:sk|pk|rk)-[A-Za-z0-9_\-]{16,}",  # chiavi API (Anthropic, OpenAI, Stripe…)
    r"\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}",  # gettoni GitHub
    r"\bxox[abprs]-[A-Za-z0-9\-]{10,}",  # gettoni Slack
    r"\bAKIA[0-9A-Z]{16}\b",  # chiavi AWS
    r"(?i)\b(?:key|token|secret|password|pass|pwd|auth|sig|signature)=[^\s&]+",  # valori segreti negli indirizzi
)]
# sequenze lunghe di lettere e cifre insieme (gettoni sconosciuti); le parole normali non arrivano a 32 caratteri
GETTONE = re.compile(r"[A-Za-z0-9_\-]{32,}")
NOMI_SEGRETI = re.compile(r"KEY|TOKEN|SECRET|PASSWORD|_URL$", re.I)


def togli_segreti(testo):
    for nome, valore in os.environ.items():  # i valori segreti dell'ambiente, se Mario li incolla in chat
        if NOMI_SEGRETI.search(nome) and len(valore) >= 12 and valore in testo:
            testo = testo.replace(valore, TOLTO)
    for p in SEGRETI:
        testo = p.sub(TOLTO, testo)
    return GETTONE.sub(lambda m: TOLTO if re.search(r"\d", m.group()) and re.search(r"[A-Za-z]", m.group())
                       else m.group(), testo)


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
        return  # avvisi automatici (GitHub, promemoria, prompt di avvio): non sono messaggi di Mario
    with open(os.path.join(gitdir, "scorta-msg.md"), "w", encoding="utf-8") as f:
        f.write(f"# Ultimo messaggio di Mario ({ora_italiana()} ora italiana)\n\n{togli_segreti(testo)}\n")


def ruolo_da_avvio(testo):
    testo = str(testo or "").strip()
    if not testo.startswith("[AVVIO]"):
        return ""
    return "parallela" if AVVIO_PARALLELA.match(testo) else "principale"


def ruolo_da_trascrizione(percorso):
    # dopo un riavvio in un contenitore nuovo .git/scorta-ruolo non c'è più: il prompt di avvio è nella trascrizione
    try:
        with open(percorso, encoding="utf-8") as f:
            for n, riga in enumerate(f):
                if n > 300:
                    break
                try:
                    voce = json.loads(riga)
                except ValueError:
                    continue
                if voce.get("type") != "user":
                    continue
                testo = (voce.get("message") or {}).get("content")
                if isinstance(testo, list):
                    testo = " ".join(str(p.get("text") or "") for p in testo if isinstance(p, dict))
                trovato = ruolo_da_avvio(testo)
                if trovato:
                    return trovato
    except (OSError, TypeError):
        pass
    return ""


def scrivi_ruolo(gitdir, ruolo):
    with open(os.path.join(gitdir, "scorta-ruolo"), "w", encoding="utf-8") as f:
        f.write(ruolo + "\n")


def ruolo_chat(gitdir, dati):
    try:
        with open(os.path.join(gitdir, "scorta-ruolo"), encoding="utf-8") as f:
            salvato = f.read().strip()
        if salvato in RUOLI:
            return salvato
    except OSError:
        pass
    trovato = ruolo_da_avvio(dati.get("prompt")) or ruolo_da_trascrizione(dati.get("transcript_path"))
    if trovato or dati.get("prompt"):  # primo messaggio senza avvio = sessione aperta a mano da Mario = principale
        trovato = trovato or "principale"
        scrivi_ruolo(gitdir, trovato)
    return trovato or "principale"


def scorta(gitdir, ruolo="principale", push=True):
    ramo = git("symbolic-ref", "-q", "--short", "HEAD")
    head = git("rev-parse", "-q", "--verify", "HEAD")
    if not ramo or not head or ramo.startswith(("scorta/", "scorta-")):
        return
    nome = f"scorta-{ruolo}/{ramo}"
    rif = f"refs/{nome}"  # ultima scorta fatta da questo container
    locale = git("rev-parse", "-q", "--verify", rif)
    remota = git("rev-parse", "-q", "--verify", f"refs/remotes/origin/{nome}")
    if not locale and remota and run("merge-base", "--is-ancestor", remota, head)[0] != 0:
        segna_ferma(gitdir, nome, remota)  # C252: contenitore nuovo, la scorta di prima non è ancora nel ramo
        return
    prima = locale or remota

    env = dict(os.environ, GIT_INDEX_FILE=os.path.join(gitdir, "scorta-index"))
    if run("read-tree", head, env=env)[0] or run("add", "-A", env=env, timeout=60)[0]:
        return
    msg = os.path.join(gitdir, "scorta-msg.md")
    if os.path.exists(msg):
        blob = git("hash-object", "-w", msg)
        if not blob or run("update-index", "--add", "--cacheinfo", f"100644,{blob},{FILE_MSG[ruolo]}", env=env)[0]:
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
        subprocess.Popen(["timeout", "120", sys.executable, "-I", os.path.abspath(__file__), "spingi", nuovo, nome],
                         cwd=CWD, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         start_new_session=True)


def segna_ferma(gitdir, nome, punta):
    with open(os.path.join(gitdir, "scorta-ferma"), "w", encoding="utf-8") as f:
        f.write(f"{nome} {punta}\n")


def avviso_ferma(gitdir):
    # C252: detto a ogni messaggio finché il ramo non contiene la scorta dell'altro contenitore
    segno = os.path.join(gitdir, "scorta-ferma")
    try:
        nome, punta = open(segno, encoding="utf-8").read().split()
    except (OSError, ValueError):
        return
    if run("merge-base", "--is-ancestor", punta, "HEAD")[0] == 0:
        os.remove(segno)
        return
    print(f"SCORTA FERMA (C252): origin/{nome} ha lavoro di un altro contenitore che il ramo non ha. "
          f"Finché non lo unisci la scorta non parte: git fetch origin {nome} && git merge origin/{nome}, poi git push.")


def spingi(nuovo, nome):
    if run("push", "-q", "origin", f"{nuovo}:refs/heads/{nome}", timeout=50)[0] == 0:
        return
    # push non in avanti: qualcun altro ha scritto nella stessa scorta (un altro contenitore o un ruolo sbagliato).
    # C252: niente unione col proprio albero (copriva i suoi file, E154) e mai push forzato: si ferma e lo dice.
    if run("fetch", "-q", "origin", f"+refs/heads/{nome}:refs/remotes/origin/{nome}", timeout=30)[0]:
        return
    altra = git("rev-parse", "-q", "--verify", f"refs/remotes/origin/{nome}")
    if not altra or run("merge-base", "--is-ancestor", altra, nuovo)[0] == 0:
        return
    if run("merge-base", "--is-ancestor", nuovo, altra)[0] == 0:
        return  # su GitHub c'è già una scorta più nuova di questa chat (due push partiti insieme)
    gitdir = git("rev-parse", "--absolute-git-dir")
    if gitdir:
        segna_ferma(gitdir, nome, altra)


PAUSA_TOOL = 120  # secondi minimi tra due scorte a metà risposta


def tocca_al_tool(gitdir):
    segno = os.path.join(gitdir, "scorta-ora")
    try:
        if time.time() - os.path.getmtime(segno) < PAUSA_TOOL:
            return False
    except OSError:
        pass
    with open(segno, "w") as f:
        f.write("")
    return True


def main():
    if sys.argv[1:2] == ["spingi"] and len(sys.argv) == 4:
        spingi(sys.argv[2], sys.argv[3])
        return
    gitdir = git("rev-parse", "--absolute-git-dir")
    if not gitdir:
        return
    if sys.argv[1:2] == ["ruolo"]:  # a mano: python3 -I .claude/hooks/scorta.py ruolo [parallela]
        if sys.argv[2:3] and sys.argv[2] in RUOLI:
            scrivi_ruolo(gitdir, sys.argv[2])
        print("Ruolo della chat per la scorta:", ruolo_chat(gitdir, {}))
        return
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    if not isinstance(dati, dict):
        dati = {}
    ruolo = ruolo_chat(gitdir, dati)
    if "msg" in sys.argv[1:]:
        salva_msg(dati, gitdir)
        avviso_ferma(gitdir)
    if "tool" in sys.argv[1:] and not tocca_al_tool(gitdir):
        return
    if {"msg", "tool", "stop"} & set(sys.argv[1:]):
        scorta(gitdir, ruolo, push=os.environ.get("JONA_SCORTA_NOPUSH") != "1")


try:
    main()
except Exception:
    pass
sys.exit(0)
