import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// v62: schermata d'apertura: JONA arriva da davanti allo schermo (jonaIn), la firma se ne va dentro lo schermo (byOut); la schermata d'ingresso con i profili non cambia
const URL='http://localhost:8765/index.html';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const bad=[];const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad.push(m)};
const apri=async(w,entrato)=>{const c=await b.newContext({viewport:{width:w,height:740}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false}));
  await p.goto(URL);
  if(entrato)await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',stato:'attivo'}};localStorage.jona_db_v2=JSON.stringify(d);localStorage.jona_me=JSON.stringify('a')});
  await p.reload();await p.waitForSelector('.wall-by');return{p,c,errs}};
// stato a un istante preciso dell'animazione (animazioni ferme e portate a t ms: la prova non dipende dalla velocità del computer)
const stato=(p,t)=>p.evaluate(t=>{const l=document.querySelector('.splash .logo-full'),by=document.querySelector('.splash .wall-by');if(!l||!by)return null;
  for(const e of [l,by,...by.children])for(const a of e.getAnimations()){a.pause();a.currentTime=t}
  const sl=getComputedStyle(l),sb=getComputedStyle(by);const sc=x=>x==='none'?1:new DOMMatrix(x).a;
  return{anL:sl.animationName,anB:sb.animationName,sL:+sc(sl.transform).toFixed(3),oL:+(+sl.opacity).toFixed(3),sB:+sc(sb.transform).toFixed(3),oB:+(+sb.opacity).toFixed(3),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}},t);
for(const w of [320,390]){
  const {p,c,errs}=await apri(w,true);
  let s=await stato(p,0);ok(s&&s.anL==='jonaIn'&&s.anB==='byOut',`${w}px: animazioni jonaIn e byOut ${JSON.stringify(s)}`);
  ok(s&&s.sL>3&&s.oL<.1,`${w}px: all'inizio JONA è grande e trasparente (arriva da davanti) ${JSON.stringify(s)}`);
  s=await stato(p,300);ok(s&&s.sL>1.2&&s.sw<=s.cw,`${w}px: mentre JONA è grande niente scorrimento di lato ${JSON.stringify(s)}`);
  s=await stato(p,2800);ok(s&&s.sL===1&&s.oL===1,`${w}px: a 2,8 s JONA è al suo posto ${JSON.stringify(s)}`);
  ok(s&&s.sB===1&&s.oB>.7,`${w}px: a 2,8 s la firma si vede ${JSON.stringify(s)}`);
  s=await stato(p,3900);ok(s&&s.sB<1&&s.sB>.05&&s.oB<.8,`${w}px: a 3,9 s la firma si sta allontanando ${JSON.stringify(s)}`);
  s=await stato(p,4300);ok(s&&s.sB<=.06&&s.oB<.01&&s.oL===1,`${w}px: a 4,3 s la firma è sparita dentro lo schermo, JONA resta ${JSON.stringify(s)}`);
  await p.waitForTimeout(5000);ok(!(await p.locator('.splash').count())&&!(await p.locator('.wall h1').count()),`${w}px: poi si apre l'app`);
  ok(!errs.length,`${w}px: errori ${errs}`);await c.close();
}
// schermata d'ingresso (non entrato): JONA sale come prima, la firma resta
{const c=await b.newContext({viewport:{width:390,height:740}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);await p.evaluate(()=>{const d=JSON.parse(localStorage.jona_db_v2||'{}');d.staff={a:{id:'a',nome:'Prova',ruolo:'gm',attivo:true}};localStorage.jona_db_v2=JSON.stringify(d)});
  await p.reload();await p.waitForSelector('.wall h1');
  const s=await p.evaluate(()=>{const by=document.querySelector('.wall-by'),l=document.querySelector('.wall .logo-full');return{splash:!!document.querySelector('.splash'),anB:getComputedStyle(by).animationName,anL:getComputedStyle(l).animationName}});
  ok(!s.splash&&s.anB==='none'&&s.anL==='rise',`ingresso: JONA sale come prima, la firma non se ne va ${JSON.stringify(s)}`);ok(!errs.length,`ingresso: errori ${errs}`);await c.close()}
await b.close();
if(bad.length){console.log('FALLITA\n'+bad.join('\n'));process.exit(1)}
console.log('OK apertura v62');
