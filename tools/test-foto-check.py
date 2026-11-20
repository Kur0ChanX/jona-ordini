#!/usr/bin/env python3
"""Prova di .claude/hooks/foto-check.py (E294; C469 A4: entra nel pacchetto del kit). Uso: python3 -I tools/test-foto-check.py"""
import json
import os
import struct
import subprocess
import sys
import tempfile
import zlib

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, '..', '.claude', 'hooks', 'foto-check.py')
errori = 0


def png(cartella, nome, w, h):
    """Solo l'intestazione vera (firma + IHDR): l'hook legge i primi 24 byte."""
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    blocco = struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr))
    p = os.path.join(cartella, nome)
    with open(p, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + blocco)
    return p


def prova(nome, files, bloccata, strumento='SendUserFile'):
    global errori
    dati = {'tool_name': strumento, 'tool_input': {'file_path': files[0]} if strumento == 'Read' else {'files': files}}
    r = subprocess.run([sys.executable, '-I', HOOK], input=json.dumps(dati), capture_output=True, text=True)
    ok = (r.returncode == 2) == bloccata
    if not ok:
        errori += 1
    print(('ok  ' if ok else 'NO  ') + nome + ('' if ok else f' → exit {r.returncode} {r.stderr.strip()}'))


with tempfile.TemporaryDirectory() as d:
    buona = png(d, 'telefono-2x.png', 780, 1600)
    prova('telefono 2x, alta ≤ 2,2 larghezze: passa', [buona], False)
    prova('bassa risoluzione (390 px): bloccata', [png(d, 'telefono-1x.png', 390, 800)], True)
    prova('foto lunga da scroll (780×4238): bloccata', [png(d, 'lunga.png', 780, 4238)], True)
    # E433: Read di un'immagine oltre 40 KB bloccato; piccola, non immagine o file mancante passano.
    def grande(nome, n):
        p = os.path.join(d, nome)
        with open(p, 'wb') as f:
            f.write(b'\xff\xd8' + b'0' * n)
        return p
    prova('Read di una foto da 56 KB: bloccata', [grande('controllo.jpg', 56_000)], True, 'Read')
    prova('Read di una copia da 37 KB: passa', [grande('piccola.jpg', 37_000)], False, 'Read')
    prova('Read di un testo grande: passa', [grande('appunti.md', 90_000)], False, 'Read')
    # E454: contano i PIXEL (⌈l/28⌉×⌈a/28⌉ token, tetto 1600), non i KB: misure lette da PNG e JPEG veri.
    def jpeg(nome, w, h, coda=0):
        p = os.path.join(d, nome)
        app0 = b'\xff\xe0' + struct.pack('>H', 16) + b'JFIF\x00' + b'\x00' * 9
        sof = b'\xff\xc0' + struct.pack('>HBHHB', 11, 8, h, w, 1) + b'\x01\x11\x00'
        with open(p, 'wb') as f:
            f.write(b'\xff\xd8' + app0 + sof + b'\x00' * coda)
        return p
    prova('E454 Read JPEG 1000×1000 da 60 KB: passa (1296 token)', [jpeg('quadra.jpg', 1000, 1000, 60_000)], False, 'Read')
    prova('E454 Read JPEG 1092×2202: bloccata (3081 token)', [jpeg('alta.jpg', 1092, 2202)], True, 'Read')
    prova('E454 Read PNG 1082×2202 piccolo di KB: bloccata', [png(d, 'pagina.png', 1082, 2202)], True, 'Read')
    prova('E454 Read PNG 600×1100: passa (880 token)', [png(d, 'copia.png', 600, 1100)], False, 'Read')
    prova('Read di una foto che non c\'è: passa', [os.path.join(d, 'manca.png')], False, 'Read')
    prova('una buona e una lunga: bloccata', [buona, png(d, 'lunga2.png', 800, 2000)], True)
    prova('non PNG (video): passa', [os.path.join(d, 'video.webm')], False)
    prova('PNG che non esiste: passa (niente da misurare)', [os.path.join(d, 'manca.png')], False)
    prova('nessun file: passa', [], False)
    # E313: prima e dopo separate → bloccate; il confronto (anche con una foto intera in più) passa
    pr, do = png(d, 'c409-prima-pc.png', 2732, 1536), png(d, 'c409-dopo-pc.png', 2732, 1536)
    conf = png(d, 'c409-dopo-pc-confronto.png', 1600, 1592)
    prova('E313 prima + dopo separate: bloccate', [pr, do], True)
    prova('E313 before + after (inglese): bloccate', [png(d, 'before.png', 780, 1600), png(d, 'after_1.png', 780, 1600)], True)
    prova('E313 solo il confronto: passa', [conf], False)
    prova('E313 confronto + dopo intera: passa', [conf, do], False)
    prova('E313 solo «dopo» (funzione nuova): passa', [do], False)
    prova('E313 parole che contengono «dopo» (dopopranzo): passa', [png(d, 'dopopranzo.png', 780, 1600), pr], False)
    r = subprocess.run([sys.executable, '-I', HOOK], input='non json', capture_output=True, text=True)
    if r.returncode != 0:
        errori += 1
    print(('ok  ' if r.returncode == 0 else 'NO  ') + 'entrata rotta: silenzio')

print(f'\n{"TUTTE VERDI" if not errori else f"{errori} ROSSE"} (foto-check)')
sys.exit(1 if errori else 0)
