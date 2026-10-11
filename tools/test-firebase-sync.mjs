import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|favicon|fonts|Failed to load resource/.test(m.text()))p.errs.push('console: '+m.text().slice(0,200))});return [c,p]};
const txt=p=>p.evaluate(()=>document.body.innerText.slice(0,300).replace(/\n+/g,' | '));
// telefono A (Mario)
const [ca,A]=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
const t0=await txt(A);console.log('A start:',t0);ok(/Primo accesso/.test(t0),'A: schermata «Primo accesso»');
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1500);
await A.click('[data-a="meMenu"]');await A.waitForTimeout(300);await A.click('[data-a="settings"]');await A.waitForTimeout(800);
ok(/Database centrale[\s\S]*Non attivo/.test(await A.$eval('.sheet',e=>e.innerText)),'A: Impostazioni, database centrale non attivo');
await A.click('[data-a="fbActivate"]');await A.waitForTimeout(300);await A.click('#ask-ok');
await A.waitForTimeout(8000);
const a1=await A.evaluate(()=>({k:S.db.kind,st:S.db.status(),s:Object.keys(D().staff).length,p:Object.keys(D().prodotti).length,f:Object.keys(D().fornitori).length}));console.log('A after activate',JSON.stringify(a1));
ok(a1.k==='firebase'&&a1.st.ready&&!a1.st.err&&a1.s===1&&a1.p===29&&a1.f===6,'A attivato su Firebase con i dati caricati');
const link=await A.evaluate(()=>inviteLink());ok(/#k=[A-Za-z0-9]{16,}&c=/.test(link),'link d\'invito con chiave e configurazione');
// telefono B (nuovo): senza config, la prende dal link
const [cb,B]=await mk(null);
await B.goto(link);await B.waitForTimeout(6000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
const b1=await B.evaluate(()=>({k:S.db.kind,st:S.db.status(),s:Object.keys(D().staff).length,p:Object.keys(D().prodotti).length}));const tb=await txt(B);
ok(b1.k==='firebase'&&b1.st.ready&&b1.s===1&&b1.p===29,'B collegato dal link, dati arrivati '+JSON.stringify(b1));ok(/Accedi/.test(tb)&&/Crea il tuo profilo/.test(tb),'B: schermata Accedi con «Crea il tuo profilo»');
// B si registra come staff
await B.click('[data-a="register"]');await B.waitForTimeout(500);
for(const [k,v] of Object.entries({nome:'Luca',cognome:'Rossi',username:'luca',pw:'luca12345',pw2:'luca12345'}))await B.fill('.sheet input[data-k="'+k+'"]',v);
const rb=await B.$$('.sheet [data-a]');const acts=await Promise.all(rb.map(x=>x.getAttribute('data-a')));ok(acts.includes('regGo'),'B: modulo di registrazione con «regGo»');
await B.click('.sheet [data-a="regGo"], .sheet [data-a="selfGo"], .sheet .btn.primary');await B.waitForTimeout(2500);
const pend=await A.evaluate(()=>Object.values(D().staff).map(u=>u.nome+':'+u.stato).sort().join(','));ok(pend==='Luca:in_attesa,Mario:attivo','A vede Luca in attesa ('+pend+')');
// prodotti: A modifica un prodotto e lo sposta di fornitore; B vede
await A.evaluate(async()=>{await upd('prodotti','demo01',{prezzo:9.99});await put('prodotti','nuovo1',{fornitoreId:'dac',nome:'Prodotto nuovo',unita:'pz',prezzo:2,categoria:'Altro',aggiornato:now()});await upd('prodotti','demo02',{fornitoreId:'metro'});await del('prodotti','demo03')});
await A.waitForTimeout(2500);
const bp=await B.evaluate(()=>{const P=D().prodotti;return [P.demo01&&P.demo01.prezzo,P.nuovo1&&P.nuovo1.nome,P.demo02&&P.demo02.fornitoreId,!!P.demo03,Object.keys(P).length].join(' / ')});ok(bp==='9.99 / Prodotto nuovo / metro / false / 29','B vede prezzo, prodotto nuovo, cambio fornitore e cancellazione ('+bp+')');
// senza rete su A
await ca.setOffline(true);await A.evaluate(()=>window.dispatchEvent(new Event('offline')));
await A.evaluate(async()=>{await upd('config','app',{nomeLocale:'Jona OFFLINE'})});await A.waitForTimeout(800);
const top=await A.$eval('.top',e=>e.innerText);ok(/Senza rete/.test(top)&&/1 da inviare/.test(top),'A senza rete: avviso «Senza rete, 1 da inviare»');ok(await A.evaluate(()=>cfg().nomeLocale)==='Jona OFFLINE','A senza rete: modifica subito visibile sul telefono');
await A.waitForTimeout(1500);ok(await B.evaluate(()=>cfg().nomeLocale)==='Jona Ristorante','B non vede la modifica finché A è senza rete');
await ca.setOffline(false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await A.waitForTimeout(6000);
const st2=await A.evaluate(()=>S.db.status());ok(await B.evaluate(()=>cfg().nomeLocale)==='Jona OFFLINE','B riceve la modifica al ritorno della rete');ok(st2.pend===0&&st2.net,'A: niente più in sospeso dopo la rete');
// A ricarica: resta collegato, dati presenti
await A.reload();await A.waitForTimeout(5000);const tr=await txt(A);ok(/Jona OFFLINE/.test(tr)&&/Luca Rossi chiede di entrare/.test(tr)&&await A.evaluate(()=>S.db.kind==='firebase'),'A dopo la ricarica: resta collegato, dati e richiesta di Luca');
// telefono C con codice sbagliato
const [cc,C]=await mk(CFG);await C.goto('http://localhost:8765/index.html#k=SBAGLIATOxxxxxxxxxxxxxx');await C.waitForTimeout(6000);ok(/Accesso non valido/.test(await txt(C)),'C con chiave sbagliata: «Accesso non valido»');
// telefono D senza link: schermata Collega
const [cd,Dp]=await mk(CFG);await Dp.goto('http://localhost:8765/index.html');await Dp.waitForTimeout(5000);ok(/Collega questo telefono/.test(await txt(Dp)),'D senza link: «Collega questo telefono»');
ok(![A,B,C,Dp].some(p=>p.errs.length),'nessun errore nella pagina '+JSON.stringify([A.errs,B.errs,C.errs,Dp.errs]));
await b.close();
