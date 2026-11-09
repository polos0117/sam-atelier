#!/usr/bin/env node
/* GPT 세션에 맡길 설계 주문 — 그림 저장소 free/<장수>/ 에 올려 두면 ChatGPT 세션이 git 에서 읽고 지시문만 써서 같은 자리에 올린다.
   그림은 API 생성 탭(api.html)이 그 글로 그린다(사용자 2026-11-09 「gpt 세션에서도 내 git 읽을 수 있으니까 git에 올려놓고 추론 해달라고 부탁해도 되겠네. 이미지 생성은 api 로 하고」 → 「응 만들어줘」).

   node tools/free-brief.cjs <장수> [--style api25] [--plan <계획 plan.json> …] [--img ../sam-atelier-img] [--force]
     세계 그림 — 사는 세계마다 <세계>.<화풍>-brief.txt(GPT 자유 설계 주문, lib/prompt-sam.js buildWorldFree). GPT 가 두 장(서로 다르게) — <세계>.<화풍>-gpt1.txt · -gpt2.txt
     일상컷 옷 자유 — --plan 의 「옷 자유」 컷(ofree)마다 <세계>-casualN.<화풍>-brief.txt(그 컷 지시문 + 「Outfit 줄만 바꿔라」). GPT 가 한 장 — <세계>-casualN.<화풍>-gpt1.txt
     free/outfit-catalog.md — 우리 옷 목록(옷 자유가 「없는 옷」 을 짓게, tools/prompt-pack.cjs 와 같은 꼴)
     free/<장수>/REQUEST.md — GPT 세션에 그대로 붙여 넣을 부탁 글(읽을 파일 · 쓸 파일 이름 · 규칙)
   이미 있는 주문은 덮지 않는다(--force 면 덮는다). GPT 가 쓴 -gpt*.txt 는 절대 건드리지 않는다. 올리기는 그림 저장소에서 일반 push. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json'));
const CASUAL_ASK = "Below is our image prompt. Reply with this exact prompt, changing only the Outfit line: replace its instruction with your own concrete outfit design — one that is NOT in our outfit catalog (free/outfit-catalog.md) — keeping that line's colour, denier and situation parts. Keep every other line word for word. Reply with the prompt only, nothing else.";
const WORLD_ASK = "Do not draw. Reply with only the final image prompt you would send to the image model, in English, nothing else.";

function args(a) {
  const o = { plans: [], style: 'api25', img: path.join(ROOT, '..', 'sam-atelier-img'), force: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--style') o.style = a[++i]; else if (a[i] === '--plan') o.plans.push(a[++i]); else if (a[i] === '--img') o.img = a[++i]; else if (a[i] === '--force') o.force = true; else o.card = a[i];
  }
  return o;
}
function catalog(t) {
  return '# Our outfit catalog — every outfit type we already use for casual cuts\n\nFor a free-outfit cut, design an outfit that is NOT on this list.\n\n' +
    (t.outfits || []).map(f => '## ' + f.key + ' — ' + f.en + '\n' + (f.items || []).map(i => '- ' + i.en).join('\n')).join('\n\n') + '\n';
}
function main(a) {
  const o = args(a);
  if (!o.card || !P.card(D, o.card)) { console.error('장수가 설계표에 없다: ' + o.card); return 1; }
  if (!S.styles[o.style]) { console.error('화풍이 없다: ' + o.style); return 1; }
  const dir = path.join(o.img, 'free', o.card); fs.mkdirSync(dir, { recursive: true });
  const wrote = [], kept = [], asks = [];
  const put = (name, text) => { const f = path.join(dir, name); if (fs.existsSync(f) && !o.force) { kept.push(name); return; } fs.writeFileSync(f, text.trim() + '\n'); wrote.push(name); };
  for (const w of P.worldsOf(D, o.card)) {
    const slot = w + '.' + o.style;
    put(slot + '-brief.txt', P.buildWorldFree(D, S, o.card, w, { style: o.style }) + '\n\n' + WORLD_ASK);
    asks.push('- `' + slot + '-brief.txt` → 서로 확실히 다른 두 설계를 `' + slot + '-gpt1.txt` · `' + slot + '-gpt2.txt`');
  }
  for (const pf of o.plans) {
    const plan = JSON.parse(fs.readFileSync(pf, 'utf8'));
    if (plan.card !== o.card) { console.error('계획이 다른 장수 것이다: ' + pf); return 1; }
    for (const cut of plan.cuts.filter(c => c.ofree)) {
      const { n, ...sc } = cut, slot = plan.world + '-casual' + n + '.' + o.style;
      const scene = { ...sc, axes: { overall_intensity: 'strong', skin_exposure: 'bold', ...(sc.axes || {}) }, aspect: '2:3', unlocked: sc.unlocked || [] };
      put(slot + '-brief.txt', CASUAL_ASK + '\n\n' + P.casualRecord(D, S, o.card, scene, { world: plan.world, style: o.style, tree, tree2 }, n).prompt);
      asks.push('- `' + slot + '-brief.txt` → Outfit 줄만 바꾼 지시문 하나를 `' + slot + '-gpt1.txt`');
    }
  }
  fs.writeFileSync(path.join(o.img, 'free', 'outfit-catalog.md'), catalog(tree));
  fs.writeFileSync(path.join(dir, 'REQUEST.md'), '# ' + o.card + ' — GPT 설계 지시문 부탁(그림은 그리지 않는다)\n\n' +
    'polos0117/sam-atelier-img 저장소의 `free/' + o.card + '/` 폴더에 있는 설계 주문(`*-brief.txt`)을 하나씩 읽고, 주문 끝의 지시대로 **그림 지시문 글만** 써서 같은 폴더에 아래 이름으로 올려줘(main 에 일반 push). 그림은 그리지 마 — 그림은 내가 API 로 그린다.\n\n' +
    asks.join('\n') + '\n\n규칙\n- 주문에 「fixed」 라고 적힌 것(의상 실루엣 목록 · 무기 · 색 · 노출 · 얼굴 비율 · 구도)은 그대로 지킨다. 자유인 것만 새로 짓는다.\n- 일상컷 옷 자유는 `free/outfit-catalog.md` 에 없는 옷으로. Outfit 줄 말고는 한 글자도 바꾸지 않는다.\n- 파일에는 지시문 글만(설명 · 머리말 없이, 영어).\n- 이미 있는 `-gpt*.txt` 는 덮지 않는다.\n');
  console.log('free/' + o.card + ' — 쓴 것 ' + wrote.length + (kept.length ? ' · 그대로 둔 것 ' + kept.length + '(--force 면 덮는다)' : '') + ' · REQUEST.md · free/outfit-catalog.md');
  for (const x of wrote) console.log('  + ' + x);
  return 0;
}
if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { main };
