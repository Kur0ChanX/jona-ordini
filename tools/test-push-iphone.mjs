// #119 (iPhone di Maurizio, foto docs/img/sessione-119/): Jona aperta in Safari diceva «Notifiche bloccate» e mandava in
// Impostazioni → Notifiche → Jona Ordini, che non c'è finché l'app non è sulla schermata Home. Ora spiega come installarla.
// Permesso «denied» finto. Gira con Chromium (aspetto del telefono) e con WebKit (solo su GitHub: in locale SALTATA).
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
// [motore, dispositivo, aperta dall'icona, scheda attesa]
const CASI=[['chromium','iPhone 15',false,'installa'],['chromium','iPhone 15',true,'bloccate'],['chromium','iPad (gen 7)',false,'installa'],
  ['chromium','Pixel 7',false,'bloccate'],['webkit','iPhone 15',false,'installa'],['webkit','iPhone 15',true,'bloccate'],['webkit','Desktop Safari',false,'bloccate']];
for(const [br,nome,inst,att] of CASI){
  const tit=br+' '+nome+(inst?' (dall\'icona)':' (nel browser)');
  if(br==='webkit'&&!WK){if(process.env.CI)ok(false,tit+': WebKit non installato su GitHub');else console.log('SALTATA '+tit+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=await (br==='webkit'?webkit.launch():chromium.launch({executablePath:'/opt/pw-browsers/chromium'}));
  const ctx=await b.newContext({...devices[nome],deviceScaleFactor:1,serviceWorkers:'block'});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await ctx.addInitScript(inst=>{
    if(!('Notification' in window))window.Notification=function(){};
    window.__chiesto=0;Object.defineProperty(Notification,'permission',{configurable:true,get:()=>'denied'});
    Notification.requestPermission=async()=>{window.__chiesto++;return'denied'};
    if(!('PushManager' in window))window.PushManager=function(){};
    if(inst)Object.defineProperty(navigator,'standalone',{configurable:true,get:()=>true});
  },inst);
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
  const r=await pg.evaluate(()=>({ok:pushOk(),web:iosWeb(),den:pushDenied()}));
  ok(r.ok,tit+': notifiche possibili su questo telefono (finto) '+JSON.stringify(r));
  ok(r.web===(att==='installa'),tit+': riconosce se Jona è aperta nel browser dell\'iPhone '+JSON.stringify(r));
  ok(r.den===(att==='bloccate'),tit+': «bloccate» solo quando è un blocco vero '+JSON.stringify(r));
  await pg.evaluate(()=>pushHelp());await pg.waitForSelector('.sheet .sh-t');
  const t=await pg.textContent('.sheet .sh-t'),body=await pg.textContent('.sheet');
  if(att==='installa'){
    ok(t.includes('Prima installa Jona'),tit+': la guida spiega di installare l\'app ('+t+')');
    ok(body.includes('Aggiungi alla schermata Home')&&body.includes('Attiva le notifiche')&&!body.includes('Notifiche bloccate'),tit+': passi giusti, niente «Notifiche bloccate»');
    await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});
    await pg.evaluate(()=>pushOn());await pg.waitForSelector('.sheet .sh-t');
    ok((await pg.textContent('.sheet .sh-t')).includes('Prima installa Jona')&&await pg.evaluate(()=>__chiesto)===0,tit+': «Attiva le notifiche» apre la guida senza chiedere il permesso');
    await pg.click('.sheet [data-a="pushAll"]');await pg.waitForTimeout(200);
    ok((await pg.textContent('.sheet .sh-t')).includes('non arrivano'),tit+': «Ho un altro problema» porta alla guida completa');
  }else ok(t.includes('Notifiche bloccate'),tit+': guida delle notifiche bloccate come prima ('+t+')');
  ok(errs.length===0,tit+': nessun errore '+errs.join(' | '));
  await b.close();
}
