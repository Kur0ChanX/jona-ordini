import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const SP='/tmp/'; // copia di SheetJS: curl -o /tmp/xlsx.full.min.js https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
const URL='http://localhost:8765/index.html';
const XLSXJS=fs.readFileSync(SP+'xlsx.full.min.js','utf8');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// modalità locale: firebase-config.js nascosto (vedi README)
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};

async function setup(ctx){
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await pg.route('**/xlsx.full.min.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:XLSXJS}));
  await pg.goto(URL);
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');
  await pg.waitForSelector('.testbar');
  return {pg,errs};
}
// realistic data: 7 sent orders over ~80 days, 4 suppliers (incl. mariano), 1 open order, 1 very old order
async function seed(pg){
  await pg.evaluate(async()=>{
    const ago=(d,h=10)=>{const x=new Date();x.setHours(h,0,0,0);x.setDate(x.getDate()-d);return x.getTime()};
    await put('prodotti','tr_riso',{fornitoreId:'metro',nome:'Riso Carnaroli 1 kg',codice:'RIS-1',unita:'pz',prezzo:3.2,categoria:'Secco e dispensa',aggiornato:now()});
    const L=(pid,nome,unita,prezzo,qta,da,codice='')=>({key:pid||('l:'+norm(nome)),pid,nome,codice,unita,prezzo,qta,da:da.map(([n,r,q])=>({n,r,q}))});
    const O=(id,fid,d,items,x={})=>put('ordini',id,Object.assign({fornitoreId:fid,fornitoreNome:forn(fid).nome,stato:'inviato',items,richieste:[],creato:ago(d,9),inviato:ago(d),inviatoDa:S.me,metodo:''},x));
    await O('tr_o1','metro',80,[L('tr_riso','Riso Carnaroli 1 kg','pz',3.2,10,[['Luca Bianchi','cucina',6],['Anna Verdi','sala',4]],'RIS-1'),L('demo03','Farina tipo 00, sacco 25 kg','sacco',18.9,2,[['Luca Bianchi','cucina',2]])]);
    await O('tr_o2','mariano',60,[L('mar05','Pomodoro ramato','kg',null,5,[['Luca Bianchi','cucina',5]]),L('mar12','Basilico','pz',0.8,10,[['Luca Bianchi','cucina',6],['Anna Verdi','sala',4]])]);
    await O('tr_o3','nieddittas',40,[L('demo08','Arselle','kg',14,3,[['Luca Bianchi','cucina',3]]),L('demo07','Cozze nere di Arborea','kg',3.2,6,[['Luca Bianchi','cucina',4],['Anna Verdi','sala',2]])]);
    await O('tr_o4','mariano',20,[L('mar17','Zucchine','kg',2.5,4,[['Luca Bianchi','cucina',4]]),L('mar12','Basilico','pz',0.8,5,[['Anna Verdi','sala',5]]),L('mar06','Fragole','pz',null,3,[['Anna Verdi','sala',3]])]);
    await O('tr_o5','metro',10,[L('tr_riso','Riso Carnaroli 1 kg','pz',3.2,5,[['Luca Bianchi','cucina',5]],'RIS-1'),L('demo04',"Olio extravergine d'oliva 5 l",'latta',42.5,1,[['Luca Bianchi','cucina',1]])]);
    await O('tr_o6','mariano',2,[L('mar17','Zucchine','kg',2.5,6,[['Luca Bianchi','cucina',6]]),L('mar03','Melone retato','pz',3,2,[['Anna Verdi','sala',2]])],
      {ricevuto:ago(1),ricevutoDa:S.me,ricevutoNome:'Mario Rossi',differenze:1,ricezione:{righe:[{nome:'Zucchine',codice:'',unita:'kg',qta:6,arr:5,motivo:'quantita'},{nome:'Melone retato',codice:'',unita:'pz',qta:2,arr:2,motivo:''}],note:'',foto:''}});
    await O('tr_o7','dolpa',30,[L('','Riso Carnaroli 1 kg','pz',2.9,4,[['Anna Verdi','sala',4]])]);
    await O('tr_o8','metro',400,[L('tr_riso','Riso Carnaroli 1 kg','pz',3.2,100,[['Luca Bianchi','cucina',100]],'RIS-1')]);
    await put('ordini','aperto_mariano',{fornitoreId:'mariano',fornitoreNome:'F.lli Mariano',stato:'aperto',items:[L('mar17','Zucchine','kg',2.5,50,[['Luca Bianchi','cucina',50]])],richieste:[],creato:ago(0)});
  });
  await pg.waitForTimeout(300);
}
const kpi=pg=>pg.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.sheet.rp .rp-kt')].map(t=>[t.querySelector('span').textContent,t.querySelector('b').textContent.replace(/ /g,' ')])));
const eurS=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n).replace(/ /g,' ');
const note=pg=>pg.evaluate(()=>[...document.querySelectorAll('.sheet.rp .rp-note')].map(n=>n.textContent.trim()).join(' | '));
const W=ms=>new Promise(r=>setTimeout(r,ms));
const scr=async(pg,y,f)=>{await pg.evaluate(y=>{const s=document.querySelector('.sheet.rp');s.scrollTop=y<0?s.scrollHeight:y},y);await W(150);await pg.screenshot({path:SP+f})};

/* ---------- phone, light ---------- */
{
  const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:2,acceptDownloads:true});
  const {pg,errs}=await setup(ctx);await seed(pg);
  // staff: no entry
  await pg.click('[data-a="viewAs"][data-v="staff"]');await W(300);
  await pg.evaluate(()=>{S.tab='storico';render()});await W(200);
  ok(await pg.locator('[data-a="rpOpen"]').count()===0,'staff: no "Consumi e costi" button');
  await pg.evaluate(()=>A.rpOpen());await W(300);
  ok(await pg.locator('.sheet.rp').count()===0,'staff: rpOpen action does nothing');
  // chef
  await pg.click('[data-a="viewAs"][data-v="gm"]');await W(300);
  await pg.click('[data-a="tab"][data-v="storico"]');await W(300);
  const btn=pg.locator('[data-a="rpOpen"]');ok(await btn.count()===1,'chef: button present in Storico');
  ok(await pg.evaluate(()=>{const w=document.querySelector('.wk'),r=document.querySelector('[data-a="rpOpen"]');return !!(w&&r&&(w.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING))}),'button is below weekly summary');
  await pg.screenshot({path:SP+'rp0-storico.png'});
  await btn.click();await W(500);
  ok(await pg.locator('.sheet.rp').count()===1,'sheet opened');
  // Ultimi 3 mesi, tutti
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="tre"]');await W(250);
  let k=await kpi(pg);console.log('  KPI 3 mesi:',JSON.stringify(k));
  ok(k['Spesa totale']===eurS(241.6),'3 mesi tot 241,60: '+k['Spesa totale']);
  ok(k['Ordini']==='7','3 mesi ordini 7');ok(k['Prodotti diversi']==='11','3 mesi prodotti 11: '+k['Prodotti diversi']);
  ok(!('Quantità totale' in k),'no qty tile without product filter');
  let nt=await note(pg);console.log('  notes:',nt);
  ok(nt.includes('2 righe senza prezzo, escluse dal totale'),'missing price note (2)');
  ok(nt.includes('Quantità arrivate per 1 consegna controllata, ordinate per gli altri 6 ordini'),'quantity source note');
  ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per fornitore','chart = per supplier');
  ok(await pg.locator('.sheet.rp .rp-svg .bar').count()===4,'4 supplier bars: '+await pg.locator('.sheet.rp .rp-svg .bar').count());
  const vls=await pg.$$eval('.sheet.rp .rp-svg .vl',a=>a.map(x=>x.textContent.replace(/ /g,' ')));
  ok(JSON.stringify(vls)===JSON.stringify([128.3,61.2,40.5,11.6].map(eurS)),'supplier values sorted: '+vls);
  const fills=await pg.$$eval('.sheet.rp .rp-svg .bar',a=>a.map(x=>x.getAttribute('style')));
  const fc=await pg.evaluate(()=>['metro','nieddittas','mariano','dolpa'].map(f=>'--c:'+fcolor(f)));
  ok(JSON.stringify(fills)===JSON.stringify(fc),'bars use supplier colors');
  const rows=await pg.$$eval('.sheet.rp .rp-t tbody tr',a=>a.map(r=>[...r.cells].map(c=>c.innerText.replace(/ /g,' ').replace(/\n/g,' / '))));
  console.log('  first rows:',JSON.stringify(rows.slice(0,3)));
  ok(rows.length===11&&rows[0][0].startsWith('Riso Carnaroli 1 kg')&&rows[0][0].includes('Metro')&&rows[0][1]==='15 pz'&&rows[0][2].startsWith(eurS(48)),'top row = riso Metro 15 pz 48 €');
  ok(rows[0][2].includes('media '+eurS(3.2)+'/pz'),'average price shown');
  const pom=rows.find(r=>r[0].startsWith('Pomodoro'));ok(pom&&pom[2].includes('—')&&pom[2].includes('senza prezzo'),'no-price product shown with dash');
  const zuc=rows.find(r=>r[0].startsWith('Zucchine'));ok(zuc&&zuc[1]==='9 kg'&&zuc[2].startsWith(eurS(22.5)),'zucchine uses arrived qty (4+5=9 kg, 22,50 €): '+zuc);
  await pg.screenshot({path:SP+'rp1-phone-light.png'});await scr(pg,560,'rp1b-phone-light-chart.png');await scr(pg,-1,'rp1c-phone-light-table.png');await scr(pg,0,'x.png');
  // tooltip on a bar
  await pg.locator('.sheet.rp .rp-svg .bk').first().hover();await W(150);
  const tip=await pg.evaluate(()=>{const t=document.querySelector('.sheet.rp .rp-tip');return t&&!t.hidden?t.textContent.replace(/ /g,' '):''});
  ok(tip.startsWith(eurS(128.3))&&tip.includes('Metro')&&tip.includes('53% della spesa'),'tooltip: '+tip);
  // Excel
  const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('.sheet.rp [data-a="rpXls"]')]);
  const fp=SP+'rp-test.xlsx';await dl.saveAs(fp);ok(/^consumi-e-costi_\d{4}-\d\d-\d\d_\d{4}-\d\d-\d\d\.xlsx$/.test(dl.suggestedFilename()),'download name '+dl.suggestedFilename());
  const x=await pg.evaluate(b64=>{const wb=XLSX.read(b64,{type:'base64'});const p=XLSX.utils.sheet_to_json(wb.Sheets.Prodotti,{header:1});const r=XLSX.utils.sheet_to_json(wb.Sheets.Righe,{header:1});
    const c=wb.Sheets.Righe.A2;return{names:wb.SheetNames,p,r,a2:c&&{t:c.t,v:c.v,z:c.z,w:XLSX.utils.format_cell(c)}}},fs.readFileSync(fp).toString('base64'));
  ok(JSON.stringify(x.names)==='["Prodotti","Righe"]','xlsx sheets: '+x.names);
  const totRow=x.p.find(r=>r[4]==='Totale');ok(totRow&&Math.abs(totRow[5]-241.6)<1e-9,'xlsx total 241.6: '+JSON.stringify(totRow));
  const hdr=x.p.findIndex(r=>r[0]==='Prodotto');ok(hdr>0&&x.p[hdr+1][0]==='Riso Carnaroli 1 kg'&&x.p[hdr+1][2]===15&&x.p[hdr+1][5]===48,'xlsx first product row: '+JSON.stringify(x.p[hdr+1]));
  ok(x.r.length===18&&x.r[0].join()==='Data,Fornitore,Prodotto,Codice,Quantità,Unità,Prezzo,Totale,Reparto,Quantità contata','xlsx Righe: 17 lines + header ('+x.r.length+')');
  const d80=(()=>{const d=new Date();d.setDate(d.getDate()-80);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()})();ok(x.a2&&x.a2.t==='n'&&x.a2.w===d80,'xlsx date cell is a real date shown dd/mm/yyyy ('+d80+'): '+JSON.stringify(x.a2));
  const sumR=x.r.slice(1).reduce((s,r)=>s+(typeof r[7]==='number'?r[7]:0),0);ok(Math.abs(sumR-241.6)<0.011,'xlsx Righe totals sum to 241.60: '+sumR);
  ok(x.r.slice(1).some(r=>r[2]==='Zucchine'&&r[4]===5&&r[9]==='arrivata'),'xlsx: received line marked "arrivata" with qty 5');
  // supplier Mariano
  await pg.selectOption('#rp-f','mariano');await W(250);
  k=await kpi(pg);console.log('  KPI Mariano:',JSON.stringify(k));
  ok(k['Spesa totale']===eurS(40.5)&&k['Ordini']==='3'&&k['Prodotti diversi']==='5','Mariano: 40,50 €, 3 ordini, 5 prodotti');
  nt=await note(pg);ok(nt.includes('2 righe senza prezzo'),'Mariano: 2 missing prices');
  ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per settimana','Mariano: weekly chart');
  const expWeeks=await pg.evaluate(()=>{const a=new Date();a.setHours(0,0,0,0);a.setMonth(a.getMonth()-3);a.setDate(a.getDate()-(a.getDay()+6)%7);const e=new Date();e.setHours(0,0,0,0);e.setDate(e.getDate()+1);let n=0;for(const c=new Date(a);c<e;c.setDate(c.getDate()+7))n++;return n});
  ok(await pg.locator('.sheet.rp .rp-svg .bk').count()===expWeeks,'Mariano: '+expWeeks+' week slots');
  ok(await pg.locator('.sheet.rp .rp-svg .bar').count()===3,'Mariano: 3 non-empty week bars');
  ok(await pg.locator('.sheet.rp .rp-svg .bar.sup').count()===3,'Mariano bars in supplier color');
  await pg.screenshot({path:SP+'rp2-phone-mariano.png'});
  await pg.evaluate(()=>{const s=document.querySelector('.sheet.rp');s.scrollTop=520});await W(150);
  await pg.screenshot({path:SP+'rp2b-phone-mariano-chart.png'});
  // Mariano + sala
  await pg.selectOption('#rp-r','sala');await W(250);
  k=await kpi(pg);ok(k['Spesa totale']===eurS(13.2)&&k['Ordini']==='3','Mariano+sala: 13,20 €, 3 ordini: '+JSON.stringify(k));
  // sala, tutti
  await pg.selectOption('#rp-f','');await W(250);
  k=await kpi(pg);console.log('  KPI sala:',JSON.stringify(k));
  ok(k['Spesa totale']===eurS(44)&&k['Ordini']==='6'&&k['Prodotti diversi']==='6','sala: 44,00 €, 6 ordini, 6 prodotti');
  nt=await note(pg);ok(nt.includes('1 riga senza prezzo, esclusa dal totale')&&nt.includes('divisa in proporzione'),'sala notes: '+nt);
  await pg.selectOption('#rp-r','');await W(200);
  // product riso
  await pg.fill('#rp-q','riso');await W(300);
  ok(await pg.evaluate(()=>document.activeElement&&document.activeElement.id==='rp-q'),'search keeps focus while typing');
  k=await kpi(pg);console.log('  KPI riso:',JSON.stringify(k));
  ok(k['Spesa totale']===eurS(59.6)&&k['Ordini']==='3'&&k['Prodotti diversi']==='2'&&k['Quantità totale']==='19 pz','riso: 59,60 €, 3 ordini, 2 prodotti, 19 pz');
  ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per settimana'&&await pg.locator('.sheet.rp .rp-svg .bar').count()===3,'riso: weekly chart, 3 bars');
  await pg.fill('#rp-q','carnaroli metro');await W(250);
  ok(await pg.locator('.sheet.rp .empty').count()===1,'tokens must all match (carnaroli metro -> nothing in name)');
  await pg.fill('#rp-q','RISO carnaroli');await W(250);k=await kpi(pg);ok(k['Spesa totale']===eurS(59.6),'case-insensitive multi-token search');
  await pg.fill('#rp-q','');await W(200);
  // custom range: today-45 .. today-15
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="dal"]');await W(250);
  const iso=d=>{const x=new Date();x.setDate(x.getDate()-d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  await pg.fill('#rp-a',iso(45));await W(150);await pg.fill('#rp-b',iso(15));await W(250);
  k=await kpi(pg);console.log('  KPI custom:',JSON.stringify(k));
  ok(k['Spesa totale']===eurS(86.8)&&k['Ordini']==='3','custom range: 86,80 €, 3 ordini');
  ok(await pg.locator('.sheet.rp .rp-svg .bar').count()===3,'custom range: 3 supplier bars');
  await pg.selectOption('#rp-f','mariano');await W(250);
  ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per giorno'&&await pg.locator('.sheet.rp .rp-svg .bk').count()===31&&await pg.locator('.sheet.rp .rp-svg .bar').count()===1,'custom + Mariano: daily chart, 31 slots, 1 bar');
  // reversed dates are swapped
  await pg.fill('#rp-a',iso(15));await W(150);await pg.fill('#rp-b',iso(45));await W(250);
  k=await kpi(pg);ok(k['Spesa totale']===eurS(14),'reversed dates swapped (Mariano 14,00 €): '+k['Spesa totale']);
  // year -> monthly bars, week -> daily bars
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="anno"]');await W(250);
  const mi=new Date().getMonth()+1;
  ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per mese'&&await pg.locator('.sheet.rp .rp-svg .bk').count()===mi,'year + Mariano: monthly chart, '+mi+' slots (to today)');
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="sett"]');await W(250);
  const wd=(new Date().getDay()+6)%7+1;
  const hasO6=await pg.evaluate(()=>{const [a,b]=weekRange(0);const t=S.data.ordini.tr_o6.inviato;return t>=a&&t<b});
  if(hasO6)ok((await pg.locator('.sheet.rp .rp-sec b').first().innerText())==='Spesa per giorno'&&await pg.locator('.sheet.rp .rp-svg .bk').count()===wd,'week + Mariano: daily chart, '+wd+' slots');
  else ok(await pg.locator('.sheet.rp .empty').count()===1,'week + Mariano: empty (order outside this week)');
  for(const v of ['mese','mesep']){await pg.click(`.sheet.rp [data-a="rpPer"][data-v="${v}"]`);await W(200)}
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="dal"]');await W(200);
  await pg.selectOption('#rp-f','');await W(200);
  // empty state
  await pg.fill('#rp-a','2020-01-01');await W(150);await pg.fill('#rp-b','2020-01-31');await W(250);
  ok((await pg.locator('.sheet.rp .empty b').innerText())==='Nessun ordine inviato in questo periodo','empty state text');
  ok(await pg.locator('.sheet.rp [data-a="rpXls"]').isDisabled(),'Excel disabled when empty');
  await pg.screenshot({path:SP+'rp3-phone-empty.png'});
  // 320 px: no horizontal overflow
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="tre"]');await W(200);
  await pg.setViewportSize({width:320,height:700});await W(400);
  const ov=await pg.evaluate(()=>{const s=document.querySelector('.sheet.rp');return{sw:s.scrollWidth,cw:s.clientWidth}});
  ok(ov.sw<=ov.cw,'320px: no horizontal overflow '+JSON.stringify(ov));
  const vb=await pg.evaluate(()=>{const v=document.querySelector('.sheet.rp .rp-svg');return{vb:v.viewBox.baseVal.width,w:v.getBoundingClientRect().width}});
  ok(Math.abs(vb.vb-vb.w)<2,'320px: chart drawn at real width (no scaled text) '+JSON.stringify(vb));
  const tw=await pg.evaluate(()=>{const t=document.querySelector('.sheet.rp .rp-t');return{t:t.scrollWidth,p:t.parentElement.clientWidth,qi:getComputedStyle(document.querySelector('.rp-qi')).display}});ok(tw.t<=tw.p&&tw.qi==='block','320px: product table fits, quantity moved under the name '+JSON.stringify(tw));
  await pg.screenshot({path:SP+'rp4-phone320.png'});await scr(pg,640,'rp4b-phone320-chart.png');await scr(pg,-1,'rp4c-phone320-table.png');
  ok(errs.filter(e=>e.startsWith('pageerror')).length===0,'phone: no pageerror '+JSON.stringify(errs));
  if(errs.length)console.log('  console:',errs);
  await ctx.close();
}
/* ---------- phone, dark ---------- */
{
  const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:2,colorScheme:'dark'});
  const {pg,errs}=await setup(ctx);await seed(pg);
  await pg.click('[data-a="viewAs"][data-v="gm"]');await W(300);
  await pg.click('[data-a="tab"][data-v="storico"]');await W(300);
  await pg.click('[data-a="rpOpen"]');await W(500);
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="tre"]');await W(250);
  const fill=await pg.evaluate(()=>getComputedStyle(document.querySelector('.sheet.rp .rp-svg .bar')).fill);
  ok(fill&&fill!=='rgb(31, 127, 134)','dark: supplier bar lightened ('+fill+')');
  const bg=await pg.evaluate(()=>getComputedStyle(document.querySelector('.sheet.rp')).backgroundColor);ok(bg==='rgb(41, 33, 31)','dark surface '+bg);
  await pg.screenshot({path:SP+'rp5-phone-dark.png'});await scr(pg,560,'rp5b-phone-dark-chart.png');await scr(pg,0,'x.png');
  await pg.selectOption('#rp-f','mariano');await W(250);
  await pg.evaluate(()=>{const s=document.querySelector('.sheet.rp');s.scrollTop=520});await W(150);
  await pg.screenshot({path:SP+'rp6-phone-dark-mariano.png'});
  ok(errs.filter(e=>e.startsWith('pageerror')).length===0,'dark: no pageerror '+JSON.stringify(errs));
  await ctx.close();
}
/* ---------- desktop ---------- */
{
  const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true});
  const {pg,errs}=await setup(ctx);await seed(pg);
  await pg.click('[data-a="tab"][data-v="storico"]');await W(300);
  ok(await pg.locator('[data-a="rpOpen"]').count()===1,'developer (dev) also sees the button');
  await pg.screenshot({path:SP+'rp7-desktop-storico.png'});
  await pg.click('[data-a="rpOpen"]');await W(500);
  await pg.click('.sheet.rp [data-a="rpPer"][data-v="tre"]');await W(250);
  const k=await kpi(pg);ok(k['Spesa totale']===eurS(241.6),'desktop total');
  const sw=await pg.evaluate(()=>document.querySelector('.sheet.rp').getBoundingClientRect().width);ok(sw>700,'desktop sheet wider: '+sw);
  await pg.screenshot({path:SP+'rp8-desktop.png'});await scr(pg,330,'rp8b-desktop-chart.png');await scr(pg,-1,'rp8c-desktop-table.png');await scr(pg,0,'x.png');
  await pg.fill('#rp-q','riso');await W(300);
  await pg.locator('.sheet.rp .rp-svg .bk').nth(2).focus().catch(()=>{});
  await pg.screenshot({path:SP+'rp9-desktop-riso.png'});
  // keyboard focus shows tooltip
  await pg.evaluate(()=>{const g=[...document.querySelectorAll('.sheet.rp .rp-svg .bk')].find(x=>x.querySelector('.bar'));g.focus()});await W(150);
  const tip=await pg.evaluate(()=>{const t=document.querySelector('.sheet.rp .rp-tip');return t&&!t.hidden?t.textContent.replace(/ /g,' '):''});
  ok(/Settimana dal/.test(tip),'focus shows tooltip: '+tip);
  await pg.screenshot({path:SP+'rp10-desktop-tip.png'});
  // resize redraws chart at new width
  await pg.setViewportSize({width:760,height:800});await W(400);
  const vb=await pg.evaluate(()=>{const v=document.querySelector('.sheet.rp .rp-svg');return{vb:v.viewBox.baseVal.width,w:v.getBoundingClientRect().width}});
  ok(Math.abs(vb.vb-vb.w)<2,'resize: chart redrawn at new width '+JSON.stringify(vb));
  ok(errs.filter(e=>e.startsWith('pageerror')).length===0,'desktop: no pageerror '+JSON.stringify(errs));
  await ctx.close();
}
await b.close();
