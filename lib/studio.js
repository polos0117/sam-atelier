/* 생성기 판 — 공방 모음(polos0117.github.io/prompt/hub.js)의 통합 생성기 꼴을 이 공방 안에 들였다(2026-10-30, 사용자 「UI 는 허브 통합 생성기, 일상컷은 버전2」).
   나라 › 카드 › 갈래(세계 그림 · 일상컷) › 갈래의 단계를 한 칸씩 고른다. 고른 단계는 위 칩으로 접히고, 누르면 그 단계로 돌아간다.
   세력 › 장수 › 갈래(세계 그림 · 일상컷) › 단계 — 원소 공방의 판을 옮겼다(2026-11-02). 세계 그림: 세계(삼국시대 · 중세 판타지 · 메카) → 장면(그 세계의 장소 변주 · 시간대) → 자세·표정 → 설계 줄(실루엣·얼굴 싣기 · 노출) → 외형(game 과 같은 외형 선택지 네 묶음 — 설계표 look 이 자동 값, 직접 고른 것이 이긴다, lib/look-spec.js) → 덧붙임. 일상컷(트리 버전2, lib/casual-tree-v2.js): 세계(참고 그림이 되는 세계 그림 — 화풍도 그걸 따른다) → 시대 → 장소 → 계절·날씨 → 의상 계열 → 옷 → 자세 추천 → 몸 자세 → 받침 → 프레이밍 → 몸 방향 → 머리 방향 → 카메라 높이
   → 오른손 → 왼손 → 소품 동작(소품을 쓰는 손이 있을 때) → 다리(다리가 보이는 컷) → 시선 → 표정(얼굴이 보일 때) → 덧붙임.
   앞을 바꾸면 맞지 않게 된 뒤 칸만 비워 다시 고르게 한다(C2.set 에 빈 값 고르개). 「해방」 을 켜면 트리 밖 선택지가 흐리게 보이고 왜 빠졌는지 붙는다(C2.why) —
   고르면 🔓 가 붙고 기록(unlocked)에 남는다(트리가 그 칸을 고치지 않는다). 랜덤은 늘 트리 안에서만(C2.random — 자세 추천 하나로 몸 쪽을 채운다).
   지시문은 lib/prompt-sam.js 가 짓는다. 고른 값은 이 기기에만(samguk_studio_v1). 말은 전부 lib/words.js. */
(function () {
  'use strict';
  var W = window.W, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var V2 = document.body.getAttribute('data-studio') === 'v2';   /* 프롬프트 v2(prompt2.html) — 구조판 화풍 anime_kv, 세계 그림만, 따로 저장(2026-11-05) */
  var STORE = V2 ? 'samguk_studio_v2' : 'samguk_studio_v1', IMG = window.AtelierImg, P = window.AtelierPrompt, T = window.AtelierSpec, C1 = window.AtelierCasualTree, C2 = window.AtelierCasualTreeV2;
  var FIXED = { overall_intensity: 'strong', skin_exposure: 'bold' };
  var NOTES = ['scene', 'outfit', 'custom'];
  /* 일상컷 단계 — need 는 꼭 있어야 하는 칸(C2.REQUIRED). use·legs·expr 은 장면에 따라 보이거나 숨는다(steps()) */
  var CASUAL = ['world', 'era', 'place', 'weather', 'time', 'ofam', 'item', 'hair', 'preset', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze', 'expr', 'notes'];
  var WORLD = ['world', 'scene', 'pose', 'design', 'look', 'notes'];

  function readStore() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function writeStore(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) { /* 막힌 브라우저 — 이 화면에선 계속 쓴다 */ } }
  function q(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  function getJSON(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }

  var D = null, S = null, tree = null, tree2 = null, t = null, img = {}, saved = readStore();
  var st = { faction: '', card: '', out: 'world', world: '', style: '', scene: null, notes: {}, looks: {}, shots: {}, open: 'faction', unlock: {}, walked: {}, seen: {}, menu: false, tab: {}, casualN: 1 };
  var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  var mobile = function () { return !!(mq && mq.matches); };
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { render(); });
  var casual = function () { return st.out === 'casual'; };
  var card = function () { return P.card(D, st.card); };
  /* 세력 — 고른 장수의 세력, 아직 장수가 없으면 고른 세력 */
  var faction = function () { var c = card(); return c ? c.faction : P.factionOf(D, st.faction); };
  var w2 = function (k, fb) { var s = W(k); return s === k ? fb : s; };

  function blankScene() { return { treeV: 2, unlocked: [], axes: Object.assign({}, FIXED), aspect: '2:3' }; }
  var blank = function () { return ''; };
  function repair(sc) { var n = C2.repair(t, sc, null, blank); n.unlocked = (sc.unlocked || []).filter(function (k) { return n[k]; }); n.axes = Object.assign({}, FIXED, n.axes || {}); n.aspect = '2:3'; return n; }

  function boot() {
    $('status').textContent = W('studio.loading');
    Promise.all([getJSON('data/sam-design.json'), getJSON('data/style.json'), getJSON('data/casual-tree.json'), getJSON('data/casual-tree-v2.json'), getJSON(IMG.DATA).catch(function () { return { img: {} }; })]).then(function (v) {
      D = v[0]; S = v[1]; tree = v[2]; tree2 = v[3]; img = v[4].img || {}; IMG.setShards(v[4]); IMG.setAdded(v[4]);
      t = C2.make(tree2, tree);
      st.style = V2 ? 'anime_kv' : S['default'];   /* v2 — 얼굴 애니 · 고광택 구조판(2026-11-05 「얼굴만 애니판으로 … v2에 넣어줘」), 앞 판 glossy_kv 는 기록으로 남는다 */   /* 화풍 고르개가 없다 — 늘 기본 화풍(저장된 옛 값을 따르면 기본을 바꿔도 이 기기에선 옛 화풍으로 짓는다, 2026-10-31) */
      var qc = q('card'); st.card = qc && P.card(D, qc) ? qc : (saved.card && P.card(D, saved.card) ? saved.card : '');
      st.faction = st.card ? card().faction.key : (P.factionOf(D, saved.faction) ? saved.faction : '');
      var qo = q('o') || saved.out; st.out = qo === 'casual' && !V2 ? 'casual' : 'world';
      st.world = q('world') || saved.world || '';
      st.notes = saved.notes || {}; st.looks = saved.looks || {}; st.shots = saved.shots || {}; st.walked = saved.walked || {}; st.casualN = +(saved.casualN || 1) || 1;
      loadScene();
      st.open = !st.card ? (st.faction ? 'card' : 'faction') : begin();
      $('status').textContent = '';
      render();
    }).catch(function (e) { $('status').textContent = W('studio.fail', { what: e.message }); });
  }
  /* 장면은 카드마다 저장 — 다른 카드로 가도 돌아오면 그대로 */
  function loadScene() { var all = saved.scenes || {}, sc = st.card && all[st.card] ? all[st.card] : null; st.scene = repair(Object.assign(blankScene(), sc || {})); }
  function save() {
    saved.faction = st.faction; saved.card = st.card; saved.out = st.out; saved.world = st.world; saved.style = st.style; saved.notes = st.notes; saved.looks = st.looks; saved.shots = st.shots; saved.walked = st.walked; saved.casualN = st.casualN;
    saved.scenes = saved.scenes || {}; if (st.card) saved.scenes[st.card] = st.scene;
    writeStore(saved);
    try { var u = new URLSearchParams(location.search); if (st.card) u.set('card', st.card); else u['delete']('card'); u.set('o', st.out); if (st.world) u.set('world', st.world); else u['delete']('world'); history.replaceState(null, '', location.pathname + '?' + u + location.hash); } catch (e) { /* 주소만 못 바꿨다 */ }
  }

  /* ── 단계 ── */
  function propSides(sc) { return C2.propSides(sc); }
  function faceHidden(sc) { var b = by(t.v2.body, sc.body), h = by(t.v2.head, sc.head); return !!(b && b.face_hidden && !(h && h.look_back)); }
  function legsOk(sc) { var f = C2.frame(t, sc.frame); return !!(f && f.legs); }
  function by(list, k) { for (var i = 0; i < (list || []).length; i++) if (list[i].key === k) return list[i]; return null; }
  function steps() {
    if (!st.card) return [];
    if (!casual()) return WORLD.slice();
    var sc = st.scene;
    return CASUAL.filter(function (k) {
      if (k === 'use') return propSides(sc) > 0;
      if (k === 'legs') return legsOk(sc);
      if (k === 'expr') return !faceHidden(sc);
      return true;
    });
  }
  function need(k) { if (k === 'world') return true; if (!casual()) return false; return C2.REQUIRED.indexOf(k) >= 0 || (k === 'use' && propSides(st.scene) > 0); }
  function has(k) {
    if (k === 'world') return !!st.world;
    if (k === 'notes') return NOTES.some(function (f) { return (noteVal(f) || '').trim(); });
    if (k === 'design') return !!st.looks[noteKey()];
    if (k === 'look') return paramCount() > 0;
    if (k === 'scene') { var sh = shotVal(); return !!(sh.scene || sh.time); }
    if (k === 'pose') { var sh2 = shotVal(); return !!(sh2.pose || sh2.expr || sh2.frame); }
    return !!st.scene[k];
  }
  function keysOf() { return steps(); }
  function firstOpen() { var ks = keysOf(); for (var i = 0; i < ks.length; i++) if (need(ks[i]) && !has(ks[i])) return ks[i]; return 'done'; }
  function begin() { var ks = keysOf(); return st.walked[st.out] || !ks.length ? firstOpen() : ks[0]; }
  function advance(key) {
    var ks = keysOf(), i = ks.indexOf(key);
    st.walked[st.out] = true;
    st.open = ks[i + 1] || 'done';
    var nd = firstOpen(); if (nd !== 'done' && ks.indexOf(nd) < i) st.open = nd;
  }
  function noteKey() { return st.card + '|' + (casual() ? 'casual' : st.world); }
  function noteVal(f) { return casual() ? (st.scene[f] || '') : ((st.notes[noteKey()] || {})[f] || ''); }
  function setNote(f, v) { if (casual()) { st.scene[f] = v; } else { var n = Object.assign({}, st.notes[noteKey()] || {}); n[f] = v; st.notes[noteKey()] = n; } }
  /* ── 장면·시간대·자세·표정(세계 그림) — 카드×세계마다(P.normShot 이 바로잡는다) ── */
  function shotVal() { return P.normShot(D, st.card, st.world, st.shots[noteKey()]); }
  function setShot(patch) { st.shots[noteKey()] = Object.assign({}, shotVal(), patch); }
  function sceneRows() { return P.scenesOf(card(), st.world); }
  /* ── 외형(세계 그림) — 카드×세계마다. 표는 lib/look-spec.js(T.PARAM_DEFS …), 설계표 look 은 P.lookOf ── */
  function lookVal() { return P.normLook(st.looks[noteKey()]); }
  function setLook(patch) { var l = Object.assign({}, lookVal(), patch); st.looks[noteKey()] = l; }
  function setParam(k, v) { var p = Object.assign({}, lookVal().params); if (v) p[k] = v; else { delete p[k]; delete p[k + '_custom']; } setLook({ params: p }); }
  function lookDefs() { return (T.PARAM_DEFS || []).filter(function (d) { return T.IDENTITY_GROUPS.indexOf(d.group) >= 0 && T.IDENTITY_EXCLUDED.indexOf(d.key) < 0; }); }
  function paramCount() { return Object.keys(lookVal().params).filter(function (k) { return !/_custom$/.test(k); }).length; }
  /* 설계가 쥔 항목 — 무작위가 비워 둔다(설계표 값이 채운다) */
  function designed(k) { var l = lookVal(); return (l.faceDesignOn && Object.keys(T.FACE_PARAM || {}).some(function (f) { return T.FACE_PARAM[f] === k; })) || (l.silhouetteOn && Object.keys(T.SIL_PARAM || {}).some(function (f) { return T.SIL_PARAM[f] === k; })); }
  function randomLook() { var p = {}; lookDefs().forEach(function (d) { if (designed(d.key)) return; var ch = d.options.filter(function (o) { return o[0] && o[0] !== '__custom__'; }); if (ch.length) p[d.key] = rnd(ch)[0]; }); setLook({ params: p }); }
  function lookKo(grp, k) { return w2('look.' + grp + '.' + k, k); }
  function vocabKo(axis, v) { return ((T.VOCAB_EN || {})[axis] || {})[v] || v; }

  /* ── 선택지 — [{v, ko, sub, group, tag, why, out}] ── */
  /* 세계 안 장소는 참고 그림 세계의 이름(객잔 · 선술집 · 정거장 바) — P.placeKo */
  function placeKo(k) { var p = C2.place(t, k); return p ? P.placeKo(p, st.world) : k; }
  function groupKo(g) { var r = C1 && C1.group ? C1.group(tree, g) : null; return r ? r.ko : g; }
  function frameKo(k) { return w2('frame.' + k, k); }
  function handKo(k) { if (k === 'prop') return W('studio.hand.prop'); var h = C2.hand(t, k); return h ? h.ko : k; }
  function useKo(k) { var u = C2.use(t, k); if (!u) return k; var p = C2.prop(t, u.prop); return (p ? p.ko : u.prop) + ' · ' + u.ko; }
  function exprKo(k) { var r = (T.EXPRESSION_OPTIONS || []).filter(function (x) { return x[0] === k; })[0]; return r ? r[1] : k; }
  function whyText(c) {
    if (!c) return '';
    var feat = c.feature ? w2('studio.feature.' + c.feature, c.feature) : '';
    return W('studio.why.' + (W('studio.why.' + c.code) === 'studio.why.' + c.code ? 'path' : c.code), { needs: (c.needs || []).map(function (n) { return ((t.v2.has || {})[n] || {}).ko || n; }).join(' · '), feature: feat, gaze: c.gaze || '' });
  }
  function universe(key) {
    var sc = st.scene;
    switch (key) {
      case 'era': return t.v1.eras.map(function (e) { return { v: e.key, ko: e.ko, sub: e.en }; });
      case 'place': return C2.allPlaces(t).map(function (p) { return { v: p.key, ko: P.placeKo(p, st.world), sub: P.placeEn(p, st.world), group: p.group }; });
      case 'weather': return [{ v: '', ko: W('studio.auto.weather') }].concat((t.v2.weather || []).map(function (x) { return { v: x.key, ko: x.ko }; }));
      case 'ofam': { var req = (tree.required || {}).outfits || []; return t.v1.outfits.map(function (o) { var aw = C2.awkward(t, o.key, sc.place); return { v: o.key, ko: o.ko + (req.indexOf(o.key) >= 0 ? W('studio.required.star') : '') + (aw.length ? ' ⚠' : ''), sub: aw.length ? W('studio.awkward', { what: aw.map(function (r) { return r.ko; }).join(' · ') }) : o.en }; }); }
      case 'item': { var f = C2.family(t, sc.ofam); return [{ v: '', ko: W('studio.auto.item') }].concat((f ? f.items : []).map(function (i) { return { v: i.key, ko: i.ko, sub: i.en }; })); }
      case 'preset': return [{ v: '', ko: W('studio.preset.none') }].concat(t.v2.presets.map(function (p) { return { v: p.key, ko: p.ko, group: p.frame, sub: [C2.posture(t, p.posture), C2.support(t, p.support)].filter(Boolean).map(function (x) { return x.ko; }).join(' · ') }; }));
      case 'posture': return t.v2.postures.map(function (x) { return { v: x.key, ko: x.ko, sub: x.en }; });
      case 'support': return t.v2.supports.map(function (x) { return { v: x.key, ko: x.ko, sub: x.en }; });
      case 'frame': return Object.keys(t.v2.frames).filter(function (k) { return k !== 'note'; }).map(function (k) { return { v: k, ko: frameKo(k), sub: t.v2.frames[k].en }; });
      case 'body': case 'head': case 'camera': case 'gaze': return t.v2[key].map(function (x) { return { v: x.key, ko: x.ko, sub: x.en }; });
      case 'right': case 'left': return [{ v: '', ko: W('studio.auto.hand') }].concat(t.v2.hands.map(function (h) { return { v: h.key, ko: h.ko, sub: (h.en || '').replace('{side}', key) }; }), [{ v: 'prop', ko: W('studio.hand.prop') }]);
      case 'use': return t.v2.prop_uses.map(function (u) { return { v: u.key, ko: useKo(u.key), sub: u.en, group: u.prop }; });
      case 'legs': return [{ v: '', ko: W('studio.legs.none') }].concat(t.v2.legs.map(function (x) { return { v: x.key, ko: x.ko, sub: x.en }; }));
      case 'expr': return [{ v: '', ko: W('studio.auto') }].concat(Object.keys(t.v2.expressions || {}).map(function (k) { return { v: k, ko: exprKo(k), sub: t.v2.expressions[k] }; }));
      case 'world': return P.worldsOf(D, st.card).map(function (k) { var fw = ((faction() || {}).worlds || {})[k] || {}; return { v: k, ko: W('world.' + k), sub: fw.ko }; });
      case 'scene': return [{ v: '', ko: W('studio.scene.auto'), sub: W('studio.scene.auto.sub') }].concat(sceneRows().map(function (r) { return { v: r.key, ko: r.ko, sub: r.en }; }));
      case 'pose': return [{ v: '', ko: W('studio.pose.auto'), sub: T.POSE_DEFAULT }].concat((T.WORLD_POSES || []).map(function (r) { return { v: r.key, ko: r.ko, sub: r.en }; }));
      case 'time': return [{ v: '', ko: W('studio.auto.weather') }].concat((T.CASUAL.times || []).map(function (r) { return { v: r.key, ko: r.ko, sub: r.en }; }));
      case 'hair': return [{ v: '', ko: W('studio.hair.keep'), sub: W('studio.hair.keep.sub') }].concat((T.CASUAL.hairs || []).map(function (r) { return { v: r.key, ko: r.ko, sub: r.en }; }));
    }
    return [];
  }
  /* 트리 안 선택지와 트리 밖(까닭 붙은) 선택지 */
  function split(key) {
    var all = universe(key), sc = st.scene, inn = [], out = [];
    if (!casual() || key === 'expr' || key === 'world' || key === 'time' || key === 'hair') return { inn: all, out: [] };
    if (key === 'preset') {
      var ok = {}; C2.presets(t, sc).forEach(function (p) { ok[p.key] = 1; });
      all.forEach(function (x) { if (!x.v || ok[x.v]) inn.push(x); else out.push(Object.assign({}, x, { why: W('studio.why.preset'), out: true })); });
      return { inn: inn, out: out };
    }
    all.forEach(function (x) {
      if (!x.v) { inn.push(x); return; }
      var c = C2.why(t, sc, key, x.v, null);
      if (c) out.push(Object.assign({}, x, { why: whyText(c), out: true })); else inn.push(x);
    });
    return { inn: inn, out: out };
  }
  function shown(key) {
    var sc = st.scene, v = sc[key];
    if (key === 'world') return st.world ? W('world.' + st.world) : '—';
    if (key === 'scene') { var sh = shotVal(), rows = [], scn = sh.scene && sceneRows().filter(function (r) { return r.key === sh.scene; })[0], tm = sh.time && (T.WORLD_TIMES || []).filter(function (r) { return r.key === sh.time; })[0]; if (scn) rows.push(scn.ko); if (tm) rows.push(tm.ko); return rows.length ? rows.join(' · ') : W('studio.scene.auto'); }
    if (key === 'pose') { var sh3 = shotVal(), rows3 = [], po = sh3.pose && (T.WORLD_POSES || []).filter(function (r) { return r.key === sh3.pose; })[0]; if (po) rows3.push(po.ko); if (sh3.expr) rows3.push(exprKo(sh3.expr).split(' — ').pop()); var mf3 = sh3.frame && ((T.SILHOUETTES || {})[st.world] || []).filter(function (r) { return r.key === sh3.frame; })[0]; if (mf3) rows3.push(mf3.ko); return rows3.length ? rows3.join(' · ') : W('studio.pose.auto'); }
    if (key === 'time' && casual()) { var ct = (T.CASUAL.times || []).filter(function (r) { return r.key === v; })[0]; return ct ? ct.ko : W('studio.auto'); }
    if (key === 'hair' && casual()) { var ch = (T.CASUAL.hairs || []).filter(function (r) { return r.key === v; })[0]; return ch ? ch.ko : W('studio.hair.keep'); }
    if (key === 'design') { var l = lookVal(); return [l.silhouetteOn ? W('studio.design.sil') : W('studio.design.sil.off'), l.faceDesignOn ? W('studio.design.face') : W('studio.design.face.off'), W('studio.exposure.' + (l.exposure || 'auto'))].join(' · '); }
    if (key === 'look') { var n = paramCount(); return n ? W('studio.look.n', { n: n }) : W('studio.look.design'); }
    if (key === 'notes') {
      var n = NOTES.filter(function (f) { return (noteVal(f) || '').trim(); }).length, parts = [];
      if (n) parts.push(W('studio.notes.n', { n: n }));
      if (casual()) (T.LOCAL_AXES || []).forEach(function (ax) { var cv = (sc.axes || {})[ax]; if (cv && cv !== FIXED[ax]) parts.push((T.ADVANCED_LABELS[ax] || [])[1] + ' ' + ((T.ADV_VAL[ax] || {})[cv] || cv)); });
      return parts.length ? parts.join(' · ') : W('studio.none');
    }
    if (!v) return W('studio.auto');
    switch (key) {
      case 'era': { var e = C2.era(t, v); return e ? e.ko : v; }
      case 'place': return placeKo(v);
      case 'weather': return (by(t.v2.weather, v) || {}).ko || v;
      case 'ofam': { var f = C2.family(t, v); return f ? f.ko : v; }
      case 'item': { var i = C2.item(t, sc.ofam, v); return i ? i.ko : v; }
      case 'preset': { var p = C2.preset(t, v); return p ? p.ko : v; }
      case 'posture': return (C2.posture(t, v) || {}).ko || v;
      case 'support': return (C2.support(t, v) || {}).ko || v;
      case 'frame': return frameKo(v);
      case 'body': case 'head': case 'camera': case 'gaze': return (by(t.v2[key], v) || {}).ko || v;
      case 'right': case 'left': return handKo(v);
      case 'use': return useKo(v);
      case 'legs': return (C2.leg(t, v) || {}).ko || v;
      case 'expr': return exprKo(v);
    }
    return v;
  }
  var unl = function (k) { return C2.unlocked(st.scene, k); };

  /* ── 고르기 ── */
  function choose(key, v, out) {
    if (key === 'world') { st.world = v; advance(key); save(); render(); return; }
    if (!casual() && (key === 'scene' || key === 'pose')) { var sp = {}; sp[key] = v; setShot(sp); advance(key); save(); render(); return; }
    var sc = Object.assign({}, st.scene), un = (sc.unlocked || []).filter(function (k) { return k !== key; });
    if (out && v) un.push(key); sc.unlocked = un;
    if (key === 'preset') { sc = v ? C2.applyPreset(t, sc, v) : Object.assign(sc, { preset: '' }); sc = repair(sc); }
    else if (key === 'expr' || key === 'time' || key === 'hair') { sc[key] = v; }
    else sc = repair(C2.set(t, sc, key, v, null, blank));
    st.scene = sc;
    /* 추천을 고르면 몸 쪽이 다 찼다 — 손·다리 뒤의 시선으로 */
    if (key === 'preset' && v) { st.walked[st.out] = true; var ks = keysOf(); st.open = ks.indexOf('gaze') >= 0 ? 'gaze' : 'notes'; var nd = firstOpen(); if (nd !== 'done' && ks.indexOf(nd) < ks.indexOf(st.open)) st.open = nd; }
    else advance(key);
    save(); render();
  }
  function rnd(list) { return list[Math.floor(Math.random() * list.length)]; }
  function randomOne(key) {
    if (key === 'world') { var ws = P.worldsOf(D, st.card).filter(function (k) { return k !== st.world; }); if (ws.length) choose('world', rnd(ws)); return; }
    var opts = split(key).inn.map(function (x) { return x.v; }).filter(function (v) { return v && v !== st.scene[key]; });
    if (!opts.length) return;
    choose(key, rnd(opts));
  }
  /* 여기부터 다 랜덤 — 앞 칸·해방 칸은 잠그고 C2.random(몸 쪽은 자세 추천 하나). 표정은 80% */
  function randomFrom(key, all) {
    if (!casual()) {
      if (key === 'world' || all) { var ws = P.worldsOf(D, st.card); st.world = rnd(ws); }
      if (all || key === 'scene') { var scs = sceneRows(), tms = T.WORLD_TIMES || []; setShot({ scene: scs.length && Math.random() < 0.75 ? rnd(scs).key : '', time: tms.length && Math.random() < 0.6 ? rnd(tms).key : '' }); }
      if (all || key === 'pose') { var pos = T.WORLD_POSES || [], exs = Object.keys(T.EXPRESSION_DETAIL || {}); setShot({ pose: pos.length && Math.random() < 0.7 ? rnd(pos).key : '', expr: exs.length && Math.random() < 0.7 ? rnd(exs) : '' }); }
      if (all || key === 'look') randomLook();
      st.walked[st.out] = true; st.open = 'done'; save(); render(); return;
    }
    var ks = keysOf(), i = Math.max(0, ks.indexOf(key)), sc = Object.assign({}, st.scene);
    var locks = (sc.unlocked || []).slice();
    if (!all) { randomOne(key); return; }
    if (key === 'world' || !st.world) st.world = rnd(P.worldsOf(D, st.card));
    ks.slice(0, i).forEach(function (k) { if (k !== 'preset' && k !== 'notes' && sc[k]) locks.push(k); });
    ['era', 'place', 'ofam', 'item', 'weather', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze', 'expr', 'preset'].forEach(function (k) { if (ks.indexOf(k) >= 0 && ks.indexOf(k) >= i && !unl(sc, k)) { if (k !== 'preset') delete sc[k]; } });
    sc = C2.random(t, sc, null, Math.random, locks, {});
    if (locks.indexOf('weather') < 0 && ks.indexOf('weather') >= i) { var wl = (t.v2.weather || []).map(function (x) { return x.key; }); sc.weather = Math.random() < 0.5 && wl.length ? rnd(wl) : ''; }
    if (locks.indexOf('expr') < 0 && ks.indexOf('expr') >= i) { var ex = Object.keys(t.v2.expressions || {}); sc.expr = ex.length && Math.random() < 0.8 ? rnd(ex) : ''; }
    st.scene = repair(sc); st.walked[st.out] = true; st.open = 'done';
    var nd = firstOpen(); if (nd !== 'done') st.open = nd;
    save(); render();
  }
  /* 여기부터 다시 — 뒤 칸을 다 비운다. all 이면 이 칸도 */
  function restartFrom(key, all) {
    var ks = keysOf(), i = ks.indexOf(key), later = ks.slice(all ? i : i + 1), n = 0;
    if (i < 0) return;
    if (casual()) {
      var sc = Object.assign({}, st.scene);
      if (later.indexOf('world') >= 0 && st.world) { n++; st.world = ''; }
      later.forEach(function (k) { if (k === 'notes') { NOTES.forEach(function (f) { if ((sc[f] || '').trim()) n++; sc[f] = ''; }); return; } if (sc[k]) n++; delete sc[k]; });
      if (later.indexOf('preset') >= 0 || later.indexOf('posture') >= 0) { sc.preset = ''; delete sc.kind; }
      sc.unlocked = (sc.unlocked || []).filter(function (k) { return later.indexOf(k) < 0; });
      st.scene = repair(sc);
    } else {
      if (later.indexOf('world') >= 0 && st.world) { n++; st.world = ''; }
      if (st.shots[noteKey()]) { var shx = shotVal(); if (later.indexOf('scene') >= 0) { n += (shx.scene ? 1 : 0) + (shx.time ? 1 : 0); setShot({ scene: '', time: '' }); } if (later.indexOf('pose') >= 0) { n += (shx.pose ? 1 : 0) + (shx.expr ? 1 : 0) + (shx.frame ? 1 : 0); setShot({ pose: '', expr: '', frame: '' }); } }
      if ((later.indexOf('design') >= 0 || later.indexOf('look') >= 0) && st.looks[noteKey()]) { n += later.indexOf('design') >= 0 ? 1 : 0; n += later.indexOf('look') >= 0 ? paramCount() : 0; if (later.indexOf('design') >= 0) delete st.looks[noteKey()]; else setLook({ params: {} }); }
      if (later.indexOf('notes') >= 0) { var nn = st.notes[noteKey()] || {}; NOTES.forEach(function (f) { if ((nn[f] || '').trim()) n++; }); delete st.notes[noteKey()]; }
    }
    st.seen[st.out] = false;
    if (all) { st.walked[st.out] = false; st.unlock = {}; }
    st.open = key; st.menu = false;
    save(); render();
    $('status').textContent = all ? W('studio.status.reset', { n: n }) : n ? W('studio.status.restart', { n: n }) : W('studio.status.restart.none');
  }
  function resetAll() { var ks = keysOf(); if (ks.length) restartFrom(ks[0], true); }

  /* ── 지시문 ── */
  function prompt() {
    if (!D || !st.card) return '';
    try {
      if (!casual()) return st.world ? P.build(D, S, st.card, st.world, { style: st.style, notes: st.notes[noteKey()] || {}, look: lookVal(), shot: shotVal() }) : '';
      if (firstOpen() !== 'done') return '';
      return P.buildCasual(D, S, st.card, st.scene, { world: st.world, style: st.style, tree: tree, tree2: tree2 });
    } catch (e) { return '(' + e.message + ')'; }
  }
  function fileName() { if (!st.world) return ''; return casual() ? P.casualFile(st.card, st.world, st.style, st.casualN) : P.fileName(st.card, st.world, st.style); }
  function recordJSON() { return casual() ? P.casualRecord(D, S, st.card, st.scene, { world: st.world, style: st.style, tree: tree, tree2: tree2 }, st.casualN) : P.record(D, S, st.card, st.world, { style: st.style, notes: st.notes[noteKey()] || {}, look: lookVal(), shot: shotVal() }); }
  /* 그 세계 몫(세계 그림 + 그 그림을 참고한 일상컷들) */
  function worldBucket() { var e = img[st.card]; if (!e) return null; var b = IMG.styleMap(e)[st.style]; if (!b) return null; return IMG.formMap(b)[st.world] || null; }
  function artFile() {
    var f = worldBucket(); if (!f) return null;
    if (casual()) return IMG.cuts(f, 'casual', 'f')[st.casualN - 1] || null;
    return f.f || null;
  }
  /* 일상컷의 참고 그림 — 그 세계 그림. 등록돼 있으면 파일, 아니면 null(있어야 할 이름은 fileName 으로) */
  function refFile() { var f = casual() && worldBucket(); return f && f.f || null; }
  function refHTML() {
    if (!casual() || !st.world) return '';
    var f = refFile(), name = P.fileName(st.card, st.world, st.style);
    return '<p class="ref' + (f ? '' : ' none') + '"><span>' + W('studio.ref') + '</span>' + (f ? '<img src="' + esc(IMG.thumbURL(f)) + '" alt="" onerror="this.onerror=null;this.src=\'' + esc(IMG.imgURL(f)) + '\'">' : '') + esc(name) + (f ? '' : ' · ' + esc(W('studio.ref.none'))) + '</p>';
  }
  function words(s) { return (s.match(/\S+/g) || []).length; }

  /* ── 그리기 ── */
  var shortLabel = function (v) { v = String(v == null ? '' : v); var i = v.indexOf(' — '); return mobile() && i > 0 ? v.slice(i + 3) : v; };
  function chip(key, ko, val, mark) { return '<button type="button" class="hchip' + (st.open === key ? ' on' : '') + '" data-open="' + key + '">' + (val === '—' ? esc(ko) : '<small>' + esc(ko) + '</small> ' + esc(shortLabel(val))) + (mark ? ' <span class="lock">🔓</span>' : '') + '</button>'; }
  function chipNext(key, ko) { return mobile() ? '<span class="hchip next" data-next-chip="' + key + '" aria-hidden="true"><small>' + esc(ko) + '</small> ▸</span>' : ''; }
  function crumbs(head, n) {
    return '<div class="hpath">' + head.map(function (c, i) { return (i ? '<i>›</i>' : '') + '<button type="button" class="hcrumb' + (st.open === c[0] ? ' on' : '') + '" data-open="' + c[0] + '" title="' + esc(c[1]) + '">' + esc(c[2] === '—' ? c[1] : c[2]) + '</button>'; }).join('') + (n ? '<span class="n">' + n + '</span>' : '') + '</div>';
  }
  function cardLabel(c) { return c ? c.ko : '—'; }
  function factionLabel(f) { return f ? f.hanja + ' ' + f.ko : '—'; }
  function chipsHTML() {
    var c = card(), head = [['faction', W('studio.head.faction'), factionLabel(faction())]];
    var wrap = function (hc, sc, n) { if (!mobile()) return hc.map(function (x) { return chip(x[0], x[1], x[2]); }).concat(sc).join(''); return crumbs(hc, n) + (sc.length ? '<div class="hrail">' + sc.join('') + '</div>' : ''); };
    if (!c) { if (faction()) head.push(['card', W('studio.head.card'), '—']); return wrap(head, []); }
    head.push(['card', W('studio.head.card'), cardLabel(c)]);
    head.push(['out', W('studio.head.out'), W('studio.out.' + st.out)]);
    var ks = keysOf(), at = st.open === 'done' ? ks.length : ks.indexOf(st.open), seen = st.seen[st.out], out = [];
    var n = ks.length && at >= 0 ? Math.min(at + 1, ks.length) + '/' + ks.length : '';
    ks.forEach(function (k, idx) {
      if (!seen && at < 0) return;
      if (!seen && idx > at && !has(k)) { if (idx === at + 1) out.push(chipNext(k, W('studio.step.' + k))); return; }
      out.push(chip(k, W('studio.step.' + k), shown(k), casual() && unl(k)));
    });
    return wrap(head, out, n);
  }
  function optButtons(list, cur, tabKey) {
    var groups = {}, order = [];
    list.forEach(function (x) { var g = x.group || ''; if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(x); });
    var gko = function (g) { return tabKey === 'preset' ? frameKo(g) : tabKey === 'use' ? ((C2.prop(t, g) || {}).ko || g) : groupKo(g); };
    var tabs = '', show = order;
    if (mobile() && tabKey && order.length > 1) {
      var tb = st.tab[tabKey] || ''; if (tb && !groups[tb]) tb = '';
      show = tb ? [tb] : order;
      tabs = '<div class="gtabs" role="tablist">' + [['', W('studio.all'), list.length]].concat(order.map(function (g) { return [g, gko(g) || g, groups[g].length]; })).map(function (r) {
        return '<button type="button" class="gtab' + (r[0] === tb ? ' on' : '') + '" role="tab" aria-selected="' + (r[0] === tb) + '" data-gtab="' + esc(r[0]) + '" data-gtab-key="' + esc(tabKey) + '">' + esc(r[1]) + ' <i>' + r[2] + '</i></button>';
      }).join('') + '</div>';
    }
    return tabs + show.map(function (g) {
      var head = g && order.length > 1 ? '<h4>' + esc(gko(g) || g) + '</h4>' : '';
      return head + '<div class="opts">' + groups[g].map(function (x) {
        var tail = x.why ? '<span class="why">' + esc(x.why) + '</span>' : x.sub ? '<span>' + esc(x.sub) + '</span>' : '';
        return '<button type="button" class="opt' + (x.out ? ' out' : '') + '" data-pick="' + esc(x.v) + '"' + (x.out ? ' data-out="1"' : '') + ' aria-pressed="' + (String(cur || '') === String(x.v) ? 'true' : 'false') + '"><b>' + (x.out ? '🔓 ' : '') + esc(x.ko) + '</b>' + tail + '</button>';
      }).join('') + '</div>';
    }).join('');
  }
  function field(id, labelText, value) { return '<label class="axis" for="f-' + id + '">' + esc(labelText) + '<textarea id="f-' + id + '" data-note="' + id + '" rows="3">' + esc(value || '') + '</textarea></label>'; }
  function nextBtn(k) { if (mobile()) return ''; var ks = keysOf(), n = ks[ks.indexOf(k) + 1]; return '<p class="rand"><button type="button" class="btn" data-next="' + k + '">' + (n ? W('studio.next') : W('studio.done')) + '</button>' + (n ? skipBtn() + restartBtn(k) : '') + '</p>'; }
  function skipBtn() { return st.seen[st.out] && firstOpen() === 'done' && prompt() ? '<button type="button" class="btn" data-open="done">' + W('studio.todone') + '</button>' : ''; }
  function restartBtn(k) { var ks = keysOf(); return ks.indexOf(k) >= 0 && ks.indexOf(k) < ks.length - 1 ? '<button type="button" class="btn" data-restart="' + k + '" title="' + esc(W('studio.restart.title')) + '">' + W('studio.restart') + '</button>' : ''; }
  function resetBtn(short) { return keysOf().length ? '<button type="button" class="btn" data-reset="1" title="' + esc(W('studio.reset.title')) + '">' + W(short ? 'studio.reset.m' : 'studio.reset') + '</button>' : ''; }
  function randomBar(k) { if (mobile()) return ''; return '<span class="rand"><button type="button" class="btn" data-rand="' + k + '">' + W('studio.rand.one') + '</button><button type="button" class="btn" data-rand-all="' + k + '">' + W('studio.rand.from') + '</button>' + skipBtn() + restartBtn(k) + '</span>'; }
  function hresHTML() {
    var p = prompt(); if (!p) return '';
    var un = casual() ? (st.scene.unlocked || []) : [];
    return '<section class="hres"><div class="h"><b>' + W('studio.prompt') + '</b><small>' + W('studio.words', { n: words(p) }) + '</small></div><pre class="hres-text' + (st.outOpen ? ' open' : '') + '">' + esc(p) + '</pre>' +
      '<button type="button" class="more" data-act="more">' + (st.outOpen ? W('studio.less') : W('studio.more')) + '</button>' +
      (un.length ? '<p class="note">' + esc(W('studio.unlocked', { fields: un.map(function (k) { return W('studio.step.' + k); }).join(' · ') })) + '</p>' : '') +
      refHTML() + '<p class="file"><span>' + W('studio.file') + '</span>' + esc(fileName()) + '</p></section>';
  }
  function sheetHTML() {
    if (!st.sheet) return '';
    var isRec = st.sheet === 'record', x = isRec ? JSON.stringify(recordJSON(), null, 1) : prompt();
    return '<div class="pane" role="dialog" aria-modal="true" aria-label="' + esc(W(isRec ? 'studio.record' : 'studio.prompt')) + '"><div class="h"><b>' + W(isRec ? 'studio.record' : 'studio.prompt') + '</b><small>' + (isRec ? '' : W('studio.words', { n: words(x) })) + '</small>' +
      '<button type="button" class="btn ico" data-act="sheet-close" aria-label="' + esc(W('studio.close')) + '">✕</button></div><textarea readonly>' + esc(x) + '</textarea>' +
      '<p class="rand"><button type="button" class="btn pri" data-act="copy-sheet">' + W('studio.copy.m') + '</button>' + (isRec ? '' : '<button type="button" class="btn" data-act="record">' + W('studio.record') + '</button>') + '</p></div>';
  }
  function copyText(x, btn) {
    var done = function () { if (btn) { var was = btn.textContent; btn.textContent = W('studio.copied'); setTimeout(function () { btn.textContent = was; }, 1500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(x).then(done, function () { if (btn) btn.textContent = W('studio.copy.fail'); });
  }
  function factionPanel() {
    return '<h3>' + W('studio.panel.faction') + '</h3><p class="note">' + W('studio.panel.faction.note') + '</p><div class="opts">' + D.factions.map(function (f) { return '<button type="button" class="opt" data-faction="' + esc(f.key) + '" aria-pressed="' + (!!faction() && faction().key === f.key) + '"><b>' + esc(factionLabel(f)) + ' <i>' + P.cards(D, f.key).length + '</i></b><span>' + esc(f.persona) + '</span></button>'; }).join('') + '</div>';
  }
  /* 장수 — 그 세력의 장수를 역할 차례로. 손 설계(★)가 먼저 눈에 띄게 */
  function cardPanel() {
    var f = faction() || D.factions[0], html = '<h3>' + W('studio.panel.card') + '</h3><p class="note">' + W('studio.panel.card.note') + '</p>';
    var opt = function (g) { return '<button type="button" class="opt" data-card="' + esc(g.key) + '" aria-pressed="' + (st.card === g.key) + '"><b>' + (g.designed === 'hand' ? '★ ' : '') + esc(g.key) + '</b><span>' + esc(g.en || '') + '</span></button>'; };
    ['lord', 'general', 'strategist', 'official'].forEach(function (r) {
      var gs = (D.generals || []).filter(function (g) { return g.faction === f.key && g.role === r; });
      if (gs.length) html += '<h4>' + esc(D.roles[r].ko) + ' <i>' + gs.length + '</i></h4><div class="opts">' + gs.map(opt).join('') + '</div>';
    });
    return html;
  }
  function outPanel() {
    return '<h3>' + W('studio.panel.out') + '</h3><div class="opts">' + (V2 ? ['world'] : ['world', 'casual']).map(function (o) { return '<button type="button" class="opt" data-out="' + o + '" aria-pressed="' + (st.out === o) + '"><b>' + W('studio.out.' + o) + '</b><span>' + W('studio.out.' + o + '.note') + '</span></button>'; }).join('') + '</div>';
  }
  function donePanel() {
    var ks = keysOf();
    return (mobile() ? hresHTML() : '') + '<h3>' + W('studio.done') + '</h3><p class="note">' + esc(W('studio.note.done', { where: W(mobile() ? 'studio.note.done.m' : 'studio.note.done.pc') })) + (casual() ? ' ' + W('studio.note.fixed') : '') + '</p>' +
      (mobile() ? '' : '<span class="rand">' + (ks.length ? '<button type="button" class="btn" data-rand-all="' + ks[0] + '">' + W('studio.rand.all') + '</button>' : '') + resetBtn() + '</span>');
  }
  /* 설계 줄 — 실루엣·얼굴 싣기(설계표 look 의 값을 보여 준다) · 노출 */
  function designPanel() {
    var l = lookVal(), c = card(), dz = P.lookOf(c, st.world);
    var list = function (grp, box) { return Object.keys(box).filter(function (k) { return box[k]; }).map(function (k) { var pk = grp === 'face' ? (T.FACE_PARAM || {})[k] : (T.SIL_PARAM || {})[k]; return '<li>' + esc(lookKo(grp, k)) + ' · ' + esc(vocabKo(k, box[k])) + (pk && l.params[pk] ? ' — ' + esc(W('studio.design.over')) : '') + '</li>'; }).join(''); };
    var check = function (id, on, ko, grp, box) { return '<label class="unlock"><input type="checkbox" data-lookcheck="' + id + '"' + (on ? ' checked' : '') + '> ' + esc(ko) + '</label>' + (on ? '<ul class="design-list">' + list(grp, box) + '</ul>' : ''); };
    var why = (c.general.look || {}).why || '';
    return '<h3>' + W('studio.step.design') + '</h3><p class="note">' + esc(W('studio.note.design')) + (why ? '<br>' + esc(W('studio.design.why', { why: why })) : '') + '</p>' +
      check('sil', l.silhouetteOn, W('studio.design.sil.use'), 'sil', dz.silhouette) + check('face', l.faceDesignOn, W('studio.design.face.use'), 'face', dz.face) +
      '<label class="axis">' + esc(W('studio.exposure')) + '<select data-exposure="1">' + (T.EXPOSURE_KEYS || ['']).map(function (k) { return '<option value="' + esc(k) + '"' + (k === l.exposure ? ' selected' : '') + '>' + esc(W('studio.exposure.' + (k || 'auto'))) + '</option>'; }).join('') + '</select><small>' + esc(W('studio.exposure.help.' + (l.exposure || 'auto'))) + '</small></label>' + nextBtn('design');
  }
  /* 외형 — game 의 외형 선택지 네 묶음(기본·체형·얼굴·머리). 설계가 쥔 항목은 「자동」 이 설계표 값 */
  function lookPanel() {
    var l = lookVal(), defs = lookDefs(), groups = T.IDENTITY_GROUPS || [];
    var html = '<h3>' + W('studio.step.look') + '</h3><p class="note">' + esc(W('studio.note.look')) + '</p>' +
      '<p class="rand"><button type="button" class="btn" data-lookrand="1">' + W('studio.look.rand') + '</button><button type="button" class="btn" data-lookreset="1">' + W('studio.look.reset') + '</button></p>';
    groups.forEach(function (g, gi) {
      var open = st.grpOpen && st.grpOpen[g] != null ? st.grpOpen[g] : (gi === 0 && !mobile());
      html += '<details class="grp" data-grp="' + esc(g) + '"' + (open ? ' open' : '') + '><summary>' + esc(W('studio.look.group.' + g)) + '</summary><p class="note">' + esc((T.PARAM_GROUP_HELP || {})[g] || '') + '</p>' +
        defs.filter(function (d) { return d.group === g; }).map(function (d) {
          var v = l.params[d.key] || '', opts = d.options.slice(); if (v && !opts.some(function (o) { return o[0] === v; })) opts.push([v, v]);
          return '<label class="axis"><span class="lbl">' + esc(d.ko) + (designed(d.key) && !v ? ' <i class="dz" title="' + esc(W('studio.look.designed.title')) + '">' + esc(W('studio.look.designed')) + '</i>' : '') + '</span><select data-param="' + esc(d.key) + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' +
            (v === '__custom__' ? '<input type="text" data-pcustom="' + esc(d.key) + '" value="' + esc(l.params[d.key + '_custom'] || '') + '" placeholder="' + esc(W('studio.look.custom')) + '">' : '') + '</label>';
        }).join('') + '</details>';
    });
    return html + nextBtn('look');
  }
  /* 일상컷 두 축(전체 강도 · 피부 노출) — 기본은 고정값(가장 강함 · 많이), 여기서 바꾼다(사용자 2026-10-30 「세부 강도 설정이 빠졌네」). 말은 표(ADVANCED_LABELS · ADV_VAL · ADV_AXIS) */
  function axesHTML() {
    return (T.LOCAL_AXES || []).map(function (ax) {
      var cur = (st.scene.axes || {})[ax] || FIXED[ax], vals = (T.ADVANCED_OPTIONS[ax] || []).filter(function (o) { return o !== 'AUTO'; });
      return '<label class="axis"><span class="lbl">' + esc((T.ADVANCED_LABELS[ax] || [])[1] || ax) + (cur === FIXED[ax] ? ' <i class="dz">' + esc(W('studio.axis.fixed')) + '</i>' : '') + '</span><select data-axis="' + ax + '">' + vals.map(function (o) {
        return '<option value="' + o + '"' + (o === cur ? ' selected' : '') + '>' + esc((T.ADV_VAL[ax] || {})[o] || o) + '</option>'; }).join('') + '</select><small>' + esc((T.ADV_AXIS || {})[ax] || '') + '</small></label>';
    }).join('');
  }
  /* 세계 그림의 덧 고르개 — 장면 칸의 시간대, 자세 칸의 표정 */
  function shotSelect(k, ko, opts) {
    var cur = shotVal()[k];
    return '<label class="axis"><span class="lbl">' + esc(ko) + '</span><select data-shot="' + k + '"><option value="">' + esc(W('studio.auto')) + '</option>' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === cur ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
  }
  function stepPanel(k) {
    var note = w2('studio.note.' + k + (k === 'world' && casual() ? '.casual' : ''), '');
    if (k === 'design') return designPanel();
    if (k === 'look') return lookPanel();
    if (k === 'notes') {
      return '<h3>' + W('studio.step.notes') + '</h3><p class="note">' + W('studio.note.notes') + '</p>' + NOTES.map(function (f) { return field(f, W('studio.notes.' + f), noteVal(f)); }).join('') +
        (casual() ? axesHTML() + '<label class="axis">' + W('studio.casual.n') + '<select data-casualn="1">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<option value="' + i + '"' + (i === st.casualN ? ' selected' : '') + '>' + i + '</option>'; }).join('') + '</select></label>' : '') + nextBtn(k);
    }
    var sp = split(k), cur = k === 'world' ? st.world : (k === 'scene' || k === 'pose') && !casual() ? shotVal()[k] : st.scene[k], outs = st.unlock[k] ? sp.out : [], tabKey = (k === 'place' || k === 'preset' || k === 'use') ? k : '';
    var extra = !casual() && k === 'scene' ? shotSelect('time', W('studio.shot.time'), (T.WORLD_TIMES || []).map(function (r) { return [r.key, r.ko]; })) : !casual() && k === 'pose' ? shotSelect('expr', W('studio.shot.expr'), (T.EXPRESSION_OPTIONS || []).filter(function (o) { return o[0]; })) +
      ((T.SILHOUETTES || {})[st.world] ? shotSelect('frame', W('studio.shot.frame'), T.SILHOUETTES[st.world].map(function (r) { return [r.key, r.ko]; })) : '') : '';   /* 실루엣 — 고를 때만(2026-11-05 「옵션으로」 · 무협 · 판타지도) */
    var lens = k === 'frame' && st.scene.frame ? '<p class="note">' + esc(W('studio.lens', { lens: C2.lens(t, st.scene.frame) })) + '</p>' : '';
    var canUnlock = casual() && sp.out.length;
    if (mobile()) return '<h3>' + W('studio.step.' + k) + '</h3>' + (note ? '<p class="note">' + esc(note) + '</p>' : '') + lens + (outs.length ? '<p class="note">' + W('studio.unlock.note') + '</p>' : '') + optButtons(sp.inn.concat(outs), cur, tabKey) + extra;
    return '<h3>' + W('studio.step.' + k) + '</h3>' + (note ? '<p class="note">' + esc(note) + '</p>' : '') + lens + optButtons(sp.inn, cur, tabKey) + extra +
      '<div class="bar">' + (canUnlock ? '<label class="unlock"><input type="checkbox" id="unlock" ' + (st.unlock[k] ? 'checked' : '') + '> ' + esc(W('studio.unlock', { n: sp.out.length })) + '</label>' : '<span></span>') + randomBar(k) + '</div>' +
      (outs.length ? '<p class="note">' + W('studio.unlock.note') + '</p>' + optButtons(outs, cur) : '') + (need(k) && !has(k) ? '' : nextBtn(k));   // 꼭 있어야 하는 칸도 값이 있으면 「다음」 으로 지나갈 수 있다
  }
  function panelHTML() {
    var k = st.open;
    if (k === 'faction') return factionPanel();
    if (k === 'card' && faction()) return cardPanel();
    if (!card()) return faction() ? cardPanel() : factionPanel();
    if (k === 'card') return cardPanel();
    if (k === 'out') return outPanel();
    if (k === 'done') return donePanel();
    if (keysOf().indexOf(k) < 0) return donePanel();
    return stepPanel(k);
  }
  function hbarHTML() {
    if (!mobile() || !D) return '';
    var k = st.open, ks = keysOf(), i = ks.indexOf(k);
    if (k === 'done') return resetBtn(true) + (ks.length ? '<button type="button" class="btn" data-rand-all="' + ks[0] + '">' + W('studio.rand.all.m') + '</button>' : '') + '<button type="button" class="btn" data-act="record">' + W('studio.record.m') + '</button><button type="button" class="btn pri" data-act="copy">' + W('studio.copy.m') + '</button>';
    if (i < 0) return '';
    var last = i === ks.length - 1, isNotes = k === 'notes' || k === 'design' || k === 'look', nd = need(k);
    var right = isNotes ? '<button type="button" class="btn pri" data-next="' + k + '">' + (last ? W('studio.done') : W('studio.next.m')) + '</button>'
      : !nd || has(k) ? '<button type="button" class="btn pri" data-skip="' + k + '">' + (last ? W('studio.done') : (has(k) ? W('studio.next.m') : W('studio.skip.m'))) + '</button>'
      : (skipBtn() ? '<button type="button" class="btn pri" data-open="done">' + W('studio.todone') + '</button>' : '');
    var sp = !isNotes ? split(k) : { out: [] }, canUnlock = casual() && sp.out.length;
    var items = (!isNotes ? '<button type="button" class="btn" data-rand="' + k + '">' + W('studio.rand.one.m') + '</button><button type="button" class="btn" data-rand-all="' + k + '">' + W('studio.rand.from.m') + '</button>' : k === 'look' ? '<button type="button" class="btn" data-lookrand="1">' + W('studio.look.rand') + '</button>' : '') + skipBtn() + restartBtn(k);
    var menu = st.menu && items ? '<div class="hmenu" role="menu">' + items + '</div>' : '';
    var pt = prompt();
    return '<button type="button" class="btn ico" data-prev="' + k + '" aria-label="' + esc(W('studio.prev')) + '">‹</button>' +
      (pt ? '<button type="button" class="btn" data-act="sheet">' + esc(W('studio.sheet', { n: words(pt) })) + '</button>' : '') +
      (canUnlock ? '<label class="unlock"><input type="checkbox" id="unlock" ' + (st.unlock[k] ? 'checked' : '') + '><span>' + W('studio.unlock.short') + ' <i>(' + sp.out.length + ')</i></span></label>' : '') +
      (items ? '<button type="button" class="btn" data-menu="rand" aria-expanded="' + (st.menu ? 'true' : 'false') + '">' + W(isNotes ? 'studio.more.menu' : 'studio.rand.menu') + '</button>' : '') + right + menu;
  }
  function centerTabs() { [].forEach.call(document.querySelectorAll('#panel .gtabs'), function (tb) { var on = tb.querySelector('.gtab.on'); if (on) tb.scrollLeft = Math.max(0, on.offsetLeft - (tb.clientWidth - on.offsetWidth) / 2); }); }
  function renderOut() {
    var p = prompt(), f = artFile();
    $('out').hidden = !p; $('prompt').value = p; $('count').textContent = p ? W('studio.words', { n: words(p) }) : '';
    $('file-name').innerHTML = p ? '<span>' + W('studio.file') + '</span>' + esc(fileName()) : '';
    $('ref').innerHTML = p ? refHTML() : '';
    var un = casual() ? (st.scene.unlocked || []) : [];
    $('unlocked-note').textContent = un.length ? W('studio.unlocked', { fields: un.map(function (k) { return W('studio.step.' + k); }).join(' · ') }) : '';
    $('art-mini').innerHTML = f ? '<img src="' + esc(IMG.thumbURL(f)) + '" alt="" onerror="this.onerror=null;this.src=\'' + esc(IMG.imgURL(f)) + '\'"><small>' + W('studio.art') + '<br>' + esc(f) + '</small>' : '';
  }
  function render() {
    if (st.open === 'done') st.seen[st.out] = true;
    var was = st.shown; st.shown = st.open;
    if (was !== st.open) st.menu = false;
    $('chips').innerHTML = chipsHTML();
    $('panel').innerHTML = panelHTML();
    var hb = $('hbar'); hb.innerHTML = hbarHTML(); hb.hidden = !hb.innerHTML;
    var sh = $('hsheet'); if (!mobile()) st.sheet = ''; sh.innerHTML = sheetHTML(); sh.hidden = !sh.innerHTML; document.body.classList.toggle('sheet', !!sh.innerHTML);
    document.body.classList.toggle('help', !!st.help);
    var hb = $('help'); if (hb) hb.setAttribute('aria-expanded', st.help ? 'true' : 'false');
    if (!render.stuck) { render.stuck = 1; var sc = document.querySelector('.prompt-page .wrap'), ch = $('chips');   /* 붙는 줄 — 내려 읽기 시작하면 막을 깐다 */
      if (sc && ch) sc.addEventListener('scroll', function () { ch.classList.toggle('stuck', sc.scrollTop > 0 && ch.getBoundingClientRect().top <= sc.getBoundingClientRect().top + (parseFloat(getComputedStyle(sc).paddingTop) || 0) + 1); }, { passive: true }); }
    if (mobile()) {
      document.documentElement.style.setProperty('--hchips-h', $('chips').offsetHeight + 'px');
      var rail = $('chips').querySelector('.hrail') || $('chips'), on = rail.querySelector('.hchip.on');
      if (on) rail.scrollLeft = Math.max(0, on.offsetLeft - (rail.clientWidth - on.offsetWidth) / 2);
      centerTabs();
      var path = $('chips').querySelector('.hpath'), cr = path && path.querySelector('.hcrumb.on'); if (path) path.scrollLeft = cr ? Math.max(0, cr.offsetLeft - 24) : path.scrollWidth;
      if (was && was !== st.open) window.scrollTo({ top: Math.max(0, $('panel').getBoundingClientRect().top + window.scrollY - $('chips').offsetHeight - 8), behavior: 'auto' });
    } else if (was && was !== st.open && $('panel').getBoundingClientRect().top < 0) $('panel').scrollIntoView({ block: 'start' });
    renderOut();
  }

  /* ── 누름 ── */
  document.addEventListener('click', function (e) {
    if (e.target.id === 'hsheet') { st.sheet = ''; render(); return; }
    var b = e.target.closest('button,[data-open]'); if (!b) return;
    if (b.id === 'help') { st.help = !st.help; render(); return; }
    if (b.dataset.open) { st.open = b.dataset.open; st.sheet = ''; render(); return; }
    if (b.dataset.faction != null) { var f0 = b.dataset.faction; st.faction = f0; if (card() && card().faction.key !== f0) { st.card = ''; loadScene(); } st.open = 'card'; save(); render(); return; }
    if (b.dataset.card != null) { st.card = b.dataset.card; loadScene(); st.open = 'out'; save(); render(); return; }
    if (b.dataset.out) { st.out = b.dataset.out; st.open = begin(); save(); render(); return; }
    if (b.dataset.rand) { randomFrom(b.dataset.rand, false); return; }
    if (b.dataset.randAll) { randomFrom(b.dataset.randAll, true); return; }
    if (b.dataset.next) { advance(b.dataset.next); save(); render(); return; }
    if (b.dataset.skip) { advance(b.dataset.skip); save(); render(); return; }
    if (b.dataset.prev) { var pk = keysOf(), pi = pk.indexOf(b.dataset.prev); st.open = pi > 0 ? pk[pi - 1] : 'out'; render(); return; }
    if (b.dataset.restart) { restartFrom(b.dataset.restart); return; }
    if (b.dataset.reset) { resetAll(); return; }
    if (b.dataset.lookrand) { randomLook(); save(); render(); return; }
    if (b.dataset.lookreset) { setLook({ params: {} }); save(); render(); return; }
    if (b.dataset.gtab != null) { st.tab[b.dataset.gtabKey] = b.dataset.gtab; render(); return; }
    if (b.dataset.menu) { st.menu = !st.menu; var hb2 = $('hbar'); hb2.innerHTML = hbarHTML(); hb2.hidden = !hb2.innerHTML; return; }
    if (b.dataset.act === 'copy') { copyText($('prompt').value, b); return; }
    if (b.dataset.act === 'copy-sheet') { var ta = b.closest('.pane') && b.closest('.pane').querySelector('textarea'); copyText(ta ? ta.value : $('prompt').value, b); return; }
    if (b.dataset.act === 'record') { if (mobile()) { st.sheet = 'record'; render(); } else { $('record').click(); } return; }
    if (b.dataset.act === 'sheet') { st.sheet = 'prompt'; render(); return; }
    if (b.dataset.act === 'sheet-close') { st.sheet = ''; render(); return; }
    if (b.dataset.act === 'more') { st.outOpen = !st.outOpen; render(); return; }
    if (b.dataset.pick != null) { choose(st.open, b.dataset.pick, !!b.dataset.out); return; }
    if (b.id === 'copy') { copyText($('prompt').value, b); return; }
    if (b.id === 'record') { $('record-out').hidden = false; $('record-text').value = JSON.stringify(recordJSON(), null, 1); return; }
  });
  document.addEventListener('change', function (e) {
    var x = e.target;
    if (x.id === 'unlock') { st.unlock[st.open] = x.checked; render(); return; }
    if (x.dataset.casualn) { st.casualN = +x.value || 1; save(); renderOut(); $('chips').innerHTML = chipsHTML(); return; }
    if (x.dataset.param) { setParam(x.dataset.param, x.value); save(); render(); return; }
    if (x.dataset.lookcheck) { setLook(x.dataset.lookcheck === 'sil' ? { silhouetteOn: x.checked } : { faceDesignOn: x.checked }); save(); render(); return; }
    if (x.dataset.exposure) { setLook({ exposure: x.value }); save(); render(); return; }
    if (x.dataset.shot) { var shp = {}; shp[x.dataset.shot] = x.value; setShot(shp); save(); render(); return; }
    if (x.dataset.axis) { var ax = Object.assign({}, st.scene.axes); ax[x.dataset.axis] = x.value || FIXED[x.dataset.axis]; st.scene.axes = ax; save(); render(); return; }
  });
  document.addEventListener('toggle', function (e) { var d = e.target; if (d.dataset && d.dataset.grp && d.isConnected) { st.grpOpen = st.grpOpen || {}; st.grpOpen[d.dataset.grp] = d.open; } }, true);
  document.addEventListener('input', function (e) {
    var x = e.target;
    if (x.dataset.note) { setNote(x.dataset.note, x.value); save(); $('chips').innerHTML = chipsHTML(); renderOut(); }
    if (x.dataset.pcustom) { var pc = Object.assign({}, lookVal().params); pc[x.dataset.pcustom + '_custom'] = x.value; setLook({ params: pc }); save(); renderOut(); }
  });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { document.body.classList.toggle('kb', window.visualViewport.height < window.innerHeight - 150); });
  /* 검사(tests/screen.cjs)가 보는 곳 */
  window.AtelierStudio = { state: function () { return st; }, prompt: prompt, steps: keysOf, firstOpen: firstOpen };
  boot();
})();
