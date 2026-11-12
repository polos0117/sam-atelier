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
/* 연도 팩의 roleMap 군주도 lordAs 가 있다 */
for (const [pk, p] of Object.entries(P.packs)) for (const [k, r] of Object.entries(p.roleMap || {})) if (r === '군주' && role[k] !== 'lord') assert(byKey[k] && byKey[k].lordAs, `${pk} ${k}: 군주인데 lordAs 가 없다`);

/* 세력 표 — data/draft2-factions.json: 이력 · 연도 팩에 나오는 세력이 다 있고(별칭 포함), 색은 #RRGGBB, 겹치지 않게 */
const F = JSON.parse(fs.readFileSync(path.join(root, 'data/draft2-factions.json'), 'utf8'));
const hex = /^#[0-9A-F]{6}$/i, colors = new Set();
for (const [f, e] of Object.entries(F.factions)) {
  assert(hex.test(e.c), `${f}: 색 ${e.c}`); assert(e.h && [...e.h].length === 1, `${f}: 한자 한 글자`);
  assert(!colors.has(e.c.toUpperCase()), `${f}: 색이 겹친다 ${e.c}`); colors.add(e.c.toUpperCase());
}
for (const [a, to] of Object.entries(F.alias)) assert(F.factions[to], `별칭 ${a} → ${to} 가 세력 표에 없다`);
for (const [pk, p] of Object.entries(P.packs)) {
  const names = new Set(Object.values(p.career || {}).flat().concat(Object.values(p.facMap || {})));
  for (const f of names) assert(F.factions[f] || F.alias[f], `${pk}: 세력 ${f} 가 세력 표에 없다`);
}
assert(F.factions['조위'].c === '#3E5C8C' && F.factions['촉한'].c === '#4F7A4A' && F.factions['동오'].c === '#C0472F', '위 · 촉 · 오는 옛 판 색');
const syn = F.cohesion.syn;
for (let n = 3; n <= 11; n++) assert(syn[n] > syn[n - 1], `결속 곡선은 오른다 ${n}`);

/* 인연 — data/draft2-bonds.json: 사람은 다 장수 목록에, 배신은 음수 · 까닭 */
const B = JSON.parse(fs.readFileSync(path.join(root, 'data/draft2-bonds.json'), 'utf8'));
assert(B.oldLord.v > 0 && B.oldLord.cap >= B.oldLord.v, '옛 주군 값 · 상한');
for (const x of B.betray) {
  assert(role[x.a] && role[x.b] && x.a !== x.b, `배신 ${x.a}-${x.b}: 장수 목록에 없다`);
  assert(x.v < 0 && x.why, `배신 ${x.a}-${x.b}: 음수 · 까닭`);
}
/* 전장 거점 꼴 — data/draft2-battlefields.json: 전장 일곱, 거점이 battles.json 과 같고, 꼴은 표에, 본진(hq)이 하나 이상 */
const BF = JSON.parse(fs.readFileSync(path.join(root, 'data/draft2-battlefields.json'), 'utf8'));
const BT = JSON.parse(fs.readFileSync(path.join(root, 'data/battles.json'), 'utf8'));
assert.strictEqual(BF.fields.length, 7, '전장 일곱');
assert.deepStrictEqual(BF.fields.map(f => f.key), BT.battles.map(b => b.key), '전장 차례가 battles.json 과 같다');
const fitOk = new Set(Object.keys(D.classes).concat(['lord']));
for (const [t, e] of Object.entries(BF.types)) { assert(e.ko && e.glyph && e.stat && e.fit.length, `꼴 ${t}`); for (const f of e.fit) assert(fitOk.has(f), `꼴 ${t}: 갈래 ${f}`); }
for (const f of BF.fields) {
  const b = BT.battles.find(x => x.key === f.key);
  assert.deepStrictEqual(f.slots.map(s => s.key + ':' + s.ko), b.slots.map(s => s.key + ':' + s.ko), `${f.key}: 거점이 battles.json 과 같다`);
  for (const sl of f.slots) assert(BF.types[sl.type], `${f.key} ${sl.key}: 꼴 ${sl.type}`);
  assert(f.slots.some(sl => sl.type === 'hq'), `${f.key}: 본진이 없다`);
}
console.log('draft2-data ok —', D.generals.length, '명 · lordAs', D.generals.filter(g => g.lordAs).length, '· 세력', Object.keys(F.factions).length, '· 배신', B.betray.length, '· 전장', BF.fields.length);
