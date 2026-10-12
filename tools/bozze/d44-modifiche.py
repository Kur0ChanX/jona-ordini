import sys
P='/home/user/jona-ordini/index.html'
s=open(P,encoding='utf-8').read()
def rep(a,b):
    global s
    n=s.count(a)
    if n!=1: sys.exit('trovato %d volte: %r'%(n,a[:80]))
    s=s.replace(a,b)

# prompt: più foto della stessa bottiglia
rep("function vnPrompt(nome){return'Sei un sommelier",
    "function vnPrompt(nome,n){return'Sei un sommelier")
rep("(nome?'Il vino è: '+nome+'. ':'Questa è la foto dell\\'etichetta (o della bottiglia) di un vino. ')",
    "(nome?'Il vino è: '+nome+'. ':n>1?'Queste sono '+n+' foto della stessa bottiglia di vino (fronte e retro): leggi le scritte di tutte e unisci le informazioni, usando le foto dell\\'etichetta. ':'Questa è la foto dell\\'etichetta (o della bottiglia) di un vino. ')")

# lettura con la catena dei lettori (come i listini)
rep("""  f.busy=true;refreshSheet();try{const parts=[{text:vnPrompt(files?'':nome)}];if(files)for(const x of files.slice(0,2))parts.push({inline_data:{mime_type:'image/jpeg',data:await b64(await shrinkImg(x))}});
    const g=await gemCall({contents:[{parts}],generationConfig:{temperature:0.2}});f.busy=false;
    if(!g.txt){""",
"""  f.busy=true;f.bl='';refreshSheet();try{const im=[];if(files)for(const x of files.slice(0,VN_FMAX))im.push({inline_data:{mime_type:'image/jpeg',data:await b64(await shrinkImg(x))}});
    const body=p=>({contents:[{parts:[{text:vnPrompt(files?'':nome,p.length)}].concat(p)}],generationConfig:{temperature:0.2}});
    // D44: stessi lettori dei listini (Flash → Flash-Lite → Cloudflare), tutte le foto nella stessa richiesta
    let g={};for(const [l] of GEM_LETT){f.bl=l;refreshSheet();let r=await gemCall(body(im),l);
      // Cloudflare (Llama 4) potrebbe non accettare più foto insieme: riprova con la sola prima foto (il fronte)
      if(l==='cf'&&im.length>1&&!r.txt&&!r.salta)r=await gemCall(body(im.slice(0,1)),l);
      if(r.salta)continue;g=r;if(r.txt||!GEM_RETRY.test(String(r.st)))break}
    f.busy=false;f.bl='';
    if(!g.txt){""")
rep("    vnUnisci(f,r);refreshSheet()}\n",
    "    if(files)vnFotoVia(f);vnUnisci(f,r);refreshSheet()}\n")
rep("""function vnFoto(nuovo){if(!gemOn())return toast('Per leggere le foto serve l\\'IA del ristorante (Gemini): chiedi allo sviluppatore. Intanto scrivi il nome.','warn');
  pickFile({accept:'image/*',capture:'environment'},fs=>{if(nuovo)vnForm(null);vnIaGo(fs)})}""",
"""// D44: fino a VN_FMAX foto della stessa bottiglia (fronte, retro…), lette insieme con «Leggi con l'IA»
const VN_FMAX=3;
function vnFoto(nuovo,gal){if(!gemOn())return toast('Per leggere le foto serve l\\'IA del ristorante (Gemini): chiedi allo sviluppatore. Intanto scrivi il nome.','warn');
  pickFile(gal?{accept:'image/*',multiple:true}:{accept:'image/*',capture:'environment'},fs=>{if(nuovo)vnForm(null);vnFotoAdd(fs)})}
function vnFotoAdd(fs){const f=S.vnf;if(!f)return;f.fotos=f.fotos||[];
  for(const x of fs){if(f.fotos.length>=VN_FMAX){toast('Bastano '+VN_FMAX+' foto per una bottiglia.','warn');break}f.fotos.push({file:x,url:URL.createObjectURL(x)})}refreshSheet()}
function vnFotoDel(i){const f=S.vnf,x=f&&f.fotos&&f.fotos.splice(+i,1)[0];if(x)URL.revokeObjectURL(x.url);refreshSheet()}
function vnFotoVia(f){for(const x of f.fotos||[])URL.revokeObjectURL(x.url);f.fotos=[]}
function vnFotoH(f){const n=f.fotos.length;
  return`<div class="vn-fotos"><p class="muted small" style="margin:0 0 8px">${n===1?'Fronte pronto. Se dietro c\\'è un\\'altra etichetta, fotografa anche il retro: l\\'IA legge tutte e due.':n+' foto della stessa bottiglia: l\\'IA le legge insieme.'}</p>
  <div class="vn-ft">${f.fotos.map((x,i)=>`<div class="vn-fi"><img src="${x.url}" alt="Foto ${i+1}"><span>${i===0?'Fronte':i===1?'Retro':'Foto '+(i+1)}</span><button type="button" class="vn-fx" data-a="vnFotoDel" data-v="${i}" aria-label="Togli la foto ${i+1}">${ic('x')}</button></div>`).join('')}</div>
  ${n<VN_FMAX?`<div class="btns vn-add"><button type="button" class="btn ghost" data-a="vnFotoF">${ic('camera')} ${n===1?'Fotografa il retro':'Un\\'altra foto'}</button><button type="button" class="btn ghost" data-a="vnFotoG">${ic('image')} Galleria</button></div>`:''}
  <button type="button" class="btn primary block big" data-a="vnFotoGo" style="margin-top:8px">${ic('sparkle')} Leggi ${n===1?'la foto':'le '+n+' foto'} con l'IA</button></div>`}""")

# modulo: riquadro delle foto e lettore dal vivo
rep("""${f.busy?`<div class="vn-busy">${ic('clock')} L'IA sta scrivendo la scheda del vino…</div>`:`<div class="btns vn-add">""",
    """${f.busy?`<div class="vn-busy">${ic('clock')} <span>L'IA sta ${(f.fotos||[]).length?'leggendo le foto':'scrivendo la scheda del vino'}…${f.bl?` <span class="muted small">(${esc(gemNome(f.bl))})</span>`:''}</span></div>`:(f.fotos||[]).length?vnFotoH(f):`<div class="btns vn-add">""")

# azioni
rep("vnFotoF:()=>vnFoto(false),",
    "vnFotoF:()=>vnFoto(false),vnFotoG:()=>vnFoto(false,true),vnFotoDel:d=>vnFotoDel(d.v),vnFotoGo:()=>{const f=S.vnf;if(f&&f.fotos&&f.fotos.length)vnIaGo(f.fotos.map(x=>x.file))},")

# stile
rep(".vn-busy{display:flex;gap:8px;align-items:center;padding:12px;border-radius:12px;background:var(--sunk);margin:0 0 8px}",
    ".vn-busy{display:flex;gap:8px;align-items:center;padding:12px;border-radius:12px;background:var(--sunk);margin:0 0 8px}\n.vn-fotos{padding:12px;border-radius:12px;background:var(--sunk);margin:0 0 8px}.vn-ft{display:flex;gap:8px;margin:0 0 10px;flex-wrap:wrap}.vn-fi{position:relative;width:84px;text-align:center;font-size:13px}.vn-fi img{width:84px;height:112px;object-fit:cover;border-radius:10px;display:block;margin:0 0 4px}.vn-fx{position:absolute;top:4px;right:4px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;display:grid;place-items:center;padding:0}.vn-fx svg{width:16px;height:16px}")

# versione
rep("const APP_VER=92;","const APP_VER=93;")
rep("const NEWS=[\n","const NEWS=[\n  {v:93,data:'2026-10-12',titolo:'Cantina: fronte e retro della bottiglia',\n    tutti:['Fotografando un vino ora puoi aggiungere anche il retro dell\\'etichetta (fino a 3 foto): l\\'IA le legge insieme e la scheda viene più precisa.','Ogni foto si può togliere prima di leggere; c\\'è anche «Galleria» per le foto già fatte.'],\n    dev:['D44: `vnFotoAdd`/`vnFotoH` (riquadro con le miniature, `VN_FMAX` 3, «Leggi con l\\'IA» `vnFotoGo`), `vnIaGo` usa i lettori `GEM_LETT` come i listini (tutte le foto in una richiesta; Cloudflare riprova con la sola prima foto), lettore dal vivo nel riquadro «L\\'IA sta…». Prova in `tools/test-cantina.mjs`.']},\n")
open(P,'w',encoding='utf-8').write(s)
print('ok')
