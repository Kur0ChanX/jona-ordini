// v40 (con l'emulatore): invito WhatsApp monouso con profilo pronto (punto 4) e «Entrata libera» per 48 ore. Chiusa: il telefono nuovo resta in attesa. Aperta da Impostazioni:
// il telefono nuovo entra da solo e crea il suo profilo. Regole: in attesa non apre la porta né si approva a porta chiusa,
// nessuno la apre oltre 49 ore. Chiusa di nuovo: si torna ad approvare.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const RULES=readFileSync(new URL('../firebase/firestore.rules',import.meta.url),'utf8');
for(const p of ['demo-jona','jona-ordini'])await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${p}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{content:RULES}]}})});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
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
const nuovo=async(P,nome,cognome)=>{await P.click('[data-a="phNew"]');await P.waitForTimeout(300);
  for(const [k,v] of [['nome',nome],['cognome',cognome]])await P.locator(`.sheet input[data-k="${k}"]`).pressSequentially(v);
  for(const k of ['pw','pw2'])await P.fill(`.sheet input[data-k="${k}"]`,'segreto1');
  await P.click('.sheet [data-a="phSend"]');await P.waitForTimeout(4000)};

// 1. porta chiusa: si resta in attesa, e in attesa non si apre la porta
await A.evaluate(()=>settingsSheet());await A.waitForTimeout(1500);
ok(/Entrata libera/.test(await txt(A,'.sheet'))&&/Chiusa/.test(await txt(A,'.sheet')),'A: Impostazioni mostra «Entrata libera» chiusa');
const B=await mk(null);await B.goto(link);await B.waitForTimeout(5000);
const bp=await B.evaluate(async()=>{const fs=fbInit().fs;try{await fs.doc('pubblico/porta').set({fino:Date.now()+3600e3});return'scritto'}catch(e){return e.code}});
ok(bp==='permission-denied','regole: in attesa non apre la porta');
await nuovo(B,'Gianni','Loi');
ok(/Richiesta inviata/.test(await txt(B))&&await B.evaluate(()=>!S.db.status().ready),'B: porta chiusa, resta in attesa');

// 2. A apre per 48 ore
await A.click('.sheet [data-a="ptSet"][data-v="48"]');await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(2000);
ok(/Aperta fino a/.test(await txt(A,'.sheet')),'A: «Aperta fino a…»');
const far=await A.evaluate(async()=>{try{await fbInit().fs.doc('pubblico/porta').set({fino:Date.now()+100*3600e3});return'scritto'}catch(e){return e.code}});
ok(far==='permission-denied','regole: niente porta aperta oltre 49 ore');
const C=await mk(null);await C.goto(link);await C.waitForTimeout(5000);
await nuovo(C,'Lia','Sanna');
ok(await C.evaluate(()=>S.db.status().ready&&meU()&&meU().username==='lia.sanna'),'C: entra da solo come Lia');
ok(await A.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='lia.sanna');return u&&u.stato==='attivo'&&u.ruolo==='staff'&&u.creatoDa==='porta'}),'A: profilo di Lia creato (staff, attivo)');
ok(await C.evaluate(async()=>{const d=(await fbInit().fs.doc('membri/'+fbInit().auth.currentUser.uid).get({source:'server'})).data();return d.ok===true&&d.da==='porta'&&!d.req}),'C: membro approvato dalla porta, richiesta tolta');
// chi era già in attesa resta da approvare a mano
ok(await A.evaluate(()=>phPend().some(x=>x.req.nome==='Gianni')),'B (in attesa da prima) resta in «Telefoni da approvare»');

// 3. A chiude: si torna ad approvare
await A.click('.sheet [data-a="ptSet"][data-v="0"]');await A.waitForTimeout(2000);
ok(/Chiusa/.test(await txt(A,'.sheet')),'A: entrata chiusa');
const E=await mk(null);await E.goto(link);await E.waitForTimeout(5000);
await nuovo(E,'Ugo','Pisu');
ok(/Richiesta inviata/.test(await txt(E))&&await E.evaluate(()=>!S.db.status().ready),'E: porta chiusa di nuovo, resta in attesa');
const self=await E.evaluate(async()=>{try{await fbInit().fs.doc('membri/'+fbInit().auth.currentUser.uid).update({ok:true,da:'porta'});return'scritto'}catch(e){return e.code}});
ok(self==='permission-denied','regole: a porta chiusa non si approva da solo');
// 4. invito WhatsApp monouso con profilo pronto (porta chiusa)
await A.evaluate(()=>{closeSheet();S.tab='staff';render()});await A.waitForTimeout(500);
await A.click('[data-a="addProfile"]');await A.waitForTimeout(300);
ok(/La sceglie lui/.test(await txt(A,'.sheet'))&&await A.locator('.sheet input[data-k="pw"]').count()===0,'A: «Aggiungi» parte con la password scelta da lui (niente campo password)');
for(const [k,v] of [['nome','Rita'],['cognome','Piras']])await A.locator(`.sheet input[data-k="${k}"]`).pressSequentially(v);
await A.click('.sheet [data-a="addGo"]');await A.waitForTimeout(3000);
ok(/Invito pronto/.test(await txt(A,'.sheet')),'A: scheda «Invito pronto»');
const wa=await A.locator('.sheet a[href^="https://wa.me/"]').getAttribute('href');
const msg=decodeURIComponent(wa.split('text=')[1]);
const tk=(msg.match(/[#&]t=([A-Za-z0-9]{20,64})/)||[])[1];
ok(!!tk&&/rita\.piras/.test(msg),'A: messaggio WhatsApp con nome utente e gettone');
ok(await A.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='rita.piras');return u&&u.stato==='invitato'&&!u.pass}),'A: profilo di Rita «invitato», senza password');
// senza gettone non si attiva il profilo né ci si approva
const F=await mk(null);await F.goto(link);await F.waitForTimeout(5000);
const fz=await F.evaluate(async t=>{const fs=fbInit().fs,uid=fbInit().auth.currentUser.uid;const r={};
  try{await fs.doc('membri/'+uid).update({ok:true,da:'invito',tk:'X'.repeat(32)});r.a='scritto'}catch(e){r.a=e.code}
  try{const b=fs.batch();b.update(fs.doc('membri/'+uid),{ok:true,da:'invito',tk:t});await b.commit();r.b='scritto'}catch(e){r.b=e.code}
  return r},tk);
ok(fz.a==='permission-denied'&&fz.b==='permission-denied','regole: gettone falso o senza consumare l\'invito → niente');
// R apre il link: sceglie la password ed entra
const R=await mk(null);await R.goto(link+'&t='+tk);await R.waitForTimeout(6000);
ok(/Ciao Rita/.test(await txt(R))&&/rita\.piras/.test(await txt(R)),'R: «Ciao Rita!» con il nome utente');
await R.fill('#it-pw','segreto9');await R.fill('#it-pw2','segreto9');await R.click('[data-a="itGo"]');await R.waitForTimeout(6000);
ok(await R.evaluate(()=>S.db.status().ready&&meU()&&meU().username==='rita.piras'&&meU().stato==='attivo'),'R: entra subito come Rita');
ok(await R.evaluate(async t=>{const fs=fbInit().fs;const m=(await fs.doc('membri/'+fbInit().auth.currentUser.uid).get({source:'server'})).data();return m.ok===true&&m.da==='invito'&&!(await fs.doc('inviti/'+t).get({source:'server'})).exists},tk),'R: membro approvato, invito consumato');
ok(await A.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='rita.piras');return u&&u.stato==='attivo'&&!!u.pass}),'A: Rita attiva con la sua password');
// G riapre lo stesso link: già usato
const G=await mk(null);await G.goto(link+'&t='+tk);await G.waitForTimeout(6000);
ok(/già usato/.test(await txt(G))&&await G.evaluate(()=>!S.db.status().ready),'G: lo stesso link una seconda volta → «già usato», resta fuori');
await G.click('[data-a="itSkip"]');await G.waitForTimeout(500);
ok(/Sono nuovo/.test(await txt(G)),'G: «Chiedi l\'approvazione» torna alla richiesta normale');
// nuovo link: quello vecchio smette di valere
await A.click('[data-a="addProfile"]');await A.waitForTimeout(300);
for(const [k,v] of [['nome','Tea'],['cognome','Melis']])await A.locator(`.sheet input[data-k="${k}"]`).pressSequentially(v);
await A.click('.sheet [data-a="addGo"]');await A.waitForTimeout(3000);
const tk1=decodeURIComponent((await A.locator('.sheet a[href^="https://wa.me/"]').getAttribute('href')).split('text=')[1]).match(/[#&]t=([A-Za-z0-9]+)/)[1];
const tea=await A.evaluate(()=>Object.values(D().staff).find(x=>x.username==='tea.melis').id);
await A.evaluate(id=>{closeSheet();invMonoSend(id)},tea);await A.waitForTimeout(3000);
const tk2=decodeURIComponent((await A.locator('.sheet a[href^="https://wa.me/"]').getAttribute('href')).split('text=')[1]).match(/[#&]t=([A-Za-z0-9]+)/)[1];
ok(tk1!==tk2&&await A.evaluate(async([a,b])=>{const fs=fbInit().fs;return!(await fs.doc('inviti/'+a).get({source:'server'})).exists&&(await fs.doc('inviti/'+b).get({source:'server'})).exists},[tk1,tk2]),'A: «Nuovo link d\'invito» cancella quello vecchio');
for(const [n,p] of [['A',A],['B',B],['C',C],['E',E],['F',F],['R',R],['G',G]])ok(p.errs.length===0,n+': nessun errore '+p.errs.join(' | '));
await b.close();
