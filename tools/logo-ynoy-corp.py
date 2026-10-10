"""Logo YNOY CORP con la coda a 3 lune (foto di Mario dell'11/10/2026: docs/img/logo/ynoy-corp/originale/ynoy-corp-originale-mario.jpg).
Ricalca la foto a curve (potrace) e da quel vettoriale fa i PNG ad alta risoluzione.
Uso: pip install numpy scipy pillow potracer cairosvg && python3 tools/logo-ynoy-corp.py [cartella di uscita]
Esce: SVG nero e bianco (trasparenti), PDF vettoriale nero e PNG 4000 px: sfondo bianco, sfondo nero, trasparente nero, trasparente bianco."""
import io, os, sys, numpy as np, potrace, cairosvg
from PIL import Image
from scipy import ndimage

SRC = 'docs/img/logo/ynoy-corp/originale/ynoy-corp-originale-mario.jpg'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/img/logo/ynoy-corp'
K = 3        # ingrandimento prima del ricalco: curve più lisce
BORDO = 0.06  # margine attorno al logo (frazione della larghezza)

g = np.asarray(Image.open(SRC).convert('L')).astype(float) / 255
ys, xs = np.where(g < 0.5)
y0, y1, x0, x1 = ys.min() - 20, ys.max() + 21, xs.min() - 20, xs.max() + 21
g = g[y0:y1, x0:x1]
# ingrandito e un poco ammorbidito: toglie i dentini della foto senza arrotondare gli angoli veri
big = ndimage.gaussian_filter(ndimage.zoom(g, K, order=3), K * 0.6)
m = big < 0.5  # parti nere del logo (potracer ricalca i False: si passa ~m)
paths = []
f = lambda v: f"{v / K:.2f}".rstrip('0').rstrip('.')
for c in potrace.Bitmap(~m).trace(turdsize=K * K * 30, alphamax=1.0, opticurve=True, opttolerance=0.2):
    p = c.start_point; d = [f"M{f(p.x)} {f(p.y)}"]
    for s in c.segments:
        if s.is_corner: d.append(f"L{f(s.c.x)} {f(s.c.y)}L{f(s.end_point.x)} {f(s.end_point.y)}")
        else: d.append(f"C{f(s.c1.x)} {f(s.c1.y)} {f(s.c2.x)} {f(s.c2.y)} {f(s.end_point.x)} {f(s.end_point.y)}")
    paths.append(''.join(d) + 'Z')
h, w = g.shape
b = round(w * BORDO)
vb = f"{-b} {-b} {w + 2 * b} {h + 2 * b}"

def svg(colore, sfondo=None):
    bg = f'<rect x="{-b}" y="{-b}" width="{w + 2 * b}" height="{h + 2 * b}" fill="{sfondo}"/>' if sfondo else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w + 2 * b}" height="{h + 2 * b}">'
            f'<title>YNOY CORP</title>{bg}<path fill="{colore}" fill-rule="evenodd" d="{"".join(paths)}"/></svg>\n')

os.makedirs(f'{OUT}/vettoriale', exist_ok=True); os.makedirs(f'{OUT}/png', exist_ok=True)
for nome, s in (('ynoy-corp-nero.svg', svg('#000')), ('ynoy-corp-bianco.svg', svg('#fff'))):
    open(f'{OUT}/vettoriale/{nome}', 'w').write(s)
cairosvg.svg2pdf(bytestring=svg('#000').encode(), write_to=f'{OUT}/vettoriale/ynoy-corp-nero.pdf')  # per tipografie
W = 4000; H = round(W * (h + 2 * b) / (w + 2 * b))
for nome, s in (('ynoy-corp-sfondo-bianco.png', svg('#000', '#fff')), ('ynoy-corp-sfondo-nero.png', svg('#fff', '#000')),
                ('ynoy-corp-trasparente-nero.png', svg('#000')), ('ynoy-corp-trasparente-bianco.png', svg('#fff'))):
    im = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode(), output_width=W, output_height=H)))
    if 'sfondo' in nome: im = im.convert('RGB')
    im.save(f'{OUT}/png/{nome}', optimize=True)
print(len(paths), 'tracciati;', f'{W}x{H} px;', OUT)
