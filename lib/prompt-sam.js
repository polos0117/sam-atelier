/* 지시문 조립 — 표(lib/prompt-spec.js)와 설계표(data/sam-design.json)·화풍 판(data/style.json)으로 영어 지시문을 짓는다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierPrompt 하나만 붙인다 — 생성기 화면·검사·허브(공방 모음)가 같이 쓴다.
   원소 공방의 lib/prompt-element.js 를 옮겼다(2026-11-02) — 층(근본·가문주·주민)이 없고 장수 한 명이 한 카드다. 카드 열쇠는 장수 이름(게임 표 그대로, 예: 관우).

   build(D, S, card, world, opts) → 지시문 글. D 는 설계표, S 는 화풍 판(style.json), card 는 장수 열쇠, world 는 세계 열쇠(samguk · fantasy · mecha),
   opts 는 { style, notes: {scene, outfit, custom}, look: {params, faceDesignOn, silhouetteOn, exposure}, shot: {scene, time, pose, expr} } — 외형 표는 lib/look-spec.js(없으면 외형 줄을 안 싣는다).
   shot.scene 은 장수의 worlds.<세계>.scenes(없으면 세력의 것) 열쇠(비우면 세계 글의 장소), time 은 T.WORLD_TIMES, pose 는 T.WORLD_POSES(비우면 카드 자세), expr 은 T.EXPRESSION_DETAIL 의 열쇠.
   buildCasual(D, S, card, scene, opts) → 일상컷 지시문(트리 버전2). scene 은 생성기의 버전2 장면, opts 는 { world, style, tree, tree2 }(표 둘).
   casualFile(card, world, style, n) · casualRecord(D, S, card, scene, opts, n) 도 같이. */
(function (root) {
  'use strict';
  var T = root.AtelierSpec;
  var WORLD_KEYS = ['samguk', 'fantasy', 'mecha'];

  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (_, k) { return m[k] != null ? m[k] : ''; }); }
  function trim(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function general(D, key) { return (D.generals || []).filter(function (g) { return g.key === key; })[0] || null; }
  function factionOf(D, key) { return (D.factions || []).filter(function (f) { return f.key === key; })[0] || null; }

  /* 카드 열쇠(장수 이름) → {key, tier: 'general', general, faction, role, ko, en} */
  function card(D, key) {
    var g = general(D, key); if (!g) return null;
    var f = factionOf(D, g.faction), r = (D.roles || {})[g.role];
    if (!f || !r) return null;
    /* 군웅은 무리(camp)마다 세력색 · 메카 설계가 따로 — 없으면 세력 것(사용자 2026-11-05 「군웅들도 각각 세력색을」) */
    var camp = g.camp && (f.camps || []).filter(function (x) { return x.key === g.camp; })[0] || null;
    return { key: g.key, tier: 'general', general: g, faction: f, camp: camp, role: r, roleKey: g.role, ko: g.key, en: g.en || g.key };
  }
  /* 설계표(게임 표) 차례대로 모든 장수. faction 을 주면 그 세력만 */
  function cards(D, faction) { return (D.generals || []).filter(function (g) { return !faction || g.faction === faction; }).map(function (g) { return g.key; }); }
  /* 장수는 세 세계 다 산다 */
  function worldsOf(D, key) { return card(D, key) ? (((D.vocab || {}).worlds) || WORLD_KEYS).slice() : []; }

  /* 화풍 문장 — 판에 worlds.<세계> 덧줄이 있으면 세계 그림에 붙인다(kr_mmorpg 의 무협풍 · 천상풍, 2026-11-02) */
  function styleText(S, styleKey, slot, world) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    if (!st) return '';
    var v = (st.versions || []).filter(function (x) { return x.v === st.current; })[0] || (st.versions || [])[0] || {};
    var add = world && (slot || 'text') === 'text' && v.worlds && v.worlds[world];
    return (v[slot || 'text'] || '') + (typeof add === 'string' ? ' ' + add : '');
  }
  /* 판 전체(v2 의 lead · worlds.<세계>.costume · scene 을 조립기가 읽는다) */
  function styleRow(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    if (!st) return {};
    return (st.versions || []).filter(function (x) { return x.v === st.current; })[0] || (st.versions || [])[0] || {};
  }
  function styleVersion(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    return st ? st.current : '';
  }

  /* ══ 외형 ══ 설계표 장수 look(공통) ← look.worlds.<세계>(헤어·앞머리·얼굴형·눈 — 세계마다 다른 사람) + 생성기 외형 칸. 직접 고른 항목이 설계 묶음을 이긴다 */
  function lookOf(c, world) {
    var l = (c.general.look || {}), w = world && l.worlds && l.worlds[world] || {};
    return { face: Object.assign({}, l.face || {}, w.face || {}), silhouette: Object.assign({}, l.silhouette || {}, w.silhouette || {}) };
  }
  /* 열쇠 → 늘 같은 수(가문주 · 주민 외형 돌리기) */
  function hashKey(k) { var x = 0; for (var i = 0; i < String(k).length; i++) x = (x * 31 + String(k).charCodeAt(i)) % 100003; return x; }
  function en(axis, key) { return ((T.VOCAB_EN || {})[axis] || {})[key] || key || ''; }
  function isHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }
  /* 외형 칸 {열쇠: 값} → [[열쇠, 값]] — 외형 묶음(base·build·face·hair)의 값 있는 것만. 직접 입력(__custom__)은 그 글(열쇠_custom)로 */
  function identityParams(params) {
    var out = [];
    if (!T.PARAM_DEFS) return out;
    Object.keys(params || {}).forEach(function (k) {
      var d = T.PARAM_DEFS.filter(function (x) { return x.key === k; })[0], v = params[k];
      if (!d || T.IDENTITY_GROUPS.indexOf(d.group) < 0 || T.IDENTITY_EXCLUDED.indexOf(k) >= 0) return;
      if (v === '__custom__') v = trim(params[k + '_custom']);
      if (!v || v === 'AUTO') return;
      out.push([k, v]);
    });
    return out;
  }
  function chosenKeys(params) { var out = {}; identityParams(params).forEach(function (p) { out[p[0]] = 1; }); return out; }
  /* game 의 paramValues — 저장된 열쇠는 그대로, 풀이만 붙인다 */
  function paramValues(raw) {
    var out = raw.map(function (p) { return p.slice(); });
    var value = function (k) { var p = raw.filter(function (p) { return p[0] === k; })[0]; return p ? p[1] : ''; };
    var has = function (k) { return !!value(k); };
    out = out.map(function (p) {
      var guide = T.PARAM_GUIDES[p[0]] && T.PARAM_GUIDES[p[0]][p[1]];
      if (p[0] === 'hair length' && guide && T.HAIR_LENGTH_LIMITS[value('hairstyle')]) return [p[0], T.HAIR_LENGTH_LIMITS[value('hairstyle')][1]];
      if (p[0] === 'eye shape' && ((p[1] === 'large' && has('eye size')) || (p[1] !== 'large' && has('eye tilt'))) && T.EYE_CONTOURS[p[1]]) return [p[0], T.EYE_CONTOURS[p[1]]];
      if (T.COLOR_KEYS[p[0]] && isHex(p[1])) return [p[0], p[1].toUpperCase()];
      return [p[0], guide ? p[1] + ' — ' + guide[1] : p[1]];
    });
    if (has('body type')) out.push(['body scope', 'Body type sets the build; body details adjust within it. These describe anatomy beneath the costume, not costume volume.']);
    if (has('hairstyle')) out.push(['hair scope', 'Keep the cut and its fixed length; other hair settings adjust within it. Hair choices do not set ethnicity.']);
    if (T.FACE_KEYS.some(has)) out.push(['facial precedence', 'Explicit facial geometry controls the actual outline, above style, ethnicity or demeanor; shading and expression must not reshape it.']);
    if (has('facial character')) out.push(['demeanor scope', 'Facial character affects demeanor only; preserve age and geometry. Explicit scene expression takes priority.']);
    if (has('facial ethnicity')) out.push(['ethnicity scope', 'Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair. No stereotyped features.']);
    var right = value('eye color'), left = value('second eye color');
    out = out.filter(function (p) { return p[0] !== 'second eye color'; });
    if (left && left !== right) out.push(['heterochromia', 'Character-relative right eye is ' + (right || 'one chosen primary color, different from ' + left) + '; left eye is ' + left + '. Keep the sides; do not blend colors.']);
    else if (right) out.push(['eye color consistency', 'both eyes are ' + right]);
    return out;
  }
  /* 설계의 얼굴 여섯 → FACE 줄 항목. 직접 고른 묶음·끈 경우는 빠진다 */
  function faceItems(c, look, world) {
    look = look || {}; var f = lookOf(c, world).face, chosen = chosenKeys(look.params);
    if (look.faceDesignOn === false || !T.FACE_PARAM) return [];
    var base = Object.keys(T.FACE_PARAM).filter(function (k) { return f[k] && !chosen[T.FACE_PARAM[k]]; }).map(function (k) { return [k, en(k, f[k])]; });
    if (!designedFace(f)) return base.map(function (p) { return p[1]; });
    /* 얼굴 설계(2026-11-01) — 인상이 먼저, 피부 · 윤곽 · 눈(크기 · 꼬리 · 모양) · 눈썹 · 코 · 입 · 눈 색 · 표식 */
    var FD = T.FACE_DESIGN, d = function (k) { return f[k] && FD[k][f[k]] && !chosen[FD.param[k]] ? FD[k][f[k]] : ''; }, get = function (k) { var p = base.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : ''; };
    var eyes = [d('eye_size'), get('eyes')].filter(Boolean).join(' — ') + (d('eye_tilt') ? ', ' + d('eye_tilt') : '');
    var imp = d('impression');
    return [imp ? 'first impression — ' + imp : '', d('skin_tone'), get('face_shape'), eyes, get('brows'), get('nose'), get('lips'), get('eye_color'), d('mark')].filter(function (x) { return x && x !== ', '; });
  }
  function designedFace(f) { return !!(T.FACE_DESIGN && f && f.impression && T.FACE_DESIGN.impression[f.impression]); }
  /* 설계의 실루엣 셋 → SILHOUETTE 줄 항목 */
  function silhouetteItems(c, look, world) {
    look = look || {}; var s = lookOf(c, world).silhouette, chosen = chosenKeys(look.params), out = [];
    if (look.silhouetteOn === false || !T.SIL_PARAM) return out;
    if (s.body && !chosen[T.SIL_PARAM.body]) out.push(en('body', s.body) + ' build');
    if (s.hair && !chosen[T.SIL_PARAM.hair]) out.push(en('hair', s.hair) + (s.bangs && T.FACE_DESIGN && T.FACE_DESIGN.bangs[s.bangs] && !chosen.bangs ? ' with ' + T.FACE_DESIGN.bangs[s.bangs] : ''));
    if (s.hair_color && !chosen[T.SIL_PARAM.hair_color]) out.push(en('hair_color', s.hair_color));
    return out;
  }
  /* 그 장수 체형 글(세계 그림 SILHOUETTE 의 첫 칸과 같은 말) — GPT 세션 일상컷의 몸 볼륨(tools/prompt-pack.cjs). 기준 판(kv)은 SILHOUETTE 줄이 없어 여기서 */
  function bodyText(D, key, world) { var c = card(D, key); if (!c) return ''; var s = lookOf(c, world).silhouette; return s.body ? en('body', s.body) + ' build' : ''; }
  function ageLine(look, f) {
    var v = ((look || {}).params || {})['apparent age'];
    if (v === '__custom__') v = trim((look.params || {})['apparent age_custom']);
    /* 설계표 나이감(2026-11-01) — 모두에게 같은 「soft full cheeks · soft smile」 줄이 얼굴을 하나로 만들었다 */
    if ((!v || v === 'AUTO') && f && f.age && T.FACE_DESIGN && T.FACE_DESIGN.age[f.age]) return T.FACE_DESIGN.age[f.age];
    if (!v || v === 'AUTO') v = T.AGE_DEFAULT;
    return T.AGE_LINES ? (T.AGE_LINES[v] || ('AGE: ' + v + '.')) : '';
  }
  /* 노출 — 비우면 싣지 않는다. 과감은 세계에 제 문장이 있으면 그것(판타지·스팀펑크 — 2026-10-30), 없으면 겉옷 꼴로 공용 문장(EXPOSURE_LAYER) */
  function hash32(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  /* 메카 과감 노출 — 네 곳 가운데 장수 · 세계마다 정해진 두 곳(2026-11-08 「랜덤적으로 몇 군데만」). 열쇠 해시라 같은 장수는 늘 같은 곳 */
  function exposureOpenOf(W, key, world) {
    if (!W || !W.exposureOpen || !key) return null;
    var n = W.exposureOpenN || 2, order = W.exposureOpen.map(function (o) { return o.key; });
    var pick = W.exposureOpen.slice().sort(function (a, b) { return hash32(key + '|' + world + '|' + a.key) - hash32(key + '|' + world + '|' + b.key); }).slice(0, n);
    return pick.sort(function (a, b) { return order.indexOf(a.key) - order.indexOf(b.key); });
  }
  /* 「가슴 · 골반은 가린다」 가 세게 먹어 노출을 덮었다(사용자 2026-11-08 「중요부위 가리는걸로 수정」) — 외형 표(game 그대로 옮긴 look-spec)의 글도 나갈 때 바꾼다 */
  function intimate(t) { return String(t || '').replace(/Chest and pelvis covered/g, 'Intimate areas covered').replace(/chest and pelvis covered/g, 'intimate areas covered'); }
  function exposureLine(look, world, key) { return intimate(exposureLine0(look, world, key)); }
  function exposureLine0(look, world, key) {
    var e = T.EXPOSURE && T.EXPOSURE[(look || {}).exposure];
    if (!e) return '';
    if (typeof e === 'string') return e;
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0];
    var op = (look || {}).exposure === 'bold' ? exposureOpenOf(W, key, world) : null;
    if (op && W.exposureOpenTpl) return fill(W.exposureOpenTpl, { open: op.map(function (o) { return o.en; }).join(', and ') });
    if (W && W.exposureBold) return W.exposureBold;
    return e[T.EXPOSURE_LAYER[world]] || e.open;
  }
  /* 생성기·허브가 저장한 외형 칸을 바로잡는다 — 모르는 열쇠는 버리고, 노출은 아는 값만 */
  function normLook(raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var out = { params: {}, faceDesignOn: raw.faceDesignOn !== false, silhouetteOn: raw.silhouetteOn !== false, exposure: T.EXPOSURE_DEFAULT || '' };
    if (T.EXPOSURE_KEYS && T.EXPOSURE_KEYS.indexOf(raw.exposure) >= 0) out.exposure = raw.exposure;
    var p = raw.params && typeof raw.params === 'object' ? raw.params : {};
    Object.keys(p).forEach(function (k) {
      var base = k.replace(/_custom$/, ''), d = (T.PARAM_DEFS || []).filter(function (x) { return x.key === base; })[0];
      if (d && typeof p[k] === 'string' && p[k]) out.params[k] = p[k];
    });
    return out;
  }

  /* 그 장수·세계의 장면 변주 — 장수가 세계 글을 덮어썼으면 장수의 scenes, 아니면 세력의 */
  function scenesOf(c, world) {
    var gw = ((c.general.worlds) || {})[world], fw = (c.faction.worlds || {})[world] || {};
    return ((gw && gw.scenes) || fw.scenes || []).slice();
  }
  function byKey(list, k) { return (list || []).filter(function (r) { return r.key === k; })[0] || null; }
  /* 실루엣 — 고른 값, 안 고르면 장수 설계값(worlds.<세계>.sil — tools/sil-spread.py 가 고르게 나눴다, 사용자 2026-11-06 「장수마다 고르게 분배하자」), 'free' 면 없음 */
  function silOf(c, world, shot) {
    var f = trim((shot || {}).frame), L = (T.SILHOUETTES || {})[world];
    if (f === 'free') return null;
    return byKey(L, f) || byKey(L, trim((((c && c.general || {}).worlds || {})[world] || {}).sil));
  }
  /* 세계 그림 칸(장면·시간대·자세·표정)을 바로잡는다 — 모르는 열쇠는 비운다 */
  function normShot(D, key, world, raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var c = card(D, key), out = { scene: '', time: '', pose: '', expr: '', frame: '' };
    if (c && byKey(scenesOf(c, world), raw.scene)) out.scene = raw.scene;
    if (byKey(T.WORLD_TIMES, raw.time)) out.time = raw.time;
    if (byKey(T.WORLD_POSES, raw.pose)) out.pose = raw.pose;
    if (T.EXPRESSION_DETAIL && T.EXPRESSION_DETAIL[raw.expr]) out.expr = raw.expr;
    if (raw.frame === 'free' || byKey((T.SILHOUETTES || {})[world], raw.frame)) out.frame = raw.frame;   /* 실루엣 — 세계마다 제 갈래(메카 · 무협 · 판타지, 2026-11-05) · 'free' 는 실루엣 없이 */
    return out;
  }

  /* 그 장수의 성정 한 줄 — 손 설계(traits.en)가 있으면 그것, 없으면 능력치에서(90 이상이 먼저, 없으면 가장 높은 것) */
  function traitsOf(c, world) {
    var g = c.general, t = trim((g.traits || {}).en), add = trim((((g.worlds || {})[world] || {}).traits || {}).en);
    if (t) return add ? t + ', ' + add : t;
    var st = g.stats || {}, keys = ['lead', 'war', 'int', 'pol'], out = [];
    keys.filter(function (k) { return st[k] >= 90; }).sort(function (a, b) { return st[b] - st[a]; }).forEach(function (k) { out.push(T.STAT_TRAITS[k].top); });
    if (!out.length) { var top = keys.slice().sort(function (a, b) { return (st[b] || 0) - (st[a] || 0); })[0]; out.push(T.STAT_TRAITS[top].mid); }
    return out.join(', ');
  }
  /* 손에 드는 그 장수의 물건 — 설계표 hold.en, 없으면 역할의 기본 물건 */
  function holdOf(c) { return trim((c.general.hold || {}).en) || trim((c.role.hold || {}).en); }
  /* world 를 주면 그 세계 몫 — 성정 덧줄(장수 worlds.<세계>.traits) · 세력 한자는 삼국시대만 · 글자 규칙 */
  function vars(c, world) {
    var g = c.general, f = c.faction, r = c.role;
    var m = { name_en: c.en, name_ko: g.key, role_en: r.en, faction_en: f.en, hanja: f.hanja, seal: g.seal || f.hanja, hold: holdOf(c),
      traits: traitsOf(c, world), palette: trim((g.palette || {}).en) || trim(((c.camp || {}).palette || {}).en) || trim((f.palette || {}).en),   /* 장수 몫 색(초선 연핑크, 2026-11-05)이 무리 · 세력 색을 이긴다 */ hanja_paren: !world || world === 'samguk' ? ' (' + f.hanja + ')' : '' };
    m.title = trim((g.title || {}).en) ? ' — ' + trim(g.title.en) : '';
    m.chars = world && world !== 'samguk' ? T.CHARS.none : fill(g.seal && g.seal !== f.hanja ? T.CHARS.two : T.CHARS.one, m);   /* 판타지 · 메카 일상컷에 關 · 蜀 이 걸렸다(2026-11-02) */
    m.text_rule = fill(T.TEXT_RULE[world] || T.TEXT_RULE.samguk, m);
    return m;
  }

  /* ══ 구조판(v2, 2026-11-05 — 화풍 판의 format: structured, 프롬프트 v2 탭의 glossy_kv) ══
     원소 공방의 구조판(lib/prompt-element.js buildStructured)을 삼국지 꼴로 옮겼다. 공통 적용 규칙(rules) → 1절 작화(section1, 세계 몫 section1_worlds) → 2절 외형 → 3절 코디네이션 → 4절 장면, 칸 값은 [ ] 안.
     2절은 설계표 look 을 한글 표(T.STRUCT.ko)로, 없으면 영어 문구. 3절은 의상을 그림에 맡긴다 — 프레임 종류(역할 차림) · 세력 프레임 · 색 · 규칙 · 노출 · 고른 실루엣(메카)만.
     4절은 고른 자세 · 표정 · 시간대 · 장면 변주 · 덧붙임. 한글 낱말은 표(T.STRUCT)에만 */
  function structVer(S, styleKey) { var v = styleRow(S, styleKey); return v && v.format === 'structured' && v.section1 ? v : null; }
  var HEAD_RE = /^[A-Z][A-Z &\/-]*(?: \([^)]*\))?: /;
  function bare(s) { return trim(String(s || '').replace(HEAD_RE, '')); }
  function noDot(s) { return trim(s).replace(/[.;:]+$/, ''); }
  function batchim(w) { var ch = String(w || '').replace(/\s*\([^)]*\)\s*$/, '').slice(-1), code = ch.charCodeAt(0); if (/[0-9]/.test(ch)) return '0136780'.indexOf(ch) >= 0; return code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 > 0; }
  function joinOn(a, b, sep) { return trim(a) ? (trim(b) ? trim(a) + (sep || ' — ') + trim(b) : trim(a)) : trim(b); }
  function sectionText(title, names, vals, extra) {
    var H = T.STRUCT.heading, rows = names.map(function (n) { return H.indexOf(n) >= 0 ? n + ':' : n + ': [' + (vals[n] != null ? vals[n] : '') + ']'; });
    (extra || []).forEach(function (x) { if (trim(x[1])) rows.push(x[0] + ': [' + trim(x[1]) + ']'); });
    return title + '\n\n' + rows.join('\n\n');
  }
  function buildStruct(D, S, key, world, opts, sv, c) {
    var ST = T.STRUCT, FN = ST.f, F = ST.fixed, KO = ST.ko, Wd = ST.words, WS = ST.worlds[world] || {};
    var look = normLook(opts.look), shot = normShot(D, key, world, opts.shot), notes = opts.notes || {}, m = vars(c, world), g = c.general, L = lookOf(c, world);
    var f = look.faceDesignOn === false ? {} : L.face, sl = look.silhouetteOn === false ? {} : L.silhouette, FD = T.FACE_DESIGN || {};
    var d = function (axis, k) { return k ? ((KO[axis] || {})[k] || en(axis, k) || k) : ''; };
    var fd = function (axis, k) { return k ? ((KO[axis] || {})[k] || (FD[axis] && FD[axis][k]) || '') : ''; };
    var wrow = T.WORLDS.filter(function (w) { return w.key === world; })[0], wko = ((D.vocab || {}).world_ko || {})[world] || world;
    /* 2절 */
    var v2 = {}, imp = fd('impression', f.impression);
    v2[FN.concept] = fill(Wd.who, { faction: c.faction.ko, role: c.role.ko, name: g.key, en: c.en, lore: trim(g.lore), p: batchim(g.key) ? Wd.eul : Wd.reul }) + fill(Wd.world, { world: wko }) + (imp ? Wd.impression + imp : '');
    v2[FN.age] = Wd.adult + (f.age && KO.age[f.age] ? ', ' + KO.age[f.age] : '');
    v2[FN.faceSize] = F.faceSize;
    v2[FN.faceShape] = d('face_shape', f.face_shape) || F.noDesign;
    v2[FN.placement] = F.placement;
    var eyes = [fd('eye_size', f.eye_size), d('eyes', f.eyes), fd('eye_tilt', f.eye_tilt)].filter(Boolean).join(', ');
    v2[FN.eyes] = (eyes || F.noDesign) + (f.brows ? ', ' + d('brows', f.brows) : '');
    v2[FN.eyeColor] = d('eye_color', f.eye_color) || F.noDesign;
    v2[FN.pupil] = F.pupil;
    v2[FN.nose] = d('nose', f.nose) || F.noDesign;
    var mark = fd('mark', f.mark), lipMark = /lip|gloss/.test(f.mark || '');
    v2[FN.lips] = (d('lips', f.lips) || F.noDesign) + (mark && lipMark ? ', ' + mark : '');
    v2[FN.skin] = (fd('skin_tone', f.skin_tone) || F.noDesign) + (mark && !lipMark ? ', ' + mark : '');
    v2[FN.hairColor] = d('hair_color', sl.hair_color) || F.noDesign;
    v2[FN.hair] = sl.hair ? d('hair', sl.hair) + (sl.bangs && fd('bangs', sl.bangs) ? ', ' + fd('bangs', sl.bangs) : '') : F.noDesign;
    var B = ST.body[sl.body];
    ST.bodyKeys.forEach(function (k, i) { v2[k] = B ? B[i] : (i === 0 && sl.body ? en('body', sl.body) + ' build' : F.noDesign); });
    var rest2 = paramValues(identityParams(look.params)).map(function (p) { return p[0] + ': ' + p[1]; });
    /* 3절 — 의상은 그림이 정한다 */
    var gw = (g.worlds || {})[world] || {}, fw = (c.faction.worlds || {})[world] || {}, v3 = {};
    var costume = trim(gw.costume) || trim(((c.role.worlds || {})[world] || {}).en);
    v3[FN.design] = (WS.designHead || '') + F.design;
    var cp = c.camp || {};
    v3[FN.factionFrame] = world === 'mecha' ? noDot(trim(gw.design) || trim((cp.mecha || {}).design) || trim(fw.design)) || F.noDesign
      : (trim(cp.persona) ? joinOn(c.faction.ko + ' · ' + cp.ko, trim(cp.persona)) : joinOn(c.faction.ko, trim(c.faction.persona))) || F.noDesign;
    v3[FN.colors] = m.palette || F.noDesign;
    var mf = silOf(c, world, shot);
    /* 무협 · 판타지에서 실루엣을 고르면 역할 옷은 빼고 실루엣이 먼저 — 초선 시험(2026-11-05)에서 문관 장포가 실루엣을 덮었다. 메카의 프레임 종류는 기체 종류라 그대로 */
    v3[FN.frameKind] = mf && world !== 'mecha' ? fill(F.frameKindSil, { role: c.role.ko }) : noDot(costume) + (c.role.ko ? ' (' + c.role.ko + ')' : '');
    v3[FN.sil] = mf ? mf.kot + (world !== 'mecha' ? F.silFirst : '') : F.silFree;
    var silOn = mf && world !== 'mecha';   /* 실루엣을 고른 무협 · 판타지 — 규칙 · 노출은 옷 종류를 말하지 않는 판(장포 · 가운이 실루엣을 덮었다, 초선 2판) */
    v3[FN.traits] = (silOn ? F.traitsSil : '') + noDot(m.traits);   /* 실루엣이면 특징은 장신구 · 문양으로만 — 초선은 무희 · 비단, 조운은 은빛 갑옷이 옷으로 새었다(2026-11-05) */
    v3[FN.rules] = (silOn && WS.rulesSil) || WS.rules || '';
    v3[FN.expo] = look.exposure === T.EXPOSURE_DEFAULT ? ((silOn && WS.expoSil) || WS.expo || bare(exposureLine(look, world, key))) : (exposureLine(look, world, key) ? Wd.expoChosen + bare(exposureLine(look, world, key)) : F.noDesign);
    v3[FN.gear] = m.hold ? noDot(m.hold) + F.gearRule : F.noDesign;
    if (trim(notes.outfit)) v3[FN.design] = joinOn(v3[FN.design], trim(notes.outfit), ' · ');
    /* 4절 */
    var v4 = {}, po = byKey(T.WORLD_POSES, shot.pose);
    v4[FN.action] = po ? (KO.pose[po.key] || noDot(po.en)) : F.action;
    v4[FN.hands] = po ? F.handsPose : F.hands;
    var ek = shot.expr || (f.expr && T.EXPRESSION_DETAIL[f.expr] ? f.expr : '');
    v4[FN.expr] = (ek ? (KO.expr[ek] || noDot(T.EXPRESSION_DETAIL[ek])) : F.expr) + Wd.exprTail;
    v4[FN.gaze] = F.gaze; v4[FN.motion] = F.motion; v4[FN.frame] = F.frame; v4[FN.camera] = F.camera;
    var tm = byKey(T.WORLD_TIMES, shot.time);
    v4[FN.light] = tm ? (KO.time[tm.key] || noDot(bare(tm.en))) : WS.light || '';
    v4[FN.palette] = m.palette || F.noDesign;
    var bg = joinOn(trim(fw.ko), noDot(trim(gw.en) || trim(fw.en))), scn = byKey(scenesOf(c, world), shot.scene);
    if (scn) bg = joinOn(bg, Wd.scene + scn.ko + ' — ' + noDot(scn.en), ' · ');
    if (trim(notes.scene)) bg = joinOn(bg, Wd.note + trim(notes.scene), ' · ');
    v4[FN.background] = bg;
    v4[FN.effects] = F.effects;
    v4[FN.ban] = F.noFigure + ', ' + fill(WS.ban || '', m);
    var s1 = (silOn && sv.section1_sil && sv.section1_sil[world]) || (sv.section1_worlds && sv.section1_worlds[world]) || sv.section1;
    return [sv.rules, s1,
      sectionText(Wd.sec[0], ST.s2, v2, [[ST.extra.s2, rest2.join('; ')]]),
      sectionText(Wd.sec[1], ST.s3, v3),
      sectionText(Wd.sec[2], ST.s4, v4, [[ST.extra.s4, trim(notes.custom)]])].join('\n\n');
  }

  /* ══ 기준 판(format: kv, 2026-11-05 — docs/STYLE_LAB.md kv_kmmo_lock) ══ 영문 네 칸. 1절은 판 그대로, 2절은 설계표 look 을 한 세계(faceWorld) 값으로 세 세계 같게 —
     세계마다 얼굴 · 헤어가 다르면 이마가 다 드러난 메카가 따로 놀았다(맹획). 흔들리는 값(히메컷 · 울프컷 · 버튼 코 · 처진 눈 …)은 판의 swap 으로 바꿔 끼운다.
     3절은 역할의 세계 차림 + 세력(군웅은 무리) 색 · 메카 설계, 4절은 자세 · 장면 · 시간대 · 덧붙임. 글은 모두 판(data/style.json)에 */
  function denierFits(en) { var C = T.CASUAL; return !!(C.denierFit && new RegExp(C.denierFit, 'i').test(en || '') && !(C.denierSkip && new RegExp(C.denierSkip, 'i').test(en || ''))); }   /* 데니어가 닿는 옷 — 니트 · 얇은 천 · 타이츠 · 가죽 옷의 이너, 수영복 · 란제리는 빼고 */
  function colorFixed(en) { return !!(T.CASUAL.colorFixed && new RegExp(T.CASUAL.colorFixed, 'i').test(en || '')); }   /* 옷 이름에 색 · 무늬가 박힌 옷 — 옷 색 단계를 붙이지 않는다 */
  function glossDefault(S, styleKey) { return trim((styleRow(S, styleKey) || {}).casualSkin); }   /* 일상컷 피부 광택 — 화풍 기본(생성기 「피부 광택」 단계의 「화풍 기본」) */
  function kvVer(S, styleKey) { var v = styleRow(S, styleKey); return v && v.format === 'kv' && v.section1 ? v : null; }
  /* kv 판의 설계 외형 글 — 얼굴 목록 · 눈 색 · 피부색 · 인상(buildKv 2절과 일상컷 얼굴 줄이 같은 글을 쓴다, 2026-11-08) */
  function kvLook(c, kv) {
    var L = lookOf(c, kv.faceWorld || 'samguk'), f = L.face, FD = T.FACE_DESIGN || {}, SW = kv.swap || {};
    var pick = function (axis, k, fromFD) { if (!k) return ''; if (SW[axis] && SW[axis][k]) return SW[axis][k]; return fromFD ? ((FD[axis] || {})[k] || '') : en(axis, k); };
    return { face: [pick('face_shape', f.face_shape), pick('eyes', f.eyes), pick('eye_size', f.eye_size, 1), pick('eye_tilt', f.eye_tilt, 1), pick('brows', f.brows), pick('nose', f.nose), pick('lips', f.lips), pick('mark', f.mark, 1)].filter(Boolean).join(', '),
      eyes: pick('eye_color', f.eye_color), skin: pick('skin_tone', f.skin_tone, 1), impression: pick('impression', f.impression, 1) };
  }
  function buildKv(D, S, key, world, opts, kv, c) {
    var g = c.general, m = vars(c, world), look = normLook(opts.look), shot = normShot(D, key, world, opts.shot), notes = opts.notes || {};
    var L = lookOf(c, kv.faceWorld || 'samguk'), f = L.face, sl = L.silhouette, FD = T.FACE_DESIGN || {}, SW = kv.swap || {};
    var pick = function (axis, k, fromFD) { if (!k) return ''; if (SW[axis] && SW[axis][k]) return SW[axis][k]; return fromFD ? ((FD[axis] || {})[k] || '') : en(axis, k); };
    var face = [pick('face_shape', f.face_shape), pick('eyes', f.eyes), pick('eye_size', f.eye_size, 1), pick('eye_tilt', f.eye_tilt, 1), pick('brows', f.brows), pick('nose', f.nose), pick('lips', f.lips), pick('mark', f.mark, 1)].filter(Boolean).join(', ');
    var hc = pick('hair_color', sl.hair_color), HM = kv.hairMute;   /* 머리색만 저채도(v3, 사용자 「머리색만 채도를 낮게」) — 「vivid magenta」 같은 낱말이 1절 줄을 이겼다 */
    if (HM && hc) hc = HM.prefix + hc.replace(new RegExp(HM.drop, 'gi'), '');
    var hair = [hc, pick('hair', sl.hair), pick('bangs', sl.bangs, 1)].filter(Boolean).join(', ');
    var ek = shot.expr || (f.expr && T.EXPRESSION_DETAIL[f.expr] ? f.expr : '');
    var extra = paramValues(identityParams(look.params)).map(function (p) { return p[0] + ': ' + p[1]; });
    var s2 = fill(kv.s2, { NAME: String(c.en).toUpperCase(), name_en: c.en, name_ko: g.key, title: trim((g.title || {}).en) || c.role.en, traits: noDot(m.traits),
      age: f.age && FD.age && FD.age[f.age] ? kv.ageHead + bare(FD.age[f.age]) : '', face: face, impression: pick('impression', f.impression, 1), expr: ek ? noDot(T.EXPRESSION_DETAIL[ek]) : kv.exprDefault,
      skin: pick('skin_tone', f.skin_tone, 1), hair: hair, eyes: pick('eye_color', f.eye_color), body: en('body', sl.body) + (kv.bodyTail || ''), look_extra: extra.length ? kv.lookHead + extra.join('; ') + '.' : '' });
    var gw = (g.worlds || {})[world] || {}, fw = (c.faction.worlds || {})[world] || {};
    var cr = ((kv.costumeRole || {})[c.roleKey] || {})[world];   /* v6 — 역할 × 세계 의상을 판의 긴 문장으로(장수 덮어쓰기가 먼저) */
    var costume = trim(gw.costume) || trim(cr) || trim(((c.role.worlds || {})[world] || {}).en);
    (kv.costumeSwap || []).forEach(function (r) { costume = costume.split(r[0]).join(r[1]); });
    var design = world === 'mecha' ? trim(gw.design) || trim(((c.camp || {}).mecha || {}).design) || trim(fw.design) : '';
    costume = noDot(costume) + (design ? fill(kv.mechaFrame, { design: noDot(design) }) : '.');
    var mf = silOf(c, world, shot);
    var ex = look.exposure && (kv.exposureAlways || look.exposure !== T.EXPOSURE_DEFAULT) ? exposureLine(look, world, key) : '';   /* v4 — 기본 노출(과감)도 싣는다. v1~v3 은 기본이면 뺐다(사용자 「볼륨감이랑 의상 노출정도」 가 옛 판보다 약했다) */
    var s3 = fill(kv.s3, { genre: (kv.genre || {})[world] || world, costume: costume, silhouette: mf ? fill(kv.silhouetteHead, { sil: noDot(mf.en) }) : '', palette: m.palette, traits: noDot(m.traits),
      hold: noDot(m.hold) + ((worldRow(world) || {}).sigForm ? ', ' + worldRow(world).sigForm : ''), exposure: ex ? ' ' + ex : '', outfit: trim(notes.outfit) ? kv.noteHead + trim(notes.outfit) : '' });
    var po = byKey(T.WORLD_POSES, shot.pose), scn = byKey(scenesOf(c, world), shot.scene) || scenesOf(c, world)[0], tm = byKey(T.WORLD_TIMES, shot.time);
    var bg = noDot(scn ? scn.en : (trim(gw.en) || trim(fw.en))) + (trim(notes.scene) ? '; ' + noDot(notes.scene) : '');
    var s4 = fill(kv.s4, { pose: po ? noDot(po.en) : kv.poseDefault, bg: bg, time: tm ? fill(kv.timeHead, { time: noDot(bare(tm.en)) }) : '', custom: trim(notes.custom) ? kv.noteHead + trim(notes.custom) : '' });
    var out = [fill(kv.head, { name_en: c.en }), kv.section1, s2, s3 + (kv.sectionGap ? '\n\n' : '\n') + s4].join('\n\n');
    (kv.outSwap || []).forEach(function (r) { out = out.split(r[0]).join(r[1]); });   /* 판이 다른 이름의 칸을 쓸 때 — 공용 줄 속 칸 이름을 바꿔 적는다(kv_jp_mobile, 2026-11-06) */
    return out;
  }

  function build(D, S, key, world, opts) {
    opts = opts || {};
    var c = card(D, key); if (!c) return '';
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0]; if (!W) return '';
    var sv = structVer(S, opts.style); if (sv) return buildStruct(D, S, key, world, opts, sv, c);
    var kv = kvVer(S, opts.style); if (kv) return buildKv(D, S, key, world, opts, kv, c);
    var look = normLook(opts.look), shot = normShot(D, key, world, opts.shot), m = vars(c, world);
    var lines = [];
    /* CONCEPT · TRAITS · 세력 */
    lines.push(fill(T.CONCEPT, m));
    /* 화풍이 lead 면 개념 줄 바로 뒤 — 지시문 가운데선 묻혔다(kr_mmorpg v1, 2026-11-02). 세계 몫 덧줄이 객체면 의상(costume) · 분위기(scene) 로 나눠 싣는다 */
    var srow = styleRow(S, opts.style), sw = srow.worlds && typeof srow.worlds[world] === 'object' ? srow.worlds[world] : {};
    var stx = styleText(S, opts.style, 'text', world); if (stx && srow.lead) lines.push('STYLE: ' + stx);
    lines.push(fill(T.TRAITS_HEAD, m) + m.traits + '.');
    lines.push(fill(T.FACTION_HEAD, m) + m.palette + '.');
    /* 외형 — 나이 · 실루엣 · 얼굴(설계표 look, 직접 고른 묶음은 빠진다) */
    var dzf = look.faceDesignOn === false ? {} : lookOf(c, world).face;
    var age = ageLine(look, dzf); if (age) lines.push(age);
    var sil = silhouetteItems(c, look, world); if (sil.length && T.LOOK_LINES) lines.push(fill(T.LOOK_LINES.silhouette, { items: sil.join('; ') }));
    var face = faceItems(c, look, world); if (face.length && T.LOOK_LINES) lines.push(fill(designedFace(dzf) ? T.FACE_DESIGN.head : T.LOOK_LINES.face, { items: face.join('; ') }));
    /* WORLD — 세력의 세계 글(장수가 덮어쓰면 그것) + 역할의 그 세계 차림. 메카는 세력 설계 문장 */
    var gw = ((c.general.worlds) || {})[world] || {}, fw = (c.faction.worlds || {})[world] || {};
    var wtext = trim(gw.en) || trim(fw.en), costume = trim(((c.role.worlds || {})[world] || {}).en);
    if (trim(gw.costume)) costume = trim(gw.costume);
    var design = world === 'mecha' ? trim(gw.design) || trim(((c.camp || {}).mecha || {}).design) || trim(fw.design) : '';
    lines.push(trim(W.head + wtext + (wtext ? '.' : '') + ' ' + fill(W.tail, { costume: costume }) + (design ? ' ' + fill(T.MECHA_FACTION, { design: design }) : '') + (sw.costume ? ' ' + sw.costume : '')));
    /* 실루엣(고른 때만) — 세계 글 바로 뒤, 큰 덩어리 모양만. 메카는 MECHA SILHOUETTE, 무협 · 판타지는 OUTFIT SILHOUETTE */
    var mf = silOf(c, world, shot); if (mf) lines.push(T.SILHOUETTE_HEAD[world] + mf.en + '. Only the overall shape is fixed; design the details freely.' + (world !== 'mecha' ? ' This silhouette overrides the overall shape of the role costume above.' : ''));
    /* 장면 변주 · 시간대 — 세계 글 뒤 */
    var scn = byKey(scenesOf(c, world), shot.scene); if (scn) lines.push(T.SCENE_HEAD + trim(scn.en) + '.');
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) lines.push(tm.en);
    if (sw.scene) lines.push(sw.scene);
    /* STYLE · 노출 */
    if (stx && !srow.lead) lines.push('STYLE: ' + stx);
    var ex = exposureLine(look, world, key); if (ex) lines.push(ex);
    /* 덧붙임 */
    var notes = opts.notes || {};
    T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) lines.push(f.head + v); });
    /* 출력(자세 자리) · 그 장수의 물건 · 표정 · 몸 · 직접 고른 외형 · 규칙 */
    var po = byKey(T.WORLD_POSES, shot.pose);
    lines.push(fill(T.OUTPUT, { pose: po ? po.en : T.POSE_DEFAULT }));
    if (m.hold) lines.push(fill(T.SIGNATURE, Object.assign({}, m, { sigForm: (worldRow(world) || {}).sigForm || 'in the form this WORLD gives it' })));   /* 판타지 · 메카는 그 세계의 물건으로(2026-11-08) */
    var ex2 = shot.expr || (dzf.expr && T.EXPRESSION_DETAIL[dzf.expr] ? dzf.expr : '');
    if (ex2) lines.push(T.EXPR_HEAD + T.EXPRESSION_DETAIL[ex2] + '.' + (T.EXPR_TAIL || ''));
    lines.push(T.BODY_LINE);
    var values = paramValues(identityParams(look.params)).filter(function (p) { return p[0] !== 'apparent age'; });
    if (values.length && T.LOOK_LINES) lines.push(T.LOOK_LINES.identity + '\n' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n') +
      (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; }) ? '\n' + T.LOOK_LINES.measurement : ''));
    lines.push.apply(lines, T.RULES.map(function (r) { return fill(r, m); }));
    var wt = srow.worldTail;   /* 판의 세계 그림 끝 칸(2026-11-08 kr_mmorpg v6 — 피부색 · 하이키 조명 · 카메라, 피부색은 설계값) */
    return lines.join('\n') + (wt ? '\n\n' + fill(wt, { skin: kvLook(c, srow).skin || 'her own skin tone', time: tm ? ' — ' + noDot(bare(tm.en)) : '' }) : '');
  }

  /* 올릴 파일 이름 — IMAGE_RULES.md 3절. 일상컷도 세계를 탄다(그 세계 그림이 참고 그림) */
  function fileName(key, world, styleKey, casualN) {
    return casualN ? fill(T.FILES.casual, { card: key, world: world, style: styleKey, n: casualN }) : fill(T.FILES.world, { card: key, world: world, style: styleKey });
  }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/<세계>.<화풍>-ui.json 에 둔다(화풍을 늘 붙인다 — 기본 화풍이 바뀌어도 이름이 안 헷갈리게, 2026-10-31) */
  function record(D, S, key, world, opts) {
    opts = opts || {};
    var styleKey = opts.style || (S && S['default']), c = card(D, key);
    return { atelier: 'samguk', card: key, faction: c ? c.general.faction : '', role: c ? c.general.role : '', world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      notes: opts.notes || {}, look: normLook(opts.look), design: c ? lookOf(c, world) : null, shot: normShot(D, key, world, opts.shot), file: fileName(key, world, styleKey), prompt: build(D, S, key, world, opts), date: new Date().toISOString().slice(0, 10) };
  }

  /* ══ 일상컷(트리 버전2) ══ game-atelier 의 buildCasualV2·casualDetailsV2 에서 왔다(2026-10-30, docs/CASUAL_TREE_V2.md 5절).
     표 둘(opts.tree = data/casual-tree.json, opts.tree2 = data/casual-tree-v2.json)과 공용 모듈 lib/casual-tree.js·casual-tree-v2.js 가 있어야 한다.
     장면(scene)은 생성기가 만든 버전2 장면 하나 — treeV 2 · era · place · weather · ofam · item · outfit(글) · ofeat · posture · support · frame · body · head ·
     camera · right · left · use · kind · legs · gaze · expr · axes · aspect · scene(장소·상황 글) · custom(추가 연출) · unlocked · preset.
     참고 그림은 그 장수의 세계 그림 하나(opts.world — samguk · fantasy · mecha) — 그 사람이 일상에 나온 한 장이라 INPUT·CHARACTER 가 「첨부 그림의 그 여자」 를 말하고
     화풍은 그 세계 그림의 화풍을 따른다(사용자 2026-10-30). 시대 열쇠는 표에서 읽고 여기 박지 않는다(now · nation · fantasy). */
  var SCENE_V2 = ['treeV', 'era', 'place', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'kind', 'legs', 'gaze',
    'weather', 'time', 'hair', 'gloss', 'color', 'denier', 'charm', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'unlocked', 'unlockedAuto'];   /* time·hair 는 원소 몫(2026-10-30) */
  function sceneV2(st) { var o = {}; SCENE_V2.forEach(function (k) { if (st && st[k] !== undefined) o[k] = st[k]; }); return o; }
  function quoted(v) { return trim(v).replace(/"/g, "'"); }

  /* 버전2 표정 — 표정 문장 속 시선 말을 뗀다(시선은 GAZE 줄 하나가 정한다) */
  var EXPR_GAZE = [[/,?\s*gaze slightly to the side/, ''], [/\bdirect (\w+) gaze\b/, '$1 eyes'], [/\bhard forward gaze\b/, 'hard eyes'],
    [/\bsoft distant gaze past the camera\b/, 'soft distant eyes'], [/\bgaze softened and directed slightly upward or away\b/, 'softened eyes'],
    [/\bgaze direct and unwarm\b/, 'eyes unwarm'], [/ fixed on one point/, ''], [/ looking away/, ''], [/,?\s*eyes off camera/, ''], [/\bgaze angled down and away,\s*/, '']];
  function exprNoGaze(text) { return EXPR_GAZE.reduce(function (t, r) { return t.replace(r[0], r[1]); }, String(text || '')); }

  /* 트리가 보는 「카드」 — 손에 드는 그 장수의 물건 하나(설계표 hold.en, 없으면 역할의 것). 출시 연도 칸은 없다 */
  /* 무기는 일상컷에서 손에 들지 않는다 — 그 무기를 본뜬 작은 장신구로 바꾼다(사용자 2026-11-02 「무기를 일상컷에선 들고 있는것보단 악세사리류로 대체」).
     부채 · 두루마리 · 인장 같은 무기 아닌 물건은 그대로 손에 든다. 세계 그림은 그대로 무기를 든다 */
  var WEAPON = /\b(?:broad)?(?:swords?|sabers?|sabres?|spears?|glaives?|guandaos?|halberds?|blades?|bows?|crossbows?|axes?|shields?|maces?|daggers?|whips?|whip-sword|clubs?|machetes?|chakrams?|cleavers?|tonfa|jian|three-section staff|fangtian ji)\b/i;
  function isWeapon(text) { return WEAPON.test(String(text || '')); }
  function casualHold(c) { var h = holdOf(c); return isWeapon(h) ? '' : h; }
  function casualCard(c) { var h = casualHold(c); return { key: c.key, signature: h ? [h] : [], signature_hold: h ? [0] : [] }; }
  function casualVars(c, world) { return vars(c, world); }
  /* 시대 줄 — 표의 시대 열쇠로 틀을 고른다. 세계 안(nation)은 참고 그림의 세계 글 — 장수가 덮어쓰면 그것, 아니면 세력의 것 */
  function casualEraLine(c, eraRow, m, world) {
    var CL = T.CASUAL, key = eraRow.key, tpl = CL.era[key];
    if (!tpl) return fill(CL.eraOther, { en: trim(eraRow.en) || key });
    var w = world || 'samguk', gw = ((c.general.worlds) || {})[w] || {}, fw = (c.faction.worlds || {})[w] || {};
    return fill(tpl, Object.assign({}, m, { world: trim(gw.en) || trim(fw.en) || 'its own recognisable places' }));
  }

  /* 장소 글 — 세계 몫이 있으면 그 세계의 것(사용자 2026-11-02 「일상컷 시대를 각 폼의 시대에 맞게」) */
  function placeEn(p, world) { var w = p && p.worlds && world && p.worlds[world]; return w && w.en ? w.en : p.en; }
  function placeKo(p, world) { var w = p && p.worlds && world && p.worlds[world]; return w && w.ko ? w.ko : p.ko; }

  /* 일상컷 표정 줄 뒤 — 눈 · 눈썹 · 입. 표정이 그 부분을 정하면 그 조각은 뺀다(윙크 · 관능은 눈, 호기심은 눈썹, 뷰파인더 컷은 눈) */
  function casualExprTail(expr, gazeKey) {
    var tl = T.CASUAL.exprTail, skip = T.CASUAL.exprTailSkip || {}; if (!tl) return '';
    var off = (skip[expr] || []).concat(skip[gazeKey] || []), parts = ['eyes', 'brows', 'lips'].filter(function (k) { return off.indexOf(k) < 0; }).map(function (k) { return tl[k]; });
    if (!parts.length) return '';
    var t = parts.join('; '); return ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '.';
  }

  /* 버전2 장면 → SCENE 줄들. 손·소품·받침의 관계는 PROP 한 줄에서만, 오른손·왼손은 인물 본인 기준 */
  function casualDetailsV2(sc, t, m) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, out = [], f = C.frame(t, sc.frame);
    var p = C.place(t, sc.place), fam = C.family(t, sc.ofam), it = C.item(t, sc.ofam, sc.item);
    var po = C.posture(t, sc.posture), su = C.support(t, sc.support), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var by = function (list, k) { return (list || []).filter(function (r) { return r.key === k; })[0]; };
    var body = by(t.v2.body, sc.body), head = by(t.v2.head, sc.head), cam = by(t.v2.camera, sc.camera);
    var bl = C.backLook(t, sc);   /* 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔(lib/casual-tree-v2.js) */
    var gaze = by(t.v2.gaze, sc.gaze || (u && u.gaze) || '');
    /* 세계 안 시대의 「그 세계의 자리」 장소는 WORLD 줄이 정한다 */
    /* 세계 안 장소는 참고 그림의 세계 글(장소 표 worlds.<세계> — 객잔 · 선술집 · 정거장 바, 2026-11-02) */
    if (p) out.push('Place: ' + (p.world_place ? CL.worldPlace : placeEn(p, m.world_key)));
    var wt = (t.v2.weather || []).filter(function (r) { return r.key === sc.weather; })[0];
    if (wt) out.push('Weather / season: ' + wt.en + '.');
    var tm = byKey(CL.times, sc.time); if (tm) out.push('Time of day: ' + tm.en + '.');
    var hr = byKey(CL.hairs, sc.hair); if (hr) out.push('Hair: ' + hr.en + '.');
    var specs = (sc.ofeat || []).indexOf('glasses') >= 0 ? CL.glasses : '';
    var oen = trim(sc.outfit) || (it && it.en) || (fam && fam.en) || '', col = colorFixed(oen) ? null : byKey(CL.colors, sc.color);   /* 옷 색(2026-11-08) — 옷 이름에 색 · 무늬가 박혔으면 그 색 */
    var dn = denierFits(oen) ? byKey(CL.deniers, sc.denier) : null;   /* 데니어(2026-11-08) — 맞는 옷에만, 노출 단계와 따로 */
    if (oen) out.push('Outfit: ' + oen + (col ? fill(CL.colorLine, { color: col.en }) : '') + (dn ? fill(CL.denierLine, dn) : '') + specs);
    if (po) out.push('POSTURE: ' + po.en + '.');
    if (su && su.en) out.push('SUPPORT: ' + su.en + '.');
    /* 몸이 옆모습이면 얼굴도 옆모습, 뒤 3/4 도 몸 표의 turned_face 를 붙인다 — 머리가 몸을 따를 때만. 카메라를 보면 눈만 */
    var bodyText = body && body.en + (body.profile_face && head && head.key === 'with_body' ? (gaze && gaze.key === 'camera' ? ', her face in profile too — only her eyes turn toward the camera' : ', her face in profile too, not turned toward the camera') : '')
      + (body.turned_face && head && head.key === 'with_body' ? ', ' + body.turned_face : '');
    out.push('COMPOSITION: ' + [(f && f.en) || sc.frame, bodyText, head && head.key !== 'with_body' && (bl ? bl.head : head.en), cam && cam.en].filter(Boolean).join('; ') + '.');
    var lens = C.lens(t, sc.frame);
    if (lens) out.push('Lens / perspective: ' + ((T.LENS_GUIDES[lens] || [])[1] || lens));
    var r = C.hand(t, sc.right), both = r && r.both && sc.right === sc.left;
    if (both) out.push('BOTH HANDS: ' + r.en + '.');
    else ['right', 'left'].forEach(function (side) {
      var k = sc[side], h = C.hand(t, k), text;
      if (k === 'prop') text = fill(CL.handBusy, { side: side });
      else if (h) text = h.en.replace('{side}', side) + (h.elbow ? ', her elbow ' + h.elbow : '');
      if (text) out.push(side.toUpperCase() + ' HAND: ' + text + (bl ? ' — ' + bl.where(side) : '') + '.');
    });
    if (bl && bl.arm && !both) out.push(bl.arm);
    if (u && pr) {
      var thing = pr.signature ? fill(CL.signatureProp, m) : pr.en, action = u.en.replace('{prop}', thing);
      var side = sc.right === 'prop' ? 'right' : 'left';
      out.push('PROP: ' + (u.hands === 'both' ? fill(CL.propBoth, { action: action, right: (u.grip || {}).right, left: (u.grip || {}).left }) : fill(CL.propOne, { side: side, action: action })) + '.');
      if (pr.signature && CL.signatureWhole) out.push(CL.signatureWhole);
    }
    var lg = C.leg(t, sc.legs);
    if (lg && f && f.legs) out.push('LEGS: ' + lg.en + '.');
    if (gaze) out.push('GAZE: ' + gaze.en + '.');
    /* 표정은 버전2 표(눈썹·눈꺼풀·입만), 없으면 표정 문장에서 시선 말을 뗀 것. 몸이 「뒤」 이고 고개를 안 돌리면 얼굴이 안 보여 싣지 않는다 */
    var faceHidden = body && body.face_hidden && !(head && head.look_back);
    if (trim(sc.expr) && !faceHidden) out.push('EXPRESSION: ' + ((t.v2.expressions || {})[sc.expr] || exprNoGaze(T.EXPRESSION_DETAIL[sc.expr] || sc.expr)) + '.' + (T.EXPR_TAIL || '') + casualExprTail(sc.expr, gaze && gaze.key));
    if (trim(sc.scene)) out.push('Scene note: ' + quoted(sc.scene));
    if (trim(sc.custom)) out.push('Note: ' + quoted(sc.custom));
    T.LOCAL_AXES.forEach(function (k) {
      var v = sc.axes && sc.axes[k];
      if (!v || v === 'AUTO' || (T.ADVANCED_OPTIONS[k] || []).indexOf(v) < 0) return;
      var closeGuide = f && f.close && T.CLOSE_AXIS_GUIDES[k] && T.CLOSE_AXIS_GUIDES[k][v];
      out.push(k + ': ' + v + ' — ' + (closeGuide || T.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }

  /* 고정값 — 두 축과 화면비는 비었거나 AUTO 면 고정값(IMAGE_RULES 일상컷 고정값). 손으로 고른 값은 그대로 */
  function casualFixed(scene) {
    var F = T.CASUAL_FIXED, axes = Object.assign({}, scene.axes || {});
    Object.keys(F.axes).forEach(function (k) { if (!axes[k] || axes[k] === 'AUTO') axes[k] = F.axes[k]; });
    return { axes: axes, aspect: T.ASPECT_FRAME[trim(scene.aspect)] ? trim(scene.aspect) : F.aspect };
  }

  /* 참고 그림의 세계 — 그 카드가 사는 세계여야 한다. 아니면 '' */
  function casualWorld(D, key, world) { return worldsOf(D, key).indexOf(world) >= 0 ? world : ''; }
  function worldRow(world) { return T.WORLDS.filter(function (w) { return w.key === world; })[0] || null; }

  /* 일상컷 지시문 — opts = { world, style, tree, tree2 }. world 는 참고 그림(그 카드의 세계 그림)의 세계 — 없거나 그 카드가 안 사는 세계면 ''. 차례는 game 의 buildCasualV2 와 같다:
     INPUT → CHARACTER → DESIGN → STYLE → AGE → OUTPUT → FRAME·CROP → 시대 줄 → (SCREENS) → SCENE (chosen) → WARDROBE → ANGLE → (LOOK-BACK) → ONE MAIN FIGURE → ANATOMY → BODY → HANDS */
  /* 일상컷 — 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03). 화풍 문장 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 그 말대로 다시 그렸다
     (헬륨 메카 일상 — 사용자 「일상컷 저거 너무 이상해」 → 이 세 줄로 「이제 좀 낫네」). STYLE 은 「첨부 그림 그대로」, FACE 줄을 넣고, 표정은 얼굴 안에서 살짝만 */
  /* 조명은 넘기지 않는다 — 장면의 자연광(LIGHT 줄, 2026-11-07 「조명 : 참고 그림 그대로 빼고 > 자연광」) */
  var REF_STYLE = "STYLE: keep the attached image's rendering exactly — the same finish, skin rendering, line weight, colour palette and saturation. Do not restyle her: no more realistic, no more painterly, no more 2D than the attached image. Only the outfit, pose, expression, framing and place change.";
  var REF_FACE = "FACE: exactly the face of the attached image — the same face shape, jawline, eye shape and size, nose, lips and their proportions, and the same skin rendering. Do not add skin texture, pores, harder nose or lip modelling, or any facial definition the attached image does not have. Keep the same face proportions — the same short midface (eyes to mouth) and the same face length-to-width ratio; the angle, bangs or a headpiece never make it look longer. From any camera angle or pose — low or high camera, chin resting on a hand, profile, looking back — keep the reference image's face shape, jaw length and face length-to-width ratio; perspective and pose must never lengthen her lower face or make her jaw look heavier than in the reference.";
  var REF_EXPR = ' Show it mildly, only with her brows, eyelids and mouth corners; her face shape and features stay exactly as in the attached image.';
  function refLock(text, keepStyle, faceTail) {
    var out = [], faced = false, RF = (keepStyle ? REF_FACE.replace(' Do not add skin texture, pores, harder nose or lip modelling, or any facial definition the attached image does not have.', '') : REF_FACE) + (faceTail ? ' ' + faceTail : '');   /* 화풍을 다시 적는 판은 피부결 금지 문장을 뺀다(그 화풍이 미세 결을 정한다) */
    String(text).split('\n\n').forEach(function (p) {
      if (/^STYLE: /.test(p)) { out.push(keepStyle ? p : REF_STYLE); return; }
      if (/^FINAL CHECK: /.test(p)) return;
      if (/^AGE: the same adult woman as in the attached image/.test(p)) { out.push(RF); faced = true; return; }
      out.push(p.replace(/^EXPRESSION: .*$/m, function (l) { return l.replace(/\s+$/, '') + REF_EXPR; }));
    });
    if (!faced) { var i = out.findIndex(function (p) { return /^CHARACTER: /.test(p); }); out.splice(i >= 0 ? i + 1 : 1, 0, RF); }
    return out.join('\n\n');
  }
  function buildCasualShort(S, opts, c, wr, t, sc, m, close, key) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, SH = CL.short, row = styleRow(S, opts.style);
    var st = trim((row.casualKit || {}).style) || styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text');
    st = st.replace(/\s*[—-]\s*the same rendering quality as the attached image\.?/i, '.').replace(/^STYLE:\s*/, '');
    var ex = SH.expose[((sc.axes || {}).skin_exposure) || 'bold'] || SH.expose.bold;
    var det = casualDetailsV2(sc, t, m).filter(function (l) { return !/^(?:overall_intensity|skin_exposure):/.test(l); }).map(function (l) {
      if (/^Outfit: /.test(l)) return l.replace(/\.?\s*$/, '') + ', ' + ex + ', ' + SH.body + '.';
      if (/^EXPRESSION: /.test(l)) { var i = l.indexOf('. '); return i > 0 ? l.slice(0, i + 1) : l; }
      return l;
    });
    var lines = [fill(SH.input, m), SH.face, 'Style: ' + st + ' ' + SH.keep];
    var wp = det.some(function (l) { return l.indexOf(CL.worldPlace) >= 0; }), era = C.era(t, sc.era);
    if (wp && era) lines.push(casualEraLine(c, era, m, wr.key));   /* 「그 세계의 자리」 장소일 때만 세계 글 */
    lines.push(det.join('\n'));
    if (close) lines.push('Framing: ' + T.CROP_EDGE[trim(sc.frame)] + '.');
    if (m.traits) lines.push(fill(SH.legend, m));
    if (isWeapon(m.hold)) {
      var forms = SH.charmForms, h = 2166136261, k = [key, wr.key, sc.place, sc.item, sc.frame].join('|');
      for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      lines.push(fill(SH.charm, Object.assign({}, m, { form: sc.charm && forms.indexOf(sc.charm) >= 0 ? sc.charm : forms[h % forms.length] })));   /* 장마다 다른 꼴(머리꽂이 고정이 아니게) */
    }
    lines.push(trim(row.casualLight) || SH.light, SH.end);
    return lines.join('\n\n');
  }
  function buildCasual(D, S, key, scene, opts) {
    opts = opts || {}; scene = scene || {};
    var C = root.AtelierCasualTreeV2, C1 = root.AtelierCasualTree, CL = T.CASUAL;
    if (!C || !C1 || !opts.tree || !opts.tree2) throw new Error('Casual tree v2 needs lib/casual-tree.js, lib/casual-tree-v2.js, data/casual-tree.json and data/casual-tree-v2.json');
    var c = card(D, key); if (!c) return '';
    var wr = worldRow(casualWorld(D, key, opts.world)); if (!wr) return '';
    var t = C.make(opts.tree2, opts.tree), g = casualCard(c), m = Object.assign(casualVars(c, wr.key), { world_key: wr.key, world_en: wr.en.charAt(0) + wr.en.slice(1).toLowerCase() }), fx = casualFixed(scene);
    var sc = C.repair(t, Object.assign(sceneV2(scene), { axes: fx.axes }), g), f = C.frame(t, sc.frame);
    var body = (t.v2.body || []).filter(function (r) { return r.key === sc.body; })[0] || {};
    var head = (t.v2.head || []).filter(function (r) { return r.key === sc.head; })[0] || {};
    var close = T.CLOSE_FRAMES.indexOf(trim(sc.frame)) >= 0, lines = [];
    /* 짧은 판(2026-11-08) — 판에 casualShort 가 있으면 화풍 단락 + 계획 칸 + 꼭 필요한 줄만(T.CASUAL.short) */
    if (styleRow(S, opts.style).casualShort) return buildCasualShort(S, opts, c, wr, t, sc, m, close, key);
    /* 자연판(기준 판 v7, 2026-11-06 — 사용자가 가져온 identity-preserve 일상컷 꼴): 편집 · 잠금 · 바꿀 것만. 계획 칸(장소 · 옷 · 자세 · 손 · 소품 · 구도 · 표정)은 같은 줄로, 강도 · 노출 축 줄은 뺀다 */
    var NAT = styleRow(S, opts.style).casualNatural;
    if (NAT) {
      var det = casualDetailsV2(sc, t, m).filter(function (l) { return !/^(?:overall_intensity|skin_exposure):/.test(l); });
      det = det.map(function (l) { return /^EXPRESSION: /.test(l) ? l.replace(/\s+$/, '') + REF_EXPR : l; });   /* 표정은 얼굴 안에서만 — 옛 판과 같은 꼬리 */
      var era0 = C.era(t, sc.era);
      return [NAT.head, NAT.lock, fill(NAT.change, m) + (isWeapon(m.hold) && CL.weaponCharm ? '\n' + fill(CL.weaponCharm, m) : ''),
        'SCENE:\n' + det.join('\n'),
        CL.faceLight || '',
        CL.bodyLine || '',
        (close ? fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }) + '\n' : '') + (era0 ? casualEraLine(c, era0, m, wr.key) + '\n' : '') + (C1.screens(t.v1, sc.place) ? fill(CL.screens, m) + '\n' : '') + NAT.comp].join('\n\n');
    }
    lines.push(fill(CL.input, m));
    lines.push(fill(CL.character.general, m));
    if (m.traits) lines.push(fill(CL.design, m));
    if (isWeapon(m.hold) && CL.weaponCharm) lines.push(fill(CL.weaponCharm, m));
    var st = (styleRow(S, opts.style).casualKit || {}).style || styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text'); lines.push('STYLE: ' + st);   /* 화풍 글이 없는 판(kv)도 이 자리 — refLock 이 「첨부 그림 그대로」 로 바꾼다 */
    lines.push(CL.age);
    lines.push(CL.output);
    lines.push(fill(CL.frame, { frame: T.ASPECT_FRAME[fx.aspect] }));
    if (close) lines.push(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }));
    var era = C.era(t, sc.era); if (era) lines.push(casualEraLine(c, era, m, wr.key));
    if (C1.screens(t.v1, sc.place)) lines.push(fill(CL.screens, m));
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, m).join('\n'));
    var KIT = styleRow(S, opts.style).casualKit, kl = KIT && c.general ? kvLook(c, styleRow(S, opts.style)) : null;   /* 판의 일상컷 묶음(2026-11-08 kv_cgi_hikey — 사용자 「skin,light는 바꿔주고, style은 지시문 쪽, 얼굴묘사는 … 원래 케릭터의 설계 외형으로. body line은 지금 공방 유지」) */
    var gl = byKey(CL.glosses, sc.gloss), csk = gl ? gl.en : styleRow(S, opts.style).casualSkin;
    if (KIT) { lines.push(fill(KIT.skin, { skin: kl ? kl.skin : 'her own skin tone' })); if (gl) lines.push(gl.en); lines.push(KIT.light); }   /* 피부색 칸 · 하이키 조명 — 고른 광택 단계는 그 뒤에 */
    else { if (csk) lines.push(csk); if (CL.faceLight) lines.push(CL.faceLight); }   /* 자연광 — 일상컷 공통(2026-11-06 얼굴 → 2026-11-07 몸까지) */
    if (CL.bodyLine) lines.push(CL.bodyLine);   /* 몸 라인 — 일상컷 공통(2026-11-07) */
    /* 기준 판 v5 — 일상컷에만 피부 광택(2026-11-06). 고른 단계(scene.gloss)가 있으면 그것, 없으면 화풍 기본 */
    lines.push(close ? CL.wardrobeClose : CL.wardrobe);
    lines.push(CL.angle);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back) lines.push(CL.lookBack);
    lines.push(fill(CL.figure, m), close ? CL.anatomyClose : CL.anatomy, CL.body, CL.hands);
    return refLock(lines.join('\n\n'), !!KIT, KIT && kl ? fill(KIT.face, kl) : '');
  }

  /* 올릴 파일 이름 — <카드>_<세계>_<화풍>_f_casual<n>.webp (IMAGE_RULES.md 3절). 세계는 참고 그림의 세계 */
  function casualFile(key, world, styleKey, n) { return fileName(key, world, styleKey, n || 1); }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/<세계>-casual<n>.<화풍>-ui.json. ref 는 참고 그림(그 세계 그림) 파일 이름. 장면은 다시 검사한 뒤의 값(생성기가 보인 것과 같다) */
  function casualRecord(D, S, key, scene, opts, n) {
    opts = opts || {}; n = n || 1;
    var styleKey = opts.style || (S && S['default']), c = card(D, key), C = root.AtelierCasualTreeV2, world = casualWorld(D, key, opts.world);
    var fx = casualFixed(scene || {}), sc = sceneV2(scene);
    sc.axes = fx.axes; sc.aspect = fx.aspect;
    if (C && opts.tree && opts.tree2) sc = Object.assign(C.repair(C.make(opts.tree2, opts.tree), sc, c ? casualCard(c) : null), { aspect: fx.aspect });
    return { atelier: 'samguk', card: key, faction: c ? c.general.faction : '', slot: 'casual' + n, treeV: 2, world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      ref: world ? fileName(key, world, styleKey) : '', scene: sc, file: world ? casualFile(key, world, styleKey, n) : '', prompt: buildCasual(D, S, key, scene, opts), date: new Date().toISOString().slice(0, 10) };
  }

  root.AtelierPrompt = { card: card, cards: cards, worldsOf: worldsOf, general: general, factionOf: factionOf,
    bodyText: bodyText, build: build, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion, traitsOf: traitsOf,
    lookOf: lookOf, normLook: normLook, scenesOf: scenesOf, normShot: normShot, silOf: silOf, glossDefault: glossDefault, colorFixed: colorFixed, denierFits: denierFits, exposureOpenOf: function (key, world) { return exposureOpenOf(T.WORLDS.filter(function (w) { return w.key === world; })[0], key, world); }, holdOf: holdOf, isWeapon: isWeapon, casualHold: casualHold, faceItems: faceItems, silhouetteItems: silhouetteItems, identityParams: identityParams, paramValues: paramValues, exposureLine: exposureLine,
    buildCasual: buildCasual, casualWorld: casualWorld, casualFile: casualFile, casualRecord: casualRecord, casualDetailsV2: casualDetailsV2, placeEn: placeEn, placeKo: placeKo, exprNoGaze: exprNoGaze, sceneV2: sceneV2, casualFixed: casualFixed };
})(typeof window !== 'undefined' ? window : globalThis);
