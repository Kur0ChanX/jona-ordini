// v40: barra Test dello sviluppatore (cambio vista senza avvisi in coda, pulsante attivo colorato) e niente nome del creatore nei testi dell'app
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const _nc=b.newContext.bind(b);b.newContext=async o=>{const c=await _nc(o);await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));return c};
const ctx=await b.newContext({viewport:{width:390,height:800}});
const pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
await pg.goto('http://localhost:8765/index.html');
await pg.click('[data-a="formset"][data-v="dev"]');
for(const [k,v] of [['nome','Luca'],['cognome','Rossi'],['username','luca'],['pw','password123'],['pw2','password123']])await pg.fill(`input[data-k="${k}"]`,v);
await pg.click('[data-a="setupGo"]');
await pg.waitForSelector('.testbar');await pg.waitForTimeout(300);
await pg.evaluate(()=>document.querySelectorAll('#toasts .toast').forEach(t=>t.remove()));
// cambio vista veloce: nessun avviso in coda
for(const v of ['gm','staff','dev','gm','staff','dev','gm'])await pg.click(`.testbar [data-a="viewAs"][data-v="${v}"]`);
await pg.waitForTimeout(400);
ok(await pg.locator('#toasts .toast').count()===0,'cambio vista veloce: nessun avviso in coda');
// pulsante della vista attuale premuto e colorato diverso dagli altri
const st=await pg.evaluate(()=>[...document.querySelectorAll('.testbar [data-a="viewAs"]')].map(b=>({v:b.dataset.v,p:b.getAttribute('aria-pressed'),bg:getComputedStyle(b).backgroundColor})));
const on=st.filter(x=>x.p==='true');
ok(on.length===1&&on[0].v==='gm','solo «Admin Chef» premuto: '+JSON.stringify(st));
const lag=await pg.evaluate(()=>{const d=document.createElement('i');d.style.color='var(--lagoon)';document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c});
ok(on.length===1&&on[0].bg===lag,'il pulsante attivo è colorato (laguna): '+on[0]?.bg+' '+lag);
// testi: il nome del creatore non compare in ciò che vede chi usa l'app (solo note tecniche per lo sviluppatore)
const dev=await pg.evaluate(async()=>(await newsOld(),newsList()).flatMap(n=>Object.values(n.dev||{}).flat()));
let src=readFileSync(new URL('../index.html',import.meta.url),'utf8').replace(/\\'/g,"'");
for(const t of dev)src=src.split(t).join('');
src=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/referente:'Mario'/g,'');
const left=[...(src.match(/.{0,40}\bMario\b.{0,20}/g)||[]),...(src.match(/.{0,40}(miscera|kur0chanx).{0,20}/gi)||[])];
ok(left.length===0,'nessun «Mario» nei testi dell\'app: '+JSON.stringify(left));
// v43: vista «F&B Mauro» = staff del reparto fb, che può creare in agenda; la barra sta in 320 px
await pg.click('.testbar [data-a="viewAs"][data-v="fb"]');await pg.waitForTimeout(300);
const fb=await pg.evaluate(()=>{const u=meU();return{r:u.ruolo,rep:u.reparto,mgr:isMgr(u),ag:agCan(u),txt:document.querySelector('.testbar [aria-pressed="true"]')?.textContent}});
ok(fb.r==='staff'&&fb.rep==='fb'&&!fb.mgr&&fb.ag&&fb.txt==='F&B Mauro','vista F&B: staff reparto fb, crea in agenda, non gestore: '+JSON.stringify(fb));
await pg.setViewportSize({width:320,height:700});await pg.waitForTimeout(300);
const ov=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,...[...document.querySelectorAll('.testbar [data-a="viewAs"]')].map(b=>Math.round(b.getBoundingClientRect().right))]);
ok(ov[0]<=ov[1]&&ov.slice(2).every(r=>r<=ov[1]),'barra Test con 5 viste dentro 320 px: '+JSON.stringify(ov));
// v93: vista «Bar» in fondo = barista (staff di sala, Bartender): vede il Bar e la Cantina, non è gestore
const ord=await pg.evaluate(()=>[...document.querySelectorAll('.testbar [data-a="viewAs"]')].map(b=>b.dataset.v).join());
ok(ord==='gm,fb,staff,dev,bar','vista «Bar» in fondo alla barra Test: '+ord);
await pg.click('.testbar [data-a="viewAs"][data-v="bar"]');await pg.waitForTimeout(300);
const br=await pg.evaluate(()=>{const u=meU();return{r:u.ruolo,rep:u.reparto,bar:isBar(u),mgr:isMgr(u),br:brOn(u),vn:vnOn(u),txt:document.querySelector('.testbar [aria-pressed="true"]')?.textContent,cta:!!document.querySelector('[data-a="brOpen"]')}});
ok(br.r==='staff'&&br.rep==='sala'&&br.bar&&!br.mgr&&br.br&&br.vn&&br.txt==='Bar','vista Bar: barista, vede Bar e Cantina, non gestore: '+JSON.stringify(br));
const ov2=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
ok(ov2[0]<=ov2[1],'vista Bar dentro 320 px: '+JSON.stringify(ov2));
// il barista ordina la sua roba e la manda allo chef (Maurizio): Catalogo, Carrello, «Invia allo chef»
const tabs=await pg.evaluate(()=>[...document.querySelectorAll('[data-a="tab"]')].map(b=>b.dataset.v));
ok(['catalogo','carrello','miei'].every(t=>tabs.includes(t)),'vista Bar: Catalogo, Carrello e I miei ordini: '+tabs.join());
await pg.click('[data-a="tab"][data-v="catalogo"]');await pg.waitForTimeout(300);
const add=pg.locator('[data-a="cadd"]').first();
ok(await add.count()===1,'vista Bar: nel catalogo si aggiungono prodotti');
if(await add.count()){await add.click();await pg.waitForTimeout(300);
  ok(/Invia allo chef/.test(await pg.locator('.cartbar').innerText().catch(()=>'')),'vista Bar: compare «Invia allo chef»');}
ok(!errs.length,'nessun errore: '+errs.join(' | '));
await b.close();
