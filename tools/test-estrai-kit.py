#!/usr/bin/env python3
# Prova di tools/estrai-kit.py con un pacchetto finto: python3 -I tools/test-estrai-kit.py
import os, subprocess, sys, tempfile

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "estrai-kit.py")
R = "~" * 5


def S(nome):  # segnaposto scritto spezzato: intero, questo file finirebbe fra quelli da sostituire a mano
    return "<" + nome + ">"
ERRORI = 0


def controlla(cond, testo):
    global ERRORI
    print(("ok   " if cond else "ERR  ") + testo)
    if not cond:
        ERRORI += 1


def blocco(rel, testo):
    return f"### `{rel}`\n{R}\n{testo}{R}\n\n"


def parte(cartella, i, n, blocchi, testa="", nome="PACCHETTO-v38-{i}di{n}.md"):
    with open(os.path.join(cartella, nome.format(i=i, n=n)), "w", encoding="utf-8") as f:
        f.write(f"# Pacchetto del kit · kit 38.0 · Parte {i} di {n}\n\n{testa}## File\n\n" + "".join(blocchi) + "\n(fine)\n")


def scrivi(base, rel, testo):
    p = os.path.join(base, rel)
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)


def leggi(base, rel):
    p = os.path.join(base, rel)
    return open(p, encoding="utf-8").read() if os.path.exists(p) else None


def lancia(progetto, *arg):
    r = subprocess.run([sys.executable, "-I", SCRIPT, *arg], cwd=progetto, capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def main():
    with tempfile.TemporaryDirectory() as tmp:
        parti, progetto = os.path.join(tmp, "parti"), os.path.join(tmp, "progetto")
        os.makedirs(parti)
        os.makedirs(progetto)
        nuovo = "print('nuovo')\n\n# riga vuota sopra e in fondo\n\n"
        # la parte 1 ha anche le istruzioni, con un titolo «### `…`» che NON è un file (manca il recinto sotto)
        parte(parti, 1, 2, [blocco("tools/nuovo.py", nuovo), blocco("tools/cambiato.py", "v2\n"),
                            blocco("tools/uguale.py", "uguale\n"), blocco(".claude/hooks/gancio.py", "gancio\n")],
              testa="### `tools/finto.py` è citato qui ma non è un file\n\n")
        parte(parti, 2, 2, [blocco(".claude/skills/consegne/SKILL.md", "Progetto " + S("PROGETTO") + " " + S("ICONA") + "\n"),
                            blocco("tools/test-guardia.py", "REPO = {'owner': '" + S("OWNER") + "', 'repo': '" + S("NOME-REPO") + "'}\n"),
                            blocco("CLAUDE.md", "# " + S("PROGETTO") + " " + S("ICONA") + " · regole del progetto\n"),
                            blocco("docs/ERRORI.md", "diario del kit\n"), blocco("moduli/app-con-prove.md", "guida\n"),
                            blocco("docs/DA-FARE.md", "# Da fare\n"), blocco("docs/PASSAGGIO-CONSEGNE.md", "Sessione attuale: #01\n"),
                            blocco(".github/workflows/x.yml", "on: push\n"), blocco(".mcp.json", "{}\n")])
        scrivi(progetto, "tools/cambiato.py", "v1\n")
        scrivi(progetto, "tools/uguale.py", "uguale\n")
        scrivi(progetto, ".claude/skills/consegne/SKILL.md", "Progetto Bottega 🧵\n")  # segnaposto già sostituiti
        scrivi(progetto, "docs/ERRORI.md", "il mio diario\n")
        scrivi(progetto, "docs/DA-FARE.md", "# Da fare mio\n")

        rc, out = lancia(progetto, parti)
        controlla(rc == 0 and "PROVA" in out, "prova: uscita 0")
        controlla(leggi(progetto, "tools/nuovo.py") is None and leggi(progetto, "tools/cambiato.py") == "v1\n",
                  "prova: non scrive niente")
        controlla("Già uguali: 2" in out, "uguali: il file identico e la skill coi segnaposto già sostituiti")

        rc, out = lancia(progetto, parti, "--scrivi")
        controlla(rc == 0 and "Scritti da qui, uguali al byte: 3" in out, "scrive i 3 file fuori da .claude/ " + out[-200:].replace("\n", " | "))
        controlla(leggi(progetto, "tools/nuovo.py") == nuovo, "file nuovo uguale al byte (righe vuote comprese)")
        controlla(leggi(progetto, "tools/cambiato.py") == "v2\n" and leggi(progetto, "tools/cambiato.py.prima-del-kit") == "v1\n",
                  "file cambiato: il vecchio resta in .prima-del-kit")
        controlla(not os.path.exists(os.path.join(progetto, "tools/uguale.py.prima-del-kit")), "file uguale: non toccato")
        controlla(not os.path.exists(os.path.join(progetto, ".claude/hooks/gancio.py")), ".claude/: mai scritto (E69)")
        controlla(".claude/hooks/gancio.py · nuovo · file protetto" in out and "parte 1, righe" in out,
                  ".claude/: elencato per Write con parte e righe")
        controlla(f"tools/test-guardia.py · segnaposto {S('OWNER')} {S('NOME-REPO')} · nuovo" in out and leggi(progetto, "tools/test-guardia.py") is None,
                  "segnaposto fuori da .claude/: elencato, non scritto")
        controlla("CLAUDE.md · punto 5" in out and leggi(progetto, "CLAUDE.md") is None, "CLAUDE.md: mai scritto")
        controlla(leggi(progetto, "docs/ERRORI.md") == "il mio diario\n" and "docs/ERRORI.md · c'è già" in out, "ERRORI.md: si tiene il suo")
        controlla(leggi(progetto, "docs/DA-FARE.md") == "# Da fare mio\n" and leggi(progetto, "docs/PASSAGGIO-CONSEGNE.md") == "Sessione attuale: #01\n",
                  "file di partenza: scritto solo se manca")
        controlla(leggi(progetto, "moduli/app-con-prove.md") is None and "moduli/app-con-prove.md · guida" in out, "moduli/: non va nel progetto")
        controlla(leggi(progetto, ".github/workflows/x.yml") is None and leggi(progetto, ".mcp.json") is None, ".github/ e .mcp.json: solo Write")
        controlla("tools/finto.py" not in out, "un titolo senza recinto sotto non è un file")

        # righe indicate = proprio il testo del file
        riga = next(r for r in out.splitlines() if r.startswith("  .claude/hooks/gancio.py"))
        r1, r2 = (int(x) for x in riga.rsplit("righe ", 1)[1].split("-"))
        righe = open(os.path.join(parti, "PACCHETTO-v38-1di2.md"), encoding="utf-8").read().split("\n")
        controlla("\n".join(righe[r1 - 1:r2]) + "\n" == "gancio\n", "parte e righe portano al testo giusto")

        # C511 p.1: kit applicato un'altra volta → la copia .prima-del-kit (il file di PRIMA del kit) resta com'è
        scrivi(progetto, "tools/cambiato.py", "v1 bis, ritoccato a mano\n")
        rc, out = lancia(progetto, parti, "--scrivi")
        controlla(leggi(progetto, "tools/cambiato.py") == "v2\n" and leggi(progetto, "tools/cambiato.py.prima-del-kit") == "v1\n"
                  and "prima-del-kit c'è già: resta com'è" in out, "p.1: .prima-del-kit che c'è già non si riscrive")
        # C511 p.2: __pycache__/ in .gitignore, una volta sola, solo con --scrivi
        controlla(leggi(progetto, ".gitignore") == "__pycache__/\n", "p.2: --scrivi mette __pycache__/ in .gitignore")
        rc, out = lancia(progetto, parti, "--scrivi")
        controlla(leggi(progetto, ".gitignore") == "__pycache__/\n" and ".gitignore" not in out, "p.2: già scritto: niente doppione")
        progetto2 = os.path.join(tmp, "progetto2")
        scrivi(progetto2, ".gitignore", "node_modules/")
        rc, out = lancia(progetto2, parti)
        controlla(leggi(progetto2, ".gitignore") == "node_modules/" and "da aggiungere __pycache__/" in out, "p.2: la prova non scrive .gitignore")
        lancia(progetto2, parti, "--scrivi")
        controlla(leggi(progetto2, ".gitignore") == "node_modules/\n__pycache__/\n", "p.2: riga aggiunta in fondo, a capo giusto")
        # C511 p.3: --anche-claude scrive anche .claude/ senza segnaposto; .mcp.json, .github/, CLAUDE.md e segnaposto restano a Write
        rc, out = lancia(progetto2, parti, "--anche-claude")
        controlla(rc == 2 and "Uso:" in out, "p.3: --anche-claude senza --scrivi: uso")
        rc, out = lancia(progetto2, parti, "--scrivi", "--anche-claude")
        controlla(rc == 0 and leggi(progetto2, ".claude/hooks/gancio.py") == "gancio\n" and "con l'ok scritto di Mario" in out,
                  "p.3: --anche-claude scrive .claude/hooks/ " + out[-300:].replace("\n", " | "))
        controlla(leggi(progetto2, ".claude/skills/consegne/SKILL.md") is None and leggi(progetto2, ".mcp.json") is None
                  and leggi(progetto2, ".github/workflows/x.yml") is None and leggi(progetto2, "CLAUDE.md") is None,
                  "p.3: segnaposto, .mcp.json, .github/ e CLAUDE.md: sempre a Write")
        # collaudo 38.52: un .claude/settings.json del progetto, diverso dal kit, non si sovrascrive neanche con --anche-claude
        parti3, progetto3, progetto4 = (os.path.join(tmp, n) for n in ("parti3", "progetto3", "progetto4"))
        os.makedirs(parti3)
        parte(parti3, 1, 1, [blocco(".claude/settings.json", '{"kit": 1}\n'), blocco(".claude/hooks/altro.py", "altro\n")])
        scrivi(progetto3, ".claude/settings.json", '{"mio": 1}\n')
        rc, out = lancia(progetto3, parti3, "--scrivi", "--anche-claude")
        controlla(rc == 0 and leggi(progetto3, ".claude/settings.json") == '{"mio": 1}\n' and "unisci a mano" in out
                  and leggi(progetto3, ".claude/hooks/altro.py") == "altro\n", "38.52: settings.json tuo resta, a mano " + out[-200:])
        os.makedirs(progetto4)
        rc, out = lancia(progetto4, parti3, "--scrivi", "--anche-claude")
        controlla(rc == 0 and leggi(progetto4, ".claude/settings.json") == '{"kit": 1}\n', "38.52: settings.json che manca: scritto")
        # C511 p.6: parti dentro il progetto → fermo, niente scritto
        dentro = os.path.join(progetto2, "docs", "kit-parti")
        os.makedirs(dentro)
        for n in os.listdir(parti):
            scrivi(dentro, n, open(os.path.join(parti, n), encoding="utf-8").read())
        rc, out = lancia(progetto2, dentro, "--scrivi")
        controlla(rc == 2 and "dentro il progetto" in out and "fuori dal repo" in out, "p.6: parti dentro il progetto: fermo")
        # C511 p.9: tetto di CLAUDE.md misurato subito
        controlla("CLAUDE.md: non c'è ancora" in out or "CLAUDE.md: non c'è ancora" in lancia(progetto2, parti)[1],
                  "p.9: senza CLAUDE.md lo dice")
        scrivi(progetto2, "CLAUDE.md", "x" * 2000)
        controlla("dentro il tetto" in lancia(progetto2, parti)[1], "p.9: CLAUDE.md corto: dentro il tetto")
        scrivi(progetto2, "CLAUDE.md", "x" * 2200)
        rc, out = lancia(progetto2, parti)
        controlla(rc == 0 and "ATTENZIONE CLAUDE.md: ~1048 token stimati, tetto 1000" in out, "p.9: CLAUDE.md lungo: avviso subito")

        # parti mancanti, doppie, percorsi fuori dal progetto: si ferma senza scrivere
        os.remove(os.path.join(parti, "PACCHETTO-v38-2di2.md"))
        rc, out = lancia(progetto, parti, "--scrivi")
        controlla(rc == 2 and "mancano le parti [2] di 2" in out, "parte mancante: fermo")
        parte(parti, 2, 2, [blocco("tools/altro.py", "x\n")])
        parte(parti, 1, 1, [blocco("tools/altro.py", "x\n")], nome="PACCHETTO-v38-indipendente-{i}di{n}.md")
        rc, out = lancia(progetto, parti)
        controlla(rc == 2 and "più pacchetti" in out, "due pacchetti nella stessa cartella: fermo")
        for cattivo in ("../fuori.py", "/etc/x", "tools/../../fuori.py", "tools\\x.py"):
            sola = os.path.join(tmp, "cattivo")
            os.makedirs(sola, exist_ok=True)
            for n in os.listdir(sola):
                os.remove(os.path.join(sola, n))
            parte(sola, 1, 1, [blocco("tools/buono.py", "b\n"), blocco(cattivo, "male\n")])
            rc, out = lancia(progetto, sola, "--scrivi")
            controlla(rc == 2 and "percorso non ammesso" in out and leggi(progetto, "tools/buono.py") is None,
                      f"percorso «{cattivo}»: fermo prima di scrivere")
        parte(sola, 1, 1, [blocco("tools/a.py", "a\n"), blocco("tools/a.py", "b\n")])
        rc, out = lancia(progetto, sola)
        controlla(rc == 2 and "due volte" in out, "stesso file due volte: fermo")
        rc, out = lancia(progetto, sola, "--forza")
        controlla(rc == 2 and "Uso:" in out, "opzione sconosciuta: uso")
        # C511 p.26: diario del progetto già lì → cambia solo la sezione «Lezioni ereditate», le sue righe restano
        diario = "# Diario\n\nintro mia\n\n## Lezioni ereditate (vecchie)\n- E1 vecchia\n\n## Errori di questo progetto\n- E9 mia\n"
        scrivi(progetto, "docs/ERRORI.md", diario)
        kit = "# Diario\n\n## Lezioni ereditate (numeri)\n- E1 nuova\n- E2 nuova\n\n## Errori di questo progetto\n"
        for n in os.listdir(sola):
            os.remove(os.path.join(sola, n))
        parte(sola, 1, 1, [blocco("docs/ERRORI.md", kit)])
        rc, out = lancia(progetto, sola, "--scrivi")
        dopo = leggi(progetto, "docs/ERRORI.md")
        controlla("1 righe di prima non ci sono più (E1 vecchia)" in out, "C511 p.10: riga tolta dalle ereditate detta: " + out[-300:])
        controlla(rc == 0 and "E2 nuova" in dopo and "E1 vecchia" not in dopo and "- E9 mia" in dopo and "intro mia" in dopo,
                  "C511 p.26: ereditate rifatte, righe del progetto tenute: " + repr(dopo))
        rc, out = lancia(progetto, sola, "--scrivi")
        controlla(leggi(progetto, "docs/ERRORI.md") == dopo and "c'è già" in out, "C511 p.26: la seconda volta niente cambia")
        controlla("Copie vecchie:" in out and "docs/ERRORI.md.prima-del-kit" in out, "C511 p.13: copia vecchia detta: " + out[-300:])
        scrivi(progetto, "docs/ERRORI.md", "# Diario\n\n## Errori di questo progetto\n- E9 mia\n")
        rc, out = lancia(progetto, sola, "--scrivi")
        dopo = leggi(progetto, "docs/ERRORI.md")
        controlla(dopo.index("E2 nuova") < dopo.index("E9 mia"), "C511 p.26: sezione che mancava messa prima delle altre: " + repr(dopo))
    print("ERRORI:", ERRORI)
    return 1 if ERRORI else 0


if __name__ == "__main__":
    sys.exit(main())
