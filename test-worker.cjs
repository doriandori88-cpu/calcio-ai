const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const TEST_NOW=Date.parse('2026-10-21T07:00:00Z');
class TestDate extends Date {constructor(...args){super(...(args.length?args:[TEST_NOW]));}static now(){return TEST_NOW;}}
function load(file){
 const source=fs.readFileSync(file,'utf8').replace('export class CalcioArchive','class CalcioArchive').replace('export default {','const worker = {');
 const context=vm.createContext({Request,Response,URL,console,Date:TestDate,setTimeout,clearTimeout,TextEncoder,crypto:globalThis.crypto});
 vm.runInContext(source+`;globalThis.app={competitionData,europeanPrediction,analyzeEurope,analyze,predictXG,model,completed,h2hStats,details,buildElo,avg,leagueBase,CalcioArchive,INDEX_HTML,worker,${file.includes('original')?'':'standingsContext,leagueComparison,associationRank,'}VERSION,EURO_VERSION};`,context);
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
function standingPayload(){return {response:[{league:{id:2,name:'Champions League',season:2026,standings:[[{team:{id:1},rank:2,points:7,all:{played:3},update:'2026-10-21T00:00:00Z'},{team:{id:2},rank:1,points:9,all:{played:4},description:'Promotion'}]]}}]};}
test('context uses correct league/season/group and observed points; ambiguous rows withheld',()=>{
 const p=standingPayload(),c=app.standingsContext(p,f);assert.equal(c.home.gapToLeader,2);assert.equal(c.home.played,3);assert.equal(c.home.leaderPlayed,4);assert.match(c.home.interpretation,/possibile incentivo/);
 p.response[0].league.standings.push(p.response[0].league.standings[0]);assert.equal(app.standingsContext(p,f).home,null);
 p.response[0].league.season=2025;assert.equal(app.standingsContext(p,f),null);
});
test('details fetch dedicated history and standings; optional failure is not zero history',async()=>{
 const paths=[];const client={get:async path=>{paths.push(path);if(path.startsWith('/fixtures?id='))return {response:[f]};if(path.startsWith('/standings'))return standingPayload();if(path.startsWith('/fixtures/headtohead?'))return {response:[fixture(2,1,0,2)]};throw Error(path);}};
 const d=await app.details(client,f.fixture.id);assert.equal(paths.length,3);assert.match(paths[2],/h2h=1-2&from=\d{4}-\d{2}-\d{2}&to=/);assert.equal(d.h2h.n,1);assert.equal(d.h2h.homeWins,1);assert.equal(d.affectsPrediction,false);
 const broken={get:async path=>path.startsWith('/fixtures/headtohead?')?Promise.reject(Object.assign(new Error('quota'),{code:'QUOTA'})):client.get(path)};
 const fail=await app.details(broken,f.fixture.id);assert.equal(fail.h2h,null);assert.ok(fail.warnings.length);assert.ok(fail.context.standings);
});
test('past match does not receive present-day standings',async()=>{
 const past=fixture(1,2,1,0);past.league=f.league;const paths=[];
 const d=await app.details({get:async path=>{paths.push(path);return {response:path.startsWith('/fixtures?id=')?[past]:[]};}},past.fixture.id);
 assert.ok(paths.every(x=>!x.startsWith('/standings')));assert.equal(d.context.standings,null);
});
test('old durable snapshot is not served after model revision',async()=>{
 const values=new Map([['snapshot',{ok:true,matches:[{old:true}],meta:{dataRevision:'archive-ucl-1',generatedAt:new Date().toISOString()}}]]);
 const storage={get:async k=>values.get(k),put:async(k,v)=>values.set(k,v),delete:async k=>values.delete(k),getAlarm:async()=>null,setAlarm:async()=>{},deleteAlarm:async()=>{}};
 const archive=new app.CalcioArchive({storage},{});const response=await archive.fetch(new Request('https://example.test/api/analyze?league=135'));const b=await response.json();assert.equal(b.code,'CONFIG');assert.equal(b.matches,undefined);
});
test('HTML JavaScript parses and detail renderer escapes provider text',()=>{
 const js=app.INDEX_HTML.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(js);
 const ctx=vm.createContext({document:{querySelector:()=>({})},Intl,Date,URL,console});
 vm.runInContext(js.slice(0,js.indexOf("$('#refresh').addEventListener"))+';globalThis.render=renderDetails;globalThis.checkPayload=validPayload;',ctx);
 const panel={};ctx.render(panel,{context:{round:'<img src=x onerror=alert(1)>'},home:{name:'A'},away:{name:'B'},warnings:['<script>'],h2h:null,generatedAt:new Date().toISOString()});
 assert.ok(!panel.innerHTML.includes('<img'));assert.ok(panel.innerHTML.includes('&lt;img'));assert.ok(panel.innerHTML.includes('non equivale a zero'));
 assert.equal(ctx.checkPayload({ok:true,matches:[],meta:{version:'1.6.0-af-ucl'}}),false);assert.equal(ctx.checkPayload({ok:true,matches:[],meta:{version:'1.7.0-af-ucl'}}),true);
});
test('public Worker serves updated UI without needing API secrets',async()=>{
 const response=await app.worker.fetch(new Request('https://example.test/'),{});assert.equal(response.status,200);assert.match(await response.text(),/Contesto, motivazioni e scontri diretti/);
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
