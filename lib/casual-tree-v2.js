/* 일상컷 트리 버전2 — data/casual-tree-v2.json 을 읽어 칸마다 고를 수 있는 것을 거른다(2026-10-30, docs/CASUAL_TREE_V2.md).
   시대 → 장소 → 의상 계열 → 옷 → 몸 자세 → 받침 → 프레이밍 → 몸 방향 · 머리 방향 · 카메라 높이 → 오른손 → 왼손 → 소품 동작 → 다리 → 시선.
   시대 · 장소 · 의상 · 옷은 버전1 표(data/casual-tree.json)를 그대로 읽는다 — 하는 일과 장소의 받는 의상은 쓰지 않는다(의상은 시대만 거르고, 어색한 조합은 ⚠ 표시).
   몸 쪽은 장소의 받침(has) · 프레이밍이 보여 주는 부위 · 자세 계열 · 옷의 특징(주머니 · 끈 · 옷깃)이 거른다. 손 칸 둘은 늘 같이 본다 —
   두 손 자세 · 두 손 소품 동작은 다른 손 칸을 잠그고, 같은 데를 두 손이 쓰지 않는다. 오른손 · 왼손은 인물 본인 기준.
   앞 칸을 바꾸면 맞지 않게 된 뒤 칸은 고친다(repair) — 꼭 있어야 하는 칸은 남은 것 중 하나로, 골라도 되는 칸(옷 · 다리 · 시선)은 비운다.
   프레이밍을 넓혀 맞추지 않는다(문서 2절 약속 1): 손 · 다리가 안 보이는 컷이면 손 · 다리 칸을 고치지 프레이밍을 고치지 않는다.
   자세 추천은 칸만 채운다(지시문 문장 없음). 검사기 tools/casual-tree-v2.py 와 같은 규칙이다 — 하나를 고치면 다른 쪽도.
   2026-11-13: 시선은 장소 특징(창 · 하늘)을 본다 · 뒤쪽 몸 방향의 소품은 옆에 내려 드는 것만 · 자세가 받는 손(posture.hands) · 한쪽 손만 되는 손(hand.sides) · 받침의 손별 목록(hands_left · hands_right) ·
   카메라의 자세 계열(camera.families) · 옆모습의 가까운 팔(sideLook) · 덧붙는 표(aux) · 계획기의 빛 고르기(ambience). docs 의 일상컷 검토(원소 docs/casual-review-2026-11-13.md) 6절.
   lib/casual-tree.js(버전1) 뒤에 읽는다(출시 연도 · 아주 예전 기록 변환을 빌린다). 브라우저와 node 둘 다에서 돈다. */
(function (root) {
  'use strict';
  /* weather — 계절 · 날씨(고르지 않으면 AUTO, 사용자 2026-10-30) */
  var ORDER = ['era', 'place', 'weather', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze'];
  /* 손 칸은 비워도 된다(AUTO — 그 손 줄을 싣지 않는다, 사용자 2026-10-30). 「자연스럽게」 는 손 표의 natural */
  var REQUIRED = ['era', 'place', 'ofam', 'posture', 'support', 'frame', 'body', 'head', 'camera'];
  var BODY = ['posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'legs', 'gaze'];
  var HANDS_OF = { hold: 'one', raise: 'one', both: 'both' };
  var BODY_FIX = BODY.filter(function (k) { return k !== 'right' && k !== 'left'; });   /* presetOk 가 바로 「안 된다」 할 수 있는 몸 칸(손 둘은 두 손 자세가 뒤에서 맞춰 줄 수 있다) */
  var V1_ONLY = ['act', 'pose', 'orient', 'lens', 'camera', 'preset', 'cat', 'ex', 'catCustom', 'exCustom'];

  function by(list, key) { for (var i = 0; i < (list || []).length; i++) if (list[i].key === key) return list[i]; return null; }
  function has(arr, x) { return (arr || []).indexOf(x) >= 0; }
  /* 두 표를 한 번에 — t = make(버전2 표, 버전1 표) */
  function make(v2, v1) { return { v2: v2, v1: v1 }; }

  var MEMO = typeof WeakMap === 'function' ? new WeakMap() : null;
  function memo(t, kind, key, fn) {
    if (!MEMO) return fn();
    var m = MEMO.get(t.v2); if (!m) { m = {}; MEMO.set(t.v2, m); }
    var box = m[kind] || (m[kind] = {});
    return Object.prototype.hasOwnProperty.call(box, key) ? box[key] : (box[key] = fn());
  }

  function era(t, k) { return by(t.v1.eras, k); }
  /* 장소 — 버전1 표의 장소 + 버전2 표의 새 장소(extra_places — 버전1 은 그대로 둔다) */
  function allPlaces(t) { return memo(t, 'allPlaces', '', function () { return t.v1.places.concat(t.v2.extra_places || []); }); }
  function place(t, k) { return memo(t, 'place', k, function () { return by(allPlaces(t), k); }); }
  function family(t, k) { return by(t.v1.outfits, k); }
  function item(t, fam, k) { var f = family(t, fam); return f ? by(f.items, k) : null; }
  function posture(t, k) { return by(t.v2.postures, k); }
  function support(t, k) { return by(t.v2.supports, k); }
  function hand(t, k) { return by(t.v2.hands, k); }
  function leg(t, k) { return by(t.v2.legs, k); }
  function prop(t, k) { return by(t.v2.props, k); }
  function use(t, k) { return by(t.v2.prop_uses, k); }
  function preset(t, k) { return by(t.v2.presets, k); }
  function frame(t, k) { return k && k !== 'note' ? t.v2.frames[k] || null : null; }
  function lens(t, k) { return (t.v2.lens || {})[k] || ''; }
  function frameRule(t, k) { return (t.v1.frame_rules || {})[k] || {}; }
  function placeHas(t, k) { return t.v2.places[k] || []; }
  /* 공방마다 다른 규칙은 표의 칸으로(pkm 2026-10-30) — 표에 칸이 없으면 아무것도 안 거른다.
     banned: 안 쓰는 몸 방향 · 프레이밍(버전1 banned.frames 도) · companion: 동료 묶음(버전1 묶음의 companion)에서만 쓰는 손 · 소품 동작, 동료 묶음에서 안 쓰는 프레이밍(not_frames) */
  function bannedV2(t, kind) { return ((t.v2.banned || {})[kind] || []).concat(kind === 'frames' ? (t.v1.banned || {}).frames || [] : []); }
  function companionAt(t, placeKey) { var C = root.AtelierCasualTree; return !!(C && C.companion && C.companion(t.v1, placeKey)); }
  /* 동물이 배경에 나오는 장소(2026-11-23) — 버전2 표의 새 장소(extra_places)도 보고, 묶음은 버전1 표에서 */
  function animalsAt(t, placeKey) { var C = root.AtelierCasualTree, p = place(t, placeKey), g = p && C && C.group ? C.group(t.v1, p.group) : null; return !!(p && (p.animals || (g && g.animals))); }
  function isRequired(t, scene) { var C = root.AtelierCasualTree; return !!(C && C.isRequired && C.isRequired(t.v1, scene)); }
  /* 코스튬 필수 컷에 안 쓰는 프레이밍 — 버전1 표의 costume_required.not_frames(버전1 모듈 costumeNo) */
  function costumeNo(t, scene, frame) { var C = root.AtelierCasualTree; return !!(C && C.costumeNo && C.costumeNo(t.v1, scene, frame)); }

  /* needs 는 다, needs_any 는 하나 이상 — 장소의 받침으로 */
  function placeOk(row, hs) {
    var n = row.needs || [], a = row.needs_any || [];
    for (var i = 0; i < n.length; i++) if (!has(hs, n[i])) return false;
    return !a.length || a.some(function (x) { return has(hs, x); });
  }
  /* 장소 목록 — * 는 모든 장소, @묶음 은 그 묶음의 모든 장소, !장소 는 뺀다 */
  function expand(t, refs) {
    var out = [], drop = [];
    (refs || []).forEach(function (k) {
      if (k === '*') allPlaces(t).forEach(function (p) { out.push(p.key); });
      else if (k.charAt(0) === '@') allPlaces(t).forEach(function (p) { if (p.group === k.slice(1)) out.push(p.key); });
      else if (k.charAt(0) === '!') drop.push(k.slice(1));
      else out.push(k);
    });
    return out.filter(function (k, i) { return out.indexOf(k) === i && drop.indexOf(k) < 0; });
  }
  /* 그 장소 · 시대에 나오는 소품인가(휴대폰은 지금 현실만) */
  /* since — 출시 당시 시대면 그 해부터 있는 소품만(휴대용 게임기 1989) */
  function propAt(t, p, placeKey, eraKey, game) {
    if (!p || (p.eras && eraKey && !has(p.eras, eraKey))) return false;
    var y = eraKey === 'release' && p.since ? year(t, game) : null;
    if (y && p.since > y) return false;
    return has(memo(t, 'propPlaces', p.key, function () { return expand(t, p.places); }), placeKey);
  }
  /* 가까운 컷(버전1 frame_rules.no_orients 에 등 쪽) — 뒤쪽 몸 방향(far)을 받지 않는다 */
  function farBanned(t, f) { return has(frameRule(t, f).no_orients, 'back'); }
  /* 옷의 특징 — 계열 기본값 + 옷마다 더하기 · 빼기. 옷을 안 골랐으면 계열 기본값 */
  function features(t, ofam, itemKey) {
    var F = t.v2.outfit_features || {}, out = ((F.defaults || {})[ofam] || []).slice();
    if (itemKey) {
      ((F.add || {})[itemKey] || []).forEach(function (x) { if (!has(out, x)) out.push(x); });
      out = out.filter(function (x) { return !has((F.remove || {})[itemKey], x); });
    }
    return out;
  }
  /* 장면의 옷 특징 — 「옷 직접 쓰기」 글이 있으면 고른 옷의 특징은 쓰지 않는다(글이 옷을 바꾼다, 검토 2026-10-30:
     청바지 + 「주머니 없는 드레스」 글 + 주머니에 손). 그때는 사람이 표시한 특징(ofeat)만 */
  /* glasses — 옷이 아니라 장면의 「안경」 표시(ofeat). 안경을 쓴 장면에서만 「안경 고쳐 쓰기」 */
  var FEATURES = ['pocket', 'strap', 'collar', 'glasses', 'cleavage', 'sportswear', 'swimsuit', 'underlayer'];   /* cleavage · sportswear · swimsuit · underlayer(2026-11-25) — 가슴 사이 물건 · 요가 · 조깅 · 헤엄 · 공기매트 · 무기 · 갑옷 손질(삼국지) */
  function sceneFeatures(t, scene) {
    if (String(scene.outfit || '').trim()) return (scene.ofeat || []).filter(function (x) { return has(FEATURES, x); });
    return features(t, scene.ofam, scene.item).concat(has(scene.ofeat, 'glasses') ? ['glasses'] : []);
  }
  /* 알아볼 거리를 손에 들 수 있나 — 설계표 signature_hold(들 수 있는 것의 번호). 장소 · 풍경은 배경에 남는다(검토 2026-10-30:
     데이브 더 다이브 「블루 홀의 깊고 푸른 바다」 를 가슴 높이에 들었다). 고른 알아볼 거리가 장소면 소품으로 쓰지 않는다. 게임 없이(검사기 견주기) 부르면 된다고 본다 */
  function signatureHold(game, scene) {
    if (!game) return true;
    if (scene && scene.ownProp) return true;   /* 캐릭터만의 컷 — 그 직업의 도구를 「그 물건」 자리로 든다(2026-11-13) */
    var hold = game.signature_hold || [], pr = String(scene.prop || '');
    if (!hold.length || pr === 'none') return false;
    return !/^\d+$/.test(pr) || has(hold, Number(pr));
  }
  /* 계절 · 날씨와 옷의 어색한 조합(⚠) — 거르지 않고 표시만 */
  function weatherAwkward(t, weather, ofam, itemKey) {
    if (!weather) return [];
    return (t.v2.weather_awkward || []).filter(function (r) { return has(r.weather, weather) && (has(r.outfits, ofam) || (itemKey && has(r.items, itemKey))); });
  }
  /* 어색한 조합(⚠) — 거르지 않고 표시만. 맞는 줄들 */
  function awkward(t, ofam, placeKey) {
    return (t.v2.awkward || []).filter(function (r, i) { return has(r.outfits, ofam) && has(memo(t, 'awkPlaces', i, function () { return expand(t, r.places); }), placeKey); });   /* 줄마다 장소 펼치기는 한 번(속도) */
  }
  function year(t, game) { var C = root.AtelierCasualTree; return C && C.year ? C.year(t.v1, game) : null; }
  function propSides(scene) { return (scene.right === 'prop' ? 1 : 0) + (scene.left === 'prop' ? 1 : 0); }
  function other(side) { return side === 'right' ? 'left' : 'right'; }

  /* 소품 동작이 지금 장면에 맞나 — n 은 소품을 쓰는 손 수(없으면 장면에서 센다) */
  function useFits(t, scene, u, n, game) {
    var f = frame(t, scene.frame), p = prop(t, u && u.prop);
    n = n == null ? propSides(scene) : n;
    if (!u || !f || !p || !n) return false;
    /* 뒤쪽 몸 방향(far)에선 옆에 내려 드는 동작(hips)만 — 가슴 · 얼굴 높이는 등 뒤라 안 보여 팔이 하나 더 나왔다(원소 f 메카 일상3 「three arms」, 2026-11-13) */
    var bdU = by(t.v2.body, scene.body);
    if (bdU && bdU.far && u.zone !== 'hips') return false;
    if (HANDS_OF[u.kind] !== u.hands || u.hands !== (n === 2 ? 'both' : 'one')) return false;
    if (scene.kind && u.kind !== scene.kind) return false;
    if (!has(u.frames, scene.frame) || !has(u.postures, scene.posture) || !has(f.zones, u.zone)) return false;
    if (scene.gaze && u.gaze && u.gaze !== scene.gaze) return false;
    if (scene.gaze === 'into_prop' && u.gaze !== 'into_prop') return false;
    /* 입 주변처럼 같은 공간을 손 자세와 같이 쓰지 않는다(입술에 검지 + 잔을 입에) */
    if (u.space && ['right', 'left'].some(function (s) { var h = scene[s] !== 'prop' && hand(t, scene[s]); return h && h.space === u.space; })) return false;
    if (p.signature && !signatureHold(game, scene)) return false;
    /* 옷 특징이 있어야 하는 동작(2026-11-25 — 가슴 사이에 물건 끼우기는 목선이 열린 옷 cleavage, 공기매트는 수영복 swimsuit) · 그 장소 특징이면 안 되는 동작(not_has — 놀이터 k_kids).
       표에 칸이 없으면 안 거른다 */
    if (u.outfit && !has(sceneFeatures(t, scene), u.outfit)) return false;
    if (u.not_has && u.not_has.some(function (x) { return has(placeHas(t, scene.place), x); })) return false;
    if (u.companion && !companionAt(t, scene.place)) return false;
    /* 동작에도 장소가 붙을 수 있다 — 역할이 있는 동작(pkm 직업 현장)은 그 현장에서만. 소품이 여러 곳에 나와도 */
    if (u.places && !has(memo(t, 'usePlaces', u.key, function () { return expand(t, u.places); }), scene.place)) return false;
    /* 동작의 받침 — 탁자 위 책장 넘기기 · 작업대에서 반죽(needs_any) */
    if (!placeOk(u, placeHas(t, scene.place))) return false;
    return propAt(t, p, scene.place, scene.era, game);
  }
  function uses(t, scene, n, game) { return t.v2.prop_uses.filter(function (u) { return useFits(t, scene, u, n, game); }); }
  function anyUse(t, scene, n, game) { return t.v2.prop_uses.some(function (u) { return useFits(t, scene, u, n, game); }); }   /* 하나라도 맞나(속도) */

  /* 왜 못 고르나 — 고를 수 있으면 null. { code, ... } — 말은 부르는 쪽 낱말 표가 쥔다(이 모듈엔 말이 없다).
     code: unknown(없는 열쇠) · era(그 시대에 없다) · year(그 해엔 없던 곳) · place(장소에 받침이 없다 — needs) · posture(그 자세가 안 받는다) ·
           banned(이 공방은 안 쓴다) · close(가까운 컷에서 안 보이는 옷 · 「화면 밖」 은 가까운 컷만) · far(가까운 컷에 뒤쪽 몸 방향) ·
           zone(그 프레이밍에서 안 보이는 손 자리) · outfit(옷에 주머니 · 끈 · 옷깃이 없다) · both(다른 손과 함께 하는 자세 · 동작) ·
           same(두 손이 같은 데) · chin(두 손이 다 턱) · noprop(맞는 소품 동작이 없다) · nohand(소품을 쓰는 손이 없다) · fit(그 장면엔 안 맞는 소품 동작) ·
           legs(다리가 안 보이는 컷) · feet(발 동작은 전신 · 환경만) · family(자세 계열 밖) · use(소품 동작이 시선을 정한다) ·
           body(그 몸 방향과 같이 못 고르는 머리) · support(받침이 그 손을 막는다 — 두 팔뚝이 몸을 받친다) · back(등이 카메라 쪽인데 고개를 안 돌리고 카메라를 본다) ·
           lookback(뒷모습으로 돌아보는 컷엔 얼굴 · 머리에 대는 손을 안 쓴다) ·
           raised(표 raise_one 이 있으면 — 그 프레이밍엔 두 손을 다 올리지 않는다, 떠다니는 손 · 팔 없는 몸통) ·
           required(필수 갈래 의상엔 안 쓰는 프레이밍 — 버전1 frame_rules 의 not_required) · costume(코스튬 필수 컷엔 안 쓰는 프레이밍 — 버전1 costume_required 의 not_frames) · companion(동료 묶음에서만 · 동료 묶음에선 안 쓰는 프레이밍) */
  function why(t, scene, key, value, game) {
    var f = frame(t, scene.frame), po = posture(t, scene.posture), hs = placeHas(t, scene.place), r;
    switch (key) {
      case 'era': return era(t, value) ? null : { code: 'unknown' };
      case 'place': {
        r = place(t, value);
        if (!r || !t.v2.places[value]) return { code: 'unknown' };
        if (!has(r.eras, scene.era)) return { code: 'era', eras: r.eras.slice() };
        /* 그 세계에만 있는 자리(worlds_only — 조종석은 메카, 비행선은 스팀펑크) · 그 땅의 현장(표 place_lands — 원소: 나라의 갈래가 땅을 정한다). 카드(game.world · game.land)를 모르면 안 거른다 */
        if (r.worlds_only && game && game.world && !has(r.worlds_only, game.world)) return { code: 'era', eras: r.eras.slice() };
        var lands = (t.v2.place_lands || {})[value];
        if (lands && game && game.land && !has(lands, game.land)) return { code: 'era', eras: r.eras.slice() };
        var y = scene.era === 'release' ? year(t, game) : null;
        return y && r.since && r.since > y ? { code: 'year', since: r.since, year: y } : null;
      }
      case 'weather': return by(t.v2.weather, value) ? null : { code: 'unknown' };
      case 'ofam': {
        var e = era(t, scene.era);
        if (!family(t, value)) return { code: 'unknown' };
        if (e && !has(e.outfits, value)) return { code: 'era' };
        /* 의상 계열이 설 수 있는 장소 종류(표 outfit_rules — 수영복은 물가 · 무대, 속옷 · 실내복은 사적인 실내 …, 2026-11-13 「갱도에서 수영복을 입고 누워있는 다거나」). 느슨한 조건만 */
        var orule = (t.v2.outfit_rules || {})[value];
        if (orule && scene.place && t.v2.places[scene.place]) {
          if (!placeOk(orule, hs)) return { code: 'place', needs: (orule.needs || []).concat(orule.needs_any || []) };
          if (orule.not_has && orule.not_has.some(function (x) { return has(hs, x); })) return { code: 'place', needs: [] };
        }
        return null;
      }
      case 'item': {
        r = item(t, scene.ofam, value);
        if (!r) return { code: 'unknown' };
        return r.low && frameRule(t, scene.frame).low === false ? { code: 'close' } : null;
      }
      case 'posture': {
        r = posture(t, value);
        if (!r) return { code: 'unknown' };
        if (!placeOk(r, hs)) return { code: 'place', needs: (r.needs || []).concat(r.needs_any || []) };
        /* 옷 특징이 있어야 하는 자세(2026-11-25 — 헤엄 · 공기매트는 수영복 swimsuit, 요가 · 조깅은 운동복 sportswear). 손 칸을 비워도(AUTO) 걸리게 자세에서 본다 */
        return r.outfit && !has(sceneFeatures(t, scene), r.outfit) ? { code: 'outfit', feature: r.outfit } : null;
      }
      case 'support': {
        r = support(t, value);
        if (!r) return { code: 'unknown' };
        if (po && !has(po.supports, value)) return { code: 'posture' };
        return placeOk(r, hs) ? null : { code: 'place', needs: (r.needs || []).concat(r.needs_any || []) };
      }
      case 'frame': {
        if (!frame(t, value)) return { code: 'unknown' };
        if (has(bannedV2(t, 'frames'), value)) return { code: 'banned' };
        if (frameRule(t, value).not_required && isRequired(t, scene)) return { code: 'required' };
        if (costumeNo(t, scene, value)) return { code: 'costume' };
        if (companionAt(t, scene.place) && has((t.v2.companion || {}).not_frames, value)) return { code: 'companion' };
        return po && !has(po.frames, value) ? { code: 'posture' } : null;
      }
      case 'body': {
        r = by(t.v2.body, value);
        if (!r) return { code: 'unknown' };
        if (has(bannedV2(t, 'body'), value)) return { code: 'banned' };
        return r.far && farBanned(t, scene.frame) ? { code: 'far' } : null;
      }
      case 'head': {
        r = by(t.v2.head, value);
        if (!r) return { code: 'unknown' };
        /* 옆모습 몸에서 고개를 옆으로 돌리면 카메라 쪽 — 몸까지 돌았다(MGS 일상4) */
        return has(r.not_bodies, scene.body) ? { code: 'body' } : null;
      }
      case 'camera': {
        r = by(t.v2.camera, value);
        if (!r) return { code: 'unknown' };
        return r.families && po && !has(r.families, po.family) ? { code: 'family' } : null;
      }
      case 'right': case 'left': return whyHand(t, scene, key, value, game);
      case 'use': {
        r = use(t, value);
        if (!r) return { code: 'unknown' };
        if (!propSides(scene)) return { code: 'nohand' };
        return useFits(t, scene, r, null, game) ? null : { code: 'fit' };
      }
      case 'legs': {
        r = leg(t, value);
        if (!r) return { code: 'unknown' };
        if (!f || !f.legs) return { code: 'legs' };
        if (r.feet && !f.feet) return { code: 'feet' };
        if (po && !has(r.families, po.family)) return { code: 'family' };
        if (r.postures && !has(r.postures, scene.posture)) return { code: 'posture' };
        return placeOk(r, hs) ? null : { code: 'place', needs: (r.needs || []).concat(r.needs_any || []) };
      }
      case 'gaze': {
        r = by(t.v2.gaze, value);
        if (!r) return { code: 'unknown' };
        /* 창밖은 창이 있는 곳, 위(하늘)는 하늘이 보이는 곳만(2026-11-13 — 금고 · 정유소 마당에서 「창밖을 본다」) */
        if (!placeOk(r, hs)) return { code: 'place', needs: (r.needs || []).concat(r.needs_any || []) };
        var u = use(t, scene.use);
        if (value === 'at_prop' && !u) return { code: 'noprop' };
        /* 들여다보기는 들여다보는 동작(망원경 · 카메라)만 */
        if (value === 'into_prop' && !(u && u.gaze === 'into_prop')) return { code: 'noprop' };
        var bd = by(t.v2.body, scene.body), hd = by(t.v2.head, scene.head);
        if (value === 'camera' && bd && bd.far && !(hd && hd.look_back)) return { code: 'back' };
        return u && u.gaze && u.gaze !== value ? { code: 'use', gaze: u.gaze } : null;
      }
    }
    return null;
  }
  /* 손 칸 — 오른손이 먼저, 왼손은 오른손을 보고 거른다(두 손 자세 · 두 손 소품 동작은 둘이 같은 값) */
  function whyHand(t, scene, side, value, game) {
    var f = frame(t, scene.frame), mate = side === 'left' ? scene.right : '', m = mate && mate !== 'prop' ? hand(t, mate) : null;
    var poH = posture(t, scene.posture), suH = support(t, scene.support);
    /* 자세 글이 팔을 쓰면(앉아 앞으로 기울이기 — 팔뚝이 탁자에, 헤엄 — 두 팔로 젓는다) 그 자세가 받는 손만 · 옆으로 눕기는 깔린 팔이 못 하는 일을 받침이 거른다(2026-11-13) */
    if (poH && poH.hands && !has(poH.hands, value)) return { code: 'posture' };
    if (suH && suH['hands_' + side] && !has(suH['hands_' + side], value)) return { code: 'support' };
    if (value === 'prop') {
      if (mate && mate !== 'prop' && m && m.both) return { code: 'both' };
      /* 오른손은 한 손 동작이 있거나, 왼손도 소품이면 두 손 동작이 있으면 된다 — 왼손이 바뀌어도 오른손 소품 동작이 남게 */
      if (side === 'right') return anyUse(t, scene, 1, game) || (scene.left === 'prop' && anyUse(t, scene, 2, game)) ? null : { code: 'noprop' };
      return anyUse(t, scene, mate === 'prop' ? 2 : 1, game) ? null : { code: 'noprop' };
    }
    var h = hand(t, value);
    if (!h || !f) return { code: 'unknown' };
    if (h.sides && !has(h.sides, side)) return { code: 'support' };
    if (h.zone === 'out') { if (!f.close) return { code: 'close' }; }
    else if (h.zone !== 'any' && !has(f.zones, h.zone)) return { code: 'zone', zone: h.zone };
    if (h.postures && !has(h.postures, scene.posture)) return { code: 'posture' };
    /* 뒷모습으로 어깨 너머 돌아보며 얼굴 · 머리에 손 — 팔이 머리 뒤를 가로질러 늘 이상했다(「난간에서 돌아보기」, 좌우를 적어도 그대로 — 사용자 2026-11-01 「그냥 지금 구도는 갈래에서 없애줘」) */
    var bdL = by(t.v2.body, scene.body), hdL = by(t.v2.head, scene.head);
    if (h.zone === 'face' && bdL && bdL.far && hdL && hdL.look_back) return { code: 'lookback' };
    if (h.companion && !companionAt(t, scene.place)) return { code: 'companion' };
    if (!placeOk(h, placeHas(t, scene.place))) return { code: 'place', needs: (h.needs || []).concat(h.needs_any || []) };
    if (h.outfit && !has(sceneFeatures(t, scene), h.outfit)) return { code: 'outfit', feature: h.outfit };
    var su = support(t, scene.support);
    if (su && su.hands && !has(su.hands, value)) return { code: 'support' };
    if (side === 'left' && mate) {
      if (m && m.both && value !== mate) return { code: 'both' };
      if (h.both && value !== mate) return { code: 'both' };
      if (mate === 'prop' && h.both) return { code: 'both' };
      if (value === mate && !h.both && h.zone !== 'out' && h.zone !== 'any') return { code: 'same' };
      if (/^chin_/.test(value) && /^chin_/.test(mate) && value !== mate) return { code: 'chin' };
      /* 한 손만 올린다 — 표 raise_one { frames, zones }(포켓몬 2026-11-09: 가슴 위 · 얼굴 클로즈업에 두 손을 다 올리면(얼굴 · 가슴 · 머리 위, 또는 소품) 한 팔이 몸에서 떨어져 떠다니거나 팔 없는 몸통이 됐다).
         표에 없으면 안 거른다 — 공방마다 같은 코드, 규칙은 표가 쥔다(2026-11-25 style-atelier shared) */
      var r1 = t.v2.raise_one;
      if (r1 && has(r1.frames, scene.frame) && !h.both && has(r1.zones, h.zone) && (mate === 'prop' || (m && !m.both && has(r1.zones, m.zone)))) return { code: 'raised' };
    }
    return null;
  }

  /* 칸 하나의 고를 거리(열쇠 목록) — 화면 · 랜덤 · 묶음 계획기가 같이 쓴다 */
  function candidates(t, scene, key) {
    switch (key) {
      case 'era': return t.v1.eras.map(function (x) { return x.key; });
      case 'place': return allPlaces(t).map(function (x) { return x.key; });
      case 'weather': return (t.v2.weather || []).map(function (x) { return x.key; });
      case 'ofam': return t.v1.outfits.map(function (x) { return x.key; });
      case 'item': { var f = family(t, scene.ofam); return f ? f.items.map(function (x) { return x.key; }) : []; }
      case 'posture': return t.v2.postures.map(function (x) { return x.key; });
      case 'support': return t.v2.supports.map(function (x) { return x.key; });
      case 'frame': return Object.keys(t.v2.frames).filter(function (k) { return k !== 'note'; });
      case 'body': case 'head': case 'camera': case 'gaze': return t.v2[key].map(function (x) { return x.key; });
      case 'right': case 'left': return t.v2.hands.map(function (x) { return x.key; }).concat(['prop']);
      case 'use': return t.v2.prop_uses.map(function (x) { return x.key; });
      case 'legs': return t.v2.legs.map(function (x) { return x.key; });
    }
    return [];
  }
  /* 그 칸의 고를 거리에 드나 — candidates 와 같은 답(옷 말고는 표가 정해 한 번만 센다) */
  function candidate(t, scene, key, v) {
    if (key === 'item') return has(candidates(t, scene, key), v);
    var box = memo(t, 'cand', key, function () { var o = {}; candidates(t, {}, key).forEach(function (x) { o[x] = true; }); return o; });
    return typeof v === 'string' ? Object.prototype.hasOwnProperty.call(box, v) : has(candidates(t, scene, key), v);
  }
  function choices(t, scene, key, game) {
    return candidates(t, scene, key).filter(function (v) { return !why(t, scene, key, v, game); });
  }

  /* 해방(🔓) 칸은 트리 밖 값이라도 고치지 않는다 — 버전1 과 같다 */
  function unlocked(scene, k) { return !!(scene && scene[k] && has(scene.unlocked, k)); }
  function required(scene, k) { return has(REQUIRED, k) || (k === 'use' && propSides(scene) > 0); }
  function repair(t, scene, game, pick) { return repairUntil(t, scene, game, pick, null, null); }
  /* stop(next, k) 가 참이면 그 칸에서 그만두고 null(presetOk 가 빨리 「안 된다」 를 알게 — 속도만, 2026-11-24).
     early 칸은 지금 값이 안 맞으면(해방 칸이 없을 때 — 고쳐도 그 값으로 못 돌아온다) 고를 거리를 세지 않고 바로 null */
  function repairUntil(t, scene, game, pick, stop, early) {
    var next = Object.assign({}, scene, { treeV: 2 }), first = !pick;   /* 고르는 손이 없으면 첫 값 — 목록을 다 세지 않고 첫 맞는 값만 찾는다(같은 답, 속도) */
    pick = pick || function (list) { return list[0]; };
    /* 따라 해방된 칸(unlockedAuto)은 매번 새로 정한다 — 앞 칸을 트리 안으로 되돌리면 같이 풀린다 */
    var auto = next.unlockedAuto || [];
    if (auto.length) next.unlocked = (next.unlocked || []).filter(function (k) { return auto.indexOf(k) < 0; });
    delete next.unlockedAuto;
    for (var i = 0; i < ORDER.length; i++) {
      if (step(ORDER[i]) === false) return null;
      if (stop && stop(next, ORDER[i])) return null;
    }
    function step(k) {
      if (unlocked(next, k)) return;
      if (k === 'use' && !propSides(next)) { next.use = ''; return; }
      /* 지금 값이 그대로 되면 목록을 다 거르지 않는다 · 골라도 되는 칸은 목록이 필요 없다(속도만 — 결과는 같다, 2026-11-24 계획기가 칸마다 장소 수백 곳을 다시 걸렀다) */
      if (next[k] && candidate(t, next, k, next[k]) && !why(t, next, k, next[k], game)) return;
      if (early && next[k] && has(early, k) && !(next.unlocked || []).length) return false;
      if (required(next, k)) {
        if (first) { var c = candidates(t, next, k); for (var j = 0; j < c.length; j++) if (!why(t, next, k, c[j], game)) { next[k] = c[j]; return; } }
        var list = first ? [] : choices(t, next, k, game);
        if (list.length) { next[k] = pick(list, k); return; }
        /* 앞 칸을 해방해 고를 것이 하나도 안 남으면(거실에서 헤엄 → 물 받침이 없다) 장소 받침만 빼고 맞는 값을 고르고 그 칸도 해방으로 단다 —
           비워 두면 꼭 있어야 하는 칸이 비어 복사가 막혔다 */
        var fb = (next.unlocked || []).length ? candidates(t, next, k).filter(function (v) { var w = why(t, next, k, v, game); return !w || w.code === 'place'; }) : [];
        next[k] = fb.length ? fb[0] : '';
        if (fb.length) { next.unlocked = (next.unlocked || []).concat([k]); next.unlockedAuto = (next.unlockedAuto || []).concat([k]); }
      }
      else if (next[k]) next[k] = '';
    }
    /* 두 손 자세는 두 칸이 같은 값 — 한쪽만 골랐으면(다른 쪽 AUTO) 다른 쪽도 그 값 */
    ['right', 'left'].forEach(function (s) {
      var h = hand(t, next[s]), o = other(s);
      if (h && h.both && next[o] !== next[s] && !unlocked(next, o)) next[o] = next[s];
    });
    /* 옷은 프레이밍보다 먼저 고르지만, 가까운 컷이 허리 아래 옷을 거른다 */
    if (next.item && !unlocked(next, 'item') && why(t, next, 'item', next.item, game)) next.item = '';
    return next;
  }
  /* 칸 하나를 바꾼다 — 두 손 자세는 다른 손도 같은 값, 두 손 자세를 풀면 다른 손은 다시 고른다.
     두 손 소품 동작에서 한 손을 풀면 남은 손은 소품을 든 채 한 손 동작으로 바뀐다. 손 · 소품을 바꾸면 추천의 소품 꼴은 푼다 */
  function set(t, scene, key, value, game, pick) {
    var next = Object.assign({}, scene), h;
    next[key] = value;
    if (key === 'right' || key === 'left') {
      var o = other(key), was = hand(t, scene[key]);
      h = hand(t, value);
      if (h && h.both) next[o] = value;
      else if (was && was.both && next[o] === scene[key]) next[o] = '';
      next.use = value === 'prop' || next[o] === 'prop' ? next.use : '';
    }
    if (key === 'right' || key === 'left' || key === 'use') delete next.kind;
    /* 다시 검사가 칸을 고친 뒤에도 추천 그대로인가 — 아니면 추천 표시를 지운다(장소를 바꿔 받침이 사라진 경우까지) */
    var r = repair(t, next, game, pick), p = preset(t, r.preset);
    if (p && !presetSame(p, r)) r.preset = '';
    return r;
  }
  function presetSame(p, scene) {
    return BODY.every(function (k) { return (p[k] || '') === (scene[k] || '') || (k === 'gaze' && !p.gaze); });
  }

  /* 자세 추천 — 칸만 채운다. 소품 꼴(kind)은 남겨 다시 검사가 그 꼴의 소품 동작을 고르게 한다 */
  function applyPreset(t, scene, k) {
    var p = preset(t, k);
    if (!p) return scene;
    var next = Object.assign({}, scene, { preset: k, use: '', kind: p.prop_kind || '' });
    BODY.forEach(function (f) { next[f] = p[f] || ''; });
    if (!next.kind) delete next.kind;
    return next;
  }
  /* 지금 시대 · 장소 · 의상에서 그대로 쓸 수 있는 추천인가(다시 검사가 칸을 하나도 안 고친다) */
  function presetOk(t, scene, k, game) {
    var p = preset(t, k);
    if (!p) return false;
    /* 몸 칸이 고쳐지면 거기서 「안 된다」(손 둘은 뒤에서 두 손 자세가 맞춰 줄 수 있어 끝까지 본다) */
    var r = repairUntil(t, applyPreset(t, scene, k), game, null, function (next, f) { return has(BODY_FIX, f) && (next[f] || '') !== (p[f] || ''); }, BODY_FIX);
    return !!r && BODY.every(function (f) { return (r[f] || '') === (p[f] || ''); }) && (!p.prop_kind || !!r.use);
  }
  function presets(t, scene, game) { return t.v2.presets.filter(function (p) { return presetOk(t, scene, p.key, game); }); }

  /* 랜덤 — 잠근 칸(locks)은 두고, 시대 · 장소 · 의상 · 옷을 차례로, 몸 쪽은 쓸 수 있는 추천 하나(opts.preset === false 면 칸마다).
     rnd 는 0 이상 1 미만(기본 Math.random) */
  function random(t, scene, game, rnd, locks, opts) {
    rnd = rnd || Math.random; locks = locks || []; opts = opts || {};
    var pickR = function (list) { return list[Math.floor(rnd() * list.length)]; };
    var next = Object.assign({}, scene);
    ['era', 'place', 'ofam', 'item', 'use', 'preset', 'kind'].concat(BODY).forEach(function (k) { if (!has(locks, k)) next[k] = ''; });
    next = repair(t, next, game, pickR);
    if (!has(locks, 'item')) { var its = choices(t, next, 'item', game); next.item = its.length ? pickR(its) : ''; }
    var free = BODY.filter(function (k) { return !has(locks, k); });
    if (opts.preset !== false && free.length === BODY.length) {
      var list = presets(t, next, game);
      if (list.length) return repair(t, applyPreset(t, next, pickR(list).key), game, pickR);
    }
    next = repair(t, next, game, pickR);
    ['legs', 'gaze'].forEach(function (k) {
      if (has(locks, k)) return;
      var c = choices(t, next, k, game);
      next[k] = c.length && rnd() < 0.8 ? pickR(c) : '';
    });
    return repair(t, next, game, pickR);
  }

  /* 버전1 기록 — 하는 일 · 자세 · 방향이 있거나 아주 예전 갈래(cat). 화면은 지시문을 그대로 보이고, 다시 고를 때만 옮긴다 */
  function isV1(scene) { return !!scene && scene.treeV !== 2 && !!(scene.act || scene.pose || scene.orient || scene.cat); }
  function fromV1(t, scene, game) {
    var C = root.AtelierCasualTree, s = scene || {};
    if (s.cat && !s.place && C && C.fromLegacy) s = C.fromLegacy(t.v1, s);
    var L = t.v2.legacy || {}, a = by(t.v1.activities, s.act);
    /* 시대 · 장소 · 의상 · 옷 · 프레이밍 · 표정 · 알아볼 거리(prop) · 추가 연출 · 축은 그대로, 버전1 칸은 지운다 —
       버전1 camera(자유 글) · preset(버전1 추천 조합)은 버전2 의 같은 이름 칸과 뜻이 달라 버린다 */
    var next = Object.assign({}, s, { treeV: 2, era: s.era || 'now' });
    V1_ONLY.forEach(function (k) { delete next[k]; });
    if (a && (L.families || {})[a.family]) next.posture = L.families[a.family];
    [(L.acts || {})[s.act], (L.poses || {})[s.pose], (L.orients || {})[s.orient]].forEach(function (row) { if (row) Object.assign(next, row); });
    if (next.right && !next.left) { var h = hand(t, next.right); if (h && h.both) next.left = next.right; }
    return repair(t, next, game);
  }

  /* 뒷모습으로 돌아보는 컷(몸 far · 머리 look_back)의 좌우 — 「어깨 너머」 만 적으면 모델이 아무 쪽으로 돌렸다. 왼쪽 어깨로 정하고,
     뒷모습이라 인물의 좌우가 화면의 좌우와 같다는 말을 손 줄에 붙인다(2026-11-01). 얼굴 · 머리에 대는 손은 이 컷에서 못 고른다(whyHand lookback) */
  function backLook(t, scene) {
    var bd = by(t.v2.body, scene.body), hd = by(t.v2.head, scene.head);
    if (!bd || !bd.far || !hd || !hd.look_back) return null;
    return { side: 'left', face: '', arm: '',
      /* 2026-11-25 사용자 「이렇게 뒤돌아보는 자세가 … 자연스럽게 나오는것 같지가 않아」(서서 · 난간에 기대 · 가까이 돌아보는 참고 그림 셋) — 「어깨 너머」 한 마디뿐이라 목만 꺾였다.
         턱이 가까운 어깨 위 · 그 어깨가 살짝 내려옴 · 윗등이 고개를 따라 조금 돎(날개뼈 · 등줄기가 보임) · 엉덩이는 돌아간 채를 적는다(무게 다리는 다리 칸 — 앉은 돌아보기에도 붙으므로) */
      head: "looking back over her own left shoulder — the shoulder on the image's left side: her chin comes to rest just above that shoulder, which dips slightly toward the camera, and her upper back turns a little with her head so her shoulder blade and the curve of her spine show, while her hips stay turned away — a natural, unhurried glance back",
      where: function (s) { return bd.face_hidden ? "on the image's " + s + ' side, since her back is to the camera' : ''; } };
  }

  /* 뒤쪽 몸의 비틀림 막기(2026-11-25 사용자 「몸방향 뒤, 시선 먼곳, 카메라 눈높이 일 때, 자세는 뒷모습을 보이며 걸어가는 자세인데, 상체는 카메라쪽으로 돌아있어서 기괴한 이미지들이 있네」) —
     「back to the camera」 한 마디만 두면 같은 지시문의 가슴골 · 쇄골 노출 · 「얼굴이 자연스럽게」 말에 끌려 모델이 하체는 뒤로, 상체만 앞으로 비틀었다.
     몸이 뒤쪽(far)이면 어깨 · 가슴 · 엉덩이가 한 줄로 돌아가 있다고 못 박고, 노출은 뒤에서 보이는 곳만. 돌아보는 컷(look_back)은 고개와 윗등만 조금 — 가슴이 카메라를 향하게 다 비틀지는 않는다
     (처음엔 「고개 · 목만」 이라 적었는데 등을 보인 채 카메라를 보려면 목만으론 못 돌아 억지 자세가 된다 — 같은 날 고침) */
  function backLock(t, scene) {
    var bd = by(t.v2.body, scene.body), hd = by(t.v2.head, scene.head) || {};
    if (!bd || !bd.far) return '';
    if (hd.look_back) return 'her chest stays turned away — never a full twist that squares her chest to the camera; the look-back comes from her head and a slight turn of her upper back only';
    if (bd.face_hidden) return 'seen from behind — her head, shoulders, back and hips all face away from the camera in one line, no twist at the waist; her face and chest are not shown, and any skin the outfit reveals shows only from behind (shoulders, open back, the backs of her legs)';
    return 'her shoulders, chest and hips turn away from the camera together, no twist at the waist; her chest stays turned away';
  }

  /* 옆모습(profile_face)의 좌우 — 「본인의 오른손」 이 카메라 쪽 팔인지 먼 쪽 팔인지는 몸이 화면 어느 쪽을 보느냐에 달렸는데 글이 안 정해 모델이 아무 쪽이나 골랐다
     (검수 기록의 좌우 뒤바뀜 38장이 거의 옆모습 추천, 2026-11-13). 일하는 손(소품 · 얼굴 · 가슴 · 머리 위 · 허리)이 카메라 쪽 팔이 되게 몸이 보는 쪽을 정한다 —
     오른손이 일하면 화면 오른쪽을 본다(그 사람의 오른쪽 옆이 카메라 쪽). 시선이 화면 왼쪽 · 오른쪽이면 그쪽을 본다 */
  function sideLook(t, scene) {
    var bd = by(t.v2.body, scene.body);
    if (!bd || !bd.profile_face) return null;
    var busy = function (s) { var k = scene[s], h = k && k !== 'prop' ? hand(t, k) : null; return k === 'prop' || (!!h && /^(face|chest|overhead|waist)$/.test(h.zone)); };
    var face = scene.gaze === 'screen_left' ? 'left' : scene.gaze === 'screen_right' ? 'right' : busy('right') === busy('left') && (scene.turn === 'left' || scene.turn === 'right') ? scene.turn : busy('right') || !busy('left') ? 'right' : 'left';   /* 두 손이 같으면 계획기가 나눈 좌우(scene.turn, 2026-11-20) */
    var near = face, far = other(face);
    return { face: face, near: near, far: far,
      body: 'facing the ' + face + ' of the frame, so her own ' + near + ' side is toward the camera',
      where: function (s) { return s === near ? 'her near arm, on the camera side' : 'her far arm, on the side away from the camera'; } };
  }
  /* 고개 · 몸 좌우(scene.turn — 'front' 정면 · 'left' · 'right' 코끝이 향하는 화면 쪽, 2026-11-20 사용자 「도시공방 경복궁 사이버펑크야. 고치려면 공통으로 고쳐줘」).
     GPT 검토 — 시선만 「카메라를 본다」 로 정하고 고개 좌우를 비워 두면, 모델이 붙인 대표컷의 익숙한 얼굴 각도로 채워 한 묶음 얼굴 각도가 다 같았다
     (몸 3/4 은 좌우가 없고, 옆모습은 일하는 손 쪽으로만 돌아 늘 오른쪽). 몸 3/4 · 고개 옆 · 갸웃 · 옆모습은 좌우를, 몸 정면 + 고개 따라감은 정면.
     등 · 뒤 3/4 · 어깨 너머는 따로(backLook) 정해 여기서 다루지 않는다. 계획기가 한 묶음 안에서 덜 쓴 쪽을 고른다(spreadTurns) */
  function turns(t, scene) {
    var bd = by(t.v2.body, scene.body) || {}, hd = by(t.v2.head, scene.head) || {};
    if (!scene.body || bd.far || hd.look_back || (bd.face_hidden && !hd.look_back)) return [];
    if (bd.profile_face) return ['left', 'right'];
    if (scene.body === 'front' && (!hd.key || hd.key === 'with_body')) return ['front'];
    if (scene.body === 'front' && hd.key === 'tilt') return ['front', 'left', 'right'];
    return ['left', 'right'];
  }
  /* 조립부가 COMPOSITION 줄에 싣는 글 — 몸(3/4 일 때) · 고개, 그리고 「각도는 첨부 그림이 아니라 이 줄」. 옆모습은 sideLook 이 몸 쪽을 쓰므로 null */
  function turnText(t, scene) {
    var tu = scene.turn, c = turns(t, scene); if (!tu || c.indexOf(tu) < 0) return null;
    var bd = by(t.v2.body, scene.body) || {}, hd = by(t.v2.head, scene.head) || {}, side = 'the ' + tu + ' of the frame', out = {};
    if (bd.profile_face) return null;
    if (scene.body === 'front_3q') out.body = 'body turned three-quarters, her chest angled toward ' + side;
    if (tu === 'front') out.head = 'head facing the camera straight on, both ears about equally visible';
    else if (hd.key === 'turn_side') out.head = 'head turned so the tip of her nose points toward ' + side;
    else if (hd.key === 'tilt') out.head = 'head tilted slightly, her face turned a little toward ' + side;
    else out.head = 'head turned with her body, the tip of her nose pointing toward ' + side;
    out.lock = 'her head and body angles are set by this line, not taken from the attached image';
    return out;
  }
  /* 계획기 — 한 묶음(scenes)에 좌우를 고르게. old 는 이미 있는 컷(센다). 이미 맞는 값이 있으면 둔다 */
  function spreadTurns(t, scenes, rnd, old) {
    rnd = rnd || Math.random; var used = { front: 0, left: 0, right: 0 };
    (old || []).forEach(function (c) { if (c && used[c.turn] != null) used[c.turn]++; });
    (scenes || []).forEach(function (sc) {
      if (!sc) return; var c = turns(t, sc);
      if (!c.length) { delete sc.turn; return; }
      if (sc.turn && c.indexOf(sc.turn) >= 0) { used[sc.turn]++; return; }
      var min = Math.min.apply(null, c.map(function (k) { return used[k]; })), pool = c.filter(function (k) { return used[k] === min; });
      sc.turn = pool[Math.floor(rnd() * pool.length)]; used[sc.turn]++;
    });
    return scenes;
  }
  /* 실루엣 갈래(2026-11-23 사용자 「같은 필수갈래에서는 의상들 실루엣이 거의 다 비슷」 → 「1단계부터 진행해주고 덜 쓴 것 먼저로 섞어줘」).
     옷 계열에 classes 가 있으면(수영복 · 란제리 — 비키니 · 원피스 · 조형 · 드레이프 · 코르셋 · 하네스 · 겉옷처럼 입는 란제리 …) 옷마다 cls.
     classLean — 후보 옷 가운데 덜 쓴 갈래(그 갈래 옷들의 쓴 횟수 합)의 옷만 남긴다. count(옷 열쇠) → 쓴 횟수. 갈래가 없는 계열은 그대로 */
  function itemClass(t, fam, k) { var it = item(t, fam, k); return (it && it.cls) || ''; }
  function classLean(t, fam, keys, count) {
    var f = family(t, fam); if (!f || !f.classes || !(keys || []).length) return keys || [];
    var use = {}, has = {};
    (f.items || []).forEach(function (it) { if (it.cls) use[it.cls] = (use[it.cls] || 0) + (count ? count(it.key) || 0 : 0); });
    keys.forEach(function (k) { var c = itemClass(t, fam, k); if (c) has[c] = 1; });
    /* 새로 더한 갈래(쓴 횟수 0)는 쓴 갈래들의 가운데 값에서 시작 — 안 그러면 새 갈래만 따라잡을 때까지 연달아 나온다(사용자 「화보쪽을 더 자주나오게 할 필요는 없어」) */
    var used = Object.keys(use).map(function (c) { return use[c]; }).filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    if (used.length) { var mid = used[Math.floor(used.length / 2)]; Object.keys(use).forEach(function (c) { if (!use[c]) use[c] = mid; }); }
    var cls = Object.keys(has); if (!cls.length) return keys;
    var min = Math.min.apply(null, cls.map(function (c) { return use[c] || 0; }));
    return keys.filter(function (k) { var c = itemClass(t, fam, k); return !c || (use[c] || 0) === min; });
  }
  /* 자세 추천 넓이(2026-11-23 사용자 「1,2,3 은 해주고」 — 두 손 모으기 · 쉿이 자주 나왔다). 소품 · 받침 · 장소 조건이 없는 추천은 거의 모든 칸의 후보라
     「덜 쓴 것 먼저」 로도 눌리지 않았다(기록에서 평균의 1.4 ~ 2.1 배). presetBreadth — 시대 × 장소 가운데 그 추천이 되는 몫(0 ~ 1, 표마다 한 번 셈).
     presetBias — log2(몫 / 가운데 값), -1 ~ 1.5 로 자름: 계획기가 무게에 2^-bias 를 곱한다(어디서나 되는 추천은 덜, 드문 곳에서만 되는 추천은 더).
     presetOnce — 표 preset_once(두 손 모으기 · 무릎 꿇고 손 모으기 · 쉿)는 한 캐릭터(세 세계 · 묶음 통틀어) 한 장까지 */
  var BREADTH = typeof WeakMap === 'function' ? new WeakMap() : null;
  function presetBreadth(t) {
    var hit = BREADTH && BREADTH.get(t.v2); if (hit) return hit;
    var n = {}, ctx = 0;
    t.v2.presets.forEach(function (p) { n[p.key] = 0; });
    choices(t, {}, 'era', null).forEach(function (era) {
      choices(t, { era: era }, 'place', null).forEach(function (pl) { ctx++; presets(t, repair(t, { era: era, place: pl }, null), null).forEach(function (p) { n[p.key]++; }); });   /* 의상 계열은 한 번만 골라 둔다 — 추천마다 같은 첫 값을 다시 골랐다(같은 답, 속도) */
    });
    var out = {}; for (var k in n) out[k] = ctx ? n[k] / ctx : 0;
    var vals = Object.keys(out).map(function (k) { return out[k]; }).filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    out.__median = vals.length ? vals[Math.floor(vals.length / 2)] : 1;
    if (BREADTH) BREADTH.set(t.v2, out);
    return out;
  }
  function presetBias(t, k) {
    var b = presetBreadth(t), v = b[k]; if (!v) return 0;
    return Math.max(-1, Math.min(1.5, Math.log(v / b.__median) / Math.LN2));
  }
  function presetOnce(t, k) { return !!k && ((t.v2 && t.v2.preset_once) || []).indexOf(k) >= 0; }
  /* 옷 꾸밈(2026-11-23 사용자 「같은 의상이라도 색상말고 다른 방법으로 다양화」 → 「1,3,4,5,6번까지해서 공통으로 해줘」) — 표 outfit_style.
     소재(material) · 입은 모양(wear) · 핏(fit) · 겹쳐 입기(layer) · 장신구(acc)를 컷마다 축별로 하나(또는 없음). scene.ostyle = { 축: 열쇠 }.
     styleOpts — 그 컷에서 되는 것(옷 계열 fams · 프레이밍 frames · 옷 글에 needs 가 있고 clash 가 없음 · warm 은 opts.cold(scene) 일 때 · opts.ok(en) 이 참).
     게임 코스프레(계열 cosplay) · 직접 쓴 옷 글(scene.outfit) · 자유 설계 칸(sfree · ofree · xfree)은 꾸미지 않는다 */
  var STYLE_SKIP = /^(game_cosplay)$/;
  function styleBase(t, scene) {
    var fam = family(t, scene.ofam) || {}, it = item(t, scene.ofam, scene.item) || {};
    return { fam: fam, en: [it.en || '', fam.en || ''].join(' ') };
  }
  function styleable(t, scene) {
    if (!scene || !scene.ofam || scene.sfree || scene.ofree || scene.xfree || (scene.outfit && String(scene.outfit).trim())) return false;
    var b = styleBase(t, scene); return !(b.fam.cosplay || STYLE_SKIP.test(scene.ofam));
  }
  function styleOpts(t, scene, axis, opts) {
    var S = (t.v2 && t.v2.outfit_style) || {}, A = (S.axes || {})[axis]; opts = opts || {};
    if (!A || !styleable(t, scene)) return [];
    var en = styleBase(t, scene).en, re = function (s) { return s ? new RegExp(s, 'i') : null; }, ac = re(A.clash);
    if (ac && ac.test(en)) return [];
    return (A.options || []).filter(function (o) {
      if (o.fams && o.fams.indexOf(scene.ofam) < 0) return false;
      if (o.frames && scene.frame && o.frames.indexOf(scene.frame) < 0) return false;
      var n = re(o.needs), c = re(o.clash);
      if (n && !n.test(en)) return false;
      if (c && c.test(en)) return false;
      if (o.warm && !(opts.cold && opts.cold(scene))) return false;
      return !opts.ok || opts.ok(o.en, scene);
    });
  }
  /* 지시문 말 — 「styled with a soft glossy satin finish, sleeves pushed up to the elbows and a slim leather belt at the waist」. 없으면 '' */
  function styleText(t, scene) {
    var S = (t.v2 && t.v2.outfit_style) || {}, st = (scene && scene.ostyle) || {}, out = [];
    (S.order || []).forEach(function (ax) { var A = (S.axes || {})[ax], o = A && st[ax] ? by(A.options, st[ax]) : null; if (o) out.push(o.en); });
    if (!out.length) return '';
    return 'styled with ' + (out.length > 1 ? out.slice(0, -1).join(', ') + ' and ' + out[out.length - 1] : out[0]);
  }
  /* 한 묶음 — 축마다 rate 몫으로 얹고, 묶음 + 앞 기록(old)에서 덜 쓴 것부터. 맞는 꾸밈(이미 있는 scene.ostyle)은 둔다 */
  function spreadStyles(t, scenes, rnd, old, opts) {
    rnd = rnd || Math.random; opts = opts || {};
    var S = (t.v2 && t.v2.outfit_style) || {}, used = {};
    (S.order || []).forEach(function (ax) { used[ax] = {}; });
    (old || []).forEach(function (c) { var st = (c && c.ostyle) || {}; for (var ax in st) if (used[ax]) used[ax][st[ax]] = (used[ax][st[ax]] || 0) + 1; });
    (scenes || []).forEach(function (sc) {
      if (!sc) return;
      if (!styleable(t, sc)) { delete sc.ostyle; return; }
      var st = {}, prev = sc.ostyle || {};
      (S.order || []).forEach(function (ax) {
        var A = S.axes[ax], ok = styleOpts(t, sc, ax, opts), keys = ok.map(function (o) { return o.key; });
        if (prev[ax] && keys.indexOf(prev[ax]) >= 0) { st[ax] = prev[ax]; used[ax][st[ax]] = (used[ax][st[ax]] || 0) + 1; return; }
        if (!keys.length || rnd() >= (A.rate == null ? 0.5 : A.rate)) return;
        var cnt = function (k) { return used[ax][k] || 0; }, min = Math.min.apply(null, keys.map(cnt)), pool = keys.filter(function (k) { return cnt(k) === min; });
        st[ax] = pool[Math.floor(rnd() * pool.length)]; used[ax][st[ax]] = (used[ax][st[ax]] || 0) + 1;
      });
      if (Object.keys(st).length) sc.ostyle = st; else delete sc.ostyle;
    });
    return scenes;
  }
  /* 덧붙는 표(light · spot · depth · view) — 그 장소 · 프레이밍에서 되는 열쇠. 표가 없으면 [] */
  function auxOk(t, scene, row) {
    return !!row && placeOk(row, placeHas(t, scene.place)) && (!row.frames || has(row.frames, scene.frame)) && (!row.eras || has(row.eras, scene.era));
  }
  /* 순간(2026-11-18 사용자 D — 「목욕거품을 머리 위에 올리거나 몸에 붙어 있다는 등」) — 노출과 상관없는 작은 사건, 표 moments. 그 장소 특징(needs · needs_any) ·
     프레이밍(frames — 보여야 하는 부위가 들어오는 컷) · 시대 · 날씨 · 시간대가 맞고, face 면 얼굴이 보이는 컷(등 돌린 몸이 돌아보지 않으면 안 됨)만. 손을 쓰는 순간은 표에 없다 */
  function momentOk(t, scene, r) {
    if (!auxOk(t, scene, r)) return false;
    if (r.places && !has(memo(t, 'momentPlaces', r.key, function () { return expand(t, r.places); }), scene.place)) return false;   /* 목욕 거품 · 거울은 목욕 장소만 */
    if (r.weather && !has(r.weather, scene.weather || '')) return false;
    if (r.times && !has(r.times, scene.time || '')) return false;
    if (r.face) { var bd = by(t.v2.body, scene.body) || {}, hd = by(t.v2.head, scene.head) || {}; if (bd.face_hidden && !hd.look_back) return false; }
    return true;
  }
  function moments(t, scene) { return (t.v2.moments || []).filter(function (r) { return momentOk(t, scene, r); }).map(function (r) { return r.key; }); }
  function aux(t, scene, kind) { return (t.v2[kind] || []).filter(function (r) { return auxOk(t, scene, r); }).map(function (r) { return r.key; }); }
  /* 계획기가 한 컷의 빛 · 날씨 · 머리 · 화면 자리를 고른다(표 ambience 의 조건, 2026-11-13 — 전엔 계획기가 이 칸들을 한 번도 안 채워 그림의 빛이 한 가지였다).
     opts.times · opts.hairs — 그 공방의 시간대 · 머리 열쇠 목록, opts.used — 같은 묶음이 벌써 쓴 값({ time: { morning: 1 } … }, 덜 쓴 쪽을 고른다). 돌려주는 칸만 장면에 얹는다 */
  function ambience(t, scene, rnd, opts) {
    rnd = rnd || Math.random; opts = opts || {};
    var A = t.v2.ambience || {}, hs = placeHas(t, scene.place), pl = place(t, scene.place) || {}, used = opts.used || {}, out = {};
    /* 덜 쓴 값 — 같은 묶음의 횟수(used) + 그 공방 전체 기록의 비율(opts.global — 0 ~ 1, 많이 쓴 값이 1). 묶음 횟수가 먼저, 같으면 전체에서 덜 쓴 쪽(2026-11-18 —
       묶음 안만 봐서 전체로는 등불 · 밤이 72% 였다). global 이 없으면 전과 같다 */
    var least = function (kind, list) {
      if (!list.length) return '';
      var u = used[kind] || {}, g = (opts.global || {})[kind] || {}, sc = function (k) { return (u[k] || 0) + (g[k] || 0); };
      var min = Math.min.apply(null, list.map(sc));
      var pool = list.filter(function (k) { return sc(k) - min < 0.35; });
      return pool[Math.floor(rnd() * pool.length)];
    };
    var chance = function (kind, p) { var c = (opts.chance || {})[kind]; return rnd() < (c == null ? p : c); };
    var fixed = has(hs, 'timed'), dark = has(hs, 'night');
    var times = (opts.times || (t.v2.times || []).map(function (r) { return r.key; })).filter(function (k) {
      var r = (A.times || {})[k];
      return !!r && auxOk(t, scene, r) && (!dark || has(A.night_times || [], k));
    });
    out.time = !fixed && times.length && chance('time', 1) ? least('time', times) : '';   /* 늘 고른다(2026-11-18 사용자 B — 전엔 0.7 · 창 없는 실내 0.3 이라 절반이 비었다). 창 없는 실내도 낮 실내 · 형광등이 있다 */
    var wn = A.weather_needs_any || [], wt = A.weather_times || {};
    var ws = (t.v2.weather || []).map(function (r) { return r.key; }).filter(function (k) {
      if (fixed || (wn.length && !wn.some(function (x) { return has(hs, x); }))) return false;
      if (out.time ? !has(wt[k] || [], out.time) : dark && !has(wt[k] || [], 'night')) return false;
      return !weatherAwkward(t, k, scene.ofam, scene.item).length;
    });
    out.weather = ws.length && chance('weather', 0.35) ? least('weather', ws) : '';
    var hairs = (opts.hairs || []).filter(function (k) {
      var r = (A.hair || {})[k];
      if (!r) return true;
      if (r.groups && !has(r.groups, pl.group)) return false;
      if (!placeOk(r, hs)) return false;
      return !(r.not_hands && (has(r.not_hands, scene.right) || has(r.not_hands, scene.left)));
    });
    out.hair = hairs.length && chance('hair', 0.35) ? least('hair', hairs) : '';
    var night = dark || has(A.night_times || [], out.time);
    var lights = aux(t, scene, 'light').filter(function (k) { var r = by(t.v2.light, k); return !(night && r.day) && !(!night && out.time && r.night_only); });
    out.light = lights.length && chance('light', 0.6) ? least('light', lights) : '';
    [['spot', 0.35], ['depth', 0.5], ['view', 0.2]].forEach(function (x) { var l = aux(t, scene, x[0]); out[x[0]] = l.length && chance(x[0], x[1]) ? least(x[0], l) : ''; });
    /* 카메라 — 추천이 눈높이일 때 가끔 그 자세가 받는 다른 높이로(추천 47 중 34 가 눈높이였다) */
    if (scene.camera === 'eye' && chance('camera', 0.3)) {
      var cs = choices(t, scene, 'camera').filter(function (k) { return k !== 'eye'; });
      if (cs.length) out.camera = least('camera', cs);
    }
    return out;
  }

  /* 조립기가 장면 줄에 덧붙이는 글 — 세 공방 조립기가 같은 것을 쓴다. 표 · 장소가 안 받는 값은 싣지 않는다.
     indoor: 실내인가(상황 「젖은 옷」 이 비 대신 물 튐으로) · side: 옆모습의 가까운 팔 · time(표에 times 가 있을 때 — pkm) · light: 빛의 방향 ·
     comp: COMPOSITION 줄에 잇는 화면 안 자리 · 배경 깊이 · 전경 · where(side): 손 줄 끝에 붙는 말(뒷모습 — 화면 쪽, 옆모습 — 가까운 팔 · 먼 팔) */
  function extras(t, scene) {
    var hs = placeHas(t, scene.place), bl = backLook(t, scene), sl = sideLook(t, scene);
    var en = function (kind, k) { var r = k ? by(t.v2[kind] || [], k) : null; return r && auxOk(t, scene, r) ? r.en : ''; };
    /* 그 시간대의 빛이 그 장소에서 어떻게 보이나(2026-11-18 사용자 G — 「부엌의 아침 창빛 · 비 갠 오후의 젖은 바닥 반사」) — 표 ambience.looks 의 첫 맞는 줄:
       times(시간대) · has_any(장소 특징) · weather(날씨) 가 다 맞으면. 시간대 줄 뒤에 붙는다 */
    var look = scene.time ? ((t.v2.ambience || {}).looks || []).filter(function (r) {
      return has(r.times || [], scene.time) && (!r.has_any || r.has_any.some(function (x) { return has(hs, x); })) && (!r.weather || has(r.weather, scene.weather || ''));
    })[0] : null;
    var mo = scene.moment ? by(t.v2.moments || [], scene.moment) : null;
    return { indoor: has(hs, 'indoor'), side: sl, time: en('times', scene.time), look: look ? look.en : '', moment: mo && momentOk(t, scene, mo) ? mo.en : '', light: en('light', scene.light),
      comp: [backLock(t, scene)].concat(['spot', 'depth', 'view'].map(function (k) { return en(k, scene[k]); })).filter(Boolean),   /* 뒤쪽 몸 비틀림 막기(backLock)가 맨 앞 */
      where: function (side) { var w = bl ? bl.where(side) : sl ? sl.where(side) : ''; return w ? ' — ' + w : ''; } };
  }

  /* 상황 노출이 그 장면에 되나(2026-11-13) — 상황 표의 줄(row: 공방 낱말 표 CASUAL.situations · SITUATIONS)에 조건이 있으면 본다:
     needs · needs_any(장소 특징) · not_has(있으면 안 되는 특징 — 바람은 실내가 아닌 곳) · groups 또는 place_rx(더운 곳 — 장소 묶음이나 장소 글) · postures · frames. 옷에 맞는지는 부르는 쪽(fit · skip) */
  function situOk(t, scene, row) {
    if (!row) return false;
    var hs = placeHas(t, scene.place), pl = place(t, scene.place) || {};
    if (!placeOk(row, hs)) return false;
    if (row.not_has && row.not_has.some(function (x) { return has(hs, x); })) return false;
    if ((t.v2.situ_not_has || []).some(function (x) { return has(hs, x); })) return false;   /* 표 situ_not_has(2026-11-25 — 아이들이 오는 놀이터 k_kids 엔 상황 노출 없음) */
    if (row.postures && !has(row.postures, scene.posture)) return false;
    if (row.frames && !has(row.frames, scene.frame)) return false;
    if (row.groups || row.place_rx) {
      if (!(row.groups && has(row.groups, pl.group)) && !(row.place_rx && new RegExp(row.place_rx, 'i').test(pl.en || ''))) return false;
    }
    return true;
  }

  /* 화면비(2026-11-23 사용자 「배경이 보이니까 더 시원하네」 · 「다른 공방도 조금씩 해보자」 — 도시 파리 · 카이로 시험: 같은 지시문 · 같은 참고 그림에 Output 줄만 바꿨다).
     눕는 자세 · 환경 컷은 2:3 에서 답답하고 3:2 가 가장 좋았다. 허리 위 · 3/4 컷은 1:1 에서 인물 크기는 그대로 배경이 열렸다. 선 전신 · 가슴 위 · 얼굴 · 손 클로즈업은 2:3.
     표 aspect_rules — rules 를 차례로 보고 첫 맞는 줄(postures 나 frames 가운데 하나라도 맞으면), 없으면 default. 자유 설계 칸(sfree · ofree · xfree) · 게임 코스프레
     (계열 cosplay 또는 keep_fams)는 default. sizes — 그림 API 가 받는 크기 셋. 이미 그린 그림은 2:3 그대로(기록에 aspect 가 없으면 2:3) */
  var ASPECT_SIZES = { '2:3': [1024, 1536], '1:1': [1024, 1024], '3:2': [1536, 1024] };
  function aspectRules(t) { return (t && t.v2 && t.v2.aspect_rules) || {}; }
  function aspectSizes(t) { return aspectRules(t).sizes || ASPECT_SIZES; }
  function aspectFor(t, scene) {
    var A = aspectRules(t), S = aspectSizes(t), def = S[A['default']] ? A['default'] : '2:3', sc = scene || {};
    if (sc.sfree || sc.ofree || sc.xfree) return def;
    var fam = sc.ofam && t && t.v1 ? family(t, sc.ofam) : null;
    if ((fam && fam.cosplay) || has(A.keep_fams, sc.ofam)) return def;
    var rules = A.rules || [];
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if ((sc.posture && has(r.postures, sc.posture)) || (sc.frame && has(r.frames, sc.frame))) return S[r.aspect] ? r.aspect : def;
    }
    return def;
  }
  /* 화면비 → [가로, 세로]. 모르는 값은 2:3 */
  function aspectSize(t, aspect) { var S = aspectSizes(t), s = S[aspect] || S['2:3'] || ASPECT_SIZES['2:3']; return [s[0], s[1]]; }

  root.AtelierCasualTreeV2 = { aspectFor: aspectFor, aspectSize: aspectSize, ASPECT_SIZES: ASPECT_SIZES, situOk: situOk, extras: extras, sideLook: sideLook, turns: turns, turnText: turnText, spreadTurns: spreadTurns, styleOpts: styleOpts, styleText: styleText, spreadStyles: spreadStyles, presetBreadth: presetBreadth, presetBias: presetBias, presetOnce: presetOnce, itemClass: itemClass, classLean: classLean, aux: aux, auxOk: auxOk, ambience: ambience, moments: moments, momentOk: momentOk, ORDER: ORDER, REQUIRED: REQUIRED, BODY: BODY, make: make, backLook: backLook, backLock: backLock,
    era: era, place: place, family: family, item: item, posture: posture, support: support, hand: hand, leg: leg, prop: prop, use: use, preset: preset,
    frame: frame, lens: lens, placeHas: placeHas, placeOk: placeOk, bannedV2: bannedV2, companionAt: companionAt, animalsAt: animalsAt, expand: expand, propAt: propAt, farBanned: farBanned, features: features, awkward: awkward,
    candidates: candidates, allPlaces: allPlaces, weatherAwkward: weatherAwkward, useFits: useFits, uses: uses, sceneFeatures: sceneFeatures, signatureHold: signatureHold, FEATURES: FEATURES, propSides: propSides, why: why, choices: choices, unlocked: unlocked, repair: repair, set: set,
    applyPreset: applyPreset, presetOk: presetOk, presets: presets, random: random, isV1: isV1, fromV1: fromV1 };
})(typeof window !== 'undefined' ? window : globalThis);
