/* Jona Ordini · Cantina Vini (schede dei vini, foto lette dall'IA, inventario), v102.
   Caricato da index.html con modLoad('cantina') al primo vnOpen (o all'avvio solo se c'è una bozza jona_vn): stesse variabili globali dell'app.
   Restano in index.html: VN_TIPI, VN_ABB, VN_CAMPI, vnAll, vnGet, vnOn, vnCan, vnMese, vnTit, vnSub, vnCta, vnOpen, vnRestore e le azioni vn* in A. */
function vnVenduti(){const r={};for(const m of Object.values((D().config[vnMese()]||{}).m||{}))if(m&&m.t==='ven')r[m.v]=(r[m.v]||0)+(+m.q||0);return r}
async function vnPut(v){if(D().config.cantina)await upd('config','cantina',{['v.'+v.id]:v});else await put('config','cantina',{tipo:'cantina',v:{[v.id]:v}})}
async function vnMov(id,t,q){const v=vnGet(id),me=realU();if(!v||!me)return;const old=+v.q||0,nq=t==='conta'?Math.max(0,q):Math.max(0,old+(t==='ven'?-q:q));
  if(t==='ven'&&old<q&&!await ask('In casa ne risultano '+old,'Segno lo stesso la vendita? Il conto delle bottiglie va a zero.','Sì, venduta'))return;
  await upd('config','cantina',{['v.'+id+'.q']:nq,['v.'+id+'.mod']:now()});
  const doc=vnMese(),m={v:id,q:t==='conta'?nq:q,t,da:me.id,ts:now()};
  if(D().config[doc])await upd('config',doc,{['m.'+uid()]:m});else await put('config',doc,{tipo:'cantina_mov',m:{[uid()]:m}});
  toast(t==='ven'?'Venduta: in casa '+nq:t==='car'?'Caricate: in casa '+nq:'Conta salvata: '+nq)}
function vnApri(v){if(!funzOn('cantina'))return;S.vn={v:v||'carta',q:'',tipo:'',casa:true,abb:''};usoSegna('cantina');openSheet({cls:'tall',live:()=>true,render:vnList})}
function vnRow(v,ven){const me=meU(),q=+v.q||0,basso=v.min>0&&q<=v.min;
  return`<button type="button" class="prow vn-r" data-a="vnShow" data-v="${v.id}"><span class="vn-dot vn-${esc(v.tipo||'rosso')}" aria-hidden="true"></span><div class="row-i"><div class="row-t">${vnTit(v)}</div><div class="row-m">${vnSub(v)||'&nbsp;'}</div>${v.parole?`<div class="row-m vn-par">${esc(v.parole)}</div>`:''}</div><div class="vn-q"><b class="${!q?'vn-zero':basso?'vn-basso':''}">${q}</b><span>${q===1?'bottiglia':'bottiglie'}</span>${v.pv?`<span>${eur(v.pv)}</span>`:''}${ven?`<span>${ven} vend.</span>`:''}</div></button>`}
function vnList(){const V=S.vn,me=meU(),all=vnAll(),can=vnCan(me),ven=vnVenduti();
  const head=`<div class="grab"></div><div class="sh-h"><div class="sh-t">Cantina Vini<div class="sh-s">${all.length} ${all.length===1?'vino':'vini'} · ${all.reduce((s,v)=>s+(+v.q||0),0)} bottiglie in casa</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <div class="seg wide vn-seg">${[['carta','Carta'],['consiglia','Consiglia'],['inv','Inventario']].map(([k,l])=>`<button type="button" aria-pressed="${V.v===k}" data-a="vnV" data-v="${k}">${l}</button>`).join('')}</div>`;
  const add=vnRisH()+(can?`<div class="btns vn-add"><button type="button" class="btn primary big" data-a="vnFoto">${ic('camera')} Fotografa una bottiglia</button><button type="button" class="btn ghost" data-a="vnNew">${ic('plus')} Scrivi il nome</button></div>`:'');
  if(V.v==='consiglia'){const l=V.abb?all.filter(v=>(v.abb||[]).includes(V.abb)&&(+v.q||0)>0).sort((a,b)=>(ven[b.id]||0)-(ven[a.id]||0)||String(a.n).localeCompare(String(b.n),'it')):[];
    return head+`<p class="muted small vn-hint">Cosa mangia il cliente? Ti mostro i vini in casa che ci stanno bene, con la frase da dire.</p>
    <div class="vn-abb">${VN_ABB.map(([k,l])=>`<button type="button" class="chip" aria-pressed="${V.abb===k}" data-a="vnAbb" data-v="${k}">${l}</button>`).join('')}</div>
    ${V.abb?(l.length?l.map(v=>`<button type="button" class="vn-card" data-a="vnShow" data-v="${v.id}"><div class="vn-ct"><span class="vn-dot vn-${esc(v.tipo||'rosso')}" aria-hidden="true"></span><b>${vnTit(v)}</b>${v.pv?`<span class="vn-pv">${eur(v.pv)}</span>`:''}</div>${v.frase?`<p class="vn-fr">«${esc(v.frase)}»</p>`:''}${v.parole?`<p class="vn-par">${esc(v.parole)}</p>`:''}</button>`).join(''):`<p class="muted">Nessun vino in casa per questo piatto.${can?' Apri un vino e scegli i suoi abbinamenti.':''}</p>`):''}`}
  if(V.v==='inv'){const tot=all.reduce((s,v)=>s+(+v.q||0),0),val=all.reduce((s,v)=>s+(+v.q||0)*(+v.pc||0),0),nv=Object.values(ven).reduce((s,x)=>s+x,0),bassi=all.filter(v=>v.min>0&&(+v.q||0)<=v.min);
    const top=Object.entries(ven).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,n])=>{const v=vnGet(id);return v?`<li><b>${n}</b>${vnTit(v)}</li>`:''}).join('');
    return head+`<div class="rc-tot vn-tot"><div><span>Bottiglie in casa</span><b>${tot}</b></div><div><span>Vendute questo mese</span><b>${nv}</b></div>${isMgr(me)&&val?`<div><span>Valore (prezzo d'acquisto)</span><b>${eur(val)}</b></div>`:''}</div>
    ${bassi.length?`<p class="vn-al">${ic('warn')} Da riordinare: ${bassi.map(v=>vnTit(v)+' ('+(+v.q||0)+')').join(', ')}</p>`:''}
    ${top?`<span class="lbl">Più venduti questo mese</span><ol class="vn-top">${top}</ol>`:''}
    <span class="lbl">Conta veloce</span><p class="muted small">− quando vendi una bottiglia, + quando arrivano.</p>
    <div>${all.map(v=>`<div class="vn-inv"><div class="row-i"><div class="row-t">${vnTit(v)}</div><div class="row-m">${esc(v.cant||'')}${ven[v.id]?' · '+ven[v.id]+' vendute':''}</div></div><button type="button" class="icon-btn vn-pm" data-a="vnVen" data-v="${v.id}" aria-label="Venduta una bottiglia di ${esc(v.n)}">−</button><b class="vn-n ${!(+v.q)?'vn-zero':v.min>0&&(+v.q||0)<=v.min?'vn-basso':''}">${+v.q||0}</b><button type="button" class="icon-btn vn-pm" data-a="vnCar" data-v="${v.id}" aria-label="Arrivata una bottiglia di ${esc(v.n)}">+</button></div>`).join('')||'<p class="muted">Ancora nessun vino.</p>'}</div>`}
  // v111 (Mario #130: «cerca il vino in locale, se non c'è dentro c'è un tasto cerca su internet»)
  const qt=String(V.q||'').trim(),mo=can&&!!qt&&gemOn(),q=norm(V.q),cerca=v=>norm([v.n,v.cant,v.den,v.vit,v.ann].join(' ')).includes(q),fuori=!!q&&!all.some(cerca),l=all.filter(v=>(!V.tipo||v.tipo===V.tipo)&&(!V.casa||(+v.q||0)>0)&&(!q||cerca(v)));
  return head+add+`<div class="search rc-cerca">${ic('search')}<input id="vnq" type="search" placeholder="Cerca vino, cantina o vitigno" value="${esc(V.q)}" data-in="vnq" autocomplete="off"></div>
  <div class="chips">${[['','Tutti']].concat(Object.entries(VN_TIPI)).map(([k,t])=>`<button type="button" class="chip" aria-pressed="${V.tipo===k}" data-a="vnTipo" data-v="${k}">${t}</button>`).join('')}<button type="button" class="chip" aria-pressed="${V.casa}" data-a="vnCasa">Solo in casa</button></div>
  <div>${l.length?l.map(v=>vnRow(v,ven[v.id])).join(''):`<p class="muted">${all.length?(fuori?'«'+esc(qt.slice(0,40))+'» non è in cantina.':'Nessun vino trovato in cantina.'+(V.casa?' Togli «Solo in casa» per vedere anche quelli finiti.':'')):can?'La cantina è vuota. Tocca «Fotografa una bottiglia»: l\'IA scrive la scheda del vino, tu controlli e salvi.':'La cantina è vuota: i vini li aggiunge il responsabile.'}</p>`}</div>
  ${mo?(!fuori?`<button type="button" class="btn ghost block vn-mb" data-a="vnMondo">${ic('search')} Non è tra questi? Cerca su internet</button>`
    :`<button type="button" class="btn primary block vn-mb" data-a="vnMondo">${ic('search')} Cerca «${esc(qt.slice(0,40))}» su internet</button>`):''}`}
// v108 (D52, strada 2 «Furba» scelta da Mario #126): «Cerca nel mondo», l'IA cerca su Google (grounding) i vini col nome scritto, lista con le annate, tocchi → scheda scritta dall'IA
// v109: mem = senza ricerca Google (Google ha negato la ricerca, 429): l'IA risponde da quello che sa
function vnMondoPrompt(q,mem){return(mem?'Senza cercare sul web, dimmi i vini veri che conosci che corrispondono a: «':'Cerca sul web (ricerca Google) i vini veri che corrispondono a: «')+q+'». Rispondi SOLO con un JSON, senza altro testo né note: {"vini":[{"nome":"nome del vino, senza la cantina","cantina":"","zona":"regione e paese","denominazione":"DOC/DOCG/IGT…","tipo":"rosso|bianco|rosato|bollicine|dolce","annate":[le annate in commercio, numeri, la più recente prima, massimo 6]}]}. Massimo 6 vini, il più probabile per primo. Solo vini che esistono davvero; se non trovi niente: {"vini":[]}.'}
function vnMondoLeggi(txt){let a;try{a=JSON.parse(String(txt).match(/\{[\s\S]*\}/)[0])}catch(e){return null}
  const s=(x,n)=>String(x==null?'':x).trim().slice(0,n),an=new Date().getFullYear()+1;
  return((a&&a.vini)||[]).filter(x=>x&&s(x.nome,120)).slice(0,6).map(x=>({n:s(x.nome,120),cant:s(x.cantina,120),zona:s(x.zona,80),den:s(x.denominazione,80),tipo:VN_TIPI[x.tipo]?x.tipo:'',
    ann:[...new Set((Array.isArray(x.annate)?x.annate:String(x.annate||'').split(/[^0-9]+/)).map(y=>parseInt(y,10)).filter(y=>y>1900&&y<=an))].slice(0,6)}))}
async function vnMondo(){const q=String(S.vn&&S.vn.q||'').trim();if(!q)return;if(!gemOn())return toast('L\'IA non è attiva su questo telefono.','warn');
  const nuovo=!S.vnM;S.vnM={q,busy:true,t0:Date.now(),l:[],err:''};const M=S.vnM;
  if(nuovo)openSheet({cls:'tall',live:()=>true,render:vnMondoH,onClose:()=>{if(S.vnM===M)S.vnM=null}});else refreshSheet();
  clearInterval(vnMondo.h);vnMondo.h=setInterval(()=>{if(!M.busy||S.vnM!==M){clearInterval(vnMondo.h);return}const e=document.getElementById('vn-ms'),w=document.getElementById('vn-liv');
    if(e)e.textContent=Math.round((Date.now()-M.t0)/1000)+' s';if(w)vnCalSet(vnCalLiv(M))},500);
  let g;try{g=await vnMondoCerca(q)}catch(e){g={err:'Non riesco a contattare l\'IA. Controlla la connessione.'}}
  if(g.mem)M.mem=true;
  if(S.vnM!==M){M.busy=false;return}
  // trovato: il calice si riempie fino all'orlo, poi la lista; tempo salvato per il prossimo caricamento (solo ricerca con Google)
  if(g.txt){if(!M.mem)vnTSalva('mondo',Math.max(1,Math.round((Date.now()-M.t0)/1000)));
    if(vnCalSet(1,'.45s cubic-bezier(.2,.7,.3,1)'))await new Promise(r=>setTimeout(r,480))}
  M.busy=false;if(S.vnM!==M)return;
  if(!g.txt)M.err=g.err&&/riprova/i.test(g.err)?g.err:(g.err||'L\'IA non ha risposto.')+' Riprova.';
  else{M.l=vnMondoLeggi(g.txt)||[];if(!M.l.length)M.err='Non ho trovato vini con questo nome. Prova a scrivere anche la cantina.'}
  refreshSheet()}
// v112 (Mario #132: «ci mette un minuto la ricerca»): prima l25 poi f25 uno dopo l'altro = fino a 45 s di attesa del Worker per un lettore
// fermo, poi l'altro. Ora gara: l25 e f25 con la ricerca Google partono insieme, vince la prima risposta (l'altra si ferma).
// Se Google tace per VN_MONDO.mem (o fallisce) parte anche la domanda senza ricerca (lite, poi flash); la sua lista si usa solo se Google
// non ha risposto entro VN_MONDO.max. Oltre VN_MONDO.stop: errore e «Riprova». thinkingConfig e 400 come in v111.
const VN_MONDO={mem:15000,max:22000,stop:50000};
function vnMondoCerca(q){return new Promise(fine=>{const ac=new AbortController(),sig=ac.signal,t0=Date.now(),sec=()=>Math.round((Date.now()-t0)/1000);
  let gOk=null,gKo=0,gErr={},mem=null,memGo=false,memKo=false,chiuso=false,h1=0,h2=0,h3=0;
  const esci=g=>{if(chiuso)return;chiuso=true;clearTimeout(h1);clearTimeout(h2);clearTimeout(h3);ac.abort();
      if(g.txt&&sec()>=VN_MONDO.mem/1000)errLog('Vino nel mondo lenta: '+sec()+' s ('+(g.mem?'senza Google, ':'')+gemNome(g.l)+')');fine(g)},
    decidi=()=>{if(chiuso)return;if(gOk)return esci(gOk);const gFin=gKo===2;
      if(mem&&(gFin||Date.now()-t0>=VN_MONDO.max))return esci(Object.assign(mem,{mem:true}));
      if(gFin&&!memGo)vaiMem();if(gFin&&memKo)esci(gErr)},
    vaiMem=async()=>{if(memGo||chiuso)return;memGo=true;const b={contents:[{parts:[{text:vnMondoPrompt(q,true)}]}],generationConfig:{temperature:0.2}};
      for(const l of ['lite','flash']){const r=await gemCall(b,l,sig);if(chiuso)return;if(r.txt){mem=Object.assign(r,{l});return decidi()}
        errLog('Vino nel mondo senza Google: '+gemNome(l)+' (errore '+(r.st||'rete')+')');if(r.st&&!GEM_RETRY.test(String(r.st)))break}
      memKo=true;decidi()},
    conG=async l=>{const b={contents:[{parts:[{text:vnMondoPrompt(q)}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.2,thinkingConfig:{thinkingBudget:0}}};
      let g=await gemCall(b,l,sig);
      // se Google non accetta thinkingConfig (400) la stessa domanda senza, una volta
      if(!g.txt&&g.st===400&&!chiuso){b.generationConfig={temperature:0.2};g=await gemCall(b,l,sig)}
      if(chiuso)return;if(g.txt){gOk=Object.assign(g,{l});return decidi()}
      errLog('Vino nel mondo: '+gemNome(l)+' non ha cercato (errore '+(g.st||'rete')+(g.msg?': '+String(g.msg).slice(0,160):'')+')');
      if(!gKo||g.st)gErr=g;gKo++;decidi()};
  // v110 (#129): la ricerca Google gratis c'è solo con Gemini 2.5 (500 al giorno; con Gemini 3 solo a pagamento) → lettori l25, f25
  conG('l25');conG('f25');
  h1=setTimeout(vaiMem,VN_MONDO.mem);h2=setTimeout(decidi,VN_MONDO.max);
  h3=setTimeout(()=>esci({err:'Google ci ha messo troppo a rispondere. Riprova.'}),VN_MONDO.stop)})}
// v111 (scelta A «Calice» di Mario #130, «fai bene l'animazione… ottimizzata senza appesantire»): il vino sale nel calice sul tempo solito
// (media delle ultime 5 ricerche riuscite, jona_ia_t.mondo): a quel tempo ~3/4, poi rallenta senza arrivare all'orlo; l'orlo solo a risposta arrivata.
// Si muovono solo transform (livello ogni 0,5 s con transizione lineare, onda in CSS): niente ridisegni della pagina.
function vnCalLiv(M){if(!M.busy)return 1;const t=(Date.now()-M.t0)/1000;return .92*(1-Math.exp(-1.6*t/vnMondoT()))}
// v112: tempo solito della ricerca al massimo VN_MONDO.max (le ricerche lente di prima non fanno più salire il vino piano piano)
function vnMondoT(){return Math.min(vnTSolito('mondo'),VN_MONDO.max/1000)}
// v112 (Mario #131: «fai un calice bello da vino rosso disegnalo tu», poi «anima il vino rendilo vivo fluido»): calice da rosso disegnato a mano (tratti d'inchiostro a spessore variabile da tools/calice-mano.mjs), acquerello in un SVG fermo a parte; vino versato dall'alto (getto + cerchi), che oscilla (rotate) e sale (translateY), superficie larga come la coppa (scaleX da VN_CALW)
const VN_CALW=[26.5,27.7,28.9,30,31,31.8,32.4,32.8,33,33,32.7,32,30.9,29.3,27.1,24.2,20.2,14.6,0];// mezza larghezza della coppa ogni 4 da y 44 a 116
const VN_CAL={ink:'M39 25.4L37.8 28.9L36.7 32.3L35.6 36.1L34.5 39.2L33.5 42.2L32.5 45.1L31.6 48L30.7 50.8L29.9 53.6L29.2 56.3L28.5 59.1L27.9 61.9L27.4 64.7L26.9 67.6L26.6 70.5L26.4 73.6L26.2 76.7L26.2 80L26.4 83.4L26.8 86.6L27.5 89.8L28.5 92.8L29.7 95.7L31.1 98.5L32.7 101.1L34.4 103.5L36.4 105.8L38.4 108L40.7 109.9L43.1 111.6L45.6 113.1L48.3 114.4L51.1 115.4L54 116.1L57 116.4L60 116.3L60 115.7L57.1 115.1L54.3 114.5L51.6 113.7L49 112.7L46.4 111.6L44 110.2L41.7 108.5L39.6 106.7L37.6 104.7L35.7 102.6L34 100.2L32.5 97.7L31.1 95.1L29.9 92.4L28.9 89.4L28.2 86.4L27.9 83.2L27.8 80L28 76.8L28.2 73.7L28.4 70.7L28.7 67.8L29 65L29.5 62.2L30 59.4L30.6 56.7L31.4 54L32.1 51.2L32.9 48.4L33.8 45.5L34.7 42.6L35.6 39.6L36.6 36.4L37.7 32.6L38.6 29.2L39.5 25.5ZM80.9 26L81.7 29.7L82.6 33.1L83.5 36.4L84.5 39.6L85.4 42.6L86.3 45.5L87.2 48.4L88.1 51.1L89 53.9L89.7 56.6L90.4 59.3L90.9 62.1L91.3 64.9L91.7 67.7L91.9 70.7L92.2 73.6L92.2 76.7L92.2 80L92 83.2L91.5 86.3L90.8 89.4L89.9 92.3L88.8 95.1L87.5 97.7L86 100.2L84.3 102.6L82.5 104.8L80.5 106.8L78.4 108.7L76.1 110.4L73.7 111.8L71.1 113L68.5 114L65.8 114.8L62.9 115.4L60 115.9L60 116.3L63 116.4L66 115.9L68.9 115.2L71.6 114.1L74.2 112.9L76.8 111.4L79.2 109.7L81.5 107.9L83.6 105.8L85.6 103.6L87.3 101.1L88.9 98.5L90.3 95.7L91.4 92.8L92.3 89.8L93 86.6L93.5 83.4L93.6 80L93.6 76.7L93.5 73.6L93.2 70.5L92.9 67.6L92.6 64.7L92.1 61.9L91.5 59.1L90.9 56.3L90.2 53.5L89.5 50.7L88.7 47.9L87.9 45L86.9 42.1L85.9 39.1L84.8 36L83.6 32.8L82.5 29.4L81.3 25.9ZM38.4 26L38.3 26.6L38.9 27.2L39.7 27.6L40.8 28.1L42.1 28.4L43.7 28.8L45.6 29L47.6 29.3L49.9 29.5L52.3 29.7L54.8 29.9L57.4 30L60 30.1L62.6 30.1L65.2 30L67.7 29.9L70.1 29.6L72.4 29.4L74.4 29.1L76.3 28.9L78 28.7L79.4 28.4L80.4 27.9L81.1 27.2L81.4 26.4L81.2 25.9L80.9 25.8L80.7 26L80.5 26.3L79.9 26.7L78.9 27L77.6 27.3L76.1 27.5L74.2 27.8L72.2 28L70 28.4L67.7 28.8L65.2 29L62.6 29.1L60 29L57.4 28.9L54.8 28.8L52.3 28.6L50 28.2L47.8 27.9L45.8 27.6L44 27.4L42.4 27.2L41.1 27L40.1 26.7L39.4 26.4L39 26.2L38.7 25.9ZM39.8 25.5L40.8 25.1L42.1 24.7L43.9 24.4L46 23.9L48.4 23.5L51.1 23.3L53.9 23.1L56.9 23L60 23.1L63.1 23.2L66.1 23.3L68.9 23.2L71.6 23.4L74 23.9L76.1 24.4L77.8 24.8L79.2 25.1L80.2 25.4L80.3 25.3L79.4 24.8L78 24.3L76.2 23.9L74.1 23.3L71.7 22.8L69 22.7L66.1 22.6L63.1 22.6L60 22.5L56.9 22.4L53.9 22.6L51 22.8L48.4 23.1L45.9 23.4L43.8 23.8L42 24.3L40.7 24.8L39.7 25.4ZM56.9 117.1L57 117.8L57.2 118.4L57.4 119L57.6 119.7L57.7 120.3L57.9 120.9L58 121.5L58.1 122.1L58.1 122.8L58.1 123.5L58 124.2L58 124.9L57.9 125.6L57.9 126.4L57.8 127.2L57.9 128.1L57.9 129L57.9 130L57.9 133.3L57.9 136.5L58 139.6L58 142.6L58 145.5L58 148.3L58 150.9L58 153.5L58 156L58.1 158.4L58.1 160.6L58.1 162.7L58.1 164.7L58 166.6L58 168.4L57.9 170.1L57.8 171.6L57.7 173L57.6 173.7L57.4 174.4L57.1 175L56.7 175.7L56.2 176.4L55.5 177L54.7 177.7L53.7 178.3L52.5 178.9L51.2 179.5L49.6 180.1L47.8 180.7L45.9 181.2L43.7 181.7L41.4 182.2L38.8 182.8L36 183.3L33 183.9L33 184.4L36.1 184.1L39 183.7L41.6 183.3L44 182.8L46.2 182.2L48.1 181.7L49.9 181.1L51.5 180.5L53 179.9L54.2 179.3L55.3 178.6L56.2 177.9L57 177.1L57.6 176.4L58.1 175.6L58.5 174.7L58.7 173.9L58.8 173L58.9 171.6L59 170.1L59 168.4L59.1 166.7L59.1 164.8L59.1 162.7L59.1 160.6L59.1 158.4L59 156L59 153.5L58.9 150.9L58.9 148.3L58.9 145.5L58.9 142.6L58.9 139.6L59 136.5L59 133.3L59.1 130L59.1 129L59.1 128.1L59.1 127.2L59.1 126.4L59.1 125.6L59 124.8L59 124.1L59 123.4L58.9 122.7L58.8 122L58.7 121.4L58.6 120.8L58.4 120.1L58.2 119.5L58 118.9L57.8 118.3L57.5 117.6L57.2 117ZM62.8 117L62.4 117.6L62.2 118.2L62 118.9L61.8 119.5L61.6 120.1L61.4 120.7L61.3 121.4L61.2 122L61.1 122.7L61 123.4L61 124.1L61 124.8L61 125.6L61 126.4L61 127.2L61 128.1L60.9 129L60.9 130L60.9 133.3L60.9 136.5L60.8 139.6L60.8 142.6L60.8 145.5L60.8 148.3L60.8 150.9L60.8 153.5L60.8 156L60.8 158.4L60.8 160.6L60.8 162.7L60.9 164.8L60.9 166.7L60.9 168.4L60.9 170.1L60.9 171.6L60.9 173L61 174L61.2 174.9L61.6 175.7L62.1 176.5L62.8 177.3L63.7 178L64.7 178.6L65.8 179.2L67.1 179.7L68.5 180.3L70.1 180.9L71.9 181.5L73.9 182.1L76.1 182.6L78.4 183.2L81 183.7L83.9 184.1L86.9 184.4L87 184.1L84 183.5L81.2 182.9L78.6 182.3L76.3 181.7L74.1 181.1L72.2 180.5L70.5 179.9L68.9 179.4L67.5 178.8L66.3 178.3L65.3 177.7L64.4 177.1L63.6 176.5L63 175.9L62.5 175.2L62.2 174.5L62 173.8L62 173L62 171.6L62 170.1L62 168.4L62 166.6L62 164.7L62 162.7L61.9 160.6L61.9 158.4L61.9 156L61.8 153.5L61.8 150.9L61.8 148.3L61.8 145.5L61.8 142.6L61.8 139.6L61.8 136.5L61.9 133.3L61.9 130L62 129L62 128.1L62 127.2L62 126.4L62 125.6L62 124.9L62 124.2L62 123.5L62.1 122.8L62.1 122.2L62.2 121.5L62.3 120.9L62.4 120.3L62.6 119.7L62.7 119.1L62.9 118.5L63.1 117.8L63.2 117.1ZM31.3 184.1L31.4 184.7L32 185.3L32.9 185.8L34.2 186.2L35.7 186.7L37.6 187.3L39.7 187.9L42.1 188.3L44.7 188.5L47.6 188.6L50.5 188.7L53.6 188.8L56.8 188.9L60 189.1L63.2 189.1L66.4 189.1L69.5 188.9L72.4 188.6L75.2 188.2L77.8 187.8L80.2 187.5L82.4 187.1L84.3 186.8L85.8 186.3L87.1 185.9L88.1 185.4L88.8 184.8L88.9 184.1L88.5 184L88.1 184.3L87.5 184.5L86.6 184.7L85.4 185L83.9 185.4L82.1 185.8L80 186.1L77.7 186.4L75.1 186.7L72.3 187L69.4 187.3L66.3 187.5L63.2 187.6L60 187.6L56.8 187.6L53.7 187.5L50.6 187.4L47.7 187.2L44.9 187L42.3 186.7L39.9 186.4L37.8 186L36 185.6L34.5 185.2L33.3 184.8L32.5 184.5L32 184.2L31.7 183.9ZM32.3 185.3L32.9 186L34 186.7L35.6 187.4L37.7 187.9L40.1 188.3L42.9 188.7L45.9 189L49.2 189.2L52.7 189.3L56.3 189.4L60 189.5L63.7 189.5L67.3 189.4L70.8 189.2L74.1 188.9L77.1 188.6L79.9 188.3L82.4 187.9L84.4 187.5L86 186.9L87.2 186.2L87.8 185.5L87.7 185.4L87 185.8L85.9 186.4L84.3 187L82.2 187.4L79.8 187.6L77 187.9L74 188.2L70.7 188.6L67.3 188.9L63.7 189L60 188.9L56.3 188.8L52.7 188.6L49.3 188.6L46 188.5L42.9 188.3L40.2 187.9L37.7 187.5L35.7 187L34.1 186.4L33 185.8L32.4 185.2ZM33.2 183L34.6 182.5L36.6 182L39 181.5L41.8 181.2L45 181L48.5 180.6L52.2 180.3L56.1 180.1L60 180.2L63.9 180.3L67.8 180.4L71.5 180.6L75 180.8L78.2 181.1L81 181.4L83.5 181.8L85.4 182.3L86.9 182.7L87 182.6L85.5 182L83.5 181.5L81.1 181L78.2 180.7L75 180.4L71.5 180.1L67.8 180L63.9 179.9L60 179.7L56.1 179.7L52.2 179.8L48.5 180.2L45 180.5L41.8 180.8L38.9 181.1L36.5 181.6L34.6 182.3L33.2 183Z',tr:'M85.9 50.1L88.4 53.3L88.6 53.2L86 50Z M85.5 57.1L88.3 60.2L88.3 60.2L85.6 57Z M85.1 64.1L88.1 67.2L88.2 67.1L85.2 64Z M84.7 71.1L87.9 74.2L88 74.1L84.8 71Z M84.4 78L87.6 81.3L87.7 81.2L84.5 77.9Z',sup:'M33.3 0L32.7 1.1L31.2 2.1L28.6 3.1L25.2 4L21.2 4.7L16.5 5.4L11.3 5.8L5.7 6.1L0 6.2L-5.7 6.1L-11.2 5.8L-16.5 5.4L-21.2 4.7L-25.3 4L-28.6 3.1L-31 2.1L-32.4 1.1L-32.9 0L-32.3 -1.1L-30.8 -2.1L-28.4 -3.1L-25.1 -4L-21 -4.7L-16.3 -5.3L-11.2 -5.8L-5.7 -6L0 -6.1L5.7 -6.1L11.3 -5.8L16.5 -5.4L21.2 -4.8L25.3 -4L28.7 -3.1L31.2 -2.1L32.7 -1.1L33.2 0Z',supl:'M32.1 0.8L30.9 1.7L29 2.5L26.3 3.3L23 4L19.1 4.6L14.8 5.1L10.1 5.4L5.1 5.6L0 5.8L-5.1 5.8L-10.1 5.6L-14.8 5.1L-19.1 4.6L-23 4L-26.3 3.3L-28.9 2.5L-30.9 1.7L-32.1 0.9L-32.2 1L-31.1 2.1L-29.1 3L-26.5 3.9L-23.1 4.6L-19.2 5.1L-14.8 5.6L-10.1 6L-5.1 6.3L0 6.3L5.1 6.3L10.1 6L14.8 5.6L19.2 5.1L23.1 4.5L26.4 3.8L29.1 3L31.1 2L32.2 0.9Z',coppa:'M39 26C33 48 26.5 60 27 80C27.5 100 42 115.5 60 116C78 115.5 92.5 100 93 80C93.5 60 87 48 81 26Z'};
function vnCalY(v){return 116-46*Math.max(0,Math.min(1,v))}
function vnCalSx(y){const i=Math.max(0,Math.min(17.999,(y-44)/4)),k=i|0;return Math.max(.05,(VN_CALW[k]+(VN_CALW[k+1]-VN_CALW[k])*(i-k))/33)}
function vnCalSet(v,tr){const w=document.getElementById('vn-liv'),u=document.getElementById('vn-sup');if(!w)return false;const y=vnCalY(v);
  if(tr){w.style.transition=u.style.transition='transform '+tr;if(v>=1)w.closest('.vn-cal').classList.add('fine')}w.style.transform='translateY('+y.toFixed(2)+'px)';u.style.transform='scaleX('+vnCalSx(y).toFixed(3)+')';return true}
function vnCaliceH(M){const y=vnCalY(vnCalLiv(M)),C=VN_CAL,B='M14 92C6 62 22 30 52 22C80 15 104 30 108 56C112 80 98 98 84 112C70 126 44 132 30 120C20 112 17 104 14 92Z',T='<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="10"/>';
  return`<div class="vn-cal" aria-hidden="true"><svg class="vn-calw" viewBox="0 0 120 200"><defs><filter id="vn-acq" x="-30%" y="-30%" width="160%" height="160%">${T}<feGaussianBlur stdDeviation=".6"/></filter><filter id="vn-acqb" x="-30%" y="-30%" width="160%" height="160%">${T}<feGaussianBlur stdDeviation="1.4"/></filter></defs><path d="${B}" fill="#eebcc4" opacity=".42" filter="url(#vn-acq)"/><path d="${B}" fill="none" stroke="#c97786" stroke-width="1.6" opacity=".35" filter="url(#vn-acqb)"/><g filter="url(#vn-acq)"><path d="M80 34C86 48 90 64 89 80C88 92 84 100 79 105C83 88 84 56 80 34Z" fill="#a9bfcb" opacity=".35"/><ellipse cx="62" cy="186" rx="33" ry="4.6" fill="#8b7d76" opacity=".22"/></g></svg>
  <svg viewBox="0 0 120 200"><defs><clipPath id="vn-calk"><path d="${C.coppa}"/></clipPath><clipPath id="vn-supk"><ellipse rx="30" ry="5.5"/></clipPath><radialGradient id="vn-vino" cx=".5" cy=".1" r=".75"><stop offset="0" stop-color="#b02a44"/><stop offset=".4" stop-color="#8a1a2f"/><stop offset=".8" stop-color="#5b0c1d"/><stop offset="1" stop-color="#4a0817"/></radialGradient><linearGradient id="vn-sup-c"><stop offset="0" stop-color="#9c2539"/><stop offset=".4" stop-color="#c94a62"/><stop offset=".7" stop-color="#b13550"/><stop offset="1" stop-color="#7d1a2d"/></linearGradient><radialGradient id="vn-fio"><stop offset="0" stop-color="#c6526a" stop-opacity=".55"/><stop offset="1" stop-color="#c6526a" stop-opacity="0"/></radialGradient><linearGradient id="vn-gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a1a2f" stop-opacity="0"/><stop offset=".12" stop-color="#8a1a2f"/></linearGradient></defs>
  <g class="vn-getto"><path d="M55.9 -12C56.1 4 56.5 14 56.5 30V118H58.3V30C58.3 14 58.7 4 58.9 -12Z" fill="url(#vn-gt)"/><path class="vn-gt2" d="M57.3 -6V118" stroke="#d66a80" stroke-width=".55" stroke-dasharray="4 10" stroke-linecap="round"/></g>
  <g clip-path="url(#vn-calk)"><g id="vn-liv" class="vn-liv" style="transform:translateY(${y.toFixed(2)}px)"><g transform="translate(60 0)"><g class="vn-slosh"><rect x="-80" y="0" width="160" height="90" fill="url(#vn-vino)"/><ellipse cx="-16" cy="22" rx="12" ry="9" fill="url(#vn-fio)"/><ellipse cx="14" cy="34" rx="8" ry="6" fill="url(#vn-fio)" opacity=".6"/>
    <g id="vn-sup" class="vn-sup" style="transform:scaleX(${vnCalSx(y).toFixed(3)})"><path d="${C.sup}" fill="url(#vn-sup-c)"/><path d="${C.supl}" fill="#4a0817" opacity=".7"/><g clip-path="url(#vn-supk)"><path class="vn-onda" d="M-54 -1q4-1.2 8 0t8 0 8 0 8 0 8 0 8 0 8 0 8 0 8 0 8 0 8 0 8 0" stroke="#f3c1cb" stroke-width=".7" fill="none" opacity=".7"/></g></g>
    <g class="vn-cerchi"><ellipse class="vn-c1" cx="-2.6" rx="3.4" ry=".9"/><ellipse class="vn-c2" cx="-2.6" rx="3.4" ry=".9"/></g></g></g></g></g>
  <g class="vn-luce"><path d="M33.5 44C30 58 29.5 74 31.5 88" stroke-width="2.4"/><path d="M34 94q2 7 6 11" stroke-width="1.2" opacity=".8"/><path d="M60 133V168" stroke-width=".7" opacity=".8"/></g>
  <g class="vn-ink"><path d="${C.ink}"/><path d="${C.tr}" opacity=".55"/></g></svg></div>`}
function vnMondoDop(x,y){return vnAll().find(v=>norm(v.n)===norm(x.n)&&norm(v.cant||'')===norm(x.cant||'')&&(!y||String(v.ann||'')===String(y)))}
function vnMondoH(){const M=S.vnM||{q:'',l:[]};
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">Cerca su internet<div class="sh-s">«${esc(M.q)}»</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  ${M.busy?`<div class="vn-cbox" role="status">${vnCaliceH(M)}<p>L'IA cerca su Google i vini con questo nome… <b id="vn-ms">${Math.round((Date.now()-M.t0)/1000)} s</b></p><p class="muted small">di solito circa ${vnMondoT()} secondi</p></div>`:''}
  ${M.err?`<p class="vn-al">${ic('warn')} ${esc(M.err)}</p><button type="button" class="btn primary block" data-a="vnMondo">Riprova</button>`:''}
  ${!M.busy&&M.l.length&&M.mem?`<p class="vn-al">${ic('warn')} Google adesso non fa ricerche: elenco dalla memoria dell'IA. Controlla bene nomi e annate.</p>`:''}
  ${!M.busy&&M.l.length?`<p class="muted small vn-hint">Tocca il vino giusto o la sua annata: l'IA scrive la scheda, tu controlli e salvi.</p>`+M.l.map((x,i)=>`<div class="vn-mo"><button type="button" class="prow vn-r" data-a="vnMondoSel" data-v="${i}"><span class="vn-dot vn-${esc(x.tipo||'rosso')}" aria-hidden="true"></span><div class="row-i"><div class="row-t">${esc(x.n)}</div><div class="row-m">${esc([x.cant,x.den||x.zona].filter(Boolean).join(' · '))||'&nbsp;'}</div>${vnMondoDop(x)?'<div class="row-m"><b>Già in cantina</b></div>':''}</div></button>${x.ann.length?`<div class="chips">${x.ann.map(y=>`<button type="button" class="chip" data-a="vnMondoSel" data-v="${i}:${y}">${y}</button>`).join('')}</div>`:''}</div>`).join(''):''}`}
function vnMondoSel(v){const M=S.vnM,[i,y]=String(v).split(':'),x=M&&M.l[+i];if(!x)return;const d=vnMondoDop(x,y);closeSheet();
  if(d){toast('Questo vino è già in cantina.');return vnShow(d.id)}
  vnForm(null);Object.assign(S.vnf,{n:x.n,cant:x.cant,ann:y||'',den:x.den},x.tipo?{tipo:x.tipo}:{});refreshSheet();vnIaGo(null)}
function vnShow(id){S.vnId=id;openSheet({cls:'tall',live:()=>true,render:()=>{const v=vnGet(S.vnId),me=meU();if(!v)return`<div class="grab"></div><p class="muted">Vino eliminato.</p>`;
  const q=+v.q||0,abb=VN_ABB.filter(x=>(v.abb||[]).includes(x[0])).map(x=>x[1]),ven=vnVenduti()[v.id]||0;
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t"><span class="vn-dot vn-${esc(v.tipo||'rosso')}" aria-hidden="true"></span> ${vnTit(v)}<div class="sh-s">${vnSub(v)}</div></div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  <div class="vn-tav"><span class="vn-tl">Al tavolo in 10 secondi</span>${v.frase?`<p class="vn-fr">«${esc(v.frase)}»</p>`:''}${v.parole?`<p class="vn-par">${esc(v.parole)}</p>`:''}
    ${abb.length?`<p><b>Va con:</b> ${abb.map(esc).join(', ')}</p>`:''}${v.serv?`<p><b>Servizio:</b> ${esc(v.serv)}</p>`:''}${v.pv?`<p><b>Prezzo in carta:</b> ${eur(v.pv)}</p>`:''}</div>
  <div class="vn-inv vn-inv1"><div class="row-i"><div class="row-t">In casa: ${q} ${q===1?'bottiglia':'bottiglie'}</div><div class="row-m">${ven?ven+' vendute questo mese':'Nessuna vendita questo mese'}${isMgr(me)&&v.pc?' · acquisto '+eur(v.pc):''}</div></div>
    <button type="button" class="btn primary" data-a="vnVen" data-v="${v.id}">− Venduta</button><button type="button" class="btn ghost" data-a="vnCar" data-v="${v.id}">+ Arrivata</button></div>
  ${v.vit?`<span class="lbl">Denominazione e vitigni</span><p class="vn-tx">${esc([v.den,v.vit].filter(Boolean).join(' — '))}</p>`:''}
  ${VN_CAMPI.filter(([k])=>v[k]&&k!=='serv').map(([k,l])=>`<span class="lbl">${l}</span><p class="vn-tx">${esc(v[k])}</p>`).join('')}
  ${v.ia?`<p class="muted small">Scheda scritta con l'IA${v.ia==='dubbio'?': il vino non era sicuro, controlla bene':''}.</p>`:''}
  ${vnCan(me)?`<div class="sheet-foot btns" style="margin-top:18px"><button type="button" class="btn ghost" data-a="vnConta" data-v="${v.id}">Correggi il numero</button><button type="button" class="btn primary" data-a="vnEdit" data-v="${v.id}">${ic('pencil')} Modifica</button></div>`:''}`}})}
function vnForm(v){const sv=x=>x==null||x===''?'':String(x).replace('.',',');const f=v?clone(v):{n:'',cant:'',ann:'',gr:'',tipo:'rosso',den:'',vit:'',storia:'',palato:'',naso:'',colore:'',abb:[],abbT:'',prod:'',serv:'',frase:'',parole:'',pv:'',pc:'',q:'',min:''};
  for(const k of ['gr','pv','pc','q','min'])f[k]=sv(f[k]);f.abb=(f.abb||[]).slice();S.vnf=f;openSheet({cls:'tall',live:()=>true,render:vnFormH,onClose:()=>{f.chiusa=true;if(S.vnf===f)S.vnf=null;vnBozzaVia()}})}
function vnFormH(){const f=S.vnf,me=meU(),inp=(k,l,ph,x)=>`<label class="lbl" for="vnf-${k}">${l}</label><input class="inp" id="vnf-${k}" data-in="vnf" data-k="${k}" value="${esc(f[k])}" placeholder="${esc(ph||'')}"${x||''}>`,
  ta=(k,l,ph)=>`<label class="lbl" for="vnf-${k}">${l}</label><textarea class="inp vn-ta" id="vnf-${k}" data-in="vnf" data-k="${k}" rows="3" placeholder="${esc(ph||'')}">${esc(f[k])}</textarea>`,num_=(k,l,ph)=>`<label><span class="lbl">${l}</span><input class="inp" id="vnf-${k}" inputmode="decimal" data-in="vnf" data-k="${k}" value="${esc(f[k])}" placeholder="${esc(ph||'')}"></label>`;
  return`<div class="grab"></div><div class="sh-h"><div class="sh-t">${f.id?'Modifica vino':'Nuovo vino'}</div><button type="button" class="icon-btn" data-a="closeSheet" aria-label="Chiudi">${ic('x')}</button></div>
  ${f.busy?vnBusyH(f):(f.fotos||[]).length?vnFotoH(f):`<div class="btns vn-add"><button type="button" class="btn ghost" data-a="vnFotoF">${ic('camera')} Foto dell'etichetta</button>${f.rip?`<button type="button" class="btn ghost" data-a="vnFotoG">${ic('image')} Galleria</button>`:''}<button type="button" class="btn ghost" data-a="vnIa">${ic('sparkle')} Completa con l'IA</button></div>`}
  ${!f.busy&&f.ko?vnRiH(f):''}
  ${f.rip?`<p class="vn-al vn-rip">${ic('warn')} ${f.rip==='cam'?'Il telefono ha chiuso l\'app mentre c\'era la fotocamera. Ho ripreso la scheda: rifai la foto. Se succede ancora: scatta con la Fotocamera del telefono, poi qui tocca «Galleria».':'Il telefono aveva chiuso l\'app: ho ripreso la scheda del vino.'}</p>`:''}
  ${f.ia&&f.lt&&(f.lg||[]).length?`<p class="muted small vn-lt">Letto da ${esc(gemNome(f.lt))}. Prima: ${f.lg.map(x=>esc(gemNome(x.l))+' — '+esc(gemPerche(x.l,x.st))).join('; ')}.</p>`:''}
  ${f.ia?`<p class="vn-al">${ic('warn')} Scritto dall'IA${f.ia==='dubbio'?', che non era sicura del vino':''}: controlla annata, gradi e premi prima di salvare.</p>`:''}
  ${inp('n','Nome del vino','Es. Tignanello')}${inp('cant','Cantina','Es. Antinori')}
  <div class="ag-2">${num_('ann','Annata','Es. 2020')}${num_('gr','Gradi (% vol)','Es. 14,5')}</div>
  <span class="lbl">Tipo</span><div class="chips">${Object.entries(VN_TIPI).map(([k,t])=>`<button type="button" class="chip" aria-pressed="${f.tipo===k}" data-a="vnfTipo" data-v="${k}">${t}</button>`).join('')}</div>
  ${inp('den','Denominazione','Es. Toscana IGT')}${inp('vit','Vitigni','Es. 80% Sangiovese, 15% Cabernet Sauvignon')}
  ${inp('frase','Frase da dire al tavolo','Una frase breve per proporlo al cliente')}${inp('parole','3 parole chiave','Es. Strutturato · Ciliegia · Vaniglia')}
  <span class="lbl">Va con</span><div class="vn-abb">${VN_ABB.map(([k,l])=>`<button type="button" class="chip" aria-pressed="${f.abb.includes(k)}" data-a="vnfAbb" data-v="${k}">${l}</button>`).join('')}</div>
  ${VN_CAMPI.map(([k,l])=>ta(k,l)).join('')}
  <div class="ag-2">${num_('pv','Prezzo in carta €','Es. 60')}${isMgr(me)?num_('pc','Prezzo d\'acquisto €','Es. 28'):''}</div>
  <div class="ag-2">${num_('q','Bottiglie in casa','0')}${num_('min','Avvisa sotto','Es. 2')}</div>
  <div class="sheet-foot btns" style="margin-top:18px">${f.id?`<button type="button" class="btn ghost danger" data-a="vnDel">${ic('trash')} Elimina</button>`:''}<button type="button" class="btn primary big" data-a="vnSave">${ic('check')} Salva</button></div>`}
function vnPrompt(nome,n){return'Sei un sommelier esperto e aiuti i camerieri di un ristorante a Porto Cervo (Sardegna) a proporre i vini al tavolo. '+
  (nome?'Il vino è: '+nome+'. ':n>1?'Queste sono '+n+' foto della stessa bottiglia di vino (fronte e retro): leggi le scritte di tutte e unisci le informazioni, usando le foto dell\'etichetta. ':'Questa è la foto dell\'etichetta (o della bottiglia) di un vino. ')+
  'Rispondi SOLO con JSON valido, senza altro testo, con queste chiavi: {"nome":"nome del vino senza la cantina","cantina":"","annata":"AAAA oppure vuoto","gradi":numero oppure 0,"tipo":"rosso|bianco|rosato|bollicine|dolce",'+
  '"denominazione":"es. Toscana IGT, Vermentino di Gallura DOCG","vitigni":"es. 85% Cabernet Sauvignon, 15% Cabernet Franc","storia":"2-3 frasi: storia della cantina o del vino, un aneddoto e i premi più noti","palato":"corpo, tannino, acidità e freschezza in 1-2 frasi",'+
  '"naso":"i 3 o 4 profumi principali","colore":"colore nel bicchiere","abbinamento":"piatti con cui proporlo e perché si bilanciano, 1-2 frasi","abbinamenti":["carne","bianca","pesce","crudi","primi","formaggi","dolce","aperitivo"] (solo quelli adatti),'+
  '"produzione":"come nasce: vinificazione e affinamento","servizio":"temperatura, tipo di calice, se decantare","frase":"una frase da dire al cliente al tavolo, al massimo 25 parole","parole":"3 parole chiave separate da · (es. Strutturato · Ciliegia · Vaniglia)","sicuro":true}. '+
  'Annata e gradi: scrivili solo se li leggi sull\'etichetta o sono nel nome, altrimenti vuoto e 0. Premi: solo quelli che conosci con certezza, mai inventati. '+
  'Se non riconosci il vino con certezza metti "sicuro":false e scrivi le parti generali in base a denominazione e vitigno. Testi in italiano semplice.'}
function vnLeggi(txt){let a;try{const m=String(txt).match(/\{[\s\S]*\}/);a=JSON.parse(m?m[0]:txt)}catch(e){return null}if(!a||typeof a!=='object')return null;
  const s=(k,n)=>String(a[k]==null?'':a[k]).trim().slice(0,n||600),tipo=String(a.tipo||'').toLowerCase(),gr=Number(String(a.gradi||'').replace(',','.'));
  const r={n:s('nome',120),cant:s('cantina',120),ann:/^(19|20)\d{2}$/.test(s('annata'))?s('annata'):'',gr:gr>3&&gr<25?String(gr).replace('.',','):'',tipo:VN_TIPI[tipo]?tipo:/bollic|spumant|champ/.test(tipo)?'bollicine':'',
    den:s('denominazione',160),vit:s('vitigni',200),storia:s('storia'),palato:s('palato'),naso:s('naso',300),colore:s('colore',200),abbT:s('abbinamento'),prod:s('produzione'),serv:s('servizio',300),frase:s('frase',220),parole:s('parole',120),
    abb:(Array.isArray(a.abbinamenti)?a.abbinamenti:[]).map(x=>String(x).toLowerCase()).filter(x=>VN_ABB.some(y=>y[0]===x)),ia:a.sicuro===false?'dubbio':'si'};
  return r.n||r.cant?r:null}
function vnUnisci(f,r){for(const [k,x] of Object.entries(r)){if(k==='abb'){if(!f.abb.length)f.abb=x.slice();continue}if(k==='ia'){f.ia=x;continue}if(x&&!String(f[k]||'').trim())f[k]=x}
  if(r.tipo&&!f.id&&!f._tipo)f.tipo=r.tipo}
// v106: caricamento vero (richiesta di Mario #125): secondi che passano, barra sul tempo solito di quel lettore (ultime 5 letture riuscite, jona_ia_t), secondi di ogni tentativo fallito
const VN_TSOLITO={f25:15,l25:10,flash:20,lite:12,cf:30,mondo:10};
function vnTSolito(l){const a=((ls('jona_ia_t')||{})[l])||[];return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):VN_TSOLITO[l]||20}
function vnTSalva(l,sec){const t=ls('jona_ia_t')||{};t[l]=(t[l]||[]).concat(sec).slice(-5);ls('jona_ia_t',t)}
function vnBusyH(f){const sol=f.bl?vnTSolito(f.bl):0;
  return`<div class="vn-busy" role="status">${ic('clock')} <span style="flex:1;min-width:0">L'IA sta ${(f.fotos||[]).length?'leggendo le foto':'scrivendo la scheda del vino'}…${f.bl?` <span class="muted small">(${esc(gemNome(f.bl))})</span>`:''}
  <span class="vn-bar"><i id="vn-bar"></i></span><span class="small" id="vn-sec">${vnSecTxt(f,sol)}</span>
  ${(f.lg||[]).map(x=>`<br><span class="muted small">✗ ${esc(gemNome(x.l))}: ${esc(gemPerche(x.l,x.st))} · ${x.sec} s</span>`).join('')}</span></div>`}
function vnSecTxt(f,sol){const el=Math.round((Date.now()-(f.t0||Date.now()))/1000),a=Math.round((Date.now()-(f.ta||Date.now()))/1000);
  return el+' s in tutto'+(sol?' · di solito '+(f.bl?gemNome(f.bl).replace(/^Gemini /,''):'')+' ci mette circa '+sol+' s'+(a>sol*1.5?' · sta ancora lavorando, aspetta':''):'')}
function vnTick(){clearInterval(vnTick.h);vnTick.h=setInterval(()=>{const f=S.vnf;if(!f||!f.busy){clearInterval(vnTick.h);return}
  const sol=f.bl?vnTSolito(f.bl):20,a=(Date.now()-(f.ta||Date.now()))/1000,e=document.getElementById('vn-sec'),b=document.getElementById('vn-bar');
  if(e)e.textContent=vnSecTxt(f,f.bl?sol:0);if(b)b.style.width=(a<sol?a/sol*85:85+12*(1-Math.exp(-(a-sol)/sol))).toFixed(1)+'%'},250)}
async function vnIaGo(files,au){const f=S.vnf;if(!f||f.busy)return false;const nome=[f.n,f.cant,f.ann].map(x=>String(x||'').trim()).filter(Boolean).join(' ');
  if(!files&&!nome){toast('Scrivi prima il nome del vino (e la cantina).','warn');return false}
  f.busy=true;f.bl='';f.lg=[];f.lt='';f.t0=f.ta=Date.now();refreshSheet();vnTick();try{const im=[];if(files)for(const x of files.slice(0,VN_FMAX))im.push({inline_data:{mime_type:'image/jpeg',data:await b64(VN_PIC.has(x)?x:await shrinkImg(x))}});
    const body=p=>({contents:[{parts:[{text:vnPrompt(files?'':nome,p.length)}].concat(p)}],generationConfig:{temperature:0.2}});
    // D44: stessi lettori dei listini (Flash → Flash-Lite → Cloudflare), tutte le foto nella stessa richiesta
    let g={};for(const [l] of GEM_LETT){f.bl=l;f.ta=Date.now();refreshSheet();let r=await gemCall(body(im),l);
      // Cloudflare (Llama 4) potrebbe non accettare più foto insieme: riprova con la sola prima foto (il fronte)
      if(l==='cf'&&im.length>1&&!r.txt&&!r.salta)r=await gemCall(body(im.slice(0,1)),l);
      if(r.salta)continue;g=r;if(r.txt||!GEM_RETRY.test(String(r.st)))break;
      // v96: motivo vero del passaggio al lettore dopo (domanda #108: «perché Lite?»), nel foglio e nella scatola nera
      f.lg.push({l,st:r.st,sec:Math.round((Date.now()-f.ta)/1000)});errLog('Vino: '+gemNome(l)+' non ha letto (errore '+(r.st||'rete')+') '+String(r.msg||'').slice(0,160))}
    if(g.txt){f.lt=f.bl;vnTSalva(f.bl,Math.max(1,Math.round((Date.now()-f.ta)/1000)))}f.busy=false;f.bl='';
    // v107: lettura non riuscita → «Rileggila tu più tardi» (vnRiH); con au (nuovo tentativo da sola) niente avviso a ogni giro
    if(!g.txt){f.ko={foto:!!files};refreshSheet();if(!au)toast((g.err||'L\'IA non ha risposto.')+' Riprova.','warn');return false}
    f.ko=null;const r=vnLeggi(g.txt);if(!r){refreshSheet();toast(files?'Non riconosco il vino nella foto. Riprova con l\'etichetta ben dritta e nitida.':'Non trovo questo vino. Controlla il nome.','warn');return false}
    const dop=!f.id&&vnAll().find(v=>norm(v.n)===norm(r.n)&&norm(v.cant||'')===norm(r.cant||'')&&String(v.ann||'')===String(r.ann||''));
    if(dop){closeSheet();toast('Questo vino è già in cantina.');vnShow(dop.id);return true}
    if(files)vnFotoVia(f);vnUnisci(f,r);refreshSheet();return true}
  catch(e){f.busy=false;f.ko=e&&e.code==='img'?null:{foto:!!files};refreshSheet();if(!au||!f.ko)toast(e&&e.code==='img'?'La foto non si apre: prova a rifarla.':'Non riesco a contattare l\'IA. Controlla la connessione.','warn');return false}}
// v107 (idea #126 scelta da Mario): se l'IA non legge (Google pieno, niente rete) l'app riprova da sola ogni VN_RI_MS, al massimo VN_RI_MAX volte, finché la scheda è aperta; quando legge il telefono vibra
let VN_RI_MS=120000,VN_RI_MAX=5;
function vnRiTra(a){const s=Math.max(0,Math.ceil((a.next-Date.now())/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function vnRiH(f){const a=f.au,pl=(f.fotos||[]).length>1;
  if(!a)return`<div class="vn-ri"><p class="small">${ic('warn')} L'IA adesso non ha letto (succede quando Google ha troppo lavoro o manca la rete).${f.ko.foto?(pl?' Le foto restano qui.':' La foto resta qui.'):''}</p>${f.ko.foto&&(f.fotos||[]).length?`<button type="button" class="btn primary block" data-a="vnCoda">${ic('clock')} ${pl?'Leggile':'Leggila'} da sola: puoi chiudere l'app</button>`:''}<button type="button" class="btn ${f.ko.foto&&(f.fotos||[]).length?'ghost':'primary'} block" data-a="vnRiAuto">${ic('clock')} ${f.ko.foto?(pl?'Rileggile':'Rileggila'):'Riprova'} tu più tardi</button></div>`;
  return`<div class="vn-ri" role="status"><p class="small">${ic('clock')} Riprovo da sola tra <b id="vn-ri">${vnRiTra(a)}</b> · tentativo ${a.n+1} di ${VN_RI_MAX}. Tieni aperta questa scheda: quando l'IA ha letto, il telefono vibra.</p><div class="btns"><button type="button" class="btn ghost" data-a="vnRiOra">Riprova adesso</button><button type="button" class="btn ghost" data-a="vnRiStop">Smetti</button></div></div>`}
function vnRiAuto(){const f=S.vnf;if(!f||!f.ko)return;f.au={n:0,next:Date.now()+VN_RI_MS};refreshSheet();vnRiTick()}
function vnRiStop(){const f=S.vnf;if(f)f.au=null;clearInterval(vnRiTick.h);refreshSheet()}
function vnRiOra(){const f=S.vnf;if(f&&f.au&&!f.au.go&&!f.busy)vnRiProva(f)}
function vnRiTick(){clearInterval(vnRiTick.h);vnRiTick.h=setInterval(()=>{const f=S.vnf;if(!f||!f.au||f.chiusa||!f.ko){if(f)f.au=null;clearInterval(vnRiTick.h);return}
  const e=document.getElementById('vn-ri');if(e)e.textContent=vnRiTra(f.au);
  if(!f.busy&&!f.au.go&&Date.now()>=f.au.next&&navigator.onLine!==false)vnRiProva(f)},1000)}
async function vnRiProva(f){const a=f.au;a.go=true;a.n++;const files=f.ko.foto?(f.fotos||[]).map(x=>x.file):null;
  if(f.ko.foto&&!files.length){f.au=null;refreshSheet();return}
  const ok=await vnIaGo(files,true);a.go=false;if(f.au!==a)return;
  if(ok){f.au=null;try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}if(!f.chiusa)toast('Fatto: l\'IA ha letto il vino. Controlla la scheda e salva.');return}
  if(!f.ko||a.n>=VN_RI_MAX){f.au=null;if(f.ko)toast('L\'IA non ha letto neanche dopo '+a.n+' tentativi. Riprova più tardi.','warn');if(S.vnf===f)refreshSheet();return}
  a.next=Date.now()+VN_RI_MS;if(S.vnf===f)refreshSheet()}
// v119 (D57, Mario #139 «sì va bene se è la miglior soluzione intelligente»): le foto vanno nella coda di bolle e listini
// (codaVino in index.html): salvate, lette da sole anche ad app chiusa o da un altro telefono; il risultato torna qui con «Controlla e salva»
let vnCodaBusy=false;
async function vnCoda(){const f=S.vnf,me=realU();if(!f||!me||f.busy||vnCodaBusy)return;const fs=(f.fotos||[]).map(x=>x.file);if(!fs.length)return;
  vnCodaBusy=true;try{const mb=Math.floor(CODA_T.maxB/fs.length),b=[];for(const x of fs)b.push((await codaFoto(x,mb)).b64);
    await codaAdd({id:'vn'+uid(),tipo:'vino',foto:b[0],fx:b.slice(1),vid:f.id||'',creato:now(),da:me.id,daNome:fullName(me),st:'coda',n:0});
    f.au=null;f.ko=null;vnFotoVia(f);closeSheet();toast('Foto salvata: la leggo da sola, anche con l\'app chiusa. Ti avviso quando è pronta.')}
  catch(e){toast('Non riesco a salvare la foto: riprova.','warn')}finally{vnCodaBusy=false}}
// vini letti dalla coda (cloud «fatta» con il testo + copia del telefono), visibili a chi ha scattato e a chi modifica la cantina
function vnRisList(){const me=meU();if(!me)return[];const m={};
  for(const x of CODA.cloud)if(x.tipo==='vino'&&x.st==='fatta'&&x.txt)m[x.id]={id:x.id,txt:x.txt,l:x.l||'',vid:x.vid||'',da:x.da||'',daNome:x.daNome||'',letto:x.fatto||0};
  const via=new Set(CODA.cloud.filter(x=>x.tipo==='vino'&&x.st==='tolto').map(x=>x.id));
  for(const [id,x] of Object.entries(CODA.vini))if(!m[id]&&!via.has(id))m[id]=Object.assign({id},x);
  return Object.values(m).filter(x=>x.da===me.id||vnCan(me)).sort((a,b)=>(b.letto||0)-(a.letto||0))}
function vnRisH(){const me=meU();if(!me)return'';
  const att=CODA.list.filter(x=>x.tipo==='vino'&&(x.da===me.id||vnCan(me))),ris=vnRisList();if(!att.length&&!ris.length)return'';
  return`<div class="vn-ris">${att.map(x=>`<p class="vn-al small" role="status">${ic('clock')} ${x.busy?'Sto leggendo la foto di un vino…':navigator.onLine===false?'Foto di un vino salvata: la leggo appena torna la rete.':x.err?esc(x.err)+' Riprovo da sola.':'Foto di un vino salvata: la leggo tra poco.'}</p>`).join('')}
  ${ris.map(x=>{const v=vnLeggi(x.txt)||{};return`<div class="banner vn-rb" role="status"><div>${ic('sparkle')} Vino letto dalla foto: <b>${v.n?vnTit(v):'vino'}</b>${x.daNome?` · foto di ${esc(x.daNome)}`:''}</div><div class="btns"><button type="button" class="btn primary sm" data-a="vnRisApri" data-v="${esc(x.id)}">Controlla e salva</button><button type="button" class="btn ghost sm" data-a="vnRisVia" data-v="${esc(x.id)}" aria-label="Togli">${ic('x')}</button></div></div>`}).join('')}</div>`}
function vnRisApri(id){const x=vnRisList().find(y=>y.id===id);if(!x)return;const r=vnLeggi(x.txt);if(!r){vnRisVia(id);return}
  const base=x.vid&&vnGet(x.vid);
  if(!base){const dop=vnAll().find(v=>norm(v.n)===norm(r.n)&&norm(v.cant||'')===norm(r.cant||'')&&String(v.ann||'')===String(r.ann||''));
    if(dop){vnRisVia(id);toast('Questo vino è già in cantina.');vnShow(dop.id);return}}
  vnForm(base||null);const f=S.vnf;vnUnisci(f,r);f.lt=x.l;f.ris=id;refreshSheet()}
function vnRisVia(id){if(CODA.vini[id]){delete CODA.vini[id];codaViniSalva()}if(codaCloud())codaCol().doc(id).update({st:'tolto'}).catch(()=>{});refreshSheet()}
// D44: fino a VN_FMAX foto della stessa bottiglia (fronte, retro…), lette insieme con «Leggi con l'IA»
const VN_FMAX=3;
function vnFoto(nuovo,gal){if(!gemOn())return toast('Per leggere le foto serve l\'IA del ristorante (Gemini): chiedi allo sviluppatore. Intanto scrivi il nome.','warn');
  S.vnCam=true;if(nuovo)vnBozzaVia();vnBozza(true,!nuovo);
  pickFile(gal?{accept:'image/*',multiple:true}:{accept:'image/*',capture:'environment'},fs=>{S.vnCam=false;if(nuovo)vnForm(null);vnFotoAdd(fs)})}
// v96 (D45): ogni foto diventa subito piccola (≤2000 px per l'IA + miniatura): l'originale da 12-48 MP non resta nella pagina
const VN_PIC=new WeakSet();
async function vnFotoAdd(fs){const f=S.vnf;if(!f)return;f.fotos=f.fotos||[];f.ld=true;refreshSheet();
  for(const x of fs){if(f.fotos.length>=VN_FMAX){toast('Bastano '+VN_FMAX+' foto per una bottiglia.','warn');break}
    try{const r=await fotoPiccola(x,2000,240);VN_PIC.add(r.b);f.fotos.push({file:r.b,url:r.mini})}catch(e){toast('La foto non si apre: prova a rifarla.','warn')}}
  f.ld=false;if(S.vnf===f){vnBozza(false);vnBozzaFoto(f)}refreshSheet()}
function vnFotoDel(i){const f=S.vnf;if(f&&f.fotos&&f.fotos.splice(+i,1)[0])vnBozzaFoto(f);refreshSheet()}
function vnFotoVia(f){f.fotos=[];vnBozzaFoto(f)}
// v96 (D45): bozza del vino se il telefono chiude l'app (fotocamera aperta o app in secondo piano), come jona_reg della registrazione.
// Campi in localStorage jona_vn {f,t,cam,u}; foto piccole in IndexedDB (jona-kv, vn_fotos). Chiudere il foglio la cancella.
// idbKv (IndexedDB jona-kv) sta in index.html dalla v114 (la usa anche la coda delle bolle)
const VN_IDB=()=>(DEMO?'demo:':'')+'vn_fotos';
function vnBozza(cam,conF){const me=realU();if(!me)return;const f=conF===false?null:S.vnf;if(f&&f.chiusa)return;let c=null;
  if(f){c={};for(const [k,x] of Object.entries(f))if(!['fotos','busy','bl','rip','chiusa','ld','lg','lt'].includes(k))c[k]=x}
  ls('jona_vn',{f:c,t:Date.now(),cam:!!cam,u:me.id})}
function vnBozzaFoto(f){if(f.chiusa)return;const a=(f.fotos||[]).slice();
  Promise.all(a.map(x=>x.file.arrayBuffer().then(b=>({a:b,m:x.url})))).then(v=>idbKv(VN_IDB(),v.length?v:null)).catch(()=>{})}
function vnBozzaVia(){ls('jona_vn',null);idbKv(VN_IDB(),null)}
async function vnRipristina(){const d=ls('jona_vn');if(!d)return;if(!(Date.now()-d.t<=1800000)){vnBozzaVia();return}
  const t0=Date.now();while(S.splash||!allLoaded()||!meU()){if(Date.now()-t0>20000)return;await new Promise(r=>setTimeout(r,300))}
  const me=realU();if(!me||me.id!==d.u||!funzOn('cantina')||!vnCan(meU())){vnBozzaVia();return}
  const ft=await idbKv(VN_IDB()),fotos=(Array.isArray(ft)?ft:[]).map(x=>{const b=new File([x.a],'foto.jpg',{type:'image/jpeg'});VN_PIC.add(b);return{file:b,url:x.m}});
  if(!d.cam&&!fotos.length&&!(d.f&&String(d.f.n||'').trim())){vnBozzaVia();return}
  vnForm(null);Object.assign(S.vnf,d.f||{});S.vnf.fotos=fotos;S.vnf.rip=d.cam?'cam':'si';vnBozza(false);refreshSheet()}
function vnFotoH(f){const n=f.fotos.length;if(f.ld&&!n)return`<div class="vn-busy">${ic('clock')} <span>Preparo la foto…</span></div>`;
  return`<div class="vn-fotos"><p class="muted small" style="margin:0 0 8px">${n===1?'Fronte pronto. Se dietro c\'è un\'altra etichetta, fotografa anche il retro: l\'IA legge tutte e due.':n+' foto della stessa bottiglia: l\'IA le legge insieme.'}</p>
  <div class="vn-ft">${f.fotos.map((x,i)=>`<div class="vn-fi"><img src="${x.url}" alt="Foto ${i+1}"><span>${i===0?'Fronte':i===1?'Retro':'Foto '+(i+1)}</span><button type="button" class="vn-fx" data-a="vnFotoDel" data-v="${i}" aria-label="Togli la foto ${i+1}">${ic('x')}</button></div>`).join('')}</div>
  ${n<VN_FMAX?`<div class="btns vn-add"><button type="button" class="btn ghost" data-a="vnFotoF">${ic('camera')} ${n===1?'Fotografa il retro':'Un\'altra foto'}</button><button type="button" class="btn ghost" data-a="vnFotoG">${ic('image')} Galleria</button></div>`:''}
  <button type="button" class="btn primary block big" data-a="vnFotoGo" style="margin-top:8px">${ic('sparkle')} Leggi ${n===1?'la foto':'le '+n+' foto'} con l'IA</button></div>`}
async function vnSave(){const f=S.vnf,me=realU();if(!f||!me)return;const n=f.n.trim();if(!n){toast('Scrivi il nome del vino','err');return}
  const nn=x=>num(x)>0?num(x):null,old=f.id&&vnGet(f.id);
  const v={id:f.id||uid(),n,cant:f.cant.trim(),ann:String(f.ann||'').trim(),gr:nn(f.gr),tipo:VN_TIPI[f.tipo]?f.tipo:'rosso',den:f.den.trim(),vit:f.vit.trim(),abb:f.abb.slice(),pv:nn(f.pv),pc:isMgr(meU())?nn(f.pc):(old&&old.pc)||null,
    q:Math.max(0,Math.round(num(f.q)||0)),min:Math.max(0,Math.round(num(f.min)||0)),ia:f.ia||'',da:f.da||me.id,cr:f.cr||now(),mod:now()};
  for(const [k] of VN_CAMPI)v[k]=String(f[k]||'').trim();v.frase=String(f.frase||'').trim();v.parole=String(f.parole||'').trim();
  await vnPut(v);if(f.ris)vnRisVia(f.ris);closeSheet();toast('Vino salvato');if(!f.id)vnShow(v.id)}
async function vnDel(){const f=S.vnf;if(!f||!f.id)return closeSheet();
  if(!await ask('Eliminare il vino?','«'+f.n+'» sparisce dalla cantina.','Elimina',true))return;
  await upd('config','cantina',{['v.'+f.id]:null});closeSheet();closeSheet();toast('Vino eliminato')}
async function vnConta(id){const v=vnGet(id);if(!v)return;const r=await ask('Quante bottiglie ci sono?','Conta le bottiglie di «'+v.n+'» e scrivi il numero giusto.','Salva',false,{label:'Bottiglie in casa',value:String(+v.q||0)});
  if(!r||!String(r.v).trim())return;const n=Math.round(num(r.v));if(!(n>=0))return toast('Scrivi un numero.','warn');await vnMov(id,'conta',n)}
