// v42 (modalità locale): interruttore «Funzioni» in Impostazioni, conta d'uso, agenda (riga veloce, eventi privati/condivisi/per reparto, ricorrenze,
// sposta di mese, elimina, foto letta da Gemini finto), striscia «Oggi in hotel» per lo staff, 320 px senza scorrimento orizzontale.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const wait=ms=>pg.waitForTimeout(ms);
const txt=async(sel='#app')=>(await pg.locator(sel).last().innerText()).replace(/\s+/g,' ');
const closeAll=async()=>{await pg.evaluate(()=>{while(sheets.length)closeSheet(true)});await wait(150)};
const view=async v=>{await pg.click(`[data-a="viewAs"][data-v="${v}"]`);await wait(300)};

await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');await wait(300);
const me=await pg.evaluate(()=>realU().id);
const oggi=await pg.evaluate(()=>today());

// 1. spenta di partenza: niente pulsante né striscia; si accende da Impostazioni
ok(await pg.locator('header.top [data-a="agOpen"]').count()===0,'agenda spenta di partenza: niente icona');
await pg.evaluate(()=>settingsSheet());await wait(400);
ok(/Funzioni/.test(await txt('.sheet'))&&await pg.locator('.sheet [data-a="funzSet"][data-k="agenda"][data-v="0"][aria-pressed="true"]').count()===1,'Impostazioni: «Funzioni» con Agenda spenta');
await pg.click('.sheet [data-a="funzSet"][data-k="agenda"][data-v="1"]');await wait(400);
ok(await pg.evaluate(()=>funzOn('agenda')&&D().config.app.funz.agenda===true),'Agenda accesa (config/app.funz)');
await closeAll();
ok(await pg.locator('header.top [data-a="agOpen"]').count()===1,'icona del calendario per il gestore');

// 2. riga veloce: parser con data fissa (mercoledì 7 ottobre 2026)
const P=await pg.evaluate(()=>{const base=new Date(2026,9,7,10);return[
  'domani ore 20 gruppo Rossi 40 coperti','dopodomani alle 19:30 cena aziendale','venerdì matrimonio Bianchi 120 persone','mercoledì riunione',
  '20 ottobre consegna vini','20/10 ore 9 inventario','il 5 consegna','20 riunione','3 gennaio capodanno russo','oggi pranzo staff','gruppo tedeschi','sabato h 13 brunch 25 pax'
].map(t=>agParse(t,base))});
const E=[['2026-10-08','20:00',40,'Gruppo Rossi'],['2026-10-09','19:30',0,'Cena aziendale'],['2026-10-09','',120,'Matrimonio Bianchi'],['2026-10-07','',0,'Riunione'],
  ['2026-10-20','',0,'Consegna vini'],['2026-10-20','09:00',0,'Inventario'],['2026-11-05','',0,'Consegna'],['2026-10-20','',0,'Riunione'],['2027-01-03','',0,'Capodanno russo'],
  ['2026-10-07','',0,'Pranzo staff'],['2026-10-07','',0,'Gruppo tedeschi']];
E.forEach((e,i)=>ok(P[i].g===e[0]&&P[i].h===e[1]&&P[i].cop===e[2]&&P[i].t===e[3],'parser «'+['domani ore 20…','dopodomani alle 19:30…','venerdì … 120 persone','mercoledì (oggi)','20 ottobre','20/10 ore 9','il 5 (mese dopo)','20','3 gennaio (anno dopo)','oggi','senza data'][i]+'» → '+JSON.stringify(P[i])));
ok(P[11].g==='2026-10-10'&&P[11].h==='13:00'&&P[11].cop===25,'parser: sabato h 13 … 25 pax');

// 3. riga veloce nell'agenda → modulo già compilato → salva
await pg.click('header.top [data-a="agOpen"]');await wait(400);
ok(/Niente in agenda/.test(await txt('.sheet')),'agenda vuota');
await pg.fill('#ag-q','oggi ore 21 gruppo Rossi 40 coperti');await pg.click('[data-a="agQuick"]');await wait(400);
ok(await pg.locator('#agf-t').inputValue()==='Gruppo Rossi'&&await pg.locator('#agf-g').inputValue()===oggi&&await pg.locator('#agf-h').inputValue()==='21:00'&&await pg.locator('#agf-c').inputValue()==='40','modulo compilato dalla riga veloce');
await pg.click('[data-a="agSave"]');await wait(400);
ok(/21:00 Gruppo Rossi 40 coperti · Tutti/.test(await txt('.sheet')),'evento in «Oggi»');
const doc='agenda_'+oggi.slice(0,7);
ok(await pg.evaluate(d=>{const v=D().config[d];return v&&v.tipo==='agenda'&&Object.values(v.e).length===1},doc),'salvato in config/'+doc);

// 4. eventi di altri: privato di un altro gestore nascosto, reparti, ricorrenze
await pg.evaluate(({oggi,doc})=>{const meno=n=>agAdd(oggi,n);const d=D().config[doc];
  return upd('config',doc,{'e.priv':{t:'Privato di Luca',g:oggi,h:'10:00',vis:'io',rep:[],da:'altro',r:''},'e.sala':{t:'Solo sala',g:oggi,h:'11:00',vis:'rep',rep:['sala'],da:'altro',r:''},
    'e.cuc':{t:'Solo cucina',g:oggi,h:'12:00',vis:'rep',rep:['cucina'],da:'altro',r:''}}).then(()=>put('config','agenda_ric',{tipo:'agenda_ric',e:{
    sett:{t:'Riunione settimanale',g:meno(-14),h:'09:00',vis:'tutti',rep:[],da:'altro',r:'s'},mese2:{t:'Inventario mensile',g:(()=>{const x=agD(oggi);return today(new Date(x.getFullYear(),x.getMonth()-2,x.getDate()))})(),h:'',vis:'tutti',rep:[],da:'altro',r:'m'},
    fut:{t:'Futuro settimanale',g:meno(7),h:'',vis:'tutti',rep:[],da:'altro',r:'s'}}}))},{oggi,doc});
await wait(400);
const T=await txt('.sheet');
ok(!/Privato di Luca/.test(T),'evento «Solo io» di un altro gestore nascosto');
ok(/Solo sala/.test(T)&&/Solo cucina/.test(T),'reparti: il gestore vede tutti i reparti');
ok(/Riunione settimanale.*ogni settimana/.test(T)&&/Inventario mensile/.test(T)&&!/Futuro settimanale/.test(T),'ricorrenze: settimanale e mensile oggi, non prima dell\'inizio');
ok(await pg.evaluate(o=>agDay(o,meU()).map(e=>e.h||'').join(',')==='09:00,11:00,12:00,21:00,',oggi),'in ordine di ora (senza ora in fondo)');

// 5. Settimana e Mese
await pg.click('[data-a="agV"][data-v="sett"]');await wait(300);
ok((await pg.locator('.sheet .ag-dt').count())===7,'Settimana: 7 giorni');
await pg.click('[data-a="agV"][data-v="mese"]');await wait(300);
ok(await pg.locator(`.ag-c[data-v="${oggi}"] i`).count()===1,'Mese: pallini sul giorno di oggi');
await pg.click(`.ag-c[data-v="${oggi}"]`);await wait(300);
ok(/Gruppo Rossi/.test(await txt('.sheet')),'Mese: tocco sul giorno → elenco');
await pg.click('[data-a="agGo"][data-v="1"]');await wait(300);
ok(await pg.locator('.ag-c').count()>=28&&!/Gruppo Rossi/.test(await txt('.sheet')),'Mese dopo');
await pg.click('[data-a="agV"][data-v="oggi"]');await wait(300);

// 6. modifica: data nel mese dopo → spostato di documento; poi elimina
const S1=await pg.evaluate(o=>agDay(o,meU()).find(e=>e.t==='Gruppo Rossi').id,oggi);
await pg.evaluate(()=>{S.ag.g=today();refreshSheet()});await wait(200);
await pg.click(`[data-a="agEdit"][data-v="${S1}"]`);await wait(400);
ok(await pg.locator('#agf-t').inputValue()==='Gruppo Rossi','modifica: modulo aperto');
const prossimo=await pg.evaluate(o=>{const x=agD(o);return today(new Date(x.getFullYear(),x.getMonth()+1,3))},oggi);
await pg.fill('#agf-g',prossimo);await pg.click('[data-a="agfSet"][data-k="vis"][data-v="io"]');await pg.click('[data-a="agSave"]');await wait(400);
ok(await pg.evaluate(({id,doc,p})=>{const a=D().config[doc].e[id],n=D().config['agenda_'+p.slice(0,7)];return a===null&&n&&n.e[id]&&n.e[id].g===p&&n.e[id].vis==='io'},{id:S1,doc,p:prossimo}),'spostato nel documento del mese dopo («e.<id>: null» nel vecchio)');
await pg.evaluate(id=>{S.ag.g=agGet(id).g;refreshSheet()},S1);await wait(200);
await pg.click(`[data-a="agEdit"][data-v="${S1}"]`);await wait(300);
await pg.click('[data-a="agDel"]');await wait(300);await pg.click('#ask-ok');await wait(400);
ok(await pg.evaluate(id=>!agGet(id),S1),'evento eliminato');
// controlli del modulo
await pg.click('[data-a="agNew"]');await wait(300);await pg.click('[data-a="agSave"]');await wait(200);
ok(/Scrivi il titolo/.test(await txt('#toasts')),'senza titolo non salva');
await pg.fill('#agf-t','Prova reparti');await pg.click('[data-a="agfSet"][data-k="vis"][data-v="rep"]');await wait(200);await pg.click('[data-a="agSave"]');await wait(200);
ok(/almeno un reparto/.test(await txt('#toasts')),'reparti: almeno uno');
await pg.click('[data-a="agfRep"][data-v="sala"]');await pg.fill('#agf-c','tanti');await pg.click('[data-a="agSave"]');await wait(200);
ok(/numero/.test(await txt('#toasts')),'coperti non numerici');
await pg.fill('#agf-c','');await pg.click('[data-a="agSave"]');await wait(400);
ok(await pg.evaluate(()=>agAll().some(e=>e.t==='Prova reparti'&&e.vis==='rep'&&e.rep.join()==='sala')),'evento per la sala salvato');

// 7. foto dell'agenda con Gemini finto
await pg.evaluate(()=>{window.gemCall=async b=>{window._gem=b;return{txt:'```json\n[{"data":"'+agAdd(today(),1)+'","ora":"20.30","titolo":"Gruppo Verdi","coperti":"30","note":"vegetariani"},{"data":"'+agAdd(today(),2)+'","ora":"","titolo":"Consegna vini","coperti":0,"note":""},{"data":"boh","titolo":"Senza data"}]\n```'}}});
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=40;c.height=30;const bl=await new Promise(r=>c.toBlob(r,'image/png'));await agFotoGo([new File([bl],'agenda.png',{type:'image/png'})])});await wait(400);
ok(await pg.evaluate(()=>{const p=window._gem.contents[0].parts;return /JSON/.test(p[0].text)&&/anno \d{4}/.test(p[0].text)&&p[1].inline_data.mime_type==='image/jpeg'}),'Gemini riceve la foto e la data di oggi');
ok((await pg.locator('.sheet [data-a="agPT"]').count())===2&&/Aggiungi 2 eventi/.test(await txt('.sheet')),'2 eventi letti (quello senza data scartato)');
await pg.click('.sheet [data-a="agPT"][data-v="1"]');await wait(200);
ok(/Aggiungi 1 evento/.test(await txt('.sheet')),'spunta tolta → 1 evento');
await pg.click('[data-a="agPV"][data-v="io"]');await pg.click('[data-a="agPAdd"]');await wait(400);
ok(await pg.evaluate(()=>{const l=agAll();const v=l.find(e=>e.t==='Gruppo Verdi');return v&&v.h==='20:30'&&v.cop===30&&v.vis==='io'&&v.da===realU().id&&!l.some(e=>e.t==='Consegna vini')}),'«Gruppo Verdi» aggiunto, solo io, 20:30, 30 coperti');
await closeAll();

// 8. conta d'uso: una volta al giorno per telefono
const uso=await pg.evaluate(id=>((D().config['uso_'+today().slice(0,7)]||{}).agenda||{})[id],me);
ok(uso===1,'conta d\'uso: 1 giorno per Mario');
await pg.click('header.top [data-a="agOpen"]');await wait(300);await closeAll();
ok(await pg.evaluate(id=>D().config['uso_'+today().slice(0,7)].agenda[id],me)===1,'conta d\'uso: niente doppioni nello stesso giorno');
await pg.evaluate(()=>settingsSheet());await wait(400);
ok(/Usata da 1 persona, 1 volta questo mese/.test(await txt('.sheet')),'Impostazioni: «Usata da 1 persona, 1 volta»');
await closeAll();

// 9. striscia «Oggi in hotel» e staff in sola lettura
// v61: prima «Per te in agenda» (eventi scritti da altri e non ancora visti), poi «Ok, visto» → «Oggi in hotel»
ok(/Per te in agenda/.test(await txt('.ag-strip')),'v61: striscia «Per te in agenda» per gli eventi scritti da altri');
await pg.click('.ag-strip [data-a="agVistoOk"]');await wait(500);
ok(/Oggi in hotel 09:00 Riunione settimanale · 11:00 Solo sala · 12:00 Solo cucina · \+/.test(await txt('.ag-strip')),'striscia «Oggi in hotel» per il gestore');
await view('staff');
ok(await pg.locator('header.top [data-a="agOpen"]').count()===0,'staff: niente icona del calendario');
ok(/Oggi in hotel/.test(await txt('.ag-strip')),'staff: striscia visibile');
await pg.click('.ag-strip');await wait(400);
const TS=await txt('.sheet');
ok(await pg.locator('#ag-q').count()===0&&await pg.locator('.sheet [data-a="agEdit"]').count()===0&&/Solo cucina/.test(TS),'staff: agenda in sola lettura');
ok(!/Solo sala/.test(TS)&&!/Privato di Luca/.test(TS),'staff di cucina: niente eventi della sala né privati');
// 320 px: niente scorrimento orizzontale con l'agenda aperta (gestore, mese)
await closeAll();await view('dev');await pg.setViewportSize({width:320,height:700});await wait(300);
const over=async()=>pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('header.top > *')].some(e=>e.getBoundingClientRect().right>innerWidth+1));
ok(!await over(),'320 px: intestazione con il calendario entra');
await pg.click('header.top [data-a="agOpen"]');await wait(300);await pg.click('[data-a="agV"][data-v="mese"]');await wait(300);
ok(await pg.evaluate(()=>{const s=document.querySelector('.sheet');return s.scrollWidth<=s.clientWidth+1}),'320 px: mese senza scorrimento orizzontale');
await closeAll();

// 9b. tipo (Evento | Informazione | Aggiornamento operativo | Memo) e chi crea (gestori + F&B Manager e Responsabile)
ok(await pg.evaluate(()=>agCan({ruolo:'gm',reparto:'cucina'})&&agCan({ruolo:'dev'})&&agCan({ruolo:'staff',reparto:'fb'})&&agCan({ruolo:'staff',reparto:'resp'})&&!agCan({ruolo:'staff',reparto:'cucina'})&&!agCan({ruolo:'staff',reparto:'sala'})&&!agCan(null)),'agCan: gestore, sviluppatore, F&B e Responsabile sì; cucina, sala no');
await pg.evaluate(()=>{VIEW_AS.staff.reparto='fb'});await view('staff');
ok(await pg.locator('header.top [data-a="agOpen"]').count()===1,'staff F&B Manager: icona del calendario');
await pg.click('header.top [data-a="agOpen"]');await wait(300);
ok(await pg.locator('#ag-q').count()===1,'staff F&B Manager: può scrivere nell\'agenda');
await pg.click('.sheet [data-a="agNew"]');await wait(300);
ok(await pg.locator('.sheet [data-a="agfK"]').count()===4&&await pg.locator('.sheet [data-a="agfK"][data-v="ev"][aria-pressed="true"]').count()===1,'modulo: 4 tipi, Evento di partenza');
await pg.click('.sheet [data-a="agfK"][data-v="memo"]');await wait(200);
ok(await pg.locator('.sheet [data-a="agfSet"][data-k="vis"][data-v="io"][aria-pressed="true"]').count()===1,'Memo → «Solo io»');
await pg.click('.sheet [data-a="agfK"][data-v="op"]');await wait(200);
await pg.click('.sheet [data-a="agfSet"][data-k="vis"][data-v="rep"]');await wait(200);
await pg.click('.sheet [data-a="agfRep"][data-v="cucina"]');await wait(200);
await pg.fill('#agf-t','Lavastoviglie ferma');await pg.click('.sheet [data-a="agSave"]');await wait(500);
ok(await pg.evaluate(()=>{const e=agAll().find(x=>x.t==='Lavastoviglie ferma');return e&&e.k==='op'&&e.vis==='rep'&&e.rep.join()==='cucina'&&e.g===today()}),'aggiornamento operativo salvato per la cucina (k=op)');
ok(/Aggiornamento operativo/.test(await txt('.sheet'))&&/Aggiornamento operativo: Lavastoviglie ferma|\+/.test(await txt('.ag-strip')),'etichetta del tipo in lista e striscia');
await pg.click('.sheet [data-a="agEdit"]:has-text("Lavastoviglie ferma")');await wait(300);
ok(await pg.locator('.sheet [data-a="agfK"][data-v="op"][aria-pressed="true"]').count()===1,'modifica: il tipo resta Aggiornamento operativo');
await closeAll();
ok(await pg.evaluate(()=>agK({})==='ev'&&agK({k:'zz'})==='ev'),'vecchi eventi senza tipo = Evento');
await pg.evaluate(()=>{VIEW_AS.staff.reparto='cucina'});await view('dev');await closeAll();

// 10. spenta: spariscono icona e striscia
await pg.evaluate(()=>funzSet('agenda',false));await wait(400);
ok(await pg.locator('header.top [data-a="agOpen"]').count()===0&&await pg.locator('.ag-strip').count()===0,'spenta: spariscono icona e striscia');
ok(!errs.length,'nessun errore della pagina '+JSON.stringify(errs));
await b.close();
