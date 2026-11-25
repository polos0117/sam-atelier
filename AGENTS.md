# 작업 지침

삼국지 공방 — 첫 화면(`index.html`), 게임 **삼국지 쟁탈전**(`draft.html`, 드래프트 — 2026-11-02 첫 화면을 세우며 `index.html` 에서 내용 그대로 옮겼다)과, 장수 한 명을 여성 한 명으로 그리는 **도감 · 생성기 · 그림 저장소**가 한 저장소에 있다(2026-11-02).
도감 · 생성기 · 그림 계층은 원소 공방(element-atelier)의 것을 옮겼다 — 층(근본 · 가문주 · 주민)이 없고 장수 한 명이 한 카드다.

사용자 2026-11-02 「기존 게임은 그대로 두고, 이미지 구조도 개편할거야. 도감 따로 두고, 삼국시대풍, 서양 중세 판타지 시대풍, 메카풍으로 나눠서 이것도 여성의인화 하려고 해.」

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `DESIGN.md` | 이 공방의 길(천하 지도 → 진영 막사 → 장수)과 화면을 만들 때 지킬 것 — 새 화면 · 화면 고치기 전에 |
| `data/sam-design.json` | 설계표. 세력(넷) · 역할(넷) · 장수(370 — 게임 표 279 + 게임 표에 없는 공방 장수 91: 손휴, 2026-11-18 새 장수 1묶음 14명 · 2묶음 27명 · 3묶음 앞쪽 24명 · 뒤쪽 25명 · `extra` 칸) |
| `docs/DRAFT2_PLAN.md` · `data/draft2-generals.json` | 새 판 「삼국지 쟁탈전 · 전장」(Phaser, 만드는 중) 설계 · 전용 장수 자료(다듬은 능력치 · 갈래 · 군주 기질 — 옛 게임 · 그림 설계표와 따로). 연도 판의 **추가 명단**은 `data/draft2-roster.json`(2026-11-17 — 옛 게임 명단 `draft2-packs.json` 은 그대로 두고 그 위에 얹는다, 새 판과 천하 지도가 같이 읽는다 · 설계 1-4). 군웅록 이력(`packs.mx.career`)이 사실과 어긋난 옛 게임 장수는 **고침 표** `data/draft2-career-fix.json`(2026-11-18 「22명만 고쳐」 — 장수마다 `from` 옛 이력 · `to` 고친 이력 · why · src, 읽는 곳은 `rules.js` 의 buildDB 하나)에 적고, 옛 게임 표에 없는 새 장수의 이력은 설계표 `extra.career`(1절 4)에 적는다. 검사 `node tests/draft2-data.cjs` |
| `IMAGE_RULES.md` | 그림 만들기 · 파일 이름 · 기록 · 올리기 — 그림 작업 전에 |
| `docs/IMAGE_AUTOMATION.md` | GPT 세션이 그림을 채우는 길(AI 검수 뒤 묻지 않고 올린다) — 잠금(`tools/image-claim.cjs`) · 계획기 → 지시문 묶음(`tools/prompt-pack.cjs`) → 생성 → 검사 |
| `data/style.json` | 화풍 판 — 세계 그림은 `text`, 일상컷은 `casual`. 기본 **`kr_drawn_rim_dewy`**(2026-11-11 — 화풍공방 확정 화풍 + 몸 피부 물광, 2.6, 칸 꼴; IMAGE_RULES 1절), 그 앞 `kr_mmorpg_26`(2.6 에 2.5 글) · `mmorpg_cg` · **`kr_promo_hikey`** v1(2026-11-08 사용자 「mmorpg 프로모로 기본 화풍 해줘」 · 「새화풍키로 … 이전 이미지랑 안겹치게」 — 옛 `kr_mmorpg` v6 을 새 열쇠로, `kr_mmorpg` 는 옛 그림 판 v4 로 되돌림; 세계 그림 줄 꼴 + 피부색 · 하이키 조명 · 카메라 칸 `worldTail`, 일상컷 묶음 `casualKit`, GPT 묶음은 영문 그대로), 그 앞 **`kv_kmmo_23d`**(2026-11-06 — 한국 MMORPG 2.3D: 세계 그림은 사용자 2.3D 지시문 꼴 STYLE · CHARACTER · COSTUME AND EQUIPMENT · POSE AND SETTING, 역할 × 세계 의상 `costumeRole`, 일상컷은 옛 꼴 + 피부 광택(생성기 「피부 광택」 단계로 광택 없음 · 은은하게 · 촉촉하게 · 반짝이게 — 안 고르면 화풍 기본 촉촉하게, `T.CASUAL.glosses`, 2026-11-06) · 얼굴 자연광 줄(`T.CASUAL.faceLight` — 모든 화풍 일상컷 공통, 얼굴도 장면의 빛을 받게, 2026-11-06); 앞 기준 판 `kv_kmmo_lock` 의 v6 을 새 열쇠로 떼어 냈다 — 사용자 「v6는 화풍키 새로해서 올려줘. 기존에 올라가있는건 보존해주고」), 그 앞 **`kv_kmmo_lock`**(2026-11-05 사용자가 고른 기준 판 — `format: kv`, 영문 네 칸: 머리말 · 1절 고정 · 2절 얼굴 · 헤어 세 세계 같은 값(`faceWorld`) + 흔들리는 값 `swap` · 3절 차림 · 4절 장면, 조립 `lib/prompt-sam.js` buildKv, 글은 모두 판에), 앞 기본 `kr_mmorpg`(한국 MMORPG 프로모 렌더, 2026-11-02 — 그 화풍 그림은 그대로 남는다), 비교용 `game_keyart`(2.5D) · `glossy_kr_game` |
| `docs/STYLE_LAB.md` | 화풍 실험 기록(2026-11-04) — 네 칸 구조형(공통 규칙 · 작화 · 외형 · 의상 · 장면)의 화풍 판 여섯: `semireal_painterly`(추천) · `semireal_painterly_gloss`(조운 세 세계 완성) · `pastel_semireal` · `glossy_sf_kv` · `semireal_smooth` · `semireal_cinematic`, 그리고 조운 기준 영문 세 갈래(2026-11-05) `kv_2d_anime` · `kv_semireal_painted` · `kv_3d_stylized`(1절만 다르고 2 · 3 · 4절 공통), 반실사 갈래 `kv_semireal_painterly` · `kv_semireal_glossy` · `kv_semireal_cinematic`, 2D · 3D 갈래 `kv_2d_film` · `kv_2d_thick` · `kv_3d_real` · `kv_3d_paintover`, **기준 판 `kv_kmmo_lock`**(한국 MMORPG 반실사 + 얼굴 · 장르 고정, 사용자가 고름). 생성기와 따로, 아무 코드도 안 읽는다 — 옮길 때 `data/style.json` 에 새 판으로 |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 천하 지도(첫 화면) | `index.html` · `lib/tianxia.js` · `lib/tianxia.css` · `lib/tianxia-core.js` · `data/tianxia.json` | 공방의 길은 「천하 지도 → 진영 막사 → 장수」(2026-11-17, `DESIGN.md`). 바탕 지도 그림(그림 저장소 `backgrounds/tianxia/<세계>-<light\|dark>.webp` — 세계 셋 × 공간의 밝기, 못 받으면 임시 바탕) 위에 성 표지 서른넷과 세력의 땅(성 둘레 세력색 — 보이는 범위가 곧 눌리는 범위), 위 막대(공방 이름 · 그 판도의 한 줄과 설명 · ⚙ 도구 상자), 지도 밖 한 줄(도움말 · 확대 단추 ＋ − 전체 보기), 범례(그해 장수가 있는 세력 — 성 없는 세력은 끝에 「떠도는 세력」, 새 그림이 있으면 점), 아래 막대(판도 다섯 — 군웅록(전체 장수의 가상 판도, 기본) · 195 군웅할거 · 200 관도 · 208 적벽 · 263 종결 — 과 세계 셋). 끌기 · 두 손가락 · 휠로 확대(확대 · 자리는 이 탭 안에서 기억). 주소 `?era=<팩 열쇠>&w=<세계>[&f=<세력 열쇠>]`, 고른 판도 · 세계는 이 브라우저에(`samguk_tianxia_v1`). 도구 상자 = 다른 화면으로 가는 길(`PAGES`) · 새 그림 모두 확인 · 최근 그림 여덟(장수마다 한 장) · 공간 아홉 · 패치 기록 — 연 채 뒤로 가기는 판만 닫는다. 예전 게임 주소의 몫(`?daily` · `?local` · `#sam-transfer`)은 `draft.html` 로 그대로 넘기고, 옛 군막 `hall.html` 은 지도로 넘긴다 |
| 진영 막사 | 같은 화면의 둘째 층(주소 `&f=`) | 지도에서 세력(범례 · 성 · 땅)을 누르면. 머리(세력 도장 한 글자 · 그해 이름(조조군 — 군웅록의 사람 이름 세력은 「○○군」) · 그 세력의 한 줄 · 가진 성), 가운데 그 세력의 우두머리(`Tianxia.chiefOf` — `data/tianxia.json` 의 그 판도 `lords` → 세력 이름에 든 군주 → roleMap 군주 → 첫 군주 → 군주 없는 무리는 첫 장수), 둘레에 장수(폭에서 셈한 수 — 결의로 묶인 · 그림 있는 장수 먼저), 나머지는 아래 줄. 결의 선(결의 · 혈연 · 불화)과 이름 단추, 역할 걸러 보기(가운데는 그대로 · 0명인 역할은 못 누른다), 「목록으로 보기」(그 막사 장수가 가장 많이 든 목록 세력). 얼굴을 누르면 `dex.html?faction=&card=`, 뒤로 가기 · 「‹ 천하 지도」 는 지도 |
| 전장 | `battle.html` · `lib/battle.css` · `data/battles.json` | 일곱 전장(호로관 · 장판파 · 한중 · 관도 · 이릉 · 적벽 · 오장원) × 세계 셋의 지도(그림 저장소 `backgrounds/battles/battle-<전장>-<세계>.webp` — 세계마다 구성이 달라 장수 자리 여덟도 세계마다 `data/battles.json`, x · y 는 지도 백분율). 진영(위 · 촉 · 오 · 군웅 — 군웅은 설계표 `camp` 열넷의 무리)을 고르면 역할 넷(군주 · 무장 · 책사 · 문관)별 이름표 → 누르면 그림 미리 보기 → 「배치하기」 → 지도의 자리. 선 자리를 누르면 그 장수(크게 보기 · 다른 자리로 · 빼기). 지도는 − ＋ 맞춤 · 두 손가락 · Ctrl+휠로 확대(100~400%), 확대하면 끌어서 옮긴다. 배치는 전장 × 세계마다 이 브라우저에(`samguk_battle_v1`), 진영을 섞어 세운다. 새 전장을 더하면 지도 세 장과 자리를 같이 |
| 드래프트(게임) | `draft.html` · `lib/speech.js` · `lib/today.js` · `lib/sprite-actor.*` · `data/sprites.json` · `images/` | **손대지 않는다.** 초상(`images/portraits` · `images/large`)은 게임 것이다 — 새 그림 구조와 따로 |
| 새 판(만드는 중) | `draft2.html` · `lib/draft2/`(rules · art · ui · scenes · main · css) · `data/draft2-generals.json` · `data/draft2-combos.json` · `data/draft2-packs.json` · `data/draft2-factions.json` · `data/draft2-bonds.json` · `data/draft2-roster.json` | 「삼국지 쟁탈전 · 전장」 — Phaser 4(CDN 고정 4.2.1). 1 · 2단계(2026-11-12): 세계 고르기 → 13진 지명(그림 카드) → 11명 편성 → 전장 배치(8명 · 후군 3) → 겨루기(거점 여덟) → 결과(2인 한 판 · 3인은 둘씩 돌아가며 리그 세 판, 편성 점수는 참고). 전장 거점 꼴은 `data/draft2-battlefields.json`(battles.json 의 지도 · 자리는 그대로). 기본은 **3인(정립) · 군웅록**(장수마다 거친 세력으로 결속, `data/draft2-packs.json`), 설정에서 2인 · 천하(연도 194 · 200 · 208 · 263 · 위촉오+군웅). 연도 판은 옛 게임 명단에 추가 명단(`data/draft2-roster.json` — 그해 장수 · 세력 열쇠 · 근거 · 출처, `roles` 는 그해 군주)을 얹는다 — 합치는 곳은 `rules.js` 의 `view` 하나, 군웅록 · 위촉오+군웅은 그대로. 세력 색 · 결속 곡선 · 군웅 연합은 `data/draft2-factions.json`, 옛 주군 · 배신은 `data/draft2-bonds.json`(둘 다 새 판만). 설계 `docs/DRAFT2_PLAN.md`. 규칙은 `lib/draft2/rules.js`(Phaser 없는 순수 모듈, node 로도), 저장 키 `samguk_draft2_*`. 첫 화면 · 머리 메뉴엔 아직 안 붙였다 |
| 목록 도감(정리판 — 곁길) | `dex.html` · `lib/img.js` · `lib/sam.css` · `lib/tianxia-core.js` | 2026-11-17 정리판 — 머리 항해 · 장식 틀 없이 첫 화면에 장수 줄이 바로. 머리(도감 · 세력 · 장수 수 · 그린 칸) + 옆으로 넘기는 세력 줄(위 · 촉 · 오 · 군웅의 무리 열넷(설계표 `camps` 차례) · 군웅 전체 — 새 그림이 있으면 점, 고른 세력이 화면 안으로 따라온다) + 장수 줄(세계 셋의 작은 세로 그림 — 빈 칸을 누르면 그 장수 · 세계의 생성기 · 이름 · 역할 · 캐릭터만의 컷 직업 · 설계 상태 · 능력치, 이름 칸을 누르면 일상컷 · 설계 요약). 오른쪽 아래 단추 하나(도구 판): 이름 찾기(**찾는 말이 있으면 모든 세력에서** — 세력 줄에 「찾는 중」, 지우면 원래 세력) · 걸러 보기(그림 있는 것만 · 새 그림만 · 그림 없는 것만) · 새 그림 모두 확인 · 보기 갈래 · 세계 · **화풍 고르개**(`#dex-style`, 2026-11-05 「옛날 버전은 따로보게」 — 처음은 기본 화풍, 그림이 있는 앞 화풍은 골라서 따로, 주소 `?style=` · 이 브라우저에 기억) · 설계 걸러 보기 · 역할로 가기 · 즐겨찾기(a: samguk). 크게 보기(넘기기 · 떠 있는 동안 뒤 목록은 잠근다)와 도구 판은 연 채 뒤로 가기를 누르면 그것만 닫힌다. 주소 `?faction=<wei\|shu\|wu\|qun\|군웅의 무리 열쇠>&view=&w=&q=&only=&st=&style=&card=&pic=` — `?card=` 는 그 장수가 든 세력 줄을 열고 그림을 연다(`pic` 이 그 장수의 그림이 아니면 첫 그림), 크게 보기를 닫으면 주소에서 `card` · `pic` 을 지운다. 왼쪽 아래 「‹ 지도」 는 지도 · 막사에서 넘어왔으면 뒤로 가기, 아니면 `index.html` |
| 화풍 비교 | `styles.html` · `data/style-compare.json` | 머리 항해의 「화풍」 탭(2026-11-07) — 같은 장수(조조)를 화풍마다 세계 그림 셋 + 그 그림을 붙인 근접 일상컷(+ 예전 등록 그림)으로. 보기 화풍별 · 세계별, 갈래 고르기, 크게 보기(← →). 그림은 그림 저장소 `style-atelier-img 의 sam-style-test/compare/<묶음 열쇠>/`(등록 그림 아님 — 도감 · 등록 워크플로와 무관). **묶음은 더하기만** — 열쇠는 날짜, 같은 날 또 올리면 `날짜-2` · `날짜-3`(`python3 tools/style-compare.py next` 가 다음 열쇠, `check` 가 겹침 · 빠진 파일), data/style-compare.json `rounds` 에 한 묶음 더하면 화면 위 고르개에 뜬다(기본 최신, 주소 `?r=`) |
| 프롬프트 | `prompt.html` · `lib/studio.js` · `lib/studio.css` · `lib/prompt-spec.js`(표) · `lib/look-spec.js`(외형 어휘) · `lib/prompt-sam.js`(조립) · `lib/casual-tree*.js` · `data/casual-tree*.json` | 세력 › 장수 › 갈래(세계 그림 · 일상컷) › 단계. 고른 것은 이 브라우저에(`samguk_studio_v1`), 주소 `?card=&o=&world=` · **화풍 고르개**(2026-11-06 — 맨 위 「기본 — 이름」 은 그때의 기본 화풍, 아래로 style.json 의 다른 판(내린 화풍 빼고), 주소 `?style=` · 기기에 기억, 지시문 · 파일 이름 · 기록이 고른 화풍으로) |
| (프롬프트 v2) | 지웠다 | 구조판 지시문 탭(`prompt2.html` · buildStruct · STRUCT · 화풍 `glossy_plain` · `glossy_kv` · `anime_kv`, 2026-11-05)은 2026-11-11 사용자 「구조판은 지워줘」 로 지웠다 |

**천하 지도 자료**(2026-11-17): `data/tianxia.json` — 성 서른넷(x · y 는 바탕 그림의 백분율) · 판도 다섯(열쇠는 `data/draft2-packs.json` 의 팩 열쇠 `mx` · `w194` · `gd200` · `jb208` · `end263` 그대로)마다 성의 주인(`owners.<성>` — `f` 는 `data/draft2-factions.json` 의 세력 열쇠나 `null`, `why` 근거 한 줄 · `src` 확인한 주소) · 세력의 한 줄(`notes`) · 군주가 여럿인 세력의 우두머리(`lords` — 이름으로 못 가리는 곳, 분명한 곳만). **역사 사실을 지어내지 않는다** — 확신이 없으면 주인 없음. 사람이 훑어볼 표 `docs/TIANXIA_SOURCES.md` 는 손으로 고치지 않고 `node tests/tianxia-data.cjs --write` 로 다시 뽑는다. 세력 나눔은 새 판 규칙 모듈(`lib/draft2/rules.js` · `data/draft2-*.json`)을 읽기만 한다 — 연도 판도의 그해 세력 표는 옛 게임 명단에 추가 명단(`data/draft2-roster.json`)을 얹은 것이고(195 에 유장 · 장로 · 장양 · 교주 · 왕랑 · 유요가 성을 가진다), 표 문서에 판도마다 추가 명단 표도 같이 나온다.
**「새 그림」 규칙**: 그 장수의 가장 늦은 등록 날짜(`data/img.json` 의 `added`)가 오늘이나 어제(한국 시간)이고 이 브라우저가 그 날짜를 아직 확인하지 않았을 때 켜진다. 그 장수의 그림을 크게 열면(또는 「새 그림 모두 확인」) 꺼지고, 더 늦은 등록이 생기면 다시 켜진다 — 기록은 기기마다 `localStorage['samguk_seen_v1']`(셈 `lib/tianxia-core.js` 의 `isNew` · `seen`, 지도 범례 · 막사 얼굴 · 목록 줄 · 세력 줄이 같이 쓴다).

머리 · 항해 · ⚙ 설정은 `lib/workspace-ui.js`(화면 차례 `PAGES` — 첫 탭은 천하 지도 `index.html`; 천하 지도 · 목록 도감은 머리 항해를 싣지 않고 도구 상자로 간다), 공간은 `lib/workspace-theme.js` · `lib/workspace.css` · `lib/room.css` — 공간 아홉(2026-11-02 다시 짬 — 사용자 「한 가지 색의 명도·채도만 바꾸는 지루한 조합 말고, 서로 다른 계열의 색이 부딪히며 내러티브를 만드는 팔레트」): 무협 — 강호 객잔 · 도화검무(기본) · 주칠 궁전, 판타지 — 금서고 · 요정 숲의 아침 · 용의 대장간, 메카 — 네온 우중 · 정비 격납고 · 궤도 일출. 공간마다 바탕 · 주색 · 맞색 · 금속이 서로 다른 계열이고 이야기 · 소재가 낱말 표 theme.note.* 에 있다. 글자 대비 4.5:1 이상을 지킨다(본문 · 흐린 글 · 주색 · 맞색 · 금속 · 주색 위 글). **질감**(2026-11-02): `lib/material.css` — 판(섹션 · 카드 · 패널 · 단추)에 공간마다 생성한 재질 한 장(그림 저장소 `backgrounds/textures/tex-<공간>.webp`, 이음새 없는 타일 · 대비 55%, 기록 `records/textures/`)을 바탕색 86% 막 아래 깔고, 단추 광택 · 테두리 · 내비게이션 무늬(대발 · 금실 · 문살 · 금박 점 · 열매 점 · 리벳 · 스캔라인 · 해저드 띠 · 별가루)는 CSS. 대비는 재질의 가장 밝은 · 어두운 2% 까지 섞어 계산한다(밝은 공간 셋의 주색 · 맞색 · 금속을 그래서 조금 짙게 했다). 배경 끄기면 재질도 끈다. **공간별 꾸밈**(2026-11-02 「공간별로 따로 적용」): 공간마다 장식 틀 한 장(가운데 투명, `backgrounds/frames/frame-<공간>.webp` — 섹션 · 패널 · 공간 고르기 · 세력 카드 · 내비게이션에 9칸 틀 `border-image`)과 배경 장면 한 장(`backgrounds/room-<공간>.webp`), 단추 모양(등롱 알약 · 비취 육각 현판 · 계단 모서리 칠기 · 책 표지 · 잎 · 화살촉 · 팔각 네온 · 비스듬한 강판 · 그라데이션 테 알약)은 `lib/material.css` 의 공간별 변수(--b-clip · --b-face · --b-pface …). 기록은 그림 저장소 `records/backgrounds/`. 배경 그림은 `sam-atelier-img/backgrounds/room-<공간>.webp`(2026-11-02). 공간을 더하면 workspace.css(색) · workspace-theme.js(themeColors) · room.css · workspace-ui.js(CREST_MARK) · words.js(theme.* · theme.note.*) 다섯 곳.
`lib/casual-tree.js` · `lib/casual-tree-v2.js` · `lib/favorites.js` 는 다른 공방과 글자 하나 다르지 않게 나눠 쓰는 공용 모듈 — 여기서 따로 고치지 않는다. 공용 파일(`lib/casual-tree.js` · `lib/casual-tree-v2.js` · `lib/fill-view.js` · `lib/fill-core.js` · `lib/favorites.js`)은 **style-atelier `shared/` 에서만 고치고** `node shared/sync.cjs` 로 옮긴다 — 여기서 고친 것은 다음 sync 가 덮는다(2026-11-25, 대조는 style-atelier `node tests/shared.cjs`).

## 꾸밈 · 글꼴

- 공간 아홉의 꾸밈은 `lib/material.css` 한 곳: 재질 타일 · 장식 틀 · 단추 모양 · 그림 단추(`--ui-*`, 그림 저장소 `backgrounds/ui/`) · 제목 글꼴(`--gallery-serif` — 무협 Song Myung · 판타지 Hahmlet · 메카 Orbit). 본문 글꼴은 IBM Plex Sans KR(400 · 700 두 굵기). 제목 글꼴은 `lib/workspace-theme.js` 가 지금 공간의 것 하나만 붙이고, 글꼴 줄은 전부 화면 그리기를 막지 않는다(`media="print"` → onload — 2026-11-02 「화면 로딩이 엄청 느린데」). 한자 도장 · 세력 기호(Noto Serif KR 900)는 쓰는 글자만 `text=` 로 받는다 — 새 성씨 · 세력 한 글자가 생기면 `index.html` · `dex.html` 의 그 줄을 다시 뽑고 `node tests/fonts.cjs` 로 본다.
- 움직임은 `lib/motion-fx.js`(깃발 꽂기 · 툭 나타나기 · 차례로 · 날아와 커지기 · 퍼지기 · 선 그리기) — Motion 작은 판(`lib/vendor/motion-mini.mjs`, animate + spring, 손으로 고치지 않는다)을 쓴다. 위치 · 크기 · 투명도만, 움직임 줄이기면 끈다. element-atelier 와 글자 하나 다르지 않게 같이.
- 디자인 점검 skill: `.claude/skills/frontend-design`(방향 · 글꼴 · 테두리), `.claude/skills/ui-ux-pro-max`(글꼴 짝 · 스타일 · UX 규칙 검색 — `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<질문>" --domain typography`), `.claude/skills/web-design-guidelines`(규칙 점검).

## 지켜야 할 것

### 1. 게임은 그대로, 사실은 게임 표에서

장수 목록 · 세력 · 역할 · 능력치(통솔 · 무력 · 지력 · 정치) · 일화(`LORE`) · 낙관(`SEAL`)은 `draft.html` 의 표에서 `python3 tools/sam-design.py seed` 가 받는다. 게임 파일을 고치지 않는다.
영문 이름(`en`)은 한어 병음 — `tools/sam-design.py` 의 `ROMAN`. 게임 표가 바뀌면 `seed` 를 다시 돌린다(손으로 적은 칸은 지킨다).
**게임 표에 없는 공방 장수**(2026-11-17 손휴 — 사용자 「손휴는 추가해줘」, 263년 판도의 실제 오나라 군주): 설계표의 그 장수에 `extra: {why, src}` 를 적는다 — `seed` 가 지우지 않고 `check` 가 게임 표와 견줄 때 뺀다. 사실(능력치 · 일화)은 확인한 출처에서만 적고, 같이 고칠 곳은 `data/draft2-generals.json`(같은 차례) · `data/draft2-roster.json`(나오는 해) · `data/casual-own.json` · `docs/casual-own-list.md`. 옛 게임에는 안 나오고, 군웅록 이력이 없어 새 판 · 지도에서는 설계표 세력(위 · 촉 · 오 → 조위 · 촉한 · 동오)으로 든다(`lib/draft2/rules.js` 의 `careerOf`). 검사의 장수 수는 박아 두지 않고 설계표에서 센다.
**새 장수 묶음을 더하는 차례**(2026-11-18 1묶음 14명 — 사용자 「3묶음까지」: 천하 지도의 얇은 세력 · 빈 땅을 채운다. 본보기는 그 커밋과 `tools/batches/2026-11-18-add1.py`):
1. **확인** — 한 명씩 위키문헌 삼국지 원문(`https://zh.wikisource.org/wiki/三國志/卷NN` — 받을 때는 `api.php?action=query&prop=revisions` 가 막히지 않는다)과 위키백과 한 · 영 · 중. 이미 다른 이름으로 표에 있으면 넣지 않고, 연의에만 있는 일은 「연의」 라고 밝히거나 뺀다. 나오는 해(195 겨울 · 200 봄~여름 · 208 겨울 · 263 여름)에 살아 있고 그 밑에 있었는지 본다 — 안 맞으면 군웅록에만.
2. **묶음 파일** `tools/batches/<날짜>-<이름>.py` 를 쓴다(장수마다 끼울 자리 `after` · 역할 · 무리 `camp` · 도장 · 능력치 · 일화 · 영문 이름 설명 · 물건 · 머리 눈 색 · 인상 · 표정 · 확인한 사실과 출처 · 새 판 갈래 · 기질 · 직업 한 줄과 세 세계의 장면). 능력치는 같은 처지의 기존 장수와 견주고, 직업은 `docs/casual-own-list.md` 를 훑어 겹치지 않게(3-1절), 세 세계의 자세 추천은 서로 다르게.
3. `python -I tools/add-generals.py tools/batches/<묶음>.py` — 설계표(시안 · `extra{why, src, career}`) · `data/draft2-generals.json` · `data/casual-own.json` · `docs/casual-own-list.md` 에 끼운다(이미 든 장수는 건너뛴다 — 고쳐서 다시 끼우려면 그 네 파일을 `git checkout --` 한 뒤). 그 뒤 `python -I -X utf8 tools/sil-spread.py`(실루엣을 묶음 파일에 안 적었을 때) · `tools/sam-design.py` 의 `ROMAN` 에 병음. 같은 묶음 · 같은 무리와 머리 색 · 세계별 헤어 · 실루엣 · 체형이 겹치면 묶음 파일의 `BODY` · `WORLD_FIX` · `SIL` 로 바꾼다.
4. **군웅록에서 드는 세력** — 군웅(`qun`) 장수는 `extra.career`(묶음 파일의 `CAREER`, 세력 열쇠는 `data/draft2-factions.json`)를 적는다. 없으면 군웅록에서 「군웅」 이라는 딴 세력으로 떨어진다. 추가 명단 파일에 두지 않는다(그 파일이 없어도 군웅록은 같은 판이어야 한다 — 검사). 위 · 촉 · 오 장수는 안 적어도 조위 · 촉한 · 동오로 든다.
5. **손으로** — 나오는 해는 `data/draft2-roster.json`(그 팩 `add` 끝에 한 줄씩 · why · src, 군주로 세울 장수는 `roles` 와 `lordAs`), 새 세력은 `data/draft2-factions.json`(열쇠는 첫 주인의 이름 · 도장은 성 글자, 겹치면 땅 이름 — 공손도 遼 · 색은 기존 색과 RGB 거리 70 이상), 성의 주인 · 우두머리 · 한 줄은 `data/tianxia.json`(확인 안 되는 해는 그대로 둔다) 뒤 `node tests/tianxia-data.cjs --write`. 새 도장 · 세력 글자는 `index.html` · `dex.html` 의 한자 글꼴 줄에(`node tests/fonts.cjs` 가 빠진 글자를 말해 준다). `rules.js` 를 고쳤으면 `draft2.html` · `index.html` 의 `?v=`.
6. **검사** — `python -I -X utf8 tools/sam-design.py check` · `tools/sil-spread.py --check` · `tests/draft2-data` · `draft2-rules` · `tianxia-data` · `tianxia-core` · `fonts` · `look-spec` · `words` · `patch`, 화면은 `tianxia-screen` · `screen` · `draft2-screen`, 직업은 `node tools/casual-plan.cjs <이름> --world all --usage none --cosplay-usage none`(한 명에 20초쯤 — 세 세계 다 「90 ◆」). 검사가 장수 수 · 막사 인원을 박아 둔 줄(`tests/tianxia-core.cjs` 의 「195 유요 4명」 따위)은 그 묶음이 바꾼 만큼 고친다. 윈도우에서는 파이썬 출력이 cp949 라 `-X utf8` 을 붙이고, `draft2-rules` 는 `data/draft2-combos.json` · `data/draft2-packs.json` 의 작업 사본을 LF 로 바꿔 돌린 뒤 `git checkout --` 으로 되돌린다.
7. `docs/PATCH.md` 맨 위에 한 칸(누구를 왜 · 능력치와 직업의 까닭 · 출처 · 뺀 사람) — 장수 수가 적힌 곳은 이 문서 첫 표와 `docs/DRAFT2_PLAN.md`.
2묶음(2026-11-18, 27명 · `tools/batches/2026-11-18-add2.py`)에서 알게 된 것:
- 위 · 촉 · 오 장수는 묶음 파일에 `fac`(wei · shu · wu)를 적고 `camp` 는 안 적는다. `CAREER` 는 옛 이력 표처럼 섬긴 차례로 여럿 적어도 된다(마지막이 군웅록의 세력 — 왕찬 `[유표, 조위]`).
- 새 판 갈래는 역할에 매인다 — 모사 · 군사는 책사만, 내정관 · 외교관은 문관만, 이인은 둘 다(`tests/draft2-data` 가 막는다. 부 갈래는 자유).
- 들고 쓰는 것이 없는 자세(`use` 없음)는 받침 장소를 가린다 — casual-plan 이 「자세 추천 X 가 바탕 장소 Y 에서 안 된다」 로 멈춘다. 이미 통한 짝: ankles_sit · inn / clasp_low · kneel_clasp · reach_shelf · study / edge_brace · harbor / hip_contra · thumbs_waist · wave_chest · square · workshop / step_pause · stairs. 소품을 드는 자세는 garden · field · market · kitchen · training · room 에서도 통했다. 옆모습 자세도 가린다 — counter_cup · chair_cross_prop 은 inn, table_lean_use · reach_shelf 는 study, lookback_raise 는 square · workshop · market, bench_fix 는 workshop · field(「X 의 자세가 Y 에서 안 된다」).
- casual-plan 은 씨앗에 따라 가끔 끝나지 않는다(2묶음 81칸 가운데 여덟 칸이 첫 씨앗에서 멈췄다). `timeout` 은 fnm 아래의 node 를 못 죽이니, 40초 넘은 casual-plan node 를 PowerShell 로 끄는 감시를 곁에 두고 `--seed 1~4` 를 차례로 돌린다.
- 같은 무리와의 겹침(세계별 실루엣 · 헤어 · 체형)은 손으로 찾기보다 한 번 끼운 뒤 스크립트로 같은 무리(군웅 camp, 263 사람은 그해 팩의 세력)를 훑어 덜 쓴 값으로 고르고, 그 값을 묶음 파일에 적은 뒤 네 파일을 `git checkout --` 하고 다시 끼우는 것이 빠르다.
- 위키문헌 API 도 열 권쯤 받으면 429 — 그 뒤는 WebFetch 로 `https://zh.wikisource.org/wiki/三國志/卷NN` 쪽을 읽으면 된다. Git Bash 의 python 인라인(`-c`)은 한글이 되지만 heredoc 은 깨질 수 있어 스크래치 .py 파일로.
3묶음 앞쪽(2026-11-18, 위 · 오 24명 · `tools/batches/2026-11-18-add3a.py`)에서 알게 된 것:
- 겹침 풀기 스크립트는 새 장수의 세계별 실루엣이 있어야 돈다 — 한 번 끼운 뒤 `tools/sil-spread.py`(--check 없이)를 먼저 돌리고 훑는다. 그 뒤 네 파일을 `git checkout --` 하고 SIL 을 적은 묶음으로 다시 끼우면 sil-spread 는 다시 안 돌려도 된다(`--check` 만).
- 조위(69명) · 동오(56명)처럼 큰 세력은 세계별 헤어 · 실루엣 · 체형이 이미 다 쓰여 「안 쓴 값」 이 없다 — 같은 세력 안에서 가장 덜 쓴 값(그 수가 가장 적은 것)으로 고른다. 머리 색도 다 쓰여 있으니 그 세력에서 0 · 1번 쓴 색에서 묶음 안끼리만 안 겹치게 고른다.
- 연의에만 있는 사람(하후은 · 하후걸)도 사용자가 콕 집으면 넣는다 — 일화 · 사실 줄 · 새 판 why 에 「연의」 「정사에 이름이 없다」 를 밝히고, 출처는 위키문헌 `三國演義/第NN回`(받는 법은 삼국지와 같다), 연도 판에는 넣지 않는다. 정사 기록이 얇고 연의로 이름난 사람(왕쌍)은 사실 줄은 정사로, 능력치의 까닭에 「연의의 이름을 따랐다」 고 적는다.
- 소속이 갈리는 처사(예형 — 조조의 북 치는 관리(鼓史) · 유표 · 황조)는 군웅 `camp` 를 마지막 몸담은 무리(jing)로, `CAREER` 를 섬긴 차례(`[조위, 유표]`)로 적는다. 황제 · 폐위된 임금(조방 · 조모 · 손량)은 lord 로 두되 연도 판의 우두머리(`tianxia.json` lords · roles)는 건드리지 않는다 — 군웅록 조위의 가운데는 그대로 조조, 동오는 손권.
- casual-plan 이 90 ◆ 를 찍고도 node 가 안 끝나는 장수가 있다(육적) — 묶음 돌림(`r=$(…)`)은 끝나기를 기다리다 감시에 꺼져 출력을 잃고 「시간 넘김」 으로 보인다. 그런 장수는 node 를 뒤에서 돌려 파일로 받고, 50초쯤 뒤 끄고 파일에서 90 ◆ 를 찾는다.
3묶음 뒤쪽(2026-11-18, 촉 · 남만 · 군웅 · 연의 · 전승 25명 · `tools/batches/2026-11-18-add3b.py`)에서 알게 된 것:
- 후대 창작 · 전승 인물(관은병 · 포삼랑 · 화만 · 동백)도 사용자가 콕 집으면 넣는다 — 어느 작품에서 나왔는지(화관색전 · 경극 용봉건 · 민간 전승집)를 확인되는 데까지 사실 줄에 적고 「정사에 없음 · 전승」 이라 밝힌다(src 는 그 사람의 위키백과 중문). 정사에 한 줄이라도 있으면(관우의 딸 혼담 · 동백의 위양군 봉작) 그 줄과 전승을 나눠 적고, lore 에는 기록이나 전승의 장면만 — 지어낸 사실을 쓰지 않는다. 연도 판에는 넣지 않는다.
- 세력 열쇠가 없는 사람은 새 세력을 만들지 않고 기존 열쇠에서: 조정이 내린 자사 · 태수로 관동 맹에 든 사람(유대 · 교모)은 한복(이력 고침)의 전례대로 한조정, 군웅과 손잡은 이민족(답돈)은 손잡은 쪽, 어느 신하도 아닌 독립 부족 · 처사(가비능 · 황승언)는 재야. 연의 인물은 주인의 세력(주인이 열쇠가 없으면 그 땅을 아우른 쪽 — 유도 → 유표, 한복 → 한조정), 주인의 군웅록 대표가 그 장면보다 뒤의 일이면(공융 → 196 허도 뒤 조위) 그 장면 때의 세력(한조정)으로 — 까닭을 새 판 why 에.
- 군웅록 막사의 가운데는 군주(lord)가 여럿이면 첫 군주라, 군주 장수(유대)나 이력 고침(한복)이 들어오면 바뀔 수 있다 — `data/tianxia.json` 의 그 판 `lords` 에 우두머리를 적어 박고 까닭은 곁의 `lordsWhy` 에(군웅록 한조정 → 하진). 앞 묶음이 적은 `extra.career` 도 이력 고침으로 주인의 대표 세력이 바뀌면 따라 고친다(번능 · 우미 · 장영 → 유요). 주인 자신이 다른 막사에 있어 따라가면 혼자 떠도는 막사가 되는 사람(주흔 → 왕랑)은 그대로 둔다.
- 남방 피부(`tools/sam-design.py` 의 `SOUTH`)는 끼우기 전에 이름을 더해야 자동 외형이 받는다(고정 · 화만 · 사마가). 정사 이름과 연의 이름이 다른 사람(부사인 — 정사 사인 士仁)은 열쇠를 사용자가 부른 이름으로 두고 사실 줄에 정사 이름을 적는다.
- casual-plan 은 `--world all` 하나로 세 세계를 한 번에 돌리고, 파이썬 `subprocess.Popen(..., shell=True)` 로 띄운 뒤 `taskkill /F /T /PID` 로 끄면 fnm 아래의 node 까지 같이 꺼진다(PowerShell 감시가 필요 없다). 셋씩 나란히 돌려도 된다.

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

### 3-1. 캐릭터만의 컷 — 장수를 더하면 직업도 같이

새 장수를 설계표에 더하거나 다시 설계하면 **그 자리에서** 캐릭터만의 컷(일상컷 90번)의 직업도 같이 설계해 `data/casual-own.json` 에 적는다(사용자 2026-11-13 「삼국지도 인물 더 추가하라면 할 수 있어서 삼국지도 넣고」). 표에 줄이 없는 장수는 계획기가 이 컷을 건너뛰어 그 장수만 한 장이 빈다.
- 손으로 설계하는 장수(`designed: hand`)는 일화 하나에서 세계마다 **다른 직업**(`mode: per_world` — 관우 미염공 → 빗 가게 주인 · 궁정 머리 손질사 · 헤어 살롱 디자이너).
- 나머지는 설계표의 한 줄 일화(`lore`)에서 **직업 하나**를 세 세계에 같이(`mode: same_job` — 장소 앞에 「a Han-era / a high-fantasy / a far-future」, 의상 뒤에 세계 옷 말투). 일화가 약하면 역할(무장 · 책사 · 문관 · 군주)의 기본 방향에서, 이미 있는 직업과 겹치지 않게 `docs/casual-own-list.md` 를 훑어본 뒤 정한다.
- 줄마다 장소 글 · 하는 일 · 자세 추천 · 도구 · 노출 단계별 의상 글 셋을 다 쓰고 `node tools/casual-plan.cjs <장수> --world all` 로 90번이 짜지는지 본다. 동물 · 둘째 인물 · 실제 상표 · 작품 이름은 지시문에 쓰지 않는다(예외는 일상컷 게임 코스프레 갈래뿐 — 게임 · 캐릭터 이름을 넣는다, IMAGE_RULES 2절). 목록 파일(`docs/casual-own-list.md`)에도 한 줄 더한다.
- 직업은 설계하는 쪽이 하나로 정해 적고 사용자는 목록을 훑어 마음에 안 드는 줄만 짚는다. 사용자와 얘기하다 나온 연상이 있으면 그것을 먼저 쓴다.

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 `lib/words.js` 에서 온다. 영어 문구는 `lib/prompt-spec.js`, 외형 어휘는 `lib/look-spec.js`(`tools/port-look-spec.cjs` 가 game 표에서 만든다 — 삼국지 몫 색은 스크립트의 EXTRA 에만). `node tests/words.cjs` — 게임 파일은 이 검사 밖이다.

### 5. 그림은 이 저장소에 두지 않는다

그림 저장소는 셋이다(2026-11-12 — 사용자 「원소쪽은 다른 작업중이라 삼국지 먼저 열자.」 · 「저장소 만들고 토큰 넣었어」, 첫 저장소가 약 1.0 GB 로 찼다): 0 번 `sam-atelier-img` 는 닫힘(이미 있는 이름의 교체만 · 잠금 `records/automation/claims/` · 설계 주문 `free/` · 배경은 그대로 여기), 1 번 `sam-atelier-img-2` 도 닫힘(2026-11-18, 약 1.08 GB — 교체만), 2 번 `sam-atelier-img-3` 이 열림(2026-11-18 사용자 「원소랑 삼국지 이미지 저장소 3번 다 만들어놨으니 연결도 시켜줘」 — 둘째가 약 1.08 GB 로 찼다) — **새 그림과 그 기록은 `sam-atelier-img-3` 에 올린다**. 차례는 `lib/img.js` 의 BASES · `tools/register-images.py` 의 SHARDS · `tools/img-repos.cjs`(`IMAGE_RULES.md` 3절 「그림 저장소는 여럿이다」). 화면은 `data/img.json` 의 `where` 로 파일마다 제 저장소 주소를 찾는다. `img/` · `img-2/` · `img-3/` 는 `.gitignore`. 등록은 `그림 등록` 워크플로(`tools/register-images.py`)가 세 저장소를 받아 `data/img.json` 에 적는다 — 손으로 고치지 않는다. 게임의 `images/` 는 게임 것이라 건드리지 않는다.

### 6. 고쳤으면 적는다

파일을 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸. 날짜 · `claude` 또는 `gpt` · 무엇, 아래 줄에 파일마다 왜. `node tests/patch.cjs` 가 모양을 본다.

## 검사

```sh
node tools/casual-plan.cjs <장수> --world <세계>|all [--fresh] [--out 폴더]   # 일상컷 묶음 계획 — 세계 셋끼리 같은 장면 없이, 비어 있는 번호에(--fresh 면 옛 묶음 뒤 번호로 새 일곱 장 — 2026-11-11) 겹치지 않는 장면(정해 둔 세 갈래 — 노출 · 세계 안 · 게임 코스프레(2026-11-15, 상황 노출 자리 — 세 공방 기록 + 계획의 예약 합쳐 남은 인원 무게의 게임 · 덜 쓴 재단, 등장인물 많은 게임도 캐릭터를 계획기가 정한다 — 2026-11-16, 여자 무게 2) + 자유 설계 둘 — 옷 자유 · 갈래 자유 · 네 시대 · 장소 · 의상 · 자세 · 소품), 기록 · 지시문을 생성기 꼴로. --check 기록폴더 로 올리기 전 검사
node tools/casual-plan.cjs <장수> --recosplay <계획 파일> [--out 폴더]   # 옛 계획의 아직 안 그린 게임 코스프레 칸만 새 규칙으로(2026-11-16) · --recosplay-list 로 「계획은 있는데 안 그린 pick 칸」 보기
node tools/casual-index.cjs [--repos 그림저장소,…] [--check] && node tests/casual-index.cjs   # 일상컷 색인 data/casual-index.json(2026-11-17 — 허브 「일상컷 목록」: 컷마다 필수 갈래 · 옷 계열 · 옷 · shade · 게임 코스프레 · 자유 설계 Outfit 줄, 우리 값은 한글). 그림 등록 워크플로가 같은 자리에서 다시 쓰고 같이 커밋한다
node tests/casual-plan.cjs              # 계획기 — 장수 × 세계 × 씨앗이 규칙을 지키나
node tests/image-claim.cjs             # 잠금 도구 — 잡기 · 막기 · 풀기 · 끝(시험 저장소에서)
node tests/prompt-gpt.cjs              # 구조형(lib/prompt-gpt.js) — GPT 세션 일상컷 지시문, 생성기 지시문의 줄이 다 칸으로 옮겨지나 — 생성기 지시문의 줄이 다 칸으로 옮겨지나, 고정 화풍 · 첨부 그림 · 체형 볼륨
python3 tools/casual-check.py          # 일상컷 묶음 — 세계마다 일곱 장 중 노출 갈래 한 장 · 세계 안 갈래 한 장 · 게임 코스프레 한 장(옛 묶음은 상황 노출) · 갈래 자유 한 장(서로 다른 컷, 옛 묶음은 상황 · 갈래 자유 없이), --plan 장수 로 남은 칸 · 세계 사이 같은 장면 알림
python3 tools/sam-design.py check
python3 tools/casual-tree.py check && python3 tools/casual-tree-v2.py check
node tests/words.cjs && node tests/look-spec.cjs && node tests/patch.cjs && node tests/img-shards.cjs
python3 tests/register-images.py && python3 tests/make-thumbs.py
python3 tests/casual-tree.py && python3 tests/casual-tree-v2.py && node tests/casual-tree.cjs && node tests/casual-tree-v2.cjs
ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs     # 전장 · 목록 도감 · 화풍 비교 · 생성기, 폰 · PC(+ 도감은 폴드 커버 344×882). ONLY=dex 처럼 바꾼 화면 몫만
node tests/tianxia-data.cjs [--write]   # 천하 지도 자료 — 성 · 판도 다섯의 주인 · 근거 · 출처(--write 면 docs/TIANXIA_SOURCES.md 를 다시 뽑는다)
node tests/tianxia-core.cjs             # 천하 지도 셈 — 판도별 세력 · 막사 · 가운데(우두머리) · 결의 · 새 그림 판정 · 확인 기록
[ESM_DIR=…] CHROMIUM_PATH=<chrome> node tests/tianxia-screen.cjs   # 천하 지도 · 진영 막사 화면 — 폴드 커버 344×882 터치 · PC(포트 8797). ESM_DIR 에 preact 가 없으면 esm.sh 에서 받는다
node tests/fonts.cjs                    # 한자 도장 · 세력 기호 글꼴 줄(index.html · dex.html)에 빠진 글자
node tools/draft2-extract.cjs [--check] && node tests/draft2-data.cjs && node tests/draft2-rules.cjs   # 새 판 — 결의 · 확장팩 뽑기(draft.html 은 읽기만) · 장수 자료 · 규칙(군웅록 · 3인전 포함)
PHASER_JS=<phaser@4.2.1 dist/phaser.min.js> [IMG_DIR=<그림 사본>] [SHOT_DIR=<폴더>] node tests/draft2-screen.cjs   # 새 판 한 판 끝까지(폰 · PC, 포트 8790)
```
