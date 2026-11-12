/* 새 판(draft2) 규칙 검사 — lib/draft2/rules.js · lib/draft2/art.js(순수 쪽) · tools/draft2-extract.cjs.
   자료 뽑기가 draft.html 과 같고 다시 돌려도 같은지, 정원 · 채점(결의 · 불화 · 결속 · 주공), AI 가 고를 수 있는 카드만 고르는지,
   더미 · 펼친 후보 · 두 진영에 장수가 겹치거나 사라지지 않는지, 씨앗이 같으면 같은 판인지, 이어하기 모양.
   군웅록(거친 세력마다 결속 · 결속 배수 · 주공 동향 · 적장 기치)과 3인전(정립 — 셋째 자리 · 차례 · 순위)도 본다.
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
const PK = J('data/draft2-packs.json');
ok(X.renderPacks(X.extractPacks()) === fs.readFileSync(path.join(ROOT, 'data/draft2-packs.json'), 'utf8'), 'data/draft2-packs.json 이 draft.html 과 같다');
ok(PK.default === 'mx' && PK.packs.mx.n === '군웅록' && PK.packs.mx.synMul === 0.8 && PK.packs.mx.bias === 25, '군웅록이 기본 팩 — 결속 0.8배 · 기치 25');
ok(S.generals.every(g => Array.isArray(PK.packs.mx.career[g.key]) && PK.packs.mx.career[g.key].every(f => PK.packs.mx.factions[f])), '군웅록 — 279명 모두 이력, 세력은 다 표에');
ok(PK.packs.mx.career['여포'].join() === '동탁,여포' && PK.packs.mx.career['진도'].join() === '촉한', '덧붙인 Object.assign 까지(진도)');
ok(['w194', 'gd200', 'jb208', 'end263'].every(k => PK.packs[k].facMap && Object.keys(PK.packs[k].facMap).every(n => names.has(n))), '다른 팩 넷 — 자료만');
const doTao = CB.combos.find(c => c.n === '도원결의');
ok(doTao && doTao.t[3] === 90 && doTao.m.join() === '유비,관우,장비', '도원결의 3인 90');

/* ── 자료 → 카드 ── */
const FC = J('data/draft2-factions.json'), BD = J('data/draft2-bonds.json'), SY = FC.cohesion.syn;
const db = R.buildDB(GN, S, CB, PK, FC, BD), mx = R.view(db, 'mx');
ok(db.mode === 'base' && mx.mode === 'mx' && R.view(mx, 'base') === db && R.view(db, 'mx') === mx, '진영 셈 view');
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
  ok(ev.rows.some(r => r.kind === 'syn' && r.v === SY[3]), '촉 3인 결속');
  const lord = ev.rows.find(r => r.kind === 'lord');
  ok(lord && lord.lord === '유비' && lord.v > 0, '주공 그릇');
  ok(ev.total === ev.rows.reduce((s, r) => s + r.v, 0), '합계 = 줄의 합');
  const feud = R.evaluateRaw(db, ['양의', '위연']);
  ok(feud.rows.some(r => r.kind === 'feud' && r.v === -40), '불화 · 양의와 위연 → -40');
  /* 위촉오+군웅(base) — 군웅을 한 덩어리로 묶지 않고 장수마다 주 세력 */
  ok(Object.values(db.facs).every(f => f.length === 1 && f[0] !== '군웅'), '본편 셈에 「군웅」 한 덩어리가 없다');
  ok(R.facOf(db, '관우') === '촉한' && R.facOf(db, '조조') === '조위' && R.facOf(db, '손권') === '동오' && R.facOf(db, '원소') === '원소' && R.facOf(db, '동탁') === '동탁', '위촉오는 그 나라, 군웅은 제 세력');
  ok(S.generals.filter(g => g.faction === 'qun').every(g => FC.factions[R.facOf(db, g.key)]), '군웅 장수의 주 세력은 모두 세력 표에');
  const qun = R.evaluateRaw(db, ['동탁', '이각', '곽사', '원소', '안량']);
  ok(qun.rows.some(r => r.fac === '동탁' && r.v === SY[3]) && qun.rows.some(r => r.fac === '원소' && r.v === SY[2]) && !qun.rows.some(r => r.kind === 'etc'), '본편 — 동탁 3인 · 원소 2인 따로, 할거 40% 셈 없음');
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

/* ── 군웅록 결속 — 거친 세력마다 센다, 결속 0.8배, 주공 동향은 세력이 하나라도 겹치면 ── */
{
  const team = ['동탁', '여포', '이각', '곽사'], ev = R.evaluateRaw(mx, team);
  const dong = ev.rows.find(r => r.kind === 'syn' && r.fac === '동탁');
  ok(dong && dong.v === Math.round(SY[4] * 0.8), '동탁 4인(여포는 동탁 · 여포 둘 다) — 0.8배 ' + (dong && dong.v));
  ok(!ev.rows.some(r => r.fac === '여포'), '여포 세력 1인은 결속 없음');
  ok(R.facsOf(mx, '여포').join() === '동탁,여포' && R.facOf(mx, '여포') === '여포' && R.facColor(mx, '여포') === FC.factions['여포'].c, '이력 · 마지막 세력 · 세력 표의 색');
  const base = R.evaluateRaw(db, team);
  ok(base.rows.some(r => r.kind === 'syn' && r.fac === '동탁') && !base.rows.some(r => r.kind === 'etc'), '본편으로 세면 동탁 세력(여포는 주 세력 여포)');
  /* 조운: 공손찬 → 촉한. 유비(촉한) 주공이면 동향 */
  const ev2 = R.evaluateRaw(mx, ['유비', '조운', '전해']), lord = ev2.rows.find(r => r.kind === 'lord');
  ok(lord && /주공 유비/.test(lord.label) && /동향 2인/.test(lord.label), '조운은 공손찬 · 촉한 — 유비 주공과 동향(전해는 아님) ' + (lord && lord.label));
  ok(ev2.rows.some(r => r.fac === '공손찬' && r.v === Math.round(SY[2] * 0.8)) && ev2.rows.some(r => r.fac === '촉한'), '공손찬 2인 · 촉한 2인');
  ok(R.styleScore(mx, by['조운'], ['공손찬'], 2) === 30 && R.styleScore(db, by['조운'], ['공손찬'], 2) === 0, '손권형 기질도 진영 셈을 따른다');
}

/* ── 군웅록 roleMap — 여포 · 장수 · 장각 · 맹획은 군웅록에서만 군주(기질 lordAs), 본편은 본디 역할 ── */
{
  const four = { 여포: 'valor', 장수: 'defender', 장각: 'benevolent', 맹획: 'valor' };
  for (const [k, t] of Object.entries(four)) {
    ok(mx.by[k].role === 'lord' && mx.by[k].cat === 'lord' && mx.by[k].trait === t && mx.by[k].asLord, k + ' — 군웅록에서 군주 · ' + t);
    ok(db.by[k].role !== 'lord' && db.by[k].cat !== 'lord' && !db.by[k].trait, k + ' — 본편은 본디 역할 ' + db.by[k].role);
    ok(mx.by[k].cls === db.by[k].cls && mx.by[k].pw === db.by[k].pw, k + ' — 갈래 · 전력(본디 역할 가중)은 그대로');
  }
  ok(db.by['여포'].cat === 'general' && db.by['장각'].cat === 'staff', '본편 — 여포는 무장, 장각은 참모(책사)');
  ok(mx.list.find(c => c.key === '맹획').cat === 'lord' && db.list.find(c => c.key === '맹획').cat === 'general', 'view 의 list 도 따라간다');
  ok(R.counts(mx, ['여포', '유비']).lord === 2 && R.counts(db, ['여포', '유비']).lord === 1, '정원 셈');
  ok(R.overflow(mx, ['여포', '유비']) === 1 && R.overflow(db, ['여포', '유비']) === 0, '군웅록에선 여포 + 유비 = 군주 정원 초과');
  const ev = R.evaluateRaw(mx, ['여포', '고순', '장료', '진궁']), lord = ev.rows.find(r => r.kind === 'lord');
  ok(lord && lord.lord === '여포' && lord.v > 0, '군웅록 — 여포가 주공 그릇 ' + (lord && lord.label));
  ok(!R.evaluateRaw(db, ['여포', '고순', '장료', '진궁']).rows.some(r => r.kind === 'lord'), '본편 — 여포는 주공이 아니다');
  /* 군주를 가진 진영에 여포는 막힌다(군웅록), 본편이면 무장 자리라 열린다 */
  for (const [v, want] of [[mx, false], [db, true]]) {
    const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 44, lv: 0, first: 'me', players: 2, fmode: v.mode });
    st.mine.push('조조'); st.pack[0].k = '여포'; st.pool = st.pool.filter(k => k !== '여포' && k !== '조조');
    ok(R.legal(v, st, 'me').includes(0) === want, (v.mode === 'mx' ? '군웅록' : '본편') + ' — 군주 있는 진영에 여포 ' + (want ? '열림' : '막힘'));
    let aiOk = true;
    for (let i = 0; i < 5 && R.turn(st) === 'me'; i++) { R.ensureChoices(v, st, 'me'); const a = R.aiAct(v, st, 'me'); if (a.type === 'pick' && a.key === '여포' && v.mode === 'mx') aiOk = false; }
    ok(aiOk, 'AI 도 군웅록 정원으로 고른다');
  }
}

/* ── 판 돌리기 — 모든 자리 AI ── */
function play(seed, keys, lvMe, lvFoe, o) {
  o = o || {};
  const st = R.newGame(db, { keys, seed, lv: lvFoe, players: o.players || 2, fmode: o.fmode || 'base' });
  const v = R.view(db, st.fmode), all = new Set(keys.filter(k => R.inScope(v, k))), picks = {};
  st.seats.forEach(s => { picks[s] = []; });
  let guard = 0;
  while (st.phase === 'draft' && guard++ < 300) {
    const seat = R.turn(st);
    if (!seat) { R.endRound(v, st); continue; }
    R.ensureChoices(v, st, seat);
    const team = R.teamOf(st, seat).slice(), legal = R.legal(v, st, seat), open = R.openIdx(st);
    const raw = open.filter(i => { const c = v.by[st.pack[i].k]; return team.length >= R.FINAL || R.counts(v, team)[c.cat] < R.CAPS[c.cat]; });
    const act = R.aiAct(v, st, seat, seat === 'me' ? lvMe : lvFoe, seat === 'me' ? (o.styleMe || 0) : undefined);
    if (act.type === 'reroll') { assert.strictEqual(R.turn(st), seat, '다시 뽑아도 차례는 그대로'); continue; }
    assert(legal.includes(act.idx), `AI 가 고를 수 없는 카드를 골랐다 (씨앗 ${seed} ${st.round}진)`);
    assert(raw.length === 0 || raw.includes(act.idx), '정원이 찬 역할을 골랐다');
    picks[seat].push(act.key);
    /* 장수는 한 곳에만 — 더미 · 펼친 후보 · 각 진영 */
    const where = st.pool.concat(st.pack.filter(e => !e.by).map(e => e.k), ...st.seats.map(s => R.teamOf(st, s)));
    assert.strictEqual(where.length, new Set(where).size, '장수가 두 곳에 있다');
    assert.strictEqual(where.length, all.size, '장수가 사라졌다');
    assert(where.every(k => all.has(k)), '범위 밖 장수');
  }
  assert.strictEqual(st.phase, 'lineup', '13진이 끝나면 편성');
  for (const s of st.seats) {
    const t = R.teamOf(st, s);
    assert.strictEqual(t.length, R.ROUNDS); assert.deepStrictEqual(t, picks[s]);
    const n = R.counts(v, t.slice(0, R.FINAL));
    assert(n.lord <= 1 && n.general <= 5 && n.staff <= 5 || R.overflow(v, t.slice(0, R.FINAL)) <= 2, '11번째까지 정원');
  }
  /* 선공은 진마다 한 자리씩 돈다 */
  st.log.forEach((row, r) => assert.strictEqual(row.first, st.seats[(r + st.first) % st.seats.length], '선공 차례'));
  const res = R.finalize(v, st, st.lineup);
  assert.strictEqual(res.me.total, R.evaluateRaw(v, st.lineup).total);
  assert.strictEqual(res.sides.length, st.seats.length);
  res.sides.slice(1).forEach(x => assert.strictEqual(x.ev.total, R.bestLineup(v, R.teamOf(st, x.seat)).score));
  assert.strictEqual(res.rank, 1 + res.sides.filter(x => x.ev.total > res.me.total).length, '순위');
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
/* 3인전 · 군웅록(기본) — 세계 셋의 그림 있는 장수 · 전체 */
for (const w of A.WORLDS) {
  const keys = artKeys(w);
  ok(keys.length >= R.needKeys(3), w + ' 3인전에 장수가 모자라지 않다');
  for (let s = 1; s <= 8; s++) { play(500 * s + w.length, keys, s % 3, (s + 2) % 3, { players: 3, fmode: 'mx', styleMe: s % 5 }); checks++; }
}
for (let s = 1; s <= 4; s++) { play(31 + s, db.list.map(c => c.key), 2, 2, { players: 3, fmode: s % 2 ? 'mx' : 'base' }); checks++; }
{
  const keys = artKeys('mecha');
  const a = play(9090, keys, 2, 2, { players: 3, fmode: 'mx' }), b = play(9090, keys, 2, 2, { players: 3, fmode: 'mx' }), c = play(9091, keys, 2, 2, { players: 3, fmode: 'mx' });
  ok(JSON.stringify(a) === JSON.stringify(b), '3인전 — 씨앗이 같으면 같은 판');
  ok(JSON.stringify(a.log) !== JSON.stringify(c.log), '3인전 — 씨앗이 다르면 다른 판');
  ok(a.seats.join() === 'me,foe,foe2' && a.foe2.length === 13 && a.log[0].first === 'me' && a.log[1].first === 'foe' && a.log[2].first === 'foe2', '셋째 자리 · 선공이 셋으로 돈다');
  ok(a.aiFac.foe && a.aiFac.foe2 === '군웅' && a.aiFac.foe !== a.aiFac.foe2, '적장 둘의 기치 — 둘째는 「군웅」');
  const d = play(9090, keys, 2, 2, { players: 3, fmode: 'base' });
  ok(d.aiFac.foe && d.aiFac.foe2 === '군웅', '위촉오+군웅 셈도 기치를 든다');
}
/* ── 연도 팩 — 그해의 세력(facMap), 그해에 없는 장수는 나오지 않는다(옛 eraPool), 결속 배수 · 기치 · 군주 바꿈 ── */
{
  const y194 = R.view(db, 'w194'), y263 = R.view(db, 'end263');
  ok(R.facOf(y194, '조조') === '조조군' && R.facColor(y194, '조조군') === FC.factions['조위'].c && R.isMajor(y194, '조조군') && !R.isMajor(y194, '원소군'), '194 — 조조군은 조위 색 · 위촉오');
  ok(y194.synMul === 1.35 && y194.bias === 25 && y194.by['여포'].cat === 'lord' && y194.by['장수'].cat === 'lord', '194 — 결속 1.35배 · 여포 · 장수 군주');
  ok(!R.inScope(y194, '강유') && R.inScope(y194, '조조'), '194 — 강유는 아직 없다');
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 3, players: 3, fmode: 'w194' });
  const all = st.pool.concat(st.pack.map(e => e.k));
  ok(all.length === Object.keys(PK.packs.w194.facMap).length && all.every(k => PK.packs.w194.facMap[k]), '194 — 장수 범위는 그해 사람 ' + all.length);
  ok(y263.by['사마소'].cat === 'lord' && y263.by['사마소'].trait === 'hegemon' && y263.by['제갈탄'].trait === 'defender', '263 — 사마소 · 제갈탄 군주(lordAs)');
  ok(R.view(db, 'jb208').by['마초'].trait === 'valor', '208 — 마초 군주');
  for (const m of ['w194', 'gd200', 'jb208']) { play(70 + m.length, db.list.map(c => c.key), 1, 2, { players: 3, fmode: m }); checks++; }
  play(71, db.list.map(c => c.key), 1, 2, { players: 2, fmode: 'end263' }); checks++;
}
/* ── 군웅 연합 — 위촉오 아닌 세 세력 이상에서 각 둘 ── */
{
  const L = FC.cohesion.league;
  const three = R.evaluateRaw(mx, ['원소', '안량', '동탁', '이각', '공손찬', '전해']).rows.find(r => r.kind === 'league');
  ok(three && three.v === L.t[3] && three.facs.length === 3, '세 세력 각 둘 → ' + L.names[3] + ' ' + (three && three.v));
  ok(!R.evaluateRaw(mx, ['원소', '안량', '동탁', '이각']).rows.some(r => r.kind === 'league'), '두 세력이면 연합 없음');
  ok(!R.evaluateRaw(mx, ['조조', '조인', '유비', '관우', '원소', '안량']).rows.some(r => r.kind === 'league'), '위 · 촉 · 오는 연합에 안 센다');
  const four = R.evaluateRaw(db, ['원소', '안량', '동탁', '이각', '공손찬', '전해', '유표', '채모']).rows.find(r => r.kind === 'league');
  ok(four && four.v === L.t[4], '본편 셈에서도 네 세력 → ' + L.names[4]);
}
/* ── 옛 주군 재회 · 배신 ── */
{
  const ev = R.evaluateRaw(mx, ['원소', '진림']), b = ev.rows.find(r => r.kind === 'bond');
  ok(b && b.v === BD.oldLord.v && b.who.join() === '진림', '원소 주공 · 진림(원소 → 조위) 재회 +' + BD.oldLord.v);
  ok(!R.evaluateRaw(mx, ['공손찬', '조운']).rows.some(r => r.kind === 'bond'), '공손찬 · 조운은 결의 「백마의종」 이 이미 묶는다 — 재회로 안 센다');
  ok(!R.evaluateRaw(mx, ['유비', '조운']).rows.some(r => r.kind === 'bond'), '마지막 세력이 주공 세력이면 재회가 아니다');
  /* 결의가 이미 묶은 두 사람은 세지 않는다 */
  const lords = mx.list.filter(c => c.role === 'lord');
  let blocked = null;
  for (const L of lords) { const lc = PK.packs.mx.career[L.key], lf = lc[lc.length - 1];
    for (const c of mx.list) { const ca = PK.packs.mx.career[c.key]; if (c.key !== L.key && ca.includes(lf) && ca[ca.length - 1] !== lf && CB.combos.some(x => x.m.includes(L.key) && x.m.includes(c.key))) { blocked = [L.key, c.key]; break; } } if (blocked) break; }
  ok(blocked && !R.evaluateRaw(mx, blocked).rows.some(r => r.kind === 'bond'), '결의와 겹치면 세지 않는다 — ' + blocked);
  /* 상한 */
  let big = null;
  for (const L of lords) { const lc = PK.packs.mx.career[L.key], lf = lc[lc.length - 1];
    const re = mx.list.filter(c => { const ca = PK.packs.mx.career[c.key]; return c.key !== L.key && c.role !== 'lord' && ca.includes(lf) && ca[ca.length - 1] !== lf && !CB.combos.some(x => x.m.includes(L.key) && x.m.includes(c.key)); }).map(c => c.key);
    if (re.length * BD.oldLord.v > BD.oldLord.cap) { big = [L.key].concat(re.slice(0, 10)); break; } }
  ok(big && R.evaluateRaw(mx, big).rows.find(r => r.kind === 'bond').v === BD.oldLord.cap, '한 편 상한 ' + BD.oldLord.cap);
  const bt = R.evaluateRaw(db, ['진궁', '조조']).rows.find(r => r.kind === 'betray');
  ok(bt && bt.v === -30, '배신 · 진궁과 조조 -30');
  ok(BD.betray.every(x => !CB.combos.some(c => c.m.includes(x.a) && c.m.includes(x.b) && Object.values(c.t).some(v => v < 0))), '배신은 결의 불화와 겹치지 않는다');
  const bo = R.bondsOf(mx, ['원소', '진림', '진궁']);
  ok(bo.lord === '원소' && bo.reunion.join() === '진림' && bo.betray.some(x => x.a === '진궁' && !x.got && x.miss === '조조'), '결의 창 — 재회 · 배신 진척');
}
/* 3인전 견제 — 앞선 상대를 1.2배 · 뒤진 상대 0.85배(같으면 앞 자리를 앞선 쪽으로), 2인은 그대로 */
{
  ok(R.denyWeights([300, 200]).join() === '1.2,0.85' && R.denyWeights([100, 200]).join() === '0.85,1.2' && R.denyWeights([5, 5]).join() === '1.2,0.85' && R.denyWeights([7]).join() === '1', '견제 배수');
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 12, lv: 1, players: 3, fmode: 'mx', first: 'foe', styles: { foe: 3, foe2: 3 } });
  ok(R.turn(st) === 'foe' && st.q.join() === 'foe,foe2,me', '첫 선공 적장1이면 적장1 → 적장2 → 아군');
  ok(R.newGame(db, { keys: db.list.map(c => c.key), seed: 1 }).players === 3 && R.newGame(db, { keys: db.list.map(c => c.key), seed: 1 }).fmode === 'mx', '기본은 3인 · 군웅록');
}

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
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 9, lv: 0, first: 'me', players: 2, fmode: 'base' });
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
  const st = R.newGame(db, { keys: db.list.map(c => c.key), seed: 31, lv: 0, first: 'me', players: 2, fmode: 'base' });
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
  R.aiAct(mx, st, R.turn(st)); R.aiAct(mx, st, R.turn(st));
  const back = R.restore(db, JSON.parse(JSON.stringify(st)));
  ok(back && JSON.stringify(back) === JSON.stringify(st), '이어하기 — 저장한 그대로');
  ok(R.restore(db, Object.assign({}, st, { mine: ['없는장수'] })) === null, '모르는 장수는 버린다');
  ok(R.restore(db, Object.assign({}, st, { v: 1 })) === null, '1단계 저장(v1)은 버린다');
  ok(R.restore(db, Object.assign({}, st, { foe2: null })) === null, '3인 판에 셋째 진영이 없으면 버린다');
}
/* 그림 고르기 — 기본 화풍이 먼저, 없으면 style.json 차례 */
{
  const def = J('data/style.json').default;
  const withDef = Object.keys(IMG).find(k => IMG[k].byStyle[def] && IMG[k].byStyle[def].byForm && IMG[k].byStyle[def].byForm.samguk && IMG[k].byStyle[def].byForm.samguk.f);
  if (withDef) ok(A.fileFor(IMG, order, withDef, 'samguk') === IMG[withDef].byStyle[def].byForm.samguk.f, '기본 화풍 그림이 먼저');
  ok(A.fileFor(IMG, order, '없는장수', 'samguk') === null && A.fileFor(IMG, order, '유비', 'nowhere') === null, '없으면 null');
}
console.log('draft2-rules ok —', checks, '가지');
