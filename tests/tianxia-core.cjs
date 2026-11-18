/* 천하 지도 셈 모듈 검사 — lib/tianxia-core.js (화면 없이 node 로)
   군웅록에서 설계표의 장수가 모두 어느 세력에든 든다(이력 없는 공방 장수 손휴는 설계표 세력 동오로) · 연도 판도는 그해 장수만 · 별칭(조조군)이 세력 열쇠(조위)로 ·
   막사는 군주가 맨 앞 · 땅 없는 세력은 끝(떠도는 세력) · 결의는 둘 이상 든 것만 · 새 그림은 오늘 · 어제 등록이고 확인한 날짜보다 늦을 때.
   Run: node tests/tianxia-core.cjs */
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const design = J('data/sam-design.json'), packs = J('data/draft2-packs.json'), factions = J('data/draft2-factions.json'), combos = J('data/draft2-combos.json'), tianxia = J('data/tianxia.json'), roster = J('data/draft2-roster.json'), careerFix = J('data/draft2-career-fix.json');
const C = require('../lib/tianxia-core.js'), doc = C.make({ design, packs, factions, combos, tianxia, roster, careerFix });
// 군웅록 이력 고침 표(2026-11-18 「22명만 고쳐」) — 막사가 고친 대표 세력으로: 후성 · 송헌 · 위속은 여포 → 조위, 유요는 제 세력(곡아 근처 성이 모두 동오라 땅 없이 떠도는 세력), 한복은 한조정
for (const n of ['후성', '송헌', '위속', '고람', '염포', '당자']) assert.equal(C.factionOf(doc, 'mx', n), '조위', n);
assert.equal(C.factionOf(doc, 'mx', '한복'), '한조정'); assert.equal(C.factionOf(doc, 'mx', '유요'), '유요'); assert.equal(C.chiefOf(doc, 'mx', '유요'), '유요');
assert(C.factionsOf(doc, 'mx').find(f => f.key === '유요').landless, '군웅록 유요 — 떠도는 세력');
assert(!C.members(doc, 'mx', '여포').some(m => ['후성', '송헌', '위속'].includes(m.name)), '군웅록 여포 막사 — 후성 · 송헌 · 위속이 빠진다');

assert.deepEqual(C.ERAS, ['mx', 'w194', 'gd200', 'jb208', 'end263']);
// 군웅록 — 설계표의 장수 모두 어느 세력이든(수는 설계표에서 센다 — 장수가 또 늘어난다)
assert.equal(C.factionOf(doc, 'mx', '손휴'), '동오'); assert.equal(C.factionOf(doc, 'end263', '손휴'), '동오'); assert.equal(C.factionOf(doc, 'jb208', '손휴'), null);
for (const g of design.generals) assert(C.factionOf(doc, 'mx', g.key), g.key + ' 가 군웅록에서 세력이 없다');
assert.equal(C.factionsOf(doc, 'mx').reduce((s, f) => s + f.count, 0), design.generals.length);
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
assert.equal(C.chiefOf(doc, 'end263', '진'), '사마소'); assert.equal(C.chiefOf(doc, 'end263', '동오'), '손휴'); assert(C.members(doc, 'end263', '동오').some(m => m.name === '손호'), '263 동오 — 손호는 그 막사의 장수로 남는다'); assert.equal(C.chiefOf(doc, 'end263', '촉한'), '유선');
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
  assert.equal(names('w194', '유장'), ['유장', '오의', '장임', '엄안', '황권', '장송', '방희'].sort().join(), '195 유장 세력 7명(2026-11-18 방희)');
  assert.equal(names('w194', '왕랑'), '왕랑,우번,주흔', '195 왕랑 3명(2026-11-18 주흔)'); assert.equal(names('w194', '유요'), ['유요', '번능', '우미', '장영'].sort().join(), '195 유요 4명(2026-11-18 번능 · 우미 · 장영)');
  assert.equal(C.members(doc, 'w194', '왕랑')[0].role, 'lord', '195 왕랑은 군주(roles)'); assert.equal(C.chiefOf(doc, 'w194', '왕랑'), '왕랑');
  assert.equal(C.chiefOf(doc, 'w194', '동탁'), '이각'); assert.equal(C.chiefOf(doc, 'w194', '황건'), '장연'); assert.equal(C.chiefOf(doc, 'gd200', '황건'), '장연');
  assert.equal(C.factionOf(doc, 'w194', '감부인'), '도겸', '세력 열쇠 → 그해 이름(서주군) → 다시 열쇠');
  for (const [c, f] of Object.entries({ henei: '장양', hanzhong: '장로', chengdu: '유장', jiangzhou: '유장', yongan: '유장', jiaozhi: '교주', kuaiji: '왕랑', chaisang: '유요', runan: '황건', xiangping: '공손도' }))
    assert.equal(C.ownerOf(doc, 'w194', c), f, '195 ' + c);
  for (const f of ['유요', '왕랑']) { const x = fl('w194').find(y => y.key === f); assert(x && !x.landless && x.glyph === factions.factions[f].h && x.color === factions.factions[f].c, '195 ' + f + ' — 범례 줄'); }
  assert.equal(fl('w194').find(y => y.key === '유요').glyph, '劉'); assert.equal(fl('w194').find(y => y.key === '왕랑').glyph, '王');
  for (const f of ['동탁', '한조정', '재야']) assert(fl('w194').find(y => y.key === f).landless, '195 ' + f + ' 는 성 없는 세력');
  /* 새 장수 1묶음(2026-11-18) — 요동 공손씨(새 세력 공손도 遼) · 여남의 황건(유벽 · 공도) · 유요 · 왕랑 · 교주 · 장로 쪽 장수 */
  assert.equal(names('mx', '공손도'), ['공손도', '공손강', '공손연'].sort().join(), '군웅록 공손도 세력 3명'); assert.equal(C.chiefOf(doc, 'mx', '공손도'), '공손도'); assert.equal(C.ownerOf(doc, 'mx', 'xiangping'), '공손도');
  assert.equal(names('w194', '공손도'), '공손강,공손도'); assert.equal(C.chiefOf(doc, 'w194', '공손도'), '공손도'); assert.equal(C.chiefOf(doc, 'gd200', '공손도'), '공손도');
  assert.equal(names('jb208', '공손도'), '공손강', '208 — 공손도는 204년에 죽었다'); assert.equal(C.chiefOf(doc, 'jb208', '공손도'), '공손강'); assert.equal(C.ownerOf(doc, 'jb208', 'xiangping'), '공손도'); assert.equal(C.ownerOf(doc, 'end263', 'xiangping'), '진');
  { const x = fl('w194').find(y => y.key === '공손도'); assert(x && !x.landless && x.glyph === '遼' && x.color === factions.factions['공손도'].c, '195 공손도 — 범례 줄'); }
  for (const e of ['w194', 'gd200', 'jb208', 'end263']) { assert.equal(C.factionOf(doc, e, '공손연'), null, e + ' 공손연은 군웅록에만'); assert.equal(C.factionOf(doc, e, '사휘'), null, e + ' 사휘는 군웅록에만'); }
  assert(!fl('w194').find(y => y.key === '황건').landless && C.factionOf(doc, 'w194', '유벽') === '황건' && C.factionOf(doc, 'w194', '공도') === null && C.factionOf(doc, 'gd200', '공도') === '황건', '195 여남은 황건(유벽), 공도는 200 부터');
  assert.equal(C.factionOf(doc, 'mx', '번능'), '유요'); assert.equal(C.factionOf(doc, 'mx', '사휘'), '교주'); assert.equal(C.factionOf(doc, 'mx', '양임'), '장로'); assert.equal(C.factionOf(doc, 'jb208', '양앙'), '장로'); assert.equal(C.factionOf(doc, 'w194', '사일'), '교주');
  /* 새 장수 2묶음(2026-11-18) — 원술 · 서량 · 유장 · 유표 · 여포 · 도겸 쪽과 263년 촉한 · 동오 · 진 */
  assert.equal(names('w194', '원술'), ['원술', '기령', '장훈', '교유', '양강', '한윤', '뇌박', '진란', '염상', '유훈'].sort().join(), '195 원술 10명');
  assert.equal(names('w194', '서량'), ['마등', '마초', '마대', '한수', '방덕', '염행', '성공영', '마휴', '마철'].sort().join(), '195 서량 9명');
  assert.equal(C.factionOf(doc, 'gd200', '유훈'), '조위', '200 유훈은 조조에게 귀순'); assert.equal(C.factionOf(doc, 'jb208', '유종'), '조위'); assert.equal(C.chiefOf(doc, 'jb208', '조위'), '조조', '208 조위 — 유종 · 왕찬 · 한숭이 들어와도 가운데는 조조');
  for (const e of ['w194', 'gd200', 'jb208', 'end263']) assert.equal(C.factionOf(doc, e, '유언'), null, e + ' 유언(194년 죽음)은 군웅록에만');
  assert.equal(C.factionOf(doc, 'mx', '유언'), '유장'); assert.equal(C.factionOf(doc, 'mx', '왕찬'), '조위'); assert.equal(C.factionOf(doc, 'mx', '학맹'), '여포'); assert.equal(C.factionOf(doc, 'mx', '조표'), '도겸');
  assert.equal(C.factionOf(doc, 'end263', '황호'), '촉한'); assert.equal(C.factionOf(doc, 'end263', '시적'), '동오'); assert.equal(C.factionOf(doc, 'end263', '위관'), '진'); assert.equal(C.chiefOf(doc, 'end263', '촉한'), '유선');
  assert.equal(C.factionOf(doc, 'jb208', '한현'), '조위'); assert.notEqual(C.factionOf(doc, 'jb208', '황충'), '조위', '208 황충은 조위가 아니다(사용자 「황충은 빼고」)');
  assert.equal(C.ownerOf(doc, 'jb208', 'changsha'), '조위'); assert.equal(C.chiefOf(doc, 'jb208', '조위'), '조조', '208 조위 — 조비 · 한현이 들어와도 가운데는 조조');
  assert.equal(C.ownerOf(doc, 'gd200', 'jiaozhi'), '교주'); assert.equal(C.factionOf(doc, 'end263', '종예'), '촉한');
  /* 새 장수 3묶음 뒤쪽(2026-11-18) — 촉 · 남만 · 군웅 · 연의 · 전승 인물. 막사 고침 둘: 한조정의 가운데는 하진(tianxia mx lords), 유요 쪽 번능 · 우미 · 장영은 유요 막사로(주흔은 한조정 그대로) */
  assert.equal(C.chiefOf(doc, 'mx', '한조정'), '하진', '군웅록 한조정 — 한복 · 유대(군주)가 들어와도 가운데는 하진'); for (const n of ['양봉', '한섬', '유대', '교모', '반봉', '무안국']) assert.equal(C.factionOf(doc, 'mx', n), '한조정', n);
  assert.equal(names('mx', '유요'), ['유요', '번능', '우미', '장영'].sort().join(), '군웅록 유요 4명'); assert.equal(C.chiefOf(doc, 'mx', '유요'), '유요'); assert.equal(C.factionOf(doc, 'mx', '주흔'), '한조정');
  for (const [n, f] of Object.entries({ 옹개: '남만', 고정: '남만', 화만: '남만', 동백: '동탁', 형도영: '유표', 유섭: '원술', 어부라: '원술', 고간: '원소', 답돈: '원소', 장홍: '원소', 장초: '여포', 황승언: '재야', 가비능: '재야', 부사인: '동오', 견초: '조위', 사마가: '촉한', 관은병: '촉한', 포삼랑: '촉한', 향총: '촉한' })) assert.equal(C.factionOf(doc, 'mx', n), f, '군웅록 ' + n);
  assert.equal(C.factionOf(doc, 'w194', '양봉'), '한조정'); assert.equal(C.factionOf(doc, 'w194', '한섬'), '한조정'); assert.equal(C.chiefOf(doc, 'w194', '한조정'), '동승', '195 한조정 — 양봉 · 한섬이 들어와도 가운데는 동승');
  assert.equal(C.factionOf(doc, 'gd200', '고간'), '원소'); assert.equal(C.factionOf(doc, 'gd200', '견초'), '원소'); assert.equal(C.factionOf(doc, 'jb208', '견초'), '조위'); assert.equal(C.chiefOf(doc, 'gd200', '원소'), '원소');
  for (const e of ['w194', 'gd200', 'jb208', 'end263']) for (const n of ['형도영', '반봉', '무안국', '유섭', '관은병', '포삼랑', '화만', '동백', '장홍', '장초', '어부라']) assert.equal(C.factionOf(doc, e, n), null, e + ' ' + n + ' 는 군웅록에만');
  // 추가 명단을 못 받았을 때 — 옛 명단만으로 지금처럼 돈다
  const old = C.make({ design, packs, factions, combos, tianxia, careerFix });   // 고침 표는 늘 얹힌다 — 추가 명단만 뺀다
  assert.equal(C.factionOf(old, 'w194', '유장'), null); assert.equal(C.factionsOf(old, 'w194').reduce((s, f) => s + f.count, 0), Object.keys(packs.packs.w194.facMap).length);
  assert.equal(C.factionsOf(old, 'mx').length, C.factionsOf(doc, 'mx').length, '군웅록은 추가 명단과 무관'); }
// 거쳐 간 장수(2026-11-18 「거쳐 간 장수 줄 더해줘」) — 군웅록만, 이력에 있지만 마지막이 아닌 세력. 본 자리 인원은 그대로
{ const pb = (f, e = 'mx') => C.passedBy(doc, e, f).map(m => m.name);
  assert(pb('공손찬').includes('조운'), '공손찬 막사 — 조운'); assert.equal(C.passedBy(doc, 'mx', '공손찬').find(m => m.name === '조운').now, '촉한');
  for (const n of ['장료', '후성']) assert(pb('여포').includes(n), '여포 막사 — ' + n);
  for (const n of ['감녕', '황충']) assert(pb('유표').includes(n), '유표 막사 — ' + n);
  assert(pb('조위').includes('관우') && !pb('촉한').includes('관우'), '관우 [촉한, 조위, 촉한] — 조위에서만 거쳐 간 장수');
  for (const e of C.ERAS.slice(1)) for (const f of C.factionsOf(doc, e)) assert.deepEqual(C.passedBy(doc, e, f.key), [], e + ' ' + f.key + ' — 연도 판은 빈 배열');
  assert.deepEqual(C.passedBy(doc, 'mx', '없는세력'), []); assert.deepEqual(C.passedBy(doc, 'mx', 'constructor'), []);
  for (const f of C.factionsOf(doc, 'mx')) { const ps = C.passedBy(doc, 'mx', f.key), order = C.ROLES;
    assert(ps.every(m => C.factionOf(doc, 'mx', m.name) === m.now && m.now !== f.key), f.key + ' — 거쳐 간 장수는 다른 막사의 본 자리');
    assert.equal(new Set(ps.map(m => m.name)).size, ps.length, f.key + ' 겹침'); const ri = ps.map(m => order.indexOf(m.role)); assert(ri.every((r, i) => !i || ri[i - 1] <= r), f.key + ' 역할 차례'); }
  assert.equal(C.factionsOf(doc, 'mx').reduce((s, f) => s + C.members(doc, 'mx', f.key).length, 0), design.generals.length, '본 자리 인원 합은 설계표 길이'); }
// 결의
const b =C.bondsOf(doc, ['유비', '관우', '장비', '조운']); assert(b.some(x => x.n === '도원결의' && x.m.length === 3 && x.kind === 'bond'));
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

// 진 — 군웅록 진 막사의 가운데는 사마의, 목록 도감의 줄 열쇠(dexKey)는 군웅록 이력의 마지막이 진이면 jin(위관 · 사마망은 extra.career 로)
assert.equal(C.chiefOf(doc, 'mx', '진'), '사마의');
{ const src = { dex: factions.dex, fix: J('data/draft2-career-fix.json').fix, career: packs.packs.mx.career }, by = k => design.generals.find(g => g.key === k);
  for (const k of ['사마의', '사마염', '두예', '위관', '사마망']) assert.equal(C.dexKey(src, by(k)), 'jin', k);
  assert.equal(C.dexKey(src, by('조조')), 'wei'); assert.equal(C.dexKey(src, by('등애')), 'wei'); assert.equal(C.dexKey(src, by('여포')), by('여포').camp);
  for (const g of design.generals) assert.equal(C.dexKey(src, g) === 'jin', C.factionOf(doc, 'mx', g.key) === '진', g.key + ' 진 탭과 군웅록 진 막사가 같다'); }

console.log('PASS 천하 지도 셈: ' + C.ERAS.map(e => e + ' 세력 ' + C.factionsOf(doc, e).length + '(떠도는 ' + C.factionsOf(doc, e).filter(f => f.landless).length + ')').join(' · ') + ' · 결의 · 새 그림 판정 · 확인 기록');
