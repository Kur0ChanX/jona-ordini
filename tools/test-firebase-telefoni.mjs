// v24 (con l'emulatore): un telefono nuovo aperto dal link resta in attesa e non legge nessun dato finché Maurizio o Mario
// non lo approvano. Profilo nuovo (entra da solo), profilo già esistente (poi accesso normale), rifiuto e nuova richiesta,
// regole (il telefono in attesa non legge, non si approva da solo), telefoni già collegati senza «ok» restano dentro.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const txt=async(p,sel='#app')=>(await p.locator(sel).innerText()).replace(/\s+/g,' ');
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A (chi ha attivato) entra subito');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const link=await A.evaluate(()=>inviteLink());
await A.evaluate(()=>{S.tab='staff';render()});

// 1. telefono nuovo: in attesa, nessun dato
const B=await mk(null);await B.goto(link);await B.waitForTimeout(5000);
let t=await txt(B);
ok(/Benvenuto/.test(t)&&/approvare questo telefono/.test(t),'B: «Benvenuto», deve essere approvato');
ok(await B.evaluate(()=>!S.db.status().ready&&S.db.status().wait==='attesa'&&!Object.keys(D().staff).length),'B: nessun dato caricato');
const deny=await B.evaluate(async()=>{const fs=fbInit().fs;const r={};
  for(const [n,f] of [['staff',()=>fs.collection('staff').get()],['config',()=>fs.doc('config/app').get({source:'server'})],['membri',()=>fs.collection('membri').get()],
    ['ok',()=>fs.doc('membri/'+fbInit().auth.currentUser.uid).update({ok:true})],['scrive',()=>fs.collection('richieste').doc('x').set({a:1})]])
    {try{await f();r[n]='letto'}catch(e){r[n]=e.code}}return r});
ok(Object.values(deny).every(v=>v==='permission-denied'),'regole: in attesa non legge staff/config/membri, non si approva, non scrive '+JSON.stringify(deny));
// richiesta con profilo nuovo
await B.click('[data-a="phNew"]');await B.waitForTimeout(300);
for(const [k,v] of [['nome','Gianni'],['cognome','Loi']])await B.locator(`.sheet input[data-k="${k}"]`).pressSequentially(v);
ok(await B.inputValue('.sheet input[data-k="username"]')==='gianni.loi','nome utente proposto gianni.loi');
for(const k of ['pw','pw2'])await B.fill(`.sheet input[data-k="${k}"]`,'segreto1');
await B.click('.sheet [data-a="phSend"]');await B.waitForTimeout(2000);
t=await txt(B);ok(/Ciao Gianni/.test(t)&&/Richiesta inviata/.test(t),'B: «Richiesta inviata»');
t=await txt(A,'body');
ok(/Telefoni da approvare/.test(t)&&/Gianni Loi/.test(t)&&/chiede di entrare/.test(t),'A: telefono in «Telefoni da approvare» e avviso');
ok(await A.locator('.nav [data-v="staff"] .badge').innerText()==='1','A: contatore 1 sulla scheda Staff');
await A.click('[data-a="phOk"]');await A.waitForTimeout(4000);
ok(await A.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='gianni.loi');return u&&u.stato==='attivo'}),'A: approvato, profilo attivo creato');
ok(await B.evaluate(()=>S.db.status().ready&&meU()&&meU().username==='gianni.loi'),'B: entra da solo come Gianni');
ok(await A.evaluate(()=>phPend().length===0),'A: lista vuota');

// 2. telefono di chi ha già un profilo
const C=await mk(null);await C.goto(link);await C.waitForTimeout(5000);
await C.click('[data-a="phOld"]');await C.waitForTimeout(300);
await C.fill('.sheet input[data-k="nome"]','Luca');await C.fill('.sheet input[data-k="cognome"]','Rossi');
await C.click('.sheet [data-a="phSend"]');await C.waitForTimeout(2000);
ok(/Hai già un profilo/.test(await txt(C)),'C: richiesta «ho già un profilo»');
await A.waitForTimeout(500);ok(/ha già un profilo/.test(await txt(A)),'A: vede «ha già un profilo»');
await A.click('[data-a="phOk"]');await C.waitForTimeout(4000);
ok(await C.locator('[data-a="doLogin"]').count()===1,'C: dopo l\'approvazione vede l\'accesso');
await C.fill('input[data-k="u"]','test1');await C.fill('input[data-k="p"]','prova123');await C.click('[data-a="doLogin"]');await C.waitForTimeout(2500);
ok(await C.evaluate(()=>meU()&&meU().id==='test_u1'),'C: entra con il suo profilo');

// 3. rifiuto e nuova richiesta
const D2=await mk(null);await D2.goto(link);await D2.waitForTimeout(5000);
await D2.click('[data-a="phOld"]');await D2.waitForTimeout(300);await D2.fill('.sheet input[data-k="nome"]','Estraneo');await D2.click('.sheet [data-a="phSend"]');await D2.waitForTimeout(2000);
await A.waitForTimeout(500);await A.click('[data-a="phNo"]');await A.waitForTimeout(300);await A.click('#ask-ok');await D2.waitForTimeout(3000);
ok(/Richiesta non approvata/.test(await txt(D2)),'D: rifiutato');
await D2.click('[data-a="phAgain"]');await D2.waitForTimeout(3000);
ok(/Benvenuto/.test(await txt(D2)),'D: «Chiedi di nuovo» torna alla richiesta');

// 4. telefono collegato prima della v24 (membri senza «ok») e ritorno in primo piano
await B.evaluate(()=>{ls('jona_member',null)});await B.reload();await B.waitForTimeout(5000);
ok(await B.evaluate(()=>S.db.status().ready&&!!meU()),'telefono già approvato: riaperto entra subito');
const m0=await A.evaluate(async()=>{await fbInit().fs.doc('membri/'+fbInit().auth.currentUser.uid).get({source:'server'}).then(d=>d.data().ok);return 1});
ok(m0===1,'A senza «ok» resta membro');
await B.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
await B.waitForTimeout(5500);
await B.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});
await B.waitForTimeout(1500);
await A.evaluate(()=>chCol().add({c:'tutti',da:meU().id,t:'dopo il risveglio',creato:now()}));
await B.waitForFunction(()=>CHAT.msgs.some(m=>m.t==='dopo il risveglio'),null,{timeout:5000}).then(()=>ok(true,'B: dopo il risveglio riceve subito la chat'),()=>ok(false,'B: dopo il risveglio riceve subito la chat'));
for(const [n,p] of [['A',A],['B',B],['C',C],['D',D2]])ok(p.errs.length===0,n+': nessun errore '+p.errs.join(' | '));
await b.close();
