/* 그림 자료 공통 계층 — 도감·생성기가 같이 쓴다. game-atelier 의 같은 파일에서 왔다(2026-10-30).
   ES 모듈도 빌드도 쓰지 않는다. generation/loader.js 와 같은 방식으로
   window.AtelierImg 하나만 붙인다. 기존 페이지에 <script> 한 줄로 얹힌다.

   왜 모아 두는가:
   - URL 규칙(원본/썸네일), img.json 읽기, byStyle·casual·extra 구조를 읽는
     일이 페이지마다 따로 구현돼 있었다. 그래서 같은 버그를 여러 번 고쳤다.
     (2026-09: GitHub contents API 1,000개 상한 문제를 도감과 툴킷에서 따로 수정)
   - 여기 한 곳만 맞추면 세 화면이 같이 맞는다.

   img.json 구조:
     {"img": {"<카드>": {"byStyle": {"<화풍>": <몫>}, ...<기본 몫>}}}
     <몫> = {"byForm": {"<세계>": {"f": "파일", "m": "파일", "casual": {"f": [...]}}},
             "casual": {"f": [...], "m": [...]}, "extra": {...}}
     세계 몫 안의 casual 은 그 세계 그림을 참고 그림으로 붙인 일상컷(2026-10-30). 화풍 몫 바로 아래의 casual 은
     참고 그림 없이 뽑은 옛 시안 셋 — 그대로 두고 새로 만들지 않는다.
     카드 열쇠는 장수 이름이다(data/sam-design.json — 관우 · 제갈량).
     성별 표시가 없던 예전 자료는 casual/extra 가 배열 그대로일 수 있고,
     그때는 여성 몫으로 친다.

   폼(byForm) = 세계:
     한 장수가 세 세계(삼국시대 samguk · 중세 판타지 fantasy · 메카 mecha)에서 갈아 입는 것이다.
     카드를 쪼개지 않는다 — 쪼개면 기록이 세계 수만큼 갈라져 얼굴이 흔들린다(pkm 에서 한 번 겪었다).
     개방(_open)도 연출컷(action)도 없다 — 세계 그림(f/m) 한 장이 그 세계의 전부다.
     · 세계 그림은 비교용이다. 나란히 놓고 어느 세계가 어울리는지 보는 자리라
       카메라·프레이밍이 같아야 한다. formActs 는 옛 화면과의 호환으로 남겨 두되 늘 빈 배열이다.
     · 일상컷(casual)은 세계를 탄다 — 그 세계 그림의 그 사람이 지금 일상에 나온 한 장(참고 그림 = 세계 그림, 화풍도 따른다).
       byForm.<세계>.casual 에 든다(현대는 일상컷이 맡는다). 세계 없는 옛 시안 셋만 화풍 몫의 casual 에 남아 있다. */
(function (root) {
  'use strict';

  /* 그림은 이 저장소에 없다. 코드가 무거워지지 않게 처음부터 따로 둔다 —
     <이름>-img 저장소에 올리고 Pages 를 켜면 그쪽이 1 GB 를 따로 받는다.

     그림 저장소는 여럿이다(pkm 은 2026-10-13 에 둘이 됐다). 한 Pages 사이트는 1 GB 까지라
     차면 새 그림은 다음 저장소에 올린다. 2026-11-12 둘이 됐다 — 0 번 sam-atelier-img 는 닫힘(교체만),
     1 번 sam-atelier-img-2 가 열림(새 그림 전부, 사용자 「원소쪽은 다른 작업중이라 삼국지 먼저 열자.」).
     어느 파일이 몇 번 저장소에 있는지는 등록기가
     img.json 의 where 에 적는다 — 0 번(첫 저장소)은 적지 않으므로 옛 그림의 주소는
     한 글자도 안 바뀐다. 한 장수의 그림이 두 저장소에 나뉘어도 파일마다 제 주소를 찾는다.
     차례는 tools/register-images.py 의 SHARDS·워크플로 받기·tools/img-repos.cjs 와 같다
     (tests/img-shards.cjs 가 맞춰 본다). 저장소를 더할 때는 이 목록 끝에만 붙인다 */
  var BASES = ['https://polos0117.github.io/sam-atelier-img/img/',
               'https://polos0117.github.io/sam-atelier-img-2/img/'];
  var BASE = BASES[0];
  var DATA = 'data/img.json';
  var WHERE = {};
  /* 등록한 날 {파일: 'YYYY-MM-DD'} — 등록기가 img.json 의 added 에 적는다. 날짜 없는 그림은 여기 없다(지어내지 않는다) */
  var ADDED = {};

  /* encodeURIComponent 는 작은따옴표를 그대로 둔다.
     onerror="...src='<여기>'" 처럼 속성 안에 넣을 때 깨지므로 같이 막는다 */
  function enc(f) { return encodeURIComponent(f).replace(/'/g, '%27'); }
  function baseOf(f) { return BASES[WHERE[f]] || BASE; }
  function imgURL(f) { return baseOf(f) + enc(f); }
  function thumbURL(f) { return baseOf(f) + 'thumb/' + enc(f); }
  /* img.json 을 직접 읽는 화면(생성기)도 이것을 불러 저장소 자리를 맞춘다. where 가 없는 문서면 비운다 */
  function setShards(doc) {
    var w = (doc && doc.where) || {}, out = {}, k;
    for (k in w) if (w[k] > 0 && w[k] < BASES.length && w[k] === Math.floor(w[k])) out[k] = w[k];
    WHERE = out;
  }
  function setAdded(doc) {
    var a = (doc && doc.added) || {}, out = {}, k;
    for (k in a) if (typeof a[k] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a[k])) out[k] = a[k];
    ADDED = out;
  }
  function added() { return ADDED; }

  /* 목록·갤러리에 쓰는 <img>. 썸네일을 먼저 걸고, 아직 없으면 원본으로 되돌아간다.
     썸네일은 register-images 워크플로가 make-thumbs.py 로 만들어 둔다 */
  function thumbTag(f, attr) {
    return '<img loading="lazy" src="' + thumbURL(f) + '" alt=""' +
      (attr ? ' ' + attr : '') +
      ' onerror="this.onerror=null;this.src=\'' + imgURL(f) + '\'">';
  }

  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

  /* 한 몫에서 일상컷·특별컷 목록 */
  function cuts(bucket, slot, v) {
    var box = bucket && bucket[slot];
    if (!box) return [];
    if (isArr(box)) return v === 'f' ? box : [];
    return box[v] || [];
  }

  /* 성별 가리지 않은 장수 */
  function cutCount(bucket, slot) {
    var box = bucket && bucket[slot], n = 0, g;
    if (!box) return 0;
    if (isArr(box)) return box.length;
    for (g in box) n += box[g].length;
    return n;
  }

  function hasPic(b) { return !!(b && (b.m || b.f)); }

  /* ── 폼(세계) ─────────────────────────────────────
     없는 세계는 없는 대로 정상이다(주민은 어울리는 세계만 있다). 부르는 쪽이 빈 칸을 다루지 않아도 되게
     여기서 늘 배열·객체를 돌려준다 */
  function formMap(bucket) { return (bucket && bucket.byForm) || {}; }
  function formKeys(bucket) {
    var m = formMap(bucket), out = [], k;
    for (k in m) if (hasPic(m[k])) out.push(k);
    return out;
  }
  function formOf(bucket, form) { return formMap(bucket)[form] || null; }
  /* 그 세계의 연출컷. 이 공방은 연출컷을 만들지 않으므로 늘 빈 배열이다 — 옛 화면 호환으로만 둔다 */
  function formActs(bucket, form, v) { return cuts(formOf(bucket, form) || {}, 'action', v); }

  /* 세계 그림이 다 찼나. 성별은 보지 않는다 — 지금은 여성만 만들고,
     남성을 더해도 이 판정은 안 바뀐다(파일 이름에는 _f 를 붙여 둔다) */
  function formsDone(bucket, want, v) {
    var have = formMap(bucket), left = [], i, k;
    v = v || 'f';
    for (i = 0; i < (want || []).length; i++) {
      k = want[i];
      if (!(have[k] && have[k][v])) left.push(k);
    }
    return { done: (want || []).length - left.length, all: (want || []).length,
             left: left, ok: left.length === 0 };
  }
  function styleMap(entry) { return (entry && entry.byStyle) || {}; }
  function styleKeys(entry) {
    var bs = styleMap(entry), out = [], k;
    for (k in bs) out.push(k);
    return out;
  }

  /* 한 몫이 내놓는 그림 전부 — 초상 → 일상 → 특별 차례. 세계 몫 안의 일상컷도 센다 */
  function shotsOf(bucket, v) {
    if (!bucket) return [];
    var out = (bucket[v] ? [bucket[v]] : []).concat(cuts(bucket, 'casual', v)), fm = formMap(bucket), k;
    for (k in fm) out = out.concat(cuts(fm[k], 'casual', v));
    return out.concat(cuts(bucket, 'extra', v));
  }
  /* 한 화풍 몫의 일상컷 — [{file, world}] 세계 차례(want)대로, 세계 없는 옛 시안은 world '' 로 맨 뒤 */
  function casualsOf(bucket, want, v) {
    var out = [], fm = formMap(bucket), ws = (want && want.length ? want : Object.keys(fm)), i, k;
    v = v || 'f';
    for (i = 0; i < ws.length; i++) { k = ws[i]; cuts(fm[k] || {}, 'casual', v).forEach(function (f) { out.push({ file: f, world: k }); }); }
    cuts(bucket, 'casual', v).forEach(function (f) { out.push({ file: f, world: '' }); });
    return out;
  }

  /* 한 카드가 가진 그림 전부 (모든 화풍 · 남녀 · 화풍 미상인 기본 몫 포함) */
  function allShotsOf(entry) {
    if (!entry) return [];
    var bs = styleMap(entry), out = [], k, i;
    function add(list) {
      for (i = 0; i < list.length; i++) if (out.indexOf(list[i]) < 0) out.push(list[i]);
    }
    for (k in bs) { add(shotsOf(bs[k], 'f')); add(shotsOf(bs[k], 'm')); }
    add(shotsOf(entry, 'f')); add(shotsOf(entry, 'm'));
    return out;
  }

  /* 예시로 쓸 초상 한 장. 원하는 화풍이 있으면 그쪽을 먼저 보고,
     없으면 아무 화풍이나, 그것도 없으면 화풍 미상인 기본 몫 */
  function portraitOf(entry, v, preferStyle) {
    if (!entry) return null;
    var bs = styleMap(entry), k;
    if (preferStyle && bs[preferStyle] && bs[preferStyle][v]) return bs[preferStyle][v];
    for (k in bs) if (bs[k][v]) return bs[k][v];
    return entry[v] || null;
  }

  /* 목록에 쓸 대표 그림 한 장. 여기 카드는 그림이 byForm(세계) 안에만 있어서
     portraitOf 가 빈손으로 돌아온다 — 그때는 원하는 세계, 없으면 첫 세계를 쓴다.
     portraitOf 를 안 고치고 따로 둔 까닭: 그쪽은 "화풍 몫의 초상"이라는 뜻이고
     세계까지 뒤지기 시작하면 세계를 안 쓰는 화면이 모르는 사이에 다른 그림을 받는다 */
  function coverOf(entry, v, preferStyle, preferForm) {
    var direct = portraitOf(entry, v, preferStyle);
    if (direct) return direct;
    var bs = styleMap(entry), order = [], k, i, j, b, ks, one;
    if (preferStyle && bs[preferStyle]) order.push(preferStyle);
    for (k in bs) if (order.indexOf(k) < 0) order.push(k);
    for (i = 0; i < order.length; i++) {
      b = bs[order[i]];
      one = preferForm && formOf(b, preferForm);
      if (one && one[v]) return one[v];
      ks = formKeys(b);
      for (j = 0; j < ks.length; j++) if (formOf(b, ks[j])[v]) return formOf(b, ks[j])[v];
    }
    return null;
  }

  /* ── 진열 — 첫 화면(index.html) 진열대에 도는 카드. 테마마다 따로 열둘, 도감에서 올리고 내린다.
     myth-atelier 의 신전에서 왔다. 비어 있으면 첫 화면이 그림 있는 카드에서 무작위로 고른다.
     저장은 {테마: [카드 열쇠…]} — 이 브라우저에만 남는 편의다(지워지거나 막혀도 화면은 돈다).
     열쇠 이름은 공방마다 다르게 둔다 — 같은 polos0117.github.io 아래라 localStorage 를 나눠 쓴다 ── */
  var HALL_STORE = 'samguk_hall_v1', HALL_MAX = 12;
  function hallTheme(theme) {
    return theme || (root.AtelierAppearance && root.AtelierAppearance.get().theme) || 'peachsword';
  }
  function hallAll() {
    try {
      var j = JSON.parse(localStorage.getItem(HALL_STORE));
      return j && typeof j === 'object' && !isArr(j) ? j : {};
    } catch (e) { return {}; }
  }
  function hallPicks(theme) { var l = hallAll()[hallTheme(theme)]; return isArr(l) ? l.slice(0, HALL_MAX) : []; }
  function setHallPicks(list, theme) {
    var all = hallAll(); all[hallTheme(theme)] = (list || []).slice(0, HALL_MAX);
    try { localStorage.setItem(HALL_STORE, JSON.stringify(all)); } catch (e) {}
  }
  /* 올리기·내리기. 찼으면 {ok:false, why:'full'} */
  function toggleHall(key, theme) {
    var p = hallPicks(theme), i = p.indexOf(key);
    if (i >= 0) { p.splice(i, 1); setHallPicks(p, theme); return { ok: true, on: false }; }
    if (p.length >= HALL_MAX) return { ok: false, why: 'full' };
    p.push(key); setHallPicks(p, theme); return { ok: true, on: true };
  }

  /* img.json 을 읽는다. GitHub API 는 쓰지 않는다 —
     contents API 는 디렉터리를 1,000개까지만 돌려주고(img/ 는 그보다 많다)
     비로그인 호출은 시간당 60회 제한도 있다. 이 파일은 등록 자동화가 갱신한다 */
  function load(url) {
    return fetch(url || DATA, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('img.json — ' + r.status);
      return r.json();
    }).then(function (j) { setShards(j); setAdded(j); return (j && j.img) || {}; });
  }

  root.AtelierImg = {
    BASE: BASE, BASES: BASES, DATA: DATA,
    baseOf: baseOf, setShards: setShards, setAdded: setAdded, added: added, imgURL: imgURL, thumbURL: thumbURL, thumbTag: thumbTag,
    cuts: cuts, cutCount: cutCount, hasPic: hasPic,
    styleMap: styleMap, styleKeys: styleKeys,
    formMap: formMap, formKeys: formKeys, formOf: formOf,
    formActs: formActs, formsDone: formsDone,
    shotsOf: shotsOf, casualsOf: casualsOf, allShotsOf: allShotsOf, portraitOf: portraitOf, coverOf: coverOf,
    HALL_MAX: HALL_MAX, hallTheme: hallTheme, hallPicks: hallPicks, setHallPicks: setHallPicks, toggleHall: toggleHall,
    load: load
  };
})(window);
