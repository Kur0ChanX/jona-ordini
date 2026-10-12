// D39 / v89 + D41 / v90: disegni degli ingredienti del Bar (stile B inchiostro e acquerello) su foglio di carta.
// Ogni ingrediente dei cocktail e ogni tipo di bottiglia ha un disegno suo; senza file dei disegni il Bar funziona lo stesso.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const J=JSON.parse(readFileSync(new URL('../data/bar-disegni.json',import.meta.url),'utf8'));
const CK=JSON.parse(readFileSync(new URL('../data/cocktail.json',import.meta.url),'utf8'));
const SW=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const IDX=readFileSync(new URL('../index.html',import.meta.url),'utf8');
// dati
const keys=Object.keys(J.g);
ok(keys.length>=40,'almeno 40 disegni ('+keys.length+')');
ok(keys.every(k=>Array.isArray(J.g[k].w)&&J.g[k].w.length&&J.g[k].d),'ogni disegno ha acquerello e linee');
ok(J.r.every(r=>J.g[r[1]]&&(!r[2]||/^#[0-9A-F]{6}$/i.test(r[2]))),'ogni regola porta a un disegno che esiste, colori validi');
const RE=J.r.map(r=>[new RegExp(r[0]),r[1]]);
const base=n=>String(n||'').replace(/\s*\(.*\)$/,'').toLowerCase();
const trova=n=>RE.find(r=>r[0].test(base(n)));
const ingr=[...new Set(CK.c.flatMap(c=>c[4].map(x=>x[2])))];
const senza=ingr.filter(n=>!trova(n));
ok(!senza.length,'ogni ingrediente dei cocktail ha il suo disegno ('+ingr.length+')'+(senza.length?': manca '+senza.join(', '):''));
const cats=[...IDX.matchAll(/const BR_CAT=([\s\S]*?\]\]\]);/g)][0];
const BR_CAT=cats?eval(cats[1]):[];
const catSenza=BR_CAT.flatMap(x=>x[1]).filter(n=>!trova(n));
ok(BR_CAT.length&&!catSenza.length,'ogni tipo di bottiglia ha il suo disegno'+(catSenza.length?': manca '+catSenza.join(', '):''));
const k=n=>(trova(n)||[])[1];
const x2=o=>Object.values(o);
ok(k('Succo di lime')==='lime'&&k('Gin')==='gin'&&k('Foglie di menta')==='menta'&&k('Ghiaccio')==='ghiaccio'&&k('Campari')==='lq_campari'&&k('Cherry brandy')==='lq_cherry_brandy'&&k('Crema di whisky')==='lq_crema_di_whisky'&&k('Rum scuro')==='rum'&&k('Lemon soda')==='soda'&&k('Acqua di fiori d\'arancio')==='fiore','regole: lime, gin, menta, ghiaccio, Campari, Cherry brandy (liquore, non brandy), Crema di whisky (liquore, non whisky), rum, lemon soda, fiori d\'arancio');
ok(SW.includes("'./data/bar-disegni.json'"),'sw.js: disegni in FILES (funzionano senza rete)');
const gz=gzipSync(JSON.stringify(J)).length;
ok(gz<30000,'file dei disegni leggero ('+gz+' byte compressi)');
// v90 (D41): niente doppioni
ok(k('Ginger beer')==='soda'&&k('Ginger ale')==='soda','ginger beer e ginger ale non prendono il disegno del gin');
const col=n=>{const r=trova(n);return r[1]+'|'+(r[2]||'')};
const tutti=[...new Set([...ingr.map(base),...BR_CAT.flatMap(x=>x[1]).map(base)])];
const generici=tutti.filter(n=>/^(liquore|bottiglia)$/.test(k(n)));
ok(!generici.length,'ogni liquore ha la sua bottiglia, nessuna bottiglia generica'+(generici.length?': '+generici.join(', '):''));
const simili=[['Bourbon','Rye whiskey','Scotch whisky','Scotch whisky torbato','Whisky irlandese'],['Calvados','Brandy','Cognac'],['Pisco','Grappa'],['Rum bianco','Cachaça'],['Champagne','Prosecco'],['Fernet','Amaro','Jägermeister'],['Vermouth dry','Lillet blanc'],['Crème de mûre','Mirto'],['Chartreuse verde','Absinthe','Liquore alla mela verde','Liquore al melone'],['Tabasco','Peperoncino rosso'],['Granatina','Succo di melograno']];
for(const g of simili)ok(new Set(g.map(col)).size===g.length,'disegni diversi: '+g.join(', '));
const ckSvg=c=>{const x=J.k[c[0]];if(!x||!J.b[x[0]])return null;return JSON.stringify([J.b[x[0]].op||x[1],x[0],x.slice(2).map(p=>J.pz[p])])};
const imp=CK.c.map(ckSvg);
ok(imp.every(Boolean)&&x2(J.k).every(x=>x.slice(2).every(p=>J.pz[p])),'ogni cocktail ha il suo disegno, pezzi tutti presenti ('+CK.c.length+')');
ok(new Set(imp).size===CK.c.length,'cocktail: '+new Set(imp).size+' disegni diversi su '+CK.c.length);
ok(Object.values(J.b).every(x=>x.h&&x.sh&&x.x),'ogni bicchiere ha riflesso, ombra e macchia (D42)');
ok(J.k['Negroni'].some(p=>/^g\|Old fashioned\|aranciaM/.test(p))&&J.k['Mojito'].some(p=>/^ml\|Highball/.test(p))&&J.k['Margarita'].some(p=>/^r\|Coppa margarita\|m$/.test(p)),'Negroni mezza fetta, Mojito menta pestata, Margarita metà bordo di sale');
ok(J.k['Negroni'][0]==='Old fashioned'&&J.k['Spritz']&&J.k['Moscow Mule'][0]==='Tazza di rame','bicchieri giusti (Negroni old fashioned, Moscow Mule tazza di rame)');
// app
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
async function apri(rotto){
  const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:rotto?'block':'allow'});
  if(rotto)await ctx.route('**/data/bar-disegni.json',r=>r.fulfill({status:404,body:'no'}));
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/#demo');await pg.click('[data-a="demoGo"]');await pg.waitForTimeout(1200);
  await pg.click('nav [data-a="tab"][data-v="fornitori"]');await pg.waitForTimeout(300);
  await pg.click('main [data-a="brOpen"]');await pg.waitForSelector('.sheet [data-a="brC"]');await pg.waitForTimeout(400);
  return {ctx,pg,errs}}
const sh=pg=>pg.locator('.sheet').last();
async function cocktail(pg,nome){await sh(pg).locator('input#brq').fill(nome);await pg.waitForTimeout(300);
  await sh(pg).locator('[data-a="brC"]').filter({hasText:nome}).first().click();await pg.waitForTimeout(500)}
{const {ctx,pg,errs}=await apri(false);
  const righe=await sh(pg).locator('[data-a="brC"]').count();
  ok(righe>0&&await sh(pg).locator('[data-a="brC"] .br-ckd').count()===righe,'lista dei cocktail: ogni riga ha il suo disegno ('+righe+')');
  ok(await sh(pg).locator('[data-a="brC"] .br-ckd .wa').first().evaluate(e=>getComputedStyle(e).filter)==='none','lista: acquerello spento (leggera)');
  ok(await sh(pg).locator('[data-a="brC"] .br-ckd linearGradient, [data-a="brC"] .br-ckd .br-dr').count()===0,'lista: niente sfumatura né goccioline (leggera)');
  {const nh=await sh(pg).locator('[data-a="brC"] .br-ckd .br-h').count(),nr=await sh(pg).locator('[data-a="brC"] .br-ckd').count();ok(nr>0&&nh===nr,'lista: ogni cocktail con il riflesso del vetro ('+nh+'/'+nr+')')}
  await cocktail(pg,'Negroni');
  ok(await sh(pg).locator('.br-ckbig .br-dis').count()===1,'scheda del Negroni: disegno grande del cocktail in cima');
  const bw=await sh(pg).locator('.br-ckbig .br-dis').boundingBox();
  ok(bw&&bw.width>=120,'disegno grande largo almeno 120 px ('+(bw&&Math.round(bw.width))+')');
  // v92 (D42, «A lista + B scheda»): scheda illustrata, lista con i dettagli ma leggera
  const big=sh(pg).locator('.br-ckbig .br-dis');
  ok(await big.locator('linearGradient').count()===1&&/url\(#br-lg\d+\)/.test(await big.locator('.wa').nth(1).getAttribute('fill')),'scheda: colore del drink che sfuma');
  ok(await big.locator('.br-dr ellipse').count()>=2&&await big.locator('.br-sh').count()===1,'scheda: goccioline e ombra');
  ok(await big.locator('.br-h path').count()>=1&&await big.locator('.br-f').count()===1,'scheda: riflessi e linee fini del vetro');
  ok(await sh(pg).locator('.br-ing.br-carta').count()===1,'Negroni: ingredienti sul foglio di carta');
  ok(await sh(pg).locator('.br-ir .br-dis').count()===3,'Negroni: 3 ingredienti, 3 disegni');
  ok(await sh(pg).locator('.br-ir .br-dis .ink').evaluateAll(l=>l.every(g=>g.children.length>0)),'ogni disegno ha le linee a penna');
  ok(await pg.evaluate(()=>document.querySelectorAll('#br-wash').length===1),'filtro acquerello nella pagina una volta sola');
  const filtro=()=>pg.evaluate(()=>getComputedStyle(document.querySelector('.br-ir .br-dis .wa')).filter);
  await pg.evaluate(()=>document.documentElement.classList.remove('lite'));
  ok(/br-wash/.test(await filtro()),'telefono normale: effetto acquerello acceso');
  await pg.evaluate(()=>document.documentElement.classList.add('lite'));
  ok(await filtro()==='none','telefono economico (lite): acquerello spento');
  ok(await sh(pg).locator('.br-ir').first().evaluate(e=>getComputedStyle(e.querySelector('b')).color)==='rgb(42, 36, 32)','testo scuro sulla carta');
  await pg.evaluate(()=>document.documentElement.dataset.theme='dark');await pg.waitForTimeout(100);
  ok(await sh(pg).locator('.br-ir').first().evaluate(e=>getComputedStyle(e.querySelector('b')).color)==='rgb(42, 36, 32)','tema scuro: la carta resta chiara con testo scuro');
  await sh(pg).locator('[data-a="closeSheet"]').click();await pg.waitForTimeout(300);
  await cocktail(pg,'Mojito');
  ok(await sh(pg).locator('.br-ir .br-dis').count()===await sh(pg).locator('.br-ir').count(),'Mojito: un disegno per ogni ingrediente');
  await sh(pg).locator('[data-a="closeSheet"]').click();await pg.waitForTimeout(300);
  await sh(pg).locator('[data-a="brV"][data-v="inv"]').click();await pg.waitForTimeout(400);
  const gl=await sh(pg).locator('.br-gl').count();
  ok(gl>0&&await sh(pg).locator('.br-gl .br-dis').count()===gl,'inventario: ogni gruppo ha il suo disegno ('+gl+')');
  const ink=await sh(pg).locator('.br-gl .br-dis .ink').first().evaluate(e=>getComputedStyle(e).stroke);
  ok(ink!=='rgb(42, 36, 32)','tema scuro: disegni dei gruppi chiari (si vedono sullo sfondo scuro)');
  await sh(pg).locator('[data-a="brV"][data-v="ck"]').click();await pg.waitForTimeout(300);
  await sh(pg).locator('[data-a="closeSheet"]').click();await pg.waitForTimeout(300);
  await pg.click('main [data-a="brOpen"]');await pg.waitForTimeout(500);
  ok(await pg.evaluate(()=>document.querySelectorAll('#br-wash').length===1),'riaperto il Bar: filtro sempre una volta sola');
  ok(!errs.length,'nessun errore'+(errs.length?': '+errs.join(' | '):''));
  await ctx.close()}
{const {ctx,pg,errs}=await apri(true);
  ok(await sh(pg).locator('.br-ckd').count()===0,'senza file dei disegni: lista dei cocktail senza disegni');
  await cocktail(pg,'Negroni');
  ok(await sh(pg).locator('.br-ckbig').count()===0,'senza file: niente spazio vuoto per il disegno grande');
  ok(await sh(pg).locator('.br-ir').count()===3&&await sh(pg).locator('.br-dis').count()===0,'senza file dei disegni: ingredienti mostrati, senza disegni');
  ok(await sh(pg).locator('.br-carta').count()===0,'senza disegni niente carta (resta la lista di prima)');
  ok(!errs.length,'nessun errore senza disegni'+(errs.length?': '+errs.join(' | '):''));
  await ctx.close()}
await b.close();
