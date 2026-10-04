// v20: Gemini dal server del ristorante. Parte 1 (Node): /gemini del Worker con fetch finto (accesso solo ai membri,
// riprova dopo 429 con retryDelay, modello Lite, errori). Parte 2 (Chromium, locale): gemCall senza chiave sul telefono passa da /gemini.
import worker from '../worker/src/index.js';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b64u=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt=p=>b64u({alg:'RS256'})+'.'+b64u(p)+'.firma';
const T0=Math.floor(Date.now()/1000);
const GOOD=jwt({sub:'uidMembro123',exp:T0+3600}),OUT=jwt({sub:'uidEstraneo1',exp:T0+3600}),OLD=jwt({sub:'uidMembro123',exp:T0-10});

/* 1. Worker */
const calls=[];let plan=[];let fsCalls=0;
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{url=String(url);
  if(url.startsWith('https://firestore.googleapis.com/')){fsCalls++;
    const tok=(init.headers.authorization||'').slice(7);
    return new Response('{}',{status:tok===GOOD&&url.endsWith('/projects/jona-ordini/databases/(default)/documents/membri/uidMembro123')?200:403})}
  if(url.startsWith('https://generativelanguage.googleapis.com/')){const m=url.match(/models\/([^:]+):/)[1];calls.push({m,t:Date.now(),key:init.headers['x-goog-api-key'],body:JSON.parse(init.body)});
    const step=plan.shift()||'ok';
    if(step==='429')return new Response(JSON.stringify({error:{code:429,message:'Resource exhausted',details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'1s'}]}}),{status:429});
    if(step==='404')return new Response(JSON.stringify({error:{message:'not found'}}),{status:404});
    if(step==='400')return new Response(JSON.stringify({error:{message:'API key not valid'}}),{status:400});
    return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'ciao da '+m}]}}]}),{status:200})}
  throw new Error('rete non prevista: '+url)};
const env={VAPID_JWK:'',GEMINI_KEY:'CHIAVE-SEGRETA',FB_PROJECT:'jona-ordini'};
const req=(tok,body={contents:[{parts:[{text:'ciao'}]}],generationConfig:{temperature:0},extra:'via'})=>new Request('https://x/gemini',{method:'POST',headers:{'content-type':'application/json',...(tok?{authorization:'Bearer '+tok}:{})},body:JSON.stringify(body)});
const call=async(r,e=env)=>{const res=await worker.fetch(r,e);return{s:res.status,j:await res.json().catch(()=>({})),h:res.headers}};

let r=await call(new Request('https://x/salute'));ok(r.s===200&&r.j.gemini===true,'/salute says gemini:true');
r=await call(new Request('https://x/salute'),{});ok(r.j.gemini===false,'/salute gemini:false without the secret');
r=await call(req(GOOD),{FB_PROJECT:'jona-ordini'});ok(r.s===503&&calls.length===0,'no GEMINI_KEY: 503, Google not called');
r=await call(req(''));ok(r.s===403&&calls.length===0,'no token: 403');
r=await call(req('spazzatura'));ok(r.s===403,'broken token: 403');
r=await call(req(OUT));ok(r.s===403&&calls.length===0,'token of a phone not in membri: 403');
r=await call(req(OLD));ok(r.s===403,'expired token: 403');
r=await call(req(GOOD));
ok(r.s===200&&r.j.candidates[0].content.parts[0].text==='ciao da gemini-flash-latest','member: answer from Gemini');
ok(calls[0].key==='CHIAVE-SEGRETA'&&!('extra' in calls[0].body)&&calls[0].body.generationConfig.temperature===0,'server key used, only Gemini fields forwarded');
ok(r.h.get('access-control-allow-origin')==='*','CORS on the answer');
const fs1=fsCalls;await call(req(GOOD));ok(fsCalls===fs1,'membership remembered (no second Firestore read)');
calls.length=0;plan=['429','ok'];let t=Date.now();r=await call(req(GOOD));
ok(r.s===200&&calls.length===2&&calls[1].m==='gemini-flash-latest'&&calls[1].t-calls[0].t>=950,'429: waits retryDelay (1 s) and retries the same model ('+(calls[1]&&calls[1].t-calls[0].t)+' ms)');
calls.length=0;plan=['429','429','ok'];r=await call(req(GOOD));
ok(r.s===200&&calls.map(c=>c.m).join()==='gemini-flash-latest,gemini-flash-latest,gemini-flash-lite-latest','still busy: moves to the Lite model');
calls.length=0;plan=['429','429','429','429','429','429'];r=await call(req(GOOD));
ok(r.s===429&&calls.length===6,'all busy: 429 to the phone after '+calls.length+' tries');
calls.length=0;plan=['404','ok'];r=await call(req(GOOD));ok(r.s===200&&calls[1].m==='gemini-flash-lite-latest','model missing (404): next model');
calls.length=0;plan=['400'];r=await call(req(GOOD));ok(r.s===400&&calls.length===1&&/API key/.test(r.j.error.message),'other errors passed through without retry');
r=await call(req(GOOD,{nope:1}));ok(r.s===400,'request without contents: 400');
r=await call(new Request('https://x/gemini',{method:'OPTIONS'}));ok(r.s===204&&/authorization/.test(r.h.get('access-control-allow-headers')),'preflight allows Authorization');
globalThis.fetch=realFetch;

/* 2. App */
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const srv={salute:0,body:null,auth:'',mode:'ok'};let direct=0;
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{direct++;r.fulfill({json:{candidates:[{content:{parts:[{text:'diretta'}]}}]}})});
await ctx.route('https://jona-notifiche.mario-miscera.workers.dev/**',r=>{const u=r.request().url();
  if(u.endsWith('/salute')){srv.salute++;return r.fulfill({json:{ok:true,push:true,gemini:true}})}
  if(u.endsWith('/gemini')){srv.body=JSON.parse(r.request().postData()||'{}');srv.auth=r.request().headers()['authorization']||'';
    if(srv.mode==='403')return r.fulfill({status:403,json:{error:{message:'Telefono non collegato al ristorante'}}});
    if(srv.mode==='429')return r.fulfill({status:429,json:{error:{message:'Resource exhausted'}}});
    return r.fulfill({json:{candidates:[{content:{parts:[{text:'dal server'}]}}]}})}
  r.fulfill({status:404,body:''})});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
ok(await pg.evaluate(()=>gemOn())===false,'local mode, no key: Gemini off');
ok(await pg.evaluate(async()=>(await gemCall({contents:[]})).err)==='Prima inserisci la chiave Gemini.'&&srv.salute===0,'local mode: server not asked');
// finta modalità Firebase pronta, gettone finto
await pg.evaluate(()=>{window._db=S.db;S.db=Object.assign(Object.create(S.db),{kind:'firebase',status:()=>({ready:true,pend:0})});window.fbInit=()=>({auth:{currentUser:{getIdToken:async()=>'TOK123'}}})});
const g=await pg.evaluate(async()=>gemCall({contents:[{parts:[{text:'quanto?'}]}],generationConfig:{temperature:0.2}}));
ok(g.txt==='dal server'&&srv.auth==='Bearer TOK123'&&srv.body.generationConfig.temperature===0.2&&direct===0,'no key on the phone: goes through /gemini with the Firebase token');
ok(srv.salute===1&&await pg.evaluate(()=>gemOn())===true,'/salute asked once, Gemini on');
await pg.evaluate(()=>gemCall({contents:[]}));ok(srv.salute===1,'/salute not asked again');
srv.mode='403';ok(/non è collegato al ristorante/.test((await pg.evaluate(()=>gemCall({contents:[]}))).err),'403: "not connected" message');
srv.mode='429';ok(/molto occupato/.test((await pg.evaluate(()=>gemCall({contents:[]}))).err),'429: "busy, retry in a minute" message');
srv.mode='ok';
await pg.evaluate(()=>ls('jona_gemini_key','MIA'));const d=await pg.evaluate(()=>gemCall({contents:[]}));
ok(d.txt==='diretta'&&direct===1,'own key on the phone: still direct to Google');
await pg.evaluate(()=>ls('jona_gemini_key',null));
await pg.click('[data-a="jonaOpen"]');await pg.waitForTimeout(300);
ok(await pg.locator('.sheet .jona-key').count()===0&&await pg.locator('.sheet [data-a="jonaAsk"][disabled]').count()===0,'«Chiedi a Jona»: no key card, send enabled');
await pg.fill('#jona-q','Quanto ho speso?');await pg.click('.sheet [data-a="jonaAsk"]');await pg.waitForTimeout(400);
ok((await pg.locator('.sheet .jona-m.a').last().innerText()).includes('dal server')&&!!(srv.body.system_instruction&&srv.body.contents.length),'«Chiedi a Jona» answered by the server');
await pg.evaluate(()=>{S.db=window._db});
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
