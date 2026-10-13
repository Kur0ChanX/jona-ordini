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
  const add=can?`<div class="btns vn-add"><button type="button" class="btn primary big" data-a="vnFoto">${ic('camera')} Fotografa una bottiglia</button><button type="button" class="btn ghost" data-a="vnNew">${ic('plus')} Scrivi il nome</button></div>`:'';
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
  const q=norm(V.q),l=all.filter(v=>(!V.tipo||v.tipo===V.tipo)&&(!V.casa||(+v.q||0)>0)&&(!q||norm([v.n,v.cant,v.den,v.vit,v.ann].join(' ')).includes(q)));
  return head+add+`<div class="search rc-cerca">${ic('search')}<input id="vnq" type="search" placeholder="Cerca vino, cantina o vitigno" value="${esc(V.q)}" data-in="vnq" autocomplete="off"></div>
  <div class="chips">${[['','Tutti']].concat(Object.entries(VN_TIPI)).map(([k,t])=>`<button type="button" class="chip" aria-pressed="${V.tipo===k}" data-a="vnTipo" data-v="${k}">${t}</button>`).join('')}<button type="button" class="chip" aria-pressed="${V.casa}" data-a="vnCasa">Solo in casa</button></div>
  <div>${l.length?l.map(v=>vnRow(v,ven[v.id])).join(''):`<p class="muted">${all.length?'Nessun vino trovato.'+(V.casa?' Togli «Solo in casa» per vedere anche quelli finiti.':''):can?'La cantina è vuota. Tocca «Fotografa una bottiglia»: l\'IA scrive la scheda del vino, tu controlli e salvi.':'La cantina è vuota: i vini li aggiunge il responsabile.'}</p>`}</div>`}
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
const VN_TSOLITO={flash:20,lite:12,cf:30};
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
async function vnIaGo(files){const f=S.vnf;if(!f||f.busy)return;const nome=[f.n,f.cant,f.ann].map(x=>String(x||'').trim()).filter(Boolean).join(' ');
  if(!files&&!nome)return toast('Scrivi prima il nome del vino (e la cantina).','warn');
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
    if(!g.txt){refreshSheet();return toast((g.err||'L\'IA non ha risposto.')+' Riprova.','warn')}
    const r=vnLeggi(g.txt);if(!r){refreshSheet();return toast(files?'Non riconosco il vino nella foto. Riprova con l\'etichetta ben dritta e nitida.':'Non trovo questo vino. Controlla il nome.','warn')}
    const dop=!f.id&&vnAll().find(v=>norm(v.n)===norm(r.n)&&norm(v.cant||'')===norm(r.cant||'')&&String(v.ann||'')===String(r.ann||''));
    if(dop){closeSheet();toast('Questo vino è già in cantina.');return vnShow(dop.id)}
    if(files)vnFotoVia(f);vnUnisci(f,r);refreshSheet()}
  catch(e){f.busy=false;refreshSheet();toast(e&&e.code==='img'?'La foto non si apre: prova a rifarla.':'Non riesco a contattare l\'IA. Controlla la connessione.','warn')}}
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
function idbKv(k,v){return new Promise(res=>{try{const r=indexedDB.open('jona-kv',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onerror=()=>res(null);
  r.onsuccess=()=>{const db=r.result;try{const t=db.transaction('kv',v===undefined?'readonly':'readwrite'),s=t.objectStore('kv'),q=v===undefined?s.get(k):v===null?s.delete(k):s.put(v,k);
    t.oncomplete=()=>{db.close();res(v===undefined?q.result:true)};t.onerror=t.onabort=()=>{db.close();res(null)}}catch(e){db.close();res(null)}}}catch(e){res(null)}})}
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
  await vnPut(v);closeSheet();toast('Vino salvato');if(!f.id)vnShow(v.id)}
async function vnDel(){const f=S.vnf;if(!f||!f.id)return closeSheet();
  if(!await ask('Eliminare il vino?','«'+f.n+'» sparisce dalla cantina.','Elimina',true))return;
  await upd('config','cantina',{['v.'+f.id]:null});closeSheet();closeSheet();toast('Vino eliminato')}
async function vnConta(id){const v=vnGet(id);if(!v)return;const r=await ask('Quante bottiglie ci sono?','Conta le bottiglie di «'+v.n+'» e scrivi il numero giusto.','Salva',false,{label:'Bottiglie in casa',value:String(+v.q||0)});
  if(!r||!String(r.v).trim())return;const n=Math.round(num(r.v));if(!(n>=0))return toast('Scrivi un numero.','warn');await vnMov(id,'conta',n)}
