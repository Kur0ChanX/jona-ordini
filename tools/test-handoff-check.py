#!/usr/bin/env python3
# Prova dell'hook della soglia (.claude/hooks/handoff-check.py). Uso: python3 -I tools/test-handoff-check.py
import json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "handoff-check.py")
casa = tempfile.mkdtemp()
esiti = []


def trascrizione(token):
    p = os.path.join(casa, f"t{token}.jsonl")
    with open(p, "w") as f:
        f.write(json.dumps({"message": {"usage": {"input_tokens": 10, "cache_read_input_tokens": token}}}) + "\n")
    return p


def lancia(sid, token, arg=None, **extra):
    dati = {"session_id": sid, "transcript_path": trascrizione(token), **extra}
    r = subprocess.run([sys.executable, "-I", HOOK] + ([arg] if arg else []), input=json.dumps(dati),
                       capture_output=True, text=True, env={**os.environ, "HOME": casa}, timeout=10)
    return json.loads(r.stdout) if r.stdout.strip() else None


def prova(nome, ok):
    esiti.append(ok)
    print(("OK  " if ok else "NO  ") + nome)


def testo(o):
    return o["hookSpecificOutput"]["additionalContext"] if o else ""


prova("sotto soglia: messaggio muto", lancia("a", 50_000) is None)
prova("sotto soglia: strumento muto", lancia("a", 50_000, "tool") is None)
o = lancia("a", 260_000, "tool")
prova("oltre soglia dopo uno strumento: avviso completo", "OBBLIGATORIO" in testo(o)
      and o["hookSpecificOutput"]["hookEventName"] == "PostToolUse" and o["systemMessage"].startswith("Soglia 250k"))
prova("secondo strumento oltre soglia: muto", lancia("a", 261_000, "tool") is None)
prova("messaggio dopo l'avviso: riga corta", "ancora da fare" in testo(lancia("a", 262_000)))
prova("dentro un aiutante: muto", lancia("b", 260_000, "tool", agent_id="x") is None)
prova("messaggio oltre soglia la prima volta: avviso completo", "OBBLIGATORIO" in testo(lancia("c", 255_000)))
prova("dopo una compressione: avviso completo", "OBBLIGATORIO" in testo(lancia("d", 10_000, "compact")))
prova("messaggio dopo la compressione: di nuovo completo", "OBBLIGATORIO" in testo(lancia("d", 10_000)))
for _ in range(60):
    ultimo = lancia("e", 1_000)
prova("60 messaggi sotto soglia: muto (niente regola dei 40)", ultimo is None)
prova("messaggio oltre soglia: avviso col numero dei messaggi", "61 messaggi" in testo(lancia("e", 251_000)))
prova("gli strumenti non contano come messaggi", lancia("f", 1_000, "tool") is None
      and not os.path.exists(os.path.join(casa, ".claude", "handoff-check", "f.json")))

print(f"{sum(esiti)}/{len(esiti)} prove dell'hook della soglia verdi")
sys.exit(0 if all(esiti) else 1)
