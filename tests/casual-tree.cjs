/* 일상컷 트리 표 ↔ 모듈(lib/casual-tree.js). node tests/casual-tree.cjs
   game 의 같은 시험에서 생성기 표(prompt-spec POSE_OPTIONS · ORIENTATION_OPTIONS) 대조는 뺐다 — 원소 생성기엔 자세 표가 없다(자세 열쇠는 트리 표 pose_meta 가 쥔다).
   가까운 컷 목록(CLOSE_FRAMES)과 뒤돌아보기 방향(LOOK_BACK)은 game prompt-spec 의 값 그대로 여기 적는다. */
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
global.window = global; require('../lib/casual-tree.js');
const tree = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
const CLOSE_FRAMES = ['waist_up', 'chest_up', 'face_close'];
const LOOK_BACK = { orient: ['rear_3q', 'three_quarter_back', 'over_shoulder', 'back'], pose: ['turning_back'] };
/* 눕기 계열엔 등 쪽·뒤돌아보기 방향이 없다 — 해먹에 누워 등을 돌리고 다리를 늘어뜨리라 해서 몸이 반 바퀴 비틀렸다(game 2026-10-29) */
for (const o of [...LOOK_BACK.orient, 'back_to_camera', 'walking_away']) assert(!tree.families.lie.orients.includes(o), '눕기 계열에 ' + o);
/* 서기·움직임 계열엔 「뒤로 젖혀 기대기(받침 필요)」 가 없다 */
for (const f of ['stand', 'move']) assert(!tree.families[f].orients.includes('leaning_back'), f + ' 계열에 뒤로 젖히기');
/* 어느 자세도 자세 표(pose_meta)에 든다 — 고를 수 없는 자세가 없게 */
const used = new Set(Object.values(tree.families).flatMap(f => f.poses));
for (const k of used) assert(tree.pose_meta[k], '자세 표에 없는 자세 ' + k);
/* 화면·조립이 쓰는 lib/casual-tree.js 와 검사기 tools/casual-tree.py 가 같은 길을 센다 */
const CT = window.AtelierCasualTree;
let paths = 0;
for (const e of tree.eras) for (const p of CT.places(tree, e.key, null)) for (const a of CT.acts(tree, e.key, p.key)) {
  paths++;
  assert(CT.outfitFamilies(tree, e.key, p.key, a.key).length, e.key + ' ' + p.key + ' ' + a.key + ' 옷 계열');
}
const py = require('node:child_process').execFileSync('python3', [path.join(__dirname, '../tools/casual-tree.py'), 'check'], { encoding: 'utf8' });
assert.equal(paths, Number(/길 (\d+)/.exec(py)[1]), '검사기와 길 수가 같다');
/* 추천 조합을 채우면 고칠 것이 없다 — 다 트리 위의 길 */
for (const pr of tree.presets) {
  const sc = CT.applyPreset(tree, {}, pr.key), r = CT.repair(tree, sc, null, CLOSE_FRAMES);
  for (const k of ['era', 'place', 'act', 'ofam', 'item']) assert.equal(r[k], sc[k], pr.key + ' ' + k);
}
/* 칸끼리 규칙(game GTA V 계획에서 걸린 것들) — 화면·랜덤·계획기가 다 이 함수를 쓴다 */
const gp = f => CT.poses(tree, 'gala_dinner', f);
assert(gp('full_body').includes('sitting') && !gp('full_body').includes('cross_legged') && !gp('full_body').includes('perched_seat'), '식탁 만찬 — 의자 자세만');
assert(!gp('full_body').includes('hands_in_hair') && !gp('full_body').includes('holding_cup'), '잔 드는 하는 일 — 손 쓰는 자세 없음');
assert(CT.poses(tree, 'car_lean', 'full_body').includes('hand_on_hip') && !CT.poses(tree, 'take_photo', 'full_body').includes('hand_on_hip'), '빈 손 하는 일에만 허리에 손');
assert(!CT.poses(tree, 'stroll', 'face_close').includes('walking') && !CT.poses(tree, 'car_lean', 'face_close').includes('standing_relaxed') && CT.poses(tree, 'car_lean', 'face_close').includes('hands_in_hair'), '클로즈업 — 얼굴 쪽 자세만');
assert(!CT.poses(tree, 'car_lean', 'chest_up').includes('hand_on_hip') && CT.poses(tree, 'car_lean', 'waist_up').includes('hand_on_hip'), '허리에 손은 허리 위부터');
assert.deepEqual(CT.poses(tree, 'sunbed', 'full_body'), [], '눕기 — 하는 일이 자세');
assert(CT.items(tree, 'swimwear', 'full_body').some(i => i.key === 'cutout_onepiece') && !CT.items(tree, 'swimwear', 'face_close').some(i => i.key === 'cutout_onepiece'), '클로즈업엔 허리 컷아웃 수영복 없음');
for (const o of tree.outfits) for (const f of ['face_close', 'chest_up']) assert(CT.items(tree, o.key, f).length, o.key + ' ' + f + ' 에 고를 옷');
assert(!CT.lensOk(tree, 'three_quarter', 'documentary35') && !CT.lensOk(tree, 'face_close', 'wide24') && CT.lensOk(tree, 'full_body', 'wide24') && CT.lensOk(tree, 'face_close', ''), '광각 규칙');
assert(!CT.exprOk(tree, { act: 'stargaze', orient: 'back_to_camera' }) && !CT.exprOk(tree, { act: 'karaoke_sing', orient: 'front' }) && CT.exprOk(tree, { act: 'stargaze', orient: 'front' }), '표정 규칙');
assert(!CT.frameOk(tree, 'swim', 'full_body') && !CT.frameOk(tree, 'soak', 'environmental') && CT.frameOk(tree, 'swim', 'waist_up') && CT.frameOk(tree, 'stroll', 'full_body'), '수영·탕 — 전신·환경 컷 없음');
assert.equal(CT.repair(tree, { era: 'now', place: 'water_pool', act: 'swim', ofam: 'swimwear', frame: 'full_body' }, null, CLOSE_FRAMES).frame, '', '수영으로 바꾸면 전신은 비운다');
for (const it of ['hollywood_bias', 'low_back_evening', 'column_gown']) assert(!CT.items(tree, it === 'hollywood_bias' ? 'retro' : 'evening', 'chest_up').some(i => i.key === it), '등이 알아볼 데인 옷은 가슴 위에 없다 ' + it);
assert(!CT.orients(tree, 'cooking', 'chest_up', CLOSE_FRAMES).includes('rear_3q') && CT.orients(tree, 'cooking', 'waist_up', CLOSE_FRAMES).includes('rear_3q') && CT.orients(tree, 'cooking', 'chest_up', CLOSE_FRAMES).includes('over_shoulder'), '가슴 위엔 등 쪽 방향 없음, 어깨 너머는 된다');
assert(CT.poses(tree, 'stroll', 'chest_up').includes('finger_to_lips') && !CT.poses(tree, 'gala_dinner', 'full_body').includes('finger_to_lips') && !CT.poses(tree, 'stair_pause', 'full_body').includes('finger_to_lips'), '쉿 — 얼굴 쪽·손 쓰는 자세(난간 잡은 하는 일엔 없다 — 팔이 셋 나왔다)');
assert(!CT.orients(tree, 'stroll', 'full_body', CLOSE_FRAMES, 'finger_to_lips').includes('back_to_camera') && CT.orients(tree, 'stroll', 'full_body', CLOSE_FRAMES, 'finger_to_lips').includes('over_shoulder'), '쉿엔 등 쪽 방향 없음, 어깨 너머는 된다');
assert.equal(CT.repair(tree, { era: 'now', place: 'street_shop', act: 'stroll', ofam: 'everyday', frame: 'full_body', orient: 'back_to_camera', pose: 'finger_to_lips' }, null, CLOSE_FRAMES).orient, '', '쉿을 고르면 등 돌림은 비운다');
assert(CT.poses(tree, 'stroll', 'chest_up').includes('thumbs_up') && !CT.poses(tree, 'stroll', 'face_close').includes('thumbs_up') && !CT.orients(tree, 'stroll', 'full_body', CLOSE_FRAMES, 'thumbs_up').includes('back'), '엄지 척 — 가슴 앞 손, 얼굴이 보이게');
const fixed = CT.repair(tree, { era: 'now', place: 'evening_gala', act: 'gala_dinner', ofam: 'evening', frame: 'face_close', pose: 'cross_legged', lens: 'wide24', expr: 'calm', orient: 'front' }, null, CLOSE_FRAMES);
assert(!fixed.pose && !fixed.lens && fixed.expr === 'calm', '고치기 — 맞지 않는 자세·광각은 비우고 표정은 둔다');
assert.equal(CT.repair(tree, { ...fixed, orient: 'back_to_camera', frame: 'full_body' }, null, CLOSE_FRAMES).expr || '', '', '등을 보이면 표정을 비운다');
/* 트리 표마다의 규칙 칸(pkm, 2026-10-29) — 안 쓰는 값(banned)·필수 갈래 컷에 안 쓰는 프레이밍(not_required)·동료 자세·세대 연도.
   원소 표에는 없으니 지금 그대로, 칸을 넣은 복사본에서만 걸린다 */
assert(CT.frameOk(tree, 'stroll', 'detail') && CT.orients(tree, 'stroll', 'full_body', CLOSE_FRAMES).includes('back'), '원소 — 안 쓰는 값 없음');
const t2 = JSON.parse(JSON.stringify(tree));
t2.banned = { orients: ['back', 'back_to_camera', 'walking_away'], frames: ['detail'] };
t2.frame_rules.face_close.not_required = true;
t2.pose_meta.hand_on_hip.companion = true;
t2.gen_years = { 1: 1996 };
assert(!CT.frameOk(t2, 'stroll', 'detail') && !CT.orients(t2, 'stroll', 'full_body', CLOSE_FRAMES).includes('back') && CT.orients(t2, 'stroll', 'full_body', CLOSE_FRAMES).includes('rear_3q'), '안 쓰는 값은 빠진다');
const lingerie = { era: 'now', place: 'home_bedroom', act: 'dress_up', ofam: 'lingerie' };
assert(!CT.frameOk(t2, 'dress_up', 'face_close', lingerie) && CT.frameOk(t2, 'dress_up', 'face_close', { ...lingerie, ofam: 'homewear' }) && CT.frameOk(t2, 'dress_up', 'face_close'), '얼굴 클로즈업 — 필수 갈래 컷만 막는다');
assert.equal(CT.repair(t2, { ...lingerie, frame: 'face_close' }, null, CLOSE_FRAMES).frame, '', '필수 갈래로 고치면 클로즈업은 비운다');
assert(!CT.poses(t2, 'car_lean', 'full_body').includes('hand_on_hip') && CT.poses(tree, 'car_lean', 'full_body').includes('hand_on_hip'), '동료 자세는 동료가 있는 하는 일에서만');
assert.equal(CT.year(t2, { gen: 1 }), 1996, '세대 → 첫 등장 해(모듈은 그대로 — 원소 표엔 gen_years 가 없다)');
/* 삼국지 시대 — now · heritage(역사의 자리) · nation(세계 안) · fantasy. 출시 연도가 없다: year() 는 null, since 를 가진 장소가 없다, 'release' 시대엔 장소가 없어도 모듈이 멀쩡하다 */
assert.deepEqual(tree.eras.map(e => e.key), ['now', 'heritage', 'nation', 'fantasy']);
assert.equal(CT.year(tree, null), null); assert.equal(CT.year(tree, { key: 'fe', facts: {} }), null, '카드에 연도가 없으면 null');
assert(!tree.places.some(p => 'since' in p), 'since 를 가진 장소가 없다');
assert.deepEqual(CT.places(tree, 'release', { facts: { year: 1990 } }), [], '없는 시대엔 장소가 없다(걸리지 않는다)');
assert(CT.places(tree, 'heritage', null).some(p => p.key === 'heritage_museum') && !CT.places(tree, 'heritage', null).some(p => p.key === 'home_living'), '역사의 자리 시대엔 역사의 자리만');
assert(CT.places(tree, 'nation', null).every(p => p.group === 'nation') && CT.places(tree, 'nation', null).length === 16, '세계 안 시대엔 세계 안 열여섯 곳');
assert(CT.places(tree, 'now', null).some(p => p.key === 'heritage_museum') && !CT.places(tree, 'now', null).some(p => p.key === 'nation_room'), '역사의 자리는 지금 현실에도, 세계 안은 세계 안에만');
/* 필수 갈래의 「그 세계 안」 규칙은 required.world(모듈 worldRule — game 의 in_game 자리) */
assert.equal(CT.worldRule(tree).era, 'nation');
assert(CT.isRequired(tree, { era: 'nation', place: 'nation_room', ofam: 'homewear' }) && !CT.isRequired(tree, { era: 'now', place: 'home_bedroom', ofam: 'homewear' }) && CT.isRequired(tree, { era: 'now', place: 'home_bedroom', ofam: 'lingerie' }), '나라의 방에서 홈웨어는 필수 갈래, 지금 현실의 침실에선 란제리풍만');
assert(!CT.screens(tree, 'home_living') && !tree.groups.some(g => g.screens) && !tree.places.some(p => p.screens), '화면(screens) 표시가 없다');
/* 왜 못 고르나(why) · 해방(unlocked) — 허브 통합 생성기(2026-10-29). 트리 안 값은 null, 밖 값은 까닭 코드. 해방한 칸은 고치지 않는다 */
{
  const sc = { era: 'now', place: 'street_park', act: 'stroll', ofam: 'everyday', frame: 'full_body' };
  for (const k of ['place', 'act', 'ofam', 'frame', 'pose', 'orient']) for (const v of CT.choices(tree, sc, k, null, CLOSE_FRAMES).concat(k === 'frame' ? ['waist_up'] : []))
    assert.equal(CT.why(tree, sc, k, v, null, CLOSE_FRAMES), null, k + ' ' + v + ' 는 고를 수 있다');
  assert.equal(CT.why(tree, sc, 'place', 'nation_room').code, 'era');
  assert.equal(CT.why(tree, { ...sc, era: 'heritage' }, 'place', 'street_park').code, 'era', '현장 시대에 공원은 없다');
  assert.equal(CT.why(tree, { ...sc, era: 'heritage' }, 'place', 'heritage_museum'), null);
  assert.equal(CT.why(tree, sc, 'act', 'swim').code, 'place');
  assert.equal(CT.why(tree, sc, 'ofam', 'swimwear').code, 'place');
  assert.equal(CT.why(tree, { ...sc, era: 'heritage', place: 'heritage_museum', act: 'rest_seat' }, 'ofam', 'retro').code, 'era', '현장 시대엔 레트로가 없다');
  assert.equal(CT.why(tree, sc, 'frame', 'face_close'), null);
  assert.equal(CT.why(tree, { ...sc, act: 'swim', place: 'water_pool' }, 'frame', 'full_body').code, 'act');
  assert.equal(CT.why(tree, { ...sc, frame: 'face_close' }, 'pose', 'walking').code, 'zone');
  assert.equal(CT.why(tree, sc, 'pose', 'sitting').code, 'family');
  assert.equal(CT.why(tree, { ...sc, frame: 'face_close' }, 'lens', 'wide24').code, 'wide');
  assert.equal(CT.why(tree, { ...sc, frame: 'chest_up' }, 'orient', 'rear_3q').code, 'frame');
  assert.equal(CT.why(tree, { ...sc, act: 'karaoke_sing' }, 'expr', 'calm').code, 'mood');
  assert.equal(CT.why(tree, sc, 'place', 'nope').code, 'unknown');
  const un = CT.repair(tree, { ...sc, pose: 'sitting', unlocked: ['pose'] }, null, CLOSE_FRAMES);
  assert.equal(un.pose, 'sitting', '해방한 자세는 그대로');
  assert.equal(CT.repair(tree, { ...sc, pose: 'sitting' }, null, CLOSE_FRAMES).pose, '', '해방 안 했으면 비운다');
  assert(CT.unlocked(un, 'pose') && !CT.unlocked({ ...un, pose: '' }, 'pose'), '빈 칸은 해방이 아니다');
  assert.equal(CT.repair(tree, { ...sc, act: 'swim', unlocked: ['act'] }, null, CLOSE_FRAMES).act, 'swim', '해방한 하는 일도');
}
/* 예전 기록 변환 — 갈래만 있으면 기본 길, 없는 갈래는 일상 갈래로 */
const leg = CT.fromLegacy(tree, { cat: 'hobbies_leisure', ex: '' });
assert(leg.place && leg.act && !('cat' in leg), '예전 갈래 → 새 길');
assert.equal(CT.fromLegacy(tree, { cat: 'game_place', ex: '' }).place, 'street_cafe', '없는(게임) 갈래는 일상 갈래의 기본 길로');
console.log(`PASS 일상컷 트리 ↔ 모듈: 자세 계열 ${Object.keys(tree.families).length} · 자세 ${used.size} · 시대 ${tree.eras.map(e => e.key).join('·')} · 길 ${paths}(검사기와 같다) · 추천 조합 ${tree.presets.length} · 칸끼리 규칙(앉는 자리·손·보이는 부위·허리 아래 옷·광각·표정) · required.world · since 없음`);
