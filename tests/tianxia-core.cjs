/* 천하 지도 셈 모듈 검사 — lib/tianxia-core.js (화면 없이 node 로)
   군웅록에서 279명이 모두 어느 세력에든 든다 · 연도 판도는 그해 장수만 · 별칭(조조군)이 세력 열쇠(조위)로 ·
   막사는 군주가 맨 앞 · 땅 없는 세력은 끝(떠도는 세력) · 결의는 둘 이상 든 것만 · 새 그림은 오늘 · 어제 등록이고 확인한 날짜보다 늦을 때.
   Run: node tests/tianxia-core.cjs */
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const design = J('data/sam-design.json'), packs = J('data/draft2-packs.json'), factions = J('data/draft2-factions.json'), combos = J('data/draft2-combos.json'), tianxia = J('data/tianxia.json'), roster = J('data/draft2-roster.json');
const C = require('../lib/tianxia-core.js'), doc = C.make({ design, packs, factions, combos, tianxia, roster });

assert.deepEqual(C.ERAS, ['mx', 'w194', 'gd200', 'jb208', 'end263']);
// 군웅록 — 279명 모두 어느 세력이든
for (const g of design.generals) assert(C.factionOf(doc, 'mx', g.key), g.key + ' 가 군웅록에서 세력이 없다');
assert.equal(design.generals.length, 279);
assert.equal(C.factionsOf(doc, 'mx').reduce((s, f) => s + f.count, 0), 279);
assert.equal(C.factionOf(doc, 'mx', '유비'), '촉한'); assert.equal(C.factionOf(doc, 'mx', '여포'), '여포');
// 연도 — 그해 자료에 든 장수만, 별칭이 세력 열쇠로
assert.equal(C.factionOf(doc, 'jb208', '조조'), '조위'); assert.equal(C.factionOf(doc, 'end263', '여포'), null);
assert.equal(C.factionOf(doc, 'mx', '없는장수'), null);
// 판도마다 — 세력은 모두 세력 표의 열쇠, 장수 수 = 그해 자료, 막사를 다 모으면 그해 장수 전부(겹침 없이)
for (const era of C.ERAS) {
  const fs_ = C.factionsOf(doc, era), p = packs.packs[era], all = p.facMap ? Object.keys(p.facMap).length + ((roster.packs[era] || {}).add || []).length : design.generals.length;
  assert(fs_.length && fs_.every(f => f.count > 0 && factions.factions[f.key] && f.glyph && /^#/.test(f.color)), era + ' 세력 줄');
  assert.equal(fs_.reduce((s, f) => s + f.count, 0), all, era + ' 장수 수');
  const names = fs_.flatMap(f => C.members(doc, era, f.key).map(m => m.name));
  assert.equal(names.length, all, era + ' 막사 합'); assert.equal(new Set(names).size, all, era + ' 막사 겹침');
  for (const f of fs_) { assert.equal(f.landless, f.cities.length === 0); assert.equal(C.members(doc, era, f.key).length, f.count);
    for (const c of f.cities) assert.equal(C.ownerOf(doc, era, c), f.key); }
  // 성 많은 차례, 땅 없는 세력은 끝
  const i = fs_.findIndex(f => f.landless); assert(i === -1 || fs_.slice(i).every(f => f.landless), era + ' 땅 없는 세력은 끝');
  const landed = fs_.filter(f => !f.landless); for (let k = 1; k < landed.length; k++) assert(landed[k - 1].cities.length >= landed[k].cities.length, era + ' 성 많은 차례');
  // 성을 가진 세력은 모두 범례에(장수가 있어야 나온다 — 없으면 자료가 어긋난 것)
  for (const o of Object.values(tianxia.eras[era].owners)) if (o.f) assert(fs_.some(f => f.key === o.f), era + ' 성은 있는데 장수가 없는 세력 ' + o.f);
}
// 막사 — 군주가 맨 앞, 역할 차례
assert.equal(C.members(doc, 'mx', '촉한')[0].name, '유비'); assert.equal(C.members(doc, 'mx', '촉한')[0].role, 'lord');
assert.equal(C.members(doc, 'mx', '여포')[0].name, '여포');   // 군웅록에서는 여포가 군주(새 판 roleMap)
{ const order = ['lord', 'general', 'strategist', 'official'], ms = C.members(doc, 'mx', '조위').map(m => order.indexOf(m.role));
  assert(ms.every((r, i) => r >= 0 && (!i || ms[i - 1] <= r)), '역할 차례'); }
assert.deepEqual(C.members(doc, 'mx', '없는세력'), []);
// 가운데 = 그 세력의 우두머리 — 자료의 lords → 세력 이름에 든 군주 → roleMap 군주 → 첫 군주 → 군주 없는 무리는 첫 장수
assert.equal(C.chiefOf(doc, 'gd200', '원소'), '원소');   // 200 원소군 — 군주가 유비 · 원소 둘, 이름으로 가린다
assert.equal(C.chiefOf(doc, 'mx', '동오'), '손권');      // 군웅록 동오 — 손견이 아니라 손권(lords)
assert.equal(C.chiefOf(doc, 'end263', '진'), '사마소'); assert.equal(C.chiefOf(doc, 'end263', '동오'), '손호'); assert.equal(C.chiefOf(doc, 'end263', '촉한'), '유선');
assert.equal(C.chiefOf(doc, 'w194', '도겸'), '유비');    // 195 서주 — 도겸이 죽고 유비가 물려받았다(이름보다 lords 가 먼저)
assert.equal(C.chiefOf(doc, 'w194', '동오'), '손책'); assert.equal(C.chiefOf(doc, 'gd200', '동오'), '손책'); assert.equal(C.chiefOf(doc, 'jb208', '동오'), '손권');
assert.equal(C.chiefOf(doc, 'jb208', '서량'), '마초');   // roleMap 군주
assert.equal(C.chiefOf(doc, 'mx', '조위'), '조조'); assert.equal(C.chiefOf(doc, 'mx', '촉한'), '유비'); assert.equal(C.chiefOf(doc, 'mx', '없는세력'), null);
{ const ms = C.members(doc, 'mx', '재야'); assert(ms.every(m => m.role !== 'lord')); assert.equal(C.chiefOf(doc, 'mx', '재야'), ms[0].name, '군주 없는 무리 — 첫 장수'); }
for (const era of C.ERAS) {   // 모든 막사에 가운데가 있고 그 막사 사람이다 · 자료의 lords 는 그 판도 그 세력의 장수
  for (const f of C.factionsOf(doc, era)) assert(C.members(doc, era, f.key).some(m => m.name === C.chiefOf(doc, era, f.key)), era + ' ' + f.key + ' 가운데');
  for (const [f, n] of Object.entries(tianxia.eras[era].lords || {})) { assert.equal(C.factionOf(doc, era, n), f, era + ' lords ' + f + ' — ' + n + ' 는 그 세력 장수가 아니다'); assert.equal(C.chiefOf(doc, era, f), n); }
}
// 주소에서 온 열쇠 — constructor · __proto__ 같은 말은 없는 세력 · 없는 성
for (const k of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) { assert.deepEqual(C.members(doc, 'mx', k), []); assert.equal(C.factionOf(doc, 'mx', k), null); assert.equal(C.ownerOf(doc, 'mx', k), null); assert.equal(C.chiefOf(doc, 'mx', k), null); }
// 땅 없는 세력(떠도는 세력) — 263 의 회남은 장수는 있고 성이 없다
const fs208 = C.factionsOf(doc, 'jb208'); assert(fs208.every(f => f.count > 0));
assert(fs208.findIndex(f => f.landless) === -1 || fs208.slice(fs208.findIndex(f => f.landless)).every(f => f.landless));
{ const hn = C.factionsOf(doc, 'end263').find(f => f.key === '회남'); assert(hn && hn.landless && hn.count === C.members(doc, 'end263', '회남').length, '263 회남 — 떠도는 세력'); }
assert(C.factionsOf(doc, 'mx').some(f => f.landless), '군웅록 — 땅 없는 무리(한조정 · 재야)도 막사가 있다');
assert.equal(C.ownerOf(doc, 'w194', 'luoyang'), null); assert.equal(C.ownerOf(doc, 'mx', '없는성'), null);
// 연도 판의 추가 명단(data/draft2-roster.json) — 옛 게임 명단 위에 얹는다(합치는 곳은 lib/draft2/rules.js 의 view)
{ const names = (e, f) => C.members(doc, e, f).map(m => m.name).sort().join(), fl = e => C.factionsOf(doc, e);
  assert.equal(names('w194', '유장'), ['유장', '오의', '장임', '엄안', '황권', '장송'].sort().join(), '195 유장 세력 6명');
  assert.equal(names('w194', '왕랑'), '왕랑,우번', '195 왕랑 2명'); assert.equal(names('w194', '유요'), '유요', '195 유요 1명');
  assert.equal(C.members(doc, 'w194', '왕랑')[0].role, 'lord', '195 왕랑은 군주(roles)'); assert.equal(C.chiefOf(doc, 'w194', '왕랑'), '왕랑');
  assert.equal(C.chiefOf(doc, 'w194', '동탁'), '이각'); assert.equal(C.chiefOf(doc, 'w194', '황건'), '장연'); assert.equal(C.chiefOf(doc, 'gd200', '황건'), '장연');
  assert.equal(C.factionOf(doc, 'w194', '감부인'), '도겸', '세력 열쇠 → 그해 이름(서주군) → 다시 열쇠');
  for (const [c, f] of Object.entries({ henei: '장양', hanzhong: '장로', chengdu: '유장', jiangzhou: '유장', yongan: '유장', jiaozhi: '교주', kuaiji: '왕랑', chaisang: '유요', runan: null }))
    assert.equal(C.ownerOf(doc, 'w194', c), f, '195 ' + c);
  for (const f of ['유요', '왕랑']) { const x = fl('w194').find(y => y.key === f); assert(x && !x.landless && x.glyph === factions.factions[f].h && x.color === factions.factions[f].c, '195 ' + f + ' — 범례 줄'); }
  assert.equal(fl('w194').find(y => y.key === '유요').glyph, '劉'); assert.equal(fl('w194').find(y => y.key === '왕랑').glyph, '王');
  for (const f of ['동탁', '한조정', '황건', '재야']) assert(fl('w194').find(y => y.key === f).landless, '195 ' + f + ' 는 성 없는 세력');
  assert.equal(C.factionOf(doc, 'jb208', '한현'), '조위'); assert.notEqual(C.factionOf(doc, 'jb208', '황충'), '조위', '208 황충은 조위가 아니다(사용자 「황충은 빼고」)');
  assert.equal(C.ownerOf(doc, 'jb208', 'changsha'), '조위'); assert.equal(C.chiefOf(doc, 'jb208', '조위'), '조조', '208 조위 — 조비 · 한현이 들어와도 가운데는 조조');
  assert.equal(C.ownerOf(doc, 'gd200', 'jiaozhi'), '교주'); assert.equal(C.factionOf(doc, 'end263', '종예'), '촉한');
  // 추가 명단을 못 받았을 때 — 옛 명단만으로 지금처럼 돈다
  const old = C.make({ design, packs, factions, combos, tianxia });
  assert.equal(C.factionOf(old, 'w194', '유장'), null); assert.equal(C.factionsOf(old, 'w194').reduce((s, f) => s + f.count, 0), Object.keys(packs.packs.w194.facMap).length);
  assert.equal(C.factionsOf(old, 'mx').length, C.factionsOf(doc, 'mx').length, '군웅록은 추가 명단과 무관'); }
// 결의
const b = C.bondsOf(doc, ['유비', '관우', '장비', '조운']); assert(b.some(x => x.n === '도원결의' && x.m.length === 3 && x.kind === 'bond'));
assert.equal(C.bondsOf(doc, ['유비']).length, 0);
assert(C.bondsOf(doc, ['마초', '한수']).some(x => x.kind === 'feud'), '불화');
assert(C.bondsOf(doc, design.generals.map(g => g.key)).some(x => x.kind === 'blood'), '혈연');
assert(C.bondsOf(doc, ['유비', '관우']).every(x => x.m.every(n => n === '유비' || n === '관우')), 'm 은 그 안에 든 사람만');
// 새 그림
assert.equal(C.isNew('2026-11-17', '2026-11-17', ''), true);  assert.equal(C.isNew('2026-11-16', '2026-11-17', ''), true);
assert.equal(C.isNew('2026-11-15', '2026-11-17', ''), false); assert.equal(C.isNew('2026-11-17', '2026-11-17', '2026-11-17'), false);
assert.equal(C.isNew('2026-11-17', '2026-11-17', '2026-11-16'), true); assert.equal(C.isNew('', '2026-11-17', ''), false);
assert.equal(C.isNew('2026-11-01', '2026-11-01', ''), true); assert.equal(C.isNew('2026-10-31', '2026-11-01', ''), true);   // 달이 넘어가도
assert.equal(C.isNew('2026-12-31', '2027-01-01', undefined), true);   // 해가 넘어가도
assert.equal(C.isNew('2026-11-18', '2026-11-17', ''), false);   // 기기 날짜보다 앞선 등록(시계가 틀린 기기)은 켜지 않는다
assert.equal(C.today('?today=2026-11-02'), '2026-11-02'); assert.match(C.today(''), /^\d{4}-\d{2}-\d{2}$/); assert.match(C.today('?today=x'), /^\d{4}-\d{2}-\d{2}$/);
{ const now = C.today(''); for (const bad of ['2026-13-45', '2026-99-99', '2026-02-30']) assert.equal(C.today('?today=' + bad), now, '틀린 날짜는 기기 날짜로 ' + bad);   // 없는 날짜에 화면이 죽지 않는다
  assert.equal(C.isNew('2026-11-10', '2026-13-45', ''), false); }
C.seen.mark('유비', '2026-11-17'); assert.equal(C.seen.get('유비'), '2026-11-17');   // node — 메모리로
assert.equal(C.seen.get('관우'), ''); C.seen.markAll({ 관우: '2026-11-16', 장비: '' }); assert.deepEqual(C.seen.all(), { 유비: '2026-11-17', 관우: '2026-11-16' });
assert.equal(C.lastAdded({ byStyle: { s: { byForm: { samguk: { f: 'a.webp', casual: { f: ['b.webp'] } } } } } }, { 'a.webp': '2026-11-10', 'b.webp': '2026-11-16' }), '2026-11-16');
assert.equal(C.lastAdded({ byStyle: { s: { byForm: { samguk: { f: 'a.webp' } } } } }, {}), '');   // 날짜 없는 그림 — 지어내지 않는다
assert.equal(C.lastAdded(undefined, {}), '');
assert.equal(C.hasArt({}), false); assert.equal(C.hasArt(undefined), false); assert.equal(C.hasArt({ byStyle: { s: { byForm: { mecha: { f: 'a.webp' } } } } }), true);
assert.equal(C.hasArt({ byStyle: { s: { casual: ['c.webp'] } } }), true);
// 등록부 그대로 — 그림이 등록된 장수는 모두 그림 있음
{ const I = J('data/img.json'); for (const k of Object.keys(I.img)) if (JSON.stringify(I.img[k]).includes('.webp')) assert(C.hasArt(I.img[k]), k); }

console.log('PASS 천하 지도 셈: ' + C.ERAS.map(e => e + ' 세력 ' + C.factionsOf(doc, e).length + '(떠도는 ' + C.factionsOf(doc, e).filter(f => f.landless).length + ')').join(' · ') + ' · 결의 · 새 그림 판정 · 확인 기록');
