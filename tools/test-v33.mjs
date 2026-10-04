// v33 (modalità locale): vocali inviati da iPhone. MediaRecorder finto «alla Safari»: solo «audio/mp4», mimeType «video/mp4»,
// nessun pezzo durante la registrazione e l'unico pezzo che arriva DOPO l'evento «stop»; poi Safari che ignora i 24 kbps (file grosso).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const ctx=await b.newContext({viewport:{width:360,height:740},serviceWorkers:'block',userAgent:IPHONE});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/index.html');

// 1. tipo del file per il server
const ty=await pg.evaluate(()=>[chAuType('video/mp4','audio/mp4;codecs=mp4a.40.2'),chAuType('','audio/mp4'),chAuType('audio/mp4; codecs=mp4a.40.2',''),chAuType('','') ,chAuType('audio/webm;codecs=opus','')]);
ok(ty.join()==='audio/mp4,audio/mp4,audio/mp4,audio/mp4,audio/webm','tipo normalizzato: '+ty.join());

// 2. registrazione «alla Safari»
const rec=(pg,o)=>pg.evaluate(async o=>{
  class SafariMR{constructor(st,opt){this.st=st;this.state='inactive';this.opt=opt}
    static isTypeSupported(t){return t==='audio/mp4'}
    get mimeType(){return 'video/mp4'}
    start(ts){this.state='recording';this.t0=Date.now();if(o.chunk)this.iv=setInterval(()=>this.ondataavailable&&this.ondataavailable({data:new Blob([new Uint8Array(o.chunk)])}),200)}
    stop(){clearInterval(this.iv);this.state='inactive';const n=o.last;setTimeout(()=>{this.onstop&&this.onstop();setTimeout(()=>this.ondataavailable&&this.ondataavailable({data:new Blob([new Uint8Array(n)])}),60)},10)}}
  const M=window.MediaRecorder;window.MediaRecorder=SafariMR;const sent=[],toasts=[];
  const cf=window.chFile,tt=window.toast;window.chFile=(tipo,blob,x)=>sent.push({tipo,type:blob.type,size:blob.size,dur:x.dur});window.toast=(m,k)=>toasts.push(m);
  S.chat={c:'tutti',draft:{},pick:false,stick:true};window.chPaint=()=>{};
  await chRec();const R=S.chat.rec;
  await new Promise(r=>setTimeout(r,o.ms));if(!R.done)chRecStop(true);await new Promise(r=>setTimeout(r,700));
  window.MediaRecorder=M;window.chFile=cf;window.toast=tt;S.chat=null;return{sent,toasts,auto:o.ms>3000}},o);
const r1=await rec(pg,{ms:1600,last:5000});
ok(r1.sent.length===1&&!r1.toasts.length,'vocale con il pezzo arrivato dopo «stop» inviato (prima: «Vocale non registrato») '+JSON.stringify(r1));
ok(r1.sent[0]&&r1.sent[0].type==='audio/mp4','tipo inviato audio/mp4 anche se Safari dice video/mp4');
// 3. Safari che ignora i 24 kbps: 200 KB ogni 200 ms → si ferma da solo sotto 1,3 MB e parte
const r2=await rec(pg,{ms:5000,chunk:200000,last:1000});
ok(r2.sent.length===1&&r2.sent[0].size<=1.3e6&&!r2.toasts.length,'vocale grosso fermato e inviato da solo: '+JSON.stringify(r2.sent));
// 4. errore del server con il codice nel messaggio
const t=await pg.evaluate(async()=>{const tt=window.toast,ms=[];window.toast=m=>ms.push(m);const au=window.algUp,me=S.me;
  D().staff.zz_t={id:'zz_t',nome:'Prova'};S.me='zz_t';window.algUp=async()=>{throw Object.assign(new Error('x'),{status:415})};
  await chFile('audio',new Blob([new Uint8Array(10)],{type:'audio/mp4'}),{c:'tutti',dur:3});
  window.algUp=async()=>{throw Object.assign(new Error('x'),{status:413})};
  await chFile('audio',new Blob([new Uint8Array(10)],{type:'audio/mp4'}),{c:'tutti',dur:3});
  window.toast=tt;window.algUp=au;S.me=me;delete D().staff.zz_t;return ms});
ok(/errore 415/.test(t[0])&&/troppo lungo/.test(t[1]),'messaggi d\'errore: '+t.join(' | '));
ok(await pg.evaluate(()=>APP_VER>=33),'APP_VER >= 33');
ok(!errs.length,'nessun errore nella pagina '+errs.join(';'));
await b.close();
