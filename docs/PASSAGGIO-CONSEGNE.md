# Passaggio di consegne (2026-10-10, fine sessione #67)

Sessione attuale: #68

Ramo di lavoro: **`claude/jona-ramo-definitivo`** (unico e permanente). App online: **v73** (main `57628f4`, PR #84). CACHE `jona-ordini-v77`. Worker aggiornato (`/salute` → `ponte:false`, cioè manca ancora `PONTE_KEY`: giusto così).

## Perché l'handoff ora
Gli hook di Jona (handoff-check, scorta, avvio-check) erano spenti in silenzio dalle 19:40 circa: con `add_repo` del repo RVC la cartella principale della sessione è diventata /home/user (E31). Il contesto era arrivato a ~470k token. **Non aggiungere altri repo alle sessioni Jona**: i file di RVC si chiedono alla sessione RVC con send_message.

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
- **Guida data a Mario (parti A-C)**: A account con jona.ristorante@gmail.com (https://github.com/signup, in incognito); B organizzazione `Jona-Ristorante-by-YNOY` da https://github.com/account/organizations/new?plan=free (Contact email jona.ristorante@gmail.com, «My personal account», invito a Kur0ChanX, Complete setup); C con Kur0ChanX accettare su https://github.com/orgs/Jona-Ristorante-by-YNOY/invitation. Detto di NON toccare Transfer né Change visibility. Attendo «fatto» e il passo a cui è arrivato.
- **Dopo «fatto» (passi da dare, uno per volta)**:
  1. Rendere Kur0ChanX **Owner** dell'organizzazione (People → ruolo Owner, dall'account del ristorante) se l'invito era da Member.
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
1. D30 GitHub: aspettare «fatto» di Mario, poi i passi sopra, uno per volta, con link.
2. Ponte: quando RVC ha D5, guida a Mario per il segreto `PONTE_KEY` (uguale in GitHub di Jona e nel server di RVC); poi notifiche push per i messaggi dell'hotel e foto dei guasti (D17 in `docs/DA-FARE.md`).
3. Elenco completo in `docs/DA-FARE.md` (M33 logo JONA da guardare, M31 logo YNOY senza risposta, prove v69/v70).

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
«2 cose quando mi fai la domanda touch 2 tocchi si può fare che se scrivo non mi metti si confermo ma un altra cosa perché è fraintendibile come è successo prima, poi nel si conferma nelle risposte impostate puoi scrivermi anche la domanda cosí rispondo si confermo e ceyanche scritto la domanda che confermo»

Messaggi prima in #67: «vai» · «Si» · «attenzione ho cliccato per sbaglio riesci a non farlo touch…» · «anche i nomi se clicchi non sono un problema direi tutti» · «domanda che ne dici se usiamo un github separato visto che è il mio personale quello Kur0ChanX vorrei dare un account a github con la mail jona.ristorante@gmail.con» · «Non è meglio avere un github separato per non usare i limiti…» · «perché è pubblico jona?» · «io mi ricordo di averlo messo su un git hub diverso da Kur0ChanX» · «differenza tra privato e pubblico? pro e contro / Altra cosa prendi la regola delle domande a doppio touch di rvc» · «in organizzazione privato devo usare un nuovo link per l'app?» · (foto) «stai sbagliando…» · (foto) «Hai di nuovo sbagliato?» · «Dico se creo un altro GitHub privato per jona con account jona.ristorante@gmail.com devo rinviare i link?» · «Consigli nuovo account privato o organizzazione privato nel mio kurochanx?»
