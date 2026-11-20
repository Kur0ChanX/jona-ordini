#!/usr/bin/env python3
"""Prove di tools/scegli-giro.py: un caso per strada (python3 -I tools/test-scegli-giro.py)."""
import importlib.util
import pathlib

spec = importlib.util.spec_from_file_location('sg', pathlib.Path(__file__).with_name('scegli-giro.py'))
sg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sg)


def minuti(gh=2764, riserva=184, bs=34, attivo=True, giorni=8):
    return {'github': gh, 'github_totale': 2000, 'riserva': riserva, 'github_per_prove': max(0, 2000 - gh - riserva),
            'blacksmith': bs, 'blacksmith_totale': 3000, 'blacksmith_attivo': attivo, 'giorni': giorni}


def casa_finta(argv, testo='{"attiva": true}'):
    import os
    import tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        f.write(testo)
    try:
        return sg.casa_nel_giro(argv, f.name)
    finally:
        os.unlink(f.name)


def stato_finto(testo):
    import os
    import tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        f.write(testo)
    try:
        return sg.casa_attiva(f.name)
    finally:
        os.unlink(f.name)


def progetto_finto(testo):
    import os
    import tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        f.write(testo)
    try:
        return sg.giro_locale(f.name)
    finally:
        os.unlink(f.name)


def giro_da_comando():
    """Progetto finto con «giro = prove in locale» e gh assente dal PATH: esce 0 e non chiama GitHub."""
    import os
    import subprocess
    import sys
    import tempfile
    with tempfile.TemporaryDirectory() as c:
        os.makedirs(os.path.join(c, '.claude'))
        with open(os.path.join(c, '.claude', 'progetto.json'), 'w', encoding='utf-8') as f:
            f.write('{"giro": "locale"}')
        r = subprocess.run([sys.executable, '-I', str(pathlib.Path(__file__).with_name('scegli-giro.py')), 'versione'],
                           cwd=c, capture_output=True, text=True, timeout=30, env=dict(os.environ, PATH=c))
        return r.returncode, r.stdout.splitlines()[0] if r.stdout else r.stderr[-200:], 'Come: le prove complete' in r.stdout


casi = [
    ('lavoro', minuti(), 'locale'),
    ('rosso', minuti(), 'locale'),
    ('versione', minuti(), 'blacksmith'),                         # oggi: GitHub oltre, Blacksmith quasi vuoto
    ('urgenza', minuti(), 'blacksmith'),
    ('versione', minuti(gh=500, attivo=False), 'github'),         # Blacksmith spento, GitHub con minuti
    ('versione', minuti(gh=500, bs=2990), 'github'),              # Blacksmith finito
    ('versione', minuti(gh=1800, bs=2990), 'locale'),             # GitHub solo con la riserva
    ('versione', minuti(gh=1700, bs=2990), 'locale'),             # C471: 116 liberi < 2 giri da 87
    ('versione', minuti(gh=2764, attivo=False), 'locale'),
    ('lunedi', minuti(), 'blacksmith'),
    ('lunedi', minuti(bs=2500, giorni=20), 'nessuno'),            # i minuti servono alle versioni
    # E162 (Mario #296 «1»): versioni su Blacksmith, GitHub il lunedì.
    ('versione', minuti(gh=0, riserva=700, giorni=30), 'blacksmith'),  # 1/11: anche con GitHub vuoto
    ('versione', minuti(gh=0, riserva=700, giorni=30, attivo=False), 'github'),
    ('urgenza', minuti(gh=0, riserva=700, giorni=30, bs=2990), 'github'),
    ('lunedi', minuti(gh=0, riserva=300, giorni=10), 'github'),      # secondo parere su GitHub
    ('lunedi', minuti(gh=1900, riserva=50, giorni=10), 'blacksmith'),  # GitHub solo con la riserva
]
rossi = 0
for caso, m, atteso in casi:
    posto, _ = sg.scegli(caso, m)
    if posto != atteso:
        rossi += 1
        print(f'ROSSO {caso} {m}: {posto} invece di {atteso}')

# E356: giro fuori su una macchina diversa da quella dell'ultimo giro verde → riga d'allarme (rossa senza la riga).
BS, GH = ['blacksmith-2vcpu-ubuntu-2404'], ['ubuntu-latest']
YML = pathlib.Path(__file__).parents[1].joinpath('.github/workflows/prove.yml')


def finto(percorso):  # il più nuovo è il giro del lunedì (solo «apple»), poi uno «giro-locale», poi un verde vero
    if 'workflows/prove.yml/runs' in percorso:
        return {'workflow_runs': [{'id': 2, 'created_at': '2026-11-08T10:00:00Z'}, {'id': 1, 'created_at': '2026-11-07T10:00:00Z'},
                                  {'id': 3, 'created_at': '2026-11-09T04:00:00Z'}]}
    lavori = {'/3/': [{'name': 'prove', 'conclusion': 'skipped', 'labels': GH},
                      {'name': 'apple', 'conclusion': 'success', 'labels': GH, 'completed_at': '2026-11-09T05:00:00Z'}],
              '/2/': [{'name': 'prove', 'conclusion': 'skipped', 'labels': []}],
              '/1/': [{'name': 'prove', 'conclusion': 'success', 'labels': BS, 'completed_at': '2026-11-07T11:00:00Z'}]}
    return {'jobs': next(v for k, v in lavori.items() if k in percorso)}


verde = ('blacksmith', '2026-11-07')
altri = [
    ('etichette di Blacksmith', sg.posto_di(BS), 'blacksmith'),
    ('etichette di GitHub', sg.posto_di(GH), 'github'),
    ('etichette del PC di casa', sg.posto_di(['self-hosted', 'casa']), 'casa'),
    ('senza etichette', sg.posto_di(None), 'github'),
    ('ultimo verde: salta lunedì e giro-locale', sg.ultimo_verde(finto), verde),
    ('nessun giro verde', sg.ultimo_verde(lambda p: {'workflow_runs': []}), None),
    ('da Blacksmith a GitHub: allarme', 'MACCHINA CAMBIATA' in sg.avviso_macchina('github', verde), True),
    ('allarme coi due nomi', all(n in sg.avviso_macchina('github', verde) for n in ('Blacksmith', 'GitHub', '2026-11-07')), True),
    ('da GitHub al PC di casa: allarme', 'MACCHINA CAMBIATA' in sg.avviso_macchina('casa', ('github', '2026-11-10')), True),
    ('stessa macchina: zitto', sg.avviso_macchina('blacksmith', verde), ''),
    ('giro nel contenitore: zitto', sg.avviso_macchina('locale', verde), ''),
    # C471 C3: il PC di casa (C476) è il primo posto per versioni e urgenze, ma solo se è acceso ai giri.
    ('versione col PC di casa acceso', sg.scegli('versione', minuti(), True)[0], 'casa'),
    ('urgenza col PC di casa acceso', sg.scegli('urgenza', minuti(gh=1800, bs=2990), True)[0], 'casa'),
    ('versione col PC di casa spento: come prima', sg.scegli('versione', minuti(), False)[0], 'blacksmith'),
    ('lavoro e rossa restano qui anche con casa', (sg.scegli('lavoro', minuti(), True)[0], sg.scegli('rosso', minuti(), True)[0]), ('locale', 'locale')),
    ('il lunedì mai sul PC di casa', sg.scegli('lunedi', minuti(), True)[0], 'blacksmith'),
    ('stato di casa: file mancante = spento', sg.casa_attiva('/non/esiste/stato.json'), False),
    ('stato di casa: attiva true = acceso', stato_finto('{"attiva": true}'), True),
    ('stato di casa: «true» scritto come testo, file rotto, lista = spento', (stato_finto('{"attiva": "true"}'), stato_finto('{rotto'), stato_finto('[]')), (False, False, False)),
    # C482: il PC di casa non ha preso il giro → --senza-casa lo salta e si va al posto dopo (Blacksmith, poi GitHub).
    ('casa accesa, senza --senza-casa: entra nel giro', casa_finta(['scegli-giro.py', 'versione']), True),
    ('casa accesa ma scartata con --senza-casa: fuori', casa_finta(['scegli-giro.py', 'versione', '--senza-casa']), False),
    ('casa spenta: fuori anche senza il segno', casa_finta(['scegli-giro.py', 'versione'], '{"attiva": false}'), False),
    ('scartata la casa: Blacksmith, poi GitHub, poi qui',
     (sg.scegli('versione', minuti(), False)[0], sg.scegli('versione', minuti(gh=100, bs=2990), False)[0],
      sg.scegli('versione', minuti(gh=1990, bs=2990), False)[0]), ('blacksmith', 'github', 'locale')),
    ('ultimo verde sconosciuto: zitto', sg.avviso_macchina('github', None), ''),
    # C511 p.11: progetto senza prove su GitHub, «giro = prove in locale» in .claude/progetto.json
    ('giro locale: impostazione letta', progetto_finto('{"giro": "locale"}'), True),
    ('giro locale: file mancante, rotto, altro valore, lista = no',
     (sg.giro_locale('/non/esiste/progetto.json'), progetto_finto('{rotto'), progetto_finto('{"giro": "fuori"}'), progetto_finto('[]')),
     (False, False, False, False)),
    ('giro locale: versione, urgenza, lavoro, rosso qui; lunedì niente',
     tuple(sg.scegli_locale(c)[0] for c in ('versione', 'urgenza', 'lavoro', 'rosso', 'lunedi')),
     ('locale', 'locale', 'locale', 'locale', 'nessuno')),
    ('giro locale: da riga di comando, senza chiedere i minuti a GitHub', giro_da_comando(), (0, 'DOVE: locale', True)),
    ('ultimo verde letto da un file (lista)', sg.avviso_macchina('github', list(verde)) != '', True),
    # ultimo_verde cerca il lavoro che si chiama «prove»: se in prove.yml cambia nome, cambia anche là.
    # (in un progetto senza prove.yml, es. appena installato dal pacchetto del kit, il controllo non c'è: E349)
    ('prove.yml ha ancora il lavoro «prove»', not YML.exists() or '\n  prove:\n' in YML.read_text(encoding='utf-8'), True),
]
for nome, avuto, atteso in altri:
    if avuto != atteso:
        rossi += 1
        print(f'ROSSO {nome}: {avuto!r} invece di {atteso!r}')
casi = casi + altri

# E516 (Mario 20/11): il conto dei minuti divide i lavori per macchina. `.claude/conta-minuti.py` lavora appena si
# apre (chiama GitHub): qui si prova solo la sua funzione pura, presa dal testo. (GitHub, Blacksmith, PC di casa).
import re
sorgente = (pathlib.Path(__file__).parent.parent / '.claude' / 'conta-minuti.py').read_text(encoding='utf-8')
spazio = {'re': re}
exec(re.search(r'^def minuti_del_lavoro\(.*?(?=^def )', sorgente, re.S | re.M).group(0), spazio)
conto = [
    ('PC di casa: non conta per GitHub', spazio['minuti_del_lavoro'](7, ['self-hosted', 'casa']), (0, 0, 7)),
    ('GitHub Linux', spazio['minuti_del_lavoro'](7, ['ubuntu-latest']), (7, 0, 0)),
    ('GitHub Windows conta doppio', spazio['minuti_del_lavoro'](5, ['windows-2025']), (10, 0, 0)),
    ('GitHub macOS conta 10', spazio['minuti_del_lavoro'](3, ['macos-latest']), (30, 0, 0)),
    ('Blacksmith 4 vCPU', spazio['minuti_del_lavoro'](10, ['blacksmith-4vcpu-ubuntu-2404']), (0, 20, 0)),
    ('Blacksmith Windows conta doppio', spazio['minuti_del_lavoro'](10, ['blacksmith-2vcpu-windows-2025']), (0, 20, 0)),
    ('senza etichette = GitHub', spazio['minuti_del_lavoro'](4, None), (4, 0, 0)),
]
for nome, avuto, atteso in conto:
    if avuto != atteso:
        rossi += 1
        print(f'ROSSO {nome}: {avuto!r} invece di {atteso!r}')
casi = casi + conto
print(f'Scegli-giro: {len(casi) - rossi}/{len(casi)} casi giusti')
raise SystemExit(1 if rossi else 0)
