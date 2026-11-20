#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/impegno-check.py (C225), con un progetto finto.
# Uso: python3 -I tools/test-impegno-check.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "impegno-check.py")
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def lancia(dati, env_effort=None, sessione="s1"):
    env = {k: v for k, v in os.environ.items() if k != "CLAUDE_EFFORT"}
    env.update({"CLAUDE_PROJECT_DIR": progetto, "IMPEGNO_STATO": stato})
    if env_effort:
        env["CLAUDE_EFFORT"] = env_effort
    if isinstance(dati, dict):
        dati = json.dumps({"session_id": sessione, **dati})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30, env=env)
    testo = json.loads(r.stdout).get("hookSpecificOutput", {}).get("additionalContext", "") if r.stdout.strip() else ""
    return r.returncode, testo


radice = tempfile.mkdtemp(prefix="prova-impegno-")
progetto, stato = os.path.join(radice, "progetto"), os.path.join(radice, "stato")
os.makedirs(os.path.join(progetto, ".claude"))
os.makedirs(stato)
try:
    with open(os.path.join(progetto, ".claude", "settings.json"), "w") as f:
        json.dump({"effortLevel": "xhigh"}, f)

    c, t = lancia({"effort": {"level": "xhigh"}})
    controlla(c == 0 and t == "", "impegno giusto: silenzio", t)
    c, t = lancia({}, env_effort="xhigh")
    controlla(c == 0 and t == "", "impegno giusto dalla variabile: silenzio", t)
    c, t = lancia({})
    controlla(c == 0 and t == "", "impegno assente: silenzio", t)

    c, t = lancia({"effort": {"level": "medium"}})
    controlla(c == 0 and "«medium» (Medio)" in t and "**Extra**" in t, "Medio al posto di Extra: avviso", t)
    c, t = lancia({"effort": {"level": "medium"}})
    controlla(t == "", "stesso valore: una volta sola", t)
    c, t = lancia({}, env_effort="high")
    controlla("(Alto)" in t, "valore nuovo dalla variabile: avviso di nuovo", t)
    c, t = lancia({"effort": "medium"}, sessione="s2")
    controlla("(Medio)" in t, "altra sessione, effort come testo", t)
    c, t = lancia({"effort": {"level": "low"}}, env_effort="xhigh", sessione="s3")
    controlla("(Basso)" in t, "l'entrata vince sulla variabile", t)

    os.remove(os.path.join(progetto, ".claude", "settings.json"))
    c, t = lancia({"effort": {"level": "medium"}}, sessione="s4")
    controlla(c == 0 and t == "", "senza settings.json: silenzio", t)
    c, t = lancia("non è json")
    controlla(c == 0 and t == "", "entrata illeggibile: silenzio", t)
finally:
    shutil.rmtree(radice, ignore_errors=True)

print(f"OK: {ok_n} controlli")
