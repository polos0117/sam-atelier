/* 프롬프트 표 — 생성기가 쓰는 영어 문장과 선택지는 전부 여기 있다. 함수는 없다(tests/words.cjs 가 본다).
   조립은 lib/prompt-sam.js 가 한다. 장수·세력·역할마다 다른 글은 data/sam-design.json, 화풍 문장은 data/style.json 의 판에서 온다.
   원소 공방(element-atelier, 2026-10-30)의 표를 옮겨 왔다(2026-11-02) — 층(근본·가문주·주민)이 없고 장수 한 명이 한 카드다.
   뼈대: CONCEPT(그 장수를 여성으로) → TRAITS(그 장수의 일화·성정 한 줄 + 세력 팔레트) → 외형(AGE·SILHOUETTE·FACE) → WORLD(세력의 세계 글 + 역할의 세계 차림)
     → 장면·시간대 → STYLE · 노출 → 덧붙임 → OUTPUT(자세) · SIGNATURE ITEM · 표정 · BODY · RULES.
   세계 셋은 사용자 2026-11-02 「삼국시대풍, 서양 중세 판타지 시대풍, 메카풍으로 나눠서 이것도 여성의인화」. 현대는 일상컷이 맡는다. */
(function (root) {
  'use strict';

  /* 세계 셋 — 열쇠는 설계표 vocab.worlds 와 같다. ko 는 화면, head 는 세계 문단의 머리, tail 은 차림 틀({costume} = 설계표 roles.<역할>.worlds.<세계>.en) */
  var WORLDS = [
    { key: 'samguk', ko: '삼국시대', en: 'THREE KINGDOMS',
      head: 'WORLD — THREE KINGDOMS ERA: ',
      tail: 'COSTUME (Three Kingdoms era): {costume}. Authentic late-Han Chinese dress — cross-collared silk robes with wide sleeves and a broad sash, lamellar or scale armor laced with cords where armor is worn, bronze, jade and lacquer ornament, Han court hair ornaments; silk, lacquered leather, bronze and iron. No Western plate armor, no Japanese kimono or samurai armor, no Qing-dynasty dress, no modern material. LIGHT: natural daylight, torches or lanterns, unless TIME & WEATHER says otherwise.',
      /* 과감 노출 — 세계마다 따로(원소 공방 2026-10-30 — 공용 문장이 세계를 같은 옷으로 끌어당겼다) */
      exposureBold: 'EXPOSURE (bold): her robes open to show skin — the cross collar opened into a deep neckline with natural cleavage, bare shoulders and arms where the outer robe is cut away by design, a high slit in the skirt panels showing the thigh; armor pieces stay on and symmetrical. Nothing slipped off. Intimate areas covered; keep the costume material and palette.' },
    { key: 'fantasy', ko: '중세 판타지', en: 'MEDIEVAL FANTASY',
      /* 그 장수의 물건을 그 세계 것으로(사용자 2026-11-08 「무기 이미지가 판타지랑 메카에서 좀 더 그쪽 세계 느낌이 났으면」) — SIGNATURE 줄 · kv 판 「Her signature item — … —」 에 붙는다. 삼국시대는 없음(본디 그 세계 것) */
      sigForm: 'reimagined as a Western high-fantasy version of the same kind of object with the same silhouette: polished steel and silvered mithril throughout, the shaft or hilt also forged metal with engraved runes (never plain wood), a faint magical glow running along the edge and the runes, a gem-set guard or socket, a leather-wrapped grip and heraldic or elven ornament, with any animal motif re-sculpted in Western heraldic style and no Chinese fittings, silk tassels or hanzi',
      head: 'WORLD — MEDIEVAL FANTASY: ',
      tail: 'COSTUME (medieval fantasy): {costume}. Western medieval high-fantasy dress — plate, mail and heraldic tabards, gowns and mantles, circlets and crowns; steel, leather, wool, velvet and gold, subtle magical glow along the patterns. Her Three Kingdoms origin shows only through her signature item, her colours and her bearing — her outfit is Western: no wrap-collar robes, no wide hanfu sleeves, no flowing Chinese-style robe over armor, no East-Asian armor, no machinery, no modern material. The setting is Western European medieval — stone castles, Romanesque or Gothic architecture, European mountains, forests and towns; no Chinese architecture, no pagodas or curved tiled roofs, no hanzi on banners. LIGHT: natural daylight or the world\'s own magical glow, unless TIME & WEATHER says otherwise.',
      exposureBold: 'EXPOSURE (bold): her regalia opens to show skin — bare shoulders and arms between pauldron and bracer, a deep open neckline under the gorget with natural cleavage, a high slit in the tabard or gown showing the thigh; armor pieces stay on and symmetrical. Nothing slipped off. Intimate areas covered; no corset; keep the costume material and palette.' },
    { key: 'mecha', ko: '메카', en: 'MECHA',
      sigForm: 'rebuilt as a far-future high-tech version of the same kind of object with the same silhouette: hard-surface alloy plates with panel lines, mechanical joints, vents and emitter nodes, an energy edge, plasma blade or glowing core in her glow-line colour and small status lights, with any animal motif re-sculpted as sleek machined armour and no wood, silk tassels or forged-bronze fittings',
      head: 'WORLD — MECHA: ',
      tail: 'MECHA DESIGN: she is a female mecha personification, built as {costume}; plates, joints, binders and glow lines carry her faction palette and the traits above; the plates must read as solid armor with visible joints, not as cloth or a gown; her signature item is rebuilt as part of the frame or as a mecha armament. Mecha plating covers her frame except where EXPOSURE opens it — no cloth robe, gown, skirt or long fabric over the plates; any cape is rigid armored binder plates. Her face and hair stay human. The setting is far-future science fiction — space stations, starships, planets, nebulae and high-tech structures; no traditional East-Asian architecture, no pagodas, tiled roofs or stone lanterns. ',
      /* 메카 전용 과감 노출(사용자 2026-11-08 「요즘에는 의상 노출을 명시해놔도 잘 안먹는 느낌이야」 — 메카는 공용 문장 「겉옷은 양어깨에 · 안쪽 옷 사이로」 에 「목부터 발끝까지 장갑」 이 겹쳐 가슴 창 하나만 남았다). 설계로 열린 장갑 */
      /* 2026-11-08 「세계컷 메카는 한번에 너무 많이 연거 같으니, 랜덤적으로 몇 군데만 여느식으로」 — 네 곳(어깨 · 위팔 / 가슴 창 / 허리 / 허벅지) 가운데 장수 · 세계마다 두 곳만(열쇠 해시 — 다시 그려도 같은 설계).
         exposureOpen 이 있으면 exposureLine 이 그 두 곳으로 exposureOpenTpl 을 채운다. exposureBold 는 장수를 모를 때(가슴 창 · 어깨) */
      exposureOpen: [
        { key: 'shoulders', en: 'bare shoulders and upper arms between pauldron and gauntlet' },
        { key: 'chest', en: 'a deep open chest window with natural cleavage framed by the chest plates' },
        { key: 'midriff', en: 'a bare waist and midriff between the bust plate and the hip armor' },
        { key: 'thighs', en: 'bare upper thighs between the hip armor and thigh-high leg plates' }
      ],
      exposureOpenN: 2,
      exposureOpenTpl: 'EXPOSURE (bold): her mecha frame is cut open by design in only these places — {open}; everywhere else she stays fully plated. The plates stay on, fitted and symmetrical, with skin clearly showing in each opening. Nothing slipped off. Intimate areas covered; keep the plate material and palette.',
      exposureBold: 'EXPOSURE (bold): her mecha frame is cut open by design in only these places — bare shoulders and upper arms between pauldron and gauntlet, and a deep open chest window with natural cleavage framed by the chest plates; everywhere else she stays fully plated. The plates stay on, fitted and symmetrical, with skin clearly showing in each opening. Nothing slipped off. Intimate areas covered; keep the plate material and palette.' }
  ];

  /* CONCEPT — {name_en}·{name_ko}·{role_en}·{faction_en}·{title} 은 설계표에서 채운다. title 은 「 — 설계표 title.en」, 없으면(자동 설계) 빈칸 */
  var CONCEPT = 'CONCEPT: a female personification of {name_en} ({name_ko}), a {role_en} of {faction_en} in the Romance of the Three Kingdoms{title}. Reimagined as a woman; her costume, ornaments, colours and bearing carry her famous deeds and temperament. This is a character design, not a historical portrait.';
  var TRAITS_HEAD = 'TRAITS of {name_en} to carry in her design and the scene: ';
  /* 손 설계가 없는 장수 — 능력치에서 한 줄(게임 표의 통솔·무력·지력·정치, 90 이상이 먼저). {lore} 는 쓰지 않는다(한글 일화는 기록에만) */
  var STAT_TRAITS = {
    lead: { top: 'a born commander who moves an army like one body', mid: 'a steady field commander' },
    war: { top: 'a peerless warrior whose strength turns battles', mid: 'a hardened fighter' },
    int: { top: 'a brilliant strategist who reads the battlefield like a board', mid: 'a sharp, scheming mind' },
    pol: { top: 'a gifted statesman who holds the realm together', mid: 'a capable administrator' }
  };
  /* 세력 한자는 삼국시대에서만 — 판타지 · 메카에 蜀 깃발이 걸렸다(2026-11-02 관우 시험) */
  var FACTION_HEAD = 'FACTION — {faction_en}{hanja_paren}. Palette: ';
  /* 읽혀도 되는 글자 — 성씨 낙관이 없거나 세력 글자와 같으면 하나만 */
  var CHARS = { two: 'the single character {hanja} or {seal}', one: 'the single character {hanja}', none: 'abstract heraldic or insignia shapes — never letters or Chinese characters' };
  /* 글자 규칙 — 세계마다. 한 글자는 삼국시대만, 판타지는 문장(紋章) 그림, 메카는 휘장 모양 */
  var TEXT_RULE = {
    samguk: 'No readable text or numbers, except that a banner, seal or emblem may carry {chars}.',
    fantasy: 'No readable text or numbers — banners and shields carry only heraldic devices (a beast or a crest), never letters or Chinese characters.',
    mecha: 'No readable text or numbers — emblems are abstract insignia shapes only, never letters or Chinese characters.'
  };
  var MECHA_FACTION = 'FACTION FRAME: {design}.';
  /* 무기는 한 자루로(2026-11-02 사용자 「창이나 무기가 잘리지 않도록 지시문 수정」 — 조운 메카의 창이 머리 뒤로 지나가며 끊기고, 일상컷 창대가 손 아래에서 꺾였다) */
  var SIGNATURE = 'SIGNATURE ITEM: {hold} — {sigForm}. She holds or carries it, drawn at full scale. It is one whole object drawn once: a long weapon (spear, glaive, halberd, staff, bow) keeps a single straight, unbroken shaft from butt to head with exactly one head or blade, held in front of or beside her body — never passing behind her head or shoulders, never broken, bent, split in two by her body or arm, or duplicated; if the frame cuts it, it leaves the frame as one straight line.';

  /* 출력 — 세로 2:3 카드 한 장 */
  var OUTPUT = 'OUTPUT: one character image that works as card art. Vertical 2:3 frame, full body with head and feet inside the frame with clear margins, face turned toward the camera (front or three-quarter). {pose} the environment may be rich while her design stays fully readable.';
  /* 세계 그림의 자세 — 비우면 카드 자세. 셋을 나란히 견주는 자리라 프레이밍·카메라는 그대로(전신·정면 또는 3/4) */
  /* 메카 실루엣 — 세계 그림 메카의 선택 칸(사용자 2026-11-05 「실루엣 종류를 많이 넣어서 랜덤이든 선택이든」 「장갑 분리형, 전신장갑형 등등」 「옵션으로」).
     비우면 줄이 없다(지금 그대로). 큰 덩어리 모양만 정하고 세부는 그림이 정한다. 모두 메카 규칙(목부터 발끝까지 장갑 · 천 없음 · 어깨 대칭 · 노출 범위)과 같이 산다 */
  /* ══ 구조판(v2, 2026-11-05 — 사용자 「프롬포트 탭 하나 더 만들어서 v2로 glossy1에 실루엣 선택형으로」 「원소공방 참고하면 될 거 같아」) ══
     원소 공방(element-atelier)의 구조판 표를 삼국지 꼴로 옮겼다. 공통 적용 규칙 · 1절 작화는 화풍 판(data/style.json 의 glossy_kv — rules · section1 · section1_worlds)이 쥐고, 여기는 2~4절 칸 이름 · 한글 낱말 · 칸 기본 글.
     3절은 의상을 그림에 맡기는 꼴(사용자 2026-11-05 「초선 메카 의상을 그림 모델이 정하게」 — 세 번 돌려 다양성이 더 있었다): 프레임 종류 · 세력 프레임 · 색 · 규칙 · 노출 · 고른 실루엣만 정한다.
     체형 여덟 칸은 하체 현실 비율(2026-11-04 「하체가 너무 비현실적」). 외형 값은 한글 표(ko), 없으면 영어 문구 */
  var STRUCT = {
   "ko": {
    "face_shape": {
     "angular": "윤곽이 또렷한 얼굴 — 각지지 않게 부드럽게 다듬은 선",
     "diamond": "갸름한 다이아몬드형(diamond-shaped), 살짝 드러나는 광대, 작고 단정한 턱끝",
     "heart": "부드러운 하트형(heart-shaped), 넓고 매끈한 이마, 갸름하게 좁아지는 하관, 작고 뾰족한 턱끝",
     "inverted_triangle": "이마가 조금 넓고 턱으로 갈수록 갸름해지는 역삼각형 얼굴",
     "long": "긴 얼굴형(long face), 세로로 긴 윤곽과 곧은 볼선",
     "oval": "부드러운 계란형(oval), 매끈한 볼, 완만하게 좁아지는 하관",
     "round": "둥근 얼굴형(round), 볼이 둥글게 차오른 부드러운 윤곽",
     "square_soft": "부드러운 각진형(softly square), 또렷하지만 둥글게 다듬은 턱선",
     "v_line": "갸름한 V라인 얼굴, 부드럽게 모이는 작은 턱"
    },
    "eyes": {
     "almond_wide": "완전히 뜬 넓은 아몬드형 눈(wide almond eyes)",
     "cat": "눈꼬리가 날렵하게 빠진 고양이 눈(cat eyes)",
     "deep_set": "깊게 자리 잡은 눈(deep-set eyes)",
     "droopy_soft": "눈꼬리가 살짝 처진 순한 눈(soft droopy eyes)",
     "hooded": "쌍꺼풀이 살짝 덮인 눈(hooded eyes)",
     "monolid_long": "가로로 긴 홑꺼풀 눈(long monolid eyes)",
     "narrow_upturned": "가늘고 눈꼬리가 올라간 눈(narrow upturned eyes)",
     "peach_blossom": "촉촉하고 그윽한 도화 눈(peach-blossom eyes)",
     "phoenix": "가늘고 길게 끝이 올라간 봉황 눈(phoenix eyes)",
     "round_large": "크고 둥근 눈(large round eyes)"
    },
    "brows": {
     "angled_sharp": "날카롭게 각진 눈썹",
     "arched_thin": "가늘게 휜 아치형 눈썹",
     "feathered": "결이 살아 있는 부드러운 눈썹(feathered brows)",
     "high_arched": "높이 휘어 올라간 아치형 눈썹",
     "low_heavy": "낮고 짙은 눈썹",
     "soft_round": "부드럽고 둥근 눈썹",
     "straight_thick": "짙고 곧은 일자 눈썹",
     "straight_thin": "가늘고 곧은 일자 눈썹"
    },
    "nose": {
     "aquiline": "콧대가 살짝 휜 매부리코(aquiline)",
     "broad_soft": "넓고 부드러운 코",
     "high_bridge": "콧대가 높고 곧은 코",
     "petite_straight": "작고 곧은 코",
     "small_button": "작고 동그란 코",
     "straight_narrow": "곧고 가는 콧대, 작고 단정한 코끝",
     "upturned": "코끝이 살짝 들린 코"
    },
    "lips": {
     "full_wide": "도톰하고 넓은 입술",
     "heart_full": "도톰한 하트형 입술",
     "plush_pout": "도톰하게 살짝 내민 입술(pout)",
     "small_bow": "작은 활 모양 입술",
     "soft_medium": "적당한 두께의 부드러운 입술",
     "thin_bow": "얇은 활 모양 입술",
     "thin_long": "얇고 가로로 긴 입술"
    },
    "eye_color": {
     "amber": "호박색 눈",
     "aqua": "맑은 아쿠아색 눈",
     "azure": "맑은 하늘빛 청색 눈(azure)",
     "coral": "산호빛 주황 눈",
     "crimson": "진홍색 눈",
     "dark_brown": "짙은 갈색 눈",
     "ember": "불씨 같은 주황 눈",
     "emerald": "에메랄드 초록 눈",
     "forest_green": "깊은 숲 초록 눈",
     "gold": "금색 눈",
     "graphite_grey": "흑연빛 회색 눈",
     "hazel": "따뜻한 헤이즐색 눈",
     "honey": "꿀빛 금색 눈",
     "ice_blue": "얼음 같은 연청색 눈",
     "jade": "옥빛 초록 눈(jade)",
     "leaf_green": "잎사귀 초록 눈",
     "lilac": "부드러운 라일락색 눈",
     "magenta": "자홍빛 눈(magenta)",
     "navy": "짙은 남색 눈",
     "obsidian": "흑요석 같은 검은 눈",
     "pale_violet": "옅은 보랏빛 눈",
     "rose": "먼지 낀 장밋빛 분홍 눈",
     "sapphire": "짙은 사파이어 청색 눈",
     "silver": "은빛 회색 눈",
     "sky_blue": "하늘색 눈",
     "steel_blue": "강철빛 청색 눈(steel-blue)",
     "teal": "청록색 눈(teal)",
     "violet": "연보라 눈"
    },
    "hair_color": {
     "antique_gold": "고풍스러운 앤티크 금발",
     "ash_gray": "잿빛 회색 머리",
     "blue_black": "푸른 윤기가 도는 검은 머리",
     "bright_red": "선명한 빨강 머리",
     "bronze": "따뜻한 청동색 머리",
     "burgundy": "버건디빛 머리",
     "caramel": "캐러멜빛 갈색 머리",
     "cherry_pink": "체리빛 분홍 머리",
     "chestnut": "밤색 머리",
     "copper": "광택 나는 구릿빛 머리",
     "crimson": "진홍색 머리",
     "dark_auburn": "짙은 적갈색 머리(auburn)",
     "dark_brown": "짙은 갈색 머리",
     "emerald_green": "에메랄드빛 초록 머리",
     "flame_orange": "불꽃 같은 주황 머리",
     "golden_blonde": "황금빛 금발",
     "grass_green": "풀빛 초록 머리",
     "honey_brown": "꿀빛 갈색 머리",
     "indigo": "짙은 쪽빛(인디고) 머리 — 빛을 받으면 분명한 남색",
     "ink_blue": "먹빛 남색 머리",
     "ink_green": "먹빛이 도는 짙은 녹색 머리",
     "jade_green": "옥빛 초록 머리",
     "jet_black": "윤기 나는 칠흑 머리",
     "lavender": "라벤더색 머리",
     "lemon_yellow": "레몬빛 노란 머리",
     "magenta": "자홍빛 머리",
     "mint": "민트빛 머리",
     "navy": "짙은 남색 머리",
     "ocean_blue": "바다빛 파란 머리",
     "ombre_azure": "끝으로 갈수록 하늘빛 청색으로 물드는 머리(ombre)",
     "ombre_crimson": "끝으로 갈수록 진홍으로 물드는 머리(ombre)",
     "platinum_blonde": "백금발(platinum blonde)",
     "plum_black": "자줏빛이 도는 검은 머리",
     "rose_gold": "로즈골드 머리",
     "royal_blue": "선명한 로열 블루 머리",
     "royal_purple": "짙은 왕실 보라 머리",
     "silver_white": "은백색 머리",
     "sky_blue": "하늘색 머리",
     "smoky_lilac": "잿빛이 섞인 라일락색 머리",
     "strawberry_blonde": "딸기빛 금발(strawberry blonde)",
     "sunset_pink": "노을빛 분홍 머리",
     "teal": "청록색 머리",
     "violet": "보라색 머리",
     "wine_red": "짙은 와인빛 머리"
    },
    "hair": {
     "bob": "단발(bob)",
     "braided_crown": "머리 둘레를 땋아 두른 왕관 땋기",
     "braids": "길게 땋은 머리",
     "chignon": "목덜미에서 단정하게 틀어 올린 쪽머리(chignon)",
     "double_buns": "양쪽에 올린 두 개의 번",
     "half_up": "긴 머리를 윗부분만 묶어 올린 반묶음(half-up, half-down)",
     "hime_cut": "볼 높이에서 일자로 자른 옆머리가 있는 긴 생머리(hime cut)",
     "lob": "어깨에 닿는 단발(lob)",
     "long_layered": "층을 낸 긴 머리",
     "long_straight": "긴 생머리",
     "long_wavy": "긴 웨이브 머리",
     "low_ponytail": "목덜미에서 낮게 묶어 등까지 내려오는 긴 로우 포니테일(low ponytail)",
     "messy_bun": "느슨하게 틀어 올린 번",
     "pixie": "짧은 픽시컷(pixie cut)",
     "ponytail": "긴 포니테일(ponytail)",
     "short_crop": "짧게 친 숏컷(short crop)",
     "side_braid": "한쪽 어깨 위로 늘어뜨린 굵은 한 갈래 땋은 머리",
     "side_ponytail": "한쪽으로 묶은 사이드 포니테일",
     "side_swept": "한쪽으로 쓸어 넘긴 긴 머리",
     "twin_tails": "양갈래(twin tails)",
     "updo_bun": "올림머리 번(updo bun)",
     "voluminous": "풍성한 볼륨 머리",
     "wolf_cut": "층을 많이 낸 덥수룩한 울프컷(wolf cut)"
    },
    "bangs": {
     "asymmetric": "비대칭 앞머리",
     "baby": "짧은 눈썹 위 앞머리(baby bangs)",
     "choppy": "들쭉날쭉한 앞머리(choppy bangs)",
     "curtain": "가운데에서 갈라져 얼굴을 감싸는 커튼 앞머리(curtain bangs)",
     "none": "앞머리 없이 드러난 이마",
     "one_eye": "한쪽 눈 위로 길게 내려오는 앞머리",
     "parted": "가운데에서 갈라져 이마 양쪽을 덮는 앞머리(center-parted bangs)",
     "side_locks": "앞머리 없이 얼굴 옆으로 길게 내린 옆머리",
     "side_swept": "한쪽으로 쓸어 넘긴 옆 앞머리(side-swept bangs)",
     "straight": "일자로 자른 앞머리(blunt bangs)",
     "swept_back": "앞머리를 이마 위로 넘김",
     "wispy": "성글게 비치는 앞머리(see-through bangs)"
    },
    "impression": {
     "boyish": "장난기 있는 보이시한",
     "cheerful": "밝고 쾌활한",
     "cool": "차갑고 도도한 미인",
     "cute": "눈이 반짝이는 귀여움",
     "elegant": "우아하고 기품 있는",
     "fierce": "사납고 야성적인",
     "glamorous": "화려하고 관능적인",
     "innocent": "맑고 순수한",
     "languid": "나른하고 여유로운",
     "mature": "성숙하고 침착한 여성",
     "melancholic": "조용한 우수",
     "regal": "위엄 있고 도도한 기품",
     "rugged": "거칠고 단단한 야외형",
     "sharp": "날카롭고 강렬한",
     "soft": "부드럽고 다정한 온기",
     "stoic": "속을 읽을 수 없는 침착함"
    },
    "skin_tone": {
     "bronze": "청동빛 갈색 피부",
     "deep_brown": "짙은 갈색 피부",
     "fair": "밝은 피부",
     "golden_tan": "따뜻한 황금빛 태닝 피부(golden tan)",
     "olive": "올리브빛 피부",
     "porcelain": "도자기처럼 흰 피부",
     "warm_beige": "따뜻한 베이지 피부"
    },
    "eye_size": {
     "large": "큰 눈",
     "medium": "적당한 크기의 실제 비례에 가까운 눈",
     "small": "애니메이션 비례보다 작고 가는 눈"
    },
    "eye_tilt": {
     "down": "눈꼬리가 아래로 처짐",
     "level": "눈꼬리는 수평",
     "up": "눈꼬리가 날카롭게 올라감"
    },
    "mark": {
     "bare": "화장기 없는 맨얼굴(bare face)",
     "blush": "발그레한 볼",
     "dark_lip": "짙은 베리색 립스틱",
     "freckles": "코와 볼에 흩뿌린 주근깨",
     "gloss": "윤기 있는 누드톤 입술",
     "mole_eye": "한쪽 눈 아래 작은 점",
     "red_lip": "선명한 빨간 립스틱",
     "scar": "한쪽 눈썹을 가로지르는 가늘고 옅은 흉터",
     "smoky": "짙은 스모키 눈화장",
     "winged_liner": "날렵한 윙 아이라인"
    },
    "age": {
     "early_20s": "갓 성인이 된 앳된 얼굴, 주름 없음",
     "early_30s": "광대와 턱선이 또렷한 침착하고 성숙한 얼굴, 옅은 선 정도만, 깊은 주름·눈밑 처짐 없음",
     "late_20s": "광대가 또렷한 성숙하고 안정된 얼굴, 주름·팔자·눈밑 처짐 없음",
     "late_30s": "30대 후반의 성숙하고 관능적인 미인 — 자신감 있는 눈빛, 매끈하고 윤기 있는 피부, 눈가의 아주 옅은 선 정도만, 늙거나 피곤해 보이지 않음, 작고 부드러운 턱",
     "mid_20s": "또렷한 성인 얼굴, 주름 없음"
    },
    "expr": {
     "calm": "힘을 뺀 눈썹, 부드럽게 뜬 눈, 힘주지 않고 다문 입술, 웃지 않음",
     "focused": "살짝 모은 눈썹, 한 점을 응시하는 가늘고 흔들림 없는 눈, 굳게 다문 입",
     "soft_smile": "입술을 다문 채 입꼬리만 살짝 올라간 옅은 미소, 아래 눈꺼풀까지 닿는 따뜻한 눈빛",
     "half_smile": "한쪽 입꼬리가 더 올라간 입 다문 미소, 시선은 살짝 옆으로",
     "playful": "이가 살짝 보이는 비대칭 웃음, 한쪽 눈썹을 올리고 재미있다는 듯 가늘게 뜬 눈",
     "confident": "수평의 눈썹, 서두르지 않는 곧은 시선, 살짝 든 턱, 침착하게 다문 입",
     "sensual": "무겁게 내려온 눈꺼풀, 힘을 빼고 살짝 벌린 입술, 매끈한 눈썹, 살짝 숙인 턱",
     "provocative": "내리깐 눈꺼풀 아래 도전적인 곧은 시선, 한쪽 눈썹을 올리고 한쪽 입꼬리를 살짝 당긴 미소",
     "sleepy": "무겁게 처진 눈꺼풀, 초점 없는 시선, 힘이 풀린 입, 낮고 편한 눈썹",
     "candid": "움직이는 도중에 잡힌 모습, 카메라를 보지 않는 눈, 꾸미지 않은 중간 모양의 입",
     "mildly_annoyed": "안쪽으로 모은 눈썹, 살짝 가늘게 뜬 한쪽 눈, 한쪽으로 납작하게 다문 입",
     "surprised": "올라간 눈썹, 흰자가 위로 보이게 크게 뜬 눈, 작고 둥글게 벌린 입",
     "curious": "한쪽 눈썹을 더 올리고 고개를 갸웃, 크게 뜬 주의 깊은 눈, 살짝 벌린 입술",
     "serious": "낮고 수평인 눈썹, 깜빡임 없는 흔들림 없는 시선, 일자로 다문 입, 힘준 턱",
     "amused": "주름 잡힌 아래 눈꺼풀, 볼을 밀어 올리는 입 다문 미소, 편한 눈썹",
     "bored": "반쯤 감긴 눈으로 다른 곳을 봄, 힘 빠진 입, 납작하고 무심한 눈썹",
     "pensive": "아래 옆으로 향한 시선, 살짝 찌푸린 눈썹, 가볍게 다물거나 손이 닿은 입술",
     "smug": "한쪽 입꼬리를 올리고 다 안다는 듯 내리깐 눈꺼풀, 살짝 든 턱",
     "gentle": "부드럽게 내려온 눈썹, 따뜻하고 편안한 눈, 입을 다문 옅은 미소, 어디에도 긴장이 없음",
     "determined": "아래 안쪽으로 당긴 눈썹, 앞을 노려보는 단단한 시선, 힘준 턱, 꽉 다문 입",
     "exhausted": "처진 눈꺼풀과 눈썹, 초점 잃은 흐린 시선, 살짝 벌어진 힘 빠진 입",
     "nostalgic": "카메라 너머 먼 곳을 보는 부드러운 시선, 아련한 옅은 반미소, 안쪽 끝이 살짝 올라간 눈썹",
     "unimpressed": "납작한 수평 눈썹, 반쯤 감은 무표정한 응시, 움직임 없는 일자 입",
     "flustered": "올라간 안쪽 눈썹, 흔들리거나 피하는 눈, 살짝 벌린 입, 볼과 코에 옅은 홍조",
     "proud": "든 턱, 수평의 눈썹, 밝고 흔들림 없는 눈, 입을 단단히 다문 미소",
     "wistful": "살짝 위나 옆으로 향한 부드러운 시선, 옅고 슬픈 미소, 올라간 안쪽 눈썹",
     "mischievous": "반짝이며 가늘게 뜬 눈, 한쪽 눈썹을 올리고 한쪽으로 밀린 입 다문 웃음",
     "relieved": "위·바깥으로 풀린 눈썹, 반쯤 감은 눈, 숨을 내쉬듯 살짝 벌린 입, 얼굴 전체가 풀림",
     "cold_smile": "입은 웃지만 눈은 웃지 않는 납작한 눈빛, 수평 눈썹, 곧고 차가운 시선",
     "laughing": "고개를 살짝 젖히고 눈을 거의 감은 채 이를 드러내며 크게 웃는 입, 높이 올라간 볼",
     "laughing_open": "이를 드러내고 볼이 올라가게 크게 웃지만 눈은 뜬 채 — 눈꺼풀만 살짝 좁아지고 시선이 읽힘",
     "wink": "한쪽 눈은 장난스럽게 감고 다른 눈은 밝게 뜬 채, 한쪽 입꼬리를 올린 작은 미소, 편한 눈썹"
    },
    "time": {
     "dawn": "새벽 첫 빛 — 차가운 푸른 그림자, 지평선의 가는 따뜻한 선",
     "day": "맑은 한낮 빛, 선명한 그림자",
     "golden": "석양 — 길고 따뜻한 빛, 짙은 주황 하늘",
     "night": "밤 — 장면 속 불·등불·발광이 비추고 위는 어두운 하늘",
     "storm": "다가오는 폭풍 — 무거운 구름, 옷과 머리를 흔드는 바람, 먼 번개",
     "snow": "내리는 눈, 부드럽게 퍼진 빛, 가장자리와 어깨에 쌓인 눈",
     "fog": "짙은 안개 — 먼 구조물은 실루엣으로 사라지고 가까운 빛이 안개 속에서 번짐",
     "petals": "바람에 흩날리는 꽃잎, 부드럽고 따뜻한 빛"
    },
    "pose": {
     "stand_3q": "카메라 쪽 3/4으로 돌아 서서 한쪽 다리에 무게를 싣고, 한 손은 옆구리나 허리에 둠",
     "stride": "한 발을 앞으로 내디디며 카메라를 향해 걸어 나오는 동작, 옷자락과 머리가 움직임",
     "sit_throne": "그 세계에 속한 왕좌·계단·턱에 곧게 앉아 무릎을 모으거나 꼬고, 두 발이 다 보임",
     "kneel": "한쪽 무릎을 꿇고 다른 발을 디딘 채 상체를 곧게 세워 카메라를 봄",
     "lean": "그 세계의 구조물(성문·기둥·난간·깃대)에 등을 기대고 팔은 편하게",
     "arms_cross": "카메라를 정면으로 보고 팔짱을 낀 채 턱은 수평",
     "hand_heart": "한 손을 가슴에 얹고 다른 손은 옆에 둔 조용하고 의례적인 자세",
     "weapon_ready": "무게를 낮춘 전투 준비 자세 — 무릎을 굽히고 균형을 잡은 채 그녀의 물건을 들어 올리거나 관객 쪽으로 겨눔",
     "salute": "가슴 높이에서 주먹을 다른 손바닥으로 감싸는 포권 — 조용하고 의례적인 자세"
    }
   },
   "body": {
    "curvy": [
     "굴곡진 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 부드러운 어깨선",
     "풍만한 볼륨, 흉곽에서 자연스럽게 이어지는 둥근 형태",
     "잘록한 허리",
     "허리와 대비되는 둥근 골반 — 사람 몸으로 읽히는 비율",
     "매끈하고 무릎을 향해 완만하게 좁아지는 허벅지 — 과장 없음",
     "부드러운 팔과 종아리, 가는 손목과 발목",
     "부드럽고 굴곡이 분명한 실루엣, 하체는 현실 비율"
    ],
    "tall_curvy": [
     "키가 크고 다리가 긴 굴곡형 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 곧은 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "잘록한 허리",
     "허리와 대비되는 골반 — 현실 비율",
     "길고 매끈한 허벅지, 무릎을 향해 완만하게 좁아짐 — 과장 없음",
     "긴 팔과 종아리, 가는 손목과 발목",
     "길고 우아한 굴곡형 실루엣, 하체는 현실 비율"
    ],
    "curvy_athletic": [
     "탄력 있고 굴곡진 체격, 긴 다리, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 탄탄하지만 여성스러운 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "잘록하고 탄탄한 허리, 은은한 복근 윤곽",
     "허리와 대비되는 둥근 골반 — 현실 비율",
     "탄탄하고 매끈한 허벅지, 무릎을 향해 완만하게 좁아짐 — 근육이 도드라지거나 과장되지 않음",
     "매끈한 팔과 종아리, 가는 손목과 발목",
     "가슴·허리·골반의 대비가 분명한 탄탄한 굴곡형, 하체는 현실 비율"
    ],
    "strong_curvy": [
     "넓은 어깨와 현실적인 운동선수의 단단한 근육이 있는 강인한 굴곡 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 넓고 탄탄한 어깨",
     "풍만한 볼륨, 둥근 형태",
     "가슴과 골반보다 뚜렷하게 잘록한 허리, 은은한 복근",
     "허리보다 넓고 둥근 골반 — 현실 비율",
     "탄탄한 근육이 있는 매끈한 허벅지, 무릎을 향해 완만하게 좁아짐 — 보디빌더처럼 부풀지 않음",
     "현실적인 운동선수처럼 탄탄한 팔과 종아리(부풀린 근육 아님), 가는 손목과 발목",
     "강인한 어깨와 탄탄한 몸 위에 가슴·허리·골반의 굴곡이 분명한 형태, 하체는 현실 비율"
    ],
    "busty_slender": [
     "길고 늘씬한 체격, 긴 다리, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 부드러운 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "가늘게 잘록한 허리",
     "허리와 자연스럽게 이어지는 골반 — 현실 비율",
     "가늘고 매끈한 허벅지",
     "길고 가는 팔과 종아리, 가는 손목과 발목",
     "가는 몸에 풍만한 가슴이 대비되는 늘씬한 실루엣"
    ],
    "hourglass": [
     "모래시계형 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 부드러운 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "확실히 잘록한 허리, 갈비뼈에서 골반으로 이어지는 매끄러운 굴곡",
     "가슴과 균형을 이루는 둥근 골반 — 현실 비율",
     "매끈하고 무릎을 향해 완만하게 좁아지는 허벅지 — 과장 없음",
     "부드러운 팔과 종아리, 가는 손목과 발목",
     "가슴·허리·골반의 대비가 분명한 모래시계형, 하체는 현실 비율"
    ],
    "voluptuous": [
     "풍만한 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 부드러운 어깨선",
     "아주 풍만한 볼륨, 둥근 형태",
     "잘록한 허리",
     "둥글고 풍성한 골반 — 사람 몸으로 읽히는 비율",
     "부드럽고 매끈한 허벅지 — 하체가 쏠리거나 과장되지 않음",
     "부드러운 팔과 종아리",
     "가슴이 풍만한 곡선 실루엣, 하체는 현실 비율"
    ],
    "pear_curvy": [
     "아래로 갈수록 굴곡이 살아나는 체격, 기존 키와 팔다리 길이 유지",
     "자연스러운 목 길이, 좁고 부드러운 어깨선",
     "적당히 풍만한 볼륨",
     "잘록한 허리",
     "허리보다 넓은 둥근 골반 — 현실 비율",
     "윗부분에 자연스러운 볼륨, 무릎을 향해 완만하게 좁아지는 허벅지 — 과장 없음",
     "부드러운 팔과 종아리, 가는 손목과 발목",
     "부드럽게 아래로 넓어지는 곡선 실루엣, 하체는 현실 비율"
    ],
    "willowy_curvy": [
     "버들가지처럼 가늘고 긴 체격, 긴 다리, 기존 키와 팔다리 길이 유지",
     "긴 목, 가늘고 부드러운 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "가늘게 잘록한 허리",
     "허리와 부드럽게 이어지는 골반 — 현실 비율",
     "길고 가는 허벅지",
     "길고 가는 팔과 종아리",
     "낭창하고 긴 몸에 가슴의 곡선이 살아 있는 실루엣"
    ],
    "petite_curvy": [
     "작고 아담한 굴곡형 체격, 기존 키와 팔다리 길이 유지",
     "가는 목, 좁고 부드러운 어깨선",
     "풍만한 볼륨, 둥근 형태",
     "가늘게 잘록한 허리",
     "둥근 골반 — 현실 비율",
     "매끈하고 짧게 좁아지는 허벅지 — 과장 없음",
     "가는 팔과 종아리, 작은 손목과 발목",
     "작고 아담하지만 굴곡이 분명한 실루엣"
    ]
   },
   "s2": [
    "캐릭터/콘셉트",
    "성별·나이대",
    "얼굴 크기",
    "얼굴형",
    "이목구비 배치",
    "눈 형태",
    "눈색",
    "동공",
    "코",
    "입술",
    "피부색",
    "머리색",
    "헤어스타일",
    "체형",
    "전체 골격·비례",
    "목·어깨",
    "가슴",
    "허리",
    "골반·엉덩이",
    "허벅지",
    "팔·종아리",
    "전체 실루엣"
   ],
   "s3": [
    "디자인 방식",
    "프레임 종류",
    "캐릭터가 묻어나는 곳",
    "세력 프레임",
    "주요 색상",
    "실루엣",
    "지켜야 할 것",
    "노출 범위",
    "장비·소품"
   ],
   "s4": [
    "액션",
    "손동작",
    "표정",
    "시선",
    "머리카락·의상 움직임",
    "구도",
    "카메라",
    "광원",
    "장면 팔레트",
    "배경",
    "환경 효과",
    "금지"
   ],
   "heading": [
    "체형"
   ],
   "bodyKeys": [
    "전체 골격·비례",
    "목·어깨",
    "가슴",
    "허리",
    "골반·엉덩이",
    "허벅지",
    "팔·종아리",
    "전체 실루엣"
   ],
   "f": {
    "concept": "캐릭터/콘셉트",
    "age": "성별·나이대",
    "faceSize": "얼굴 크기",
    "faceShape": "얼굴형",
    "placement": "이목구비 배치",
    "eyes": "눈 형태",
    "eyeColor": "눈색",
    "pupil": "동공",
    "nose": "코",
    "lips": "입술",
    "skin": "피부색",
    "hairColor": "머리색",
    "hair": "헤어스타일",
    "design": "디자인 방식",
    "frameKind": "프레임 종류",
    "traits": "캐릭터가 묻어나는 곳",
    "factionFrame": "세력 프레임",
    "colors": "주요 색상",
    "sil": "실루엣",
    "rules": "지켜야 할 것",
    "expo": "노출 범위",
    "gear": "장비·소품",
    "action": "액션",
    "hands": "손동작",
    "expr": "표정",
    "gaze": "시선",
    "motion": "머리카락·의상 움직임",
    "frame": "구도",
    "camera": "카메라",
    "light": "광원",
    "palette": "장면 팔레트",
    "background": "배경",
    "effects": "환경 효과",
    "ban": "금지"
   },
   "words": {
    "eul": "을",
    "reul": "를",
    "who": "삼국지 {faction}의 {role} {name}({en}){p} 여성으로 의인화한 인물 — {lore}",
    "world": " — {world} 세계",
    "impression": " · 첫인상: ",
    "adult": "성인 여성",
    "scene": "이번 장소: ",
    "note": "장면 메모: ",
    "expoChosen": "(고른 노출) ",
    "sec": [
     "2.캐릭터 외형 — 캐릭터별 교체",
     "3. 코디네이션 — 의상별 교체 (세부 디자인은 그림이 정함)",
     "4. 장면 — 장면별 교체"
    ],
    "exprTail": " — 은은하게, 비웃거나 노려보거나 턱을 들어 내려다보지 않음, 얼굴은 편안하고 아름답게"
   },
   "extra": {
    "s2": "직접 고른 외형",
    "s4": "덧붙임"
   },
   "fixed": {
    "faceSize": "신체 대비 작은 얼굴",
    "placement": "짧고 콤팩트한 중안면, 눈이 머리 세로 길이의 중간쯤, 눈과 입 사이가 짧음, 얼굴 세로가 가로보다 조금 긴 정도(약 1.3:1), 작고 부드럽게 둥근 턱끝 — 길쭉한 말상·각진 턱 없음",
    "pupil": "작고 둥근 짙은 동공",
    "noDesign": "설계 지정 없음 — 화풍과 장면에 맞게",
    "design": "아래 조건 안에서 옷·장갑·장신구의 구체적인 모양, 분할, 장식은 자유롭게 디자인한다. 정해 둔 것은 프레임 종류·세력 프레임·색·지켜야 할 규칙·노출 범위(와 고른 실루엣)뿐",
    "silFree": "자유 — 그림이 정함",
   "frameKindSil": "실루엣 칸을 따름 — 역할({role})은 분위기만 참고하고, 그 역할 옷의 모양(장포·코트 같은 옷 종류)은 쓰지 않음",
   "traitsSil": "옷 모양이 아니라 장신구·문양·색·머리 장식으로만 드러남(옷 모양은 실루엣대로) — ",
   "silFirst": " — 옷의 큰 모양은 이 실루엣을 따름, 프레임 종류·캐릭터가 묻어나는 곳·장비보다 우선",
    "gearRule": " — 이 세계에 맞게 다시 만든 것, 모양은 자유, 실제 크기로 하나만 그려짐. 긴 무기는 자루가 끝까지 끊김 없는 한 줄의 곧은 직선이고 날은 한쪽 끝에 하나만, 휘거나 꺾이거나 둘로 그려지지 않음, 머리나 어깨 뒤로 지나가지 않음",
    "action": "카드 그림용으로 서 있는 자세 — 몸을 카메라 쪽 3/4로 돌리고 한쪽 다리에 무게",
    "hands": "한 손은 그녀의 물건을 들고, 다른 손은 몸 옆에서 손가락을 느슨하게 굽힘 — 다섯 손가락이 자연스러운 손",
    "handsPose": "액션 칸대로 — 다섯 손가락이 자연스러운 손",
    "expr": "은은하고 자연스러운 표정",
    "gaze": "관객을 향함",
    "motion": "머리끝과 옷자락이 가볍게 흩날림, 단단한 갑옷·장갑은 펄럭이지 않음",
    "frame": "세로 2:3, 머리부터 발끝까지 여백을 두고 포함한 전신, 인물을 화면 중앙에 크게 배치, 배경이 풍부해도 캐릭터 디자인이 또렷하게 읽힘",
    "camera": "눈높이에서 살짝 낮은 위치, 정면 또는 3/4 방향",
    "effects": "떠다니는 작은 빛 입자, 옅은 공기 원근",
    "noFigure": "다른 인물·말·생물 없음, 로고·워터마크·말풍선·테두리 없음"
   },
   "worlds": {
    "samguk": {
     "rulesSil": "후한 말 삼국시대의 재질과 장식 — 비단·옻칠 가죽·청동·옥·끈으로 엮은 미늘, 한나라풍 문양과 머리 장식. 옷 종류와 모양은 실루엣 칸대로. 서양 판금 갑옷·일본 기모노나 사무라이 갑옷·청나라 복식·현대 소재 없음. 투구를 쓴다면 얼굴과 머리 모양이 보이게",
    "expoSil": "실루엣 칸의 옷에 맞게 피부가 드러남 — 깊게 열린 넥라인과 자연스러운 가슴골, 드러난 어깨와 팔, 허벅지 노출은 실루엣이 허락하는 방식 하나로(짧은 하의·갑옷 조각 사이·실루엣에 원래 있는 트임 중 하나) — 노출을 위해 긴 치마나 끌리는 겉자락을 새로 만들지 않음. 갑옷 조각은 양쪽 대칭으로 제자리에, 흘러내리지 않음, 가슴과 골반은 가려짐",
    "rules": "후한 말 삼국시대 차림 — 엇갈린 깃의 비단 장포와 넓은 허리띠, 갑옷을 입는다면 끈으로 엮은 미늘이나 비늘 갑옷, 청동·옥·옻칠 장식과 한나라 머리 장식. 서양 판금 갑옷·일본 기모노나 사무라이 갑옷·청나라 복식·현대 소재 없음. 투구를 쓴다면 얼굴과 머리 모양이 보이게",
     "expo": "장포가 열려 피부가 드러남 — 엇갈린 깃이 깊은 넥라인으로 열려 자연스러운 가슴골, 디자인상 바깥 장포가 잘려 드러난 어깨와 팔, 치마 자락의 높은 트임으로 드러난 허벅지. 갑옷 조각은 양쪽 대칭으로 제자리에, 흘러내리지 않음, 가슴과 골반은 가려짐",
     "light": "자연광·횃불·등불",
     "ban": "읽히는 글자나 숫자 없음 — 깃발·인장·휘장에만 {chars}"
    },
    "fantasy": {
     "rulesSil": "서양 중세 하이판타지의 재질과 장식 — 강철·가죽·양모·벨벳·금·보석, 문양을 따라 은은한 마법 빛. 옷 종류와 모양은 실루엣 칸대로. 그녀의 삼국지 출신은 그녀의 물건·색·태도로만 드러남. 엇갈린 깃 장포·넓은 한푸 소매·동양 갑옷·기계·현대 소재 없음. 서양인 것은 옷과 배경뿐이고 얼굴은 2번 칸 그대로. 투구를 쓴다면 얼굴과 머리 모양이 보이게",
    "expoSil": "실루엣 칸의 옷에 맞게 피부가 드러남 — 깊게 열린 넥라인과 자연스러운 가슴골, 드러난 어깨와 팔, 허벅지 노출은 실루엣이 허락하는 방식 하나로(짧은 하의·갑옷 조각 사이·실루엣에 원래 있는 트임 중 하나) — 노출을 위해 긴 치마나 끌리는 겉자락을 새로 만들지 않음. 코르셋 없음, 갑옷 조각은 양쪽 대칭으로 제자리에, 흘러내리지 않음, 가슴과 골반은 가려짐",
    "designHead": "서양 중세 하이판타지 옷만 — 넓은 한푸 소매·엇갈린 깃 장포·동양풍 겉옷 없음. ",
    "rules": "서양 중세 하이판타지 차림 — 판금·사슬·문장 겉옷, 가운과 망토, 서클릿과 관, 강철·가죽·양모·벨벳·금, 문양을 따라 은은한 마법 빛. 그녀의 삼국지 출신은 그녀의 물건·색·태도로만 드러남. 엇갈린 깃 장포·넓은 한푸 소매·동양 갑옷·기계·현대 소재 없음. 서양인 것은 옷과 배경뿐이고 얼굴은 2번 칸 그대로. 투구를 쓴다면 얼굴과 머리 모양이 보이게",
     "expo": "예장이 열려 피부가 드러남 — 어깨갑과 팔 보호대 사이로 드러난 맨어깨와 팔, 목 보호대 아래 깊게 열린 넥라인과 자연스러운 가슴골, 겉옷이나 가운의 높은 트임으로 드러난 허벅지. 코르셋 없음, 갑옷 조각은 양쪽 대칭으로 제자리에, 흘러내리지 않음, 가슴과 골반은 가려짐",
     "light": "밝은 낮빛 또는 그 세계의 은은한 마법 빛",
     "ban": "읽히는 글자나 숫자 없음 — 깃발과 방패에는 짐승이나 문장 그림만, 글자·한자 없음"
    },
    "mecha": {
     "rules": "여성 메카 의인화 — 목부터 발끝까지 메카 장갑, 장갑판은 천이나 드레스가 아니라 관절이 보이는 단단한 장갑으로 읽힘, 천 로브·드레스·치마·긴 천 없음, 망토가 있다면 단단한 장갑 바인더 판, 얼굴과 머리카락은 사람 그대로. 먼 미래 SF 배경이고 동양 전통 건축·탑·기와지붕·석등 없음",
     "expo": "겉 장갑은 양쪽 어깨에 대칭으로 걸쳐 있고 안쪽으로 피부가 드러남 — 깊게 열린 넥라인과 자연스러운 가슴골, 몸에 맞는 코르셋 같은 허리, 형태가 허락하는 곳의 슬릿. 칼라는 넥라인을 따라 V로 열리거나 접히고 목에서 떨어져 서지 않음, 흘러내리지 않음, 가슴과 골반은 가려짐",
     "light": "장면에 맞는 조명, 얼굴과 몸 앞은 부드러운 빛으로 고르게 밝게",
     "ban": "읽히는 글자나 숫자 없음 — 휘장은 추상 모양만, 글자·한자 없음"
    }
   }
  };

  /* 세계마다 실루엣(2026-11-05 「무협, 판타지 실루엣 갈래도 만들어줘」) — 메카와 같이 고른 때만. 세계 규칙(삼국시대 차림 · 서양 하이판타지)과 노출 범위 안에서 큰 덩어리만 */
  var SILHOUETTE_HEAD = { samguk: 'OUTFIT SILHOUETTE: ', fantasy: 'OUTFIT SILHOUETTE: ', mecha: 'MECHA SILHOUETTE: ' };
  var SAMGUK_SILHOUETTES = [
    { key: 'light_dancer', ko: '경갑 무희형', kot: '가벼운 갑편 몇 장만 걸친 몸에 맞는 비단 무복, 허리와 어깨에서 흐르는 긴 비단 띠와 가벼운 치마 — 춤추듯 가볍고 날렵한 실루엣', en: 'light armor pieces over a fitted silk martial dress, long silk sashes and a light skirt flowing from the waist and shoulders — a light, dancing silhouette' },
    { key: 'heavy_general', ko: '중갑 장군형', kot: '겹겹이 엮은 미늘 갑옷, 크고 묵직한 짐승 머리 어깨갑, 무릎까지 내려오는 갑옷 자락 — 넓고 묵직한 장군의 실루엣', en: 'layered laced lamellar armor, big heavy beast-head pauldrons and armored skirts to the knees — a broad, weighty general\'s silhouette' },
    { key: 'scholar_robe', ko: '장포 책사형', kot: '갑옷 없이 바닥까지 끌리는 넓은 소매의 긴 장포와 넓은 허리띠 — 길고 우아하게 떨어지는 실루엣', en: 'no armor — a long floor-length robe with wide sleeves and a broad sash, a long elegant falling silhouette' },
    { key: 'court_regalia', ko: '궁중 예복형', kot: '여러 겹으로 끌리는 긴 예복, 높은 관, 길게 늘어뜨린 띠와 패옥 — 의식적이고 위엄 있는 실루엣', en: 'layered trailing court regalia with a tall crown, long hanging sashes and jade pendants — a ceremonial, stately silhouette' },
    { key: 'cavalry', ko: '기마 무장형', kot: '몸에 붙는 가벼운 미늘 갑옷, 짧은 갑옷 자락과 말을 타기 좋은 트임, 팔과 정강이 보호대 — 날렵하고 실전적인 실루엣', en: 'fitted light lamellar armor with short armored skirts slit for riding, bracers and greaves — a lean, practical cavalry silhouette' },
    { key: 'wanderer', ko: '협객형', kot: '몸에 맞는 무복과 넓은 허리띠, 팔 보호대, 등 뒤로 흐르는 긴 비단 띠 — 강호를 떠도는 협객의 실루엣', en: 'a fitted martial-arts outfit with a wide belt and arm guards, a long silk sash streaming behind — a wandering swordswoman\'s silhouette' },
    { key: 'cape_general', ko: '망토 장수형', kot: '어깨에서 발목까지 크게 펼쳐진 전투 망토가 실루엣의 중심, 그 아래 미늘 갑옷', en: 'a great war cape spreading from the shoulders to the ankles as the main shape, lamellar armor beneath' },
    { key: 'fur_mantle', ko: '털 망토 변방형', kot: '어깨를 덮는 풍성한 털 망토와 가죽 띠, 짐승 장식 — 북방·남방 변방 장수의 거친 실루엣', en: 'a heavy fur mantle over the shoulders with leather straps and beast ornaments — a rugged frontier silhouette' },
    { key: 'celestial_shawl', ko: '비단 피백형', kot: '어깨와 팔을 감아 공중에 흐르는 긴 비단 피백, 가벼운 겹옷 — 선녀처럼 떠오르는 실루엣', en: 'a long silk shawl wrapping the shoulders and arms and floating in the air, light layered robes — an airy, celestial silhouette' },
    { key: 'layered_skirt', ko: '겹치마 갑주형', kot: '상체는 미늘 흉갑, 허리 아래는 여러 겹의 비단 치마가 넓게 퍼짐 — 위는 단단하고 아래는 흐르는 실루엣', en: 'a lamellar breastplate above, many layers of silk skirt flaring wide below the waist — firm above, flowing below' },
    { key: 'water_sleeves', ko: '물소매 무희형', kot: '손끝 너머까지 길게 흐르는 물소매가 공중에 휘날림, 몸에 맞는 무희 옷 — 소매가 실루엣을 만듦', en: 'very long flowing water sleeves trailing past the hands through the air over a fitted dancer\'s dress — the sleeves make the shape' },
    { key: 'shadow_garb', ko: '경장 자객형', kot: '몸에 붙는 어두운 경장, 최소한의 장식과 팔·다리 감는 띠 — 얼굴은 가리지 않는 날렵한 실루엣', en: 'a dark close-fitting light outfit with minimal ornament and wrapped arms and legs — a sleek silhouette, face uncovered' },
    { key: 'phoenix_crown', ko: '봉관형', kot: '머리의 큰 봉황 관과 늘어진 구슬 장식, 무게감 있는 예복 — 머리 장식이 실루엣의 중심', en: 'a large phoenix crown with hanging bead strands and a weighty ceremonial robe — the headdress is the main shape' },
    { key: 'archer', ko: '궁수 경장형', kot: '가슴 보호대와 한쪽 어깨 화살통, 몸에 맞는 짧은 장포와 각반 — 가볍고 곧은 실루엣', en: 'a chest guard, a quiver, a fitted short robe and leg wraps — a light, upright archer\'s silhouette' }
  ];
  var FANTASY_SILHOUETTES = [
    { key: 'full_plate', ko: '판금 기사형', kot: '목부터 발끝까지 이어진 판금 갑옷과 둥근 큰 어깨판, 짧은 문장 겉옷 — 단단한 기사의 실루엣', en: 'full plate armor from neck to feet with big rounded pauldrons and a short heraldic tabard — a solid knight\'s silhouette' },
    { key: 'ranger', ko: '가벼운 정찰형', kot: '가죽 갑옷과 짧은 망토, 등에 내린 후드, 팔 보호대와 장화 — 가볍고 날렵한 실루엣', en: 'leather armor with a short cloak, a lowered hood, bracers and boots — a light, agile ranger\'s silhouette' },
    { key: 'mage_robe', ko: '망토 마법사형', kot: '바닥까지 끌리는 긴 로브와 높은 칼라, 넓은 소매, 어깨 망토 — 길고 신비로운 실루엣', en: 'a long floor-length robe with a high collar, wide sleeves and a shoulder mantle — a tall, mysterious mage\'s silhouette' },
    { key: 'gown_armor', ko: '드레스 갑주형', kot: '몸에 맞는 흉갑과 어깨갑 아래로 바닥까지 넓게 퍼지는 드레스 자락 — 우아한 여기사의 실루엣', en: 'a fitted breastplate and pauldrons above a gown skirt flaring to the floor — an elegant lady-knight silhouette' },
    { key: 'battle_mage', ko: '전투 마법사형', kot: '가벼운 흉갑과 팔 보호대 위로 허리에서 갈라져 흐르는 로브 자락 — 갑옷과 로브가 반씩', en: 'a light breastplate and bracers with robe panels split from the waist — half armor, half robe' },
    { key: 'paladin_cape', ko: '성기사 망토형', kot: '판금 갑옷 위 긴 문장 겉옷과 발목까지 내려오는 흰 망토 — 곧고 성스러운 실루엣', en: 'plate armor under a long heraldic tabard with a white cape to the ankles — a straight, holy silhouette' },
    { key: 'winged', ko: '날개 장식형', kot: '어깨나 등 뒤에서 크게 펼쳐진 금속 깃털 날개 장식, 날개 모양 머리 장식 — 날개가 실루엣의 중심', en: 'large metal feathered wing ornaments spreading from the shoulders or back and a wing-shaped head ornament — the wings make the shape' },
    { key: 'dark_spiked', ko: '흑기사 가시형', kot: '각지고 가시 돋친 어두운 판금, 끝이 찢긴 긴 망토 — 날카롭고 위협적인 실루엣', en: 'angular, spiked dark plate armor and a long cape with torn edges — a sharp, menacing silhouette' },
    { key: 'elven_leaf', ko: '엘프풍 우아형', kot: '잎사귀 문양의 얇은 갑편과 흐르는 얇은 천 자락, 가는 서클릿 — 가늘고 우아한 실루엣', en: 'thin leaf-patterned armor plates and flowing light fabric panels with a slender circlet — a slender, graceful silhouette' },
    { key: 'wild_warrior', ko: '야성 전사형', kot: '털 망토와 가죽 띠, 최소한의 금속 갑편, 뼈와 이빨 장식 — 거칠고 강인한 실루엣', en: 'a fur cloak, leather straps, minimal metal plates and bone and tooth ornaments — a rugged, wild warrior silhouette' },
    { key: 'noble_coat', ko: '귀족 장교 코트형', kot: '무릎 아래까지 내려오는 긴 코트와 견장, 허리띠와 장갑, 높은 장화 — 단정하고 권위 있는 실루엣', en: 'a long coat below the knees with epaulettes, a belt, gloves and tall boots — a crisp, commanding officer\'s silhouette' },
    { key: 'priestess', ko: '사제 예복형', kot: '바닥까지 늘어진 성직 예복과 금 장식 띠, 높은 머리 장식 — 길고 경건한 실루엣', en: 'a floor-length priestly vestment with gold-trimmed stoles and a tall head ornament — a long, devout silhouette' },
    { key: 'dragon_scale', ko: '용비늘 갑주형', kot: '온몸을 덮는 용비늘 갑옷과 뿔 모양 어깨·머리 장식 — 짐승 같은 위용의 실루엣', en: 'dragon-scale armor covering the body with horn-shaped shoulder and head ornaments — a beastly, imposing silhouette' },
    { key: 'crown_regalia', ko: '왕관 예장형', kot: '큰 왕관과 털 장식 왕실 망토, 그 아래 장식 흉갑 — 의식적이고 위엄 있는 실루엣', en: 'a great crown and a fur-trimmed royal mantle over an ornate breastplate — a ceremonial, regal silhouette' }
  ];
  var MECHA_SILHOUETTE_HEAD = 'MECHA SILHOUETTE: ';
  var MECHA_SILHOUETTES = [
    { key: 'slim_suit', ko: '슬림 보디슈트형', kot: '몸에 밀착한 날렵한 장갑, 어깨·팔·다리 장갑이 얇고 길어 몸의 곡선이 그대로 드러나는 형태', en: 'a sleek armored bodysuit — thin, long plates on the shoulders, arms and legs that follow her curves closely' },
    { key: 'heavy_assault', ko: '중장갑 강습형', kot: '두껍고 큼직한 어깨 장갑과 다리 장갑, 넓게 벌어진 상체 실루엣, 등과 다리의 큰 추진기 — 몸통은 몸에 맞게 잘록함', en: 'heavy assault bulk — big, thick shoulder and leg armor, a broad upper silhouette and large thrusters on the back and legs, while the torso stays fitted and the waist narrow' },
    { key: 'wing_binder', ko: '날개 바인더형', kot: '등 뒤에서 좌우 대칭으로 크게 펼쳐진 날개 모양 장갑판, 몸 장갑은 가볍게 — 날개가 실루엣의 중심', en: 'large wing-shaped binder plates spread symmetrically behind her back as the main shape, with light body armor' },
    { key: 'skirt_plate', ko: '장갑 치마형', kot: '허리에서 아래로 여러 장의 단단한 장갑판이 치마처럼 퍼지는 형태(천이 아니라 관절로 이어진 판), 다리는 판 사이로 드러남', en: 'several rigid jointed armor plates flaring from the waist like a skirt — plates, not cloth — with the legs showing between them' },
    { key: 'long_coat_plate', ko: '장갑 롱코트형', kot: '어깨에서 무릎 아래까지 내려오는 단단한 판으로 된 코트형 장갑(앞이 열려 안쪽 몸 장갑이 보임), 각진 칼라', en: 'a long coat made of rigid plates from the shoulders to below the knees, open at the front to show the body armor, with an angular collar' },
    { key: 'float_units', ko: '떠 있는 유닛형', kot: '몸 장갑은 가볍고, 몸 주위에 작은 방패·드론 유닛 여러 개가 대칭으로 떠 있음', en: 'light body armor with several small shield and drone units floating symmetrically around her' },
    { key: 'sub_arms', ko: '보조 팔형', kot: '등에서 뻗어 나온 한 쌍의 기계 보조 팔이 대칭으로 펼쳐짐, 그 끝에 방패나 도구 — 사람 팔은 두 개 그대로', en: 'a symmetrical pair of mechanical sub-arms reaching out from her back, ending in shields or tools — her own two human arms stay as they are' },
    { key: 'big_backpack', ko: '대형 등짐형', kot: '등에 메고 있는 큰 장비 유닛(탱크·포신·안테나)이 머리 위로 솟아 실루엣을 만듦, 몸 장갑은 중간 두께', en: 'a large equipment unit worn on the back (tanks, a cannon barrel or antennae) rising above her head as the main shape, with medium body armor' },
    { key: 'light_agile', ko: '경량 고기동형', kot: '최소한의 얇은 장갑, 종아리와 발목의 큰 추진기, 앞으로 기운 날렵한 실루엣', en: 'minimal thin armor with large thrusters at the calves and ankles — a light, fast, forward-leaning silhouette' },
    { key: 'halo_crown', ko: '후광·관형', kot: '머리 뒤의 큰 원형 후광 링과 높은 관 모양 머리 장갑, 길게 떨어지는 어깨 장식판 — 의식적이고 우아한 형태', en: 'a large ring halo behind her head and a tall crown-like head unit, with long hanging shoulder plates — a ceremonial, elegant shape' },
    { key: 'segmented_parts', ko: '장갑 분리형', kot: '장갑이 하나로 이어지지 않고 어깨·팔뚝·가슴·허리·허벅지·정강이에 따로 떨어진 조각으로 붙어 있음, 조각 사이로 몸에 붙는 어두운 이너 슈트가 보임', en: 'separate armor pieces rather than one shell — plates on the shoulders, forearms, chest, waist, thighs and shins, with a dark fitted inner suit showing between them' },
    { key: 'full_armor', ko: '전신 장갑형', kot: '목부터 발끝까지 장갑판이 빈틈 없이 이어진 완전 무장, 맨살은 얼굴과 노출 범위가 허락한 곳뿐, 판의 이음매와 관절이 촘촘히 보임', en: 'complete full-body armor with plates joined seamlessly from neck to feet — bare skin only on the face and where EXPOSURE allows, dense visible seams and joints' },
    { key: 'frame_exposed', ko: '골격 노출형', kot: '겉 장갑은 듬성듬성하고 그 아래 금속 골격·피스톤·케이블 같은 기계 뼈대가 드러남, 가볍고 정밀한 인상', en: 'sparse outer plates over an exposed mechanical skeleton of metal struts, pistons and cables — light and precise' },
    { key: 'power_limbs', ko: '대형 팔다리형', kot: '몸통은 날씬한데 팔뚝과 종아리 장갑만 크게 부푼 기계 팔다리(거대한 건틀릿과 부츠) — 대비가 실루엣의 중심', en: 'a slender torso with oversized mechanical forearms and lower legs — huge gauntlets and boots — the contrast is the main shape' },
    { key: 'knight_plate', ko: '기사 갑주형', kot: '중세 기사 판금을 닮은 메카 장갑 — 둥근 큰 어깨판, 가슴판, 허리 아래 겹친 판, 투구 대신 얼굴을 드러낸 머리 장식', en: 'mecha armor shaped like a medieval knight\'s plate — big rounded pauldrons, a breastplate, layered plates below the waist, a head ornament instead of a helmet so her face shows' },
    { key: 'cape_plates', ko: '망토판형', kot: '어깨 뒤에서 발목까지 길게 늘어진 여러 장의 단단한 장갑판이 망토처럼 펼쳐짐(천 아님, 관절로 이어진 판)', en: 'several long rigid jointed plates hanging from behind the shoulders to the ankles like a cape — plates, not cloth' },
    { key: 'tail_unit', ko: '꼬리 유닛형', kot: '허리 뒤에서 길게 뻗은 마디진 기계 꼬리 하나, 그 끝에 무장이나 장식 — 동물·전설 모티프와 잘 맞음', en: 'one long segmented mechanical tail reaching from the back of her waist, tipped with a weapon or ornament' },
    { key: 'hover_rings', ko: '부유 링형', kot: '허리와 발목 둘레에 몸에서 떨어져 떠 있는 고리 모양 장갑 링, 몸 장갑은 가볍게 — 떠 있는 링이 실루엣을 만듦', en: 'ring-shaped armor bands floating free around her waist and ankles, with light body armor — the floating rings make the shape' }
  ];
  var POSE_DEFAULT = 'Standing, card-ready pose;';
  var WORLD_POSES = [
    { key: 'stand_3q', ko: '3/4 로 서서', en: 'Standing turned three-quarters toward the camera, weight on one leg, one hand resting at her side or hip;' },
    { key: 'stride', ko: '걸어 나오며', en: 'Mid-stride toward the camera, one foot forward, cloth and hair in motion;' },
    { key: 'weapon_ready', ko: '무기 겨누기', en: 'In a ready combat stance, her signature item raised or levelled toward the viewer, knees bent, balanced;' },
    { key: 'sit_throne', ko: '앉아서(자리·계단)', en: 'Seated on a throne, step or edge that belongs to the world, upright, knees together or crossed, both feet visible;' },
    { key: 'kneel', ko: '한쪽 무릎', en: 'Down on one knee, the other foot planted, torso upright and facing the camera;' },
    { key: 'lean', ko: '기대서', en: 'Leaning back against a structure of the world (gate, pillar, rail, banner pole), arms relaxed;' },
    { key: 'arms_cross', ko: '팔짱', en: 'Standing square to the camera with arms crossed, chin level;' },
    { key: 'salute', ko: '포권', en: 'Standing with a respectful fist-and-palm salute at chest height, a quiet ceremonial bearing;' }
  ];
  var WORLD_TIMES = [
    { key: 'dawn', ko: '새벽', en: 'TIME & WEATHER: first light of dawn — cool blue shadows, a thin warm line on the horizon.' },
    { key: 'day', ko: '한낮', en: 'TIME & WEATHER: clear daylight, crisp shadows.' },
    { key: 'golden', ko: '석양', en: 'TIME & WEATHER: golden hour — long warm light, deep orange sky.' },
    { key: 'night', ko: '밤', en: 'TIME & WEATHER: night — the scene lit by its own fires, lamps or glow, a dark sky above.' },
    { key: 'storm', ko: '폭풍', en: 'TIME & WEATHER: an approaching storm — heavy clouds, wind in cloth and hair, a flash of distant lightning.' },
    { key: 'snow', ko: '눈', en: 'TIME & WEATHER: falling snow, soft diffused light, snow on edges and shoulders.' },
    { key: 'fog', ko: '안개', en: 'TIME & WEATHER: thick fog — the far structures fade to silhouettes, near light glows in the mist.' },
    { key: 'petals', ko: '꽃잎', en: 'TIME & WEATHER: a soft spring day with blossom petals drifting through the air.' }
  ];
  var SCENE_HEAD = 'SETTING (this card): ';   /* 장면 글은 전치사(inside·before·on·at)나 명사로 시작한다 — 머리말은 콜론까지만 */
  var EXPR_HEAD = 'EXPRESSION: ';
  /* 표정 세기 — GPT 세션의 image_gen 은 같은 표정 글을 크게 키웠다(「턱을 살짝 듦」 → 고개를 젖혀 내려다보기, 「한쪽 입꼬리」 → 비웃음 · 고개 기울임).
     API 로 그린 것은 은은했다. 표정 줄 뒤에 늘 붙인다(사용자 2026-11-03 「gpt 바뀐게 표정 표현이 너무 과해지긴했어」) */
  var EXPR_TAIL = ' Keep it subtle and natural, a light touch rather than acting: no sneer, glare, smirk-pulled cheek or chin lifted to look down at the viewer; her face stays relaxed and attractive.';
  var BODY_LINE = 'BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint. Hands and feet may be partly hidden by the pose or the frame.';
  var RULES = [
    /* 깃발·인장의 한 글자(세력 魏·蜀·吳·雄 · 그 장수의 성씨)는 읽혀도 된다 — 그 밖의 글자 · 숫자는 없다. {chars} 는 조립부가 CHARS 로 채운다 */
    'ONE FIGURE ONLY. No second character, no horse or other creature, no logo, no watermark, no speech bubble, no frame border. {text_rule}',
    'ANATOMY: natural adult proportions, both hands drawn correctly as hands. No extra limbs.'
  ];

  /* 덧붙임 칸 — 생성기 화면의 글 칸. id 는 기록의 열쇠 */
  var NOTES = [
    { id: 'scene', ko: '장소·상황', multi: true, head: 'SCENE NOTE: ' },
    { id: 'outfit', ko: '의상·소품', multi: true, head: 'OUTFIT NOTE: ' },
    { id: 'custom', ko: '추가 연출 요청', multi: true, head: 'EXTRA: ' }
  ];

  /* 파일 이름 틀 — IMAGE_RULES.md 3절과 같다 */
  var FILES = {
    world: '{card}_{world}_{style}_f.webp',
    casual: '{card}_{world}_{style}_f_casual{n}.webp'   /* 일상컷은 그 세계 그림을 참고 그림으로 붙인다 — 세계를 탄다 */
  };

  /* ══ 일상컷(트리 버전2) ══ game-atelier 의 GAME_LINES 일상컷 몫에서 왔다(2026-10-30, docs/CASUAL_TREE_V2.md 5절).
     장면(시대·장소·의상·자세·받침·구도·손·소품·다리·시선)은 data/casual-tree.json·casual-tree-v2.json 이 쥐고 lib/casual-tree*.js 가 거른다.
     여기는 그 장면을 영어 줄에 싣는 틀만. 조립은 lib/prompt-sam.js 의 buildCasual.
     game 과 같은 것: 참고 그림을 붙인다 — 그 장수의 세계 그림(삼국시대·중세 판타지·메카 중 하나) 이 사람이 일상에 나온 한 장(사용자 2026-10-30 「일상컷은 참고 이미지가 있어야 돼서 그 화풍을 따라가야 돼」).
     그래서 일상컷은 세계를 타고(파일 이름에 세계), 화풍은 그 세계 그림의 화풍이다. INPUT·CHARACTER·WARDROBE·ANGLE 은 game 의 「첨부 그림의 …」 꼴.
     「그 게임」 자리는 「그 장수의 이야기」 — 일화·물건은 장신구·주변 사물·손에 든 그 물건으로만, 옷의 색·무늬·재단과 갑옷으로는 옮기지 않는다. */
  var CASUAL = {
    input: "INPUT: the attached image is the approved character — her {world_en} card; keep her. Do not reuse earlier conversation images.",
    /* CHARACTER 한 문장. {name_en} 은 설계표에서. 얼굴·머리·몸은 첨부 그대로, 옷만 바꾼다 */
    character: {
      general: "CHARACTER: the same woman as the attached image — the female personification of {name_en} of the Three Kingdoms, seen in her everyday life. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change, and her hair may be worn differently only as SCENE's Hair line says. Her Three Kingdoms identity shows ONLY as a small accessory, an object around her, or the object PROP says she holds — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume."
    },
    /* 시간대 — 계절·날씨 뒤. 비우면 싣지 않는다(사용자 2026-10-30 「일상컷에 시간대」) */
    times: [
      { key: 'morning', ko: '아침', en: 'early morning — low clean light, long soft shadows' },
      { key: 'noon', ko: '한낮', en: 'midday — bright even light' },
      { key: 'golden', ko: '해 질 녘', en: 'golden hour — warm low sun, long shadows' },
      { key: 'dusk', ko: '땅거미', en: 'dusk — blue hour, lights coming on' },
      { key: 'night', ko: '밤', en: 'night — the scene lit by lamps, screens or windows, dark outside' },
      { key: 'neon', ko: '네온 밤', en: 'night under neon and signage light, coloured reflections' },
      { key: 'lamplight', ko: '등불', en: 'warm lamplight or candlelight indoors, the rest in shadow' }
    ],
    /* 머리 변화 — 첨부 그림의 색·길이는 지키고 매무새만(사용자 2026-10-30) */
    hairs: [
      { key: 'tied', ko: '묶음', en: 'her hair tied up in a loose bun or ponytail — same colour and length as the attached image, a few strands loose' },
      { key: 'down', ko: '풀어 내림', en: 'her hair let down loose over her shoulders — same colour and length as the attached image' },
      { key: 'braid', ko: '땋음', en: 'her hair in a single loose braid over one shoulder — same colour and length as the attached image' },
      { key: 'hat', ko: '모자·후드', en: 'a casual hat, cap or hood that suits the outfit, her hair showing beneath it — same colour and length as the attached image' },
      { key: 'wet', ko: '젖은 머리', en: 'her hair wet and slicked back or dripping — same colour and length as the attached image' }
    ],
    /* 자연광 — 일상컷 공통(2026-11-07 「조명 : 참고 그림 그대로 빼고 > 자연광」 — 얼굴만이던 것을 몸까지, 참고 그림 조명은 넘기지 않는다. 처음: 사용자 2026-11-06 「일상컷에서는 얼굴에도 자연광 느낌을 추가해줄래?」 → 「자연광은 일상컷 공통으로 넣어줘」). 일상컷 STYLE 줄(refLock)은 첨부 그림의 조명을 지키라고 해서,
       예전엔 얼굴만 장면의 빛을 받게 했다(첨부 그림 조명을 얼굴에서만 덮어씀) — 지금은 몸까지. LIGHT: 로 시작 — GPT 구조형(lib/prompt-gpt.js)이 「Light」 칸으로 옮긴다 */
    faceLight: "LIGHT: natural light — she is lit by the same natural light as the scene around her: the scene's own daylight, window light, lamplight or night light falls across her face and body with its real direction and colour temperature, with soft natural shadows under the brows, nose and chin, along the body's curves and on the ground, and gentle bounce light from the surroundings. No studio key light, rim light or flat beauty light; the attached image's lighting is not carried over — only its rendering finish.",
    /* 몸 라인 — 일상컷 공통(사용자 2026-11-07 「허리 라인을 지금보다 얇게, 골반은 지금보다 좀 더 크게, 허벅지는 상단부만 지금보다 약간 굵게」 「일상컷 케릭터에 몸 라인을 강조하는 문구」). BODY LINE: — GPT 구조형이 「Body line」 칸으로 */
    bodyLine: "BODY LINE: her figure is the attached image's, refined toward a slimmer, cinched waist, slightly wider, rounder hips and slightly fuller upper thighs (only the top of the thighs; knees and calves stay slender). The outfit and pose clearly show her body line — the curve from bust to a narrow waist and out over the hips and upper thighs reads at a glance, a graceful hourglass silhouette at realistic human scale.",
    /* 피부 광택 — 일상컷만, 단계로 고른다(사용자 2026-11-06 「그 일상컷 광택효과를 선택 할 수 있게하자. 단계별로」). 안 고르면 화풍 기본(style.json casualSkin — kv_kmmo_23d 는 dewy 와 같은 글).
       SKIN: 로 시작해야 GPT 구조형(lib/prompt-gpt.js)이 「Skin finish」 칸으로 옮긴다 */
    glosses: [
      { key: 'matte', ko: '광택 없음', en: 'SKIN: natural soft matte-satin skin on every bare area, with only subtle natural highlights on the cheekbones and nose bridge, modelled by gentle tonal shading; no glossy sheen, no oily or wet look, and never a plastic, airbrushed doll finish.' },
      { key: 'soft', ko: '은은하게', en: 'SKIN: softly luminous skin on every bare area with a gentle satin sheen — subtle highlights on the cheekbones, nose bridge, lips, collarbones and shoulders, modelled by gentle tonal shading; fresh and natural, never oily, sweaty or wet-looking, and never a plastic, airbrushed doll finish.' },
      { key: 'dewy', ko: '촉촉하게', en: 'SKIN: dewy, moist, softly glowing skin on every bare area — face, shoulders, chest, arms and legs — with a fresh luminous sheen: soft glossy highlights on the cheekbones, nose bridge, lips, collarbones, shoulders and the curves of the body, modelled by gentle tonal shading; healthy and hydrated rather than oily or sweaty, and never a plastic, airbrushed doll finish.' },
      { key: 'glossy', ko: '반짝이게', en: 'SKIN: radiant, glossy, dewy skin on every bare area — face, shoulders, chest, arms and legs — with pronounced luminous highlights on the cheekbones, nose bridge, lips, collarbones, shoulders and the curves of the body, as if a light body oil catches the light, modelled by smooth tonal shading; radiant and healthy rather than sweaty, and never a plastic, airbrushed doll finish.' }
    ],
    /* 옷 색 — 일상컷만(사용자 2026-11-08 「일상컷 생성 옵션에 의상색 관련 다양성은 없었나?」 → 「응 넣어줘」). 색 말이 없는 옷은 모델이 흰색 · 아이보리 · 베이지로 몰렸다.
       고르면 Outfit 줄 끝에 붙는다(GPT 구조형도 그 칸 그대로). 비우면 예전처럼 옷 제 색. 옷 이름에 색 · 무늬가 박힌 것(colorFixed)은 붙이지 않는다 — 메이드 블랙 · 크리스마스 레드 그대로.
       묶음 도구(tools/casual-plan.cjs)는 한 장수의 다섯 장에 서로 다른 갈래를 나눠 준다. 세력색 금지(WARDROBE · OUTPUT)는 그대로 */
    colors: [
      { key: 'pastel', ko: '파스텔', en: 'a soft pastel palette such as powder pink, baby blue, mint or lavender' },
      { key: 'vivid', ko: '비비드 원색', en: 'one bright, saturated colour such as cherry red, cobalt blue, sunflower yellow or kelly green' },
      { key: 'earth', ko: '어스톤', en: 'warm earth tones such as camel, olive, rust, chocolate or burgundy' },
      { key: 'mono', ko: '모노톤 블랙', en: 'a monochrome palette of black and charcoal with at most one white or grey accent' },
      { key: 'jewel', ko: '주얼톤', en: 'rich jewel tones such as emerald, sapphire, amethyst or wine red' },
      { key: 'denim', ko: '데님 · 인디고', en: 'denim blues and indigo, with white or cream as the only second colour' },
      { key: 'pattern', ko: '무늬', en: 'a clear pattern such as a floral print, bold stripes, gingham or plaid, in two or three cheerful colours' },
      { key: 'neutral', ko: '화이트 · 뉴트럴', en: 'clean neutrals such as white, ivory, oatmeal or soft grey' }
    ],
    colorLine: ' — in {color}; the outfit colour reads clearly at first glance',
    colorFixed: '\\b(?:black|white|red|green|denim|cream|navy|pink|blue|grey|gray|pastel|crimson|scarlet|ivory|beige|floral|striped|stripes|plaid|gingham|leopard|camo|camouflage|tartan|polka)\\b',
    /* 팔레트·시각 언어는 장신구 힌트로만. 피부·머리·눈은 첨부 그림의 그 사람 */
    design: "DESIGN (accessory hints only): her legend — {traits} — may inform at most one small accessory, a hair ornament or an object beside her, in its palette ({palette}). The clothes keep the chosen outfit's own colours; her skin, hair and eyes stay as in the attached image.",
    /* 2026-11-01 — 「soft full cheeks · soft smile」 을 뺐다(얼굴을 하나로 만들었다). 얼굴 · 나이는 첨부 그림의 그 사람, 표정은 SCENE 의 것 */
    age: "AGE: the same adult woman as in the attached image — keep her own face shape, cheekbones, eye proportions and skin tone exactly; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases). Keep her face soft, feminine and attractive in every framing — never elongated, gaunt, mannish or heavy-jawed, even in close-ups, profiles or low angles.",
    output: "OUTPUT: one standalone off-duty scene of her in the outfit chosen in SCENE; her legend shows only through accessories and objects around her — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume. Everything else follows SCENE (chosen).",
    frame: "FRAME: {frame} image. Compose the image for this frame; COMPOSITION in SCENE sets how much of her shows.",
    crop: "CROP: {edge}. This crop wins over every other line: details apply only to the part that shows, and the outfit reads through its visible neckline, straps, fabric and colour. Never widen the framing to show a hidden support, hand or leg; a limb crossing the edge runs naturally on past it, never cut off or fading out inside the image.",
    /* 시대 셋 — 열쇠는 트리 표 eras[].key(now · nation · fantasy — 원소의 「쓰임의 현장」 은 뺐다). 표에 다른 시대가 있으면 그 시대의 en 으로 eraOther */
    era: {
      now: "ERA: the present-day real world — today's clothing, hair, devices and interiors; an ordinary woman of today, nothing of her legend in her clothes.",
      nation: "WORLD: this scene happens inside her own world — the world of the attached image — as if she simply lives there: {world}. Its architecture, props, light and weather show the world; no creatures, no second character, no readable text other than {chars}. Her clothes stay the everyday outfit SCENE describes, not regalia or armor.",
      fantasy: "SETTING: a stylised stage, editorial or fantasy set, not bound to a real year — still one real adult woman in a believable space, no creatures."
    },
    eraOther: "ERA: {en}.",
    worldPlace: "the place named in WORLD",
    screens: "SCREENS: any monitor, screen, poster or sign shows only abstract colored light, simple shapes or blank art — no readable text or numbers, no logo.",
    wardrobe: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its garment, armor, regalia, ornaments, mecha plates or background. Dress her exactly as SCENE describes; that outfit must read at first glance, keeping its own recognisable colours and parts. Do not carry the attached image's palette, patterns or trim into the outfit; her Three Kingdoms identity belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her faction's palette, armor, robes or regalia.",
    /* 가까운 컷의 옷 줄 — 「옷이 한눈에, 알아볼 부분이 다」 가 크롭 밖 치마·드레스 자락까지 불렀다(game 조조전 일상, 2026-10-29) */
    wardrobeClose: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its garment, armor, regalia, ornaments, mecha plates or background. Dress her exactly as SCENE describes; the part of that outfit inside the crop must read at first glance in its own colours. Do not carry the attached image's palette, patterns or trim into the outfit; her Three Kingdoms identity belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her faction's palette, armor, robes or regalia.",
    angle: "ANGLE: the attached image fixes who she is, not how she is posed or shot. Do not copy its head angle, head tilt, gaze direction, face size in frame, camera height or crop — turn her head, set her gaze and place the camera exactly as SCENE describes, and let her face read naturally from that new angle (profile, three-quarter, looking down or away), with her features staying the same. No default card pose, no default front-facing portrait.",
    /* 돌아보기 — 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만. 눈이 어디를 보는지는 GAZE 줄이 정한다 */
    lookBack: "LOOK-BACK: her back is toward the camera and her head turns at most a quarter turn over one shoulder — the face shows in profile or three-quarter view, never full-front on a back-facing torso. Her chin sits just above the near shoulder, the far eye and cheek may be partly hidden, the side of the neck shows the turn and the shoulder line continues behind the head. Where her eyes go follows GAZE.",
    /* 붐비는 장소(레드카펫·입장 줄·관중석)는 작고 흐린 배경 인물을 허용한다(game 사용자 2026-10-29) */
    figure: "ONE MAIN FIGURE: she is the only character in focus. Where the place is busy, other people may appear only as small, soft-focus background extras — never posed with her. No logo, no watermark, no speech bubble, no frame border. No readable text or numbers.",
    anatomy: "ANATOMY: natural adult proportions, about 7.5 heads tall — height from the legs, never a smaller head or a longer neck. The neck is a natural length and the head sits close to the shoulders. No body-part enlargement, no extra limbs.",
    /* 가까운 컷의 몸 줄 — 「7.5 등신·키는 다리에서」 가 전신을 부른다(game 스파2 일상, 2026-10-29) */
    anatomyClose: "ANATOMY: natural adult proportions, never a smaller head or a longer neck. The neck is a natural length and the head sits close to the shoulders. No body-part enlargement, no extra limbs.",
    body: "BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows, knees and wrists bend the human way. Hands and feet may be partly hidden by the pose, what she holds or the frame. Right and left mean her own right and left, not the viewer's.",
    hands: "HANDS: natural human hands, no extra or duplicated limbs; each visible hand joins through its wrist and forearm to the matching shoulder. A hand may stay outside the crop, and fingers may be partly hidden by a grip.",
    handBusy: "her own {side} hand is in PROP",
    propOne: "with her own {side} hand she {action}; it is all she holds",
    propBoth: "with both hands she {action} — her own right hand {right}, her own left hand {left}",
    signatureWhole: "SIGNATURE ITEM SHAPE: it is one whole object drawn once: a long weapon (spear, glaive, halberd, staff, bow) keeps a single straight, unbroken shaft from butt to head with exactly one head or blade, held in front of or beside her body — never passing behind her head or shoulders, never broken, bent, split in two by her body or arm, or duplicated; if the frame cuts it, it leaves the frame as one straight line.",   /* 일상컷에서 그 장수의 물건을 들 때 — 창대가 꺾이거나 끊기지 않게(2026-11-02) */
    /* 소품 표의 「알아볼 거리」(signature) 자리 — 그 장수의 물건(설계표 hold.en, 없으면 역할의 hold.en) */
    /* 무기 장수의 일상컷 — 무기는 들지 않고 그 무기를 본뜬 작은 장신구 하나로(사용자 2026-11-02 「무기를 일상컷에선 … 악세사리류로 대체」) */
    weaponCharm: "SIGNATURE ACCESSORY: off duty she carries no weapon — no sword, saber, spear, glaive, halberd, bow, axe, shield or any blade in her hands, on her back or anywhere in the scene. Her signature weapon ({hold}) appears only as one small worn accessory modelled on its shape and colours — a hair ornament, pendant, earring, brooch or belt charm a few centimetres long, clearly jewellery and not a usable weapon.",
    /* 일상컷 표정 줄 뒤 — 눈 · 눈썹 · 입(2026-11-03 「일상컷쪽이 더 그래」 — 차분한 표정에도 반쯤 감은 눈 · 한쪽 눈썹을 붙였다) */
    /* 표정이 그 부분을 정하면(윙크 · 관능은 눈, 호기심은 한쪽 눈썹) 그 조각은 빼고 붙인다 — lib/prompt-sam.js */
    exprTail: { eyes: "Her eyes are naturally open and clear, not heavy-lidded or half-closed", brows: "brows relaxed and even, neither raised on one side nor furrowed", lips: "lips softly closed or only just parted" },
    exprTailSkip: { wink: ['eyes'], sensual: ['eyes'], curious: ['brows'], into_prop: ['eyes'] },
    signatureProp: "{hold}",   /* 일상컷에서 손에 드는 그 장수의 물건 */
    glasses: "; she wears thin-framed glasses"
  };
  /* 일상컷 고정값 — pkm·game 과 같다(IMAGE_RULES 일상컷 고정값). 생성기가 이 값으로 고르고 잠근다; 조립기도 빈 값이면 이 값으로 */
  var CASUAL_FIXED = { axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' };
  var ASPECT_OPTIONS = ['2:3', '3:2', '1:1', '9:16', '16:9'];
  /* 화면비 → FRAME 줄. 그림 저장소의 크기는 2:3 이 1024×1536 */
  var ASPECT_FRAME = { '2:3': 'a vertical 2:3 (1024×1536)', '3:2': 'a horizontal 3:2 (1536×1024)', '1:1': 'a square 1:1 (1024×1024)',
    '9:16': 'a tall vertical 9:16', '16:9': 'a wide horizontal 16:9' };
  /* CROP 줄의 아래 가장자리 — 「이 크롭이 이긴다」 만으로는 넓게 나왔다. 어디서 잘리는지를 말한다 */
  var CROP_EDGE = {
    waist_up: 'a waist-up shot — the bottom edge crosses her waist; hips, legs and feet are out of frame',
    chest_up: 'a chest-up shot — the bottom edge crosses just below her bust; waist, hips and legs are out of frame',
    face_close: 'a close-up — her face and hair fill most of the frame and the bottom edge crosses at her collarbones; nothing below the shoulders shows, and her hands and anything she holds stay below the frame unless raised to her face',
    detail: 'a detail shot — only the part of her the scene names fills the frame'
  };
  var CLOSE_FRAMES = Object.keys(CROP_EDGE);
  /* 추가 연출·장면 글에 이 말이 보이면 「손·소품은 칸에서 고르세요」 경고(막지는 않는다) */
  var CASUAL_HAND_WORDS = /\b(hold|holds|holding|hand|hands|grip|grips|cup|glass|phone|book|camera)\b|손|쥐|든다|들고|잔을/i;
  /* 가까운 컷의 노출 풀이 — 「배·다리 노출」 이 크롭 밖을 부른다. 노출은 CROP 안에서만, 컷은 움직이지 않는다 */
  var CLOSE_AXIS_GUIDES = { skin_exposure: {
    moderate: 'some exposed shoulders or arms inside the crop, with intimate areas covered',
    bold: 'inside the crop, the chosen outfit is worn in its most revealing version — a deep neckline with natural cleavage, bare shoulders and collarbones, skin clearly showing; the crop stays exactly where CROP sets it and never moves down to show more; intimate areas covered' } };   /* 2026-11-08 「일상컷에도 손 봐줘」 — 「어깨 · 쇄골 조금 더」 로는 니트 · 셔츠가 그대로 덮었다 */
  /* 렌즈 — 버전2 는 프레이밍에 따라 자동(표 lens). [ko, en] */
  var LENS_GUIDES = {
    wide24: ['24mm 광각: 주변 장소와 앞뒤 거리감이 넓게 드러나요. 가까운 손발이나 얼굴이 과장되지 않도록 억제해요.',
      '24mm-equivalent wide-angle impression with spacious environmental depth; use enough camera distance to avoid stretching the face or limbs.'],
    documentary35: ['35mm 준광각: 인물과 주변 상황을 균형 있게 담는 생활 스냅 느낌이에요.',
      '35mm-equivalent environmental perspective balancing the woman and the setting with moderate depth.'],
    natural50: ['50mm 표준: 앞뒤 거리감을 과하게 벌리거나 압축하지 않는 무난한 표현이에요.',
      '50mm-equivalent natural perspective with balanced proportions and modest depth compression.'],
    portrait85: ['85mm 준망원: 배경이 조금 가까워 보이고 얼굴과 몸의 원근감이 차분해져요.',
      '85mm-equivalent short-telephoto perspective from a suitable distance, with gentle background compression.'],
    telephoto135: ['135mm 망원: 앞뒤 공간이 압축되고 배경 요소가 겹쳐 보여요.',
      '135mm-equivalent telephoto perspective from farther away, with compressed background depth and unchanged anatomy.']
  };
  /* 일상컷 두 축 — 장부(IMAGE_RULES)가 보는 축. 값·풀이는 pkm·book·game 과 열쇠가 같다 */
  var LOCAL_AXES = ['overall_intensity', 'skin_exposure'];
  var ADVANCED_OPTIONS = {
    overall_intensity: ['AUTO', 'restrained', 'sensual', 'bold', 'strong'],
    skin_exposure: ['AUTO', 'low', 'moderate', 'bold']
  };
  var ADVANCED_LABELS = { overall_intensity: ['Overall Intensity', '전체 강도'], skin_exposure: ['Skin Exposure', '피부 노출 정도'] };
  var ADV_AXIS = { overall_intensity: '이 장면의 스타일링과 분위기를 얼마나 강하게 표현할지 정해요.', skin_exposure: '중요 부위를 제외한 부위의 노출 정도.' };
  var ADV_VAL = {
    overall_intensity: { restrained: '절제', sensual: '자연스럽게 관능적', bold: '과감', strong: '가장 강함' },
    skin_exposure: { low: '적게', moderate: '보통', bold: '많이' }
  };
  var SCENE_AXIS_GUIDES = {
    overall_intensity: {
      restrained: ['의상과 태도를 차분하게 절제해요. 노출량은 별도 선택이에요.', 'understated styling and restrained demeanor; exposure is separate'],
      sensual: ['부드러운 옷의 흐름과 여유 있는 몸짓으로 관능미를 표현해요.', 'sensual fabric drape and relaxed expressive posture; no automatic extra exposure'],
      bold: ['대담한 의상선과 자신감 있는 태도로 강도를 높여요.', 'bold outfit lines and confident demeanor; honor chosen coverage'],
      strong: ['선택한 장면 안에서 의상·태도의 존재감을 가장 강하게 해요.', 'maximal styling presence within the scene; retain chosen exposure and anatomy']
    },
    skin_exposure: {
      low: ['목·손 정도의 제한된 노출이에요. 직접 지정한 의상이 우선해요.', 'mostly covered clothing, limited neck/hand exposure unless outfit is explicit'],
      moderate: ['팔이나 종아리 등 일부 부위를 드러내요. 중요 부위는 가려요.', 'some exposed arms or lower legs, with intimate areas covered'],
      bold: ['고른 옷을 가장 과감하게 입어요 — 깊은 목선 · 맨 어깨 · 짧거나 등이 트인 재단 · 짧은 단이나 높은 트임. 중요 부위는 가려요.', 'the chosen outfit worn in its most revealing version — a deep neckline with natural cleavage, bare shoulders, a cropped or open-back cut, a short hem or high slit showing the thighs, as far as the outfit allows, skin clearly showing; nothing slipped off; intimate areas covered']
    }
  };
  /* 표정 — 열쇠는 pkm·book·game 과 같다. 버전2 는 트리 표 expressions(시선 말 없는 문장)가 있으면 그것, 없으면 여기 문장에서 시선 말을 뗀 것 */
  var EXPRESSION_OPTIONS = [
    ['', 'AUTO — 자동'], ['calm', 'calm — 차분함'], ['focused', 'focused — 집중'], ['soft_smile', 'soft smile — 옅은 미소'], ['half_smile', 'half-smile — 은은한 미소'],
    ['playful', 'playful — 장난기'], ['confident', 'confident — 자신감'], ['sensual', 'sensual — 자연스러운 섹시'], ['provocative', 'provocative — 도발적이되 비노출'],
    ['sleepy', 'sleepy — 졸린 느낌'], ['candid', 'candid — 생활감'], ['mildly_annoyed', 'mildly annoyed — 약간 짜증'], ['surprised', 'surprised — 놀람'],
    ['curious', 'curious — 호기심'], ['serious', 'serious — 진지함'], ['amused', 'amused — 재미있어하는'], ['bored', 'bored — 심드렁함'], ['pensive', 'pensive — 생각에 잠긴'],
    ['smug', 'smug — 우쭐한'], ['gentle', 'gentle — 온화함'], ['determined', 'determined — 결의에 찬'], ['exhausted', 'exhausted — 지친'], ['nostalgic', 'nostalgic — 아련한'],
    ['unimpressed', 'unimpressed — 시큰둥함'], ['flustered', 'flustered — 당황한'], ['proud', 'proud — 자랑스러운'], ['wistful', 'wistful — 그리운 듯한'],
    ['mischievous', 'mischievous — 짓궂은'], ['relieved', 'relieved — 안도한'], ['cold_smile', 'cold smile — 차가운 미소'], ['laughing', 'laughing — 소리내어 웃는 · 눈 감김'],
    ['laughing_open', 'laughing, eyes open — 소리내어 웃는 · 눈 뜬 채'], ['wink', 'wink — 윙크']
  ];
  /* 표정 — 단서 두셋, 근육 하나하나를 적지 않는다(사용자 2026-11-03 「표정 관련 문구가 과하게」 — 이를 악문 턱 · 웃는 입에 무표정한 눈 · 질끈 감은 눈 같은 문구가
     첫인상(FACE)과 부딪히고 얼굴을 굳혔다). 세계 그림과 일상컷(표에 없을 때) 둘 다 이것을 쓴다 */
  var EXPRESSION_DETAIL = {
    calm: 'a relaxed, unforced face, lips gently closed',
    focused: 'attentive, steady eyes, mouth closed',
    soft_smile: 'a faint soft smile, relaxed eyes',
    half_smile: 'a slight smile, lips closed',
    playful: 'a light teasing smile, bright eyes',
    confident: 'a composed, self-assured look',
    sensual: 'softly lidded eyes, lips relaxed',
    provocative: 'a cool, knowing look',
    sleepy: 'softly drowsy eyes, relaxed mouth',
    candid: 'a natural, unposed in-between expression',
    mildly_annoyed: 'a faint pout, brows slightly drawn',
    surprised: 'lightly raised brows, lips slightly parted',
    curious: 'one brow slightly raised, attentive eyes',
    serious: 'a level, steady look, mouth closed',
    amused: 'a small closed-lip smile that reaches the eyes',
    bored: 'an idle, unbothered look',
    pensive: 'a quiet, thoughtful look, lips lightly closed',
    smug: 'a faint knowing smile',
    gentle: 'a warm, gentle look with a faint smile',
    determined: 'a firm, resolute look with calm, steady eyes',
    exhausted: 'tired but soft eyes, a relaxed face',
    nostalgic: 'a soft faraway look with a faint wistful smile',
    unimpressed: 'a cool, unimpressed look',
    flustered: 'a slightly flustered look with a light blush',
    proud: 'a proud, poised look with a faint closed-lip smile',
    wistful: 'a faint wistful smile, soft eyes',
    mischievous: 'a small sly smile, bright eyes',
    relieved: 'a relaxed, relieved look',
    cold_smile: 'a faint cool smile, calm composed eyes',
    laughing: 'a natural laugh, eyes crinkled, mouth open in a smile',
    laughing_open: 'a bright open laugh, eyes open and engaged',
    wink: 'a playful wink with a small smile'
  };

  /* 얼굴 설계 — 설계한 얼굴형 · 이목구비가 있어도 얼굴 느낌이 비슷하게 나왔다(사용자 2026-11-01 「얼굴형이나 이목구비를 설계로 나눠놔도 얼굴 느낌이 비슷하게 나오는것 같아」).
     판타지 열여섯 장의 얼굴을 모아 보니 큰 눈 · 갸름한 턱 · 흰 피부 · 같은 옅은 미소 — 다른 것은 머리뿐. 까닭: 모두에게 같은 AGE 줄(「soft full cheeks · soft smile」), 화풍 줄의
     「controlled anime facial design」, 전신 2:3 에서 코 · 입 차이는 안 보인다. 그래서 전신에서도 읽히는 칸을 더한다 — 나이감 · 인상 · 피부 톤 · 눈 크기 · 눈꼬리 · 표식(점 · 주근깨 · 화장) ·
     기본 표정(EXPRESSION_DETAIL 열쇠), 세계마다 앞머리. 설계표 look 에 인상(impression)이 있는 카드만 이 줄로 쓴다(시험 셋 → 사용자 확인 뒤 나머지) */
  var FACE_DESIGN = {
    /* 얼굴 윤곽 — 2026-11-03 사용자 「손책 … 일상컷 얼굴이 길고 각지고 못생기게」: 얼굴형 말이 턱 · 광대를 밀면 GPT 가 길고 각진 얼굴로 키웠다.
       같은 날 법정(무협이 길고 못생기게, 메카는 예쁘게) — 「작고 부드러운 턱」 이 있던 메카만 가벼웠다. 그래서 모두에게 작은 턱, 나이 줄의 「뚜렷한 광대」 도 뺐다 */
    head: "FACE — she must read as her own person at a glance, NOT the style's default pretty face and not a sister of the other characters: {items}. Whatever the face shape, keep soft, feminine, attractive contours with a small, soft chin — never elongated, horse-like, mannish or heavy-jawed. Face proportions: a short, compact midface — the eyes sit at about the vertical middle of the head and the eyes-to-mouth distance is short; the face is only slightly longer than it is wide (about 1.3 : 1 from hairline to chin), with a small, softly rounded chin. Long bangs, side locks or a tall headpiece frame the face but never make it look longer.",   /* 비율 — 2026-11-03 진궁 「얼굴이 길게 … 중안부와 얼굴 전체의 세로비를 고정하는게 없다」 */
    age: {
      early_20s: 'AGE: about twenty — a fresh young-adult face; no facial lines.',
      mid_20s: 'AGE: mid-twenties — a clear adult face; no facial lines.',
      late_20s: 'AGE: late twenties — a graceful grown-up face with soft, smooth contours; no wrinkles, folds or under-eye bags.',
      early_30s: 'AGE: early thirties — a poised, graceful face with soft contours; at most faint lines, no deep folds or under-eye bags.',
      /* 미시 — 노장 · 원로(2026-11-03 사용자 「나이대가 있어도 섹시한」). 나이는 눈빛 · 자세 · 무게로, 얼굴은 늙지 않게 */
      late_30s: 'AGE: late thirties — a glamorous, alluring mature beauty in her prime: confident, sensual poise, a knowing gaze and a ripe, womanly figure; smooth, radiant skin with at most the faintest lines at the eye corners; never old, tired, gaunt or matronly — still the small, soft chin and soft contours.'
    },
    impression: {
      elegant: 'an elegant, refined presence', cool: 'a cool, aloof beauty', sharp: 'a sharp, striking, intense look', mature: 'a mature, poised woman',
      soft: 'a soft, gentle warmth', glamorous: 'a glamorous, sultry allure', rugged: 'a rugged, tough, outdoorsy look', stoic: 'a stoic, unreadable reserve',
      boyish: 'a boyish, mischievous tomboy energy', regal: 'a regal, imperious haughtiness', cute: 'a cute, bright-eyed sweetness', cheerful: 'a cheerful, sunny openness',
      languid: 'a languid, sleepy-eyed ease', fierce: 'a fierce, wild ferocity', melancholic: 'a quiet melancholy', androgynous: 'a striking androgynous handsomeness', innocent: 'a clear, innocent purity'
    },
    skin_tone: { porcelain: 'porcelain-pale skin', fair: 'fair skin', warm_beige: 'warm beige skin', olive: 'olive skin', golden_tan: 'golden tan skin', bronze: 'bronze-brown skin', deep_brown: 'deep brown skin' },
    eye_size: { small: 'smaller, narrower eyes than usual anime proportion', medium: 'moderately sized, realistically proportioned eyes', large: 'large eyes' },
    eye_tilt: { up: 'outer eye corners tilting sharply upward', level: 'level outer eye corners', down: 'outer eye corners drooping downward' },
    mark: {
      freckles: 'a dusting of freckles across nose and cheeks', mole_eye: 'a small beauty mark under one eye', mole_lip: 'a small beauty mark beside the lips',
      winged_liner: 'sharp winged eyeliner', smoky: 'smoky dark eye makeup', red_lip: 'bold red lipstick', dark_lip: 'dark berry lipstick', gloss: 'glossy nude lips',
      blush: 'rosy flushed cheeks', bare: 'a bare, makeup-free face', scar: 'a thin faint scar through one eyebrow'
    },
    bangs: {
      none: 'no bangs, forehead bare', straight: 'blunt straight bangs', side_swept: 'side-swept bangs', curtain: 'curtain bangs', one_eye: 'long bangs falling over one eye',
      parted: 'center-parted bangs framing the face', choppy: 'choppy uneven bangs', wispy: 'wispy see-through bangs', baby: 'short baby bangs', side_locks: 'no bangs, long face-framing side locks', asymmetric: 'asymmetric bangs', swept_back: 'hair swept back off the forehead'
    },
    /* 설계 칸 → 생성기 외형 칸(직접 고르면 설계 값이 빠진다) */
    param: { impression: 'facial character', skin_tone: 'skin tone', eye_size: 'eye size', eye_tilt: 'eye tilt', bangs: 'bangs', age: 'apparent age' }
  };

  root.AtelierSpec = {
    FACE_DESIGN: FACE_DESIGN,
    WORLDS: WORLDS, CONCEPT: CONCEPT, TRAITS_HEAD: TRAITS_HEAD, STAT_TRAITS: STAT_TRAITS, FACTION_HEAD: FACTION_HEAD, SIGNATURE: SIGNATURE, CHARS: CHARS, TEXT_RULE: TEXT_RULE, MECHA_FACTION: MECHA_FACTION,
    OUTPUT: OUTPUT, POSE_DEFAULT: POSE_DEFAULT, WORLD_POSES: WORLD_POSES, MECHA_SILHOUETTES: MECHA_SILHOUETTES, SILHOUETTES: { samguk: SAMGUK_SILHOUETTES, fantasy: FANTASY_SILHOUETTES, mecha: MECHA_SILHOUETTES }, SILHOUETTE_HEAD: SILHOUETTE_HEAD, STRUCT: STRUCT, MECHA_SILHOUETTE_HEAD: MECHA_SILHOUETTE_HEAD, WORLD_TIMES: WORLD_TIMES, SCENE_HEAD: SCENE_HEAD, EXPR_HEAD: EXPR_HEAD, EXPR_TAIL: EXPR_TAIL, BODY_LINE: BODY_LINE, RULES: RULES, NOTES: NOTES, FILES: FILES,
    CASUAL: CASUAL, CASUAL_FIXED: CASUAL_FIXED, ASPECT_OPTIONS: ASPECT_OPTIONS, ASPECT_FRAME: ASPECT_FRAME, CROP_EDGE: CROP_EDGE, CLOSE_FRAMES: CLOSE_FRAMES,
    CASUAL_HAND_WORDS: CASUAL_HAND_WORDS, CLOSE_AXIS_GUIDES: CLOSE_AXIS_GUIDES, LENS_GUIDES: LENS_GUIDES,
    LOCAL_AXES: LOCAL_AXES, ADVANCED_OPTIONS: ADVANCED_OPTIONS, ADVANCED_LABELS: ADVANCED_LABELS, ADV_AXIS: ADV_AXIS, ADV_VAL: ADV_VAL, SCENE_AXIS_GUIDES: SCENE_AXIS_GUIDES,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS, EXPRESSION_DETAIL: EXPRESSION_DETAIL
  };
})(typeof window !== 'undefined' ? window : globalThis);
