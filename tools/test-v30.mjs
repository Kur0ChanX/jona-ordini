// v30 (modalità locale): pallino sull'icona = chat non lette + avvisi non letti + cose da fare (senza carrello e ordini in preparazione).
// Il numero va anche nella cache «jona-badge»; sw.js lo aumenta a ogni push con l'app non in vista (controllato a parte sul file).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
// il microfono finto di Chromium fa solo un bip al secondo: gli faccio ascoltare 4 s di «voce» (tono + rumore che sale e scende)
const wav=(await import('os')).tmpdir()+'/jona-voce.wav';{const n=48000*4,d=Buffer.alloc(44+n*2);d.write('RIFF',0);d.writeUInt32LE(36+n*2,4);d.write('WAVEfmt ',8);d.writeUInt32LE(16,16);d.writeUInt16LE(1,20);d.writeUInt16LE(1,22);d.writeUInt32LE(48000,24);d.writeUInt32LE(96000,28);d.writeUInt16LE(2,32);d.writeUInt16LE(16,34);d.write('data',36);d.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){const t=i/48000,e=.5+.5*Math.sin(2*Math.PI*1.3*t),v=e*(.5*Math.sin(2*Math.PI*220*t)+.3*Math.sin(2*Math.PI*440*t)+.2*(Math.random()*2-1));d.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*20000),44+i*2)}fs.writeFileSync(wav,d)}
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+wav,'--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.grantPermissions(['microphone'],{origin:'http://localhost:8765'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
await ctx.addInitScript(()=>{self.__bd=[];navigator.setAppBadge=n=>{self.__bd.push(n);return Promise.resolve()};navigator.clearAppBadge=()=>{self.__bd.push(0);return Promise.resolve()}});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const W=ms=>pg.waitForTimeout(ms);const last=()=>pg.evaluate(()=>self.__bd[self.__bd.length-1]);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await W(300);
ok(await pg.evaluate(()=>APP_VER>=30&&NEWS.some(n=>n.v===30)),'version 30 with news');
ok((await last()||0)===0,'nothing to do: no badge');
await pg.evaluate(async()=>{await put('staff','u_luca',{nome:'Luca',cognome:'Bianchi',username:'luca',ruolo:'staff',reparto:'cucina',mansione:'Cuoco',stato:'attivo',pass:await sha('u_luca:password123'),creato:now()});
  await put('messaggi','m1',{c:'tutti',da:'u_luca',t:'Ciao',creato:Date.now()-1000});});
await W(400);const a=await last();ok(a===1,'one unread chat message → 1 ('+a+')');
await pg.evaluate(async()=>{await put('staff','u_new',{nome:'Nuovo',cognome:'X',username:'nuovo',ruolo:'staff',reparto:'sala',mansione:'',stato:'in_attesa',pass:'x',creato:now()});
  await put('notifiche','n1',{a:realU().id,titolo:'Ordine approvato',testo:'',tipo:'richiesta',letta:false,creato:now()});});
await W(400);const c=await last();ok(c===3,'+ profile to approve + unread notice → 3 ('+c+')');
const cached=await pg.evaluate(async()=>{const r=await (await caches.open('jona-badge')).match('./badge-n');return r&&await r.text()});
ok(cached==='3','number saved for the service worker ('+cached+')');
await pg.click('[data-a="chatOpen"]');await W(300);await pg.click('[data-a="chGo"][data-c="tutti"]');await W(500);
const d=await last();ok(d===2,'chat read → 2 ('+d+')');
// forma d'onda
const u=await pg.evaluate(()=>({sil:wfCode(Array(50).fill(.001)),loud:wfCode(Array.from({length:80},(_,i)=>i<40?.2:.001)),short:wfCode([.1,.2,.05,.3])}));
ok(u.sil==='0'.repeat(40),'silence → flat line');
ok(/^[1-9]{20}0{20}$/.test(u.loud)&&u.loud.includes('9'),'voice then silence → bars then flat '+u.loud);
ok(u.short.length===40,'short voice still 40 bars');
// registrazione vera con il microfono finto di Chromium (tono)
await pg.evaluate(()=>{self.__cf=null;chFile=(t,bl,x)=>{self.__cf=x}});
await pg.evaluate(()=>chRec());await W(2600);
const live=await pg.locator('#ch-rw i').count();ok(live===24,'live bars while recording ('+live+')');
const hs=await pg.evaluate(()=>[...document.querySelectorAll('#ch-rw i')].map(i=>parseInt(i.style.height)));
ok(hs.some(h=>h>4),'live bars move with the sound '+hs.join(','));
await pg.evaluate(()=>chRecStop(true));await W(800);
const cf=await pg.evaluate(()=>self.__cf);ok(cf&&/^[0-9]{40}$/.test(cf.wf)&&/[1-9]/.test(cf.wf),'message gets wf '+(cf&&cf.wf));
// messaggio con wf: barre di altezze diverse; senza wf: barre grigie uguali
await pg.evaluate(async()=>{await put('messaggi','a1',{c:'tutti',da:'u_luca',t:'🎤',tipo:'audio',m:'0-a1',dur:4,wf:'0123456789'.repeat(4),creato:Date.now()});
  await put('messaggi','a2',{c:'tutti',da:'u_luca',t:'🎤',tipo:'audio',m:'0-a2',dur:3,creato:Date.now()+1});});
await W(500);
const r=await pg.evaluate(()=>({h:[...document.querySelectorAll('[data-au="0-a1"] .cht-wf i')].slice(0,10).map(i=>parseInt(i.style.height)),old:document.querySelector('[data-au="0-a2"] .cht-wf').classList.contains('old')}));
ok(r.h.join(',')==='2,7,9,12,14,17,20,22,25,27'&&r.old,'bars follow wf, old voice neutral '+JSON.stringify(r));
await pg.screenshot({path:process.env.SHOT||'/tmp/v30.png'});
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
ok(/badgeBump\(\)\]\)\)/.test(sw)&&/k !== 'jona-badge'/.test(sw),'sw: push bumps the badge, cache kept on update');
ok(errs.length===0,'no page errors '+JSON.stringify(errs));
await b.close();
