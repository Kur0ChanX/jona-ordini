#!/usr/bin/env python3
"""Prove di tools/giri-fermi.py (C476 P13b), con risposte finte: python3 -I tools/test-giri-fermi.py"""
import datetime as dt
import importlib.util
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import time

QUI = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location('gf', QUI / 'giri-fermi.py')
gf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gf)

ADESSO = dt.datetime(2026, 11, 11, 21, 0, 0, tzinfo=dt.timezone.utc)
RAMO = 'claude/ramo-di-lavoro'
errori = []


def prova(nome, vero, cosa=''):
    if not vero:
        errori.append(f'{nome} {cosa}'.strip())


def fa(secondi):
    return ADESSO - dt.timedelta(seconds=secondi)


def giro(numero, stato, secondi_fa, evento='push', flusso='prove-vivo.yml', commit='a' * 40, esito=None):
    return {'id': numero, 'run_number': numero, 'name': 'Dal vivo', 'path': f'.github/workflows/{flusso}',
            'status': stato, 'conclusion': esito, 'event': evento, 'head_sha': commit, 'head_branch': RAMO,
            'created_at': fa(secondi_fa).strftime('%Y-%m-%dT%H:%M:%SZ')}


def lavoro(stato, secondi_fa=60, etichette=('ubuntu-latest',), nome='vivo'):
    return {'name': nome, 'status': stato, 'labels': list(etichette),
            'created_at': fa(secondi_fa).strftime('%Y-%m-%dT%H:%M:%SZ')}


CASA = ('self-hosted', 'casa')


def stati(giri, attesi=None, lavori=None, tutti=False):
    """Gli stati che dà giudica; `lavori` = {numero del giro: i suoi lavori} (di base nessuno)."""
    if attesi is None:  # il push che ha fatto nascere il giro più vecchio
        prima = min([gf.ora_di(g['created_at']) for g in giri], default=ADESSO)
        attesi = {'prove-vivo.yml': ('a' * 40, prima - dt.timedelta(seconds=2))}
    return [v['stato'] for v in gf.giudica(giri, lambda n: (lavori or {}).get(n, []), attesi, ADESSO, tutti)]


# 1 · gli inneschi letti a righe
BLOCCO = """name: X  # on: finto
on:
  push:
    branches: [claude/ramo-di-lavoro, main]
    paths:
      - 'tools/vivo/accendi.txt'   # il file d'innesco
      - "app/**"
  workflow_dispatch:
    inputs:
      dove:
        default: auto
jobs:
  a:
    steps:
      - run: echo
"""
i = gf.inneschi_di(BLOCCO)
prova('inneschi a blocco', i == {'push': True, 'rami': [RAMO, 'main'], 'percorsi': ['tools/vivo/accendi.txt', 'app/**'],
                                'mano': True, 'ingressi': ['dove']}, str(i))
i = gf.inneschi_di("on:\n  push:\n    branches: [main]\n  schedule:\n    - cron: '0 3 * * *'\njobs: {}\n")
prova('push senza paths né lancio a mano', i == {'push': True, 'rami': ['main'], 'percorsi': None, 'mano': False, 'ingressi': []}, str(i))
i = gf.inneschi_di('on: [push, workflow_dispatch]\njobs: {}\n')
prova('on in una riga', i['push'] and i['mano'] and i['percorsi'] is None, str(i))
i = gf.inneschi_di('on:\n  workflow_dispatch:\njobs:\n  a:\n    steps:\n      - run: git push\n')
prova('solo a mano', i == {'push': False, 'rami': None, 'percorsi': None, 'mano': True, 'ingressi': []}, str(i))

# 2 · i flussi veri: la lettura a righe = PyYAML (se c'è); chiave nuova sotto push = questo strumento va aggiornato
try:
    import yaml
except ImportError:
    yaml = None
    print('PyYAML assente: confronto coi flussi veri saltato')
veri = gf.inneschi(QUI.parent / '.github' / 'workflows')
prova('flussi veri letti', all(set(v) == {'push', 'rami', 'percorsi', 'mano', 'ingressi'} for v in veri.values()), str(len(veri)))
if yaml:
    for file in sorted((QUI.parent / '.github' / 'workflows').glob('*.y*ml')):
        dati = yaml.safe_load(file.read_text(encoding='utf-8'))
        on = dati.get(True, dati.get('on'))
        on = {on: None} if isinstance(on, str) else {k: None for k in on} if isinstance(on, list) else on
        spinta = on.get('push') or {}
        prova(f'{file.name}: chiavi di push note', set(spinta) <= {'branches', 'paths'}, str(set(spinta)))
        atteso = {'push': 'push' in on, 'rami': spinta.get('branches'), 'percorsi': spinta.get('paths'),
                  'mano': 'workflow_dispatch' in on,
                  'ingressi': list(((on.get('workflow_dispatch') or {}).get('inputs') or {}))}
        prova(f'{file.name}: a righe = PyYAML', veri[file.name] == atteso, f'{veri[file.name]} ≠ {atteso}')

# 3 · i modelli dei filtri
for modello, percorso, atteso in [
        ('app/**', 'app/src/logica/x.js', True), ('app/**', 'tools/app/x.js', False),
        ('tools/giro-breve.txt', 'tools/giro-breve.txt', True), ('tools/*.txt', 'tools/vivo/accendi.txt', False),
        ('**/README.md', 'README.md', True), ('**/README.md', 'docs/a/README.md', True), ('**.js', 'a/b.js', True),
        ('main', 'main', True), ('main', 'mainx', False)]:
    prova(f'modello {modello} su {percorso}', gf.combacia(modello, percorso) is atteso)
prova('tocca: un file basta', gf.tocca(['app/**'], ['docs/a.md', 'app/x.js']))
prova('tocca: nessuno', not gf.tocca(['app/**'], ['docs/a.md']))
prova('tocca: «!» toglie', not gf.tocca(['app/**', '!app/note/**'], ['app/note/a.md']))
prova('tocca: senza filtro ogni push', gf.tocca(None, ['docs/a.md']) and not gf.tocca(None, []))

# 4 · i push dal registro di git (fetch, push vecchi e ramo appena nato non contano)
registro = '\n'.join([
    f"{'1' * 40} {'2' * 40} Claude <c@x> {int(fa(7200).timestamp())} +0000\tupdate by push",
    f"{'2' * 40} {'3' * 40} Claude <c@x> {int(fa(900).timestamp())} +0000\tfetch origin: fast-forward",
    f"{'3' * 40} {'4' * 40} Nome Con Spazi <c@x> {int(fa(600).timestamp())} +0000\tupdate by push",
    f"{'0' * 40} {'5' * 40} Claude <c@x> {int(fa(60).timestamp())} +0000\tupdate by push"])
push = gf.spinte(RAMO, ADESSO, registro)
prova('push dell\'ultima ora', push == [('3' * 40, '4' * 40, fa(600))], str(push))

# 5 · quali flussi doveva far partire un push
finti = {'prove-vivo.yml': {'push': True, 'rami': [RAMO], 'percorsi': ['tools/vivo/accendi.txt'], 'mano': True,
                            'ingressi': ['dove']},
         'pubblica.yml': {'push': True, 'rami': ['main'], 'percorsi': ['app/**'], 'mano': True, 'ingressi': []},
         'a-mano.yml': {'push': False, 'rami': None, 'percorsi': None, 'mano': True, 'ingressi': []}}
att = gf.attesi_da([('a', 'b', fa(600)), ('b', 'c', fa(300))], finti, RAMO,
                   lambda prima, dopo: ['tools/vivo/accendi.txt', 'app/x.js'] if dopo == 'b' else ['docs/a.md'])
prova('attesi: solo il flusso del ramo e del file', att == {'prove-vivo.yml': ('b', fa(600))}, str(att))
att = gf.attesi_da([('a', 'b', fa(600)), ('b', 'c', fa(300))], finti, RAMO, lambda p, d: ['tools/vivo/accendi.txt'])
prova('attesi: vale l\'ultimo push', att == {'prove-vivo.yml': ('c', fa(300))}, str(att))
# 5b · E404: un push con «[skip ci]» nell'ultimo commit non fa nascere giri su GitHub, quindi non si aspetta niente
tocca_vivo = lambda p, d: ['tools/vivo/accendi.txt']
for segno in gf.SALTA:
    att = gf.attesi_da([('a', 'b', fa(600))], finti, RAMO, tocca_vivo, lambda c, s=segno: f'prova dal vero {s}\n')
    prova(f'attesi: push con {segno} = nessun giro atteso', att == {}, str(att))
att = gf.attesi_da([('a', 'b', fa(600)), ('b', 'c', fa(300))], finti, RAMO, tocca_vivo,
                   lambda c: 'riga di prova [skip ci]' if c == 'c' else 'accendi il video')
prova('attesi: saltato solo l\'ultimo push, resta atteso quello di prima', att == {'prove-vivo.yml': ('b', fa(600))}, str(att))
att = gf.attesi_da([('a', 'b', fa(600))], finti, RAMO, tocca_vivo, lambda c: 'ho tolto skip ci dal testo [Skip CI]')
prova('attesi: parole simili al segno non saltano niente', att == {'prove-vivo.yml': ('b', fa(600))}, str(att))
prova('messaggio di un commit che git non conosce: vuoto, il giro resta atteso',
      gf.messaggio_di('f' * 40) == '' and not gf.saltato(''))
for nome, i in veri.items():  # coi flussi veri: il primo file d'innesco di ognuno lo fa attendere
    if i['push'] and i['rami'] and i['percorsi'] and '*' not in i['rami'][0] + i['percorsi'][0]:
        att = gf.attesi_da([('a', 'b', fa(60))], veri, i['rami'][0], lambda p, d, f=i['percorsi'][0]: [f, 'docs/nota.md'])
        prova(f'attesi coi flussi veri: {nome}', nome in att, str(att))

# 6 · il giudizio
prova('zombie di due ore: ignorato', stati([giro(1, 'queued', 7200)], attesi={}, tutti=True) == [])
prova('in coda da 2 minuti: attesa', stati([giro(1, 'queued', 120)]) == ['ATTESA'])
prova('in coda da 5 minuti giusti: attesa', stati([giro(1, 'queued', 300)]) == ['ATTESA'])
prova('in coda da 12 minuti senza lavori: fermo', stati([giro(1, 'queued', 720)]) == ['FERMO'])
prova('in coda da 12 minuti ma coi lavori: non fermo', stati([giro(1, 'queued', 720)], lavori={1: [lavoro('queued', 700)]}) == [])
prova('al lavoro: niente', stati([giro(1, 'in_progress', 720)]) == [])
prova('finito: niente', stati([giro(1, 'completed', 720, esito='success')]) == [])
prova('fermo, poi rilanciato e partito: niente',
      stati([giro(1, 'queued', 720), giro(2, 'in_progress', 60, evento='workflow_dispatch')]) == [])
prova('fermo, rilanciato da 1 minuto: attesa',
      stati([giro(1, 'queued', 720), giro(2, 'queued', 60, evento='workflow_dispatch')]) == ['ATTESA'])
prova('fermo anche il lancio a mano: non si rilancia ancora',
      stati([giro(1, 'queued', 1500), giro(2, 'queued', 720, evento='workflow_dispatch')]) == ['FERMO A MANO'])
atteso = {'prove-vivo.yml': ('b' * 40, fa(480))}
prova('push di 8 minuti fa e nessun giro: non nato', stati([], attesi=atteso) == ['NON NATO'])
prova('solo un giro di prima del push: non nato', stati([giro(1, 'completed', 2000, esito='success')], attesi=atteso) == ['NON NATO'])
prova('push di 1 minuto fa e nessun giro: attesa', stati([], attesi={'prove-vivo.yml': ('b' * 40, fa(60))}) == ['ATTESA'])
prova('push di 2 ore fa mai nato: ignorato', stati([], attesi={'prove-vivo.yml': ('b' * 40, fa(7200))}) == [])
prova('giro del commit del push, nato prima per l\'orologio: nato',
      stati([giro(1, 'completed', 500, commit='b' * 40, esito='success')], attesi=atteso) == [])
prova('non nato, poi lanciato a mano e partito: niente',
      stati([giro(2, 'in_progress', 30, evento='workflow_dispatch', commit='c' * 40)], attesi=atteso) == [])
altro = [giro(1, 'queued', 720, flusso='prove.yml', evento='pull_request')]
prova('flusso di un\'altra chat: di base zitto', stati(altro, attesi={}) == [])
prova('flusso di un\'altra chat con --tutti: fermo', stati(altro, attesi={}, tutti=True) == ['FERMO'])

al_lavoro = [giro(1, 'in_progress', 400)]
pronto = lavoro('completed', 390, nome='prepara')
prova('il PC di casa non prende il lavoro da 4 minuti: macchina',
      stati(al_lavoro, lavori={1: [pronto, lavoro('queued', 240, CASA)]}) == ['MACCHINA'])
prova('il lavoro aspetta il PC di casa da 1 minuto: attesa',
      stati(al_lavoro, lavori={1: [pronto, lavoro('queued', 60, CASA)]}) == ['ATTESA'])
prova('il PC di casa ha preso il lavoro: niente', stati(al_lavoro, lavori={1: [pronto, lavoro('in_progress', 240, CASA)]}) == [])
prova('lavoro in coda sui server di GitHub: non è di questo strumento',
      stati(al_lavoro, lavori={1: [pronto, lavoro('queued', 240)]}) == [])

# 7 · il testo per Claude
macchina = gf.giudica(al_lavoro, lambda n: [pronto, lavoro('queued', 240, CASA)], {'prove-vivo.yml': ('a' * 40, fa(402))}, ADESSO)
testo = '\n'.join(gf.righe(macchina, finti, RAMO, None))
prova('macchina: al server con dove=github, senza parlare di guasti', 'inputs dove=github' in testo and 'da 4 min' in testo
      and 'Il tuo PC di casa non ha preso' in testo and 'guasti' not in testo and gf.esito_di(macchina) == 20, testo)
senza_dove = dict(finti, **{'prove-vivo.yml': dict(finti['prove-vivo.yml'], ingressi=[])})
prova('macchina senza scelta del posto: ripiega', 'Ripiega sul posto dopo' in '\n'.join(gf.righe(macchina, senza_dove, RAMO, None)))
fermo = gf.giudica([giro(29, 'queued', 720)], lambda n: [], {'prove-vivo.yml': ('a' * 40, fa(722))}, ADESSO)
testo = '\n'.join(gf.righe(fermo, finti, RAMO, []))
prova('fermo: stato e rilancio esatto', 'STATO: FERMO' in testo and 'actions_run_trigger · method run_workflow · '
      f'workflow_id prove-vivo.yml · ref {RAMO}' in testo and '#29' in testo and 'da 12 min' in testo, testo)
prova('fermo: nessun guasto scritto = niente causa', 'niente causa senza controprova' in testo, testo)
testo = '\n'.join(gf.righe(fermo, finti, RAMO, ['«Incident with Actions» dalle 20:48 UTC']))
prova('fermo: guasto aperto', 'Incident with Actions' in testo and 'causa probabile' in testo, testo)
prova('fermo: pagina non letta', 'NON letta' in '\n'.join(gf.righe(fermo, finti, RAMO, None)))
senza = dict(finti, **{'prove-vivo.yml': dict(finti['prove-vivo.yml'], mano=False)})
prova('fermo senza lancio a mano', 'manca `workflow_dispatch`' in '\n'.join(gf.righe(fermo, senza, RAMO, [])))
prova('esito fermo = 20', gf.esito_di(fermo) == 20)
attesa = gf.giudica([], lambda n: [], {'prove-vivo.yml': ('b' * 40, fa(60))}, ADESSO)
testo = '\n'.join(gf.righe(attesa, finti, RAMO))
prova('attesa: stato, esito 10, niente rilancio', 'STATO: ATTESA' in testo and gf.esito_di(attesa) == 10
      and 'actions_run_trigger' not in testo and 'Riguarda fra 5 min' in testo, testo)
a_mano = gf.giudica([giro(1, 'queued', 1500), giro(2, 'queued', 720, evento='workflow_dispatch')], lambda n: [],
                    {'prove-vivo.yml': ('a' * 40, fa(1502))}, ADESSO)
testo = '\n'.join(gf.righe(a_mano, finti, RAMO, []))
prova('fermo a mano: non rilanciare', 'NON rilanciare' in testo and 'actions_run_trigger' not in testo, testo)
prova('tutto bene', gf.righe([], finti, RAMO)[0].startswith('STATO: TUTTO BENE') and gf.esito_di([]) == 0)

# 9 · l'hook dello Stop (C476 P13c), in un progetto finto con `gh` e `curl` finti e l'ora vera
HOOK = QUI.parent / '.claude' / 'hooks' / 'giri-fermi.py'


def giro_vero(numero, stato, secondi_fa, commit, evento='push'):
    creato = dt.datetime.now(dt.timezone.utc) - dt.timedelta(seconds=secondi_fa)
    return dict(giro(numero, stato, 0, evento, 'vivo.yml', commit), created_at=creato.strftime('%Y-%m-%dT%H:%M:%SZ'))


def progetto_finto(cartella, secondi_dal_push, giri=lambda commit: [], gh_rotto=False, lavori=()):
    """Repo con il flusso «vivo.yml» (innesco: accendi.txt), un push nel registro di git e `gh` che risponde `giri`."""
    p = pathlib.Path(cartella)

    def git(*pezzi):
        return subprocess.run(['git', '-c', 'user.name=x', '-c', 'user.email=x@x', '-c', 'commit.gpgsign=false', *pezzi],
                              cwd=p, check=True, capture_output=True, text=True).stdout.strip()
    git('init', '-q', '-b', RAMO)
    for nome in ('.github/workflows', 'tools', '.claude', 'finti'):
        (p / nome).mkdir(parents=True)
    (p / '.github/workflows/vivo.yml').write_text(
        f'on:\n  push:\n    branches: [{RAMO}]\n    paths: [accendi.txt]\n  workflow_dispatch:\njobs: {{}}\n')
    shutil.copy(QUI / 'giri-fermi.py', p / 'tools' / 'giri-fermi.py')
    (p / '.claude/ramo-di-lavoro.txt').write_text(RAMO + '\n')
    (p / '.gitignore').write_text('finti/\n')
    git('remote', 'add', 'origin', 'https://github.com/finto/progetto.git')
    git('add', '-A')
    git('commit', '-q', '-m', 'a')
    prima = git('rev-parse', 'HEAD')
    (p / 'accendi.txt').write_text('x')
    git('add', '-A')
    git('commit', '-q', '-m', 'b')
    dopo = git('rev-parse', 'HEAD')
    if secondi_dal_push is not None:
        registro = p / '.git/logs/refs/remotes/origin' / RAMO
        registro.parent.mkdir(parents=True, exist_ok=True)
        registro.write_text(f'{prima} {dopo} x <x@x> {int(time.time()) - secondi_dal_push} +0000\tupdate by push\n')
    finti = p / 'finti'
    (finti / 'giri.json').write_text(json.dumps({'workflow_runs': giri(dopo)}))
    (finti / 'lavori.json').write_text(json.dumps({'total_count': len(lavori), 'jobs': list(lavori)}))
    risposta = 'echo 503 >&2\nexit 1\n' if gh_rotto else (
f'case "$2" in\n  */jobs*) cat "{finti}/lavori.json" ;;\n'
        f'  *) cat "{finti}/giri.json" ;;\nesac\n')
    (finti / 'gh').write_text(f'#!/bin/sh\necho "$2" >> "{finti}/chiamate.txt"\n{risposta}')
    (finti / 'curl').write_text('#!/bin/sh\necho \'{"incidents": []}\'\n')
    (finti / 'gh').chmod(0o755)
    (finti / 'curl').chmod(0o755)
    return p, finti


def hook(p, finti, attivo=False):
    u = subprocess.run([sys.executable, '-I', str(HOOK)], input=json.dumps({'stop_hook_active': attivo, 'cwd': str(p)}),
                       capture_output=True, text=True, timeout=60, cwd=p,
                       env=dict(os.environ, CLAUDE_PROJECT_DIR=str(p), GIRI_FERMI_ATTESA='0',
                                PATH=f"{finti}:{os.environ.get('PATH', '')}"))
    return u.returncode, u.stderr, (finti / 'chiamate.txt').exists()


with tempfile.TemporaryDirectory() as c:
    esito, testo, chiamato = hook(*progetto_finto(c, None))
    prova('hook: nessun push = zitto e zero chiamate a GitHub', (esito, testo, chiamato) == (0, '', False), f'{esito} {testo}')
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720, lambda commit: [giro_vero(29, 'queued', 715, commit)])
    esito, testo, _ = hook(p, finti)
    prova('hook: giro fermo = blocca col rilancio esatto', esito == 2 and 'STATO: FERMO' in testo and '#29' in testo
          and f'workflow_id vivo.yml · ref {RAMO}' in testo and 'niente causa senza controprova' in testo, f'{esito} {testo}')
    prova('hook: lo stesso giro fermo non lo ridice', hook(p, finti)[:2] == (0, ''))
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720, lambda commit: [giro_vero(29, 'queued', 715, commit)])
    prova('hook: secondo giro dello Stop = zitto senza leggere', hook(p, finti, attivo=True) == (0, '', False))
with tempfile.TemporaryDirectory() as c:
    esito, testo, chiamato = hook(*progetto_finto(c, 720, lambda commit: [giro_vero(29, 'in_progress', 715, commit)]))
    prova('hook: giro partito = zitto, dopo aver letto', (esito, testo, chiamato) == (0, '', True), f'{esito} {testo}')
with tempfile.TemporaryDirectory() as c:
    esito, testo, _ = hook(*progetto_finto(c, 720))
    prova('hook: giro mai nato', esito == 2 and '- NON NATO · vivo.yml' in testo and 'actions_run_trigger' in testo, f'{esito} {testo}')
with tempfile.TemporaryDirectory() as c:
    esito, testo, _ = hook(*progetto_finto(c, 30))
    prova('hook: giro appena chiesto e non partito = sveglia', esito == 2 and 'STATO: ATTESA' in testo
          and 'send_later' in testo and 'actions_run_trigger' not in testo, f'{esito} {testo}')
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720, gh_rotto=True)
    esito, testo, _ = hook(p, finti)
    prova('hook: GitHub muto = lo dice', esito == 2 and 'non ho potuto leggere i giri' in testo and 'vivo.yml' in testo, f'{esito} {testo}')
    prova('hook: GitHub muto, una volta sola', hook(p, finti)[:2] == (0, ''))
with tempfile.TemporaryDirectory() as c:
    quando = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(seconds=250)).strftime('%Y-%m-%dT%H:%M:%SZ')
    esito, testo, _ = hook(*progetto_finto(c, 300, lambda commit: [giro_vero(30, 'in_progress', 295, commit)],
                                           lavori=[dict(lavoro('queued', 0, CASA), created_at=quando)]))
    prova('hook: il PC di casa non prende il lavoro', esito == 2 and '- MACCHINA · vivo.yml' in testo
          and 'Ripiega sul posto dopo' in testo and 'guasti' not in testo, f'{esito} {testo}')
# 8 · gh muto: lo strumento lo dice ed esce 1 (mai «tutto bene» senza aver letto)
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720, gh_rotto=True)
    u = subprocess.run([sys.executable, '-I', 'tools/giri-fermi.py', '--senza-guasti'], capture_output=True, text=True,
                       timeout=60, cwd=p, env=dict(os.environ, PATH=f"{finti}:{os.environ.get('PATH', '')}"))
    prova('gh muto: «non so», esito 1', u.returncode == 1 and u.stdout.startswith('STATO: NON SO')
          and 'gh non risponde' in u.stdout, f'{u.returncode} {u.stdout[:200]} {u.stderr[:200]}')
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720, lambda commit: [giro_vero(29, 'queued', 715, commit)])
    u = subprocess.run([sys.executable, '-I', 'tools/giri-fermi.py'], capture_output=True, text=True,
                       timeout=60, cwd=p, env=dict(os.environ, PATH=f"{finti}:{os.environ.get('PATH', '')}"))
    prova('strumento a mano: fermo, esito 20', u.returncode == 20 and 'STATO: FERMO' in u.stdout
          and 'nessun guasto scritto' in u.stdout, f'{u.returncode} {u.stdout[:300]} {u.stderr[:200]}')
with tempfile.TemporaryDirectory() as c:
    p, finti = progetto_finto(c, 720)
    (p / 'tools' / 'giri-fermi.py').unlink()
    prova('hook: progetto senza lo strumento = zitto', hook(p, finti) == (0, '', False))

# 9 · I22 (14/11): «il PC di casa non lo prenderà» si dice solo dopo aver chiesto al server dei giri com'è il PC, con le
# regole VERE di tools/giro-partito.py (qui letture finte al posto del server e di GitHub).
def col_pc(risposta_pc, occupanti, secondi=240):
    """Le voci di un lavoro in coda da `secondi` sul PC di casa, dopo la domanda al PC (finto)."""
    with tempfile.TemporaryDirectory() as c:
        finto = pathlib.Path(c) / 'giro-partito.py'
        finto.write_text(
            f"exec(open({str(QUI / 'giro-partito.py')!r}, encoding='utf-8').read())\n"
            f"stato_del_pc = lambda: {risposta_pc!r}\noccupanti_casa = lambda: {occupanti!r}\n", encoding='utf-8')
        voci = gf.giudica(al_lavoro, lambda n: [pronto, lavoro('queued', secondi, CASA)], {}, ADESSO, True)
        return gf.col_pc_vero(voci, ADESSO, c)


ORA_MS = int(ADESSO.timestamp() * 1000)
if (QUI / 'giro-partito.py').is_file():  # il kit negli altri progetti può non averlo: lì vale solo l'ultima prova
    voci = col_pc({'adesso': ORA_MS, 'pc': {'stato': 'lavora', 'ora': ORA_MS - 20000}},
                  [{'flusso': 'guardiano.yml', 'nome': 'Guardiano dei limiti', 'run': 5,
                    'partito': fa(240).strftime('%Y-%m-%dT%H:%M:%SZ')}])
    testo = '\n'.join(gf.righe(voci, {}, RAMO))
    prova('PC acceso che fa un altro giro: attesa, col motivo, senza ripiego',
          [v['stato'] for v in voci] == ['ATTESA'] and gf.esito_di(voci) == 10 and 'ACCESO' in testo
          and '«Guardiano dei limiti»' in testo and 'NON ripiegare' in testo and 'Ripiega sul posto' not in testo, testo)
    voci = col_pc({'adesso': ORA_MS, 'pc': {'stato': 'pronta', 'ora': ORA_MS - 900000}}, [])
    testo = '\n'.join(gf.righe(voci, {}, RAMO))
    prova('PC senza segnale da 15 minuti: macchina, col motivo vero',
          [v['stato'] for v in voci] == ['MACCHINA'] and gf.esito_di(voci) == 20 and testo.count('SPENTO o SENZA RETE') == 2
          and 'spento, staccato o occupato' not in testo and 'Ripiega sul posto dopo' in testo, testo)
    voci = col_pc(None, None)
    testo = '\n'.join(gf.righe(voci, {}, RAMO))
    prova('GitHub e server dei giri muti: macchina, e si dice che il motivo non si sa',
          [v['stato'] for v in voci] == ['MACCHINA'] and 'NON SO' in testo, testo)
# C511 p.23: lo strumento della macchina di casa lo nomina il progetto (.claude/progetto.json «pc_dei_giri»), non il kit
with tempfile.TemporaryDirectory() as c:
    radice = pathlib.Path(c)
    prova('senza .claude/progetto.json: nessuno strumento', gf.strumento_pc(radice) is None)
    (radice / '.claude').mkdir()
    (radice / 'tools').mkdir()
    (radice / 'tools' / 'pc.py').write_text('x = 1\n', encoding='utf-8')
    for testo, atteso in (('{"pc_dei_giri": "tools/pc.py"}', radice / 'tools' / 'pc.py'), ('{"giro": "fuori"}', None),
                          ('{rotto', None), ('{"pc_dei_giri": "tools/manca.py"}', None), ('{"pc_dei_giri": "../fuori.py"}', None),
                          ('[]', None)):
        (radice / '.claude' / 'progetto.json').write_text(testo, encoding='utf-8')
        avuto = gf.strumento_pc(radice)
        prova(f'pc_dei_giri {testo}: {atteso}', avuto == (atteso.resolve() if atteso else None), str(avuto))
with tempfile.TemporaryDirectory() as c:  # senza giro-partito.py accanto (progetto che non ce l'ha): come prima
    voci = gf.col_pc_vero(gf.giudica(al_lavoro, lambda n: [pronto, lavoro('queued', 240, CASA)], {}, ADESSO, True), ADESSO, c)
    prova('senza giro-partito.py: macchina, «non so»',
          [v['stato'] for v in voci] == ['MACCHINA'] and 'non so se il PC di casa' in '\n'.join(gf.righe(voci, {}, RAMO)))
if errori:
    print(f'ROSSO: {len(errori)} prove fallite')
    for e in errori:
        print(' -', e[:600])
    sys.exit(1)
print('VERDE: giri-fermi')
