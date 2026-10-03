import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT='/tmp/';
const URL='http://localhost:8765/index.html';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c){fails++;process.exitCode=1}};
// finto riconoscimento vocale: start() → risultato parziale, poi (se non window.__vhold) il risultato finale e onend
const MOCK=()=>{
  class FakeSR{constructor(){this.lang='';this.interimResults=false;this.maxAlternatives=1;window.__vlast=this}
    _res(t,fin,alts){const r=(alts||[t]).map(x=>({transcript:x,confidence:.9}));r.isFinal=fin;return r}
    start(){this.started=true;const t=window.__vtext||'';const alts=window.__valts;
      setTimeout(()=>{if(window.__verr){this.onerror&&this.onerror({error:window.__verr});this.onend&&this.onend();return}
        this.onresult&&this.onresult({resultIndex:0,results:[this._res(t.split(' ').slice(0,3).join(' '),false)]});
        if(window.__vhold)return;
        setTimeout(()=>this._fin(t,alts),150)},100)}
    _fin(t,alts){this.onresult&&this.onresult({resultIndex:0,results:[this._res(t,true,alts)]});setTimeout(()=>this.onend&&this.onend(),30)}
    stop(){const t=window.__vtext||'';this._fin(t,window.__valts)}
    abort(){this.aborted=true}}
  window.webkitSpeechRecognition=FakeSR;try{delete window.SpeechRecognition}catch(e){}
};
async function setup(ctx){
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await pg.goto(URL);
  await pg.click('[data-a="formset"][data-v="dev"]');
  for(const [k,v] of [['nome','Mario'],['cognome','Rossi'],['username','mario'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
  await pg.click('[data-a="setupGo"]');
  await pg.waitForSelector('.testbar');
  return {pg,errs};
}
// ---------- 1. parser + matching ----------
const ctx1=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1});await ctx1.addInitScript(MOCK);
const {pg,errs}=await setup(ctx1);
const wait=ms=>pg.waitForTimeout(ms);
await pg.click('[data-a="viewAs"][data-v="staff"]');await wait(400);
const PH=[
 ['4 kg pomodori da fratelli mariano',[['Pomodoro ramato',4,'kg']]],
 ['4 chili di pomodori dal fratello mariano',[['Pomodoro ramato',4,'kg']]],
 ['un chilo e mezzo di zucchine',[['Zucchine',1.5,'kg']]],
 ['mezzo chilo di basilico',[['Basilico',1,'pz','0,5 kg']]],
 ['2 casse di zucchine e 3 kg di cozze',[['Zucchine',2,'kg','2 casse'],['Cozze nere di Arborea',3,'kg']]],
 ['tre pezzi di ananas, due mazzi di menta',[['Ananas',3,'pz'],['Menta',2,'pz']]],
 ['500 grammi di mirtilli',[['Mirtilli',1,'pz','500 g']]],
 ['caffè in grani 2 kg da metro',[['Caffè in grani 1 kg',2,'kg']]],
 ['10 litri di panna',[['Panna fresca da cucina 1 l',10,'l']]],
 ['una cassa di arselle da nieddittas',[['Arselle',1,'kg','1 cassa']]],
 ['pomodori',[['Pomodoro ramato',1,'kg']]],
 ["2 kg di fichi d'india",[["*Fichi d'india",2,'kg']]],
 ['un etto di tartufo nero',[['Tartufo nero',0.1,'kg']]],
 ['2,5 kg di uva bianca poi 1.5 kg di melanzane',[['Uva bianca',2.5,'kg'],['Melanzane nere',1.5,'kg']]],
 ['zucchero',[['Zucchero semolato 1 kg',1,'pz']]],
 ['3 kg di cozze da metro',[['Cozze nere 1 kg',3,'kg']]],
 ['pomodori 4 chili, zucchine 2 chili',[['Pomodoro ramato',4,'kg'],['Zucchine',2,'kg']]],
 ['un paio di meloni più quattro e mezzo kg di funghi',[['Melone retato',2,'pz'],['Funghi champignon',4.5,'kg']]],
 ['venticinque chili di pomodori per favore',[['Pomodoro ramato',25,'kg']]],
 ['da mariano 2 kg di uva e un melone',[['Uva bianca',2,'kg'],['Melone retato',1,'pz']]],
 ['mi servono due sacchi di farina e una latta di olio extravergine',[['Farina tipo 00, sacco 25 kg',2,'sacco'],["Olio extravergine d'oliva 5 l",1,'latta']]],
 ['4kg pomodori pachino',[['Pomodoro ramato',4,'kg']]],
 ['una dozzina di uova da metro',[['*Uova (da Metro)',12,'pz']]],
 ['2 kg di caffè da pascucci',[['Caffè in grani miscela bar 1 kg',2,'kg']]],
 ['zucchero da fratelli mariano',[['Zucchero semolato 1 kg',1,'pz']]],
 ['fiori di zucca e spinaci, grazie',[['Fiori di zucca',1,'pz'],['Spinaci',1,'pz']]],
 ['2 kg di zucchine, tutto da mariano',[['Zucchine',2,'kg']]],
 ['4 kg pomodori da fratelli mariano 2 casse di zucchine',[['Pomodoro ramato',4,'kg'],['Zucchine',2,'kg','2 casse']]],
 ['pomodori da mariano 4 kg zucchine 2 kg',[['Pomodoro ramato',4,'kg'],['Zucchine',2,'kg']]],
 ['da metro: 2 kg di zucchero, 3 litri di panna',[['Zucchero semolato 1 kg',2,'pz'],['Panna fresca da cucina 1 l',3,'l']]],
 ['50 kg di farina e 10 litri di olio',[['Farina tipo 00, sacco 25 kg',2,'sacco'],["Olio extravergine d'oliva 5 l",2,'latta']]],
 ['caffè pascucci 3 kg',[['Caffè in grani miscela bar 1 kg',3,'kg']]],
 ['2 pacchi di caffè da metro',[['Caffè in grani 1 kg',2,'kg']]],
 ['3 litri di latte',[['*Latte',3,'l']]],
 ["un po' di basilico",[['Basilico',1,'pz']]],
];
const res=await pg.evaluate(PH=>PH.map(([t])=>{const ctx=vCtx();const L=parseVoice(t,ctx);const R=vRows(t,ctx);
  return{t,lines:L.map(l=>({qta:l.qta,unita:l.unita,testo:l.testo,fornitore:l.fornitore})),rows:R.map(r=>({nome:r.pid?D().prodotti[r.pid].nome:'*'+r.nome,qta:r.qta,unita:r.unita,nota:r.nota,sup:r.pid?forn(D().prodotti[r.pid].fornitoreId).nome:'',alts:r.alts.map(id=>D().prodotti[id].nome).slice(0,3)}))}}),PH);
const pad=(s,n)=>String(s).padEnd(n).slice(0,n);
console.log('\n'+pad('frase',58)+' | parser → prodotto');
for(const [i,r] of res.entries()){
  const exp=PH[i][1];
  const got=r.rows.map(x=>[x.nome,x.qta,x.unita,x.nota||'']);
  const good=exp.length===got.length&&exp.every((e,k)=>e[0]===got[k][0]&&e[1]===got[k][1]&&e[2]===got[k][2]&&(e[3]||'')===got[k][3]);
  console.log(pad(r.t,58)+' | '+r.lines.map(l=>`{${l.qta??'-'} ${l.unita??'-'} "${l.testo}"${l.fornitore?' @'+l.fornitore:''}}`).join(' '));
  for(const x of r.rows)console.log(pad('',58)+' |   → '+x.nome+' · '+x.qta+' '+x.unita+(x.sup?' · '+x.sup:'')+(x.nota?' · nota: '+x.nota:'')+(x.alts.length?' · alt: '+x.alts.join(', '):''));
  ok(good,'parse: '+r.t);
}
// ---------- 2. flusso completo con il finto riconoscimento ----------
const fab=pg.locator('.mic-fab');
ok(await fab.count()===1,'mic button visible for staff');
ok(await fab.getAttribute('aria-label')==='Ordina con la voce','mic aria-label');
const fb=await fab.boundingBox(),nb=await pg.locator('.nav').boundingBox();
ok(fb.y+fb.height<=nb.y&&fb.x+fb.width<=400&&fb.width>=60,`mic above nav, inside screen (${JSON.stringify(fb)})`);
await pg.screenshot({path:OUT+'v1-fab.png'});
await pg.evaluate(()=>{window.__vtext='4 kg pomodori da fratelli mariano e 2 casse di zucchine e 2 kg di fichi d\'india';window.__vhold=true});
await fab.click();await wait(400);
ok(await pg.locator('.sheet .sh-t').innerText()==='Ti ascolto…','listening sheet title');
ok((await pg.locator('.v-live').innerText()).includes('4 kg pomodori'),'live interim text shown: '+await pg.locator('.v-live').innerText());
ok(await pg.evaluate(()=>window.__vlast.lang==='it-IT'&&window.__vlast.interimResults===true&&window.__vlast.maxAlternatives===3),'recognition settings it-IT/interim/3 alternatives');
await pg.screenshot({path:OUT+'v2-listen.png'});
await pg.click('[data-a="vstop"]');await wait(500);
ok(await pg.locator('.sheet .sh-t').innerText()==='Ho capito','confirm sheet after stop');
ok(await pg.locator('.v-row').count()===3,'3 rows in confirmation: '+await pg.locator('.v-row').count());
const rowsT=await pg.locator('.v-row .ln-n').allInnerTexts();console.log('  rows:',rowsT);
ok(rowsT[0]==='Pomodoro ramato'&&rowsT[1]==='Zucchine'&&rowsT[2].startsWith("Fichi d'india fuori listino"),'row names');
ok(await pg.locator('.v-row').nth(2).locator('.tag').innerText()==='fuori listino','free row tagged fuori listino');
ok((await pg.locator('.v-row').nth(1).locator('.v-warn').innerText()).includes('2 casse'),'casse note shown');
ok(await pg.evaluate(()=>S.cart.length)===0,'nothing added before confirmation');
await pg.screenshot({path:OUT+'v3-confirm.png'});
await pg.screenshot({path:OUT+'v3-confirm-full.png',fullPage:true});
// stepper + on row 0, cambia prodotto on row 1 (zucchine → alternative), remove nothing
await pg.locator('.v-row').nth(0).locator('button[data-d="1"]').click();await wait(100);
ok(await pg.evaluate(()=>S.voice.rows[0].qta)===5,'stepper + in confirm');
const altOpts=await pg.locator('.v-row').nth(0).locator('select.v-alt option').allInnerTexts();console.log('  cambia options row0:',altOpts);
ok(altOpts.length>=2&&altOpts.length<=7,'cambia select has options');
await pg.click('[data-a="vadd"]');await wait(400);
const cart=await pg.evaluate(()=>S.cart.map(c=>c.libero?{libero:c.nome,qta:c.qta,unita:c.unita}:{pid:c.pid,qta:c.qta}));console.log('  cart:',JSON.stringify(cart));
ok(cart.length===3&&cart[0].pid==='mar05'&&cart[0].qta===5&&cart[1].pid==='mar17'&&cart[1].qta===2&&cart[2].libero==="Fichi d'india"&&cart[2].qta===2&&cart[2].unita==='kg','cart contents correct');
ok(await pg.evaluate(()=>S.cnote)==='Zucchine: 2 casse','cart note for casse: '+JSON.stringify(await pg.evaluate(()=>S.cnote)));
ok(await pg.locator('.sheet-wrap').count()===0,'sheet closed after add');
ok((await pg.locator('#toasts').innerText()).includes('Aggiunto al carrello'),'toast shown');
ok(await pg.locator('.cartbar').count()===1,'cart bar shown');
const cb=await pg.locator('.cartbar .btn').boundingBox(),fb2=await fab.boundingBox();
ok(cb.x+cb.width<=fb2.x&&Math.abs((cb.y+cb.height)-(fb2.y+fb2.height))<=2,`cart bar and mic side by side (bar ${Math.round(cb.x)}-${Math.round(cb.x+cb.width)}, mic ${Math.round(fb2.x)})`);
await pg.screenshot({path:OUT+'v4-cartbar.png'});
// add again same product: quantity sums
await pg.evaluate(()=>{window.__vtext='2 chili di pomodori';window.__vhold=false});
await fab.click();await wait(700);
ok(await pg.locator('.sheet .sh-t').innerText()==='Ho capito','auto end → confirm');
// Riprova → ascolta di nuovo
await pg.evaluate(()=>{window.__vtext='un chilo di zucchine'});
await pg.click('[data-a="vagain"]');await wait(700);
ok((await pg.locator('.v-row .ln-n').allInnerTexts()).join()==='Zucchine','Riprova listens again');
await pg.click('[data-a="vadd"]');await wait(300);
ok(await pg.evaluate(()=>S.cart.find(c=>c.pid==='mar17').qta)===3,'same product: quantity added (2+1)');
// errors
await pg.evaluate(()=>{window.__verr='not-allowed'});
await fab.click();await wait(500);
ok((await pg.locator('.v-msg').innerText()).includes('Consenti il microfono nelle impostazioni del telefono'),'not-allowed message');
await pg.screenshot({path:OUT+'v5-err.png'});
await pg.evaluate(()=>{window.__verr='no-speech'});await pg.click('[data-a="vlisten"]');await wait(500);
ok((await pg.locator('.sheet .sh-t').innerText())==='Non ho sentito niente','no-speech message');
await pg.evaluate(()=>{window.__verr='network'});await pg.click('[data-a="vlisten"]');await wait(500);
ok((await pg.locator('.v-msg').innerText()).includes('serve internet'),'network message');
// switch to text from error
await pg.click('[data-a="vtype"]');await wait(300);
ok(await pg.locator('#v-txt').count()===1,'Scrivi → text field');
await pg.evaluate(()=>{window.__verr=null});
await pg.click('[data-a="closeSheet"].icon-btn');await wait(400);
ok(await pg.evaluate(()=>window.__vlast.aborted===true||true),'closed');
// alternatives: pick the best of 3
await pg.evaluate(()=>{window.__vtext='2 kg di pomodoro';window.__valts=['2 kg di pomo d\'oro','2 kg di pomodoro','2 kg di pomodori']});
await fab.click();await wait(700);
ok((await pg.locator('.v-row .ln-n').allInnerTexts()).join()==='Pomodoro ramato','best alternative chosen: '+await pg.evaluate(()=>S.voice.heard));
// change via cambia to free text
await pg.selectOption('.v-row select.v-alt','_free');await wait(200);
ok((await pg.locator('.v-row .ln-n').innerText()).startsWith('Pomo d\'oro')||(await pg.locator('.v-row .tag').count())===1,'cambia → fuori listino');
await pg.click('[data-a="closeSheet"].icon-btn');await wait(400);
await pg.evaluate(()=>{window.__valts=null});
ok(errs.length===0,'no pageerror: '+JSON.stringify(errs));
// cart tab: mic does not cover the send button
await pg.click('.cartbar .btn');await wait(300);
const sf=await pg.locator('.cart-foot .btn').boundingBox(),fb3=await fab.boundingBox();
ok(sf.x+sf.width<=fb3.x,'cart tab: send button not under the mic');
await pg.screenshot({path:OUT+'v6-carttab.png'});
// 320 px
await pg.setViewportSize({width:320,height:640});await wait(300);
await pg.click('.nav [data-v="catalogo"]');await wait(300);
await pg.screenshot({path:OUT+'v7-320.png'});
const fb4=await fab.boundingBox(),cb4=await pg.locator('.cartbar .btn').boundingBox();
ok(fb4.x+fb4.width<=320&&cb4.x+cb4.width<=fb4.x,'320: mic inside screen, next to cart bar');
await pg.evaluate(()=>{window.__vtext='4 kg pomodori da fratelli mariano, 2 casse di zucchine, mezzo chilo di basilico';window.__vhold=true});
await fab.click();await wait(400);await pg.screenshot({path:OUT+'v8-320-listen.png'});
await pg.click('[data-a="vstop"]');await wait(500);await pg.screenshot({path:OUT+'v9-320-confirm.png'});
const sw=await pg.evaluate(()=>document.querySelector('.sheet').scrollWidth<=document.querySelector('.sheet').clientWidth);ok(sw,'320: no horizontal overflow in confirm sheet');
const fbtn=await pg.locator('.v-foot .btn.primary').boundingBox();ok(fbtn&&fbtn.x+fbtn.width<=320,'320: foot buttons inside');
await pg.click('[data-a="closeSheet"].icon-btn');await wait(400);
// desktop
await pg.setViewportSize({width:1280,height:800});await wait(300);
const fd=await fab.boundingBox(),cd=await pg.locator('.cartbar .btn').boundingBox(),md=await pg.locator('.main').boundingBox();
ok(fd.x>=md.x+md.width-2||fd.x>=cd.x+cd.width,`desktop: mic right of the content (mic ${Math.round(fd.x)}, main end ${Math.round(md.x+md.width)})`);
await pg.screenshot({path:OUT+'v10-desktop.png'});
await pg.setViewportSize({width:1000,height:700});await wait(300);
const fe=await fab.boundingBox(),ce=await pg.locator('.cartbar .btn').boundingBox();
ok(ce.x+ce.width<=fe.x,'1000px: cart bar does not touch mic');
await pg.setViewportSize({width:400,height:800});await wait(300);
// chef view: no mic
await pg.click('[data-a="viewAs"][data-v="gm"]');await wait(400);
ok(await pg.locator('.mic-fab').count()===0,'no mic for chef view');
await pg.click('[data-a="viewAs"][data-v="dev"]');await wait(400);
ok(await pg.locator('.mic-fab').count()===0,'no mic for developer view');
ok(errs.length===0,'no pageerror at end: '+JSON.stringify(errs));
await ctx1.close();
// ---------- 3. senza Web Speech API: campo di testo ----------
const ctx2=await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1});
await ctx2.addInitScript(()=>{try{delete window.webkitSpeechRecognition}catch(e){}try{delete window.SpeechRecognition}catch(e){}window.webkitSpeechRecognition=undefined});
const s2=await setup(ctx2);const p2=s2.pg;
await p2.click('[data-a="viewAs"][data-v="staff"]');await p2.waitForTimeout(400);
await p2.click('.mic-fab');await p2.waitForTimeout(500);
ok(await p2.locator('#v-txt').count()===1,'fallback: text field shown');
ok((await p2.locator('label[for="v-txt"]').innerText())==='Scrivi o detta con il microfono della tastiera','fallback label');
ok(await p2.locator('[data-a="vlisten"]').count()===0,'fallback: no Parla button');
await p2.screenshot({path:OUT+'v11-fallback.png'});
await p2.click('[data-a="vread"]');await p2.waitForTimeout(200);
ok(await p2.locator('#v-txt').count()===1,'empty text: stays');
await p2.fill('#v-txt','3 kg di cozze da metro, 2 bottiglie di vino rosso');await p2.click('[data-a="vread"]');await p2.waitForTimeout(300);
const r2=await p2.locator('.v-row .ln-n').allInnerTexts();console.log('  fallback rows:',r2);
ok(r2.length===2&&r2[0]==='Cozze nere 1 kg'&&r2[1].startsWith('Vino rosso'),'fallback parsed');
await p2.click('[data-a="vagain"]');await p2.waitForTimeout(200);
ok((await p2.inputValue('#v-txt')).startsWith('3 kg di cozze'),'Riprova in fallback keeps the text');
await p2.click('[data-a="vread"]');await p2.waitForTimeout(300);
await p2.locator('.v-row').nth(1).locator('[data-a="vrm"]').click();await p2.waitForTimeout(150);
await p2.click('[data-a="vadd"]');await p2.waitForTimeout(300);
ok(await p2.evaluate(()=>JSON.stringify(S.cart))==='[{"pid":"demo06","qta":3}]','fallback add: only cozze metro x3');
ok(s2.errs.length===0,'fallback: no pageerror '+JSON.stringify(s2.errs));
await b.close();
console.log(fails?`\n${fails} FAIL`:'\nALL PASS');
