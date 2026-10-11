"""Logo JONA ad alta risoluzione, dal vettoriale dell'app (media/jona.svg, fatto da tools/logo-jona.py).
Taglia il riquadro attorno al logo con un margine, poi fa i file come tools/logo-ynoy-corp.py.
Uso: pip install numpy pillow cairosvg && python3 tools/logo-jona-alta.py [cartella di uscita]
Esce: SVG nero e bianco (trasparenti), PDF vettoriale nero e PNG 4000 px: sfondo bianco, sfondo nero, trasparente nero, trasparente bianco."""
import io, os, re, sys, numpy as np, cairosvg
from PIL import Image

SRC = 'media/jona.svg'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/img/logo/jona'
BORDO = 0.06  # margine attorno al logo (frazione della larghezza)

s = open(SRC).read()
VB0 = re.search(r'viewBox="[^"]+"', s).group(0)
vx, vy, vw, vh = map(float, VB0[9:-1].split())
assert s.count('<path d=') == 1, 'atteso un solo tracciato pieno (la conchiglia)'

def colora(c):
    # il tracciato pieno non ha colore (nero di partenza), le lettere hanno stroke="#000"
    t = s.replace('<path d=', f'<path fill="{c}" d=', 1).replace('stroke="#000"', f'stroke="{c}"')
    assert t.count(f'"{c}"') == s.count('stroke="#000"') + 1
    return t

# riquadro del logo: si disegna grande e si cercano i pixel pieni
R = 8
a = np.asarray(Image.open(io.BytesIO(cairosvg.svg2png(bytestring=colora('#000').encode(), output_width=round(vw * R)))))[:, :, 3]
ys, xs = np.where(a > 8)
x0, x1, y0, y1 = vx + xs.min() / R, vx + (xs.max() + 1) / R, vy + ys.min() / R, vy + (ys.max() + 1) / R
b = (x1 - x0) * BORDO
bx, by, bw, bh = x0 - b, y0 - b, x1 - x0 + 2 * b, y1 - y0 + 2 * b
f = lambda v: f"{v:.2f}".rstrip('0').rstrip('.')
vb = f'viewBox="{f(bx)} {f(by)} {f(bw)} {f(bh)}" width="{f(bw)}" height="{f(bh)}"'

def svg(colore, sfondo=None):
    t = colora(colore).replace(VB0, vb, 1)
    bg = f'<rect x="{f(bx)}" y="{f(by)}" width="{f(bw)}" height="{f(bh)}" fill="{sfondo}"/>' if sfondo else ''
    return t.replace('</defs>', f'</defs><title>JONA</title>{bg}', 1)

os.makedirs(f'{OUT}/vettoriale', exist_ok=True); os.makedirs(f'{OUT}/png', exist_ok=True)
for nome, t in (('jona-nero.svg', svg('#000')), ('jona-bianco.svg', svg('#fff'))):
    open(f'{OUT}/vettoriale/{nome}', 'w').write(t)
cairosvg.svg2pdf(bytestring=svg('#000').encode(), write_to=f'{OUT}/vettoriale/jona-nero.pdf')  # per tipografie
W = 4000; H = round(W * bh / bw)
for nome, t in (('jona-sfondo-bianco.png', svg('#000', '#fff')), ('jona-sfondo-nero.png', svg('#fff', '#000')),
                ('jona-trasparente-nero.png', svg('#000')), ('jona-trasparente-bianco.png', svg('#fff'))):
    im = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=t.encode(), output_width=W, output_height=H)))
    if 'sfondo' in nome: im = im.convert('RGB')
    im.save(f'{OUT}/png/{nome}', optimize=True)
print(f'{W}x{H} px;', OUT)
