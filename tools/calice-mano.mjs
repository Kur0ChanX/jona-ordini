// Calice da rosso disegnato a mano: tratti d'inchiostro a spessore variabile + acquerello
// Uso: node tools/calice-mano.mjs <cartella> → <cartella>/mano.json (tratti, coppa, VN_CALW) da copiare in VN_CAL di moduli/cantina.js
import fs from 'fs';
const S=process.argv[2];
let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const f=n=>+n.toFixed(1);
// rumore liscio 1D
function noise(n){const k=[...Array(8)].map(()=>rnd()*2-1);return t=>{const x=t*7,i=Math.floor(x),u=x-i,s=u*u*(3-2*u);return k[i%8]*(1-s)+k[(i+1)%8]*s}}
const bez=(p,t)=>{const u=1-t;return[u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]]};
function campiona(segs,n=18){const pts=[];segs.forEach((s,j)=>{for(let i=j?1:0;i<=n;i++)pts.push(bez(s,i/n))});return pts}
// tratto: polilinea → forma piena con spessore che cresce e cala, mano un po' tremante
function tratto(pts,w,{a=.3,b=.7,trem=.25,inizio=.25,fine=.15}={}){const N=noise(),M=noise(),L=[],R=[];const n=pts.length;
  for(let i=0;i<n;i++){const t=i/(n-1),p=pts[i],q=pts[Math.min(n-1,i+1)],o=pts[Math.max(0,i-1)];let dx=q[0]-o[0],dy=q[1]-o[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const prof=Math.min(1,t/inizio,(1-t)/fine);const ww=w*(a+b*Math.sqrt(Math.max(0,prof)))*(1+.22*M(t));const j=trem*N(t);
    const cx=p[0]-dy*j,cy=p[1]+dx*j;L.push([cx-dy*ww/2,cy+dx*ww/2]);R.push([cx+dy*ww/2,cy-dx*ww/2])}
  const all=L.concat(R.reverse());return 'M'+all.map(p=>f(p[0])+' '+f(p[1])).join('L')+'Z'}
const X=60;
// calice: bocca y 26 (mezza 21), pancia max 33 a y 78, fondo y 116; gambo fino a 178; piede mezza 29 a y 184
const sinistra=[[[39,26],[33,48],[26.5,60],[27,80]],[[27,80],[27.5,100],[42,115.5],[60,116]]];
const mir=s=>s.map(seg=>seg.map(([x,y])=>[2*X-x,y]));
const destra=mir(sinistra);
const bowlD='M39 26C33 48 26.5 60 27 80C27.5 100 42 115.5 60 116C78 115.5 92.5 100 93 80C93.5 60 87 48 81 26Z';
// mezze larghezze della coppa ogni 4 da 44 a 116
const ps=campiona(sinistra,400),W=[];for(let y=44;y<=116;y+=4){let b=ps[0];for(const p of ps)if(Math.abs(p[1]-y)<Math.abs(b[1]-y))b=p;W.push(f(X-b[0]))}
const ellisse=(cx,cy,rx,ry,a0,a1,n=50)=>[...Array(n+1)].map((_,i)=>{const a=a0+(a1-a0)*i/n;return[cx+rx*Math.cos(a),cy+ry*Math.sin(a)]});
const ink=[];
// lati della coppa (il destro parte un filo sopra la bocca: tratto di mano)
ink.push(tratto(campiona(sinistra).map(([x,y],i)=>[x,y-(i<3?.6:0)]),1.7,{fine:.08}));
ink.push(tratto(campiona(destra),1.5,{fine:.1,inizio:.15}));
// bocca: davanti più forte, dietro leggero e non chiuso
ink.push(tratto(ellisse(60,26,21.3,3.4,Math.PI*1.01,-Math.PI*.01,26),1.2,{a:.25,b:.75}));
ink.push(tratto(ellisse(60,26,21,3.2,Math.PI*1.08,Math.PI*1.92,18),.55,{a:.2,b:.8}));
// gambo: due linee sottili che si aprono nella coppa e nel piede
const gs=[[[57.2,117],[58.6,121],[58.7,124],[58.7,130]],[[58.7,130],[58.7,150],[58.6,165],[58.4,173]],[[58.4,173],[58.2,178],[52,181.5],[33,184]]];
ink.push(tratto(campiona(gs),1.1,{a:.4,b:.6,fine:.05}));
ink.push(tratto(campiona(mir(gs)),1.0,{a:.4,b:.6,fine:.08}));
// piede: davanti, spessore del vetro, dietro leggero
ink.push(tratto(ellisse(60,184,28.5,4.2,Math.PI,0,28),1.4,{a:.3,b:.7}));
ink.push(tratto(ellisse(60,184.9,28,4.3,Math.PI*.96,Math.PI*.04,22),.6,{a:.2,b:.8}));
ink.push(tratto(ellisse(60,184,28.3,4,Math.PI*1.1,Math.PI*1.9,18),.45,{a:.2,b:.8}));
// ombreggiatura a tratteggio sul lato destro della coppa (vetro)
const tr=[];for(let i=0;i<5;i++){const y=50+i*7;tr.push(tratto([[86-i*.4,y],[88.5-i*.2,y+3.2]],.5,{a:.3,b:.7,trem:.05}))}
const hatch=tr.join(' ');
// superficie del vino (ellisse tremolante, centrata in 0)
const supP=n=>{const N=noise();return 'M'+ellisse(0,0,1,1,0,Math.PI*2,36).map(([x,y],i)=>{const k=1+.012*N(i/36);return f(x*33*k)+' '+f(y*6.2*k)}).join('L')+'Z'};
const SUP=supP(),SUPL=tratto(ellisse(0,0,32.6,6.1,Math.PI*.05,Math.PI*.95,18),.55,{a:.25,b:.75,trem:.1});
const out={inkD:ink.join(''),hatch,bowlD,W,SUP,SUPL};
fs.writeFileSync(S+'/mano.json',JSON.stringify(out));
console.log(JSON.stringify(W), out.inkD.length+hatch.length);
