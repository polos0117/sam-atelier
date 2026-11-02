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
  for (const [f, set, name] of [['place', fresh, '장소'], ['preset', freshP, '자세 추천'], ['expr', freshE, '표정']]) {
    const base = share({}, f, set), lean = share(usage, f, set);
    assert(lean > 0.6 && lean > base * 1.5, name + ' — 안 쓴 값 비율 ' + lean.toFixed(2) + ' (횟수 없이 ' + base.toFixed(2) + ')');
  }
  const card = C.cardOf('관우'); card.world = 'fantasy';
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, '같은 입력 · 씨앗이면 같은 답');
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage: { cup: 3 } }).cuts.length, 3, '옛 꼴(소품 → 횟수)도 받는다');
  const img = path.join(__dirname, '../../sam-atelier-img/records');
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, '관우'); assert(Object.keys(u.place).length > 3 && Object.keys(u.preset).length > 3 && Object.keys(u.expr).length > 0, '그림 저장소 기록에서 센다'); }
}
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(장수 ${pickKeys.length} × 세계 셋 × 씨앗 둘)이 다섯 장 · 묶음 규칙 · 정해 둔 두 갈래(노출 · 세계 안) · 네 시대 · 기록 꼴, 있는 두 장 위에 세 장 · 카드 사이 안 쓴 장소 · 자세 추천 · 표정 먼저`);
