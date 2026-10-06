// Copie automatiche giornaliere: salvataggio a pezzi, lista, scarica, ripristina, pulizia oltre 14 giorni, modalità locale.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block',acceptDownloads:true});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return [c,p]};
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
const setup=async P=>{await P.goto('http://localhost:8765/index.html');await P.waitForTimeout(3000);
  await P.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await P.fill('input[data-k="'+k+'"]',v);
  await P.click('[data-a="setupGo"]');await P.waitForTimeout(1200)};
// --- modalità locale: niente copie automatiche, niente errori ---
const [cl,Lp]=await mk(null);await setup(Lp);
await Lp.evaluate(()=>autoBackup());await Lp.evaluate(()=>settingsSheet());await Lp.waitForTimeout(500);
ok(await Lp.evaluate(()=>S.db.kind==='locale'&&!document.querySelector('[data-a="bkList"]')),'locale: nessuna riga Copie automatiche');
ok(!Lp.errs.length,'locale: nessun errore '+Lp.errs.join(';'));await cl.close();
// --- database centrale ---
const [ca,A]=await mk(CFG);await setup(A);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
// 2500 prodotti con nomi lunghi: la copia supera 300.000 caratteri e va in più pezzi
await A.evaluate(async()=>{await runPool(Array.from({length:2500},(_,i)=>()=>put('prodotti','big'+i,{fornitoreId:'f'+(i%5),nome:'Prodotto di prova con un nome lungo è à ù numero '+i,codice:'B'+i,unita:'pz',prezzo:i/10,categoria:'Altro',aggiornato:now()})),8)});
await A.waitForTimeout(4000);
// una copia vecchia di 20 giorni, che va cancellata
await A.evaluate(async()=>{const d=new Date();d.setDate(d.getDate()-20);await S.db.backup.save(today(d),'Vecchio')});
ok((await A.evaluate(()=>S.db.backup.list().then(l=>l.length)))>=1,'copia vecchia salvata');
// la copia di oggi parte da sola 10 secondi dopo l'apertura: la rifaccio con tutti i prodotti
await A.evaluate(async()=>{while(autoBackup.run)await new Promise(r=>setTimeout(r,200));const g=today();await firebase.firestore().doc('backup/'+g).delete();ls('jona_bk',null);await autoBackup()});
const L=await A.evaluate(()=>S.db.backup.list());
ok(L.length===1&&L[0].g===await A.evaluate(()=>today())&&L[0].parti>1,'copia di oggi in '+(L[0]&&L[0].parti)+' pezzi, '+(L[0]&&L[0].dim)+' caratteri; vecchia cancellata');
const nOld=await A.evaluate(async()=>{const d=new Date();d.setDate(d.getDate()-20);const s=await firebase.firestore().collection('backup').where('g','==',today(d)).get();return s.size});
ok(nOld===0,'pezzi della copia vecchia cancellati');
ok(await A.evaluate(()=>ls('jona_bk')===today()),'jona_bk = oggi');
// seconda apertura nello stesso giorno: non rifà la copia
const d0=L[0].data;await A.evaluate(()=>{ls('jona_bk',null);return autoBackup()});
ok((await A.evaluate(()=>S.db.backup.list()))[0].data===d0,'stesso giorno: nessuna nuova copia');
// modifico i dati, poi ripristino dalla lista
await A.evaluate(async()=>{await del('prodotti','big7');await put('fornitori','nuovo',{nome:'Fornitore nuovo'})});await A.waitForTimeout(2000);
await A.evaluate(()=>settingsSheet());await A.waitForTimeout(500);await A.click('[data-a="bkList"]');await A.waitForTimeout(2500);
await A.screenshot({path:'/tmp/claude-0/bk-list.png'});
const [dl]=await Promise.all([A.waitForEvent('download'),A.click('[data-a="bkDown"]')]);
const j=JSON.parse(await (await import('node:fs')).promises.readFile(await dl.path(),'utf8'));
ok(j.app==='jona-ordini'&&Object.keys(j.dati.prodotti).length>=2500,'scaricato: '+dl.suggestedFilename()+' con '+Object.keys(j.dati.prodotti).length+' prodotti');
await A.click('[data-a="bkRest"]');await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>!!D().prodotti.big7&&!D().fornitori.nuovo),'ripristinato: big7 c\'è, fornitore nuovo sparito');
ok((await A.evaluate(()=>S.db.backup.list())).length===1,'le copie restano dopo il ripristino');
ok(!A.errs.length,'nessun errore '+A.errs.join(';'));
await b.close();
