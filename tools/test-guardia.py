#!/usr/bin/env python3
# Prova della guardia (.claude/hooks/guardia.py): python3 -I tools/test-guardia.py
import json, os, subprocess, sys

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUARDIA = os.path.join(QUI, ".claude", "hooks", "guardia.py")


def decide(nome, ingresso):
    r = subprocess.run([sys.executable, "-I", GUARDIA], input=json.dumps({"tool_name": nome, "tool_input": ingresso}),
                       capture_output=True, text=True, timeout=10, cwd=QUI, env={**os.environ, "CLAUDE_PROJECT_DIR": QUI})
    if r.returncode != 0:
        return "errore:" + r.stderr.strip()[-200:]
    if not r.stdout.strip():
        return "passa"
    return json.loads(r.stdout)["hookSpecificOutput"]["permissionDecision"]


BASH = [
    # (comando, atteso)
    # Jona: le prove sono node tools/test-*.mjs e bash tools/prova-*.sh
    ("node tools/test-moduli.mjs && git commit -m x", "deny"), ("TZ=Europe/Rome node tools/test-agenda.mjs; git commit -m x", "deny"),
    ("bash tools/prova-ci.sh veloce && git commit -m x", "deny"),
    ("node tools/test-moduli.mjs 2>&1 | tail -5", "passa"), ("git add -A && git commit -m 'prove verdi: node tools/test-x'", "passa"),
    ("git push -f origin x", "deny"), ("git push --force-with-lease", "deny"), ("git push origin x --force", "deny"),
    ("git push origin +main", "deny"), ("git push -u origin +HEAD:x", "deny"),
    ("cd app && git push -f", "deny"), ("git fetch && git reset --hard origin/x", "deny"), ("git clean -fd", "deny"),
    ("rm -rf node_modules", "deny"), ("rm -Rf x", "deny"), ("rm -r -f x", "deny"), ("rm --recursive --force x", "deny"),
    ("ls; kill 123", "deny"), ("pkill -f node", "deny"), ("sudo killall node", "deny"), ("echo $(kill 1)", "deny"),
    ("npm run prove > f.log 2>&1; git commit -m x", "deny"), ("npm run prove | grep ok && git commit -m x", "deny"),
    ("flock /tmp/rvc-prove.lock npm run prove:e2e && git commit -qm x", "deny"),
    ("npx firebase emulators:exec --only firestore \"npx vitest run\" && git commit -m x", "deny"),
    ("npm run prove:e2e -- --grep fruga", "deny"), ("npx playwright install chromium", "deny"),
    ("CLAUDE_CODE_EFFORT_LEVEL=xhigh claude", "deny"),
    # devono passare
    ("git push -u origin claude/rvc-ramo-definitivo", "passa"), ("git push origin feature-fix", "passa"),
    ("git push -q -u origin x && git fetch -q origin x", "passa"), ("git commit -m 'kill the bug'", "passa"),
    ("grep -n \"git reset --hard\" CLAUDE.md", "passa"), ("grep -n 'rm -rf' docs/ERRORI.md", "passa"),
    ("rm -r /tmp/x", "passa"), ("rm -f file.txt", "passa"), ("npm run prove > /tmp/p.log 2>&1; echo $?", "passa"),
    ("git add -A && git commit -m 'prove verdi'", "passa"), ("ps aux | grep node", "passa"),
    ("curl -X POST http://127.0.0.1:8080/shutdown", "passa"), ("npm run build && npm run prove:e2e > f 2>&1", "passa"),
    ("git log --follow -- x", "passa"), ("echo skill", "passa"),
    ("export CLAUDE_CODE_EFFORT_LEVEL=high", "deny"),
    ("grep -n 'CLAUDE_CODE_EFFORT_LEVEL' CLAUDE.md", "passa"),
    ("cat >> docs/x.md <<'FINE'\n- mai la variabile `CLAUDE_CODE_EFFORT_LEVEL`\nFINE", "passa"),
    # 5stelle Pocket (C97 A): solo dal lettore guardato
    ("curl -s \"$POCKET_URL\"", "deny"), ("curl https://app.pc211.hotelcinquestelle.cloud/receptionMobile/UIDL/", "deny"),
    ("wget -q https://app.pc211.hotelcinquestelle.cloud/", "deny"), ("python3 -c \"import os;print(os.environ['POCKET_URL'])\"", "deny"),
    ("node -e \"fetch(process.env.POCKET_URL)\"", "deny"), ("echo $POCKET_PASSWORD", "deny"), ("printenv POCKET_UTENTE", "deny"),
    ("env", "deny"), ("env | grep POCKET", "deny"), ("printenv", "deny"), ("set | grep -i pass", "deny"), ("export -p", "deny"),
    ("node tools/pocket/lettore.mjs osserva --uscita /tmp/x; curl $POCKET_URL", "deny"),
    ("node tools/pocket/lettore.mjs sblocca", "ask"),
    ("node tools/pocket/lettore.mjs osserva --uscita /tmp/claude-0/x/pocket", "passa"),
    ("cd /home/user/RVC && node tools/pocket/lettore.mjs osserva --uscita /tmp/p > /tmp/p.log 2>&1", "passa"),
    ("grep -n hotelcinquestelle docs/DA-FARE.md", "passa"), ("[ -n \"$POCKET_URL\" ] && echo sì", "passa"),
    ("env CI=1 npm run prove > /tmp/p.log 2>&1", "passa"), ("set -e; npm ci", "passa"),
    ("git commit -m 'Pocket: guardia di hotelcinquestelle'", "passa"),
]
ALTRI = [
    ("mcp__claude-code-remote__list_sessions", {"limit": 4}, "passa"),
    ("mcp__claude-code-remote__list_sessions", {"limit": 20}, "deny"),
    ("mcp__claude-code-remote__list_sessions", {}, "deny"),
    ("mcp__claude-code-remote__add_repo", {"owner": "Kur0ChanX", "repo": "jona-ordini"}, "passa"),
    ("mcp__claude-code-remote__add_repo", {"owner": "RVC-Operation-by-YNOY-CORP", "repo": "RVC", "access": "read"}, "ask"),
    ("Read", {"file_path": "/x"}, "passa"),
    # E132: lo squash senza messaggio incolla i «[skip ci]» delle consegne e main non pubblica
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "merge_method": "squash"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)", "commit_message": "  "}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)",
                                         "commit_message": "Permessi.\n\nConsegne #247 [skip ci]"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 [CI SKIP]", "commit_message": "x"}, "deny"),
    ("mcp__github__merge_pull_request", {"pullNumber": 60, "commit_title": "v63 (#60)",
                                         "commit_message": "Permessi per profilo modificabili dall'app."}, "passa"),
    ("WebFetch", {"url": "https://app.pc211.hotelcinquestelle.cloud/receptionMobile/", "prompt": "x"}, "deny"),
    ("WebFetch", {"url": "https://firebase.google.com/docs", "prompt": "x"}, "passa"),
]

errori = 0
for cmd, atteso in BASH:
    avuto = decide("Bash", {"command": cmd})
    if avuto != atteso:
        errori += 1
        print(f"✗ Bash «{cmd}»: atteso {atteso}, avuto {avuto}")
for nome, ingresso, atteso in ALTRI:
    avuto = decide(nome, ingresso)
    if avuto != atteso:
        errori += 1
        print(f"✗ {nome} {ingresso}: atteso {atteso}, avuto {avuto}")
totale = len(BASH) + len(ALTRI)
print(f"{totale - errori}/{totale} prove della guardia verdi" if errori == 0 else f"{errori} prove ROSSE su {totale}")
sys.exit(1 if errori else 0)
