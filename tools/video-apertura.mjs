import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const p=await c.newPage();
await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>(ms===4400||ms===4700)?0:st(f,ms,...a)});
await p.goto('http://localhost:8765/index.html');
await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
await p.reload();await p.waitForSelector('.splash .wall-by');await p.waitForTimeout(300);
let n=0;for(let t=0;t<=4700;t+=1000/30){await p.evaluate(t=>{for(const a of document.getAnimations()){a.pause();a.currentTime=t}},t);await p.screenshot({path:`${out}/f${String(n++).padStart(4,'0')}.png`})}
await b.close();console.log(n);
