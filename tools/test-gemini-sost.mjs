// v118 (D56): Google ha spento Gemini 2.5 per le chiavi nuove (404 «no longer available to new users»).
// f25/l25 → Flash/Flash-Lite nuovi con thinkingLevel minimal (400 → senza), 404 ricordato in jona_gem404 (Gemini finto, chiave del telefono).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
let SPENTI=['gemini-2.5-flash','gemini-2.5-flash-lite'],NO_TL=false,ALTRO404=false;const corpi=[];
const no=(st,m)=>({status:st,contentType:'application/json',body:JSON.stringify({error:{message:m}})});
await ctx.route('https://generativelanguage.googleapis.com/**',r=>{
  const bo=JSON.parse(r.request().postData()||'{}'),tc=(bo.generationConfig||{}).thinkingConfig||null;
  const m=(r.request().url().match(/models\/([^:]+):/)||[])[1];corpi.push({m,tc:tc&&JSON.stringify(tc)});
  if(ALTRO404)return r.fulfill(no(404,'Requested entity was not found.'));
  if(SPENTI.includes(m))return r.fulfill(no(404,'This model models/'+m+' is no longer available to new users. Please update your code to use models/gemini-3.8-flash'));
  if(NO_TL&&tc&&tc.thinkingLevel)return r.fulfill(no(400,'thinking level not supported'));
  r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:'letto da '+m}]}}]})})});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
await pg.goto('http://localhost:8765/index.html');
await pg.evaluate(()=>{ls('jona_gemini_key','finta');ls('jona_gem404',null)});
const chiama=l=>pg.evaluate(l=>gemCall({contents:[{parts:[{text:'ciao'}]}],generationConfig:{temperature:0}},l).then(r=>({txt:r.txt||'',l:r.lettore||'',st:r.st||0})),l);

// 1) f25 spento → stessa richiesta al Flash nuovo con thinkingLevel minimal
let r=await chiama('f25');
ok(r.txt==='letto da gemini-flash-latest'&&r.l==='flash','f25 spento (404) → letto da gemini-flash-latest, lettore «flash» '+JSON.stringify(r));
ok(corpi.length===2&&corpi[0].m==='gemini-2.5-flash'&&corpi[1].m==='gemini-flash-latest'&&/"thinkingLevel":"minimal"/.test(corpi[1].tc),'f25: prima 2.5 Flash, poi Flash nuovo con thinkingLevel minimal '+JSON.stringify(corpi));
ok(await pg.evaluate(()=>!!(ls('jona_gem404')||{}).f25&&ERR.list.concat(ERR.q).some(e=>/Google ha spento Gemini 2\.5 Flash per questa chiave: passo a Gemini Flash/.test(JSON.stringify(e)))),'404 ricordato in jona_gem404 + riga nella scatola nera');

// 2) seconda lettura: niente giro perso sul 2.5
corpi.length=0;r=await chiama('f25');
ok(r.txt==='letto da gemini-flash-latest'&&corpi.length===1&&corpi[0].m==='gemini-flash-latest','seconda lettura: va diretta al Flash nuovo '+JSON.stringify(corpi));

// 3) l25 spento → Flash-Lite nuovo
corpi.length=0;r=await chiama('l25');
ok(r.txt==='letto da gemini-flash-lite-latest'&&r.l==='lite'&&corpi.length===2,'l25 spento → gemini-flash-lite-latest '+JSON.stringify(corpi));

// 4) Google rifiuta thinkingLevel (400) → stessa richiesta senza thinkingConfig
corpi.length=0;NO_TL=true;r=await chiama('f25');NO_TL=false;
ok(r.txt==='letto da gemini-flash-latest'&&corpi.length===2&&corpi[1].tc===null,'400 su thinkingLevel → senza thinkingConfig '+JSON.stringify(corpi));

// 5) dopo 7 giorni si riprova il 2.5 (se Google lo riaccende, torna lui)
await pg.evaluate(()=>ls('jona_gem404',{f25:Date.now()-8*864e5}));
SPENTI=[];corpi.length=0;r=await chiama('f25');
ok(r.txt==='letto da gemini-2.5-flash'&&corpi.length===1&&/"thinkingBudget":0/.test(corpi[0].tc),'dopo 7 giorni riprova il 2.5 (thinkingBudget 0) '+JSON.stringify(corpi));

// 6) un 404 che non parla del modello non cambia lettore
await pg.evaluate(()=>ls('jona_gem404',null));
ALTRO404=true;corpi.length=0;r=await chiama('f25');ALTRO404=false;
ok(r.st===404&&!r.txt&&corpi.every(c=>c.m==='gemini-2.5-flash')&&await pg.evaluate(()=>!ls('jona_gem404')),'404 senza «model» → nessun cambio '+JSON.stringify(corpi));

// 7) lettori senza sostituto (cf, flash) invariati
ok(await pg.evaluate(()=>!GEM_SOST.cf&&!GEM_SOST.flash),'cf e flash senza sostituto');
ok(errs.length===0,'no pageerror '+JSON.stringify(errs));
await b.close();
console.log(process.exitCode?'SOME FAIL':'ALL PASS');
