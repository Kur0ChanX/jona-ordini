// v26 (modalità locale): reparti nuovi in registrazione (5 tasti su due righe, 320 px senza scorrimento, chiave salvata, gruppo in chat)
// e guida «notifiche bloccate» quando Notification.permission è «denied» (iPhone e Android).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const mk=async(ua,perm)=>{const ctx=await b.newContext({viewport:{width:320,height:700},serviceWorkers:'block',...(ua?{userAgent:ua}:{})});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  if(perm)await ctx.addInitScript(p=>{Object.defineProperty(Notification,'permission',{get:()=>p});Notification.requestPermission=async()=>p},perm);
  const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));return pg};
const pg=await mk();
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
await pg.evaluate(()=>logout());await pg.waitForSelector('[data-a="register"]');
await pg.click('[data-a="register"]');await pg.waitForTimeout(400);
const labels=await pg.locator('.sheet .seg.rep button').allInnerTexts();
ok(labels.join('|')==='Cucina|Sala|F&B Manager|Responsabile|Altro','five departments: '+labels.join(', '));
const geo=await pg.evaluate(()=>{const s=document.querySelector('.sheet .seg.rep');const bs=[...s.querySelectorAll('button')].map(b=>b.getBoundingClientRect());
  return{over:s.scrollWidth>s.clientWidth+1,rows:new Set(bs.map(r=>Math.round(r.top))).size,minH:Math.min(...bs.map(r=>r.height)),page:document.documentElement.scrollWidth}});
ok(!geo.over&&geo.rows===2&&geo.minH>=40&&geo.page<=320,'320 px: two rows, big buttons, no sideways scroll '+JSON.stringify(geo));
await pg.screenshot({path:'/tmp/claude-0/-home-user-jona-ordini/e0d0c918-cbde-57e6-99f4-9eecba1dc8c2/scratchpad/reparti.png'});
await pg.click('.sheet .seg.rep button:has-text("F&B Manager")');
ok(await pg.evaluate(()=>S.form.reparto)==='fb','F&B Manager saved as «fb»');
ok(await pg.evaluate(()=>REPARTI.altro==='Altro'&&REPARTI.resp==='Responsabile'),'old key «altro» still «Altro»');
ok(await pg.evaluate(()=>chInfo('rep_fb',{id:'x'}).n==='F&B Manager'&&chAv(chInfo('rep_resp',{id:'x'}),40).includes('cht-gav')),'chat groups for the new departments');
// notifiche bloccate
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
for(const [ua,name,word] of [[IOS,'iPhone','Jona Ordini'],['Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36','Android','Impostazioni sito']]){
  const p=await mk(ua,'denied');await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);
  await p.evaluate(()=>pushHelp());await p.waitForTimeout(400);
  const t=await p.locator('.sheet').innerText();
  ok(/Notifiche bloccate/.test(t)&&t.includes(name)&&t.includes(word)&&/Riprova ad attivare/.test(t),name+': unblock guide with exact menu names');
  await p.evaluate(()=>pushHelp());await p.waitForTimeout(300);ok(await p.locator('.sheet').count()===1,name+': opening again does not stack a second sheet');
  await p.click('[data-a="pushAll"]');await p.waitForTimeout(300);
  ok(/Le notifiche non arrivano\?/.test(await p.locator('.sheet').innerText()),name+': «Ho un altro problema» shows the old guide');
  ok(p.errs.length===0,name+': no page errors');
}
const g=await mk(null,'default');await g.goto('http://localhost:8765/index.html');await g.waitForTimeout(500);await g.evaluate(()=>pushHelp());await g.waitForTimeout(300);
ok(/Le notifiche non arrivano\?/.test(await g.locator('.sheet').innerText()),'not blocked: the usual guide');
ok(pg.errs.length===0,'no page errors');
await b.close();
