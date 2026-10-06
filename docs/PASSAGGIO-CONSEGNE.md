# Passaggio di consegne (2026-10-06)

Sessione attuale: #15

## Ultimo messaggio di Mario (#14)
«puoi farmi aprire sempre i link con chrome me li apre l app claude» → risposto: non si può impostare da qui; nel browser dentro Claude toccare **⋮** → **Apri in Chrome**, oppure tenere premuto il link → **Copia link** e incollarlo in Chrome. Mario sta facendo **M11** (account Cloudflare nuovo): chiedergli a che passo è.

Messaggi precedenti di #14 (in ordine):
- «Non capisco cosa resta, guarda tutto, non voglio dimenticare cose» → dato il quadro completo.
- «Le cose da fare in ordine di funzionalità per la tua programmazione» → ordine M11 → M12 → M13 → controllo Claude → M14 → M15 → M5; il resto non blocca.
- «Regola: non andare avanti senza aver fatto le cose importanti per il codice, non estetica» → regola PRIMA I BLOCCHI in `CLAUDE.md`, voci 🔴 in `docs/DA-FARE.md`.
- «Non facciamo codice superficiale, è per un hotel» → regola STABILITÀ in `CLAUDE.md` (tutte le prove prima di ogni PR, prova per ogni bug) + eccezione EMERGENZA.
- Paura che l'app resti ferma 1 ora durante le prove → spiegato: le prove girano prima della pubblicazione, l'app in hotel non si ferma mai.
- «Fammi un file Word con le cose da fare» → mandato `Jona-cose-da-fare.docx` (solo in chat, non nel repository; stesso contenuto di `docs/DA-FARE.md` più i passi con link di M11, M12, M13).

## Fatto in sessione #14 (ramo `ccr-4a01d00e-6ay25e`, PR #46 aperta, non unita)
- **Tutte le 36 prove** con l'emulatore: 35 riuscite subito. `firebase-bulk` e `firebase-sync` (dubbi di #13) sono ok: gli «errori» nei log sono solo siti esterni bloccati nell'ambiente di prova.
- **Bug vero trovato da `test-v35`** e corretto (`index.html`, `qfNew`/`qfCard`): con Firebase `put` ritorna prima di aggiornare `cfg()`, quindi «Crea il QR» non creava l'immagine e «Cambia QR» stampava il codice VECCHIO. Ora `qfNew` passa `j.codice` a `qfCard(k)`. Aggiunta in `tools/test-v35.mjs` la prova «Cambia QR: immagine con il codice NUOVO». v35, inviti, giro: verdi. APP_VER/CACHE non cambiati (v37 non ancora pubblicata).
- Nuovo `tools/prova-tutto.sh` (tutte le prove, server + emulatore, `risultati.txt`), citato in `tools/README.md`.
- `CLAUDE.md`: regole PRIMA I BLOCCHI, STABILITÀ, EMERGENZA. `docs/DA-FARE.md`: 🔴 su M11-M14, nuova voce M15.
- Controllato: `jona-ristorante-by-ynoy-corp.pages.dev` e i Worker nuovi non rispondono ancora (M11 non fatto). PR #46 `mergeable_state: clean`.

## Prossimi passi (#15)
1. Seguire Mario su M11 → M12 → M13 (passi con link in `docs/DA-FARE.md` e nel file Word; token: template «Edit Cloudflare Workers» + Account › D1 › Edit + Account › Cloudflare Pages › Edit; segreti `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`).
2. Dopo il merge: controllare app, `jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/salute`, `invito.jona-ristorante-by-ynoy-corp.workers.dev/ABCDEF`, workflow Actions verdi, collegamento Firebase dal nuovo indirizzo. Poi passi M14 e M15.
3. Riallineare il ramo dopo lo squash merge (`git fetch origin main && git merge origin/main`, push normale).
4. Ancora senza risposta: copiare la regola bloccata e `.claude/hooks/handoff-check.py` negli altri repository? Quali?

## Rischi aperti
- Chiave Firebase (`apiKey`) con possibili limiti di dominio su Google Cloud: se l'app sul nuovo indirizzo non si collega, controllare lì.
- Account Cloudflare nuovo: foto/vocali vecchi della chat persi, chiave VAPID nuova (notifiche da riattivare sui telefoni).
- `test-firebase-flow` fallisce tra 23:30 e mezzanotte (noto).
- Il resto: `docs/DA-FARE.md`.
