#!/usr/bin/env python3
# Guardia (hook PreToolUse): blocca da sola gli errori già noti del diario, così non serve ricordarli.
#   - Bash: comandi vietati anche dentro comandi composti (dopo ; && || | $( ), prove + commit nello
#     stesso comando (E20), «-- …» dopo `npm run prove:e2e` (E58), «playwright install», variabile
#     CLAUDE_CODE_EFFORT_LEVEL.
#   - list_sessions senza limit o con limit oltre 4 (E23).
#   - add_repo di un repo diverso da questo: chiede conferma a Mario (spegne gli hook, E28).
# Se qualcosa va storto la guardia lascia passare (|| true nelle impostazioni): non blocca mai il lavoro per un suo errore.
# Prova: python3 -I tools/test-guardia.py
# Copia di RVC (#107); in Jona PROVE conta anche `node tools/test-…` e `bash tools/prova-…`.
import json, os, re, subprocess, sys

INIZIO = (r"(?:^|[;&|(`\n]|\$\()\s*(?:sudo\s+)?(?:env\s+\S+=\S*\s+)*"
          r"(?:flock\s+(?:-\w+\s+)*\S+\s+)?(?:timeout\s+\S+\s+)?")
VIETATI = [
    (INIZIO + r"git\s+push\b[^;&|\n]*\s(?:-f\b|--force\b|-[a-zA-Z]*f[a-zA-Z]*\b)", "push forzato"),
    (INIZIO + r"git\s+reset\s+(?:[^;&|\n]*\s)?--hard\b", "git reset --hard"),
    (INIZIO + r"git\s+clean\s+(?:[^;&|\n]*\s)?-[a-zA-Z]*f", "git clean -f"),
    (INIZIO + r"rm\b(?=[^;&|\n]*(?:\s-[a-zA-Z]*[rR]|\s--recursive\b))(?=[^;&|\n]*(?:\s-[a-zA-Z]*f|\s--force\b))", "rm ricorsivo forzato"),
    (INIZIO + r"(?:kill|pkill|killall)\b", "kill / pkill / killall"),
]
PROVE = INIZIO + (r"(?:npm\s+(?:run\s+)?(?:prove|test)\b|npx\s+(?:vitest|playwright\s+test|firebase\s+emulators:exec)\b"
                  r"|vitest\b|playwright\s+test\b|firebase\s+emulators:exec\b"
                  r"|(?:\S+=\S*\s+)*node\s+tools/test-|(?:\S+=\S*\s+)*bash\s+tools/prova-)")
COMMIT = INIZIO + r"git\s+commit\b"


def esito(decisione, motivo):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse", "permissionDecision": decisione,
        "permissionDecisionReason": "Guardia: " + motivo}}))
    sys.exit(0)


def repo_di_questo_progetto():
    try:
        url = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True, timeout=5,
                             cwd=os.environ.get("CLAUDE_PROJECT_DIR") or None).stdout.strip()
    except Exception:
        return ""
    pezzi = [p for p in re.split(r"[/:]", url.removesuffix(".git")) if p]
    return "/".join(pezzi[-2:]).lower() if len(pezzi) >= 2 else ""


def controlla_bash(cmd):
    for schema, nome in VIETATI:
        if re.search(schema, cmd):
            esito("deny", f"comando vietato ({nome}). Regola «DIVIETO ASSOLUTO» di CLAUDE.md: usa un modo normale e sicuro o fermati e spiega a Mario.")
    if re.search(PROVE, cmd) and re.search(COMMIT, cmd):
        esito("deny", "prove e commit nello stesso comando (E20). Prima guarda l'esito delle prove, poi fai il commit in un comando a parte.")
    if re.search(r"npm\s+run\s+prove:e2e\s+--(?:\s|$)", cmd):
        esito("deny", "mai «-- …» dopo `npm run prove:e2e` (E58): le opzioni vanno dentro il comando delle prove (vedi il diario).")
    if re.search(INIZIO + r"(?:npx\s+)?playwright\s+install\b", cmd):
        esito("deny", "mai «playwright install»: Chromium è già in /opt/pw-browsers (WebKit nel contenitore non c'è).")
    if re.search(r"(?:^|[\s;&|(])(?:export\s+)?CLAUDE_CODE_EFFORT_LEVEL=", cmd):
        esito("deny", "mai la variabile CLAUDE_CODE_EFFORT_LEVEL: l'impegno va in .claude/settings.json (\"effortLevel\").")


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return
    nome = dati.get("tool_name") or ""
    ingresso = dati.get("tool_input") or {}
    if nome == "Bash":
        controlla_bash(str(ingresso.get("command") or ""))
    elif nome.endswith("__list_sessions"):
        limite = ingresso.get("limit")
        if not isinstance(limite, int) or limite > 4:
            esito("deny", "list_sessions solo con limit 4 o meno (E23: ogni riga è un JSON enorme).")
    elif nome.endswith("__add_repo"):
        chiesto = f"{ingresso.get('owner', '')}/{ingresso.get('repo', '')}".lower()
        mio = repo_di_questo_progetto()
        if mio and chiesto != mio:
            esito("ask", f"add_repo di {chiesto}: un secondo repo spegne in silenzio gli hook di questa sessione (E28). "
                         "Mario, tocca Sì solo se l'hai chiesto tu.")


if __name__ == "__main__":
    main()
