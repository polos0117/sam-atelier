/* 천하 지도 셈 모듈(2026-11-17) — 판도별 세력 · 막사 · 결의 · 새 그림 판정. 화면과 떨어진 순수 모듈.
   브라우저에선 window.Tianxia(lib/draft2/rules.js 를 먼저 싣는다), node 에선 require('lib/tianxia-core.js').
   세력 나눔은 새 판의 규칙 모듈(lib/draft2/rules.js 의 view · facOf)을 읽기만 해서 다시 쓴다 — 여기서 다시 짓지 않는다.
   그 모듈이 바라는 장수 자료(draft2-generals.json)는 능력치만 쓰이므로 설계표의 능력치로 대신 넣는다(세력 나눔은 능력치와 무관하다).
   지도 · 막사의 단위는 세력 열쇠(data/draft2-factions.json 의 factions) — 연도 팩의 그해 이름(조조군)은 alias 로 열쇠(조위)가 된다. */
(function (root) {
  'use strict';
  var R = typeof module === 'object' && module.exports ? require('./draft2/rules.js') : root.Draft2Rules;
  var has = Object.prototype.hasOwnProperty, ERAS = ['mx', 'w194', 'gd200', 'jb208', 'end263'], ROLES = ['lord', 'general', 'strategist', 'official'];

  function make(src) {
    var db = R.buildDB({ generals: src.design.generals.map(function (g) { return { key: g.key, stats: g.stats }; }) },
      src.design, src.combos, src.packs, src.factions, null, null, src.roster, src.careerFix);   /* careerFix = draft2-career-fix.json(군웅록 이력 고침 표) */
    return { db: db, fset: src.factions.factions, alias: src.factions.alias || {}, packs: src.packs.packs || {}, tianxia: src.tianxia, cache: {} };
  }
  /* 판도 하나의 셈 — 장수 → 세력 열쇠, 세력 → 막사(역할 차례, 그 안은 설계표 차례). 한 번 지어 둔다 */
  function era(doc, e) {
    if (doc.cache[e]) return doc.cache[e];
    var v = R.view(doc.db, e), of = Object.create(null), camp = Object.create(null);   /* 열쇠가 주소에서 온다 — constructor · __proto__ 같은 말이 걸리지 않게 */
    if (ERAS.indexOf(e) < 0 || v.mode !== e) return (doc.cache[e] = { of: of, camp: camp, owners: {} });
    v.list.forEach(function (c) {
      if (!R.inScope(v, c.key)) return;
      var f = R.facOf(v, c.key); f = doc.fset[f] ? f : doc.alias[f] || f;
      of[c.key] = f; (camp[f] = camp[f] || []).push({ name: c.key, role: c.role });
    });
    Object.keys(camp).forEach(function (f) {   /* sort 는 차례를 지킨다 — 같은 역할 안은 설계표 차례 그대로 */
      camp[f].sort(function (a, b) { return ROLES.indexOf(a.role) - ROLES.indexOf(b.role); });
    });
    return (doc.cache[e] = { of: of, camp: camp, owners: (doc.tianxia.eras[e] || {}).owners || {} });
  }
  function factionOf(doc, e, name) { return era(doc, e).of[name] || null; }
  function members(doc, e, f) { return (era(doc, e).camp[f] || []).slice(); }
  function ownerOf(doc, e, city) { var os = era(doc, e).owners, o = has.call(os, city) ? os[city] : null; return (o && o.f) || null; }
  function factionsOf(doc, e) {
    var x = era(doc, e), cities = Object.create(null);
    doc.tianxia.cities.forEach(function (c) { var f = ownerOf(doc, e, c.key); if (f) (cities[f] = cities[f] || []).push(c.key); });
    return Object.keys(x.camp).map(function (f) {
      var info = doc.fset[f] || {}, cs = cities[f] || [];
      return { key: f, glyph: info.h || f.charAt(0), color: info.c || '#7A6A55', cities: cs, landless: !cs.length, count: x.camp[f].length };
    }).sort(function (a, b) { return b.cities.length - a.cities.length || b.count - a.count; });
  }
  /* 막사 가운데에 설 우두머리 — 군주가 여럿인 세력(군웅록 동오 손견 · 손책 · 손권 · 손호, 200 원소군 유비 · 원소)에서 누구인가.
     ① 자료가 정한 사람(data/tianxia.json 의 그 판도 lords.<세력>) ② 그해 세력 이름(원소군)이나 세력 열쇠에 이름이 든 군주 ③ 그 팩의 roleMap 으로 군주가 된 장수 ④ 첫 군주 ⑤ 군주 없는 무리는 첫 장수 */
  function chiefOf(doc, e, f) {
    var ms = members(doc, e, f), p = doc.packs[e] || {}, set = ((doc.tianxia.eras[e] || {}).lords || {}), roleMap = R.view(doc.db, e).roleMap || {}, label = f, k, i;
    if (!ms.length) return null;
    if (has.call(set, f)) for (i = 0; i < ms.length; i++) if (ms[i].name === set[f]) return set[f];
    for (k in (p.factions || {})) if ((doc.alias[k] || k) === f) label += ' ' + k;
    var lords = ms.filter(function (m) { return m.role === 'lord'; });
    for (i = 0; i < lords.length; i++) if (label.indexOf(lords[i].name) >= 0) return lords[i].name;
    for (i = 0; i < lords.length; i++) if (roleMap[lords[i].name]) return lords[i].name;
    return (lords[0] || ms[0]).name;
  }
  /* 결의 — names 안에 둘 이상 든 것만. 불화(점수가 모두 0 이하) · 혈연 · 그 밖 */
  function bondsOf(doc, names) {
    var has = {}, out = [];
    names.forEach(function (n) { has[n] = true; });
    doc.db.combos.forEach(function (cb) {
      var m = cb.m.filter(function (n) { return has[n]; });
      if (m.length >= 2) out.push({ n: cb.n, kind: cb.feud ? 'feud' : cb.kin ? 'blood' : 'bond', m: m });
    });
    return out;
  }

  /* 그 장수의 그림 파일 전부 — 세계 그림 · 일상컷 · 캐릭터만의 컷, 모든 화풍(등록부 칸 안의 파일 이름을 다 모은다) */
  function files(entry, out) {
    out = out || [];
    if (typeof entry === 'string') out.push(entry);
    else if (entry && typeof entry === 'object') for (var k in entry) files(entry[k], out);
    return out;
  }
  function hasArt(entry) { return files(entry).length > 0; }
  /* 가장 늦은 등록 날짜 — 날짜가 안 적힌 그림은 세지 않는다(지어내지 않는다) */
  function lastAdded(entry, added) {
    var last = '';
    files(entry).forEach(function (f) { var d = added && added[f]; if (d && d > last) last = d; });
    return last;
  }
  function okDay(d) { var t = Date.parse(d + 'T00:00:00Z'); return !isNaN(t) && new Date(t).toISOString().slice(0, 10) === d; }
  function dayBefore(d) { return new Date(Date.parse(d + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10); }
  /* 새 그림 — 가장 늦은 등록이 오늘이나 어제이고, 확인했을 때의 날짜(seen)보다 늦을 때 */
  function isNew(last, today, seen) { return !!last && okDay(today) && (last === today || last === dayBefore(today)) && last > (seen || ''); }
  /* 오늘(한국 시간). 주소의 ?today= 는 검사 전용 — 없는 날짜(2026-13-45)면 기기 날짜로 */
  function today(search) {
    var m = /[?&]today=(\d{4}-\d{2}-\d{2})(&|$)/.exec(search || '');
    return m && okDay(m[1]) ? m[1] : new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
  }
  /* 확인 기록 {이름: 그때의 가장 늦은 등록 날짜} — 이 브라우저에만. 저장이 막힌 환경이면 메모리로(화면은 그대로 뜬다) */
  var KEY = 'samguk_seen_v1', mem = null;
  function readSeen() {
    if (mem) return mem;
    try { var j = JSON.parse(root.localStorage.getItem(KEY)); if (j && typeof j === 'object') return j; } catch (e) {}
    return {};
  }
  function writeSeen(all) { try { root.localStorage.setItem(KEY, JSON.stringify(all)); mem = null; } catch (e) { mem = all; } }
  var seen = {
    get: function (name) { return readSeen()[name] || ''; },
    all: function () { return readSeen(); },
    mark: function (name, last) { var o = {}; o[name] = last; seen.markAll(o); },
    markAll: function (map) { var all = readSeen(), k; for (k in map) if (map[k]) all[k] = map[k]; writeSeen(all); }
  };

  var api = { ERAS: ERAS, ROLES: ROLES, make: make, factionOf: factionOf, members: members, chiefOf: chiefOf, factionsOf: factionsOf, ownerOf: ownerOf, bondsOf: bondsOf,
    filesOf: files, hasArt: hasArt, lastAdded: lastAdded, isNew: isNew, today: today, seen: seen };
  root.Tianxia = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
