#!/usr/bin/env node
/* 일상컷 묶음 계획 — 한 장수의 한 세계 일상컷 일곱 장(2026-11-11 — 11-09 여섯, 전엔 다섯)을 서로 겹치지 않게 한 번에 짠다(2026-11-02, element-atelier 의 tools/casual-plan.cjs 를 삼국지 꼴로 —
   사용자 「일상컷 계획 도구도 옮겨와줘」). 장수는 세계마다 다른 사람이라 **세계마다 일곱 장**(그 세계 그림을 참고 그림으로, IMAGE_RULES 2절).

   생성기(lib/studio.js)와 같은 lib/casual-tree-v2.js · lib/prompt-sam.js 로 칸마다 장면을 고르고, 생성기 「기록 내보내기」 와 같은 꼴의
   기록(<세계>-casualN.<화풍>-ui.json)과 지시문을 쓴다. 지키는 묶음 규칙(한 세계 묶음 안):
     - 세 장은 정해 둔 갈래(사용자 2026-11-02 「각각 1장해서 2장은 확정」 · 2026-11-09 「1번 내용을 필수갈래에 … 필수컷이 3장은 확정」 — 셋째는 상황 노출 한 장, situate) — 노출 갈래 한 장(란제리풍 · 수영복 · 역할극 의상) +
       세계 안 갈래 한 장(세계 안의 방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 군영 · 정원 · 다리 · 사당 · 숲길 · 나루에서 홈웨어 · 란제리 · 목욕 차림 · 수영복), 서로 다른 컷. tools/casual-check.py 와 같은 판정
     - 자유 설계 두 장(2026-11-11 사용자 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 … 필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」) —
       옷 자유 컷(ofree) 하나 + 갈래 자유 컷(ofree + ofreeFamily — 필수 노출 갈래 큰 범위 + ofreeSitu 'free' — 상황은 맡은 쪽이 짓는다, 같은 날 「상황도 열어주자. 옷도 이제 큰범위로만 지정해줘」) 하나, 필수 셋과 다른 컷. 지시문은 장면 줄 대신 자유 설계 덩어리(lib/prompt-spec.js FREE_DESIGN),
       최근 장면(ofreeRecent — 그림 저장소 기록의 최근 여덟 + 같은 묶음의 다른 컷)을 피하라고 적는다. 칸의 장면 값은 트리에 맞는 그림자 — 그리지 않고 묶음 규칙 · 겹침 · 쓴 횟수 셈에서도 뺀다
     - 장소는 서로 다르게, 장소 묶음은 두 번까지 · 의상 계열은 겹치지 않게(평상복만 두 번) · 시대는 한 가지 두 번까지, 네 장 이상이면 네 시대(지금 현실 · 역사의 자리 · 세계 안 · 무대·환상) 다
     - 자세 추천은 서로 다르게 · 프레이밍은 서로 다르게(먼 컷 · 가까운 컷 하나씩은 꼭) · 몸 방향 한 가지는 두 번까지 · 머리 「어깨 너머」 는 한 장까지
     - 소품은 칸마다 다르게 · 그 장수의 물건(설계표 hold, 없으면 역할의 것)을 든 컷은 한두 장 · 마실 것은 한 장까지 · ⚠ 어색한 조합은 한 장까지
     - 장수 사이에서도 안 쓴 트리 쪽 먼저: 그림 저장소 기록(--usage, 기본 옆의 그림 저장소 모두의 records — sam-atelier-img · sam-atelier-img-2, tools/img-repos.cjs)에서 장소 · 옷 계열 · 옷 · 자세 추천 · 자세 · 길(자세 추천 × 장소) · 소품을 센다(표정은 은은한 열일곱에서 고르게 — 2026-11-03) —
       한 번도 안 쓴 값은 무게 12, 쓴 값은 1/(1+횟수)³(2026-11-02 「가중치 올려줘」 — 전엔 4 와 ²)
   이미 그림이 있는 번호는 짜지 않고, 그 세계의 기록(--records)은 겹침 검사에만 쓴다.

     node tools/casual-plan.cjs <장수> --world <세계> [--style <화풍>] [--slots 1,2,3] [--records <그림 저장소>/records/<장수>] [--seed N] [--out <폴더>] [--usage <폴더>|none]
   --slots 를 안 주면 그 세계에 등록된 것(data/img.json)을 빼고 일곱 장이 되게(여섯 장을 다 그린 세계는 일곱째 — 갈래 자유 컷 — 하나만) — 번호는 세계마다 따로, 비어 있는 가장 작은 것부터.
   --records 를 안 주면 옆의 그림 저장소 모두의 records/<장수>(2026-11-12 둘째 저장소 sam-atelier-img-2 — 한 장수의 기록이 두 저장소에 나뉠 수 있다). --out 을 주면 칸마다 기록 · 지시문과 plan.json 을 쓴다.
   --usage 는 쉼표로 여럿을 줄 수 있다.
     node tools/casual-plan.cjs <장수> --world <세계> --check <기록 폴더> [--from N]   # 올리기 전 — 그 세계 묶음이 위 규칙을 다 지키나(다른 세계와 같은 장면도). --from: N 번부터의 새 묶음만, 옛 묶음은 겹침에만
     node tools/casual-plan.cjs <장수> --world all [--fresh] --out <폴더>   # 세계 셋을 한 번에(폴더 아래 plan-<세계>) — 세계끼리 장면을 돌려쓰지 않는다
   --fresh: 옛 묶음은 그대로 두고 그 뒤 번호로 새 일곱 장(옛 묶음과도 겹치지 않게). --others a.json,b.json: 아직 안 올린 다른 계획도 겹침에 넣는다.
   세계끼리 · 묶음끼리: 같은 장소는 안 되고(세계 안 장소는 세계마다 다른 곳이라 옷 · 자세까지 같을 때만), 같은 옷 계열로 같은 자세 추천도 안 된다(2026-11-02 — 네 장수가 세 세계에 같은 장면 한 벌을 썼다) */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), REPOS = require('./img-repos.cjs');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const T = ctx.window.AtelierSpec, CT = ctx.window.AtelierCasualTree, C2 = ctx.window.AtelierCasualTreeV2, P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json'));
/* --style <화풍> — 그 화풍의 등록 · 기록으로 빈 번호를 센다(2026-11-09 2.5 API 판 api25 — 기본 화풍 그림과 따로). 모듈로 불리면 늘 기본 화풍 */
const ARG_STYLE = require.main === module && process.argv.indexOf('--style') > 0 ? process.argv[process.argv.indexOf('--style') + 1] : '';
if (ARG_STYLE && !S.styles[ARG_STYLE]) { console.error('화풍이 없다: ' + ARG_STYLE); process.exit(2); }
const T2 = C2.make(tree2, tree), STYLE = ARG_STYLE || S['default'], CASUAL_N = 7;   /* 사용자 2026-11-11 「한 장 더 생성하게 해서 필수갈래 또는 상황 노출을 더 그리게 추가해줘. 그럼 일상컷은 총 7장 되는거야」 — 11-09 「6장으로」, 전엔 다섯 */

const EXPOSE_TYPES = ['lingerie', 'swimwear', 'roleplay'];   /* 노출 갈래 — 장수마다 돌려 가며 */
const FAR = ['full_body', 'environmental'], NEAR = ['chest_up', 'face_close'];
const FRAMES = Object.keys(tree2.frames).filter(k => k !== 'note' && k !== 'detail');
/* 일상컷 표정 후보 — 일상컷에 어색한 것은 계획기가 고르지 않는다(사용자 2026-11-03 「표정 관련 문구가 과하게」 · 「다 해줘」):
   웃는 입에 무표정한 눈 · 지루함 · 졸림 · 지침 · 짜증 · 시큰둥 · 눈을 질끈 감은 웃음. 생성기에서 손으로 고르는 것은 그대로 된다 */
/* 2026-11-03 「일상컷쪽이 더 그래」 — 빼는 목록 대신 고르는 목록으로. GPT 세션의 image_gen 은 결연함을 노려봄으로, 으쓱 · 장난을 한쪽 눈썹 + 비웃음으로,
   크게 웃음을 벌린 입으로, 호기심을 치켜든 눈썹으로, 관능을 반쯤 감은 눈으로 키웠다. 일상컷은 은은한 표정 열일곱에서만 */
const EXPR_CASUAL = ['calm', 'soft_smile', 'gentle', 'amused', 'pensive', 'wistful', 'nostalgic', 'confident', 'proud', 'focused', 'half_smile', 'candid', 'relieved',
  'wink', 'sensual', 'serious', 'curious'];   /* 같은 날 사용자 「윙크, 관능, 진지, 호기심 정도는 일상컷에 넣어줘」 */
const EXPR_SKIP = Object.keys(tree2.expressions || {}).filter(k => !EXPR_CASUAL.includes(k));
const EXPRS = EXPR_CASUAL.filter(k => (tree2.expressions || {})[k]);
const ERA_WEIGHT = { now: 5, heritage: 2, nation: 2, fantasy: 1 };
/* 한 묶음의 시대 몫 — 지금 현실 둘 · 세계 안 · 역사의 자리 · 무대·환상 하나씩(2026-11-02 사용자 「지금 현실 비중을 높여줘」 —
   기록 159장 중 지금 현실이 31장(19%)이고 세계 안이 88장이었다. 안 쓴 장소 51 곳이 다 지금 현실에 있다). 칸마다 「쓴 수 ÷ 몫」 이 가장 낮은 시대부터 */
/* 2026-11-09 여섯 장 — 하나 더는 무대·환상(새 계열 모험가 · 신화 드레이프가 사는 곳). 한 시대 두 장까지(check)라 지금 현실은 둘 그대로 */
const ERA_QUOTA = { now: 2, nation: 1, heritage: 1, fantasy: 2 };
const FIXED_AXES = { overall_intensity: 'strong', skin_exposure: 'bold' };
const DRINKS = ['cup', 'drink_glass', 'water_bottle', 'teapot'];
/* 상황 노출(사용자 2026-11-09 「1번 내용을 필수갈래에 넣어줘. 그러면 필수컷이 3장은 확정」) — 여섯 장 중 한 장, 노출 갈래 · 세계 안 갈래와 다른 컷에
   젖은 옷 · 바람 · 반쯤 푼 차림 · 흘러내린 어깨끈 중 그 옷에 맞는 것 하나(T.CASUAL.situations). 다른 세계 묶음이 쓴 상황은 뒤로 */
const SITUS = (T.CASUAL.situations || []).map(x => x.key);
const SITU_NO_FRAME = ['face_close'];   /* 얼굴 클로즈업엔 옷이 안 보여 상황이 안 산다(손상향 시험 계획 — 젖은 옷이 클로즈업에) */

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, list) => list[Math.floor(r() * list.length)];
function weighted(r, weights) { const keys = Object.keys(weights), sum = keys.reduce((s, k) => s + weights[k], 0); let x = r() * sum; for (const k of keys) { x -= weights[k]; if (x < 0) return k; } return keys[0]; }
const by = (list, k) => (list || []).find(r => r.key === k);

/* 장수 — 생성기 지시문이 쓰는 꼴(prompt-sam 의 casualCard): 그 장수의 물건 하나가 「알아볼 거리」 */
function cardOf(key) {
  const c = P.card(D, key);
  if (!c) throw new Error('장수가 없다: ' + key + ' (설계표의 한글 이름 그대로)');
  const h = P.casualHold(c);   /* 무기는 일상컷에서 들지 않고 장신구로(prompt-sam casualHold) — 그때는 「그 장수의 물건을 든 컷」 도 없다 */
  return { key, c, g: { key, signature: h ? [h] : [], signature_hold: h ? [0] : [] }, worlds: P.worldsOf(D, key) };
}
/* 필수 갈래 종류 — 옷 계열이 곧 노출 갈래면 그 계열, 세계 안의 방 · 목욕 · 지붕 · 여관 · 서재 · 부엌 · 군영 · 정원 · 다리 · 사당 · 숲길 · 나루 일상이면 nation(세계 안 갈래) */
function requiredType(sc) {
  if ((tree.required.outfits || []).includes(sc.ofam)) return sc.ofam;
  return CT.isRequired(tree, sc) ? 'nation' : '';
}
const PATH2 = new Map();
function requiredPaths(type) {
  if (PATH2.has(type)) return PATH2.get(type);
  const out = [];
  for (const e of tree.eras) for (const place of C2.choices(T2, { era: e.key }, 'place', null))
    for (const ofam of C2.choices(T2, { era: e.key, place }, 'ofam', null)) {
      const sc = { era: e.key, place, ofam };
      if (requiredType(sc) === type) out.push(sc);
    }
  PATH2.set(type, out);
  return out;
}
const MEMO = new Map();
function presetsAt(sc, g) {
  const k = [sc.era, sc.place, sc.ofam, sc.prop].join('|');
  if (!MEMO.has(k)) MEMO.set(k, C2.presets(T2, sc, g));
  return MEMO.get(k);
}
const sigProp = c => { const u = C2.use(T2, c.use); return !!u && u.prop === 'signature'; };

/* 카드 사이 쓴 횟수의 무게 — 한 번도 안 쓴 값이 먼저(12), 쓴 값은 1/(1+횟수)³.
   2026-11-02 사용자 「가중치 올려줘」 — 기록 159장 중 세계 안 · 방 · 홈웨어 · 발목 꼬고 앉기 한 장면이 12장, 길(자세 추천 × 장소) 3583 중 102 만 썼다.
   전엔 4 와 1/(1+횟수)² — 안 쓴 값이 한 번 쓴 값보다 16 배, 이제 96 배. 길(자세 추천 × 장소) · 옷 계열 횟수도 센다 */
const WEIGHT_UNUSED = 12;
/* 카메라용 몸짓 추천(쉿 · 브이 · 엄지 척 · 손 흔들기 · 카메라로 손 뻗기 … — 표의 pose)은 덜 고른다(2026-11-13 검토 — 추천 47 중 카메라 응시 28 · 눈높이 34 라
   장소가 달라도 「사진 찍히는 중」 한 장이 됐다). 없애지는 않는다 */
const POSE_WEIGHT = 0.4;
/* 어색한 조합(⚠ — 표 awkward: 수영복으로 작업 자리, 휴양지 차림으로 현장 …)인 의상 계열은 덜 고른다(2026-11-13 — 새 장소 · 새 계열이 새 모순이 되지 않게). 묶음마다 한 장까지는 여전히 된다 */
const AWKWARD_WEIGHT = 0.15;
const wOf = n => n ? 1 / Math.pow(1 + n, 3) : WEIGHT_UNUSED;
/* 옷 계열 무게 — 목욕 차림(수건 · 페슈테말 · 찜질복 · 가운)이 계획 12.7% · 등록 10.8% 로 계열 가운데 가장 많았다(사용자 2026-11-09 「수건 감는 옷 많이 나오던데 이전부터」).
   목욕 계열 장소 · 세계 안 목욕탕이 많아 그렇다 — 고를 때 무게를 줄이고, 한 장수의 세 세계 통틀어 한 장까지(check) */
const FAM_WEIGHT = { bath: 0.25 };
const famW = sc => FAM_WEIGHT[(sc && sc.ofam) || sc] || 1;
function lean(r, list, count, key = x => x, factor = () => 1) {
  if (!list.length) return undefined;
  const w = list.map(x => wOf((count || {})[key(x)] || 0) * factor(x)), sum = w.reduce((a, b) => a + b, 0);
  let x = r() * sum; for (let i = 0; i < list.length; i++) { x -= w[i]; if (x < 0) return list[i]; }
  return list[list.length - 1];
}
/* 쓴 횟수 꼴 바로잡기 — 옛 꼴(소품 → 횟수)도 받는다 */
const EMPTY_USAGE = () => ({ prop: {}, place: {}, item: {}, preset: {}, posture: {}, expr: {}, ofam: {}, path: {} });
const usageOf0 = u => (u && (u.place || u.prop || u.preset)) ? { ...EMPTY_USAGE(), ...u } : { ...EMPTY_USAGE(), prop: u || {} };
/* 새로 더한 옷 계열(쓴 횟수 0)은 다른 계열의 가운데 값에서 시작한다 — 안 그러면 「안 쓴 쪽 먼저」 무게로 모든 묶음에 들어갔다(2026-11-03 동탄룩 72묶음 중 72) */
const FAMS = (tree.outfits || []).map(o => o.key);
const usageOf = u => {
  const x = usageOf0(u), used = FAMS.map(k => x.ofam[k] || 0).filter(n => n > 0).sort((a, b) => a - b);
  if (used.length) { const mid = used[Math.floor(used.length / 2)]; x.ofam = { ...x.ofam }; for (const k of FAMS) if (!x.ofam[k]) x.ofam[k] = mid; }
  return x;
};
const pathKey = (preset, place) => preset + '@' + place;

/* 한 칸 — 시대 · 장소 · 의상 · 옷, 그 장소에서 쓸 수 있는 자세 추천 하나(frame 을 주면 그 프레이밍의 추천만).
   wantSig 면 소품 동작을 그 장수의 물건으로. 소품 동작은 덜 쓴 소품 쪽으로(무게 1/(1+횟수)², 따로 된 난수 흐름 — game 과 같다).
   장소 · 옷 · 자세 추천(그 자세) · 표정은 다른 카드에서 안 쓴 · 덜 쓴 쪽으로(lean — 2026-11-01) */
function slot(r, card, reqType, { frame = '', wantSig = false, era: wantEra = '', usage = {}, rUse = r } = {}) {
  const g = card.g, U = usageOf(usage);
  let sc;
  if (reqType) { const paths = requiredPaths(reqType).filter(x => !wantEra || x.era === wantEra); if (!paths.length) return null; sc = { ...lean(r, paths, U.place, x => x.place, famW) }; }
  else {
    const era = wantEra || weighted(r, ERA_WEIGHT), place = lean(r, C2.choices(T2, { era }, 'place', null), U.place);
    if (!place) return null;
    sc = { era, place, ofam: lean(r, C2.choices(T2, { era, place }, 'ofam', null), U.ofam, x => x, f => famW(f) * (C2.awkward(T2, f, place).length ? AWKWARD_WEIGHT : 1)) };
  }
  sc.treeV = 2; sc.prop = wantSig ? '0' : '';
  const presets = presetsAt(sc, g).filter(p => (!frame || p.frame === frame) && (!wantSig || p.prop_kind));
  if (!presets.length) return null;
  const rp = list => pick(r, list);
  /* 자세 추천 — 그 추천과 그 자세의 횟수를 함께(선 자세가 절반이 넘었다 — 2026-11-01 기록 434장) */
  const pw = presets.map(p => wOf(U.preset[p.key] || 0) * Math.sqrt(wOf(U.posture[p.posture] || 0)) * wOf(U.path[pathKey(p.key, sc.place)] || 0) * (p.pose ? POSE_WEIGHT : 1));
  let px = r() * pw.reduce((a, b) => a + b, 0), chosen = presets[presets.length - 1];
  for (let i = 0; i < presets.length; i++) { px -= pw[i]; if (px < 0) { chosen = presets[i]; break; } }
  sc = C2.repair(T2, C2.applyPreset(T2, sc, chosen.key), g, rp);
  if (wantSig) {
    const sig = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop === 'signature');
    if (!sig.length) return null;
    sc = { ...sc, use: pick(r, sig) };
  }
  const items = C2.choices(T2, sc, 'item', g);
  sc.item = items.length ? lean(r, items, U.item) : '';
  sc = C2.repair(T2, sc, g, rp);
  if (!wantSig && sc.use && !sigProp(sc)) {
    const alt = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop !== 'signature');
    if (alt.length > 1) {
      const n = p => DRINKS.includes(p) ? DRINKS.reduce((a, d) => a + (U.prop[d] || 0), 0) : (U.prop[p] || 0);
      const u = weighted(rUse, Object.fromEntries(alt.map(k => [k, 1 / Math.pow(1 + n(C2.use(T2, k).prop), 2)])));
      const next = C2.set(T2, sc, 'use', u, g, rp);
      if (next.use === u) sc = next;
    }
  }
  if (wantSig && !sigProp(sc)) return null;
  const body = by(tree2.body, sc.body), head = by(tree2.head, sc.head);
  sc.expr = body && body.face_hidden && !(head && head.look_back) ? '' : pick(r, EXPRS);   /* 표정은 고르게 — 덜 쓴 쪽 무게(lean)를 걸면 덜 쓴 극단 표정으로 쏠렸다(2026-11-03) */
  sc.axes = { ...FIXED_AXES }; sc.aspect = '2:3'; sc.unlocked = [];
  return sc;
}

/* 묶음 규칙 — 틀린 것 목록. base 는 이미 있는 컷(그 세계): 그것들이 벌써 넘긴 한도는 그만큼 올려 준다 */
function check(cuts, card, base = [], others = []) {
  /* 자유 설계 컷(ofree)의 장면 값은 그림자 — 장면 규칙(갈래 · 장소 · 시대 · 구도 · 소품 · 세계 사이 겹침)은 나머지 컷만으로 센다(2026-11-11) */
  const ALL = [...base, ...cuts], errs = [], all = ALL.filter(c => !c.ofree), B = base.filter(c => !c.ofree), N = cuts.filter(c => !c.ofree);
  others = others.filter(o => !o.ofree);
  const count = (f, xs) => xs.reduce((m, c) => { const k = f(c); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const over = (name, f, most, xs = all, bs = B) => {
    const m = count(f, xs), b = count(f, bs);
    Object.entries(m).forEach(([k, n]) => { if (n > Math.max(most, b[k] || 0)) errs.push(`${name} ${k} 가 ${n} 번(${most} 번까지)`); });
  };
  /* 두 장은 정해 둔 갈래 — 노출 한 장 · 세계 안 한 장, 서로 다른 컷 */
  const ex = all.filter(c => EXPOSE_TYPES.includes(requiredType(c))), inw = all.filter(c => CT.isRequired(tree, c) && requiredType(c) === 'nation');
  if (all.length >= 2 && (!ex.length || !inw.length)) errs.push('필수 갈래가 없다 — 노출 한 장 · 세계 안 한 장(' + (!ex.length ? '노출 갈래' : '') + (!ex.length && !inw.length ? ' · ' : '') + (!inw.length ? '세계 안 갈래' : '') + ' 없음)');
  over('장소', c => c.place, 1);
  over('장소 묶음', c => (C2.place(T2, c.place) || {}).group, 2);
  over('의상 계열', c => c.ofam !== 'everyday' && c.ofam, 1);
  over('평상복', c => c.ofam === 'everyday' && c.ofam, 2);
  over('시대', c => c.era, 2);
  if (N.length >= 4) { const eras = new Set(all.map(c => c.era)), want = Math.min(tree.eras.length, all.length); if (eras.size < want) errs.push(`시대가 ${eras.size} 가지뿐이다(${want} 가지 다)`); }
  over('프레이밍', c => c.frame, Math.max(1, Math.ceil(all.length / FRAMES.length)));
  over('자세 추천', c => c.preset, 1);
  over('몸 방향', c => c.body, 2);
  over('머리 어깨 너머', c => (by(tree2.head, c.head) || {}).look_back && 'over_shoulder', 1);
  over('소품', c => { const u = C2.use(T2, c.use); return u && u.prop; }, 1);
  over('마실 것', c => { const u = C2.use(T2, c.use); return u && DRINKS.includes(u.prop) && 'drink'; }, 1);
  over('그 장수의 물건', c => sigProp(c) && 'signature', 2);
  over('어색한 조합', c => C2.awkward(T2, c.ofam, c.place).length && 'awkward', 1);
  over('동탄룩', c => c.ofam === 'dongtan' && 'dongtan', 1);
  /* 셋째 필수 — 상황 노출 한 장(여섯 장 묶음부터 — 옛 다섯 장 묶음은 이 갈래 전), 노출 · 세계 안 갈래 컷과 다른 컷 */
  over('상황 노출', c => c.situ && 'situ', 1);
  over('옷 자유', c => c.ofree && !c.ofreeFamily && !c._fam && 'ofree', 1, ALL, base);   /* _fam — 계획 중 갈래 자유 칸 자리 표시 */
  over('갈래 자유', c => c.ofree && c.ofreeFamily && 'family', 1, ALL, base);
  /* 자유 설계 두 장(2026-11-11) — 필수 셋(노출 · 세계 안 · 상황 노출)과 다른 컷. 갈래 자유 컷은 필수 노출 갈래 중 그 묶음 노출 갈래 컷과 다른 것 + 그 묶음 상황 노출 컷과 다른 상황 */
  const exFam = new Set(all.map(requiredType).filter(t => EXPOSE_TYPES.includes(t))), situUsed = new Set(all.filter(c => c.situ).map(c => c.situ));
  for (const c of cuts) {
    if (c.ofree && c.situ) errs.push(`칸 ${c.n || '?'}: 자유 설계 컷은 상황 노출 컷과 다른 칸`);   /* 필수 갈래는 위에서 — 자유 설계 컷 말고 다른 컷이 채워야 한다 */
    if (c.ofreeFamily && !c.ofree) errs.push(`칸 ${c.n || '?'}: 갈래가 있는데 자유 설계 컷이 아니다`);
    if (!c.ofreeFamily) continue;
    if (!EXPOSE_TYPES.includes(c.ofreeFamily)) errs.push(`칸 ${c.n || '?'}: 갈래 자유 ${c.ofreeFamily} 는 필수 노출 갈래(${EXPOSE_TYPES.join(' · ')})가 아니다`);
    else if (exFam.has(c.ofreeFamily)) errs.push(`칸 ${c.n || '?'}: 갈래 자유 ${c.ofreeFamily} 는 이 묶음의 노출 갈래 컷과 같다`);
    if (c.ofreeSitu === 'free') { /* 열린 상황(2026-11-11 「상황도 열어주자」) — 맡은 쪽이 짓는다 */ }
    else if (!SITUS.includes(c.ofreeSitu)) errs.push(`칸 ${c.n || '?'}: 갈래 자유 컷의 상황 ${c.ofreeSitu || '(없음)'} 가 'free' 도 상황 표에도 없다`);
    else if (situUsed.has(c.ofreeSitu)) errs.push(`칸 ${c.n || '?'}: 갈래 자유 상황 ${c.ofreeSitu} 는 이 묶음의 상황 노출 컷과 같다`);
  }
  if (ALL.length >= CASUAL_N && !ALL.some(c => c.ofree && c.ofreeFamily)) errs.push('갈래 자유 컷이 없다 — 일곱 장 묶음엔 필수 갈래 + 상황을 묶은 자유 설계 한 장');   /* 옛 여섯 장 묶음은 이 칸 전이라 그대로 맞다 */
  for (const c of cuts) if (c.situ && !P.situFits(c.situ, outfitEn(c))) errs.push(`칸 ${c.n || '?'}: 상황 ${c.situ} 는 이 옷에 안 맞는다`);
  for (const c of cuts) if (c.situ && requiredType(c)) errs.push(`칸 ${c.n || '?'}: 상황 노출은 노출 · 세계 안 갈래 컷과 다른 컷에`);
  for (const c of cuts) if (c.situ && SITU_NO_FRAME.includes(c.frame)) errs.push(`칸 ${c.n || '?'}: 상황 노출은 얼굴 클로즈업에 두지 않는다`);
  /* 상황 노출 — 여섯 장 이상 묶음에 한 장. 일곱째 하나만 더 짤 수 있는 옛 묶음(상황 컷 없이 여섯 장)은 갈래 자유 컷의 상황으로 채운다(2026-11-11) */
  if (ALL.length >= CASUAL_N - 1 && !all.some(c => c.situ && !requiredType(c)) && !ALL.some(c => c.ofree && c.ofreeSitu)) errs.push('상황 노출 컷이 없다 — 노출 · 세계 안 갈래와 다른 컷 한 장');   /* 2026-11-03 더한 계열 — 안 쓴 계열이라 무게가 커서 묶음마다 한 장까지 */
  if (card.g.signature_hold.length && all.length >= 3 && !all.some(sigProp)) errs.push('그 장수의 물건을 든 컷이 없다(한두 장)');
  if (all.length >= 3) {
    if (!all.some(c => FAR.includes(c.frame))) errs.push('먼 컷(전신·환경)이 없다');
    if (!all.some(c => NEAR.includes(c.frame))) errs.push('가까운 컷(가슴 위·클로즈업)이 없다');
  }
  for (const c of cuts) {
    const fixed = C2.repair(T2, { ...c }, card.g);
    for (const k of C2.ORDER) if ((fixed[k] || '') !== (c[k] || '')) errs.push(`칸 ${c.n || '?'}: ${k}=${c[k]} 는 트리에서 못 고른다`);
  }
  /* 세계끼리 · 묶음끼리 장면을 돌려쓰지 않는다(2026-11-02 — 유비 · 조운 · 하후돈 · 사마의가 세 세계에 같은 장면 한 벌을 썼다).
     같은 장소는 안 된다 — 다만 「세계 안」 장소(nation_*)는 세계마다 다른 곳(객잔 · 선술집 · 정거장 바)이 되니, 그때는 옷 계열까지 같을 때만 막는다.
     장소 · 옷과 상관없이 같은 자세 추천(= 같은 구도)도 안 된다(사용자 「같은 구도의 장면」) */
  const inWorld = c => (C2.place(T2, c.place) || {}).eras && /^nation_/.test(c.place);
  /* 같은 옷도 세계끼리 · 묶음끼리 돌려입지 않는다(사용자 2026-11-08 「무협에서 니트 상의했으면 메카에서도 …」 → 「응 막아줘」) — 옷(item)이 같으면, 옷 없이 계열만이면 그 계열(평상복 계열 자체는 빼고) */
  const outfitKey = c => c.item ? c.ofam + '/' + c.item : (c.ofam && c.ofam !== 'everyday' ? c.ofam : '');
  for (const c of N) {
    const same = others.filter(o => o.place && o.place === c.place);
    if (same.length && (!inWorld(c) || same.some(o => o.ofam === c.ofam))) errs.push(`칸 ${c.n || '?'}: 장소 ${c.place} 는 다른 세계 · 다른 묶음이 쓴 곳`);
    if (c.preset && others.some(o => o.preset === c.preset)) errs.push(`칸 ${c.n || '?'}: 자세 추천 ${c.preset} 는 다른 세계 · 다른 묶음이 쓴 구도`);
    const ok = outfitKey(c); if (ok && others.some(o => outfitKey(o) === ok)) errs.push(`칸 ${c.n || '?'}: 옷 ${ok} 는 다른 세계 · 다른 묶음이 입은 옷`);
    if (c.ofam === 'bath' && others.some(o => o.ofam === 'bath')) errs.push(`칸 ${c.n || '?'}: 목욕 차림은 한 장수의 세계 셋 통틀어 한 장까지(2026-11-09)`);
  }
  return errs;
}
/* 옷 색 갈래(2026-11-08 「일상컷 생성 옵션에 의상색 관련 다양성은 없었나?」 → 「응 넣어줘」) — 색이 박히지 않은 옷마다 서로 다른 갈래를 준다.
   이미 있는 컷 · 다른 세계 묶음이 쓴 갈래는 뒤로(다 쓰면 다시 처음부터). 장면 고르기(씨앗 r)와 따로 굴려 옛 씨앗의 장면이 그대로다 */
const COLORS = (T.CASUAL.colors || []).map(c => c.key);
function outfitEn(c) { const it = C2.item(T2, c.ofam, c.item), fm = C2.family(T2, c.ofam); return (c.outfit || '').trim() || (it && it.en) || (fm && fm.en) || ''; }
function colorize(cuts, old = [], others = [], rc = Math.random) {
  const used = new Set([...old, ...others].map(c => c.color).filter(Boolean)), mine = new Set();
  for (const c of cuts) {
    if (P.colorFixed(outfitEn(c))) { delete c.color; continue; }
    let pool = COLORS.filter(k => !used.has(k) && !mine.has(k));
    if (!pool.length) pool = COLORS.filter(k => !mine.has(k));
    if (!pool.length) pool = COLORS.slice();
    c.color = pool[Math.floor(rc() * pool.length)]; mine.add(c.color);
  }
  return cuts;
}
/* 데니어(2026-11-08 「데니어 설정값 넣어서 랜덤하게 설정될 수 있게 해줘. 기존 노출설정값 과는 별개로」) — 데니어가 닿는 옷(P.denierFits)마다
   열에 여섯은 갈래 하나(40 · 60 · 80), 묶음 안에선 갈래를 돌려 가며. 노출 단계(skin_exposure)는 건드리지 않는다. 장면 · 색과 따로 된 난수 */
const DENIERS = (T.CASUAL.deniers || []).map(d => d.key), DENIER_RATE = 0.6;
function denierize(cuts, rd = Math.random) {
  const mine = [];
  for (const c of cuts) {
    if (!P.denierFits(outfitEn(c)) || rd() >= DENIER_RATE) { delete c.denier; continue; }
    let pool = DENIERS.filter(k => !mine.includes(k)); if (!pool.length) pool = DENIERS.slice();
    c.denier = pool[Math.floor(rd() * pool.length)]; mine.push(c.denier);
  }
  return cuts;
}
/* 바람에 날림은 실내가 아닌 곳만(2026-11-13 — 장소 특징 indoor). 젖은 옷은 실내면 지시문이 비 대신 물 튐 글(enIn)을 싣는다 */
const situAtPlace = (k, c) => C2.situOk(T2, c, by(T.CASUAL.situations, k));   /* 상황 표의 조건(장소 특징 · 묶음 · 자세 · 프레이밍 — 바람은 실내가 아닌 곳, 땀은 더운 곳, 역광 실루엣은 창 · 하늘, 트임은 걷거나 앉은 전신 컷) */
/* 빛 · 날씨 · 머리 매무새 · 빛의 방향 · 화면 안 자리 · 배경 깊이 · 전경 · 카메라 높이(2026-11-13) — 전엔 계획기가 이 칸들을 한 번도 안 채워 묶음의 빛이 한 가지였다.
   조건은 표 ambience(시간대는 하늘 · 창이 있는 곳, 등불은 실내, 밤 고정 장소는 밤 시간대만, 날씨는 하늘 · 창이 있는 곳 …)와 모듈 C2.ambience 가 쥔다.
   묶음 안에서 덜 쓴 값부터. 장면 고르기와 따로 된 난수라 옛 씨앗의 장면(장소 · 옷 · 자세)은 그대로다 */
const AMBIENT = ['time', 'weather', 'hair', 'light', 'spot', 'depth', 'view'];
function ambient(cuts, old = [], ra = Math.random) {
  const used = {}, note = c => [...AMBIENT, 'camera'].forEach(k => { if (c[k]) { used[k] = used[k] || {}; used[k][c[k]] = (used[k][c[k]] || 0) + 1; } });
  old.filter(c => !c.sfree).forEach(note);
  const opts = { times: (T.CASUAL.times || []).map(x => x.key), hairs: (T.CASUAL.hairs || []).map(x => x.key), used };
  for (const c of cuts) {
    if (c.sfree || c.ofree) continue;   /* 자유 설계 칸은 맡은 쪽이 짓는다 */
    Object.assign(c, C2.ambience(T2, c, ra, opts));
    /* 역광 실루엣 상황은 빛이 뒤에서 — 밤 시간대는 뗀다 */
    if (c.situ === 'sheer_light') { c.light = 'back'; if (['night', 'neon', 'lamplight'].includes(c.time)) c.time = ''; if (c.weather === 'night_snow') c.weather = ''; }
    for (const k of AMBIENT) if (!c[k]) delete c[k];
    note(c);
  }
  return cuts;
}
/* 상황 — 상황 칸(situAt)에 그 옷에 맞는 것 하나. 이미 있는 컷 · 다른 세계 묶음이 쓴 상황은 뒤로. 장면과 따로 된 난수 */
function situate(cuts, at, old = [], others = [], rs = Math.random) {
  const used = new Set([...old, ...others].map(c => c.situ).filter(Boolean));
  cuts.forEach((c, i) => {
    if (i !== at) { delete c.situ; return; }
    const fit = P.situsFor(outfitEn(c)).filter(k => situAtPlace(k, c)); let pool = fit.filter(k => !used.has(k)); if (!pool.length) pool = fit;
    /* 젖은 옷은 거의 모든 옷에 맞아 늘 후보에 들었다(기록에서 가장 많은 상황) — 다른 후보가 있으면 열에 넷만 남긴다(2026-11-13) */
    if (pool.length > 1 && pool.includes('wet') && rs() >= 0.4) pool = pool.filter(k => k !== 'wet');
    if (pool.length) c.situ = pool[Math.floor(rs() * pool.length)]; else delete c.situ;
  });
  return cuts;
}
/* 자유 설계 컷 둘(2026-11-11 사용자 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 … 필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」) —
   칸은 plan() 이 미리 정한다(필수 셋 · 그 장수의 물건 칸이 아닌 칸, ofree). 칸의 장면 값은 그림자(check 가 장면 규칙에서 뺀다 — 그리지 않는다).
   ① 갈래 자유 컷(일곱 장 묶음에 꼭 — 2026-11-11 「한 장 더 생성하게 해서 필수갈래 또는 상황 노출을 더 그리게」): ofreeFamily(필수 노출 갈래 중 그 묶음 노출 갈래 컷과 다른 것) +
      ofreeSitu 'free'(상황은 표에서 고르지 않고 맡은 쪽이 짓는다 — 우리 넷이 아닌 것 먼저, 같은 날 「상황도 열어주자」). 갈래는 큰 범위만 — 목록에서 골라도, 지어도 되나 목록 밖 먼저. 다른 세계 묶음이 쓴 갈래는 뒤로
   ② 옷 자유 컷(2026-11-09 「일상컷도 1장은 gpt에게 노출의상 자유롭게 만들어달라고 해줘」): ofree 만 — 칸이 남으면(여섯 장을 다 그린 묶음에 일곱째 하나만 짤 때는 ① 만).
   옷 색 · 데니어 · 상황(situ)은 없다. 갈래를 고를 수 없으면(묶음의 다른 컷이 노출 갈래 셋을 다 썼다) false */
function freeOutfit(cuts, old = [], rf = Math.random, others = []) {
  const real = [...old, ...cuts].filter(c => !c.ofree);
  for (const c of cuts) if (c.ofree) { delete c.color; delete c.denier; delete c.situ; delete c.ofreeFamily; delete c.ofreeSitu; }
  const fc = cuts.find(c => c._fam); if (!fc) return true;
  delete fc._fam;
  const later = (keys, used) => { const fresh = keys.filter(k => !used.has(k)); return fresh.length ? fresh : keys; };
  const exFam = new Set(real.map(requiredType).filter(t => EXPOSE_TYPES.includes(t)));
  const fams = later(EXPOSE_TYPES.filter(k => !exFam.has(k)), new Set(others.map(o => o.ofreeFamily).filter(Boolean)));
  if (!fams.length) return false;
  fc.ofreeFamily = fams[Math.floor(rf() * fams.length)]; fc.ofreeSitu = 'free';
  return true;
}
/* 최근 장면(2026-11-11 — 자유 설계 덩어리의 「Recent scenes to avoid」) — 장소 + 하는 일, 영어로 짧게.
   계획 칸은 장소 글의 첫 마디 — 소품 동작(없으면 자세). 자유 설계로 그린 컷은 기록의 채운 덩어리(Place · Activity 줄)에서 */
const firstClause = s => String(s || '').split(/[,;.]| — /)[0].trim();
function sceneEn(c, world) {
  if (!c) return '';
  const p = C2.place(T2, c.place), u = C2.use(T2, c.use), pr = u && C2.prop(T2, u.prop), po = by(tree2.postures, c.posture);
  const place = p ? firstClause(P.placeEn(p, world)) : '';
  const act = firstClause(u ? u.en.replace('{prop}', pr && !pr.signature ? pr.en : 'her keepsake') : (po ? po.en : ''));
  return [place, act].filter(Boolean).join(' — ');
}
function blockScene(text) {
  const t = String(text || ''), i = t.indexOf('FREE DESIGN:'); if (i < 0) return '';
  const get = h => { const m = new RegExp('^' + h + ':\\s*(.+)$', 'm').exec(t.slice(i)); return m && !/^…/.test(m[1].trim()) ? firstClause(m[1]) : ''; };
  return [get('Place'), get('Activity')].filter(Boolean).join(' — ');
}
/* 폴더 하나 또는 여럿(그림 저장소마다 — 2026-11-12) → 있는 폴더 목록 */
const dirList = dir => [].concat(dir || []).filter(d => d && fs.existsSync(d));
/* 그림 저장소 기록에서 최근 n 장면 — 기록의 imported · generation.date · date 가 늦은 것부터(같으면 파일 시각). dir 은 하나 또는 여럿 */
function recentScenes(dirs, n = 8) {
  const rows = [];
  for (const dir of dirList(dirs)) for (const k of fs.readdirSync(dir)) {
    const d = path.join(dir, k); if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter(x => /^(\w+)-casual\d+\.[a-z0-9_]+-ui\.json$/.test(x))) {
      let r; try { r = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch (e) { continue; }
      const g = r.generation || {}, sc = r.scene || {};
      const text = sc.ofree ? (blockScene(g.free_design) || blockScene(g.free_prompt) || (/FREE DESIGN:/.test(g.free_prompt || '') ? '' : sceneEn(sc, r.world))) : sceneEn(sc, r.world);
      if (text) rows.push({ text, at: String(r.imported || g.date || r.date || ''), mt: fs.statSync(path.join(d, f)).mtimeMs });
    }
  }
  rows.sort((a, b) => (b.at > a.at ? 1 : b.at < a.at ? -1 : b.mt - a.mt));
  const out = []; for (const r of rows) { if (!out.includes(r.text)) out.push(r.text); if (out.length >= n) break; }
  return out;
}
/* 자유 설계 컷마다 피할 장면 — 최근 장면 + 같은 묶음의 다른 컷(자유 설계 컷은 빼고) */
function recentize(cuts, old = [], recent = [], world = '') {
  const same = [...old, ...cuts].filter(c => !c.ofree).map(c => sceneEn(c, world)).filter(Boolean);
  const list = [...new Set([...recent, ...same])];
  for (const c of cuts) if (c.ofree) c.ofreeRecent = list.join('; ');
  return cuts;
}
const MUST = /^(필수 갈래가 없다|먼 컷|가까운 컷|그 장수의 물건을 든 컷이 없다|시대가 |상황 노출 컷이 없다|갈래 자유 컷이 없다)/;
function plan(card, slots, old, { seed = Date.now(), required = '', usage = {}, others = [], recent = [] } = {}) {
  /* 씨앗에 카드 · 세계를 섞는다 — 같은 씨앗이면 카드마다 같은 묶음이 나왔다 */
  const mix = [...(card.key + '|' + (card.world || ''))].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const rUse = rng((seed ^ mix ^ 0x5bd1e995) >>> 0), r = rng((seed ^ mix) >>> 0);
  const ci = P.cards(D).indexOf(card.key), oldEx = old.some(c => EXPOSE_TYPES.includes(requiredType(c))), oldIn = old.some(c => requiredType(c) === 'nation');
  /* 정해 둔 두 갈래 중 아직 없는 것을 앞 칸부터 — 노출 갈래는 장수마다 란제리풍 · 수영복 · 역할극을 돌려 가며 */
  const wants = [oldEx ? '' : (required || EXPOSE_TYPES[Math.max(0, ci) % EXPOSE_TYPES.length]), oldIn ? '' : 'nation'].filter(Boolean);
  const needSig = card.g.signature_hold.length > 0 && !old.some(sigProp) && slots.length >= 3;
  /* 칸 몫(2026-11-11 일곱 장) — 정해 둔 칸 뒤로 갈래 자유 · 상황 노출 · 그 장수의 물건 · 옷 자유 차례. 칸이 모자라면(옛 여섯 장 위 일곱째 하나) 갈래 자유만 —
     그때 상황 노출이 없던 옛 묶음은 갈래 자유 컷의 상황이 그 몫(check) */
  const total = slots.length + old.length, room = slots.length - wants.length;
  const needFam = total >= CASUAL_N && room > 0 && !old.some(c => c.ofree && c.ofreeFamily);
  const needSitu = total >= CASUAL_N - 1 && room - (needFam ? 1 : 0) > 0 && !old.some(c => c.situ && !requiredType(c));
  const needOut = total >= CASUAL_N && !old.some(c => c.ofree && !c.ofreeFamily);
  const oldFrames = new Set(old.filter(c => !c.ofree).map(c => c.frame));
  for (let attempt = 1; attempt <= 400; attempt++) {
    let frames = FRAMES.filter(f => !oldFrames.has(f)).sort(() => r() - 0.5);
    if (frames.length < slots.length) frames = frames.concat(FRAMES.slice().sort(() => r() - 0.5)).slice(0, slots.length);
    frames = frames.slice(0, slots.length);
    /* 칸 나누기 — 정해 둔 칸 뒤를 섞어 갈래 자유 → 상황(얼굴 클로즈업 아닌 칸) → 그 장수의 물건 → 옷 자유 */
    const idx = []; for (let i = wants.length; i < slots.length; i++) idx.push(i);
    idx.sort(() => r() - 0.5);
    const famAt = needFam ? idx.shift() : -1;
    let situAt = -1;
    if (needSitu) { const j = idx.findIndex(i => !SITU_NO_FRAME.includes(frames[i])); if (j < 0) continue; situAt = idx.splice(j, 1)[0]; }
    const sigAt = needSig ? (idx.length ? idx.shift() : situAt) : -1;
    const outAt = needOut && idx.length ? idx.shift() : -1;
    const isFreeAt = i => i === famAt || i === outAt;
    const seen = [...old.filter(c => !c.ofree), ...frames.filter((f, i) => !isFreeAt(i)).map(frame => ({ frame }))];
    if (seen.length >= 3 && (!seen.some(c => FAR.includes(c.frame)) || !seen.some(c => NEAR.includes(c.frame)))) continue;
    /* 시대 — 칸마다 먼저 나눠 준다. 이미 있는 컷까지 세어 몫(ERA_QUOTA)에 비해 가장 덜 쓴 시대부터(같으면 무게대로). 자유 설계 칸은 몫 밖(그림자) */
    const ERAS = tree.eras.map(e => e.key), cnt = Object.fromEntries(ERAS.map(e => [e, 0]));
    old.filter(c => !c.ofree).forEach(c => { if (c.era in cnt) cnt[c.era]++; });
    /* 세계 안 갈래 칸은 「세계 안」 시대로 먼저 세고, 나머지 칸에 덜 쓴 시대부터(같으면 무게대로) 나눈 뒤 정해 둔 칸 뒤쪽만 섞는다 */
    if (wants.includes('nation')) cnt.nation++;
    const eras = [];
    for (let i = 0; i < slots.length; i++) {
      if (wants[i] === 'nation') { eras.push('nation'); continue; }
      if (isFreeAt(i)) { eras.push(weighted(r, ERA_WEIGHT)); continue; }
      const ratio = x => cnt[x] / (ERA_QUOTA[x] || 1), lo = Math.min(...ERAS.map(ratio)), e = weighted(r, Object.fromEntries(ERAS.filter(x => ratio(x) === lo).map(x => [x, ERA_WEIGHT[x] || 1])));
      eras.push(e); cnt[e]++;
    }
    { const at = []; for (let i = wants.length; i < slots.length; i++) if (!isFreeAt(i)) at.push(i); const tail = at.map(i => eras[i]).sort(() => r() - 0.5); at.forEach((i, j) => { eras[i] = tail[j]; }); }
    const cuts = [];
    for (let i = 0; i < slots.length; i++) {
      let got = null;
      for (let k = 0; k < 60 && !got; k++) {
        const U0 = usageOf(usage), here = { ...U0, prop: { ...U0.prop }, ofam: { ...U0.ofam } }; cuts.forEach(c => { const u = C2.use(T2, c.use); if (u) here.prop[u.prop] = (here.prop[u.prop] || 0) + 10; here.ofam[c.ofam] = (here.ofam[c.ofam] || 0) + 10; });   /* 묶음 안에서 이미 고른 옷 계열은 다시 덜 고른다(동탄룩 한 장까지) */
        const want = wants[i] || '', sc = slot(r, card, want, { frame: frames[i], wantSig: i === sigAt && !want, era: eras[i], usage: here, rUse });
        if (!sc) continue;
        const cand = { n: slots[i], ...sc };
        if (isFreeAt(i)) { cand.ofree = true; if (i === famAt) cand._fam = true; got = cand; break; }   /* 자유 설계 칸 — 그림자 장면, 규칙 셈 밖 */
        if (i === situAt && !P.situsFor(outfitEn(cand)).length) continue;   /* 상황 칸엔 상황이 붙는 옷만 */
        if (i === situAt) cand.situ = P.situsFor(outfitEn(cand))[0];   /* 자리 표시 — 묶음이 다 차면 situate 가 고른다 */
        if (!check([...cuts, cand], card, old, others).filter(e => !MUST.test(e)).length) got = cand;
      }
      if (!got) break;
      cuts.push(got);
    }
    /* 묶음 규칙(자유 설계 칸 전) → 색 · 데니어 · 상황 · 갈래 자유를 나눈 뒤 다시 한 번 */
    if (cuts.length === slots.length && !check(cuts, card, old, others).filter(e => !/^갈래 자유 컷이 없다|^상황 노출 컷이 없다/.test(e)).length) {
      const real = cuts.filter(c => !c.ofree);
      colorize(real, old, others, rng((seed ^ mix ^ 0x27d4eb2f) >>> 0)); denierize(real, rng((seed ^ mix ^ 0x165667b1) >>> 0)); situate(cuts, situAt, old, others, rng((seed ^ mix ^ 0x3c6ef372) >>> 0)); ambient(cuts, old, rng((seed ^ mix ^ 0x7f4a7c15) >>> 0));
      if (!freeOutfit(cuts, old, rng((seed ^ mix ^ 0x1b873593) >>> 0), others) || check(cuts, card, old, others).length) { cuts.forEach(c => { delete c._fam; }); continue; }
      recentize(cuts, old, recent, card.world || '');
      return { cuts, attempt, required: [...[...old, ...cuts].filter(c => !c.ofree).map(requiredType).filter(Boolean), ...[...old, ...cuts].filter(c => c.situ).map(c => 'situ:' + c.situ), ...[...old, ...cuts].filter(c => c.ofreeFamily).map(c => 'free:' + c.ofreeFamily + '+' + c.ofreeSitu)].join(' · ') };
    }
  }
  throw new Error('규칙을 다 지키는 묶음을 못 찾았다 — 이미 있는 컷이 칸을 너무 많이 차지했는지 본다');
}

/* 기록 — 생성기 「기록 내보내기」 와 같은 꼴(P.casualRecord) + 그 기록이 놓일 자리 */
const recordRel = (key, world, n, style = STYLE) => `records/${key}/${world}-casual${n}.${style}-ui.json`;
function record(card, world, cut) {
  const { n, ...scene } = cut;
  return { ...P.casualRecord(D, S, card.key, scene, { world, style: STYLE, tree, tree2 }, n), record: recordRel(card.key, world, n) };
}
/* 이미 있는 컷 — 그 세계의 기록(<세계>-casualN.<화풍>-ui.json). dir 은 하나 또는 여럿(그림 저장소마다 records/<장수> — 2026-11-12) */
function oldCuts(dirs, card, world) {
  const re = new RegExp('^' + world + '-casual(\\d+)\\.' + STYLE + '-ui\\.json$');
  return dirList(dirs).flatMap(dir => fs.readdirSync(dir).filter(f => re.test(f)).map(f => {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { n: Number(re.exec(f)[1]), ...C2.repair(T2, { ...rec.scene }, card.g), old: true };
  }));
}
/* 등록된 그 세계의 일상컷 번호 */
function registered(card, world) {
  const v = (((JSON.parse(read('data/img.json')).img || {})[card.key] || {}).byStyle || {})[STYLE] || {};
  return (((((v.byForm || {})[world] || {}).casual || {}).f) || []).map(f => Number((/_casual(\d+)\.webp$/.exec(f) || [])[1])).filter(Boolean);
}
function freeSlots(card, world, want = CASUAL_N) {
  const taken = new Set(registered(card, world)), out = [];
  for (let n = 1; taken.size + out.length < want; n++) if (!taken.has(n)) out.push(n);
  return out;
}
/* 쓴 횟수 — 그림 저장소의 모든 장수 기록에서(그 장수는 빼고): 소품(그 장수의 물건은 빼고) · 장소 · 옷 · 자세 추천 · 자세 · 표정. dir 은 하나 또는 여럿(그림 저장소마다) */
function sceneUsage(dirs, skip) {
  const out = EMPTY_USAGE();
  const add = (m, k) => { if (k) m[k] = (m[k] || 0) + 1; };
  for (const dir of dirList(dirs)) for (const k of fs.readdirSync(dir)) {
    if (k === skip || !fs.statSync(path.join(dir, k)).isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(dir, k)).filter(x => /-casual\d+\.[a-z_]+-ui\.json$/.test(x))) {
      let sc; try { sc = JSON.parse(fs.readFileSync(path.join(dir, k, f), 'utf8')).scene; } catch (e) { continue; }
      if (!sc || (sc.ofree && 'ofreeRecent' in sc)) continue;   /* 자유 설계 컷(2026-11-11 꼴)의 장면 값은 그림자 — 그리지 않았다 */
      const u = C2.use(T2, sc.use);
      if (u && u.prop !== 'signature') add(out.prop, u.prop);
      add(out.place, sc.place); add(out.item, sc.item); add(out.preset, sc.preset); add(out.posture, sc.posture); add(out.expr, sc.expr); add(out.ofam, sc.ofam);
      if (sc.preset && sc.place) add(out.path, pathKey(sc.preset, sc.place));
    }
  }
  return out;
}
const propUsage = (dir, skip) => sceneUsage(dir, skip).prop;
function line(c) {
  const p = C2.place(T2, c.place) || {}, f = CT.family(tree, c.ofam) || {}, it = CT.item(tree, c.ofam, c.item), u = C2.use(T2, c.use), pr = by(tree2.presets, c.preset);
  const ko = (list, k) => (by(list, k) || {}).ko || k || '—', hand = k => k === 'prop' ? '소품' : ko(tree2.hands, k);
  return `${c.old ? '  (있음)' : '  '} ${c.n} ${requiredType(c) ? '★' : ' '}${C2.awkward(T2, c.ofam, c.place).length ? '⚠' : ' '} ${(CT.era(tree, c.era) || {}).ko} · ${p.ko} · ${f.ko}${it ? '(' + it.ko + ')' : ''} │ ${pr ? pr.ko : '—'} │ ` +
    `${ko(tree2.postures, c.posture)} · ${c.frame} · ${ko(tree2.body, c.body)} · ${ko(tree2.head, c.head)} · 오른손 ${hand(c.right)} · 왼손 ${hand(c.left)}${u ? ' · ' + ko(tree2.props, u.prop) + ' ' + u.ko : ''}${c.legs ? ' · ' + ko(tree2.legs, c.legs) : ''}${c.gaze ? ' · 시선 ' + ko(tree2.gaze, c.gaze) : ''}${c.situ ? ' · 상황 ' + ko(T.CASUAL.situations, c.situ) : ''}${c.ofree ? (c.ofreeFamily ? ` · 갈래 자유(장면 자유 설계 — ${c.ofreeFamily} + ${c.ofreeSitu === 'free' ? '상황 자유' : '상황 ' + ko(T.CASUAL.situations, c.ofreeSitu)})` : ' · 옷 자유(장면 자유 설계)') : ''}`;
}

const FLAGS = new Set(['fresh']);
function main(argv) {
  const key = argv[0], opt = {};
  for (let i = 1; i < argv.length; i++) { const k = argv[i].replace(/^--/, ''); opt[k] = FLAGS.has(k) ? true : argv[++i]; }   /* --fresh 는 값 없이 */
  let card;
  try { card = cardOf(key); } catch (e) { console.error(e.message + '\n' + fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).join('\n')); return 2; }
  /* 그 장수의 기록 — 받아 둔 그림 저장소 모두(2026-11-12 둘째 저장소 — 옛 기록은 sam-atelier-img, 새 기록은 sam-atelier-img-2) */
  const recDir = opt.records ? [opt.records] : REPOS.recordDirs(key);
  /* 다른 세계의 컷(그리고 --fresh 면 같은 세계의 옛 묶음까지) — 장면을 돌려쓰지 않게 겹침만 본다 */
  const allOld = w => oldCuts(recDir, { ...card, world: w }, w);
  if (opt.check) {
    const world = opt.world; card.world = world;
    if (!card.worlds.includes(world)) { console.error(`${key} 는 ${card.worlds.join(' · ')} 에 산다 — --world 로 하나`); return 2; }
    /* --from N: 옛 묶음 뒤에 더한 새 묶음(N 번부터)만 묶음으로 보고, 옛 묶음은 겹침에만 넣는다 */
    const from = Number(opt.from || 0), all = oldCuts(opt.check, card, world);
    const cuts = all.filter(c => c.n >= from), others = [...all.filter(c => c.n < from), ...card.worlds.filter(w => w !== world).flatMap(w => oldCuts(opt.check, { ...card, world: w }, w))];
    for (const c of cuts.sort((a, b) => a.n - b.n)) console.log(line(c));
    const errs = cuts.length ? check(cuts.map(c => ({ ...c, old: false })), card, [], others) : [`${world} 일상컷 기록이 없다 — 폴더 · --from 을 확인`];
    for (const e of errs) console.log('  X ' + e);
    console.log(errs.length ? `일상컷 묶음 ${errs.length} 가지 걸림` : `일상컷 묶음 통과 — ${cuts.length} 장`);
    return errs.length ? 1 : 0;
  }
  const worlds = opt.world === 'all' ? card.worlds : [opt.world];
  if (!worlds.every(w => card.worlds.includes(w))) { console.error(`${key} 는 ${card.worlds.join(' · ')} 에 산다 — --world 로 하나 또는 all`); return 2; }
  const fresh = 'fresh' in opt, seed0 = Number(opt.seed || Date.now() % 1e9);
  const usageDir = opt.usage === 'none' ? [] : opt.usage ? opt.usage.split(',') : REPOS.recordDirs();
  const extra = (opt.others || '').split(',').filter(Boolean).flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).cuts || []);
  const planned = [];
  for (const world of worlds) {
    card.world = world;
    const mine = allOld(world), taken = Math.max(0, ...mine.map(c => c.n), ...registered(card, world));
    /* --fresh: 옛 묶음은 그대로 두고 그 뒤 번호로 새 여섯 장(사용자 2026-11-02 「대체하는건 아니고, 추가로」) */
    const slots = opt.slots ? opt.slots.split(',').map(Number) : fresh ? Array.from({ length: CASUAL_N }, (_, i) => taken + 1 + i) : freeSlots(card, world);
    if (!slots.length) { console.log(`${key} ${world} — 일상컷이 벌써 ${CASUAL_N} 장이다`); continue; }
    /* (여섯 장을 다 그린 세계면 일곱째 — 갈래 자유 컷 — 하나만 짜인다) */
    const old = fresh ? [] : mine.filter(c => !slots.includes(c.n));
    { const lost = registered(card, world).filter(n => !mine.some(c => c.n === n)); if (lost.length && !fresh) console.log(`  ! ${world} 등록된 일상컷 ${lost.join(',')} 의 기록이 ${recDir.join(' · ') || '그림 저장소 records/' + key} 에 없다 — 그림 저장소를 pull 한 뒤 다시(기록 없이는 필수 갈래 · 자유 설계 칸을 셀 수 없다)`); }
    const others = [...card.worlds.filter(w => w !== world).flatMap(allOld), ...(fresh ? mine : []), ...extra, ...planned];
    const seed = seed0 + worlds.indexOf(world);
    const res = plan(card, slots, old, { seed, required: opt.required || '', usage: sceneUsage(usageDir, key), others, recent: recentScenes(usageDir) });
    planned.push(...res.cuts);
    console.log(`${key} ${world} 일상컷 묶음 — 칸 ${slots.join(',')} · 정해 둔 갈래 ${res.required} · 시도 ${res.attempt} · seed ${seed}${fresh ? ' · 새 묶음(옛 묶음과 겹치지 않게)' : ''}`);
    for (const c of [...old, ...res.cuts].sort((a, b) => a.n - b.n)) console.log(line(c));
    if (opt.out) {
      const out = worlds.length > 1 ? path.join(opt.out, 'plan-' + world) : opt.out;
      fs.mkdirSync(out, { recursive: true });
      for (const c of res.cuts) {
        const rec = record(card, world, c);
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}.${STYLE}-ui.json`), JSON.stringify(rec, null, 1) + '\n');
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}-prompt.txt`), rec.prompt);
      }
      fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify({ card: key, world, seed, tree: 2, style: STYLE, required: res.required, slots, fresh, cuts: res.cuts }, null, 1) + '\n');
      console.log('→ ' + out);
    }
  }
  return 0;
}
module.exports = { ambient, POSE_WEIGHT, cardOf, plan, colorize, denierize, situate, freeOutfit, recentize, recentScenes, sceneEn, blockScene, SITUS, DENIERS, outfitEn, COLORS, check, record, recordRel, oldCuts, freeSlots, registered, requiredType, propUsage, sceneUsage, CASUAL_N, STYLE, WEIGHT_UNUSED, EXPOSE_TYPES };
if (require.main === module) process.exit(main(process.argv.slice(2)));
