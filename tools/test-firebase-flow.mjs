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
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
const [cb,B]=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const cnt=p=>p.evaluate(()=>testCount());
ok(await cnt(B)>=16,'B vede i dati di prova: '+await cnt(B));
// B entra come Luca (test1) e manda una richiesta dal catalogo
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"], .login .btn.primary');await B.waitForTimeout(1500);
ok(await B.evaluate(()=>!!meU()&&meU().id==='test_u1'),'B login test1');
ok(await B.evaluate(()=>document.documentElement.classList.contains('staff-ui')),'B interfaccia staff');
// A come chef approva test_r1
await A.click('[data-a="viewAs"][data-v="gm"]');await A.waitForTimeout(600);
await A.evaluate(async()=>{await approve('test_r1')});await A.waitForTimeout(2500);
ok(await B.evaluate(()=>{const o=D().ordini['aperto_test_f1']||D().ordini['aperto_test_f2'];return !!o}),'B vede l\'ordine aperto del fornitore di prova');
ok(await B.evaluate(()=>D().richieste.test_r1.stato==='approvata'),'B vede richiesta approvata');
// ora limite tra 30 minuti
await A.evaluate(async()=>{const d=new Date(Date.now()+30*60000);if(d.getDate()!==new Date().getDate()){d.setTime(Date.now());d.setHours(23,59,0,0)}const hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');const o=Object.values(D().ordini).find(o=>o.stato==='aperto'&&o.fornitoreId.startsWith('test_'));await upd('fornitori',o.fornitoreId,{oraLimite:hm});ls('jona_rem',null)});await A.waitForTimeout(1500);
await A.evaluate(()=>deadlineTick());await A.waitForTimeout(2000);
ok(await B.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='scadenza').length===1),'promemoria scadenza arrivato anche a B');
await A.click('[data-a="tab"][data-v="invii"]');await A.waitForTimeout(500);
ok(/mancano|entro le/.test(await A.$eval('.main',e=>e.innerText)),'Invii mostra l\'ora limite');
await A.click('[data-a="tab"][data-v="storico"]');await A.waitForTimeout(500);
ok(/Riepilogo/.test(await A.$eval('.main',e=>e.innerText)),'Storico mostra il riepilogo');
await A.screenshot({path:'/tmp/f4.png'});
// cancella dati di prova
await A.click('[data-a="viewAs"][data-v="dev"]');await A.waitForTimeout(400);
await A.evaluate(()=>{delTestData()});await A.waitForTimeout(400);await A.click('#ask-ok');await A.waitForTimeout(4000);
ok(await cnt(B)===0&&await cnt(A)===0,'dati di prova cancellati ovunque (A '+await cnt(A)+', B '+await cnt(B)+')');
ok(await B.evaluate(()=>Object.keys(D().fornitori).length===6),'fornitori veri intatti');
console.log('errors',A.errs,B.errs);await b.close();
