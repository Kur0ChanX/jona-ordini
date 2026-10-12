// v96 (D45): su iPhone l'app ripartiva dopo la foto del vino (foto da 12-48 MP tenuta a grandezza piena).
// Controlla fotoPiccola (foto ridotta e girata secondo l'EXIF, anche con createImageBitmap che ignora le opzioni o l'orientamento),
// la miniatura, la foto mandata all'IA ≤ 2000 px e la bozza del vino ripresa dopo una ricarica (con e senza foto, fotocamera aperta,
// bozza vecchia, Chiudi). Gira su PC, tablet e telefono Android (Chromium) e su Mac, iPhone, iPad (WebKit: solo dove è installato).
import { chromium, webkit, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
const FOTO='tools/foto-prova/vino-or6.jpg'; // 4000×3000, EXIF orientamento 6: dritta è 3000×4000 con il rosso in alto
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let wkPath='';try{wkPath=webkit.executablePath()}catch(e){}
const WK=!!wkPath&&existsSync(wkPath);
const DISP=[['PC','chromium',devices['Desktop Chrome']],['Telefono Android','chromium',devices['Pixel 7']],['Tablet Android','chromium',devices['Galaxy Tab S4']],
  ['Mac','webkit',devices['Desktop Safari']],['iPhone','webkit',devices['iPhone 15']],['iPad','webkit',devices['iPad (gen 7)']]];
const GEM={nome:'Barolo',cantina:'Prova',annata:'2019',gradi:14,tipo:'rosso',sicuro:true};
for(const [nome,mot,dev] of DISP){
  if(mot==='webkit'&&!WK){if(process.env.CI){ok(false,nome+': WebKit non installato su GitHub')}else console.log('SALTATA '+nome+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const b=mot==='webkit'?await webkit.launch():await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const {defaultBrowserType,...d}=dev;
  const ctx=await b.newContext({...d,serviceWorkers:'block'}); // WebKit desktop: col service worker attivo il route non vede la richiesta all'IA (400 dal sito vero)
  await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
  const gemReq=[];
  await ctx.route('https://generativelanguage.googleapis.com/**',async r=>{gemReq.push(JSON.parse(r.request().postData()||'{}'));
    await r.fulfill({contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:'```json\n'+JSON.stringify(GEM)+'\n```'}]}}]})})});
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
  const wait=ms=>pg.waitForTimeout(ms),P=nome+': ';
  await pg.goto('http://localhost:8765/index.html');
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
  await pg.evaluate(()=>ls('jona_gemini_key','prova'));
  // controllo dei pixel: lato lungo, verticale, rosso in alto e blu in basso
  const esame=`async b=>{const im=await createImageBitmap(b),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
    const px=(a,z)=>Array.from(x.getImageData(Math.floor(im.width*a),Math.floor(im.height*z),1,1).data);const r={w:im.width,h:im.height,su:px(.5,.15),giu:px(.5,.85)};im.close();return r}`;
  const giusta=(r,max)=>r.h===max&&r.w===Math.round(max*.75)&&r.su[0]>180&&r.su[2]<80&&r.giu[2]>180&&r.giu[0]<80;
  const buf=Array.from(new Uint8Array((await import('fs')).readFileSync(FOTO)));
  const prova=async fake=>pg.evaluate(async({buf,esame,fake})=>{const ES=eval(esame),file=new File([new Uint8Array(buf)],'IMG_0001.JPG',{type:'image/jpeg'}),vero=self.createImageBitmap;
    if(fake==='ignora')self.createImageBitmap=(s,o)=>vero(s); // opzioni ignorate: bitmap intera
    if(fake==='coricata')self.createImageBitmap=async(s,o)=>{if(!(s instanceof Blob)||!o)return vero(s,o);const w=o.resizeWidth,h=Math.round(w*3/4),c=document.createElement('canvas');c.width=w;c.height=h;
      const x=c.getContext('2d');x.fillStyle='#f00';x.fillRect(0,0,w/2,h);x.fillStyle='#00f';x.fillRect(w/2,0,w/2,h);return vero(c)}; // ridotta ma non girata (bug WebKit 237895)
    try{const r=await fotoPiccola(file,2000,240),m=await new Promise(res=>{const i=new Image();i.onload=()=>res({w:i.width,h:i.height});i.src=r.mini});
      return{...(await ES(r.b)),tipo:r.b.type,mini:r.mini.slice(0,15),mw:m.w,mh:m.h,sh:(await ES(await shrinkImg(file))).h}}finally{self.createImageBitmap=vero}},{buf,esame,fake});
  let r=await prova('');
  ok(giusta(r,2000)&&r.tipo==='image/jpeg',P+'fotoPiccola: 4000×3000 con EXIF 6 → 1500×2000 dritta, rosso in alto ('+r.w+'×'+r.h+')');
  ok(r.mini==='data:image/jpeg'&&Math.max(r.mw,r.mh)<=240&&r.mh>r.mw&&r.sh===2000,P+'miniatura JPEG ≤ 240 px verticale ('+r.mw+'×'+r.mh+'), shrinkImg usa la stessa strada');
  r=await prova('ignora');ok(giusta(r,2000),P+'createImageBitmap che ignora le opzioni → foto giusta lo stesso ('+r.w+'×'+r.h+')');
  r=await prova('coricata');ok(r.h>r.w&&Math.max(r.w,r.h)<=2000&&r.su[0]>180&&r.giu[2]>180,P+'createImageBitmap che non gira la foto → girata a mano ('+r.w+'×'+r.h+')');
  // foglio del vino: foto dalla fotocamera → miniatura piccola, niente originale tenuto, all'IA ≤ 2000 px
  await pg.evaluate(()=>{vnForm(null)});await wait(300);
  await pg.fill('.sheet input[data-k="n"]','Barolo');
  let fc=(await Promise.all([pg.waitForEvent('filechooser'),pg.locator('.sheet [data-a="vnFotoF"]').first().click()]))[0];
  await fc.setFiles(FOTO);await pg.waitForSelector('.sheet .vn-fi img',{timeout:15000});
  r=await pg.evaluate(async esame=>{const ES=eval(esame),x=S.vnf.fotos[0];return{src:document.querySelector('.sheet .vn-fi img').getAttribute('src').slice(0,15),pic:VN_PIC.has(x.file),...(await ES(x.file))}},esame);
  ok(r.src==='data:image/jpeg'&&r.pic&&giusta(r,2000),P+'foto del vino tenuta piccola (miniatura data:, file '+r.w+'×'+r.h+')');
  // ricarica (come quando iPhone chiude l'app): scheda ripresa con nome e foto
  const bz=await pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const d=ls('jona_vn'),f=await idbKv(VN_IDB());return{n:d&&d.f&&d.f.n,cam:d&&d.cam,nf:(f||[]).length}});
  ok(bz.n==='Barolo'&&bz.cam===false&&bz.nf===1,P+'bozza salvata: nome e una foto ('+JSON.stringify(bz)+')');
  await pg.reload();await pg.waitForSelector('.sheet .vn-rip',{timeout:25000}).catch(()=>{});await wait(300);
  r=await pg.evaluate(()=>({n:(document.querySelector('.sheet input[data-k="n"]')||{}).value,fi:document.querySelectorAll('.sheet .vn-fi img').length,t:(document.querySelector('.sheet .vn-rip')||{}).textContent||''}));
  ok(r.n==='Barolo'&&r.fi===1&&/ho ripreso la scheda del vino/.test(r.t),P+'dopo la ricarica: scheda ripresa con nome e foto');
  gemReq.length=0;await pg.locator('.sheet [data-a="vnFotoGo"]').first().click();for(let i=0;i<50&&!gemReq.length;i++)await wait(200);
  const im=gemReq.length?gemReq[0].contents[0].parts.filter(p=>p.inline_data):[];
  r=im.length?await pg.evaluate(async({d,esame})=>{const ES=eval(esame),b=await (await fetch('data:image/jpeg;base64,'+d)).blob();return ES(b)},{d:im[0].inline_data.data,esame}):{};
  {const dg=im.length===1&&giusta(r,2000)?'':' · richieste '+gemReq.length+', errori '+JSON.stringify(errs.slice(-3))+', '+JSON.stringify(await pg.evaluate(()=>{const f=S.vnf||{};return{busy:f.busy,nf:(f.fotos||[]).length,sz:(f.fotos||[]).map(x=>x.file&&x.file.size),lg:f.lg,err:(typeof ERRS!=='undefined'?ERRS:null),sc:((document.querySelector('.sheet')||{}).textContent||'').replace(/\s+/g,' ').slice(0,300)}}));
  ok(im.length===1&&giusta(r,2000),P+'all\'IA arriva la foto ripresa, ≤ 2000 px e dritta ('+r.w+'×'+r.h+')'+dg)}
  // Chiudi → bozza cancellata
  await pg.locator('.sheet [data-a="closeSheet"]').last().click();await wait(500);
  r=await pg.evaluate(async()=>({l:ls('jona_vn'),f:await idbKv(VN_IDB())}));
  ok(r.l==null&&r.f==null,P+'Chiudi: bozza cancellata (localStorage e IndexedDB)');
  // fotocamera aperta e app chiusa dal telefono (ricarica senza foto) → nota «fotocamera» e «Galleria»
  await pg.evaluate(()=>{vnForm(null)});await wait(300);await pg.fill('.sheet input[data-k="n"]','Brunello');
  await Promise.all([pg.waitForEvent('filechooser'),pg.locator('.sheet [data-a="vnFotoF"]').first().click()]);await wait(200);
  await pg.reload();await pg.waitForSelector('.sheet .vn-rip',{timeout:25000}).catch(()=>{});await wait(300);
  r=await pg.evaluate(()=>({n:(document.querySelector('.sheet input[data-k="n"]')||{}).value,t:(document.querySelector('.sheet .vn-rip')||{}).textContent||'',g:document.querySelectorAll('.sheet .vn-add [data-a="vnFotoG"]').length}));
  ok(r.n==='Brunello'&&/fotocamera/.test(r.t)&&/Galleria/.test(r.t)&&r.g===1,P+'fotocamera aperta + ricarica: scheda ripresa, nota e pulsante «Galleria»');
  await pg.locator('.sheet [data-a="closeSheet"]').last().click();await wait(300);
  // bozza vecchia (31 minuti) → niente
  await pg.evaluate(()=>{ls('jona_vn',{f:{n:'Vecchio'},t:Date.now()-31*60000,cam:true,u:S.me})});
  await pg.reload();await pg.waitForSelector('.testbar');await wait(1500);
  r=await pg.evaluate(()=>({s:document.querySelectorAll('.sheet .vn-rip').length,l:ls('jona_vn')}));
  ok(r.s===0&&r.l==null,P+'bozza di più di 30 minuti: ignorata e cancellata');
  ok(!errs.length,P+'nessun errore nella pagina'+(errs.length?': '+errs[0]:''));
  await b.close();
}
