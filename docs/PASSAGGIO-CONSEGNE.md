# Passaggio di consegne (2026-10-06)

Sessione attuale: #14

## Ultimo messaggio di Mario (#13)
«Ora lo faccio, però prima mi hai detto che ci sono 3 errori, li vediamo dopo... non voglio trascinarmi errori, il progetto deve essere stabile, ho paura» → Mario sta facendo i passi M11→M14 (account Cloudflare nuovo). Claude ha trovato la causa dei 3 errori (vedi sotto) e stava facendo girare tutte le prove con l'emulatore.

Messaggi precedenti di #13 (in ordine):
- «A, account nuovo solo per Jona»: il vecchio account Cloudflare ha anche `fruguponte` (usato in altri progetti, da NON toccare). Il sottodominio è uno per account → Jona va su un account Cloudflare NUOVO con sottodominio `jona-ristorante-by-ynoy-corp`. Il codice della v37 non cambia.
- «YNOY-CORP va bene, dove si può mettere la metti»: nome `jona-ristorante-by-ynoy-corp`; `&` solo nei testi visibili («Jona_Ristorante By YNOY&CORP»).
- «Ricordati di fare sempre per ogni progetto in questo account... regola salva token con chiusura sessione, passaggio consegne e apertura sessione rinominata automaticamente; non modificarla senza il mio consenso» → scritta come 🔒 REGOLA BLOCCATA in `CLAUDE.md`. Dato a Mario il testo per le preferenze di claude.ai (conferma non arrivata). Chiesto se copiarla negli altri repository (risposta non arrivata).
- «La prossima volta apri tu la nuova sessione e rinominala, io non devo fare niente».

## Fatto in sessione #13
- **v37** sul ramo `ccr-4a01d00e-6ay25e`, **PR #46** aperta (https://github.com/Kur0ChanX/jona-ordini/pull/46), NON ancora unita:
  - `index.html`: `WK_SUB='jona-ristorante-by-ynoy-corp'`, `og:image` e `og:site_name`, testi `PUSH_HELP`, `APP_VER=37`, NEWS v37, firma `.wall-brand` nella schermata d'ingresso, script in `<head>` che da `*.github.io` passa a `https://jona-ristorante-by-ynoy-corp.pages.dev/` solo se il manifest risponde (provato: con `#i=` passa, nuovo giù resta).
  - `sw.js` (`PUSH_URL`, `CACHE` v41), `manifest.webmanifest` (percorsi relativi), `_headers` (CORS sul manifest), `worker/src/index.js` (`sub` VAPID), `worker/invito/src/index.js` (`APP`, firma), `.github/workflows/cloudflare-worker.yml` (prove), nuovo `.github/workflows/cloudflare-pages.yml` (crea il progetto Pages se manca, pubblica, prova), `CLAUDE.md`, test.
- **Causa dei 3 errori nelle prove** (test-v35, test-firebase-push, test-firebase-approva-arrivi, falliti anche sul codice vecchio): con `firebase-config.js` vero, l'app usava il progetto `jona-ordini` nell'emulatore e non `demo-jona`; i dati di una prova restavano lì (la pulizia svuota solo `demo-jona`) → la prova dopo vedeva «Collega questo telefono». Corretto nei 14 test con emulatore (commit `e3e954d`): nascondono `firebase-config.js`. Solo file di prova, app non toccata.
- Prove verdi: test-news, test-inviti, test-v29, test-giro, test-v34, test-gemini-server, test-firebase-allegati (dopo la correzione). Le altre prove con emulatore erano ancora in corso alla chiusura.

## Prossimi passi (#14)
1. Rifare girare TUTTE le prove con l'emulatore (`tools/README.md`; avvio: `npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona`; server `python3 -m http.server 8765`; svuotare `demo-jona` prima di ogni prova). Dire a Mario il risultato in chiaro: deve sapere che il progetto è stabile.
2. Seguire Mario sui passi M11→M14 (`docs/DA-FARE.md`). Dopo il merge: controllare `https://jona-ristorante-by-ynoy-corp.pages.dev/`, `jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/salute`, `invito.jona-ristorante-by-ynoy-corp.workers.dev/ABCDEF`, workflow Actions verdi.
3. Dopo il trasloco: Mario cancella `invito` e `jona-notifiche` dal VECCHIO account (non `fruguponte`). QR della cucina da rifare (chiesto se è stampato, nessuna risposta).
4. Chiedere ancora: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository? Quali?

## Rischi aperti
- La chiave Firebase (`apiKey` in `firebase-config.js`) potrebbe avere limiti di dominio su Google Cloud: se l'app sul nuovo indirizzo non si collega, controllare lì.
- Nuovo account Cloudflare: foto/vocali vecchi della chat persi, chiave VAPID nuova (le iscrizioni push si rifanno comunque con il nuovo indirizzo).
- `test-firebase-flow`: fascia 01:30-02:00 italiane mai provata dal vero.
- Il resto: `docs/DA-FARE.md`.
