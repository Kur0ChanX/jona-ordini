# Jona Ordini 👨🏻‍🍳 · regole del progetto
@docs/kit-progetto/REGOLE.md

Sopra il kit (uguale in tutti i progetti, versione in `docs/kit-progetto/VERSIONE`); qui solo il progetto, che nei dettagli vince. Tetto: ~1.000 token (lo controllano `tools/fai-kit.py` e l'hook `kit-check.py`). Vecchio CLAUDE.md (prima del kit 27.3): `archivio/CLAUDE-prima-del-kit-27.md`; date e motivi delle regole in `docs/STORIA-REGOLE.md`.
- Repo `Kur0ChanX/jona-ordini`, ramo unico **`claude/jona-ramo-definitivo`** (`.claude/ramo-di-lavoro.txt`). Titoli `🟢 👨🏻‍🍳 ▶ ATTIVA · #<NN> · …` e `🔴 👨🏻‍🍳 ✓ CHIUSA · #<NN> · …`. Altri progetti di Mario: RVC 🛎️, SPA Sensorial 🫒, EdilCannas 🏗️.
- Il resto quando serve: skill del kit (`consegne` 🔒, `chat-parallela`, `cambio-account` 🔒, `pr`, `nuova-regola`, `ricerca-aggiornata`, `foto`, `unione-pr`, `minuti-github`); regole per zona in `.claude/rules/` (con `paths:`): se lavoro in una zona solo con Bash, prima le leggo.
- **PR (vince sulla skill `pr`, scelta di Mario #143)**: niente ramo-copia. PR dal ramo unico, aperta in BOZZA → versione pronta: `update_pull_request` con `draft: false` (UN giro) → «prove» verde → squash con `commit_message` corto → controllo online → `git fetch origin main && git merge origin/main` sul ramo e push normale. Va online da sola col verde; chiedo solo se qualcosa fallisce.
- Drive di Mario: solo «Claude Code Lavoro/Jona/<tema>», solo l'essenziale (loghi finiti, guide e PDF per il ristorante); carico con `tools/drive/carica.sh` e do il link della cartella. URL solo nella variabile `JONA_DRIVE_URL`, mai stampato.

## App con prove
- Anteprima e sito: https://jona-ristorante-by-ynoy-corp.pages.dev/ (Cloudflare Pages a ogni push su `main`). Dispositivi e regole delle prove (locale, GitHub, giro completo, emergenza): `.claude/rules/prove.md`. Repo pubblico: minuti GitHub gratis.

## Compact instructions
Se il contesto viene compresso, conserva: l'ultimo messaggio di Mario parola per parola; le domande aperte; i file toccati con i percorsi; le decisioni con il motivo; il punto esatto del lavoro e il prossimo passo.

---
# Jona Ordini
App degli ordini di cucina e sala del Jona Ristorante (Mario sviluppatore, Maurizio amministratore/chef, staff). Un solo file statico (`index.html`) senza build; file nuovi dell'app vanno nel passo «Prepara i file» di `.github/workflows/cloudflare-pages.yml`. Si installa come app. Il vecchio indirizzo GitHub Pages passa da solo al nuovo. Firma visibile «Jona_Ristorante By YNOY CORP» (senza «&»).
- Struttura, versioni e chiavi in localStorage: `.claude/rules/struttura.md`.
- Mai il nome del creatore (Mario Miscera, `mario-miscera`, `kur0chanx`) in link, inviti e testi per gli utenti (neanche nei commenti di `index.html`).
- A OGNI versione: `CACHE` in `sw.js`, voce in `NEWS`, `APP_VER` +1, riga della versione in `.claude/rules/struttura.md`.
- Interfaccia dello staff a prova di principiante: parole semplici, pulsanti grandi. L'app serve a un hotel: stabilità prima di tutto.
