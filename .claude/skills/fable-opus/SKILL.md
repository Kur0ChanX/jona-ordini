---
name: fable-opus
description: Regola «Fable pensa, Opus esegue»: Fable pensa tutto il difficile ed esegue i passi delicati, sigilla il piano, si ferma e lo dice; Opus esegue il resto senza cambiarlo; alla fine Fable collauda. Usala quando la chat lavora con Fable su un lavoro grande, a «piano pronto», quando passa da Fable a Opus e quando si esegue un piano di Fable.
---

# Fable pensa, Opus esegue

Perché: Fable ragiona meglio ma costa di più; Opus esegue bene un piano chiaro. Il piano su GitHub è il ponte fra i due. **Prima la qualità, poi il risparmio** (Mario 12/11: «solo quando è possibile, salvaguardando sempre la lucidità, pensiero e codice»): un passo va a Opus solo se un suo errore farebbe diventare rossa una prova scritta; il resto lo esegue Fable. Il caso peggiore è «tutto Fable», come senza regola. Tre lucchetti perché chi esegue non cambi ciò che Fable ha pensato: **prima** il cancello (lettura a freddo), **durante** il sigillo, **dopo** il collaudo di Fable.

## Quando scatta
- La chat lavora con Fable (lo dice l'hook del motore) all'inizio di un lavoro grande o vago, o Mario scrive «pensa con Fable» / «ultracode».
- Domanda, lettura o lavoro piccolo con Fable: rispondo e basta, niente piano (e la riga «⬇️ basta Opus», skill `nuova-funzione` «Motore giusto»).
- Un lavoro, un solo pensatore: il tempo 1 lo fa UNA chat. Prima di pensare guardo `docs/CHI-FA-COSA.md`; un'altra chat con lo stesso lavoro legge il piano e non rianalizza (E311).

## Chi esegue ogni passo
Una domanda per passo: «se chi esegue sbaglia qui, una prova scritta da me diventa rossa?» Sì → Opus. No, o la prova non la so scrivere → lo eseguo io.
- 🧠 pensato: cambio esatto, casi «dato → atteso» e controprova li scrivo io; Opus esegue alla lettera.
- 🔧 meccanico: dentro «Già deciso» i dettagli non contano (rinomine, testi, prove di routine, foto): li sceglie Opus.
- 💎 delicato: lo eseguo io, Fable. Vale almeno una: (a) la specifica esatta sarebbe lunga quanto il codice; (b) nessuna prova scritta dice se è giusto (testo di una regola, regole di accesso, parole che sono il prodotto); (c) dati veri, soldi o accessi dove l'errore fa danno prima che una prova diventi rossa; (d) difetto senza causa provata, che si capisce solo provando; (e) Opus lo ha già riportato in «❓ Per Fable». Nel passo: «perché: …».
Tre esiti, scelti caso per caso e detti a Mario col perché:
- **Resta a Fable**: tutti i passi sono 💎, o a Opus ne resterebbero meno di 3 (stima: sotto la mezz'ora; il cambio costerebbe più del risparmio). Niente lettura a freddo, sigillo né fermo: a piano scritto eseguo io, e lo dico in una riga («🧠 Questo lavoro resta a Fable: <perché>»).
- **Misto**: eseguo i 💎, poi «piano pronto» per il resto.
- **Tutto a Opus**: nessun 💎.

## Tempo 1 · Fable pensa (codice dell'app solo nei passi 💎)
1. Ora di fine dal tempo che dà Mario (ora italiana, `TZ=Europe/Rome date`); senza tempo detto: circa 1 ora.
2. **Prima lo scheletro** (entro ~15 minuti): le sezioni del piano, le scelte da prendere, i primi passi già eseguibili. Commit e push.
3. **Poi tutti i pensieri difficili**, dal più rischioso. Nel piano ognuno è chiuso, o «non serve: perché»:
   - cosa vuole davvero Mario (e cosa non ha chiesto);
   - occhio critico: doppioni, annulla, senza rete, due persone insieme, il giorno dopo, errori, cosa tocca delle altre funzioni;
   - architettura e dati: dove vive ogni dato, i dati veri già salvati;
   - soldi, sicurezza, regole di accesso;
   - difetti: la causa vera, con la controprova;
   - ordine dei passi e dipendenze; per ogni passo chi lo esegue (🧠, 🔧 o 💎);
   - per ogni passo 🧠 i casi di prova (dato → atteso) e la controprova rossa;
   - cosa può andare storto mentre si esegue: «se succede X → fai Y»;
   - le domande per Mario, fatte prima di «piano pronto».
   - cosa Mario deve guardare (foto, video, stampe, testi): il passo che lo prepara ha in «fatto quando» l'invio a Mario e la riga in «Aspetta Mario»; mai un passo «foto per Mario alla fine» (E498).
   I passi meccanici (rinomine, testi, prove di routine, foto) in una riga: li dettaglia chi esegue.
4. Letture, `grep`, prove e comandi in sola lettura per verificare le ipotesi: sì. Codice dell'app: solo nei passi 💎 (punto 7).
5. **Aiutanti** (eccezione alla regola «Aiutanti col motore leggero», SOLO nel tempo 1): agente `pensatore` (progetto senza: `Agent` tipo `Plan` con `model: fable`, e il rapporto lo salvo io subito), UNO per argomento indipendente, al massimo 6 per turno con Fable (tetto dell'hook `spreco-token.py`; altri argomenti nel turno dopo). Ognuno scrive SUBITO il suo rapporto in `archivio/<C>/rapporti/NN-<tema>.md` e mi risponde in 3 righe. I giudizi li dà solo Fable: un aiutante con un altro motore cerca e legge, non decide.
6. **Salvo a ogni sezione finita** (commit e push, non alla fine) e aggiorno «Stato» in testa al piano. Turni brevi (≤ 20 minuti): Mario può fermarmi quando vuole.
7. **Eseguo io i passi 💎**, a piano scritto: cambio, prova, commit e push, spunta e riga nel Diario, come nel tempo 2. Se un 💎 dipende da pochi passi piccoli di Opus, eseguo anche quelli. Resta aperto solo un 💎 che dipende da un passo lasciato a Opus (la «coda di Fable»).
8. **Cancello «piano pronto»** (tutto vero, sennò non lo dico):
   - pensieri difficili tutti chiusi; domande per Mario fatte (le 🛑 scritte sui passi che fermano);
   - ogni passo ha il segno (🧠, 🔧 o 💎), file, cambio, prova, «fatto quando», «dipende da»; i 💎 sono fatti, salvo la coda di Fable;
   - **lettura a freddo**: l'aiutante `lettore-piano` (Opus, senza la chat; progetto senza: `Agent` tipo `Plan` con `model: opus` e le stesse consegne) legge solo il piano e risponde coi dubbi e con «cosa farei io»; ogni dubbio diventa testo nel piano, e un passo che il lettore mette in «Meglio a Fable» prende più dettaglio o diventa 💎 (al massimo 2 giri); nel piano la riga «Lettura a freddo: gg/mm · N dubbi, risposti»;
   - `python3 -I .claude/hooks/piano.py pronto <file>`: controlla la forma e scrive il **sigillo** (impronta delle parti pensate, commit di base). Commit e push.
9. **Mi fermo e lo dico**: riga in «Aspetta Mario», titolo giallo «… · piano pronto», poi solo questo e il turno finisce: «🧠 Piano di lavoro pronto: N passi per Opus, M delicati già fatti da me. I pensieri difficili sono finiti e salvati. 1 · metti Opus · <impegno di adesso> (menu del motore e del pensiero) e scrivimi «via»: risparmi token (consiglio) · 2 · scrivimi «vai con Fable»: eseguo io, costa di più.» Con la coda di Fable aggiungo: «Alla fine servirà di nuovo Fable per K passi delicati.»
   - «via» ma sono ancora Fable: una riga sola, «Sono ancora Fable: 1 · passo a Opus e riscrivo «via» (risparmi) · 2 · vai con Fable». Con «2» o «vai con Fable» il tempo 2 lo eseguo io, e lo scrivo nel Diario.
   - Silenzio: aspetto Mario; la riga resta in «Aspetta Mario»

## Il piano (in `docs/lavori-in-corso/<C>.md`, «un posto solo»)
```
## Piano «titolo» (Fable, <Catena N>, gg/mm hh:mm) · Stato: §1 ✅ §2 ✅ §3 in corso · Primo passo aperto: A3
Sigillo: (lo scrive `piano.py pronto`)
Lettura a freddo: gg/mm · N dubbi, risposti
### Parole di Mario (intere)
### Già deciso (una riga di perché ciascuna): chi esegue non le riapre
### Non toccare (file e lavori delle altre chat)
### Pensieri difficili (- [x] tema · dove sta, oppure «non serve: perché»)
### Dritte per chi esegue (trappole, parti fragili, come provare, «se succede X → fai Y»)
### Passi (in ordine; uno = un commit piccolo)
- [ ] 🧠 A1 · cosa · `file:riga` · cambio esatto (il codice o i casi dove serve) · prova: `comando` · fatto quando: … · dipende da: — · rischio: …
- [ ] 🔧 A2 · cosa · `file` · prova: `comando` · fatto quando: … · dipende da: A1
- [x] 💎 A3 · cosa · `file` · perché: (a)…(e) in una riga · prova: `comando` · fatto quando: … · dipende da: —
### Domande per Mario (scelte numerate col consiglio; 🛑 = ferma i passi scritti accanto)
### Strade scartate (perché)
### Diario dell'esecuzione (chi esegue: una riga per passo: commit, esito della prova, scostamenti, idee fuori piano)
### ❓ Per Fable (punti che chi esegue non ha saputo decidere, con la prova)
### Collaudo di Fable (verdetto, parola per parola)
```
Le ultime tre sezioni sono aperte a chi esegue; tutto il resto è sigillato.

## Tempo 2 · Opus esegue
1. Al cambio (stessa chat o sessione nuova), prima riga a Mario: «🧠 Opus · <impegno> · riparto dal passo N» (N = «Primo passo aperto»). Leggo solo il piano (testa, «Già deciso», «Dritte», il passo aperto): non i rapporti interi, non la chat vecchia. Prima del primo passo `python3 -I .claude/hooks/piano.py stato <file>`: una riga «⚠️ E500» = dopo il sigillo un'altra chat ha cambiato file nominati dal piano; li guardo (`git diff <base>..HEAD -- <file>`): se toccano un passo, riga in «❓ Per Fable» e Fable risigilla; sennò una riga nel Diario.
2. Passo per passo: cambio, prova, commit e push; nello stesso commit «- [x]» nel passo, «Primo passo aperto» avanti e una riga nel Diario (commit, esito della prova).
3. **Il piano è sigillato**: scrivo solo spunte, «Primo passo aperto», Diario, «❓ Per Fable» e Collaudo. Il resto lo cambia solo Fable, che poi rifà `piano.py pronto` (il sigillo lo mette solo Fable). L'hook `piano.py` avvisa alla modifica e nega il push.
4. Passo 🧠: alla lettera. Se la realtà non torna (una prova lo smentisce, manca un dato) non lo adatto e non ci ripenso: lo scrivo in «❓ Per Fable» con la prova e vado al primo passo che non ne dipende. Prova rossa due volte sullo stesso passo (🧠 o 🔧): non insisto, «❓ Per Fable». Passo 🔧: i dettagli li scelgo io, dentro «Già deciso»; ogni scostamento è una riga nel Diario. **Passo 💎: è di Fable, non lo eseguo** (l'hook `piano.py` avvisa alla spunta e nega il push): lo salto, coi passi che ne dipendono. Finiti i miei, NON chiamo il collaudo (lo fa Fable in chat quando torna) e scrivo a Mario in «👉 DA FARE TU»: «Restano K passi delicati di Fable e P che ne dipendono: rimetti Fable · <impegno> e scrivimi «via». Se li vuoi da Opus, scrivimi «tutto con Opus»». Con «tutto con Opus» scritto da Mario in questa chat: le sue parole e l'ora nel Diario (riga «Passi 💎 a Opus, scelto da Mario gg/mm hh:mm: «parole»»: vale anche dopo un riavvio del contenitore), poi li eseguo per ultimi.
5. Non rifaccio l'analisi, non riapro «Già deciso», niente migliorie fuori piano: un'idea è una riga nel Diario.
6. **Piano senza sigillo** (Mario è passato a Opus a metà del tempo 1): eseguo solo i passi delle sezioni ✅ di «Stato». Il pensiero che manca non lo completo io: a Mario «piano a metà: fatti i passi pronti, per §N serve Fable».
7. «❓ Per Fable» che blocca i passi dopo: aiutante `consulente-fable`, una volta. Scelta che tocca chi usa l'app, gusti o soldi: domanda a Mario (skill `domande`): la sua risposta va nel Diario e vince sul passo; il resto va avanti.
8. **Collaudo di Fable** (piano con almeno un passo 🧠; senza collaudo il lavoro non è «fatto»; con la coda di Fable aperta lo fa Fable in chat, non l'aiutante): finiti i passi salvo le differenze dal commit di base del sigillo in `archivio/<C>/collaudo/differenze.txt` (`git diff <base>..HEAD`, senza `docs/` e `archivio/`) e chiamo `consulente-fable`: «il codice fa ciò che il piano dice? Passo 🧠 per passo 🧠; i file dei passi 💎 cambiati dopo il sigillo: ogni cambio è chiesto da un passo?; poi i ❓ aperti». Il verdetto va parola per parola in «Collaudo di Fable». «Da correggere»: i punti meccanici li correggo (riga nel Diario), gli altri a Mario: «N punti aspettano Fable: rimettilo ~10 minuti».
9. Prove, foto, PR e consegne come sempre.

## Cambio di motore
- Lo fa solo Mario (menu del motore o `/model`); io lo propongo solo a «piano pronto». Mai una skill o un comando che cambia motore da solo.
- Copioni (Workflow): caso per caso, mai ereditati dalla sessione di prima (C483, skill `consegne`); partono solo se Mario lo scrive in questa chat.
- `create_session` col motore e l'impegno della sessione che chiude (C474).
- Stessa chat: Opus rilegge la chat una volta senza memoria veloce (costa, ma va bene). Vicino alla soglia meglio l'handoff: la sessione nuova legge solo il piano.
- Soglia nel tempo 1 (piano senza sigillo): handoff come sempre (skill `consegne`); le consegne nominano il piano col «Primo passo aperto». La sessione nuova nasce già con Fable (C472); se nasce con un altro motore resta ferma finché Mario non mette Fable o scrive «vai con Opus» (segno «⛔ FABLE», hook `fermo-fable.py`).
- Fable di nuovo a metà lavoro: tempo 1 corto, solo sui «❓ Per Fable», sulla coda di 💎 e sui passi che ne dipendono: se questi sono meno di 3 li eseguo io, sennò di nuovo «piano pronto». Se Opus ha già finito dei passi, prima il collaudo: lo faccio io in chat (niente aiutante), verdetto nel piano. Se cambio le parti pensate rifaccio il sigillo.

## Titoli
Tempo 1 «… · piano con Fable»; fermo «… · piano pronto» (giallo); tempo 2 «… · esegue il piano» (regola «Titoli»: 3 parole).
