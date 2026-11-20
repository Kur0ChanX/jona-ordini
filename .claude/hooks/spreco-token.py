#!/usr/bin/env python3
"""Guardiano dello spreco di token (C433, Mario 03/11: «una regola che verifichi lo spreco di token in generale per
account, sessione, per qualsiasi situazione, e me lo segnali se vedi anomalie; la regola stessa non deve sprecare token»).

Costa zero token finché va tutto bene: è un programma, legge la trascrizione e parla SOLO con un'anomalia (una riga).
  spreco-token.py inizio (UserPromptSubmit): anomalie del turno prima, non ancora dette → UNA riga di contesto
                         («dillo a Mario in una riga»); poi azzera i contatori del turno.
  spreco-token.py tool   (PostToolUse): stesso strumento con lo stesso ingresso RIPETUTO volte nel turno → una riga
                         subito («fermati e cambia strada»), una volta sola per comando.
  spreco-token.py fine   (Stop): conti del turno dalla trascrizione (messaggi contati una volta, per id) → anomalie
                         nello stato; totale del giorno della sessione in .git/consumo/ (la scorta lo copia in archivio/consumo/)
                         (aggiunto all'indice di git: va su GitHub col primo commit della sessione).
                         Anche al secondo giro: blocchi degli hook e tempi scaduti contati in «blocchi» (C469), mai detti.
  spreco-token.py avvio  (SessionStart): somma per account dei file di archivio/consumo degli ultimi 8 giorni →
                         una riga solo se ieri un account ha speso oltre CONTO_ACCOUNT volte la sua media.
Motore giusto (C454, Mario 04/11: «creami una cosa geniale per capire qual è il miglior motore»): a fine turno guarda
il motore del turno e cosa ha fatto; UNA riga, una volta per sessione per tipo, al messaggio dopo:
  ⬇️ Fable per 2 turni di fila senza file scritti e con poco ragionamento → bastava Opus (o Sonnet).
  ⬆️ codice scritto con Sonnet o Haiku → meglio Opus · ⬆️ Opus con molti errori di strumenti nel turno → meglio Fable.
  avvio: pagella dei motori della settimana (una volta al giorno), solo se i turni Fable «leggeri» sono troppi.
Stato in .git/spreco-<sessione>.json (fuori dal progetto). Qualunque errore: silenzio, uscita 0.
«Peso» = token equivalenti, stima coi rapporti dei prezzi: ingresso 1 · memoria scritta 1,25 · memoria letta 0,1 · uscita 5.
`costo` = dollari di listino (C497): memoria letta 0,20 $/M con Opus e Fable, scritta a 1 ora ×2 l'ingresso, uscita ×5; conta la chat, non gli aiutanti. `peso` resta per i confronti con lo storico.
Prova: python3 -I tools/test-spreco-token.py
"""
import datetime
import glob
import hashlib
import json
import os
import re
import sys

# Tetti (regolabili qui; tutti in token, tranne dove detto)
USCITA_KB = 40            # un esito di strumento più grande (≈ 12k token)
RIPETUTO = 4              # stesso strumento con lo stesso ingresso, nello stesso turno
CRESCITA_TURNO = 100_000  # contesto cresciuto in un turno solo
AVVIO = 130_000           # contesto dopo le letture d'avvio (prime AVVIO_CHIAMATE chiamate del primo turno)
# C469 A10: le letture d'avvio (CLAUDE, ERRORI, consegne, messaggi) stanno nelle prime ~12 chiamate; prima si misurava la
# fine del primo turno e una sessione che lavora tutta in un turno solo passava per «avvio pesante».
AVVIO_CHIAMATE = 12
USCITA_TURNO = 25_000     # token scritti da Claude in un turno
AIUTANTI = 3              # aiutanti (Agent) lanciati in un turno
AIUTANTI_FABLE = 6        # con Fable, tempo 1 di «Fable pensa, Opus esegue» (Mario 09/11 alla Codice 4 «aiutanti Fable come consiglio»)
SCADUTA = 50_000          # C455: una chiamata che riscrive più di tanto nella memoria veloce = memoria scaduta (~1 ora di
                          # silenzio): il contesto intero si riscrive a ×2 l'ingresso invece di essere letto a ×0,05 (C497; il `peso` lo conta ancora 1,25). Solo contata nel totale, mai detta.
CONTO_ACCOUNT = 1.6       # ieri contro la media dei giorni prima, per account (servono almeno 3 giorni)
CODICE = 'C433'
# Motore giusto (C454)
FABLE_USCITA = 4_000      # turno Fable «leggero»: meno token scritti (pensiero compreso) di così…
FABLE_STRUMENTI = 10      # …al massimo tanti strumenti, nessun file scritto
FABLE_FILA = 2            # turni leggeri di fila prima di dirlo
OPUS_ERRORI = 5           # esiti di strumenti con errore in un turno di Opus
CAMBIO_ADESSO = 100_000   # oltre questo contesto, cambiare motore a metà chat costa più di quanto risparmia
PAGELLA_LEGGERI = 5       # turni Fable leggeri in 7 giorni oltre cui la pagella parla
ESTENSIONI_CODICE = ('.js', '.mjs', '.cjs', '.ts', '.py', '.css', '.html', '.rules', '.sql', '.sh')
CODICE_MOTORE = 'C454'


def progetto():
    return os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()


def a_mano():
    """C511 p.10: lanciato a mano da Bash (lì CLAUDE_PROJECT_DIR manca, negli hook c'è: provato 18/11) → legge e parla,
    ma non scrive stato, totali in .git/consumo/ né i segni pagella/fredde: le misure a mano non sporcano il registro vero."""
    return not os.environ.get('CLAUDE_PROJECT_DIR')


def sessione(dati):
    s = str(dati.get('session_id') or os.environ.get('CLAUDE_CODE_REMOTE_SESSION_ID') or 'locale')
    return re.sub(r'[^A-Za-z0-9]', '', s.split('_', 1)[-1])[:12] or 'locale'


def account():
    a = os.environ.get('CLAUDE_CODE_ACCOUNT_UUID', '')
    return hashlib.sha256(a.encode()).hexdigest()[:6] if a else 'ignoto'


def oggi():
    finta = os.environ.get('SPRECO_OGGI')
    if finta:
        return finta
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome')).strftime('%Y-%m-%d')
    except Exception:
        return datetime.date.today().isoformat()


def file_stato(dati):
    return os.path.join(progetto(), '.git', f'spreco-{sessione(dati)}.json')


def leggi_stato(dati):
    try:
        with open(file_stato(dati), encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def scrivi_stato(dati, st):
    if a_mano():
        return
    try:
        with open(file_stato(dati), 'w', encoding='utf-8') as f:
            json.dump(st, f, ensure_ascii=False)
    except Exception:
        pass


def contesto(evento, testo):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': evento, 'additionalContext': testo}}, ensure_ascii=False))


def inizio_turno(voce):
    if voce.get('type') != 'user':
        return False
    c = (voce.get('message') or {}).get('content')
    if isinstance(c, str):
        return True
    if isinstance(c, list):
        tipi = {b.get('type') for b in c if isinstance(b, dict)}
        return bool(tipi) and 'tool_result' not in tipi
    return False


def voci(percorso):
    try:
        with open(percorso, 'rb') as f:
            f.seek(max(0, os.path.getsize(percorso) - 4_000_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
    except Exception:
        return None
    uscita = []
    for r in righe:
        try:
            uscita.append(json.loads(r))
        except Exception:
            continue
    return uscita


PREZZI = {  # C497: dollari per milione, listino del 03/11/2026 (skill claude-api): ingresso, memoria letta, uscita
    'fable': (8.0, 0.20, 40.0), 'opus': (4.0, 0.20, 20.0), 'sonnet': (2.0, 0.10, 10.0)}


def grezzi_turno(usi):
    """→ [ingresso, letti, scritti a 1 ora, scritti a 5 minuti, uscita], token veri (C497).
    Senza il dettaglio `cache_creation` tutto lo scritto conta a 1 ora (in cloud lo è sempre)."""
    g = [0, 0, 0, 0, 0]
    for u in usi:
        tot = int(u.get('cache_creation_input_tokens') or 0)
        d = u.get('cache_creation')
        cinque = min(tot, int(d.get('ephemeral_5m_input_tokens') or 0)) if isinstance(d, dict) else 0
        g[0] += int(u.get('input_tokens') or 0)
        g[1] += int(u.get('cache_read_input_tokens') or 0)
        g[2] += tot - cinque
        g[3] += cinque
        g[4] += int(u.get('output_tokens') or 0)
    return g


def costo_usd(g, motore):
    """→ dollari di listino; motore senza prezzo → None (mai un prezzo inventato)."""
    p = PREZZI.get(motore)
    if not p:
        return None
    return (g[0] * p[0] + g[1] * p[1] + g[2] * 2 * p[0] + g[3] * 1.25 * p[0] + g[4] * p[2]) / 1e6


def minuti(a, b):
    """→ minuti interi fra due ore della trascrizione (`timestamp`); una delle due manca o è rotta → None."""
    try:
        f = lambda s: datetime.datetime.fromisoformat(str(s).replace('Z', '+00:00'))
        return max(0, int((f(b) - f(a)).total_seconds() // 60))
    except Exception:
        return None


def conti_turno(tutte):
    """→ dict coi conti dell'ultimo turno (dall'ultimo messaggio che apre un turno alla fine)."""
    inizio = max((i for i, v in enumerate(tutte) if inizio_turno(v)), default=0)
    turno, prima = tutte[inizio:], tutte[:inizio]
    usi, tempi, visti = [], [], set()
    for v in turno:
        m = v.get('message') or {}
        u = m.get('usage')
        if v.get('type') != 'assistant' or not u:
            continue
        chiave = m.get('id') or id(v)
        if chiave in visti:
            continue
        visti.add(chiave)
        usi.append(u)
        tempi.append(v.get('timestamp'))
    def ctx(u):
        return sum(int(u.get(k) or 0) for k in ('input_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens'))
    ctx_prima, t_prima = 0, None
    for v in reversed(prima):
        u = (v.get('message') or {}).get('usage') if v.get('type') == 'assistant' else None
        if u:
            ctx_prima = ctx(u)
            t_prima = v.get('timestamp')
            break
    peso = sum(int(u.get('input_tokens') or 0) + 1.25 * int(u.get('cache_creation_input_tokens') or 0)
               + 0.1 * int(u.get('cache_read_input_tokens') or 0) + 5 * int(u.get('output_tokens') or 0) for u in usi)
    primo_turno = not any(inizio_turno(v) for v in prima)
    rifatte = [int(u.get('cache_creation_input_tokens') or 0) for u in (usi[1:] if primo_turno else usi)]
    rifatte = [n for n in rifatte if n >= SCADUTA]
    # C497: ogni ripartenza = [contesto in migliaia, minuti dalla risposta prima, 0 a inizio turno · 1 dentro il turno]
    fredde = [[ctx(u) // 1000, minuti(tempi[i - 1] if i else t_prima, tempi[i]), 1 if i else 0]
              for i, u in enumerate(usi)
              if not (primo_turno and i == 0) and int(u.get('cache_creation_input_tokens') or 0) >= SCADUTA]
    chiamate, grandi = {}, []
    aiutanti, strumenti, errori, scritti, motore = 0, 0, 0, [], ''
    for v in turno:
        m = v.get('message') or {}
        if v.get('type') == 'assistant' and m.get('model') and not str(m.get('model')).startswith('<'):
            motore = nome_motore(m.get('model'))
    for v in turno:
        c = (v.get('message') or {}).get('content')
        if not isinstance(c, list):
            continue
        for b in c:
            if not isinstance(b, dict):
                continue
            if b.get('type') == 'tool_use':
                nome = str(b.get('name', ''))
                k = nome + json.dumps(b.get('input'), sort_keys=True, ensure_ascii=False)
                chiamate[k] = chiamate.get(k, 0) + 1
                strumenti += 1
                if nome in ('Agent', 'Task'):
                    aiutanti += 1
                if nome in ('Edit', 'Write', 'NotebookEdit', 'MultiEdit'):
                    ing = b.get('input') or {}
                    scritti.append(str(ing.get('file_path') or ing.get('notebook_path') or ''))
            elif b.get('type') == 'tool_result':
                if b.get('is_error'):
                    errori += 1
                dentro = b.get('content')
                testo = dentro if isinstance(dentro, str) else json.dumps(dentro, ensure_ascii=False)
                if len(testo.encode('utf-8')) > USCITA_KB * 1024:
                    grandi.append(len(testo.encode('utf-8')) // 1024)
    return {
        'ctx_prima': ctx_prima, 'ctx_fine': ctx(usi[-1]) if usi else ctx_prima,
        'ctx_avvio': ctx(usi[min(len(usi), AVVIO_CHIAMATE) - 1]) if usi else ctx_prima,
        'uscita': sum(int(u.get('output_tokens') or 0) for u in usi), 'peso': round(peso),
        'ripetuti': [k for k, n in chiamate.items() if n >= RIPETUTO], 'grandi': grandi, 'aiutanti': aiutanti,
        'primo_turno': primo_turno, 'motore': motore, 'strumenti': strumenti, 'errori': errori, 'scritti': scritti,
        'scadute': len(rifatte), 'ricreati': sum(rifatte),
        'grezzi': grezzi_turno(usi), 'costo': costo_usd(grezzi_turno(usi), motore), 'fredde': fredde,
    }


def nome_motore(modello):
    m = str(modello or '').lower()
    return next((n for n in ('fable', 'opus', 'sonnet', 'haiku') if n in m), '')


def fable_leggero(c):
    return (c['motore'] == 'fable' and not c['scritti'] and c['strumenti'] <= FABLE_STRUMENTI
            and c['uscita'] < FABLE_USCITA)


def consiglio_motore(c, mot):
    """→ (tipo, riga) o None; mot = stato del motore della sessione (fila dei turni Fable leggeri, già detti)."""
    mot['fila'] = mot.get('fila', 0) + 1 if fable_leggero(c) else 0
    scelta = None
    if mot['fila'] >= FABLE_FILA:
        quando = (f"dalla prossima chat (qui il contesto è {c['ctx_fine'] // 1000}k: cambiare adesso lo rilegge tutto e costa di più)"
                  if c['ctx_fine'] > CAMBIO_ADESSO else 'anche adesso (contesto piccolo)')
        scelta = ('giu', f"⬇️ {mot['fila']} turni di fila su Fable senza file scritti e con poco ragionamento: per domande e "
                         f'letture basta Opus (Sonnet per le sole domande), {quando}')
    elif c['motore'] in ('sonnet', 'haiku') and any(p.endswith(ESTENSIONI_CODICE) for p in c['scritti']):
        scelta = ('su-codice', f"⬆️ codice scritto con {c['motore'].capitalize()}: per il codice meglio Opus")
    elif c['motore'] == 'opus' and c['errori'] >= OPUS_ERRORI:
        scelta = ('su-fable', f"⬆️ Opus in difficoltà ({c['errori']} errori di strumenti in un turno): se anche il prossimo "
                              'tentativo fallisce, meglio Fable')
    if not scelta or scelta[0] in mot.setdefault('detti', []):
        return None
    mot['detti'].append(scelta[0])
    return scelta


def anomalie(c):
    a = []
    if c['grandi']:
        a.append(f"{len(c['grandi'])} uscite di strumento enormi ({max(c['grandi'])} KB la più grande): leggere a pezzi (grep -n, sed -n)")
    if c['ripetuti']:
        nome = c['ripetuti'][0].split('{', 1)[0][:30]
        a.append(f"stesso comando {RIPETUTO}+ volte ({nome}): giro a vuoto")
    avvio = c.get('ctx_avvio', c['ctx_fine'])
    crescita = c['ctx_fine'] - (avvio if c['primo_turno'] else c['ctx_prima'])
    if c['primo_turno'] and avvio > AVVIO:
        a.append(f"avvio pesante: {avvio // 1000}k token dopo le letture d'avvio (tetto {AVVIO // 1000}k)")
    elif crescita > CRESCITA_TURNO:
        a.append(f"un turno ha aggiunto {crescita // 1000}k token al contesto")
    if c['uscita'] > USCITA_TURNO:
        a.append(f"{c['uscita'] // 1000}k token scritti in un turno")
    if c['aiutanti'] > (AIUTANTI_FABLE if c['motore'] == 'fable' else AIUTANTI):
        a.append(f"{c['aiutanti']} aiutanti in un turno")
    return a


def cartella_consumo():
    """C434: il totale si scrive dentro .git (fuori dai file del progetto: niente «modifiche non salvate» a ogni fine
    turno); la scorta lo copia in archivio/consumo/ nel suo commit, e arriva nel ramo unendo la scorta. Senza .git
    (prove), archivio/consumo/ come prima."""
    gitdir = os.path.join(progetto(), '.git')
    if os.path.isdir(gitdir):
        return os.path.join(gitdir, 'consumo')
    return os.path.join(progetto(), 'archivio', 'consumo')


def leggi_totale(dati):
    """→ (file, totale del giorno della sessione) da <cartella_consumo>/<data>-<sessione>.json."""
    nome = os.path.join(cartella_consumo(), f'{oggi()}-{sessione(dati)}.json')
    try:
        with open(nome, encoding='utf-8') as f:
            return nome, json.load(f)
    except Exception:
        return nome, {'account': account(), 'sessione': sessione(dati), 'giorno': oggi(), 'turni': 0, 'peso': 0,
                      'uscita': 0, 'contesto_max': 0, 'anomalie': []}


def scrivi_totale(nome, tot):
    if a_mano():
        return
    try:
        os.makedirs(os.path.dirname(nome), exist_ok=True)
        with open(nome, 'w', encoding='utf-8') as f:
            json.dump(tot, f, ensure_ascii=False, indent=0)
    except Exception:
        pass


ERRORI_HOOK = ('hook_non_blocking_error', 'hook_error_during_execution')  # C469 voce 8: hook rotto, non più muto


def nome_blocco(a):
    """Chi ha bloccato: il file .py dell'hook (dal comando), sennò l'evento; tempo scaduto = evento e numero del comando."""
    if a.get('type') == 'hook_cancelled':
        n = re.search(r'(\d+)\s*$', str(a.get('command') or ''))
        return f"{a.get('hookEvent') or a.get('hookName') or '?'} {n.group(1) if n else '?'} · tempo scaduto"
    errore = a.get('blockingError')
    comando = errore.get('command') if isinstance(errore, dict) else a.get('command')
    file_hook = re.findall(r'[\w-]+\.py', str(comando or ''))
    nome = file_hook[-1] if file_hook else str(a.get('hookName') or a.get('hookEvent') or '?')
    return nome + ' · errore' if a.get('type') in ERRORI_HOOK else nome


STOP_FEEDBACK = re.compile(r'\[command hook (\d+)\]:\s*([^\n]*)')


def ora_italiana(v):
    """«HH:MM» italiana dal timestamp UTC della voce («??» se manca): per leggere un blocco accanto ai messaggi."""
    try:
        from zoneinfo import ZoneInfo
        t = datetime.datetime.fromisoformat(str(v.get('timestamp')).replace('Z', '+00:00'))
        return t.astimezone(ZoneInfo('Europe/Rome')).strftime('%H:%M')
    except Exception:
        return '??'


def blocchi_dello_stop(v):
    """[(numero dell'hook, testo)] di un messaggio di sistema «Stop hook feedback» (isMeta: mai uno di Mario)."""
    if v.get('type') != 'user' or not v.get('isMeta'):
        return []
    testo = (v.get('message') or {}).get('content')
    if isinstance(testo, list):
        testo = ' '.join(str(p.get('text') or '') for p in testo if isinstance(p, dict))
    testo = str(testo or '')
    return STOP_FEEDBACK.findall(testo) if testo.startswith('Stop hook feedback') else []


def conta_blocchi(dati, tutte):
    """C469 fase 2 (rapporto 14 voce 2): blocchi degli hook (allegato «hook_blocking_error» della trascrizione) e hook
    fermati per tempo scaduto («hook_cancelled» con timedOut), contati una volta sola (id della voce nello stato) nel
    totale del giorno › «blocchi». Mai detti: servono a sapere quale hook blocca di più e a stringere le regole coi numeri."""
    st = leggi_stato(dati)
    visti = st.get('blocchi_visti') or []
    nuovi = {}
    esempi = {}  # Risparmio 17: ora e frase del blocco (gli ultimi 3 per voce), per trovare i blocchi falsi
    for v in tutte:
        a = v.get('attachment') if v.get('type') == 'attachment' else None
        if not isinstance(a, dict):
            # rodato dal vivo (10/11): i blocchi dello Stop arrivano come messaggio di sistema «Stop hook feedback»
            for i, (n, testo) in enumerate(blocchi_dello_stop(v)):
                chiave = f"{v.get('uuid') or ''}:{i}"
                if v.get('uuid') and chiave not in visti:
                    visti.append(chiave)
                    nome = f"Stop {n} · {' '.join(testo.split()[:5])}"
                    nuovi[nome] = nuovi.get(nome, 0) + 1
                    esempi.setdefault(nome, []).append(f"{ora_italiana(v)} · {' '.join(testo.split())[:200]}")
            continue
        if (a.get('type') not in ('hook_blocking_error',) + ERRORI_HOOK
                and not (a.get('type') == 'hook_cancelled' and a.get('timedOut'))):
            continue
        chiave = v.get('uuid') or hashlib.sha256(json.dumps(v, sort_keys=True).encode()).hexdigest()[:16]
        if chiave in visti:
            continue
        visti.append(chiave)
        n = nome_blocco(a)
        nuovi[n] = nuovi.get(n, 0) + 1
        esempi.setdefault(n, []).append(ora_italiana(v))
    if not nuovi:
        return
    st['blocchi_visti'] = visti[-500:]
    scrivi_stato(dati, st)
    nome, tot = leggi_totale(dati)
    blocchi = tot.setdefault('blocchi', {})
    for n, k in nuovi.items():
        blocchi[n] = blocchi.get(n, 0) + k
    tutti_es = tot.setdefault('esempi_blocchi', {})
    for n, righe in esempi.items():
        tutti_es[n] = (tutti_es.get(n, []) + righe)[-3:]
    scrivi_totale(nome, tot)


def salva_consumo(dati, c, nuove):
    """Totale del giorno della sessione in <cartella_consumo>/<data>-<sessione>.json."""
    nome, tot = leggi_totale(dati)
    tot['turni'] += 1
    # C469 A10: id della sessione in cloud (quello di docs/CHI-FA-COSA.md: dice la catena), aiutanti e strumenti del giorno
    remota = re.sub(r'[^A-Za-z0-9]', '', os.environ.get('CLAUDE_CODE_REMOTE_SESSION_ID', '').split('_', 1)[-1])[:12]
    if remota:
        tot['remota'] = remota
    tot['aiutanti'] = tot.get('aiutanti', 0) + c.get('aiutanti', 0)
    tot['strumenti'] = tot.get('strumenti', 0) + c.get('strumenti', 0)
    if c.get('motore'):
        motori = tot.setdefault('motori', {})
        motori[c['motore']] = motori.get(c['motore'], 0) + c['peso']
    if fable_leggero(c):
        tot['fable_leggeri'] = tot.get('fable_leggeri', 0) + 1
    tot['peso'] += c['peso']
    tot['bilancia'] = 2  # C497: il totale porta anche token veri e dollari di listino; `peso` resta com'era
    if c.get('motore') and c.get('grezzi'):
        g = tot.setdefault('grezzi', {}).setdefault(c['motore'], [0, 0, 0, 0, 0])
        for i, n in enumerate(c['grezzi']):
            g[i] += n
    if c.get('costo') is not None:
        tot['costo'] = round(tot.get('costo', 0) + c['costo'], 4)
        if c.get('ricreati'):
            tot['costo_fredde'] = round(tot.get('costo_fredde', 0) + c['ricreati'] * 2 * PREZZI[c['motore']][0] / 1e6, 4)
    if c.get('scadute'):  # C455: memoria veloce scaduta (attesa lunga): quante volte e quanti token riscritti
        tot['memoria_scaduta'] = tot.get('memoria_scaduta', 0) + c['scadute']
        tot['ricreati'] = tot.get('ricreati', 0) + c['ricreati']
        tot['fredde'] = ((tot.get('fredde') or []) + (c.get('fredde') or []))[-20:]
    tot['uscita'] += c['uscita']
    tot['contesto_max'] = max(tot['contesto_max'], c['ctx_fine'])
    tot['anomalie'] = (tot['anomalie'] + nuove)[-10:]
    if c.get('strumenti_nuovi'):  # C497: li dice l'avvio di domani, una volta per progetto
        tot['strumenti_nuovi'] = sorted(set(tot.get('strumenti_nuovi') or []) | set(c['strumenti_nuovi']))
    scrivi_totale(nome, tot)


def strumenti_noti():
    """→ i nomi di .claude/strumenti-noti.txt (uno per riga, # = commento); file assente → None (il guardiano tace)."""
    try:
        with open(os.path.join(progetto(), '.claude', 'strumenti-noti.txt'), encoding='utf-8') as f:
            return {r.strip() for r in f if r.strip() and not r.lstrip().startswith('#')}
    except Exception:
        return None


def nome_guardiano(n):
    """→ il nome da cercare nell'elenco: i connettori contano una volta sola (`mcp__<nome>__*`); '' = non si guarda
    (connettore col nome a caso, che cambia a ogni collegamento)."""
    if not n.startswith('mcp__') or n.startswith('mcp__claude-code-remote__'):
        return n
    pezzi = n.split('__')
    if len(pezzi) < 3 or re.match(r'[0-9a-f]{8}-', pezzi[1]):
        return ''
    return f'mcp__{pezzi[1]}__*'


def strumenti_nuovi(tutte):
    """C497: strumenti caricati per intero in questa chat (all'avvio: `prompt_snapshot`; emersi dopo:
    `deferred_tools_delta` › `surfacedNames`) che l'elenco non conosce. Senza elenco → []."""
    noti = strumenti_noti()
    if noti is None:
        return []
    visti = set()
    for v in tutte:
        a = v.get('attachment')
        if not isinstance(a, dict):
            continue
        if a.get('type') == 'prompt_snapshot':
            visti.update(str(t.get('name') or '') for t in a.get('tools') or [] if isinstance(t, dict))
        elif a.get('type') == 'deferred_tools_delta':
            visti.update(str(n) for n in a.get('surfacedNames') or [])
    return sorted({nome_guardiano(n) for n in visti} - noti - {''})


def fine(dati):
    tutte = voci(dati.get('transcript_path') or '')
    if not tutte:
        return 0
    conta_blocchi(dati, tutte)  # anche al secondo giro: il blocco dello Stop arriva dopo il primo
    if dati.get('stop_hook_active'):
        return 0
    c = conti_turno(tutte)
    c['strumenti_nuovi'] = strumenti_nuovi(tutte)
    nuove = anomalie(c)
    st = leggi_stato(dati)
    if nuove:
        st['da_dire'] = (st.get('da_dire') or []) + nuove
    mot = st.setdefault('motore', {})
    scelta = consiglio_motore(c, mot)
    if scelta:
        mot['da_dire'] = scelta[1]
    scrivi_stato(dati, st)
    salva_consumo(dati, c, nuove)
    return 0


IMPEGNI = {'low': 'Basso', 'medium': 'Medio', 'high': 'Alto', 'xhigh': 'Extra', 'max': 'Massimo'}


def motore_e_impegno(dati):
    """C458: «Opus · Medio» dell'ultimo turno (motore dall'ultima risposta nel registro, impegno dall'hook); '' se ignoto."""
    motore = ''
    registro = ''  # E332: impegno vero della sessione («effort» delle risposte nel registro)
    try:
        with open(dati.get('transcript_path') or '', 'rb') as f:
            f.seek(max(0, os.path.getsize(f.name) - 300_000))
            righe = f.read().decode('utf-8', 'ignore').splitlines()
        for r in reversed(righe):
            if '"assistant"' not in r:
                continue
            try:
                d = json.loads(r)
                m = (d.get('message') or {}).get('model')
            except Exception:
                continue
            if m and not str(m).startswith('<'):
                registro = str(d.get('effort') or '')
                motore = nome_motore(m).capitalize()
                break
    except Exception:
        pass
    livello = str((dati.get('effort') or {}).get('level') or '') or registro
    if not livello:  # all'invio del messaggio l'impegno non arriva e il registro non lo dice: quello del progetto
        try:
            with open(os.path.join(progetto(), '.claude', 'settings.json'), encoding='utf-8') as f:
                livello = str(json.load(f).get('effortLevel') or '')
        except Exception:
            livello = ''
    impegno = IMPEGNI.get(livello, livello)
    return ' · '.join(x for x in (motore, impegno) if x) if motore else ''


def due_tempi(prima, ora):
    """Regola «Fable pensa, Opus esegue» (Mario 09/11 18:30, kit 36.0): una riga quando la chat passa a Fable
    o da Fable a Opus; '' negli altri casi (zero token)."""
    if ora.startswith('Fable') and not prima.startswith('Fable'):
        return ('FABLE PENSA, OPUS ESEGUE: con Fable, a inizio di un lavoro grande, tempo 1 (skill fable-opus): tutti i '
                'pensieri difficili, piano salvato a pezzi su GitHub; i passi delicati (💎) li esegui tu; a piano pronto '
                '(cancello e sigillo) ti fermi e lo dici a Mario, oppure «resta a Fable» col perché. Domanda o lavoro '
                'piccolo: rispondi e basta.')
    if prima.startswith('Fable') and ora.startswith('Opus'):
        return ('FABLE PENSA, OPUS ESEGUE: da Fable a Opus = tempo 2 (skill fable-opus): se c\'è un piano di Fable, '
                'eseguilo dal primo passo aperto, senza rifare l\'analisi né cambiare le parti sigillate; i passi 💎 sono '
                'di Fable: saltali; alla fine il collaudo di Fable.')
    return ''


def inizio(dati):
    st = leggi_stato(dati)
    da_dire = st.get('da_dire') or []
    righe = []
    if da_dire:
        righe.append(f'SPRECO TOKEN ({CODICE}): ' + '; '.join(dict.fromkeys(da_dire))[:400] + '. Dillo a Mario in '
                     'UNA riga in «⚠️ ATTENZIONE» (cosa, quanto, perché) e da ora lavora nel modo che costa meno; niente altro.')
    mot = st.get('motore') or {}
    if mot.get('da_dire'):
        righe.append(f"MOTORE ({CODICE_MOTORE}): {mot.pop('da_dire')}. Dillo a Mario in UNA riga subito sotto «Ho capito» "
                     '(il motore lo cambia lui: /model o il menu del motore nell\'app).')
    # C458 (Mario 04/11): con che motore e impegno lavora la chat, UNA riga solo quando cambia (zero token se no).
    ora = motore_e_impegno(dati)
    visto = st.get('visto') or ''
    if ora and ora != visto:
        righe.append(f'MOTORE E IMPEGNO (C458): questa chat lavora con {ora}. Scrivi a Mario UNA riga «🧠 {ora}» subito '
                     'sotto «Ho capito» (o in testa), solo in questa risposta.')
        tempi = due_tempi(visto, ora)
        if tempi:
            righe.append(tempi)
        visto = ora
    if righe:
        contesto('UserPromptSubmit', ' '.join(righe))
    # Risparmio 18: i blocchi già contati restano (azzerati, a ogni turno nuovo si ricontavano tutti)
    scrivi_stato(dati, {'chiamate': {}, 'detti': [], 'motore': mot, 'visto': visto,
                        'blocchi_visti': st.get('blocchi_visti') or []})
    return 0


# C469: campi dell'esito che Claude non legge. «bashEditDiff» = differenze dei file cambiati da un comando Bash (sed -i,
# git rm): 56-71 KB di falso «USCITA ENORME» su comandi con uscita corta (09/11, Risparmio 5 e 6).
NON_LETTI = {'bashEditDiff'}


def token_immagine(w, h):
    """Token visivi di un'immagine (documentazione Claude «Vision», letta 13/11/2026): uno ogni 28×28 px, tetto 4784."""
    return min(4784, -(-int(w) // 28) * -(-int(h) // 28))


def peso_uscita(r):
    """Byte del testo di un esito di strumento (stringhe dentro dizionari e liste), senza i campi NON_LETTI.
    E454 (Giri 70): un'immagine letta conta per i suoi PIXEL, non per il base64 (520×533 px = ~380 token, non 13k):
    la si converte nei byte di testo che costerebbero gli stessi token (1 KB ≈ 300 token)."""
    if isinstance(r, dict) and r.get('type') == 'image' and isinstance(r.get('file'), dict):
        m = r['file'].get('dimensions') or {}
        w, h = m.get('displayWidth') or m.get('originalWidth'), m.get('displayHeight') or m.get('originalHeight')
        if isinstance(w, int) and isinstance(h, int) and w > 0 and h > 0:
            return token_immagine(w, h) * 1024 // 300
    if isinstance(r, str):
        return len(r.encode('utf-8'))
    if isinstance(r, dict):
        return sum(peso_uscita(v) for k, v in r.items() if k not in NON_LETTI)
    if isinstance(r, list):
        return sum(peso_uscita(v) for v in r)
    return 0


def tool(dati):
    # C469 fase 2 (rapporto 13 M6): ogni aiutante conta i suoi comandi (aiutanti lanciati insieme fanno lo stesso primo Glob)
    k = (str(dati.get('agent_id') or '') + str(dati.get('tool_name', ''))
         + json.dumps(dati.get('tool_input'), sort_keys=True, ensure_ascii=False))
    h = hashlib.sha1(k.encode()).hexdigest()[:12]
    st = leggi_stato(dati)
    chiamate = st.setdefault('chiamate', {})
    chiamate[h] = chiamate.get(h, 0) + 1
    detti = st.setdefault('detti', [])
    righe = []
    if chiamate[h] >= RIPETUTO and h not in detti:
        detti.append(h)
        righe.append(f'SPRECO TOKEN ({CODICE}): stesso comando ({dati.get("tool_name")}) {chiamate[h]} volte in questo '
                     'turno. Fermati e cambia strada (dopo 2 tentativi falliti: cosa ho capito, cosa no, via nuova).')
    # C469 B3: un esito enorme si rilegge a ogni chiamata fino alla fine della sessione (57 oltre 40 KB in 7 giorni,
    # ≥12M token al mese): lo si dice SUBITO, non a fine turno; al massimo 2 volte per turno.
    risposta = dati.get('tool_response')
    # C469 fase 2 (rapporto 14 voce 11): l'esito di Write ed Edit è la differenza del file (structuredPatch,
    # originalFile): Claude non la legge; prima ogni Edit di un file grosso dava un falso «USCITA ENORME»
    kb = 0 if dati.get('tool_name') in ('Write', 'Edit', 'MultiEdit', 'NotebookEdit') else peso_uscita(risposta) // 1024
    if kb > USCITA_KB and st.get('grandi_detti', 0) < 2:
        st['grandi_detti'] = st.get('grandi_detti', 0) + 1
        campo = max(risposta, key=lambda k: peso_uscita(risposta[k])) if isinstance(risposta, dict) and risposta else 'testo'
        righe.append(f'USCITA ENORME ({CODICE}): {kb} KB (~{round(kb * 0.3)}k token, campo «{campo}»), riletta a ogni chiamata '
                     'fino alla fine della sessione. Da ora a pezzi: grep -n, sed -n, head; uscite lunghe in un file.')
    if righe:
        contesto('PostToolUse', ' '.join(righe))
    scrivi_stato(dati, st)
    return 0


def consumo_del_ramo():
    """E345 bis (Risparmio 22): i totali in archivio/consumo/ del ramo su GitHub, {nome: testo}. Una chat risvegliata da
    una sveglia ha la copia del ramo del giorno prima: l'11/11 ha ridato l'avviso già dato, coi conti di metà giornata.
    Fetch in un riferimento suo (mai quello che aggiorna avvio-check.py nello stesso momento); fallito → {}."""
    if os.environ.get('SPRECO_NO_GIT'):
        return {}
    import subprocess
    try:
        with open(os.path.join(progetto(), '.claude', 'ramo-di-lavoro.txt'), encoding='utf-8') as f:
            ramo = f.read().strip()
        rif, g = 'refs/spreco/ramo', ['git', '-C', progetto()]
        subprocess.run(g + ['fetch', '-q', '--no-write-fetch-head', 'origin', f'+{ramo}:{rif}'], capture_output=True, timeout=6)
        ls = subprocess.run(g + ['ls-tree', '--name-only', rif, 'archivio/consumo/'], capture_output=True, text=True, timeout=2)
        nomi = [n for n in ls.stdout.split() if n.endswith('.json')]
        if ls.returncode or not nomi:
            return {}
        r = subprocess.run(g + ['cat-file', '--batch'], input=''.join(f'{rif}:{n}\n' for n in nomi).encode(),
                           capture_output=True, timeout=3)
        uscita, pos, testi = r.stdout, 0, {}
        for n in nomi:
            fine = uscita.index(b'\n', pos)
            testa = uscita[pos:fine].split()
            pos = fine + 1
            if len(testa) == 3 and testa[1] == b'blob':
                testi[os.path.basename(n)] = uscita[pos:pos + int(testa[2])].decode('utf-8', 'replace')
                pos += int(testa[2]) + 1
        return testi
    except Exception:
        return {}


def avvio(_dati):
    ieri = (datetime.date.fromisoformat(oggi()) - datetime.timedelta(days=1)).isoformat()
    per_acc, motori, leggeri = {}, {}, 0
    costo, costo_fredde, scadute, totali, b2, dollari = 0.0, 0.0, 0, 0, 0, {}
    nuovi = set()
    nomi = {os.path.basename(n): n for n in glob.glob(os.path.join(progetto(), 'archivio', 'consumo', '*.json'))}
    remoti = consumo_del_ramo()  # E345 bis: il ramo su GitHub vince sulla copia locale (più nuovo), .git/consumo su tutti
    nomi.update({n: None for n in remoti})
    # C455 (Risparmio 19): nel ramo c'è già il totale di oggi di un'altra sessione → oggi l'avviso l'ha già avuto
    # (e detto a Mario) un'altra chat: muto. Prima arrivava a ogni sessione nuova (42 il 10/11), ripetuto ogni volta.
    # Una sessione nata ieri e ancora accesa dopo mezzanotte l'avviso non l'ha avuto: non conta (stesso codice nel nome).
    di_ieri = {n[11:-5] for n in nomi if n.startswith(ieri)}
    if any(n.startswith(oggi()) and n[11:-5] not in di_ieri for n in nomi):
        return 0
    nomi.update({os.path.basename(n): n for n in glob.glob(os.path.join(cartella_consumo(), '*.json'))})
    sessioni, pesanti = {}, {}
    for base, nome in nomi.items():
        giorno = base[:10]
        if giorno > ieri or giorno < (datetime.date.fromisoformat(ieri) - datetime.timedelta(days=7)).isoformat():
            continue
        try:
            if nome is None or (base in remoti and os.path.dirname(nome) != cartella_consumo()):
                t = json.loads(remoti[base])
            else:
                with open(nome, encoding='utf-8') as f:
                    t = json.load(f)
        except Exception:
            continue
        g = per_acc.setdefault(t.get('account', 'ignoto'), {})
        g[giorno] = g.get(giorno, 0) + int(t.get('peso') or 0)
        chiave = (t.get('account', 'ignoto'), giorno)
        sessioni.setdefault(chiave, set()).add(t.get('sessione') or base[11:-5])
        pesanti[chiave] = pesanti.get(chiave, 0) + sum(1 for a in t.get('anomalie') or [] if 'avvio pesante' in str(a))
        leggeri += int(t.get('fable_leggeri') or 0)
        for n, p in (t.get('motori') or {}).items():
            motori[n] = motori.get(n, 0) + int(p or 0)
        totali += 1
        if t.get('bilancia') == 2:  # C497: totale con token veri e dollari di listino
            b2 += 1
            costo += float(t.get('costo') or 0)
            costo_fredde += float(t.get('costo_fredde') or 0)
            scadute += int(t.get('memoria_scaduta') or 0)
            for n, g in (t.get('grezzi') or {}).items():
                dollari[n] = dollari.get(n, 0) + (costo_usd(g, n) or 0)
        if giorno == ieri:
            nuovi.update(t.get('strumenti_nuovi') or [])
    righe = []
    for acc, giorni in per_acc.items():
        prima = [v for d, v in giorni.items() if d < ieri]
        if ieri in giorni and len(prima) >= 3:
            media = sum(prima) / len(prima)
            if media and giorni[ieri] > CONTO_ACCOUNT * media:
                # Più chat o chat più care? Sessioni e peso a sessione, ieri contro i giorni prima (dati già qui:
                # la chat non rilegge archivio/consumo).
                n_ieri = len(sessioni.get((acc, ieri)) or ()) or 1
                n_prima = sum(len(sessioni.get((acc, d)) or ()) for d in giorni if d < ieri) or len(prima)
                righe.append(f'account {acc}: ieri {giorni[ieri] / media:.1f} volte la sua media ({giorni[ieri] // 1000}k contro '
                             f'{int(media) // 1000}k token equivalenti): {n_ieri} sessioni (prima {n_prima / len(prima):.0f} '
                             f'al giorno), {giorni[ieri] // n_ieri // 1000}k a sessione (prima {sum(prima) // n_prima // 1000}k), '
                             f'{pesanti.get((acc, ieri), 0)} avvii pesanti')
    testo = []
    if righe:
        testo.append(f'SPRECO TOKEN ({CODICE}): ' + '; '.join(righe) + '. Una riga a Mario nel primo messaggio, '
                     'con l\'effetto (più chat o chat più care); i dati sono già qui, niente letture di archivio/consumo. '
                     'Le altre sessioni di oggi non lo ripetono.')
    segno = os.path.join(cartella_consumo(), f'pagella-{oggi()}')
    if leggeri >= PAGELLA_LEGGERI and not os.path.exists(segno):
        in_dollari = bool(totali) and b2 == totali and sum(dollari.values()) > 0  # C497: tutta la finestra ha i dollari
        pesi = {n: p for n, p in dollari.items() if p > 0} if in_dollari else motori
        tot = sum(pesi.values()) or 1
        quote = ', '.join(f'{n.capitalize()} {int(p * 100 // tot)}%' for n, p in sorted(pesi.items(), key=lambda x: -x[1]))
        cosa = 'spesa a listino per motore' if in_dollari else 'token per motore'
        testo.append(f'PAGELLA MOTORI ({CODICE_MOTORE}): negli ultimi 7 giorni {leggeri} turni su Fable erano domande o '
                     f'letture semplici (bastava Opus o Sonnet); {cosa}: {quote}. Una riga a Mario nel primo messaggio.')
        try:
            if not a_mano():
                os.makedirs(cartella_consumo(), exist_ok=True)
                open(segno, 'w').close()
        except Exception:
            pass
    segno_f = os.path.join(cartella_consumo(), f'fredde-{oggi()}')
    if (datetime.date.fromisoformat(oggi()).isoweekday() == 1 and costo > 0 and costo_fredde / costo >= 0.05
            and not os.path.exists(segno_f)):  # C497: solo il lunedì; fra sessioni diverse lo ferma l'uscita in alto
        testo.append(f'RIPARTENZE A FREDDO (C497): negli ultimi 7 giorni la memoria veloce è scaduta {scadute} volte con la '
                     f'chat grossa: {int(costo_fredde * 100 // costo)} % della spesa a listino. Una riga a Mario nel primo '
                     'messaggio, con l\'effetto (spesa di chat lasciate ferme più di un\'ora).')
        try:
            if not a_mano():
                os.makedirs(cartella_consumo(), exist_ok=True)
                open(segno_f, 'w').close()
        except Exception:
            pass
    noti = strumenti_noti()
    nuovi = sorted(nuovi - noti) if noti is not None else []
    if nuovi:  # C497: ieri visti da qualche chat e non ancora nell'elenco; si ripete ogni mattina finché non ci sono
        testo.append(f'STRUMENTI NUOVI (C497): ieri la piattaforma ha caricato per intero strumenti che il kit non conosce: '
                     f'{", ".join(nuovi[:8])}. Pesano su ogni chat: una riga a Mario nel primo messaggio; col suo ok la chat '
                     'del kit li vieta in .claude/settings.json (permissions.deny) se non servono e in ogni caso li aggiunge '
                     'a .claude/strumenti-noti.txt.')
    if testo:
        contesto('SessionStart', ' '.join(testo))
    return 0


def main():
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    modo = (sys.argv[1:] or [''])[0]
    return {'inizio': inizio, 'tool': tool, 'fine': fine, 'avvio': avvio}.get(modo, lambda d: 0)(dati)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
