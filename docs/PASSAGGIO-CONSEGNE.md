# Passaggio di consegne (2026-10-11, fine sessione #75)

Sessione attuale: #76

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v76** (PR #87 unita con squash `0d3f8b5`, controllato online `APP_VER=76` alle ~2:58). `main` già unito nel ramo di lavoro (`c5e3c44`). Nessuna PR aperta.

## Fatto in #75 (11/10, 1:52-2:59 ora italiana)
- Unita la scorta. Script del Drive risponde **v2** (M38 fatta: tolta da DA-FARE).
- Riordino `Jona/Loghi` FATTO: sottocartelle `JONA`, `YNOY CORP` (Originale, Vettoriale, PNG alta risoluzione, Animazione, LEGGIMI.txt: spostate da «YNOY CORP 3 lune», più l'animazione caricata), `Vecchi` (gli 8 file sparsi + `docs/img/logo/vecchi/*`). La cartella «YNOY CORP 3 lune» è vuota. Il controllo automatico ha negato il cestino (`azione.sh cestina`, «Cloud Storage Mass Delete»): la cestina Mario a mano, ha risposto «nessun problema». Non riprovare il cestino. Link: https://drive.google.com/drive/folders/1ecGLASRvK65nJ2o5yyNprtZT-oVqHStq
- **D31 regola scelta da Mario: strada «Furba»** (doppio tocco confermato). Scritta in CLAUDE.md, «FILE IMPORTANTI ANCHE NEL DRIVE»: i file da tenere vanno da soli in `Claude Code Lavoro/Jona/<tema>`, poi do il link; mai codice, prove, appunti o segreti. Scartate: Ovvia (solo su richiesta), Geniale (caricamento automatico a ogni versione + PDF delle novità). Resta da dirla a RVC, insieme a D28.
- RVC: #60 e #61 sono chiuse. La #61 chiede a Mario di aprire **a mano** la RVC #62 (repo RVC, ramo `claude/rvc-ramo-definitivo`). Per ora nessuna sessione RVC attiva: non ho mandato messaggi.
- **v76 online (D23)**: in «Fattura elettronica XML» si scelgono più file insieme (`PICK.xml.multiple`). Si aprono anche i `.p7m` firmati: `p7mXml` legge la busta CAdES (DER, BER a lunghezza indefinita con pezzi, base64/PEM) e prende l'eContent. `xmlText` usa la codifica scritta nell'XML (UTF-8 o ISO-8859-1). I file rotti si saltano, con avviso e nome del file. Prova nuova `tools/test-p7m.mjs` (14 controlli) con file finti in `tools/fatture-prova` (firmati con openssl, certificato finto, nessuna chiave nel repo); aggiunta a `VELOCI` in `tools/prova-ci.sh`. Prove locali verdi: test-p7m, test-fatture, test-news, test-giro. «prove» su GitHub verde. Aggiunta **M39** (Mario prova con una fattura vera .p7m).
- Scelta tecnica: leggere la busta ASN.1 invece di cercare `<?xml` nel file. Così il testo spezzato in pezzi da 1000 byte (BER) non si rompe. Nessuna libreria esterna.

## Fatto in #74 (11/10, 1:49-2:00 ora italiana)
- Unita la scorta (solo `ULTIMO-MESSAGGIO.md`). Rinominate #74 e #73.
- Script del Drive risponde ancora **v1** (`elenco` → «servono nome e dati»). Aggiunta **M38** in `DA-FARE.md` (guida: Salva → Gestisci deployment → matita → Nuova versione, URL uguale), guida data a Mario.
- Caricati con la v1 (solo carica): `docs/img/logo/jona/png/*` in `Jona/Loghi/JONA/PNG alta risoluzione`, `vettoriale/*` in `Jona/Loghi/JONA/Vettoriale`, `anteprima-jona.png` in `Jona/Loghi/JONA` (https://drive.google.com/drive/folders/1FJjyLznNU9jefut6KIs1jH3rvER62ITJ). La vecchia YNOY con animazione (`ynoy-animazione.svg/.mp4`) era già in `Jona/Loghi` dalla #70: non ricaricata.
- Mario ha scritto «prova link aggiornato»: ancora v1 → handoff alla #75, che legge la variabile nuova all'avvio.

 (11/10, 1:45-1:50 ora italiana)
- Unita la scorta (solo `ULTIMO-MESSAGGIO.md`), push confermato.
- **M37 FATTO da Mario** (messaggio di RVC #60 alle 1:48): Codice.gs v2 incollato, nuovo deployment, vecchio archiviato, link nuovo in `JONA_DRIVE_URL` degli ambienti «Jona Ordini» e «RVC». Tolta M37 da `DA-FARE.md`.
- La #73 vedeva ancora l'URL vecchio (risposta v1): le variabili si leggono solo all'avvio. Per questo handoff subito alla #74, che fa la parte Drive (Prossimi passi 1-2).

## Fatto in #72 (11/10, 1:34-1:45 ora italiana)
- Sessione aperta a mano da Mario (telefono, catena ripartita da 0). Unita la scorta (solo `ULTIMO-MESSAGGIO.md`).
- 🔴 **Segreti nella scorta: CHIUSO.** Controllati tutti i 146 commit con `git show <commit>:docs/ULTIMO-MESSAGGIO.md` (anche le scorte) + `git log --all -m -p`: l'URL vero del Drive NON è mai finito su GitHub; ci sono solo URL finti delle prove (`…SEGRETO…`, `…FINTO…`). Portato da RVC #60 il filtro: `togli_segreti()` in `.claude/hooks/scorta.py` (chiavi private, link script.google, AIza, sk-/pk-/rk-, ghp_/github_pat_, xox, AKIA, key=/token= negli indirizzi, gettoni ≥32 caratteri con lettere+cifre, valori delle variabili d'ambiente con KEY/TOKEN/SECRET/PASSWORD/_URL ≥12 caratteri) + `[AVVIO]` tra gli avvisi saltati. Prova `tools/test-scorta.py`: 22 controlli verdi (3d segreti finti, 3e prompt di avvio). Verificato anche con il vero `JONA_DRIVE_URL` (tolto). E32 in ERRORI.
- **Logo JONA ad alta risoluzione FATTO** (richiesta di Mario 01:19): `tools/logo-jona-alta.py` (da `media/jona.svg`, taglio con margine 6%, colori cambiati su fill del tracciato pieno e `stroke="#000"`) → `docs/img/logo/jona/png/jona-{sfondo-bianco,sfondo-nero,trasparente-nero,trasparente-bianco}.png` (4000×3281), `vettoriale/jona-{nero,bianco}.svg`, `jona-nero.pdf`, `anteprima-jona.png`. Mandati a Mario con SendUserFile. **Non ancora nel Drive** (serve M37).
- **v75 online**: prove «Prove automatiche» verdi (01:20-01:35) → squash → online. Merge di `main` nel ramo di lavoro: conflitti solo negli appunti (E7): consegne e `ULTIMO-MESSAGGIO.md` tenute dal ramo di lavoro, `DA-FARE.md` e `tools/logo-ynoy-corp.py` (percorsi nuovi) da main. In M37 corretto «incollare l'URL in chat» → mai in chat, solo variabile. Tolti 2 doppioni (`docs/img/logo/confronto-logo-app.png`, `docs/img/logo/ynoy-corp-originale-mario.jpg`: identici alle copie in `confronti/` e `ynoy-corp/originale/`). Ora `docs/img/logo/` = `confronti`, `jona`, `vecchi`, `ynoy-corp`.
- Drive: `JONA_DRIVE_URL` c'è in questa sessione, ma lo script risponde ancora **v1** (`elenco` → «servono nome e dati»): M37 non fatta. RVC #60 dice che Mario sta facendo un **nuovo deployment** (vecchio archiviato) → l'URL di questa sessione potrebbe smettere di andare; la #73 lo legge dall'ambiente all'avvio.
- Titolo della sessione rinominato; #71 era già «✓ CHIUSA».

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni RVC
- RVC: #60 `session_01PgR2wPAzKZQDrzHfcJHbUM` e #61 `session_01S3gEsaM9Vb1csRwXBfN2Dg` CHIUSE (11/10). La #62 la apre Mario a mano. Prima: #60 (C33 dettatura Porter). Ha mandato a Jona il codice del filtro segreti. Le ho scritto (#72) di far incollare a Mario **Codice.gs v2** PRIMA del nuovo deployment dello script del Drive (lo script è UNO per Jona e RVC), e che il nuovo URL va in `JONA_DRIVE_URL` di tutti e due gli ambienti.
- Jona #75 `session_01QPzuujHhDE3xqGshobfAn3` (chiusa). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.

## Prossimi passi (in ordine)
1. Attendere Mario. Se dà una fattura .p7m vera (M39): salvarla in `docs/img/listini/` o `tools/fatture-prova/` solo se non ci sono dati sensibili, e aggiungerla alla prova.
2. D30: attesa della scatola nera (righe «Vecchio indirizzo»), poi Transfer (sopra).
3. Quando c'è una sessione RVC attiva (#62): dirle D28 (regola dei rami) e D31 (regola del Drive, `sotto="RVC/…"`).
4. Lavori «Claude da solo» già approvati: D25 (foto della bolla confrontata con l'ordine), D26 (costo dei piatti dalle ricette). Proporre a Mario quale prima.
5. Ponte con l'hotel: quando RVC ha D5, guida per `PONTE_KEY`. Elenco completo in `docs/DA-FARE.md`.

## Note tecniche
- Drive: `JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/<cartella>" file…` (risposta JSON `{ok,link,cartella}`; per avere il link di una cartella si carica un file dentro). `cairosvg` e `potracer` vanno installati con pip a ogni sessione.
- Server locale `python3 -m http.server 8765`; Playwright `/opt/node22/lib/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/commits/<sha>/check-runs`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini (cambierà dopo D30), `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: dopo il Transfer il vecchio GitHub Pages smette di andare; chi ha ancora l'icona vecchia deve reinstallare (per questo l'attesa con la scatola nera).
- Repo privato: le prove su GitHub consumeranno minuti (2000/mese dell'organizzazione).
- URL del Drive: se finisse in un file pubblico, chiunque potrebbe caricare file nella cartella di Mario → in quel caso Mario fa un nuovo deployment e l'URL vecchio si spegne.

## Ultimo messaggio di Mario, parola per parola
«nessun problema andiamo avanti» (11/10, ~2:05, nella #75, risposta sul cestino della cartella vuota). Poi ha scelto con il doppio tocco la regola Drive «Furba (consigliata)».
