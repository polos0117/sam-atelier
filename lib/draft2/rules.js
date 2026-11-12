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
  var FMODES = ['mx', 'base'];
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

  /* gdoc = draft2-generals.json, sdoc = sam-design.json, cdoc = draft2-combos.json, pdoc = draft2-packs.json(없으면 본편만) */
  function buildDB(gdoc, sdoc, cdoc, pdoc) {
    var design = {}, i, list = [], by = {};
    for (i = 0; i < sdoc.generals.length; i++) design[sdoc.generals[i].key] = sdoc.generals[i];
    for (i = 0; i < gdoc.generals.length; i++) {
      var g = gdoc.generals[i], d = design[g.key];
      if (!d) throw new Error('설계표에 없는 장수: ' + g.key);
      var c = {
        key: g.key, en: d.en || '', fac: d.faction, camp: d.camp || null, role: d.role, cat: catOfRole(d.role),
        s: { lead: g.stats.lead, war: g.stats.war, int: g.stats.int, pol: g.stats.pol },
        cls: g.class || null, sub: g.sub || null, trait: g.trait || null, seal: d.seal || g.key.charAt(0), lore: d.lore || '', idx: i
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
    var syn = {}; for (var sk in cdoc.syn) syn[+sk] = cdoc.syn[sk];
    var etc = []; for (var ek in cdoc.etc) etc.push([+ek, cdoc.etc[ek]]);
    etc.sort(function (a, b) { return a[0] - b[0]; });
    var fac = {};
    (sdoc.factions || []).forEach(function (f) { fac[f.key] = { ko: f.ko, hanja: f.hanja, c: BASE_COLOR[f.key] || BASE_COLOR.qun }; });
    var db = {
      list: list, by: by, combos: combos, byMember: byMember, syn: syn, etcBase: cdoc.etcBase, etc: etc,
      factions: fac, classes: gdoc.classes || {}, traits: gdoc.traits || {}, packs: (pdoc && pdoc.packs) || {}, views: {}
    };
    return view(db, 'base');
  }

  /* 진영 셈 — 'base'(본편 위 · 촉 · 오 · 군웅) 또는 팩 열쇠('mx' 군웅록 …). 같은 db 를 바탕으로 결속에 쓰는 세력만 다르다.
     facs[장수] = 세력 목록(군웅록은 거친 세력 모두 — 옛 facsOf, 마지막이 facOf), facInfo[세력] = {ko, h, c} */
  function view(db, mode) {
    var root = db.root || db;
    mode = mode && (mode === 'base' || root.packs[mode]) ? mode : 'base';
    if (root.views[mode]) return root.views[mode];
    var v = Object.create(root), p = mode === 'base' ? null : root.packs[mode], facs = {}, info = {}, k;
    v.root = root; v.mode = mode; v.cache = {}; v.cacheN = 0;
    for (k in root.factions) info[root.factions[k].ko] = { ko: root.factions[k].ko, h: root.factions[k].hanja, c: root.factions[k].c };
    root.list.forEach(function (c) {
      var ko = root.factions[c.fac] ? root.factions[c.fac].ko : c.fac;
      facs[c.key] = !p ? [ko] : p.career ? (p.career[c.key] || [ko]).slice() : [(p.facMap && p.facMap[c.key]) || ko];
    });
    if (p) for (k in p.factions) info[k] = { ko: k, h: p.factions[k].h, c: p.factions[k].c };
    v.facs = facs; v.facInfo = info; v.synMul = p ? p.synMul || 1 : 1; v.bias = p ? p.bias || 0 : 0; v.etcKey = (root.factions.qun && root.factions.qun.ko) || '군웅';
    v.packName = p ? p.n : '본편';
    root.views[mode] = v;
    return v;
  }
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
    /* 주공의 그릇 — 군주가 여럿이면 그릇이 큰 이를 앞에. 같은 진영이 많을수록 다 받는다 */
    var lord = null;
    for (i = 0; i < team.length; i++) if (team[i].role === 'lord' && (!lord || lordRate(team[i]) > lordRate(lord))) lord = team[i];
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
      pool: o.keys.filter(function (k) { return db.by[k]; }), mine: [], foe: [], foe2: players === 3 ? [] : null, round: 0, pack: [], q: [],
      rerolls: { me: rr, foe: rr, foe2: players === 3 ? rr : 0 },
      recent: {}, excluded: [], log: [], phase: 'draft', lineup: null, result: null, styles: {}, aiFac: {}
    };
    seats.slice(1).forEach(function (s) { st.styles[s] = o.styles && o.styles[s] != null ? o.styles[s] : Math.floor(rand(st) * STYLES.length); });
    /* 적장 기치(옛 aiFac) — 진영 셈에 결속 배수가 있는 팩이면 장수 범위에서 다섯 이상인 세력 가운데 하나씩, 겹치지 않게 */
    if (db.bias) {
      var cnt = {}, fk = [];
      st.pool.forEach(function (k) { db.facs[k].forEach(function (f) { cnt[f] = (cnt[f] || 0) + 1; }); });
      Object.keys(cnt).forEach(function (f) { if (cnt[f] >= 5 && db.facInfo[f]) fk.push(f); });
      seats.slice(1).forEach(function (s) {
        var left = fk.filter(function (f) { return seats.every(function (t) { return st.aiFac[t] !== f; }); });
        var from = left.length ? left : fk;
        st.aiFac[s] = from.length ? from[Math.floor(rand(st) * from.length)] : null;
      });
    }
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
      var sty = styleScore(db, c, team, style), fb = flag && db.facs[c.key].indexOf(flag) >= 0 ? db.bias : 0;
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
    st.phase = 'done';
    return st.result;
  }

  /* 이어하기 — 저장된 상태가 이 자료로 온전한지(판 모양 v2 — 1단계 저장은 버린다) */
  function restore(db, v) {
    try {
      if (!v || v.v !== 2 || ['draft', 'lineup'].indexOf(v.phase) < 0) return null;
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

  return {
    ROUNDS: ROUNDS, FINAL: FINAL, PACK: PACK, CAPS: CAPS, CATS: CATS, CAT_KO: CAT_KO, ROLE_KO: ROLE_KO, STATS: STATS, WT: WT,
    LEVELS: LEVELS, STYLES: STYLES, DENY: DENY, NOISE: NOISE,
    buildDB: buildDB, power: power, lordRate: lordRate, counts: counts, overflow: overflow,
    evaluate: evaluate, evaluateRaw: evaluateRaw, bestLineup: bestLineup, hintOf: hintOf, pledges: pledges, nearOf: nearOf,
    rand: rand, todaySeed: todaySeed,
    newGame: newGame, turn: turn, legal: legal, openIdx: openIdx, ensureChoices: ensureChoices, pick: pick, reroll: reroll, endRound: endRound,
    styleScore: styleScore, threatScore: threatScore, aiAct: aiAct,
    lineupCheck: lineupCheck, finalize: finalize, restore: restore, teamOf: teamOf, others: others, needKeys: needKeys,
    denyWeights: denyWeights, view: view, facsOf: facsOf, facOf: facOf, facColor: facColor, FMODES: FMODES
  };
});
