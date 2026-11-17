#!/usr/bin/env node
/* 일상컷 색인(2026-11-17) — 그림 저장소들의 records 에서 일상컷 기록과 그 카드 · 세계의 계획 파일을 읽어 data/casual-index.json 을 쓴다. 그림은 읽지 않는다.
   사용자 2026-11-17 「저거를 목록을 두고 확인할 수 있는 방법은 없을까? 위치는 허브가 좋을거 같은데, 허브에서 간단하게만. 필수컷 만들 때 뜬 갈래랑 의상이랑,
   게임코스튬 때 쓴 게임, 케릭터, 의상갈래 정도만 알 수 있으면 좋겠는데」 → 「응 그렇게 진행해줘. 우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」.
   허브(polos0117.github.io casual.html)가 세 공방(sam · element · pkm)의 같은 꼴을 읽는다 — 칸 이름 · 차례를 바꾸지 않는다.

   한 컷 한 줄: records/<장수>/<세계>-casualN.<화풍>-ui.json(이 꼴만 — 막힌 · 다시 짠 · 원본 계획 같은 곁가지 파일은 읽지 않고, 같은 컷이 두 저장소에 있으면 한 줄).
   필수 표시 — 묶음(카드 · 세계 · 화풍, --fresh 계획이 있으면 그 첫 번호부터 새 묶음)마다 tools/casual-check.py 와 같은 판정으로 서로 다른 컷에:
     노출 갈래(란제리풍 · 수영복 · 역할극) 한 장 · 세계 안 한 장 · 셋째 — 게임 코스프레(2026-11-15 부터), 그 앞 묶음은 상황 노출(2026-11-09 ~ 11-15).
     계획 파일(card · world · style · cuts[].n · required 「swimwear · nation · cosplay:… · situ:… · free:…」)이 있으면 그 표시를 먼저 본다 —
     노출 갈래는 계획이 적은 갈래의 컷, 셋째는 계획에 cosplay: 가 있으면 코스프레(상황 컷은 필수 아님), 없고 situ: 가 있으면 상황 노출.
     캐릭터만의 컷(90번)은 required "own". 갈래 자유 · 옷 자유 컷은 required 없이 free 칸에.
   한글: 우리 표의 값(필수 갈래 · 옷 계열 · 옷 · shade · 게임 · 재단 · 세계 · 상황)은 표의 ko, 캐릭터는 data/game-cosplay.json 의 characters[].ko → 주인공 하나 게임 character_ko → null.
   GPT 가 지은 것(자유 설계 Outfit 줄 · 옛 pick 으로 GPT 가 고른 캐릭터 이름)은 기록의 영어 그대로.

     node tools/casual-index.cjs                         # 옆에 받아 둔 그림 저장소(tools/img-repos.cjs 차례) → data/casual-index.json
     node tools/casual-index.cjs --repos a,b             # 그림 저장소 자리(차례는 img-repos.cjs REPOS 와 같게 — 등록 워크플로는 img-repo,img-repo-2)
     node tools/casual-index.cjs --check                 # 쓰지 않고 수만
   저장소가 하나라도 없으면 쓰지 않고 멈춘다(반쪽 색인으로 덮지 않게). 줄이 같으면 파일을 그대로 둔다(built 만 바뀌는 커밋을 막는다). */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), REPOS = require('./img-repos.cjs');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const T = ctx.window.AtelierSpec, CT = ctx.window.AtelierCasualTree, C2 = ctx.window.AtelierCasualTreeV2, P = ctx.window.AtelierPrompt;
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json')), T2 = C2.make(tree2, tree);
const GC0 = JSON.parse(read('data/game-cosplay.json'));
const OWN_N = (fs.existsSync(path.join(ROOT, 'data', 'casual-own.json')) ? JSON.parse(read('data/casual-own.json')).number : 0) || 90;
const ATELIER = 'sam', OUT = 'data/casual-index.json';
const EXPOSE = (tree.required || {}).outfits || ['lingerie', 'swimwear', 'roleplay'];
const COS_FAM = (tree.cosplay || {}).outfit || 'game_cosplay';
const REC_RX = /^([a-z]+)-casual(\d+)\.([a-z0-9_]+)-ui\.json$/;

const by = (list, k) => (list || []).find(x => x && x.key === k);
const normName = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');   /* 계획기 normName 과 같다 */
const day = s => (/^\d{4}-\d{2}-\d{2}/.exec(String(s || '')) || [''])[0];

/* ── 한글 ── */
const worldKo = w => (by(T.WORLDS, w) || {}).ko || '';
const famKo = k => { const f = k && (C2.family(T2, k) || CT.family(tree, k)); return (f && f.ko) || null; };
const itemKo = (fam, k) => { const it = fam && k && (C2.item(T2, fam, k) || CT.item(tree, fam, k)); return (it && it.ko) || null; };
function shadeKo(color, k) {
  if (!k) return null;
  const s = by(color ? P.shadesOf(color) : [], k) || (T.CASUAL.colors || []).flatMap(c => c.shades || []).find(x => x.key === k);
  return (s && s.ko) || null;
}
const situKo = k => (by(T.CASUAL.situations, k) || {}).ko || k;
/* 캐릭터 한글 — (1) 등장인물 많은 게임의 characters[].ko (2) 주인공 하나 게임의 character_ko (3) null. 이름은 대소문자 · 빈칸 무시(계획기 normName).
   주인공 하나 게임은 기록 이름이 달라도(「Geralt」 · 「Geralt of Rivia」) 그 주인공(계획기 cosplayTally 와 같게) */
function characterKo(gc, game, name) {
  const gm = ((gc || {}).games || []).find(g => g.key === game); if (!gm) return null;
  const ch = (gm.characters || []).find(c => normName(c.name) === normName(name));
  if (ch && ch.ko) return ch.ko;
  if (!gm.many && gm.character_ko) return gm.character_ko;
  return null;
}
const REQ_KO = { nation: () => (CT.era(tree, 'nation') || {}).ko || '세계 안', cosplay: () => '게임 코스프레', own: () => '캐릭터만의 컷' };
function requiredKo(req, scene) {
  if (!req) return null;
  if (EXPOSE.includes(req)) return `노출 갈래(${famKo(req) || req})`;
  if (req === 'situ') return `상황 노출(${situKo(scene.situ)})`;
  return REQ_KO[req] ? REQ_KO[req]() : req;
}

/* ── 한 컷의 갈래(tools/casual-check.py kind 와 같다) — expose · inworld · cosplay · situ 의 부분집합 ── */
function kinds(s) {
  s = s || {};
  const out = new Set();
  if (s.ofree) return out;   /* 자유 설계 컷 — 장면 값은 그림자 */
  if (s.ofam === COS_FAM) return new Set(['cosplay']);
  if (EXPOSE.includes(s.ofam)) out.add('expose');
  if (CT.isRequired(tree, s)) out.add('inworld');
  if (s.situ && !out.size) out.add('situ');
  return out;
}

/* ── 자유 설계 Outfit 줄 — 기록 속 GPT 가 채운 글(free_design 덩어리 → free_prompt → 지시문). 「…」 로 시작하는 빈 틀은 건너뛴다 ── */
const outfitIn = t => { const m = [...String(t || '').matchAll(/(?:^|\n)[ \t]*Outfit:[ \t]*([^\n]*)/g)].map(x => x[1].trim()).filter(x => x && !/^…/.test(x)); return m[0] || null; };
function freeOutfit(r) {
  const g = r.generation || {}, fd = g.free_design;
  if (fd && typeof fd === 'object' && !Array.isArray(fd)) { const v = fd.Outfit || fd.outfit; if (v && !/^…/.test(String(v).trim())) return String(v).trim(); }
  if (Array.isArray(fd) && fd.length >= 5 && fd[4] && !/^…/.test(String(fd[4]).trim())) return String(fd[4]).trim();   /* [Place, Activity, Pose, Framing, Outfit] */
  return outfitIn(typeof fd === 'string' ? fd : '') || outfitIn(g.free_prompt) || outfitIn(g.prompt) || outfitIn(r.prompt);
}
function freeOf(r) {
  const s = r.scene || {};
  if (!s.ofree) return null;
  const kind = s.ofreeFamily ? 'gfree' : 'ofree';
  return { kind, kindKo: kind === 'gfree' ? '갈래 자유' : '옷 자유', outfit: freeOutfit(r) };
}

/* ── 게임 코스프레 — generation.cosplay(그린 것) > scene.cosplay. by: 장면에 캐릭터가 차 있으면 planner, 비고 generation 에만 있으면 gpt(옛 1회차 pick) ── */
function cosplayOf(r, gc = GC0) {
  const s = r.scene || {}, sc = s.cosplay, gn = (r.generation || {}).cosplay;
  if (s.ofam !== COS_FAM && !sc && !gn) return null;
  const filled = x => x && String(x.character || '').trim();
  const game = (gn && gn.game) || (sc && sc.game) || '';
  const character = filled(gn) ? String(gn.character).trim() : filled(sc) ? String(sc.character).trim() : '';
  const cut = (gn && gn.cut) || (sc && sc.cut) || String(s.item || '').replace(/^gc_/, '');
  const gm = (gc.games || []).find(g => g.key === game) || {};
  return { game, gameKo: gm.ko || null, character: character || null, characterKo: character ? characterKo(gc, game, character) : null,
    cut: cut || null, cutKo: (by(gc.cuts, cut) || {}).ko || null, by: filled(sc) ? 'planner' : 'gpt', round: Number((sc && sc.round) || 1) };
}

/* ── 계획 파일 — records/<장수>/ 의 -ui.json 아닌 JSON 가운데 card · world · cuts[] 가 있는 것. 곁가지(원본 · 씨앗 · 다시 짠 · 고친 …)는 뒤로 ── */
const SIDE_RX = /(original|seed|before|invalid|corrected|reframe|replan|resume|completion)/;
function planStyle(doc, file) {
  if (doc.style) return doc.style;
  const m = /\.([a-z0-9_]+)(?:-casual-plan)?\.json$/.exec(path.basename(file)) || /-casual-plan\.([a-z0-9_]+)\.json$/.exec(path.basename(file));
  return m && m[1] !== 'json' ? m[1] : '';
}
function parseRequired(str) {
  const tags = String(str || '').split('·').map(x => x.trim()).filter(Boolean);
  const cos = tags.find(t => t.startsWith('cosplay:'));
  return { expose: tags.find(t => EXPOSE.includes(t)) || '', nation: tags.includes('nation'), cosplay: cos ? cos.slice(8).split('/')[0] : '', situ: tags.some(t => t.startsWith('situ:')) };
}

/* ── 묶음 안 필수 나누기 — casual-check.py fill 과 같이 서로 다른 컷에. cuts: [{ n, scene, kinds }] (번호 차례), plan: parseRequired 결과 또는 null ── */
function assign(cuts, plan) {
  const out = new Map(), taken = new Set(), has = (c, k) => c.kinds.has(k) && !taken.has(c.n);
  const exList = cuts.filter(c => c.kinds.has('expose')), inList = cuts.filter(c => c.kinds.has('inworld'));
  /* 노출 · 세계 안 — 둘 다 채우는 짝을 먼저(계획이 적은 노출 갈래의 컷 먼저) */
  const exPref = plan && plan.expose ? [...exList.filter(c => c.scene.ofam === plan.expose), ...exList.filter(c => c.scene.ofam !== plan.expose)] : exList;
  let ex = null, inw = null;
  for (const a of exPref) { const b = inList.find(c => c.n !== a.n && !c.kinds.has('expose')) || inList.find(c => c.n !== a.n); if (b) { ex = a; inw = b; break; } }
  if (!ex) { ex = exPref[0] || null; inw = inList.find(c => !ex || c.n !== ex.n) || null; }
  if (ex) { out.set(ex.n, ex.scene.ofam); taken.add(ex.n); }
  if (inw) { out.set(inw.n, 'nation'); taken.add(inw.n); }
  /* 셋째 — 코스프레(계획이 적은 게임의 컷 먼저). 계획에 cosplay: 가 있으면 상황 컷은 필수가 아니다. 없으면(옛 묶음) 상황 노출 */
  const cos = cuts.filter(c => has(c, 'cosplay')), want = plan && plan.cosplay;
  const third = (want && cos.find(c => (c.scene.cosplay || {}).game === want)) || cos[0];
  if (third) out.set(third.n, 'cosplay');
  else if (!(plan && plan.cosplay) && (!plan || plan.situ)) { const st = cuts.find(c => has(c, 'situ')); if (st) out.set(st.n, 'situ'); }
  return out;
}

/* ── 저장소 읽기 ── */
function repoList(arg) {
  const dirs = arg ? String(arg).split(',').filter(Boolean) : REPOS.REPOS.map(REPOS.sib);
  return dirs.map((d, i) => ({ name: REPOS.REPOS[i] || path.basename(path.resolve(d)), dir: path.resolve(d) }));
}
function loadJson(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } }
function scan(repos) {
  const recs = new Map(), plans = [];
  for (const repo of repos) {
    const top = path.join(repo.dir, 'records'); if (!fs.existsSync(top)) continue;
    for (const card of fs.readdirSync(top).sort()) {
      const d = path.join(top, card); if (!fs.statSync(d).isDirectory()) continue;
      for (const f of fs.readdirSync(d).sort()) {
        if (!/\.json$/.test(f)) continue;
        const m = REC_RX.exec(f);
        if (m) {
          const r = loadJson(path.join(d, f)); if (!r) continue;
          const key = [card, m[1], m[3], Number(m[2])].join('|'), at = `${repo.name}/records/${card}/${f}`;
          const date = day(r.imported) || day((r.generation || {}).date) || day(r.date);
          const prev = recs.get(key);   /* 같은 컷이 두 저장소에 — 한 줄(늦은 날짜, 같으면 뒤 저장소) */
          if (!prev || date >= prev.date) recs.set(key, { card, world: m[1], style: m[3], n: Number(m[2]), r, date, at });
          continue;
        }
        if (/-ui\.json$/.test(f)) continue;
        const doc = loadJson(path.join(d, f));
        if (!doc || typeof doc !== 'object' || !doc.world || !Array.isArray(doc.cuts)) continue;
        if (doc.card && doc.card !== card) continue;
        plans.push({ card, world: doc.world, style: planStyle(doc, f), side: SIDE_RX.test(f), fresh: !!doc.fresh, ns: doc.cuts.map(c => Number(c.n)).filter(Boolean), slots: (doc.slots || []).map(Number), required: doc.required, file: f });
      }
    }
  }
  return { recs: [...recs.values()], plans };
}

/* ── 색인 짓기 ── */
function build(repos, { gc = GC0, built = new Date().toISOString() } = {}) {
  const { recs, plans } = scan(repos);
  const groups = new Map();
  for (const x of recs) { const k = [x.card, x.world, x.style].join('|'); (groups.get(k) || groups.set(k, []).get(k)).push(x); }
  const rows = [];
  for (const [k, list] of groups) {
    const [card, world, style] = k.split('|');
    const mine = plans.filter(p => p.card === card && p.world === world && p.style === style);
    /* 묶음 나누기 — --fresh 계획의 첫 번호부터 새 묶음 */
    const starts = [...new Set([1, ...mine.filter(p => p.fresh && p.slots.length).map(p => Math.min(...p.slots))])].sort((a, b) => a - b);
    const bundleOf = n => starts.filter(s => s <= n).pop();
    const bundles = new Map();
    for (const x of list.filter(x => x.n !== OWN_N).sort((a, b) => a.n - b.n)) { const b = bundleOf(x.n); (bundles.get(b) || bundles.set(b, []).get(b)).push(x); }
    const req = new Map();
    for (const [b, xs] of bundles) {
      const end = starts.find(s => s > b) || Infinity, inB = p => p.ns.some(n => n >= b && n < end);
      /* 그 묶음의 계획 — 곁가지가 아닌 것 → 묶음 컷을 더 많이 덮는 것 → 이름 차례 */
      const cover = p => p.ns.filter(n => n >= b && n < end).length;
      const best = mine.filter(inB).sort((p, q) => (p.side - q.side) || (cover(q) - cover(p)) || p.file.localeCompare(q.file))[0];
      const plan = best && typeof best.required === 'string' ? parseRequired(best.required) : null;
      for (const [n, v] of assign(xs.map(x => ({ n: x.n, scene: x.r.scene || {}, kinds: kinds(x.r.scene) })), plan)) req.set(n, v);
    }
    for (const x of list) {
      const s = x.r.scene || {}, own = x.n === OWN_N || !!s.own;
      const required = own ? 'own' : req.get(x.n) || null;
      const free = own ? null : freeOf(x.r), cos = s.ofam === COS_FAM ? cosplayOf(x.r, gc) : null;
      const family = own ? null : free ? (s.ofreeFamily || null) : (s.ofam || null);
      const item = own || free ? null : (s.item || null);
      const shade = own || free || cos ? null : (s.shade || null);
      rows.push({ card, name: card, world, worldKo: worldKo(world), n: x.n, date: x.date, style, path: x.at,
        required, requiredKo: requiredKo(required, s),
        family, familyKo: famKo(family), item, itemKo: itemKo(family, item), shade, shadeKo: shadeKo(s.color, shade),
        cosplay: cos, free });
    }
  }
  rows.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0) || a.card.localeCompare(b.card) || a.world.localeCompare(b.world) || a.n - b.n);
  return { version: 1, atelier: ATELIER, built, source: repos.filter(r => fs.existsSync(path.join(r.dir, 'records'))).map(r => r.name), rows };
}
function stats(doc) {
  const rows = doc.rows, cnt = f => rows.filter(f).length;
  return { rows: rows.length, required: cnt(r => r.required && r.required !== 'own'), own: cnt(r => r.required === 'own'),
    byReq: rows.reduce((m, r) => (r.required ? (m[r.required] = (m[r.required] || 0) + 1, m) : m), {}),
    cosplay: cnt(r => r.cosplay), planner: cnt(r => r.cosplay && r.cosplay.by === 'planner'), gpt: cnt(r => r.cosplay && r.cosplay.by === 'gpt'),
    charKo: cnt(r => r.cosplay && r.cosplay.characterKo), free: cnt(r => r.free), outfit: cnt(r => r.free && r.free.outfit) };
}
/* 줄이 같으면 그대로 둔다 — built 만 바뀌어 매시 커밋되지 않게 */
function write(doc, file = path.join(ROOT, OUT)) {
  const old = loadJson(file);
  if (old && JSON.stringify(old.rows) === JSON.stringify(doc.rows) && JSON.stringify(old.source) === JSON.stringify(doc.source)) return false;
  fs.writeFileSync(file, JSON.stringify(doc) + '\n');
  return true;
}
function main(argv) {
  const opt = {}; for (let i = 0; i < argv.length; i++) { const k = argv[i].replace(/^--/, ''); opt[k] = k === 'check' ? true : argv[++i]; }
  const repos = repoList(opt.repos), miss = repos.filter(r => !fs.existsSync(path.join(r.dir, 'records')));
  if (miss.length) { console.error('그림 저장소가 없다: ' + miss.map(r => r.name + '(' + r.dir + ')').join(' · ') + ' — 받은 뒤 다시(반쪽 색인으로 덮지 않는다)'); return 2; }
  const doc = build(repos), st = stats(doc);
  console.log(`일상컷 색인 — ${st.rows} 줄 · 필수 ${st.required}(${Object.entries(st.byReq).map(([k, v]) => k + ' ' + v).join(' · ')}) · 코스프레 ${st.cosplay}(계획기 ${st.planner} · gpt ${st.gpt} · 캐릭터 한글 ${st.charKo}) · 자유 설계 ${st.free}(Outfit 줄 ${st.outfit})`);
  if (opt.check) return 0;
  const file = opt.out ? path.resolve(opt.out) : path.join(ROOT, OUT);
  console.log(write(doc, file) ? '→ ' + path.relative(process.cwd(), file) : '달라진 줄 없음 — 그대로');
  return 0;
}
module.exports = { build, write, stats, kinds, assign, parseRequired, freeOutfit, freeOf, cosplayOf, characterKo, requiredKo, planStyle, scan, repoList, OWN_N };
if (require.main === module) process.exit(main(process.argv.slice(2)));
