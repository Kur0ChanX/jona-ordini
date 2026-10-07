import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// firebase-config.js vero nascosto: le prove usano solo la configurazione finta (demo-jona) dell'emulatore
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/CERT|favicon|fonts/.test(m.text()))p.errs.push('console: '+m.text().slice(0,200))});return [c,p]};
const txt=p=>p.evaluate(()=>document.body.innerText.slice(0,300).replace(/\n+/g,' | '));
// telefono A (Mario)
const [ca,A]=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
console.log('A start:',await txt(A));
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1500);
await A.click('[data-a="meMenu"]');await A.waitForTimeout(300);await A.click('[data-a="settings"]');await A.waitForTimeout(800);
console.log('A settings:',(await A.$eval('.sheet',e=>e.innerText)).slice(0,200).replace(/\n+/g,' | '));
await A.click('[data-a="fbActivate"]');await A.waitForTimeout(300);await A.click('#ask-ok');
await A.waitForTimeout(8000);
console.log('A after activate:',await txt(A), JSON.stringify(await A.evaluate(()=>S.db.kind+' '+JSON.stringify(S.db.status())+' staff='+Object.keys(D().staff).length+' prod='+Object.keys(D().prodotti).length+' forn='+Object.keys(D().fornitori).length)));
const link=await A.evaluate(()=>inviteLink());console.log('link',link.slice(0,90));
// telefono B (nuovo): senza config, la prende dal link
const [cb,B]=await mk(null);
await B.goto(link);await B.waitForTimeout(6000);
// v24: il telefono nuovo resta in attesa finché A non lo approva
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
console.log('B:',await txt(B), await B.evaluate(()=>S.db.kind+' '+JSON.stringify(S.db.status())+' staff='+Object.keys(D().staff).length+' prod='+Object.keys(D().prodotti).length));
// B si registra come staff
await B.click('[data-a="register"]');await B.waitForTimeout(500);
for(const [k,v] of Object.entries({nome:'Luca',cognome:'Rossi',username:'luca',pw:'luca12345',pw2:'luca12345'}))await B.fill('.sheet input[data-k="'+k+'"]',v);
const rb=await B.$$('.sheet [data-a]');const acts=await Promise.all(rb.map(x=>x.getAttribute('data-a')));console.log('B sheet actions',acts.join(','));
await B.click('.sheet [data-a="regGo"], .sheet [data-a="selfGo"], .sheet .btn.primary');await B.waitForTimeout(2500);
console.log('A staff pending:',await A.evaluate(()=>Object.values(D().staff).map(u=>u.nome+':'+u.stato).join(',')));
// prodotti: A modifica un prodotto e lo sposta di fornitore; B vede
await A.evaluate(async()=>{await upd('prodotti','demo01',{prezzo:9.99});await put('prodotti','nuovo1',{fornitoreId:'dac',nome:'Prodotto nuovo',unita:'pz',prezzo:2,categoria:'Altro',aggiornato:now()});await upd('prodotti','demo02',{fornitoreId:'metro'});await del('prodotti','demo03')});
await A.waitForTimeout(2500);
console.log('B prod:',await B.evaluate(()=>{const P=D().prodotti;return [P.demo01&&P.demo01.prezzo,P.nuovo1&&P.nuovo1.nome,P.demo02&&P.demo02.fornitoreId,!!P.demo03,Object.keys(P).length].join(' / ')}));
// senza rete su A
await ca.setOffline(true);await A.evaluate(()=>window.dispatchEvent(new Event('offline')));
await A.evaluate(async()=>{await upd('config','app',{nomeLocale:'Jona OFFLINE'})});await A.waitForTimeout(800);
console.log('A offline top:',await A.$eval('.top',e=>e.innerText.replace(/\n+/g,' | ')), 'local name:',await A.evaluate(()=>cfg().nomeLocale));
await A.waitForTimeout(1500);console.log('B name while A offline:',await B.evaluate(()=>cfg().nomeLocale));
await ca.setOffline(false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await A.waitForTimeout(6000);
console.log('B name after:',await B.evaluate(()=>cfg().nomeLocale),' A status',await A.evaluate(()=>JSON.stringify(S.db.status())));
// A ricarica: resta collegato, dati presenti
await A.reload();await A.waitForTimeout(5000);console.log('A reload:',await txt(A));
// telefono C con codice sbagliato
const [cc,C]=await mk(CFG);await C.goto('http://localhost:8765/index.html#k=SBAGLIATOxxxxxxxxxxxxxx');await C.waitForTimeout(6000);console.log('C wrong key:',await txt(C));
// telefono D senza link: schermata Collega
const [cd,Dp]=await mk(CFG);await Dp.goto('http://localhost:8765/index.html');await Dp.waitForTimeout(5000);console.log('D no key:',await txt(Dp));
await A.screenshot({path:'/tmp/fA.png'});await B.screenshot({path:'/tmp/fB.png'});
console.log('errors A',A.errs,'B',B.errs,'C',C.errs,'D',Dp.errs);
await b.close();
