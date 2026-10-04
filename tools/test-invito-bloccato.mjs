// v21: telefono nuovo che apre il link d'invito e i server di Google non rispondono mai (caso visto su iPhone).
// Prima restava per sempre su «Un momento…»; ora dice che si sta collegando, dopo 20 s mostra Riprova e attiva il long polling.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
let held=0;
await ctx.route(/firestore\.googleapis|identitytoolkit|securetoken/,()=>{held++});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/index.html#k=AbCdEfGhIjKlMnOpQrSt1234',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(3000);
let txt=(await pg.locator('#app').innerText()).replace(/\s+/g,' ');
ok(/Collegamento al ristorante/.test(txt),'subito «Collegamento al ristorante…»: '+txt.slice(0,80));
ok(held>0,'richieste a Google ferme ('+held+')');
await pg.waitForSelector('text=Il collegamento non riesce',{timeout:30000}).catch(()=>{});
txt=(await pg.locator('#app').innerText()).replace(/\s+/g,' ');
ok(/Il collegamento non riesce/.test(txt)&&await pg.locator('#app [data-a="reload"]').count()===1,'dopo 20 s: messaggio e pulsante Riprova');
ok(await pg.evaluate(()=>ls('jona_fb_lp'))===1,'long polling attivato per il prossimo tentativo');
ok(await pg.evaluate(()=>ls('jona_key'))==='AbCdEfGhIjKlMnOpQrSt1234','chiave del link salvata');
await pg.click('#app [data-a="reload"]');await pg.waitForTimeout(3000);
txt=(await pg.locator('#app').innerText()).replace(/\s+/g,' ');
ok(/Collegamento al ristorante/.test(txt),'Riprova: riparte il collegamento');
ok(await pg.evaluate(()=>!!fbInit.lp),'al nuovo tentativo Firestore usa il long polling');
ok(errs.length===0,'nessun errore '+errs.join(' | '));
await b.close();
