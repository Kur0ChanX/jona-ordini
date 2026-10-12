// #116 (Mario, foto docs/img/sessione-116/): con l'app a schermo intero su Android la tastiera copriva il campo «Scrivi un messaggio».
// Tastiera finta: visualViewport sostituito prima dell'avvio (più bassa di 300 px e spostata), poi il campo deve stare tutto sopra la tastiera.
// Gira su telefono e tablet Android, iPhone e iPad (WebKit solo su GitHub: in locale SALTATA).
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const DEV=[['chromium','Pixel 7'],['chromium','Galaxy Tab S4'],['webkit','iPhone 15'],['webkit','iPad (gen 7)']];
for(const [br,nome] of DEV){
  if(br==='webkit'&&!WK){if(process.env.CI)ok(false,nome+': WebKit non installato su GitHub');else console.log('SALTATA '+nome+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=await (br==='webkit'?webkit.launch():chromium.launch({executablePath:'/opt/pw-browsers/chromium'}));
  const ctx=await b.newContext({...devices[nome],deviceScaleFactor:1,serviceWorkers:'block'});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await ctx.addInitScript(()=>{const f=new EventTarget();f.kb=0;f.off=0;
    Object.defineProperty(f,'height',{get:()=>innerHeight-f.kb});Object.defineProperty(f,'width',{get:()=>innerWidth});
    Object.defineProperty(f,'offsetTop',{get:()=>f.off});Object.defineProperty(f,'offsetLeft',{get:()=>0});Object.defineProperty(f,'scale',{get:()=>1});
    Object.defineProperty(window,'visualViewport',{configurable:true,get:()=>f});window.__kb=(k,o)=>{f.kb=k;f.off=o||0;f.dispatchEvent(new Event('resize'))}});
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
  await pg.evaluate(()=>chOpen('tutti'));await pg.waitForSelector('#ch-ta');await pg.waitForTimeout(400);
  const mis=()=>pg.evaluate(()=>{const i=document.querySelector('.cht-in').getBoundingClientRect(),h=document.querySelector('.cht-c .cht-h').getBoundingClientRect(),v=visualViewport;return{inTop:Math.round(i.top),inBot:Math.round(i.bottom),hTop:Math.round(h.top),vTop:v.offsetTop,vBot:v.offsetTop+v.height,ih:innerHeight}});
  const a=await mis();
  ok(a.inBot<=a.ih+1&&a.inBot>=a.ih-120,nome+': senza tastiera il campo sta in fondo allo schermo '+JSON.stringify(a));
  await pg.evaluate(()=>__kb(Math.round(innerHeight*.42),0));await pg.waitForTimeout(200);
  const k=await mis();
  ok(k.inBot<=k.vBot+1&&k.inTop>=k.vTop&&k.hTop>=k.vTop-1,nome+': tastiera aperta, campo e intestazione sopra la tastiera '+JSON.stringify(k));
  await pg.evaluate(()=>__kb(Math.round(innerHeight*.42),90));await pg.waitForTimeout(200);
  const s=await mis();
  ok(s.inBot<=s.vBot+1&&s.hTop>=s.vTop-1,nome+': pagina spostata dal telefono, la chat segue la parte visibile '+JSON.stringify(s));
  await pg.evaluate(()=>__kb(0,0));await pg.waitForTimeout(200);
  const c=await mis();
  ok(c.inBot===a.inBot&&c.hTop===a.hTop,nome+': tastiera chiusa, tutto torna come prima '+JSON.stringify(c));
  ok(errs.length===0,nome+': nessun errore '+errs.join(' | '));
  await b.close();
}
