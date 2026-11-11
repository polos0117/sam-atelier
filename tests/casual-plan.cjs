/* 일상컷 묶음 계획기(tools/casual-plan.cjs, 2026-11-02 element 에서 옮김) — 장수 여럿 × 세계 셋 × 씨앗 둘이 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   정해 둔 세 갈래(노출 한 장 · 세계 안 한 장 · 상황 노출 한 장, 서로 다른 컷 — 2026-11-09 여섯 장)는 tools/casual-check.py 와 같은 판정.
   이미 있는 컷(기록) 위에 모자란 번호만 짜는 것도. node tests/casual-plan.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const C = require('../tools/casual-plan.cjs');
const C2T = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/casual-tree-v2.js'), 'utf8'), ctx); return ctx.window.AtelierCasualTreeV2; })();
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sam-design.json'), 'utf8'));
const P = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
  return ctx.window.AtelierPrompt; })();
const keys = P.cards(D), pickKeys = keys.filter((k, i) => i % Math.max(1, Math.floor(keys.length / 12)) === 0).slice(0, 12);
const TS = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/prompt-spec.js'), 'utf8'), ctx); return ctx.window.AtelierSpec; })();
const SJ = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/style.json'), 'utf8')), SR = SJ.styles[C.STYLE], KIT = (SR.versions.find(v => v.v === SR.current) || {}).casualKit, SHORT = !!(SR.versions.find(v => v.v === SR.current) || {}).casualShort, LEG = !!((SR.versions.find(v => v.v === SR.current) || {}).legacy25 || (SR.versions.find(v => v.v === SR.current) || {}).casualLegacy);   /* casualLegacy — 일상컷만 2.5 글 긴 꼴(kr_drawn_rim_dewy 2026-11-11) */   /* 기본 화풍에 일상컷 묶음이 있으면(kr_mmorpg v5~, 2026-11-08 기본) 그 글로 */
let n = 0; const dn = { fit: 0, set: 0 }, situSeen = new Set(), famSeen = new Set();
const SIX = [1, 2, 3, 4, 5, 6];
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3, 11]) {
    card.world = w;
    const res = C.plan(card, SIX, [], { seed });
    assert.equal(res.cuts.length, 6, key + ' ' + w + ' 여섯 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const ex = res.cuts.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = res.cuts.filter(c => C.requiredType(c) === 'nation');
    assert(ex.length && inw.length && (ex.length + inw.length >= 2), key + ' ' + w + ' 정해 둔 두 갈래 — 노출 한 장 · 세계 안 한 장');
    /* 셋째 필수 — 상황 노출 꼭 한 장, 노출 · 세계 안 갈래가 아닌 컷에 그 옷에 맞는 상황(2026-11-09) */
    const si = res.cuts.filter(c => c.situ);
    assert.equal(si.length, 1, key + ' ' + w + ' 상황 노출 한 장');
    assert(!C.requiredType(si[0]) && P.situFits(si[0].situ, C.outfitEn(si[0])), key + ' ' + w + ' 상황 컷은 다른 두 갈래와 다른 컷 · 맞는 옷');
    situSeen.add(si[0].situ); res.cuts.forEach(c => famSeen.add(c.ofam));
    /* 옷 자유 컷(2026-11-09) — 한 장, 필수 · 상황 · 얼굴 클로즈업이 아닌 컷, 색 · 데니어 없음, Outfit 줄이 GPT 노출 의상 주문 */
    { const fr = res.cuts.filter(c => c.ofree); assert.equal(fr.length, 1, key + ' ' + w + ' 옷 자유 한 장');
      assert(!C.requiredType(fr[0]) && !fr[0].situ && fr[0].frame !== 'face_close' && !fr[0].color && !fr[0].denier, key + ' ' + w + ' 옷 자유 컷');
      assert((C.record(card, w, fr[0]).prompt.match(/^Outfit: .*$/m) || [''])[0].startsWith(TS.OUTFIT_FREE), key + ' 옷 자유 줄'); }
    assert(inw.every(c => c.era === 'nation'), '세계 안 갈래는 세계 안 시대');
    assert.equal(new Set(res.cuts.map(c => c.era)).size, 4, key + ' ' + w + ' 네 시대 다');
    { const cs = res.cuts.map(c => c.color).filter(Boolean); assert.equal(new Set(cs).size, cs.length, key + ' ' + w + ' 옷 색 갈래가 묶음 안에서 겹치지 않는다'); }
    dn.fit += res.cuts.filter(c => P.denierFits(C.outfitEn(c))).length; dn.set += res.cuts.filter(c => c.denier).length;
    for (const c of res.cuts) {
      const rec = C.record(card, w, c);
      assert.equal(rec.file, `${key}_${w}_${C.STYLE}_f_casual${c.n}.webp`);
      assert.equal(rec.record, `records/${key}/${w}-casual${c.n}.${C.STYLE}-ui.json`);
      assert.equal(rec.ref, `${key}_${w}_${C.STYLE}_f.webp`, '참고 그림은 그 세계 그림');
      assert(rec.prompt.length > 500 && rec.treeV === 2 && rec.world === w);
      /* 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03) — 화풍 문장 · 나이 줄 대신 「첨부 그림 그대로」 · FACE 줄, 표정은 얼굴 안에서만 */
      if (/^Edit the attached image: /.test(rec.prompt)) assert(rec.prompt.includes('1. KEEP — from the attached image') && /Style: [^\n]*MMORPG/.test(rec.prompt) && rec.prompt.includes('1024×1536'), '칸 꼴 일상컷(기본 kr_drawn_rim_dewy 2026-11-11) — 지킬 것 · 화풍 단락'); else
      if (SHORT) assert(rec.prompt.includes(TS.CASUAL.short.face) && rec.prompt.includes('1024×1536') && /\n\nStyle: /.test(rec.prompt) && rec.prompt.includes(TS.CASUAL.short.end) && rec.prompt.includes(TS.CASUAL.short.headwear) && !/^(?:WARDROBE|SKIN|ANGLE|OUTPUT|AGE|ANATOMY|DESIGN \(accessory hints only\)):/m.test(rec.prompt), '짧은 일상컷 — 얼굴 길이 줄 · 화풍 단락 · 빠진 칸(2026-11-08)'); else
      if (KIT) assert(rec.prompt.includes('STYLE: ' + KIT.style) && rec.prompt.includes('FACE: exactly the face of the attached image') && rec.prompt.includes('SKIN: her own skin tone') && !rec.prompt.includes('AGE: the same adult woman'), '일상컷 묶음 화풍(casualKit) — 화풍 글 · 첨부 얼굴 · 피부색 칸'); else
      if (/^Create ONE finished illustration\. Use case: identity-preserve/.test(rec.prompt)) assert(rec.prompt.includes('IDENTITY AND ART STYLE LOCK') && rec.prompt.includes('CHANGE ONLY CLOTHING') && !/overall_intensity|skin_exposure|SKIN: dewy/.test(rec.prompt), '자연판 일상컷 — 편집 · 잠금 · 바꿀 것만, 강도 · 노출 축 · 광택 줄 없음'); else
      if (LEG) assert((!(SR.versions.find(v => v.v === SR.current) || {}).casualLegacy || (/^SKIN FINISH: /m.test(rec.prompt) && /\n\nAVOID: [^\n]+$/.test(rec.prompt))) && /^STYLE: [^\n]*MMORPG/m.test(rec.prompt) && !rec.prompt.includes("STYLE: keep the attached image's rendering exactly"), '2.5 글 판(legacy25 · casualLegacy) 일상컷 — 화풍 글 그대로, 참고 고정 줄 없음'); else
      assert(rec.prompt.includes("STYLE: keep the attached image's rendering exactly") && rec.prompt.includes('FACE: exactly the face of the attached image') && !rec.prompt.includes('AGE: the same adult woman') && !/MMORPG/.test(rec.prompt), '일상컷 화풍 · 얼굴은 첨부 그림 그대로');
      assert(SHORT || LEG || /^Edit the attached image: /.test(rec.prompt) || !/EXPRESSION: /.test(rec.prompt) || /EXPRESSION: [^\n]*Show it mildly/.test(rec.prompt), '일상컷 표정은 얼굴 안에서만');
      /* 옷 색 갈래(2026-11-08) — 색이 박히지 않은 옷엔 갈래 한 줄, 박힌 옷엔 없음 */
      const CL = TS.CASUAL.colors.find(x => x.key === c.color), ol = (rec.prompt.match(/^Outfit: .*$/m) || [''])[0];
      if (c.ofree) { assert(ol.startsWith(TS.OUTFIT_FREE) && !c.color && !c.denier); continue; }
      if (P.colorFixed(C.outfitEn(c))) assert(!c.color && !/the outfit colour reads clearly/.test(ol), key + ' 색이 박힌 옷엔 색 줄 없음');
      else assert(CL && ol.includes(CL.en), key + ' ' + w + ' 옷 색 줄 — ' + ol.slice(0, 80));
      /* 데니어(2026-11-08) — 닿는 옷에만, 고르면 Outfit 줄에 그 데니어, 노출 축은 그대로 */
      if (c.denier) { const DN = TS.CASUAL.deniers.find(x => x.key === c.denier); assert(DN && P.denierFits(C.outfitEn(c)) && ol.includes(DN.top + '-denier yarn') && ol.includes('fully opaque lining over the bust and the hips'), key + ' 데니어 줄 — ' + ol.slice(0, 80)); }
      else assert(!/-denier yarn/.test(ol), key + ' 데니어 안 고른 컷엔 비침 줄 없음');
      if (!P.denierFits(C.outfitEn(c))) assert(!c.denier, key + ' 데니어는 닿는 옷에만');
      /* 상황 노출 — 고른 컷만 Outfit 줄에 「right now — 그 상황」 */
      if (c.situ) assert(ol.includes('; right now — ' + TS.CASUAL.situations.find(x => x.key === c.situ).en), key + ' 상황 줄 — ' + ol.slice(0, 80));
      else assert(!/; right now — /.test(ol), key + ' 상황 없는 컷엔 상황 줄 없음');
    }
    n++;
  }
}
/* 짧은 일상컷 — 무기 장신구 꼴이 장마다 갈린다(머리꽂이 고정 아님), 전설은 옷 · 장신구에 드러나도 된다(2026-11-08) */
if (SHORT) { const card = C.cardOf('조조'), forms = new Set(); let legend = 0;
  for (const w of card.worlds) { card.world = w; for (const c of C.plan(card, SIX, [], { seed: 21 }).cuts) { const p = C.record(card, w, c).prompt, m = p.match(/appears only as (.+?) modelled on its shape/); assert(m, '조조 무기 장신구 줄'); forms.add(m[1]); if (/may show in the outfit's details/.test(p)) legend++; } }
  assert(forms.size >= 4, '장신구 꼴이 고르게 — ' + [...forms].join(' · ')); assert.equal(legend, 18, '전설은 옷 · 장신구에'); }
/* 목욕 차림은 덜 — 계획 12.7% → 8% 아래, 다른 세계가 쓴 목욕 차림이면 잡는다(2026-11-09 「수건 감는 옷 많이 나오던데」) */
{ let b = 0, t = 0; for (const k of ['조조', '유비', '관우', '손권', '장료', '손상향', '제갈량', '주유']) for (const w of ['samguk', 'fantasy', 'mecha']) { const cd = C.cardOf(k); cd.world = w; for (const s2 of [1, 2]) for (const x of C.plan(cd, SIX, [], { seed: s2 }).cuts) { t++; if (x.ofam === 'bath') b++; } }
  assert(b / t < 0.08, '목욕 차림 비율 ' + b + '/' + t);
  const cd = C.cardOf('조조'); cd.world = 'fantasy'; const one = C.plan(cd, SIX, [], { seed: 3 }).cuts[0];
  assert(C.check([{ ...one, ofam: 'bath', item: 'towel_wrap' }], cd, [], [{ ofam: 'bath', item: 'spa_robe', place: '__x' }]).some(e => /목욕 차림/.test(e)), '세계 셋 통틀어 목욕 차림 한 장'); }
/* 상황 넷이 다 쓰인다 · 새 계열 모험가 · 신화 드레이프도 뽑힌다(2026-11-09) */
assert.equal(situSeen.size, 4, '상황 ' + [...situSeen].join(' · '));
assert(famSeen.has('adventure') && famSeen.has('drape'), '새 계열 — ' + [...famSeen].join(' · '));
{ const cd = C.cardOf('조조'); cd.world = 'samguk'; const cuts = C.plan(cd, SIX, [], { seed: 4 }).cuts;
  assert(C.check(cuts.map(c => { const x = { ...c }; delete x.situ; return x; }), cd, []).some(e => /상황 노출 컷이 없다/.test(e)), '상황 컷이 없으면 잡는다');
  const sc = cuts.find(c => c.situ); assert(C.check(cuts.map(c => c === sc ? { ...c, ofam: 'swimwear', item: 'classic_bikini', situ: 'wet' } : c), cd, []).some(e => /안 맞는다|상황 노출 컷이 없다/.test(e)), '맞지 않는 옷의 상황을 잡는다');
  assert.deepEqual(C.check(cuts.slice(0, 5).map(c => { const x = { ...c }; delete x.situ; return x; }), cd, []).filter(e => /상황/.test(e)), [], '옛 다섯 장 묶음은 상황 없이 맞다'); }
/* 데니어는 랜덤 — 닿는 옷 컷의 대략 열에 여섯(넓게: 3할 ~ 9할) */
assert(dn.fit > 20 && dn.set / dn.fit > 0.3 && dn.set / dn.fit < 0.9, '데니어 비율 ' + dn.set + '/' + dn.fit);
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
      assert.equal(p.cuts.length, 6); assert(p.cuts.every(c => c.n > 5), w + ' — 새 번호는 옛 묶음 뒤');
      const others = [...old, ...fresh.filter(x => x.w !== w).flatMap(x => x.p.cuts)];
      assert.deepEqual(C.check(p.cuts, card, [], others), [], w + ' — 다른 세계 · 옛 묶음과 같은 장면 없음');
    }
    /* 겹침 판정 — 세계 안 장소는 옷 계열 · 자세 추천까지 같을 때만, 다른 장소는 같은 곳이면 */
    card.world = 'fantasy';
    const one = fresh[0].p.cuts[0];
    assert(C.check([one], card, [], [{ ...one }]).length > 0, '같은 장면을 잡는다');
    /* 같은 옷 — 장소 · 구도가 달라도 세계끼리 같은 옷이면 잡는다(2026-11-08 「응 막아줘」) */
    assert(one.item && C.check([one], card, [], [{ ofam: one.ofam, item: one.item, place: '__x', preset: '__y' }]).some(e => /입은 옷/.test(e)), '다른 세계와 같은 옷을 잡는다');
    for (const { w, p } of fresh) { const mineItems = new Set(p.cuts.map(c => c.ofam + '/' + c.item)); fresh.filter(x => x.w !== w).forEach(x => x.p.cuts.forEach(c => assert(!c.item || !mineItems.has(c.ofam + '/' + c.item), w + ' · ' + x.w + ' 같은 옷 ' + c.item))); }
  } finally { fs.rmSync(rec, { recursive: true, force: true }); fs.rmSync(out, { recursive: true, force: true }); }
}
/* 무기는 일상컷에서 들지 않고 장신구로(2026-11-02 사용자 「무기를 일상컷에선 들고 있는것보단 악세사리류로 대체」) —
   무기 장수는 「그 장수의 물건을 든 컷」 이 없고 지시문마다 SIGNATURE ACCESSORY 줄, 부채 · 두루마리 같은 물건은 그대로 손에 든다 */
{
  for (const [key, weapon] of [['조운', true], ['관우', true], ['유비', true], ['제갈량', false]]) {
    const card = C.cardOf(key); card.world = card.worlds[0];
    assert.equal(P.isWeapon(P.holdOf(card.c)), weapon, key + ' — 무기인가');
    assert.equal(card.g.signature.length, weapon ? 0 : 1, key + ' — 일상컷에서 손에 드는 물건');
    const cuts = C.plan(card, SIX, [], { seed: 7 }).cuts;
    for (const c of cuts) {
      const p = C.record(card, card.world, c).prompt;
      assert.equal(p.includes('SIGNATURE ACCESSORY') || /\nAccessory: off duty she carries no weapon/.test(p), weapon, key + ' — 장신구 줄');   /* 짧은 판은 Accessory: 줄(2026-11-08) */
      if (weapon) assert(!p.includes('SIGNATURE ITEM SHAPE') && !p.includes(P.holdOf(card.c) + ' in'), key + ' — 무기를 들지 않는다');
    }
    if (!weapon) assert(cuts.some(c => /sig_/.test(c.use || '')), key + ' — 무기 아닌 물건은 한두 장 든다');
  }
}
/* 시대 몫 — 새 여섯 장은 지금 현실 둘 · 무대·환상 둘 · 세계 안 · 역사의 자리 하나씩(2026-11-02 「지금 현실 비중을 높여줘」 · 2026-11-09 여섯째는 무대·환상),
   세계 안 갈래 장소는 열두 곳(방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 군영 + 정원 · 다리 · 사당 · 숲길 · 나루) */
{
  const tr = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
  assert.deepEqual(tr.required.world.places, ['nation_room', 'nation_bath', 'nation_roof', 'nation_inn', 'nation_study', 'nation_kitchen', 'nation_camp', 'nation_garden', 'nation_bridge', 'nation_temple', 'nation_forest', 'nation_harbor']);   /* 2026-11-03 「다 넣어줘」 — 열둘 */
  for (const key of pickKeys.slice(0, 6)) {
    const card = C.cardOf(key); card.world = card.worlds[0];
    const eras = C.plan(card, SIX, [], { seed: 21 }).cuts.reduce((m, c) => (m[c.era] = (m[c.era] || 0) + 1, m), {});
    assert.deepEqual(Object.fromEntries(Object.entries(eras).sort()), { fantasy: 2, heritage: 1, nation: 1, now: 2 }, key + ' — 시대 몫 ' + JSON.stringify(eras));
  }
}
/* 표정 — 일상컷에 어색한 것(웃는 입에 무표정한 눈 · 지루함 · 졸림 · 지침 · 짜증 · 시큰둥 · 질끈 감은 웃음)은 계획기가 고르지 않고,
   문구는 단서 두셋(2026-11-03 사용자 「표정 관련 문구가 과하게」) */
{
  const ok = ['calm', 'soft_smile', 'gentle', 'amused', 'pensive', 'wistful', 'nostalgic', 'confident', 'proud', 'focused', 'half_smile', 'candid', 'relieved', 'wink', 'sensual', 'serious', 'curious'], seen = new Set();   /* 2026-11-03 「일상컷쪽이 더 그래」 — 은은한 열셋만 */
  for (const key of pickKeys) { const card = C.cardOf(key); for (const w of card.worlds) { card.world = w; for (const seed of [3, 9]) for (const c of C.plan(card, SIX, [], { seed }).cuts) if (c.expr) seen.add(c.expr); } }
  for (const k of seen) assert(ok.includes(k), '은은한 표정이 아닌 ' + k);
  assert(seen.size >= 10, '표정 ' + seen.size + ' 가지');
  const tr2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8'));
  for (const [k, v] of Object.entries(tr2.expressions)) assert(v.split(',').length <= 3 && !/jaw|clench|unsmiling|squeez|slack/.test(v), '표정 문구 ' + k + ': ' + v);
}
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(장수 ${pickKeys.length} × 세계 셋 × 씨앗 둘)이 여섯 장 · 묶음 규칙 · 정해 둔 세 갈래(노출 · 세계 안 · 상황 노출 — 상황 넷 다, 새 계열 모험가 · 신화 드레이프) · 네 시대 · 기록 꼴, 있는 두 장 위에 세 장 · 카드 사이 안 쓴 장소 · 자세 추천 · 표정 먼저 · 세계 셋 한 번에 새 묶음(세계 · 옛 묶음 사이 같은 장면 없음) · 무기는 장신구로(부채 · 두루마리는 손에) · 시대 몫(지금 현실 둘) · 세계 안 갈래 장소 일곱 · 표정 후보(어색한 것 빼고 고르게, 문구 단서 두셋)`);
