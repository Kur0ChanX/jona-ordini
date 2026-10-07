// S3 (v49): scatola nera. Gli errori del telefono vanno al Worker /errori (qui finto con route) e lo sviluppatore li vede in cima all app.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async cfg=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const txt=async(p,sel='#app')=>(await p.locator(sel).innerText()).replace(/\s+/g,' ');
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A (chi ha attivato) entra subito');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const POST=[];let LIST=[];
await A.context().route(/jona-notifiche\..*\/errori/,async r=>{const q=r.request();
  if(q.method()==='POST'){const b=JSON.parse(q.postData());POST.push(...b.e);LIST=[...b.e.map(e=>({...e})).reverse(),...LIST];return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})}
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({e:LIST})})});
await A.evaluate(()=>{S.tab='richieste';render()});
await A.evaluate(()=>{setTimeout(()=>{throw new Error('prova scatola nera')},0);setTimeout(()=>{throw new Error('prova scatola nera')},10);Promise.reject(new Error('promessa rifiutata'))});
await A.waitForTimeout(7000);
const e1=POST.find(e=>e.m.includes('prova scatola nera')),e2=POST.find(e=>e.m.includes('promessa rifiutata'));
ok(!!e1&&!!e2,'errori e promesse rifiutate mandati al server ('+POST.length+')');
const me1=await A.evaluate(()=>[String(APP_VER),S.me,S.tab]);ok(e1&&e1.v===me1[0]&&e1.u===me1[1]&&e1.p===me1[2],'con versione, persona e scheda '+JSON.stringify([e1&&e1.v,e1&&e1.u,e1&&e1.p,me1]));
ok(POST.filter(e=>e.m.includes('prova scatola nera')).length===1,'stesso errore ripetuto: mandato una volta sola');
await A.evaluate(()=>errLoad());await A.waitForTimeout(800);
let t=(await A.locator('.err-strip').innerText().catch(()=>'')).replace(/\s+/g,' ');
ok(/2 errori nuovi sui telefoni/.test(t),'sviluppatore: striscia «2 errori nuovi» ('+t+')');
await A.click('.err-strip');await A.waitForTimeout(400);
t=(await A.locator('.sheet').innerText()).replace(/\s+/g,' ');
ok(/Errori dei telefoni/.test(t)&&/prova scatola nera/.test(t)&&/Mario Test/.test(t),'elenco con messaggio e persona');
await A.click('[data-a="errSeen"]');await A.waitForTimeout(400);
ok(await A.locator('.err-strip').count()===0,'«Segna come visti»: la striscia sparisce');
// un telefono dello staff non vede la striscia
await A.evaluate(()=>{const u=D().staff[S.me];u.ruolo='staff';ls('jona_err_vis',0);render()});await A.waitForTimeout(300);
ok(await A.locator('.err-strip').count()===0,'staff: niente striscia degli errori');
await b.close();
