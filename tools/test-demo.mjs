// v45: app dimostrativa da …/#demo. Benvenuto, ingresso con dati di esempio, cambio vista, nessun contatto con Firebase/Worker/Gemini,
// dati veri del telefono intatti, uscita che pulisce tutto. Usa il firebase-config.js vero: la demo deve ignorarlo.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const BASE='http://localhost:8765/index.html';
const ctx=await b.newContext({viewport:{width:390,height:800}});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ext=[];pg.on('request',r=>{const u=r.url();if(!u.startsWith('http://localhost:8765/')&&!u.startsWith('data:')&&!u.startsWith('blob:')&&!/^https:\/\/(api\.open-meteo\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(u))ext.push(u);if(/lib\/firebase/.test(u))ext.push(u)});
// dati «veri» già sul telefono
const REAL={staff:{vero1:{nome:'Vero',cognome:'Profilo',username:'vero',ruolo:'gm',stato:'attivo'}},fornitori:{vf:{nome:'Fornitore vero'}}};
await pg.goto('http://localhost:8765/manifest.webmanifest'); // pagina dello stesso sito che non avvia l'app (niente collegamenti veri)
await pg.evaluate(R=>{localStorage.setItem('jona_db_v2',JSON.stringify(R));localStorage.setItem('jona_me',JSON.stringify('vero1'));localStorage.setItem('jona_key',JSON.stringify('chiave-vera'))},REAL);
const snap=()=>pg.evaluate(()=>['jona_db_v2','jona_me','jona_key'].map(k=>localStorage.getItem(k)));
const before=await snap();
ext.length=0;
// 1. benvenuto
await pg.goto(BASE+'#demo');
await pg.waitForSelector('.demo-card',{timeout:8000});
ok(await pg.locator('.demo-card h1').textContent()==='Benvenuto in Jona Ordini','schermata di benvenuto');
ok(await pg.evaluate(()=>DEMO&&S.db.kind==='locale'&&fbCfg()===null),'demo: salvataggio locale, Firebase ignorato');
for(const w of [320,390]){await pg.setViewportSize({width:w,height:700});await pg.waitForTimeout(150);
  const o=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);ok(o[0]<=o[1],'benvenuto senza scorrimento di lato a '+w+' px: '+o)}
await pg.setViewportSize({width:390,height:800});
// 2. ingresso
await pg.click('[data-a="demoGo"]');
await pg.waitForSelector('.demobar',{timeout:8000});await pg.waitForTimeout(400);
const d=await pg.evaluate(()=>({me:realU()&&realU().nome,gm:isGM(meU()),st:Object.keys(D().staff).length,r:Object.values(D().richieste).filter(r=>r.stato==='inviata').length,
  oa:Object.values(D().ordini).filter(o=>o.stato==='aperto').length,oi:Object.values(D().ordini).filter(o=>o.stato==='inviato').length,
  ag:funzOn('agenda'),or:!!(D().config['orari_'+orLun()]||{}).tp,msg:Object.keys(S.db.dump().messaggi||{}).length,news:document.querySelectorAll('.sheet').length}));
ok(d.me==='Ospite'&&d.gm,'dentro come «Ospite» amministratore: '+JSON.stringify(d));
ok(d.st===6&&d.r===2&&d.oa>=1&&d.oi>=20&&d.ag&&d.or&&d.msg===4,'dati di esempio completi: '+JSON.stringify(d));
ok(d.news===0,'nessuna finestra aperta all\'ingresso');
// 3. cambio vista e giro delle schede
for(const v of ['gm','fb','staff']){
  await pg.click(`.demobar [data-a="viewAs"][data-v="${v}"]`);await pg.waitForTimeout(250);
  const u=await pg.evaluate(()=>{const u=meU();return{r:u.ruolo,rep:u.reparto}});
  ok(v==='gm'?u.r==='gm':v==='fb'?u.r==='staff'&&u.rep==='fb':u.r==='staff'&&u.rep==='cucina','vista '+v+': '+JSON.stringify(u));
  const tabs=await pg.evaluate(()=>[...document.querySelectorAll('nav [data-a="tab"]')].map(b=>b.dataset.v));
  for(const t of tabs){await pg.click(`nav [data-a="tab"][data-v="${t}"]`);await pg.waitForTimeout(200)}
  ok(tabs.length>=3,'vista '+v+': schede '+tabs.join(','));
  for(const w of [320,390]){await pg.setViewportSize({width:w,height:700});await pg.waitForTimeout(150);
    const o=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);ok(o[0]<=o[1],'vista '+v+' senza scorrimento di lato a '+w+' px: '+o)}
  await pg.setViewportSize({width:390,height:800});
}
await pg.click('.demobar [data-a="viewAs"][data-v="gm"]');await pg.waitForTimeout(250);
// 4. un'azione vera nella demo: approvare una richiesta resta nella demo
await pg.evaluate(()=>approve('demo_r1'));await pg.waitForTimeout(400);
ok(await pg.evaluate(()=>D().richieste.demo_r1.stato==='approvata'),'approvare nella demo funziona');
// 5. ricarica: resta nella demo e dentro; anche se l'indirizzo perde #demo (stessa scheda)
await pg.reload();await pg.waitForSelector('.demobar',{timeout:8000});ok(true,'dopo la ricarica resta nella demo');
await pg.goto(BASE);await pg.waitForSelector('.demobar',{timeout:8000});ok(true,'senza #demo nella stessa scheda resta nella demo');
await pg.waitForTimeout(1500);
ok(ext.length===0,'nessuna chiamata a Firebase, Worker o Gemini: '+JSON.stringify(ext.slice(0,5)));
ok(JSON.stringify(await snap())===JSON.stringify(before),'dati veri del telefono intatti');
ok(await pg.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('demo:'))),'la demo usa chiavi «demo:»');
// 6. uscita
await pg.click('.demobar [data-a="demoOut"]');await pg.waitForLoadState('load');await pg.waitForTimeout(800);
const out=await pg.evaluate(()=>({demo:DEMO,keys:Object.keys(localStorage).filter(k=>k.startsWith('demo:')),ss:sessionStorage.getItem('jona_demo'),hash:location.hash}));
ok(!out.demo&&!out.keys.length&&!out.ss&&!out.hash,'«Esci» pulisce la demo: '+JSON.stringify(out));
ok(JSON.stringify(await snap())===JSON.stringify(before),'dopo l\'uscita i dati veri sono ancora lì');
// 7. app già aperta e poi #demo: ricarica in modalità demo
await pg.evaluate(()=>{location.hash='demo'});await pg.waitForSelector('.demo-card',{timeout:8000});ok(true,'#demo con l\'app aperta porta al benvenuto');
// 8. Gemini nella demo non chiama la rete
ext.length=0;await pg.click('[data-a="demoGo"]');await pg.waitForSelector('.demobar');
const g=await pg.evaluate(async()=>{try{await gemCall({contents:[]});return'nessun errore'}catch(e){return'errore'}});
await pg.waitForTimeout(300);ok(!ext.some(u=>/googleapis|workers\.dev/.test(u)),'Gemini e Worker bloccati nella demo ('+g+')');
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
