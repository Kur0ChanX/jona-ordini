// v64: nell'import dei listini le righe uguali in tutto (tra loro o a un prodotto già a listino) non si caricano due volte;
// le righe simili (stesso prodotto, qualcosa cambia) restano senza spunta e, se spuntate, diventano prodotti separati.
// Due codici diversi con lo stesso nome non si sovrascrivono più.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const pg=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const P=(f,n,x={})=>Object.assign({fornitoreId:f,nome:n,codice:'',unita:'kg',prezzo:null,categoria:'Altro',aggiornato:1},x);
const DB={staff:{chef:{nome:'Chef',cognome:'Prova',username:'chef',ruolo:'gm',stato:'attivo'}},
  fornitori:{metro:{nome:'Metro'},mariano:{nome:'F.lli Mariano'}},
  prodotti:{
    e1:P('metro','Zucchero 1 kg',{codice:'M100',unita:'pz',prezzo:1.2,categoria:'Secco e dispensa'}),
    e2:P('metro','Farina 00',{codice:'F1',prezzo:0.9}),
    e3:P('mariano','Sale fino',{prezzo:0.4})}};
const TAB=`fornitore;codice;nome;unita;prezzo;categoria
Metro;M100;Zucchero 1 kg;pz;1,20;Secco e dispensa
Metro;O1;Olio EVO 1 l;pz;8,50;Secco e dispensa
Metro;O1;Olio EVO 1 l;pz;8,50;Secco e dispensa
Metro;O1;Olio EVO 1 l;pz;9,00;Secco e dispensa
Metro;F2;Farina 00;kg;1,10;
Metro;;Sale fino;kg;0,40;`;
await pg.goto('http://localhost:8765/manifest.webmanifest');
await pg.evaluate(D=>{localStorage.clear();localStorage.setItem('jona_db_v2',JSON.stringify(D));localStorage.setItem('jona_me',JSON.stringify('chef'))},DB);
await pg.goto('http://localhost:8765/index.html');
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef'&&typeof impRun==='function',null,{timeout:10000});
await pg.waitForTimeout(500);
await pg.evaluate(t=>{closeSheet(true);impSheet('metro');S.imp.txt=t;impRun('txt')},TAB);
await pg.waitForSelector('#rv-dup');
const sel=await pg.evaluate(()=>S.rev.items.map(i=>i.sel).join());
ok(sel==='false,true,false,false,true,true','spunte iniziali: uguale a listino, doppione e simile senza spunta ('+sel+')');
const ban=await pg.locator('#rv-dup').textContent();
ok(/1 riga uguale in tutto a un'altra/.test(ban)&&/1 riga uguale in tutto a un prodotto già a listino/.test(ban)&&/1 riga simile/.test(ban),'avviso dei doppi: '+ban.trim());
const st=await pg.locator('.rv .st').allTextContents();
ok(st[0]==='uguale, già a listino','riga 1: '+st[0]);
ok(st[2]==='uguale alla riga 2: non la carico due volte','riga 3: '+st[2]);
ok(st[3]==='simile alla riga 2, cambia: prezzo','riga 4: '+st[3]);
ok(/stesso nome di uno già a listino, codice diverso/.test(st[4]),'riga 5 (Farina, codice diverso): '+st[4]);
ok(st[5]==='nuovo','riga 6 (Sale, nuovo per Metro): '+st[5]);
ok(await pg.locator('#rv-2-s').isDisabled(),'riga uguale in tutto: casella spenta');
await pg.click('#rvall');
ok(await pg.evaluate(()=>S.rev.items.map(i=>i.sel).join())==='true,true,false,true,true,true','«Seleziona tutti» non spunta la riga uguale in tutto');
await pg.click('#rvall');
for(const i of [1,3,4,5])await pg.check('#rv-'+i+'-s');
ok(await pg.evaluate(()=>S.rev.items.map(i=>i.sel).join())==='false,true,false,true,true,true','tengo anche la riga simile');
await pg.click('[data-a="rvok"]');await pg.waitForTimeout(800);
const M=await pg.evaluate(()=>prods().filter(p=>p.fornitoreId==='metro').map(p=>[p.nome,p.codice,p.prezzo].join('/')).sort());
ok(M.join(' | ')==='Farina 00/F1/0.9 | Farina 00/F2/1.1 | Olio EVO 1 l/O1/8.5 | Olio EVO 1 l/O1/9 | Sale fino//0.4 | Zucchero 1 kg/M100/1.2','listino Metro dopo il salvataggio: '+M.join(' | '));
ok(await pg.evaluate(()=>D().prodotti.e1.aggiornato===1&&D().prodotti.e2.prezzo===0.9),'prodotti già a listino non toccati (Zucchero uguale, Farina F1 con altro codice)');
ok(await pg.evaluate(()=>prods().filter(p=>p.fornitoreId==='mariano').length===1),'F.lli Mariano non cambia');
ok(errs.length===0,'nessun errore nella pagina: '+errs.join(' | '));
await b.close();
