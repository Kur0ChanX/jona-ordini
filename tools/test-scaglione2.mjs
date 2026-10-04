// Scaglione 2 (v13), modalità locale: prodotto urgente, avviso aumento prezzi all'import, controllo merce con chi aveva chiesto.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT='/tmp/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const notifs=()=>pg.evaluate(()=>Object.values(D().notifiche).sort((a,b)=>a.creato-b.creato));
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');

/* 1. Prodotto urgente */
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
// prima una richiesta normale, poi una con un prodotto urgente
await pg.evaluate(()=>{S.cart=[{pid:'demo07',qta:1}];saveCart();S.tab='carrello';render()});await wait(200);
ok(await pg.locator('[data-a="curg"]').count()===1,'cart: «È urgente» button per line');
await pg.click('[data-a="csend"]');await wait(500);
await pg.click('.sheet [data-a="closeSheet"].btn');await wait(300);
await pg.evaluate(()=>{S.cart=[{pid:'demo02',qta:2},{pid:'demo01',qta:1}];saveCart();S.tab='carrello';render()});await wait(200);
await pg.locator('[data-a="curg"][data-p="demo02"]').click();await wait(200);
ok(await pg.locator('[data-a="curg"][data-p="demo02"].on').count()===1,'urgent toggle on');
ok((await pg.locator('#app .banner').innerText()).includes('1 prodotto urgente'),'cart banner shows urgent count');
await pg.screenshot({path:OUT+'s2-cart.png'});
await pg.click('[data-a="csend"]');await wait(500);
await pg.click('.sheet [data-a="closeSheet"].btn');await wait(300);
const reqs=await pg.evaluate(()=>Object.values(D().richieste).sort((a,b)=>a.creato-b.creato));
ok(reqs.length===2,'two requests sent');
const ur=reqs[1];
ok(ur.items.find(i=>i.pid==='demo02').urgente===true&&!ur.items.find(i=>i.pid==='demo01').urgente,'only the urgent item has urgente:true');
let ns=await notifs();const nu=ns.find(n=>n.tipo==='urgente');
ok(!!nu&&/^URGENTE: /.test(nu.titolo)&&nu.a==='gm','urgent notification for gm: '+(nu&&nu.titolo));
ok(ns.filter(n=>n.tipo==='richiesta').length===1,'normal request keeps normal notification');
// lo chef vede la richiesta urgente in cima anche se è più recente
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.evaluate(()=>{S.tab='richieste';render()});await wait(300);
const first=pg.locator('#app article.panel').first();
ok(await first.evaluate(e=>e.classList.contains('urg')),'urgent request card is first and marked');
ok((await first.locator('.req-n').innerText()).includes('URGENTE'),'card header says URGENTE');
ok(await first.locator('.tag.urg').count()===2,'header tag + urgent item tag');
await pg.screenshot({path:OUT+'s2-gm.png'});
await pg.evaluate(id=>approve(id),ur.id);await wait(400);
const ord=await pg.evaluate(()=>Object.values(D().ordini));
const L=ord.flatMap(o=>o.items).find(l=>l.pid==='demo02');
ok(L&&L.urgente===true,'order line keeps urgente');

/* 2. Controllo merce: chi aveva chiesto */
const o=ord.find(o=>o.items.some(l=>l.pid==='demo02'));
// la richiesta risulta di un'altra persona, così riceve il suo avviso
await pg.evaluate(id=>upd('richieste',id,{utenteId:'u_luca',utenteNome:'Luca Bianchi'}),ur.id);
await pg.evaluate(oid=>{const o=D().ordini[oid];o.items.forEach(l=>l.da=l.da.map(x=>Object.assign({},x,{n:'Luca Bianchi'})));return put('ordini',oid,Object.assign({},o,{id:undefined}))},o.id);await wait(200);
await pg.evaluate(oid=>{const o=D().ordini[oid];const R=rcvState(oid);o.items.forEach((l,i)=>{R.lines[i].st=l.pid==='demo02'?'ko':'ok'});return confirmReceipt(oid,false)},o.id);await wait(400);
ns=await notifs();
const ng=ns.filter(n=>n.tipo==='arrivo'&&n.a==='gm').pop();
ok(ng&&ng.testo.includes('manca')&&ng.testo.includes('chiesto da Luca'),'gm delivery notification names who asked: '+(ng&&ng.testo));
const nl=ns.find(n=>n.tipo==='arrivo'&&n.a==='u_luca');
ok(nl&&nl.titolo.includes('manca qualcosa')&&nl.testo.includes('manca'),'requester notified: '+(nl&&nl.testo));
const rz=await pg.evaluate(oid=>D().ordini[oid].ricezione.righe,o.id);
ok(rz.find(r=>r.motivo==='mancante').da.join()==='Luca','ricezione.righe keeps who asked');

/* 3. Aumento prezzi all'import */
const p2=await pg.evaluate(()=>{const p=D().prodotti.demo02;return{fid:p.fornitoreId,nome:p.nome,codice:p.codice,unita:p.unita,prezzo:p.prezzo}});
const p1=await pg.evaluate(()=>{const p=D().prodotti.demo07;return{fid:p.fornitoreId,nome:p.nome,codice:p.codice,unita:p.unita,prezzo:p.prezzo}});
const np2=Math.round(p2.prezzo*1.2*100)/100;
await pg.evaluate(([a,c,np])=>{const r=x=>({fid:x.fid,nome:x.nome,codice:x.codice,unita:x.unita,categoria:'Altro',sel:true});
  S.rev={fonte:'Prova',items:[Object.assign(r(a),{prezzo:np}),Object.assign(r(c),{prezzo:Math.round(c.prezzo*0.9*100)/100})]};reviewSheet()},[p2,p1,np2]);await wait(300);
const ban=await pg.locator('.sheet .banner').innerText();
ok(ban.includes('1 prodotto costa di più')&&ban.includes('+20%'),'review banner: '+ban.replace(/\n/g,' | '));
ok(await pg.locator('.sheet .rv .st.ko').count()===1,'one row marked red as increased');
await pg.screenshot({path:OUT+'s2-review.png'});
await pg.click('[data-a="rvok"]');await wait(600);
ok((await pg.locator('.sheet .sh-t').innerText()).startsWith('Prezzi aumentati'),'summary sheet after save');
ns=await notifs();const npz=ns.find(n=>n.tipo==='prezzi');
ok(npz&&npz.a==='gm'&&npz.testo.includes('+20%'),'price notification: '+(npz&&npz.titolo+' / '+npz.testo));
const after=await pg.evaluate(()=>D().prodotti.demo02);
ok(after.prezzo===np2&&after.prezzoPrec===p2.prezzo,'price saved with prezzoPrec');
await pg.screenshot({path:OUT+'s2-ups.png'});
await pg.click('.sheet [data-a="closeSheet"].btn');await wait(300);

ok(errs.length===0,'no pageerror '+JSON.stringify(errs));
await b.close();
console.log(process.exitCode?'SOME FAIL':'ALL PASS');
