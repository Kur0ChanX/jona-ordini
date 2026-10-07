// Chat con l'emulatore: regole senza «messaggi» (l'app non si blocca, la chat spiega come attivarla), poi regole nuove:
// messaggi tra due telefoni, avviso, letti con le spunte, documento «letti» annidato.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const RULES=readFileSync(new URL('../firebase/firestore.rules',import.meta.url),'utf8');
const setRules=async txt=>{for(const p of ['demo-jona','jona-ordini'])await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${p}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{content:txt}]}})})};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await setRules(RULES.replace(", 'messaggi'",''));
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
// regole vecchie: la chat dice come attivarla, l'app continua a funzionare
await A.click('[data-a="chatOpen"]');await A.waitForTimeout(2500);
ok(await A.locator('.cht-off').count()===1,'regole senza «messaggi»: la chat spiega come attivarla');
await A.evaluate(()=>chClose());
await A.evaluate(()=>put('config','app',Object.assign({},cfg(),{nomeLocale:'Jona prova chat'})));await wait(2000);
ok(await A.evaluate(()=>S.db.status().ready&&!S.db.status().err&&cfg().nomeLocale==='Jona prova chat'),'il resto dell\'app non si blocca');
// regole nuove
await setRules(RULES);await A.evaluate(()=>{CHAT.retry=0;CHAT.on=false;render()});await wait(2500);
ok(await A.evaluate(()=>CHAT.on&&!CHAT.err),'regole nuove: la chat si collega');
const B=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"]');await B.waitForTimeout(2500);
ok(await B.evaluate(()=>meU()&&meU().id==='test_u1'&&CHAT.on),'B entra come Luca e la chat è collegata');
// A scrive a tutti
await A.click('[data-a="chatOpen"]');await A.waitForTimeout(500);await A.click('.cht-it[data-c="tutti"]');await A.waitForTimeout(400);
await A.fill('#ch-ta','Buongiorno a tutti');await A.keyboard.press('Enter');await wait(2500);
ok(await B.evaluate(()=>CHAT.msgs.some(m=>m.c==='tutti'&&m.t==='Buongiorno a tutti')),'B riceve il messaggio');
ok((await B.locator('#toasts').innerText()).includes('Buongiorno a tutti'),'B: avviso in app');
ok((await B.locator('[data-a="chatOpen"] .dot').innerText())==='1','B: 1 non letto');
// B risponde in privato
const dmc=await A.evaluate(()=>chDm(realU().id,'test_u1'));
await B.click('[data-a="chatOpen"]');await B.waitForTimeout(500);await B.click('[data-a="chPick"]');await B.waitForTimeout(300);
await B.click(`.cht-it[data-c="${dmc}"]`);await B.waitForTimeout(300);
await B.fill('#ch-ta','Ciao Mario, il forno fa E12');await B.keyboard.press('Enter');await wait(2500);
ok(await B.locator('.cht-b.me .tk').count()===1&&await B.locator('.cht-b.me .ic.tk').count()===0,'B: messaggio arrivato al server (spunte, non più orologio)');
await A.click('[data-a="chBack"]');await A.waitForTimeout(300);await A.click(`.cht-it[data-c="${dmc}"]`);await wait(2500);
ok(await B.locator('.cht-b.me .tk.rd').count()===1,'A legge: spunte blu sul telefono di B');
const L=await A.evaluate(async()=>{const d=await fbInit().fs.doc('messaggi/letti').get({source:'server'});return d.data()});
ok(L&&L.test_u1&&L.test_u1[dmc]>0&&!Object.keys(L).some(k=>k.includes('.')),'server: «letti» annidato per persona e chat');
// v27: A reagisce al messaggio di B, B la vede; A la toglie (campo cancellato sul server)
const mid=await A.evaluate(c=>CHAT.msgs.find(m=>m.c===c).id,dmc);
await A.click(`.cht-b[data-id="${mid}"] p`,{button:'right'});await A.waitForTimeout(200);await A.click('.cht-rb [data-v="👍"]');await wait(2500);
ok((await B.locator(`.cht-b[data-id="${mid}"] .cht-rx`).innerText()).includes('👍'),'B vede la reazione 👍 di A');
const r1=await A.evaluate(async id=>(await fbInit().fs.doc('messaggi/'+id).get({source:'server'})).data().r,mid);
ok(r1&&Object.values(r1).join()==='👍','server: r.<persona> = 👍');
await A.click(`.cht-b[data-id="${mid}"] .cht-rx button`);await wait(2500);
ok(await B.locator(`.cht-b[data-id="${mid}"] .cht-rx`).count()===0,'A la toglie: sparisce anche su B');
const r2=await A.evaluate(async id=>(await fbInit().fs.doc('messaggi/'+id).get({source:'server'})).data().r,mid);
ok(r2&&Object.keys(r2).length===0,'server: reazione cancellata, non «null»');
const n=await A.evaluate(async()=>(await fbInit().fs.collection('messaggi').where('creato','>',0).get({source:'server'})).size);
ok(n===2,'server: 2 messaggi');
ok(A.errs.length===0&&B.errs.length===0,'nessun errore '+A.errs.concat(B.errs).join(' | '));
await b.close();
