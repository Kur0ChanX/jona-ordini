#!/usr/bin/env python3
"""Guardia delle foto a Mario (E294, Mario 04/11 18:2x: «mi stai rimandando le foto con lo scroll … a bassa risoluzione»).
PreToolUse su SendUserFile: ogni PNG mandato a Mario dev'essere in alta risoluzione (larghezza almeno 700 px, cioè
telefono a 2x) e NON una foto lunga da scroll (altezza oltre 2,2 volte la larghezza): quelle si tagliano con
tools/taglia-foto.py (skill `foto`). Le foto delle prove (`fullPage: true`) sono per le prove, non per Mario.
E313 (Mario 09/11 19:11 «le foto porter mi sembrano uguali … fai in modo che vedi il cambiamento più chiaro»):
una foto «prima» e una «dopo» mandate separate si bloccano: si manda UN confronto fatto con
tools/confronta-foto.py (zona cambiata ingrandita, PRIMA e DOPO con l'etichetta, riquadro rosso).
E433 (Mario 13/11 «tu guardi le immagini piccole … attenzione ai token»): PreToolUse su Read di un'immagine troppo grande
→ blocca. E454 (Giri 70, Mario 13/11 20:2x «mettiamo la regola»): il costo di un'immagine sono i PIXEL, non i KB
(documentazione Claude «Vision», letta 13/11/2026: ⌈larghezza/28⌉ × ⌈altezza/28⌉ token; misurato nel registro della
sessione: 1092×1092 px da 22 KB = ~1.500 token). Si blocca sopra TETTO_TOKEN; i KB contano solo se i pixel non si leggono.
Zero dipendenze: legge solo l'intestazione del PNG, la grandezza del file e i nomi. Esce 2 (blocca) con il motivo."""
import json
import os
import re
import struct
import sys

LARGHEZZA_MIN = 700
RAPPORTO_MAX = 2.2
PRIMA = re.compile(r'(^|[-_. ])(prima|before)([-_. ]|$)', re.I)
DOPO = re.compile(r'(^|[-_. ])(dopo|after)([-_. ]|$)', re.I)
CONFRONTO = re.compile(r'confronto|compare', re.I)
IMMAGINI = ('.png', '.jpg', '.jpeg', '.webp', '.gif')
LETTURA_MAX = 40_000  # byte: solo se le misure non si leggono (E433)
TETTO_TOKEN = 1600  # token visivi: ~1100×1100 px o 800×1500 (E454)


def misura_png(percorso):
    try:
        with open(percorso, 'rb') as f:
            testa = f.read(24)
        if testa[:8] != b'\x89PNG\r\n\x1a\n':
            return None
        return struct.unpack('>II', testa[16:24])
    except OSError:
        return None


def misura_jpeg(percorso):
    try:
        with open(percorso, 'rb') as f:
            b = f.read(262_144)
    except OSError:
        return None
    if b[:2] != b'\xff\xd8':
        return None
    i = 2
    while i + 9 < len(b):
        if b[i] != 0xFF:
            return None
        m = b[i + 1]
        if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7:
            i += 2
            continue
        n = struct.unpack('>H', b[i + 2:i + 4])[0]
        if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
            h, w = struct.unpack('>HH', b[i + 5:i + 9])
            return w, h
        i += 2 + n
    return None


def misura(percorso):
    return misura_png(percorso) or misura_jpeg(percorso)


def token_immagine(w, h):
    """Token visivi (documentazione Claude «Vision»): un token ogni 28×28 px, al massimo 4784 (lato lungo 2576)."""
    return min(4784, -(-w // 28) * -(-h // 28))


def main():
    try:
        dati = json.load(sys.stdin)
    except ValueError:
        return 0
    entrata = dati.get('tool_input') or {}
    if dati.get('tool_name') == 'Read':
        p = str(entrata.get('file_path') or '')
        if not p.lower().endswith(IMMAGINI):
            return 0
        m = misura(p)
        if m:
            t = token_immagine(*m)
            if t > TETTO_TOKEN:
                print(f'IMMAGINE TROPPO GRANDE DA LEGGERE (E454): {os.path.basename(p)} è {m[0]}×{m[1]} px = ~{t} token, '
                      f'il tetto è {TETTO_TOKEN} (contano i pixel, non i KB). Fai una copia nella scratchpad: '
                      'convert <foto> -resize 1000x1000 <copia.jpg> e leggi quella. A Mario le foto buone con lo strumento dei file.',
                      file=sys.stderr)
                return 2
            return 0
        try:
            peso = os.path.getsize(p)
        except OSError:
            return 0
        if peso > LETTURA_MAX:
            print(f'IMMAGINE TROPPO GRANDE DA LEGGERE (E433): {os.path.basename(p)} pesa {peso // 1000} KB, il tetto è '
                  f'{LETTURA_MAX // 1000} KB. Fai una copia nella scratchpad: convert <foto> -resize 600x -quality 60 <copia.jpg> '
                  '(o più piccola) e leggi quella. A Mario le foto buone con lo strumento dei file.', file=sys.stderr)
            return 2
        return 0
    file = entrata.get('files') or []
    problemi = []
    for p in file:
        if not str(p).lower().endswith('.png'):
            continue
        m = misura_png(p)
        if not m:
            continue
        w, h = m
        nome = os.path.basename(p)
        if w < LARGHEZZA_MIN:
            problemi.append(f'{nome}: {w}×{h}, bassa risoluzione (serve deviceScaleFactor 2: almeno {LARGHEZZA_MIN} px di larghezza)')
        elif h > RAPPORTO_MAX * w:
            problemi.append(f'{nome}: {w}×{h}, foto lunga da scroll: tagliala con python3 -I tools/taglia-foto.py e manda i pezzi')
    nomi = [os.path.splitext(os.path.basename(str(p)))[0] for p in file
            if str(p).lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    sciolte = [n for n in nomi if not CONFRONTO.search(n)]
    if any(PRIMA.search(n) for n in sciolte) and any(DOPO.search(n) for n in sciolte):
        problemi.append('foto «prima» e «dopo» separate: sul telefono sembrano uguali (E313). Manda UN confronto: '
                        'python3 -I tools/confronta-foto.py <prima> <dopo> [uscita] --testo "cosa guardare"')
    if problemi:
        print('FOTO BLOCCATA (skill foto, E294 E313): ' + ' · '.join(problemi), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
