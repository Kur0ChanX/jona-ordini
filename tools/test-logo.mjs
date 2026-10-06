import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
// Logo «by YNOY&CORP» in fondo alla schermata d'ingresso: c'è, l'immagine si carica, sta in basso, niente scorrimento a 320 e 390 px; il service worker la tiene per l'uso senza rete
const URL='http://localhost:8765/', bad=[];
const ok=(c,m)=>{if(!c)bad.push(m)};
ok(/'\.\/media\/ynoy\.png'/.test(readFileSync('sw.js','utf8')),'sw.js: media/ynoy.png manca in FILES');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h] of [[320,568],[390,844]]){
  const p=await b.newPage({viewport:{width:w,height:h}}),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);
  await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',attivo:true}};localStorage.jona_db_v2=JSON.stringify(d)});
  await p.reload();await p.waitForSelector('.wall h1');await p.waitForTimeout(1300);
  const r=await p.evaluate(async()=>{const e=document.querySelector('.wall-by'),i=e&&e.querySelector('i');if(!e)return null;
    const q=await fetch('media/ynoy.png');const x=e.getBoundingClientRect(),c=document.querySelector('.wall-card').getBoundingClientRect();
    return {h1:document.querySelector('.wall h1').textContent,img:q.ok&&q.headers.get('content-type'),mask:getComputedStyle(i).webkitMaskImage||getComputedStyle(i).maskImage,
      iw:i.getBoundingClientRect().width,op:+getComputedStyle(e).opacity,sotto:x.top>=c.bottom,fondo:Math.round(document.documentElement.scrollHeight-x.bottom),
      sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,lbl:e.getAttribute('aria-label'),testo:e.textContent.trim()}});
  console.log(w,JSON.stringify(r));
  ok(r,`${w}px: .wall-by manca`);if(!r)continue;
  ok(r.h1==='Accedi',`${w}px: non è la schermata d'ingresso`);
  ok(r.img==='image/png',`${w}px: media/ynoy.png non si carica (${r.img})`);
  ok(/ynoy\.png/.test(r.mask),`${w}px: maschera senza logo`);
  ok(r.iw>=120,`${w}px: logo troppo piccolo (${r.iw})`);
  ok(r.op>0.5,`${w}px: logo invisibile (${r.op})`);
  ok(r.sotto,`${w}px: logo non sotto il riquadro Accedi`);
  ok(r.fondo<=40,`${w}px: logo non in fondo (${r.fondo} px dal fondo)`);
  ok(r.sw===w,`${w}px: scorrimento orizzontale (${r.sw})`);
  if(w===390)ok(r.sh===h,`390px: la pagina scorre in verticale (${r.sh})`);
  ok(r.lbl==='By YNOY&CORP'&&r.testo==='by',`${w}px: etichetta o testo sbagliati`);
  ok(!errs.length,`${w}px: errori ${errs}`);
  ok(!(await p.locator('.wall-brand').count()),`${w}px: vecchia firma ancora presente`);
  await p.close();
}
await b.close();
if(bad.length){console.log('FALLITA\n'+bad.join('\n'));process.exit(1)}
console.log('OK logo');
