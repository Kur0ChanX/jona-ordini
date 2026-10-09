"""Ricava i tratti di scrittura di media/ynoy.png (v62): per ogni tratto una linea lungo lo scheletro
del logo, nell'ordine in cui la scriverebbe una mano. Stampa i <path> SVG (coordinate 496x190) e
controlla che i tratti coprano tutto il logo. Uso: python3 tools/ynoy-tratti.py [cartella-anteprima]"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize
from skimage.graph import route_through_array
from scipy.ndimage import distance_transform_edt, binary_dilation

im = Image.open('media/ynoy.png')
a = np.array(im.split()[-1].resize((992, 380), Image.LANCZOS)) > 100   # lavoro al doppio
sk = skeletonize(a); dt = distance_transform_edt(a)
cost = np.where(sk, 1.0, np.where(a, 6.0, 60.0))

# tratti in ordine di scrittura: punti di passaggio (coordinate 992x380), lettera di appartenenza
T = [
 ('Y', [(95,64),(130,66),(160,90),(180,120),(180,140)]),
 ('Y', [(297,64),(250,100),(205,135),(188,172),(145,206)]),
 ('N', [(300,66),(301,186),(288,191),(318,191)]),
 ('N', [(300,65),(312,77),(415,168),(425,180)]),
 ('N', [(420,170),(428,160),(428,72),(443,64)]),
 ('O', [(541,63),(475,100),(470,128),(480,165),(541,191),(600,170),(613,120),(595,80),(541,63)]),
 ('Y', [(610,64),(660,85),(688,120),(688,138)]),
 ('S', [(632,225),(700,140),(780,50),(860,22),(920,30),(967,90),(950,170),(890,220),(800,256),(730,262),(665,252),(560,232),(440,217),(300,207),(155,222)]),
 ('T', [(130,235),(115,238),(100,244),(70,258),(55,268),(40,283),(30,295),(28,310),(37,325),(55,338),(75,347),(100,350),(140,346),(160,340),(180,322),(205,310),(225,300)]),
 ('S', [(236,281),(260,268),(290,254),(318,246)]),
 ('C', [(777,160),(760,154),(747,170),(760,189),(778,181)]),
 ('C', [(803,154),(790,170),(803,190),(822,180),(822,162),(803,154)]),
 ('C', [(840,155),(840,189)]), ('C', [(834,190),(846,190)]),
 ('C', [(835,154),(855,154),(858,165),(853,172),(840,172)]), ('C', [(849,172),(870,190)]),
 ('C', [(879,155),(879,190)]), ('C', [(873,190),(886,190)]),
 ('C', [(873,154),(890,154),(898,165),(890,173),(879,173)]),
]

def snap(p):
    x, y = p
    best = None
    for yy in range(max(0, y-6), min(380, y+7)):
        for xx in range(max(0, x-6), min(992, x+7)):
            if a[yy, xx]:
                d = (xx-x)**2 + (yy-y)**2 - (3 if sk[yy, xx] else 0)
                if best is None or d < best[0]: best = (d, xx, yy)
    return (best[1], best[2]) if best else (x, y)

def rdp(pts, eps):
    if len(pts) < 3: return pts
    p0, p1 = np.array(pts[0]), np.array(pts[-1]); v = p1 - p0; n = np.hypot(*v) or 1
    d = [abs(v[0]*(p[1]-p0[1]) - v[1]*(p[0]-p0[0])) / n if n > 1e-6 else np.hypot(p[0]-p0[0], p[1]-p0[1]) for p in pts[1:-1]]
    n = n or 1
    i = int(np.argmax(d)) + 1
    if d[i-1] > eps: return rdp(pts[:i+1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]

out, cov = [], Image.new('L', (992, 380), 0)
dc = ImageDraw.Draw(cov)
for let, wp in T:
    wp = [snap(p) for p in wp]
    path = []
    if let == 'T':  # trattini staccati: linea morbida (Catmull-Rom) che passa nei punti, senza scheletro
        P = [wp[0]] + wp + [wp[-1]]
        for i in range(1, len(P) - 2):
            p0, p1, p2, p3 = map(np.array, P[i-1:i+3])
            for t in np.linspace(0, 1, 12, endpoint=False):
                c = .5 * ((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t*t + (-p0+3*p1-3*p2+p3)*t**3)
                path.append((int(round(c[1])), int(round(c[0]))))
        path.append((wp[-1][1], wp[-1][0]))
    for p, q in (zip(wp, wp[1:]) if let != 'T' else []):
        seg, _ = route_through_array(cost, (p[1], p[0]), (q[1], q[0]), fully_connected=True, geometric=True)
        path += seg if not path else seg[1:]
    pts = np.array([(x, y) for y, x in path], float)
    k = 21 if let == 'S' else 7  # media mobile per togliere i gradini dei pixel
    if len(pts) > k:
        pad = np.vstack([np.repeat(pts[:1], k//2, 0), pts, np.repeat(pts[-1:], k//2, 0)])
        sm = np.array([pad[i:i+k].mean(0) for i in range(len(pts))]); sm[0], sm[-1] = pts[0], pts[-1]
    else: sm = pts
    sm = [tuple(p) for p in sm]
    h = len(sm)//2
    simp = rdp(sm[:h+1], .35)[:-1] + rdp(sm[h:], .35)  # in due metà: regge anche i giri chiusi (O)
    w = 30.0 if let == 'T' else float(np.percentile([dt[y, x] for y, x in path], 96)) * 2 + 6
    L = float(sum(np.hypot(q[0]-p[0], q[1]-p[1]) for p, q in zip(simp, simp[1:])))
    out.append({'l': let, 'w': round(w/2, 1), 'len': round(L/2, 1),
                'd': 'M' + ' '.join(f'{x/2:.1f} {y/2:.1f}' for x, y in simp)})
    dc.line(simp, fill=255, width=int(round(w)), joint='curve')
    for x, y in (simp[0], simp[-1]): dc.ellipse([x-w/2, y-w/2, x+w/2, y+w/2], fill=255)

miss = a & ~(np.array(cov) > 0)
print('pixel scoperti:', int(miss.sum()), 'su', int(a.sum()), file=sys.stderr)
if len(sys.argv) > 1:
    D = sys.argv[1]
    v = np.zeros((380, 992, 3), np.uint8) + 255
    v[a] = (200, 200, 200); v[(np.array(cov) > 0) & ~a] = (235, 245, 255); v[miss] = (255, 0, 0)
    vi = Image.fromarray(v); dv = ImageDraw.Draw(vi)
    for s in out:
        nums = [float(t) for t in s['d'][1:].split()]
        dv.line([(nums[i]*2, nums[i+1]*2) for i in range(0, len(nums), 2)], fill=(0, 90, 255), width=1)
    vi.save(D + '/copertura.png')
json.dump(out, sys.stdout)
