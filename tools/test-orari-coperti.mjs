// v91 (D33): coperti dell'agenda nel pianificatore degli orari. Settimana prossima (niente giorni passati), 320 px.
// Giorno normale 50 coperti; in sala 2 persone a cena nei giorni normali; sabato 100 coperti a cena → servono 2×150/50 = 6, ce ne sono 3 → avviso.
// Venerdì 20 coperti a cena → 2×70/50 = 2,8 → 3, ce ne sono 3 → niente avviso. Cucina: 1 a cena, sabato servono 3, venerdì 2 → avvisi (non per l'F&B).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { oraFissa } from './ora-fissa.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:800},serviceWorkers:'block'});
await oraFissa(ctx);
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(async()=>{
  await put('config','app',Object.assign({},cfg(),{funz:{agenda:true}}));
  const c={ore:40,pausa:30,liberi:1},P=(id,rep)=>put('staff',id,{id,nome:id[0].toUpperCase()+id.slice(1),cognome:'T',username:id,ruolo:'staff',reparto:rep,stato:'attivo',contratto:c,creato:1});
  await put('staff','mauro',{id:'mauro',nome:'Mauro',cognome:'Loi',username:'mauro',ruolo:'staff',reparto:'fb',stato:'attivo',contratto:{libero:true},creato:1});
  for(const id of ['luca','anna','sara','piero'])await P(id,'sala');await P('gino','cucina');
  const l=orShift(orLun(),1),C='18:00-23:00',t={luca:{},anna:{},sara:{},piero:{},gino:{}};
  for(const g of [0,1,2,3]){t.luca[g]=C;t.anna[g]=C;t.gino[g]=C}
  t.luca[4]=C;t.anna[4]=C;t.sara[4]=C;t.luca[5]=C;t.anna[5]=C;t.sara[5]=C;t.gino[5]=C;t.gino[4]=C;
  await put('config','orari_'+l,{tipo:'orari',lun:l,t,mod:now()});
  const ev=(id,g,h,cop)=>({k:'ev',t:'Evento '+id,g,h,cop,note:'',vis:'tutti',rep:[],per:[],da:'mauro',cr:1,mod:now(),r:''});
  const sab=today(orDay(l,5)),ven=today(orDay(l,4));
  if(sab.slice(0,7)===ven.slice(0,7))await agPut('agenda_'+sab.slice(0,7),{e1:ev('e1',sab,'20:00',100),e2:ev('e2',ven,'20:30',20)});
  else{await agPut('agenda_'+sab.slice(0,7),{e1:ev('e1',sab,'20:00',100)});await agPut('agenda_'+ven.slice(0,7),{e2:ev('e2',ven,'20:30',20)})}
  S.orW=l});
await wait(300);
const open=async v=>{await pg.click(`[data-a="viewAs"][data-v="${v}"]`);await wait(200);await pg.evaluate(()=>{const l=S.orW;S.tab='staff';S.staffSub='orari';S.orRep='';S.orW=l;render()});await wait(300)};

// 1. senza giorno normale: elenco dei coperti e campo per scriverlo
await open('gm');
let cp=pg.locator('.or-cp');
ok(await cp.count()===1,'gestore: riquadro coperti');
let tx=await cp.innerText();
ok(/Ven \d+ 20/.test(tx)&&/Sab \d+ 100/.test(tx),'coperti per giorno: '+tx.replace(/\n/g,' | '));
ok(await pg.locator('#or-cn').count()===1,'campo «Coperti in un giorno normale»');
await pg.fill('#or-cn','50');await pg.dispatchEvent('#or-cn','input');await pg.click('[data-a="orCnSave"]');await wait(400);
ok(await pg.evaluate(()=>cfg().copNorm)===50,'giorno normale salvato (config/app.copNorm)');

// 2. avvisi del gestore (tutti i reparti)
cp=pg.locator('.or-cp');tx=await cp.innerText();
ok(await pg.locator('.or-cp.w').count()===1,'avviso «Poche persone»');
ok(/Sab \d+ · 100 coperti a cena: Sala 3 in turno, ne servono 6/.test(tx),'sabato sala 3/6: '+tx.replace(/\n/g,' | '));
ok(/Sab \d+ · 100 coperti a cena: Cucina 1 in turno, ne servono 3/.test(tx),'sabato cucina 1/3');
ok(!/Ven \d+ · 20 coperti a cena: Sala/.test(tx),'venerdì sala a posto (3 su 3)');
ok(/Ven \d+ · 20 coperti a cena: Cucina 1 in turno, ne servono 2/.test(tx),'venerdì cucina 1/2');
// riempio la sala di sabato: resta solo la cucina
await pg.evaluate(async l=>{for(const id of ['piero'])await upd('config','orari_'+l,{['t.'+id]:{5:'18:00-23:00'},mod:now()})},await pg.evaluate(()=>S.orW));
await pg.evaluate(()=>render());await wait(300);tx=await pg.locator('.or-cp').innerText();
ok(/Sala 4 in turno, ne servono 6/.test(tx),'contato il turno nuovo');

// 3. F&B Manager (Mauro): solo la sala
await pg.click('[data-a="viewAs"][data-v="fb"]');await wait(200);
await pg.evaluate(()=>{const l=S.orW;S.tab='orari';S.orPl='plan';render();S.orW=l;render()});await wait(300);
tx=await pg.locator('.or-cp').innerText().catch(()=>'');
ok(/Sala 4 in turno, ne servono 6/.test(tx)&&!/Cucina/.test(tx),'F&B: solo la sala: '+tx.replace(/\n/g,' | '));

// 4. settimana passata e funzione agenda spenta: niente riquadro
await open('gm');
await pg.evaluate(()=>{S.orW=orShift(orLun(),-1);render()});await wait(300);
ok(await pg.locator('.or-cp').count()===0,'settimana passata: niente riquadro');
await pg.evaluate(async()=>{S.orW=orShift(orLun(),1);await put('config','app',Object.assign({},cfg(),{funz:{agenda:false}}));render()});await wait(300);
ok(await pg.locator('.or-cp').count()===0,'agenda spenta: niente riquadro');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px: niente scorrimento laterale');
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
