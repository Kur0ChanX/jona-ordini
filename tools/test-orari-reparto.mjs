// v83 (modalità locale): orari per reparto. Il gestore sceglie Cucina/Sala (ogni reparto si pubblica per conto suo),
// l'F&B Manager (Mauro) prepara e pubblica solo la sala da «Orari» → «Turni della sala», lo chef riceve l'avviso; 320 px.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:320,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
await pg.evaluate(async()=>{
  const c={ore:40,pausa:30,liberi:1};
  await put('staff','maurizio',{id:'maurizio',nome:'Maurizio',cognome:'Chef',username:'maurizio',ruolo:'gm',reparto:'cucina',stato:'attivo',contratto:{libero:true},creato:1});
  await put('staff','mauro',{id:'mauro',nome:'Mauro',cognome:'Loi',username:'mauro',ruolo:'staff',reparto:'fb',stato:'attivo',contratto:{libero:true},creato:1});
  await put('staff','luca',{id:'luca',nome:'Luca',cognome:'Sala',username:'luca',ruolo:'staff',reparto:'sala',stato:'attivo',contratto:c,creato:1});
  await put('staff','gino',{id:'gino',nome:'Gino',cognome:'Cuoco',username:'gino',ruolo:'staff',reparto:'cucina',stato:'attivo',contratto:c,creato:1});
  // settimana prossima, così le prove non dipendono dal giorno
  const l=orShift(orLun(),1);await put('config','orari_'+l,{tipo:'orari',lun:l,t:{luca:{0:'18:00-23:00'},gino:{0:'10:00-15:00'}},mod:now()});
  S.orW=l});
const lun=await pg.evaluate(()=>S.orW);
const W=()=>pg.evaluate(l=>JSON.parse(JSON.stringify(orWeek(l))),lun);
const devId=await pg.evaluate(()=>realU().id);

// 1. gestore: filtro per reparto
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(200);
await pg.evaluate(()=>{S.tab='staff';S.staffSub='orari';render()});await wait(300);
ok(await pg.locator('.or-reps [data-a="orRep"]').count()===3,'manager: chips Tutti/Cucina/Sala');
await pg.click('.or-reps [data-a="orRep"][data-v="sala"]');await wait(300);
ok(await pg.locator('.or-grid [data-a="orCell"][data-u="luca"]').count()===7&&await pg.locator('.or-grid [data-a="orCell"][data-u="gino"]').count()===0,'Sala: only Luca');
ok(await pg.evaluate(()=>ls('jona_or_rep'))==='sala','filter remembered');
ok(await pg.locator('.or-grid [data-a="orRCell"]').count()>0,'Responsabili still shown');

// 2. pubblica solo la sala
await pg.click('[data-a="orPub"]');await wait(500);
let w=await W();
ok(w.tp&&w.tp.luca&&!w.tp.gino,'publish Sala: Luca in tp, Gino not: '+JSON.stringify(w.tp));
ok(w.pubR&&w.pubR.sala&&!w.pubR.cucina,'pubR only sala');
let st=await pg.evaluate(l=>[orStato(orWeek(l),['sala']).l,orStato(orWeek(l),['cucina']).l,orStato(orWeek(l),null).l],lun);
ok(st[0].startsWith('Pubblicata')&&st[1].startsWith('Bozza')&&st[2].startsWith('Bozza'),'stato per reparto: '+JSON.stringify(st));
let n=await pg.evaluate(()=>Object.values(D().notifiche).map(x=>x.a));
ok(n.includes('luca')&&!n.includes('gino'),'notified Luca only');

// 3. vista dello staff: Luca vede i turni, Gino «non ancora pronti»
let v=await pg.evaluate(()=>{S.orMy='next';const a=vMieiOrari(D().staff.luca),c=vMieiOrari(D().staff.gino);S.orMy='';return[a,c]});
ok(v[0].includes('18:00'),'Luca sees his shift');
ok(v[1].includes('Orari non ancora pronti')&&!v[1].includes('10:00'),'Gino: not published yet');

// 4. cucina pubblicata dopo
await pg.click('.or-reps [data-a="orRep"][data-v="cucina"]');await wait(300);
ok(await pg.locator('.or-grid [data-a="orCell"][data-u="gino"]').count()===7&&await pg.locator('.or-grid [data-a="orCell"][data-u="luca"]').count()===0,'Cucina: only Gino');
await pg.click('[data-a="orPub"]');await wait(500);w=await W();
ok(w.tp.luca&&w.tp.gino&&w.pubR.cucina,'publish Cucina keeps Sala');
st=await pg.evaluate(l=>orStato(orWeek(l),null).l,lun);ok(st.startsWith('Pubblicata'),'Tutti: published');

// 5. F&B Manager: «Turni della sala», solo la sala, pubblica e avvisa lo chef
await pg.click('[data-a="viewAs"][data-v="fb"]');await wait(200);
await pg.evaluate(()=>{S.tab='orari';render()});await wait(300);
ok(await pg.locator('[data-a="orPl"][data-v="plan"]',{hasText:'Turni della sala'}).count()===1,'F&B: «Turni della sala» button');
await pg.click('[data-a="orPl"][data-v="plan"]');await wait(300);
await pg.evaluate(l=>{S.orW=l;render()},lun);await wait(300);
ok(await pg.locator('.or-reps').count()===0,'F&B: no reparto chips');
ok(await pg.locator('.or-grid [data-a="orCell"][data-u="luca"]').count()===7&&await pg.locator('.or-grid [data-a="orCell"][data-u="gino"]').count()===0,'F&B: only the sala');
await pg.evaluate(()=>orCellSheet('gino',1));await wait(200);
ok(await pg.locator('.sheet [data-a="orSave"]').count()===0,'F&B cannot open a kitchen cell');
await pg.click('.or-grid [data-a="orCell"][data-u="luca"][data-g="1"]');await wait(300);
await pg.fill('#or-a1','18:00');await pg.dispatchEvent('#or-a1','change');await pg.fill('#or-b1','23:00');await pg.dispatchEvent('#or-b1','change');await wait(150);
await pg.click('.sheet [data-a="orSave"]');await wait(400);
ok(await pg.locator('[data-a="orPub"]').innerText().then(t=>t.includes('Avvisa delle modifiche')),'F&B: «Avvisa delle modifiche»');
const t0=await pg.evaluate(()=>now());await wait(20);
await pg.click('[data-a="orPub"]');await wait(500);w=await W();
ok(w.tp.luca[1]==='18:00-23:00'&&w.tp.gino[0]==='10:00-15:00','F&B publish: sala changed, cucina untouched');
n=await pg.evaluate(t=>Object.values(D().notifiche).filter(x=>x.creato>t).map(x=>x.a+'|'+x.titolo),t0);
ok(n.some(x=>x.startsWith('luca|Orari cambiati')),'Luca told: '+JSON.stringify(n));
ok(n.some(x=>x.startsWith('maurizio|Orari cambiati: Sala')),'chef told that the sala changed');
ok(!n.some(x=>x.startsWith('gino|')),'Gino not told');
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px: no horizontal scroll');

// 6. «Copia settimana prima» della sala lascia stare la cucina
const l2=await pg.evaluate(()=>orShift(S.orW,1));
await pg.evaluate(async l=>{await put('config','orari_'+l,{tipo:'orari',lun:l,t:{gino:{2:'09:00-14:00'}},mod:now()});S.orW=l;render()},l2);await wait(300);
await pg.click('[data-a="orCopy"]');await wait(500);
const w2=await pg.evaluate(l=>JSON.parse(JSON.stringify(orWeek(l))),l2);
ok(w2.t.luca&&w2.t.luca[1]==='18:00-23:00'&&w2.t.gino[2]==='09:00-14:00'&&!w2.t.gino[0],'copy: sala copied, cucina untouched: '+JSON.stringify(w2.t));

// 7. settimane pubblicate prima della v83 (senza pubR) valgono per tutti
ok(await pg.evaluate(()=>!!orPubAt({tp:{a:{}},pub:5},['cucina'])&&!orPubAt({t:{}},['sala'])),'old weeks without pubR count as published');
ok(errs.length===0,'no page errors '+errs.join(' | '));
await b.close();
