# Logo Jona -> SVG vettoriale (nitido a ogni ingrandimento), dalla maschera PNG 480x384 usata nell'app.
# Conchiglia: contorno ricalcato (potrace). Lettere sottili: linea al centro (scheletro), rette raddrizzate,
# angoli vivi, curve lisciate, spessore misurato dall'area; punte sui bordi della riga tagliate dritte.
# Uso: python3 tools/logo-jona.py <maschera.png> <uscita.svg>   (pip: numpy scipy pillow scikit-image potracer)
import sys, numpy as np, potrace
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize
src, out = sys.argv[1], sys.argv[2]
K = 8; CUT = 140; TOL = float(sys.argv[3]) if len(sys.argv) > 3 else 0.12
a = np.asarray(Image.open(src).convert('LA'))[:, :, 1].astype(float) / 255
h, w = a.shape
big = ndimage.gaussian_filter(ndimage.zoom(a, K, order=3), K * 0.35)
f = lambda v: f"{v:.2f}".rstrip('0').rstrip('.')
# 1) conchiglia: contorno
m = big > 0.5; m[CUT * K:] = False
fill = []
for c in potrace.Bitmap(~m).trace(turdsize=K * K * 2, alphamax=1.0, opticurve=True, opttolerance=0.2):
    s = 1 / K; p = c.start_point; d = [f"M{f(p.x*s)} {f(p.y*s)}"]
    for g in c.segments:
        if g.is_corner: d.append(f"L{f(g.c.x*s)} {f(g.c.y*s)}L{f(g.end_point.x*s)} {f(g.end_point.y*s)}")
        else: d.append(f"C{f(g.c1.x*s)} {f(g.c1.y*s)} {f(g.c2.x*s)} {f(g.c2.y*s)} {f(g.end_point.x*s)} {f(g.end_point.y*s)}")
    fill.append(''.join(d) + 'Z')
# 2) lettere: scheletro
from scipy.interpolate import splprep, splev
from skimage.morphology import skeletonize
mb = big > 0.25; mb[:CUT * K] = False
lab, n = ndimage.label(mb, structure=np.ones((3, 3)))
sk = skeletonize(mb)
def rdp(P, e):
    if len(P) < 3: return P
    A, B = P[0], P[-1]; v = B - A; L = np.hypot(*v)
    dd = np.abs(v[0]*(P[:,1]-A[1]) - v[1]*(P[:,0]-A[0])) / L if L > 0 else np.hypot(*(P - A).T)
    i = int(np.argmax(dd))
    if dd[i] > e: return np.vstack([rdp(P[:i + 1], e)[:-1], rdp(P[i:], e)])
    return np.vstack([A, B])
def clen(Q): return float(np.hypot(*np.diff(Q, axis=0).T).sum()) if len(Q) > 1 else 0.0
def fitline(Q):
    c = Q.mean(0); u = np.linalg.svd(Q - c)[2][0]
    if (Q[-1] - Q[0]) @ u < 0: u = -u
    return c, u
def inter(c1, u1, c2, u2):
    M = np.array([u1, -u2]).T
    if abs(np.linalg.det(M)) < 1e-3: return None
    t1, _ = np.linalg.solve(M, c2 - c1); return c1 + t1 * u1
def proj(c, u, p): return c + ((p - c) @ u) * u
def dedup(Q):
    return Q[np.r_[True, np.hypot(*np.diff(Q, axis=0).T) > 1e-6]]
def trimmed(Q, tr):
    s = np.r_[0, np.cumsum(np.hypot(*np.diff(Q, axis=0).T))]; L = s[-1]
    return Q[(s >= tr) & (s <= L - tr)]
def bordo(r0, r1):
    rows = a[r0:r1].max(1); ys = np.nonzero(rows > 0.3)[0]
    return (round(float(r0 + ys[0] + 1 - rows[ys[0]]), 2), round(float(r0 + ys[-1] + rows[ys[-1]]), 2))
BANDS = [bordo(150, 320), bordo(330, h)]
N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
strokes = {}   # (sw, riga) -> [d]
loops_all = {}  # anelli (O): senza taglio, le curve escono un poco dalla riga
stubs = {}
def pieces_of(P, sw):
    """divide una catena in pezzi: ('L', c, u, Q) retta o ('C', Q) curva"""
    V = rdp(P, 0.35); cut = [0]
    for j in range(1, len(V) - 1):
        u, v = V[j] - V[j - 1], V[j + 1] - V[j]
        ang = np.degrees(np.arccos(np.clip(u @ v / (np.hypot(*u) * np.hypot(*v) + 1e-9), -1, 1)))
        if ang > 35: cut.append(int(np.argmin(np.hypot(*(P - V[j]).T))))
    cut.append(len(P) - 1)
    out = []
    for i0, i1 in zip(cut, cut[1:]):
        Q = dedup(P[i0:i1 + 1])
        if len(Q) < 2: continue
        out.append(Q)
    # pezzetti in punta (riccioli dello scheletro) uniti al vicino
    while len(out) > 1 and clen(out[0]) < 1.5 * sw: out[1] = np.vstack([out[0][:-1], out[1]]); out.pop(0)
    while len(out) > 1 and clen(out[-1]) < 1.5 * sw: out[-2] = np.vstack([out[-2], out[-1][1:]]); out.pop()
    res = []
    for k, Q in enumerate(out):
        L = clen(Q); core = trimmed(Q, min(1.5 * sw, 0.25 * L))
        straight = False
        if len(core) >= 3:
            c, u = fitline(core); nrm = np.array([-u[1], u[0]]); r = np.abs((core - c) @ nrm)
            straight = r.max() < max(0.3, 0.5 * sw) and np.sqrt((r ** 2).mean()) < 0.15
        if straight: res.append(['L', c, u, Q])
        else: res.append(['C', Q])
    # pezzetti interni (meno di 1,5 spessori) tolti; curve vicine unite
    k = 1
    while k < len(res) - 1:
        q = res[k][3] if res[k][0] == 'L' else res[k][1]
        if clen(q) < 1.5 * sw: res.pop(k)
        else: k += 1
    k = 0
    while k < len(res) - 1:
        if res[k][0] == 'C' and res[k + 1][0] == 'C': res[k] = ['C', np.vstack([res[k][1], res[k + 1][1][1:]])]; res.pop(k + 1)
        else: k += 1
    # curve corte tra due rette = angolo arrotondato dallo scheletro: tolte
    k = 1
    while k < len(res) - 1:
        if res[k][0] == 'C' and clen(res[k][1]) < 5 * sw and res[k - 1][0] == 'L' and res[k + 1][0] == 'L': res.pop(k)
        else: k += 1
    return res
def endinfo(pc, first):
    """punto finale e direzione verso l'esterno"""
    if pc[0] == 'L':
        Q = pc[3]; p = proj(pc[1], pc[2], Q[0] if first else Q[-1]); return p, (-pc[2] if first else pc[2])
    Q = pc[1]
    if first: Q = Q[::-1]
    # direzione dalla parte di curva lontana dalla punta (la punta dello scheletro si arriccia)
    s = np.r_[0, np.cumsum(np.hypot(*np.diff(Q, axis=0).T))]; s = s[-1] - s   # distanza dalla punta
    A = Q[(s >= sw_cur * 1.0) & (s <= sw_cur * 3.0)]
    if len(A) < 2: A = Q[-min(6, len(Q)):]
    c, u = fitline(A)
    return proj(c, u, Q[-1]), u
def curve_pts(Q):
    Q = dedup(Q)
    if len(Q) < 4: return Q
    tck, _ = splprep([Q[:, 0], Q[:, 1]], s=len(Q) * (0.06 ** 2), k=3)
    X, Y = splev(np.linspace(0, 1, max(6, int(clen(Q) / 0.35)) + 1), tck); return np.c_[X, Y]
for k in range(1, n + 1):
    comp = (lab == k); s = sk & comp
    pts = set(zip(*np.nonzero(s)))
    nb = lambda p: [(p[0]+dy, p[1]+dx) for dy, dx in N8 if (p[0]+dy, p[1]+dx) in pts]
    area = big[comp].sum() / (K * K)
    band = BANDS[0] if np.nonzero(comp.any(1))[0].mean() / K < 330 else BANDS[1]
    nodes = {p for p in pts if len(nb(p)) != 2}
    # gruppi di nodi vicini = un solo nodo
    nid = {}; cnt = 0
    for p in nodes:
        if p in nid: continue
        st = [p]; nid[p] = cnt
        while st:
            q = st.pop()
            for r in nb(q):
                if r in nodes and r not in nid: nid[r] = cnt; st.append(r)
        cnt += 1
    seen = set(); chains = []
    for p in nodes:
        for q in nb(p):
            if q in nodes or (p, q) in seen: continue
            ch = [p, q]; seen.add((p, q))
            while ch[-1] not in nodes:
                nx = [r for r in nb(ch[-1]) if r != ch[-2] and r not in ch[-3:]]
                if not nx: break
                ch.append(nx[0])
            seen.add((ch[-1], ch[-2])); chains.append([ch, nid.get(ch[0]), nid.get(ch[-1])])
    rest = pts - nodes - {c for ch in chains for c in ch[0]}
    loops = []
    while rest:
        p = next(iter(rest)); ch = [p, nb(p)[0]]
        while True:
            nx = [r for r in nb(ch[-1]) if r != ch[-2] and r not in ch[-3:]]
            if not nx or nx[0] == p: break
            ch.append(nx[0])
        loops.append(ch); rest -= set(ch)
    length = (sum(len(c[0]) for c in chains) + sum(len(c) for c in loops)) / K
    sw = sw_cur = area / max(length, 1)
    # rametti: catena corta con una punta libera (nodo con una sola catena)
    for _ in range(3):
        deg = {}
        for c in chains:
            for e in (c[1], c[2]): deg[e] = deg.get(e, 0) + 1
        keep = []
        for c in chains:
            short = len(c[0]) / K < 2.5 * sw
            if short and len(chains) > 1 and (deg[c[1]] == 1 or deg[c[2]] == 1) and not (deg[c[1]] == 1 and deg[c[2]] == 1): continue
            keep.append(c)
        if len(keep) == len(chains): break
        chains = keep
    deg = {}
    for c in chains:
        for e in (c[1], c[2]): deg[e] = deg.get(e, 0) + 1
    # catene che s'incontrano in un nodo con due sole catene: unite in una (l'angolo diventa interno)
    def other(c, nd): return c[2] if c[1] == nd else c[1]
    merged = True
    while merged:
        merged = False
        deg = {}
        for c in chains:
            for e in (c[1], c[2]): deg[e] = deg.get(e, 0) + 1
        for nd, dg in deg.items():
            if dg != 2: continue
            two = [c for c in chains if nd in (c[1], c[2])]
            if len(two) != 2: continue
            c1, c2 = two
            a1 = c1[0] if c1[2] == nd else c1[0][::-1]
            a2 = c2[0] if c2[1] == nd else c2[0][::-1]
            chains.remove(c1); chains.remove(c2)
            chains.append([a1 + a2[1:], other(c1, nd), other(c2, nd)]); merged = True; break
    deg = {}
    for c in chains:
        for e in (c[1], c[2]): deg[e] = deg.get(e, 0) + 1
    # pezzi e punti finali
    items = []
    for ch, n0, n1 in chains:
        P = np.array([(x + .5, y + .5) for y, x in ch], float) / K
        pcs = pieces_of(P, sw)
        if not pcs: continue
        e0 = list(endinfo(pcs[0], True)); e1 = list(endinfo(pcs[-1], False))
        items.append({'pcs': pcs, 'n': [n0, n1], 'e': [e0, e1]})
    # angoli tra catene (nodo con due sole catene): punto d'incontro delle due rette
    ends = {}
    for it in items:
        for j in (0, 1): ends.setdefault(it['n'][j], []).append((it, j))
    for node, lst in ends.items():
        if deg.get(node, 0) == 1:
            for it, j in lst: it.setdefault('free', set()).add(j)
            continue
        if len(lst) == 2:
            (i1, j1), (i2, j2) = lst
            p1 = i1['pcs'][0 if j1 == 0 else -1]; p2 = i2['pcs'][0 if j2 == 0 else -1]
            q = inter(p1[1], p1[2], p2[1], p2[2]) if p1[0] == 'L' and p2[0] == 'L' else None
            mid = (i1['e'][j1][0] + i2['e'][j2][0]) / 2
            if q is None or np.hypot(*(q - mid)) > 5 * sw: q = mid
            i1['e'][j1][0] = q; i2['e'][j2][0] = q; i1.setdefault('corner', set()).add(j1); i2.setdefault('corner', set()).add(j2)
    d_out = []; st_out = []; loop_out = []
    def stretch(p, t, free, corner):
        if corner: return p
        if free:
            for yb in band:
                if abs(p[1] - yb) < sw * 2.2 and abs(t[1]) > 0.3:
                    kk = (yb - p[1]) / t[1]
                    if kk > -sw:
                        a0, a1 = p - t * sw, p + t * (kk + sw * 2)
                        st_out.append(f"M{f(a0[0])} {f(a0[1])}L{f(a1[0])} {f(a1[1])}"); return p
        return p + t * sw / 2
    for it in items:
        pcs = it['pcs']; fr = it.get('free', set()); co = it.get('corner', set())
        seq = [stretch(it['e'][0][0], it['e'][0][1], 0 in fr, 0 in co)]
        for kk, pc in enumerate(pcs):
            if pc[0] == 'C':
                C = curve_pts(pc[1])
                # tolgo le punte arricciate: tengo la curva solo tra i due punti finali proiettati
                a0 = seq[-1] if kk == 0 else None
                seq.extend(C[1:-1])
            if kk + 1 < len(pcs):
                nx = pcs[kk + 1]
                q = inter(pc[1], pc[2], nx[1], nx[2]) if pc[0] == 'L' and nx[0] == 'L' else None
                if q is None:
                    q = (pc[3][-1] if pc[0] == 'L' else pc[1][-1])
                    if pc[0] == 'L': q = proj(pc[1], pc[2], q)
                    if nx[0] == 'L': q = proj(nx[1], nx[2], q)
                seq.append(q)
        seq.append(stretch(it['e'][1][0], it['e'][1][1], 1 in fr, 1 in co))
        R = rdp(np.array(seq), 0.01)
        d_out.append('M' + 'L'.join(f"{f(x)} {f(y)}" for x, y in R))
    for ch in loops:
        Q = dedup(np.array([(x + .5, y + .5) for y, x in ch], float) / K)
        tck, _ = splprep([Q[:, 0], Q[:, 1]], s=len(Q) * (0.06 ** 2), per=1, k=3)
        X, Y = splev(np.linspace(0, 1, int(len(Q) / K * 3) + 1), tck)
        loop_out.append('M' + 'L'.join(f"{f(x)} {f(y)}" for x, y in zip(X, Y)) + 'Z')
    key = (round(sw, 2), BANDS.index(band))
    strokes.setdefault(key, []).extend(d_out); stubs.setdefault(key, []).extend(st_out); loops_all.setdefault(key, []).extend(loop_out)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><defs>'
       + ''.join(f'<clipPath id="r{i}"><rect x="0" y="{b[0]}" width="{w}" height="{round(b[1]-b[0], 2)}"/></clipPath>' for i, b in enumerate(BANDS))
       + f'</defs><path d="{"".join(fill)}"/>']
for (sw, bi), d in sorted(strokes.items()):
    svg.append(f'<path clip-path="url(#r{bi})" fill="none" stroke="#000" stroke-width="{sw}" stroke-linejoin="miter" stroke-miterlimit="10" d="{"".join(d)}"/>')
    if loops_all[(sw, bi)]: svg.append(f'<path fill="none" stroke="#000" stroke-width="{sw}" d="{"".join(loops_all[(sw, bi)])}"/>')
    if stubs[(sw, bi)]: svg.append(f'<path clip-path="url(#r{bi})" fill="none" stroke="#000" stroke-width="{sw}" d="{"".join(stubs[(sw, bi)])}"/>')
open(out, 'w').write(''.join(svg) + '</svg>')
print(n, 'lettere, righe', BANDS)
