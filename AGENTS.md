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
| `data/style.json` | 화풍 판 — 세계 그림은 `text`, 일상컷은 `casual`. 기본 `kr_mmorpg`(한국 MMORPG 프로모 렌더, 2026-11-02), 비교용 `game_keyart`(2.5D) · `glossy_kr_game` |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 첫 화면 | `index.html` · `lib/sam.css` | 문 넷(드래프트 · 오늘의 대국 · 도감 · 프롬프트) · 세력 넷 카드(장수 · 확정 · 시안 · 그림 수) · 최근 그림 여덟 · 패치 기록 · 공간 고르기. 예전 게임 주소의 몫(`?daily` · `?local` · `#sam-transfer`)은 `draft.html` 로 그대로 넘긴다 |
| 드래프트(게임) | `draft.html` · `lib/speech.js` · `lib/today.js` · `lib/sprite-actor.*` · `data/sprites.json` · `images/` | **손대지 않는다.** 초상(`images/portraits` · `images/large`)은 게임 것이다 — 새 그림 구조와 따로 |
| 도감 | `dex.html` · `lib/img.js` · `lib/sam.css` | 세력 하나 — 역할 차례(군주 · 무장 · 책사 · 문관)로 장수마다 세계 셋 · 접는 일상컷 · 다른 화풍, 크게 보기(넘기기 · 뒤로 가기는 팝업만) · 즐겨찾기(a: samguk) · 이름 찾기 · 그림 있는 것만. 빈 칸을 누르면 그 장수 · 세계의 생성기 |
| 프롬프트 | `prompt.html` · `lib/studio.js` · `lib/studio.css` · `lib/prompt-spec.js`(표) · `lib/look-spec.js`(외형 어휘) · `lib/prompt-sam.js`(조립) · `lib/casual-tree*.js` · `data/casual-tree*.json` | 세력 › 장수 › 갈래(세계 그림 · 일상컷) › 단계. 고른 것은 이 브라우저에(`samguk_studio_v1`), 주소 `?card=&o=&world=` |

머리 · 항해 · ⚙ 설정은 `lib/workspace-ui.js`(화면 차례 `PAGES` — 「군막(게임)」 은 게임으로 간다), 공간은 `lib/workspace-theme.js` · `lib/workspace.css` · `lib/room.css` — 공간 아홉 — 한낮의 군막 · 달밤의 성루 · 죽간 서고 · 대나무 숲 · 작전 지휘소, 2026-11-02 더한 적벽의 밤 · 도원 · 북방 설원 · 동작대. 배경 그림(`sam-atelier-img/backgrounds/room-<공간>.webp`)은 아직 없다(겹 무늬만). 공간을 더하면 workspace.css(색) · workspace-theme.js(themeColors) · room.css · workspace-ui.js(CREST_MARK) · words.js(theme.* · theme.note.*) 다섯 곳.
`lib/casual-tree.js` · `lib/casual-tree-v2.js` · `lib/favorites.js` 는 다른 공방과 글자 하나 다르지 않게 나눠 쓰는 공용 모듈 — 여기서 따로 고치지 않는다.

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
**체형은 볼륨 · 굴곡이 있는 여덟 갈래만**(사용자 2026-11-02 「체형을 전체적으로 볼륨감과 굴곡감이 느껴지게」) — hourglass · voluptuous · curvy · curvy_athletic · busty_slender · tall_curvy · strong_curvy · petite_curvy. 장신 · 건장 · 아담도 굴곡 체형으로 적는다(`check` 가 막는다).
고치면 `python3 tools/sam-design.py check`.

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 `lib/words.js` 에서 온다. 영어 문구는 `lib/prompt-spec.js`, 외형 어휘는 `lib/look-spec.js`(`tools/port-look-spec.cjs` 가 game 표에서 만든다 — 삼국지 몫 색은 스크립트의 EXTRA 에만). `node tests/words.cjs` — 게임 파일은 이 검사 밖이다.

### 5. 그림은 이 저장소에 두지 않는다

새 그림은 `sam-atelier-img` 에 올린다(`lib/img.js` 의 BASES). `img/` 는 `.gitignore`. 등록은 `그림 등록` 워크플로(`tools/register-images.py`)가 `data/img.json` 에 적는다 — 손으로 고치지 않는다. 게임의 `images/` 는 게임 것이라 건드리지 않는다.

### 6. 고쳤으면 적는다

파일을 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸. 날짜 · `claude` 또는 `gpt` · 무엇, 아래 줄에 파일마다 왜. `node tests/patch.cjs` 가 모양을 본다.

## 검사

```sh
python3 tools/sam-design.py check
python3 tools/casual-tree.py check && python3 tools/casual-tree-v2.py check
node tests/words.cjs && node tests/look-spec.cjs && node tests/patch.cjs && node tests/img-shards.cjs
python3 tests/register-images.py && python3 tests/make-thumbs.py
python3 tests/casual-tree.py && python3 tests/casual-tree-v2.py && node tests/casual-tree.cjs && node tests/casual-tree-v2.cjs
ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs     # 도감 · 생성기, 폰 · PC
node tests/assets.cjs && node tests/regression.cjs                                    # 게임
```
