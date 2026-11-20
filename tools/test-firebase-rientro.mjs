// v121 (D58 pezzo 2a, con l'emulatore): telefono svuotato → stesso profilo di prima, senza password e senza profili doppi.
// A: «Ho già un profilo» → il gestore sceglie il profilo e tocca «Ricollega» → dentro da solo.
// D: «Sono nuovo» con lo stesso nome di un profilo → «Profilo doppio?» → «È lui: ricollega» → nessun profilo nuovo.
// E: chi può ricollegare i telefoni non scende mai sotto 2 (interruttore, disattiva, elimina, fine stagione, cambio reparto).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const txt=async(p,sel='#app')=>(await p.locator(sel).innerText()).replace(/\s+/g,' ');
const wait=(p,f,a,ms=8000)=>p.waitForFunction(f,a,{timeout:ms}).then(()=>true,()=>false);
// pulisce l'emulatore (prove ripetute)
await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-jona/databases/(default)/documents',{method:'DELETE'}).catch(()=>{});
await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-jona/accounts',{method:'DELETE'}).catch(()=>{});

const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');
ok(await wait(A,()=>S.db.kind==='firebase'&&S.db.status().ready,null,30000),'A (sviluppatore) collegato');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const link=await A.evaluate(()=>inviteLink());
await A.evaluate(()=>{S.tab='staff';render()});
const nStaff=()=>A.evaluate(()=>Object.keys(D().staff).length);
const n0=await nStaff();

// A. telefono svuotato di Luca Prova: «Ho già un profilo» → «Ricollega»
const B=await mk(null);await B.goto(link);await wait(B,()=>S.db&&S.db.status().wait==='attesa',null,15000);
let t=await txt(B);
ok(/Hai già usato Jona/.test(t)&&await B.locator('.btn.primary[data-a="phOld"]').count()===1,'A: «Ho già un profilo» è il pulsante principale, con la riga di aiuto');
await B.click('[data-a="phOld"]');await B.waitForTimeout(300);
await B.fill('.sheet input[data-k="nome"]','Luca');await B.fill('.sheet input[data-k="cognome"]','Prova');
await B.click('.sheet [data-a="phSend"]');
ok(await wait(A,()=>phPend().length===1),'A: la richiesta arriva al gestore');
await A.click('.ph-strip [data-a="phOk"]');await A.waitForTimeout(400);
t=await txt(A,'.sheet');
ok(/Di chi è questo telefono/.test(t)&&await A.inputValue('#ph-sel')==='test_u1'&&/Ricollega a Luca/.test(t),'A: il gestore vede «Di chi è», Luca Prova già scelto, «Ricollega a Luca» '+await A.evaluate(()=>JSON.stringify([PH.list.map(x=>x.req),phSimili(PH.list[0].req).map(u=>u.id),Object.values(D().staff).map(u=>[u.id,u.nome,u.cognome,u.stato])])));
if(process.exitCode){await b.close();process.exit(1)}
await A.click('.sheet [data-a="phRie"]');
ok(await wait(B,()=>S.db.status().ready&&S.me==='test_u1',null,12000),'A: il telefono entra da solo nel profilo di prima, senza password');
ok(await B.evaluate(()=>ls('jona_me')==='test_u1'&&!ls('jona_rie')&&/Bentornato Luca/.test(document.body.innerText)),'A: «Bentornato Luca», profilo salvato sul telefono');
ok(await nStaff()===n0,'A: nessun profilo nuovo');
await B.reload();ok(await wait(B,()=>S.db.status().ready&&meU()&&meU().id==='test_u1',null,12000),'A: riaperta, l\'app resta nel suo profilo');
ok(await A.evaluate(async()=>{const q=await fbInit().fs.collection('membri').where('sid','==','test_u1').get({source:'server'});return q.docs.some(d=>d.data().ok===true)}),'A: il telefono è legato al profilo sul server (membri.sid)');

// D. «Sono nuovo» con lo stesso nome di Sara Prova
const C=await mk(null);await C.goto(link);await wait(C,()=>S.db&&S.db.status().wait==='attesa',null,15000);
await C.click('[data-a="phNew"]');await C.waitForTimeout(300);
for(const [k,v] of [['nome','Sara'],['cognome','Prova']])await C.locator(`.sheet input[data-k="${k}"]`).pressSequentially(v);
for(const k of ['pw','pw2'])await C.fill(`.sheet input[data-k="${k}"]`,'segreto1');
await C.click('.sheet [data-a="phSend"]');
ok(await wait(A,()=>phPend().length===1),'D: la richiesta «nuovo profilo» arriva');
await A.click('.ph-strip [data-a="phOk"]');await A.waitForTimeout(400);
t=await txt(A,'.sheet');
ok(/Profilo doppio/.test(t)&&/Sembra Sara Prova/.test(t)&&/È una persona nuova/.test(t),'D: il gestore vede «Sembra Sara Prova, che ha già un profilo»');
await A.click('.sheet [data-a="phRie"]');
ok(await wait(C,()=>S.db.status().ready&&S.me==='test_u2',null,12000),'D: «È lui: ricollega» → entra come Sara di prima');
ok(await nStaff()===n0,'D: nessun profilo doppio');

// E. sempre almeno 2 persone che ricollegano i telefoni
const nUl=()=>A.evaluate(()=>unlockers().length);
const u0=await nUl();
ok(u0>=1,'E: chi può ricollegare all\'inizio: '+u0);
// porta a 2 esatte con l'interruttore di Luca (e di Sara se serve)
await A.evaluate(async()=>{await sblSet('test_u1','1')});await A.waitForTimeout(500);
ok(await A.evaluate(()=>canUnlock(D().staff.test_u1)),'E: interruttore «Può ricollegare i telefoni» acceso per Luca');
const u1=await nUl();
if(u1===2){
  await A.evaluate(async()=>{await sblSet('test_u1','0')});await A.waitForTimeout(300);
  ok(await A.evaluate(()=>!!D().staff.test_u1.sblocca),'E: spegnere l\'interruttore sotto 2 è rifiutato');
  ok(await A.evaluate(()=>!ulKeep({test_u1:{stato:'disattivato'}})&&!ulKeep({test_u1:null})&&!ulKeep({test_u1:{reparto:'sala'}})),'E: disattiva, elimina e cambio che tolgono Luca sono rifiutati');
  ok(await A.evaluate(()=>!ulKeep(Object.fromEntries(Object.values(D().staff).filter(u=>u.ruolo==='staff'&&u.stato==='attivo').map(u=>[u.id,{stato:'disattivato'}])))),'E: fine stagione rifiutata (porterebbe sotto 2)');
  ok(/ricollegare i telefoni/.test(await A.evaluate(()=>document.querySelector('.toast')?document.querySelector('.toast').innerText:document.body.innerText)),'E: avviso con il motivo');
}else ok(false,'E: attese 2 persone dopo l\'interruttore, sono '+u1);
// Luca ora vede i telefoni in attesa (striscia) e la voce nel menù
await B.evaluate(()=>{meMenu()});await B.waitForTimeout(300);
ok(/Ricollega un telefono/.test(await txt(B,'.sheet')),'E: Luca (staff con interruttore) ha «Ricollega un telefono» nel menù');
// con una sola persona: striscia ai gestori nella scheda Staff
await A.evaluate(async()=>{await upd('staff','test_u1',{sblocca:false})});await A.waitForTimeout(500);
await A.evaluate(()=>{closeSheet();S.tab='staff';render()});await A.waitForTimeout(300);
if(await nUl()<2)ok(/ricollegare i telefoni di chi resta fuori/.test(await txt(A)),'E: meno di 2 → avviso nella scheda Staff');
for(const [n,p] of [['A',A],['B',B],['C',C]])ok(p.errs.length===0,n+': nessun errore '+p.errs.join(' | '));
await b.close();
