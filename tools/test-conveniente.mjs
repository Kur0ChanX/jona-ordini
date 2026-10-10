// D24 / v69: stesso prodotto da un altro fornitore più conveniente → «Da … costa … in meno · Passa» quando il gestore approva
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
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
const txt=async(sel='#app')=>(await pg.locator(sel).innerText()).replace(/\s+/g,' ');
await pg.evaluate(async()=>{
  await put('fornitori','fa',{id:'fa',nome:'Alfa'});await put('fornitori','fb',{id:'fb',nome:'Beta'});await put('fornitori','fc',{id:'fc',nome:'Gamma'});
  const P=(id,nome,f,prezzo,unita)=>put('prodotti',id,{id,nome,fornitoreId:f,prezzo,unita,categoria:'Verdura'});
  await P('a1','Pomodori ciliegino','fa',3.5,'kg');await P('b1','Pomodori ciliegino','fb',3.1,'kg');await P('c1','Pomodori ciliegino','fc',2.0,'cassa');
  await P('a2','Zucchine romanesche','fa',2.0,'kg');await P('b2','Zucchine romanesche','fb',2.0,'kg');
  await P('a3','Basilico fresco','fa',1.0,'mazzo');await P('b3','Basilico fresco','fb',0.995,'mazzo');
  await new Promise(r=>setTimeout(r,400));rebuildIndex();
  window.ok0=[cheaperOf('a1')?.id,cheaperOf('b1'),cheaperOf('a2'),cheaperOf('a3'),cheaperOf('c1')];
});
const r0=await pg.evaluate(()=>ok0);
ok(r0[0]==='b1','più economico con la stessa unità (Beta), non la cassa di Gamma');
ok(r0[1]===null,'già il più economico: niente suggerimento');
ok(r0[2]===null&&r0[3]===null,'stesso prezzo o meno dell\'1% di differenza: niente suggerimento');
ok(r0[4]===null,'unità diversa (cassa contro kg): niente confronto');
// staff: carrello senza prezzi, niente suggerimento
await pg.click('.testbar [data-a="viewAs"][data-v="staff"]');
await pg.evaluate(()=>{S.cart=[{pid:'a1',qta:2}];saveCart();S.tab='carrello';render()});await pg.waitForTimeout(300);
ok((await pg.locator('.cheap').count())===0&&!/costa/.test(await txt()),'staff: nessun suggerimento (non vede i prezzi)');
// approvazione di una richiesta
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');
await pg.evaluate(async()=>{await put('richieste','r1',{utenteId:S.me,utenteNome:'Anna',reparto:'cucina',stato:'inviata',creato:Date.now(),
  items:[{pid:'a1',nome:'Pomodori ciliegino',qta:3,unita:'kg',prezzo:3.5,fornitoreId:'fa',fornitoreNome:'Alfa'}]});S.tab='richieste';render()});
await pg.waitForTimeout(400);let t=await txt();
ok(/Da Beta costa 0,40 € in meno \/ kg \(risparmi 1,20 €\)/.test(t),'approvazione: suggerimento con risparmio');
if(process.env.SHOT0)await pg.locator(".cheap").scrollIntoViewIfNeeded().then(()=>pg.screenshot({path:process.env.SHOT0}));
await pg.click('.cheap');await pg.waitForTimeout(300);t=await txt();
ok((await pg.locator('.cheap').count())===0&&/Beta/.test(t)&&/3,10 €/.test(t),'«Passa» in approvazione: prodotto di Beta a 3,10 €');
for(const w of [320,390]){await pg.setViewportSize({width:w,height:800});await pg.waitForTimeout(200);
  ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),w+' px: niente scorrimento di lato')}
if(process.env.SHOT)await pg.screenshot({path:process.env.SHOT});
ok(!errs.length,'nessun errore '+errs.join(' | '));
await b.close();
