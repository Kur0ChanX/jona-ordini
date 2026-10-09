import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// v57: schermo intero come nella v45; v60: cutoutFix: meta theme-color fisso, nessuna copertura in alto, nessuna richiesta di schermo intero
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const ctx=await b.newContext({viewport:{width:390,height:800},colorScheme:'dark'});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');await wait(500);
const meta=()=>pg.evaluate(()=>document.querySelector('meta[name=theme-color]').content);
ok(await meta()==='#3A2F2C','theme-color fisso all\'avvio: '+await meta());
await pg.evaluate(()=>{ls('jona_theme','light');applyTheme()});ok(await meta()==='#3A2F2C','tema chiaro: theme-color resta fisso');
await pg.evaluate(()=>{ls('jona_theme','dark');applyTheme()});ok(await meta()==='#3A2F2C','tema scuro: theme-color resta fisso');
await pg.evaluate(()=>{ls('jona_theme',null);applyTheme()});
ok(await pg.evaluate(()=>getComputedStyle(document.body,'::before').content==='none'||getComputedStyle(document.body,'::before').content===''),'nessuna copertura fissa in alto');
ok(await pg.evaluate(()=>typeof themeBar==='undefined'&&typeof fsTry==='undefined'),'niente themeBar né richiesta di schermo intero');
ok(await pg.evaluate(()=>document.querySelector('meta[name=viewport]').content.includes('viewport-fit=cover')),'viewport-fit=cover presente');
await pg.mouse.click(100,300);await wait(200);
// v60: cutoutFix solo nell'app installata a schermo intero; cambia viewport-fit e lo rimette com'era
ok(await pg.evaluate(()=>cutoutFix()===false),'nel browser (non installata) cutoutFix non fa nulla');
const cf=await pg.evaluate(async()=>{const mm=window.matchMedia;window.matchMedia=q=>q==='(display-mode: fullscreen)'?{matches:true,addEventListener(){}}:mm.call(window,q);
  const m=document.querySelector('meta[name=viewport]'),prima=m.content,r=cutoutFix(),durante=m.content;await new Promise(x=>setTimeout(x,300));const dopo=m.content;window.matchMedia=mm;return{r,prima,durante,dopo}});
ok(cf.r===true&&/viewport-fit=auto/.test(cf.durante)&&cf.dopo===cf.prima&&/viewport-fit=cover/.test(cf.dopo),'app installata senza zona sicura: viewport-fit auto e poi di nuovo cover '+JSON.stringify(cf));
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
