// v83 (modalità locale): orario dei Responsabili (contratto libero) in `resp.<id>` della settimana: righe «Responsabili» nel pianificatore,
// foglio senza controlli, «I miei orari» da compilare, «In turno oggi», striscia «Chi c'è adesso» con «Scrivi» (chat), chi può scrivere, 320 px.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(async()=>{
  await put('staff','mauro',{id:'mauro',nome:'Mauro',cognome:'Loi',username:'mauro',ruolo:'staff',reparto:'fb',stato:'attivo',contratto:{libero:true},creato:1});
  await put('staff','luca',{id:'luca',nome:'Luca',cognome:'Test',username:'luca',ruolo:'staff',reparto:'cucina',stato:'attivo',contratto:{ore:40,pausa:30,liberi:1},creato:1})});
await wait(300);
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.evaluate(()=>{S.tab='staff';S.staffSub='orari';try{localStorage.jona_staffsub='orari'}catch(e){}S.orW=orLun();render()});await wait(300);
const g=await pg.evaluate(()=>(new Date().getDay()+6)%7),lun=await pg.evaluate(()=>orLun());

// 1. pianificatore: gruppo «Responsabili» con le 7 caselle di Mauro
ok(await pg.locator('.or-grid .or-rep',{hasText:'Responsabili'}).count()===1,'planner: «Responsabili» group');
ok(await pg.locator('.or-grid [data-a="orRCell"][data-u="mauro"]').count()===7,'planner: 7 cells for Mauro');
ok(await pg.evaluate(()=>!orPeople().some(u=>u.id==='mauro')),'Mauro still outside the contract checks');

// 2. foglio: turno a mano, salvato in resp senza controlli né bozza
await pg.click(`.or-grid [data-a="orRCell"][data-u="mauro"][data-g="${(g+1)%7}"]`);await wait(300);
ok(await pg.locator('.sheet .or-rnote').count()===1,'sheet: «lo vedono subito tutti» note');
ok(await pg.locator('.sheet .or-pi').count()===0,'sheet: no rule warnings');
await pg.fill('#or-a1','17:00');await pg.dispatchEvent('#or-a1','change');await pg.fill('#or-b1','23:30');await pg.dispatchEvent('#or-b1','change');await wait(150);
await pg.click('.sheet [data-a="orSave"]');await wait(400);
let w=await pg.evaluate(l=>orWeek(l),lun);
ok(w&&w.resp&&w.resp.mauro&&w.resp.mauro[(g+1)%7]==='17:00-23:30','saved in resp: '+JSON.stringify(w&&w.resp));
ok(!w.t||!w.t.mauro,'not in the shifts (t)');
ok(await pg.locator(`.or-grid [data-a="orRCell"][data-u="mauro"][data-g="${(g+1)%7}"] .or-b`).innerText().then(t=>t.replace(/\s/g,'')==='17–23:30'),'planner cell shows 17–23:30');

// 3. orario di oggi che comprende adesso → striscia «in servizio», «In turno oggi»
const now=await pg.evaluate(()=>{const d=new Date();return d.getHours()*60+d.getMinutes()});
const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
await pg.evaluate(([l,g,v])=>upd('config','orari_'+l,{['resp.mauro.'+g]:v}),[lun,g,hm(Math.max(0,now-30))+'-'+hm(now+60)]);await wait(300);
await pg.evaluate(()=>{S.tab='staff';render()});await wait(200);
ok(await pg.locator('.rs-strip .rs-it.on',{hasText:'Mauro'}).count()===1,'strip: Mauro «in servizio»');
ok(await pg.locator('.rs-strip').innerText().then(t=>t.includes('fino alle '+hm(now+60))),'strip: «fino alle '+hm(now+60)+'»');
ok(await pg.evaluate(()=>orOggi().includes('Mauro')&&orOggi().includes('Responsabile')),'«In turno oggi»: Mauro as Responsabile');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px: no horizontal scroll');
await pg.click('.rs-strip [data-a="rsChat"][data-u="mauro"]');await wait(400);
ok(await pg.evaluate(()=>!!CHAT.box&&S.chat&&S.chat.c===chDm(realU().id,'mauro')),'«Scrivi» opens the chat with Mauro');
await pg.evaluate(()=>chClose());await wait(300);

// 4. orario più tardi oggi → «arriva alle»
if(now<1380){await pg.evaluate(([l,g,v])=>upd('config','orari_'+l,{['resp.mauro.'+g]:v}),[lun,g,hm(now+30)+'-'+hm(Math.min(1439,now+50))]);await wait(300);
  ok(await pg.locator('.rs-strip .rs-it:not(.on)').innerText().then(t=>t.includes('arriva alle '+hm(now+30))),'strip: «arriva alle '+hm(now+30)+'»')}
else console.log('SKIP «arriva alle» (dopo le 23)');

// 5. Riposo oggi → niente striscia
await pg.evaluate(([l,g])=>upd('config','orari_'+l,{['resp.mauro.'+g]:'R'}),[lun,g]);await wait(300);
ok(await pg.locator('.rs-strip').count()===0,'rest day: no strip');

// 6. chi può scrivere: lui e i gestori, non lo staff
ok(await pg.evaluate(()=>orRCan(D().staff.mauro,'mauro')&&!orRCan(D().staff.luca,'mauro')&&orRCan({id:'x',ruolo:'gm'},'mauro')),'only Mauro and managers can write it');

// 7. «I miei orari» di Mauro: giorni da toccare, anche la settimana prossima
const my=await pg.evaluate(()=>vMieiOrari(D().staff.mauro));
ok(my.includes('Sei Responsabile')&&(my.match(/data-a="orRCell"/g)||[]).length===7,'«I miei orari»: 7 days to fill');
ok(my.includes('data-a="orMy"'),'«I miei orari»: next week available');
// lo staff non vede la propria riga nella striscia se è lui; Luca la vede
ok(await pg.evaluate(()=>{S.me='mauro';const a=rsStrip(D().staff.mauro);S.me=Object.values(D().staff).find(u=>u.ruolo==='dev').id;return a===''}),'Mauro does not see himself in the strip');
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
