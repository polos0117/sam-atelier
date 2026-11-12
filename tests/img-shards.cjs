/* 그림 주소·등록기·워크플로·.gitignore 가 같은 저장소 차례를 말하나. game-atelier 의 같은 검사에서 왔다(2026-10-30).
   Run: node tests/img-shards.cjs
   - 등록된 파일의 원본·썸네일 주소가 BASES[0] + 파일 이름(where 에 적힌 것만 다른 저장소)
   - lib/img.js 의 BASES · tools/register-images.py 의 SHARDS · 워크플로가 받는 저장소 · .gitignore · tools/img-repos.cjs · tools/casual-check.py 가 같은 차례
   - 한 장수의 그림이 두 저장소에 나뉘어도 where 로 파일마다 제 주소(2026-11-12) */
const fs = require('node:fs'), vm = require('node:vm');
const assert = require('node:assert/strict');

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/img.js', 'utf8'), ctx);
const A = ctx.window.AtelierImg;
const doc = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
// 세계 그림은 byForm 안에 있다(samguk · fantasy · mecha). 연출컷은 없다
const files = [...new Set(Object.values(doc.img).flatMap(e => A.allShotsOf(e).concat(
  ...Object.values(A.styleMap(e)).flatMap(b => Object.values(A.formMap(b)).flatMap(f => [f.f, f.m]))
)).filter(Boolean))];

const FIRST = 'https://polos0117.github.io/sam-atelier-img/img/';
const enc = f => encodeURIComponent(f).replace(/'/g, '%27');
A.setShards(doc);
assert.equal(A.BASE, FIRST);
for (const f of files.concat(['fe_fantasy_game_keyart_f.webp'])) {
  if ((doc.where || {})[f]) continue;
  assert.equal(A.imgURL(f), FIRST + enc(f), f);
  assert.equal(A.thumbURL(f), FIRST + 'thumb/' + enc(f), f);
}
for (const [f, i] of Object.entries(doc.where || {}))
  assert(Number.isInteger(i) && i > 0 && i < A.BASES.length, f + ' 의 저장소 번호 ' + i);
/* 한 장수의 그림이 두 저장소에 나뉘어도(2026-11-12 — 옛 그림은 0 번, 새 그림은 1 번) 파일마다 where 로 제 주소를 찾는다.
   where 에 없는 이름 · 0 번 · 틀린 번호는 0 번 주소 */
{
  const SECOND = 'https://polos0117.github.io/sam-atelier-img-2/img/', a = '관우_samguk_api25_f.webp', b = '관우_samguk_api25_f_casual1.webp';
  A.setShards({ where: { [b]: 1, 'x.webp': 9, 'y.webp': 0 } });
  assert.equal(A.imgURL(a), FIRST + enc(a)); assert.equal(A.imgURL(b), SECOND + enc(b)); assert.equal(A.thumbURL(b), SECOND + 'thumb/' + enc(b));
  assert.equal(A.imgURL('x.webp'), FIRST + 'x.webp'); assert.equal(A.imgURL('y.webp'), FIRST + 'y.webp');
  A.setShards(doc);
}

const py = fs.readFileSync('tools/register-images.py', 'utf8');
const SHARDS = JSON.parse(py.match(/^SHARDS = (\[.*\])$/m)[1]);
const EXTRA = JSON.parse(py.match(/^EXTRA_DIRS = (\[.*\])$/m)[1]);
assert.equal(SHARDS.length, A.BASES.length, '저장소 수');
SHARDS.forEach((s, i) => assert.equal(A.BASES[i], 'https://polos0117.github.io/' + s + '/img/', i + ' 번 저장소'));
assert.deepEqual(EXTRA, SHARDS.slice(1).map((_, i) => 'img-' + (i + 2)), '둘째부터의 자리 이름은 img-N');
const wf = fs.readFileSync('.github/workflows/register-images.yml', 'utf8');
SHARDS.forEach((s, i) => {
  const path = i ? 'img-repo-' + (i + 1) : 'img-repo';
  assert(new RegExp('repository: polos0117/' + s + '\\s*\\n\\s*path: ' + path + '\\b').test(wf), s + ' 를 ' + path + ' 로 받는다');
  assert(wf.includes('ln -s ' + path + '/img ' + (i ? EXTRA[i - 1] : 'img')), path + ' 를 잇는다');
});
/* 도구 쪽 차례 — tools/img-repos.cjs(Node 도구) · tools/casual-check.py 의 REPOS 도 같은 차례. 마지막이 열린 저장소, 0 번이 자동화 상태 */
const R = require('../tools/img-repos.cjs');
assert.deepEqual(R.REPOS, SHARDS, 'tools/img-repos.cjs 차례'); assert.equal(R.OPEN, SHARDS[SHARDS.length - 1]); assert.equal(R.STATE, SHARDS[0]);
const cc = fs.readFileSync('tools/casual-check.py', 'utf8').match(/^REPOS = (\[.*\])$/m);
assert(cc && JSON.stringify(JSON.parse(cc[1])) === JSON.stringify(SHARDS), 'tools/casual-check.py 의 REPOS 차례');
const ignore = fs.readFileSync('.gitignore', 'utf8').split(/\r?\n/);
for (const d of ['img', ...EXTRA]) assert(ignore.includes('/' + d), d + ' 는 올리지 않는다');
console.log(`PASS 그림 저장소: 등록 ${files.length}개 주소 · where 로 둘째 저장소 · BASES=SHARDS=워크플로=.gitignore=img-repos=casual-check`);
