// v43: contratto «Full time Responsabile» (orario libero): salvato come {libero:true}, fuori dal pianificatore e dai controlli,
// «I miei orari» mostra «Orario libero», si torna alle ore fisse, 320 px senza scorrimento.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.evaluate(()=>{S.tab='staff';render()});await wait(200);
/* 1. nuovo profilo con orario libero */
await pg.click('[data-a="addProfile"]');await wait(300);
ok(await pg.locator('.sheet [data-k="libero"][data-v=""][aria-pressed="true"]').count()===1,'default: «Ore fisse»');
await pg.click('.sheet [data-a="formset"][data-k="libero"][data-v="1"]');await wait(150);
ok(await pg.locator('.sheet #rg-ore').count()===0,'free schedule: hours field hidden');
ok(await pg.locator('.sheet .or-cf').innerText().then(t=>t.includes('Orario libero')),'free schedule: explanation shown');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px: no horizontal scroll');
for(const [k,v] of [['nome','Mauro'],['cognome','Loi'],['username','mauro'],['pw','password123'],['pw2','password123']])await pg.fill(`.sheet input[data-k="${k}"]`,v);
await pg.click('[data-a="addGo"]');await wait(400);
let m=await pg.evaluate(()=>Object.values(D().staff).find(u=>u.username==='mauro'));
ok(m&&JSON.stringify(m.contratto)==='{"libero":true}','saved as {libero:true}: '+JSON.stringify(m&&m.contratto));
/* 2. fuori dal pianificatore e dai controlli */
ok(await pg.evaluate(id=>!orPeople().some(u=>u.id===id)&&orFree(D().staff[id])&&contrOf(D().staff[id])===null,m.id),'not in planner, no contract checks');
ok(await pg.evaluate(()=>{S.tab='staff';S.staffSub='orari';try{localStorage.jona_staffsub='orari'}catch(e){}render();const mn=document.querySelector('main').cloneNode(true);mn.querySelectorAll('.testbar').forEach(e=>e.remove());return !mn.textContent.includes('Mauro')}),'planner view does not list Mauro');
ok(await pg.evaluate(()=>jonaCtx().includes('orario libero')),'«Chiedi a Jona» knows the free schedule');
/* 3. «I miei orari» */
ok(await pg.evaluate(id=>vMieiOrari(D().staff[id]).includes('Orario libero'),m.id),'«I miei orari»: «Orario libero»');
/* 4. modifica: la scelta resta, poi si torna alle ore fisse */
await pg.evaluate(id=>profileSheet(id),m.id);await wait(300);
ok(await pg.locator('.sheet [data-k="libero"][data-v="1"][aria-pressed="true"]').count()===1,'edit: «Full time Responsabile» selected');
await pg.click('.sheet [data-a="formset"][data-k="libero"][data-v=""]');await wait(150);
ok(await pg.locator('.sheet #pf-ore').count()===1,'back to fixed hours: hours field shown');
await pg.evaluate(()=>{S.form.ore=40});
await pg.evaluate(id=>saveProfile(id),m.id);await wait(400);
m=await pg.evaluate(id=>D().staff[id],m.id);
ok(JSON.stringify(m.contratto)===JSON.stringify({ore:40,pausa:30,liberi:1}),'fixed hours saved: '+JSON.stringify(m.contratto));
ok(await pg.evaluate(id=>orPeople().some(u=>u.id===id),m.id),'back in the planner');
/* 5. di nuovo libero dalla modifica */
await pg.evaluate(id=>profileSheet(id),m.id);await wait(300);
await pg.click('.sheet [data-a="formset"][data-k="libero"][data-v="1"]');await wait(150);
await pg.evaluate(id=>saveProfile(id),m.id);await wait(400);
m=await pg.evaluate(id=>D().staff[id],m.id);
ok(JSON.stringify(m.contratto)==='{"libero":true}','free again from edit: '+JSON.stringify(m.contratto));
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
