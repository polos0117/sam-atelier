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
  function faceItems(c, look, world, lg) {
    look = look || {}; var f = lookOf(c, world).face, chosen = chosenKeys(look.params);
    if (look.faceDesignOn === false || !T.FACE_PARAM) return [];
    var base = Object.keys(T.FACE_PARAM).filter(function (k) { return f[k] && !chosen[T.FACE_PARAM[k]]; }).map(function (k) { return [k, en(k, f[k])]; });
    if (!designedFace(f)) return base.map(function (p) { return p[1]; });
    /* 얼굴 설계(2026-11-01) — 인상이 먼저, 피부 · 윤곽 · 눈(크기 · 꼬리 · 모양) · 눈썹 · 코 · 입 · 눈 색 · 표식 */
    var FD = T.FACE_DESIGN, d = function (k) { return f[k] && FD[k][f[k]] && !chosen[FD.param[k]] ? FD[k][f[k]] : ''; }, get = function (k) { var p = base.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : ''; };
    var tilt = lg && lg.eyeTilt && f.eye_tilt && lg.eyeTilt[f.eye_tilt] && !chosen[FD.param.eye_tilt] ? lg.eyeTilt[f.eye_tilt] : d('eye_tilt');   /* 2.5 API 판 — 옛 눈꼬리 글(legacy25.eyeTilt) */
    var eyes = [d('eye_size'), get('eyes')].filter(Boolean).join(' — ') + (tilt ? ', ' + tilt : '');
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
  /* 일상컷 몸 줄(체형마다, T.CASUAL.bodyExtra) — 긴 꼴은 대문자 머리, 짧은 꼴 · 칸 꼴은 「Midriff:」 */
  function midriffLine(c, world, long) { var b = (lookOf(c, world).silhouette || {}).body, x = ((T.CASUAL || {}).bodyExtra || {})[b]; return x ? (long ? 'MIDRIFF: ' : 'Midriff: ') + x : ''; }
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
      traits: traitsOf(c, world), palette: (trim((g.palette || {}).en) || trim(((c.camp || {}).palette || {}).en) || trim((f.palette || {}).en)) + (trim((g.palette_accent || {}).en) ? ', with small accents of ' + trim(g.palette_accent.en) : ''),   /* 군웅록 덧색 — 거쳐 온 세력 색 둘씩(2026-11-12) */   /* 장수 몫 색(초선 연핑크, 2026-11-05)이 무리 · 세력 색을 이긴다 */ hanja_paren: !world || world === 'samguk' ? ' (' + f.hanja + ')' : '' };
    m.title = trim((g.title || {}).en) ? ' — ' + trim(g.title.en) : '';
    m.chars = world && world !== 'samguk' ? T.CHARS.none : fill(g.seal && g.seal !== f.hanja ? T.CHARS.two : T.CHARS.one, m);   /* 판타지 · 메카 일상컷에 關 · 蜀 이 걸렸다(2026-11-02) */
    m.text_rule = fill(T.TEXT_RULE[world] || T.TEXT_RULE.samguk, m);
    return m;
  }

  /* 머리말 떼기 · 끝 점 떼기 — 구조판(v2, 2026-11-05)은 2026-11-11 사용자 「구조판은 지워줘」 로 지웠다 */
  var HEAD_RE = /^[A-Z][A-Z &\/-]*(?: \([^)]*\))?: /;
  function bare(s) { return trim(String(s || '').replace(HEAD_RE, '')); }
  function noDot(s) { return trim(s).replace(/[.;:]+$/, ''); }

  /* ══ 기준 판(format: kv, 2026-11-05 — docs/STYLE_LAB.md kv_kmmo_lock) ══ 영문 네 칸. 1절은 판 그대로, 2절은 설계표 look 을 한 세계(faceWorld) 값으로 세 세계 같게 —
     세계마다 얼굴 · 헤어가 다르면 이마가 다 드러난 메카가 따로 놀았다(맹획). 흔들리는 값(히메컷 · 울프컷 · 버튼 코 · 처진 눈 …)은 판의 swap 으로 바꿔 끼운다.
     3절은 역할의 세계 차림 + 세력(군웅은 무리) 색 · 메카 설계, 4절은 자세 · 장면 · 시간대 · 덧붙임. 글은 모두 판(data/style.json)에 */
  function denierFits(en) { var C = T.CASUAL; return !!(C.denierFit && new RegExp(C.denierFit, 'i').test(en || '') && !(C.denierSkip && new RegExp(C.denierSkip, 'i').test(en || ''))); }   /* 데니어가 닿는 옷 — 니트 · 얇은 천 · 타이츠 · 가죽 옷의 이너, 수영복 · 란제리는 빼고 */
  /* 상황 노출(2026-11-09) — 그 옷에 얹을 수 있는 상황 열쇠들(fit 에 맞고 skip 에 안 걸리는 것) */
  function situsFor(en) {
    return (T.CASUAL.situations || []).filter(function (s) { return new RegExp(s.fit || '.', 'i').test(en || '') && !(s.skip && new RegExp(s.skip, 'i').test(en || '')); }).map(function (s) { return s.key; });
  }
  function situFits(key, en) { return situsFor(en).indexOf(key) >= 0; }
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

  /* 짧은 세계 그림(사용자 2026-11-08 「화풍글 다 축소판으로 해주고, mmorpg cg를 공방 기본키로」 — 조조 · 손권 · 장료 · 유비 시험).
     화풍 단락은 shortStyle(줄인 화풍 글). 설계 값은 줄 꼴 판으로 지은 긴 지시문에서 칸만 뽑는다 — 장수 · 세계 · 고른 외형 · 장면 · 덧붙임이 긴 판과 같다.
     꼭 남기는 줄: 전설(칭호 속 남성 특징을 여성 버전으로 — 손권 「purple beard」 가 수염으로 나왔다) · 수염 없음 · 세계 경계(판타지 · 메카에 동양 건축 · 한자 없음) · 구도(판타지가 혼자 커졌다).
     판(style.json) 꼭대기 worldShort 가 켜면 모든 화풍, 판에 worldShort: false 면 그 화풍만 긴 꼴 */
  function worldShortOn(S, styleKey) { var row = styleRow(S, styleKey) || {}; return row.worldShort === false ? false : !!(row.worldShort || (S && S.worldShort)); }
  function buildWorldShort(D, S, key, world, opts, c) {
    var WS = T.WORLD_SHORT, isLine = function (k) { return S && S.styles && S.styles[k] && !kvVer(S, k); };
    var ref = isLine(opts.style || S['default']) ? (opts.style || S['default']) : ['kr_promo_hikey', 'kr_mmorpg'].concat(Object.keys(S.styles || {})).filter(isLine)[0];
    var t = build(D, S, key, world, Object.assign({}, opts, { style: ref, _long: true }));
    var L = t.split('\n'), line = function (h) { var l = L.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var concept = line('CONCEPT:'), title = (concept.match(/ — ([^.]+?)\. Reimagined/) || [])[1] || '';
    var face = line('FACE —'), fi = face.indexOf('first impression — '), fe = face.indexOf('. Whatever');
    var world0 = line(T.WORLDS.filter(function (w) { return w.key === world; })[0].head.trim()), wdesc = first(world0);
    var cm = world0.match(/COSTUME \([^)]*\): ([^.]+)\./) || world0.match(/built as ([^;]+);/);
    /* 무기의 세계 꼴은 설명까지(룬 · 마법 빛 · 에너지 날 — 사용자 2026-11-09 GPT 설계에서 찾고 「응 그것도 같이 고쳐줘」, 전엔 ':' 앞에서 잘랐다) */
    var sig = line('SIGNATURE ITEM:'), hold = sig.split(' — ')[0], form = (sig.split(' — ')[1] || '').split('. She holds')[0];
    var osil = first(line('OUTFIT SILHOUETTE:')), pal = (line('FACTION —').match(/Palette: ([^.]+)\./) || [])[1] || '';
    var ex = L.filter(function (x) { return /^EXPOSURE \(/.test(x); })[0] || '';
    var shot = normShot(D, key, world, opts.shot), po = byKey(T.WORLD_POSES, shot.pose);
    var row = styleRow(S, opts.style), out = [
      fill(WS.head, { name_en: c.en, title: title, age: first(line('AGE:')).replace(/\.$/, '') }),
      'Style: ' + shortStyle(S, opts.style),
      'Her: ' + (fi >= 0 ? face.slice(fi + 19, fe > 0 ? fe : undefined) : face) + '. ' + line('SILHOUETTE:'),
      WS.face || '',   /* 얼굴 비율(2026-11-09) */
      line('TRAITS of') ? 'Her legend: ' + line('TRAITS of').replace(/^[^:]+:\s*/, '') : '',
      'Outfit: ' + (cm ? cm[1] : '') + (osil ? ' — ' + osil.replace(/\.$/, '') : '') + '; colours ' + pal + '.' + (ex ? ' ' + ex.replace(/Chest and pelvis covered/g, 'Intimate areas covered') : ''),
      hold ? 'She holds ' + hold + (form && !/in the form this WORLD/.test(form) ? ', ' + form : '') + '.' : '',
      'Pose: ' + noDot(po ? po.en : WS.pose) + '.' + (line('EXPRESSION:') ? ' Expression: ' + first(line('EXPRESSION:')) : ''),
      'Setting: ' + wdesc + (line(T.SCENE_HEAD.trim()) ? ' This card: ' + line(T.SCENE_HEAD.trim()) : '')];
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) out.push(tm.en);
    var notes = opts.notes || {}; T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) out.push(f.head + v); });
    out.push(WS.composition, trim(row.worldLight) || WS.light, fill(WS.end, { guard: WS.guard[world] || '' }));
    return out.filter(Boolean).join('\n\n');
  }
  /* 칸 꼴 정리판(2026-11-10, T.SECTIONS) — 설계 값은 줄 꼴 긴 지시문에서 칸만 뽑아 다섯 칸으로 다시 묶는다. 화풍 문단은 shortStyle.
     판 꼭대기 sections 가 켜면 짧은 판이던 화풍이 모두 이 꼴. 2.5 글 판(legacy25) · 긴 꼴로 둔 판(worldShort/casualShort false)은 그대로 */
  function sectionsOn(S, styleKey, kind) {
    var row = styleRow(S, styleKey) || {};
    if (!T.SECTIONS || row.sections === false || row.legacy25) return false;
    if (kind === 'casual' && row.casualLegacy) return false;   /* 일상컷만 2.5 글 긴 꼴(화풍공방 시험 꼴 — kr_drawn_rim_dewy, 2026-11-11) */
    if (!(row.sections || (S && S.sections))) return false;
    return kind === 'casual' ? casualShortOn(S, styleKey) : worldShortOn(S, styleKey);
  }
  /* 칸 꼴의 「직접 고른 외형」 한 줄 — 긴 꼴 IDENTITY 칸과 같은 값(나이는 Age 줄) — 원소 공방과 같은 꼴(2026-11-11) */
  function chosenLook(look) {
    var values = paramValues(identityParams((normLook(look) || {}).params)).filter(function (p) { return p[0] !== 'apparent age'; });
    return values.length ? 'Chosen look (overrides the automatic look): ' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('; ') + '.' : '';
  }
  function buildWorldSections(D, S, key, world, opts, c) {
    /* 칸 머리 · 해부 줄은 core 칸 틀(AtelierSpec.CORE_FRAME, 화풍공방 core v4~)에서 — 공방들이 같은 틀을 쓴다(2026-11-11 3단계). 없으면 제 표 */
    var CF = T.CORE_FRAME, hd = function (k, o) { return CF && CF[k] ? fill(CF[k], o || {}) : fill(T.SECTIONS.world[k], o || {}); };
    var SE = T.SECTIONS, W = SE.world, isLine = function (k) { return S && S.styles && S.styles[k] && !kvVer(S, k) && !styleRow(S, k).legacy25; };
    var ref = isLine(opts.style || S['default']) ? (opts.style || S['default']) : ['kr_promo_hikey', 'kr_mmorpg'].concat(Object.keys(S.styles || {})).filter(isLine)[0];
    var long = function (w) { return build(D, S, key, w, Object.assign({}, opts, { style: ref, _long: true })).split('\n'); };
    var L = long(world), LF = SE.faceWorld && SE.faceWorld !== world && worldsOf(D, key).indexOf(SE.faceWorld) >= 0 ? long(SE.faceWorld) : L;   /* 얼굴 · 머리는 faceWorld 의 것(우선 세 세계 같게) */
    var lineOf = function (A, h) { var l = A.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var line = function (h) { return lineOf(L, h); }, first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var concept = line('CONCEPT:'), title = (concept.match(/ — ([^.]+?)\. Reimagined/) || [])[1] || '';
    var face = lineOf(LF, 'FACE —'), fi = face.indexOf('first impression — '), fe = face.indexOf('. Whatever');
    var wr = T.WORLDS.filter(function (w) { return w.key === world; })[0], world0 = line(wr.head.trim());
    var wdesc = trim(world0.split(/ (?:COSTUME \(|MECHA DESIGN:)/)[0]);
    var cm = world0.match(/COSTUME \([^)]*\): ([^.]+)\./) || world0.match(/built as ([^;]+);/), fr = world0.match(/FACTION FRAME: ([^.]+)\./);
    var sig = line('SIGNATURE ITEM:'), hold = sig.split(' — ')[0], form = (sig.split(' — ')[1] || '').split('. She holds')[0];
    if (/in the form this WORLD/.test(form)) form = '';
    form = form.replace(': ', ' — ').split(' and no ')[0];   /* 금지 꼬리(「and no wood, silk tassels …」)는 5칸의 세계 경계가 맡는다 */
    var sil = noDot(first(line('OUTFIT SILHOUETTE:') || line('MECHA SILHOUETTE:'))), pal = (line('FACTION —').match(/Palette: ([^.]+)\./) || [])[1] || '';
    var ex = (L.filter(function (x) { return /^EXPOSURE \(/.test(x); })[0] || '').replace(/^EXPOSURE/, 'Exposure').replace(' Nothing slipped off.', '').replace(/Chest and pelvis covered/g, 'Intimate areas covered');
    ((W.exposeFix || {})[world] || []).forEach(function (r) { ex = ex.split(r[0]).join(r[1]); });   /* 칸 꼴에서만 노출 글 고쳐 쓰기(감사 S6) */
    var shot = normShot(D, key, world, opts.shot), po = byKey(T.WORLD_POSES, shot.pose), tm = byKey(T.WORLD_TIMES, shot.time);
    var one = line('ONE FIGURE ONLY.'), rule = trim((one.split('no frame border. ')[1] || ''));
    var row = styleRow(S, opts.style), notes = opts.notes || {}, expr = line('EXPRESSION:');
    var p1 = [hd('s1'), shortStyle(S, opts.style), row.worldFace || W.face, row.worldStyleAfter || ''];   /* 판 몫 얼굴 비율 줄 · 피부 줄(화풍공방 시험 꼴, 2026-11-11) */
    var p2 = [hd('s2'), fill(W.age, { age: noDot(first(lineOf(LF, 'AGE:'))).split(';')[0] }), fill(W.look, { face: noDot(fi >= 0 ? face.slice(fi + 19, fe > 0 ? fe : undefined) : face) }).replace(/:\s*\.$/, '.'),   /* 얼굴을 끄면 「…facial hair: .」 이 남던 것 — 수염 없음 규칙은 남긴다(2026-11-11) */
      fill(W.body, { silhouette: lineOf(LF, 'SILHOUETTE:') }), chosenLook(opts.look),   /* 직접 고른 외형 — 칸 꼴에서 빠지던 것(2026-11-11) */ expr ? fill(W.expr, { expr: noDot(first(expr)) }) : '',
      line('TRAITS of') ? fill(W.legend, { traits: line('TRAITS of').replace(/^[^:]+:\s*/, '') }) : '', hd('anatomy')];
    var p3 = [CF && CF.s3 ? fill(CF.s3, { costume: 'COSTUME AND EQUIPMENT', genre: wr.en }) : fill(W.s3, { genre: wr.en }), fill(W.costume, { costume: (W.costumeHead[world] || '') + noDot(cm ? cm[1] : ''), dress: W.dress[world] || '' }) + (trim(((row.worlds || {})[world] || {}).costume) ? ' ' + trim(row.worlds[world].costume) : ''),   /* 화풍 판의 세계 몫 의상 문장(있을 때만) */
      sil ? fill(W.silhouette, { sil: sil }) : '', fill(W.colours, { palette: pal }) + (fr ? fill(W.frame, { design: noDot(fr[1]) }) : ''),
      hold ? fill(W.item, { hold: hold, form: form ? ', ' + noDot(form) : '' }) : '', ex];
    var p4 = [hd('s4'), fill(W.worldLine, { world: wdesc }), line(T.SCENE_HEAD.trim()) ? fill(W.place, { scene: line(T.SCENE_HEAD.trim()) }) : '', tm ? tm.en : '',
      line('MOOD:') ? fill(W.mood, { mood: line('MOOD:') }) : '', fill(W.pose, { pose: noDot(po ? po.en.replace(/;\s*$/, '') : W.poseDefault) }), trim(row.worldLight), W.composition];
    T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) p4.push(f.head + v); });
    var p5 = [hd('s5'), fill(W.end, { text_rule: rule, guard: W.guard[world] || '' }), (row.avoid || []).length ? (CF && CF.avoid ? fill(CF.avoid, { list: row.avoid.join(', ') }) : 'Avoid: ' + row.avoid.join(', ') + '.') : ''];
    return [fill(row.worldHead || W.head, { name_en: c.en, title: title })].concat([p1, p2, p3, p4, p5].map(function (p) { return p.filter(Boolean).join('\n'); })).join('\n\n');
  }
  function buildCasualSections(S, opts, c, wr, t, sc, m, close, key) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, SH = CL.short, K = T.SECTIONS.casual, row = styleRow(S, opts.style);
    var ex = SH.expose[((sc.axes || {}).skin_exposure) || 'bold'] || SH.expose.bold;
    var free = isFree(sc), det = casualDetailsV2(sc, t, m).filter(function (l) { return !/^(?:overall_intensity|skin_exposure):/.test(l); }).map(function (l) {
      if (/^Outfit: /.test(l) && !free) return l.replace(/\.?\s*$/, '') + ', ' + ex + ', ' + SH.body + '.';
      if (/^EXPRESSION: /.test(l)) { var i = l.indexOf('. '); return i > 0 ? l.slice(0, i + 1) : l; }
      return l;
    });
    /* 자유 설계 컷은 덩어리를 장면 칸에 통째로, 옷 칸엔 노출 · 몸 줄만 */
    var outfit = free ? ['Outfit fit: ' + ex + ', ' + SH.body + '.'] : det.filter(function (l) { return /^Outfit: /.test(l); }), scene = free ? det : det.filter(function (l) { return !/^Outfit: /.test(l); });
    var p2 = [K.s2, K.clothes, K.pose].concat(outfit);
    var mid = midriffLine(c, wr.key); if (mid) p2.push(mid);   /* 슬림 근육형 식스팩(2026-11-12) */
    if (isWeapon(m.hold)) {
      var forms = SH.charmForms, h = 2166136261, k = [key, wr.key, sc.place, sc.item, sc.frame].join('|');
      for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      p2.push(fill(SH.charm, Object.assign({}, m, { form: sc.charm && forms.indexOf(sc.charm) >= 0 ? sc.charm : forms[h % forms.length] })));
    }
    if (m.traits) p2.push(fill(SH.legend, m));
    var p3 = [K.s3], wp = det.some(function (l) { return l.indexOf(CL.worldPlace) >= 0; }), era = C.era(t, sc.era);
    if (wp && era) p3.push(casualEraLine(c, era, m, wr.key));
    p3 = p3.concat(scene);
    if (close && !free) p3.push('Framing: ' + T.CROP_EDGE[trim(sc.frame)] + '.');
    var gl = byKey(CL.glosses, sc.gloss); if (gl) p3.push(gl.en);
    if (trim(row.casualLight)) p3.push(trim(row.casualLight));
    return [fill(K.head, m), [K.s1, K.identity, fill(K.render, { style: shortStyle(S, opts.style) })].join('\n'), p2.join('\n'), p3.join('\n'), [K.s4, K.end].join('\n')].join('\n\n');
  }
  /* GPT 임의 설계 주문(2026-11-09) — 줄 꼴 긴 지시문에서 누구 · 전설 · 세계만 뽑고, 나머지는 GPT 가 정한다(T.WORLD_FREE) */
  function buildWorldFree(D, S, key, world, opts) {
    opts = opts || {};
    var WF = T.WORLD_FREE, WS = T.WORLD_SHORT, c = card(D, key); if (!c) return '';
    var isLine = function (k) { return S && S.styles && S.styles[k] && !kvVer(S, k); };
    var ref = styleRow(S, opts.style).legacy25 && isLine(opts.style) ? opts.style : ['kr_promo_hikey', 'kr_mmorpg'].concat(Object.keys(S.styles || {})).filter(isLine)[0];   /* 2.5 API 판은 제 판으로(옛 나이 — 2026-11-09) */
    var t = build(D, S, key, world, Object.assign({}, opts, { style: ref, _long: true, shot: {}, notes: {} }));
    var L = t.split('\n'), line = function (h) { var l = L.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var concept = line('CONCEPT:'), title = (concept.match(/ — ([^.]+?)\. Reimagined/) || [])[1] || '';
    var wdesc = first(line(T.WORLDS.filter(function (w) { return w.key === world; })[0].head.trim()));
    var traits = line('TRAITS of').replace(/^[^:]+:\s*/, '');
    /* 무기의 세계 꼴은 설명까지 그대로(룬 · 마법 빛 · 에너지 날 — 사용자 2026-11-09 「gpt 설계쪽에는 무기가 중세나 메카로 넘어가면 룬이나 빔 효과가 없어지는거 같아」, 전엔 ':' 앞에서 잘랐다) */
    var sig = line('SIGNATURE ITEM:'), hold = noDot(sig.split(' — ')[0]), form = (sig.split(' — ')[1] || '').split('. She holds')[0];
    var weapon = hold + (form && !/in the form this WORLD/.test(form) ? ', ' + noDot(form) : '');
    var pal = (line('FACTION —').match(/Palette: ([^.]+)\./) || [])[1] || '';
    /* 의상 목록은 그 역할의 실루엣 묶음만(SIL_POOLS — 장수마다 나눌 때 쓰는 묶음, 사용자 2026-11-09 「묶음 안에서 고르게하자」). 묶음이 없으면 전부 */
    var hairC = WF.hair ? en('hair_color', (lookOf(c, world).silhouette || {}).hair_color) : '';   /* 머리색은 우리 설계값(2026-11-09) */
    var skinK = (lookOf(c, world).face || {}).skin_tone, skinC = WF.skin && skinK ? (((T.FACE_DESIGN || {}).skin_tone || {})[skinK] || '') : '';   /* 피부색도 우리 설계값(같은 날) */
    var pool = ((T.SIL_POOLS || {})[c.general.role] || {})[world];
    var list = ((T.SILHOUETTES || {})[world] || []).filter(function (x) { return !pool || pool.indexOf(x.key) >= 0; }).map(function (x, i) { return (i + 1) + ') ' + noDot(x.en); }).join('; ');
    return [fill(WF.head, { name_en: c.en, title: title, age: first(line('AGE:')).replace(/\.$/, '') }), WF.free,
      'Style (fixed): ' + shortStyle(S, opts.style), traits ? fill(WF.legend, { traits: noDot(traits) }) : '', fill(WF.world, { world: wdesc }),
      fill(WF.costume, { list: list }), hold ? fill(WF.weapon, { weapon: weapon }) : '', hairC ? fill(WF.hair, { hair: hairC }) : '', skinC ? fill(WF.skin, { skin: skinC }) : '', pal ? fill(WF.palette, { palette: pal }) : '', world === 'mecha' ? (WF.mecha || '') : '', ((WF.rank || {})[c.general.role] || ''), WF.expose,
      WS.face.replace('Her eyes keep the shape described above at a natural open size', 'Her eyes stay at a natural open size'), WS.composition, WF.second, fill(WF.end, { guard: WS.guard[world] || '' })].filter(Boolean).join('\n\n');
  }
  function build(D, S, key, world, opts) {
    opts = opts || {};
    var c = card(D, key); if (!c) return '';
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0]; if (!W) return '';
    if (!opts._long && sectionsOn(S, opts.style, 'world')) return buildWorldSections(D, S, key, world, opts, c);   /* 칸 꼴 정리판(2026-11-10) */
    if (!opts._long && worldShortOn(S, opts.style)) return buildWorldShort(D, S, key, world, opts, c);   /* 짧은 세계 그림(2026-11-08) */
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
    var lg = srow.legacy25 || null;   /* 2.5 API 판(2026-11-09) — 2.6 에 맞춘 셋을 옛 글로: 나이(11-08 전) · 얼굴 머리말(윤곽 · 비율 꼬리 없음) · 눈꼬리 */
    var dzf = look.faceDesignOn === false ? {} : lookOf(c, world).face;
    if (lg && lg.ageOld && lg.ageOld[key] && dzf.age) dzf = Object.assign({}, dzf, { age: lg.ageOld[key] });
    var age = ageLine(look, dzf); if (age) lines.push(age);
    var sil = silhouetteItems(c, look, world); if (sil.length && T.LOOK_LINES) lines.push(fill(T.LOOK_LINES.silhouette, { items: sil.join('; ') }));
    var face = faceItems(c, look, world, lg); if (face.length && T.LOOK_LINES) lines.push(fill(designedFace(dzf) ? (lg && lg.faceHead) || T.FACE_DESIGN.head : T.LOOK_LINES.face, { items: face.join('; ') }));
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
    'weather', 'time', 'hair', 'own', 'placeText', 'ownProp', 'light', 'spot', 'depth', 'view', 'gloss', 'color', 'denier', 'situ', 'ofree', 'ofreeFamily', 'ofreeSitu', 'ofreeRecent', 'charm', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'unlocked', 'unlockedAuto'];   /* time·hair 는 원소 몫(2026-10-30) */
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
  /* world 를 주면 그 세계에만 있는 자리(worlds_only — 조종석은 메카, 마구 창고는 삼국시대 · 판타지)를 트리가 거른다(2026-11-13) */
  function casualCard(c, world) { var h = casualHold(c); return { key: c.key, signature: h ? [h] : [], signature_hold: h ? [0] : [], world: world || '' }; }
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

  /* 자유 설계 덩어리(2026-11-11 — T.FREE_DESIGN) — 옷 자유 컷(ofree)과 갈래 자유 컷(ofree + ofreeFamily · ofreeSitu)은 계획의 장면 줄 대신 이것.
     장소 · 하는 일 · 자세 · 구도 · 옷은 맡은 쪽이 「…」 를 채운다. 갈래 자유 컷은 필수 갈래(트리 표의 영어 이름 — 큰 범위만)와 상황(ofreeSitu 'free' 면 맡은 쪽이 짓는다, 표 열쇠면 표 글)을 묶는다 */
  function isFree(sc) { return !!(sc && sc.ofree && T.FREE_DESIGN); }
  function freeDesign(sc, t) {
    var F = T.FREE_DESIGN, C = root.AtelierCasualTreeV2, fam = sc.ofreeFamily ? C.family(t, sc.ofreeFamily) : null, si = sc.ofreeSitu ? byKey(T.CASUAL.situations, sc.ofreeSitu) : null;
    var out = [F.head, fill(F.recent, { recent: trim(sc.ofreeRecent) || F.recentNone })].concat(F.lines);
    if (fam) out.push(fill(F.family, { family: (F.familyNames || {})[sc.ofreeFamily] || trim(fam.en) }));
    if (fam && sc.ofreeSitu === 'free' && F.situFree) out.push(F.situFree);   /* 상황은 열기(2026-11-11 「상황도 열어주자」) */
    else if (si) out.push(fill(F.situ, { situ: si.en }));
    out.push(fam ? F.outfitFamily : F.outfit);
    return out;
  }
  /* 지시문 속 자유 설계 덩어리 — 「FREE DESIGN:」 줄부터 그 뒤 첫 「Outfit:」 줄까지(채운 글 · 빈 틀 모두). 없으면 null */
  function freeBlockOf(text) {
    var L = String(text || '').split('\n'), i = L.findIndex(function (l) { return /^FREE DESIGN: /.test(l); }); if (i < 0) return null;
    for (var j = i + 1; j < L.length; j++) if (/^Outfit: /.test(L[j])) return L.slice(i, j + 1).join('\n');
    return null;
  }
  /* 버전2 장면 → SCENE 줄들. 손·소품·받침의 관계는 PROP 한 줄에서만, 오른손·왼손은 인물 본인 기준 */
  /* 상황이 붙은 컷(상황 노출 situ · 갈래 자유 ofreeSitu)은 노출 축 글의 「nothing slipped off(아무것도 흘러내리지 않게)」 를 뺀다 — 흘러내린 어깨끈 · 반쯤 푼 차림 같은 상황과 부딪혔다(사용자 2026-11-11 「2번 고쳐줘」) */
  function noSlipOff(k, text, sc) {
    return k === 'skin_exposure' && (trim(sc.situ) || trim(sc.ofreeSitu)) ? String(text).replace(/;\s*nothing slipped off(?=;|$)/i, '') : text;
  }
  function casualDetailsV2(sc, t, m) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, out = [], f = C.frame(t, sc.frame);
    if (isFree(sc)) {   /* 자유 설계 컷 — 장면 줄 대신 덩어리, 덧붙임(Note)과 강도 · 노출 축은 그대로(축은 가까운 컷 글 없이) */
      out = freeDesign(sc, t);
      if (trim(sc.custom)) out.push('Note: ' + quoted(sc.custom));
      T.LOCAL_AXES.forEach(function (k) {
        var v = sc.axes && sc.axes[k];
        if (!v || v === 'AUTO' || (T.ADVANCED_OPTIONS[k] || []).indexOf(v) < 0) return;
        out.push(k + ': ' + v + ' — ' + noSlipOff(k, T.SCENE_AXIS_GUIDES[k][v][1], sc));
      });
      return out;
    }
    var p = C.place(t, sc.place), fam = C.family(t, sc.ofam), it = C.item(t, sc.ofam, sc.item);
    var po = C.posture(t, sc.posture), su = C.support(t, sc.support), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var by = function (list, k) { return (list || []).filter(function (r) { return r.key === k; })[0]; };
    var body = by(t.v2.body, sc.body), head = by(t.v2.head, sc.head), cam = by(t.v2.camera, sc.camera);
    var bl = C.backLook(t, sc);   /* 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔(lib/casual-tree-v2.js) */
    var gaze = by(t.v2.gaze, sc.gaze || (u && u.gaze) || '');
    /* 세계 안 시대의 「그 세계의 자리」 장소는 WORLD 줄이 정한다 */
    /* 세계 안 장소는 참고 그림의 세계 글(장소 표 worlds.<세계> — 객잔 · 선술집 · 정거장 바, 2026-11-02) */
    /* 캐릭터만의 컷(own)은 그 컷의 장소 글(placeText) — 받침 · 장소 종류만 트리 장소(base)에서 빌린다(2026-11-13) */
    if (trim(sc.placeText)) out.push('Place: ' + trim(sc.placeText)); else if (p) out.push('Place: ' + (p.world_place ? CL.worldPlace : placeEn(p, m.world_key)));
    var wt = (t.v2.weather || []).filter(function (r) { return r.key === sc.weather; })[0];
    if (wt) out.push('Weather / season: ' + wt.en + '.');
    var tm = byKey(CL.times, sc.time); if (tm) out.push('Time of day: ' + tm.en + '.');
    var hr = byKey(CL.hairs, sc.hair); if (hr) out.push('Hair: ' + hr.en + '.');
    var X = C.extras(t, sc);   /* 빛의 방향 · 화면 안 자리 · 옆모습의 가까운 팔 · 실내 여부(lib/casual-tree-v2.js extras, 2026-11-13) */
    if (X.light) out.push('Light direction: ' + X.light + '.');
    var specs = (sc.ofeat || []).indexOf('glasses') >= 0 ? CL.glasses : '';
    var oen = trim(sc.outfit) || (it && it.en) || (fam && fam.en) || '', col = colorFixed(oen) ? null : byKey(CL.colors, sc.color);   /* 옷 색(2026-11-08) — 옷 이름에 색 · 무늬가 박혔으면 그 색 */
    var dn = denierFits(oen) ? byKey(CL.deniers, sc.denier) : null;   /* 데니어(2026-11-08) — 맞는 옷에만, 노출 단계와 따로 */
    var si = situFits(sc.situ, oen) ? byKey(CL.situations, sc.situ) : null;   /* 상황 노출(2026-11-09) — 맞는 옷에만 */
    if (oen) out.push('Outfit: ' + oen + (col ? fill(CL.colorLine, { color: col.en }) : '') + (dn ? fill(CL.denierLine, dn) : '') + (si ? fill(CL.situLine, { en: (X.indoor && si.enIn) || si.en }) : '') + specs);
    if (po) out.push('POSTURE: ' + po.en + '.');
    if (su && su.en) out.push('SUPPORT: ' + su.en + '.');
    /* 몸이 옆모습이면 얼굴도 옆모습, 뒤 3/4 도 몸 표의 turned_face 를 붙인다 — 머리가 몸을 따를 때만. 카메라를 보면 눈만 */
    var bodyText = body && body.en + (body.profile_face && head && head.key === 'with_body' ? (gaze && gaze.key === 'camera' ? ', her face in profile too — only her eyes turn toward the camera' : ', her face in profile too, not turned toward the camera') : '')
      + (body.turned_face && head && head.key === 'with_body' ? ', ' + body.turned_face : '')
      + (X.side ? ', ' + X.side.body : '');
    out.push('COMPOSITION: ' + [(f && f.en) || sc.frame, bodyText, head && head.key !== 'with_body' && (bl ? bl.head : head.en), cam && cam.en].concat(X.comp).filter(Boolean).join('; ') + '.');
    var lens = C.lens(t, sc.frame);
    if (lens) out.push('Lens / perspective: ' + ((T.LENS_GUIDES[lens] || [])[1] || lens));
    var r = C.hand(t, sc.right), both = r && r.both && sc.right === sc.left;
    if (both) out.push('BOTH HANDS: ' + r.en + '.');
    else ['right', 'left'].forEach(function (side) {
      var k = sc[side], h = C.hand(t, k), text;
      if (k === 'prop') text = fill(CL.handBusy, { side: side });
      else if (h) text = h.en.replace('{side}', side) + (h.elbow ? ', her elbow ' + h.elbow : '');
      if (text) out.push(side.toUpperCase() + ' HAND: ' + text + X.where(side) + '.');
    });
    if (bl && bl.arm && !both) out.push(bl.arm);
    if (u && pr) {
      var thing = pr.signature ? (trim(sc.ownProp) || fill(CL.signatureProp, m)) : pr.en,   /* 캐릭터만의 컷은 그 직업의 도구(ownProp) */ action = u.en.replace('{prop}', thing);
      var side = sc.right === 'prop' ? 'right' : 'left';
      out.push('PROP: ' + (u.hands === 'both' ? fill(CL.propBoth, { action: action, right: (u.grip || {}).right, left: (u.grip || {}).left }) : fill(CL.propOne, { side: side, action: action })) + '.');
      if (pr.signature && CL.signatureWhole && !trim(sc.ownProp)) out.push(CL.signatureWhole);   /* 캐릭터만의 컷의 직업 도구엔 무기 모양 줄을 안 붙인다 */
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
      out.push(k + ': ' + v + ' — ' + noSlipOff(k, closeGuide || T.SCENE_AXIS_GUIDES[k][v][1], sc));
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
  /* 짧은 일상컷을 쓰는 판 — 판이 casualShort: false 면 옛 꼴, 아니면 짧은 꼴(2026-11-08 사용자 「다른 화풍도 켜주고」). */
  function casualShortOn(S, styleKey) { var row = styleRow(S, styleKey) || {}; return row.casualShort === false || row.casualLegacy ? false : !!(row.casualShort || T.CASUAL.shortAll); }
  /* 짧은 일상컷의 화풍 단락 — 일상 묶음 글 > 일상 글 > 세계 글, kv 판은 1절에서 머리 · 장르 고정을 뗀 앞 문장들(120낱말까지) */
  function shortStyle(S, styleKey) {
    var row = styleRow(S, styleKey) || {};
    var t = trim((row.casualKit || {}).style) || styleText(S, styleKey, 'casual') || styleText(S, styleKey, 'text') || String(row.section1 || '');
    t = String(t).replace(/^1\. RENDERING STYLE[^\n]*\n/, '').replace(/^STYLE:\s*/, '').split('GENRE LOCK')[0].replace(/\s+/g, ' ').trim();
    t = t.replace(/\s*[—-]\s*the same rendering quality as the attached image\.?/i, '.');
    var w = t.split(' ');
    if (w.length > 120) { var cut = w.slice(0, 120).join(' '); t = cut.lastIndexOf('.') > 0 ? cut.slice(0, cut.lastIndexOf('.') + 1) : cut; }
    return t;
  }
  function buildCasualShort(S, opts, c, wr, t, sc, m, close, key) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, SH = CL.short, row = styleRow(S, opts.style);
    var st = shortStyle(S, opts.style);
    var ex = SH.expose[((sc.axes || {}).skin_exposure) || 'bold'] || SH.expose.bold;
    var free = isFree(sc), det = casualDetailsV2(sc, t, m).filter(function (l) { return !/^(?:overall_intensity|skin_exposure):/.test(l); }).map(function (l) {
      if (/^Outfit: /.test(l) && !free) return l.replace(/\.?\s*$/, '') + ', ' + ex + ', ' + SH.body + '.';
      if (/^EXPRESSION: /.test(l)) { var i = l.indexOf('. '); return i > 0 ? l.slice(0, i + 1) : l; }
      return l;
    });
    if (free) det.push('Outfit fit: ' + ex + ', ' + SH.body + '.');   /* 자유 설계 컷 — 노출 · 몸 줄은 덩어리 밖 한 줄로(채우는 쪽이 지우지 않게) */
    var lines = [fill(SH.input, m), SH.output || '', SH.face, 'Style: ' + st + ' ' + SH.keep].filter(Boolean);   /* 크기 줄(2026-11-09) */
    var wp = det.some(function (l) { return l.indexOf(CL.worldPlace) >= 0; }), era = C.era(t, sc.era);
    if (wp && era) lines.push(casualEraLine(c, era, m, wr.key));   /* 「그 세계의 자리」 장소일 때만 세계 글 */
    lines.push(det.join('\n'));
    if (close && !free) lines.push('Framing: ' + T.CROP_EDGE[trim(sc.frame)] + '.');
    if (SH.headwear) lines.push(SH.headwear);
    if (m.traits) lines.push(fill(SH.legend, m));
    if (isWeapon(m.hold)) {
      var forms = SH.charmForms, h = 2166136261, k = [key, wr.key, sc.place, sc.item, sc.frame].join('|');
      for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      lines.push(fill(SH.charm, Object.assign({}, m, { form: sc.charm && forms.indexOf(sc.charm) >= 0 ? sc.charm : forms[h % forms.length] })));   /* 장마다 다른 꼴(머리꽂이 고정이 아니게) */
    }
    var mid = midriffLine(c, wr.key); if (mid) lines.push(mid);   /* 슬림 근육형 식스팩(2026-11-12) */
    var gl = byKey(CL.glosses, sc.gloss); if (gl) lines.push(gl.en);   /* 고른 피부 광택 단계만(안 고르면 화풍대로) */
    lines.push(trim(row.casualLight) || SH.light, SH.end);
    return lines.join('\n\n');
  }
  function buildCasual(D, S, key, scene, opts) {
    opts = opts || {}; scene = scene || {};
    var C = root.AtelierCasualTreeV2, C1 = root.AtelierCasualTree, CL = T.CASUAL;
    if (!C || !C1 || !opts.tree || !opts.tree2) throw new Error('Casual tree v2 needs lib/casual-tree.js, lib/casual-tree-v2.js, data/casual-tree.json and data/casual-tree-v2.json');
    var c = card(D, key); if (!c) return '';
    var wr = worldRow(casualWorld(D, key, opts.world)); if (!wr) return '';
    var t = C.make(opts.tree2, opts.tree), g = casualCard(c, wr.key), m = Object.assign(casualVars(c, wr.key), { world_key: wr.key, world_en: wr.en.charAt(0) + wr.en.slice(1).toLowerCase() }), fx = casualFixed(scene);
    var sc = C.repair(t, Object.assign(sceneV2(scene), { axes: fx.axes }), g), f = C.frame(t, sc.frame);
    var body = (t.v2.body || []).filter(function (r) { return r.key === sc.body; })[0] || {};
    var head = (t.v2.head || []).filter(function (r) { return r.key === sc.head; })[0] || {};
    var free = isFree(sc), close = !free && T.CLOSE_FRAMES.indexOf(trim(sc.frame)) >= 0, lines = [];   /* 자유 설계 컷은 구도도 자유 — 크롭 · 시대 · 화면 · 돌아보기 줄 없이 */
    /* 짧은 판(2026-11-08) — 판에 casualShort 가 있으면 화풍 단락 + 계획 칸 + 꼭 필요한 줄만(T.CASUAL.short) */
    if (sectionsOn(S, opts.style, 'casual')) return buildCasualSections(S, opts, c, wr, t, sc, m, close, key);   /* 칸 꼴 정리판(2026-11-10) */
    if (casualShortOn(S, opts.style)) return buildCasualShort(S, opts, c, wr, t, sc, m, close, key);
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
        (close ? fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }) + '\n' : '') + (era0 && !free ? casualEraLine(c, era0, m, wr.key) + '\n' : '') + (C1.screens(t.v1, sc.place) && !free ? fill(CL.screens, m) + '\n' : '') + NAT.comp].join('\n\n');
    }
    lines.push(fill(CL.input, m));
    lines.push(fill(CL.character.general, m));
    if (m.traits) lines.push(fill(CL.design, m));
    if (isWeapon(m.hold) && CL.weaponCharm) lines.push(fill(CL.weaponCharm, m));
    var st = (styleRow(S, opts.style).casualKit || {}).style || styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text'); lines.push('STYLE: ' + st);   /* 화풍 글이 없는 판(kv)도 이 자리 — refLock 이 「첨부 그림 그대로」 로 바꾼다 */
    if (trim(styleRow(S, opts.style).casualStyleAfter)) lines.push(trim(styleRow(S, opts.style).casualStyleAfter));   /* 피부 마감 줄 — STYLE 바로 뒤(화풍공방 시험 꼴, 2026-11-11) */
    lines.push(CL.age);
    lines.push(CL.output);
    lines.push(fill(CL.frame, { frame: T.ASPECT_FRAME[fx.aspect] }));
    if (close) lines.push(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }));
    var era = C.era(t, sc.era); if (era && !free) lines.push(casualEraLine(c, era, m, wr.key));
    if (C1.screens(t.v1, sc.place) && !free) lines.push(fill(CL.screens, m));
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, m).join('\n'));
    var KIT = styleRow(S, opts.style).casualKit, kl = KIT && c.general ? kvLook(c, styleRow(S, opts.style)) : null;   /* 판의 일상컷 묶음(2026-11-08 kv_cgi_hikey — 사용자 「skin,light는 바꿔주고, style은 지시문 쪽, 얼굴묘사는 … 원래 케릭터의 설계 외형으로. body line은 지금 공방 유지」) */
    var gl = byKey(CL.glosses, sc.gloss), csk = gl ? gl.en : styleRow(S, opts.style).casualSkin;
    var CLG = styleRow(S, opts.style).casualLegacy, lg = styleRow(S, opts.style).legacy25 || (CLG ? styleRow(S, CLG).legacy25 : null) || null;   /* 2.5 API 판(2026-11-09) — 자연광 · 몸 라인 · 첨부 그림 잠금은 2.6 맞춤이라 뺀다. casualLegacy: 일상컷만 그 판의 2.5 글 꼴로 */
    var AV = styleRow(S, opts.style).avoid || [], avLine = AV.length ? 'AVOID: ' + AV.join(', ') + '.' : '';
    if (KIT) { lines.push(fill(KIT.skin, { skin: kl ? kl.skin : 'her own skin tone' })); if (gl) lines.push(gl.en); lines.push(KIT.light); }   /* 피부색 칸 · 하이키 조명 — 고른 광택 단계는 그 뒤에 */
    else { if (csk) lines.push(csk); if (CL.faceLight && !(lg && lg.casualLight === false)) lines.push(CL.faceLight); }   /* 자연광 — 일상컷 공통(2026-11-06 얼굴 → 2026-11-07 몸까지) */
    if (CL.bodyLine && !(lg && lg.casualBodyLine === false)) lines.push(CL.bodyLine);   /* 몸 라인 — 일상컷 공통(2026-11-07) */
    /* 기준 판 v5 — 일상컷에만 피부 광택(2026-11-06). 고른 단계(scene.gloss)가 있으면 그것, 없으면 화풍 기본 */
    lines.push(close ? CL.wardrobeClose : CL.wardrobe);
    lines.push(CL.angle);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back && !free) lines.push(CL.lookBack);
    lines.push(fill(CL.figure, m), close ? CL.anatomyClose : CL.anatomy);
    var mid = midriffLine(c, wr.key, true); if (mid) lines.push(mid);   /* 슬림 근육형 식스팩(2026-11-12) */
    lines.push(CL.body, CL.hands);
    if (avLine) lines.push(avLine);   /* 판 몫 Avoid — 맨 끝(화풍공방 시험 꼴) */
    if (lg && lg.casualRefLock === false) return lines.join('\n\n');   /* 2.5 API 판 — 11-02 꼴처럼 화풍 글 · AGE 줄 그대로 */
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
    if (C && opts.tree && opts.tree2) sc = Object.assign(C.repair(C.make(opts.tree2, opts.tree), sc, c ? casualCard(c, world) : null), { aspect: fx.aspect });
    return { atelier: 'samguk', card: key, faction: c ? c.general.faction : '', slot: 'casual' + n, treeV: 2, world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      ref: world ? fileName(key, world, styleKey) : '', scene: sc, file: world ? casualFile(key, world, styleKey, n) : '', prompt: buildCasual(D, S, key, scene, opts), date: new Date().toISOString().slice(0, 10) };
  }

  root.AtelierPrompt = { card: card, cards: cards, worldsOf: worldsOf, general: general, factionOf: factionOf,
    bodyText: bodyText, build: build, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion, traitsOf: traitsOf,
    lookOf: lookOf, normLook: normLook, scenesOf: scenesOf, normShot: normShot, silOf: silOf, glossDefault: glossDefault, colorFixed: colorFixed, sectionsOn: sectionsOn, casualShortOn: casualShortOn, shortStyle: shortStyle, worldShortOn: worldShortOn, buildWorldFree: buildWorldFree, situsFor: situsFor, situFits: situFits, denierFits: denierFits, exposureOpenOf: function (key, world) { return exposureOpenOf(T.WORLDS.filter(function (w) { return w.key === world; })[0], key, world); }, holdOf: holdOf, isWeapon: isWeapon, casualHold: casualHold, faceItems: faceItems, silhouetteItems: silhouetteItems, identityParams: identityParams, paramValues: paramValues, exposureLine: exposureLine,
    buildCasual: buildCasual, casualWorld: casualWorld, casualFile: casualFile, casualRecord: casualRecord, casualDetailsV2: casualDetailsV2, placeEn: placeEn, placeKo: placeKo, exprNoGaze: exprNoGaze, sceneV2: sceneV2, casualFixed: casualFixed, isFree: isFree, freeDesign: freeDesign, freeBlockOf: freeBlockOf };
})(typeof window !== 'undefined' ? window : globalThis);
