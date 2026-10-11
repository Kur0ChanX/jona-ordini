// Prove legate all'ora (E26, E36, E41): la pagina parte sempre alle 12:00 di oggi (ora del computer),
// poi l'orologio scorre normale. Così una prova lanciata vicino a mezzanotte non cambia giorno a metà.
export async function oraFissa(ctx,ore=12){
  const t=new Date();t.setHours(ore,0,0,0);const off=t.getTime()-Date.now();
  await ctx.addInitScript(off=>{const R=Date,n=()=>R.now()+off;
    function D(...a){if(!new.target)return new R(n()).toString();return a.length?new R(...a):new R(n())}
    D.prototype=R.prototype;D.now=n;D.parse=R.parse;D.UTC=R.UTC;self.Date=D},off);
}
