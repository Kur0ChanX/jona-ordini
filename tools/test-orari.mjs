// Orari del personale (v14), modalità locale: contratto nel profilo, turni tipo su più giorni, controlli (11 ore, giorni liberi, ore),
// copia settimana, pubblica e notifiche, lo staff vede solo i suoi turni pubblicati, 320 px senza scorrimento della pagina, tema scuro.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT='/tmp/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const week=()=>pg.evaluate(()=>orWeek(S.orW));
const probs=()=>pg.evaluate(()=>orProblems(S.orW).map(p=>({id:p.u.id,g:p.g,k:p.k,t:p.t})));
const noHScroll=()=>pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');
/* 1. Contratto nel profilo: solo l'amministratore (Maurizio) */
await pg.evaluate(()=>{S.tab='staff';render()});await wait(200);
await pg.click('[data-a="addProfile"]');await wait(300);
ok(await pg.locator('.sheet .or-cf').count()===0,'developer: no contract section');
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await wait(300);
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(300);
await pg.evaluate(()=>{S.tab='staff';render()});await wait(200);
await pg.click('[data-a="addProfile"]');await wait(300);
ok(await pg.locator('.sheet .or-cf').count()===1,'add profile: «Contratto e orari» section shown');
ok(await pg.locator('.sheet [data-k="ore"][data-v="40"][aria-pressed="true"]').count()===1,'default 40 hours');
await pg.click('.sheet [data-a="formset"][data-k="ruolo"][data-v="dev"]');await wait(150);
ok(await pg.locator('.sheet .or-cf').count()===0,'no contract for the developer role');
await pg.click('.sheet [data-a="formset"][data-k="ruolo"][data-v="staff"]');await wait(150);
for(const [k,v] of [['nome','Anna'],['cognome','Verdi'],['username','anna'],['pw','password123'],['pw2','password123']])await pg.fill(`.sheet input[data-k="${k}"]`,v);
await pg.click('.sheet [data-k="ore"][data-v="36"]');await pg.click('.sheet [data-k="pausa"][data-v="45"]');await pg.click('.sheet [data-k="liberi"][data-v="2"]');await wait(100);
await pg.fill('.sheet input#rg-ore','70');await pg.click('[data-a="addGo"]');await wait(300);
ok(await pg.evaluate(()=>!Object.values(D().staff).some(u=>u.username==='anna')),'hours above 60 rejected');
await pg.fill('.sheet input#rg-ore','36');await pg.click('[data-a="addGo"]');await wait(400);
const anna=await pg.evaluate(()=>Object.values(D().staff).find(u=>u.username==='anna'));
ok(anna&&JSON.stringify(anna.contratto)===JSON.stringify({ore:36,pausa:45,liberi:2}),'contract saved: '+JSON.stringify(anna&&anna.contratto));
// altre persone: Luca cucina 40/30/1, Sara sala 24 ore senza pausa e 2 liberi, Gino senza contratto
await pg.evaluate(async()=>{
  await put('staff','u_luca',{nome:'Luca',cognome:'Bianchi',username:'luca',ruolo:'staff',reparto:'cucina',mansione:'Cuoco',stato:'attivo',pass:await sha('u_luca:password123'),creato:now(),contratto:{ore:40,pausa:30,liberi:1}});
  await put('staff','u_sara',{nome:'Sara',cognome:'Neri',username:'sara',ruolo:'staff',reparto:'sala',mansione:'Cameriere',stato:'attivo',pass:'x',creato:now(),contratto:{ore:24,pausa:0,liberi:2}});
  await put('staff','u_gino',{nome:'Gino',cognome:'Gialli',username:'gino',ruolo:'staff',reparto:'altro',mansione:'Lavapiatti',stato:'attivo',pass:'x',creato:now()});
});await wait(300);
// modifica del contratto dal profilo
await pg.evaluate(()=>profileSheet('u_luca'));await wait(300);
ok(await pg.locator('.sheet [data-k="ore"][data-v="40"][aria-pressed="true"]').count()===1,'profile shows saved contract');
await pg.click('.sheet [data-k="liberi"][data-v="2"]');await pg.click('[data-a="psaveProfile"]');await wait(300);
ok(await pg.evaluate(()=>D().staff.u_luca.contratto.liberi)===2,'contract edited from profile');
await pg.evaluate(()=>upd('staff','u_luca',{contratto:{ore:40,pausa:30,liberi:1}}));await wait(200);

/* 2. Pianificatore: interruttore, turno tipo su più giorni */
await pg.click('[data-a="staffSub"][data-v="orari"]');await wait(300);
ok(await pg.evaluate(()=>localStorage.getItem('jona_staffsub'))==='"orari"','switch remembered in jona_staffsub');
ok(await pg.locator('.or-grid tbody tr:not(.or-rep)').count()===4,'grid rows: Anna, Gino, Luca, Sara (no dev without contract)');
ok((await pg.locator('.or-grid .or-rep').allInnerTexts()).map(s=>s.trim().toLowerCase()).join(',')==='cucina,sala,altro','rows grouped by department');
ok((await pg.locator('.or-st').innerText()).includes('vuota'),'empty week status');
await pg.click('.or-c[data-u="u_luca"][data-g="0"]');await wait(300);
await pg.click('.sheet [data-a="orPick"][data-v="10:00-15:00"]');await wait(100);
ok((await pg.locator('.sheet .or-sum').innerText()).includes('5h'),'day hours shown: '+await pg.locator('.sheet .or-sum').innerText());
for(const g of [1,2,3,4])await pg.click(`.sheet [data-a="orDay"][data-v="${g}"]`);
ok((await pg.locator('.sheet [data-a="orSave"]').innerText()).includes('5 giorni'),'save button counts days');
await pg.click('.sheet [data-a="orSave"]');await wait(400);
let w=await week();
ok(w&&[0,1,2,3,4].every(g=>w.t.u_luca[g]==='10:00-15:00')&&!w.t.u_luca[5],'Pranzo saved Mon–Fri');
ok(w.tipo==='orari'&&w.lun===await pg.evaluate(()=>orLun()),'week document: config/orari_<monday>');
// Anna: un turno a mano con il secondo turno; LocalStore aggiorna solo «t.<id>»
await pg.click('.or-c[data-u="'+anna.id+'"][data-g="5"]');await wait(300);
await pg.fill('#or-a1','11:00');await pg.dispatchEvent('#or-a1','change');await pg.fill('#or-b1','15:00');await pg.dispatchEvent('#or-b1','change');
await pg.click('.sheet [data-a="orTwo"][data-v="1"]');await wait(100);
await pg.fill('#or-a2','19:00');await pg.dispatchEvent('#or-a2','change');await pg.fill('#or-b2','00:30');await pg.dispatchEvent('#or-b2','change');await wait(100);
ok((await pg.locator('.sheet .or-sum').innerText()).includes('dopo mezzanotte'),'night shift recognised');
await pg.click('.sheet [data-a="orSave"]');await wait(400);
ok(await pg.locator('#ask-ok').count()===1,'13h30 day asks for consent');await pg.click('#ask-ok');await wait(500);
w=await week();
ok(w.t[anna.id][5]==='11:00-15:00,19:00-00:30'&&w.t.u_luca[0]==='10:00-15:00','split shift saved, other rows untouched');
ok(await pg.evaluate(()=>orTot(orWeek(S.orW).t[S.data.staff[Object.keys(S.data.staff).find(k=>S.data.staff[k].username==='anna')].id],{ore:36,pausa:45,liberi:2}))===(4*60+5*60+30),'hours: 4h + 5h30');

/* 3. Controlli */
// Luca: cena il lunedì e pranzo martedì → 10h30 di riposo: chiede il consenso prima di salvare
await pg.click('.or-c[data-u="u_luca"][data-g="0"]');await wait(300);
await pg.click('.sheet [data-a="orPick"][data-v="18:00-23:30"]');await pg.click('.sheet [data-a="orSave"]');await wait(400);
ok(await pg.locator('#ask-ok').count()===1&&(await pg.locator('.sheet').last().innerText()).includes('11'),'error asks for informed consent before saving');
await pg.locator('.sheet').last().locator('[data-a="closeSheet"].btn').click();await wait(400);
ok((await week()).t.u_luca[0]==='10:00-15:00','«Annulla»: nothing saved');
await pg.click('.sheet [data-a="orSave"]');await wait(400);await pg.click('#ask-ok');await wait(500);
let p=await probs();
ok((await week()).t.u_luca[0]==='18:00-23:30','«Salva lo stesso»: saved');
ok(p.some(x=>x.id==='u_luca'&&x.g===1&&x.k==='err'&&x.t.includes('11')),'11-hour rest error: '+(p.find(x=>x.id==='u_luca')||{}).t);
ok(await pg.evaluate(()=>orProblems(S.orW).some(p=>p.u.id==='u_luca'&&p.ok)),'error marked as accepted (ok.<persona>)');
ok(await pg.locator('.or-c.acc[data-u="u_luca"][data-g="1"]').count()===1,'accepted error: dashed border');
// Sara: 6 giornate senza pausa → giorni liberi, 48 ore, pausa
await pg.evaluate(()=>orSaveRow(S.orW,'u_sara',{0:'09:00-17:30',1:'09:00-17:30',2:'09:00-17:30',3:'09:00-17:30',4:'09:00-17:30',5:'09:00-17:30',6:'R'}));await wait(300);
p=await probs();const ps=p.filter(x=>x.id==='u_sara');
ok(ps.some(x=>x.k==='err'&&x.t.includes('Lavora 6 giorni')),'days off error');
ok(await pg.locator('.or-c.err[data-u="u_sara"]').count()===0&&await pg.locator('.or-pc.err').count()>=1,'week-level errors mark the name');
ok(ps.some(x=>x.k==='err'&&x.t.includes('48')),'over 48 hours error');
ok(ps.filter(x=>x.k==='warn'&&x.t.includes('senza pausa')).length===1,'one no-break warning for the whole week');
ok(await pg.locator('.or-c.warn[data-u="u_sara"]').count()===6,'all six days without break are marked');
// Luca oltre il contratto: avviso, non errore
await pg.evaluate(()=>orSaveRow(S.orW,'u_luca',{0:'10:00-15:00,18:00-23:00',1:'10:00-15:00,18:00-23:00',2:'10:00-15:00,18:00-23:00',3:'10:00-15:00,18:00-23:00',4:'10:00-15:00',6:'R'}));await wait(300);
p=await probs();
ok(p.some(x=>x.id==='u_luca'&&x.k==='warn'&&x.t.includes('oltre il contratto'))&&!p.some(x=>x.id==='u_luca'&&x.k==='err'),'over contract = warning only');
ok((await pg.locator('.or-pbh').innerText()).includes('da controllare'),'«da controllare» box');
await pg.click('.or-pbh');await wait(150);
ok(await pg.locator('.or-pl .or-pi').count()===p.length,'problem list opens');
await pg.locator('.or-pl .or-pi[data-u="u_sara"]').first().click();await wait(300);
ok(await pg.locator('.sheet .or-shp .or-pi').count()>=3,'cell sheet lists the person\'s problems');
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await wait(300);
// Gino senza contratto
ok((await pg.locator('.or-pc', {hasText:'Gino'}).innerText()).includes('senza contratto'),'note for person without contract');
await pg.screenshot({path:OUT+'orari-gm.png',fullPage:true});

/* 4. Turni tipo */
await pg.click('[data-a="orTipi"]');await wait(300);
await pg.fill('#ort-n','Mattina');await pg.fill('#ort-a1','07:00');await pg.fill('#ort-b1','12:00');
await pg.click('.sheet [data-a="orTipoAdd"]');await wait(300);
ok(await pg.evaluate(()=>orTipi().some(t=>t.n==='Mattina'&&t.v==='07:00-12:00')),'custom shift type added');
ok(await pg.locator('.sheet .line').count()===5,'five shift types listed');
await pg.locator('.sheet [data-a="orTipoDel"]').last().click();await wait(300);
ok(await pg.evaluate(()=>orTipi().length)===4,'shift type deleted');
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await wait(300);

/* 5. Copia settimana */
await pg.click('[data-a="orW"][data-v="1"]');await wait(200);
await pg.click('[data-a="orCopy"]');await wait(400);
const cur=await pg.evaluate(()=>orWeek(orLun())),nx=await week();
ok(nx&&JSON.stringify(nx.t.u_luca)===JSON.stringify(cur.t.u_luca)&&!nx.tp,'copied previous week, not published');
await pg.click('[data-a="orCopy"]');await wait(300);
ok(await pg.locator('#ask-ok').count()===1,'copy over a filled week asks first');
await pg.click('.sheet [data-a="closeSheet"].btn');await wait(300);
await pg.click('[data-a="orW"][data-v="0"]');await wait(200);

/* 6. Pubblica e notifiche */
const nOr=()=>pg.evaluate(()=>Object.values(D().notifiche).filter(n=>n.tipo==='orari').sort((a,b)=>a.creato-b.creato));
await pg.click('[data-a="orPub"]');await wait(300);
ok(await pg.locator('#ask-ok').count()===1,'publishing with errors asks for confirmation');
await pg.click('#ask-ok');await wait(500);
w=await week();
ok(w.tp&&JSON.stringify(w.tp)===JSON.stringify(w.t)&&w.pub>0,'published copy tp = t');
let ns=await nOr();
ok(ns.length===3&&['u_luca','u_sara',anna.id].every(id=>ns.some(n=>n.a===id))&&!ns.some(n=>n.a==='u_gino'),'notified the 3 people with shifts: '+ns.map(n=>n.a).join(','));
ok(ns.every(n=>n.titolo.startsWith('Orari pubblicati: ')),'title «Orari pubblicati»: '+ns[0].titolo);
ok((await pg.locator('.or-st').innerText()).includes('Pubblicata'),'status Pubblicata');
ok(await pg.locator('[data-a="orPub"]').count()===0,'no publish button when nothing changed');
// una modifica: solo Luca riceve «Orari cambiati»
await pg.click('.or-c[data-u="u_luca"][data-g="2"]');await wait(300);
await pg.click('.sheet [data-a="orPick"][data-v="R"]');await pg.click('.sheet [data-a="orSave"]');await wait(400);
ok((await pg.locator('.or-st').innerText()).includes('Modifiche da avvisare'),'status «Modifiche da avvisare»');
ok(await pg.locator('.or-c[data-u="u_luca"][data-g="2"] .or-dot').count()===1&&await pg.locator('.or-dot').count()===1,'dot only on the changed cell');
ok((await pg.locator('[data-a="orPub"]').innerText()).includes('Avvisa delle modifiche'),'button «Avvisa delle modifiche»');
await pg.click('[data-a="orPub"]');await wait(300);await pg.click('#ask-ok');await wait(500);
ns=await nOr();const last=ns[ns.length-1];
ok(ns.length===4&&last.a==='u_luca'&&last.titolo.startsWith('Orari cambiati')&&last.testo.includes('mercoledì'),'only Luca notified of the change: '+last.testo);
// bozza non pubblicata: lo staff non la vede
await pg.evaluate(()=>{const r=Object.assign({},orWeek(S.orW).t.u_luca,{3:'F'});return orSaveRow(S.orW,'u_luca',r)});await wait(300);

/* 7. Vista dello staff */
await pg.evaluate(()=>{logout()});await wait(200);
await pg.fill('#li-u','luca');await pg.fill('#li-p','password123');await pg.click('[data-a="doLogin"]');await wait(500);
ok(await pg.locator('.nav button[data-v="orari"]').count()===1,'staff menu has «Orari»');
await pg.click('.nav button[data-v="orari"]');await wait(300);
ok(await pg.locator('.or-day').count()===7,'seven day cards');
const days=await pg.locator('.or-day').allInnerTexts();
ok(days[2].includes('Riposo'),'Wednesday shows Riposo (published change)');
ok(days[3].includes('18:00 – 23:00')&&!days[3].includes('Ferie'),'unpublished draft not visible to staff');
ok(!(await pg.locator('#app').innerText()).match(/Sara|Anna|Gino/),'staff sees only their own shifts');
ok(await pg.locator('.or-day.today').count()===1,'today highlighted');
ok((await pg.locator('.or-mtot').innerText()).includes('di lavoro'),'weekly total shown');
ok(!(await pg.locator('#app').innerText()).includes('contratto'),'staff does not see contract hours');
// settimana prossima pubblicata → compare la scelta
await pg.evaluate(async()=>{const n=orShift(orLun(),1),w=orWeek(n);await upd('config','orari_'+n,{tp:clone(w.t),pub:now()})});await wait(300);
ok(await pg.locator('[data-a="orMy"][data-v="next"]').count()===1,'«Settimana prossima» appears when published');
await pg.click('[data-a="orMy"][data-v="next"]');await wait(200);
ok((await pg.locator('.vsub').innerText())===await pg.evaluate(()=>orRange(orShift(orLun(),1))),'next week shown');
await pg.click('[data-a="orMy"][data-v=""]');await wait(200);
await pg.click('[data-a="notifs"]');await wait(300);
ok(await pg.locator('.sheet .notif').count()===2,'Luca sees his 2 notifications');
await pg.click('.sheet [data-a="closeSheet"].icon-btn');await wait(300);

/* 8. 320 px e tema scuro */
await pg.setViewportSize({width:320,height:700});await wait(300);
ok(await noHScroll(),'staff view at 320 px: no horizontal page scroll');
const navOk=await pg.evaluate(()=>[...document.querySelectorAll('.nav button')].every(b=>b.scrollWidth<=b.clientWidth+1&&b.getBoundingClientRect().right<=innerWidth));
ok(navOk,'5 menu items fit at 320 px');
await pg.screenshot({path:OUT+'orari-staff-320.png'});
await pg.evaluate(()=>{logout()});await wait(200);
await pg.fill('#li-u','mario');await pg.fill('#li-p','password123');await pg.click('[data-a="doLogin"]');await wait(500);
await pg.evaluate(()=>{S.viewAs='gm';S.tab='staff';render()});await wait(300);
ok(await pg.locator('.or-grid').count()===1,'planner remembered after login');
ok(await noHScroll(),'planner at 320 px: page does not scroll sideways (only the table)');
ok(await pg.evaluate(()=>{const s=document.querySelector('.or-scroll');return s.scrollWidth>s.clientWidth}),'table scrolls inside its box');
await pg.evaluate(()=>document.querySelector('.or-scroll').scrollLeft=300);await wait(100);
ok(await pg.evaluate(()=>{const s=document.querySelector('.or-scroll').getBoundingClientRect(),c=document.querySelector('tbody .or-pc').getBoundingClientRect();return Math.abs(c.left-s.left)<2}),'names column stays fixed while scrolling');
await pg.screenshot({path:OUT+'orari-gm-320.png'});
await pg.evaluate(()=>{localStorage.setItem('jona_theme','"dark"');applyTheme();render()});await wait(300);
const bg=await pg.evaluate(()=>getComputedStyle(document.querySelector('.or-b')).backgroundColor);
ok(!/255, 255, 255/.test(bg),'dark theme: shift block not white ('+bg+')');
await pg.screenshot({path:OUT+'orari-dark.png'});

ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
