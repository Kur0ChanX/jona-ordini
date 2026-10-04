// v16, modalità locale: ordine suggerito (storico + meteo finto), timbratura con QR (spenta di partenza, fotocamera finta
// che inquadra il QR vero, senza QR, mezzanotte, presenze in Excel), scambio turno (chiesto → accettato → approvato, rifiuto, annullo).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const KEY='TESTKEY12345';
const METEO={daily:{time:[0,1,2,3,4,5,6].map(i=>new Date(Date.now()+i*864e5).toISOString().slice(0,10)),weather_code:[0,61,63,3,0,1,80],temperature_2m_max:[24,21,20,23,26,27,22],precipitation_probability_max:[5,80,90,30,0,10,60]}};
const XLSX_LOCAL='/tmp/xlsx.full.min.js';
if(!existsSync(XLSX_LOCAL))execSync(`curl -s -o ${XLSX_LOCAL} https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`);
async function mkCtx(b,opts={}){
  const ctx=await b.newContext({viewport:{width:400,height:820},serviceWorkers:'block',...opts});
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  await ctx.route('https://api.open-meteo.com/**',r=>ctx._noMeteo?r.abort():r.fulfill({json:METEO}));
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/xlsx/**',r=>r.fulfill({contentType:'application/javascript',body:readFileSync(XLSX_LOCAL)}));
  return ctx;
}
async function setup(pg,errs){
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
}
const login=async(pg,u)=>{await pg.evaluate(()=>logout());await pg.waitForTimeout(200);await pg.fill('#li-u',u);await pg.fill('#li-p','password123');await pg.click('[data-a="doLogin"]');await pg.waitForTimeout(400)};

// QR del ristorante con un codice noto → video finto per la fotocamera
{const b0=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const c0=await mkCtx(b0);const p0=await c0.newPage();
  await p0.goto('http://localhost:8765/index.html');
  const url=await p0.evaluate(async k=>{await need('qr');const q=qrcode(0,'M');q.addData('JONA-TIMBRA:'+k);q.make();
    const im=new Image();im.src=q.createDataURL(10,4);await im.decode();const c=document.createElement('canvas');c.width=640;c.height=480;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,640,480);x.imageSmoothingEnabled=false;x.drawImage(im,140,60,360,360);return c.toDataURL('image/png')},KEY);
  writeFileSync('/tmp/tb-qr.png',Buffer.from(url.split(',')[1],'base64'));await b0.close();
  execSync('ffmpeg -v error -y -f image2 -loop 1 -i /tmp/tb-qr.png -t 2 -r 10 -pix_fmt yuv420p /tmp/tb-qr.y4m');}
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-video-capture=/tmp/tb-qr.y4m']});
let ctx=await mkCtx(b,{permissions:['camera']});let pg=await ctx.newPage();const errs=[];await setup(pg,errs);
const W=ms=>pg.waitForTimeout(ms);

/* 1. Ordine suggerito */
const F=await pg.evaluate(async()=>{S.viewAs='gm';const ps=prods();const f=ps[0].fornitoreId;const pp=ps.filter(p=>p.fornitoreId===f).slice(0,4);
  for(let i=0;i<8;i++){const t=Date.now()-(8-i)*3*864e5;await put('ordini','h'+i,{fornitoreId:f,fornitoreNome:forn(f).nome,stato:'inviato',inviato:t,creato:t,
    items:pp.map((p,j)=>({key:p.id,pid:p.id,nome:p.nome,unita:p.unita,prezzo:p.prezzo,qta:j+1+(i%2),da:[]})).slice(0,i%3===0?4:3)})}
  S.tab='invii';render();return{f,pids:pp.map(p=>p.id)}});
await W(300);
ok((await pg.locator('.sug-cta').innerText()).includes('Da riordinare'),'Invii: «Ordine suggerito» with suppliers to reorder');
await pg.click('[data-a="sugOpen"]');await W(400);
ok(await pg.locator('.sheet [data-a="sugF"]').count()===1&&await pg.locator('.sheet .row.dim').count()>=1,'supplier list: only suppliers with ≥2 orders are selectable');
await pg.click('.sheet [data-a="sugF"]');await W(400);
ok(await pg.locator('.sheet .sug-d').count()===3&&(await pg.locator('.sheet .sug-wxr').innerText()).includes('−10%'),'weather strip for 3 days, rain → −10%');
const q=()=>pg.evaluate(()=>Object.fromEntries(sugRows().map(r=>[r.pid,r.q])));
let Q=await q();
ok(Q[F.pids[1]]===3,'Ananas-like product: 0.81/day × 3 days × 0.9 → 3 ('+Q[F.pids[1]]+')');
ok(Q[F.pids[3]]===1.5,'kg product rounded to 0.5 ('+Q[F.pids[3]]+')');
await pg.click('.sheet [data-a="sugG"][data-v="1.5"]');await W(150);Q=await q();
ok(Q[F.pids[1]]===4,'«Evento» +50% → 4 ('+Q[F.pids[1]]+')');
await pg.click(`.sheet [data-a="sugQ"][data-d="1"][data-k="${F.pids[1]}"]`);await W(100);
await pg.click('.sheet [data-a="sugWx"][data-v="0"]');await W(100);Q=await q();
ok(Q[F.pids[1]]===5,'edited quantity stays when weather is ignored ('+Q[F.pids[1]]+')');
await pg.uncheck(`#sg-${F.pids[0]}`);await W(150);
ok((await pg.locator('.sheet [data-a="sugAdd"]').innerText()).includes('(3)'),'unchecked product not counted');
await pg.click('.sheet [data-a="sugAdd"]');await W(400);
const o=await pg.evaluate(f=>D().ordini['aperto_'+f],F.f);
ok(o&&o.items.length===3&&o.items.find(l=>l.pid===F.pids[1]).qta===5&&!o.items.find(l=>l.pid===F.pids[0]),'open order created with the 3 chosen products');
await pg.click('[data-a="sugOpen"]');await W(300);await pg.click('.sheet [data-a="sugF"]');await W(300);Q=await q();
ok(Q[F.pids[1]]===0||Q[F.pids[1]]===undefined||Q[F.pids[1]]<=1,'already in the open order: suggestion drops ('+Q[F.pids[1]]+')');
await pg.screenshot({path:'/tmp/v16-sug.png'});
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await W(300);

/* 2. Persone con orari pubblicati */
await pg.evaluate(async()=>{
  for(const [id,n,r] of [['u_luca','Luca','cucina'],['u_paolo','Paolo','cucina'],['u_sara','Sara','sala']])
    await put('staff',id,{nome:n,cognome:'Prova',username:n.toLowerCase(),ruolo:'staff',reparto:r,mansione:'Cuoco',stato:'attivo',pass:await sha(id+':password123'),creato:now(),contratto:{ore:40,pausa:30,liberi:2}});
  const L=orShift(orLun(),1);
  const t={u_luca:{1:'18:00-23:00',5:'10:00-15:00'},u_paolo:{1:'R',5:'R',2:'18:00-23:00'},u_sara:{5:'18:00-23:30'}};
  await put('config','orari_'+L,{tipo:'orari',lun:L,mod:now(),t,tp:clone(t),pub:now()});
});await W(300);

/* 3. Timbratura: spenta di partenza */
await login(pg,'luca');await pg.click('.nav button[data-v="orari"]');await W(300);
ok(await pg.locator('.tb-card').count()===0,'timbratura off by default: no «Timbra» for staff');
await login(pg,'mario');await pg.evaluate(()=>{S.viewAs='gm';render();settingsSheet()});await W(300);
ok((await pg.locator('.sheet').innerText()).includes('Timbratura con QR'),'settings: «Timbratura con QR» row');
await pg.click('.sheet [data-a="tbSet"][data-v="1"]');await W(300);await pg.click('#ask-ok');await W(400);
ok(await pg.evaluate(()=>cfg().timbra===true&&cfg().timbraK.length===12),'turned on, secret code created');
ok((await pg.locator('.sheet').innerText()).includes('QR da stampare'),'settings: «QR da stampare» when on');
await pg.evaluate(k=>put('config','app',Object.assign({},cfg(),{timbraK:k})),KEY);await W(200);
await pg.evaluate(()=>{while(sheets.length)closeSheet(true);tbQrSheet()});await W(800);
ok(await pg.locator('.sheet .tb-qr img').count()===1,'QR to print shown');
const dl=pg.waitForEvent('download');await pg.click('.sheet [data-a="tbQrDl"]');const d1=await dl;
ok(d1.suggestedFilename()==='qr-timbratura.png','QR downloadable as PNG to print');
// fotocamera negata: «Timbra senza QR»
await login(pg,'sara');await pg.click('.nav button[data-v="orari"]');await W(300);
ok(await pg.locator('.tb-card').count()===1,'staff: «Timbra» card when on');
await pg.evaluate(()=>{window.__gum=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('no','NotAllowedError'))});
await pg.click('[data-a="tbScan"]');await pg.waitForSelector('.sheet [data-a="tbManual"]',{timeout:5000}).catch(()=>{});
ok(await pg.locator('.sheet [data-a="tbManual"]').count()===1,'camera not available: «Timbra senza QR»');
await pg.click('.sheet [data-a="tbManual"]');await W(400);
await pg.evaluate(()=>{navigator.mediaDevices.getUserMedia=window.__gum});
const g0=await pg.evaluate(()=>(new Date().getDay()+6)%7),lun0=await pg.evaluate(()=>orLun());
let tb=await pg.evaluate(([l,g])=>({v:tbVal(l,'u_sara',g),m:((tbWeek(l)||{}).m||{}).u_sara}),[lun0,g0]);
ok(/^\d\d:\d\d-$/.test(tb.v)&&tb.m&&tb.m[g0]===1,'manual entry recorded and flagged: '+tb.v);
ok((await pg.locator('.tb-card').innerText()).includes('In servizio'),'card: «In servizio dalle …»');
// mezzanotte: entrata ieri alle 22, uscita oggi all'1
ok(await pg.evaluate(()=>{const y=new Date();y.setDate(y.getDate()-1);const L=orLun(y),G=(y.getDay()+6)%7;const w=S.data.config['timbr_'+L]||(S.data.config['timbr_'+L]={t:{}});w.t=w.t||{};
  w.t.u_x={[G]:'22:00-'};const d=new Date();d.setHours(1,0,0,0);const o=tbOpen('u_x',d);delete w.t.u_x;return!!o&&o.lun===L&&o.g===G}),'exit after midnight closes yesterday\'s entry');
// fotocamera finta con il QR vero: entrata e poi uscita
await login(pg,'luca');await pg.click('.nav button[data-v="orari"]');await W(300);
await pg.click('[data-a="tbScan"]');await pg.waitForFunction(()=>!document.querySelector('.sheet .tb-cam'),null,{timeout:8000}).catch(()=>{});await W(300);
tb=await pg.evaluate(([l,g])=>tbVal(l,'u_luca',g),[lun0,g0]);
ok(/^\d\d:\d\d-$/.test(tb),'QR read by the camera: entry '+tb);
ok(await pg.evaluate(([l,g])=>!(((tbWeek(l)||{}).m||{}).u_luca||{})[g],[lun0,g0]),'scanned entry is not flagged');
await pg.click('[data-a="tbScan"]');await pg.waitForFunction(()=>!document.querySelector('.sheet .tb-cam'),null,{timeout:8000}).catch(()=>{});await W(300);
tb=await pg.evaluate(([l,g])=>tbVal(l,'u_luca',g),[lun0,g0]);
ok(/^\d\d:\d\d-\d\d:\d\d$/.test(tb),'second scan: exit '+tb);
ok((await pg.locator('.tb-card').innerText()).includes('Oggi: '),'«Timbra» card shows today\'s punches');
// QR vecchio dopo «Cambia codice»
await login(pg,'mario');await pg.evaluate(()=>{S.viewAs='gm';put('config','app',Object.assign({},cfg(),{timbraK:'ALTRO0000000'}))});await W(200);
await login(pg,'paolo');await pg.click('.nav button[data-v="orari"]');await W(300);
await pg.click('[data-a="tbScan"]');await W(2500);
ok(await pg.locator('.sheet .tb-cam').count()===1&&!(await pg.evaluate(([l,g])=>tbVal(l,'u_paolo',g),[lun0,g0])),'old QR is refused');
await pg.click('.sheet [data-a="closeSheet"]');await W(300);
// pianificatore: timbrato nella casella e nei totali, presenze in Excel
await login(pg,'mario');await pg.evaluate(()=>{S.viewAs='gm';S.tab='staff';S.staffSub='orari';S.orW=orLun();render()});await W(300);
ok(await pg.locator('.or-c[data-u="u_luca"] .or-tb').count()>=1,'planner: punch shown in the cell');
ok(await pg.locator('.or-pc',{hasText:'Luca'}).locator('.or-tbh').count()===1,'planner: hours punched next to the name');
await pg.click('[data-a="tbXls"]');await W(300);
const dl2=pg.waitForEvent('download');await pg.click('.sheet [data-a="tbXlsGo"][data-v="0"]');const d2=await dl2;
ok(/^presenze_\d{4}-\d\d\.xlsx$/.test(d2.suggestedFilename()),'monthly attendance Excel: '+d2.suggestedFilename());
await pg.screenshot({path:'/tmp/v16-planner.png',fullPage:true});
await pg.evaluate(()=>put('config','app',Object.assign({},cfg(),{timbra:false})));await W(200);
ok(await pg.locator('.or-tb').count()===0,'turned off: punches hidden again');

/* 4. Scambio turno: Luca dà il suo sabato a Paolo e prende il suo mercoledì */
const L1=await pg.evaluate(()=>orShift(orLun(),1));
await login(pg,'luca');await pg.click('.nav button[data-v="orari"]');await W(300);
await pg.click('[data-a="orMy"][data-v="next"]');await W(300);
ok(await pg.locator('.or-day').nth(5).locator('[data-a="cmOpen"]').count()===1,'«Chiedi un cambio» on a day with a shift');
await pg.locator('.or-day').nth(5).locator('[data-a="cmOpen"]').click();await W(300);
await pg.click('.sheet [data-a="cmWho"][data-u="u_paolo"]');await W(150);
await pg.click('.sheet [data-a="cmG2"][data-v="2"]');await W(150);
const prev=await pg.locator('.sheet .cm-prev').innerText();
ok(prev.includes('Sab libero')||prev.includes('Sab Riposo'),'preview: after the swap Luca is off on Saturday');
await pg.click('.sheet [data-a="cmSend"]');await W(400);
let cs=await pg.evaluate(()=>cmAll());
ok(cs.length===1&&cs[0].stato==='chiesto'&&cs[0].g1===5&&cs[0].g2===2,'request stored in the published week');
ok(await pg.evaluate(()=>Object.values(D().notifiche).some(n=>n.a==='u_paolo'&&n.tipo==='cambio')),'Paolo notified');
await login(pg,'paolo');
ok((await pg.locator('.nav button[data-v="orari"] .badge').innerText())==='1','Paolo: badge on «Orari»');
await pg.click('.nav button[data-v="orari"]');await W(300);
await pg.click('[data-a="cmSi"]');await W(400);
cs=await pg.evaluate(()=>cmAll());
ok(cs[0].stato==='accettato'&&await pg.evaluate(()=>Object.values(D().notifiche).some(n=>n.a==='gestori'&&n.tipo==='cambio')),'accepted → managers notified');
await login(pg,'mario');await pg.evaluate(()=>{S.viewAs='gm';S.tab='staff';S.staffSub='orari';S.orW=orShift(orLun(),1);render()});await W(300);
ok(await pg.locator('.nav button[data-v="staff"] .badge').count()===1,'manager: badge on Staff');
ok((await pg.locator('.cm-box.gm').innerText()).includes('Regole rispettate'),'manager: swap box with rule check');
await pg.click('[data-a="cmApp"]');await W(500);
const w1=await pg.evaluate(L=>orWeek(L),L1);
ok(w1.tp.u_luca[5]==='R'&&w1.tp.u_paolo[5]==='10:00-15:00'&&w1.tp.u_luca[2]==='18:00-23:00'&&!w1.tp.u_paolo[2]&&w1.t.u_luca[5]==='R','approved: both days swapped in draft and published copy');
ok(w1.cambi[Object.keys(w1.cambi)[0]].stato==='approvato'&&await pg.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='cambio'&&n.titolo.includes('approvato')).length===2),'status approved, both notified');
// rifiuto del collega e annullo
await login(pg,'luca');await pg.click('.nav button[data-v="orari"]');await W(300);await pg.click('[data-a="orMy"][data-v="next"]');await W(300);
await pg.locator('.or-day').nth(1).locator('[data-a="cmOpen"]').click();await W(300);
await pg.click('.sheet [data-a="cmWho"][data-u="u_sara"]');await pg.click('.sheet [data-a="cmSend"]');await W(400);
await pg.click('[data-a="cmAnn"]');await W(300);
ok(await pg.evaluate(()=>cmAll().some(c=>c.a==='u_sara'&&c.stato==='annullato')),'requester can cancel');
await pg.screenshot({path:'/tmp/v16-staff.png',fullPage:true});
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
