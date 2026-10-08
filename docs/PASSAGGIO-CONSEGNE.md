# Passaggio di consegne (2026-10-08, fine sessione #37)

Sessione attuale: #38

## Ultimo messaggio di Mario (#37), parola per parola
«l'ho segnato in rosso male ma per farti capire dove ti dimentichi»
(con screenshot salvato in `docs/img/segnalazioni/v52-avambraccio-bordo-bianco.jpg`: riga rossa lungo il BORDO DI SOTTO dell'avambraccio basso (quello che tiene il menù in basso) e giù lungo il bordo del polsino/manica bassa: lì c'è un contorno bianco di sfondo che resta)

## Messaggi di Mario in #37 (parola per parola)
1. (screenshot `docs/img/segnalazioni/v52-giacca-A-punta.jpg`, punta bianca della fessura cerchiata) «guarda qui c'è ancora pubblica subito dopo» → è il video vecchio (v52); la correzione `ombra` toglie quella punta. Vuole che si pubblichi subito dopo la correzione.
2. «molto meglio non perfetto ma molto meglio e non fare solo questo frame inviato controlla se c'è altro tra le 2 braccia dello chef principalmente è lí» → fatto controllo su 12 fotogrammi (sotto).
3. «poi nell'avambraccio e mano nessuno contorno sfondo bianco come normale che sia» → VUOLE: su avambraccio e mano NESSUN contorno bianco di sfondo (come è normale). Da correggere.
4. «l'ho segnato in rosso male ma per farti capire dove ti dimentichi» (screenshot sopra) → da correggere.

## Fatto in #37 (08/10)
- Avvio ok, ramo allineato. `pip install scipy` (va rifatto nella nuova sessione).
- Script del prima/dopo pronto (va ricreato, era nello scratchpad): estrae fotogrammi con ffmpeg `select=eq(n\,N-1)`, metà alta colore, metà bassa alfa (720×808), compone su fondo (30,26,24); ritaglio zona A in 720 px `(480,130,700,350)` ingrandito ×2, più scena intera ridotta. Prima = `git show 33f896f:media/invio-chef.mp4`.
- Controllo zona tra le braccia (anteprima della maschera: `exec(open('tools/anim-invio.py').read().split('frames, raw, box, fermo = []')[0])` con `sys.argv=['x','tools/originale-invio.mp4']`, poi `mask(rgb)` sui fotogrammi `{tmp}/f%03d.png`, composto e specchiato `[:, ::-1]`, ritaglio in 1920×1080 `(1150,450,1850,950)`). Con `OMBRA=245` (versione di #36) nei fotogrammi ~56-64 la parte scura entrava nella manica bassa (buco a cuneo, oltre la fine vera della fessura); con 248 restava un buco staccato nel 64; con **250** tutti i fotogrammi 40-96 sono puliti e la fessura finisce dove finisce nell'originale (controllato col filmato originale a livelli 215→255: la fessura bianca vera finisce con un taglio dritto). Commit `a858c52`: `OMBRA = 250`.
- Screenshot di Mario salvati e committati: `v52-giacca-A-punta.jpg`, `v52-avambraccio-bordo-bianco.jpg`.
- I video NON sono ancora rifatti nel repo: la sessione #37 li stava rifacendo nello scratchpad (si perdono).

## Da fare SUBITO in #38
1. **Bordo bianco su avambraccio e mano** (messaggi 3 e 4): nell'anteprima semplice (alfa con gaussiana 2, SENZA erosione) si vede un bordino chiaro attorno a mani e avambracci; nel video vero (v52) di solito è più pulito grazie a `binary_erosion(disk(2))`, `mosso` (toglie il bianco mescolato alla pelle) e sfumatura 1.6, MA Mario vede ancora un contorno bianco sul bordo di sotto dell'avambraccio basso e lungo il polsino basso (vedi screenshot). Controllare SUL VIDEO GENERATO (non sull'anteprima della maschera), fotogrammi ~40-101, zoom sui bordi della pelle. Strade possibili: erosione più forte solo sui bordi della pelle (punti con `sat>=45`, fuori da `zona` giacca), oppure «decontaminare» il colore del bordo (togliere il bianco: c=(c-(1-a))/a come in `mosso`) su una fascia di 3-4 punti attorno a pelle e polsino. Attenzione a non mangiare dita e unghie. Polsino: è stoffa (zona giacca, bordo morbido `MORBIDO`=3): lì il bordo sfumato verso il bianco crea l'alone → bordo un po' più stretto sul lato verso lo sfondo.
2. Rifare i video: `ANIM_OUT=<scratchpad>/anim python3 tools/anim-invio.py tools/originale-invio.mp4` in background (~45 min, 101 fotogrammi). Controllare: zona A (fotogrammi 85-101), zona tra le braccia (40-101), bordi di avambraccio/mano (40-101).
3. Prima/dopo per Mario → `docs/img/v53-giacca-prima-dopo.png` (zona A + bordo dell'avambraccio, prima/dopo), SendUserFile.
4. Mario ha detto «pubblica subito dopo»: copiare i video in `media/`, prove legate (`test-invio-anim`, `test-logo`, `test-news`, `test-inviti`, `test-giro`) → PR verso main → «Prove automatiche» verde → squash → `git fetch origin main && git merge origin/main`, push → controllo online (`sw.js` = `jona-ordini-v57`). Il Worker `invito` cambia (testo senza «&»): dopo, giro completo su GitHub (modo `tutto`) e dirlo in una riga (E14). Se l'unione della PR è bloccata dai permessi: Mario scrive «unisci la PR N» (E15).

## Consegne di #36

## Fatto in #36 (08/10)
- **Logo B (v53)**, commit `65dff36`: `tools/logo-ynoy.py` nuova `vB2(sx=1.18, sy=1.12)` (prima B era ×1.22 uniforme): CORP un po' più piccolo e più basso, base invariata, centrato orizzontalmente tra la Y e il giro alla metà dell'altezza di CORP (circa 17 punti dell'originale più a destra). `media/ynoy.png` rifatto (LA 496×190, stesso formato). Prima/dopo mandato a Mario: `docs/img/v53-logo-b-prima-dopo.png`. Mario non ha ancora detto se gli piace (non ha obiettato).
- «&» tolta: `index.html` (`og:site_name`, `BY` aria-label «By YNOY CORP»), `worker/invito/src/index.js` righe 15 e 25, `tools/test-logo.mjs`, `tools/README.md`, `CLAUDE.md` («Firma visibile «Jona_Ristorante By YNOY CORP» (senza «&», scelta di Mario v53)»). Vecchie voci NEWS lasciate (storia).
- **v53 già preparata** nello stesso commit: `APP_VER=53`, voce NEWS v53 («Logo nuovo e animazione più pulita»), `CACHE` `jona-ordini-v57`.
- Prove riuscite (server locale): `test-logo`, `test-news`, `test-inviti`. Da fare: `test-invio-anim`, `test-giro` (dopo i video).
- **Giacca zona A**, commit `d25fa6b`: causa trovata. Il punto A NON era nello stesso posto dell'immagine a zone di #35: nello screenshot di Mario è a destra della punta della fessura scura tra le braccia (sopra la manica bassa), dove la fessura finisce di colpo. Nell'originale la fessura di sfondo continua fino al corpo, ma lì lo sfondo è in OMBRA (minimo dei canali 246-249, lo sfondo vero è 253-255): la soglia `SOGLIA`=250 la prende per stoffa e `CHIUDI`/`liscio` la riempiono. Correzione: nuova funzione `ombra(rgb, fg)` in `tools/anim-invio.py`, chiamata alla fine di `mask()` (`fg &= ~ombra(...)`), costante `OMBRA = 245`. Allunga lo sfondo SOLO partendo da fessure strette (sfondo largo meno di ~44 punti: niente erosione dei bordi esterni della giacca), su punti con media ≥245, più chiari dei vicini (top-hat 41 px ≥ 2,5), poco colorati (sat < 14); poi chiusura, riempimento e contorno lisciato (gaussiana 6), limitato a ≥243.
- Provato su fotogrammi 22-100: nei fotogrammi 82-101 la fessura arriva al corpo in modo naturale (è il caso di Mario). Nei fotogrammi ~46-64 (passaggio del menù) la zona tolta è un po' irregolare sopra la manica bassa: da guardare nel prima/dopo; se brutta, alzare la soglia o limitare `ombra` ai fotogrammi/zone dove la fessura è lunga. Scartate: misura della trama (deviazione standard ~1-1,6 sia sullo sfondo in ombra sia sulla stoffa bruciata: non le distingue); prima versione senza il limite «fessure strette» (mangiava i bordi esterni della manica, fotogramma 22).
- Video NON ancora rifatti nel repo (`media/*.mp4` sono ancora quelli della v52).

## Consegne precedenti (#35)

### Ultimo messaggio di Mario (#35), parola per parola
«Logo B e la giacca  la A questa che la stai tralasciando sempre»
(con screenshot dell'immagine a zone, salvato in `docs/img/segnalazioni/v52-giacca-scelta-A.jpg`)

## Analisi della giacca già fatta in #35 (non rifarla)
- `media/invio-chef.mp4` = filmato originale SPECCHIATO, fotogramma k+1 = `f(k+1)` dell'originale (non invertito). Nell'originale `tools/originale-invio.mp4` lo chef è a SINISTRA. `invio-fornitore` = invertito nel tempo, non specchiato.
- Per lavorare: `pip install scipy`; si può eseguire la parte alta di `tools/anim-invio.py` con `exec(open(...).read().split('frames, raw, box, fermo = []')[0])` (con `sys.argv=['x','tools/originale-invio.mp4']`) e usare `mask(rgb)` su un fotogramma.
- Vista utile: minimo dei canali con livelli 238→255 stirati a 0→255: lo sfondo vero è bianco pieno (~253-255), la stoffa bruciata è grigia con trama (247-251).
- Visto nel fotogramma 46: il «rosso» (punti tenuti con min≥247) sta sopra la manica alta e sopra la manica bassa: per lo più stoffa bruciata (grigia nei livelli). Tra le due maniche c'è però una fessura stretta di sfondo che `CHIUDI` (=14, chiusura delle fessure < 28 px), `liscio` e le `pieghe` (`PIEGA`=251.5) riempiono. Prova fatta: togliere i punti con `gaussian(mn,1.2) ≥ 252.5` collegati allo sfondo grande → toglie solo bordini, NON basta per la zona A.
- Da fare: trovare la zona A nell'originale (polsino della manica alta / fessura sopra la manica bassa, fotogrammi ~40-60 dove le due mani tengono il menù), misurare i suoi valori (probabilmente sfondo un po' in ombra, sotto 252) e far sì che la fessura scura continui: es. non applicare `CHIUDI`/`pieghe` dove la fessura è collegata allo sfondo tra le braccia, oppure soglia locale. Controllare con l'immagine composta su fondo scuro (come lo screenshot di Mario) e mandare a Mario un prima/dopo. Rifare i video con `python3 tools/anim-invio.py tools/originale-invio.mp4`.

## Fatto in #35 (08/10)
- Avvio ok. La sessione #34 ha aggiunto alle consegne il messaggio: «Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.» → è di RVC: detto a Mario di riferirlo alla sessione RVC 🟣.
- Mario ha guardato l'animazione: «nella giacca … dei pezzi da togliere … fanno parte dello sfondo» + 2 screenshot. Mandata immagine a zone A/B/C; scelta: A.
- Mario: «quando esce all'inizio il mio logo … and corp … la E commerciale riesci a toglierla … lavoro ad hoc proprio come logo … non voglio che il logo sia brutto senza la E» e «vorrei togliere la & su link inviti ecc». Fatte 3 proposte con le lettere originali di CORP (`docs/img/logo-senza-e-scelta.png`, script `tools/logo-ynoy.py`: vA spostato, vB più grande ×1.22 stessa base, vC distanziato). Scelta: **B**.
- Commit: `b75152e` (screenshot e zone), `6f21e9c` (proposte logo).

## Consegne precedenti (#34)
### Ultimo messaggio di Mario (#34), parola per parola
«Devo guardare ancora l'animazione, ancora non ho controllato, ti offro altre due domande. Una, se la versione di prova che invierò adesso non gli chiederà nessuna registrazione né nulla, eh, perché secondo me deve essere proprio così. Eh, cosa numero due, per il, il mio progetto RVC, ehm, mi consigli di, fare un passaggio, di fargli un passaggio di consegna per applicargli quel, quelle regole a quel problema PR? E poi e tante altre cose che hai riscontrato?»

Risposte già date in #34:
1. Versione di prova: NESSUNA registrazione. Il link `…/#demo` apre il benvenuto (`screenDemo`) → un tocco su «Entra nella demo» → dentro come «Ospite» con dati di esempio. Niente arriva al ristorante.
2. RVC: sì, consigliato. Claude ha dato a Mario un testo da incollare nella sessione RVC (RVC accetta regole solo da Mario): handoff con `source_url` + `source_revision`, E15, installare l'app Claude GitHub sull'account GitHub di RVC (altro account: da https://claude.ai/connect-github entrando con quell'account), accettare «Review request» dei permessi, unire PR solo con prove verdi e «unisci la PR N» di Mario.

## Messaggio di Mario arrivato dopo l'apertura di #35 (parola per parola)
«Ricordati che in GitHub RVC ha un altro account, non è quello di Kuro-chan, ma ha la mail eh, jona.ristorante@gmail.com.»
Fatto: l'account GitHub di RVC è quello con la mail jona.ristorante@gmail.com (non Kur0ChanX). L'app Claude GitHub per RVC va installata entrando su GitHub con quell'account. Salvato anche in `docs/DA-FARE.md`? No: è di RVC, va detto alla sessione RVC.

## Fatto in #34 (08/10)
- La sessione #34 è partita SENZA repo (handoff di #33 senza `source_url`). Ricollegato con `add_repo` dopo l'ok di Mario. Mario ha l'account GitHub collegato e ha installato l'app Claude su Kur0ChanX (repo jona-ordini); gli ho chiesto di accettare «Review request» (aggiornamento permessi dell'app) su https://github.com/settings/installations.
- PR #62 (v52) unita con squash (`4e309aa`) dopo prove verdi e «unisci la PR 62» di Mario. Main riunito nel ramo (`2b069db`). Online controllato: `sw.js` = `jona-ordini-v56`. Mandata a Mario l'immagine `docs/img/v52-versione-di-prova.png` con i passi (Staff → in fondo → «Manda la versione di prova»; anche Impostazioni → Database centrale → Invita).
- E15 nel diario errori (`5163811`). `CLAUDE.md`, regola bloccata, punto 3 dell'handoff: nuova sessione sempre con `source_url` + `source_revision` (ok esplicito di Mario, `10d3ddf`).
- Il controllo automatico dei permessi blocca: `add_repo`, unione PR («Merge Without Review»), modifica di `.claude/settings.json` («Self-Modification») e push di `CLAUDE.md` senza un ok scritto di Mario in chat. Correzione «permesso fisso in settings.json» NON fatta (bloccata); non serve: basta «unisci la PR N».
- Account separato per Jona (jona.ristorante@gmail.com): consigliato NO per ora (A: restare così). Più avanti B: organizzazione GitHub gratuita «jona-ristorante» quando si consegna l'app al ristorante. C (account GitHub + Claude nuovi) sconsigliato: secondo abbonamento e trasloco. Mario non ha ancora scelto.

## Fatto in #33 (08/10)
- I 3 video di Mario sono in `docs/video/` (Xiaomi 17 Ultra). v51 online (PR #61, `07b77d5`), controllato: `sw.js` v55 e `media/invio-chef.mp4` uguale al ramo.
- Video 3 (giacca): la trasparenza era piena fino ai bordi del filmato → giacca tagliata dritta. `edges` in `tools/anim-invio.py` ora a ovale squadrato (P=4, dal 70%). v51, PR #61 unita (prove verdi), online controllato. Prima/dopo: `docs/img/v51-animazione-prima-dopo.png`.
- Video 1 (barra in alto con lo swipe): è Android in schermo intero (barre di sistema temporanee, colore scelto da HyperOS, non dall'app). Non correggibile dall'app; alternativa: `display: standalone` (barra sempre visibile col colore dell'app) → Mario ha scelto **A: resta a schermo intero**.
- v52: «Versione di prova» in fondo a Staff → Persone e nel foglio Invita (`demoShare`/`demoCopy`/`demoLink`/`demoText`), prova `tools/test-demo-invito.mjs` (anche nelle veloci di `prova-ci.sh`). Mario: «non vedo l'invito prova da inviare per Consulenti propietari ecc».
- Video 2 (bianco sotto): dura 0,2 s all'apertura, durante la schermata d'avvio di Android (barra di navigazione bianca). È del sistema, non dell'app.

Altro: E12 (limite di 8 sessioni a catena: Claude non può aprire la sessione nuova), E14 (Worker finti delle prove senza `/errori`: corretti `test-firebase-approva-arrivi` e `test-firebase-push`). Ramo remoto `fix-hook-avvio` già unito ma non cancellabile da qui (proxy): Mario può cancellarlo da https://github.com/Kur0ChanX/jona-ordini/branches (non urgente).

## Regole nuove di Mario (già in `CLAUDE.md`)
- DECIDO IO SUL TECNICO: Claude sceglie la strada più sicura e la fa; a Mario si chiede solo ristorante, gusti, soldi, azioni sue, cose irreversibili.
- PUBBLICA SENZA CHIEDERE se le prove sono riuscite; si unisce solo con «Prove automatiche» verde.
- Link sempre interi e cliccabili, ripetuti in un riquadro se vanno copiati.
- Giro completo extra su GitHub solo dopo modifiche al Worker o se le veloci si lasciano sfuggire qualcosa; dirlo in una riga. Jona è pubblico: non tocca i 2000 minuti GitHub (Mario non vuole consumarli; valgono per i repo privati come RVC).
- RVC (altra sessione, 🟣): accetta regole solo da Mario; Mario ha avuto il testo da incollare lì.

## Prossimi passi (vedi `docs/DA-FARE.md`)
- M21: Maurizio approvato? Dargli il ruolo Admin Chef (M2), «Oggi si ordina» (M3), contratto Responsabile (M19).
- M20: provare e mandare il link demo https://jona-ristorante-by-ynoy-corp.pages.dev/#demo
- C7: riga «“Oggi si ordina” arriva a» più chiara, avvisi agenda dal Worker, poi `docs/PIANO-INVERNO.md`.

## Rischi aperti
- Il server locale e l'emulatore del contenitore si spengono quando la sessione si riavvia: riaccenderli prima delle prove (`tools/README.md`).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (E10).
- Titoli: `🟤 ▶ ATTIVA · #31 · Jona Ordini · da v50 · …`.
