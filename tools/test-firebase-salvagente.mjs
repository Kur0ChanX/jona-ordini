// v122 (D59 salvagente, con l'emulatore): telefono svuotato → «Avevi già l'app?» → nome utente e password → stesso profilo, da solo.
// A: «Metti al sicuro il tuo accesso» (password sbagliata rifiutata, giusta → accesso di riserva, membri sv approvato, non è un telefono).
// B: «Entra» crea da solo l'accesso di riserva. C: telefono svuotato → rientra (sbagliata → fuori; giusta → dentro, nessun profilo nuovo).
// D: il gestore cambia la password → l'accesso si aggiorna (vecchia → fuori, nuova → dentro). E: registrazione porta svh. F: Email/password spento.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.ctx=c;return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const txt=async(p,sel='#app')=>(await p.locator(sel).innerText()).replace(/\s+/g,' ');
const wait=(p,f,a,ms=8000)=>p.waitForFunction(f,a,{timeout:ms}).then(()=>true,()=>false);
const toasts=p=>p.evaluate(()=>$('#toasts').innerText);
await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-jona/databases/(default)/documents',{method:'DELETE'}).catch(()=>{});
await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-jona/accounts',{method:'DELETE'}).catch(()=>{});
const accounts=async()=>{const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-jona/accounts:query',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer owner'},body:'{}'});const j=await r.json();return(j.userInfo||[]).filter(u=>u.email).map(u=>u.email)};

const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');
// fbActivate ricarica la pagina: un'attesa che attraversa la ricarica fallisce, quindi si riprova
let pronto=false;for(let i=0;i<3&&!pronto;i++)pronto=await wait(A,()=>S.db&&S.db.kind==='firebase'&&S.db.status().ready,null,15000);
ok(pronto,'A (sviluppatore) collegato');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const nStaff=()=>A.evaluate(()=>Object.keys(D().staff).length);
const n0=await nStaff();
ok(await A.evaluate(()=>!!D().staff.test_u1),'dati di prova pronti '+await A.evaluate(()=>JSON.stringify(Object.values(D().staff).map(u=>[u.id,u.username]))+$('#toasts').innerText));
ok(await A.evaluate(()=>svMail('maria.rossi')==='maria_2erossi@utenti.jona-ristorante-by-ynoy-corp.pages.dev'&&/^[a-z0-9_]+@/.test(svMail('nicolò d\'amico'))),'svMail: email valida da ogni nome utente');

// A. «Metti al sicuro il tuo accesso»
ok(await wait(A,()=>!!document.querySelector('.sv-ask [data-a="svSheet"]'),null,15000),'A: compare «Metti al sicuro il tuo accesso» '+await A.evaluate(()=>JSON.stringify(ls('jona_sv_on'))));
await A.click('.sv-ask [data-a="svSheet"]');await A.waitForTimeout(300);
ok(await A.inputValue('#sv-u2')==='mario'&&await A.getAttribute('#sv-p2','autocomplete')==='current-password','A: modulo con nome utente già scritto e password salvabile dal telefono');
await A.fill('#sv-p2','sbagliata99');await A.click('.sheet [data-a="svSave"]');await A.waitForTimeout(400);
ok(/Password non corretta/.test(await toasts(A))&&!(await A.evaluate(()=>D().staff[S.me].svh)),'A: password sbagliata rifiutata, niente accesso di riserva');
await A.fill('#sv-p2','prova1234');await A.click('.sheet [data-a="svSave"]');
ok(await wait(A,()=>/Il tuo accesso è al sicuro/.test($('#toasts').innerText),null,15000),'A: «Fatto! Il tuo accesso è al sicuro.» '+await toasts(A));
ok(await wait(A,()=>svOk(D().staff[S.me])&&!document.querySelector('.sv-ask')),'A: profilo pronto (svh e svu), la striscia sparisce');
ok(await A.evaluate(async()=>{const q=await fbInit().fs.collection('membri').where('sid','==',S.me).get({source:'server'});return q.docs.some(d=>d.data().sv===true&&d.data().ok===true)}),'A: l\'accesso di riserva ha la sua iscrizione approvata (membri sv)');
ok((await accounts()).includes('mario@utenti.jona-ristorante-by-ynoy-corp.pages.dev'),'A: accesso Firebase mario@utenti… creato');
await A.evaluate(()=>{closeSheet();profileSheet(S.me)});await A.waitForTimeout(1500);
let t=await txt(A,'.sheet');
ok(/Rientro da solo con la password: pronto/.test(t),'A: nella scheda del profilo «Rientro da solo con la password: pronto»');
await A.evaluate(()=>closeSheet());

// B. «Entra» crea da solo l'accesso di riserva (Luca, test1 / prova123)
await A.evaluate(()=>logout());await A.waitForTimeout(500);
await A.fill('#li-u','test1');await A.fill('#li-p','prova123');await A.click('[data-a="doLogin"]');
ok(await wait(A,()=>S.me==='test_u1'&&svOk(D().staff.test_u1),null,15000),'B: dopo «Entra» Luca ha l\'accesso di riserva, senza fare niente '+await A.evaluate(()=>JSON.stringify([S.me,D().staff.test_u1&&[D().staff.test_u1.svh,D().staff.test_u1.svu],$('#toasts').innerText])));
await A.evaluate(()=>logout());await A.waitForTimeout(500);
await A.fill('#li-u','mario');await A.fill('#li-p','prova1234');await A.click('[data-a="doLogin"]');
ok(await wait(A,()=>S.me&&D().staff[S.me].username==='mario'),'B: di nuovo Mario sul telefono A');

// C. telefono di Luca svuotato
const W=await mk(CFG);await W.goto('http://localhost:8765/index.html');
ok(await wait(W,()=>!!document.querySelector('.sv-in [data-a="svEnter"]'),null,15000),'C: telefono svuotato: «Avevi già l\'app?» con «Rientra»');
t=await txt(W);
ok(/Avevi già l'app\?/.test(t)&&/È la prima volta\?/.test(t)&&/Ho già un profilo/.test(t)&&await W.getAttribute('#sv-u','autocomplete')==='username'&&await W.getAttribute('#sv-p','autocomplete')==='current-password','C: due riquadri, campi riempibili dal gestore delle password');
await W.fill('#sv-u','test1');await W.fill('#sv-p','sbagliata1');await W.click('[data-a="svEnter"]');
ok(await wait(W,()=>/non corretti/.test($('#toasts').innerText),null,12000)&&await W.evaluate(()=>!ls('jona_key')&&!S.me),'C: password sbagliata → resta fuori');
await W.fill('#sv-p','prova123');await W.click('[data-a="svEnter"]');
ok(await wait(W,()=>S.db&&S.db.kind==='firebase'&&S.db.status().ready&&S.me==='test_u1'&&meU()&&meU().id==='test_u1',null,25000),'C: password giusta → di nuovo dentro come Luca, senza approvazioni');
ok(await nStaff()===n0,'C: nessun profilo nuovo');
await W.reload();ok(await wait(W,()=>S.db.status().ready&&meU()&&meU().id==='test_u1',null,15000),'C: riaperta, resta nel suo profilo');

// D. il gestore cambia la password di Luca → l'accesso di riserva si aggiorna da solo
const h0=await A.evaluate(()=>D().staff.test_u1.svh);
await A.evaluate(()=>profileSheet('test_u1'));await A.waitForTimeout(400);
await A.fill('.sheet input[data-k="pw"]','nuova5678');await A.fill('.sheet input[data-k="pw2"]','nuova5678');
await A.click('.sheet [data-a="psaveProfile"]');
ok(await wait(A,h=>{const u=D().staff.test_u1;return u.svh&&u.svh!==h&&u.svo===h&&svOk(u)},h0,15000),'D: nuova password → staff.svh nuovo, svo = quello di prima');
const W2=await mk(CFG);await W2.goto('http://localhost:8765/index.html');await wait(W2,()=>!!document.querySelector('.sv-in'),null,15000);
await W2.fill('#sv-u','test1');await W2.fill('#sv-p','prova123');await W2.click('[data-a="svEnter"]');
ok(await wait(W2,()=>/non corretti/.test($('#toasts').innerText),null,12000)&&await W2.evaluate(()=>!S.me),'D: con la password vecchia resta fuori');
await W2.fill('#sv-p','nuova5678');await W2.click('[data-a="svEnter"]');
ok(await wait(W2,()=>S.db&&S.db.status().ready&&S.me==='test_u1',null,25000),'D: con la password nuova rientra come Luca');
ok(await nStaff()===n0,'D: nessun profilo nuovo');

// E. registrazione: la richiesta porta l'accesso di riserva, copiato nel profilo solo se il nome utente resta quello
ok(await A.evaluate(()=>{const st=D().staff;const a=phStaff({sid:'x1',nome:'Anna',username:'anna',pass:'p',svh:'h1',svu:'anna'},st,'');const c=phStaff({sid:'x2',nome:'Luca',username:'test1',pass:'p',svh:'h2',svu:'test1'},st,'');
  return a.svh==='h1'&&a.svu==='anna'&&c.username!=='test1'&&!('svh' in c)}),'E: phStaff copia svh solo se il nome utente non cambia');

// F. Email/password spento in Firebase: messaggio chiaro, niente striscia
const W3=await mk(CFG);await W3.ctx.route('**/accounts:signInWithPassword**',r=>r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{code:400,message:'OPERATION_NOT_ALLOWED',errors:[{message:'OPERATION_NOT_ALLOWED',domain:'global',reason:'invalid'}]}})}));
await W3.goto('http://localhost:8765/index.html');await wait(W3,()=>!!document.querySelector('.sv-in'),null,15000);
await W3.fill('#sv-u','test1');await W3.fill('#sv-p','nuova5678');await W3.click('[data-a="svEnter"]');
ok(await wait(W3,()=>/non è ancora attivo/.test($('#toasts').innerText),null,12000),'F: «Il rientro con la password non è ancora attivo: usa il QR code» '+await toasts(W3));
ok(await W3.evaluate(async()=>{ls('jona_sv_on',null);return await svProbe()===false&&!svNeed()}),'F: la prova del giorno vede «spento» e la striscia non compare');

for(const [n,p] of [['A',A],['W',W],['W2',W2],['W3',W3]])ok(p.errs.length===0,n+': nessun errore '+p.errs.join(' | '));
await b.close();
