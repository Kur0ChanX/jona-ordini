// D37: misura peso e velocità dell'app come su un telefono economico (CPU 4 volte più lenta, rete 4G lenta).
// Uso: `node tools/misura-velocita.mjs` (server proprio su :8766 con file compressi) (scrive i numeri; esce con 1 se supera i tetti).
// Tetti in TETTI: se uno viene superato, prima si capisce cosa è cresciuto, poi si alleggerisce o si alza il tetto con un motivo.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { createServer } from 'http';
import { extname, join, normalize } from 'path';
// server con file compressi, come Cloudflare (python http.server li manda interi)
const ROOT=new URL('..',import.meta.url).pathname;
const TIPI={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
const srv=createServer((q,r)=>{let f=normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^(\.\.[\/\\])+/,'');if(f.endsWith('/'))f+='index.html';
  let body;try{body=readFileSync(join(ROOT,f))}catch(e){r.writeHead(404);return r.end()}
  const t=TIPI[extname(f)]||'application/octet-stream';const h={'content-type':t};
  if(/text|javascript|json|svg|manifest/.test(t)){body=gzipSync(body);h['content-encoding']='gzip'}
  r.writeHead(200,h);r.end(body)}).listen(8766);
const TETTI={htmlKB:1000,gzipKB:340,avvioMs:4500,lungoMs:1500,memMB:60};
const out=[];let ko=0;
const riga=(nome,val,tetto,u)=>{const sup=tetto!=null&&val>tetto;if(sup)ko++;out.push(`${sup?'OLTRE':'ok   '} ${nome}: ${val}${u}${tetto!=null?' (tetto '+tetto+u+')':''}`)};
const html=readFileSync(new URL('../index.html',import.meta.url));
riga('index.html',Math.round(html.length/1024),TETTI.htmlKB,' KB');
riga('index.html compresso (gzip)',Math.round(gzipSync(html,{level:9}).length/1024),TETTI.gzipKB,' KB');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const misura=async(nome,url,dopo)=>{
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const pg=await ctx.newPage();
  const cdp=await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8});
  let byte=0;cdp.on('Network.loadingFinished',e=>{byte+=e.encodedDataLength});
  await pg.addInitScript(()=>{window.__lunghi=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lunghi=Math.max(window.__lunghi,e.duration)}).observe({type:'longtask',buffered:true})}catch(e){}});
  const t0=Date.now();
  await pg.goto(url,{waitUntil:'load'});
  await pg.waitForSelector(dopo,{timeout:60000});
  const avvio=Date.now()-t0;
  await pg.waitForTimeout(1500);
  const lungo=Math.round(await pg.evaluate(()=>window.__lunghi));
  const mem=Math.round((await cdp.send('Runtime.getHeapUsage')).usedSize/1048576);
  riga(nome+' · scaricato',Math.round(byte/1024),null,' KB');
  riga(nome+' · prima schermata',avvio,TETTI.avvioMs,' ms');
  riga(nome+' · blocco più lungo',lungo,TETTI.lungoMs,' ms');
  riga(nome+' · memoria JS',mem,TETTI.memMB,' MB');
  await ctx.close();
};
await misura('primo avvio','http://localhost:8766/','#app *');
await misura('demo','http://localhost:8766/#demo','[data-a="demoGo"]');
await b.close();srv.close();
console.log(out.join('\n'));
console.log(ko?`${ko} valori oltre il tetto`:'Tutto entro i tetti');
process.exitCode=ko?1:0;
