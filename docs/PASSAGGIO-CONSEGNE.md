# Passaggio di consegne (2026-10-11, fine sessione #69)

Sessione attuale: #70

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v73** (main `57628f4`). **v74 in PR #85** (ramo `claude/jona-v74-vecchio-indirizzo`), CACHE `jona-ordini-v78`.

## Fatto in #69 (11/10 0:05-0:35 ora italiana)
- Unita la scorta (messaggio delle 23:59). La #68 ha scritto (send_message): Mario ha fatto **Save** sull'installazione dell'app Claude in `Jona-Ristorante-by-YNOY` → passo «app Claude» FATTO.
- Controllato: nel codice dell'app il nick Kur0ChanX non c'è. App `jona-ristorante-by-ynoy-corp.pages.dev`, inviti e QR `invito.jona-ristorante-by-ynoy-corp.workers.dev/<codice>`, notifiche `jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev`. Il nick resta solo nel vecchio indirizzo `kur0chanx.github.io/jona-ordini` (icone installate prima della v37). Detto a Mario: inviti e QR già dati restano validi, il trasloco non li tocca (stanno su Cloudflare).
- **Scelta di Mario (a tocco, confermata): strada «Geniale»** per il vecchio indirizzo: niente repo di rimando col nick. **v74**: lo script in `<head>` passa da github.io a pages.dev con `?da=gh` (parametri e `#` tenuti); `OLD_URL` (sessionStorage `jona_da_gh`, toglie `da=gh` dall'indirizzo) → avviso `oldUrl()` «Installa di nuovo l'app» (classe `.old-url`, pulsante «Apri il nuovo» `target=_blank`) + `errLog('Vecchio indirizzo: app aperta da github.io')` con la persona (scatola nera, striscia errori dello sviluppatore). Niente in demo. NEWS v74, `APP_VER` 74. Prova `tools/test-vecchio-indirizzo.mjs` (nelle veloci di `prova-ci.sh`). `test-giro`, `test-news` verdi in locale.
  - PR #85: prima corsa rossa SOLO per la prova nuova (su GitHub il primo `framenavigated` non aveva il `#`); corretto leggendo `location.href` con `addInitScript` (commit pushato 0:33, `TZ=Europe/Rome` verde in locale). **Da fare nella #70**: `subscribe_pr_activity` su #85, aspettare «Prove automatiche» verde → squash → controllo online (`/index.html` con `APP_VER=74`) → `git fetch origin main && git merge origin/main` nel ramo di lavoro → push. Se rossa: capire e correggere.
  - Piano D30 dopo la v74: qualche giorno di attesa guardando la scatola nera (righe «Vecchio indirizzo»); se nessuno arriva → Transfer senza rimando; se qualcuno arriva → dire a Mario chi, che gli fa reinstallare l'app (guida Android/iPhone già data: «Apri il nuovo» → Chrome ⋮ **Installa app** / Safari **Condividi** → **Aggiungi alla schermata Home**, poi togliere la vecchia icona; su iPhone potrebbe chiedere di rientrare: tenere pronto QR o invito).
- **Richiesta nuova di Mario: cartella con i suoi file** («se mi perdo qualcosa in chat… ho perso la foto png del logo YNOY e il vettoriale»). Mandati subito con SendUserFile `docs/img/logo/ynoy-2000.png` e `media/ynoy.svg`. Proposte 3 strade (Ovvia GitHub, Furba pagina privata claude.ai consigliata, Geniale Drive); **Mario ha scelto: il suo Drive `mario.miscera@gmail.com`, cartella «Claude Code Lavoro»** (confermato).
  - Nessun connettore Drive in questa sessione (i connettori si leggono all'avvio; il connettore di claude.ai non garantisce il caricamento di PNG). Scelta tecnica: **Google Apps Script** come app web nel Drive di Mario. Codice in `tools/drive/Codice.gs` (crea la cartella se manca, sottocartelle con `sotto`, sostituisce un file con lo stesso nome mettendo il vecchio nel cestino), caricatore `tools/drive/carica.sh` (`JONA_DRIVE_URL=… bash tools/drive/carica.sh "Jona/Loghi" file…`; `curl -L`; `script.google.com` raggiungibile dal contenitore).
  - **Guida data a Mario (12 passi)**: https://script.google.com/home → **Nuovo progetto** → incolla codice → salva → **Esegui il deployment** → **Nuovo deployment** → ⚙ **App web** → Esegui come **Io**, accesso **Chiunque** → autorizza (Avanzate → Vai a … non sicuro → Consenti) → copia l'**URL** e incollalo in chat. Attendo l'URL.
  - L'URL vale come una chiave e il repo è pubblico: `.claude/hooks/scorta.py` ora sostituisce `https://script.google(usercontent).com/…` con «[indirizzo di Google Drive nascosto]» in `ULTIMO-MESSAGGIO.md` (prova in `tools/test-scorta.py`, 18 controlli ok). **Mai scrivere l'URL in file del repo, consegne o commit.** Quando arriva: provarlo (`curl -sL "$URL"` → `{ok:true,cartella:…}`), caricare i loghi YNOY e JONA (`media/ynoy.png`, `media/ynoy.svg`, `docs/img/logo/ynoy-2000.png`, `media/jona.svg`) in «Jona/Loghi», mandare a Mario il link della cartella. Per le sessioni future: Mario deve mettere `JONA_DRIVE_URL` nelle variabili dell'ambiente (leggere `read_documentation` `environment.secrets` e dargli link e passi; in tutti e due gli account, Jona e RVC), altrimenti l'URL va passato a mano ogni sessione. Da proporre poi: caricare in Drive anche i file importanti futuri (foto con errori/dati, documenti) come regola.

## Fatto in #68 (10/10 23:00 - 11/10 0:05 ora italiana)
- Unite le scorte e le consegne aggiornate dalla #67 (Mario scriveva ancora lì; detto alla #67 di mandarlo qui). Giro completo `38084513591` dopo la v73: **verde** (controllato).
- D30: passo C fatto (Kur0ChanX ha fatto «join»); **Kur0ChanX ora Owner** dell'organizzazione (foto 0:01 «Made Kur0ChanX an owner»). Account del ristorante = **`JonaRistorante-Ynoy`** (Owner, 2FA attiva); Kur0ChanX 2FA ancora in attesa (M34).
- Passo «app Claude sull'organizzazione»: Mario è sulla pagina «Install Claude» con due scelte (JonaRistorante-Ynoy e Jona-Ristorante-by-YNOY). Detto: è normale, toccare **Jona-Ristorante-by-YNOY** → **All repositories** → **Install**. Attendo conferma.
- Regola nuova (Mario, scelta a tocco confermata): le foto dei semplici passi non si salvano più, solo quelle con errori, scelte, dati del ristorante o file (CLAUDE.md, «SOLO IN CLAUDE CODE»). Mario aveva chiesto «perché ri salvi i miei screenshot?»: spiegato E4.
- Controllato prima del trasloco: deploy Cloudflare (Pages e Worker) va con i segreti del repo (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, ecc.), che si trasferiscono col repo. Il vecchio GitHub Pages `kur0chanx.github.io/jona-ordini` è ancora attivo (200, `has_pages` true) e col trasloco smette di andare (GitHub non rimanda le Pages).
- **Richiesta di Mario (0:03)**: «non voglio vedere il mio nick Kur0ChanX nei link dei miei colleghi». Da decidere nella #69: il repo-pagina di rimando `Kur0ChanX/jona-ordini` (passo 4 sotto) terrebbe vivo un link col suo nick. Inviti e QR usano già pages.dev / Worker invito (controllare con grep che nell'app non resti nessun `github.io` visibile). Proposta da fare a Mario: niente repo di rimando, se nessun telefono usa più il vecchio indirizzo (dal v37 lo script in `<head>` porta tutti a pages.dev; un'app installata dal vecchio indirizzo però aprirebbe github.io → senza rimando non parte). Verificare se in Firestore/membri c'è modo di capire da dove aprono (es. `errLog` o `location` nelle push) prima di chiedere.

## Fatto in #67 (19:18-23:10 ora italiana)
- **Ponte con l'hotel (D17)**: immagine delle 3 idee unite (`docs/img/ponte/d17-unita.png`, sorgente `.html` accanto) → Mario «Sì». Chi vede «Oggi in hotel»: **tutti**; Mario: «anche i nomi se clicchi non sono un problema»; poi in RVC #56 Mario ha scelto **nome + cognome** al tocco.
  - Accordo con RVC: nomi dei campi di RVC adottati; tutto in `docs/PONTE-RVC.md` (copia del `docs/PONTE-JONA.md` di RVC + §7 parte di Jona con «Dati esatti di Jona»). RVC ha accettato: `oggi` anche per domani, `rif`, `nome`, evento `ev_<id agenda>` + `annullato`, ponte dentro il Worker di Jona. La chiave `PONTE_KEY` sta solo nel server di RVC (D5 di RVC, non ancora fatto): prima di D5 il collegamento vero non parte.
  - `oggi`: `dati.giorni: [{g, camere, ospiti, arrivi, partenze, elenco?: [{camera, nome, cognome, persone, arrivo, partenza}]}]`.
- **v72 online** (PR #83): campi a 16 px (niente zoom su iPhone; `.inp.sm`, `.inp.mono`, `select.v-alt`, `.unit-inp`), prova `tools/test-campi-16.mjs`, `test-giro` controlla anche i campi; giro con WebKit (`test-giro-safari`, solo su GitHub, `prove.yml` installa webkit) e computer 1280/1440 (`test-giro-computer`). Barra di stato iPhone lasciata com'è (D29 resta solo quella, serve foto da iPhone).
- **v73 online** (PR #84): Worker `/ponte/messaggi` (+ `/stato`, tabella `ponte` nel primo D1, segreto `PONTE_KEY` dal segreto GitHub omonimo nel workflow `cloudflare-worker.yml`); app: funzione «Hotel» (Impostazioni → Funzioni, spenta), icona con pallino, pagina «Hotel» (`htSheet`), moduli (`htForm`), striscia vassoio (`htStrip`), agenda → «Mando l'evento all'hotel?» (`htAgenda`/`htAgDel`), ordine suggerito (`htSugH`), hotel finto (`htSim`, funzione dichiarata così le prove la sostituiscono). Prove `tools/test-hotel.mjs` (41, anche col Worker vero dietro l'app e coda senza rete) e `tools/test-ponte-server.mjs` (28), nelle prove veloci.
- Correzione della scorta presa da RVC (E28): non salva più gli avvisi automatici come messaggio di Mario.
- **Giro completo su GitHub** lanciato a mano dopo la v73 (tocca il Worker): run `38084513591`, finito **VERDE** (controllato dalla #67 dopo l'handoff, 23:12). Niente da fare (`curl https://api.github.com/repos/Kur0ChanX/jona-ordini/actions/runs/38084513591`); se rosso, capire e correggere con priorità.
- **Domande**: E29 (niente strumento a tocco) sostituita dal **doppio tocco** di RVC, poi migliorato da Mario: la seconda domanda RIPETE la domanda e ha 3 scelte «Sì, confermo <la cosa>» · «È una domanda o un dubbio» · «No, ho sbagliato» (CLAUDE.md). E30: due risposte scritte a mano che erano domande, prese per scelte: se Mario scrive a mano una domanda o «roba così», prima si risponde e poi si rifà la domanda.

## GitHub: Jona fuori dall'account personale (D30, in corso)
- Mario: Kur0ChanX è il suo account personale; «mi sembra assurdo… usare un mio account per un'app dell'hotel». Vuole un account con **jona.ristorante@gmail.com**.
- Spiegato: limiti di GitHub per proprietario (le organizzazioni hanno i loro); repo pubblici = prove gratis senza limite; privati = 2000 minuti/mese del proprietario (~14 min per giro veloce). Repo pubblico oggi: contiene 8 foto di fatture dei fornitori (`docs/img/listini/`) e nomi dello staff, visibili anche nella cronologia (non si cancellano senza comandi forzati).
- **Scelte di Mario (toccate e confermate)**: **organizzazione privata**, creata dall'account del ristorante, Kur0ChanX secondo proprietario; nome **`Jona-Ristorante-by-YNOY`**.
- Risposte già date: il link dell'app NON cambia (pages.dev), inviti/QR/telefoni non cambiano, lo staff non deve fare niente; si **trasferisce** il repo (segreti, prove e cronologia vanno con lui).
- **Guida data a Mario (parti A-C)**: A account con jona.ristorante@gmail.com (https://github.com/signup, in incognito); B organizzazione `Jona-Ristorante-by-YNOY` da https://github.com/account/organizations/new?plan=free (Contact email jona.ristorante@gmail.com, «My personal account», invito a Kur0ChanX, Complete setup); C con Kur0ChanX accettare su https://github.com/orgs/Jona-Ristorante-by-YNOY/invitation. Detto di NON toccare Transfer né Change visibility. **Aggiornamento 23:43 (Mario ha scritto nella #67 chiusa, con foto `docs/img/sessione-67/organizzazione-creata-2343.jpg`)**: account del ristorante e organizzazione `Jona-Ristorante-by-YNOY` CREATI (passi A e B fatti), «You've invited 1 member» (Kur0ChanX). Detto a Mario di fare il passo C (accettare l'invito con Kur0ChanX) e continuare nella #68. **Poi Mario (#67, 23:5x): «ho fatto join» → passo C fatto.** Prossimo: Kur0ChanX Owner, poi Transfer. Avviso GitHub: 2FA obbligatoria entro 24/11/2026 (M34).
- **Stato all'11/10 0:05**: passo C fatto, passo 1 (Owner) fatto, app Claude in installazione.
- **Passi rimasti (uno per volta)**:
  1. ~~Kur0ChanX Owner~~ FATTO.
  1b. App Claude sull'organizzazione (in corso, vedi sopra). Dopo: in questa sessione `add_repo` funzionerà solo dopo il trasloco.
  2. Con Kur0ChanX: https://github.com/Kur0ChanX/jona-ordini/settings → in fondo **Transfer** → `Jona-Ristorante-by-YNOY`.
  3. Installare l'app Claude sull'organizzazione: https://github.com/apps/claude/installations/select_target.
  4. Claude crea un piccolo repo pubblico `Kur0ChanX/jona-ordini` con solo la pagina che rimanda a pages.dev (il vecchio indirizzo `kur0chanx.github.io/jona-ordini` è ancora attivo e rimanda al nuovo; non deve rompersi). Serve che Mario lo crei a mano o dia accesso: verificare.
  5. Repo privato: Settings → **Change visibility** → Private.
  6. Aggiornare `source_url` in CLAUDE.md, consegne, `docs/CAMBIO-ACCOUNT.md`, prompt dell'handoff; remote git (`git remote set-url origin https://github.com/Jona-Ristorante-by-YNOY/jona-ordini`); controllare che le prove su GitHub partano (minuti dell'organizzazione) e che il deploy Cloudflare funzioni.
  - Regola «PROVE SU GITHUB» di CLAUDE.md (repo pubblico = minuti illimitati) va riscritta dopo il passaggio a privato: contare i minuti come in RVC (`.claude/conta-minuti.py` di RVC).

## File ricevuti da Mario in #67
- `docs/img/sessione-67/doppio-tocco-domanda-presa-per-scelta.jpg` (E30)
- `docs/img/sessione-67/riassunto-app-sembra-decisione.jpg` (il riassunto automatico dell'app «Confermo l'impostazione…» sembrava una decisione: non lo era)

## Sessioni RVC
- RVC attiva: **#57** `session_012rNkxoDxKP4Ky6i1ejLy9t` (aspetta il «via» di Mario). Le #55 e #56 sono chiuse. RVC sta costruendo C18 (linguetta «🍽️ Ristorante») e corregge un falso ok del ponte («Salvato · in attesa di Jona»).
- Detto a RVC #57 (send_message, 23:10): doppio tocco migliorato da Mario ed E31 (niente add_repo incrociati).

## Prossimi passi (in ordine)
1. PR #85 (v74): iscriversi, verde → squash → online → merge di `main` nel ramo di lavoro (prima di toccare `docs/DA-FARE.md`, già cambiato nella PR: E7).
2. Drive: attendere l'URL di Mario, provarlo, caricare i loghi, link della cartella a Mario, poi `JONA_DRIVE_URL` nell'ambiente. Aggiungere in `docs/DA-FARE.md` (DOPO il merge di main) la voce **D31** Drive di Mario.
3. D30: attesa della scatola nera, poi Transfer e il resto (sezione D30 sotto; il passo «repo di rimando» è tolto).
4. Ponte: quando RVC ha D5, guida per `PONTE_KEY`. Elenco completo in `docs/DA-FARE.md`.

## Note tecniche
- Server locale `python3 -m http.server 8765`; Playwright `/opt/node22/lib/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium`; emulatore `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`.
- Esito prove: `curl https://api.github.com/repos/Kur0ChanX/jona-ordini/actions/runs?head_sha=<sha>`; log con `mcp__github__get_job_logs`.
- Handoff: `create_session` con `environment_id` `env_01PHQTdrmzBJ65UoCn8yQSqE`, `source_url` https://github.com/Kur0ChanX/jona-ordini (cambierà dopo D30), `source_revision` `claude/jona-ramo-definitivo`.
- Routine «Punto ogni 5 ore» `trig_015ZoD3SEjtWzeDDyZhCCJ2K` attiva.

## Rischi aperti
- Ponte: funziona davvero solo quando RVC avrà il suo server (D5) e `PONTE_KEY`.
- D30: il trasferimento cambia l'indirizzo del repo; il vecchio GitHub Pages va tenuto vivo con il repo-pagina di rimando, altrimenti i telefoni installati dal vecchio indirizzo si rompono.
- Repo privato: le prove su GitHub consumano minuti (2000/mese dell'organizzazione).

## Ultimo messaggio di Mario, parola per parola
«Ma se mi perdo qlkosa in chat è possibile creare una cartella e mi mandi il link dove posso trovare i file esempio ho perso la foto png del logo YNOY e il vettoriale di YNOY» → risposta a tocco: «Facciamo il mio drive  mario.miscera@gmail.com e cartella Claude Code Lavoro» (confermata). Poi ha ricevuto la guida dei 12 passi: aspettare il suo URL.

Messaggi prima in #69: «come gli faccio reinstallare l'app?» · «quindi avrenno il nuovo link senza Kur0ChanX?» · «quindi anche i qr code ed inviti sono nuovi?»
