#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/foto-chieste.py (C516, E498: foto e video pronti per Mario e mai chiesti), su un
# progetto finto in una cartella temporanea (E399). I casi vengono dalle cartelle vere del 13/11 (C480 609–612).
# Uso: python3 -I tools/test-foto-chieste.py
import json, os, shutil, subprocess, sys, tempfile, time
from datetime import datetime, timezone

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "foto-chieste.py")
ok_n = 0
ADESSO = int(time.time())
INIZIO = ADESSO - 3600  # la sessione finta è cominciata un'ora fa


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def iso(secondi):
    return datetime.fromtimestamp(secondi, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def git(progetto, *argomenti, quando=None):
    env = dict(os.environ, GIT_AUTHOR_NAME="p", GIT_AUTHOR_EMAIL="p@p", GIT_COMMITTER_NAME="p",
               GIT_COMMITTER_EMAIL="p@p")
    if quando:
        env["GIT_COMMITTER_DATE"] = env["GIT_AUTHOR_DATE"] = f"{quando} +0000"
    r = subprocess.run(["git", *argomenti], cwd=progetto, capture_output=True, text=True, env=env)
    controlla(r.returncode == 0, f"git {' '.join(argomenti)}: {r.stderr.strip()[:200]}")
    return r.stdout


def scrivi(progetto, relativo, testo="x\n", nato=None):
    p = os.path.join(progetto, relativo)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(testo)
    if nato:
        os.utime(p, (nato, nato))


def da_fare(progetto, righe=()):
    scrivi(progetto, "docs/DA-FARE.md", "# Da fare\n\n## 0. Aspetta Mario\n\n" + "".join(f"- 18/11 · 📒 Prova 1 · {r}\n"
           for r in righe) + "\n## Lavori\n\n| C1 | voce · prova: foto `archivio/C1/nella-tabella/` |\n")


def salva(progetto, messaggio, quando=None):
    git(progetto, "add", "-A")
    git(progetto, "commit", "-qm", messaggio, quando=quando or ADESSO - 600)


class Registro:
    """Trascrizione finta: la prima riga dà l'inizio della sessione, poi gli invii con lo strumento dei file."""

    def __init__(self, cartella, inizio=INIZIO):
        self.file = os.path.join(cartella, "registro.jsonl")
        self.n = 0
        with open(self.file, "w", encoding="utf-8") as f:
            f.write(json.dumps({"type": "queue-operation", "timestamp": iso(inizio)}) + "\n")

    def manda(self, file, quando, fallito=False):
        self.n += 1
        ident = f"toolu_{self.n}"
        with open(self.file, "a", encoding="utf-8") as f:
            f.write(json.dumps({"type": "assistant", "timestamp": iso(quando), "message": {"content": [
                {"type": "tool_use", "id": ident, "name": "SendUserFile", "input": {"files": file}}]}}) + "\n")
            f.write(json.dumps({"type": "user", "timestamp": iso(quando), "message": {"content": [
                {"type": "tool_result", "tool_use_id": ident, "is_error": fallito, "content": "x"}]}}) + "\n")


def hook(progetto, registro, secondo_giro=False, grezzo=None, argomenti=()):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto)
    entrata = grezzo if grezzo is not None else json.dumps(
        {"transcript_path": registro.file if registro else "", "stop_hook_active": secondo_giro})
    r = subprocess.run([sys.executable, "-I", HOOK, *argomenti], input=entrata, capture_output=True, text=True,
                       env=env, cwd=progetto)
    return r.returncode, r.stderr.strip(), r.stdout.strip()


def progetto_nuovo(base, nome):
    prog = os.path.join(base, nome)
    os.makedirs(prog)
    git(prog, "init", "-q", "-b", "lavoro")
    da_fare(prog)
    scrivi(prog, "archivio/leggimi.md")
    salva(prog, "inizio", quando=INIZIO - 7200)  # prima della sessione: non è un commit «mio»
    return prog, Registro(os.path.join(base, nome + "-registro") if os.makedirs(
        os.path.join(base, nome + "-registro")) is None else "")


base = tempfile.mkdtemp(prefix="test-foto-chieste-")
try:
    # 1 · Niente foto: silenzio.
    prog, reg = progetto_nuovo(base, "a")
    controlla(hook(prog, reg)[0] == 0, "niente foto: passa")

    # 2 · Il caso di E498: foto salvate dalla sessione, non mandate, senza riga (solo nella tabella) → ferma.
    scrivi(prog, "archivio/C1/foto-609/1-imprevisti.png", nato=ADESSO - 900)
    scrivi(prog, "archivio/C1/foto-609/2-letto.png", nato=ADESSO - 900)
    scrivi(prog, "archivio/C1/nella-tabella/vista-larga.png", nato=ADESSO - 900)
    scrivi(prog, "archivio/C1/foto-612/video.mp4", nato=ADESSO - 900)
    scrivi(prog, "archivio/C1/note.md")
    salva(prog, "foto per Mario")
    codice, errore, _ = hook(prog, reg)
    controlla(codice == 2, "E498: foto non mandate e senza riga → ferma")
    controlla("archivio/C1/foto-609/ (2 file)" in errore and "foto-612/" in errore and "nella-tabella/" in errore,
              "E498: il messaggio nomina le cartelle (anche quella citata solo nella tabella)")
    controlla("note.md" not in errore and "\n" not in errore, "solo foto e video, una riga sola")
    controlla(hook(prog, reg, secondo_giro=True)[0] == 0, "secondo giro: silenzio")
    controlla(hook(prog, reg)[0] == 2, "turno dopo, ancora aperte: ferma di nuovo")

    # 3 · Modo --aperte (consegne): uscita 1 e le cartelle.
    codice, _, uscita = hook(prog, None, argomenti=("--aperte", "--trascrizione", reg.file))
    controlla(codice == 1 and "archivio/C1/foto-609/ (2 file)" in uscita, "--aperte: uscita 1 con le cartelle")

    # 4 · Mandate: lo stesso file (percorso intero o relativo) chiude quel file; la cartella vuole l'invio DOPO.
    reg.manda([os.path.join(prog, "archivio/C1/foto-612/video.mp4")], ADESSO - 300)
    reg.manda(["archivio/C1/nella-tabella/vista-larga.png"], ADESSO - 300, fallito=True)
    errore = hook(prog, reg)[1]
    controlla("foto-612" not in errore, "stesso file mandato: a posto")
    controlla("nella-tabella" in errore, "invio rifiutato (is_error): non conta")
    reg.manda(["archivio/C1/foto-609/1-imprevisti.png"], ADESSO - 300)
    controlla("foto-609" not in hook(prog, reg)[1], "un file della cartella mandato dopo la nascita: cartella a posto")
    scrivi(prog, "archivio/C1/foto-609/3-fatta-dopo.png", nato=ADESSO - 100)
    salva(prog, "foto fatta dopo l'invio")
    controlla("archivio/C1/foto-609/ (1 file)" in hook(prog, reg)[1],
              "foto nata dopo l'ultimo invio della cartella: aperta (cartelle di sessione)")

    # 5 · Citata nella sezione 0: a posto, e resta a posto quando Mario risponde e la riga va via.
    da_fare(prog, ["Foto della vista larga: vanno bene? `archivio/C1/nella-tabella/` e `archivio/C1/foto-609`"])
    controlla(hook(prog, reg)[0] == 0, "riga col percorso della cartella: passa")
    da_fare(prog)
    controlla(hook(prog, reg)[0] == 0, "riga tolta dopo la risposta: non tornano aperte (memoria in .git/)")
    controlla(os.path.exists(os.path.join(prog, ".git", "foto-chieste.json")), "memoria in .git/")
    controlla(hook(prog, None, argomenti=("--aperte", "--trascrizione", reg.file))[0] == 0, "--aperte: uscita 0")

    # 6 · Non per Mario: ricevute («mario»), di lavoro, rapporti, collaudo; file non ancora in commit.
    prog, reg = progetto_nuovo(base, "b")
    for f in ("archivio/C2/foto-mario/schermo.jpg", "archivio/C2/giri12/mario-1133.jpg", "archivio/C2/lavoro/misura.png",
              "archivio/C2/rapporti/figura.png", "archivio/C2/collaudo/esito.png", "archivio/C2/s9/lavoro-difetto.png"):
        scrivi(prog, f, nato=ADESSO - 900)
    salva(prog, "ricevute e di lavoro")
    controlla(hook(prog, reg)[0] == 0, "ricevute da Mario e di lavoro: passano")
    scrivi(prog, "archivio/C2/foto-1/a-meta.png", nato=ADESSO - 50)
    controlla(hook(prog, reg)[0] == 0, "file non ancora in commit (lavoro a metà): passa")

    # 7 · Foto delle altre chat arrivate con un merge (vero o veloce) e commit di prima della sessione: non contano.
    os.remove(os.path.join(prog, "archivio/C2/foto-1/a-meta.png"))
    altra = os.path.join(base, "b-altra-chat")  # l'altra chat lavora in un'altra copia: i suoi commit arrivano col fetch
    git(base, "clone", "-q", prog, altra)
    scrivi(altra, "archivio/C9/foto-altra/x.png")
    salva(altra, "foto dell'altra chat")
    scrivi(prog, "docs/nota.md")
    salva(prog, "lavoro mio senza foto")
    git(prog, "fetch", "-q", altra, "lavoro")
    git(prog, "merge", "-q", "--no-ff", "-m", "merge", "FETCH_HEAD", quando=ADESSO - 500)
    controlla(os.path.isfile(os.path.join(prog, "archivio/C9/foto-altra/x.png")), "merge vero: la foto è arrivata")
    controlla(hook(prog, reg)[0] == 0, "merge vero: le foto dell'altra chat non contano")
    git(altra, "pull", "-q", "--ff-only", prog, "lavoro")
    scrivi(altra, "archivio/C9/foto-altra/y.png")
    salva(altra, "altra foto dell'altra chat")
    git(prog, "fetch", "-q", altra, "lavoro")
    git(prog, "merge", "-q", "--ff-only", "FETCH_HEAD")
    controlla(os.path.isfile(os.path.join(prog, "archivio/C9/foto-altra/y.png")), "merge veloce: la foto è arrivata")
    controlla(hook(prog, reg)[0] == 0, "merge veloce (fast-forward): le foto dell'altra chat non contano")
    prog, reg = progetto_nuovo(base, "c")
    scrivi(prog, "archivio/C3/foto-vecchia/x.png", nato=INIZIO - 5000)
    salva(prog, "foto di una sessione di prima", quando=INIZIO - 4000)
    controlla(hook(prog, reg)[0] == 0, "commit di prima dell'inizio della trascrizione: non conta")

    # 8 · Pezzi e confronti mandati da un'altra cartella; nomi accorciati; cartella di tutto un lavoro.
    for f in ("archivio/C3/pagina.png", "archivio/C3/foto-1.png", "archivio/C3/foto-2.png", "archivio/C3/sub/b.png",
              "archivio/C4/dopo.png", "archivio/C5/x/altro.png"):
        scrivi(prog, f, nato=ADESSO - 900)
    salva(prog, "foto varie")
    reg.manda(["/tmp/pezzi/pagina-1di2.png", "/tmp/pezzi/pagina-2di2.png"], ADESSO - 200)
    reg.manda(["/tmp/pezzi/dopo-confronto.png"], ADESSO - 200)
    errore = hook(prog, reg)[1]
    controlla("archivio/C4/" not in errore, "confronto mandato da un'altra cartella: a posto")
    controlla("archivio/C3/ (2 file)" in errore, "pezzi mandati: la foto intera è a posto, le altre due no")
    controlla("archivio/C5/x/" in errore, "nome diverso: resta aperta")
    da_fare(prog, ["Foto del foglio: `archivio/C3/foto-1…3`, mandate in chat"])
    errore = hook(prog, reg)[1]
    controlla("archivio/C3/ (" not in errore, "nome accorciato «foto-1…3»: vale la sua cartella")
    controlla("archivio/C3/sub/ (1 file)" in errore, "cartella di tutto un lavoro: non copre le sottocartelle")
    da_fare(prog, ["Foto: `archivio/C3/sub/b.png` e `archivio/C5/x/`."])
    controlla(hook(prog, reg)[0] == 0, "file citato per intero e cartella col punto in fondo: passa")

    # 9 · Progetti senza archivio o senza sezione 0, ingressi rotti: silenzio. Arretrati: sempre uscita 0.
    prog, reg = progetto_nuovo(base, "d")
    scrivi(prog, "docs/DA-FARE.md", "# Da fare\n\n## Lavori\n")
    scrivi(prog, "archivio/C6/foto-1/a.png", nato=ADESSO - 900)
    salva(prog, "progetto senza sezione 0")
    controlla(hook(prog, reg)[0] == 0, "senza «## 0. Aspetta Mario»: silenzio")
    vuoto = os.path.join(base, "e")
    os.makedirs(vuoto)
    controlla(hook(vuoto, None)[0] == 0, "cartella senza git né archivio: silenzio")
    controlla(hook(prog, reg, grezzo="non json")[0] == 0, "ingresso rotto: silenzio")
    da_fare(prog)
    salva(prog, "sezione 0")
    codice, _, uscita = hook(prog, None, argomenti=("--arretrati", "14"))
    controlla(codice == 0 and "archivio/C6/foto-1/ · 1 file" in uscita and "1 cartelle su 1" in uscita,
              "--arretrati: elenca la cartella mai citata, uscita 0")

    # 11 · Foto rifatta sopra lo stesso file (C516 «Poi», Kit 45): un invio o una riga di prima non bastano.
    prog, reg = progetto_nuovo(base, "g")
    scrivi(prog, "archivio/C8/foto-1/a.png", "prima\n", nato=ADESSO - 900)
    scrivi(prog, "archivio/C8/foto-2/b.png", "prima\n", nato=ADESSO - 900)
    scrivi(prog, "archivio/C8/foto-3/c.png", "prima\n", nato=ADESSO - 900)
    salva(prog, "foto per Mario")
    reg.manda(["archivio/C8/foto-1/a.png"], ADESSO - 800)
    da_fare(prog, ["Foto 2 e 3: vanno bene? `archivio/C8/foto-2/` `archivio/C8/foto-3/`"])
    controlla(hook(prog, reg)[0] == 0, "rifatta, prima: una mandata e due citate → passa")
    memoria = os.path.join(prog, ".git", "foto-chieste.json")
    with open(memoria, encoding="utf-8") as f:
        voci = json.load(f)["citate"]
    controlla(len(voci) == 2 and all("@" in v for v in voci), f"memoria: percorso e contenuto ({voci})")
    # la terza come la ricordava il kit di prima (solo il percorso): vale finché la foto non è rifatta
    with open(memoria, "w", encoding="utf-8") as f:
        json.dump({"citate": [v if "foto-2" in v else v.split("@")[0] for v in voci]}, f)
    da_fare(prog)  # Mario risponde «cambia»: le righe vanno via
    controlla(hook(prog, reg)[0] == 0, "rifatta, prima: righe tolte → restano chiuse (memoria nuova e vecchia)")
    for nome in ("foto-1/a.png", "foto-2/b.png", "foto-3/c.png"):
        scrivi(prog, f"archivio/C8/{nome}", "rifatta\n", nato=ADESSO - 100)
    salva(prog, "foto rifatte sopra gli stessi file")
    codice, errore, _ = hook(prog, reg)
    controlla(codice == 2 and all(f"archivio/C8/foto-{n}/ (1 file)" in errore for n in (1, 2, 3)),
              f"rifatte sopra lo stesso file: tornano aperte tutte e tre ({errore[:200]})")
    reg.manda(["archivio/C8/foto-1/a.png"], ADESSO - 50)
    da_fare(prog, ["Foto 2 rifatta: va bene? `archivio/C8/foto-2/b.png`"])
    codice, errore, _ = hook(prog, reg)
    controlla(codice == 2 and "foto-3/ (1 file)" in errore and "foto-1/" not in errore and "foto-2/" not in errore,
              "rifatte: rimandata dopo la rinascita e riga nuova → a posto; la terza resta aperta")
    da_fare(prog)
    controlla("foto-2/" not in hook(prog, reg)[1], "rifatta e citata, riga tolta: resta chiusa (memoria col contenuto)")

    # 12 · Arretrati su copia corta: il commit del taglio non dà per «aggiunto» tutto l'archivio; niente doppioni.
    prog, reg = progetto_nuovo(base, "h")
    for i in range(3):
        scrivi(prog, f"archivio/C9/vecchia-{i}/a.png")
    salva(prog, "foto vecchie")
    scrivi(prog, "archivio/C9/taglio/a.png")
    salva(prog, "commit che nella copia corta è il taglio")
    scrivi(prog, "archivio/C9/nuova/a.png")
    salva(prog, "foto nuova")
    corta = os.path.join(base, "h-corta")
    git(base, "clone", "-q", "--depth", "2", "file://" + prog, corta)
    codice, _, uscita = hook(corta, None, argomenti=("--arretrati", "14"))
    controlla(codice == 0 and "archivio/C9/nuova/ · 1 file" in uscita and "1 cartelle su 1" in uscita
              and "storia corta" in uscita, f"--arretrati su copia corta: conta solo la foto nuova ({uscita[-160:]})")
    git(prog, "rm", "-q", "archivio/C9/nuova/a.png")
    salva(prog, "foto tolta")
    scrivi(prog, "archivio/C9/nuova/a.png")
    salva(prog, "foto rimessa")
    codice, _, uscita = hook(prog, None, argomenti=("--arretrati", "14"))
    controlla("archivio/C9/nuova/ · 1 file" in uscita and "5 cartelle su 5" in uscita and "storia corta" not in uscita,
              f"--arretrati su copia intera: 5 cartelle, il file aggiunto due volte conta una ({uscita[-160:]})")

    # 10 · Tempo: l'hook gira a ogni fine turno (E224).
    prog, reg = progetto_nuovo(base, "f")
    for i in range(60):
        scrivi(prog, f"archivio/C7/foto-{i}/a.png", nato=ADESSO - 900)
        salva(prog, f"foto {i}")
    with open(reg.file, "a", encoding="utf-8") as f:
        for i in range(20000):
            f.write(json.dumps({"type": "assistant", "timestamp": iso(ADESSO), "message": {"content": [
                {"type": "text", "text": "riga lunga " * 40}]}}) + "\n")
    t0 = time.time()
    controlla(hook(prog, reg)[0] == 2, "60 commit e 20.000 righe di trascrizione: ferma")
    durata = time.time() - t0
    controlla(durata < 3, f"tempo sotto 3 secondi ({durata:.2f})")
finally:
    shutil.rmtree(base, ignore_errors=True)

print(f"test-foto-chieste: {ok_n} controlli ok · caso pesante {durata:.2f} s")
