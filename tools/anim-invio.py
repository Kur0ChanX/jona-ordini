# Rifà media/invio-chef.mp4 (animazione «Inviato allo chef») dal filmato originale di Mario.
# Uso: pip install "rembg[cpu]" scipy  →  python3 tools/anim-invio.py <video.mp4> [fine in secondi=4.2] [sfumatura sinistra=0.12] [sfumatura destra=0.12]
# (il video viene portato a 24 fotogrammi al secondo; la sfumatura è la parte del bordo in cui le braccia spariscono, 0.12 = 12%)
# Uscita: video H.264 720x808, sopra il colore e sotto la trasparenza in bianco e nero (la unisce sendAnim con WebGL).
# Maschera = scontorno IA (isnet ∪ u2net, mediato con i fotogrammi vicini) × colori caldi (pelle, menù, pagine crema;
# via sfondo, giacca bianca, maniche nere e bottoni) × bordi sfumati (le braccia spariscono verso i lati).
import os, subprocess, sys, tempfile
import numpy as np, scipy.ndimage as ndi
from PIL import Image
from rembg import remove, new_session

SRC = sys.argv[1]; END = float(sys.argv[2]) if len(sys.argv) > 2 else 4.2
FL = float(sys.argv[3]) if len(sys.argv) > 3 else 0.12; FR = float(sys.argv[4]) if len(sys.argv) > 4 else 0.12
OUT = os.path.join(os.path.dirname(__file__), '..', 'media', 'invio-chef.mp4')
W, H = 720, 404
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-t', str(END), '-vf', 'fps=24,scale=960:-2', f'{tmp}/f%03d.png'], check=True)
N = len([f for f in os.listdir(tmp) if f.startswith('f')])

sm = lambda t: (lambda c: c * c * (3 - 2 * c))(np.clip(t, 0, 1))
def box(x, r):  # sfocatura a scatola separabile
    for ax in (0, 1):
        p = np.pad(x, [(r + 1, r) if a == ax else (0, 0) for a in range(x.ndim)], mode='edge')
        c = np.cumsum(p, axis=ax, dtype=np.float64); n = x.shape[ax]
        sl = lambda a, b: tuple(slice(a, b) if i == ax else slice(None) for i in range(x.ndim))
        x = ((c[sl(2 * r + 1, 2 * r + 1 + n)] - c[sl(0, n)]) / (2 * r + 1)).astype(np.float32)
    return x
def warm(rgb):
    x = rgb * 255; w = (x[..., 0] - x[..., 2]) / (np.maximum(x.max(2), 90) + 20)
    return sm((w - 0.095) / 0.03)
def edges(h, w, L, R, B=0.06):
    xs = np.linspace(0, 1, w); ys = np.linspace(0, 1, h)
    return sm((1 - ys) / B)[:, None] * (sm(xs / L) * sm((1 - xs) / R))[None, :]

S1, S2 = new_session('isnet-general-use'), new_session('u2net')
CACHE = os.path.join(tempfile.gettempdir(), 'anim-invio-cache'); os.makedirs(CACHE, exist_ok=True)
frames, raw = [], []
for i in range(1, N + 1):
    im = Image.open(f'{tmp}/f{i:03d}.png').convert('RGB'); frames.append(np.asarray(im).astype(np.float32) / 255)
    cf = os.path.join(CACHE, f'{os.path.basename(SRC)}_{i:03d}.npy')   # scontorno già fatto: non lo rifà
    if os.path.exists(cf): raw.append(np.load(cf).astype(np.float32)); continue
    a = np.asarray(remove(im, session=S1, only_mask=True), np.float32) / 255
    b = np.asarray(remove(im, session=S2, only_mask=True), np.float32) / 255
    raw.append(np.maximum(a, b)); np.save(cf, raw[-1].astype(np.float16)); print('maschera', i, flush=True)
E = edges(*raw[0].shape, FL, FR)
for k in range(N):
    rgb = frames[k]
    a = 0.5 * raw[k] + 0.25 * (raw[max(0, k - 1)] + raw[min(N - 1, k + 1)])   # meno sfarfallio
    a = np.clip(a * warm(rgb) * E, 0, 1); a = np.clip((a - 0.06) / 0.88, 0, 1)
    # logo chiaro dentro il menù e angoli rosicchiati: si riempiono i buchi della parte piena
    full = ndi.binary_fill_holes(ndi.binary_closing(a > 0.5, structure=np.ones((3, 3)), iterations=6))
    a = np.maximum(a, full.astype(np.float32) * E)
    lab, _ = ndi.label(a > 0.02); keep = np.bincount(lab.ravel()) > 2500; keep[0] = False; a = a * keep[lab]  # via i puntini
    w = box(a, 4); pc = box(rgb * a[..., None], 4) / np.maximum(w, 1e-4)[..., None]   # bordi col colore del soggetto
    t = np.clip(a / 0.9, 0, 1)[..., None]; col = rgb * t + pc * (1 - t)
    out = Image.new('RGB', (W, 2 * H))
    out.paste(Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), (0, 0))
    out.paste(Image.fromarray((a * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).convert('RGB'), (0, H))
    out.save(f'{tmp}/s{k + 1:03d}.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{tmp}/s%03d.png', '-c:v', 'libx264', '-profile:v', 'main',
                '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-tune', 'film', '-movflags', '+faststart', '-an', OUT], check=True)
print('fatto:', os.path.abspath(OUT))
