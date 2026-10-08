import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
// Logo «by YNOY CORP» in fondo alla schermata d'ingresso: c'è, l'immagine si carica, sta in basso, niente scorrimento a 320 e 390 px; il service worker la tiene per l'uso senza rete
const URL='http://localhost:8765/', bad=[];
const ok=(c,m)=>{if(!c)bad.push(m)};
ok(/'\.\/media\/ynoy\.png'/.test(readFileSync('sw.js','utf8')),'sw.js: media/ynoy.png manca in FILES');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h] of [[320,568],[390,844]]){
  const p=await b.newPage({viewport:{width:w,height:h}}),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);
  await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',attivo:true}};localStorage.jona_db_v2=JSON.stringify(d)});
  await p.reload();await p.waitForSelector('.wall h1');
  const an=await p.evaluate(()=>document.querySelector('.wall-by i').getAnimations().map(a=>a.animationName).sort().join());
  ok(an==='ynoyIn,ynoyShine',`${w}px: animazione d'entrata del logo assente (${an})`);
  await p.waitForTimeout(5600);
  ok(!(await p.evaluate(()=>document.querySelector('.wall-by i').getAnimations().length)),`${w}px: animazione ancora in corso dopo l'entrata`);
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
  ok(r.lbl==='By YNOY CORP'&&r.testo==='by',`${w}px: etichetta o testo sbagliati`);
  ok(!errs.length,`${w}px: errori ${errs}`);
  ok(!(await p.locator('.wall-brand').count()),`${w}px: vecchia firma ancora presente`);
  await p.close();
}
// già entrato: l'apertura resta fino alla fine dell'animazione, poi l'app; un tocco la salta (navigator.webdriver finto a false, altrimenti l'apertura è spenta nelle prove)
for(const salta of [false,true]){
  const p=await b.newPage({viewport:{width:390,height:844}}),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false}));
  await p.goto(URL);
  await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
  await p.reload();const t0=Date.now();
  await p.waitForSelector('.wall-by');
  const st=()=>p.evaluate(()=>({wall:!!document.querySelector('.wall .wall-by'),login:!!document.querySelector('.wall h1')}));
  let s=await st();ok(s.wall&&!s.login,`apertura assente da entrato (salta=${salta})`);
  if(salta){await p.mouse.click(195,400);await p.waitForTimeout(300);s=await st();ok(!s.wall,'un tocco non salta l\'apertura')}
  else{await p.waitForTimeout(4000);s=await st();ok(s.wall,`apertura finita troppo presto (${Date.now()-t0} ms)`);
    await p.waitForTimeout(1600);s=await st();ok(!s.wall&&!s.login,'dopo l\'apertura l\'app non si apre')}
  console.log('entrato',salta?'tocco':'attesa',JSON.stringify(s));
  ok(!errs.length,`apertura: errori ${errs}`);await p.close();
}
await b.close();
if(bad.length){console.log('FALLITA\n'+bad.join('\n'));process.exit(1)}
console.log('OK logo');
