// v63: con Firebase il primo gestore che apre l'app cancella da solo, una volta sola, i prodotti di prova
// (demo e mar01..mar19 senza prezzo né listino caricato), leggendo i listini dal server; restano listini veri e prodotti a mano.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return [c,p]};
const [ca,A]=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind)==='firebase','telefono collegato a Firebase');
// senza jona_t_provavia l'emulatore non cancella niente (le altre prove usano i prodotti di prova)
await A.evaluate(()=>deadlineTick());await A.waitForTimeout(1500);
const f0=await A.evaluate(()=>prods().filter(fintoP).length);
ok(f0>=20,'con l\'emulatore i prodotti di prova restano: '+f0);
// listino vero su mar05, prezzo scritto a mano su mar06, prodotto a mano h1
await A.evaluate(async()=>{const P=D().prodotti;
  await put('prodotti','mar05',Object.assign({},P.mar05,{prezzo:2.5,caricatoDa:'mario'}));
  await put('prodotti','mar06',Object.assign({},P.mar06,{prezzo:4}));
  await put('prodotti','h1',{fornitoreId:'metro',nome:'Olio scritto a mano',codice:'',unita:'l',prezzo:9,categoria:'Altro',aggiornato:now()})});
await A.waitForTimeout(1500);
const atteso=await A.evaluate(()=>Object.keys(D().prodotti).filter(id=>!fintoP(D().prodotti[id])).sort().join());
await A.evaluate(()=>{localStorage.setItem('jona_t_provavia','1');return deadlineTick()});
for(let i=0;i<20&&!(await A.evaluate(()=>!!cfg().provaVia));i++)await A.waitForTimeout(500);
await A.waitForTimeout(1000);
ok(await A.evaluate(()=>!!cfg().provaVia),'segnato config/app.provaVia');
const srv=await A.evaluate(async()=>Object.keys(await S.db.prodServer()).sort().join());
ok(srv===atteso,'sul server restano solo i prodotti veri: '+srv);
ok(/mar05/.test(srv)&&/mar06/.test(srv)&&/h1/.test(srv)&&!/demo|mar01/.test(srv),'tenuti mar05 (listino), mar06 (prezzo a mano), h1; tolti demo e mar01');
// una volta sola: un prodotto «demo» aggiunto dopo resta
await A.evaluate(async()=>{await put('prodotti','demo99',{fornitoreId:'metro',nome:'Prova',codice:'',unita:'pz',prezzo:1,categoria:'Altro',aggiornato:now(),demo:true});await deadlineTick()});
await A.waitForTimeout(2000);
ok(await A.evaluate(async()=>!!(await S.db.prodServer()).demo99),'dopo la prima volta non cancella più da solo');
ok(A.errs.length===0,'nessun errore nella pagina: '+A.errs.join(' | '));
await b.close();
