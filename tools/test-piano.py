#!/usr/bin/env python3
# Prova di .claude/hooks/piano.py (C487 R2: sigillo e fermo del piano «Fable pensa, Opus esegue»), su un progetto finto
# con un suo «origin» (cartella git nuda). I 22 casi sono quelli della specifica di Fable in
# docs/lavori-in-corso/C487-fable-pensa-opus-esegue.md («R2 · specifica»).
# Uso: python3 -I tools/test-piano.py
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, '..', '.claude', 'hooks', 'piano.py')
SETTINGS = os.path.join(QUI, '..', '.claude', 'settings.json')
ESEMPIO = os.path.join(QUI, '..', 'archivio', 'C487', 'kit', 'piano-esempio.md')
ESEMPIO_TESTO = '''# Esempio per la prova del sigillo (C487, caso 16)

## Piano «Esempio» (Fable, Giri 45, 12/11 09:50) · Stato: §A ✅ · Primo passo aperto: A2
Sigillo: (lo scrive `piano.py pronto`)
Lettura a freddo: 12/11 · 0 dubbi, risposti
### Parole di Mario (intere)
«fammi un esempio»
### Già deciso (una riga di perché ciascuna): chi esegue non le riapre
1. Il colore resta verde (lo ha chiesto Mario).
### Non toccare (file e lavori delle altre chat)
- niente
### Pensieri difficili (- [x] tema · dove sta, oppure «non serve: perché»)
- [x] Cosa vuole davvero Mario · «Già deciso» 1
### Dritte per chi esegue (trappole, parti fragili, come provare, «se succede X → fai Y»)
- Se la prova è rossa → scrivi in «❓ Per Fable».
### Passi (in ordine; uno = un commit piccolo)
- [x] 🧠 A1 · primo cambio · `a.js:10` · prova: `npm test` · fatto quando: verde · dipende da: — · rischio: basso
- [ ] 🔧 A2 · secondo cambio · `b.js` · prova: `npm test` · fatto quando: verde · dipende da: A1
### Domande per Mario (scelte numerate col consiglio; 🛑 = ferma i passi scritti accanto)
- nessuna
### Strade scartate (perché)
- il blu: non piace
### Diario dell'esecuzione (chi esegue: una riga per passo: commit, esito della prova, scostamenti, idee fuori piano)
- A1 · abc1234 · verde
### ❓ Per Fable (punti che chi esegue non ha saputo decidere, con la prova)
### Collaudo di Fable (verdetto, parola per parola)
'''
RAMO = 'claude/prova'
ID = 'sessione-prova'
OPUS, FABLE = 'claude-opus-5-5', 'claude-fable-5-2'
GIT_ENV = {'GIT_AUTHOR_NAME': 'prova', 'GIT_AUTHOR_EMAIL': 'prova@example.invalid', 'GIT_COMMITTER_NAME': 'prova',
           'GIT_COMMITTER_EMAIL': 'prova@example.invalid'}
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print('FALLITA:', nome)
        sys.exit(1)
    ok_n += 1


PASSI = [
    '- [x] 🧠 A1 · primo cambio · `a.js` · prova: `npm test` · fatto quando: verde · dipende da: —',
    '- [ ] 🔧 A2 · secondo cambio · `b.js` · prova: `npm test` · fatto quando: verde · dipende da: A1',
    '- [ ] 🧠 A3 · terzo cambio · `c.js` · prova: `npm test` · fatto quando: verde · dipende da: A2',
    '- [ ] 🔧 A4 · quarto cambio · `d.js` · prova: `npm test` · fatto quando: verde · dipende da: A3',
]
DIAMANTE = '- [ ] 💎 A5 · cambio delicato · `e.js` · prova: a mano · fatto quando: visto · dipende da: A4 · perché: (b)'


def piano(passi=None, primo='A2', stato='§A ✅', freddo=True, pensieri='- [x] Cosa vuole Mario · «Già deciso» 1',
          strade=True, prima=''):
    righe = [prima, '# C9 · Prova', '', f'## Piano «Prova» (Fable, 12/11 18:00) · Stato: {stato} · Primo passo aperto: {primo}',
             'Sigillo: (lo scrive `piano.py pronto`)']
    if freddo:
        righe.append('Lettura a freddo: 12/11 · 0 dubbi')
    righe += ['### Parole di Mario (intere)', '«fammi una prova»',
              '### Già deciso (una riga di perché ciascuna): chi esegue non le riapre', '1. Il colore resta verde.',
              '### Non toccare (file e lavori delle altre chat)', '- niente',
              '### Pensieri difficili (- [x] tema · dove sta)', pensieri,
              '### Dritte per chi esegue', '- Se la prova è rossa → «❓ Per Fable».',
              '### Passi (in ordine; uno = un commit piccolo)', *(PASSI if passi is None else passi),
              '### Domande per Mario', '- nessuna']
    if strade:
        righe += ['### Strade scartate (perché)', '- il blu: non piace']
    righe += ['### Diario dell\'esecuzione', '- A1 · abc1234 · verde', '### ❓ Per Fable', '### Collaudo di Fable',
              '', '## Altro', 'fuori dal piano']
    return '\n'.join(righe).lstrip('\n') + '\n'


def lancia(progetto, *argomenti, dati=None, sessione=ID):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=progetto, CLAUDE_CODE_SESSION_ID=sessione, **GIT_ENV)
    r = subprocess.run([sys.executable, '-I', HOOK, *argomenti], input=json.dumps(dati) if dati is not None else '',
                       capture_output=True, text=True, env=env, cwd=progetto, timeout=60)
    controlla(not r.stderr.strip(), f'niente errori ({argomenti[0]}): {r.stderr[:300]}')
    return r.returncode, r.stdout.strip()


def hook(progetto, modo, dati):
    rc, out = lancia(progetto, modo, dati=dati)
    controlla(rc == 0, f'hook {modo}: esce sempre 0')
    return out


def git(progetto, *a):
    r = subprocess.run(['git', *a], cwd=progetto, capture_output=True, text=True, env=dict(os.environ, **GIT_ENV))
    controlla(r.returncode == 0, f'git {" ".join(a)}: {r.stderr[:200]}')
    return r.stdout


def scrivi(percorso, testo):
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    with open(percorso, 'w', encoding='utf-8') as f:
        f.write(testo)


def leggi(percorso):
    with open(percorso, encoding='utf-8') as f:
        return f.read()


def registro(progetto, modello):
    p = os.path.join(progetto, f'registro-{modello or "vuoto"}.jsonl')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(json.dumps({'type': 'user', 'message': {'role': 'user', 'content': 'x'}}) + '\n')
        if modello:
            f.write(json.dumps({'type': 'assistant', 'message': {'role': 'assistant', 'model': modello}}) + '\n')
    return p


def sostituisci(percorso, vecchio, nuovo):
    t = leggi(percorso)
    controlla(vecchio in t, f'testo da cambiare presente: {vecchio[:40]}')
    scrivi(percorso, t.replace(vecchio, nuovo, 1))


def modulo():
    spec = importlib.util.spec_from_file_location('piano_prova', HOOK)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def nuovo_progetto(base, nome):
    progetto, nudo = os.path.join(base, nome), os.path.join(base, nome + '-origin.git')
    os.makedirs(progetto)
    git(progetto, 'init', '-q', '-b', RAMO)
    scrivi(os.path.join(progetto, 'LEGGIMI.md'), 'progetto finto\n')
    git(progetto, 'add', '-A')
    git(progetto, 'commit', '-q', '-m', 'inizio')
    git(base, 'init', '-q', '--bare', nudo)
    git(progetto, 'remote', 'add', 'origin', nudo)
    git(progetto, 'push', '-q', '-u', 'origin', RAMO)
    return progetto


def salva(progetto, messaggio='passo'):
    git(progetto, 'add', '-A')
    git(progetto, 'commit', '-q', '-m', messaggio)
    git(progetto, 'push', '-q', 'origin', RAMO)


def prova():
    base = tempfile.mkdtemp(prefix='piano-')
    try:
        p = nuovo_progetto(base, 'p')
        rel = 'docs/lavori-in-corso/C9.md'
        f = os.path.join(p, rel)
        opus, fable, vuoto = registro(p, OPUS), registro(p, FABLE), registro(p, '')
        stato_pronto = os.path.join(p, '.git', f'piano-pronto-{ID}.json')
        diamanti = os.path.join(p, '.git', f'piano-diamanti-{ID}.json')

        # 1. Piano completo: pronto 0, riga del sigillo; controlla 0.
        scrivi(f, piano())
        rc, out = lancia(p, 'pronto', f)
        testo = leggi(f)
        controlla(rc == 0 and re.search(r'^Sigillo: [0-9a-f]{12} · Fable · \d\d/\d\d \d\d:\d\d · base [0-9a-f]{7} · '
                                        r'4 passi \(2 🧠, 0 💎\)$', testo, re.M), f'1. pronto scrive il sigillo ({out})')
        controlla(testo.count('Sigillo:') == 1 and 'lo scrive' not in testo, '1. la riga «Sigillo:» di prima è sostituita')
        controlla('Sigillato: 3 passi per Opus, 0 delicati già fatti da Fable, 0 in coda a Fable' in out
                  and 'conviene il cambio' not in out, f'1. testo di pronto ({out})')
        controlla(lancia(p, 'controlla', f)[0] == 0, '1. controlla 0')
        st = json.load(open(stato_pronto, encoding='utf-8'))
        controlla(st['file'] == f and st['scelta'] == '' and abs(st['quando'] - time.time()) < 60, '1. stato del fermo scritto')
        sigillato = leggi(f)

        # 2. Spunta e «Primo passo aperto» cambiati: valido.
        sostituisci(f, '- [ ] 🔧 A2', '- [x] 🔧 A2')
        sostituisci(f, 'Primo passo aperto: A2', 'Primo passo aperto: A3')
        controlla(lancia(p, 'controlla', f)[0] == 0, '2. spunta e primo passo: controlla 0')

        # 3. Righe nuove in Diario, «❓ Per Fable», Collaudo: valido.
        sostituisci(f, '- A1 · abc1234 · verde', '- A1 · abc1234 · verde\n- A2 · def5678 · verde')
        sostituisci(f, '### ❓ Per Fable', '### ❓ Per Fable\n- dubbio su A3')
        sostituisci(f, '### Collaudo di Fable', '### Collaudo di Fable\n- tutto bene')
        controlla(lancia(p, 'controlla', f)[0] == 0, '3. Diario, Per Fable e Collaudo: controlla 0')

        # 4-6. Parti di Fable cambiate: rotto.
        casi_rotti = {
            '4. una parola in «Già deciso»': ('Il colore resta verde.', 'Il colore resta rosso.'),
            '5. testo di un passo': ('terzo cambio', 'terzo cambio diverso'),
            '6a. un passo aggiunto': (PASSI[3], PASSI[3] + '\n- [ ] 🔧 A9 · nuovo · prova: x · fatto quando: y'),
            '6b. un passo tolto': (PASSI[3] + '\n', ''),
        }
        for nome, (vecchio, nuovo) in casi_rotti.items():
            scrivi(f, sigillato)
            sostituisci(f, vecchio, nuovo)
            rc, out = lancia(p, 'controlla', f)
            controlla(rc == 1 and 'ROTTO' in out and 'git log -1' in out, f'{nome}: controlla 1 ({out})')

        # 16. Impronta dell'esempio di Fable, e controprova: con un'impronta sempre uguale i casi 4-6 non si vedono.
        m = modulo()
        # Nei progetti nati dal kit `archivio/C487/` non c'è: l'esempio di Fable vive anche qui, uguale (Giri 57).
        if os.path.exists(ESEMPIO):
            controlla(leggi(ESEMPIO) == ESEMPIO_TESTO, '16. copia dell\'esempio uguale a archivio/C487/kit/piano-esempio.md')
        controlla(m.impronta(m.blocco(ESEMPIO_TESTO)) == '152cb6138a07', '16. impronta di piano-esempio.md = 152cb6138a07')
        finto = modulo()
        finto.impronta = lambda righe: '000000000000'
        for nome, (vecchio, nuovo) in casi_rotti.items():
            cambiato = sigillato.replace(vecchio, nuovo, 1)
            controlla(m.impronta(m.blocco(cambiato)) != m.impronta(m.blocco(sigillato)), f'16. {nome}: impronta vera lo vede')
            controlla(finto.impronta(finto.blocco(cambiato)) == finto.impronta(finto.blocco(sigillato)),
                      f'16. controprova {nome}: impronta finta non lo vede')

        # 7. pronto: un errore di forma per volta, esce 1 senza scrivere.
        errori = {
            'passo aperto senza prova:': (piano(passi=[PASSI[0], PASSI[1], PASSI[2].replace('prova: `npm test` · ', ''), PASSI[3]]),
                                          'A3 senza «prova:»'),
            'passo senza segno': (piano(passi=[PASSI[0], PASSI[1].replace('🔧 ', ''), PASSI[2], PASSI[3]]), 'senza segno'),
            'Stato in corso': (piano(stato='§A in corso'), 'in corso'),
            '- [ ] in Pensieri difficili': (piano(pensieri='- [ ] Cosa vuole Mario'), 'Pensieri difficili'),
            'senza Lettura a freddo': (piano(freddo=False), 'Lettura a freddo'),
            'primo passo non aperto': (piano(primo='A1'), '«Primo passo aperto: A1» non è un passo aperto'),
            'sottosezione mancante': (piano(strade=False), 'strade scartate'),
        }
        for nome, (testo, atteso) in errori.items():
            scrivi(f, testo)
            rc, out = lancia(p, 'pronto', f)
            controlla(rc == 1 and atteso in out and len(out.splitlines()) == 1, f'7. {nome}: esce 1 e lo nomina ({out})')
            controlla(leggi(f) == testo, f'7. {nome}: file non toccato')

        # 8. Senza sigillo, o «Sigillo: a mano»: controlla 2.
        scrivi(f, piano())
        controlla(lancia(p, 'controlla', f)[0] == 2, '8. senza sigillo: 2')
        scrivi(f, piano().replace('Sigillo: (lo scrive `piano.py pronto`)', 'Sigillo: a mano'))
        controlla(lancia(p, 'controlla', f)[0] == 2, '8. «Sigillo: a mano»: 2')

        # 9. Due blocchi «## Piano»: vale l'ultimo.
        primo = '## Piano «Vecchio» · Stato: in corso\nSigillo: 0123456789ab\n### Passi\n- [ ] niente\n\n'
        scrivi(f, piano(prima=primo))
        controlla(lancia(p, 'pronto', f)[0] == 0, '9. pronto guarda solo l\'ultimo blocco (il primo è storto)')
        controlla(leggi(f).count('Sigillo: 0123456789ab') == 1, '9. il sigillo del primo blocco non si tocca')
        sostituisci(f, '- [ ] niente', '- [ ] altro')
        controlla(lancia(p, 'controlla', f)[0] == 0, '9. cambio nel primo blocco: valido')
        sostituisci(f, 'Il colore resta verde.', 'Il colore cambia.')
        controlla(lancia(p, 'controlla', f)[0] == 1, '9. cambio nell\'ultimo blocco: rotto')

        # 21. stato.
        scrivi(f, piano())
        controlla(lancia(p, 'stato', f)[1] == 'senza sigillo', '21. stato: senza sigillo')
        lancia(p, 'pronto', f)
        controlla(lancia(p, 'stato', f)[1] == 'pronto · 3 passi aperti · primo: A2', f'21. stato: pronto ({lancia(p, "stato", f)[1]})')
        sostituisci(f, 'Il colore resta verde.', 'Il colore resta giallo.')
        controlla(lancia(p, 'stato', f)[1] == 'rotto', '21. stato: rotto')

        # 10. scritto (dopo Edit e Write).
        scrivi(f, piano())
        lancia(p, 'pronto', f)
        salva(p, 'piano sigillato')
        ed = lambda reg, file=f: {'session_id': ID, 'transcript_path': reg, 'tool_name': 'Edit', 'tool_input': {'file_path': file}}
        controlla(hook(p, 'scritto', ed(opus)) == '', '10. sigillo valido: muto')
        sostituisci(f, 'Il colore resta verde.', 'Il colore resta blu.')
        out = hook(p, 'scritto', ed(opus))
        controlla('PIANO SIGILLATO' in out and json.loads(out)['hookSpecificOutput']['hookEventName'] == 'PostToolUse',
                  f'10. rotto + Opus: PIANO SIGILLATO ({out[:120]})')
        controlla('rifai `piano.py pronto`' in hook(p, 'scritto', ed(fable)), '10. rotto + Fable: «rifai»')
        fuori = os.path.join(p, 'docs', 'altro.md')
        scrivi(fuori, leggi(f))
        controlla(hook(p, 'scritto', ed(opus, fuori)) == '', '10. file fuori da docs/lavori-in-corso/: muto')
        os.remove(fuori)

        # 11. prima, push.
        push = lambda reg, cmd='git add -A && git commit -m x && git push -u origin claude/prova': {
            'session_id': ID, 'transcript_path': reg, 'tool_name': 'Bash', 'tool_input': {'command': cmd}}
        out = hook(p, 'prima', push(opus))
        controlla(json.loads(out)['hookSpecificOutput']['permissionDecision'] == 'deny' and 'C9.md' in out,
                  f'11. piano rotto fra i miei file + Opus: nega ({out[:120]})')
        controlla(hook(p, 'prima', push(fable)) == '', '11. + Fable: lascia')
        controlla(hook(p, 'prima', push(opus, 'echo "git push"')) == '', '11. «git push» dentro un testo: lascia')
        git(p, 'checkout', '--', rel)
        altro = os.path.join(p, 'docs', 'lavori-in-corso', 'C8.md')
        scrivi(altro, piano())
        lancia(p, 'pronto', altro)
        sostituisci(altro, 'Il colore resta verde.', 'Il colore resta viola.')
        salva(p, 'piano rotto già su GitHub')
        controlla(hook(p, 'prima', push(opus)) == '', '11. piano rotto ma non fra i miei file: lascia')
        sostituisci(f, 'Il colore resta verde.', 'Il colore resta nero.')
        lancia(p, 'pronto', f)  # sigillo valido ma nuovo: lo cambia solo Fable
        controlla(lancia(p, 'controlla', f)[0] == 0, '11. sigillo rifatto: valido')
        out = hook(p, 'prima', push(opus))
        controlla('deny' in out and 'riga del sigillo' in out, f'11. riga del sigillo diversa da origin + Opus: nega ({out[:120]})')
        controlla('rimetti Fable' in out, '11. sigillo messo da Fable e non su GitHub: la frase per Mario (idea del collaudo C487)')
        git(p, 'checkout', '--', rel)

        # 15. prima, comando «piano.py pronto».
        cmd = f'python3 -I .claude/hooks/piano.py pronto {rel}'
        controlla('Il sigillo lo mette solo Fable' in hook(p, 'prima', push(opus, cmd)), '15. pronto + Opus: nega')
        controlla(hook(p, 'prima', push(fable, cmd)) == '', '15. pronto + Fable: lascia')
        controlla('solo Fable' in hook(p, 'prima', push(opus, f'cd x && python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/piano.py" pronto {rel}')),
                  '15. pronto col percorso tra virgolette + Opus: nega')
        for testo in ('git commit -m "piano.py: pronto/controlla/stato"', 'git commit -F msg.txt', 'grep -n "piano.py pronto" doc.md'):
            controlla(hook(p, 'prima', push(opus, testo)) == '', f'15. «{testo[:30]}»: non è il comando, lascia (Giri 57)')

        # 17. pronto coi passi 💎.
        con = lambda d, primo='A2', passi=None: piano(passi=(passi or PASSI) + [d], primo=primo)
        casi17 = [
            ('💎 aperto con «dipende da: —»', con(DIAMANTE.replace('dipende da: A4', 'dipende da: —')), 1, 'A5'),
            ('💎 che aspetta A2 aperto', con(DIAMANTE.replace('dipende da: A4', 'dipende da: A2')), 0, '5 passi (2 🧠, 1 💎)'),
            ('💎 che aspetta A2 già spuntato', con(DIAMANTE.replace('dipende da: A4', 'dipende da: A2'), 'A3',
                                                [PASSI[0], PASSI[1].replace('[ ]', '[x]'), PASSI[2], PASSI[3]]), 1, 'A5'),
            ('💎 senza «perché:»', con(DIAMANTE.replace(' · perché: (b)', '')), 1, 'perché'),
            ('💎 spuntato con «dipende da: —»', con(DIAMANTE.replace('[ ]', '[x]').replace('dipende da: A4', 'dipende da: —')),
             0, '1 delicati già fatti da Fable'),
        ]
        for nome, testo, atteso, parola in casi17:
            scrivi(f, testo)
            rc, out = lancia(p, 'pronto', f)
            controlla(rc == atteso and (parola in out or parola in leggi(f)), f'17. {nome}: esce {atteso} ({out})')
        scrivi(f, piano(passi=[PASSI[0], PASSI[1], PASSI[2]]))
        rc, out = lancia(p, 'pronto', f)
        controlla(rc == 0 and 'Solo 2 passi per Opus: conviene il cambio?' in out, f'17. 2 passi per Opus: conviene? ({out})')
        git(p, 'checkout', '--', rel)

        # 18-19. Passo 💎 spuntato da Opus (scritto e prima).
        scrivi(f, con(DIAMANTE))
        controlla(lancia(p, 'pronto', f)[0] == 0, '18. piano col 💎 sigillato')
        salva(p, 'piano col 💎')
        sostituisci(f, DIAMANTE, DIAMANTE.replace('[ ]', '[x]'))
        controlla(lancia(p, 'controlla', f)[0] == 0, '18. spunta del 💎: il sigillo resta valido')
        controlla('PASSO 💎' in hook(p, 'scritto', ed(opus)) and 'A5' in hook(p, 'scritto', ed(opus)), '18. 💎 spuntato + Opus: avviso')
        controlla(hook(p, 'scritto', ed(fable)) == '', '18. + Fable: muto')
        out = hook(p, 'prima', push(opus))
        controlla('deny' in out and '💎 A5' in out, f'19. push con 💎 spuntato + Opus: nega ({out[:120]})')
        controlla(hook(p, 'prima', push(fable)) == '', '19. + Fable: lascia')
        scrivi(diamanti, '{"quando": 1}')
        controlla(hook(p, 'scritto', ed(opus)) == '', '18. + sblocco dei 💎: muto')
        controlla(hook(p, 'prima', push(opus)) == '', '19. + sblocco dei 💎: lascia')
        os.remove(diamanti)
        sostituisci(f, '- A1 · abc1234 · verde', '- A1 · abc1234 · verde\n- Passi 💎 a Opus, scelto da Mario 12/11 18:30')
        controlla(hook(p, 'prima', push(opus)) == '', '19. senza file ma con la riga nel Diario: lascia')
        git(p, 'checkout', '--', rel)
        sostituisci(f, PASSI[2], PASSI[2].replace('[ ]', '[x]'))
        controlla(hook(p, 'scritto', ed(opus)) == '', '18. spuntato un passo 🧠: muto')
        sostituisci(f, DIAMANTE, DIAMANTE.replace('[ ]', '[x]'))
        salva(p, '💎 spuntato anche su GitHub')
        sostituisci(f, '### ❓ Per Fable', '### ❓ Per Fable\n- nota')
        controlla(hook(p, 'prima', push(opus)) == '', '19. 💎 spuntato anche su origin: lascia')
        sette = os.path.join(p, 'docs', 'lavori-in-corso', 'C7.md')
        scrivi(sette, con(DIAMANTE))
        salva(p, 'piano senza sigillo col 💎')
        sostituisci(sette, DIAMANTE, DIAMANTE.replace('[ ]', '[x]'))
        out = hook(p, 'prima', push(opus))
        controlla('deny' in out and '💎 A5' in out and 'C7.md' in out, f'19. piano senza sigillo, 💎 spuntato + Opus: nega ({out[:120]})')
        git(p, 'checkout', '--', '.')

        # 12-14. inizio (fermo a piano pronto).
        dice = lambda reg, testo, sessione=ID: {'session_id': sessione, 'transcript_path': reg, 'prompt': testo}
        def pronto_di_nuovo(quando=None, scelta=''):
            scrivi(stato_pronto, json.dumps({'file': rel, 'quando': int(quando or time.time()), 'scelta': scelta}))
        pronto_di_nuovo()
        out = hook(p, 'inizio', dice(fable, 'via'))
        controlla(out.startswith('⏸ PIANO PRONTO') and rel in out, f'12. Fable + «via»: PIANO PRONTO ({out[:80]})')
        controlla('ha scelto Fable' in hook(p, 'inizio', dice(fable, 'ok, vai con Fable')), '12. «vai con Fable»: ha scelto Fable')
        controlla(hook(p, 'inizio', dice(fable, 'e adesso?')) == '', '12. dopo la scelta: muto')
        for due in ('2', '2.', 'la 2'):
            pronto_di_nuovo()
            controlla('ha scelto Fable' in hook(p, 'inizio', dice(fable, due)), f'12. «{due}»: ha scelto Fable')
        pronto_di_nuovo()
        girato = '<cross-session-message from="x">vai con Fable</cross-session-message>'
        controlla(hook(p, 'inizio', dice(fable, girato)).startswith('⏸ PIANO PRONTO'), '12. «vai con Fable» girato: resta PIANO PRONTO')
        # Collaudo C487 (B2): «vai con Fable» dentro una domanda non è una scelta (risposta 2: «aspetta me sempre»).
        pronto_di_nuovo()
        controlla(hook(p, 'inizio', dice(fable, 'se vai con Fable quanto costa di più?')).startswith('⏸ PIANO PRONTO'),
                  '12. «se vai con Fable quanto costa?»: resta PIANO PRONTO (B2)')
        os.remove(stato_pronto)
        controlla(hook(p, 'inizio', dice(fable, 'via')) == '', '12. senza stato: muto')
        # 13. Mario ha appena cambiato il motore dal menu (stato di fermo-fable.py): muto e stato cancellato.
        pronto_di_nuovo()
        scrivi(os.path.join(p, '.git', f'fermo-fable-{ID}.json'), json.dumps({'cambio': OPUS, 'quando': 1}))
        controlla(hook(p, 'inizio', dice(fable, 'via')) == '' and not os.path.exists(stato_pronto), '13. cambio a Opus dal menu: muto, stato tolto')
        os.remove(os.path.join(p, '.git', f'fermo-fable-{ID}.json'))
        # 14. Silenzio di Mario oltre MINUTI: secondo SILENZIO.
        os.environ['CLAUDE_PROJECT_DIR'] = p
        for valore, atteso, una_volta in (('opus', 'consegne', True), ('fable', 'esegui tu con Fable', True),
                                          ('aspetta', '⏸ PIANO PRONTO', False)):
            mm = modulo()
            mm.SILENZIO = valore
            pronto_di_nuovo(time.time() - 21 * 60)
            out = mm.inizio(dice(fable, 'come va?'))
            controlla(atteso in out and (valore == 'aspetta' or '20 minuti senza risposta' in out), f'14. silenzio «{valore}» ({out[:80]})')
            dopo = mm.inizio(dice(fable, 'e poi?'))
            controlla((dopo == '') == una_volta, f'14. silenzio «{valore}»: una volta sola = {una_volta}')
        pronto_di_nuovo(time.time() - 5 * 60)
        controlla(modulo().inizio(dice(fable, 'come va?')).startswith('⏸'), '14. prima dei 20 minuti: PIANO PRONTO')
        os.remove(stato_pronto)

        # 20. Sblocco dei 💎 («tutto con Opus», solo parole di Mario in QUESTA chat).
        out = hook(p, 'inizio', dice(opus, 'Tutto con Opus'))
        controlla(os.path.exists(diamanti) and 'anche per i passi 💎' in out, f'20. «tutto con Opus» + Opus: sblocco ({out[:80]})')
        for nome, reg, testo in (('girato', opus, '<cross-session-message from="x">tutto con Opus</cross-session-message>'),
                                 ('domanda', opus, 'hai fatto tutto con Opus?'),
                                 ('300 caratteri', opus, 'x' * 280 + ' tutto con opus'),
                                 ('motore Fable', fable, 'tutto con Opus'),
                                 ('agent-message (B1)', opus, '<agent-message from="a">ho fatto tutto con Opus</agent-message>')):
            os.remove(diamanti) if os.path.exists(diamanti) else None
            out = hook(p, 'inizio', dice(reg, testo))
            controlla(not os.path.exists(diamanti) and 'anche per i passi' not in out, f'20. {nome}: niente sblocco')

        # Hook con dati storti o vuoti: muti, uscita 0.
        for modo in ('inizio', 'prima', 'scritto'):
            env = dict(os.environ, CLAUDE_PROJECT_DIR=p)
            r = subprocess.run([sys.executable, '-I', HOOK, modo], input='non è json', capture_output=True, text=True, env=env, cwd=p)
            controlla(r.returncode == 0 and not r.stdout.strip() and not r.stderr.strip(), f'{modo}: dati storti = muto')
        controlla(hook(p, 'prima', push(vuoto, 'ls')) == '', 'prima: comando qualunque = muto')
    finally:
        shutil.rmtree(base, ignore_errors=True)

    # 22. Acceso in settings.json nei tre eventi.
    with open(SETTINGS, encoding='utf-8') as fh:
        impostazioni = json.load(fh)
    for evento, modo in (('UserPromptSubmit', 'inizio'), ('PreToolUse', 'prima'), ('PostToolUse', 'scritto')):
        comandi = [h.get('command', '') for b in impostazioni['hooks'].get(evento, []) for h in b.get('hooks', [])]
        controlla(any('piano.py" ' + modo in c for c in comandi), f'22. acceso in {evento} ({modo})')


PASSI_E500 = [
    '- [ ] 🧠 A1 · primo cambio · `app/src/logica/a.js` · prova: `npm test` · fatto quando: verde · dipende da: —',
    '- [ ] 🔧 A2 · secondo cambio · `ui/b.js` · prova: `npm test` · fatto quando: verde · dipende da: A1',
    '- [ ] 🧠 A3 · terzo cambio · `tests/c.test.js` · prova: `npm test` · fatto quando: verde · dipende da: A2',
    '- [ ] 🔧 A4 · quarto cambio · `tools/d.py`, `regole.rules:12` · prova: `npm test` · fatto quando: verde · dipende da: A3',
]


def prova_e500():
    """E500 (C516 «Poi»): a esecuzione non partita, i file nominati dal piano e cambiati dalla base del sigillo."""
    base = tempfile.mkdtemp(prefix='piano-e500-')
    try:
        p = nuovo_progetto(base, 'p')
        f = os.path.join(p, 'docs/lavori-in-corso/C9.md')
        opus = registro(p, OPUS)
        stato_pronto = os.path.join(p, '.git', f'piano-pronto-{ID}.json')
        for nome in ('app/src/logica/a.js', 'app/src/ui/b.js', 'app/src/altro.js'):
            scrivi(os.path.join(p, nome), 'uno\n')
        salva(p, 'file di partenza')
        scrivi(f, piano(passi=PASSI_E500, primo='A1'))
        rc, out = lancia(p, 'pronto', f)
        controlla(rc == 0, f'23. piano sigillato ({out})')
        commit_base = re.search(r' · base ([0-9a-f]{7}) · ', leggi(f)).group(1)
        salva(p, 'piano sigillato')
        riga_stato = 'pronto · 4 passi aperti · primo: A1'

        # 23. Nessun cambio dalla base → muto (una riga sola, come prima).
        controlla(lancia(p, 'stato', f) == (0, riga_stato), '23. nessun cambio: stato muto')
        controlla(lancia(p, 'controlla', f) == (0, 'Sigillo valido.'), '23. nessun cambio: controlla muto')

        # 24. Cambi solo in docs/ e archivio/, e in un file che il piano non nomina → muto.
        scrivi(os.path.join(p, 'docs/DA-FARE.md'), 'riga\n')
        scrivi(os.path.join(p, 'archivio/C9/nota.txt'), 'nota\n')
        scrivi(os.path.join(p, 'app/src/altro.js'), 'due\n')
        salva(p, 'carte e un file fuori dal piano')
        controlla(lancia(p, 'stato', f) == (0, riga_stato), '24. solo carte e file non nominati: muto')

        # 25. Un'altra chat cambia due file del piano (uno scritto corto, `ui/b.js`) → avviso in stato e controlla.
        scrivi(os.path.join(p, 'app/src/logica/a.js'), 'due\n')
        scrivi(os.path.join(p, 'app/src/ui/b.js'), 'due\n')
        salva(p, 'lavoro di un\'altra chat')
        atteso = (f'⚠️ E500: 2 file nominati dal piano sono cambiati dalla base del sigillo ({commit_base}): '
                  'app/src/logica/a.js, app/src/ui/b.js.')
        rc, out = lancia(p, 'stato', f)
        controlla(rc == 0 and out.splitlines()[0] == riga_stato and atteso in out, f'25. stato avvisa ({out})')
        rc, out = lancia(p, 'controlla', f)
        controlla(rc == 0 and out.startswith('Sigillo valido.') and atteso in out, f'25. controlla avvisa ({out})')

        # 26. Mario cambia motore nella chat del sigillo: `inizio` dà lo stesso avviso, una volta sola.
        controlla(os.path.isfile(stato_pronto), '26. il fermo del piano pronto c\'è ancora')
        dati = {'session_id': ID, 'transcript_path': opus, 'prompt': 'via'}
        controlla(atteso in hook(p, 'inizio', dati), '26. inizio con Opus: avviso E500')
        controlla(hook(p, 'inizio', dati) == '' and not os.path.exists(stato_pronto), '26. la seconda volta: muto')

        # 27. Base che in questa copia non c'è (storia corta) → lo dice, non tace.
        sigillato = leggi(f)
        sostituisci(f, f' · base {commit_base} · ', ' · base 0000000 · ')
        rc, out = lancia(p, 'stato', f)
        controlla(rc == 0 and 'la base del sigillo (0000000) non è nella storia di questa copia' in out
                  and 'file nominati' not in out, f'27. base fuori dalla copia: lo dice ({out})')
        scrivi(f, sigillato)

        # 28. Esecuzione partita (A1 spuntato dopo il sigillo): i file li cambia chi esegue → muto.
        sostituisci(f, '- [ ] 🧠 A1', '- [x] 🧠 A1')
        salva(p, 'A1 fatto')
        rc, out = lancia(p, 'stato', f)
        controlla(rc == 0 and out == 'pronto · 3 passi aperti · primo: A1', f'28. esecuzione partita: muto ({out})')

        # 29. Sigillo nato con A1 già fatto: «non partita» si legge dal commit del sigillo, non dalle spunte → avvisa.
        g = os.path.join(p, 'docs/lavori-in-corso/C10.md')
        scrivi(g, piano(passi=['- [x] 🧠 A1' + PASSI_E500[0][len('- [ ] 🧠 A1'):], *PASSI_E500[1:]], primo='A2'))
        rc, out = lancia(p, 'pronto', g)
        controlla(rc == 0, f'29. secondo piano sigillato ({out})')
        salva(p, 'secondo piano sigillato')
        controlla(lancia(p, 'stato', g) == (0, 'pronto · 3 passi aperti · primo: A2'), '29. niente cambi: muto')
        scrivi(os.path.join(p, 'app/src/ui/b.js'), 'tre\n')
        scrivi(os.path.join(p, 'regole.rules'), 'in cima al progetto, nominato con la riga\n')
        scrivi(os.path.join(p, 'altre-regole.rules'), 'in cima al progetto, il piano non lo nomina\n')
        salva(p, 'un\'altra chat, dopo')
        rc, out = lancia(p, 'stato', g)
        controlla('⚠️ E500: 2 file nominati dal piano' in out and 'app/src/ui/b.js, regole.rules.' in out,
                  f'29. avvisa, anche per il file in cima al progetto ({out})')
        sostituisci(g, '- [ ] 🔧 A2', '- [x] 🔧 A2')
        controlla('⚠️' not in lancia(p, 'stato', g)[1], '29. A2 spuntato (anche senza commit): partita, muto')
    finally:
        shutil.rmtree(base, ignore_errors=True)


if __name__ == '__main__':
    prova()
    prova_e500()
    print(f'OK: {ok_n} controlli verdi (piano)')
