import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
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
console.log('A',await A.evaluate(()=>S.db.kind+' prod='+Object.keys(D().prodotti).length));
const link=await A.evaluate(()=>inviteLink());
const [cb,B]=await mk(null);await B.goto(link);await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
// 300 prodotti di colpo (come un import)
const t0=Date.now();
await A.evaluate(async()=>{await runPool(Array.from({length:300},(_,i)=>()=>put('prodotti','bulk'+i,{fornitoreId:i%2?'metro':'dac',nome:'Prodotto '+i,codice:'B'+i,unita:'pz',prezzo:i/10,categoria:'Altro',aggiornato:now()})),4)});
for(let i=0;i<30;i++){const n=await B.evaluate(()=>Object.keys(D().prodotti).length);if(n>=329)break;await B.waitForTimeout(500)}
console.log('B prod after bulk',await B.evaluate(()=>Object.keys(D().prodotti).length),'in',Date.now()-t0,'ms; A status',await A.evaluate(()=>JSON.stringify(S.db.status())));
// backup e ripristino
const dump=await A.evaluate(()=>S.db.dump());console.log('dump cols',Object.keys(dump).join(','),'prod',Object.keys(dump.prodotti).length);
await A.evaluate(async()=>{await del('fornitori','dolpa');await put('richieste','rx',{utenteId:'x',utenteNome:'X',items:[],stato:'inviata',creato:now()})});await A.waitForTimeout(1500);
console.log('B before restore forn',await B.evaluate(()=>Object.keys(D().fornitori).length+' rich='+Object.keys(D().richieste).length));
await A.evaluate(async d=>{await S.db.load(d)},dump);await A.waitForTimeout(3000);
console.log('B after restore forn',await B.evaluate(()=>Object.keys(D().fornitori).length+' rich='+Object.keys(D().richieste).length+' prod='+Object.keys(D().prodotti).length+' staff='+Object.keys(D().staff).length));
// QR
await A.evaluate(()=>{inviteSheet()});await A.waitForTimeout(4000);await A.screenshot({path:'/tmp/fqr.png'});
console.log('errors',A.errs,B.errs);await b.close();
