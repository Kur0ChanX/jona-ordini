#!/usr/bin/env python3
"""Ora nel futuro (kit 38.30, E399).

PostToolUse (Bash): dopo un `git commit` guarda le righe AGGIUNTE dal commit appena fatto nei file di testo di `docs/`
e `archivio/` e avvisa (additionalContext, mai un blocco) se un'ora scritta è più avanti dell'ora italiana vera di
oltre 5 minuti: un'ora messa «a stima» in un documento come se fosse un fatto (Giri 37: scritto 23:30, erano le 23:13).
- Ora con la data di oggi davanti («11/11 23:30», «11/11/2026 alle 23:30»): avvisa a qualunque distanza in avanti.
- Ora senza data: avvisa solo fino a 2 ore avanti (più in là è un'ora di ieri o un programma).
- Niente avviso per: data diversa da oggi, ora dei registri («T22:41:09Z»), parole di futuro o di stima subito prima
  («entro le», «fino alle», «sveglia», «stima», «circa»…) o «(stima)» subito dopo, citazioni («> »), registri dei
  messaggi di Mario, copie del kit (`docs/kit-progetto/`), un'ora che stava già in una riga tolta dallo stesso commit (riga spostata o ritoccata).
Qualunque errore: silenzio, uscita 0. Prova: python3 -I tools/test-ora-futura.py
"""
import datetime
import json
import os
import re
import subprocess
import sys
import time

COMMIT = re.compile(r'(^|[;&|(]\s*)git\s+commit\b')  # solo il comando vero, non la parola dentro un testo
CARTELLE = ('docs/', 'archivio/')
ESTENSIONI = ('.md', '.txt')
SALTA = ('archivio/messaggi-mario/', 'docs/MESSAGGI-MARIO', 'docs/ULTIMO-MESSAGGIO', 'docs/ULTIMA-RISPOSTA',
         'docs/kit-progetto/')  # il kit: regole e copie del codice, le ore lì sono esempi
MARGINE, FINESTRA, MASSIMO, FRESCO = 5, 120, 3, 120  # minuti · minuti · avvisi per commit · secondi dal commit
ORA = re.compile(r'(?<![\d:.,/T])([01]?\d|2[0-3]):([0-5]\d)(?!\d)')
DATA = re.compile(r'(\d{1,2})/(\d{1,2})(?:/\d{2,4})?[\s,·(]*(?:(?:alle|ore|h)\s*)?$')
FUTURO = re.compile(r'\b(entro|fino a\w*|non prima|prima delle|dopo le|sveglia|stima\w*|circa|verso|scad\w*|previst\w*'
                    r'|prossim\w*|domani|ripart\w*|riprov\w*)\b|⏰|~|≈', re.I)
DOPO = re.compile(r'\s*[(\[]?\s*(stima|circa|previst)', re.I)


def adesso_italiano():
    finta = os.environ.get('ORA_FUTURA_ADESSO')  # solo per la prova: «2026-06-15T15:00»
    if finta:
        return datetime.datetime.strptime(finta, '%Y-%m-%dT%H:%M')
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome')).replace(tzinfo=None)
    except Exception:  # noqa: BLE001
        os.environ['TZ'] = 'Europe/Rome'
        time.tzset()
        return datetime.datetime.now()


def chiave(riga, m):
    return riga[max(0, m.start() - 12):m.start()].strip() + '|' + m.group(0)


def chiavi(righe):
    return {chiave(r, m) for r in righe for m in ORA.finditer(r)}


def sospette(aggiunte, tolte, adesso):
    """aggiunte: [(file, riga)] · tolte: chiavi delle ore nelle righe tolte → [(file, 'HH:MM', minuti in avanti)]."""
    oggi, minuti, out = (adesso.day, adesso.month), adesso.hour * 60 + adesso.minute, []
    for nome, riga in aggiunte:
        if riga.lstrip(' -*').startswith('>'):
            continue
        for m in ORA.finditer(riga):
            s = m.start()
            if chiave(riga, m) in tolte or FUTURO.search(riga[max(0, s - 28):s]) or DOPO.match(riga[m.end():m.end() + 14]):
                continue
            t = int(m.group(1)) * 60 + int(m.group(2))
            d = DATA.search(riga[max(0, s - 24):s])
            if d:
                avanti = t - minuti
                if (int(d.group(1)), int(d.group(2))) != oggi or avanti <= MARGINE:
                    continue
            else:
                avanti = (t - minuti) % 1440
                if not MARGINE < avanti <= FINESTRA:
                    continue
            out.append((nome, m.group(0), avanti))
    return out


def del_commit(cartella):
    """Righe aggiunte e tolte dall'ultimo commit nei file guardati; ([], set()) se è un merge o non è appena fatto."""
    r = subprocess.run(['git', '-c', 'core.quotepath=off', 'show', 'HEAD', '-U0', '--no-color', '--format=%P|%ct', '--',
                        *[c.rstrip('/') for c in CARTELLE]], cwd=cartella, capture_output=True, text=True, timeout=8)
    testa, _, corpo = r.stdout.partition('\n')
    genitori, _, quando = testa.partition('|')
    if r.returncode or len(genitori.split()) > 1 or abs(time.time() - int(quando or 0)) > FRESCO:
        return [], set()
    aggiunte, tolte, nome = [], [], None
    for riga in corpo.split('\n'):
        if riga.startswith('+++ '):
            n = riga[6:] if riga.startswith('+++ b/') else ''
            nome = n if n.endswith(ESTENSIONI) and not n.startswith(SALTA) else None
        elif riga.startswith('--- ') or nome is None:
            continue
        elif riga.startswith('+'):
            aggiunte.append((nome, riga[1:]))
        elif riga.startswith('-'):
            tolte.append(riga[1:])
    return aggiunte, chiavi(tolte)


def main():
    try:
        dati = json.load(sys.stdin)
        if not COMMIT.search((dati.get('tool_input') or {}).get('command') or ''):
            return 0
        cartella = os.environ.get('CLAUDE_PROJECT_DIR') or dati.get('cwd') or '.'
        aggiunte, tolte = del_commit(cartella)
        adesso = adesso_italiano()
        trovate = sospette(aggiunte, tolte, adesso)
        if trovate:
            elenco = ' · '.join(f'«{ora}» in {nome} (+{av} min)' for nome, ora, av in trovate[:MASSIMO])
            altre = f' e altre {len(trovate) - MASSIMO}' if len(trovate) > MASSIMO else ''
            testo = (f'Ora nel futuro (E399): nel commit appena fatto {elenco}{altre}; ora italiana vera '
                     f'{adesso:%H:%M}. Se è un fatto: rileggi `TZ=Europe/Rome date`, correggi e fai un commit nuovo. '
                     'Se è un programma voluto: scrivilo («entro le», «stima») o ignora.')
            print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': testo}},
                             ensure_ascii=False))
    except Exception:  # noqa: BLE001
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main())
