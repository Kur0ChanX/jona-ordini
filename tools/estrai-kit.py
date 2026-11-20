#!/usr/bin/env python3
# Estrae i file del pacchetto del kit dalle parti su disco (kit 38.18, 10/11/2026): i file uguali per
# tutti i progetti, FUORI da .claude/, si scrivono uguali al byte invece di ricopiarli con Write (~230 mila token in meno
# per un pacchetto intero e nessun errore di copia nel codice). Le parti arrivano su disco da `scarica-kit.py --cartella`
# o allegate da Mario; arrivate solo come messaggi, i file si scrivono con Write come prima.
# Non scrive MAI: .claude/, .mcp.json, .github/ (file che cambiano come lavora Claude o cosa gira: solo Write, file per
# file, con l'ok scritto di Mario, E69), CLAUDE.md (punto 5 della parte 1) e i file con segnaposto. Li elenca con la
# parte e le righe da leggere. moduli/ non va nel progetto; ERRORI, DA-FARE, PASSAGGIO-CONSEGNE e STORIA-REGOLE solo se mancano.
# Uso, dalla cartella del progetto:
#   python3 -I tools/estrai-kit.py <cartella delle parti>            → prova: dice cosa farebbe, non scrive niente
#   python3 -I tools/estrai-kit.py <cartella delle parti> --scrivi   → scrive i file fuori da .claude/
#   … --scrivi --anche-claude   (kit 38.51, C511 p.3) → anche i file di .claude/ senza segnaposto, SOLO dopo l'ok scritto
#        di Mario in chat; se il controllo di sicurezza lo blocca, quei file con Write come prima (E69).
# Un file che c'è ed è diverso: prima la copia accanto `<file>.prima-del-kit` (mai cancellata); se quella copia c'è già
# (kit applicato un'altra volta) resta com'è: tiene il file di PRIMA del kit, non la versione di mezzo (C511 p.1).
# Le parti stanno in una cartella di lavoro FUORI dal progetto (C511 p.6: dentro, le ricerche in docs/ le leggono e
# sprecano token): dentro il progetto lo script si ferma. Con --scrivi mette `__pycache__/` in .gitignore (C511 p.2:
# gli hook che importano altri hook lasciano .claude/hooks/__pycache__/). A ogni giro misura CLAUDE.md del progetto
# col tetto del kit (C511 p.9: ~1.000 token, come kit-check.py e fai-kit.py) e lo dice subito.
# Uscita: 0 riuscito · 2 parti mancanti, doppie, rotte o dentro il progetto. Prova: python3 -I tools/test-estrai-kit.py
import os, re, shutil, sys

RECINTO = "~" * 5  # come in fai-pacchetto.py del kit (scritto così: il segno intero non può stare nei file del pacchetto)
# Scritti spezzati: un segnaposto intero in questo file lo metterebbe fra quelli da sostituire a mano.
SEGNAPOSTO = tuple("<" + n + ">" for n in ("PROGETTO", "ICONA", "REPO", "OWNER", "NOME-REPO", "RAMO", "ALTRI", "INDIRIZZO-ANTEPRIMA"))
PROTETTI = (".claude/", ".mcp.json", ".github/", "CLAUDE.md")  # solo Write della sessione (E69)
SOLO_SE_MANCA = ("docs/ERRORI.md", "docs/DA-FARE.md", "docs/PASSAGGIO-CONSEGNE.md", "docs/STORIA-REGOLE.md",  # file del progetto
                 "docs/CHI-FA-COSA.md", "docs/ACCOUNT.md", "docs/GUIDE-GIUSTE.md", ".gitattributes")  # C511 p.13 p.15 p.25
TETTO_CLAUDE = 1000  # token stimati di CLAUDE.md: uguale a TETTO_CLAUDE di tools/fai-kit.py e TETTI di kit-check.py
CARATTERI_PER_TOKEN = 2.1  # come tools/fai-kit.py e .claude/hooks/kit-check.py
PYCACHE = "__pycache__/"
NOME_PARTE = re.compile(r"^PACCHETTO-v(\d+)-(indipendente-)?(\d+)di(\d+)\.md$")
TITOLO_FILE = re.compile(r"^### `([^`]+)`$")


def parti_in(cartella):
    """→ [(numero, percorso)] delle parti di UN pacchetto, in ordine; errore se mancano o se ce n'è più d'uno."""
    trovate = {}
    for nome in os.listdir(cartella):
        m = NOME_PARTE.match(nome)
        if m:
            trovate.setdefault((m.group(1), bool(m.group(2)), int(m.group(4))), {})[int(m.group(3))] = os.path.join(cartella, nome)
    if not trovate:
        raise ValueError(f"nessuna parte PACCHETTO-v…-<i>di<N>.md in {cartella}")
    if len(trovate) > 1:
        raise ValueError("più pacchetti nella cartella (" + ", ".join(
            f"v{v}{' indipendente' if i else ''} in {n} parti" for v, i, n in sorted(trovate)) + "): lascia solo quello da applicare")
    (_, _, totale), parti = next(iter(trovate.items()))
    mancano = [i for i in range(1, totale + 1) if i not in parti]
    if mancano:
        raise ValueError(f"mancano le parti {mancano} di {totale}")
    return [(i, parti[i]) for i in range(1, totale + 1)]


def leggi_file(parti):
    """→ [(percorso nel progetto, testo, parte, prima riga, ultima riga)] dei file del pacchetto, nell'ordine."""
    fuori, visti = [], set()
    for numero, percorso in parti:
        with open(percorso, encoding="utf-8", newline="") as f:
            righe = f.read().split("\n")
        i = 0
        while i < len(righe):
            m = TITOLO_FILE.match(righe[i])
            if m and i + 1 < len(righe) and righe[i + 1] == RECINTO:
                rel, inizio = m.group(1), i + 2
                fine = inizio
                while fine < len(righe) and righe[fine] != RECINTO:
                    fine += 1
                if fine == len(righe):
                    raise ValueError(f"parte {numero}: «{rel}» senza la chiusura {RECINTO}")
                if not sicuro(rel):
                    raise ValueError(f"parte {numero}: percorso non ammesso «{rel}»")
                if rel in visti:
                    raise ValueError(f"parte {numero}: «{rel}» due volte")
                visti.add(rel)
                fuori.append((rel, "\n".join(righe[inizio:fine]) + "\n", numero, inizio + 1, fine))
                i = fine + 1
            else:
                i += 1
    if not fuori:
        raise ValueError("nessun file nelle parti")
    return fuori


def sicuro(rel):
    """Solo percorsi dentro il progetto: il pacchetto è testo arrivato da fuori."""
    norm = os.path.normpath(rel)
    return bool(rel) and not os.path.isabs(rel) and "\\" not in rel and norm == rel and not norm.startswith("..")


def con_segnaposto(testo):
    return [s for s in SEGNAPOSTO if s in testo]


def uguale_ai_segnaposto(testo, attuale):
    """Il file del progetto è quello del pacchetto coi segnaposto già sostituiti? (aggiornamenti: niente da riscrivere)"""
    modello = re.escape(testo)
    for s in SEGNAPOSTO:
        modello = modello.replace(re.escape(s), "(.+?)")
    return re.fullmatch(modello, attuale, re.S) is not None


EREDITATE = "## Lezioni ereditate"  # C511 p.26: in docs/ERRORI.md del progetto si riscrive solo questa sezione


def sezione(testo, titolo):
    """→ (inizio, fine) della sezione «titolo…» fino al «## » dopo (o alla fine), o None."""
    m = re.search(r"^" + re.escape(titolo) + r".*$", testo, re.M)
    if not m:
        return None
    dopo = re.search(r"^## ", testo[m.end():], re.M)
    return m.start(), (m.end() + dopo.start()) if dopo else len(testo)


def con_ereditate(attuale, kit):
    """Il diario del progetto con la sezione delle lezioni ereditate del kit al posto della sua (o prima della prima
    «## » se manca): le sue righe restano tutte (C511 p.26)."""
    nuova = sezione(kit, EREDITATE)
    if nuova is None:
        return attuale
    blocco = kit[nuova[0]:nuova[1]]
    blocco = blocco if blocco.endswith("\n\n") else blocco.rstrip("\n") + "\n\n"
    vecchia = sezione(attuale, EREDITATE)
    if vecchia:
        return attuale[:vecchia[0]] + blocco + attuale[vecchia[1]:]
    primo = re.search(r"^## ", attuale, re.M)
    i = primo.start() if primo else len(attuale)
    return attuale[:i] + ("" if i == 0 or attuale[:i].endswith("\n\n") else "\n") + blocco + attuale[i:]


def righe_tolte(attuale, kit):
    """C511 p.10 (collaudo): righe «- …» della vecchia sezione ereditata che la nuova non ha più (lezioni tolte dal
    kit, o righe del progetto scritte lì per sbaglio): si dicono, così chi installa le rimette dove servono."""
    vecchia, nuova = sezione(attuale, EREDITATE), sezione(kit, EREDITATE)
    if not vecchia or not nuova:
        return []
    restano = set(kit[nuova[0]:nuova[1]].splitlines())
    return [r for r in attuale[vecchia[0]:vecchia[1]].splitlines() if r.startswith("- ") and r not in restano]


def leggi_progetto(progetto, rel):
    try:
        with open(os.path.join(progetto, rel), encoding="utf-8", newline="") as f:
            return f.read()
    except (OSError, UnicodeDecodeError):
        return None


def piano(file, progetto, anche_claude=False):
    """→ [(rel, cosa, nota, parte, riga1, riga2)]; cosa: scrivi · uguale · mano · fuori. anche_claude: i file di .claude/
    senza segnaposto vanno fra quelli da scrivere (C511 p.3); .mcp.json, .github/ e CLAUDE.md restano a Write."""
    voci = []
    for rel, testo, parte, r1, r2 in file:
        attuale = leggi_progetto(progetto, rel)
        segni = con_segnaposto(testo)
        if rel.startswith("moduli/"):
            voci.append((rel, "fuori", "guida del punto 5, non va nel progetto", parte, r1, r2))
        elif rel == "CLAUDE.md":
            voci.append((rel, "mano", "punto 5 della parte 1, mai a occhi chiusi", parte, r1, r2))
        elif rel == "docs/ERRORI.md" and attuale is not None and attuale != testo:
            tolte = righe_tolte(attuale, testo)
            nota = "c'è già: cambia solo la sezione «Lezioni ereditate» (C511 p.26)"
            if tolte:  # C511 p.10
                nota += (f"; {len(tolte)} righe di prima non ci sono più (" + " · ".join(r[2:40] for r in tolte[:3])
                         + "): se erano del progetto, rimettile in «Errori di questo progetto»")
            voci.append((rel, "scrivi", nota, parte, r1, r2))
        elif rel in SOLO_SE_MANCA and attuale is not None:
            voci.append((rel, "fuori", "c'è già: tieni il tuo", parte, r1, r2))
        elif attuale == testo or (segni and attuale is not None and uguale_ai_segnaposto(testo, attuale)):
            voci.append((rel, "uguale", "", parte, r1, r2))
        elif segni:
            voci.append((rel, "mano", "segnaposto " + " ".join(segni) + (" · nuovo" if attuale is None else " · cambiato"), parte, r1, r2))
        elif rel == ".claude/settings.json" and attuale is not None:  # collaudo 38.52: impostazioni del progetto, mai sovrascritte
            voci.append((rel, "mano", "cambiato · impostazioni tue: unisci a mano (tieni le tue voci, aggiungi quelle del kit)", parte, r1, r2))
        elif anche_claude and rel.startswith(".claude/"):
            voci.append((rel, "scrivi", ("nuovo" if attuale is None else "cambiato") + " · .claude/, con l'ok scritto di Mario", parte, r1, r2))
        elif rel.startswith(PROTETTI) or rel in PROTETTI:
            voci.append((rel, "mano", ("nuovo" if attuale is None else "cambiato") + " · file protetto, con Write dopo l'ok di Mario", parte, r1, r2))
        else:
            voci.append((rel, "scrivi", "nuovo" if attuale is None else "cambiato", parte, r1, r2))
    return voci


def scrivi(progetto, rel, testo):
    """→ True se ha fatto la copia `.prima-del-kit`; una copia che c'è già non si riscrive (C511 p.1)."""
    p = os.path.join(progetto, rel)
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    copia = os.path.exists(p) and not os.path.exists(p + ".prima-del-kit")
    if copia:
        shutil.copy2(p, p + ".prima-del-kit")
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(testo)
    return copia


def dentro(cartella, progetto):
    """La cartella delle parti è dentro il progetto? (C511 p.6)"""
    c, p = os.path.realpath(cartella), os.path.realpath(progetto)
    return c == p or c.startswith(p + os.sep)


def gitignore(progetto, davvero):
    """`__pycache__/` in .gitignore (C511 p.2). → riga da stampare, '' se c'è già."""
    p = os.path.join(progetto, ".gitignore")
    testo = leggi_progetto(progetto, ".gitignore") or ""
    if any(r.strip() in (PYCACHE, "__pycache__", "**/__pycache__/") for r in testo.splitlines()):
        return ""
    if davvero:
        with open(p, "a", encoding="utf-8") as f:
            f.write(("" if not testo or testo.endswith("\n") else "\n") + PYCACHE + "\n")
        return f".gitignore: aggiunto {PYCACHE} (gli hook che si importano lasciano .claude/hooks/__pycache__/)"
    return f".gitignore: da aggiungere {PYCACHE} (lo fa --scrivi)"


def misura_claude(progetto):
    """Riga col tetto di CLAUDE.md (C511 p.9): il tetto si vede subito, non alla sessione dopo da kit-check.py."""
    testo = leggi_progetto(progetto, "CLAUDE.md")
    if testo is None:
        return "CLAUDE.md: non c'è ancora. Scritto il tuo (punto 5), rilancia la prova: misura il tetto."
    stima = round(len(testo) / CARATTERI_PER_TOKEN)
    if stima > TETTO_CLAUDE:
        return (f"ATTENZIONE CLAUDE.md: ~{stima} token stimati, tetto {TETTO_CLAUDE}: accorcialo ADESSO (procedure nelle skill, "
                "storia in docs/STORIA-REGOLE.md), poi rilancia la prova. Sennò ogni avvio lo segnala.")
    return f"CLAUDE.md: ~{stima} token stimati su {TETTO_CLAUDE}: dentro il tetto."


def main(argv):
    opzioni = argv[1:]
    if not argv or argv[0].startswith("-") or any(a not in ("--scrivi", "--anche-claude") for a in opzioni) \
            or ("--anche-claude" in opzioni and "--scrivi" not in opzioni):
        print("Uso: python3 -I tools/estrai-kit.py <cartella delle parti> [--scrivi [--anche-claude]]")
        return 2
    progetto, davvero, anche_claude = os.getcwd(), "--scrivi" in opzioni, "--anche-claude" in opzioni
    if dentro(argv[0], progetto):
        print(f"FERMO: le parti sono dentro il progetto ({argv[0]}): le ricerche in docs/ le leggerebbero e sprecano token "
              "(C511 p.6). Spostale in una cartella di lavoro fuori dal repo (la scratchpad, o /home/user/kit-parti/), "
              "poi rilancia da lì. Non ho scritto niente.")
        return 2
    try:
        parti = parti_in(argv[0])
        file = leggi_file(parti)
    except (OSError, ValueError) as e:
        print(f"FERMO: {e}. Non ho scritto niente.")
        return 2
    attuale = leggi_progetto(progetto, "docs/ERRORI.md")
    if attuale is not None:  # C511 p.26: diario del progetto + le lezioni ereditate nuove del kit
        file = [(rel, con_ereditate(attuale, t) if rel == "docs/ERRORI.md" else t, *resto) for rel, t, *resto in file]
    voci = piano(file, progetto, anche_claude)
    testi = {rel: testo for rel, testo, *_ in file}
    per = {c: [v for v in voci if v[1] == c] for c in ("scrivi", "uguale", "mano", "fuori")}
    print(f"Pacchetto in {len(parti)} parti, {len(file)} file · {'SCRIVO' if davvero else 'PROVA (niente scritto; poi --scrivi)'}")
    print(f"Già uguali: {len(per['uguale'])}")
    print(f"{'Scritti' if davvero else 'Da scrivere'} da qui, uguali al byte: {len(per['scrivi'])}")
    for rel, _, nota, *_ in per["scrivi"]:
        copia = scrivi(progetto, rel, testi[rel]) if davvero else not os.path.exists(os.path.join(progetto, rel + ".prima-del-kit"))
        if nota.startswith("cambiato"):
            nota += f" (vecchio in {rel}.prima-del-kit)" if copia else f" ({rel}.prima-del-kit c'è già: resta com'è)"
        print(f"  {rel} · {nota}")
    print(f"Da scrivere tu con Write: {len(per['mano'])} (leggi solo quelle righe della parte; prima il vecchio in <file>.prima-del-kit)")
    for rel, _, nota, parte, r1, r2 in per["mano"]:
        print(f"  {rel} · {nota} · parte {parte}, righe {r1}-{r2}")
    for rel, _, nota, *_ in per["fuori"]:
        print(f"Non scritto: {rel} · {nota}")
    for riga in (gitignore(progetto, davvero), misura_claude(progetto), copie_vecchie(progetto)):
        if riga:
            print(riga)
    return 0


def copie_vecchie(progetto):
    """C511 p.13 (collaudo): le copie `.prima-del-kit` non si cancellano mai da sole (p.1), ma restano per sempre e
    all'aggiornamento dopo non si rifanno: si dicono, così, a installazione controllata, si tolgono con `git rm`
    (la versione vecchia resta comunque nella storia di git)."""
    trovate = []
    for radice, cartelle, file in os.walk(progetto):
        cartelle[:] = [c for c in cartelle if c not in (".git", "node_modules")]
        trovate += [os.path.relpath(os.path.join(radice, f), progetto) for f in file if f.endswith(".prima-del-kit")]
    if not trovate:
        return ""
    return (f"Copie vecchie: {len(trovate)} `.prima-del-kit` ({', '.join(sorted(trovate)[:3])}"
            + (f" e altre {len(trovate) - 3}" if len(trovate) > 3 else "") + "). A installazione controllata toglile con "
            "`git rm` (restano nella storia di git): finché ci sono, il prossimo aggiornamento non rifà la copia.")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
