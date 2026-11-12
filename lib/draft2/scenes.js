/* 새 판 「삼국지 쟁탈전 · 전장」(draft2) 장면 — Boot → Title → Setup(세계 고르기) → Draft(지명) → Lineup(편성) → Result(임시).
   규칙은 lib/draft2/rules.js(순수 모듈), 그림은 lib/draft2/art.js, 그리기 손잡이 · HTML 창은 lib/draft2/ui.js.
   상태는 G.st 한 덩어리 — 바뀔 때마다 localStorage(samguk_draft2_game_v1)에 두어 이어하기. 설정은 samguk_draft2_cfg_v1.
   옛 판(draft.html)과 저장 키를 나누어 서로 건드리지 않는다. 연출은 4단계에서 — 지금은 깔리기 · 뽑히기 짧은 움직임만.
   인원은 3인(정립 — 아군 · 적장1 · 적장2)이 기본, 2인도 고른다. 진영 셈은 군웅록(장수마다 거친 세력)이 기본, 본편 네 진영도 고른다
   (사용자 2026-11-12 「3인전에 군웅록이 기본이 되게 만들어줘」). 저장된 설정이 있으면 그 값을 지킨다.
   주소 ?fast=1 은 적장 차례 · 움직임을 빨리(브라우저 검사). */
(function (root) {
  'use strict';
  var R = root.Draft2Rules, Art = root.Draft2Art, UI = root.Draft2UI, C = UI.C, esc = UI.esc;
  var KEY_CFG = 'samguk_draft2_cfg_v1', KEY_GAME = 'samguk_draft2_game_v1';
  var WORLD_GLYPH = { samguk: '漢', fantasy: '劍', mecha: '機' };
  /* 세계마다 표지 군주 — 받은 그림이 있는 이가 먼저(sampleOf) */
  var SAMPLE = { samguk: ['조조', '유비', '손권', '원소', '손책'], fantasy: ['유비', '손권', '조조', '동탁', '손견'], mecha: ['손권', '조조', '유비', '공손찬', '원소'] };
  function sampleOf(w) { var l = SAMPLE[w]; return l.filter(function (k) { return Art.tex(k, w); })[0] || l.filter(function (k) { return Art.file(k, w); })[0] || l[0]; }
  var G = { db: null, data: null, st: null, cfg: null, fast: false, err: null };
  var SERIF_WORDS = '삼국지쟁탈전장세계고르기지명편성결과승리패배무승부진아군적군대새판열한명으로겨룬다예비출전천하통일공동위·/0123456789戰爭漢劍機魏蜀吳雄勝敗和陣';
  /* 지금 쓰는 진영 셈(view) — 판이 있으면 그 판의 것, 없으면 설정의 것 */
  function V() { return R.view(G.db, G.st ? G.st.fmode : G.cfg ? G.cfg.fmode : 'mx'); }

  function qs(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  G.fast = qs('fast') === '1';
  /* 진행 속도 — 사용자 2026-11-12 「드래프트 화면전환이 좀 느린게 아쉬운데」: 기본을 줄이고 설정에 「빠름」(0.45배) */
  function ms(n) { return G.fast ? Math.max(16, Math.round(n * 0.08)) : G.cfg && G.cfg.speed === 'quick' ? Math.max(16, Math.round(n * 0.45)) : n; }
  function load(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function persist() { if (G.st && (G.st.phase === 'draft' || G.st.phase === 'lineup')) save(KEY_GAME, G.st); else drop(KEY_GAME); }
  /* 처음(저장된 설정 없음)은 3인 · 군웅록. 저장된 값은 그대로 — 1단계에 없던 칸(인원 · 진영 셈)만 기본으로 채운다 */
  function cfgDefault() { return { world: 'samguk', scope: 'art', lv: 0, daily: false, players: 3, fmode: 'mx' }; }
  function cfgLoad() {
    var c = load(KEY_CFG) || {}, d = cfgDefault();
    if (Art.WORLDS.indexOf(c.world) >= 0) d.world = c.world;
    if (c.scope === 'all' || c.scope === 'art') d.scope = c.scope;
    if ([0, 1, 2].indexOf(c.lv) >= 0) d.lv = c.lv;
    if (c.players === 2 || c.players === 3) d.players = c.players;
    if (R.FMODES.indexOf(c.fmode) >= 0) d.fmode = c.fmode;
    d.daily = !!c.daily;
    d.speed = c.speed === 'quick' ? 'quick' : 'normal';
    return d;
  }
  function josa(word, a, b) { var c = word.charCodeAt(word.length - 1) - 0xac00; return word + (c >= 0 && c < 11172 && c % 28 ? a : b); }
  function worldKo(w) { return (G.data && G.data.design.vocab.world_ko[w]) || w; }
  /* 장수 범위 — 그림 · 천하(연도 팩은 그해에 있는 장수만) */
  function poolKeys(world, scope, fmode) {
    var v = R.view(G.db, fmode || (G.cfg && G.cfg.fmode) || 'mx');
    return G.db.list.filter(function (c) { return (scope === 'all' || Art.file(c.key, world)) && R.inScope(v, c.key); }).map(function (c) { return c.key; });
  }
  function artCount(world) { return G.db.list.filter(function (c) { return Art.file(c.key, world); }).length; }
  function seatKo(s, st) { st = st || G.st; return s === 'me' ? '아군' : s === 'foe2' ? '적장2' : st && st.players === 3 ? '적장1' : '적장'; }
  function seatColor(s) { return s === 'me' ? C.gold2 : s === 'foe2' ? C.foe2 : C.foe; }
  function seatTag(s) { return G.st && G.st.aiFac && G.st.aiFac[s] ? ' · ' + G.st.aiFac[s] + ' 기치' : ''; }
  /* 천하 — 군웅록(평생 이력) · 연도 팩 넷 · 위촉오 + 군웅 세력 */
  var TIANXIA = [{ v: 'mx', label: '군웅록' }, { v: 'w194', label: '194 군웅할거' }, { v: 'gd200', label: '200 관도' }, { v: 'jb208', label: '208 적벽' }, { v: 'end263', label: '263 종결' }, { v: 'base', label: '위촉오+군웅' }];
  function fmodeKo(m) { return m === 'base' ? '위촉오 + 군웅 세력' : (G.db.packs[m] && G.db.packs[m].n) || m; }
  function facSpan(db, f) { return '<span class="d2-fac" style="--fc:' + UI.hex(UI.facColor(db, f)) + '">' + esc(f) + '</span>'; }
  function stylesKo(st) { return st.seats.slice(1).map(function (s) { return R.STYLES[st.styles[s]].ko; }).join(' · '); }

  /* ── 글꼴 — 본문 IBM Plex Sans KR, 제목 · 도장 Noto Serif KR 900(쓰는 글자만 text=) ── */
  function addSheet(href) {
    return new Promise(function (res) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
      l.onload = l.onerror = function () { res(); };
      document.head.appendChild(l);
      setTimeout(res, 2500);
    });
  }
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var serif = {};
    (SERIF_WORDS + G.db.list.map(function (c) { return c.seal; }).join('') + Object.keys(G.db.factions).map(function (k) { return G.db.factions[k].hanja; }).join(''))
      .split('').forEach(function (ch) { if (ch.trim()) serif[ch] = 1; });
    var serifText = Object.keys(serif).join('');
    var sample = G.db.list.map(function (c) { return c.key; }).join('') + '통무지정군주무장책사문관참모결의혈연불화진영결속지명다시뽑기열전편성확정추천';
    return Promise.all([
      addSheet('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;700&display=swap'),
      addSheet('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@900&text=' + encodeURIComponent(serifText) + '&display=swap')
    ]).then(function () {
      return Promise.race([
        Promise.all([
          document.fonts.load('400 16px "IBM Plex Sans KR"', sample), document.fonts.load('700 16px "IBM Plex Sans KR"', sample),
          document.fonts.load('900 32px "Noto Serif KR"', serifText)
        ]),
        new Promise(function (r) { setTimeout(r, 2500); })
      ]);
    }).catch(function () {});
  }

  /* ── HTML 창 내용 ───────────────────────── */
  function where(k) {
    var st = G.st;
    if (!st) return '';
    for (var i = 0; i < st.seats.length; i++) if (R.teamOf(st, st.seats[i]).indexOf(k) >= 0) return seatKo(st.seats[i]);
    if (st.pack.some(function (e) { return e.k === k && !e.by; })) return '펼침';
    if (st.pool.indexOf(k) >= 0) return '더미';
    return '범위 밖';
  }
  function steps(cb) { return cb.steps.map(function (n) { return n + '인 ' + (cb.t[n] > 0 ? '+' : '') + cb.t[n]; }).join(' / '); }
  function lordHTML(c) {
    var db = V(), fc = UI.hex(UI.cardColor(db, c.key)), f = Art.file(c.key, (G.st && G.st.world) || G.cfg.world), I = root.AtelierImg;
    var tag = c.role === 'lord' ? '기질 ' + esc(UI.traitKo(db, c.trait)) + (c.asLord ? ' · 갈래 ' + esc(UI.classKo(db, c.cls)) + ' <small>(' + esc(db.packName) + '에서 군주 — 본디 ' + R.ROLE_KO[c.baseRole] + ')</small>' : '') :
      '갈래 ' + esc(UI.classKo(db, c.cls)) + (c.sub ? ' · 부 ' + esc(UI.classKo(db, c.sub)) : '') + (db.classes[c.cls] ? ' <small>(' + esc(db.classes[c.cls].slots) + ')</small>' : '');
    var h = '<div class="d2-lord"><div class="d2-lord-top">' +
      (f && I ? '<img class="d2-pic" alt="" src="' + I.thumbURL(f) + '" onerror="this.remove()">' : '') +
      '<span class="d2-seal" style="--fc:' + fc + '">' + esc(c.seal) + '</span><div><b class="d2-nm">' + esc(c.key) + '</b> <small>' + esc(c.en) + '</small><br>' +
      R.facsOf(db, c.key).map(function (f) { return '<span style="color:' + UI.hex(UI.mix(UI.facColor(db, f), 0xffffff, 0.45)) + '">' + esc(f) + '</span>'; }).join('·') +
      ' · ' + R.ROLE_KO[c.role] + ' · ' + tag + (db.mode !== 'base' && R.facsOf(db, c.key).length > 1 ? ' <small>(' + esc(db.packName) + ' 이력)</small>' : '') + '</div></div>' +
      (c.lore ? '<p class="d2-lore">' + esc(c.lore) + '</p>' : '') +
      '<div class="d2-stats">' + ['통솔', '무력', '지력', '정치'].map(function (n, i) { var v = c.s[R.STATS[i]]; return '<span><i>' + n + '</i><b>' + v + '</b><u style="--w:' + v + '%"></u></span>'; }).join('') +
      '<span><i>전력</i><b>' + c.pw + '</b></span></div>';
    var list = db.byMember[c.key] || [];
    h += '<h3>결의 ' + list.length + '</h3>';
    if (!list.length) h += '<p class="d2-dim">맺을 결의가 없다</p>';
    else h += '<ul class="d2-pl">' + list.map(function (cb) {
      return '<li class="' + (cb.feud ? 'feud' : cb.kin ? 'kin' : '') + '"><b>' + (cb.kin ? '혈연 ' : '') + esc(cb.n) + '</b> <small>' + steps(cb) + '</small><br>' +
        cb.m.filter(function (n) { return n !== c.key; }).map(function (n) { var w = where(n); return esc(n) + (w ? ' <em class="w-' + (w === '아군' ? 'me' : /^적장/.test(w) ? 'foe' : 'etc') + '">' + w + '</em>' : ''); }).join(' · ') + '</li>';
    }).join('') + '</ul>';
    return h + '</div>';
  }
  function pledgeList(keys, mine) {
    var list = R.pledges(V(), keys);
    if (!list.length) return '<p class="d2-dim">아직 맺은 인연이 없다</p>';
    return '<ul class="d2-pl">' + list.map(function (g) {
      var right = g.got ? ((g.got > 0 ? '+' : '') + g.got + (g.next ? ' → ' + g.have.length + '/' + g.next : ' 완성')) : (g.have.length + '/' + g.next + ' ' + (g.nextV > 0 ? '+' : '') + g.nextV);
      var pct = g.got && !g.next ? 100 : Math.round(g.have.length / (g.next || g.gotk) * 100);
      return '<li class="' + (g.got < 0 || (!g.got && g.nextV < 0) ? 'feud' : g.kin ? 'kin' : '') + (g.got ? ' done' : '') + '"><b>' + (g.kin ? '혈연 ' : '') + esc(g.n) + '</b><span class="v">' + right + '</span>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        (g.next && mine ? '<small>남은 사람 · ' + g.miss.map(function (n) { return esc(n) + ' [' + where(n) + ']'; }).join(' · ') + '</small>' : '<small>' + g.have.map(esc).join(' · ') + '</small>') + '</li>';
    }).join('') + '</ul>';
  }
  function pledgeHTML() {
    return G.st.seats.map(function (s) { return '<h3>' + seatKo(s) + seatTag(s) + '</h3>' + pledgeList(R.teamOf(G.st, s), s === 'me'); }).join('') +
      '<p class="d2-dim">결의 ' + G.db.combos.length + '가지 — 혈연 ' + G.db.combos.filter(function (c) { return c.kin; }).length + ' · 불화 ' + G.db.combos.filter(function (c) { return c.feud; }).length +
      '. 13명 가운데 편성할 11명으로 센다.</p>' + bondHTML();
  }
  /* 옛 주군 · 배신 진척 — 아군 */
  function bondHTML() {
    var db = V(), b = R.bondsOf(db, G.st.mine), h = '<h3>옛 주군 · 배신</h3><ul class="d2-pl">';
    if (b.lord && b.lordFac) h += '<li class="' + (b.v ? 'done' : '') + '"><b>옛 주군 · ' + esc(b.lord) + '</b><span class="v">' + (b.v ? '+' + b.v : '0') + ' / ' + b.cap + '</span><br><small>' +
      facSpan(db, b.lordFac) + ' 을 거쳐 다른 세력으로 간 장수가 ' + esc(b.lord) + ' 아래 다시 모이면 한 사람에 +' + b.each + (b.reunion.length ? ' — ' + b.reunion.map(esc).join(' · ') : '') + '</small></li>';
    else h += '<li><small>주공(군주)이 서면, 그 세력을 거쳐 간 장수가 다시 모일 때 한 사람에 +' + (db.oldLord ? db.oldLord.v : 0) + '(합 ' + (db.oldLord ? db.oldLord.cap : 0) + '까지)</small></li>';
    b.betray.forEach(function (x) { h += '<li class="feud' + (x.got ? ' done' : '') + '"><b>배신 · ' + esc(x.a) + '와 ' + esc(x.b) + '</b><span class="v">' + (x.got ? x.v : '피할 것 ' + esc(x.miss) + ' [' + where(x.miss) + ']') + '</span><br><small>' + esc(x.why) + '</small></li>'; });
    return h + '</ul>';
  }
  function scoreTable(ev) {
    var db = V();
    return '<table class="d2-score"><tbody>' + ev.rows.map(function (r) {
      var lab = r.kind === 'syn' && r.fac ? esc(r.label).replace(esc(r.fac), facSpan(db, r.fac)) : r.kind === 'league' ? esc(r.label.split(' · ')[0]) + ' · ' + r.facs.map(function (f) { return facSpan(db, f); }).join(' ') : esc(r.label);
      return '<tr class="k-' + r.kind + '"><td>' + lab + '</td><td>' + (r.v > 0 && r.kind !== 'power' ? '+' : '') + r.v + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><td>합계</td><td>' + ev.total + '</td></tr></tfoot></table>';
  }
  function rankKo(x) { return x.tied ? '공동 ' + x.rank + '위' : x.rank + '위'; }
  function scoreHTML(res) {
    return '<div class="d2-cols' + (res.sides.length === 3 ? ' d2-cols3' : '') + '">' + res.sides.map(function (x) {
      return '<div><h3>' + rankKo(x) + ' · ' + seatKo(x.seat) + ' ' + x.ev.total + '</h3>' + scoreTable(x.ev) + '<p class="d2-dim">예비 · ' + (x.reserve.map(esc).join(' · ') || '없음') + '</p></div>';
    }).join('') + '</div>' +
      '<p class="d2-dim">진영 셈 · ' + esc(fmodeKo(G.st.fmode)) + '</p>' +
      '<p class="d2-dim">임시 결과 — 2단계에서 전장(거점 여덟 · 후군 셋) 겨루기가 들어오면 이 점수 비교는 바뀐다.</p>';
  }
  function helpHTML() {
    return '<ul class="d2-help"><li><b>13진</b>마다 후보 6장이 펼쳐지고 아군 · 적장(3인이면 적장 둘)이 차례로 한 장씩 지명한다. 선공은 진마다 한 자리씩 돈다.</li>' +
      '<li><b>천하</b> — 군웅록은 장수가 거친 세력마다 결속을 센다(여포는 동탁 · 여포, 결속 0.8배). 연도(194 · 200 · 208 · 263)는 그해의 세력으로, 그해에 없는 장수는 나오지 않는다. 위촉오+군웅은 위 · 촉 · 오와 군웅 각 세력(원소 · 동탁 …).</li>' +
      '<li><b>군웅 연합</b> — 위 · 촉 · 오가 아닌 세 세력 이상에서 각 둘 이상 모으면 더한다. <b>옛 주군</b> — 주공의 세력을 거쳐 간 장수가 다시 모이면 조금, <b>배신</b> — 이름난 배신 짝이 한 편이면 깎인다.</li>' +
      '<li><b>적장 기치</b> — 적장은 기치 세력의 장수를 반긴다. 3인이면 둘째 적장은 「군웅」 기치(위 · 촉 · 오 아닌 세력 모두).</li>' +
      '<li><b>3인(정립)</b> — 적장은 앞선 쪽을 더 견제한다. 결과는 셋의 순위.</li>' +
      '<li><b>정원</b> — 11번째까지 군주 1 · 무장 5 · 참모 5(책사 · 문관). 12 · 13번째는 예비라 제한이 없다. 갈래는 정원에 걸리지 않는다.</li>' +
      '<li>카드 오른쪽 위 숫자는 <b>뽑으면 오르는 점수</b>, 금색이 지금 가장 큰 것. 아래 금빛 줄은 맺거나 다가서는 결의.</li>' +
      '<li><b>다시 뽑기</b> — 판마다 한 번, 펼친 후보를 모두 물리고 새로 6장.</li>' +
      '<li>끝나면 13명 가운데 11명을 편성한다. 점수 = 장수 전력 + 진영 결속 + 결의(혈연 · 불화) + 주공의 그릇.</li>' +
      '<li>지금은 1단계 — 전장 겨루기(2단계) · 결의 효과 · 후군 계략(3단계) · 연출(4단계)이 뒤에 온다.</li></ul>';
  }
  function openLord(key) { var c = V().by[key]; if (c) UI.sheet.open(c.key + ' 열전', lordHTML(c)); }
  function cardOpts(o) { o.db = V(); return o; }

  /* ── 장면 바탕 ─────────────────────────── */
  class Base extends Phaser.Scene {
    create(data) {
      this.d2hits = []; this.animating = false;
      var self = this;
      this._onResize = function () { self.redraw(); };
      this._onArt = function (t, s) { if (s === 'ok' && self.usesArt && self.usesArt(t)) self.artDirty(); };
      this.scale.on('resize', this._onResize);
      this.game.events.on('d2-art', this._onArt);
      this.events.once('shutdown', function () { self.scale.off('resize', self._onResize); self.game.events.off('d2-art', self._onArt); UI.sheet.close(true); });
      if (this.setup) this.setup(data || {});
      this.redraw();
    }
    redraw() {
      this.tweens.killAll();
      this.children.getAll().slice().forEach(function (o) { o.destroy(); });
      this.d2hits = [];
      var v = UI.cam(this); this.W = v.W; this.H = v.H;
      this.draw();
    }
    artDirty() {
      var self = this;
      if (this._artT) return;
      this._artT = this.time.delayedCall(200, function () { self._artT = null; if (self.animating) self._artLater = true; else self.redraw(); });
    }
    later(n, fn) {
      var self = this;
      return this.time.delayedCall(ms(n), function run() { if (UI.sheet.isOpen()) { self.time.delayedCall(150, run); return; } fn(); });
    }
  }

  /* ── Boot — 자료 · 글꼴 · 그림 미리 읽기 ── */
  class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }
    preload() {
      var W = this.scale.width, H = this.scale.height;
      this.cameras.main.setBackgroundColor(UI.hex(C.bg));
      this.msg = this.add.text(W / 2, H / 2, '…', { fontFamily: UI.SANS, fontSize: Math.round(18 * root.Draft2Main.zoom()) + 'px', color: UI.hex(C.dim) }).setOrigin(0.5);
      this.load.json('gen', 'data/draft2-generals.json');
      this.load.json('design', 'data/sam-design.json');
      this.load.json('combos', 'data/draft2-combos.json');
      this.load.json('packs', 'data/draft2-packs.json');
      this.load.json('factions', 'data/draft2-factions.json');
      this.load.json('bonds', 'data/draft2-bonds.json');
      this.load.json('img', 'data/img.json');
      this.load.json('style', 'data/style.json');
      var self = this;
      this.load.on('progress', function (p) { self.msg.setText(Math.round(p * 100) + '%'); });
    }
    create() {
      var self = this, J = this.cache.json;
      try {
        G.data = { gen: J.get('gen'), design: J.get('design'), combos: J.get('combos'), packs: J.get('packs'), factions: J.get('factions'), bonds: J.get('bonds'), img: J.get('img') || { img: {} }, style: J.get('style') || {} };
        G.db = R.buildDB(G.data.gen, G.data.design, G.data.combos, G.data.packs, G.data.factions, G.data.bonds);
        Art.setup(this.game, G.data.img, G.data.style);
      } catch (e) {
        G.err = e; this.msg.setText('자료를 읽지 못했다 — ' + e.message); return;
      }
      G.cfg = cfgLoad();
      /* 그림 미리 읽기 — 지난번 고른 세계의 표지 셋과 장수 범위를 뒤에서 받는다 */
      Art.want(SAMPLE[G.cfg.world].concat(['여포']), G.cfg.world, true);
      Art.want(poolKeys(G.cfg.world, 'art'), G.cfg.world);
      loadFonts().then(function () { self.scene.start('Title'); });
    }
  }

  /* ── Title ─────────────────────────────── */
  class Title extends Base {
    constructor() { super('Title'); }
    setup() { this.saved = R.restore(G.db, load(KEY_GAME)); if (!this.saved) drop(KEY_GAME); }
    usesArt() { return true; }
    draw() {
      var W = this.W, H = this.H, self = this, cx = W / 2, world = G.cfg.world;
      UI.backdrop(this, W, H, '戰');
      /* 부채꼴 카드 다섯 — 고른 세계의 군주들 */
      var fan = ['원소', SAMPLE[world][1], SAMPLE[world][0], SAMPLE[world][2], '여포'], cw = UI.clamp(Math.min(W / 3.6, H / 5.4), 80, 200), ch = cw * 1.5;
      /* 부채 · 제목 · 단추를 한 덩어리로 세로 가운데 */
      var ts = UI.clamp(W / 8.5, 34, 68), bh = 50, nb = this.saved ? 2 : 1;
      var blockH = ch + cw * 0.3 + 16 + ts * 2.6 + 30 + nb * (bh + 10) + 40;
      var top = Math.max(18, (H - 30 - blockH) / 2);
      fan.forEach(function (k, i) {
        var c = V().by[k]; if (!c) return;
        var off = i - 2, ct = UI.card(self, c, 0, 0, cw, ch, cardOpts({ world: world, mini: true }));
        var holder = self.add.container(cx + off * cw * 0.62, top + ch / 2 + Math.abs(off) * cw * 0.1);
        ct.setPosition(-cw / 2, -ch / 2); holder.add(ct);
        holder.setAngle(off * 7).setAlpha(i === 2 ? 1 : 0.85).setDepth(i === 2 ? 5 : 4 - Math.abs(off));
        if (!self._dealt) { holder.y += 30; holder.alpha = 0; self.tweens.add({ targets: holder, y: holder.y - 30, alpha: i === 2 ? 1 : 0.85, duration: ms(420), delay: ms(80 * i), ease: 'Cubic.easeOut' }); }
      });
      this._dealt = true;
      var ty = top + ch + cw * 0.3 + 16;
      UI.text(this, cx, ty, '삼국지 쟁탈전', { serif: true, size: ts, origin: [0.5, 0], color: C.paper, stroke: 0x0c0906, strokeW: 6 });
      UI.text(this, cx, ty + ts * 1.25, '· 전장 ·', { serif: true, size: ts * 0.48, origin: [0.5, 0], color: C.gold });
      UI.text(this, cx, ty + ts * 1.25 + ts * 0.7, '장수를 번갈아 지명하고 열한 명으로 겨룬다', { size: 14, origin: [0.5, 0], color: C.dim });
      var bw = Math.min(300, W - 48), by = ty + ts * 2.6 + 30;
      UI.button(this, null, cx - bw / 2, by, bw, bh, '새 판 짜기', { id: 'new', kind: 'primary' }, function () { self.scene.start('Setup'); });
      by += bh + 10;
      if (this.saved) {
        var s = this.saved;
        UI.button(this, null, cx - bw / 2, by, bw, bh, '이어하기', { id: 'resume', sub: worldKo(s.world) + ' · ' + s.players + '인 · ' + (s.phase === 'lineup' ? '편성' : (s.round + 1) + '진') + ' · ' + R.LEVELS[s.lv] }, function () {
          G.st = s; G.cfg.world = s.world; Art.want(s.pool.concat(s.mine, s.foe, s.foe2 || [], s.pack.map(function (e) { return e.k; })), s.world, true);
          self.scene.start(s.phase === 'lineup' ? 'Lineup' : 'Draft');
        });
        by += bh + 10;
      }
      UI.button(this, null, cx - bw / 2, by, bw, 40, '옛 판 · 삼국지 쟁탈전', { id: 'old' }, function () { location.href = 'draft.html'; });
      UI.text(this, cx, H - 22, '만드는 중 · 1단계 — 그림 카드 · 세계 고르기 · 지명', { size: 11, origin: [0.5, 1], color: C.dim, alpha: 0.8 });
    }
  }

  /* ── Setup — 세계 셋 · 인원 · 진영 셈 · 장수 범위 · 적장 수준 · 오늘의 대국 ── */
  class Setup extends Base {
    constructor() { super('Setup'); }
    usesArt(t) { return t.indexOf('art:') === 0; }
    setup() { Art.WORLDS.forEach(function (w) { Art.want(SAMPLE[w], w, true); }); }
    draw() {
      var W = this.W, H = this.H, self = this, cfg = G.cfg, pad = 16, CW = Math.min(W - pad * 2, 760), X0 = (W - CW) / 2;
      UI.backdrop(this, W, H, WORLD_GLYPH[cfg.world]);
      UI.button(this, null, X0, 14, 64, 34, '‹ 처음', { id: 'back', size: 13 }, function () { self.scene.start('Title'); });
      UI.text(this, W / 2, 18, '세계 고르기', { serif: true, size: 26, origin: [0.5, 0] });
      /* 세계 셋 — 대표 카드 · 이름 · 그림 수 */
      var gap = 10, tw = Math.min(200, (CW - gap * 2) / 3), th = tw * 1.5, tx = (W - (tw * 3 + gap * 2)) / 2, ty = 64;
      var room = H - ty - 460;
      if (th > room && room > 120) { th = room; tw = th / 1.5; tx = (W - (tw * 3 + gap * 2)) / 2; }
      Art.WORLDS.forEach(function (w, i) {
        var x = tx + i * (tw + gap), on = cfg.world === w, k = sampleOf(w);
        var ct = UI.card(self, V().by[k], x, ty, tw, th, cardOpts({ world: w, mini: true, selected: on }));
        if (!on) ct.setAlpha(0.62);
        var lb = UI.text(self, x + tw / 2, ty + th + 8, worldKo(w), { serif: true, size: UI.clamp(tw * 0.14, 14, 22), origin: [0.5, 0], color: on ? C.gold2 : C.paper });
        UI.fit(lb, tw);
        UI.text(self, x + tw / 2, ty + th + 8 + UI.clamp(tw * 0.14, 14, 22) * 1.35, '그림 ' + artCount(w) + '명', { size: 12, origin: [0.5, 0], color: C.dim });
        var hz = self.add.rectangle(x, ty, tw, th + 50, 0x000000, 0.001).setOrigin(0);
        UI.press(hz, function () { if (cfg.world !== w) { cfg.world = w; save(KEY_CFG, cfg); Art.want(poolKeys(w, 'art'), w, true); self.redraw(); } });
        UI.hit(self, 'world:' + w, x, ty, tw, th + 50);
      });
      /* 고르개 줄 */
      var y = ty + th + 66, rowH = 44, lw = Math.min(110, CW * 0.28);
      function row(label, opts, cur, onPick, id, per) {
        per = per || opts.length;
        var lines = Math.ceil(opts.length / per);
        UI.text(self, X0, y + rowH / 2, label, { size: 14, bold: true, origin: [0, 0.5], color: C.dim });
        var bx = X0 + lw, bw = (CW - lw - (per - 1) * 6) / per;
        opts.forEach(function (o, i) {
          UI.button(self, null, bx + (i % per) * (bw + 6), y + 4 + Math.floor(i / per) * (rowH - 6), bw, rowH - 8, o.label, { id: id + ':' + o.v, kind: 'toggle', on: cur === o.v, size: 13 }, function () { onPick(o.v); save(KEY_CFG, cfg); self.redraw(); });
        });
        y += rowH + (lines - 1) * (rowH - 6);
      }
      row('인원', [{ v: 2, label: '2인 · 맞대결' }, { v: 3, label: '3인 · 정립' }], cfg.players, function (v) { cfg.players = v; }, 'players');
      row('천하', TIANXIA, cfg.fmode, function (v) { cfg.fmode = v; }, 'fmode', 3);
      row('장수 범위', [{ v: 'art', label: '그림 있는 장수 ' + poolKeys(cfg.world, 'art').length + '명' }, { v: 'all', label: '전체 ' + poolKeys(cfg.world, 'all').length + '명' }], cfg.scope, function (v) { cfg.scope = v; }, 'scope');
      row('적장', R.LEVELS.map(function (n, i) { return { v: i, label: n }; }), cfg.lv, function (v) { cfg.lv = v; }, 'lv');
      row('진행', [{ v: 'normal', label: '보통' }, { v: 'quick', label: '빠름' }], cfg.speed || 'normal', function (v) { cfg.speed = v; }, 'speed');
      row('오늘의 대국', [{ v: false, label: '끔' }, { v: true, label: '켬' }], cfg.daily, function (v) { cfg.daily = v; }, 'daily');
      var note = (cfg.fmode === 'mx' ? '군웅록 — 장수가 거친 세력마다 결속을 센다(여포는 동탁 · 여포). ' : cfg.fmode === 'base' ? '위 · 촉 · 오와 군웅 각 세력(원소 · 동탁 …)으로 센다. ' : fmodeKo(cfg.fmode) + ' — 그해의 세력으로, 그해에 없는 장수는 나오지 않는다. ') +
        (cfg.daily ? '오늘의 대국 — 같은 날 · 같은 설정이면 누구나 같은 후보와 같은 적장을 만난다.' :
        cfg.scope === 'art' ? worldKo(cfg.world) + ' 그림이 있는 장수만 나온다.' : '그림이 없는 장수는 도장 글자 카드로 나온다.');
      UI.text(this, W / 2, y + 6, note, { size: 12, color: C.dim, origin: [0.5, 0], wrap: CW, align: 'center' });
      var n = poolKeys(cfg.world, cfg.scope).length, ok = n >= R.needKeys(cfg.players);
      var bw = Math.min(320, CW), bh = 52, by = Math.min(H - bh - 14, y + 50);
      UI.button(this, null, (W - bw) / 2, by, bw, bh, ok ? '지명 시작' : '장수가 모자란다', { id: 'start', kind: 'primary', disabled: !ok, sub: worldKo(cfg.world) + ' · ' + cfg.players + '인 · ' + n + '명 · 적장 ' + R.LEVELS[cfg.lv] }, function () { self.start(); });
    }
    start() {
      var cfg = G.cfg, keys = poolKeys(cfg.world, cfg.scope);
      var seed = cfg.daily ? R.todaySeed(new Date(), 'samguk_draft2|' + cfg.world + '|' + cfg.scope + '|' + cfg.lv + '|' + cfg.players + '|' + cfg.fmode) : (Math.floor(Math.random() * 4294967295) + 1) >>> 0;
      G.st = R.newGame(G.db, { keys: keys, seed: seed, lv: cfg.lv, world: cfg.world, scope: cfg.scope, daily: cfg.daily, players: cfg.players, fmode: cfg.fmode, id: Date.now().toString(36) });
      persist();
      Art.want(keys, cfg.world, true);
      this.scene.start('Draft');
    }
  }

  /* ── Draft — 13진 × 후보 6장 ───────────────── */
  class Draft extends Base {
    constructor() { super('Draft'); }
    setup() { this.sel = -1; this.myTurn = false; this.msg = ''; this.sub = ''; this.cards = []; this.deal = true; var self = this; this.later(120, function () { self.step(); }); }
    usesArt(t) { var st = G.st; if (!st) return false; var k = t.split(':')[2]; return t.indexOf('art:' + st.world + ':') === 0 && (st.pack.some(function (e) { return e.k === k; })); }
    /* 위에서: 머리(몇 진 · 알림) → 후보 여섯 → 진영 칸(2인 둘 · 3인 셋, 아래 줄 바로 위) → 아래 줄. 낮은 화면(가로 폰)은 머리를 줄인다 */
    layout() {
      var W = this.W, H = this.H, pad = 12, CW = Math.min(W - pad * 2, 1200), X0 = (W - CW) / 2, n = G.st ? G.st.seats.length : 2, compact = H < 600;
      var barH = compact ? 42 : 50, barY = H - barH - (compact ? 6 : 10);
      var perRow = CW < 520 ? 7 : 13, chipH = compact ? 20 : 24, rows = Math.ceil(R.ROUNDS / perRow), teamH = 18 + rows * (chipH + 4);
      var cols = CW >= 700 ? 6 : 3, gr = R.PACK / cols, gap = cols === 6 ? 10 : 8;
      var top = compact ? 60 : 104, teamY = barY - teamH * n - 4 * (n - 1) - 8, avail = teamY - 10 - top;
      var cw = Math.min(210, (CW - (cols - 1) * gap) / cols), ch = cw * 1.5;
      if (gr * ch + (gr - 1) * gap > avail) { ch = Math.max(90, (avail - (gr - 1) * gap) / gr); cw = ch / 1.5; }
      var gx = (W - (cols * cw + (cols - 1) * gap)) / 2, gh = gr * ch + (gr - 1) * gap;
      /* 남는 높이는 후보 위아래로 나눈다 — 두 진영 칸은 아래 줄 바로 위 */
      top += Math.max(0, (avail - gh) / 2);
      return { W: W, H: H, CW: CW, X0: X0, barY: barY, barH: barH, perRow: perRow, chipH: chipH, teamH: teamH, cols: cols, gap: gap, cw: cw, ch: ch, gx: gx, top: top,
        teamY: Math.max(teamY, top + gh + 10), compact: compact };
    }
    draw() {
      var st = G.st, db = V(), L = st && this.layout(), self = this;
      if (!st) { this.scene.start('Title'); return; }
      UI.backdrop(this, L.W, L.H, WORLD_GLYPH[st.world]);
      /* 머리 — 몇 진 · 선공 · 적장 / 점수 */
      var rd = Math.min(st.round + 1, R.ROUNDS), log = st.log[st.log.length - 1] || {};
      var rt = UI.text(this, L.X0, L.compact ? 4 : 10, rd + '진', { serif: true, size: L.compact ? 24 : 30, color: C.paper });
      UI.fit(UI.text(this, L.X0 + rt.width + 8, L.compact ? 12 : 22, '/ ' + R.ROUNDS + '  ·  ' + seatKo(log.first) + ' 선공' + (st.round >= R.FINAL ? '  ·  예비' : ''), { size: 13, color: C.dim }), L.CW - rt.width - 110);
      if (!L.compact) UI.fit(UI.text(this, L.X0, 48, worldKo(st.world) + ' · ' + st.players + '인 · ' + fmodeKo(st.fmode) + ' · 적장 ' + R.LEVELS[st.lv] + '(' + stylesKo(st) + ')' + (st.daily ? ' · 오늘의 대국' : ''), { size: 12, color: C.dim }), L.CW);
      UI.button(this, null, L.X0 + L.CW - 54, 8, 54, 30, '나가기', { id: 'exit', size: 12 }, function () { persist(); self.scene.start('Title'); });
      UI.button(this, null, L.X0 + L.CW - 54 - 36, 8, 30, 30, '?', { id: 'help', size: 14 }, function () { UI.sheet.open('규칙', helpHTML()); });
      /* 알림 줄 */
      var mt = UI.text(this, L.W / 2, L.compact ? 38 : 64, this.msg, { size: 14, bold: true, origin: [0.5, 0], color: this.myTurn ? C.gold2 : C.paper });
      UI.fit(mt, L.CW);
      if (this.sub && !L.compact) UI.fit(UI.text(this, L.W / 2, 85, this.sub, { size: 11, origin: [0.5, 0], color: C.dim }), L.CW);
      /* 후보 */
      var legal = this.myTurn ? R.legal(db, st, 'me') : [], hints = {}, bestD = -1e9;
      st.pack.forEach(function (e, i) { if (!e.by) { hints[i] = R.hintOf(db, st.mine, e.k); if (legal.indexOf(i) >= 0 && hints[i].d > bestD) bestD = hints[i].d; } });
      this.cards = [];
      st.pack.forEach(function (e, i) {
        var col = i % L.cols, row = Math.floor(i / L.cols), x = L.gx + col * (L.cw + L.gap), y = L.top + row * (L.ch + L.gap), c = db.by[e.k];
        var open = !e.by, blocked = open && self.myTurn && legal.indexOf(i) < 0;
        var ct = UI.card(self, c, x, y, L.cw, L.ch, {
          db: db, world: st.world, hint: open ? hints[i] : null, near: open ? R.nearOf(db, st, 'me', e.k) : null, blocked: blocked,
          mark: e.by ? { label: seatKo(e.by) + ' 지명', color: seatColor(e.by) } : null,
          selected: self.sel === i && open, best: open && self.myTurn && !blocked && hints[i].d === bestD
        });
        self.cards[i] = ct;
        var hz = self.add.rectangle(x, y, L.cw, L.ch, 0x000000, 0.001).setOrigin(0);
        UI.press(hz, function () { self.tapCard(i); });
        UI.hit(self, 'card:' + i, x, y, L.cw, L.ch, { key: e.k, open: open, legal: self.myTurn && legal.indexOf(i) >= 0 });
        if (self.deal && open) { ct.y -= 26; ct.alpha = 0; self.tweens.add({ targets: ct, y: y, alpha: blocked ? 0.42 : 1, duration: ms(200), delay: ms(35 * i), ease: 'Cubic.easeOut' }); }
      });
      if (this.deal) { this.animating = true; this.time.delayedCall(ms(200 + 35 * 6), function () { self.animating = false; if (self._artLater) { self._artLater = false; self.redraw(); } }); }
      this.deal = false;
      /* 진영마다 — 13칸(12 · 13은 예비) */
      st.seats.forEach(function (s, i) { self.team(s, L.X0, L.teamY + i * (L.teamH + 4), L); });
      /* 아래 줄 — 결의 · 열전 · 다시 뽑기 · 지명 */
      var sel = this.sel >= 0 && st.pack[this.sel] && !st.pack[this.sel].by ? st.pack[this.sel] : null, canPick = sel && this.myTurn && legal.indexOf(this.sel) >= 0;
      var bw = (L.CW - 18) / 4.6, x0 = L.X0;
      UI.button(this, null, x0, L.barY, bw, L.barH, '결의', { id: 'pledges' }, function () { UI.sheet.open('결의 진척', pledgeHTML()); });
      UI.button(this, null, x0 + bw + 6, L.barY, bw, L.barH, '열전', { id: 'lore', disabled: !sel }, function () { if (sel) openLord(sel.k); });
      UI.button(this, null, x0 + (bw + 6) * 2, L.barY, bw, L.barH, '다시 뽑기', { id: 'reroll', disabled: !this.myTurn || st.rerolls.me < 1, sub: '남은 ' + st.rerolls.me }, function () { self.doReroll(); });
      var pw = L.CW - (bw + 6) * 3;
      UI.button(this, null, x0 + (bw + 6) * 3, L.barY, pw, L.barH, canPick ? '지명 · ' + sel.k : '지명', { id: 'pick', kind: 'primary', disabled: !canPick }, function () { if (canPick) self.myPick(self.sel); });
    }
    team(seat, x, y, L) {
      var st = G.st, db = V(), keys = R.teamOf(st, seat), n = R.counts(db, keys.slice(0, R.FINAL));
      var head = seatKo(seat) + seatTag(seat) + ' ' + keys.length + '/' + R.ROUNDS + ' · ' + R.evaluate(db, keys).total + '점   군주 ' + n.lord + '/1 · 무장 ' + n.general + '/5 · 참모 ' + n.staff + '/5';
      UI.fit(UI.text(this, x, y - 1, head, { size: 12, bold: true, color: seatColor(seat) }), L.CW);
      var cw = (L.CW - (L.perRow - 1) * 4) / L.perRow;
      for (var i = 0; i < R.ROUNDS; i++) {
        var cx = x + (i % L.perRow) * (cw + 4), cy = y + 18 + Math.floor(i / L.perRow) * (L.chipH + 4), k = keys[i], reserve = i >= R.FINAL;
        var bg = this.add.rectangle(cx, cy, cw, L.chipH, k ? C.panel2 : C.bg, k ? 1 : 0.6).setOrigin(0).setRounded(6);
        bg.setStrokeStyle(1, reserve ? UI.mix(C.gold, C.bg, 0.5) : C.line, 1);
        if (!k) { UI.text(this, cx + cw / 2, cy + L.chipH / 2, reserve ? '예비' : String(i + 1), { size: 10, color: C.line, origin: [0.5, 0.5] }); continue; }
        var c = db.by[k], fc = UI.cardColor(db, k);
        this.add.circle(cx + 11, cy + L.chipH / 2, 8, fc, 1);
        UI.text(this, cx + 11, cy + L.chipH / 2, c.seal.charAt(0), { serif: true, size: 10, origin: [0.5, 0.5] });
        UI.fit(UI.text(this, cx + 22, cy + L.chipH / 2, k, { size: 11, bold: true, origin: [0, 0.5] }), cw - 25);
        (function (kk) { UI.press(bg, function () { openLord(kk); }); })(k);
        UI.hit(this, seat + ':' + i, cx, cy, cw, L.chipH, { key: k });
      }
    }
    tapCard(i) {
      var e = G.st.pack[i];
      if (!e || e.by) { if (e) openLord(e.k); return; }
      if (this.sel === i && this.myTurn && R.legal(V(), G.st, 'me').indexOf(i) >= 0) { this.myPick(i); return; }
      this.sel = i; this.redraw();
    }
    say(m, s) { this.msg = m; this.sub = s || ''; }
    /* 진행 — 차례를 보고 적장이면 한 수, 아군이면 기다린다. 진이 끝나면 다음 진, 13진이 끝나면 편성 */
    step() {
      var st = G.st, db = V(), self = this;
      if (st.phase === 'lineup') { this.scene.start('Lineup'); return; }
      var seat = R.turn(st);
      if (!seat) { this.roundEnd(); return; }
      var added = R.ensureChoices(db, st, seat);
      persist();
      if (seat !== 'me') {
        this.myTurn = false; this.sel = -1;
        this.say(seatKo(seat) + ' 차례 — 고르는 중…', added ? '남은 역할에 맞는 후보 ' + added + '장을 채웠다' : '');
        this.redraw();
        this.later(320, function () { self.aiStep(seat); });
      } else {
        this.myTurn = true;
        var open = R.openIdx(st).length;
        this.say(st.mine.length ? '그대의 차례 — 남은 ' + open + '장' : open + '장 가운데 하나를 지명하라',
          added ? '남은 역할에 맞는 후보 ' + added + '장을 채웠다' : st.round >= R.FINAL ? '예비 지명 — 역할 제한 없이 고르고 마지막에 11명을 편성한다' :
          !st.mine.length ? '카드를 누르면 고르고, 한 번 더 누르거나 「지명」 으로 정한다' : this.sub);
        this.redraw();
      }
    }
    aiStep(seat) {
      var st = G.st, db = V(), self = this, act = R.aiAct(db, st, seat);
      persist();
      if (act.type === 'reroll') {
        this.say(seatKo(seat) + ' — 후보를 물리고 다시 폈다', ''); this.deal = true; this.redraw();
        this.later(400, function () { self.aiStep(seat); });
        return;
      }
      this.say(seatKo(seat) + ' — ' + josa(act.key, '을', '를') + ' 지명했다', (db.by[act.key].lore || ''));
      this.pickAnim(act.idx, function () { self.step(); });
    }
    myPick(i) {
      var st = G.st, self = this;
      if (!this.myTurn || R.legal(V(), st, 'me').indexOf(i) < 0) return;
      this.myTurn = false; this.sel = -1;
      var k = R.pick(V(), st, 'me', i);
      persist();
      this.say(josa(k, '을', '를') + ' 지명했다', G.db.by[k].lore || '');
      this.pickAnim(i, function () { self.step(); });
    }
    doReroll() {
      if (!this.myTurn) return;
      var n = R.reroll(V(), G.st, 'me');
      if (!n) { this.say('새로 펼칠 후보가 없다 — 횟수는 그대로', ''); this.redraw(); return; }
      persist();
      this.sel = -1; this.deal = true;
      this.say('새 후보 ' + n + '장 — 하나를 지명하라', ''); this.redraw();
    }
    pickAnim(i, done) {
      var self = this;
      this.redraw();
      var ct = this.cards[i];
      if (!ct) { this.later(200, done); return; }
      this.animating = true;
      this.tweens.add({ targets: ct, y: ct.y - 10, duration: ms(110), yoyo: true, ease: 'Quad.easeOut' });
      this.later(G.st.q.length ? 240 : 300, function () { self.animating = false; done(); });
    }
    roundEnd() {
      var st = G.st, self = this;
      this.myTurn = false; this.sel = -1;
      this.animating = true;
      st.pack.forEach(function (e, i) { if (!e.by && self.cards[i]) self.tweens.add({ targets: self.cards[i], alpha: 0, y: self.cards[i].y + 14, duration: ms(160) }); });
      this.later(200, function () {
        self.animating = false;
        var r = R.endRound(V(), st);
        persist();
        if (r === 'lineup') { self.scene.start('Lineup'); return; }
        self.deal = true; self.step();
      });
    }
  }

  /* ── Lineup — 13명 가운데 11명 ───────────── */
  class Lineup extends Base {
    constructor() { super('Lineup'); }
    setup() {
      var st = G.st;
      if (st) st.lineup = (st.lineup || []).filter(function (k, i, a) { return st.mine.indexOf(k) >= 0 && a.indexOf(k) === i; });
      if (st && !st.lineup.length) st.lineup = R.bestLineup(V(), st.mine).team.slice();
    }
    usesArt(t) { return !!G.st && t.indexOf('art:' + G.st.world + ':') === 0; }
    draw() {
      var st = G.st, db = V(), self = this, W = this.W, H = this.H;
      if (!st) { this.scene.start('Title'); return; }
      UI.backdrop(this, W, H, '陣');
      var pad = 12, CW = Math.min(W - pad * 2, 1080), X0 = (W - CW) / 2;
      UI.text(this, W / 2, 12, '편성', { serif: true, size: 28, origin: [0.5, 0] });
      var chosen = st.lineup.filter(function (k) { return st.mine.indexOf(k) >= 0; }), chk = R.lineupCheck(db, st, chosen), n = chk.counts;
      var line = '출전 ' + chosen.length + '/11 · 군주 ' + n.lord + '/1 · 무장 ' + n.general + '/5 · 참모 ' + n.staff + '/5' + (chosen.length === 11 ? ' · ' + R.evaluateRaw(db, chosen).total + '점' : '');
      UI.fit(UI.text(this, W / 2, 50, line, { size: 14, bold: true, origin: [0.5, 0], color: chk.ok ? C.gold2 : C.paper }), CW);
      UI.fit(UI.text(this, W / 2, 72, chk.need ? '지명한 장수로 정원을 다 맞출 수 없어 ' + chk.need + '명까지 넘쳐도 된다' : '두 명은 예비로 남는다 — 누르면 출전 · 예비가 바뀐다', { size: 11, origin: [0.5, 0], color: C.dim }), CW);
      var barH = 50, barY = H - barH - 12, top = 96, avail = barY - top - 12, gap = 8, best = null;
      for (var cols = 3; cols <= 7; cols++) {
        var rows = Math.ceil(st.mine.length / cols), w = (CW - (cols - 1) * gap) / cols, h = w * 1.5;
        if (rows * h + (rows - 1) * gap > avail) { h = (avail - (rows - 1) * gap) / rows; w = h / 1.5; }
        w = Math.min(w, 170);
        if (!best || w > best.w) best = { cols: cols, w: w, h: w * 1.5 };
      }
      var gx = (W - (best.cols * best.w + (best.cols - 1) * gap)) / 2;
      st.mine.forEach(function (k, i) {
        var x = gx + (i % best.cols) * (best.w + gap), y = top + Math.floor(i / best.cols) * (best.h + gap), on = chosen.indexOf(k) >= 0;
        var ct = UI.card(self, db.by[k], x, y, best.w, best.h, { db: db, world: st.world, mini: true, selected: on,
          badge: on ? { label: '출전', fill: C.gold, color: 0x1a140c } : { label: '예비', fill: 0x000000, color: C.dim } });
        if (!on) ct.setAlpha(0.55);
        var hz = self.add.rectangle(x, y, best.w, best.h, 0x000000, 0.001).setOrigin(0);
        UI.press(hz, function () { self.toggle(k); });
        UI.hit(self, 'mine:' + i, x, y, best.w, best.h, { key: k, on: on });
      });
      var bw = (CW - 12) / 3;
      UI.button(this, null, X0, barY, bw, barH, '추천 편성', { id: 'auto' }, function () { st.lineup = R.bestLineup(db, st.mine).team.slice(); persist(); self.redraw(); });
      UI.button(this, null, X0 + bw + 6, barY, bw, barH, '결의', { id: 'pledges' }, function () { UI.sheet.open('결의 — 출전 11명', '<h3>아군</h3>' + pledgeList(chosen, false)); });
      UI.button(this, null, X0 + (bw + 6) * 2, barY, bw, barH, '확정 · 결과', { id: 'confirm', kind: 'primary', disabled: !chk.ok }, function () { self.confirm(); });
    }
    toggle(k) {
      var st = G.st, at = st.lineup.indexOf(k);
      if (at >= 0) st.lineup.splice(at, 1); else if (st.lineup.length < R.FINAL) st.lineup.push(k);
      persist(); this.redraw();
    }
    confirm() {
      var st = G.st, chosen = st.lineup.filter(function (k) { return st.mine.indexOf(k) >= 0; });
      if (!R.lineupCheck(V(), st, chosen).ok) return;
      R.finalize(V(), st, chosen);
      persist();
      this.scene.start('Result');
    }
  }

  /* ── Result — 임시: 점수 비교(3인은 순위)와 채점표 ───── */
  function tale(res) {
    var top = res.mine.slice().sort(function (a, b) { return G.db.by[b].pw - G.db.by[a].pw; })[0], d = res.d, t = josa(top, '이', '가');
    if (res.sides.length === 3) {
      if (res.rank === 1 && !res.tied) return '세 진영이 맞선 끝에 ' + top + '의 깃발만이 남았다. 천하는 하나로 묶였다.';
      if (res.rank === 1) return '두 깃발이 나란히 섰다. 천하는 아직 둘로 갈려 있다.';
      if (res.rank === 2) return t + ' 버텼으나 ' + seatKo(res.opSeat) + '의 기세를 꺾지 못했다. 솥발은 아직 서 있다.';
      return '두 적진 사이에 끼어 진이 흩어졌다. ' + t + ' 남은 군사를 거두어 물러났다.';
    }
    if (d > 140) return '적진은 첫 합에 무너졌다. ' + top + '의 깃발이 강을 건너 북쪽 벌판까지 나아갔다.';
    if (d > 0) return '접전이었다. 해 질 무렵 ' + t + ' 적의 중군을 갈랐고, 그것으로 승부가 갈렸다.';
    if (d === 0) return '양군은 사흘을 대치하다 각기 물러났다. 승패는 다음 해로 미루어졌다.';
    if (d > -140) return t + ' 홀로 분전했으나, 진의 결속이 적에 미치지 못했다.';
    return '진이 서로 어우러지지 못했다. 장수는 흩어지고 막료는 말이 없었다.';
  }
  function sums(ev) {
    var o = { power: 0, syn: 0, combo: 0, feud: 0, bond: 0, lord: 0 };
    ev.rows.forEach(function (r) { var k = r.kind === 'etc' || r.kind === 'league' ? 'syn' : r.kind === 'kin' ? 'combo' : r.kind === 'betray' ? 'bond' : r.kind; o[k] = (o[k] || 0) + r.v; });
    return o;
  }
  /* 한 편의 주 세력 — 결속 줄 가운데 가장 큰 것 */
  function mainFac(ev) {
    var best = null; ev.rows.forEach(function (r) { if (r.kind === 'syn' && (!best || r.v > best.v)) best = r; });
    return best && best.fac;
  }
  /* 큰 글자 — 2인: 승리 · 패배 · 무승부, 3인: 천하통일 · 공동 1위 · 2위 · 3위(옛 정립전) */
  function verdict(res) {
    if (res.sides.length === 3) {
      var w = res.rank === 1 ? (res.tied ? '공동 1위' : '천하통일') : res.rank === 2 ? (res.tied ? '공동 2위' : '2위') : '3위';
      return { word: w, color: res.rank === 1 ? C.gold2 : res.rank === 2 ? C.paper : C.foe, glyph: res.rank === 1 ? '勝' : res.rank === 2 ? '和' : '敗' };
    }
    var d = res.d;
    return { word: d > 0 ? '승리' : d < 0 ? '패배' : '무승부', color: d > 0 ? C.gold2 : d < 0 ? C.foe : C.paper, glyph: d > 0 ? '勝' : d < 0 ? '敗' : '和' };
  }
  class Result extends Base {
    constructor() { super('Result'); }
    usesArt(t) { return !!G.st && t.indexOf('art:' + G.st.world + ':') === 0; }
    draw() {
      var st = G.st, db = V(), self = this, W = this.W, H = this.H;
      if (!st || !st.result) { this.scene.start('Title'); return; }
      var res = st.result, vd = verdict(res), big = UI.clamp(W / 7, 40, 72);
      UI.backdrop(this, W, H, vd.glyph);
      var pad = 12, CW = Math.min(W - pad * 2, 900), X0 = (W - CW) / 2;
      UI.text(this, W / 2, 14, vd.word, { serif: true, size: big, origin: [0.5, 0], color: vd.color, stroke: 0x0c0906, strokeW: 6 });
      var y = 14 + big * 1.28;
      UI.fit(UI.text(this, W / 2, y, (st.daily ? '오늘의 대국 · ' : '') + worldKo(st.world) + ' · ' + st.players + '인 · ' + fmodeKo(st.fmode) + ' · 적장 ' + R.LEVELS[st.lv] + '(' + stylesKo(st) + ')', { size: 12, origin: [0.5, 0], color: C.dim }), CW);
      y += 22;
      var tl = UI.text(this, W / 2, y, tale(res), { size: 13, origin: [0.5, 0], color: C.paper, wrap: CW, align: 'center' });
      y += tl.height + 12;
      /* 표 — 자리마다 한 칸: 합계 · 순위 · 전력 · 결속 · 결의 · 불화 · 주공 */
      var sides = res.sides, n = sides.length, tw = Math.min(CW, 120 + n * 110), tx = (W - tw) / 2, lw = tw - n * Math.min(110, (tw - 96) / n), colW = (tw - lw) / n;
      var sm = sides.map(function (x) { return sums(x.ev); });
      sides.forEach(function (x, i) { UI.fit(UI.text(self, tx + lw + colW * (i + 0.5), y, seatKo(x.seat), { size: 12, bold: true, color: seatColor(x.seat), origin: [0.5, 0] }), colW - 4); });
      y += 20;
      var rows = [['total', '합계'], ['rank', '순위'], ['fac', '주 세력'], ['power', '장수 전력'], ['syn', '결속 · 연합'], ['combo', '결의 · 혈연'], ['feud', '불화'], ['bond', '옛 주군 · 배신'], ['lord', '주공의 그릇']], rh = H < 760 ? 22 : 26;
      rows.forEach(function (rw) {
        if (rw[0] === 'fac') {
          self.add.rectangle(tx, y, tw, rh - 3, C.panel, 0.75).setOrigin(0).setRounded(5);
          UI.text(self, tx + 10, y + (rh - 3) / 2, rw[1], { size: 13, origin: [0, 0.5], color: C.dim });
          sides.forEach(function (x, i) {
            var f = mainFac(x.ev); if (!f) return;
            var t = UI.text(self, 0, 0, f, { size: 12, bold: true, color: C.paper }), pw = t.width + 12; t.destroy();
            var cx = tx + lw + colW * (i + 0.5);
            self.add.rectangle(cx - Math.min(pw, colW - 6) / 2, y + 2, Math.min(pw, colW - 6), rh - 7, UI.facColor(db, f), 0.95).setOrigin(0).setRounded((rh - 7) / 2);
            UI.fit(UI.text(self, cx, y + (rh - 3) / 2, f, { size: 12, bold: true, origin: [0.5, 0.5] }), colW - 12);
          });
          y += rh; return;
        }
        var vals = sides.map(function (x, i) { return rw[0] === 'total' ? x.ev.total : rw[0] === 'rank' ? x.rank : sm[i][rw[0]] || 0; });
        var top = rw[0] === 'rank' ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
        self.add.rectangle(tx, y, tw, rh - 3, rw[0] === 'total' ? C.panel2 : C.panel, 0.75).setOrigin(0).setRounded(5);
        UI.text(self, tx + 10, y + (rh - 3) / 2, rw[1], { size: 13, origin: [0, 0.5], color: rw[0] === 'total' ? C.paper : C.dim, bold: rw[0] === 'total' });
        sides.forEach(function (x, i) {
          var v = vals[i], label = rw[0] === 'rank' ? rankKo(x) : String(v);
          UI.text(self, tx + lw + colW * (i + 0.5), y + (rh - 3) / 2, label, { size: rw[0] === 'total' ? 15 : 13, bold: true, origin: [0.5, 0.5], color: v === top && vals.filter(function (z) { return z === top; }).length < n ? seatColor(x.seat) : C.paper });
        });
        y += rh;
      });
      y += 6;
      /* 출전 열한 — 작은 카드 */
      var barY = H - 62, cols = W < 520 ? 6 : 11, gap = 6, cw = Math.min(84, (CW - (cols - 1) * gap) / cols), ch = cw * 1.5, nr = Math.ceil(11 / cols);
      if (y + nr * (ch + gap) > barY - 8) { ch = Math.max(48, (barY - 8 - y) / nr - gap); cw = ch / 1.5; }
      var gx = (W - (cols * cw + (cols - 1) * gap)) / 2;
      res.mine.forEach(function (k, i) {
        var x = gx + (i % cols) * (cw + gap), yy = y + Math.floor(i / cols) * (ch + gap);
        UI.card(self, db.by[k], x, yy, cw, ch, { db: db, world: st.world, mini: true });
        var hz = self.add.rectangle(x, yy, cw, ch, 0x000000, 0.001).setOrigin(0);
        UI.press(hz, function () { openLord(k); });
      });
      var bw = (CW - 12) / 3;
      UI.button(this, null, X0, barY, bw, 50, '채점표', { id: 'score' }, function () { UI.sheet.open('채점표', scoreHTML(res)); });
      UI.button(this, null, X0 + bw + 6, barY, bw, 50, '새 판', { id: 'again', kind: 'primary' }, function () { G.st = null; self.scene.start('Setup'); });
      UI.button(this, null, X0 + (bw + 6) * 2, barY, bw, 50, '처음으로', { id: 'home' }, function () { G.st = null; self.scene.start('Title'); });
    }
  }

  /* 검사 · 콘솔 손잡이 — 지금 장면 · 누를 자리 · 상태 */
  root.D2 = {
    scene: function () { var g = root.Draft2Main && root.Draft2Main.game; if (!g) return null; var s = g.scene.getScenes(true); return s.length ? s[s.length - 1].scene.key : null; },
    hits: function () { var g = root.Draft2Main.game, s = g.scene.getScenes(true); return s.length ? (s[s.length - 1].d2hits || []) : []; },
    myTurn: function () { var g = root.Draft2Main.game, s = g.scene.getScene('Draft'); return !!(s && s.sys.isActive() && s.myTurn); },
    state: function () { return G.st; }, art: function () { return Art.counts(); }, ready: function () { return !!G.db; }, err: function () { return G.err && String(G.err); }
  };
  root.Draft2Scenes = { list: [Boot, Title, Setup, Draft, Lineup, Result], G: G };
})(window);
