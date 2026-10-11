// D34 / v84: Cantina Vini. Ingresso (gestori in Fornitori, staff non di cucina in «Cosa serve?»), scheda scritta dall'IA dal nome
// o dalla foto (Gemini finto), riempie solo i campi vuoti, doppione già in cantina, «Al tavolo in 10 secondi», Consiglia per piatto
// (solo vini in casa), Venduta/Arrivata/Correggi con i movimenti del mese, Inventario (da riordinare, più venduti, valore solo ai gestori).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800}});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
let gemReq=[];
const GEM={nome:'Tignanello',cantina:'Antinori',annata:'2020',gradi:14,tipo:'rosso',denominazione:'Toscana IGT',vitigni:'80% Sangiovese, 15% Cabernet Sauvignon, 5% Cabernet Franc',
  storia:'Nato nel 1971, uno dei primi Supertuscan.',palato:'Strutturato, tannino fitto, buona acidità.',naso:'Ciliegia matura, vaniglia, pepe nero',colore:'Rosso rubino intenso',
  abbinamento:'Con carni rosse alla brace: il tannino pulisce il grasso.',abbinamenti:['carne','formaggi','nonesiste'],produzione:'12-14 mesi in barrique, poi un anno in bottiglia.',
  servizio:'18 °C, calice ampio, decantare 1 ora.',frase:'Un grande rosso toscano, elegante e strutturato: perfetto con la nostra tagliata.',parole:'Strutturato · Ciliegia · Vaniglia',sicuro:true};
let gemOut=GEM;
await ctx.route('https://generativelanguage.googleapis.com/**',async r=>{const body=JSON.parse(r.request().postData()||'{}');gemReq.push(body);
  await r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:'```json\n'+JSON.stringify(gemOut)+'\n```'}]}}]})})});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const sc=sel=>pg.locator('.sheet').last().locator(sel).first().click();
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');await wait(300);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
await pg.evaluate(async()=>{ls('jona_gemini_key','prova');await put('fornitori','fa',{id:'fa',nome:'Alfa'});await put('prodotti','p1',{id:'p1',nome:'Farina',fornitoreId:'fa',prezzo:1,unita:'kg',categoria:'Varie'});
  await new Promise(r=>setTimeout(r,200));rebuildIndex();render()});
ok(await pg.evaluate(()=>funzOn('cantina')&&!(cfg().funz||{}).hasOwnProperty('cantina')),'funzione «cantina» accesa di partenza');
// ingressi
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.click('nav [data-a="tab"][data-v="fornitori"]');await wait(300);
ok(await pg.locator('main .sug-cta[data-a="vnOpen"]').count()===1&&/Cantina Vini Schede dei vini/.test(await txt()),'chef: «Cantina Vini» in Fornitori');
await pg.click('.testbar [data-a="viewAs"][data-v="staff"]');await wait(300);
ok(await pg.locator('[data-a="vnOpen"]').count()===0,'staff di cucina: niente Cantina Vini');
await pg.click('.testbar [data-a="viewAs"][data-v="fb"]');await wait(300);
ok(await pg.locator('main .sug-cta[data-a="vnOpen"]').count()===1,'F&B (staff non di cucina): Cantina Vini in «Cosa serve?»');
ok(await pg.evaluate(()=>vnCan({ruolo:'staff',reparto:'sala'})&&vnCan({ruolo:'staff',reparto:'fb'})&&!vnCan({ruolo:'staff',reparto:'cucina'})&&!vnCan({ruolo:'staff',reparto:'altro'})),'modifica: sala, F&B e gestori sì; cucina e altro no');
await pg.click('.testbar [data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.click('nav [data-a="tab"][data-v="fornitori"]');await wait(300);
await pg.click('main [data-a="vnOpen"]');await wait(350);
ok(/La cantina è vuota/.test(await txt('.sheet')),'cantina vuota con spiegazione');
// nuovo vino dal nome + IA
await sc('[data-a="vnNew"]');await wait(350);
await sc('[data-a="vnIa"]');await wait(300);
ok(gemReq.length===0,'«Completa con l\'IA» senza nome: non chiama l\'IA');
await pg.fill('#vnf-n','Tignanello');await pg.fill('#vnf-cant','Antinori');await pg.fill('#vnf-frase','La mia frase');
await sc('[data-a="vnIa"]');await wait(800);
const pr=gemReq[0]&&gemReq[0].contents[0].parts;
ok(pr&&pr.length===1&&/Il vino è: Tignanello Antinori/.test(pr[0].text)&&/mai inventati/.test(pr[0].text),'IA chiamata col nome del vino (senza foto) e regola «premi mai inventati»');
ok(await pg.inputValue('#vnf-ann')==='2020'&&await pg.inputValue('#vnf-gr')==='14'&&await pg.inputValue('#vnf-den')==='Toscana IGT','IA: annata, gradi e denominazione riempiti');
ok(await pg.inputValue('#vnf-frase')==='La mia frase','IA: non sovrascrive quello che hai già scritto');
ok(/Scritto dall'IA: controlla annata, gradi e premi/.test(await txt('.sheet')),'avviso «controlla annata, gradi e premi»');
ok(await pg.evaluate(()=>S.vnf.abb.join()==='carne,formaggi'),'abbinamenti: solo quelli conosciuti (carne, formaggi)');
await sc('[data-a="vnfAbb"][data-v="pesce"]');await wait(150);
await pg.fill('#vnf-pv','120');await pg.fill('#vnf-pc','60');await pg.fill('#vnf-q','5');await pg.fill('#vnf-min','2');
await sc('[data-a="vnSave"]');await wait(600);
const v0=await pg.evaluate(()=>Object.values(D().config.cantina.v)[0]);
ok(v0&&v0.n==='Tignanello'&&v0.cant==='Antinori'&&v0.ann==='2020'&&v0.gr===14&&v0.pv===120&&v0.pc===60&&v0.q===5&&v0.min===2&&v0.ia==='si'&&v0.abb.join()==='carne,formaggi,pesce','salvato in config/cantina con prezzi, bottiglie e abbinamenti');
let t=await txt('.sheet');
ok(/Al tavolo in 10 secondi «La mia frase» Strutturato · Ciliegia · Vaniglia Va con: Carne rossa, Pesce, Formaggi/i.test(t),'scheda: «Al tavolo in 10 secondi» con frase, parole e abbinamenti');
ok(/Servizio: 18 °C/.test(t)&&/Prezzo in carta: 120,00 €/.test(t)&&/In casa: 5 bottiglie/.test(t)&&/acquisto 60,00 €/.test(t),'scheda: servizio, prezzo in carta, bottiglie e acquisto (gestore)');
ok(/Storia, aneddoti e premi Nato nel 1971/.test(t)&&/Profumi \(naso\) Ciliegia matura/.test(t)&&/Come nasce 12-14 mesi/.test(t),'scheda: storia, naso, come nasce');
// venduta, arrivata, correggi
await sc('[data-a="vnVen"]');await wait(400);
ok(/In casa: 4 bottiglie/.test(await txt('.sheet'))&&/1 vendute questo mese/.test(await txt('.sheet')),'«− Venduta»: 4 in casa, 1 venduta questo mese');
await sc('[data-a="vnCar"]');await wait(400);
ok(/In casa: 5 bottiglie/.test(await txt('.sheet')),'«+ Arrivata»: torna a 5');
await sc('[data-a="vnConta"]');await wait(350);await pg.fill('#ask-in','1');await pg.click('#ask-ok');await wait(500);
ok(/In casa: 1 bottiglia/.test(await txt('.sheet')),'«Correggi il numero»: 1 bottiglia');
const mv=await pg.evaluate(()=>Object.values(D().config[vnMese()].m).map(m=>m.t+m.q).sort().join());
ok(mv==='car1,conta1,ven1','movimenti del mese salvati (venduta, arrivata, conta)');
await sc('[data-a="vnVen"]');await wait(300);await sc('[data-a="vnVen"]');await wait(400);
ok(/In casa ne risultano 0/.test(await txt('.sheet')),'venduta con 0 in casa: chiede conferma');
await sc('[data-a="closeSheet"]');await wait(300);
ok(/In casa: 0 bottiglie/.test(await txt('.sheet')),'«Annulla»: resta 0, nessun numero negativo');
await sc('[data-a="closeSheet"]');await wait(300);
// secondo vino dalla foto (bianco, pesce), poi doppione
gemOut={nome:'Vermentino di Gallura',cantina:'Cantina Prova',annata:'2023',gradi:'13,5',tipo:'Bianco',abbinamenti:['pesce','crudi'],frase:'Fresco e sapido.',parole:'Fresco · Sapido · Fiori',sicuro:false};
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=60;c.getContext('2d').fillRect(0,0,20,20);const bl=await new Promise(r=>c.toBlob(r,'image/png'));
  vnForm(null);await vnIaGo([new File([bl],'e.png',{type:'image/png'})])});await wait(500);
const pf=gemReq[gemReq.length-1].contents[0].parts;
ok(pf.length===2&&pf[1].inline_data&&/foto dell'etichetta/.test(pf[0].text),'foto: IA chiamata con l\'immagine dell\'etichetta');
ok(await pg.inputValue('#vnf-gr')==='13,5'&&/che non era sicura del vino/.test(await txt('.sheet')),'foto: gradi «13,5» e avviso «non era sicura»');
await pg.fill('#vnf-q','6');await sc('[data-a="vnSave"]');await wait(600);
ok(await pg.evaluate(()=>{const v=vnAll().find(x=>x.n==='Vermentino di Gallura');return v&&v.tipo==='bianco'&&v.ia==='dubbio'&&v.q===6}),'salvato come bianco, scheda «dubbio»');
await sc('[data-a="closeSheet"]');await wait(300);
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=60;const bl=await new Promise(r=>c.toBlob(r,'image/png'));vnForm(null);await vnIaGo([new File([bl],'e.png',{type:'image/png'})])});await wait(600);
ok(/Questo vino è già in cantina/.test(await txt('body'))&&/Vermentino di Gallura 2023/.test(await txt('.sheet')),'stesso vino fotografato di nuovo: apre quello già in cantina');
await sc('[data-a="closeSheet"]');await wait(300);
// carta: solo in casa, tipo, ricerca
t=await txt('.sheet');
ok(/Vermentino di Gallura 2023/.test(t)&&!/Tignanello/.test(t),'Carta: «Solo in casa» nasconde il Tignanello finito');
await sc('[data-a="vnCasa"]');await wait(250);
ok(/Tignanello 2020/.test(await txt('.sheet')),'senza «Solo in casa» compare anche il Tignanello');
await sc('[data-a="vnTipo"][data-v="bianco"]');await wait(250);
t=await txt('.sheet');ok(/Vermentino/.test(t)&&!/Tignanello/.test(t),'filtro «Bianco»');
await sc('[data-a="vnTipo"][data-v=""]');await pg.fill('#vnq','sangiovese');await wait(250);
t=await txt('.sheet');ok(/Tignanello/.test(t)&&!/Vermentino/.test(t),'ricerca per vitigno');
// consiglia
await sc('[data-a="vnV"][data-v="consiglia"]');await wait(250);
await sc('[data-a="vnAbb"][data-v="pesce"]');await wait(250);
t=await txt('.sheet');ok(/Vermentino di Gallura 2023/.test(t)&&/«Fresco e sapido.»/.test(t)&&!/Tignanello/.test(t),'Consiglia «Pesce»: solo i vini in casa (Tignanello finito escluso), con la frase');
await sc('[data-a="vnAbb"][data-v="dolce"]');await wait(250);
ok(/Nessun vino in casa per questo piatto/.test(await txt('.sheet')),'Consiglia «Dolce»: nessun vino');
// inventario
await sc('[data-a="vnV"][data-v="inv"]');await wait(250);
t=await txt('.sheet');
ok(/Bottiglie in casa 6/.test(t)&&/Vendute questo mese 2/.test(t),'Inventario: 6 in casa, 2 vendute');
ok(/Da riordinare: Tignanello 2020 \(0\)/.test(t),'Inventario: Tignanello da riordinare');
ok(/Più venduti questo mese Tignanello 2020 2/.test(t),'Inventario: più venduti');
ok(/Valore \(prezzo d'acquisto\) 0,00 €/.test(t)||!/Valore/.test(t),'valore: solo con prezzo d\'acquisto');
await pg.locator('.sheet [data-a="vnVen"]').last().click();await wait(400);
ok(/Bottiglie in casa 5/.test(await txt('.sheet')),'conta veloce: «−» toglie una bottiglia');
await sc('[data-a="closeSheet"]');await wait(300);
// F&B (staff): niente prezzo d'acquisto
await pg.evaluate(async()=>{await upd('config','cantina',{['v.'+vnAll().find(x=>x.n==='Vermentino di Gallura').id+'.pc']:8})});
await pg.click('.testbar [data-a="viewAs"][data-v="fb"]');await wait(300);
await pg.click('main [data-a="vnOpen"]');await wait(300);await sc('[data-a="vnV"][data-v="inv"]');await wait(250);
ok(!/Valore/.test(await txt('.sheet')),'F&B: niente valore al prezzo d\'acquisto');
await sc('[data-a="vnV"][data-v="carta"]');await wait(250);await pg.locator('.sheet [data-a="vnShow"]').first().click();await wait(300);
t=await txt('.sheet');ok(!/acquisto/.test(t)&&/Modifica/.test(t),'F&B: scheda senza prezzo d\'acquisto, può modificare');
await sc('[data-a="vnEdit"]');await wait(300);
ok(await pg.locator('#vnf-pc').count()===0,'F&B: nel modulo niente prezzo d\'acquisto');
await sc('[data-a="vnSave"]');await wait(500);
ok(await pg.evaluate(()=>vnAll().find(x=>x.n==='Vermentino di Gallura').pc===8),'F&B salva: il prezzo d\'acquisto resta');
// funzione spenta
await pg.evaluate(async()=>{closeSheet();closeSheet();await funzSet('cantina',false);render()});await wait(300);
ok(await pg.locator('[data-a="vnOpen"]').count()===0,'funzione spenta: niente Cantina Vini');
ok(!errs.length,'nessun errore JS'+(errs.length?': '+errs.join(' | '):''));
await b.close();
