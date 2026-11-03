/* 일상컷 묶음 계획기(tools/casual-plan.cjs, 2026-11-02 element 에서 옮김) — 장수 여럿 × 세계 셋 × 씨앗 둘이 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   정해 둔 두 갈래(노출 한 장 · 세계 안 한 장, 서로 다른 컷)는 tools/casual-check.py 와 같은 판정.
   이미 있는 컷(기록) 위에 모자란 번호만 짜는 것도. node tests/casual-plan.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const C = require('../tools/casual-plan.cjs');
const C2T = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/casual-tree-v2.js'), 'utf8'), ctx); return ctx.window.AtelierCasualTreeV2; })();
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sam-design.json'), 'utf8'));
const P = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
  return ctx.window.AtelierPrompt; })();
const keys = P.cards(D), pickKeys = keys.filter((k, i) => i % Math.max(1, Math.floor(keys.length / 12)) === 0).slice(0, 12);
let n = 0;
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3, 11]) {
    card.world = w;
    const res = C.plan(card, [1, 2, 3, 4, 5], [], { seed });
    assert.equal(res.cuts.length, 5, key + ' ' + w + ' 다섯 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const ex = res.cuts.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = res.cuts.filter(c => C.requiredType(c) === 'nation');
    assert(ex.length && inw.length && (ex.length + inw.length >= 2), key + ' ' + w + ' 정해 둔 두 갈래 — 노출 한 장 · 세계 안 한 장');
    assert(inw.every(c => c.era === 'nation'), '세계 안 갈래는 세계 안 시대');
    assert.equal(new Set(res.cuts.map(c => c.era)).size, 4, key + ' ' + w + ' 네 시대 다');
    for (const c of res.cuts) {
      const rec = C.record(card, w, c);
      assert.equal(rec.file, `${key}_${w}_${C.STYLE}_f_casual${c.n}.webp`);
      assert.equal(rec.record, `records/${key}/${w}-casual${c.n}.${C.STYLE}-ui.json`);
      assert.equal(rec.ref, `${key}_${w}_${C.STYLE}_f.webp`, '참고 그림은 그 세계 그림');
      assert(rec.prompt.length > 500 && rec.treeV === 2 && rec.world === w);
      /* 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03) — 화풍 문장 · 나이 줄 대신 「첨부 그림 그대로」 · FACE 줄, 표정은 얼굴 안에서만 */
      assert(rec.prompt.includes("STYLE: keep the attached image's rendering exactly") && rec.prompt.includes('FACE: exactly the face of the attached image') && !rec.prompt.includes('AGE: the same adult woman') && !/MMORPG/.test(rec.prompt), '일상컷 화풍 · 얼굴은 첨부 그림 그대로');
      assert(!/EXPRESSION: /.test(rec.prompt) || /EXPRESSION: [^\n]*Show it mildly/.test(rec.prompt), '일상컷 표정은 얼굴 안에서만');
    }
    n++;
  }
}
/* 이미 있는 두 장 위에 세 장 — 겹침은 있는 것까지 센다 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-plan-'));
try {
  const card = C.cardOf('관우'); card.world = 'mecha';
  const first = C.plan(card, [1, 2], [], { seed: 5 });
  for (const c of first.cuts) fs.writeFileSync(path.join(tmp, `mecha-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(C.record(card, 'mecha', c)));
  const old = C.oldCuts(tmp, card, 'mecha');
  assert.equal(old.length, 2);
  const more = C.plan(card, [3, 4, 5], old, { seed: 9 });
  assert.deepEqual(C.check(more.cuts, card, old), []);
  const places = [...old, ...more.cuts].map(c => c.place);
  assert.equal(new Set(places).size, 5, '장소가 있는 컷과도 다르다');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
/* 카드 사이 안 쓴 트리 먼저(2026-11-01 — pkm 의 덜 쓴 · 안 쓴 길 먼저) — 장소 · 옷 · 자세 추천 · 표정을 다른 카드에서 많이 쓴 것으로 채운 횟수를 주면,
   안 쓴 값이 훨씬 자주 나온다. 같은 입력 · 씨앗이면 같은 답 */
{
  const T2 = C2T.make(JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8')));
  const tr2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8'));
  const places = Object.keys(tr2.places).filter(k => k !== 'note'), presets = tr2.presets.map(x => x.key), exprs = Object.keys(tr2.expressions || {});
  const fresh = new Set(places.filter((k, i) => i % 3 === 0)), freshP = new Set(presets.filter((k, i) => i % 3 === 0)), freshE = new Set(exprs.filter((k, i) => i % 3 === 0));
  const heavy = (all, keep) => Object.fromEntries(all.filter(k => !keep.has(k)).map(k => [k, 12]));
  const usage = { prop: {}, place: heavy(places, fresh), item: {}, preset: heavy(presets, freshP), posture: {}, expr: heavy(exprs, freshE) };
  const share = (u, f, set) => { let hit = 0, all = 0; for (const key of pickKeys) { const card = C.cardOf(key); card.world = card.worlds[0]; for (const seed of [3, 11, 29]) for (const c of C.plan(card, [1, 2, 3, 4, 5], [], { seed, usage: u }).cuts) { if (!c[f]) continue; all++; if (set.has(c[f])) hit++; } } return hit / all; };
  for (const [f, set, name] of [['place', fresh, '장소'], ['preset', freshP, '자세 추천']]) {   /* 표정은 고르게 뽑는다(2026-11-03) */
    const base = share({}, f, set), lean = share(usage, f, set);
    assert(lean > 0.6 && lean > base * 1.5, name + ' — 안 쓴 값 비율 ' + lean.toFixed(2) + ' (횟수 없이 ' + base.toFixed(2) + ')');
  }
  const card = C.cardOf('관우'); card.world = 'fantasy';
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, '같은 입력 · 씨앗이면 같은 답');
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage: { cup: 3 } }).cuts.length, 3, '옛 꼴(소품 → 횟수)도 받는다');
  const img = path.join(__dirname, '../../sam-atelier-img/records');
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, '관우'); assert(Object.keys(u.place).length > 3 && Object.keys(u.preset).length > 3 && Object.keys(u.expr).length > 0, '그림 저장소 기록에서 센다'); }
}
/* 세계 셋을 한 번에 · 새 묶음(2026-11-02, 사용자 「무협·판타지·메카가 다 같은 구도의 장면」 · 「대체하는건 아니고, 추가로」) —
   옛 다섯 장은 그대로 두고 그 뒤 번호로 새 다섯 장씩, 세 세계 · 옛 묶음 어느 것과도 같은 장면(장소 · 자세 추천)을 쓰지 않는다 */
{
  const { execFileSync } = require('node:child_process');
  const rec = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-rec-')), out = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-out-'));
  try {
    const card = C.cardOf('관우');
    for (const w of card.worlds) { card.world = w; for (const c of C.plan(card, [1, 2, 3, 4, 5], [], { seed: 3 }).cuts) fs.writeFileSync(path.join(rec, `${w}-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(C.record(card, w, c))); }
    execFileSync(process.execPath, [path.join(__dirname, '../tools/casual-plan.cjs'), '관우', '--world', 'all', '--fresh', '--seed', '5', '--records', rec, '--usage', 'none', '--out', out], { stdio: 'pipe' });
    const fresh = card.worlds.map(w => ({ w, p: JSON.parse(fs.readFileSync(path.join(out, 'plan-' + w, 'plan.json'), 'utf8')) }));
    const old = card.worlds.flatMap(w => C.oldCuts(rec, { ...card, world: w }, w));
    for (const { w, p } of fresh) {
      card.world = w;
      assert.equal(p.cuts.length, 5); assert(p.cuts.every(c => c.n > 5), w + ' — 새 번호는 옛 묶음 뒤');
      const others = [...old, ...fresh.filter(x => x.w !== w).flatMap(x => x.p.cuts)];
      assert.deepEqual(C.check(p.cuts, card, [], others), [], w + ' — 다른 세계 · 옛 묶음과 같은 장면 없음');
    }
    /* 겹침 판정 — 세계 안 장소는 옷 계열 · 자세 추천까지 같을 때만, 다른 장소는 같은 곳이면 */
    card.world = 'fantasy';
    const one = fresh[0].p.cuts[0];
    assert(C.check([one], card, [], [{ ...one }]).length > 0, '같은 장면을 잡는다');
  } finally { fs.rmSync(rec, { recursive: true, force: true }); fs.rmSync(out, { recursive: true, force: true }); }
}
/* 무기는 일상컷에서 들지 않고 장신구로(2026-11-02 사용자 「무기를 일상컷에선 들고 있는것보단 악세사리류로 대체」) —
   무기 장수는 「그 장수의 물건을 든 컷」 이 없고 지시문마다 SIGNATURE ACCESSORY 줄, 부채 · 두루마리 같은 물건은 그대로 손에 든다 */
{
  for (const [key, weapon] of [['조운', true], ['관우', true], ['유비', true], ['제갈량', false]]) {
    const card = C.cardOf(key); card.world = card.worlds[0];
    assert.equal(P.isWeapon(P.holdOf(card.c)), weapon, key + ' — 무기인가');
    assert.equal(card.g.signature.length, weapon ? 0 : 1, key + ' — 일상컷에서 손에 드는 물건');
    const cuts = C.plan(card, [1, 2, 3, 4, 5], [], { seed: 7 }).cuts;
    for (const c of cuts) {
      const p = C.record(card, card.world, c).prompt;
      assert.equal(p.includes('SIGNATURE ACCESSORY'), weapon, key + ' — 장신구 줄');
      if (weapon) assert(!p.includes('SIGNATURE ITEM SHAPE') && !p.includes(P.holdOf(card.c) + ' in'), key + ' — 무기를 들지 않는다');
    }
    if (!weapon) assert(cuts.some(c => /sig_/.test(c.use || '')), key + ' — 무기 아닌 물건은 한두 장 든다');
  }
}
/* 시대 몫 — 새 다섯 장은 지금 현실 둘 · 세계 안 · 역사의 자리 · 무대·환상 하나씩(2026-11-02 「지금 현실 비중을 높여줘」),
   세계 안 갈래 장소는 일곱 곳(방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 군영 — 「둘 다 해줘」) */
{
  const tr = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
  assert.deepEqual(tr.required.world.places, ['nation_room', 'nation_bath', 'nation_roof', 'nation_inn', 'nation_study', 'nation_kitchen', 'nation_camp']);
  for (const key of pickKeys.slice(0, 6)) {
    const card = C.cardOf(key); card.world = card.worlds[0];
    const eras = C.plan(card, [1, 2, 3, 4, 5], [], { seed: 21 }).cuts.reduce((m, c) => (m[c.era] = (m[c.era] || 0) + 1, m), {});
    assert.deepEqual(eras, { now: 2, nation: 1, heritage: 1, fantasy: 1 }, key + ' — 시대 몫 ' + JSON.stringify(eras));
  }
}
/* 표정 — 일상컷에 어색한 것(웃는 입에 무표정한 눈 · 지루함 · 졸림 · 지침 · 짜증 · 시큰둥 · 질끈 감은 웃음)은 계획기가 고르지 않고,
   문구는 단서 두셋(2026-11-03 사용자 「표정 관련 문구가 과하게」) */
{
  const ok = ['calm', 'soft_smile', 'gentle', 'amused', 'pensive', 'wistful', 'nostalgic', 'confident', 'proud', 'focused', 'half_smile', 'candid', 'relieved', 'wink', 'sensual', 'serious', 'curious'], seen = new Set();   /* 2026-11-03 「일상컷쪽이 더 그래」 — 은은한 열셋만 */
  for (const key of pickKeys) { const card = C.cardOf(key); for (const w of card.worlds) { card.world = w; for (const seed of [3, 9]) for (const c of C.plan(card, [1, 2, 3, 4, 5], [], { seed }).cuts) if (c.expr) seen.add(c.expr); } }
  for (const k of seen) assert(ok.includes(k), '은은한 표정이 아닌 ' + k);
  assert(seen.size >= 10, '표정 ' + seen.size + ' 가지');
  const tr2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8'));
  for (const [k, v] of Object.entries(tr2.expressions)) assert(v.split(',').length <= 3 && !/jaw|clench|unsmiling|squeez|slack/.test(v), '표정 문구 ' + k + ': ' + v);
}
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(장수 ${pickKeys.length} × 세계 셋 × 씨앗 둘)이 다섯 장 · 묶음 규칙 · 정해 둔 두 갈래(노출 · 세계 안) · 네 시대 · 기록 꼴, 있는 두 장 위에 세 장 · 카드 사이 안 쓴 장소 · 자세 추천 · 표정 먼저 · 세계 셋 한 번에 새 묶음(세계 · 옛 묶음 사이 같은 장면 없음) · 무기는 장신구로(부채 · 두루마리는 손에) · 시대 몫(지금 현실 둘) · 세계 안 갈래 장소 일곱 · 표정 후보(어색한 것 빼고 고르게, 문구 단서 두셋)`);
