#!/usr/bin/env python3
# Prova di tools/scarica-kit.py (C259): versione e parti del pacchetto da un RVC finto (server locale), chiave mancante,
# rete chiusa. Uso: python3 -I tools/test-scarica-kit.py
import functools, http.server, os, subprocess, sys, tempfile, threading

QUI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(QUI, "scarica-kit.py")
ok_n = 0


def controlla(cond, nome, uscita=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", uscita)
        sys.exit(1)
    ok_n += 1


def esegui(*arg, **env_extra):
    env = {k: v for k, v in os.environ.items() if k not in ("RVC_KIT_TOKEN", "RVC_KIT_URL")}
    env.update(env_extra)
    r = subprocess.run([sys.executable, "-I", SCRIPT, *arg], capture_output=True, text=True, env=env)
    return r.returncode, r.stdout.strip()


class Muto(http.server.SimpleHTTPRequestHandler):
    visti = []

    def log_message(self, *a):
        pass

    def do_GET(self):
        Muto.visti.append(self.headers.get("Authorization"))
        super().do_GET()


with tempfile.TemporaryDirectory() as rvc, tempfile.TemporaryDirectory() as fuori:
    kit = os.path.join(rvc, "docs", "kit-progetto")
    os.makedirs(os.path.join(kit, "pacchetto"))
    with open(os.path.join(kit, "VERSIONE"), "w") as f:
        f.write("kit 31.2 · 1/11/2026 · Preferenze v31\n")
    for nome in ("PACCHETTO-v31-", "PACCHETTO-v31-indipendente-"):
        for i in (1, 2, 3):
            with open(os.path.join(kit, "pacchetto", f"{nome}{i}di3.md"), "w") as f:
                f.write(f"# {nome}{i}\n")
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Muto, directory=rvc))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_address[1]}"

    c, out = esegui("--versione")
    controlla(c == 2 and "RVC_KIT_TOKEN" in out, "senza chiave: uscita 2 e lo dice", out)

    c, out = esegui("--versione", RVC_KIT_TOKEN="segreto", RVC_KIT_URL=url)
    controlla(c == 0 and out == "kit 31.2 · 1/11/2026 · Preferenze v31", "versione letta da RVC", out)
    controlla(Muto.visti[-1] == "token segreto", "la chiave va nell'intestazione", str(Muto.visti[-1:]))
    controlla("segreto" not in out, "la chiave non esce mai a schermo", out)

    dove = os.path.join(fuori, "kit-nuovo")
    c, out = esegui("--cartella", dove, RVC_KIT_TOKEN="segreto", RVC_KIT_URL=url)
    controlla(c == 0 and sorted(os.listdir(dove)) == [f"PACCHETTO-v31-{i}di3.md" for i in (1, 2, 3)], "3 parti scaricate", out)
    controlla("3 parti" in out, "dice quante parti", out)

    dove2 = os.path.join(fuori, "ind")
    c, out = esegui("--cartella", dove2, "--indipendente", RVC_KIT_TOKEN="segreto", RVC_KIT_URL=url)
    controlla(c == 0 and len(os.listdir(dove2)) == 3 and all("indipendente" in n for n in os.listdir(dove2)), "pacchetto indipendente", out)

    server.shutdown()
    c, out = esegui("--versione", RVC_KIT_TOKEN="segreto", RVC_KIT_URL=url)
    controlla(c == 3 and "non raggiungibile" in out, "rete chiusa: uscita 3, nessun errore lungo", out)

print(f"OK: {ok_n} controlli di scarica-kit.py")
