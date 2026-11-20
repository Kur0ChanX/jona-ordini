#!/usr/bin/env python3
# Scarica il kit di regole più nuovo dal repo RVC (C259, Mario 23/10: «gli altri progetti si allineano da soli»).
# Serve la chiave di sola lettura su RVC nella variabile d'ambiente RVC_KIT_TOKEN (impostazioni dell'ambiente cloud).
# Passa da raw.githubusercontent.com: l'API di GitHub e git sono chiusi dal proxy per i repo fuori dalla sessione,
# e add_repo di RVC è vietato (spegne gli hook). Scarica soltanto: non scrive mai .claude/ né i file del progetto.
# Uso:
#   python3 -I tools/scarica-kit.py --versione          → stampa la riga di VERSIONE del kit su RVC (la usa kit-check.py)
#   python3 -I tools/scarica-kit.py --cartella <dir> [--indipendente]
#                                                       → scarica le parti del pacchetto in <dir> (di solito la scratchpad);
#                                                         poi la sessione segue la parte 1 (ok di Mario, file uno per uno con Write)
# Uscita: 0 riuscito · 2 manca la chiave · 3 rete o chiave rifiutata.
import os, re, sys, urllib.error, urllib.request

RAMO = "claude/rvc-ramo-definitivo"
BASE = os.environ.get("RVC_KIT_URL") or f"https://raw.githubusercontent.com/RVC-Operation-by-YNOY-CORP/RVC/{RAMO}"
KIT = "docs/kit-progetto"
RE_PREF = re.compile(r"Preferenze v(\d+)")


def scarica(rel):
    chiave = os.environ.get("RVC_KIT_TOKEN", "").strip()
    richiesta = urllib.request.Request(f"{BASE}/{rel}", headers={"Authorization": f"token {chiave}"} if chiave else {})
    with urllib.request.urlopen(richiesta, timeout=8) as r:
        return r.read().decode("utf-8")


def esiste(rel):
    try:
        scarica(rel)
        return True
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise


def main(arg):
    if not os.environ.get("RVC_KIT_TOKEN", "").strip() and not os.environ.get("RVC_KIT_URL"):
        print("Manca RVC_KIT_TOKEN (chiave di sola lettura su RVC) nelle impostazioni dell'ambiente.")
        return 2
    try:
        versione = scarica(f"{KIT}/VERSIONE").strip()
        if "--versione" in arg:
            print(versione)
            return 0
        m = RE_PREF.search(versione)
        if not m or "--cartella" not in arg or arg.index("--cartella") + 1 >= len(arg):
            print("Uso: --versione oppure --cartella <dir> [--indipendente]; VERSIONE su RVC:", versione[:80])
            return 3 if not m else 1
        cartella = arg[arg.index("--cartella") + 1]
        nome = f"PACCHETTO-v{m.group(1)}-" + ("indipendente-" if "--indipendente" in arg else "")
        # Il numero delle parti sta nel nome del file (…-1di5.md): si cerca il primo che esiste.
        parti = next((k for k in range(1, 13) if esiste(f"{KIT}/pacchetto/{nome}1di{k}.md")), 0)
        if not parti:
            print(f"Pacchetto {nome}… non trovato su RVC (versione {versione}).")
            return 3
        os.makedirs(cartella, exist_ok=True)
        for i in range(1, parti + 1):
            rel = f"{nome}{i}di{parti}.md"
            with open(os.path.join(cartella, rel), "w", encoding="utf-8") as f:
                f.write(scarica(f"{KIT}/pacchetto/{rel}"))
            print(os.path.join(cartella, rel))
        print(f"Scaricato: {versione}, {parti} parti. Ora la parte 1: «Come si applica».")
        return 0
    except (urllib.error.URLError, OSError, ValueError) as e:
        print(f"RVC non raggiungibile o chiave rifiutata ({type(e).__name__}: {str(e)[:80]}).")
        return 3


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
