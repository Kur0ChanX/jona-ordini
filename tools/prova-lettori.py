# Prova dei lettori di foto (D22): passa le foto vere di docs/img/listini a Gemini e ai modelli
# con la vista di Cloudflare Workers AI, con lo stesso prompt dell'app (geminiPrompt in index.html).
# Confronta con le righe trascritte a mano (le stesse di tools/test-fatture.mjs, vitello col prezzo giusto)
# e, per tutte le foto, conta le righe coerenti (quantità × prezzo = importo, come rigaNonTorna).
# Gira su GitHub (workflow prova-lettori.yml) con i segreti GEMINI_API_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID.
# Uso: python3 tools/prova-lettori.py [cartella-uscita]
import base64, io, json, os, re, sys, time, urllib.error, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else 'prova-lettori'
os.makedirs(OUT, exist_ok=True)
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
cats = re.search(r"const CATS=\[(.*?)\];", html).group(1).replace("'", '').split(',')
head = re.search(r"const TEMPLATE_HEAD='([^']*)'", html).group(1) + ';quantita;importo'
PROMPT = re.search(r"const geminiPrompt=\(\)=>`(.*?)`;", html, re.S).group(1)
PROMPT = PROMPT.replace('${GEM_HEAD}', head).replace("${CATS.join(', ')}", ', '.join(cats))
assert '${' not in PROMPT

# righe giuste: codice -> (unità, prezzo)
VERO = {
  'dac-fattura-054851-2026-09-01-pag1.jpg': {'39850': ('pz', 4.988), '21869': ('pz', 26.248), '23072': ('pz', 0.287), '6614': ('conf', 8.206),
    '56035': ('pz', 6.057), '38555': ('conf', 15.21), '34170': ('kg', 14.33), '9602': ('kg', 15.936), '54035': ('kg', 4.15),
    '806406': ('cartone', 11.552), '86649': ('kg', 12.09)},
  'mariano-fattura-13960-2026-09-08.jpg': {'457': ('kg', 4.95), '040': ('kg', 9.90), '405': ('pz', 1.45), '027': ('pz', 1.45),
    '603': ('pz', 1.55), '1172': ('kg', 2.95)},
  'nieddittas-fattura-5274-2026-09-22.jpg': {'22': ('kg', 4.70), '4': ('kg', 20.50), 'CDS': ('pz', 5.0)},
}
UM = {'k.': 'kg', 'kg': 'kg', 'pz': 'pz', 'cf': 'conf', 'conf': 'conf', 'ct': 'cartone', 'cartone': 'cartone', 'lt': 'l', 'l': 'l'}

def foto(nome):
    im = Image.open(os.path.join(ROOT, 'docs/img/listini', nome)).convert('RGB')
    im.thumbnail((2000, 2000))  # come shrinkImg dell'app
    b = io.BytesIO(); im.save(b, 'JPEG', quality=85); return base64.b64encode(b.getvalue()).decode()

def post(url, body, hdr, tempo=120):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'content-type': 'application/json', **hdr})
    try:
        with urllib.request.urlopen(r, timeout=tempo) as x: return 200, json.loads(x.read())
    except urllib.error.HTTPError as e: return e.code, e.read().decode(errors='replace')[:300]
    except Exception as e: return 0, str(e)[:300]

GK, CT, CA = os.environ.get('GEMINI_API_KEY', ''), os.environ.get('CLOUDFLARE_API_TOKEN', ''), os.environ.get('CLOUDFLARE_ACCOUNT_ID', '')

def gemini(model):
    def run(b64):
        st, j = post(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GK}',
                     {'contents': [{'parts': [{'text': PROMPT}, {'inline_data': {'mime_type': 'image/jpeg', 'data': b64}}]}],
                      'generationConfig': {'temperature': 0}}, {})
        if st != 200: return None, f'{st} {j}'
        return ''.join(p.get('text', '') for p in j['candidates'][0]['content']['parts']), ''
    return run

def cloudflare(model):
    def run(b64):
        st, j = post(f'https://api.cloudflare.com/client/v4/accounts/{CA}/ai/v1/chat/completions',
                     {'model': model, 'temperature': 0, 'max_tokens': 4000, 'messages': [{'role': 'user', 'content': [
                         {'type': 'text', 'text': PROMPT}, {'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + b64}}]}]},
                     {'authorization': 'Bearer ' + CT})
        if st != 200: return None, f'{st} {j}'
        return j['choices'][0]['message'].get('content') or '', ''
    return run

def cf_id(nome):
    # il nome completo @cf/... preso dal catalogo dell'account
    r = urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{CA}/ai/models/search?search={nome}',
                               headers={'authorization': 'Bearer ' + CT})
    try:
        with urllib.request.urlopen(r, timeout=30) as x:
            for m in json.loads(x.read()).get('result', []):
                if m.get('name', '').endswith('/' + nome): return m['name']
    except Exception as e: print('catalogo Cloudflare:', str(e)[:200])
    return None

def num(s):
    s = (s or '').strip().replace('€', '').replace(' ', '')
    if ',' in s: s = s.replace('.', '').replace(',', '.')
    try: return float(s)
    except ValueError: return None

def righe(txt):
    out = []
    for l in (txt or '').splitlines():
        c = [x.strip().strip('"') for x in l.split(';')]
        if len(c) < 5 or c[0].lower() == 'fornitore' or l.strip().startswith('```'): continue
        c += [''] * (8 - len(c))
        out.append({'cod': c[1], 'um': UM.get(c[3].lower().strip('#'), c[3].lower()), 'p': num(c[4]), 'q': num(c[6]), 'imp': num(c[7])})
    return out

LETTORI = []
if GK:
    LETTORI += [('Gemini Flash', gemini('gemini-flash-latest')), ('Gemini Flash-Lite', gemini('gemini-flash-lite-latest'))]
if CT and CA:
    for n in ['gemma-4-26b-a4b-it', 'mistral-small-3.1-24b-instruct', 'llama-4-scout-17b-16e-instruct', 'qwen3.8-27b']:
        mid = cf_id(n)
        print('Cloudflare', n, '->', mid)
        if mid: LETTORI.append(('CF ' + n, cloudflare(mid)))
if not LETTORI: sys.exit('Nessun segreto: niente da provare.')

FOTO = sorted(os.listdir(os.path.join(ROOT, 'docs/img/listini')))
B64 = {f: foto(f) for f in FOTO}
ris = []
for nome, run in LETTORI:
    tot = {'giuste': 0, 'attese': 0, 'righe': 0, 'coerenti': 0, 'conq': 0, 'errori': 0, 'sec': 0.0}
    for f in FOTO:
        t = time.time(); txt, err = run(B64[f]); dt = time.time() - t
        if txt is None and err.startswith('429'):
            time.sleep(30); t = time.time(); txt, err = run(B64[f]); dt = time.time() - t
        tot['sec'] += dt
        open(os.path.join(OUT, f'{nome.replace(" ", "_")}__{f}.txt'), 'w').write(txt if txt is not None else 'ERRORE ' + err)
        if txt is None:
            tot['errori'] += 1; print(f'{nome} | {f} | ERRORE {err}'); continue
        rr = righe(txt); tot['righe'] += len(rr)
        for r in rr:
            if r['q'] is not None and r['p'] is not None and r['imp'] is not None:
                tot['conq'] += 1
                if abs(r['q'] * r['p'] - r['imp']) <= max(0.06, abs(r['imp']) * 0.015): tot['coerenti'] += 1
        v = VERO.get(f, {}); g = 0
        for cod, (um, p) in v.items():
            r = next((r for r in rr if r['cod'] == cod), None)
            if r and r['p'] is not None and abs(r['p'] - p) < 0.0015 and r['um'] == um: g += 1
        tot['giuste'] += g; tot['attese'] += len(v)
        print(f'{nome} | {f} | {len(rr)} righe | giuste {g}/{len(v)} | {dt:.0f} s')
        if nome.startswith('Gemini'): time.sleep(6)
    ris.append((nome, tot))

tab = ['| Lettore | Righe giuste (su 3 fatture trascritte) | Righe coerenti q×prezzo=importo (8 foto) | Foto con errore | Secondi totali |',
       '|---|---|---|---|---|']
for nome, t in ris:
    tab.append(f"| {nome} | {t['giuste']}/{t['attese']} | {t['coerenti']}/{t['conq']} (righe lette {t['righe']}) | {t['errori']}/{len(FOTO)} | {t['sec']:.0f} |")
print('\n'.join(tab))
if os.environ.get('GITHUB_STEP_SUMMARY'):
    open(os.environ['GITHUB_STEP_SUMMARY'], 'a').write('## Prova dei lettori di foto\n\n' + '\n'.join(tab) + '\n')
