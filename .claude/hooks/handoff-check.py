#!/usr/bin/env python3
# Ricorda a Claude il protocollo di handoff di CLAUDE.md: >= 20 messaggi nella sessione o contesto >= 80%.
import json, os, sys

MAX_PROMPTS = 20
WINDOW = int(os.environ.get("JONA_CTX_WINDOW", "0"))
EVERY = 5

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
sid = str(data.get("session_id") or "x").replace("/", "_")
state_dir = os.path.join(os.path.expanduser("~"), ".claude", "handoff-check")
os.makedirs(state_dir, exist_ok=True)
state_file = os.path.join(state_dir, sid + ".json")
try:
    with open(state_file) as f:
        st = json.load(f)
except Exception:
    st = {"n": 0}
st["n"] += 1
with open(state_file, "w") as f:
    json.dump(st, f)

ctx = 0
tp = data.get("transcript_path")
if tp and os.path.exists(tp):
    with open(tp, "rb") as f:
        f.seek(max(0, os.path.getsize(tp) - 2_000_000))
        lines = f.read().decode("utf-8", "ignore").splitlines()
    for line in reversed(lines):
        try:
            u = (json.loads(line).get("message") or {}).get("usage")
        except Exception:
            continue
        if u:
            ctx = sum(int(u.get(k) or 0) for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
            break

window = WINDOW or (1_000_000 if ctx > 200_000 else 200_000)
n, pct = st["n"], round(100 * ctx / window)
over = n >= MAX_PROMPTS or pct >= 80
if not over or ("last" in st and n - st["last"] < EVERY):
    sys.exit(0)
st["last"] = n
with open(state_file, "w") as f:
    json.dump(st, f)
why = f"{n} messaggi in questa sessione" + (f", contesto circa {pct}%" if ctx else "")
print(json.dumps({
    "systemMessage": f"Regola 80%: {why}. Claude deve proporre il passaggio di consegne.",
    "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": f"PROTOCOLLO DI HANDOFF (CLAUDE.md) ATTIVATO: {why}. Prima di altro lavoro: rispondi al messaggio, poi scrivi docs/PASSAGGIO-CONSEGNE.md, verifica le condizioni e chiedi a Mario il permesso di aprire una nuova sessione."
    }
}))
