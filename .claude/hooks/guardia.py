#!/usr/bin/env python3
# Guardia (hook PreToolUse): blocca da sola gli errori già noti del diario, così non serve ricordarli.
#   - Bash: comandi vietati anche dentro comandi composti (dopo ; && || | $( ), prove + commit nello
#     stesso comando (E20), «-- …» dopo `npm run prove:e2e` (E58), «playwright install», variabile
#     CLAUDE_CODE_EFFORT_LEVEL.
#   - list_sessions senza limit o con limit oltre 4 (E23).
#   - add_repo di un repo diverso da questo: chiede conferma a Mario (spegne gli hook, E28).
#   - merge_pull_request senza commit_message o con «[skip ci]» (E132: GitHub incolla i messaggi di tutti i
#     commit nello squash; un «[skip ci]» di un commit di documenti ferma la pubblicazione su main).
#   - 5stelle Pocket (C97 A): comandi di rete verso Pocket fuori dal lettore guardato, utente/password di Pocket,
#     stampa di tutte le variabili (env, printenv, set), WebFetch verso Pocket; «sblocca» del lettore chiede conferma a Mario.
# Se qualcosa va storto la guardia lascia passare (|| true nelle impostazioni): non blocca mai il lavoro per un suo errore.
# Prova: python3 -I tools/test-guardia.py
# Jona: PROVE conta anche `node tools/test-…` e `bash tools/prova-…` (come prima del kit, #107).
import json, os, re, subprocess, sys

INIZIO = (r"(?:^|[;&|(`\n]|\$\()\s*(?:sudo\s+)?(?:env\s+\S+=\S*\s+)*"
          r"(?:flock\s+(?:-\w+\s+)*\S+\s+)?(?:timeout\s+\S+\s+)?")
VIETATI = [
    (INIZIO + r"git\s+push\b[^;&|\n]*\s(?:-f\b|--force\b|-[a-zA-Z]*f[a-zA-Z]*\b|\+\S)", "push forzato"),
    (INIZIO + r"git\s+reset\s+(?:[^;&|\n]*\s)?--hard\b", "git reset --hard"),
    (INIZIO + r"git\s+clean\s+(?:[^;&|\n]*\s)?-[a-zA-Z]*f", "git clean -f"),
    (INIZIO + r"rm\b(?=[^;&|\n]*(?:\s-[a-zA-Z]*[rR]|\s--recursive\b))(?=[^;&|\n]*(?:\s-[a-zA-Z]*f|\s--force\b))", "rm ricorsivo forzato"),
    (INIZIO + r"(?:kill|pkill|killall)\b", "kill / pkill / killall"),
]
PROVE = INIZIO + (r"(?:npm\s+(?:run\s+)?(?:prove|test)\b|npx\s+(?:vitest|playwright\s+test|firebase\s+emulators:exec)\b"
                  r"|vitest\b|playwright\s+test\b|firebase\s+emulators:exec\b"
                  r"|(?:\S+=\S*\s+)*node\s+tools/test-|(?:\S+=\S*\s+)*bash\s+tools/prova-)")
COMMIT = INIZIO + r"git\s+commit\b"
# 5stelle Pocket (C97 A, Mario #127): si parla con Pocket SOLO dal lettore guardato, mai a mano.
LETTORE = r"^\s*node\s+tools/pocket/lettore\.mjs\s+(?!sblocca\b)[a-z]+\b[^;&|`$<>()\n]*$"
SBLOCCA = r"^\s*node\s+tools/pocket/lettore\.mjs\s+sblocca\s*$"
POCKET = r"hotelcinquestelle|POCKET_URL"
CHIAVI_POCKET = r"POCKET_(?:PASSWORD|UTENTE)"
RETE = (r"(?:^|[\s;&|(`/=])(?:curl|wget|https?|nc|ncat|netcat|socat|openssl|telnet|ssh|python3?|node|npx|deno|bun"
        r"|chromium|chrome|google-chrome|playwright|lynx|w3m|links|aria2c)\b")
STAMPA_AMBIENTE = INIZIO + r"(?:env|printenv|export\s+-p|declare\s+-[a-zA-Z]*x|set)\s*(?:$|[|;&>)])"
# Parole che fanno saltare i workflow di un push (documentazione di GitHub Actions, «Skipping workflow runs»).
SALTA_CI = r"\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]|skip-checks:\s*true"


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


def controlla_pocket(cmd):
    if re.match(SBLOCCA, cmd):
        esito("ask", "togliere il blocco del lettore di 5stelle Pocket. Mario, tocca Sì solo se l'hai chiesto tu dopo aver letto il motivo dello stop.")
    if re.match(LETTORE, cmd):
        return
    if re.search(CHIAVI_POCKET, cmd):
        esito("deny", "utente e password di Pocket non si leggono né si stampano: li usa solo il lettore (tools/pocket/lettore.mjs).")
    if re.search(POCKET, cmd, re.I) and re.search(RETE, cmd):
        esito("deny", "5stelle Pocket solo dal lettore guardato (node tools/pocket/lettore.mjs <modo> …), mai a mano.")
    if re.search(STAMPA_AMBIENTE, cmd):
        esito("deny", "stamperebbe tutte le variabili, password di Pocket compresa. Per sapere se una c'è: [ -n \"$NOME\" ] && echo sì.")


def controlla_bash(cmd):
    for schema, nome in VIETATI:
        if re.search(schema, cmd):
            esito("deny", f"comando vietato ({nome}). Regola «DIVIETO ASSOLUTO» di CLAUDE.md: usa un modo normale e sicuro o fermati e spiega a Mario.")
    controlla_pocket(cmd)
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
    elif nome == "WebFetch":
        if re.search(POCKET, str(ingresso.get("url") or ""), re.I):
            esito("deny", "5stelle Pocket solo dal lettore guardato (tools/pocket/lettore.mjs), mai con WebFetch.")
    elif nome.endswith("__list_sessions"):
        limite = ingresso.get("limit")
        if not isinstance(limite, int) or limite > 4:
            esito("deny", "list_sessions solo con limit 4 o meno (E23: ogni riga è un JSON enorme).")
    elif nome.endswith("__merge_pull_request"):
        testo = f"{ingresso.get('commit_title') or ''}\n{ingresso.get('commit_message') or ''}"
        if not str(ingresso.get("commit_message") or "").strip():
            esito("deny", "unione senza commit_message (E132): GitHub incollerebbe i messaggi di tutti i commit, "
                          "anche i «[skip ci]» delle consegne, e la pubblicazione su main non partirebbe. "
                          "Passa commit_title e un commit_message corto con cosa cambia.")
        if re.search(SALTA_CI, testo, re.I):
            esito("deny", "il messaggio dell'unione contiene «[skip ci]» o simili (E132): su main non partirebbe la pubblicazione.")
    elif nome.endswith("__add_repo"):
        chiesto = f"{ingresso.get('owner', '')}/{ingresso.get('repo', '')}".lower()
        mio = repo_di_questo_progetto()
        if mio and chiesto != mio:
            esito("ask", f"add_repo di {chiesto}: un secondo repo spegne in silenzio gli hook di questa sessione (E28). "
                         "Mario, tocca Sì solo se l'hai chiesto tu.")


if __name__ == "__main__":
    main()
