// v72: il giro di test-giro.mjs su schermi da computer (1280 e 1440 px), tema chiaro e scuro, con Chromium.
process.env.GIRO_BROWSER='chromium';process.env.GIRO_W=process.env.GIRO_W||'1280,1440';
await import('./test-giro.mjs');
