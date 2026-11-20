#!/usr/bin/env python3
"""Dove far girare le prove adesso: contenitore, Blacksmith o GitHub (Mario #295, «gestisci con intelligenza»).

Uso:  python3 -I tools/scegli-giro.py <caso> [--minuti FILE] [--senza-casa]
--senza-casa (C482, Mario 11/11: «prima mio pc poi black poi github server»): il PC di casa non ha preso il giro
      (spento o occupato, lo dice `tools/giro-partito.py`): lo si dice a Mario e si sceglie il posto dopo.
Casi: lavoro (prove della parte cambiata) · versione (giro completo prima di pubblicare) · urgenza ·
      rosso (un giro fuori è fallito) · lunedi (giro automatico con l'iPhone «apple»).
Legge i minuti con `.claude/conta-minuti.py --json` (o da FILE, per le prove di questo programma).
Scrive una riga «DOVE: <posto>» e il perché. La tabella della «bravura» è nella skill `minuti-github`.
Giro fuori su una macchina diversa da quella dell'ultimo giro verde: riga «⚠️ MACCHINA CAMBIATA» (E356), da dire a Mario.
--ultimo FILE (["blacksmith", "2026-11-09"] o null) serve alle prove di questo programma.
Progetto senza prove su GitHub (kit 38.51, C511 p.11): `"giro": "locale"` in `.claude/progetto.json` → il giro è
sempre «prove in locale», senza leggere minuti né macchine fuori (che lì non ci sono); il lunedì niente giro.
"""
import json
import subprocess
import sys

# Durata di un giro completo, minuti (23-24/10: Blacksmith 16-17, contenitore ~35; GitHub 87 il 10/11, C471: 476 prove).
DURATA = {'blacksmith': 17, 'github': 87, 'locale': 35}
GIRI_DI_SCORTA = 2  # un giro fuori parte solo se ne restano almeno 2 (il primo può venire rosso)
GIRI_AL_GIORNO = 2  # stima per le versioni, giri rossi compresi: il giro del lunedì non deve toglierli
REPO = 'Kur0ChanX/jona-ordini'
NOMI = {'blacksmith': 'Blacksmith', 'github': 'GitHub', 'casa': 'il PC di casa'}  # le macchine dei giri fuori


def api(percorso):
    uscita = subprocess.run(['gh', 'api', percorso], capture_output=True, text=True, timeout=90)
    if uscita.returncode != 0:
        raise SystemExit(f'gh api non risponde ({percorso}): {uscita.stderr.strip()[:200]}')
    return json.loads(uscita.stdout)


def posto_di(etichette):
    """La macchina di un lavoro dalle sue etichette (come `.claude/conta-minuti.py` e `tools/giro-partito.py`)."""
    etichette = etichette or []
    if any(e.startswith('blacksmith-') for e in etichette):
        return 'blacksmith'
    if 'casa' in etichette or 'self-hosted' in etichette:
        return 'casa'
    return 'github'


def ultimo_verde(leggi=api):
    """(macchina, giorno) del lavoro «prove» dell'ultimo giro verde di prove.yml, o None. Si guarda il lavoro e non il
    giro: il lunedì gira solo «apple» e con «giro-locale» il lavoro «prove» è saltato."""
    giri = leggi(f'repos/{REPO}/actions/workflows/prove.yml/runs?status=success&per_page=10')['workflow_runs']
    for g in sorted(giri, key=lambda g: g.get('created_at') or '', reverse=True):
        for j in leggi(f"repos/{REPO}/actions/runs/{g['id']}/jobs?per_page=100")['jobs']:
            if j.get('name') == 'prove' and j.get('conclusion') == 'success':
                return posto_di(j.get('labels')), (j.get('completed_at') or '')[:10]
    return None


def avviso_macchina(posto, ultimo):
    """E356 (9/11: da Blacksmith a GitHub senza dirlo, 9 giri rossi su 9 presi per prove fragili): la riga d'allarme
    quando il giro fuori va su una macchina diversa da quella dell'ultimo giro verde; '' se è la stessa o non si sa."""
    if posto not in NOMI or not ultimo or ultimo[0] == posto:
        return ''
    return (f"⚠️ MACCHINA CAMBIATA: l'ultimo giro verde ({ultimo[1]}) era su {NOMI.get(ultimo[0], ultimo[0])}, questo va su "
            f'{NOMI[posto]}. Le prove sono tarate sulla macchina di prima: dillo a Mario PRIMA del giro; '
            'rossi in serie → prima `runner_name` e durate dei passi, poi le prove (E356).')


def leggi_ultimo(argv):
    if '--ultimo' in argv:
        with open(argv[argv.index('--ultimo') + 1]) as f:
            return json.load(f)
    return ultimo_verde()


def casa_attiva(percorso='tools/chiavetta/stato.json'):
    """Il PC di casa (C476) entra nei giri solo con "attiva": true nel suo file di stato (lo accende la chat Giri dopo
    il primo giro verde vero). File mancante o illeggibile, o qualsiasi altro valore = no."""
    try:
        with open(percorso, encoding='utf-8') as f:
            return json.load(f).get('attiva') is True
    except (OSError, ValueError, AttributeError):
        return False


def casa_nel_giro(argv, percorso='tools/chiavetta/stato.json'):
    """Il PC di casa è il primo posto solo se è acceso ai giri E non è stato scartato con --senza-casa (C482)."""
    return '--senza-casa' not in argv and casa_attiva(percorso)


def giro_locale(percorso='.claude/progetto.json'):
    """C511 p.11: impostazione del progetto «giro = prove in locale». File mancante, rotto o altro valore = no."""
    try:
        with open(percorso, encoding='utf-8') as f:
            return json.load(f).get('giro') == 'locale'
    except (OSError, ValueError, AttributeError):
        return False


def scegli_locale(caso):
    """(posto, perché) per un progetto con «giro = prove in locale»: niente minuti né macchine fuori."""
    if caso == 'lunedi':
        return 'nessuno', 'progetto con «giro = prove in locale» (.claude/progetto.json): niente giro del lunedì fuori'
    if caso in ('lavoro', 'rosso', 'versione', 'urgenza'):
        return 'locale', 'progetto con «giro = prove in locale» (.claude/progetto.json): tutte le prove qui, niente giri fuori'
    raise SystemExit(f'caso sconosciuto: {caso} (lavoro · versione · urgenza · rosso · lunedi)')


def leggi_minuti(argv):
    if '--minuti' in argv:
        with open(argv[argv.index('--minuti') + 1]) as f:
            return json.load(f)
    uscita = subprocess.run([sys.executable, '-I', '.claude/conta-minuti.py', '--json'],
                            capture_output=True, text=True, timeout=300)
    if uscita.returncode != 0:
        raise SystemExit(f'conta-minuti non risponde: {uscita.stderr.strip()[:200]}')
    return json.loads(uscita.stdout)


def scegli(caso, m, casa=False):
    """(posto, perché). posto: locale · casa · blacksmith · github · nessuno. casa = il PC di casa è acceso ai giri."""
    bs_restano = m['blacksmith_totale'] - m['blacksmith']
    gh_per_prove = m['github_per_prove']
    bs_ok = m['blacksmith_attivo'] and bs_restano >= GIRI_DI_SCORTA * DURATA['blacksmith']
    gh_ok = gh_per_prove >= GIRI_DI_SCORTA * DURATA['github']
    conti = (f"Blacksmith {m['blacksmith']}/{m['blacksmith_totale']}, GitHub {m['github']}/{m['github_totale']} "
             f"(riserva {m['riserva']} per pubblicazioni e anteprime), azzeramento fra {m['giorni']} giorni")
    if caso == 'lavoro':
        return 'locale', 'poche prove della parte cambiata: qui partono subito, gratis, senza coda'
    if caso == 'rosso':
        return 'locale', ('prima si rifà QUI la prova rossa (stesso file, --repeat-each), gratis; '
                          'mai rilanciare il giro fuori senza la causa (E22)')
    # Mario #296 «1» (E162): versioni e urgenze su Blacksmith (~17 min, stesse prove); GitHub fa il secondo parere
    # del lunedì (macchina più lenta + iPhone) e le versioni solo se Blacksmith è fermo o finito.
    if caso == 'versione':
        caso = 'urgenza'
    if caso == 'urgenza':
        # C471 C3 (Mario 10/11 19:15: «GitHub col mio computer»): il PC di casa prima di tutti, veloce e senza minuti.
        # Il giro del lunedì e i giri automatici mai lì (C476 H10).
        if casa:
            return 'casa', f'il PC di casa: macchina veloce, nessun minuto consumato; {conti}'
        if bs_ok:
            return 'blacksmith', f"il più veloce (~{DURATA['blacksmith']} min) e su una macchina pulita; {conti}"
        if gh_ok:
            return 'github', f"Blacksmith {'spento' if not m['blacksmith_attivo'] else 'quasi finito'}; GitHub ha minuti oltre la riserva; {conti}"
        return 'locale', f"niente minuti fuori (o solo la riserva di GitHub): il giro verde qui basta per pubblicare; {conti}"
    if caso == 'lunedi':
        # Il giro del lunedì è un controllo in più (iPhone): solo se avanza, mai a spese delle versioni.
        if gh_ok:
            return 'github', f'secondo parere su GitHub (macchina più lenta, iPhone) coi minuti oltre la riserva; {conti}'
        if bs_ok and bs_restano >= (m['giorni'] * GIRI_AL_GIORNO + GIRI_DI_SCORTA) * DURATA['blacksmith']:
            return 'blacksmith', f'avanzano minuti anche per le versioni della settimana; {conti}'
        return 'nessuno', f'minuti da tenere per le versioni: il giro del lunedì si salta; {conti}'
    raise SystemExit(f'caso sconosciuto: {caso} (lavoro · versione · urgenza · rosso · lunedi)')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    if giro_locale():  # C511 p.11: prima di chiedere i minuti a GitHub (in quei progetti non ci sono)
        posto, perche = scegli_locale(sys.argv[1])
        print(f'DOVE: {posto}')
        print(f'Perché: {perche}')
        if posto == 'locale' and sys.argv[1] in ('versione', 'urgenza'):
            print('Come: le prove complete del progetto qui, in sottofondo (comando in CLAUDE.md o .claude/rules/prove.md); '
                  "verdi sull'ultimo commit → si pubblica (REGOLE «Rami e PR»).")
        raise SystemExit(0)
    posto, perche = scegli(sys.argv[1], leggi_minuti(sys.argv), casa_nel_giro(sys.argv))
    print(f'DOVE: {posto}')
    print(f'Perché: {perche}')
    if posto in NOMI:
        try:
            ultimo = leggi_ultimo(sys.argv)
            riga = avviso_macchina(posto, ultimo) if ultimo else (
                'Ultimo giro verde non trovato fra gli ultimi 10 giri riusciti (lavoro «prove»): '
                'guarda tu su che macchina era (E356).')
        except (SystemExit, OSError, ValueError, KeyError, subprocess.SubprocessError) as e:
            riga = f'Ultimo giro verde non letto ({str(e)[:120]}): guarda tu su che macchina era (E356).'
        if riga:
            print(riga)
    if posto == 'github':
        print("Come: etichetta «giro-github» sulla PR PRIMA di segnarla pronta (prove.yml la legge).")
    if posto == 'casa':
        print("Come: etichetta «giro-casa» sulla PR PRIMA di segnarla pronta (prove.yml la legge). Dopo 3 minuti: "
              "python3 -I tools/giro-partito.py <PR>; se dice di ripiegare (PC spento o occupato): una riga a Mario, "
              "via l'etichetta, PR in bozza e si sceglie di nuovo con --senza-casa (Blacksmith, poi GitHub).")
    if posto == 'locale' and sys.argv[1] in ('versione', 'urgenza'):
        print('Come: bash tools/giro-come-github.sh <cartella> in sottofondo; verde → etichetta «giro-locale» sulla PR '
              '(prove.yml salta il giro fuori), poi pronta e unione.')
