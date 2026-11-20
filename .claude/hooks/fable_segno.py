"""Il segno «⛔ FABLE (C472)» del testo [AVVIO], in un posto solo: lo scrive `tools/consegne.py` (sessione che chiude
con Fable), lo legge `.claude/hooks/fermo-fable.py` (sessione nuova nata con un altro motore).
C504 (Mario 14/11 10:41 «hai bisogno di fable ora? dimmelo sempre se c'è bisogno o meno»): il segno dice anche PERCHÉ
serve Fable, e la chat ferma lo ripete a Mario con le stesse parole."""
import re

SEGNO = "⛔ FABLE (C472)"
PENSIERO = re.compile(r"lavorava con Fable · (\w+)")
PERCHE = re.compile(r"Serve Fable perché: (.+?)\. Se il tuo motore")
MENU = "menu del motore e del pensiero nell'app, o /model e /effort"
OPUS = 'Per andare con Opus scrivimi "vai con Opus".'


def pulito(perche):
    """Una frase sola, sicura dentro il segno: niente a capo, «», virgolette doppie, punti in fondo; al massimo 200."""
    t = re.sub(r"\s+", " ", str(perche or "")).replace("«", "").replace("»", "").replace('"', "'").strip(" .")
    return t[:200].rstrip(" .")


def risposta(pensiero="", perche=""):
    """Le sole parole a Mario della chat ferma (Mario 12/11 08:42: anche il pensiero, non solo il motore)."""
    p = f" · {pensiero}" if pensiero and pensiero != "?" else ""
    perche = pulito(perche)
    serve = f"serve perché {perche}; metti" if perche else "metti"
    return f'⛔ La sessione di prima lavorava con Fable{p}: {serve} Fable{p} ({MENU}), poi scrivimi "via". {OPUS}'


def segno(pensiero="", perche=""):
    """Il testo che va subito dopo «[AVVIO] »."""
    p = f" · {pensiero}" if pensiero and pensiero != "?" else ""
    perche = pulito(perche)
    s = f" Serve Fable perché: {perche}." if perche else ""
    return (f"{SEGNO}: la sessione di prima lavorava con Fable{p}.{s} Se il tuo motore non è Fable non fare niente, "
            f"nemmeno l'avvio: scrivi a Mario solo «{risposta(pensiero, perche)}» Se sei Fable, avvio normale:")


def leggi(prompt):
    """(pensiero, perché) dal testo [AVVIO] col segno; '' se mancano (segno di un kit più vecchio)."""
    t = str(prompt or "")
    m, r = PENSIERO.search(t), PERCHE.search(t)
    return (m.group(1) if m else ""), (pulito(r.group(1)) if r else "")
