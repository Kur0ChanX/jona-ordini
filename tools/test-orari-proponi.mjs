// v105 (D33, scelta di Mario #124: «la scelta 1 ma selezionabile, i turni si fanno manuali senza aiuto, ma attivabile»):
// «Proponi la settimana» = funzione «proponi» spenta di partenza. Accesa: copia la settimana prima, ferie/malattia/permessi
// vecchi lasciati vuoti, assenze già messe in questa settimana tenute, riposi copiati. Su PC, Android, tablet, Mac, iPhone, iPad.
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
import { oraFissa } from './ora-fissa.mjs';
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const DEV=[['chromium','Desktop Chrome'],['chromium','Pixel 7'],['chromium','Galaxy Tab S4'],['webkit','Desktop Safari'],['webkit','iPhone 15'],['webkit','iPad (gen 7)']];
const C='18:00-23:00',P='10:00-15:00';
for(const [br,dev] of DEV){
  if(br==='webkit'&&!WK){if(process.env.CI)ok(false,dev+': WebKit non installato su GitHub');else console.log('SALTATA '+dev+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=await (br==='webkit'?webkit:chromium).launch(br==='webkit'?{}:{executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({...devices[dev],serviceWorkers:'block'});
  await oraFissa(ctx);
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  const wait=ms=>pg.waitForTimeout(ms),T=m=>dev+': '+m;
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
  await pg.evaluate(async([C,P])=>{
    const c={ore:40,pausa:30,liberi:1},M=(id,rep)=>put('staff',id,{id,nome:id[0].toUpperCase()+id.slice(1),cognome:'T',username:id,ruolo:'staff',reparto:rep,stato:'attivo',contratto:c,creato:1});
    await M('luca','sala');await M('anna','sala');await M('gino','cucina');
    const l1=orShift(orLun(),1),l0=orLun();
    await put('config','orari_'+l0,{tipo:'orari',lun:l0,mod:now(),t:{
      luca:{0:C,1:'R',2:C,3:C,4:C,5:C,6:C},anna:{0:C,1:C,2:'R',3:'F',4:C,5:C,6:C},gino:{0:'M',1:'P',2:P,3:P,4:P,5:'R',6:P}}});
    await put('config','orari_'+l1,{tipo:'orari',lun:l1,mod:now(),t:{luca:{4:P},anna:{5:'F'}}});
    S.orW=l1},[C,P]);
  const open=async()=>{await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(200);await pg.evaluate(()=>{const l=S.orW;S.tab='staff';S.staffSub='orari';S.orRep='';S.orW=l;render()});await wait(300)};
  await open();

  // 1. spenta di partenza: niente pulsante, «Copia settimana prima» resta
  ok(await pg.evaluate(()=>funzOn('proponi'))===false,T('funzione «proponi» spenta di partenza'));
  ok(await pg.locator('[data-a="orProp"]').count()===0,T('spenta: niente pulsante «Proponi la settimana»'));
  ok(await pg.locator('[data-a="orCopy"]').count()===1,T('«Copia settimana prima» c\'è sempre'));

  // 2. accesa: il pulsante compare
  await pg.evaluate(async()=>{await put('config','app',Object.assign({},cfg(),{funz:{proponi:true}}));render()});await wait(300);
  const btn=pg.locator('[data-a="orProp"]');
  ok(await btn.count()===1&&/Proponi la settimana/.test(await btn.innerText()),T('accesa: pulsante «Proponi la settimana»'));

  // 3. la settimana ha già un turno: chiede prima; Annulla non cambia niente
  await btn.click();await wait(300);
  ok(await pg.locator('#ask-ok').count()===1,T('turni già messi: chiede prima di sostituire'));
  await pg.click('.sheet [data-a="closeSheet"].btn');await wait(300);
  ok(await pg.evaluate(()=>JSON.stringify(orWeek(S.orW).t.luca))===JSON.stringify({4:P}),T('Annulla: settimana invariata'));

  // 4. conferma: proposta come da regole
  await pg.locator('[data-a="orProp"]').click();await wait(300);await pg.click('#ask-ok');await wait(500);
  const w=await pg.evaluate(()=>orWeek(S.orW));
  ok(JSON.stringify(w.t.luca)===JSON.stringify({0:C,1:'R',2:C,3:C,4:C,5:C,6:C}),T('Luca: settimana prima copiata, riposo compreso'));
  ok(JSON.stringify(w.t.anna)===JSON.stringify({0:C,1:C,2:'R',4:C,5:'F',6:C}),T('Anna: ferie vecchie vuote, ferie di questa settimana tenute: '+JSON.stringify(w.t.anna)));
  ok(JSON.stringify(w.t.gino)===JSON.stringify({2:P,3:P,4:P,5:'R',6:P}),T('Gino: malattia e permesso vecchi vuoti'));
  ok(!w.tp,T('resta bozza (non pubblicata)'));
  const toast=await pg.locator('.toast').last().innerText().catch(()=>'');
  ok(/3 giorni di ferie\/malattia\/permesso/.test(toast),T('avviso con i 3 giorni lasciati vuoti: '+toast.replace(/\n/g,' ')));

  // 5. settimana prima vuota: avviso, niente scritto
  await pg.evaluate(()=>{S.orW=orShift(orLun(),3);render()});await wait(300);
  await pg.locator('[data-a="orProp"]').click();await wait(400);
  ok(await pg.evaluate(()=>!orWeek(S.orW)),T('settimana prima vuota: niente proposta'));

  // 6. staff: niente pulsante
  await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
  ok(await pg.locator('[data-a="orProp"]').count()===0,T('lo staff non vede il pulsante'));
  ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),T('niente scorrimento laterale'));
  ok(!errs.length,T('nessun errore: '+errs.join(' | ')));
  await b.close();
}
