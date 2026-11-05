/* 프롬프트 v2 — 구조판 지시문(lib/prompt-sam.js buildStruct, 화풍 glossy_kv, 2026-11-05). node tests/prompt-v2.cjs
   - 모든 장수 × 세계 셋: 공통 규칙 → 1절(세계 몫) → 2 · 3 · 4절 칸이 빠짐없이, 빈 칸 · undefined 없음
   - 설계표가 쓰는 외형 값은 모두 한글 표(STRUCT.ko · body)에 있다(영어로 새지 않는다)
   - 무협 · 판타지 1절엔 SF 낱말이 없다, 메카 실루엣은 고른 때만 3절에, 기본 화풍(kr_mmorpg) 지시문은 그대로 영어 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const R = path.join(__dirname, '..'), ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec, ST = T.STRUCT;
const D = JSON.parse(fs.readFileSync(path.join(R, 'data/sam-design.json'), 'utf8')), S = JSON.parse(fs.readFileSync(path.join(R, 'data/style.json'), 'utf8'));
const sv = S.styles.glossy_kv.versions.find(v => v.v === S.styles.glossy_kv.current);
assert.equal(sv.format, 'structured'); assert(sv.rules && sv.section1 && sv.section1_worlds.samguk && sv.section1_worlds.fantasy);
let n = 0;
for (const key of P.cards(D)) for (const w of ['samguk', 'fantasy', 'mecha']) {
  const p = P.build(D, S, key, w, { style: 'glossy_kv' });
  assert(p.startsWith(sv.rules), key + ' ' + w + ' 공통 규칙이 맨 앞');
  assert(p.includes(w === 'mecha' ? sv.section1 : sv.section1_worlds[w]), key + ' ' + w + ' 1절은 세계 몫');
  for (const name of ST.s2.concat(ST.s3, ST.s4)) assert(p.includes('\n' + name + (ST.heading.includes(name) ? ':' : ': [')), key + ' ' + w + ' 칸 ' + name);
  assert(!/\[\]|undefined|\{\w+\}/.test(p), key + ' ' + w + ' 빈 칸 · 못 채운 자리');
  assert(p.includes('실루엣: [' + ST.fixed.silFree + ']'), '실루엣은 안 고르면 자유');
  n++;
}
/* 외형 값은 한글 표에 */
const AX = ['face_shape', 'eyes', 'brows', 'nose', 'lips', 'eye_color', 'hair_color', 'hair', 'bangs', 'impression', 'skin_tone', 'eye_size', 'eye_tilt', 'mark', 'age'];
for (const g of D.generals) { const L = g.look; for (const o of [L.face, L.silhouette, ...Object.values(L.worlds || {}).flatMap(x => [x.face, x.silhouette])]) for (const [a, v] of Object.entries(o || {})) {
  if (AX.includes(a)) assert(ST.ko[a] && ST.ko[a][v], g.key + ' ' + a + '=' + v + ' 한글 표에 없다');
  if (a === 'body') assert(ST.body[v] && ST.body[v].length === ST.bodyKeys.length, g.key + ' 체형 ' + v); } }
for (const p of T.WORLD_POSES) assert(ST.ko.pose[p.key], '자세 ' + p.key);
for (const t of T.WORLD_TIMES) assert(ST.ko.time[t.key], '시간대 ' + t.key);
for (const k of Object.keys(T.EXPRESSION_DETAIL)) assert(ST.ko.expr[k], '표정 ' + k);
for (const [w, list] of Object.entries(T.SILHOUETTES)) { assert(list.length >= 10, w + ' 실루엣 갈래'); assert.equal(new Set(list.map(m => m.key)).size, list.length, w + ' 실루엣 열쇠 겹침'); for (const m of list) assert(m.ko && m.kot && m.en, w + ' 실루엣 ' + m.key); }
for (const [w, k] of [['samguk', 'water_sleeves'], ['fantasy', 'gown_armor']]) assert(P.build(D, S, P.cards(D)[0], w, { style: 'glossy_kv', shot: { frame: k } }).includes('실루엣: [' + T.SILHOUETTES[w].find(m => m.key === k).kot + ST.fixed.silFirst + ']'), w + ' 실루엣이 3절에 — 역할 옷보다 우선');
for (const w of ['samguk', 'fantasy']) { const p2 = P.build(D, S, P.cards(D)[0], w, { style: 'glossy_kv', shot: { frame: T.SILHOUETTES[w][0].key } }); assert(p2.includes('프레임 종류: [' + ST.fixed.frameKindSil.split('(')[0]), w + ' 실루엣을 고르면 역할 옷은 빠진다'); }
assert(P.build(D, S, P.cards(D)[0], 'fantasy', { style: 'glossy_kv' }).includes('디자인 방식: [' + ST.worlds.fantasy.designHead), '판타지는 서양 옷만을 맨 앞에');
/* 1절 세계 몫엔 SF 낱말이 없다 */
for (const w of ['samguk', 'fantasy']) assert(!/SF|기계|장갑|크롬|발광|나사|케이블|도장/.test(sv.section1_worlds[w]), w + ' 1절에 SF 낱말');
/* 메카 실루엣 · 고른 자세 · 시간대 · 장면 변주 */
const k0 = P.cards(D)[0], sc = (P.card(D, k0).faction.worlds.mecha.scenes || [])[0];
const on = P.build(D, S, k0, 'mecha', { style: 'glossy_kv', shot: { frame: 'full_armor', pose: 'kneel', time: 'night', scene: sc && sc.key } });
assert(on.includes('실루엣: [' + T.MECHA_SILHOUETTES.find(m => m.key === 'full_armor').kot + ']'));
assert(on.includes('액션: [' + ST.ko.pose.kneel + ']') && on.includes('광원: [' + ST.ko.time.night + ']'));
if (sc) assert(on.includes(ST.words.scene + sc.ko));
assert(!P.build(D, S, k0, 'samguk', { style: 'glossy_kv', shot: { frame: 'full_armor' } }).includes(T.MECHA_SILHOUETTES.find(m => m.key === 'full_armor').kot), '메카 아닌 세계엔 실루엣 없음');
/* 기본 화풍은 그대로 */
assert(/^CONCEPT: /.test(P.build(D, S, k0, 'mecha', { style: S['default'] })), '기본 화풍은 영어 지시문 그대로');
console.log('PASS 프롬프트 v2: 구조판 ' + n + '장(장수 ' + P.cards(D).length + ' × 세계 3) — 칸 빠짐없이 · 외형 한글 표 · 1절 세계 몫 · 메카 실루엣 · 자세 · 시간대 · 장면 · 기본 화풍 그대로');
