// v86 (D37): app più leggera sui telefoni economici.
// 1) poca memoria o pochi processori → classe «lite»: barre in alto e in basso senza sfocatura (sfondo pieno);
// 2) controllo ogni minuto (deadlineTick) senza ridisegno con l'app in secondo piano.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const apri=async(mem,cpu)=>{const ctx=await b.newContext({viewport:{width:390,height:800}});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await ctx.addInitScript(([m,c])=>{Object.defineProperty(Navigator.prototype,'deviceMemory',{get:()=>m,configurable:true});Object.defineProperty(Navigator.prototype,'hardwareConcurrency',{get:()=>c,configurable:true})},[mem,cpu]);
  const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.goto('http://localhost:8765/#demo');await pg.waitForTimeout(1200);
  await pg.click('[data-a="demoGo"]');await pg.waitForTimeout(1500);return pg};
const blur=pg=>pg.evaluate(()=>['.top','.nav'].map(s=>{const e=document.querySelector(s);if(!e)return'manca';const c=getComputedStyle(e);return(c.backdropFilter||c.webkitBackdropFilter||'none')+'|'+c.backgroundColor}));
// telefono economico (2 GB) e telefono con 4 processori
for(const [m,c,n] of [[2,8,'2 GB di memoria'],[undefined,4,'4 processori']]){
  const pg=await apri(m,c);
  ok(await pg.evaluate(()=>document.documentElement.classList.contains('lite')),n+': classe «lite»');
  const x=await blur(pg);
  ok(x.every(v=>v.startsWith('none|')),n+': barre senza sfocatura '+x.join(' · '));
  ok(x.every(v=>!/rgba|\/ 0\./.test(v.split('|')[1])),n+': sfondo delle barre pieno '+x.join(' · '));
  ok(pg.errs.length===0,n+': nessun errore '+pg.errs.join(' | '));
  await pg.context().close();
}
// telefono potente: sfocatura come prima
const pg=await apri(8,8);
ok(await pg.evaluate(()=>!document.documentElement.classList.contains('lite')),'8 GB e 8 processori: niente «lite»');
ok((await blur(pg)).every(v=>v.startsWith('blur(')),'telefono potente: sfocatura come prima '+(await blur(pg)).join(' · '));
// deadlineTick: in secondo piano niente render(), in primo piano sì (scheda Invii, gestore)
await pg.click('nav [data-a="tab"][data-v="invii"]');await pg.waitForTimeout(500);
const conta=hidden=>pg.evaluate(async h=>{Object.defineProperty(document,'hidden',{get:()=>h,configurable:true});
  const r0=window.render;let n=0;window.render=function(){n++;return r0.apply(this,arguments)};
  try{await deadlineTick()}finally{window.render=r0;delete document.hidden}return n},hidden);
ok(await pg.evaluate(()=>S.tab==='invii'&&isGM(meU())),'demo: chef sulla scheda Invii');
ok(await conta(true)===0,'app in secondo piano: deadlineTick non ridisegna');
ok(await conta(false)>=1,'app in primo piano: deadlineTick ridisegna Invii');
ok(pg.errs.length===0,'nessun errore '+pg.errs.join(' | '));
await b.close();
