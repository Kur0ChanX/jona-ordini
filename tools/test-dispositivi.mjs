// D46 (Mario 12/10: «le prove vanno fatte sempre su pc mac tablet, telefoni android e iphone e ipad»):
// il giro di test-giro.mjs sui dispositivi veri di Playwright (misure, tocco, motore), tema chiaro e scuro.
// PC (Chromium 1280/1440) e telefoni a 320/390 px li fanno già test-giro-computer e test-giro.
// WebKit (Mac, iPhone, iPad) c'è solo su GitHub: sul computer di lavoro quelle righe dicono SALTATA, su GitHub senza WebKit è FAIL.
import { webkit } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
let wk='';try{wk=webkit.executablePath()}catch(e){}
const WK=!!wk&&existsSync(wk);
const GRUPPI=[['chromium','Telefono e tablet Android','Pixel 7|Galaxy Tab S4'],['webkit','iPhone, iPad e Mac','iPhone 15|iPad (gen 7)|Desktop Safari']];
let fail=false;
for(const [br,nome,dev] of GRUPPI){
  if(br==='webkit'&&!WK){if(process.env.CI){console.log('FAIL '+nome+': WebKit non installato su GitHub');fail=true}else console.log('SALTATA '+nome+': WebKit non installato su questo computer (gira su GitHub)');continue}
  const r=spawnSync(process.execPath,[new URL('./test-giro.mjs',import.meta.url).pathname],{env:{...process.env,GIRO_BROWSER:br,GIRO_DEV:dev},encoding:'utf8',timeout:540000});
  const out=(r.stdout||'')+(r.stderr||'');
  if(r.status===0&&/PASS nessun problema/.test(out))console.log('PASS '+nome+' ('+dev.replace(/\|/g,', ')+')');
  else{fail=true;console.log('FAIL '+nome+' ('+dev.replace(/\|/g,', ')+')');console.log(out.split('\n').filter(x=>x.trim()).slice(0,15).map(x=>'  '+x).join('\n'))}
}
if(fail)process.exitCode=1;
