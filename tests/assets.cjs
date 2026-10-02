const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assets=JSON.parse(fs.readFileSync(path.join(root,'images/manifest.json'),'utf8'));
assert.equal(assets.length,301);assert(!html.includes('data:image/'));
for(const a of assets){
 const f=path.resolve(root,a.path.replace(/^sam\//,''));assert(f.startsWith(root+path.sep));const bytes=fs.readFileSync(f);
 assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256,a.path);
}
for(const key of ['IMG','IMGL']){
 const map=JSON.parse(html.match(new RegExp('var '+key+'=(\{[^\n]+\});'))[1]);
 for(const file of Object.values(map))assert(fs.existsSync(path.join(root,file)),file);
}
const base='https://example.test/sam-atelier/sam.webmanifest';
const m=JSON.parse(fs.readFileSync(path.join(root,'sam.webmanifest'),'utf8'));
assert.equal(new URL(m.id,base).href,'https://example.test/sam-atelier/');
const start=new URL(m.start_url,base);assert.equal(start.pathname,'/sam-atelier/index.html');
assert(start.href.startsWith(new URL(m.scope,base).href));
for(const icon of m.icons)assert(fs.existsSync(path.join(root,icon.src)));
assert(html.includes('var SAVE_URL="data-sam/save.json"'));assert(fs.existsSync(path.join(root,'data-sam/save.json')));
const scripts=s=>Array.from(s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g),m=>m[1]);
for(const script of scripts(html))new vm.Script(script);
// file:// 로 옛 페이지에서 넘겨받은 저장값을 들인다. 새 자리에 이미 있는 값은 덮지 않는다
const keys=['samgukji_draft_rec_v1','samgukji_draft_cfg_v1','samgukji_draft_game_v2','samgukji_mark_v1'];
const data=Object.fromEntries(keys.map((k,i)=>[k,JSON.stringify({test:i})]));
const u=new URL('file:///games/sam-atelier/index.html?local=1#sam-transfer='+encodeURIComponent(JSON.stringify(data)));
const restored={};let cleaned;
function importSave(){vm.runInNewContext(scripts(html)[0],{location:{protocol:u.protocol,hash:u.hash,pathname:u.pathname,search:u.search},history:{replaceState:(_,__,v)=>cleaned=v},localStorage:{getItem:k=>restored[k],setItem:(k,v)=>restored[k]=v}})}
importSave();assert.deepEqual(restored,data);assert.equal(cleaned,'/games/sam-atelier/index.html?local=1');
restored[keys[0]]=JSON.stringify({newer:true});importSave();assert.equal(restored[keys[0]],JSON.stringify({newer:true}));
console.log('PASS: 301 image hashes, image/manifest/backup paths, scripts, local save transfer');
