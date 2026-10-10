// Caricamento dei file di Claude nella cartella «Claude Code Lavoro» del Drive di Mario.
// Si incolla in https://script.google.com (Nuovo progetto) e si pubblica come «App web».
// L'indirizzo dell'app web vale come una chiave: mai nel repo (sta nella variabile JONA_DRIVE_URL dell'ambiente).
const CARTELLA = 'Claude Code Lavoro';

function doGet() {
  return risposta_({ ok: true, cartella: cartella_().getUrl() });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.nome || !d.dati) return risposta_({ ok: false, errore: 'servono nome e dati' });
    let dir = cartella_();
    String(d.sotto || '').split('/').forEach(function (n) { if (n) dir = sotto_(dir, n); });
    const vecchi = dir.getFilesByName(d.nome);
    while (vecchi.hasNext()) vecchi.next().setTrashed(true); // la versione vecchia va nel cestino (30 giorni)
    const blob = Utilities.newBlob(Utilities.base64Decode(d.dati), d.tipo || 'application/octet-stream', d.nome);
    const f = dir.createFile(blob);
    return risposta_({ ok: true, link: f.getUrl(), cartella: dir.getUrl() });
  } catch (err) {
    return risposta_({ ok: false, errore: String(err) });
  }
}

function cartella_() {
  const it = DriveApp.getFoldersByName(CARTELLA);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARTELLA);
}

function sotto_(padre, nome) {
  const it = padre.getFoldersByName(nome);
  return it.hasNext() ? it.next() : padre.createFolder(nome);
}

function risposta_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
