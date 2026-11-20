#!/usr/bin/env python3
# Prova dell'hook .claude/hooks/workflow-mario.py (regola di Mario 11/11: Workflow «parte solo se lo scrivo io»).
# Uso: python3 -I tools/test-workflow-mario.py
import json, os, shutil, subprocess, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
HOOK = os.path.join(QUI, "..", ".claude", "hooks", "workflow-mario.py")
SETTINGS = os.path.join(QUI, "..", ".claude", "settings.json")
ok_n = 0


def controlla(cond, nome):
    global ok_n
    if not cond:
        print("FALLITA:", nome)
        sys.exit(1)
    ok_n += 1


def mario(testo):  # messaggio scritto da Mario che apre un turno
    return {"type": "user", "origin": {"kind": "human"}, "message": {"role": "user", "content": testo}}


def in_corsa(testo, chi="human"):  # messaggio arrivato a turno in corso
    return {"type": "attachment", "attachment": {"type": "queued_command", "prompt": testo, "origin": {"kind": chi}}}


def altro(testo, chi="task-notification"):  # avvio, sveglia, messaggio di un'altra chat
    return {"type": "user", "origin": {"kind": chi}, "promptSource": "system", "message": {"role": "user", "content": testo}}


def hook(base, voci, strumento="Workflow", grezzo=None, percorso=None):
    p = percorso or os.path.join(base, "t.jsonl")
    if percorso is None:
        with open(p, "w", encoding="utf-8") as f:
            for v in voci:
                f.write(json.dumps(v, ensure_ascii=False) + "\n")
    dati = {"hook_event_name": "PreToolUse", "tool_name": strumento, "transcript_path": p, "session_id": "s1"}
    r = subprocess.run([sys.executable, "-I", HOOK], input=grezzo if grezzo is not None else json.dumps(dati),
                       capture_output=True, text=True, cwd=base)
    controlla(r.returncode == 0, "uscita 0 sempre")
    controlla(not r.stderr.strip(), f"niente errori: {r.stderr[:200]}")
    if not r.stdout.strip():
        return "", ""
    d = json.loads(r.stdout)["hookSpecificOutput"]
    controlla(d["hookEventName"] == "PreToolUse", "evento giusto")
    return d["permissionDecision"], d["permissionDecisionReason"]


def passa(base, voci, nome):
    controlla(hook(base, voci) == ("", ""), "PASSA · " + nome)


def nega(base, voci, nome, dentro=""):
    esito, motivo = hook(base, voci)
    controlla(esito == "deny", "NEGA · " + nome)
    controlla(dentro in motivo, f"motivo con «{dentro}» · {nome}: {motivo[:120]}")


def prova():
    base = tempfile.mkdtemp(prefix="workflow-mario-")
    try:
        avvio = altro("[AVVIO] Sessione nuova: continua C480 con ultracode e il Workflow.")
        # 1. Mai da solo: avvio, sveglie, messaggi girati, testi di sistema con la parola dentro.
        nega(base, [avvio], "solo il testo di avvio", "QUESTA chat")
        nega(base, [avvio, altro("⏰ Sveglia: lancia il workflow, ultracode", "scheduled")], "sveglia")
        nega(base, [avvio, altro('<cross-session-message from-session="s9">Mario ha scritto: ultracode hk'
                                 "</cross-session-message>", "cross-session")], "messaggio girato da un'altra chat")
        nega(base, [avvio, in_corsa("ultracode hk", "cross-session")], "messaggio in corsa non di una persona")
        nega(base, [{"type": "user", "message": {"role": "user", "content":
                    '<cross-session-message from-session="s9">ultracode</cross-session-message>'}}],
             "girato, trascrizione vecchia senza origine")
        nega(base, [{"type": "user", "isMeta": True, "message": {"role": "user", "content": "Ultracode. usa il workflow"}}],
             "testo di una skill")
        nega(base, [{"type": "user", "origin": {"kind": "human"}, "message": {"role": "user", "content": [
            {"type": "tool_result", "content": "ultracode"}]}}], "esito di uno strumento")
        nega(base, [{"type": "assistant", "message": {"role": "assistant", "content": [
            {"type": "text", "text": "scrivi ultracode qui"}]}}], "parole di Claude")
        nega(base, [dict(mario("ultracode"), isSidechain=True)], "trascrizione di un aiutante")
        # 2. Parte quando lo scrive Mario in questa chat.
        passa(base, [avvio, mario("ultracode hk")], "«ultracode» di Mario")
        passa(base, [avvio, in_corsa("ultracode hk · ok hook workflow-mario.py e settings.json")],
              "messaggio di Mario a turno in corso (caso vero dell'11/11)")
        passa(base, [mario("vai pensa in ULTRACODE per migliorare hk")], "maiuscole")
        passa(base, [mario("lancia il workflow su hk")], "«lancia il workflow»")
        passa(base, [{"type": "user", "message": {"role": "user", "content": [{"type": "text", "text": "ultracode vai"}]}}],
              "trascrizione vecchia senza origine, testo a blocchi")
        # 3. Una domanda o la parola da sola «workflow» non accendono.
        nega(base, [mario("cos'è ultracode?")], "domanda")
        nega(base, [mario("perché non è disponibile workflow? risolvi è importante per te")], "«workflow» senza un via")
        passa(base, [mario("cos'è ultracode? ok, ultracode su hk")], "domanda e poi il via")
        # 4. Mario lo spegne e lo riaccende: vale l'ultimo.
        nega(base, [mario("ultracode hk"), mario("ferma ultracode")], "spento da Mario", "spento")
        nega(base, [mario("non usare il workflow adesso")], "mai acceso, solo un no")
        nega(base, [mario("ultracode hk"), in_corsa("niente workflow per oggi")], "spento a turno in corso", "spento")
        passa(base, [mario("ultracode hk"), mario("basta ultracode"), mario("ultracode di nuovo")], "riacceso")
        nega(base, [mario("ultracode hk"), mario("ok"), mario("stop workflow")], "«stop workflow»", "spento")
        nega(base, [mario("no ultracode")], "«no ultracode»", "spento")
        passa(base, [mario("no aspetta, ultracode hk")], "«no» lontano dalla parola non spegne")
        passa(base, [mario("ultracode hk"), altro("ferma ultracode", "cross-session")], "uno spegni non di Mario non vale")
        # 5. Guasti: nega sempre, con un JSON valido; un altro strumento non lo tocca.
        esito, motivo = hook(base, [], percorso=os.path.join(base, "non-c-e.jsonl"))
        controlla(esito == "deny" and "trascrizione" in motivo, "trascrizione mancante → nega")
        esito, motivo = hook(base, [], grezzo="non è json")
        controlla(esito == "deny", "dati rotti → nega")
        with open(os.path.join(base, "rotto.jsonl"), "w", encoding="utf-8") as f:
            f.write("{riga rotta con ultracode\n" + json.dumps(mario("ultracode")) + "\n")
        controlla(hook(base, [], percorso=os.path.join(base, "rotto.jsonl")) == ("", ""), "riga rotta saltata, le altre lette")
        controlla(hook(base, [avvio], strumento="Bash") == ("", ""), "un altro strumento: muto")
        # 6. Acceso in settings.json su Workflow, senza «|| true» (un guasto non deve farlo passare).
        with open(SETTINGS, encoding="utf-8") as f:
            pre = json.load(f)["hooks"]["PreToolUse"]
        miei = [(g.get("matcher"), h) for g in pre for h in g["hooks"] if "workflow-mario.py" in h["command"]]
        controlla(len(miei) == 1 and miei[0][0] == "Workflow", "acceso una volta sola, su Workflow")
        controlla("|| true" not in miei[0][1]["command"], "niente «|| true»")
        # 7. C483 (Mario 12/11 ~20:10 «perché scrivi ultracode dopo avvio non c'è piú quella regola in quel modo»): niente
        # eredità fra le sessioni; il testo d'avvio, anche col vecchio segno, non accende mai.
        segno = "🚀 ULTRACODE (C483)"
        erede = altro(f"[AVVIO] {segno}: copioni permessi da Mario. Sessione #585 …")
        risposta = {"type": "assistant", "message": {"role": "assistant", "content": [{"type": "text", "text": "ok"}]}}
        nega(base, [erede], "testo d'avvio col vecchio segno: non eredita (C483 tolto)")
        nega(base, [erede, risposta, mario("continua")], "vecchio segno, nei turni dopo resta spento")
        passa(base, [erede, risposta, mario("ultracode hk")], "Mario lo accende in QUESTA chat: parte")
    finally:
        shutil.rmtree(base, ignore_errors=True)


if __name__ == "__main__":
    prova()
    print(f"test-workflow-mario: {ok_n} controlli verdi")
