import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// v71: logo JONA vettoriale (media/jona.svg, dentro index.html come maschera SVG): nitido anche ingrandito nell'apertura
// e uguale al disegno di prima (maschera PNG 480x384 salvata in docs/img/logo/jona/jona-maschera-480.png).
const URL='http://localhost:8765/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const bad=[];const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad.push(m)};
const c=await b.newContext({viewport:{width:390,height:740}});
await c.route('**/firebase-config.js',r=>r.fulfill({contentType:'application/javascript',body:'self.JONA_FIREBASE=null'}));
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL+'index.html');await p.waitForSelector('.logo-full');
const m=await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('.logo-full'));return (s.webkitMaskImage||s.maskImage||'').slice(0,60)});
ok(m.includes('data:image/svg+xml')&&!m.includes('image/png'),`la maschera del logo è vettoriale (SVG), non più PNG: ${m}`);
// confronto del disegno: SVG e PNG disegnati sulla stessa tela (4 volte più grande)
const r=await p.evaluate(async U=>{
  const svgTxt=await (await fetch(U+'media/jona.svg')).text();
  const inPage=getComputedStyle(document.querySelector('.logo-full')).webkitMaskImage;
  const load=src=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=src});
  const W=1920,H=1536,alpha=async src=>{const i=await load(src);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.drawImage(i,0,0,W,H);const d=x.getImageData(0,0,W,H).data;const a=new Float32Array(W*H);for(let k=0;k<W*H;k++)a[k]=d[k*4+3]/255;return a};
  const S=await alpha('data:image/svg+xml,'+encodeURIComponent(svgTxt)),P=await alpha(U+'docs/img/logo/jona/jona-maschera-480.png');
  const near=(A,B,R)=>{let tot=0,hit=0;for(let y=R;y<H-R;y+=2)for(let x=R;x<W-R;x+=2){if(A[y*W+x]<.5)continue;tot++;let f=false;for(let dy=-R;dy<=R&&!f;dy+=2)for(let dx=-R;dx<=R;dx+=2)if(B[(y+dy)*W+x+dx]>.3){f=true;break}if(f)hit++}return hit/tot};
  const soft=A=>{let s=0,n=0;for(const v of A){if(v>.02){n++;if(v<.98)s++}}return s/n};
  return{svgPng:near(S,P,8),pngSvg:near(P,S,8),softS:soft(S),softP:soft(P),uguale:decodeURIComponent(inPage.slice(inPage.indexOf(',')+1,inPage.lastIndexOf('")')))===svgTxt.replace(/"/g,"'")}
},URL);
ok(r.svgPng>.99,`ogni tratto del logo nuovo sta sul disegno di prima (${(r.svgPng*100).toFixed(2)}%)`);
ok(r.pngSvg>.99,`nessun pezzo del disegno di prima manca nel logo nuovo (${(r.pngSvg*100).toFixed(2)}%)`);
ok(r.softS<r.softP*0.5,`ingrandito 4 volte il logo nuovo ha bordi netti: bordo sfocato ${(r.softS*100).toFixed(1)}% contro ${(r.softP*100).toFixed(1)}% di prima`);
ok(r.uguale,'il logo dentro index.html è lo stesso di media/jona.svg');
ok(!errs.length,`errori ${errs}`);
await b.close();if(bad.length){console.log('FALLITE: '+bad.length);process.exit(1)}
