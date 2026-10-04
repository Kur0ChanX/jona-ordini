// v31, modalità locale: «In turno oggi» (staff e pianificatore), promemoria ordini per giorno (scheda fornitore, avviso unico,
// niente avviso se l'ordine è già partito), «Consumi e costi» interattivo (confronto col periodo prima, secondo tocco su una barra, Indietro, prodotto).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1,hasTouch:true});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
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

/* 1. In turno oggi */
await pg.evaluate(async()=>{
  const lun=orLun(),g=(new Date().getDay()+6)%7,r=v=>({[g]:v});
  await put('staff','u_luca',{nome:'Luca',cognome:'Bianchi',username:'luca',ruolo:'staff',reparto:'cucina',stato:'attivo',pass:'x',creato:now(),contratto:{ore:40,pausa:30,liberi:1}});
  await put('staff','u_sara',{nome:'Sara',cognome:'Neri',username:'sara',ruolo:'staff',reparto:'sala',stato:'attivo',pass:'x',creato:now(),contratto:{ore:24,pausa:0,liberi:2}});
  await put('staff','u_gino',{nome:'Gino',username:'gino',ruolo:'staff',reparto:'altro',stato:'attivo',pass:'x',creato:now()});
  await put('staff','u_ex',{nome:'Ex',username:'ex',ruolo:'staff',reparto:'sala',stato:'disattivato',pass:'x',creato:now()});
  const tp={u_luca:r('00:00-23:59'),u_sara:r('00:00-00:01'),u_gino:r('R'),u_ex:r('10:00-15:00')};
  await put('config','orari_'+lun,{tipo:'orari',lun,t:tp,tp,pub:now()});
});await wait(300);
await pg.evaluate(()=>{S.tab='staff';render()});await wait(200);
await pg.click('[data-a="staffSub"][data-v="orari"]');await wait(300);
const li=await pg.locator('.or-now li').allInnerTexts();
ok(li.length===2,'manager: 2 people on shift today (no rest day, no deactivated): '+JSON.stringify(li));
ok(li[0].includes('Luca')&&li[0].includes('Adesso'),'Luca on shift now');
ok(li[1].includes('Sara')&&!li[1].includes('Adesso'),'Sara listed, not now');
ok((await pg.locator('.or-nowh').innerText()).includes('2 persone · 1 adesso'),'header counts');
await pg.click('[data-a="orW"][data-v="1"]');await wait(200);
ok(await pg.locator('.or-now').count()===0,'next week: no «In turno oggi»');
await pg.click('[data-a="orW"][data-v="-1"]');await wait(200);
await pg.evaluate(()=>{const id=S.me;const lun=orLun();const w=orWeek(lun);w.tp[id]={[(new Date().getDay()+6)%7]:'09:00-10:00'};return put('config','orari_'+lun,w)});await wait(200);
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
await pg.evaluate(()=>{S.tab='orari';render()});await wait(300);
ok(await pg.locator('.or-now li').count()===3,'staff «I miei orari»: «In turno oggi» shown');
await pg.screenshot({path:'/tmp/v31-oggi.png'});
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal scroll');
await pg.evaluate(()=>{const lun=orLun();const w=orWeek(lun);delete w.tp;return put('config','orari_'+lun,w)});await wait(200);
ok(await pg.evaluate(()=>orOggi())==='','not published: nothing');
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);

/* 2. Promemoria ordini */
await pg.evaluate(()=>{S.tab='fornitori';render()});await wait(200);
const fid=await pg.evaluate(()=>Object.values(D().fornitori).find(f=>!f.oraLimite).id);
await pg.evaluate(f=>supSheet(f,'contatti'),fid);await wait(300);
if(!await pg.locator('.sheet [data-a="feDay"]').count()){await pg.click('.sheet [data-a="suptab"][data-v="contatti"]');await wait(300)}
const g=await pg.evaluate(()=>(new Date().getDay()+6)%7);
ok(await pg.locator('.sheet input#fe-oraPromemoria').count()===0,'reminder time hidden without days');
await pg.click(`.sheet [data-a="feDay"][data-v="${g}"]`);await wait(150);
ok(await pg.locator('.sheet input#fe-oraPromemoria').count()===1,'reminder time shown after choosing a day');
ok((await pg.locator('.sheet').innerText()).includes('alle 10:00'),'default time explained');
await pg.fill('.sheet input#fe-oraPromemoria','00:00');
await pg.click('.sheet [data-a="fsave"]');await wait(300);
const f=await pg.evaluate(id=>D().fornitori[id],fid);
ok(JSON.stringify(f.giorniOrdine)===JSON.stringify([g])&&f.oraPromemoria==='00:00','saved giorniOrdine/oraPromemoria: '+JSON.stringify([f.giorniOrdine,f.oraPromemoria]));
await pg.evaluate(()=>closeSheet());await wait(200);
ok((await pg.locator(`.fcard[data-f="${fid}"]`).innerText()).includes(await pg.evaluate(()=>OR_GG[(new Date().getDay()+6)%7])),'supplier card shows the day');
const cnt=()=>pg.evaluate(id=>Object.values(D().notifiche).filter(n=>n.tipo==='promemoria'&&n.rif===id).length,fid);
await pg.evaluate(()=>deadlineTick());await wait(200);
ok(await cnt()===1,'reminder notification sent');
ok(await pg.evaluate(id=>Object.values(D().notifiche).find(n=>n.tipo==='promemoria'&&n.rif===id).titolo,fid)===`Oggi si ordina da ${f.nome}`,'title');
await pg.evaluate(()=>deadlineTick());await pg.evaluate(()=>{localStorage.removeItem('jona_rem');return deadlineTick()});await wait(200);
ok(await cnt()===1,'not repeated (same phone, or another phone without jona_rem)');
const f2=await pg.evaluate(async()=>{const f=Object.values(D().fornitori).find(x=>!x.giorniOrdine);await upd('fornitori',f.id,{giorniOrdine:[(new Date().getDay()+6)%7],oraPromemoria:'00:00'});
  await put('ordini','o_sent',{fornitoreId:f.id,fornitoreNome:f.nome,stato:'inviato',items:[],richieste:[],creato:now(),inviato:now()});await deadlineTick();
  return Object.values(D().notifiche).filter(n=>n.tipo==='promemoria'&&n.rif===f.id).length});
ok(f2===0,'no reminder when an order to that supplier already left today');
ok(await pg.evaluate(()=>promInfo({id:'x',giorniOrdine:[(new Date().getDay()+6)%7],oraLimite:'00:00'}).due)===false,'no reminder after the cut-off time');

/* 3. Consumi e costi */
await pg.evaluate(async()=>{
  const d0=new Date();const at=(m,day)=>new Date(d0.getFullYear(),d0.getMonth()+m,day,10).getTime();
  const fs=Object.values(D().fornitori).slice(0,2);const L=(n,p,q)=>({key:'l:'+n,pid:'',nome:n,codice:'',unita:'kg',prezzo:p,qta:q,da:[]});
  const O=(id,f,t,items)=>put('ordini',id,{fornitoreId:f.id,fornitoreNome:f.nome,stato:'inviato',items,richieste:[],creato:t,inviato:t});
  await O('r1',fs[0],at(0,1),[L('Riso',2,10)]);await O('r2',fs[1],at(0,1),[L('Burro',10,3)]);await O('r3',fs[0],at(-1,1),[L('Riso',2,5)]);
  await del('ordini','o_sent');
});await wait(200);
await pg.evaluate(()=>{S.rp=null;openReport()});await wait(500);
const cmp=await pg.locator('.rp-cmp').innerText().catch(()=>'');
ok(/\+400%/.test(cmp),'comparison with the same stretch of last month: '+cmp);
const bars=pg.locator('.sheet.rp .bk[data-df]');
ok(await bars.count()===2,'supplier bars can be opened');
const df=await bars.first().getAttribute('data-df');
await bars.first().tap();await wait(300);
ok(await pg.evaluate(()=>S.rp.fid)==='','first tap: only the value');
ok(!(await pg.locator('.rp-tip').isHidden()),'tooltip shown');
await pg.locator('.sheet.rp .bk[data-df]').first().tap();await wait(400);
ok(await pg.evaluate(()=>S.rp.fid)===df,'second tap: only that supplier');
ok(await pg.locator('[data-a="rpBack"]').count()===1,'«Indietro» shown');
await pg.click('[data-a="rpBack"]');await wait(300);
ok(await pg.evaluate(()=>S.rp.fid)===''&&await pg.locator('[data-a="rpBack"]').count()===0,'back to all suppliers');
await pg.click('.sheet [data-a="rpProd"][data-v="Burro"]');await wait(300);
ok(await pg.evaluate(()=>S.rp.q)==='Burro'&&await pg.locator('.rp-t tbody tr').count()===1,'product tap filters');
const tb=pg.locator('.sheet.rp .bk[data-da]');
ok(await tb.count()>=1,'time bars can be opened');
await tb.first().focus();await pg.keyboard.press('Enter');await wait(300);
ok(await pg.evaluate(()=>S.rp.per)==='dal','Enter on a time bar: that period');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'report: no horizontal scroll');
await pg.screenshot({path:'/tmp/v31-report.png'});
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
