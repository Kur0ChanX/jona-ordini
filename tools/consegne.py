#!/usr/bin/env python3
"""Consegne a stampo (C352; storia in docs/STORIA-REGOLE.md). Le righe di FATTO le scrive lo script, Claude solo il giudizio.

Uso:
  python3 -I tools/consegne.py fatti --id <id della sessione che chiude> --catena N [--motore claude-fable-5-1]
                                     [--prossimo "argomento della sessione nuova"] [--apre claude|mario]
      --catena è obbligatorio (kit 38.51, C511 p.20: senza, valeva 1 e una sessione a 8 di 8 scriveva «la apre Claude»).
      docs/PASSAGGIO-CONSEGNE.md: «Sessione attuale: #N+1 …», intestazione e primo punto di «## Stato», «## Motore e
      forza di pensiero», «Prossimo E libero…»; riscrive docs/PROSSIMA-SESSIONE.md; stampa messaggi di Mario dopo
      l'ultimo commit delle consegne e scorte non unite. Le altre sezioni non le tocca.
  python3 -I tools/consegne.py controlla [--parallela <Nome>]
      controlli della fase 3 della skill «consegne», VERO o FALSO; uscita 1 se uno è FALSO.
  python3 -I tools/consegne.py fatti --parallela <Nome> --id <id> --catena N [--motore …] [--prossimo …]
      C450: catena parallela: in docs/CONSEGNE-PARALLELA-<NOME>.md blocco «## Stato (<Nome> N, …)» in cima, «## Testo per
      aprire la <Nome> N+1» e «## Motore e forza di pensiero»; numero da docs/CHI-FA-COSA.md «## Catene».
  python3 -I tools/consegne.py miei
      C469: i messaggi di Mario di questa sessione, interi, con l'inizio della domanda a cui rispondevano.
  python3 -I tools/consegne.py avvio --parallela <Nome>
      C469 fase 3: scheda d'avvio a perdita zero (ramo, messaggi di Mario di ogni chat, «Aspetta Mario», promesse,
      CHI-FA-COSA, Da fare della catena, passi della skill); dato che manca = «SCHEDA NON GENERATA» o «LEGGI TUTTO».
Impostazioni del progetto in `.claude/progetto.json` (kit 38.51, C511 p.21 e p.23), ognuna facoltativa:
  "versione": {"file": …, "modello": regex con un gruppo} → «Versione nel codice vN» (senza: la frase non si scrive);
  "numeri": [{"sigla": "C", "modello": regex con un gruppo, "file": […], "lavori": true}, …] → «prossimo C libero»
      (sigla "" = numeri semplici del Da fare; senza: solo «Prossimo E libero», la forma del diario del kit);
  "scheda_avvio": ["<Nome>", …] o "tutte" → catene parallele aperte con la scheda d'avvio (senza: nessuna).
Prova: python3 -I tools/test-consegne.py
"""
import argparse
import datetime
import difflib
import glob
import json
import os
import re
import subprocess
import sys
import unicodedata

CWD = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
CONSEGNE = "docs/PASSAGGIO-CONSEGNE.md"
PROSSIMA = "docs/PROSSIMA-SESSIONE.md"
REGISTRO = "docs/MESSAGGI-MARIO.md"
CONSEGNE_PAR = "docs/CONSEGNE-PARALLELA-{}.md"  # C450: una catena parallela
REGISTRO_PAR = "docs/MESSAGGI-MARIO-PARALLELA.md"
QUIZ_CHIAVE = "docs/misure/quiz-passaggio-{}-{}-chiave.md"  # C469 F3: quiz di passaggio della catena
FONTI_QUIZ = ("docs/ERRORI.md", "CLAUDE.md", "docs/kit-progetto/REGOLE.md")  # letti a ogni avvio, oltre alle consegne
SETTINGS = ".claude/settings.json"
PROGETTO_JSON = ".claude/progetto.json"  # C511 p.21, p.23: impostazioni del progetto per gli strumenti del kit
NUMERI_E = {"sigla": "E", "modello": r"\*\*E(\d+)|^\| E(\d+) \|", "file": ["docs/ERRORI.md", "docs/ERRORI-STORIA.md"]}  # diario del kit, E331
MOTORI = {"claude-fable-5-1": "Fable 5.1", "claude-fable-5-2": "Fable 5.2", "claude-opus-5-5": "Opus 5.5",
          "claude-opus-5": "Opus 5", "claude-sonnet-5-5": "Sonnet 5.5"}
# C472 (Mario 10/11 ~11:35): sessione che chiude con Fable → la nuova (stesso motore di chi chiude, C474) se nasce con un altro motore non lavora finché Mario non mette
# Fable. Il segno sta nel testo [AVVIO]: testo, pensiero e perché (C504) in `.claude/hooks/fable_segno.py`, un posto solo.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
from fable_segno import SEGNO as SEGNO_FABLE, segno as fermo_fable  # noqa: E402
# C483 (Mario 12/11 ~20:10 «perché scrivi ultracode dopo avvio non c'è piú quella regola in quel modo»): i copioni
# (Workflow) si decidono caso per caso, niente eredità. In un testo d'avvio la PAROLA accende da sola la modalità della
# piattaforma «un copione per ogni lavoro»: mai nei testi che una sessione nuova riceve (controllo in `controlla`).
PAROLA_VIETATA = re.compile(r"ultra\s*code", re.I)


def registro_mio():
    """Il registro di QUESTA sessione: il .jsonl più recente in ~/.claude/projects/<cartella del progetto>/ (ValueError se manca)."""
    cartella = os.path.join(os.path.expanduser("~/.claude/projects"), re.sub(r"[^A-Za-z0-9]", "-", CWD))
    return max(glob.glob(os.path.join(cartella, "*.jsonl")), key=os.path.getmtime)


def ultima_risposta_del_registro():
    """C472, C474: (motore, impegno) dell'ultima risposta di QUESTA sessione, dal suo registro (il .jsonl più recente in
    ~/.claude/projects/<cartella del progetto>/); ('', '') se non si trova."""
    try:
        ultimo = registro_mio()
        with open(ultimo, "rb") as f:
            f.seek(max(0, os.path.getsize(ultimo) - 300_000))
            righe = f.read().decode("utf-8", "ignore").splitlines()
    except (OSError, ValueError):
        return "", ""
    for r in reversed(righe):
        if '"assistant"' not in r:
            continue
        try:
            d = json.loads(r)
            m = (d.get("message") or {}).get("model")
        except ValueError:
            continue
        if m and not str(m).startswith("<"):
            return str(m), str(d.get("effort") or "")
    return "", ""


def motore_dal_registro():
    """C472: id del motore dell'ultima risposta di QUESTA sessione; '' se non si trova."""
    return ultima_risposta_del_registro()[0]


def motore_vero(args):
    """Il motore scritto nelle consegne: quello vero del registro; `--motore` solo se il registro non c'è (C472)."""
    return motore_dal_registro() or args.motore or ""


def con_fermo_fable(testo_avvio, motore, pensiero="", perche=""):
    """C472: col motore Fable il segno va subito dopo «[AVVIO]» (scorta.py riconosce l'avvio da come comincia)."""
    if "fable" not in str(motore).lower():
        return testo_avvio
    return testo_avvio.replace("[AVVIO] ", f"[AVVIO] {fermo_fable(pensiero, perche)} ", 1)


def perche_fable(args):
    """C504 (Mario 14/11 «dimmelo sempre se c'è bisogno o meno»): --fable di chi chiude, sennò il lavoro a metà."""
    return args.fable or (f"il lavoro di Fable è a metà ({args.prossimo})" if args.prossimo else "il lavoro di Fable è a metà")


IMPEGNI = {"high": "Alto", "xhigh": "Extra", "medium": "Medio", "low": "Basso", "max": "Massimo"}
MAX_PAROLE = 1750


def run(cmd, timeout=30):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=CWD)
        return r.returncode, r.stdout.strip()
    except Exception:
        return 1, ""


def git(*args):
    rc, out = run(["git", *args])
    return out if rc == 0 else ""


def progetto():
    """(nome, icona, «Owner/Repo») del progetto, letti dal progetto stesso: così il file è uguale in ogni progetto del kit
    (pacchetto del kit senza segnaposto, kit 38.18). Nome e icona dal titolo di CLAUDE.md
    («# Nome Icona · regole del progetto», modello del kit), repo dall'indirizzo di origin."""
    nome = icona = ""
    try:
        with open(os.path.join(CWD, "CLAUDE.md"), encoding="utf-8") as f:
            m = re.match(r"# (.+?) (\S+) · ", f.readline())
        if m:
            nome, icona = m.groups()
    except OSError:
        pass
    pezzi = [p for p in re.split(r"[/:]", re.sub(r"(\.git)?/*$", "", git("remote", "get-url", "origin"))) if p]
    repo = "/".join(pezzi[-2:]) if len(pezzi) >= 2 else ""
    return nome or (repo.split("/")[-1] if repo else os.path.basename(CWD)), icona or "📁", repo


NOME, ICONA, REPO = progetto()


def leggi(rel):
    with open(os.path.join(CWD, rel), encoding="utf-8") as f:
        return f.read()


def scrivi(rel, testo):
    with open(os.path.join(CWD, rel), "w", encoding="utf-8") as f:
        f.write(testo)


def ora_italiana(quando=None):
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo("Europe/Rome")
    except Exception:
        tz = None
    d = quando or datetime.datetime.now(datetime.timezone.utc)
    return d.astimezone(tz) if tz else d


def ramo_di_lavoro():
    try:
        return leggi(".claude/ramo-di-lavoro.txt").strip()
    except OSError:
        return git("symbolic-ref", "-q", "--short", "HEAD")


def numero_sessione(testo, sid=None):
    """Principale 594 (12/11): rilanciato dalla stessa sessione (riga «dopo la #N `sid`») resta N, non sale due volte."""
    m = re.search(r"^Sessione attuale: #(\d+)(?: \(dopo la #(\d+) `([^`]+)`)?", testo, re.M)
    if m and sid and m.group(3) == sid:
        return int(m.group(2))
    return int(m.group(1)) if m else None


def impostazione(chiave, base=None):
    """Una voce di .claude/progetto.json (C511); file mancante o rotto = `base`."""
    try:
        valore = json.loads(leggi(PROGETTO_JSON)).get(chiave)
    except (OSError, ValueError, AttributeError):
        return base
    return base if valore is None else valore


def versione_nel_codice():
    """C511 p.21: file e forma della versione da .claude/progetto.json «versione»; senza impostazione None (la frase non
    si scrive: in un progetto senza versioni diceva «v?»), file o forma che non tornano «?»."""
    v = impostazione("versione")
    if not isinstance(v, dict) or not v.get("file") or not v.get("modello"):
        return None
    try:
        nums = [m.group(1) for m in re.finditer(v["modello"], leggi(v["file"]), re.M) if m.re.groups and m.group(1)]
    except (OSError, re.error, IndexError):
        return "?"
    try:
        return max(nums, key=float) if nums else "?"
    except ValueError:
        return max(nums)


def frase_versione():
    v = versione_nel_codice()
    return f" Versione nel codice v{v}." if v else ""


def impegno():
    """C474, E332: l'impegno VERO di questa sessione (registro); il file comune solo se il registro non lo dice."""
    liv = ultima_risposta_del_registro()[1]
    if not liv:
        try:
            liv = json.loads(leggi(SETTINGS)).get("effortLevel", "")
        except Exception:
            liv = ""
    return liv, IMPEGNI.get(liv, liv or "?")


def maiuscola(s):
    return s[:1].upper() + s[1:]


def gh(path):
    rc, out = run(["gh", "api", path], timeout=40)
    try:
        return json.loads(out) if rc == 0 and out else None
    except ValueError:
        return None


def giri_in_corso():
    d = gh(f"repos/{REPO}/actions/runs?status=in_progress&per_page=5")
    if d is None:
        return "giri in corso: non verificati (gh non risponde)"
    nomi = [r.get("name", "?") for r in d.get("workflow_runs", [])]
    return "nessun giro in corso" if not nomi else "giri in corso: " + ", ".join(nomi)


def pr_aperte():
    d = gh(f"repos/{REPO}/pulls?state=open&per_page=5")
    if d is None:
        return "PR aperte: non verificate (gh non risponde)"
    if not d:
        return "nessuna PR aperta"
    return "PR aperte: " + ", ".join(f"#{p['number']} {'(bozza) ' if p.get('draft') else ''}{p.get('title', '')[:40]}" for p in d)


def lavoro_della_scorta(remoto):
    # come in .claude/hooks/scorta.py (merge simulato): «nuovo» solo se porta file diversi da quelli della scorta stessa
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import lavoro_della_scorta as f
        return f(remoto)
    except Exception:
        return "nuovo"


def scorte_non_unite(ramo, ruolo="principale"):
    """Scorte con lavoro vero non ancora nel ramo. La scorta che ha solo i commit automatici di fine risposta
    (`ULTIMA-RISPOSTA.md`, #434) non conta: è il caso normale a ogni handoff."""
    fuori = []
    for nome in mie_scorte(nomi_delle_scorte(ramo), id_corto_mio(), ruolo):
        if run(["git", "fetch", "-q", "origin", f"+refs/heads/{nome}:refs/remotes/origin/{nome}"])[0] == 0 and \
                run(["git", "merge-base", "--is-ancestor", f"origin/{nome}", "HEAD"])[0] != 0 and \
                lavoro_della_scorta(f"origin/{nome}") == "nuovo":
            fuori.append(nome)
    return fuori


def id_corto_mio():
    """Id corto di questa sessione dalla variabile del cloud (come scorta.py); '' in locale."""
    return (re.match(r"[A-Za-z0-9]*", re.sub(r"^(session|cse)_", "", os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID") or "")).group(0))[:12]


def mie_scorte(nomi, mio, ruolo="principale"):
    """Mario 30/10 «sì» (#439): al controllo contano solo le scorte di QUESTA sessione (E60/E97: quelle delle altre chat
    non si uniscono mai, e le parallele vive ne scrivono una a ogni risposta: fermavano ogni handoff). Senza id (in
    locale) restano tutte, come prima."""
    if not mio:
        return list(nomi)
    # Solo il ruolo della chat (principale, o parallela con --parallela, C450) e l'id corto di 12 caratteri (E226: con 8
    # era lo stesso per tutte le sessioni del giorno).
    return [n for n in nomi if re.search(rf"^scorta-{ruolo}-\d{{8}}-" + re.escape(mio) + "/", n)]


def nomi_delle_scorte(ramo):
    """C352: le scorte vive del ramo su GitHub (per sessione «scorta-<ruolo>-<data>-<id>/<ramo>» e nome vecchio),
    senza i rami «-ferma-» e senza quelle di sessioni ferme da più di SCORTE_GIORNI; se GitHub non risponde, i due
    nomi vecchi."""
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import scorte_vive, SCORTE_GIORNI
        vive = scorte_vive(ramo)
    except Exception:
        vive = None
    if vive is None:
        return [f"scorta-{r}/{ramo}" for r in ("principale", "parallela")]
    limite = (datetime.date.today() - datetime.timedelta(days=SCORTE_GIORNI)).strftime("%Y%m%d")
    return [v["nome"] for v in vive if not v["ferma"] and not (v["data"] and v["data"] < limite)]


def numeri_liberi(ramo):
    """→ [(sigla, prossimo libero)]: il numero più alto nei documenti che li assegnano, locali E su origin (l'altra chat
    può averne preso uno). Solo le forme vere (non ogni sigla citata in giro: #434 aveva avuto «E1000»): «**E123**» nel
    diario degli errori (forma del kit, sempre), poi le forme del Da fare scritte dal progetto in .claude/progetto.json
    «numeri» (C511 p.21: nel progetto fonte «| C123 |» e «| M12 |», più «C123-» nei nomi dei file dei lavori; altrove anche numeri
    semplici, sigla ""). Senza impostazione solo E: una forma sbagliata dava «prossimo C libero: C1» falso."""
    altre = impostazione("numeri", [])
    forme = [NUMERI_E] + [x for x in (altre if isinstance(altre, list) else []) if isinstance(x, dict) and x.get("modello")]
    out = []
    for forma in forme:
        nums = []
        file = forma.get("file") or ["docs/DA-FARE.md"]
        for f in (file if isinstance(file, list) else [file]):
            for testo in (leggi(f) if os.path.exists(os.path.join(CWD, f)) else "", git("show", f"origin/{ramo}:{f}")):
                try:
                    trovati = [next((g for g in m.groups() if g), "") for m in re.finditer(forma["modello"], testo, re.M)]
                except re.error:
                    trovati = []
                nums += [int(g) for g in trovati if g.isdigit()]
        sigla = str(forma.get("sigla") or "")
        if forma.get("lavori") and sigla:
            nomi = git("ls-tree", "--name-only", f"origin/{ramo}", "docs/lavori-in-corso/")
            cartella = os.path.join(CWD, "docs/lavori-in-corso")
            nomi += "\n" + "\n".join(os.listdir(cartella)) if os.path.isdir(cartella) else ""
            nums += [int(n) for n in re.findall(rf"(?:^|/){re.escape(sigla)}(\d+)-", nomi, re.M)]
        out.append((sigla, (max(nums) + 1) if nums else 1))
    return out


def riga_liberi(liberi):
    """«Prossimo E libero: E31; prossimo C libero: C13.» (sigla "" → «prossimo numero libero del Da fare: 13»)."""
    pezzi = [f"prossimo {s} libero: {s}{n}" if s else f"prossimo numero libero del Da fare: {n}" for s, n in liberi]
    testo = "; ".join(pezzi) + "."
    return testo[:1].upper() + testo[1:]


def messaggi_dopo_consegne(registro=REGISTRO, consegne=CONSEGNE):
    quando = git("log", "-1", "--format=%ct", "HEAD", "--", consegne)
    if not quando:
        return []
    dal = ora_italiana(datetime.datetime.fromtimestamp(int(quando), datetime.timezone.utc)).strftime("%Y-%m-%d %H:%M")
    try:
        testo = leggi(registro)
    except OSError:
        return []
    try:  # C469 fase 1: la forma delle testate è una sola, in scorta.py (anche quelle scritte a mano)
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import VOCE, ora_voce
    except Exception:  # noqa: BLE001
        VOCE = re.compile(r"^## (\d{4}-\d{2}-\d{2} ~?\d{2}:\d[\dx]) · (\S.*)$")

        def ora_voce(quando):
            return str(quando).replace("~", "").replace("x", "0")
    voci, corrente = [], None
    for riga in testo.splitlines():
        m = VOCE.match(riga)
        if m:
            corrente = [m.group(1), ""] if ora_voce(m.group(1)) >= dal else None
            if corrente:
                voci.append(corrente)
        elif corrente is not None and riga.strip():
            corrente[1] = (corrente[1] + " " + riga.strip()).strip()
    return [(q, t) for q, t in voci]


TETTO_TITOLO = 40  # caratteri: nella barra del PC se ne leggono ~35 (Mario 31/10 21:4x, C368)


TETTO_COSA = 22  # caratteri del «cosa fa»: «~20» di Mario, 22 per tenere intero il suo esempio «Planner: scegli colori» (kit 30.4)
DA_FARE = "docs/DA-FARE.md"
SEZIONE_0 = "## 0. Aspetta Mario"


SEZ_MSG = "Messaggi di Mario di questa sessione"


def _scorta():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
    import scorta
    return scorta


def sessione_mia():
    """Id corto di questa sessione: variabile del cloud, sennò quella salvata dalla scorta ('' se non si sa)."""
    try:
        return id_corto_mio() or _scorta().sessione_salvata(git("rev-parse", "--absolute-git-dir"))
    except Exception:  # noqa: BLE001
        return id_corto_mio()


def miei_messaggi(mio, con_domanda=False):
    """C469 fase 1 (rapporto 12 voce 3): TUTTI i messaggi di Mario di questa sessione, non solo quelli dopo l'ultimo
    commit delle consegne: archivio e registro locali della scorta, registri e archivio del ramo. [(quando, testo)]."""
    if not mio:
        return []
    sc = _scorta()
    gitdir = git("rev-parse", "--absolute-git-dir")
    percorsi = [os.path.join(gitdir, f) for f in ("scorta-archivio.md", "scorta-registro.md")] + \
        [os.path.join(CWD, f) for f in sc.FILE_REGISTRO.values()] + sorted(glob.glob(os.path.join(CWD, sc.ARCHIVIO, "*.md")))
    testi = []
    for p in percorsi:
        try:
            with open(p, encoding="utf-8") as f:
                testi.append(f.read())
        except OSError:
            pass
    # senza la domanda a cui rispondeva (sta solo nell'archivio, rapporto 12 voce 6): le consegne restano corte;
    # l'avvio sì (Mario a volte ci aggiunge parole sue), i messaggi girati da un'altra sessione no (voce 8: non sono
    # di Mario; le sue parole stanno già nell'archivio della sessione dove le ha scritte)
    return [(q, t if con_domanda else sc.senza_domanda(t)) for q, s, t in sc.unisci_voci(*testi)
            if (s.split() or [""])[0] == mio and "(girato da " not in s]


def stampa_miei(domanda_max=300):
    """C469 rapporto 12 voce 11: dopo una compressione, TUTTI i messaggi di Mario di questa sessione, interi (la
    compressione li riassume e i dettagli si perdono); per le risposte, l'inizio della domanda a cui rispondevano."""
    sc = _scorta()
    msgs = miei_messaggi(sessione_mia(), con_domanda=True)
    if not msgs:
        print("Nessun messaggio di Mario trovato per questa sessione (id non noto o nessun messaggio).")
    for q, t in msgs:
        m = sc.CODA_DOMANDA.search(t)
        print(f"## {q}\n{t[:m.start()].strip() if m else t}")
        if m:
            d = " ".join(re.sub(r"^> ?", "", m.group(0).strip(), flags=re.M).split()[2:])
            print(f"> Rispondeva a: {d[:domanda_max]}{'…' if len(d) > domanda_max else ''}")
        print()
    return 0


def testa_msg(q, t):
    piatto = re.sub(r"\s+", " ", t).strip()
    return f"- {q} · {piatto[:80]}{'…' if len(piatto) > 80 else ''} →"


def corpo_messaggi(testo, msgs):
    """La sezione «Messaggi di Mario di questa sessione»: una riga ciascuno, dopo «→» l'esito scritto dal modello (quelli
    già scritti restano: si può rilanciare); in fondo l'ultimo, intero."""
    m = re.search(rf"^## {re.escape(SEZ_MSG)}[^\n]*\n(.*?)(?=^## |\Z)", testo, re.M | re.S)
    vecchie = m.group(1).splitlines() if m else []
    righe = []
    for q, t in msgs:
        testa = testa_msg(q, t)
        righe.append(next((r for r in vecchie if r.startswith(testa)), testa + " "))
    ultimo = "\n".join("> " + r for r in msgs[-1][1].splitlines()) if msgs else ""
    return ("Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).\n"
            + "\n".join(righe) + (f"\n\nUltimo, intero:\n{ultimo}" if ultimo else ""))


def controlla_messaggi(testo, msgs):
    """[(q, motivo)] dei messaggi senza riga o senza esito (almeno 2 parole dopo «→»)."""
    m = re.search(rf"^## {re.escape(SEZ_MSG)}[^\n]*\n(.*?)(?=^## |\Z)", testo, re.M | re.S)
    sez = m.group(1).splitlines() if m else []
    male = []
    for q, t in msgs:
        testa = testa_msg(q, t)
        riga = next((r for r in sez if r.startswith(testa)), None)
        if riga is None:
            male.append((q, "manca"))
        elif len(riga[len(testa):].split()) < 2:
            male.append((q, "senza esito"))
    return male


def senza_sezione_msg(testo):
    return re.sub(rf"^## {re.escape(SEZ_MSG)}[^\n]*\n.*?(?=^## |\Z)", "", testo, flags=re.M | re.S)


def titolo_breve(segno, icona, catena, cosa):
    """Titolo «<segno della catena> <icona> <Nome> <numero> · <cosa fa>» (kit 30.7, Mario 1/11 00:15): `catena` è
    «Principale 467» o «Dov'è 8»; il «cosa fa» tiene al massimo 3 parole e ~20 caratteri (si taglia solo lui, mai il
    numero). Forma giusta controllata anche da `.claude/hooks/titolo-forma.py`."""
    testa = f"{segno} {icona} {catena} · "
    parole = " ".join(cosa.split()).split(" ")[:3]
    cosa = " ".join(parole)
    spazio = max(8, min(TETTO_COSA, TETTO_TITOLO - len(testa)))
    if len(cosa) > spazio:
        cosa = cosa[:spazio - 1].rstrip(" ,;:·-") + "…"
    return testa + cosa


def aspetta_mario():
    """→ le righe «- …» della sezione «## 0. Aspetta Mario» di Da fare (C369); [] se manca."""
    try:
        testo = leggi(DA_FARE)
    except OSError:
        return []
    righe, dentro = [], False
    for riga in testo.split("\n"):
        if riga.startswith("## "):
            dentro = riga.startswith(SEZIONE_0)
        elif dentro and riga.lstrip().startswith("- "):
            righe.append(riga.strip())
    return righe


def della_principale(riga):
    """→ True se la riga di «Aspetta Mario» è della catena Principale («🟡 Principale 466»; prima `⭐NN` o `#NN`), non di
    un'altra catena («🟨 Dov'è 8», prima `PNN`)."""
    return bool(re.search(r"(?:^|[\s·])(?:#|⭐|Principale )\d+\b", riga))


def sostituisci_sezione(testo, titolo, corpo):
    """Rimpiazza la sezione «## titolo» (fino al prossimo «## » o alla fine); se manca, la aggiunge in fondo."""
    forma = re.compile(rf"^## {re.escape(titolo)}[^\n]*\n.*?(?=^## |\Z)", re.M | re.S)
    nuovo = f"## {titolo}\n{corpo.rstrip()}\n\n"
    if forma.search(testo):
        return forma.sub(lambda _: nuovo, testo, count=1)
    return testo.rstrip("\n") + "\n\n" + nuovo


STRADE = "Strade provate e scartate"


def strade_scartate(testo):
    """C352 (ricerca 30/10: gli esperti la tengono sempre): la sezione «## Strade provate e scartate» c'è sempre,
    prima dei «Prossimi passi». Se manca la aggiunge vuota («- Nessuna.»); se c'è non la tocca (giudizio della sessione)."""
    if re.search(rf"^## {STRADE}", testo, re.M):
        return testo
    sezione = f"## {STRADE} (perché; così la prossima non le rifà)\n- Nessuna.\n\n"
    m = re.search(r"^## [^\n]*Prossimi passi", testo, re.M)
    if m:
        return testo[:m.start()] + sezione + testo[m.start():]
    return testo.rstrip("\n") + "\n\n" + sezione


def stato_primo_punto(testo, intestazione, punto):
    """Rinomina l'intestazione «## Stato …» e rimpiazza (o inserisce) il primo punto «- Ramo comune …»."""
    forma = re.compile(r"^## Stato[^\n]*\n((?:- Ramo comune[^\n]*\n)?)", re.M)
    if not forma.search(testo):
        return testo + f"\n## Stato ({intestazione})\n- {punto}\n"
    return forma.sub(lambda _: f"## Stato ({intestazione})\n- {punto}\n", testo, count=1)


def fatti(args):
    ramo = ramo_di_lavoro()
    testo = leggi(CONSEGNE)
    n = numero_sessione(testo, args.id)
    if n is None:
        print("FALSO: in docs/PASSAGGIO-CONSEGNE.md manca la riga «Sessione attuale: #N»")
        return 1
    nuovo = n + 1
    adesso = ora_italiana()
    quando = adesso.strftime("%d/%m %H:%M")
    run(["git", "fetch", "-q", "origin", ramo])
    allineato = git("rev-parse", "HEAD") == git("rev-parse", f"origin/{ramo}")
    liv, liv_nome = impegno()
    motore = motore_vero(args)
    motore_nome = MOTORI.get(motore, motore or "?")
    catena = args.catena
    apre = args.apre or ("mario" if catena >= 8 else "claude")
    chi_apre = (f"la apre la #{n} con `create_session` (catena {catena} di 8)" if apre == "claude"
                else f"la apre Mario (catena a {catena} di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`")
    sigla = f" `{args.id}`" if args.id else ""

    testo = re.sub(r"^Sessione attuale: #\d+[^\n]*$",
                   f"Sessione attuale: #{nuovo} (dopo la #{n}{sigla}, chiusa alla soglia {quando}; {chi_apre}).",
                   testo, count=1, flags=re.M)
    punto = (f"Ramo comune {'= origin' if allineato else '≠ origin: PUSH DA FARE'} (verifica: `git rev-parse HEAD` = "
             f"`origin/{ramo}`). {maiuscola(giri_in_corso())}. {maiuscola(pr_aperte())}.{frase_versione()}")
    scorte = scorte_non_unite(ramo)
    if scorte:
        punto += " Scorte NON unite: " + ", ".join(scorte) + "."
    testo = stato_primo_punto(testo, f"{quando} ora italiana", punto)
    testo = strade_scartate(testo)
    riga = riga_liberi(numeri_liberi(ramo))
    if re.search(r"^Prossimo E libero:", testo, re.M):
        testo = re.sub(r"^Prossimo E libero:[^\n]*$", lambda _: riga, testo, count=1, flags=re.M)
    else:
        testo = sostituisci_sezione(testo, "Numeri liberi", riga)
    # E277 (Mario 03/11 11:38): niente avviso a Mario sull'impegno; la sessione nuova eredita motore e impegno.
    motore_sez = (f"Motore: **{motore or '?'}** ({motore_nome}) · impegno **{liv_nome}** (`{liv or '?'}`, dal registro della sessione): "
                  "la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).")
    testo = sostituisci_sezione(testo, "Motore e forza di pensiero", motore_sez)
    msgs = miei_messaggi(sessione_mia())  # C469 fase 1: ogni messaggio della sessione, con l'esito
    testo = sostituisci_sezione(testo, SEZ_MSG, corpo_messaggi(testo, msgs)) if msgs else testo
    scrivi(CONSEGNE, testo)

    aspetta = aspetta_mario()
    sue = [r for r in aspetta if della_principale(r)]
    # E245 (Mario 1/11 01:45): la sessione nuova parte sempre verde (lavora), anche con righe sue in «Aspetta Mario».
    titolo = titolo_breve("🟢", ICONA, f"Principale {nuovo}", args.prossimo or "(scrivilo)")
    if "fable" in motore.lower():  # C472: la nuova aspetta Mario (Fable) → giallo
        titolo = titolo_breve("🟡", ICONA, f"Principale {nuovo}", f"metti Fable {liv_nome}".rstrip(" ?"))
    prossima = f"""# Prossima sessione

La scrive la sessione che chiude, nello stesso commit delle consegne (skill `consegne`, fase 5; righe di fatto da `tools/consegne.py`). Di solito la apre Claude con `create_session`; Mario la apre da qui solo a 8 della catena o al cambio account (i suoi passi: `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

Scritta da: #{n} per la #{nuovo} · {adesso.strftime('%d/%m/%Y')} · {chi_apre}, motore {motore_nome}, impegno {liv_nome}.

- Dove: https://claude.ai/code → repo `{REPO}`, ramo `{ramo}`
- Motore: {motore_nome} · impegno {liv_nome} (C474: uguali alla sessione che chiude; aperta da Mario: li sceglie lui così)

## Titolo
{titolo}

## Testo da incollare
```
{con_fermo_fable("[AVVIO] ", motore, liv_nome, perche_fable(args))}Sessione #{nuovo} di {NOME} (repo {REPO}, ramo {ramo}): git fetch origin {ramo} && git merge --ff-only origin/{ramo} (se «HEAD detached», prima git checkout {ramo}).
Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md; continua da sola dai «Prossimi passi».
```
"""
    scrivi(PROSSIMA, prossima)
    print(f"Scritto: {CONSEGNE} (Sessione attuale #{nuovo}, Stato, Strade scartate, Motore, numeri liberi) e {PROSSIMA} (titolo: {titolo}).")
    print(riga)
    print(f"Aspetta Mario: {len(aspetta)} righe in «{SEZIONE_0}» (della principale: {len(sue)}"
          + "; la nuova parte comunque 🟢, E245). Restano lì finché Mario non risponde (C369).")
    msg = messaggi_dopo_consegne(args.registro)
    print(f"Messaggi di Mario dopo l'ultimo commit delle consegne: {len(msg)} (controllo Da fare: confrontali con docs/DA-FARE.md).")
    for q, t in msg:
        print(f"  - {q}: {t[:200]}")
    return 0


def nome_file_catena(nome):
    """«Dov'è» → DOVE, «Magazzini» → MAGAZZINI: il pezzo del nome di docs/CONSEGNE-PARALLELA-<NOME>.md."""
    piatto = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Za-z0-9]", "", piatto).upper()


def catena_chi_fa_cosa(nome):
    """La riga «## Catene» di docs/CHI-FA-COSA.md di quella catena ({nome, numero, segni, ids, attiva, chiusa}), o None."""
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        from scorta import catene
        return next((c for c in catene(CWD) if c["nome"].lower() == nome.lower()), None)
    except Exception:  # noqa: BLE001
        return None


def numero_catena(nome, testo):
    """Numero della sessione aperta della catena: da docs/CHI-FA-COSA.md, sennò dal primo «## Stato (<Nome> N» delle consegne."""
    c = catena_chi_fa_cosa(nome)
    if c and str(c["numero"]).isdigit():
        mio = numeri_della_riga(nome).get(id_corto_mio())  # Risparmio 31: la riga può avere un «Numero» non mio
        return (mio if mio is not None else int(c["numero"])), c
    m = re.search(rf"^## Stato \({re.escape(nome)} (\d+)", testo, re.M)
    return (int(m.group(1)) if m else None), c


def numeri_della_riga(nome):
    """{id corto: numero} della riga «## Catene» di docs/CHI-FA-COSA.md: «Numero» per la prima sessione, «N = `session_…`»
    per le altre (Risparmio 29→31, 18/11: due account nella stessa riga, il 30 era già usato)."""
    try:
        testo = leggi(CHI_FA_COSA)
    except OSError:
        return {}
    riga = next((r for r in testo.splitlines() if r.startswith(f"| {nome} |")), "")
    celle = [x.strip() for x in riga.strip().strip("|").split("|")]
    if len(celle) < 5:
        return {}
    out = {}
    for num, sid in re.findall(r"(?:(\d+) = )?`session_([A-Za-z0-9]{12,})", celle[4]):
        corto = re.sub(r"^(session|cse)_", "", sid)[:12]
        if num:
            out.setdefault(corto, int(num))
        elif celle[3].isdigit() and not out:
            out[corto] = int(celle[3])
    return out


def numero_nuovo(nome, n):
    """Numero libero per la sessione nuova: oltre il mio e ogni numero già scritto nella riga della catena."""
    return max([n] + list(numeri_della_riga(nome).values())) + 1


def fatti_parallela(args):
    """C450 (proposta 7): le righe di fatto delle consegne di una catena parallela, scritte dal programma."""
    nome = args.parallela
    file = CONSEGNE_PAR.format(nome_file_catena(nome))
    ramo = ramo_di_lavoro()
    try:
        testo = leggi(file)
    except OSError:
        print(f"FALSO: manca {file} (le consegne della catena «{nome}»)")
        return 1
    n, c = numero_catena(nome, testo)
    if n is None:
        print(f"FALSO: numero della catena «{nome}» non trovato (docs/CHI-FA-COSA.md «## Catene» o «## Stato ({nome} N» in {file})")
        return 1
    nuovo = numero_nuovo(nome, n)
    adesso = ora_italiana()
    quando = adesso.strftime("%d/%m %H:%M")
    run(["git", "fetch", "-q", "origin", ramo])
    allineato = git("rev-parse", "HEAD") == git("rev-parse", f"origin/{ramo}")
    liv, liv_nome = impegno()
    motore = motore_vero(args)
    motore_nome = MOTORI.get(motore, motore or "?")
    catena = args.catena
    apre = args.apre or ("mario" if catena >= 8 else "claude")
    chi_apre = (f"la apre la {nome} {n} con `create_session` (catena {catena} di 8)" if apre == "claude"
                else f"la apre Mario (catena a {catena} di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`")
    sigla = f" `{args.id}`" if args.id else ""
    punto = (f"Ramo comune {'= origin' if allineato else '≠ origin: PUSH DA FARE'} (verifica: `git rev-parse HEAD` = "
             f"`origin/{ramo}`). {maiuscola(giri_in_corso())}. {maiuscola(pr_aperte())}.{frase_versione()}")
    scorte = scorte_non_unite(ramo, "parallela")
    if scorte:
        punto += " Scorte NON unite: " + ", ".join(scorte) + "."
    blocco = (f"## Stato ({nome} {n}{sigla}, {quando} ora italiana, chiusa alla soglia; {chi_apre})\n- {punto}\n"
              f"- (qui le righe di giudizio della {nome} {n}: fatto, provato, dove si verifica)\n\n")
    gia = re.search(rf"^## Stato \({re.escape(nome)} {n}\b[^\n]*\n- [^\n]*\n", testo, re.M)
    if gia:  # Risparmio 18: rilanciato (es. messaggio di Mario dopo l'handoff) → aggiorna la riga di fatto, niente doppione
        testa = blocco.split("\n- (qui le righe")[0] + "\n"
        testo = testo[:gia.start()] + testa + testo[gia.end():]
    else:
        m = re.search(r"^## Stato[^\n]*\n", testo, re.M) or re.search(r"^## [^\n]*Prossimi passi", testo, re.M)
        testo = (testo[:m.start()] + blocco + testo[m.start():]) if m else testo.rstrip("\n") + "\n\n" + blocco
    testo = strade_scartate(testo)
    motore_sez = (f"Motore: **{motore or '?'}** ({motore_nome}) · impegno **{liv_nome}** (`{liv or '?'}`, dal registro della sessione): "
                  "la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).")
    testo = sostituisci_sezione(testo, "Motore e forza di pensiero", motore_sez)
    segno = (c["segni"][0] if c and c.get("segni") else "📗")
    titolo = titolo_breve(segno, ICONA, f"{nome} {nuovo}", args.prossimo or "(scrivilo)")
    testo_avvio = (f"[AVVIO] Sei la chat parallela {nome} {nuovo} di {NOME}, linea «{nome}» (ramo {ramo}). git fetch origin {ramo} && "
                   f"git merge --ff-only origin/{ramo} (se «HEAD detached» prima git checkout {ramo}). Leggi CLAUDE.md, docs/ERRORI.md e "
                   f"le tue consegne {file} (leggi i file solo a blocchi con grep -n e sed -n, mai interi); continua da sola dai «Prossimi passi».")
    if con_scheda(nome):  # C469 fase 3 (rapporto 11 voce 4): niente fetch doppio, CLAUDE.md già caricato, un passo solo
        testo_avvio = (f"[AVVIO] Sei la chat parallela {nome} {nuovo} di {NOME}, linea «{nome}» (ramo {ramo}; se «HEAD detached» prima "
                       f"git checkout {ramo}). Primo passo, due comandi nello stesso messaggio: python3 -I tools/consegne.py avvio "
                       f"--parallela {nome} (scheda d'avvio: allinea il ramo, messaggi di Mario dopo il passaggio, Aspetta Mario, "
                       f"promesse, chi fa cosa; «SCHEDA NON GENERATA» → leggi i file che dice) e cat docs/ERRORI.md {file}. "
                       "CLAUDE.md è già caricato; gli altri file solo a blocchi con grep -n e sed -n. Continua da sola dai «Prossimi passi».")
    testo_avvio = con_fermo_fable(testo_avvio, motore, liv_nome, perche_fable(args))
    if "fable" in motore.lower():  # C472: la nuova aspetta Mario (Fable) → segno giallo della catena
        giallo = c["segni"][1] if c and len(c.get("segni") or []) > 1 else "📒"
        titolo = titolo_breve(giallo, ICONA, f"{nome} {nuovo}", f"metti Fable {liv_nome}".rstrip(" ?"))
    apertura = (f"{chi_apre}. Scritto da {nome} {n} il {adesso.strftime('%d/%m/%Y')} (righe di fatto da `tools/consegne.py fatti --parallela`).\n\n"
                f"Titolo: `{titolo}`\n\nTesto da incollare:\n```\n{testo_avvio}\n```")
    testo = sostituisci_sezione(testo, "Testo per aprire la", apertura)
    testo = re.sub(r"^## Testo per aprire la\n", f"## Testo per aprire la {nome} {nuovo}\n", testo, count=1, flags=re.M)
    msgs = miei_messaggi(sessione_mia())  # C469 fase 1: ogni messaggio della sessione, con l'esito
    testo = sostituisci_sezione(testo, SEZ_MSG, corpo_messaggi(testo, msgs)) if msgs else testo
    scrivi(file, testo)
    print(f"Scritto: {file} (blocco «## Stato ({nome} {n} …)» in cima con la riga di fatto, Motore, «Testo per aprire la {nome} {nuovo}»; titolo: {titolo}).")
    print(riga_liberi(numeri_liberi(ramo)))
    aspetta = [r for r in aspetta_mario() if re.search(rf"\b{re.escape(nome)} \d+\b", r)]
    print(f"Aspetta Mario: {len(aspetta)} righe della catena «{nome}» in «{SEZIONE_0}» (la nuova parte comunque 🟢, E245).")
    msg = messaggi_dopo_consegne(args.registro, file)
    print(f"Messaggi di Mario (chat parallela) dopo l'ultimo commit di {file}: {len(msg)} (confrontali con docs/DA-FARE.md, C291).")
    for q, t in msg:
        print(f"  - {q}: {t[:200]}")
    return 0


# C469 fase 3 (rapporto 11 §3): scheda d'avvio a perdita zero, IN PROVA. Prende sezioni intere, mai frasi; filtra per
# ORA, mai per catena; un dato che manca = «leggi tutto». Quali catene la usano lo dice il progetto (C511 p.23: prima era
# fisso il nome «Risparmio» del progetto fonte, che negli altri progetti non c'è): .claude/progetto.json «scheda_avvio».


def con_scheda(nome):
    """La catena parallela si apre con la scheda d'avvio? .claude/progetto.json «scheda_avvio»: elenco di nomi o "tutte";
    senza, nessuna (nel progetto fonte le altre catene la avranno solo dopo 3 passaggi col quiz 10/10, C70)."""
    v = impostazione("scheda_avvio", [])
    return v == "tutte" or (isinstance(v, list) and nome in v)


SKILL_CONSEGNE = ".claude/skills/consegne/SKILL.md"
CHI_FA_COSA = "docs/CHI-FA-COSA.md"
SCHEDA_MSG_MAX = 6000   # caratteri dei messaggi: oltre, in un file da leggere intero (mai tagli)
SCHEDA_MAX = 24000      # caratteri dell'uscita: oltre, la scheda intera in un file (Bash taglia le uscite a ~30.000)
MARGINE_MIN = 5         # minuti prima del passaggio: meglio contare un messaggio in più che perderne uno


def ora_passaggio(testo, file, nome):
    """Da quando contare i messaggi (datetime italiano): la più vecchia fra l'ora della prima testata «## Stato (<Nome> N
    …, gg/mm HH:MM ora italiana» e l'ultimo commit del file, meno MARGINE_MIN minuti; None se non c'è nessuna delle due."""
    adesso, candidati = ora_italiana(), []
    m = re.search(rf"^## Stato \({re.escape(nome)} \d+[^\n]*?(\d{{2}})/(\d{{2}}) (\d{{2}}):(\d{{2}}) ora italiana", testo, re.M)
    if m:
        g, mese, h, mi = map(int, m.groups())
        try:
            d = adesso.replace(month=mese, day=g, hour=h, minute=mi, second=0, microsecond=0)
            candidati.append(d.replace(year=d.year - 1) if d > adesso + datetime.timedelta(days=1) else d)
        except ValueError:
            pass
    quando = git("log", "-1", "--format=%ct", "HEAD", "--", file)
    if quando.isdigit():
        candidati.append(ora_italiana(datetime.datetime.fromtimestamp(int(quando), datetime.timezone.utc)))
    return (min(candidati) - datetime.timedelta(minutes=MARGINE_MIN)) if candidati else None


def allinea_ramo(ramo):
    """Fetch e, se il ramo è solo indietro, merge --ff-only: la sessione vecchia spinge ancora DOPO l'avvio della nuova
    (Risparmio 12: CHI-FA-COSA arrivato dopo l'hook). → riga di stato (mai cancella né riscrive)."""
    if git("symbolic-ref", "-q", "--short", "HEAD") != ramo:
        return f"FALSO: non sei sul ramo {ramo} (prima git checkout {ramo})"
    if run(["git", "fetch", "-q", "origin", ramo], timeout=60)[0]:
        return "FALSO: git fetch non riuscito (il ramo può essere vecchio: riprova prima di lavorare)"
    dietro = git("rev-list", "--count", f"HEAD..origin/{ramo}") or "0"
    avanti = git("rev-list", "--count", f"origin/{ramo}..HEAD") or "0"
    if dietro == "0":
        return "ramo allineato a GitHub" + (f" ({avanti} commit tuoi da spingere)" if avanti != "0" else "")
    if avanti != "0":
        return f"FALSO: ramo diverso da GitHub ({dietro} dietro, {avanti} avanti): merge normale prima di lavorare"
    rc, out = run(["git", "merge", "-q", "--ff-only", f"origin/{ramo}"])
    return (f"ramo allineato a GitHub (+{dietro} commit arrivati dopo l'avvio, uniti)" if rc == 0
            else f"FALSO: merge --ff-only non riuscito ({out[:150]}): ramo vecchio, sistemalo prima di lavorare")


def testi_dei_messaggi(dopo_ts):
    """[(origine, testo)] di tutti i posti dove sta un messaggio di Mario: archivio e registri del ramo, file locali della
    scorta e gli stessi file nelle scorte su origin aggiornate dopo il passaggio (un messaggio può stare solo lì)."""
    sc = _scorta()
    arch = sorted(os.path.relpath(p, CWD) for p in glob.glob(os.path.join(CWD, sc.ARCHIVIO, "*.md")))
    testi = []
    for rel in arch + list(sc.FILE_REGISTRO.values()):
        try:
            testi.append((rel, leggi(rel)))
        except OSError:
            pass
    gitdir = git("rev-parse", "--absolute-git-dir")
    for f in ("scorta-archivio.md", "scorta-registro.md"):
        try:
            with open(os.path.join(gitdir, f), encoding="utf-8") as fh:
                testi.append((f".git/{f}", fh.read()))
        except OSError:
            pass
    for riga in git("for-each-ref", "--format=%(refname:short) %(committerdate:unix)", "refs/remotes/origin/").splitlines():
        rif, _, t = riga.rpartition(" ")
        if "scorta-" not in rif or not t.isdigit() or int(t) < dopo_ts:
            continue
        nomi = git("ls-tree", "--name-only", rif, sc.ARCHIVIO + "/").split() + list(sc.FILE_REGISTRO.values())
        for rel in nomi:
            rc, out = run(["git", "show", f"{rif}:{rel}"])
            if rc == 0:
                testi.append((f"{rif}:{rel}", out))
    return testi


def sezione_intera(testo, titolo):
    """La sezione «## titolo…» intera (testata compresa, fino al prossimo «## »), o ''."""
    m = re.search(rf"^## {re.escape(titolo)}[^\n]*\n.*?(?=^## |\Z)", testo, re.M | re.S)
    return m.group(0).rstrip() if m else ""


def kb(rel):
    try:
        return f"{len(leggi(rel)) // 1000} KB"
    except OSError:
        return "manca"


def scheda_avvio(args):
    """C469 fase 3: la scheda d'avvio di una catena parallela; il codice sta in tools/consegne_scheda.py (E358)."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import consegne_scheda
    return consegne_scheda.scheda_avvio(args, sys.modules[__name__])


def termini_fuori(chiave, fonti):
    """E350: i termini precisi della chiave del quiz (fra `…` e codici E, C, P) che non stanno nei file letti all'avvio.
    Un percorso vale anche col solo nome del file («tools/x.py» → «x.py»)."""
    termini = set(re.findall(r"`([^`\n]+)`", chiave)) | set(re.findall(r"\b[ECP]\d{2,4}\b", chiave))
    mancano = []
    for t in sorted(termini):
        base = t.rstrip("/").rsplit("/", 1)[-1] or t
        if t not in fonti and base not in fonti:
            mancano.append(t)
    return mancano


def controlla_quiz(parallela, n, testo):
    """E350 (Risparmio 21: 7,5/10, chiave con 5 fatti mai scritti nelle consegne; già alla 18): la chiave del quiz
    della sessione dopo chiede solo ciò che la nuova legge all'avvio. Nessuna chiave → nessun controllo (None)."""
    if n is None:
        return None
    nn = numero_nuovo(parallela, n)
    rel = QUIZ_CHIAVE.format(nome_file_catena(parallela).lower(), nn)
    if not os.path.exists(os.path.join(CWD, rel)):
        return None
    fonti = testo + "".join(leggi(f) for f in FONTI_QUIZ if os.path.exists(os.path.join(CWD, f)))
    mancano = termini_fuori(leggi(rel), fonti)
    nome = f"chiave del quiz {parallela} {nn} solo da fatti scritti nelle consegne, ERRORI e regole (E350)"
    if mancano:
        nome += f": mancano {', '.join(mancano[:8])} → scrivili nelle consegne o toglili dalla chiave, poi rifai"
    return nome, not mancano


FOTO_CHIESTE = os.path.join(".claude", "hooks", "foto-chieste.py")


def foto_aperte():
    """C516 B2 (Mario 19/11 17:45 «continua da solo», domanda 1 → 1): niente handoff con foto o video di questa sessione
    in archivio/ non mandati a Mario e senza riga in «## 0. Aspetta Mario». → (nome, ok); hook assente o lancio rotto = VERO."""
    nome = "nessuna foto o video di questa sessione non mandato e senza riga in «Aspetta Mario» (C516)"
    hook = os.path.join(CWD, FOTO_CHIESTE)
    if not os.path.isfile(hook):
        return (nome, True)
    cmd = [sys.executable, "-I", hook, "--aperte"]
    try:
        cmd += ["--trascrizione", registro_mio()]
    except ValueError:
        pass
    try:
        r = subprocess.run(cmd, cwd=CWD, env=dict(os.environ, CLAUDE_PROJECT_DIR=CWD), capture_output=True, text=True,
                           timeout=30)
    except (OSError, subprocess.SubprocessError):
        return (nome, True)
    righe = r.stdout.strip().splitlines()[:3]
    # FALSO solo con cartelle elencate (uscita 1 e righe): un hook che non parte (es. errore dopo un merge sporco) esce 1
    # muto e non deve fermare l'handoff a torto (collaudo di Fable, 19/11).
    return (nome + (": " + "; ".join(righe) if righe else ""), not (r.returncode == 1 and righe))


def controlla(args):
    ramo = ramo_di_lavoro()
    run(["git", "fetch", "-q", "origin", ramo])
    esiti = []
    esiti.append(("push confermato: HEAD = origin/" + ramo, git("rev-parse", "HEAD") == git("rev-parse", f"origin/{ramo}") != ""))
    esiti.append(("niente modifiche pendenti", git("status", "--porcelain") == ""))
    parallela = getattr(args, "parallela", "")
    consegne = CONSEGNE_PAR.format(nome_file_catena(parallela)) if parallela else CONSEGNE
    ruolo = "parallela" if parallela else "principale"
    testo = leggi(consegne)
    prossima = leggi(PROSSIMA) if os.path.exists(os.path.join(CWD, PROSSIMA)) and not parallela else ""
    esiti.append(("niente segni di conflitto nei documenti", "<<<<<<<" not in testo + prossima and ">>>>>>>" not in testo + prossima))
    if parallela:
        n, _ = numero_catena(parallela, testo)
        nn = numero_nuovo(parallela, n) if n is not None else None
        esiti.append((f"«Testo per aprire la {parallela} {nn if nn is not None else '?'}» nelle consegne della catena",
                      nn is not None and f"## Testo per aprire la {parallela} {nn}" in testo and f"{parallela} {nn} di {NOME}" in testo))
        quiz = controlla_quiz(parallela, n, testo)
        if quiz:
            esiti.append(quiz)
    else:
        n = numero_sessione(testo)
        esiti.append(("numero nuovo uguale nelle consegne e in PROSSIMA-SESSIONE", n is not None and f"#{n} " in prossima))
    # C483 (Mario 12/11 ~20:10): nel testo che la sessione nuova riceve, la parola accende la modalità «un copione per
    # ogni lavoro» della piattaforma → mai lì; i copioni si decidono caso per caso.
    avvio = (sezione_intera(testo, f"Testo per aprire la {parallela}") if parallela
             else sezione_intera(prossima, "Testo da incollare"))
    esiti.append(("testo d'avvio senza la parola «ultra-code» (C483)", bool(avvio) and not PAROLA_VIETATA.search(avvio)))
    parole = len(senza_sezione_msg(testo).split())  # la sezione dei messaggi la scrive lo script: non conta
    esiti.append((f"consegne entro {MAX_PAROLE} parole ({parole})", parole <= MAX_PAROLE))
    esiti.append(("3 righe fisse presenti", all(k in testo for k in ("Già deciso da Mario", "Da non rifare", "Cosa preme a Mario"))))
    esiti.append(("impegno noto (registro della sessione o .claude/settings.json)", bool(impegno()[0])))
    msg = messaggi_dopo_consegne(args.registro, consegne)
    compatto = lambda s: re.sub(r"\s+", " ", s).strip().lower()
    ultimo = compatto(msg[-1][1])[:60] if msg else ""
    # parola per parola, ma un refuso corretto («ka» → «la») non deve fermare l'handoff: somiglianza ≥ 85%
    dentro = compatto(testo)
    dove = dentro.find(ultimo[:20]) if ultimo else -1
    simile = dove >= 0 and difflib.SequenceMatcher(None, ultimo, dentro[dove:dove + len(ultimo)]).ratio() >= 0.85
    esiti.append(("ultimo messaggio di Mario dentro le consegne" + (f" («{ultimo[:25]}…»)" if ultimo else " (nessuno nuovo)"),
                  (not ultimo) or simile))
    esiti.append(("nessuna scorta non unita", not scorte_non_unite(ramo, ruolo)))
    mio = sessione_mia()
    male = controlla_messaggi(testo, miei_messaggi(mio))
    esiti.append((f"ogni messaggio di Mario di questa sessione nelle consegne, con l'esito dopo «→» (C469)"
                  + (f": {', '.join(f'{q} {m}' for q, m in male[:5])}" if male else "")
                  + ("" if mio else " (sessione non nota: non controllato)"), not male))
    esiti.append(foto_aperte())
    tutto_vero = True
    for nome, ok in esiti:
        print(f"{'VERO ' if ok else 'FALSO'}: {nome}")
        tutto_vero &= bool(ok)
    print("Tutto vero: apri la sessione nuova." if tutto_vero else "Un controllo è FALSO: fermati e scrivi a Mario (fase 4).")
    return 0 if tutto_vero else 1


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cosa", required=True)
    f = sub.add_parser("fatti")
    f.add_argument("--id", default="")
    f.add_argument("--motore", default="")
    f.add_argument("--catena", type=int, default=None, help="C511 p.20: obbligatorio, posto nella catena di 8 (lineage)")
    f.add_argument("--prossimo", default="")
    f.add_argument("--fable", default="", help="C504: chiudendo con Fable, perché la sessione dopo ha bisogno di Fable")
    f.add_argument("--apre", choices=("claude", "mario"), default="")
    f.add_argument("--registro", default="")
    f.add_argument("--parallela", default="", help="C450: nome della catena parallela (Magazzini, Dov'è…)")
    c = sub.add_parser("controlla")
    c.add_argument("--registro", default="")
    c.add_argument("--parallela", default="")
    sub.add_parser("miei", help="C469: tutti i messaggi di Mario di questa sessione, interi (dopo una compressione)")
    a = sub.add_parser("avvio", help="C469 fase 3: scheda d'avvio di una catena parallela (quali: .claude/progetto.json)")
    a.add_argument("--parallela", required=True)
    args = p.parse_args(argv)
    if args.cosa == "miei":
        return stampa_miei()
    if args.cosa == "avvio":
        return scheda_avvio(args)
    args.registro = args.registro or (REGISTRO_PAR if args.parallela else REGISTRO)
    if args.cosa == "fatti":
        if args.catena is None or not 1 <= args.catena <= 8:  # C511 p.20; collaudo 38.52: mai il numero della sessione
            print("FALSO: manca --catena N, da 1 a 8 (posto della sessione che chiude nella catena di 8: «lineage» › «depth» "
                  "di get_session; NON il numero della sessione). Senza, a 8 di 8 scriverebbe «la apre Claude». Non ho scritto niente.")
            return 2
        return fatti_parallela(args) if args.parallela else fatti(args)
    return controlla(args)


if __name__ == "__main__":
    sys.exit(main())
