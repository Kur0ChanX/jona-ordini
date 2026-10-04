#!/usr/bin/env python3
# Protocollo di handoff di CLAUDE.md. Scatta con >= 20 messaggi nella sessione o con il contesto oltre SOGLIA_TOKENS
# (70% di 200k: soglia fissa per risparmiare token, qualunque sia la finestra del modello) e lo ripete a OGNI messaggio.
# Con l'argomento «compact» (hook SessionStart dopo una compressione) rimette l'obbligo nel contesto nuovo:
# la compressione cancella gli avvisi precedenti.
import json, os, sys

MAX_PROMPTS = 20
SOGLIA = 70
SOGLIA_TOKENS = int(os.environ.get("JONA_CTX_SOGLIA", "140000"))
AZIONE = ("Prima di qualsiasi altro lavoro: rispondi in breve al messaggio, poi aggiorna docs/PASSAGGIO-CONSEGNE.md "
          "(max 1000 parole, con le richieste dell'utente ancora da fare), verifica le condizioni e, se sono tutte vere, "
          "apri da solo la nuova sessione (titolo «▶ ATTIVA · …», prompt di massimo 3 righe) e rinomina questa in «✓ CHIUSA · …». "
          "Non iniziare lavori nuovi in questa sessione.")

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
evento = "SessionStart" if "compact" in sys.argv[1:] else "UserPromptSubmit"
sid = str(data.get("session_id") or "x").replace("/", "_")
state_dir = os.path.join(os.path.expanduser("~"), ".claude", "handoff-check")
os.makedirs(state_dir, exist_ok=True)
state_file = os.path.join(state_dir, sid + ".json")
try:
    with open(state_file) as f:
        st = json.load(f)
except Exception:
    st = {"n": 0}


def esci(why):
    print(json.dumps({
        "systemMessage": f"Regola {SOGLIA}%: {why}. Claude deve fare il passaggio di consegne.",
        "hookSpecificOutput": {"hookEventName": evento,
                               "additionalContext": f"PROTOCOLLO DI HANDOFF (CLAUDE.md) OBBLIGATORIO: {why}. {AZIONE}"}
    }))
    sys.exit(0)


if evento == "SessionStart":
    st["compattata"] = st.get("compattata", 0) + 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    esci("la conversazione è stata compressa perché il contesto era pieno")

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

n = st["n"]
if n >= MAX_PROMPTS or ctx >= SOGLIA_TOKENS or st.get("compattata"):
    parti = [f"{n} messaggi in questa sessione"]
    if ctx:
        parti.append(f"contesto circa {ctx // 1000}k token (soglia {SOGLIA_TOKENS // 1000}k)")
    if st.get("compattata"):
        parti.append("conversazione già compressa")
    esci(", ".join(parti))
