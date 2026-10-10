# Passaggio di consegne (2026-10-11, fine sessione #73)

Sessione attuale: #74

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v75** (PR #86 unita con squash `aed77cc`, controllato online `APP_VER=75`). `main` già unito nel ramo di lavoro. Nessuna PR aperta.

## Fatto in #73 (11/10, 1:45-1:50 ora italiana)
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
- RVC attiva: **#60** `session_01PgR2wPAzKZQDrzHfcJHbUM` (prossimo: C33 dettatura Porter). Ha mandato a Jona il codice del filtro segreti. Le ho scritto (#72) di far incollare a Mario **Codice.gs v2** PRIMA del nuovo deployment dello script del Drive (lo script è UNO per Jona e RVC), e che il nuovo URL va in `JONA_DRIVE_URL` di tutti e due gli ambienti.
- Jona #71 `session_01MKFn44AvJMKQKuSQyqcqvW` (chiusa). Se Mario scrive in una sessione chiusa, rimandarlo alla attiva.

## Prossimi passi (in ordine)
1. M37 è fatto: controllare che lo script risponda v2 con il nuovo URL. Se risponde ancora v1 o «Page Not Found», dirlo a Mario (variabile non aggiornata nell'ambiente). Prima era: attendere M37: Mario aggiorna lo script del Drive a v2 (forse insieme al nuovo deployment guidato da RVC #60). Controllo: `bash tools/drive/azione.sh elenco "Jona/Loghi"` → se risponde `{"ok":false,"errore":"servono nome e dati"}` è ancora v1. Se l'URL è cambiato serve la variabile nuova: le variabili d'ambiente si leggono solo all'avvio della sessione (`[ -n "$JONA_DRIVE_URL" ]`, mai stampare l'URL).
2. Con lo script v2: caricare `docs/img/logo/jona/{png,vettoriale}` in `Jona/Loghi/JONA/…`, i file di `docs/img/logo/vecchi/` (+ `git show 87eff38:docs/img/logo/ynoy-animazione.svg`) in `Jona/Loghi/Vecchi`, YNOY CORP in `Jona/Loghi/YNOY CORP/{PNG alta risoluzione,Vettoriale,Originale,Animazione}`; spostare i 7 file vecchi sparsi in `Jona/Loghi` dentro `Vecchi` (prima `elenco`, poi `sposta`), cestinare la cartella «YNOY CORP 3 lune» solo se vuota. Poi mandare a Mario il link della cartella.
3. D30: attesa della scatola nera, poi Transfer (sopra).
4. Proporre a Mario la regola «file importanti anche nel Drive» (D31).
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
Nella #73 Mario ha scritto solo il prompt di avvio: «git fetch origin claude/jona-ramo-definitivo && git merge --ff-only origin/claude/jona-ramo-definitivo (se «HEAD detached», prima git checkout claude/jona-ramo-definitivo). Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md (sessione #73). Poi attendi le istruzioni di Mario.» (mandato dalla #72).

Ultima richiesta vera (11/10 01:19, nella #71): «mandami anche il logo jona ad alta risoluzione PNG bianco nero e trasparente e vettoriale salva la vecchia scritta YNOY con l'animazione se non c'è in drive cosi se ti dico metti la vecchia fai subito» → logo fatto e mandato; la parte Drive la fa la #74.
