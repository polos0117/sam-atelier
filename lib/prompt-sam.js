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
    return { key: g.key, tier: 'general', general: g, faction: f, role: r, roleKey: g.role, ko: g.key, en: g.en || g.key };
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
  function ageLine(look, f) {
    var v = ((look || {}).params || {})['apparent age'];
    if (v === '__custom__') v = trim((look.params || {})['apparent age_custom']);
    /* 설계표 나이감(2026-11-01) — 모두에게 같은 「soft full cheeks · soft smile」 줄이 얼굴을 하나로 만들었다 */
    if ((!v || v === 'AUTO') && f && f.age && T.FACE_DESIGN && T.FACE_DESIGN.age[f.age]) return T.FACE_DESIGN.age[f.age];
    if (!v || v === 'AUTO') v = T.AGE_DEFAULT;
    return T.AGE_LINES ? (T.AGE_LINES[v] || ('AGE: ' + v + '.')) : '';
  }
  /* 노출 — 비우면 싣지 않는다. 과감은 세계에 제 문장이 있으면 그것(판타지·스팀펑크 — 2026-10-30), 없으면 겉옷 꼴로 공용 문장(EXPOSURE_LAYER) */
  function exposureLine(look, world) {
    var e = T.EXPOSURE && T.EXPOSURE[(look || {}).exposure];
    if (!e) return '';
    if (typeof e === 'string') return e;
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0];
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
  /* 세계 그림 칸(장면·시간대·자세·표정)을 바로잡는다 — 모르는 열쇠는 비운다 */
  function normShot(D, key, world, raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var c = card(D, key), out = { scene: '', time: '', pose: '', expr: '', frame: '' };
    if (c && byKey(scenesOf(c, world), raw.scene)) out.scene = raw.scene;
    if (byKey(T.WORLD_TIMES, raw.time)) out.time = raw.time;
    if (byKey(T.WORLD_POSES, raw.pose)) out.pose = raw.pose;
    if (T.EXPRESSION_DETAIL && T.EXPRESSION_DETAIL[raw.expr]) out.expr = raw.expr;
    if (world === 'mecha' && byKey(T.MECHA_SILHOUETTES, raw.frame)) out.frame = raw.frame;   /* 메카 실루엣 — 메카만(2026-11-05) */
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
      traits: traitsOf(c, world), palette: trim((f.palette || {}).en), hanja_paren: !world || world === 'samguk' ? ' (' + f.hanja + ')' : '' };
    m.title = trim((g.title || {}).en) ? ' — ' + trim(g.title.en) : '';
    m.chars = world && world !== 'samguk' ? T.CHARS.none : fill(g.seal && g.seal !== f.hanja ? T.CHARS.two : T.CHARS.one, m);   /* 판타지 · 메카 일상컷에 關 · 蜀 이 걸렸다(2026-11-02) */
    m.text_rule = fill(T.TEXT_RULE[world] || T.TEXT_RULE.samguk, m);
    return m;
  }

  function build(D, S, key, world, opts) {
    opts = opts || {};
    var c = card(D, key); if (!c) return '';
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0]; if (!W) return '';
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
    var design = world === 'mecha' ? trim(gw.design) || trim(fw.design) : '';
    lines.push(trim(W.head + wtext + (wtext ? '.' : '') + ' ' + fill(W.tail, { costume: costume }) + (design ? ' ' + fill(T.MECHA_FACTION, { design: design }) : '') + (sw.costume ? ' ' + sw.costume : '')));
    /* 메카 실루엣(고른 때만) — 세계 글 바로 뒤, 큰 덩어리 모양만 */
    var mf = world === 'mecha' ? byKey(T.MECHA_SILHOUETTES, shot.frame) : null; if (mf) lines.push(T.MECHA_SILHOUETTE_HEAD + mf.en + '. Only the overall shape is fixed; design the details freely.');
    /* 장면 변주 · 시간대 — 세계 글 뒤 */
    var scn = byKey(scenesOf(c, world), shot.scene); if (scn) lines.push(T.SCENE_HEAD + trim(scn.en) + '.');
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) lines.push(tm.en);
    if (sw.scene) lines.push(sw.scene);
    /* STYLE · 노출 */
    if (stx && !srow.lead) lines.push('STYLE: ' + stx);
    var ex = exposureLine(look, world); if (ex) lines.push(ex);
    /* 덧붙임 */
    var notes = opts.notes || {};
    T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) lines.push(f.head + v); });
    /* 출력(자세 자리) · 그 장수의 물건 · 표정 · 몸 · 직접 고른 외형 · 규칙 */
    var po = byKey(T.WORLD_POSES, shot.pose);
    lines.push(fill(T.OUTPUT, { pose: po ? po.en : T.POSE_DEFAULT }));
    if (m.hold) lines.push(fill(T.SIGNATURE, m));
    var ex2 = shot.expr || (dzf.expr && T.EXPRESSION_DETAIL[dzf.expr] ? dzf.expr : '');
    if (ex2) lines.push(T.EXPR_HEAD + T.EXPRESSION_DETAIL[ex2] + '.' + (T.EXPR_TAIL || ''));
    lines.push(T.BODY_LINE);
    var values = paramValues(identityParams(look.params)).filter(function (p) { return p[0] !== 'apparent age'; });
    if (values.length && T.LOOK_LINES) lines.push(T.LOOK_LINES.identity + '\n' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n') +
      (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; }) ? '\n' + T.LOOK_LINES.measurement : ''));
    lines.push.apply(lines, T.RULES.map(function (r) { return fill(r, m); }));
    return lines.join('\n');
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
    'weather', 'time', 'hair', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'unlocked', 'unlockedAuto'];   /* time·hair 는 원소 몫(2026-10-30) */
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
    if (trim(sc.outfit)) out.push('Outfit: ' + trim(sc.outfit) + specs);
    else if (it) out.push('Outfit: ' + it.en + specs);
    else if (fam) out.push('Outfit: ' + fam.en + specs);
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
  var REF_STYLE = "STYLE: keep the attached image's rendering exactly — the same finish, skin rendering, line weight, colour palette, saturation and lighting quality. Do not restyle her: no more realistic, no more painterly, no more 2D than the attached image. Only the outfit, pose, expression, framing and place change.";
  var REF_FACE = "FACE: exactly the face of the attached image — the same face shape, jawline, eye shape and size, nose, lips and their proportions, and the same skin rendering. Do not add skin texture, pores, harder nose or lip modelling, or any facial definition the attached image does not have. Keep the same face proportions — the same short midface (eyes to mouth) and the same face length-to-width ratio; the angle, bangs or a headpiece never make it look longer.";
  var REF_EXPR = ' Show it mildly, only with her brows, eyelids and mouth corners; her face shape and features stay exactly as in the attached image.';
  function refLock(text) {
    var out = [], faced = false;
    String(text).split('\n\n').forEach(function (p) {
      if (/^STYLE: /.test(p)) { out.push(REF_STYLE); return; }
      if (/^FINAL CHECK: /.test(p)) return;
      if (/^AGE: the same adult woman as in the attached image/.test(p)) { out.push(REF_FACE); faced = true; return; }
      out.push(p.replace(/^EXPRESSION: .*$/m, function (l) { return l.replace(/\s+$/, '') + REF_EXPR; }));
    });
    if (!faced) { var i = out.findIndex(function (p) { return /^CHARACTER: /.test(p); }); out.splice(i >= 0 ? i + 1 : 1, 0, REF_FACE); }
    return out.join('\n\n');
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
    lines.push(fill(CL.input, m));
    lines.push(fill(CL.character.general, m));
    if (m.traits) lines.push(fill(CL.design, m));
    if (isWeapon(m.hold) && CL.weaponCharm) lines.push(fill(CL.weaponCharm, m));
    var st = styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text'); if (st) lines.push('STYLE: ' + st);
    lines.push(CL.age);
    lines.push(CL.output);
    lines.push(fill(CL.frame, { frame: T.ASPECT_FRAME[fx.aspect] }));
    if (close) lines.push(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }));
    var era = C.era(t, sc.era); if (era) lines.push(casualEraLine(c, era, m, wr.key));
    if (C1.screens(t.v1, sc.place)) lines.push(fill(CL.screens, m));
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, m).join('\n'));
    lines.push(close ? CL.wardrobeClose : CL.wardrobe);
    lines.push(CL.angle);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back) lines.push(CL.lookBack);
    lines.push(fill(CL.figure, m), close ? CL.anatomyClose : CL.anatomy, CL.body, CL.hands);
    return refLock(lines.join('\n\n'));
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
    build: build, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion, traitsOf: traitsOf,
    lookOf: lookOf, normLook: normLook, scenesOf: scenesOf, normShot: normShot, holdOf: holdOf, isWeapon: isWeapon, casualHold: casualHold, faceItems: faceItems, silhouetteItems: silhouetteItems, identityParams: identityParams, paramValues: paramValues, exposureLine: exposureLine,
    buildCasual: buildCasual, casualWorld: casualWorld, casualFile: casualFile, casualRecord: casualRecord, casualDetailsV2: casualDetailsV2, placeEn: placeEn, placeKo: placeKo, exprNoGaze: exprNoGaze, sceneV2: sceneV2, casualFixed: casualFixed };
})(typeof window !== 'undefined' ? window : globalThis);
