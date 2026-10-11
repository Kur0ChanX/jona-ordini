// D40: confronto della scossa dell'apertura (Attuale | A Ovvia | B Furba | C Geniale), fotogrammi per un video.
// Uso: node tools/colpo-d40.mjs <cartella>  (server locale su 8765)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out=process.argv[2];
const V={
 att:'',
 A:`@keyframes jShake{0%,100%{transform:none}20%{transform:translateY(4px)}48%{transform:translateY(-1px)}74%{transform:translateY(.4px)}}
  .intro .splash{animation:jShake .34s .55s cubic-bezier(.25,.6,.3,1) both}`,
 B:`@keyframes jShake{0%,100%{transform:none}16%{transform:scale(.985)}46%{transform:scale(1.004)}76%{transform:scale(.999)}}
  .intro .splash{animation:jShake .36s .55s cubic-bezier(.25,.6,.3,1) both}`,
 C:`@keyframes jShake{0%,100%{transform:none}18%{transform:translateY(3px) scale(.992)}48%{transform:translateY(-.6px) scale(1.002)}}
  .intro .splash{animation:jShake .32s .55s cubic-bezier(.25,.6,.3,1) both}
  .intro .splash::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(closest-side,rgba(0,0,0,0) 55%,rgba(0,0,0,.28));opacity:0;animation:jVig .45s .55s ease-out both}
  @keyframes jVig{0%{opacity:0}15%{opacity:1}100%{opacity:0}}`,
};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [k,css] of Object.entries(V)){
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5});
 await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
 const p=await c.newPage();
 await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>(ms===3800||ms===4100)?0:st(f,ms,...a)});
 await p.goto('http://localhost:8765/index.html');
 await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
 await p.reload();await p.waitForSelector('.splash .jhit');
 if(css)await p.evaluate(css=>{const s=document.createElement('style');s.textContent=css;document.head.append(s)},css);
 await p.waitForTimeout(200);
 let n=0;for(let t=0;t<=1700;t+=1000/60){await p.evaluate(t=>{for(const a of document.getAnimations()){a.pause();a.currentTime=t}},t);await p.screenshot({path:`${out}/${k}${String(n++).padStart(4,'0')}.png`})}
 await c.close()}
await b.close();
