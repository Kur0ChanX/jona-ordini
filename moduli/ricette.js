/* Jona Ordini · Ricette e costo dei piatti (elenco, modulo della ricetta, scelta degli ingredienti), v103.
   Caricato da index.html con modLoad('ricette') al primo rcOpen: stesse variabili globali dell'app.
   Restano in index.html: RC_*, rcAll, rcU, rcFatt, rcPct, rcPrezzo, rcCalc, rcSalito, rcSnap, rcPut, rcOn, rcCta, rcStrip, rcVisto, rcOpen e le azioni rc* in A. */
function rcApri(){S.rc={q:''};usoSegna('ricette');openSheet({cls:'tall',live:()=>true,render:rcList})}
function rcList(){const all=rcAll(),q=norm(S.rc.q),l=all.filter(r=>!q||norm(r.n).includes(q));
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">Ricette e costo dei piatti<div class="sh-s">${all.length} ${all.length===1?'ricetta':'ricette'} · prezzi presi dai listini</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <button type="button" class="btn primary big block" data-a="rcNew">${ic('plus')} Nuova ricetta</button>
  ${all.length>6?`<div class="search rc-cerca">${ic('search')}<input id="rcq" type="search" placeholder="Cerca un piatto" value="${esc(S.rc.q)}" data-in="rcq" autocomplete="off"></div>`:''}
  <div class="rc-l">${l.length?l.map(r=>{const c=rcCalc(r),s=rcSalito(r);return`<button type="button" class="prow" data-a="rcEdit" data-v="${r.id}"><div class="row-i"><div class="row-t">${esc(r.n)}</div><div class="row-m">${eur(c.cp)} a porzione${c.fc!=null?` · <span class="${c.fc>RC_ALTO?'rc-alto':''}">food cost ${rcPct(c.fc)}</span>`:''}${s?` <span class="tag urg">costo +${rcPct(s*100)}</span>`:''}${c.manca?` <span class="tag">${c.manca} senza prezzo</span>`:''}</div></div>${ic('chev')}</button>`}).join(''):`<p class="muted">${q?'Nessun piatto trovato.':'Nessuna ricetta. Tocca «Nuova ricetta», scegli gli ingredienti dai listini e l\'app calcola quanto costa il piatto.'}</p>`}</div>`}
function rcForm(r){const f=r?clone(r):{n:'',por:1,pv:'',ing:[]};const sv=v=>v==null||v===''?'':String(v).replace('.',',');
  f.por=sv(f.por)||'1';f.pv=sv(f.pv);f.ing=(f.ing||[]).map(g=>Object.assign({},g,{q:sv(g.q)}));S.rcf=f;
  openSheet({cls:'tall',live:()=>true,render:rcFormH})}
function rcFormH(){const f=S.rcf,c=rcCalc(f);
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">${f.id?'Modifica ricetta':'Nuova ricetta'}</div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <label class="lbl" for="rcf-n">Nome del piatto</label><input class="inp" id="rcf-n" data-in="rcf" data-k="n" value="${esc(f.n)}" placeholder="Es. Spaghetti alle vongole">
  <div class="ag-2"><label><span class="lbl">Porzioni</span><input class="inp" id="rcf-por" inputmode="decimal" data-in="rcf" data-k="por" value="${esc(f.por)}"></label><label><span class="lbl">Prezzo nel menù €</span><input class="inp" id="rcf-pv" inputmode="decimal" data-in="rcf" data-k="pv" value="${esc(f.pv)}" placeholder="Es. 18"></label></div>
  <span class="lbl">Ingredienti</span>
  ${c.righe.map((x,i)=>{const g=x.g,us=rcU(g.pu);return`<div class="rc-ing"><div class="rc-in"><b>${esc(g.nome)}</b><span class="muted small">${x.p?`${eur(x.p.pr)} / ${esc(normUnita(g.pu)||'pz')}${x.p.da==='simile'?' · da '+esc(forn(x.p.f).nome):x.p.da==='vecchio'?' · non più a listino, ultimo prezzo':''}`:'senza prezzo'}</span></div>
    <div class="rc-q"><input class="inp sm" id="rcq-${i}" inputmode="decimal" data-in="rcfq" data-i="${i}" value="${esc(g.q)}" placeholder="0" aria-label="Quantità di ${esc(g.nome)}">${us.length>1?`<select class="inp sm" id="rcu-${i}" data-ch="rcu" data-i="${i}" aria-label="Unità di ${esc(g.nome)}">${us.map(([u])=>`<option value="${u}" ${g.u===u?'selected':''}>${u}</option>`).join('')}</select>`:`<span class="rc-u">${esc(us[0][0])}</span>`}<span class="rc-c">${x.c!=null?eur(x.c):'—'}</span><button type="button" class="icon-btn" data-a="rcIngDel" data-v="${i}" aria-label="Togli ${esc(g.nome)}">${ic('x')}</button></div></div>`}).join('')||'<p class="muted small">Ancora nessun ingrediente.</p>'}
  <button type="button" class="btn ghost" data-a="rcPick">${ic('plus')} Aggiungi ingrediente</button>
  <div class="rc-tot"><div><span>Costo totale</span><b>${eur(c.tot)}</b></div><div><span>Costo a porzione</span><b>${eur(c.cp)}</b></div>${c.fc!=null?`<div class="${c.fc>RC_ALTO?'rc-alto':''}"><span>Food cost</span><b>${rcPct(c.fc)}</b></div>`:''}${c.cons?`<div><span>Prezzo per stare al ${RC_FC}%</span><b>${eur(c.cons)}</b></div>`:''}</div>
  ${c.manca?`<p class="muted small">${c.manca===1?'1 ingrediente senza quantità o prezzo: non è':c.manca+' ingredienti senza quantità o prezzo: non sono'} nel costo.</p>`:''}
  <p class="muted small">Food cost: costo a porzione diviso il prezzo del menù senza IVA (10%).</p>
  <div class="sheet-foot btns" style="margin-top:18px">${f.id?`<button type="button" class="btn ghost danger" data-a="rcDel">${ic('trash')} Elimina</button>`:''}<button type="button" class="btn primary big" data-a="rcSave">${ic('check')} Salva</button></div>`}
function rcPick(){S.rcpq='';openSheet({cls:'tall',live:()=>true,render:()=>{const q=norm(S.rcpq),toks=q?q.split(' '):[];
  const l=prods().filter(p=>!toks.length||toks.every(t=>norm(p.nome+' '+(p.codice||'')).includes(t))).sort(byNome).slice(0,80);
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">Aggiungi ingrediente<div class="sh-s">Dai listini dei fornitori</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <div class="search rc-cerca">${ic('search')}<input id="rcpq" type="search" placeholder="Cerca un prodotto" value="${esc(S.rcpq)}" data-in="rcpq" autocomplete="off"></div>
  <div>${l.length?l.map(p=>`<button type="button" class="prow" data-a="rcAdd" data-v="${p.id}"><div class="row-i"><div class="row-t">${esc(p.nome)}</div><div class="row-m">${esc(forn(p.fornitoreId).nome)}${p.prezzo!=null?' · '+eur(p.prezzo)+(p.unita?' / '+esc(p.unita):''):' · senza prezzo'}</div></div>${ic('plus')}</button>`).join(''):`<p class="muted">Nessun prodotto${q?' trovato':' a listino: caricalo da Fornitori'}.</p>`}</div>`}})}
function rcAdd(id){const p=D().prodotti[id];if(!p||!S.rcf)return;const pu=normUnita(p.unita)||'pz';
  S.rcf.ing.push({pid:p.id,nome:p.nome,fid:p.fornitoreId||'',pu,q:'',u:rcU(pu)[0][0],pz:p.prezzo??null});closeSheet();refreshSheet();
  const i=S.rcf.ing.length-1;setTimeout(()=>{const n=document.getElementById('rcq-'+i);if(n)n.focus()},300)}
async function rcSave(){const f=S.rcf,me=realU();if(!f||!me)return;const n=f.n.trim();if(!n){toast('Scrivi il nome del piatto','err');return}
  const r={id:f.id||uid(),n,por:num(f.por)>0?num(f.por):1,pv:num(f.pv)>0?num(f.pv):null,ing:f.ing.map(g=>({pid:g.pid,nome:g.nome,fid:g.fid||'',pu:g.pu,q:num(g.q)>0?num(g.q):null,u:g.u,pz:g.pz??null})),da:f.da||me.id,cr:f.cr||now(),mod:now()};
  await rcPut(rcSnap(r));closeSheet();toast('Ricetta salvata')}
async function rcDel(){const f=S.rcf;if(!f||!f.id)return closeSheet();
  if(!await ask('Eliminare la ricetta?','«'+f.n+'» sparisce dalle ricette.','Elimina',true))return;
  await upd('config','ricette',{['r.'+f.id]:null});closeSheet();toast('Ricetta eliminata')}
