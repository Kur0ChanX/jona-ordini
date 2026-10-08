// v52: «Manda la versione di prova» (Staff, in fondo, e foglio Invita): messaggio pronto con il link #demo, Copia il link,
// niente nome del creatore, riquadro nascosto nella demo, 320 px senza scorrimento.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
await ctx.addInitScript(()=>{window.__sh=[];navigator.share=async d=>{window.__sh.push(d)};
  window.__cp=[];try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.__cp.push(t)}},configurable:true})}catch(e){}});
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
await pg.evaluate(()=>{S.tab='staff';S.staffSub='persone';render()});await wait(200);
ok(await pg.locator('main .demo-box').count()===1,'Staff: riquadro «Versione di prova» per l\'amministratore');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px: niente scorrimento di lato');
await pg.click('main .demo-box [data-a="demoShare"]');await wait(200);
const sh=await pg.evaluate(()=>window.__sh);
const t=sh[0]&&sh[0].text||'';
ok(sh.length===1&&t.includes('http://localhost:8765/index.html#demo'),'messaggio con il link #demo: '+JSON.stringify(sh));
ok(t.includes('Entra nella demo')&&t.includes('non arriva al ristorante'),'messaggio con le istruzioni');
ok(!/miscera|kur0chan|mario/i.test(t),'niente nome del creatore nel messaggio');
await pg.click('main .demo-box [data-a="demoCopy"]');await wait(200);
ok(await pg.evaluate(()=>window.__cp[0]==='http://localhost:8765/index.html#demo'),'Copia il link: '+JSON.stringify(await pg.evaluate(()=>window.__cp)));
// lo staff non ha la scheda Staff: il riquadro non deve comparire altrove
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
ok(await pg.locator('main .demo-box').count()===0,'staff: nessun riquadro');
// dentro la demo il riquadro non c'è
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push('pageerror demo: '+e.message));
await p2.goto('http://localhost:8765/index.html#demo');await p2.waitForSelector('.demo-card',{timeout:8000});
await p2.click('[data-a="demoGo"]');await p2.waitForSelector('.demobar',{timeout:8000});
await p2.evaluate(()=>{S.tab='staff';S.staffSub='persone';render()});await p2.waitForTimeout(200);
ok(await p2.locator('main .demo-box').count()===0,'nella demo il riquadro è nascosto');
await p2.click('.demobar [data-a="demoOut"]');await p2.waitForTimeout(800);
ok(errs.length===0,'nessun errore della pagina '+JSON.stringify(errs));
await b.close();
