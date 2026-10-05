# Rifà le due animazioni dell'invio dal filmato originale di Mario (sfondo bianco puro, tools/originale-invio.mp4).
# Uso: pip install scipy pillow  →  python3 tools/anim-invio.py tools/originale-invio.mp4 [fine in secondi=4.2]
# Uscita: video H.264 720x808 a 24 fps, sopra il colore e sotto la trasparenza in bianco e nero (la unisce sendAnim con WebGL).
#  - media/invio-chef.mp4 (lo staff invia allo chef): specchiato, la ragazza a sinistra porge il menù allo chef a destra.
#    Scritte del menù e ricamo della giacca rimessi dritti: si incolla il riquadro originale nel punto specchiato.
#  - media/invio-fornitore.mp4 (ordine inviato al fornitore): invertito nel tempo, lo chef a sinistra porge il menù alla ragazza.
# Maschera: lo sfondo è bianco "bruciato" (tutti i canali >= SOGLIA); la giacca dello chef è un bianco più grigio e resta piena.
# Si toglie il bianco collegato al bordo e anche ogni zona bianca chiusa (tra le braccia, tra manica e menù);
# restano corpo, divisa bianca, vestito nero e menù. Bordi sfumati di poco, e sfumatura verso i lati del filmato.
import os, subprocess, sys, tempfile
import numpy as np, scipy.ndimage as ndi
from PIL import Image

SRC = sys.argv[1]; END = float(sys.argv[2]) if len(sys.argv) > 2 else 4.2
MEDIA = os.path.join(os.path.dirname(__file__), '..', 'media')
W, H = 720, 404
SOGLIA = 250     # minimo dei tre canali da cui un punto è sfondo
BUCO = 150       # zone bianche chiuse più piccole di così (in punti) restano piene: niente forellini
CHIUDI = 14      # raggio (in punti) delle fessure chiuse vicino alla giacca
LISCIO = 8       # quanto si liscia il contorno della giacca (in punti del filmato 1920x1080)
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-t', str(END), '-vf', 'fps=24', f'{tmp}/f%03d.png'], check=True)
N = len([f for f in os.listdir(tmp) if f.startswith('f')])

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]; return x * x + y * y <= r * r
def mask(rgb):  # 1 = soggetto, 0 = sfondo
    x = rgb.astype(np.int16)
    mn = x.min(2); stoffa = (mn >= 180) & (x.max(2) - mn < 30)            # bianco-grigio della giacca
    chiaro = stoffa & (mn >= 225)   # quasi bianco: resta solo dove è largo (la giacca), via l'alone sottile attorno a mani e menù
    fg = ((mn < SOGLIA) & ~chiaro) | ndi.binary_opening(chiaro & (mn < SOGLIA), structure=disk(5))
    fg = ndi.binary_closing(fg, structure=disk(4))   # chiude i riflessi bruciati sul bordo della giacca
    lab, n = ndi.label(~fg); bg = np.zeros_like(fg)
    bordo = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    for k, s in enumerate(ndi.find_objects(lab), 1):
        ys = slice(max(0, s[0].start - 12), s[0].stop + 12); xs = slice(max(0, s[1].start - 12), s[1].stop + 12)
        c = lab[ys, xs] == k
        if k not in bordo:
            if c.sum() < BUCO: continue
            # zona chiusa: se tutt'intorno c'è stoffa è un riflesso sulla giacca (resta), altrimenti è sfondo tra braccia e menù
            anello = ndi.binary_dilation(c, structure=disk(10)) & ~ndi.binary_dilation(c, structure=disk(4))
            if stoffa[ys, xs][anello].mean() >= 0.7: continue
        bg[ys, xs] |= c
    lab, _ = ndi.label(~bg); tieni = np.bincount(lab.ravel()) > 2500; tieni[0] = False   # via i puntini isolati
    fg = tieni[lab]
    # giacca: il bordo sfuma nel bianco e la soglia lo taglia a gradini. Vicino alla stoffa il contorno si liscia
    # (sfocatura ampia e di nuovo metà); mani, menù e vestito restano col contorno preciso.
    giacca = ndi.binary_opening(stoffa & fg, structure=disk(4))
    zona = ndi.distance_transform_edt(~giacca) < 30
    # fessure di sfondo più strette di 2×CHIUDI dentro la giacca: sono pieghe illuminate, non sfondo
    chiuso = ndi.distance_transform_edt(ndi.distance_transform_edt(~fg) <= CHIUDI) > CHIUDI
    liscio = ndi.gaussian_filter((fg | (chiuso & zona)).astype(np.float32), LISCIO) > 0.5
    fg = np.where(zona, liscio, fg)
    # dopo la chiusura restano buchi chiusi nella stoffa bruciata (es. sul polsino): se attorno è giacca, si riempiono;
    # i veri spazi tra braccio e corpo hanno attorno mani e menù (stoffa sotto il 10%)
    lab, _ = ndi.label(~fg); bordo = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    for k, s in enumerate(ndi.find_objects(lab), 1):
        if k in bordo: continue
        ys = slice(max(0, s[0].start - 12), s[0].stop + 12); xs = slice(max(0, s[1].start - 12), s[1].stop + 12)
        c = lab[ys, xs] == k
        anello = ndi.binary_dilation(c, structure=disk(10)) & ~ndi.binary_dilation(c, structure=disk(4))
        st = stoffa[ys, xs][anello].mean()
        if st >= 0.7 or (st >= 0.5 and c.sum() < 8000): fg[ys, xs] |= c   # piccoli e quasi tutti nella stoffa
    return fg.astype(np.float32)

def mosso(rgb, vicini):  # 1 = pieno; meno di 1 dove le dita in movimento si mescolano col bianco (il filmato le tiene chiare)
    x = rgb.astype(np.int16); mn = x.min(2); mx = x.max(2); sat = mx - mn
    moto = np.max([np.abs(x - v.astype(np.int16)).max(2) for v in vicini], 0)
    moto = ndi.binary_dilation(ndi.gaussian_filter(moto.astype(np.float32), 6) > 90, structure=disk(15))   # solo le parti che si muovono veloci (mani ferme e unghie restano piene)
    stoffa = ndi.binary_opening((mn >= 180) & (sat < 30) & (mn < SOGLIA), structure=disk(4))
    lab, _ = ndi.label(stoffa); grandi = np.bincount(lab.ravel()) > 8000; grandi[0] = False
    giacca = ndi.distance_transform_edt(~grandi[lab]) < 45          # la giacca resta com'è
    scuro = (mx < 170) & (x[..., 0] - x[..., 2] < 40)                # il marrone del menù (la pelle in ombra è più rossa)
    lab, _ = ndi.label(scuro); grandi = np.bincount(lab.ravel()) > 30000; grandi[0] = False
    scuro = grandi[lab]                                               # le scritte chiuse nel menù restano piene
    logo = ndi.binary_dilation(ndi.binary_fill_holes(ndi.binary_closing(scuro, structure=disk(3))) & ~scuro, structure=disk(4))
    # pelle vicina (punti ben colorati): quanto è scura dà la misura; un punto chiaro è pelle mescolata al bianco
    pelle = ((sat >= 45) & (mn < 200)).astype(np.float32)
    pm = ndi.uniform_filter(mn * pelle, 41) / np.maximum(ndi.uniform_filter(pelle, 41), 1e-3)
    pm = np.where(ndi.uniform_filter(pelle, 41) > 0.02, pm, 120)
    f = np.clip((SOGLIA + 2 - mn) / np.maximum(SOGLIA + 2 - pm, 40) * 1.15, 0, 1)
    # il bianco mescolato viene dallo sfondo: nei fotogrammi vicini lì c'è sfondo. Così le unghie (chiare, poco colorate) restano piene
    bianco = ndi.binary_dilation(np.any([v.min(2) >= SOGLIA for v in vicini], 0), structure=disk(6))
    return np.where(moto & bianco & ~giacca & ~logo & (sat < 45), f, 1).astype(np.float32)

def riquadri(rgb):  # scritte da tenere dritte nella versione specchiata: logo del menù e ricamo sulla giacca
    x = rgb.astype(np.int16); mn = x.min(2); mx = x.max(2); R, G, B = x[..., 0], x[..., 1], x[..., 2]
    out = {}
    marrone = (mn < 130) & (R > 80) & (R - B > 12) & (R - B < 60) & (R >= G)
    lab, n = ndi.label(ndi.binary_opening(marrone, structure=disk(3)))
    if n:
        menu = lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1
        if menu.sum() > 40000:
            pieno = ndi.binary_fill_holes(menu); ys, xs = np.nonzero(pieno)
            y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max(); h, w = y1 - y0, x1 - x0
            lab2, _ = ndi.label((ndi.distance_transform_edt(pieno) > 25) & ~menu & (mn > 140))
            scritte = np.zeros_like(menu)
            for i, s in enumerate(ndi.find_objects(lab2), 1):   # solo al centro del menù: le dita stanno sui bordi
                cy = (s[0].start + s[0].stop) / 2; cx = (s[1].start + s[1].stop) / 2
                if x0 + .15 * w < cx < x1 - .15 * w and y0 + .05 * h < cy < y0 + .8 * h: scritte[s] |= lab2[s] == i
            if scritte.sum() > 200:
                ys, xs = np.nonzero(scritte)
                out['menu'] = (max(ys.min() - 16, y0 + 8), min(ys.max() + 17, y1 - 8), max(xs.min() - 16, x0 + 8), min(xs.max() + 17, x1 - 8))
    # ricamo: tratti scuri sulla stoffa bianca, nella zona del petto in alto a sinistra; si parte dal tratto più in alto (il logo)
    stoffa = (mn >= 180) & (mx - mn < 30) & (mn < 250)
    reg = np.zeros_like(stoffa); reg[:600, :900] = True
    cand = reg & (ndi.gaussian_filter(mn.astype(np.float32), 8) - mn > 22) & (mn < 215) & (mx - mn < 45)
    lab, n = ndi.label(cand); tieni = np.zeros_like(cand)
    for i, s in enumerate(ndi.find_objects(lab), 1):
        ys = slice(max(0, s[0].start - 8), s[0].stop + 8); xs = slice(max(0, s[1].start - 8), s[1].stop + 8)
        c = lab[ys, xs] == i
        if c.sum() < 6: continue
        anello = ndi.binary_dilation(c, iterations=6) & ~c
        if stoffa[ys, xs][anello].mean() >= .6: tieni[ys, xs] |= c
    if tieni.sum() > 60:
        cl, _ = ndi.label(ndi.binary_dilation(tieni, structure=disk(30)))
        tieni &= cl == np.argmax(np.bincount(cl[tieni])[1:]) + 1
        ys, xs = np.nonzero(tieni); top = ys.min(); tieni[top + 110:] = False; ys, xs = np.nonzero(tieni)
        if xs.max() - xs.min() < 200: out['ricamo'] = (top - 14, ys.max() + 15, xs.min() - 14, xs.max() + 15)
    return out

def stabili(box, n):   # riquadri fotogramma per fotogramma: buchi brevi riempiti, mediana su 5 per non farli tremare
    a = np.full((n, 4), np.nan)
    for k, b in enumerate(box):
        if b: a[k] = b
    ok = ~np.isnan(a[:, 0]); idx = np.arange(n)
    if ok.sum() < 2: return [None] * n
    for c in range(4): a[:, c] = np.interp(idx, idx[ok], a[ok, c])
    vicino = ndi.distance_transform_edt(~ok) <= 4   # oltre 4 fotogrammi senza riquadro: niente (es. il menù di taglio)
    a = ndi.median_filter(a, size=(5, 1), mode='nearest')
    return [tuple(int(round(v)) for v in a[k]) if vicino[k] else None for k in range(n)]
def inclinazione(rgb, b):   # gradi del menù (dalle righe del logo): l'angolo che rende più netto il profilo delle righe di testo
    y0, y1, x0, x1 = b; t = (rgb[y0:y1:2, x0:x1:2].min(2) > 140 / 255).astype(np.float32)
    prova = lambda angoli: max(angoli, key=lambda a: (ndi.rotate(t, a, reshape=False, order=1).sum(1) ** 2).sum())
    a = prova(np.arange(-10, 10.01, 0.5)); return prova(np.arange(a - 0.5, a + 0.51, 0.1))
def liscia(v):   # angoli fotogramma per fotogramma senza scatti: buchi riempiti, mediana su 5, poi media leggera
    v = np.array(v, float); ok = ~np.isnan(v); idx = np.arange(len(v))
    if ok.sum() < 2: return np.zeros(len(v))
    v = np.interp(idx, idx[ok], v[ok]); return ndi.gaussian_filter1d(ndi.median_filter(v, 5, mode='nearest'), 1.5, mode='nearest')
sm = lambda t: (lambda c: c * c * (3 - 2 * c))(np.clip(t, 0, 1))
def edges(h, w, L=0.04, R=0.03, T=0.04, B=0.05):   # il soggetto sparisce dolcemente verso i bordi del filmato
    xs = np.linspace(0, 1, w); ys = np.linspace(0, 1, h)
    return (sm(ys / T) * sm((1 - ys) / B))[:, None] * (sm(xs / L) * sm((1 - xs) / R))[None, :]

frames, raw, box, fermo = [], [], [], []
for i in range(1, N + 1):
    rgb = np.asarray(Image.open(f'{tmp}/f{i:03d}.png').convert('RGB'))
    vic = [np.asarray(Image.open(f'{tmp}/f{j:03d}.png').convert('RGB')) for j in (i - 1, i + 1) if 1 <= j <= N]
    mo = mosso(rgb, vic)
    # punti fermi (colore uguale ai fotogrammi vicini): lì il contorno si media nel tempo e non sfarfalla
    fermo.append(ndi.gaussian_filter(np.max([np.abs(rgb.astype(np.int16) - v).max(2) for v in vic], 0).astype(np.float32), 4) < 20)
    c = rgb.astype(np.float32) / 255; fm = np.maximum(mo, 0.25)[..., None]
    frames.append(np.where(mo[..., None] < 1, np.clip((c - (1 - fm)) / fm, 0, 1), c)); box.append(riquadri(rgb))   # togli il bianco mescolato: resta la pelle
    m = ndi.binary_erosion(mask(rgb) > 0.5, structure=disk(2)).astype(np.float32)   # via l'alone chiaro del bordo
    raw.append(ndi.gaussian_filter(m, 1.6) * ndi.gaussian_filter(mo, 1))
    print('maschera', i, 'di', N, flush=True)
fissi = {t: stabili([b.get(t) for b in box], N) for t in ('menu', 'ricamo')}
# il logo incollato dritto va girato come il menù specchiato: il menù inclinato di +a nel filmato è inclinato di -a nello specchio
incl = liscia([inclinazione(frames[k], b) if b else np.nan for k, b in enumerate(fissi['menu'])])
E = edges(*raw[0].shape)
def bordo(h, w, f=10):   # peso del riquadro incollato: pieno al centro, sfuma negli ultimi f punti
    return np.minimum(sm(np.minimum(np.arange(h), np.arange(h)[::-1]) / f)[:, None], sm(np.minimum(np.arange(w), np.arange(w)[::-1]) / f)[None, :])
os.makedirs(f'{tmp}/chef'); os.makedirs(f'{tmp}/forn')
for k in range(N):
    rgb = frames[k]
    # dove la scena è ferma: mediana del contorno su 5 fotogrammi (via lo sfarfallio di vestiti e unghie);
    # dove si muove resta quello del fotogramma (la media lascerebbe scie sulle mani)
    vic = [raw[j] for j in range(max(0, k - 2), min(N, k + 3))]
    a = np.clip(np.where(fermo[k], np.median(vic, 0), raw[k]), 0, 1)
    # bordi col colore del soggetto (niente alone bianco sullo sfondo scuro dell'app)
    inner = (a > 0.95).astype(np.float32); w = ndi.uniform_filter(inner, 9)
    pc = np.stack([ndi.uniform_filter(rgb[..., c] * inner, 9) for c in range(3)], -1) / np.maximum(w, 1e-4)[..., None]
    t = (a > 0.95)[..., None] | (w < 1e-3)[..., None]
    col = np.clip(np.where(t, rgb, pc), 0, 1)
    a = a * E
    def salva(c, al, nome):
        out = Image.new('RGB', (W, 2 * H))
        out.paste(Image.fromarray((c * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), (0, 0))
        out.paste(Image.fromarray((al * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).convert('RGB'), (0, H))
        out.save(nome)
    salva(col, a, f'{tmp}/forn/s{N - k:03d}.png')   # numerati al contrario: il video esce invertito nel tempo
    sc = col[:, ::-1].copy(); X = col.shape[1]
    for tipo in ('menu', 'ricamo'):
        b = fissi[tipo][k]
        if not b: continue
        y0, y1, x0, x1 = max(b[0], 0), min(b[1], col.shape[0]), max(b[2], 0), min(b[3], X)
        if y1 - y0 < 30 or x1 - x0 < 30: continue
        p = bordo(y1 - y0, x1 - x0)[..., None]
        if tipo == 'menu':   # ogni punto del riquadro specchiato prende il punto del logo originale girato di 2 volte l'angolo del menù
            r = np.radians(-2 * incl[k]); cy, cx = (y0 + y1 - 1) / 2, (x0 + x1 - 1) / 2
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32); dy, dx = yy - cy, xx - cx
            sy, sx = cy + dy * np.cos(r) - dx * np.sin(r), cx + dy * np.sin(r) + dx * np.cos(r)
            src = np.stack([ndi.map_coordinates(col[..., c], [sy, sx], order=1, mode='nearest') for c in range(3)], -1)
        else: src = col[y0:y1, x0:x1]
        sc[y0:y1, X - x1:X - x0] = p * src + (1 - p) * sc[y0:y1, X - x1:X - x0]
    salva(sc, a[:, ::-1], f'{tmp}/chef/s{k + 1:03d}.png')
    print('fotogramma', k + 1, 'di', N, flush=True)
for cart, nome in (('chef', 'invio-chef.mp4'), ('forn', 'invio-fornitore.mp4')):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{tmp}/{cart}/s%03d.png', '-c:v', 'libx264', '-profile:v', 'main',
                    '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-tune', 'film', '-movflags', '+faststart', '-an', os.path.join(MEDIA, nome)], check=True)
    print('fatto:', os.path.abspath(os.path.join(MEDIA, nome)))
