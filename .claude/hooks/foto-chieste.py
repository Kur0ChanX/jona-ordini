#!/usr/bin/env python3
"""Foto e video pronti per Mario e mai chiesti (hook Stop, C516, E498; Mario 18/11: «le foto da approvare non sono nella
lista «Aspetta Mario», quindi nessuno te le ha chieste; molto grave da non ricapitare mai più da nessuna parte»).

Firma dell'errore: foto o video salvati da QUESTA sessione in `archivio/` (commit suoi), non mandati a Mario con lo
strumento dei file e senza una riga di «## 0. Aspetta Mario» (`docs/DA-FARE.md`) che ne cita il percorso. I controlli
della riga (`titolo-giallo.py`) partono solo se il messaggio ha già una domanda: questo parte anche se non ho chiesto.
Una foto è a posto se vale una di queste:
  mandata   lo stesso file mandato (SendUserFile) in questa sessione; oppure, dopo la nascita della foto, un file
            della stessa cartella o un suo pezzo o confronto (`<nome>-1di3.png`, `<nome>-confronto.png`) da ovunque;
  citata    la sezione 0 cita il file, la sua cartella o l'inizio del suo percorso (ricordato in
            .git/foto-chieste.json col contenuto: quando Mario risponde e la riga va via la foto non torna aperta);
Foto RIFATTA sopra lo stesso file (un mio commit la cambia, stato M; anche solo ricompressa): è un'immagine nuova.
Torna aperta finché non la rimando (un invio di prima della rinascita non conta) o non c'è la riga che la cita.
  non per Mario   un pezzo del percorso contiene «mario» (ricevuta da lui: `foto-mario/`, `mario-….jpg`), una
            cartella si chiama `lavoro`, `rapporti` o `collaudo`, o il nome comincia con `lavoro-`.
Foto «di questa sessione»: aggiunte o rifatte da un commit del registro dei movimenti di git («commit», mai «merge», «pull» o
«checkout»: le foto delle altre chat non contano) dopo l'inizio della trascrizione. I file non ancora in commit no.
Modi:
  (niente)   hook Stop: con foto aperte blocca la fine del turno (uscita 2, una riga su stderr), una volta per turno
             finché restano aperte: ogni uscita è un comando solo e lascia traccia (invio, riga, `git mv`).
  --aperte [--trascrizione FILE]   le cartelle aperte, una per riga; uscita 1 se ce ne sono (`tools/consegne.py
             controlla`: niente handoff con foto aperte).
  --arretrati [GIORNI]   stima una tantum (di base 14 giorni): cartelle di foto aggiunte da chiunque e mai citate in
             una riga «- gg/mm ·» nella storia di `docs/DA-FARE.md` che c'è (copia corta = stima); sempre uscita 0.
Secondo giro (`stop_hook_active`), progetto senza `archivio/` o senza sezione 0, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-foto-chieste.py
"""
import glob
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime

MEDIA = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.mov')
PERCORSO = re.compile(r'archivio/[\w./+-]+')
MIO_COMMIT = re.compile(r'commit(?: \((?:amend|initial)\))?:')
RIGA_REFLOG = re.compile(r'([0-9a-f]{40}) HEAD@\{(\d+)\} (.*)')
SEZIONE_0 = re.compile(r'^## 0\. Aspetta Mario.*?$(.*?)(?=^## |\Z)', re.M | re.S)
RIGA_ASPETTA = re.compile(r'^\+- \d\d/\d\d ·')
DI_LAVORO = ('lavoro', 'rapporti', 'collaudo')
MEMORIA = 'foto-chieste.json'
TOLLERANZA = 5  # secondi fra l'ora del file e l'ora dell'invio


def git(progetto, *argomenti):
    try:
        r = subprocess.run(['git', '-c', 'core.quotepath=off', *argomenti], capture_output=True, text=True,
                           errors='replace', cwd=progetto, timeout=20)
        return r.stdout if r.returncode == 0 else ''
    except (OSError, subprocess.SubprocessError):
        return ''


def secondi(iso):
    """'2026-11-18T21:40:02.259Z' → secondi dal 1970 (0 se non si legge)."""
    try:
        return datetime.fromisoformat(str(iso).replace('Z', '+00:00')).timestamp()
    except ValueError:
        return 0


def leggi_trascrizione(percorso, progetto):
    """→ (inizio della sessione in secondi, [(percorso mandato, ora dell'invio)]).
    Un invio rifiutato o fallito (esito con is_error) non conta."""
    inizio, chiamate, falliti = 0, [], set()
    try:
        with open(percorso, encoding='utf-8', errors='replace') as f:
            for riga in f:
                if not inizio and '"timestamp"' in riga:
                    try:
                        inizio = secondi(json.loads(riga).get('timestamp'))
                    except ValueError:
                        pass
                if '"SendUserFile"' not in riga and '"is_error"' not in riga:
                    continue
                try:
                    d = json.loads(riga)
                except ValueError:
                    continue
                contenuto = (d.get('message') or {}).get('content')
                if not isinstance(contenuto, list):
                    continue
                for b in contenuto:
                    if not isinstance(b, dict):
                        continue
                    if b.get('type') == 'tool_use' and b.get('name') == 'SendUserFile':
                        for x in ((b.get('input') or {}).get('files') or []):
                            chiamate.append((b.get('id'), str(x), secondi(d.get('timestamp'))))
                    elif b.get('type') == 'tool_result' and b.get('is_error'):
                        falliti.add(b.get('tool_use_id'))
    except OSError:
        pass
    mandati = []
    for ident, x, quando in chiamate:
        if ident in falliti:
            continue
        assoluto = x if os.path.isabs(x) else os.path.join(progetto, x)
        relativo = os.path.relpath(assoluto, progetto).replace(os.sep, '/')
        mandati.append((x.replace(os.sep, '/') if relativo.startswith('..') else relativo, quando))
    return inizio, mandati


def trascrizione_piu_nuova(progetto):
    cartella = os.path.join(os.path.expanduser('~/.claude/projects'), re.sub(r'[^A-Za-z0-9]', '-', progetto))
    registri = glob.glob(os.path.join(cartella, '*.jsonl'))
    return max(registri, key=os.path.getmtime) if registri else ''


def foto_mie(progetto, inizio):
    """→ (foto e video in archivio/ aggiunti o rifatti dai commit di questa sessione, ancora presenti; le rifatte).
    Rifatta = cambiata sopra lo stesso percorso (stato M): è un'immagine nuova, un invio o una riga di prima non bastano."""
    miei = []
    for riga in git(progetto, 'reflog', '--date=unix', '--format=%H %gd %gs', '-n', '500').splitlines():
        m = RIGA_REFLOG.match(riga)
        if not m:
            continue
        if int(m.group(2)) < inizio:
            break
        if MIO_COMMIT.match(m.group(3)):
            miei.append(m.group(1))
    if not miei:
        return [], set()
    righe = git(progetto, 'show', '--no-renames', '--diff-filter=AM', '--name-status', '--format=', *miei, '--',
                'archivio/')
    foto, rifatte = set(), set()
    for riga in righe.splitlines():
        stato, _, nome = riga.partition('\t')
        if nome.lower().endswith(MEDIA) and os.path.isfile(os.path.join(progetto, nome)):
            foto.add(nome)
            if stato.startswith('M'):
                rifatte.add(nome)
    return sorted(foto), rifatte


def impronte(progetto, foto):
    """→ {foto: impronta del contenuto salvato (blob di HEAD)}: una foto rifatta ha un'impronta nuova."""
    esito = {}
    for riga in git(progetto, 'ls-tree', '-r', 'HEAD', '--', *foto).splitlines():
        dati, _, nome = riga.partition('\t')
        pezzi = dati.split()
        if len(pezzi) >= 3:
            esito[nome] = pezzi[2]
    return esito


def non_per_mario(foto):
    parti = foto.lower().split('/')
    return (any('mario' in p for p in parti) or any(p in DI_LAVORO for p in parti[:-1])
            or parti[-1].startswith('lavoro-'))


def sezione_zero(progetto):
    """→ testo della sezione «## 0. Aspetta Mario», None se il progetto non l'ha."""
    try:
        with open(os.path.join(progetto, 'docs', 'DA-FARE.md'), encoding='utf-8') as f:
            m = SEZIONE_0.search(f.read())
    except OSError:
        return None
    return m.group(1) if m else None


def citata(foto, citati, progetto):
    cartella = os.path.dirname(foto)
    for p in citati:
        intero = os.path.join(progetto, p)
        if os.path.isdir(intero):
            # la cartella di tutto un lavoro (archivio/C476) copre solo i file che ha dentro, non le sottocartelle
            if cartella == p or (p.count('/') >= 2 and foto.startswith(p + '/')):
                return True
        elif os.path.isfile(intero):
            if foto == p:
                return True
        elif foto.startswith(p) or cartella == os.path.dirname(p):
            return True  # nome accorciato («foto-1…3») o file che non c'è più: vale la sua cartella
    return False


def mandata(foto, mandati, progetto, rifatta=False):
    try:
        nata = os.path.getmtime(os.path.join(progetto, foto))
    except OSError:
        return True
    cartella, nome = os.path.dirname(foto), os.path.splitext(os.path.basename(foto))[0]
    for inviato, quando in mandati:
        if inviato == foto and not rifatta:  # rifatta: vale solo l'invio fatto dopo che è rinata (qui sotto)
            return True
        if quando + TOLLERANZA < nata:
            continue
        nome_inviato = os.path.splitext(os.path.basename(inviato))[0]
        if os.path.dirname(inviato) == cartella:
            return True
        if len(nome) >= 4 and (nome_inviato == nome or nome_inviato.startswith(nome + '-')):
            return True
    return False


def memoria(progetto, aggiungi=None):
    """Le foto già viste citate nella sezione 0 (.git/foto-chieste.json)."""
    gitdir = git(progetto, 'rev-parse', '--absolute-git-dir').strip()
    if not gitdir:
        return set()
    file = os.path.join(gitdir, MEMORIA)
    try:
        with open(file, encoding='utf-8') as f:
            viste = set(json.load(f).get('citate') or [])
    except (OSError, ValueError, AttributeError):
        viste = set()
    if aggiungi and not set(aggiungi) <= viste:
        viste |= set(aggiungi)
        try:
            with open(file, 'w', encoding='utf-8') as f:
                json.dump({'citate': sorted(viste)}, f, ensure_ascii=False)
        except OSError:
            pass
    return viste


def aperte(progetto, trascrizione):
    """→ {cartella: numero di foto} di questa sessione, non mandate, non citate e per Mario."""
    sezione = sezione_zero(progetto)
    if sezione is None or not os.path.isdir(os.path.join(progetto, 'archivio')):
        return {}
    inizio, mandati = leggi_trascrizione(trascrizione, progetto)
    if not inizio:
        inizio = time.time() - 24 * 3600  # trascrizione che non si legge: solo i commit dell'ultimo giorno
    foto, rifatte = foto_mie(progetto, inizio)
    foto = [f for f in foto if not non_per_mario(f)]
    if not foto:
        return {}
    citati = {p.rstrip('./') for p in PERCORSO.findall(sezione)}
    blob = impronte(progetto, foto)
    ora_citate = {f for f in foto if citata(f, citati, progetto)}
    # La memoria ricorda foto E contenuto («percorso@impronta»): rifatta sopra lo stesso file dopo la risposta di
    # Mario, torna aperta. Le voci di prima (solo il percorso) valgono per le foto mai rifatte.
    viste = memoria(progetto, [f'{f}@{blob.get(f, "")}' for f in ora_citate])
    fuori = {}
    for f in foto:
        if f in ora_citate or f'{f}@{blob.get(f, "")}' in viste or (f in viste and f not in rifatte):
            continue
        if mandata(f, mandati, progetto, f in rifatte):
            continue
        fuori[os.path.dirname(f)] = fuori.get(os.path.dirname(f), 0) + 1
    return fuori


def elenco(fuori, massimo=4):
    voci = [f'{c}/ ({n} file)' for c, n in sorted(fuori.items())]
    return ', '.join(voci[:massimo]) + (f' e altre {len(voci) - massimo} cartelle' if len(voci) > massimo else '')


def arretrati(progetto, giorni):
    """Stima una tantum: cartelle di foto aggiunte negli ultimi GIORNI e mai citate in una riga di «Aspetta Mario»."""
    registro = git(progetto, 'log', f'--since={giorni} days ago', '--no-merges', '--no-renames', '--diff-filter=A',
                   '--name-only', '--format=@%H|%cd|%s', '--date=format:%d/%m', '--', 'archivio/')
    # Copia corta: nei commit del taglio (.git/shallow, senza genitore) git dà per «aggiunto» tutto l'archivio.
    try:
        with open(os.path.join(progetto, git(progetto, 'rev-parse', '--git-path', 'shallow').strip()),
                  encoding='utf-8') as f:
            tagliati = {r.strip() for r in f if r.strip()}
    except OSError:
        tagliati = set()
    cartelle, commit = {}, ('', '', '')
    for riga in registro.splitlines():
        if riga.startswith('@'):
            commit = (riga[1:].split('|', 2) + ['', ''])[:3]
        elif commit[0] not in tagliati and riga.lower().endswith(MEDIA) and not non_per_mario(riga):
            voce = cartelle.setdefault(os.path.dirname(riga), {'file': [], 'commit': commit})
            if riga not in voce['file']:
                voce['file'].append(riga)
            voce['commit'] = commit
    storia = git(progetto, 'log', f'--since={giorni + 10} days ago', '-p', '--format=', '--', 'docs/DA-FARE.md')
    citati = {p.rstrip('./') for riga in storia.splitlines() if RIGA_ASPETTA.match(riga)
              for p in PERCORSO.findall(riga)}
    citati |= {p.rstrip('./') for p in PERCORSO.findall(sezione_zero(progetto) or '')}
    corta = git(progetto, 'rev-parse', '--is-shallow-repository').strip() == 'true'
    fuori = 0
    for cartella, voce in cartelle.items():
        presenti = [f for f in voce['file'] if os.path.isfile(os.path.join(progetto, f))]
        if not presenti or any(citata(f, citati, progetto) for f in presenti):
            continue
        fuori += 1
        print(f"{voce['commit'][1]} · {cartella}/ · {len(presenti)} file · {voce['commit'][2][:70]}")
    print(f'Arretrati (stima{", storia corta: i commit del taglio non contano" if corta else ""}): {fuori} cartelle '
          f'su {len(cartelle)} degli ultimi '
          f'{giorni} giorni senza una riga in «Aspetta Mario». Da guardare a mano: mandate in chat o no?')
    return 0


def main():
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    argomenti = sys.argv[1:]
    if argomenti and argomenti[0] == '--arretrati':
        return arretrati(progetto, int(argomenti[1]) if len(argomenti) > 1 else 14)
    if argomenti and argomenti[0] == '--aperte':
        trascrizione = (argomenti[argomenti.index('--trascrizione') + 1] if '--trascrizione' in argomenti
                        else trascrizione_piu_nuova(progetto))
        fuori = aperte(progetto, trascrizione)
        for cartella, n in sorted(fuori.items()):
            print(f'{cartella}/ ({n} file)')
        return 1 if fuori else 0
    dati = json.load(sys.stdin)
    if dati.get('stop_hook_active'):
        return 0
    progetto = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or progetto
    fuori = aperte(progetto, dati.get('transcript_path') or '')
    if not fuori:
        return 0
    print('📸 Foto o video di questa sessione in archivio/, non mandati a Mario e senza riga in «## 0. Aspetta Mario» '
          f'(C516, E498): {elenco(fuori)}. Per Mario → mandali ORA con la domanda, oppure scrivi subito la riga col '
          'percorso (anche se dorme o il piano dice «alla fine»). Ricevuti da lui → nome o cartella con «mario»; di '
          'lavoro → sottocartella lavoro/ (git mv). A Mario non riscrivere il messaggio: una riga.', file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        codice = main()
    except Exception:  # noqa: BLE001: un hook rotto non deve mai fermare il lavoro
        codice = 0
    sys.exit(codice)
