#!/usr/bin/env python3
"""Domande a Mario chiare e col contesto (hook Stop, C233, E145; Mario 22/10: «metti la regola di farmi le domande piú
chiare possibili e farmi capire il contesto che magari non lo ricordo»).

Guarda solo il blocco delle domande del messaggio finale: dalla riga che comincia con «❓» alla riga «───» dopo (o alla
fine). Blocca la fine del turno UNA volta (uscita 2, una riga su stderr) se nel blocco:
  - manca la riga del contesto «📌 Di cosa parliamo: …»;
  - mancano le scelte numerate «1 · …» e «2 · …»;
  - c'è una sigla di lavoro che Mario può non ricordare (C200, E140, P18, M9, #263): va detta a parole.
Le versioni dell'app (v67) si vedono nell'app e vanno bene. Il testo fra `…` conta, quello nei blocchi ``` no.
Secondo giro (`stop_hook_active`), niente blocco delle domande, qualunque errore: silenzio, uscita 0.
Prova: python3 -I tools/test-domande-chiare.py
"""
import json
import re
import sys

BLOCCHI_CODICE = re.compile(r'```.*?```', re.S)
INIZIO = re.compile(r'^[\s>*#_]*❓', re.M)
FINE = re.compile(r'^\s*─{3,}', re.M)
SIGLE = re.compile(r'(?<![\w/.#-])(?:[CEPM]\d{1,3}|#\d{2,3})(?![\w])')
SCELTA = lambda n: re.compile(rf'(?<![\d.]){n}\s*·')


def blocco(testo):
    """→ il testo del blocco delle domande, o None se il messaggio non ne ha."""
    pulito = BLOCCHI_CODICE.sub(' ', testo)
    inizio = INIZIO.search(pulito)
    if not inizio:
        return None
    resto = pulito[inizio.start():]
    fine = FINE.search(resto)
    return resto[:fine.start()] if fine else resto


def difetti(testo):
    """→ elenco dei difetti del blocco delle domande (vuoto = va bene)."""
    b = blocco(testo)
    if b is None:
        return []
    out = []
    if '📌' not in b:
        out.append('manca la riga «📌 Di cosa parliamo:» (cos\'è, dove si vede, perché serve adesso)')
    if not (SCELTA(1).search(b) and SCELTA(2).search(b)):
        out.append('mancano le scelte numerate «1 · … · 2 · …»')
    sigle = sorted(set(SIGLE.findall(b)))
    if sigle:
        out.append('sigle da dire a parole: ' + ', '.join(sigle[:6]))
    return out


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return 0
    if dati.get('stop_hook_active'):
        return 0
    finale = dati.get('last_assistant_message')
    if not isinstance(finale, str) or not finale.strip():
        return 0
    d = difetti(finale)
    if not d:
        return 0
    print('Domanda a Mario poco chiara (C233, E145): ' + '; '.join(d) + '. Riscrivi SOLO la domanda, '
          'col contesto in 1-2 righe e cosa cambia con ogni scelta (niente resoconto ripetuto).', file=sys.stderr)
    return 2


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
