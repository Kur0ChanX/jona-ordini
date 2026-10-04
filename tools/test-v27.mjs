// v27 (modalità locale): reazioni in chat (pressione lunga e tasto destro, scelta, conteggio, togliere, emoji estranee ignorate,
// clic dopo la pressione lunga ignorato, tocco altrove chiude, copia del testo, 320 px, barra sotto il primo messaggio se sopra non c'è posto).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:640},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://localhost:8765'});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const W=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
const MARIO=await pg.evaluate(async()=>{for(const [id,n] of [['u_luca','Luca'],['u_sara','Sara']])
  await put('staff',id,{nome:n,cognome:'Bianchi',username:n.toLowerCase(),ruolo:'staff',reparto:'cucina',mansione:'Cuoco',stato:'attivo',pass:await sha(id+':password123'),creato:now()});
  const t=Date.now();await put('messaggi','m1',{c:'tutti',da:'u_luca',t:'Stasera 80 coperti',creato:t-6e5,r:{u_sara:'👍',x:'<img src=x onerror=alert(1)>'}});
  await put('messaggi','m2',{c:'tutti',da:realU().id,t:'Perfetto, grazie',creato:t-3e5});return realU().id});
await W(300);await pg.click('[data-a="chatOpen"]');await W(300);await pg.click('[data-a="chGo"][data-c="tutti"]');await W(400);
const chips=()=>pg.evaluate(()=>[...document.querySelectorAll('.cht-rx button')].map(x=>x.closest('.cht-b').dataset.id+':'+x.innerText.replace(/\s/g,'')+(x.classList.contains('on')?'*':'')));
ok(JSON.stringify(await chips())==='["m1:👍"]','existing reaction shown, foreign value ignored');
ok(await pg.locator('.cht-rx img').count()===0,'no HTML from the database');
// pressione lunga sul primo messaggio: in alto non c'è posto → barra sotto
const p1=pg.locator('.cht-b[data-id="m1"] p');const bx=await p1.boundingBox();
await pg.mouse.move(bx.x+20,bx.y+15);await pg.mouse.down();await W(700);
ok(await pg.locator('.cht-rb').count()===1,'long press opens the reaction bar');
ok(await pg.locator('.cht-rb button').count()===7,'six faces and «Copia»');
await pg.mouse.up();await W(100);
ok(await pg.locator('.cht-rb').count()===1,'click after the long press is ignored (bar stays open)');
const g=await pg.evaluate(()=>{const r=document.querySelector('.cht-rb').getBoundingClientRect(),m=document.querySelector('#ch-m').getBoundingClientRect();return{l:r.left,r:r.right,t:r.top,mt:m.top,dn:document.querySelector('.cht-rb').classList.contains('dn'),page:document.documentElement.scrollWidth}});
ok(g.l>=0&&g.r<=320&&g.t>=g.mt&&g.page<=320,'320 px: bar fully visible '+JSON.stringify(g));
await pg.screenshot({path:'/tmp/claude-0/-home-user-jona-ordini/22576bef-aaba-583b-af6d-83af0e8af48c/scratchpad/v27-bar.png'});
await pg.click('.cht-rb [data-v="👍"]');await W(300);
const cc=await chips();ok(JSON.stringify(cc)===`["m1:👍2*"]`,JSON.stringify(cc)+" same face: count 2, mine highlighted");
ok(await pg.evaluate(async()=>(JSON.parse(localStorage.jona_db_v2).messaggi.m1).r[realU().id]==='👍'),'saved in r.<person>');
// cambia faccina dal tasto destro
await pg.click('.cht-b[data-id="m1"] p',{button:'right'});await W(200);
await pg.click('.cht-rb [data-v="😢"]');await W(300);
ok(JSON.stringify((await chips()).sort())==='["m1:👍","m1:😢*"]','changed to 😢: one reaction per person');
// tocco sulla faccina sotto il messaggio la toglie
await pg.click('.cht-rx button.on');await W(300);
ok(JSON.stringify(await chips())==='["m1:👍"]','tap on my reaction removes it');
ok(await pg.evaluate(async()=>!(JSON.parse(localStorage.jona_db_v2).messaggi.m1).r[realU().id]),'removed from the database');
await pg.click('.cht-rx button');await W(300);
ok(JSON.stringify(await chips())==='["m1:👍2*"]','tap on someone else\'s reaction adds the same face');
// tocco altrove chiude
await pg.click('.cht-b[data-id="m2"] p',{button:'right'});await W(200);ok(await pg.locator('.cht-rb').count()===1,'right click on my own message');
await pg.click('.cht-ct');await W(200);ok(await pg.locator('.cht-rb').count()===0,'tap elsewhere closes the bar');
// copia
await pg.click('.cht-b[data-id="m2"] p',{button:'right'});await W(200);await pg.click('.cht-rb [data-a="chCopy"]');await W(300);
ok(await pg.evaluate(()=>navigator.clipboard.readText())==='Perfetto, grazie','«Copia» copies the text');
// arriva una reazione da un collega (come dal database)
await pg.evaluate(()=>upd('messaggi','m2',{'r.u_luca':'❤️'}));await W(400);
ok((await chips()).includes('m2:❤️'),'reaction from a colleague appears');
// messaggio in cima allo schermo: la barra va sotto
await pg.evaluate(async()=>{const t=Date.now();for(let i=0;i<30;i++)await put('messaggi','x'+i,{c:'tutti',da:'u_sara',t:'Riga '+i,creato:t-2e5+i*1000})});await W(400);
await pg.evaluate(()=>{const m=document.querySelector('#ch-m'),b=document.querySelector('.cht-b[data-id="x8"]');m.scrollTop+=b.getBoundingClientRect().top-m.getBoundingClientRect().top-2});await W(200);
const p3=await pg.locator('.cht-b[data-id="x8"] p').boundingBox();await pg.mouse.move(p3.x+15,p3.y+12);await pg.mouse.down();await W(650);await pg.mouse.up();await W(100);
const g2=await pg.evaluate(()=>{const r=document.querySelector('.cht-rb'),m=document.querySelector('#ch-m').getBoundingClientRect();const p=document.querySelector('.cht-b[data-id="x8"]').getBoundingClientRect();return r&&{dn:r.classList.contains('dn'),ok:r.getBoundingClientRect().top>=m.top,pt:Math.round(p.top),mt:Math.round(m.top)}});
ok(g2&&g2.dn&&g2.ok,'message at the top: bar below it, visible '+JSON.stringify(g2));
await pg.click('.cht-rb [data-v="✅"]');await W(300);ok((await chips()).includes('x8:✅*'),'reaction from the bar below');
ok(await pg.evaluate(()=>NEWS[0].v===27&&APP_VER===27),'version 27 with news');
await pg.screenshot({path:'/tmp/claude-0/-home-user-jona-ordini/22576bef-aaba-583b-af6d-83af0e8af48c/scratchpad/v27-chips.png'});
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
