/* 외형 표 — lib/look-spec.js 는 game-atelier 의 외형 선택지를 글자 그대로 옮긴 것(삼국지 몫 색만 더함)이고, 설계표의 look 값은 전부 그 어휘에 있다.
   Run: node tests/look-spec.cjs   (옆에 ../game-atelier 가 있으면 game 표와 대조, 없으면 스스로만 본다) */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const load = files => { const ctx = { window: {} }; vm.createContext(ctx); for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx); return ctx.window; };
const S = load(['lib/prompt-spec.js', 'lib/look-spec.js']).AtelierSpec;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 1. 표가 다 있다 */
for (const k of ['PARAM_DEFS', 'IDENTITY_GROUPS', 'IDENTITY_EXCLUDED', 'FACE_KEYS', 'FACE_PARAM', 'SIL_PARAM', 'LOOK_KO', 'VOCAB_EN', 'PARAM_GUIDES', 'PARAM_GROUP_HELP', 'HAIR_LENGTH_LIMITS', 'EYE_CONTOURS', 'COLOR_HEX', 'COLOR_KEYS', 'AGE_DEFAULT', 'AGE_LINES', 'EXPOSURE', 'EXPOSURE_KEYS', 'EXPOSURE_DEFAULT', 'EXPOSURE_LAYER', 'LOOK_LINES'])
  assert(S[k] != null, k + ' 가 없다');
assert(S.PARAM_DEFS.length >= 30 && same(S.IDENTITY_GROUPS, ['base', 'build', 'face', 'hair']), '외형 선택지 네 묶음');
assert(!JSON.stringify(S.PARAM_DEFS).includes('게임') && !JSON.stringify(S.PARAM_GUIDES).includes('게임'), '게임 말이 남았다');
for (const w of ['samguk', 'fantasy', 'mecha']) assert(['outer', 'open'].includes(S.EXPOSURE_LAYER[w]), w + ' 노출 갈래');
assert(!JSON.stringify(S.EXPOSURE).includes('FORM'), '노출 문장에 FORM 이 남았다');
/* 혼자 실려도 표만 든다(tests/words.cjs 가 그렇게 돌린다) */
assert(load(['lib/look-spec.js']).AtelierSpec.PARAM_DEFS.length === S.PARAM_DEFS.length, '혼자 실리기');

/* 2. game 표와 글자 그대로(삼국지 몫 EXTRA 만 더해졌다) */
const GAME = path.join('..', 'game-atelier', 'lib', 'prompt-spec.js');
if (fs.existsSync(GAME)) {
  const G = load([GAME]).AtelierSpec, neutral = s => s.replace(/게임 설계표/g, '장수 설계표').replace(/게임 팔레트/g, '나라 팔레트');
  for (const k of ['IDENTITY_GROUPS', 'IDENTITY_EXCLUDED', 'FACE_KEYS', 'FACE_PARAM', 'SIL_PARAM', 'PARAM_GROUP_HELP', 'HAIR_LENGTH_LIMITS', 'EYE_CONTOURS', 'COLOR_HEX', 'COLOR_KEYS', 'AGE_DEFAULT', 'AGE_LINES'])
    assert.equal(JSON.stringify(S[k]), neutral(JSON.stringify(G[k])), k + ' 가 game 표와 다르다 — node tools/port-look-spec.cjs');
  assert.equal(JSON.stringify(S.PARAM_DEFS), neutral(JSON.stringify(G.PARAM_DEFS)), 'PARAM_DEFS 가 game 표와 다르다');
  assert.equal(JSON.stringify(S.PARAM_GUIDES), neutral(JSON.stringify(G.PARAM_GUIDES)), 'PARAM_GUIDES 가 game 표와 다르다');
  for (const axis of Object.keys(S.VOCAB_EN)) for (const [k, v] of Object.entries(G.VOCAB_EN[axis] || {})) assert.equal(S.VOCAB_EN[axis][k], v, axis + '.' + k + ' 가 game 어휘와 다르다');
  for (const k of ['silhouette', 'face', 'identity', 'measurement']) assert.equal(S.LOOK_LINES[k], G.GAME_LINES[k], k + ' 줄');
  console.log('  game 표와 같다(PARAM_DEFS ' + S.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(S.VOCAB_EN).length + ' 묶음)');
} else console.log('  (알림) ../game-atelier 가 없어 game 표와 대조하지 않았다');

/* 3. 설계표의 look — 장수마다 공통 칸(색 · 체형 · 얼굴 설계)과 세 세계의 헤어 · 얼굴형 · 눈. 값은 전부 어휘에 있다(2026-11-02) */
const D = JSON.parse(fs.readFileSync('data/sam-design.json', 'utf8'));
let nLook = 0;
const checkBox = (where, grp, box) => {
  const keys = grp === 'face' ? Object.keys(S.FACE_PARAM) : Object.keys(S.SIL_PARAM);
  const FD = S.FACE_DESIGN || null, own = grp === 'face' ? ['age', 'impression', 'skin_tone', 'eye_size', 'eye_tilt', 'mark', 'expr'] : ['bangs'];
  for (const k of Object.keys(box)) {
    if (own.includes(k)) { assert(FD && (k === 'expr' ? S.EXPRESSION_DETAIL[box[k]] : FD[k][box[k]]), where + ' look.' + grp + '.' + k + ' = ' + box[k] + ' 는 얼굴 설계 어휘에 없다'); nLook++; continue; }
    assert(keys.includes(k), where + ' look.' + grp + '.' + k + ' 는 모르는 칸'); assert(S.VOCAB_EN[k] && S.VOCAB_EN[k][box[k]], where + ' look.' + grp + '.' + k + ' = ' + box[k] + ' 는 어휘에 없다'); nLook++; }
};
for (const g of D.generals) {
  assert(g.look && g.look.face && g.look.silhouette && g.look.why, '장수 ' + g.key + ' look');
  checkBox('장수 ' + g.key, 'face', g.look.face); checkBox('장수 ' + g.key, 'silhouette', g.look.silhouette);
  assert(g.look.silhouette.hair_color && g.look.silhouette.body && g.look.face.eye_color, '장수 ' + g.key + ' 머리색 · 체형 · 눈 색');
  assert(['samguk', 'fantasy', 'mecha'].every(w => g.look.worlds && g.look.worlds[w]), '장수 ' + g.key + ' look.worlds 셋');
  for (const [w, lk] of Object.entries(g.look.worlds)) { checkBox('장수 ' + g.key + ' ' + w, 'face', lk.face || {}); checkBox('장수 ' + g.key + ' ' + w, 'silhouette', lk.silhouette || {});
    assert((lk.silhouette || {}).hair && (lk.face || {}).face_shape && (lk.face || {}).eyes, '장수 ' + g.key + ' ' + w + ' 머리 · 얼굴형 · 눈'); }
}
/* 눈 크기 · 눈꼬리가 그 세계 눈 모양과 부딪치지 않는다(사용자 2026-11-10 「크고 둥근 눈으로」 · 「삼국지 설계표도 다 수정해줘」 — 문앙 무협이
   「smaller, narrower eyes … — large round eyes」 로 나갔다. 고치는 규칙은 tools/sam-design.py fix_eye_clash — 모양을 살리고 그 세계에서만 맞춘다) */
{ const CLASH = [['eye_size', 'small', ['round_large', 'almond_wide']], ['eye_size', 'large', ['narrow_upturned', 'phoenix', 'monolid_long']],
    ['eye_tilt', 'down', ['narrow_upturned', 'phoenix', 'cat']], ['eye_tilt', 'up', ['droopy_soft']]];
  for (const g of D.generals) for (const [w, lk] of Object.entries(g.look.worlds)) {
    const f = Object.assign({}, g.look.face, lk.face || {});
    for (const [k, v, shapes] of CLASH) assert(!(f[k] === v && shapes.includes(f.eyes)), '장수 ' + g.key + ' ' + w + ' ' + k + ' ' + v + ' 가 눈 모양 ' + f.eyes + ' 와 부딪친다');
  }
  const mw = D.generals.find(g => g.key === '문앙');
  assert.equal(Object.assign({}, mw.look.face, mw.look.worlds.samguk.face).eye_size, 'large', '문앙 무협은 크고 둥근 눈');
}
/* 화면 이름(LOOK_KO)은 설계 칸과 같은 열쇠 */
assert(same(Object.keys(S.LOOK_KO.face), Object.keys(S.FACE_PARAM)) && same(Object.keys(S.LOOK_KO.sil), Object.keys(S.SIL_PARAM)), 'LOOK_KO 열쇠');
console.log('PASS 외형 표: 선택지 ' + S.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(S.VOCAB_EN).length + ' 묶음 · 노출 · 설계표 look ' + nLook + '칸(장수 ' + D.generals.length + ') 어휘에 다 있음');
