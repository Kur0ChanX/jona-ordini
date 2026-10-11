# Passaggio di consegne (2026-10-12, fine sessione #91)

Sessione attuale: #92

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente, ANCHE per le PR). Online: **v85**. PR #97 = v86 + v87, prove da far tornare verdi (punto 1).

## ✅ SUBITO (#92)
1. **PR #97 (v86) NON unita**: le prove `prove` sul commit `a4394e9` sono **fallite alle 0:12** (ora italiana, 12/10) con `test-agenda-v59` e `test-richieste-gestite` (tutte le altre verdi). Girate da 23:55 a 0:12, cioè **a cavallo della mezzanotte domenica→lunedì** (cambia giorno E settimana degli orari). Alle 0:13 in locale (TZ Europe/Rome) le due prove passano → quasi certamente prove legate all'ora come E26/E36, non un errore dell'app. DA FARE: (a) scaricare i registri (`registri-prove`, run 38178330071, artifact 11717357408, oppure `mcp__github__get_job_logs` job 114585404981 con più righe e cercare `FAIL`) e capire quale controllo dipende dall'ora/giorno/settimana; (b) correggere la PROVA (non spegnerla) perché regga la mezzanotte, es. fissare la data nella prova o evitare di creare dati «oggi» e controllarli dopo il cambio di giorno; (c) riga E41 in `docs/ERRORI.md`. Dopo il push di #91 la PR #97 contiene anche la v87 (commit `17484e4`): titolo della PR da aggiornare a «v86-v87: app più leggera, apertura pulita», squash con `expectedHeadSha` di 40 caratteri SOLO con `prove` verde sull'ultimo commit, poi `git fetch origin main && git merge origin/main` + push, controllo online `APP_VER=87` su https://jona-ristorante-by-ynoy-corp.pages.dev/ . Ricorda E39: mentre `prove` gira, niente push.
2. **Richiesta nuova di Mario (D40, ultimo messaggio)**: «Fai il colpo che fa tremare un pò lo schermo in modo professionale da app non pacchiano». Cioè rifare la scossa dell'apertura (`@keyframes jShake` riga ~112 di index.html: oggi `12% translate(0,7px) 28% (-4px,-3px) 44% (3px,2px) 62% (-2px,-1px) 80% (1px,0)`, `.intro .splash{animation:jShake .5s .55s linear both}`) in modo più fine, stile app professionale (pensa all'«impatto» di iOS/haptic): un solo colpo verticale breve e smorzato (es. 3-4 px giù, rimbalzo 1 px, ~300-350 ms, curva morbida `cubic-bezier`), niente zig-zag a destra/sinistra; magari un leggero `scale(.995)` invece di spostare tutto, o la scossa solo sul contenuto (`.jhit`/logo + onde) e non sullo sfondo. Vibrazione del telefono `navigator.vibrate(12)` al colpo SOLO se l'app la usa già altrove (controllare; se no proporla, non aggiungerla senza dirlo). Prima di costruire: GIF/immagine o video breve di confronto (2-3 varianti: «Ovvia» colpo verticale smorzato, «Furba» micro-zoom, «Geniale» colpo + vibrazione leggera + onde) con `tools/colpo-varianti.mjs` (esiste già, fu usato per la v62) e scelta di Mario a parole (E38). Il taglio `html.on-splash #app{overflow:clip}` della v87 resta comunque. Aggiornare `tools/test-apertura-v62.mjs` (controlla `shake:true` a 640 ms e la pagina che non scorre).
3. **v87 (già fatta in #91, prove legate e `test-giro` verdi)**: commit `17484e4` «niente barre di scorrimento nell'apertura (D38), «Più venduti» allineati», ora dentro la PR #97 (punto 1). D40 va dopo, come v88, se la PR #97 è già partita con le prove (E39). `CACHE` già `jona-ordini-v91`; se si aggiunge D40 aggiornare solo la voce NEWS v87 (non cambiare numero).
4. **D39 disegni degli ingredienti del Bar**: immagine con 3 stili mandata a Mario (`docs/img/sessione-91/d39-stili.png`, sorgente `tools/d39-stili.html` con i 6 disegni SVG riusabili). Domanda nel testo: A matita colorata, **B inchiostro e acquerello (consigliato)**, C linea unica. Aspettare la sua risposta, poi costruire solo lo stile scelto (vedi riga D39 in `docs/DA-FARE.md`).

## Fatto in #91 (12/10, 23:55-0:10 ora italiana)
- **D38 risolta (v87, non ancora online)**: il «bordo bianco» della foto di Mario erano le **barre di scorrimento di Android** (striscia grigia (93,89,86) larga 12 px fisici ≈ 4,6 dp a destra dal bordo superiore al fondo e in basso). Causa: `jShake` trasla la `.splash` di 1-6 px tra 560 e 980 ms → la pagina diventa scorrevole (misurato: `scrollHeight-clientHeight` fino a 6 px, `scrollWidth` fino a 2 px) → Android mostra le barre sottili. Prima ipotesi scartata: il fondo `html.on-wall` (cocoa liscio) scoperto dalla traslazione (misurato: stesso colore, non è quello). Correzione: in `render()` `document.documentElement.classList.toggle('on-splash',!!S.splash)` e CSS `html.on-splash #app{overflow:hidden;overflow:clip}` (solo durante l'apertura, così l'ingresso con i profili scorre normale). Prova nuova in `tools/test-apertura-v62.mjs`: in nessun istante 0-3800 ms la pagina scorre + `on-splash` tolta dopo (fallisce col codice vecchio: verificato). 34 controlli verdi.
- **«Più venduti» della Cantina** (rifinitura #90): `<li><b>${n}</b>${vnTit(v)}</li>` + `.vn-top b{float:right;margin-left:12px}`; `tools/test-cantina.mjs` riga 111 aggiornata (controlla nome, `<b>`=2 e `float:right`). Verde.
- v87: `APP_VER=87`, `CACHE` `jona-ordini-v91`, voce NEWS v87 «Apertura pulita» (data 2026-10-12), riga v87 in CLAUDE.md. Prove: test-apertura-v62, test-cantina, test-news, test-giro tutte verdi.
- **D39 salvata** in `docs/DA-FARE.md` (messaggio di Mario arrivato dalla #90 dopo il suo handoff, con la valutazione già data da #90: niente PNG da internet, SVG nostri ~1 KB, ~40 ingredienti più usati, carta solo CSS). Immagine dei 3 stili fatta e mandata.
- `docs/ULTIMO-MESSAGGIO.md` aggiornato a mano col messaggio di Mario della #90 (la scorta salta i messaggi tra sessioni).
- Push: per tutta la #91 NON ho fatto push mentre `prove` girava sulla PR #97 (E39); il lavoro era nella scorta.

## Domanda aperta a Mario (scritta nel testo in #87, ancora senza risposta)
«Oggi come registrate i vini venduti? Scontrino di cassa (con quale programma?), comanda su carta, oppure niente?» → serve per collegare le vendite (es. foto della chiusura di cassa letta dall'IA). Fino alla risposta resta «− Venduta».

## Prossimi lavori (in ordine, da soli, pubblicare in automatico se le prove sono verdi)
1. PR #97 e v87 + D40 (sopra), D39 dopo la scelta di Mario.
2. D33 (funzioni smart per orari e agenda): proposta con immagine + 3 strade (sotto). È una scelta di Mario: domanda nel testo (E38).
3. Idee per il Bar (da proporre solo se utili): «Cocktail della casa» (ricette del bartender), costo del cocktail dal prezzo delle bottiglie (come le ricette), foto della bottiglia letta dall'IA per aggiungerla.
4. `tools/misura-velocita.mjs` nelle prove di GitHub? Decidere dopo qualche misura (i tempi su GitHub cambiano).

## D33 — funzioni smart per orari e agenda (chiesto da Mario, ancora da proporre)
Controllato che NON esistono già: richieste di indisponibilità/ferie dallo staff; promemoria del turno (sera prima / 1 ora prima); turni proposti in automatico dai coperti dell'agenda; costo del personale della settimana. Esistono già: «Copia settimana prima», turni tipo, assenze (R/F/M/P), cambi turno, timbratura QR, «In turno oggi», agenda con ripetizioni e appunti, coperti in ordine suggerito.
Idee: Ovvia = promemoria del turno via push; Furba = lo staff segna i giorni in cui non può + il pianificatore li mostra; Geniale = «Proponi la settimana» (bozza automatica da coperti dell'agenda, contratti, indisponibilità e settimana prima; il gestore corregge e pubblica).

## D30: Jona fuori dall'account personale (in attesa)
- Organizzazione **`Jona-Ristorante-by-YNOY`** (account del ristorante `JonaRistorante-Ynoy`, Owner, 2FA; Kur0ChanX Owner; app Claude installata). Scelta di Mario #69: niente repo di rimando. La v74 mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo e lo scrive nella scatola nera («Vecchio indirizzo: app aperta da github.io»).
- **Prossimo**: qualche giorno guardando la scatola nera. Nessuna riga «Vecchio indirizzo» → Transfer. Se arriva qualcuno → dire a Mario chi, che reinstalla l'app.
- Passi dopo l'attesa: (1) https://github.com/Kur0ChanX/jona-ordini/settings → **Transfer** → `Jona-Ristorante-by-YNOY`; (2) Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub e deploy Cloudflare. Col repo privato riscrivere la regola «PROVE SU GITHUB» contando i minuti.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni
- Jona #91 `session_01DWN2LgoPJUedg9xmjS3opj` (chiusa), #90 `session_01MAqfbJ8neGEZiNgRVBCjCA`, #89 `session_01Y1ek4ZACQwmsRsQn8vWqyn`, #88 `session_0199ANgsgVouZX79Xd7QJFZX`, #87 `session_01FbQSi6stujDtWxnvcAYerS` (chiuse). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.
- RVC attiva: **#78** `session_012GgQqbq9gDXPmHyQ7VmYMV`. SPA attiva: **#09** `session_011dYniwuL2fEfLGEsTVRWrp` (nomi da ricontrollare con `list_sessions` prima di mandare messaggi).
- Ponte con l'hotel: RVC dice che **D5 non è fatto**. M42 5stelle: si aspettano le risposte della reception (in RVC).

## Note tecniche
- Foto per Mario (script persi con lo scratchpad, si rifanno in 2 minuti): Playwright `createRequire('/opt/node22/lib/node_modules/')`, `deviceScaleFactor:2`: `/#demo` → `[data-a="demoGo"]` → `nav [data-a="tab"][data-v="fornitori"]` → `main [data-a="brOpen"]` / `main [data-a="vnOpen"]`; schede Cantina `.sheet [data-a="vnV"]`, Bar `[data-a="brV"][data-v="inv"]`; riga Negroni = `getByText('Gin · Campari · Vermouth rosso')`. Tema scuro: `document.documentElement.dataset.theme='dark'`.
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…`.
- Server locale `python3 -m http.server 8765`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona` (java c'è).
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini, `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare (per questo l'attesa con la scatola nera).
- URL del Drive: se finisse in un file pubblico, Mario fa un nuovo deployment.

## E38 (aperto)
Risposte a tocco arrivate senza che Mario toccasse (#85). Finché non è chiaro: domande scritte nel testo, risposta a parole.

## Ultimo messaggio di Mario, parola per parola
«Fai il colpo che fa tremare un pò lo schermo in modo professionale da app non pacchiano»
(12/10/2026 ~0:10 ora italiana, in #91, dopo la mia risposta sul bordo dell'apertura e l'immagine D39).

Prima (in #90 dopo il suo handoff, girato alla #91): «quanti agenti hai in aiuto? che dicie se aggiungiamo agli ingredienti un Png per ogni ingrediente oreso da internet tutti innerenti tranloro come grafica o disegno sarebbe bello in stole disegno ogni ingrediente e lo sfondo è un effetto foglio pagina come se ha disegnato su un foglio riesci a trovare un Png per ogni ingrediente? senza appesantire app che dici valuta e rinnomina la sessione e Rispondimi quanti agenti lavoro in questo progetto ora? vai avanti da solo leggi tutte le mie richieste e fermatinsolo per scelte importanti» (già risposto da #90; D39).
Regola sempre valida: «Vai avanti da solo chiedimi solo scelte importanti».
