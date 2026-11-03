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
      exposureBold: 'EXPOSURE (bold): her robes open to show skin — the cross collar opened into a deep neckline with natural cleavage, bare shoulders and arms where the outer robe is cut away by design, a high slit in the skirt panels showing the thigh; armor pieces stay on and symmetrical. Nothing slipped off. Chest and pelvis covered; keep the costume WORLD describes, material and palette.' },
    { key: 'fantasy', ko: '중세 판타지', en: 'MEDIEVAL FANTASY',
      head: 'WORLD — MEDIEVAL FANTASY: ',
      tail: 'COSTUME (medieval fantasy): {costume}. Western medieval high-fantasy dress — plate, mail and heraldic tabards, gowns and mantles, circlets and crowns; steel, leather, wool, velvet and gold, subtle magical glow along the patterns. Her Three Kingdoms origin shows only through her signature item, her colours and her bearing — her outfit is Western: no wrap-collar robes, no wide hanfu sleeves, no flowing Chinese-style robe over armor, no East-Asian armor, no machinery, no modern material. The setting is Western European medieval — stone castles, Romanesque or Gothic architecture, European mountains, forests and towns; no Chinese architecture, no pagodas or curved tiled roofs, no hanzi on banners. LIGHT: natural daylight or the world\'s own magical glow, unless TIME & WEATHER says otherwise.',
      exposureBold: 'EXPOSURE (bold): her regalia opens to show skin — bare shoulders and arms between pauldron and bracer, a deep open neckline under the gorget with natural cleavage, a high slit in the tabard or gown showing the thigh; armor pieces stay on and symmetrical. Nothing slipped off. Chest and pelvis covered; no corset; keep the costume WORLD describes, material and palette.' },
    { key: 'mecha', ko: '메카', en: 'MECHA',
      head: 'WORLD — MECHA: ',
      tail: 'MECHA DESIGN: she is a female mecha personification, built as {costume}; plates, joints, binders and glow lines carry her faction palette and the traits above; the plates must read as solid armor with visible joints, not as cloth or a gown; her signature item is rebuilt as part of the frame or as a mecha armament. She is clad in mecha plating from neck to feet — no cloth robe, gown, skirt or long fabric over the plates; any cape is rigid armored binder plates. Her face and hair stay human. The setting is far-future science fiction — space stations, starships, planets, nebulae and high-tech structures; no traditional East-Asian architecture, no pagodas, tiled roofs or stone lanterns. ' }
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
  var SIGNATURE = 'SIGNATURE ITEM: {hold} — she holds or carries it, drawn at full scale, in the form this WORLD gives it. It is one whole object drawn once: a long weapon (spear, glaive, halberd, staff, bow) keeps a single straight, unbroken shaft from butt to head with exactly one head or blade, held in front of or beside her body — never passing behind her head or shoulders, never broken, bent, split in two by her body or arm, or duplicated; if the frame cuts it, it leaves the frame as one straight line.';

  /* 출력 — 세로 2:3 카드 한 장 */
  var OUTPUT = 'OUTPUT: one character image that works as card art. Vertical 2:3 frame, full body with head and feet inside the frame with clear margins, face turned toward the camera (front or three-quarter). {pose} the environment may be rich while her design stays fully readable.';
  /* 세계 그림의 자세 — 비우면 카드 자세. 셋을 나란히 견주는 자리라 프레이밍·카메라는 그대로(전신·정면 또는 3/4) */
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
    /* 팔레트·시각 언어는 장신구 힌트로만. 피부·머리·눈은 첨부 그림의 그 사람 */
    design: "DESIGN (accessory hints only): her legend — {traits} — may inform at most one small accessory, a hair ornament or an object beside her, in its palette ({palette}). The clothes keep the chosen outfit's own colours; her skin, hair and eyes stay as in the attached image.",
    /* 2026-11-01 — 「soft full cheeks · soft smile」 을 뺐다(얼굴을 하나로 만들었다). 얼굴 · 나이는 첨부 그림의 그 사람, 표정은 SCENE 의 것 */
    age: "AGE: the same adult woman as in the attached image — keep her own face shape, cheekbones, eye proportions and skin tone exactly; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases).",
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
    moderate: 'some exposed shoulders or arms inside the crop, with the chest covered',
    bold: 'more bare shoulder and collarbone inside the crop; the crop stays exactly where CROP sets it and never moves down to show more; cover the chest' } };
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
  var ADV_AXIS = { overall_intensity: '이 장면의 스타일링과 분위기를 얼마나 강하게 표현할지 정해요.', skin_exposure: '가슴·골반을 제외한 부위의 노출 정도.' };
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
      moderate: ['팔이나 종아리 등 일부 부위를 드러내요. 가슴·골반은 가려요.', 'some exposed arms or lower legs, with chest and pelvis covered'],
      bold: ['어깨·등·복부·다리에서 장면에 맞는 부위를 더 드러내요. 가슴·골반은 가려요.', 'more scene-appropriate shoulder, back, midriff or leg exposure; cover chest and pelvis']
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
    head: "FACE — she must read as her own person at a glance, NOT the style's default pretty face and not a sister of the other characters: {items}.",
    age: {
      early_20s: 'AGE: about twenty — a fresh young-adult face; no facial lines.',
      mid_20s: 'AGE: mid-twenties — a clear adult face; no facial lines.',
      late_20s: 'AGE: late twenties — a settled, mature adult face with defined cheekbones; no wrinkles, folds or under-eye bags.',
      early_30s: 'AGE: early thirties — a poised, mature face with defined cheekbones and jaw; at most faint lines, no deep folds or under-eye bags.'
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
    OUTPUT: OUTPUT, POSE_DEFAULT: POSE_DEFAULT, WORLD_POSES: WORLD_POSES, WORLD_TIMES: WORLD_TIMES, SCENE_HEAD: SCENE_HEAD, EXPR_HEAD: EXPR_HEAD, EXPR_TAIL: EXPR_TAIL, BODY_LINE: BODY_LINE, RULES: RULES, NOTES: NOTES, FILES: FILES,
    CASUAL: CASUAL, CASUAL_FIXED: CASUAL_FIXED, ASPECT_OPTIONS: ASPECT_OPTIONS, ASPECT_FRAME: ASPECT_FRAME, CROP_EDGE: CROP_EDGE, CLOSE_FRAMES: CLOSE_FRAMES,
    CASUAL_HAND_WORDS: CASUAL_HAND_WORDS, CLOSE_AXIS_GUIDES: CLOSE_AXIS_GUIDES, LENS_GUIDES: LENS_GUIDES,
    LOCAL_AXES: LOCAL_AXES, ADVANCED_OPTIONS: ADVANCED_OPTIONS, ADVANCED_LABELS: ADVANCED_LABELS, ADV_AXIS: ADV_AXIS, ADV_VAL: ADV_VAL, SCENE_AXIS_GUIDES: SCENE_AXIS_GUIDES,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS, EXPRESSION_DETAIL: EXPRESSION_DETAIL
  };
})(typeof window !== 'undefined' ? window : globalThis);
