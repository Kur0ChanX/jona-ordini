// v25 (con l'emulatore): Wi-Fi che trattiene le scritture di Firestore (come UniFi con i filtri). Se un messaggio non viene
// confermato in 4 s l'app passa al long polling e si ricarica dopo la conferma; il messaggio arriva lo stesso. Avviso nella chat.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const B=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"]');await B.waitForTimeout(2500);
ok(await B.evaluate(()=>!!meU()&&CHAT.on&&!ls('jona_fb_lp')),'B entra, collegamento normale');
await B.click('[data-a="chatOpen"]');await B.waitForTimeout(500);await B.click('.cht-it[data-c="tutti"]');await B.waitForTimeout(400);
ok(/Usa questa chat in modo responsabile e solo per lavoro/.test(await B.locator('#ch-m').innerText()),'avviso «solo per lavoro» nella conversazione');
// rete veloce: nessun cambio
await B.fill('#ch-ta','primo veloce');await B.keyboard.press('Enter');await B.waitForTimeout(5000);
ok(await B.evaluate(()=>!ls('jona_fb_lp')),'rete veloce: resta il collegamento normale');
// Wi-Fi che trattiene le scritture 6 s
let slow=true;
await B.context().route(/Firestore\/Write\/channel/,async r=>{if(slow)await new Promise(x=>setTimeout(x,6000));r.continue().catch(()=>{})});
await B.fill('#ch-ta','dal wifi lento');await B.keyboard.press('Enter');
await B.waitForTimeout(4800);
ok(/rallenta i messaggi/.test(await B.locator('#toasts').innerText()),'dopo 4 s: avviso «questa rete Wi-Fi rallenta i messaggi»');
ok(await B.evaluate(()=>ls('jona_fb_lp'))===1,'long polling attivato');
// v35: niente ricarica automatica, avviso «App da aggiornare»; ricarica solo con «Aggiorna ora»
await B.evaluate(()=>{window.__noReload=1});await B.waitForTimeout(6000);slow=false;
ok(await B.evaluate(()=>window.__noReload===1&&S.upd===1),'nessuna ricarica automatica: avviso «App da aggiornare»');
ok(await A.evaluate(()=>CHAT.msgs.some(m=>m.t==='dal wifi lento')),'il messaggio lento è arrivato ad A');
await B.evaluate(()=>{while(sheets.length)closeSheet(true);const x=document.querySelector('.cht.open [data-a="chatClose"]');if(x)x.click()});await B.waitForTimeout(400);
await Promise.all([B.waitForURL(/index\.html/,{waitUntil:'load',timeout:20000}),B.evaluate(()=>document.querySelector('[data-a="reload"]').click())]);await B.waitForTimeout(6000);
ok(await B.evaluate(()=>!!fbInit.lp&&S.db.status().ready&&!!meU()),'«Aggiorna ora»: long polling, stesso profilo');
await B.click('[data-a="chatOpen"]');await B.waitForTimeout(500);await B.click('.cht-it[data-c="tutti"]');await B.waitForTimeout(400);
const t0=Date.now();await B.fill('#ch-ta','dopo il cambio');await B.keyboard.press('Enter');
await A.waitForFunction(()=>CHAT.msgs.some(m=>m.t==='dopo il cambio'),null,{timeout:10000});
ok(Date.now()-t0<3000,'dopo il cambio i messaggi partono subito ('+(Date.now()-t0)+' ms)');
// testo in chat: niente ricarica, vale alla prossima apertura
const C=await mk(null);await C.goto(await A.evaluate(()=>inviteLink()));await C.waitForTimeout(5000);
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await C.waitForTimeout(4000);
await C.fill('input[data-k="u"]','test2');await C.fill('input[data-k="p"]','prova123');await C.click('[data-a="doLogin"]');await C.waitForTimeout(2500);
await C.click('[data-a="chatOpen"]');await C.waitForTimeout(500);await C.click('.cht-it[data-c="tutti"]');await C.waitForTimeout(400);
await C.context().route(/Firestore\/Write\/channel/,async r=>{await new Promise(x=>setTimeout(x,6000));r.continue().catch(()=>{})});
await C.evaluate(()=>{window.__noReload=1});
await C.fill('#ch-ta','scrivo mentre');await C.keyboard.press('Enter');await C.waitForTimeout(500);await C.fill('#ch-ta','sto ancora scrivendo');
await C.waitForTimeout(4200);const toastC=await C.locator('#toasts').innerText();await C.waitForTimeout(4800);
ok(await C.evaluate(()=>window.__noReload===1&&ls('jona_fb_lp')===1&&$('#ch-ta').value==='sto ancora scrivendo'),'testo in chat: non ricarica, cambio alla prossima apertura');
ok(/chiudi e riapri/.test(toastC),'avviso «chiudi e riapri l\'app»');
for(const [n,p] of [['A',A],['B',B],['C',C]])ok(p.errs.length===0,n+': nessun errore '+p.errs.join(' | '));
await b.close();
