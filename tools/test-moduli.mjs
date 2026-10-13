// v101 (strada 3 «Geniale», #119-#120): il Bar sta in moduli/bar.js e le novità vecchie in data/news.json, scaricati solo all'apertura.
// Controlla: (1) all'avvio non sono caricati; (2) con il service worker si aprono anche senza rete; (3) senza file l'app avvisa e poi riprova.
// Gira su PC, telefono e tablet Android, Mac, iPhone e iPad (WebKit solo su GitHub: in locale SALTATA).
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const DEV=[['chromium','Desktop Chrome'],['chromium','Pixel 7'],['chromium','Galaxy Tab S4'],['webkit','Desktop Safari'],['webkit','iPhone 15'],['webkit','iPad (gen 7)']];
const URL0='http://localhost:8765/index.html';
async function entra(pg){
  await pg.goto(URL0);
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
    await entra(pg);
    ok(await pg.evaluate(()=>typeof brApri==='undefined'&&typeof BR_CAT==='undefined'&&!NEWS_OLD&&NEWS.length<=20),nome+': all\'avvio Bar e novità vecchie non caricati');
    const pronto=await pg.evaluate(async()=>{if(!('serviceWorker' in navigator))return 'no sw';await navigator.serviceWorker.ready;
      for(let i=0;i<100;i++){const a=await caches.match('moduli/bar.js'),n=await caches.match('data/news.json');if(a&&n)return 'ok';await new Promise(r=>setTimeout(r,100))}return 'file non in cache'});
    ok(pronto==='ok',nome+': moduli/bar.js e data/news.json nella cache del service worker ('+pronto+')');
    await pg.reload();await pg.waitForSelector('.testbar');
    ok(await pg.evaluate(()=>!!navigator.serviceWorker.controller),nome+': pagina controllata dal service worker');
    await ctx.setOffline(true);
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
    await pg.evaluate(()=>newsSheet());
    const nv=await pg.waitForFunction(()=>NEWS_OLD&&document.querySelectorAll('.sheet .news-v').length>20&&!document.querySelector('.sheet .news-old'),null,{timeout:20000}).then(()=>1,()=>0);
    ok(nv,nome+': senza rete le novità vecchie si vedono tutte ('+await pg.evaluate(()=>document.querySelectorAll('.sheet .news-v').length)+' versioni)');
    ok(await pg.evaluate(()=>document.querySelector('.sheet .news-v .news-vn').textContent==='Beta v'+APP_VER),nome+': la più nuova resta in cima');
    await ctx.setOffline(false);
    ok(!errs.length,nome+': nessun errore '+errs.join(' | '));
    await ctx.close()}
  // 3: senza service worker e file che non arrivano → avviso, poi riprova e va
  {const ctx=await b.newContext({...d,deviceScaleFactor:1,serviceWorkers:'block'});
    await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
    let blocca=true;
    await ctx.route('**/moduli/bar.js',r=>blocca?r.abort():r.continue());
    await ctx.route('**/data/news.json',r=>blocca?r.abort():r.continue());
    const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    await entra(pg);
    await pg.evaluate(()=>brOpen());
    const t=await pg.waitForFunction(()=>[...document.querySelectorAll('#toasts .toast')].some(x=>/Bar non si apre senza rete/.test(x.textContent)),null,{timeout:8000}).then(()=>1,()=>0);
    ok(t,nome+': file del Bar non arrivato → avviso «Il Bar non si apre senza rete»');
    ok(await pg.evaluate(()=>!document.querySelector('.sheet')&&!document.querySelector('script[src="moduli/bar.js"]')),nome+': niente scheda vuota né script rotto rimasto');
    await pg.evaluate(()=>newsSheet());
    const nn=await pg.waitForFunction(()=>/si vedono con la rete/.test((document.querySelector('.sheet .news-old')||{}).textContent||''),null,{timeout:8000}).then(()=>1,()=>0);
    ok(nn,nome+': novità vecchie non arrivate → «Le versioni più vecchie si vedono con la rete»');
    ok(await pg.evaluate(()=>document.querySelectorAll('.sheet .news-v').length>=5),nome+': le novità recenti si vedono lo stesso');
    await chiudi(pg);blocca=false;
    await pg.evaluate(()=>brOpen());
    ok(await pg.waitForSelector('.sheet [data-a="brV"]',{timeout:8000}).then(()=>1,()=>0),nome+': con la rete tornata il Bar si apre');
    await chiudi(pg);await pg.evaluate(()=>brOpen());await pg.waitForSelector('.sheet [data-a="brV"]');
    ok(await pg.evaluate(()=>document.querySelectorAll('script[src="moduli/bar.js"]').length===1),nome+': modulo caricato una volta sola');
    ok(!errs.length,nome+': nessun errore '+errs.join(' | '));
    await ctx.close()}
  await b.close();
}
