// v119 (D57, Mario #139 «sì va bene se è la miglior soluzione intelligente»): foto del vino nella coda di bolle e listini.
// Lettura non riuscita → «Leggila da sola: puoi chiudere l'app» → voce in coda (IndexedDB), app chiusa e riaperta, Google torna,
// letta da sola → avviso a chi ha scattato → in Cantina «Controlla e salva» → scheda piena → salvata, striscia via. Foto illeggibile due volte → avviso.
// Gemini finto, modalità locale. Su PC, Android, tablet, Mac, iPhone, iPad.
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const DEV=[['chromium','Desktop Chrome'],['chromium','Pixel 7'],['chromium','Galaxy Tab S4'],['webkit','Desktop Safari'],['webkit','iPhone 15'],['webkit','iPad (gen 7)']];
const GEM={nome:'Tignanello',cantina:'Antinori',annata:'2020',tipo:'rosso',denominazione:'Toscana IGT',frase:'Un grande rosso toscano.',sicuro:true};
for(const [br,dev] of DEV){
  if(br==='webkit'&&!WK){if(process.env.CI)ok(false,dev+': WebKit non installato su GitHub');else console.log('SALTATA '+dev+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=await (br==='webkit'?webkit:chromium).launch(br==='webkit'?{}:{executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({...devices[dev],serviceWorkers:'block'});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  let MODO='guasto',n=0;
  await ctx.route('https://generativelanguage.googleapis.com/**',r=>{n++;
    if(MODO==='guasto')return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'overloaded'}})});
    const t=MODO==='ok'?'```json\n'+JSON.stringify(GEM)+'\n```':'non vedo nessuna etichetta';
    r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:t}]}}]})})});
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  const wait=ms=>pg.waitForTimeout(ms);
  const sc=sel=>pg.locator('.sheet').last().locator(sel).first().click();
  const txt=async sel=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');
  await pg.waitForSelector('.testbar');
  await pg.evaluate(()=>ls('jona_gemini_key','prova'));
  // foto della bottiglia, lettura non riuscita (Google pieno)
  await pg.evaluate(async()=>{await modLoad('cantina');vnForm(null);const c=document.createElement('canvas');c.width=60;c.height=90;c.getContext('2d').fillRect(10,10,40,70);
    const bl=await new Promise(r=>c.toBlob(r,'image/jpeg'));await vnFotoAdd([new File([bl],'f.jpg',{type:'image/jpeg'})])});
  await wait(200);await sc('[data-a="vnFotoGo"]');
  await pg.waitForFunction(()=>S.vnf&&!S.vnf.busy&&S.vnf.ko,null,{timeout:20000});await wait(200);
  ok(await pg.locator('.sheet [data-a="vnCoda"]').count()===1&&/Leggila da sola: puoi chiudere l'app/.test(await txt('.sheet'))&&/Rileggila tu più tardi/.test(await txt('.sheet')),dev+': lettura non riuscita → «Leggila da sola: puoi chiudere l\'app» (e resta «Rileggila tu più tardi»)');
  await sc('[data-a="vnCoda"]');
  await pg.waitForFunction(()=>CODA.list.some(x=>x.tipo==='vino'),null,{timeout:10000});await wait(300);
  const it=await pg.evaluate(()=>{const x=CODA.list.find(x=>x.tipo==='vino');return{foto:x.foto.length,fx:(x.fx||[]).length,da:x.da===realU().id,aperta:!!S.vnf}});
  ok(it.foto>100&&it.fx===0&&it.da&&!it.aperta,dev+': foto in coda (tipo vino, chi ha scattato), scheda chiusa '+JSON.stringify(it));
  ok(await pg.evaluate(()=>idbKv(CODA_K()).then(l=>Array.isArray(l)&&l.some(x=>x.tipo==='vino'))),dev+': voce salvata in IndexedDB');
  // app chiusa e riaperta con Google ancora pieno: la voce torna in coda
  await pg.reload();await pg.waitForSelector('.testbar');
  await pg.waitForFunction(()=>CODA.list.some(x=>x.tipo==='vino'),null,{timeout:10000});
  await pg.waitForFunction(()=>{const x=CODA.list.find(x=>x.tipo==='vino');return x&&x.n>=1&&!x.busy},null,{timeout:30000});
  await pg.evaluate(()=>{vnOpen()});await pg.waitForSelector('.sheet .vn-ris',{timeout:10000});
  ok(/Riprovo da sola|la leggo tra poco|Sto leggendo/.test(await txt('.sheet .vn-ris')),dev+': riaperta l\'app, in Cantina «Riprovo da sola» ('+(await txt('.sheet .vn-ris'))+')');
  // Google torna: letta da sola, avviso a chi ha scattato, striscia in Cantina
  MODO='ok';await pg.evaluate(()=>{for(const x of CODA.list)x.next=0;return codaFlush()});
  await pg.waitForFunction(()=>!CODA.list.length&&Object.keys(CODA.vini).length===1,null,{timeout:30000});await wait(300);
  ok(await pg.evaluate(()=>Object.values(D().notifiche||{}).some(x=>/Vino letto: Tignanello 2020/.test(x.titolo||x.t||JSON.stringify(x)))),dev+': avviso «Vino letto: Tignanello 2020» a chi ha scattato');
  ok(/Vino letto dalla foto: Tignanello 2020/.test(await txt('.sheet')),dev+': in Cantina la striscia «Vino letto dalla foto»');
  await sc('[data-a="vnRisApri"]');await wait(300);
  ok(await pg.evaluate(()=>S.vnf&&S.vnf.n==='Tignanello'&&S.vnf.cant==='Antinori'&&S.vnf.ris)&&/Nuovo vino/.test(await txt('.sheet')),dev+': «Controlla e salva» → scheda del vino piena');
  await sc('[data-a="vnSave"]');await wait(400);
  ok(await pg.evaluate(()=>vnAll().some(v=>v.n==='Tignanello')&&!Object.keys(CODA.vini).length)&&await pg.evaluate(()=>idbKv(codaViniK()).then(x=>x==null)),dev+': vino salvato, striscia e copia del telefono via');
  // foto illeggibile due volte → avviso «foto non leggibile», la voce esce
  MODO='vuota';
  await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=40;const bl=await new Promise(r=>c.toBlob(r,'image/jpeg'));
    await codaAdd({id:'vnprova',tipo:'vino',foto:await b64(bl),fx:[],vid:'',creato:now(),da:realU().id,daNome:'Luca',st:'coda',n:0})});
  await pg.waitForFunction(()=>CODA.list.some(x=>x.id==='vnprova'&&x.vuote===1&&!x.busy),null,{timeout:20000});
  await pg.evaluate(()=>{for(const x of CODA.list)x.next=0;return codaFlush()});
  await pg.waitForFunction(()=>!CODA.list.length,null,{timeout:20000});
  ok(await pg.evaluate(()=>Object.values(D().notifiche||{}).some(x=>/Vino: foto non leggibile/.test(JSON.stringify(x)))&&!CODA.vini.vnprova),dev+': foto illeggibile due volte → avviso, nessun risultato');
  ok(errs.length===0,dev+': nessun errore JS '+JSON.stringify(errs));
  await b.close();
}
console.log(process.exitCode?'SOME FAIL':'ALL PASS');
