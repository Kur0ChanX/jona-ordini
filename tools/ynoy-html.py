"""Mette nell'animazione d'apertura (index.html, maschera #ywm) i tratti di tools/ynoy-tratti.py (v70).
Tempi: ogni tratto dura 0,03 s + 0,000647 s per unità di lunghezza, uno dopo l'altro, poi tutto scalato
tra 1,2 s e 2,8 s (come la v62). --o nasconde anche la punta tonda del tratto prima della partenza.
Uso: python3 tools/ynoy-tratti.py > /tmp/t.json && python3 tools/ynoy-html.py /tmp/t.json"""
import sys, json, re
T = json.load(open(sys.argv[1]))
dur = [0.03 + 0.000647 * s['len'] for s in T]; k = 1.6 / sum(dur)
t, P = 1.2, []
for s, d in zip(T, dur):
    o = round(100 + 100 * (s['w'] / 2 + .3) / s['len'])
    P.append(f'<path pathLength="100" d="{s["d"]}" style="stroke-width:{s["w"]};--o:{o};animation-delay:{t:.3f}s;animation-duration:{d*k:.3f}s"/>')
    t += d * k
h = open('index.html').read()
a = h.index('<mask id="ywm"'); a = h.index('<g>', a) + 3; b = h.index('</g>', a)
h = h[:a] + ''.join(P) + h[b:]
open('index.html', 'w').write(h); print(len(P), 'tratti, fine', round(t, 3), 's')

# Stessa animazione in un solo file SVG vettoriale (da aprire nel browser o dare a un grafico): docs/img/logo/ynoy-corp/animazione/ynoy-animazione.svg
logo = re.search(r' d="([^"]+)"', open('media/ynoy.svg').read()).group(1)
Q = [re.sub(r'animation-delay:([\d.]+)s', lambda m: f'animation-delay:{float(m.group(1))-1.0:.3f}s', p) for p in P]   # parte subito (0,2 s)
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 190" width="992" height="380"><title>YNOY CORP</title>'
       '<style>.t path{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100 300;'
       'animation:s .3s cubic-bezier(.4,.1,.6,.9) both}@keyframes s{from{stroke-dashoffset:var(--o)}to{stroke-dashoffset:0}}</style>'
       '<mask id="w" maskUnits="userSpaceOnUse" x="0" y="0" width="496" height="190"><g class="t">' + ''.join(Q) + '</g></mask>'
       '<path fill="#111" fill-rule="evenodd" mask="url(#w)" d="' + logo + '"/></svg>\n')
open('docs/img/logo/ynoy-corp/animazione/ynoy-animazione.svg', 'w').write(svg); print('animazione SVG', len(svg))
