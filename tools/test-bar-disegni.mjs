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
const pid=p=>p.split('@')[0].replace(/~[\d.]+$/,'');
// v92 #103: nella tazza di rame si vede il drink dall'apertura (pezzo sf|): conta anche il suo colore
const colV=x=>J.b[x[0]].op&&!x.some(p=>/^sf\|/.test(p))?J.b[x[0]].op:x[1];
const ckSvg=c=>{const x=J.k[c[0]];if(!x||!J.b[x[0]])return null;return JSON.stringify([colV(x),x[0],x.slice(2).map(p=>[J.pz[pid(p)],p.split('@')[1]])])};
const imp=CK.c.map(ckSvg);
ok(imp.every(Boolean)&&x2(J.k).every(x=>x.slice(2).every(p=>J.pz[pid(p)]&&(!p.includes('@')||/@-?[\d.]+,-?[\d.]+$/.test(p)))),'ogni cocktail ha il suo disegno, pezzi tutti presenti ('+CK.c.length+')');
ok(new Set(imp).size===CK.c.length,'cocktail: '+new Set(imp).size+' disegni diversi su '+CK.c.length);
ok(Object.values(J.b).every(x=>x.h&&x.sh&&x.x),'ogni bicchiere ha riflesso, ombra e macchia (D42)');
ok(J.k['Negroni'].some(p=>/^g\|aranciaM@/.test(p))&&J.k['Mojito'].some(p=>/^ml\|Highball/.test(p))&&J.k['Margarita'].some(p=>/^r\|Coppa margarita\|m$/.test(p)),'Negroni mezza fetta, Mojito menta pestata, Margarita metà bordo di sale');
// D42 passo 2 (Mario #97 «meno foto simili e inerenti al cocktail»): somiglianza = stesso bicchiere, differenza di colore (Lab) + 12 per ogni pezzo diverso
{const lab=h=>{const[r,g,b]=[1,3,5].map(i=>{let x=parseInt(h.slice(i,i+2),16)/255;return x>.04045?((x+.055)/1.055)**2.4:x/12.92});const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116,X=(r*.4124+g*.3576+b*.1805)/.95047,Y=r*.2126+g*.7152+b*.0722,Z=(r*.0193+g*.1192+b*.9505)/1.08883;return[116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z))]};
 const pz=k=>new Set(k.slice(2).map(p=>pid(p).replace(/\|\d+$/,''))),N=CK.c.map(c=>c[0]),sim=[];
 for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=J.k[N[i]],b=J.k[N[j]];if(a[0]!==b[0])continue;const A=pz(a),B=pz(b);let n=0;for(const x of A)if(!B.has(x))n++;for(const x of B)if(!A.has(x))n++;
   const la=lab(colV(a)),lb=lab(colV(b)),d=Math.hypot(la[0]-lb[0],la[1]-lb[1],la[2]-lb[2])+12*n;if(d<10)sim.push(N[i]+' ~ '+N[j])}
 ok(!sim.length,'nessuna coppia di cocktail troppo simile'+(sim.length?': '+sim.join(', '):''));
 const ha=(n,re)=>J.k[n]&&J.k[n].some(p=>re.test(p));
 const SEGNI=[['Tequila Sunrise',/^st\|/,'strati'],['B-52',/^st\|/,'strati'],['Black Velvet',/^st\|/,'strati'],['White Russian',/^st\|/,'panna sopra'],['Piña Colada',/^g\|ananasC(~[\d.]+)?@/,'ananas e ciliegina'],['Piña Colada',/^u\|/,'ombrellino'],
  ['Whiskey Sour',/^fo\|/,'schiuma'],['Pisco Sour',/^g\|.*angostura/,'gocce di angostura'],['Horse\'s Neck',/^g\|.*spirale/,'spirale di scorza'],['Manhattan',/^g\|.*ciliegiaF/,'ciliegina sul fondo'],['Jägerbomb',/^jb\|/,'shot dentro'],
  ['Irish Coffee',/^vp\|/,'vapore'],['Ramos Gin Fizz',/^ft\|/,'schiuma alta'],['Frozen Daiquiri',/^dm\|/,'frullato'],['Espresso Martini',/chicchi/,'chicchi'],['Champagne Cocktail',/^zo\|/,'zolletta'],['Caipirinha',/^ls\|/,'lime nel bicchiere'],
  ['Bloody Mary',/sedano/,'sedano'],['Oaxaca Old Fashioned',/scorzaaranciaF/,'scorza fiammata'],['Clover Club',/bacche/,'lamponi'],['Sangria',/pezzetti/,'frutta a pezzetti'],["Pimm's Cup",/^cu\|/,'cetriolo dentro'],['Tom Collins',/agrumelimonefC(~[\d.]+)?@/,'fetta e ciliegina'],
  ['Spicy Fifty',/peperoncino/,'peperoncino'],['Appletini',/^g\|mela@/,'fettine di mela'],['Scorpion',/^g\|fiore@/,'gardenia'],['Dry Martini',/oliva/,'oliva'],['Vodka Martini',/scorzalimone/,'scorza (prima scelta)']];
 const no=SEGNI.filter(([n,re])=>!ha(n,re));ok(!no.length,'cocktail famosi con il loro segno ('+SEGNI.length+')'+(no.length?': manca '+no.map(x=>x[0]+' '+x[2]).join(', '):''));
 const tk=CK.c.filter(c=>c[3]==='Tiki').map(c=>J.k[c[0]][1]);ok(new Set(tk).size===tk.length&&!J.b.Tiki.op,'tazze tiki di colori diversi');}
// v92 #103 regola di stile di Mario («non mettere a caso tratti neri grossi»): i pezzi hanno contorni del loro colore, mai neri
ok(Object.values(J.pz).every(p=>!p.d&&!p.f&&!p.p)&&Object.values(J.pz).every(p=>['c','cf','cp'].every(x=>!p[x]||p[x].every(([k])=>/^#[0-9A-F]{6}$/.test(k)&&k!=='#000000'))),'pezzi senza contorno nero: linee del loro colore');
ok(!Object.keys(J.pz).some(k=>/^m\|/.test(k)),'niente etichetta con la bottiglia dentro i bicchieri (London Mule)');
ok(['Moscow Mule','London Mule','Kentucky Mule'].every(n=>J.k[n].some(p=>/^rm\|/.test(p))&&J.k[n].some(p=>/^sf\|/.test(p)))&&J.b['Tazza di rame'].oc,'tazza di rame: rame con luci, drink visibile, contorno ramato');
{const st=Object.entries(J.pz).filter(([k])=>/^s\|/.test(k)).map(([k,p])=>[k,p.c[0][1].match(/M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)/).slice(1).map(Number)]),bad=st.filter(([,[x1,y1,x2,y2]])=>y2<0||x2>56||(x2-x1)/(y1-y2)>.36);
 ok(st.length&&!bad.length,'cannucce dentro il bicchiere, poco inclinate ('+st.length+')'+(bad.length?': '+bad.map(x=>x[0]).join(', '):''))}
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
  ok(await big.locator('.br-h path').count()>=1&&await big.locator('.br-v.br-f').count()===1,'scheda: riflessi e linee fini del vetro');
  // v92 stile C: vetro azzurrino, tratto fisso, guarnizione ingrandita
  ok(await big.locator('.br-v').first().evaluate(e=>getComputedStyle(e).stroke)===await pg.evaluate(()=>{const d=document.createElement('div');d.style.color='var(--vetro)';document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c}),'stile C: linee del vetro color --vetro');
  ok(await big.locator('.ink').first().evaluate(e=>getComputedStyle(e).vectorEffect)==='non-scaling-stroke','stile C: tratto con spessore fisso');
  ok(await big.locator('g[transform*="scale(1.35)"]').count()>=1,'stile C: guarnizione del bordo ingrandita (×1,35)');
  // #101: nessun disegno esce troppo (guarnizioni ×1,35: sopra max 5, ai lati max 2, sotto niente) e cupola dei frullati senza arco nero
  const fuori=await pg.evaluate(()=>{const d=document.createElement('div');d.style.cssText='position:absolute;left:-999px;top:0';document.body.appendChild(d);const r=[];
    for(const n of Object.keys(BR_DIS.k)){d.innerHTML=brCkDis({n});for(const g of d.querySelectorAll('g[transform^="translate("]')){const m=g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\((1\.35)\)$/);if(!m)continue;const[tx,ty,sc]=m.slice(1).map(Number),b=g.getBBox();if(!b.width)continue;
      const x0=tx+sc*b.x,y0=ty+sc*b.y,x1=tx+sc*(b.x+b.width),y1=ty+sc*(b.y+b.height);if(y0<-5.6||x0<-2.6||x1>66.6||y1>64.6){r.push(n+' '+[x0,y0,x1,y1].map(v=>v.toFixed(1)).join(','));break}}}d.remove();return r});
  ok(fuori.length===0,'nessuna guarnizione del bordo esce dal suo spazio ('+(fuori.slice(0,4).join(' | ')||'0')+')');
  const nero=await pg.evaluate(()=>Object.entries(BR_DIS.k).filter(([,k])=>k.slice(2).some(x=>/^(dm|ft|vp)\|/.test(x)&&BR_DIS.pz[x.split('@')[0]].d)).map(([n])=>n));
  ok(nero.length===0,'cupola dei frullati, schiuma alta e vapore con linee color vetro, non nere ('+(nero.join(', ')||'0')+')');
  // #102: niente linee nere su panna, menta pestata, spirale; bollicine solo dentro il liquido
  const nero2=Object.keys(J.pz).filter(id=>/^(ml|pm)\||\|panna|spirale/.test(id)&&(J.pz[id].d||/^ml\|/.test(id)&&J.pz[id].f));
  ok(nero2.length===0,'panna, menta pestata e spirale senza contorno nero ('+(nero2.join(', ')||'0')+')');
  const bolle=await pg.evaluate(()=>{const ns='http://www.w3.org/2000/svg',sv=document.createElementNS(ns,'svg'),pa=document.createElementNS(ns,'path');sv.appendChild(pa);document.body.appendChild(sv);const r=[];
    for(const[n,k]of Object.entries(BR_DIS.k)){const id=k.slice(2).find(x=>/^b\|/.test(x));if(!id)continue;pa.setAttribute('d',BR_DIS.b[k[0]].l);
      for(const m of ((BR_DIS.pz[id].f||'')+(BR_DIS.pz[id].vf||'')).matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)){const pt=sv.createSVGPoint();pt.x=+m[1];pt.y=+m[2];if(!pa.isPointInFill(pt)){r.push(n);break}}}sv.remove();return r});
  ok(bolle.length===0,'bollicine solo dentro il liquido, mai sul gambo ('+(bolle.slice(0,5).join(', ')||'0')+')');
  ok(await sh(pg).locator('.br-ing.br-carta').count()===1,'Negroni: ingredienti sul foglio di carta');
  ok(await big.locator('g[transform^="translate("]').count()>=1,'Negroni: mezza fetta d\'arancia spostata sul bordo (@x,y)');
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
