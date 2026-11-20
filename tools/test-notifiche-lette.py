#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/notifiche-lette.py (E357): notifiche in coda lette prima di chiudere il turno.
# Trascrizioni finte, scritte qui: nessun file vero del progetto. Uso: python3 -I tools/test-notifiche-lette.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "notifiche-lette.py")
ok_n = 0
CODA = ("<task-notification>\n<task-type>queued-remote-notifications</task-type>\n<status>pending</status>\n"
        "<summary>1 unread notification (message from another Claude session: 1)</summary>\n</task-notification>")


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def in_coda(ora, testo=CODA):
    return {"type": "queue-operation", "operation": "enqueue", "timestamp": ora, "sessionId": "s", "content": testo}


def letta(ora):
    return {"type": "assistant", "timestamp": ora, "message": {"role": "assistant", "content": [
        {"type": "tool_use", "id": "t1", "name": "ReadNotifications", "input": {}}]}}


def altro(ora):
    return {"type": "assistant", "timestamp": ora, "message": {"role": "assistant", "content": [
        {"type": "text", "text": "Uso ReadNotifications più tardi"}, {"type": "tool_use", "id": "t2", "name": "Bash",
                                                                     "input": {"command": "echo ReadNotifications"}}]}}


def stop(righe, attivo=False, tmp=None):
    percorso = os.path.join(tmp, "t.jsonl")
    with open(percorso, "w", encoding="utf-8") as f:
        f.write("".join(json.dumps(r) + "\n" for r in righe))
    dati = json.dumps({"session_id": "prova", "stop_hook_active": attivo, "transcript_path": percorso})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30)
    return r.returncode, r.stderr


with tempfile.TemporaryDirectory() as tmp:
    # 1. Il caso vero (Risparmio 21, 10/11): notifica in coda alle 17:11:57 UTC, turno chiuso senza leggerla
    c, err = stop([letta("2026-11-10T17:00:00.000Z"), in_coda("2026-11-10T17:11:57.751Z"), altro("2026-11-10T17:12:30.000Z")],
                  tmp=tmp)
    controlla(c == 2 and "E357" in err and "ReadNotifications" in err and "18:11" in err,
              "notifica in coda dopo l'ultima lettura → blocca, con l'ora italiana", f"{c} {err}")
    # 2. Letta dopo l'arrivo → passa
    c, err = stop([in_coda("2026-11-10T17:11:57.751Z"), letta("2026-11-10T17:17:11.000Z")], tmp=tmp)
    controlla(c == 0 and err == "", "notifica letta dopo l'arrivo → passa", f"{c} {err}")
    # 3. Mai lette e nessuna in coda → passa; altre righe in coda (aiutanti, prove) non contano
    c, err = stop([in_coda("2026-11-10T17:12:24.199Z", "<task-notification>\n<task-id>abc</task-id>\n"
                           "<status>completed</status>\n</task-notification>"), altro("2026-11-10T17:13:00.000Z")], tmp=tmp)
    controlla(c == 0 and err == "", "nessuna notifica remota in coda (solo aiutanti) → passa", f"{c} {err}")
    # 4. Il nome dentro un testo o un comando non vale come lettura
    c, err = stop([in_coda("2026-11-10T17:11:57.751Z"), altro("2026-11-10T17:20:00.000Z")], tmp=tmp)
    controlla(c == 2, "«ReadNotifications» scritto in un testo o comando non è una lettura", f"{c} {err}")
    # 5. Secondo giro: silenzio (niente giri infiniti)
    c, err = stop([in_coda("2026-11-10T17:11:57.751Z")], attivo=True, tmp=tmp)
    controlla(c == 0 and err == "", "stop_hook_active → silenzio", f"{c} {err}")
    # 6. Nuova notifica dopo una lettura vecchia → blocca di nuovo
    c, err = stop([in_coda("2026-11-10T17:11:57.751Z"), letta("2026-11-10T17:17:11.000Z"),
                   in_coda("2026-11-10T18:35:59.115Z")], tmp=tmp)
    controlla(c == 2 and "19:35" in err, "seconda notifica dopo la lettura → blocca", f"{c} {err}")
    # 7. Ingresso rotto, trascrizione mancante o riga illeggibile: silenzio
    r = subprocess.run([sys.executable, "-I", HOOK], input="non json", capture_output=True, text=True, timeout=30)
    controlla(r.returncode == 0 and r.stderr == "", "ingresso illeggibile → silenzio", r.stderr)
    r = subprocess.run([sys.executable, "-I", HOOK], input=json.dumps({"transcript_path": os.path.join(tmp, "manca.jsonl")}),
                       capture_output=True, text=True, timeout=30)
    controlla(r.returncode == 0 and r.stderr == "", "trascrizione mancante → silenzio", r.stderr)
    with open(os.path.join(tmp, "rotta.jsonl"), "w", encoding="utf-8") as f:
        f.write('{"type":"queue-operation" queued-remote-notifications ROTTA\n')
    r = subprocess.run([sys.executable, "-I", HOOK], input=json.dumps({"transcript_path": os.path.join(tmp, "rotta.jsonl")}),
                       capture_output=True, text=True, timeout=30)
    controlla(r.returncode == 0 and r.stderr == "", "riga rotta → silenzio", r.stderr)

print(f"OK: {ok_n} controlli di notifiche-lette.py")
