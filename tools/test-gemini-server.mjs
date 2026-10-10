// v20: Gemini dal server del ristorante. Parte 1 (Node): /gemini del Worker con fetch finto (accesso solo ai membri,
// riprova dopo 429 con retryDelay, modello Lite, errori). Parte 2 (Chromium, locale): gemCall senza chiave sul telefono passa da /gemini.
import worker from '../worker/src/index.js';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b64u=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt=p=>b64u({alg:'RS256'})+'.'+b64u(p)+'.firma';
const T0=Math.floor(Date.now()/1000);
const GOOD=jwt({sub:'uidMembro123',exp:T0+3600}),OUT=jwt({sub:'uidEstraneo1',exp:T0+3600}),OLD=jwt({sub:'uidMembro123',exp:T0-10});
const WAIT=jwt({sub:'uidAttesa123',exp:T0+3600});

/* 1. Worker */
const calls=[];let plan=[];let fsCalls=0;
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{url=String(url);
  if(url.startsWith('https://firestore.googleapis.com/')){fsCalls++;
    const tok=(init.headers.authorization||'').slice(7);
    if(tok===WAIT&&url.endsWith('/membri/uidAttesa123'))return new Response(JSON.stringify({fields:{ok:{booleanValue:false}}}),{status:200});
    return new Response(JSON.stringify({fields:{k:{stringValue:'x'}}}),{status:tok===GOOD&&url.endsWith('/projects/jona-ordini/databases/(default)/documents/membri/uidMembro123')?200:403})}
  if(url.startsWith('https://generativelanguage.googleapis.com/')){const m=url.match(/models\/([^:]+):/)[1];calls.push({m,t:Date.now(),key:init.headers['x-goog-api-key'],body:JSON.parse(init.body)});
    const step=plan.shift()||'ok';
    if(step==='429')return new Response(JSON.stringify({error:{code:429,message:'Resource exhausted',details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'1s'}]}}),{status:429});
    if(step==='404')return new Response(JSON.stringify({error:{message:'not found'}}),{status:404});
    if(step==='slow')return new Promise((res,rej)=>{const t=setTimeout(()=>res(new Response('{}',{status:200})),60000);init.signal&&init.signal.addEventListener('abort',()=>{clearTimeout(t);rej(init.signal.reason||new Error('abort'))})});
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
r=await call(req(WAIT));ok(r.s===403&&calls.length===0,'phone waiting for approval: 403');
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
// v65: Gemini troppo lento (errore 524 di Cloudflare a 100 s): tempo massimo per modello e per richiesta
const envT={...env,GEM_TRY_MS:'400',GEM_BUDGET:'3700'};
calls.length=0;plan=['slow','ok'];t=Date.now();r=await call(req(GOOD),envT);
ok(r.s===200&&calls.map(c=>c.m).join()==='gemini-flash-latest,gemini-flash-lite-latest'&&Date.now()-t<2000,'slow model: gives up after GEM_TRY_MS and answers with the Lite model ('+(Date.now()-t)+' ms)');
calls.length=0;plan=['slow','slow','slow'];t=Date.now();r=await call(req(GOOD),envT);
ok(r.s===504&&/troppo/.test(r.j.error.message)&&Date.now()-t<3800,'all slow: 504 in JSON within GEM_BUDGET, not a Cloudflare 524 ('+(Date.now()-t)+' ms, '+calls.length+' tries)');
ok(typeof AbortSignal.timeout==='function','AbortSignal.timeout exists');
// v68: «lettore» = un solo lettore, motivo vero
const reqL=(l,extra={})=>req(GOOD,{contents:[{parts:[{text:'leggi'},{inline_data:{mime_type:'image/jpeg',data:'QUJD'}}]}],generationConfig:{temperature:0},lettore:l,...extra});
calls.length=0;plan=['ok'];r=await call(reqL('lite'));
ok(r.s===200&&r.j.lettore==='lite'&&calls.length===1&&calls[0].m==='gemini-flash-lite-latest'&&!('lettore' in calls[0].body),'lettore lite: only Flash-Lite, answer says lettore:lite');
calls.length=0;plan=['429'];r=await call(reqL('flash'));
ok(r.s===429&&calls.length===1&&r.j.error.motivo==='limite'&&r.j.error.lettore==='flash'&&r.j.error.codice===429,'lettore flash busy: no retry, no other model, motivo limite ('+calls.length+' call)');
calls.length=0;plan=['slow'];t=Date.now();r=await call(reqL('flash'),envT);
ok(r.s===504&&r.j.error.motivo==='lento'&&Date.now()-t<1500,'lettore flash slow: 504 lento after GEM_TRY_MS');
r=await call(reqL('pro'));ok(r.s===400,'unknown lettore: 400');
calls.length=0;r=await call(reqL('cf'));ok(r.s===502&&r.j.error.motivo==='manca'&&calls.length===0,'lettore cf without the AI binding: 502 manca, Google not called');
const aiCalls=[];let aiPlan='ok';
const envAI={...env,CF_MS:'400',AI:{run:async(m,inp)=>{aiCalls.push({m,inp});if(aiPlan==='3040')throw new Error('3040: Capacity temporarily exceeded, please try again.');
  if(aiPlan==='4006')throw new Error('4006: you have used up your daily free allocation of 10,000 neurons');if(aiPlan==='slow')return new Promise(()=>{});return{response:'fornitore;codice\nDAC;1'}}}};
r=await call(reqL('cf'),envAI);
ok(r.s===200&&r.j.lettore==='cf'&&r.j.candidates[0].content.parts[0].text==='fornitore;codice\nDAC;1'&&aiCalls[0].m==='@cf/meta/llama-4-scout-17b-16e-instruct','lettore cf: Workers AI Llama 4 Scout, answer in Gemini format');
const ct=aiCalls[0].inp.messages[0].content;
ok(ct[0].type==='text'&&ct[0].text==='leggi'&&ct[1].image_url.url==='data:image/jpeg;base64,QUJD'&&aiCalls[0].inp.temperature===0,'lettore cf: text and photo passed as a chat message');
aiPlan='3040';r=await call(reqL('cf'),envAI);ok(r.s===503&&r.j.error.motivo==='sovraccarico','Workers AI 3040: 503 sovraccarico');
aiPlan='4006';r=await call(reqL('cf'),envAI);ok(r.s===429&&r.j.error.motivo==='limite','Workers AI 4006 (daily free quota): 429 limite');
aiPlan='slow';t=Date.now();r=await call(reqL('cf'),envAI);ok(r.s===504&&r.j.error.motivo==='lento'&&Date.now()-t<1500,'Workers AI slow: 504 lento after CF_MS');
calls.length=0;plan=['429','429','ok'];r=await call(req(GOOD),envAI);ok(r.s===200&&!('lettore' in r.j)&&calls.length===3,'without lettore (old apps, Chiedi a Jona): same chain as before');
r=await call(new Request('https://x/gemini',{method:'OPTIONS'}));ok(r.s===204&&/authorization/.test(r.h.get('access-control-allow-headers')),'preflight allows Authorization');
globalThis.fetch=realFetch;

/* 2. App */
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const srv={salute:0,body:null,auth:'',mode:'ok'};let direct=0;
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{direct++;r.fulfill({json:{candidates:[{content:{parts:[{text:'diretta'}]}}]}})});
await ctx.route('https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev/**',r=>{const u=r.request().url();
  if(u.endsWith('/salute')){srv.salute++;return r.fulfill({json:{ok:true,push:true,gemini:true}})}
  if(u.endsWith('/gemini')){srv.body=JSON.parse(r.request().postData()||'{}');srv.auth=r.request().headers()['authorization']||'';
    if(srv.mode==='403')return r.fulfill({status:403,json:{error:{message:'Telefono non collegato al ristorante'}}});
    if(srv.mode==='524'){srv.n524=(srv.n524||0)+1;return r.fulfill({status:524,contentType:'text/html',body:'<html>A timeout occurred</html>'})}
    if(srv.mode==='foto'){srv.parts.push(srv.body.contents[0].parts.length);srv.lett.push(srv.body.lettore);const k=srv.seq.shift()||'ok';
      if(k==='hold')return new Promise(res=>{srv.release=()=>{srv.cnt=(srv.cnt||0)+1;res(r.fulfill({json:{lettore:srv.body.lettore,candidates:[{content:{parts:[{text:'fornitore;codice;nome;unita;prezzo;categoria\nDAC;H;Tenuto;kg;1,00;Carne'}]}}]}}))}});
      if(k!=='ok')return r.fulfill({status:Number(k),contentType:'text/html',body:'<html>timeout</html>'});
      srv.cnt=(srv.cnt||0)+1;const n=srv.cnt;return r.fulfill({json:{lettore:srv.body.lettore,candidates:[{content:{parts:[{text:'```\nfornitore;codice;nome;unita;prezzo;categoria\nDAC;'+n+';Prodotto '+n+';kg;'+n+',50;Carne\n```'}]}}]}})}
    if(srv.mode==='429')return r.fulfill({status:429,json:{error:{message:'Resource exhausted'}}});
    return r.fulfill({json:{candidates:[{content:{parts:[{text:'dal server'}]}}]}})}
  r.fulfill({status:404,body:''})});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(0,4).join(' / ')));
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
ok(await pg.evaluate(()=>gemOn())===false,'local mode, no key: Gemini off');
ok(await pg.evaluate(async()=>(await gemCall({contents:[]})).err)==='Prima inserisci la chiave Gemini.'&&srv.salute===0,'local mode: server not asked');
// finta modalità Firebase pronta, gettone finto
await pg.evaluate(()=>{window._db=S.db;S.db=Object.assign(Object.create(S.db),{kind:'firebase',status:()=>({ready:true,pend:0})});const Q=new Proxy(function(){},{get:(t,k)=>k==='onSnapshot'?()=>()=>{}:k==='then'?undefined:()=>Q,apply:()=>Q});window.fbInit=()=>({auth:{currentUser:{getIdToken:async()=>'TOK123'}},fs:Q})});
const g=await pg.evaluate(async()=>gemCall({contents:[{parts:[{text:'quanto?'}]}],generationConfig:{temperature:0.2}}));
ok(g.txt==='dal server'&&srv.auth==='Bearer TOK123'&&srv.body.generationConfig.temperature===0.2&&direct===0,'no key on the phone: goes through /gemini with the Firebase token');
ok(srv.salute===1&&await pg.evaluate(()=>gemOn())===true,'/salute asked once, Gemini on');
await pg.evaluate(()=>gemCall({contents:[]}));ok(srv.salute===1,'/salute not asked again');
srv.mode='403';ok(/non è collegato al ristorante/.test((await pg.evaluate(()=>gemCall({contents:[]}))).err),'403: "not connected" message');
srv.mode='429';ok(/molto occupato/.test((await pg.evaluate(()=>gemCall({contents:[]}))).err),'429: "busy, retry in a minute" message');
srv.mode='524';const e524=await pg.evaluate(()=>gemCall({contents:[]}));
ok(e524.st===524&&/troppo a rispondere/.test(e524.err),'524 from Cloudflare: «troppo a rispondere» message ('+e524.err+')');
srv.mode='ok';
await pg.evaluate(()=>ls('jona_gemini_key','MIA'));const d=await pg.evaluate(()=>gemCall({contents:[]}));
ok(d.txt==='diretta'&&direct===1,'own key on the phone: still direct to Google');
const dl=await pg.evaluate(async()=>[await gemCall({contents:[]},'lite'),await gemCall({contents:[]},'cf')]);
ok(dl[0].txt==='diretta'&&dl[0].lettore==='lite'&&dl[1].salta===true&&direct===2,'v68 own key: Flash-Lite direct to Google, Cloudflare skipped (no server)');
await pg.evaluate(()=>ls('jona_gemini_key',null));
await pg.click('[data-a="jonaOpen"]');await pg.waitForTimeout(300);
ok(await pg.locator('.sheet .jona-key').count()===0&&await pg.locator('.sheet [data-a="jonaAsk"][disabled]').count()===0,'«Chiedi a Jona»: no key card, send enabled');
await pg.fill('#jona-q','Quanto ho speso?');await pg.click('.sheet [data-a="jonaAsk"]');await pg.waitForTimeout(400);
ok((await pg.locator('.sheet .jona-m.a').last().innerText()).includes('dal server')&&!!(srv.body.system_instruction&&srv.body.contents.length),'«Chiedi a Jona» answered by the server');
// v65: foto dei listini una per volta, seconda prova, foto già lette tenute
srv.mode='foto';srv.parts=[];srv.seq=[];srv.lett=[];
await pg.evaluate(()=>{GEM_PAUSA=50;window._ir=[];window.impRun=k=>window._ir.push([k,S.imp.txt]);S.imp={fid:'',stage:'foto',err:'',txt:'',photos:[new File(['a'],'a.jpg',{type:'image/jpeg'}),new File(['b'],'b.jpg',{type:'image/jpeg'})]};window.refreshSheet=()=>{}});
await pg.evaluate(()=>gemRun());
let ir=await pg.evaluate(()=>window._ir);
ok(srv.parts.join()==='2,2','two photos: two requests with one photo each ('+srv.parts.join()+')');
ok(ir.length===1&&ir[0][1]==='fornitore;codice;nome;unita;prezzo;categoria\nDAC;1;Prodotto 1;kg;1,50;Carne\nDAC;2;Prodotto 2;kg;2,50;Carne','tables joined: one header, no code fences');
ok(srv.lett.join()==='flash,flash','v68: each photo asks Gemini Flash first ('+srv.lett.join()+')');
srv.parts=[];srv.lett=[];srv.seq=['ok','524','503','429'];
await pg.evaluate(()=>{window._ir=[];S.imp.gres=null;S.imp.busy=false});await pg.evaluate(()=>gemRun());
let st=await pg.evaluate(()=>({err:S.imp.err,busy:S.imp.busy,ir:window._ir.length}));
ok(srv.parts.length===4&&srv.lett.join()==='flash,flash,lite,cf'&&st.ir===0&&!st.busy,'v68: photo 2 fails on all three readers, in order ('+srv.lett.join()+')');
ok(/^Foto 2 di 2: nessun lettore è riuscito/.test(st.err)&&/Gemini Flash: nessuna risposta in tempo \(errore 524\)/.test(st.err)&&/Gemini Flash-Lite: Google ha risposto «sovraccarico» \(errore 503\)/.test(st.err)&&/Cloudflare Llama 4: Cloudflare ha risposto «limite di richieste raggiunto» \(errore 429\)/.test(st.err)&&/già lette restano/.test(st.err),'v68: the error lists each reader with the real code ('+st.err+')');
srv.parts=[];srv.seq=['ok'];await pg.evaluate(()=>gemRun());
ir=await pg.evaluate(()=>window._ir);
ok(srv.parts.length===1&&ir.length===1&&/Prodotto 3/.test(ir[0][1])&&/Prodotto 4/.test(ir[0][1]),'second tap reads only the missing photo and keeps the first ('+srv.parts.length+' request)');
srv.parts=[];srv.seq=['503','ok'];await pg.evaluate(()=>{window._ir=[];S.imp.gres=null;S.imp.photos=S.imp.photos.slice(0,1)});await pg.evaluate(()=>gemRun());
ok(srv.parts.length===2&&(await pg.evaluate(()=>window._ir.length))===1,'one photo, 503 then ok: automatic second try');
const lett=await pg.evaluate(()=>S.rev&&S.rev.lett||S.imp.gnote);
ok(lett&&lett.length===1&&lett[0].l==='lite'&&lett[0].log[0].l==='flash'&&lett[0].log[0].st===503,'v68: note says Flash-Lite read it after Flash answered 503 ('+JSON.stringify(lett)+')');
// banner dal vivo: chi legge e contasecondi, poi motivo vero del passaggio
srv.parts=[];srv.lett=[];srv.seq=['503','hold'];
await pg.evaluate(()=>{window._ir=[];S.imp.gres=null;S.imp.busy=false;window.refreshSheet=()=>{const I=S.imp;let d=document.getElementById('gl');if(!d){d=document.createElement('div');d.id='gl';document.body.appendChild(d)}d.innerHTML=I&&I.busy?fotoStage(I):''}});
const run=pg.evaluate(()=>gemRun());
await pg.waitForFunction(()=>S.imp.glive&&S.imp.glive.l==='lite');await pg.waitForTimeout(2300);
const live=await pg.locator('#gl #gem-live').innerText();
ok(/✗ Gemini Flash: Google ha risposto «sovraccarico» \(errore 503\)/.test(live)&&/Legge Gemini Flash-Lite \(riserva veloce di Google\)/.test(live),'v68: live banner shows the real reason and who is reading now ('+live.replace(/\n/g,' / ')+')');
ok(Number(await pg.locator('#gem-sec').innerText())>=2,'v68: the seconds counter moves while reading');
srv.release();await run;
ok(await pg.evaluate(()=>!S.imp.busy&&!S.imp.glive&&window._ir.length===1),'v68: reading done, live state cleared');
await pg.evaluate(()=>{window.refreshSheet=()=>{}});
// server vecchio (senza «lettore» nella risposta): niente nome inventato, solo «Gemini»
ok(await pg.evaluate(()=>gemNome(''))==='Gemini','v68: an old server that does not say who read it is shown as plain «Gemini»');
// «Controlla e salva» mostra chi ha letto
await pg.evaluate(()=>{window._os=openSheet;openSheet=o=>{const d=document.createElement('div');d.className='sheet';d.id='rvt';d.innerHTML=o.render();document.body.appendChild(d)};S.rev={fonte:'2 foto lette',items:[],lett:[{l:'flash',log:[]},{l:'cf',log:[{l:'flash',st:504,sec:45},{l:'lite',st:429,sec:1}]}]};reviewSheet()});
const rv=await pg.locator('.sheet #rv-lett').innerText().catch(()=>'');
ok(/Foto 1: Gemini Flash/.test(rv)&&/Foto 2: Cloudflare Llama 4 — prima Gemini Flash: nessuna risposta in tempo \(errore 504\).*Gemini Flash-Lite: Google ha risposto «limite di richieste raggiunto» \(errore 429\)/.test(rv),'v68: «Controlla e salva» says who read each photo ('+rv.replace(/\n/g,' / ')+')');
await pg.evaluate(()=>{document.getElementById('rvt').remove();openSheet=window._os});
await pg.evaluate(()=>{S.db=window._db});
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
