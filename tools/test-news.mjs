import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT='/tmp/news-';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// modalità locale: firebase-config.js nascosto (vedi README)
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1});
const pg=await ctx.newPage();
const errs=[],cerrs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error')cerrs.push(m.text()+' @ '+(m.location().url||''))});pg.on('requestfailed',r=>cerrs.push('requestfailed '+r.url().slice(0,80)+' '+(r.failure()||{}).errorText));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const cnt=async()=>{const l=pg.locator('header.top .news-n');return await l.count()?+(await l.innerText()):0};
const view=async v=>{await pg.click(`[data-a="viewAs"][data-v="${v}"]`);await wait(300);await pg.evaluate(()=>document.querySelectorAll('#toasts .toast').forEach(t=>t.remove()))};
const openNews=async()=>{await pg.click('header.top [data-a="news"]');await wait(400)};
const closeAll=async()=>{await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await wait(100)};
const setSeen=async v=>{await pg.evaluate(v=>{ls('jona_news_'+realU().id,v);render()},v);await wait(100)};
const TECH=/`|localStorage|Firestore|Firebase|API|manifest|sw\.js|index\.html|parser|SVG|cache|Gemini|backup|enablePersistence|meU|realU/i;

await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');await wait(300);
const id=await pg.evaluate(()=>realU().id);
ok(await pg.evaluate(()=>APP_VER)===7&&await pg.evaluate(()=>NEWS[0].v)===7,'APP_VER 7, NEWS newest first');
ok(await pg.evaluate(()=>NEWS.every((n,i,a)=>!i||a[i-1].v>n.v)),'NEWS sorted newest first');
// new profile -> counter 1 in every view
ok(await cnt()===1,'dev new profile counter 1: '+await cnt());
ok(await pg.evaluate(id=>localStorage.getItem('jona_news_'+id),id)==='6','baseline stored as APP_VER-1');
await view('gm');ok(await cnt()===1,'gm new profile counter 1');
await view('staff');ok(await cnt()===1,'staff new profile counter 1');
// counter smaller than bell's
{const nb=await pg.locator('header.top .news-n').boundingBox(),bd=await pg.evaluate(()=>{const r=document.querySelector('.bell .dot');return r?r.getBoundingClientRect().height:18});ok(nb.height<bd,`news counter smaller than bell (${nb.height} < ${bd})`)}
await pg.screenshot({path:OUT+'h400-staff.png',clip:{x:0,y:0,width:400,height:120}});
// staff sheet
await openNews();
let secs=await pg.locator('.sheet .news-v').count();ok(secs===5,'staff sees 5 versions (7,5,4,1,0): '+secs);
const sv=await pg.locator('.sheet .news-vn').allInnerTexts();ok(sv.join()==='Versione 7,Versione 5,Versione 4,Versione 1,Versione 0','staff versions: '+sv.join());
ok(await pg.locator('.sheet .news-dev').count()===0,'staff: no technical part');
const stx=await pg.locator('.sheet').innerText();ok(!TECH.test(stx),'staff: no technical words'+(TECH.test(stx)?' -> '+stx.match(TECH)[0]:''));
ok(await pg.locator('.sheet .news-new').count()===1,'staff: one "nuova" tag');
ok((await pg.locator('.sheet .news-v').first().innerText()).includes('3 ottobre 2026'),'date formatted "3 ottobre 2026"');
ok(stx.includes('microfono')&&!stx.includes('Consumi e costi'),'staff sees voice, not report');
ok(await pg.locator('.sheet.tall').count()===1,'tall sheet');
await pg.screenshot({path:OUT+'sheet-staff.png'});
ok(await pg.evaluate(id=>localStorage.getItem('jona_news_'+id),id)==='7','opening marks seen (7)');
ok(await cnt()===0,'counter 0 behind the sheet after opening');
await closeAll();
ok(await cnt()===0,'staff counter 0 after opening');
await view('gm');ok(await cnt()===0,'gm counter 0 after opening');
await view('dev');ok(await cnt()===0,'dev counter 0 after opening');
ok(await pg.locator('header.top .news-btn').getAttribute('aria-label')==='Novità','aria-label without count');
// seen=3 -> staff 3 (7,5,4), gm 4 (7,6,5,4), dev 4
await setSeen(3);
ok(await cnt()===4,'dev seen=3 counter 4: '+await cnt());
ok((await pg.locator('header.top .news-btn').getAttribute('aria-label'))==='Novità, 4 da vedere','aria-label with count');
await view('gm');ok(await cnt()===4,'gm seen=3 counter 4: '+await cnt());
await view('staff');ok(await cnt()===3,'staff seen=3 counter 3: '+await cnt());
// seen=1 -> staff 3 (v2 dev-only, v3 chef-only not counted), gm 5 (7,6,5,4,3), dev 6
await setSeen(1);
ok(await cnt()===3,'staff seen=1 counter 3: '+await cnt());
await view('gm');ok(await cnt()===5,'gm seen=1 counter 5: '+await cnt());
await view('dev');ok(await cnt()===6,'dev seen=1 counter 6: '+await cnt());
// gm sheet
await setSeen(3);
await view('gm');await openNews();
secs=await pg.locator('.sheet .news-v').count();ok(secs===7,'gm sees 7 versions (no v2): '+secs);
ok(await pg.locator('.sheet .news-dev').count()===0,'gm: no technical part');
const gtx=await pg.locator('.sheet').innerText();ok(gtx.includes('Consumi e costi')&&gtx.includes('Copie automatiche'),'gm sees chef items');
ok(await pg.locator('.sheet .news-new').count()===4,'gm: 4 "nuova" tags');
await pg.screenshot({path:OUT+'sheet-gm.png'});
await closeAll();
// dev sheet
await setSeen(3);
await view('dev');await openNews();
secs=await pg.locator('.sheet .news-v').count();ok(secs===8,'dev sees 8 versions: '+secs);
ok(await pg.locator('.sheet .news-new').count()===4,'dev: 4 "nuova" tags');
const h4=await pg.locator('.sheet .news-v').nth(4).locator('.news-dev h4').allInnerTexts();
ok(h4.join()==='AGGIUNTE,CORREZIONI'||h4.join()==='Aggiunte,Correzioni','v3 headings: '+h4.join());
const all4=new Set((await pg.locator('.sheet .news-dev h4').evaluateAll(es=>es.map(e=>e.textContent))));
ok(['Aggiunte','Correzioni','Problemi risolti'].every(x=>all4.has(x)),'dev sees the three headings: '+[...all4].join(', '));
ok(await pg.locator('.sheet .news-v').nth(5).locator('.news-dev h4').evaluateAll(es=>es.map(e=>e.textContent).join())==='Aggiunte','v2 only "Aggiunte"');
ok(await pg.locator('.sheet .news-dev code').count()>20,'dev: code names rendered');
await pg.screenshot({path:OUT+'sheet-dev.png'});
await pg.locator('.sheet').evaluate(e=>e.scrollTop=e.scrollHeight);await wait(100);
await pg.screenshot({path:OUT+'sheet-dev-end.png'});
await closeAll();

// header fit checks
async function fit(label){
  const r=await pg.evaluate(()=>{const h=document.querySelector('header.top');const hb=h.getBoundingClientRect();
    const kids=[...h.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>{const b=e.getBoundingClientRect();return{c:e.className||e.tagName,l:b.left,r:b.right,t:b.top,b:b.bottom,w:b.width}});
    return{hb:{l:hb.left,r:hb.right},sw:h.scrollWidth,cw:h.clientWidth,doc:document.documentElement.scrollWidth,vw:innerWidth,kids}});
  const ov=[];for(let i=1;i<r.kids.length;i++)if(r.kids[i].l<r.kids[i-1].r-0.5)ov.push(r.kids[i-1].c+'/'+r.kids[i].c);
  const out=r.kids.filter(k=>k.l<r.hb.l-0.5||k.r>r.hb.r+0.5).map(k=>k.c);
  ok(!ov.length&&!out.length&&r.sw<=r.cw&&r.doc<=r.vw,`${label}: fits (overlap ${ov.join()||'-'}, outside ${out.join()||'-'}, scroll ${r.sw}/${r.cw}, doc ${r.doc}/${r.vw}) `+r.kids.map(k=>k.c.split(' ')[0]+':'+Math.round(k.w)).join(' '));
  return r;
}
await setSeen(3);
for(const [w,hgt] of [[320,640],[360,740],[400,800]]){
  await pg.setViewportSize({width:w,height:hgt});await wait(200);
  for(const v of ['staff','gm','dev']){
    await view(v);
    await pg.evaluate(()=>{window.syncPill=()=>'';render()});await wait(80);
    await fit(`${w}px ${v} no pill`);
    if(w===400){ok(await pg.locator('header.top .news-l').isVisible(),'400 no pill: label "Novità" visible');await pg.screenshot({path:OUT+'h400-'+v+'.png',clip:{x:0,y:0,width:400,height:110}})}
    await pg.evaluate(()=>{window.syncPill=()=>`<span class="sync-pill">${ic('cloud')} Senza rete</span>`;render()});await wait(80);
    const r=await fit(`${w}px ${v} pill`);
    if(w===320){const lbl=await pg.locator('header.top .news-l').isVisible();ok(!lbl,'320: label hidden (icon only)');}
    if(w===400){ok(!await pg.locator('header.top .news-l').isVisible(),'400 with pill: icon only');await pg.screenshot({path:OUT+'h400-'+v+'-pill.png',clip:{x:0,y:0,width:400,height:110}})}
    if(w===320&&v==='staff')await pg.screenshot({path:OUT+'h320-staff-pill.png',clip:{x:0,y:0,width:320,height:110}});
    if(w===320&&v==='dev')await pg.screenshot({path:OUT+'h320-dev-pill.png',clip:{x:0,y:0,width:320,height:110}});
    await pg.evaluate(()=>{window.syncPill=()=>`<span class="sync-pill">${ic('cloud')} Senza rete, 3 da inviare</span>`;render()});await wait(80);
    await fit(`${w}px ${v} long pill`);
    if(v==='staff')await pg.screenshot({path:OUT+'h'+w+'-staff-longpill.png',clip:{x:0,y:0,width:w,height:110}});
  }
}
await pg.evaluate(()=>{window.syncPill=()=>'';render()});
await pg.setViewportSize({width:320,height:640});await view('staff');
await pg.screenshot({path:OUT+'h320-staff.png',clip:{x:0,y:0,width:320,height:110}});
await openNews();await pg.screenshot({path:OUT+'sheet-staff-320.png'});
{const sw=await pg.evaluate(()=>{const s=document.querySelector('.sheet');return[s.scrollWidth,s.clientWidth]});ok(sw[0]<=sw[1],'sheet no horizontal overflow at 320: '+sw)}
await closeAll();
await view('dev');await openNews();
{const sw=await pg.evaluate(()=>{const s=document.querySelector('.sheet');return[s.scrollWidth,s.clientWidth]});ok(sw[0]<=sw[1],'dev sheet no horizontal overflow at 320: '+sw)}
await closeAll();

// dark theme
await pg.setViewportSize({width:400,height:800});
await pg.emulateMedia({colorScheme:'dark'});await setSeen(3);await view('dev');await wait(200);
const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
async function cpair(sel,bgSel){return pg.evaluate(([s,bs])=>{const e=document.querySelector(s);let bg=document.querySelector(bs||s);let c=getComputedStyle(bg).backgroundColor;while((c==='rgba(0, 0, 0, 0)'||c==='transparent')&&bg.parentElement){bg=bg.parentElement;c=getComputedStyle(bg).backgroundColor}return[getComputedStyle(e).color,c]},[sel,bgSel])}
for(const s of ['header.top .news-btn','header.top .news-n']){const [c,bg]=await cpair(s);const k=contrast(c,bg);ok(k>=3,`dark ${s} contrast ${k.toFixed(2)} (${c} on ${bg})`)}
await pg.screenshot({path:OUT+'h400-dark.png',clip:{x:0,y:0,width:400,height:120}});
await openNews();
for(const s of ['.sheet .news-new','.sheet .news-t','.sheet .news-dev li','.sheet .news-dev code','.sheet .news-dev h4','.sheet .news-d']){const [c,bg]=await cpair(s);const k=contrast(c,bg);ok(k>=3,`dark ${s} contrast ${k.toFixed(2)}`)}
await pg.screenshot({path:OUT+'sheet-dev-dark.png'});
await closeAll();
await pg.emulateMedia({colorScheme:'light'});

// desktop
await pg.setViewportSize({width:1280,height:800});await wait(200);
await setSeen(3);
for(const v of ['staff','dev']){await view(v);await pg.evaluate(()=>{window.syncPill=()=>`<span class="sync-pill">${ic('cloud')} Senza rete</span>`;render()});await wait(80);await fit('1280px '+v+' pill')}
await pg.screenshot({path:OUT+'desktop.png',clip:{x:0,y:0,width:1280,height:200}});
await openNews();await pg.screenshot({path:OUT+'desktop-sheet.png'});await closeAll();
await pg.evaluate(()=>{window.syncPill=()=>'';render()});

// real staff profile
await pg.setViewportSize({width:400,height:800});
await setSeen(5);
const sid=await pg.evaluate(async()=>{const id=uid();await put('staff',id,{nome:'Anna',cognome:'Bianchi',username:'anna',ruolo:'staff',reparto:'sala',mansione:'Cameriere',foto:'',stato:'attivo',pass:await sha(id+':password123'),creato:now(),creatoDa:''});logout();return id});
await wait(300);
await pg.evaluate(()=>{S.login={u:'anna',p:'password123'};doLogin()});await wait(800);
ok(await pg.evaluate(()=>realU()&&realU().username==='anna'&&realU().ruolo==='staff'),'logged in as real staff');
ok(await pg.locator('.testbar').count()===0,'real staff: no test bar');
ok(await cnt()===1,'real staff new profile counter 1: '+await cnt());
await openNews();
ok(await pg.locator('.sheet .news-v').count()===5&&await pg.locator('.sheet .news-dev').count()===0,'real staff sheet: 5 versions, no tech');
await closeAll();
ok(await cnt()===0,'real staff counter 0 after opening');
ok(await pg.evaluate(id=>localStorage.getItem('jona_news_'+id),sid)==='7','real staff seen key');
ok(await pg.evaluate(id=>localStorage.getItem('jona_news_'+id),id)==='5','dev key untouched by staff');

ok(!errs.length,'no pageerror '+JSON.stringify(errs));console.log('  console errors / failed requests (info):',JSON.stringify(cerrs));
await b.close();
