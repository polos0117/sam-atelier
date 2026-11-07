/* GPT 세션용 구조형(lib/prompt-gpt.js, 2026-11-03). node tests/prompt-gpt.cjs
   - 장수 여럿 × 세계 셋 × 일상 다섯 칸의 생성기 지시문이 한 줄도 남김없이 칸으로 옮겨진다(못 옮긴 줄이 있으면 실패)
   - 세계 그림: API 화풍 줄(STYLE)은 없고 고정 화풍 칸 · 세력 팔레트 · 세계 분위기 · 손에 든 것 · 표정 세기 줄
   - 일상컷: 화풍 · 얼굴은 첨부 그림, 어느 각도에서도 작은 턱, 몸 볼륨은 그 장수 체형 글에서, 「몸 일부 키우지 않기」 는 없다
   - tools/prompt-pack.cjs build 가 자리마다 <자리>-gpt.md 를 쓴다 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const R = path.join(__dirname, '..'), G = require('../lib/prompt-gpt.js'), C = require('../tools/casual-plan.cjs');
const P = (() => { const vm = require('node:vm'), ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
  return ctx.window.AtelierPrompt; })();
const D = JSON.parse(fs.readFileSync(path.join(R, 'data/sam-design.json'), 'utf8')), S = (x => (x.styles.kr_mmorpg.current = 'v4', x))(JSON.parse(fs.readFileSync(path.join(R, 'data/style.json'), 'utf8'))), STYLE = 'kr_mmorpg';   /* 줄 단위 꼴 시험 — kr_mmorpg 는 v4 로 고정(v5 일상컷 묶음 · v6 세계 그림 끝 칸은 구조형으로 옮기지 않는 판, 2026-11-08) */   /* 구조형 옮기기는 영어 v1 지시문(kr_mmorpg) 몫 — 기본 판 kv_kmmo_lock(2026-11-05)은 이미 네 칸이라 옮기지 않는다(아래 묶음 확인) */
const keys = P.cards(D), pick = keys.filter((k, i) => i % Math.max(1, Math.floor(keys.length / 14)) === 0).slice(0, 14);
/* 실루엣 — 고르면 세계 글 뒤 한 줄, 「자유」(free)면 없음(안 고르면 장수 설계값 — 2026-11-06), 메카 아닌 세계엔 안 붙는다, 구조형은 옷 칸으로 옮긴다(2026-11-05) */
{ const k0 = keys[0];
  const none = P.build(D, S, k0, 'mecha', { style: STYLE, shot: { frame: 'free' } }), on = P.build(D, S, k0, 'mecha', { style: STYLE, shot: { frame: 'segmented_parts' } });
  assert(!/^MECHA SILHOUETTE:/m.test(none), '자유면 실루엣 줄이 없다');
  assert(/^MECHA SILHOUETTE: separate armor pieces/m.test(on), '고르면 실루엣 줄');
  assert.equal(on.split('\n').filter(l => !l.startsWith('MECHA SILHOUETTE:')).join('\n'), none, '실루엣 줄 말고는 같다');
  assert(!/MECHA SILHOUETTE/.test(P.build(D, S, k0, 'samguk', { style: STYLE, shot: { frame: 'segmented_parts' } })), '메카 아닌 세계엔 없다');
  assert.equal(P.normShot(D, k0, 'fantasy', { frame: 'full_armor' }).frame, '');
  /* 무협 · 판타지 실루엣 — OUTFIT SILHOUETTE 한 줄, 구조형 옷 칸으로 */
  const sg = P.build(D, S, k0, 'samguk', { style: STYLE, shot: { frame: 'heavy_general' } }), sgNone = P.build(D, S, k0, 'samguk', { style: STYLE, shot: { frame: 'free' } });
  assert(/^OUTFIT SILHOUETTE: layered laced lamellar/m.test(sg)); assert.equal(sg.split('\n').filter(l => !l.startsWith('OUTFIT SILHOUETTE:')).join('\n'), sgNone);
  assert(/^OUTFIT SILHOUETTE: a fitted breastplate/m.test(P.build(D, S, k0, 'fantasy', { style: STYLE, shot: { frame: 'gown_armor' } })));
  assert.equal(P.normShot(D, k0, 'samguk', { frame: 'gown_armor' }).frame, '', '다른 세계 갈래는 버린다');
  const gs = G.world(sg); assert.deepEqual(gs.unknown, []); assert(gs.text.includes('Silhouette: layered laced lamellar'));
  const g = G.world(on); assert.deepEqual(g.unknown, []); assert(g.text.includes('Silhouette: separate armor pieces'), '구조형 옷 칸에 실루엣'); }
let nw = 0, nc = 0;
for (const key of pick) {
  const card = C.cardOf(key);
  for (const w of card.worlds) {
    const wp = P.build(D, S, key, w, { style: STYLE }), g = G.world(wp);
    assert.deepEqual(g.unknown, [], key + ' ' + w + ' 세계 그림 — 못 옮긴 줄');
    assert(!/Extremely intricate|Luxurious, high-detail/.test(g.text), key + ' — API 화풍 줄이 남았다');
    for (const s of ['OUTPUT SPEC: one vertical 2:3 image (1024×1536)', '00 NEGATIVE', 'muted, soft, low saturation', '2. CHARACTER LOOK', '4. COORDINATION', '5. SCENE', 'Keep it subtle and natural'])
      assert(g.text.includes(s), key + ' ' + w + ' 세계 그림에 ' + s);
    assert(g.text.includes((wp.match(/^FACTION — ([^.]+)/m) || [])[1]), key + ' — 세력 팔레트');
    if (/^SIGNATURE ITEM:/m.test(wp)) assert(/Held item \(most important\)/.test(g.text) && /replaced by the held item above/.test(g.text), key + ' — 손에 든 것');
    nw++;
    const body = (wp.match(/^SILHOUETTE:\s*([^;\n]+)/m) || [])[1];
    card.world = w;
    for (const c of C.plan(card, [1, 2, 3, 4, 5], [], { seed: 13 }).cuts) {
      const cpmt = C.record(card, w, c).prompt, gc = G.casual(cpmt, { bodyText: body });
      if (/^Create ONE finished illustration\. Use case: identity-preserve/.test(cpmt)) { assert.equal(gc.text.trim(), cpmt.trim(), key + ' 자연판은 그대로'); assert.deepEqual(gc.unknown, []); nc++; continue; }
      assert.deepEqual(gc.unknown, [], key + ' ' + w + ' 일상 ' + c.n + ' — 못 옮긴 줄');
      assert(!/STYLE:|ART STYLE|^FACE:|rendering exactly/m.test(gc.text) && gc.text.includes("and the image's finish (rendering)") && gc.text.includes('AVOID: '), key + ' — 일상엔 화풍 칸 없이 첨부 그림의 마감');
      assert(gc.text.includes("keep the attached image's face shape, jaw length and face length-to-width ratio"), key + ' — 어느 각도에서도 참고 그림의 얼굴형 · 턱 길이');
      assert(gc.text.includes(body.replace(/\s+build$/, '')) && gc.text.includes("take her body volume from this description"), key + ' — 몸 볼륨은 체형 글에서');
      assert(!/No body-part enlargement|enlarged body parts/.test(gc.text), key + ' — 몸 일부 키우지 않기는 없다');
      assert(gc.text.includes('Use the attached image (her ') && /\* Outfit: /.test(gc.text) && /\* Composition: /.test(gc.text), key + ' — 일상 칸');
      nc++;
    }
  }
}
/* 묶음 도구가 자리마다 구조형을 쓴다 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-gpt-'));
try {
  cp.execFileSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), '관우', '--world', 'samguk', '--slots', '1,2', '--seed', '3', '--usage', 'none', '--records', path.join(tmp, 'x'), '--out', path.join(tmp, 'plan')], { stdio: 'pipe' });
  cp.execFileSync(process.execPath, [path.join(R, 'tools/prompt-pack.cjs'), 'init', '관우', '--dir', path.join(tmp, 'pack'), '--plan', path.join(tmp, 'plan', 'plan.json')], { stdio: 'pipe' });
  cp.execFileSync(process.execPath, [path.join(R, 'tools/prompt-pack.cjs'), 'build', '--dir', path.join(tmp, 'pack')], { stdio: 'pipe' });
  for (const f of ['samguk-gpt.md', 'samguk-casual1-gpt.md', 'samguk-casual2-gpt.md', 'fantasy-gpt.md']) assert(fs.existsSync(path.join(tmp, 'pack', f)), f);
  assert(fs.readFileSync(path.join(tmp, 'pack', 'INDEX.md'), 'utf8').includes('구조형 sha256'));
  if (S.styles[S['default']].versions.find(v => v.v === S.styles[S['default']].current).format === 'kv') assert.equal(fs.readFileSync(path.join(tmp, 'pack', 'samguk-gpt.md'), 'utf8'), fs.readFileSync(path.join(tmp, 'pack', 'samguk-prompt.txt'), 'utf8'), '기준 판 세계 그림은 영문 네 칸 그대로');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
console.log(`PASS GPT 구조형: 세계 그림 ${nw} · 일상컷 ${nc} — 못 옮긴 줄 없음 · 고정 화풍 칸 · 세력 팔레트 · 손에 든 것 · 일상은 화풍 칸 없이 첨부 그림 · 작은 턱 · 체형 볼륨 · 묶음 도구가 <자리>-gpt.md`);
