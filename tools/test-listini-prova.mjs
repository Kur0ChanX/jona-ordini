// v63: «Prodotti di prova» in Impostazioni cancella solo i prodotti finti di partenza (demo e mar01..mar19 mai aggiornati
// da un listino caricato) in tutti i fornitori; restano i prodotti dei listini caricati e quelli scritti a mano.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const pg=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const P=(f,n,x={})=>Object.assign({fornitoreId:f,nome:n,codice:'',unita:'kg',prezzo:null,categoria:'Altro',aggiornato:1},x);
const DB={staff:{chef:{nome:'Chef',cognome:'Prova',username:'chef',ruolo:'gm',stato:'attivo'}},
  fornitori:{mariano:{nome:'F.lli Mariano'},metro:{nome:'Metro'},nieddittas:{nome:'Nieddittas'}},
  prodotti:{
    mar01:P('mariano','Spinaci'),                                   // finto: mai aggiornato
    mar17:P('mariano','Zucchine',{prezzo:2.1,caricatoDa:'chef'}),   // aggiornato dal listino vero: resta
    a1:P('mariano','Pomodoro datterino',{prezzo:3,caricatoDa:'chef'}),// listino vero: resta
    demo03:P('metro','Farina 00',{prezzo:18.9,demo:true}),          // finto
    demo07:P('nieddittas','Cozze',{prezzo:3.2,demo:true}),          // finto
    m1:P('metro','Olio scritto a mano',{prezzo:40})}};              // scritto a mano: resta
await pg.goto('http://localhost:8765/manifest.webmanifest');
await pg.evaluate(D=>{localStorage.clear();localStorage.setItem('jona_db_v2',JSON.stringify(D));localStorage.setItem('jona_me',JSON.stringify('chef'))},DB);
await pg.goto('http://localhost:8765/index.html');
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef'&&typeof settingsSheet==='function',null,{timeout:10000});
await pg.waitForTimeout(500);
ok(await pg.evaluate(()=>prods().filter(fintoP).map(p=>p.id).sort().join())==='demo03,demo07,mar01','finti riconosciuti: demo03, demo07, mar01');
await pg.evaluate(()=>{closeSheet(true);settingsSheet()});await pg.waitForTimeout(400);
const row=await pg.locator('.setrow',{hasText:'Prodotti di prova'}).textContent();
ok(/3 prodotti finti/.test(row),'riga in Impostazioni: '+row.trim());
await pg.click('[data-a="demoDel"]');await pg.waitForSelector('#ask-ok');
const t=await pg.locator('.sheet').last().textContent();
ok(/Eliminare 3 prodotti di prova\?/.test(t)&&/F\.lli Mariano: 1/.test(t)&&/Metro: 1/.test(t)&&/Nieddittas: 1/.test(t),'conferma con l\'elenco per fornitore: '+t.trim().slice(0,160));
await pg.click('#ask-ok');await pg.waitForTimeout(600);
ok(await pg.evaluate(()=>Object.keys(D().prodotti).sort().join())==='a1,m1,mar17','restano solo listino vero e prodotto a mano');
await pg.evaluate(()=>{closeSheet(true);settingsSheet()});await pg.waitForTimeout(300);
ok(await pg.locator('[data-a="demoDel"]').count()===0,'dopo: nessun pulsante «Elimina», riga «Nessuno»');
await pg.reload();await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef',null,{timeout:10000});
ok(await pg.evaluate(()=>Object.keys(D().prodotti).sort().join())==='a1,m1,mar17','dopo la ricarica i finti non tornano');
ok(errs.length===0,'nessun errore nella pagina: '+errs.join(' | '));
await b.close();
