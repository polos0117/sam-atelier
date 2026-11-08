#!/usr/bin/env node
/* 지시문 묶음 — 브라우저 없이 생성기와 같은 지시문·기록을 파일로(element-atelier 의 tools/prompt-pack.cjs 를 옮겼다 — 2026-11-02 사용자 「1,2,3 다 해줘」).
   GPT 세션은 브라우저를 못 띄운다 — 생성기 화면(lib/studio.js)이 부르는 조립부(lib/prompt-sam.js 의 build · buildCasual)를
   같은 값으로 불러, 한 카드의 자리(사는 세계마다 세계 그림 한 장 + 일상컷 다섯 장 — IMAGE_RULES 2절)의 지시문과 기록을 쓴다.
   기록(<자리>-ui.json)은 생성기 「기록 내보내기」 와 같은 꼴에 생성기 저장값(storage)을 더한 것 — 그 storage 를 생성기에 넣으면 같은 지시문이 나온다.

   node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> [--plan <세계 하나의 plan.json> …]
     작업 폴더에 settings.json(고칠 수 있는 칸만)을 만든다 — 이미 있으면 덮지 않고 멈춘다.
     --plan 은 일상컷 계획기(tools/casual-plan.cjs <카드> --world <세계> --out)의 plan.json — 세계마다 하나, 여럿 준다. 일상 컷의 선택값은 계획에서만 온다.
   node tools/prompt-pack.cjs build --dir <작업 폴더>
     settings.json 을 읽어 자리마다 <자리>-prompt.txt(영문 지시문) · <자리>-gpt.md(구조형 — GPT 세션 일상컷이 낸다, lib/prompt-gpt.js) · <자리>-ui.json 과 차례표 INDEX.md 를 쓴다.
     틀린 칸(없는 열쇠 · 표에 없는 값 · 사유 없는 직접 입력 · 그 카드가 안 사는 세계 · 계획에 없는 컷)이 하나라도 있으면 아무것도 쓰지 않고 1 로 끝난다.

   자리 — <세계>(세계 그림 — 첨부 없이 한 장씩) · <세계>-casualN(일상컷 — 그 세계 그림 첨부). 화풍은 늘 기본(data/style.json default). 고칠 수 있는 칸:
     worlds.<세계>   notes(scene · outfit · custom — 직접 입력, why) · look(params · faceDesignOn · silhouetteOn · exposure — 표에 없는 외형은 직접 입력이라 why) ·
                     shot(scene — 설계표 장면 변주 열쇠 · time · pose · expr · frame(실루엣 — 세계마다 제 갈래 · 비우면 장수 설계값 worlds.<세계>.sil · free 면 없음) — 표의 값)
     casual.<자리>   scene · outfit · custom(직접 입력 — why) · exposure(moderate · low — 그 컷만 피부 노출 축을 낮춘다, why 필요) · gloss(피부 광택 matte · soft · dewy · glossy — 비우면 화풍 기본) · 나머지는 계획 그대로
     세계 그림의 노출은 worlds.<세계>.look.exposure. 낮추는 것은 필터 거절 뒤 노출 낮추기(사용자 2026-11-01 「필터 문제로 막히면 재시도 후, 노출 수위를 낮춰가며 재시도로」 — IMAGE_RULES 1절) 에만 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const T = ctx.window.AtelierSpec, C2 = ctx.window.AtelierCasualTreeV2, P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json'));
const PLAN = require('./casual-plan.cjs'), STYLE = S['default'];
const GPT = require('../lib/prompt-gpt.js');   /* GPT 세션용 구조형(docs/IMAGE_AUTOMATION.md 4절) */
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const DEFS = (T.PARAM_DEFS || []).filter(d => T.IDENTITY_GROUPS.includes(d.group) && !T.IDENTITY_EXCLUDED.includes(d.key));
const keys = rows => rows.map(r => Array.isArray(r) ? r[0] : r.key).filter(v => v && v !== '__custom__');
const TEXT = T.NOTES.map(n => n.id);
const SHOT = { scene: null, time: T.WORLD_TIMES, pose: T.WORLD_POSES, expr: Object.keys(T.EXPRESSION_DETAIL || {}).map(k => [k]), frame: [].concat(...Object.values(T.SILHOUETTES)) };   /* frame — 실루엣(세계마다 제 갈래 — 다른 세계 열쇠면 표에 없다고 나온다) */
const FIXED = { overall_intensity: 'strong', skin_exposure: 'bold' };

function cardOf(key) { return PLAN.cardOf(key); }
const worldFile = (key, w) => P.fileName(key, w, STYLE);
/* 자리 — 세계마다 세계 그림, 그 뒤에 그 세계의 일상컷(계획에서) */
function slots(card, plans) {
  const out = [];
  for (const w of card.worlds) {
    out.push({ slot: w, kind: 'world', world: w, attach: [] });
    for (const p of plans.filter(p => p.world === w)) for (const c of p.cuts) out.push({ slot: w + '-casual' + c.n, kind: 'casual', world: w, attach: [worldFile(card.key, w)], cut: c });
  }
  return out;
}
const readPlans = list => (list || []).map(f => ({ ...JSON.parse(fs.readFileSync(f, 'utf8')), path: path.resolve(f) }));

function initSettings(card, planPaths) {
  const plans = readPlans(planPaths);
  for (const p of plans) {
    if (p.card !== card.key) throw new Error('계획이 다른 카드 것이다: ' + p.card);
    if (!card.worlds.includes(p.world)) throw new Error(card.key + ' 는 ' + p.world + ' 에 안 산다');
  }
  if (new Set(plans.map(p => p.world)).size !== plans.length) throw new Error('한 세계에 계획 하나');
  return {
    _: 'tools/prompt-pack.cjs 의 설정 — 고칠 수 있는 칸만 있다. 직접 입력(글 칸 · 표에 없는 외형)엔 why 에 까닭을 적는다. 고친 뒤 build',
    card: card.key, style: STYLE, plans: plans.map(p => p.path),
    worlds: Object.fromEntries(card.worlds.map(w => [w, { notes: {}, look: { params: {}, faceDesignOn: true, silhouetteOn: true, exposure: T.EXPOSURE_DEFAULT }, shot: {}, why: '' }])),
    casual: Object.fromEntries(slots(card, plans).filter(s => s.kind === 'casual').map(s => [s.slot, { scene: '', outfit: '', custom: '', gloss: '', why: '' }]))
  };
}

function validate(set, card, plans) {
  const errs = [], list = slots(card, plans);
  const unknown = (obj, allowed, where) => Object.keys(obj || {}).forEach(k => { if (!allowed.includes(k)) errs.push(where + ' 에 없는 칸 ' + k); });
  if (set.card !== card.key) errs.push('settings.card 가 ' + card.key + ' 가 아니다');
  if (set.style !== STYLE) errs.push('화풍은 기본(' + STYLE + ') 하나다 — data/style.json');
  unknown(set.worlds, card.worlds, 'worlds');
  for (const w of card.worlds) {
    const x = (set.worlds || {})[w], where = 'worlds.' + w;
    if (!x) { errs.push(where + ' 가 없다'); continue; }
    unknown(x, ['notes', 'look', 'shot', 'why'], where);
    unknown(x.notes, TEXT, where + '.notes');
    let manual = TEXT.some(k => ((x.notes || {})[k] || '').trim());
    const l = x.look || {};
    unknown(l, ['params', 'faceDesignOn', 'silhouetteOn', 'exposure'], where + '.look');
    if (!T.EXPOSURE_KEYS.includes(l.exposure)) errs.push(where + '.look.exposure 는 ' + T.EXPOSURE_KEYS.map(k => k || "''").join(' · ') + ' 중 하나');
    for (const k of ['faceDesignOn', 'silhouetteOn']) if (typeof l[k] !== 'boolean') errs.push(where + '.look.' + k + ' 는 true · false');
    for (const [k, v] of Object.entries(l.params || {})) {
      const base = k.replace(/_custom$/, ''), d = DEFS.find(x => x.key === base);
      if (!d) { errs.push(where + '.look.params 에 없는 외형 ' + k); continue; }
      if (typeof v !== 'string' || !v) { errs.push(where + '.look.params.' + k + ' 는 글'); continue; }
      if (k !== base) { manual = true; if ((l.params || {})[base] !== '__custom__') errs.push(where + '.look.params.' + k + ' 는 ' + base + ' 가 __custom__ 일 때만'); continue; }
      if (v === '__custom__') { if (!((l.params || {})[k + '_custom'] || '').trim()) errs.push(where + '.look.params.' + k + '_custom 이 비었다'); continue; }
      if (!keys(d.options).includes(v) && !(T.COLOR_KEYS[k] && /^#[0-9a-f]{6}$/i.test(v))) errs.push(where + '.look.params.' + k + ' 의 값 ' + v + ' 가 표에 없다(직접 입력은 __custom__ + ' + k + '_custom)');
    }
    unknown(x.shot, Object.keys(SHOT), where + '.shot');
    const sh = x.shot || {}, norm = P.normShot(D, card.key, w, sh);
    for (const k of Object.keys(SHOT)) if (sh[k] && norm[k] !== sh[k]) errs.push(where + '.shot.' + k + ' 의 값 ' + sh[k] + ' 가 표에 없다');
    if (manual && !(x.why || '').trim()) errs.push(where + ' 에 직접 입력이 있는데 why 가 비었다');
  }
  const cs = list.filter(s => s.kind === 'casual').map(s => s.slot);
  unknown(set.casual, cs, 'casual');
  for (const s of cs) {
    const x = (set.casual || {})[s];
    if (!x) { errs.push('casual.' + s + ' 가 없다'); continue; }
    unknown(x, [...TEXT, 'exposure', 'gloss', 'why'], 'casual.' + s);
    if (x.gloss != null && x.gloss !== '' && !(T.CASUAL.glosses || []).some(g => g.key === x.gloss)) errs.push('casual.' + s + '.gloss 는 ' + T.CASUAL.glosses.map(g => g.key).join(' · ') + ' 중 하나(비우면 화풍 기본)');
    if (x.exposure != null && x.exposure !== '') { if (!['moderate', 'low'].includes(x.exposure)) errs.push('casual.' + s + '.exposure 는 moderate · low(낮추기만)'); else if (!(x.why || '').trim()) errs.push('casual.' + s + '.exposure 를 낮췄는데 why(막힌 까닭)가 비었다'); }
    if (TEXT.some(k => (x[k] || '').trim()) && !(x.why || '').trim()) errs.push('casual.' + s + ' 에 직접 입력이 있는데 why 가 비었다');
  }
  for (const p of plans) {
    if (p.card !== card.key || !card.worlds.includes(p.world)) { errs.push('계획 ' + p.path + ' 이 이 카드 · 세계 것이 아니다'); continue; }
    if (p.style && p.style !== STYLE) errs.push('계획 ' + p.world + ' 의 화풍 ' + p.style + ' 가 기본이 아니다');
    for (const cut of p.cuts) {
      const { n, ...sc } = cut, fixed = C2.repair(C2.make(tree2, tree), { ...sc }, card.g);
      for (const k of C2.ORDER) if ((fixed[k] || '') !== (sc[k] || '')) errs.push(`계획 ${p.world} 컷 ${n} 의 ${k}=${sc[k]} 가 트리에 안 맞는다`);
    }
  }
  return errs;
}

/* 생성기 저장값(lib/studio.js 의 save() 꼴) — 그 카드 · 세계 · 자리 하나 */
function storageOf(card, s, x, scene) {
  const nk = card.key + '|' + (s.kind === 'casual' ? 'casual' : s.world);
  const st = { card: card.key, out: s.kind === 'casual' ? 'casual' : 'world', world: s.world, style: STYLE, notes: {}, looks: {}, shots: {}, walked: {}, casualN: s.cut ? s.cut.n : 1, scenes: {} };
  if (s.kind === 'world') { st.notes[nk] = x.notes || {}; st.looks[nk] = x.look; st.shots[nk] = P.normShot(D, card.key, s.world, x.shot); }
  if (scene) st.scenes[card.key] = scene;
  return st;
}
function recordOf(card, set, s) {
  if (s.kind === 'world') {
    const x = set.worlds[s.world], opts = { style: STYLE, notes: x.notes || {}, look: x.look, shot: P.normShot(D, card.key, s.world, x.shot) };
    return { ...P.record(D, S, card.key, s.world, opts), record: `records/${card.key}/${s.world}.${STYLE}-ui.json`, storage: storageOf(card, s, x) };
  }
  const { n, ...cut } = s.cut, x = set.casual[s.slot];
  const scene = { ...cut, axes: { ...FIXED, ...(cut.axes || {}) }, aspect: '2:3', unlocked: cut.unlocked || [] };
  for (const k of TEXT) if ((x[k] || '').trim()) scene[k] = x[k]; else delete scene[k];
  if (x.exposure) scene.axes.skin_exposure = x.exposure;
  if (x.gloss) scene.gloss = x.gloss;   /* 피부 광택 단계(2026-11-06) — 비우면 화풍 기본 */
  return { ...P.casualRecord(D, S, card.key, scene, { world: s.world, style: STYLE, tree, tree2 }, n), record: PLAN.recordRel(card.key, s.world, n), storage: storageOf(card, s, x, scene) };
}

function build(dir) {
  const set = JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'));
  const card = cardOf(set.card), plans = readPlans(set.plans);
  const errs = validate(set, card, plans);
  if (errs.length) { for (const e of errs) console.error('  X ' + e); console.error('settings.json 에 ' + errs.length + ' 가지 — 아무것도 안 썼다'); return 1; }
  const out = slots(card, plans).map(s => ({ s, rec: recordOf(card, set, s) }));
  for (const { s, rec } of out) if (!rec.prompt) { console.error('  X ' + s.slot + ' 지시문이 비었다'); return 1; }
  /* GPT 세션용 구조형 — 같은 지시문을 칸으로 옮긴 것. 일상컷의 몸 볼륨은 그 세계 그림 SILHOUETTE 의 체형 칸에서 */
  const bodyOf = w => { const m = (P.build(D, S, card.key, w, { style: STYLE }) || '').match(/^SILHOUETTE:\s*([^;\n]+)/m); return m ? m[1] : P.bodyText(D, card.key, w); };
  /* 기준 판(format kv, 2026-11-05)의 세계 그림은 이미 칸으로 나뉜 영문 네 칸 — 구조형으로 옮기지 않고 그대로 낸다 */
  /* 화풍 칸이 따로 붙는 판(worldTail — kr_mmorpg v6: 피부색 · 조명 · 카메라 칸)도 그대로 — 옛 구조형 화풍 칸(림 조명)이 그 칸과 부딪친다.
     일상컷 묶음(casualKit — 화풍 글 · 설계 얼굴 · 피부색 · 하이키)이 있는 판의 일상컷도 그대로 — 구조형은 화풍 · 설계 얼굴을 버린다(2026-11-08 kr_mmorpg 기본) */
  const SV = (S.styles[STYLE].versions || []).find(v => v.v === S.styles[STYLE].current) || {}, KV = SV.format === 'kv' || !!SV.worldTail, KIT = !!SV.casualKit;
  for (const o of out) {
    const same = { text: o.rec.prompt, unknown: [] };
    const g = o.s.kind === 'world' ? (KV ? same : GPT.world(o.rec.prompt)) : (KIT ? same : GPT.casual(o.rec.prompt, { bodyText: bodyOf(o.s.world) }));
    if (g.unknown.length) { console.error('  X ' + o.s.slot + ' 구조형에 못 옮긴 줄: ' + g.unknown.map(l => l.slice(0, 50)).join(' | ')); return 1; }
    o.gpt = g.text;
  }
  for (const { s, rec, gpt } of out) {
    fs.writeFileSync(path.join(dir, s.slot + '-gpt.md'), gpt);
    fs.writeFileSync(path.join(dir, s.slot + '-prompt.txt'), rec.prompt);
    fs.writeFileSync(path.join(dir, s.slot + '-ui.json'), JSON.stringify(rec, null, 1) + '\n');
  }
  const rows = out.map(({ s, rec, gpt }, i) => `| ${i + 1} | ${s.slot} | ${s.kind === 'world' ? '세계 그림(첨부 없이)' : '일상(버전2)'} | ${s.attach.join(' + ') || '없음'} | ${rec.file} | ${rec.record} | ${sha(rec.prompt).slice(0, 12)} | ${sha(gpt).slice(0, 12)} |`);
  fs.writeFileSync(path.join(dir, 'INDEX.md'), `# ${card.key}(${card.c.ko}) — 지시문 묶음\n\n만든 때 ${new Date().toISOString()} · 화풍 ${STYLE} · 사는 세계 ${card.worlds.join(' · ')} · 계획 ${plans.map(p => p.world).join(' · ') || '없음(일상 자리 없음)'}\n\n` +
    '차례대로 그린다. 세계 그림은 기준 그림 없이 한 장씩, 일상컷은 그 세계 그림(이 세션의 원본, 이미 등록된 것이면 그림 저장소의 webp)을 붙인다. 고치지 않고 그대로 낸다 — ' +
    'GPT 세션은 세계 그림에 `<세계>-prompt.txt`, 일상컷에 `<세계>-casualN-gpt.md`(크기 1024×1536 지정). API · 생성기는 모두 `<자리>-prompt.txt`(docs/IMAGE_AUTOMATION.md 3절).\n\n' +
    '| 차례 | 자리 | 갈래 | 첨부 | 올릴 파일 | 기록 자리 | 지시문 sha256 | 구조형 sha256 |\n|---|---|---|---|---|---|---|---|\n' + rows.join('\n') + '\n');
  console.log(`${card.key}(${card.c.ko}) — ${out.length} 자리 → ${dir}`);
  return 0;
}

function main(argv) {
  const cmd = argv[0], o = { plan: [] };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--plan') o.plan.push(argv[++i]); else if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i]; else o.key = argv[i];
  }
  if (!o.dir || !['init', 'build'].includes(cmd)) { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 18).join('\n')); return 2; }
  if (cmd === 'build') return build(o.dir);
  const card = cardOf(o.key), f = path.join(o.dir, 'settings.json');
  if (fs.existsSync(f)) { console.error(f + ' 가 이미 있다 — 덮지 않는다'); return 1; }
  fs.mkdirSync(o.dir, { recursive: true });
  fs.writeFileSync(f, JSON.stringify(initSettings(card, o.plan), null, 1) + '\n');
  console.log('→ ' + f);
  return 0;
}
module.exports = { slots, initSettings, validate, recordOf, build, cardOf };
if (require.main === module) { try { process.exit(main(process.argv.slice(2))); } catch (e) { console.error(e.message); process.exit(1); } }
