import sys
P='/home/user/jona-ordini/tools/test-cantina.mjs'
s=open(P,encoding='utf-8').read()
def rep(a,b):
    global s
    if s.count(a)!=1: sys.exit('non unico: '+a[:60])
    s=s.replace(a,b)
rep("let gemReq=[];","let gemReq=[],gemUrl=[],gemFail='';")
rep("await ctx.route('https://generativelanguage.googleapis.com/**',async r=>{const body=JSON.parse(r.request().postData()||'{}');gemReq.push(body);\n",
    "await ctx.route('https://generativelanguage.googleapis.com/**',async r=>{const body=JSON.parse(r.request().postData()||'{}');gemReq.push(body);gemUrl.push(r.request().url());\n  if(gemFail&&r.request().url().includes('/'+gemFail+':'))return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'sovraccarico'}})});\n")
anchor="ok(/Questo vino è già in cantina/.test(await txt('body'))&&/Vermentino di Gallura 2023/.test(await txt('.sheet')),'stesso vino fotografato di nuovo: apre quello già in cantina');\nawait sc('[data-a=\"closeSheet\"]');await wait(300);\n"
rep(anchor, anchor+r"""// D44: fronte e retro della stessa bottiglia, letti insieme
const png=async(pg,w)=>pg.evaluate(async w=>{const c=document.createElement('canvas');c.width=w;c.height=60;c.getContext('2d').fillRect(0,0,10,10);const u=await new Promise(r=>c.toBlob(b=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)},'image/png'));return u.split(',')[1]},w);
const fimg=async(n,w)=>({name:n,mimeType:'image/png',buffer:Buffer.from(await png(pg,w),'base64')});
gemOut={nome:'Turriga',cantina:'Argiolas',annata:'2019',gradi:14.5,tipo:'rosso',denominazione:'Isola dei Nuraghi IGT',vitigni:'85% Cannonau, Carignano, Bovale',frase:'Il grande rosso sardo.',parole:'Potente · Mirto · Spezie',sicuro:true};
await pg.evaluate(()=>vnForm(null));await wait(300);
let fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoF"]')]))[0];
ok(await pg.evaluate(()=>{const p=document.querySelector('#picker');return p.getAttribute('capture')==='environment'&&!p.multiple}),'foto: apre la fotocamera');
await fc.setFiles([await fimg('fronte.png',40)]);await wait(400);
const reqN=gemReq.length;
t=await txt('.sheet');
ok(await pg.locator('.sheet .vn-fi img').count()===1&&/Fronte pronto/.test(t)&&/Fotografa il retro/.test(t)&&/Leggi la foto con l'IA/.test(t)&&gemReq.length===reqN,'D44: dopo la prima foto aspetta il retro, l\'IA non parte da sola');
fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoF"]')]))[0];await fc.setFiles([await fimg('retro.png',42)]);await wait(400);
t=await txt('.sheet');
ok(/Fronte/.test(t)&&/Retro/.test(t)&&/Leggi le 2 foto con l'IA/.test(t),'D44: due foto «Fronte» e «Retro»');
fc=(await Promise.all([pg.waitForEvent('filechooser'),sc('[data-a="vnFotoG"]')]))[0];
ok(await pg.evaluate(()=>{const p=document.querySelector('#picker');return !p.hasAttribute('capture')&&p.multiple}),'D44: «Galleria» sceglie più foto');
await fc.setFiles([await fimg('a.png',44),await fimg('b.png',46)]);await wait(400);
ok(await pg.locator('.sheet .vn-fi').count()===3&&/Bastano 3 foto/.test(await txt('body'))&&await pg.locator('.sheet [data-a="vnFotoF"]').count()===0,'D44: massimo 3 foto, poi niente più pulsanti per aggiungerne');
await sc('[data-a="vnFotoDel"][data-v="2"]');await wait(300);
ok(await pg.locator('.sheet .vn-fi').count()===2,'D44: la X toglie una foto');
gemFail='gemini-flash-latest';
await sc('[data-a="vnFotoGo"]');await wait(900);gemFail='';
const lastP=gemReq[gemReq.length-1].contents[0].parts;
ok(lastP.length===3&&lastP[1].inline_data&&lastP[2].inline_data&&/2 foto della stessa bottiglia/.test(lastP[0].text),'D44: le 2 foto vanno all\'IA nella stessa richiesta');
ok(gemUrl.slice(-2).map(u=>u.includes('/gemini-flash-latest:')?'flash':u.includes('/gemini-flash-lite-latest:')?'lite':'?').join()==='flash,lite','D44: Flash sovraccarico → legge Flash-Lite (stessi lettori dei listini)');
ok(await pg.inputValue('#vnf-n')==='Turriga'&&await pg.inputValue('#vnf-den')==='Isola dei Nuraghi IGT'&&await pg.locator('.sheet .vn-fi').count()===0,'D44: scheda riempita, riquadro delle foto chiuso');
// Cloudflare con più foto che non risponde: riprova con il solo fronte
const cf=await pg.evaluate(async()=>{const vero=gemCall,log=[];
  gemCall=async(b,l)=>{const n=b.contents[0].parts.length-1;log.push(l+n);return l==='cf'?(n>1?{st:400,msg:'troppe immagini'}:{txt:'{"nome":"Prova CF","cantina":"X","sicuro":true}',lettore:'cf'}):{st:503}};
  try{vnForm(null);const c=document.createElement('canvas');c.width=30;c.height=30;const bl=await new Promise(r=>c.toBlob(r,'image/png'));
    await vnIaGo([new File([bl],'f.png',{type:'image/png'}),new File([bl],'r.png',{type:'image/png'})]);return{log:log.join(),n:S.vnf.n}}finally{gemCall=vero}});
ok(cf.log==='flash2,lite2,cf2,cf1'&&cf.n==='Prova CF','D44: Cloudflare non accetta 2 foto → riprova col fronte: '+cf.log);
await sc('[data-a="closeSheet"]');await wait(300);
""")
open(P,'w',encoding='utf-8').write(s);print('ok')
