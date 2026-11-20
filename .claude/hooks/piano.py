#!/usr/bin/env python3
"""C487 R2 · Sigillo e fermo del piano «Fable pensa, Opus esegue» (skill `fable-opus`; piano di Fable, Giri 45).

Il piano vive in `docs/lavori-in-corso/<C>.md`, nell'ultimo blocco `## Piano`. Il sigillo è una riga del blocco:
`Sigillo: <impronta> · Fable · gg/mm hh:mm · base <commit> · N passi (M 🧠, K 💎)`. L'impronta guarda solo le parti
pensate da Fable: non le spunte, il titolo, il Diario, «❓ Per Fable» e il Collaudo.
Comandi a mano (`python3 -I .claude/hooks/piano.py <modo> <file>`):
  pronto <file>     controlla la forma e mette il sigillo (solo Fable: con un altro motore il comando è negato)
  controlla <file>  0 = sigillo valido · 1 = ROTTO · 2 = senza sigillo
  stato <file>      una riga: «senza sigillo» | «pronto · N passi aperti · primo: <nome>» | «rotto»
E500: `stato`, `controlla` e `inizio` (al cambio di motore nella chat del sigillo) aggiungono una riga «⚠️ E500» se, a
esecuzione non partita, dei file nominati dal piano sono cambiati dalla base del sigillo (carte e `archivio/` no).
Hook (JSON da stdin): `inizio` (UserPromptSubmit), `prima` (PreToolUse › Bash: nega il push), `scritto` (PostToolUse ›
Edit|Write: avvisa). Motore di adesso letto come `fermo-fable.py`. Esce sempre 0 negli hook e tace su ogni errore suo.
Stato in `.git/piano-pronto-<sessione>.json` e `.git/piano-diamanti-<sessione>.json` (fuori dal repo).
Prova: python3 -I tools/test-piano.py
"""
import datetime as dt
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import time

SILENZIO = 'aspetta'  # a piano pronto, Mario muto per MINUTI: 'opus' (sessione nuova) · 'aspetta' · 'fable' (esegue Fable)
MINUTI = 20

APERTE = ('diario', 'per fable', 'collaudo')
SIGILLO = re.compile(r'^Sigillo: ([0-9a-f]{12})\b')
SEZIONI = ('parole di mario', 'già deciso', 'non toccare', 'pensieri difficili', 'dritte', 'passi', 'domande per mario',
           'strade scartate', 'diario', 'per fable', 'collaudo')
SEGNI = ('🧠', '🔧', '💎')
SPUNTA = re.compile(r'^- \[([ xX])\] ')
PUSH = re.compile(r'(^|[;&|(]\s*)git\s+push\b')  # come kit-push.py: il comando vero, non la parola in un testo
# Solo il comando vero (python … piano.py pronto): «piano.py: pronto» in un messaggio di commit fermava il commit (Giri 57).
PRONTO_CMD = re.compile(r'\bpython3?\b[^\n;&|]*?piano\.py["\']?\s+pronto\b')
CARTELLA = 'docs/lavori-in-corso/'
SBLOCCO_DIARIO = 'Passi 💎 a Opus, scelto da Mario'
SCELTA_FABLE = ('vai con fable', 'continua con fable', 'resta fable', 'eseguilo tu')
BASE = re.compile(r' · base ([0-9a-f]{7,40}) · ')
PERCORSI = re.compile(r'[\w.-]+(?:/[\w.-]+)+\.\w{1,5}')  # un percorso scritto nel piano: almeno una «/» e l'estensione
FUORI_PIANO = ('docs/', 'archivio/')  # carte e foto cambiano sempre: non sono «file del piano»


def blocco(testo):
    righe = testo.splitlines()
    inizi = [i for i, r in enumerate(righe) if r.startswith('## Piano')]
    if not inizi:
        return []
    a = inizi[-1]
    b = next((i for i in range(a + 1, len(righe)) if righe[i].startswith('## ')), len(righe))
    return righe[a:b]


def impronta(righe):
    tenute, aperta = [], False
    for i, r in enumerate(righe):
        if i == 0 or r.startswith('Sigillo:'):
            continue
        if r.startswith('### '):
            aperta = any(k in r.lower() for k in APERTE)
        if aperta:
            continue
        r = re.sub(r'^- \[[xX]\]', '- [ ]', r).rstrip()
        if r:
            tenute.append(r)
    return hashlib.sha256('\n'.join(tenute).encode('utf-8')).hexdigest()[:12]


# ---------- lettura del piano ----------

def sigillo(righe):
    """L'impronta scritta nel sigillo, o None (ogni altra riga «Sigillo: …» vale «senza sigillo»)."""
    for r in righe:
        m = SIGILLO.match(r)
        if m:
            return m.group(1)
    return None


def riga_sigillo(righe):
    return next((r.rstrip() for r in righe if SIGILLO.match(r)), None)


def sezione(righe, chiave):
    """Le righe della sottosezione `### ` il cui titolo contiene `chiave` (senza il titolo)."""
    dentro, fuori = False, []
    for r in righe:
        if r.startswith('### '):
            if dentro:
                break
            dentro = chiave in r.lower()
            continue
        if dentro:
            fuori.append(r)
    return fuori


def sezione_passi(righe):
    dentro, fuori = False, []
    for r in righe:
        if r.startswith('### '):
            if dentro:
                break
            dentro = r.startswith('### Passi')
            continue
        if dentro:
            fuori.append(r)
    return fuori


def lista_passi(righe):
    """I passi della sottosezione «### Passi»: fatto, segno, nome (prima parola dopo il segno), testo."""
    tutti = []
    for r in sezione_passi(righe):
        m = SPUNTA.match(r)
        if not m:
            continue
        resto = r[m.end():]
        segno = next((s for s in SEGNI if resto.startswith(s)), '')
        parole = resto[len(segno):].split()  # senza segno: la prima parola dopo la spunta (l'errore lo dice a parte)
        tutti.append({'fatto': m.group(1) != ' ', 'segno': segno, 'nome': parole[0] if parole else '', 'testo': r})
    return tutti


def dipendenze(passo, nomi):
    m = re.search(r'dipende da:(.*?)(?: · |$)', passo['testo'])
    if not m:
        return []
    return [n for n in nomi if n and re.search(r'(?<!\w)' + re.escape(n) + r'(?!\w)', m.group(1))]


def primo_dal_titolo(righe):
    m = re.search(r'Primo passo aperto: (\S+)', righe[0] if righe else '')
    return m.group(1) if m else ''


def errori_forma(righe):
    if not righe:
        return ['nel file non c\'è un blocco «## Piano»']
    errori = []
    titoli = [r.lower() for r in righe if r.startswith('### ')]
    for k in SEZIONI:
        if not any(k in t for t in titoli):
            errori.append(f'manca la sottosezione «### …» con «{k}» nel titolo')
    tutti = lista_passi(righe)
    nomi = [p['nome'] for p in tutti]
    aperti = {p['nome'] for p in tutti if not p['fatto']}
    if not tutti:
        errori.append('nessun passo in «### Passi»')
    for p in tutti:
        chi = p['nome'] or p['testo'][:40]
        if not p['segno']:
            errori.append(f'passo senza segno (🧠, 🔧 o 💎) subito dopo la spunta: {p["testo"][:60]}')
            continue
        if p['segno'] == '💎' and 'perché:' not in p['testo']:
            errori.append(f'passo 💎 {chi} senza «perché:»')
        if p['segno'] == '💎' and not p['fatto'] and not (set(dipendenze(p, nomi)) & aperti):
            errori.append(f'passo 💎 {chi} aperto che non aspetta nessun passo aperto: lo esegue Fable prima del sigillo')
        if not p['fatto'] and ('prova:' not in p['testo'] or 'fatto quando:' not in p['testo']):
            errori.append(f'passo aperto {chi} senza «prova:» o senza «fatto quando:»')
    primo = primo_dal_titolo(righe)
    if not primo:
        errori.append('nel titolo manca «Primo passo aperto: <nome>»')
    elif primo not in aperti:
        errori.append(f'«Primo passo aperto: {primo}» non è un passo aperto')
    stato = righe[0].split('Stato:', 1)
    if len(stato) == 2 and 'in corso' in stato[1].lower():
        errori.append('nel titolo, dopo «Stato:», c\'è «in corso»')
    if any(r.startswith('- [ ]') for r in sezione(righe, 'pensieri difficili')):
        errori.append('in «Pensieri difficili» c\'è ancora una riga «- [ ]»')
    if not any(r.startswith('Lettura a freddo:') for r in righe):
        errori.append('manca la riga «Lettura a freddo: …»')
    return errori


# ---------- aiuti ----------

def progetto():
    return os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()


def pulito(sessione):
    return re.sub(r'[^A-Za-z0-9_-]', '', str(sessione or ''))[:64]


def file_git(nome, sessione):
    s = pulito(sessione)
    return os.path.join(progetto(), '.git', f'{nome}-{s}.json') if s else ''


def leggi_json(percorso):
    try:
        with open(percorso, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def scrivi_json(percorso, dati):
    try:
        with open(percorso, 'w', encoding='utf-8') as f:
            json.dump(dati, f, ensure_ascii=False)
    except Exception:
        pass


def ora_italiana():
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo('Europe/Rome')).strftime('%d/%m %H:%M')
    except Exception:
        return dt.datetime.now(dt.timezone.utc).strftime('%d/%m %H:%M UTC')


def git(*a):
    try:
        r = subprocess.run(['git', *a], cwd=progetto(), capture_output=True, text=True, timeout=5)
        return r.stdout if r.returncode == 0 else None
    except Exception:
        return None


def ramo_origin():
    ramo = (git('rev-parse', '--abbrev-ref', 'HEAD') or '').strip()
    if not ramo or ramo == 'HEAD' or git('rev-parse', '--verify', '-q', f'origin/{ramo}') is None:
        return ''
    return f'origin/{ramo}'


def su_origin(origin, rel):
    return git('show', f'{origin}:{rel}') if origin else None


def fermo_fable():
    spec = importlib.util.spec_from_file_location(
        'fermo_fable', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fermo-fable.py'))
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def motore(dati, ff):
    return ff.nome(ff.motore_ora(dati, ff.leggi(dati)))


def leggi_testo(percorso):
    try:
        with open(percorso, encoding='utf-8') as f:
            return f.read()
    except Exception:
        return None


def diamanti_di_troppo(rel, testo, origin):
    """Nomi dei passi 💎 spuntati qui e aperti su origin (file che su origin non c'è → nessuno)."""
    vecchio = su_origin(origin, rel)
    if vecchio is None:
        return []
    aperti_prima = {p['nome'] for p in lista_passi(blocco(vecchio)) if p['segno'] == '💎' and not p['fatto']}
    return [p['nome'] for p in lista_passi(blocco(testo)) if p['segno'] == '💎' and p['fatto'] and p['nome'] in aperti_prima]


def sbloccati(dati, righe):
    f = file_git('piano-diamanti', dati.get('session_id'))
    if f and os.path.isfile(f):
        return True
    return any(SBLOCCO_DIARIO in r for r in sezione(righe, 'diario'))


def miei_piani(origin):
    """File di `docs/lavori-in-corso/` cambiati rispetto al punto comune con origin, più i non salvati e i nuovi."""
    base = (git('merge-base', origin, 'HEAD') or '').strip()
    if not base:
        return []
    cambiati = (git('diff', '--name-only', base) or '').splitlines()
    cambiati += (git('ls-files', '--others', '--exclude-standard') or '').splitlines()
    return sorted({f for f in cambiati if f.startswith(CARTELLA) and f.endswith('.md')})


# ---------- E500: file del piano cambiati dalla base del sigillo ----------

def partita(righe, percorso):
    """True se dal sigillo è stato spuntato almeno un passo. Confronto col file com'era nel commit del sigillo;
    se quel commit non si trova (sigillo non ancora salvato, storia corta): partita = un passo 🧠 o 🔧 spuntato."""
    passi = lista_passi(righe)
    fatti = {p['nome'] for p in passi if p['fatto']}
    rel = os.path.relpath(os.path.abspath(percorso), progetto())
    nato = (git('log', '-1', '--format=%H', '-S' + (riga_sigillo(righe) or ''), '--', rel) or '').strip()
    allora = git('show', f'{nato}:{rel}') if nato else None
    if allora is not None:
        return fatti != {p['nome'] for p in lista_passi(blocco(allora)) if p['fatto']}
    return any(p['fatto'] and p['segno'] != '💎' for p in passi)


def avviso_base(righe, percorso):
    """Una riga se, a esecuzione non partita, la base del sigillo non c'è in questa copia o dei file nominati dal
    piano sono cambiati dopo (un'altra chat: C516, «Kit 41» preso 2 minuti dopo il sigillo). Sennò ''."""
    m = BASE.search(riga_sigillo(righe) or '')
    if not m or partita(righe, percorso):
        return ''
    base = m.group(1)
    if git('cat-file', '-e', base + '^{commit}') is None:
        return (f'⚠️ E500: la base del sigillo ({base}) non è nella storia di questa copia: non so dire se i file del '
                'piano sono cambiati. `git fetch --deepen=300 origin` e rilancia, prima del primo passo.')
    testo = '\n'.join(righe)
    nominati = {t[2:] if t.startswith('./') else t for t in PERCORSI.findall(testo)}

    def nominato(f):
        if '/' not in f:  # file in cima al progetto (`firestore.rules:738`): il nome intero, non un pezzo di percorso
            return bool(re.search(r'(?<![\w/.-])' + re.escape(f) + r'(?![\w/-])', testo))
        return any(f == t or f.endswith('/' + t) for t in nominati)

    cambiati = sorted(f for f in (git('diff', '--name-only', f'{base}..HEAD') or '').splitlines()
                      if f and not f.startswith(FUORI_PIANO) and nominato(f))
    if not cambiati:
        return ''
    elenco = ', '.join(cambiati[:6]) + (f' e altri {len(cambiati) - 6}' if len(cambiati) > 6 else '')
    return (f'⚠️ E500: {len(cambiati)} file nominati dal piano sono cambiati dalla base del sigillo ({base}): {elenco}. '
            f'Prima del primo passo guardali (`git diff {base}..HEAD -- <file>`): se toccano un passo, riga in '
            '«❓ Per Fable» e Fable risigilla; sennò una riga nel Diario e avanti.')


# ---------- comandi a mano ----------

def pronto(percorso):
    testo = leggi_testo(percorso)
    if testo is None:
        print(f'File non trovato: {percorso}')
        return 1
    righe = blocco(testo)
    errori = errori_forma(righe)
    if errori:
        for e in errori:
            print(e)
        return 1
    tutti = lista_passi(righe)
    n, m, k = len(tutti), sum(p['segno'] == '🧠' for p in tutti), sum(p['segno'] == '💎' for p in tutti)
    base = (git('rev-parse', 'HEAD') or '').strip()[:7] or '-------'
    nuova = f'Sigillo: {impronta(righe)} · Fable · {ora_italiana()} · base {base} · {n} passi ({m} 🧠, {k} 💎)'
    tutte = testo.splitlines()
    a = max(i for i, r in enumerate(tutte) if r.startswith('## Piano'))
    b = a + len(righe)
    vecchia = next((i for i in range(a + 1, b) if tutte[i].startswith('Sigillo:')), None)
    if vecchia is None:
        tutte.insert(a + 1, nuova)
    else:
        tutte[vecchia] = nuova
    with open(percorso, 'w', encoding='utf-8') as f:
        f.write('\n'.join(tutte) + ('\n' if testo.endswith('\n') else ''))
    stato = file_git('piano-pronto', os.environ.get('CLAUDE_CODE_SESSION_ID'))
    if stato:
        scrivi_json(stato, {'file': percorso, 'quando': int(time.time()), 'scelta': ''})
    aperti = sum(1 for p in tutti if not p['fatto'] and p['segno'] != '💎')
    fatti_f = sum(1 for p in tutti if p['fatto'] and p['segno'] == '💎')
    coda = sum(1 for p in tutti if not p['fatto'] and p['segno'] == '💎')
    print(f'Sigillato: {aperti} passi per Opus, {fatti_f} delicati già fatti da Fable, {coda} in coda a Fable. '
          'Ora: commit, push, riga in Aspetta Mario, titolo giallo, messaggio «Piano di lavoro pronto»')
    if aperti < 3:
        print(f'Solo {aperti} passi per Opus: conviene il cambio? («Resta a Fable», skill fable-opus)')
    return 0


def controlla(percorso):
    testo = leggi_testo(percorso)
    righe = blocco(testo or '')
    scritto = sigillo(righe)
    if not scritto:
        print('Senza sigillo.')
        return 2
    if impronta(righe) == scritto:
        print('Sigillo valido.')
        avviso = avviso_base(righe, percorso)
        if avviso:
            print(avviso)
        return 0
    print(f'ROTTO: il piano è cambiato dopo il sigillo. Cosa è cambiato: git log -1 --format=%h -S\'Sigillo: {scritto}\' '
          f'-- {percorso}, poi git diff <quel commit> -- {percorso}')
    return 1


def stato(percorso):
    righe = blocco(leggi_testo(percorso) or '')
    scritto = sigillo(righe)
    if not scritto:
        print('senza sigillo')
    elif impronta(righe) != scritto:
        print('rotto')
    else:
        aperti = [p['nome'] for p in lista_passi(righe) if not p['fatto']]
        print(f'pronto · {len(aperti)} passi aperti · primo: {primo_dal_titolo(righe) or (aperti[0] if aperti else "—")}')
        avviso = avviso_base(righe, percorso)
        if avviso:
            print(avviso)
    return 0


# ---------- hook ----------

def scritto(dati):
    percorso = (dati.get('tool_input') or {}).get('file_path') or ''
    if not percorso:
        return ''
    rel = os.path.relpath(os.path.abspath(percorso), os.path.abspath(progetto())).replace(os.sep, '/')
    if not rel.startswith(CARTELLA):
        return ''
    testo = leggi_testo(os.path.join(progetto(), rel))
    if testo is None:
        return ''
    righe = blocco(testo)
    ff = fermo_fable()
    fable = motore(dati, ff) == 'fable'
    avvisi = []
    scritto_ = sigillo(righe)
    if scritto_ and impronta(righe) != scritto_:
        if fable:
            avvisi.append('Piano cambiato dopo il sigillo: a modifiche finite rifai `piano.py pronto`.')
        else:
            avvisi.append(f'⛔ PIANO SIGILLATO (C487): hai cambiato una parte pensata da Fable in {rel}. Rimetti il testo '
                          'com\'era (il push sarà negato) e scrivi il dubbio in «❓ Per Fable». Puoi scrivere solo spunte, '
                          '«Primo passo aperto», Diario, «❓ Per Fable» e Collaudo.')
    if not fable:
        troppi = diamanti_di_troppo(rel, testo, ramo_origin())
        if troppi and not sbloccati(dati, righe):
            avvisi.append(f'⛔ PASSO 💎 (C487): il passo {", ".join(troppi)} di {rel} è di Fable: non eseguirlo e togli la '
                          'spunta (il push sarà negato). Saltalo, coi passi che ne dipendono. Lo sblocca solo Mario '
                          'scrivendo in questa chat «tutto con Opus».')
    if not avvisi:
        return ''
    return json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse', 'additionalContext': ' '.join(avvisi)}},
                      ensure_ascii=False)


def nega(motivo):
    return json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                              'permissionDecisionReason': motivo}}, ensure_ascii=False)


def prima(dati):
    cmd = (dati.get('tool_input') or {}).get('command') or ''
    push, sigilla = bool(PUSH.search(cmd)), bool(PRONTO_CMD.search(cmd))
    if not push and not sigilla:
        return ''
    ff = fermo_fable()
    if motore(dati, ff) == 'fable':
        return ''
    if sigilla:
        return nega('Il sigillo lo mette solo Fable: scrivi in «❓ Per Fable».')
    origin = ramo_origin()
    if not origin:
        return ''
    for rel in miei_piani(origin):
        testo = leggi_testo(os.path.join(progetto(), rel))
        if testo is None:
            continue
        righe = blocco(testo)
        scritto_ = sigillo(righe)
        if scritto_ and impronta(righe) != scritto_:
            return nega(f'⛔ PIANO SIGILLATO (C487): in {rel} è cambiata una parte pensata da Fable dopo il sigillo '
                        f'(python3 -I .claude/hooks/piano.py controlla {rel}). Rimetti il testo com\'era e scrivi il '
                        'dubbio in «❓ Per Fable».')
        vecchio = su_origin(origin, rel)
        if vecchio is not None and riga_sigillo(blocco(vecchio)) != riga_sigillo(righe):
            return nega(f'⛔ PIANO SIGILLATO (C487): in {rel} la riga del sigillo è diversa da quella su GitHub: il '
                        'sigillo lo cambia solo Fable. Rimettila com\'era e scrivi il dubbio in «❓ Per Fable». Se l\'ha '
                        'messa Fable prima del cambio di motore (il commit non è ancora su GitHub): non toglierla, e '
                        'scrivi a Mario «push fermo per il sigillo messo da Fable e non ancora su GitHub: rimetti Fable '
                        'un momento e scrivimi «via» per il push».')
        troppi = diamanti_di_troppo(rel, testo, origin)
        if troppi and not sbloccati(dati, righe):
            nomi = ', '.join(troppi)
            return nega(f'⛔ Il passo 💎 {nomi} di {rel} è di Fable: togli la spunta e le sue modifiche dal push, oppure '
                        'Mario scrive in questa chat «tutto con Opus». Se lo ha spuntato Fable prima del cambio di motore '
                        '(la sua riga è nel Diario, il commit non è ancora su GitHub): non toglierla, e scrivi a Mario '
                        f'«push fermo per il passo 💎 {nomi}, fatto da Fable e non ancora su GitHub: rimetti Fable un '
                        'momento e scrivimi «via» per il push; oppure scrivimi «tutto con Opus»».')
    return ''


def inizio(dati):
    ff = fermo_fable()
    chi = motore(dati, ff)
    t = ff.ripulito(dati.get('prompt')).lower()
    testi = []
    if chi != 'fable' and 'tutto con opus' in t and len(t) <= 120 and '?' not in t:
        f = file_git('piano-diamanti', dati.get('session_id'))
        if f:
            scrivi_json(f, {'quando': int(time.time())})
            testi.append(f'💎 PIANO (C487): Mario ha scelto Opus anche per i passi 💎. Scrivi nel Diario «{SBLOCCO_DIARIO} '
                         f'{ora_italiana()}» ed eseguili per ultimi.')
    percorso = file_git('piano-pronto', dati.get('session_id'))
    st = leggi_json(percorso) if percorso else None
    if not isinstance(st, dict) or st.get('scelta'):
        return '\n'.join(testi)
    if chi != 'fable':
        try:
            os.remove(percorso)
        except Exception:
            pass
        # Qui parte l'esecuzione (Mario ha cambiato motore nella chat del sigillo): l'avviso E500, una volta sola.
        piano_ = os.path.join(progetto(), str(st.get('file') or ''))
        avviso = avviso_base(blocco(leggi_testo(piano_) or ''), piano_) if st.get('file') else ''
        if avviso:
            testi.append(avviso)
        return '\n'.join(testi)
    file = st.get('file') or 'del lavoro'
    # Collaudo C487 (B2): le stesse guardie di «tutto con opus» (testo corto, niente domanda), sennò
    # «se vai con Fable quanto costa?» spegneva il fermo contro la risposta 2 («aspetta me sempre»).
    if (len(t) <= 120 and '?' not in t and any(k in t for k in SCELTA_FABLE)) or re.fullmatch(r'(?:la )?2\.?', t.strip()):
        st['scelta'] = 'fable'
        scrivi_json(percorso, st)
        testi.append('▶️ PIANO (C487): Mario ha scelto Fable per eseguire. Scrivi nel Diario «Motore dell\'esecuzione: '
                     f'Fable, scelto da Mario {ora_italiana()}» ed esegui dal primo passo aperto.')
    elif time.time() - float(st.get('quando') or 0) >= MINUTI * 60 and SILENZIO in ('opus', 'fable'):
        st['scelta'] = 'silenzio'
        scrivi_json(percorso, st)
        if SILENZIO == 'opus':
            testi.append(f'⏰ PIANO PRONTO (C487): {MINUTI} minuti senza risposta di Mario. Se sei ancora Fable e non ha '
                         'scelto: passaggio di consegne col segno ▶️ PIANO PRONTO (skill consegne, `tools/consegne_piano.py`).')
        else:
            testi.append(f'⏰ PIANO PRONTO (C487): {MINUTI} minuti senza risposta di Mario: esegui tu con Fable dal primo '
                         'passo aperto e dillo a Mario.')
    else:
        testi.append(f'⏸ PIANO PRONTO (C487): il piano {file} è sigillato e Mario non ha ancora scelto il motore. Sei ancora '
                     'Fable: NON eseguire i passi. Se Mario chiede altro, rispondi a quello. Se dice «via» o simile: una '
                     'riga, «Sono ancora Fable: 1 · passo a Opus e riscrivo «via» (risparmi) · 2 · vai con Fable».')
    return '\n'.join(testi)


def main(argomenti):
    modo = argomenti[0] if argomenti else ''
    if modo in ('pronto', 'controlla', 'stato'):
        if len(argomenti) < 2:
            print(f'Uso: python3 -I .claude/hooks/piano.py {modo} <file del lavoro>')
            return 2
        return {'pronto': pronto, 'controlla': controlla, 'stato': stato}[modo](argomenti[1])
    try:
        dati = json.load(sys.stdin)
    except Exception:
        dati = {}
    try:
        uscita = {'inizio': inizio, 'prima': prima, 'scritto': scritto}.get(modo, lambda d: '')(dati if isinstance(dati, dict) else {})
        if uscita:
            print(uscita)
    except Exception:
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
