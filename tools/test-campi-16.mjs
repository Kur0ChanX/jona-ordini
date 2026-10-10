import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
// v72: su iPhone Safari ingrandisce la pagina se un campo ha il testo sotto 16 px.
// Prende ogni combinazione di classi usata su input/select/textarea in index.html, crea il campo nella pagina vera
// (vista normale e vista staff) e controlla che il testo sia almeno 16 px. Tocca anche i campi dentro le schede che test-giro non apre.
const BASE='http://localhost:8765/';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const combos=new Set();
for(const m of src.matchAll(/<(input|select|textarea)\b([^>]*)>/g)){
  const tag=m[1],at=m[2],ty=(at.match(/\btype="([a-z]+)"/)||[])[1]||'';
  if(/^(checkbox|radio|range|file|hidden|color|button|submit)$/.test(ty))continue;
  const cl=((at.match(/\bclass="([^"]*)"/)||[])[1]||'').replace(/\$\{[^}]*\}/g,' ').trim().split(/\s+/).filter(Boolean).sort().join(' ');
  combos.add(tag+'|'+cl);
}
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const bad=[];const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad.push(m)};
const c=await b.newContext({viewport:{width:390,height:740}});
await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const p=await c.newPage();
await p.goto(BASE+'index.html');await p.waitForSelector('body');
ok(combos.size>=5,`trovate ${combos.size} combinazioni di classi sui campi`);
for(const staff of [false,true]){
  const r=await p.evaluate(([L,staff])=>{
    document.documentElement.classList.toggle('staff-ui',staff);
    const box=document.createElement('div');(document.querySelector('main')||document.body).appendChild(box);
    const out=L.map(x=>{const [tag,cl]=x.split('|');const e=document.createElement(tag);if(cl)e.className=cl;box.appendChild(e);return [x,parseFloat(getComputedStyle(e).fontSize)]});
    box.remove();return out},[[...combos],staff]);
  const small=r.filter(([,f])=>f<16);
  ok(!small.length,`${staff?'vista staff':'vista normale'}: tutti i campi a 16 px o più${small.length?' — sotto: '+small.map(([x,f])=>x+' '+f+'px').join(', '):''}`);
}
await b.close();
console.log(bad.length?`FAIL ${bad.length} problemi`:'PASS tutto ok');if(bad.length)process.exitCode=1;
