/* 새 판(draft2) 규칙 검사 — lib/draft2/rules.js · lib/draft2/art.js(순수 쪽) · tools/draft2-extract.cjs.
   자료 뽑기가 draft.html 과 같고 다시 돌려도 같은지, 정원 · 채점(결의 · 불화 · 결속 · 주공), AI 가 고를 수 있는 카드만 고르는지,
   더미 · 펼친 후보 · 두 진영에 장수가 겹치거나 사라지지 않는지, 씨앗이 같으면 같은 판인지, 이어하기 모양.
   Run: node tests/draft2-rules.cjs */
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const R = require(path.join(ROOT, 'lib/draft2/rules.js'));
const A = require(path.join(ROOT, 'lib/draft2/art.js'));
const X = require(path.join(ROOT, 'tools/draft2-extract.cjs'));
let checks = 0;
const ok = (c, m) => { assert(c, m); checks++; };

/* ── 자료 뽑기 ── */
const text = X.render(X.extract());
ok(text === X.render(X.extract()), '두 번 뽑아도 같은 글자');
ok(text === fs.readFileSync(path.join(ROOT, 'data/draft2-combos.json'), 'utf8'), 'data/draft2-combos.json 이 draft.html 과 같다 — node tools/draft2-extract.cjs');
const CB = J('data/draft2-combos.json'), S = J('data/sam-design.json'), GN = J('data/draft2-generals.json');
ok(CB.combos.length === 250, '결의 250 — ' + CB.combos.length);
ok(CB.combos.some(c => c.k) && CB.combos.some(c => Object.values(c.t).some(v => v < 0)), '혈연 · 불화가 있다');
const names = new Set(S.generals.map(g => g.key));
ok(CB.combos.every(c => c.m.every(n => names.has(n))), '결의 사람은 모두 설계표의 장수');
ok(CB.syn[2] === 22 && CB.syn[11] === 505 && CB.etcBase === 0.4, '결속 표 · 군웅 계수');
const doTao = CB.combos.find(c => c.n === '도원결의');
ok(doTao && doTao.t[3] === 90 && doTao.m.join() === '유비,관우,장비', '도원결의 3인 90');

/* ── 자료 → 카드 ── */
const db = R.buildDB(GN, S, CB);
ok(db.list.length === 279, '장수 279');
const by = db.by;
ok(by['관우'].s.war === GN.generals.find(g => g.key === '관우').stats.war, '능력치는 draft2-generals.json');
ok(by['관우'].fac === 'shu' && by['관우'].role === 'general' && by['관우'].cat === 'general', '진영 · 역할은 설계표');
ok(by['왕이'].cat === 'staff' && by['왕이'].cls === 'archer', '왕이 — 지명은 참모 자리, 갈래 궁장');
ok(by['유비'].trait === 'benevolent' && by['손권'].trait === 'defender', '군주 기질');
{ const c = by['관우'], w = R.WT.general;
  ok(c.pw === Math.round((c.s.lead * w[0] + c.s.war * w[1] + c.s.int * w[2] + c.s.pol * w[3]) / 2.5), '전력 식 (관우)'); }
{ const c = by['장비'];   // 무력 95 이상 · 지력 70 아래 → 옛 판의 무용 보정
  const w = R.WT.general, base = Math.round((c.s.lead * w[0] + c.s.war * w[1] + c.s.int * w[2] + c.s.pol * w[3]) / 2.5);
  ok(c.pw === base + Math.round((c.s.war - 90) * Math.max(0, 70 - c.s.int) / 40) && c.pw > base, '무용 보정 (장비)'); }

/* ── 채점 ── */
{
  const ev = R.evaluateRaw(db, ['유비', '관우', '장비']);
  ok(ev.rows.some(r => r.label === '도원결의' && r.v === 90), '도원결의 3인 → +90');
  ok(ev.rows.some(r => r.kind === 'syn' && r.v === CB.syn[3]), '촉 3인 결속');
  const lord = ev.rows.find(r => r.kind === 'lord');
  ok(lord && lord.lord === '유비' && lord.v > 0, '주공 그릇');
  ok(ev.total === ev.rows.reduce((s, r) => s + r.v, 0), '합계 = 줄의 합');
  const feud = R.evaluateRaw(db, ['양의', '위연']);
  ok(feud.rows.some(r => r.kind === 'feud' && r.v === -40), '불화 · 양의와 위연 → -40');
  const qun = R.evaluateRaw(db, ['동탁', '여포', '초선', '이각']);
  const syn = qun.rows.find(r => r.kind === 'syn' && r.fac === 'qun'), etc = qun.rows.find(r => r.kind === 'etc');
  ok(syn && syn.v === Math.round(CB.syn[4] * 0.4) && etc && etc.v === Math.round(CB.syn[4] * 0.75) - Math.round(CB.syn[4] * 0.4), '군웅 4인 — 40% + 할거');
  const h = R.hintOf(db, ['유비', '관우'], '장비');
  ok(h.d === R.evaluate(db, ['유비', '관우', '장비']).total - R.evaluate(db, ['유비', '관우']).total && h.names.some(n => n.label === '도원결의'), '뽑으면 +얼마 · 깊어지는 결의');
}
/* 11명 넘으면 정원 초과가 가장 적은 11명 */
{
  const team = ['유비', '조조', '관우', '장비', '조운', '마초', '황충', '여포', '제갈량', '사마의', '순욱', '곽가', '주유'];
  const b = R.bestLineup(db, team);
  ok(b.team.length === 11 && b.over === R.overflow(db, b.team), '편성 11');
  ok(R.counts(db, b.team).lord <= 1, '군주 둘이면 하나를 뺀다');
  ok(b.over === 0 && R.counts(db, b.team).general <= 5, '군주 둘 · 무장 여섯 → 하나씩 빼서 정원을 맞춘다 — ' + b.over);
  const many = ['관우', '장비', '조운', '마초', '황충', '위연', '마대', '관평', '장포', '관흥', '왕평', '유비', '제갈량'];
  ok(R.bestLineup(db, many).over === R.overflow(db, many) - 2 && R.bestLineup(db, many).over > 0, '무장만 많으면 넘침을 가장 적게');
}

/* ── 판 돌리기 — 두 자리 모두 AI ── */
function play(seed, keys, lvMe, lvFoe, o) {
  o = o || {};
  const st = R.newGame(db, { keys, seed, lv: lvFoe });
  const all = new Set(keys);
  const picks = { me: [], foe: [] };
  let guard = 0;
  while (st.phase === 'draft' && guard++ < 200) {
    const seat = R.turn(st);
    if (!seat) { R.endRound(db, st); continue; }
    R.ensureChoices(db, st, seat);
    const team = R.teamOf(st, seat).slice(), legal = R.legal(db, st, seat), open = R.openIdx(st);
    const raw = open.filter(i => { const c = by[st.pack[i].k]; return team.length >= R.FINAL || R.counts(db, team)[c.cat] < R.CAPS[c.cat]; });
    const act = R.aiAct(db, st, seat, seat === 'me' ? lvMe : lvFoe, seat === 'me' ? (o.styleMe || 0) : undefined);
    if (act.type === 'reroll') { assert.strictEqual(R.turn(st), seat, '다시 뽑아도 차례는 그대로'); continue; }
    assert(legal.includes(act.idx), `AI 가 고를 수 없는 카드를 골랐다 (씨앗 ${seed} ${st.round}진)`);
    assert(raw.length === 0 || raw.includes(act.idx), '정원이 찬 역할을 골랐다');
    picks[seat].push(act.key);
    /* 장수는 한 곳에만 — 더미 · 펼친 후보 · 아군 · 적장 */
    const where = st.pool.concat(st.pack.filter(e => !e.by).map(e => e.k), st.mine, st.foe);
    assert.strictEqual(where.length, new Set(where).size, '장수가 두 곳에 있다');
    assert.strictEqual(where.length, all.size, '장수가 사라졌다');
    assert(where.every(k => all.has(k)), '범위 밖 장수');
  }
  assert.strictEqual(st.phase, 'lineup', '13진이 끝나면 편성');
  assert.strictEqual(st.mine.length, R.ROUNDS); assert.strictEqual(st.foe.length, R.ROUNDS);
  assert.deepStrictEqual(st.mine, picks.me); assert.deepStrictEqual(st.foe, picks.foe);
  for (const t of [st.mine, st.foe]) {
    const n = R.counts(db, t.slice(0, R.FINAL));
    assert(n.lord <= 1 && n.general <= 5 && n.staff <= 5 || R.overflow(db, t.slice(0, R.FINAL)) <= 2, '11번째까지 정원');
  }
  const res = R.finalize(db, st, st.lineup);
  assert.strictEqual(res.me.total, R.evaluateRaw(db, st.lineup).total);
  assert.strictEqual(res.op.total, R.bestLineup(db, st.foe).score);
  assert.strictEqual(st.phase, 'done');
  return st;
}
const order = A.styleOrder(J('data/style.json')), IMG = J('data/img.json').img;
const artKeys = w => db.list.filter(c => A.hasArt(IMG, order, c.key, w)).map(c => c.key);
for (const w of A.WORLDS) {
  const keys = artKeys(w);
  ok(keys.length >= R.ROUNDS * 2 + R.PACK, w + ' 그림 있는 장수 ' + keys.length);
  for (let s = 1; s <= 12; s++) { play(1000 * s + w.length, keys, s % 3, (s + 1) % 3, { styleMe: s % 5 }); checks++; }
}
for (let s = 1; s <= 6; s++) { play(77 + s, db.list.map(c => c.key), 2, s % 3); checks++; }

/* 같은 씨앗 → 같은 판, 다른 씨앗 → 다른 판 */
{
  const keys = artKeys('samguk');
  const a = play(4242, keys, 1, 2), b = play(4242, keys, 1, 2), c = play(4243, keys, 1, 2);
  ok(JSON.stringify(a) === JSON.stringify(b), '씨앗이 같으면 같은 판');
  ok(JSON.stringify(a.log) !== JSON.stringify(c.log), '씨앗이 다르면 다른 판');
  ok(R.todaySeed(new Date(2026, 10, 12), 'x') === R.todaySeed(new Date(2026, 10, 12), 'x') && R.todaySeed(new Date(2026, 10, 12), 'x') !== R.todaySeed(new Date(2026, 10, 13), 'x'), '오늘의 씨앗은 날짜로');
}

/* 다시 뽑기 — 펼친 것과 겹치지 않는 새 6장, 한 번만 */
{
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 9, lv: 0, first: 'me' });
  ok(R.turn(st) === 'me' && st.pack.length === R.PACK, '첫 진 · 아군 선공 · 6장');
  const before = st.pack.map(e => e.k), n = R.reroll(db, st, 'me');
  ok(n === R.PACK && st.pack.every(e => !before.includes(e.k)) && st.rerolls.me === 0, '새 6장');
  ok(R.reroll(db, st, 'me') === 0, '횟수가 없으면 그대로');
  ok(R.turn(st) === 'me', '다시 뽑아도 차례는 아군');
  let threw = false; try { R.pick(db, st, 'foe', 0); } catch (e) { threw = true; }
  ok(threw, '차례가 아닌 자리는 못 고른다');
}
/* 정원 — 군주를 하나 가지면 다음 군주는 막힌다(다른 후보가 있으면) */
{
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 31, lv: 0, first: 'me' });
  st.mine.push('조조');
  st.pack[0].k = '유비'; st.pool = st.pool.filter(k => k !== '유비' && k !== '조조');
  const L = R.legal(db, st, 'me');
  ok(!L.includes(0) && L.length > 0, '군주 정원이 차면 군주 후보는 막힌다');
  let threw = false; try { R.pick(db, st, 'me', 0); } catch (e) { threw = true; }
  ok(threw, '막힌 후보는 못 고른다');
}
/* 이어하기 — JSON 왕복 */
{
  const st = R.newGame(db, { keys: artKeys('fantasy'), seed: 5, lv: 1, world: 'fantasy' });
  R.aiAct(db, st, R.turn(st));
  const back = R.restore(db, JSON.parse(JSON.stringify(st)));
  ok(back && JSON.stringify(back) === JSON.stringify(st), '이어하기 — 저장한 그대로');
  ok(R.restore(db, Object.assign({}, st, { mine: ['없는장수'] })) === null, '모르는 장수는 버린다');
  ok(R.restore(db, Object.assign({}, st, { v: 9 })) === null, '판이 다르면 버린다');
}
/* 그림 고르기 — 기본 화풍이 먼저, 없으면 style.json 차례 */
{
  const def = J('data/style.json').default;
  const withDef = Object.keys(IMG).find(k => IMG[k].byStyle[def] && IMG[k].byStyle[def].byForm && IMG[k].byStyle[def].byForm.samguk && IMG[k].byStyle[def].byForm.samguk.f);
  if (withDef) ok(A.fileFor(IMG, order, withDef, 'samguk') === IMG[withDef].byStyle[def].byForm.samguk.f, '기본 화풍 그림이 먼저');
  ok(A.fileFor(IMG, order, '없는장수', 'samguk') === null && A.fileFor(IMG, order, '유비', 'nowhere') === null, '없으면 null');
}
console.log('draft2-rules ok —', checks, '가지');
