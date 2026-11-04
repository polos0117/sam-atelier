# 작업 지침

삼국지 공방 — 첫 화면(`index.html`), 게임 **삼국지 쟁탈전**(`draft.html`, 드래프트 — 2026-11-02 첫 화면을 세우며 `index.html` 에서 내용 그대로 옮겼다)과, 장수 한 명을 여성 한 명으로 그리는 **도감 · 생성기 · 그림 저장소**가 한 저장소에 있다(2026-11-02).
도감 · 생성기 · 그림 계층은 원소 공방(element-atelier)의 것을 옮겼다 — 층(근본 · 가문주 · 주민)이 없고 장수 한 명이 한 카드다.

사용자 2026-11-02 「기존 게임은 그대로 두고, 이미지 구조도 개편할거야. 도감 따로 두고, 삼국시대풍, 서양 중세 판타지 시대풍, 메카풍으로 나눠서 이것도 여성의인화 하려고 해.」

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `data/sam-design.json` | 설계표. 세력(넷) · 역할(넷) · 장수(279 — 게임 표 그대로) |
| `IMAGE_RULES.md` | 그림 만들기 · 파일 이름 · 기록 · 올리기 — 그림 작업 전에 |
| `docs/IMAGE_AUTOMATION.md` | GPT 세션이 그림을 채우는 길(AI 검수 뒤 묻지 않고 올린다) — 잠금(`tools/image-claim.cjs`) · 계획기 → 지시문 묶음(`tools/prompt-pack.cjs`) → 생성 → 검사 |
| `data/style.json` | 화풍 판 — 세계 그림은 `text`, 일상컷은 `casual`. 기본 `kr_mmorpg`(한국 MMORPG 프로모 렌더, 2026-11-02), 비교용 `game_keyart`(2.5D) · `glossy_kr_game` |
| `docs/STYLE_LAB.md` | 화풍 실험 기록(2026-11-04) — 네 칸 구조형(공통 규칙 · 작화 · 외형 · 의상 · 장면)의 화풍 판 넷: `semireal_painterly`(추천) · `glossy_sf_kv` · `semireal_smooth` · `semireal_cinematic`. 생성기와 따로, 아무 코드도 안 읽는다 — 옮길 때 `data/style.json` 에 새 판으로 |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 타이틀 | `index.html` | 게임 첫 진입 화면처럼(2026-11-02 「배경이 너무 안 보인다 — 메인화면을 게임 첫 진입화면처럼」): 공간의 배경 장면을 화면 가득, 장식 틀 안에 공방 현판과 큰 메뉴 넷(머리 메뉴와 같은 차례 — 군막 · 드래프트 · 도감 · 프롬프트, 오늘의 대국은 게임 안 새 대국 설정 단추로, 같은 게임이라 2026-11-02 뺐다), ◀ ▶ · ← → 로 공간 넘기기. 예전 게임 주소의 몫(`?daily` · `?local` · `#sam-transfer`)은 `draft.html` 로 그대로 넘긴다 |
| 전장 | `battle.html` · `lib/battle.css` · `data/battles.json` | 일곱 전장(호로관 · 장판파 · 한중 · 관도 · 이릉 · 적벽 · 오장원) × 세계 셋의 지도(그림 저장소 `backgrounds/battles/battle-<전장>-<세계>.webp` — 세계마다 구성이 달라 장수 자리 여덟도 세계마다 `data/battles.json`, x · y 는 지도 백분율). 진영(위 · 촉 · 오 · 군웅 — 군웅은 설계표 `camp` 열넷의 무리)을 고르면 역할 넷(군주 · 무장 · 책사 · 문관)별 이름표 → 누르면 그림 미리 보기 → 「배치하기」 → 지도의 자리. 선 자리를 누르면 그 장수(크게 보기 · 다른 자리로 · 빼기). 지도는 − ＋ 맞춤 · 두 손가락 · Ctrl+휠로 확대(100~400%), 확대하면 끌어서 옮긴다. 배치는 전장 × 세계마다 이 브라우저에(`samguk_battle_v1`), 진영을 섞어 세운다. 새 전장을 더하면 지도 세 장과 자리를 같이 |
| 군막 | `hall.html` · `lib/sam.css` | 공방 안내판(처음엔 첫 화면): 문 셋(드래프트 · 도감 · 프롬프트 — 타이틀과 같은 공간별 그림 단추) · 세력 넷 카드(장수 · 확정 · 시안 · 그림 수) · 최근 그림 여덟 · 패치 기록 · 공간 고르기 |
| 드래프트(게임) | `draft.html` · `lib/speech.js` · `lib/today.js` · `lib/sprite-actor.*` · `data/sprites.json` · `images/` | **손대지 않는다.** 초상(`images/portraits` · `images/large`)은 게임 것이다 — 새 그림 구조와 따로 |
| 도감 | `dex.html` · `lib/img.js` · `lib/sam.css` | 세력 하나 — 역할 차례(군주 · 무장 · 책사 · 문관)로 장수마다 세계 셋 · 접는 일상컷 · 다른 화풍, 크게 보기(넘기기 · 뒤로 가기는 팝업만) · 즐겨찾기(a: samguk) · 이름 찾기 · 그림 있는 것만. 빈 칸을 누르면 그 장수 · 세계의 생성기 |
| 프롬프트 | `prompt.html` · `lib/studio.js` · `lib/studio.css` · `lib/prompt-spec.js`(표) · `lib/look-spec.js`(외형 어휘) · `lib/prompt-sam.js`(조립) · `lib/casual-tree*.js` · `data/casual-tree*.json` | 세력 › 장수 › 갈래(세계 그림 · 일상컷) › 단계. 고른 것은 이 브라우저에(`samguk_studio_v1`), 주소 `?card=&o=&world=` |

머리 · 항해 · ⚙ 설정은 `lib/workspace-ui.js`(화면 차례 `PAGES` — 「군막(게임)」 은 게임으로 간다), 공간은 `lib/workspace-theme.js` · `lib/workspace.css` · `lib/room.css` — 공간 아홉(2026-11-02 다시 짬 — 사용자 「한 가지 색의 명도·채도만 바꾸는 지루한 조합 말고, 서로 다른 계열의 색이 부딪히며 내러티브를 만드는 팔레트」): 무협 — 강호 객잔 · 도화검무(기본) · 주칠 궁전, 판타지 — 금서고 · 요정 숲의 아침 · 용의 대장간, 메카 — 네온 우중 · 정비 격납고 · 궤도 일출. 공간마다 바탕 · 주색 · 맞색 · 금속이 서로 다른 계열이고 이야기 · 소재가 낱말 표 theme.note.* 에 있다. 글자 대비 4.5:1 이상을 지킨다(본문 · 흐린 글 · 주색 · 맞색 · 금속 · 주색 위 글). **질감**(2026-11-02): `lib/material.css` — 판(섹션 · 카드 · 패널 · 단추)에 공간마다 생성한 재질 한 장(그림 저장소 `backgrounds/textures/tex-<공간>.webp`, 이음새 없는 타일 · 대비 55%, 기록 `records/textures/`)을 바탕색 86% 막 아래 깔고, 단추 광택 · 테두리 · 내비게이션 무늬(대발 · 금실 · 문살 · 금박 점 · 열매 점 · 리벳 · 스캔라인 · 해저드 띠 · 별가루)는 CSS. 대비는 재질의 가장 밝은 · 어두운 2% 까지 섞어 계산한다(밝은 공간 셋의 주색 · 맞색 · 금속을 그래서 조금 짙게 했다). 배경 끄기면 재질도 끈다. **공간별 꾸밈**(2026-11-02 「공간별로 따로 적용」): 공간마다 장식 틀 한 장(가운데 투명, `backgrounds/frames/frame-<공간>.webp` — 섹션 · 패널 · 공간 고르기 · 세력 카드 · 내비게이션에 9칸 틀 `border-image`)과 배경 장면 한 장(`backgrounds/room-<공간>.webp`), 단추 모양(등롱 알약 · 비취 육각 현판 · 계단 모서리 칠기 · 책 표지 · 잎 · 화살촉 · 팔각 네온 · 비스듬한 강판 · 그라데이션 테 알약)은 `lib/material.css` 의 공간별 변수(--b-clip · --b-face · --b-pface …). 기록은 그림 저장소 `records/backgrounds/`. 배경 그림은 `sam-atelier-img/backgrounds/room-<공간>.webp`(2026-11-02). 공간을 더하면 workspace.css(색) · workspace-theme.js(themeColors) · room.css · workspace-ui.js(CREST_MARK) · words.js(theme.* · theme.note.*) 다섯 곳.
`lib/casual-tree.js` · `lib/casual-tree-v2.js` · `lib/favorites.js` 는 다른 공방과 글자 하나 다르지 않게 나눠 쓰는 공용 모듈 — 여기서 따로 고치지 않는다.

## 꾸밈 · 글꼴

- 공간 아홉의 꾸밈은 `lib/material.css` 한 곳: 재질 타일 · 장식 틀 · 단추 모양 · 그림 단추(`--ui-*`, 그림 저장소 `backgrounds/ui/`) · 제목 글꼴(`--gallery-serif` — 무협 Song Myung · 판타지 Hahmlet · 메카 Orbit). 본문 글꼴은 IBM Plex Sans KR(400 · 700 두 굵기). 제목 글꼴은 `lib/workspace-theme.js` 가 지금 공간의 것 하나만 붙이고, 글꼴 줄은 전부 화면 그리기를 막지 않는다(`media="print"` → onload — 2026-11-02 「화면 로딩이 엄청 느린데」). 한자 도장 · 세력 기호(Noto Serif KR 900)는 쓰는 글자만 `text=` 로 받는다 — 새 성씨가 생기면 `hall.html` · `dex.html` 의 그 줄을 다시 뽑고 `node tests/fonts.cjs` 로 본다.
- 움직임은 `lib/motion-fx.js`(깃발 꽂기 · 툭 나타나기 · 차례로 · 날아와 커지기 · 퍼지기 · 선 그리기) — Motion 작은 판(`lib/vendor/motion-mini.mjs`, animate + spring, 손으로 고치지 않는다)을 쓴다. 위치 · 크기 · 투명도만, 움직임 줄이기면 끈다. element-atelier 와 글자 하나 다르지 않게 같이.
- 디자인 점검 skill: `.claude/skills/frontend-design`(방향 · 글꼴 · 테두리), `.claude/skills/ui-ux-pro-max`(글꼴 짝 · 스타일 · UX 규칙 검색 — `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<질문>" --domain typography`), `.claude/skills/web-design-guidelines`(규칙 점검).

## 지켜야 할 것

### 1. 게임은 그대로, 사실은 게임 표에서

장수 목록 · 세력 · 역할 · 능력치(통솔 · 무력 · 지력 · 정치) · 일화(`LORE`) · 낙관(`SEAL`)은 `draft.html` 의 표에서 `python3 tools/sam-design.py seed` 가 받는다. 게임 파일을 고치지 않는다.
영문 이름(`en`)은 한어 병음 — `tools/sam-design.py` 의 `ROMAN`. 게임 표가 바뀌면 `seed` 를 다시 돌린다(손으로 적은 칸은 지킨다).

### 2. 세계 셋, 세계마다 다른 사람

세계는 `samguk`(삼국시대 — 후한 말 · 삼국, 184–280) · `fantasy`(서양 중세 하이 판타지) · `mecha`(2190 메카). 세계 글과 장면 셋은 **세력**(`factions[].worlds`), 차림은 **역할**(`roles.<역할>.worlds`)이 쥔다. 장수가 `worlds.<세계>` 를 적으면(글 · 차림 `costume` · 메카 `design` · 장면 `scenes`) 그것이 이긴다.
중세 판타지는 서양 옷 — 삼국지는 그 장수의 물건 · 색 · 태도로만(한복 · 동양 갑옷 금지). 삼국시대는 후한 옷(일본 · 청나라 옷 금지).
외형(`look`)은 색 · 체형 · 이목구비가 세 세계 공통, 헤어 · 앞머리 · 얼굴형 · 눈은 `look.worlds.<세계>` 로 세계마다 다르다(같으면 `check` 가 막는다).

### 3. 설계 상태 — 자동 · 시안 · 확정, 다시 설계

사용자 2026-11-02 「손 설계가 마음에 안 들면 다시 설계」 · 「가로 진행」(시안 상태로도 그린다).

| `designed` | 뜻 |
|---|---|
| `auto` | 자동 설계 — 그리기 전에 시안으로 올린다 |
| `draft` | 시안 — `title` · `traits` · `hold` · `look`(+`why`) · `summary.ko`(도감에 보일 한국어 요약) · `design_by`(claude · gpt) · `design_date` 를 적었고 사용자가 아직 안 봤다. **그려도 된다** |
| `hand` | 확정 — 사용자가 「좋아」 한 것. `python3 tools/sam-design.py approve <장수>…` |

사용자가 「다시」 와 까닭을 말하면 `python3 tools/sam-design.py redo <장수> <까닭>` — `redo: {why, date}` 가 붙고 도감에 ↺ 로 보인다. 다음 설계자(claude · gpt)는 까닭을 읽고 새 시안을 쓰며, **앞 설계(summary · title · traits · hold · look 의 요지 · 까닭)를 `history` 에 넣고 `redo` 를 지운다**. 이미 그린 그림은 「다시 그려」 라고 할 때만 새로 뽑는다(교체는 `IMAGE_RULES.md` 1절). 도감은 상태로 거른다(`?st=draft` — 검토할 시안).

#### 손 설계와 자동 설계

`designed: "hand"` 는 `title` · `traits` · `hold` · `look` 을 장수마다 손으로 적은 것(첫 묶음 13 — 유비 · 관우 · 장비 · 조운 · 제갈량 · 조조 · 하후돈 · 사마의 · 손권 · 주유 · 손상향 · 여포 · 초선).
`designed: "auto"` 는 세력 팔레트(머리 · 눈 색) · 역할(인상 · 표정) · 장수 열쇠(돌림)로 적은 것 — 성정 줄은 능력치에서 짓는다(90 이상이 먼저). 그리기 전에 손 설계로 올리는 것이 좋다.
지시문에 「말 · 짐승」 은 넣지 않는다(ONE FIGURE ONLY — 적토마 · 백마는 성정 줄에서 뺐다). 큰 귀 · 긴 팔 같은 몸 이상도 옷 · 장신구로 옮긴다.
**체형은 볼륨 · 굴곡이 있는 열 갈래만**(사용자 2026-11-02 「체형을 전체적으로 볼륨감과 굴곡감이 느껴지게」) — hourglass · voluptuous · curvy · curvy_athletic · busty_slender · tall_curvy · strong_curvy · petite_curvy · pear_curvy · willowy_curvy(2026-11-03 더함).
**외형 갈래를 늘렸다**(사용자 2026-11-03 「외형관련 분류가 부족하면 더 추가해도 괜찮아. 몇 개로 돌려쓰는 입장이라 겹치는게 있을 수 밖에」) — 머리 10 → 23 · 앞머리 7 → 12 · 얼굴형 6 → 9(돌림은 여섯 — 길고 각진 long · square_soft · angular 는 손으로만, 같은 날 「손책 … 일상컷 얼굴이 길고 각지고 못생기게」) · 눈매 6 → 10 · 눈썹 5 → 8 · 코 5 → 7 · 입술 5 → 8(`lib/look-spec.js` VOCAB_EN · `lib/prompt-spec.js` FACE_DESIGN.bangs · `tools/sam-design.py`). 그림이 없는 장수 253명은 많이 쓴 값 · 겹치는 조합을 덜 쓴 값으로 다시 나눴다(요약 · 설계 까닭에 이름이 나온 값은 그대로, `look.spread`). 그림이 있는 장수는 그대로. 장신 · 건장 · 아담도 굴곡 체형으로 적는다(`check` 가 막는다).
고치면 `python3 tools/sam-design.py check`.

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 `lib/words.js` 에서 온다. 영어 문구는 `lib/prompt-spec.js`, 외형 어휘는 `lib/look-spec.js`(`tools/port-look-spec.cjs` 가 game 표에서 만든다 — 삼국지 몫 색은 스크립트의 EXTRA 에만). `node tests/words.cjs` — 게임 파일은 이 검사 밖이다.

### 5. 그림은 이 저장소에 두지 않는다

새 그림은 `sam-atelier-img` 에 올린다(`lib/img.js` 의 BASES). `img/` 는 `.gitignore`. 등록은 `그림 등록` 워크플로(`tools/register-images.py`)가 `data/img.json` 에 적는다 — 손으로 고치지 않는다. 게임의 `images/` 는 게임 것이라 건드리지 않는다.

### 6. 고쳤으면 적는다

파일을 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸. 날짜 · `claude` 또는 `gpt` · 무엇, 아래 줄에 파일마다 왜. `node tests/patch.cjs` 가 모양을 본다.

## 검사

```sh
node tools/casual-plan.cjs <장수> --world <세계>|all [--fresh] [--out 폴더]   # 일상컷 묶음 계획 — 세계 셋끼리 같은 장면 없이, 비어 있는 번호에(--fresh 면 옛 묶음 뒤 번호로 새 다섯 장) 겹치지 않는 장면(정해 둔 두 갈래 · 네 시대 · 장소 · 의상 · 자세 · 소품), 기록 · 지시문을 생성기 꼴로. --check 기록폴더 로 올리기 전 검사
node tests/casual-plan.cjs              # 계획기 — 장수 × 세계 × 씨앗이 규칙을 지키나
node tests/image-claim.cjs             # 잠금 도구 — 잡기 · 막기 · 풀기 · 끝(시험 저장소에서)
node tests/prompt-gpt.cjs              # 구조형(lib/prompt-gpt.js) — GPT 세션 일상컷 지시문, 생성기 지시문의 줄이 다 칸으로 옮겨지나 — 생성기 지시문의 줄이 다 칸으로 옮겨지나, 고정 화풍 · 첨부 그림 · 체형 볼륨
python3 tools/casual-check.py          # 일상컷 묶음 — 세계마다 다섯 장 중 노출 갈래 한 장 · 세계 안 갈래 한 장(서로 다른 컷), --plan 장수 로 남은 칸 · 세계 사이 같은 장면 알림
python3 tools/sam-design.py check
python3 tools/casual-tree.py check && python3 tools/casual-tree-v2.py check
node tests/words.cjs && node tests/look-spec.cjs && node tests/patch.cjs && node tests/img-shards.cjs
python3 tests/register-images.py && python3 tests/make-thumbs.py
python3 tests/casual-tree.py && python3 tests/casual-tree-v2.py && node tests/casual-tree.cjs && node tests/casual-tree-v2.cjs
ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs     # 도감 · 생성기, 폰 · PC
node tests/assets.cjs && node tests/regression.cjs                                    # 게임
```
