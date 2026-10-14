// v117 (D54 d, letture sicure): lettura della bolla dubbia (meno dell'80% dei prodotti dell'ordine o righe con i conti che non tornano)
// → seconda lettura con un altro lettore, si tiene la migliore, le righe diverse tra le due letture vanno «da controllare a mano».
// Modalità locale, Gemini finto con una risposta diversa per lettore (Flash = f25, Flash-Lite = l25).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
await ctx.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**',r=>r.fulfill({status:503,json:{error:{message:'overloaded'}}}));
const H='fornitore;codice;nome;unita;prezzo;categoria;quantita;importo';
const R={moz:'Prova;40;MOZZARELLA FIOR DI LATTE;kg;10,00;Latticini;5;50,00',pom:'Prova;;Pomodori ciliegino;pz;2,00;Verdura;3;6,00',
  bas:'Prova;;Basilico fresco;mazzo;4,00;Verdura;2;8,00',oli:'Prova;;Olio extravergine;l;9,00;Altro;1;9,00'};
const tab=(...r)=>[H,...r].join('\n');
// risposta per lettore: testo o numero (codice d'errore)
let T={};const chiamate=[];
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{const m=(r.request().url().match(/models\/([^:]+):/)||[])[1]||'';
  const l=m==='gemini-2.5-flash'?'f25':m==='gemini-2.5-flash-lite'?'l25':m;chiamate.push(l);const v=T[l]??503;
  if(typeof v==='number')return r.fulfill({status:v,contentType:'application/json',body:JSON.stringify({error:{message:'overloaded'}})});
  r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:v}]}}]})})});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const fino=async(f,arg,ms=15000)=>{const t=Date.now();while(Date.now()-t<ms){if(await pg.evaluate(f,arg))return true;await wait(200)}return false};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');
await pg.evaluate(()=>ls('jona_gemini_key','FINTA'));
// ordine con 4 prodotti, poi una bolla in coda letta da sola
const ordine=id=>pg.evaluate(async id=>{const fid=Object.keys(D().fornitori)[0];
  await put('ordini',id,{fornitoreId:fid,stato:'inviato',inviato:now()-3600e3,creato:now()-7200e3,aggiornato:now(),richieste:[],
    items:[{key:'k1',nome:'Mozzarella fior di latte',codice:'040',unita:'kg',prezzo:10,qta:5,da:[]},
      {key:'k2',nome:'Pomodori ciliegino',codice:'',unita:'pz',prezzo:2,qta:3,da:[]},
      {key:'k3',nome:'Basilico fresco',codice:'',unita:'mazzo',prezzo:4,qta:2,da:[]},
      {key:'k4',nome:'Olio extravergine',codice:'',unita:'l',prezzo:9,qta:1,da:[]}]})},id);
const leggi=async id=>{chiamate.length=0;await ordine(id);
  await pg.evaluate(async id=>{const me=realU();await codaAdd({id:'c_'+id,tipo:'bolla',oid:id,fid:D().ordini[id].fornitoreId,foto:'QUFBQQ==',creato:now(),da:me.id,daNome:fullName(me),st:'coda',n:0})},id);
  ok(await fino(id=>!!(D().ordini[id].bolla&&D().ordini[id].bolla.righe)&&!CODA.list.length,id),id+': bolla letta e coda vuota');
  return pg.evaluate(id=>D().ordini[id].bolla,id)};
const avviso=id=>pg.evaluate(id=>(Object.values(D().notifiche).filter(n=>n.tipo==='bolla'&&n.rif===id)[0]||{}),id);
const righe=id=>pg.evaluate(id=>{delete S.rcv[id];const R=rcvState(id);bolInR(R,D().ordini[id]);return R.lines.map(L=>(L.st||'-')+(L.bdc?'!':''))},id);

// 1. lettura buona (4 su 4, conti giusti): una sola chiamata, niente seconda lettura
T={f25:tab(R.moz,R.pom,R.bas,R.oli),l25:tab(R.moz)};
let B=await leggi('o1');
ok(chiamate.join()==='f25'&&B.lett==='f25'&&!B.lett2&&!(B.dc||[]).length,'lettura buona: solo Flash, niente seconda lettura '+chiamate.join());

// 2. Flash legge 2 prodotti su 4 (sotto l'80%): Flash-Lite rilegge e li trova tutti → vince Flash-Lite, i 2 letti da uno solo «da controllare a mano»
T={f25:tab(R.moz,R.pom),l25:tab(R.moz,R.pom,R.bas,R.oli)};
B=await leggi('o2');
ok(chiamate.join()==='f25,l25'&&B.lett==='l25'&&B.lett2==='f25'&&B.righe.length===4,'2 su 4: seconda lettura con Flash-Lite, tenuta la migliore (4 righe) '+chiamate.join());
ok(JSON.stringify(B.dc)==='[2,3]','2 su 4: basilico e olio (letti da uno solo) da controllare a mano '+JSON.stringify(B.dc));
let n=await avviso('o2');
ok(/2 prodotti da controllare a mano \(due letture diverse\): Basilico fresco, Olio extravergine/.test(n.testo)&&!/non sono sulla bolla/.test(n.testo),'avviso ai gestori: «2 prodotti da controllare a mano», non «non sulla bolla» '+n.testo);
ok((await righe('o2')).join()==='ok,ok,-!,-!','controllo merce: mozzarella e pomodori segnati, basilico e olio lasciati a mano');
await pg.evaluate(()=>{viewAs('staff')}).catch(()=>{});
await pg.evaluate(()=>receiveSheet('o2'));await wait(300);
const tx=await pg.textContent('.sheet');
ok(/letta da Gemini 2\.5 Flash-Lite e ricontrollata da Gemini 2\.5 Flash/.test(tx)&&/2 da controllare a mano/.test(tx)&&(tx.match(/Da controllare a mano: le due letture sono diverse/g)||[]).length===2,'foglio: «ricontrollata da», «2 da controllare a mano» e la scritta sulle 2 righe');
await pg.evaluate(()=>closeSheet());

// 3. Flash legge tutto ma 2 righe hanno i conti che non tornano (quantità sbagliata): Flash-Lite giusta → vince, quelle 2 da controllare
T={f25:tab(R.moz.replace(';5;50',';6;50'),R.pom.replace(';3;6',';8;6'),R.bas,R.oli),l25:tab(R.moz,R.pom,R.bas,R.oli)};
B=await leggi('o3');
ok(chiamate.join()==='f25,l25'&&B.lett==='l25'&&B.righe[0].q===5&&JSON.stringify(B.dc)==='[0,1]','conti che non tornano: tenuta Flash-Lite (q 5), mozzarella e pomodori da controllare '+JSON.stringify(B.dc));

// 4. lettura dubbia, il secondo lettore non risponde: resta la prima, niente righe da controllare, riga nella scatola nera
T={f25:tab(R.moz,R.pom)};
B=await leggi('o4');
ok(B.lett==='f25'&&!B.lett2&&!(B.dc||[]).length&&B.righe.length===2,'secondo lettore guasto: resta la lettura di Flash');
ok(await pg.evaluate(()=>JSON.stringify(Object.keys(ERR.seen)).includes('Seconda lettura non riuscita')),'scatola nera: «Seconda lettura non riuscita»');
n=await avviso('o4');
ok(/2 prodotti ordinati non sono sulla bolla/.test(n.testo),'avviso come prima: 2 non sulla bolla');

// 5. le due letture uguali: niente da controllare, «ricontrollata da»
T={f25:tab(R.moz,R.pom,R.bas),l25:tab(R.moz,R.pom,R.bas)};
B=await leggi('o5');
ok(B.lett==='f25'&&B.lett2==='l25'&&!(B.dc||[]).length,'letture uguali (3 su 4): resta Flash, ricontrollata da Flash-Lite, niente da controllare');
ok((await righe('o5')).join()==='ok,ok,ok,-','letture uguali: 3 segnati, olio da toccare');

// 6. listino (senza ordine): dubbio solo per i conti che non tornano
ok(await pg.evaluate(()=>{const r=codaRighe(`fornitore;codice;nome;unita;prezzo;categoria;quantita;importo
P;;A;kg;2,00;X;3;6,00
P;;B;kg;2,00;X;3;9,00
P;;C;kg;2,00;X;1;2,00`),it={tipo:'listino'};return letDubbia(it,r)&&!letDubbia(it,r.filter(x=>x.nome!=='B'))&&letPunti(it,r)<letPunti(it,r.filter(x=>x.nome!=='B'))}),'listino: 1 riga storta su 3 → dubbio; si preferisce la lettura senza righe storte');

ok(!errs.length,'nessun errore JS '+errs.join(' | '));
await b.close();
