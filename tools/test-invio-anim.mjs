// Animazione «Inviato allo chef» (v15), modalità locale. Il Chromium di Playwright non legge l'H.264:
// la prova serve una copia WebM dello stesso video (creata con ffmpeg in /tmp) al posto di media/invio-chef.mp4.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
const WEBM='/tmp/invio-chef-test.webm',WEBMF='/tmp/invio-fornitore-test.webm';
execSync(`ffmpeg -v error -y -i media/invio-chef.mp4 -c:v libvpx-vp9 -b:v 0 -crf 32 -an ${WEBM}`);
execSync(`ffmpeg -v error -y -i media/invio-fornitore.mp4 -c:v libvpx-vp9 -b:v 0 -crf 32 -an ${WEBMF}`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
async function run(opts={}){
  const ctx=await b.newContext({viewport:{width:400,height:800},serviceWorkers:'block',reducedMotion:opts.reduced?'reduce':'no-preference'});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await ctx.route('**/media/invio-chef.mp4',r=>opts.broken?r.fulfill({status:404,body:''}):r.fulfill({contentType:'video/webm',body:readFileSync(WEBM)}));
  await ctx.route('**/media/invio-fornitore.mp4',r=>opts.broken?r.fulfill({status:404,body:''}):r.fulfill({contentType:'video/webm',body:readFileSync(WEBMF)}));
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
  await pg.click('[data-a="viewAs"][data-v="staff"]');await pg.waitForTimeout(300);
  await pg.evaluate(()=>{S.cart=[{pid:'demo01',qta:1}];saveCart()});
  await pg.click('.cartbar [data-a="tab"]');await pg.waitForTimeout(200);
  return {ctx,pg,errs};
}
/* 1. animazione completa */
{const {ctx,pg,errs}=await run();
  ok((await pg.locator('[data-a="curg"]').innerText()).trim()==='È urgente','button says «È urgente» without question mark');
  const t0=Date.now();await pg.click('[data-a="csend"]');
  await pg.waitForSelector('.snd-anim.in',{timeout:4000}).catch(()=>{});
  ok(await pg.locator('.snd-anim.in canvas').count()===1,'overlay with canvas appears');
  ok(await pg.evaluate(()=>Object.values(D().richieste).length===1),'request already sent while the animation plays');
  await pg.waitForTimeout(1600);
  // pixel al centro del canvas (mani/menù) visibili, angolo in alto a sinistra trasparente
  const px=await pg.evaluate(()=>{const c=document.querySelector('.snd-anim canvas');const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const x=o.getContext('2d');x.drawImage(c,0,0);
    const d=x.getImageData(0,0,o.width,o.height).data;let solid=0,clear=0;for(let i=3;i<d.length;i+=4*7){if(d[i]>240)solid++;else if(d[i]<8)clear++}const n=Math.ceil(d.length/28);
    return{corner:d[3],solid:solid/n,clear:clear/n}});
  ok(px.corner<10,'canvas corner is transparent (alpha '+px.corner+')');
  ok(px.solid>0.08&&px.clear>0.3,'hands and menu opaque, background transparent ('+Math.round(px.solid*100)+'% / '+Math.round(px.clear*100)+'%)');
  await pg.screenshot({path:'/tmp/invio-anim-mid.png'});
  await pg.waitForSelector('.snd-cap.in',{timeout:6000}).catch(()=>{});
  ok(await pg.locator('.snd-cap.in').count()===1,'caption «Inviato allo chef» appears near the end');
  await pg.screenshot({path:'/tmp/invio-anim-end.png'});
  await pg.waitForSelector('.sheet .done',{timeout:8000}).catch(()=>{});
  const dt=Date.now()-t0;
  ok(await pg.locator('.snd-anim').count()===0&&await pg.locator('.sheet .done').count()===1,'then the usual «Inviato allo chef» sheet ('+dt+' ms)');
  ok(dt<8500,'whole animation under 8.5 s');
  // dark theme + tap to skip
  await pg.click('.sheet [data-a="closeSheet"].btn');await pg.waitForTimeout(300);
  await pg.evaluate(()=>{localStorage.setItem('jona_theme','"dark"');applyTheme();S.cart=[{pid:'demo07',qta:2}];saveCart();S.tab='carrello';render()});await pg.waitForTimeout(200);
  await pg.click('[data-a="csend"]');await pg.waitForSelector('.snd-anim.in',{timeout:4000}).catch(()=>{});
  await pg.waitForTimeout(900);await pg.screenshot({path:'/tmp/invio-anim-dark.png'});
  const t1=Date.now();await pg.click('.snd-anim');await pg.waitForSelector('.sheet .done',{timeout:3000}).catch(()=>{});
  ok(await pg.locator('.sheet .done').count()===1&&Date.now()-t1<1500,'a tap skips the animation');
  ok(errs.length===0,'no page errors '+errs.join(' | '));
  await ctx.close();}
/* 1b. animazione del fornitore (markSent) */
{const {ctx,pg,errs}=await run();
  const p=pg.evaluate(()=>sendAnim('forn','Inviato a Prova').then(()=>1));
  await pg.waitForSelector('.snd-anim.in',{timeout:4000}).catch(()=>{});
  ok(await pg.locator('.snd-anim.in canvas').count()===1,'supplier animation appears');
  await pg.waitForTimeout(1200);await pg.screenshot({path:'/tmp/invio-forn-mid.png'});
  await pg.waitForSelector('.snd-cap.in',{timeout:6000}).catch(()=>{});
  ok((await pg.locator('.snd-cap.in').innerText().catch(()=>'')).includes('Inviato a Prova'),'supplier caption «Inviato a Prova»');
  ok(await Promise.race([p,new Promise(r=>setTimeout(()=>r(0),9000))])===1,'supplier animation ends');
  ok(errs.length===0,'no page errors (supplier) '+errs.join(' | '));await ctx.close();}
/* 2. movimento ridotto: niente animazione */
{const {ctx,pg,errs}=await run({reduced:true});
  await pg.click('[data-a="csend"]');await pg.waitForTimeout(500);
  ok(await pg.locator('.snd-anim').count()===0&&await pg.locator('.sheet .done').count()===1,'reduced motion: sheet right away, no overlay');
  ok(errs.length===0,'no page errors (reduced motion)');await ctx.close();}
/* 3. video che non arriva: si salta */
{const {ctx,pg,errs}=await run({broken:true});
  await pg.click('[data-a="csend"]');await pg.waitForTimeout(800);
  ok(await pg.locator('.snd-anim').count()===0&&await pg.locator('.sheet .done').count()===1,'missing video: sheet right away');
  ok(errs.length===0,'no page errors (missing video)');await ctx.close();}
await b.close();
