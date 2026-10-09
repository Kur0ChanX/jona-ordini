import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>(ms===3800||ms===4100)?0:st(f,ms,...a)});
await p.goto('http://localhost:8765/index.html');
await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
const P=[0,.33,.66,1];
for(const v of ['a','b','c'])for(let k=0;k<4;k++){const q=P[k];
 await p.reload();await p.waitForSelector('.splash .jhit');await p.waitForTimeout(150);
 await p.evaluate(([v,q])=>{
  const T=v==='a'?3400+400*q:3390;
  for(const a of document.getAnimations()){a.pause();a.currentTime=T}
  if(v==='a')return;
  const fix=sel=>document.querySelectorAll(sel).forEach(e=>{for(const a of e.getAnimations()){try{a.commitStyles()}catch(_){}a.cancel()}});
  fix('.splash .jhit,.splash .wall-sub,.splash .wall-by span,.splash .wall-by em,.splash .yn,.splash .y0,.splash .ywr path');
  const op=(sel,o,s)=>document.querySelectorAll(sel).forEach(e=>{e.style.opacity=o;if(s!=null)e.style.transform=`scale(${s})`});
  if(v==='b'){
   op('.splash .jhit,.splash .wall-sub',1-q,1-.07*q);
   op('.splash .wall-by span',1-Math.min(1,q*1.6));
   document.querySelector('.splash .y0').style.opacity=0;
   const ps=[...document.querySelectorAll('.splash .ywr path')].reverse();
   ps.forEach((e,j)=>{const o=parseFloat(getComputedStyle(e).getPropertyValue('--o'))||100;const f=Math.max(0,Math.min(1,q*19*1.05-j));e.style.strokeDashoffset=o*f});
  }else{
   const j=Math.max(0,Math.min(1,q*2)),s=Math.max(0,Math.min(1,(q-.45)*1.9));
   op('.splash .jhit,.splash .wall-sub',1-j,1-.07*j);
   op('.splash .wall-by span',1-s);op('.splash .yn',1-s,1+.03*s);
  }
 },[v,q]);
 await p.screenshot({path:`${out}/${v}${k}.png`});
}
await b.close();
