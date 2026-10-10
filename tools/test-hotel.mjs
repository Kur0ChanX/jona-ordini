import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import worker from '../worker/src/index.js';
import { DatabaseSync } from 'node:sqlite';
// v73: ponte con l'hotel (D17). Parte 1 con l'hotel finto (app senza server): icona e funzione, striscia del vassoio, «Oggi in hotel»
// con le camere al tocco, moduli «Manda all'hotel» con i controlli, stati, «Ho letto/Fatto/Annulla», agenda → «Mando l'evento
// all'hotel?», consiglio nell'ordine suggerito. Parte 2 con il Worker vero (/ponte con D1 finto) dietro l'app: messaggi che partono,
// «arrivato» solo quando l'hotel legge, coda senza rete, vassoio dall'hotel con «Fatto» che arriva al server.
const BASE='http://localhost:8765/';
const bad=[];const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
async function avvio(W=390){
  const c=await b.newContext({viewport:{width:W,height:800}});
  await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await c.route(/open-meteo|generativelanguage/,r=>r.abort());
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(BASE+'index.html');
  await p.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await p.fill(`input[data-k="${k}"]`,v);
  await p.click('[data-a="setupGo"]');await p.waitForSelector('.testbar');await p.waitForTimeout(300);
  await p.evaluate(()=>makeTestData());await p.waitForTimeout(500);
  return {c,p};
}
const txt=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.innerText:''},sel);
const top=p=>txt(p,'.sheet-wrap:last-child .sheet');
// ---------- parte 1: hotel finto ----------
{const {c,p}=await avvio();const w=ms=>p.waitForTimeout(ms);
  ok(!await p.$('header.top [data-a="htOpen"]'),'funzione spenta: niente icona dell\'hotel');
  await p.evaluate(()=>funzSet('hotel',true));await w(500);
  const ico=await p.$('header.top [data-a="htOpen"]');ok(!!ico,'funzione accesa: icona dell\'hotel in alto');
  ok((await p.getAttribute('header.top [data-a="htOpen"]','aria-label'))==='Hotel, 2 messaggi nuovi','pallino con i 2 messaggi nuovi dell\'hotel finto');
  ok(/Ritira il vassoio · camera 104/.test(await txt(p,'main')),'striscia «Ritira il vassoio · camera 104» in cima');
  await p.click('header.top [data-a="htOpen"]');await w(500);
  let t=await top(p);
  ok(/Hotel finto/.test(t)&&/18\s*camere/.test(t)&&/34\s*ospiti/.test(t)&&/5 arrivi/.test(t)&&/3 partenze/.test(t)&&/domani 39 ospiti/.test(t),'«Oggi in hotel»: camere, ospiti, arrivi, partenze e domani');
  ok(!/Bianchi/.test(t),'i cognomi non si vedono finché non si tocca');
  await p.click('[data-a="htDet"]');await w(300);t=await top(p);
  ok(/Camera 104 · Bianchi/.test(t)&&/Camera 212 · Galli/.test(t),'al tocco l\'elenco delle camere con il cognome');
  ok(/Torta \/ sorpresa/.test(t)&&/Camera 212/.test(t),'richiesta dell\'hotel nei messaggi');
  // guasto: controllo e invio
  await p.click('[data-a="htForm"][data-v="guasto"]');await w(300);
  await p.click('[data-a="htfGo"]');await w(300);
  ok(/Scrivi cosa non va/.test(await txt(p,'#toasts')),'guasto senza testo: avviso, non parte');
  await p.click('[data-a="htfSet"][data-k="dove"][data-v="bar"]');await p.fill('#htf-cosa','Lavastoviglie perde acqua');
  await p.click('[data-a="htfSet"][data-k="urgente"][data-v="true"]');await w(200);
  await p.click('[data-a="htfGo"]');await w(500);t=await top(p);
  ok(/Bar: Lavastoviglie perde acqua/.test(t)&&/URGENTE/.test(t),'guasto mandato: compare nei messaggi, urgente');
  await w(7000);t=await top(p);
  ok(/✓✓ visto da Manutenzione/.test(t),'l\'hotel finto lo segna «visto» dalla Manutenzione');
  // richiesta ospite senza camera
  await p.click('[data-a="htForm"][data-v="richiesta-ospite"]');await w(300);await p.fill('#htf-cosa','Colazione in camera');await p.click('[data-a="htfGo"]');await w(300);
  ok(/Scrivi la camera/.test(await txt(p,'#toasts')),'richiesta ospite senza camera: avviso');
  await p.fill('#htf-camera','105');await p.click('[data-a="htfSet"][data-k="giorno"][data-v="domani"]');await p.fill('#htf-ora','08:00');await p.click('[data-a="htfGo"]');await w(500);
  ok(/Colazione in camera · domani alle 08:00/.test(await top(p)),'richiesta ospite per domani alle 8');
  // serve a noi ed evento
  await p.click('[data-a="htForm"][data-v="serve-a-noi"]');await w(300);await p.fill('#htf-cosa','tovaglie pulite');await p.fill('#htf-quanti','20');await p.click('[data-a="htfGo"]');await w(500);
  ok(/20 tovaglie pulite · oggi/.test(await top(p)),'«Serve a noi»: 20 tovaglie pulite');
  await p.click('[data-a="htForm"][data-v="evento"]');await w(300);await p.fill('#htf-titolo','Cena di gruppo');await p.fill('#htf-persone','tanti');await p.click('[data-a="htfGo"]');await w(300);
  ok(/Le persone devono essere un numero/.test(await txt(p,'#toasts')),'evento con persone non numeriche: avviso');
  await p.fill('#htf-persone','30');await p.fill('#htf-dove','terrazza');await p.click('[data-a="htfGo"]');await w(500);
  ok(/Cena di gruppo · oggi · 30 persone · terrazza/.test(await top(p)),'evento mandato con persone e posto');
  // messaggio libero
  await p.fill('[data-in="htT"]','Stasera chiudiamo la terrazza alle 23');await p.click('[data-a="htTesto"]');await w(500);
  ok(/Stasera chiudiamo la terrazza alle 23/.test(await top(p))&&(await p.inputValue('[data-in="htT"]'))==='','messaggio libero mandato, casella vuota');
  // richiesta dall'hotel: Ho letto e Fatto
  const rq='[data-a="htSt"][data-v="rvc_richiesta_finta"]';
  await p.click(rq+'[data-s="visto"]');await w(300);
  ok(!await p.$(rq+'[data-s="visto"]')&&!!await p.$(rq+'[data-s="fatto"]'),'«Ho letto» sulla richiesta: resta solo «Fatto»');
  // annulla un messaggio mio
  await p.locator('.ht-msg.out [data-a="htAnn"]').first().click();await w(400);await p.click('#ask-ok');await w(400);
  ok((await p.$$('.ht-msg.ann')).length===1,'«Annulla» su un messaggio mio: annullato');
  await p.click('.sheet-wrap:last-child .sh-h [data-a="closeSheet"]');await w(400);
  ok((await p.getAttribute('header.top [data-a="htOpen"]','aria-label'))==='Hotel','dopo aver aperto la pagina il pallino sparisce');
  // vassoio: Fatto dalla striscia
  await p.click('.ht-strip [data-a="htSt"]');await w(400);
  ok(!/Ritira il vassoio/.test(await txt(p,'main')),'«Fatto» sul vassoio: la striscia sparisce');
  ok(await p.evaluate(()=>HT.m.rvc_vassoio_finto.stato)==='fatto','vassoio segnato «fatto»');
  // messaggio che arriva dall'hotel finto
  await p.evaluate(()=>htSimMsg('vassoio'));await w(400);
  ok(/Dall'hotel: vassoio da ritirare in camera/.test(await txt(p,'#toasts'))&&/Ritira il vassoio/.test(await txt(p,'main')),'vassoio nuovo dall\'hotel: avviso e striscia');
  // agenda → hotel
  await p.evaluate(()=>funzSet('agenda',true));await w(400);
  await p.evaluate(()=>{agOpen();agForm({t:'Matrimonio Sanna',h:'19:30',cop:'80'})});await w(400);
  await p.click('[data-a="agSave"]');await w(700);
  ok(/Mando l'evento all'hotel\?/.test(await top(p)),'evento salvato in agenda: chiede «Mando l\'evento all\'hotel?»');
  await p.click('#ask-ok');await w(500);
  const ev=await p.evaluate(()=>Object.values(HT.m).find(m=>m.tipo==='evento'&&/^ev_/.test(m.id)));
  ok(ev&&ev.dati.persone===80&&ev.dati.ora==='19:30'&&ev.dati.titolo==='Matrimonio Sanna','evento dell\'agenda mandato con titolo, ora e persone');
  await p.evaluate(id=>{const e=agGet(id.slice(3));agForm(e)},ev.id);await w(400);await p.fill('#agf-c','90');await p.click('[data-a="agSave"]');await w(700);
  ok(await p.evaluate(id=>HT.m[id].dati.persone,ev.id)===90&&!/Mando l'evento/.test(await top(p)),'evento cambiato: aggiornato all\'hotel senza richiedere');
  await p.evaluate(id=>{const e=agGet(id.slice(3));agForm(e)},ev.id);await w(400);await p.click('[data-a="agDel"]');await w(400);await p.click('#ask-ok');await w(600);
  ok(await p.evaluate(id=>HT.m[id].stato,ev.id)==='annullato','evento eliminato dall\'agenda: annullato anche per l\'hotel');
  await p.evaluate(()=>{while(sheets.length)closeSheet(true)});
  await p.evaluate(()=>{agOpen();agForm({t:'Promemoria mio',vis:'io'})});await w(300);await p.click('[data-a="agSave"]');await w(600);
  ok(!/Mando l'evento/.test(await top(p)),'evento «Solo io»: non chiede di mandarlo all\'hotel');
  // ordine suggerito
  const sug=await p.evaluate(()=>htSugH());
  ok(/Domani in hotel: 39 ospiti/.test(sug)&&/oggi 34/.test(sug)&&/consiglio: <b>Di più/.test(sug),'ordine suggerito: ospiti di domani e consiglio «Di più»');
  // staff: vede icona e pagina, non gli strumenti dello sviluppatore
  await p.evaluate(()=>{while(sheets.length)closeSheet(true)});await p.click('[data-a="viewAs"][data-v="staff"]');await w(400);
  ok(!!await p.$('header.top [data-a="htOpen"]'),'lo staff vede l\'icona dell\'hotel');
  await p.evaluate(()=>{S.me=Object.values(D().staff).find(u=>u.ruolo==='staff').id;HT.k='';render()});await w(400);
  await p.click('header.top [data-a="htOpen"]');await w(400);t=await top(p);
  ok(/34\s*ospiti/.test(t)&&!/Solo sviluppatore|fai arrivare/.test(t),'lo staff vede «Oggi in hotel» ma non gli strumenti di prova');
  ok(!p.errs.length,'nessun errore nella pagina '+p.errs.join(' | '));
  await c.close();
}
// ---------- parte 2: Worker vero dietro l'app ----------
{function d1(){const db=new DatabaseSync(':memory:');const st=(sql,a=[])=>({bind:(...x)=>st(sql,x),first:async()=>db.prepare(sql).get(...a)??null,all:async()=>({results:db.prepare(sql).all(...a)}),run:async()=>{db.prepare(sql).run(...a);return{success:true}}});return{prepare:sql=>st(sql),raw:db}}
  const KEY='chiave-ponte-di-prova-1234567890',TOK='aaa.'+Buffer.from(JSON.stringify({sub:'uidMembro123',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.firma';
  const nodeFetch=globalThis.fetch;globalThis.fetch=async(url,init={})=>new Response('{}',{status:String(url).includes('/membri/uidMembro123')&&(init.headers.authorization||'')==='Bearer '+TOK?200:403});
  const env={ALLEGATI0:d1(),FB_PROJECT:'jona-ordini',PONTE_KEY:KEY};let rete=true,chiamate=0;
  const W=(path,tok,body)=>worker.fetch(new Request('https://x'+path,body?{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tok},body:JSON.stringify(body)}:{headers:{authorization:'Bearer '+tok}}),env).then(r=>r.json());
  const {c,p}=await avvio();const w=ms=>p.waitForTimeout(ms);
  await c.route(/\/ponte\//,async r=>{chiamate++;if(!rete)return r.abort();const q=r.request();
    const res=await worker.fetch(new Request(q.url(),{method:q.method(),headers:q.headers(),body:q.method()==='POST'?q.postData():undefined}),env);
    r.fulfill({status:res.status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:await res.text()})});
  await p.evaluate(tok=>{window.htSim=()=>false;window.algTok=async()=>tok;HT.k='';funzSet('hotel',true)},TOK);await w(500);
  // l'hotel manda «oggi» e un vassoio
  await W('/ponte/messaggi',KEY,{m:[{id:'rvc_oggi_x1',tipo:'oggi',dati:{giorni:[{g:await p.evaluate(()=>today()),camere:12,ospiti:21,arrivi:2,partenze:1}]}},{id:'rvc_vassoio_x1',tipo:'vassoio',camera:'301',testo:'Vassoio da ritirare'}]});
  await p.click('header.top [data-a="htOpen"]');await w(1500);let t=await top(p);
  ok(/12\s*camere/.test(t)&&/21\s*ospiti/.test(t)&&!/Hotel finto/.test(t),'con il server: «Oggi in hotel» arriva dall\'hotel vero');
  ok(/Ritira il vassoio · camera 301/.test(await txt(p,'main')),'vassoio dell\'hotel nella striscia');
  let h=await W('/ponte/messaggi?dopo=0',KEY);
  ok(h.m.find(m=>m.id==='rvc_vassoio_x1').stato==='arrivato','sul server il vassoio è «arrivato» (Jona l\'ha letto)');
  // Jona manda un guasto: «partito», poi «arrivato» solo dopo che l'hotel legge
  await p.click('[data-a="htForm"][data-v="guasto"]');await w(300);await p.fill('#htf-cosa','Forno spento');await p.click('[data-a="htfGo"]');await w(800);
  ok(/Mandato all'hotel/.test(await txt(p,'#toasts'))&&/Cucina: Forno spento[\s\S]*✓ partito/.test(await top(p)),'guasto mandato: «✓ partito», non ancora «arrivato»');
  h=await W('/ponte/messaggi?dopo=0',KEY);const g=h.m.find(m=>m.tipo==='guasto');
  ok(g&&g.da==='jona'&&g.dati.cosa==='Forno spento'&&g.nome==='Mario','l\'hotel riceve il guasto con chi l\'ha mandato');
  await W('/ponte/messaggi/'+g.id+'/stato',KEY,{stato:'visto',nome:'Manutenzione'});
  await p.evaluate(()=>{HT.at=0;return htPoll()});await w(400);
  ok(/Forno spento[\s\S]*✓✓ visto da Manutenzione/.test(await top(p)),'«visto da Manutenzione» arriva al telefono');
  // senza rete: resta in coda e parte dopo
  rete=false;await p.fill('[data-in="htT"]','Prova senza rete');await p.click('[data-a="htTesto"]');await w(600);
  ok(/Senza rete: parte appena torna la rete/.test(await txt(p,'#toasts'))&&/Prova senza rete[\s\S]*in attesa di rete/.test(await top(p)),'senza rete: messaggio «in attesa di rete», niente falso ok');
  rete=true;await p.evaluate(()=>{HT.at=0;return htPoll()});await w(500);
  h=await W('/ponte/messaggi?dopo=0',KEY);
  ok(h.m.some(m=>m.testo==='Prova senza rete')&&!/in attesa di rete/.test(await top(p)),'tornata la rete: il messaggio parte da solo');
  // Fatto sul vassoio arriva al server
  await p.click('.sheet-wrap:last-child .sh-h [data-a="closeSheet"]');await w(300);
  await p.click('.ht-strip [data-a="htSt"]');await w(800);
  h=await W('/ponte/messaggi?dopo=0',KEY);const v=h.m.find(m=>m.id==='rvc_vassoio_x1');
  ok(v.stato==='fatto'&&v.statoDa.nome==='Mario','«Fatto» sul vassoio arriva all\'hotel con il nome');
  ok(chiamate>0&&!p.errs.length,'nessun errore nella pagina '+p.errs.join(' | '));
  globalThis.fetch=nodeFetch;await c.close();
}
await b.close();
console.log(bad.length?`FAIL ${bad.length} problemi`:'PASS tutto ok');if(bad.length)process.exitCode=1;
