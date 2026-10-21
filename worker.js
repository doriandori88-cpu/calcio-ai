/* Calcio AI 1.5 — Serie A, API-Football. Secret: API_FOOTBALL_KEY.
 * Nessuna chiave nel browser. Modello euristico, non ancora validato.
 * Solo stagione corrente; xG storici del provider, stime future del modello.
 * Archivio Durable Object persistente e richieste coordinate per chiave.
 */
const VERSION='1.7.0-af';
const DATA_REVISION='archive-context-2';
const API='https://v3.football.api-sports.io';
const LEAGUES={135:{name:'Serie A',type:'domestic'},2:{name:'Champions League',type:'europe'}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const blend=(a,b,w)=>a*(1-w)+b*w;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const iso=()=>new Date().toISOString();
class AppError extends Error{constructor(code,message,status=502){super(message);this.code=code;this.status=status;}}
class Preparing extends AppError{constructor(){super('PREPARING','Preparazione degli xG in corso. I dati già scaricati restano in cache.',202);}}
const queues=new Map();
async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function ttlFor(path,data){
  if(path.startsWith('/leagues'))return 21600;
  if(path.startsWith('/standings?'))return 3600;
  if(path.startsWith('/fixtures/headtohead?'))return 21600;
  if(path.startsWith('/fixtures?league=')&&!path.startsWith('/fixtures?league=135&'))return 3600;
  if(path.startsWith('/fixtures/statistics'))return data.response?.some(t=>t.statistics?.some(s=>s.type==='expected_goals'&&parseXG(s.value)!==null))?86400:900;
  if(path.startsWith('/fixtures?ids='))return data.response?.every(f=>f.fixture?.status?.short==='FT')?(data.response.every(f=>pairXG(f,f.statistics))?21600:900):120;
  return 600;
}
function providerError(status,errors){
  const keys=Object.keys(errors||{}).join(' ').toLowerCase(),reason=Object.values(errors||{}).join(' ').toLowerCase();
  if(status===401||/token|key|authentication/.test(keys)||/invalid.*(?:key|token)|missing.*key/.test(reason))return new AppError('AUTH','Chiave API-Football non valida. Controlla il secret API_FOOTBALL_KEY.',401);
  if(status===429||/ratelimit/.test(keys)||/too many requests|quota|request.*limit|limit.*request/.test(reason))return new AppError('QUOTA','API-Football limita temporaneamente le richieste. Il caricamento riprenderà automaticamente.',429);
  if(/subscription|subscribe|free plan|access.*season|plan.*access/.test(reason))return new AppError('PLAN','API-Football segnala una restrizione del piano o della stagione. Controlla il piano associato alla chiave.',403);
  if(status===403||/access|subscription|plan/.test(keys))return new AppError('PLAN','Il piano API-Football non consente questa richiesta. Controlla che Pro sia attivo.',403);
  return new AppError('UPSTREAM','API-Football non ha restituito dati validi. Riprova più tardi.');
}
async function makeClient(request,env,storage=null){
  const key=env.API_FOOTBALL_KEY||env.API_KEY;
  if(!key)throw new AppError('CONFIG','Aggiungi il secret API_FOOTBALL_KEY in Cloudflare.',503);
  const fingerprint=(await digest(key)).slice(0,24),origin=new URL(request.url).origin;
  let q=queues.get(fingerprint);if(!q){q={tail:Promise.resolve(),last:0,blockedUntil:0};queues.set(fingerprint,q);}
  const deadline=Date.now()+22000,memo=new Map();
  const stats={upstreamCalls:0,cacheHits:0,requestsRemaining:null,sourceUpdatedAt:null,persistentArchive:!!storage,staleSource:false};
  function record(entry,cached){if(cached)stats.cacheHits++;if(!stats.sourceUpdatedAt||entry.fetchedAt<stats.sourceUpdatedAt)stats.sourceUpdatedAt=entry.fetchedAt;return entry.data;}
  async function read(path){
    const ck=new Request(origin+'/__internal_cache/'+VERSION+'/'+fingerprint+path),sk='api:'+path;
    async function cached(){
      if(storage)return await archiveGet(storage,sk);
      const r=await caches.default.match(ck);if(!r)return null;try{return await r.json();}catch{return null;}
    }
    let entry=await cached();if(entry?.data&&(!entry.expiresAt||entry.expiresAt>Date.now()))return record(entry,true);
    const task=async()=>{
      entry=await cached();if(entry?.data&&(!entry.expiresAt||entry.expiresAt>Date.now()))return record(entry,true);
      try{
        const throttle=storage?(await storage.get('throttle')||{}):q;
        if((throttle.blockedUntil||0)>Date.now())throw new AppError('QUOTA','Pausa API: i dati archiviati restano disponibili.',429);
        const wait=Math.max(0,2500-(Date.now()-(throttle.last||0)));
        if(stats.upstreamCalls>=5&&storage||Date.now()+wait+4000>deadline)throw new Preparing();
        if(wait)await sleep(wait);
        throttle.last=Date.now();q.last=throttle.last;if(storage)await storage.put('throttle',throttle);
        stats.upstreamCalls++;
        const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),Math.min(12000,deadline-Date.now()));
        let r,data;
        try{r=await fetch(API+path,{headers:{'x-apisports-key':key},signal:ctl.signal});data=await r.json();}
        catch(e){throw new AppError('NETWORK',e.name==='AbortError'?'API-Football non ha risposto in tempo.':'Connessione ad API-Football non riuscita.');}
        finally{clearTimeout(timer);}
        const remaining=r.headers.get('x-ratelimit-requests-remaining');if(remaining!==null&&remaining!==''&&finite(Number(remaining)))stats.requestsRemaining=Number(remaining);
        if(!r.ok||data?.errors&&Object.keys(data.errors).length){
          const e=providerError(r.status,data?.errors);const reason=Object.values(data?.errors||{}).map(String).join(' ').split(key).join('[chiave rimossa]').replace(/[A-Za-z0-9_+=\/-]{24,}/g,'[rimosso]').slice(0,240);e.message+=' ['+path.split('?')[0]+']'+(reason?' '+reason:'');
          if(e.code==='QUOTA'){throttle.blockedUntil=Date.now()+65000;q.blockedUntil=throttle.blockedUntil;if(storage)await storage.put('throttle',throttle);}
          throw e;
        }
        if(!Array.isArray(data?.response))throw new AppError('SCHEMA','Risposta API-Football inattesa.');
        if(data.paging?.total>1)throw new AppError('PAGINATION','Risposta incompleta: più pagine non gestite.');
        if(data.results!=null&&Number(data.results)!==data.response.length)throw new AppError('SCHEMA','Conteggio risultati API-Football incoerente.');
        const fresh={data,fetchedAt:iso(),expiresAt:Date.now()+ttlFor(path,data)*1000};
        if(storage)await archivePut(storage,sk,fresh);
        else try{await caches.default.put(ck,new Response(JSON.stringify(fresh),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age='+ttlFor(path,data)}}));}catch{}
        return record(fresh,false);
      }catch(e){
        // Only calendar/season metadata may be used stale; its original timestamp remains visible.
        if(['QUOTA','PREPARING','NETWORK'].includes(e.code)&&entry?.data&&Date.now()-Date.parse(entry.fetchedAt)<86400000&&(path.startsWith('/leagues?')||path.startsWith('/fixtures?league='))){stats.staleSource=true;return record(entry,true);}
        throw e;
      }
    };
    const run=q.tail.then(task,task);q.tail=run.catch(()=>{});return run;
  }
  return {stats,storage,async get(path){if(!memo.has(path))memo.set(path,read(path));return memo.get(path);}};
}
function parseXG(value){
  if(typeof value!=='number'&&typeof value!=='string'||typeof value==='string'&&!value.trim())return null;
  const n=Number(value);return finite(n)&&n>=0&&n<=30?n:null;
}
function pairXG(f,statistics){
  if(!Array.isArray(statistics))return null;
  const one=id=>parseXG(statistics.find(t=>t.team?.id===id)?.statistics?.find(s=>s.type==='expected_goals')?.value);
  const home=one(f.teams.home.id),away=one(f.teams.away.id);
  return home===null||away===null?null:{home,away};
}
const DOMESTIC_LEAGUES={135:'Serie A',39:'Premier League',140:'La Liga',78:'Bundesliga',61:'Ligue 1',94:'Primeira Liga',88:'Eredivisie'};
const EURO_VERSION='1.7.0-af-ucl';
const optionalDataError=e=>['QUOTA','PREPARING','NETWORK'].includes(e.code);
async function competitionData(client,id,name){
  const metadata=await client.get('/leagues?id='+id+'&current=true');
  const item=metadata.response.find(x=>x.league?.id===id),seasons=item?.seasons?.filter(x=>x.current===true)||[];
  if(seasons.length!==1||!Number.isInteger(seasons[0].year))throw new AppError('SEASON','Stagione corrente non identificata per '+name+'.');
  const season=seasons[0].year,payload=await client.get('/fixtures?league='+id+'&season='+season),all=payload.response;
  if(!all.length)throw new AppError('SEASON','Nessuna partita della stagione corrente per '+name+'.');
  if(all.some(f=>f.league?.id!==id||f.league?.season!==season||!Number.isSafeInteger(f.fixture?.id)||!f.teams?.home?.id||!f.teams?.away?.id))throw new AppError('SCHEMA','Competizione, stagione o identificativi inattesi.');
  // Qualifying rounds are shown in the calendar but do not set the main UCL goal baseline.
  const cf=completed(all).filter(f=>id!==2||!/qualif|preliminary|play.off/i.test(f.league?.round||'')),pf=[];
  return {id,name,country:item.country?.name||null,season,all,cf,pf,curAvg:avg(cf),prevAvg:avg([]),curBase:leagueBase(cf),prevBase:leagueBase([]),elo:buildElo(cf)};
}
async function leagueData(client,id){
  const cfg=LEAGUES[id];if(!cfg)throw new AppError('INPUT','Competizione non supportata.',400);
  return competitionData(client,id,cfg.name);
}
// Fixed, reproducible prior: FINAL 2025 association ranking (2020/21–2024/25).
// Rank data: https://kassiesa.net/uefa/data/method5/crank2025.html
// UEFA methodology: https://www.uefa.com/nationalassociations/uefarankings/country/
// This is an explicit heuristic, NOT a fitted calibration or a club rating.
const ASSOCIATION_PRIOR={year:2025,validFrom:'2025-07-01',validUntil:'2027-07-01',source:'https://kassiesa.net/uefa/data/method5/crank2025.html',countries:
  'England|Italy|Spain|Germany|France|Netherlands|Portugal|Belgium|Czechia|Türkiye|Norway|Greece|Austria|Scotland|Poland|Denmark|Switzerland|Israel|Cyprus|Sweden|Croatia|Serbia|Ukraine|Hungary|Romania|Russia|Slovakia|Slovenia|Bulgaria|Azerbaijan|Ireland|Moldova|Iceland|Bosnia-Herzegovina|Armenia|Latvia|Kosovo|Finland|Kazakhstan|Faroe Islands|Malta|Northern Ireland|Lithuania|Liechtenstein|Estonia|Albania|Montenegro|Luxembourg|Wales|Georgia|North Macedonia|Belarus|Andorra|Gibraltar|San Marino'.split('|')};
function associationRank(country){
  const aliases={'Czech Republic':'Czechia','Turkey':'Türkiye','Bosnia and Herzegovina':'Bosnia-Herzegovina','FYR Macedonia':'North Macedonia','Republic of Ireland':'Ireland'};
  const rank=ASSOCIATION_PRIOR.countries.indexOf(aliases[country]||country)+1;return rank||null;
}
function leagueComparison(hd,ad,kickoff){
  if(hd.id===ad.id)return {available:true,ratio:1,sameLeague:true};
  const homeRank=associationRank(hd.country),awayRank=associationRank(ad.country),date=Date.parse(kickoff);
  if(!homeRank||!awayRank||!finite(date)||date<Date.parse(ASSOCIATION_PRIOR.validFrom)||date>=Date.parse(ASSOCIATION_PRIOR.validUntil))return {available:false};
  return {available:true,ratio:clamp(Math.exp(.025*(awayRank-homeRank)),1/2.2,2.2),homeRank,awayRank,homeCountry:hd.country,awayCountry:ad.country,year:ASSOCIATION_PRIOR.year,source:ASSOCIATION_PRIOR.source};
}
function europeanPrediction(f,hd,ad,euro){
  if(!hd||!ad)return pack(f,{insufficient:true,reason:'Campionato corrente di almeno una squadra ancora da recuperare o non identificato in modo univoco. Nessuna percentuale generata.'});
  const hid=f.teams.home.id,aid=f.teams.away.id,h=side(hd,hid,true),v=side(ad,aid,false);
  if(h.s.n<4||v.s.n<4)return pack(f,{insufficient:true,reason:'Meno di 4 gare nel campionato corrente per almeno una squadra. Nessuna percentuale generata.'});
  const comparison=leagueComparison(hd,ad,f.fixture.date);
  if(!comparison.available)return pack(f,{insufficient:true,reason:'Riferimento fra campionati non disponibile o scaduto: dati domestici visibili, ma nessuna percentuale Champions generata.'});
  const nh=euro.elo.games.get(hid)||0,na=euro.elo.games.get(aid)||0;
  // Compress domestic dominance BEFORE comparison; apply the association prior
  // AFTER both goal and xG branches so xG cannot silently undo the correction.
  const hp=h.power**.35*blend(1,eloPower(hid,euro.elo),.20*Math.min(1,nh/10));
  const ap=v.power**.35*blend(1,eloPower(aid,euro.elo),.20*Math.min(1,na/10));
  const base=euro.curAvg,cert=Math.min(h.s.n,v.s.n,12)/12;
  let lh=blend(base.home,base.home*clamp(hp/ap,.80,1.25)*(h.attack*v.defense)**.35*(1+h.res*.03),.35+.65*cert);
  let la=blend(base.away,base.away*clamp(ap/hp,.80,1.25)*(v.attack*h.defense)**.35*(1+v.res*.03),.35+.65*cert);
  const hx=xgProfile(hd,hid,true),ax=xgProfile(ad,aid,false),min=Math.min(hx.matches,ax.matches),coverage=Math.min(hx.coverage,ax.coverage);
  const w=min>=4?.35*min/(min+4)*coverage:0;
  lh=blend(lh,base.home*(hx.attack*ax.defense)**.35,w);la=blend(la,base.away*(ax.attack*hx.defense)**.35,w);
  lh=clamp(lh*comparison.ratio,.30,4);la=clamp(la/comparison.ratio,.30,4);
  const a={...model(lh,la),leagueComparison:comparison,homePower:hp,awayPower:ap,homeStructural:h.struct,awayStructural:v.struct,homeElo:Math.round(hd.elo.elo.get(hid)||1500),awayElo:Math.round(ad.elo.elo.get(aid)||1500),homeForm:h.res,awayForm:v.res,
    observed:{home:observedTeam(h.s,h.v),away:observedTeam(v.s,v.v)},sample:Math.min(h.s.n,v.s.n),confidence:'bassa',stage:'preliminary',xg:{home:hx,away:ax,applied:w>0,weight:w},
    h2h:h2hStats(completed([...hd.cf,...ad.cf,...euro.cf]),hid,aid),
    explain:[`${f.teams.home.name}: ${hd.name}, stagione ${hd.season}, ${h.s.n} gare.`,`${f.teams.away.name}: ${ad.name}, stagione ${ad.season}, ${v.s.n} gare.`,`Campioni Champions correnti: ${nh} e ${na} gare; contributo Elo europeo limitato dal campione.`,
      comparison.sameLeague?'Stesso campionato: nessuna correzione fra federazioni.':`Riferimento storico fra federazioni: classifica finale ${comparison.year}, ${comparison.homeCountry} n. ${comparison.homeRank} / ${comparison.awayCountry} n. ${comparison.awayRank}. Moltiplicatore gol casa ${comparison.ratio.toFixed(2)}, ospite ${(1/comparison.ratio).toFixed(2)}.`,
      'Dominio domestico attenuato; correzione fra federazioni applicata anche alla componente xG. Trasformazione euristica, non calibrazione statistica validata; non misura la forza del singolo club.',
      'xG, forma e medie di tiri/corner provengono esclusivamente dal campionato corrente di ciascuna squadra; non mescoliamo coppe e campionato.',
      w?`Contributo xG domestici: ${(w*100).toFixed(0)}%, regolarizzato e corretto con Elo avversario precedente alla gara.`:'Campione inferiore a 4 gare con xG per almeno una squadra: contributo xG disattivato.',
      'Baseline gol Champions regolarizzata; qualificazioni, preliminari e play-off esclusi dalla baseline. Statistiche di squadra della stagione corrente; riferimento fra federazioni storico e H2H pluriennali separati.',
      'Pronostico sui 90 minuti: supplementari, rigori e qualificazione non inclusi. Assenze e formazioni non incluse.'],
    method:'Riferimento storico fra federazioni + rendimento domestico attenuato + xG corretti sulla stessa scala + Elo Champions prudente. Poisson indipendente; pesi euristici.',note:'Modello Champions sperimentale distinto dalla Serie A, non ancora validato.'};
  a.reading=reading(f,a);return pack(f,a);
}
async function analyzeEurope(client){
  const main=await leagueData(client,2),fixtures=upcoming(main.all),teams=new Map(fixtures.flatMap(f=>[[f.teams.home.id,f.teams.home],[f.teams.away.id,f.teams.away]]));
  const loaded=new Map(),mapped=new Map(),warnings=[],unavailable=new Map();let pending=false;
  const turn=(await client.storage?.get('uclRecoveryTurn'))||0;if(client.storage)await client.storage.put('uclRecoveryTurn',turn+1);
  // Alternate discovery and statistics, so one missing league cannot block ready games.
  const calendarClient=turn%2&&client.storage?{...client,get:async path=>{const entry=await archiveGet(client.storage,'api:'+path);if(!entry?.data||Date.now()-Date.parse(entry.fetchedAt)>6*3600000)throw new Preparing();if(client.stats){client.stats.cacheHits++;if(entry.expiresAt<Date.now())client.stats.staleSource=true;if(!client.stats.sourceUpdatedAt||entry.fetchedAt<client.stats.sourceUpdatedAt)client.stats.sourceUpdatedAt=entry.fetchedAt;}return entry.data;}}:client;
  if(fixtures.length){
    for(const [key,name] of [135,39,140,78,61,94,88].map(id=>[id,DOMESTIC_LEAGUES[id]])){
      try{const d=await competitionData(calendarClient,Number(key),name);loaded.set(d.id,d);for(const id of teams.keys())if(d.all.some(f=>f.teams.home.id===id||f.teams.away.id===id))mapped.set(id,d);}
      catch(e){if(optionalDataError(e)){pending=true;continue;}if(['PLAN','SEASON'].includes(e.code)){warnings.push(name+': '+e.message);continue;}throw e;}
    }
    // Resolve remaining clubs by exact provider team ID, never by a guessed club name/country.
    for(const [id,team] of teams){
      if(mapped.has(id))continue;
      try{
        const p=await calendarClient.get('/leagues?team='+id+'&current=true');
        const candidates=p.response.filter(x=>x.league?.type==='League'&&x.country?.name!=='World'&&x.seasons?.some(s=>s.current===true));
        if(candidates.length!==1){const reason=candidates.length?'Più campionati correnti restituiti dal provider.':'Nessun campionato corrente restituito dal provider.';unavailable.set(id,reason);warnings.push(team.name+': '+reason);continue;}
        const c=candidates[0],lid=c.league.id;
        const d=loaded.get(lid)||await competitionData(calendarClient,lid,c.league.name);
        if(!d.all.some(f=>f.teams.home.id===id||f.teams.away.id===id)){unavailable.set(id,'Squadra assente dal calendario restituito dal provider.');warnings.push(team.name+': squadra non trovata nel calendario domestico.');continue;}
        loaded.set(lid,d);for(const other of teams.keys())if(d.all.some(f=>f.teams.home.id===other||f.teams.away.id===other))mapped.set(other,d);
      }catch(e){if(optionalDataError(e)){pending=true;continue;}if(['PLAN','SEASON'].includes(e.code)){unavailable.set(id,e.message);warnings.push(team.name+': '+e.message);continue;}throw e;}
    }
  }
  const priority=d=>Math.min(...fixtures.filter(f=>mapped.get(f.teams.home.id)===d||mapped.get(f.teams.away.id)===d).map(f=>Date.parse(f.fixture.date)));
  const datasets=[...loaded.values()].filter(d=>[...mapped.values()].some(x=>x===d)).sort((a,b)=>priority(a)-priority(b));
  // Once calendars are present, progressively fill only the last domestic games of participating clubs.
  for(const d of datasets){
    const games=fixtures.filter(f=>mapped.get(f.teams.home.id)===d||mapped.get(f.teams.away.id)===d);
    await attachXG(client,d,games);if(d.statisticsDeferred)pending=true;
  }
  // Restore already archived per-fixture statistics even while upstream calendars are still preparing.
  if(pending)for(const d of datasets)if(!d.coverage){
    const restore={storage:client.storage,stats:null,get:async()=>{throw new Preparing();}};
    await attachXG(restore,d,fixtures.filter(f=>mapped.get(f.teams.home.id)===d||mapped.get(f.teams.away.id)===d));
  }
  const sum=k=>datasets.reduce((n,d)=>n+(d[k]||0),0),missing=[...teams.keys()].filter(id=>!mapped.has(id));
  return {matches:fixtures.map(f=>{
    const hd=mapped.get(f.teams.home.id),ad=mapped.get(f.teams.away.id),p=europeanPrediction(f,hd,ad,main);
    if(p.analysis.insufficient&&(!hd||!ad)){const absent=[f.teams.home,f.teams.away].filter(t=>!mapped.has(t.id)),blocked=absent.filter(t=>unavailable.has(t.id));p.analysis.sourceState=blocked.length?'unavailable':'loading';p.analysis.reason=blocked.length?blocked.map(t=>t.name+': '+unavailable.get(t.id)).join(' ')+' Nessuna percentuale generata.':'Caricamento del campionato corrente in corso per '+absent.map(t=>t.name).join(' e ')+'. La scheda si completa automaticamente.';}
    p.analysis.sourceStatus={home:hd?'ready':unavailable.has(f.teams.home.id)?'unavailable':'loading',away:ad?'ready':unavailable.has(f.teams.away.id)?'unavailable':'loading'};
    p.analysis.production={home:hd?productionProfile(hd,f.teams.home.id,true,f.fixture.date):null,away:ad?productionProfile(ad,f.teams.away.id,false,f.fixture.date):null};
    p.analysis.domestic={home:hd?{name:hd.name,season:hd.season}:null,away:ad?{name:ad.name,season:ad.season}:null};return p;
  }),coverage:datasets.flatMap(d=>(d.coverage||[]).map(f=>({...f,competition:d.name,season:d.season}))),
    meta:{leagueId:2,leagueName:'Champions League',season:main.season,modelVersion:EURO_VERSION,domesticTeams:teams.size-missing.length,totalTeams:teams.size,domesticPending:missing.filter(id=>!unavailable.has(id)).length,domesticUnavailable:unavailable.size,warnings,
      xgChecked:sum('xgChecked'),xgAvailable:sum('xgAvailable'),productionAvailable:sum('productionAvailable'),statisticsPending:sum('statisticsPending'),statisticsUnavailable:sum('statisticsUnavailable'),statisticsDeferred:pending}};
}

const PRODUCTION_TYPES={shots:'Total Shots',onTarget:'Shots on Goal',corners:'Corner Kicks'};
function parseCount(value){
  if(typeof value!=='number'&&typeof value!=='string'||typeof value==='string'&&!value.trim())return null;
  const n=Number(value);return Number.isSafeInteger(n)&&n>=0?n:null;
}
function productionPair(f,statistics,previous){
  const side=(id,old)=>Object.fromEntries(Object.entries(PRODUCTION_TYPES).map(([key,type])=>{
    const value=parseCount(statistics?.find(t=>t.team?.id===id)?.statistics?.find(s=>s.type===type)?.value);
    return [key,value??old?.[key]??null];
  }));
  return {home:side(f.teams.home.id,previous?.home),away:side(f.teams.away.id,previous?.away)};
}
function productionProfile(data,id,isHome,kickoff){
  const rows=data.cf.filter(f=>Date.parse(f.fixture.date)<Date.parse(kickoff)&&(f.teams.home.id===id||f.teams.away.id===id)).sort((a,b)=>Date.parse(b.fixture.date)-Date.parse(a.fixture.date)).slice(0,8);
  const summarize=fs=>({considered:fs.length,metrics:Object.fromEntries(Object.keys(PRODUCTION_TYPES).map(key=>{
    let n=0,made=0,conceded=0;
    for(const f of fs){const home=f.teams.home.id===id,own=f.production?.[home?'home':'away']?.[key],opp=f.production?.[home?'away':'home']?.[key];
      if(!finite(own)||!finite(opp))continue;n++;made+=own;conceded+=opp;
    }
    return [key,{matches:n,for:n?made/n:null,against:n?conceded/n:null}];
  }))});
  return {overall:summarize(rows),venue:summarize(rows.filter(f=>(f.teams.home.id===id)===isHome)),venueName:isHome?'in casa':'in trasferta'};
}
function completeStats(f){return !!f.xg&&Object.keys(PRODUCTION_TYPES).every(k=>finite(f.production?.home?.[k])&&finite(f.production?.away?.[k]));}
function recordKey(f){return 'fixture:'+f.league.season+':'+f.fixture.id;}
function mergeStatistics(f,statistics,previous={}){
  return {...previous,id:f.fixture.id,season:f.league.season,homeId:f.teams.home.id,awayId:f.teams.away.id,
    xg:pairXG(f,statistics)||previous.xg||null,production:productionPair(f,statistics,previous.production),updatedAt:iso()};
}
async function attachXG(client,data,fixtures){
  const ids=new Set(fixtures.flatMap(f=>[f.teams.home.id,f.teams.away.id])),recent=new Map();
  for(const id of ids)for(const f of data.cf.filter(f=>f.teams.home.id===id||f.teams.away.id===id).sort((a,b)=>Date.parse(b.fixture.date)-Date.parse(a.fixture.date)).slice(0,8))recent.set(f.fixture.id,f);
  const selected=[...recent.values()].sort((a,b)=>a.fixture.id-b.fixture.id),records=new Map();
  for(const f of selected){
    const r=await client.storage?.get(recordKey(f));
    if(r&&r.id===f.fixture.id&&r.season===f.league.season&&r.homeId===f.teams.home.id&&r.awayId===f.teams.away.id){records.set(f.fixture.id,r);f.xg=r.xg;f.production=r.production;if(client.stats&&r.updatedAt&&(!client.stats.sourceUpdatedAt||r.updatedAt<client.stats.sourceUpdatedAt))client.stats.sourceUpdatedAt=r.updatedAt;}
  }
  const optionalFailure=e=>['QUOTA','PREPARING','NETWORK'].includes(e.code);
  const save=async(f,r)=>{records.set(f.fixture.id,r);f.xg=r.xg;f.production=r.production;if(client.storage)await client.storage.put(recordKey(f),r);};
  const pending=selected.filter(f=>!completeStats(f)&&!(records.get(f.fixture.id)?.checkedUntil>Date.now()));
  // Query only fixtures not already archived, using stable per-fixture records thereafter.
  const batches=pending.filter(f=>!records.get(f.fixture.id)?.batchAt);
  let deferred=false;
  for(let i=0;i<batches.length;i+=10){
    const group=batches.slice(i,i+10);let p;
    try{p=await client.get('/fixtures?ids='+group.map(f=>f.fixture.id).join('-'));}
    catch(e){if(!optionalFailure(e))throw e;if(client.stats)client.stats.recoveryError={code:e.code,message:e.message};deferred=true;break;}
    for(const f of group){
      const full=p.response.find(x=>x.fixture?.id===f.fixture.id);
      if(full?.fixture?.status?.short!=='FT'||full.league?.season!==f.league.season||full.teams?.home?.id!==f.teams.home.id||full.teams?.away?.id!==f.teams.away.id)continue;
      await save(f,{...mergeStatistics(f,full.statistics,records.get(f.fixture.id)),batchAt:iso()});
    }
  }
  if(!deferred)for(const f of selected.filter(f=>!completeStats(f)&&!(records.get(f.fixture.id)?.checkedUntil>Date.now()))){
    try{
      const extra=(await client.get('/fixtures/statistics?fixture='+f.fixture.id)).response;
      const r=mergeStatistics(f,extra,records.get(f.fixture.id));
      // A successful dedicated response without a value is provider-unavailable, never zero.
      await save(f,{...r,checkedUntil:Date.now()+86400000});
    }catch(e){if(!optionalFailure(e))throw e;if(client.stats)client.stats.recoveryError={code:e.code,message:e.message};deferred=true;break;}
  }
  const pairs=selected.filter(f=>f.xg),k=30;
  data.xgBase={home:(pairs.reduce((s,f)=>s+f.xg.home,0)+data.curAvg.home*k)/(pairs.length+k),away:(pairs.reduce((s,f)=>s+f.xg.away,0)+data.curAvg.away*k)/(pairs.length+k)};
  data.xgChecked=selected.length;data.xgAvailable=pairs.length;
  data.productionAvailable=selected.filter(f=>Object.keys(PRODUCTION_TYPES).every(k=>finite(f.production?.home?.[k])&&finite(f.production?.away?.[k]))).length;
  data.statisticsPending=selected.filter(f=>!completeStats(f)&&!(records.get(f.fixture.id)?.checkedUntil>Date.now())).length;
  data.statisticsUnavailable=selected.filter(f=>!completeStats(f)&&(records.get(f.fixture.id)?.checkedUntil>Date.now())).length;
  data.statisticsDeferred=data.statisticsPending>0;
  data.coverage=selected.map(f=>({id:f.fixture.id,date:f.fixture.date,home:f.teams.home.name,away:f.teams.away.name,xg:!!f.xg,
    ...Object.fromEntries(Object.keys(PRODUCTION_TYPES).map(k=>[k,finite(f.production?.home?.[k])&&finite(f.production?.away?.[k])])),
    state:completeStats(f)?'complete':records.get(f.fixture.id)?.checkedUntil>Date.now()?'provider_missing':'pending'}));
}
function xgProfile(data,id,isHome){
  const rows=data.cf.filter(f=>f.teams.home.id===id||f.teams.away.id===id).sort((a,b)=>Date.parse(b.fixture.date)-Date.parse(a.fixture.date)).slice(0,8);
  const base=data.xgBase||data.curAvg;let n=0,weight=0,forSum=0,againstSum=0,att=0,def=0;
  for(let i=0;i<rows.length;i++){
    const f=rows[i];if(!f.xg)continue;const home=f.teams.home.id===id,opp=home?f.teams.away.id:f.teams.home.id;
    const gf=home?f.xg.home:f.xg.away,ga=home?f.xg.away:f.xg.home;
    const w=.82**i*(home===isHome?1.25:.75),power=clamp(10**(((data.elo.before.get(f.fixture.id)?.[opp]??1500)-1500)/800),.85,1.18);
    n++;weight+=w;forSum+=gf*w;againstSum+=ga*w;
    att+=gf/(home?base.home:base.away)*power*w;def+=ga/(home?base.away:base.home)/power*w;
  }
  const shrink=n/(n+5);
  return {matches:n,considered:rows.length,coverage:rows.length?n/rows.length:0,for:weight?forSum/weight:null,against:weight?againstSum/weight:null,attack:weight?clamp(blend(1,att/weight,shrink),.6,1.65):1,defense:weight?clamp(blend(1,def/weight,shrink),.6,1.65):1};
}
function reading(f,a){
  const home=f.teams.home.name,away=f.teams.away.name,d=a.p1-a.p2;
  const side=Math.abs(d)<.10?'Equilibrio fra le due squadre; nessun vantaggio netto.':`${d>0?home:away} parte ${Math.abs(d)>.25?'con un vantaggio marcato':'con un vantaggio moderato'} nel modello.`;
  const goals=a.over>.60?'La stima propende per almeno tre gol complessivi.':a.under>.60?'La stima propende per meno di tre gol complessivi.':'Lo scenario dei gol resta incerto.';
  const data=a.xg.applied?`xG utilizzati: ${a.xg.home.matches}/${a.xg.home.considered} gare per ${home} e ${a.xg.away.matches}/${a.xg.away.considered} per ${away}.`:'Campione xG insufficiente: la stima usa risultati, Elo e rendimento casa/trasferta.';
  return `${side} ${goals} ${data}`;
}
function predictXG(f,data){
  const packed=predict(f,data,data),a=packed.analysis;if(a.insufficient)return packed;
  const h=xgProfile(data,f.teams.home.id,true),v=xgProfile(data,f.teams.away.id,false);
  const min=Math.min(h.matches,v.matches),coverage=Math.min(h.coverage,v.coverage);
  const w=min>=4?.55*min/(min+4)*coverage:0,base=data.xgBase||data.curAvg;
  const lh=blend(a.lh,clamp(base.home*h.attack*v.defense,.35,4),w),la=blend(a.la,clamp(base.away*v.attack*h.defense,.30,4),w);
  const xg={home:h,away:v,applied:w>0,weight:w};
  const explain=[...a.explain,`xG del provider: ultime 8 gare di campionato, peso maggiore alle recenti e alla sede corretta. Disponibilità: ${h.matches}/${h.considered} e ${v.matches}/${v.considered}.`,w?`Contributo xG alla stima: ${(w*100).toFixed(0)}%; regolarizzato e corretto con Elo avversario precedente alla gara.`:'Meno di 4 gare con xG per almeno una squadra: contributo xG disattivato.','I dati mancanti non sono zeri; solo gare con xG validi per entrambe le squadre entrano nelle medie.'];
  const result={...a,...model(lh,la),xg,explain,method:'Elo e risultati correnti + casa/trasferta + xG recenti ponderati. Poisson indipendente; pesi euristici.',note:'Gli xG osservati provengono da API-Football. I gol attesi della prossima gara sono stime del modello. Assenze, quote e formazioni non entrano nel calcolo. Modello non ancora validato.'};
  result.reading=reading(f,result);return pack(f,result);
}
async function analyze(client,league){
  if(Number(league)===2)return analyzeEurope(client);
  const data=await leagueData(client,Number(league)),fixtures=upcoming(data.all);
  if(fixtures.length)await attachXG(client,data,fixtures);
  return {coverage:data.coverage||[],matches:fixtures.map(f=>{const p=predictXG(f,data);p.analysis.production={home:productionProfile(data,f.teams.home.id,true,f.fixture.date),away:productionProfile(data,f.teams.away.id,false,f.fixture.date)};return p;}),meta:{leagueId:data.id,leagueName:data.name,season:data.season,xgChecked:data.xgChecked||0,xgAvailable:data.xgAvailable||0,statisticsDeferred:!!data.statisticsDeferred,statisticsPending:data.statisticsPending||0,statisticsUnavailable:data.statisticsUnavailable||0,productionAvailable:data.productionAvailable||0,provider:'API-Football'}};
}
function standingsContext(payload,f){
  const league=payload.response?.find(x=>x.league?.id===f.league.id&&x.league?.season===f.league.season)?.league;
  const groups=league?.standings;if(!Array.isArray(groups))return null;
  const one=id=>{
    const candidates=groups.filter(g=>Array.isArray(g)&&g.some(r=>r.team?.id===id));
    // Multiple phases/groups can contain the same club: do not silently pick one.
    if(candidates.length!==1)return null;
    const group=candidates[0],row=group.find(r=>r.team?.id===id);
    if(!Number.isInteger(row.rank)||!finite(row.points)||!Number.isInteger(row.all?.played))return null;
    const leader=group.find(r=>r.rank===1),gap=leader&&finite(leader.points)?leader.points-row.points:null;
    return {team:row.team,rank:row.rank,points:row.points,played:row.all.played,group:row.group||null,zone:row.description||null,updatedAt:row.update||null,gapToLeader:gap,leaderPlayed:leader?.all?.played??null,
      interpretation:gap===0?'In testa o a pari punti con la capolista.':gap>0&&gap<=3?'La vetta dista al massimo tre punti: possibile incentivo di classifica, non prova della motivazione.':null};
  };
  return {competition:league.name,season:league.season,home:one(f.teams.home.id),away:one(f.teams.away.id)};
}
async function details(client,id){
  const payload=await client.get('/fixtures?id='+Number(id));
  const f=payload.response.find(x=>x.fixture?.id===Number(id));
  if(!f||!LEAGUES[f.league?.id]||!f.teams?.home?.id||!f.teams?.away?.id)throw new AppError('INPUT','Partita non disponibile nelle competizioni supportate.',404);
  const warnings=[],context={round:f.league.round||null,source:'API-Football',standings:null},cutoff=Math.min(Date.now(),Date.parse(f.fixture.date));
  if(!finite(cutoff))throw new AppError('SCHEMA','Data partita non valida.');
  let h2h=null;
  const unavailable=(label,e)=>{if(['AUTH','CONFIG'].includes(e.code))throw e;warnings.push(label+': '+(e instanceof AppError?e.message:'dati non disponibili.'));};
  if(Date.parse(f.fixture.date)>Date.now()&&f.fixture.status.short==='NS'){
    try{context.standings=standingsContext(await client.get('/standings?league='+f.league.id+'&season='+f.league.season),f);if(!context.standings?.home||!context.standings?.away)warnings.push('Classifica non disponibile o fase non identificata univocamente per almeno una squadra.');}
    catch(e){unavailable('Classifica',e);}
  }else warnings.push('Gara iniziata o conclusa: classifica attuale esclusa per non presentarla come contesto prepartita.');
  const from=new Date(cutoff);from.setUTCFullYear(from.getUTCFullYear()-5);
  try{
    const path='/fixtures/headtohead?h2h='+[f.teams.home.id,f.teams.away.id].sort((a,b)=>a-b).join('-')+'&from='+from.toISOString().slice(0,10)+'&to='+new Date(cutoff).toISOString().slice(0,10);
    const past=await client.get(path);
    h2h=h2hStats(past.response,f.teams.home.id,f.teams.away.id,cutoff);
    h2h.scope='Ultimi 10 precedenti ufficiali disponibili nei 5 anni precedenti; tutte le competizioni. Amichevoli escluse. Risultati sui 90 minuti.';
    h2h.source='API-Football';
  }catch(e){unavailable('Scontri diretti',e);}
  return {fixture:Number(id),home:f.teams.home,away:f.teams.away,context,h2h,warnings,modelIncludesLineups:false,affectsPrediction:false,generatedAt:iso()};
}
async function results(client,ids){
  const p=await client.get('/fixtures?ids='+ids.join('-'));
  return {results:p.response.filter(f=>ids.includes(String(f.fixture?.id))).map(f=>({id:f.fixture.id,date:f.fixture.date,status:f.fixture.status.short,score:regulationScore(f)}))};
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
  const elo=new Map(),games=new Map(),form=new Map(),before=new Map();
  for(const f of [...rows].sort((a,b)=>Date.parse(a.fixture.date)-Date.parse(b.fixture.date))){
    const h=f.teams.home.id,a=f.teams.away.id,rh=elo.get(h)??1500,ra=elo.get(a)??1500;
    before.set(f.fixture.id,{[h]:rh,[a]:ra});
    const expected=1/(1+10**((ra-rh-55)/400)),score=f.goals.home>f.goals.away?1:f.goals.home===f.goals.away?.5:0;
    const k=22*(1+Math.min(1.2,Math.abs(f.goals.home-f.goals.away)*.15));
    for(const [id,delta] of [[h,score-expected],[a,expected-score]]){
      const list=form.get(id)||[];list.push({date:f.fixture.date,delta});form.set(id,list.slice(-8));games.set(id,(games.get(id)||0)+1);
    }
    elo.set(h,rh+k*(score-expected));elo.set(a,ra-k*(score-expected));
  }return {elo,games,form,before};
}
function eloPower(id,e){return clamp(10**(((e.elo.get(id)??1500)-1500)/600),.72,1.40);}
function formResidual(id,e){const rows=e.form.get(id)||[];if(!rows.length)return 0;let num=0,den=0;rows.forEach((x,i)=>{const w=.85**(rows.length-1-i);num+=x.delta*w;den+=w;});return num/den;}
function h2hStats(rows,h,a,cutoff=Date.now()){
  const since=new Date(cutoff);since.setUTCFullYear(since.getUTCFullYear()-5);
  const fs=completed(rows,cutoff).filter(f=>Date.parse(f.fixture.date)>=since.getTime()&&f.teams?.home?.id!==f.teams?.away?.id&&[h,a].includes(f.teams?.home?.id)&&[h,a].includes(f.teams?.away?.id)&&!/friendly|friendlies|amichevol/i.test(f.league?.name||'')).sort((x,y)=>Date.parse(y.fixture.date)-Date.parse(x.fixture.date)).slice(0,10);
  let hw=0,aw=0,d=0,hg=0,ag=0;
  for(const f of fs){const x=f.teams.home.id===h?f.goals.home:f.goals.away,y=f.teams.home.id===h?f.goals.away:f.goals.home;hg+=x;ag+=y;if(x>y)hw++;else if(x<y)aw++;else d++;}
  return {n:fs.length,homeWins:hw,awayWins:aw,draws:d,homeGoals:hg,awayGoals:ag,matches:fs.map(f=>({id:f.fixture.id,date:f.fixture.date,competition:f.league?.name||null,home:f.teams.home.name,away:f.teams.away.name,score:f.goals})),descriptiveOnly:true};
}
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
  const explain=[`Stagione corrente: ${h.s.n} e ${a.s.n} gare di Serie A.`,`Casa/trasferta correnti: ${h.v.n} e ${a.v.n} gare.`,`Forma: rendimento rispetto all'attesa Elo prima di ciascuna partita; influenza limitata.`];

  let lh=base.home*clamp(hp/ap,.72,1.40)*h.attack*a.defense*(1+h.res*.06);
  let la=base.away*clamp(ap/hp,.72,1.40)*a.attack*h.defense*(1+a.res*.06);
  const sample=Math.min(h.s.n,a.s.n),cert=Math.min(1,sample/12);
  lh=clamp(blend(base.home,lh,.35+.65*cert),.45,3.50);la=clamp(blend(base.away,la,.35+.65*cert),.40,3.25);
  const rows=completed([...hd.pf,...hd.cf,...ad.pf,...ad.cf,...(euro?[...euro.pf,...euro.cf]:[])]);
  const h2h=h2hStats(rows,hid,aid),quality=euro&&sample>=8?'media':dataQuality(sample);
  explain.push('Gli H2H sono descrittivi: non correggono il pronostico.','Assenze e formazioni non sono incluse nel calcolo.');
  if(hd.warning||ad.warning)explain.push(hd.warning||ad.warning);
  return pack(f,model(lh,la,{homePower:hp,awayPower:ap,homeStructural:h.struct,awayStructural:a.struct,homeElo:Math.round(hd.elo.elo.get(hid)??1500),awayElo:Math.round(ad.elo.elo.get(aid)??1500),homeForm:h.res,awayForm:a.res,h2h,sample,confidence:quality,observed:{home:observedTeam(h.s,h.v),away:observedTeam(a.s,a.v)},stage:'preliminary',explain,method:'Elo + struttura + casa/trasferta regolarizzati + forma residua. Poisson indipendente; parametri euristici.',note:'Previsione preliminare sui 90 minuti. Gol attesi stimati, non xG ufficiali. Qualità dati ≠ probabilità di successo. Modello non ancora validato.'}));
}

async function edgeSeed(origin,fingerprint){
  const rows=[];
  const read=async path=>{
    try{const r=await caches.default.match(new Request(origin+'/__internal_cache/'+VERSION+'/'+fingerprint+path));if(!r)return null;
      const e=await r.json();if(!e?.data?.response||Date.now()-Date.parse(e.fetchedAt)>86400000)return null;
      rows.push({path,entry:{...e,expiresAt:Date.parse(e.fetchedAt)+ttlFor(path,e.data)*1000}});return e.data;
    }catch{return null;}
  };
  const metadata=await read('/leagues?id=135&current=true');
  const seasons=metadata?.response?.find(x=>x.league?.id===135)?.seasons?.filter(s=>s.current);
  if(seasons?.length!==1||!Number.isInteger(seasons[0].year))return rows;
  const calendar=await read('/fixtures?league=135&season='+seasons[0].year);if(!calendar)return rows;
  const finished=completed(calendar.response),teams=new Set(upcoming(calendar.response).flatMap(f=>[f.teams.home.id,f.teams.away.id])),selected=new Map();
  for(const id of teams)for(const f of finished.filter(f=>f.teams.home.id===id||f.teams.away.id===id).sort((a,b)=>Date.parse(b.fixture.date)-Date.parse(a.fixture.date)).slice(0,8))selected.set(f.fixture.id,f);
  const fs=[...selected.values()].sort((a,b)=>a.fixture.id-b.fixture.id);
  for(let i=0;i<fs.length;i+=20)await read('/fixtures?ids='+fs.slice(i,i+20).map(f=>f.fixture.id).join('-'));
  return rows;
}

// Chunk large calendars/snapshots below the Durable Object KV per-value limit.
async function archivePut(storage,key,value){
  const encoded=JSON.stringify(value);
  if(encoded.length<=24000)return storage.put(key,value);
  const values={},n=Math.ceil(encoded.length/24000);
  for(let i=0;i<n;i++)values[key+':chunk:'+i]=encoded.slice(i*24000,(i+1)*24000);
  values[key]={__archiveChunks:n};await storage.put(values);
}
async function archiveGet(storage,key){
  const value=await storage.get(key);if(!value?.__archiveChunks)return value;
  const keys=Array.from({length:value.__archiveChunks},(_,i)=>key+':chunk:'+i),parts=await storage.get(keys);
  return JSON.parse(keys.map(k=>parts.get(k)).join(''));
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===202?{'Retry-After':'65'}:{})}});}
function validateApi(url){
  if(!['/api/analyze','/api/details','/api/results','/api/coverage'].includes(url.pathname))throw new AppError('INPUT','Percorso non disponibile.',404);
  if(['/api/analyze','/api/coverage'].includes(url.pathname)&&!LEAGUES[url.searchParams.get('league')||'135'])throw new AppError('INPUT','Campionato non supportato.',400);
  if(url.pathname==='/api/details'&&!/^[1-9]\d{0,9}$/.test(url.searchParams.get('fixture')||''))throw new AppError('INPUT','Partita non valida.',400);
  const ids=(url.searchParams.get('ids')||'').split(',');
  if(url.pathname==='/api/results'&&(ids.length>20||!ids.every(x=>/^[1-9]\d{0,9}$/.test(x))))throw new AppError('INPUT','Massimo 20 ID partita validi.',400);
}
async function handleApi(request,env,storage=null){
  let client;
  try{
    const url=new URL(request.url);validateApi(url);
    client=await makeClient(request,env,storage);
    const ids=(url.searchParams.get('ids')||'').split(',');
    const body=url.pathname==='/api/analyze'?await analyze(client,url.searchParams.get('league')||'135'):url.pathname==='/api/details'?await details(client,url.searchParams.get('fixture')):await results(client,[...new Set(ids)]);
    return json({ok:true,...body,meta:{...body.meta,...client.stats,version:body.meta?.modelVersion||VERSION,dataRevision:DATA_REVISION,generatedAt:iso(),timeZone:'Europe/Rome',validated:false}});
  }catch(e){return json({ok:false,code:e.code||'INTERNAL',message:e instanceof AppError?e.message:'Errore interno. Riprova.',meta:client?.stats||{}},e instanceof AppError?e.status:500);}
}
function scopedArchive(storage,league){
  const local=new Set(['snapshot','recovery','lastAttempt']);
  const key=k=>league===135?k:local.has(k.split(':chunk:')[0])?k.replace(/^(snapshot|recovery|lastAttempt)/,'$1:'+league):k;
  return {get:async k=>{if(Array.isArray(k)){const v=await storage.get(k.map(key));return new Map(k.filter(x=>v.has(key(x))).map(x=>[x,v.get(key(x))]));}return storage.get(key(k));},
    put:async(k,v)=>typeof k==='string'?storage.put(key(k),v):storage.put(Object.fromEntries(Object.entries(k).map(([k,v])=>[key(k),v]))),
    delete:async k=>storage.delete(key(k)),getAlarm:()=>storage.getAlarm(),setAlarm:t=>storage.setAlarm(t),deleteAlarm:()=>storage.deleteAlarm()};
}
export class CalcioArchive {
  constructor(ctx,env){this.ctx=ctx;this.env=env;this.busy=false;}
  async fetch(request){
    const url=new URL(request.url);
    if(request.method==='POST'&&url.pathname==='/internal/seed'){
      const rows=await request.json();if(!Array.isArray(rows)||rows.length>12)return new Response('Invalid seed',{status:400});
      for(const {path,entry} of rows){
        if(!/^\/(?:leagues\?id=135&current=true|fixtures\?(?:league=135&season=\d{4}|ids=\d+(?:-\d+)*))$/.test(path)||!Array.isArray(entry?.data?.response))continue;
        if(!await archiveGet(this.ctx.storage,'api:'+path))await archivePut(this.ctx.storage,'api:'+path,entry);
        if(path.startsWith('/fixtures?ids='))for(const f of entry.data.response){
          if(f.league?.id!==135||!Number.isInteger(f.league.season)||!Number.isSafeInteger(f.fixture?.id)||f.fixture.status?.short!=='FT'||!f.teams?.home?.id||!f.teams?.away?.id)continue;
          const old=await this.ctx.storage.get(recordKey(f));await this.ctx.storage.put(recordKey(f),{...mergeStatistics(f,f.statistics,old),batchAt:entry.fetchedAt,updatedAt:entry.fetchedAt});
        }
      }return new Response('Seeded');
    }
    if(request.method!=='GET')return new Response('Method Not Allowed',{status:405});
    try{validateApi(url);}catch(e){return json({ok:false,code:e.code,message:e.message},e.status);}
    const league=Number(url.searchParams.get('league')||135),storage=scopedArchive(this.ctx.storage,league);
    if(url.pathname==='/api/coverage'){
      const snapshot=await archiveGet(storage,'snapshot');return json({ok:true,meta:snapshot?.meta||{},fixtures:snapshot?.coverage||[],recovery:await storage.get('recovery'),lastAttempt:await storage.get('lastAttempt')});
    }
    if(url.pathname!=='/api/analyze')return handleApi(request,this.env,this.ctx.storage);
    const cached=await archiveGet(storage,'snapshot');
    const saved=cached?.meta?.dataRevision===DATA_REVISION?cached:null;
    if(this.busy||saved&&Date.now()-Date.parse(saved.meta.generatedAt)<30000){
      if(saved)return json({...saved,coverage:undefined,meta:{...saved.meta,refreshing:this.busy}});
      return json({ok:false,code:'PREPARING',message:'Archivio della competizione in preparazione.',meta:{}},202);
    }
    this.busy=true;
    try{const job=await storage.get('recovery');if(!job||job.until<Date.now())await storage.put('recovery',{until:Date.now()+60*60000,attempts:0});return await this.run(request,league);}finally{this.busy=false;}
  }
  async run(request,league=Number(new URL(request.url).searchParams.get('league')||135)){
    this.busy=true;const storage=scopedArchive(this.ctx.storage,league);
    try{
      const response=await handleApi(request,this.env,storage),body=await response.clone().json();
      const previous=await storage.get('lastAttempt'),calls=body.meta?.upstreamCalls||0;
      await storage.put('lastAttempt',{at:iso(),upstreamAt:calls?iso():previous?.upstreamAt||null,ok:body.ok,code:body.code||null,message:body.message||null,upstreamCalls:calls});
      const job=await storage.get('recovery')||{until:0,attempts:60};
      if(body.ok){await archivePut(storage,'snapshot',body);if(!body.meta.statisticsDeferred)await storage.delete('recovery');}
      const recover=body.ok?body.meta.statisticsDeferred:['QUOTA','PREPARING','NETWORK'].includes(body.code);
      if(recover&&job.until>Date.now()&&job.attempts<60)await storage.put('recovery',{...job,attempts:job.attempts+1});
      await this.schedule();return response;
    }finally{this.busy=false;}
  }
  async jobs(){
    const jobs=[];for(const league of [135,2]){const storage=scopedArchive(this.ctx.storage,league),job=await storage.get('recovery');if(job&&job.until>Date.now()&&job.attempts<60)jobs.push({league,at:Date.parse((await storage.get('lastAttempt'))?.upstreamAt)||0});}return jobs.sort((a,b)=>a.at-b.at);
  }
  async schedule(){if((await this.jobs()).length){const throttle=await this.ctx.storage.get('throttle')||{},next=Math.max(Date.now()+65000,(throttle.blockedUntil||0)+1000);const current=await this.ctx.storage.getAlarm();if(!current||current<(throttle.blockedUntil||0)+1000)await this.ctx.storage.setAlarm(next);}else await this.ctx.storage.deleteAlarm();}
  async alarm(){
    if(this.busy){await this.ctx.storage.setAlarm(Date.now()+65000);return;}
    this.busy=true;try{const job=(await this.jobs())[0];if(job)await this.run(new Request('https://archive.internal/api/analyze?league='+job.league),job.league);}finally{this.busy=false;}
  }
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method!=='GET')return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET'}});
    if(url.pathname==='/'||url.pathname==='/index.html')return new Response(INDEX_HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
    try{
      validateApi(url);
      const key=env.API_FOOTBALL_KEY||env.API_KEY;
      if(!key)throw new AppError('CONFIG','Chiave API-Football non configurata.',503);
      if(!env.DATA_ARCHIVE)throw new AppError('CONFIG','Archivio persistente non collegato. Controlla il binding DATA_ARCHIVE.',503);
      const fingerprint=(await digest(key)).slice(0,24),name='serie-a-'+fingerprint;
      const stub=env.DATA_ARCHIVE.get(env.DATA_ARCHIVE.idFromName(name));
      if(url.pathname==='/api/analyze'&&(url.searchParams.get('league')||'135')==='135'){
        const rows=await edgeSeed(url.origin,fingerprint);
        if(rows.length)await stub.fetch(new Request('https://archive.internal/internal/seed',{method:'POST',body:JSON.stringify(rows)}));
      }
      return await stub.fetch(request);
    }catch(e){return json({ok:false,code:e.code||'INTERNAL',message:e instanceof AppError?e.message:'Archivio temporaneamente non disponibile.'},e instanceof AppError?e.status:502);}
  }
};

const INDEX_HTML = "<!doctype html>\n<html lang=\"it\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#07111f\"><title>Calcio AI 1.7 · Serie A e Champions + xG</title>\n<style>\n:root{color-scheme:dark;--bg:#07111f;--card:#111e30;--soft:#182b43;--line:#2b405b;--text:#f3f7fc;--muted:#afbdd0;--accent:#79d7ef;--warn:#ffd482}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,sans-serif}main{max-width:980px;margin:auto;padding:30px 18px 64px}h1{margin:0;font-size:clamp(30px,5vw,42px);letter-spacing:-1px}h2{font-size:21px;margin:0 0 12px}h3{font-size:16px;margin:16px 0 8px}.eyebrow{color:var(--accent);text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:700}.muted,.small{color:var(--muted)}.small{font-size:13px}.intro{max-width:620px;margin:8px 0 22px}.controls,.filters,.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin:18px 0}label{display:grid;gap:5px;font-size:13px;color:var(--muted);flex:1;min-width:140px}select,input,button{font:inherit;padding:12px;border-radius:11px;border:1px solid var(--line);background:var(--soft);color:var(--text);min-height:44px;max-width:100%}button{cursor:pointer;font-weight:650}button.primary{background:var(--accent);color:#07384a;border-color:var(--accent)}button:disabled{opacity:.55;cursor:wait}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.notice,#status,.match,.history{padding:16px;border:1px solid var(--line);border-radius:15px;background:var(--card);margin:14px 0}.notice{font-size:13px;color:var(--muted)}.warning{color:var(--warn)}.teams{display:flex;gap:12px;justify-content:space-between;align-items:center;margin:12px 0 20px;font-weight:750;font-size:20px}.team{display:flex;gap:9px;align-items:center;flex:1;min-width:0}.team:last-child{justify-content:end;text-align:right}.team img{width:32px;height:32px;object-fit:contain}.team span{overflow-wrap:anywhere}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.prob{padding:13px 6px;border-radius:12px;background:var(--soft);text-align:center}.prob strong{display:block;font-size:25px}.best{box-shadow:inset 0 0 0 1px var(--accent)}.badge{display:inline-block;font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:4px 9px;margin:8px 5px 0 0}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}.metric{padding:12px;background:#0d1829;border-radius:10px}.metric b{display:block;color:var(--muted);font-size:12px;margin-bottom:4px}details{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}summary{cursor:pointer;color:var(--accent);min-height:36px}.tag{display:inline-block;background:var(--soft);border-radius:8px;padding:5px 8px;margin:4px 4px 0 0;font-size:13px}.explain{padding-left:22px;color:var(--muted);font-size:13px}.detailbtn{width:100%;margin-top:15px}.panel{margin-top:12px}.playerline{padding:5px 0;border-bottom:1px solid var(--line);font-size:14px}.tablewrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:10px 7px;border-bottom:1px solid var(--line);white-space:nowrap}.hidden,[hidden]{display:none!important}progress{width:100%;height:5px;accent-color:var(--accent)}.history{margin-top:26px}footer{margin-top:30px;color:var(--muted);font-size:12px}#storage-warning:empty{display:none}.filter-empty{text-align:center;padding:20px;color:var(--muted)}\n@media(max-width:560px){main{padding:22px 12px 50px}.teams{font-size:16px;gap:7px}.team{gap:6px}.team img{width:26px;height:26px}.metrics{grid-template-columns:1fr}.prob strong{font-size:22px}.controls button{flex:1}.match{padding:13px}.filters label{min-width:120px}}\n</style></head><body><main>\n<div class=\"eyebrow\">Dati • probabilità • verifica</div><h1>Calcio AI <span class=\"muted\">1.7 · Serie A e Champions + xG</span></h1>\n<p class=\"intro muted\">Un quadro della partita, con probabilità, dati disponibili e motivi della stima.</p>\n<div class=\"controls\"><label>Competizione<select id=\"league\"><option value=\"135\">🇮🇹 Serie A</option><option value=\"2\">🏆 Champions League</option></select></label><button id=\"refresh\" class=\"primary\">Aggiorna</button><button id=\"cancel\" hidden>Interrompi</button></div>\n<div id=\"status\" role=\"status\" aria-live=\"polite\">Pronto.</div>\n<div id=\"storage-warning\" class=\"notice warning\" role=\"status\"></div>\n<div class=\"filters\"><label>Cerca squadra<input id=\"search\" type=\"search\" placeholder=\"Nome squadra\" autocomplete=\"off\"></label><label>Giorno<select id=\"date\"><option value=\"\">Tutti i prossimi 14 giorni</option></select></label></div>\n<div class=\"notice\">Previsioni preliminari sui <b>90 minuti</b>. La stima usa gli xG recenti disponibili, Elo e dati casa/trasferta. Quote, assenze e formazioni non entrano nel calcolo. Qualità dei dati e probabilità dell’esito sono due cose diverse. Il modello è sperimentale e non ancora validato.</div>\n<div id=\"matches\"></div>\n<section class=\"history\"><h2>Come sta andando il modello?</h2><p class=\"small\">Il primo pronostico valido di ogni partita e versione viene salvato prima del calcio d’inizio, solo su questo browser. Aggiorna i risultati per confrontarlo con gli esiti reali. Non vengono ricostruiti pronostici dopo la partita.</p><div class=\"actions\"><button id=\"check-results\">Verifica risultati</button><button id=\"export-history\">Esporta storico</button><label>Ripristina un’esportazione<input id=\"import-history\" type=\"file\" accept=\"application/json,.json\"></label></div><div id=\"history-status\" role=\"status\" aria-live=\"polite\"></div><div id=\"history-summary\"></div><details><summary>Pronostici registrati</summary><div id=\"history-table\" class=\"tablewrap\"></div></details></section>\n<details><summary>Metodo e aggiornamento dei dati</summary><p class=\"small\">Serie A e Champions League, stagioni correnti dichiarate dal provider. In Champions la base è il campionato corrente di ciascun club: gli abbinamenti usano gli ID esatti API-Football. Coppe e campionato restano separati; nessuna percentuale se manca il campionato o ci sono meno di 4 gare domestiche. Il contributo europeo è prudente e la forza fra leghe non è calibrata. Le previsioni riguardano soltanto i 90 minuti, non la qualificazione. Elo dinamico, risultati e rendimento casa/trasferta regolarizzati. xG delle ultime 8 gare per squadra: le gare recenti e la sede corretta pesano di più; correzione prudente per la forza Elo dell’avversario prima della gara. Il contributo xG si attiva da 4 gare valide per entrambe le squadre e si riduce quando mancano dati. Gli xG mancanti non sono zeri. Le medie xG mostrate sono ponderate; i gol futuri sono stime, non dati osservati.</p><p class=\"small\">Fonte: API-Football. Le statistiche concluse recuperate sono conservate in un archivio persistente per partita. Il recupero dei dati mancanti prosegue automaticamente, anche a pagina chiusa, per un massimo di 60 minuti per sessione; i dati confermati assenti sono ricontrollati dopo 24 ore. Le statistiche non ancora recuperate restano escluse, non valgono zero. Elenco gare: cache 10 minuti per Serie A, 60 minuti per Champions e altri campionati; stagione: 6 ore; gare concluse con statistiche: 6 ore; statistiche richieste singolarmente: 24 ore (15 minuti se xG assenti); risultati non conclusi: 2 minuti. Aggiorna rispetta la cache. Non è un servizio live. Quote, assenze e formazioni non entrano nel modello. H2H solo descrittivi.</p><p class=\"small\">Poisson indipendente con pesi euristici, ancora da validare sullo storico. Lo storico 1.4 resta conservato nel browser ma separato, perché i provider usano ID diversi. Esportalo dalla vecchia versione prima della sostituzione. Il nuovo storico è locale e non certificato.</p></details>\n<footer>Calcio AI 1.7 · Serie A e Champions + xG · Nessuna probabilità garantisce un esito. Probabilità euristiche da verificare sullo storico delle partite.</footer>\n</main><script>\n'use strict';\nconst UI_VERSION='1.7.0-af', HISTORY_KEY='calcioai_history_af_v15';\nconst $=s=>document.querySelector(s);\nconst esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[m]));\nconst numeric=x=>((typeof x==='number'||typeof x==='string'&&x.trim()!=='')&&Number.isFinite(Number(x)))?Number(x):null;\nconst num=(x,d=2)=>numeric(x)===null?'—':Number(x).toFixed(d);\nconst pct=x=>numeric(x)===null?'—':(Number(x)*100).toFixed(1)+'%';\nconst fmt=x=>Number.isFinite(Date.parse(x))?new Date(x).toLocaleString('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'non disponibile';\nconst dateRome=x=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x));\nconst validProbs=a=>a&&[a.p1,a.px,a.p2].every(p=>typeof p==='number'&&Number.isFinite(p)&&p>=0&&p<=1)&&Math.abs(a.p1+a.px+a.p2-1)<1e-6;\nlet recoveryTimer=null,recoveryTries=0,active=null,loadSeq=0,current=null,currentStale=false,history=[],storageOK=true;\nconst modelByFixture=new Map(),detailCache=new Map();\nfunction readStore(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}\nfunction writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;$('#storage-warning').textContent='Salvataggio locale non disponibile o spazio esaurito. Esporta lo storico per conservarlo.';return false;}}\nfunction validRecord(r){return r&&Number.isSafeInteger(r.id)&&r.id>0&&typeof r.version==='string'&&r.version.length<30&&typeof r.home==='string'&&typeof r.away==='string'&&r.home.length<150&&r.away.length<150&&Number.isFinite(Date.parse(r.kickoff))&&Number.isFinite(Date.parse(r.savedAt))&&Number.isFinite(Date.parse(r.generatedAt))&&Date.parse(r.generatedAt)<=Date.parse(r.savedAt)&&Date.parse(r.savedAt)<Date.parse(r.kickoff)&&validProbs(r.probs);}\nfunction cleanRecord(r){return {id:r.id,version:r.version,league:String(r.league||''),home:r.home,away:r.away,kickoff:r.kickoff,savedAt:r.savedAt,generatedAt:r.generatedAt,probs:{p1:r.probs.p1,px:r.probs.px,p2:r.probs.p2}};}\nfunction readHistory(){const rows=readStore(HISTORY_KEY);history=Array.isArray(rows)?rows.filter(validRecord).slice(0,2000):[];}\nfunction saveHistory(){writeStore(HISTORY_KEY,history);renderHistory();}\nfunction capture(j){\n  const now=Date.now(),generated=Date.parse(j.meta?.generatedAt);\n  if(!Number.isFinite(generated)||generated>now||now-generated>20*60000)return;\n  let changed=false;\n  for(const g of j.matches){\n    if(g.status!=='NS'||Date.parse(g.date)<=now||!validProbs(g.analysis)||g.analysis.insufficient)continue;\n    if(history.some(r=>r.id===g.id&&r.version===j.meta.version))continue;\n    if(history.length>=2000){$('#storage-warning').textContent='Storico pieno (2.000 pronostici). Esportalo; i record esistenti restano conservati.';break;}\n    history.push({id:g.id,version:j.meta.version,league:j.meta.leagueName,home:g.home.name,away:g.away.name,kickoff:g.date,savedAt:new Date(now).toISOString(),generatedAt:j.meta.generatedAt,probs:{p1:g.analysis.p1,px:g.analysis.px,p2:g.analysis.p2}});changed=true;\n  }\n  if(changed)saveHistory();\n}\nfunction abortError(){return new DOMException('Operazione interrotta','AbortError');}\nfunction delay(ms,signal){return new Promise((resolve,reject)=>{if(signal?.aborted)return reject(abortError());const onAbort=()=>{clearTimeout(t);reject(abortError());};const t=setTimeout(()=>{signal?.removeEventListener('abort',onAbort);resolve();},ms);signal?.addEventListener('abort',onAbort,{once:true});});}\nasync function requestJSON(url,signal,onProgress){\n  let quotaRetries=0;\n  for(let attempt=1;attempt<=20;attempt++){\n    if(signal?.aborted)throw abortError();\n    const ctl=new AbortController(),abort=()=>ctl.abort();signal?.addEventListener('abort',abort,{once:true});\n    const timer=setTimeout(()=>ctl.abort(),30000);let res,j;\n    try{res=await fetch(url,{signal:ctl.signal,cache:'no-store'});j=await res.json();}\n    catch(e){if(signal?.aborted)throw abortError();throw new Error(e.name==='AbortError'?'Tempo di attesa scaduto. Riprova: i dati già preparati restano in cache.':'Impossibile leggere la risposta del server. Riprova.');}\n    finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}\n    if(res.status===202&&j.code==='PREPARING'){onProgress?.(attempt,j.meta);await delay(2000,signal);continue;}\n    if(res.status===429&&j.code==='QUOTA'&&quotaRetries<3){quotaRetries++;for(let left=65;left>0;left--){onProgress?.(attempt,{...j.meta,retrySeconds:left});await delay(1000,signal);}continue;}\n    if(!res.ok||!j.ok)throw new Error(j.message||'Dati non disponibili.');\n    return j;\n  }\n  throw new Error('Preparazione ancora incompleta dopo 20 passaggi. Premi Aggiorna per riprendere.');\n}\nfunction validPayload(j){return j?.ok&&Array.isArray(j.matches)&&[UI_VERSION,'1.7.0-af-ucl'].includes(j.meta?.version);}\nasync function load(force=false){\n  clearTimeout(recoveryTimer);active?.abort();active=new AbortController();const ctl=active,seq=++loadSeq;\n  const league=$('#league').value,key='calcioai_af_v17_'+league,saved=readStore(key);\n  current=null;currentStale=false;modelByFixture.clear();$('#matches').innerHTML='';\n  $('#date').innerHTML='<option value=\"\">Tutti i prossimi 14 giorni</option>';\n  $('#refresh').disabled=true;$('#cancel').hidden=false;\n  const usable=validPayload(saved)&&Date.now()-Date.parse(saved.meta.generatedAt)<24*3600000;\n  if(usable){current=saved;currentStale=true;setDates();renderMatches();}\n  $('#status').textContent=usable?'Controllo aggiornamenti… Mostro intanto l’ultima copia salvata.':'Preparazione dei dati… Il primo caricamento può richiedere più passaggi.';\n  try{\n    if(!force&&usable&&saved.meta.dataRevision==='archive-context-2'&&!saved.meta.statisticsDeferred&&Date.now()-Date.parse(saved.meta.generatedAt)<60000){currentStale=false;showPayload(saved);return;}\n    const j=await requestJSON('/api/analyze?league='+encodeURIComponent(league),ctl.signal,(n,m)=>{if(seq!==loadSeq)return;$('#status').textContent=m?.retrySeconds?`Pausa richiesta da API-Football: ripresa automatica tra ${m.retrySeconds} secondi. I dati già scaricati restano conservati.`:`Preparazione, passaggio ${n}/20 · ${m?.cacheHits??0} risposte recuperate dalla cache in questo passaggio. Puoi interrompere o cambiare campionato.`;});\n    if(seq!==loadSeq)return;\n    if(!validPayload(j))throw new Error('Formato del pronostico non valido.');\n    writeStore(key,j);currentStale=false;showPayload(j);if(!j.meta.statisticsDeferred&&!j.meta.staleSource)capture(j);if(j.meta.statisticsDeferred&&recoveryTries<60){recoveryTries++;recoveryTimer=setTimeout(()=>load(true),65000);}else if(!j.meta.statisticsDeferred)recoveryTries=0;\n  }catch(e){if(seq!==loadSeq)return;$('#status').textContent=(e.name==='AbortError'?'Caricamento interrotto.':e.message)+(current?' Mostro una copia precedente: non usarla come aggiornamento attuale.':'');currentStale=!!current;renderMatches();}\n  finally{if(seq===loadSeq){$('#refresh').disabled=false;$('#cancel').hidden=true;}}\n}\nfunction showPayload(j){current=j;setDates();renderMatches();const m=j.meta;$('#status').textContent=`${j.matches.length} partite · xG ${m.xgAvailable??0}/${m.xgChecked??0} gare storiche${m.statisticsDeferred?' · Recupero automatico: '+(m.domesticPending?m.domesticPending+' squadre con campionato da caricare; ':'')+m.statisticsPending+' gare con statistiche da completare.':''} · Statistiche complete ${m.productionAvailable??0}/${m.xgChecked??0}${m.statisticsUnavailable?' · '+m.statisticsUnavailable+' gare con dati non forniti dal provider (ricontrollo fra 24 ore).':''} · ${m.persistentArchive?'Archivio persistente':'Archivio non disponibile'}${m.totalTeams!=null?' · Campionati identificati: '+m.domesticTeams+'/'+m.totalTeams+' squadre':''} · ${m.leagueName} · stagione ${m.season} · stima ${fmt(m.generatedAt)}. Dati scaricati da API-Football (lettura più vecchia): ${fmt(m.sourceUpdatedAt)}. Richieste effettive in questo passaggio: ${m.upstreamCalls??0}; risposte in cache: ${m.cacheHits??0}.${m.requestsRemaining!=null?' Quota residua osservata: '+m.requestsRemaining+'.':''}`;}\nfunction setDates(){const prev=$('#date').value,ds=[...new Set((current?.matches||[]).map(g=>dateRome(g.date)))].sort();$('#date').innerHTML='<option value=\"\">Tutti i prossimi 14 giorni</option>'+ds.map(d=>`<option value=\"${esc(d)}\">${esc(d.split('-').reverse().join('/'))}</option>`).join('');if(ds.includes(prev))$('#date').value=prev;}\nfunction metric(label,a,b){return `<div class=\"metric\"><b>${esc(label)}</b>${num(a)} <span class=\"muted\">/</span> ${num(b)}</div>`;}\nfunction logo(url){try{const u=new URL(url);return u.protocol==='https:'?`<img src=\"${esc(u.href)}\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\">`:'';}catch{return '';}}\nfunction renderMatches(){\n  const box=$('#matches');box.innerHTML='';if(!current)return;\n  const q=$('#search').value.trim().toLocaleLowerCase('it'),date=$('#date').value;\n  const rows=current.matches.filter(g=>(g.home.name+' '+g.away.name).toLocaleLowerCase('it').includes(q)&&(!date||dateRome(g.date)===date));\n  if(!rows.length){box.innerHTML='<div class=\"filter-empty\">'+(current.matches.length?'Nessuna partita corrisponde ai filtri.':'Nessuna partita non iniziata nei prossimi 14 giorni.')+'</div>';return;}\n  for(const g of rows){\n    const a=g.analysis||{},expired=Date.parse(g.date)<=Date.now(),id=Number(g.id);if(!Number.isSafeInteger(id))continue;modelByFixture.set(String(id),g);\n    const valid=validProbs(a)&&!a.insufficient,mx=valid?Math.max(a.p1,a.px,a.p2):null;\n    const header=`<div class=\"small\">${esc(fmt(g.date))} · ora italiana</div><div class=\"teams\"><div class=\"team\">${logo(g.home.logo)}<span>${esc(g.home.name)}</span></div><span class=\"muted\">–</span><div class=\"team\"><span>${esc(g.away.name)}</span>${logo(g.away.logo)}</div></div>`;\n    const warnings=(currentStale?'<p class=\"warning small\">Copia precedente: aggiornamento non verificato.</p>':'')+(expired?'<p class=\"warning small\">Orario di inizio superato: questa è una previsione prepartita, non live.</p>':'');\n    let body=valid?`<div class=\"grid\">${[['1',a.p1],['X',a.px],['2',a.p2]].map(([k,p])=>`<div class=\"prob ${p===mx?'best':''}\"><span>${k}</span><strong>${pct(p)}</strong></div>`).join('')}</div><span class=\"badge\">Qualità dati: ${esc(a.confidence||'non disponibile')}</span><span class=\"badge\">Preliminare · non validato</span><p class=\"notice\">${esc(a.reading||'')}</p><div class=\"metrics\">${metric('xG creati · media recente ponderata',a.xg?.home?.for,a.xg?.away?.for)}${metric('xG concessi · media recente ponderata',a.xg?.home?.against,a.xg?.away?.against)}</div><p class=\"small\">Copertura xG: ${esc(g.home.name)} ${a.xg?.home?.matches??0}/${a.xg?.home?.considered??0} gare · ${esc(g.away.name)} ${a.xg?.away?.matches??0}/${a.xg?.away?.considered??0} gare. ${a.xg?.applied?'Usati nella stima.':'Campione insufficiente: non usati nella stima.'}</p><div class=\"metrics\">${metric('Gol attesi dal modello · casa / ospite',a.lh,a.la)}<div class=\"metric\"><b>Gol / entrambe segnano</b>Over 2,5: ${pct(a.over)} · Goal: ${pct(a.btts)}</div></div>${renderSources(a.domestic,g,a.sourceStatus)}${renderComparison(a.leagueComparison)}${renderProduction(a.production,g)}<details><summary>Analisi completa e motivi</summary><p class=\"small\">Tutti i confronti: squadra di casa / squadra ospite.</p><h3>Dati osservati, stagione corrente</h3><div class=\"metrics\">${metric('Gol fatti per gara',a.observed?.home?.gfPerMatch,a.observed?.away?.gfPerMatch)}${metric('Gol subiti per gara',a.observed?.home?.gaPerMatch,a.observed?.away?.gaPerMatch)}${metric('Gol fatti in casa / trasferta',a.observed?.home?.venueGF,a.observed?.away?.venueGF)}${metric('Gol subiti in casa / trasferta',a.observed?.home?.venueGA,a.observed?.away?.venueGA)}${metric('Punti per gara',a.observed?.home?.ppg,a.observed?.away?.ppg)}${metric('Partite osservate',a.observed?.home?.matches,a.observed?.away?.matches)}</div><h3>Indicatori del modello</h3><div class=\"metrics\">${metric(a.domestic?'Elo nei rispettivi campionati · scale non confrontabili':'Elo domestico',a.homeElo,a.awayElo)}${metric('Forza strutturale · 1 = riferimento',a.homeStructural,a.awayStructural)}${metric('Forma residua · 0 = attesa Elo',a.homeForm,a.awayForm)}</div><p class=\"small\">${esc(a.method||'')}</p><ul class=\"explain\">${(a.explain||[]).map(t=>'<li>'+esc(t)+'</li>').join('')}</ul><p class=\"small\">${esc(a.note||'')}</p><h3>Altri esiti sui 90 minuti</h3>${[['Over 1,5',a.over15],['Under 1,5',a.under15],['Over 2,5',a.over],['Under 2,5',a.under],['Over 3,5',a.over35],['Under 3,5',a.under35],['Goal',a.btts],['No Goal',a.noBtts],['1X',a.dc1x],['12',a.dc12],['X2',a.dcx2]].map(([k,p])=>`<span class=\"tag\">${k} ${pct(p)}</span>`).join('')}<p class=\"small\">Draw No Bet, probabilità condizionate all’assenza di pareggio: casa ${pct(a.dnb1)}, ospite ${pct(a.dnb2)}. In caso di pareggio la puntata è rimborsata.</p><p class=\"small\">Risultati esatti più probabili: ${(a.scores||[]).map(s=>esc(s.score)+' '+pct(s.p)).join(' · ')}</p>${a.h2h?`<p class=\"small\">H2H nel solo campione già caricato: ${a.h2h.n}; vittorie casa / pareggi / ospite: ${a.h2h.homeWins} / ${a.h2h.draws} / ${a.h2h.awayWins}. Solo descrittivi. Apri «Contesto, motivazioni e scontri diretti» per la ricerca storica completa.</p>`:''}</details>`:`<div class=\"notice warning\">${esc(a.reason||'Dati insufficienti o probabilità non valide. Nessuna stima mostrata.')}</div>${renderSources(a.domestic,g,a.sourceStatus)}${renderComparison(a.leagueComparison)}${renderProduction(a.production,g)}`;\n    box.insertAdjacentHTML('beforeend',`<article class=\"match\">${header}${warnings}${body}<button class=\"detailbtn\" data-fixture=\"${id}\" aria-expanded=\"false\" aria-controls=\"details-${id}\">Contesto, motivazioni e scontri diretti</button><div id=\"details-${id}\" class=\"panel\" hidden></div></article>`);\n  }\n}\nasync function loadDetails(id,btn){\n  const panel=$('#details-'+id);if(!panel.hidden){panel.hidden=true;btn.setAttribute('aria-expanded','false');return;}\n  panel.hidden=false;btn.setAttribute('aria-expanded','true');btn.disabled=true;panel.textContent='Caricamento dettagli…';\n  try{let j=detailCache.get(id);if(!j||Date.now()-j.loadedAt>60000){j=await requestJSON('/api/details?fixture='+id,null,n=>{panel.textContent='Preparazione dettagli, passaggio '+n+'/20…';});j.loadedAt=Date.now();if(!(j.warnings||[]).length)detailCache.set(id,j);}renderDetails(panel,j,modelByFixture.get(id));}\n  catch(e){panel.textContent=e.message;}\n  finally{btn.disabled=false;}\n}\nfunction renderSources(d,f,status){if(!d)return '';return '<p class=\"notice\">Base domestica · '+esc(f.home.name)+': '+esc(d.home?d.home.name+' '+d.home.season:(status?.home==='unavailable'?'non identificato dal provider':'caricamento in corso'))+' · '+esc(f.away.name)+': '+esc(d.away?d.away.name+' '+d.away.season:(status?.away==='unavailable'?'non identificato dal provider':'caricamento in corso'))+'. xG, tiri e corner di seguito si riferiscono a questi campionati.</p>';}\nfunction renderProduction(p,f){\n  if(!p)return '';\n  const labels={shots:'Tiri totali',onTarget:'Tiri in porta',corners:'Corner'};\n  const cell=(side,key)=>{const m=side?.metrics?.[key],n=m?.matches??0,total=side?.considered??0;return n?`${num(m.for,1)} / ${num(m.against,1)}<br><span class=\\\"small\\\">${n}/${total} gare con dati</span>`:`—<br><span class=\\\"small\\\">0/${total} gare con dati</span>`;};\n  const table=(title,h,a)=>`<h3>${title}</h3><div class=\\\"tablewrap\\\"><table><thead><tr><th>Media per gara<br>Fatti / concessi</th><th>${esc(f.home.name)}</th><th>${esc(f.away.name)}</th></tr></thead><tbody>${Object.entries(labels).map(([key,label])=>`<tr><th>${label}</th><td>${cell(h,key)}</td><td>${cell(a,key)}</td></tr>`).join('')}</tbody></table></div>`;\n  return `<details class=\\\"production\\\"><summary>Tiri, tiri in porta e corner</summary><p class=\\\"small\\\">Dati osservati da API-Football. Medie semplici delle ultime 8 gare disponibili della stagione corrente, o meno se non ancora disputate. Ogni riga usa solo gare con il dato valido per entrambe le squadre; i valori mancanti sono esclusi, gli zeri sono conteggiati.</p>${table('Ultime gare · tutte le sedi',p.home?.overall,p.away?.overall)}${table('Solo gare del campione sopra: in casa per '+esc(f.home.name)+' · trasferta per '+esc(f.away.name),p.home?.venue,p.away?.venue)}<p class=\\\"small\\\">Sono medie storiche, non statistiche previste. Non modificano le probabilità del modello.</p></details>`;\n}\nfunction renderComparison(c){\n  if(!c||c.sameLeague)return '';\n  return `<p class=\"notice\">Confronto fra campionati: riferimento storico ${esc(c.year)}, ${esc(c.homeCountry)} n. ${esc(c.homeRank)} / ${esc(c.awayCountry)} n. ${esc(c.awayRank)}. <a href=\"https://kassiesa.net/uefa/data/method5/crank2025.html\" target=\"_blank\" rel=\"noopener noreferrer\">Fonte della classifica 2025</a>. Non è il ranking attuale né un rating dei club. Il peso applicato è una scelta euristica del modello, da validare.</p>`;\n}\nfunction renderDetails(panel,j){\n  const c=j.context,st=c?.standings;\n  const team=(row,name)=>row?`<h3>${esc(name)}</h3><p class=\"small\">Posizione ${esc(row.rank)} · ${esc(row.points)} punti · ${esc(row.played)} gare${row.group?' · '+esc(row.group):''}. ${row.gapToLeader!==null?'Distanza dalla capolista: '+esc(row.gapToLeader)+' punti.':''}${row.leaderPlayed!==null&&row.played!==row.leaderPlayed?' Numero di gare diverso dalla capolista: confronto provvisorio.':''}</p>${row.zone?'<p class=\"small\">Zona indicata dal provider: '+esc(row.zone)+'. Non certifica una qualificazione o retrocessione matematica.</p>':''}${row.interpretation?'<p class=\"notice\">Lettura possibile: '+esc(row.interpretation)+'</p>':''}<p class=\"small\">Aggiornamento classifica dichiarato dal provider: ${esc(fmt(row.updatedAt))}.</p>`:`<p class=\"small\">${esc(name)}: classifica non disponibile o ambigua.</p>`;\n  const h=j.h2h;\n  panel.innerHTML=`<h3>Contesto e motivazioni verificabili</h3><p class=\"small\">Fonte: API-Football · lettura ${esc(fmt(j.generatedAt))}. Fase: ${esc(c?.round||'non disponibile')}. ${st?esc(st.competition)+' · stagione '+esc(st.season):''}</p><p class=\"notice\">Classifica e fase del torneo sono fatti osservabili. La motivazione psicologica non è misurata: le letture qui sotto sono ipotesi, non notizie confermate. Questo contesto e gli H2H non modificano le percentuali. Assenze e formazioni non integrate.</p>${team(st?.home,j.home?.name)}${team(st?.away,j.away?.name)}<h3>Scontri diretti recenti</h3>${h?`<p class=\"small\">${esc(h.scope)}</p><p class=\"small\">${h.n} gare · vittorie ${esc(j.home?.name)}: ${h.homeWins} · pareggi: ${h.draws} · vittorie ${esc(j.away?.name)}: ${h.awayWins}.</p>${h.n?`<div class=\"tablewrap\"><table><thead><tr><th>Data</th><th>Competizione</th><th>Casa</th><th>90 minuti</th><th>Ospite</th></tr></thead><tbody>${h.matches.map(m=>`<tr><td>${esc(fmt(m.date))}</td><td>${esc(m.competition)}</td><td>${esc(m.home)}</td><td>${esc(m.score.home)}–${esc(m.score.away)}</td><td>${esc(m.away)}</td></tr>`).join('')}</tbody></table></div>`:'<p class=\"small\">Nessun precedente ufficiale restituito dal provider nel periodo richiesto.</p>'}`:'<p class=\"small\">Ricerca storica non disponibile: non equivale a zero precedenti.</p>'}${(j.warnings||[]).length?'<p class=\"warning small\">'+j.warnings.map(esc).join('<br>')+'</p>':''}`;\n}\nfunction historyMetrics(rows){\n  const done=rows.filter(r=>!r.excluded&&r.result&&Number.isInteger(r.result.home)&&Number.isInteger(r.result.away)&&r.result.home>=0&&r.result.away>=0&&validProbs(r.probs));\n  if(!done.length)return null;\n  let brier=0,loss=0,hits=0;const bins=Array.from({length:10},()=>({n:0,p:0,y:0}));\n  for(const r of done){const p=[r.probs.p1,r.probs.px,r.probs.p2],y=r.result.home>r.result.away?0:r.result.home===r.result.away?1:2,max=Math.max(...p),best=p.indexOf(max);if(best===y)hits++;loss-=Math.log(Math.max(1e-15,p[y]));p.forEach((v,i)=>{brier+=(v-(i===y?1:0))**2;const bin=bins[Math.min(9,Math.floor(v*10))];bin.n++;bin.p+=v;bin.y+=i===y?1:0;});}\n  return {n:done.length,brier:brier/done.length,loss:loss/done.length,hits:hits/done.length,bins};\n}\nfunction renderHistory(){\n  const versions=[...new Set(history.map(r=>r.version))];\n  let html=`<p class=\"small\">${history.length} pronostici registrati · ${history.filter(r=>r.excluded).length} esclusi per rinvio/cambio data o stato.</p>`;\n  for(const v of versions){const m=historyMetrics(history.filter(r=>r.version===v));if(!m)continue;html+=`<h3>Versione ${esc(v)} · ${m.n} partite concluse</h3><div class=\"metrics\"><div class=\"metric\"><b>Brier 1X2 · scala 0–2, più basso è meglio</b>${num(m.brier,3)}</div><div class=\"metric\"><b>Log loss · più bassa è meglio</b>${num(m.loss,3)}</div><div class=\"metric\"><b>Esito più probabile indovinato</b>${pct(m.hits)}</div><div class=\"metric\"><b>Riferimento uniforme 33,3% · Brier / log loss</b>0,667 / 1,099</div></div><p class=\"small\">Campione personale, non un test indipendente. Le partite vengono registrate quando apri la pagina; orizzonti previsionali diversi non sono direttamente confrontabili.</p><details><summary>Calibrazione per fasce (esiti 1, X e 2 aggregati)</summary><div class=\"tablewrap\"><table><tr><th>Fascia</th><th>Eventi</th><th>Probabilità media</th><th>Frequenza reale</th></tr>${m.bins.map((b,i)=>b.n?`<tr><td>${i*10}–${(i+1)*10}%</td><td>${b.n}</td><td>${pct(b.p/b.n)}</td><td>${pct(b.y/b.n)}</td></tr>`:'').join('')}</table></div><p class=\"small\">Tre eventi correlati per partita. Fasce poco popolate non consentono conclusioni affidabili.</p></details>`;}\n  if(!versions.some(v=>historyMetrics(history.filter(r=>r.version===v))))html+='<p class=\"small\">Servono pronostici registrati e risultati verificati per mostrare le misure.</p>';\n  $('#history-summary').innerHTML=html;\n  $('#history-table').innerHTML='<table><thead><tr><th>Partita</th><th>Inizio</th><th>Registrato</th><th>1 / X / 2</th><th>Esito</th></tr></thead><tbody>'+[...history].reverse().slice(0,100).map(r=>`<tr><td>${esc(r.home)} – ${esc(r.away)}<br><span class=\"small\">${esc(r.version)}</span></td><td>${esc(fmt(r.kickoff))}</td><td>${esc(fmt(r.savedAt))}</td><td>${pct(r.probs.p1)} / ${pct(r.probs.px)} / ${pct(r.probs.p2)}</td><td>${r.excluded?esc(r.excluded):r.result?esc(r.result.home+'–'+r.result.away):'Da verificare'}</td></tr>`).join('')+'</tbody></table><p class=\"small\">Mostrati gli ultimi 100; l’esportazione contiene tutti i record.</p>';\n}\nasync function checkResults(){\n  const button=$('#check-results'),st=$('#history-status');const ids=[...new Set(history.filter(r=>!r.result&&!r.excluded&&Date.parse(r.kickoff)<Date.now()-2*3600000).sort((a,b)=>(Date.parse(a.lastCheckedAt)||0)-(Date.parse(b.lastCheckedAt)||0)).map(r=>r.id))].slice(0,20);\n  if(!ids.length){st.textContent='Nessun risultato da verificare. La verifica si attiva due ore dopo l’orario previsto.';return;}\n  button.disabled=true;st.textContent='Verifica di '+ids.length+' partite…';\n  try{const j=await requestJSON('/api/results?ids='+ids.join(','),null,n=>{st.textContent='Preparazione risultati, passaggio '+n+'/20…';});\n    for(const r of history)if(ids.includes(r.id))r.lastCheckedAt=j.meta.generatedAt;\n    for(const f of j.results)for(const r of history.filter(r=>r.id===f.id&&!r.result&&!r.excluded)){\n      if(Date.parse(f.date)!==Date.parse(r.kickoff)){r.excluded='Data modificata';continue;}\n      if(['CANC','PST','ABD','AWD','WO'].includes(f.status)){r.excluded='Stato '+f.status;continue;}\n      if(['FT','AET','PEN'].includes(f.status)&&f.score&&Number.isInteger(f.score.home)&&Number.isInteger(f.score.away)&&f.score.home>=0&&f.score.away>=0){r.result=f.score;r.verifiedAt=j.meta.generatedAt;}\n    }saveHistory();st.textContent='Verifica completata. Per più di 20 partite, premi di nuovo Verifica risultati.';\n  }catch(e){st.textContent=e.message;}finally{button.disabled=false;}\n}\nfunction exportHistory(){const blob=new Blob([JSON.stringify({format:'calcioai-history',schema:1,exportedAt:new Date().toISOString(),records:history},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='calcio-ai-storico-'+dateRome(new Date())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}\nasync function importHistory(event){const file=event.target.files[0];if(!file)return;try{if(file.size>5e6)throw new Error('File troppo grande.');const j=JSON.parse(await file.text());if(j.format!=='calcioai-history'||j.schema!==1||!Array.isArray(j.records)||!j.records.every(r=>validRecord(r)&&['1.5.0-af','1.6.0-af-ucl','1.7.0-af','1.7.0-af-ucl'].includes(r.version))||j.records.length>2000)throw new Error('Importa soltanto uno storico Calcio AI API-Football (versioni 1.5, 1.6 o 1.7). Lo storico 1.4 usa ID diversi e resta separato.');let added=0;for(const r of j.records){if(history.length>=2000)break;if(!history.some(x=>x.id===r.id&&x.version===r.version)){history.push(cleanRecord(r));added++;}}saveHistory();$('#history-status').textContent=added+' pronostici importati. I risultati importati sono ignorati: verificali nuovamente con il provider.';}catch(e){$('#history-status').textContent=e.message;}finally{event.target.value='';}}\n$('#refresh').addEventListener('click',()=>load(true));$('#league').addEventListener('change',()=>{recoveryTries=0;load();});$('#cancel').addEventListener('click',()=>{clearTimeout(recoveryTimer);active?.abort();});$('#search').addEventListener('input',renderMatches);$('#date').addEventListener('change',renderMatches);$('#matches').addEventListener('click',e=>{const btn=e.target.closest('button[data-fixture]');if(btn)loadDetails(btn.dataset.fixture,btn);});$('#check-results').addEventListener('click',checkResults);$('#export-history').addEventListener('click',exportHistory);$('#import-history').addEventListener('change',importHistory);\nreadHistory();renderHistory();load();\n</script></body></html>\n";
