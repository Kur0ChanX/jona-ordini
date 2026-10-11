#!/usr/bin/env python3
"""Converte tools/cocktail.txt in data/cocktail.json (D36, v85).
Controlla che ogni riga sia completa e stampa gli ingredienti che sembrano alcolici ma non sono in BR_CAT di index.html.
Uso: python3 tools/cocktail.py"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
FAM = {'Gin': 'gin', 'Vodka': 'vodka', 'Rum e cachaça': 'rum', 'Tequila e mezcal': 'teq', 'Whisky': 'whisky',
       'Brandy, cognac, pisco, grappa': 'brandy', 'Aperitivi e bollicine': 'aper', 'Liquori, amari e shot': 'liq', 'Analcolici': 'zero'}
UNITA = {'cl', 'dash', 'goccia', 'gocce', 'cucchiaino', 'cucchiaini', 'cucchiaio', 'pizzico', 'spruzzo', 'fettine', 'pallina', 'palline'}
html = (R / 'index.html').read_text(encoding='utf-8')
m = re.search(r'const BR_CAT=(\[.*?\]\]\]);', html, re.S)
if not m: sys.exit('BR_CAT non trovato in index.html')
alcol = set(re.findall(r"'((?:[^'\\]|\\.)+)'", m.group(1))) 
alcol = {a.replace("\\'", "'") for a in alcol}
fam, out, err, nomi = None, [], [], set()
for n, riga in enumerate((R / 'tools/cocktail.txt').read_text(encoding='utf-8').splitlines(), 1):
    riga = riga.strip()
    if not riga: continue
    if riga.startswith('# ---'):
        t = riga[5:].strip(); fam = FAM.get(t)
        if not fam: err.append(f'riga {n}: famiglia sconosciuta «{t}»')
        continue
    if riga.startswith('#'): continue
    p = [x.strip() for x in riga.split('|')]
    if len(p) != 7: err.append(f'riga {n}: {len(p)} campi invece di 7'); continue
    nome, met, bic, ing, gu, pas, iba = p
    if met not in 'SMCFP' or len(met) != 1: err.append(f'riga {n}: metodo «{met}»')
    if nome.lower() in nomi: err.append(f'riga {n}: doppione «{nome}»')
    nomi.add(nome.lower())
    I = []
    for x in ing.split(';'):
        x = x.strip(); t = x.split(' ')
        if len(t) < 2: err.append(f'riga {n}: ingrediente «{x}»'); continue
        q, u, r = t[0], '', t[1:]
        if r[0] in UNITA and len(r) > 1: u, r = r[0], r[1:]
        nm = ' '.join(r)
        if not re.match(r'^(\d+(,\d+)?|½|top)$', q): err.append(f'riga {n}: quantità «{q}» in «{x}»')
        base = re.sub(r'\s*\(.*\)$', '', nm)
        a = 1 if base in alcol else 0
        if not a and fam != 'zero' and re.search(r'(?i)gin\b|vodka|rum\b|whisk|liquore|crème|vermouth|brandy|cognac|tequila|mezcal|amaro|bitters|prosecco|champagne|vino|birra', base) and not re.search(r'(?i)ginger|succo', base):
            err.append(f'riga {n}: «{base}» sembra alcolico ma non è in BR_CAT')
        I.append([q, u, nm, a] if a else [q, u, nm])
    if fam == 'zero' and any(len(i) > 3 for i in I): err.append(f'riga {n}: analcolico con alcol')
    out.append([nome, fam, met, bic, I, gu, pas, 1 if iba == 'IBA' else 0])
if err: print('\n'.join(err)); sys.exit(1)
(R / 'data').mkdir(exist_ok=True)
s = json.dumps({'v': 1, 'c': out}, ensure_ascii=False, separators=(',', ':'))
(R / 'data/cocktail.json').write_text(s + '\n', encoding='utf-8')
print(f'{len(out)} cocktail, {len(s)//1024} KB')
