# Rifà media/invio-chef.mp4 (animazione «Inviato allo chef») dal filmato originale di Mario (sfondo bianco puro).
# Uso: pip install scipy pillow  →  python3 tools/anim-invio.py <video.mp4> [fine in secondi=4.2]
# Uscita: video H.264 720x808 a 24 fps, sopra il colore e sotto la trasparenza in bianco e nero (la unisce sendAnim con WebGL),
# invertito nel tempo (lo chef a sinistra porge il menù alla ragazza a destra).
# Maschera: lo sfondo è bianco "bruciato" (tutti i canali >= SOGLIA); la giacca dello chef è un bianco più grigio e resta piena.
# Si toglie il bianco collegato al bordo e anche ogni zona bianca chiusa (tra le braccia, tra manica e menù);
# restano corpo, divisa bianca, vestito nero e menù. Bordi sfumati di poco, e sfumatura verso i lati del filmato.
import os, subprocess, sys, tempfile
import numpy as np, scipy.ndimage as ndi
from PIL import Image

SRC = sys.argv[1]; END = float(sys.argv[2]) if len(sys.argv) > 2 else 4.2
OUT = os.path.join(os.path.dirname(__file__), '..', 'media', 'invio-chef.mp4')
W, H = 720, 404
SOGLIA = 250     # minimo dei tre canali da cui un punto è sfondo
BUCO = 150       # zone bianche chiuse più piccole di così (in punti) restano piene: niente forellini
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
    return tieni[lab].astype(np.float32)
sm = lambda t: (lambda c: c * c * (3 - 2 * c))(np.clip(t, 0, 1))
def edges(h, w, L=0.04, R=0.03, T=0.04, B=0.05):   # il soggetto sparisce dolcemente verso i bordi del filmato
    xs = np.linspace(0, 1, w); ys = np.linspace(0, 1, h)
    return (sm(ys / T) * sm((1 - ys) / B))[:, None] * (sm(xs / L) * sm((1 - xs) / R))[None, :]

frames, raw = [], []
for i in range(1, N + 1):
    rgb = np.asarray(Image.open(f'{tmp}/f{i:03d}.png').convert('RGB'))
    frames.append(rgb.astype(np.float32) / 255)
    m = ndi.binary_erosion(mask(rgb) > 0.5, structure=disk(2)).astype(np.float32)   # via l'alone chiaro del bordo
    raw.append(ndi.gaussian_filter(m, 1.6))
E = edges(*raw[0].shape)
for k in range(N):
    rgb = frames[k]
    a = np.clip(raw[k], 0, 1)   # niente media coi fotogrammi vicini: lascerebbe scie sulle mani in movimento
    # bordi col colore del soggetto (niente alone bianco sullo sfondo scuro dell'app)
    inner = (a > 0.95).astype(np.float32); w = ndi.uniform_filter(inner, 9)
    pc = np.stack([ndi.uniform_filter(rgb[..., c] * inner, 9) for c in range(3)], -1) / np.maximum(w, 1e-4)[..., None]
    t = (a > 0.95)[..., None] | (w < 1e-3)[..., None]
    col = np.where(t, rgb, pc)
    a = a * E
    out = Image.new('RGB', (W, 2 * H))
    out.paste(Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), (0, 0))
    out.paste(Image.fromarray((a * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).convert('RGB'), (0, H))
    out.save(f'{tmp}/s{N - k:03d}.png')   # numerati al contrario: il video esce invertito nel tempo
    print('fotogramma', k + 1, 'di', N, flush=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{tmp}/s%03d.png', '-c:v', 'libx264', '-profile:v', 'main',
                '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-tune', 'film', '-movflags', '+faststart', '-an', OUT], check=True)
print('fatto:', os.path.abspath(OUT))
