#!/usr/bin/env python3
"""Notifiche lette prima di chiudere il turno (hook Stop, E357: Principale 572 il 10/11 ha rifatto a Mario una domanda
a cui aveva già risposto, perché un messaggio di un'altra chat aspettava in coda e non aveva chiamato ReadNotifications).

Blocca la fine del turno UNA volta (uscita 2, una riga su stderr) se nella trascrizione l'ultima notifica messa in coda
(riga `queue-operation` «enqueue» con `queued-remote-notifications`: messaggi di altre chat, GitHub, sveglie) è più nuova
dell'ultima chiamata a `ReadNotifications`. Le notifiche aspettano la fine del turno: senza questo controllo il messaggio
a Mario parte senza saperle.
Secondo giro (`stop_hook_active`), trascrizione assente o illeggibile, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-notifiche-lette.py
"""
import datetime
import json
import sys

SEGNO_CODA = "queued-remote-notifications"
STRUMENTO = "ReadNotifications"


def ultimi_orari(percorso):
    """→ (ora dell'ultima notifica in coda, ora dell'ultima ReadNotifications), testi ISO o ''."""
    coda = letta = ""
    with open(percorso, encoding="utf-8", errors="replace") as f:
        for riga in f:
            if '"queue-operation"' in riga and SEGNO_CODA in riga:
                d = json.loads(riga)
                if d.get("type") == "queue-operation" and d.get("operation") == "enqueue" \
                        and SEGNO_CODA in str(d.get("content", "")):
                    coda = max(coda, str(d.get("timestamp", "")))
            elif STRUMENTO in riga and '"tool_use"' in riga and '"assistant"' in riga:
                d = json.loads(riga)
                contenuto = (d.get("message") or {}).get("content")
                if d.get("type") == "assistant" and isinstance(contenuto, list) and any(
                        isinstance(x, dict) and x.get("type") == "tool_use"
                        and str(x.get("name", "")).endswith(STRUMENTO) for x in contenuto):
                    letta = max(letta, str(d.get("timestamp", "")))
    return coda, letta


def ora_italiana(iso):
    try:
        from zoneinfo import ZoneInfo
        quando = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return quando.astimezone(ZoneInfo("Europe/Rome")).strftime("%H:%M")
    except Exception:  # noqa: BLE001
        return iso[11:16] + " UTC"


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:  # noqa: BLE001
        return 0
    if dati.get("stop_hook_active") or not dati.get("transcript_path"):
        return 0
    coda, letta = ultimi_orari(dati["transcript_path"])
    if not coda or coda <= letta:
        return 0
    print(f"Notifica non letta (in coda dalle {ora_italiana(coda)}: messaggio di un'altra chat, GitHub o sveglia, E357): "
          "chiama ReadNotifications finché dice 0; se cambia qualcosa per Mario (domanda già risposta, lavoro già fatto), "
          "correggi il messaggio finale.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:  # noqa: BLE001
        sys.exit(0)
