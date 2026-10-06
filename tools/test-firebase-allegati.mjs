// v26: foto e vocali in chat con l'emulatore. Il Worker vero (worker/src/index.js) gira qui in Node con D1 finto (node:sqlite)
// e risponde alle chiamate dell'app a PUSH_URL (route di Playwright). Microfono finto di Chromium.
// Poi: reparti nuovi in registrazione (320 px) e guida «notifiche bloccate».
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { DatabaseSync } from 'node:sqlite';
import { execSync } from 'node:child_process';
import worker from '../worker/src/index.js';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const p of ['demo-jona','jona-ordini']){await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${p}/databases/(default)/documents`,{method:'DELETE'});await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${p}/accounts`,{method:'DELETE'})}
// Worker in Node: Firestore finto per membro() (ogni gettone è di un membro), D1 finto
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,init)=>String(url).startsWith('https://firestore.googleapis.com/')?new Response('{}',{status:200}):realFetch(url,init);
function d1(){const db=new DatabaseSync(':memory:');
  const st=(sql,args=[])=>({bind:(...a)=>st(sql,a),first:async()=>db.prepare(sql).get(...args)??null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>{db.prepare(sql).run(...args);return{}}});
  return{prepare:sql=>st(sql),batch:async l=>{for(const s of l)await s.run()},raw:db}}
let env={ALLEGATI0:d1(),ALLEGATI1:d1(),FB_PROJECT:'demo-jona'};const hits=[];
const route=async r=>{const q=r.request();const h=q.headers();hits.push(q.method()+' '+new URL(q.url()).pathname);
  const res=await worker.fetch(new Request(q.url().replace(/^https:\/\/[^/]+/,'https://w'),{method:q.method(),headers:h,body:['GET','HEAD','OPTIONS'].includes(q.method())?undefined:q.postDataBuffer()}),env);
  const hd={};res.headers.forEach((v,k)=>hd[k]=v);await r.fulfill({status:res.status,headers:hd,body:Buffer.from(await res.arrayBuffer())})};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
const CFG={apiKey:'fake-key',authDomain:'demo-jona.firebaseapp.com',projectId:'demo-jona',appId:'1:1:web:1'};
const mk=async(cfg,vw=400)=>{const c=await b.newContext({viewport:{width:vw,height:800},serviceWorkers:'block',permissions:['microphone']});
  await c.addInitScript(cfg=>{localStorage.setItem('jona_fb_emu',JSON.stringify('127.0.0.1'));if(cfg&&!localStorage.getItem('jona_fb'))localStorage.setItem('jona_fb',JSON.stringify(cfg))},cfg);
  await c.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**',route);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const A=await mk(CFG);
await A.goto('http://localhost:8765/index.html');await A.waitForTimeout(3000);
await A.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of Object.entries({nome:'Mario',cognome:'Test',username:'mario',pw:'prova1234',pw2:'prova1234'}))await A.fill('input[data-k="'+k+'"]',v);
await A.click('[data-a="setupGo"]');await A.waitForTimeout(1200);
await A.evaluate(()=>{fbActivate()});await A.waitForTimeout(300);await A.click('#ask-ok');await A.waitForTimeout(8000);
ok(await A.evaluate(()=>S.db.kind==='firebase'&&S.db.status().ready),'A on firebase');
await A.evaluate(()=>makeTestData());await A.waitForTimeout(3000);
const B=await mk(null);await B.goto(await A.evaluate(()=>inviteLink()));await B.waitForTimeout(5000);
await A.evaluate(async()=>{for(const d of (await fbInit().fs.collection('messaggi').get()).docs);for(const d of (await fbInit().fs.collection('membri').where('ok','==',false).get()).docs)await d.ref.update({ok:true})});await B.waitForTimeout(4000);
await B.fill('input[data-k="u"]','test1');await B.fill('input[data-k="p"]','prova123');await B.click('[data-a="doLogin"]');await B.waitForTimeout(2500);
ok(await B.evaluate(()=>meU()&&meU().id==='test_u1'),'B logged in as Luca');
// A apre la chat: tasti foto e microfono
await A.click('[data-a="chatOpen"]');await A.waitForTimeout(1500);await A.click('.cht-it[data-c="tutti"]');await A.waitForTimeout(500);
ok(await A.locator('.cht-cam').count()===1&&await A.locator('.cht-mic').isVisible()&&!(await A.locator('.cht-snd').isVisible()),'server with D1: camera + mic shown, send hidden while empty');
await A.fill('#ch-ta','ciao');ok(await A.locator('.cht-snd').isVisible()&&!(await A.locator('.cht-mic').isVisible()),'typing: mic becomes send');
await A.fill('#ch-ta','');await A.locator('#ch-ta').dispatchEvent('input');
ok((await A.locator('.cht-sp').innerText()).includes('Foto e vocali sul server: 0 MB su 880 MB'),'developer sees the space line');
// foto 4000×3000
execSync('ffmpeg -loglevel error -y -f lavfi -i testsrc2=size=4000x3000 -frames:v 1 /tmp/jona-foto.jpg');
const fc=A.waitForEvent('filechooser');await A.click('[data-a="chPhoto"]');await (await fc).setFiles('/tmp/jona-foto.jpg');await wait(4000);
const fm=await A.evaluate(async()=>(await fbInit().fs.collection('messaggi').where('tipo','==','foto').get({source:'server'})).docs.map(d=>d.data())[0]);
ok(fm&&fm.t==='📷 Foto'&&fm.w===1280&&fm.h===960&&/^data:image\/jpeg;base64,/.test(fm.mini)&&fm.mini.length<3000&&/^\d-/.test(fm.m),'photo message: 1280×960, tiny preview ('+(fm&&fm.mini.length)+' chars), id '+(fm&&fm.m));
const row=env['ALLEGATI'+fm.m[0]].raw.prepare('SELECT tipo, dim FROM f WHERE id=?').get(fm.m);
ok(row&&row.tipo==='image/webp'&&row.dim<400000,'server: WebP stored, '+(row&&row.dim)+' chars of base64');
ok(await A.locator('.cht-b.me .cht-ph img.ok').count()===1,'A sees its own photo at once');
// B riceve e scarica la foto quando apre la chat
await B.click('[data-a="chatOpen"]');await B.waitForTimeout(800);await B.click('.cht-it[data-c="tutti"]');await wait(2500);
const nat=await B.evaluate(()=>{const i=document.querySelector('.cht-b.ot .cht-ph img');return i&&i.classList.contains('ok')?i.naturalWidth:0});
ok(nat===1280,'B downloads the full photo (1280 px)');
ok(await B.evaluate(async()=>(await (await caches.open('jona-allegati')).keys()).length)===1,'B: photo kept in the jona-allegati cache');
await B.click('.cht-b.ot .cht-ph');await wait(500);ok(await B.locator('.cht-view img').count()===1,'tap: full screen photo');
await B.click('.cht-view');await wait(200);ok(await B.locator('.cht-view').count()===0,'tap again: closed');
const gets=hits.filter(h=>h.startsWith('GET /allegati/'+fm.m)).length;
await B.evaluate(()=>{ALG.url={};chPaint(true)});await wait(1500);
ok(hits.filter(h=>h.startsWith('GET /allegati/'+fm.m)).length===gets,'second time: from the phone cache, no download');
// vocale da B
await B.click('[data-a="chRec"]');await wait(2600);
ok(await B.locator('.cht-rec').isVisible()&&/0:0[12]/.test(await B.locator('#ch-rt').innerText()),'recording bar with timer');
await B.click('[data-a="chRecOk"]');await wait(3500);
const am=await A.evaluate(async()=>(await fbInit().fs.collection('messaggi').where('tipo','==','audio').get({source:'server'})).docs.map(d=>d.data())[0]);
ok(am&&am.dur>=2&&am.dur<=4&&/^🎤 Messaggio vocale \(0:0\d\)$/.test(am.t),'voice message saved: '+(am&&am.t));
const arow=env['ALLEGATI'+am.m[0]].raw.prepare('SELECT tipo, dim FROM f WHERE id=?').get(am.m);
ok(arow&&/^audio\/(mp4|webm)$/.test(arow.tipo)&&arow.dim<40000,'server: '+(arow&&arow.tipo)+', '+(arow&&arow.dim)+' chars for ~3 s (24 kbps)');
await A.waitForTimeout(1500);
ok(await A.locator('.cht-b.ot .cht-au').count()===1,'A sees the voice bubble');
await A.click('.cht-b.ot .cht-play');await wait(2000);
const pl=await A.evaluate(()=>({p:!!(ALG.pl&&!ALG.pl.a.paused&&ALG.pl.a.currentTime>0),t:document.getElementById('toasts').innerText}));
ok(pl.p||/non si apre su questo telefono/.test(pl.t),'A plays the voice message'+(pl.p?'':' (this Chromium has no AAC: clear message)'));
// annulla
await B.click('[data-a="chRec"]');await wait(1200);await B.click('[data-a="chRecNo"]');await wait(1200);
ok(await B.locator('.cht-rec').count()===0&&await B.evaluate(async()=>(await fbInit().fs.collection('messaggi').where('tipo','==','audio').get({source:'server'})).size)===1,'trash: nothing sent');
// file cancellato sul server
env.ALLEGATI0.raw.exec('DELETE FROM f');env.ALLEGATI1.raw.exec('DELETE FROM f');
await B.evaluate(async()=>{await caches.delete('jona-allegati');ALG.url={};chPaint(true)});await wait(2000);
ok((await B.locator('.cht-ph').first().innerText()).includes('Foto non più disponibile'),'deleted on the server: «Foto non più disponibile»');
// server senza D1: niente tasti
await A.evaluate(()=>{chClose()});env={FB_PROJECT:'demo-jona'};await A.evaluate(()=>{ALG.ok=null});await A.click('[data-a="chatOpen"]');await wait(1500);await A.click('.cht-it[data-c="tutti"]');await wait(400);
ok(await A.locator('.cht-cam').count()===0&&await A.locator('.cht-mic').count()===0&&await A.locator('.cht-snd').isVisible(),'server without D1: only text, as before');
ok(A.errs.length===0&&B.errs.length===0,'no page errors '+A.errs.concat(B.errs).join(' | '));
await b.close();
