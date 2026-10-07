// Notifiche push con l'emulatore: servizio push del browser finto, server worker/ intercettato.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const KEY='B'+'A'.repeat(86);
const sent=[];
const mk=async(cfg,name)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.grantPermissions(['notifications'],{origin:'http://localhost:8765'});
  await c.addInitScript(([cfg,name])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg));
    const sub={endpoint:'https://fcm.googleapis.com/fcm/send/'+name,keys:{p256dh:'BX',auth:'Y'},toJSON(){return{endpoint:this.endpoint,keys:this.keys}},unsubscribe:async()=>{window.__sub=null;return true}};
    Object.defineProperty(navigator,'serviceWorker',{value:{register:async()=>({}),ready:Promise.resolve({pushManager:{getSubscription:async()=>window.__sub||null,subscribe:async()=>{window.__tries=(window.__tries||0)+1;if(typeof window.__fail==='number'&&window.__fail>0){window.__fail--;throw new DOMException('push service error','AbortError')}if(window.__fail===true)throw new DOMException('rifiutato','AbortError');return window.__sub=sub}}})}});
  },[cfg,name]);
  await c.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**',async r=>{const u=r.request().url();
    if(u.endsWith('/chiave'))return r.fulfill({json:{chiave:KEY}});
    if(u.endsWith('/salute'))return r.fulfill({json:{ok:true,push:true,gemini:false}});
    const body=JSON.parse(r.request().postData());sent.push({da:name,...body});
    r.fulfill({json:{inviati:body.subs.length,scaduti:body.subs.filter(s=>s.endpoint.endsWith('/morto')).map(s=>s.endpoint),errori:[]}})});
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return [c,p]};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const [,A]=await mk(CFG,'A');
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
const [,B]=await mk(null,'B');await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"], .login .btn.primary');await B.waitForTimeout(1500);
ok(await B.evaluate(()=>meU()&&meU().id==='test_u1'),'B entra come Luca (staff)');
// v40: avviso «Attiva le notifiche» in alto finché non sono attive; «Più tardi» lo nasconde per 3 giorni
ok(await B.isVisible('.push-ask [data-a="pushOn"]'),'avviso Attiva le notifiche in alto');
await B.click('.push-ask [data-a="pushLater"]');await wait(300);
ok(!await B.isVisible('.push-ask')&&await B.evaluate(()=>ls('jona_push_ask')>Date.now()+2.9*864e5),'Più tardi: avviso nascosto per 3 giorni');
await B.evaluate(()=>{ls('jona_push_ask',null);render()});await wait(300);
ok(await B.isVisible('.push-ask'),'avviso di nuovo visibile dopo i 3 giorni');
// B attiva dal menu del profilo
await B.evaluate(()=>meMenu());await B.waitForTimeout(400);
ok(await B.isVisible('[data-a="pushOn"]'),'menu profilo: pulsante Attiva le notifiche');
await B.click('.sheet-wrap:last-child [data-a="pushOn"]');await B.waitForTimeout(1500);
await B.evaluate(()=>meMenu());await B.waitForTimeout(400);
ok(await B.isVisible('[data-a="pushTest"]')&&await B.isVisible('[data-a="pushOff"]'),'dopo l\'attivazione: Prova e Spegni');
await B.click('[data-a="pushTest"]');await B.waitForTimeout(800);
ok(sent.some(s=>s.da==='B'&&s.subs.length===1&&s.subs[0].endpoint.endsWith('/B')),'Prova manda la push al proprio telefono');
await B.evaluate(()=>closeSheet(true));
await A.evaluate(()=>A.pushOn());await A.waitForTimeout(1500);
ok(await A.evaluate(()=>Object.keys(PUSH.subs).length===2),'A vede le 2 iscrizioni');
ok(!await B.isVisible('.push-ask')&&!await A.isVisible('.push-ask'),'notifiche attive: niente avviso in alto');
// v40: in Staff il gestore vede chi riceve gli avvisi
await A.evaluate(()=>{S.tab='staff';S.staffSub='persone';render()});await wait(500);
{const t=await A.innerText('#app');const luca=await A.innerText('[data-a="sedit"][data-u="test_u1"]');const others=await A.evaluate(()=>Object.values(D().staff).filter(u=>u.stato==='attivo'&&!Object.values(PUSH.subs).some(p=>p.u===u.id)).length);
ok(/🟢 avvisi attivi/.test(luca)&&others>0&&new RegExp('🔴 '+others+' senza avvisi').test(t)&&/🔴 niente avvisi/.test(t),'Staff: Luca 🟢, gli altri 🔴 con il conteggio');}
// A (sviluppatore) avvisa Luca: arriva solo al telefono di B
sent.length=0;await A.evaluate(()=>notify('test_u1','Richiesta approvata','Pomodori'));await wait(1500);
ok(sent.length===1&&sent[0].subs.length===1&&sent[0].subs[0].endpoint.endsWith('/B')&&sent[0].titolo==='Richiesta approvata','notifica a Luca → solo telefono B');
// B avvisa i gestori: arriva ad A (sviluppatore)
sent.length=0;await B.evaluate(()=>notify('gestori','Nuova richiesta da Luca',''));await wait(1500);
ok(sent.length===1&&sent[0].subs.map(s=>s.endpoint).join()==='https://fcm.googleapis.com/fcm/send/A','notifica ai gestori → telefono A');
// avviso al gm: nessun chef ha le notifiche, nessuna chiamata
sent.length=0;await B.evaluate(()=>notify('gm','x',''));await wait(1200);
ok(sent.length===0,'notifica allo chef senza telefoni iscritti: nessuna chiamata');
// iscrizione scaduta: cancellata da chi invia
await A.evaluate(()=>pushCol().doc('pmorto').set({u:'test_u1',sub:{endpoint:'https://fcm.googleapis.com/fcm/send/morto',keys:{p256dh:'BX',auth:'Y'}},creato:now()}));await wait(800);
sent.length=0;await A.evaluate(()=>notify('test_u1','y',''));await wait(1500);
ok(sent[0]&&sent[0].subs.length===2,'invio a 2 telefoni di Luca');
ok(await A.evaluate(()=>!PUSH.subs.pmorto),'iscrizione scaduta cancellata');
// B esce: la sua iscrizione sparisce; rientra: torna con il suo profilo
await B.evaluate(()=>logout());await wait(1500);
ok(await A.evaluate(()=>!Object.values(PUSH.subs).some(p=>p.u==='test_u1')),'uscita: Luca non riceve più');
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"], .login .btn.primary');await wait(2500);
ok(await A.evaluate(()=>Object.values(PUSH.subs).some(p=>p.u==='test_u1')),'rientro: iscrizione ripristinata da sola');
await B.evaluate(()=>A.pushOff());await wait(1500);
ok(await A.evaluate(()=>Object.keys(PUSH.subs).length===1)&&await B.evaluate(()=>!pushActive()),'Spegni: iscrizione tolta');
// primo tentativo rifiutato (AbortError) → l'app riprova da sola e si attiva
await B.evaluate(()=>{window.__fail=1;window.__tries=0});await B.evaluate(()=>pushOn());await wait(1500);
ok(await B.evaluate(()=>pushActive()&&window.__tries===2&&!S.pushErr),'AbortError una volta: secondo tentativo riuscito');
await B.evaluate(()=>A.pushOff());await wait(1500);
// guida: il telefono rifiuta l'iscrizione → messaggio chiaro e guida aperta
await B.evaluate(()=>{window.__fail=true;window.__tries=0;meMenu()});await wait(400);
ok(await B.isVisible('.ph-link'),'menu: link Problemi con le notifiche');
await B.click('.sheet-wrap:last-child [data-a="pushOn"]');await wait(3500);
ok(/Le notifiche non arrivano/.test(await B.innerText('.sheet-wrap:last-child')),'errore → guida aperta');
ok(await B.evaluate(()=>window.__tries===2),'riprovato una volta prima di arrendersi');
ok(/AbortError: rifiutato/.test(await B.innerText('.sheet-wrap:last-child .ph-err')),'guida: errore esatto del telefono');
await B.click('[data-a="pushBrand"][data-v="oppo"]');await wait(300);
ok(/Google Play Services/.test(await B.innerText('.sheet-wrap:last-child')),'guida Oppo completa');
ok(await B.evaluate(()=>!/\(20\)/.test(document.body.innerText)),'niente codice (20) nel messaggio');
await B.click('[data-a="pushBrand"][data-v="xiaomi"]');await wait(300);
ok(/Sospendi l'attività dell'app se inutilizzata/.test(await B.innerText('.sheet-wrap:last-child')),'guida Xiaomi');
await B.setViewportSize({width:360,height:780});await wait(300);
ok(await B.evaluate(()=>document.documentElement.scrollWidth<=360),'guida a 360 px senza scorrimento orizzontale');
await B.screenshot({path:'/tmp/claude-0/-home-user-jona-ordini/13ef9fb8-91a4-5db8-b2d2-12c6e3adb38b/scratchpad/guida.png'});
await B.evaluate(()=>{window.__fail=false});await B.click('.sheet-wrap:last-child [data-a="pushOn"]');await wait(1500);
ok(await B.evaluate(()=>pushActive()&&!sheets.length),'Riprova ad attivare dalla guida: attive e guida chiusa');
await A.setViewportSize({width:390,height:844});await A.evaluate(()=>{S.tab='staff';render()});await wait(400);await A.screenshot({path:process.env.SHOT_DIR?process.env.SHOT_DIR+'/staff.png':'/tmp/staff.png'});await B.evaluate(()=>{closeSheet(true);A.pushOff()});await wait(800);await B.setViewportSize({width:390,height:844});await B.screenshot({path:process.env.SHOT_DIR?process.env.SHOT_DIR+'/avviso.png':'/tmp/avviso.png'});
console.log('errors',A.errs,B.errs);await b.close();
