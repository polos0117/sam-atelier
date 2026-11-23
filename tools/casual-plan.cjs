#!/usr/bin/env node
/* 일상컷 묶음 계획 — 한 장수의 한 세계 일상컷 일곱 장(2026-11-11 — 11-09 여섯, 전엔 다섯)을 서로 겹치지 않게 한 번에 짠다(2026-11-02, element-atelier 의 tools/casual-plan.cjs 를 삼국지 꼴로 —
   사용자 「일상컷 계획 도구도 옮겨와줘」). 장수는 세계마다 다른 사람이라 **세계마다 일곱 장**(그 세계 그림을 참고 그림으로, IMAGE_RULES 2절).

   생성기(lib/studio.js)와 같은 lib/casual-tree-v2.js · lib/prompt-sam.js 로 칸마다 장면을 고르고, 생성기 「기록 내보내기」 와 같은 꼴의
   기록(<세계>-casualN.<화풍>-ui.json)과 지시문을 쓴다. 지키는 묶음 규칙(한 세계 묶음 안):
     - 세 장은 정해 둔 갈래(사용자 2026-11-02 「각각 1장해서 2장은 확정」 · 2026-11-09 「1번 내용을 필수갈래에 … 필수컷이 3장은 확정」) — 노출 갈래 한 장(란제리풍 · 수영복 · 역할극 의상) +
       세계 안 갈래 한 장(세계 안의 방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 군영 · 정원 · 다리 · 사당 · 숲길 · 나루에서 홈웨어 · 란제리 · 목욕 차림 · 수영복) +
       게임 코스프레 한 장(2026-11-15 — 상황 노출 자리, pickCosplay: data/game-cosplay.json 의 게임 · 재단을 세 공방(삼국 · 원소 · pkm) 쓴 기록을 합쳐 덜 쓴 것부터), 서로 다른 컷. tools/casual-check.py 와 같은 판정.
       상황 노출은 필수에서만 빠졌다 — 일반 컷 하나에 늘(SITU_RATE — 2026-11-16, 전엔 반쯤, situate — 원소와 같게), 갈래 자유 칸엔 그대로. 상황 필수 시절의 옛 묶음(상황 컷이 셋째)은 그대로 맞다
     - 자유 설계 두 장(2026-11-11 사용자 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 … 필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」) —
       옷 자유 컷(ofree) 하나 + 갈래 자유 컷(ofree + ofreeFamily — 필수 노출 갈래 큰 범위 + ofreeSitu 'free' — 상황은 맡은 쪽이 짓는다, 같은 날 「상황도 열어주자. 옷도 이제 큰범위로만 지정해줘」) 하나, 필수 셋과 다른 컷. 지시문은 장면 줄 대신 자유 설계 덩어리(lib/prompt-spec.js FREE_DESIGN),
       최근 장면(ofreeRecent — 그림 저장소 기록의 최근 여덟 + 같은 묶음의 다른 컷)을 피하라고 적는다. 칸의 장면 값은 트리에 맞는 그림자 — 그리지 않고 묶음 규칙 · 겹침 · 쓴 횟수 셈에서도 뺀다
     - 장소는 서로 다르게, 장소 묶음은 두 번까지 · 의상 계열은 겹치지 않게(평상복만 두 번) · 시대는 한 가지 두 번까지, 네 장 이상이면 네 시대(지금 현실 · 역사의 자리 · 세계 안 · 무대·환상) 다
     - 자세 추천은 서로 다르게 · 프레이밍은 서로 다르게(먼 컷 · 가까운 컷 하나씩은 꼭) · 몸 방향 한 가지는 두 번까지 · 머리 「어깨 너머」 는 한 장까지
     - 소품은 칸마다 다르게 · 그 장수의 물건(설계표 hold, 없으면 역할의 것)을 든 컷은 한두 장 · 마실 것은 한 장까지 · ⚠ 어색한 조합은 한 장까지
     - 장수 사이에서도 안 쓴 트리 쪽 먼저: 그림 저장소 기록(--usage, 기본 옆의 그림 저장소 모두의 records — sam-atelier-img · sam-atelier-img-2, tools/img-repos.cjs)에서 장소 · 옷 계열 · 옷 · 자세 추천 · 자세 · 길(자세 추천 × 장소) · 소품을 센다(표정은 은은한 열일곱에서 고르게 — 2026-11-03) —
       한 번도 안 쓴 값은 무게 12, 쓴 값은 1/(1+횟수)³(2026-11-02 「가중치 올려줘」 — 전엔 4 와 ²)
   이미 그림이 있는 번호는 짜지 않고, 그 세계의 기록(--records)은 겹침 검사에만 쓴다.

     node tools/casual-plan.cjs <장수> --world <세계> [--style <화풍>] [--slots 1,2,3] [--records <그림 저장소>/records/<장수>] [--seed N] [--out <폴더>] [--usage <폴더>|none] [--cosplay-usage <폴더>,…|none]
   --slots 를 안 주면 그 세계에 등록된 것(data/img.json)을 빼고 일곱 장이 되게(여섯 장을 다 그린 세계는 일곱째 — 갈래 자유 컷 — 하나만) — 번호는 세계마다 따로, 비어 있는 가장 작은 것부터.
   --records 를 안 주면 옆의 그림 저장소 모두의 records/<장수>(2026-11-12 둘째 저장소 sam-atelier-img-2 — 한 장수의 기록이 두 저장소에 나뉠 수 있다). --out 을 주면 칸마다 기록 · 지시문과 plan.json 을 쓴다.
   --usage 는 쉼표로 여럿을 줄 수 있다. --cosplay-usage 는 게임 코스프레 쓴 기록 · 계획의 예약을 읽을 records 폴더들(기본 옆의 세 공방 그림 저장소 모두 — COSPLAY_REPOS).
     node tools/casual-plan.cjs <장수> --recosplay <계획 파일> [--out <폴더>] [--seed N] [--style <화풍>]   # 옛 계획의 아직 안 그린 게임 코스프레 칸만 새 규칙으로(2026-11-16)
     node tools/casual-plan.cjs --recosplay-list                                                       # 계획은 있는데 아직 안 그린 pick 칸(카드 · 세계 · 번호)
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
const GC = JSON.parse(read('data/game-cosplay.json')); ctx.window.AtelierGameCosplay = GC;   /* 게임 코스프레 목록(2026-11-15) — 조립부가 window.AtelierGameCosplay 로 읽는다 */
/* 게임 코스프레 사본이 원본(옆 game-atelier)과 다르면 알린다 — 게임을 더하고 sync 를 깜빡한 때(2026-11-16 사용자 「게임공방에 게임 자료를 늘리면 … 게임코스튬 갈래도 더 추가되게」) */
if (require.main === module) { try { const gcSrc = path.join(ROOT, '..', 'game-atelier', 'data', 'game-cosplay.json'), gcMine = path.join(ROOT, 'data', 'game-cosplay.json');
  if (fs.existsSync(gcSrc) && fs.existsSync(gcMine) && fs.readFileSync(gcSrc, 'utf8') !== fs.readFileSync(gcMine, 'utf8')) console.warn('경고: data/game-cosplay.json 이 게임공방 원본과 다르다(사본이 옛것) — 게임공방에서 node tools/game-cosplay.cjs sync 하고 이 저장소에서 커밋한다'); } catch (e) { /* 읽기 실패는 계획을 막지 않는다 */ } }
/* --style <화풍> — 그 화풍의 등록 · 기록으로 빈 번호를 센다(2026-11-09 2.5 API 판 api25 — 기본 화풍 그림과 따로). 모듈로 불리면 늘 기본 화풍 */
const ARG_STYLE = require.main === module && process.argv.indexOf('--style') > 0 ? process.argv[process.argv.indexOf('--style') + 1] : '';
if (ARG_STYLE && !S.styles[ARG_STYLE]) { console.error('화풍이 없다: ' + ARG_STYLE); process.exit(2); }
const T2 = C2.make(tree2, tree), STYLE = ARG_STYLE || S['default'], CASUAL_N = 7;   /* 사용자 2026-11-11 「한 장 더 생성하게 해서 필수갈래 또는 상황 노출을 더 그리게 추가해줘. 그럼 일상컷은 총 7장 되는거야」 — 11-09 「6장으로」, 전엔 다섯 */

const EXPOSE_TYPES = ['lingerie', 'swimwear', 'roleplay'];   /* 노출 갈래 — 장수마다 돌려 가며 */
const FAR = ['full_body', 'environmental'], NEAR = ['waist_up', 'chest_up', 'face_close'];   /* 2026-11-23 허리 위도 가까운 컷(사용자 「클로즈업을 가슴 위 아니면 허리 위까지해서 같이 묶는」) — 얼굴 클로즈업 여섯에 몰려 쉿 · 브이가 자주 나왔다 */
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
/* 상황 노출은 필수에서 빠졌다(2026-11-15) — 일반 컷(필수 · 자유 설계 · 그 장수의 물건 칸이 아닌 컷) 하나에 반쯤(원소 공방과 같은 값) */
const SITU_RATE = 1;   /* 2026-11-16 사용자 「늘 1장은 나오게 맞춰줘」 — 반쯤(0.5)에서 늘. 맞는 옷의 일반 컷이 없으면 건너뛴다 */

/* ══ 게임 코스프레(2026-11-15 사용자 「pkm,원소,삼국지 공방에 갈래 하나 추가해서 게임공방에 있는 게임 코스프레 의상은 어떨까?」 — 필수 셋째, 상황 노출 자리) ══
   목록 data/game-cosplay.json(원본 game-atelier). 「캐릭터 + 재단」 묶음이 한 단위, 쓴 기록은 세 공방(삼국 · 원소 · pkm)을 합쳐 센다:
     1. 게임 — 게임은 남은 인원의 제곱근 무게로 무작위(2026-11-15 「케릭터 수 많은 게임일수록 더 많이 선택되게」 → B — 처음엔 LoL 약 19% · 주인공 하나 게임 각 약 1.5%), 다 찬 게임은 빠진다
     2. 주인공 하나 게임(many: false) — 그 주인공이 아직 안 입은 재단 하나(text.fixed). 열하나를 다 쓰면 그 게임은 빠진다
     3. 등장인물 많은 게임 1회차(목록 characters 가운데 아직 안 쓰고 예약도 안 된 캐릭터가 남았다) — 계획기가 그 가운데 하나를 무작위로 정한다(여자 캐릭터 무게 2 · 남자 1 — 남자는 크로스플레이),
        재단은 그 게임에서 덜 쓴 것(text.assigned). 2026-11-16 사용자 「삼국지 공방에서만 벌써 오버워치 메르시가 4케릭터안에서 2번이나 나왔어」 → 「응 그래」 — 전엔 캐릭터를 그리는 쪽(GPT)이
        골랐고(text.pick, 계획엔 빈 칸) 미리 짠 다른 계획끼리 서로 못 봐 「already used: none yet」 으로 유명한 캐릭터를 되풀이했다. pick 칸은 새 계획에서 안 쓴다 — 옛 계획(아직 안 그린 것)을 위해 조립 · 묶음 안내 · api-draw 의 pick 처리는 남긴다
     4. 2회차(목록 캐릭터를 다 쓰거나 예약했다) — 쓴 캐릭터 중 덜 쓴 하나와 그 캐릭터가 아직 안 입은 재단(text.again). 모든 캐릭터 × 재단이 차면 그 게임은 빠진다
   장면 칸 scene.cosplay = { game, character, cut, round(, used, again — 옛 pick 칸만) }, 그린 뒤 기록 generation.cosplay = { game, character, cut }.
   쓴 것(cosplayUsage) = 그린 기록 + 예약 — 옆 그림 저장소 모두의 records 에서 generation.cosplay(없으면 scene.cosplay 의 character 가 찬 것), 더해 아직 안 그린 계획 파일의 cosplay
     (삼국 · 원소 <세계>-casual-plan.json · *-replan.json 꼴 — card · world · style · cuts[].n, pkm 예약 records/casual-reservations/*.json 과 장부 casual-ledger.json 의 reserved).
     같은 컷(카드 · 세계 · 화풍 · 번호, pkm 은 종 폴더 · 번호)에 그린 기록이 있으면 계획은 안 센다. 같은 컷의 계획 파일이 여럿이면 가장 늦게 고친 것 하나.
   옛 계획 다시 짜기(--recosplay <계획 파일>) — 그 계획의 아직 안 그린 코스프레 칸만 새 규칙으로(장소가 받는 재단만 — 물가면 수영복 재단), 그 칸 지시문 · 계획 파일을 다시 쓴다.
   --recosplay-list — 그림 저장소에서 계획은 있는데 아직 안 그린 pick 칸(캐릭터 빈 칸)이 있는 카드 · 세계 · 번호를 찍는다(다시 짜기는 사용자가 정한다).
   세 공방이 같은 꼴 — 함수 이름 cosplayUsage · pickCosplay · cosplayAgain, 칸 이름 scene.cosplay · generation.cosplay(원소 53b1956 과 맞췄다) */
const COSPLAY = tree.cosplay || {}, COS_FAM = COSPLAY.outfit || 'game_cosplay', COS_NO_FRAMES = (tree.costume_required || {}).not_frames || ['face_close'];
/* 쓴 것은 이 공방 그림 저장소만 읽는다(2026-11-16 사용자 「공방별로 따로 두는건?」 → 「응 그렇게 진행해줘」 — 일상컷을 그리는 세션은 자기 그림 저장소를 늘 받아 둔다.
   다른 공방과는 같은 캐릭터가 나올 수 있다 · 전엔 세 공방 합쳐 읽었는데 없는 저장소를 조용히 건너뛰어 다른 세션에선 못 막았다). 저장소가 없으면 멈춘다 — cosplayReposOk */
const COSPLAY_REPOS = ['sam-atelier-img', 'sam-atelier-img-2', 'sam-atelier-img-3'];
const cosplayDirs = () => COSPLAY_REPOS.map(r => path.join(ROOT, '..', r, 'records')).filter(d => fs.existsSync(d));
/* 이 공방 그림 저장소가 다 있나 — 없으면 쓴 것을 몰라 같은 캐릭터가 겹친다. 계획을 짜기 전에 부른다(--cosplay-usage 를 주면 그 폴더를 믿는다) */
function cosplayReposOk(opt = {}) {
  if (opt['cosplay-usage']) return true;
  const miss = COSPLAY_REPOS.filter(r => !fs.existsSync(path.join(ROOT, '..', r, 'records')));
  if (miss.length) throw new Error('게임 코스프레 — 이 공방 그림 저장소가 없다: ' + miss.join(' · ') + ' — 옆 폴더에 받은 뒤 다시(쓴 캐릭터를 몰라 겹친다). 일부러 비우려면 --cosplay-usage none');
  return true;
}
const normName = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const emptyCosplay = () => ({ games: {}, cuts: {} });
/* 쓴 기록 줄 하나 — generation.cosplay, 없으면 scene.cosplay 의 character 가 찬 것. 재단은 옷(gc_<재단>)이 이긴다 */
function cosplayRow(r) {
  const filled = x => x && x.game && String(x.character || '').trim();
  const g = (r.generation || {}).cosplay, s = (r.scene || {}).cosplay, x = filled(g) ? g : filled(s) ? s : null;
  return x ? { game: x.game, character: String(x.character).trim(), cut: x.cut || String((r.scene || {}).item || '').replace(/^gc_/, '') } : null;
}
/* 컷 열쇠 — 카드 · 세계 · 화풍 · 번호(2026-11-16 — 그린 기록과 계획의 예약을 한 번만 센다). 기록은 파일 자리에서:
   삼국 · 원소 records/<카드>/<세계>-casualN.<화풍>-ui.json, pkm records/<종 폴더>/casualN-ui.json(세계 · 화풍 없이) */
const REC_RX = /^(.+?)-casual(\d+)\.([a-z0-9_]+)-ui\.json$/, PKM_REC_RX = /^casual(\d+)(?:\.([a-z0-9_]+))?-ui\.json$/;
const cutKey = (card, world, style, n) => [card || '', world || '', style || '', Number(n) || 0].join('|');
const anyStyle = k => { const p = k.split('|'); return [p[0], p[1], p[3]].join('|'); };
function recordKeyOf(f) {
  const b = path.basename(f), card = path.basename(path.dirname(f));
  let m = REC_RX.exec(b); if (m) return cutKey(card, m[1], m[3], m[2]);
  m = PKM_REC_RX.exec(b); if (m) return cutKey(card, '', m[2] || '', m[1]);
  return '';
}
/* 계획 · 예약 파일 하나 → 캐릭터가 찬 코스프레 칸 [{ card, world, style, n, game, character, cut }] — 삼국 · 원소 계획(card · world · style · cuts[].n),
   pkm 예약(characters[].species · cuts[].cut), pkm 장부(entries[] 의 status reserved). 1회차 pick(캐릭터 빈 칸)은 예약이 아니다 */
function planCosplay(doc) {
  const out = [], add = (card, world, style, n, c) => {
    const cs = c && c.cosplay; if (!cs || !cs.game || !String(cs.character || '').trim()) return;
    out.push({ card: card || '', world: world || '', style: style || '', n: Number(n) || 0, game: cs.game, character: String(cs.character).trim(), cut: cs.cut || String(c.item || '').replace(/^gc_/, '') });
  };
  if (!doc || typeof doc !== 'object') return out;
  if (doc.card && Array.isArray(doc.cuts)) doc.cuts.forEach(c => add(doc.card, doc.world, doc.style, c.n, c));
  if (Array.isArray(doc.characters)) doc.characters.forEach(ch => (ch.cuts || []).forEach(c => add(ch.species || ch.card, '', '', c.cut || c.n, c)));
  if (Array.isArray(doc.entries)) doc.entries.filter(e => e && e.status === 'reserved').forEach(e => (e.cuts || []).forEach(c => add(e.species || e.card, '', '', c.cut || c.n, c)));
  return out;
}
/* 세 공방 그림 저장소의 records 에서 쓴 게임 코스프레 — 줄 목록 [{ game, character, cut, at(, card, world, style, n, reserved) }]. dirs 는 records 폴더 하나 또는 여럿(기본 cosplayDirs).
   기록 꼴이 공방마다 달라 records 아래를 다 훑는다(깊이 넷). 원소 · pkm 과 같은 이름 · 같은 꼴(2026-11-15).
   2026-11-16 — 그린 기록 + 아직 안 그린 계획의 예약(planCosplay, reserved: true). 그린 기록이 있는 컷의 계획은 안 센다(코스프레가 없는 기록이어도 — 그 컷은 이미 그렸다) */
function cosplayUsage(dirs) {
  const out = [], seen = new Set(), drawn = new Set(), drawnAny = new Set(), plans = new Map();
  const walk = (d, depth) => {
    let names; try { names = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const e of names) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { if (depth < 4) walk(f, depth + 1); continue; }
      if (!/\.json$/.test(e.name)) continue;
      const rk = recordKeyOf(f); if (rk) { drawn.add(rk); drawnAny.add(anyStyle(rk)); }
      let t; try { t = fs.readFileSync(f, 'utf8'); } catch (er) { continue; }
      if (t.indexOf('"cosplay"') < 0) continue;   /* 먼저 글로 거른다 — 세 공방 기록이 만 장이 넘는다 */
      let r; try { r = JSON.parse(t); } catch (er) { continue; }
      const at = path.relative(path.join(ROOT, '..'), f);
      if (rk || r.scene || r.generation) {   /* 그린 기록 */
        const row = cosplayRow(r); if (!row) continue;
        const k = rk || [r.card || '', r.world || '', r.slot || r.file || f].join('|');   /* 같은 그림의 기록이 두 곳에 있어도 한 번 */
        if (seen.has(k)) continue; seen.add(k);
        out.push({ ...row, at });
        continue;
      }
      let mt = 0; try { mt = fs.statSync(f).mtimeMs; } catch (er) { /* 없음 */ }
      for (const p of planCosplay(r)) {   /* 계획 · 예약 — 같은 컷은 가장 늦게 고친 파일 하나 */
        const k = cutKey(p.card, p.world, p.style, p.n), prev = plans.get(k);
        if (!prev || mt >= prev.mt) plans.set(k, { ...p, at, mt });
      }
    }
  };
  for (const d of [].concat(dirs == null ? cosplayDirs() : dirs).filter(x => x && fs.existsSync(x))) walk(d, 0);
  for (const [k, p] of plans) {
    if (drawn.has(k) || (!p.style && drawnAny.has(anyStyle(k)))) continue;   /* 그린 컷 — 기록이 센다 */
    const { mt, ...row } = p; out.push({ ...row, reserved: true });
  }
  return out;
}
/* 쓴 줄 → 게임마다 { n, cuts: {재단: 수}, chars: {이름: { name, cuts: {재단: 수} }} } + 재단마다 세 공방 통틀어 수. character 가 빈 줄(이번에 짠 1회차)은 게임 · 재단 수만 */
function cosplayTally(used) {
  const U = emptyCosplay();
  for (const x of used || []) {
    if (!x || !x.game) continue;
    const g = U.games[x.game] || (U.games[x.game] = { n: 0, cuts: {}, chars: {} });
    g.n++; if (x.cut) { g.cuts[x.cut] = (g.cuts[x.cut] || 0) + 1; U.cuts[x.cut] = (U.cuts[x.cut] || 0) + 1; }
    /* 주인공 하나 게임은 기록 이름이 달라도(「Geralt」 · 「Geralt of Rivia」) 그 주인공으로 센다 — 같은 재단 되풀이 막기(2026-11-16, pkm · 원소와 같게) */
    const gm = GC.games.find(gg => gg.key === x.game), fix = gm && !gm.many && String(x.character || '').trim();
    const ak = gm && gm.many ? (gm.characters || []).find(c => (c.aka || []).some(a => normName(a) === normName(x.character))) : null;   /* 다른 표기(aka — 2026-11-17)는 그 캐릭터 이름으로 */
    const nk = fix ? normName(gm.character) : normName(ak ? ak.name : x.character);
    if (nk) { const ch = g.chars[nk] || (g.chars[nk] = { name: fix ? gm.character : ak ? ak.name : String(x.character).trim(), cuts: {} }); if (x.cut) ch.cuts[x.cut] = (ch.cuts[x.cut] || 0) + 1; }
  }
  return U;
}
const EMPTY_TALLY = () => ({ n: 0, cuts: {}, chars: {} });
const leastOf = (rnd, list, score) => { const min = Math.min(...list.map(score)), pool = list.filter(k => score(k) === min); return pool[Math.floor(rnd() * pool.length)]; };
/* 2회차 — 쓴 캐릭터 중 덜 입은 하나 + 그 캐릭터가 아직 안 입은 재단(cutOk 를 지키는 것, prefer 가 되면 그것). 고를 것이 없으면 null. tg 는 cosplayTally 의 게임 하나 */
function cosplayAgain(tg, rnd = Math.random, cutOk = () => true, prefer = '', U = emptyCosplay()) {
  const cuts = GC.cuts.map(c => c.key), wc = ch => Object.keys(ch.cuts).length;
  const open = Object.values((tg || EMPTY_TALLY()).chars).map(ch => ({ ch, cuts: cuts.filter(k => !ch.cuts[k] && cutOk(k)) })).filter(x => x.cuts.length).sort((a, b) => a.ch.name.localeCompare(b.ch.name));
  if (!open.length) return null;
  const nm = leastOf(rnd, open.map(x => x.ch.name), n => wc(open.find(x => x.ch.name === n).ch)), x = open.find(o => o.ch.name === nm);
  const cutScore = k => (((tg || {}).cuts || {})[k] || 0) * 1000 + (U.cuts[k] || 0);
  return { character: nm, cut: x.cuts.includes(prefer) ? prefer : leastOf(rnd, x.cuts, cutScore) };
}
/* 한 칸의 코스프레 — used(쓴 줄 목록, cosplayUsage + 이번에 짠 것), rnd(난수). 돌려주는 것 { game, character, cut, round(, used) } — 다 찬 목록이면 null.
   1회차의 2회차 몫(again)은 장소가 정해진 뒤 withAgain 이 단다 */
/* 게임 고르기 무게(2026-11-15 사용자 「케릭터 수 많은 게임일수록 더 많이 선택되게 해줘」 → 「B로해줘」) — 남은 인원의 제곱근으로 무게를 둔 무작위.
   주인공 하나 게임은 1(남은 재단 비율), 등장인물 많은 게임은 1회차 √(roster − 쓴 캐릭터 수), 2회차 √(남은 「캐릭터 + 재단」 / 재단 수). 처음엔 LoL 약 19% · 주인공 하나 게임 각 약 1.5% */
/* 등장인물 많은 게임의 목록 캐릭터 가운데 아직 안 쓰고 예약도 안 된 것(2026-11-16 — 이름은 normName 으로 견준다) */
const freshChars = (gm, g) => (gm.characters || []).filter(ch => !((g || {}).chars || {})[normName(ch.name)]);
function cosplayWeight(gm, g, cuts) {
  const chars = Object.values((g || {}).chars || {}), N = cuts.length;
  if (!gm.many) { const w = ((g && g.chars || {})[normName(gm.character)] || { cuts: {} }).cuts; return Math.sqrt(cuts.filter(k => !w[k]).length / N); }
  if ((gm.characters || []).length) { const f = freshChars(gm, g).length; if (f) return Math.sqrt(f); }   /* 1회차 — 남은 목록 캐릭터 수 */
  else if (chars.length < gm.roster) return Math.sqrt(gm.roster - chars.length);   /* 목록 없는 옛 꼴 */
  const open = chars.reduce((s, ch) => s + cuts.filter(k => !ch.cuts[k]).length, 0); return Math.sqrt(open / N);
}
const pickWeighted = (list, w, rnd) => { const ws = list.map(w), sum = ws.reduce((a, b) => a + b, 0); let x = rnd() * sum; for (let i = 0; i < list.length; i++) { x -= ws[i]; if (x < 0) return list[i]; } return list[list.length - 1]; };
/* 캐릭터 무게 — 여자 2 · 남자 1(남자 캐릭터는 크로스플레이, 2026-11-16) */
const CHAR_WEIGHT = { female: 2, male: 1 };
/* cutOk — 고를 수 있는 재단(옛 계획 다시 짜기에서 그 장소가 받는 재단만 — 물가면 수영복 재단). 기본은 열하나 다 */
function pickCosplay(used, rnd = Math.random, cutOk = () => true) {
  const U = cosplayTally(used), cuts = GC.cuts.map(c => c.key).filter(k => cutOk(k)), opts = [];
  if (!cuts.length) return null;
  for (const gm of GC.games) {
    const g = U.games[gm.key] || EMPTY_TALLY();
    if (!gm.many) { const w = ((g.chars || {})[normName(gm.character)] || { cuts: {} }).cuts, free = cuts.filter(k => !w[k]); if (free.length) opts.push({ gm, g, free }); continue; }
    const names = Object.values(g.chars || {});
    if ((gm.characters || []).length) { const fresh = freshChars(gm, g); if (fresh.length) { opts.push({ gm, g, round: 1, fresh }); continue; } }   /* 1회차 — 계획기가 캐릭터를 정한다 */
    else if (names.length < gm.roster) { opts.push({ gm, g, round: 1, names }); continue; }   /* 목록 없는 옛 꼴 — 그리는 쪽이 고른다(pick) */
    if (names.some(ch => cuts.some(k => !ch.cuts[k]))) opts.push({ gm, g, round: 2 });
  }
  if (!opts.length) return null;
  const o = pickWeighted(opts, x => cosplayWeight(x.gm, x.g, cuts), rnd);   /* 남은 인원이 많은 게임일수록 자주(cosplayWeight) */
  const cutScore = k => (o.g.cuts[k] || 0) * 1000 + (U.cuts[k] || 0);   /* 그 게임에서 덜 쓴 재단 → 세 공방 통틀어 덜 쓴 재단 */
  if (!o.gm.many) return { game: o.gm.key, character: o.gm.character, cut: leastOf(rnd, o.free, cutScore), round: 1 };
  if (o.round === 1 && o.fresh) { const ch = pickWeighted(o.fresh, x => x.female ? CHAR_WEIGHT.female : CHAR_WEIGHT.male, rnd); return { game: o.gm.key, character: ch.name, cut: leastOf(rnd, cuts, cutScore), round: 1 }; }
  if (o.round === 1) return { game: o.gm.key, character: '', cut: leastOf(rnd, cuts, cutScore), round: 1, used: o.names.map(ch => ch.name).sort((a, b) => a.localeCompare(b)) };
  const a = cosplayAgain(o.g, rnd, k => cutOk(k), '', U);
  return { game: o.gm.key, character: a.character, cut: a.cut, round: 2 };
}
/* 재단이 그 장소에 서나 — 물가(swim_places)엔 수영복 재단만, 수영복 재단은 어디든 */
const cosCutOk = (cut, place) => !(COSPLAY.swim_places || []).includes(place) || (COSPLAY.swim_cuts || []).includes(cut);
/* 장소가 정해진 뒤 — 1회차(pick) 칸에 2회차 몫(again = { character, cut })을 단다(쓴 캐릭터가 있을 때만). 그리는 쪽이 더 고를 캐릭터가 없다고 하면 이것을 그린다(<세계>-casualN-again-prompt.txt) */
function withAgain(cos, used, place, rnd = Math.random) {
  if (!cos || cos.character || !(cos.used || []).length) return cos;
  const U = cosplayTally(used), a = cosplayAgain(U.games[cos.game], rnd, k => cosCutOk(k, place), cos.cut, U);
  return a ? { ...cos, again: a } : cos;
}
const againScene = sc => P.cosplayAgainScene(sc);
/* 게임 코스프레 컷이 설 수 있는 시대 · 장소(표 cosplay — 코스프레 행사 · 거실 · 침실 · 화보 스튜디오 · 별빛 무대 · 오락실, 비키니 · 원피스 수영복 재단이면 물가도) */
const COS_PATHS = new Map();
function cosplayPaths(cut) {
  const swim = (COSPLAY.swim_cuts || []).includes(cut), k = swim ? 'swim' : 'dry';
  if (COS_PATHS.has(k)) return COS_PATHS.get(k);
  const out = [];
  for (const place of [...(COSPLAY.places || []), ...(swim ? COSPLAY.swim_places || [] : [])]) {
    const p = C2.place(T2, place); if (!p) continue;
    for (const era of p.eras || []) if (C2.choices(T2, { era, place }, 'ofam', null).includes(COS_FAM)) out.push({ era, place, ofam: COS_FAM });
  }
  COS_PATHS.set(k, out);
  return out;
}

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
  if (sc.ofam === COS_FAM) return 'cosplay';   /* 게임 코스프레(2026-11-15) */
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
const POSE_WEIGHT = 0.4, ACT_MOST = 2;
/* 어색한 조합(⚠ — 표 awkward: 수영복으로 작업 자리, 휴양지 차림으로 현장 …)인 의상 계열은 덜 고른다(2026-11-13 — 새 장소 · 새 계열이 새 모순이 되지 않게). 묶음마다 한 장까지는 여전히 된다 */
const AWKWARD_WEIGHT = 0.15;
const wOf = n => n ? 1 / Math.pow(1 + n, 3) : WEIGHT_UNUSED;
/* 자세 · 몸 방향 · 카메라 높이 짝(2026-11-18 사용자 C) — 셋을 따로 세면 고르게 퍼져도 「서서 · 정면 · 눈높이」 짝이 34% 로 몰렸다. 짝 횟수(전체 기록 + 묶음)로 덜고, 그 짝은 반으로 */
const comboKey = c => [c.posture || '', c.body || '', c.camera || ''].join('|');
const standFrontEye = c => c.posture === 'stand' && (c.body === 'front' || c.body === 'front_3q') && c.camera === 'eye';
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
/* 소품 동작 무게(2026-11-18 행동 단계 — 사용자 「F부터 진행해줘」) — 덜 쓴 소품(제곱) × 덜 쓴 동작. 준비 · 하는 중 · 마무리 단계 동작(stage)은 조금 더,
   단계 없이 그냥 들고 있는 동작(hold)은 조금 덜 — 소품이 달라도 늘 「들고 서 있기」 로 보였다 */
function useWeight(k, n, U) { const u = C2.use(T2, k); return 1 / Math.pow(1 + n(u.prop), 2) / (1 + ((((U && U.use) || {})[k]) || 0)) * (u.stage ? 1.3 : u.kind === 'hold' ? 0.8 : 1); }
const EMPTY_USAGE = () => ({ prop: {}, use: {}, place: {}, item: {}, preset: {}, posture: {}, expr: {}, ofam: {}, path: {}, time: {}, light: {}, weather: {}, combo: {}, moment: {} });
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
function slot(r, card, reqType, { frame = '', wantSig = false, era: wantEra = '', usage = {}, rUse = r, cos = null , once = false } = {}) {
  const g = card.g, U = usageOf(usage);
  let sc;
  if (reqType === 'cosplay') { if (!cos) return null; const paths = cosplayPaths(cos.cut).filter(x => !wantEra || x.era === wantEra); if (!paths.length) return null; sc = { ...lean(r, paths, U.place, x => x.place) }; }
  else if (reqType) { const paths = requiredPaths(reqType).filter(x => !wantEra || x.era === wantEra); if (!paths.length) return null; sc = { ...lean(r, paths, U.place, x => x.place, famW) }; }
  else {
    const era = wantEra || weighted(r, ERA_WEIGHT), place = lean(r, C2.choices(T2, { era }, 'place', g), U.place);
    if (!place) return null;
    /* 게임 코스프레 계열은 그 필수 칸에서만(2026-11-15 — 게임 · 재단은 pickCosplay 가 정한다) */
    sc = { era, place, ofam: lean(r, C2.choices(T2, { era, place }, 'ofam', null).filter(f => f !== COS_FAM), U.ofam, x => x, f => famW(f) * (C2.awkward(T2, f, place).length ? AWKWARD_WEIGHT : 1)) };
    if (!sc.ofam) return null;
  }
  sc.treeV = 2; sc.prop = wantSig ? '0' : '';
  const presets = presetsAt(sc, g).filter(p => (!frame || p.frame === frame) && (!wantSig || p.prop_kind) && !(once && C2.presetOnce && C2.presetOnce(T2, p.key)));   /* 한 장까지 추천(표 preset_once)은 이미 쓴 캐릭터면 뺀다 — 2026-11-23 */
  if (!presets.length) return null;
  const rp = list => pick(r, list);
  /* 자세 추천 — 그 추천과 그 자세의 횟수를 함께(선 자세가 절반이 넘었다 — 2026-11-01 기록 434장) */
  const pw = presets.map(p => Math.pow(2, -(C2.presetBias ? C2.presetBias(T2, p.key) : 0)) * wOf(U.preset[p.key] || 0) * Math.sqrt(wOf(U.posture[p.posture] || 0)) * wOf(U.path[pathKey(p.key, sc.place)] || 0) * (p.pose ? POSE_WEIGHT : 1) * Math.sqrt(wOf((U.combo || {})[comboKey(p)] || 0)) * (standFrontEye(p) ? 0.5 : 1));
  let px = r() * pw.reduce((a, b) => a + b, 0), chosen = presets[presets.length - 1];
  for (let i = 0; i < presets.length; i++) { px -= pw[i]; if (px < 0) { chosen = presets[i]; break; } }
  sc = C2.repair(T2, C2.applyPreset(T2, sc, chosen.key), g, rp);
  if (wantSig) {
    const sig = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop === 'signature');
    if (!sig.length) return null;
    sc = { ...sc, use: pick(r, sig) };
  }
  const items = C2.choices(T2, sc, 'item', g);
  if (reqType === 'cosplay') { if (!items.includes('gc_' + cos.cut)) return null; sc.item = 'gc_' + cos.cut; sc.cosplay = { ...cos }; }   /* 재단 = 옷(gc_<재단>) */
  else { const pool = C2.classLean ? C2.classLean(T2, sc.ofam, items, k => (U.item || {})[k] || 0) : items; sc.item = pool.length ? lean(r, pool, U.item) : ''; }   /* 실루엣 갈래 — 덜 쓴 갈래의 옷 먼저(공용 모듈 classLean, 2026-11-23) */
  sc = C2.repair(T2, sc, g, rp);
  if (reqType === 'cosplay' && sc.item !== 'gc_' + cos.cut) return null;
  if (!wantSig && sc.use && !sigProp(sc)) {
    const alt = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop !== 'signature');
    if (alt.length > 1) {
      const n = p => DRINKS.includes(p) ? DRINKS.reduce((a, d) => a + (U.prop[d] || 0), 0) : (U.prop[p] || 0);
      const u = weighted(rUse, Object.fromEntries(alt.map(k => [k, useWeight(k, n, U)])));
      const next = C2.set(T2, sc, 'use', u, g, rp);
      if (next.use === u) sc = next;
    }
  }
  if (wantSig && !sigProp(sc)) return null;
  const body = by(tree2.body, sc.body), head = by(tree2.head, sc.head);
  sc.expr = body && body.face_hidden && !(head && head.look_back) ? '' : pick(r, EXPRS);   /* 표정은 고르게 — 덜 쓴 쪽 무게(lean)를 걸면 덜 쓴 극단 표정으로 쏠렸다(2026-11-03) */
  sc.axes = { ...FIXED_AXES }; sc.aspect = '2:3'; sc.unlocked = [];
  if (reqType === 'cosplay') sc.cosplay = { ...cos };
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
  /* 하는 일 갈래(표 presets[].act — 이동 · 야영 · 손보기 · 집안일 · 채비 · 살피기 · 걷기 · 쉬기 · 먹고 마시기 · 카메라용 몸짓)는 묶음에 두 장까지(2026-11-13 — 한 사람의 묶음이 한 갈래로 몰리지 않게) */
  over('하는 일 갈래', c => (by(tree2.presets, c.preset) || {}).act, ACT_MOST);
  over('몸 방향', c => c.body, 2);
  over('머리 어깨 너머', c => (by(tree2.head, c.head) || {}).look_back && 'over_shoulder', 1);
  over('소품', c => { const u = C2.use(T2, c.use); return u && u.prop; }, 1);
  over('마실 것', c => { const u = C2.use(T2, c.use); return u && DRINKS.includes(u.prop) && 'drink'; }, 1);
  over('그 장수의 물건', c => sigProp(c) && 'signature', 2);
  over('어색한 조합', c => C2.awkward(T2, c.ofam, c.place).length && 'awkward', 1);
  over('동탄룩', c => c.ofam === 'dongtan' && 'dongtan', 1);
  /* 셋째 필수 — 상황 노출 한 장(여섯 장 묶음부터 — 옛 다섯 장 묶음은 이 갈래 전), 노출 · 세계 안 갈래 컷과 다른 컷 */
  over('상황 노출', c => c.situ && 'situ', 1);
  over('게임 코스프레', c => requiredType(c) === 'cosplay' && 'cosplay', 1);
  /* 게임 코스프레 컷(2026-11-15) — 목록의 게임 · 재단(옷 gc_<재단>), 옷 색 · 데니어 · 상황 없이, 얼굴 클로즈업 아님, 정해 둔 장소 */
  for (const c of cuts.filter(x => requiredType(x) === 'cosplay')) {
    const cs = c.cosplay || {}, gm = GC.games.find(x => x.key === cs.game), cut = String(c.item || '').replace(/^gc_/, '');
    if (!gm) errs.push(`칸 ${c.n || '?'}: 게임 코스프레 컷에 목록의 게임이 없다(${cs.game || '없음'})`);
    else if (!gm.many && normName(cs.character) !== normName(gm.character)) errs.push(`칸 ${c.n || '?'}: ${gm.key} 의 캐릭터는 ${gm.character}`);
    if (!GC.cuts.some(x => x.key === cut) || (cs.cut && cs.cut !== cut)) errs.push(`칸 ${c.n || '?'}: 게임 코스프레 재단 ${cs.cut || '없음'} 이 옷 ${c.item} 과 다르다`);
    if (c.color || c.shade || c.denier || c.situ) errs.push(`칸 ${c.n || '?'}: 게임 코스프레 컷엔 옷 색 · 데니어 · 상황을 얹지 않는다`);
    if (COS_NO_FRAMES.includes(c.frame)) errs.push(`칸 ${c.n || '?'}: 게임 코스프레 컷은 얼굴 클로즈업에 두지 않는다(코스튬이 안 보인다)`);
    if (!cosplayPaths(cut).some(x => x.place === c.place && x.era === c.era)) errs.push(`칸 ${c.n || '?'}: 게임 코스프레 장소 ${c.place} 는 정해 둔 곳이 아니다(${cut} 재단)`);
  }
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
  /* 구체 색(2026-11-16) — 그 묶음 안 열쇠, 묶음 없는 컷 · 색 고정 옷엔 없음, 한 묶음 안 같은 shade 두 번 금지 */
  for (const c of cuts) if (c.shade && (!c.color || !P.shadesOf(c.color).some(x => x.key === c.shade))) errs.push(`칸 ${c.n || '?'}: 옷 색 ${c.shade} 는 색 묶음 ${c.color || '(없음)'} 안 것이 아니다`);
  for (const c of cuts) if (c.shade && !c.ofree && P.colorFixed(outfitEn(c))) errs.push(`칸 ${c.n || '?'}: 색이 박힌 옷엔 옷 색(shade)을 얹지 않는다`);
  over('옷 색(shade)', c => c.shade, 1, ALL, base);
  for (const c of cuts) if (c.situ && requiredType(c)) errs.push(`칸 ${c.n || '?'}: 상황 노출은 노출 · 세계 안 · 게임 코스프레 갈래 컷과 다른 컷에`);
  for (const c of cuts) if (c.situ && SITU_NO_FRAME.includes(c.frame)) errs.push(`칸 ${c.n || '?'}: 상황 노출은 얼굴 클로즈업에 두지 않는다`);
  /* 셋째 필수 — 게임 코스프레 한 장(2026-11-15, 여섯 장 이상 묶음). 옛 묶음(상황 필수 시절)은 그 앞 셋째로 그대로 맞다 — 상황 노출 컷(노출 · 세계 안 갈래가 아닌 컷)이나,
     상황 컷이 막혀 빠진 묶음 · 일곱째 하나만 더 짠 옛 묶음은 갈래 자유 컷의 상황(2026-11-11 — 서성 메카 일곱 장이 이 꼴). 새 묶음은 계획기가 코스프레 칸을 늘 짠다(plan wants) */
  const hasCos = all.some(c => requiredType(c) === 'cosplay'), legacySitu = all.some(c => c.situ && !requiredType(c)),
    legacyFree = ALL.some(c => c.ofree && c.ofreeSitu);
  if (ALL.length >= CASUAL_N - 1 && !hasCos && !legacySitu && !legacyFree) errs.push('게임 코스프레 컷이 없다 — 노출 · 세계 안 갈래와 다른 컷 한 장(2026-11-15 — 상황 노출 자리)');   /* 2026-11-03 더한 계열 — 안 쓴 계열이라 무게가 커서 묶음마다 한 장까지 */
  if (card.g.signature_hold.length && all.length >= 3 && !all.some(sigProp)) errs.push('그 장수의 물건을 든 컷이 없다(한두 장)');
  if (all.length >= 3) {
    if (!all.some(c => FAR.includes(c.frame))) errs.push('먼 컷(전신·환경)이 없다');
    if (!all.some(c => NEAR.includes(c.frame))) errs.push('가까운 컷(허리 위·가슴 위·클로즈업)이 없다');
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
  /* 게임 코스프레 컷의 옷은 재단 틀(gc_<재단>)일 뿐 게임마다 다른 옷이라 옷 겹침에서 뺀다. 장소는 다른 코스프레 컷과만 견준다(정해 둔 곳이 일곱뿐 — 2026-11-15) */
  const outfitKey = c => c.ofam === COS_FAM ? '' : c.item ? c.ofam + '/' + c.item : (c.ofam && c.ofam !== 'everyday' ? c.ofam : '');
  for (const c of N) {
    const same = others.filter(o => o.place && o.place === c.place && ((c.ofam === COS_FAM) === (o.ofam === COS_FAM)));   /* 코스프레는 코스프레끼리 · 나머지는 나머지끼리 — 양쪽 같게(2026-11-18 — 일반 컷만 코스프레 컷 장소에 걸렸다) */
    if (same.length && (!inWorld(c) || same.some(o => o.ofam === c.ofam))) errs.push(`칸 ${c.n || '?'}: 장소 ${c.place} 는 다른 세계 · 다른 묶음이 쓴 곳`);
    if (C2.presetOnce && C2.presetOnce(T2, c.preset) && [...N.filter(o => o !== c), ...others].some(o => C2.presetOnce(T2, o.preset))) errs.push(`칸 ${c.n || '?'}: 두 손 모으기 · 무릎 꿇기 · 쉿 자세 추천은 한 캐릭터(세 세계 · 묶음 통틀어) 한 장까지 — ${c.preset}`);
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
    if (P.colorFixed(outfitEn(c)) || requiredType(c) === 'cosplay') { delete c.color; delete c.shade; continue; }   /* 게임 코스프레 컷은 코스튬 제 색(2026-11-15) */
    let pool = COLORS.filter(k => !used.has(k) && !mine.has(k));
    if (!pool.length) pool = COLORS.filter(k => !mine.has(k));
    if (!pool.length) pool = COLORS.slice();
    c.color = pool[Math.floor(rc() * pool.length)]; mine.add(c.color);
  }
  return cuts;
}
/* ══ 구체 색(shade — 2026-11-16 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 「응 그렇게 진행해줘」) ══
   묶음(color)을 고른 뒤 그 묶음 안 shade 하나(T.CASUAL.colors[].shades — 지시문엔 그 색 하나의 글). 묶음 글의 「such as」 예시를 GPT 가 맨 앞 것만 골라 분홍 · 체리 레드 · 카멜로 쏠렸다.
   고르는 차례: ① 한 묶음(그 세계의 이미 있는 컷 + 이번 칸) 안에서 같은 shade 두 번 금지 ② 그 장수 그 세계의 머리색 갈래(hue)는 피한다(P.hairHue — 못 읽으면 안 피함) ③ 묶음 안 같은 hue 는 되도록 피한다
   (각 단계에서 남는 게 없으면 그 단계는 건너뛴다) ④ 이 공방에서 쓴 수(shadeUsage — 그린 기록 + 예약 + 이번 배치)가 가장 적은 것, 같으면 무작위. 장면 · 색 묶음과 따로 된 난수 */
const SHADE_KEYS = (T.CASUAL.colors || []).flatMap(g => (g.shades || []).map(x => x.key));
function shadeize(cuts, old = [], hue = '', used = {}, rs = Math.random) {
  const mine = new Set(old.map(c => c.shade).filter(Boolean)), hues = new Set();
  const hueOf = k => { for (const g of T.CASUAL.colors || []) { const x = (g.shades || []).find(y => y.key === k); if (x) return x.hue; } return ''; };
  mine.forEach(k => hues.add(hueOf(k)));
  const narrow = (list, f) => { const l = list.filter(f); return l.length ? l : list; };
  for (const c of cuts) {
    const all = P.shadesOf(c.color);
    if (!c.color || !all.length) { delete c.shade; continue; }
    let pool = narrow(all, x => !mine.has(x.key));
    pool = narrow(pool, x => !hue || x.hue !== hue);
    pool = narrow(pool, x => !hues.has(x.hue));
    const n = x => used[x.key] || 0, lo = Math.min(...pool.map(n)), best = pool.filter(x => n(x) === lo);
    const got = best[Math.floor(rs() * best.length)];
    c.shade = got.key; mine.add(got.key); hues.add(got.hue);
  }
  return cuts;
}
/* 쓴 shade 수 — cosplayUsage 와 같은 곳(이 공방 그림 저장소 records): 그린 기록의 scene.shade + 아직 안 그린 계획 파일(card · world · style · cuts[].n)의 cuts[].shade.
   같은 컷에 그린 기록이 있으면 계획은 안 센다, 같은 컷의 계획 파일이 여럿이면 가장 늦게 고친 것 하나. dirs 는 records 폴더 하나 또는 여럿(기본 cosplayDirs). 돌려주는 것 { shade: 수 } */
function shadeUsage(dirs) {
  const out = {}, seen = new Set(), drawn = new Set(), drawnAny = new Set(), plans = new Map(), add = k => { if (k) out[k] = (out[k] || 0) + 1; };
  const walk = (d, depth) => {
    let names; try { names = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const e of names) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { if (depth < 4) walk(f, depth + 1); continue; }
      if (!/\.json$/.test(e.name)) continue;
      const rk = recordKeyOf(f); if (rk) { drawn.add(rk); drawnAny.add(anyStyle(rk)); }
      let t; try { t = fs.readFileSync(f, 'utf8'); } catch (er) { continue; }
      if (t.indexOf('"shade"') < 0) continue;   /* 먼저 글로 거른다 */
      let r; try { r = JSON.parse(t); } catch (er) { continue; }
      if (rk || r.scene || r.generation) {   /* 그린 기록 */
        const k = rk || [r.card || '', r.world || '', r.slot || r.file || f].join('|');
        if (seen.has(k)) continue; seen.add(k);
        add((r.scene || {}).shade);
        continue;
      }
      if (!r.card || !Array.isArray(r.cuts)) continue;
      let mt = 0; try { mt = fs.statSync(f).mtimeMs; } catch (er) { /* 없음 */ }
      for (const c of r.cuts) {
        if (!c || !c.shade) continue;
        const k = cutKey(r.card, r.world, r.style, c.n), prev = plans.get(k);
        if (!prev || mt >= prev.mt) plans.set(k, { shade: c.shade, style: r.style || '', mt });
      }
    }
  };
  for (const d of [].concat(dirs == null ? cosplayDirs() : dirs).filter(x => x && fs.existsSync(x))) walk(d, 0);
  for (const [k, p] of plans) { if (drawn.has(k) || (!p.style && drawnAny.has(anyStyle(k)))) continue; add(p.shade); }
  return out;
}
/* 데니어(2026-11-08 「데니어 설정값 넣어서 랜덤하게 설정될 수 있게 해줘. 기존 노출설정값 과는 별개로」) — 데니어가 닿는 옷(P.denierFits)마다
   열에 여섯은 갈래 하나(40 · 60 · 80), 묶음 안에선 갈래를 돌려 가며. 노출 단계(skin_exposure)는 건드리지 않는다. 장면 · 색과 따로 된 난수 */
const DENIERS = (T.CASUAL.deniers || []).map(d => d.key), DENIER_RATE = 0.6;
function denierize(cuts, rd = Math.random) {
  const mine = [];
  for (const c of cuts) {
    if (!P.denierFits(outfitEn(c)) || requiredType(c) === 'cosplay' || rd() >= DENIER_RATE) { delete c.denier; continue; }
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
/* 순간(2026-11-18 사용자 D) — 노출과 상관없는 작은 사건 하나(표 moments). 일반 컷 가운데 몇 장에(자유 설계 · 상황 노출 · 게임 코스프레 컷은 빼고 — 한 컷에 작은 사건은 하나),
   전체 기록 + 묶음에서 덜 쓴 것. 장면(장소 · 프레이밍 · 시간대 · 날씨)이 다 정해진 뒤 */
const MOMENT_RATE = 0.4, MOMENT_MAX = 2;
function momentize(cuts, old = [], ra = Math.random, usage = null) {
  const U0 = usage ? usageOf(usage) : null, g = (U0 && U0.moment) || {}, here = {};
  [...old, ...cuts].forEach(c => { if (c.moment) here[c.moment] = (here[c.moment] || 0) + 1; });
  let n = cuts.filter(c => c.moment).length;
  for (const c of cuts) {
    if (n >= MOMENT_MAX || c.moment || c.ofree || c.sfree || c.situ || c.cosplay || ra() >= MOMENT_RATE) continue;
    const list = C2.moments(T2, c); if (!list.length) continue;
    const sc = k => 3 * (here[k] || 0) + (g[k] || 0), min = Math.min(...list.map(sc)), pool = list.filter(k => sc(k) - min < 1);
    c.moment = pool[Math.floor(ra() * pool.length)]; here[c.moment] = (here[c.moment] || 0) + 1; n++;
  }
  return cuts;
}
function ambient(cuts, old = [], ra = Math.random, usage = null) {
  /* 전체 기록 비율(2026-11-18 사용자 A) — 그림 저장소의 다른 장수 · 카드 컷에서 센 횟수를 0 ~ 1 로(가장 많이 쓴 값이 1). 묶음 안 횟수 다음으로 본다 */
  const U0 = usage ? usageOf(usage) : null, global = {};
  if (U0) for (const k of ['time', 'light', 'weather']) { const m = U0[k] || {}, top = Math.max(1, ...Object.values(m)); global[k] = Object.fromEntries(Object.entries(m).map(([x, n]) => [x, n / top])); }
  const used = {}, note = c => [...AMBIENT, 'camera'].forEach(k => { if (c[k]) { used[k] = used[k] || {}; used[k][c[k]] = (used[k][c[k]] || 0) + 1; } });
  old.filter(c => !c.sfree).forEach(note);
  const opts = { times: (T.CASUAL.times || []).map(x => x.key), hairs: (T.CASUAL.hairs || []).map(x => x.key), used, global };
  for (const c of cuts) {
    /* 자유 설계 칸은 맡은 쪽이 짓는다 — 시간대만 준다(2026-11-18 사용자 B — 비면 늘 따뜻한 밤 실내로 그렸다) */
    if (c.sfree || c.ofree) { const a = C2.ambience(T2, c, ra, opts); if (a.time) { c.time = a.time; note({ time: a.time }); } else delete c.time; continue; }
    Object.assign(c, C2.ambience(T2, c, ra, opts));
    /* 역광 실루엣 상황은 빛이 뒤에서 — 밤 시간대는 뗀다 */
    if (c.situ === 'sheer_light') { c.light = 'back'; if (['night', 'neon', 'lamplight'].includes(c.time)) c.time = ''; if (c.weather === 'night_snow') c.weather = ''; }
    for (const k of AMBIENT) if (!c[k]) delete c[k];
    note(c);
  }
  /* 고개 · 몸 좌우(2026-11-20 — 공용 모듈 spreadTurns): 한 묶음 안에서 정면 · 왼쪽 · 오른쪽을 덜 쓴 쪽으로. 자유 설계 칸은 맡은 쪽이 짓는다 */
  if (C2.spreadTurns) C2.spreadTurns(T2, cuts.filter(c => !(c.sfree || c.ofree)), ra, old);
  /* 옷 꾸밈(2026-11-23 — 공용 모듈 spreadStyles, 사용자 「1,3,4,5,6번까지해서 공통으로 해줘」): 소재 · 입은 모양 · 핏 · 겹쳐 입기 · 장신구를 묶음 안에서 덜 쓴 것부터. 코스프레 · 자유 설계 · 직접 쓴 옷 글은 모듈이 뺀다. 두꺼운 겉옷 · 장갑은 눈 · 겨울일 때만 */
  if (C2.spreadStyles) C2.spreadStyles(T2, cuts.filter(c => !(c.sfree || c.ofree)), ra, old, { cold: sc => /snow|winter|cold|frost|freez/.test([sc.season, sc.weather, sc.cityWeather].join(' ')) });
  return cuts;
}
/* 상황 — 상황 칸(at)에 그 옷에 맞는 것 하나. 이미 있는 컷 · 다른 세계 묶음이 쓴 상황은 뒤로. 장면과 따로 된 난수.
   at 이 null 이면(2026-11-15 — 상황 노출은 필수에서 빠졌다) 열에 셋만 일반 컷(필수 · 자유 설계 · 그 장수의 물건 컷 · 얼굴 클로즈업이 아니고 상황이 맞는 컷) 하나에 */
function situate(cuts, at, old = [], others = [], rs = Math.random) {
  const used = new Set([...old, ...others].map(c => c.situ).filter(Boolean));
  if (at == null) {
    const roll = rs(), ok = cuts.map((c, i) => i).filter(i => { const c = cuts[i]; return !c.ofree && !requiredType(c) && !sigProp(c) && !SITU_NO_FRAME.includes(c.frame) && P.situsFor(outfitEn(c)).some(k => situAtPlace(k, c)); });
    at = roll < SITU_RATE && ok.length && !old.some(c => c.situ && !c.ofree) ? ok[Math.floor(rs() * ok.length)] : -1;
  }
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
  for (const c of cuts) if (c.ofree) { delete c.color; delete c.shade; delete c.denier; delete c.situ; delete c.ofreeFamily; delete c.ofreeSitu; }
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
/* ══ 캐릭터만의 컷(2026-11-13) — 표 data/casual-own.json. 세계마다 한 장을 일상 묶음에 더해(번호 OWN_N — 묶음 장수 · 묶음 규칙에는 안 센다) 필수로.
   장면 글은 하나, 의상 줄만 노출 단계(bold → moderate → low)로 바뀐다. 손 · 구도는 표의 자세 추천을 트리로 풀어 쓴다(팔 규칙 그대로). 내용이 없는 카드 · 세계는 건너뛴다 */
const OWN = fs.existsSync(path.join(ROOT, 'data', 'casual-own.json')) ? JSON.parse(read('data/casual-own.json')) : { cards: {} };
const OWN_N = OWN.number || 90, OWN_LEVELS = OWN.levels || ['bold', 'moderate', 'low'];
const ownRow = (card, world) => (((OWN.cards || {})[card.key] || {}).worlds || {})[world] || null;
function ownCut(card, world, level = OWN_LEVELS[0], rr = Math.random) {
  const row = ownRow(card, world); if (!row) return null;
  if (!OWN_LEVELS.includes(level)) throw new Error('노출 단계는 ' + OWN_LEVELS.join(' · ') + ' — ' + level);
  const g = { ...card.g, world, land: '' };   /* 바탕 장소는 받침만 빌린다 — 땅은 안 본다 */
  const era = row.era || (C2.place(T2, row.base) || { eras: [] }).eras[0];
  /* 직업의 도구(row.prop)는 「그 물건」 소품 자리로 든다(sig_hold · sig_raise · sig_both · sig_low — 어느 장소에서나, 손 글은 트리 것) */
  let sc = { treeV: 2, era, place: row.base, ofam: row.ofam || 'everyday', prop: row.prop ? '0' : '', ...(row.prop ? { ownProp: row.prop } : {}) };
  if (!C2.presetOk(T2, sc, row.preset, g) && !row.use) throw new Error(`${card.key} ${world} 캐릭터만의 컷: 자세 추천 ${row.preset} 가 바탕 장소 ${row.base} 에서 안 된다 — 표의 base · preset 을 고친다`);
  sc = C2.repair(T2, C2.applyPreset(T2, sc, row.preset), g, l => l[0]);
  if (row.use) { const next = C2.set(T2, sc, 'use', row.use, g, l => l[0]); if (next.use !== row.use) throw new Error(`${card.key} ${world} 캐릭터만의 컷: 소품 동작 ${row.use} 가 ${row.preset} @ ${row.base} 에서 안 된다`); sc = next; }
  if (sc.posture !== (C2.preset(T2, row.preset) || {}).posture) throw new Error(`${card.key} ${world} 캐릭터만의 컷: ${row.preset} 의 자세가 ${row.base} 에서 안 된다`);
  Object.assign(sc, C2.ambience(T2, sc, rr, { times: (T.CASUAL.times || []).map(x => x.key), hairs: [] }));
  for (const k of AMBIENT) if (!sc[k]) delete sc[k];
  const body = by(tree2.body, sc.body), head = by(tree2.head, sc.head);
  return { ...sc, n: OWN_N, own: world, ...(row.prop ? { prop: '0', ownProp: row.prop } : {}), placeText: row.place, scene: row.activity, outfit: row.outfit[level] || row.outfit[OWN_LEVELS[0]], preset: row.preset,
    expr: body && body.face_hidden && !(head && head.look_back) ? '' : EXPRS[Math.floor(rr() * EXPRS.length)], axes: { ...FIXED_AXES, skin_exposure: level }, aspect: '2:3', unlocked: [] };
}
const MUST = /^(필수 갈래가 없다|먼 컷|가까운 컷|그 장수의 물건을 든 컷이 없다|시대가 |게임 코스프레 컷이 없다|갈래 자유 컷이 없다)/;
function plan(card, slots, old, { seed = Date.now(), required = '', usage = {}, others = [], recent = [], cosplayUsed = null, shadeUsed = null } = {}) {
  /* 씨앗에 카드 · 세계를 섞는다 — 같은 씨앗이면 카드마다 같은 묶음이 나왔다 */
  card.g.world = card.world || '';   /* 그 세계에만 있는 자리(worlds_only) */
  const mix = [...(card.key + '|' + (card.world || ''))].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const rUse = rng((seed ^ mix ^ 0x5bd1e995) >>> 0), r = rng((seed ^ mix) >>> 0);
  const ci = P.cards(D).indexOf(card.key), oldEx = old.some(c => EXPOSE_TYPES.includes(requiredType(c))), oldIn = old.some(c => requiredType(c) === 'nation');
  /* 정해 둔 두 갈래 중 아직 없는 것을 앞 칸부터 — 노출 갈래는 장수마다 란제리풍 · 수영복 · 역할극을 돌려 가며 */
  const wants = [oldEx ? '' : (required || EXPOSE_TYPES[Math.max(0, ci) % EXPOSE_TYPES.length]), oldIn ? '' : 'nation'].filter(Boolean);
  const needSig = card.g.signature_hold.length > 0 && !old.some(sigProp) && slots.length >= 3;
  /* 칸 몫(2026-11-11 일곱 장) — 정해 둔 칸(노출 · 세계 안 · 게임 코스프레) 뒤로 갈래 자유 · 그 장수의 물건 · 옷 자유 차례. 칸이 모자라면(옛 여섯 장 위 일곱째 하나) 갈래 자유만 —
     그때 셋째(상황 노출 · 게임 코스프레)가 없던 옛 묶음은 갈래 자유 컷의 상황이 그 몫(check) */
  const total = slots.length + old.length;
  const needFam0 = total >= CASUAL_N && !old.some(c => c.ofree && c.ofreeFamily);
  /* 셋째 필수 — 게임 코스프레(2026-11-15, 상황 노출 자리). 옛 묶음에 셋째(상황 노출 컷)가 이미 있으면 그대로 */
  const thirdOld = old.some(c => requiredType(c) === 'cosplay' || (c.situ && !requiredType(c)));
  if (!thirdOld && total >= CASUAL_N - 1 && slots.length - wants.length - (needFam0 ? 1 : 0) > 0) wants.push('cosplay');
  const cosAt = wants.indexOf('cosplay'), cos = cosAt >= 0 ? pickCosplay(cosplayUsed || [], rng((seed ^ mix ^ 0x2545f491) >>> 0)) : null;
  if (cosAt >= 0 && !cos) throw new Error('게임 코스프레 목록이 다 찼다 — data/game-cosplay.json 에 게임을 더한다');
  const room = slots.length - wants.length;
  const needFam = needFam0 && room > 0;
  const needOut = total >= CASUAL_N && !old.some(c => c.ofree && !c.ofreeFamily);
  const oldFrames = new Set(old.filter(c => !c.ofree).map(c => c.frame));
  for (let attempt = 1; attempt <= 800; attempt++) {   /* 2026-11-15 400 → 800 — 게임 코스프레 칸(장소 일곱 · 재단이 정해짐)이 더해져 옛 묶음이 많은 장수(조조 셋째 세계)가 300 번대까지 걸렸다 */
    let frames = FRAMES.filter(f => !oldFrames.has(f)).sort(() => r() - 0.5);
    if (frames.length < slots.length) frames = frames.concat(FRAMES.slice().sort(() => r() - 0.5)).slice(0, slots.length);
    frames = frames.slice(0, slots.length);
    /* 게임 코스프레 칸은 얼굴 클로즈업이 아닌 프레이밍(코스튬이 안 보인다 — 표 costume_required.not_frames) — 다른 칸과 바꾼다 */
    if (cosAt >= 0 && COS_NO_FRAMES.includes(frames[cosAt])) { const j = frames.findIndex((f, i) => i !== cosAt && !COS_NO_FRAMES.includes(f)); if (j < 0) continue; [frames[cosAt], frames[j]] = [frames[j], frames[cosAt]]; }
    /* 칸 나누기 — 정해 둔 칸 뒤를 섞어 갈래 자유 → 그 장수의 물건 → 옷 자유 */
    const idx = []; for (let i = wants.length; i < slots.length; i++) idx.push(i);
    idx.sort(() => r() - 0.5);
    const famAt = needFam ? idx.shift() : -1;
    const sigAt = needSig && idx.length ? idx.shift() : -1;
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
      if (wants[i] === 'cosplay') {   /* 게임 코스프레 칸 — 그 재단이 설 수 있는 시대(지금 현실 · 무대·환상) 가운데 몫에 비해 덜 쓴 것 */
        const can = [...new Set(cosplayPaths(cos.cut).map(x => x.era))], ratio = x => cnt[x] / (ERA_QUOTA[x] || 1), lo = Math.min(...can.map(ratio));
        const e = weighted(r, Object.fromEntries(can.filter(x => ratio(x) === lo).map(x => [x, ERA_WEIGHT[x] || 1]))); eras.push(e); cnt[e]++; continue;
      }
      if (isFreeAt(i)) { eras.push(weighted(r, ERA_WEIGHT)); continue; }
      const ratio = x => cnt[x] / (ERA_QUOTA[x] || 1), lo = Math.min(...ERAS.map(ratio)), e = weighted(r, Object.fromEntries(ERAS.filter(x => ratio(x) === lo).map(x => [x, ERA_WEIGHT[x] || 1])));
      eras.push(e); cnt[e]++;
    }
    { const at = []; for (let i = wants.length; i < slots.length; i++) if (!isFreeAt(i)) at.push(i); const tail = at.map(i => eras[i]).sort(() => r() - 0.5); at.forEach((i, j) => { eras[i] = tail[j]; }); }
    const cuts = [];
    for (let i = 0; i < slots.length; i++) {
      let got = null;
      for (let k = 0; k < 60 && !got; k++) {
        const U0 = usageOf(usage), here = { ...U0, prop: { ...U0.prop }, ofam: { ...U0.ofam }, combo: { ...(U0.combo || {}) } }; cuts.forEach(c => { if (c.posture) here.combo[comboKey(c)] = (here.combo[comboKey(c)] || 0) + 2; const u = C2.use(T2, c.use); if (u) here.prop[u.prop] = (here.prop[u.prop] || 0) + 10; here.ofam[c.ofam] = (here.ofam[c.ofam] || 0) + 10; });   /* 묶음 안에서 이미 고른 옷 계열은 다시 덜 고른다(동탄룩 한 장까지) */
        const want = wants[i] || '', sc = slot(r, card, want, { once: [...old, ...cuts, ...others].some(x => x && C2.presetOnce && C2.presetOnce(T2, x.preset)), frame: frames[i], wantSig: i === sigAt && !want, era: eras[i], usage: here, rUse, cos });
        if (!sc) continue;
        const cand = { n: slots[i], ...sc };
        if (isFreeAt(i)) { cand.ofree = true; if (i === famAt) cand._fam = true; got = cand; break; }   /* 자유 설계 칸 — 그림자 장면, 규칙 셈 밖 */
        if (!check([...cuts, cand], card, old, others).filter(e => !MUST.test(e)).length) got = cand;
      }
      if (!got) break;
      cuts.push(got);
    }
    /* 묶음 규칙(자유 설계 칸 전) → 색 · 데니어 · 상황 · 갈래 자유를 나눈 뒤 다시 한 번 */
    if (cuts.length === slots.length && !check(cuts, card, old, others).filter(e => !/^갈래 자유 컷이 없다|^게임 코스프레 컷이 없다/.test(e)).length) {
      const real = cuts.filter(c => !c.ofree);
      colorize(real, old, others, rng((seed ^ mix ^ 0x27d4eb2f) >>> 0)); shadeize(real, old, P.hairHue(D, card.key, card.world || ''), shadeUsed || {}, rng((seed ^ mix ^ 0x4cf5ad43) >>> 0)); denierize(real, rng((seed ^ mix ^ 0x165667b1) >>> 0)); situate(cuts, null, old, others, rng((seed ^ mix ^ 0x3c6ef372) >>> 0)); ambient(cuts, old, rng((seed ^ mix ^ 0x7f4a7c15) >>> 0), usage); momentize(cuts, old, rng((seed ^ mix ^ 0x2545f491) >>> 0), usage);
      if (!freeOutfit(cuts, old, rng((seed ^ mix ^ 0x1b873593) >>> 0), others) || check(cuts, card, old, others).length) { cuts.forEach(c => { delete c._fam; }); continue; }
      /* 상황 노출 늘 한 장(2026-11-16 「늘 1장은 나오게」) — 일반 컷이 있는데 맞는 옷이 없어 못 얹었으면 다른 묶음으로(그 세계에 이미 상황 컷이 있으면 그대로) */
      if (SITU_RATE >= 1 && cuts.some(c => !c.ofree && !requiredType(c) && !sigProp(c)) && !old.some(c => c.situ && !c.ofree) && !cuts.some(c => c.situ && !c.ofree)) { cuts.forEach(c => { delete c._fam; }); continue; }
      recentize(cuts, old, recent, card.world || '');
      cuts.forEach(c => { if (c.cosplay) c.cosplay = withAgain(c.cosplay, cosplayUsed || [], c.place, rng((seed ^ mix ^ 0x68e31da4) >>> 0)); });   /* 1회차의 2회차 몫 */
      return { cuts, attempt, required: [...[...old, ...cuts].filter(c => !c.ofree).map(c => requiredType(c) === 'cosplay' ? 'cosplay:' + (c.cosplay || {}).game + '/' + String(c.item).replace(/^gc_/, '') : requiredType(c)).filter(Boolean), ...[...old, ...cuts].filter(c => c.situ).map(c => 'situ:' + c.situ), ...[...old, ...cuts].filter(c => c.ofreeFamily).map(c => 'free:' + c.ofreeFamily + '+' + c.ofreeSitu)].join(' · ') };
    }
  }
  throw new Error('규칙을 다 지키는 묶음을 못 찾았다 — 이미 있는 컷이 칸을 너무 많이 차지했는지 본다');
}

/* 기록 — 생성기 「기록 내보내기」 와 같은 꼴(P.casualRecord) + 그 기록이 놓일 자리 */
const recordRel = (key, world, n, style = STYLE) => `records/${key}/${world}-casual${n}.${style}-ui.json`;
/* 고른 세계 그림이 GPT 임의 설계인가 — 그 세계 기록(<세계>.<화풍>-ui.json)의 generation.design(2026-11-15). 그러면 일상컷 체형 줄은 설계표 체형 글 없이 그림의 몸만 */
function refFree(key, world, style = STYLE) {
  for (const d of REPOS.recordDirs(key)) {
    const f = path.join(d, `${world}.${style}-ui.json`);
    if (fs.existsSync(f)) { try { const r = JSON.parse(fs.readFileSync(f, 'utf8')); return ((r.generation || {}).design || r.design) === 'gpt_free'; } catch (e) { return false; } }
  }
  return false;
}
function record(card, world, cut) {
  const { n, ...scene } = cut;
  return { ...P.casualRecord(D, S, card.key, scene, { world, style: STYLE, tree, tree2, refFree: refFree(card.key, world) }, n), record: recordRel(card.key, world, n) };
}
/* 이미 있는 컷 — 그 세계의 기록(<세계>-casualN.<화풍>-ui.json). dir 은 하나 또는 여럿(그림 저장소마다 records/<장수> — 2026-11-12) */
function oldCuts(dirs, card, world) {
  const re = new RegExp('^' + world + '-casual(\\d+)\\.' + STYLE + '-ui\\.json$');
  return dirList(dirs).flatMap(dir => fs.readdirSync(dir).filter(f => re.test(f) && Number(re.exec(f)[1]) !== OWN_N).map(f => {   /* 캐릭터만의 컷(OWN_N)은 묶음 밖 */
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { n: Number(re.exec(f)[1]), ...C2.repair(T2, { ...rec.scene }, card.g), old: true };
  }));
}
/* 등록된 그 세계의 일상컷 번호 */
function registered(card, world) {
  const v = (((JSON.parse(read('data/img.json')).img || {})[card.key] || {}).byStyle || {})[STYLE] || {};
  return (((((v.byForm || {})[world] || {}).casual || {}).f) || []).map(f => Number((/_casual(\d+)\.webp$/.exec(f) || [])[1])).filter(n => n && n !== OWN_N);
}
/* 그 세계의 캐릭터만의 컷이 벌써 있나 — 등록부 또는 기록 */
function ownDone(card, world, recDir) {
  const v = (((JSON.parse(read('data/img.json')).img || {})[card.key] || {}).byStyle || {})[STYLE] || {};
  const reg = (((((v.byForm || {})[world] || {}).casual || {}).f) || []).some(f => new RegExp('_casual' + OWN_N + '\\.webp$').test(f));
  return reg || [].concat(recDir || []).some(d => fs.existsSync(path.join(d, `${world}-casual${OWN_N}.${STYLE}-ui.json`)));
}
/* 캐릭터만의 컷 한 걸음 — 표에 내용이 있고 아직 없으면(등록 · 기록) 한 장. 일상 묶음이 다 찬 카드도 이 한 장은 짠다.
   --own-level 로 단계를 내려 다시 짓는다(막혔을 때 — IMAGE_RULES) */
function ownStep(card, world, seed, opt, recDir, worlds) {
  if (ownRow(card, world) && (opt['own-level'] || !(ownDone(card, world, recDir)))) {
    /* 같은 카드의 다른 세계와 자세 추천(= 구도)이 같으면 짓지 않는다 — 표를 고친다(2026-11-13 사용자 「세 세계가 같은 구도인 직업컷은 세계마다 다른 자세로」) */
    const same = Object.entries((OWN.cards[card.key] || {}).worlds || {}).filter(([w, r]) => w !== world && r.preset === ownRow(card, world).preset).map(([w]) => w);
    if (same.length) { console.log(`  ${OWN_N} ✗ 캐릭터만의 컷 — ${same.join(' · ')} 세계와 같은 구도(${ownRow(card, world).preset}) · data/casual-own.json 을 고친다 · 건너뜀`); return; }
    const oc = ownCut(card, world, opt['own-level'] || OWN_LEVELS[0], rng((seed ^ 0x51ed270b) >>> 0));
    console.log(`  ${OWN_N} ◆ 캐릭터만의 컷 — ${ownRow(card, world).job_ko} · 노출 ${oc.axes.skin_exposure} · ${oc.preset}`);
    if (opt.out) { const out = worlds.length > 1 ? path.join(opt.out, 'plan-' + world) : opt.out; fs.mkdirSync(out, { recursive: true }); const rec = record(card, world, oc);
      rec.own = { job_ko: ownRow(card, world).job_ko, level: oc.axes.skin_exposure, example: !!((OWN.cards[card.key] || {}).example) };
      fs.writeFileSync(path.join(out, `${world}-casual${OWN_N}.${STYLE}-ui.json`), JSON.stringify(rec, null, 1) + '\n'); fs.writeFileSync(path.join(out, `${world}-casual${OWN_N}-prompt.txt`), rec.prompt); }
  } else if (!ownRow(card, world)) console.log(`  ${OWN_N} ◇ 캐릭터만의 컷 — 아직 없음(data/casual-own.json 에 내용이 없다) · 건너뜀`);
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
      if (u && u.prop !== 'signature') { add(out.prop, u.prop); add(out.use, sc.use); }
      add(out.time, sc.time); add(out.light, sc.light); add(out.weather, sc.weather); if (sc.posture) add(out.combo, comboKey(sc)); add(out.moment, sc.moment);   /* 시간대 · 빛 · 날씨(2026-11-18 A — 전체 기록 비율) */
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
    `${ko(tree2.postures, c.posture)} · ${c.frame} · ${ko(tree2.body, c.body)} · ${ko(tree2.head, c.head)} · 오른손 ${hand(c.right)} · 왼손 ${hand(c.left)}${u ? ' · ' + ko(tree2.props, u.prop) + ' ' + u.ko : ''}${c.legs ? ' · ' + ko(tree2.legs, c.legs) : ''}${c.gaze ? ' · 시선 ' + ko(tree2.gaze, c.gaze) : ''}${c.color ? ' · 옷 색 ' + ko(T.CASUAL.colors, c.color) + (c.shade ? '(' + ko(P.shadesOf(c.color), c.shade) + ')' : '') : ''}${c.situ ? ' · 상황 ' + ko(T.CASUAL.situations, c.situ) : ''}${requiredType(c) === 'cosplay' ? ' · 코스프레 ' + cosplayKo(c) : ''}${c.ofree ? (c.ofreeFamily ? ` · 갈래 자유(장면 자유 설계 — ${c.ofreeFamily} + ${c.ofreeSitu === 'free' ? '상황 자유' : '상황 ' + ko(T.CASUAL.situations, c.ofreeSitu)})` : ' · 옷 자유(장면 자유 설계)') : ''}`;
}

/* 게임 코스프레 한 줄(한국어) — 게임 · 캐릭터(1회차는 「고르기」) · 재단 · 회차 */
function cosplayKo(c) {
  const cs = c.cosplay || {}, gm = GC.games.find(x => x.key === cs.game) || {}, cut = GC.cuts.find(x => x.key === String(c.item || '').replace(/^gc_/, '')) || {};
  const who = gm.many ? (cs.character ? cs.character + (cs.round === 2 ? '(2회차)' : '(정해 둠)') : '고르기(옛 1회차 pick — 그리는 쪽이 채운다' + (cs.again ? ', 없으면 ' + cs.again.character + '(2회차)' : '') + ')') : gm.character_ko || cs.character;
  return `${gm.ko || cs.game} · ${who} · ${cut.ko || '?'} · ${cs.round || 1}회차`;
}
/* 이번에 다시 짜는 칸의 예약은 쓴 것에서 뺀다(그 칸을 새로 정하니까) — 카드 · 세계 · 화풍 · 번호 */
const ownReserved = (rows, card, world, ns, style = STYLE) => rows.filter(r => !(r.reserved && r.card === card && r.world === world && (r.style || style) === style && ns.includes(r.n)));
/* ══ 옛 계획 다시 짜기(2026-11-16 사용자 「응 그래」 — 캐릭터를 계획기가 정한다) ══
   계획 파일 하나(plan.json · 그림 저장소 records/<장수>/<세계>-casual-plan.json · -replan.json)에서 아직 안 그린 게임 코스프레 칸(그 화풍의 기록이 없는 번호)의
   cosplay(와 재단 = 옷 gc_<재단>)만 pickCosplay 로 다시 정한다 — 장소 · 자세 · 구도 같은 다른 칸은 그대로, 재단은 그 장소가 받는 것만(물가면 수영복 재단).
   계획 파일을 고쳐 쓰고(recosplay 칸에 전 · 후), 지시문 · 기록은 --out(없고 계획 파일이 plan.json 이면 그 폴더)에 <세계>-casualN.<화풍>-ui.json · -prompt.txt 로 */
function recosplay(card, planFile, { used = [], seed = Date.now() % 1e9, recDir = [], out = '', write = true } = {}) {
  const doc = JSON.parse(fs.readFileSync(planFile, 'utf8')), world = doc.world, style = doc.style || STYLE;
  if (doc.card && doc.card !== card.key) throw new Error(planFile + ' 는 ' + doc.card + ' 의 계획이다');
  if (style !== STYLE) throw new Error(planFile + ' 의 화풍은 ' + style + ' — --style ' + style + ' 로');
  card.world = world; card.g.world = world;
  const drawnN = n => [].concat(recDir).some(d => fs.existsSync(path.join(d, `${world}-casual${n}.${style}-ui.json`)));
  const todo = (doc.cuts || []).filter(c => c.cosplay && requiredType(c) === 'cosplay' && !drawnN(c.n));
  const pool = ownReserved(used, card.key, world, todo.map(c => c.n), style), rnd = rng(seed >>> 0), changed = [];
  for (const c of todo) {
    const items = C2.choices(T2, c, 'item', card.g), cutOk = k => cosCutOk(k, c.place) && items.includes('gc_' + k);
    const cos = pickCosplay(pool, rnd, cutOk);
    if (!cos) throw new Error(`칸 ${c.n}: 장소 ${c.place} 에서 고를 코스프레가 없다(목록이 다 찼다)`);
    const next = { ...c, item: 'gc_' + cos.cut, cosplay: cos };
    const errs = check([next], card, [], []).filter(e => /코스프레|트리에서 못 고른다/.test(e) && !/컷이 없다/.test(e));
    if (errs.length) throw new Error(errs.join(' · '));
    changed.push({ n: c.n, from: { ...c.cosplay, item: c.item }, to: { ...cos } });
    Object.assign(c, next);
    pool.push({ game: cos.game, character: cos.character, cut: cos.cut });
  }
  if (changed.length) {
    doc.required = String(doc.required || '').replace(/cosplay:[^ ]+/g, () => { const c = (doc.cuts || []).find(x => x.cosplay && requiredType(x) === 'cosplay'); return c ? 'cosplay:' + c.cosplay.game + '/' + String(c.item).replace(/^gc_/, '') : ''; });
    doc.recosplay = [...(doc.recosplay || []), { at: new Date().toISOString(), seed, rule: '2026-11-16 계획기가 캐릭터를 정한다(쓴 것 = 그린 기록 + 예약)', cuts: changed }];
  }
  if (write && changed.length) {
    fs.writeFileSync(planFile, JSON.stringify(doc, null, 1) + '\n');
    const dir = out || (path.basename(planFile) === 'plan.json' ? path.dirname(planFile) : '');
    if (dir) {
      fs.mkdirSync(dir, { recursive: true });
      for (const ch of changed) {
        const c = doc.cuts.find(x => x.n === ch.n), rec = record(card, world, c);
        fs.writeFileSync(path.join(dir, `${world}-casual${c.n}.${STYLE}-ui.json`), JSON.stringify(rec, null, 1) + '\n');
        fs.writeFileSync(path.join(dir, `${world}-casual${c.n}-prompt.txt`), rec.prompt);
        const agf = path.join(dir, `${world}-casual${c.n}-again-prompt.txt`), ag = againScene(c);
        if (ag) fs.writeFileSync(agf, record(card, world, ag).prompt); else if (fs.existsSync(agf)) fs.rmSync(agf);   /* 옛 pick 칸의 2회차 몫 지시문은 뗀다 */
      }
    }
    return { doc, changed, dir };
  }
  return { doc, changed, dir: '' };
}
/* 그림 저장소에서 「계획은 있는데 아직 안 그린 pick 칸」 — [{ card, world, style, n, game, cut, file }]. dirs 는 records 폴더들(기본 이 공방 그림 저장소 모두) */
function recosplayList(dirs = REPOS.recordDirs()) {
  const out = [], seen = new Set();
  for (const top of [].concat(dirs).filter(d => fs.existsSync(d))) for (const k of fs.readdirSync(top)) {
    const d = path.join(top, k); if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter(x => /\.json$/.test(x) && !/-ui\.json$/.test(x))) {
      let t; try { t = fs.readFileSync(path.join(d, f), 'utf8'); } catch (e) { continue; }
      if (t.indexOf('"cosplay"') < 0) continue;
      let doc; try { doc = JSON.parse(t); } catch (e) { continue; }
      if (!doc.card || !Array.isArray(doc.cuts)) continue;
      const style = doc.style || STYLE;
      for (const c of doc.cuts) {
        const cs = c.cosplay || {}, gm = GC.games.find(g => g.key === cs.game);
        if (!gm || !gm.many || String(cs.character || '').trim()) continue;
        const drawnAt = [].concat(dirs).some(x => fs.existsSync(path.join(x, doc.card, `${doc.world}-casual${c.n}.${style}-ui.json`)));
        const sk = [doc.card, doc.world, style, c.n].join('|');
        if (drawnAt || seen.has(sk)) continue; seen.add(sk);
        out.push({ card: doc.card, world: doc.world, style, n: c.n, game: cs.game, cut: cs.cut || String(c.item || '').replace(/^gc_/, ''), file: path.relative(path.join(ROOT, '..'), path.join(d, f)) });
      }
    }
  }
  return out;
}
const FLAGS = new Set(['fresh', 'recosplay-list']);
function main(argv) {
  if (argv[0] === '--recosplay-list') {
    const list = recosplayList();
    for (const x of list) console.log(`  ${x.card} · ${x.world} · ${x.n} — ${(GC.games.find(g => g.key === x.game) || {}).ko || x.game} · ${(GC.cuts.find(c => c.key === x.cut) || {}).ko || x.cut} · ${x.style} · ${x.file}`);
    console.log(list.length ? `계획은 있는데 아직 안 그린 pick 칸 ${list.length} — 다시 짜려면 node tools/casual-plan.cjs <장수> --recosplay <계획 파일> [--out 폴더]` : '계획은 있는데 아직 안 그린 pick 칸 — 없음');
    return 0;
  }
  const key = argv[0], opt = {};
  for (let i = 1; i < argv.length; i++) { const k = argv[i].replace(/^--/, ''); opt[k] = FLAGS.has(k) ? true : argv[++i]; }   /* --fresh 는 값 없이 */
  let card;
  try { card = cardOf(key); } catch (e) { console.error(e.message + '\n' + fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).join('\n')); return 2; }
  /* 그 장수의 기록 — 받아 둔 그림 저장소 모두(2026-11-12 둘째 저장소 — 옛 기록은 sam-atelier-img, 새 기록은 sam-atelier-img-2) */
  const recDir = opt.records ? [opt.records] : REPOS.recordDirs(key);
  /* 다른 세계의 컷(그리고 --fresh 면 같은 세계의 옛 묶음까지) — 장면을 돌려쓰지 않게 겹침만 본다 */
  const allOld = w => oldCuts(recDir, { ...card, world: w }, w);
  if (opt.recosplay) {   /* 옛 계획 다시 짜기(2026-11-16) */
    cosplayReposOk(opt); const used = cosplayUsage(opt['cosplay-usage'] === 'none' ? [] : opt['cosplay-usage'] ? opt['cosplay-usage'].split(',') : null);
    const seed = Number(opt.seed || Date.now() % 1e9), res = recosplay(card, opt.recosplay, { used, seed, recDir, out: opt.out || '' });
    if (!res.changed.length) { console.log(`${key} ${res.doc.world} — ${opt.recosplay} 에 아직 안 그린 게임 코스프레 칸이 없다 · 그대로`); return 0; }
    for (const ch of res.changed) console.log(`  ${ch.n} ${cosplayKo({ item: ch.from.item, cosplay: ch.from })} → ${cosplayKo({ item: 'gc_' + ch.to.cut, cosplay: ch.to })}`);
    console.log(`→ ${opt.recosplay}${res.dir ? ' · 지시문 ' + res.dir : ' (지시문은 --out 폴더에 — 그림 저장소 records 엔 쓰지 않는다)'} · seed ${seed}`);
    return 0;
  }
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
  /* 게임 코스프레 쓴 기록 — 세 공방 그림 저장소(2026-11-15). 이번에 짠 세계 · --others 계획의 것도 더한다(같은 게임 · 재단이 한 번에 겹치지 않게) */
  cosplayReposOk(opt); const cosUsed = cosplayUsage(opt['cosplay-usage'] === 'none' ? [] : opt['cosplay-usage'] ? opt['cosplay-usage'].split(',') : null);
  extra.filter(c => c.cosplay).forEach(c => cosUsed.push({ ...c.cosplay, cut: String(c.item || '').replace(/^gc_/, '') || c.cosplay.cut }));
  /* 옷 색 shade 쓴 수(2026-11-16) — 코스프레와 같은 곳(그린 기록 + 예약) + --others 계획 + 이번 배치의 앞 세계 */
  const shadeUsed = shadeUsage(opt['cosplay-usage'] === 'none' ? [] : opt['cosplay-usage'] ? opt['cosplay-usage'].split(',') : null);
  const useShade = c => { if (c.shade) shadeUsed[c.shade] = (shadeUsed[c.shade] || 0) + 1; };
  extra.forEach(useShade);
  for (const world of worlds) {
    card.world = world;
    const mine = allOld(world), taken = Math.max(0, ...mine.map(c => c.n), ...registered(card, world));
    /* --fresh: 옛 묶음은 그대로 두고 그 뒤 번호로 새 여섯 장(사용자 2026-11-02 「대체하는건 아니고, 추가로」) */
    const slots = opt.slots ? opt.slots.split(',').map(Number) : fresh ? Array.from({ length: CASUAL_N }, (_, i) => taken + 1 + i) : freeSlots(card, world);
    if (!slots.length) { console.log(`${key} ${world} — 일상컷이 벌써 ${CASUAL_N} 장이다`); ownStep(card, world, seed0 + worlds.indexOf(world), opt, recDir, worlds); continue; }
    /* (여섯 장을 다 그린 세계면 일곱째 — 갈래 자유 컷 — 하나만 짜인다) */
    const old = fresh ? [] : mine.filter(c => !slots.includes(c.n));
    { const lost = registered(card, world).filter(n => !mine.some(c => c.n === n)); if (lost.length && !fresh) console.log(`  ! ${world} 등록된 일상컷 ${lost.join(',')} 의 기록이 ${recDir.join(' · ') || '그림 저장소 records/' + key} 에 없다 — 그림 저장소를 pull 한 뒤 다시(기록 없이는 필수 갈래 · 자유 설계 칸을 셀 수 없다)`); }
    const others = [...card.worlds.filter(w => w !== world).flatMap(allOld), ...(fresh ? mine : []), ...extra, ...planned];
    const seed = seed0 + worlds.indexOf(world);
    const res = plan(card, slots, old, { seed, required: opt.required || '', usage: sceneUsage(usageDir, key), others, recent: recentScenes(usageDir), cosplayUsed: ownReserved(cosUsed, key, world, slots), shadeUsed });   /* 다시 짜는 칸의 옛 예약은 빼고 */
    planned.push(...res.cuts);
    res.cuts.filter(c => c.cosplay).forEach(c => cosUsed.push({ game: c.cosplay.game, character: c.cosplay.character, cut: String(c.item).replace(/^gc_/, '') }));
    res.cuts.forEach(useShade);
    console.log(`${key} ${world} 일상컷 묶음 — 칸 ${slots.join(',')} · 정해 둔 갈래 ${res.required} · 시도 ${res.attempt} · seed ${seed}${fresh ? ' · 새 묶음(옛 묶음과 겹치지 않게)' : ''}`);
    for (const c of [...old, ...res.cuts].sort((a, b) => a.n - b.n)) console.log(line(c));
    if (opt.out) {
      const out = worlds.length > 1 ? path.join(opt.out, 'plan-' + world) : opt.out;
      fs.mkdirSync(out, { recursive: true });
      for (const c of res.cuts) {
        const rec = record(card, world, c);
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}.${STYLE}-ui.json`), JSON.stringify(rec, null, 1) + '\n');
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}-prompt.txt`), rec.prompt);
        const ag = againScene(c); if (ag) fs.writeFileSync(path.join(out, `${world}-casual${c.n}-again-prompt.txt`), record(card, world, ag).prompt);   /* 코스프레 1회차의 2회차 몫 */
      }
      fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify({ card: key, world, seed, tree: 2, style: STYLE, required: res.required, slots, fresh, cosplayRead: opt['cosplay-usage'] || COSPLAY_REPOS.join(','), cuts: res.cuts }, null, 1) + '\n');
      console.log('→ ' + out);
    }
    ownStep(card, world, seed, opt, recDir, worlds);
  }
  return 0;
}
module.exports = { cosplayReposOk, recosplay, recosplayList, planCosplay, recordKeyOf, CHAR_WEIGHT, cosplayUsage, cosplayRow, cosplayTally, pickCosplay, cosplayAgain, withAgain, againScene, cosCutOk, SITU_RATE, cosplayPaths, cosplayDirs, COSPLAY_REPOS, GC, COS_FAM, refFree, ownCut, ownRow, OWN_N, OWN_LEVELS, ambient, POSE_WEIGHT, cardOf, plan, colorize, shadeize, shadeUsage, SHADE_KEYS, denierize, situate, freeOutfit, recentize, recentScenes, sceneEn, blockScene, SITUS, DENIERS, outfitEn, COLORS, check, record, recordRel, oldCuts, freeSlots, registered, requiredType, propUsage, sceneUsage, CASUAL_N, STYLE, WEIGHT_UNUSED, EXPOSE_TYPES };
if (require.main === module) process.exit(main(process.argv.slice(2)));
