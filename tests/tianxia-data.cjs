// 천하 지도 자료 검사 — data/tianxia.json
// 판도 다섯(팩 열쇠 그대로) · 성 서른 안팎 · 성마다 주인 줄(세력 열쇠나 null) · 근거와 출처.
// 연도 판도는 그해 세력 표(packs.<팩>.facMap 의 세력 → alias)에 있는 세력에게만 성을 준다.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const T = J('data/tianxia.json'), F = J('data/draft2-factions.json'), P = J('data/draft2-packs.json').packs;

assert.deepEqual(Object.keys(T.eras), ['mx', 'w194', 'gd200', 'jb208', 'end263']);
for (const k of Object.keys(T.eras)) assert(P[k], '판도 열쇠 ' + k + ' 가 팩 열쇠가 아니다');
assert(/사실이 아니다/.test(T.note), '자료 머리에 「땅 넓이는 사실이 아니다」');
assert(T.cities.length >= 28 && T.cities.length <= 40);
assert.equal(new Set(T.cities.map(c => c.key)).size, T.cities.length);
assert.equal(new Set(T.cities.map(c => c.ko)).size, T.cities.length, '성 이름이 겹친다');
for (const c of T.cities) assert(c.ko && c.x >= 0 && c.x <= 100 && c.y >= 0 && c.y <= 100, c.key);
// 성 표지가 겹치지 않게 — 서로 3 이상
for (const a of T.cities) for (const b of T.cities) if (a.key < b.key)
  assert(Math.hypot(a.x - b.x, a.y - b.y) >= 3, a.key + ' · ' + b.key + ' 가 너무 가깝다');

const keys = new Set(T.cities.map(c => c.key));
for (const [k, e] of Object.entries(T.eras)) {
  assert(e.ko && e.line, k);
  for (const c of Object.keys(e.owners)) assert(keys.has(c), k + ' 없는 성 ' + c);
  // 그해 세력 표 — 연도 팩은 facMap 의 세력(alias 로 세력 열쇠), 군웅록은 이력에 나오는 세력
  const table = new Set(P[k].facMap ? Object.values(P[k].facMap).map(f => F.alias[f] || f) : Object.values(P[k].career).flat());
  for (const c of T.cities) { const o = e.owners[c.key]; assert(o, k + ' ' + c.key + ' 줄이 없다');
    assert(o.f === null || F.factions[o.f], k + ' ' + c.key + ' 세력 ' + o.f);
    assert(o.f === null || table.has(o.f), k + ' ' + c.key + ' — ' + o.f + ' 는 그해 세력 표에 없다');
    assert(o.why && o.src, k + ' ' + c.key + ' 근거 · 출처');
    assert(/^https?:\/\//.test(o.src), k + ' ' + c.key + ' 출처는 주소'); }
  for (const f of Object.keys(e.notes)) { assert(F.factions[f], k + ' notes ' + f); assert(table.has(f), k + ' notes ' + f + ' 는 그해 세력 표에 없다'); }
  const held = new Set(Object.values(e.owners).map(o => o.f).filter(Boolean));
  assert(held.size >= (k === 'end263' ? 2 : 5), k + ' 세력 수 ' + held.size);
  for (const f of held) assert(e.notes[f], k + ' ' + f + ' 의 한 줄이 없다');
}
assert.equal(T.eras.mx.virtual, true);
for (const f of ['한조정', '재야']) assert(!Object.values(T.eras.mx.owners).some(o => o.f === f), '군웅록 — ' + f + ' 는 성이 없다');

// 사람이 훑어볼 표 — 자료에서 뽑는다(손으로 두 번 적지 않는다). `--write` 면 쓰고, 아니면 자료와 같은지 본다.
const row = (c, o, f) => '| ' + c.ko + ' | ' + (f ? o.f + ' | ' : '') + o.why + ' | <' + o.src + '> |';
const doc = ['# 천하 지도 — 성의 주인과 근거', '',
  '`data/tianxia.json` 에서 뽑은 표다(`node tests/tianxia-data.cjs --write`). 여기를 손으로 고치지 않는다 — 자료를 고치고 다시 뽑는다.', '',
  T.note, ''];
for (const [k, e] of Object.entries(T.eras)) {
  const own = T.cities.filter(c => e.owners[c.key].f), none = T.cities.filter(c => !e.owners[c.key].f);
  doc.push('## ' + e.ko + ' (`' + k + '`)', '', e.line + (e.when ? ' · ' + e.when : ''), '',
    '주인 있는 성 ' + own.length + ' · 주인 없음 ' + none.length, '',
    '| 성 | 주인 | 근거 | 출처 |', '|---|---|---|---|', ...own.map(c => row(c, e.owners[c.key], true)), '');
  if (none.length) doc.push('주인 없음 · 다툼', '', '| 성 | 사정 | 출처 |', '|---|---|---|', ...none.map(c => row(c, e.owners[c.key], false)), '');
  doc.push('세력의 한 줄', '', ...Object.entries(e.notes).map(([f, t]) => '- **' + f + '** — ' + t), '');
}
const docPath = path.join(root, 'docs/TIANXIA_SOURCES.md'), docText = doc.join('\n');
if (process.argv.includes('--write')) fs.writeFileSync(docPath, docText);
assert.equal(fs.readFileSync(docPath, 'utf8').replace(/\r\n/g, '\n'), docText, 'docs/TIANXIA_SOURCES.md 가 자료와 다르다 — node tests/tianxia-data.cjs --write');

console.log('PASS 천하 지도 자료: 성 ' + T.cities.length + ' · ' + Object.entries(T.eras).map(([k, e]) =>
  k + ' ' + Object.values(e.owners).filter(o => o.f).length + '/' + T.cities.length).join(' · '));
