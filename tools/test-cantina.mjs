// D34 / v84: Cantina Vini. Ingresso (gestori in Fornitori, staff non di cucina in «Cosa serve?»), scheda scritta dall'IA dal nome
// o dalla foto (Gemini finto), riempie solo i campi vuoti, doppione già in cantina, «Al tavolo in 10 secondi», Consiglia per piatto
// (solo vini in casa), Venduta/Arrivata/Correggi con i movimenti del mese, Inventario (da riordinare, più venduti, valore solo ai gestori).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800}});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
let gemReq=[],gemUrl=[],gemFail='';
const GEM={nome:'Tignanello',cantina:'Antinori',annata:'2020',gradi:14,tipo:'rosso',denominazione:'Toscana IGT',vitigni:'80% Sangiovese, 15% Cabernet Sauvignon, 5% Cabernet Franc',
  storia:'Nato nel 1971, uno dei primi Supertuscan.',palato:'Strutturato, tannino fitto, buona acidità.',naso:'Ciliegia matura, vaniglia, pepe nero',colore:'Rosso rubino intenso',
  abbinamento:'Con carni rosse alla brace: il tannino pulisce il grasso.',abbinamenti:['carne','formaggi','nonesiste'],produzione:'12-14 mesi in barrique, poi un anno in bottiglia.',
  servizio:'18 °C, calice ampio, decantare 1 ora.',frase:'Un grande rosso toscano, elegante e strutturato: perfetto con la nostra tagliata.',parole:'Strutturato · Ciliegia · Vaniglia',sicuro:true};
let gemOut=GEM;
await ctx.route('https://generativelanguage.googleapis.com/**',async r=>{const body=JSON.parse(r.request().postData()||'{}');gemReq.push(body);gemUrl.push(r.request().url());
  if(gemFail&&r.request().url().includes('/'+gemFail+':'))return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'sovraccarico'}})});
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
  await modLoad('cantina');vnForm(null);await vnIaGo([new File([bl],'e.png',{type:'image/png'})])});await wait(500);
const pf=gemReq[gemReq.length-1].contents[0].parts;
ok(pf.length===2&&pf[1].inline_data&&/foto dell'etichetta/.test(pf[0].text),'foto: IA chiamata con l\'immagine dell\'etichetta');
ok(await pg.inputValue('#vnf-gr')==='13,5'&&/che non era sicura del vino/.test(await txt('.sheet')),'foto: gradi «13,5» e avviso «non era sicura»');
await pg.fill('#vnf-q','6');await sc('[data-a="vnSave"]');await wait(600);
ok(await pg.evaluate(()=>{const v=vnAll().find(x=>x.n==='Vermentino di Gallura');return v&&v.tipo==='bianco'&&v.ia==='dubbio'&&v.q===6}),'salvato come bianco, scheda «dubbio»');
await sc('[data-a="closeSheet"]');await wait(300);
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=60;const bl=await new Promise(r=>c.toBlob(r,'image/png'));await modLoad('cantina');vnForm(null);await vnIaGo([new File([bl],'e.png',{type:'image/png'})])});await wait(600);
ok(/Questo vino è già in cantina/.test(await txt('body'))&&/Vermentino di Gallura 2023/.test(await txt('.sheet')),'stesso vino fotografato di nuovo: apre quello già in cantina');
await sc('[data-a="closeSheet"]');await wait(300);
// D44: fronte e retro della stessa bottiglia, letti insieme
const png=async(pg,w)=>pg.evaluate(async w=>{const c=document.createElement('canvas');c.width=w;c.height=60;c.getContext('2d').fillRect(0,0,10,10);const u=await new Promise(r=>c.toBlob(b=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)},'image/png'));return u.split(',')[1]},w);
const fimg=async(n,w)=>({name:n,mimeType:'image/png',buffer:Buffer.from(await png(pg,w),'base64')});
gemOut={nome:'Turriga',cantina:'Argiolas',annata:'2019',gradi:14.5,tipo:'rosso',denominazione:'Isola dei Nuraghi IGT',vitigni:'85% Cannonau, Carignano, Bovale',frase:'Il grande rosso sardo.',parole:'Potente · Mirto · Spezie',sicuro:true};
await pg.evaluate(async()=>{await modLoad('cantina');vnForm(null)});await wait(300);
let fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoF"]')]))[0];
ok(await pg.evaluate(()=>{const p=document.querySelector('#picker');return p.getAttribute('capture')==='environment'&&!p.multiple}),'foto: apre la fotocamera');
await fc.setFiles([await fimg('fronte.png',40)]);await wait(400);
const reqN=gemReq.length;
t=await txt('.sheet');
ok(await pg.locator('.sheet .vn-fi img').count()===1&&/Fronte pronto/.test(t)&&/Fotografa il retro/.test(t)&&/Leggi la foto con l'IA/.test(t)&&gemReq.length===reqN,'D44: dopo la prima foto aspetta il retro, l\'IA non parte da sola');
fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoF"]')]))[0];await fc.setFiles([await fimg('retro.png',42)]);await wait(400);
t=await txt('.sheet');
ok(/Fronte/.test(t)&&/Retro/.test(t)&&/Leggi le 2 foto con l'IA/.test(t),'D44: due foto «Fronte» e «Retro»');
fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoG"]')]))[0];
ok(await pg.evaluate(()=>{const p=document.querySelector('#picker');return !p.hasAttribute('capture')&&p.multiple}),'D44: «Galleria» sceglie più foto');
await fc.setFiles([await fimg('a.png',44),await fimg('b.png',46)]);await wait(400);
ok(await pg.locator('.sheet .vn-fi').count()===3&&/Bastano 3 foto/.test(await txt('body'))&&await pg.locator('.sheet [data-a="vnFotoF"]').count()===0,'D44: massimo 3 foto, poi niente più pulsanti per aggiungerne');
await sc('[data-a="vnFotoDel"][data-v="2"]');await wait(300);
ok(await pg.locator('.sheet .vn-fi').count()===2,'D44: la X toglie una foto');
gemFail='gemini-flash-latest';
await sc('[data-a="vnFotoGo"]');await wait(900);gemFail='';
const lastP=gemReq[gemReq.length-1].contents[0].parts;
ok(lastP.length===3&&lastP[1].inline_data&&lastP[2].inline_data&&/2 foto della stessa bottiglia/.test(lastP[0].text),'D44: le 2 foto vanno all\'IA nella stessa richiesta');
ok(gemUrl.slice(-2).map(u=>u.includes('/gemini-flash-latest:')?'flash':u.includes('/gemini-flash-lite-latest:')?'lite':'?').join()==='flash,lite','D44: Flash sovraccarico → legge Flash-Lite (stessi lettori dei listini)');
ok(await pg.inputValue('#vnf-n')==='Turriga'&&await pg.inputValue('#vnf-den')==='Isola dei Nuraghi IGT'&&await pg.locator('.sheet .vn-fi').count()===0,'D44: scheda riempita, riquadro delle foto chiuso');
// v96: il motivo vero del passaggio a Flash-Lite si vede nel foglio e va nella scatola nera (Mario: «perché Lite?»)
ok(/Letto da Gemini Flash-Lite\. Prima: Gemini Flash — Google ha risposto «sovraccarico» \(errore 503\)/.test(await txt('.sheet'))&&await pg.evaluate(()=>Object.keys(ERR.seen).some(k=>/Vino: Gemini Flash non ha letto \(errore 503\)/.test(k))),'v96: «Letto da Gemini Flash-Lite» con il motivo vero (503) nel foglio e nella scatola nera');
// Cloudflare con più foto che non risponde: riprova con il solo fronte
const cf=await pg.evaluate(async()=>{const vero=gemCall,log=[];
  gemCall=async(b,l)=>{const n=b.contents[0].parts.length-1;log.push(l+n);return l==='cf'?(n>1?{st:400,msg:'troppe immagini'}:{txt:'{"nome":"Prova CF","cantina":"X","sicuro":true}',lettore:'cf'}):{st:503}};
  try{await modLoad('cantina');vnForm(null);const c=document.createElement('canvas');c.width=30;c.height=30;const bl=await new Promise(r=>c.toBlob(r,'image/png'));
    await vnIaGo([new File([bl],'f.png',{type:'image/png'}),new File([bl],'r.png',{type:'image/png'})]);return{log:log.join(),n:S.vnf.n}}finally{gemCall=vero}});
ok(cf.log==='flash2,lite2,cf2,cf1'&&cf.n==='Prova CF','D44: Cloudflare non accetta 2 foto → riprova col fronte: '+cf.log);
// v106 (#125, Mario: «un caricamento vero per far vedere che non si è bloccato e quanto ci mette»): secondi, barra, tempo solito, secondi dei tentativi falliti
await sc('[data-a="closeSheet"]');await wait(300);
await pg.evaluate(async()=>{ls('jona_ia_t',{lite:[6,8]});window._vero=gemCall;window._lib=null;
  gemCall=(b,l)=>l==='flash'?new Promise(r=>setTimeout(()=>r({st:503}),1200)):new Promise(r=>{window._lib=()=>r({txt:'{"nome":"Prova Tempo","cantina":"Y","sicuro":true}',lettore:'lite'})});
  await modLoad('cantina');vnForm(null);const c=document.createElement('canvas');c.width=30;c.height=30;const bl=await new Promise(r=>c.toBlob(r,'image/png'));
  window._go=vnIaGo([new File([bl],'f.png',{type:'image/png'})])});
await wait(600);
const w1=await pg.evaluate(()=>parseFloat(document.getElementById('vn-bar').style.width)||0);
const s1=await txt('#vn-sec');
await wait(1900);
const live=await txt('.sheet .vn-busy'),w2=await pg.evaluate(()=>parseFloat(document.getElementById('vn-bar').style.width)||0);
ok(/s in tutto/.test(s1)&&/di solito Flash ci mette circa 20 s/.test(s1),'v106: contasecondi e tempo solito di Flash ('+s1+')');
ok(/✗ Gemini Flash: Google ha risposto «sovraccarico» \(errore 503\) · 1 s/.test(live)&&/di solito Flash-Lite ci mette circa 7 s/.test(live)&&/^[23] s in tutto/.test(await txt('#vn-sec')),'v106: secondi del tentativo fallito e tempo solito di Flash-Lite dalle letture vere ('+live.replace(/\n/g,' / ')+')');
ok(w1>0&&w2>0&&w2<=97,'v106: la barra si muove ('+w1+'% → '+w2+'%)');
await pg.evaluate(async()=>{window._lib();await window._go;gemCall=window._vero});
ok(await pg.evaluate(()=>{const t=ls('jona_ia_t');return t.lite.length===3&&t.lite[2]>=1&&!S.vnf.busy})&&await pg.locator('.sheet .vn-busy').count()===0,'v106: lettura finita, tempo salvato per la prossima volta, riquadro chiuso');
await sc('[data-a="closeSheet"]');await wait(300);
// v107 (idea #126 scelta da Mario): «Rileggila tu più tardi» → l'app riprova da sola, la foto resta, il telefono vibra quando ha letto
const v107=async(failN)=>pg.evaluate(async n=>{window._n=0;window._vib=[];navigator.vibrate=p=>{window._vib.push(p);return true};
  gemCall=async()=>(++window._n<=n)?{st:503}:{txt:'{"nome":"Prova Riprova","cantina":"Z","sicuro":true}',lettore:'flash'};
  await modLoad('cantina');vnForm(null);const c=document.createElement('canvas');c.width=30;c.height=30;const bl=await new Promise(r=>c.toBlob(r,'image/png'));
  await vnFotoAdd([new File([bl],'f.png',{type:'image/png'})])},failN);
await pg.evaluate(()=>{window._vero=gemCall;VN_RI_MS=1500;VN_RI_MAX=5});
await v107(6);await wait(200);await sc('[data-a="vnFotoGo"]');await pg.waitForFunction(()=>S.vnf&&!S.vnf.busy&&window._n>=3);await wait(200);
t=await txt('.sheet');
ok(/Rileggila tu più tardi/.test(t)&&await pg.locator('.sheet .vn-fi').count()===1,'v107: lettura non riuscita → «Rileggila tu più tardi», la foto resta');
await sc('[data-a="vnRiAuto"]');await wait(200);
ok(/Riprovo da sola tra 0:0[12] · tentativo 1 di 5/.test(await txt('.sheet .vn-ri')),'v107: conto alla rovescia e tentativo 1 di 5 ('+(await txt('.sheet .vn-ri'))+')');
await pg.waitForFunction(()=>window._n>=6&&!S.vnf.busy,null,{timeout:15000});await wait(200);
ok(/tentativo 2 di 5/.test(await txt('.sheet .vn-ri'))&&await pg.evaluate(()=>!window._vib.length),'v107: primo tentativo da sola non riuscito → tentativo 2 di 5, niente vibrazione');
await pg.waitForFunction(()=>S.vnf&&S.vnf.n==='Prova Riprova',null,{timeout:15000});await wait(200);
ok(await pg.evaluate(()=>window._vib.length===1&&!S.vnf.au&&!S.vnf.ko)&&await pg.locator('.sheet .vn-ri').count()===0&&await pg.locator('.sheet .vn-fi').count()===0,'v107: letto al secondo tentativo da sola → scheda riempita, il telefono vibra, riquadro via');
await sc('[data-a="closeSheet"]');await wait(300);
// «Smetti» ferma i tentativi; dopo VN_RI_MAX tentativi si ferma da sola
await v107(999);await wait(200);await sc('[data-a="vnFotoGo"]');await pg.waitForFunction(()=>S.vnf&&!S.vnf.busy&&window._n>=3);await wait(200);
await sc('[data-a="vnRiAuto"]');await wait(200);await sc('[data-a="vnRiStop"]');await wait(1900);
ok(await pg.evaluate(()=>!S.vnf.au&&window._n===3)&&/Rileggila tu più tardi/.test(await txt('.sheet')),'v107: «Smetti» → nessun tentativo in più, torna il pulsante');
await pg.evaluate(()=>{VN_RI_MS=300;VN_RI_MAX=2});await sc('[data-a="vnRiAuto"]');
await pg.waitForFunction(()=>!S.vnf.au,null,{timeout:15000});await wait(200);
ok(await pg.evaluate(()=>window._n===9&&!!S.vnf.ko)&&/neanche dopo 2 tentativi/.test(await txt('body'))&&/Rileggila tu più tardi/.test(await txt('.sheet')),'v107: dopo VN_RI_MAX tentativi si ferma e lo dice ('+(await pg.evaluate(()=>window._n))+' richieste)');
await pg.evaluate(()=>{gemCall=window._vero;VN_RI_MS=120000;VN_RI_MAX=5});
await sc('[data-a="closeSheet"]');await wait(300);
// la prova Cloudflare ha aperto un'altra scheda sopra il Turriga: chiude anche quella
await sc('[data-a="closeSheet"]');await wait(300);
// v108 (D52, strada 2 scelta da Mario #126): «Cerca nel mondo» → l'IA cerca su Google, lista con le annate, tocchi → scheda
const dopV=await pg.evaluate(()=>{const v=vnAll().find(x=>x.cant);window._b=[];
  gemCall=async(b,l)=>{const tx=b.contents[0].parts[0].text;window._b.push({l,tools:JSON.stringify(b.tools||null),tx,gc:JSON.stringify(b.generationConfig||null)});
    return /Cerca sul web/.test(tx)?{txt:'Ecco i vini:\n```json\n'+JSON.stringify({vini:[{nome:'Korem',cantina:'Argiolas',zona:'Sardegna, Italia',denominazione:'Isola dei Nuraghi IGT',tipo:'rosso',annate:[2021,'2020',1800]},{nome:v.n,cantina:v.cant,tipo:'bianco',annate:'2023, 2022'}]})+'\n```',lettore:'flash'}
      :{txt:'{"nome":"Korem","cantina":"Argiolas","gradi":14,"frase":"Rosso sardo morbido.","sicuro":true}',lettore:'flash'}};return v.n});
// v111 (Mario #130): prima la cantina; se il vino c'è, solo un pulsante piccolo «Non è tra questi?»; se non c'è, pulsante grande «Cerca su internet»
await pg.fill('#vnq','Tigna');await wait(250);t=await txt('.sheet');
ok(/Togli «Solo in casa»/.test(t)&&!/non è in cantina/.test(t)&&await pg.locator('.sheet .vn-mb.ghost').count()===1,'v111: vino finito nascosto da «Solo in casa» → niente «non è in cantina», pulsante piccolo');
await pg.fill('#vnq','Vermen');await wait(250);
t=await txt('.sheet');ok(await pg.locator('.sheet .vn-mb.ghost').count()===1&&/Non è tra questi\? Cerca su internet/.test(t)&&await pg.locator('.sheet .vn-mb.primary').count()===0,'v111: vino trovato in cantina → lista e piccolo «Non è tra questi? Cerca su internet» ['+dopV+'] '+t.slice(-300));
await pg.fill('#vnq','korem');await wait(250);
t=await txt('.sheet');
ok(await pg.locator('.sheet .vn-mb.primary[data-a="vnMondo"]').count()===1&&/«korem» non è in cantina\./.test(t)&&!/Solo in casa» per/.test(t)&&/Cerca «korem» su internet/.test(t),'v111: vino non in cantina → «non è in cantina» e pulsante grande «Cerca su internet»');
await sc('[data-a="vnMondo"]');await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy);await wait(250);
t=await txt('.sheet');
ok(await pg.evaluate(()=>window._b.length===2&&window._b.map(x=>x.l).join()==='l25,f25'&&window._b.every(x=>x.tools==='[{"google_search":{}}]'&&/«korem»/.test(x.tx)&&JSON.parse(x.gc).thinkingConfig.thinkingBudget===0)),'v108/v110/v111/v112: Gemini 2.5 Flash-Lite e Flash insieme con la ricerca Google, senza ragionamento (thinkingBudget 0)');
ok(await pg.evaluate(()=>{const a=(ls('jona_ia_t')||{}).mondo;return Array.isArray(a)&&a.length===1&&a[0]>=1}),'v111: tempo della ricerca salvato per il caricamento dopo (jona_ia_t.mondo)');
ok(/Korem/.test(t)&&/Argiolas · Isola dei Nuraghi IGT/.test(t)&&await pg.locator('.sheet .vn-mo').first().locator('.chip').allInnerTexts().then(x=>x.join()==='2021,2020'),'v108: lista dei vini con cantina, denominazione e annate (anno sbagliato 1800 tolto)');
ok(/Già in cantina/.test(await pg.locator('.sheet .vn-mo').nth(1).innerText()),'v108: il vino che c\'è già è segnato «Già in cantina» ('+dopV+')');
await pg.locator('.sheet .vn-mo').first().locator('.chip',{hasText:'2020'}).click();
await pg.waitForFunction(()=>S.vnf&&!S.vnf.busy&&window._b.length===3);await wait(300);
ok(await pg.inputValue('#vnf-n')==='Korem'&&await pg.inputValue('#vnf-cant')==='Argiolas'&&await pg.inputValue('#vnf-ann')==='2020'&&await pg.evaluate(()=>S.vnf.frase==='Rosso sardo morbido.'&&window._b[2].tools==='null'&&!S.vnM),'v108: toccata l\'annata 2020 → scheda con nome, cantina e annata, poi l\'IA la completa');
await sc('[data-a="closeSheet"]');await wait(300);
// Google pieno con tutti e due i lettori → errore chiaro e «Riprova»
await pg.evaluate(()=>{window._b=[];gemCall=async(b,l)=>{window._b.push(l);return{st:503,err:'Gemini non ha risposto.'}}});
await sc('[data-a="vnMondo"]');await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy);await wait(250);
ok(await pg.evaluate(()=>window._b.join()==='l25,f25,lite,flash')&&/non ha risposto\. Riprova/.test(await txt('.sheet'))&&await pg.locator('.sheet').last().locator('[data-a="vnMondo"]').count()===1,'v108/v110: Gemini 2.5 e 3 pieni → messaggio e «Riprova» (niente Cloudflare, non cerca sul web) ['+(await pg.evaluate(()=>window._b.join()))+'] '+(await txt('.sheet')));
await sc('[data-a="closeSheet"]');await wait(300);
// v109 (#129, foto di Mario): Google nega la ricerca (429) → stessa domanda senza ricerca, avviso giallo; il messaggio non dice due volte «Riprova»
await pg.evaluate(()=>{window._b=[];gemCall=async(b,l)=>{const t=JSON.stringify(b.tools||null);window._b.push(l+':'+t);
  return t!=='null'?{st:429,msg:'Resource exhausted',err:'Gemini è molto occupato adesso: riprova tra un minuto.'}
    :{txt:JSON.stringify({vini:[{nome:'Korem',cantina:'Argiolas',tipo:'rosso',annate:[2021]}]}),lettore:'flash'}}});
await sc('[data-a="vnMondo"]');await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy);await wait(250);t=await txt('.sheet');
ok(await pg.evaluate(()=>window._b.join()==='l25:[{"google_search":{}}],f25:[{"google_search":{}}],lite:null'&&S.vnM.mem===true)&&/Korem/.test(t)&&/memoria dell'IA/.test(t)&&await pg.locator('.sheet').last().locator('.vn-mo').count()===1,'v109: 429 con la ricerca → senza Google, lista e avviso giallo ['+(await pg.evaluate(()=>window._b.join(' ')))+']');
await sc('[data-a="closeSheet"]');await wait(300);
await pg.evaluate(()=>{window._b=[];gemCall=async(b,l)=>{window._b.push(l);return{st:429,msg:'Resource exhausted',err:'Gemini è molto occupato adesso: riprova tra un minuto.'}}});
await sc('[data-a="vnMondo"]');await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy);await wait(250);t=await txt('.sheet');
ok(await pg.evaluate(()=>window._b.join()==='l25,f25,lite,flash'&&!S.vnM.mem)&&await pg.locator('.sheet').last().locator('.vn-al').innerText().then(x=>/riprova tra un minuto\.$/.test(x.trim())&&(x.match(/riprova/gi)||[]).length===1)&&await pg.locator('.sheet').last().locator('[data-a="vnMondo"]').count()===1,'v109: tutto pieno → un solo «riprova» nel messaggio e pulsante «Riprova» ['+(await pg.evaluate(()=>window._b.join()))+'] '+t);
await sc('[data-a="closeSheet"]');await wait(300);
// v111: calice mentre cerca (il vino sale col tempo, non arriva all'orlo prima della risposta); Google rifiuta thinkingConfig (400) → stessa domanda senza
await pg.evaluate(()=>{window._b=[];ls('jona_ia_t',{mondo:[2]});window._fine=null;gemCall=(b,l)=>{window._b.push(l+':'+JSON.stringify(b.generationConfig));
  return JSON.stringify(b.generationConfig).includes('thinking')?Promise.resolve({st:400,err:'x'}):new Promise(r=>{window._fine=()=>r({txt:JSON.stringify({vini:[{nome:'Korem',cantina:'Argiolas',tipo:'rosso',annate:[2021]}]})})})}});
await sc('[data-a="vnMondo"]');await pg.waitForSelector('.sheet .vn-cal #vn-liv');
const y0=await pg.evaluate(()=>parseFloat(document.getElementById('vn-liv').style.transform.match(/-?[\d.]+/)[0]));await wait(1600);
const y1=await pg.evaluate(()=>parseFloat(document.getElementById('vn-liv').style.transform.match(/-?[\d.]+/)[0]));
ok(await pg.locator('.sheet .vn-cbox').count()===1&&/di solito circa 2 secondi/.test(await txt('.sheet .vn-cbox'))&&y1<y0-5&&y1>70.5,'v111: calice con il vino che sale ('+y0+' → '+y1+', pieno = 70) e tempo solito «circa 2 secondi»');
// v112: calice da rosso disegnato a mano (acquerello dietro in un disegno a parte, fermo); la superficie del vino segue la pancia del calice
const sx=await pg.evaluate(()=>{const u=document.getElementById('vn-sup'),k=parseFloat(u.style.transform.match(/[\d.]+/)[0]);return{k,ok:Math.abs(k-vnCalSx(vnCalY(.5)))<.2&&vnCalSx(116)<.06&&vnCalSx(80)===1,w:!!document.querySelector('.vn-cal svg.vn-calw filter'),n:document.querySelectorAll('.vn-cal svg').length}});
ok(sx.ok&&sx.w&&sx.n===2&&sx.k>.7&&sx.k<=1,'v112: superficie del vino larga come la pancia ('+JSON.stringify(sx)+')');
ok(await pg.evaluate(()=>!!document.querySelector('.vn-cal .vn-getto')&&getComputedStyle(document.querySelector('.vn-slosh')).animationName==='vnSlosh'),'v112: vino versato dall\'alto e che oscilla');
ok(await pg.evaluate(()=>window._b.join(' ')==='l25:{"temperature":0.2,"thinkingConfig":{"thinkingBudget":0}} f25:{"temperature":0.2,"thinkingConfig":{"thinkingBudget":0}} l25:{"temperature":0.2} f25:{"temperature":0.2}'),'v111: 400 con thinkingConfig → stessa domanda senza, stesso lettore ['+(await pg.evaluate(()=>window._b.join(' ')))+']');
await pg.evaluate(()=>window._fine());await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy);await wait(250);
ok(await pg.locator('.sheet .vn-cbox').count()===0&&await pg.locator('.sheet').last().locator('.vn-mo').count()===1,'v111: risposta arrivata → calice pieno, poi la lista');
await sc('[data-a="closeSheet"]');await wait(300);
// v112 (Mario #132: «ci mette un minuto»): gara. Google fermo → dopo VN_MONDO.mem parte la domanda senza ricerca; la sua lista vale
// solo dopo VN_MONDO.max. Google che risponde prima di max vince; chi perde riceve lo stop (AbortSignal).
const gara=async(gTra)=>{await pg.evaluate(gTra=>{window._b=[];window._sig=[];VN_MONDO.mem=300;VN_MONDO.max=900;
  gemCall=(b,l,sig)=>{window._b.push(l);window._sig.push(sig);const g=!!b.tools,lista=n=>({txt:JSON.stringify({vini:[{nome:n,cantina:'Argiolas',tipo:'rosso',annate:[2021]}]})});
    return g?(l==='l25'&&gTra?new Promise(r=>setTimeout(()=>r(lista('Google')),gTra)):new Promise(()=>{})):Promise.resolve(lista('Memoria'))}},gTra);
  await sc('[data-a="vnMondo"]');const t0=Date.now();await pg.waitForFunction(()=>S.vnM&&!S.vnM.busy,null,{timeout:8000});await wait(250);
  const r=await pg.evaluate(()=>({b:window._b.join(),mem:!!S.vnM.mem,n:(S.vnM.l[0]||{}).n,stop:window._sig.every(x=>x&&x.aborted)}));r.ms=Date.now()-t0;await sc('[data-a="closeSheet"]');await wait(300);return r};
let r1=await gara(0);
ok(r1.b==='l25,f25,lite'&&r1.mem&&r1.n==='Memoria'&&r1.stop&&r1.ms>=800&&r1.ms<3000,'v112: Google fermo → senza ricerca dopo mem, lista solo dopo max, Google fermato '+JSON.stringify(r1));
r1=await gara(600);
ok(r1.b==='l25,f25,lite'&&!r1.mem&&r1.n==='Google'&&r1.stop,'v112: Google risponde tra mem e max → vince Google anche se la memoria ha già risposto '+JSON.stringify(r1));
await pg.evaluate(()=>{VN_MONDO.mem=15000;VN_MONDO.max=22000;ls('jona_ia_t',{mondo:[60,55]})});
ok(await pg.evaluate(()=>vnMondoT()===22),'v112: ricerche lente di prima (60 s) → il calice si riempie sul tempo massimo nuovo (22 s)');
// v109: limite del giorno di Google → messaggio chiaro (gemCall con la chiave del telefono e risposta finta)
t=await pg.evaluate(async()=>{const f=window.fetch,k=ls('jona_gemini_key');ls('jona_gemini_key','prova');
  window.fetch=async()=>new Response(JSON.stringify({error:{message:'Quota exceeded for metric: generate_content_free_tier_requests, limit: 20, quota id: GenerateRequestsPerDayPerProjectPerModel-FreeTier'}}),{status:429});
  try{const g=await window._vero({contents:[]},'flash'),h=await window._vero({contents:[]});return g.err+' | '+h.err}finally{window.fetch=f;ls('jona_gemini_key',k||null)}});
ok(/richieste gratis di oggi/.test(t)&&!/occupato/.test(t),'v109: 429 «PerDay» → «Gemini ha finito le richieste gratis di oggi» ('+t+')');
await pg.evaluate(()=>{gemCall=window._vero});await pg.fill('#vnq','');await wait(250);
ok(await pg.locator('.sheet [data-a="vnMondo"]').count()===0,'v108: campo vuoto → niente «Cerca su internet»');
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
ok(/Più venduti questo mese/.test(t)&&await pg.evaluate(()=>{const l=document.querySelector('.vn-top li');return !!l&&/Tignanello 2020/.test(l.textContent)&&l.querySelector('b')?.textContent==='2'&&getComputedStyle(l.querySelector('b')).float==='right'}),'Inventario: più venduti (v87: numero a destra, non va a capo da solo)');
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
