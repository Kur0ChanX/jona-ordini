# Passaggio di consegne (2026-10-11, fine sessione #71)

Sessione attuale: #72

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v74**. **v75 in PR #86** (ramo `claude/jona-v75-logo-ynoy`), non ancora unita.

## Fatto in #71 (11/10, 0:55-1:20 ora italiana)
- Unita la scorta (solo `ULTIMO-MESSAGGIO.md`).
- Mario: «sì» a tutte e due le domande → M36 logo nuovo nell'app; M35 dice di aver messo `JONA_DRIVE_URL`, ma **in #71 la variabile non c'era** (vale solo per sessioni nuove: in #72 controllare con `[ -n "$JONA_DRIVE_URL" ] && echo ok`, senza stampare l'URL).
- Confronto logo app/nuovo (`docs/img/logo/confronti/confronto-logo-app.png`): sono quasi uguali (anche il «vecchio» ha 3 falci + 1 luna piena; cambiano giro dello svolazzo, più piccolo, e posizione di CORP). Mario: «metto quello nuovo ma ordina dentro tutto in cartelle hai fatto un macello» (il macello = Drive `Jona/Loghi` con 7 file vecchi sparsi + la sottocartella; lo script non sapeva spostare).
- **Drive**: `tools/drive/Codice.gs` **v2** (azioni `elenco`, `sposta` file o cartella con `cartella:true`, `cestina`; commit `8f0376c` sul ramo di lavoro) + `tools/drive/azione.sh` (uso nel commento in testa). Guida data a Mario (M37): copiare da https://raw.githubusercontent.com/Kur0ChanX/jona-ordini/claude/jona-ramo-definitivo/tools/drive/Codice.gs → incollare in script.google.com → **Salva progetto** → **Esegui il deployment** → **Gestisci deployment** → matita → **Nuova versione** → **Esegui il deployment** (URL uguale). NON incollarlo in chat (repo pubblico + scorta): solo variabile `JONA_DRIVE_URL`. Non ancora fatto/risposto.
  - Ordine promesso per il Drive `Jona/Loghi`: **YNOY CORP** (PNG alta risoluzione · Vettoriale · Originale · Animazione), **JONA**, **Vecchi**. La cartella «YNOY CORP 3 lune» già esistente va rinominata/spostata in «YNOY CORP» (lo script non rinomina: spostare i file nelle sottocartelle nuove e cestinare quella vuota, o lasciarla se rinominare serve).
- **v75 (PR #86)**: `media/ynoy.svg` = ricalco nero (`docs/img/logo/ynoy-corp/vettoriale/ynoy-corp-nero.svg`) con scala 0.228, traslato (27.15, 11.22) nel 496×190 (allineato al vecchio con ricerca IoU 0.80, poi centrato); `tools/logo-ynoy.py` ora fa solo `media/ynoy.png`; punti di `tools/ynoy-tratti.py` spostati di (+19,−19) e giro dello svolazzo nuovo (pixel scoperti 225 su 48259; prima 73); `tools/ynoy-html.py` → 22 tratti 1,2-2,8 s. APP_VER 75, NEWS v75, CACHE `jona-ordini-v79`. Prove legate verdi in locale: test-logo, test-apertura-v62, test-logo-nitido. Fotogrammi mandati a Mario: `docs/img/logo/confronti/v75-apertura-fotogrammi.png`.
  - Cartelle del repo riordinate (nella PR): `docs/img/logo/ynoy-corp/{png,vettoriale,originale,animazione}`, `jona/jona-maschera-480.png`, `confronti/`, `vecchi/` (con `ynoy-4-lune.svg`, `ynoy-4-lune-2000.png`, `ynoy-4-lune-animazione.mp4` = **il vecchio logo con animazione: per «rimetti la vecchia» basta copiare `vecchi/ynoy-4-lune.svg` in `media/ynoy.svg` e rifare logo-ynoy + tratti con i punti di prima**: i punti vecchi sono nel commit `87eff38` di `tools/ynoy-tratti.py`). Percorsi aggiornati in CLAUDE.md, test-logo-nitido, logo-ynoy-corp.py, ynoy-html.py, logo-ynoy.py. `DA-FARE.md` cambiato nella PR (tolta M35, M36 → M37): attenzione E7 all'unione.
  - Questa sessione era iscritta agli eventi della PR #86: **la #72 deve fare `subscribe_pr_activity` sulla #86**, aspettare «Prove automatiche» verdi, squash, controllo online `APP_VER=75`, poi `git fetch origin main && git merge origin/main` nel ramo di lavoro e push.

## 🔴 PRIMA DI TUTTO in #72: segreti nella scorta
- RVC #59 (send_message 01:18): Mario ha incollato in chat RVC l'URL segreto del Drive e `scorta.py` l'ha mandato su GitHub nel ramo scorta. **Jona è un repo PUBBLICO**: stesso rischio con `docs/ULTIMO-MESSAGGIO.md`. RVC ha aggiunto `togli_segreti()` in `.claude/hooks/scorta.py` (link script.google.com, chiavi AIza/sk-/ghp_/xox/AKIA, chiavi private, key=/token= negli indirizzi, gettoni lunghi, valori delle variabili d'ambiente con KEY/TOKEN/SECRET/PASSWORD/_URL), chiamata in `salva_msg` prima di scrivere; prova in `tools/test-scorta.py` (21 controlli), commit `6caa74c` di RVC. Chiedere il codice alla sessione RVC con send_message (niente add_repo, E31) e portarlo in Jona, con prova. Poi controllare `git log -p origin/scorta/claude/jona-ramo-definitivo | grep -c "macros/s/"` (deve essere 0).
- In #71 ho detto a Mario di NON incollare l'URL in chat, ma di metterlo solo nella variabile `JONA_DRIVE_URL` dell'ambiente (vale per le sessioni nuove). Se Mario fa un nuovo deployment (consigliato da RVC), l'URL nuovo va nella variabile di Jona e di RVC.

## Richiesta nuova di Mario (da fare in #72)
- Logo **JONA** ad alta risoluzione: PNG su bianco, su nero, trasparente + vettoriale (partire da `media/jona.svg`, come `tools/logo-ynoy-corp.py` fa per YNOY: 4000 px, sfondo-bianco, sfondo-nero, trasparente-nero/bianco, SVG nero/bianco, PDF), in `docs/img/logo/jona/{png,vettoriale}`, mandarli a Mario con SendUserFile e caricarli nel Drive in `Jona/Loghi/JONA/…`.
- Salvare nel Drive il **vecchio YNOY con l'animazione** (`Jona/Loghi/Vecchi/`: `ynoy-4-lune.svg`, `ynoy-4-lune-2000.png`, `ynoy-4-lune-animazione.mp4`, e l'SVG animato vecchio `git show 87eff38:docs/img/logo/ynoy-animazione.svg`) se non c'è già (i 7 file vecchi in `Jona/Loghi` sono proprio questi: spostarli in Vecchi). Così se Mario dice «metti la vecchia» si fa subito (vedi sopra).
- Serve l'URL del Drive (variabile o incollato da Mario dopo M37).

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
0. #72: PR #86 (subscribe, verde → squash → online → merge main), poi logo JONA + Drive (sopra).
1. Attendere M37 (script del Drive v2 + URL).
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
(11/10 01:19) «mandami anche il logo jona ad alta risoluzione PNG bianco nero e trasparente e vettoriale salva la vecchia scritta YNOY con l'animazione se non c'è in drive cosi se ti dico metti la vecchia fai subito»

Prima: «1 metto qll nuovo na ordina dentro tutto in cartelle hai fatto un macello». Domanda mia aperta: a che passo è della guida M37 (aggiornare lo script del Drive).
