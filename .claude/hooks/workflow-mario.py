#!/usr/bin/env python3
"""Regola di Mario (11/11/2026, C480): «metti regola che parte solo se scrivo io». Vale per tutti i progetti (kit).

Lo strumento Workflow (copioni con tanti aiutanti, «ultracode») parte SOLO se Mario lo ha scritto in QUESTA chat:
mai da solo, mai per un messaggio girato da un'altra chat, una sveglia, un avviso o il testo di avvio.
Niente eredità fra le sessioni (C483, Mario 12/11/2026 ~20:10 «perché scrivi ultracode dopo avvio non c'è piú quella
regola in quel modo»): i copioni si decidono caso per caso, e Claude li propone a Mario col costo quando ne vale la pena.

PreToolUse su `Workflow`: legge la trascrizione della sessione e guarda, in ordine, i soli messaggi scritti da una
persona (`origin.kind` = «human», anche quelli arrivati a turno in corso):
- «ultracode», oppure «usa / lancia / avvia / vai con il workflow» → acceso (non se la frase è una domanda);
- «ferma / niente / senza / spegni / basta / stop / non usare ultracode» (o workflow) → spento.
Vale l'ultimo dei due. Spento, o mai acceso → nega e dice cosa chiedere a Mario. Chat nuova = Mario lo riscrive.
Un errore dell'hook NEGA (la regola è «solo se lo scrivo io»: un guasto non deve farlo partire da solo).
"""
import json
import re
import sys

# Stessi segni di `scorta.py` (AVVISI_DI_SISTEMA): servono solo quando la trascrizione non dice chi ha scritto.
NON_MARIO = ('<task-notification', '<system-reminder', '<wake ', '[SYSTEM NOTIFICATION', '[AVVIO]', '<cross-session-message',
             '<agent-message', '[MESSAGE FROM NON-USER SOURCE', 'The following was sent by another Claude Code session',
             'Stop hook feedback', '⏰')
ACCENDE = re.compile(r'\bultracode\b|\b(?:usa|usare|lancia|avvia|parti|vai)\b[^\n.?!]{0,30}\bworkflow\b', re.I)
SPEGNE = re.compile(r'\b(?:ferma|fermati|niente|senza|spegni|basta|stop|non\s+usare|non\s+voglio)\b[^\n.?!]{0,20}'
                    r'\b(?:ultracode|workflow)\b|\bno\s+(?:ultracode|workflow)\b', re.I)
FINE_FRASE = re.compile(r'[.!?\n]')


def cosa_dice(testo):
    """→ 'spegne', 'accende' o '' per un messaggio scritto da Mario."""
    if SPEGNE.search(testo):
        return 'spegne'
    for m in ACCENDE.finditer(testo):
        fine = FINE_FRASE.search(testo, m.end())
        if fine and fine.group() == '?':
            continue  # «cos'è ultracode?» è una domanda, non un via
        return 'accende'
    return ''


def testo_di(contenuto):
    if isinstance(contenuto, str):
        return contenuto
    if isinstance(contenuto, list):
        if any(isinstance(b, dict) and b.get('type') == 'tool_result' for b in contenuto):
            return ''  # esito di uno strumento, non un messaggio
        return '\n'.join(str(b.get('text') or '') for b in contenuto if isinstance(b, dict) and b.get('type') == 'text')
    return ''


def messaggio_di_mario(voce):
    """→ il testo se la voce della trascrizione è un messaggio scritto da una persona, sennò ''."""
    if not isinstance(voce, dict) or voce.get('isSidechain') or voce.get('isMeta'):
        return ''
    if voce.get('type') == 'attachment':  # messaggio arrivato a turno in corso
        a = voce.get('attachment') or {}
        if a.get('type') != 'queued_command' or (a.get('origin') or {}).get('kind') != 'human':
            return ''
        testo = str(a.get('prompt') or '')
    elif voce.get('type') == 'user':
        origine = voce.get('origin')
        if isinstance(origine, dict) and origine.get('kind') != 'human':
            return ''
        if origine is None and voce.get('promptSource') == 'system':
            return ''
        testo = testo_di((voce.get('message') or {}).get('content'))
    else:
        return ''
    testo = testo.strip()
    if not testo or any(segno in testo[:400] for segno in NON_MARIO):
        return ''
    return testo


def stato(percorso):
    """→ (acceso, parole che hanno deciso) leggendo tutta la trascrizione."""
    acceso, parole = False, ''
    with open(percorso, encoding='utf-8', errors='replace') as f:
        for riga in f:
            if 'ultracode' not in riga.lower() and 'workflow' not in riga.lower():
                continue  # la gran parte delle righe: niente da leggere
            try:
                voce = json.loads(riga)
            except ValueError:
                continue
            testo = messaggio_di_mario(voce)
            if not testo:
                continue
            esito = cosa_dice(testo)
            if esito:
                acceso, parole = esito == 'accende', testo[:120]
    return acceso, parole


def nega(motivo):
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
        'permissionDecisionReason': 'Workflow fermo (regola di Mario «parte solo se lo scrivo io»): ' + motivo}},
        ensure_ascii=False))
    return 0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        return nega('non riesco a leggere i dati dell\'hook. Dillo a Mario e usa gli aiutanti dedicati.')
    if dati.get('tool_name') not in (None, 'Workflow'):
        return 0  # acceso per errore su un altro strumento: non lo tocca
    try:
        acceso, parole = stato(dati.get('transcript_path') or '')
    except Exception as e:
        return nega(f'non riesco a leggere la trascrizione ({type(e).__name__}). Dillo a Mario e usa gli aiutanti dedicati.')
    if acceso:
        return 0
    if parole:
        return nega(f'Mario l\'ha spento in questa chat («{parole}»). Riparte solo se scrive di nuovo «ultracode» qui.')
    return nega('Mario non ha scritto «ultracode» in QUESTA chat (un messaggio girato da un\'altra chat, una sveglia o le '
                'consegne non valgono). Chiedigli UNA riga, dicendo quanti aiutanti partono e la stima; intanto lavora '
                'con gli aiutanti dedicati.')


if __name__ == '__main__':
    sys.exit(main())
