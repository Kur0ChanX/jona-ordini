// v72: il giro di test-giro.mjs con WebKit (il motore di Safari su iPhone), 390 px, tema chiaro e scuro.
// Su GitHub WebKit viene installato dal workflow «Prove automatiche». Sul computer di lavoro non c'è e non si scarica:
// lì la prova lo dice chiaramente e non conta (su GitHub invece, senza WebKit, fallisce).
import { webkit } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { existsSync } from 'fs';
let path='';try{path=webkit.executablePath()}catch(e){}
if(!path||!existsSync(path)){
  if(process.env.CI){console.log('FAIL WebKit non installato su GitHub: controllare il passo di installazione in .github/workflows/prove.yml');process.exitCode=1}
  else console.log('SALTATA WebKit non installato su questo computer: la prova gira su GitHub (Prove automatiche)');
}else{
  process.env.GIRO_BROWSER='webkit';process.env.GIRO_W=process.env.GIRO_W||'390';
  await import('./test-giro.mjs');
}
