// v120 (D58 pezzo 1, con l'emulatore): a ogni apertura l'app chiede la memoria protetta (navigator.storage.persist);
// senza la funzione parte lo stesso; il telefono approvato scrive membri/<uid> {mp, visto, sid}; il gestore lo vede nella scheda.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
// persist finto: conta le chiamate e risponde «sì»; con senza=true la funzione non esiste
const mk=async(cfg,senza)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg,senza])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg));
    window.__mp=0;const sm=navigator.storage;
    if(senza){try{Object.defineProperty(Navigator.prototype,'storage',{get:()=>undefined,configurable:true})}catch(e){}}
    else if(sm){sm.persisted=async()=>false;sm.persist=async()=>{window.__mp++;return true}}},[cfg,!!senza]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
ok(await A.evaluate(()=>window.__mp)===1,'prima apertura: chiesta la memoria protetta');
await A.click('[data-a="formset"][data-v="gm"]');
for(const [k,v] of Object.entries({nome:'Chef',cognome:'Prova',username:'chef',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'database attivo');
ok(await A.evaluate(()=>window.__mp)===1,'dopo la ricarica: chiesta di nuovo (a ogni apertura)');
await A.waitForTimeout(1500);
const m=await A.evaluate(async()=>{const d=await fbInit().fs.doc('membri/'+S.db.status().uid).get({source:'server'});return d.data()});
ok(m&&m.mp===true&&m.sid===await A.evaluate(()=>S.me)&&m.visto>Date.now()-60000,'membri/<uid>: mp sì, sid del profilo, visto adesso');
// niente seconda scrittura nella stessa giornata
await A.reload();await A.waitForTimeout(6000);
const w=await A.evaluate(()=>JSON.parse(localStorage.getItem('jona_mpw')||'null'));
ok(w&&w.t<=m.visto+5000,'riapertura: nessuna scrittura nuova prima di 20 ore');
// scheda del profilo: riga «Telefono»
await A.evaluate(()=>{profileSheet(S.me)});await A.waitForTimeout(2500);
const t=(await A.locator('.sheet').innerText()).replace(/\s+/g,' ');
ok(/memoria protetta: sì/.test(t)&&/aperto il/.test(t),'scheda del profilo: «memoria protetta: sì · aperto il …»');
ok(!A.errs.length,'nessun errore: '+A.errs.join(' | '));
// telefono senza la funzione: l'app parte lo stesso
const B=await mk(null,true);await B.goto('http://localhost:8765/index.html#demo');await B.waitForTimeout(3000);
ok(!B.errs.length&&(await B.locator('#app').innerText()).length>20,'senza navigator.storage: l\'app si apre, nessun errore '+B.errs.join(' | '));
const C=await mk(null,true);await C.goto('http://localhost:8765/index.html');await C.waitForTimeout(3000);
ok(!C.errs.length&&await C.evaluate(()=>S.mp===null),'senza navigator.storage (app vera): S.mp nullo, nessun errore');
await b.close();
