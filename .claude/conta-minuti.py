#!/usr/bin/env python3
"""Conta i minuti del mese di GitHub Actions e di Blacksmith (regola STABILITÀ, MINUTI).

GitHub non fa leggere il contatore: si rifà il suo conto dai giri del mese.
Uso:  python3 -I .claude/conta-minuti.py [--json]   (legge da solo con `gh api`, REST)

I lavori con etichetta `blacksmith-…` girano sui computer di Blacksmith: GitHub non li conta
(«free for self-hosted runners»), Blacksmith sì, in minuti da 2 vCPU (4 vCPU = il doppio; Windows il doppio).
I lavori del PC di casa (etichetta `self-hosted`) non li conta nessuno: stanno a parte (E516, Mario 20/11: il conto
li metteva fra i minuti di GitHub, «circa 2018 su 2000» con 967 minuti del PC; i veri erano circa 1155).
Sulle macchine di GitHub un minuto di Windows conta 2 e uno di macOS 10 (i minuti gratis si consumano col moltiplicatore).
Riserva: i minuti di GitHub da tenere per i workflow che solo GitHub può fare (pubblicazione,
anteprima, letture coi segreti) fino all'azzeramento, al ritmo del mese × 1,5.

Come conta GitHub (verificato il 20/10/2026: 1822 contro i 1825 veri):
- si paga ogni LAVORO (job), non il giro intero, dall'inizio alla fine del lavoro;
- ogni lavoro si arrotonda al minuto in su;
- lavori e giri saltati (PR in bozza, `if:` falso) costano 0;
- l'attesa in coda non si paga.
La versione di prima contava il giro intero, coda compresa, e 1 minuto anche
per i giri saltati: ~150 minuti in più (E113).
"""
import calendar
import concurrent.futures as cf
import datetime as dt
import json
import math
import re
import sys
import subprocess
from collections import Counter

REPO = 'Kur0ChanX/jona-ordini'
TOTALE = 2000
TOTALE_BS = 3000  # Blacksmith gratis: minuti x64 2 vCPU al mese per organizzazione


def api(percorso):
    uscita = subprocess.run(['gh', 'api', percorso], capture_output=True, text=True, timeout=90)
    if uscita.returncode != 0:
        raise SystemExit(f'gh api non risponde ({percorso}): {uscita.stderr.strip()[:200]}')
    return json.loads(uscita.stdout)


def ora_di(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00')) if s else None


def minuti_del_lavoro(m, etichette):
    """(GitHub, Blacksmith da 2 vCPU, PC di casa) per un lavoro di m minuti veri, dalle etichette della sua macchina."""
    e = [x.lower() for x in etichette or []]
    windows, mac = any('windows' in x for x in e), any('macos' in x for x in e)
    cpu = next((re.match(r'blacksmith-(\d+)vcpu', x) for x in e if x.startswith('blacksmith-')), None)
    if cpu:
        return 0, m * int(cpu.group(1)) // 2 * (2 if windows else 1), 0
    if 'self-hosted' in e:
        return 0, 0, m
    return m * (2 if windows else 10 if mac else 1), 0, 0


def minuti_del_giro(giro):
    """(giro, minuti GitHub, minuti Blacksmith da 2 vCPU, minuti del PC di casa)."""
    if giro.get('conclusion') == 'skipped':
        return giro, 0, 0, 0
    lavori = api(f"repos/{REPO}/actions/runs/{giro['id']}/jobs?per_page=100&filter=all")['jobs']
    gh, bs, casa = 0, 0, 0
    for j in lavori:
        a, b = ora_di(j.get('started_at')), ora_di(j.get('completed_at'))
        if j.get('conclusion') != 'skipped' and a and b and b > a:
            m = math.ceil((b - a).total_seconds() / 60)
            g, b, c = minuti_del_lavoro(m, j.get('labels'))
            gh, bs, casa = gh + g, bs + b, casa + c
    return giro, gh, bs, casa


oggi = dt.datetime.now(dt.timezone.utc)
mese = oggi.strftime('%Y-%m')
# Un giorno alla volta: con il filtro `created` GitHub dà al massimo 1000 giri per ricerca. Il conto del mese intero
# si fermava ai primi 1000 (29/10: 2500 giri, «853 minuti» mentre GitHub aveva già fermato i giri per la spesa).
def giri_del_giorno(giorno):
    tutti, pagina = [], 1
    while True:
        risposta = api(f'repos/{REPO}/actions/runs?per_page=100&page={pagina}&created={mese}-{giorno:02d}')
        lista = risposta['workflow_runs']
        tutti += lista
        if len(lista) < 100:
            # C274: a volte GitHub dà una pagina vuota ma dice che i giri ci sono (total_count): niente falso «0 minuti».
            if len(tutti) < min(risposta.get('total_count', 0), 1000):
                raise SystemExit(f'GitHub ha dato {len(tutti)} giri su {risposta["total_count"]} il {mese}-{giorno:02d}: '
                                 'conto non affidabile, rilancia tra poco.')
            return tutti
        pagina += 1


with cf.ThreadPoolExecutor(8) as ex:
    giri = [g for lista in ex.map(giri_del_giorno, range(1, oggi.day + 1)) for g in lista]

usati, usati_bs, usati_casa, per_tipo, bs_attivo = 0, 0, 0, Counter(), False
with cf.ThreadPoolExecutor(16) as ex:
    for giro, m, b, c in ex.map(minuti_del_giro, giri):
        usati += m
        usati_bs += b
        usati_casa += c
        bs_attivo = bs_attivo or b > 0
        per_tipo[f"{giro['name']} ({giro['event']})"] += m

giorni = calendar.monthrange(oggi.year, oggi.month)[1] - oggi.day + 1
# Riserva: ritmo al giorno dei workflow che non sono «Prove» (solo GitHub li può fare) × giorni che mancano × 1,5.
solo_github = sum(v for k, v in per_tipo.items() if not k.startswith('Prove '))
riserva = math.ceil(solo_github / max(1, oggi.day) * giorni * 1.5)
dati = {'mese': mese, 'giri': len(giri), 'github': usati, 'github_totale': TOTALE, 'riserva': riserva,
        'github_per_prove': max(0, TOTALE - usati - riserva), 'blacksmith': usati_bs, 'blacksmith_totale': TOTALE_BS,
        'blacksmith_attivo': bs_attivo, 'casa': usati_casa, 'giorni': giorni}
if '--json' in sys.argv:
    print(json.dumps(dati))
    raise SystemExit
print(f'Mese {mese}: {len(giri)} giri. GitHub: circa {usati} minuti su {TOTALE} '
      f'(restano {max(0, TOTALE - usati)}; riserva per pubblicazioni e anteprime {riserva}). '
      f'Blacksmith: {usati_bs} su {TOTALE_BS}{"" if bs_attivo else " (nessun giro questo mese)"}. '
      f'PC di casa: {usati_casa} (gratis, non contano). '
      f'Azzeramento il 1° del mese prossimo: mancano {giorni} giorni.')
print('Dove (GitHub): ' + ' · '.join(f'{k} {v}' for k, v in per_tipo.most_common(5) if v))
if usati > TOTALE:
    print(f'ALLARME: oltre {TOTALE} su GitHub: le prove solo su Blacksmith o in locale (skill minuti-github), avviso rosso in testa ai messaggi.')
