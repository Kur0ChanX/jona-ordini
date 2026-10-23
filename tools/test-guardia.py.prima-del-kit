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
    ("git push -f origin x", "deny"), ("git push --force-with-lease", "deny"), ("git push origin x --force", "deny"),
    ("cd app && git push -f", "deny"), ("git fetch && git reset --hard origin/x", "deny"), ("git clean -fd", "deny"),
    ("rm -rf node_modules", "deny"), ("rm -Rf x", "deny"), ("rm -r -f x", "deny"), ("rm --recursive --force x", "deny"),
    ("ls; kill 123", "deny"), ("pkill -f node", "deny"), ("sudo killall node", "deny"), ("echo $(kill 1)", "deny"),
    ("npm run prove > f.log 2>&1; git commit -m x", "deny"), ("npm run prove | grep ok && git commit -m x", "deny"),
    ("npm test && git commit -m x", "deny"),
    ("npx playwright install chromium", "deny"), ("export CLAUDE_CODE_EFFORT_LEVEL=high", "deny"),
    # Jona: le prove sono node tools/test-*.mjs e bash tools/prova-*.sh
    ("node tools/test-moduli.mjs && git commit -m x", "deny"), ("TZ=Europe/Rome node tools/test-agenda.mjs; git commit -m x", "deny"),
    ("bash tools/prova-ci.sh veloce && git commit -m x", "deny"),
    ("node tools/test-moduli.mjs 2>&1 | tail -5", "passa"), ("git add -A && git commit -m 'prove verdi: node tools/test-x'", "passa"),
    ("git push -u origin mio-ramo", "passa"), ("git push origin feature-fix", "passa"),
    ("git commit -m 'kill the bug'", "passa"), ("grep -n \"git reset --hard\" CLAUDE.md", "passa"),
    ("grep -n 'rm -rf' docs/ERRORI.md", "passa"), ("rm -r /tmp/x", "passa"), ("rm -f file.txt", "passa"),
    ("git add -A && git commit -m 'prove verdi'", "passa"), ("ps aux | grep node", "passa"),
    ("git log --follow -- x", "passa"), ("grep -n 'CLAUDE_CODE_EFFORT_LEVEL' CLAUDE.md", "passa"),
]
ALTRI = [
    ("mcp__claude-code-remote__list_sessions", {"limit": 4}, "passa"),
    ("mcp__claude-code-remote__list_sessions", {"limit": 20}, "deny"),
    ("mcp__claude-code-remote__list_sessions", {}, "deny"),
    ("mcp__claude-code-remote__add_repo", {"owner": "Kur0ChanX", "repo": "jona-ordini"}, "passa"),
    ("mcp__claude-code-remote__add_repo", {"owner": "RVC-Operation-by-YNOY-CORP", "repo": "RVC", "access": "read"}, "ask"),
    ("Read", {"file_path": "/x"}, "passa"),
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
