const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const TEST_NOW=Date.parse('2026-10-21T07:00:00Z');
class TestDate extends Date {constructor(...args){super(...(args.length?args:[TEST_NOW]));}static now(){return TEST_NOW;}}
function load(file){
 const source=fs.readFileSync(file,'utf8').replace('export class CalcioArchive','class CalcioArchive').replace('export default {','const worker = {');
 const context=vm.createContext({Request,Response,URL,console,Date:TestDate,setTimeout,clearTimeout,TextEncoder,crypto:globalThis.crypto});
 vm.runInContext(source+`;globalThis.app={competitionData,europeanPrediction,analyzeEurope,analyze,predictXG,model,completed,h2hStats,buildElo,avg,leagueBase,CalcioArchive,INDEX_HTML,worker,${file.includes('original')?'':'leagueComparison,associationRank,scopedArchive,LEAGUES,'}VERSION,EURO_VERSION};`,context);
 return context.app;
}
const app=load('worker.js'),old=fs.existsSync('original-worker.js')?load('original-worker.js'):null;
let fid=1;
function fixture(home,away,hg,ag,date='2026-09-01T18:00:00Z',extra={}){
 return {fixture:{id:fid++,date,status:{short:'FT'}},teams:{home:{id:home,name:'Team '+home},away:{id:away,name:'Team '+away}},league:{id:135,name:'Serie A',season:2026,round:'Regular Season - 8'},goals:{home:hg,away:ag},score:{fulltime:{home:hg,away:ag}},...extra};
}
function dataset(id,country,team,dominant=false,xg=false){
 const cf=Array.from({length:16},(_,i)=>{const home=i%2===0;const f=fixture(home?team:team+100+i,home?team+100+i:team,home?(dominant?4:2):1,home?1:(dominant?4:1),`2026-09-${String(i+1).padStart(2,'0')}T18:00:00Z`);f.league={id,name:country+' League',season:2026};if(xg)f.xg={home:home?4:1,away:home?1:4};return f;});
 return {id,name:country+' League',country,season:2026,all:cf,cf,pf:[],curAvg:app.avg(cf),prevAvg:app.avg([]),curBase:app.leagueBase(cf),prevBase:app.leagueBase([]),elo:app.buildElo(cf)};
}
const f=fixture(1,2,null,null,'2026-11-01T18:00:00Z');f.fixture.status.short='NS';f.league={id:2,name:'Champions League',season:2026};
const euro={cf:[],curAvg:{home:1.45,away:1.2},elo:app.buildElo([])};
function valid(a){for(const k of ['p1','px','p2','over','btts'])assert.ok(Number.isFinite(a[k])&&a[k]>=0&&a[k]<=1,k);assert.ok(Math.abs(a.p1+a.px+a.p2-1)<1e-10);}
test('Champions: dominant weaker-league club no longer outranks average top-league club merely on domestic wins',()=>{
 const h=dataset(419,'Azerbaijan',1,true),a=dataset(78,'Germany',2);
 const p=app.europeanPrediction(f,h,a,euro).analysis;valid(p);assert.ok(p.p2>p.p1);
 if(old){const before=old.europeanPrediction(f,h,a,euro).analysis;assert.ok(before.p1>before.p2);console.log('Synthetic cross-league regression (NOT actual Sabah data)',{before:before.p1,after:p.p1,away:p.p2});}
});
test('xG branch cannot undo cross-league correction',()=>{
 const p=app.europeanPrediction(f,dataset(419,'Azerbaijan',1,true,true),dataset(78,'Germany',2,false,true),euro).analysis;valid(p);assert.ok(p.xg.applied);assert.ok(p.p2>p.p1);
});
test('league prior is monotonic, reciprocal and bounded; no club-name rules',()=>{
 for(const country of ['England','Germany','Portugal','Azerbaijan','San Marino']){
  const a=app.leagueComparison({id:1,country},{id:2,country:'Germany'},f.fixture.date),b=app.leagueComparison({id:2,country:'Germany'},{id:1,country},f.fixture.date);
  assert.ok(Math.abs(a.ratio*b.ratio-1)<1e-10);assert.ok(a.ratio>=1/2.2&&a.ratio<=2.2);
 }
 assert.equal(app.associationRank('Turkey'),10);assert.equal(app.associationRank('Azerbaijan'),30);
 const renamed=structuredClone(f);renamed.teams.home.name='Dortmund';renamed.teams.away.name='Sabah';
 assert.equal(app.europeanPrediction(renamed,dataset(419,'Azerbaijan',1,true),dataset(78,'Germany',2),euro).analysis.p1,app.europeanPrediction(f,dataset(419,'Azerbaijan',1,true),dataset(78,'Germany',2),euro).analysis.p1);
});
test('unknown or expired cross-league reference abstains instead of equal-league fallback',()=>{
 const h=dataset(419,'Unknown',1,true),a=dataset(78,'Germany',2);
 assert.equal(app.europeanPrediction(f,h,a,euro).analysis.insufficient,true);
 h.country='Azerbaijan';const future=structuredClone(f);future.fixture.date='2027-07-01T00:00:00Z';assert.equal(app.europeanPrediction(future,h,a,euro).analysis.insufficient,true);
 const past=structuredClone(f);past.fixture.date='2025-06-01T00:00:00Z';assert.equal(app.europeanPrediction(past,h,a,euro).analysis.insufficient,true);
 assert.equal(app.leagueComparison(h,h,f.fixture.date).ratio,1);
});
test('Serie A numerical forecasts unchanged',{skip:!old},()=>{
 if(!old)return;
 const d=dataset(135,'Italy',1,true,true),other=dataset(135,'Italy',2,false,true);d.cf.push(...other.cf);d.elo=app.buildElo(d.cf);
 const a=app.predictXG(f,d).analysis,b=old.predictXG(f,d).analysis;
 for(const k of ['p1','px','p2','lh','la','over','btts'])assert.equal(a[k],b[k]);
});
test('H2H: ten recent official matches, unique IDs, reversed venues, 90-minute AET/PEN, missing/future/friendly excluded',()=>{
 const rows=Array.from({length:12},(_,i)=>fixture(i%2?2:1,i%2?1:2,2,0,`2025-${String(i+1).padStart(2,'0')}-01T00:00:00Z`));
 const pen=fixture(2,1,5,4,'2026-01-01T00:00:00Z');pen.fixture.status.short='PEN';pen.score.fulltime={home:1,away:1};rows.push(pen,pen);
 const noFT=fixture(1,2,3,2,'2026-02-01T00:00:00Z');noFT.fixture.status.short='AET';noFT.score={};rows.push(noFT);
 rows.push(fixture(1,2,9,0,'2026-03-01T00:00:00Z',{league:{name:'Friendlies Clubs'}}),fixture(1,2,8,0,'2028-01-01T00:00:00Z'),fixture(1,2,8,0,'2019-01-01T00:00:00Z'),fixture(1,1,8,0),fixture(1,3,8,0));
 const h=app.h2hStats(rows,1,2,Date.parse('2026-10-21T00:00:00Z'));
 assert.equal(h.n,10);assert.equal(h.draws,1);assert.equal(new Set(h.matches.map(x=>x.id)).size,10);assert.equal(h.matches[0].score.home,1);assert.equal(h.matches[0].score.away,1);assert.equal(h.homeWins+h.awayWins+h.draws,h.n);
});
test('old durable snapshot is not served after model revision',async()=>{
 const values=new Map([['snapshot',{ok:true,matches:[{old:true}],meta:{dataRevision:'archive-ucl-1',generatedAt:new Date().toISOString()}}]]);
 const storage={get:async k=>values.get(k),put:async(k,v)=>values.set(k,v),delete:async k=>values.delete(k),getAlarm:async()=>null,setAlarm:async()=>{},deleteAlarm:async()=>{}};
 const archive=new app.CalcioArchive({storage},{});const response=await archive.fetch(new Request('https://example.test/api/analyze?league=135'));const b=await response.json();assert.equal(b.code,'CONFIG');assert.equal(b.matches,undefined);
});
test('public UI keeps forecasts and removes the external-context panel',async()=>{
 const response=await app.worker.fetch(new Request('https://example.test/'),{}),html=await response.text();
 assert.equal(response.status,200);new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
 assert.match(html,/Analisi completa e motivi/);assert.doesNotMatch(html,/Classifica e scontri diretti|data-fixture|api\/details|loadDetails|detailLoads|modelByFixture/);
});
test('removed details endpoint is rejected before provider access',async()=>{
 const response=await app.worker.fetch(new Request('https://example.test/api/details?fixture=1550158'),{});
 assert.equal(response.status,404);assert.equal((await response.json()).code,'INPUT');
});
test('Champions recovery keeps 7–23 hour calendars across alternating passes, expires after 24 hours',async()=>{
 for(const hours of [7,23,25]){
  const values=new Map(),payloads=new Map();
  const add=(path,data)=>{payloads.set(path,data);values.set('api:'+path,{data,fetchedAt:new Date(TEST_NOW-hours*3600000).toISOString(),expiresAt:TEST_NOW-1000});};
  for(const id of [135,39,140,78,61,94,88])add('/leagues?id='+id+'&current=true',{response:[]});
  const meta=(id,country)=>({league:{id,name:country+' League',type:'League'},country:{name:country},seasons:[{current:true,year:2026}]});
  for(const [id,country,team] of [[103,'Norway',1],[218,'Austria',2]]){
   add('/leagues?team='+team+'&current=true',{response:[meta(id,country)]});
   add('/leagues?id='+id+'&current=true',{response:[meta(id,country)]});
   add('/fixtures?league='+id+'&season=2026',{response:dataset(id,country,team).all});
  }
  const storage={get:async k=>Array.isArray(k)?new Map(k.map(x=>[x,values.get(x)])):values.get(k),put:async(k,v)=>values.set(k,v)};
  for(const turn of [0,1]){
   values.set('uclRecoveryTurn',turn);
   const client={storage,stats:{cacheHits:0},get:async path=>{
    if(path==='/leagues?id=2&current=true')return {response:[meta(2,'World')]};
    if(path==='/fixtures?league=2&season=2026')return {response:[f]};
    if(hours<24&&payloads.has(path))return structuredClone(payloads.get(path));
    throw Object.assign(new Error('quota'),{code:'QUOTA'});
   }};
   const result=await app.analyzeEurope(client);
   assert.equal(result.meta.domesticTeams,hours<24?2:0,`age ${hours}, turn ${turn}`);
   if(hours<24){valid(result.matches[0].analysis);if(turn===1)assert.equal(client.stats.staleSource,true);}
  }
 }
});

test('each added domestic league uses its own season, fixtures and domestic model',async()=>{
 for(const [id,name] of [[39,'Premier League'],[78,'Bundesliga'],[140,'La Liga'],[61,'Ligue 1']]){
  const d=dataset(id,'Country',1),other=dataset(id,'Country',2);const past=[...d.cf,...other.cf];
  for(const g of past)g.league={id,name,season:2026};
  const next=fixture(1,2,null,null,'2026-11-01T18:00:00Z',{league:{id,name,season:2026}});next.fixture.status.short='NS';
  const paths=[],client={get:async path=>{paths.push(path);if(path==='/leagues?id='+id+'&current=true')return {response:[{league:{id,name},seasons:[{current:true,year:2026}]}]};if(path==='/fixtures?league='+id+'&season=2026')return {response:[...past,next]};if(path.startsWith('/fixtures?ids=')||path.startsWith('/fixtures/statistics?'))return {response:[]};throw Error(path);}};
  const j=await app.analyze(client,String(id));assert.equal(j.meta.leagueId,id);assert.equal(j.meta.leagueName,name);assert.equal(j.matches.length,1);valid(j.matches[0].analysis);assert.ok(j.matches[0].analysis.explain.some(x=>x.includes(name)));assert.ok(paths.every(p=>!p.includes('league=135')&&!p.includes('league=2')));
 }
});
test('all competition snapshots are isolated and recovery includes new leagues while throttle is shared',async()=>{
 const rows=new Map(),storage={get:async k=>rows.get(k),put:async(k,v)=>rows.set(k,v),delete:async k=>rows.delete(k)};
 for(const id of Object.keys(app.LEAGUES).map(Number)){
  const scoped=app.scopedArchive(storage,id);await scoped.put('snapshot',{league:id});await scoped.put('recovery',{until:TEST_NOW+100000,attempts:0});await scoped.put('lastAttempt',{upstreamAt:new Date(TEST_NOW-id*1000).toISOString()});await scoped.put('throttle',{shared:id});
 }
 for(const id of Object.keys(app.LEAGUES).map(Number))assert.equal((await app.scopedArchive(storage,id).get('snapshot')).league,id);
 const archive=new app.CalcioArchive({storage},{});assert.deepEqual(Array.from(await archive.jobs(),j=>j.league).sort((a,b)=>a-b),[2,39,61,78,135,140]);
 assert.equal([...rows.keys()].filter(k=>k.includes('throttle')).length,1);
});
test('UI offers six competitions and rejects cached data from a different league',()=>{
 const js=app.INDEX_HTML.match(/<script>([\s\S]*?)<\/script>/)[1],ctx=vm.createContext({document:{querySelector:()=>({})},Intl,Date,URL,console});
 vm.runInContext(js.slice(0,js.indexOf("$('#refresh').addEventListener"))+';globalThis.valid=validPayload;',ctx);
 for(const id of [135,39,78,140,61,2])assert.ok(app.INDEX_HTML.includes('option value="'+id+'"'));
 const j={ok:true,matches:[],meta:{version:'1.7.0-af',leagueId:39}};assert.equal(ctx.valid(j,'39'),true);assert.equal(ctx.valid(j,'135'),false);
});

test('recovery rotates blocked leagues and prioritizes a missing calendar over statistics',async()=>{
 const rows=new Map(),storage={get:async k=>rows.get(k),put:async(k,v)=>rows.set(k,v)};
 for(const id of [39,78,140])await app.scopedArchive(storage,id).put('recovery',{until:TEST_NOW+10000,attempts:0});
 await app.scopedArchive(storage,39).put('lastAttempt',{at:new Date(TEST_NOW).toISOString(),upstreamAt:null});
 await app.scopedArchive(storage,140).put('lastAttempt',{at:new Date(TEST_NOW-1000).toISOString(),upstreamAt:null});
 await app.scopedArchive(storage,78).put('snapshot',{ok:true});
 const archive=new app.CalcioArchive({storage},{});assert.deepEqual(Array.from(await archive.jobs(),j=>j.league),[140,39,78]);
});
