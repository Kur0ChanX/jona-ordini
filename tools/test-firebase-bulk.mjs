import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
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
const a0=await A.evaluate(()=>({k:S.db.kind,n:Object.keys(D().prodotti).length}));console.log('A',JSON.stringify(a0));
ok(a0.k==='firebase'&&a0.n===29,'A collegato a Firebase con i 29 prodotti di prova');
const link=await A.evaluate(()=>inviteLink());
const [cb,B]=await mk(null);await B.goto(link);await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
// 300 prodotti di colpo (come un import)
const t0=Date.now();
await A.evaluate(async()=>{await runPool(Array.from({length:300},(_,i)=>()=>put('prodotti','bulk'+i,{fornitoreId:i%2?'metro':'dac',nome:'Prodotto '+i,codice:'B'+i,unita:'pz',prezzo:i/10,categoria:'Altro',aggiornato:now()})),4)});
for(let i=0;i<30;i++){const n=await B.evaluate(()=>Object.keys(D().prodotti).length);if(n>=329)break;await B.waitForTimeout(500)}
const nB=await B.evaluate(()=>Object.keys(D().prodotti).length),stA=await A.evaluate(()=>S.db.status());console.log('B prod after bulk',nB,'in',Date.now()-t0,'ms');
ok(nB===329,'B riceve i 300 prodotti nuovi (329 in tutto)');ok(stA.pend===0&&!stA.err,'A senza scritture in sospeso né errori');
// backup e ripristino
const dump=await A.evaluate(()=>S.db.dump());ok(['staff','fornitori','prodotti','config','richieste','ordini'].every(c=>dump[c])&&Object.keys(dump.prodotti).length===329,'copia con tutte le collezioni e 329 prodotti');
await A.evaluate(async()=>{await del('fornitori','dolpa');await put('richieste','rx',{utenteId:'x',utenteNome:'X',items:[],stato:'inviata',creato:now()})});await A.waitForTimeout(1500);
const pre=await B.evaluate(()=>({f:Object.keys(D().fornitori).length,r:Object.keys(D().richieste).length}));ok(pre.f===5&&pre.r===1,'B vede il fornitore tolto e la richiesta nuova');
await A.evaluate(async d=>{await S.db.load(d)},dump);await A.waitForTimeout(3000);
const post=await B.evaluate(()=>({f:Object.keys(D().fornitori).length,r:Object.keys(D().richieste).length,p:Object.keys(D().prodotti).length,s:Object.keys(D().staff).length,dolpa:!!D().fornitori.dolpa}));console.log('B after restore',JSON.stringify(post));
ok(post.f===6&&post.dolpa&&post.r===0&&post.p===329&&post.s===1,'ripristino: fornitore tornato, richiesta in più tolta, prodotti e staff intatti');
// QR
await A.evaluate(()=>{inviteSheet()});await A.waitForTimeout(4000);ok(await A.evaluate(()=>{const sh=document.querySelector('.sheet');return !!sh&&!!sh.querySelector('canvas,img,svg')}),'foglio dell\'invito con il QR');
ok(!A.errs.length&&!B.errs.length,'nessun errore nella pagina '+JSON.stringify([A.errs,B.errs]));await b.close();
