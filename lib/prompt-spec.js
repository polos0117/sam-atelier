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
      exposureBold: 'EXPOSURE (bold): her robes open to show skin — the cross collar opened into a deep neckline with natural cleavage, bare shoulders and arms where the outer robe is cut away by design, the skirt panels cut with a high side slit at full length — it shows the side line of one leg as she stands, no leg pushed out or knee bent for it; armor pieces stay on and symmetrical. Nothing slipped off. Intimate areas covered; keep the costume material and palette.' },
    { key: 'fantasy', ko: '중세 판타지', en: 'MEDIEVAL FANTASY',
      /* 그 장수의 물건을 그 세계 것으로(사용자 2026-11-08 「무기 이미지가 판타지랑 메카에서 좀 더 그쪽 세계 느낌이 났으면」) — SIGNATURE 줄 · kv 판 「Her signature item — … —」 에 붙는다. 삼국시대는 없음(본디 그 세계 것) */
      sigForm: 'reimagined as a Western high-fantasy version of the same kind of object with the same silhouette: polished steel and silvered mithril throughout, the shaft or hilt also forged metal with engraved runes (never plain wood), a faint magical glow running along the edge and the runes, a gem-set guard or socket, a leather-wrapped grip and heraldic or elven ornament, with any animal motif re-sculpted in Western heraldic style and no Chinese fittings, silk tassels or hanzi',
      head: 'WORLD — MEDIEVAL FANTASY: ',
      tail: 'COSTUME (medieval fantasy): {costume}. Western medieval high-fantasy dress — plate, mail and heraldic tabards, gowns and mantles, circlets and crowns; steel, leather, wool, velvet and gold, subtle magical glow along the patterns. Her Three Kingdoms origin shows only through her signature item, her colours and her bearing — her outfit is Western: no wrap-collar robes, no wide hanfu sleeves, no flowing Chinese-style robe over armor, no East-Asian armor, no machinery, no modern material. The setting is Western European medieval — stone castles, Romanesque or Gothic architecture, European mountains, forests and towns; no Chinese architecture, no pagodas or curved tiled roofs, no hanzi on banners. LIGHT: natural daylight or the world\'s own magical glow, unless TIME & WEATHER says otherwise.',
      exposureBold: 'EXPOSURE (bold): her regalia opens to show skin — bare upper arms below the pauldrons, which stay seated on top of her shoulders (bare shoulders only where no shoulder guard sits), a deep open neckline under the gorget with natural cleavage, the tabard or gown cut with a high side slit at full length — it shows the side line of one leg as she stands, no leg pushed out or knee bent for it; armor pieces stay on and symmetrical. Nothing slipped off. Intimate areas covered; no corset; keep the costume material and palette.' },
    { key: 'mecha', ko: '메카', en: 'MECHA',
      sigForm: 'rebuilt as a far-future high-tech version of the same kind of object with the same silhouette: hard-surface alloy plates with panel lines, mechanical joints, vents and emitter nodes, an energy edge, plasma blade or glowing core in her glow-line colour and small status lights, with any animal motif re-sculpted as sleek machined armour and no wood, silk tassels or forged-bronze fittings',
      head: 'WORLD — MECHA: ',
      tail: 'MECHA DESIGN: she is a female mecha personification, built as {costume}; plates, joints, binders and glow lines carry her faction palette and the traits above; the plates must read as solid armor with visible joints, not as cloth or a gown; her signature item is rebuilt as part of the frame or as a mecha armament. Mecha plating covers her frame except where EXPOSURE opens it — no cloth robe, gown, skirt or long fabric over the plates; any cape is rigid armored binder plates. Her face and hair stay human. The setting is far-future science fiction — space stations, starships, planets, nebulae and high-tech structures; no traditional East-Asian architecture, no pagodas, tiled roofs or stone lanterns. ',
      /* 메카 전용 과감 노출(사용자 2026-11-08 「요즘에는 의상 노출을 명시해놔도 잘 안먹는 느낌이야」 — 메카는 공용 문장 「겉옷은 양어깨에 · 안쪽 옷 사이로」 에 「목부터 발끝까지 장갑」 이 겹쳐 가슴 창 하나만 남았다). 설계로 열린 장갑 */
      /* 2026-11-08 「세계컷 메카는 한번에 너무 많이 연거 같으니, 랜덤적으로 몇 군데만 여느식으로」 — 네 곳(어깨 · 위팔 / 가슴 창 / 허리 / 허벅지) 가운데 장수 · 세계마다 두 곳만(열쇠 해시 — 다시 그려도 같은 설계).
         exposureOpen 이 있으면 exposureLine 이 그 두 곳으로 exposureOpenTpl 을 채운다. exposureBold 는 장수를 모를 때(가슴 창 · 어깨) */
      /* 2026-11-13 사용자 「다리가 자연스럽지 않고, 무릎에서 꺾이는 그림들이 많이 … 어깨 장갑이 어깨에 안있고 어깨 바로 밑에다가」 — 「허벅지를 보여라」 가 바닥까지 오는 실루엣 · 전신 구도와 겹쳐 한쪽 다리를 트임 밖으로 내밀며 무릎을 꺾었고,
         「어깨 장갑과 손 장갑 사이의 맨 어깨」 가 어깨 장갑을 위팔로 내렸다. 삼국시대 · 판타지 트임은 재단만(옆 트임 · 길이 그대로 · 다리는 자세 줄이 정한다), 어깨는 「장갑은 어깨 위에 그대로, 그 아래 위팔이 맨살」. 메카 열쇠 shoulders 는 그대로(해시로 두 곳 고르기) */
      exposureOpen: [
        { key: 'shoulders', en: 'bare upper arms below the pauldrons, which stay seated on top of her shoulders' },
        { key: 'chest', en: 'a deep open chest window with natural cleavage framed by the chest plates' },
        { key: 'midriff', en: 'a bare waist and midriff between the bust plate and the hip armor' },
        { key: 'thighs', en: 'bare upper thighs between the hip armor and thigh-high leg plates' }
      ],
      exposureOpenN: 2,
      exposureOpenTpl: 'EXPOSURE (bold): her mecha frame is cut open by design in only these places — {open}; everywhere else she stays fully plated. The plates stay on, fitted and symmetrical, with skin clearly showing in each opening. Nothing slipped off. Intimate areas covered; keep the plate material and palette.',
      exposureBold: 'EXPOSURE (bold): her mecha frame is cut open by design in only these places — bare upper arms below the pauldrons, which stay seated on top of her shoulders, and a deep open chest window with natural cleavage framed by the chest plates; everywhere else she stays fully plated. The plates stay on, fitted and symmetrical, with skin clearly showing in each opening. Nothing slipped off. Intimate areas covered; keep the plate material and palette.' }
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
  /* 역할 → 세계 → 어울리는 실루엣 묶음 — 장수마다 실루엣 나누기(tools/sil-spread.py 가 여기서 읽는다)와 GPT 임의 설계 주문의 의상 목록이 같은 묶음을 쓴다
     (사용자 2026-11-09 「묶음 안에서 고르게하자」). 모든 갈래가 적어도 한 역할에 들어 있어야 한다(sil-spread 검사). 한 줄 한 세계로 둔다 — 파이썬이 읽는다 */
  var SIL_POOLS = {
    general: {
      samguk: ['heavy_general', 'cavalry', 'cape_general', 'layered_skirt', 'fur_mantle', 'wanderer', 'archer', 'shadow_garb', 'light_dancer'],
      fantasy: ['full_plate', 'ranger', 'gown_armor', 'paladin_cape', 'dark_spiked', 'wild_warrior', 'dragon_scale', 'winged', 'elven_leaf'],
      mecha: ['heavy_assault', 'power_limbs', 'knight_plate', 'light_agile', 'full_armor', 'slim_suit', 'skirt_plate', 'tail_unit', 'segmented_parts', 'cape_plates']
    },
    strategist: {
      samguk: ['scholar_robe', 'celestial_shawl', 'water_sleeves', 'wanderer', 'light_dancer'],
      fantasy: ['mage_robe', 'battle_mage', 'elven_leaf', 'priestess', 'noble_coat'],
      mecha: ['float_units', 'wing_binder', 'halo_crown', 'hover_rings', 'frame_exposed', 'slim_suit', 'long_coat_plate']
    },
    official: {
      samguk: ['scholar_robe', 'court_regalia', 'celestial_shawl', 'water_sleeves', 'phoenix_crown', 'light_dancer', 'shadow_garb', 'archer'],
      fantasy: ['noble_coat', 'priestess', 'mage_robe', 'elven_leaf', 'gown_armor', 'ranger', 'battle_mage'],
      mecha: ['sub_arms', 'big_backpack', 'float_units', 'long_coat_plate', 'frame_exposed', 'segmented_parts', 'hover_rings']
    },
    lord: {
      samguk: ['court_regalia', 'phoenix_crown', 'cape_general', 'heavy_general', 'layered_skirt'],
      fantasy: ['crown_regalia', 'paladin_cape', 'gown_armor', 'dragon_scale', 'winged', 'noble_coat', 'dark_spiked'],
      mecha: ['halo_crown', 'cape_plates', 'wing_binder', 'knight_plate', 'long_coat_plate', 'full_armor', 'skirt_plate']
    }
  };
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

  /* 짧은 세계 그림(2026-11-08) — lib/prompt-sam.js buildWorldShort */
  /* GPT 임의 설계 세계 그림(사용자 2026-11-09 「gpt에서 삼국지에 세계컷 생성할때, 생성 이미지 총4장으로 고정하고, 2장은 우리쪽 설계, 2장은 gpt 임의 설계로」).
     우리 설계(<세계>-prompt.txt) 두 장 + 이 설계 주문(<세계>-free.txt) 두 장. 정해 두는 것은 누구인지 · 전설(영감으로만) · 세계 · 화풍 · 크기 · 노출 · 얼굴 비율 · 구도 · 끝 줄뿐,
     얼굴 · 머리 · 옷 · 실루엣 · 색 · 무기 꼴 · 자세 · 장면은 GPT 가 정한다. GPT 는 이 주문으로 제 지시문을 쓰고, 넘긴 지시문 글을 기록에 남긴다 */
  var WORLD_FREE = {
    head: "Design brief — your own take on this character. A full-body vertical 2:3 (1024×1536) character card image of {name_en} from the Romance of the Three Kingdoms, reimagined as an adult woman — {title}. Age: {age}. She is a woman — no beard, moustache or facial hair.",
    /* 2026-11-09 사용자 「세계컷 의상과 무기는 우리가 만든 의상들 안에서 선택하게 하자. 의상과 무기만이고, 그 외의 얼굴이나 헤어색, 스타일은 자유롭게」 */
    free: "You design her yourself: invent her face, eye colour, hairstyle, makeup, expression, pose and setting as a fresh, original take — do not follow any earlier design of this character. Her hair colour, skin tone and weapon are NOT free: take them from our designs below. Her costume follows Design A and Design B below.",
    /* 2026-11-09 사용자 「gpt에 세계컷 맡길때는 머리색까진 고정하는게 좋을거 같네. 마음에 안들면 설계를 바꾸는게 날 거 같아」 — 머리색은 우리 설계값, 헤어스타일만 자유 */
    hair: "Hair colour (fixed — ours): {hair}. Keep exactly this hair colour; only the hairstyle is yours.",
    /* 같은 날 감녕 「gpt도 피부색은 설계값 따르도록 바꿔줘」 — 피부색도 우리 설계값 */
    skin: "Skin tone (fixed — ours): {skin}. Keep exactly this skin tone.",
    /* 같은 날 「저 깃털처럼 겹친 갑편 치마 느낌처럼 본인만의 생각을 담으면」 → 「응 좋은 아이디어야」 — 우리 실루엣 + 전설에서 딴 비틀기 하나를 의상 구조에 */
    /* 2026-11-18 사용자 「응 허용하고 이순서대로 진행해줘」(세계컷 GPT 설계안 — A안: 지정 실루엣 + 소재 · 상징을 의상 구조로) — 첫 설계(-gpt1). 특징 하나를 겹침 · 단면 · 절개 · 여밈 · 장갑판 배열에, 전신에서 먼저 읽히는 윤곽을 적는다 */
    costume: "Costume — Design A, your first design (choose one of ours, then add your own idea): pick ONE of these costume shapes from our set and keep its overall silhouette — {list}. Choose one visual feature of her legend or symbol and build it into the structure of the outfit itself — its layering, a cross-section, a cut-out, a fastening or the arrangement of plates — never a print or a loose accessory (e.g. plates or cloth layered like feathers, scales or petals, a hem or sleeve cut into a motif from her story). Build it in this world's materials and our colours below. In your prompt, say which outline reads first when she is seen full-body.",
    /* 우리 설계 두 장과 얼굴 · 머리 외곽을 다르게(설계안 4 · 5) — 우리 설계의 얼굴형 · 눈 · 눈썹 · 머리 */
    ours: "Our two designs of her (do not copy): {ours}. Give each of your designs a face impression and hair outline that differ from ours and from each other — decide first what still reads full-body: the jaw and cheekbone outline, the eye shape and brows, her base expression and the outer shape of her hair; small marks or jewellery only support.",
    check: "Before writing each final prompt, compare your designs with our two on face impression, hair outline and costume silhouette; if two would read alike with colour and background hidden, re-pick the overlapping item.",
    /* 3단계(2026-11-18) — 설계 요약 한 줄(기록 generation.summary — 다음 주문의 비슷한 등록작 찾기에) · 가장 비슷한 등록작(tools/design-near.cjs) */
    /* 몸 방향(2026-11-18 사용자 관은병 메카 「자세도 정면을 보는 자세로만 나오던데 … 우리는 약간 옆으로 튼 자세잖아」 → 「추천대로해줘」) — 우리 설계와 같은 몸 방향만 고정, 다리 · 손 · 몸짓은 맡은 쪽 */
    pose: "Pose (body direction fixed — ours): her body turned slightly, about three-quarters, while her face looks toward the viewer — never square-on to the camera; her stance, hands and gesture are yours.",
    /* 칸 채우기(2026-11-18 사용자 「세계컷은 gpt한테 너무 위임하면 안되겠다」 → 「크게는 우리거를 따르는데, 헤어스타일, 의상은 무조건 다르게. 나머지는 같아도되고, 달라도되고 …
       의상만 우리 실루엣 안에서만 고르게하고」 → 「응 이대로 진행해줘」). 우리 설계 지시문을 통째로 주고 표시한 칸만 채운다 — 나머지 줄은 글자 그대로(lib/prompt-sam.js worldFillErrors 가 본다) */
    /* 칸 채우기 검사 말(lib/prompt-sam.js — worldFillErrors 의 FM, 2026-11-18) */
    msg: {
      body_off: "체형이 우리 체형 목록의 글이 아니다(고친 글 · 목록 밖): ",
      hair_empty: "헤어스타일 칸을 안 채웠다",
      hair_same: "헤어스타일이 우리 설계와 같다(",
      idea_empty: "Design idea 줄을 안 채웠다",
      line_added: "없는 줄이 더해졌다: ",
      line_changed: "줄이 바뀌었다: ",
      line_head: "줄이 바뀌었다(앞머리): ",
      line_missing: "줄이 빠졌다: ",
      face_off: "얼굴 칸이 목록의 글이 아니다(우리 것 · 목록 밖 · 고친 글) — ",
      no_card: "장수가 없다",
      no_summary: "첫 줄이 SUMMARY: 가 아니다",
      outside_changed: "칸 밖 글이 바뀌었다: ",
      sil_off: "실루엣이 목록의 글이 아니다(우리 것 · 목록 밖 · 고친 글): ",
      slot_empty: " 칸을 안 채웠다",
      two_face: "두 설계의 얼굴 칸이 같다 — ",
      two_hair: "두 설계의 헤어스타일이 같다",
      two_sil: "두 설계의 실루엣이 같다"
    },
    fill: {
      head: "Design brief — fill-in design for {name_en}. Below is our own design prompt for this card. Write two designs of her (Design 1 and Design 2) by copying it and changing ONLY the marked parts; every other line stays exactly as written, character for character — the style, skin finish, light, colours, weapon, exposure, world, pose direction, composition and constraints are ours.",
      hair: "Must differ — hairstyle: write a new hairstyle in [HAIRSTYLE: …] (ours is {ours}); the hair colour stays ours.",
      sil: "Must differ — costume silhouette: in [COSTUME SILHOUETTE: …] paste exactly one of these shapes from our set, word for word (ours is not on this list): {list}.",
      idea: "Required — design idea: on the Design idea line, one visual feature of her legend or symbol built into the structure of the costume — its layering, a cross-section, a cut-out, a fastening or the arrangement of plates; never a print or a loose accessory. Inspiration only: {traits}.",
      body: "May keep or change — build: in [BUILD: …] paste one build from our set, word for word; ours is {ours}, which may be kept: {list}.",
      face: "Must differ — her face: in the Face line fill every marked part with exactly one entry from our lists below, word for word; ours is not on these lists. Design 1 and Design 2 must also differ from each other in every face part. {lists}.",
      free: "May keep or change — the Expression line; the Stance and hands and Setting detail lines may be filled or deleted.",
      two: "Design 1 and Design 2 must differ from each other in hairstyle, costume silhouette and every face part.",
      near: "Registered designs to keep apart from (hairstyle and costume): {near}.",
      out: "For each design write, first, one line — SUMMARY: hairstyle …; costume silhouette …; design idea …; face …; expression … — then the whole prompt with the marked parts filled. Do not add, drop or reword any other line. Save Design 1 as -gpt1 and Design 2 as -gpt2.",
      sep: "---- our design prompt (copy it, fill only the marked parts) ----"
    },
    summary: "Start each of your final prompts with one line — SUMMARY: face outline …; eyes and brows …; expression …; hair outline …; costume shape … — in plain words, then the prompt itself.",
    near: "Registered designs closest to ours — keep both of yours clearly apart from these too: {near}.",
    weapon: "Weapon (fixed — ours): {weapon}.",
    palette: "Costume colours (ours): {palette}.",
    /* 메카는 장갑판(사용자 2026-11-09 「1번만 넣어주고. 메카만 다시 생성해줘」 — 조조 메카 GPT 설계 두 장이 금속 장식 붙은 드레스로 나왔다) */
    mecha: "Mecha (fixed): she is a female mecha personification — her whole body is covered in solid hard-surface mecha armour plates with visible thickness, joints, panel lines and glow lines, never cloth or a gown; no cloth robe, gown, skirt or long fabric over the plates — any cape, skirt or wing is rigid armoured plates. Her face and hair stay human.",
    /* 역할의 위엄(사용자 2026-11-09 「gpt 설계 1번은 뭔가 조촐하네」 → 「B로 넣고」 — 조조 API 시험에서 기마 무장형이 단출하게 나왔다) */
    rank: {
      lord: "Rank (fixed): she is a ruler — her costume must read her sovereign rank at first glance: layered, richly ornate and regal, with flagship-card detail, fine engraving and jewellery, never plain or sparse.",
      general: "Rank (fixed): she is a famed war general — her costume must read battlefield might at first glance: imposing, richly worked armour and cloth with flagship-card detail, never plain or sparse.",
      strategist: "Rank (fixed): she is a master strategist — her costume must read scholarly prestige at first glance: elegant, layered and finely ornamented, with flagship-card detail, never plain or sparse.",
      official: "Rank (fixed): she is a high court official — her costume must read dignified office at first glance: refined, layered and finely ornamented, with flagship-card detail, never plain or sparse."
    },
    /* 2026-11-18 사용자 「응 허용하고 이순서대로 진행해줘」(세계컷 GPT 설계안 2단계 — B안: 역할 · 기능에서 출발, 목록 밖 외곽 허용) — 둘째 설계(-gpt2). 전엔 「첫째와 확실히 다르게」 */
    second: "Costume — Design B, your second design: first settle her rank — {rank} — and the role she holds in this world. Design a costume outline that fits that role; you may go beyond our list of shapes. Make it differ from Design A in at least one of shoulder width, waistline or lower-body outline, readable even at thumbnail size, and give her another face impression and hair outline than Design A (the same hair colour and skin tone). Show the role through the costume's structure, the placement of her weapon and gear, and one background cue in the architecture or light; she takes a pose that shows the role, her body turned as the Pose line says, with her gaze, hands and the background centre keeping her face and full outfit readable. Everything marked fixed still holds.",
    secondMecha: "In the mecha world keep solid full-body hard armour and redraw her pauldrons, waist plates and lower-body outline for Design B.",
    rankWord: { lord: "a ruler", general: "a war general", strategist: "a strategist", official: "a court official" },
    legend: "Inspiration only: {traits}.",
    world: "World (fixed): {world} Her costume, weapon and setting belong to this world.",
    expose: "Exposure (fixed): bold — her outfit shows skin by design (a deep neckline, bare shoulders or arms, a high slit or short hem); intimate areas covered.",
    end: "Write your own detailed image prompt from this brief, then draw it. One figure only, natural hands with five fingers; {guard}; no logo or watermark."
  };
  /* 일상컷 옷 자유 컷(같은 날 「일상컷도 1장은 gpt에게 노출의상 자유롭게 만들어달라고 해줘」) — 묶음 한 장(필수 갈래 · 상황 컷이 아닌 컷).
     처음엔 Outfit 줄만 이 주문이었고 장소 · 자세 · 구도는 계획 그대로였다 — 2026-11-11 부터 장면까지 자유(아래 FREE_DESIGN) */
  /* 자유 설계 컷 둘(사용자 2026-11-11 「장소·활동·자세·구도·의상을 자유롭게 설계해줘. 캐릭터의 특징에서 출발해, 예상하지 못했지만 그 캐릭터에게 자연스럽게 어울리는
     일상의 한 순간을 보여줘. 참신함은 장식의 양보다 상황과 행동에서 만들어줘. 최근 작업과 비슷한 장면은 피하고, 얼굴·화풍·인체 규칙은 유지해줘.
     필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」) — 일곱 장 중 옷 자유 컷(ofree)과 갈래 자유 컷(ofree + ofreeFamily · ofreeSitu)은
     계획의 장면 줄(장소 · 자세 · 구도 · 손 · 소품 · 시대 …) 대신 이 덩어리 하나. 얼굴 · 화풍 · 인체 · 노출 줄은 그대로. 「…」 는 맡은 쪽(GPT · Claude)이 채우고, 채운 덩어리가 기록에 남는다.
     글은 여기 한 곳 — 두 칸이 같이 쓴다. {recent} 는 계획기가 그림 저장소 기록의 최근 장면 여덟 + 같은 묶음의 다른 컷(장소 — 하는 일) */
  var FREE_DESIGN = {
    head: "FREE DESIGN: design the place, activity, pose, framing and outfit yourself. Start from who she is — her legend, traits and personality — and show an everyday moment that is unexpected yet feels natural for her. Make it fresh through the situation and what she is doing, not through more decoration. Avoid scenes like the recent ones listed below. Keep her face, the art style and the body and anatomy rules exactly as stated. Before drawing, write your design into the lines below, then draw it. In your pose, give each hand one job only and say plainly where each arm goes; avoid poses where it is unclear which shoulder an arm comes from — an arm behind her back, behind her head or pinned under her body — and never state where a foot sits under water. Do not make it another small repair, adjusting, measuring or sorting task at a workbench, repair stall, equipment room or locker room — those scenes are already in our own list; choose another kind of everyday moment (rest, play, a meal, travel, weather, getting ready, simply being in the place).",   /* 끝 두 문장(2026-11-13 — 팔 · 물속 발 사고, 자유 설계가 「작업대에서 손보기」 한 틀로 굳음. 그 틀은 우리 자세 추천에 넣었다) */
    recent: "Recent scenes to avoid: {recent}.",
    recentNone: "none listed",
    lines: ["Place: …", "Activity: …", "Pose: …", "Framing: …"],
    /* 갈래 자유 컷 — 필수 노출 갈래 중 그 묶음의 노출 갈래 컷과 다른 것, 큰 범위만(같은 날 「옷도 이제 큰범위로만 지정해줘. 수영복갈래면 우리쪽에서 선택해도 되고, 본인이 골라도 되는데, 최대한 우리쪽에 없는걸 고르게」) */
    /* {family} 는 두 번 들어간다(「any {family} outfit」) — 트리 표의 긴 영어 글(안전 꼬리까지) 대신 짧은 이름. 없는 갈래는 표 글 */
    familyNames: { lingerie: 'lingerie-inspired', swimwear: 'swimwear', roleplay: 'role-play costume' },
    family: "Outfit family (required): {family} — any {family} outfit; you may pick one from our outfit catalog (outfit-catalog.md in this pack) or design your own, but prefer one that is not in it.",
    /* 상황은 열기(같은 날 「상황도 열어주자」) — 계획기가 고르지 않는다(ofreeSitu 'free'), 맡은 쪽이 짓되 우리 넷(CASUAL.situations)이 아닌 것 먼저 */
    situFree: "Situation (required): a situational exposure moment of your own design that fits the scene — prefer one that is not among ours: clothes soaked by rain or a splash, clothes caught by a strong gust of wind, a top worn half undone, a strap slipped off the shoulder, a hem knotted up under the bust, an outer layer tied around the waist, a sheen of sweat from heat, a backlit silhouette through thin fabric, a skirt slit fallen open, sleeves pushed up with one more button undone, a tie or scarf pulled loose.",
    situ: "Situation (required): right now — {situ}.",   /* 표 상황(ofreeSitu 가 상황 표 열쇠) — 생성기에서 손으로 고른 것 · 옛 기록 */
    outfit: "Outfit: … (a revealing, fashionable outfit that is not in our outfit catalog — outfit-catalog.md in this pack)",   /* 옷 자유 컷 */
    outfitFamily: "Outfit: …",   /* 갈래 자유 컷 — 목록 밖이라는 뜻은 Outfit family 줄에 */
    /* 맡기는 글 — 지시문 전체를 받아 덩어리만 채워 돌려준다(free-brief · API 생성 탭 · prompt-pack) */
    ask: "Below is our image prompt. Reply with this exact prompt, filling in only its FREE DESIGN block: replace each … after Place, Activity, Pose, Framing and Outfit with your own concrete design, following that block's instructions (and its required outfit family and situation, if listed). Keep every other line word for word. Reply with the prompt only, nothing else."
  };
  var OUTFIT_FREE = FREE_DESIGN.outfit;   /* 옛 이름(2026-11-09 옷 자유 Outfit 줄) — 2026-11-11 부터 FREE_DESIGN.outfit 을 가리킨다. 같은 날 「일상컷도 우리쪽 의상자료를 참고하라고해서 여기 없는걸 선택하라고 하자」 — 목록은 묶음의 outfit-catalog.md */
  var WORLD_SHORT = {
    /* 크기(2026-11-09 사용자 「우리 이미지 크기 설정 없어졌나?」) — 짧은 판으로 바꾸며 FRAME 줄과 함께 1024×1536 이 빠졌다. API 는 size 값으로 맞췄지만 GPT 세션은 글만 받는다 */
    head: "A full-body vertical 2:3 (1024×1536) character card image of {name_en} from the Romance of the Three Kingdoms, reimagined as an adult woman — {title}. {age}. She is a woman — no beard, moustache or facial hair.",
    /* 얼굴 비율(사용자 2026-11-09 「삼국시대 이미지 생성시에 … 턱을 과장되고, 길게 그리고, 눈도 더 째져서」 → 「a+b 넣고」) — 일상컷의 짧은 중안부 줄을 세계 그림에도.
       삼국시대는 한 · 중국 단서가 무협 얼굴(긴 얼굴 · V턱 · 째진 눈)을 불렀고 높은 관이 얼굴을 늘렸다. 세 세계 같은 줄 */
    face: "Face proportions: a short midface and a soft, gently rounded jawline with a small soft chin — never a long face or a long, pointed or heavy jaw; any crown or headpiece sits above her hairline and never lengthens her face. Her eyes keep the shape described above at a natural open size — never squeezed into narrow slits.",
    pose: "standing confidently, her body turned slightly while her face looks toward the viewer, one hand resting on her signature item",
    composition: "Composition: vertical 2:3 full-body framing with modest headroom and clear space below the boots — the whole figure from the top of her crown or headpiece to both boots stays inside the frame, occupying about four-fifths of the image height, with the same camera distance in every genre; her hands and her signature item stay inside the frame. Camera at chest height with natural portrait perspective — no wide-angle distortion, no low angle, no close crop.",
    light: "Light: the scene's own light, rendered the way this style renders light and skin.",
    end: "One figure only, natural hands with five fingers; {guard}; no logo or watermark.",
    guard: { samguk: "a banner or seal may carry a single faction character, no other text", fantasy: "Western medieval setting and dress only — no Chinese architecture, robes, junks or hanzi", mecha: "a far-future setting only — no traditional East-Asian architecture, pagodas or tiled roofs; no hanzi" }
  };

  /* 칸 꼴 정리판(2026-11-10 사용자 「화풍비교 전에 kv 꼴에 맞춰서 줄꼴 문장들 좀 옮기자. 지금 정리가 너무 안되어 있다」 → 「문구도 다 정리하자」 → 「응 이 틀로 진행해줘」).
     줄 꼴 17줄을 다섯 칸(화풍 · 인물 · 의상과 장비 · 장면 · 제약)으로 묶고, 겹친 문장은 하나로, 금지 나열은 긍정문으로. 화풍마다 다른 것은 1칸의 화풍 문단뿐.
     판(style.json) 꼭대기 sections 가 켜면 짧은 판이던 화풍이 모두 이 꼴(lib/prompt-sam.js sectionsOn). api25 · kr_mmorpg_26(2.5 글)은 그대로.
     faceWorld — 얼굴 · 머리를 한 세계 값으로 묶을 때 그 세계. 2026-11-10 화풍 비교용으로 'samguk'(세 세계 같게) 이었다가 2026-11-13 사용자 「응 풀어줘」로 '' — 설계표의 세계별 헤어 · 앞머리 · 얼굴형 · 눈(세계마다 다른 사람) */
  var SECTIONS = {
    faceWorld: '',
    world: {
      head: "A full-body character card illustration, vertical 2:3 (1024×1536): {name_en} of the Romance of the Three Kingdoms, reimagined as an adult woman — {title}.",
      s1: "1. STYLE",
      face: "Her face is small and soft in this style: a short midface, a softly rounded jaw and a small chin, about 1.3 times as long as it is wide, with her eyes open at their natural size. Bangs, side locks and headpieces frame the face without lengthening it.",
      s2: "2. CHARACTER",
      age: "Age: {age}.",
      look: "Face — her own, recognisably this character, a woman's face with no beard or facial hair: {face}.",
      body: "Body and hair: {silhouette}",
      expr: "Expression: {expr}, subtle and relaxed.",
      legend: "Legend, carried in her design and bearing: {traits}",
      anatomy: "Anatomy: one head, two arms and two legs, each joined at its natural joint; natural hands with five fingers.",
      s3: "3. COSTUME AND EQUIPMENT — {genre}",
      costume: "Costume: {costume}. {dress}",
      dress: {
        samguk: "Late-Han Chinese dress — cross-collared silk robes with wide sleeves and a broad sash, lamellar or scale armor laced with cords where armor is worn, bronze, jade and lacquer ornament, Han court hair ornaments; silk, lacquered leather, bronze and iron.",
        fantasy: "Western medieval high-fantasy dress — plate, mail and heraldic tabards, gowns and mantles, circlets and crowns; steel, leather, wool, velvet and gold, with a subtle magical glow along the patterns. Her Three Kingdoms origin shows through her signature item, her colours and her bearing.",
        /* 「온몸을 덮는다」 ↔ 노출 「이 곳만 연다」(감사 S2 — 줄 꼴에 있던 「노출이 연 곳만 빼고」 가 칸 꼴에서 빠졌다, 사용자 2026-11-11 「문구를 수정해야지」) */
        mecha: "Solid hard-surface plates with visible joints cover her frame except at the openings named under Exposure; any cape or skirt is made of rigid armored plates; her face and hair stay human."
      },
      costumeHead: { samguk: "", fantasy: "", mecha: "a female mecha personification built as " },
      /* 실루엣이 위 역할 의상과 모양이 다를 때 어느 쪽인지(감사 S5 — 줄 꼴의 「This silhouette overrides the overall shape of the role costume above」 가 칸 꼴에서 빠졌다, 사용자 2026-11-11 「문구를 수정해야지」) */
      silhouette: "Silhouette: {sil}. This silhouette sets the overall shape of the costume above — keep its materials, ornaments and rank in this shape; the details are free.",
      /* 칸 꼴 노출 줄 고쳐 쓰기 — [옛 글, 새 글]. 표(WORLDS exposureBold)는 줄 꼴(api25)도 쓰므로 그대로 두고 칸 꼴 조립에서만 바꾼다.
         삼국시대 「넓은 소매 · 어깨 갑옷」 ↔ 「맨 어깨와 팔」(감사 S6, 사용자 2026-11-11 「문구를 수정해야지」) */
      exposeFix: { samguk: [["bare shoulders and arms where the outer robe is cut away by design", "bare upper arms above detached wide sleeves (and bare shoulders where no shoulder guard sits)"],
        ["; armor pieces stay on and symmetrical", "; any armor pieces stay on and symmetrical"]] },   /* 세계마다 — 삼국시대만 */
      colours: "Colours: {palette}.",
      frame: " Faction frame: {design}.",
      item: "Signature item: {hold}{form}. She holds it at full scale: one whole object, drawn once, held in front of or beside her body; a long weapon keeps one straight, unbroken shaft with a single head or blade.",
      s4: "4. SCENE",
      worldLine: "World: {world}",
      place: "Place: {scene}",
      mood: "Mood: {mood}",
      pose: "Pose: {pose}.",
      poseDefault: "standing confidently, her body turned slightly while her face looks toward the viewer",
      composition: "Composition: her whole figure from the top of her head or headpiece to both feet inside the frame with clear margins, about four-fifths of the image height; camera at chest height with natural portrait perspective.",
      s5: "5. CONSTRAINTS",
      end: "One figure only — no second character, horse or other creature. {text_rule} No logo, watermark, speech bubble or frame border. {guard}",
      guard: {
        samguk: "Three Kingdoms-era Chinese dress, architecture and materials only.",
        fantasy: "A Western medieval setting and dress only — stone castles, Romanesque or Gothic architecture — with no Chinese architecture, robes or hanzi.",
        mecha: "A far-future setting only — space stations, starships and high-tech structures — with no traditional East-Asian architecture."
      }
    },
    casual: {
      head: "Edit the attached image: the same woman — {name_en} of the Three Kingdoms, reimagined — in a new everyday scene, off duty. Output: one vertical 2:3 image, 1024×1536. Use only the attached image as reference, not earlier images from this conversation.",
      s1: "1. KEEP — from the attached image",
      identity: "Her identity: face, eye colour, hair colour, skin tone and body proportions. Her face keeps the same short midface and length-to-width ratio from every camera angle.",
      render: "The rendering: the same finish, line, shading, skin and colour treatment. Style: {style}",
      s2: "2. CHANGE — everything else",
      clothes: "Clothes: she leaves behind everything she wears in the attached image — crown, headpiece, hairpins, armour and regalia — and her hair is styled for the everyday outfit.",
      pose: "Pose and camera: her pose, head angle, gaze, framing and camera height come from the scene below, not from the attached image.",
      s3: "3. SCENE",
      s4: "4. CONSTRAINTS",
      end: "One figure in focus. Anatomy: one head, two arms and two legs, each joined at its natural joint; every visible hand connects through its wrist and forearm to the matching shoulder, with five natural fingers. A limb that crosses the frame edge continues naturally past it. No text, logo or watermark."
    }
  };

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
      general: "CHARACTER: the same woman as the attached image — the female personification of {name_en} of the Three Kingdoms, seen in her everyday life. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change, and her hair may be worn differently only as SCENE's Hair line says. Her Three Kingdoms identity shows ONLY as a small accessory, an object around her, or the object PROP says she holds — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume.",
      /* 게임 코스프레 컷(2026-11-15 — 필수 셋째, data/game-cosplay.json) — 의상 자체가 그 게임 캐릭터를 드러낸다. 그 캐릭터의 코스프레를 입은 그녀이지 그 캐릭터가 아니다 —
         얼굴 · 머리색 · 몸은 첨부 그림 그대로. 위 「Three Kingdoms identity ONLY as a small accessory … never as a costume」 과 부딪쳐 이 컷엔 이 글(게임공방 casualOutputCostume · pkm 포켓몬 코스튬 컷이 본보기) */
      cosplay: "CHARACTER: the same woman as the attached image — the female personification of {name_en} of the Three Kingdoms, off duty in a game cosplay. Keep her face, eye and hair colours, skin tone and body proportions; expression and hair motion may change. In this cut she wears another character's costume: she is herself in that character's cosplay, not that character — her own face, hair colour and body stay exactly as in the attached image."
    },
    /* 시간대 — 계절·날씨 뒤. 비우면 싣지 않는다(사용자 2026-10-30 「일상컷에 시간대」) */
    times: [
      { key: 'morning', ko: '아침', en: 'early morning — low clean light, long soft shadows' },
      { key: 'noon', ko: '한낮', en: 'midday — bright even light' },
      { key: 'golden', ko: '해 질 녘', en: 'golden hour — warm low sun, long shadows' },
      { key: 'dusk', ko: '땅거미', en: 'dusk — blue hour, lights coming on' },
      { key: 'night', ko: '밤', en: 'night — the scene lit by lamps, screens or windows, dark outside' },
      { key: 'neon', ko: '네온 밤', en: 'night under neon and signage light, coloured reflections' },
      { key: 'lamplight', ko: '등불', en: 'warm lamplight or candlelight indoors, the rest in shadow' },
      { key: 'dawn', ko: '새벽', en: 'dawn — the first pale light, cool and quiet, the sky just turning' },
      { key: 'forenoon', ko: '오전', en: 'late morning — clear fresh daylight, soft short shadows' },
      { key: 'overcast', ko: '흐린 낮', en: 'an overcast day — soft, shadowless grey-white light' },
      { key: 'day_indoor', ko: '낮 실내', en: 'daytime indoors — bright, even light filling the room' },
      { key: 'fluorescent', ko: '형광등', en: 'cool white overhead light, flat and bright' }
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
       묶음 도구(tools/casual-plan.cjs)는 한 장수의 여섯 장에 서로 다른 갈래를 나눠 준다. 세력색 금지(WARDROBE · OUTPUT)는 그대로 */
    /* 구체 색(shades — 2026-11-16 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 「응 그렇게 진행해줘」). 묶음 글(en)의 「such as A, B, C」 는
       GPT 가 맨 앞 예시를 골랐다(파스텔 → 분홍 · 비비드 → 체리 레드 · 어스톤 → 카멜). 이제 지시문의 {color} 엔 묶음 안 shade 하나의 en(그 색 하나만, 예시 나열 없이)이 들어간다 —
       계획기가 scene.shade 로 정하고(덜 쓴 것 먼저 · 머리색 hue 피함), 없으면 조립부가 hash(카드|세계|번호)로 정한다. 묶음 en 은 생성기 화면의 설명으로만 남는다. hue 는 아래 hues 하나 */
    colors: [
      { key: 'pastel', ko: '파스텔', en: 'a soft pastel palette such as powder pink, baby blue, mint or lavender', shades: [
        { key: 'powder_pink', ko: '파우더 핑크', en: 'soft pastel powder pink', hue: 'pink' }, { key: 'baby_blue', ko: '베이비 블루', en: 'soft pastel baby blue', hue: 'blue' },
        { key: 'mint', ko: '민트', en: 'soft pastel mint green', hue: 'green' }, { key: 'lavender', ko: '라벤더', en: 'soft pastel lavender', hue: 'purple' },
        { key: 'butter', ko: '버터 옐로', en: 'soft pastel butter yellow', hue: 'yellow' }, { key: 'peach', ko: '피치', en: 'soft pastel peach', hue: 'orange' }] },
      { key: 'vivid', ko: '비비드 원색', en: 'one bright, saturated colour such as cherry red, cobalt blue, sunflower yellow or kelly green', shades: [
        { key: 'cherry', ko: '체리 레드', en: 'bright cherry red', hue: 'red' }, { key: 'cobalt', ko: '코발트 블루', en: 'bright cobalt blue', hue: 'blue' },
        { key: 'sunflower', ko: '해바라기 노랑', en: 'bright sunflower yellow', hue: 'yellow' }, { key: 'kelly', ko: '켈리 그린', en: 'bright kelly green', hue: 'green' },
        { key: 'tangerine', ko: '탠저린', en: 'bright tangerine orange', hue: 'orange' }, { key: 'fuchsia', ko: '푸크시아', en: 'bright fuchsia', hue: 'pink' }] },
      { key: 'earth', ko: '어스톤', en: 'warm earth tones such as camel, olive, rust, chocolate or burgundy', shades: [
        { key: 'camel', ko: '카멜', en: 'warm camel', hue: 'brown' }, { key: 'olive', ko: '올리브', en: 'muted olive green', hue: 'green' },
        { key: 'rust', ko: '러스트', en: 'burnt rust orange', hue: 'orange' }, { key: 'chocolate', ko: '초콜릿', en: 'deep chocolate brown', hue: 'brown' },
        { key: 'burgundy', ko: '버건디', en: 'dark burgundy', hue: 'red' }, { key: 'sand', ko: '샌드', en: 'warm sand beige', hue: 'brown' }] },
      { key: 'mono', ko: '모노톤 블랙', en: 'a monochrome palette of black and charcoal with at most one white or grey accent', shades: [
        { key: 'jet', ko: '블랙', en: 'solid jet black', hue: 'black' }, { key: 'charcoal', ko: '차콜', en: 'charcoal grey', hue: 'grey' },
        { key: 'black_white', ko: '블랙 앤 화이트', en: 'black with a single crisp white accent', hue: 'black' }, { key: 'graphite', ko: '그래파이트', en: 'graphite grey with black trim', hue: 'grey' }] },
      { key: 'jewel', ko: '주얼톤', en: 'rich jewel tones such as emerald, sapphire, amethyst or wine red', shades: [
        { key: 'emerald', ko: '에메랄드', en: 'deep emerald green', hue: 'green' }, { key: 'sapphire', ko: '사파이어', en: 'deep sapphire blue', hue: 'blue' },
        { key: 'amethyst', ko: '자수정', en: 'deep amethyst purple', hue: 'purple' }, { key: 'wine', ko: '와인', en: 'deep wine red', hue: 'red' },
        { key: 'teal', ko: '딥 틸', en: 'deep peacock teal', hue: 'teal' }, { key: 'topaz', ko: '토파즈', en: 'deep topaz gold', hue: 'yellow' }] },
      { key: 'denim', ko: '데님 · 인디고', en: 'denim blues and indigo, with white or cream as the only second colour', shades: [
        { key: 'light_wash', ko: '연청', en: 'light-wash denim blue', hue: 'blue' }, { key: 'mid_wash', ko: '중청', en: 'mid-wash denim blue', hue: 'blue' },
        { key: 'indigo', ko: '인디고', en: 'dark indigo denim', hue: 'blue' }, { key: 'denim_white', ko: '데님과 흰색', en: 'denim blue with crisp white', hue: 'blue' },
        { key: 'chambray', ko: '샴브레이', en: 'pale chambray blue', hue: 'blue' }] },
      { key: 'pattern', ko: '무늬', en: 'a clear pattern such as a floral print, bold stripes, gingham or plaid, in two or three cheerful colours', shades: [
        { key: 'floral', ko: '꽃무늬', en: 'a small floral print in coral and cream', hue: 'orange' }, { key: 'stripe', ko: '줄무늬', en: 'bold navy-and-white stripes', hue: 'blue' },
        { key: 'gingham', ko: '깅엄', en: 'red-and-white gingham', hue: 'red' }, { key: 'plaid', ko: '체크', en: 'green-and-navy tartan plaid', hue: 'green' },
        { key: 'polka', ko: '물방울', en: 'black-and-white polka dots', hue: 'black' }, { key: 'leaf', ko: '잎무늬', en: 'a tropical leaf print in green and sunny yellow', hue: 'green' },
        { key: 'lilac_stripe', ko: '라일락 줄무늬', en: 'lilac-and-white stripes', hue: 'purple' }] },
      { key: 'neutral', ko: '화이트 · 뉴트럴', en: 'clean neutrals such as white, ivory, oatmeal or soft grey', shades: [
        { key: 'white', ko: '화이트', en: 'crisp white', hue: 'white' }, { key: 'ivory', ko: '아이보리', en: 'warm ivory', hue: 'white' },
        { key: 'oatmeal', ko: '오트밀', en: 'soft oatmeal', hue: 'brown' }, { key: 'soft_grey', ko: '소프트 그레이', en: 'soft dove grey', hue: 'grey' },
        { key: 'stone', ko: '스톤 베이지', en: 'pale stone beige', hue: 'brown' }, { key: 'taupe', ko: '토프', en: 'warm taupe', hue: 'brown' }] }
    ],
    /* 색상 갈래(hue)와 머리색 읽기(2026-11-16) — 머리색 영어 글(look-spec VOCAB_EN.hair_color, 그 세계 값)에서 위에서부터 처음 걸린 갈래. 못 읽으면 피하지 않는다.
       분홍 머리에 분홍 옷이 되지 않게 계획기 · 조립부가 그 갈래의 shade 를 피한다(다 피해서 남는 게 없으면 피하지 않는다) */
    hues: ['pink', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'brown', 'black', 'white', 'grey'],
    hueRx: [
      ['pink', '\\b(pink|rose|magenta|fuchsia|cherry-blossom|blush|peach-pink)\\b'],
      ['red', '\\b(red|crimson|scarlet|wine|burgundy|ruby|cinnabar|blood)\\b'],
      ['orange', '\\b(orange|copper|rust|amber|coral|ember|tangerine|terracotta)\\b'],
      ['yellow', '\\b(yellow|gold|golden|blonde|honey|lemon|sulfur|wheat)\\b'],
      ['green', '\\b(green|emerald|jade|mint|olive|lime|chartreuse|verdigris)\\b'],
      ['teal', '\\b(teal|aqua|cyan|turquoise)\\b'],
      ['blue', '\\b(blue|azure|navy|cobalt|sapphire|indigo|sky)\\b'],
      ['purple', '\\b(purple|violet|lavender|lilac|plum|amethyst|mauve)\\b'],
      ['brown', '\\b(brown|chestnut|auburn|caramel|bronze|cedar|chocolate|brass)\\b'],
      ['black', '\\b(black|jet|ink|soot|obsidian|onyx|kohl)\\b'],
      ['white', '\\b(white|platinum|ivory|cream|pearl|snow|silver-white)\\b'],
      ['grey', '\\b(grey|gray|silver|ash|steel|iron|pewter|lead|slate)\\b']
    ],
    colorLine: ' — in {color}; the outfit colour reads clearly at first glance',
    colorFixed: '\\b(?:black|white|red|green|denim|cream|navy|pink|blue|grey|gray|pastel|crimson|scarlet|ivory|beige|floral|striped|stripes|plaid|gingham|leopard|camo|camouflage|tartan|polka)\\b',
    /* 데니어(실 굵기) — 일상컷 옷의 비침, 노출 단계(skin_exposure)와 따로(사용자 2026-11-08 「데니어 설정값 넣어서 랜덤하게 설정될 수 있게 해줘. 기존 노출설정값 과는 별개로」).
       오프숄더 니트 25데니어 시험(장료)에서 니트가 은은히 비쳤고, 가죽 일상 시험(조운)에서 25데니어 이너는 가슴까지 비쳐 — 상의는 40데니어부터, 가슴은 늘 불투명 안감, 타이츠 · 스타킹만 25데니어까지.
       맞는 옷(denierFit — 니트 · 얇은 천 상의 · 타이츠 · 가죽 옷의 이너)에만 Outfit 줄 끝에 붙는다. 수영복 · 란제리는 붙이지 않는다(denierSkip). 비우면 예전처럼 옷 그대로 */
    deniers: [
      { key: 'd40', ko: '40데니어 — 얇게 비침', top: 40, legs: 25 },
      { key: 'd60', ko: '60데니어 — 은은히 비침', top: 60, legs: 40 },
      { key: 'd80', ko: '80데니어 — 살짝 비침', top: 80, legs: 60 }
    ],
    denierLine: '; fabric weight — its knit or thin-fabric pieces (a top, an inner top or a knit dress) are {top}-denier yarn, semi-sheer so her skin tone and body line show softly through, with a fully opaque lining over the bust and the hips; any tights or stockings are sheer {legs}-denier nylon; shorts, skirts, leather, denim and other heavy materials stay opaque',
    denierFit: '\\b(?:knit|knitted|sweater|cardigan|jumper|pullover|tights|stockings?|pantyhose|leggings|mesh|chiffon|tulle|jersey|ribbed|tee|t-shirt|tank top|camisole|cami|blouse|leather)\\b',
    denierSkip: '\\b(?:bikini|swimsuit|swimwear|swim|lingerie|bralette|bra|corset|garter|negligee|babydoll)\\b',
    /* 상황 노출(2026-11-09 사용자 「1번 … 필수갈래에 넣어줘」) — 옷 갈래가 아니라 어떤 옷에든 얹는 순간 하나. 평범한 옷도 노출이 오른다.
       묶음 도구는 여섯 장 중 한 장(노출 갈래 · 세계 안 갈래와 다른 컷)에 꼭 하나를 준다. 맞는 옷(fit, skip)에만 Outfit 줄 끝에 붙는다.
       「옷 갈아입는 중」 같은 것은 필터에 잘 걸려 넣지 않는다. 젖어도 천은 불투명 */
    situations: [
      { key: 'wet', ko: '젖은 옷 — 비 · 물 튐', en: 'a sudden rain shower or a splash of water has just soaked her clothes — the damp fabric clings to her body line and darkens in patches, a few wet strands of hair stick to her neck and cheek; the fabric stays opaque',
        enIn: 'a splash of water has just soaked her clothes — the damp fabric clings to her body line and darkens in patches, a few wet strands of hair stick to her neck and cheek; the fabric stays opaque',   /* 실내(장소 특징 indoor) — 비가 아니라 물 튐(2026-11-13) */
        fit: '.', skip: '\\b(?:bikini|swimsuit|swimwear|swim|monokini|towel|bathrobe|sauna|onsen|jjimjilbang)\\b' },
      { key: 'wind', ko: '바람에 날림', en: 'a strong gust of wind catches her clothes — the hem and every loose piece of fabric lift and flutter, pressing tight against her body line on the windward side, her hair blown to one side',
        fit: '\\b(?:skirt|miniskirt|dress|gown|shirt|blouse|robe|coat|trench|cardigan|cape|cloak|scarf|shawl|hanfu|kimono|yukata|qipao|hanbok|chiffon|tulle|slip|kaftan|sarong|pareo|wrap|drape|draped|chiton|peplos|veil|sash|flowing|wide-leg|culottes)\\b', skip: '', not_has: ['indoor'] },
      { key: 'undone', ko: '반쯤 푼 차림', en: 'she wears her top half undone — the zip or the top buttons open much lower than usual, so the neckline falls open over her collarbones and the inner curve of her chest, the loose edges slipping apart',
        fit: '\\b(?:shirt|blouse|jacket|zip|zipped|zip-up|hoodie|jumpsuit|catsuit|cardigan|buttons?|button-up|button-down|coat|blazer|track|tracksuit|overalls|parka|bomber|vest|waistcoat|uniform|leather jacket|flight suit|robe)\\b', skip: '\\b(?:bikini|swimsuit|lingerie|bralette)\\b' },
      { key: 'strap', ko: '흘러내린 어깨끈', en: 'one strap — or one side of the neckline — has slipped down off her shoulder, baring that whole shoulder and the top of her arm; she leaves it as it is',
        fit: '\\b(?:straps?|strappy|cami|camisole|slip|tank|dress|sundress|gown|off-shoulder|sweater|knit|jumper|tee|t-shirt|top|crop|bra|bralette|bodysuit|leotard|chemise|nightgown|nightdress|negligee|babydoll|corset|bustier|halter|blouse)\\b', skip: '' },
      /* 2026-11-13 — 상황이 넷뿐이라 묶음마다 같은 넷이 돌았다(사용자 「그게 종류가 적은걸로 알아」). 옷 상태만 말하고 팔 동작은 말하지 않는다(손 줄과 부딪힌다). 조건은 lib/casual-tree-v2.js situOk */
      { key: 'knot', ko: '밑단을 묶어 올림', en: 'she has knotted the hem of her top up under her bust to keep it out of the way, baring her midriff and waist',
        fit: '\\b(?:shirt|tee|t-shirt|blouse|top|tank|sweater|knit|jumper|jersey|hoodie|flannel)\\b', skip: '\\b(?:bikini|swimsuit|swimwear|lingerie|bralette|dress|gown|bodysuit|leotard|corset|bustier|crop|cropped|knotted|bandeau)\\b' },
      { key: 'waist_tied', ko: '겉옷을 허리에 묶음', en: 'she has slipped her outer layer off and tied it around her waist by its sleeves, leaving only the fitted inner top over her bare shoulders and arms',
        fit: '\\b(?:jacket|hoodie|cardigan|coat|blazer|coverall|jumpsuit|flannel|overshirt|parka|bomber|track|tracksuit|windbreaker|trench)\\b', skip: '\\b(?:bikini|swimsuit|swimwear|lingerie)\\b' },
      { key: 'sweat', ko: '더위에 밴 땀', en: 'the heat of the place has left a fine sheen on her skin, her top clinging lightly at the collar and the small of her back, a few damp strands at her temples; the fabric stays opaque',
        fit: '.', skip: '\\b(?:towel|bathrobe|coat|parka|fur)\\b', groups: ['spa', 'sports'], place_rx: 'furnace|kiln|sauna|oven|forge|desert|dune|greenhouse|kitchen|galley|gym|hot spring|steam|boiler|stove|jungle|oasis|ranch|summer|saltpan|salt pan|dance' },
      { key: 'sheer_light', ko: '역광에 비친 실루엣', en: 'strong light from behind passes through the thin outer fabric, so the outline of her figure shows as a soft silhouette inside it; the inner layer stays fully opaque',
        fit: '\\b(?:dress|sundress|skirt|shirt|blouse|robe|chiffon|slip|kaftan|linen|tunic|gown|hanfu|drape|draped|chiton|sarong|pareo|nightgown|negligee|yukata)\\b', skip: '\\b(?:leather|denim|bikini|swimsuit|swimwear|latex|vinyl|armou?r)\\b', needs_any: ['window', 'sky'], not_has: ['night'] },
      { key: 'slit', ko: '움직임에 벌어진 트임', en: 'the slit or wrap of her skirt has fallen open along one thigh with her movement, baring that leg up to the hip line; the fabric stays in place',
        fit: '\\b(?:slit|wrap|wrapped|qipao|cheongsam|kimono|yukata|sarong|pareo|robe|hanfu|gown|kaftan|side-tie)\\b', skip: '\\b(?:bikini|swimsuit|trousers|pants|jeans|shorts)\\b',
        postures: ['walk', 'step_up', 'sit_chair', 'sit_edge', 'sit_sideways', 'half_kneel', 'kneel'], frames: ['three_quarter', 'full_body', 'environmental'] },
      /* 일하다 풀어지는 순간(2026-11-13 사용자 「옷에 맞더라도 조금은 보이게」) */
      { key: 'sleeves_up', ko: '소매를 걷고 단추 하나를 풂', en: 'mid-task she has pushed her sleeves up above the elbows and opened one more button at the collar, baring her forearms and collarbones',
        fit: '\\b(?:shirt|blouse|coat|jacket|uniform|coverall|jumpsuit|robe|cardigan|overshirt|lab coat)\\b', skip: '\\b(?:bikini|swimsuit|swimwear|lingerie|bralette|sleeveless|strapless|bandeau)\\b' },
      { key: 'tie_loose', ko: '넥타이 · 스카프를 풀어 내림', en: 'she has pulled her tie or neck scarf loose and let it hang open, the collar unfastened over her collarbones',
        fit: '\\b(?:tie|necktie|scarf|neckerchief|bow tie|ribbon tie|uniform|suit|blazer)\\b', skip: '\\b(?:bikini|swimsuit|swimwear|lingerie)\\b' }
    ],
    situLine: '; right now — {en}',
    /* 팔레트·시각 언어는 장신구 힌트로만. 피부·머리·눈은 첨부 그림의 그 사람 */
    design: "DESIGN (accessory hints only): her legend — {traits} — may inform at most one small accessory, a hair ornament or an object beside her, in its palette ({palette}). The clothes keep the chosen outfit's own colours; her skin, hair and eyes stay as in the attached image.",
    /* 2026-11-01 — 「soft full cheeks · soft smile」 을 뺐다(얼굴을 하나로 만들었다). 얼굴 · 나이는 첨부 그림의 그 사람, 표정은 SCENE 의 것 */
    age: "AGE: the same adult woman as in the attached image — keep her own face shape, cheekbones, eye proportions and skin tone exactly; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases). Keep her face soft, feminine and attractive in every framing — never elongated, gaunt, mannish or heavy-jawed, even in close-ups, profiles or low angles.",
    output: "OUTPUT: one standalone off-duty scene of her in the outfit chosen in SCENE; her legend shows only through accessories and objects around her — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume. Everything else follows SCENE (chosen).",
    /* 게임 코스프레 컷(2026-11-15) — OUTPUT · WARDROBE 를 이 글로. 전설 · 세력 색을 옷에 넣지 말라는 줄(output · wardrobe · DESIGN · 무기 장신구)이 이 컷과 부딪쳐 뺀다.
       의상 색 고르기 · 상황 얹기는 이 컷에 안 한다(pkm 포켓몬 코스튬처럼). 무기는 소품으로도 들지 않는다 */
    outputCosplay: "OUTPUT: one standalone off-duty scene of her wearing the game cosplay chosen in SCENE — a daring adult cosplay of the video game character named there, as worn to a cosplay event, an arcade night or a photo shoot. In this cut the outfit itself shows that game character: its recognisable colours, shapes and parts. Everything else follows SCENE (chosen).",
    wardrobeCosplay: "WARDROBE: change her clothes completely into the cosplay SCENE describes. From the attached image take only her face, hair colour and body — not its garment, armor, regalia, ornaments, mecha plates or background, and none of her Three Kingdoms colours or emblems. The costume must read at first glance as that game character's look, rebuilt as a glamorous adult outfit in the cut SCENE names; she is a real woman in a cosplay, not the character — never the character's face, body or creature shape, no logo or readable text, and no weapon or prop weapon in her hands.",
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
    /* 체형마다 일상컷에 더하는 몸 줄 — 일상컷은 체형 글 없이 첨부 그림의 몸 비율을 따르므로, 갑옷에 가린 몸매를 여기서 잇는다.
       lean_toned(슬림 근육형): 사용자 2026-11-12 「일상컷에 은은한 왕자 복근 지시써서 만들어줘」 → 「11자 말고 식스팩쪽으로」 → 「응 식스팩 줄로 정식으로 넣어줘」(축융 메카 일상 2.6 시험).
       배를 덮는 옷이면 덮은 채로 — 이 줄이 옷을 바꾸지 않게 앞뒤에 조건을 붙였다. 긴 꼴은 「MIDRIFF:」, 짧은 꼴 · 칸 꼴은 「Midriff:」 */
    /* 체형 줄(2026-11-15 사용자 「동탁 … 일상컷때는 너무 슬림해져서, 체형정보 넣은 일상컷 하나만」 → 시험 한 장 → 「이런거보면 체형정보는 넘겨야겠네」 · 「다른체형도」 → 「이대로해줘」).
       일상컷은 체형 글 없이 첨부 그림의 몸 비율만 따랐는데, 풍만형이 마른 몸으로 나왔다. 모든 체형에 설계표 체형 글(VOCAB_EN.body)을 넘긴다 —
       「더 마르게도 더 풍만하게도 말 것」. 긴 꼴은 ANATOMY 다음 「FIGURE:」, 짧은 꼴은 「Figure:」, 칸 꼴은 KEEP 칸 identity 다음 */
    bodyKeep: "{head}: {body} — keep this exact build from the attached image, neither slimmer nor fuller.",
    /* 고른 세계 그림이 GPT 임의 설계(기록 generation.design: gpt_free)면 — 몸은 GPT 가 자유로 정했으니(설계 주문에 체형 칸 없음, 사용자 2026-11-15 「1번은 안돼. 다양성이 떨어져서」)
       설계표 체형 글 없이 그 그림의 몸만 지킨다 */
    bodyKeepFree: "{head}: keep her exact build from the attached image, neither slimmer nor fuller.",
    bodyExtra: {
      lean_toned: "wherever her stomach is bare, it shows a soft, subtle six-pack — lightly defined abdominal segments in two neat columns of three on a flat, firm, toned midriff; feminine and gently shaded, an athletic woman's abs, never a hard, deeply carved bodybuilder six-pack. If her outfit covers her stomach, keep it covered."
    },
    body: "BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows, knees and wrists bend the human way. Hands and feet may be partly hidden by the pose, what she holds or the frame. Right and left mean her own right and left, not the viewer's.",
    hands: "HANDS: natural human hands, no extra or duplicated limbs; each visible hand joins through its wrist and forearm to the matching shoulder. A hand may stay outside the crop, and fingers may be partly hidden by a grip.",
    handBusy: "her own {side} hand is in PROP",
    propOne: "with her own {side} hand she {action}; it is all she holds",
    propBoth: "with both hands she {action} — her own right hand {right}, her own left hand {left}",
    signatureWhole: "SIGNATURE ITEM SHAPE: it is one whole object drawn once: a long weapon (spear, glaive, halberd, staff, bow) keeps a single straight, unbroken shaft from butt to head with exactly one head or blade, held in front of or beside her body — never passing behind her head or shoulders, never broken, bent, split in two by her body or arm, or duplicated; if the frame cuts it, it leaves the frame as one straight line.",   /* 일상컷에서 그 장수의 물건을 들 때 — 창대가 꺾이거나 끊기지 않게(2026-11-02) */
    /* 소품 표의 「알아볼 거리」(signature) 자리 — 그 장수의 물건(설계표 hold.en, 없으면 역할의 hold.en) */
    /* 무기 장수의 일상컷 — 무기는 들지 않고 그 무기를 본뜬 작은 장신구 하나로(사용자 2026-11-02 「무기를 일상컷에선 … 악세사리류로 대체」) */
    weaponCharm: "SIGNATURE ACCESSORY: off duty she carries no weapon — no sword, saber, spear, glaive, halberd, bow, axe, shield or any blade in her hands, on her back or anywhere in the scene. Her signature weapon ({hold}) appears only as one small worn accessory modelled on its shape and colours — a hair ornament, pendant, earring, brooch or belt charm a few centimetres long, clearly jewellery and not a usable weapon.",
    /* 짧은 일상컷(2026-11-08 — 조조 · 손상향 시험: 1,660낱말 → 약 200낱말. 화풍 단락을 일상컷에도 싣고, 화풍을 덮던 SKIN · LIGHT · FACE 질감 규칙과
       WORLD · WARDROBE · ANGLE · OUTPUT · 해부 규칙 묶음을 뺐다. 사용자 「긴얼굴은 아직도 있어서 이것만 막고, 시그니처 악세사리는 머리핀 고정보다는 다양하게」
       「의상에 전설금지는 없는게 낫었겠네. 이것도 장수의 특징 표현이잖아」). 판에 casualShort 가 있으면 이 꼴 — lib/prompt-sam.js buildCasualShort */
    shortAll: true,   /* 모든 화풍이 짧은 일상컷(2026-11-08 「다른 화풍도 켜주고」) — 판에 casualShort: false 면 옛 꼴 */
    short: {
      output: "Output: one vertical 2:3 image, 1024×1536.",   /* 크기(2026-11-09) — 짧은 판에서 빠졌던 것 */
      input: "Use the attached image as the reference: the same woman — {name_en} of the Three Kingdoms, reimagined — seen off duty in her everyday life. Keep her face, eye colour, hair colour, skin tone and body exactly; change only her clothes, pose and place. Do not reuse earlier conversation images.",
      face: "Face: exactly the attached image's face — the same short midface and face length-to-width ratio; the camera angle, pose, bangs or a headpiece never make her face look longer or her jaw heavier.",
      keep: "Keep this rendering exactly as in the attached image — the same finish, line, shading, skin and colour treatment.",
      expose: {
        bold: "showing her shoulders, collarbones and legs as far as the outfit allows",
        moderate: "open at the collarbone and showing her arms or lower legs",
        low: "mostly covered"
      },
      body: "following her curvy figure — a slim waist and rounded hips; intimate areas covered",
      legend: "Her legend — {traits} — may show in the outfit's details, motifs or small accessories.",
      /* 세계 그림의 관 · 머리 장식 · 예복 장식은 가져오지 않는다(2026-11-09 장료 일상 세 장에 초승달 관 · 깃털이 남았다 — 사용자 「응 b는 고쳐줘」) */
      headwear: "Leave behind everything she wears in the attached image — no crown, tiara, helmet, feathers, headpiece, hairpins from it, armour or regalia; her hair is styled for the everyday outfit, with at most the one small accessory below.",
      /* 게임 코스프레 컷(2026-11-15) — 짧은 꼴 · 칸 꼴: 전설 · 무기 장신구 줄 대신 이 줄, 머리 장식 줄은 코스튬 몫으로 */
      cosplay: "Cosplay: in this cut the outfit itself shows the game character named in the Outfit line — its recognisable colours, shapes and parts, rebuilt in the cut named there. She is herself in that character's cosplay, not the character: her face, hair colour and body stay exactly as in the attached image; no weapon or prop weapon, no logo or readable text.",
      headwearCosplay: "Leave behind everything she wears in the attached image — no crown, tiara, helmet, feathers, headpiece, hairpins from it, armour or regalia; any headpiece belongs to the cosplay.",
      charm: "Accessory: off duty she carries no weapon or armour — her signature weapon ({hold}) appears only as {form} modelled on its shape and colours, a few centimetres long, clearly jewellery.",
      charmForms: ['a hair ornament', 'a pendant on a fine chain', 'a pair of drop earrings', 'a brooch', 'a belt charm', 'a charm bracelet', 'a ring', 'a bag charm'],
      light: "Light: the place's own light, lit and coloured the way this style renders light and skin.",
      end: "One figure in focus, natural hands with five fingers, no text, logo or watermark."
    },
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
    skin_tone: { porcelain: 'porcelain-pale skin', fair: 'fair skin', warm_beige: 'warm beige skin', olive: 'olive skin', honey_tan: 'light honey-beige skin', golden_tan: 'warm golden-beige skin', bronze: 'bronze-brown skin', deep_brown: 'deep brown skin' },
    eye_size: { small: 'smaller, narrower eyes than usual anime proportion', medium: 'medium-sized eyes', large: 'large eyes' },
    eye_tilt: { up: 'outer eye corners slightly lifted',   /* 2026-11-09 — 「sharply upward」 가 삼국시대에서 째진 눈으로 나왔다 */ level: 'level outer eye corners', down: 'outer eye corners drooping downward' },
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
    WORLD_FREE: WORLD_FREE, OUTFIT_FREE: OUTFIT_FREE, FREE_DESIGN: FREE_DESIGN,SECTIONS: SECTIONS, WORLD_SHORT: WORLD_SHORT, OUTPUT: OUTPUT, POSE_DEFAULT: POSE_DEFAULT, WORLD_POSES: WORLD_POSES, MECHA_SILHOUETTES: MECHA_SILHOUETTES, SILHOUETTES: { samguk: SAMGUK_SILHOUETTES, fantasy: FANTASY_SILHOUETTES, mecha: MECHA_SILHOUETTES }, SILHOUETTE_HEAD: SILHOUETTE_HEAD, SIL_POOLS: SIL_POOLS, MECHA_SILHOUETTE_HEAD: MECHA_SILHOUETTE_HEAD, WORLD_TIMES: WORLD_TIMES, SCENE_HEAD: SCENE_HEAD, EXPR_HEAD: EXPR_HEAD, EXPR_TAIL: EXPR_TAIL, BODY_LINE: BODY_LINE, RULES: RULES, NOTES: NOTES, FILES: FILES,
    CASUAL: CASUAL, CASUAL_FIXED: CASUAL_FIXED, ASPECT_OPTIONS: ASPECT_OPTIONS, ASPECT_FRAME: ASPECT_FRAME, CROP_EDGE: CROP_EDGE, CLOSE_FRAMES: CLOSE_FRAMES,
    CASUAL_HAND_WORDS: CASUAL_HAND_WORDS, CLOSE_AXIS_GUIDES: CLOSE_AXIS_GUIDES, LENS_GUIDES: LENS_GUIDES,
    LOCAL_AXES: LOCAL_AXES, ADVANCED_OPTIONS: ADVANCED_OPTIONS, ADVANCED_LABELS: ADVANCED_LABELS, ADV_AXIS: ADV_AXIS, ADV_VAL: ADV_VAL, SCENE_AXIS_GUIDES: SCENE_AXIS_GUIDES,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS, EXPRESSION_DETAIL: EXPRESSION_DETAIL
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ── core:v6 begin 0ac744555de0 — style-atelier core/v6/vocab.json 에서 core/sync.cjs 가 옮긴 것. 손으로 고치지 않는다 ── */
(function (S) {
  if (!S) return;
  var C = {"FACE_DESIGN":{"age":{"early_20s":"AGE: about twenty — a fresh young-adult face; no facial lines.","mid_20s":"AGE: mid-twenties — a clear adult face; no facial lines.","late_20s":"AGE: late twenties — a graceful grown-up face with soft, smooth contours; no wrinkles, folds or under-eye bags.","early_30s":"AGE: early thirties — a poised, graceful face with soft contours; at most faint lines, no deep folds or under-eye bags.","late_30s":"AGE: late thirties — a glamorous, alluring mature beauty in her prime: confident, sensual poise, a knowing gaze and a ripe, womanly figure; smooth, radiant skin with at most the faintest lines at the eye corners; never old, tired, gaunt or matronly — still the small, soft chin and soft contours."},"impression":{"elegant":"an elegant, refined presence","cool":"a cool, aloof beauty","sharp":"a sharp, striking, intense look","mature":"a mature, poised woman","soft":"a soft, gentle warmth","glamorous":"a glamorous, sultry allure","rugged":"a rugged, tough, outdoorsy look","stoic":"a stoic, unreadable reserve","boyish":"a boyish, mischievous tomboy energy","regal":"a regal, imperious haughtiness","cute":"a cute, bright-eyed sweetness","cheerful":"a cheerful, sunny openness","languid":"a languid, sleepy-eyed ease","fierce":"a fierce, wild ferocity","melancholic":"a quiet melancholy","androgynous":"a striking androgynous handsomeness","innocent":"a clear, innocent purity"},"skin_tone":{"porcelain":"porcelain-pale skin","fair":"fair skin","warm_beige":"warm beige skin","olive":"olive skin","golden_tan":"light warm-beige skin with a golden undertone","bronze":"bronze-brown skin","deep_brown":"deep brown skin","honey_tan":"light honey-beige skin"},"eye_size":{"small":"smaller, narrower eyes than usual anime proportion","medium":"medium-sized eyes","large":"large eyes"},"eye_tilt":{"up":"outer eye corners slightly lifted","level":"level outer eye corners","down":"outer eye corners drooping downward"},"mark":{"freckles":"a dusting of freckles across nose and cheeks","mole_eye":"a small beauty mark under one eye","mole_lip":"a small beauty mark beside the lips","winged_liner":"sharp winged eyeliner","smoky":"smoky dark eye makeup","red_lip":"a soft rose-red tint on the lips","dark_lip":"dark berry lipstick","gloss":"glossy nude lips","blush":"rosy flushed cheeks","bare":"a bare, makeup-free face","scar":"a thin faint scar through one eyebrow"},"bangs":{"none":"no bangs, forehead bare","straight":"blunt straight bangs","side_swept":"side-swept bangs","curtain":"curtain bangs","one_eye":"long bangs falling over one eye","parted":"center-parted bangs framing the face","choppy":"choppy uneven bangs","wispy":"wispy see-through bangs","baby":"short baby bangs","side_locks":"no bangs, long face-framing side locks","asymmetric":"asymmetric bangs","swept_back":"hair swept back off the forehead"},"param":{"impression":"facial character","skin_tone":"skin tone","eye_size":"eye size","eye_tilt":"eye tilt","bangs":"bangs","age":"apparent age"}},"EXPRESSION_DETAIL":{"calm":"a relaxed, unforced face, lips gently closed","focused":"attentive, steady eyes, mouth closed","soft_smile":"a faint soft smile, relaxed eyes","half_smile":"a slight smile, lips closed","playful":"a light teasing smile, bright eyes","confident":"a composed, self-assured look","sensual":"softly lidded eyes, lips relaxed","provocative":"a cool, knowing look","sleepy":"softly drowsy eyes, relaxed mouth","candid":"a natural, unposed in-between expression","mildly_annoyed":"a faint pout, brows slightly drawn","surprised":"lightly raised brows, lips slightly parted","curious":"one brow slightly raised, attentive eyes","serious":"a level, steady look, mouth closed","amused":"a small closed-lip smile that reaches the eyes","bored":"an idle, unbothered look","pensive":"a quiet, thoughtful look, lips lightly closed","smug":"a faint knowing smile","gentle":"a warm, gentle look with a faint smile","determined":"a firm, resolute look with calm, steady eyes","exhausted":"tired but soft eyes, a relaxed face","nostalgic":"a soft faraway look with a faint wistful smile","unimpressed":"a cool, unimpressed look","flustered":"a slightly flustered look with a light blush","proud":"a proud, poised look with a faint closed-lip smile","wistful":"a faint wistful smile, soft eyes","mischievous":"a small sly smile, bright eyes","relieved":"a relaxed, relieved look","cold_smile":"a faint cool smile, calm composed eyes","laughing":"a natural laugh, eyes crinkled, mouth open in a smile","laughing_open":"a bright open laugh, eyes open and engaged","wink":"a playful wink with a small smile"},"FRAME":{"s1":"1. STYLE","s2":"2. CHARACTER","s3":"3. {costume} — {genre}","s4":"4. SCENE","s5":"5. CONSTRAINTS","anatomy":"Anatomy: one head, two arms and two legs, each joined at its natural joint; natural hands with five fingers.","avoid":"Avoid: {list}."}};
  Object.keys(C).forEach(function (t) { if (t === "FRAME") { S.CORE_FRAME = C[t]; return; } if (!S[t]) return; Object.keys(C[t]).forEach(function (g) {
    if (!(g in S[t])) return;
    if (C[t][g] && typeof C[t][g] === "object") { if (!S[t][g] || typeof S[t][g] !== "object") return; Object.keys(C[t][g]).forEach(function (k) { if (k in S[t][g]) S[t][g][k] = C[t][g][k]; }); }
    else S[t][g] = C[t][g];
  }); });
  S.CORE_VERSION = "v6";
})((typeof window !== "undefined" ? window : globalThis).AtelierSpec);
/* ── core:v6 end ── */
