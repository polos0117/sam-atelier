/* 외형 표 옮기기 — game-atelier 의 lib/prompt-spec.js 에서 외형 선택지·얼굴·실루엣 어휘를 글자 그대로 읽어 lib/look-spec.js 로 쓴다(2026-10-30).
   게임 말(「게임 설계표」)만 「장수 설계표」로 바꾸고, 삼국지 몫 색(세력 팔레트에서 뽑은 머리·눈 색)을 더한다 — 더하는 것은 여기 EXTRA 에만 적는다.
   Run: node tools/port-look-spec.cjs [../game-atelier]   → lib/look-spec.js 를 다시 쓴다. tests/look-spec.cjs 가 game 표와 같은지 본다. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const GAME = process.argv[2] || path.join(__dirname, '..', '..', 'game-atelier');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GAME, 'lib/prompt-spec.js'), 'utf8'), ctx);
const G = ctx.window.AtelierSpec;

/* 삼국지 몫 어휘 — game 어휘에 없는 것만(머리색에 검정·갈색이 없다) */
const EXTRA = {
  /* 삼국지 몫 머리색 — 세력 팔레트(위 검푸른 · 촉 먹빛 녹음 · 오 붉은 · 군웅 자줏빛)에서. game 어휘에 검정 · 갈색이 없다 */
  hair_color: {
    jet_black: 'glossy jet-black hair', blue_black: 'blue-black hair with a cold indigo sheen', ink_blue: 'deep ink-blue hair',
    ink_green: 'ink-black hair with a deep green sheen', jade_green: 'pale jade-green hair', chestnut: 'warm chestnut-brown hair', dark_brown: 'dark brown hair',
    dark_auburn: 'dark auburn hair with red highlights', plum_black: 'plum-black hair with a violet sheen', copper: 'polished copper-red hair'
  },
  eye_color: { violet: 'pale violet eyes', graphite_grey: 'graphite-grey eyes', indigo: 'deep indigo-blue eyes' /* 손권(사용자 2026-11-09 「인디고가 어울릴거 같아」) */ },
  /* 글래머러스한 체형 — 원소 공방과 같은 넷(사용자 2026-11-01 「hourglass, voluptuous 등 글래머러스한 몸매가 더 많았으면」) */
  body: {
    hourglass: 'hourglass-figured — full bust and hips, distinctly narrow-waisted',
    voluptuous: 'voluptuous, generously curved at bust, hips and thighs',
    busty_slender: 'slender-limbed yet full-busted with rounded hips and a narrow waist',
    curvy_athletic: 'toned athletic-curvy, full-busted with rounded hips',
    /* 사용자 2026-11-02 「체형을 전체적으로 볼륨감과 굴곡감이 느껴지게」 — 장신 · 건장 · 아담도 굴곡 있게 */
    tall_curvy: 'tall and statuesque with long legs and a full, curvaceous figure — full bust and hips, narrow waist',
    strong_curvy: 'strong and broad-shouldered with firm muscle, yet full-busted with wide rounded hips and a defined waist',
    petite_curvy: 'petite and compact yet curvaceous — full bust and rounded hips on a small frame'
  }
};
const KO = {   // 설계표의 얼굴·실루엣 열쇠 → 화면 이름(lib/words.js 의 look.* 와 같다 — 검사가 맞춰 본다)
  face: { face_shape: '윤곽', eyes: '눈', brows: '눈썹', nose: '코', lips: '입', eye_color: '눈 색' },
  sil: { body: '체형', hair: '머리 윤곽', hair_color: '머리색' }
};

const neutral = s => s.replace(/게임 설계표/g, '장수 설계표').replace(/게임 팔레트/g, '나라 팔레트');
const J = v => neutral(JSON.stringify(v, null, 1));
const vocab = {};
for (const k of ['body', 'hair', 'hair_color', 'eye_color', 'face_shape', 'eyes', 'brows', 'nose', 'lips']) vocab[k] = Object.assign({}, G.VOCAB_EN[k], EXTRA[k] || {});
/* 노출 — game 의 FORM_EXPOSURE 에서 「FORM costume」 을 「the costume WORLD describes」 로. 과감은 세계로 겉옷 꼴을 고른다(판타지·메카는 겉옷, 스팀펑크는 열린 재단) */
const exposure = JSON.parse(JSON.stringify(G.FORM_EXPOSURE).replace(/the FORM costume/g, 'the costume WORLD describes').replace(/FORM costume/g, 'costume WORLD describes'));
const out = `/* 외형 표 — game-atelier lib/prompt-spec.js 의 외형 선택지(PARAM_DEFS)·얼굴 다섯 묶음·실루엣 어휘를 글자 그대로 옮겼다(tools/port-look-spec.cjs, 2026-10-30).
   손으로 고치지 않는다 — game 표가 바뀌면 스크립트를 다시 돌린다(tests/look-spec.cjs 가 같은지 본다). 삼국지 몫으로 더한 것은 스크립트의 EXTRA(머리·눈 색 · 글래머러스한 체형 넷)뿐.
   window.AtelierSpec 에 붙는다(lib/prompt-spec.js 뒤에 싣는다). 생성기·허브 통합 생성기의 외형 칸(base·build·face·hair)과 설계표 look 칸의 어휘가 여기서 나온다.
   삼국지 공방은 원소 공방(2026-10-30)에서 옮겼다 — 세력 팔레트 색이 머리·눈 색(2026-11-02). */
(function (root) {
  'use strict';
  var S = root.AtelierSpec = root.AtelierSpec || {};   /* 보통은 lib/prompt-spec.js 가 먼저 — 혼자 실려도 표만 든다(tests/words.cjs) */
  var L = {
    PARAM_DEFS: ${J(G.PARAM_DEFS)},
    IDENTITY_GROUPS: ${J(G.IDENTITY_GROUPS)},
    IDENTITY_EXCLUDED: ${J(G.IDENTITY_EXCLUDED)},
    FACE_KEYS: ${J(G.FACE_KEYS)},
    FACE_PARAM: ${J(G.FACE_PARAM)},
    SIL_PARAM: ${J(G.SIL_PARAM)},
    LOOK_KO: ${J(KO)},
    VOCAB_EN: ${J(vocab)},
    PARAM_GUIDES: ${J(G.PARAM_GUIDES)},
    PARAM_GROUP_HELP: ${J(G.PARAM_GROUP_HELP)},
    PARAM_HELP: ${J(G.PARAM_HELP)},
    HAIR_LENGTH_LIMITS: ${J(G.HAIR_LENGTH_LIMITS)},
    EYE_CONTOURS: ${J(G.EYE_CONTOURS)},
    COLOR_HEX: ${J(G.COLOR_HEX)},
    COLOR_KEYS: ${J(G.COLOR_KEYS)},
    AGE_DEFAULT: ${J(G.AGE_DEFAULT)},
    AGE_LINES: ${J(G.AGE_LINES)},
    EXPOSURE: ${J(exposure)},
    EXPOSURE_KEYS: ${J(G.FORM_EXPOSURE_KEYS)},
    EXPOSURE_DEFAULT: ${J(G.FORM_EXPOSURE_DEFAULT)},
    /* 세계 → 과감 노출의 갈래(game 은 복식 구조로 골랐다) */
    EXPOSURE_LAYER: { samguk: 'open', fantasy: 'outer', mecha: 'outer' },
    LOOK_LINES: {
      silhouette: ${J(G.GAME_LINES.silhouette)},
      face: ${J(G.GAME_LINES.face)},
      identity: ${J(G.GAME_LINES.identity)},
      measurement: ${J(G.GAME_LINES.measurement)}
    }
  };
  Object.keys(L).forEach(function (k) { S[k] = L[k]; });
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib/look-spec.js'), out);
console.log('lib/look-spec.js — 외형 선택지 ' + G.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(vocab).length + ' 묶음(삼국지 몫 머리색 ' + Object.keys(EXTRA.hair_color).length + ' · 눈 색 ' + Object.keys(EXTRA.eye_color).length + ')');
