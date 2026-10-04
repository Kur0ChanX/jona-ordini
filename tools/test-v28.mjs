// v28 (modalità locale): vocali leggibili anche su iPhone.
// Scelta del formato (Chrome Android → AAC con WebCodecs, iPhone → MP4, MP4 «semplice» di Chrome scartato perché contiene Opus),
// file .aac con intestazioni ADTS giuste (codificatore finto: il Chromium di Playwright non ha l'AAC), lettore sbloccato al tocco,
// barra con la durata del messaggio, messaggio chiaro per un vocale illeggibile.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const ANDROID='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const mk=async ua=>{const ctx=await b.newContext({viewport:{width:360,height:740},serviceWorkers:'block',userAgent:ua});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html');return pg};
// codificatore AAC finto: ogni AudioData diventa un pezzo di 100 + n byte
const FAKE_ENC=()=>{let n=0;window.AudioEncoder=class{constructor(o){this.o=o;this.state='unconfigured'}
  static async isConfigSupported(c){return{supported:c.codec==='mp4a.40.2'}}
  configure(c){window.__cfg=c;this.state='configured'}
  encode(ad){const len=100+(n++%5);this.o.output({byteLength:len,copyTo:d=>d.fill(0xAB)})}
  async flush(){}}};

// 1. Android (Chrome): MediaRecorder dice sì a «audio/mp4» ma no a mp4a.40.2 → AAC con WebCodecs
const A=await mk(ANDROID);
await A.evaluate(FAKE_ENC);
const ra=await A.evaluate(async()=>{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mp4=MediaRecorder.isTypeSupported('audio/mp4'),aac=MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2');
  const R=aacRec(st);let blob=null;R.ondataavailable=e=>{blob=e.data};const done=new Promise(r=>{R.onstop=r});
  await new Promise(r=>setTimeout(r,1500));R.stop();await done;st.getTracks().forEach(t=>t.stop());
  const u=new Uint8Array(await blob.arrayBuffer());let i=0,fr=0,bad=0,sfi=-1,ch=-1;
  while(i<u.length){if(u[i]!==0xFF||u[i+1]!==0xF1){bad++;break}const len=(u[i+3]&3)<<11|u[i+4]<<3|u[i+5]>>5;sfi=u[i+2]>>2&15;ch=(u[i+2]&1)<<2|u[i+3]>>6;
    if((u[i+2]>>6)!==1)bad++;if(len!==7+100+(fr%5))bad++;i+=len;fr++}
  return{mp4,aac,type:blob.type,fr,bad,end:i===u.length,sfi,ch,cfg:window.__cfg,apple:chApple(),ok:await aacOk()}});
ok(ra.mp4&&!ra.aac,'Chromium: plain audio/mp4 yes, mp4a.40.2 no (the trap)');
ok(!ra.apple&&ra.ok,'Android: not Apple, AAC encoder available');
ok(ra.type==='audio/aac'&&ra.fr>5&&ra.bad===0&&ra.end,`.aac file with ${ra.fr} valid ADTS frames`);
ok(ra.sfi===[96000,88200,64000,48000,44100,32000,24000,22050,16000,12000,11025,8000,7350].indexOf(ra.cfg.sampleRate)&&ra.ch===ra.cfg.numberOfChannels,`ADTS header: ${ra.cfg.sampleRate} Hz, ${ra.ch} channel(s)`);

// 2. che formato sceglie chRec (MediaRecorder spiato)
const pick=async(pg,sup)=>pg.evaluate(async sup=>{
  const M=window.MediaRecorder;let used=null;
  window.MediaRecorder=class extends M{constructor(s,o){super(s);used=(o&&o.mimeType)||''}static isTypeSupported(t){return sup.includes(t)}};
  S.chat={c:'tutti',draft:{},pick:false,stick:true};window.chPaint=()=>{};
  const AE=window.AudioEncoder;
  await chRec();const R=S.chat.rec;const kind=R?(R.mr instanceof M?'mr:'+used:'aac'):'none';
  chRecStop(false);await new Promise(r=>setTimeout(r,300));window.MediaRecorder=M;S.chat=null;return kind},sup);
const CHROME=['audio/mp4','audio/mp4;codecs=opus','audio/webm;codecs=opus','audio/webm'];
ok(await pick(A,CHROME)==='aac','Android Chrome without AAC recorder → WebCodecs AAC');
ok(await pick(A,[...CHROME,'audio/mp4;codecs=mp4a.40.2'])==='mr:audio/mp4;codecs=mp4a.40.2','Android Chrome with AAC recorder → MediaRecorder mp4a.40.2');
await A.evaluate(()=>{delete window.AudioEncoder});
ok(await pick(A,CHROME)==='mr:audio/webm;codecs=opus','no AAC at all → WebM/Opus, never Opus inside MP4');
const I=await mk(IPHONE);
ok(await I.evaluate(()=>chApple()),'iPhone recognised');
ok(await pick(I,['audio/mp4'])==='mr:audio/mp4','iPhone → plain MP4 (AAC on Safari)');

// 3. ascolto: lettore sbloccato con il silenzio dentro il tocco, poi il vocale scaricato
const wav=(sec)=>{const n=8000*sec,h=new DataView(new ArrayBuffer(44));const w=(o,s)=>[...s].forEach((c,i)=>h.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF');h.setUint32(4,36+n,true);w(8,'WAVEfmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);h.setUint32(24,8000,true);h.setUint32(28,8000,true);h.setUint16(32,1,true);h.setUint16(34,8,true);w(36,'data');h.setUint32(40,n,true);
  return[...new Uint8Array(h.buffer)].concat(Array(n).fill(128))};
const P=await mk(ANDROID);
await P.evaluate(([w])=>{
  window.__srcs=[];const d=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');
  Object.defineProperty(HTMLMediaElement.prototype,'src',{get(){return d.get.call(this)},set(v){window.__srcs.push(v.slice(0,15));d.set.call(this,v)}});
  window.__toasts=[];window.toast=(m)=>window.__toasts.push(m);window.chPaint=()=>{};
  window.algGet=id=>new Promise(r=>setTimeout(()=>r(URL.createObjectURL(new Blob([id==='0-ok'?new Uint8Array(w):new Uint8Array(2000).fill(7)],{type:id==='0-ok'?'audio/wav':'audio/mp4'}))),1200));
  const bt=document.createElement('button');bt.id='pl';bt.onclick=()=>chPlay(window.__id);document.body.appendChild(bt);window.__id='0-ok'},[wav(2)]);
await P.click('#pl',{force:true});await P.waitForTimeout(1800);
const r1=await P.evaluate(()=>({srcs:window.__srcs,pl:!!ALG.pl,paused:ALG.au.paused,t:ALG.au.currentTime,toasts:window.__toasts}));
ok(r1.srcs[0]==='data:audio/wav;'&&/^blob:/.test(r1.srcs[1]),'silence first (inside the tap), then the voice message: '+r1.srcs.join(' | '));
ok(r1.pl&&!r1.paused&&r1.t>0&&!r1.toasts.length,'voice message playing after a 1.2 s download');
await P.click('#pl',{force:true});await P.waitForTimeout(200);
ok(await P.evaluate(()=>ALG.au.paused),'second tap pauses');
await P.evaluate(()=>{ALG.pl.a.pause();ALG.pl=null;window.__id='0-bad'});
await P.click('#pl',{force:true});await P.waitForTimeout(2000);
const r2=await P.evaluate(()=>({pl:ALG.pl,toasts:window.__toasts}));
ok(!r2.pl&&r2.toasts.some(t=>/formato che questo telefono non legge.*rimandarlo/.test(t)),'unreadable file → clear message: '+r2.toasts.join(' | '));
// barra con la durata del messaggio quando il file non la dice (.aac)
const bar=await P.evaluate(()=>{const box=document.createElement('div');box.innerHTML='<span data-au="z"><button class="cht-play"></button><span class="cht-bar"><i></i></span><span class="cht-dur"></span></span>';
  const save=CHAT.box;CHAT.box=box;const a={paused:false,currentTime:1,duration:Infinity};ALG.pl={id:'z',a,dur:4};chAuPaint('z');const w=box.querySelector('i').style.width;CHAT.box=save;ALG.pl=null;return w});
ok(bar==='25%','progress bar uses the message length when duration is unknown: '+bar);

// 4. indietro del telefono: un passo alla volta (foglio → scheda precedente), chat (conversazione → lista → chiusa), poi esce
const G=await mk(ANDROID);
await G.goto('about:blank');await G.goto('http://localhost:8765/index.html');
await G.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await G.fill(`input[data-k="${k}"]`,v);
await G.click('[data-a="setupGo"]');await G.waitForSelector('.testbar');await G.waitForTimeout(400);
const tab=()=>G.evaluate(()=>S.tab),sh=()=>G.evaluate(()=>sheets.length),back=async()=>{await G.evaluate(()=>history.back());await G.waitForTimeout(500)};
const t0=await tab();
await G.click('nav [data-a="tab"][data-v="staff"]');await G.waitForTimeout(300);
await G.click('[data-a="addProfile"]');await G.waitForTimeout(400);
ok(await sh()===1&&await tab()==='staff','sheet open on Staff');
await back();
ok(await sh()===0&&await tab()==='staff'&&G.url().includes('index.html'),'back → closes only the sheet');
await back();
ok(await tab()===t0&&G.url().includes('index.html'),'back → previous tab ('+t0+')');
await G.click('[data-a="chatOpen"]');await G.waitForTimeout(500);
await G.click('[data-a="chGo"]');await G.waitForTimeout(400);
ok(await G.evaluate(()=>!!(S.chat&&S.chat.c)),'conversation open');
await back();
ok(await G.evaluate(()=>!!(S.chat&&!S.chat.c&&CHAT.box)),'back → chat list');
await back();
ok(await G.evaluate(()=>!CHAT.box),'back → chat closed, still in the app');
// chiusura con la X: la voce in più si toglie da sola, il gesto dopo esce dall'app
await G.click('nav [data-a="tab"][data-v="staff"]');await G.waitForTimeout(300);await G.evaluate(()=>{NAV.tabs=[]});
await G.click('[data-a="addProfile"]');await G.waitForTimeout(400);await G.click('.sheet [data-a="closeSheet"]');await G.waitForTimeout(600);
ok(await G.evaluate(()=>!NAV.trap&&!NAV.skip),'closing with X removes the extra history entry');
await back();
ok(G.url()==='about:blank','nothing left to close → back leaves the app');
ok(await P.evaluate(()=>NEWS[0].v===28&&APP_VER===28),'version 28 with news');
for(const [n,pg] of [['android',A],['iphone',I],['player',P],['back',G]])ok(!pg.errs.length,n+': no page errors '+pg.errs.join('; '));
await b.close();
