// 새 판(draft2) 장수 자료 검사 — data/draft2-generals.json
// 그림 설계표의 장수와 같은 279명인지, 갈래 · 기질이 큰 역할과 맞는지, 능력치 범위.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(root, 'data/draft2-generals.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(root, 'data/sam-design.json'), 'utf8'));
const role = Object.fromEntries(S.generals.map(g => [g.key, g.role]));
assert.deepStrictEqual(D.generals.map(g => g.key), S.generals.map(g => g.key), '설계표와 같은 장수 · 같은 차례');
for (const g of D.generals) {
  for (const k of ['lead', 'war', 'int', 'pol']) {
    const v = g.stats[k];
    assert(Number.isInteger(v) && v >= 1 && v <= 100, `${g.key} ${k}=${v}`);
  }
  if (role[g.key] === 'lord') {
    assert(!g.class && !g.sub, `${g.key}: 군주는 갈래 없이`);
    assert(D.traits[g.trait], `${g.key}: 군주 기질 ${g.trait}`);
  } else {
    assert(!g.trait, `${g.key}: 기질은 군주만`);
    const c = D.classes[g.class];
    assert(c, `${g.key}: 갈래 ${g.class}`);
    assert(c.role.split('|').includes(role[g.key]) || D.crossRole[g.key], `${g.key}: ${g.class} 는 ${role[g.key]} 갈래가 아님`);
    if (g.sub) assert(D.classes[g.sub] && g.sub !== g.class, `${g.key}: 부 갈래 ${g.sub}`);
  }
  /* lordAs — 팩(군웅록 roleMap)에서 군주가 될 때의 기질(사용자 2026-11-12 「군주로 바꿔주긴하는데」) */
  if (g.lordAs) {
    assert(role[g.key] !== 'lord', `${g.key}: 이미 군주면 lordAs 가 필요 없다`);
    assert(D.traits[g.lordAs.trait] && g.lordAs.why, `${g.key}: lordAs 기질 ${g.lordAs.trait}`);
  }
}
// 닻 — 사용자 2026-11-12 기준
const by = Object.fromEntries(D.generals.map(g => [g.key, g.stats]));
assert.strictEqual(by['여포'].war, 100); assert.strictEqual(by['제갈량'].int, 100);
assert.strictEqual(by['조조'].lead, 96); assert.strictEqual(by['순욱'].pol, 98);
/* 군웅록 roleMap 의 군주는 모두 lordAs 가 있다 */
const P = JSON.parse(fs.readFileSync(path.join(root, 'data/draft2-packs.json'), 'utf8'));
const byKey = Object.fromEntries(D.generals.map(g => [g.key, g]));
for (const [k, r] of Object.entries(P.packs.mx.roleMap)) if (r === '군주' && role[k] !== 'lord') assert(byKey[k] && byKey[k].lordAs, `${k}: 군웅록 군주인데 lordAs 가 없다`);
console.log('draft2-data ok —', D.generals.length, '명 · lordAs', D.generals.filter(g => g.lordAs).length);
