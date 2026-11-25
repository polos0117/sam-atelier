/* 일상컷 색인(tools/casual-index.cjs, 2026-11-17) — 시험 그림 저장소 둘(fixture)로:
   꼴(허브가 읽는 칸 다 있음 · 한글 칸은 우리 값이면 한글) · 곁가지 기록 합치기 · 계획 파일 필수 표시 읽기 · 코스프레 by · 캐릭터 한글 · 자유 설계 Outfit 줄 뽑기 · 줄이 같으면 안 쓰기 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const X = require('../tools/casual-index.cjs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-index-'));
const S = 'kr_drawn_rim_dewy';
function put(repo, card, file, obj) { const d = path.join(tmp, repo, 'records', card); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, file), typeof obj === 'string' ? obj : JSON.stringify(obj)); }
const rec = (world, n, scene, extra = {}) => ({ atelier: 'sam', card: '조조', world, style: S, scene: { treeV: 2, ...scene }, imported: extra.imported || '2026-11-16T10:00:00Z', generation: extra.generation || {}, prompt: extra.prompt || '' });

/* ── 묶음 A: 조조 무협 — 계획에 코스프레가 있다(상황 컷은 필수 아님) ── */
put('img-a', '조조', `samguk-casual-plan.json`, { card: '조조', world: 'samguk', style: S, fresh: false, slots: [1, 2, 3, 4, 5, 6, 7], required: 'swimwear · nation · cosplay:overwatch/bodysuit · situ:wet · free:lingerie+free', cuts: [1, 2, 3, 4, 5, 6, 7].map(n => ({ n })) });
put('img-a', '조조', `samguk-casual1.${S}-ui.json`, rec('samguk', 1, { era: 'now', place: 'water_pool', ofam: 'swimwear', item: 'classic_bikini', color: 'neutral', shade: 'stone' }));
put('img-a', '조조', `samguk-casual2.${S}-ui.json`, rec('samguk', 2, { era: 'nation', place: 'nation_room', ofam: 'homewear', item: 'oversized_shirt' }));
put('img-a', '조조', `samguk-casual3.${S}-ui.json`, rec('samguk', 3, { era: 'now', place: 'home_living', ofam: 'game_cosplay', item: 'gc_bodysuit', cosplay: { game: 'overwatch', character: 'Tracer', cut: 'bodysuit', round: 1 } },
  { generation: { cosplay: { game: 'overwatch', character: 'Tracer', cut: 'bodysuit' } } }));
put('img-a', '조조', `samguk-casual4.${S}-ui.json`, rec('samguk', 4, { era: 'now', place: 'water_pool', ofam: 'everyday', item: 'jeans_tee', situ: 'wet' }));
put('img-a', '조조', `samguk-casual5.${S}-ui.json`, rec('samguk', 5, { era: 'now', place: 'water_pool', ofam: 'everyday', ofree: true, ofreeFamily: 'lingerie', ofreeSitu: 'free', ofreeRecent: 'x' },
  { generation: { free_design: { Place: 'a', Activity: 'b', Pose: 'c', Framing: 'd', Outfit: 'a moss-green satin set' }, free_prompt: 'Outfit: something else' } }));
put('img-a', '조조', `samguk-casual6.${S}-ui.json`, rec('samguk', 6, { era: 'now', place: 'water_pool', ofam: 'everyday', ofree: true, ofreeRecent: 'x' },
  { generation: { free_prompt: 'FREE DESIGN: design the place, activity, pose, framing and outfit yourself\nPlace: a pier\nOutfit: a cobalt ribbon halter tunic\nAVOID: y' }, prompt: 'Outfit: … (a revealing, fashionable outfit that is not in our outfit catalog)' }));
put('img-a', '조조', `samguk-casual7.${S}-ui.json`, rec('samguk', 7, { era: 'now', place: 'water_pool', ofam: 'everyday', item: 'knit_skirt' }, { imported: '2026-11-17T01:00:00Z' }));
put('img-a', '조조', `samguk-casual90.${S}-ui.json`, rec('samguk', 90, { era: 'now', place: 'water_pool', ofam: 'everyday', own: 'samguk' }));
/* 곁가지 — 막힌 기록 · 다시 짠 계획 · 제출 메모는 줄이 아니다. 같은 컷이 둘째 저장소에도 있으면 한 줄 */
put('img-a', '조조', `samguk-casual4.${S}.blocked.json`, rec('samguk', 4, { era: 'now', place: 'water_pool', ofam: 'lingerie' }));
put('img-a', '조조', `samguk-casual4.${S}-blocked.json`, rec('samguk', 4, { era: 'now', place: 'water_pool', ofam: 'lingerie' }));
put('img-a', '조조', 'samguk-casual1-replan.json', { card: '조조', world: 'samguk', style: S, fresh: false, slots: [1], required: 'lingerie · nation · situ:wind', cuts: [{ n: 1 }] });
put('img-a', '조조', 'samguk-casual2-submitted.md', 'Outfit: x');
put('img-b', '조조', `samguk-casual7.${S}-ui.json`, rec('samguk', 7, { era: 'now', place: 'water_pool', ofam: 'everyday', item: 'knit_skirt',
  posture: 'stand', frame: 'waist_up', body: 'front', camera: 'eye', gaze: 'camera', expr: 'calm', use: 'cup_hold', prop: 'cup', light: 'side', situ: 'wet', ostyle: { material: 'satin' }, aspect: '1:1', right: 'prop', left: 'out', support: 'none', head: 'tilt' }, { imported: '2026-11-17T02:00:00Z' }));

/* ── 묶음 B: 조조 판타지 — 옛 계획(코스프레 없음, situ 있음) → 셋째는 상황 노출. 노출 갈래는 계획이 적은 란제리풍 컷 ── */
put('img-b', '조조', `fantasy-casual-plan.${S}.json`, { card: '조조', world: 'fantasy', fresh: false, slots: [1, 2, 3, 4], required: 'lingerie · nation · situ:wind', cuts: [1, 2, 3, 4].map(n => ({ n })) });
put('img-b', '조조', `fantasy-casual1.${S}-ui.json`, rec('fantasy', 1, { era: 'now', place: 'water_pool', ofam: 'swimwear', item: 'classic_bikini' }, { imported: '2026-11-14T00:00:00Z' }));
put('img-b', '조조', `fantasy-casual2.${S}-ui.json`, rec('fantasy', 2, { era: 'nation', place: 'nation_room', ofam: 'homewear', item: 'oversized_shirt' }, { imported: '2026-11-14T00:00:00Z' }));
put('img-b', '조조', `fantasy-casual3.${S}-ui.json`, rec('fantasy', 3, { era: 'now', place: 'water_pool', ofam: 'everyday', item: 'jeans_tee', situ: 'wind' }, { imported: '2026-11-14T00:00:00Z' }));
put('img-b', '조조', `fantasy-casual4.${S}-ui.json`, rec('fantasy', 4, { era: 'now', place: 'water_pool', ofam: 'lingerie', item: 'lace_set' }, { imported: '2026-11-14T00:00:00Z' }));

/* ── 묶음 C: 조조 메카 — 계획 없음, 옛 1회차 pick(장면 캐릭터 빈 칸, GPT 가 고른 이름은 generation 에만) ── */
put('img-b', '조조', `mecha-casual1.${S}-ui.json`, rec('mecha', 1, { era: 'now', place: 'home_living', ofam: 'game_cosplay', item: 'gc_idol', cosplay: { game: 'langrisser_2', character: '', cut: 'idol', round: 1, used: [] } },
  { imported: '2026-11-15T00:00:00Z', generation: { cosplay: { game: 'langrisser_2', character: 'Liana', cut: 'idol' } } }));
put('img-b', '조조', `mecha-casual2.${S}-ui.json`, rec('mecha', 2, { era: 'now', place: 'water_pool', ofam: 'everyday', item: 'jeans_tee', situ: 'wet' }, { imported: '2026-11-15T00:00:00Z' }));

const repos = [{ name: 'sam-atelier-img', dir: path.join(tmp, 'img-a') }, { name: 'sam-atelier-img-2', dir: path.join(tmp, 'img-b') }];
const doc = X.build(repos, { built: '2026-11-17T00:00:00Z' });

/* 꼴 */
assert.deepEqual(Object.keys(doc), ['version', 'atelier', 'built', 'source', 'rows']);
assert.equal(doc.version, 1); assert.equal(doc.atelier, 'sam'); assert.deepEqual(doc.source, ['sam-atelier-img', 'sam-atelier-img-2']);
const KEYS = ['card', 'name', 'world', 'worldKo', 'n', 'date', 'style', 'path', 'required', 'requiredKo', 'family', 'familyKo', 'item', 'itemKo', 'shade', 'shadeKo', 'cosplay', 'free'];
const HAN = /[가-힣]/;
/* 장면 풀이 s(2026-11-25) — 줄 끝, 있을 때만. 칸은 짧은 열쇠, 빈 칸 · undefined 없음, 우리 값은 한글(en: 1 이면 GPT 가 지은 영어) */
const S_KEYS = ['pl', 'act', 'fr', 'ex', 'gz', 'bd', 'cam', 'ln', 'lt', 'mo', 'cp', 'si', 'os', 'tm', 'ss', 'wt', 'era', 'ar', 'en'];
function sShape(r) {
  if (!('s' in r)) return;
  assert.ok(r.s && Object.keys(r.s).length, r.path + ' s 가 있으면 비지 않는다');
  for (const [k, v] of Object.entries(r.s)) {
    assert.ok(S_KEYS.includes(k), r.path + ' s 칸 ' + k);
    if (k === 'en') { assert.equal(v, 1); continue; }
    assert.equal(typeof v, 'string'); assert.ok(v.trim() && !/undefined|null|\[object/.test(v), r.path + ' s.' + k + ' = ' + v);
    if (!['ln', 'ar'].includes(k) && !(r.s.en && ['pl', 'act', 'fr'].includes(k))) assert.match(v, v === '3/4' ? /^3\/4$/ : HAN, r.path + ' s.' + k + ' 한글');
  }
}
for (const r of doc.rows) {
  sShape(r);
  assert.deepEqual(Object.keys(r).filter((k) => k !== 's' && k !== 'cls' && k !== 'clsKo'), KEYS, r.path + ' 칸');
  if ('s' in r) assert.equal(Object.keys(r).pop(), 's', 's 는 줄 끝');
  for (const k of ['required', 'family', 'item', 'shade', 'world']) if (r[k]) assert.match(r[k + 'Ko'] || '', HAN, `${r.path} ${k}Ko 는 한글`); else if (k !== 'world') assert.equal(r[k + 'Ko'], null, `${r.path} ${k} 가 없으면 ${k}Ko 도 null`);
  assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
  if (r.cosplay) { assert.deepEqual(Object.keys(r.cosplay), ['game', 'gameKo', 'character', 'characterKo', 'cut', 'cutKo', 'by', 'round']); assert.match(r.cosplay.gameKo, HAN); assert.match(r.cosplay.cutKo, HAN); }
  if (r.free) assert.deepEqual(Object.keys(r.free), ['kind', 'kindKo', 'outfit']);
}
const row = (w, n) => doc.rows.filter(r => r.world === w && r.n === n);
/* 곁가지 합치기 — 무협 여덟 컷(1~7 + 90) 한 줄씩, 같은 컷 둘째 저장소 것(늦은 날짜) */
assert.equal(doc.rows.filter(r => r.world === 'samguk').length, 8, '막힌 · 다시 짠 · 메모는 줄이 아니다');
assert.equal(row('samguk', 7).length, 1); assert.equal(row('samguk', 7)[0].path, `sam-atelier-img-2/records/조조/samguk-casual7.${S}-ui.json`);
assert.equal(row('samguk', 4)[0].family, 'everyday', '막힌 기록(란제리)이 아니라 그린 기록');
/* 필수 표시 — 묶음 A */
const req = w => Object.fromEntries(doc.rows.filter(r => r.world === w).map(r => [r.n, r.required]));
assert.deepEqual(req('samguk'), { 1: 'swimwear', 2: 'nation', 3: 'cosplay', 4: null, 5: null, 6: null, 7: null, 90: 'own' }, '계획에 코스프레 — 상황 컷은 필수 아님, 곁가지 계획(replan)의 lingerie 표시는 안 본다');
assert.equal(row('samguk', 1)[0].requiredKo, '노출 갈래(수영복)');
assert.equal(row('samguk', 2)[0].requiredKo, '세계 안');
assert.equal(row('samguk', 90)[0].requiredKo, '캐릭터만의 컷');
assert.equal(row('samguk', 1)[0].shadeKo, '스톤 베이지');
/* 묶음 B — 옛 계획: 노출은 계획이 적은 란제리풍 컷(4), 셋째는 상황 노출 */
assert.deepEqual(req('fantasy'), { 1: null, 2: 'nation', 3: 'situ', 4: 'lingerie' });
assert.match(row('fantasy', 3)[0].requiredKo, /^상황 노출\(바람/);
/* 묶음 C — 계획 없음: 코스프레가 셋째, 상황 컷은 아님 */
assert.deepEqual(req('mecha'), { 1: 'cosplay', 2: null });
/* 코스프레 by */
const c3 = row('samguk', 3)[0].cosplay, m1 = row('mecha', 1)[0].cosplay;
assert.deepEqual([c3.game, c3.character, c3.cut, c3.by, c3.round, c3.cutKo], ['overwatch', 'Tracer', 'bodysuit', 'planner', 1, '바디수트']);
assert.deepEqual([m1.character, m1.by], ['Liana', 'gpt'], '장면 캐릭터가 비고 generation 에만 — gpt');
assert.equal(row('samguk', 3)[0].shade, null); assert.equal(row('samguk', 3)[0].familyKo, '게임 코스프레');
/* 자유 설계 — 갈래 자유는 큰 갈래만, 옷은 GPT 영어 그대로 */
const f5 = row('samguk', 5)[0], f6 = row('samguk', 6)[0];
assert.deepEqual(f5.free, { kind: 'gfree', kindKo: '갈래 자유', outfit: 'a moss-green satin set' }, 'free_design 덩어리가 먼저');
assert.deepEqual([f5.family, f5.familyKo, f5.item], ['lingerie', '란제리풍', null]);
assert.deepEqual(f6.free, { kind: 'ofree', kindKo: '옷 자유', outfit: 'a cobalt ribbon halter tunic' }, 'free_prompt 의 Outfit 줄, 「…」 빈 틀은 건너뛴다');
assert.deepEqual([f6.family, f6.item], [null, null], '자유 설계 칸의 장면 옷은 그림자');
/* 장면 풀이 — 둘째 줄(장소 · 하는 일 · 구도) + 더 보기. 손 · 받침 · 고개는 싣지 않는다. 자유 설계 컷은 GPT 가 채운 줄만(영어, en) */
const s7 = row('samguk', 7)[0].s;
assert.deepEqual(s7, { pl: '수영장', act: '잔을 든다', fr: '허리 위', ex: '차분함', gz: '카메라', bd: '정면', cam: '눈높이', ln: '50mm 표준', lt: '옆 빛', si: '젖은 옷', os: '윤기 나는 새틴', era: '지금 현실', ar: '1:1' });
assert.deepEqual(f5.s, { pl: 'a', act: 'b', fr: 'd', en: 1 }, 'free_design 덩어리 — 우리 장면 값(water_pool)은 그림자');
assert.deepEqual(f6.s, { pl: 'a pier', en: 1 }, '「design the place」 컷 — 채운 줄만, 빈 칸은 뺀다');
assert.equal(row('samguk', 1)[0].s.pl, '수영장'); assert.ok(!('fr' in row('samguk', 1)[0].s), '옛 기록 — 없는 칸은 뺀다');
/* 차례 — 날짜 새것 먼저, 같으면 카드 · 세계 · 번호 */
assert.equal(doc.rows[0].path, `sam-atelier-img-2/records/조조/samguk-casual7.${S}-ui.json`);
for (let i = 1; i < doc.rows.length; i++) assert(doc.rows[i - 1].date >= doc.rows[i].date, '날짜 차례');
/* Outfit 줄 뽑기 — 덩어리 꼴 셋(dict · list · 글) */
assert.equal(X.freeOutfit({ generation: { free_design: ['p', 'a', 'po', 'f', 'a red coat'] } }), 'a red coat');
assert.equal(X.freeOutfit({ generation: { free_design: 'FREE DESIGN:\nPlace: x\nOutfit: a blue dress\n' } }), 'a blue dress');
assert.equal(X.freeOutfit({ generation: { free_design: { outfit: '…' } }, prompt: 'Outfit: … (template)' }), null);
/* 캐릭터 한글 — characters[].ko → 주인공 하나 character_ko → null, 이름은 대소문자 · 빈칸 무시 */
const gc = { games: [{ key: 'a', many: true, characters: [{ name: 'Chun-Li', ko: '춘리' }, { name: 'Cammy' }] }, { key: 'b', many: false, character: 'Geralt of Rivia', character_ko: '게롤트' }] };
assert.equal(X.characterKo(gc, 'a', '  chun-li '), '춘리');
assert.equal(X.characterKo(gc, 'a', 'Cammy'), null);
assert.equal(X.characterKo(gc, 'b', 'Geralt'), '게롤트', '주인공 하나 게임은 기록 이름이 달라도 그 주인공');
assert.equal(X.characterKo(gc, 'zz', 'x'), null);
/* 줄이 같으면 안 쓴다(built 만 바뀌는 커밋 막기) */
const out = path.join(tmp, 'casual-index.json');
assert.equal(X.write(doc, out), true);
assert.equal(X.write({ ...doc, built: '2026-11-18T00:00:00Z' }, out), false);
assert.equal(JSON.parse(fs.readFileSync(out, 'utf8')).built, '2026-11-17T00:00:00Z');
assert.equal(fs.readFileSync(out, 'utf8').split('\n').length, 2, '한 줄 JSON');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`PASS 일상컷 색인: 줄 ${doc.rows.length} · 꼴 · 한글 칸 · 곁가지 합치기 · 계획 필수 표시(코스프레 / 옛 상황) · 코스프레 by · 캐릭터 한글 · Outfit 줄 · 그대로 두기`);
/* 실루엣 갈래(2026-11-25) — cls 가 있으면 한글 clsKo 도 있다, 수영복 · 란제리 줄 가운데 얼마는 cls 를 가진다 */
{ const R = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', 'casual-index.json'), 'utf8')).rows; for (const r of R) if (r.cls) require('assert').ok(r.clsKo, 'clsKo ' + r.path); require('assert').ok(R.some((r) => r.cls), '실루엣 갈래 줄이 하나도 없다'); }
