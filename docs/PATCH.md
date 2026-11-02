# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-11-02` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-11-02 · claude · 그림 저장소 sam-atelier-img 시작 · 첫 등록 아홉
- data/img.json — 사용자 「그림 저장소 만들었어」. 그림 저장소에 뼈대(README · 썸네일 워크플로 · records)와 관우 세계 셋 · 일상컷 셋(참고 그림 = 그 세계 그림, ref_sha256) · 조조 세계 셋을 webp 로 올리고(원본 PNG 는 기록에 sha256 만, 조조 판타지는 필터 재시도 1회 기록), 등록기로 적었다. 썸네일 워크플로가 img/thumb/ 아홉을 만들어 되커밋했다.

## 2026-11-02 · claude · 관우 일상컷 시험 — 세계 안 어색한 조합 · 판타지 · 메카 글자
- data/casual-tree-v2.json — 시험 계획에서 수도원 도서관 + 수건 두른 목욕 차림이 나왔다. 어색한 조합(⚠)에 「목욕 차림 · 수영복으로 세계의 서재 · 군영 · 부엌 · 연무장 · 시장 · 광장」 을 더했다.
- lib/prompt-sam.js · lib/prompt-spec.js — 메카 일상컷 벽에 關 이 걸렸다. 일상컷의 「읽혀도 되는 글자」 도 삼국시대만 한 글자, 판타지 · 메카는 문장 · 휘장 모양(CHARS.none). 관우 일상컷 셋(객잔 울 코트 · 수도원 도서관 홀터 드레스 · 전망 갑판 칼럼 가운)은 참고 그림의 그 사람으로 나왔다.

## 2026-11-02 · claude · 일상컷 「세계 안」 을 폼(세계)에 맞게 — 장소 열하나, 세계마다 다른 곳
- data/casual-tree.json · data/casual-tree-v2.json — 사용자 「일상컷에 시대 역사의 자리를 각 폼의 시대에 맞게 수정하거나 갈래 하나를 추가하는게 어떨까」 → 추천안(「세계 안」 을 키우고 「역사의 자리」 는 현대 유적 나들이로 둔다). 세계 안 장소 일곱에 worlds.<세계>(ko · en) — 방: 비단 휘장 침소 · 성탑 침실 · 승무원 선실, 여관: 객잔 · 선술집 · 정거장 바 …. 장소 넷을 더했다 — 서재(죽간 서재 · 수도원 도서관 · 함내 자료실) · 군영(군막 · 기사단 숙영지 · 격납고 대기실) · 부엌(객잔 부엌 · 성 부엌 · 함내 식당) · 연무장(연무장 · 기사 훈련장 · 시뮬레이터실), 받침 · 하는 일 · 소품은 닮은 장소(도서관 · 주방 · 체육관)에서 이었다. 공용 모듈은 그대로.
- lib/prompt-sam.js · lib/studio.js — Place 줄과 생성기 장소 이름이 참고 그림의 세계 몫을 쓴다.
- tests/casual-tree-v2.cjs · IMAGE_RULES.md — 세계 안 장소 열하나 · 세계마다 다른 글.

## 2026-11-02 · claude · 관우 책 줄 · 메카 배경을 우주 · SF 로
- data/sam-design.json — 관우 삼국시대 성정의 「등불 아래 춘추를 읽는다」 가 두 번 다 책을 손에 쥐게 해(청룡도와 두 손이 바빴다) 「허리에 매단 춘추 죽간 장신구(손에 들지 않음)」 으로. 사용자 「메카쪽은 배경을 좀 더 sf 쪽이나 우주쪽으로」 — 네 세력의 메카 세계 글 · 장면 셋을 우주로: 위 궤도 요새 · 함대, 촉 옥빛 위성의 돔 도시 · 고리 행성 · 궤도 엘리베이터, 오 바다 행성 궤도의 항모 · 조선소, 군웅 무법 소행성대 · 난파선 · 보라 성운.
- lib/prompt-spec.js — 메카 꼬리에 「먼 미래 SF 배경 — 우주 정거장 · 우주선 · 행성 · 성운, 동양 전통 건축 · 탑 · 기와 · 석등 없음」(전에는 안개 분지에 탑과 석등이 섰다). 다시 뽑은 관우 두 장 — 책 없음, 고리 행성 · 돔 · 우주선.

## 2026-11-02 · claude · 기본 화풍 kr_mmorpg v3 · 체형 볼륨과 굴곡
- data/style.json — 사용자 「v2를 기본으로 해주는데 체형을 전체적으로 볼륨감과 굴곡감이 느껴지게」. 기본을 kr_mmorpg 로, v3 은 v2 의 「elegant elongated proportions」(몸을 가늘게 당길 수 있다)를 「긴 다리 · 가는 허리 위에 가슴 · 골반 · 허벅지의 둥근 볼륨, 마르거나 납작하지 않게」 로.
- data/sam-design.json · tools/sam-design.py — 체형을 굴곡 여덟 갈래로만. 아담 → petite_curvy · 장신 · 마른 장신 → tall_curvy · 건장 → strong_curvy · 애슬레틱 → curvy_athletic 으로 60명을 옮겼고(관우 · 여포 · 사마의 · 하후돈 · 조운 포함), 자동 설계 돌림도 그 여덟에서만. check 가 다른 체형을 막는다.
- tools/port-look-spec.cjs · lib/look-spec.js — 삼국지 몫 체형 셋(tall_curvy · strong_curvy · petite_curvy), busty_slender 에 둥근 골반.
- tests/screen.cjs · AGENTS.md · IMAGE_RULES.md — 기본 화풍이 바뀐 것.

## 2026-11-02 · claude · 화풍 kr_mmorpg v2 — 화풍 줄을 앞으로, 무협풍 · 천상풍은 의상 · 장면 줄로
- data/style.json — v1 은 화풍 줄이 지시문 가운데(600낱말 뒤)에 묻혀 글로시와 거의 같았다. v2: 「게임 엔진 3D 모델 · 손으로 칠한 질감 · 셀 음영 아님」 으로 렌더를 못 박고 lead(개념 줄 바로 뒤), 세계 몫은 costume(WORLD 줄 끝 — 삼국시대 비단 띠 · 비치는 치마, 판타지 깃털 · 금 날개 장식 · 비치는 덧치마) · scene(MOOD 줄 — 무협풍 · 천상풍 · 메카 블룸). 관우 세 장 — 얼굴이 더 매끈한 반실사로, 판타지에 깃털 날개 장식 · 후광, 판타지 첫 시도는 안전 필터(sexual)에 막혀 같은 지시문 재시도로 통과.
- lib/prompt-sam.js — styleRow · lead · worlds.<세계>.costume · scene 을 읽는다(다른 화풍은 그대로 뒤에).

## 2026-11-02 · claude · 화풍 kr_mmorpg 시험 — 한국 MMORPG 프로모 렌더
- data/style.json — 사용자 「한국형 글로시를 한국 MMORPG 스럽게(아이온 · 블레이드앤소울 같이)」. 게임 이름은 넣지 않고 특징(반실사 3D 프로모 렌더 · 도자기 피부 · 촘촘한 세공 장식 · 윤곽광 · 빛 입자)만 적은 kr_mmorpg v1. 판의 worlds 덧줄로 삼국시대는 무협풍, 중세 판타지는 천상풍. 관우 세 세계 시험 — 피부 광택 · 반실사 얼굴은 늘었지만 차이는 작고, 천상풍(파스텔 · 날개 장식 · 입자)은 거의 안 나왔다.
- lib/prompt-sam.js — styleText 가 판의 worlds.<세계> 덧줄을 세계 그림에 붙인다.

## 2026-11-02 · claude · 관우 시험 — 판타지 · 메카가 삼국시대를 닮던 것, 화풍 글로시 더함
- lib/prompt-spec.js · lib/prompt-sam.js — 관우 세 세계 × 두 화풍 시험(사용자 「3가지 시대별로 2.5d · 한국형 글로시 하나씩」)에서 판타지가 한푸풍 장포 · 蜀 깃발 · 중국 산수로, 메카가 장포 위 다리만 기계로 나왔다. 세력 한자 · 깃발 한 글자는 삼국시대만(판타지는 문장 그림, 메카는 휘장 모양 — TEXT_RULE), 판타지 꼬리에 서양 옷 · 서양 유럽 배경을 못 박고(한푸 소매 · 장포 · 기와지붕 · 한자 깃발 금지), 메카 꼬리에 「목부터 발까지 장갑, 천 장포 없음, 망토도 판」. 장수 worlds.<세계>.traits 로 그 세계에만 붙는 성정 덧줄.
- data/sam-design.json — 관우 · 제갈량의 삼국시대 몫 성정(초록 전포 · 춘추 / 학창의)을 worlds.samguk.traits 로 떼고, 촉의 판타지 세계 글 · 장면을 서양 고원 왕국(회색 돌 성 · 알프스풍 · 용 문장)으로. 다시 뽑은 판타지 · 메카 넷은 의도대로 갈렸다.
- data/style.json — 게임 공방의 glossy_kr_game v1 을 비교용 화풍으로 더했다(기본은 game_keyart 그대로).
- tools/sam-design.py — worlds.<세계>.traits 칸을 본다.

## 2026-11-02 · claude · 그림 구조 개편 — 도감 · 생성기 · 설계표(세계 셋 여성 의인화)
- data/sam-design.json · tools/sam-design.py — 사용자 「기존 게임은 그대로 두고, 이미지 구조도 개편. 도감 따로, 삼국시대풍 · 서양 중세 판타지풍 · 메카풍으로 여성의인화」. 장수 279 를 게임 표(C · LORE · SEAL)에서 받고(게임은 읽기만), 세력 넷의 팔레트 · 세계 글 · 장면 셋, 역할 넷의 세계 차림 · 물건, 첫 묶음 13 명 손 설계 · 나머지 자동 설계(세력 팔레트 · 역할 · 돌림). seed · check.
- lib/prompt-spec.js · lib/prompt-sam.js · lib/look-spec.js · tools/port-look-spec.cjs — 원소 공방의 표 · 조립기를 장수 한 카드로. 세계 셋 차림 꼬리 · 과감 노출 세계마다, SIGNATURE ITEM, 깃발 · 인장 한 글자만, 말 · 짐승 없음. 삼국지 몫 머리색 열(칠흑 · 먹빛 녹음 · 밤색 …).
- data/casual-tree.json · data/casual-tree-v2.json · tests/casual-tree* — 일상컷 트리의 「쓰임의 현장」 을 「역사의 자리」 열 곳(박물관 · 대장간 · 잔도 · 적벽 · 성벽 · 찻집 · 무후사 · 누각 · 옛거리 · 한푸 사진관)으로, 소품 넷(죽간 · 호리병 · 깃털 부채 · 종이 등), 「나라 안」 → 「세계 안」.
- prompt.html · lib/studio.js · lib/words.js · lib/workspace-*.js · lib/room.css · lib/sam.css — 생성기는 세력 › 장수 › 갈래 › 단계. 공간 이름 · 문양을 삼국지로, 저장 열쇠 samguk_*.
- dex.html — 새 도감: 세력 넷 · 역할 차례 · 장수마다 세계 셋 · 능력치 · 일화 · 이름 찾기(한글 · 병음 · 성씨) · 그림 있는 것만 · 크게 보기 · 즐겨찾기(a: samguk).
- lib/img.js · tools/register-images.py · tools/make-thumbs.py · tools/roster.py · .github/workflows/register-images.yml · data/img.json — 그림 저장소 sam-atelier-img 로 등록 자동화. 한글 파일 이름이 git 이력에서 갇히지 않게 core.quotepath 를 끈다.
- tests/screen.cjs · tests/words.cjs · tests/look-spec.cjs · tests/register-images.py — 도감 · 생성기 화면(폰 · PC), 게임 파일은 낱말 검사 밖.
- AGENTS.md · CLAUDE.md · IMAGE_RULES.md · README.md — 자리와 규칙.
