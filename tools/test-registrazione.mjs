// v22: registrazione dello staff. Foto profilo ridotta, modulo che sopravvive a un ricaricamento durante la foto,
// schermata «In attesa di approvazione» ed entrata automatica appena il profilo è approvato (modalità locale).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execSync } from 'node:child_process';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const IMG='/tmp/jona-foto-grande.jpg';
execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=size=4000x3000 -frames:v 1 ${IMG}`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});
await ctx.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const txt=async(sel='#app')=>(await pg.locator(sel).innerText()).replace(/\s+/g,' ');
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');await pg.waitForSelector('.testbar');
await pg.evaluate(()=>logout());await pg.waitForSelector('[data-a="register"]');

// 1. la pagina si ricarica mentre si sceglie la foto
await pg.click('[data-a="register"]');await pg.waitForTimeout(300);
for(const [k,v] of [['nome','Luca'],['cognome','Bianchi'],['username','luca'],['pw','segreto1'],['pw2','segreto1']])await pg.fill(`.sheet input[data-k="${k}"]`,v);
const [fc]=await Promise.all([pg.waitForEvent('filechooser'),pg.click('.sheet [data-a="photoLib"]')]);
const kept=await pg.evaluate(()=>ls('jona_reg'));
ok(kept&&kept.f.nome==='Luca'&&kept.f.username==='luca'&&!('pw' in kept.f)&&!('pw2' in kept.f),'modulo salvato prima della foto, senza password');
await pg.reload();await pg.waitForTimeout(800);
ok(await pg.locator('.sheet').count()===1&&await pg.inputValue('.sheet input[data-k="nome"]')==='Luca'&&await pg.inputValue('.sheet input[data-k="username"]')==='luca','dopo il ricaricamento il modulo riappare compilato');
ok(await pg.inputValue('.sheet input[data-k="pw"]')==='','password da riscrivere');
ok(/ricaricato l'app/.test(await txt('body')),'avviso che spiega cosa è successo');
ok(await pg.evaluate(()=>ls('jona_reg'))===null,'bozza usata una volta sola');

// 2. foto grande: ridotta
for(const k of ['pw','pw2'])await pg.fill(`.sheet input[data-k="${k}"]`,'segreto1');
const [fc2]=await Promise.all([pg.waitForEvent('filechooser'),pg.click('.sheet [data-a="photoLib"]')]);
await fc2.setFiles(IMG);await pg.waitForSelector('.sheet .photo-pick.has img');
const foto=await pg.evaluate(()=>S.form.foto);
ok(foto.startsWith('data:image/jpeg')&&foto.length<60000,'foto 4000×3000 ridotta a tondino ('+foto.length+' caratteri)');
ok(await pg.evaluate(()=>ls('jona_reg'))===null,'foto riuscita: bozza tolta');

// 3. attesa dell'approvazione
await pg.click('.sheet [data-a="regGo"]');await pg.waitForTimeout(500);
let t=await txt();
ok(/Ciao Luca/.test(t)&&/in attesa di approvazione/.test(t)&&await pg.locator('#app .av img').count()===1,'schermata «In attesa di approvazione» con la foto');
await pg.reload();await pg.waitForTimeout(800);
ok(/in attesa di approvazione/.test(await txt()),'la schermata resta anche riaprendo l\'app');
await pg.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='luca');return upd('staff',u.id,{stato:'attivo'})});
await pg.waitForTimeout(800);
ok(await pg.evaluate(()=>meU()&&meU().username)==='luca'&&await pg.evaluate(()=>ls('jona_wait'))===null,'approvato: entra da solo');

// 4. «Entra con un altro profilo» e profilo cancellato
await pg.evaluate(()=>logout());
await pg.click('[data-a="register"]');await pg.waitForTimeout(300);
for(const [k,v] of [['nome','Anna'],['username','anna'],['pw','segreto1'],['pw2','segreto1']])await pg.fill(`.sheet input[data-k="${k}"]`,v);
await pg.click('.sheet [data-a="regGo"]');await pg.waitForTimeout(500);
ok(/Ciao Anna/.test(await txt()),'seconda registrazione in attesa');
await pg.click('[data-a="waitLeave"]');await pg.waitForTimeout(300);
ok(await pg.locator('[data-a="doLogin"]').count()===1,'«Entra con un altro profilo» torna all\'accesso');
await pg.evaluate(()=>{const u=Object.values(D().staff).find(x=>x.username==='anna');ls('jona_wait',{id:u.id,t:Date.now()-120000});return del('staff',u.id)});
await pg.waitForTimeout(800);
ok(/non è stato approvato/.test(await txt('body'))&&await pg.evaluate(()=>ls('jona_wait'))===null,'profilo cancellato: avviso e niente attesa');
// 5. v23: nome utente proposto da nome e cognome, accenti e apostrofi, messaggi chiari
const err=async()=>{await pg.click('.sheet [data-a="regGo"]');await pg.waitForTimeout(250);const t=await pg.locator('.toast').last().innerText().catch(()=>'');return t};
await pg.click('[data-a="register"]');await pg.waitForTimeout(300);
await pg.locator('.sheet input[data-k="nome"]').pressSequentially('Mario');await pg.locator('.sheet input[data-k="cognome"]').pressSequentially('Loi');
ok(await pg.inputValue('.sheet input[data-k="username"]')==='mario.loi','«Mario Loi» → nome utente mario.loi');
await pg.fill('.sheet input[data-k="nome"]','Niccolò');await pg.fill('.sheet input[data-k="cognome"]',"D'Angelo");
ok(await pg.inputValue('.sheet input[data-k="username"]')==='niccolo.dangelo','accenti e apostrofi tolti: niccolo.dangelo');
await pg.fill('.sheet input[data-k="username"]','');
for(const k of ['pw','pw2'])await pg.fill(`.sheet input[data-k="${k}"]`,'segreto1');
ok(/Scrivi il nome utente/.test(await err()),'nome utente vuoto: «Scrivi il nome utente»');
await pg.fill('.sheet input[data-k="username"]','lo');ok(/almeno 3 caratteri/.test(await err()),'nome utente corto: «almeno 3 caratteri»');
await pg.fill('.sheet input[data-k="username"]','loi!');ok(/solo lettere, numeri/.test(await err()),'carattere strano: messaggio sui caratteri');
await pg.fill('.sheet input[data-k="username"]','Loì');await pg.click('.sheet [data-a="regGo"]');await pg.waitForTimeout(500);
ok(await pg.evaluate(()=>Object.values(D().staff).some(x=>x.username==='loi'&&x.cognome==="D'Angelo")),'«Loì» accettato come loi');
await pg.click('[data-a="waitLeave"]');await pg.waitForTimeout(300);
await pg.click('[data-a="register"]');await pg.waitForTimeout(300);
await pg.fill('.sheet input[data-k="nome"]','Luca');await pg.fill('.sheet input[data-k="cognome"]','');
await pg.fill('.sheet input[data-k="nome"]','Luca');
ok(await pg.inputValue('.sheet input[data-k="username"]')==='luca2','nome utente già usato: luca2');
await pg.click('.sheet [data-a="closeSheet"]');
ok(errs.length===0,'nessun errore '+errs.join(' | '));
await b.close();
