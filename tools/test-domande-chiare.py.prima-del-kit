#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/domande-chiare.py (C233, E145): domande a Mario chiare e col contesto.
# Uso: python3 -I tools/test-domande-chiare.py
import json, os, subprocess, sys

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "domande-chiare.py")
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def stop(messaggio, attivo=False, grezzo=None):
    dati = grezzo if grezzo is not None else json.dumps({"session_id": "prova", "stop_hook_active": attivo,
                                                         "last_assistant_message": messaggio})
    r = subprocess.run([sys.executable, "-I", HOOK], input=dati, capture_output=True, text=True, timeout=30)
    return r.returncode, r.stderr


def blocca(messaggio, nome, motivo):
    c, err = stop(messaggio)
    controlla(c == 2 and "C233" in err and motivo in err, nome, f"{c} {err}")


def passa(messaggio, nome):
    c, err = stop(messaggio)
    controlla(c == 0 and not err, nome, f"{c} {err}")


BUONA = """✅ FATTO
- Prove verdi.

───
❓ DOMANDE
📌 Di cosa parliamo: la striscia gialla in alto nella chat quando il server gratuito ha finito le scritture del giorno.
Che testo vuoi nella striscia (foto qui sopra)?
1 · «…partono alle 09:00» · 2 · «…fino alle 09:00: partono da soli»
Consiglio la 2: l'ora si legge subito.

───
⚠️ ATTENZIONE
La patch C200 entra nella v68 (E143)."""

# Messaggi senza domande: sempre zitto.
passa("✅ FATTO\n- C200 nel ramo, E143 rispettata, #263 chiusa.", "niente domande: le sigle nel resoconto vanno bene")
passa(BUONA, "domanda col contesto, scelte e versione v67: va bene; sigle dopo «───» non contano")
passa(BUONA.replace("📌 Di cosa parliamo:", "📌 Di cosa parliamo (v67):"), "la versione dell'app (v67) va bene")
passa("Confronta il blocco `❓ DOMANDE` delle regole.", "«❓» in mezzo alla riga (citato) non è un blocco")
passa("```\n❓ DOMANDE\n1 · C200\n```\nFatto.", "«❓» dentro un blocco di codice non conta")
passa("❓ DOMANDE\n📌 Di cosa parliamo: cancellare le prove vecchie.\nConfermi? 1 · Sì · 2 · No", "conferma «1 · Sì · 2 · No»")

# Domande poco chiare: blocca una volta.
blocca(BUONA.replace("📌 Di cosa parliamo: la striscia", "La striscia"), "manca il contesto", "📌")
blocca(BUONA.replace("1 · «…partono alle 09:00» · 2 · «…fino alle 09:00: partono da soli»", "La 1 o la 2?"),
       "mancano le scelte numerate", "scelte numerate")
blocca(BUONA.replace("Che testo vuoi", "Per la C231 della P18, che testo vuoi"), "sigle di lavoro e di sessione", "C231, P18")
blocca("**❓ DOMANDE**\n📌 Di cosa parliamo: i passi della #247.\n1 · Fatti · 2 · Non ancora", "sigla di sessione", "#247")
blocca("❓ Domanda 3\n📌 Di cosa parliamo: E140.\n1 · Sì · 2 · No", "domanda in testa senza blocco «DOMANDE»", "E140")

# Secondo giro e ingressi strani: silenzio.
c, err = stop(BUONA.replace("📌", ""), attivo=True)
controlla(c == 0 and not err, "secondo giro (stop_hook_active): mai bloccare due volte", f"{c} {err}")
for grezzo, nome in (("non json", "ingresso non JSON"), (json.dumps({"session_id": "x"}), "senza messaggio"),
                     (json.dumps({"last_assistant_message": 7}), "messaggio non testo")):
    c, err = stop(None, grezzo=grezzo)
    controlla(c == 0 and not err, nome, f"{c} {err}")

print(f"OK domande-chiare: {ok_n} controlli")
