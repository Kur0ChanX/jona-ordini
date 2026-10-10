// v67: fatture vere di Mario (docs/img/listini: DAC, F.lli Mariano, Nieddittas) trascritte a mano come risposta di Gemini,
// una risposta per foto come fa gemRun. Controlla unità, codici con lo zero, prezzi a 3 decimali, nomi puliti (##PZ, puntini),
// spesa di consegna non caricata, riga con una cifra letta male segnata «da controllare» (quantità × prezzo ≠ importo).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const pg=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const DB={staff:{chef:{nome:'Chef',cognome:'Prova',username:'chef',ruolo:'gm',stato:'attivo'}},
  fornitori:{dac:{nome:'DAC'},mar:{nome:'F.lli Mariano',categoria:'Verdura e frutta'},nie:{nome:'Nieddittas',categoria:'Pesce'}},prodotti:{}};
await pg.goto('http://localhost:8765/manifest.webmanifest');
await pg.evaluate(D=>{localStorage.clear();localStorage.setItem('jona_db_v2',JSON.stringify(D));localStorage.setItem('jona_me',JSON.stringify('chef'))},DB);
await pg.goto('http://localhost:8765/index.html');
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.me==='chef'&&typeof impRun==='function',null,{timeout:10000});
await pg.waitForTimeout(500);
const H='fornitore;codice;nome;unita;prezzo;categoria;quantita;importo';
// dac-fattura-054851-2026-09-01-pag1.jpg (il vitello ha il prezzo letto male: 5,936 invece di 15,936)
const DAC=H+`
DAC;39850;PANE CARASAU ARTIGIANALE KG.1 "SU LAORE;PZ;4,988;Secco e dispensa;10;49,88
DAC;21869;OLIO 5 LT "PET" "OLY" EXTRA VERGINE....##PZ;PZ;26,248;Secco e dispensa;2;52,50
DAC;23072;UOVA -MEDIE-53/63GR. CAT.A M-0105;PZ;0,287;Latticini e uova;630;180,81
DAC;6614;BOBINA "SUPER 800" STRAPPI-P.C.2 ROTOLI;CF;8,206;Pulizia e monouso;2;16,41
DAC;56035;BURRO "PARMAREGGIO" DA 1 KG..;##PZ;6,057;Latticini e uova;4;24,23
DAC;38555;BURRO SALATO"PAYSON BRETON"10 GR X 100P;CF;15,21;Latticini e uova;1;15,21
DAC;34170;FORMAGGIO PECORINO "NOU" 2 KG CA.......##K.;K.;14,33;Latticini e uova;4,27;61,19
DAC;9602;VITELLO FESA KG 4/6 S/V F IT;K.;5,936;Carne;4,32;68,84
DAC;54035;SUINO FILONE C/C KG 4/5 S/V F EU;K.;4,15;Carne;7,54;31,29
DAC;806406;PANCAKES 40 GR BLISS B./BINDI X 40PZ GE;CT;11,552;Secco e dispensa;2;23,10
DAC;86649;B.A. MACINATO PIEMONTESE"COALVI"1 KG GE;K.;12,09;Carne;6;72,54`;
// mariano-fattura-13960-2026-09-08.jpg (quantità = PESO NETTO)
const MAR=H+`
F.lli Mariano;457;MELONI TONFONI;KG;4,95;Verdura e frutta;8,700;43,07
F.lli Mariano;040;POM.CILIEGINO GIALLO EX;KG;9,90;Verdura e frutta;2,200;21,78
F.lli Mariano;405;BASILICO PACC GR.30;PZ;1,45;Verdura e frutta;3,000;4,35
F.lli Mariano;027;CAROTE CONF. Kg 1;PZ;1,45;Verdura e frutta;4,000;5,80
F.lli Mariano;603;INS.PULITE MIX "BUSTE GR.100";PZ;1,55;Verdura e frutta;6,000;9,30
F.lli Mariano;1172;ANANAS CALYPSO CAL.7;KG;2,95;Verdura e frutta;11,800;34,81`;
// nieddittas-fattura-5274-2026-09-22.jpg (prezzi a 4 decimali, consegna a domicilio)
const NIE='```\n'+H+`
Nieddittas;60 V A COCKTAIL PZ;OSTRICA CONCAVA (OYG) AMELIE - COCKTAIL;PZ;2,0000;Pesce;25;50,00
Nieddittas;22;COZZE (MSM);KG;4,7000;Pesce;4;18,80
Nieddittas;4;VONGOLA VERACE GROSSA (CLJ);KG;20,5000;Pesce;4;82,00
Nieddittas;CDS;CONSEGNA A DOMICILIO SARDEGNA;PZ;5,0000;Altro;1;5,00
\`\`\``;
// tre foto, tre risposte di Gemini finte
await pg.evaluate(R=>{let k=0;window.gemCall=async()=>({txt:R[k++]});
  closeSheet(true);impSheet('');S.imp.photos=[0,1,2].map(i=>new File([new Uint8Array([255,216,i])],'f'+i+'.jpg',{type:'image/jpeg'}));gemRun()},[DAC,MAR,NIE]);
await pg.waitForSelector('.rv',{timeout:8000});
const it=await pg.evaluate(()=>S.rev.items.map(i=>({f:i.fid,c:i.codice,n:i.nome,u:i.unita,p:i.prezzo,k:i.categoria,sel:i.sel,sp:i.spesa})));
const by=c=>it.find(i=>i.c===c)||{};
ok(it.length===21,'21 righe dalle 3 foto ('+it.length+')');
ok(it.every(i=>i.f),'fornitore riconosciuto su ogni riga');
ok(by('39850').f==='dac'&&by('457').f==='mar'&&by('22').f==='nie','fornitori giusti (DAC, Mariano, Nieddittas)');
ok(by('39850').u==='pz'&&by('34170').u==='kg'&&by('6614').u==='conf'&&by('806406').u==='cartone'&&by('56035').u==='pz'&&by('457').u==='kg','unità: PZ→pz, K.→kg, CF→conf, CT→cartone, ##PZ→pz: '+[by('39850').u,by('34170').u,by('6614').u,by('806406').u,by('56035').u,by('457').u]);
ok(by('21869').n==='OLIO 5 LT "PET" "OLY" EXTRA VERGINE','nome senza puntini e ##PZ: '+by('21869').n);
ok(by('34170').n==='FORMAGGIO PECORINO "NOU" 2 KG CA','nome senza puntini e ##K.: '+by('34170').n);
ok(by('56035').n==='BURRO "PARMAREGGIO" DA 1 KG','nome senza puntini finali: '+by('56035').n);
ok(by('38555').n==='BURRO SALATO"PAYSON BRETON"10 GR X 100P'&&by('603').n==='INS.PULITE MIX "BUSTE GR.100"','virgolette nei nomi tenute');
ok(['040','027','405'].every(c=>by(c).n),'codici con lo zero davanti tenuti (040, 027)');
ok(by('39850').p===4.988&&by('21869').p===26.248&&by('23072').p===0.287&&by('1172').p===2.95&&by('22').p===4.7,'prezzi con tutti i decimali');
ok(by('CDS').sp===true&&by('CDS').sel===false,'consegna a domicilio: spesa, non selezionata');
ok(it.filter(i=>i.sp).length===1,'una sola spesa');
ok(it.filter(i=>!i.sp).every(i=>i.sel),'tutti i prodotti veri selezionati');
// controllo quantità × prezzo = importo
const chk=await pg.evaluate(()=>S.rev.items.filter(i=>rigaNonTorna({q:i.q,imp:i.imp,prezzo:num(i.prezzo)})).map(i=>i.codice));
ok(chk.length===1&&chk[0]==='9602','solo il vitello (cifra letta male) è da controllare: '+chk);
ok(await pg.isVisible('#rv-chk')&&/1 riga da controllare/.test(await pg.textContent('#rv-chk')),'avviso «1 riga da controllare»');
ok(/da controllare/.test(await pg.evaluate(()=>[...document.querySelectorAll('.rv')].find(r=>r.querySelector('[data-k="codice"]').value==='9602').textContent)),'pillola rossa sulla riga del vitello');
ok(await pg.isVisible('#rv-spese'),'avviso delle spese');
// correggo il prezzo: l'avviso sparisce
await pg.evaluate(()=>{S.rev.items.find(i=>i.codice==='9602').prezzo='15,936';refreshSheet()});await pg.waitForTimeout(200);
ok(!(await pg.$('#rv-chk')),'prezzo corretto a mano: niente più avviso');
// salvo: 20 prodotti, la consegna no
await pg.click('[data-a="rvok"]');await pg.waitForTimeout(900);
const sv=await pg.evaluate(()=>Object.values(D().prodotti).map(p=>({c:p.codice,u:p.unita,p:p.prezzo,f:p.fornitoreId})));
ok(sv.length===20,'20 prodotti salvati ('+sv.length+')');
ok(!sv.some(p=>p.c==='CDS'),'la consegna non è nel listino');
ok(sv.find(p=>p.c==='040'&&p.f==='mar')&&sv.find(p=>p.c==='9602').p===15.936,'codice 040 e prezzo corretto salvati');
// formato vecchio (6 colonne) e file senza colonna «prezzo» restano come prima
let m=await pg.evaluate(()=>mapRows(parseTable('fornitore;codice;nome;unita;prezzo;categoria\nDAC;1;Riso;kg;2,10;Secco e dispensa')));
ok(m&&m[0].prezzo===2.1&&m[0].q==null&&m[0].imp==null,'tabella a 6 colonne: '+JSON.stringify(m));
m=await pg.evaluate(()=>mapRows(parseTable('descrizione;importo\nRiso;3,50')));
ok(m&&m[0].prezzo===3.5&&m[0].imp==null,'senza «prezzo» l\'importo resta il prezzo');
m=await pg.evaluate(()=>mapRows(parseTable('descrizione;quantita;importo;prezzo\nRiso;2;7,00;3,50')));
ok(m&&m[0].prezzo===3.5&&m[0].q===2&&m[0].imp===7,'con «prezzo» e «importo» il prezzo è la colonna prezzo');
ok(await pg.evaluate(()=>normUnita('Kg')==='kg'&&normUnita('NR')==='pz'&&normUnita('vaschetta')==='vaschetta'&&normUnita('')===''),'normUnita');
ok(await pg.evaluate(()=>!isSpesa('Spezie miste')&&!isSpesa('Porro')&&isSpesa('Spese di trasporto')&&isSpesa('TRASPORTO')),'isSpesa non scambia Spezie e Porro');
const pr=await pg.evaluate(()=>geminiPrompt());
ok(pr.includes('fornitore;codice;nome;unita;prezzo;categoria;quantita;importo')&&/zeri davanti/.test(pr)&&/mai il cliente/.test(pr),'testo per Gemini con quantità, importo, codici e fornitore');
ok(errs.length===0,'nessun errore della pagina: '+errs.join(' | '));
await b.close();
