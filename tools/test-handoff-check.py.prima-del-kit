#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/handoff-check.py: scatta SOLO oltre la soglia di token (o dopo una compressione),
# mai per il numero di messaggi (regola di Mario, RVC #115 / Jona #127). Uso: python3 -I tools/test-handoff-check.py
import json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks", "handoff-check.py")
casa = tempfile.mkdtemp()
env = dict(os.environ, HOME=casa)
env.pop("JONA_CTX_SOGLIA", None)
ko = 0


def gira(sid, ctx, *arg):
    tp = os.path.join(casa, sid + ".jsonl")
    with open(tp, "w") as f:
        f.write(json.dumps({"message": {"usage": {"input_tokens": 1, "cache_read_input_tokens": ctx}}}) + "\n")
    r = subprocess.run([sys.executable, "-I", HOOK, *arg], input=json.dumps({"session_id": sid, "transcript_path": tp}),
                       capture_output=True, text=True, env=env)
    return r.stdout.strip()


def prova(nome, ok):
    global ko
    print(("PASS " if ok else "FAIL ") + nome)
    ko += 0 if ok else 1


uscite = [gira("pochi", 50_000) for _ in range(25)]
prova("25 messaggi sotto la soglia: nessun avviso", all(u == "" for u in uscite))
u = gira("tanti", 210_000)
prova("contesto 210k: avviso di handoff", "PROTOCOLLO DI HANDOFF" in u and "210k" in u)
prova("l'avviso non parla di messaggi", "messaggi in questa sessione" not in u)
u = gira("compressa", 10_000, "compact")
prova("dopo una compressione: avviso", "compressa" in u)
prova("dopo la compressione l'avviso resta", "PROTOCOLLO DI HANDOFF" in gira("compressa", 10_000))
sys.exit(1 if ko else 0)
