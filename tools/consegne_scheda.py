#!/usr/bin/env python3
# Scheda d'avvio delle catene parallele (C469 fase 3), tolta da tools/consegne.py il 18/11 (Risparmio 32, E358):
# consegne.py era a ~58 KB, vicino al tetto di una parte del pacchetto del kit (60 KB). `m` = il modulo consegne
# (costanti e funzioni lette al momento della chiamata: le prove che le cambiano valgono anche qui).
# Si usa solo da consegne.py: python3 -I tools/consegne.py avvio --parallela <Nome>
import os
import re
import sys


def scheda_avvio(args, m):
    """C469 fase 3: la scheda d'avvio di una catena parallela (campi 1-9 del rapporto 11 §3). Uscita 1 = «SCHEDA NON
    GENERATA»: si leggono i file interi."""
    nome = args.parallela
    file = m.CONSEGNE_PAR.format(m.nome_file_catena(nome))
    leggi_tutto = (f"leggi interi {file}, docs/ERRORI.md, gli ultimi messaggi di docs/MESSAGGI-MARIO*.md e "
                   f"archivio/messaggi-mario/ dopo il passaggio, «{m.SEZIONE_0}» di {m.DA_FARE} e {m.CHI_FA_COSA}")
    stato = m.allinea_ramo(m.ramo_di_lavoro())  # prima di leggere: i file devono essere quelli di GitHub
    try:
        testo = m.leggi(file)
    except OSError:
        print(f"SCHEDA NON GENERATA (manca {file}): {leggi_tutto}. {stato}")
        return 1
    n, c = m.numero_catena(nome, testo)
    dal_d = m.ora_passaggio(testo, file, nome)
    if n is None or dal_d is None:
        print(f"SCHEDA NON GENERATA (catena «{nome}» o ora del passaggio non trovate): {leggi_tutto}. {stato}")
        return 1
    try:
        sc = m._scorta()
        dal = dal_d.strftime("%Y-%m-%d %H:%M")
        prima = re.search(rf"^## Stato \({re.escape(nome)} (\d+)\s*(`[^`]+`)?", testo, re.M)
        nomi_catene = [(set(x["ids"]), x["nome"]) for x in sc.catene(m.CWD)]
        testi = m.testi_dei_messaggi(int(dal_d.timestamp()))
        voci = sc.unisci_voci(*[t for _, t in testi])
        dell_archivio = sc.unisci_voci(*[t for o, t in testi if sc.ARCHIVIO in o])
        coperto = any(sc.ora_voce(q) < dal for q, _, _ in dell_archivio)
        dopo = [v for v in voci if sc.ora_voce(v[0]) >= dal]
        girati = [v for v in dopo if "(girato da " in v[1]]
        mio = m.id_corto_mio()
        miei = [v for v in dopo if mio and (v[1].split() or [""])[0] == mio]  # questa sessione: già davanti a lei
        dopo = [v for v in dopo if v not in girati and v not in miei]
    except Exception as e:  # noqa: BLE001
        print(f"SCHEDA NON GENERATA (errore: {e}): {leggi_tutto}. {stato}")
        return 1
    chi = ""
    if mio:
        if c and c.get("attiva") == mio:
            chi = " (sei tu)"
        else:  # riga ancora della sessione chiusa (aperta a mano da Mario): io sono la dopo (Risparmio 13 dal vivo, 10/11)
            chi = f" (ATTENZIONE: in {m.CHI_FA_COSA} c'è ancora la {n}: scrivi la tua riga)"
            if mio not in m.numeri_della_riga(nome):  # già scritta col suo numero (Risparmio 31): niente +1
                n = m.numero_nuovo(nome, n)
    righe = [f"SCHEDA D'AVVIO · {nome} {n} (C469 fase 3, in prova; sezioni intere, filtro per ora)",
             f"1. {stato}. Catena {nome}: aperta la {n}{chi}"
             + (f"; prima: {prima.group(1)} {prima.group(2) or ''}".rstrip() if prima else "")
             + f"; passaggio → conto i messaggi dal {dal} (−{m.MARGINE_MIN} min)."]
    if not coperto:
        righe.append(f"3. ATTENZIONE: l'archivio non arriva a prima del {dal}: LEGGI TUTTO "
                     "(git log -p -- docs/MESSAGGI-MARIO*.md archivio/messaggi-mario/).")
    corpo = []
    for q, s, t in dopo:
        sid = (s.split() or [""])[0]
        chat = next((nc for ids, nc in nomi_catene if sid in ids), "chat non in CHI-FA-COSA")
        corpo.append(f"### {q} · {s} · {chat}\n{t}")
    msg = "\n\n".join(corpo)
    testa = (f"2. Messaggi di Mario dopo il passaggio, di ogni chat, interi: {len(dopo)}"
             + (f" (+{len(girati)} girati da altre sessioni: non sono di Mario, stanno nell'archivio)" if girati else "")
             + (f" (+{len(miei)} di questa sessione, già davanti a te)" if miei else ""))
    if len(msg) > m.SCHEDA_MSG_MAX:
        percorso = os.path.join(m.git("rev-parse", "--absolute-git-dir"), "scheda-messaggi.md")
        with open(percorso, "w", encoding="utf-8") as f:
            f.write(msg + "\n")
        righe += [testa + f", {len(msg)} caratteri → LEGGILO INTERO con Read {percorso} (mai a pezzi). Testate:"]
        righe += [f"- {q} · {s}" for q, s, _ in dopo]
    else:
        righe += [testa + ":", msg] if dopo else [testa + ": nessuno."]
    tutte = m.aspetta_mario()
    mie = [r for r in tutte if re.search(rf"\b{re.escape(nome)} \d+", r)]
    righe += [f"4. «{m.SEZIONE_0}» intera ({len(tutte)} righe; {len(mie)} della catena, prima loro):"] + mie + [r for r in tutte if r not in mie]
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".claude", "hooks"))
        import promesse
        voci_p = promesse.aperte(m.CWD)
        mie_p = [v for v in voci_p if nome in v["chi"]]
        vecchie = sorted(voci_p, key=promesse.numero_voce)[:5]
        righe.append(f"5. Promesse aperte: {len(voci_p)}; della catena: "
                     + ("; ".join(f"{v['n']} {v['titolo']}" for v in mie_p) or "nessuna")
                     + " · 5 più vecchie: " + "; ".join(f"{v['n']} {v['titolo']}" for v in vecchie) + ".")
    except Exception as e:  # noqa: BLE001
        righe.append(f"5. Promesse: non lette ({e}): python3 -I .claude/hooks/promesse.py --aperte")
    try:
        cfc = m.leggi(m.CHI_FA_COSA)
    except OSError:
        cfc = ""
    riga_catena = next((r for r in cfc.splitlines() if r.startswith(f"| {nome} |")), "")
    lavori = m.sezione_intera(cfc, "Lavori in corso")
    righe += [f"6. {m.CHI_FA_COSA}: riga della catena e «## Lavori in corso» intera:",
              riga_catena or "(riga della catena non trovata)",
              lavori or "(sezione «Lavori in corso» non trovata: leggi il file intero)"]
    codici = {cod for r in lavori.splitlines() if r.count("|") > 2 and nome in r.split("|")[2]
              for cod in re.findall(r"\bC\d+\b", r.split("|")[1])}
    try:
        df = m.leggi(m.DA_FARE)
    except OSError:
        df = ""
    righe_df = [r for r in df.splitlines() if r.startswith("|") and (re.search(rf"\b{re.escape(nome)} \d+", r)
                or any(re.match(rf"^\|\s*{cod}\b", r) for cod in codici))]
    righe += [f"7. Righe di {m.DA_FARE} della catena ({len(righe_df)}, intere):"] + (righe_df or ["(nessuna)"])
    try:
        avvio_skill = m.sezione_intera(m.leggi(m.SKILL_CONSEGNE), "Avvio della sessione nuova")
    except OSError:
        avvio_skill = ""
    righe += ["8. Dalla skill `consegne` (non serve caricarla):",
              avvio_skill or f"(sezione non trovata: leggi {m.SKILL_CONSEGNE} «Avvio»)"]
    righe.append(f"9. Non letti: {m.DA_FARE} ({m.kb(m.DA_FARE)}, solo a righe: grep -n -o), {m.CONSEGNE} ({m.kb(m.CONSEGNE)}, della "
                 f"Principale), {m.CHI_FA_COSA} fuori dalle sezioni sopra ({m.kb(m.CHI_FA_COSA)}), il resto di {m.SKILL_CONSEGNE}, "
                 f"i messaggi prima del {dal}. Da leggere ora, interi: docs/ERRORI.md e {file}.")
    uscita = "\n".join(righe)
    if len(uscita) > m.SCHEDA_MAX:
        percorso = os.path.join(m.git("rev-parse", "--absolute-git-dir"), "scheda-avvio.md")
        with open(percorso, "w", encoding="utf-8") as f:
            f.write(uscita + "\n")
        print(f"{righe[0]}\n{righe[1]}\nScheda lunga {len(uscita)} caratteri: LEGGILA INTERA con Read {percorso} (mai a pezzi).")
    else:
        print(uscita)
    return 0
