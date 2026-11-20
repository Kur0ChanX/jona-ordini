#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/spreco-token.py (C433): muto se va tutto bene, una riga sola con un'anomalia;
# totale della sessione in archivio/consumo/; somma per account all'avvio.
# Uso: python3 -I tools/test-spreco-token.py
import json, os, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "spreco-token.py")
TMP = tempfile.mkdtemp()
os.makedirs(os.path.join(TMP, ".git"))
ok_n = 0


def controlla(cond, nome, extra=""):
    global ok_n
    if not cond:
        print("FALLITA:", nome, "·", extra)
        sys.exit(1)
    ok_n += 1


def utente(t):
    return {"type": "user", "message": {"role": "user", "content": t}}


def esito(testo="ok"):
    return {"type": "user", "message": {"content": [{"type": "tool_result", "tool_use_id": "t", "content": testo}]}}


def claude(mid, ctx, out=500, strumento=None, ingresso=None, motore=None):
    c = [{"type": "tool_use", "id": "t", "name": strumento, "input": ingresso or {}}] if strumento else [{"type": "text", "text": "x"}]
    v = {"type": "assistant", "message": {"id": mid, "content": c, "usage": {
        "input_tokens": 10, "cache_read_input_tokens": ctx - 10, "cache_creation_input_tokens": 0, "output_tokens": out}}}
    if motore:
        v["message"]["model"] = motore
    return v


def lancia(modo, voci=None, sessione="s1", acc="conto-A", oggi="2026-11-03", **extra):
    percorso = os.path.join(TMP, "t.jsonl")
    with open(percorso, "w", encoding="utf-8") as f:
        for v in voci or []:
            f.write(json.dumps(v, ensure_ascii=False) + "\n")
    dati = dict({"session_id": sessione, "transcript_path": percorso}, **extra)
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=TMP, CLAUDE_CODE_ACCOUNT_UUID=acc, SPRECO_OGGI=oggi, SPRECO_NO_GIT="1")
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps(dati), capture_output=True, text=True, timeout=30, env=amb)
    return r.returncode, r.stdout


BASE = [utente("ciao"), claude("a", 60_000), utente("fai x")]
# Turno normale: muto.
c, out = lancia("fine", BASE + [claude("b", 70_000, strumento="Bash", ingresso={"command": "ls"}), esito(), claude("c", 72_000)])
controlla(c == 0 and out == "", "fine, turno normale: muto", out)
c, out = lancia("inizio")
controlla(c == 0 and out == "", "inizio dopo un turno normale: muto", out)
# Uscita enorme + giro a vuoto + contesto cresciuto: detto al messaggio dopo, una volta sola.
grande = "x" * 50 * 1024
giro = [claude(f"g{i}", 80_000 + i, strumento="Bash", ingresso={"command": "git status"}) for i in range(4)]
voci = BASE + [claude("b", 70_000, strumento="Read", ingresso={"file_path": "/a"}), esito(grande)]
for g in giro:
    voci += [g, esito()]
voci += [claude("z", 190_000)]
c, out = lancia("fine", voci)
controlla(c == 0 and out == "", "fine: non parla mai da sé (zero token)", out)
c, out = lancia("inizio")
controlla("SPRECO TOKEN" in out and "50 KB" in out and "giro a vuoto" in out and "130k" in out and "UNA riga" in out,
          "inizio: anomalie del turno prima in una riga", out)
c, out = lancia("inizio")
controlla(out == "", "dette una volta sola", out)
# Messaggi divisi in più righe con lo stesso id: contati una volta.
doppio = claude("d", 75_000, out=20_000)
c, out = lancia("fine", BASE + [doppio, doppio])
c, out = lancia("inizio")
controlla(out == "", "stesso id due volte: 20k scritti, non 40k (sotto il tetto)", out)
# Avvio pesante.
c, out = lancia("fine", [utente("[AVVIO]"), claude("a", 150_000)], sessione="s2")
c, out = lancia("inizio", sessione="s2")
controlla("avvio pesante" in out, "primo turno oltre il tetto: avvio pesante", out)
# C469 A10: sessione che lavora tutta in un turno: avvio leggero (12 chiamate a 90k), poi lavoro fino a 175k → niente allarme
lungo = [utente("[AVVIO]")] + [claude(f"l{i}", 90_000) for i in range(12)] + [claude(f"w{i}", 100_000 + i * 15_000) for i in range(6)]
lancia("fine", lungo, sessione="s2b")
out = lancia("inizio", sessione="s2b")[1]
controlla("avvio pesante" not in out and "aggiunto" not in out, "A10: lavoro tutto nel primo turno, avvio leggero: muto", out)
# Ripetuto dal vivo: al 4° uguale una riga, poi silenzio.
lancia("inizio", sessione="s3")
uscite = [lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git log"})[1] for _ in range(5)]
controlla(uscite[:3] == ["", "", ""] and "4 volte" in uscite[3] and uscite[4] == "", "tool: avviso al 4° comando uguale, una volta", uscite)
controlla(lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git diff"})[1] == "", "tool: comando diverso muto")
lancia("inizio", sessione="s3")
controlla(lancia("tool", sessione="s3", tool_name="Bash", tool_input={"command": "git log"})[1] == "", "tool: turno nuovo, conti azzerati")
# C469 fase 2 (rapporto 13 M6): 4 aiutanti lanciati insieme fanno lo stesso primo Glob: non è un comando ripetuto.
lancia("inizio", sessione="s4")
uscite = [lancia("tool", sessione="s4", tool_name="Glob", tool_input={"pattern": "**/*.md"}, agent_id=f"ag{i}")[1] for i in range(4)]
controlla(uscite == ["", "", "", ""], "tool: stesso comando in 4 aiutanti diversi = muto", uscite)
uscite = [lancia("tool", sessione="s4", tool_name="Glob", tool_input={"pattern": "**/*.md"}, agent_id="ag9")[1] for _ in range(4)]
controlla("4 volte" in uscite[3], "tool: 4 volte nello stesso aiutante = avviso", uscite)
# Totale del giorno della sessione.
# C434: il totale sta in .git/consumo (la scorta lo copia nel ramo), mai fra i file del progetto.
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-s1.json"), encoding="utf-8") as f:
    tot = json.load(f)
controlla(tot["turni"] == 3 and tot["account"] != "conto-A" and len(tot["account"]) == 6 and tot["anomalie"], "totale in .git/consumo, account coperto", tot)
controlla(not os.path.exists(os.path.join(TMP, "archivio", "consumo")), "niente file nuovi fra quelli del progetto (C434)")
controlla("aiutanti" in tot and tot.get("strumenti", 0) >= 0, "A10: aiutanti e strumenti del giorno nel totale", tot)
# Avvio: account con ieri 2 volte la media → una riga; account normale → muto. I giorni vecchi arrivano dal ramo
# (archivio/consumo), quello di ieri di questo contenitore da .git/consumo.
cons = os.path.join(TMP, "archivio", "consumo")
os.makedirs(cons)
for nome in os.listdir(os.path.join(TMP, ".git", "consumo")):
    os.remove(os.path.join(TMP, ".git", "consumo", nome))
for giorno, peso in (("2026-10-28", 100_000), ("2026-10-29", 120_000), ("2026-10-30", 80_000)):
    with open(os.path.join(cons, f"{giorno}-x.json"), "w") as f:
        json.dump({"account": "aaa111", "peso": peso}, f)
with open(os.path.join(TMP, ".git", "consumo", "2026-11-02-x.json"), "w") as f:
    json.dump({"account": "aaa111", "peso": 300_000}, f)
c, out = lancia("avvio")
controlla("account aaa111" in out and "3.0 volte" in out, "avvio: account oltre la media → una riga", out)
controlla("1 sessioni (prima 1 al giorno), 300k a sessione (prima 100k), 0 avvii pesanti" in out and "niente letture" in out,
          "avvio: sessioni e peso a sessione già nella riga (C455, Risparmio 19)", out)
# C455 (Risparmio 19): nel ramo c'è già un totale di oggi di un'altra sessione → l'avviso l'ha già avuto lei: muto.
with open(os.path.join(cons, "2026-11-03-altra.json"), "w") as f:
    json.dump({"account": "aaa111", "peso": 10}, f)
controlla(lancia("avvio")[1] == "", "avvio: già detto oggi da un'altra sessione → muto")
os.remove(os.path.join(cons, "2026-11-03-altra.json"))
# Sessione nata ieri e accesa dopo mezzanotte: il suo totale di oggi non zittisce l'avviso (lei non l'ha avuto).
for g in ("2026-11-02", "2026-11-03"):
    with open(os.path.join(cons, f"{g}-notte.json"), "w") as f:
        json.dump({"account": "aaa111", "peso": 0, "sessione": "notte"}, f)
controlla("account aaa111" in lancia("avvio")[1], "avvio: totale di oggi di una sessione di ieri → non zittisce")
for g in ("2026-11-02", "2026-11-03"):
    os.remove(os.path.join(cons, f"{g}-notte.json"))
with open(os.path.join(cons, "2026-11-02-x.json"), "w") as f:  # stesso file nel ramo e in .git: vale quello di .git
    json.dump({"account": "aaa111", "peso": 300_000}, f)
with open(os.path.join(TMP, ".git", "consumo", "2026-11-02-x.json"), "w") as f:
    json.dump({"account": "aaa111", "peso": 110_000}, f)
c, out = lancia("avvio")
controlla(out == "", "avvio: account nella media → muto", out)
# Errori: silenzio.
r = subprocess.run([sys.executable, "-I", HOOK, "fine"], input="non json", capture_output=True, text=True, timeout=30)
controlla(r.returncode == 0 and r.stdout == "", "ingresso rotto: silenzio")
c, out = lancia("fine", BASE, stop_hook_active=True)
controlla(c == 0 and out == "", "secondo giro dello Stop: muto")

# C454 Motore giusto. Fable per una domanda: al primo turno leggero muto, al secondo di fila una riga (una volta sola).
F, O, S = "claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5"


def turno(*voci_claude, sessione="m1"):
    lancia("inizio", sessione=sessione)
    lancia("fine", [utente("domanda")] + list(voci_claude), sessione=sessione)
    return lancia("inizio", sessione=sessione)[1]


controlla(turno(claude("f1", 50_000, motore=F)) == "", "Fable leggero, primo turno: muto")
out = turno(claude("f2", 52_000, motore=F))
controlla("MOTORE (C454)" in out and "⬇️ 2 turni" in out and "Ho capito" in out and "SPRECO" not in out, "Fable leggero 2 di fila: ⬇️ una riga", out)
controlla("anche adesso" in out, "contesto piccolo: si può cambiare subito", out)
lancia("fine", [utente("d")] + [claude("q1", 180_000, motore=F)], sessione="m6")
lancia("inizio", sessione="m6")
lancia("fine", [utente("d")] + [claude("q2", 181_000, motore=F)], sessione="m6")
out = lancia("inizio", sessione="m6")[1]
controlla("dalla prossima chat" in out and "181k" in out, "contesto grande: cambiare dalla prossima chat", out)
turno(claude("f3", 53_000, motore=F))
controlla(turno(claude("f4", 54_000, motore=F)) == "", "⬇️ detto una volta per sessione")
# Fable che ragiona (molto pensiero) o scrive un file: giusto, muto.
controlla(turno(claude("g1", 50_000, out=9_000, motore=F), sessione="m2") == "" and
          turno(claude("g2", 50_000, out=9_000, motore=F), sessione="m2") == "", "Fable che ragiona: muto")
controlla(turno(claude("h1", 50_000, motore=F, strumento="Write", ingresso={"file_path": "docs/piano.md"}), sessione="m3") == "" and
          turno(claude("h2", 50_000, motore=F, strumento="Write", ingresso={"file_path": "docs/piano.md"}), sessione="m3") == "",
          "Fable che scrive la specifica: muto")
# Sonnet che scrive codice: ⬆️; Sonnet che scrive un testo: muto.
controlla(turno(claude("s1", 50_000, motore=S, strumento="Write", ingresso={"file_path": "docs/note.md"}), sessione="m4") == "",
          "Sonnet scrive un testo: muto")
out = turno(claude("s2", 50_000, motore=S, strumento="Edit", ingresso={"file_path": "app/src/ui/x.js"}), sessione="m4")
controlla("⬆️ codice scritto con Sonnet" in out, "Sonnet scrive codice: ⬆️ Opus", out)


# Opus con 5 errori di strumenti nel turno: ⬆️ Fable; con 2: muto.
def errori(n, base):
    v = []
    for i in range(n):
        v += [claude(f"{base}{i}", 50_000 + i, motore=O, strumento="Bash", ingresso={"command": f"npm test {i}"}),
              {"type": "user", "message": {"content": [{"type": "tool_result", "tool_use_id": "t", "content": "FAIL", "is_error": True}]}}]
    return v


controlla(turno(*errori(2, "e"), sessione="m5") == "", "Opus con 2 errori: muto")
out = turno(*errori(5, "k"), sessione="m5")
controlla("⬆️ Opus in difficoltà (5 errori" in out, "Opus con 5 errori: ⬆️ Fable", out)
# Pagella: turni Fable leggeri nella settimana → una riga all'avvio, una volta al giorno; peso per motore.
with open(os.path.join(cons, "2026-10-31-p.json"), "w") as f:
    json.dump({"account": "bbb222", "peso": 1000, "fable_leggeri": 6, "motori": {"fable": 600, "opus": 400}}, f)
c, out = lancia("avvio")
controlla("PAGELLA MOTORI (C454)" in out and "6 turni" in out and "Fable 60%" in out and "Opus 40%" in out, "pagella all'avvio", out)
controlla(lancia("avvio")[1] == "", "pagella una volta al giorno")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-m1.json"), encoding="utf-8") as f:
    tot = json.load(f)
controlla(tot.get("fable_leggeri") == 4 and "fable" in tot.get("motori", {}), "totale: turni Fable leggeri e peso per motore", tot)

# C455: memoria veloce scaduta (chiamata che riscrive oltre 50k) contata nel totale, mai detta.
scad = claude("s2", 200_000); scad["message"]["usage"]["cache_creation_input_tokens"] = 190_000
c, out = lancia("fine", [utente("ciao"), claude("s0", 90_000), utente("dopo due ore"), scad], sessione="sc1")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-sc1.json"), encoding="utf-8") as f:
    tot = json.load(f)
controlla(out == "" and tot.get("memoria_scaduta") == 1 and tot.get("ricreati") == 190_000, "memoria scaduta nel totale", tot)
prima = claude("p0", 90_000); prima["message"]["usage"]["cache_creation_input_tokens"] = 80_000
lancia("fine", [utente("ciao"), prima], sessione="sc2")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-sc2.json"), encoding="utf-8") as f:
    tot = json.load(f)
controlla("memoria_scaduta" not in tot, "la prima chiamata della sessione non conta", tot)

# C497 A1: token veri e dollari di listino nel totale (un turno con UNA risposta; `peso` resta com'era).
def bilancia(sess, letti=0, scritti=0, uscita=0, ingresso=0, modello="claude-opus-5-5", dettaglio=None):
    u = {"input_tokens": ingresso, "cache_read_input_tokens": letti, "cache_creation_input_tokens": scritti, "output_tokens": uscita}
    if dettaglio is not None:
        u["cache_creation"] = dettaglio
    lancia("fine", [utente("ciao"), {"type": "assistant", "message": {"id": sess, "model": modello, "content": [{"type": "text", "text": "x"}], "usage": u}}], sessione=sess)
    with open(os.path.join(TMP, ".git", "consumo", f"2026-11-03-{sess}.json"), encoding="utf-8") as f:
        return json.load(f)


tot = bilancia("pa1", 34_125_305, 1_103_279, 88_011, 2_348)
controlla("grezzi" in tot and tot.get("bilancia") == 2, "A1: il totale porta i token veri (controprova rossa prima del cambio)", tot)
controlla(abs(tot.get("costo", 0) - 17.42) <= 0.02, "A1 caso 1: Opus → 17,42 $", tot)
tot = bilancia("pa2", 16_568_107, 198_005, 66_849, 1_683)
controlla(abs(tot.get("costo", 0) - 6.24) <= 0.02, "A1 caso 2: Opus → 6,24 $", tot)
tot = bilancia("pa3", 1_183_868, 159_967, 43_050, 1_252, modello="claude-fable-5-2")
controlla(abs(tot.get("costo", 0) - 4.53) <= 0.02, "A1 caso 3: Fable → 4,53 $", tot)
tot = bilancia("pa4", scritti=100_000, dettaglio={"ephemeral_5m_input_tokens": 100_000, "ephemeral_1h_input_tokens": 0})
controlla(abs(tot.get("costo", 0) - 0.50) <= 0.005, "A1 caso 4: scritti a 5 minuti → 0,50 $", tot)
tot = bilancia("pa5", scritti=100_000)
controlla(abs(tot.get("costo", 0) - 0.80) <= 0.005, "A1 caso 5: scritti senza dettaglio = a 1 ora → 0,80 $", tot)
tot = bilancia("pa6", 1_000, 1_000, 1_000, 10, modello="claude-haiku-5-5")
controlla("haiku" in tot.get("grezzi", {}) and "costo" not in tot, "A1 caso 6: motore senza prezzo → grezzi sì, costo no", tot)
tot = bilancia("pa7", scritti=100_000, ingresso=10)
controlla(tot.get("peso") == 125_010, "A1 caso 7: `peso` come prima", tot)

# C497 A2: ripartenze a freddo = [contesto in migliaia, minuti dalla risposta prima, 0 inizio turno · 1 dentro il turno].
def fredda(mid, letti, scritti, ora=None):
    v = {"type": "assistant", "message": {"id": mid, "model": "claude-opus-5-5", "content": [{"type": "text", "text": "x"}], "usage": {
        "input_tokens": 0, "cache_read_input_tokens": letti, "cache_creation_input_tokens": scritti, "output_tokens": 100}}}
    if ora:
        v["timestamp"] = f"2026-11-13T{ora}:00.000Z"
    return v


def fredde(sess, voci):
    lancia("fine", voci, sessione=sess)
    with open(os.path.join(TMP, ".git", "consumo", f"2026-11-03-{sess}.json"), encoding="utf-8") as f:
        return json.load(f).get("fredde")


f = fredde("fr1", [utente("ciao"), fredda("f0", 90_000, 0, "10:00"), utente("dopo"), fredda("f1", 10_000, 190_000, "12:05")])
controlla(f == [[200, 125, 0]], "A2 caso 1: ripartenza a inizio turno dopo 125 minuti", f)
f = fredde("fr2", [utente("ciao"), fredda("f0", 90_000, 0), utente("dopo"), fredda("f1", 10_000, 190_000)])
controlla(f == [[200, None, 0]], "A2 caso 2: senza ore → minuti null", f)
f = fredde("fr3", [utente("ciao"), fredda("f0", 90_000, 0, "10:00"), utente("dopo"), fredda("f1", 10_000, 190_000, "12:05"),
                   fredda("f2", 200_000, 60_000, "12:10")])
controlla(f == [[200, 125, 0], [260, 5, 1]], "A2 caso 3: seconda ripartenza dentro il turno", f)

# C497 A3: riga del lunedì sulle ripartenze a freddo e pagella in dollari (il 09/11/2026 è lunedì).
def settimana(totali, cart=None):
    cart = cart or tempfile.mkdtemp()
    os.makedirs(os.path.join(cart, ".git"), exist_ok=True)
    os.makedirs(os.path.join(cart, "archivio", "consumo"), exist_ok=True)
    for d, t in zip(range(2, 9), totali):
        with open(os.path.join(cart, "archivio", "consumo", f"2026-11-0{d}-s{d}.json"), "w") as f:
            json.dump(dict({"account": "aaa111", "peso": 1000, "sessione": f"s{d}"}, **t), f)
    return cart


def avvio_in(cart, giorno="2026-11-09"):
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=cart, CLAUDE_CODE_ACCOUNT_UUID="conto-A", SPRECO_OGGI=giorno, SPRECO_NO_GIT="1")
    r = subprocess.run([sys.executable, "-I", HOOK, "avvio"], input=json.dumps({"session_id": "x"}), capture_output=True, text=True, timeout=30, env=amb)
    return r.stdout


FREDDA = {"bilancia": 2, "costo": 10, "costo_fredde": 1, "memoria_scaduta": 2}
cart = settimana([FREDDA] * 7)
out = avvio_in(cart)
controlla("RIPARTENZE A FREDDO (C497)" in out and "14 volte" in out and "10 %" in out, "A3 caso 1: lunedì, riga delle ripartenze", out)
controlla("RIPARTENZE A FREDDO" not in avvio_in(cart), "A3 caso 5: seconda accensione del lunedì → muta")
controlla("RIPARTENZE A FREDDO" not in avvio_in(settimana([FREDDA] * 7), "2026-11-10"), "A3 caso 2: martedì → muta")
controlla("RIPARTENZE A FREDDO" not in avvio_in(settimana([dict(FREDDA, costo_fredde=0.2)] * 7)), "A3 caso 3: sotto il 5 % → muta")
senza = {k: v for k, v in FREDDA.items() if k != "bilancia"}
controlla("RIPARTENZE A FREDDO" not in avvio_in(settimana([senza] * 7)), "A3 caso 4: totali senza bilancia → muta")
PAG = {"fable_leggeri": 1, "bilancia": 2, "motori": {"fable": 1000, "opus": 3000},
       "grezzi": {"fable": [0, 0, 100000, 0, 0], "opus": [0, 0, 100000, 0, 0]}}
out = avvio_in(settimana([PAG] * 7))
controlla("spesa a listino per motore: Fable 66%, Opus 33%" in out, "A3 caso 6: pagella in dollari", out)
out = avvio_in(settimana([PAG] * 6 + [{k: v for k, v in PAG.items() if k != "bilancia"}]))
controlla("token per motore: Opus 75%, Fable 25%" in out, "A3 caso 7: un totale senza bilancia → pagella in token", out)

# C497 B2: guardiano degli strumenti nuovi (elenco in .claude/strumenti-noti.txt; senza elenco tace).
def hook_in(cart, modo, voci=None, giorno="2026-11-03", sess="g1"):
    percorso = os.path.join(cart, "t.jsonl")
    with open(percorso, "w", encoding="utf-8") as f:
        for v in voci or []:
            f.write(json.dumps(v, ensure_ascii=False) + "\n")
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=cart, CLAUDE_CODE_ACCOUNT_UUID="conto-A", SPRECO_OGGI=giorno, SPRECO_NO_GIT="1")
    r = subprocess.run([sys.executable, "-I", HOOK, modo], input=json.dumps({"session_id": sess, "transcript_path": percorso}),
                       capture_output=True, text=True, timeout=30, env=amb)
    return r.stdout


def guardiano(nomi_noti, avvio_nomi, emersi, sess):
    cart = tempfile.mkdtemp()
    os.makedirs(os.path.join(cart, ".git"))
    if nomi_noti is not None:
        os.makedirs(os.path.join(cart, ".claude"))
        with open(os.path.join(cart, ".claude", "strumenti-noti.txt"), "w", encoding="utf-8") as f:
            f.write("# commento\n" + "\n".join(nomi_noti) + "\n")
    voci = [{"type": "attachment", "attachment": {"type": "prompt_snapshot", "tools": [{"name": n} for n in avvio_nomi]}},
            utente("ciao"), {"type": "attachment", "attachment": {"type": "deferred_tools_delta", "surfacedNames": emersi}},
            claude("b1", 60_000)]
    hook_in(cart, "fine", voci, sess=sess)
    with open(os.path.join(cart, ".git", "consumo", f"2026-11-03-{sess}.json"), encoding="utf-8") as f:
        return cart, json.load(f)


NOTI = ["Bash", "mcp__github__*"]
EMERSI = ["mcp__github__x", "mcp__server-nuovo__a", "mcp__server-nuovo__b", "mcp__2de344a9-2c1b-4cdb-80b7-57ff11e49321__y"]
cart, tot = guardiano(NOTI, ["Bash", "StrumentoNuovo"], EMERSI, "gu1")
controlla(tot.get("strumenti_nuovi") == ["StrumentoNuovo", "mcp__server-nuovo__*"], "B2 caso 1: strumenti nuovi nel totale", tot)
out = hook_in(cart, "avvio", giorno="2026-11-04", sess="gu9")
controlla("STRUMENTI NUOVI (C497)" in out and "StrumentoNuovo" in out and "mcp__server-nuovo__*" in out, "B2 caso 4: detti all'avvio del giorno dopo", out)
with open(os.path.join(cart, ".claude", "strumenti-noti.txt"), "a", encoding="utf-8") as f:
    f.write("StrumentoNuovo\nmcp__server-nuovo__*\n")
controlla("STRUMENTI NUOVI" not in hook_in(cart, "avvio", giorno="2026-11-04", sess="gu9"), "B2 caso 4: aggiunti all'elenco → muto")
_, tot = guardiano(NOTI, ["Bash"], ["mcp__github__x"], "gu2")
controlla("strumenti_nuovi" not in tot, "B2 caso 2: solo nomi noti → niente chiave", tot)
_, tot = guardiano(None, ["Bash", "StrumentoNuovo"], EMERSI, "gu3")
controlla("strumenti_nuovi" not in tot, "B2 caso 3: senza elenco → il guardiano tace", tot)

# C458: motore e impegno, una riga solo quando cambiano (zero token se no).
MI = [utente("ciao"), claude("a", 60_000, motore="claude-opus-5-5"), utente("fai x")]
out = lancia("inizio", MI, sessione="mi1", effort={"level": "medium"})[1]
controlla("MOTORE E IMPEGNO (C458)" in out and "🧠 Opus · Medio" in out, "C458: prima volta, la riga c'è", out)
out = lancia("inizio", MI, sessione="mi1", effort={"level": "medium"})[1]
controlla("C458" not in out, "C458: niente cambiato, muto", out)
out = lancia("inizio", MI, sessione="mi1", effort={"level": "high"})[1]
controlla("🧠 Opus · Alto" in out, "C458: impegno cambiato, di nuovo la riga", out)
MI2 = MI[:2] + [claude("b", 61_000, motore="claude-fable-5-1"), utente("y")]
out = lancia("inizio", MI2, sessione="mi1", effort={"level": "high"})[1]
controlla("🧠 Fable · Alto" in out, "C458: motore cambiato, di nuovo la riga", out)
os.makedirs(os.path.join(TMP, ".claude"), exist_ok=True)
with open(os.path.join(TMP, ".claude", "settings.json"), "w", encoding="utf-8") as f:
    json.dump({"effortLevel": "medium"}, f)
out = lancia("inizio", MI, sessione="mi3")[1]
controlla("🧠 Opus · Medio" in out, "C458: senza impegno nell'hook, quello del progetto", out)
# E332 (Risparmio 17): la sessione aperta con create_session ha il SUO impegno (Extra), il file comune dice Medio: vale il
# registro della sessione («effort» delle risposte), il file solo se il registro non lo dice
MIx = [utente("ciao"), dict(claude("a", 60_000, motore="claude-opus-5-5"), effort="xhigh"), utente("fai x")]
out = lancia("inizio", MIx, sessione="mi4")[1]
controlla("🧠 Opus · Extra" in out, "E332: senza impegno nell'hook, quello vero del registro (non il file comune)", out)
out = lancia("inizio", [utente("ciao")], sessione="mi2", effort={"level": "medium"})[1]
controlla("C458" not in out, "C458: motore ancora ignoto (primo messaggio), muto", out)

# Regola «Fable pensa, Opus esegue» (kit 36.0): riga dei due tempi al cambio di motore, muta negli altri casi.
MF = [utente("ciao"), claude("a", 60_000, motore=F), utente("fai x")]
out = lancia("inizio", MF, sessione="ft1", effort={"level": "high"})[1]
controlla("FABLE PENSA, OPUS ESEGUE" in out and "tempo 1" in out and "skill fable-opus" in out, "Fable: riga del tempo 1", out)
controlla("💎" in out and "resta a Fable" in out, "Fable: la riga del tempo 1 dice dei 💎 e di «resta a Fable» (C487 R4)", out)
out = lancia("inizio", MF, sessione="ft1", effort={"level": "xhigh"})[1]
controlla("🧠 Fable · Extra" in out and "FABLE PENSA" not in out, "Fable, cambia solo l'impegno: niente seconda riga", out)
MF2 = MF[:2] + [claude("b", 61_000, motore=O), utente("y")]
out = lancia("inizio", MF2, sessione="ft1", effort={"level": "xhigh"})[1]
controlla("tempo 2" in out and "primo passo aperto" in out, "da Fable a Opus: riga del tempo 2", out)
controlla("saltali" in out and "se c'è un piano di Fable" in out, "da Fable a Opus: salta i 💎 (C487 R4)", out)
out = lancia("inizio", MI, sessione="ft2", effort={"level": "medium"})[1]
controlla("🧠 Opus · Medio" in out and "FABLE PENSA" not in out, "solo Opus: niente riga dei due tempi", out)

# Aiutanti: 5 con Fable (tempo 1) muti, 5 con Opus avviso (tetto 6 e 3).
for mot, sess, atteso in (("claude-fable-5-1", "ag1", False), ("claude-opus-5-5", "ag2", True)):
    v = [utente("pensa")] + [claude(f"g{i}", 60_000 + i, strumento="Agent", motore=mot) for i in range(5)]
    lancia("fine", v, sessione=sess)
    out = lancia("inizio", sessione=sess)[1]
    controlla(("5 aiutanti" in out) == atteso, f"aiutanti: 5 con {mot.split('-')[1]} " + ("avviso" if atteso else "muti"), out)
# C469 B3: uscita enorme detta subito (al massimo 2 per turno), piccola muta.
lancia("inizio", sessione="u1")
grande = {"stdout": "x" * 50_000, "stderr": ""}
o1 = lancia("tool", sessione="u1", tool_name="Bash", tool_input={"command": "cat a"}, tool_response=grande)[1]
controlla("USCITA ENORME" in o1 and "48 KB" in o1, "B3: uscita di 48 KB detta subito", o1)
controlla(lancia("tool", sessione="u1", tool_name="Bash", tool_input={"command": "ls"}, tool_response={"stdout": "poco"})[1] == "",
          "B3: uscita piccola muta")
lancia("tool", sessione="u1", tool_name="Bash", tool_input={"command": "cat b"}, tool_response=grande)
o3 = lancia("tool", sessione="u1", tool_name="Read", tool_input={"file_path": "c"}, tool_response=[{"text": "y" * 60_000}])[1]
controlla(o3 == "", "B3: la terza del turno muta", o3)
lancia("inizio", sessione="u1")
controlla("USCITA ENORME" in lancia("tool", sessione="u1", tool_name="Bash", tool_input={"command": "cat d"}, tool_response=grande)[1],
          "B3: turno nuovo, di nuovo detta")
# E454 (Giri 70): un'immagine letta conta per i pixel (520×533 = ~380 token), non per il base64 di 60 KB: muta.
lancia("inizio", sessione="u3")
img = {"type": "image", "file": {"base64": "A" * 60_000, "type": "image/jpeg", "originalSize": 45_000,
                                 "dimensions": {"originalWidth": 520, "originalHeight": 533, "displayWidth": 520, "displayHeight": 533}}}
controlla(lancia("tool", sessione="u3", tool_name="Read", tool_input={"file_path": "f.jpg"}, tool_response=img)[1] == "",
          "E454: immagine piccola di pixel = niente «uscita enorme»")
senza = {"type": "image", "file": {"base64": "A" * 60_000}}
controlla("USCITA ENORME" in lancia("tool", sessione="u3", tool_name="Read", tool_input={"file_path": "g.jpg"}, tool_response=senza)[1],
          "E454: immagine senza misure = conto in byte come prima")
# C469: «bashEditDiff» (differenze dei file cambiati da sed -i o git rm) non lo legge Claude: niente falso allarme.
lancia("inizio", sessione="u2")
o5 = lancia("tool", sessione="u2", tool_name="Bash", tool_input={"command": "git rm x"},
            tool_response={"stdout": "ok", "bashEditDiff": "d" * 70_000})[1]
controlla(o5 == "", "C469: bashEditDiff di 68 KB non è un'uscita enorme", o5)
# C469 fase 2: Edit di un file grosso (originalFile, structuredPatch): Claude non legge l'esito, niente falso allarme
lancia("inizio", sessione="u3")
o6 = lancia("tool", sessione="u3", tool_name="Edit", tool_input={"file_path": "docs/DA-FARE.md"},
            tool_response={"originalFile": "x" * 45_000, "structuredPatch": [{"lines": ["y" * 3_000]}]})[1]
controlla(o6 == "", "C469 fase 2: Edit di un file di 44 KB non è un'uscita enorme", o6)

# C469 fase 2 (rapporto 14 voce 2): blocchi degli hook e tempi scaduti contati nel totale del giorno, mai detti.
def allegato(uid, a):
    return {"type": "attachment", "uuid": uid, "attachment": a}
bl1 = allegato("b1", {"type": "hook_blocking_error", "hookName": "Stop", "hookEvent": "Stop", "blockingError": {
    "blockingError": "Promessa a Mario senza voce", "command": 'python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/promesse.py"'}})
bl2 = allegato("b2", {"type": "hook_blocking_error", "hookName": "PostToolUse:Bash", "hookEvent": "PostToolUse",
                      "blockingError": "testo senza comando"})
sc = allegato("c1", {"type": "hook_cancelled", "hookName": "UserPromptSubmit", "hookEvent": "UserPromptSubmit",
                     "command": "command hook 2", "timedOut": True, "timeoutMs": 10000})
annullato = allegato("c2", {"type": "hook_cancelled", "hookName": "Stop", "hookEvent": "Stop", "command": "command hook 1"})
v = [utente("ciao"), sc, claude("k1", 60_000), bl1]
c, out = lancia("fine", v, sessione="bk1")
controlla(c == 0 and out == "", "blocchi: fine muta", out)
c, out = lancia("fine", v + [claude("k2", 61_000), bl2, annullato], sessione="bk1", stop_hook_active=True)
controlla(c == 0 and out == "", "blocchi: secondo giro dello Stop muto", out)
lancia("fine", v + [claude("k2", 61_000), bl2, annullato, utente("altro"), claude("k3", 62_000)], sessione="bk1")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-bk1.json"), encoding="utf-8") as f:
    tot = json.load(f)
b = tot.get("blocchi") or {}
controlla(b.get("promesse.py") == 1 and b.get("PostToolUse:Bash") == 1 and b.get("UserPromptSubmit 2 · tempo scaduto") == 1
          and len(b) == 3, "blocchi contati una volta sola, anche col secondo giro (per hook; tempo scaduto a parte)", b)
# C469 fase 2 (rapporto 14 voce 8): hook andato in errore (uscita 1, Traceback) contato a parte
er = allegato("e1", {"type": "hook_non_blocking_error", "hookName": "Stop", "hookEvent": "Stop", "exitCode": 1,
                     "stderr": "Traceback ...", "command": 'python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/lingua-check.py"'})
lancia("fine", [utente("ciao"), claude("e1", 60_000), er], sessione="bk2")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-bk2.json"), encoding="utf-8") as f:
    b = json.load(f).get("blocchi") or {}
controlla(b == {"lingua-check.py · errore": 1}, "hook in errore contato col suo nome", b)
# Rodato dal vivo (10/11, Risparmio 11): i blocchi dello Stop arrivano come messaggio di sistema «Stop hook feedback»
# (non come allegato): prima non si contavano e il rodaggio di domande-chiare.py era cieco
fb = {"type": "user", "isMeta": True, "uuid": "m1", "timestamp": "2026-11-03T11:05:09.000Z", "message": {"role": "user", "content":
      "Stop hook feedback:\n[command hook 8]: Promessa a Mario senza voce 👁 in docs/DA-FARE.md (C331): «…»."}}
fb2 = {"type": "user", "isMeta": True, "uuid": "m2", "message": {"role": "user", "content":
       "Stop hook feedback:\n[command hook 5]: Domanda a Mario poco chiara (C233, E145): manca la riga"}}
finto = {"type": "user", "uuid": "m3", "message": {"role": "user", "content": "Stop hook feedback: [command hook 1]: scritto da Mario"}}
lancia("fine", [utente("ciao"), claude("f1", 60_000), fb, claude("f2", 61_000), fb2, finto], sessione="bk3")
lancia("fine", [utente("ciao"), claude("f1", 60_000), fb, claude("f2", 61_000), fb2, finto, claude("f3", 62_000)],
       sessione="bk3")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-bk3.json"), encoding="utf-8") as f:
    b = json.load(f).get("blocchi") or {}
controlla(b == {"Stop 8 · Promessa a Mario senza voce": 1, "Stop 5 · Domanda a Mario poco chiara": 1},
          "blocchi dello Stop («Stop hook feedback») contati una volta, col numero e le prime parole; non i messaggi di Mario", b)

# Risparmio 17 (10/11): per trovare i blocchi falsi servono ora (italiana) e frase che ha fatto scattare il blocco
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-bk3.json"), encoding="utf-8") as f:
    es = json.load(f).get("esempi_blocchi") or {}
controlla(es.get("Stop 8 · Promessa a Mario senza voce") == ["12:05 · Promessa a Mario senza voce 👁 in docs/DA-FARE.md (C331): «…»."]
          and es.get("Stop 5 · Domanda a Mario poco chiara") == ["?? · Domanda a Mario poco chiara (C233, E145): manca la riga"],
          "esempi dei blocchi: ora italiana e testo, una volta sola", es)
# Risparmio 18 (10/11): il messaggio dopo (inizio) azzerava la memoria dei blocchi già contati: a ogni turno nuovo lo
# stesso blocco si ricontava (dal vivo lo stesso «Promessa…» 3 volte nello stesso minuto, totali del giorno gonfiati)
vb = [utente("ciao"), claude("g1", 60_000), fb]
lancia("fine", vb, sessione="bk4")
for i in range(3):
    vb = vb + [utente(f"messaggio {i}")]
    lancia("inizio", vb, sessione="bk4")
    vb = vb + [claude(f"g{i + 2}", 61_000 + i)]
    lancia("fine", vb, sessione="bk4")
with open(os.path.join(TMP, ".git", "consumo", "2026-11-03-bk4.json"), encoding="utf-8") as f:
    b = json.load(f).get("blocchi") or {}
controlla(b == {"Stop 8 · Promessa a Mario senza voce": 1}, "blocco contato una volta anche dopo 3 messaggi nuovi", b)
# E345 bis (Risparmio 22): l'11/11 l'avviso è arrivato due volte con numeri diversi (67 contro 49 sessioni del 10/11):
# la chat risvegliata dalla sveglia leggeva la SUA copia del ramo, ferma al giorno prima. Ora legge anche il ramo su
# GitHub (fetch in un riferimento suo, mai quello di avvio-check): il totale di oggi di un'altra chat zittisce e
# i totali di ieri arrivati dopo entrano nei conti.
def git(*a, cwd):
    subprocess.run(["git", "-c", "user.name=p", "-c", "user.email=p@p", *a], cwd=cwd, check=True, capture_output=True)


G = tempfile.mkdtemp()
ORIG, PROG = os.path.join(G, "origine.git"), os.path.join(G, "prog")
git("init", "-q", "--bare", ORIG, cwd=G)
git("clone", "-q", ORIG, PROG, cwd=G)
git("checkout", "-q", "-b", "claude/rvc-ramo-definitivo", cwd=PROG)
os.makedirs(os.path.join(PROG, ".claude"))
os.makedirs(os.path.join(PROG, "archivio", "consumo"))
with open(os.path.join(PROG, ".claude", "ramo-di-lavoro.txt"), "w") as f:
    f.write("claude/rvc-ramo-definitivo\n")
for giorno, peso in (("2026-10-28", 100_000), ("2026-10-29", 120_000), ("2026-10-30", 80_000), ("2026-11-02", 300_000)):
    with open(os.path.join(PROG, "archivio", "consumo", f"{giorno}-x.json"), "w") as f:
        json.dump({"account": "aaa111", "peso": peso, "sessione": "x"}, f)
git("add", "-A", cwd=PROG)
git("commit", "-q", "-m", "base", cwd=PROG)
git("push", "-q", "origin", "claude/rvc-ramo-definitivo", cwd=PROG)
ALTRO = os.path.join(G, "altro")
git("clone", "-q", "-b", "claude/rvc-ramo-definitivo", ORIG, ALTRO, cwd=G)
with open(os.path.join(ALTRO, "archivio", "consumo", "2026-11-02-y.json"), "w") as f:  # arrivato dopo: 2 sessioni ieri
    json.dump({"account": "aaa111", "peso": 100_000, "sessione": "y"}, f)
git("add", "-A", cwd=ALTRO)
git("commit", "-q", "-m", "ieri, dopo", cwd=ALTRO)
git("push", "-q", "origin", "claude/rvc-ramo-definitivo", cwd=ALTRO)


def avvio_git():
    amb = dict(os.environ, CLAUDE_PROJECT_DIR=PROG, CLAUDE_CODE_ACCOUNT_UUID="conto-A", SPRECO_OGGI="2026-11-03")
    amb.pop("SPRECO_NO_GIT", None)
    r = subprocess.run([sys.executable, "-I", HOOK, "avvio"], input=json.dumps({"session_id": "s9"}), capture_output=True,
                       text=True, timeout=30, env=amb)
    return r.stdout


out = avvio_git()
controlla("4.0 volte" in out and "2 sessioni" in out, "E345 bis: totali di ieri arrivati nel ramo dopo → nei conti", out)
with open(os.path.join(ALTRO, "archivio", "consumo", "2026-11-03-altra.json"), "w") as f:
    json.dump({"account": "aaa111", "peso": 10, "sessione": "altra"}, f)
git("add", "-A", cwd=ALTRO)
git("commit", "-q", "-m", "oggi, altra chat", cwd=ALTRO)
git("push", "-q", "origin", "claude/rvc-ramo-definitivo", cwd=ALTRO)
controlla(avvio_git() == "", "E345 bis: oggi già detto da un'altra chat, solo nel ramo su GitHub → muto")
# C511 p.10: lanciato a mano da Bash (niente CLAUDE_PROJECT_DIR) → niente stato né totali nel registro vero.
MANO = tempfile.mkdtemp()
os.makedirs(os.path.join(MANO, ".git"))
with open(os.path.join(MANO, "t.jsonl"), "w", encoding="utf-8") as f:
    for v in BASE + [claude("b", 70_000), claude("c", 72_000)]:
        f.write(json.dumps(v) + "\n")
amb = {k: v for k, v in os.environ.items() if k != "CLAUDE_PROJECT_DIR"}
amb.update(CLAUDE_CODE_ACCOUNT_UUID="conto-A", SPRECO_OGGI="2026-11-03", SPRECO_NO_GIT="1")
r = subprocess.run([sys.executable, "-I", HOOK, "fine"], input=json.dumps({"session_id": "m1", "transcript_path": os.path.join(MANO, "t.jsonl")}),
                   capture_output=True, text=True, timeout=30, env=amb, cwd=MANO)
scritti = [os.path.relpath(os.path.join(d, n), MANO) for d, _, ff in os.walk(MANO) for n in ff if n != "t.jsonl"]
controlla(r.returncode == 0 and scritti == [], "C511 p.10: a mano (senza CLAUDE_PROJECT_DIR) non scrive nel registro", scritti)
print(f"ok {ok_n} controlli · ERRORI: 0")
