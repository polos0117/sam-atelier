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
}
// 닻 — 사용자 2026-11-12 기준
const by = Object.fromEntries(D.generals.map(g => [g.key, g.stats]));
assert.strictEqual(by['여포'].war, 100); assert.strictEqual(by['제갈량'].int, 100);
assert.strictEqual(by['조조'].lead, 96); assert.strictEqual(by['순욱'].pol, 98);
console.log('draft2-data ok —', D.generals.length, '명');
