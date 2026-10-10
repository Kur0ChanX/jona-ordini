"""Logo YNOY CORP (v70). Il disegno vero è il vettoriale media/ynoy.svg (496x190, nero, pieno con evenodd):
coda nuova di Mario del 10/10/2026 (docs/img/logo/vecchi/ynoy-coda-mario-2026-10-10.jpg, punta a forcella + 4 lune)
unita al logo dell'app (CORP senza «&», scelta v53), poi ridisegnato a curve (potrace). Le versioni con la «&»
sono state tolte su richiesta di Mario; la storia resta in git (v53-v69: tools/originale-ynoy.jpg).
Questo script rifà dal vettoriale: media/ynoy.png (maschera dell'app, 992x380, nero + trasparenza)
(per stampa e grafici ci sono i PNG 4000 px in docs/img/logo/ynoy-corp/png, da tools/logo-ynoy-corp.py).
Uso: pip install cairosvg && python3 tools/logo-ynoy.py
Dopo: python3 tools/ynoy-tratti.py > /tmp/t.json && python3 tools/ynoy-html.py /tmp/t.json (animazione)."""
import io, cairosvg
from PIL import Image
svg = open('media/ynoy.svg', 'rb').read()
for out, w in (('media/ynoy.png', 992),):
    a = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg, output_width=w, output_height=round(w * 190 / 496)))).split()[-1]
    Image.merge('LA', (Image.new('L', a.size, 0), a)).save(out, optimize=True)
    print(out, a.size)
