#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/promesse.py (C331, E207): Stop con un Da fare finto, --aperte e --controlla.
# Uso: python3 -I tools/test-promesse.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "promesse.py")
ok_n = 0

DA_FARE = """# Da fare

| N. | Cosa | Chi | Urgenza |
|---|---|---|---|
| C312 | 🔴 **Schede dei clienti con tutti i dati** (Mario 29/10). 👁 Lo vedi: Inizio → 👥 Clienti, nomi interi · prova: lettura dei dati veri + foto dal sito | Claude | adesso |
| C200 | 🟠 **Turni più comodi**: piano pronto. | Claude | dopo |

## 1. Claude da solo
"""
FATTE = """# Da fare: voci finite

| N. | Cosa | Chi | Urgenza |
|---|---|---|---|
| C100 | ✅ **Vecchia voce** senza occhio. | Claude | — |
"""


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def progetto(da_fare=DA_FARE, fatte=FATTE):
    p = tempfile.mkdtemp(prefix="promesse-")
    os.makedirs(os.path.join(p, ".git"))
    os.makedirs(os.path.join(p, "docs"))
    for nome, testo in (("DA-FARE.md", da_fare), ("DA-FARE-FATTE.md", fatte)):
        if testo is not None:
            with open(os.path.join(p, "docs", nome), "w", encoding="utf-8") as fh:
                fh.write(testo)
    return p


def lancia(p, *argomenti, entrata=""):
    return subprocess.run([sys.executable, "-I", HOOK, *argomenti], input=entrata, capture_output=True, text=True,
                          env={**os.environ, "CLAUDE_PROJECT_DIR": p}, timeout=20)


def stop(testo, attivo=False, **kw):
    p = progetto(**kw)
    try:
        r = lancia(p, entrata=json.dumps({"last_assistant_message": testo, "stop_hook_active": attivo}))
        return r.returncode, r.stderr
    finally:
        shutil.rmtree(p)


def modo(*argomenti, **kw):
    p = progetto(**kw)
    try:
        r = lancia(p, *argomenti)
        return r.returncode, r.stdout
    finally:
        shutil.rmtree(p)


# Promesse vere senza voce con 👁 → blocco
for frase in ("Caricherò l'inventario attuale della biancheria.", "Te lo mando appena finisce il giro.",
              "Ti mando la fattura con la v100.", "Domani vedrai il riquadro nuovo.",
              "I riquadri diventano uguali appena finisce la prova.", "Stasera pubblico la versione."):
    rc, err = stop("✅ FATTO\n" + frase)
    controlla(rc == 2 and "DA-FARE.md" in err and "👁" in err, "promessa bloccata: " + frase, err)

# Secondo giro, niente Da fare → passa
controlla(stop("Caricherò l'inventario.", attivo=True)[0] == 0, "stop_hook_active")
controlla(stop("Caricherò l'inventario.", da_fare=None)[0] == 0, "progetto senza Da fare")

# Non sono promesse, o parlano di una voce con 👁 → passa
for nome, testo in (
        ("passato", "Ho caricato l'inventario e messo i nomi."),
        ("negata", "Non lo metto nella v100, aspetta la tua risposta."),
        ("legata alla risposta", "Se dici sì lo metto nella prossima."),
        ("domanda", "Lo metto anche nella pagina Clienti?"),
        ("citazione", "Avevo scritto «i nomi diventano interi appena finisce il giro» e non era vero."),
        ("codice", "```\nlo carico domani\n```\nFatto."),
        ("blocco domande", "❓ DOMANDE\n📌 Di cosa parliamo: lo sblocco.\n1 · lo metto solo a Riccardo\n───\nok"),
        ("passi di Mario", "👉 DA FARE TU\n1. Tocca **Salva**: vedrai comparire la riga verde.\n───"),
        ("voce con 👁", "I nomi interi dei clienti arrivano verso le 07:00."),
        ("voce con 👁, titolo", "Le schede dei clienti saranno pronte stasera."),
        # Risparmio 29 (C455, blocchi falsi 12-18/11, Mario 18/11 «1»): P1 stato delle versioni, P2 «fra» non di tempo, P3 condizioni
        ("stato delle versioni (P1)", "Tutto è su GitHub ed entra nella v154."),
        ("condizione (P3)", "Se succede, lo correggo."),
        ("condizione dopo un punto (P3)", "Prove verdi. Se viene rosso, prima lo correggo (circa 2 ore, stima)."),
        ("«frase» non è «fra» (P2)", "Alle ragazze arriva una frase generica che si adatta a qualsiasi cosa scriva."),
        ("«fra» non di tempo (P2)", "Il testo arriva da Drive stesso, cioè dal ponte fra Claude e Drive.")):
    rc, err = stop(testo)
    controlla(rc == 0, "non bloccata: " + nome, err)

# Una voce senza 👁 non basta: «turni più comodi» promessi → blocco
controlla(stop("I turni più comodi li metto nella v101.")[0] == 2, "voce senza 👁 non conta")

# La stessa frase blocca una volta sola (stesso progetto)
p = progetto()
try:
    entrata = json.dumps({"last_assistant_message": "Caricherò la bolla di ieri."})
    primo, secondo = lancia(p, entrata=entrata).returncode, lancia(p, entrata=entrata).returncode
    controlla(primo == 2 and secondo == 0, "frase già vista", f"{primo} {secondo}")
finally:
    shutil.rmtree(p)

# --aperte e --controlla
rc, out = modo("--aperte", "--breve")
controlla(rc == 0 and "PROMESSE APERTE a Mario: 1" in out and "C312" in out, "--aperte --breve", out)
# Mario 03/11 «4 consiglio»: le 5 più vecchie e le 5 più nuove, senza doppioni
molte = DA_FARE.replace("| C200 |", "".join(f"| C{n} | 🟠 **Voce {n}**. 👁 Lo vedi: qui · prova: foto | Claude | dopo |\n" for n in range(401, 412)) + "| C200 |")
rc, out = modo("--aperte", "--breve", da_fare=molte)
vecchie, _, nuove = out.partition("Le 5 più nuove:")
controlla(rc == 0 and "C312" in vecchie and "C404" in vecchie and "C405" not in vecchie
          and all(f"C{n}" in nuove for n in range(407, 412)) and "C406" not in nuove and nuove.index("C411") < nuove.index("C407"),
          "--breve con 5 vecchie e 5 nuove", out)
# C469 B5: --lotto N = le N più vecchie, numerate, con le scelte per Mario
rc, out = modo("--lotto", "3", da_fare=molte)
righe = [r for r in out.splitlines() if r[:2] in ("1.", "2.", "3.", "4.")]
controlla(rc == 0 and "le 3 più vecchie di 12" in out and "1 va · 2 non va" in out and len(righe) == 3
          and righe[0].startswith("1. C312") and righe[2].startswith("3. C402"), "--lotto 3", out)
rc, out = modo("--lotto", da_fare=molte)
controlla(rc == 0 and "le 10 più vecchie di 12" in out, "--lotto di base 10", out)
rc, out = modo("--aperte")
controlla("lo vedi: Inizio → 👥 Clienti, nomi interi" in out and "prova: lettura" in out, "--aperte", out)
controlla(modo("--controlla")[0] == 0, "Da fare in ordine")
senza = DA_FARE.replace(" · prova: lettura dei dati veri + foto dal sito", "")
rc, out = modo("--controlla", da_fare=senza)
controlla(rc == 1 and "C312" in out, "👁 senza prova", out)
finita = FATTE + "| C320 | ✅ **Riquadri** 👁 Visto da Mario: 29/10 · è online | Claude | — |\n"
rc, out = modo("--controlla", fatte=finita)
controlla(rc == 1 and "C320" in out, "finita senza la prova vista", out)
finita = FATTE + "| C320 | ✅ **Riquadri** 👁 Visto da Mario: 29/10 · foto archivio/C320/08-sito.png | Claude | — |\n"
controlla(modo("--controlla", fatte=finita)[0] == 0, "finita con la foto")

# Il Da fare vero del progetto è in ordine (progetto appena installato senza docs/DA-FARE.md: salto)
if os.path.exists(os.path.join(QUI, "..", "docs", "DA-FARE.md")):
    r = lancia(os.path.join(QUI, ".."), "--controlla")
    controlla(r.returncode == 0, "docs/DA-FARE.md vero", r.stdout)
else:
    print("salto: docs/DA-FARE.md non c'è ancora")

# Blocchi falsi (Risparmio 22, dati veri dell'11/11): l'intestazione di una tabella non è una promessa
# («| Domanda | Cosa farà l'app |» fermava il turno); una riga della tabella sì.
tab = "| Domanda | Cosa farà l'app |\n|---|---|\n| Turni | mostra i turni |"
controlla(stop(tab)[0] == 0, "intestazione di tabella: non è una promessa")
controlla(stop("| Cosa | Quando |\n|---|---|\n| Turni | Caricherò l'inventario domani |")[0] == 2,
          "promessa in una riga della tabella: conta ancora")

# Blocchi falsi (Risparmio 25, dati veri del 12/11): 4 frasi non promesse fermavano il turno; 5 promesse vere bloccano ancora
for nome, testo in (
        ("«Ho capito:» ripete la domanda di Mario",
         "Ho capito: chiedi perché la lista delle ragazze compare alle 8:00, e cosa succede se cominciano prima."),
        ("due celle di tabella", "| Pezzo | Difetto | Causa |\n|---|---|---|\n"
                                 "| Chat (letto) | la spunta «x» arriva tardi | «x» viene scritto 10 secondi dopo |"),
        ("l'avviso arriva a Claude", "Mi arriva l'avviso appena finisce."),
        ("l'avviso arriva a Claude, al contrario", "Appena finisce mi arriva l'avviso."),
        ("l'avviso arriverà a Claude", "Mi arriverà l'avviso appena finisce."),
        ("blocco «⚠ Aspettano te» senza il segno invisibile", "⚠ Aspettano te: 1\n- 📒 Giri 33 · il programma che farà i giri"),
        ("blocco «⚠️ Aspettano te»", "✅ FATTO\n- Avvio.\n───\n⚠️ Aspettano te: 2\n"
         "- 📒 Giri 33 · Buco trovato: il programma che farà i giri da solo gira da amministratore\n"
         "- 🛑 Principale 602 · Camere scelte con l'aiuto dell'app")):
    rc, err = stop(testo)
    controlla(rc == 0, "non bloccata (falso del 12/11): " + nome, err)
for frase in ("La v5 arriva da sola entro le 18:41.", "Le foto te le mando appena l'aiutante finisce.",
              "| Cosa | Quando |\n|---|---|\n| Turni | arriva con la v152 |", "Appena finisce ti arriva l'avviso.",
              "Caricherò l'inventario domani.", "Aspettano te le foto: te le mando stasera.", "⚠ Aspettano te: 1\n- Principale 602\nCaricherò l'inventario domani.", "Ti arriverà l'avviso appena finisce.",
              "Ho capito: vuoi i turni nuovi. Li metto stasera nella v153.",
              "Sto correggendo una prova del kit: l'esito arriva fra circa 2 minuti.",
              "Prossimi passi: prove verdi → ti mando le foto prima/dopo → col tuo ok entra nella v155.",
              "Se viene rosso lo correggo. Domani vedrai il riquadro nuovo.", "⚠️ Aspettano te: 1\n- Principale 602 · Camere\n\nLe foto te le mando stasera."):
    rc, err = stop("✅ FATTO\n" + frase)
    controlla(rc == 2, "promessa vera bloccata ancora: " + frase, err)

print(f"test-promesse: {ok_n} controlli ok")
