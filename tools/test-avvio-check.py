#!/usr/bin/env python3
# Prova di .claude/hooks/avvio-check.py col tetto dell'hook (Risparmio 13, 10/11): rete lenta all'avvio → l'hook veniva
# fermato a 90 s da Claude Code e l'avviso intero si perdeva. Qui un git finto si ferma sul fetch e il tetto è a 3 s:
# l'avviso deve uscire lo stesso, entro il tetto, con cosa manca e come rifarlo, e il segno «avvio-in-corso» tolto.
# Repo finto in una cartella temporanea: niente rete, niente push. Uso: python3 -I tools/test-avvio-check.py
import json, os, shutil, subprocess, sys, tempfile, time

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "avvio-check.py")
errori = 0


def controlla(cond, nome):
    global errori
    print(("ok   " if cond else "ERR  ") + nome)
    errori += 0 if cond else 1


def git(cwd, *a):
    return subprocess.run(["git", *a], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


with tempfile.TemporaryDirectory() as tmp:
    repo = os.path.join(tmp, "repo")
    os.makedirs(repo)
    git(repo, "init", "-q", "-b", "claude/prova")
    git(repo, "config", "user.email", "prova@example.com")
    git(repo, "config", "user.name", "prova")
    with open(os.path.join(repo, "a.txt"), "w") as f:
        f.write("a\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "primo")
    git(repo, "remote", "add", "origin", os.path.join(tmp, "non-serve.git"))
    finto = os.path.join(tmp, "git-lento")
    os.makedirs(finto)
    vero = shutil.which("git")
    with open(os.path.join(finto, "git"), "w") as f:
        f.write(f'#!/bin/sh\nfor a in "$@"; do [ "$a" = fetch ] && exec sleep 30; done\nexec {vero} "$@"\n')
    os.chmod(os.path.join(finto, "git"), 0o755)
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, PATH=finto + os.pathsep + os.environ.get("PATH", ""),
               AVVIO_TEMPO_HOOK="3")
    env.pop("CLAUDE_CODE_REMOTE_SESSION_ID", None)
    t0 = time.time()
    r = subprocess.run([sys.executable, "-I", HOOK], cwd=repo, input="{}", env=env, capture_output=True, text=True,
                       timeout=60)
    durata = time.time() - t0
    try:
        uscita = json.loads(r.stdout)["hookSpecificOutput"]["additionalContext"]
    except Exception:  # noqa: BLE001
        uscita = ""
    controlla(r.returncode == 0 and uscita != "", f"esce sempre con un avviso valido (uscita {r.returncode})")
    controlla(durata < 10, f"entro il tetto, non dopo i tentativi del fetch ({durata:.0f} s)")
    controlla(uscita.startswith("ATTENZIONE avvio lento") and "ramo fermato" in uscita
              and "non controllati: scorte, altri rami, messaggi di Mario, Aspetta Mario, promesse" in uscita,
              "dice quale passo si è fermato e cosa non ha controllato: " + uscita[:120])
    controlla("python3 -I .claude/hooks/avvio-check.py" in uscita, "dice come rifarlo")
    controlla(not os.path.exists(os.path.join(repo, ".git", "avvio-in-corso")), "segno «avvio-in-corso» tolto")
    controlla(git(repo, "config", "--get", "merge.scorta.driver") == "cp %B %A", "driver della scorta detto lo stesso")
    controlla(git(repo, "config", "--get", "merge.impostazioni.driver") == "python3 -I tools/unisci-json.py %O %A %B",
              "driver delle impostazioni detto lo stesso (E325)")

# Principale 573 (10/11): contenitore nuovo, ruolo non ancora salvato; la sessione è nella riga «Principale» della tabella
# «Catene» → l'avviso dei messaggi dopo l'handoff guarda solo il registro della principale (prima contava anche quello
# della parallela: «40 messaggi della chat parallela», falso allarme da ~3k token a ogni avvio della Principale).
with tempfile.TemporaryDirectory() as tmp:
    git(tmp, "init", "-q", "--bare", "origin.git")
    repo = os.path.join(tmp, "repo")
    os.makedirs(os.path.join(repo, "docs"))
    git(repo, "init", "-q", "-b", "claude/prova")
    git(repo, "config", "user.email", "prova@example.com")
    git(repo, "config", "user.name", "prova")
    git(repo, "remote", "add", "origin", os.path.join(tmp, "origin.git"))

    def scrivi(rel, testo, data=None):
        with open(os.path.join(repo, rel), "w", encoding="utf-8") as f:
            f.write(testo)
        git(repo, "add", "-A")
        env_data = dict(os.environ, GIT_COMMITTER_DATE=data, GIT_AUTHOR_DATE=data) if data else None
        subprocess.run(["git", "commit", "-q", "-m", rel], cwd=repo, env=env_data, check=True)

    scrivi("docs/PASSAGGIO-CONSEGNE.md", "consegne\n", "2020-01-01T00:00:00+0000")
    scrivi("docs/MESSAGGI-MARIO.md", "# Registro\n\n## 2099-01-01 10:00 · 01PRINCIPALE\nmio\n")
    scrivi("docs/CONSEGNE-PARALLELA-PROVA.md", "consegne della parallela\n")
    scrivi("docs/MESSAGGI-MARIO-PARALLELA.md", "# Registro\n\n## 2099-01-01 10:00 · 01PARALL0000\nd'altri\n")
    git(repo, "push", "-q", "-u", "origin", "claude/prova")
    env = dict(os.environ, CLAUDE_PROJECT_DIR=repo, CLAUDE_CODE_REMOTE_SESSION_ID="session_01PRINCIPALE0",
               AVVIO_TEMPO_HOOK="60")

    def avvio():
        r = subprocess.run([sys.executable, "-I", HOOK], cwd=repo, input="{}", env=env, capture_output=True, text=True,
                           timeout=120)
        try:
            return json.loads(r.stdout)["hookSpecificOutput"]["additionalContext"]
        except Exception:  # noqa: BLE001
            return r.stdout

    uscita = avvio()
    controlla("MESSAGGI DOPO L'HANDOFF della chat parallela" in uscita,
              "senza tabella «Catene» né ruolo salvato: conta anche la parallela (meglio contare di più)")
    scrivi("docs/CHI-FA-COSA.md", "# Chi fa cosa\n\n## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n"
           "|---|---|---|---|---|---|\n| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 5 | `session_01PRINCIPALE0` | — |\n\n## Lavori\n")
    git(repo, "push", "-q", "origin", "claude/prova")
    uscita = avvio()
    controlla("MESSAGGI DOPO L'HANDOFF della chat parallela" not in uscita
              and "MESSAGGI DOPO L'HANDOFF della chat principale: 1 dal 2020-01-01" in uscita,
              "Principale 573: sessione nella riga «Principale» → solo il registro della principale: " + uscita[:160])
    # C511 p.14: ramo di lavoro di un'altra chat (non una scorta) con lavoro nuovo → riga «ALTRI RAMI»; main, scorte e
    # rami fermi da oltre 7 giorni no
    for nome, data in (("claude/altra-chat", None), ("claude/chat-vecchia", "2020-02-01T00:00:00+0000"), ("main", None),
                       ("gh-pages", None), ("renovate/npm", None)):
        git(repo, "checkout", "-q", "-b", nome, "claude/prova")
        scrivi(f"docs/{nome.replace('/', '-')}.md", "lavoro\n", data)
        git(repo, "push", "-q", "origin", nome)
    git(repo, "checkout", "-q", "claude/prova")
    uscita = avvio()
    controlla("ALTRI RAMI con lavoro non nel ramo" in uscita and "origin/claude/altra-chat" in uscita
              and "chat-vecchia" not in uscita and "origin/main" not in uscita
              and "gh-pages" not in uscita and "renovate" not in uscita and "skill chat-parallela «Altri rami»" in uscita,
              "C511 p.14: il ramo recente di un'altra chat si vede; main e il ramo vecchio no: " + uscita[:300])

# E330 (rifatto 13/11, Giri 61): fetch fallito = file vecchi → niente 🛑 né «Aspetta Mario», una riga per rileggerle
with tempfile.TemporaryDirectory() as tmp:
    repo = os.path.join(tmp, "repo")
    os.makedirs(os.path.join(repo, "docs"))
    git(repo, "init", "-q", "-b", "claude/prova")
    git(repo, "config", "user.email", "prova@example.com")
    git(repo, "config", "user.name", "prova")
    git(repo, "remote", "add", "origin", os.path.join(tmp, "non-esiste.git"))
    with open(os.path.join(repo, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
        f.write("# Da fare\n\n## 0. Aspetta Mario\n- 12/11 · 🛑 · 🟢 Principale 603 · Minibar (C1). 📌 Di cosa parliamo: x\n")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "x")
    r = subprocess.run([sys.executable, "-I", HOOK], cwd=repo, input="{}", capture_output=True, text=True, timeout=120,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=repo, AVVIO_TEMPO_HOOK="60"))
    u = json.loads(r.stdout)["hookSpecificOutput"]["additionalContext"]
    controlla("fetch origin" in u and "LISTE NON STAMPATE" in u and "DECISIVE" not in u and "Minibar" not in u,
              "E330: fetch fallito → niente liste vecchie: " + u[:200])

# Giri 49 (Mario 12/11 12:3x «meno righe … ritorna una nuova … in ordine di sessione catena corrente poi le altre e di
# urgenza»): blocco «⚠️ Aspettano te» a turno, le prime 3; prima la mia catena, poi le altre; in ognuna 🛑, poi le più vecchie.
with tempfile.TemporaryDirectory() as tmp:
    os.makedirs(os.path.join(tmp, "docs"))
    with open(os.path.join(tmp, "docs", "CHI-FA-COSA.md"), "w", encoding="utf-8") as f:
        f.write("## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n|---|---|---|---|---|---|\n"
                "| Principale | cerchi | 🟢 🟡 🔴 ⚫ | 600 | `s` | — |\n| Dov'è | quadrati | 🟩 🟨 🟥 ⬛ | 50 | `s` | — |\n"
                "| Giri | libri | 📗 📒 📕 📓 | 49 | `s` | — |\n")
    da_fare = ("# Da fare\n\n## 0. Aspetta Mario\nUna riga per ogni cosa che aspetta Mario.\n"
               "- 10/11 · 🟡 Principale 590 · Colori del menu (C1). 📌 Di cosa parliamo: x. 1 · sì · 2 · no\n"
               "- 12/11 · 🛑 · 🟢 Principale 599 · Giornata nuova a schermo (C2). 📌 Di cosa parliamo: y\n"
               "- 11/11 · 📒 Giri 30 · PC di casa dopo una mancanza di corrente (C476): 1 sì · 2 no\n"
               "- 12/11 · 🛑 · 📒 Giri 48 · Versione 17 della macchina (C476). 📌 Di cosa parliamo: z\n"
               "- 09/11 · 🟨 Dov'è 50 · v151 online: in Dov'è sposta il pacco finito in Magazzino, poi visto\n"
               "\n## 1. Lavori\n- 01/11 · Giri 1 · questa NON è una riga di Aspetta Mario\n")
    with open(os.path.join(tmp, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
        f.write(da_fare)

    def blocco(*a):
        return subprocess.run([sys.executable, "-I", HOOK, "--aspettano", *a], cwd=tmp, capture_output=True, text=True,
                              env=dict(os.environ, CLAUDE_PROJECT_DIR=tmp), timeout=30).stdout.strip().split("\n")

    giri = blocco("Giri")
    controlla(giri[0] == "⚠️ Aspettano te: 5" and len(giri) == 5, "Giri: conto di tutte, 3 righe e il resto: " + repr(giri))
    controlla(giri[1].startswith("- 🛑 Giri 48 · Versione 17") and giri[2].startswith("- Giri 30 · PC di casa"),
              "Giri: prima la mia catena, la 🛑 in cima: " + repr(giri[1:3]))
    controlla(giri[3].startswith("- 🛑 Principale 599") and giri[4] == "- poi altre 2: tutte nell'Atlante › 📌 Bacheca",
              "Giri: poi le altre catene con la 🛑 prima, il resto contato: " + repr(giri[3:]))
    controlla(all("(C" not in r and "?" not in r for r in giri), "niente sigle tra parentesi né «?» nelle righe")
    principale = blocco("Principale", "2")
    controlla(principale[1].startswith("- 🛑 Principale 599") and principale[2].startswith("- Principale 590")
              and principale[3] == "- poi altre 3 (1 decisive 🛑): tutte nell'Atlante › 📌 Bacheca",
              "Principale, 2 righe: la sua 🛑, la sua più vecchia, poi il conto con le 🛑 nascoste: " + repr(principale))
    controlla(any(r.startswith("- Dov'è 50 · ") for r in blocco("Dov'è", "1")), "catena col nome con l'apostrofo")
    with open(os.path.join(tmp, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
        f.write(da_fare.replace("- 12/11 · 🛑 · 📒 Giri 48 · Versione 17 della macchina (C476). 📌 Di cosa parliamo: z\n", ""))
    controlla(blocco("Giri")[2].startswith("- 🛑 Principale 599"), "Mario risponde a una (riga tolta) → sale la successiva")
    BACHECA = os.path.join(os.path.dirname(HOOK), "..", "..", "tools", "atlante", "bacheca.mjs")
    if os.path.isfile(BACHECA):  # solo dove c'è la Bacheca dell'Atlante (nella prova del pacchetto no)
        # C518 (Bacheca 2): la riga con la sua scheda della 📌 Bacheca → numero B e titolo semplice; «📌» dentro il testo
        # («La «📌 Bacheca» vera…») non taglia più la riga a «La «».
        os.makedirs(os.path.join(tmp, "atlante"))
        os.makedirs(os.path.join(tmp, "tools", "atlante"))  # la regola sola delle schede (bacheca.mjs --titoli)
        shutil.copy(BACHECA, os.path.join(tmp, "tools", "atlante"))
        with open(os.path.join(tmp, "atlante", "bacheca.json"), "w", encoding="utf-8") as f:
            json.dump({"schede": {"B7": {"trova": "PC di casa dopo una mancanza", "titolo": "Il PC deve ripartire da solo?"},
                                  "B8": {"trova": "niente titolo"}, "X1": {"trova": "Colori", "titolo": "non è una B"}}}, f)
        con = blocco("Giri")
        controlla(con[1] == "- Giri 30 · B7 · Il PC deve ripartire da solo?", "C518: riga con la scheda: numero B e titolo: " + repr(con))
        controlla(con[2].startswith("- 🛑 Principale 599 · Giornata nuova"), "C518: senza scheda resta il testo corto: " + repr(con))
        with open(os.path.join(tmp, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
            f.write(da_fare.replace("Una riga per ogni cosa che aspetta Mario.\n", "Una riga per ogni cosa che aspetta Mario.\n"
                                    "- 01/11 · 📒 Giri 31 · La «📌 Bacheca» vera è pronta nell'Atlante: apri l'Atlante. 📌 Di cosa parliamo: w\n"))
        controlla(any(r.startswith("- Giri 31 · La «📌 Bacheca» vera è pronta nell") for r in blocco("Giri", "9")),
                  "C518: «📌» dentro il testo non taglia la riga: " + repr(blocco("Giri", "9")))
        os.remove(os.path.join(tmp, "atlante", "bacheca.json"))
        with open(os.path.join(tmp, "docs", "DA-FARE.md"), "w", encoding="utf-8") as f:
            f.write(da_fare.replace("- 12/11 · 🛑 · 📒 Giri 48 · Versione 17 della macchina (C476). 📌 Di cosa parliamo: z\n", ""))
    os.remove(os.path.join(tmp, "docs", "CHI-FA-COSA.md"))  # C511 p.13: progetto appena installato, senza la tabella
    senza = blocco("Principale")
    controlla(senza[0] == "⚠️ Aspettano te: 4" and senza[1].startswith("- 🛑 Principale 599") and len(senza) == 5,
              "C511 p.13: senza CHI-FA-COSA.md il blocco c'è lo stesso, catena Principale: " + repr(senza))

# C505: riga dei difetti dei giri lanciati da Mario (attrezzo del progetto, in sottofondo, al massimo il tetto)
import importlib.util
spec = importlib.util.spec_from_file_location("avvio_check", HOOK)
av = importlib.util.module_from_spec(spec)
spec.loader.exec_module(av)
# C518 (Bacheca 2): le risposte di Mario dall'Atlante (📌 Bacheca, 👁, idee) a ogni avvio; senza lo script o senza
# risposte niente riga; lunghe: tagliate col rimando al comando intero.
with tempfile.TemporaryDirectory() as tmp:
    av.CWD = tmp
    controlla(av.risposte_atlante() == "", "C518: senza tools/atlante/risposte.mjs niente riga")
    os.makedirs(os.path.join(tmp, "tools", "atlante"))
    finto = os.path.join(tmp, "tools", "atlante", "risposte.mjs")
    open(finto, "w").write("console.log(\"Nessuna risposta nuova di Mario dall'Atlante.\");\n")
    controlla(av.risposte_atlante() == "", "C518: nessuna risposta nuova = niente riga")
    open(finto, "w").write("if (process.argv[2] === 'nuove') console.log('Mario ha risposto dalla 📌 Bacheca alla B7: 1');\n")
    r = av.risposte_atlante()
    controlla(r.startswith("RISPOSTE DI MARIO DALL'ATLANTE (1,") and r.endswith("alla B7: 1"), "C518: la risposta arriva alla chat: " + r)
    open(finto, "w").write("for (let i = 0; i < 40; i++) console.log('Mario ha risposto dalla 📌 Bacheca alla B' + i + ': una risposta lunga di prova');\n")
    r = av.risposte_atlante()
    controlla(len(r) < 1800 and "(40," in r and r.endswith("node tools/atlante/risposte.mjs nuove)"), "C518: tante risposte: tagliate col rimando: " + r[-80:])
with tempfile.TemporaryDirectory() as tmp:
    av.CWD = tmp
    controlla(av.avvia_difetti() is None and av.riga_difetti(None) == "", "C505: senza l'attrezzo niente")
    os.makedirs(os.path.join(tmp, "tools"))
    finto = os.path.join(tmp, "tools", "difetti-dei-giri.py")
    open(finto, "w").write("import sys\nprint('🧠 Giri lanciati da Mario: 2 chiusi, 1 con difetti.' if sys.argv[1:] == ['--muto'] else 'no')\n")
    r = av.riga_difetti(av.avvia_difetti())
    controlla(r.startswith("🧠 Giri lanciati da Mario: 2 chiusi, 1 con difetti.") and "consegnati <id>" in r, "C505: riga e chi la prende: " + r)
    open(finto, "w").write("import time\ntime.sleep(5)\nprint('tardi')\n")
    t0 = time.time()
    controlla(av.riga_difetti(av.avvia_difetti(), tetto=1) == "" and time.time() - t0 < 4, "C505: oltre il tetto niente riga, non aspetta")
    open(finto, "w").write("")
    controlla(av.riga_difetti(av.avvia_difetti()) == "", "C505: niente stampato = niente riga")

# Codice 37 (20/11): tempo dell'avvio finito = git non risponde: l'elenco delle scorte non va scritto nella cartella
# da cui parte l'hook (radice del progetto: file non tracciato e avviso «untracked» alla fine del turno).
with tempfile.TemporaryDirectory() as tmp:
    prima = os.getcwd()
    os.chdir(tmp)
    try:
        vecchio = av.git
        av.git = lambda *a: ""
        r = av.scrivi_elenco(["uno", "due"])
        av.git = vecchio
        controlla(r == "non scritto" and os.listdir(tmp) == [], "Codice 37: senza cartella di git l'elenco non si scrive nella cartella di lavoro: " + repr((r, os.listdir(tmp))))
    finally:
        os.chdir(prima)

# C511 p.25: .gitattributes senza le righe dei driver → avviso; installa.py le scrive tutte
with tempfile.TemporaryDirectory() as tmp:
    av.CWD = tmp
    controlla("mancano 8 righe" in av.attributi_mancanti(), "C511 p.25: senza .gitattributes avviso con le 8 righe")
    INSTALLA = os.path.join(os.path.dirname(HOOK), "..", "..", "docs", "kit-progetto", "installa.py")
    if os.path.exists(INSTALLA):  # solo nel progetto fonte del kit: negli altri progetti installa.py non c'è
        spec2 = importlib.util.spec_from_file_location("installa", INSTALLA)
        ins = importlib.util.module_from_spec(spec2)
        spec2.loader.exec_module(ins)
        open(os.path.join(tmp, ".gitattributes"), "w").write(ins.SE_MANCANO[".gitattributes"])
        controlla(av.attributi_mancanti() == "", "C511 p.25: il .gitattributes dell'installazione ha tutte le righe")
    open(os.path.join(tmp, ".gitattributes"), "w").write("docs/ULTIMO-MESSAGGIO.md   merge=scorta\n")
    controlla("mancano 7 righe" in av.attributi_mancanti(), "C511 p.25: una riga c'è (spazi diversi), 7 mancano")
av.CWD = None
controlla(av.attributi_mancanti() == "" or "C511" in av.attributi_mancanti(), "repo vero letto")
# E391 (Risparmio 32, 18/11): la scorta della sessione precedente della MIA catena si unisce, quella di un'altra no.
catena = {"nome": "Prova", "ids": ["32mia", "31vecchia"], "attiva": "32mia"}  # colonna «Sessione»: la più nuova per prima
controlla(av.precedente_della_catena("31vecchia", "32mia", catena), "E391: precedente della mia catena → da unire")
controlla(not av.precedente_della_catena("altra", "32mia", catena), "E391: sessione fuori dalla catena → non unire")
controlla(not av.precedente_della_catena("32mia", "32mia", catena), "E391: la mia stessa sessione resta il caso «riavvio»")
controlla(not av.precedente_della_catena("31vecchia", "32mia", None), "E391: catena sconosciuta → avviso di prima")
controlla(av.sei_chiusa("32mia", catena) == "", "E503: sessione aperta della catena → nessun avviso «sei chiusa»")
# E503 (Principale 636, 19/11): la chat chiusa che si riavvia non deve prendere il lavoro della sessione DOPO.
dopo = {"nome": "Prova", "ids": ["33dopo", "32mia", "31vecchia"], "attiva": "33dopo"}
controlla(not av.precedente_della_catena("33dopo", "32mia", dopo), "E503: scorta della sessione DOPO la mia → non unire")
controlla(not av.precedente_della_catena("31vecchia", "32mia", dopo), "E503: io chiusa → nessuna scorta della catena da unire")
controlla(av.precedente_della_catena("32mia", "33dopo", dopo), "E503: la sessione aperta unisce la precedente")
controlla("SEI CHIUSA" in av.sei_chiusa("32mia", dopo) and "33dopo" in av.sei_chiusa("32mia", dopo), "E503: io chiusa → avviso con la sessione aperta")
chiusa = {"nome": "Prova", "ids": ["32mia"], "attiva": "", "chiusa": True}
controlla("nessuna (catena chiusa)" in av.sei_chiusa("32mia", chiusa), "E503: catena chiusa → avviso")
controlla(not av.precedente_della_catena("31vecchia", "32mia", chiusa), "E503: catena chiusa → niente da unire")
controlla(av.sei_chiusa("32mia", None) == "" and av.sei_chiusa("", dopo) == "", "E503: catena sconosciuta → nessun avviso")
print(f"ERRORI: {errori}")
sys.exit(1 if errori else 0)
