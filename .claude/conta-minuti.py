#!/usr/bin/env python3
"""Conta i minuti di GitHub Actions usati nel mese (regola STABILITÀ, MINUTI).

GitHub non fa leggere il contatore: si rifà il suo conto dai giri del mese.
Uso:  python3 -I .claude/conta-minuti.py   (legge da solo con `gh api`, REST)

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
import subprocess
from collections import Counter

REPO = 'Kur0ChanX/jona-ordini'
TOTALE = 2000


def api(percorso):
    uscita = subprocess.run(['gh', 'api', percorso], capture_output=True, text=True, timeout=90)
    if uscita.returncode != 0:
        raise SystemExit(f'gh api non risponde ({percorso}): {uscita.stderr.strip()[:200]}')
    return json.loads(uscita.stdout)


def ora_di(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00')) if s else None


def minuti_del_giro(giro):
    if giro.get('conclusion') == 'skipped':
        return giro, 0
    lavori = api(f"repos/{REPO}/actions/runs/{giro['id']}/jobs?per_page=100&filter=all")['jobs']
    totale = 0
    for j in lavori:
        a, b = ora_di(j.get('started_at')), ora_di(j.get('completed_at'))
        if j.get('conclusion') != 'skipped' and a and b and b > a:
            totale += math.ceil((b - a).total_seconds() / 60)
    return giro, totale


oggi = dt.datetime.now(dt.timezone.utc)
mese = oggi.strftime('%Y-%m')
giri, pagina = [], 1
while True:
    lista = api(f'repos/{REPO}/actions/runs?per_page=100&page={pagina}&created=>={mese}-01')['workflow_runs']
    giri += [g for g in lista if g['created_at'].startswith(mese)]
    if len(lista) < 100:
        break
    pagina += 1

usati, per_tipo = 0, Counter()
with cf.ThreadPoolExecutor(8) as ex:
    for giro, m in ex.map(minuti_del_giro, giri):
        usati += m
        per_tipo[f"{giro['name']} ({giro['event']})"] += m

giorni = calendar.monthrange(oggi.year, oggi.month)[1] - oggi.day + 1
print(f'Mese {mese}: {len(giri)} giri, circa {usati} minuti su {TOTALE} '
      f'(restano {max(0, TOTALE - usati)}). Azzeramento il 1° del mese prossimo: mancano {giorni} giorni.')
print('Dove: ' + ' · '.join(f'{k} {v}' for k, v in per_tipo.most_common(5) if v))
if usati > TOTALE:
    print(f'ALLARME: oltre {TOTALE}: niente giri su GitHub fino al 1° (skill minuti-github), avviso rosso in testa ai messaggi.')
