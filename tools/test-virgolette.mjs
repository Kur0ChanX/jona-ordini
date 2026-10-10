// v66: foto di fatture DAC lette da Gemini. Una virgoletta dentro un nome (GAMBERO ROSSO"VERITAS"3"35/50PZ, tre virgolette)
// apriva una cella tra virgolette: unità, prezzo e categoria finivano nel nome (prezzo vuoto, categoria «Altro").
// Ora le virgolette contano solo se racchiudono tutta la cella; i nomi le tengono; i CSV veri ("a;b", "") restano giusti.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const pg=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const DB={staff:{chef:{nome:'Chef',cognome:'Prova',username:'chef',ruolo:'gm',stato:'attivo'}},fornitori:{dac:{nome:'DAC'}},prodotti:{}};
await pg.goto('http://localhost:8765/manifest.webmanifest');
await pg.evaluate(D=>{localStorage.clear();localStorage.setItem('jona_db_v2',JSON.stringify(D));localStorage.setItem('jona_me',JSON.stringify('chef'))},DB);
await pg.goto('http://localhost:8765/index.html');
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef'&&typeof impRun==='function',null,{timeout:10000});
await pg.waitForTimeout(500);
const pt=t=>pg.evaluate(t=>parseTable(t),t);
// 1. le righe esatte che Gemini ha restituito per le due fatture DAC (risposta di 2 foto unita da gemJoin)
const DAC=`fornitore;codice;nome;unita;prezzo;categoria
DAC;37807;POLLO COSCE GR 180/220*10 PZ FILENI S/V;kg;4,027;Carne
DAC;805161;POLLO SOVRACOS.SO SP"ORA"200G.(2CFX2)GE;kg;7,842;Carne
DAC;88563;GAMBERO ROSSO"VERITAS"3"35/50PZ 1KG GEL##PZ;pz;45,90;Pesce`;
let r=await pt(DAC);
ok(r.every(x=>x.length===6),'every DAC row has 6 cells ('+r.map(x=>x.length).join()+')');
ok(r[3][2]==='GAMBERO ROSSO"VERITAS"3"35/50PZ 1KG GEL##PZ'&&r[3][3]==='pz'&&r[3][4]==='45,90'&&r[3][5]==='Pesce','gambero (3 quotes): unit, price and category in their cells: '+JSON.stringify(r[3]));
ok(r[2][2]==='POLLO SOVRACOS.SO SP"ORA"200G.(2CFX2)GE','quotes kept in the name: '+r[2][2]);
// 2. CSV veri restano giusti
r=await pt('nome;unita;prezzo\n"Olio; extra";l;"8,50"\n"Vino ""Rosso""";bt;12\n  "Pane"  ;kg;3');
ok(JSON.stringify(r[1])==='["Olio; extra","l","8,50"]','quoted cell with the separator inside: '+JSON.stringify(r[1]));
ok(r[2][0]==='Vino "Rosso"'&&r[2][2]==='12','doubled quotes inside a quoted cell: '+JSON.stringify(r[2]));
ok(r[3][0]==='Pane'&&r[3][1]==='kg','quoted cell with spaces around: '+JSON.stringify(r[3]));
r=await pt('nome,unita,prezzo\n"Farina 00, 25 kg",sacco,"18,40"');
ok(JSON.stringify(r[1])==='["Farina 00, 25 kg","sacco","18,40"]','comma CSV with quoted commas: '+JSON.stringify(r[1]));
// 3. nome che inizia con una virgoletta, mai chiusa bene: la riga non si fonde
r=await pt('nome;unita;prezzo;categoria\n"ORA" pollo;kg;7,8;Carne\n"ORA" pollo;kg;"7,8";Carne\nUova "bio;pz;0,4;Latticini e uova');
ok(JSON.stringify(r[1])==='["\\"ORA\\" pollo","kg","7,8","Carne"]','name starting with a quoted word: '+JSON.stringify(r[1]));
ok(r[2].length===4&&r[2][2]==='7,8','same with a quoted price: '+JSON.stringify(r[2]));
ok(JSON.stringify(r[3])==='["Uova \\"bio","pz","0,4","Latticini e uova"]','single quote never closed: '+JSON.stringify(r[3]));
ok((await pt('a|b|c\n|x "y|2|3|'))[1].join()==='x "y,2,3','pipe tables unchanged');
// 4. dall'import: «Controlla e salva» con il gambero completo
await pg.evaluate(t=>{closeSheet(true);impSheet('dac');S.imp.txt=t;impRun('txt')},DAC);
await pg.waitForSelector('.rv');
const it=await pg.evaluate(()=>S.rev.items.map(i=>({n:i.nome,u:i.unita,p:i.prezzo,c:i.categoria})));
ok(it.length===3,'3 products to check ('+it.length+')');
const g=it.find(i=>/GAMBERO/.test(i.n))||{};
ok(g.u==='pz'&&g.p===45.9&&g.c==='Pesce','gambero in the review: '+JSON.stringify(g));
ok(it.every(i=>i.p>0&&i.u),'every product has unit and price: '+JSON.stringify(it));
// 5. il testo per Gemini parla anche di fatture e bolle
const pr=await pg.evaluate(()=>geminiPrompt());
ok(/fattura/.test(pr)&&/prezzo unitario/.test(pr)&&/virgolette comprese/.test(pr),'Gemini prompt covers invoices and quotes');
ok(errs.length===0,'no page errors: '+errs.join(' | '));
await b.close();
