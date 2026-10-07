# Passaggio di consegne (2026-10-07)

Sessione attuale: #28

## Ultimo messaggio di Mario (#27), parola per parola
«si»
(= sì all'unione di `main` nel ramo di lavoro risolvendo i conflitti degli appunti come proposto. Fatto: commit `e0b0850`.)

## Messaggi di Mario in #27 (per non perdere le richieste)
1. «prova breve e aggiungi la modalità vista Mauro F&B e dimmi i link da mandare allo chef che non lo vediamo ancora nello staff» → fatto tutto (sotto).
2. Strada C (decisa in RVC il 07/10, consenso a modificare `CLAUDE.md`, solo aggiunte): `docs/ERRORI.md`, hook `.claude/hooks/avvio-check.py` (copia ESATTA del FILE 4 di `docs/MODELLO-REGOLE.md` del repo RVC, ramo `ccr-21870003-1jtfk9`: in `main` di RVC il file non c'è), `SessionStart` startup|resume in `.claude/settings.json`, 3 regole in REGOLE TRASVERSALI, passo 6 dell'handoff con `docs/ERRORI.md` e «HEAD detached». Fatto, commit `73d5fdd`.
3. «si» → merge di main (sopra).

## Fatto in #27
- Avvio: la sessione è partita su HEAD staccato (diventato E1 nel diario). Il controllo automatico dei permessi non rispondeva all'inizio (E9): risolto da solo al messaggio dopo.
- La sessione #26 ha mandato un messaggio: `test-agenda` e `test-giro` della v43 riuscite.
- **v43 online**: PR #52 squash (`98b3180`), sito con `APP_VER=43` e «F&B Mauro» verificato. Contiene la v43 di #26 (Full time Responsabile) + la novità di #27:
  - `index.html`: `VIEW_AS.fb={ruolo:'staff',reparto:'fb',mansione:'F&B Manager'}`, pulsante «F&B Mauro» nella barra Test (tra Admin Chef e Staff); CSS `.testbar .seg{flex-wrap:wrap;border-radius:18px;min-width:0}` perché con 4 pulsanti a 320 px l'ultimo restava fuori (prima scorreva di lato). Nota dev nella NEWS v43. Niente nuovo `APP_VER`/`CACHE` (stessa v43 non ancora pubblicata).
  - `tools/test-testbar.mjs`: prova della vista F&B (staff, reparto fb, `agCan` vero, non gestore) e dei 4 pulsanti dentro 320 px.
  - `tools/test-responsabile.mjs`: cercava «Mauro» in tutto `main` e trovava il pulsante della barra Test → ora ignora `.testbar` (E8). 15/15.
  - Prove (scelta di Mario: **breve**): test-responsabile, test-testbar, test-agenda, test-giro riuscite (+ quelle di #26).
- `CLAUDE.md`: barra Test con le 4 viste.
- Merge di main nel ramo ccr: conflitti solo negli appunti. Il primo tentativo l'ho annullato con `git merge --abort` per la regola «FERMATI e spiegamelo» (e lo stop hook chiedeva l'albero pulito). Dopo il «si»: `DA-FARE.md` dalla versione di main, consegne da ccr, `CLAUDE.md` tenute le 3 regole nuove.
- Strada C (sopra). Hook provato: sul ramo dice solo «Leggi docs/ERRORI.md…»; su HEAD staccato propone `git checkout ccr-4a01d00e-6ay25e && …`.

## Risposta già data a Mario: invitare lo chef (Maurizio)
Non c'è un link fisso: lo crea l'app (codice di 7 giorni). Passi dati: Impostazioni → Database centrale → **Invita** → **Manda l'invito (WhatsApp…)** → Maurizio installa e si registra → Staff → Telefoni da approvare → ruolo **Admin Chef** → Contratto e orari → **Full time Responsabile**; lo stesso contratto per Mauro con la vista Admin Chef. Sono M1, M2, M19 in `docs/DA-FARE.md`. Mario non ha ancora detto a che passo è.

## Prossimi passi (#28)
1. Chiedere a Mario a che passo è con l'invito di Maurizio (M1/M2/M19).
2. Testo di «Scadenze per lo staff» in Impostazioni: «Avviso sul telefono dello staff: «Richieste allo chef entro le…»» sembra tagliato. Riscriverlo, es. «Esempio di avviso: «Richieste allo chef entro le 18»» (`grep -n -o '.\{0,80\}Richieste allo chef entro.\{0,120\}' index.html`). Sarà v44 (`APP_VER` 44, `CACHE` in `sw.js`, NEWS).
3. Riga «“Oggi si ordina” arriva a» più chiara (es. «Ora arriva a: tutti gli Admin Chef (oggi: Mario Miscera)»): proporla a Mario prima, con un'immagine prima/dopo (regola nuova).
4. Giro completo delle prove (v42+v43): rimandato da Mario. Chiedere «Lo faccio partire ora o dopo?».
5. Dopo: notifica del mattino «Oggi in hotel» e promemoria prima dell'evento dal Worker, poi V, W, X; poi A, C, G, H, I, J, K, O, R, U (`docs/PIANO-INVERNO.md`).

## Rischi aperti
- Una domanda per volta a Mario, con le scelte pronte (regola nuova, E2).
- Il repo RVC è stato aggiunto a questa sessione solo per leggere `docs/MODELLO-REGOLE.md`; niente modificato lì.
- Telefono in attesa `ISLyK5…` (M17). `test-firebase-flow` tra 23:30 e mezzanotte (E10). Se `AbortError` torna su Oppo/OnePlus: strada B (bot Telegram).
- Elenco completo: `docs/DA-FARE.md`. Errori: `docs/ERRORI.md`.
- Titoli sessioni: `🟤 ▶ ATTIVA · #NN · Jona Ordini · …` / `🟤 ✓ CHIUSA · …`.
