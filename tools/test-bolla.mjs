// v77 (D25): foto della bolla letta da Gemini e confrontata con l'ordine nel Controllo merce (modalità locale, Gemini finto).
// v114 (D54 strada 3): la foto va in coda e si legge da sola, anche dopo la chiusura dell'app; avviso ai gestori con le discrepanze.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT='/tmp/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
// Gemini finto: risponde con la tabella della bolla (o con un errore 503 se GUASTO)
let GUASTO=false,chiamate=0,NO_TB=false;const corpi=[];
const BOLLA=['fornitore;codice;nome;unita;prezzo;categoria;quantita;importo',
  'Prova;40;MOZZARELLA FIOR DI LATTE BUSTA;kg;11,00;Latticini;5;55,00',
  'Prova;;Pomodori ciliegino rossi;pz;2,00;Frutta e verdura;2;4,00',
  'Prova;;Basilico fresco mazzo;mazzo;4,00;Frutta e verdura;2;8,00',
  'Prova;;Burrata pugliese;pz;3,00;Latticini;1;3,00',
  'Prova;;Spese di trasporto;;5,00;Altro;1;5,00'].join('\n');
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{chiamate++;
  const bo=JSON.parse(r.request().postData()||'{}'),tb=((bo.generationConfig||{}).thinkingConfig||{}).thinkingBudget;
  corpi.push({m:(r.request().url().match(/models\/([^:]+):/)||[])[1],tb});
  if(NO_TB&&tb===0)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{message:'thinking not supported'}})});
  if(GUASTO)return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'overloaded'}})});
  r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:BOLLA}]}}]})})});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');
await pg.evaluate(()=>ls('jona_gemini_key','FINTA'));

// ordine inviato con 4 prodotti: mozzarella (cod. 040, prezzo 10 → bolla 11), pomodori 3 (bolla 2), basilico 2 (toccato a mano prima), olio (non sulla bolla)
const oid=await pg.evaluate(async()=>{const fid=Object.keys(D().fornitori)[0];const id='ord_bolla';
  await put('ordini',id,{fornitoreId:fid,stato:'inviato',inviato:now()-3600e3,creato:now()-7200e3,aggiornato:now(),richieste:[],
    items:[{key:'k1',nome:'Mozzarella fior di latte',codice:'040',unita:'kg',prezzo:10,qta:5,da:[]},
      {key:'k2',nome:'Pomodori ciliegino',codice:'',unita:'pz',prezzo:2,qta:3,da:[]},
      {key:'k3',nome:'Basilico fresco',codice:'',unita:'mazzo',prezzo:4,qta:2,da:[]},
      {key:'k4',nome:'Olio extravergine',codice:'',unita:'l',prezzo:9,qta:1,da:[]}]});return id});
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
await pg.evaluate(id=>receiveSheet(id),oid);await wait(300);
ok(!(await pg.$('[data-a="bolLeggi"]'))&&!(await pg.$('[data-a="codaOra"]'))&&/Scatta e basta/.test(await pg.textContent('.sheet')),'v114: senza foto niente pulsante, c\'è «Scatta e basta: la bolla si legge da sola»');
// v114 (D54 strada 3): la foto va subito in coda e si legge da sola. Con Gemini guasto resta in coda con il conto alla rovescia
const foto=async id=>pg.evaluate(async id=>{const c=document.createElement('canvas');c.width=60;c.height=80;c.getContext('2d').fillRect(0,0,20,20);
  const bl=await new Promise(r=>c.toBlob(r,'image/jpeg'));await setBolla(id,[new File([bl],'bolla.jpg',{type:'image/jpeg'})])},id);
GUASTO=true;await foto(oid);await pg.waitForSelector('#coda-stato [data-a="codaOra"]');
const st1=await pg.textContent('#coda-stato');
ok(/Riprovo tra \d+:\d\d \(tentativo 1\)/.test(st1)&&/chiudere l'app/.test(st1),'Gemini guasto: «Riprovo tra m:ss (tentativo 1)… Puoi chiudere l\'app» '+st1.trim().slice(0,90));
ok(await pg.evaluate(id=>rcvState(id).lines.filter(l=>l.st).length===0&&CODA.list.length===1&&CODA.list[0].oid===id&&!/^data:/.test(CODA.list[0].foto)&&CODA.list[0].st==='errore',oid),'Gemini guasto: nessun prodotto segnato, voce in coda con la foto in base64 e stato «errore»');
ok(await pg.evaluate(()=>idbKv('coda_q').then(l=>Array.isArray(l)&&l.length===1&&l[0].foto.length>100)),'la voce con la foto è salvata in IndexedDB jona-kv (coda_q)');
await pg.evaluate(()=>{S.tab='arrivi';closeSheet();render()});await wait(300);
ok(/bolla in coda/.test(await pg.textContent('main')),'Arrivi: etichetta «bolla in coda» sull\'ordine');
// app chiusa e riaperta: la coda torna da IndexedDB e la lettura riparte da sola; il risultato finisce nell'ordine anche senza il foglio aperto
await pg.reload();await pg.waitForSelector('.testbar');await wait(800);
ok(await pg.evaluate(()=>CODA.list.length===1&&CODA.list[0].st==='errore'),'dopo la riapertura la bolla è ancora in coda');
GUASTO=false;await pg.evaluate(()=>{CODA.list[0].next=0;return codaFlush()});await wait(300);
const ob=await pg.evaluate(id=>D().ordini[id].bolla,oid);
ok(ob&&ob.righe&&ob.righe.length===5&&ob.lett==='f25'&&ob.cid&&await pg.evaluate(()=>CODA.list.length===0),'letta da sola: «bolla» salvata nell\'ordine con 5 righe e lettore f25, coda vuota');
ok(await pg.evaluate(()=>idbKv('coda_q').then(l=>l==null)),'IndexedDB svuotata dopo la lettura');
const na=await pg.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='bolla').sort((a,b)=>b.creato-a.creato)[0]);
ok(na&&na.a==='gm'&&/4 cose da vedere/.test(na.titolo)&&/1 prezzo diverso.*Mozzarella/.test(na.testo)&&/non è sulla bolla: Olio/.test(na.testo)&&/quantità minore: Pomodori/.test(na.testo)&&/non ordinato: Burrata/.test(na.testo)&&/ancora da controllare/.test(na.testo),'avviso ai gestori: 4 cose da vedere (prezzo, mancante, meno, in più) '+JSON.stringify(na&&na.testo));
await pg.evaluate(()=>{S.tab='arrivi';render()});await wait(200);
ok(/bolla letta/.test(await pg.textContent('main')),'Arrivi: etichetta «bolla letta»');
// il foglio del controllo riaperto mostra la lettura: precompila solo le righe non toccate (il basilico era già «manca»)
await pg.evaluate(id=>{rcvState(id).lines[2].st='ko';receiveSheet(id)},oid);await pg.waitForSelector('#bol-esito');
const L=await pg.evaluate(id=>rcvState(id).lines.map(l=>({st:l.st,arr:l.arr,bq:l.bq,bno:l.bno})),oid);
ok(L[0].st==='ok','mozzarella trovata col codice (040 = 40) e segnata «c\'è»');
ok(L[1].st==='meno'&&L[1].arr===2,'pomodori: sulla bolla 2 su 3 → «ne è arrivato meno», 2');
ok(L[2].st==='ko','basilico toccato a mano prima: non cambiato');
ok(L[3].st===''&&L[3].bno===true,'olio non sulla bolla: lasciato da toccare e segnato');
const tx=await pg.textContent('.sheet');
ok(tx.includes('Non è sulla bolla'),'scritta rossa «Non è sulla bolla»');
ok(/Sulla bolla ma non ordinati:\s*Burrata pugliese/.test(tx)&&!/trasporto/i.test(tx.split('non ordinati')[1]||''),'burrata in più segnata, spese di trasporto no');
ok(tx.includes('2 prodotti segnati'),'esito: 2 prodotti segnati da solo');
ok(!/€|11,00/.test(tx),'lo staff non vede i prezzi');
await pg.screenshot({path:OUT+'bolla-staff.png'});

// invio: l'olio lo segna chi controlla, poi il gestore riceve l'avviso con il prezzo diverso
await pg.evaluate(id=>{rcvState(id).lines[3].st='ok';return confirmReceipt(id,false)},oid);await wait(400);
const o=await pg.evaluate(id=>D().ordini[id],oid);
ok(o.ricevuto&&o.ricezione.bolla&&o.ricezione.bolla.righe.length===5,'ricezione.bolla salvata con le 5 righe lette');
ok(o.prezziDiversi===1,'1 prezzo diverso (mozzarella 11 € invece di 10 €; basilico uguale)');
const nt=await pg.evaluate(()=>Object.values(D().notifiche).sort((a,b)=>b.creato-a.creato)[0]);
ok(nt&&/1 prezzo diverso/.test(nt.testo||nt.corpo||JSON.stringify(nt)),'avviso al gestore con «1 prezzo diverso»');

// vista del gestore: prezzo della bolla in rosso; vista staff: niente prezzi
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.evaluate(id=>receiptView(id),oid);await wait(300);
const g=await pg.textContent('.sheet');
ok(/prezzo bolla 11,00\s*€, ordine 10,00\s*€/.test(g),'gestore: «prezzo bolla 11,00 €, ordine 10,00 €»');
ok(await pg.$eval('.sheet',s=>[...s.querySelectorAll('.bol-r.ko')].some(e=>/prezzo bolla/.test(e.textContent))),'gestore: prezzo diverso in rosso');
ok(g.includes('Non era sulla bolla')&&g.includes('Burrata pugliese'),'gestore: olio «Non era sulla bolla» e burrata in più');
await pg.screenshot({path:OUT+'bolla-gestore.png'});
await pg.evaluate(()=>closeSheet());await wait(200);
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(300);
await pg.evaluate(id=>receiptView(id),oid);await wait(300);
const st=await pg.textContent('.sheet');
ok(!/prezzo bolla|€/.test(st)&&st.includes('Sulla bolla: 5'),'staff: quantità della bolla sì, prezzi no');

// funzione di abbinamento: due righe simili non prendono la stessa riga della bolla
const m=await pg.evaluate(()=>{const r=bolMatch([{nome:'Farina 00 Caputo',codice:''},{nome:'Farina integrale',codice:''}],
  [{nome:'FARINA INTEGRALE BIO',codice:''},{nome:'Farina 00 Caputo pizzeria',codice:''}]);return[...r.ri]});
ok(JSON.stringify(m.sort())===JSON.stringify([[0,1],[1,0]]),'abbinamento: ogni riga della bolla una volta sola '+JSON.stringify(m));
ok(chiamate>=2,'Gemini chiamato');
ok(/Bolla letta da Gemini 2.5 Flash/.test(tx),'esito: «Bolla letta da Gemini 2.5 Flash»');
// v113 (Mario #132): la bolla la legge Gemini 2.5 Flash senza ragionamento; se Google rifiuta (400) la stessa richiesta senza thinkingConfig
ok(corpi[0].m==='gemini-2.5-flash'&&corpi[0].tb===0,'v113: primo lettore gemini-2.5-flash con thinkingBudget 0 '+JSON.stringify(corpi[0]));
ok(corpi.every(c=>/^gemini-2\.5-flash(-lite)?$/.test(c.m)&&(c.m==='gemini-2.5-flash-lite'||c.tb===0)),'v113: tutte le letture della bolla con Gemini 2.5 (f25 senza ragionamento, poi l25; niente Gemini 3) '+JSON.stringify(corpi.map(c=>c.m+':'+c.tb)));
corpi.length=0;NO_TB=true;
await pg.evaluate(()=>closeSheet());await wait(200);
const oid2=await pg.evaluate(async()=>{const fid=Object.keys(D().fornitori)[0];const id='ord_bolla2';
  await put('ordini',id,{fornitoreId:fid,stato:'inviato',inviato:now()-3600e3,creato:now()-7200e3,aggiornato:now(),richieste:[],
    items:[{key:'k1',nome:'Mozzarella fior di latte',codice:'040',unita:'kg',prezzo:10,qta:5,da:[]}]});return id});
await pg.evaluate(id=>receiveSheet(id),oid2);await wait(300);
// «Togli» con la bolla ancora in coda: la voce sparisce da coda e IndexedDB
NO_TB=false;GUASTO=true;await foto(oid2);await pg.waitForSelector('#coda-stato');
await pg.click('[data-a="bollaDel"]');await wait(300);
ok(await pg.evaluate(()=>CODA.list.length===0)&&!(await pg.$('#coda-stato'))&&await pg.evaluate(()=>idbKv('coda_q').then(l=>l==null)),'«Togli» con la bolla in coda: coda e IndexedDB vuote');
corpi.length=0;NO_TB=true;GUASTO=false;await foto(oid2);await pg.waitForSelector('#bol-esito',{timeout:8000});
ok(corpi.length===2&&corpi[0].tb===0&&corpi[1].tb===undefined&&corpi[1].m==='gemini-2.5-flash'&&await pg.evaluate(id=>rcvState(id).lines[0].st==='ok',oid2),'v113: Google rifiuta thinkingBudget (400) → stessa richiesta a f25 senza thinkingConfig, bolla letta '+JSON.stringify(corpi));
await pg.evaluate(()=>closeSheet());await wait(200);
ok(errs.length===0,'no pageerror '+JSON.stringify(errs));
await b.close();
console.log(process.exitCode?'SOME FAIL':'ALL PASS');
