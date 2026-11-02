# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-11-02` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-11-02 · claude · 그림 구조 개편 — 도감 · 생성기 · 설계표(세계 셋 여성 의인화)
- data/sam-design.json · tools/sam-design.py — 사용자 「기존 게임은 그대로 두고, 이미지 구조도 개편. 도감 따로, 삼국시대풍 · 서양 중세 판타지풍 · 메카풍으로 여성의인화」. 장수 279 를 게임 표(C · LORE · SEAL)에서 받고(게임은 읽기만), 세력 넷의 팔레트 · 세계 글 · 장면 셋, 역할 넷의 세계 차림 · 물건, 첫 묶음 13 명 손 설계 · 나머지 자동 설계(세력 팔레트 · 역할 · 돌림). seed · check.
- lib/prompt-spec.js · lib/prompt-sam.js · lib/look-spec.js · tools/port-look-spec.cjs — 원소 공방의 표 · 조립기를 장수 한 카드로. 세계 셋 차림 꼬리 · 과감 노출 세계마다, SIGNATURE ITEM, 깃발 · 인장 한 글자만, 말 · 짐승 없음. 삼국지 몫 머리색 열(칠흑 · 먹빛 녹음 · 밤색 …).
- data/casual-tree.json · data/casual-tree-v2.json · tests/casual-tree* — 일상컷 트리의 「쓰임의 현장」 을 「역사의 자리」 열 곳(박물관 · 대장간 · 잔도 · 적벽 · 성벽 · 찻집 · 무후사 · 누각 · 옛거리 · 한푸 사진관)으로, 소품 넷(죽간 · 호리병 · 깃털 부채 · 종이 등), 「나라 안」 → 「세계 안」.
- prompt.html · lib/studio.js · lib/words.js · lib/workspace-*.js · lib/room.css · lib/sam.css — 생성기는 세력 › 장수 › 갈래 › 단계. 공간 이름 · 문양을 삼국지로, 저장 열쇠 samguk_*.
- dex.html — 새 도감: 세력 넷 · 역할 차례 · 장수마다 세계 셋 · 능력치 · 일화 · 이름 찾기(한글 · 병음 · 성씨) · 그림 있는 것만 · 크게 보기 · 즐겨찾기(a: samguk).
- lib/img.js · tools/register-images.py · tools/make-thumbs.py · tools/roster.py · .github/workflows/register-images.yml · data/img.json — 그림 저장소 sam-atelier-img 로 등록 자동화. 한글 파일 이름이 git 이력에서 갇히지 않게 core.quotepath 를 끈다.
- tests/screen.cjs · tests/words.cjs · tests/look-spec.cjs · tests/register-images.py — 도감 · 생성기 화면(폰 · PC), 게임 파일은 낱말 검사 밖.
- AGENTS.md · CLAUDE.md · IMAGE_RULES.md · README.md — 자리와 규칙.
