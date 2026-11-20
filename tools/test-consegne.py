#!/usr/bin/env python3
"""Prova di tools/consegne.py (C352): repo finto con origin, gh finto, poi «fatti» e «controlla».
Uso: python3 -I tools/test-consegne.py
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(QUI, "consegne.py")
ERRORI = 0


CONSEGNE_PAR = """# Consegne della chat parallela Prova

**Già deciso da Mario (non richiedere):** niente.
**Da non rifare:** niente.
**Cosa preme a Mario adesso:** la prova.

## Stato (Prova 3 `session_vecchia`, 29/10 10:00 ora italiana, chiusa alla soglia)
- Ramo comune = origin (vecchio).

## Prossimi passi (Prova 3 → 4)
1. Passo uno.

## Domande aperte a Mario
- Nessuna.

## Ultimo messaggio di Mario, parola per parola
29/10 09:00 «ciao»

## Testo per aprire la Prova 4
vecchio.

## Motore e forza di pensiero
Motore vecchio.
"""


def controlla(cond, testo):
    global ERRORI
    print(("ok   " if cond else "ERR  ") + testo)
    if not cond:
        ERRORI += 1


def sh(cmd, cwd, env=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, env=env)
    return r.returncode, r.stdout + r.stderr


def scrivi(base, rel, testo):
    percorso = os.path.join(base, rel)
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    with open(percorso, "w", encoding="utf-8") as f:
        f.write(testo)


CONSEGNE = """# Passaggio di consegne

Sessione attuale: #41 (dopo la #40 `session_vecchia`, chiusa alla soglia 29/10 10:00).

**Già deciso da Mario (non richiedere):** niente.
**Da non rifare:** niente.
**Cosa preme a Mario adesso:** la prova.

## Ultimo messaggio di Mario, parola per parola
29/10 09:00 «ciao»

## Stato (29/10 10:00 ora italiana)
- Ramo comune = origin (vecchio).
- Altro punto che deve restare.

## 🔴 Prossimi passi (in ordine; occhio critico prima di ognuno)
1. Passo uno.
Prossimo E libero: E5; prossimo C libero: C7; prossimo M libero: M2.

## Motore e forza di pensiero
Motore vecchio.
"""


def voce(quando, chi, testo, fmt="%Y-%m-%d %H:%M"):
    return f"## {quando.strftime(fmt)} · {chi}\n{testo}\n\n"


PROGETTO_FONTE = {"versione": {"file": "app/src/logica/versioni.js", "modello": r"\bv:\s*'?(\d+(?:\.\d+)?)'?"},
                "numeri": [{"sigla": "C", "modello": r"^\| C(\d+) \|", "file": ["docs/DA-FARE.md", "docs/DA-FARE-FATTE.md"], "lavori": True},
                           {"sigla": "M", "modello": r"^\| M(\d+) \|", "file": ["docs/DA-FARE.md", "docs/DA-FARE-FATTE.md"]}],
                "scheda_avvio": ["Risparmio"]}


def prova_scheda(tmp, repo, altro, env):
    """C469 fase 3 (rapporto 11 §3): la scheda d'avvio della catena Risparmio non perde nessun messaggio dopo il
    passaggio (archivio, registri, scorta locale, scorta su origin, testata a mano, stesso minuto, oltre 40), dice
    «SCHEDA NON GENERATA» o «LEGGI TUTTO» quando manca un dato, allinea il ramo rimasto indietro."""
    import datetime
    from zoneinfo import ZoneInfo
    adesso = datetime.datetime.now(ZoneInfo("Europe/Rome"))
    passaggio, dopo = adesso - datetime.timedelta(hours=2), adesso - datetime.timedelta(hours=1)
    env = dict(env, CLAUDE_CODE_REMOTE_SESSION_ID="session_01RISPNUOVA13xyz")
    scrivi(repo, "docs/CHI-FA-COSA.md", "# Chi fa cosa\n\n## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n"
           "|---|---|---|---|---|---|\n| Risparmio | libri | 📗 📒 | 13 | `session_01RISPNUOVA13xyz` (aperta dalla 12); 12 = "
           "`session_01RISPVECCH12xyz` | — |\n| Principale | stelle | 🟢 | 9 | `session_01PRINCIPALE9x` | — |\n\n"
           "## Lavori in corso\n| Codice | Chat | Cosa | File | Dal |\n|---|---|---|---|---|\n| C469 Kit | **Risparmio 13** | fase 3 | kit | 09/11 |\n"
           "| C1 Altro | **Principale 9** | altro | app | 09/11 |\n")
    scrivi(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md", "# Consegne Risparmio\n\n## Stato (Risparmio 12 `session_01RISPVECCH12xyz`, "
           f"{passaggio:%d/%m %H:%M} ora italiana, chiusa alla soglia)\n- fatto.\n\n## Prossimi passi\n1. fase 3.\n")
    scrivi(repo, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n- 10/11 · 📒 Risparmio 12 · 🛑 file vecchi: accendo? RIGA-ASPETTA-MIA\n"
           "- 10/11 · 🟡 Principale 9 · foto RIGA-ASPETTA-ALTRA\n\n## 1. Lavori\n| C469 | Kit 👁 Lo vedi: x · prova: y | Claude | RIGA-DAFARE-C469 |\n"
           "| C1 | altro | Claude | RIGA-DAFARE-C1 |\n")
    scrivi(repo, ".claude/skills/consegne/SKILL.md", "# Consegne\n\n## Avvio della sessione nuova (prova)\n- PASSI-DI-AVVIO interi.\n\n## Altro\n- no.\n")
    arch = (f"# Archivio\n\n" + voce(adesso - datetime.timedelta(hours=3), "01PRINCIPALE", "PRIMA-DEL-PASSAGGIO")
            + voce(dopo, "01PRINCIPALE", "MSG-ARCHIVIO alla Principale") + voce(dopo, "01PRINCIPALE", "MSG-STESSO-MINUTO altro testo")
            + voce(adesso - datetime.timedelta(minutes=90), "01RISPVECCH1", "MSG-A-MANO alla vecchia", fmt="%Y-%m-%d ~%H:%M")
            .replace(f"~{(adesso - datetime.timedelta(minutes=90)):%H:%M}", f"~{(adesso - datetime.timedelta(minutes=90)):%H:%M}"[:-1] + "x")
            + voce(dopo, "01ALTRAALTRA (girato da 01PRINCIPALE9x)", "MSG-GIRATO non di Mario")
            + voce(dopo, "01RISPNUOVA1 (avvio)", "MSG-MIO avvio di questa sessione"))
    mese = f"archivio/messaggi-mario/{adesso:%Y-%m}.md"
    scrivi(repo, mese, arch)
    scrivi(repo, "docs/MESSAGGI-MARIO-PARALLELA.md", "# Registro\n\n" + voce(dopo, "01RISPVECCH1", "MSG-SOLO-REGISTRO alla vecchia"))
    sh(["git", "add", "-A"], repo)
    sh(["git", "commit", "-q", "-m", "catena Risparmio"], repo)
    sh(["git", "push", "-q", "origin", "claude/prova"], repo)
    gitdir = os.path.join(repo, ".git")
    scrivi(gitdir, "scorta-archivio.md", "# a\n\n" + voce(dopo, "01PRINCIPALE", "MSG-SOLO-SCORTA-LOCALE"))
    # una scorta su origin con un messaggio che sta solo lì; e l'altra chat spinge sul ramo dopo l'avvio
    sh(["git", "fetch", "-q", "origin"], altro)
    sh(["git", "checkout", "-q", "-b", "scorta-principale-20991231-01PRINCIPALE9/claude/prova", "origin/claude/prova"], altro)
    scrivi(altro, mese, arch + voce(dopo, "01PRINCIPALE", "MSG-SOLO-SCORTA-ORIGIN"))
    sh(["git", "commit", "-q", "-am", "scorta"], altro)
    sh(["git", "push", "-q", "origin", "HEAD"], altro)
    sh(["git", "checkout", "-q", "-B", "claude/prova", "origin/claude/prova"], altro)
    scrivi(altro, "docs/NOTA.md", "dopo l'avvio\n")
    sh(["git", "add", "-A"], altro)
    sh(["git", "commit", "-q", "-m", "spinta dopo l'avvio"], altro)
    sh(["git", "push", "-q", "origin", "claude/prova"], altro)
    sh(["git", "fetch", "-q", "origin"], repo)
    sh(["git", "update-ref", "refs/remotes/origin/claude/prova", "HEAD"], repo)  # come l'hook: fetch fatto prima della spinta
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Risparmio"], repo, env)
    controlla(rc == 0 and "SCHEDA D'AVVIO · Risparmio 13" in out and "(sei tu)" in out and "prima: 12 `session_01RISPVECCH12xyz`" in out,
              "scheda: catena, numero, sessione prima " + ("" if rc == 0 else out[-300:]))
    controlla("+1 commit arrivati dopo l'avvio, uniti" in out and os.path.exists(os.path.join(repo, "docs/NOTA.md")),
              "scheda: ramo rimasto indietro allineato (la vecchia spinge dopo l'avvio)")
    tutti = ("MSG-ARCHIVIO", "MSG-STESSO-MINUTO", "MSG-A-MANO", "MSG-SOLO-REGISTRO", "MSG-SOLO-SCORTA-LOCALE", "MSG-SOLO-SCORTA-ORIGIN")
    controlla(all(t in out for t in tutti), "scheda: perdita zero (archivio, stesso minuto, testata a mano, solo registro, "
              "solo scorta locale, solo scorta su origin) " + str([t for t in tutti if t not in out]))
    controlla("PRIMA-DEL-PASSAGGIO" not in out and "MSG-GIRATO" not in out and "MSG-MIO" not in out
              and "+1 girati" in out and "+1 di questa sessione" in out, "scheda: fuori quelli di prima, i girati e i miei, ma contati")
    controlla("Principale" in out.split("MSG-ARCHIVIO")[0].splitlines()[-1], "scheda: ogni messaggio con la sua chat")
    controlla(out.index("RIGA-ASPETTA-MIA") < out.index("RIGA-ASPETTA-ALTRA") and "RIGA-DAFARE-C469" in out
              and "RIGA-DAFARE-C1" not in out and "PASSI-DI-AVVIO interi" in out and "| C1 Altro | **Principale 9**" in out,
              "scheda: Aspetta Mario intera (prima la catena), righe di Da fare della catena, Lavori in corso, passi della skill")
    # sessione nuova aperta a mano, riga di CHI-FA-COSA ancora della vecchia (Risparmio 13 dal vivo, 10/11): numero +1
    chi_r = open(os.path.join(repo, "docs/CHI-FA-COSA.md"), encoding="utf-8").read()
    scrivi(repo, "docs/CHI-FA-COSA.md", chi_r.replace("| 13 | `session_01RISPNUOVA13xyz` (aperta dalla 12); 12 = `session_01RISPVECCH12xyz`",
                                                      "| 12 | `session_01RISPVECCH12xyz` (chiusa alle consegne)"))
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Risparmio"], repo, env)
    controlla(rc == 0 and "SCHEDA D'AVVIO · Risparmio 13" in out and "aperta la 13" in out and "c'è ancora la 12" in out,
              "scheda: riga di CHI-FA-COSA ancora della 12 → sei la 13, scrivi la tua riga " + out[:200])
    # Risparmio 31 dal vivo (18/11): «Numero» 30 era di un altro account, io sono «31 = `session_…`» → la 31, non la 30
    scrivi(repo, "docs/CHI-FA-COSA.md", chi_r.replace("| 13 | `session_01RISPNUOVA13xyz` (aperta dalla 12); 12 = `session_01RISPVECCH12xyz`",
                                                      "| 30 | 31 = `session_01RISPNUOVA13xyz` (aperta dalla 29); 29 = `session_01RISPVECCH12xyz`; "
                                                      "30 = `session_01ALTROACCOUN30` CHIUSA"))
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Risparmio"], repo, env)
    controlla(rc == 0 and "SCHEDA D'AVVIO · Risparmio 31" in out and "aperta la 31 (sei tu)" in out,
              "scheda: «Numero» di un altro account, io «31 = session» → sei la 31 " + out[:200])
    sys.path.insert(0, os.path.dirname(SCRIPT))
    import importlib
    cons = importlib.import_module("consegne")
    cons.CWD, prima_env = repo, os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID")
    os.environ["CLAUDE_CODE_REMOTE_SESSION_ID"] = "session_01RISPVECCH12xyz"
    controlla(cons.numero_catena("Risparmio", "")[0] == 29 and cons.numero_nuovo("Risparmio", 29) == 32,
              "fatti: chi chiude è la 29, la nuova prende 32 (30 e 31 già scritti nella riga)")
    os.environ.pop("CLAUDE_CODE_REMOTE_SESSION_ID")
    if prima_env:
        os.environ["CLAUDE_CODE_REMOTE_SESSION_ID"] = prima_env
    scrivi(repo, "docs/CHI-FA-COSA.md", chi_r)
    # oltre 40 messaggi e oltre 6.000 caratteri: tutti in un file da leggere intero, nessun taglio
    scrivi(repo, mese, arch + "".join(voce(dopo, "01PRINCIPALE", f"MOLTI-{i:02d} " + "parola " * 25) for i in range(41)))
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Risparmio"], repo, env)
    pieno = open(os.path.join(gitdir, "scheda-messaggi.md"), encoding="utf-8").read() if os.path.exists(os.path.join(gitdir, "scheda-messaggi.md")) else ""
    controlla(rc == 0 and "LEGGILO INTERO" in out and all(f"MOLTI-{i:02d} " in pieno for i in range(41)) and "MSG-A-MANO" in pieno,
              "scheda: 41 messaggi lunghi → file intero da leggere, nessuno perso")
    # passaggio di 3 giorni fa: nessun archivio (né del ramo né della scorta) arriva a prima → LEGGI TUTTO
    consegne_r = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md"), encoding="utf-8").read()
    vecchio = adesso - datetime.timedelta(days=3)
    scrivi(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md", consegne_r.replace(f"{passaggio:%d/%m %H:%M} ora", f"{vecchio:%d/%m %H:%M} ora"))
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Risparmio"], repo, env)
    controlla(rc == 0 and "LEGGI TUTTO" in out and f"dal {(vecchio - datetime.timedelta(minutes=5)):%Y-%m-%d %H:%M}" in out,
              "scheda: archivio che non copre il passaggio → «LEGGI TUTTO»; conta dalla più vecchia fra testata e commit")
    scrivi(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md", consegne_r)
    rc, out = sh([sys.executable, "-I", SCRIPT, "avvio", "--parallela", "Nessuna"], repo, env)
    controlla(rc == 1 and out.startswith("SCHEDA NON GENERATA"), "scheda: catena senza consegne → «SCHEDA NON GENERATA», uscita 1")
    scrivi(repo, mese, arch)
    sh(["git", "add", "-A"], repo)
    sh(["git", "commit", "-q", "-m", "x"], repo)
    rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--parallela", "Risparmio", "--id", "session_01RISPNUOVA13xyz",
                  "--motore", "claude-opus-5-5", "--catena", "3", "--prossimo", "avvio leggero"], repo, env)
    testo = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md"), encoding="utf-8").read()
    controlla(rc == 0 and "tools/consegne.py avvio --parallela Risparmio" in testo and "git fetch origin" not in testo
              and "Sei la chat parallela Risparmio 14 di Prova" in testo, "Risparmio: [AVVIO] con la scheda, senza fetch doppio")
    # C511 p.23: la scheda la decide il progetto (.claude/progetto.json «scheda_avvio»), non il nome «Risparmio»
    for valore, con in ((["Altra"], False), ("tutte", True)):
        scrivi(repo, ".claude/progetto.json", json.dumps(dict(PROGETTO_FONTE, scheda_avvio=valore)))
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--parallela", "Risparmio", "--id", "session_01RISPNUOVA13xyz",
                      "--motore", "claude-opus-5-5", "--catena", "3", "--prossimo", "avvio leggero"], repo, env)
        testo = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-RISPARMIO.md"), encoding="utf-8").read()
        controlla(rc == 0 and ("tools/consegne.py avvio --parallela Risparmio" in testo) == con and ("git fetch origin" in testo) != con,
                  f"p.23: scheda_avvio {valore!r} → {'con' if con else 'senza'} scheda")
    scrivi(repo, ".claude/progetto.json", json.dumps(PROGETTO_FONTE))


def main():
    with tempfile.TemporaryDirectory() as tmp:
        origin = os.path.join(tmp, "origin.git")
        repo = os.path.join(tmp, "repo")
        sh(["git", "init", "-q", "--bare", origin], tmp)
        sh(["git", "init", "-q", "-b", "claude/prova", repo], tmp)
        sh(["git", "config", "user.email", "p@p"], repo)
        sh(["git", "config", "user.name", "p"], repo)
        scrivi(repo, ".claude/ramo-di-lavoro.txt", "claude/prova\n")
        scrivi(repo, "CLAUDE.md", "# Prova 🧪 · regole del progetto\n")  # nome e icona li legge consegne.py
        scrivi(repo, ".claude/settings.json", json.dumps({"effortLevel": "high"}))
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", CONSEGNE)
        scrivi(repo, "docs/DA-FARE.md", "| C12 | cosa | Claude | 🔴 |\n| M3 | altro | Mario | |\n")
        scrivi(repo, "docs/ERRORI.md", "- **E9** lezione.\n")
        scrivi(repo, "docs/MESSAGGI-MARIO.md", "# Messaggi\n\n## 2020-01-01 10:00 · abc\nvecchio\n")
        scrivi(repo, "app/src/logica/versioni.js", "export const VERSIONI = [\n  { v: 108, n: 'x' },\n  { v: '107.1' },\n];\n")
        scrivi(repo, ".claude/progetto.json", json.dumps(PROGETTO_FONTE))  # C511: forme del progetto fonte (versione, C, M, scheda)
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "base"], repo)
        sh(["git", "remote", "add", "origin", origin], repo)
        sh(["git", "push", "-q", "-u", "origin", "claude/prova"], repo)
        # su origin l'altra chat ha già preso E30 (numero doppio da evitare)
        altro = os.path.join(tmp, "altro")
        sh(["git", "clone", "-q", "-b", "claude/prova", origin, altro], tmp)
        sh(["git", "config", "user.email", "a@a"], altro)
        sh(["git", "config", "user.name", "a"], altro)
        scrivi(altro, "docs/ERRORI.md", "- **E9** lezione.\n- **E30** presa dall'altra chat.\n")
        sh(["git", "commit", "-q", "-am", "E30"], altro)
        sh(["git", "push", "-q", "origin", "claude/prova"], altro)
        # messaggio di Mario arrivato dopo le consegne
        with open(os.path.join(repo, "docs/MESSAGGI-MARIO.md"), "a", encoding="utf-8") as f:
            f.write("\n## 2099-01-01 10:00 · abc\nmessaggio nuovo di prova\n")
        # gh finto
        fake = os.path.join(tmp, "bin")
        os.makedirs(fake)
        with open(os.path.join(fake, "gh"), "w") as f:
            f.write("#!/bin/sh\ncase \"$2\" in *actions/runs*) echo '{\"workflow_runs\":[{\"name\":\"Prove\"}]}';; "
                    "*pulls*) echo '[{\"number\":9,\"draft\":true,\"title\":\"v108\"}]';; esac\n")
        os.chmod(os.path.join(fake, "gh"), 0o755)
        env = dict(os.environ, PATH=fake + os.pathsep + os.environ["PATH"], CLAUDE_PROJECT_DIR=repo)

        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-fable-5-1",
                      "--catena", "3", "--prossimo", "C352"], repo, env)
        controlla(rc == 0, "fatti: uscita 0 " + out.splitlines()[-1][:80])
        testo = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        controlla("Sessione attuale: #42 (dopo la #41 `session_41`" in testo, "numero nuovo e id della vecchia")
        controlla("catena 3 di 8" in testo, "catena scritta")
        controlla("Giri in corso: Prove" in testo, "giro in corso dal gh finto")
        controlla("PR aperte: #9 (bozza) v108" in testo, "PR aperta dal gh finto")
        controlla("Versione nel codice v108" in testo, "versione più alta nel codice")
        controlla("- Altro punto che deve restare." in testo, "gli altri punti dello Stato restano")
        controlla("1. Passo uno." in testo and "Cosa preme a Mario adesso" in testo, "le sezioni di giudizio restano")
        controlla("Prossimo E libero: E31; prossimo C libero: C13; prossimo M libero: M4." in testo, "numeri liberi anche da origin (E30 dell'altra chat)")
        controlla("Motore: **claude-fable-5-1** (Fable 5.1) · impegno **Alto** (`high`" in testo, "motore e impegno")
        controlla("Motore vecchio" not in testo, "sezione del motore rimpiazzata")
        controlla("Ramo comune ≠ origin: PUSH DA FARE" in testo, "origin più avanti → non allineato")
        i_strade, i_passi = testo.find("## Strade provate e scartate"), testo.find("## 🔴 Prossimi passi")
        controlla(0 < i_strade < i_passi and "- Nessuna." in testo, "sezione «Strade provate e scartate» aggiunta vuota prima dei Prossimi passi")
        prossima = open(os.path.join(repo, "docs/PROSSIMA-SESSIONE.md"), encoding="utf-8").read()
        controlla("🟡 🧪 Principale 42 · metti Fable Alto" in prossima, "C472: chiusa con Fable → titolo giallo «metti Fable»")
        controlla("[AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable · Alto." in prossima
                  and "metti Fable · Alto (menu del motore e del pensiero" in prossima
                  and "Sessione #42 di Prova" in prossima and "claude/prova" in prossima, "testo da incollare col segno C472")
        controlla("messaggio nuovo di prova" in out and "Messaggi di Mario dopo l'ultimo commit delle consegne: 1" in out, "messaggio di Mario dopo le consegne segnalato")
        # C511 p.20: --catena obbligatorio, sennò niente scritto
        prima = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-opus-5-5"], repo, env)
        controlla(rc == 2 and "manca --catena" in out and open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read() == prima,
                  "p.20: senza --catena si ferma e non scrive")
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-opus-5-5", "--catena", "30"], repo, env)
        controlla(rc == 2 and "da 1 a 8" in out and open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read() == prima,
                  "38.52: --catena oltre 8 (numero della sessione) si ferma e non scrive")
        # C511 p.21: senza .claude/progetto.json niente «Versione nel codice» e solo il numero E (forma del kit)
        os.rename(os.path.join(repo, ".claude/progetto.json"), os.path.join(tmp, "progetto.json"))
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-opus-5-5",
                      "--catena", "3", "--prossimo", "C352"], repo, env)
        senza = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        controlla(rc == 0 and "Versione nel codice" not in senza and "Prossimo E libero: E31.\n" in senza and "prossimo C" not in senza,
                  "p.21: senza impostazioni del progetto niente versione né C e M inventati")
        # numeri semplici del Da fare (sigla vuota)
        scrivi(repo, ".claude/progetto.json", json.dumps({"numeri": [{"sigla": "", "modello": r"^\| (\d+) \|"}]}))
        da_fare_vero = open(os.path.join(repo, "docs/DA-FARE.md"), encoding="utf-8").read()
        scrivi(repo, "docs/DA-FARE.md", "| 7 | cosa | Claude |\n| 12 | altra | Claude |\n")
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-opus-5-5",
                      "--catena", "3", "--prossimo", "C352"], repo, env)
        semplici = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        controlla(rc == 0 and "Prossimo E libero: E31; prossimo numero libero del Da fare: 13." in semplici,
                  "p.21: numeri semplici del Da fare (anche da origin per E)")
        scrivi(repo, "docs/DA-FARE.md", da_fare_vero)
        os.rename(os.path.join(tmp, "progetto.json"), os.path.join(repo, ".claude/progetto.json"))
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", prima)
        # Principale 594 (12/11): «fatti» rilanciato dalla STESSA sessione non fa salire il numero due volte
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_41", "--motore", "claude-fable-5-1",
                      "--catena", "3", "--prossimo", "C352"], repo, env)
        rifatto = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        controlla(rc == 0 and "Sessione attuale: #42 (dopo la #41 `session_41`" in rifatto, "fatti due volte dalla stessa sessione: resta #42")
        # seconda passata: la sezione già scritta (con giudizio) non si tocca né si raddoppia
        testo2 = testo.replace("- Nessuna.", "- Soglia a 350k: scartata (context rot).")
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", testo2)
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_42", "--motore", "claude-opus-5-5",
                      "--catena", "4", "--prossimo", "C352"], repo, env)
        testo = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        controlla(rc == 0 and testo.count("## Strade provate e scartate") == 1 and "scartata (context rot)" in testo,
                  "seconda passata: la sezione scritta resta, una sola")
        controlla("Aspetta Mario: 0 righe" in out and "🟢 🧪 Principale 43 · C352" in open(os.path.join(repo, "docs/PROSSIMA-SESSIONE.md"), encoding="utf-8").read(),
                  "niente che aspetta Mario: la nuova parte 🟢 (C369)")
        # terza passata: una riga della principale in «## 0. Aspetta Mario» → la nuova parte comunque 🟢 (E245)
        # (stessa sessione session_42 rilanciata: resta 43; prima del 12/11 la prova aspettava 44, il difetto della 594)
        da_fare = open(os.path.join(repo, "docs/DA-FARE.md"), encoding="utf-8").read()
        consegne_prima = testo
        scrivi(repo, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n- 31/10 · 🧪 · P6 · foto di Dov'è\n\n" + da_fare)
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_42", "--motore", "claude-opus-5-5",
                      "--catena", "4", "--prossimo", "C352"], repo, env)
        prossima = open(os.path.join(repo, "docs/PROSSIMA-SESSIONE.md"), encoding="utf-8").read()
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", consegne_prima)
        controlla(rc == 0 and "🟢 🧪 Principale 43 · C352" in prossima and "1 righe" in out and "principale: 0" in out,
                  "riga solo della parallela: la nuova principale parte 🟢 (C369)")
        scrivi(repo, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n- 31/10 · 🧪 · #41 · scegli i colori\n- 31/10 · 🧪 · P6 · foto\n\n" + da_fare)
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--id", "session_42", "--motore", "claude-opus-5-5",
                      "--catena", "4", "--prossimo", "C352"], repo, env)
        prossima = open(os.path.join(repo, "docs/PROSSIMA-SESSIONE.md"), encoding="utf-8").read()
        controlla(rc == 0 and "🟢 🧪 Principale 43 · C352" in prossima and "comunque 🟢" in out and "della principale: 1" in out,
                  "riga della principale in «Aspetta Mario»: la nuova parte comunque 🟢 (E245)")
        scrivi(repo, "docs/DA-FARE.md", da_fare)
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", consegne_prima)

        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla"], repo, env)
        controlla(rc == 1, "controlla: FALSO con modifiche pendenti e push non fatto (uscita 1)")
        controlla("FALSO: push confermato" in out and "FALSO: niente modifiche pendenti" in out, "controlli falsi nominati")
        controlla("FALSO: ultimo messaggio di Mario dentro le consegne" in out, "ultimo messaggio mancante → FALSO")
        # ora tutto a posto: messaggio nelle consegne, merge di origin, commit e push
        testo = testo.replace("29/10 09:00 «ciao»", "29/10 09:00 «ciao»\n2099 «messaggio nuovo di prova»")
        scrivi(repo, "docs/PASSAGGIO-CONSEGNE.md", testo)
        sh(["git", "fetch", "-q", "origin"], repo)
        sh(["git", "merge", "-q", "--no-edit", "origin/claude/prova"], repo)
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "consegne"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla"], repo, env)
        controlla(rc == 0 and "Tutto vero" in out, "controlla: tutto VERO dopo commit e push " + ("" if rc == 0 else out[-300:]))
        # C483: la parola nel testo d'avvio di PROSSIMA-SESSIONE → FALSO (la sessione nuova partirebbe coi copioni accesi)
        prossima_ok = open(os.path.join(repo, "docs/PROSSIMA-SESSIONE.md"), encoding="utf-8").read()
        controlla("## Testo da incollare" in prossima_ok and not re.search(r"ultra\s*code", prossima_ok, re.I),
                  "C483: PROSSIMA-SESSIONE scritta da fatti senza la parola")
        scrivi(repo, "docs/PROSSIMA-SESSIONE.md", prossima_ok.replace("[AVVIO] ", "[AVVIO] 🚀 ULTRACODE (C483): ", 1))
        sh(["git", "commit", "-q", "-am", "segno vecchio"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla"], repo, env)
        controlla(rc == 1 and "FALSO: testo d'avvio senza la parola" in out, "C483: parola nel testo d'avvio → FALSO " + out[-300:])
        scrivi(repo, "docs/PROSSIMA-SESSIONE.md", prossima_ok)
        sh(["git", "commit", "-q", "-am", "segno tolto"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)

        # C450 (proposta 7): consegne di una catena parallela («Prova 4»): fatti --parallela scrive il blocco Stato in cima,
        # il Motore e «Testo per aprire la Prova 5»; controlla --parallela VERO dopo commit e push; la Principale non si tocca.
        principale_prima = open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read()
        scrivi(repo, "docs/CHI-FA-COSA.md", "# Chi fa cosa\n\n## Catene\n| Catena | Forma | Segni | Numero | Sessione | Chiusa il |\n"
               "|---|---|---|---|---|---|\n| Prova | libri | 📗 📒 📕 📓 | 4 | `session_01PROVAPROVA4444` (aperta dalla 3) | — |\n\n## Lavori\n")
        scrivi(repo, "docs/CONSEGNE-PARALLELA-PROVA.md", CONSEGNE_PAR)
        scrivi(repo, "docs/MESSAGGI-MARIO-PARALLELA.md", "# Messaggi (chat parallela)\n\n## 2020-01-01 10:00 · abc\nvecchio\n")
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "catena Prova"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--parallela", "Prova", "--id", "session_01PROVAPROVA4444",
                      "--motore", "claude-opus-5-5", "--catena", "4", "--prossimo", "kit nuovo"], repo, env)
        testo_par = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-PROVA.md"), encoding="utf-8").read()
        controlla(rc == 0 and testo_par.index("## Stato (Prova 4 `session_01PROVAPROVA4444`") < testo_par.index("## Stato (Prova 3"),
                  "parallela: blocco «Stato (Prova 4 …)» in cima, sopra quello vecchio " + ("" if rc == 0 else out[-300:]))
        controlla("Ramo comune = origin" in testo_par and "Motore: **claude-opus-5-5**" in testo_par and "⛔" not in testo_par,
                  "parallela: riga di fatto (ramo = origin) e Motore scritti dal programma")
        controlla("## Testo per aprire la Prova 5" in testo_par and "Sei la chat parallela Prova 5 di Prova" in testo_par
                  and "docs/CONSEGNE-PARALLELA-PROVA.md" in testo_par and "📗 🧪 Prova 5 · kit nuovo" in testo_par,
                  "parallela: «Testo per aprire la Prova 5» col titolo verde della catena e le sue consegne")
        controlla("## Testo per aprire la Prova 4" not in testo_par, "parallela: il testo vecchio «aprire la Prova 4» sostituito")
        controlla("Messaggi di Mario (chat parallela)" in out and "Aspetta Mario: 0 righe della catena «Prova»" in out,
                  "parallela: messaggi del registro della parallela e righe «Aspetta Mario» della catena")
        controlla(open(os.path.join(repo, "docs/PASSAGGIO-CONSEGNE.md"), encoding="utf-8").read() == principale_prima,
                  "parallela: le consegne della Principale non cambiano")
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 1 and "FALSO: niente modifiche pendenti" in out, "controlla --parallela: FALSO prima del commit")
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "consegne Prova"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 0 and "Tutto vero" in out and "VERO : «Testo per aprire la Prova 5»" in out,
                  "controlla --parallela: tutto VERO dopo commit e push " + ("" if rc == 0 else out[-400:]))
        # E350 (Risparmio 21, quiz 7,5/10): la chiave del quiz della sessione dopo chiede solo fatti scritti nelle consegne
        scrivi(repo, "docs/misure/quiz-passaggio-prova-5-chiave.md",
               "1. `docs/CONSEGNE-PARALLELA-PROVA.md` e `tools/fuori-dalle-consegne.py`; E999.\n")
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "quiz Prova 5"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 1 and "FALSO: chiave del quiz Prova 5" in out and "mancano E999, tools/fuori-dalle-consegne.py →" in out,
                  "controlla --parallela: chiave del quiz con fatti non scritti nelle consegne → FALSO coi nomi (E350) " + out[-300:])
        scrivi(repo, "docs/misure/quiz-passaggio-prova-5-chiave.md", "1. `CONSEGNE-PARALLELA-PROVA.md` (solo il nome).\n")
        sh(["git", "commit", "-q", "-am", "quiz Prova 5 corretto"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 0 and "VERO : chiave del quiz Prova 5" in out, "controlla --parallela: chiave corretta → VERO " + out[-300:])
        # C516 B2: hook delle foto assente nel repo → il controllo delle foto è VERO (qui sopra il repo non l'ha).
        controlla("VERO : nessuna foto o video di questa sessione" in out, "C516: senza l'hook delle foto → VERO")
        # Con l'hook vero e una foto di questa sessione in archivio/, non mandata e senza riga in «Aspetta Mario» → FALSO.
        os.makedirs(os.path.join(repo, ".claude", "hooks"), exist_ok=True)
        shutil.copy(os.path.join(os.path.dirname(QUI), ".claude", "hooks", "foto-chieste.py"), os.path.join(repo, ".claude", "hooks"))
        scrivi(repo, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n- 01/01 · altro\n\n## Lavori\n| C12 | cosa | Claude | 🔴 |\n")
        os.makedirs(os.path.join(repo, "archivio", "C1"), exist_ok=True)
        with open(os.path.join(repo, "archivio", "C1", "foto-nuova.png"), "wb") as f:
            f.write(b"\x89PNG finta")
        sh(["git", "add", "-A"], repo)
        sh(["git", "commit", "-q", "-m", "foto per Mario"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 1 and "FALSO: nessuna foto o video di questa sessione" in out and "archivio/C1/" in out,
                  "C516: foto non mandata e senza riga → FALSO con la cartella, uscita 1 " + out[-300:])
        # Con la riga che cita la cartella → VERO.
        scrivi(repo, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n- 01/01 · foto in `archivio/C1/`: vanno?\n\n"
               "## Lavori\n| C12 | cosa | Claude | 🔴 |\n")
        sh(["git", "commit", "-q", "-am", "riga in Aspetta Mario"], repo)
        sh(["git", "push", "-q", "origin", "claude/prova"], repo)
        rc, out = sh([sys.executable, "-I", SCRIPT, "controlla", "--parallela", "Prova"], repo, env)
        controlla(rc == 0 and "VERO : nessuna foto o video di questa sessione" in out,
                  "C516: con la riga che cita la cartella → VERO " + out[-300:])
        controlla("git fetch origin claude/prova" in testo_par and "consegne.py avvio" not in testo_par,
                  "parallela fuori prova: [AVVIO] di sempre (la scheda solo per la Risparmio, C469 fase 3)")
        prova_scheda(tmp, repo, altro, env)
        # C474 (Risparmio 18, dal vivo: «impegno Medio» dal file comune mentre la sessione era Extra): motore e impegno
        # VERI della sessione dal suo registro; il file comune (high) solo se il registro manca
        casa = os.path.join(tmp, "casa")
        reg = os.path.join(casa, ".claude", "projects", re.sub(r"[^A-Za-z0-9]", "-", repo))
        os.makedirs(reg)
        with open(os.path.join(reg, "s.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps({"type": "assistant", "effort": "xhigh", "message": {"model": "claude-opus-5-5"}}) + "\n")
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--parallela", "Prova", "--id", "session_01PROVAPROVA4444",
                      "--motore", "claude-opus-5-5", "--catena", "4", "--prossimo", "kit nuovo"], repo, dict(env, HOME=casa))
        t474 = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-PROVA.md"), encoding="utf-8").read()
        controlla(rc == 0 and "impegno **Extra** (`xhigh`, dal registro" in t474,
                  "C474: impegno vero dal registro della sessione (Extra), non dal file comune (Alto)")
        controlla(t474.count("## Stato (Prova 4 ") == 1, "rilanciato: un solo blocco «Stato (Prova 4 …)», niente doppione")
        shutil.rmtree(casa)

        # C472: catena parallela chiusa con Fable → segno ⛔ nel testo [AVVIO] e titolo giallo «metti Fable».
        rc, out = sh([sys.executable, "-I", SCRIPT, "fatti", "--parallela", "Prova", "--id", "session_01PROVAPROVA4444",
                      "--motore", "claude-fable-5-2", "--catena", "4", "--prossimo", "kit nuovo"], repo, env)
        testo_par = open(os.path.join(repo, "docs/CONSEGNE-PARALLELA-PROVA.md"), encoding="utf-8").read()
        controlla(rc == 0 and "📒 🧪 Prova 5 · metti Fable Alto" in testo_par
                  and "[AVVIO] ⛔ FABLE (C472): la sessione di prima lavorava con Fable · Alto." in testo_par
                  and "Sei la chat parallela Prova 5 di Prova" in testo_par and "Motore: **claude-fable-5-2** (Fable 5.2)" in testo_par,
                  "C472 parallela: chiusa con Fable → ⛔ nel testo e titolo col segno giallo della catena")
    # #439: al controllo contano solo le scorte di questa sessione (le parallele vive non fermano l'handoff).
    sys.path.insert(0, os.path.dirname(SCRIPT))
    import consegne as c
    nomi = ["scorta-parallela-20261030-d90dd3e0/r", "scorta-principale-20261030-01WTjqUtKT2y/r", "scorta-principale-20261030-01WTjqUtR9q7/r", "scorta-parallela/r"]
    controlla(c.mie_scorte(nomi, "01WTjqUtKT2y") == ["scorta-principale-20261030-01WTjqUtKT2y/r"], "mie_scorte: solo quella principale col mio id di 12 caratteri (E226)")
    controlla(c.mie_scorte(nomi, "") == nomi, "mie_scorte: senza id (in locale) restano tutte")
    lungo = c.titolo_breve("💚", "🧪", "Scorte 68", "Ordini al fornitore con conferma e scorte")
    controlla(lungo == "💚 🧪 Scorte 68 · Ordini al fornitore", "cosa fa: al massimo 3 parole, numero mai tagliato (kit 30.6)")
    lungo = c.titolo_breve("🟢", "🧪", "Principale 466", "Prenotazionidituttiglianni elenco")
    controlla(len(lungo) <= c.TETTO_TITOLO and lungo.endswith("…") and lungo.startswith("🟢 🧪 Principale 466 · "), "parola lunga accorciata entro ~20 caratteri (kit 30.6)")
    controlla(c.titolo_breve("🟢", "🧪", "Principale 466", "colori Planner") == "🟢 🧪 Principale 466 · colori Planner", "principale, esempio di Mario (kit 30.7)")
    controlla(c.titolo_breve("🟩", "🧪", "Dov'è 7", "cose ospiti") == "🟩 🧪 Dov'è 7 · cose ospiti", "parallela, esempio di Mario (kit 30.6)")
    controlla(c.della_principale("- 01/11 · 🟡 Principale 466 · import") and not c.della_principale("- 01/11 · 🟨 Dov'è 8 · foto"), "riga di «Aspetta Mario» col segno e la catena (kit 30.7)")
    controlla(c.della_principale("- 31/10 · 🧪 · #463 · anteprima") and not c.della_principale("- 31/10 · 🧪 · P6 · foto di Dov'è"), "riga di «Aspetta Mario» della principale o della parallela (C369)")
    # C472: il segno va subito dopo «[AVVIO]» (scorta.py riconosce l'avvio e il ruolo da lì) e solo con Fable.
    avvio = "[AVVIO] Sei la chat parallela Prova 5 di Prova. Primo passo"
    controlla(c.con_fermo_fable(avvio, "claude-opus-5-5") == avvio, "C472: con Opus il testo [AVVIO] non cambia")
    col_segno = c.con_fermo_fable(avvio, "claude-fable-5-2")
    controlla(col_segno.startswith("[AVVIO] ⛔ FABLE (C472)") and col_segno.endswith(avvio[len("[AVVIO] "):]),
              "C472: con Fable il segno subito dopo [AVVIO], il resto uguale")
    # C504 (Mario 14/11 «dimmelo sempre se c'è bisogno o meno»): il perché nel segno, letto uguale dall'hook
    perche = c.con_fermo_fable(avvio, "claude-fable-5-2", "Extra", "piano «C999» senza sigillo.\n")
    import fable_segno
    controlla("Serve Fable perché: piano C999 senza sigillo. Se il tuo motore" in perche
              and "Fable · Extra: serve perché piano C999 senza sigillo; metti Fable · Extra (menu" in perche
              and fable_segno.leggi(perche) == ("Extra", "piano C999 senza sigillo"), "C504: perché nel segno e riletto: " + perche[:240])
    a = argparse.Namespace(fable="", prossimo="piano C999")
    controlla(c.perche_fable(a) == "il lavoro di Fable è a metà (piano C999)" and c.perche_fable(argparse.Namespace(
        fable="serve il collaudo", prossimo="x")) == "serve il collaudo", "C504: senza --fable il perché viene da --prossimo")
    sys.path.insert(0, os.path.join(os.path.dirname(SCRIPT), "..", ".claude", "hooks"))
    import scorta
    controlla(scorta.ruolo_da_avvio(col_segno) == "parallela" and scorta.avvio_o_girato(col_segno)[0] == "(avvio)",
              "C472: scorta.py riconosce ancora avvio e ruolo col segno")
    # C483 (Mario 12/11 ~20:10): niente segno ereditato; la parola nel testo d'avvio è vietata (accende i copioni da sola).
    controlla(not hasattr(c, "con_ultracode") and not hasattr(c, "SEGNO_ULTRA") and c.PAROLA_VIETATA.search("[AVVIO] 🚀 ULTRACODE (C483)")
              and c.PAROLA_VIETATA.search("ultra code") and not c.PAROLA_VIETATA.search(col_segno),
              "C483: niente segno dell'ultra-code; la parola riconosciuta anche staccata, il testo [AVVIO] di Fable pulito")
    # Kit 38.18: consegne.py è uguale in ogni progetto, nome icona e repo li legge da lì.
    with tempfile.TemporaryDirectory() as altro_progetto:
        sh(["git", "init", "-q", altro_progetto], altro_progetto)
        cwd_prima = c.CWD
        c.CWD = altro_progetto
        controlla(c.progetto() == (os.path.basename(altro_progetto), "📁", ""), "senza CLAUDE.md né origin: nome della cartella, icona 📁")
        scrivi(altro_progetto, "CLAUDE.md", "# Bottega Due 🧵 · regole del progetto\n@docs/kit-progetto/REGOLE.md\n")
        for url in ("git@github.com:Ditta/bottega.git", "https://github.com/Ditta/bottega", "http://proxy@127.0.0.1:9/git/Ditta/bottega/"):
            sh(["git", "remote", "remove", "origin"], altro_progetto)
            sh(["git", "remote", "add", "origin", url], altro_progetto)
            controlla(c.progetto() == ("Bottega Due", "🧵", "Ditta/bottega"), "nome e icona dal titolo di CLAUDE.md, repo da " + url)
        c.CWD = cwd_prima
    print("ERRORI:", ERRORI)
    return 1 if ERRORI else 0


if __name__ == "__main__":
    sys.exit(main())
