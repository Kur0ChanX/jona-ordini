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
    let dir = percorso_(d.sotto);
    if (d.azione) return azione_(d, dir);
    if (!d.nome || !d.dati) return risposta_({ ok: false, errore: 'servono nome e dati' });
    const vecchi = dir.getFilesByName(d.nome);
    while (vecchi.hasNext()) vecchi.next().setTrashed(true); // la versione vecchia va nel cestino (30 giorni)
    const blob = Utilities.newBlob(Utilities.base64Decode(d.dati), d.tipo || 'application/octet-stream', d.nome);
    const f = dir.createFile(blob);
    return risposta_({ ok: true, link: f.getUrl(), cartella: dir.getUrl() });
  } catch (err) {
    return risposta_({ ok: false, errore: String(err) });
  }
}

// Per mettere in ordine (v2): elenco, sposta (file o cartella in un'altra cartella), cestina (30 giorni nel cestino).
function azione_(d, dir) {
  if (d.azione === 'elenco') {
    const out = { ok: true, cartella: dir.getUrl(), file: [], cartelle: [] };
    const f = dir.getFiles(); while (f.hasNext()) out.file.push(f.next().getName());
    const c = dir.getFolders(); while (c.hasNext()) out.cartelle.push(c.next().getName());
    return risposta_(out);
  }
  if (!d.nome) return risposta_({ ok: false, errore: 'serve nome' });
  const it = d.cartella ? dir.getFoldersByName(d.nome) : dir.getFilesByName(d.nome);
  if (!it.hasNext()) return risposta_({ ok: false, errore: 'non trovato: ' + d.nome });
  const x = it.next();
  if (d.azione === 'sposta') {
    const dest = percorso_(d.verso);
    if (!d.cartella) { const v = dest.getFilesByName(d.nome); while (v.hasNext()) v.next().setTrashed(true); }
    x.moveTo(dest);
    return risposta_({ ok: true, cartella: dest.getUrl() });
  }
  if (d.azione === 'cestina') { x.setTrashed(true); return risposta_({ ok: true }); }
  return risposta_({ ok: false, errore: 'azione sconosciuta: ' + d.azione });
}

function percorso_(sotto) {
  let dir = cartella_();
  String(sotto || '').split('/').forEach(function (n) { if (n) dir = sotto_(dir, n); });
  return dir;
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
