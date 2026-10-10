"""Ricava i tratti di scrittura di media/ynoy.png (v62, coda nuova v70): per ogni tratto una linea lungo lo scheletro
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
T = [   # v70: coordinate del logo con la coda nuova (media/ynoy.svg)
 ('Y', [(112,42),(146,44),(175,67),(195,96),(195,115)]),
 ('Y', [(308,42),(263,77),(219,111),(202,147),(161,180)]),
 ('N', [(311,44),(312,160),(300,165),(329,165)]),
 ('N', [(311,43),(323,54),(423,143),(433,154)]),
 ('N', [(428,145),(436,135),(436,49),(450,42)]),
 ('O', [(545,41),(481,77),(476,104),(486,140),(545,165),(603,145),(615,96),(598,57),(545,41)]),
 ('Y', [(612,42),(661,62),(688,96),(688,114)]),
 ('S', [(634,205),(673,170),(727,100),(783,50),(835,36),(884,50),(916,90),(922,125),(908,170),(865,210),(811,230),(760,235),(729,235),(666,228),(564,210),(447,190),(311,181),(219,188),(144,211),(89,222)]),
 ('S', [(141,214),(125,239)]),                                   # punta a forcella sotto lo svolazzo
 ('K', [(126,271),(104,257),(79,263),(69,286),(71,311)]),         # coda: 4 lune, dalla punta verso destra
 ('K', [(150,280),(126,288),(111,311),(114,336),(146,345)]),
 ('K', [(180,276),(170,296),(179,323),(214,320)]),
 ('K', [(220,265),(209,273),(212,287),(227,288),(231,273),(220,265)]),   # luna piena: giro stretto, il tratto largo la copre tutta
 ('C', [(775,135),(758,129),(745,145),(758,163),(776,155)]),
 ('C', [(800,129),(787,145),(800,164),(818,154),(818,137),(800,129)]),
 ('C', [(836,130),(836,163)]), ('C', [(830,164),(842,164)]),
 ('C', [(831,129),(850,129),(853,140),(848,147),(836,147)]), ('C', [(845,147),(865,164)]),
 ('C', [(874,130),(874,164)]), ('C', [(868,164),(880,164)]),
 ('C', [(868,129),(884,129),(892,140),(884,147),(874,147)]),
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
