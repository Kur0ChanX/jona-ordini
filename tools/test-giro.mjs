import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// Giro di ogni scheda per Sviluppatore, Admin Chef e Staff, a 320 e 390 px, tema chiaro e scuro: errori, scorrimento orizzontale, elementi fuori schermo, «undefined/NaN»; foto in /tmp/giro-*.png
const OUT='/tmp/giro-';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const issues=[];
for(const theme of ['light','dark'])for(const W of [320,390]){
 const ctx=await b.newContext({viewport:{width:W,height:760},deviceScaleFactor:1,colorScheme:theme});
 await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
 await ctx.route(/open-meteo|generativelanguage|workers\.dev/,r=>r.abort());
 const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_|Failed to load/.test(m.text()))errs.push('console '+m.text())});
 const w=ms=>pg.waitForTimeout(ms);
 await pg.goto('http://localhost:8765/index.html');
 await pg.click('[data-a="formset"][data-v="dev"]');
 for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
 await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await w(300);
 await pg.evaluate(()=>makeTestData());await w(800);
 // v42: agenda accesa con un evento di oggi per tutti (striscia «Oggi in hotel» e icona del calendario)
 await pg.evaluate(async()=>{await funzSet('agenda',true);await put('config','agenda_'+today().slice(0,7),{tipo:'agenda',e:{giro:{t:'Gruppo di prova con un titolo abbastanza lungo da andare a capo',g:today(),h:'20:00',cop:40,note:'',vis:'tutti',rep:[],da:realU().id,cr:now(),mod:now(),r:''}}})});await w(400);
 await pg.evaluate(()=>{localStorage.setItem('jona_theme',JSON.stringify(null))});
 const check=async name=>{{const st=await pg.evaluate(()=>[S.viewAs||'dev',S.tab,sheets.length]);if(!name.startsWith(st[0]))issues.push(`${theme} ${W} ${name}: vista cambiata ${st}`)}
  await pg.evaluate(()=>document.querySelectorAll('#toasts .toast').forEach(t=>t.remove()));
  const r=await pg.evaluate(()=>{const W=innerWidth;const sw=document.documentElement.scrollWidth;
   const over=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return false;const b=e.getBoundingClientRect();return b.width>0&&b.right>W+1&&!e.closest('[style*="overflow"],.hscroll,.chips,.scroll-x')&&getComputedStyle(e.parentElement).overflowX==='visible'}).slice(0,3).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,30)+' "'+(e.innerText||'').slice(0,30)+'" r='+Math.round(e.getBoundingClientRect().right));
   const und=document.body.innerText.match(/undefined|NaN|\[object Object\]|null €/g);
   return {sw,W,over,und}});
  if(r.sw>r.W)issues.push(`${theme} ${W} ${name}: scroll orizzontale ${r.sw}>${r.W}`);
  if(r.over.length)issues.push(`${theme} ${W} ${name}: fuori schermo ${r.over.join(' | ')}`);
  if(r.und)issues.push(`${theme} ${W} ${name}: testo sospetto ${r.und.join(',')}`);
  await pg.screenshot({path:`${OUT}${theme}-${W}-${name}.png`,fullPage:true});
 };
 for(const role of ['dev','gm','staff']){
  await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await pg.click(`[data-a="viewAs"][data-v="${role}"]`);await w(400);{const va=await pg.evaluate(()=>S.viewAs||'dev');if(va!==role)issues.push(`${theme} ${W} viewAs ${role} -> ${va}`)}
  const tabs=await pg.$$eval('nav [data-a="tab"]',a=>a.map(x=>x.dataset.v));
  for(const t of tabs){await pg.evaluate(t=>{const b=document.querySelector(`nav [data-a="tab"][data-v="${t}"]`);if(b)b.click();else{S.tab=t;render()}},t);await w(450);await check(`${role}-${t}`);
    // sottoschede
    const SUBSEL='main [role="tab"],main .seg button';const subs=await pg.$$eval(SUBSEL,a=>a.map((x,i)=>x.closest('.testbar')?-1:i).filter(i=>i>=0));for(const sub of subs){
      const el=(await pg.$$(SUBSEL))[sub];if(!el)continue;try{await el.click({timeout:1500});await w(350);await check(`${role}-${t}-s${sub}`)}catch(e){}
    }}
  for(const h of ['notifs','meMenu','chatOpen','jonaOpen','news','agOpen']){const l=pg.locator(`header.top [data-a="${h}"]`);if(!await l.count())continue;await l.first().click();await w(500);await check(`${role}-H${h}`);await pg.evaluate(()=>{while(sheets.length)closeSheet(true);if(typeof chClose==='function')try{chClose()}catch(e){}});await pg.keyboard.press('Escape');await w(200)}
 }
 if(errs.length)issues.push(`${theme} ${W} ERRORI: ${[...new Set(errs)].join(' || ')}`);
 await ctx.close();
}
const real=issues.filter(x=>!/fuori schermo (THEAD|TR|TH|TD|TBODY)\./.test(x));console.log(real.length?real.map(x=>"FAIL "+x).join("\n"):"PASS nessun problema");if(real.length)process.exitCode=1;
await b.close();
