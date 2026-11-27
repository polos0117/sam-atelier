/* 일상컷 묶음 계획기(tools/casual-plan.cjs, 2026-11-02 element 에서 옮김) — 장수 여럿 × 세계 셋 × 씨앗 둘이 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   정해 둔 세 갈래(노출 한 장 · 세계 안 한 장 · 게임 코스프레 한 장, 서로 다른 컷 — 2026-11-15, 그 앞 셋째는 상황 노출)는 tools/casual-check.py 와 같은 판정.
   이미 있는 컷(기록) 위에 모자란 번호만 짜는 것도. node tests/casual-plan.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const C = require('../tools/casual-plan.cjs');
const C2T = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/casual-tree-v2.js'), 'utf8'), ctx); return ctx.window.AtelierCasualTreeV2; })();
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sam-design.json'), 'utf8'));
const P = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
  return ctx.window.AtelierPrompt; })();
const keys = P.cards(D), pickKeys = keys.filter((k, i) => i % Math.max(1, Math.floor(keys.length / 6)) === 0).slice(0, 6);
const TS = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../lib/prompt-spec.js'), 'utf8'), ctx); return ctx.window.AtelierSpec; })();
const SJ = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/style.json'), 'utf8')), SR = SJ.styles[C.STYLE], KIT = (SR.versions.find(v => v.v === SR.current) || {}).casualKit, SHORT = !!(SR.versions.find(v => v.v === SR.current) || {}).casualShort, LEG = !!((SR.versions.find(v => v.v === SR.current) || {}).legacy25 || (SR.versions.find(v => v.v === SR.current) || {}).casualLegacy);   /* casualLegacy — 일상컷만 2.5 글 긴 꼴(kr_drawn_rim_dewy 2026-11-11) */   /* 기본 화풍에 일상컷 묶음이 있으면(kr_mmorpg v5~, 2026-11-08 기본) 그 글로 */
let n = 0; const dn = { fit: 0, set: 0 }, situSeen = new Set(), famSeen = new Set(), cosSeen = new Set(); let situN = 0;
const GCJ = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/game-cosplay.json'), 'utf8')), COSP = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8')).cosplay;
const SIX = [1, 2, 3, 4, 5, 6], SEVEN = [1, 2, 3, 4, 5, 6, 7];   /* 2026-11-11 일곱 장 — 여섯 칸 계획은 옛 묶음 꼴(자유 설계 칸 없이) */
const FD = TS.FREE_DESIGN, TREE1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
const famEn = k => FD.familyNames[k] || TREE1.outfits.find(o => o.key === k).en, situEn = k => TS.CASUAL.situations.find(x => x.key === k).en;
const freeSeen = new Set(), freeSitu = new Set();
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3]) {
    card.world = w;
    const res = C.plan(card, SEVEN, [], { seed, recent: ['a retro diner — holds a cup'] });
    assert.equal(res.cuts.length, 7, key + ' ' + w + ' 일곱 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const real = res.cuts.filter(c => !c.ofree), ex = real.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = real.filter(c => C.requiredType(c) === 'nation');   /* 자유 설계 컷의 장면은 그림자 */
    assert(ex.length && inw.length && (ex.length + inw.length >= 2), key + ' ' + w + ' 정해 둔 두 갈래 — 노출 한 장 · 세계 안 한 장');
    /* 셋째 필수 — 게임 코스프레 꼭 한 장(2026-11-15, 상황 노출 자리) — 목록의 게임 · 재단, 정해 둔 장소, 얼굴 클로즈업 아님, 옷 색 · 데니어 · 상황 없음 */
    const co = res.cuts.filter(c => C.requiredType(c) === 'cosplay');
    assert.equal(co.length, 1, key + ' ' + w + ' 게임 코스프레 한 장');
    { const c = co[0], cs = c.cosplay, gm = GCJ.games.find(g => g.key === cs.game), cut = c.item.replace(/^gc_/, '');
      assert(gm && cs.cut === cut && GCJ.cuts.some(x => x.key === cut) && !c.ofree, key + ' ' + w + ' 게임 · 재단 — ' + JSON.stringify(cs));
      /* 2026-11-16 — 등장인물 많은 게임 1회차도 계획기가 목록의 캐릭터를 정한다(assigned — pick 빈 칸은 새 계획에 없다) */
      assert(gm.many ? cs.round === 1 && gm.characters.some(ch => ch.name === cs.character) && !cs.used && !cs.again : cs.character === gm.character, key + ' 주인공 하나 게임은 정한 캐릭터, 많은 게임 1회차는 목록의 캐릭터 ' + JSON.stringify(cs));
      assert(!c.color && !c.shade && !c.denier && !c.situ && c.frame !== 'face_close', key + ' 코스프레 컷엔 색(shade 도) · 데니어 · 상황 없음 · 얼굴 클로즈업 아님');
      assert([...COSP.places, ...(COSP.swim_cuts.includes(cut) ? COSP.swim_places : [])].includes(c.place), key + ' 코스프레 장소 ' + c.place);
      cosSeen.add(cs.game);
      const p = C.record(card, w, c).prompt, ol = (p.match(/^Outfit: .*$/m) || [''])[0];
      const want = gm.many ? GCJ.text.assigned.replace('{character}', cs.character).replace('{game}', gm.en).replace('{cut}', GCJ.cuts.find(x => x.key === cut).en) : GCJ.text.fixed.replace('{character}', gm.character).replace('{game}', gm.en).replace('{outfit}', gm.outfit).replace('{cut}', GCJ.cuts.find(x => x.key === cut).en);
      assert(ol.startsWith('Outfit: ' + want) && !/ — in |-denier yarn|; right now — /.test(ol), key + ' 코스프레 Outfit 줄 — ' + ol.slice(0, 120));
      assert(p.includes(TS.CASUAL.outputCosplay) && p.includes(TS.CASUAL.wardrobeCosplay) && !p.includes(TS.CASUAL.output) && !/^WARDROBE: change her clothes completely\. /m.test(p), key + ' 코스튬 OUTPUT · WARDROBE');
      assert(!/^DESIGN \(accessory hints only\)|^SIGNATURE ACCESSORY|never in the outfit's colours|faction's palette/m.test(p) && /^CHARACTER: [^\n]*game cosplay/m.test(p), key + ' 전설 · 무기 장신구 · 세력 색 줄이 코스프레 컷과 부딪치지 않게');
      assert(/^FIGURE: /m.test(p), key + ' 체형 줄은 그대로'); }
    /* 상황 노출은 필수에서 빠졌다 — 일반 컷에 한 장까지(열에 셋), 노출 · 세계 안 · 코스프레 · 자유 설계 컷엔 없다 */
    const si = res.cuts.filter(c => c.situ);
    assert(si.length <= 1, key + ' ' + w + ' 상황 노출은 한 장까지');
    for (const c of si) { assert(!C.requiredType(c) && !c.ofree && P.situFits(c.situ, C.outfitEn(c)), key + ' ' + w + ' 상황 컷은 일반 컷 · 맞는 옷'); situSeen.add(c.situ); situN++; }
    res.cuts.forEach(c => famSeen.add(c.ofam));
    /* 자유 설계 두 장(2026-11-11) — 옷 자유 한 장 + 갈래 자유 한 장, 필수 셋이 아닌 컷, 색 · 데니어 없음. 지시문은 장면 줄 대신 FREE DESIGN 덩어리 */
    { const fr = res.cuts.filter(c => c.ofree), fo = fr.filter(c => !c.ofreeFamily), ff = fr.filter(c => c.ofreeFamily);
      assert(fo.length === 1 && ff.length === 1, key + ' ' + w + ' 옷 자유 한 장 · 갈래 자유 한 장');
      const exFam = new Set(real.map(C.requiredType).filter(t => C.EXPOSE_TYPES.includes(t)));
      assert(C.EXPOSE_TYPES.includes(ff[0].ofreeFamily) && !exFam.has(ff[0].ofreeFamily) && ff[0].ofreeSitu === 'free', key + ' ' + w + ' 갈래 자유 — 노출 갈래 컷과 다른 갈래(큰 범위) · 상황은 열기(2026-11-11 「상황도 열어주자」)');
      freeSeen.add(ff[0].ofreeFamily); freeSitu.add(ff[0].ofreeSitu);
      for (const c of fr) {
        assert(!c.situ && !c.color && !c.denier, key + ' ' + w + ' 자유 설계 컷은 필수 셋과 다른 칸 · 색 · 데니어 없음');
        const p = C.record(card, w, c).prompt, L = p.split('\n');
        assert(L.includes(FD.head) && L.includes(c.ofreeFamily ? FD.outfitFamily : FD.outfit) && FD.lines.every(l => L.includes(l)), key + ' 자유 설계 덩어리');
        assert(/^Recent scenes to avoid: a retro diner — holds a cup; [^\n]+ — /m.test(p) && c.ofreeRecent.split('; ').length >= 1 + 4, key + ' 최근 장면 + 같은 묶음 다른 컷 다섯');
        assert(!/^(?:POSTURE|COMPOSITION|GAZE|EXPRESSION|PROP|RIGHT HAND|LEFT HAND|BOTH HANDS|LEGS|Lens \/ perspective|ERA|WORLD|SETTING|CROP|SCREENS|LOOK-BACK): /m.test(p) && L.filter(l => /^Place: /.test(l)).length === 1, key + ' 자유 설계 컷엔 계획 장면 줄이 없다');
        assert(/^skin_exposure: bold — /m.test(p) && /^ANATOMY: /m.test(p) && /^HANDS: /m.test(p) && /^STYLE: /m.test(p), key + ' 노출 · 인체 · 화풍 줄은 그대로');
        if (c.ofreeFamily) assert(L.includes(FD.family.split('{family}').join(famEn(c.ofreeFamily))) && L.includes(FD.situFree) && !/^Situation \(required\): right now/m.test(p), key + ' 갈래 자유 — 갈래 · 상황 줄');
        else assert(!/^Outfit family|^Situation \(required\)/m.test(p), key + ' 옷 자유 — 갈래 · 상황 줄 없음');
      } }
    assert(inw.every(c => c.era === 'nation'), '세계 안 갈래는 세계 안 시대');
    assert.equal(new Set(res.cuts.map(c => c.era)).size, 4, key + ' ' + w + ' 네 시대 다');
    { const cs = res.cuts.map(c => c.color).filter(Boolean); assert.equal(new Set(cs).size, cs.length, key + ' ' + w + ' 옷 색 갈래가 묶음 안에서 겹치지 않는다'); }
    { const sh = res.cuts.map(c => c.shade).filter(Boolean), hh = P.hairHue(D, key, w), all = TS.CASUAL.colors.flatMap(g => g.shades);   /* 구체 색(2026-11-16) — 묶음 안 겹침 없음 · 머리색 갈래 피함 */
      assert.equal(new Set(sh).size, sh.length, key + ' ' + w + ' shade 가 묶음 안에서 겹치지 않는다');
      assert.equal(sh.length, res.cuts.filter(c => c.color).length, key + ' ' + w + ' 색 묶음이 있는 컷마다 shade');
      for (const c of res.cuts.filter(c => c.shade)) { const sg = TS.CASUAL.colors.find(g => g.key === c.color); assert(sg.shades.some(x => x.key === c.shade), key + ' shade 는 그 묶음 안 열쇠'); if (hh && sg.shades.some(x => x.hue !== hh)) assert(all.find(x => x.key === c.shade).hue !== hh, key + ' ' + w + ' 머리색 갈래(' + hh + ') 피함 — ' + c.shade); } }
    dn.fit += res.cuts.filter(c => !c.ofree && C.requiredType(c) !== 'cosplay' && P.denierFits(C.outfitEn(c))).length;   /* 자유 설계 · 코스프레 컷엔 데니어를 안 얹는다 — 분모에서 뺀다(2026-11-16 — 계획기가 캐릭터를 정하며 재단이 바뀌어 스타킹 재단이 분모만 늘렸다) */ dn.set += res.cuts.filter(c => c.denier).length;
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
      if (c.ofree || C.requiredType(c) === 'cosplay') continue;   /* 자유 설계 컷 · 코스프레 컷 — 위에서 */
      if (P.colorFixed(C.outfitEn(c))) assert(!c.color && !c.shade && !/the outfit colour reads clearly/.test(ol), key + ' 색이 박힌 옷엔 색 줄 · shade 없음');
      else {   /* 구체 색(2026-11-16) — 계획에 그 묶음 안 shade, 지시문엔 그 shade 글 하나(「such as」 예시 나열 없이) */
        const SH = CL && (CL.shades || []).find(x => x.key === c.shade);
        assert(SH && ol.includes(' — in ' + SH.en + '; the outfit colour reads clearly') && !/such as/.test(ol) && !ol.includes(CL.en), key + ' ' + w + ' 옷 색 줄 — shade ' + c.shade + ' — ' + ol.slice(0, 100));
        assert.equal(rec.scene.shade, c.shade, key + ' 기록 장면에 shade');
      }
      /* 데니어(2026-11-08) — 닿는 옷에만, 고르면 Outfit 줄에 그 데니어, 노출 축은 그대로 */
      if (c.denier) { const DN = TS.CASUAL.deniers.find(x => x.key === c.denier); assert(DN && P.denierFits(C.outfitEn(c)) && ol.includes(DN.top + '-denier yarn') && ol.includes('fully opaque lining over the bust and the hips'), key + ' 데니어 줄 — ' + ol.slice(0, 80)); }
      else assert(!/-denier yarn/.test(ol), key + ' 데니어 안 고른 컷엔 비침 줄 없음');
      if (!P.denierFits(C.outfitEn(c))) assert(!c.denier, key + ' 데니어는 닿는 옷에만');
      /* 상황 노출 — 고른 컷만 Outfit 줄에 「right now — 그 상황」 */
      if (c.situ) { const SI = TS.CASUAL.situations.find(x => x.key === c.situ); assert(ol.includes('; right now — ' + SI.en) || (!!SI.enIn && ol.includes('; right now — ' + SI.enIn)), key + ' 상황 줄(실내면 물 튐 글 enIn — 2026-11-13) — ' + ol.slice(0, 80)); }
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
/* 상황은 일반 컷에 가끔(열에 셋) · 새 계열 모험가 · 신화 드레이프도 뽑힌다(2026-11-09) · 게임 코스프레는 여러 게임에 고루(2026-11-15) */
assert(situN >= n * 0.8 && situN <= n, '상황 노출 — 일반 컷에 늘 한 장(맞는 옷이 없으면 빠짐, 2026-11-16) ' + situN + '/' + n + ' · ' + [...situSeen].join(' · '));
assert(famSeen.has('adventure') && famSeen.has('drape'), '새 계열 — ' + [...famSeen].join(' · '));
assert(cosSeen.size >= 4, '코스프레 게임이 여럿 — ' + [...cosSeen].join(' · '));   /* 2026-11-15 무게 고르기(인원 많은 게임이 자주) — 예전엔 고루 여덟 이상 */
{ let x = 123; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, cnt = {}; for (let i = 0; i < 4000; i++) { const k = C.pickCosplay([], rnd).game; cnt[k] = (cnt[k] || 0) + 1; }
  assert((cnt.league_of_legends || 0) > 5 * (cnt.legend_of_zelda || 0) && (cnt.legend_of_zelda || 0) > 0 && (cnt.league_of_legends || 0) > (cnt.street_fighter_2 || 0), '무게 고르기(남은 인원의 제곱근) ' + JSON.stringify(cnt)); }
{ const cd = C.cardOf('조조'); cd.world = 'samguk'; const cuts = C.plan(cd, SIX, [], { seed: 4 }).cuts.map(c => { const x = { ...c }; delete x.situ; return x; });
  const cc = cuts.find(c => C.requiredType(c) === 'cosplay'), plain = TREE1.outfits.find(o => o.key === 'everyday').items.find(i => !i.low && P.situsFor(i.en).includes('strap'));
  assert(C.check(cuts.filter(c => c !== cc), cd, []).length >= 0 && C.check(cuts.map(c => c === cc ? { ...c, ofam: 'everyday', item: plain.key, cosplay: undefined } : c), cd, []).some(e => /게임 코스프레 컷이 없다/.test(e)), '게임 코스프레 컷이 없으면 잡는다');
  /* 옛 묶음(상황 필수 시절) — 셋째가 상황 노출 컷이면 코스프레 없이 그대로 맞다 */
  assert.deepEqual(C.check(cuts.map(c => c === cc ? { ...c, ofam: 'everyday', item: plain.key, cosplay: undefined, situ: 'strap' } : c), cd, []).filter(e => /코스프레|상황/.test(e)), [], '옛 묶음(상황 필수 시절)은 그대로 맞다');
  assert(C.check(cuts.map(c => c === cc ? { ...c, color: 'vivid', situ: 'strap' } : c), cd, []).some(e => /색 · 데니어 · 상황/.test(e)), '코스프레 컷의 색 · 상황을 잡는다');
  assert(C.check(cuts.map(c => c === cc ? { ...c, cosplay: { ...c.cosplay, game: 'tetris' } } : c), cd, []).some(e => /목록의 게임이 없다/.test(e)), '목록에 없는 게임을 잡는다');
  const sc = cuts.find(c => !C.requiredType(c) && P.situsFor(C.outfitEn(c)).length); if (sc) assert(C.check(cuts.map(c => c === sc ? { ...c, ofam: 'swimwear', item: 'classic_bikini', situ: 'wet' } : c), cd, []).some(e => /안 맞는다/.test(e)), '맞지 않는 옷의 상황을 잡는다');
  assert.deepEqual(C.check(cuts.slice(0, 5).filter(c => c !== cc), cd, []).filter(e => /상황|코스프레/.test(e)), [], '옛 다섯 장 묶음은 셋째 없이 맞다'); }
/* 갈래 자유 — 세 갈래 · 상황 넷이 고루 쓰인다. 옛 여섯 장 묶음은 갈래 자유 없이 맞고, 여섯 장을 다 그린 세계는 일곱째(갈래 자유) 하나만 짜인다(2026-11-11) */
assert(freeSeen.size === 3 && freeSitu.size === 1, '갈래 자유 갈래 ' + [...freeSeen].join(' · ') + ' / 상황 ' + [...freeSitu].join(' · '));
{ const cd = C.cardOf('손권'); cd.world = 'fantasy';
  const six = C.plan(cd, SIX, [], { seed: 6 }).cuts;
  assert(!six.some(c => c.ofree) && !C.check(six, cd, []).length, '여섯 칸 계획 — 옛 꼴(자유 설계 칸 없이) 그대로 통과');
  const old6 = six.map(c => ({ ...c, old: true })), sev = C.plan(cd, [7], old6, { seed: 8, recent: ['x — y'] });
  assert(sev.cuts.length === 1 && sev.cuts[0].n === 7 && sev.cuts[0].ofree && sev.cuts[0].ofreeFamily && !C.check(sev.cuts, cd, old6).length, '여섯 장 위 일곱째 — 갈래 자유 하나');
  const exs = new Set(old6.map(C.requiredType).filter(t => C.EXPOSE_TYPES.includes(t))), ss = old6.find(c => c.situ);
  assert(!exs.has(sev.cuts[0].ofreeFamily) && sev.cuts[0].ofreeSitu === 'free' && sev.cuts[0].ofreeRecent.split('; ').length >= 6, '일곱째 — 옛 묶음과 다른 갈래 · 상황, 피할 장면에 옛 여섯 장');
  const seven = [...old6, ...sev.cuts].map(c => ({ ...c, old: false })), fc = seven.find(c => c.ofreeFamily);
  assert(C.check(seven.map(c => c === fc ? { ...c, ofreeFamily: [...exs][0] } : c), cd, []).some(e => /노출 갈래 컷과 같다/.test(e)), '갈래 자유가 노출 갈래 컷과 같으면 잡는다');
  if (ss) assert(C.check(seven.map(c => c === fc ? { ...c, ofreeSitu: ss.situ } : c), cd, []).some(e => /상황 노출 컷과 같다/.test(e)), '표 상황(손으로 고른 · 옛 기록)이 상황 노출 컷과 같으면 잡는다');
  { const other = C.SITUS.find(k => !ss || k !== ss.situ); assert(!C.check(seven.map(c => c === fc ? { ...c, ofreeSitu: other } : c), cd, []).length, '표 상황(다른 것)도 통과'); }
  assert(C.check(seven.map(c => c === fc ? { ...c, ofreeSitu: 'rain' } : c), cd, []).some(e => /상황 표에도 없다/.test(e)), '없는 상황 열쇠를 잡는다');
  { const p7 = C.record(cd, 'fantasy', { ...fc, ofreeSitu: 'wind' }).prompt; assert(p7.includes(FD.situ.replace('{situ}', situEn('wind'))) && !p7.includes(FD.situFree), '표 상황이면 표 글 그대로'); }
  assert(C.check(seven.map(c => { const x = { ...c }; if (x === fc || x.ofreeFamily) { delete x.ofree; delete x.ofreeFamily; delete x.ofreeSitu; } return x; }), cd, []).some(e => /갈래 자유 컷이 없다/.test(e)), '일곱 장에 갈래 자유가 없으면 잡는다');
  /* 최근 장면 — 기록의 채운 덩어리에서 장소 · 하는 일 */
  assert.equal(C.blockScene('x\nFREE DESIGN: …\nRecent scenes to avoid: a.\nPlace: a night ferry deck, wind\nActivity: feeding gulls\nPose: …'), 'a night ferry deck — feeding gulls', '채운 덩어리의 장면'); }
/* 데니어는 랜덤 — 닿는 옷 컷의 대략 열에 여섯(넓게: 3할 ~ 9할). 분모는 데니어를 얹을 수 있는 컷만(2026-11-16 — 그래서 표본 하한 20 → 10) */
assert(dn.fit >= 10 && dn.set / dn.fit > 0.3 && dn.set / dn.fit < 0.9, '데니어 비율 ' + dn.set + '/' + dn.fit);
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
  const share = (u, f, set) => { let hit = 0, all = 0; for (const key of pickKeys) { const card = C.cardOf(key); card.world = card.worlds[0]; for (const seed of [3]) for (const c of C.plan(card, [1, 2, 3, 4, 5], [], { seed, usage: u }).cuts) { if (!c[f]) continue; all++; if (set.has(c[f])) hit++; } } return hit / all; };
  for (const [f, set, name] of [['place', fresh, '장소'], ['preset', freshP, '자세 추천']]) {   /* 표정은 고르게 뽑는다(2026-11-03) */
    const base = share({}, f, set), lean = share(usage, f, set);
    assert(lean > 0.6 && lean > base * 1.5, name + ' — 안 쓴 값 비율 ' + lean.toFixed(2) + ' (횟수 없이 ' + base.toFixed(2) + ')');
  }
  const card = C.cardOf('관우'); card.world = 'fantasy';
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, C.plan(card, [1, 2, 3], [], { seed: 7, usage }).cuts, '같은 입력 · 씨앗이면 같은 답');
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7, usage: { cup: 3 } }).cuts.length, 3, '옛 꼴(소품 → 횟수)도 받는다');
  const img = path.join(__dirname, '../../sam-atelier-img/records');
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, '관우'); assert(Object.keys(u.place).length > 3 && Object.keys(u.preset).length > 3 && Object.keys(u.expr).length > 0, '그림 저장소 기록에서 센다'); }
  /* 그림 저장소 둘(2026-11-12) — 한 장수의 기록이 두 저장소에 나뉘어도 옛 컷 · 쓴 횟수 · 최근 장면을 둘 다에서 읽는다 */
  { const a = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-a-')), b = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-b-'));
    try {
      const c2 = C.cardOf('조운'); c2.world = 'samguk'; const cuts = C.plan(c2, [1, 2], [], { seed: 4 }).cuts;
      for (const [dir, c] of [[a, cuts[0]], [b, cuts[1]]]) { fs.mkdirSync(path.join(dir, '조운'), { recursive: true }); fs.writeFileSync(path.join(dir, '조운', `samguk-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(C.record(c2, 'samguk', c))); }
      assert.deepEqual(C.oldCuts([path.join(a, '조운'), path.join(b, '조운'), path.join(a, '없음')], c2, 'samguk').map(c => c.n).sort(), [1, 2], '옛 컷 — 두 저장소');
      const u1 = C.sceneUsage(a, ''), u2 = C.sceneUsage([a, b], '');
      assert.equal(Object.values(u2.place).reduce((x, y) => x + y, 0), Object.values(u1.place).reduce((x, y) => x + y, 0) + 1, '쓴 횟수 — 두 저장소');
    } finally { fs.rmSync(a, { recursive: true, force: true }); fs.rmSync(b, { recursive: true, force: true }); }
  }
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
      assert.equal(p.cuts.length, 7); assert(p.cuts.every(c => c.n > 5), w + ' — 새 번호는 옛 묶음 뒤');
      const others = [...old, ...fresh.filter(x => x.w !== w).flatMap(x => x.p.cuts)];
      assert.deepEqual(C.check(p.cuts, card, [], others), [], w + ' — 다른 세계 · 옛 묶음과 같은 장면 없음');
    }
    /* 겹침 판정 — 세계 안 장소는 옷 계열 · 자세 추천까지 같을 때만, 다른 장소는 같은 곳이면 */
    card.world = 'fantasy';
    const one = fresh[0].p.cuts[0];
    assert(C.check([one], card, [], [{ ...one }]).length > 0, '같은 장면을 잡는다');
    /* 같은 옷 — 장소 · 구도가 달라도 세계끼리 같은 옷이면 잡는다(2026-11-08 「응 막아줘」) */
    assert(one.item && C.check([one], card, [], [{ ofam: one.ofam, item: one.item, place: '__x', preset: '__y' }]).some(e => /입은 옷/.test(e)), '다른 세계와 같은 옷을 잡는다');
    /* 자유 설계 칸(ofree)은 옷을 맡은 쪽이 지어 계획의 옷이 안 그려진다 — 겹침에서 뺀다(계획기 check 의 outfitKey 와 같게, 2026-11-13 표본이 바뀌며 드러남) */
    /* 게임 코스프레 칸도 뺀다 — 옷은 「캐릭터 + 재단」 이라 재단(gc_<재단>)만 같아도 다른 옷이다(계획기 check 의 outfitKey 가 코스프레 계열을 빼는 것과 같게).
       2026-11-17 코스프레 목록이 게임 스물넷 · 캐릭터 이백쯤으로 늘며 표본이 바뀌어 두 세계가 다른 캐릭터의 코르셋 재단을 골랐다 */
    for (const { w, p } of fresh) { const keep = c => !c.ofree && c.ofam !== 'game_cosplay', mineItems = new Set(p.cuts.filter(keep).map(c => c.ofam + '/' + c.item)); fresh.filter(x => x.w !== w).forEach(x => x.p.cuts.filter(keep).forEach(c => assert(!c.item || !mineItems.has(c.ofam + '/' + c.item), w + ' · ' + x.w + ' 같은 옷 ' + c.item))); }
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
      if (p.includes('OFF-DUTY GEAR CARE')) continue;   /* 손질 컷은 무기 없음의 한 가지 예외(note_gear_care) — 2026-11-26 무협 장면을 넣으며 표본이 바뀌어 seed 7 에 들었다 */
      if (C.requiredType(c) === 'cosplay') { assert(!p.includes('SIGNATURE ACCESSORY') && !/\nAccessory: off duty/.test(p), key + ' — 코스프레 컷엔 무기 장신구 줄 없이(코스튬이 캐릭터를 드러낸다, 2026-11-15)'); continue; }
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
  const ok = ['calm', 'soft_smile', 'gentle', 'amused', 'pensive', 'wistful', 'nostalgic', 'confident', 'proud', 'focused', 'half_smile', 'candid', 'relieved', 'wink', 'sensual', 'serious', 'curious', 'lip_bite', 'heavy_lidded', 'knowing_smirk'], seen = new Set(), allure = ['lip_bite', 'heavy_lidded', 'knowing_smirk'], T2a = C2T.make(JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8')));   /* 2026-11-27 입술 깨물기 · 나른한 눈 · 비웃는 미소 — 도발적인 옷(allure)에서만 */   /* 2026-11-03 「일상컷쪽이 더 그래」 — 은은한 열셋만 */
  for (const key of pickKeys) { const card = C.cardOf(key); for (const w of card.worlds) { card.world = w; for (const seed of [3]) for (const c of C.plan(card, SIX, [], { seed }).cuts) if (c.expr) { seen.add(c.expr); if (allure.includes(c.expr)) assert(C2T.sceneFeatures(T2a, c).includes('allure'), c.expr + ' 가 도발적이지 않은 옷(' + c.ofam + ')에'); } } }
  for (const k of seen) assert(ok.includes(k), '은은한 표정이 아닌 ' + k);
  assert(seen.size >= 10, '표정 ' + seen.size + ' 가지');
  const tr2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8'));
  for (const [k, v] of Object.entries(tr2.expressions)) assert(v.split(',').length <= 3 && !/jaw|clench|unsmiling|squeez|slack/.test(v), '표정 문구 ' + k + ': ' + v);
}
/* 게임 코스프레 고르기(2026-11-15 · 2026-11-16) — 쓴 것은 이 공방 그림 저장소에서(그린 기록 + 계획의 예약 — 2026-11-16 「공방별로 따로」, 전엔 세 공방 합쳐), 게임은 남은 인원의 제곱근 무게로, 주인공 하나 게임은 안 입은 재단, 다 찬 게임은 빠진다,
   등장인물 많은 게임은 1회차(계획기가 목록의 캐릭터를 정한다 — assigned, 여자 무게 2) → 2회차(again). 옛 pick 칸 지시문은 그대로.
   함수 · 칸 이름은 원소 · pkm 과 같다 — cosplayUsage(쓴 줄 목록) · pickCosplay · cosplayAgain, scene.cosplay · generation.cosplay */
{
  const cuts = GCJ.cuts.map(c => c.key), names = g => g.many ? g.characters.map(ch => ch.name) : [g.character];
  const busy = except => { const U = []; for (const g of GCJ.games) if (!except.includes(g.key)) for (const nm of names(g)) for (const cut of cuts) U.push({ game: g.key, character: nm, cut }); return U; };   /* 다른 게임을 다 채운다(목록 캐릭터 × 재단) */
  const r0 = (() => { let x = 0; return () => { x = (x + 0.37) % 1; return x; }; })();
  const lcg = s0 => { let x = s0; return () => (x = (x * 16807) % 2147483647) / 2147483647; };
  assert(GCJ.games.filter(g => g.many).every(g => g.characters.length === g.roster && g.characters.every(ch => ch.name && typeof ch.female === 'boolean')), '목록 — 등장인물 많은 게임마다 characters(name · female), roster = 그 수');
  /* 주인공 하나 — 마리오가 열 벌 입었으면 남은 한 벌, 열하나 다 입으면 마리오는 빠진다 */
  { const U = busy(['super_mario_bros']); for (const k of cuts.slice(0, 10)) U.push({ game: 'super_mario_bros', character: 'Mario', cut: k });
    const p1 = C.pickCosplay(U, r0); assert.deepEqual([p1.game, p1.character, p1.cut, p1.round], ['super_mario_bros', 'Mario', cuts[10], 1], '주인공 하나 — 안 입은 재단 ' + JSON.stringify(p1));
    U.push({ game: 'super_mario_bros', character: ' mario', cut: cuts[10] });   /* 이름은 큰 · 작은 글자 · 빈칸을 가리지 않는다 */
    assert.equal(C.pickCosplay(U, Math.random), null, '다 찬 게임은 빠진다(다른 게임도 다 차 있어 고를 게 없다)'); }
  /* 주인공 하나 게임은 기록 이름이 달라도 그 주인공 — 「Geralt」 로 입은 재단은 「Geralt of Rivia」 가 다시 안 입는다(2026-11-16) */
  { const U = busy(['witcher_3']); for (const k of cuts.slice(0, 10)) U.push({ game: 'witcher_3', character: k === cuts[0] ? 'Geralt' : 'Geralt of Rivia', cut: k });
    const T = C.cosplayTally(U).games.witcher_3; assert(Object.keys(T.chars).length === 1 && T.chars['geralt of rivia'].cuts[cuts[0]] === 1, '주인공 이름 하나로 ' + JSON.stringify(T.chars));
    assert.equal(C.pickCosplay(U, r0).cut, cuts[10], '「Geralt」 로 입은 재단도 빠진다'); }
  /* 무게 고르기(2026-11-15 「케릭터 수 많은 게임일수록 더 많이」 → B) — 남은 인원의 제곱근: 오버워치(남은 37 → √37 ≈ 6.1)가 툼레이더(1)보다 훨씬 자주, 툼레이더도 나온다 */
  { const U = busy(['tomb_raider', 'overwatch']); U.push({ game: 'overwatch', character: 'Tracer', cut: 'bikini' });
    let ow = 0, tr = 0; for (let i = 0; i < 600; i++) { const g = C.pickCosplay(U, Math.random).game; if (g === 'overwatch') ow++; else if (g === 'tomb_raider') tr++; }
    assert(ow > 3 * tr && tr > 0 && ow + tr === 600, '무게 고르기 오버워치 ' + ow + ' · 툼레이더 ' + tr); }
  /* 1회차 — 계획기가 목록에서 아직 안 쓴 캐릭터를 정한다(assigned), 재단은 그 게임에서 덜 쓴 것. 빈 기록에서 오버워치 스무 번 — 캐릭터가 겹치지 않는다 */
  { const U = [], seen = []; const rnd = lcg(7);
    while (seen.length < 20) { const p = C.pickCosplay(U, rnd); U.push({ game: p.game, character: p.character, cut: p.cut }); if (p.game === 'overwatch') { assert(p.round === 1 && p.character && !p.used, '오버워치 1회차 assigned ' + JSON.stringify(p)); seen.push(p.character); } }
    assert.equal(new Set(seen).size, 20, '빈 기록에서 오버워치 스무 번 — 겹침 없음 ' + seen.join(', '));
    assert(seen.every(nm => GCJ.games.find(g => g.key === 'overwatch').characters.some(ch => ch.name === nm)), '목록 안의 캐릭터'); }
  /* 여자 무게 — 오버워치만 열린 채 4000 번: 여자 비율이 목록 비율(21/38)보다 높다(무게 2 · 1 이면 약 0.71) */
  { const ow = GCJ.games.find(g => g.key === 'overwatch'), fem = new Set(ow.characters.filter(ch => ch.female).map(ch => ch.name)), U = busy(['overwatch']), rnd = lcg(11);
    let f = 0; for (let i = 0; i < 4000; i++) { const p = C.pickCosplay(U, rnd); assert.equal(p.game, 'overwatch'); if (fem.has(p.character)) f++; }
    assert(f / 4000 > fem.size / ow.characters.length + 0.08 && f / 4000 < 0.8, '여자 무게 ' + f + '/4000 · 목록 ' + fem.size + '/' + ow.characters.length);
    assert.deepEqual({ ...C.CHAR_WEIGHT }, { female: 2, male: 1 }, '여자 2 · 남자 1'); }
  /* 쓴 · 예약 캐릭터는 빠진다 · 목록을 다 쓰면 2회차 · 다 차면 빠짐 */
  { const sf = GCJ.games.find(g => g.key === 'street_fighter_2'), U = busy(['street_fighter_2']);
    U.push({ game: 'street_fighter_2', character: 'Chun-Li', cut: 'bikini' }, { game: 'street_fighter_2', character: 'Cammy', cut: 'leotard' }, { game: 'street_fighter_2', character: 'Chun-Li', cut: 'idol' });
    const p1 = C.pickCosplay(U, r0);
    assert(p1.game === 'street_fighter_2' && p1.round === 1 && sf.characters.some(ch => ch.name === p1.character) && !['Chun-Li', 'Cammy'].includes(p1.character) && !['bikini', 'leotard', 'idol'].includes(p1.cut) && !p1.used, '1회차 assigned — 쓴 캐릭터 · 쓴 재단 피함 ' + JSON.stringify(p1));
    assert.equal(C.withAgain(p1, U, 'stage_convention', r0), p1, '정해 둔 칸엔 2회차 몫이 붙지 않는다');
    const cutEn = k => GCJ.cuts.find(x => x.key === k).en, sc1 = { ofam: 'game_cosplay', item: 'gc_' + p1.cut, cosplay: p1 };
    assert.equal(P.cosplayOutfit(sc1, GCJ), GCJ.text.assigned.replace('{character}', p1.character).replace('{game}', 'Street Fighter II').replace('{cut}', cutEn(p1.cut)), '1회차 글 — text.assigned');
    assert(!P.cosplayNeedsFill(sc1, GCJ) && !C.againScene(sc1), '정해 둔 칸 — 채울 자리 · 2회차 몫 없음');
    assert.deepEqual(JSON.parse(JSON.stringify(P.cosplayRecord(sc1, GCJ))), { game: 'street_fighter_2', character: p1.character, cut: p1.cut }, '그린 뒤 기록 generation.cosplay');
    /* 옛 pick 칸(2026-11-16 전에 짜 아직 안 그린 계획) — 지시문 · 2회차 몫 · 채울 자리 · 기록은 그대로 */
    const old = { game: 'street_fighter_2', character: '', cut: 'knit', round: 1, used: ['Cammy', 'Chun-Li'] }, wo = C.withAgain(old, U, 'stage_convention', r0);
    assert(wo.again && wo.again.character === 'Cammy' && wo.again.cut === 'knit', '옛 pick 칸의 2회차 몫 ' + JSON.stringify(wo.again));
    assert(C.withAgain({ ...old, cut: 'mini_dress' }, U, 'water_pool', r0).again.cut.match(/^(bikini|one_piece)$/), '물가면 2회차 몫도 수영복 재단');
    const sc = { ofam: 'game_cosplay', item: 'gc_knit', cosplay: wo };
    assert.equal(P.cosplayOutfit(sc, GCJ), GCJ.text.pick.replace('{game}', 'Street Fighter II').replace('{used}', 'Cammy, Chun-Li').replace('{cut}', cutEn('knit')), '옛 pick 글 그대로');
    assert.equal(P.cosplayOutfit(sc, GCJ, 'again'), GCJ.text.again.replace('{character}', 'Cammy').replace('{game}', 'Street Fighter II').replace('{cut}', cutEn('knit')), '넘길 2회차 글');
    { const ag = C.againScene(sc); assert(ag.item === 'gc_knit' && ag.cosplay.character === 'Cammy' && ag.cosplay.round === 2 && !ag.cosplay.again, '2회차 몫의 장면'); }
    assert(P.cosplayNeedsFill(sc, GCJ) && !P.cosplayNeedsFill({ ...sc, cosplay: { ...old, character: 'Ryu' } }, GCJ), '채울 자리');
    assert.deepEqual(JSON.parse(JSON.stringify(P.cosplayRecord(sc, GCJ, 'Ryu'))), { game: 'street_fighter_2', character: 'Ryu', cut: 'knit' }, '옛 pick 기록 generation.cosplay');
    /* 2회차 — 목록 캐릭터를 다 썼으면(쓴 · 예약), 쓴 캐릭터 중 덜 입은 하나와 그가 안 입은 재단 */
    for (const nm of names(sf)) if (!['Chun-Li', 'Cammy'].includes(nm)) for (const k of cuts) U.push({ game: 'street_fighter_2', character: nm, cut: k });
    const p2 = C.pickCosplay(U, r0);
    assert(p2.game === 'street_fighter_2' && p2.round === 2 && ['Cammy', 'Chun-Li'].includes(p2.character) && !(p2.character === 'Cammy' ? ['leotard'] : ['bikini', 'idol']).includes(p2.cut), '2회차 again ' + JSON.stringify(p2));
    assert.equal(P.cosplayOutfit({ ofam: 'game_cosplay', item: 'gc_' + p2.cut, cosplay: p2 }, GCJ), GCJ.text.again.replace('{character}', p2.character).replace('{game}', 'Street Fighter II').replace('{cut}', cutEn(p2.cut)), '2회차 글');
    for (const nm of ['Cammy', 'Chun-Li']) for (const k of cuts) U.push({ game: 'street_fighter_2', character: nm, cut: k });
    assert.equal(C.pickCosplay(U, Math.random), null, '모든 캐릭터 × 재단이 차면 그 게임도 빠진다(다른 게임도 다 차 있다)'); }
  /* 쓴 것 읽기 — 그림 저장소 records 아래 어디든: 그린 기록(generation.cosplay, 없으면 scene.cosplay 의 character 가 찬 것) + 아직 안 그린 계획의 예약.
     같은 컷(카드 · 세계 · 화풍 · 번호)에 기록이 있으면 계획은 안 센다 · 1회차 pick 빈 칸은 안 센다 · pkm 예약 · 장부 reserved 도 */
  { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-'));
    try {
      const put = (f, r) => { fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true }); fs.writeFileSync(path.join(d, f), JSON.stringify(r)); };
      put('조조/samguk-casual3.api25-ui.json', { card: '조조', world: 'samguk', slot: 'casual3', scene: { cosplay: { game: 'overwatch', character: '', cut: 'bikini', round: 1 } }, generation: { cosplay: { game: 'overwatch', character: 'D.Va', cut: 'bikini' } } });
      put('ab/cd/fire-casual4.json', { card: 'fire', slot: 'casual4', scene: { cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'corset', round: 1 } } });
      put('x/pkm-casual5.json', { card: 'x', slot: 'casual5', scene: { cosplay: { game: 'overwatch', character: '', cut: 'idol', round: 1 } } });
      const rows0 = C.cosplayUsage([d]), U0 = C.cosplayTally(rows0);
      assert(rows0.length === 2 && U0.games.overwatch.n === 1 && U0.games.overwatch.chars['d.va'].cuts.bikini === 1 && U0.games.tomb_raider.n === 1 && U0.cuts.corset === 1 && !U0.cuts.idol, '쓴 기록 읽기 ' + JSON.stringify(rows0));
      /* 계획 파일 — 칸 3 은 그렸다(기록이 센다), 칸 4 · 5 는 예약(5 는 pick 빈 칸 — 안 센다), 같은 칸 4 의 옛 계획(먼저 고친 것)은 한 번만 */
      put('조조/samguk-casual-plan.json', { card: '조조', world: 'samguk', style: 'api25', cuts: [{ n: 3, item: 'gc_bikini', cosplay: { game: 'overwatch', character: 'Mercy', cut: 'bikini', round: 1 } }, { n: 4, item: 'gc_idol', cosplay: { game: 'overwatch', character: 'Kiriko', cut: 'idol', round: 1 } }, { n: 5, item: 'gc_knit', cosplay: { game: 'overwatch', character: '', cut: 'knit', round: 1, used: [] } }] });
      put('조조/samguk-casual4-replan.json', { card: '조조', world: 'samguk', style: 'api25', cuts: [{ n: 4, item: 'gc_corset', cosplay: { game: 'overwatch', character: 'Sombra', cut: 'corset', round: 1 } }] });
      { const t = new Date(Date.now() - 60000); fs.utimesSync(path.join(d, '조조/samguk-casual-plan.json'), t, t); }
      put('조조/fantasy-casual-plan.json', { card: '조조', world: 'fantasy', style: 'api25', cuts: [{ n: 2, item: 'gc_bodysuit', cosplay: { game: 'final_fantasy_7', character: 'Tifa Lockhart', cut: 'bodysuit', round: 1 } }] });
      put('조조/fantasy-casual2.api25-ui.json', { card: '조조', world: 'fantasy', slot: 'casual2', scene: { ofam: 'everyday' }, generation: {} });   /* 그 칸은 코스프레 없이 그렸다 — 예약도 안 센다 */
      put('casual-reservations/s1.json', { session: 's1', characters: [{ species: 'pika-20261116', card: '피카', cuts: [{ cut: 3, cosplay: { game: 'overwatch', character: 'Widowmaker', cut: 'bodysuit', round: 1 } }] }] });
      put('casual-ledger.json', { entries: [{ species: 'evee-20261116', status: 'reserved', cuts: [{ cut: 2, cosplay: { game: 'overwatch', character: 'Pharah', cut: 'leotard' } }] }, { species: 'old-20261001', status: 'done', cuts: [{ cut: 1, cosplay: { game: 'overwatch', character: 'Sigma', cut: 'leotard' } }] }] });
      put('pika-20261116/casual9-ui.json', { storage: {} });
      const rows = C.cosplayUsage([d]), res = rows.filter(r => r.reserved).map(r => r.character).sort();
      assert.deepEqual(res, ['Pharah', 'Sombra', 'Widowmaker'], '예약 — 안 그린 계획 칸만 · 같은 칸은 가장 늦은 계획 하나 · pkm 예약 · 장부 reserved ' + JSON.stringify(rows));
      assert(!rows.some(r => r.character === 'Mercy' || r.character === 'Tifa Lockhart' || r.character === 'Sigma' || r.character === 'Kiriko'), '그린 칸의 계획 · 끝난 장부 · 바뀐 옛 계획은 안 센다');
      /* 예약된 캐릭터(계획 파일에만 있는)는 1회차에서 빠진다 — 오버워치만 열고 남은 셋까지 쓰게 한다 */
      { const ow = GCJ.games.find(g => g.key === 'overwatch'), keep = ['Sombra', 'Widowmaker', 'Pharah', 'D.Va', 'Ana'], U = [...busy(['overwatch']), ...rows, ...ow.characters.filter(ch => !keep.includes(ch.name)).map(ch => ({ game: 'overwatch', character: ch.name, cut: 'knit' }))], rnd = lcg(3), got = new Set();
        for (let i = 0; i < 200; i++) { const p = C.pickCosplay(U, rnd); assert(p.round === 1, '남은 캐릭터가 있으면 1회차'); got.add(p.character); }
        assert.deepEqual([...got], ['Ana'], '쓴 · 예약 캐릭터는 빠진다 — 남은 건 Ana 하나 ' + [...got].join(', ')); }
      assert.deepEqual(C.COSPLAY_REPOS, ['sam-atelier-img', 'sam-atelier-img-2', 'sam-atelier-img-3'], '이 공방 그림 저장소만(2026-11-16 「공방별로 따로」)');
      assert(C.cosplayReposOk({}) && C.cosplayReposOk({ 'cosplay-usage': 'none' }), '저장소가 있으면 통과');
    } finally { fs.rmSync(d, { recursive: true, force: true }); } }
  /* 세계 셋을 한 번에 — 한 번에 짠 세 장은 같은 게임 · 캐릭터를 쓰지 않는다(이번에 짠 것도 쓴 것으로 센다) */
  { const card = C.cardOf('여포'), U = [], got = [];
    for (const w of card.worlds) { card.world = w; const c = C.plan(card, SEVEN, [], { seed: 11, cosplayUsed: U }).cuts.find(x => x.cosplay); got.push(c.cosplay.game + '/' + c.cosplay.character); U.push({ game: c.cosplay.game, character: c.cosplay.character, cut: c.item.slice(3) }); }
    assert.equal(new Set(got).size, 3, '세계 셋의 코스프레가 다르다 ' + got.join(' · ')); }
  /* 옛 계획 다시 짜기(--recosplay) — 아직 안 그린 코스프레 칸의 cosplay(와 재단)만, 다른 칸 · 그린 칸은 그대로, 장소가 받는 재단만, 지시문은 assigned */
  { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'recos-')), card = C.cardOf('조조');
    try {
      card.world = 'fantasy'; const pl = C.plan(card, SEVEN, [], { seed: 4, cosplayUsed: [] }), cc = pl.cuts.find(c => c.cosplay);
      cc.cosplay = { game: 'overwatch', character: '', cut: cc.item.slice(3), round: 1, used: [], again: undefined }; delete cc.cosplay.again;   /* 옛 pick 칸으로 만든다 */
      const f = path.join(d, 'plan', 'plan.json'), recs = path.join(d, 'records'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.mkdirSync(recs);
      const doc = { card: '조조', world: 'fantasy', seed: 4, tree: 2, style: C.STYLE, required: pl.required.replace(/cosplay:[^ ]+/, 'cosplay:overwatch/' + cc.cosplay.cut), slots: SEVEN, fresh: false, cuts: pl.cuts };
      fs.writeFileSync(f, JSON.stringify(doc, null, 1));
      const before = JSON.parse(fs.readFileSync(f, 'utf8'));
      /* 그 칸을 그렸으면 그대로 */
      fs.writeFileSync(path.join(recs, `fantasy-casual${cc.n}.${C.STYLE}-ui.json`), '{}');
      assert.equal(C.recosplay(card, f, { used: [], seed: 9, recDir: [recs] }).changed.length, 0, '그린 칸은 다시 짜지 않는다');
      assert.deepEqual(JSON.parse(fs.readFileSync(f, 'utf8')), before, '바뀐 것 없으면 계획 파일 그대로');
      fs.rmSync(path.join(recs, `fantasy-casual${cc.n}.${C.STYLE}-ui.json`));
      const used = [{ game: 'overwatch', character: 'Tracer', cut: 'bikini' }, { reserved: true, card: '조조', world: 'fantasy', style: C.STYLE, n: cc.n, game: 'overwatch', character: 'Mercy', cut: 'knit' }];
      const r = C.recosplay(card, f, { used, seed: 9, recDir: [recs] }), after = JSON.parse(fs.readFileSync(f, 'utf8'));
      assert.equal(r.changed.length, 1, '안 그린 코스프레 칸 하나');
      const nc = after.cuts.find(c => c.n === cc.n), gm = GCJ.games.find(g => g.key === nc.cosplay.game);
      assert(nc.cosplay.character && nc.cosplay.character !== 'Tracer' && !nc.cosplay.used && nc.item === 'gc_' + nc.cosplay.cut && C.cosCutOk(nc.cosplay.cut, nc.place), '새 규칙의 칸 ' + JSON.stringify(nc.cosplay));
      for (const c of after.cuts) if (c.n !== cc.n) assert.deepEqual(c, before.cuts.find(x => x.n === c.n), '다른 칸은 그대로 ' + c.n);
      assert.deepEqual({ ...nc, cosplay: 0, item: 0 }, { ...before.cuts.find(x => x.n === cc.n), cosplay: 0, item: 0 }, '그 칸도 장소 · 자세 · 구도는 그대로');
      assert(after.recosplay && after.recosplay[0].cuts[0].from.character === '' && new RegExp('cosplay:' + nc.cosplay.game + '/' + nc.cosplay.cut).test(after.required), '계획 파일에 전 · 후');
      assert.deepEqual(C.check(after.cuts, card, []), [], '다시 짠 묶음도 묶음 규칙');
      const pr = fs.readFileSync(path.join(d, 'plan', `fantasy-casual${cc.n}-prompt.txt`), 'utf8'), ol = (pr.match(/^Outfit: .*$/m) || [''])[0];
      const want = gm.many ? GCJ.text.assigned.replace('{character}', nc.cosplay.character).replace('{game}', gm.en) : GCJ.text.fixed.replace('{character}', gm.character).replace('{game}', gm.en).replace('{outfit}', gm.outfit);
      assert(ol.startsWith('Outfit: ' + want.replace(/\{cut\}.*$/, '')) && !/Outfit: …/.test(pr), '다시 쓴 지시문 ' + ol.slice(0, 120));
      /* 물가 장소면 수영복 재단만 */
      const wp = C.cosplayPaths('bikini').find(x => COSP.swim_places.includes(x.place)), T2 = C2T.make(JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree-v2.json'), 'utf8')), TREE1);
      const { n: _wn, cosplay: _wc, ...wbase } = nc, ws = C2T.repair(T2, { ...wbase, era: wp.era, place: wp.place, item: 'gc_bikini' }, card.g, l => l[0]);
      assert(ws.place === wp.place && ws.item === 'gc_bikini', '물가 장면 ' + ws.place + ' ' + ws.item);
      const wet = { ...after, cuts: after.cuts.map(c => c.n === cc.n ? { ...ws, n: c.n, cosplay: { game: 'overwatch', character: '', cut: 'bikini', round: 1, used: [] } } : c) };
      const wf = path.join(d, 'wet.json'); fs.writeFileSync(wf, JSON.stringify(wet));
      for (const s2 of [1, 2, 3, 4, 5]) { const w = C.recosplay(card, wf, { used: [], seed: s2, recDir: [recs], write: false }); assert(['bikini', 'one_piece'].includes(w.changed[0].to.cut), '물가면 수영복 재단 ' + w.changed[0].to.cut); }
    } finally { fs.rmSync(d, { recursive: true, force: true }); } }
}
/* 구체 색(shade — 2026-11-16 사용자 「응 그렇게 진행해줘」) — 묶음 안 shade 하나: 덜 쓴 것 먼저(쓴 수 = 그린 기록 + 예약), 머리색 갈래 피함, 한 묶음 안 겹침 없음.
   지시문엔 그 shade 글 하나. shade 없는 옛 장면은 조립부가 hash(카드|세계|번호)로 정한다(같은 입력 같은 색). 색 고정 옷 · 코스프레엔 없음. 옛 계획 · 기록 통과 */
{
  const G = TS.CASUAL.colors, all = G.flatMap(g => g.shades), hueOf = k => all.find(x => x.key === k).hue;
  /* 표 — 묶음 여덟 · 열쇠 겹침 없음 · hue 는 정한 갈래 · 글엔 「such as」 없음 */
  assert.equal(G.length, 8); assert.equal(new Set(all.map(x => x.key)).size, all.length, 'shade 열쇠 겹침 없음');
  for (const x of all) assert(TS.CASUAL.hues.includes(x.hue) && x.en && x.ko && !/such as|\bor\b/.test(x.en), 'shade ' + x.key);
  /* 머리색 → hue(정규식, 위에서부터) */
  assert.equal(P.hueOf('cherry-blossom pink hair'), 'pink'); assert.equal(P.hueOf('black hair fading to crimson at the tips'), 'red'); assert.equal(P.hueOf('silver-white hair'), 'white'); assert.equal(P.hueOf('ink-black hair with a deep green sheen'), 'green'); assert.equal(P.hueOf('mystery hair'), '');
  /* 분포 — 빈 기록에서 1000번: 묶음 여섯 shade 가 고르게(각 1/6 ± 0.06) */
  const mk = () => [{ n: 1, color: 'pastel' }];
  { let x = 7; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, cnt = {};
    for (let i = 0; i < 1000; i++) { const [c] = C.shadeize(mk(), [], '', {}, rnd); cnt[c.shade] = (cnt[c.shade] || 0) + 1; }
    for (const sx of G.find(g => g.key === 'pastel').shades) assert(Math.abs((cnt[sx.key] || 0) / 1000 - 1 / 6) < 0.06, '고르게 ' + sx.key + ' ' + cnt[sx.key]);
    /* 앞서 많이 쓴 shade 는 덜 — 파우더 핑크를 3 번 쓴 기록이면 다른 다섯이 먼저(1000번 중 0) */
    const c2 = {}; for (let i = 0; i < 1000; i++) { const [c] = C.shadeize(mk(), [], '', { powder_pink: 3, baby_blue: 1 }, rnd); c2[c.shade] = (c2[c.shade] || 0) + 1; }
    assert(!c2.powder_pink && !c2.baby_blue && Object.keys(c2).length === 4, '덜 쓴 shade 먼저 ' + JSON.stringify(c2));
    /* 머리색 갈래 피함 — 분홍 머리면 분홍(파우더 핑크)이 안 나온다, 다 피하면(데님은 모두 blue) 피하지 않는다 */
    const c3 = {}; for (let i = 0; i < 1000; i++) { const [c] = C.shadeize(mk(), [], 'pink', {}, rnd); c3[c.shade] = (c3[c.shade] || 0) + 1; }
    assert(!c3.powder_pink && Object.keys(c3).length === 5, '분홍 머리에 분홍 옷 없음 ' + JSON.stringify(c3));
    const [dn0] = C.shadeize([{ n: 1, color: 'denim' }], [], 'blue', {}, rnd); assert(dn0.shade, '다 피하면 피하지 않는다');
    /* 한 묶음 안 같은 shade 두 번 금지 · 같은 hue 되도록 피함 — 옛 컷(old)의 shade 도 */
    const many = C.shadeize([{ n: 2, color: 'earth' }, { n: 3, color: 'earth' }, { n: 4, color: 'earth' }], [{ n: 1, color: 'neutral', shade: 'oatmeal' }], '', {}, rnd);
    assert.equal(new Set(many.map(c => c.shade)).size, 3); assert(new Set(many.map(c => hueOf(c.shade))).size === 3 && !many.some(c => hueOf(c.shade) === 'brown'), '같은 hue 되도록 피함(옛 컷 오트밀 brown 까지) ' + many.map(c => c.shade));
    assert(C.check([{ n: 1, color: 'pastel', shade: 'cherry' }], C.cardOf('조조'), []).some(e => /색 묶음 pastel 안 것이 아니다/.test(e)), '묶음 밖 shade 를 잡는다');
  }
  /* 분홍 머리 장수(하후연 — cherry_pink, 기본 화풍 그림이 있어 머리색이 안 바뀐다 · 2026-11-18 머리색 다시 나누기 전엔 엄안) 계획 — 세계 셋 × 씨앗 넷에서 분홍 shade 가 안 나온다 */
  { const cd = C.cardOf('하후연'), seen = new Set(); assert.equal(P.hairHue(D, '하후연', 'samguk'), 'pink');
    for (const w of cd.worlds) for (const seed of [1, 2, 3, 4]) { cd.world = w; for (const c of C.plan(cd, SEVEN, [], { seed }).cuts) if (c.shade) { seen.add(c.shade); assert.notEqual(hueOf(c.shade), 'pink', '하후연 ' + w + ' ' + c.shade); } }
    assert(seen.size >= 8, '하후연 shade 여러 가지 ' + [...seen]); }
  /* 빈 기록에서 장수 스물넷의 묶음을 이어 짜면(쓴 수를 이어 센다) 덜 쓴 것 먼저라 묶음 안 shade 가 고르게 — 머리색 · 묶음 안 hue 피하기로 조금 벌어진다 */
  { const used = {}, out = []; let k = 0;
    for (const key of keys.slice(0, 24)) { const cd = C.cardOf(key); cd.world = cd.worlds[k++ % cd.worlds.length];
      const r = C.plan(cd, SEVEN, [], { seed: 11, shadeUsed: used });
      for (const c of r.cuts) { if (c.shade) used[c.shade] = (used[c.shade] || 0) + 1; if (c.shade && /swim|bikini/.test(c.ofam + ' ' + c.item) && out.length < 30) out.push(c.shade); } }
    for (const g of G) { const v = g.shades.map(x => used[x.key] || 0); assert(Math.max(...v) - Math.min(...v) <= 3, '쓴 수가 묶음 안에서 고르게(덜 쓴 것 먼저) ' + g.key + ' ' + JSON.stringify(v)); }
    globalThis.__swim = out; }
  /* 옛 장면(색 묶음만, shade 없음) — 조립부가 결정적으로: 같은 입력 같은 색, 머리색 갈래 피함, 기록 장면에 적힌다. 색 묶음도 없으면 그대로(색 줄 없음) */
  { const cd = C.cardOf('엄안'); cd.world = 'samguk'; const base = C.plan(cd, SEVEN, [], { seed: 3 }).cuts.find(c => c.color && !c.ofree);
    const { shade: _s, ...oldSc } = base, r1 = C.record(cd, 'samguk', oldSc), r2 = C.record(cd, 'samguk', oldSc), ol = r1.prompt.match(/^Outfit: .*$/m)[0];
    assert.equal(r1.prompt, r2.prompt, '옛 장면 — 같은 입력 같은 지시문'); const sh = P.shadesOf(base.color).find(x => x.key === r1.scene.shade);
    assert(sh && ol.includes(' — in ' + sh.en + ';') && !/such as/.test(ol) && sh.hue !== 'pink', '옛 장면 — 결정 shade ' + r1.scene.shade + ' · ' + ol.slice(0, 120));
    assert.equal(P.shadeAuto(base.color, P.shadeSeed('엄안', 'samguk', base.n), 'pink').key, r1.scene.shade, 'hash(카드|세계|번호)');
    const ns = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(n => C.record(cd, 'samguk', { ...oldSc, n }).scene.shade)); assert(ns.size >= 2, '번호마다 갈린다');
    const { color: _c, ...noColor } = oldSc, r3 = C.record(cd, 'samguk', noColor); assert(!r3.scene.shade && !/the outfit colour reads clearly/.test(r3.prompt), '색 묶음도 없으면 색 줄 없음');
    /* 다른 묶음의 shade(생성기에서 묶음을 바꾼 장면)는 무시하고 결정 규칙 */
    const r4 = C.record(cd, 'samguk', { ...oldSc, shade: 'cherry' }); assert(base.color === 'vivid' || r4.scene.shade !== 'cherry', '묶음 밖 shade 무시');
    /* 색 고정 옷 · 코스프레엔 shade 없음 */
    const cos = C.plan(cd, SEVEN, [], { seed: 3 }).cuts.find(c => C.requiredType(c) === 'cosplay'), rc = C.record(cd, 'samguk', { ...cos, color: 'pastel', shade: 'mint' });
    assert(!rc.scene.shade && !/soft pastel mint/.test(rc.prompt), '코스프레 컷엔 shade 없음'); }
  /* 쓴 수 읽기(shadeUsage) — 그린 기록의 scene.shade + 아직 안 그린 계획(같은 컷에 기록이 있으면 계획은 안 센다) */
  { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'shade-'));
    try {
      fs.mkdirSync(path.join(d, '조조'));
      fs.writeFileSync(path.join(d, '조조', 'samguk-casual1.' + C.STYLE + '-ui.json'), JSON.stringify({ card: '조조', world: 'samguk', scene: { color: 'pastel', shade: 'mint' } }));
      fs.writeFileSync(path.join(d, '조조', 'samguk-casual2.' + C.STYLE + '-ui.json'), JSON.stringify({ card: '조조', world: 'samguk', scene: { color: 'pastel' } }));   /* 옛 기록(shade 없음) — 안 센다 */
      fs.writeFileSync(path.join(d, '조조', 'samguk-casual-plan.json'), JSON.stringify({ card: '조조', world: 'samguk', style: C.STYLE, cuts: [{ n: 1, color: 'vivid', shade: 'cherry' }, { n: 3, color: 'earth', shade: 'mint' }, { n: 4, color: 'jewel', shade: 'teal' }] }));
      assert.deepEqual(C.shadeUsage([d]), { mint: 2, teal: 1 }, '그린 기록 + 예약(그린 컷 1 의 계획은 안 센다) ' + JSON.stringify(C.shadeUsage([d])));
    } finally { fs.rmSync(d, { recursive: true, force: true }); } }
}
console.log(`PASS 구체 색(shade): 표 · 머리색 갈래 읽기 · 고르게(1000번) · 덜 쓴 것 먼저 · 분홍 머리에 분홍 없음 · 묶음 안 겹침 없음 · 이어 짠 묶음 고르게 · 옛 장면 결정적 · 색 고정 · 코스프레 없음 · 쓴 수 읽기 — 수영복 표본 ${(globalThis.__swim || []).join(' ')}`);
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(장수 ${pickKeys.length} × 세계 셋 × 씨앗 하나)이 일곱 장 · 묶음 규칙 · 정해 둔 세 갈래 + 자유 설계 둘(옷 자유 · 갈래 자유 — 덩어리 · 최근 장면 · 갈래 겹침 없이 · 상황 열기, 옛 여섯 장 그대로 · 일곱째 하나만)(노출 · 세계 안 · 게임 코스프레 — 게임 · 재단 · 장소 · 코스튬 줄, 상황은 일반 컷에 가끔, 새 계열 모험가 · 신화 드레이프) · 게임 코스프레 고르기(덜 쓴 게임 · 안 입은 재단 · 다 찬 게임 빠짐 · 1회차 assigned(여자 무게 2) · 2회차 again · 옛 pick 칸 그대로 · 세 공방 기록 + 예약 읽기 · --recosplay) · 옛 묶음(상황 필수 시절) 그대로 · 네 시대 · 기록 꼴, 있는 두 장 위에 세 장 · 카드 사이 안 쓴 장소 · 자세 추천 · 표정 먼저 · 세계 셋 한 번에 새 묶음(세계 · 옛 묶음 사이 같은 장면 없음) · 무기는 장신구로(부채 · 두루마리는 손에) · 시대 몫(지금 현실 둘) · 세계 안 갈래 장소 일곱 · 표정 후보(어색한 것 빼고 고르게, 문구 단서 두셋)`);
