// v74 (D30): chi apre l'app dal vecchio indirizzo github.io passa al nuovo con ?da=gh,
// vede «Installa di nuovo l'app» e l'apertura finisce nella scatola nera. Dal nuovo indirizzo niente avviso.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OLD='https://kur0chanx.github.io/jona-ordini/',NEW='https://jona-ristorante-by-ynoy-corp.pages.dev/',LOC='http://localhost:8765/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});const docs=[];
  // indirizzo d'arrivo letto prima degli script dell'app (che poi tolgono ?da=gh e #i=)
  await c.addInitScript(()=>{try{if(/pages\.dev$/.test(location.hostname)&&!sessionStorage.getItem('t_arrivo'))sessionStorage.setItem('t_arrivo',location.href)}catch(e){}});
  for(const base of [OLD,NEW])await c.route(base+'**',async r=>{const u=new URL(r.request().url());if(r.request().resourceType()==='document')docs.push(u.href);
    if(/firebase-config\.js$/.test(u.pathname))return r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'});
    const path=u.pathname.replace(/^\/jona-ordini\//,'/').replace(/^\/$/,'/index.html');const res=await r.fetch({url:LOC+path.slice(1)});return r.fulfill({response:res})});
  const p=await c.newPage();p.nav=[];p.on('framenavigated',f=>{if(f===p.mainFrame())p.nav.push(f.url())});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.docs=docs;return p};
const entra=async p=>{await p.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await p.fill('input[data-k="'+k+'"]',v);
  await p.click('[data-a="setupGo"]');await p.waitForTimeout(1200)};
// 1) dal vecchio indirizzo, con altri parametri e #i= (invito): passano tutti
const A=await mk();
await A.goto(OLD+'?x=1#i=ABC123');await A.waitForURL(NEW+'**',{timeout:15000});await A.waitForTimeout(1500);
const arr=await A.evaluate(()=>sessionStorage.getItem('t_arrivo')||'');
ok(arr===NEW+'?x=1&da=gh#i=ABC123','vecchio → nuovo con ?da=gh, parametri e #i= tenuti ('+arr+')');
ok(!/da=gh/.test(A.url()),'il segno ?da=gh sparisce dall\'indirizzo ('+A.url()+')');
ok(await A.evaluate(()=>OLD_URL===true),'OLD_URL acceso');
await entra(A);
let t=(await A.locator('.old-url').innerText().catch(()=>'')).replace(/\s+/g,' ');
ok(/Installa di nuovo l'app/.test(t)&&/Apri il nuovo/.test(t),'avviso «Installa di nuovo l\'app» ('+t.slice(0,60)+')');
ok(await A.locator('.old-url a[href="'+NEW+'"][target="_blank"]').count()===1,'pulsante «Apri il nuovo» con il nuovo indirizzo');
const q=await A.evaluate(()=>ERR.q.concat(Object.values(ERR.seen)).filter(e=>/Vecchio indirizzo/.test(e.m)).map(e=>e.u));
const me=await A.evaluate(()=>S.me);ok(q.length>=1&&q[0]===me&&!!me,'apertura nella scatola nera con la persona ('+JSON.stringify(q)+')');
await A.evaluate(()=>render());await A.waitForTimeout(200);
ok(await A.evaluate(()=>Object.values(ERR.seen).filter(e=>/Vecchio indirizzo/.test(e.m)).length)===1,'segnalata una volta sola');
await A.reload();await A.waitForTimeout(2000);
ok(await A.locator('.old-url').count()===1,'dopo «ricarica» l\'avviso resta (stessa scheda)');
ok(!A.errs.length,'nessun errore nella pagina '+A.errs.join(' | '));
// 2) dal nuovo indirizzo: niente avviso
const B=await mk();
await B.goto(NEW);await B.waitForTimeout(1500);await entra(B);
ok(await B.locator('.old-url').count()===0,'dal nuovo indirizzo: nessun avviso');
ok(await B.evaluate(()=>OLD_URL===false),'OLD_URL spento');
// 3) demo dal vecchio indirizzo: niente avviso
const C=await mk();
await C.goto(OLD+'#demo');await C.waitForURL(NEW+'**',{timeout:15000});await C.waitForTimeout(1500);
ok(await C.locator('.old-url').count()===0,'demo: nessun avviso');
await b.close();
console.log(process.exitCode?'FAIL qualcosa non va':'PASS tutto ok');
