// v76 (D23): import di più fatture XML insieme e dei file firmati .p7m (busta CAdES).
// File in tools/fatture-prova: firmati con openssl e un certificato finto (DER, BER «-stream» a pezzi, base64), uno in ISO-8859-1, uno rotto.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const pg=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const DB={staff:{chef:{nome:'Chef',cognome:'Prova',username:'chef',ruolo:'gm',stato:'attivo'}},
  fornitori:{met:{nome:'Metro Italia'},pes:{nome:'Pescheria Sarda',categoria:'Pesce'}},prodotti:{}};
await pg.goto('http://localhost:8765/manifest.webmanifest');
await pg.evaluate(D=>{localStorage.clear();localStorage.setItem('jona_db_v2',JSON.stringify(D));localStorage.setItem('jona_me',JSON.stringify('chef'))},DB);
await pg.goto('http://localhost:8765/index.html');
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef'&&typeof impRun==='function',null,{timeout:10000});
await pg.waitForTimeout(500);
const F=n=>({n,d:[...readFileSync(new URL('fatture-prova/'+n,import.meta.url))]});
const run=async(names)=>{await pg.evaluate(async fs=>{closeSheet(true);S.rev=null;impSheet('');
    await impRun('xml',fs.map(f=>new File([new Uint8Array(f.d)],f.n)))},names.map(F));await pg.waitForTimeout(300);
  return pg.evaluate(()=>({rev:S.rev?{fonte:S.rev.fonte,it:S.rev.items.map(i=>({f:i.fid,c:i.codice,n:i.nome,u:i.unita,p:i.prezzo}))}:null,err:S.imp?S.imp.err:'',toast:(document.querySelector('.toast')||{}).textContent||''}))};
// p7m in DER: stesso risultato del suo XML
let x=await run(['metro.xml']),y=await run(['metro.xml.p7m']);
ok(x.rev&&x.rev.it.length===3,'XML normale: 3 righe');
ok(y.rev&&JSON.stringify(y.rev.it)===JSON.stringify(x.rev.it),'p7m (DER) uguale al suo XML');
ok(y.rev&&y.rev.it[0].n.startsWith('CAFFÈ')&&y.rev.it[0].f==='met'&&y.rev.it[0].c==='A000'&&y.rev.it[0].u==='kg'&&y.rev.it[0].p===1.5,'riga letta: '+JSON.stringify(y.rev&&y.rev.it[0]));
y=await run(['metro-base64.xml.p7m']);
ok(y.rev&&JSON.stringify(y.rev.it)===JSON.stringify(x.rev.it),'p7m in base64 uguale al suo XML');
// BER a lunghezza indefinita, testo spezzato in pezzi da 1000 byte, ISO-8859-1
y=await run(['pescheria-ber.xml.p7m']);
ok(y.rev&&y.rev.it.length===40&&y.rev.it.every(i=>i.f==='pes'&&/^(CAFFÈ|PRODOTTO) RIGA \d+ x{60}$/.test(i.n)),'p7m BER a pezzi: 40 righe intere ('+(y.rev&&y.rev.it.length)+')');
ok(y.rev&&y.rev.it[0].n.startsWith('CAFFÈ'),'accento giusto (ISO-8859-1) dal p7m');
y=await run(['pescheria-latin1.xml']);
ok(y.rev&&y.rev.it[0].n.startsWith('CAFFÈ'),'accento giusto in un XML ISO-8859-1: '+(y.rev&&y.rev.it[0].n.slice(0,6)));
// più fatture insieme, fornitori diversi
y=await run(['metro.xml.p7m','pescheria-ber.xml.p7m']);
ok(y.rev&&y.rev.it.length===43&&y.rev.fonte==='2 fatture XML','2 fatture insieme: 43 righe, «2 fatture XML»');
ok(y.rev&&y.rev.it.filter(i=>i.f==='met').length===3&&y.rev.it.filter(i=>i.f==='pes').length===40,'ogni riga col suo fornitore');
// un file rotto in mezzo: gli altri si leggono e c'è l'avviso
y=await run(['metro.xml','rotto.xml.p7m']);
ok(y.rev&&y.rev.it.length===3&&y.rev.fonte==='Fattura XML','file rotto saltato, l\'altro letto');
ok(/rotto\.xml\.p7m/.test(y.toast),'avviso col nome del file rotto: '+y.toast);
// solo un file rotto: messaggio chiaro
y=await run(['rotto.xml.p7m']);
ok(!y.rev&&/firmato \.p7m/.test(y.err),'solo p7m rotto: messaggio «firmato .p7m»: '+y.err);
ok(await pg.evaluate(()=>PICK.xml.multiple===true),'scelta di più file attiva');
ok(errs.length===0,'nessun errore della pagina: '+errs.join(' | '));
await b.close();
