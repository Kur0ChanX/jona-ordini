#!/usr/bin/env python3
"""Giri fermi su GitHub (C476 P13b; E396, E398): il giro chiesto con un push è nato ed è partito, o va rilanciato a mano?

Uso:  python3 -I tools/giri-fermi.py [--tutti] [--senza-guasti]
Fatto dell'11/11/2026: durante un guasto di GitHub i giri nati dai push sono rimasti «in coda» con ZERO lavori per 45
minuti e nessuno se n'è accorto. Qui, in sola lettura (`gh api`, come `.claude/conta-minuti.py`):
  1. i push fatti da questo contenitore nell'ultima ora (registro di git del ramo remoto) e i flussi che dovevano far
     partire (`on: push` con `branches` e `paths` in `.github/workflows/*.yml`);
     un push il cui ultimo commit porta `[skip ci]` (o gli altri segni di GitHub) non fa attendere niente (E404);
  2. per ogni flusso l'ultimo giro: in coda da oltre 5 minuti senza lavori = FERMO; nessun giro 5 minuti dopo il push
     = NON NATO; un lavoro che aspetta da oltre 3 minuti una macchina di casa = MACCHINA; prima = ATTESA (si riguarda);
     per MACCHINA il motivo VERO lo dà lo strumento del progetto che conosce la macchina di casa, se il progetto lo
     nomina in `.claude/progetto.json` «pc_dei_giri» (nel progetto fonte `tools/giro-partito.py`, che non è nel kit; kit 38.51,
     C511 p.23; I22, 14/11: PC acceso che faceva un altro giro detto «spento, staccato o occupato»): acceso e occupato
     per poco = ATTESA; senza lo strumento si dice che il motivo non si sa;
  3. la pagina dei guasti di GitHub, PRIMA di dire una causa (E398).
Non rilancia da solo: stampa la chiamata esatta per Claude (`actions_run_trigger`: le scritture su GitHub passano di lì).
Mai due rilanci: se è fermo anche il giro lanciato a mano lo dice e basta. Oltre un'ora un giro fermo è uno zombie
(11/11: cancellarlo dà 409): si ignora.
--tutti: anche i flussi che non ho toccato io (di base solo quelli dei miei push). --senza-guasti: salta il punto 3.
Esce: 0 tutto bene · 10 attesa · 20 fermo o non nato · 1 non so (gh o git muti: lo dice).
Prove: python3 -I tools/test-giri-fermi.py
"""
import datetime as dt
import json
import pathlib
import re
import subprocess
import sys

SOGLIA = 300    # secondi: oltre, un giro senza lavori è fermo (E396)
VECCHIO = 3600  # secondi: oltre, è uno zombie e non si rilancia
MACCHINA = 180  # secondi: oltre, un lavoro che aspetta una macchina di casa non verrà preso (come giro-partito.py)
MARGINE = 10    # secondi fra l'orologio di qui e quello di GitHub
IN_CODA = ('queued', 'requested', 'waiting', 'pending')
ESITI = {'ATTESA': 10, 'FERMO': 20, 'NON NATO': 20, 'FERMO A MANO': 20, 'MACCHINA': 20}
GUASTO = ('FERMO', 'NON NATO', 'FERMO A MANO')  # gli stati dove c'entra GitHub
# segni nel messaggio dell'ultimo commit di un push: GitHub non fa partire nessun giro `on: push` (E404)
SALTA = ('[skip ci]', '[ci skip]', '[no ci]', '[skip actions]', '[actions skip]')
GUASTI = 'https://www.githubstatus.com/api/v2/incidents/unresolved.json'
UTC = dt.timezone.utc


def comando(*pezzi, attesa=60):
    try:
        uscita = subprocess.run(list(pezzi), capture_output=True, text=True, timeout=attesa)
    except (OSError, subprocess.SubprocessError) as e:
        raise SystemExit(f'{pezzi[0]} non parte: {str(e)[:120]}')
    if uscita.returncode != 0:
        raise SystemExit(f"{pezzi[0]} non risponde ({' '.join(pezzi[1:4])}): {uscita.stderr.strip()[:200]}")
    return uscita.stdout


def ora_di(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def repo():
    """«proprietario/nome» dall'indirizzo di origin (anche dietro il proxy del contenitore)."""
    pezzi = [p for p in comando('git', 'config', '--get', 'remote.origin.url').strip().replace(':', '/').split('/') if p]
    return f"{pezzi[-2]}/{pezzi[-1].removesuffix('.git')}"


def ramo_di_lavoro():
    file = pathlib.Path('.claude/ramo-di-lavoro.txt')
    if file.exists() and file.read_text().strip():
        return file.read_text().strip()
    return comando('git', 'rev-parse', '--abbrev-ref', 'HEAD').strip()


# ── gli inneschi dei flussi (lettura a righe: gli hook non hanno PyYAML garantito; la prova la confronta con PyYAML)
def _pulisci(s):
    s = s.strip()
    if s[:1] in ('"', "'"):
        fine = s.find(s[0], 1)
        return s[1:fine] if fine > 0 else s[1:]
    return s.split(' #')[0].strip()


def _in_riga(s):
    return [_pulisci(x) for x in s[s.index('[') + 1:s.rindex(']')].split(',') if x.strip()]


def inneschi_di(testo):
    """Da un file di flusso → {'push', 'rami', 'percorsi', 'mano', 'ingressi'}; rami o percorsi None = nessun filtro;
    ingressi = i nomi degli `inputs` del lancio a mano."""
    esito = {'push': False, 'rami': None, 'percorsi': None, 'mano': False, 'ingressi': []}
    dentro, evento, chiave = False, None, None
    for riga in testo.splitlines():
        corpo = riga.strip()
        if not corpo or corpo.startswith('#'):
            continue
        rientro = len(riga) - len(riga.lstrip(' '))
        if rientro == 0:
            m = re.match(r'''^['"]?on['"]?\s*:(.*)$''', corpo)
            if not m:
                if dentro:
                    break
                continue
            dentro, resto = True, m.group(1).split(' #')[0].strip()
            nomi = _in_riga(resto) if resto.startswith('[') else [resto]
            esito['push'], esito['mano'] = 'push' in nomi, 'workflow_dispatch' in nomi
        elif not dentro:
            continue
        elif rientro == 2:
            evento, chiave = corpo.split(':')[0].strip(), None
            esito['push'] = esito['push'] or evento == 'push'
            esito['mano'] = esito['mano'] or evento == 'workflow_dispatch'
        elif evento == 'workflow_dispatch':
            if rientro == 4:
                chiave = corpo.split(':')[0].strip()
            elif rientro == 6 and chiave == 'inputs':
                esito['ingressi'].append(corpo.split(':')[0].strip())
        elif evento == 'push' and rientro == 4:
            nome, _, valore = corpo.partition(':')
            chiave = {'branches': 'rami', 'paths': 'percorsi'}.get(nome.strip())
            if chiave:
                esito[chiave] = _in_riga(valore) if valore.strip().startswith('[') else []
        elif evento == 'push' and rientro > 4 and chiave and corpo.startswith('- '):
            esito[chiave].append(_pulisci(corpo[2:]))
    return esito


def inneschi(cartella='.github/workflows'):
    return {f.name: inneschi_di(f.read_text(encoding='utf-8')) for f in sorted(pathlib.Path(cartella).glob('*.y*ml'))}


def combacia(modello, percorso):
    """I modelli dei filtri di GitHub: «**» anche le barre, «*» senza barre."""
    regola, i = '', 0
    while i < len(modello):
        if modello.startswith('**/', i):
            regola, i = regola + '(?:.*/)?', i + 3
        elif modello.startswith('**', i):
            regola, i = regola + '.*', i + 2
        elif modello[i] == '*':
            regola, i = regola + '[^/]*', i + 1
        else:
            regola, i = regola + re.escape(modello[i]), i + 1
    return re.fullmatch(regola, percorso) is not None


def tocca(modelli, cambiati):
    """Almeno un file cambiato passa il filtro `paths` (con «!» l'ultimo modello che combacia vince)."""
    if modelli is None:
        return bool(cambiati)
    for file in cambiati:
        dentro = False
        for m in modelli:
            if m.startswith('!'):
                dentro = dentro and not combacia(m[1:], file)
            elif combacia(m, file):
                dentro = True
        if dentro:
            return True
    return False


# ── i push fatti da qui
def spinte(ramo, adesso, testo=None):
    """[(prima, dopo, ora)] dei push dell'ultima ora, dal registro di git del ramo remoto (i fetch non contano)."""
    if testo is None:
        file = pathlib.Path(comando('git', 'rev-parse', '--git-path', f'logs/refs/remotes/origin/{ramo}').strip())
        testo = file.read_text(encoding='utf-8', errors='replace') if file.exists() else ''
    esito = []
    for riga in testo.splitlines():
        testa, _, messaggio = riga.partition('\t')
        pezzi = testa.split()
        if 'push' not in messaggio or len(pezzi) < 5 or not pezzi[-2].isdigit() or set(pezzi[0]) == {'0'}:
            continue
        quando = dt.datetime.fromtimestamp(int(pezzi[-2]), UTC)
        if 0 <= (adesso - quando).total_seconds() <= VECCHIO:
            esito.append((pezzi[0], pezzi[1], quando))
    return esito


def file_cambiati(prima, dopo):
    return comando('git', 'diff', '--name-only', prima, dopo).split()


def messaggio_di(commit):
    """Il messaggio del commit; vuoto se git non lo trova (nel dubbio il giro resta atteso)."""
    try:
        uscita = subprocess.run(['git', 'log', '-1', '--format=%B', commit], capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return ''
    return uscita.stdout if uscita.returncode == 0 else ''


def saltato(messaggio):
    """Vero se GitHub NON fa nascere giri da questo push: l'ultimo commit porta uno dei suoi segni (E404)."""
    return any(segno in messaggio for segno in SALTA)


def attesi_da(push, flussi, ramo, cambiati=file_cambiati, messaggio=messaggio_di):
    """{flusso: (commit, ora)}: per ogni flusso l'ultimo push che doveva farne nascere un giro."""
    esito = {}
    for prima, dopo, quando in sorted(push, key=lambda p: p[2]):
        if saltato(messaggio(dopo)):
            continue
        file = cambiati(prima, dopo)
        for nome, i in flussi.items():
            sul_ramo = i['rami'] is None or any(combacia(m, ramo) for m in i['rami'])
            if i['push'] and sul_ramo and tocca(i['percorsi'], file):
                esito[nome] = (dopo, quando)
    return esito


# ── il giudizio
def flusso_di(giro):
    return (giro.get('path') or '').split('@')[0].split('/')[-1]


def giudica(giri, lavori_di, attesi, adesso, tutti=False):
    """Solo ciò che non va: [{'stato', 'flusso', 'secondi', 'giro', 'commit', 'lavoro'}] (stati: le chiavi di ESITI).
    `lavori_di(numero del giro)` → i lavori di quel giro (chiesti solo per l'ultimo giro non finito di un flusso)."""
    per_flusso = {}
    for g in giri:
        per_flusso.setdefault(flusso_di(g), []).append(g)
    voci = []
    for flusso in sorted(set(per_flusso) | set(attesi)):
        if not tutti and flusso not in attesi:
            continue
        lista = sorted(per_flusso.get(flusso, []), key=lambda g: g['created_at'])
        if flusso in attesi:
            commit, quando = attesi[flusso]
            limite = quando - dt.timedelta(seconds=MARGINE)
            if not [g for g in lista if g.get('head_sha') == commit or ora_di(g['created_at']) >= limite]:
                secondi = int((adesso - quando).total_seconds())
                if secondi <= VECCHIO:
                    voci.append({'stato': 'NON NATO' if secondi > SOGLIA else 'ATTESA', 'flusso': flusso,
                                 'secondi': secondi, 'giro': None, 'commit': commit, 'lavoro': None})
                continue
        if not lista:
            continue
        g = lista[-1]
        secondi = int((adesso - ora_di(g['created_at'])).total_seconds())
        if g.get('status') not in IN_CODA + ('in_progress',) or secondi > VECCHIO:
            continue
        lavori, lavoro = lavori_di(g['id']), None
        if lavori:  # il giro è nato bene: resta solo il lavoro che aspetta una macchina di casa che non lo prende
            di_casa = [j for j in lavori if j.get('status') in IN_CODA and 'self-hosted' in (j.get('labels') or [])]
            if not di_casa:
                continue
            lavoro = min(di_casa, key=lambda j: j['created_at'])
            secondi = int((adesso - ora_di(lavoro['created_at'])).total_seconds())
            stato = 'MACCHINA' if secondi > MACCHINA else 'ATTESA'
        elif g.get('status') not in IN_CODA:
            continue
        else:
            stato = 'ATTESA' if secondi <= SOGLIA else 'FERMO A MANO' if g.get('event') == 'workflow_dispatch' else 'FERMO'
        voci.append({'stato': stato, 'flusso': flusso, 'secondi': secondi, 'giro': g, 'commit': g.get('head_sha', ''),
                     'lavoro': lavoro})
    return voci


def esito_di(voci):
    return max([ESITI[v['stato']] for v in voci] or [0])


def righe(voci, flussi, ramo, guasti=None):
    """Il testo per Claude: una riga per voce, il rilancio esatto, la pagina dei guasti, la riga per Mario."""
    if not voci:
        return ['STATO: TUTTO BENE (nessun giro fermo fra quelli dei miei push dell\'ultima ora)']
    peggio = esito_di(voci)
    out = ['STATO: ' + ('FERMO' if peggio == 20 else 'ATTESA')]
    for v in voci:
        g, minuti = v['giro'], v['secondi'] // 60
        chi = f"giro «{g.get('name')}» #{g.get('run_number')} ({g.get('event')}, commit {v['commit'][:9]})" if g \
            else f"push del commit {v['commit'][:9]}"
        if v['stato'] == 'ATTESA' and v.get('perche'):
            out.append(f"- ATTESA · {v['flusso']} · {chi}: {v['perche']}. NON ripiegare; riguarda fra 5 min (stesso comando).")
            continue
        if v['stato'] == 'ATTESA':
            cosa = 'non ancora nato' if not g else 'in coda senza lavori'
            limite = SOGLIA
            if v.get('lavoro'):
                cosa, limite = f"il lavoro «{v['lavoro'].get('name')}» aspetta una macchina di casa", MACCHINA
            out.append(f"- ATTESA · {v['flusso']} · {chi}: {cosa} da {v['secondi']} s. Riguarda fra "
                       f"{max(1, (limite - v['secondi']) // 60 + 1)} min (stesso comando); oltre {limite // 60} minuti è fermo.")
            continue
        if v['stato'] == 'MACCHINA':
            perche = v.get('perche') or 'non so se il PC di casa è spento, staccato o occupato'
            out.append(f"- MACCHINA · {v['flusso']} · {chi}: il lavoro «{v['lavoro'].get('name')}» aspetta da {minuti} min una "
                       f'macchina di casa: {perche}.')
            if 'dove' in flussi.get(v['flusso'], {}).get('ingressi', []):
                out.append(f"  Passalo ADESSO al server: actions_run_trigger · method run_workflow · workflow_id {v['flusso']} · "
                           f"ref {g.get('head_branch') or ramo} · inputs dove=github (il giro nuovo annulla quello in attesa).")
            else:
                out.append('  Ripiega sul posto dopo (skill `pr`: Blacksmith, poi GitHub); il giro in coda si annulla da «Actions».')
            out.append(f'  A Mario, una riga col motivo vero: «Il tuo PC di casa non ha preso il lavoro: {perche}. Lo passo '
                       'al server».')
            continue
        if v['stato'] == 'FERMO A MANO':
            out.append(f"- FERMO A MANO · {v['flusso']} · {chi}: anche il lancio a mano è in coda da {minuti} min senza "
                       'lavori. NON rilanciare ancora: GitHub non fa partire niente. Dillo a Mario coi fatti.')
            continue
        fatto = 'nessun giro è nato' if v['stato'] == 'NON NATO' else 'in coda senza lavori'
        out.append(f"- {v['stato']} · {v['flusso']} · {chi}: {fatto} da {minuti} min.")
        if flussi.get(v['flusso'], {}).get('mano'):
            out.append(f"  Rilancia ADESSO a mano, UNA volta: actions_run_trigger · method run_workflow · workflow_id "
                       f"{v['flusso']} · ref {(g or {}).get('head_branch') or ramo} (prima guarda gli `inputs` in testa al file).")
        else:
            out.append(f"  Non si lancia a mano: in {v['flusso']} manca `workflow_dispatch` (voluto dove il giro gira su "
                       "una macchina di casa). Rifai il push del suo file d'innesco con una riga nuova, UNA volta.")
    if any(v['stato'] in GUASTO for v in voci):
        if guasti is None:
            out.append('Pagina dei guasti di GitHub NON letta da qui: leggila (githubstatus.com) prima di dire una causa.')
        elif guasti:
            out.append('Pagina dei guasti di GitHub, aperti adesso: ' + ' · '.join(guasti) + ' (causa probabile).')
        else:
            out.append('Pagina dei guasti di GitHub: nessun guasto scritto adesso (l\'11/11 l\'hanno scritto con ~27 '
                       'minuti di ritardo): a Mario niente causa senza controprova (E398).')
        out.append('A Mario, una riga coi fatti: «GitHub fermo: giro rilanciato a mano alle HH:MM» (ora italiana); mai '
                   '«si sblocca da solo» (E396).')
    return out


# ── le letture vere
def api(percorso):
    return json.loads(comando('gh', 'api', percorso, attesa=90))


def leggi_guasti():
    """Nomi e ora d'inizio dei guasti aperti; None se la pagina non risponde."""
    try:
        dati = json.loads(comando('curl', '-sS', '-m', '15', '-A', 'giri-fermi/1.0', GUASTI, attesa=20))
        return [f"«{i.get('name')}» dalle {str(i.get('started_at') or i.get('created_at'))[11:16]} UTC"
                for i in dati.get('incidents', [])]
    except (SystemExit, ValueError, OSError, subprocess.SubprocessError):
        return None


def locale(adesso):
    """→ (ramo, flussi, attesi): solo git e file, nessuna chiamata a GitHub."""
    ramo, flussi = ramo_di_lavoro(), inneschi()
    return ramo, flussi, attesi_da(spinte(ramo, adesso), flussi, ramo)


def in_rete(attesi, adesso, tutti=False):
    """Le voci che non vanno, leggendo i giri veri dell'ultima ora (e i lavori dei soli giri in coda)."""
    nome = repo()
    da = (adesso - dt.timedelta(seconds=VECCHIO + 600)).strftime('%Y-%m-%dT%H:%M:%SZ')
    giri = api(f'repos/{nome}/actions/runs?per_page=100&created=%3E%3D{da}')['workflow_runs']

    def lavori_di(numero):
        return api(f'repos/{nome}/actions/runs/{numero}/jobs?per_page=50')['jobs']
    return giudica(giri, lavori_di, attesi, adesso, tutti)


def strumento_pc(radice=None):
    """C511 p.23: lo strumento che sa com'è la macchina di casa, da `.claude/progetto.json` «pc_dei_giri» (percorso dentro
    il progetto, es. "tools/giro-partito.py"). Senza impostazione, file rotto o percorso fuori dal progetto: None."""
    radice = pathlib.Path(radice or pathlib.Path(__file__).resolve().parent.parent).resolve()
    try:
        nome = json.loads((radice / '.claude' / 'progetto.json').read_text(encoding='utf-8')).get('pc_dei_giri')
    except (OSError, ValueError, AttributeError):
        return None
    if not isinstance(nome, str) or not nome:
        return None
    file = (radice / nome).resolve()
    return file if radice in file.parents and file.is_file() else None


def col_pc_vero(voci, adesso, cartella=None):
    """I22 (14/11): prima di dire «il PC di casa non lo prenderà» si chiede al server dei giri com'è il PC, con le regole
    dello strumento del progetto (nel progetto fonte `tools/giro-partito.py`, una fonte sola). Acceso e occupato per poco, o che riparte
    = ATTESA col motivo; il resto resta MACCHINA, col motivo vero. Senza lo strumento (C511 p.23: lo nomina
    `.claude/progetto.json` «pc_dei_giri») o col server muto: come prima, dicendo «non so». `cartella`: per le prove,
    la cartella col `giro-partito.py` finto."""
    in_attesa = [v for v in voci if v['stato'] == 'MACCHINA']
    file = (pathlib.Path(cartella) / 'giro-partito.py') if cartella else strumento_pc()
    if not in_attesa or file is None or not file.is_file():
        return voci
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location('giro_partito', file)
        gp = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gp)
        pc = gp.stato_del_pc()
        try:
            occupanti = gp.occupanti_casa()
        except SystemExit:  # GitHub muto: resta il server dei giri
            occupanti = None
        for v in in_attesa:
            stato, perche = gp.perche_in_coda(v['secondi'], adesso, occupanti, pc)
            v['perche'] = perche
            if stato in ('OCCUPATO', 'ASPETTA'):
                v['stato'] = 'ATTESA'
    except Exception:  # mai far cadere il controllo dei giri fermi per questa domanda in più
        pass
    return voci


def controlla(adesso=None, tutti=False):
    """→ (voci, flussi, ramo). Senza push miei su file d'innesco (e senza --tutti) non chiama GitHub."""
    adesso = adesso or dt.datetime.now(UTC)
    ramo, flussi, attesi = locale(adesso)
    return col_pc_vero(in_rete(attesi, adesso, tutti) if attesi or tutti else [], adesso), flussi, ramo


if __name__ == '__main__':
    try:
        voci, flussi, ramo = controlla(tutti='--tutti' in sys.argv)
    except SystemExit as e:
        print(f'STATO: NON SO ({e}). Guarda i giri con actions_list (`list_workflow_runs`, `status` queued).')
        raise SystemExit(1)
    guasti = leggi_guasti() if any(v['stato'] in GUASTO for v in voci) and '--senza-guasti' not in sys.argv else None
    print('\n'.join(righe(voci, flussi, ramo, guasti)))
    raise SystemExit(esito_di(voci))
