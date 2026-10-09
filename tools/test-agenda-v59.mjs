// v59 (modalità locale): agenda per pianificare. Giorno a ore con «Appunti del giorno» personali (spunta, togli, sposta a domani),
// ora vuota → evento a quell'ora, Settimana con giorni toccabili e «+», Mese con «apri il giorno», «Torna a oggi», scorrimento col dito, Enter, 320 px.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block',hasTouch:true});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
const closeAll=async()=>{await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await wait(150)};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(()=>settingsSheet());await wait(300);await pg.click('.sheet [data-a="funzSet"][data-k="agenda"][data-v="1"]');await wait(300);await closeAll();
const oggi=await pg.evaluate(()=>today()),domani=await pg.evaluate(()=>agAdd(today(),1));
await pg.click('header.top [data-a="agOpen"]');await wait(400);

// 1. Giorno: foglio alto, appunti, ore 7-23
ok(await pg.locator('.sheet.tall').count()===1,'agenda in un foglio alto');
ok(await pg.locator('.sheet [data-a="agV"][data-v="oggi"]').innerText()==='Giorno','primo pulsante: «Giorno»');
ok(/Appunti del giorno/.test(await txt('.sheet'))&&await pg.locator('.sheet .ag-hr').count()===17,'Giorno: appunti e 17 righe dalle 7 alle 23');
ok(await pg.locator('.sheet .ag-oggi').count()===0,'su oggi niente «Torna a oggi»');
await pg.fill('#ag-nt','Chiamare il fornitore dei fiori');await pg.click('[data-a="agNtAdd"]');await wait(300);
await pg.fill('#ag-nt','Preparare il menù degustazione');await pg.press('#ag-nt','Enter');await wait(300);
await pg.fill('#ag-nt','Firmare i turni');await pg.press('#ag-nt','Enter');await wait(300);
let n=await pg.evaluate(o=>agNotes(o,realU()).map(x=>x.t),oggi);
ok(n.length===3&&n[1]==='Preparare il menù degustazione','tre appunti (con il pulsante e con Invio) '+JSON.stringify(n));
ok(await pg.evaluate(o=>!!D().config['agnote_'+o.slice(0,7)].n['d'+o.replace(/-/g,'')][realU().id],oggi),'salvati in config/agnote_<mese>, chiave del giorno e della persona');
await pg.click('.sheet [data-a="agNtCk"][data-v="0"]');await wait(300);
ok(await pg.evaluate(o=>agNotes(o,realU())[0].ok===true,oggi)&&await pg.locator('.sheet .ag-ntr .ag-ct.ok').count()===1,'spunta del primo appunto');
await pg.click('.sheet [data-a="agNtDel"][data-v="2"]');await wait(300);
ok(await pg.evaluate(o=>agNotes(o,realU()).length===2,oggi),'«Firmare i turni» tolto');
ok(/Sposta a domani i non fatti \(1\)/.test(await txt('.sheet')),'«Sposta a domani i non fatti (1)»');
await pg.click('[data-a="agNtMove"]');await wait(400);
ok(await pg.evaluate(([o,d])=>agNotes(o,realU()).map(x=>x.t+(x.ok?'✓':'')).join('|')==='Chiamare il fornitore dei fiori✓'&&agNotes(d,realU()).map(x=>x.t).join('|')==='Preparare il menù degustazione',[oggi,domani]),'non fatti spostati a domani, fatti restano oggi');

// 2. ora vuota → nuovo evento a quell'ora
await pg.click('.sheet [data-a="agNewAt"][data-v="15:00"]');await wait(300);
ok(await pg.locator('#agf-h').inputValue()==='15:00'&&await pg.locator('#agf-g').inputValue()===oggi,'tocco sulle 15:00: modulo con data di oggi e ora 15:00');
await pg.fill('#agf-t','Riunione fornitori');await pg.click('[data-a="agSave"]');await wait(400);
ok(await pg.locator('.sheet .ag-hr:has(.ag-hl:text("15:00")) .ag-ev').count()===1,'evento nella riga delle 15:00');

// 3. scorrimento col dito e «Torna a oggi»
const swipe=async dx=>{await pg.evaluate(dx=>{const el=document.querySelector('.ag-body');const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+40;
  const t=(cx)=>new Touch({identifier:1,target:el,clientX:cx,clientY:y});
  el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[t(x)],changedTouches:[t(x)]}));
  el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[t(x+dx)]}))},dx);await wait(300)};
await swipe(-120);ok(await pg.evaluate(d=>S.ag.g===d,domani),'scorrere a sinistra: giorno dopo');
ok(/Preparare il menù degustazione/.test(await txt('.sheet'))&&await pg.locator('.sheet .ag-oggi').count()===1,'domani: appunto spostato e «Torna a oggi»');
await swipe(30);ok(await pg.evaluate(d=>S.ag.g===d,domani),'scorrimento corto: niente cambio');
await pg.click('[data-a="agToday"]');await wait(300);ok(await pg.evaluate(o=>S.ag.g===o,oggi),'«Torna a oggi»');
await swipe(120);ok(await pg.evaluate(o=>S.ag.g===agAdd(o,-1),oggi),'scorrere a destra: giorno prima');
await pg.click('[data-a="agToday"]');await wait(300);

// 4. Settimana: giorno toccabile e «+»
await pg.click('[data-a="agV"][data-v="sett"]');await wait(300);
ok(await pg.locator('.sheet .ag-dt').count()===7&&await pg.locator('.sheet [data-a="agDayGo"]').count()===7,'Settimana: 7 giorni toccabili');
ok(new RegExp('1 appunto').test(await pg.locator(`.sheet [data-a="agDayGo"][data-v="${domani}"]`).innerText().catch(()=>''))||(await pg.evaluate(d=>agLun(d)!==agLun(today()),domani)),'Settimana: domani mostra «1 appunto»');
await pg.click(`.sheet [data-a="agNewAt"][data-g="${oggi}"]`);await wait(300);
ok(await pg.locator('#agf-g').inputValue()===oggi&&await pg.locator('#agf-h').inputValue()==='','«+» nella settimana: evento in quel giorno, senza ora');
await pg.evaluate(()=>closeSheet(true));await wait(200);
await pg.click(`.sheet [data-a="agDayGo"][data-v="${oggi}"]`);await wait(300);
ok(await pg.evaluate(o=>S.ag.v==='oggi'&&S.ag.g===o,oggi),'tocco sul giorno: vista Giorno');

// 5. Mese: «apri il giorno»
await pg.click('[data-a="agV"][data-v="mese"]');await wait(300);
await pg.click(`.ag-c[data-v="${oggi}"]`);await wait(300);
ok(/apri il giorno/.test(await txt('.sheet')),'Mese: tocco sul giorno → «apri il giorno»');
await pg.click(`.sheet [data-a="agDayGo"][data-v="${oggi}"]`);await wait(300);
ok(await pg.evaluate(()=>S.ag.v==='oggi'),'«apri il giorno»: vista Giorno');

// 6. gli appunti sono personali; lo staff non vede appunti né ore
await closeAll();
await pg.evaluate(async o=>{const k='d'+o.replace(/-/g,''),doc='agnote_'+o.slice(0,7);await upd('config',doc,{['n.'+k+'.altro']:[{t:'Appunto di un altro',ok:false}]})},oggi);
await pg.click('header.top [data-a="agOpen"]');await wait(300);
ok(!/Appunto di un altro/.test(await txt('.sheet')),'appunti di un altro non visibili');
await closeAll();
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
await pg.evaluate(()=>agOpen());await wait(300);
ok(!/Appunti del giorno/.test(await txt('.sheet'))&&await pg.locator('.sheet .ag-hr').count()===0,'staff: niente appunti né righe delle ore');
await closeAll();await pg.click('[data-a="viewAs"][data-v="dev"]');await wait(300);

// 6b. due scritture di fila su un mese senza documento: niente sovrascrittura
const due=await pg.evaluate(async()=>{const u=realU(),g='2031-03-10',g2='2031-03-11';await Promise.all([agNotesPut(g,u,[{t:'A',ok:false}]),agNotesPut(g2,u,[{t:'B',ok:false}])]);await new Promise(r=>setTimeout(r,300));return agNotes(g,u).length+agNotes(g2,u).length});
ok(due===2,'due giorni nuovi dello stesso mese scritti di fila: restano entrambi ('+due+')');

// 7. 320 px
await pg.setViewportSize({width:320,height:700});await pg.evaluate(()=>agOpen());await wait(300);
for(const v of ['oggi','sett','mese']){await pg.click(`[data-a="agV"][data-v="${v}"]`);await wait(250);
  ok(await pg.evaluate(()=>{const s=document.querySelector('.sheet');return s.scrollWidth<=s.clientWidth+1}),'320 px senza scorrimento orizzontale: '+v)}
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
