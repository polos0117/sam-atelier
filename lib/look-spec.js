/* 외형 표 — game-atelier lib/prompt-spec.js 의 외형 선택지(PARAM_DEFS)·얼굴 다섯 묶음·실루엣 어휘를 글자 그대로 옮겼다(tools/port-look-spec.cjs, 2026-10-30).
   손으로 고치지 않는다 — game 표가 바뀌면 스크립트를 다시 돌린다(tests/look-spec.cjs 가 같은지 본다). 삼국지 몫으로 더한 것은 스크립트의 EXTRA(머리·눈 색 · 글래머러스한 체형 넷)뿐.
   window.AtelierSpec 에 붙는다(lib/prompt-spec.js 뒤에 싣는다). 생성기·허브 통합 생성기의 외형 칸(base·build·face·hair)과 설계표 look 칸의 어휘가 여기서 나온다.
   삼국지 공방은 원소 공방(2026-10-30)에서 옮겼다 — 세력 팔레트 색이 머리·눈 색(2026-11-02). */
(function (root) {
  'use strict';
  var S = root.AtelierSpec = root.AtelierSpec || {};   /* 보통은 lib/prompt-spec.js 가 먼저 — 혼자 실려도 표만 든다(tests/words.cjs) */
  var L = {
    PARAM_DEFS: [
 {
  "key": "apparent age",
  "label": "Apparent Age",
  "ko": "외관상 나이",
  "options": [
   [
    "",
    "AUTO — 20대(이 공방의 기본)"
   ],
   [
    "20s",
    "20s — 20대 성인"
   ],
   [
    "30s",
    "30s — 30대 성인"
   ],
   [
    "40s",
    "40s — 40대 성인"
   ],
   [
    "mature adult",
    "Mature Adult — 성숙하고 연륜 있는 성인"
   ],
   [
    "youthful adult",
    "Youthful — 동안 (성인이되 어려 보이는 얼굴)"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 나이 인상 직접 작성"
   ]
  ],
  "group": "base"
 },
 {
  "key": "facial ethnicity",
  "label": "Facial Ethnicity",
  "ko": "얼굴 계통",
  "options": [
   [
    "",
    "AUTO — 지정 안 함 (모델 기본값 = 서구권으로 쏠리기 쉬움)"
   ],
   [
    "East Asian",
    "East Asian — 동아시아 계열"
   ],
   [
    "Korean",
    "Korean — 한국계"
   ],
   [
    "Japanese",
    "Japanese — 일본계"
   ],
   [
    "Chinese",
    "Chinese — 중국계"
   ],
   [
    "Southeast Asian",
    "Southeast Asian — 동남아 계열"
   ],
   [
    "Central Asian",
    "Central Asian — 중앙아시아 계열"
   ],
   [
    "South Asian",
    "South Asian — 남아시아 계열"
   ],
   [
    "Middle Eastern",
    "Middle Eastern — 중동 계열"
   ],
   [
    "European",
    "European — 유럽 계열"
   ],
   [
    "Nordic",
    "Nordic — 북유럽 계열"
   ],
   [
    "Mediterranean",
    "Mediterranean — 지중해 계열"
   ],
   [
    "Slavic",
    "Slavic — 슬라브 계열"
   ],
   [
    "Latin American",
    "Latin American — 라틴 계열"
   ],
   [
    "African",
    "African — 아프리카 계열"
   ],
   [
    "mixed East Asian and European",
    "Mixed (EA×EU) — 동아시아·유럽 혼혈"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 계통 직접 작성"
   ]
  ],
  "group": "base"
 },
 {
  "key": "body type",
  "label": "Body Type",
  "ko": "체형",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 실루엣에서 자동 추론"
   ],
   [
    "slender",
    "Slender — 가늘고 슬림한 체형"
   ],
   [
    "athletic",
    "Athletic — 탄탄한 운동형 체형"
   ],
   [
    "curvy",
    "Curvy — 허리와 골반 곡선이 강조된 체형"
   ],
   [
    "glamorous",
    "Glamorous — 풍만하고 화려한 체형"
   ],
   [
    "muscular",
    "Muscular — 근육이 뚜렷한 체형"
   ],
   [
    "heavy-built",
    "Heavy-built — 중후하고 묵직한 체형"
   ],
   [
    "tall and lean",
    "Tall & Lean — 장신의 길고 슬림한 체형"
   ],
   [
    "petite",
    "Petite — 작고 아담한 체형"
   ],
   [
    "hourglass",
    "Hourglass — 허리가 잘록한 모래시계형"
   ],
   [
    "voluptuous",
    "Voluptuous — 굴곡이 크고 육감적인 체형"
   ],
   [
    "toned",
    "Toned — 군살 없이 잔근육이 잡힌 체형"
   ],
   [
    "wiry",
    "Wiry — 가늘지만 단단한 체형"
   ],
   [
    "soft-figured",
    "Soft-figured — 부드럽고 살집 있는 체형"
   ],
   [
    "pear-shaped",
    "Pear-shaped — 하체에 무게가 실린 체형"
   ],
   [
    "inverted triangle",
    "Inverted Triangle — 어깨가 넓고 하체가 좁은 역삼각형"
   ],
   [
    "stocky",
    "Stocky — 짧고 다부진 체형"
   ],
   [
    "statuesque",
    "Statuesque — 크고 당당한 조각상 같은 체형"
   ],
   [
    "broad-shouldered",
    "Broad-shouldered — 어깨가 특히 넓은 체형"
   ],
   [
    "burly",
    "Burly — 크고 두꺼운 거구"
   ],
   [
    "lanky",
    "Lanky — 키만 크고 마른 체형"
   ],
   [
    "barrel-chested",
    "Barrel-chested — 흉곽이 통처럼 두꺼운 체형"
   ],
   [
    "rangy",
    "Rangy — 길고 유연한 근육질"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 체형 직접 작성"
   ]
  ],
  "group": "build"
 },
 {
  "key": "height impression",
  "label": "Height Impression",
  "ko": "키 인상",
  "options": [
   [
    "",
    "AUTO — 전체 비율에서 자동 결정"
   ],
   [
    "short",
    "Short — 비교적 작은 키 인상"
   ],
   [
    "average",
    "Average — 평균적인 키 인상"
   ],
   [
    "tall",
    "Tall — 장신 인상"
   ],
   [
    "very tall",
    "Very Tall — 매우 큰 키 인상"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 키/비율 직접 작성"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "shoulder build",
  "label": "Shoulder Build",
  "ko": "어깨 체형",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "narrow",
    "Narrow — 좁은 어깨"
   ],
   [
    "average",
    "Average — 평균적인 어깨"
   ],
   [
    "broad",
    "Broad — 넓은 어깨"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "torso / chest build",
  "label": "Torso / Chest Build",
  "ko": "상체/흉곽 인상",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "slim",
    "Slim — 얇고 가벼운 상체"
   ],
   [
    "balanced",
    "Balanced — 균형 잡힌 상체"
   ],
   [
    "full",
    "Full — 풍만한 상체"
   ],
   [
    "powerful",
    "Powerful — 넓고 강한 흉곽"
   ],
   [
    "v-taper",
    "V-taper — 어깨에서 허리로 급히 좁아지는 상체"
   ],
   [
    "full bust",
    "Full Bust — 가슴 볼륨이 뚜렷한 상체"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "torso length",
  "label": "Torso Length",
  "ko": "몸통 길이",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "short",
    "Short — 짧은 몸통"
   ],
   [
    "balanced",
    "Balanced — 보통"
   ],
   [
    "long",
    "Long — 긴 몸통"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "waist / hip silhouette",
  "label": "Waist / Hip Silhouette",
  "ko": "허리/골반 실루엣",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "straight",
    "Straight — 직선적인 실루엣"
   ],
   [
    "athletic",
    "Athletic — 운동형 허리/골반"
   ],
   [
    "balanced",
    "Balanced — 균형형"
   ],
   [
    "hourglass",
    "Hourglass — 허리가 잘록한 모래시계형"
   ],
   [
    "curvy",
    "Curvy — 골반 곡선이 강조된 형태"
   ],
   [
    "narrow-hipped",
    "Narrow-hipped — 골반이 좁은 형태"
   ],
   [
    "broad-hipped",
    "Broad-hipped — 골반이 넓게 벌어진 형태"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "leg proportion",
  "label": "Leg Proportion",
  "ko": "다리 비율",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "balanced",
    "Balanced — 균형형"
   ],
   [
    "long",
    "Long — 긴 다리"
   ],
   [
    "very long",
    "Very Long — 매우 긴 다리"
   ],
   [
    "powerful",
    "Powerful — 굵고 힘 있는 다리"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "lower-body build",
  "label": "Lower-body Build",
  "ko": "하체 굵기",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "slender",
    "Slender — 가는 하체"
   ],
   [
    "balanced",
    "Balanced — 보통"
   ],
   [
    "full",
    "Full — 굵은 하체"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type"
 },
 {
  "key": "body measurements (B/W/H)",
  "label": "Body Measurements",
  "ko": "신체 치수 B/W/H",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "build",
  "sub": "body type",
  "ph": "94 / 61 / 95"
 },
 {
  "key": "facial character",
  "label": "Facial Character",
  "ko": "얼굴 인상",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 성격에 맞춰 자동 결정"
   ],
   [
    "elegant",
    "Elegant — 우아하고 정제된 인상"
   ],
   [
    "cool",
    "Cool — 차갑고 세련된 인상"
   ],
   [
    "sharp",
    "Sharp — 예리하고 공격적인 인상"
   ],
   [
    "mature",
    "Mature — 성숙하고 안정된 인상"
   ],
   [
    "soft",
    "Soft — 부드럽고 온화한 인상"
   ],
   [
    "glamorous",
    "Glamorous — 화려하고 매력적인 인상"
   ],
   [
    "rugged",
    "Rugged — 거칠고 강인한 인상"
   ],
   [
    "stoic",
    "Stoic — 무표정하고 절제된 인상"
   ],
   [
    "weathered",
    "Weathered — 풍상을 겪은 거친 인상"
   ],
   [
    "boyish",
    "Boyish — 앳되고 장난기 있는 인상"
   ],
   [
    "regal",
    "Regal — 위엄 있고 고압적인 인상"
   ],
   [
    "cute",
    "Cute — 귀엽고 사랑스러운 인상"
   ],
   [
    "doll-like",
    "Doll-like — 인형처럼 정제된 인상"
   ],
   [
    "cheerful",
    "Cheerful — 밝고 명랑한 인상"
   ],
   [
    "innocent",
    "Innocent — 맑고 순수해 보이는 인상"
   ],
   [
    "friendly",
    "Friendly — 다가가기 쉬운 인상"
   ],
   [
    "sleepy-eyed",
    "Sleepy-eyed — 나른한 인상"
   ],
   [
    "refined",
    "Refined — 단정하고 세련된 인상"
   ],
   [
    "fierce",
    "Fierce — 사납고 거센 인상"
   ],
   [
    "exotic",
    "Exotic — 이국적인 인상"
   ],
   [
    "androgynous",
    "Androgynous — 중성적인 인상"
   ],
   [
    "melancholic",
    "Melancholic — 어딘가 쓸쓸한 인상"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 얼굴 인상 직접 작성"
   ]
  ],
  "group": "face"
 },
 {
  "key": "skin tone",
  "label": "Skin Tone",
  "ko": "피부 톤",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "pale",
    "Pale — 매우 밝은 피부"
   ],
   [
    "light",
    "Light — 밝은 피부"
   ],
   [
    "medium",
    "Medium — 중간 피부톤"
   ],
   [
    "tan",
    "Tan — 태닝된 피부"
   ],
   [
    "deep",
    "Deep — 짙은 피부톤"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face"
 },
 {
  "key": "face shape",
  "label": "Face Shape",
  "ko": "얼굴형",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 디자인에서 자동 추론"
   ],
   [
    "oval",
    "Oval — 균형 잡힌 타원형"
   ],
   [
    "angular",
    "Angular — 각지고 선명한 얼굴형"
   ],
   [
    "heart-shaped",
    "Heart-shaped — 이마가 넓고 턱이 가는 하트형"
   ],
   [
    "elongated",
    "Elongated — 길고 세련된 얼굴형"
   ],
   [
    "compact",
    "Compact — 짧고 응축된 얼굴형"
   ],
   [
    "softly rounded",
    "Softly Rounded — 부드럽고 둥근 얼굴형"
   ],
   [
    "sharp",
    "Sharp — 턱선과 골격이 날카로운 얼굴형"
   ],
   [
    "__custom__",
    "직접 입력… — 얼굴형 직접 작성"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eye shape",
  "label": "Eye Shape",
  "ko": "눈매",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "narrow",
    "Narrow — 가늘고 날카로운 눈"
   ],
   [
    "almond",
    "Almond — 아몬드형 눈"
   ],
   [
    "large",
    "Large — 큰 눈"
   ],
   [
    "sharp",
    "Sharp — 강하게 치켜올라간 눈"
   ],
   [
    "drooping",
    "Drooping — 살짝 처진 부드러운 눈"
   ],
   [
    "upturned",
    "Upturned — 끝이 올라간 눈"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eye color",
  "label": "Eye Color",
  "ko": "눈동자 색 · 오른쪽",
  "options": [
   [
    "",
    "AUTO — 나라 팔레트에서 자동 결정"
   ],
   [
    "red",
    "Red — 적색"
   ],
   [
    "crimson",
    "Crimson — 진홍색"
   ],
   [
    "amber",
    "Amber — 호박색"
   ],
   [
    "gold",
    "Gold — 금색"
   ],
   [
    "orange",
    "Orange — 주황색"
   ],
   [
    "green",
    "Green — 녹색"
   ],
   [
    "teal",
    "Teal — 청록색"
   ],
   [
    "pale blue",
    "Pale Blue — 옅은 하늘색"
   ],
   [
    "blue",
    "Blue — 청색"
   ],
   [
    "navy",
    "Navy — 짙은 남색"
   ],
   [
    "purple",
    "Purple — 보라색"
   ],
   [
    "lavender",
    "Lavender — 연보라"
   ],
   [
    "pink",
    "Pink — 분홍색"
   ],
   [
    "gray",
    "Gray — 회색"
   ],
   [
    "silver",
    "Silver — 은색"
   ],
   [
    "brown",
    "Brown — 갈색"
   ],
   [
    "black",
    "Black — 검은색"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "second eye color",
  "label": "Second Eye Color",
  "ko": "오드아이 · 왼쪽 눈",
  "group": "face",
  "sub": "facial character",
  "options": [
   [
    "",
    "사용 안 함 — 양쪽 같은 색"
   ],
   [
    "red",
    "Red — 적색"
   ],
   [
    "crimson",
    "Crimson — 진홍색"
   ],
   [
    "amber",
    "Amber — 호박색"
   ],
   [
    "gold",
    "Gold — 금색"
   ],
   [
    "orange",
    "Orange — 주황색"
   ],
   [
    "green",
    "Green — 녹색"
   ],
   [
    "teal",
    "Teal — 청록색"
   ],
   [
    "pale blue",
    "Pale Blue — 옅은 하늘색"
   ],
   [
    "blue",
    "Blue — 청색"
   ],
   [
    "navy",
    "Navy — 짙은 남색"
   ],
   [
    "purple",
    "Purple — 보라색"
   ],
   [
    "lavender",
    "Lavender — 연보라"
   ],
   [
    "pink",
    "Pink — 분홍색"
   ],
   [
    "gray",
    "Gray — 회색"
   ],
   [
    "silver",
    "Silver — 은색"
   ],
   [
    "brown",
    "Brown — 갈색"
   ],
   [
    "black",
    "Black — 검은색"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 색 직접 작성"
   ]
  ]
 },
 {
  "key": "face length",
  "label": "Face Length",
  "ko": "얼굴 길이",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "short",
    "Short — 짧은 얼굴"
   ],
   [
    "balanced",
    "Balanced — 보통"
   ],
   [
    "long",
    "Long — 긴 얼굴"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "face width",
  "label": "Face Width",
  "ko": "얼굴 폭",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "narrow",
    "Narrow — 좁은 얼굴"
   ],
   [
    "medium",
    "Medium — 보통"
   ],
   [
    "wide",
    "Wide — 넓은 얼굴"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "jaw & chin",
  "label": "Jaw & Chin",
  "ko": "턱선 · 턱끝",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "soft rounded jaw",
    "Soft — 부드럽고 둥근 턱"
   ],
   [
    "balanced jawline",
    "Balanced — 보통"
   ],
   [
    "angular defined jaw",
    "Angular — 각지고 또렷한 턱"
   ],
   [
    "square broad jaw",
    "Square — 넓고 각진 사각 턱"
   ],
   [
    "narrow tapered chin",
    "Tapered — 아래로 갈수록 좁아지는 턱끝"
   ],
   [
    "wide heavy chin",
    "Heavy — 넓고 묵직한 턱끝"
   ],
   [
    "long chin with defined jaw",
    "Long — 턱끝이 길고 턱선이 또렷한"
   ],
   [
    "receding soft chin",
    "Receding — 턱끝이 뒤로 물러난"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eye size",
  "label": "Eye Size",
  "ko": "눈 크기",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "small",
    "Small — 작은 눈"
   ],
   [
    "medium",
    "Medium — 보통"
   ],
   [
    "large",
    "Large — 큰 눈"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eye tilt",
  "label": "Eye Tilt",
  "ko": "눈꼬리 각도",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "downturned outer corners",
    "Downturned — 처진 눈꼬리"
   ],
   [
    "level outer corners",
    "Level — 수평"
   ],
   [
    "upturned outer corners",
    "Upturned — 올라간 눈꼬리"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eye spacing",
  "label": "Eye Spacing",
  "ko": "눈 간격",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "close-set eyes",
    "Close-set — 눈 사이가 가까운"
   ],
   [
    "average eye spacing",
    "Average — 눈 하나 너비 안팎"
   ],
   [
    "wide-set eyes",
    "Wide-set — 눈 사이가 넓은"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "eyebrows",
  "label": "Eyebrows",
  "ko": "눈썹",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "fine soft arches",
    "Fine Arch — 가늘고 완만한 곡선"
   ],
   [
    "long arched brows",
    "Long Arch — 길고 바깥 아치가 선명한"
   ],
   [
    "straight medium brows",
    "Straight — 중간 두께의 직선"
   ],
   [
    "thin straight brows",
    "Thin Straight — 가늘고 곧은"
   ],
   [
    "thick low brows",
    "Thick Low — 굵고 눈 가까이 낮은"
   ],
   [
    "angled brows",
    "Angled — 바깥에서 꺾이는 사선"
   ],
   [
    "short rounded brows",
    "Short Round — 짧고 둥근"
   ],
   [
    "feathered full brows",
    "Feathered — 숱 많고 결이 보이는"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "nose character",
  "label": "Nose Character",
  "ko": "코",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "small delicate nose",
    "Delicate — 작고 여린 코"
   ],
   [
    "balanced nose",
    "Balanced — 보통"
   ],
   [
    "prominent defined nose",
    "Prominent — 크고 또렷한 코"
   ],
   [
    "straight slender bridge",
    "Straight — 곧고 가는 콧대"
   ],
   [
    "aquiline nose with convex bridge",
    "Aquiline — 콧대가 볼록한 매부리코"
   ],
   [
    "rounded soft tip",
    "Rounded Tip — 코끝이 둥근"
   ],
   [
    "broad low bridge",
    "Broad Low — 콧대가 낮고 넓은"
   ],
   [
    "short nose with upturned tip",
    "Upturned — 짧고 코끝이 들린"
   ],
   [
    "long nose with low tip",
    "Long — 길고 코끝이 내려온"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "lips",
  "label": "Lips",
  "ko": "입술",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "thin lips",
    "Thin — 얇은 입술"
   ],
   [
    "medium lips",
    "Medium — 보통"
   ],
   [
    "full lips",
    "Full — 도톰한 입술"
   ],
   [
    "fuller lower lip",
    "Fuller Lower — 아랫입술이 더 도톰한"
   ],
   [
    "bow-shaped upper lip",
    "Bow — 윗입술이 활 모양인"
   ],
   [
    "straight even lips",
    "Even — 굴곡 없이 곧은"
   ],
   [
    "wide mouth",
    "Wide — 입이 넓은"
   ],
   [
    "small mouth",
    "Small — 입이 작은"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "face",
  "sub": "facial character"
 },
 {
  "key": "hair color",
  "label": "Hair Color",
  "ko": "머리색",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 색상에 맞춰 자동 결정"
   ],
   [
    "white",
    "White — 흰색"
   ],
   [
    "platinum",
    "Platinum — 백금색"
   ],
   [
    "silver",
    "Silver — 은색"
   ],
   [
    "ash blonde",
    "Ash Blonde — 애시 블론드"
   ],
   [
    "blonde",
    "Blonde — 금발"
   ],
   [
    "gold",
    "Gold — 금색"
   ],
   [
    "orange",
    "Orange — 주황색"
   ],
   [
    "red",
    "Red — 붉은색"
   ],
   [
    "crimson",
    "Crimson — 진홍색"
   ],
   [
    "pink",
    "Pink — 분홍색"
   ],
   [
    "purple",
    "Purple — 보라색"
   ],
   [
    "lavender",
    "Lavender — 연보라"
   ],
   [
    "navy",
    "Navy — 짙은 남색"
   ],
   [
    "blue",
    "Blue — 파란색"
   ],
   [
    "teal",
    "Teal — 청록색"
   ],
   [
    "mint",
    "Mint — 민트색"
   ],
   [
    "green",
    "Green — 녹색"
   ],
   [
    "brown",
    "Brown — 갈색"
   ],
   [
    "black",
    "Black — 검은색"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 색 직접 작성"
   ]
  ],
  "group": "hair"
 },
 {
  "key": "hairstyle",
  "label": "Hairstyle",
  "ko": "헤어스타일",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 디자인에 맞춰 자동 결정"
   ],
   [
    "bob",
    "Bob — 단정한 보브컷"
   ],
   [
    "pixie cut",
    "Pixie Cut — 짧고 가벼운 픽시컷"
   ],
   [
    "layered",
    "Layered — 층을 살린 레이어드"
   ],
   [
    "ponytail",
    "Ponytail — 포니테일"
   ],
   [
    "twin tail",
    "Twin Tail — 트윈테일"
   ],
   [
    "wolf cut",
    "Wolf Cut — 층감이 강한 울프컷"
   ],
   [
    "slicked back",
    "Slicked Back — 뒤로 넘긴 스타일"
   ],
   [
    "wavy",
    "Wavy — 웨이브 헤어"
   ],
   [
    "straight",
    "Straight — 곧은 생머리"
   ],
   [
    "side ponytail",
    "Side Ponytail — 사이드 포니테일"
   ],
   [
    "high ponytail",
    "High Ponytail — 높이 묶은 포니테일"
   ],
   [
    "braid",
    "Single Braid — 한 갈래 땋은 머리"
   ],
   [
    "twin braids",
    "Twin Braids — 양갈래 땋은 머리"
   ],
   [
    "crown braid",
    "Crown Braid — 머리를 둘러 땋은 왕관형"
   ],
   [
    "chignon",
    "Chignon — 단정하게 말아 올린 시뇽"
   ],
   [
    "messy bun",
    "Messy Bun — 흐트러진 번"
   ],
   [
    "top knot",
    "Top Knot — 정수리에 묶어 올린 번"
   ],
   [
    "low bun",
    "Low Bun — 목덜미 낮은 번"
   ],
   [
    "half-up",
    "Half-up — 반묶음"
   ],
   [
    "space buns",
    "Space Buns — 양쪽 동그란 번"
   ],
   [
    "hime cut",
    "Hime Cut — 히메컷"
   ],
   [
    "asymmetric cut",
    "Asymmetric Cut — 좌우 길이가 다른 비대칭컷"
   ],
   [
    "undercut",
    "Undercut — 옆/뒤를 밀어낸 언더컷"
   ],
   [
    "side-shaved long hair",
    "Side-shaved Long — 한쪽만 밀고 나머지는 긴 머리"
   ],
   [
    "curly",
    "Curly — 굵은 곱슬"
   ],
   [
    "tight curls",
    "Tight Curls — 잔곱슬 / 아프로"
   ],
   [
    "locs",
    "Locs — 로크스 / 드레드풍"
   ],
   [
    "ringlet curls",
    "Ringlet Curls — 세로로 말린 드릴 컬"
   ],
   [
    "finger waves",
    "Finger Waves — 레트로 웨이브"
   ],
   [
    "feathered",
    "Feathered — 끝을 가볍게 친 페더컷"
   ],
   [
    "blunt cut",
    "Blunt Cut — 끝을 일자로 자른 컷"
   ],
   [
    "wet-look slick",
    "Wet-look Slick — 젖은 듯 넘긴 스타일"
   ],
   [
    "windswept",
    "Windswept — 바람에 날린 듯한 스타일"
   ],
   [
    "buzz cut",
    "Buzz Cut — 아주 짧게 민 머리"
   ],
   [
    "crew cut",
    "Crew Cut — 짧고 단정한 크루컷"
   ],
   [
    "side part",
    "Side Part — 가르마를 탄 단정한 컷"
   ],
   [
    "fade",
    "Fade — 옆을 그라데이션으로 짧게 친 컷"
   ],
   [
    "man bun",
    "Man Bun — 뒤로 묶어 올린 번"
   ],
   [
    "swept back",
    "Swept Back — 뒤로 넘긴 볼륨 있는 스타일"
   ],
   [
    "shaggy",
    "Shaggy — 덥수룩하게 흐트러진 컷"
   ],
   [
    "mullet",
    "Mullet — 앞은 짧고 뒤만 긴 컷"
   ],
   [
    "afro",
    "Afro — 둥글게 부풀린 아프로"
   ],
   [
    "afro puffs",
    "Afro Puffs — 양쪽 아프로 퍼프"
   ],
   [
    "box braids",
    "Box Braids — 가는 박스 브레이드"
   ],
   [
    "cornrows",
    "Cornrows — 두피에 붙여 땋은 콘로"
   ],
   [
    "fishtail braid",
    "Fishtail Braid — 한쪽으로 넘긴 피시테일"
   ],
   [
    "beach waves",
    "Beach Waves — 느슨한 해변 웨이브"
   ],
   [
    "__custom__",
    "직접 입력… — 헤어스타일 직접 작성"
   ]
  ],
  "group": "hair"
 },
 {
  "key": "hair length",
  "label": "Hair Length",
  "ko": "머리 길이",
  "options": [
   [
    "",
    "AUTO — 장수 설계표 실루엣에 맞춰 자동 결정"
   ],
   [
    "very short",
    "Very Short — 매우 짧은 머리"
   ],
   [
    "short",
    "Short — 짧은 머리"
   ],
   [
    "medium",
    "Medium — 중간 길이"
   ],
   [
    "long",
    "Long — 긴 머리"
   ],
   [
    "very long",
    "Very Long — 매우 긴 머리"
   ],
   [
    "__custom__",
    "직접 입력… — 길이 직접 작성"
   ]
  ],
  "group": "hair",
  "sub": "hairstyle"
 },
 {
  "key": "bangs",
  "label": "Bangs",
  "ko": "앞머리",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "none",
    "None — 앞머리 없음"
   ],
   [
    "straight bangs",
    "Straight Bangs — 일자 앞머리"
   ],
   [
    "side-swept bangs",
    "Side-swept Bangs — 옆으로 넘긴 앞머리"
   ],
   [
    "curtain bangs",
    "Curtain Bangs — 커튼뱅"
   ],
   [
    "long side bangs",
    "Long Side Bangs — 긴 사이드뱅"
   ],
   [
    "long side bangs covering one eye",
    "One-eye Cover — 한쪽 눈을 덮는 긴 사이드뱅"
   ],
   [
    "asymmetric bangs",
    "Asymmetric Bangs — 좌우 길이가 다른 앞머리"
   ],
   [
    "parted bangs",
    "Parted Bangs — 가운데를 가른 앞머리"
   ],
   [
    "choppy bangs",
    "Choppy Bangs — 끝을 불규칙하게 친 앞머리"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "hair",
  "sub": "hairstyle"
 },
 {
  "key": "hair accent",
  "label": "Hair Accent",
  "ko": "머리 삐침 · 잔머리",
  "group": "hair",
  "sub": "hairstyle",
  "options": [
   [
    "",
    "AUTO — 지정 안 함"
   ],
   [
    "a single antenna strand standing up",
    "Antenna Strand — 안테나 헤어 한 가닥"
   ],
   [
    "two antenna strands standing up",
    "Twin Antennae — 안테나 헤어 두 가닥"
   ],
   [
    "a prominent cowlick",
    "Cowlick — 크게 뻗친 가마머리"
   ],
   [
    "loose stray strands framing the face",
    "Stray Strands — 얼굴 옆 잔머리"
   ],
   [
    "neatly kept, no stray strands",
    "Neat — 삐침 없이 정돈"
   ],
   [
    "__custom__",
    "직접 입력… — 원하는 형태 직접 작성"
   ]
  ]
 },
 {
  "key": "hair texture",
  "label": "Hair Texture",
  "ko": "머릿결",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "fine",
    "Fine — 가늘고 매끄러운"
   ],
   [
    "medium",
    "Medium — 보통"
   ],
   [
    "thick",
    "Thick — 굵고 뻣뻣한"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "hair",
  "sub": "hairstyle"
 },
 {
  "key": "hair volume",
  "label": "Hair Volume",
  "ko": "머리 볼륨",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "flat",
    "Flat — 납작한"
   ],
   [
    "moderate",
    "Moderate — 보통"
   ],
   [
    "full",
    "Full — 풍성한"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "hair",
  "sub": "hairstyle"
 },
 {
  "key": "parting",
  "label": "Parting",
  "ko": "가르마",
  "options": [
   [
    "",
    "AUTO — 자동 결정"
   ],
   [
    "center part",
    "Center — 가운데 가르마"
   ],
   [
    "slight off-center part",
    "Slight off-center — 살짝 비낀 가르마"
   ],
   [
    "deep side part",
    "Deep side — 깊은 옆 가르마"
   ],
   [
    "no visible part",
    "None — 가르마 없음"
   ],
   [
    "swept back",
    "Swept back — 뒤로 넘긴"
   ],
   [
    "__custom__",
    "직접 입력…"
   ]
  ],
  "group": "hair",
  "sub": "hairstyle"
 }
],
    IDENTITY_GROUPS: [
 "base",
 "build",
 "face",
 "hair"
],
    IDENTITY_EXCLUDED: [],
    FACE_KEYS: [
 "face shape",
 "face length",
 "face width",
 "jaw & chin",
 "eye shape",
 "eye size",
 "eye tilt",
 "eye spacing",
 "eyebrows",
 "nose character",
 "lips"
],
    FACE_PARAM: {
 "face_shape": "face shape",
 "eyes": "eye shape",
 "brows": "eyebrows",
 "nose": "nose character",
 "lips": "lips",
 "eye_color": "eye color"
},
    SIL_PARAM: {
 "body": "body type",
 "hair": "hairstyle",
 "hair_color": "hair color"
},
    LOOK_KO: {
 "face": {
  "face_shape": "윤곽",
  "eyes": "눈",
  "brows": "눈썹",
  "nose": "코",
  "lips": "입",
  "eye_color": "눈 색"
 },
 "sil": {
  "body": "체형",
  "hair": "머리 윤곽",
  "hair_color": "머리색"
 }
},
    VOCAB_EN: {
 "body": {
  "petite": "petite, small-framed",
  "slender": "slender",
  "lanky": "lean and long-legged, with a natural neck length",
  "athletic": "athletic",
  "curvy": "curvy",
  "tall_statuesque": "statuesque, long-legged, with a natural neck length",
  "broad_strong": "broad-shouldered and strong",
  "hourglass": "hourglass-figured — full bust and hips, distinctly narrow-waisted",
  "voluptuous": "voluptuous, generously curved at bust, hips and thighs",
  "busty_slender": "slender-limbed yet full-busted with rounded hips and a narrow waist",
  "curvy_athletic": "toned athletic-curvy, full-busted with rounded hips",
  "tall_curvy": "tall and statuesque with long legs and a full, curvaceous figure — full bust and hips, narrow waist",
  "strong_curvy": "strong and broad-shouldered with firm muscle, yet full-busted with wide rounded hips and a defined waist",
  "petite_curvy": "petite and compact yet curvaceous — full bust and rounded hips on a small frame",
  "pear_curvy": "pear-shaped and curvaceous — slimmer shoulders over a narrow waist, full rounded hips and thick thighs, a full bust",
  "willowy_curvy": "willowy and long-limbed with soft curves — a full bust, rounded hips and a slender waist"
 },
 "hair": {
  "short_crop": "short cropped hair",
  "bob": "a bob",
  "ponytail": "a long ponytail",
  "long_straight": "long straight hair",
  "long_wavy": "long wavy hair",
  "updo_bun": "an updo bun",
  "braids": "long braids",
  "voluminous": "voluminous hair",
  "twin_tails": "twin tails",
  "side_swept": "long side-swept hair",
  "half_up": "long hair worn half-up, half-down",
  "low_ponytail": "a low ponytail tied at the nape",
  "side_ponytail": "a side ponytail over one shoulder",
  "side_braid": "a single thick braid over one shoulder",
  "braided_crown": "a braided crown with the rest flowing long",
  "hime_cut": "a hime cut — long straight hair with blunt cheek-length sidelocks",
  "wolf_cut": "a shaggy layered wolf cut",
  "pixie": "a pixie cut",
  "double_buns": "twin buns high on the head",
  "chignon": "an elegant low chignon",
  "long_layered": "long layered hair",
  "lob": "a shoulder-length lob",
  "messy_bun": "a loose messy bun with fallen strands"
 },
 "hair_color": {
  "antique_gold": "antique-gold hair",
  "ash_gray": "ash-gray hair",
  "bright_red": "bright red hair",
  "bronze": "warm bronze hair",
  "crimson": "crimson-red hair",
  "cyan": "bright cyan hair",
  "flame_orange": "flame-orange hair",
  "golden_blonde": "golden blonde hair",
  "grass_green": "grass-green hair",
  "lemon_yellow": "lemon-yellow hair",
  "navy": "deep navy-blue hair",
  "ocean_blue": "ocean-blue hair",
  "royal_blue": "royal-blue hair",
  "royal_purple": "royal-purple hair",
  "silver_white": "silver-white hair",
  "sunset_pink": "sunset-pink hair",
  "teal": "teal hair",
  "violet": "violet hair",
  "wine_red": "deep wine-red hair",
  "jet_black": "glossy jet-black hair",
  "blue_black": "blue-black hair with a cold indigo sheen",
  "ink_blue": "deep ink-blue hair",
  "ink_green": "ink-black hair with a deep green sheen",
  "jade_green": "pale jade-green hair",
  "chestnut": "warm chestnut-brown hair",
  "dark_brown": "dark brown hair",
  "dark_auburn": "dark auburn hair with red highlights",
  "plum_black": "plum-black hair with a violet sheen",
  "copper": "polished copper-red hair",
  "platinum_blonde": "platinum-blonde hair",
  "strawberry_blonde": "strawberry-blonde hair",
  "honey_brown": "honey-brown hair",
  "caramel": "caramel-brown hair",
  "burgundy": "deep burgundy hair",
  "cherry_pink": "cherry-blossom pink hair",
  "rose_gold": "rose-gold hair",
  "magenta": "vivid magenta hair",
  "lavender": "soft lavender hair",
  "smoky_lilac": "smoky lilac-gray hair",
  "indigo": "deep indigo hair",
  "sky_blue": "pale sky-blue hair",
  "mint": "pale mint-green hair",
  "emerald_green": "deep emerald-green hair",
  "ombre_crimson": "black hair fading to crimson at the tips",
  "ombre_azure": "silver hair fading to azure at the tips"
 },
 "eye_color": {
  "amber": "amber eyes",
  "azure": "azure-blue eyes",
  "coral": "coral-orange eyes",
  "crimson": "crimson eyes",
  "ember": "ember-orange eyes",
  "emerald": "emerald-green eyes",
  "forest_green": "forest-green eyes",
  "gold": "gold eyes",
  "ice_blue": "ice-blue eyes",
  "leaf_green": "leaf-green eyes",
  "navy": "navy-blue eyes",
  "sky_blue": "sky-blue eyes",
  "steel_blue": "steel-blue eyes",
  "teal": "teal eyes",
  "violet": "pale violet eyes",
  "graphite_grey": "graphite-grey eyes",
  "hazel": "hazel eyes",
  "honey": "honey-gold eyes",
  "dark_brown": "dark brown eyes",
  "rose": "rose-pink eyes",
  "lilac": "pale lilac eyes",
  "magenta": "magenta eyes",
  "aqua": "clear aqua eyes",
  "jade": "jade-green eyes",
  "sapphire": "sapphire-blue eyes",
  "indigo": "deep indigo-blue eyes",
  "silver": "silver-grey eyes",
  "obsidian": "near-black obsidian eyes"
 },
 "face_shape": {
  "oval": "oval face",
  "round": "round face",
  "heart": "heart-shaped face",
  "long": "long face",
  "square_soft": "softly square face",
  "diamond": "diamond-shaped face",
  "v_line": "delicate V-line face with a small, soft chin",
  "inverted_triangle": "softly tapered face narrowing to a small, soft chin",
  "angular": "refined face with gently defined cheekbones"
 },
 "eyes": {
  "almond_wide": "wide almond eyes",
  "round_large": "large round eyes",
  "narrow_upturned": "narrow upturned eyes",
  "droopy_soft": "soft droopy eyes",
  "deep_set": "deep-set eyes",
  "monolid_long": "long monolid eyes",
  "phoenix": "long phoenix eyes with lifted outer corners",
  "hooded": "hooded eyes",
  "cat": "feline cat eyes",
  "peach_blossom": "peach-blossom eyes with a soft, curved lower lid"
 },
 "brows": {
  "straight_thick": "thick straight brows",
  "arched_thin": "thin arched brows",
  "soft_round": "soft rounded brows",
  "angled_sharp": "sharp angled brows",
  "low_heavy": "low heavy brows",
  "feathered": "soft feathered brows",
  "straight_thin": "thin straight brows",
  "high_arched": "gracefully arched brows"
 },
 "nose": {
  "small_button": "small button nose",
  "straight_narrow": "straight narrow nose",
  "aquiline": "aquiline nose",
  "broad_soft": "broad soft nose",
  "upturned": "upturned nose",
  "high_bridge": "slim, delicate nose with a refined bridge",
  "petite_straight": "petite straight nose"
 },
 "lips": {
  "full_wide": "full wide lips",
  "thin_long": "thin long lips",
  "small_bow": "small bow lips",
  "heart_full": "full heart-shaped lips",
  "wide_smile": "wide smiling mouth",
  "plush_pout": "soft, full lips",
  "thin_bow": "thin lips with a defined cupid's bow",
  "soft_medium": "soft medium lips"
 }
},
    PARAM_GUIDES: {
 "body type": {
  "slender": [
   "골격과 팔다리가 가늘고 연부조직 볼륨이 적어요.",
   "narrow frame and slim limbs, low soft-tissue volume"
  ],
  "athletic": [
   "중간 골격에 운동으로 발달한 근육을 표현해요.",
   "moderate frame with developed functional muscles"
  ],
  "curvy": [
   "허리와 가슴·골반 사이의 부드러운 곡선 차이를 강조해요.",
   "flowing bust-to-waist and hip-to-waist curves"
  ],
  "glamorous": [
   "가슴과 골반의 풍만함, 잘록한 허리로 표현해요. 화장이나 의상 지시는 아니에요.",
   "full bust and hips with a defined waist; anatomy, not makeup or outfit"
  ],
  "muscular": [
   "어깨·팔·몸통·다리에 근육의 두께와 구분이 뚜렷해요.",
   "substantial, visibly defined muscles through torso and limbs"
  ],
  "heavy-built": [
   "넓은 골격과 두꺼운 몸통·팔다리를 뜻해요. 두꺼운 의상이나 키를 뜻하지 않아요.",
   "broad frame, thick torso and limbs; independent of costume and height"
  ],
  "tall and lean": [
   "큰 키에 가늘고 길게 이어지는 몸통과 팔다리를 조합해요.",
   "tall stature, lean torso and long slender limbs"
  ],
  "petite": [
   "작은 성인 골격과 아담한 키예요. 아동 비례로 바꾸지 않아요.",
   "short stature and small adult frame; adult head-to-body proportions"
  ],
  "hourglass": [
   "가슴과 골반의 정면 폭이 비슷하고 허리가 좁아요. 전체 볼륨은 별개예요.",
   "similar bust and hip widths, distinctly narrower waist; volume is separate"
  ],
  "voluptuous": [
   "가슴·골반·허벅지의 풍부한 연부조직과 큰 굴곡을 표현해요.",
   "generous soft-tissue volume at bust, hips and thighs with pronounced curves"
  ],
  "toned": [
   "근육 크기를 키우기보다 피부 아래 잔근육 윤곽을 보여줘요.",
   "subtle muscle definition without large muscle mass"
  ],
  "wiry": [
   "가느다란 골격 위에 힘줄과 단단한 근육 윤곽이 보여요.",
   "slim frame with taut, sinewy muscle definition"
  ],
  "soft-figured": [
   "근육 경계가 두드러지지 않는 부드러운 살집이에요.",
   "soft flesh contours with little visible muscle separation"
  ],
  "pear-shaped": [
   "어깨·가슴보다 골반과 허벅지 쪽에 폭과 볼륨이 많아요.",
   "hips and thighs wider and fuller than shoulders and bust"
  ],
  "inverted triangle": [
   "골반보다 어깨가 넓고 아래로 좁아지는 골격이에요.",
   "shoulders wider than hips, upper body tapering downward"
  ],
  "stocky": [
   "상대적으로 짧은 팔다리와 폭이 있는 단단한 몸통이에요.",
   "compact broad torso and relatively short, sturdy limbs"
  ],
  "statuesque": [
   "큰 키와 균형 잡힌 긴 비례, 탄탄한 볼륨이에요.",
   "tall, balanced long proportions with substantial firm contours"
  ],
  "broad-shouldered": [
   "골반과 비교해 어깨뼈 사이 폭이 넓어요. 견갑 장비 크기와 달라요.",
   "wide skeletal shoulder span relative to hips"
  ],
  "burly": [
   "넓은 골격 위로 몸통과 팔다리의 근육·살집이 두꺼워요.",
   "large broad frame with thick muscular and soft-tissue mass"
  ],
  "lanky": [
   "큰 키에 특히 길고 가느다란 팔다리예요.",
   "tall frame with especially long, thin limbs"
  ],
  "barrel-chested": [
   "흉곽 자체가 앞뒤로 깊고 옆으로 넓어요. 가슴 크기와는 별개예요.",
   "wide, deep ribcage; independent of breast volume"
  ],
  "rangy": [
   "긴 팔다리에 가늘고 유연한 근육이 이어져요.",
   "long limbs with lean, flexible muscle contours"
  ]
 },
 "height impression": {
  "short": [
   "성인 비례 안에서 키가 작게 읽히도록 해요. 화면 속 인물 크기를 줄이지 않아요.",
   "short adult stature; keep subject framing unchanged"
  ],
  "average": [
   "선택한 체형 안에서 키의 크고 작음이 두드러지지 않아요.",
   "moderate stature within the build"
  ],
  "tall": [
   "성인 장신 비례로 표현해요. 카메라를 뒤로 빼라는 뜻은 아니에요.",
   "tall adult stature; preserve framing"
  ],
  "very tall": [
   "장신보다 더 큰 키 인상이며 머리나 관절을 왜곡하지 않아요.",
   "exceptionally tall adult stature with plausible head and joint proportions"
  ]
 },
 "shoulder build": {
  "narrow": [
   "선택한 체형 안에서 어깨뼈 사이 폭을 조금 좁혀요.",
   "relatively narrow skeletal shoulder span within the build"
  ],
  "average": [
   "체형에 맞는 중간 어깨 폭을 유지해요.",
   "moderate skeletal shoulder span within the build"
  ],
  "broad": [
   "골격의 어깨 폭을 넓혀요. 어깨 의상 부피와는 별개예요.",
   "relatively broad skeletal shoulder span, independent of pauldrons"
  ]
 },
 "torso / chest build": {
  "slim": [
   "흉곽의 폭·앞뒤 두께와 상체 살집을 절제해요.",
   "slim ribcage and low upper-torso soft-tissue volume"
  ],
  "balanced": [
   "선택한 체형에 맞는 중간 흉곽·가슴 볼륨이에요.",
   "moderate ribcage and bust volume within the build"
  ],
  "full": [
   "흉곽 주변과 가슴을 포함한 상체의 부드러운 볼륨을 늘려요.",
   "fuller upper-torso soft tissue including bust"
  ],
  "powerful": [
   "흉곽 폭·두께와 등·가슴 주변 근육을 강조해요.",
   "broad deep ribcage with strong upper-torso muscles"
  ],
  "v-taper": [
   "어깨·등의 폭에서 허리로 뚜렷하게 좁아져요.",
   "upper back and shoulders taper distinctly to the waist"
  ],
  "full bust": [
   "가슴 볼륨을 풍성하게, 흉곽·어깨는 자연스러운 비율로 두어 모래시계 선을 살려요.",
   "fuller breast volume with a naturally proportioned ribcage and shoulders, keeping a feminine hourglass line"
  ]
 },
 "torso length": {
  "short": [
   "어깨선에서 골반까지의 길이가 체형 내에서 짧은 편이에요. 복부를 찌그러뜨리지 않아요.",
   "relatively short shoulder-to-pelvis span; retain anatomical spacing"
  ],
  "balanced": [
   "선택한 체형에 맞는 중간 몸통 길이예요.",
   "moderate shoulder-to-pelvis span within the build"
  ],
  "long": [
   "어깨선에서 골반까지의 길이를 조금 길게 잡아요.",
   "relatively long shoulder-to-pelvis span within the build"
  ]
 },
 "waist / hip silhouette": {
  "straight": [
   "허리와 골반 폭의 차이가 적은 윤곽이에요.",
   "small waist-to-hip width contrast"
  ],
  "athletic": [
   "허리가 탄탄하고 골반으로 이어지는 굴곡이 절제돼요.",
   "firm waist with restrained hip curvature"
  ],
  "balanced": [
   "체형에 이미 정한 허리·골반 비율을 과장 없이 유지해요.",
   "retain the build's waist-to-hip ratio without extra exaggeration"
  ],
  "hourglass": [
   "골반보다 허리가 확실히 좁고 양옆 곡선이 이어져요.",
   "distinct waist indentation curving outward into hips"
  ],
  "curvy": [
   "허리에서 골반 바깥으로 이어지는 둥근 곡선을 강조해요.",
   "rounded outward hip curves from the waist"
  ],
  "narrow-hipped": [
   "선택한 골격 안에서 골반 폭을 좁게 잡아요.",
   "relatively narrow pelvic span within the build"
  ],
  "broad-hipped": [
   "골반 자체의 가로 폭을 넓혀요. 허벅지 굵기와는 별개예요.",
   "relatively broad pelvic span; thigh thickness is separate"
  ]
 },
 "leg proportion": {
  "balanced": [
   "몸통에 맞는 다리 길이예요. 굵기는 하체 굵기에서 정해요.",
   "moderate leg length relative to torso"
  ],
  "long": [
   "몸통 대비 다리가 긴 편이며 무릎 위치도 함께 맞춰요.",
   "long hip-to-floor span with proportionate thigh and shin lengths"
  ],
  "very long": [
   "몸통 대비 다리가 특히 길되 관절과 성인 비례를 유지해요.",
   "especially long legs with plausible adult joint proportions"
  ],
  "powerful": [
   "길이보다는 허벅지·종아리의 발달한 근육을 뜻해요.",
   "developed thigh and calf muscles; no implied leg-length change"
  ]
 },
 "lower-body build": {
  "slender": [
   "의상 아래 허벅지·종아리의 굵기를 가늘게 잡아요.",
   "slender anatomical thighs and calves beneath the costume"
  ],
  "balanced": [
   "체형에 맞는 중간 허벅지·종아리 굵기예요.",
   "moderate thigh and calf thickness within the build"
  ],
  "full": [
   "허벅지·종아리 자체의 볼륨을 풍부하게 해요. 의상 부피와 별개예요.",
   "fuller anatomical thighs and calves, independent of costume volume"
  ]
 },
 "face shape": {
  "oval": [
   "광대 부근이 조금 넓고 이마·턱으로 완만하게 좁아지는 타원형이에요.",
   "oval outline, slightly widest at cheekbones with gradual taper"
  ],
  "angular": [
   "광대와 턱 모서리의 방향 전환이 보여요. 턱끝 모양은 턱 설정을 따라요.",
   "visible cheekbone and jaw-angle transitions; chin follows its own setting"
  ],
  "heart-shaped": [
   "이마·광대가 하관보다 넓어요. 턱끝까지 반드시 뾰족할 필요는 없어요.",
   "forehead and cheekbones wider than lower face; chin tip follows its own setting"
  ],
  "elongated": [
   "가로 폭보다 세로 길이가 도드라지는 얼굴형이에요.",
   "vertical face length pronounced relative to width"
  ],
  "compact": [
   "이마부터 턱까지의 구간이 짧고 응축된 성인 얼굴이에요.",
   "compact adult facial proportions with short vertical spacing"
  ],
  "softly rounded": [
   "얼굴 외곽이 넓은 곡선으로 이어져요. 볼살을 자동으로 늘리지 않아요.",
   "rounded outer facial outline with smooth transitions; no added cheek fullness"
  ],
  "sharp": [
   "광대와 하관의 윤곽이 또렷해요. 턱끝과 폭은 세부 선택이 우선이에요.",
   "crisp cheekbone and lower-face contours; explicit width and chin take priority"
  ]
 },
 "jaw & chin": {
  "soft rounded jaw": [
   "하관 폭을 적당히 유지하고 턱끝을 넓은 U자 곡선으로 그려요. 볼살 추가나 V자 턱이 아니에요.",
   "rounded U-shaped lower-face outline with moderate width and a broad curved chin tip; no pointed apex, V taper or added cheek fullness"
  ],
  "balanced jawline": [
   "턱의 폭·각·길이가 두드러지지 않는 완만한 윤곽이에요.",
   "moderate jaw width, angle and chin length with gradual transitions"
  ],
  "angular defined jaw": [
   "귀 아래 턱 모서리와 하악선을 또렷하게 해요. 사각 폭을 강제하지 않아요.",
   "defined mandibular corners and lower-jaw edges; no automatic widening"
  ],
  "square broad jaw": [
   "하관 폭을 유지하고 양쪽 턱 모서리와 넓은 턱끝을 표현해요.",
   "broad lower jaw with squared corners and a wide chin tip"
  ],
  "narrow tapered chin": [
   "볼 아래에서 턱끝으로 확실히 좁아져요. 턱 길이를 늘리지는 않아요.",
   "lower face narrows distinctly toward a small chin tip without lengthening it"
  ],
  "wide heavy chin": [
   "턱끝의 폭과 앞쪽 볼륨을 강조해요. 볼이나 얼굴 전체를 키우지 않아요.",
   "wide, substantial chin tip without enlarging cheeks or the entire face"
  ],
  "long chin with defined jaw": [
   "아랫입술 아래부터 턱끝까지를 길게 하고 턱선을 또렷하게 해요.",
   "longer lower-lip-to-chin span with defined jaw edges"
  ],
  "receding soft chin": [
   "측면에서 턱끝이 아랫입술보다 뒤로 들어가요. 짧은 얼굴과는 달라요.",
   "chin projects less forward than lower lip in profile, with a soft jaw edge"
  ]
 },
 "face length": {
  "short": [
   "헤어라인부터 턱까지의 세로 길이가 상대적으로 짧아요.",
   "relatively short hairline-to-chin span"
  ],
  "balanced": [
   "얼굴형 안에서 과장 없는 중간 세로 길이예요.",
   "moderate hairline-to-chin span within the face shape"
  ],
  "long": [
   "헤어라인부터 턱까지의 세로 길이가 상대적으로 길어요.",
   "relatively long hairline-to-chin span"
  ]
 },
 "face width": {
  "narrow": [
   "광대 사이 가로 폭이 상대적으로 좁아요. 턱끝 모양은 별개예요.",
   "relatively narrow cheekbone-to-cheekbone span; chin shape is separate"
  ],
  "medium": [
   "얼굴형에 맞는 중간 광대 폭이에요.",
   "moderate cheekbone-to-cheekbone span within the face shape"
  ],
  "wide": [
   "광대 사이 가로 폭이 넓어요. 볼살을 더하는 지시가 아니에요.",
   "relatively wide cheekbone span, not extra cheek fat"
  ]
 },
 "eye shape": {
  "narrow": [
   "눈꺼풀 사이 세로 틈이 좁은 눈이에요. 눈꼬리 각도와 구분해요.",
   "low vertical eyelid opening; corner tilt is separate"
  ],
  "almond": [
   "가운데가 넓고 양끝으로 좁아지는 아몬드 윤곽이에요.",
   "almond outline, widest centrally and tapering toward both corners"
  ],
  "large": [
   "눈꺼풀 개방이 큰 기본 눈매예요. 별도 눈 크기 선택이 우선해요.",
   "open, rounded eyelid outline; explicit eye size controls scale"
  ],
  "sharp": [
   "눈꺼풀 선이 또렷하고 바깥쪽이 들린 기본 눈매예요. 별도 각도가 우선해요.",
   "crisp eyelid edges, upward corners unless eye tilt is specified"
  ],
  "drooping": [
   "바깥 눈꼬리가 내려간 기본 눈매예요. 별도 각도가 우선해요.",
   "soft eyelid contour, downward outer corners unless eye tilt is specified"
  ],
  "upturned": [
   "바깥 눈꼬리가 안쪽보다 올라가요. 별도 각도가 우선해요.",
   "outer corners above inner corners unless eye tilt is specified"
  ]
 },
 "eye size": {
  "small": [
   "얼굴 폭에 비해 눈의 크기가 작아요. 눈을 가늘게 뜨는 표정과 달라요.",
   "small eyes relative to face width, not squinting"
  ],
  "medium": [
   "얼굴 폭에 맞는 중간 눈 크기예요.",
   "moderate eye size relative to face width"
  ],
  "large": [
   "얼굴 폭 대비 큰 눈이에요. 나이나 턱 모양은 바꾸지 않아요.",
   "large eyes relative to face width"
  ]
 },
 "eye tilt": {
  "downturned outer corners": [
   "눈의 안쪽 끝보다 바깥 끝을 낮게 그려요.",
   "outer eye corners lower than inner corners"
  ],
  "level outer corners": [
   "눈의 안쪽과 바깥쪽 끝 높이를 비슷하게 맞춰요.",
   "inner and outer eye corners at similar height"
  ],
  "upturned outer corners": [
   "눈의 안쪽 끝보다 바깥 끝을 높게 그려요.",
   "outer eye corners higher than inner corners"
  ]
 },
 "eye spacing": {
  "close-set eyes": [
   "두 눈 사이를 눈 하나 너비보다 좁게 둬요.",
   "inner eye corners closer than one eye width apart"
  ],
  "average eye spacing": [
   "두 눈 사이를 눈 하나 너비 안팎으로 둬요.",
   "about one eye width between the inner corners"
  ],
  "wide-set eyes": [
   "두 눈 사이를 눈 하나 너비보다 넓게 둬요.",
   "more than one eye width between the inner corners"
  ]
 },
 "eyebrows": {
  "fine soft arches": [
   "가늘고 완만한 곡선, 눈과의 거리는 넉넉해요.",
   "fine softly curved brows set high above the eyes"
  ],
  "long arched brows": [
   "눈보다 길게 뻗고 바깥쪽 아치가 또렷해요.",
   "long brows with a clear outer arch"
  ],
  "straight medium brows": [
   "중간 두께의 곧은 눈썹, 눈과의 거리는 보통이에요.",
   "medium straight brows at a moderate height"
  ],
  "thin straight brows": [
   "가늘고 곧은 눈썹이에요.",
   "thin straight brows"
  ],
  "thick low brows": [
   "굵고 눈 가까이 낮게 놓여요.",
   "thick brows set low and close to the eyes"
  ],
  "angled brows": [
   "바깥쪽에서 꺾여 내려가는 사선 눈썹이에요.",
   "brows rising to a defined angle and dropping at the tail"
  ],
  "short rounded brows": [
   "짧고 둥근 눈썹이에요.",
   "short softly rounded brows"
  ],
  "feathered full brows": [
   "숱이 많고 결이 보이는 눈썹이에요.",
   "full brows with visible feathered hair strokes"
  ]
 },
 "nose character": {
  "small delicate nose": [
   "콧대·콧방울·코끝을 얼굴 대비 작고 가늘게 해요.",
   "small nose with fine bridge, narrow alae and small tip"
  ],
  "balanced nose": [
   "코의 길이·폭·돌출을 얼굴 안에서 중간 정도로 해요.",
   "moderate nose length, width and projection relative to face"
  ],
  "prominent defined nose": [
   "콧대와 코끝의 돌출·입체감을 뚜렷하게 해요.",
   "noticeably projecting bridge and tip with defined structure"
  ],
  "straight slender bridge": [
   "콧등이 곧고 콧대 폭이 가늘어요.",
   "straight nasal profile with a narrow bridge"
  ],
  "aquiline nose with convex bridge": [
   "측면 콧등이 바깥으로 볼록하게 휘어요.",
   "convex bridge visible in nasal profile"
  ],
  "rounded soft tip": [
   "코끝이 둥글고 부드러워요. 코 전체를 크게 하지 않아요.",
   "rounded nasal tip without enlarging the whole nose"
  ],
  "broad low bridge": [
   "콧대 높이가 낮고 가로 폭이 넓어요.",
   "low nasal bridge with broad width"
  ],
  "short nose with upturned tip": [
   "코 길이가 짧고 끝이 조금 위로 향해요.",
   "short nasal length with a slightly upward tip"
  ],
  "long nose with low tip": [
   "코 길이가 길고 끝이 아래로 향해요.",
   "long nasal length with a downward tip"
  ]
 },
 "lips": {
  "thin lips": [
   "입술의 붉은 부분 두께가 얇아요. 입 너비는 별개예요.",
   "thin upper and lower vermilion; mouth width is separate"
  ],
  "medium lips": [
   "입술 두께가 중간 정도예요.",
   "moderate upper and lower lip thickness"
  ],
  "full lips": [
   "윗입술·아랫입술의 두께를 도톰하게 해요.",
   "full upper and lower vermilion"
  ],
  "fuller lower lip": [
   "윗입술보다 아랫입술을 더 도톰하게 해요.",
   "lower lip fuller than upper lip"
  ],
  "bow-shaped upper lip": [
   "윗입술 중앙에 두 봉우리와 오목한 홈을 표현해요.",
   "defined Cupid's bow with two peaks and a central dip"
  ],
  "straight even lips": [
   "기본 입술 경계의 굴곡이 작아요. 무표정을 강제하지 않아요.",
   "relatively even lip border at rest; expression may change"
  ],
  "wide mouth": [
   "입꼬리 사이의 가로 길이를 넓혀요. 두께와 달라요.",
   "wide corner-to-corner mouth span; thickness is separate"
  ],
  "small mouth": [
   "입꼬리 사이의 가로 길이를 작게 해요. 나이를 낮추지 않아요.",
   "short corner-to-corner mouth span; preserve adult age"
  ]
 },
 "hair length": {
  "very short": [
   "풀어 놓은 머리 기준 두피 가까이에서 귀 위까지예요. 짧은 고정 컷은 그 범위 안에서 조절해요.",
   "scalp-close to above-ear length; within the selected cut"
  ],
  "short": [
   "풀어 놓은 머리 기준 귀에서 턱선 부근이에요. 픽시·버즈 등은 고유 길이를 유지해요.",
   "ear-to-jaw length unless the selected cut requires shorter hair"
  ],
  "medium": [
   "풀어 놓은 머리 기준 목에서 어깨 부근이에요. 픽시·버즈 등 고정 컷을 늘리지 않아요.",
   "neck-to-shoulder length unless the selected cut fixes another range"
  ],
  "long": [
   "풀어 놓은 머리 기준 어깨 아래에서 등 중간까지예요. 묶은 길이와 구분해요.",
   "below-shoulder to mid-back loose length; tied hair may appear shorter"
  ],
  "very long": [
   "풀어 놓은 머리 기준 허리 또는 그 아래까지예요. 짧은 고정 컷을 덮어쓰지 않아요.",
   "waist-length or longer when loose; preserve any fixed short cut"
  ]
 },
 "hair texture": {
  "fine": [
   "머리카락 한 올이 가늘고 유연해요. 숱이 적다는 뜻은 아니에요.",
   "fine flexible strands, independent of hair density"
  ],
  "medium": [
   "한 올 굵기와 뻣뻣함이 중간 정도예요. 머리 길이와 달라요.",
   "medium strand thickness/stiffness"
  ],
  "thick": [
   "한 올이 굵고 형태를 잘 유지해요. 부피·인종·곱슬은 별개예요.",
   "coarse, firm strands; independent of volume, ethnicity and curl pattern"
  ]
 },
 "hair volume": {
  "flat": [
   "모근이 두피 가까이 붙고 옆으로 부풀지 않아요.",
   "low root lift and little outward fullness"
  ],
  "moderate": [
   "모근 들림과 머리 전체 부피가 중간 정도예요.",
   "moderate root lift and overall fullness"
  ],
  "full": [
   "모근이 들리고 머리 덩어리의 부피가 풍성해요. 머리통을 키우지 않아요.",
   "high root lift and full hair mass without enlarging the skull"
  ]
 },
 "parting": {
  "center part": [
   "정수리에서 이마 중앙으로 가르마가 보여요.",
   "visible central scalp part"
  ],
  "slight off-center part": [
   "중앙에서 조금 벗어난 가르마예요.",
   "visible scalp part slightly off center"
  ],
  "deep side part": [
   "한쪽 관자놀이 쪽으로 치우친 가르마예요.",
   "visible scalp part far to one side"
  ],
  "no visible part": [
   "두피에 선명한 가르마 선이 보이지 않아요. 옆으로 넘긴 앞머리는 가능해요.",
   "no exposed scalp part line; directional fringe is allowed"
  ],
  "swept back": [
   "이마에서 뒤쪽으로 모근 방향을 넘겨요. 앞머리를 골랐다면 그 부분은 유지해요.",
   "roots directed backward; retain explicitly selected fringe"
  ]
 },
 "bangs": {
  "none": [
   "앞으로 내린 앞머리 없이 이마가 드러나요.",
   "no fringe hanging over forehead"
  ],
  "straight bangs": [
   "이마 위 앞머리의 끝이 수평에 가깝게 이어져요.",
   "fringe with a nearly horizontal lower edge"
  ],
  "side-swept bangs": [
   "이마를 비스듬히 가로질러 한쪽으로 흐르는 앞머리예요.",
   "fringe swept diagonally across forehead"
  ],
  "curtain bangs": [
   "가운데가 갈라져 얼굴 양옆으로 곡선처럼 흘러요.",
   "split fringe curving outward on both sides"
  ],
  "long side bangs": [
   "옆으로 흐르는 긴 앞머리예요. 고정된 짧은 컷은 그 범위 안에서 표현해요.",
   "long lateral fringe within the selected cut's length range"
  ],
  "long side bangs covering one eye": [
   "한쪽 눈 위를 머리카락으로 덮어요. 눈 자체를 없애지 않아요.",
   "side fringe occluding one eye, which remains anatomically present"
  ],
  "asymmetric bangs": [
   "좌우 끝 길이가 다른 앞머리예요.",
   "fringe with unequal left and right lengths"
  ],
  "parted bangs": [
   "앞머리를 가운데에서 두 갈래로 나눠요.",
   "fringe divided centrally; scalp part may remain concealed"
  ],
  "choppy bangs": [
   "앞머리 끝이 여러 길이의 층과 삐침으로 나뉘어요.",
   "fringe with uneven, clearly separated tips"
  ]
 },
 "apparent age": {
  "20s": [
   "20대 성인의 얼굴과 신체 비례예요.",
   "adult woman in her twenties"
  ],
  "30s": [
   "30대 성인의 인상이며 노화 흔적을 과장하지 않아요.",
   "adult woman in her thirties; restrained age cues"
  ],
  "40s": [
   "40대 성인의 인상이며 주름을 과장하지 않아요.",
   "adult woman in her forties; natural age cues"
  ],
  "mature adult": [
   "연륜 있는 성인 인상이에요. 정확한 나이는 직접 입력으로 정할 수 있어요.",
   "mature adult woman with visible but restrained age cues"
  ],
  "youthful adult": [
   "20대 성인에 동안 인상을 더해요. 아동의 신체 비례로 바꾸지 않아요.",
   "adult woman in her twenties with youthful styling and adult proportions"
  ]
 },
 "skin tone": {
  "pale": [
   "피부 고유색이 매우 밝아요. 조명을 밝게 하거나 창백하게 탈색하지 않아요.",
   "very light natural skin tone; retain living skin coloration"
  ],
  "light": [
   "피부 고유색이 밝아요. 조명이나 민족을 지정하는 값은 아니에요.",
   "light natural skin tone"
  ],
  "medium": [
   "피부 고유색이 중간 명도예요. 장수 설계표 색을 적용하지 않아요.",
   "medium natural skin tone, independent of source colors"
  ],
  "tan": [
   "따뜻한 황갈색 피부톤이에요. 특정 민족이나 태닝 자국을 강제하지 않아요.",
   "warm tan skin tone; no implied ethnicity or tan lines"
  ],
  "deep": [
   "피부 고유색이 짙어요. 조명으로 어둡게 만드는 것과 달라요.",
   "deep natural skin tone; preserve readable lighting"
  ]
 },
 "facial character": {
  "elegant": [
   "정제된 태도와 섬세한 표정으로 우아함을 표현해요.",
   "composed, graceful demeanor"
  ],
  "cool": [
   "절제된 시선과 담담한 표정의 인상이에요.",
   "reserved, self-possessed demeanor"
  ],
  "sharp": [
   "집중한 시선의 예리한 인상이에요. 턱을 뾰족하게 바꾸지 않아요.",
   "alert, incisive demeanor; no implied pointed jaw"
  ],
  "mature": [
   "침착하고 안정적인 태도예요. 선택한 나이를 올리지 않아요.",
   "self-assured composure without increasing selected age"
  ],
  "soft": [
   "표정의 긴장이 약하고 온화해요. 볼살을 추가하지 않아요.",
   "gentle demeanor without added facial fullness"
  ],
  "glamorous": [
   "정돈된 스타일링과 자신감 있는 인상이에요. 얼굴 구조는 유지해요.",
   "polished, confident glamour without changing facial geometry"
  ],
  "rugged": [
   "꾸밈이 적고 강인한 인상이에요. 흉터를 자동 추가하지 않아요.",
   "unpolished, resilient demeanor; no automatic scars"
  ],
  "stoic": [
   "감정 변화가 적고 절제된 인상이에요.",
   "emotionally restrained demeanor"
  ],
  "weathered": [
   "선택한 나이 안에서 생활감 있는 피부 표현을 더해요.",
   "weather-exposed skin character within the selected age"
  ],
  "boyish": [
   "성인 여성에게 장난스럽고 중성적인 스타일링을 더해요.",
   "playful, tomboyish adult styling"
  ],
  "regal": [
   "침착한 권위와 품위가 느껴지는 인상이에요.",
   "dignified, authoritative composure"
  ],
  "cute": [
   "친근한 표정으로 귀여움을 더해요. 턱·눈 크기나 나이는 바꾸지 않아요.",
   "endearing demeanor without changing age or facial geometry"
  ],
  "doll-like": [
   "피부와 스타일링이 정교하고 단정해요. 인형 관절이나 아동 비례는 아니에요.",
   "meticulously groomed adult styling; no doll anatomy"
  ],
  "cheerful": [
   "활기 있는 시선과 밝은 인상이에요. 장면 표정이 우선이에요.",
   "lively, upbeat demeanor"
  ],
  "innocent": [
   "꾸밈없고 열린 인상이에요. 볼살이나 아동화를 뜻하지 않아요.",
   "open, unguarded demeanor"
  ],
  "friendly": [
   "편안하고 다가가기 쉬운 인상이에요.",
   "approachable, welcoming demeanor"
  ],
  "sleepy-eyed": [
   "눈꺼풀 힘이 풀린 나른한 인상이에요. 눈의 구조는 유지해요.",
   "relaxed eyelids and drowsy demeanor; preserve eye geometry"
  ],
  "refined": [
   "단정하고 절제된 스타일링이에요.",
   "neat, understated grooming and demeanor"
  ],
  "fierce": [
   "강한 집중과 긴장이 느껴지는 인상이에요.",
   "intense, determined demeanor"
  ],
  "exotic": [
   "개성 있는 스타일링을 뜻해요. 특정 민족이나 피부색을 추가하지 않아요.",
   "distinctive styling; no inferred ethnicity or skin-tone change"
  ],
  "androgynous": [
   "성인 여성의 중성적인 스타일링이에요. 신체나 나이를 바꾸지 않아요.",
   "androgynous adult styling without anatomy or age changes"
  ],
  "melancholic": [
   "시선과 미세한 표정에 쓸쓸함을 담아요.",
   "subdued, wistful demeanor"
  ]
 },
 "hairstyle": {
  "bob": [
   "턱선 부근에서 끝나는 보브 윤곽이에요. 길이는 귀 아래~목 범위에서 조절해요.",
   "bob outline ending between below-ear and neck level"
  ],
  "pixie cut": [
   "옆·뒤는 짧고 정수리만 약간 긴 픽시컷이에요. 중간 길이를 골라도 목까지 늘리지 않아요.",
   "cropped sides/nape, slightly longer crown"
  ],
  "layered": [
   "여러 길이의 층으로 머리 윤곽을 만들어요.",
   "distinct graduated layers"
  ],
  "ponytail": [
   "뒤에서 한 갈래로 묶고 남은 머리가 아래로 이어져요.",
   "one rear tie with a hanging tail"
  ],
  "twin tail": [
   "좌우 두 갈래로 묶은 머리예요.",
   "two side ties with hanging tails"
  ],
  "wolf cut": [
   "정수리의 짧은 층과 목덜미의 긴 층을 연결해요.",
   "short layered crown transitioning to longer nape layers"
  ],
  "slicked back": [
   "모근부터 뒤로 매끈하게 빗어 넘겨요.",
   "smooth backward-directed hair from the roots"
  ],
  "wavy": [
   "머리카락이 느슨한 S자 물결을 만들어요.",
   "loose S-shaped waves"
  ],
  "straight": [
   "큰 굴곡 없이 곧게 내려오는 머리예요.",
   "straight strands without waves"
  ],
  "side ponytail": [
   "한쪽 옆에서 한 갈래로 묶어요.",
   "single ponytail tied to one side"
  ],
  "high ponytail": [
   "머리 뒤 높은 위치에서 한 갈래로 묶어요.",
   "single ponytail tied high on the head"
  ],
  "braid": [
   "한 갈래를 규칙적으로 엮어 땋아요.",
   "one interwoven braid"
  ],
  "twin braids": [
   "좌우 두 갈래를 각각 땋아요.",
   "two interwoven braids"
  ],
  "crown braid": [
   "땋은 머리를 머리 둘레로 감아요.",
   "braid wrapped around the head"
  ],
  "chignon": [
   "뒤통수 아래에서 머리를 매끈하게 말아 고정해요.",
   "smooth coiled updo at the lower rear head"
  ],
  "messy bun": [
   "한 덩어리로 말아 묶고 일부 가닥을 느슨하게 남겨요.",
   "loosely gathered bun; stray strands follow the accent setting"
  ],
  "top knot": [
   "정수리에서 머리를 말아 한 덩어리로 묶어요.",
   "single coiled bun at the crown"
  ],
  "low bun": [
   "목덜미 가까이에 낮게 말아 묶어요.",
   "single bun near the nape"
  ],
  "half-up": [
   "윗부분만 묶고 아래 머리는 풀어 두어요.",
   "upper section tied back, lower section loose"
  ],
  "space buns": [
   "머리 좌우에 둥근 번을 하나씩 만들어요.",
   "two rounded side buns"
  ],
  "hime cut": [
   "일자 앞머리와 턱 부근 옆머리, 긴 뒷머리의 단차예요.",
   "blunt fringe, cheek-to-jaw side locks and longer back section"
  ],
  "asymmetric cut": [
   "좌우 머리 끝 길이가 다른 컷이에요.",
   "unequal left and right cut lengths"
  ],
  "undercut": [
   "옆·뒤의 아래층을 짧게 밀고 윗머리를 남겨요.",
   "closely clipped lower sides or nape under a longer top"
  ],
  "side-shaved long hair": [
   "한쪽 옆만 짧게 밀고 나머지는 어깨 아래로 길게 남겨요.",
   "one clipped side, remaining hair below shoulders"
  ],
  "curly": [
   "머리가 굵고 느슨한 고리 형태로 말려요.",
   "broad loose curls"
  ],
  "tight curls": [
   "작은 반경의 촘촘한 컬이에요. 인종이나 피부색을 지정하지 않아요.",
   "small-radius dense curls; independent of ethnicity"
  ],
  "locs": [
   "머리카락을 여러 개의 로프 같은 가닥으로 뭉친 스타일이에요. 피부·민족과 별개예요.",
   "separate rope-like locs; independent of ethnicity and skin tone"
  ],
  "ringlet curls": [
   "세로로 이어지는 나선형 컬이에요.",
   "distinct vertical spiral ringlets"
  ],
  "finger waves": [
   "두피 가까이에서 규칙적인 S자 굴곡을 만들어요.",
   "sculpted close-to-scalp S-shaped waves"
  ],
  "feathered": [
   "끝을 가볍게 층내 바깥으로 퍼지게 해요.",
   "light layered ends fanning outward"
  ],
  "blunt cut": [
   "머리 끝이 한 줄의 뚜렷한 경계로 끝나요.",
   "hair ends cut along a clean even edge"
  ],
  "wet-look slick": [
   "머리카락이 젖은 듯 뭉쳐 윤기가 나요. 피부를 젖게 하지 않아요.",
   "sleek grouped glossy hair; no wet-skin treatment"
  ],
  "windswept": [
   "바람을 받은 듯 가닥 흐름을 한쪽으로 모아요. 길이·컷은 유지해요.",
   "directional wind-shaped strands within the chosen length"
  ],
  "buzz cut": [
   "두피 가까이 아주 짧고 고르게 민 머리예요.",
   "uniform scalp-close crop"
  ],
  "crew cut": [
   "짧은 옆머리와 조금 더 긴 짧은 윗머리예요.",
   "short clipped sides and a slightly longer short top"
  ],
  "side part": [
   "한쪽에 가르마를 두고 머리를 나눠 빗어요.",
   "hair divided along a side part"
  ],
  "fade": [
   "옆·뒤가 아래로 갈수록 점점 짧아져요.",
   "sides and nape graded progressively shorter downward"
  ],
  "man bun": [
   "뒤쪽에 한 덩어리로 말아 묶어요. 성별을 바꾸지 않아요.",
   "single rear bun; no gender change"
  ],
  "swept back": [
   "볼륨을 남긴 채 머리를 뒤로 넘겨요.",
   "hair swept backward with root lift"
  ],
  "shaggy": [
   "끝과 층이 불규칙하게 흩어지는 컷이에요.",
   "tousled uneven layers and ends"
  ],
  "mullet": [
   "앞·옆은 짧고 목덜미 쪽이 길어요.",
   "short front and sides with a longer nape"
  ],
  "afro": [
   "촘촘한 곱슬을 둥글고 크게 부풀린 모양이에요. 피부·민족과 별개예요.",
   "a full rounded afro of dense coils; independent of ethnicity and skin tone"
  ],
  "afro puffs": [
   "곱슬머리를 양쪽 위로 모아 동그란 퍼프 두 개로 묶어요.",
   "two rounded coily puffs gathered high on each side"
  ],
  "box braids": [
   "두피를 네모 칸으로 나눠 가늘게 땋은 가닥이 여러 줄 늘어져요.",
   "many slim box braids hanging loose from neat square parts"
  ],
  "cornrows": [
   "두피에 바짝 붙여 앞에서 뒤로 줄지어 땋아요.",
   "neat cornrows braided flat along the scalp from front to back"
  ],
  "fishtail braid": [
   "두 갈래를 잘게 엇갈려 엮은 땋기를 한쪽 어깨로 넘겨요.",
   "a finely woven fishtail braid swept over one shoulder"
  ],
  "beach waves": [
   "바닷바람에 말린 듯 느슨하고 자연스럽게 흐트러진 웨이브예요.",
   "loose, tousled beach waves with an undone, sun-dried texture"
  ]
 },
 "hair accent": {
  "a single antenna strand standing up": [
   "정수리에서 머리카락 한 가닥이 서요. 장비 안테나가 아니에요.",
   "one upright hair tuft, not an antenna"
  ],
  "two antenna strands standing up": [
   "정수리에서 머리카락 두 가닥이 서요. 뿔이나 장비가 아니에요.",
   "two upright hair tufts, not horns or ornaments"
  ],
  "a prominent cowlick": [
   "가마 주변에서 한 덩어리의 머리가 튀어나와요.",
   "a pronounced tuft lifted at the crown whorl"
  ],
  "loose stray strands framing the face": [
   "얼굴 양옆에 가는 잔머리를 남겨요.",
   "loose fine strands beside the face"
  ],
  "neatly kept, no stray strands": [
   "선택한 머리 윤곽 안으로 가닥을 정리해요.",
   "neatly contained strands without stray tufts"
  ]
 }
},
    PARAM_GROUP_HELP: {
 "base": "명시한 나이와 피부·얼굴 설정을 우선하며, 원본 종이나 장비 크기에서 사람의 외형을 강제하지 않아요.",
 "build": "의상 아래 성인 신체를 정해요. 체형이 큰 방향이고 세부값은 그 범위에서 조절해요. 보통·균형은 체형을 초기화하지 않아요.",
 "face": "얼굴 인상보다 구체적인 윤곽·크기·각도가 우선해요. 세부값은 해당 부위만 바꾸며 선택한 나이를 유지해요.",
 "hair": "스타일의 구조·고유 길이가 우선해요. 길이는 풀었을 때, 머릿결은 한 올의 굵기, 볼륨은 전체 부피를 뜻해요."
},
    PARAM_HELP: {
 "auto": "지정하지 않은 부분만 다른 선택과 모순되지 않게 결정해요.",
 "custom": "직접 입력한 내용은 그대로 전달돼요. 바꿀 부위·길이·윤곽을 구체적으로 적어 주세요.",
 "ethnicity": "넓은 외모 참고 범위예요. 같은 계통 안에서도 개인차를 허용하고, 얼굴 윤곽·피부톤·헤어 선택을 우선해요.",
 "measurement": "가슴 / 허리 / 골반 둘레를 cm로 입력해요. 폭이나 의상 치수가 아니며, 체형 안에서 비율 참고로 사용해요.",
 "eye": "인물 본인의 오른쪽·왼쪽 기준이에요. 왼쪽 색을 비우면 양쪽에 기본 눈 색을 사용해요.",
 "color": "피부나 조명 대신 선택한 머리 또는 홍채의 고유색에 적용해요."
},
    HAIR_LENGTH_LIMITS: {
 "pixie cut": [
  "픽시컷은 길이 선택과 관계없이 짧은 옆·뒤와 약간 긴 정수리를 유지해요.",
  "short pixie range: cropped sides/nape and slightly longer crown"
 ],
 "buzz cut": [
  "버즈컷은 두피 가까이 짧게 민 길이를 유지해요.",
  "scalp-close buzz-cut length"
 ],
 "crew cut": [
  "크루컷은 짧은 옆머리와 짧은 윗머리 범위를 유지해요.",
  "short crew-cut range with clipped sides and a slightly longer top"
 ],
 "bob": [
  "보브컷은 귀 아래부터 목까지의 범위로 해석해요.",
  "below-ear to neck-length bob range"
 ],
 "side-shaved long hair": [
  "한쪽을 민 긴 머리는 나머지 머리가 어깨 아래로 내려오는 구조를 유지해요.",
  "remaining unshaved section below shoulders"
 ]
},
    EYE_CONTOURS: {
 "large": "open rounded eyelid outline; scale follows eye size",
 "sharp": "crisp eyelid contour; corner direction follows eye tilt",
 "drooping": "soft eyelid contour; corner direction follows eye tilt",
 "upturned": "tapered eyelid contour; corner direction follows eye tilt"
},
    COLOR_HEX: {
 "white": "#F2F2F2",
 "platinum": "#E4E6EA",
 "silver": "#C8CCD2",
 "ash blonde": "#C9BBA0",
 "blonde": "#E3C574",
 "gold": "#D8A72B",
 "amber": "#C87E24",
 "orange": "#D97524",
 "red": "#C0392B",
 "crimson": "#8E1B2B",
 "pink": "#E08AA8",
 "purple": "#7E5AA8",
 "lavender": "#B9A6DE",
 "pale blue": "#9EC7E8",
 "blue": "#2F6FD0",
 "navy": "#1E3A6E",
 "teal": "#1F8A8A",
 "mint": "#7FD8C0",
 "green": "#2E9E5B",
 "brown": "#7A5230",
 "gray": "#8A8F98",
 "black": "#14161A"
},
    COLOR_KEYS: {
 "hair color": 1,
 "eye color": 1,
 "second eye color": 1
},
    AGE_DEFAULT: "20s",
    AGE_LINES: {
 "20s": "AGE: in her twenties — smooth youthful skin; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases) whatever her expression.",
 "youthful adult": "AGE: in her twenties with a youthful face and adult proportions — smooth skin; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases) whatever her expression.",
 "30s": "AGE: a woman in her thirties — restrained age cues; at most faint lines, no deep folds or under-eye bags.",
 "40s": "AGE: a woman in her forties — natural, restrained age cues.",
 "mature adult": "AGE: a mature adult woman — visible but restrained age cues."
},
    EXPOSURE: {
 "low": "EXPOSURE (low): a mostly covered version of the costume WORLD describes; face, neck and hands show.",
 "moderate": "EXPOSURE (moderate): the costume WORLD describes opens at the collarbone and shows the arms or lower legs; chest and pelvis covered.",
 "bold": {
  "outer": "EXPOSURE (bold): her outer layer (coat, cloak, robe or armor) stays on both shoulders, worn symmetrically; skin shows through the inner garment — a deep open neckline with natural cleavage, a fitted corset-like waist, slits where the form allows. The collar opens with the neckline in a V or folds down, never standing away from the neck. Nothing slipped off. Chest and pelvis covered; keep the costume WORLD describes, material and palette.",
  "open": "EXPOSURE (bold): cut the costume WORLD describes to show skin through its own structure — a deep open neckline with natural cleavage, a fitted corset-like waist, and bare shoulders, arms or thighs where the garment allows, kept symmetrical. The collar opens with the neckline in a V or folds down, never standing away from the neck. Nothing slipped off. Chest and pelvis covered; keep the costume WORLD describes, material and palette."
 }
},
    EXPOSURE_KEYS: [
 "",
 "low",
 "moderate",
 "bold"
],
    EXPOSURE_DEFAULT: "bold",
    /* 세계 → 과감 노출의 갈래(game 은 복식 구조로 골랐다) */
    EXPOSURE_LAYER: { samguk: 'open', fantasy: 'outer', mecha: 'outer' },
    LOOK_LINES: {
      silhouette: "SILHOUETTE: {items}.",
      face: "FACE (her own structure, not the style's default face): {items}.",
      identity: "IDENTITY (chosen details override the automatic look)",
      measurement: "B/W/H are approximate bust/waist/hip circumferences in cm — proportion guidance within the chosen build, not costume sizes."
    }
  };
  Object.keys(L).forEach(function (k) { S[k] = L[k]; });
})(typeof window !== 'undefined' ? window : globalThis);
