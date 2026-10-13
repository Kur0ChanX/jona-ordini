// v101 (strada 3 «Geniale», #119-#120): il Bar sta in moduli/bar.js e le novità vecchie in data/news.json, scaricati solo all'apertura.
// Controlla: (1) all'avvio non sono caricati; (2) con il service worker si aprono anche senza rete; (3) senza file l'app avvisa e poi riprova.
// Gira su PC, telefono e tablet Android, Mac, iPhone e iPad (WebKit solo su GitHub: in locale SALTATA).
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync, readFileSync } from 'fs';
import { createServer } from 'http';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const DEV=[['chromium','Desktop Chrome'],['chromium','Pixel 7'],['chromium','Galaxy Tab S4'],['webkit','Desktop Safari'],['webkit','iPhone 15'],['webkit','iPad (gen 7)']];
const URL0='http://localhost:8765/index.html';
// Senza rete «vera» (#121): ctx.setOffline su WebKit di Playwright blocca anche il service worker («Load failed» con il file nella cache),
// mentre su iPhone vero il service worker risponde dalla cache. Qui la prova accende un suo server e lo spegne: la rete manca davvero, su tutti i dispositivi.
const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const MIME={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.css':'text/css'};
function server(){const socks=new Set();const sv=createServer((q,r)=>{let f=join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname));if(f.endsWith('/'))f+='index.html';
  if(!f.startsWith(ROOT)||!existsSync(f)){r.writeHead(404);r.end();return}
  try{const b=readFileSync(f);r.writeHead(200,{'content-type':MIME[extname(f)]||'application/octet-stream','cache-control':'no-store'});r.end(b)}catch(e){r.writeHead(404);r.end()}});
  sv.on('connection',c=>{socks.add(c);c.on('close',()=>socks.delete(c))});
  return new Promise(ok=>sv.listen(0,'127.0.0.1',()=>ok({url:'http://127.0.0.1:'+sv.address().port+'/index.html',spegni:()=>new Promise(z=>{sv.close(()=>z());for(const c of socks)c.destroy()})})))}
async function entra(pg,u=URL0){
  await pg.goto(u);
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
}
const chiudi=pg=>pg.evaluate(()=>{while(sheets.length)closeSheet(true)});
for(const [br,nome] of DEV){
  if(br==='webkit'&&!WK){if(process.env.CI)ok(false,nome+': WebKit non installato su GitHub');else console.log('SALTATA '+nome+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=await (br==='webkit'?webkit.launch():chromium.launch({executablePath:'/opt/pw-browsers/chromium'}));
  const {defaultBrowserType,...d}=devices[nome];
  // 1-2: con il service worker, poi senza rete
  {const ctx=await b.newContext({...d,deviceScaleFactor:1});
    await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
    const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    const sv=await server();
    await entra(pg,sv.url);
    ok(await pg.evaluate(()=>typeof brApri==='undefined'&&typeof vnApri==='undefined'&&typeof rcApri==='undefined'&&typeof BR_CAT==='undefined'&&!NEWS_OLD&&NEWS.length<=20),nome+': all\'avvio Bar, Cantina, Ricette e novità vecchie non caricati');
    const pronto=await pg.evaluate(async()=>{if(!('serviceWorker' in navigator))return 'no sw';await navigator.serviceWorker.ready;
      for(let i=0;i<100;i++){const a=await caches.match('moduli/bar.js'),n=await caches.match('data/news.json'),v=await caches.match('moduli/cantina.js'),rc=await caches.match('moduli/ricette.js');if(a&&n&&v&&rc)return 'ok';await new Promise(r=>setTimeout(r,100))}return 'file non in cache'});
    ok(pronto==='ok',nome+': moduli/bar.js, moduli/cantina.js, moduli/ricette.js e data/news.json nella cache del service worker ('+pronto+')');
    await pg.reload();await pg.waitForSelector('.testbar');
    ok(await pg.evaluate(()=>!!navigator.serviceWorker.controller),nome+': pagina controllata dal service worker');
    await sv.spegni();
    // E48: su GitHub si vedono solo le righe FAIL → la diagnosi sta dentro la riga (tempo, script, avvisi, prova diretta di fetch dalla cache)
    const t0=Date.now();await pg.evaluate(()=>brOpen());
    const bar=await pg.waitForSelector('.sheet [data-a="brV"]',{timeout:20000}).then(()=>1,()=>0);
    const diag=bar?'':await pg.evaluate(async()=>{const r=[];r.push('script:'+document.querySelectorAll('script[src="moduli/bar.js"]').length,'brApri:'+typeof brApri,'avvisi:'+[...document.querySelectorAll('#toasts .toast')].map(x=>x.textContent).join('/'),'onLine:'+navigator.onLine,'ctrl:'+!!navigator.serviceWorker.controller);
      try{const c=await caches.match('moduli/bar.js');r.push('cache:'+(c?c.status:'no'))}catch(e){r.push('cache err:'+e.message)}
      try{const x=await Promise.race([fetch('moduli/bar.js').then(z=>'fetch:'+z.status),new Promise(z=>setTimeout(()=>z('fetch: ferma 5 s'),5000))]);r.push(x)}catch(e){r.push('fetch err:'+e.message)}
      return r.join(' · ')});
    ok(bar,nome+': senza rete il Bar si apre ('+(Date.now()-t0)+' ms) '+diag);
    ok(await pg.evaluate(()=>typeof brApri==='function'&&BR_CAT.length>5),nome+': modulo del Bar caricato');
    await chiudi(pg);
    await pg.evaluate(()=>vnOpen());
    ok(await pg.waitForSelector('.sheet [data-a="vnV"]',{timeout:20000}).then(()=>1,()=>0),nome+': senza rete la Cantina si apre');
    ok(await pg.evaluate(()=>typeof vnApri==='function'&&typeof vnForm==='function'),nome+': modulo della Cantina caricato');
    await chiudi(pg);
    await pg.evaluate(()=>rcOpen());
    ok(await pg.waitForSelector('.sheet [data-a="rcNew"]',{timeout:20000}).then(()=>1,()=>0),nome+': senza rete le Ricette si aprono');
    ok(await pg.evaluate(()=>typeof rcApri==='function'&&typeof rcForm==='function'),nome+': modulo delle Ricette caricato');
    await chiudi(pg);
    await pg.evaluate(()=>newsSheet());
    const nv=await pg.waitForFunction(()=>NEWS_OLD&&document.querySelectorAll('.sheet .news-v').length>20&&!document.querySelector('.sheet .news-old'),null,{timeout:20000}).then(()=>1,()=>0);
    ok(nv,nome+': senza rete le novità vecchie si vedono tutte ('+await pg.evaluate(()=>document.querySelectorAll('.sheet .news-v').length)+' versioni)');
    ok(await pg.evaluate(()=>document.querySelector('.sheet .news-v .news-vn').textContent==='Beta v'+APP_VER),nome+': la più nuova resta in cima');
    ok(!errs.length,nome+': nessun errore '+errs.join(' | '));
    await ctx.close()}
  // 3: senza service worker e file che non arrivano → avviso, poi riprova e va
  {const ctx=await b.newContext({...d,deviceScaleFactor:1,serviceWorkers:'block'});
    await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
    let blocca=true;
    await ctx.route('**/moduli/bar.js',r=>blocca?r.abort():r.continue());
    await ctx.route('**/data/news.json',r=>blocca?r.abort():r.continue());
    await ctx.route('**/moduli/cantina.js',r=>blocca?r.abort():r.continue());
    await ctx.route('**/moduli/ricette.js',r=>blocca?r.abort():r.continue());
    const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    await entra(pg);
    await pg.evaluate(()=>brOpen());
    const t=await pg.waitForFunction(()=>[...document.querySelectorAll('#toasts .toast')].some(x=>/Bar non si apre senza rete/.test(x.textContent)),null,{timeout:8000}).then(()=>1,()=>0);
    ok(t,nome+': file del Bar non arrivato → avviso «Il Bar non si apre senza rete»');
    ok(await pg.evaluate(()=>!document.querySelector('.sheet')&&!document.querySelector('script[src="moduli/bar.js"]')),nome+': niente scheda vuota né script rotto rimasto');
    await pg.evaluate(()=>vnOpen());
    ok(await pg.waitForFunction(()=>[...document.querySelectorAll('#toasts .toast')].some(x=>/Cantina non si apre senza rete/.test(x.textContent)),null,{timeout:8000}).then(()=>1,()=>0),nome+': file della Cantina non arrivato → avviso «La Cantina non si apre senza rete»');
    ok(await pg.evaluate(()=>!document.querySelector('.sheet')&&!document.querySelector('script[src="moduli/cantina.js"]')),nome+': niente scheda vuota della Cantina');
    await pg.evaluate(()=>rcOpen());
    ok(await pg.waitForFunction(()=>[...document.querySelectorAll('#toasts .toast')].some(x=>/Ricette non si aprono senza rete/.test(x.textContent)),null,{timeout:8000}).then(()=>1,()=>0),nome+': file delle Ricette non arrivato → avviso «Le Ricette non si aprono senza rete»');
    ok(await pg.evaluate(()=>!document.querySelector('.sheet')&&!document.querySelector('script[src="moduli/ricette.js"]')),nome+': niente scheda vuota delle Ricette');
    await pg.evaluate(()=>newsSheet());
    const nn=await pg.waitForFunction(()=>/si vedono con la rete/.test((document.querySelector('.sheet .news-old')||{}).textContent||''),null,{timeout:8000}).then(()=>1,()=>0);
    ok(nn,nome+': novità vecchie non arrivate → «Le versioni più vecchie si vedono con la rete»');
    ok(await pg.evaluate(()=>document.querySelectorAll('.sheet .news-v').length>=5),nome+': le novità recenti si vedono lo stesso');
    await chiudi(pg);blocca=false;
    await pg.evaluate(()=>brOpen());
    ok(await pg.waitForSelector('.sheet [data-a="brV"]',{timeout:8000}).then(()=>1,()=>0),nome+': con la rete tornata il Bar si apre');
    await chiudi(pg);await pg.evaluate(()=>vnOpen());
    ok(await pg.waitForSelector('.sheet [data-a="vnV"]',{timeout:8000}).then(()=>1,()=>0),nome+': con la rete tornata la Cantina si apre');
    await chiudi(pg);await pg.evaluate(()=>rcOpen());
    ok(await pg.waitForSelector('.sheet [data-a="rcNew"]',{timeout:8000}).then(()=>1,()=>0),nome+': con la rete tornata le Ricette si aprono');
    await chiudi(pg);await pg.evaluate(()=>brOpen());await pg.waitForSelector('.sheet [data-a="brV"]');
    ok(await pg.evaluate(()=>document.querySelectorAll('script[src="moduli/bar.js"]').length===1),nome+': modulo caricato una volta sola');
    ok(!errs.length,nome+': nessun errore '+errs.join(' | '));
    await ctx.close()}
  await b.close();
}
