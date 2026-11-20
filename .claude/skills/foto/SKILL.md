---
name: foto
description: Regole per fare e mandare a Mario le foto dell'app (telefono o PC), per approvazioni, confronti prima/dopo e domande sull'aspetto. Usala prima di ogni foto da mostrare.
---

# Foto per Mario

- Le fa l'agente `fotografo` (`.claude/agents/`) solo se Mario ha detto sì agli aiutanti; altrimenti le faccio io con Playwright (`chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`, mai «playwright install»).
- Alta risoluzione: `deviceScaleFactor: 2`. Si mandano con lo strumento dei file (zero token).
- Un telefono per foto (al massimo due affiancati), una schermata per foto (390×844 → 780×1688), numerate «1 di 4».
- Pagine da PC in fasce orizzontali (altezza ≤ ~1100 px); confronti larghi fino a 2400 px.
- Mai una foto alta per intero (Mario #116: il visualizzatore la riduce e il testo non si legge). Foto lunghe o da scroll: `python3 -I tools/taglia-foto.py <foto.png> <cartella>` la taglia in pezzi alti al massimo ~1100 px a larghezza piena, negli spazi vuoti. Meglio ancora: una foto per schermata (viewport 390×844, scorri e scatta con `fullPage: false`).
- Al massimo 4 pezzi per messaggio, numerati «1 di 4», tutti nella stessa chiamata dello strumento dei file. Poi chiedo a Mario se si leggono bene.
- Io guardo solo una copia piccola (≤1000 px), una volta.
- Foto e domanda nello stesso messaggio, mai la foto da sola in un turno.
- Le foto da tenere vanno in `archivio/` con commit.
