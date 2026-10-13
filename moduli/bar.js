/* Jona Ordini · Bar (cocktail e inventario degli alcolici), v101.
   Caricato da index.html con modLoad('bar') al primo brOpen: stesse variabili globali dell'app (S, D, upd, openSheet…).
   Restano in index.html: isBar, brCan, brOn, brAll, brGet, brTot, brMese, brCta, brOpen e le azioni br* in A. */
const BR_CAT=[['Gin',['Gin']],['Vodka',['Vodka']],['Rum',['Rum bianco','Rum scuro','Cachaça']],['Tequila',['Tequila','Mezcal']],['Whisky',['Bourbon','Rye whiskey','Scotch whisky','Scotch whisky torbato','Whisky irlandese']],
  ['Brandy',['Cognac','Brandy','Calvados','Pisco','Grappa']],['Aperitivi e vermouth',['Campari','Aperol','Vermouth rosso','Vermouth dry','Lillet blanc','Suze','Pimm\'s','Porto']],
  ['Liquori',['Triple sec','Amaretto','Liquore al caffè','Crema di whisky','Maraschino','Galliano','Chartreuse verde','Chartreuse gialla','Bénédictine','Drambuie','Crème de cassis','Crème de mûre','Crème de cacao','Crème de menthe','Crème de violette','Cherry brandy','Liquore all\'albicocca','Liquore alla pesca','Liquore al melone','Liquore alla mela verde','Liquore al lampone','Liquore ai fiori di sambuco','Liquore al frutto della passione','Liquore all\'uovo','Blue curaçao','Falernum','Absinthe','Sambuca','Limoncello','Mirto']],
  ['Amari e bitter',['Fernet','Amaro','Jägermeister','Angostura','Orange bitters','Peychaud\'s bitters']],['Vini e birre',['Prosecco','Champagne','Vino bianco','Vino rosso','Birra','Birra scura']]];
const BR_FAM=[['','Tutti'],['gin','Gin'],['vodka','Vodka'],['rum','Rum'],['teq','Tequila'],['whisky','Whisky'],['brandy','Brandy'],['aper','Aperitivi e bollicine'],['liq','Liquori e shot'],['zero','Analcolici']];
const BR_MET={S:['Shakerato','Shaker pieno di ghiaccio: shakera forte 10-12 secondi e filtra.'],M:['Mescolato','Mixing glass con molto ghiaccio: mescola 20-30 secondi e filtra.'],C:['Nel bicchiere','Si prepara direttamente nel bicchiere.'],F:['Frullato','Nel frullatore con il ghiaccio.'],P:['Pestato','Si pesta nel bicchiere con il pestello.']};
const BR_EQ=[['Cognac','Brandy'],['Prosecco','Champagne'],['Bourbon','Rye whiskey']];
const BR_LIV=[[0,'Nessuna'],[1/3,'⅓'],[0.5,'½'],[2/3,'⅔'],[1,'Piena']];
const BR_CL=[70,75,100,150];
const brBase=n=>String(n||'').replace(/\s*\(.*\)$/,'');
const brLiv=x=>{x=+x||0;return BR_LIV.reduce((a,b)=>Math.abs(b[0]-x)<Math.abs(a[0]-x)?b:a)};
function brQ(b){const pi=Math.max(0,+b.pi||0),ap=+b.ap||0;if(!ap||ap>=1)return String(pi+(ap>=1?1:0));return pi?pi+' + '+brLiv(ap)[1]:brLiv(ap)[1]}
const brN=x=>{const i=Math.floor(x+1e-6),r=x-i;if(r<0.1)return String(i);const l=brLiv(r)[1];return i?i+' '+l:l};
const brBot=b=>{const ap=+b.ap||0,l=ap?Math.round(ap*100):(+b.pi?100:0);return`<span class="br-bot${!brTot(b)?' br-vuota':''}" style="--l:${l}%" aria-hidden="true"></span>`};
let BR_CK=null,BR_CKP=null,BR_DIS=null,BR_DISP=null;
function brDisLoad(){if(BR_DIS)return Promise.resolve(BR_DIS);
  if(!BR_DISP)BR_DISP=fetch('data/bar-disegni.json').then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(j=>{
    if(!document.getElementById('br-defs'))document.body.insertAdjacentHTML('beforeend','<svg id="br-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="br-wash" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="5"/><feGaussianBlur stdDeviation=".7"/></filter></defs></svg>');
    BR_DIS={g:j.g,r:j.r.map(x=>[new RegExp(x[0]),x[1],x[2]]),b:j.b||{},pz:j.pz||{},k:j.k||{}};return BR_DIS}).catch(e=>{BR_DISP=null;throw e});
  return BR_DISP}
const brDisK=n=>{const s=String(n||'').toLowerCase();return BR_DIS&&BR_DIS.r.find(x=>x[0].test(s))};
const brSvg=(w,d,p,cl)=>`<svg class="br-dis${cl?' '+cl:''}" viewBox="0 0 64 64" aria-hidden="true">${w.map(x=>`<g class="wa" transform="translate(1.5 1.5)" fill="${x[0]}">${x[1]}</g>`).join('')}<g class="ink">${d}</g>${p?`<g class="inkp">${p}</g>`:''}</svg>`;
function brDis(n,alc){if(!BR_DIS)return'';const r=brDisK(n),g=BR_DIS.g[r?r[1]:alc?'liquore':'acqua'];if(!g)return'';
  return brSvg(g.w.map((w,i)=>[i===0&&r&&r[2]||w[0],w[1]]),g.d,g.p)}
// v92 (D42): cocktail con i dettagli (vetro, riflessi, cubetti con le facce), strati e schiuma dentro il liquido (q, ritagliati sulla forma del liquido); nella scheda grande (senza cl) anche colore che sfuma, macchia d'acquerello e goccioline
const brTinta=(h,t,a)=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*(1-a)+t*a).toString(16).padStart(2,'0')).join('');
let BR_LG=0;
const brMove=(p,t)=>{const g=s=>`<g transform="translate(${t.replace(',',' ')}) scale(1.35)">${s}</g>`,o={};for(const k in p)o[k]=Array.isArray(p[k])?p[k].map(w=>[w[0],g(w[1]),w[2]]):g(p[k]);return o};
// v92 regola di stile (#101): contorni dei pezzi sottili e del loro colore, niente nero grosso. c/cf/cp = [[colore, forme]]
function brCol(ps,x,cl,pr){const m={};for(const p of ps)for(const[k,v]of p[x]||[])m[k]=(m[k]||'')+v;return Object.keys(m).map(k=>`<g class="${cl}" style="${pr}:${k}">${m[k]}</g>`).join('')}
function brCkDis(c,cl){const k=BR_DIS&&BR_DIS.k[c.n],B=k&&BR_DIS.b[k[0]];if(!B)return'';const ps=k.slice(2).map(x=>{const[id,t]=x.split('@'),p=BR_DIS.pz[id];return p&&t?brMove(p,t):p}).filter(Boolean),big=!cl,col=B.op||k[1];
  const wa=(f,s,o)=>`<g class="wa"${o?` style="opacity:${o}"`:''} fill="${f==='*'?k[1]:f==='*l'?brTinta(k[1],255,.1):f}">${s}</g>`,all=x=>ps.map(p=>p[x]||'').join('');
  let defs='',fill=col,q='';if(big&&!B.op){const id='br-lg'+(++BR_LG);defs=`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${brTinta(col,255,.18)}"/><stop offset="1" stop-color="${brTinta(col,0,.25)}"/></linearGradient>`;fill=`url(#${id})`}
  if(ps.some(p=>p.q)){const id='br-lq'+(++BR_LG);defs+=`<clipPath id="${id}"><path d="${B.l}"/></clipPath>`;q=`<g clip-path="url(#${id})">${ps.map(p=>(p.q||[]).map(w=>wa(w[0],w[1],w[2])).join('')).join('')}</g>`}
  return`<svg class="br-dis br-ck${cl?' '+cl:''}" viewBox="0 0 64 64" aria-hidden="true">${defs?`<defs>${defs}</defs>`:''}${big&&B.x?wa(col,`<path d="${B.x}"/>`,.4):''}${B.sh?`<ellipse class="br-sh" cx="32" cy="${B.sh[0]}" rx="${B.sh[1]}" ry="1.8"/>`:''}`
    +wa(fill,`<path d="${B.l}"/>`,big?.85:.7)+(B.m?wa(brTinta(col,255,.3),B.m,.8):'')+q+ps.map(p=>(p.w||[]).map(w=>wa(w[0],w[1],w[2])).join('')).join('')
    +(B.oc?`<g class="br-c br-o" style="stroke:${B.oc}">${B.d}</g>`+(B.f?`<g class="br-c br-f" style="stroke:${B.oc}">${B.f}</g>`:''):'')+`<g class="ink br-v">${(B.oc?'':B.d)+all('vd')}</g>${!B.oc&&B.f||ps.some(p=>p.vf)?`<g class="ink br-v br-f">${(B.oc?'':B.f||'')+all('vf')}</g>`:''}<g class="ink">${all('d')}</g>${ps.some(p=>p.f)?`<g class="ink br-f">${all('f')}</g>`:''}${ps.some(p=>p.p)?`<g class="inkp">${all('p')}</g>`:''}${brCol(ps,'c','br-c','stroke')+brCol(ps,'cf','br-c br-f','stroke')+brCol(ps,'cp','br-cp','fill')}<g class="br-h">${(B.h||'')+all('h')}</g>`
    +(big&&B.dr?`<g class="br-dr">${B.dr.map(([x,y,r=.9])=>`<ellipse cx="${x}" cy="${y}" rx="${+(r*.8).toFixed(2)}" ry="${r}"/>`).join('')}</g>`:'')+'</svg>'}
function brCk(){if(BR_CK)return Promise.resolve(BR_CK);
  if(!BR_CKP)BR_CKP=fetch('data/cocktail.json').then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(j=>{
    BR_CK=j.c.map((c,i)=>({i,n:c[0],f:c[1],m:c[2],g:c[3],ing:c[4],gu:c[5],p:c[6],iba:!!c[7],k:norm(c[0]+' '+c[4].map(x=>x[2]).join(' '))}));return BR_CK}).catch(e=>{BR_CKP=null;throw e});
  return BR_CKP}
function brHave(){const s=new Set();for(const b of brAll())if(brTot(b)>0)s.add(b.cat);for(const [a,b] of BR_EQ){if(s.has(a))s.add(b);else if(s.has(b))s.add(a)}return s}
const brFattibile=(c,h)=>c.ing.every(x=>!x[3]||h.has(brBase(x[2])));
function brUsate(){let n=0;for(const m of Object.values((D().config[brMese()]||{}).m||{}))if(m&&+m.d<0)n-=+m.d;return n}
function brApri(v){if(!funzOn('bar'))return;S.br={v:v||'ck',q:'',f:'',fat:false,n:60,iq:''};usoSegna('bar');openSheet({cls:'tall',live:()=>true,render:brList});
  brCk().then(()=>refreshSheet()).catch(()=>{if(S.br)S.br.err=1;refreshSheet()});brDisLoad().then(()=>refreshSheet()).catch(()=>{})}
function brList(){const V=S.br,me=meU(),all=brAll(),can=brCan(me);
  const head=`<div class="grab"></div><div class="sh-h"><div class="sh-t">Bar<div class="sh-s">${BR_CK?BR_CK.length+' cocktail · ':''}${brN(all.reduce((s,b)=>s+brTot(b),0))} bottiglie in casa</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <div class="seg wide vn-seg">${[['ck','Cocktail'],['inv','Inventario']].map(([k,l])=>`<button type="button" aria-pressed="${V.v===k}" data-a="brV" data-v="${k}">${l}</button>`).join('')}</div>`;
  if(V.v==='inv'){const tot=all.reduce((s,b)=>s+brTot(b),0),val=all.reduce((s,b)=>s+brTot(b)*(+b.pc||0),0),bassi=all.filter(b=>b.min>0&&brTot(b)<=b.min),us=brUsate(),q=norm(V.iq);
    const l=all.filter(b=>!q||norm(b.n+' '+b.cat).includes(q));
    const grp=BR_CAT.map(([g,cs])=>[g,l.filter(b=>cs.includes(b.cat))]).concat([['Altro',l.filter(b=>!BR_CAT.some(([,cs])=>cs.includes(b.cat)))]]).filter(x=>x[1].length);
    return head+`<div class="rc-tot vn-tot"><div><span>Bottiglie in casa</span><b>${brN(tot)}</b></div><div><span>Usate questo mese</span><b>${brN(us)}</b></div>${isMgr(me)&&val?`<div><span>Valore (prezzo d'acquisto)</span><b>${eur(val)}</b></div>`:''}</div>
    ${bassi.length?`<p class="vn-al">${ic('warn')} Da riordinare: ${bassi.map(b=>esc(b.n)+' ('+brQ(b)+')').join(', ')}</p>`:''}
    ${can?`<div class="btns vn-add"><button type="button" class="btn primary big" data-a="brNew">${ic('plus')} Aggiungi una bottiglia</button></div>`:''}
    ${all.length>12?`<div class="search rc-cerca">${ic('search')}<input id="briq" type="search" placeholder="Cerca una bottiglia" value="${esc(V.iq)}" data-in="briq" autocomplete="off"></div>`:''}
    <p class="muted small vn-hint">Tocca una bottiglia per contarla: quelle intere e quanto resta di quella aperta.</p>
    ${grp.length?grp.map(([g,bs])=>`<span class="lbl br-gl">${brDis(((BR_CAT.find(x=>x[0]===g)||[])[1]||[])[0]||'',1)}${esc(g)}</span>${bs.map(b=>`<button type="button" class="prow br-r" data-a="brB" data-v="${b.id}">${brBot(b)}<div class="row-i"><div class="row-t">${esc(b.n)}</div><div class="row-m">${esc(b.cat||'')}${b.cl?' · '+b.cl+' cl':''}</div></div><div class="vn-q"><b class="${!brTot(b)?'vn-zero':b.min>0&&brTot(b)<=b.min?'vn-basso':''}">${brQ(b)}</b><span>in casa</span></div></button>`).join('')}`).join('')
      :`<p class="muted">${all.length?'Nessuna bottiglia trovata.':can?'Ancora nessuna bottiglia. Tocca «Aggiungi una bottiglia»: poi i cocktail ti dicono cosa puoi fare con quello che c\'è.':'Ancora nessuna bottiglia.'}</p>`}`}
  if(V.err&&!BR_CK)return head+`<p class="muted">Non riesco a caricare i cocktail. Controlla la connessione e riapri il Bar.</p>`;
  if(!BR_CK)return head+`<p class="muted">${ic('clock')} Carico i cocktail…</p>`;
  const h=brHave(),q=norm(V.q),l=BR_CK.filter(c=>(!V.f||c.f===V.f)&&(!q||c.k.includes(q))&&(!V.fat||brFattibile(c,h)));
  return head+`<div class="search rc-cerca">${ic('search')}<input id="brq" type="search" placeholder="Cerca cocktail o ingrediente" value="${esc(V.q)}" data-in="brq" autocomplete="off"></div>
  <div class="chips br-f">${all.length?`<button type="button" class="chip" aria-pressed="${V.fat}" data-a="brFat">Si possono fare</button>`:''}${BR_FAM.map(([k,t])=>`<button type="button" class="chip" aria-pressed="${V.f===k}" data-a="brF" data-v="${k}">${t}</button>`).join('')}</div>
  ${V.fat?`<p class="muted small vn-hint">Solo i cocktail con tutti gli alcolici in casa (succhi, sciroppi e frutta non li conto).</p>`:''}
  <div>${l.length?l.slice(0,V.n).map(c=>`<button type="button" class="prow br-r" data-a="brC" data-v="${c.i}">${brCkDis(c,'br-ckd')}<div class="row-i"><div class="row-t">${esc(c.n)}${c.iba?' <span class="br-iba">IBA</span>':''}</div><div class="row-m">${esc(c.ing.filter(x=>x[3]).map(x=>brBase(x[2])).join(' · ')||'Analcolico')}</div></div><span class="br-met">${BR_MET[c.m][0]}</span></button>`).join('')
    +(l.length>V.n?`<button type="button" class="btn ghost br-piu" data-a="brPiu">Mostra altri ${Math.min(60,l.length-V.n)} (${l.length-V.n} in tutto)</button>`:'')
    :`<p class="muted">Nessun cocktail trovato.${V.fat?' Togli «Si possono fare» per vederli tutti.':''}</p>`}</div>`}
function brShowC(i){S.brC=+i;if(!BR_DIS)brDisLoad().then(()=>refreshSheet()).catch(()=>{});openSheet({cls:'tall',live:()=>true,render:()=>{const c=BR_CK&&BR_CK[S.brC];if(!c)return`<div class="grab"></div><p class="muted">Cocktail non trovato.</p>`;
  const inv=brAll().length?brHave():null,met=BR_MET[c.m]||['',''];
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">${esc(c.n)}<div class="sh-s">${esc((BR_FAM.find(x=>x[0]===c.f)||['',''])[1])}${c.iba?' · ricetta ufficiale IBA':''}</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  ${(d=>d?`<div class="br-ckbig">${d}</div>`:'')(brCkDis(c))}<div class="vn-tav br-tav"><div><span class="vn-tl">Metodo</span><b>${esc(met[0])}</b></div><div><span class="vn-tl">Bicchiere</span><b>${esc(c.g)}</b></div><div><span class="vn-tl">Guarnizione</span><b>${esc(c.gu)}</b></div></div>
  <span class="lbl">Ingredienti</span><div class="br-ing${BR_DIS?' br-carta':''}">${c.ing.map(x=>{const ok=inv&&x[3]?inv.has(brBase(x[2])):null;
    return`<div class="br-ir">${brDis(brBase(x[2]),x[3])}<b>${esc(x[0]==='top'?'top':x[0]+(x[1]?' '+x[1]:''))}</b><span>${esc(x[2])}</span>${ok===null?'':ok?`<i class="br-ok">in casa</i>`:`<i class="br-no">manca</i>`}</div>`}).join('')}</div>
  <span class="lbl">Come si fa</span><p class="vn-tx">${esc(met[1])}</p>${Array.isArray(c.p)?`<ol class="br-ol">${c.p.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:`<p class="vn-tx br-pas">${esc(c.p)}</p>`}`}})}
async function brPut(b){if(D().config.bar)await upd('config','bar',{['b.'+b.id]:b});else await put('config','bar',{tipo:'bar',b:{[b.id]:b}})}
async function brSet(id,pi,ap,t){const b=brGet(id),me=realU();if(!b||!me)return;pi=Math.max(0,Math.round(pi));ap=Math.min(1,Math.max(0,+ap||0));
  const d=Math.round((pi+ap-brTot(b))*1000)/1000;if(!d&&pi===(+b.pi||0))return;
  await upd('config','bar',{['b.'+id+'.pi']:pi,['b.'+id+'.ap']:ap,['b.'+id+'.mod']:now()});
  if(d){const doc=brMese(),m={b:id,d,t,da:me.id,ts:now()};if(D().config[doc])await upd('config',doc,{['m.'+uid()]:m});else await put('config',doc,{tipo:'bar_mov',m:{[uid()]:m}})}}
function brShowB(id){S.brB=id;openSheet({cls:'tall',live:()=>true,render:()=>{const b=brGet(S.brB),me=meU(),can=brCan(me);if(!b)return`<div class="grab"></div><p class="muted">Bottiglia eliminata.</p>`;
  const pi=+b.pi||0,ap=+b.ap||0,lv=brLiv(ap)[0];
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">${esc(b.n)}<div class="sh-s">${esc(b.cat||'')}${b.cl?' · '+b.cl+' cl':''}${isMgr(me)&&b.pc?' · acquisto '+eur(b.pc):''}</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <div class="br-casa">${brBot(b)}<div><span class="vn-tl">In casa</span><b>${brQ(b)} ${brTot(b)===1?'bottiglia':'bottiglie'}</b></div></div>
  ${can?`<span class="lbl">Bottiglie intere (chiuse)</span><div class="br-step"><button type="button" class="icon-btn vn-pm" data-a="brPi" data-v="-1" aria-label="Una intera in meno">−</button><b>${pi}</b><button type="button" class="icon-btn vn-pm" data-a="brPi" data-v="1" aria-label="Arrivata una bottiglia">+</button></div>
  <span class="lbl">Bottiglia aperta: quanto resta?</span><div class="chips br-liv">${BR_LIV.map(([x,l])=>`<button type="button" class="chip" aria-pressed="${Math.abs(lv-x)<0.01}" data-a="brAp" data-v="${x}">${l}</button>`).join('')}</div>
  ${pi>0?`<button type="button" class="btn ghost br-fin" data-a="brFin">Finita: apro la prossima</button>`:''}
  <div class="sheet-foot btns" style="margin-top:18px"><button type="button" class="btn primary" data-a="brEdit" data-v="${b.id}">${ic('pencil')} Modifica</button></div>`:''}`}})}
function brForm(b){const sv=x=>x==null||x===''?'':String(x).replace('.',',');const f=b?clone(b):{n:'',cat:'Gin',cl:70,pi:'',ap:0,min:'',pc:''};
  for(const k of ['pi','min','pc'])f[k]=sv(f[k]);S.brf=f;openSheet({cls:'tall',live:()=>true,render:brFormH})}
function brFormH(){const f=S.brf,me=meU(),num_=(k,l,ph)=>`<label><span class="lbl">${l}</span><input class="inp" id="brf-${k}" inputmode="decimal" data-in="brf" data-k="${k}" value="${esc(f[k])}" placeholder="${esc(ph||'')}"></label>`;
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">${f.id?'Modifica bottiglia':'Nuova bottiglia'}</div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <label class="lbl" for="brf-n">Nome</label><input class="inp" id="brf-n" data-in="brf" data-k="n" value="${esc(f.n)}" placeholder="Es. Tanqueray London Dry">
  <label class="lbl" for="brf-cat">Tipo</label><select class="inp" id="brf-cat" data-ch="brfcat">${BR_CAT.map(([g,cs])=>`<optgroup label="${esc(g)}">${cs.map(c=>`<option ${f.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</optgroup>`).join('')}</select>
  <p class="muted small">Il tipo serve ai cocktail per capire cosa si può fare.</p>
  <span class="lbl">Formato</span><div class="chips">${BR_CL.map(c=>`<button type="button" class="chip" aria-pressed="${+f.cl===c}" data-a="brfCl" data-v="${c}">${c} cl</button>`).join('')}</div>
  <div class="ag-2">${num_('pi','Bottiglie intere','0')}${num_('min','Avvisa sotto','Es. 1')}</div>
  <span class="lbl">Bottiglia aperta</span><div class="chips br-liv">${BR_LIV.map(([x,l])=>`<button type="button" class="chip" aria-pressed="${Math.abs(brLiv(f.ap)[0]-x)<0.01}" data-a="brfAp" data-v="${x}">${l}</button>`).join('')}</div>
  ${isMgr(me)?num_('pc','Prezzo d\'acquisto € (a bottiglia)','Es. 18'):''}
  <div class="sheet-foot btns" style="margin-top:18px">${f.id?`<button type="button" class="btn ghost danger" data-a="brDel">${ic('trash')} Elimina</button>`:''}<button type="button" class="btn primary big" data-a="brSave">${ic('check')} Salva</button></div>`}
async function brSave(){const f=S.brf,me=realU();if(!f||!me)return;const n=String(f.n||'').trim();if(!n){toast('Scrivi il nome della bottiglia','err');return}
  const old=f.id&&brGet(f.id),pi=Math.max(0,Math.round(num(f.pi)||0)),ap=Math.min(1,Math.max(0,+f.ap||0));
  if(old&&(pi!==(+old.pi||0)||Math.abs(ap-(+old.ap||0))>0.001))await brSet(f.id,pi,ap,'conta');
  const b={id:f.id||uid(),n,cat:f.cat||'Gin',cl:+f.cl||70,pi,ap,min:Math.max(0,num(f.min)||0),pc:isMgr(meU())?(num(f.pc)>0?num(f.pc):null):(old&&old.pc)||null,da:f.da||me.id,cr:f.cr||now(),mod:now()};
  await brPut(b);closeSheet();toast('Bottiglia salvata')}
async function brDel(){const f=S.brf;if(!f||!f.id)return closeSheet();
  if(!await ask('Eliminare la bottiglia?','«'+f.n+'» sparisce dall\'inventario del bar.','Elimina',true))return;
  await upd('config','bar',{['b.'+f.id]:null});closeSheet();closeSheet();toast('Bottiglia eliminata')}
