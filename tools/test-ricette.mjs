// D26 / v79: ricette e costo dei piatti (solo gestori). Prezzi dai listini, g/kg e ml/l, food cost, «Costo salito» con «Ok, visto»,
// prezzo da un prodotto simile o l'ultimo salvato quando il prodotto sparisce dal listino, funzione accesa di partenza e spegnibile.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800}});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');await wait(300);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
await pg.evaluate(async()=>{
  await put('fornitori','fa',{id:'fa',nome:'Alfa'});await put('fornitori','fb',{id:'fb',nome:'Beta'});
  const P=(id,nome,f,prezzo,unita)=>put('prodotti',id,{id,nome,fornitoreId:f,prezzo,unita,categoria:'Varie'});
  await P('v1','Vongole veraci','fa',18,'kg');await P('s1','Spaghetti trafilati','fa',2.5,'kg');await P('o1','Olio extravergine','fa',9,'lt');
  await P('u1','Uova fresche','fb',0.3,'pz');await P('v2','Vongole veraci','fb',19,'kg');
  await new Promise(r=>setTimeout(r,300));rebuildIndex();
});
// accesa di partenza: icona per il gestore, niente per lo staff
ok(await pg.evaluate(()=>funzOn('ricette')&&!(cfg().funz||{}).hasOwnProperty('ricette')),'funzione «ricette» accesa di partenza senza scrivere niente');
ok(await pg.evaluate(()=>!funzOn('agenda')&&!funzOn('hotel')),'agenda e hotel restano spente di partenza');
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await wait(300);
ok(await pg.locator('header [data-a="rcOpen"]').count()===1,'chef: icona «Ricette e costo dei piatti» in alto');
await pg.click('.testbar [data-a="viewAs"][data-v="staff"]');await wait(300);
ok(await pg.locator('[data-a="rcOpen"]').count()===0,'staff: niente icona delle ricette');
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await wait(300);
// nuova ricetta dall'interfaccia
await pg.click('header [data-a="rcOpen"]');await wait(350);
ok(/Nessuna ricetta/.test(await txt('.sheet')),'lista vuota con spiegazione');
await pg.click('.sheet [data-a="rcNew"]');await wait(350);
await pg.fill('#rcf-n','Spaghetti alle vongole');await pg.fill('#rcf-por','4');await pg.fill('#rcf-pv','18');
const add=async(q,nome,qta,u)=>{await pg.click('.sheet [data-a="rcPick"]');await wait(350);await pg.fill('#rcpq',q);await wait(150);
  await pg.locator('.sheet [data-a="rcAdd"]',{hasText:nome}).first().click();await wait(400);
  const i=await pg.evaluate(()=>S.rcf.ing.length-1);await pg.fill('#rcq-'+i,qta);if(u)await pg.selectOption('#rcu-'+i,u);await wait(150)};
await add('vongole','Vongole veraci','500');
await add('spaghetti','Spaghetti','0,4','kg');
await add('olio','Olio','40');
let t=await txt('.sheet');
ok(/Vongole veraci.*18,00 € \/ kg/.test(t)&&/9,00 €/.test(t),'500 g di vongole a 18 €/kg = 9,00 €');
ok(/1,00 €/.test(t)&&/0,36 €/.test(t),'0,4 kg di spaghetti = 1,00 €, 40 ml di olio a 9 €/l = 0,36 €');
ok(/Costo totale 10,36 €/.test(t)&&/Costo a porzione 2,59 €/.test(t),'totale 10,36 €, a porzione 2,59 €');
ok(/Food cost 15,8%/.test(t),'food cost 15,8% (2,59 su 18/1,10)');
ok(/Prezzo per stare al 30% 9,50 €/.test(t),'prezzo consigliato al 30%: 9,50 €');
await pg.click('.sheet [data-a="rcSave"]');await wait(500);
const r0=await pg.evaluate(()=>Object.values(D().config.ricette.r)[0]);
ok(r0&&r0.n==='Spaghetti alle vongole'&&r0.por===4&&r0.pv===18&&Math.abs(r0.rif-2.59)<1e-6,'salvata in config/ricette con costo di riferimento 2,59');
ok(r0.ing.length===3&&r0.ing[0].u==='g'&&r0.ing[0].q===500&&r0.ing[1].q===0.4&&r0.ing[2].pu==='l'&&r0.ing[2].pz===9,'ingredienti con quantità, unità e prezzo salvati');
t=await txt('.sheet');
ok(/Spaghetti alle vongole 2,59 € a porzione · food cost 15,8%/.test(t),'lista: costo a porzione e food cost');
await pg.click('.sheet [data-a="closeSheet"]');await wait(300);
// il fornitore alza il prezzo: costo salito
await pg.evaluate(async()=>{await upd('prodotti','v1',{prezzo:20});await new Promise(r=>setTimeout(r,200));rebuildIndex();render()});await wait(300);
t=await txt();
ok(/Costo dei piatti salito Spaghetti alle vongole \+9,7%/.test(t),'striscia «Costo dei piatti salito … +9,7%» (2,84 contro 2,59)');
await pg.click('.testbar [data-a="viewAs"][data-v="staff"]');await wait(300);
ok(!/Costo dei piatti/.test(await txt()),'staff: niente striscia');
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.click('.rc-strip [data-a="rcVisto"]');await wait(500);
ok(!/Costo dei piatti salito/.test(await txt()),'«Ok, visto» toglie la striscia');
ok(await pg.evaluate(()=>{const r=Object.values(D().config.ricette.r)[0];return Math.abs(r.rif-2.84)<1e-6&&r.ing[0].pz===20}),'«Ok, visto»: nuovo costo di riferimento 2,84 e prezzo 20 salvato');
// piccolo aumento (sotto il 3%): niente avviso
await pg.evaluate(async()=>{await upd('prodotti','v1',{prezzo:20.5});await new Promise(r=>setTimeout(r,200));rebuildIndex();render()});await wait(300);
ok(!/Costo dei piatti salito/.test(await txt()),'aumento sotto il 3%: niente avviso');
// prodotto tolto dal listino: prezzo dallo stesso prodotto di un altro fornitore, poi l'ultimo salvato
await pg.evaluate(async()=>{await del('prodotti','v1');await new Promise(r=>setTimeout(r,200));rebuildIndex()});
await pg.click('header [data-a="rcOpen"]');await wait(350);await pg.click('.sheet [data-a="rcEdit"]');await wait(350);
t=await txt('.sheet');
ok(/19,00 € \/ kg · da Beta/.test(t),'vongole tolte da Alfa: prezzo di Beta (stesso prodotto, stessa unità)');
await pg.evaluate(async()=>{await del('prodotti','v2');await new Promise(r=>setTimeout(r,200));rebuildIndex();refreshSheet()});await wait(300);
t=await txt('.sheet');
ok(/20,00 € \/ kg · non più a listino, ultimo prezzo/.test(t),'nessun listino: ultimo prezzo salvato con avviso');
// ingrediente a pezzi e senza quantità
await add('uova','Uova','');
t=await txt('.sheet');
ok(/1 ingrediente senza quantità o prezzo: non è nel costo/.test(t),'ingrediente senza quantità: avviso, fuori dal costo');
ok(await pg.locator('#rcu-3').count()===0&&/Uova fresche.*pz/.test(t),'a pezzi: niente scelta di unità');
await pg.fill('#rcq-3','2');await wait(150);
ok(/0,60 €/.test(await txt('.sheet')),'2 uova a 0,30 € = 0,60 €');
await pg.click('.sheet [data-a="rcIngDel"][data-v="3"]');await wait(200);
ok(await pg.evaluate(()=>S.rcf.ing.length===3),'«Togli» toglie l\'ingrediente');
// nome obbligatorio
await pg.fill('#rcf-n','');await pg.click('.sheet [data-a="rcSave"]');await wait(300);
ok(/Scrivi il nome del piatto/.test(await txt('#toasts')),'senza nome non salva');
await pg.fill('#rcf-n','Spaghetti alle vongole');
// elimina
await pg.click('.sheet [data-a="rcDel"]');await wait(300);
await pg.locator('.sheet button',{hasText:'Elimina'}).last().click();await wait(500);
ok(await pg.evaluate(()=>rcAll().length===0),'ricetta eliminata');
// conti a mano: ml/l e porzioni
ok(await pg.evaluate(()=>{const c=rcCalc({por:'2',pv:'',ing:[{pid:'x',nome:'Latte intero',pu:'l',u:'ml',q:'250',pz:1.6}]});return Math.abs(c.tot-0.4)<1e-9&&Math.abs(c.cp-0.2)<1e-9&&c.fc===null}),'250 ml di latte a 1,60 €/l = 0,40 €, 2 porzioni = 0,20 €, senza prezzo nel menù niente food cost');
// spenta: icona sparisce
await pg.evaluate(()=>funzSet('ricette',false));await wait(400);
ok(await pg.locator('[data-a="rcOpen"]').count()===0,'funzione spenta: niente icona');
ok(!errs.length,'nessun errore nella pagina '+errs.join(' | '));
await b.close();
