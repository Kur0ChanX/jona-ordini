#!/usr/bin/env python3
# Pulizia mensile dei rami di scorta su GitHub (C352, Mario 30/10 «consigliato»: scelta 1).
# Le scorte (scorta-<ruolo>-<AAAAMMGG>-<id>/<ramo>, …/<ramo>-ferma-<AAAAMMGG-HHMMSS>-<xxxx>) crescono di ~20 al giorno
# e non si cancellano mai da sole: in un mese sono centinaia. Qui si tolgono SOLO quelle che insieme sono:
#   - più vecchie di GIORNI (la data sta nel nome: niente da scaricare per saperlo);
#   - già tutte nel ramo di lavoro (merge-base --is-ancestor): cancellarle non perde una riga.
# Tutto il resto resta: i due nomi vecchi senza data (scorta-<ruolo>/<ramo>), le scorte recenti, le vecchie con lavoro non
# nel ramo (vengono elencate: le guarda una persona), i rami-copia versione-vNN e ogni altro ramo.
# Uso: python3 -I tools/pulisci-scorte.py            → prova a secco: dice cosa toglierebbe, non tocca niente
#      python3 -I tools/pulisci-scorte.py --cancella → cancella davvero (lo lancia il workflow «Pulisci le scorte» il 1° del mese)
#      opzioni: --ramo <ramo> (di base .claude/ramo-di-lavoro.txt), --giorni N (di base 30)
# Eccezione scritta alla regola 🔒 «nessun ramo si cancella» (REGOLE.md «Rami e PR», kit 29.3).
# C450 (kit 35.4, Mario 04/11 «se … solo vantaggi … perché dovrei dirti di no»): --unite toglie, a ogni età, le scorte
# di SESSIONI CHIUSE (non nella colonna «Sessione» aperta di docs/CHI-FA-COSA.md, mai questa sessione) già tutte nel
# ramo (is-ancestor un istante prima): i commit restano nella storia del ramo, sparisce solo l'etichetta. Un commit
# arrivato dopo = punta non antenata = resta. Lo lancia l'hook di avvio in sottofondo; un solo giro alla volta (lucchetto).
#      python3 -I tools/pulisci-scorte.py --unite --cancella
import argparse, datetime, fcntl, json, os, re, subprocess, sys

QUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(QUI)
sys.path.insert(0, os.path.join(os.path.dirname(QUI), ".claude", "hooks"))  # gli hook del repo di questo script
try:
    from scorta import sessioni_attive, sessione_corta, lavoro_della_scorta, FILE_REGISTRO, ARCHIVIO, configura_driver
except Exception:  # noqa: BLE001
    FILE_REGISTRO, ARCHIVIO = {}, ""

    def configura_driver():
        pass

    def sessioni_attive(base):
        return set()

    def lavoro_della_scorta(scorta, head="HEAD"):
        return "nuovo"  # senza l'hook non so dire: la scorta resta

    def sessione_corta(sessione):
        return (re.match(r"[A-Za-z0-9]*", re.sub(r"^(session|cse)_", "", str(sessione or ""))).group(0))[:12]
GIORNI = 30
TESTA_MSG = re.compile(r"^\+?## (\d{4}-\d{2}-\d{2} \S+) · ([A-Za-z0-9]+)", re.M)  # «## 2026-11-09 18:27 · 01WTjqUxYwFh»
NOME = re.compile(r"scorta-(principale|parallela)(?:-(\d{8})-([A-Za-z0-9]{1,12}))?/(.+?)(?:-ferma-(\d{8})-\d{6}-[0-9a-f]+)?")
FILTRO = "blob:limit=200k"  # E381: testi e codice sì (279 MB in tutta la storia, 11/11), foto no (arrivano solo se servono)


def run(*args, timeout=120, inp=None):
    """(rc, uscita). Tempo scaduto = rc 124 e uscita vuota, mai un'eccezione: per ogni chiamata «non riuscito» è la via
    prudente (la scorta resta, il fetch si dichiara fallito), e il giro notturno non muore a metà (E381)."""
    try:
        r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=timeout, cwd=BASE, input=inp)
    except subprocess.TimeoutExpired:
        return 124, ""
    return r.returncode, r.stdout.strip()


def file_della_storia():
    """E381 (11/11, la pulizia notturna mai riuscita): `actions/checkout` con `sparse-checkout` fa una copia SENZA i file
    (`--filter=blob:none`). Ogni versione di un file letta dalla storia (`git log -p`, `merge-tree`, `show`, `cat-file`)
    arriva allora dalla rete una per volta (~7 al secondo): la lettura dei messaggi di Mario, 2 s con i file, superava i
    300 s e il giro moriva. Qui arrivano in due viaggi: (1) i file piccoli di tutti i rami (testi e codice; le foto
    restano fuori); (2) tutte le versioni dell'archivio dei messaggi, che cresce senza tetto e supera il filtro.
    Su una copia intera (contenitore, PC) non fa niente. La usa anche tools/archivio-messaggi.py, che gira prima."""
    if run("config", "--get", "remote.origin.partialclonefilter")[1] != "blob:none":
        return False
    run("config", "remote.origin.partialclonefilter", FILTRO)
    if run("fetch", "-q", "--refetch", "--no-tags", "origin", "+refs/heads/*:refs/remotes/origin/*", timeout=900)[0]:
        print("⚠️ File piccoli della storia non scaricati in un colpo solo: il giro va avanti, ma piano.")
    if ARCHIVIO:
        # nomi delle versioni senza scaricarle (`--raw`); poi tutte insieme, col comando che git usa da solo per un
        # file mancante (promisor-remote.c), ma in un viaggio solo invece di uno per file
        righe = run("log", "--raw", "--no-abbrev", "-m", "--format=", "--remotes=origin", "--", ARCHIVIO + "/", timeout=300)[1]
        ids = sorted({i for r in righe.splitlines() if r.startswith(":") for i in r.split()[2:4]} - {"0" * 40})
        if ids and run("-c", "fetch.negotiationAlgorithm=noop", "fetch", "origin", "--no-tags", "--no-write-fetch-head",
                       "--recurse-submodules=no", "--filter=blob:none", "--stdin", inp="\n".join(ids) + "\n", timeout=600)[0]:
            print("⚠️ Versioni dell'archivio dei messaggi non scaricate in un colpo solo: il giro va avanti, ma piano.")
    return True


def ramo_di_lavoro():
    try:
        with open(os.path.join(BASE, ".claude", "ramo-di-lavoro.txt"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


def scorte(ramo):
    """[(nome, sha, data AAAAMMGG o '')] delle scorte del ramo su GitHub, dai soli nomi (ls-remote)."""
    rc, out = run("ls-remote", "--heads", "origin", "scorta-*")
    if rc:
        raise SystemExit("ls-remote fallito: GitHub non risponde")
    voci = []
    for riga in out.splitlines():
        sha, _, rif = riga.partition("\t")
        m = NOME.fullmatch(rif.removeprefix("refs/heads/"))
        if m and m.group(4) == ramo:
            voci.append((m.group(0), sha, m.group(5) or m.group(2) or "", m.group(3) or ""))
    return voci


def scegli(voci, ramo, giorni=GIORNI, oggi=None, unite=False, attive=None, mia=""):
    """(da_cancellare, tenute_con_lavoro): vecchie e già nel ramo → via; vecchie ma con lavoro non nel ramo → elencate.
    Con `unite` (C450): a ogni età, solo le scorte con l'id di una sessione che non è aperta (`attive`) né `mia`."""
    oggi = oggi or datetime.date.today()
    limite = (oggi - datetime.timedelta(days=giorni)).strftime("%Y%m%d")
    if unite:
        attive = set(attive or ())
        vecchie = [v for v in voci if v[3] and v[3] not in attive and v[3] != mia]
    else:
        vecchie = [v for v in voci if v[2] and v[2] < limite]
    if not vecchie:
        return [], []
    if unite:  # senza --unite basta is-ancestor (commit e alberi): i file non servono
        file_della_storia()
    for i in range(0, len(vecchie), 200):  # a gruppi: la riga di comando non cresce senza fine
        if run("fetch", "-q", "origin", ramo, *[f"+refs/heads/{v[0]}:refs/remotes/origin/{v[0]}" for v in vecchie[i:i + 200]], timeout=300)[0]:
            raise SystemExit("fetch delle scorte fallito")
    if run("rev-parse", "--is-shallow-repository")[1] == "true":  # clone poco profondo: senza storia is-ancestor dice no
        run("fetch", "-q", "--unshallow", "origin", timeout=600)
    via, tenute = [], []
    visti = messaggi_nel_ramo(ramo) if unite else set()
    for v in vecchie:
        if run("merge-base", "--is-ancestor", v[1], f"origin/{ramo}")[0] == 0:
            via.append(v)
        elif unite and solo_automatica(v, ramo, visti):
            via.append(v)
        else:
            tenute.append(v)
    return via, tenute


def messaggi_nel_ramo(ramo):
    """Intestazioni dei messaggi di Mario mai entrate nei registri del ramo (tutta la storia: il registro tiene solo gli
    ultimi 40, i vecchi escono ma erano arrivati)."""
    if not FILE_REGISTRO:
        return set()
    archivio = [ARCHIVIO + "/"] if ARCHIVIO else []  # C469 fase 1: anche l'archivio senza tetto
    rc, storia = run("log", "-p", "-m", "--format=", "--no-color", f"origin/{ramo}", "--",
                     *FILE_REGISTRO.values(), *archivio, timeout=300)
    if rc:  # E381: senza la storia dei messaggi nessuna scorta «col solo commit automatico» va via; le altre sì
        print("⚠️ Storia dei messaggi di Mario non letta (tempo scaduto o errore): le scorte col solo commit automatico restano.")
        return set()
    return set(TESTA_MSG.findall(storia))


def solo_automatica(v, ramo, visti):
    """C469 C2 (Mario 09/11 «vai come consiglio»): scorta di sessione chiusa col solo commit automatico (file della
    scorta: ultimo messaggio, registro, ultima risposta) mai unito. Si toglie solo se unirla non porta niente E ogni
    messaggio di Mario della sua sessione è già arrivato nel ramo: un messaggio mai arrivato la tiene (E290)."""
    if not visti or lavoro_della_scorta(f"origin/{v[0]}", head=f"origin/{ramo}") != "niente":
        return False
    for f in FILE_REGISTRO.values():
        rc, testo = run("show", f"origin/{v[0]}:{f}")
        if rc == 0 and any(m[1] == v[3] and m not in visti for m in TESTA_MSG.findall(testo)):
            return False
    return True


def lucchetto():
    """Un solo giro alla volta (l'hook di avvio lo lancia in sottofondo): None se un altro giro è in corso."""
    rc, gitdir = run("rev-parse", "--absolute-git-dir")
    f = open(os.path.join(gitdir if rc == 0 and gitdir else BASE, "pulisci-scorte.lock"), "w")
    try:
        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        return None
    return f


def cancella(via):
    """Cancella i rami su GitHub a gruppi (un push ogni 50 rami): ritorna (quanti sono andati, rifiutata).
    C469: se i primi 3 rami uno per uno sono rifiutati e nessuno è andato, la cancellazione da qui non è permessa
    (09/11, contenitore in cloud: «0 di 171» dopo ~3 min di tentativi): ci si ferma subito."""
    fatti = rifiutati = 0
    for i in range(0, len(via), 50):
        gruppo = [v[0] for v in via[i:i + 50]]
        if run("push", "-q", "origin", "--delete", *gruppo, timeout=300)[0] == 0:
            fatti += len(gruppo)
            continue
        for n in gruppo:  # uno già sparito fa fallire tutto il gruppo: uno per uno
            if run("push", "-q", "origin", "--delete", n)[0] == 0:
                fatti += 1
            elif not fatti:
                rifiutati += 1
                if rifiutati >= 3:
                    return fatti, True
    return fatti, False


CONSUMO = "archivio/consumo/"


def avanti(dati):
    """Il totale del giorno di una sessione cresce soltanto: più turni (poi più peso) = versione più nuova."""
    return (dati.get("turni") or 0, dati.get("peso") or 0) if isinstance(dati, dict) else (-1, -1)


def raccogli_consumo(voci, ramo, attive, mia=""):
    """Risparmio 25 (14/11, prova a secco su 25 scorte a caso: 23 «con lavoro non nel ramo» portavano SOLO il proprio
    file di archivio/consumo/, i totali dei token del giorno). Qui, delle scorte di sessioni chiuse, la versione più avanti
    di ogni file di consumo va nella cartella di lavoro (il commit lo fa il giro notturno); dopo, unire quelle scorte non
    porta più niente e --unite le toglie. Mai una versione più indietro di quella del ramo: nessun dato perso.
    → {percorso: testo scritto}"""
    chiuse = [v for v in voci if v[3] and v[3] not in attive and v[3] != mia]
    for i in range(0, len(chiuse), 200):
        if run("fetch", "-q", "origin", ramo, *[f"+refs/heads/{v[0]}:refs/remotes/origin/{v[0]}" for v in chiuse[i:i + 200]], timeout=300)[0]:
            raise SystemExit("fetch delle scorte fallito")
    def leggi(rif, percorso):  # testo intero (run() toglie gli spazi in fondo: il file deve restare uguale byte per byte)
        try:
            r = subprocess.run(["git", "show", f"{rif}:{percorso}"], capture_output=True, text=True, timeout=60, cwd=BASE)
        except subprocess.TimeoutExpired:
            return None, None
        if r.returncode:
            return None, None
        try:
            return json.loads(r.stdout), r.stdout
        except ValueError:
            return None, None
    scelti = {}
    for v in chiuse:
        rc, out = run("diff", "--name-only", f"origin/{ramo}", f"origin/{v[0]}", "--", CONSUMO)
        for percorso in (out.splitlines() if rc == 0 else []):
            if not re.fullmatch(r"archivio/consumo/[\w.-]+\.json", percorso):
                continue
            dati, testo = leggi(f"origin/{v[0]}", percorso)
            if testo is None:
                continue
            if percorso not in scelti:
                scelti[percorso] = (leggi(f"origin/{ramo}", percorso)[0], None)
            if avanti(dati) > avanti(scelti[percorso][0]):
                scelti[percorso] = (dati, testo)
    nuovi = {p: t for p, (_, t) in scelti.items() if t is not None}
    for p, t in nuovi.items():
        os.makedirs(os.path.join(BASE, os.path.dirname(p)), exist_ok=True)
        with open(os.path.join(BASE, p), "w", encoding="utf-8") as f:
            f.write(t)
    return nuovi


def main(argv=None):
    p = argparse.ArgumentParser(description="Pulizia mensile dei rami di scorta già nel ramo (C352).")
    p.add_argument("--cancella", action="store_true", help="cancella davvero (di base solo prova a secco)")
    p.add_argument("--ramo", default=ramo_di_lavoro())
    p.add_argument("--giorni", type=int, default=GIORNI)
    p.add_argument("--elenco", action="store_true", help="C469 A1: tutte le tenute (di base le prime 10)")
    p.add_argument("--unite", action="store_true", help="C450: a ogni età, le scorte di sessioni chiuse già tutte nel ramo")
    p.add_argument("--consumo", action="store_true", help="Risparmio 25: i file di consumo delle scorte chiuse nella cartella di lavoro (niente cancellato)")
    p.add_argument("--mia", default=sessione_corta(os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID")), help="id di questa sessione: la sua scorta resta")
    a = p.parse_args(argv)
    if not a.ramo:
        raise SystemExit("ramo di lavoro non trovato (.claude/ramo-di-lavoro.txt o --ramo)")
    chiave = lucchetto()
    if chiave is None:
        print("Un altro giro è in corso: niente da fare.")
        return 0
    if a.consumo:
        attive = sessioni_attive(BASE)
        if not attive:
            raise SystemExit("--consumo: nessuna sessione aperta letta da docs/CHI-FA-COSA.md: mi fermo")
        nuovi = raccogli_consumo(scorte(a.ramo), a.ramo, attive, a.mia)
        print(f"Consumo dalle scorte chiuse: {len(nuovi)} file più avanti di quelli del ramo, scritti nella cartella di lavoro.")
        return 0
    configura_driver()  # C469: senza i driver un registro o l'archivio cambiato sui due lati sembrerebbe un conflitto
    voci = scorte(a.ramo)
    attive = sessioni_attive(BASE) if a.unite else set()
    if a.unite and not attive:  # senza docs/CHI-FA-COSA.md (o hook scorta.py) tutte le chat sembrerebbero chiuse: mai
        raise SystemExit("--unite: nessuna sessione aperta letta da docs/CHI-FA-COSA.md (file o .claude/hooks/scorta.py mancanti): mi fermo")
    via, tenute = scegli(voci, a.ramo, a.giorni, unite=a.unite, attive=attive, mia=a.mia)
    if a.unite:
        print(f"Scorte del ramo {a.ramo} su GitHub: {len(voci)}; di sessioni chiuse ({len(attive)} aperte in docs/CHI-FA-COSA.md"
              f"{', più questa' if a.mia else ''}) e già nel ramo (o col solo commit automatico): {len(via)}; di sessioni chiuse con lavoro non nel ramo "
              f"(restano, da guardare): {len(tenute)}.")
    else:
        print(f"Scorte del ramo {a.ramo} su GitHub: {len(voci)}; più vecchie di {a.giorni} giorni e già nel ramo: {len(via)}; "
              f"vecchie con lavoro non nel ramo (restano, da guardare): {len(tenute)}.")
    for nome, _, data, _ in (tenute if a.elenco else tenute[:10]):  # C469 A1: in chat solo 10 (181 righe = ~6k token)
        print(f"  tenuta: {nome} ({data[:4]}-{data[4:6]}-{data[6:]})")
    if len(tenute) > 10 and not a.elenco:
        print(f"  … e altre {len(tenute) - 10} tenute (elenco intero: --elenco)")
    if not via:
        return 0
    if not a.cancella:
        print("Prova a secco (senza --cancella): niente toccato. Toglierebbe:")
        for nome, _, _, _ in via:
            print(f"  {nome}")
        return 0
    fatti, rifiutata = cancella(via)
    print(f"Cancellate {fatti} di {len(via)}.")
    if rifiutata:
        print("Cancellazione rifiutata da qui (permesso del contenitore o di GitHub): niente perso, le toglie il giro "
              "notturno «Pulisci le scorte» su GitHub.")
    return 0 if fatti == len(via) else 1


if __name__ == "__main__":
    sys.exit(main())
