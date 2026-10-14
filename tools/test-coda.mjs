// v114 (D54 strada 3 «Geniale»): coda delle letture della bolla con l'emulatore. B (staff) fotografa la bolla ma il suo Gemini non
// risponde; A (altro telefono del ristorante) la vede sul cloud, la legge, mette il risultato nell'ordine e avvisa i gestori;
// B vede l'esito nel foglio aperto. Poi: B senza rete (la foto aspetta nel telefono e parte quando torna la rete), ordine già
// controllato (ricezione.bolla), lucchetto di un altro telefono (rispettato finché non scade).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const KEY='B'+'A'.repeat(86);
const BOLLA=['fornitore;codice;nome;unita;prezzo;categoria;quantita;importo',
  'Fornitore di prova 1;PROVA-01;POMODORO CILIEGINO;kg;3,50;Verdura;5;17,50',
  'Fornitore di prova 1;PROVA-02;ZUCCHINE;kg;2,10;Verdura;3;6,30',
  'Fornitore di prova 1;;LIMONI;kg;2,80;Verdura;2;5,60'].join('\n');
const gem={A:'ok',B:'503'};const letture=[];const risp=[];
const mk=async(cfg,name)=>{const c=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block'});
  await c.addInitScript(([cfg])=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},[cfg]);
  await c.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**',async r=>{const u=r.request().url();
    if(u.endsWith('/chiave'))return r.fulfill({json:{chiave:KEY}});
    if(u.endsWith('/salute'))return r.fulfill({json:{ok:true,push:true,gemini:true}});
    if(u.endsWith('/errori'))return r.fulfill({json:{ok:true,e:[]}});
    if(u.endsWith('/gemini')){const body=JSON.parse(r.request().postData()||'{}');letture.push({da:name,l:body.lettore,foto:!!(body.contents||[]).some(c=>(c.parts||[]).some(p=>p.inline_data))});
      if(gem[name]!=='ok')return r.fulfill({status:Number(gem[name]),json:{error:{message:'overloaded'}}});
      return r.fulfill({json:{lettore:body.lettore,candidates:[{content:{parts:[{text:risp.length?risp.shift():BOLLA}]}}]}})}
    r.fulfill({json:{ok:true}})});
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return [c,p]};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fino=async(pg,f,ms=15000,arg)=>{const t=Date.now();while(Date.now()-t<ms){if(await pg.evaluate(f,arg))return true;await wait(250)}return false};
const [,A]=await mk(CFG,'A');
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A attivo su firebase');
const [cb,B]=await mk(null,'B');await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"], .login .btn.primary');await B.waitForTimeout(1500);
ok(await B.evaluate(()=>meU()&&meU().id==='test_u1'),'B entra come Luca (staff)');
await A.evaluate(()=>{CODA_T.testa=0});await B.evaluate(()=>{CODA_T.testa=0});
const mkOrd=id=>A.evaluate(async id=>{const P=['test_p1','test_p2','test_p3'].map(k=>D().prodotti[k]);
  await put('ordini',id,{fornitoreId:'test_f1',fornitoreNome:'Fornitore di prova 1',stato:'inviato',items:P.map((p,i)=>({key:p.id,pid:p.id,nome:p.nome,codice:p.codice,unita:p.unita,prezzo:p.prezzo,qta:[5,3,4][i],da:[]})),richieste:[],creato:now(),inviato:now(),test:true})},id);
const foto=(pg,id)=>pg.evaluate(async id=>{const c=document.createElement('canvas');c.width=60;c.height=80;c.getContext('2d').fillRect(0,0,20,20);
  const bl=await new Promise(r=>c.toBlob(r,'image/jpeg'));await setBolla(id,[new File([bl],'bolla.jpg',{type:'image/jpeg'})])},id);
const sh='.sheet-wrap:last-child ';

// ---------- 1. B fotografa, il suo Gemini non risponde: legge A ----------
await mkOrd('test_o1');await B.waitForTimeout(1500);
await B.evaluate(()=>receiveSheet('test_o1'));await B.waitForTimeout(400);
await foto(B,'test_o1');
ok(await fino(B,()=>{const it=CODA.list[0];return it&&it.st==='errore'&&!it.busy}),'B: Gemini del telefono non risponde, la bolla resta in coda («errore», riprova da sola)');
ok(/Riprovo tra/.test(await B.innerText(sh+'#coda-stato'))&&letture.filter(x=>x.da==='B'&&x.foto).length>=2,'B: «Riprovo tra…» nel foglio; ha provato più lettori con la foto');
ok(await fino(A,()=>{const o=D().ordini.test_o1;return!!(o&&o.bolla&&o.bolla.righe)},20000),'A ha preso la bolla dal cloud e l\'ha letta: «bolla» nell\'ordine');
const ob=await A.evaluate(()=>D().ordini.test_o1.bolla);
ok(ob.righe.length===3&&ob.lett==='f25'&&ob.da==='test_u1'&&ob.daNome==='Luca Prova'&&ob.lettoDa===await A.evaluate(()=>realU().id)&&ob.extra.join()==='LIMONI','bolla: 3 righe, lettore f25, foto di Luca, letta da mario, Limoni in più '+JSON.stringify({l:ob.lett,da:ob.da,n:ob.daNome,x:ob.extra}));
ok(letture.filter(x=>x.da==='A'&&x.foto).length===1,'A ha chiamato Gemini una volta sola con la foto');
const na=await A.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='bolla')[0]);
ok(na&&na.a==='gm'&&/3 cose da vedere/.test(na.titolo)&&/1 prezzo diverso.*Pomodoro/.test(na.testo)&&/non è sulla bolla: Basilico/.test(na.testo)&&/non ordinato: LIMONI/.test(na.testo)&&/Foto di Luca Prova; la consegna è ancora da controllare/.test(na.testo),'avviso ai gestori: prezzo diverso, Basilico mancante, Limoni in più, foto di Luca '+JSON.stringify(na&&na.testo));
ok(await fino(B,()=>CODA.list.length===0&&!!document.querySelector('#bol-esito')),'B: la voce esce dalla sua coda e il foglio aperto mostra «Bolla letta»');
const tb=await B.innerText(sh+'#bol-esito');
ok(/Bolla letta da Gemini 2.5 Flash: 2 prodotti segnati/.test(tb)&&/1 non sulla bolla/.test(tb)&&/LIMONI/.test(tb)&&!/foto di/.test(tb),'B: «letta da Gemini 2.5 Flash: 2 prodotti segnati», 1 non sulla bolla, Limoni in più, senza «foto di» (è la sua) '+tb.replace(/\s+/g,' ').slice(0,120));
ok(await B.evaluate(()=>{const L=rcvState('test_o1').lines;return L[0].st==='ok'&&L[1].st==='ok'&&L[2].st===''&&L[2].bno===true}),'B: pomodoro e zucchine «c\'è», basilico da toccare e segnato «non sulla bolla»');
ok(!(await B.$(sh+'#coda-stato')),'B: niente più stato della coda');
const cd=await A.evaluate(async()=>{const s=await fbInit().fs.collection('coda').get();return s.docs.map(d=>d.data())});
ok(cd.length===1&&cd[0].st==='fatta'&&!cd[0].foto&&cd[0].oid==='test_o1'&&cd[0].n>=1,'cloud: voce «fatta», foto tolta '+JSON.stringify(cd.map(x=>({st:x.st,foto:!!x.foto,n:x.n}))));
ok(await B.evaluate(()=>idbKv('coda_q').then(l=>l==null)),'B: IndexedDB vuota');
// B conferma «È arrivato tutto»: la bolla letta finisce lo stesso in ricezione.bolla, con il prezzo diverso
await B.click(sh+'[data-a="rcvAll"]');await B.waitForTimeout(1500);
const o1=await A.evaluate(()=>D().ordini.test_o1);
ok(o1.ricevuto&&o1.ricezione&&o1.ricezione.bolla&&o1.ricezione.bolla.righe.length===3&&o1.prezziDiversi===1,'«È arrivato tutto»: ricezione.bolla con le 3 righe e 1 prezzo diverso');

// ---------- 2. B senza rete: la foto aspetta nel telefono; ordine già controllato → ricezione.bolla ----------
await mkOrd('test_o2');await B.waitForTimeout(1500);
await B.evaluate(()=>receiveSheet('test_o2'));await B.waitForTimeout(400);
await cb.setOffline(true);await B.waitForTimeout(300);
await foto(B,'test_o2');await B.waitForTimeout(800);
const st2=await B.innerText(sh+'#coda-stato');
ok(/Manca la rete/.test(st2)&&/non si perde/.test(st2)&&await B.evaluate(()=>CODA.list.length===1&&CODA.list[0].st==='attesa'),'B senza rete: «Manca la rete: la leggo appena torna», voce in coda «attesa» '+st2.replace(/\s+/g,' ').slice(0,80));
ok(await B.evaluate(()=>idbKv('coda_q').then(l=>Array.isArray(l)&&l.length===1&&l[0].oid==='test_o2')),'B senza rete: la foto è in IndexedDB');
await A.waitForTimeout(2000);
ok(await A.evaluate(()=>!CODA.cloud.some(x=>x.oid==='test_o2')&&!D().ordini.test_o2.bolla),'A non vede ancora niente (B è senza rete)');
// nel frattempo la consegna viene controllata a mano
await A.evaluate(()=>upd('ordini','test_o2',{ricevuto:now(),ricevutoDa:'test_u1',ricevutoNome:'Luca Prova',ricezione:{righe:[],note:'',foto:''},differenze:0,nonControllati:0}));
await cb.setOffline(false);await B.waitForTimeout(500);
ok(await fino(A,()=>{const o=D().ordini.test_o2;return!!(o&&o.ricezione&&o.ricezione.bolla&&o.ricezione.bolla.righe)},25000),'rete tornata: la foto parte da B, A la legge e la mette in ricezione.bolla (ordine già controllato)');
const o2=await A.evaluate(()=>D().ordini.test_o2);
ok(o2.prezziDiversi===1&&!o2.bolla,'ordine già controllato: prezziDiversi 1, niente campo «bolla» a parte');
await fino(A,()=>Object.values(D().notifiche).some(n=>n.tipo==='bolla'&&n.rif==='test_o2'),20000);
const n2=await A.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='bolla'&&n.rif==='test_o2')[0]);
ok(n2&&/Foto di Luca Prova\.$/.test(n2.testo),'avviso: «Foto di Luca Prova.» senza «ancora da controllare» '+JSON.stringify(n2&&n2.testo));
ok(await fino(B,()=>CODA.list.length===0,30000),'B: coda vuota dopo la lettura di A');

// ---------- 3. lucchetto di un altro telefono: rispettato finché non scade ----------
await mkOrd('test_o3');await A.waitForTimeout(1200);
const fotoB64=await A.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=40;c.getContext('2d').fillRect(0,0,10,10);return c.toDataURL('image/jpeg').split(',')[1]});
await A.evaluate(f=>fbInit().fs.collection('coda').doc('lk1').set({tipo:'bolla',oid:'test_o3',fid:'test_f1',foto:f,creato:now()-5000,da:'test_u1',daNome:'Luca Prova',st:'lettura',at:now(),lk:'altro-telefono',n:1}),fotoB64);
await A.waitForTimeout(2500);
ok(await A.evaluate(()=>!CODA.list.some(x=>x.id==='lk1')&&!D().ordini.test_o3.bolla),'lucchetto fresco di un altro telefono: A non la tocca');
await A.evaluate(()=>fbInit().fs.collection('coda').doc('lk1').update({at:now()-CODA_T.lock-1000}));
await A.evaluate(()=>{codaRaccogli();return codaFlush()});
ok(await fino(A,()=>!!D().ordini.test_o3.bolla,25000)&&await fino(A,()=>!CODA.list.length,5000),'lucchetto scaduto: A la legge e la toglie dalla coda');
const lk=await A.evaluate(async()=>(await fbInit().fs.collection('coda').doc('lk1').get()).data());
ok(lk.st==='fatta'&&lk.lk!=='altro-telefono'&&!lk.foto,'cloud: «fatta» con il lucchetto di A, foto tolta '+JSON.stringify({st:lk.st,lk:lk.lk}));
// ---------- 4. v115: foto dei listini in coda (D54 c) ----------
const pz=await A.evaluate(()=>D().prodotti.test_p1.prezzo);
const L1=['fornitore;codice;nome;unita;prezzo;categoria','Fornitore di prova 1;PROVA-01;POMODORO CILIEGINO;kg;'+String(Math.round(pz*120)/100).replace('.',',')+';Verdura','Fornitore di prova 1;PROVA-02;ZUCCHINE;kg;2,10;Verdura'].join('\n');
const L2=['fornitore;codice;nome;unita;prezzo;categoria','Fornitore di prova 1;NUOVO-9;CAROTE;kg;1,30;Verdura'].join('\n');
risp.push(L1,L2);
const fotoList=(pg,fid,n)=>pg.evaluate(async([fid,n])=>{impSheet(fid);const fs=[];for(let i=0;i<n;i++){const c=document.createElement('canvas');c.width=60;c.height=80;c.getContext('2d').fillRect(0,0,10+i*5,20);
  fs.push(new File([await new Promise(r=>c.toBlob(r,'image/jpeg'))],'listino'+i+'.jpg',{type:'image/jpeg'}))}await gemAdd(fs);await codaListino();return S.imp.grp},[fid,n]);
const g1=await fotoList(A,'test_f1',2);
ok(!!g1&&await A.evaluate(g=>CODA.list.filter(x=>x.grp===g&&x.tipo==='listino').length===2||!!CODA.ris[g],g1),'A: 2 foto del listino in coda (gruppo '+String(g1).slice(0,6)+'…)');
ok(await fino(A,g=>!!(S.rev&&S.rev.grp===g),25000,g1),'A (gestore): a lettura finita si apre da solo «Controlla e salva» con il risultato della coda');
const rv=await A.evaluate(()=>({n:S.rev.items.length,nomi:S.rev.items.map(i=>i.nome).join('|'),lett:(S.rev.lett||[]).map(x=>x.l).join()}));
ok(rv.n===3&&/POMODORO.*ZUCCHINE.*CAROTE/i.test(rv.nomi)&&rv.lett==='f25,f25','controllo: 3 righe dalle 2 foto unite, lettori f25,f25 '+JSON.stringify(rv));
await fino(A,()=>Object.values(D().notifiche).some(n=>n.tipo==='listino'),10000);
const nl=await A.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='listino')[0]);
ok(nl&&nl.a==='gm'&&/Listino Fornitore di prova 1: 3 righe lette, 1 prezzo aumentato/.test(nl.titolo)&&/1 prezzo aumentato: Pomodoro Ciliegino \+20%/i.test(nl.testo)&&/1 prodotto nuovo/.test(nl.testo)&&/Foto di Mario Test/.test(nl.testo),'avviso ai gestori: 3 righe, Pomodoro +20%, 1 prodotto nuovo, foto di Mario '+JSON.stringify(nl&&[nl.titolo,nl.testo]));
const cr=await A.evaluate(async()=>{const s=await fbInit().fs.collection('coda').get();return s.docs.map(d=>({id:d.id,tipo:d.data().tipo,st:d.data().st,foto:!!d.data().foto}))});
ok(cr.filter(x=>x.tipo==='ris').length===1&&!cr.some(x=>x.tipo==='listino'),'cloud: un solo risultato «ris», voci delle foto tolte '+JSON.stringify(cr.filter(x=>x.tipo!=='bolla')));
ok(await fino(A,()=>!!document.querySelector('.sheet-wrap:last-child [data-a="rvok"]')),'foglio «Controlla e salva» aperto');
await A.click(sh+'[data-a="rvok"]');await A.waitForTimeout(2000);
await A.evaluate(()=>{if(sheets.length)closeSheet(true)});// foglio «Prezzi aumentati» dopo il salvataggio
ok(await fino(A,([g,pz])=>!CODA.ris[g]&&!CODA.cloud.some(x=>x.id===g&&x.st!=='tolto')&&Math.abs(D().prodotti.test_p1.prezzo-Math.round(pz*120)/100)<0.001,30000,[g1,pz]),'salvato: prezzo del pomodoro aggiornato, risultato tolto dal telefono e dal cloud');
ok(await fino(A,async()=>(await fbInit().fs.collection('coda').get()).docs.every(d=>d.data().tipo!=='ris'||d.data().st==='tolto'),30000),'cloud: risultato segnato «tolto» (nessun telefono lo rifà)');
// 4b. il Gemini di A non risponde: legge B (staff), A vede il risultato arrivare nel foglio aperto
gem.A='503';risp.push(L2);const n0=letture.length;
const g2=await fotoList(A,'test_f1',1);
ok(await fino(A,g=>{const it=CODA.list.find(x=>x.grp===g);return!!it&&it.st==='errore'&&!it.busy},20000,g2),'A: Gemini non risponde, la foto resta in coda');
ok(/Riprovo tra/.test(await A.innerText(sh+'#coda-stato')),'A: «Riprovo tra…» nel foglio del listino');
ok(await fino(B,g=>CODA.list.some(x=>x.grp===g&&x.st==='errore'),20000,g2),'B prende la foto dal cloud, ma anche il suo Gemini è spento: resta in coda');
gem.B='ok';await B.evaluate(()=>{for(const x of CODA.list)x.next=0;return codaFlush()});
ok(await fino(A,g=>!!(S.rev&&S.rev.grp===g),30000,g2),'Gemini di B tornato: B legge la foto, su A si apre «Controlla e salva» da solo');
ok(letture.slice(n0).some(x=>x.da==='A'&&x.foto)&&letture.slice(n0).some(x=>x.da==='B'&&x.foto),'A ha provato, B ha letto');
ok(await A.evaluate(()=>S.rev.items.length===1&&/CAROTE/i.test(S.rev.items[0].nome)),'controllo: 1 riga (Carote) letta da B');
ok(await B.evaluate(()=>CODA.list.length===0)&&!(await B.$('[data-a="codaRis"]')),'B (staff): coda vuota, nessuna striscia «Listino letto»');
await fino(A,()=>Object.values(D().notifiche).filter(n=>n.tipo==='listino').length>=2,20000);
const nl2=await A.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='listino').length);
ok(nl2===2,'un solo avviso nuovo ai gestori (risultato creato una volta sola) '+nl2);
await A.evaluate(()=>closeSheet());await A.waitForTimeout(600);
ok(await A.evaluate(()=>!document.querySelector('.sheet-wrap')),'A: chiuso «Controlla e salva», nessun foglio rimasto sotto');
ok(await A.evaluate(()=>{S.tab='fornitori';render();return!!document.querySelector('[data-a="codaRis"]')}),'A: striscia «Listino letto» in Fornitori finché non salva');
await A.click('[data-a="codaRisVia"]');
const togli=await fino(A,()=>!document.querySelector('[data-a="codaRis"]')&&!codaRisList().length,30000);
ok(togli,'«Togli»: la striscia sparisce'+(togli?'':' '+JSON.stringify(await A.evaluate(async()=>({ris:Object.values(CODA.ris).map(r=>r.grp+':'+r.tipo+':'+Object.keys(r.p||{})),cloud:CODA.cloud.map(x=>x.id+':'+x.tipo+':'+x.st),docs:(await fbInit().fs.collection('coda').get()).docs.map(d=>d.id+':'+d.data().tipo+':'+d.data().st),strisce:[...document.querySelectorAll('[data-a=codaRisVia]')].map(b=>b.dataset.id)})))));
gem.A='ok';gem.B='503';
ok(A.errs.length===0&&B.errs.length===0,'nessun errore di pagina '+JSON.stringify([A.errs,B.errs]));
await b.close();
console.log(process.exitCode?'SOME FAIL':'ALL PASS');
