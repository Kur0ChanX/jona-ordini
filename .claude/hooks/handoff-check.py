#!/usr/bin/env python3
# Protocollo di handoff di CLAUDE.md. Scatta con il contesto oltre SOGLIA_TOKENS
# (250k, Mario #149: la partenza costa ~100k; soglia fissa per risparmiare token, qualunque sia la finestra del modello) e lo ripete a OGNI messaggio:
# testo completo la prima volta, poi una riga corta (C81, #108). Regola dei 40 messaggi tolta da Mario nella #115:
# i token scattano sempre prima; i messaggi si contano solo per il testo dell'avviso.
# Con l'argomento «tool» (hook PostToolUse) controlla anche durante i turni lunghi: muto sotto soglia,
# avvisa una volta sola, mai dentro un aiutante (agent_id).
# Con l'argomento «compact» (hook SessionStart dopo una compressione) rimette l'obbligo nel contesto nuovo:
# la compressione cancella gli avvisi precedenti.
import json, os, sys

SOGLIA_TOKENS = int(os.environ.get("CTX_SOGLIA", "250000"))
AZIONE = ("Prima di qualsiasi altro lavoro: rispondi in breve al messaggio, leggi la skill «consegne» (.claude/skills/consegne/SKILL.md) e poi aggiorna docs/PASSAGGIO-CONSEGNE.md "
          "(~1.000 parole, tetto 1.750, senza riassumere troppo: decisioni col perché, fatti nuovi, file ricevuti, richieste dell'utente ancora da fare, "
          "il suo ultimo messaggio parola per parola), verifica le condizioni e, se sono tutte vere, "
          "apri tu la nuova sessione con create_session (catena sotto 8; a 8 o al cambio account dai a Mario link, repo, ramo e il testo da incollare) "
          "(titolo «🟢 👨🏻‍🍳 ▶ ATTIVA · #NN · …» col numero dopo), e rinomina questa in «🔴 👨🏻‍🍳 ✓ CHIUSA · #NN · …». "
          "Non iniziare lavori nuovi in questa sessione.")

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
evento = "SessionStart" if "compact" in sys.argv[1:] else "PostToolUse" if "tool" in sys.argv[1:] else "UserPromptSubmit"
if evento == "PostToolUse" and data.get("agent_id"):
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


def esci(why):
    if evento == "PostToolUse" and st.get("avvisato"):
        sys.exit(0)
    corto = evento == "UserPromptSubmit" and st.get("avvisato")
    st["avvisato"] = 0 if evento == "SessionStart" else 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    testo = (f"PROTOCOLLO DI HANDOFF ancora da fare ({why}): passaggio di consegne SUBITO, come da CLAUDE.md."
             if corto else f"PROTOCOLLO DI HANDOFF (CLAUDE.md) OBBLIGATORIO: {why}. {AZIONE}")
    print(json.dumps({
        "systemMessage": f"Soglia {SOGLIA_TOKENS // 1000}k: {why}. Claude deve fare il passaggio di consegne.",
        "hookSpecificOutput": {"hookEventName": evento, "additionalContext": testo}
    }))
    sys.exit(0)


if evento == "SessionStart":
    st["compattata"] = st.get("compattata", 0) + 1
    with open(state_file, "w") as f:
        json.dump(st, f)
    esci("la conversazione è stata compressa perché il contesto era pieno")

if evento == "UserPromptSubmit":
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
if ctx >= SOGLIA_TOKENS or st.get("compattata"):
    parti = [f"{n} messaggi in questa sessione"]
    if ctx:
        parti.append(f"contesto circa {ctx // 1000}k token (soglia {SOGLIA_TOKENS // 1000}k)")
    if st.get("compattata"):
        parti.append("conversazione già compressa")
    esci(", ".join(parti))
