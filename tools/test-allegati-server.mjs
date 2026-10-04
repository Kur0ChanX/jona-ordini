// v26: /allegati del Worker con D1 finto (node:sqlite) e Firestore finto: solo membri, tipi e dimensioni,
// database più vuoto, tetto con cancellazione dei più vecchi, pulizia dei 60 giorni (cron), /allegati/spazio.
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
// i file viaggiano in base64: n = lunghezza del testo
const up=(tok,type,n,e=env)=>worker.fetch(new Request('https://x/allegati',{method:'POST',headers:{'content-type':'text/plain','x-tipo':type,...(tok?{authorization:'Bearer '+tok}:{})},body:'QUJD'.repeat(n/4)}),e);
const get=(tok,id,e=env)=>worker.fetch(new Request('https://x/allegati/'+id,{headers:tok?{authorization:'Bearer '+tok}:{}}),e);

let r=await worker.fetch(new Request('https://x/salute'),env);ok((await r.json()).allegati===2,'/salute: allegati = 2 databases');
r=await worker.fetch(new Request('https://x/salute'),{});ok((await r.json()).allegati===0,'/salute without D1: 0');
ok((await up('', 'image/jpeg',100)).status===403,'no token: 403');
ok((await up(OUT,'image/jpeg',100)).status===403,'not a member: 403');
ok((await up(WAIT,'image/jpeg',100)).status===403,'phone waiting for approval: 403');
ok((await up(GOOD,'image/jpeg',100,{FB_PROJECT:'jona-ordini'})).status===503,'no D1 bound: 503');
ok((await up(GOOD,'text/html',100)).status===415,'html refused (415)');
ok((await up(GOOD,'image/jpeg',0)).status===400,'empty file refused');
ok((await up(GOOD,'image/jpeg',1900000)).status===413,'1.9 MB of text refused (413)');
ok((await worker.fetch(new Request('https://x/allegati',{method:'POST',headers:{'x-tipo':'image/jpeg',authorization:'Bearer '+GOOD,'content-length':'5000000'},body:'QUJD'}),env)).status===413,'declared size too big: 413 before reading');
r=await up(GOOD,'image/webp',150000);let j=await r.json();ok(r.status===200&&/^0-[A-Za-z0-9_-]{20}$/.test(j.id)&&j.dim===150000,'photo saved in database 0: '+j.id);
const id1=j.id;
r=await up(GOOD,'audio/mp4;codecs=mp4a.40.2',60000);j=await r.json();ok(j.id.startsWith('1-'),'next file goes to the emptier database 1');
const id2=j.id;
r=await get(GOOD,id1);const txt=await r.text();
ok(r.status===200&&r.headers.get('x-tipo')==='image/webp'&&/^text\/plain/.test(r.headers.get('content-type'))&&txt==='QUJD'.repeat(37500),'download: same base64 text, type in x-tipo, served as text');
ok(/immutable/.test(r.headers.get('cache-control'))&&r.headers.get('access-control-allow-origin')==='*','download: cacheable, CORS');
r=await get(GOOD,id2);ok(r.headers.get('x-tipo')==='audio/mp4','audio type kept without codecs');
ok((await get(OUT,id1)).status===403,'download by a stranger: 403');
ok((await get(GOOD,'0-AAAAAAAAAAAAAAAAAAAA')).status===404,'missing file: 404');
ok((await get(GOOD,'9-AAAAAAAAAAAAAAAAAAAA')).status===404,'unknown database: 404');
ok((await get(GOOD,"0-x' OR 1=1")).status===404,'odd id: 404');
const row=A0.raw.prepare('SELECT da, creato FROM f WHERE id=?').get(id1);ok(row.da==='uidMembro123'&&Math.abs(row.creato-Date.now())<5000,'author uid and time saved');
r=await worker.fetch(new Request('https://x/allegati/spazio',{headers:{authorization:'Bearer '+GOOD}}),env);j=await r.json();
ok(j.file===2&&j.usato===210000&&j.tetto===880000000&&j.giorni===60,'space: 2 files, 210000 bytes, cap 880 MB');
// tetto: riempio il database 0 fino a sfiorare 440 MB con righe finte, poi un nuovo file cancella le più vecchie
for(const D of [A0,A1]){D.raw.exec('DELETE FROM f');const ins=D.raw.prepare('INSERT INTO f VALUES (?,?,?,?,?,?)');
  for(let i=0;i<440;i++)ins.run((D===A0?'0':'1')+'-vecchio'+String(i).padStart(13,'0'),'image/jpeg',1000000,1000+i,'u','QUJD')}
r=await up(GOOD,'image/jpeg',1500000);j=await r.json();ok(r.status===200,'full databases: upload still works');
const D=j.id.startsWith('0-')?A0:A1;const left=D.raw.prepare('SELECT COUNT(*) n, SUM(dim) b, MIN(creato) m FROM f').get();
ok(left.b<=440000000&&left.n===439&&left.m===1002,'two oldest files removed to stay under the cap ('+left.n+' files, '+left.b+' bytes)');
// pulizia notturna
A1.raw.exec('DELETE FROM f');A1.raw.prepare('INSERT INTO f VALUES (?,?,?,?,?,?)').run('1-vecchissimo000000000','image/jpeg',10,Date.now()-61*864e5,'u','QUJD');
A1.raw.prepare('INSERT INTO f VALUES (?,?,?,?,?,?)').run('1-recente00000000000000','image/jpeg',10,Date.now()-59*864e5,'u','QUJD');
const waits=[];await worker.scheduled({},env,{waitUntil:p=>waits.push(p)});await Promise.all(waits);
ok(A1.raw.prepare('SELECT GROUP_CONCAT(id) i FROM f').get().i==='1-recente00000000000000','cron: files older than 60 days removed, recent kept');
r=await worker.fetch(new Request('https://x/allegati',{method:'OPTIONS'}),env);ok(r.status===204,'preflight ok');
