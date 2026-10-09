import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out=process.argv[2];
const V={
 A:{css:`.jpa{position:absolute;bottom:-11%;height:12%;width:60%;border-radius:50%;background:radial-gradient(closest-side,rgba(228,220,211,.22),rgba(228,220,211,.08) 60%,rgba(228,220,211,0));opacity:0;pointer-events:none;animation:pa 1.2s .55s cubic-bezier(.15,.7,.3,1) forwards}
 .jpa.l{right:45%;transform-origin:100% 50%}
 .jpa.r{left:45%;transform-origin:0 50%}
 .jpa.m{left:20%;width:60%;height:18%;bottom:-13%;animation-duration:1.5s}
 @keyframes pa{0%{opacity:0;transform:scale(.15,.5)}20%{opacity:1}100%{opacity:0;transform:translateY(-10%) scale(1.3,1.25)}}`,
   html:'<i class="jpa l"></i><i class="jpa r"></i><i class="jpa m"></i>'},
 B:{css:`.jpb{position:absolute;left:50%;bottom:-6%;width:var(--s);height:var(--s);border-radius:50%;background:#EDE6DF;opacity:0;pointer-events:none;animation:pb var(--t) .55s cubic-bezier(.1,.75,.3,1) forwards;animation-delay:var(--d)}
 @keyframes pb{0%{opacity:0;transform:translate(0,0)}10%{opacity:var(--o)}60%{opacity:calc(var(--o)*.7)}100%{opacity:0;transform:translate(var(--x),var(--y))}}`,
   html:Array.from({length:34},(_,i)=>{const sg=i%2?1:-1,r=k=>((Math.sin(i*k)*10000)%1+1)%1;const x=sg*(40+r(12.9)*150),y=-(4+r(78.2)*26),s=(1+r(3.3)*2).toFixed(1),o=(.35+r(5.1)*.55).toFixed(2),t=(.7+r(9.7)*.6).toFixed(2),d=(.55+r(2.2)*.08).toFixed(2);return `<b class="jpb" style="--x:${x.toFixed(0)}px;--y:${y.toFixed(0)}px;--s:${s}px;--o:${o};--t:${t}s;--d:${d}s;margin-left:${(sg*r(7.7)*30).toFixed(0)}px"></b>`}).join('')},
 C:{css:`.jpc{position:absolute;left:-10%;right:-10%;bottom:-9%;height:2px;background:linear-gradient(90deg,rgba(255,248,238,0),rgba(255,248,238,.85) 50%,rgba(255,248,238,0));opacity:0;pointer-events:none;animation:pc .9s .55s cubic-bezier(.15,.7,.3,1) forwards}
 .jpc+.jpc{height:26px;bottom:calc(-9% - 12px);background:radial-gradient(closest-side,rgba(255,240,220,.22),rgba(255,240,220,0));animation-duration:1.1s}
 @keyframes pc{0%{opacity:0;transform:scaleX(.1)}15%{opacity:1}100%{opacity:0;transform:scaleX(1.2)}}`,
   html:'<i class="jpc"></i><i class="jpc"></i>'},
};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [k,v] of Object.entries(V)){
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>(ms===3800||ms===4100)?0:st(f,ms,...a)});
await p.goto('http://localhost:8765/index.html');
await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
await p.reload();await p.waitForSelector('.splash .jhit');
await p.evaluate(v=>{document.querySelectorAll('.splash .jfl,.splash .jd').forEach(e=>e.remove());const s=document.createElement('style');s.textContent=v.css.replace(/(^|\})\s*\./g,'$1 .intro .splash .');document.head.append(s);document.querySelector('.splash .jhit').insertAdjacentHTML('afterbegin',v.html)},v);
await p.waitForTimeout(200);
let n=0;for(let t=0;t<=1900;t+=1000/30){await p.evaluate(t=>{for(const a of document.getAnimations()){a.pause();a.currentTime=t}},t);await p.screenshot({path:`${out}/${k}${String(n++).padStart(4,'0')}.png`})}
await c.close()}
await b.close();
