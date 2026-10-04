// Orari con l'emulatore: «t.<persona>» su Firestore cambia solo quella persona, pubblicazione, notifica e vista dello staff su un altro telefono.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const B=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"]');await B.waitForTimeout(1500);
ok(await B.evaluate(()=>meU()&&meU().id==='test_u1'),'B entra come Luca (staff)');

// contratti, poi due persone salvate una alla volta
await A.evaluate(async()=>{S.viewAs='gm';S.tab='staff';S.staffSub='orari';S.orW=orLun();
  await upd('staff','test_u1',{contratto:{ore:40,pausa:30,liberi:1}});await upd('staff','test_u2',{contratto:{ore:30,pausa:30,liberi:2}});render()});await wait(1500);
await A.evaluate(()=>orSaveRow(S.orW,'test_u1',{0:'10:00-15:00',1:'10:00-15:00,18:00-23:00',2:'R'}));await wait(1500);
await A.evaluate(()=>orSaveRow(S.orW,'test_u2',{0:'18:00-23:30',3:'F'}));await wait(1500);
await A.evaluate(()=>orSaveRow(S.orW,'test_u1',{0:'10:00-15:00',1:'10:00-15:00,18:00-23:00',2:'R',4:'09:00-17:30'}));await wait(2500);
const srv=await A.evaluate(async()=>{const d=await firebase.firestore().doc('config/orari_'+S.orW).get({source:'server'});return d.data()});
ok(srv&&srv.t&&srv.t.test_u1&&srv.t.test_u1[4]==='09:00-17:30'&&srv.t.test_u2&&srv.t.test_u2[3]==='F','server: t.<persona> aggiornato senza cancellare l\'altra persona');
ok(srv&&!Object.keys(srv).some(k=>k.startsWith('t.')),'server: nessun campo con il punto nel nome');
ok(await A.locator('.or-c[data-u="test_u1"][data-g="4"] .or-b').count()===1,'A: la tabella mostra il turno');
// lo staff non vede la bozza
await B.evaluate(()=>{S.tab='orari';render()});await wait(800);
ok(await B.locator('.or-day').count()===0&&(await B.locator('#app').innerText()).includes('non ancora pronti'),'B: bozza non visibile');
// pubblica dal pulsante
await A.click('[data-a="orPub"]');await wait(600);if(await A.locator('#ask-ok').count())await A.click('#ask-ok');await wait(3000);
ok(await A.evaluate(()=>!!orWeek(S.orW).tp&&orStato(orWeek(S.orW)).k==='ok'),'A: settimana pubblicata');
await wait(1500);
ok(await B.locator('.or-day').count()===7,'B: vede i suoi 7 giorni');
const days=await B.locator('.or-day').allInnerTexts();
ok(days[1].includes('18:00 – 23:00')&&days[2].includes('Riposo')&&days[4].includes('09:00 – 17:30'),'B: turni giusti');
ok(!(await B.locator('#app').innerText()).includes('Ferie'),'B: non vede i turni di Sara');
ok(await B.evaluate(()=>myNotifs(meU()).some(n=>n.tipo==='orari'&&n.titolo.startsWith('Orari pubblicati'))),'B: notifica «Orari pubblicati»');
// modifica e avviso
await A.evaluate(()=>orSaveRow(S.orW,'test_u1',Object.assign({},orWeek(S.orW).t.test_u1,{5:'18:00-23:30'})));await wait(1500);
await A.click('[data-a="orPub"]');await wait(600);if(await A.locator('#ask-ok').count())await A.click('#ask-ok');await wait(3000);
ok(await B.evaluate(()=>myNotifs(meU()).some(n=>n.titolo.startsWith('Orari cambiati')&&n.testo.includes('sabato'))),'B: notifica «Orari cambiati» con il giorno');
ok((await B.locator('.or-day').nth(5).innerText()).includes('18:00 – 23:30'),'B: vede il cambio');
// v16: timbratura (t.<persona>.<giorno>) e cambio turno (cambi.<id>.stato) su Firestore
await A.evaluate(()=>put('config','app',Object.assign({},cfg(),{timbra:true,timbraK:'K123'})));await wait(1500);
await B.evaluate(()=>tbPunch(meU().id,true));await wait(1500);
await B.evaluate(()=>tbPunch(meU().id,false));await wait(2000);
const tb=await A.evaluate(async()=>{const d=await firebase.firestore().doc('config/timbr_'+orLun()).get({source:'server'});return d.data()});
const g0=await A.evaluate(()=>(new Date().getDay()+6)%7);
ok(tb&&tb.t&&tb.t.test_u1&&/^\d\d:\d\d-\d\d:\d\d$/.test(tb.t.test_u1[g0])&&tb.m.test_u1[g0]===1&&!Object.keys(tb).some(k=>k.includes('.')),'server: timbratura annidata, entrata senza QR e uscita');
const L1=await A.evaluate(async()=>{const L=orShift(orLun(),1),t={test_u1:{5:'10:00-15:00'},test_u2:{5:'R',2:'18:00-23:00'}};await put('config','orari_'+L,{tipo:'orari',lun:L,t,tp:clone(t),pub:now(),mod:now()});return L});await wait(2500);
await B.evaluate(async L=>{S.cm={lun:L,g1:5,a:'test_u2',g2:2};await cmSend()},L1);await wait(2500);
const cid=await A.evaluate(L=>Object.keys(orWeek(L).cambi||{})[0],L1);
ok(!!cid,'A vede la richiesta di cambio di B');
await A.evaluate(([L,id])=>cmDecide(L,id,true),[L1,cid]);await wait(2500);
const w1=await A.evaluate(async L=>{const d=await firebase.firestore().doc('config/orari_'+L).get({source:'server'});return d.data()},L1);
ok(w1.cambi[cid].stato==='approvato'&&w1.tp.test_u1[5]==='R'&&w1.tp.test_u2[5]==='10:00-15:00'&&w1.tp.test_u1[2]==='18:00-23:00'&&!Object.keys(w1).some(k=>k.includes('.')),'server: cambio approvato, giornate scambiate');
ok(await B.evaluate(()=>myNotifs(meU()).some(n=>n.tipo==='cambio'&&n.titolo.includes('approvato'))),'B: notifica «Cambio turno approvato»');
ok(A.errs.length===0&&B.errs.length===0,'nessun errore '+A.errs.concat(B.errs).join(' | '));
await b.close();
