import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return [c,p]};
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
const [ca,A]=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'firebase pronto');
// 320 ordini inviati: uno al giorno all'indietro da oggi, 10 € ciascuno
// 320 scritture di fila sull'emulatore superano i 4 s di netWatch: senza jona_fb_lp l'app passerebbe al long polling e si ricaricherebbe a metà prova
await A.evaluate(()=>localStorage.setItem('jona_fb_lp','1'));
await A.evaluate(async()=>{const d0=Date.now();for(let i=0;i<320;i++){const t=d0-i*86400000-3600000;await put('ordini','old'+i,{fornitoreId:'mariano',fornitoreNome:'F.lli Mariano',stato:'inviato',creato:t,inviato:t,items:[{nome:'Riso',qta:1,unita:'kg',prezzo:10}]})}});
for(let i=0;i<60;i++){if(await A.evaluate(()=>S.db.status().pend===0))break;await A.waitForTimeout(500)}
console.log('A pend',await A.evaluate(()=>S.db.status().pend));
const [cb,B]=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(6000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await B.fill('input[data-k="u"]','mario');await B.fill('input[data-k="p"]','prova1234');await B.click('.login .btn.primary');await B.waitForTimeout(2000);
console.log('B ordini caricati',await B.evaluate(()=>Object.keys(D().ordini).length));
// atteso: giorni dell'anno trascorsi (ordine al giorno, fino a 320)
const exp=3200;
await B.evaluate(()=>{openReport()});await B.waitForTimeout(500);
for(let i=0;i<20;i++){if(await B.evaluate(()=>Object.keys(D().ordini).length)>=300)break;await B.waitForTimeout(500)}
console.log('B ordini caricati (dopo attesa)',await B.evaluate(()=>Object.keys(D().ordini).length));
await B.evaluate(()=>{const R=rpState();R.per='dal';const d=new Date(Date.now()-330*86400000);R.a=today(d);R.b=today();refreshSheet()});await B.waitForTimeout(300);
const t1=await B.evaluate(()=>rpCalc(rpState()));
await B.waitForTimeout(4000);
const t2=await B.evaluate(()=>rpCalc(rpState()));
const keys=Object.keys(t2).join(',');console.log('keys',keys);
const tot=x=>x.tot??x.totale??x.spesa;
console.log('330 giorni: prima',tot(t1),'dopo',tot(t2),'atteso',exp);
ok(Math.abs(tot(t2)-exp)<0.01,'quest\'anno include gli ordini oltre i 300');
console.log('nota:',await B.evaluate(()=>[...document.querySelectorAll('.rp-note')].map(e=>e.innerText).join(' | ')));
console.log('errors',A.errs,B.errs);await b.close();
