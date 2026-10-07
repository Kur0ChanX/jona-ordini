// D9 / v50: scheda Richieste (Da approvare / Gestite per giorno)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:390,height:800}});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');await pg.waitForTimeout(300);
// D9 / v50: scheda Richieste con «Da approvare» e «Gestite», gestite divise per giorno con ora e chi ha deciso, filtri
const txt=async(sel='#app')=>(await pg.locator(sel).innerText()).replace(/\s+/g,' ');
await pg.evaluate(async()=>{const me=S.me,now=Date.now(),D0=new Date();D0.setHours(12,0,0,0);const oggi=D0.getTime();
  const mk=(id,stato,deciso,nome)=>put('richieste',id,{utenteId:me,utenteNome:nome,reparto:'cucina',items:[{pid:'x',nome:'Pomodori',qta:2,um:'kg'}],stato,creato:deciso-36e5*30,deciso,decisoDa:me});
  await mk('r1','approvata',Math.min(now-60000,oggi),'Anna');await mk('r2','rifiutata',oggi-864e5,'Bruno');await mk('r3','approvata',oggi-3*864e5,'Carla');
  await put('richieste','r4',{utenteId:me,utenteNome:'Dino',reparto:'sala',items:[{pid:'x',nome:'Pane',qta:1,um:'pz'}],stato:'inviata',creato:now});
  S.tab='richieste';render()});
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await pg.evaluate(()=>{S.tab='richieste';render()});
await pg.waitForTimeout(500);
let t=await txt();
ok(/Da approvare · 1/.test(t)&&/Gestite/.test(t)&&/Dino/.test(t)&&!/Anna/.test(t),'«Da approvare · 1»: solo la richiesta in attesa');
await pg.click('[data-a="rqSub"][data-v="gestite"]');await pg.waitForTimeout(300);t=await txt();
const iO=t.indexOf('Oggi'),iI=t.indexOf('Ieri');
ok(iO>=0&&iI>iO&&/Anna/.test(t)&&/Bruno/.test(t)&&!/Dino/.test(t),'«Gestite»: Oggi poi Ieri, senza quelle in attesa');
ok(/alle \d\d:\d\d da Luca/.test(t),'ora della decisione e chi ha deciso');
ok(await pg.locator('details.rq-day').count()===3&&await pg.locator('details.rq-day[open]').count()===2,'3 giorni, i primi 2 aperti');
await pg.click('[data-a="rqF"][data-v="rifiutata"]');await pg.waitForTimeout(300);t=await txt();
ok(/Bruno/.test(t)&&!/Anna/.test(t)&&!/Carla/.test(t),'filtro «Rifiutate»');
await pg.click('[data-a="rqF"][data-v="approvata"]');await pg.waitForTimeout(300);t=await txt();
ok(/Anna/.test(t)&&/Carla/.test(t)&&!/Bruno/.test(t),'filtro «Approvate»');
for(const w of [320,390]){await pg.setViewportSize({width:w,height:800});await pg.waitForTimeout(200);
  ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),w+' px: niente scorrimento di lato')}
await pg.setViewportSize({width:390,height:844});await pg.click('[data-a="rqF"][data-v="tutte"]');await pg.waitForTimeout(300);if(process.env.SHOT)await pg.screenshot({path:process.env.SHOT});
ok(!errs.length,'nessun errore '+errs.join(' | '));
await b.close();
