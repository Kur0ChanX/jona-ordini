// S3 (v49): /errori del Worker (scatola nera) con D1 finto: solo membri, salva, legge gli ultimi, tetto, pulizia dei 30 giorni (cron).

import worker from '../worker/src/index.js';
import { DatabaseSync } from 'node:sqlite';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b64u=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt=p=>b64u({alg:'RS256'})+'.'+b64u(p)+'.firma';
const T0=Math.floor(Date.now()/1000);
const GOOD=jwt({sub:'uidMembro123',exp:T0+3600}),OUT=jwt({sub:'uidEstraneo1',exp:T0+3600}),WAIT=jwt({sub:'uidAttesa123',exp:T0+3600});
globalThis.fetch=async(url,init={})=>{url=String(url);const tok=(init.headers.authorization||'').slice(7);
  if(tok===WAIT)return new Response(JSON.stringify({fields:{ok:{booleanValue:false}}}),{status:200});
  return new Response('{}',{status:tok===GOOD&&url.endsWith('/membri/uidMembro123')?200:403})};
// D1 finto con la stessa interfaccia (prepare/bind/first/all/run, batch)
function d1(){const db=new DatabaseSync(':memory:');let reads=0;
  const st=(sql,args=[])=>({bind:(...a)=>st(sql,a),
    first:async()=>{reads++;return db.prepare(sql).get(...args.map(v=>v instanceof ArrayBuffer?new Uint8Array(v):v))??null},
    all:async()=>({results:db.prepare(sql).all(...args)}),
    run:async()=>{db.prepare(sql).run(...args.map(v=>v instanceof ArrayBuffer?new Uint8Array(v):v));return{success:true}}});
  return{prepare:sql=>st(sql),batch:async l=>{for(const s of l)await s.run()},raw:db,get reads(){return reads}}}
const A0=d1(),A1=d1();const env={ALLEGATI0:A0,ALLEGATI1:A1,FB_PROJECT:'jona-ordini'};
const post=(tok,body,e=env)=>worker.fetch(new Request('https://x/errori',{method:'POST',headers:{'content-type':'application/json',...(tok?{authorization:'Bearer '+tok}:{})},body:JSON.stringify(body)}),e);
const get=(tok,e=env)=>worker.fetch(new Request('https://x/errori',{headers:tok?{authorization:'Bearer '+tok}:{}}),e);
ok((await post('',{e:[{m:'x'}]})).status===403,'senza gettone: 403');
ok((await post(OUT,{e:[{m:'x'}]})).status===403,'non membro: 403');
ok((await post(WAIT,{e:[{m:'x'}]})).status===403,'telefono in attesa: 403');
ok((await get(OUT)).status===403,'lettura da non membro: 403');
ok((await post(GOOD,{e:[{m:'x'}]},{FB_PROJECT:'jona-ordini'})).status===503,'senza D1: 503');
ok((await post(GOOD,{})).status===400,'richiesta vuota: 400');
let r=await post(GOOD,{e:[{m:'TypeError: a is undefined',s:'at f (index.html:10)',v:'49',u:'mario',p:'staff',n:3,t:Date.now()-1000},{m:'secondo',v:'49'}]});
ok(r.status===200,'membro: errori salvati');
r=await get(GOOD);let j=await r.json();
ok(j.e.length===2&&j.e[0].m==='secondo'&&j.e[1].m==='TypeError: a is undefined'&&j.e[1].n===3&&j.e[1].u==='mario'&&j.e[1].p==='staff','lettura: ultimi per primi, con conteggio, persona e scheda');
await post(GOOD,{e:[{m:'lungo'.repeat(300),s:'z'.repeat(5000)}]});
j=await (await get(GOOD)).json();ok(j.e[0].m.length===500&&j.e[0].s.length===1500,'testi lunghi tagliati');
for(let i=0;i<5;i++)await post(GOOD,{e:Array.from({length:12},(_,k)=>({m:'raffica '+i+'-'+k}))});
ok(A0.raw.prepare('SELECT COUNT(*) c FROM err').get().c===53,'al massimo 10 errori per invio');
A0.raw.prepare('UPDATE err SET t=? WHERE m=?').run(Date.now()-31*864e5,'secondo');
const att=[];await worker.scheduled({cron:'0 3 * * *'},env,{waitUntil:p=>att.push(p)});await Promise.all(att);
ok(!A0.raw.prepare("SELECT COUNT(*) c FROM err WHERE m='secondo'").get().c,'cron: errori oltre 30 giorni cancellati');
