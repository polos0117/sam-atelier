/* 프롬프트 v2 — 구조판 지시문(lib/prompt-sam.js buildStruct, 화풍 glossy_kv, 2026-11-05). node tests/prompt-v2.cjs
   - 모든 장수 × 세계 셋: 공통 규칙 → 1절(세계 몫) → 2 · 3 · 4절 칸이 빠짐없이, 빈 칸 · undefined 없음
   - 설계표가 쓰는 외형 값은 모두 한글 표(STRUCT.ko · body)에 있다(영어로 새지 않는다)
   - 무협 · 판타지 1절엔 SF 낱말이 없다, 메카 실루엣은 고른 때만 3절에, 기본 화풍(kr_mmorpg) 지시문은 그대로 영어 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const R = path.join(__dirname, '..'), ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec, ST = T.STRUCT;
const D = JSON.parse(fs.readFileSync(path.join(R, 'data/sam-design.json'), 'utf8')), S = JSON.parse(fs.readFileSync(path.join(R, 'data/style.json'), 'utf8'));
const STYLE = process.env.V2_STYLE || 'glossy_plain', sv = S.styles[STYLE].versions.find(v => v.v === S.styles[STYLE].current);
/* 세 판 다 구조판 — glossy_plain(지금 v2) · anime_kv · glossy_kv(앞 판) */
for (const k of ['glossy_plain', 'anime_kv', 'glossy_kv']) { const x = S.styles[k].versions.find(v => v.v === S.styles[k].current); assert(x.format === 'structured' && x.section1 && x.section1_worlds.samguk && x.section1_sil.fantasy, k); }
{ const x = S.styles.anime_kv.versions[0]; for (const t of [x.section1, ...Object.values(x.section1_worlds), ...Object.values(x.section1_sil)]) assert(/일본 애니메이션풍/.test(t) && /얼굴 작화 기준: 고급 애니메이션/.test(t) && !/반실사 미형 얼굴 조형/.test(t), 'anime_kv 얼굴은 애니'); }
{ const x = S.styles.glossy_plain.versions[0]; for (const t of [x.section1, ...Object.values(x.section1_worlds), ...Object.values(x.section1_sil)]) assert(!/애니메이션|미소녀|얼굴 작화 기준/.test(t), 'glossy_plain 에 애니메이션 말 없음'); }
assert.equal(sv.format, 'structured'); assert(sv.rules && sv.section1 && sv.section1_worlds.samguk && sv.section1_worlds.fantasy);
let n = 0;
for (const key of P.cards(D)) for (const w of ['samguk', 'fantasy', 'mecha']) {
  const p = P.build(D, S, key, w, { style: STYLE, shot: { frame: 'free' } });
  assert(p.startsWith(sv.rules), key + ' ' + w + ' 공통 규칙이 맨 앞');
  assert(p.includes(w === 'mecha' ? sv.section1 : sv.section1_worlds[w]), key + ' ' + w + ' 1절은 세계 몫');
  for (const name of ST.s2.concat(ST.s3, ST.s4)) assert(p.includes('\n' + name + (ST.heading.includes(name) ? ':' : ': [')), key + ' ' + w + ' 칸 ' + name);
  assert(!/\[\]|undefined|\{\w+\}/.test(p), key + ' ' + w + ' 빈 칸 · 못 채운 자리');
  assert(p.includes('실루엣: [' + ST.fixed.silFree + ']'), '실루엣 free 면 자유');
  const g0 = D.generals.find(g => g.key === key), ds = T.SILHOUETTES[w].find(m => m.key === g0.worlds[w].sil);
  assert(ds && P.build(D, S, key, w, { style: STYLE }).includes('실루엣: [' + ds.kot), key + ' ' + w + ' 안 고르면 장수 설계 실루엣');
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
for (const [w, k] of [['samguk', 'water_sleeves'], ['fantasy', 'gown_armor']]) assert(P.build(D, S, P.cards(D)[0], w, { style: STYLE, shot: { frame: k } }).includes('실루엣: [' + T.SILHOUETTES[w].find(m => m.key === k).kot + ST.fixed.silFirst + ']'), w + ' 실루엣이 3절에 — 역할 옷보다 우선');
for (const w of ['samguk', 'fantasy']) { const p2 = P.build(D, S, P.cards(D)[0], w, { style: STYLE, shot: { frame: T.SILHOUETTES[w][0].key } }); assert(p2.includes('프레임 종류: [' + ST.fixed.frameKindSil.split('(')[0]), w + ' 실루엣을 고르면 역할 옷은 빠진다'); }
assert(P.build(D, S, P.cards(D)[0], 'fantasy', { style: STYLE }).includes('디자인 방식: [' + ST.worlds.fantasy.designHead), '판타지는 서양 옷만을 맨 앞에');
for (const w of ['samguk', 'fantasy']) { const on2 = P.build(D, S, P.cards(D)[0], w, { style: STYLE, shot: { frame: T.SILHOUETTES[w][1].key } }), off2 = P.build(D, S, P.cards(D)[0], w, { style: STYLE, shot: { frame: 'free' } });
  assert(on2.includes('지켜야 할 것: [' + ST.worlds[w].rulesSil + ']') && on2.includes('노출 범위: [' + ST.worlds[w].expoSil + ']'), w + ' 실루엣이면 옷 종류 없는 규칙 · 노출');
  assert(on2.includes(sv.section1_sil[w]) && !on2.includes(sv.section1_worlds[w]) && !/거즈|벨벳|흐르는 주름/.test(sv.section1_sil[w]), w + ' 실루엣이면 천 낱말 없는 1절');
  assert(on2.includes('캐릭터가 묻어나는 곳: [' + ST.fixed.traitsSil) && !off2.includes(ST.fixed.traitsSil), w + ' 실루엣이면 특징은 장신구로만');
  assert(off2.includes('지켜야 할 것: [' + ST.worlds[w].rules + ']') && off2.includes('노출 범위: [' + ST.worlds[w].expo + ']'), w + ' 안 고르면 그대로'); }
/* 장수 설계 실루엣 — 모든 장수 · 세계에 표의 값, 갈래마다 고르게(tools/sil-spread.py — 사용자 2026-11-06 「장수마다 고르게 분배하자」) */
for (const [w, list] of Object.entries(T.SILHOUETTES)) { const cnt = Object.fromEntries(list.map(m => [m.key, 0]));
  for (const g of D.generals) { const k = ((g.worlds || {})[w] || {}).sil; assert(k in cnt, g.key + ' ' + w + ' 설계 실루엣 ' + k); cnt[k]++; }
  const v = Object.values(cnt); assert(Math.max(...v) - Math.min(...v) <= 3, w + ' 실루엣 고르게 ' + JSON.stringify(cnt)); }
/* kv_jp_mobile(2026-11-06 사용자 「이것도 옮겨줘」) — 일본 리얼 모바일게임 지시문 꼴: 머리말 · STYLE · ANATOMY 는 그 글, 인물 · 옷 · 장면은 설계표에서. 칸이 다 차고, 공용 줄의 WORLD 칸 이름은 바꿔 적는다 */
/* kv_jp_paint(같은 날 사용자 「이거 화풍추가」) — 일본 유화풍 지시문 꼴, ANATOMY AND FINISH */
for (const [sk, anat] of [['kv_jp_mobile', 'ANATOMY: Exactly one head'], ['kv_jp_paint', 'ANATOMY AND FINISH: One head'], ['kv_anime_gloss', 'ANATOMY AND FINISH: One head']]) { const jv = S.styles[sk].versions.find(v => v.v === S.styles[sk].current); let nj = 0;
  for (const key of P.cards(D)) for (const w of ['samguk', 'fantasy', 'mecha']) { const p = P.build(D, S, key, w, { style: sk });
    assert(p.startsWith('Use case: stylized-concept.') && p.includes(jv.section1) && p.includes('\n\n' + anat) && p.includes('COMPOSITION AND SCENE: Single vertical 2:3'), key + ' ' + w + ' ' + sk + ' 꼴');
    assert(!/\{\w+\}|undefined|WORLD describes/.test(p), key + ' ' + w + ' ' + sk + ' 빈 칸'); nj++; }
  console.log('PASS ' + sk + ': ' + nj + '장'); }
/* 1절 세계 몫엔 SF 낱말이 없다 */
for (const w of ['samguk', 'fantasy']) assert(!/SF|기계|장갑|크롬|발광|나사|케이블|도장/.test(sv.section1_worlds[w]), w + ' 1절에 SF 낱말');
/* 메카 실루엣 · 고른 자세 · 시간대 · 장면 변주 */
const k0 = P.cards(D)[0], sc = (P.card(D, k0).faction.worlds.mecha.scenes || [])[0];
const on = P.build(D, S, k0, 'mecha', { style: STYLE, shot: { frame: 'full_armor', pose: 'kneel', time: 'night', scene: sc && sc.key } });
assert(on.includes('실루엣: [' + T.MECHA_SILHOUETTES.find(m => m.key === 'full_armor').kot + ']'));
assert(on.includes('액션: [' + ST.ko.pose.kneel + ']') && on.includes('광원: [' + ST.ko.time.night + ']'));
if (sc) assert(on.includes(ST.words.scene + sc.ko));
assert(!P.build(D, S, k0, 'samguk', { style: STYLE, shot: { frame: 'full_armor' } }).includes(T.MECHA_SILHOUETTES.find(m => m.key === 'full_armor').kot), '메카 아닌 세계엔 실루엣 없음');
/* 군웅 무리별 세력색(2026-11-05) — 무리 palette · 메카 설계가 v1 · v2 둘 다에. 무리 색이 없으면(그 밖의 제후) 군웅 색 */
{ const qun = D.factions.find(f => f.key === 'qun');
  for (const cp of qun.camps) { const g = D.generals.find(x => x.camp === cp.key); if (!g) continue;
    const want = cp.palette ? cp.palette.en : qun.palette.en;
    for (const w of ['samguk', 'mecha']) { assert(P.build(D, S, g.key, w, { style: STYLE }).includes(want), g.key + ' ' + w + ' 무리 색(v2)'); assert(P.build(D, S, g.key, w, { style: S['default'] }).includes(want), g.key + ' ' + w + ' 무리 색(v1)'); }
    if (cp.mecha) { assert(P.build(D, S, g.key, 'mecha', { style: STYLE }).includes(cp.mecha.design), g.key + ' 무리 메카 설계(v2)'); assert(P.build(D, S, g.key, 'mecha', { style: S['default'] }).includes(cp.mecha.design), g.key + ' 무리 메카 설계(v1)'); }
    if (cp.persona) assert(P.build(D, S, g.key, 'samguk', { style: STYLE }).includes(cp.persona), g.key + ' 무리 성격'); } }
/* 기본 화풍은 그대로 */
assert(/^CONCEPT: /.test(P.build(D, S, k0, 'mecha', { style: 'kr_mmorpg' })), 'kr_mmorpg 는 영어 지시문 그대로');
/* 기준 판 kv_kmmo_lock(2026-11-05 기본) — 영문 네 칸, 1절 고정, 얼굴 · 헤어는 세 세계 같은 값, 흔들리는 값은 바꿔 끼움, 손에는 지정한 물건만 */
{ assert(['kv_kmmo_lock', 'kv_kmmo_23d'].includes(S['default']));
  const KV0 = S.styles[S['default']], kv = KV0.versions.find(v => v.v === KV0.current); assert.equal(kv.format, 'kv');
  assert(/GENRE LOCK/.test(kv.section1) && /Korean MMORPG/.test(kv.section1) && !/anime|gacha|JP/i.test(kv.section1), '1절 — 한국 MMORPG + 장르 고정, 애니 낱말 없음');
  let nk = 0;
  for (const key of P.cards(D)) { const ps = ['samguk', 'fantasy', 'mecha'].map(w => P.build(D, S, key, w, {}));
    const face = ps.map(p => { const i = p.search(/A (?:small, )?refined, beautiful/), j = p.indexOf(kv.s3.split('{')[0]); return i >= 0 && j > i ? p.slice(i, j) : ''; });   /* 얼굴부터 2절 끝까지 — 세 세계 같다(성정 줄은 세계 덧줄이 있어 뺀다) */
    assert(face[0] && face[0] === face[1] && face[1] === face[2], key + ' 세 세계 같은 얼굴 · 헤어');
    for (const p of ps) { assert(p.startsWith(kv.head.split('{')[0]) && p.includes(kv.section1) && p.includes(kv.s3.split('{')[0]) && p.includes(kv.s4.split('\n')[0]) && p.includes('no cup, goblet or other props'), key + ' 네 칸');
      assert(!/hime cut|wolf cut|button nose|droopy|falling over one eye|\{/.test(p), key + ' 흔들리는 값 · 빈 칸'); assert(!/anime|manga|gacha/i.test(p.split('\n\n').slice(2).join(' ')), key + ' 2 · 3 · 4절에 애니 낱말 없음'); assert(/Hair: muted, low-saturation /.test(p) && !/Hair: [^.]*\b(?:vivid|bright) /.test(p), key + ' 머리색만 저채도(v3)'); assert(/never thin, flat or boyishly straight/.test(p) && /EXPOSURE \(bold\)/.test(p), key + ' v4 볼륨 · 기본 노출'); nk++; } }
  const mh = P.build(D, S, '맹획', 'mecha', {}); assert(/[Ff]action (?:mecha design|frame): bronze-gold and deep-crimson/.test(mh) && /solid engraved metal armour/.test(mh), '메카 — 무리 설계 · 판금처럼');
  assert(P.build(D, S, '맹획', 'mecha', { shot: { frame: 'full_armor' } }).includes('Overall silhouette: '), '실루엣을 고르면 3절에');
  /* v5(2026-11-06) — 일상컷에만 촉촉한 피부 광택 줄, 세계 그림엔 없다 */
  if (kv.casualSkin) { const C = require('../tools/casual-plan.cjs'), card = C.cardOf('조조'); card.world = 'samguk';
    const cut = C.plan(card, [1], [], { seed: 5 }).cuts[0], cp = C.record(card, 'samguk', cut).prompt;
    assert(cp.includes(kv.casualSkin), '일상컷에 피부 광택 줄'); assert(!P.build(D, S, '조조', 'samguk', {}).includes(kv.casualSkin), '세계 그림엔 피부 광택 줄 없음');
    /* 피부 광택 단계(2026-11-06 「광택효과를 선택 할 수 있게 … 단계별로」) — 고르면 그 단계 줄 하나만, 안 고르면 화풍 기본 */
    /* 2026-11-07 「조명 : 참고 그림 그대로 빼고 > 자연광」 · 「일상컷 케릭터에 몸 라인을 강조하는 문구」 — STYLE 줄은 조명을 넘기지 않고, 몸 라인 줄은 일상컷 공통 · 세계 그림엔 없다 */
    assert(!/lighting quality/.test(cp) && /^STYLE: keep the attached image's rendering exactly/m.test(cp), '일상컷 STYLE 줄에 조명 없음');
    assert(T.CASUAL.bodyLine.startsWith('BODY LINE: ') && cp.includes(T.CASUAL.bodyLine) && !P.build(D, S, '조조', 'samguk', {}).includes(T.CASUAL.bodyLine), '일상컷 몸 라인 줄');
    assert(/face and body/.test(T.CASUAL.faceLight), '자연광은 몸까지');
    /* 얼굴 자연광 — 일상컷 공통(2026-11-06 「자연광은 일상컷 공통으로」), 세계 그림엔 없다 */
    assert(T.CASUAL.faceLight.startsWith('LIGHT: ') && cp.includes(T.CASUAL.faceLight) && !P.build(D, S, '조조', 'samguk', {}).includes(T.CASUAL.faceLight), '일상컷 얼굴 자연광 줄');
    { const tr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/casual-tree.json'), 'utf8')), tr2 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/casual-tree-v2.json'), 'utf8')), { n: n0, ...sc0 } = cut;
      for (const sk of Object.keys(S.styles)) assert(P.casualRecord(D, S, '조조', sc0, { world: 'samguk', style: sk, tree: tr, tree2: tr2 }, n0).prompt.includes(T.CASUAL.faceLight), sk + ' 일상컷 얼굴 자연광'); }
    const GL = T.CASUAL.glosses; assert.equal(GL.map(g => g.key).join(), 'matte,soft,dewy,glossy', '광택 네 단계');
    assert.equal(GL.find(g => g.key === 'dewy').en, kv.casualSkin, '촉촉하게 = 기준 판 기본 광택 글'); assert.equal(P.glossDefault(S, S.default), kv.casualSkin);
    for (const g of GL) { assert(g.en.startsWith('SKIN: ') && g.ko, g.key);
      const c2 = JSON.parse(JSON.stringify(cut)); c2.gloss = g.key; const pp = C.record(card, 'samguk', c2).prompt;
      assert(pp.includes(g.en) && GL.filter(o => o.key !== g.key).every(o => !pp.includes(o.en)), g.key + ' 단계 줄 하나만');
      assert.equal(pp.split('\n').filter(l => !l.startsWith('SKIN:')).join('\n'), cp.split('\n').filter(l => !l.startsWith('SKIN:')).join('\n'), g.key + ' 광택 줄 말고는 같다'); } }
  console.log('PASS 기준 판: ' + nk + '장'); }
console.log('PASS 프롬프트 v2: 구조판 ' + n + '장(장수 ' + P.cards(D).length + ' × 세계 3) — 칸 빠짐없이 · 외형 한글 표 · 1절 세계 몫 · 메카 실루엣 · 자세 · 시간대 · 장면 · 기본 화풍 그대로');
