/* Calcio AI 1.4 Free — football-data.org, Cloudflare Worker in un file.
 * Richiede secret FOOTBALL_DATA_KEY, nessun binding aggiuntivo.
 * Solo stagione corrente. Squadre senza base domestica verificata: nessuna percentuale.
 * Modello euristico non validato; gol stimati, non xG ufficiali.
 * Risultati e calendari ritardati nel piano Free. Nessuna quota/assenza/formazione.
 * Cache locale al datacenter. Limite 9 richieste/minuto per isolate, non globale.
 * Con più visitatori o datacenter il provider può rispondere 429: riprovare più tardi.
 * Conservare una copia del vecchio worker e dello storico prima dell'installazione.
 */
const VERSION = '1.4.0-fd';
const API = 'https://api.football-data.org/v4';
const LEAGUES = {
  135:{name:'Serie A',code:'SA',type:'domestic'},
  39:{name:'Premier League',code:'PL',type:'domestic'},
  140:{name:'La Liga',code:'PD',type:'domestic'},
  78:{name:'Bundesliga',code:'BL1',type:'domestic'},
  61:{name:'Ligue 1',code:'FL1',type:'domestic'},
  88:{name:'Eredivisie',code:'DED',type:'domestic'},
  94:{name:'Primeira Liga',code:'PPL',type:'domestic'},
  2:{name:'Champions League',code:'CL',type:'europe'}
};
const LEAGUE_STRENGTH={39:1.10,140:1.07,135:1.06,78:1.05,61:1.03,94:.99,88:.98};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const blend=(a,b,w)=>a*(1-w)+b*w;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const iso=()=>new Date().toISOString();
const dayRome=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
class AppError extends Error {constructor(code,message,status=502){super(message);this.code=code;this.status=status;}}
class Preparing extends AppError {constructor(){super('PREPARING','Preparazione dei dati in corso. Le richieste completate sono conservate in cache.',202);}}
const queues=new Map();
async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function errorFromUpstream(status){
  if(status===401)return new AppError('AUTH','Chiave non valida: controlla FOOTBALL_DATA_KEY in Cloudflare.',401);
  if(status===403)return new AppError('PLAN','Questi dati non sono accessibili con il piano football-data.org associato alla chiave.',403);
  if(status===429)return new AppError('QUOTA','Limite football-data.org raggiunto. Attendi un minuto e premi Aggiorna.',429);
  if(status===404)return new AppError('SEASON','Competizione o stagione non disponibile.',404);
  return new AppError('UPSTREAM','football-data.org non ha restituito dati validi. Riprova più tardi.');
}
function ttlFor(path){return path.startsWith('/matches?ids=')?120:600;}
async function makeClient(request,env){
  if(!env.FOOTBALL_DATA_KEY)throw new AppError('CONFIG','Manca il secret FOOTBALL_DATA_KEY.',503);
  const fingerprint=(await digest(env.FOOTBALL_DATA_KEY)).slice(0,24);
  const origin=new URL(request.url).origin;
  const configured=Number(env.API_REQUESTS_PER_MINUTE);
  const rpm=finite(configured)&&configured>=1?clamp(configured,1,9):9;
  const gap=Math.ceil(60000/rpm);
  // Queue coordinates one isolate only, never claims to enforce global quota.
  let q=queues.get(fingerprint);
  if(!q){q={tail:Promise.resolve(),last:0,blockedUntil:0};queues.set(fingerprint,q);}
  const deadline=Date.now()+22000;
  const stats={upstreamCalls:0,cacheHits:0,requestsRemaining:null,sourceUpdatedAt:null};
  const memo=new Map();
  function record(entry,cached){
    if(cached)stats.cacheHits++;
    if(entry.fetchedAt&&(!stats.sourceUpdatedAt||entry.fetchedAt<stats.sourceUpdatedAt))stats.sourceUpdatedAt=entry.fetchedAt;
    return entry.data;
  }
  async function read(path){
    const cacheKey=new Request(origin+'/__internal_cache/'+VERSION+'/'+fingerprint+path);
    const hit=await caches.default.match(cacheKey);
    if(hit){let entry;try{entry=await hit.json();}catch{}if(entry?.error)throw new AppError(entry.error.code,entry.error.message,entry.error.status);if(entry?.data)return record(entry,true);}
    if(Date.now()>=deadline-1000)throw new Preparing();
    const task=async()=>{
      const secondHit=await caches.default.match(cacheKey);
      if(secondHit){let entry;try{entry=await secondHit.json();}catch{}if(entry?.error)throw new AppError(entry.error.code,entry.error.message,entry.error.status);if(entry?.data)return record(entry,true);}
      if(q.blockedUntil>Date.now())throw new AppError('QUOTA','Limite API raggiunto. Attendi almeno un minuto prima di riprovare.',429);
      const wait=Math.max(0,gap-(Date.now()-q.last));
      if(Date.now()+wait+2500>deadline)throw new Preparing();
      if(wait)await sleep(wait);
      q.last=Date.now();stats.upstreamCalls++;
      const ctl=new AbortController();
      const timer=setTimeout(()=>ctl.abort(),Math.max(1000,Math.min(12000,deadline-Date.now())));
      let r,data;
      try{
        r=await fetch(API+path,{headers:{'X-Auth-Token':env.FOOTBALL_DATA_KEY},signal:ctl.signal});
        data=await r.json();
      }catch(e){throw new AppError('NETWORK',e.name==='AbortError'?'Il provider non ha risposto in tempo. Riprova.':'Connessione al provider non riuscita. Riprova.');}
      finally{clearTimeout(timer);}
      const rem=r.headers.get('X-RequestsAvailable');
      if(rem!==null&&rem!==''&&finite(Number(rem)))stats.requestsRemaining=Number(rem);
      if(!r.ok){
        const e=errorFromUpstream(r.status);
        if(e.code==='QUOTA')q.blockedUntil=Date.now()+60000;
        if(e.code==='PLAN')try{await caches.default.put(cacheKey,new Response(JSON.stringify({error:{code:e.code,message:e.message,status:e.status}}),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=180'}}));}catch{}
        throw e;
      }
      if(!data||typeof data!=='object'||Array.isArray(data))throw new AppError('SCHEMA','Formato dei dati inatteso.');
      const entry={data,fetchedAt:iso()};
      try{await caches.default.put(cacheKey,new Response(JSON.stringify(entry),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age='+ttlFor(path)}}));}catch{}
      return record(entry,false);
    };
    const run=q.tail.then(task,task);q.tail=run.catch(()=>{});
    return run;
  }
  return {stats,async get(path){if(!memo.has(path))memo.set(path,read(path));return memo.get(path);}};
}
function regulationScore(f){
  const status=f.fixture?.status?.short;
  if(!['FT','AET','PEN'].includes(status))return null;
  const ft=f.score?.fulltime;
  if(finite(ft?.home)&&finite(ft?.away))return {home:ft.home,away:ft.away};
  return status==='FT'&&finite(f.goals?.home)&&finite(f.goals?.away)?{home:f.goals.home,away:f.goals.away}:null;
}
function completed(rows,cutoff=Date.now()){
  const seen=new Set();
  return (rows||[]).flatMap(f=>{
    const score=regulationScore(f),id=f.fixture?.id;
    if(!id||seen.has(id)||!score||Date.parse(f.fixture.date)>=cutoff||!finite(Date.parse(f.fixture.date)))return [];
    seen.add(id);return [{...f,goals:score}];
  });
}
function upcoming(rows,now=Date.now()){
  return rows.filter(f=>f.fixture?.status?.short==='NS'&&Date.parse(f.fixture.date)>now&&Date.parse(f.fixture.date)<=now+14*864e5).sort((a,b)=>Date.parse(a.fixture.date)-Date.parse(b.fixture.date));
}
function avg(rows,prior={home:1.45,away:1.20}){
  const k=30;return {home:(rows.reduce((s,f)=>s+f.goals.home,0)+prior.home*k)/(rows.length+k),away:(rows.reduce((s,f)=>s+f.goals.away,0)+prior.away*k)/(rows.length+k)};
}
function teamStats(rows,id,venue=null){
  let n=0,gf=0,ga=0,pts=0;
  for(const f of rows){const h=f.teams.home.id===id,a=f.teams.away.id===id;if(!h&&!a||venue===true&&!h||venue===false&&!a)continue;
    const g=h?f.goals.home:f.goals.away,z=h?f.goals.away:f.goals.home;n++;gf+=g;ga+=z;pts+=g>z?3:g===z?1:0;
  }return {n,gf,ga,pts};
}
function leagueBase(rows){const ids=[...new Set(rows.flatMap(f=>[f.teams.home.id,f.teams.away.id]))];const ts=ids.map(id=>teamStats(rows,id));return {ppg:ts.length?ts.reduce((s,t)=>s+t.pts/t.n,0)/ts.length:1.35};}
function structuralPower(s,base){return !s.n?1:clamp(1+.17*(s.pts/s.n-base.ppg)+.10*(s.gf-s.ga)/s.n,.72,1.40);}
function currentWeight(n){return n/(n+10);}
function structure(cur,prev,curBase,prevBase){
  const p=prev.n?structuralPower(prev,prevBase):1;
  return blend(p,structuralPower(cur,curBase),currentWeight(cur.n));
}
function venueFactor(cur,prev,mean,oldMean,type){
  const total=s=>type==='attack'?s.gf:s.ga;
  const prior=prev.n?clamp((total(prev)/prev.n)/oldMean,.65,1.50):1;
  return clamp((total(cur)/mean+8*prior)/(cur.n+8),.80,1.25);
}
function buildElo(rows){
  const elo=new Map(),games=new Map(),form=new Map();
  for(const f of [...rows].sort((a,b)=>Date.parse(a.fixture.date)-Date.parse(b.fixture.date))){
    const h=f.teams.home.id,a=f.teams.away.id,rh=elo.get(h)??1500,ra=elo.get(a)??1500;
    const expected=1/(1+10**((ra-rh-55)/400)),score=f.goals.home>f.goals.away?1:f.goals.home===f.goals.away?.5:0;
    const k=22*(1+Math.min(1.2,Math.abs(f.goals.home-f.goals.away)*.15));
    for(const [id,delta] of [[h,score-expected],[a,expected-score]]){
      const list=form.get(id)||[];list.push({date:f.fixture.date,delta});form.set(id,list.slice(-8));games.set(id,(games.get(id)||0)+1);
    }
    elo.set(h,rh+k*(score-expected));elo.set(a,ra-k*(score-expected));
  }return {elo,games,form};
}
function eloPower(id,e){return clamp(10**(((e.elo.get(id)??1500)-1500)/600),.72,1.40);}
function formResidual(id,e){const rows=e.form.get(id)||[];if(!rows.length)return 0;let num=0,den=0;rows.forEach((x,i)=>{const w=.85**(rows.length-1-i);num+=x.delta*w;den+=w;});return num/den;}
function restDays(rows,id,date){const t=Date.parse(date);const ds=rows.filter(f=>(f.teams.home.id===id||f.teams.away.id===id)&&Date.parse(f.fixture.date)<t).map(f=>Date.parse(f.fixture.date));return ds.length?Math.floor((t-Math.max(...ds))/864e5):null;}
function h2hStats(rows,h,a){const fs=rows.filter(f=>[h,a].includes(f.teams.home.id)&&[h,a].includes(f.teams.away.id)).sort((x,y)=>Date.parse(y.fixture.date)-Date.parse(x.fixture.date)).slice(0,5);let hw=0,aw=0,d=0,hg=0,ag=0;for(const f of fs){const x=f.teams.home.id===h?f.goals.home:f.goals.away,y=f.teams.home.id===h?f.goals.away:f.goals.home;hg+=x;ag+=y;if(x>y)hw++;else if(x<y)aw++;else d++;}return {n:fs.length,homeWins:hw,awayWins:aw,draws:d,homeGoals:hg,awayGoals:ag};}
function observedTeam(s,v){return {matches:s.n,ppg:s.n?s.pts/s.n:null,gfPerMatch:s.n?s.gf/s.n:null,gaPerMatch:s.n?s.ga/s.n:null,venueMatches:v.n,venueGF:v.n?v.gf/v.n:null,venueGA:v.n?v.ga/v.n:null};}
function dataQuality(n){return n<4?'molto bassa':n<8?'bassa':n<15?'media':'buona';}
function model(lh,la,extra={}){
  if(!finite(lh)||!finite(la)||lh<=0||la<=0||lh>8||la>8)throw new AppError('MODEL','Parametri del modello non validi.',500);
  const ph=[Math.exp(-lh)],pa=[Math.exp(-la)];for(let k=1;k<=30;k++){ph[k]=ph[k-1]*lh/k;pa[k]=pa[k-1]*la/k;}
  let w=0,d=0,l=0,o15=0,o25=0,o35=0,b=0;const cells=[];
  for(let h=0;h<=30;h++)for(let a=0;a<=30;a++){const p=ph[h]*pa[a];if(h>a)w+=p;else if(h===a)d+=p;else l+=p;if(h+a>1)o15+=p;if(h+a>2)o25+=p;if(h+a>3)o35+=p;if(h&&a)b+=p;cells.push({score:h+'-'+a,p});}
  const z=w+d+l,p1=w/z,px=d/z,p2=l/z;
  return {p1,px,p2,lh,la,over15:o15/z,under15:1-o15/z,over:o25/z,under:1-o25/z,over35:o35/z,under35:1-o35/z,btts:b/z,noBtts:1-b/z,dc1x:p1+px,dc12:p1+p2,dcx2:px+p2,dnb1:p1/(p1+p2),dnb2:p2/(p1+p2),scores:cells.sort((a,b)=>b.p-a.p).slice(0,3).map(s=>({...s,p:s.p/z})),...extra};
}
function normalizeMatch(m){
  const statusMap={SCHEDULED:'NS',TIMED:'NS',IN_PLAY:'LIVE',PAUSED:'HT',FINISHED:'FT',POSTPONED:'PST',SUSPENDED:'SUSP',CANCELLED:'CANC',AWARDED:'AWD'};
  const team=t=>({id:t?.id,name:t?.shortName||t?.name||'Da definire',logo:t?.crest||''});
  // fullTime may include extra time/penalties. Never treat it as the 90-minute score.
  const regular=m.score?.duration==='REGULAR'?m.score.fullTime:m.score?.regularTime;
  const status=m.status==='FINISHED'?(m.score?.duration==='PENALTY_SHOOTOUT'?'PEN':m.score?.duration==='EXTRA_TIME'?'AET':'FT'):(statusMap[m.status]||m.status);
  return {fixture:{id:m.id,date:m.utcDate,status:{short:status}},teams:{home:team(m.homeTeam),away:team(m.awayTeam)},goals:regular||{home:null,away:null},score:{fulltime:regular||{home:null,away:null}}};
}
async function leagueData(client,id){
  const cfg=LEAGUES[id];if(!cfg)throw new AppError('INPUT','Competizione non coperta dal piano gratuito.',400);
  const metadata=await client.get('/competitions/'+cfg.code);
  const season=Number(metadata.currentSeason?.startDate?.slice(0,4));
  if(!Number.isInteger(season)||season<2000)throw new AppError('SEASON','Stagione corrente non identificata.');
  const payload=await client.get('/competitions/'+cfg.code+'/matches?season='+season);
  if(!Array.isArray(payload.matches))throw new AppError('SCHEMA','Elenco partite inatteso.');
  if(payload.resultSet?.count!=null&&payload.resultSet.count!==payload.matches.length)throw new AppError('PAGINATION','Elenco partite incompleto: analisi sospesa.');
  if(payload.matches.some(m=>m.season?.startDate&&Number(m.season.startDate.slice(0,4))!==season))throw new AppError('SEASON','Le partite appartengono a una stagione diversa.');
  const current=payload.matches.map(normalizeMatch),cf=completed(current),pf=[],prevAvg=avg([]),curAvg=avg(cf);
  return {id,name:cfg.name,season,cf,pf,all:current,curAvg,prevAvg,curBase:leagueBase(cf),prevBase:leagueBase([]),elo:buildElo(cf),warning:'Solo stagione corrente. Dati football-data.org con aggiornamento ritardato; quote, assenze e formazioni non incluse.'};
}
function side(data,id,isHome){
  const s=teamStats(data.cf,id),p=teamStats(data.pf,id),v=teamStats(data.cf,id,isHome),vp=teamStats(data.pf,id,isHome);
  const struct=structure(s,p,data.curBase,data.prevBase),ep=eloPower(id,data.elo),res=formResidual(id,data.elo);
  return {s,p,v,struct,ep,res,power:clamp(.58*ep+.42*struct,.72,1.4),
    attack:venueFactor(v,vp,isHome?data.curAvg.home:data.curAvg.away,isHome?data.prevAvg.home:data.prevAvg.away,'attack'),
    defense:venueFactor(v,vp,isHome?data.curAvg.away:data.curAvg.home,isHome?data.prevAvg.away:data.prevAvg.home,'defense')};
}
function pack(f,analysis){return {id:f.fixture.id,date:f.fixture.date,status:f.fixture.status.short,home:f.teams.home,away:f.teams.away,analysis};}
function predict(f,hd,ad,euro=null){
  const hid=f.teams.home.id,aid=f.teams.away.id,h=side(hd,hid,true),a=side(ad,aid,false);
  if(h.s.n+h.p.n<4||a.s.n+a.p.n<4)return pack(f,{insufficient:true,reason:'Meno di 4 partite domestiche della stagione corrente disponibili per almeno una squadra. Nessuna percentuale generata.'});
  let hp=h.power,ap=a.power,base=hd.curAvg;
  const explain=[`Campioni domestici correnti: ${h.s.n} e ${a.s.n} gare; precedenti: ${h.p.n} e ${a.p.n}.`,`Casa/trasferta correnti: ${h.v.n} e ${a.v.n} gare.`,`Forma: rendimento rispetto all'attesa Elo prima di ciascuna partita; influenza limitata.`];
  if(euro){
    const coeffH=LEAGUE_STRENGTH[hd.id]??.90,coeffA=LEAGUE_STRENGTH[ad.id]??.90;
    const evidenceH=Math.min(1,(euro.elo.games.get(hid)||0)/10),evidenceA=Math.min(1,(euro.elo.games.get(aid)||0)/10);
    hp=clamp(h.power*coeffH*blend(1,eloPower(hid,euro.elo),.20*evidenceH),.70,1.5);
    ap=clamp(a.power*coeffA*blend(1,eloPower(aid,euro.elo),.20*evidenceA),.70,1.5);
    base=euro.curAvg;
    explain.push(`${hd.name} (${hd.season}) / ${ad.name} (${ad.season}).`,`Coefficienti lega euristici, non calibrati: ${coeffH.toFixed(2)} / ${coeffA.toFixed(2)}.`,`Elo europeo incluso con peso ridotto in base al campione; incertezza aggiuntiva fra leghe.`);
  }
  let lh=base.home*clamp(hp/ap,.72,1.40)*h.attack*a.defense*(1+h.res*.06);
  let la=base.away*clamp(ap/hp,.72,1.40)*a.attack*h.defense*(1+a.res*.06);
  const sample=Math.min(h.s.n,a.s.n),cert=Math.min(1,sample/12);
  lh=clamp(blend(base.home,lh,.35+.65*cert),.45,3.50);la=clamp(blend(base.away,la,.35+.65*cert),.40,3.25);
  const rows=completed([...hd.pf,...hd.cf,...ad.pf,...ad.cf,...(euro?[...euro.pf,...euro.cf]:[])]);
  const h2h=h2hStats(rows,hid,aid),quality=euro&&sample>=8?'media':dataQuality(sample);
  explain.push('H2H e giorni dall’ultima gara disponibile sono descrittivi: non correggono il pronostico.','Assenze e formazioni non sono incluse nel calcolo.');
  if(hd.warning||ad.warning)explain.push(hd.warning||ad.warning);
  return pack(f,model(lh,la,{homePower:hp,awayPower:ap,homeStructural:h.struct,awayStructural:a.struct,homeElo:Math.round(hd.elo.elo.get(hid)??1500),awayElo:Math.round(ad.elo.elo.get(aid)??1500),homeForm:h.res,awayForm:a.res,homeRest:restDays(rows,hid,f.fixture.date),awayRest:restDays(rows,aid,f.fixture.date),h2h,sample,confidence:quality,observed:{home:observedTeam(h.s,h.v),away:observedTeam(a.s,a.v)},stage:'preliminary',explain,method:'Elo + struttura + casa/trasferta regolarizzati + forma residua. Poisson indipendente; parametri euristici.',note:'Previsione preliminare sui 90 minuti. Gol attesi stimati, non xG ufficiali. Qualità dati ≠ probabilità di successo. Modello non ancora validato.'}));
}
async function analyze(client,league){
  const cfg=LEAGUES[league];if(!cfg)throw new AppError('INPUT','Campionato non supportato.',400);
  const main=await leagueData(client,Number(league)),fixtures=upcoming(main.all);
  if(cfg.type==='domestic')return {matches:fixtures.map(f=>predict(f,main,main)),meta:{leagueName:cfg.name,season:main.season}};
  if(!fixtures.length)return {matches:[],meta:{leagueName:cfg.name,season:main.season}};
  const teamLeague=new Map();
  // Match exact provider IDs across the seven supported domestic leagues.
  // This avoids mapping European clubs to a league by name or guessed country.
  const clubIds=new Set(fixtures.flatMap(f=>[f.teams.home.id,f.teams.away.id]));
  for(const [id,cfg] of Object.entries(LEAGUES)){
    if(cfg.type!=='domestic')continue;
    let d;
    try{d=await leagueData(client,Number(id));}
    catch(e){if(['SEASON','PLAN'].includes(e.code))continue;throw e;}
    for(const f of d.all)for(const t of [f.teams.home,f.teams.away])if(clubIds.has(t.id))teamLeague.set(t.id,d);
  }
  return {matches:fixtures.map(f=>{const h=teamLeague.get(f.teams.home.id),a=teamLeague.get(f.teams.away.id);return h&&a?predict(f,h,a,main):pack(f,{insufficient:true,reason:'Il piano gratuito non fornisce una base domestica corrente verificata per almeno una squadra. Partita mostrata senza percentuali.'});}),meta:{leagueName:LEAGUES[league].name,season:main.season}};
}
async function details(client,id){
  return {fixture:id,odds:{},injuries:[],lineups:[],warnings:['Il piano gratuito usato da Calcio AI non include quote, assenze o formazioni. Questi dati non sono applicati alle analisi.'],sourceStatus:{odds:'unsupported',injuries:'unsupported',lineups:'unsupported'},modelIncludesLineups:false};
}
async function results(client,ids){
  const payload=await client.get('/matches?ids='+ids.join(','));
  if(!Array.isArray(payload.matches))throw new AppError('SCHEMA','Elenco risultati inatteso.');
  const rows=payload.matches.map(normalizeMatch);
  return {results:rows.map(f=>({id:f.fixture.id,date:f.fixture.date,status:f.fixture.status.short,score:regulationScore(f)}))};
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===202?{'Retry-After':'2'}:{})}});}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method!=='GET')return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET'}});
    if(url.pathname==='/'||url.pathname==='/index.html')return new Response(INDEX_HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
    if(!['/api/analyze','/api/details','/api/results'].includes(url.pathname))return new Response('Not Found',{status:404});
    let client;
    try{
      // Validate before consuming any upstream requests.
      const league=url.searchParams.get('league')||'135',id=url.searchParams.get('fixture');
      const ids=(url.searchParams.get('ids')||'').split(',');
      if(url.pathname==='/api/analyze'&&!LEAGUES[league])throw new AppError('INPUT','Campionato non supportato.',400);
      if(url.pathname==='/api/details'&&!/^[1-9]\d{0,9}$/.test(id||''))throw new AppError('INPUT','Partita non valida.',400);
      if(url.pathname==='/api/results'&&(ids.length>20||!ids.every(x=>/^[1-9]\d{0,9}$/.test(x))))throw new AppError('INPUT','Massimo 20 ID partita validi.',400);
      client=await makeClient(request,env);
      const body=url.pathname==='/api/analyze'?await analyze(client,league):url.pathname==='/api/details'?await details(client,id):await results(client,[...new Set(ids)]);
      return json({ok:true,...body,meta:{...body.meta,...client.stats,version:VERSION,generatedAt:iso(),timeZone:'Europe/Rome',validated:false}});
    }catch(e){return json({ok:false,code:e.code||'INTERNAL',message:e instanceof AppError?e.message:'Errore interno. Riprova; se persiste controlla i log del Worker.',meta:client?.stats||{}},e instanceof AppError?e.status:500);}
  }
};

const INDEX_HTML = "<!doctype html>\n<html lang=\"it\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#07111f\"><title>Calcio AI 1.4 Free</title>\n<style>\n:root{color-scheme:dark;--bg:#07111f;--card:#111e30;--soft:#182b43;--line:#2b405b;--text:#f3f7fc;--muted:#afbdd0;--accent:#79d7ef;--warn:#ffd482}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,sans-serif}main{max-width:980px;margin:auto;padding:30px 18px 64px}h1{margin:0;font-size:clamp(30px,5vw,42px);letter-spacing:-1px}h2{font-size:21px;margin:0 0 12px}h3{font-size:16px;margin:16px 0 8px}.eyebrow{color:var(--accent);text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:700}.muted,.small{color:var(--muted)}.small{font-size:13px}.intro{max-width:620px;margin:8px 0 22px}.controls,.filters,.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin:18px 0}label{display:grid;gap:5px;font-size:13px;color:var(--muted);flex:1;min-width:140px}select,input,button{font:inherit;padding:12px;border-radius:11px;border:1px solid var(--line);background:var(--soft);color:var(--text);min-height:44px;max-width:100%}button{cursor:pointer;font-weight:650}button.primary{background:var(--accent);color:#07384a;border-color:var(--accent)}button:disabled{opacity:.55;cursor:wait}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.notice,#status,.match,.history{padding:16px;border:1px solid var(--line);border-radius:15px;background:var(--card);margin:14px 0}.notice{font-size:13px;color:var(--muted)}.warning{color:var(--warn)}.teams{display:flex;gap:12px;justify-content:space-between;align-items:center;margin:12px 0 20px;font-weight:750;font-size:20px}.team{display:flex;gap:9px;align-items:center;flex:1;min-width:0}.team:last-child{justify-content:end;text-align:right}.team img{width:32px;height:32px;object-fit:contain}.team span{overflow-wrap:anywhere}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.prob{padding:13px 6px;border-radius:12px;background:var(--soft);text-align:center}.prob strong{display:block;font-size:25px}.best{box-shadow:inset 0 0 0 1px var(--accent)}.badge{display:inline-block;font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:4px 9px;margin:8px 5px 0 0}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}.metric{padding:12px;background:#0d1829;border-radius:10px}.metric b{display:block;color:var(--muted);font-size:12px;margin-bottom:4px}details{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}summary{cursor:pointer;color:var(--accent);min-height:36px}.tag{display:inline-block;background:var(--soft);border-radius:8px;padding:5px 8px;margin:4px 4px 0 0;font-size:13px}.explain{padding-left:22px;color:var(--muted);font-size:13px}.detailbtn{width:100%;margin-top:15px}.panel{margin-top:12px}.playerline{padding:5px 0;border-bottom:1px solid var(--line);font-size:14px}.tablewrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:10px 7px;border-bottom:1px solid var(--line);white-space:nowrap}.hidden,[hidden]{display:none!important}progress{width:100%;height:5px;accent-color:var(--accent)}.history{margin-top:26px}footer{margin-top:30px;color:var(--muted);font-size:12px}#storage-warning:empty{display:none}.filter-empty{text-align:center;padding:20px;color:var(--muted)}\n@media(max-width:560px){main{padding:22px 12px 50px}.teams{font-size:16px;gap:7px}.team{gap:6px}.team img{width:26px;height:26px}.metrics{grid-template-columns:1fr}.prob strong{font-size:22px}.controls button{flex:1}.match{padding:13px}.filters label{min-width:120px}}\n</style></head><body><main>\n<div class=\"eyebrow\">Dati • probabilità • verifica</div><h1>Calcio AI <span class=\"muted\">1.4 Free</span></h1>\n<p class=\"intro muted\">Un quadro della partita, con probabilità, dati disponibili e motivi della stima.</p>\n<div class=\"controls\"><label>Competizione<select id=\"league\"><option value=\"135\">🇮🇹 Serie A</option><option value=\"39\">🇬🇧 Premier League</option><option value=\"140\">🇪🇸 La Liga</option><option value=\"78\">🇩🇪 Bundesliga</option><option value=\"61\">🇫🇷 Ligue 1</option><option value=\"88\">🇳🇱 Eredivisie</option><option value=\"94\">🇵🇹 Primeira Liga</option><option value=\"2\">🇪🇺 Champions League</option></select></label><button id=\"refresh\" class=\"primary\">Aggiorna</button><button id=\"cancel\" hidden>Interrompi</button></div>\n<div id=\"status\" role=\"status\" aria-live=\"polite\">Pronto.</div>\n<div id=\"storage-warning\" class=\"notice warning\" role=\"status\"></div>\n<div class=\"filters\"><label>Cerca squadra<input id=\"search\" type=\"search\" placeholder=\"Nome squadra\" autocomplete=\"off\"></label><label>Giorno<select id=\"date\"><option value=\"\">Tutti i prossimi 14 giorni</option></select></label></div>\n<div class=\"notice\">Previsioni preliminari sui <b>90 minuti</b>. Quote, assenze e formazioni non sono disponibili in questa versione gratuita. Qualità dei dati e probabilità dell’esito sono due cose diverse. Il modello è sperimentale e non ancora validato.</div>\n<div id=\"matches\"></div>\n<section class=\"history\"><h2>Come sta andando il modello?</h2><p class=\"small\">Il primo pronostico valido di ogni partita e versione viene salvato prima del calcio d’inizio, solo su questo browser. Aggiorna i risultati per confrontarlo con gli esiti reali. Non vengono ricostruiti pronostici dopo la partita.</p><div class=\"actions\"><button id=\"check-results\">Verifica risultati</button><button id=\"export-history\">Esporta storico</button><label>Ripristina un’esportazione<input id=\"import-history\" type=\"file\" accept=\"application/json,.json\"></label></div><div id=\"history-status\" role=\"status\" aria-live=\"polite\"></div><div id=\"history-summary\"></div><details><summary>Pronostici registrati</summary><div id=\"history-table\" class=\"tablewrap\"></div></details></section>\n<details><summary>Metodo e aggiornamento dei dati</summary><p class=\"small\">Elo dinamico, forza strutturale e dati casa/trasferta con regolarizzazione. Forma misurata rispetto all’attesa Elo prima della gara. Distribuzione di Poisson indipendente per gli esiti. H2H e intervallo dall’ultima gara disponibile sono descrittivi. I coefficienti sono euristici, non calibrati su un test storico.</p><p class=\"small\">Le coppe usano solo il campionato domestico corrente, la stagione dichiarata dal provider e un contributo Elo europeo prudente. I coefficienti fra campionati non sono ufficiali UEFA. Le squadre senza una base verificabile non ricevono percentuali.</p><p class=\"small\">Fonte: football-data.org. Piano gratuito con risultati e calendari ritardati. Cache di Calcio AI: partite e metadati 10 minuti; risultati dello storico 2 minuti. Quote, assenze e formazioni non disponibili. Serie B ed Europa League non coperte dal piano gratuito. “Aggiorna” ricontrolla il server, rispettando queste durate. Il primo caricamento può richiedere più passaggi e consumare diverse richieste, soprattutto per le coppe. Non è un servizio live.</p><p class=\"small\">Lo storico è un registro personale, modificabile e non certificato. Non si sincronizza fra dispositivi. Esportalo prima di cancellare i dati del browser.</p></details>\n<footer>Calcio AI 1.4 Free · Nessuna probabilità garantisce un esito. Probabilità euristiche da verificare sullo storico delle partite.</footer>\n</main><script>\n'use strict';\nconst UI_VERSION='1.4.0-fd', HISTORY_KEY='calcioai_history_fd_v14';\nconst $=s=>document.querySelector(s);\nconst esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[m]));\nconst numeric=x=>((typeof x==='number'||typeof x==='string'&&x.trim()!=='')&&Number.isFinite(Number(x)))?Number(x):null;\nconst num=(x,d=2)=>numeric(x)===null?'—':Number(x).toFixed(d);\nconst pct=x=>numeric(x)===null?'—':(Number(x)*100).toFixed(1)+'%';\nconst fmt=x=>Number.isFinite(Date.parse(x))?new Date(x).toLocaleString('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'non disponibile';\nconst dateRome=x=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x));\nconst validProbs=a=>a&&[a.p1,a.px,a.p2].every(p=>typeof p==='number'&&Number.isFinite(p)&&p>=0&&p<=1)&&Math.abs(a.p1+a.px+a.p2-1)<1e-6;\nlet active=null,loadSeq=0,current=null,currentStale=false,history=[],storageOK=true;\nconst modelByFixture=new Map(),detailCache=new Map();\nfunction readStore(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}\nfunction writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;$('#storage-warning').textContent='Salvataggio locale non disponibile o spazio esaurito. Esporta lo storico per conservarlo.';return false;}}\nfunction validRecord(r){return r&&Number.isSafeInteger(r.id)&&r.id>0&&typeof r.version==='string'&&r.version.length<30&&typeof r.home==='string'&&typeof r.away==='string'&&r.home.length<150&&r.away.length<150&&Number.isFinite(Date.parse(r.kickoff))&&Number.isFinite(Date.parse(r.savedAt))&&Number.isFinite(Date.parse(r.generatedAt))&&Date.parse(r.generatedAt)<=Date.parse(r.savedAt)&&Date.parse(r.savedAt)<Date.parse(r.kickoff)&&validProbs(r.probs);}\nfunction cleanRecord(r){return {id:r.id,version:r.version,league:String(r.league||''),home:r.home,away:r.away,kickoff:r.kickoff,savedAt:r.savedAt,generatedAt:r.generatedAt,probs:{p1:r.probs.p1,px:r.probs.px,p2:r.probs.p2}};}\nfunction readHistory(){const rows=readStore(HISTORY_KEY);history=Array.isArray(rows)?rows.filter(validRecord).slice(0,2000):[];}\nfunction saveHistory(){writeStore(HISTORY_KEY,history);renderHistory();}\nfunction capture(j){\n  const now=Date.now(),generated=Date.parse(j.meta?.generatedAt);\n  if(!Number.isFinite(generated)||generated>now||now-generated>20*60000)return;\n  let changed=false;\n  for(const g of j.matches){\n    if(g.status!=='NS'||Date.parse(g.date)<=now||!validProbs(g.analysis)||g.analysis.insufficient)continue;\n    if(history.some(r=>r.id===g.id&&r.version===j.meta.version))continue;\n    if(history.length>=2000){$('#storage-warning').textContent='Storico pieno (2.000 pronostici). Esportalo; i record esistenti restano conservati.';break;}\n    history.push({id:g.id,version:j.meta.version,league:j.meta.leagueName,home:g.home.name,away:g.away.name,kickoff:g.date,savedAt:new Date(now).toISOString(),generatedAt:j.meta.generatedAt,probs:{p1:g.analysis.p1,px:g.analysis.px,p2:g.analysis.p2}});changed=true;\n  }\n  if(changed)saveHistory();\n}\nfunction abortError(){return new DOMException('Operazione interrotta','AbortError');}\nfunction delay(ms,signal){return new Promise((resolve,reject)=>{if(signal?.aborted)return reject(abortError());const onAbort=()=>{clearTimeout(t);reject(abortError());};const t=setTimeout(()=>{signal?.removeEventListener('abort',onAbort);resolve();},ms);signal?.addEventListener('abort',onAbort,{once:true});});}\nasync function requestJSON(url,signal,onProgress){\n  for(let attempt=1;attempt<=20;attempt++){\n    if(signal?.aborted)throw abortError();\n    const ctl=new AbortController(),abort=()=>ctl.abort();signal?.addEventListener('abort',abort,{once:true});\n    const timer=setTimeout(()=>ctl.abort(),30000);let res,j;\n    try{res=await fetch(url,{signal:ctl.signal,cache:'no-store'});j=await res.json();}\n    catch(e){if(signal?.aborted)throw abortError();throw new Error(e.name==='AbortError'?'Tempo di attesa scaduto. Riprova: i dati già preparati restano in cache.':'Impossibile leggere la risposta del server. Riprova.');}\n    finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}\n    if(res.status===202&&j.code==='PREPARING'){onProgress?.(attempt,j.meta);await delay(2000,signal);continue;}\n    if(!res.ok||!j.ok)throw new Error(j.message||'Dati non disponibili.');\n    return j;\n  }\n  throw new Error('Preparazione ancora incompleta dopo 20 passaggi. Premi Aggiorna per riprendere.');\n}\nfunction validPayload(j){return j?.ok&&Array.isArray(j.matches)&&j.meta?.version===UI_VERSION;}\nasync function load(force=false){\n  active?.abort();active=new AbortController();const ctl=active,seq=++loadSeq;\n  const league=$('#league').value,key='calcioai_fd_v14_'+league,saved=readStore(key);\n  current=null;currentStale=false;modelByFixture.clear();$('#matches').innerHTML='';\n  $('#date').innerHTML='<option value=\"\">Tutti i prossimi 14 giorni</option>';\n  $('#refresh').disabled=true;$('#cancel').hidden=false;\n  const usable=validPayload(saved)&&Date.now()-Date.parse(saved.meta.generatedAt)<24*3600000;\n  if(usable){current=saved;currentStale=true;setDates();renderMatches();}\n  $('#status').textContent=usable?'Controllo aggiornamenti… Mostro intanto l’ultima copia salvata.':'Preparazione dei dati… Il primo caricamento può richiedere più passaggi.';\n  try{\n    if(!force&&usable&&Date.now()-Date.parse(saved.meta.generatedAt)<60000){currentStale=false;showPayload(saved);return;}\n    const j=await requestJSON('/api/analyze?league='+encodeURIComponent(league),ctl.signal,(n,m)=>{if(seq!==loadSeq)return;$('#status').textContent=`Preparazione, passaggio ${n}/20 · ${m?.cacheHits??0} risposte recuperate dalla cache in questo passaggio. Puoi interrompere o cambiare campionato.`;});\n    if(seq!==loadSeq)return;\n    if(!validPayload(j))throw new Error('Formato del pronostico non valido.');\n    writeStore(key,j);currentStale=false;showPayload(j);capture(j);\n  }catch(e){if(seq!==loadSeq)return;$('#status').textContent=(e.name==='AbortError'?'Caricamento interrotto.':e.message)+(current?' Mostro una copia precedente: non usarla come aggiornamento attuale.':'');currentStale=!!current;renderMatches();}\n  finally{if(seq===loadSeq){$('#refresh').disabled=false;$('#cancel').hidden=true;}}\n}\nfunction showPayload(j){current=j;setDates();renderMatches();const m=j.meta;$('#status').textContent=`${j.matches.length} partite · ${m.leagueName} · stagione ${m.season} · stima ${fmt(m.generatedAt)}. Dati scaricati da football-data.org (lettura più vecchia): ${fmt(m.sourceUpdatedAt)}. Richieste effettive in questo passaggio: ${m.upstreamCalls??0}; risposte in cache: ${m.cacheHits??0}.${m.requestsRemaining!=null?' Quota residua osservata: '+m.requestsRemaining+'.':''}`;}\nfunction setDates(){const prev=$('#date').value,ds=[...new Set((current?.matches||[]).map(g=>dateRome(g.date)))].sort();$('#date').innerHTML='<option value=\"\">Tutti i prossimi 14 giorni</option>'+ds.map(d=>`<option value=\"${esc(d)}\">${esc(d.split('-').reverse().join('/'))}</option>`).join('');if(ds.includes(prev))$('#date').value=prev;}\nfunction metric(label,a,b){return `<div class=\"metric\"><b>${esc(label)}</b>${num(a)} <span class=\"muted\">/</span> ${num(b)}</div>`;}\nfunction logo(url){try{const u=new URL(url);return u.protocol==='https:'?`<img src=\"${esc(u.href)}\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\">`:'';}catch{return '';}}\nfunction renderMatches(){\n  const box=$('#matches');box.innerHTML='';if(!current)return;\n  const q=$('#search').value.trim().toLocaleLowerCase('it'),date=$('#date').value;\n  const rows=current.matches.filter(g=>(g.home.name+' '+g.away.name).toLocaleLowerCase('it').includes(q)&&(!date||dateRome(g.date)===date));\n  if(!rows.length){box.innerHTML='<div class=\"filter-empty\">'+(current.matches.length?'Nessuna partita corrisponde ai filtri.':'Nessuna partita non iniziata nei prossimi 14 giorni.')+'</div>';return;}\n  for(const g of rows){\n    const a=g.analysis||{},expired=Date.parse(g.date)<=Date.now(),id=Number(g.id);if(!Number.isSafeInteger(id))continue;modelByFixture.set(String(id),g);\n    const valid=validProbs(a)&&!a.insufficient,mx=valid?Math.max(a.p1,a.px,a.p2):null;\n    const header=`<div class=\"small\">${esc(fmt(g.date))} · ora italiana</div><div class=\"teams\"><div class=\"team\">${logo(g.home.logo)}<span>${esc(g.home.name)}</span></div><span class=\"muted\">–</span><div class=\"team\"><span>${esc(g.away.name)}</span>${logo(g.away.logo)}</div></div>`;\n    const warnings=(currentStale?'<p class=\"warning small\">Copia precedente: aggiornamento non verificato.</p>':'')+(expired?'<p class=\"warning small\">Orario di inizio superato: questa è una previsione prepartita, non live.</p>':'');\n    let body=valid?`<div class=\"grid\">${[['1',a.p1],['X',a.px],['2',a.p2]].map(([k,p])=>`<div class=\"prob ${p===mx?'best':''}\"><span>${k}</span><strong>${pct(p)}</strong></div>`).join('')}</div><span class=\"badge\">Qualità dati: ${esc(a.confidence||'non disponibile')}</span><span class=\"badge\">Preliminare · non validato</span><div class=\"metrics\">${metric('Gol attesi dal modello · casa / ospite',a.lh,a.la)}<div class=\"metric\"><b>Gol / entrambe segnano</b>Over 2,5: ${pct(a.over)} · Goal: ${pct(a.btts)}</div></div><details><summary>Analisi completa e motivi</summary><p class=\"small\">Tutti i confronti: squadra di casa / squadra ospite.</p><h3>Dati osservati, stagione corrente</h3><div class=\"metrics\">${metric('Gol fatti per gara',a.observed?.home?.gfPerMatch,a.observed?.away?.gfPerMatch)}${metric('Gol subiti per gara',a.observed?.home?.gaPerMatch,a.observed?.away?.gaPerMatch)}${metric('Gol fatti in casa / trasferta',a.observed?.home?.venueGF,a.observed?.away?.venueGF)}${metric('Gol subiti in casa / trasferta',a.observed?.home?.venueGA,a.observed?.away?.venueGA)}${metric('Punti per gara',a.observed?.home?.ppg,a.observed?.away?.ppg)}${metric('Partite osservate',a.observed?.home?.matches,a.observed?.away?.matches)}</div><h3>Indicatori del modello</h3><div class=\"metrics\">${metric('Elo domestico',a.homeElo,a.awayElo)}${metric('Forza strutturale · 1 = riferimento',a.homeStructural,a.awayStructural)}${metric('Forma residua · 0 = attesa Elo',a.homeForm,a.awayForm)}${metric('Giorni dall’ultima gara disponibile · calendario parziale',a.homeRest,a.awayRest)}</div><p class=\"small\">${esc(a.method||'')}</p><ul class=\"explain\">${(a.explain||[]).map(t=>'<li>'+esc(t)+'</li>').join('')}</ul><p class=\"small\">${esc(a.note||'')}</p><h3>Altri esiti sui 90 minuti</h3>${[['Over 1,5',a.over15],['Under 1,5',a.under15],['Over 2,5',a.over],['Under 2,5',a.under],['Over 3,5',a.over35],['Under 3,5',a.under35],['Goal',a.btts],['No Goal',a.noBtts],['1X',a.dc1x],['12',a.dc12],['X2',a.dcx2]].map(([k,p])=>`<span class=\"tag\">${k} ${pct(p)}</span>`).join('')}<p class=\"small\">Draw No Bet, probabilità condizionate all’assenza di pareggio: casa ${pct(a.dnb1)}, ospite ${pct(a.dnb2)}. In caso di pareggio la puntata è rimborsata.</p><p class=\"small\">Risultati esatti più probabili: ${(a.scores||[]).map(s=>esc(s.score)+' '+pct(s.p)).join(' · ')}</p>${a.h2h?`<p class=\"small\">H2H disponibili: ${a.h2h.n}; vittorie casa / pareggi / ospite: ${a.h2h.homeWins} / ${a.h2h.draws} / ${a.h2h.awayWins}. Solo descrittivi.</p>`:''}</details>`:`<div class=\"notice warning\">${esc(a.reason||'Dati insufficienti o probabilità non valide. Nessuna stima mostrata.')}</div>`;\n    box.insertAdjacentHTML('beforeend',`<article class=\"match\">${header}${warnings}${body}<button class=\"detailbtn\" data-fixture=\"${id}\" aria-expanded=\"false\" aria-controls=\"details-${id}\">Disponibilità dati</button><div id=\"details-${id}\" class=\"panel\" hidden></div></article>`);\n  }\n}\nasync function loadDetails(id,btn){\n  const panel=$('#details-'+id);if(!panel.hidden){panel.hidden=true;btn.setAttribute('aria-expanded','false');return;}\n  panel.hidden=false;btn.setAttribute('aria-expanded','true');btn.disabled=true;panel.textContent='Caricamento dettagli…';\n  try{let j=detailCache.get(id);if(!j||Date.now()-j.loadedAt>60000){j=await requestJSON('/api/details?fixture='+id,null,n=>{panel.textContent='Preparazione dettagli, passaggio '+n+'/20…';});j.loadedAt=Date.now();if(!(j.warnings||[]).length)detailCache.set(id,j);}renderDetails(panel,j,modelByFixture.get(id));}\n  catch(e){panel.textContent=e.message;}\n  finally{btn.disabled=false;}\n}\nfunction renderDetails(panel,j){panel.innerHTML='<p class=\"notice\">Il piano gratuito usato da Calcio AI non include quote, assenze e formazioni. Il modello usa risultati della stagione corrente, Elo, forma e dati casa/trasferta. I gol attesi sono stime del modello, non xG ufficiali.</p>';}\nfunction historyMetrics(rows){\n  const done=rows.filter(r=>!r.excluded&&r.result&&Number.isInteger(r.result.home)&&Number.isInteger(r.result.away)&&r.result.home>=0&&r.result.away>=0&&validProbs(r.probs));\n  if(!done.length)return null;\n  let brier=0,loss=0,hits=0;const bins=Array.from({length:10},()=>({n:0,p:0,y:0}));\n  for(const r of done){const p=[r.probs.p1,r.probs.px,r.probs.p2],y=r.result.home>r.result.away?0:r.result.home===r.result.away?1:2,max=Math.max(...p),best=p.indexOf(max);if(best===y)hits++;loss-=Math.log(Math.max(1e-15,p[y]));p.forEach((v,i)=>{brier+=(v-(i===y?1:0))**2;const bin=bins[Math.min(9,Math.floor(v*10))];bin.n++;bin.p+=v;bin.y+=i===y?1:0;});}\n  return {n:done.length,brier:brier/done.length,loss:loss/done.length,hits:hits/done.length,bins};\n}\nfunction renderHistory(){\n  const versions=[...new Set(history.map(r=>r.version))];\n  let html=`<p class=\"small\">${history.length} pronostici registrati · ${history.filter(r=>r.excluded).length} esclusi per rinvio/cambio data o stato.</p>`;\n  for(const v of versions){const m=historyMetrics(history.filter(r=>r.version===v));if(!m)continue;html+=`<h3>Versione ${esc(v)} · ${m.n} partite concluse</h3><div class=\"metrics\"><div class=\"metric\"><b>Brier 1X2 · scala 0–2, più basso è meglio</b>${num(m.brier,3)}</div><div class=\"metric\"><b>Log loss · più bassa è meglio</b>${num(m.loss,3)}</div><div class=\"metric\"><b>Esito più probabile indovinato</b>${pct(m.hits)}</div><div class=\"metric\"><b>Riferimento uniforme 33,3% · Brier / log loss</b>0,667 / 1,099</div></div><p class=\"small\">Campione personale, non un test indipendente. Le partite vengono registrate quando apri la pagina; orizzonti previsionali diversi non sono direttamente confrontabili.</p><details><summary>Calibrazione per fasce (esiti 1, X e 2 aggregati)</summary><div class=\"tablewrap\"><table><tr><th>Fascia</th><th>Eventi</th><th>Probabilità media</th><th>Frequenza reale</th></tr>${m.bins.map((b,i)=>b.n?`<tr><td>${i*10}–${(i+1)*10}%</td><td>${b.n}</td><td>${pct(b.p/b.n)}</td><td>${pct(b.y/b.n)}</td></tr>`:'').join('')}</table></div><p class=\"small\">Tre eventi correlati per partita. Fasce poco popolate non consentono conclusioni affidabili.</p></details>`;}\n  if(!versions.some(v=>historyMetrics(history.filter(r=>r.version===v))))html+='<p class=\"small\">Servono pronostici registrati e risultati verificati per mostrare le misure.</p>';\n  $('#history-summary').innerHTML=html;\n  $('#history-table').innerHTML='<table><thead><tr><th>Partita</th><th>Inizio</th><th>Registrato</th><th>1 / X / 2</th><th>Esito</th></tr></thead><tbody>'+[...history].reverse().slice(0,100).map(r=>`<tr><td>${esc(r.home)} – ${esc(r.away)}<br><span class=\"small\">${esc(r.version)}</span></td><td>${esc(fmt(r.kickoff))}</td><td>${esc(fmt(r.savedAt))}</td><td>${pct(r.probs.p1)} / ${pct(r.probs.px)} / ${pct(r.probs.p2)}</td><td>${r.excluded?esc(r.excluded):r.result?esc(r.result.home+'–'+r.result.away):'Da verificare'}</td></tr>`).join('')+'</tbody></table><p class=\"small\">Mostrati gli ultimi 100; l’esportazione contiene tutti i record.</p>';\n}\nasync function checkResults(){\n  const button=$('#check-results'),st=$('#history-status');const ids=[...new Set(history.filter(r=>!r.result&&!r.excluded&&Date.parse(r.kickoff)<Date.now()-2*3600000).sort((a,b)=>(Date.parse(a.lastCheckedAt)||0)-(Date.parse(b.lastCheckedAt)||0)).map(r=>r.id))].slice(0,20);\n  if(!ids.length){st.textContent='Nessun risultato da verificare. La verifica si attiva due ore dopo l’orario previsto.';return;}\n  button.disabled=true;st.textContent='Verifica di '+ids.length+' partite…';\n  try{const j=await requestJSON('/api/results?ids='+ids.join(','),null,n=>{st.textContent='Preparazione risultati, passaggio '+n+'/20…';});\n    for(const r of history)if(ids.includes(r.id))r.lastCheckedAt=j.meta.generatedAt;\n    for(const f of j.results)for(const r of history.filter(r=>r.id===f.id&&!r.result&&!r.excluded)){\n      if(Date.parse(f.date)!==Date.parse(r.kickoff)){r.excluded='Data modificata';continue;}\n      if(['CANC','PST','ABD','AWD','WO'].includes(f.status)){r.excluded='Stato '+f.status;continue;}\n      if(['FT','AET','PEN'].includes(f.status)&&f.score&&Number.isInteger(f.score.home)&&Number.isInteger(f.score.away)&&f.score.home>=0&&f.score.away>=0){r.result=f.score;r.verifiedAt=j.meta.generatedAt;}\n    }saveHistory();st.textContent='Verifica completata. Per più di 20 partite, premi di nuovo Verifica risultati.';\n  }catch(e){st.textContent=e.message;}finally{button.disabled=false;}\n}\nfunction exportHistory(){const blob=new Blob([JSON.stringify({format:'calcioai-history',schema:1,exportedAt:new Date().toISOString(),records:history},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='calcio-ai-storico-'+dateRome(new Date())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}\nasync function importHistory(event){const file=event.target.files[0];if(!file)return;try{if(file.size>5e6)throw new Error('File troppo grande.');const j=JSON.parse(await file.text());if(j.format!=='calcioai-history'||j.schema!==1||!Array.isArray(j.records)||!j.records.every(r=>validRecord(r)&&r.version==='1.4.0-fd')||j.records.length>2000)throw new Error('Importa soltanto uno storico della versione 1.4 Free (football-data.org). Gli ID del vecchio provider sono diversi.');let added=0;for(const r of j.records){if(history.length>=2000)break;if(!history.some(x=>x.id===r.id&&x.version===r.version)){history.push(cleanRecord(r));added++;}}saveHistory();$('#history-status').textContent=added+' pronostici importati. I risultati importati sono ignorati: verificali nuovamente con il provider.';}catch(e){$('#history-status').textContent=e.message;}finally{event.target.value='';}}\n$('#refresh').addEventListener('click',()=>load(true));$('#league').addEventListener('change',()=>load());$('#cancel').addEventListener('click',()=>active?.abort());$('#search').addEventListener('input',renderMatches);$('#date').addEventListener('change',renderMatches);$('#matches').addEventListener('click',e=>{const btn=e.target.closest('button[data-fixture]');if(btn)loadDetails(btn.dataset.fixture,btn);});$('#check-results').addEventListener('click',checkResults);$('#export-history').addEventListener('click',exportHistory);$('#import-history').addEventListener('change',importHistory);\nreadHistory();renderHistory();load();\n</script></body></html>\n";
