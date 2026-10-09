// v61 (modalità locale): agenda alla persona giusta. «Persone» in «Chi lo vede», «Avvisa subito», «visto da x/y», «Per te in agenda» con «Ok, visto»,
// ricompare se l'evento cambia (non per le spunte), appunto → informazione a qualcuno, destinatari dei reparti, piano push solo ai destinatari, 320 px.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
const closeAll=async()=>{await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await wait(150)};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(async()=>{await put('config','app',Object.assign({},cfg(),{funz:{agenda:true}}));
  const P=(id,nome,ruolo,reparto)=>put('staff',id,{id,nome,cognome:'Test',username:id,ruolo,reparto,stato:'attivo',creato:1});
  await P('maurizio','Maurizio','gm','cucina');await P('luca','Luca','staff','cucina');await P('anna','Anna','staff','sala');await P('mauro','Mauro','staff','fb');
  await put('staff','vecchio',{id:'vecchio',nome:'Vecchio',cognome:'Test',ruolo:'staff',reparto:'sala',stato:'disattivo'})});
await wait(400);
const me=await pg.evaluate(()=>realU().id),oggi=await pg.evaluate(()=>today());

// 1. modulo: «Persone»
await pg.evaluate(()=>agOpen());await wait(300);await pg.click('[data-a="agNew"]');await wait(300);
ok(await pg.locator('.sheet [data-a="agfSet"][data-k="vis"]').count()===4,'«Chi lo vede»: Solo io, Tutti, Reparti, Persone');
await pg.click('.sheet [data-a="agfSet"][data-k="vis"][data-v="pers"]');await wait(200);
const nomi=await pg.locator('.sheet [data-a="agfPer"]').allInnerTexts();
ok(nomi.length===4&&!nomi.some(n=>/Mario|Vecchio/.test(n)),'Persone: i 4 profili attivi, non io né i disattivati '+JSON.stringify(nomi));
ok(await pg.locator('.sheet [data-a="agfSub"][data-v="1"][aria-pressed="true"]').count()===1,'«Avvisa subito»: Sì di partenza');
await pg.fill('#agf-t','Chiamare il commercialista');await pg.fill('#agf-h','16:00');
await pg.click('[data-a="agSave"]');await wait(300);
ok(/Scegli almeno una persona/.test(await txt('#toasts')),'senza persone: avviso');
await pg.click('.sheet [data-a="agfPer"][data-v="maurizio"]');await wait(150);
await pg.click('[data-a="agSave"]');await wait(500);
const e1=await pg.evaluate(()=>{const e=agAll().find(x=>x.t==='Chiamare il commercialista');return e&&{id:e.id,vis:e.vis,per:e.per,doc:e.doc}});
ok(e1&&e1.vis==='pers'&&e1.per.join()==='maurizio','evento salvato per «Persone: Maurizio» '+JSON.stringify(e1));
const see=await pg.evaluate(id=>{const e=agGet(id),st=D().staff;return['maurizio','luca','anna','mauro'].map(k=>agSee(e,st[k])?1:0).join('')},e1.id);
ok(see==='1000','lo vede solo Maurizio (non gli altri gestori né lo staff): '+see);
const n1=await pg.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='agenda').map(n=>n.a+'|'+n.titolo));
ok(n1.length===1&&n1[0]==='maurizio|Nuovo in agenda: Chiamare il commercialista','«Avvisa subito»: notifica solo a Maurizio '+JSON.stringify(n1));
let T=await txt('.sheet');ok(/Maurizio/.test(T)&&/visto da 0\/1/.test(T),'riga: «Maurizio» e «visto da 0/1»');

// 2. visto
await pg.evaluate(async e=>{await upd('config',e.doc,{['e.'+e.id+'.visto.maurizio']:now()})},e1);await wait(300);
ok(/visto da 1\/1/.test(await txt('.sheet')),'dopo «Ok, visto» di Maurizio: «visto da 1/1»');
await pg.click(`.sheet [data-a="agEdit"][data-v="${e1.id}"]`);await wait(300);
ok(/Visto da 1 su 1/.test(await txt('.sheet'))&&await pg.locator('.sheet [data-a="agfSub"][data-v="0"][aria-pressed="true"]').count()===1,'modulo: «Visto da 1 su 1»; in modifica «Avvisa subito» parte da No');
await pg.evaluate(()=>closeSheet(true));await wait(200);

// 3. reparti: destinatari solo del reparto; «No» = nessuna notifica
await pg.click('[data-a="agNew"]');await wait(300);
await pg.fill('#agf-t','Pulizia celle frigo');await pg.click('.sheet [data-a="agfSet"][data-k="vis"][data-v="rep"]');await wait(150);
await pg.click('.sheet [data-a="agfRep"][data-v="cucina"]');await pg.click('.sheet [data-a="agfSub"][data-v="0"]');await wait(150);
await pg.click('[data-a="agSave"]');await wait(500);
ok(await pg.evaluate(()=>{const e=agAll().find(x=>x.t==='Pulizia celle frigo');return agDest(e).map(u=>u.id).sort().join()})==='luca,maurizio','reparto cucina: destinatari Luca e Maurizio');
ok(await pg.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='agenda').length)===1,'«Avvisa subito: No»: nessuna notifica in più');

// 4. piano per il server: avvisi solo alle iscrizioni dei destinatari
const pl=await pg.evaluate(async id=>{PUSH.subs={s1:{u:'maurizio',sub:{endpoint:'e-maurizio'}},s2:{u:'luca',sub:{endpoint:'e-luca'}},s3:{u:'anna',sub:{endpoint:'e-anna'}}};
  const e=agGet(id),ev=Object.assign({},e);delete ev.id;delete ev.doc;ev.g=today();ev.h='23:59';ev.av=[0];await agPut(e.doc,{[id]:ev});await new Promise(r=>setTimeout(r,300));
  const p=JSON.parse(agPlan());PUSH.subs={};return p.ev.filter(x=>x.t==='Chiamare il commercialista').map(x=>x.subs.map(s=>s.endpoint).join())},e1.id);
ok(pl.length===1&&pl[0]==='e-maurizio','piano per il server: l\'avviso va solo a Maurizio '+JSON.stringify(pl));
await closeAll();

// 5. «Per te in agenda»: evento scritto da un altro per me
await pg.evaluate(async o=>{await agPut('agenda_'+o.slice(0,7),{xx1:{k:'ev',t:'Degustazione con il sommelier',g:agAdd(o,1),h:'18:00',cop:0,note:'',vis:'pers',per:[realU().id],rep:[],da:'maurizio',cr:1,mod:now(),r:'',av:[],cl:[{t:'Bicchieri',ok:false}]}})},oggi);
await wait(400);
T=await txt('.ag-strip');ok(/Per te in agenda/.test(T)&&/domani 18:00 · Degustazione con il sommelier/.test(T),'striscia «Per te in agenda: domani 18:00 · Degustazione…» '+T);
await pg.click('.ag-strip [data-a="agVistoOk"]');await wait(500);
ok(!/Per te in agenda/.test(await pg.locator('#app').innerText())&&await pg.evaluate(id=>agVisto(agGet('xx1'),id),me),'«Ok, visto»: striscia sparita, visto salvato');
// spunta: non ricompare
await pg.evaluate(()=>agOpen());await wait(200);await pg.evaluate(()=>{S.ag.v='sett';refreshSheet()});await wait(200);
await pg.evaluate(async()=>{await A.agCk({v:'xx1|0'})});await wait(400);await closeAll();
ok(!/Per te in agenda/.test(await pg.locator('#app').innerText()),'spunta di una cosa da fare: la striscia non ricompare');
// cambiato: ricompare
await pg.evaluate(async()=>{const e=agGet('xx1'),ev=Object.assign({},e);delete ev.id;delete ev.doc;ev.h='19:00';ev.mod=now()+1;await agPut(e.doc,{xx1:ev})});await wait(400);
ok(/Per te in agenda/.test(await txt('.ag-strip'))&&/19:00/.test(await txt('.ag-strip')),'evento cambiato: la striscia ricompare');
await pg.click('.ag-strip [data-a="agOpenG"]');await wait(400);
ok(await pg.evaluate(o=>S.ag&&S.ag.g===agAdd(o,1),oggi)&&/Degustazione con il sommelier/.test(await txt('.sheet')),'tocco sulla striscia: agenda aperta sul giorno dell\'evento');
await closeAll();

// 6. appunto → informazione a qualcuno
await pg.evaluate(()=>agOpen());await wait(300);
await pg.fill('#ag-nt','Ricordare a Luca le uova');await pg.press('#ag-nt','Enter');await wait(300);
await pg.click('.sheet [data-a="agNtSend"][data-v="0"]');await wait(300);
ok(await pg.locator('#agf-t').inputValue()==='Ricordare a Luca le uova'&&await pg.locator('.sheet [data-a="agfK"][data-v="info"][aria-pressed="true"]').count()===1&&await pg.locator('.sheet [data-a="agfSet"][data-v="pers"][aria-pressed="true"]').count()===1,'appunto → modulo «Informazione» per «Persone» con il testo dell\'appunto');

// 7. 320 px
await pg.setViewportSize({width:320,height:700});await wait(300);
ok(await pg.evaluate(()=>{const s=document.querySelector('.sheet');return s.scrollWidth<=s.clientWidth+1}),'modulo con Persone a 320 px senza scorrimento orizzontale');
await closeAll();
await pg.evaluate(async o=>{const e=agGet('xx1'),ev=Object.assign({},e);delete ev.id;delete ev.doc;ev.mod=now()+5;await agPut(e.doc,{xx1:ev})},oggi);await wait(300);
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'striscia «Per te in agenda» a 320 px senza scorrimento orizzontale');
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
