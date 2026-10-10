# Passaggio di consegne (2026-10-11, fine sessione #70)

Sessione attuale: #71

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v74** (main `4d6afd5`, PR #85 unita con squash; controllato online `APP_VER=74`). `main` già unito nel ramo di lavoro.

## Fatto in #70 (11/10, 0:25-1:10 ora italiana)
- Unita la scorta (messaggio «ok vado nella 69»).
- **v74 online** (PR #85, D30): la prima corsa delle prove era rossa per un **bug vero**, non per la prova: lo script in `<head>` del vecchio indirizzo leggeva `location.hash` DOPO il controllo (asincrono) del nuovo sito; intanto l'app del vecchio indirizzo toglieva `#i=` dall'indirizzo (riga `history.replaceState(null,'',location.pathname+location.search)`) → l'invito andava perso se il nuovo rispondeva lento. Corretto: `var Q=location.search,H=location.hash` letti subito. La prova `tools/test-vecchio-indirizzo.mjs` ora fa rispondere `manifest.webmanifest` del nuovo con 2 s di ritardo (riprodotto il fallimento senza correzione, verde con correzione). Prove su GitHub verdi → squash → online.
- Merge di `main` nel ramo di lavoro: conflitti solo negli appunti (E7): `DA-FARE.md` presa da main (riga D30 più nuova, nient'altro cambiato), consegne e `ULTIMO-MESSAGGIO.md` tenute dal ramo di lavoro.
- **Drive di Mario (D31) FATTO**: Mario ha creato l'app web di Apps Script (con l'aiuto della #69 chiusa, che mi passava i suoi messaggi con send_message). URL `/exec` provato: `{ok:true}`. **L'URL è segreto: mai nel repo, nei commit, nelle consegne** (controllo: `grep -r "macros/s/" .` non deve trovare l'URL vero). Mario ce l'ha; se serve prima di M35 va richiesto a lui.
  - Scelta di Mario (0:46, nella #69): «la usiamo anche per RVC Dentro facciamo 2 Cartelle una Jona una RVC» → sottocartelle `Jona/…` e `RVC/…`.
  - Cartella principale «Claude Code Lavoro»: https://drive.google.com/drive/folders/16lc3HVlPfb04-UHO3mXxzz9hXhgdSuto
  - `Jona/Loghi` (https://drive.google.com/drive/folders/1ecGLASRvK65nJ2o5yyNprtZT-oVqHStq): 7 file vecchi (ynoy-2000.png, ynoy.png, ynoy.svg, ynoy-animazione.svg/.mp4, jona.svg, jona-maschera-480.png).
  - Lo script del Drive sa solo creare cartelle e sostituire file con lo stesso nome (il vecchio nel cestino); non sposta né cancella. Per riordinare servirebbe una nuova versione di `Codice.gs` + nuovo deployment da Mario.
  - Alla RVC #57 detto (send_message, SENZA URL: il controllo di sicurezza blocca l'invio di chiavi tra sessioni) di usare `sotto="RVC/…"` e che Mario metterà `JONA_DRIVE_URL` anche nell'ambiente RVC.
  - Guida data a Mario per **M35**: barra in alto → nome dell'ambiente → **Edit** → variabili d'ambiente → `JONA_DRIVE_URL=<URL>` → **Save**; in Jona e RVC, poi anche nell'account Hotmail. Non ancora confermato.
- **Logo YNOY CORP con 3 lune** (richiesta di Mario, foto salvata in `docs/img/logo/ynoy-corp-originale-mario.jpg`, 2492×2492): ricalcato a curve con `tools/logo-ynoy-corp.py` (potrace su foto ingrandita ×3 e ammorbidita; differenza dall'originale ~1%, solo bordi; attenzione: potracer ricalca i False, si passa `~m`). Uscite in `docs/img/logo/ynoy-corp/`: `png/` 4000×1783 (sfondo-bianco, sfondo-nero, trasparente-nero, trasparente-bianco — Mario ne aveva chiesti 3, il quarto è in più per fondi scuri), `vettoriale/` (SVG nero, SVG bianco, PDF nero per tipografie). Caricati nel Drive in `Jona/Loghi/YNOY CORP 3 lune/` (https://drive.google.com/drive/folders/1GohEnZevSAN87yU9QbZ4rGPnYHj8-XfE) con sottocartelle «PNG alta risoluzione», «Vettoriale», «Originale» e un `LEGGIMI.txt`. Anteprima mandata a Mario. **Nell'app non è cambiato niente** (resta YNOY con 4 lune, `media/ynoy.svg`).
- Domanda aperta a Mario (M36): mettere il logo con 3 lune anche nell'app? Se sì: nuova versione che sostituisce `media/ynoy.svg` (attenzione: animazione di apertura `tools/ynoy-tratti.py`/`ynoy-html.py` e `tools/logo-ynoy.py` dipendono dal disegno con 4 lune; prima mandare un'immagine prima/dopo, E19).

## D30: Jona fuori dall'account personale (in corso)
- Organizzazione **`Jona-Ristorante-by-YNOY`** creata dall'account del ristorante **`JonaRistorante-Ynoy`** (jona.ristorante@gmail.com, Owner, 2FA attiva); Kur0ChanX Owner; app Claude installata sull'organizzazione (Save fatto, #68/#69).
- Scelta di Mario #69 (strada «Geniale», confermata): **niente repo di rimando** con il suo nick. La v74 (ora online) mostra «Installa di nuovo l'app» a chi apre dal vecchio indirizzo `kur0chanx.github.io/jona-ordini` e lo scrive nella scatola nera (`errLog('Vecchio indirizzo: app aperta da github.io')` con la persona; striscia errori dello sviluppatore, Worker `/errori`).
- **Prossimo**: qualche giorno di attesa guardando la scatola nera. Se nessuna riga «Vecchio indirizzo» → Transfer senza rimando. Se arriva qualcuno → dire a Mario chi, che gli fa reinstallare l'app (guida già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- Passi dopo l'attesa: (1) con Kur0ChanX https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`; (2) repo privato: Settings → **Change visibility** → Private; (3) aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff, `git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`; controllare prove su GitHub (minuti dell'organizzazione) e deploy Cloudflare (segreti del repo vanno col trasferimento). Col repo privato riscrivere la regola «PROVE SU GITHUB» di CLAUDE.md contando i minuti (come `.claude/conta-minuti.py` di RVC).
- Inviti e QR già dati restano validi (stanno su Cloudflare). Nel codice dell'app il nick non c'è.
- M34: 2FA di Kur0ChanX entro il 24/11/2026.

## Sessioni RVC
- RVC attiva: **#57** `session_012rNkxoDxKP4Ky6i1ejLy9t`. Sa del Drive (sotto `RVC/…`), non ha l'URL.
- Jona #69 (`session_012rm19dw5jKyzhu49kU3CtR`) è chiusa ma Mario ci ha scritto fino alle 0:46; le ho detto di rimandarlo alla sessione attiva e inoltrare. Fare lo stesso con la #70 se Mario scrive lì.

## Prossimi passi (in ordine)
1. Attendere le risposte di Mario: M35 (variabile `JONA_DRIVE_URL`) e M36 (logo 3 lune nell'app?).
2. D30: attesa della scatola nera, poi Transfer (sopra).
3. Proporre a Mario la regola «file importanti anche nel Drive» (D31).
4. Ponte con l'hotel: quando RVC ha D5, guida per `PONTE_KEY`. Elenco completo in `docs/DA-FARE.md`.

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
(con la foto del logo YNOY CORP a 3 lune) «adesso fai questo che è simile serve 3 png in alta risoluzione una in bianco una in nero e uno trasparente in vettoriale fatto bene ordina dentro con cartelle» → FATTO (sopra). Ultima mia domanda rimasta aperta: «Vuoi questo logo con 3 lune anche dentro l'app, al posto di quello con 4 lune?»

Prima, nella #69 (0:46): «la usiamo anche per RVC Dentro facciamo 2 Cartelle una Jona una RVC».
