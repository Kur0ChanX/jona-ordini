# Jona Ordini 👨🏻‍🍳 · regole del progetto
@docs/kit-progetto/REGOLE.md

Sopra il kit (uguale in tutti i progetti, versione in `docs/kit-progetto/VERSIONE`); qui solo il progetto, che nei dettagli vince. Tetto: ~1.000 token (lo controllano `tools/fai-kit.py` e l'hook `kit-check.py`).- Repo `Kur0ChanX/jona-ordini`, ramo unico **`claude/jona-ramo-definitivo`** (`.claude/ramo-di-lavoro.txt`). Titoli `🟢 👨🏻‍🍳 ▶ ATTIVA · #<NN> · …` e `🔴 👨🏻‍🍳 ✓ CHIUSA · #<NN> · …`. Altri progetti di Mario: RVC 🛎️, SPA Sensorial 🫒, EdilCannas 🏗️.
- Il resto quando serve: skill del kit (`consegne` 🔒, `chat-parallela`, `cambio-account` 🔒, `pr`, `nuova-regola`, `ricerca-aggiornata`); regole per zona in `.claude/rules/` (con `paths:`): se lavoro in una zona solo con Bash, prima le leggo.
- **Eccezione al kit (dichiarata, scelta di Mario #143, non è un conflitto)**: PR dal ramo unico, niente ramo-copia della skill `pr`; bozza → pronta (`draft: false`, un giro) → «prove» verde → squash → controllo online → merge di `main` sul ramo.
- Drive di Mario: `.claude/rules/drive.md` (si carica con `tools/drive/`).

## App con prove
- Sito: https://jona-ristorante-by-ynoy-corp.pages.dev/ (Cloudflare Pages, push su `main`). Dispositivi e regole delle prove: `.claude/rules/prove.md`.

## Compact instructions
Se il contesto viene compresso, conserva: l'ultimo messaggio di Mario parola per parola; le domande aperte; i file toccati con i percorsi; le decisioni con il motivo; il punto esatto del lavoro e il prossimo passo.

---
# Jona Ordini
Ordini di cucina e sala del Jona Ristorante (Maurizio chef/amministratore, staff). Un file statico (`index.html`), senza build; file nuovi nel passo «Prepara i file» di `cloudflare-pages.yml`. Firma «Jona_Ristorante By YNOY CORP».
- Struttura, versioni, chiavi: `.claude/rules/struttura.md`.
- Mai il nome del creatore (Mario Miscera, `mario-miscera`, `kur0chanx`) nei testi dell'app.
- A OGNI versione: `CACHE` in `sw.js`, voce in `NEWS`, `APP_VER` +1, riga in `struttura.md`.
- Staff principiante: parole semplici, pulsanti grandi. Stabilità prima di tutto.
