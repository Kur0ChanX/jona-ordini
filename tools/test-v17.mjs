// v17, modalità locale: «Chiedi a Jona» (Gemini finto: dati mandati, risposta con grassetto ed elenco, chiave mancante o sbagliata, senza rete)
// e chat tra colleghi (gruppi visibili per ruolo e reparto, messaggi diretti, invio con Invio, letti e spunte, avviso, 320 px, tema scuro).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
let gem={mode:'ok',body:null};
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{gem.body=JSON.parse(r.request().postData()||'{}');
  if(gem.mode==='net')return r.abort();
  if(gem.mode==='key')return r.fulfill({status:400,json:{error:{message:'API key not valid. Please pass a valid API key.'}}});
  r.fulfill({json:{candidates:[{content:{parts:[{text:'**Totale settembre**: 125,40 €\n- Metro: 80,00 €\n- F.lli Mariano: 45,40 €'}]}}]}})});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const W=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
const MARIO=await pg.evaluate(async()=>{for(const [id,n,r] of [['u_luca','Luca','cucina'],['u_sara','Sara','sala'],['u_paolo','Paolo','cucina']])
  await put('staff',id,{nome:n,cognome:'Bianchi',username:n.toLowerCase(),ruolo:'staff',reparto:r,mansione:'Cuoco',stato:'attivo',pass:await sha(id+':password123'),creato:now()});return realU().id});
await W(300);

/* 1. Chiedi a Jona */
ok(await pg.locator('[data-a="jonaOpen"]').count()===1&&await pg.locator('[data-a="voice"]').count()===0,'managers: «Chiedi a Jona» button instead of the microphone');
await pg.click('[data-a="jonaOpen"]');await W(300);
ok(await pg.locator('.sheet .jona-key').count()===1&&await pg.locator('.sheet [data-a="jonaAsk"][disabled]').count()===1,'no Gemini key: card to add it, send disabled');
await pg.evaluate(()=>{ls('jona_gemini_key','FAKE');refreshSheet()});await W(200);
ok(await pg.locator('.sheet .jona-tips .chip').count()===5,'suggested questions');
await pg.locator('.sheet .jona-tips .chip').first().click();await W(600);
ok(!!gem.body&&gem.body.system_instruction&&/DATI:/.test(gem.body.system_instruction.parts[0].text),'question sent with the restaurant data');
const sys=gem.body.system_instruction.parts[0].text;
ok(sys.includes('"listino"')&&sys.includes('"ordini"')&&sys.includes('"orari"')&&sys.includes('Luca Bianchi'),'data includes listino, orders, schedules and staff');
ok(gem.body.contents.at(-1).parts[0].text.includes('Quanto abbiamo speso'),'question is the last message');
const ans=pg.locator('.sheet .jona-m.a').last();
ok(await ans.locator('b').count()===1&&await ans.locator('li').count()===2,'answer rendered with bold and list');
await pg.fill('#jona-q','E il mese scorso?');await pg.keyboard.press('Enter');await W(600);
ok(gem.body.contents.length===3,'follow-up keeps the conversation ('+gem.body.contents.length+' messages)');
gem.mode='key';await pg.fill('#jona-q','Prova');await pg.click('.sheet [data-a="jonaAsk"]');await W(500);
ok((await pg.locator('.sheet .jona-m.a').last().innerText()).includes('chiave Gemini non è valida'),'wrong key: clear message');
gem.mode='net';await pg.fill('#jona-q','Prova');await pg.click('.sheet [data-a="jonaAsk"]');await W(500);
ok((await pg.locator('.sheet .jona-m.a').last().innerText()).includes('connessione'),'no network: clear message');
await pg.screenshot({path:'/tmp/v17-jona.png'});
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await W(300);
await pg.evaluate(()=>upd('staff','u_luca',{contratto:{ore:40,pausa:30,liberi:1}}));await W(200);
ok(await pg.evaluate(()=>{S.viewAs=null;const dev=jonaCtx().includes('40h/sett');S.viewAs='gm';const gm=jonaCtx().includes('40h/sett');S.viewAs=null;return!dev&&gm}),'contract hours sent to Gemini only for the administrator');

/* 2. Chat */
const dm=(a,b)=>'dm_'+[a,b].sort().join('--');
await pg.evaluate(async([dmL,dmS])=>{const t=Date.now();
  for(const [c,da,tx,d] of [['tutti','u_luca','Stasera 80 coperti',-36e5],['rep_cucina','u_paolo','Mancano le zucchine',-30*6e4],['rep_sala','u_sara','Sala pronta',-20*6e4],[dmL,'u_luca','Il forno fa l\'errore E12',-10*6e4],[dmS,'u_sara','Messaggio privato per Mario',-5*6e4]])
    await put('messaggi',uid(),{c,da,t:tx,creato:t+d})},[dm(MARIO,'u_luca'),dm(MARIO,'u_sara')]);await W(400);
ok((await pg.locator('[data-a="chatOpen"] .dot').innerText())==='5','header: chat button with 5 unread');
await pg.click('[data-a="chatOpen"]');await W(400);
const names=await pg.locator('.cht-it .cht-r b').allInnerTexts();
ok(['Tutto lo staff','Cucina','Sala','Luca Bianchi','Sara Bianchi'].every(n=>names.includes(n)),'manager sees all, both departments and both direct chats');
await pg.click(`.cht-it[data-c="${dm(MARIO,'u_luca')}"]`);await W(400);
ok(await pg.locator('.cht.has-c .cht-m .cht-b.ot').count()===1,'conversation opens with the message');
ok(await pg.evaluate(c=>(CHAT.letti[realU().id]||{})[c]>0,dm(MARIO,'u_luca')),'opening marks as read');
await pg.fill('#ch-ta','Chiamo l\'assistenza');await pg.keyboard.press('Enter');await W(400);
const sent=await pg.evaluate(c=>CHAT.msgs.find(m=>m.c===c&&m.da===realU().id),dm(MARIO,'u_luca'));
ok(sent&&sent.t==='Chiamo l\'assistenza','Enter sends the message');
ok(await pg.inputValue('#ch-ta')==='','input cleared');
ok(await pg.locator('.cht-b.me .tk').count()===1&&await pg.locator('.cht-b.me .tk.rd').count()===0,'my message: grey ticks (not read yet)');
await pg.evaluate(c=>upd('messaggi','letti',{['u_luca.'+c]:Date.now()+1000}),dm(MARIO,'u_luca'));await W(400);
ok(await pg.locator('.cht-b.me .tk.rd').count()===1,'Luca read it: ticks turn blue');
await pg.fill('#ch-ta','Riga uno');await pg.keyboard.press('Shift+Enter');await pg.keyboard.type('riga due');
ok((await pg.inputValue('#ch-ta')).includes('\n'),'Shift+Enter: new line');
await pg.fill('#ch-ta','');
// messaggio nuovo in un'altra chat: avviso in app
await pg.evaluate(()=>put('messaggi',uid(),{c:'tutti',da:'u_paolo',t:'Chi apre domani?',creato:Date.now()}));await W(500);
ok((await pg.locator('#toasts').innerText()).includes('Paolo · Tutto lo staff: Chi apre domani?'),'new message elsewhere: toast');
await pg.click('[data-a="chBack"]');await W(200);
ok(await pg.locator('.cht-it[data-c="tutti"] em').count()===1,'list: unread badge on the group');
// nuova chat diretta
await pg.click('[data-a="chPick"]');await W(200);
await pg.click(`.cht-it[data-c="${dm(MARIO,'u_paolo')}"]`);await W(300);
ok((await pg.locator('.cht-hint').innerText()).includes('Nessun messaggio'),'new direct chat: empty hint');
await pg.screenshot({path:'/tmp/v17-chat.png'});
await pg.keyboard.press('Escape');await W(200);await pg.keyboard.press('Escape');await W(400);
ok(await pg.locator('.cht').count()===0,'Esc goes back and closes');
// lo staff vede solo il suo reparto e le sue chat
await pg.evaluate(()=>logout());await W(200);await pg.fill('#li-u','luca');await pg.fill('#li-p','password123');await pg.click('[data-a="doLogin"]');await W(500);
await pg.click('[data-a="chatOpen"]');await W(400);
const ln=await pg.locator('.cht-it .cht-r b').allInnerTexts();
ok(ln.includes('Tutto lo staff')&&ln.includes('Cucina')&&!ln.includes('Sala')&&ln.includes('Mario Rossi')&&!ln.includes('Sara Bianchi'),'staff: own department, no other private chats ('+ln.join(', ')+')');
await pg.setViewportSize({width:320,height:640});await W(300);
await pg.click(`.cht-it[data-c="${dm(MARIO,'u_luca')}"]`);await W(300);
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.cht-send').getBoundingClientRect().right<=innerWidth),'320 px: no sideways scroll, send button visible');
await pg.evaluate(()=>{localStorage.setItem('jona_theme','"dark"');applyTheme()});await W(300);
const bg=await pg.evaluate(()=>getComputedStyle(document.querySelector('.cht-b.ot p')).backgroundColor);
ok(!/255, 255, 255/.test(bg),'dark theme bubbles ('+bg+')');
await pg.screenshot({path:'/tmp/v17-chat-dark.png'});
await pg.click('[data-a="chBack"]');await pg.click('[data-a="chClose"]');await W(400);
ok(await pg.evaluate(()=>{const h=document.querySelector('.top');return h.scrollWidth<=h.clientWidth+1}),'320 px: header with chat button fits');
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
