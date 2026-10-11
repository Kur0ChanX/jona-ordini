// v81 (modalità locale): ripetizioni dell'agenda (ogni giorno, giorni scelti, anno, «fino al», giorni saltati), modulo con i controlli,
// «Salta solo …», spunta per giorno negli eventi ripetuti, riga veloce «ogni lunedì», striscia con «Appunto» e appunti veloci,
// coperti dell'agenda nell'ordine suggerito (giorno normale, «Ignora»), 320 px. Date fisse o relative a «oggi» (E18).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const METEO={daily:{time:[0,1,2,3,4,5,6].map(i=>new Date(Date.now()+i*864e5).toISOString().slice(0,10)),weather_code:[0,0,0,0,0,0,0],temperature_2m_max:[22,22,22,22,22,22,22],precipitation_probability_max:[40,40,40,40,40,40,40]}};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
await ctx.route('https://api.open-meteo.com/**',r=>r.fulfill({json:METEO}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
const closeAll=async()=>{await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await wait(150)};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(async()=>{await put('config','app',Object.assign({},cfg(),{funz:{agenda:true}}));
  await put('staff','luca',{id:'luca',nome:'Luca',cognome:'Test',username:'luca',ruolo:'staff',reparto:'cucina',stato:'attivo',creato:1})});
await wait(400);
const oggi=await pg.evaluate(()=>today());

// 1. agOnDay per ogni tipo (date fisse: 01/03/2027 è lunedì)
const R=await pg.evaluate(()=>{const on=(e,g)=>agOnDay(e,g)?1:0;return{
  no:[on({g:'2027-03-01'},'2027-03-01'),on({g:'2027-03-01'},'2027-03-02')].join(''),
  g:[on({g:'2027-03-01',r:'g'},'2027-02-28'),on({g:'2027-03-01',r:'g'},'2027-03-01'),on({g:'2027-03-01',r:'g'},'2027-03-09')].join(''),
  gs:['2027-03-01','2027-03-02','2027-03-03','2027-03-08','2027-03-10'].map(g=>on({g:'2027-03-01',r:'gs',rg:[0,2]},g)).join(''),
  s:[on({g:'2027-03-01',r:'s'},'2027-03-08'),on({g:'2027-03-01',r:'s'},'2027-03-09')].join(''),
  m:[on({g:'2027-03-01',r:'m'},'2027-04-01'),on({g:'2027-03-01',r:'m'},'2027-04-02')].join(''),
  a:[on({g:'2027-03-01',r:'a'},'2028-03-01'),on({g:'2027-03-01',r:'a'},'2027-04-01')].join(''),
  rf:['2027-03-05','2027-03-06','2027-03-07'].map(g=>on({g:'2027-03-01',r:'g',rf:'2027-03-06'},g)).join(''),
  rx:['2027-03-02','2027-03-03'].map(g=>on({g:'2027-03-01',r:'g',rx:['2027-03-03']},g)).join(''),
  lbl:[agRLbl({g:'2027-03-01',r:'gs',rg:[2,0]}),agRLbl({g:'2027-03-01',r:'g',rf:'2027-11-03'}),agRLbl({g:'2027-03-01',r:'gs',rg:[0,1,2,3,4,5,6]})]}});
ok(R.no==='10','senza ripetizione: solo il suo giorno');
ok(R.g==='011','ogni giorno: dalla data in poi, non prima');
ok(R.gs==='10111','giorni scelti lun+mer: '+R.gs);
ok(R.s==='10'&&R.m==='10'&&R.a==='10','ogni settimana / mese / anno');
ok(R.rf==='110','«fino al» compreso, poi basta');
ok(R.rx==='10','giorno saltato: solo quello');
ok(R.lbl[0]==='ogni lun, mer'&&R.lbl[1]==='ogni giorno fino al 3 novembre'&&R.lbl[2]==='ogni giorno','etichette '+JSON.stringify(R.lbl));

// 2. riga veloce
const P=await pg.evaluate(()=>{const base=new Date(2027,2,3,9,0);return[agParse('riunione ogni lunedì alle 10',base),agParse('pulizia cappa tutti i giorni',base),agParse('inventario ogni mese il 5',base),agParse('briefing tutti i venerdì',base)]});
ok(P[0].r==='s'&&P[0].g==='2027-03-08'&&P[0].h==='10:00'&&P[0].t==='Riunione','«ogni lunedì alle 10» → ogni settimana dal prossimo lunedì '+JSON.stringify(P[0]));
ok(P[1].r==='g'&&P[1].t==='Pulizia cappa','«tutti i giorni» → ogni giorno '+JSON.stringify(P[1]));
ok(P[2].r==='m'&&P[2].g==='2027-03-05','«ogni mese il 5» → ogni mese '+JSON.stringify(P[2]));
ok(P[3].r==='s'&&P[3].g==='2027-03-05'&&P[3].t==='Briefing','«tutti i venerdì» → ogni settimana '+JSON.stringify(P[3]));

// 3. modulo: giorni scelti e «fino al»
await pg.evaluate(()=>agOpen());await wait(300);await pg.click('[data-a="agNew"]');await wait(300);
ok(await pg.locator('.sheet [data-a="agfR"]').count()===6,'«Ripeti»: 6 scelte');
await pg.fill('#agf-t','Pulizia celle');await pg.fill('#agf-g',oggi);
await pg.click('.sheet [data-a="agfR"][data-v="gs"]');await wait(200);
ok(await pg.locator('.sheet [data-a="agfRg"]').count()===7&&await pg.locator('.sheet [data-a="agfRg"][aria-pressed="true"]').count()===1,'giorni scelti: 7 chip, già acceso il giorno della data');
const wd=await pg.evaluate(g=>agWd(g),oggi);
await pg.click(`.sheet [data-a="agfRg"][data-v="${wd}"]`);await wait(150);
await pg.click('[data-a="agSave"]');await wait(300);
ok(/Scegli almeno un giorno/.test(await txt('#toasts')),'nessun giorno: avviso');
const wd2=(wd+2)%7;
await pg.click(`.sheet [data-a="agfRg"][data-v="${wd}"]`);await pg.click(`.sheet [data-a="agfRg"][data-v="${wd2}"]`);await wait(150);
const ieri=await pg.evaluate(g=>agAdd(g,-1),oggi),fino=await pg.evaluate(g=>agAdd(g,30),oggi);
await pg.fill('#agf-rf',ieri);await pg.click('[data-a="agSave"]');await wait(300);
ok(/«Fino al» viene prima/.test(await txt('#toasts')),'«fino al» prima della data: avviso');
await pg.fill('#agf-rf',fino);await pg.click('[data-a="agSave"]');await wait(500);
const e1=await pg.evaluate(()=>{const e=agAll().find(x=>x.t==='Pulizia celle');return e&&{id:e.id,doc:e.doc,r:e.r,rg:e.rg,rf:e.rf}});
ok(e1&&e1.doc==='agenda_ric'&&e1.r==='gs'&&e1.rg.join()===[wd,wd2].sort().join()&&e1.rf===fino,'salvato in agenda_ric con giorni e «fino al» '+JSON.stringify(e1));
ok(await pg.evaluate(o=>[0,1,2,7].map(i=>agOnDay(agGet(o.id),agAdd(o.g,i))?1:0).join(''),{id:e1.id,g:oggi})==='1011','compare oggi, dopodomani e tra una settimana, non domani');

// 4. «Salta solo …»
await closeAll();
const d2=await pg.evaluate(g=>agAdd(g,7),oggi);
await pg.evaluate(o=>A.agEdit({v:o.id,g:o.g}),{id:e1.id,g:d2});await wait(300);
ok(await pg.locator('.sheet .ag-skip').count()===1,'evento ripetuto aperto da un giorno: «Salta solo …»');
await pg.click('.sheet .ag-skip');await wait(300);await pg.click('#ask-ok');await wait(500);
ok(await pg.evaluate(o=>{const e=agGet(o.id);return (e.rx||[]).join()===o.g&&!agOnDay(e,o.g)&&agOnDay(e,o.o)},{id:e1.id,g:d2,o:oggi}),'giorno saltato: sparito solo quello');
await pg.evaluate(id=>A.agEdit({v:id}),e1.id);await wait(300);
ok(await pg.locator('.sheet .ag-skip').count()===0,'aperto senza giorno: niente «Salta solo»');
await closeAll();

// 5. spunta per giorno negli eventi ripetuti
await pg.evaluate(async o=>{await agPut('agenda_ric',{rc1:{k:'ev',t:'Controllo temperature',g:o,h:'',cop:0,note:'',vis:'tutti',rep:[],per:[],da:realU().id,cr:1,mod:now(),r:'g',av:[],cl:[{t:'Celle',ok:false},{t:'Abbattitore',ok:false}]}})},oggi);await wait(300);
const dm=await pg.evaluate(g=>agAdd(g,1),oggi);
await pg.evaluate(async v=>{await A.agCk({v})},'rc1|0|'+oggi);await wait(300);
ok(await pg.evaluate(o=>{const e=agGet('rc1');return [agCkOk(e,0,o.g),agCkOk(e,0,o.d),agCkOk(e,1,o.g),!!e.cl[0].ok].map(x=>x?1:0).join('')},{g:oggi,d:dm})==='1000','spunta di oggi: vale solo per oggi, domani resta da fare');
await pg.evaluate(async v=>{await A.agCk({v})},'rc1|0|'+oggi);await wait(300);
ok(await pg.evaluate(g=>!agCkOk(agGet('rc1'),0,g),oggi),'seconda spunta: tolta');

// 6. striscia con «Appunto»
await pg.evaluate(()=>{S.tab=DEV_TABS[0].id;render()});await wait(300);
{const t=await txt('.ag-strip');ok(await pg.locator('.ag-strip.ag-can [data-a="agNtQ"]').count()===1&&/Oggi in hotel/.test(t)&&/Controllo temperature/.test(t),'striscia: eventi di oggi + «Appunto» '+t)}
await pg.evaluate(async()=>{await agPut('agenda_ric',{rc1:null,[agAll().find(x=>x.t==='Pulizia celle').id]:null})});await wait(300);
ok(/Oggi niente in agenda/.test(await txt('.ag-strip')),'senza eventi oggi: «Oggi niente in agenda» nella prima scheda');
await pg.evaluate(()=>{S.tab=DEV_TABS[1].id;render()});await wait(300);
ok(await pg.locator('.ag-strip').count()===0,'senza eventi oggi: niente striscia nelle altre schede');
await pg.evaluate(()=>{S.viewAs='staff';S.tab=STAFF_TABS[0].id;render()});await wait(300);
ok(await pg.locator('[data-a="agNtQ"]').count()===0,'staff: niente «Appunto»');
await pg.evaluate(()=>{S.viewAs='dev';S.tab=DEV_TABS[0].id;render()});await wait(300);

// 7. appunti veloci
await pg.click('.ag-strip [data-a="agNtQ"]');await wait(400);
ok(/Appunti di oggi/.test(await txt('.sheet'))&&await pg.evaluate(()=>document.activeElement&&document.activeElement.id==='ag-nt'),'foglio «Appunti di oggi» con la tastiera aperta');
await pg.fill('#ag-nt','Chiamare il pescivendolo');await pg.keyboard.press('Enter');await wait(400);
ok(await pg.evaluate(()=>agNotes(today(),realU()).map(x=>x.t).join())==='Chiamare il pescivendolo','appunto salvato');
await closeAll();
ok(/1 appunto/.test(await txt('.ag-strip')),'striscia: «1 appunto»');
await pg.setViewportSize({width:320,height:700});await wait(300);
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'striscia con «Appunto» a 320 px senza scorrimento orizzontale');
await pg.setViewportSize({width:390,height:800});await wait(200);

// 8. coperti dell'agenda nell'ordine suggerito
const F=await pg.evaluate(async()=>{S.viewAs='gm';const ps=prods();const f=ps[0].fornitoreId;const pp=ps.filter(p=>p.fornitoreId===f).slice(0,3);
  for(let i=0;i<6;i++){const t=Date.now()-(6-i)*3*864e5;await put('ordini','h'+i,{fornitoreId:f,fornitoreNome:forn(f).nome,stato:'inviato',inviato:t,creato:t,
    items:pp.map((p,j)=>({key:p.id,pid:p.id,nome:p.nome,unita:p.unita,prezzo:p.prezzo,qta:(j+1)*4,da:[]}))})}
  const c=Object.assign({},cfg());delete c.copNorm;await put('config','app',c);
  await agPut('agenda_'+agAdd(today(),1).slice(0,7),{gr1:{k:'ev',t:'Gruppo Rossi',g:agAdd(today(),1),h:'20:00',cop:40,note:'',vis:'tutti',rep:[],per:[],da:realU().id,cr:1,mod:now(),r:'',av:[],cl:[]}});
  return{f}});
await wait(300);
await pg.evaluate(f=>{sugSheet();S.sug.fid=f;refreshSheet()},F.f);await wait(600);
let T=await txt('.sheet');
ok(/In agenda: 40 coperti/.test(T)&&/Gruppo Rossi 40/.test(T),'«In agenda: 40 coperti · … Gruppo Rossi 40» '+T.slice(0,300));
ok(await pg.locator('#sug-cn').count()===1,'senza giorno normale: campo «Coperti in un giorno normale»');
const sum=()=>pg.evaluate(()=>sugRows().reduce((a,r)=>a+r.base,0));
const s0=await sum();
await pg.fill('#sug-cn','60');await pg.click('.sheet [data-a="sugCnSave"]');await wait(400);
ok(await pg.evaluate(()=>cfg().copNorm)===60,'giorno normale salvato: 60');
const cad=await pg.evaluate(f=>sugStats(f).cad,F.f),pct=Math.round(40/(60*cad)*100);
T=await txt('.sheet');ok(new RegExp('Eventi: \\+'+pct+'%').test(T)&&/giorno normale 60 coperti/.test(T),'«Eventi: +'+pct+'% (giorno normale 60 coperti)»');
const s1=await sum();ok(s1>s0,'con l\'agenda le quantità salgono ('+s0+' → '+s1+')');
await pg.click('.sheet [data-a="sugAg"][data-v="0"]');await wait(200);
ok(await sum()===s0,'«Ignora»: quantità come senza agenda');
await pg.setViewportSize({width:320,height:700});await wait(300);
ok(await pg.evaluate(()=>{const s=document.querySelector('.sheet');return s.scrollWidth<=s.clientWidth+1}),'ordine suggerito con l\'agenda a 320 px senza scorrimento orizzontale');
await closeAll();
// agenda spenta: niente coperti
await pg.evaluate(async()=>{await put('config','app',Object.assign({},cfg(),{funz:{agenda:false}}))});await wait(300);
ok(await pg.evaluate(f=>sugAgenda(sugStats(f).cad)===null,F.f),'funzione agenda spenta: l\'ordine suggerito non guarda l\'agenda');

ok(!errs.length,'nessun errore JS '+JSON.stringify(errs));
await b.close();
