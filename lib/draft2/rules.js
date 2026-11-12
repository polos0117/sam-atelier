/* 새 판 「삼국지 쟁탈전 · 전장」(draft2) 규칙 — Phaser 와 떨어진 순수 모듈.
   채점 · 정원 · 카드 뽑기 · AI 점수 · 판 진행(상태 한 덩어리)을 여기 둔다. 화면(lib/draft2/scenes.js)은 상태를 읽고 그리며,
   손님의 손(지명 · 다시 뽑기)을 여기로 보낸다. 2단계 전장도 이것을 쓴다.
   옛 게임 draft.html 의 규칙을 옮겼다(그 파일은 고치지 않는다 — CLAUDE.md): 13진 × 후보 6장, 정원 군주 1 · 무장 5 · 참모 5,
   12 · 13번째는 예비(역할 제한 없음) → 11명 편성, 전력(WT 가중) · 진영 결속(SYN, 군웅 계수) · 결의(COMBO) · 주공 그릇.
   능력치는 data/draft2-generals.json(새 판 전용), 진영 · 역할 · 도장 · 열전은 data/sam-design.json,
   결의 · 결속 표는 data/draft2-combos.json, 진영 셈(군웅록 · 본편 네 진영)은 data/draft2-packs.json(둘 다 tools/draft2-extract.cjs 가 옛 판에서 뽑는다).
   진영 셈마다 view(db, 'mx'|'base') 가 따로 있다 — 결속 · 주공 동향 · 손권형 기질 · 적장 기치가 그 셈을 따른다.
   인원은 2인(아군 · 적장) 또는 3인(정립 — 아군 · 적장1 · 적장2, 옛 판 PLAYERS 3).
   난수는 모두 상태 안의 씨앗(st.rng)을 거친다 — 씨앗이 같으면 같은 판(오늘의 대국 · 이어하기 · 검사).
   브라우저에선 window.Draft2Rules, node 에선 require('lib/draft2/rules.js'). */
(function (root, factory) {
  var R = factory();
  if (typeof module === 'object' && module.exports) module.exports = R;
  if (root) root.Draft2Rules = R;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var ROUNDS = 13, FINAL = 11, PACK = 6, REROLLS = 1;
  var CAPS = { lord: 1, general: 5, staff: 5 };
  var CATS = ['lord', 'general', 'staff'];
  /* 역할 가중 — 통솔 · 무력 · 지력 · 정치 (옛 WT 그대로) */
  var WT = { lord: [0.9, 0.4, 0.9, 0.9], general: [1, 1.2, 0.4, 0.2], strategist: [0.6, 0.2, 1.3, 0.7], official: [0.3, 0.1, 1, 1.3] };
  var STATS = ['lead', 'war', 'int', 'pol'];
  var LORD_MIN = 2, LORD_MAX = 14;
  /* 적장 수준 — 하수 · 중수 · 고수. 견제 비중 · 잡음 · 다시 뽑기 문턱(하수는 안 씀) */
  var LEVELS = ['하수', '중수', '고수'], DENY = [0, 0.2, 0.45], NOISE = [70, 20, 5], RR_K = [-1, 0.8, 0.9];
  function rrBase(r) { return 85 + r * 6; }
  /* 적장 기질 다섯 — 옛 AI 기질(조조형 · 유비형 · 손권형 · 여포형 · 사마의형) */
  var STYLES = [
    { key: 'power', ko: '조조형', note: '전력을 우선한다' },
    { key: 'bond', ko: '유비형', note: '인연을 우선한다' },
    { key: 'unity', ko: '손권형', note: '결속을 우선한다' },
    { key: 'might', ko: '여포형', note: '무력만 본다' },
    { key: 'patient', ko: '사마의형', note: '때를 기다린다' }
  ];
  var CAT_KO = { lord: '군주', general: '무장', staff: '참모' };
  /* 본편 네 진영 — 옛 판 FAC 색 */
  var BASE_COLOR = { wei: '#3E5C8C', shu: '#4F7A4A', wu: '#C0472F', qun: '#7A6A55' };
  var FMODES = ['mx', 'w194', 'gd200', 'jb208', 'end263', 'base'];
  var ROLE_KO = { lord: '군주', general: '무장', strategist: '책사', official: '문관' };

  /* ── 자료 ───────────────────────────────── */
  function catOfRole(role) { return role === 'lord' ? 'lord' : role === 'general' ? 'general' : 'staff'; }
  function martialBonus(c) {
    /* 무력이 뛰어난데 지력이 낮아 기본 전력이 깎이는 무장만 메운다(옛 판 그대로) */
    return c.role === 'general' && c.s.war >= 95 ? Math.round((c.s.war - 90) * Math.max(0, 70 - c.s.int) / 40) : 0;
  }
  function power(c) {
    var w = WT[c.role] || WT.official, s = c.s;
    return Math.round((s.lead * w[0] + s.war * w[1] + s.int * w[2] + s.pol * w[3]) / 2.5) + martialBonus(c);
  }
  function lordRate(c) { return Math.round((LORD_MIN + (c.s.lead + c.s.int + c.s.pol) / 300 * (LORD_MAX - LORD_MIN)) * 10) / 10; }

  /* gdoc = draft2-generals.json, sdoc = sam-design.json, cdoc = draft2-combos.json, pdoc = draft2-packs.json(없으면 본편만),
     fdoc = draft2-factions.json(세력 색 · 위촉오 · 결속 곡선 · 군웅 연합), bdoc = draft2-bonds.json(옛 주군 · 배신),
     wdoc = draft2-battlefields.json(전장 일곱 · 거점 꼴) — 뒤 넷은 없어도 돈다(전장이 없으면 2단계 함수를 못 쓴다) */
  function buildDB(gdoc, sdoc, cdoc, pdoc, fdoc, bdoc, wdoc) {
    var design = {}, i, list = [], by = {};
    for (i = 0; i < sdoc.generals.length; i++) design[sdoc.generals[i].key] = sdoc.generals[i];
    for (i = 0; i < gdoc.generals.length; i++) {
      var g = gdoc.generals[i], d = design[g.key];
      if (!d) throw new Error('설계표에 없는 장수: ' + g.key);
      var c = {
        key: g.key, en: d.en || '', fac: d.faction, camp: d.camp || null, role: d.role, cat: catOfRole(d.role),
        s: { lead: g.stats.lead, war: g.stats.war, int: g.stats.int, pol: g.stats.pol },
        cls: g.class || null, sub: g.sub || null, trait: g.trait || null, lordAs: g.lordAs || null, seal: d.seal || g.key.charAt(0), lore: d.lore || '', idx: i
      };
      c.pw = power(c);
      list.push(c); by[c.key] = c;
    }
    var combos = [], byMember = {};
    for (i = 0; i < cdoc.combos.length; i++) {
      var cb = cdoc.combos[i], t = {}, steps = [], k, mx = -1e9;
      for (k in cb.t) { t[+k] = cb.t[k]; steps.push(+k); if (cb.t[k] > mx) mx = cb.t[k]; }
      steps.sort(function (a, b) { return a - b; });
      var m = cb.m.filter(function (n) { return by[n]; });
      var one = { id: i, n: cb.n, kin: !!cb.k, m: m, t: t, steps: steps, max: mx, feud: mx <= 0 };
      combos.push(one);
      m.forEach(function (n) { (byMember[n] = byMember[n] || []).push(one); });
    }
    var coh = (fdoc && fdoc.cohesion) || {}, synSrc = coh.syn || cdoc.syn;
    var syn = {}; for (var sk in synSrc) syn[+sk] = synSrc[sk];
    var league = null;
    if (coh.league) { league = { min: coh.league.min || 2, steps: [], t: {}, names: coh.league.names || {} }; for (var lk in coh.league.t) { league.t[+lk] = coh.league.t[lk]; league.steps.push(+lk); } league.steps.sort(function (a, b) { return a - b; }); }
    /* 결의가 이미 묶은 두 사람 — 옛 주군 재회는 겹쳐 세지 않는다 */
    var pairs = {};
    combos.forEach(function (cb) { for (var a = 0; a < cb.m.length; a++) for (var b2 = 0; b2 < cb.m.length; b2++) if (a !== b2) pairs[cb.m[a] + '|' + cb.m[b2]] = true; });
    var betray = ((bdoc && bdoc.betray) || []).filter(function (x) { return by[x.a] && by[x.b]; });
    var etc = []; for (var ek in cdoc.etc) etc.push([+ek, cdoc.etc[ek]]);
    etc.sort(function (a, b) { return a[0] - b[0]; });
    var fac = {};
    (sdoc.factions || []).forEach(function (f) { fac[f.key] = { ko: f.ko, hanja: f.hanja, c: BASE_COLOR[f.key] || BASE_COLOR.qun }; });
    var packs = (pdoc && pdoc.packs) || {};
    var db = {
      list: list, by: by, combos: combos, byMember: byMember, syn: syn, etcBase: cdoc.etcBase, etc: etc, league: league, pairs: pairs,
      oldLord: (bdoc && bdoc.oldLord) || null, betray: betray, career: packs.mx && packs.mx.career ? packs.mx.career : null,
      fset: (fdoc && fdoc.factions) || {}, alias: (fdoc && fdoc.alias) || {},
      factions: fac, classes: gdoc.classes || {}, traits: gdoc.traits || {}, packs: packs, views: {},
      ftypes: (wdoc && wdoc.types) || {}, fields: {}, fieldList: []
    };
    ((wdoc && wdoc.fields) || []).forEach(function (f) { db.fields[f.key] = f; db.fieldList.push(f.key); });
    return view(db, 'base');
  }

  /* 진영 셈 — 'base'(본편 위 · 촉 · 오 · 군웅) 또는 팩 열쇠('mx' 군웅록 …). 같은 db 를 바탕으로 결속에 쓰는 세력만 다르다.
     facs[장수] = 세력 목록(군웅록은 거친 세력 모두 — 옛 facsOf, 마지막이 facOf), facInfo[세력] = {ko, h, c} */
  var MAJOR_OF = { wei: '조위', shu: '촉한', wu: '동오' };
  /* 장수의 이력(군웅록 career). 없으면 그림 설계표 세력 하나 */
  function careerOf(root, key) { var c = root.career && root.career[key]; return c && c.length ? c : [root.factions[root.by[key].fac] ? root.factions[root.by[key].fac].ko : root.by[key].fac]; }
  /* 세력 정보 — 새 판 세력 표(draft2-factions.json) → 그 별칭(연도 팩의 그해 세력) → 팩 · 설계표의 색 */
  function facEntry(root, f, packFac) {
    var e = root.fset[f] || root.fset[root.alias[f]];
    if (e) return { ko: f, h: e.h, c: e.c, major: !!e.major };
    if (packFac) return { ko: f, h: packFac.h, c: packFac.c, major: false };
    for (var k in root.factions) if (root.factions[k].ko === f) return { ko: f, h: root.factions[k].hanja, c: root.factions[k].c, major: k !== 'qun' };
    return { ko: f, h: f.charAt(0), c: BASE_COLOR.qun, major: false };
  }
  /* 진영 셈 — 'base'(위 · 촉 · 오 + 군웅 세력) 또는 팩 열쇠('mx' 군웅록 · 연도 팩 w194 · gd200 · jb208 · end263).
     같은 db 를 바탕으로 결속에 쓰는 세력 · 군주 바꿈 · 장수 범위만 다르다.
     facs[장수] = 세력 목록(군웅록은 거친 세력 모두 — 옛 facsOf, 마지막이 facOf), facInfo[세력] = {ko, h, c, major} */
  function view(db, mode) {
    var root = db.root || db;
    mode = mode && (mode === 'base' || root.packs[mode]) ? mode : 'base';
    if (root.views[mode]) return root.views[mode];
    var v = Object.create(root), p = mode === 'base' ? null : root.packs[mode], facs = {}, info = {}, members = null, k;
    v.root = root; v.mode = mode; v.cache = {}; v.cacheN = 0;
    root.list.forEach(function (c) {
      var car = careerOf(root, c.key), f;
      if (!p) {
        /* 본편 — 위 · 촉 · 오 장수는 그 나라, 군웅은 하나로 묶지 않고 이력의 주 세력(위촉오가 아닌 마지막 세력, 없으면 마지막) */
        if (MAJOR_OF[c.fac]) f = MAJOR_OF[c.fac];
        else { var own = car.filter(function (x) { return !facEntry(root, x).major; }); f = own.length ? own[own.length - 1] : car[car.length - 1]; }
        facs[c.key] = [f];
      } else if (p.career) facs[c.key] = car.slice();
      else facs[c.key] = [(p.facMap && p.facMap[c.key]) || car[car.length - 1]];
    });
    /* 연도 팩(facMap) — 그해에 없는 장수는 나오지 않는다(옛 eraPool 그대로) */
    if (p && p.facMap && !p.career) { members = {}; for (k in p.facMap) members[k] = true; }
    Object.keys(facs).forEach(function (key) { facs[key].forEach(function (f) { if (!info[f]) info[f] = facEntry(root, f, p && p.factions[f]); }); });
    if (p) for (k in p.factions) if (!info[k]) info[k] = facEntry(root, k, p.factions[k]);
    /* 팩의 roleMap(군웅록 — 여포 · 장수 · 장각 · 맹획을 군주로, 사용자 2026-11-12 「군주로 바꿔주긴하는데」, 연도 팩도 그해의 것) — 그 팩에서만 군주 카드로 바꿔 끼운다.
       정원 · 주공 그릇 · AI 는 다른 군주와 같다. 기질은 draft2-generals.json 의 lordAs, 갈래는 남겨 둔다(카드에 함께 보인다).
       전력(pw)은 본디 역할의 가중 그대로 — 옛 판도 power 는 본디 역할(c[2])로 셌다 */
    var by = root.by, list = root.list;
    if (p && p.roleMap) {
      by = Object.create(root.by);
      for (k in p.roleMap) {
        var c0 = root.by[k];
        if (!c0 || p.roleMap[k] !== '군주' || c0.role === 'lord') continue;
        by[k] = Object.assign({}, c0, { role: 'lord', cat: 'lord', trait: c0.lordAs ? c0.lordAs.trait : null, baseRole: c0.role, asLord: true });
      }
      list = root.list.map(function (c) { return by[c.key]; });
    }
    v.by = by; v.list = list; v.members = members;
    v.facs = facs; v.facInfo = info; v.synMul = p ? p.synMul || 1 : 1; v.bias = p ? p.bias || 0 : BASE_BIAS; v.etcKey = '군웅';
    v.packName = p ? p.n : '위촉오 + 군웅';
    root.views[mode] = v;
    return v;
  }
  /* 본편도 적장 기치를 든다 — 군웅을 세력으로 나눈 뒤(2026-11-12) 옛 팩과 같은 값. 옛 본편은 기치가 없었다 */
  var BASE_BIAS = 25;
  /* 「군웅」 기치 — 세력 하나가 아니라 위 · 촉 · 오가 아닌 세력 모두 */
  /* 군웅 기치는 군웅 카드마다 bias × 3 — 시뮬(3인 · 고수)로 맞췄다: 군웅 다수 팀이 600팀 중 29 → 133 */
  var GUILD = '군웅', GUILD_MUL = 3;
  function flagHit(db, flag, key) {
    if (!flag) return false;
    var fs = db.facs[key];
    if (flag === GUILD) { for (var i = 0; i < fs.length; i++) if (!isMajor(db, fs[i])) return true; return false; }
    return fs.indexOf(flag) >= 0;
  }
  function isMajor(db, f) { return !!(db.facInfo[f] && db.facInfo[f].major); }
  function inScope(db, key) { return !db.members || !!db.members[key]; }
  function facsOf(db, key) { return db.facs[key]; }
  function facOf(db, key) { var a = db.facs[key]; return a[a.length - 1]; }
  function facColor(db, f) { return (db.facInfo[f] && db.facInfo[f].c) || BASE_COLOR.qun; }
  function shareFac(db, a, b) { var x = db.facs[a], y = db.facs[b]; for (var i = 0; i < x.length; i++) if (y.indexOf(x[i]) >= 0) return true; return false; }

  /* ── 채점 ───────────────────────────────── */
  function cards(db, keys) { return keys.map(function (k) { return db.by[k]; }); }
  function counts(db, keys) {
    var o = { lord: 0, general: 0, staff: 0 };
    for (var i = 0; i < keys.length; i++) o[db.by[keys[i]].cat]++;
    return o;
  }
  function overflow(db, keys) {
    var n = counts(db, keys), over = 0;
    CATS.forEach(function (k) { over += Math.max(0, n[k] - CAPS[k]); });
    return over;
  }
  function stepValue(cb, hit) {
    var best = 0, bk = 0;
    for (var i = 0; i < cb.steps.length; i++) if (hit >= cb.steps[i] && cb.steps[i] >= bk) { bk = cb.steps[i]; best = cb.t[bk]; }
    return { v: best, k: bk };
  }
  function comboHave(cb, set) { var n = 0; for (var i = 0; i < cb.m.length; i++) if (set[cb.m[i]]) n++; return n; }
  function keySet(keys) { var o = {}; for (var i = 0; i < keys.length; i++) o[keys[i]] = true; return o; }

  /* 한 편(11명 이하)의 점수 — 줄마다 {kind, label, v} */
  function evaluateRaw(db, keys) {
    var out = { rows: [], total: 0 }, base = 0, i, team = cards(db, keys), set = keySet(keys);
    for (i = 0; i < team.length; i++) base += team[i].pw;
    out.rows.push({ kind: 'power', label: '장수 전력 합', v: base });
    /* 진영 결속 — 같은 진영 n 명(군웅록은 거친 세력마다 센다). 팩의 결속 배수, 본편 군웅은 기본 etcBase 배 · 넷 · 여섯이면 할거 */
    var cnt = {}, order = [];
    for (i = 0; i < team.length; i++) db.facs[team[i].key].forEach(function (f) { if (!cnt[f]) { cnt[f] = 0; order.push(f); } cnt[f]++; });
    order.forEach(function (f) {
      var n = cnt[f], p = db.syn[n] || 0, ex = 0;
      if (db.synMul !== 1) p = Math.round(p * db.synMul);
      if (f === db.etcKey) {
        var mul = db.etcBase;
        db.etc.forEach(function (e) { if (n >= e[0]) mul = e[1]; });
        ex = Math.round(p * mul) - Math.round(p * db.etcBase);
        p = Math.round(p * db.etcBase);
      }
      if (p) out.rows.push({ kind: 'syn', label: '진영 결속 · ' + f + ' ' + n + '인', v: p, fac: f });
      if (ex) out.rows.push({ kind: 'etc', label: '군웅할거 · ' + n + '인 규합', v: ex, fac: f });
      base += p + ex;
    });
    /* 군웅 연합 — 위 · 촉 · 오가 아닌 서로 다른 세력에서 각 min 명 이상 모은 세력 수 */
    if (db.league) {
      var lg = order.filter(function (f) { return cnt[f] >= db.league.min && !isMajor(db, f); });
      var lv = 0, ls = 0;
      db.league.steps.forEach(function (st) { if (lg.length >= st) { ls = st; lv = db.league.t[st]; } });
      if (lv) { out.rows.push({ kind: 'league', label: (db.league.names[ls] || '군웅 연합') + ' · ' + lg.join(' · '), v: lv, facs: lg }); base += lv; }
    }
    /* 결의 · 혈연 · 불화 */
    for (i = 0; i < db.combos.length; i++) {
      var cb = db.combos[i], hit = comboHave(cb, set);
      if (hit < 2) continue;
      var sv = stepValue(cb, hit);
      if (sv.v) {
        out.rows.push({ kind: sv.v < 0 ? 'feud' : cb.kin ? 'kin' : 'combo', label: (cb.kin ? '혈연 · ' : '') + cb.n, v: sv.v, id: cb.id, have: hit });
        base += sv.v;
      }
    }
    /* 주공 — 군주가 여럿이면 그릇이 큰 이 */
    var lord = null;
    for (i = 0; i < team.length; i++) if (team[i].role === 'lord' && (!lord || lordRate(team[i]) > lordRate(lord))) lord = team[i];
    /* 옛 주군 재회 · 배신 */
    var bd = bondRows(db, team, set, lord);
    bd.forEach(function (r) { out.rows.push(r); base += r.v; });
    /* 주공의 그릇 — 같은 진영이 많을수록 다 받는다 */
    if (lord) {
      var same = 0;
      for (i = 0; i < team.length; i++) if (shareFac(db, team[i].key, lord.key)) same++;
      var eff = Math.round(lordRate(lord) * (0.5 + 0.5 * same / team.length) * 10) / 10, b = Math.round(base * eff / 100);
      out.rows.push({ kind: 'lord', label: '주공 ' + lord.key + '의 그릇 +' + eff + '%' + (same < team.length ? ' (동향 ' + same + '인)' : ''), v: b, lord: lord.key });
      base += b;
    }
    out.total = Math.round(base);
    return out;
  }

  /* 옛 주군 재회(이력에서) · 배신(손으로 적은 표) 줄 */
  function reunions(db, team, lord) {
    if (!db.oldLord || !lord || !db.career) return [];
    var lc = careerOf(db.root || db, lord.key), lf = lc[lc.length - 1];
    return team.filter(function (c) {
      if (c.key === lord.key) return false;
      var ca = careerOf(db.root || db, c.key);
      return ca.indexOf(lf) >= 0 && ca[ca.length - 1] !== lf && !db.pairs[lord.key + '|' + c.key];
    }).map(function (c) { return c.key; });
  }
  function bondRows(db, team, set, lord) {
    var rows = [], re = reunions(db, team, lord);
    if (re.length) rows.push({ kind: 'bond', label: '옛 주군 · ' + lord.key + ' 재회 ' + re.length + '인', v: Math.min(db.oldLord.cap, re.length * db.oldLord.v), who: re, lord: lord.key });
    db.betray.forEach(function (x) { if (set[x.a] && set[x.b]) rows.push({ kind: 'betray', label: '배신 · ' + x.a + '와 ' + x.b, v: x.v, why: x.why }); });
    return rows;
  }
  /* 결의 창 — 옛 주군 · 배신 진척: 지금 주공의 재회 사람, 배신 짝(둘 다 있으면 받은 것, 하나면 남은 사람) */
  function bondsOf(db, keys) {
    if (keys.length > FINAL) keys = bestLineup(db, keys).team;
    var team = cards(db, keys), set = keySet(keys), lord = null;
    team.forEach(function (c) { if (c.role === 'lord' && (!lord || lordRate(c) > lordRate(lord))) lord = c; });
    var re = reunions(db, team, lord);
    return {
      lord: lord && lord.key, lordFac: lord && db.career ? careerOf(db.root || db, lord.key).slice(-1)[0] : null, reunion: re,
      v: db.oldLord ? Math.min(db.oldLord.cap, re.length * db.oldLord.v) : 0, each: db.oldLord ? db.oldLord.v : 0, cap: db.oldLord ? db.oldLord.cap : 0,
      betray: db.betray.filter(function (x) { return set[x.a] || set[x.b]; }).map(function (x) { return { a: x.a, b: x.b, v: x.v, why: x.why, got: !!(set[x.a] && set[x.b]), miss: set[x.a] ? x.b : x.a }; })
    };
  }

  /* 11명이 넘으면 가장 좋은 11명(정원 초과가 가장 적고, 그 가운데 점수가 높은) */
  function bestLineup(db, keys) {
    if (keys.length <= FINAL) return { team: keys.slice(), over: overflow(db, keys), score: evaluateRaw(db, keys).total };
    var ck = keys.join(',');
    if (db.cache[ck]) return db.cache[ck];
    var best = null, picked = [];
    (function visit(pos) {
      if (picked.length === FINAL) {
        var over = overflow(db, picked);
        if (best && over > best.over) return;
        var score = evaluateRaw(db, picked).total;
        if (!best || over < best.over || score > best.score) best = { team: picked.slice(), over: over, score: score };
        return;
      }
      if (keys.length - pos < FINAL - picked.length) return;
      for (var i = pos; i < keys.length; i++) { picked.push(keys[i]); visit(i + 1); picked.pop(); }
    })(0);
    if (db.cacheN > 400) { db.cache = {}; db.cacheN = 0; }
    db.cacheN++; db.cache[ck] = best;
    return best;
  }
  function evaluate(db, keys) { return evaluateRaw(db, keys.length > FINAL ? bestLineup(db, keys).team : keys); }
  /* 뽑으면 얼마 — 점수 차와 새로 맺거나 깊어지는 것들 */
  function hintOf(db, keys, key) {
    var a = evaluate(db, keys), b = evaluate(db, keys.concat([key])), m = {}, names = [];
    a.rows.forEach(function (r) { m[r.label] = r.v; });
    b.rows.forEach(function (r) {
      if (r.kind === 'power' || r.kind === 'lord') return;
      if ((m[r.label] || 0) !== r.v) names.push({ label: r.label.replace('진영 결속 · ', '결속 ').replace('혈연 · ', '혈연 '), kind: r.kind, v: r.v });
    });
    return { d: b.total - a.total, names: names };
  }

  /* 결의 진척 — 한 편의 결의마다 모인 수 · 받은 점수 · 다음 단계 */
  function pledges(db, keys) {
    if (keys.length > FINAL) keys = bestLineup(db, keys).team;
    var set = keySet(keys), out = [];
    db.combos.forEach(function (cb) {
      var have = cb.m.filter(function (n) { return set[n]; });
      if (!have.length) return;
      var sv = stepValue(cb, have.length), next = 0;
      for (var i = 0; i < cb.steps.length; i++) if (cb.steps[i] > have.length) { next = cb.steps[i]; break; }
      if (!sv.v && !next) return;
      out.push({ id: cb.id, n: cb.n, kin: cb.kin, feud: cb.feud, have: have, got: sv.v, gotk: sv.k, next: next, nextV: next ? cb.t[next] : 0,
        miss: cb.m.filter(function (n) { return !set[n]; }) });
    });
    out.sort(function (a, b) { return ((b.got ? 1 : 0) - (a.got ? 1 : 0)) || (b.have.length - a.have.length); });
    return out;
  }

  /* ── 난수 — 상태에 든 씨앗(mulberry32, 옛 판과 같은 식) ── */
  function rand(st) {
    st.rng = (st.rng + 0x6D2B79F5) >>> 0;
    var t = st.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /* 오늘의 대국 씨앗 — 날짜(YYYYMMDD) + 방 이름의 FNV-1a */
  function todaySeed(date, room) {
    var d = date || new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var s = '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + (room || 'samguk_draft2'), h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h || 1;
  }

  /* ── 판 ─────────────────────────────────── */
  var TEAM = { me: 'mine', foe: 'foe', foe2: 'foe2' };
  function teamOf(st, seat) { return st[TEAM[seat]]; }
  function others(st, seat) { return st.seats.filter(function (s) { return s !== seat; }); }
  function openIdx(st) { var r = []; for (var i = 0; i < st.pack.length; i++) if (!st.pack[i].by) r.push(i); return r; }
  function rawLegal(db, team, st, idxs) {
    if (team.length >= FINAL) return idxs.slice();
    var n = counts(db, team);
    return idxs.filter(function (i) { var c = db.by[st.pack[i].k].cat; return n[c] < CAPS[c]; });
  }
  /* 고를 수 있는 후보 — 정원이 찬 역할은 막고, 다 막히면 풀어 준다(옛 판 그대로) */
  function legal(db, st, seat) {
    var rem = openIdx(st), ok = rawLegal(db, teamOf(st, seat), st, rem);
    return ok.length ? ok : rem;
  }
  function weightedPick(st, keys) {
    var w = keys.map(function (k) { var r = st.recent[k]; return r === undefined ? 1 : (st.round - r <= 1 ? 0.18 : st.round - r <= 3 ? 0.45 : 1); });
    var sum = 0, i; for (i = 0; i < w.length; i++) sum += w[i];
    var v = rand(st) * sum;
    for (i = 0; i < keys.length; i++) { v -= w[i]; if (v < 0) return i; }
    return keys.length - 1;
  }
  /* 더미에서 n 장 — 막 본 카드는 덜 나오게(최근 1진 18% · 3진 45%) */
  function draw(st, n, exclude) {
    var out = [], ex = keySet(exclude || []);
    while (out.length < n) {
      var bag = [], at = [];
      for (var i = 0; i < st.pool.length; i++) if (!ex[st.pool[i]]) { bag.push(st.pool[i]); at.push(i); }
      if (!bag.length) break;
      var j = weightedPick(st, bag), k = st.pool.splice(at[j], 1)[0];
      out.push(k); st.recent[k] = st.round;
    }
    return out;
  }
  function needKeys(players) { return ROUNDS * players + PACK; }

  /* o = {keys(장수 범위), seed, lv(0~2), world, scope, daily, players(2|3), fmode('mx'|'base'), first('me'|'foe'|'foe2'),
         styles({foe, foe2} 0~4, 없으면 씨앗으로), rerolls}. db 는 아무 view 나 — 판은 o.fmode 의 view 로 돈다 */
  function newGame(db, o) {
    var seed = (o.seed >>> 0) || 1, players = o.players === 2 ? 2 : 3, fmode = FMODES.indexOf(o.fmode) >= 0 ? o.fmode : 'mx';
    var seats = players === 3 ? ['me', 'foe', 'foe2'] : ['me', 'foe'];
    db = view(db, fmode);
    var rr = o.rerolls == null ? REROLLS : o.rerolls;
    var st = {
      v: 2, id: o.id || ('g' + seed.toString(36)), seed: seed, rng: seed, world: o.world || 'samguk', scope: o.scope || 'art',
      lv: Math.max(0, Math.min(2, o.lv | 0)), daily: !!o.daily, players: players, fmode: fmode, seats: seats,
      first: Math.max(0, seats.indexOf(o.first || 'me')),
      pool: o.keys.filter(function (k) { return db.by[k] && inScope(db, k); }), mine: [], foe: [], foe2: players === 3 ? [] : null, round: 0, pack: [], q: [],
      rerolls: { me: rr, foe: rr, foe2: players === 3 ? rr : 0 },
      recent: {}, excluded: [], log: [], phase: 'draft', lineup: null, result: null, styles: {}, aiFac: {}
    };
    seats.slice(1).forEach(function (s) { st.styles[s] = o.styles && o.styles[s] != null ? o.styles[s] : Math.floor(rand(st) * STYLES.length); });
    /* 적장 기치(옛 aiFac) — 진영 셈에 결속 배수가 있는 팩이면 장수 범위에서 다섯 이상인 세력 가운데 하나씩, 겹치지 않게 */
    if (db.bias) {
      var cnt = {}, fk = [];
      st.pool.forEach(function (k) { db.facs[k].forEach(function (f) { cnt[f] = (cnt[f] || 0) + 1; }); });
      Object.keys(cnt).forEach(function (f) { if (cnt[f] >= 5 && db.facInfo[f]) fk.push(f); });
      /* 둘째 적장(3인)은 「군웅」 기치 — 위 · 촉 · 오가 아닌 세력 장수를 모두 반긴다(AI 가 군웅 쪽으로도 노리게, 2026-11-12).
         첫째는 옛 판처럼 다섯 이상인 세력 하나 */
      seats.slice(1).forEach(function (s, si) {
        if (si === 1) { st.aiFac[s] = GUILD; return; }
        var left = fk.filter(function (f) { return seats.every(function (t) { return st.aiFac[t] !== f; }); });
        var from = left.length ? left : fk;
        st.aiFac[s] = from.length ? from[Math.floor(rand(st) * from.length)] : null;
      });
    }
    st.field = pickField(db, seed, fmode, o.field);
    startRound(db, st);
    return st;
  }
  function startRound(db, st) {
    st.excluded = [];
    st.pack = draw(st, PACK).map(function (k) { return { k: k, by: null }; });
    var rot = (st.round + st.first) % st.seats.length;
    st.q = st.seats.slice(rot).concat(st.seats.slice(0, rot));
    var row = { round: st.round, first: st.q[0], rr: [] };
    st.seats.forEach(function (s) { row[s] = ''; });
    st.log.push(row);
  }
  function turn(st) { return st.phase === 'draft' ? (st.q[0] || null) : null; }
  /* 차례가 오면 먼저 — 고를 수 있는 후보가 둘 아래면 정원이 찬 역할의 카드를 더미의 맞는 카드로 바꿔 준다 */
  function ensureChoices(db, st, seat) {
    var team = teamOf(st, seat);
    if (team.length >= FINAL) return 0;
    var rem = openIdx(st), need = Math.min(2, rem.length), changed = 0, ex = keySet(st.excluded);
    while (rawLegal(db, team, st, rem).length < need) {
      var n = counts(db, team), bag = [], at = [];
      for (var i = 0; i < st.pool.length; i++) {
        var c = db.by[st.pool[i]];
        if (n[c.cat] >= CAPS[c.cat] || ex[c.key]) continue;
        bag.push(c.key); at.push(i);
      }
      if (!bag.length) break;
      var dest = -1;
      for (var r = 0; r < rem.length; r++) { var cc = db.by[st.pack[rem[r]].k].cat; if (n[cc] >= CAPS[cc]) { dest = rem[r]; break; } }
      if (dest < 0) break;
      var j = weightedPick(st, bag), k = st.pool.splice(at[j], 1)[0], old = st.pack[dest].k;
      st.pack[dest].k = k; st.recent[k] = st.round; st.pool.push(old); changed++;
    }
    return changed;
  }
  function pick(db, st, seat, idx) {
    if (turn(st) !== seat) throw new Error('차례가 아니다: ' + seat);
    if (legal(db, st, seat).indexOf(idx) < 0) throw new Error('고를 수 없는 후보: ' + idx);
    var e = st.pack[idx];
    e.by = seat; teamOf(st, seat).push(e.k); st.q.shift();
    st.log[st.log.length - 1][seat] = e.k;
    return e.k;
  }
  /* 펼친 후보를 다 물리고 새로 6장. 새로 펼칠 만큼 없으면 그대로(횟수도 그대로) */
  function reroll(db, st, seat) {
    if (turn(st) !== seat || st.rerolls[seat] < 1) return 0;
    var exclude = st.pack.map(function (e) { return e.k; }), next = st.excluded.concat(exclude.filter(function (k) { return st.excluded.indexOf(k) < 0; }));
    var ex = keySet(next), avail = 0;
    for (var i = 0; i < st.pool.length; i++) if (!ex[st.pool[i]]) avail++;
    if (avail < PACK) return 0;
    var fresh = draw(st, PACK, next);
    st.pack.forEach(function (e) { if (!e.by) st.pool.push(e.k); });
    st.pack = fresh.map(function (k) { return { k: k, by: null }; });
    st.excluded = next;
    st.rerolls[seat]--;
    st.log[st.log.length - 1].rr.push(seat);
    ensureChoices(db, st, seat);
    return fresh.length;
  }
  /* 진이 끝나면 남은 후보는 더미로 돌아간다. 13진이 끝나면 편성(lineup) */
  function endRound(db, st) {
    if (st.q.length) throw new Error('아직 차례가 남았다');
    st.pack.forEach(function (e) { if (!e.by) st.pool.push(e.k); });
    st.pack = [];
    st.round++;
    if (st.round >= ROUNDS) { st.phase = 'lineup'; st.lineup = bestLineup(db, st.mine).team.slice(); return 'lineup'; }
    startRound(db, st);
    return 'next';
  }

  /* 이 카드를 뽑으면 다가서는 결의 — 다음 단계에 아직 닿지 않았지만, 남은 사람(더미 · 펼친 후보에 있는)으로 닿을 수 있는 것 */
  function nearOf(db, st, seat, key) {
    var team = teamOf(st, seat), set = keySet(team), taken = {}, res = [];
    others(st, seat).forEach(function (s) { teamOf(st, s).forEach(function (k) { taken[k] = true; }); });
    var live = keySet(st.pool.concat(st.pack.filter(function (e) { return !e.by; }).map(function (e) { return e.k; })));
    (db.byMember[key] || []).forEach(function (cb) {
      if (cb.feud) return;
      var w = comboHave(cb, set) + 1;
      if (w < 2) return;
      var fires = cb.t[w] !== undefined, next = 0;
      for (var i = 0; i < cb.steps.length; i++) if (cb.steps[i] > w) { next = cb.steps[i]; break; }
      if (fires || !next) return;
      var avail = cb.m.filter(function (n) { return n !== key && !set[n] && !taken[n] && live[n]; }).length;
      if (w + avail >= next) res.push({ n: cb.n, kin: cb.kin, w: w, next: next });
    });
    return res;
  }

  /* ── AI ─────────────────────────────────── */
  function styleScore(db, c, team, style) {
    var i, b = 0, list = db.byMember[c.key] || [], set = keySet(team);
    if (style === 0) return c.pw * 0.35;
    if (style === 3) return c.s.war * 0.6;
    if (style === 2) { var n = 0; for (i = 0; i < team.length; i++) if (shareFac(db, team[i], c.key)) n++; return n * 30; }
    /* 유비형 · 사마의형 — 결의(불화는 빼고: 옛 판은 불화 짝도 반겼다) */
    for (i = 0; i < list.length; i++) {
      var cb = list[i]; if (cb.max <= 0) continue;
      var hv = comboHave(cb, set);
      b += style === 1 ? hv * 22 + cb.max * 0.14 : cb.max * 0.12 * (hv > 0 ? 1.6 : 1) + hv * 13;
    }
    return b;
  }
  /* 상대의 결의가 한 명 앞이면 그 사람을 끊는 값(고수) */
  function threatScore(db, c, opp) {
    var t = 0, set = keySet(opp), list = db.byMember[c.key] || [];
    if (set[c.key]) return 0;
    for (var i = 0; i < list.length; i++) { var cb = list[i], hv = comboHave(cb, set), v = cb.t[hv + 1]; if (v > 0) t += v; }
    return t;
  }
  /* 견제 배수 — 상대가 둘이면 앞선 쪽 1.2 · 뒤진 쪽 0.85(옛 aiPick 의 wMe · wOt), 하나면 1 */
  function denyWeights(ob) { return ob.length === 2 ? [ob[0] >= ob[1] ? 1.2 : 0.85, ob[1] > ob[0] ? 1.2 : 0.85] : ob.map(function () { return 1; }); }
  /* 그 자리의 AI 한 수 — 다시 뽑거나(그것도 한 수, 다시 불러야 한다) 하나를 고른다.
     점수 = 이득 + 견제(상대가 그 카드로 얻을 것 — 3인이면 앞선 쪽 1.2배 · 뒤진 쪽 0.85배, 옛 aiPick) + 고수의 위협 + 기질 + 기치 + 잡음 */
  function aiAct(db, st, seat, lv, style) {
    lv = lv == null ? st.lv : lv; style = style == null ? (st.styles[seat] || 0) : style;
    var team = teamOf(st, seat), opps = others(st, seat), rem = legal(db, st, seat), i;
    if (st.rerolls[seat] > 0 && RR_K[lv] > 0 && st.round < ROUNDS - 1) {
      var tb0 = evaluate(db, team).total, bg0 = -1e9;
      for (i = 0; i < rem.length; i++) bg0 = Math.max(bg0, evaluate(db, team.concat([st.pack[rem[i]].k])).total - tb0);
      if (bg0 < rrBase(st.round) * RR_K[lv] && reroll(db, st, seat)) return { type: 'reroll' };
    }
    var ob = opps.map(function (s) { return evaluate(db, teamOf(st, s)).total; });
    var w = denyWeights(ob);
    var flag = st.aiFac && st.aiFac[seat], best = rem[0], bs = -1e9, why = null, tb = evaluate(db, team).total;
    for (i = 0; i < rem.length; i++) {
      var c = db.by[st.pack[rem[i]].k];
      var gain = evaluate(db, team.concat([c.key])).total - tb;
      var deny = -1e9, threat = 0;
      for (var j = 0; j < opps.length; j++) {
        var ot = teamOf(st, opps[j]);
        deny = Math.max(deny, (evaluate(db, ot.concat([c.key])).total - ob[j]) * w[j]);
        if (lv === 2) threat = Math.max(threat, threatScore(db, c, ot));
      }
      threat *= 0.3;
      var sty = styleScore(db, c, team, style), fb = flagHit(db, flag, c.key) ? (flag === GUILD ? db.bias * GUILD_MUL : db.bias) : 0;
      var sc = gain + DENY[lv] * deny + threat + sty + fb + rand(st) * NOISE[lv];
      if (sc > bs) { bs = sc; best = rem[i]; why = { gain: Math.round(gain), deny: Math.round(DENY[lv] * deny + threat), style: Math.round(sty), flag: fb }; }
    }
    var key = pick(db, st, seat, best);
    return { type: 'pick', idx: best, key: key, why: why };
  }

  /* ── 편성 · 결과 ─────────────────────────── */
  function lineupCheck(db, st, keys) {
    var ok = keys.length === FINAL && keys.every(function (k) { return st.mine.indexOf(k) >= 0; }) && new Set(keys).size === FINAL;
    var rec = bestLineup(db, st.mine), over = overflow(db, keys);
    return { ok: ok && over <= rec.over, over: over, need: rec.over, counts: counts(db, keys) };
  }
  /* 11명 확정 → 채점(임시 결과: 2단계 전장 전까지 옛 판처럼 점수 비교). 순위는 높은 점수부터, 같은 점수는 같은 순위 */
  function finalize(db, st, keys) {
    var chk = lineupCheck(db, st, keys);
    if (!chk.ok) throw new Error('편성이 맞지 않는다');
    var sides = st.seats.map(function (s) {
      var all = teamOf(st, s), team = s === 'me' ? keys.slice() : bestLineup(db, all).team.slice();
      return { seat: s, team: team, reserve: all.filter(function (k) { return team.indexOf(k) < 0; }), ev: evaluateRaw(db, team) };
    });
    sides.forEach(function (x) { x.rank = 1 + sides.filter(function (y) { return y.ev.total > x.ev.total; }).length; x.tied = sides.some(function (y) { return y !== x && y.ev.total === x.ev.total; }); });
    var me = sides[0], op = sides.slice(1).reduce(function (a, b) { return b.ev.total > a.ev.total ? b : a; });
    st.result = { sides: sides, me: me.ev, op: op.ev, opSeat: op.seat, rank: me.rank, tied: me.tied, mine: me.team, reserve: me.reserve,
      foe: sides[1].team, foeReserve: sides[1].reserve, d: me.ev.total - op.ev.total };
    /* 2단계 — 편성이 끝나면 전장으로. 전장 자료가 없으면(옛 검사 · 자료만) 그대로 끝 */
    if (db.fieldList && db.fieldList.length) startBattle(db, st);
    else st.phase = 'done';
    return st.result;
  }

  /* 이어하기 — 저장된 상태가 이 자료로 온전한지(판 모양 v2 — 1단계 저장은 버린다). 전장(battle) 중이면 리그 모양도 */
  function restore(db, v) {
    try {
      if (!v || v.v !== 2 || ['draft', 'lineup', 'battle'].indexOf(v.phase) < 0) return null;
      if (v.phase === 'battle' && !(v.battle && Array.isArray(v.battle.matches) && db.fields[v.battle.field] && v.result && v.result.sides)) return null;
      if (!Array.isArray(v.seats) || v.seats.length !== v.players || v.seats[0] !== 'me' || FMODES.indexOf(v.fmode) < 0) return null;
      if (v.players === 3 && !Array.isArray(v.foe2)) return null;
      var all = [].concat(v.pool, v.mine, v.foe, v.foe2 || [], v.pack.map(function (e) { return e.k; }));
      if (all.some(function (k) { return !db.by[k]; })) return null;
      if (!Number.isInteger(v.round) || v.round < 0 || v.round > ROUNDS) return null;
      if (!Array.isArray(v.q) || v.q.some(function (s) { return v.seats.indexOf(s) < 0; })) return null;
      if (v.seats.some(function (s) { return teamOf(v, s).length > ROUNDS; })) return null;
      return v;
    } catch (e) { return null; }
  }

  /* ── 2단계 전장 — 배치 · 겨루기 · 리그 ─────────────────
     사용자 2026-11-12 「둘씩 돌아가며로 하고 2단계 진행해줘」. 11명 가운데 8명을 거점 여덟에 하나씩(남은 셋은 후군 — 3단계 계략 자리, 지금은 효과 없음).
     거점 값 = 꼴의 겨루는 값 × 갈래 맞춤(주 1.15 · 부 1.07). 한 합은 양쪽을 씨앗 난수로 ±6% 흔들어 높은 쪽이 차지(3% 안쪽은 접전).
     거점이 많은 쪽이 이기고, 같으면 본진(hq) → 이긴 거점 값 차이 합. 편성 점수(evaluate)는 승패와 상관없다(결과에 참고로만).
     3인은 리그 — 아군 · 적장1, 아군 · 적장2, 적장1 · 적장2 세 판을 같은 전장에서. 순위는 승수 → 차지한 거점 합 → 편성 점수 */
  var DEPLOY = 8, FIT_MAIN = 1.15, FIT_SUB = 1.07, JITTER = 0.06, CLOSE = 0.03, DEP_NOISE = [0.22, 0.08, 0];
  /* 천하(연도)에 맞는 전장 — 무작위의 기본 쪽 */
  var FIELD_YEAR = { w194: ['hulao'], gd200: ['guandu'], jb208: ['chibi', 'changban'], end263: ['wuzhang', 'hanzhong'] };
  function pickField(db, seed, fmode, want) {
    if (!db.fieldList || !db.fieldList.length) return null;
    if (want && db.fields[want]) return want;
    var list = (FIELD_YEAR[fmode] || db.fieldList).filter(function (k) { return db.fields[k]; });
    if (!list.length) list = db.fieldList;
    var tmp = { rng: (seed ^ 0x9E3779B9) >>> 0 || 7 };   // 지명 난수와 따로 — 전장을 골라도 지명 판은 같다
    return list[Math.floor(rand(tmp) * list.length)];
  }
  function slotStat(c, type) {
    var s = c.s;
    switch (type) {
      case 'fort': case 'water': return s.lead;
      case 'front': return s.war;
      case 'raid': return (s.war + s.lead) / 2;
      case 'height': return (s.war + s.int) / 2;
      case 'scheme': case 'mystic': return s.int;
      case 'supply': return s.pol;
      case 'hq': return c.role === 'lord' ? (s.lead + s.int + s.pol) / 3 + lordRate(c) : (s.lead + s.int) / 2;
    }
    return 0;
  }
  function fitOf(db, c, type) {
    var f = (db.ftypes[type] && db.ftypes[type].fit) || [];
    if (c.role === 'lord' && f.indexOf('lord') >= 0) return 'main';
    if (c.cls && f.indexOf(c.cls) >= 0) return 'main';
    if (c.sub && f.indexOf(c.sub) >= 0) return 'sub';
    return null;
  }
  /* 장수 하나가 그 꼴의 거점에서 내는 값 */
  function slotValue(db, key, type) {
    var c = db.by[key], stat = slotStat(c, type), fit = fitOf(db, c, type);
    return { stat: Math.round(stat * 10) / 10, fit: fit, v: Math.round(stat * (fit === 'main' ? FIT_MAIN : fit === 'sub' ? FIT_SUB : 1) * 10) / 10 };
  }
  function validDeploy(db, keys, fieldKey, dep) {
    var f = db.fields[fieldKey], used = {}, n = 0;
    if (!f || !dep) return { ok: false, n: 0 };
    for (var sk in dep) {
      var k = dep[sk];
      if (!k) continue;
      if (!f.slots.some(function (s) { return s.key === sk; }) || keys.indexOf(k) < 0 || used[k]) return { ok: false, n: n };
      used[k] = true; n++;
    }
    return { ok: n <= DEPLOY, n: n, full: n === Math.min(DEPLOY, keys.length) };
  }
  /* 거점 · 장수 값 표에서 합이 가장 큰 배치(헝가리안) — 상대 배치는 보지 않는다. noise 는 하수 · 중수의 흔들림(0~), rnd 는 난수 손잡이 */
  function deployAI(db, keys, fieldKey, noise, rnd) {
    var f = db.fields[fieldKey], n = f.slots.length, m = keys.length, i, j;
    if (m < n) { /* 사람이 모자라면 앞에서부터 */ }
    var val = f.slots.map(function (s) { return keys.map(function (k) { var v = slotValue(db, k, s.type).v; return noise ? v * (1 + (rnd() * 2 - 1) * noise) : v; }); });
    var asg = assign(val, n, m), dep = {};
    for (i = 0; i < n; i++) if (asg[i] >= 0) dep[f.slots[i].key] = keys[asg[i]];
    return dep;
  }
  /* 직사각 헝가리안(행 ≤ 열이면 행마다 다른 열 하나) — 값 합 최대. 행이 많으면 남는 행은 -1 */
  function assign(val, n, m) {
    if (n > m) {
      var t = []; for (var c = 0; c < m; c++) { t.push([]); for (var r = 0; r < n; r++) t[c].push(val[r][c]); }
      var back = assign(t, m, n), out = []; for (r = 0; r < n; r++) out.push(-1);
      back.forEach(function (row, col) { if (row >= 0) out[row] = col; });
      return out;
    }
    var INF = 1e18, u = new Array(n + 1).fill(0), v = new Array(m + 1).fill(0), p = new Array(m + 1).fill(0), way = new Array(m + 1).fill(0), i, j;
    for (i = 1; i <= n; i++) {
      p[0] = i; var j0 = 0, minv = new Array(m + 1).fill(INF), used = new Array(m + 1).fill(false);
      do {
        used[j0] = true; var i0 = p[j0], delta = INF, j1 = 0;
        for (j = 1; j <= m; j++) if (!used[j]) {
          var cur = -val[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
        for (j = 0; j <= m; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
        j0 = j1;
      } while (p[j0] !== 0);
      do { var jj = way[j0]; p[j0] = p[jj]; j0 = jj; } while (j0);
    }
    var ans = new Array(n).fill(-1);
    for (j = 1; j <= m; j++) if (p[j]) ans[p[j] - 1] = j - 1;
    return ans;
  }
  function depSum(db, fieldKey, dep) {
    var f = db.fields[fieldKey], t = 0;
    f.slots.forEach(function (s) { if (dep[s.key]) t += slotValue(db, dep[s.key], s.type).v; });
    return Math.round(t * 10) / 10;
  }
  /* 한 판 — 거점마다 한 합. 난수는 거점마다 두 번(양쪽) 늘 꺼낸다(씨앗 재현) */
  function fight(db, st, fieldKey, depA, depB) {
    var f = db.fields[fieldKey], out = { field: fieldKey, slots: [], wa: 0, wb: 0, ha: 0, hb: 0, ma: 0, mb: 0 };
    f.slots.forEach(function (s) {
      var ka = depA[s.key] || null, kb = depB[s.key] || null, ra = rand(st), rb = rand(st);
      var va = ka ? slotValue(db, ka, s.type) : null, vb = kb ? slotValue(db, kb, s.type) : null;
      var xa = va ? va.v * (1 + (ra * 2 - 1) * JITTER) : 0, xb = vb ? vb.v * (1 + (rb * 2 - 1) * JITTER) : 0;
      var ja = Math.round(xa * 10) / 10, jb = Math.round(xb * 10) / 10;
      /* 승부는 반올림 전 값으로(보이는 값이 같아도 갈린다) */
      var win = !ka && !kb ? null : !kb ? 'a' : !ka ? 'b' : xa > xb ? 'a' : xb > xa ? 'b' : null;
      var close = !!(ka && kb && Math.abs(ja - jb) / Math.max(ja, jb, 1) < CLOSE);
      var row = { key: s.key, ko: s.ko, type: s.type, a: ka, b: kb, va: va, vb: vb, ja: ja, jb: jb, win: win, close: close };
      out.slots.push(row);
      if (win === 'a') { out.wa++; out.ma += xa - xb; if (s.type === 'hq') out.ha++; }
      if (win === 'b') { out.wb++; out.mb += xb - xa; if (s.type === 'hq') out.hb++; }
    });
    out.ma = Math.round(out.ma * 10) / 10; out.mb = Math.round(out.mb * 10) / 10;
    if (out.wa !== out.wb) { out.winner = out.wa > out.wb ? 'a' : 'b'; out.by = 'count'; }
    else if (out.ha !== out.hb) { out.winner = out.ha > out.hb ? 'a' : 'b'; out.by = 'hq'; }
    else if (out.ma !== out.mb) { out.winner = out.ma > out.mb ? 'a' : 'b'; out.by = 'margin'; }
    else { out.winner = null; out.by = 'draw'; }
    return out;
  }
  function battleTeam(st, seat) { var x = st.result.sides.filter(function (y) { return y.seat === seat; })[0]; return x ? x.team : []; }
  function startBattle(db, st) {
    if (!st.field || !db.fields[st.field]) st.field = pickField(db, st.seed, st.fmode, null);
    var pairs = st.seats.length === 3 ? [['me', 'foe'], ['me', 'foe2'], ['foe', 'foe2']] : [['me', 'foe']];
    st.battle = { field: st.field, matches: pairs.map(function (p) { return { a: p[0], b: p[1], dep: null, res: null }; }), i: 0, last: null };
    st.phase = 'battle';
    autoMatches(db, st);
  }
  function curMatch(st) { return st.battle && st.battle.matches[st.battle.i] || null; }
  /* AI 자리의 배치 — 그 자리의 수준 잡음, 자기 값만 본다 */
  function aiDeploy(db, st, seat) { return deployAI(db, battleTeam(st, seat), st.battle.field, DEP_NOISE[st.lv], function () { return rand(st); }); }
  function settle(db, st, m, depA, depB) {
    m.dep = { a: depA, b: depB };
    m.res = fight(db, st, st.battle.field, depA, depB);
    st.battle.i++;
    if (st.battle.i >= st.battle.matches.length) { st.phase = 'done'; st.result.league = standings(db, st); }
  }
  /* 아군이 없는 판(적장끼리)은 곧바로 */
  function autoMatches(db, st) {
    var done = [];
    while (st.phase === 'battle') {
      var m = curMatch(st);
      if (!m || m.a === 'me' || m.b === 'me') break;
      settle(db, st, m, aiDeploy(db, st, m.a), aiDeploy(db, st, m.b));
      done.push(m);
    }
    return done;
  }
  /* 아군 출진 — 지금 판(아군이 a)의 상대는 이때 자기 배치를 정한다(아군 배치는 보지 않는다) */
  function myDeploy(db, st, dep) {
    var m = curMatch(st);
    if (!m || m.a !== 'me') throw new Error('아군 차례의 판이 아니다');
    var chk = validDeploy(db, battleTeam(st, 'me'), st.battle.field, dep);
    if (!chk.ok || !chk.full) throw new Error('배치가 맞지 않는다');
    st.battle.last = Object.assign({}, dep);
    var foe = aiDeploy(db, st, m.b);
    settle(db, st, m, Object.assign({}, dep), foe);
    var auto = autoMatches(db, st);
    return { match: m, auto: auto };
  }
  /* 리그 순위 — 승수 → 차지한 거점 합 → 편성 점수 */
  function standings(db, st) {
    var rows = st.seats.map(function (s) {
      var x = st.result.sides.filter(function (y) { return y.seat === s; })[0];
      return { seat: s, w: 0, l: 0, d: 0, slots: 0, score: x ? x.ev.total : 0 };
    }), by = {};
    rows.forEach(function (r) { by[r.seat] = r; });
    (st.battle ? st.battle.matches : []).forEach(function (m) {
      if (!m.res) return;
      by[m.a].slots += m.res.wa; by[m.b].slots += m.res.wb;
      if (m.res.winner === 'a') { by[m.a].w++; by[m.b].l++; } else if (m.res.winner === 'b') { by[m.b].w++; by[m.a].l++; } else { by[m.a].d++; by[m.b].d++; }
    });
    function cmp(a, b) { return (b.w - a.w) || (b.slots - a.slots) || (b.score - a.score); }
    rows.sort(cmp);
    rows.forEach(function (r) { r.rank = 1 + rows.filter(function (o) { return cmp(o, r) < 0; }).length; r.tied = rows.some(function (o) { return o !== r && cmp(o, r) === 0; }); });
    return rows;
  }

  return {
    DEPLOY: DEPLOY, FIT_MAIN: FIT_MAIN, FIT_SUB: FIT_SUB, JITTER: JITTER, CLOSE: CLOSE, DEP_NOISE: DEP_NOISE, FIELD_YEAR: FIELD_YEAR,
    pickField: pickField, slotStat: slotStat, fitOf: fitOf, slotValue: slotValue, validDeploy: validDeploy, deployAI: deployAI, assign: assign, depSum: depSum,
    fight: fight, startBattle: startBattle, curMatch: curMatch, myDeploy: myDeploy, autoMatches: autoMatches, standings: standings, battleTeam: battleTeam,
    ROUNDS: ROUNDS, FINAL: FINAL, PACK: PACK, CAPS: CAPS, CATS: CATS, CAT_KO: CAT_KO, ROLE_KO: ROLE_KO, STATS: STATS, WT: WT,
    LEVELS: LEVELS, STYLES: STYLES, DENY: DENY, NOISE: NOISE,
    buildDB: buildDB, power: power, lordRate: lordRate, counts: counts, overflow: overflow,
    evaluate: evaluate, evaluateRaw: evaluateRaw, bestLineup: bestLineup, hintOf: hintOf, pledges: pledges, nearOf: nearOf,
    rand: rand, todaySeed: todaySeed,
    newGame: newGame, turn: turn, legal: legal, openIdx: openIdx, ensureChoices: ensureChoices, pick: pick, reroll: reroll, endRound: endRound,
    styleScore: styleScore, threatScore: threatScore, aiAct: aiAct,
    bondsOf: bondsOf, isMajor: isMajor, inScope: inScope,
    lineupCheck: lineupCheck, finalize: finalize, restore: restore, teamOf: teamOf, others: others, needKeys: needKeys,
    denyWeights: denyWeights, view: view, facsOf: facsOf, facOf: facOf, facColor: facColor, FMODES: FMODES
  };
});
