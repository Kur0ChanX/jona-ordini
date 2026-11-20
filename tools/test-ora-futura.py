#!/usr/bin/env python3
"""Prova di .claude/hooks/ora-futura.py (kit 38.30, E399): progetti finti in cartelle temporanee, ora italiana finta
(15:00 del 15/06/2026) così l'esito non dipende dall'ora in cui gira. Uso: python3 -I tools/test-ora-futura.py"""
import datetime, importlib.util, json, os, subprocess, sys, tempfile

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.claude', 'hooks', 'ora-futura.py')
ADESSO = '2026-06-15T15:00'
errori = 0


def controlla(cond, nome):
    global errori
    print(('ok   ' if cond else 'ERR  ') + nome)
    errori += 0 if cond else 1


def git(d, *a, **env):
    subprocess.run(['git', '-c', 'user.name=prova', '-c', 'user.email=prova@prova.invalid', '-c', 'commit.gpgsign=false',
                    *a], cwd=d, check=True, capture_output=True, env={**os.environ, **env})


def progetto():
    d = tempfile.mkdtemp()
    git(d, 'init', '-q')
    scrivi(d, {'LEGGIMI.md': 'inizio\n'})
    git(d, 'add', '-A')
    git(d, 'commit', '-q', '-m', 'inizio')
    return d


def scrivi(d, file):
    for nome, testo in file.items():
        os.makedirs(os.path.dirname(os.path.join(d, nome)) or d, exist_ok=True)
        open(os.path.join(d, nome), 'w', encoding='utf-8').write(testo)


def commit(d, file, quando=None):
    scrivi(d, file)
    git(d, 'add', '-A')
    git(d, 'commit', '-q', '-m', 'prova', **({'GIT_COMMITTER_DATE': quando} if quando else {}))


def esito(d, cmd='git add -A && git commit -m "x"', ingresso=None):
    testo = ingresso if ingresso is not None else json.dumps({'tool_input': {'command': cmd}, 'cwd': d})
    r = subprocess.run([sys.executable, '-I', HOOK], input=testo, capture_output=True, text=True,
                       env={**os.environ, 'CLAUDE_PROJECT_DIR': d, 'ORA_FUTURA_ADESSO': ADESSO})
    return r.returncode, r.stdout


def uno(file, **k):
    d = progetto()
    commit(d, file, **k)
    return esito(d)


rc, out = uno({'docs/piano.md': '- Stato: giro partito alle 15:20, tutto verde.\n'})
controlla(rc == 0 and 'additionalContext' in out and '«15:20»' in out and 'docs/piano.md' in out and '+20 min' in out
          and '15:00' in out, 'ora senza data 20 minuti avanti: avviso con ora, file e ora vera')
rc, out = uno({'archivio/C1/nota.txt': 'Chiusa il 15/06/2026 alle 20:30.\n'})
controlla('«20:30»' in out, 'ora con la data di oggi, 5 ore e mezza avanti: avviso')
rc, out = uno({'docs/piano.md': 'Fatto alle 14:50, visto alle 15:04, push delle 9:05.\n'})
controlla(rc == 0 and out == '', 'ore passate o entro 5 minuti: silenzio')
rc, out = uno({'docs/piano.md': 'Controllo alle 20:30 o alle 03:00.\n'})
controlla(out == '', 'ora senza data oltre 2 ore avanti (programma o ieri): silenzio')
rc, out = uno({'docs/piano.md': 'Sveglia 16/06 15:20; non prima del 20/06/2026 alle 15:30.\n'})
controlla(out == '', 'data diversa da oggi: silenzio')
rc, out = uno({'docs/piano.md': 'Finisco entro le 15:30; video acceso fino alle 15:40; fine 15:45 (stima); ⏰ 15:50; verso le 15:25.\n'})
controlla(out == '', 'parole di futuro o di stima vicino all\'ora: silenzio')
rc, out = uno({'docs/piano.md': '> Mario: «alle 15:30 guardo»\n- > citazione 15:40\n'})
controlla(out == '', 'citazioni: silenzio')
rc, out = uno({'docs/piano.md': 'Registro: 2026-06-15T15:41:09Z, kit 38.30, 3124 su 3124, rapporto 16:9x.\n'})
controlla(out == '', 'ora dei registri (UTC), versioni e numeri: silenzio')
rc, out = uno({'app/note.md': 'alle 15:20\n', 'docs/dati.json': '"alle 15:20"\n', 'archivio/messaggi-mario/2026-06.md': 'alle 15:20\n',
               'docs/ULTIMO-MESSAGGIO.md': 'alle 15:20\n', 'docs/kit-progetto/pacchetto/P-1di2.md': 'alle 15:20\n'})
controlla(out == '', 'fuori da docs/ e archivio/, altri tipi di file, registri dei messaggi di Mario, copie del kit: silenzio')
rc, out = uno({'docs/a.md': '15:11 15:12 15:13 15:14 15:15\n'})
controlla(out.count('(+') == 3 and 'altre 2' in out, 'più di 3 ore sospette: 3 elencate e il conto delle altre')

d = progetto()
commit(d, {'docs/a.md': 'riga vecchia\n- giro partito alle 15:20 e finito\n'})
controlla('«15:20»' in esito(d)[1], 'riga nuova con l\'ora avanti: avviso (base del caso «spostata»)')
commit(d, {'docs/a.md': 'riga vecchia\n', 'docs/b.md': '- giro partito alle 15:20 e finito\n'})
controlla(esito(d)[1] == '', 'stessa riga spostata in un altro file: silenzio')
commit(d, {'docs/b.md': '- giro partito alle 15:20 e finito bene, visto alle 15:30\n'})
rc, out = esito(d)
controlla('«15:30»' in out and '«15:20»' not in out, 'riga ritoccata: avviso solo per l\'ora nuova')

d = progetto()
commit(d, {'docs/a.md': 'alle 15:20\n'})
controlla(esito(d, 'git status && echo "git commit"')[1] == '', 'comando che non è un commit: silenzio')
controlla('«15:20»' in esito(d, 'cd x; git commit -m "y" && git push')[1], 'commit dentro un comando composto: avviso')
vecchio = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=10)).strftime('%Y-%m-%dT%H:%M:%S+00:00')
rc, out = uno({'docs/a.md': 'alle 15:20\n'}, quando=vecchio)
controlla(out == '', 'ultimo commit di 10 minuti fa (commit fallito o vuoto): silenzio')
d = progetto()
git(d, 'checkout', '-q', '-b', 'altra')
commit(d, {'docs/a.md': 'alle 15:20\n'})
git(d, 'checkout', '-q', '-')
commit(d, {'docs/c.md': 'niente\n'})
git(d, 'merge', '-q', '--no-ff', '-m', 'unione', 'altra')
controlla(esito(d)[1] == '', 'ultimo commit = unione (lavoro di un\'altra chat): silenzio')
rc, out = esito(tempfile.mkdtemp())
controlla(rc == 0 and out == '', 'cartella senza git: silenzio, uscita 0')
rc, out = esito('.', ingresso='non è json')
controlla(rc == 0 and out == '', 'ingresso rotto: silenzio, uscita 0')

spec = importlib.util.spec_from_file_location('ora_futura', HOOK)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
notte = datetime.datetime(2026, 11, 11, 23, 50)
controlla([x[1:] for x in mod.sospette([('f', 'visto alle 00:05')], set(), notte)] == [('00:05', 15)],
          'a cavallo di mezzanotte: alle 23:50 «00:05» è 15 minuti avanti')
controlla(mod.sospette([('f', 'visto alle 23:50 e alle 23:13')], set(), datetime.datetime(2026, 11, 12, 0, 10)) == [],
          'a cavallo di mezzanotte: alle 00:10 «23:50» è di ieri')
controlla([x[1] for x in mod.sospette([('f', 'Stato (Giri 37, 11/11 23:30 ora italiana)')], set(),
                                     datetime.datetime(2026, 11, 11, 23, 13))] == ['23:30'],
          'il caso vero di E399: scritto 23:30 alle 23:13')
controlla(mod.adesso_italiano().year >= 2026 and os.environ.get('ORA_FUTURA_ADESSO') is None,
          'senza l\'ora finta: ora italiana dal sistema')

print('VERDE: ora-futura' if not errori else f'ROSSO: {errori} errori')
sys.exit(1 if errori else 0)
