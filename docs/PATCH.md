# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-11-02` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-11-08 · claude · 일상컷 데니어(옷의 비침) — 노출과 따로, 랜덤
- 사용자 「데니어 설정값 넣어서 랜덤하게 설정될 수 있게 해줘. 기존 노출설정값 과는 별개로」 — 장료 오프숄더 니트 25D(은은함) · 조운 가죽 이너 25D(가슴까지 비침) 시험을 보고 상의 40 · 60 · 80, 타이츠 25 · 40 · 60, 가슴 · 골반 불투명 안감.
- lib/prompt-spec.js CASUAL.deniers · denierLine · denierFit · denierSkip, lib/prompt-sam.js denierFits · Outfit 줄 끝. 생성기(lib/studio.js) 「데니어」 단계, tools/casual-plan.cjs denierize(닿는 옷 컷 열에 여섯, 묶음 안 갈래 돌림, 따로 된 난수), tools/prompt-pack.cjs casual.<자리>.denier(none 이면 뺀다).
- 검사 casual-plan — 닿는 옷에만 · 줄 꼴 · 비율. ?v= words 13 · prompt-spec 9 · prompt-sam 7 · studio 7. 문서 IMAGE_RULES 2절.

## 2026-11-08 · gpt · 순욱 판타지 일상 4번을 새 구도로 완성
- data/img.json — 등록기로 kr_promo_hikey 판타지 casual4 추가. 세계컷 3장과 세계별 일상 5장씩 총 18장으로 빈 자리 해소.
- sam-atelier-img img/·records/순욱/ — 사용자 「막힌거 다른구도로 다시 해줘」에 따라 뒷모습 환경샷을 향로를 바라보며 걷는 옆모습 전신샷으로 변경. 새 구도와 동일 원문 재시도도 이미지 미반환으로 막혀, 생성기 의상을 니트·플리츠 미디스커트로 바꾸고 low 설정 유지 후 첫 반환. 기존 완성 이미지·중단 기록·앞 계획 보존.
- 검사 — 실제 판타지 5장 묶음의 필수 갈래·먼/가까운 구도·향로·세계 사이 장소/의상/구도 중복 검사 통과. 양궁장 배경의 활·화살은 무기 없음 규칙과 차이가 있어 qa.passed=false로 그대로 기록.

## 2026-11-08 · gpt · 순욱 선택 세계컷 3장과 일상컷 14장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국1·판타지2·메카2 선택 세계 그림 3장과 일상컷 14장 추가. 삼국·메카 일상은 각 5장, 판타지는 1·2·3·5번 4장. 기존 설계와 앞 화풍 그림·기록 보존.
- sam-atelier-img img/·records/순욱/ — WebP 17장, 원본·참조·프롬프트 해시, 사용자 선택, 생성 실패와 장면 변경 이력, AI 검수 기록. 반환된 이미지는 재생성하지 않음. 판타지 일상 4번은 원문·동일 원문 재시도·moderate·low·계획기 장면 변경 1회 모두 이미지 미반환으로 blocked.
- 검사 — 세 세계의 5칸 계획은 필수 갈래·장소/구도/의상 중복 검사 통과. 실제 삼국·메카 5장 묶음 통과. 실제 판타지 4장은 미완료 컷 때문에 먼 구도와 물건을 든 컷 요건 미충족 상태로 기록. 구도·의상·장식 등 계획과 다른 반환 결과는 qa.passed=false로 보존.

## 2026-11-08 · claude · 노출 줄 「가슴 · 골반 가림」 → 「중요 부위 가림」
- 사용자 「가슴 골반 가리라는 문구가 세게 작용하는거 같은데. 그거보단 중요부위 가리는걸로 수정해야 될 거 같아」.
- lib/prompt-spec.js — 세계 과감 노출 셋 · 일상컷 노출 축(먼 컷 · 가까운 컷 · 보통)의 「Chest and pelvis covered」 · 「chest covered」 를 「Intimate areas covered」 로, 한글 풀이도 「중요 부위」. lib/prompt-sam.js — exposureLine 이 외형 표(game 그대로 옮긴 look-spec)의 글도 나갈 때 바꾼다(intimate).
- lib/words.js 생성기 노출 풀이(보통 · 과감 — 메카 두 곳 열기도). 옛 구조판(glossy_kv 등) 글은 그대로. ?v= prompt-spec 8 · prompt-sam 6 · words 12. 문서 IMAGE_RULES 2절.

## 2026-11-08 · claude · 메카 과감 노출을 장수마다 두 곳만
- 사용자 「세계컷 메카는 한번에 너무 많이 연거 같으니, 랜덤적으로 몇 군데만 여느식으로 설계 변경을 하자」 — 네 곳(어깨 · 위팔 / 가슴 창 / 허리 / 허벅지) 가운데 장수 · 세계마다 두 곳만, 나머지는 장갑 그대로.
- lib/prompt-spec.js 메카 exposureOpen · exposureOpenN(2) · exposureOpenTpl, lib/prompt-sam.js exposureOpenOf(열쇠 해시 — 같은 장수는 늘 같은 곳) · exposureLine 에 장수 열쇠. 장수 279명에 조합 여섯이 40~52명씩.
- 검사 prompt-v2 — 장수마다 두 곳 · 늘 같은 곳 · 노출 줄에 고른 곳만 · 조합 여섯 다. ?v= prompt-spec 7 · prompt-sam 5. 문서 IMAGE_RULES 2절.

## 2026-11-08 · claude · GPT 세션 — 노출은 세션이 줄이지 않는다 · 검수에 노출
- 사용자 「이거 gpt세션에서도 해봐야돼 거기선 의도적으로 줄이는거 같아」 — 기록(장수 126자리)을 보니 낸 지시문 sha256 은 생성기 글과 다 같고, 노출을 낮춘 8자리는 모두 안전 필터 거절 뒤였다. 남는 건 image_gen 쪽 출력이 지정보다 약하게 나오는 것.
- docs/IMAGE_AUTOMATION.md 4절 — 검수에 「노출이 지정대로인가」(qa.exposure: match · weaker · stronger), weaker 면 같은 지시문으로 한 번 다시(다시 그리는 것 여섯 가지로), 「노출은 세션이 줄이지 않는다 — 막혔을 때만 1절 순서」. 7절 qa 꼴에 exposure.
- 지시문 묶음 INDEX.md 첫머리에 같은 줄 — tests/prompt-gpt.cjs 가 막는다.

## 2026-11-08 · claude · 노출 문장이 먹게 — 메카 전용 과감 노출 · 일상컷 「많이」 강화
- 사용자 「요즘에는 의상 노출을 명시해놔도 잘 안먹는 느낌이야」 → 「응 일상컷에도 손 봐줘」 — 장료 · 손권 메카가 bold 인데 가슴 창 하나뿐이었다(공용 문장 + 「목부터 발끝까지 장갑」).
- lib/prompt-spec.js — 메카 exposureBold(설계로 열린 장갑: 맨 어깨 · 위팔 · 깊은 가슴 창 · 맨 허리 · 맨 허벅지), 메카 의상 줄 「EXPOSURE 가 여는 곳 말고는 장갑」, 무협 · 판타지 과감 문장 끝을 「재질 · 색은 그대로」 로.
- 일상컷 skin_exposure bold — 먼 컷 「고른 옷을 가장 과감한 꼴로(깊은 목선 · 맨 어깨 · 짧거나 등 트인 재단 · 짧은 단 · 높은 트임)」, 가까운 컷은 크롭 안에서만 같은 말. 장료 시험 네 장(메카 세계가 크게 열림, 니트 컷 목선 · 허리). ?v= prompt-spec 6. 문서 IMAGE_RULES 2절.

## 2026-11-08 · claude · 프롬프트 임의 수정 금지 — 이미지 모델에도 똑같이
- 사용자 「생성룰에 지정된 변경사유 외 프롬포트 임의수정 금지, 이미지 모델에도 동일 이라고 써줘」 — IMAGE_RULES 1절에 규칙 줄(고쳐도 되는 사유: 안전 필터 순서 · 사용자가 직접 시킨 수정 · 덧붙임 칸 뒤 build, 그 밖엔 낱말 하나도 안 고침, 이미지 모델에도 파일 글 그대로 · 고쳐 쓰지 않게, 사유는 기록에).
- docs/IMAGE_AUTOMATION.md 3절 · 지시문 묶음 INDEX.md 첫머리에 같은 줄 — tests/prompt-gpt.cjs 가 INDEX 글을 막는다.

## 2026-11-08 · gpt · 초선 선택 세계컷 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩 추가. 사용자 선택 삼국2·판타지1·메카2이며 기존 초선 설계와 앞 화풍 그림을 보존.
- sam-atelier-img의 img/·records/초선/ — WebP 18장·생성기 원문·화풍별 별도 계획·참조/원본 해시·AI 검수·세계컷 선택 기록. 일상컷 15장 모두 첫 호출에서 반환되어 재시도·노출 변경·재생성 없음. 세계컷 판타지 1번은 최초 미반환 뒤 동일 지시문 재시도 성공. 반환 이미지는 보존했으며 계획과 다른 의상·구도·프레이밍 7장은 qa.passed=false로 기록. 새 화풍의 세 세계 필수 갈래·장소/구도/의상 중복 검사 통과.

## 2026-11-08 · gpt · 감녕 선택 세계컷 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩 추가. 사용자 선택 삼국2·판타지1·메카2이며 기존 감녕 설계와 앞 화풍 그림을 보존.
- sam-atelier-img의 img/·records/감녕/ — WebP 18장·생성기 원문·화풍별 별도 계획·참고/원본 해시·AI 검수·세계컷 선택 기록. 15개 일상컷 모두 첫 호출에서 반환되어 재시도·노출 변경·재생성 없음. 원본 장식 잔존, 계획과 다른 자세·구도, 항구 배경의 새·문자, 메카 패널 질감 등 확인된 차이는 qa.passed=false로 기록. 세 세계의 계획·필수 갈래·장소/구도/의상 겹침 검사 통과.

## 2026-11-08 · gpt · 조운 선택 세계컷 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 각 세계 일상컷 다섯 장씩 추가. 사용자 선택은 삼국1·판타지1·메카1이며 기존 화풍과 조운 설계를 보존.
- sam-atelier-img의 img/·records/조운/ — WebP 18장·생성기 원문·화풍별 계획·참조/원본 해시·거절 시도·AI 검수 기록. 반환된 이미지의 노출 검열 재생성 없음. 미반환 컷에만 규칙의 재시도·노출 축소를 적용했고 메카 일상1은 불투명 수면복으로 변경. 배경 인물·손 방향·시선·여백 차이는 qa.passed=false로 기록. 계획 검사는 생성 시작 버전 44885f6 기준으로 세 세계 모두 통과했으며, 작업 중 추가된 옷 중복 금지·색 배정·세계별 무기 규칙 이전에 생성된 그림은 보존.

## 2026-11-08 · claude · 일상컷 같은 옷 세계끼리 금지 · 판타지 무기 금속 자루 · 마법 빛
- 사용자 「무협에서 니트 상의했으면 메카에서도 …」 → 「응 막아줘」 — tools/casual-plan.cjs check 가 다른 세계 · 다른 묶음과 같은 옷(item, 옷 없이 계열만이면 그 계열 — 평상복 계열 자체는 빼고)을 막는다. 장소 · 구도 금지에 옷을 더했다. 검사 casual-plan — 같은 옷을 잡고, 세 세계 새 묶음끼리 같은 옷이 없다.
- 사용자 「위에 판타지 무기 설정 추가도 해줘」 — 관우 시험에서 자루가 나무로 남았다. 판타지 sigForm 에 「자루 · 손잡이까지 룬 새긴 금속(맨 나무 없음) · 날과 룬을 따라 은은한 마법 빛」. ?v= prompt-spec 5.

## 2026-11-08 · gpt · 장료 선택 세계 그림 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩 추가. 사용자 선택은 삼국1·판타지1·메카2이며 기존 화풍과 장료 설계 보존.
- sam-atelier-img의 img/·records/장료/ — WebP 18장·생성기 원문·세계별 계획·참조 및 원본 해시·검수 기록. 반환 이미지는 재생성하지 않았으며, 이미지 미반환 컷에만 규칙의 재시도·노출 단계·계획기 재계획 적용. 지시와 다른 구도·문자·소품은 qa.passed=false로 기록. 현 화풍의 세 세계 계획 검사와 겹침 검사 통과.

## 2026-11-08 · claude · 판타지 · 메카 세계 그림의 무기를 그 세계 것으로
- 사용자 「무기 이미지가 판타지랑 메카에서 좀 더 그쪽 세계 느낌이 났으면 좋겠어」 — SIGNATURE 줄이 「in the form this WORLD gives it」 한마디뿐이라 판타지 · 메카에서도 삼국지 무기 그대로 나왔다.
- lib/prompt-spec.js WORLDS 판타지 · 메카에 sigForm — 판타지: 같은 갈래 · 실루엣의 서양 판타지 물건(강철 · 미스릴 · 룬 · 보석 날밑 · 문장 장식, 중국식 장식 · 술 · 한자 없음). 메카: 같은 갈래 · 실루엣의 미래 하이테크 무장(합금 판 · 기계 관절 · 에너지 날 · 발광 코어는 발광선 색, 나무 · 술 · 청동 없음).
- lib/prompt-sam.js — 줄 꼴 판의 SIGNATURE 줄과 kv 판 3절 「Her signature item — … —」 에 붙인다. 삼국시대 · 일상컷 장신구는 그대로. ?v= 올림(prompt-spec 4 · prompt-sam 4). 문서 IMAGE_RULES 2절.

## 2026-11-08 · claude · 일상컷 옷 색 갈래 — 생성기 단계 · 묶음 도구가 다섯 장에 다르게
- 사용자 「일상컷 생성 옵션에 의상색 관련 다양성은 없었나?」 → 「응 넣어줘」 — 옷 295개 중 색이 이름에 박힌 건 48개뿐이라 나머지는 모델이 흰 · 아이보리 · 베이지로 몰렸다.
- lib/prompt-spec.js CASUAL.colors 여덟 갈래(파스텔 · 비비드 · 어스톤 · 모노톤 · 주얼톤 · 데님 · 무늬 · 뉴트럴) · colorLine · colorFixed(색 · 무늬가 박힌 옷 판정). lib/prompt-sam.js — Outfit 줄 끝에 색 갈래, 박힌 옷은 그대로(P.colorFixed).
- 생성기(lib/studio.js) 「옷 색」 단계 — 안 고르면 옷 제 색, 다 랜덤이면 대개 하나. tools/casual-plan.cjs colorize — 한 묶음 안 서로 다른 갈래, 있는 컷 · 다른 세계 묶음 갈래는 뒤로. tools/prompt-pack.cjs settings casual.<자리>.color.
- 검사 casual-plan — 묶음 안 갈래 겹침 없음 · 색 줄 · 박힌 옷엔 없음. ?v= 올림(words 11 · prompt-spec 3 · prompt-sam 3 · studio 6). 문서 IMAGE_RULES 2절.

## 2026-11-08 · gpt · 손권 선택한 세계 그림 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩 추가. 사용자가 삼국 1번·판타지 2번·메카 2번을 선택한 뒤 진행했으며 기존 화풍과 인물 설계를 보존.
- sam-atelier-img의 img/·records/손권/ — WebP 18장·생성기 원문·참조/원본 해시·AI 검수 기록. 새 화풍 계획은 화풍 열쇠를 붙인 별도 파일로 보존. 반환된 이미지의 노출 검열 재생성 없음. 이미지가 반환되지 않은 삼국 일상1만 규칙의 재시도·노출 단계·계획기 재계획을 거쳤고 메카 일상2는 동일 지시문 재시도로 확보. 구도·표정·배경 글자 등 계획과 다른 결과는 qa.passed=false로 기록.

## 2026-11-08 · gpt · 유비 판타지 일상 1번 다리 방향 수정
- sam-atelier-img의 img/·records/유비/·records/replacement.json — 사용자가 지적한 화면 왼쪽 다리·신발 방향 오류를 양발을 디딘 정지 구도로 교체. 얼굴·의상·아이스크림·축제 배경을 유지하고 다리 관절과 발끝·뒤꿈치 방향을 시각 검수. 이전 WebP·원본·썸네일 해시와 기록 보존, 해당 썸네일만 재생성.
- records/유비/fantasy-casual-plan.json — 요청한 구도와 생성기 선택값을 기록. 양다리와 신발을 확인할 전신 구도를 우선하여 묶음의 full_body 1회 제한은 2회가 된 예외를 명시. 같은 파일 교체라 data/img.json은 등록 검사에서 변경 없음.

## 2026-11-08 · gpt · 유비 선택한 세계 그림 3장과 일상컷 15장 등록
- data/img.json — 등록기로 kr_promo_hikey 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩 추가. 사용자가 세계별 후보 2번을 선택한 뒤 진행했으며 기존 화풍과 인물 설계 보존.
- sam-atelier-img의 img/·records/유비/ — WebP 18장·원문 프롬프트·세계별 계획·참조/원본 해시·AI 검수 기록. 반환 이미지의 검열 재생성 없음. 파일이 반환되지 않은 두 칸만 규칙의 재시도·노출 단계·계획기 재계획을 거쳤고, 자세·의상 등 계획과 다른 결과는 qa.passed=false로 명시.

## 2026-11-08 · gpt · 조조 프로모 하이키 세계 그림 3장과 일상컷 15장
- data/img.json — 등록기로 kr_promo_hikey의 삼국시대·판타지·메카 세계 그림과 세계별 일상컷 다섯 장씩을 추가. 기존 화풍 그림과 조조 설계는 보존.
- sam-atelier-img의 img/·records/조조/ — WebP 18장·생성기 원문·세계별 계획·참조 및 원본 해시·거절 재시도·AI 검수 기록. 의상·배경·자세가 계획과 다른 컷은 qa.passed=false와 원인을 기록.

## 2026-11-08 · claude · 세계 그림 뒤 멈추고 고른 뒤 일상컷 — 화풍이 무엇이든
- 사용자 「gpt에 생성룰 대로 하라고 했는데, 세계컷 생성 후 되묻는거 없이 바로 일상컷으로 가네?」 — 「세계마다 2~3장 → 사용자가 고른 뒤 일상컷」 줄이 kv_kmmo_lock 판 몫으로만 적혀 있어 기본이 kr_promo_hikey 로 바뀐 뒤 GPT 세션이 건너뛰었다.
- IMAGE_RULES 1절 — 이 규칙을 모든 화풍으로, 세계 그림을 다 뽑으면 멈추고 묻는다(고르기 전엔 일상컷도 올리기도 안 함). IMAGE_AUTOMATION 0절 — 「묻지 않고 올린다」 의 예외로 적었다.
- 지시문 묶음 INDEX.md 첫머리에 「세계 그림 → 멈춤 → 일상컷」 — GPT 세션이 묶음만 보고도 멈추게. tests/prompt-gpt.cjs 가 막는다.

## 2026-11-08 · claude · 기본 화풍을 새 열쇠 kr_promo_hikey 로 — 옛 kr_mmorpg 그림과 안 겹치게
- 사용자 「기존 이미지 있으니까 새화풍키로 만들어줘. 이전 이미지랑 안겹치게」 — kr_mmorpg 의 v6 을 새 열쇠 kr_promo_hikey(한국 MMORPG 프로모 하이키) v1 으로 떼어 내 기본으로. 파일 이름 · 도감 자리 · 그림 작업 잠금이 옛 kr_mmorpg 그림(v1~v4, 장수 42명)과 겹치지 않는다.
- kr_mmorpg 는 current 를 v4(옛 그림의 판)로 되돌렸다 — v5 · v6 은 기록으로 남는다.
- 검사 prompt-v2 의 v6 칸 검사는 kr_promo_hikey 로, kr_mmorpg 는 v4 인지. 문서: IMAGE_RULES · AGENTS · STYLE_LAB(새 줄) · IMAGE_AUTOMATION.

## 2026-11-08 · claude · 기본 화풍을 한국 MMORPG 프로모(kr_mmorpg v6)로
- 사용자 「mmorpg 프로모로 기본 화풍 해줘」 — data/style.json 의 default 를 kv_kmmo_23d 에서 kr_mmorpg(v6)로. 생성기 · 도감 · 묶음 도구 · 그림 작업 잠금이 이 화풍을 기본으로 쓴다.
- GPT 세션 묶음(tools/prompt-pack.cjs) — 화풍 칸이 붙는 판(worldTail)의 세계 그림, 일상컷 묶음(casualKit)이 있는 판의 일상컷은 영문 지시문 그대로 낸다(옛 구조형은 피부색 · 조명 칸을 못 옮기고, 화풍 글 · 설계 얼굴을 버린다).
- 검사 — prompt-v2 의 기준 판(kv 꼴) 검사는 kv_kmmo_23d 로 고정, casual-plan 은 casualKit 판 일상컷 꼴, prompt-gpt 는 기본 판이 영문 그대로인지, screen 도감 화풍 고르개는 기본이 아닌 첫 화풍으로.
- kv_kmmo_23d 로 올린 그림은 그대로 — 도감 화풍 고르개에서 따로 본다. 문서: IMAGE_RULES · AGENTS · STYLE_LAB · IMAGE_AUTOMATION.

## 2026-11-08 · claude · 한국 MMORPG 프로모 v6 — 세계 그림 하이키
- 사용자 「이렇게 수정해줘」 — kr_mmorpg v6 = v5 + 세계 그림: STYLE 의 캐릭터 선택창 조명 문장(강한 림 라이트) · 무협 MOOD 의 high contrast 빼고, 끝에 kv_cgi_hikey 의 SKIN COLOUR AND RENDERING(설계 피부색) · LIGHTING AND COLOUR(시간대 고르면 장면 빛에) · CAMERA AND COMPOSITION(worldTail — lib/prompt-sam.js build 가 줄 단위 판 끝에 붙인다). 일상컷 묶음은 v5 그대로.
- 시험(사마의 무협 둘 + 일상컷 넷)과 같은 지시문임을 확인. 검사 prompt-v2(장수 279 × 세계 3, 맹획 청동 피부), prompt-gpt 는 줄 단위 꼴 시험이라 kr_mmorpg v4 로 고정.

## 2026-11-08 · claude · 한국 MMORPG 프로모 v5 — 일상컷 묶음
- 사용자 「mmorpg 프로모에 일상컷 규칙을 지금 처럼 추가해서 테스트 이미지 만들어줘」 — kr_mmorpg v5 = v4 + casualKit(kv_cgi_hikey 와 같은 꼴): STYLE 은 이 화풍 일상컷 글의 렌더링만(몸 · 조명 · 번들거림 말 빼고), FACE 끝에 설계 얼굴, SKIN 설계 피부색 칸, LIGHT 하이키. 세계 그림 지시문은 v4 와 글자 하나 같다.
- 시험 — 사마의 프로모 세계 그림 셋에 근접 · 원거리 여섯(화풍 비교 2026-11-08-2 와 같은 장면).

## 2026-11-08 · claude · kv_cgi_hikey 일상컷 묶음(casualKit)
- 사용자 「skin,light는 바꿔주고, style은 지시문 쪽, 얼굴묘사는 지시문 쪽인데 원래 케릭터의 설계 외형으로. body line은 지금 공방 유지」 — 화풍 판에 casualKit(style · face · skin · light)이 있으면 일상컷이: STYLE 은 「첨부 그림 그대로」 대신 그 화풍 글, FACE 줄은 피부결 금지 문장을 빼고 끝에 설계 얼굴(얼굴 목록 · 눈 색 · 인상 — kvLook, 세계 그림 2절과 같은 글), SKIN 은 설계 피부색 칸, LIGHT 는 하이키(앞 보조광 · 장면 빛의 절제된 림 · 피부 물들지 않게 · 얕은 심도).
- BODY LINE · 노출 · 장면 · 손 줄은 그대로, 고른 광택 단계는 SKIN 뒤에. 지금은 kv_cgi_hikey 만 casualKit — 다른 화풍 일상컷은 그대로(검사로 확인). 검사 prompt-v2.

## 2026-11-08 · claude · 화풍 키 kv_cgi_hikey — 시네마틱 CGI 하이키
- 사용자 「스타일, 조명, 피부, 카메라 정도 넣으면 될까?」 → 「응 진행해줘」 — 사용자가 가져온 사마의 무협 지시문의 STYLE · 피부 · 조명 · 카메라 네 칸을 kv_kmmo_23d v3 틀에. 피부는 설계표 피부색({skin})을 지키고 렌더링 규칙만(「장밋빛 도자기」 고정 안 함), 조명은 「늦은 오후」 대신 장면 빛 + 시간대. 의상 색 조정 · 자세 문장은 넣지 않음. 일상컷 피부 광택 기본 soft.
- 시험 — 사마의 · 맹획 · 관우 무협 각 한 장: 피부색이 설계대로, 하이키. 생성기 화풍 고르개에 자동으로. 검사 prompt-v2(장수 279 × 세계 3 칸 · 빈 칸 · 맹획 청동 피부).

## 2026-11-08 · claude · 화풍 비교 묶음 — 주유 · 사마의
- 사용자 「주유랑 사마의도」 — 2026-11-08 주유, 2026-11-08-2 사마의: 화풍 여덟 × 세계 셋 × 세계 그림 · 근접 · 원거리, 각 72장. 일상컷은 앞모습만(IMAGE_RULES 6절) — 계획기 --fresh seed 7 · 17 · 37 · 53 기록에서 몸 front · front_3q, 고개 with_body · tilt, 시선 camera, 란제리 · 목욕 · 수영복 뺌, 세계마다 근접 · 원거리(장소 겹치지 않게).
- 필터 거절 둘(주유 2.3D 판타지 원거리 · 애니 광택 무협 원거리) — 같은 지시문 다시로 통과.

## 2026-11-07 · claude · 화풍 비교 묶음 2026-11-07-5 — 제갈량, 일상컷 앞모습만
- 사용자 「이번엔 제갈량으로 테스트해줘. 그리고 화풍비교용에서는 일상컷은 앞모습만 써줘」 — 화풍 여덟 × 세계 셋 × 세계 그림 · 근접 · 원거리 72장(자연광 · BODY LINE · 2.3D v3 뒤). 일상컷은 몸이 정면 · 3/4 정면, 고개도 몸과 같이, 시선은 카메라나 든 소품인 컷만(계획기 제갈량 --fresh seed 7 · 17 · 37).
- IMAGE_RULES 6절 — 비교용 일상컷은 앞모습만. 필터 거절 하나(2.3D 판타지 근접) — 같은 지시문 다시로 통과.

## 2026-11-07 · claude · 화풍 비교 묶음 2026-11-07-4 — 조조, 자연광 · 몸 라인 시험
- 사용자 「조조로 화풍별 테스트 이미지 만들어줘. 각 화풍별 9장 72장」 — 화풍 여덟 × 세계 셋 × 세계 그림 · 근접 · 원거리. 2.3D 세계 그림은 v3 체형, 모든 일상컷은 자연광 · BODY LINE 줄(f6136c7) 뒤 지시문.
- 일상컷 장면은 화풍끼리 같게(계획기 조조 --fresh seed 41 · 53 에서 세계마다 가슴 위 근접 하나, 전신 · 3/4 원거리 하나 — 란제리 · 목욕 차림 뺌). 필터 거절 없음.

## 2026-11-07 · claude · 일상컷 자연광 · 몸 라인, 세계컷 체형(2.3D v3)
- 사용자 「조명 : 참고 그림 그대로 빼고 > 자연광」 — 일상컷 STYLE 줄(REF_STYLE)에서 lighting quality 를 뺐다(그림결 · 선 · 색 · 채도만 넘긴다). LIGHT 줄은 얼굴만 → 얼굴과 몸: 장면의 자연광이 제 방향 · 색온도로, 스튜디오 키 · 림 · 평평한 미용 조명 없음, 첨부 그림 조명은 넘기지 않음.
- 사용자 「세계컷과 일상컷에 허리 라인을 지금보다 얇게, 골반은 지금보다 좀 더 크게, 허벅지는 상단부만 지금보다 약간 굵게」 — 세계컷: 기본 화풍 kv_kmmo_23d v3(v1 + 체형 꼬리: 가늘게 조인 허리 · 넓고 둥근 골반 · 허벅지 위쪽만 조금 더 — 무릎 · 종아리는 가늘게, 2절 끝은 「현실적 사람 크기 안에서」). v1 · v2 는 기록.
- 사용자 「일상컷 케릭터에 몸 라인을 강조하는 문구 넣어줘」 — lib/prompt-spec.js CASUAL.bodyLine(BODY LINE: 첨부 그림의 체형에서 허리 더 가늘게 · 골반 조금 넓게 · 허벅지 위쪽 조금 더, 옷과 자세가 가슴 → 허리 → 골반 · 허벅지 곡선을 보이게) — 모든 화풍 일상컷(자연판 꼴도), GPT 구조형 「Body line」 칸.
- 검사 prompt-v2 — 일상컷 STYLE 줄에 조명 없음 · 몸 라인 줄(세계 그림엔 없음) · 자연광은 몸까지.

## 2026-11-07 · gpt · 유비 판타지 비교 원거리 8장 정면 교체
- data/style-compare.json — 2026-11-07-3 fantasy 원거리 설명을 정면·카메라 시선으로 변경하고 그림 revision을 갱신. 8개 화풍의 세계 그림과 앞 원거리컷을 참조해 다시 생성한 그림·썸네일은 put --replace로 교체하고 이전 해시·기록은 그림 저장소 records/replacement.json에 보존. 기준 판 한 장은 도구 필터 거절 뒤 높은 목선·불투명 블라우스와 긴 치마로 노출을 낮춤.
- styles.html — 교체된 갈래의 revision을 그림·썸네일 URL에 붙여 브라우저에 남은 이전 옆모습 캐시 대신 정면 그림을 요청.

## 2026-11-07 · gpt · 유비 메카 화풍 비교 8종 24장 추가
- data/style-compare.json — 2026-11-07-3 묶음의 mecha 칸에 유비 등록 설계와 8개 화풍의 생성기 프롬프트로 만든 세계 그림·근거리 일상컷·원거리 일상컷을 tools/style-compare.py put으로 추가. 비교 그림·썸네일·원문 지시문·참조와 원본 해시·구도 및 장신구 차이 검수는 그림 저장소의 비교 폴더에 보관.

## 2026-11-07 · gpt · 유비 판타지 화풍 비교 8종 24장 추가
- data/style-compare.json — 2026-11-07-3 묶음의 fantasy 칸에 등록된 유비 설계와 화풍 8종의 세계 그림·근거리 일상컷·원거리 일상컷을 tools/style-compare.py put으로 추가. 지시문·원본 해시·참조·검수 기록은 그림 저장소의 비교 폴더에 보관.

## 2026-11-07 · gpt · 유비 무협 화풍 비교 8종 24장 추가
- data/style-compare.json — 2026-11-07-3 묶음에 등록된 유비 설계와 화풍 8종의 세계 그림·근접 일상컷·원거리 일상컷을 tools/style-compare.py put으로 추가. 비교용 그림과 썸네일, 생성 지시문·원본 해시·참조·검수 기록은 그림 저장소 style-test/compare/ 아래에 보관하며 도감 등록 목록은 변경하지 않음.

## 2026-11-07 · gpt · 조조 메카 화풍 비교 원거리 8장 추가
- data/style-compare.json — 2026-11-07-2 묶음의 mecha 칸에 화풍 8종의 기존 원거리 일상컷을 tools/style-compare.py put --far-img로 추가. 극장 분장실 전신 장면과 하단 화풍 표기를 유지하고 원거리 설명을 연결. 도감 등록 없이 화풍 비교 탭에만 표시.

## 2026-11-07 · gpt · 조조 판타지 화풍 비교 원거리 8장 추가
- data/style-compare.json — 2026-11-07-2 묶음의 fantasy 칸에 8개 화풍별 기존 원거리 일상컷을 tools/style-compare.py put --far-img로 추가. 등불 축제 거리 전신 장면과 하단 화풍 표기를 유지하고 원거리 설명을 연결. 도감 등록 없이 비교 탭에만 표시.

## 2026-11-07 · gpt · 조조 무협 화풍 비교 원거리 8장 추가
- data/style-compare.json — 2026-11-07-2 묶음의 samguk 칸에 8개 화풍별 기존 원거리 일상컷을 tools/style-compare.py put --far-img로 추가. 등불 축제 거리의 전신 컷과 하단 화풍 표기를 유지하고, far 갈래와 장면 설명을 연결. 도감 등록 없이 비교 탭에만 표시.

## 2026-11-07 · claude · 화풍 비교 검사 — 최신 묶음 기준
- 다른 세션이 묶음 2026-11-07-2(화풍 8)를 올린 뒤 tests/screen.cjs 가 첫 묶음(화풍 7)의 칸 수를 기대해 실패 — 화면이 여는 최신 묶음의 화풍 수 · 갈래 수로 세고, 묶음 고르개(묶음 수)도 본다. 원거리 갈래 커밋(b4fff79)이 이 검사가 끝나기 전에 푸시됐다.

## 2026-11-07 · claude · 화풍 비교 — 원거리 일상컷 갈래
- 사용자 「원거리 일상컷도 있는데」 — 갈래 셋: 세계 그림(world) · 근접 일상컷(casual) · 원거리 일상컷(far, 파일 <화풍>_<세계>_far.webp). put --far-img · --far-note, 묶음에 kinds(있는 갈래 — sync 가 폴더에서 맞춤)와 far(세계별 원거리 장면 한 줄).
- styles.html — 묶음에 있는 갈래만 단추로, 기본은 셋 다. check 는 묶음의 kinds 만 본다. 앞 묶음 2026-11-07 은 kinds = 세계 그림 · 근접.

## 2026-11-07 · gpt · 화풍 비교 2026-11-07-2 — 조조 무협 8쌍
- data/style-compare.json — 조조 무협(samguk) 8가지 화풍의 세계 그림과 근접 일상컷을 tools/style-compare.py put으로 추가. 서재·손인사 장면과 하단 화풍 표기를 유지하고, 도감 등록 목록에는 넣지 않음. 동시 추가된 판타지·메카 목록과 설명은 sync 후 보존.
- sam-atelier-img/style-test/compare/2026-11-07-2/ — 세계 그림 8장·근접 일상컷 8장과 각각의 썸네일을 그림 저장소에 먼저 반영.

## 2026-11-07 · gpt · 조조 메카 화풍 비교 8쌍 추가
- data/style-compare.json — 2026-11-07-2 묶음에 화풍 8종의 메카 세계 그림과 근접 일상컷을 tools/style-compare.py put으로 추가. 화풍 표시가 있는 그림을 사용하고, 도감 등록 없이 화풍 비교 탭에서만 표시.

## 2026-11-07 · gpt · 조조 판타지 화풍 비교 8쌍 추가
- data/style-compare.json — 묶음 2026-11-07-2의 fantasy 칸에 화풍 8종의 세계 그림과 근접 일상컷을 연결. tools/style-compare.py put으로 그림 저장소의 style-test/compare/2026-11-07-2/에 webp와 썸네일 32개를 추가하고, 모델 식별자가 제공되지 않은 이번 생성은 ChatGPT 이미지 생성으로 표기.

## 2026-11-07 · claude · 화풍 비교 — 세션마다 세계 하나씩 올리기
- 사용자 「세션별로 메카, 판타지, 무협 다 따로 만들었는데 어떻게 업로드 하라고 얘기해야돼?」 — tools/style-compare.py put(열쇠 · 장수 · 화풍 · 세계 · 세계 그림 · 일상컷 → webp + thumb 를 묶음 폴더에, 목록 묶음을 맞춤 · 덮어쓰기 막음 · 묶음 하나에 장수 하나) · sync(폴더 파일로 목록을 다시 — 목록이 git 에서 부딪쳤을 때).
- check 는 빈 칸(아직 안 올린 세계)을 경고만, --strict 일 때만 실패. styles.html 묶음 고르개 — 제목 없는 묶음은 「열쇠 · 장수」. IMAGE_RULES 6절 — 세션에 줄 순서.

## 2026-11-07 · claude · 화풍 비교 — 묶음을 쌓기(덮어쓰기 없음)
- 사용자 「화풍탭에 이미지 올리면 덮어씌워지나? 아님 추가되나?」 → 「응 추가되게 바꿔주는데 날짜 겹치는건 어떻게돼?」 — 그림을 묶음 폴더로(sam-atelier-img style-test/compare/2026-11-07/). 묶음 열쇠는 날짜, 같은 날 또 올리면 날짜-2 · 날짜-3 …
- tools/style-compare.py — next [날짜](목록 · 그림 저장소 폴더 둘 다 보고 다음 빈 열쇠) · check(열쇠 꼴 · 겹침 · 묶음마다 화풍 × 세계 × 갈래 파일과 thumb).
- styles.html — 묶음이 둘 이상이면 위에 고르개(최신이 맨 위 · 기본), 주소 ?r=. 검사 tests/style-compare.py.

## 2026-11-07 · claude · 화풍 비교 탭 — styles.html
- 사용자 「각 이미지 공방에 네비게이션바에 화풍탭을 추가해서 비교하기 쉽게 올려줄래?」 — 머리 항해에 「화풍」(lib/workspace-ui.js PAGES, 도감 다음). styles.html — 조조를 화풍 일곱(2.3D 기본 · 기준 판 · 프로모 · 일본 리얼 CG · 일본 유화풍 · 게임 키아트 · 한국형 글로시)으로 세계 그림 셋 + 근접 일상컷, 예전 등록 그림 줄. 보기 화풍별 · 세계별, 갈래(세계 그림 · 근접 일상컷 · 예전 그림), 크게 보기, 주소 ?view=&w=&kind=.
- 그림 42장은 sam-atelier-img style-test/compare/(webp + thumb) — 등록 그림이 아니라 img.json · 도감 · 등록 워크플로와 무관. 목록 data/style-compare.json(rounds — 다음 비교 묶음은 여기에 더한다).
- 좁은 화면 항해 — 탭이 일곱이 되며 글자가 겹쳐, 599px 아래에선 탭이 제 폭을 지키고 줄을 옆으로 민다(lib/workspace.css). 판 번호 workspace.css v5 · words.js v7 · workspace-ui.js v4(모든 페이지, 게임 draft.html 은 그대로).
- 검사 tests/screen.cjs — 화풍 탭 · 화풍 일곱 칸 · 칸 수 · 세계별 · 예전 줄 · 크게 보기 · 넘침 없음(폰 · PC).

## 2026-11-07 · claude · 화풍 키 kv_anime_gloss — 포켓몬 공방 애니 광택
- 사용자 「포켓몬 공방의 애니광택 도 등록해줘」 — pkm-atelier anime_gloss(data/concept-mecha.json) 의 머리말 · STYLE · 끝맺음 빛을 kv_jp_paint 와 같은 틀(CHARACTER · COSTUME · COMPOSITION · ANATOMY AND FINISH, 인물 · 옷 · 장면은 설계표)에.
- 색 줄 — 세력 색을 흰 · 은 저채도 파스텔 안에서, 가장 짙은 것이 강조색 하나. 재질 줄 — 젖지 않은 자연광 윤기. 일상컷 피부 광택 기본 soft(은은하게).
- 생성기 화풍 고르개에 자동으로 뜬다. 검사 prompt-v2 — 장수 279 × 세계 3 빈 칸 없음.

## 2026-11-07 · claude · 생성기 화풍 고르개 — 빈 칸 고침
- 사용자 「칸만 생기고 값이 안보이는데」 — 페이지(prompt.html)는 새 판인데 브라우저가 lib/studio.js?v=4 옛 판을 캐시에서 써 목록을 못 채웠고, .style-pick {display:flex} 가 hidden 을 덮어 빈 칸이 드러났다.
- 스크립트 판 번호 올림(studio.js v5 · words.js v6 — 모든 페이지 · prompt-spec.js v2 · prompt-sam.js v2 · studio.css v5), .style-pick[hidden] {display:none}.

## 2026-11-07 · claude · 생성기 화풍 고르개
- 사용자 「생성기에 화풍추가해주고, 변경 기능 만들어줘」 — prompt.html 위에 화풍 고르개(select). 맨 위 「기본 — 한국 MMORPG 2.3D」(값 '' — 늘 그때의 기본 화풍), 그 아래 style.json 의 다른 판 여섯(게임 키아트 2.5D · 한국형 글로시 · 한국 MMORPG 프로모 · 한국 MMORPG 기준 판 · 일본 모바일게임 리얼 CG · 일본 유화풍). prompt2(구조판 v2)는 그대로 고정.
- 고르면 지시문 · 파일 이름(<장수>_<세계>_<화풍>_f.webp) · 기록 · 피부 광택 기본이 그 화풍으로. 주소 ?style= 로도, 기기에 stylePick 으로 기억(옛 saved.style 은 여전히 안 읽음).
- 글 lib/words.js studio.style · studio.style.default · studio.style.pick, 꾸밈 lib/studio.css .style-pick. 검사 tests/screen.cjs — 목록 맨 위 기본 · 고르면 지시문이 Use case 꼴 · 파일 이름 · 기본으로 돌아오면 조립기와 같다.

## 2026-11-07 · claude · 일상컷 얼굴 자연광 공통 · 화풍 키 kv_jp_paint
- 사용자 「일상컷에서는 얼굴에도 자연광 느낌을 추가해줄래?」 → 「이거 화풍추가랑 자연광은 일상컷 공통으로 넣어줘」.
- 얼굴 자연광 — lib/prompt-spec.js CASUAL.faceLight(LIGHT: 한 줄 — 장면의 빛이 제 방향 · 색온도로 얼굴에, 눈썹 · 코 · 턱 밑 그늘, 주변 반사광, 따로 노는 스튜디오 조명 없음. 첨부 그림의 조명을 얼굴에서만 덮어쓰고 그림결은 그대로). buildCasual 이 피부 광택 줄 다음에 모든 화풍 일상컷에 싣는다(자연판 꼴도). lib/prompt-gpt.js 가 「Light on her face」 칸으로 옮긴다. 조운 일상컷 아홉으로 시험(빛이 장면 색으로 얼굴에 묻음).
- 화풍 키 kv_jp_paint(일본 유화풍 게임 일러스트, 시험 키) — 사용자가 가져온 두 번째 조운 지시문 꼴. 머리말 · STYLE · 재질 줄 · 구도 · ANATOMY AND FINISH 는 그 글, 나머지는 설계표. 기본 화풍은 그대로 kv_kmmo_23d.
- 검사 prompt-v2 — kv_jp_paint 장수 279 × 세계 3 빈 칸 없음, 일상컷 자연광 줄이 모든 화풍에 있고 세계 그림엔 없음.

## 2026-11-07 · claude · 화풍 키 kv_jp_mobile — 일본 모바일게임 리얼 CG
- 사용자가 가져온 일본 리얼 모바일게임 조운 지시문을 공방 꼴로 옮김(사용자 「이것도 옮겨줘」). 머리말 · STYLE · 재질 줄 · 구도 · ANATOMY 는 그 글 그대로, 인물 · 옷 · 실루엣 · 색 · 노출 · 장면은 설계표에서. 기본 화풍(kv_kmmo_23d)은 그대로.
- buildKv 에 outSwap(판마다 공용 줄 속 낱말 바꿔 적기) — jp 판은 노출 줄의 「keep the costume WORLD describes」 를 「described above」 로.
- 검사 prompt-v2 — 장수 279 × 세계 3 이 jp 꼴로 빈 칸 없이. docs/STYLE_LAB.md 표에 한 줄.

## 2026-11-06 · claude · 일상컷 피부 광택 — 단계 고르기
- 사용자 「그 일상컷 광택효과를 선택 할 수 있게하자. 단계별로」 — 일상컷 장면에 gloss 칸(lib/prompt-spec.js CASUAL.glosses): matte 광택 없음 · soft 은은하게 · dewy 촉촉하게 · glossy 반짝이게. 모두 SKIN: 한 줄이라 GPT 구조형 「Skin finish」 로 그대로 간다.
- 안 고르면 화풍 기본(style.json casualSkin — kv_kmmo_23d 는 dewy 와 같은 글이라 지금까지 지시문 그대로). 조립부 buildCasual 이 고른 단계 → 화풍 기본 순, glossDefault 내보냄.
- 생성기 일상컷 「피부 광택」 단계(머리 변화 다음) · prompt-pack casual.<자리>.gloss · 검사 prompt-v2(네 단계 · dewy = 기본 글 · 고르면 그 줄 하나만, 나머지 지시문은 같다).

## 2026-11-06 · claude · 실루엣 — 장수마다 고르게 나눈 설계값
- 사용자 「우리 실루엣 추가했잖아. 그것도 장수마다 고르게 분배하자」 — 장수 279명 × 세 세계에 실루엣 설계값 worlds.<세계>.sil(설계표). tools/sil-spread.py 가 역할(장수 · 책사 · 문관 · 군주)에 어울리는 갈래 안에서 가장 덜 쓰인 갈래를 골랐다 — 무협 · 판타지 갈래마다 19~21명, 메카 15~16명.
- 관우는 사용자가 고른 세계컷(1,2,1)에 맞춰 무협 cape_general · 판타지 gown_armor · 메카 skirt_plate 로 먼저 박았다.
- 생성기 실루엣 단계 — 안 고르면 「장수 설계값」(이름 표시), 새 「자유」(free)는 실루엣 없이. 조립부 silOf(고른 값 → 설계값 → free 면 없음). prompt-pack 도 같은 규칙.
- 검사 — prompt-v2(모든 장수 · 세계에 표의 값 · 갈래별 차이 3 이하 · 안 고르면 설계 실루엣이 들어감), prompt-gpt(자유면 실루엣 줄 없음).

## 2026-11-06 · claude · 관우 얼굴 — 짧은 얼굴 · 덜 째진 눈
- 사용자 「얼굴 길이를 좀 줄이고, 째진 눈을 좀 보완해야 될 거 같아」 — 세 세계 공통 얼굴(worlds.samguk) 얼굴형 oval → heart, 눈 narrow_upturned → almond_wide, 앞머리 none → side_swept(드러난 이마가 얼굴을 길게 보이게 함).
- 눈꼬리 eye_tilt up → level, 성정 줄 'long phoenix eyes' → 'gracefully lifted almond eyes'. 봉황 눈 기운은 윙 아이라인(mark)만으로 남김. 요약 · face_note 함께 고침.

## 2026-11-06 · claude · 관우 피부 warm_beige
- 설계표 관우 — 피부 golden_tan → warm_beige, 요약도 「붉은 기 도는 따뜻한 베이지 피부」. 붉은 기는 성정 줄(ruddy red-tinged complexion)로 남김(사용자 「구리빛 피부가 문제같네」 → 「1번으로 해줘」).

## 2026-11-06 · claude · kv_kmmo_23d — 「small」 얼굴 뺌
- kv_kmmo_23d v1 2절 「A small, refined, beautiful face」 → 「A refined, beautiful face」 — 머리가 작게 그려지는 쪽을 덜게. 등신 줄(natural 낱말)은 실사로 끌까 봐 넣지 않음(사용자 「1번만 해볼까」).

## 2026-11-06 · claude · 관우 얼굴 설계 부드럽게
- 설계표 관우 — 무협 얼굴형 long → oval, 눈썹 straight_thick → angled_sharp, 코 aquiline → straight_narrow, 입술 thin_long → soft_medium, 표식 red_lip → winged_liner. 봉황 눈 · 녹색 눈 · 구릿빛 피부 · 긴 포니테일 그대로(사용자 「리얼해서 그런가 못생기게 나오네」 「붉은 입술도 너무 튀니까 다르게 가자」).

## 2026-11-06 · claude · 일상컷 하관 — 참고 그림 얼굴형 기준
- API 일상컷 FACE 줄(lib/prompt-sam.js REF_FACE)에 각도 문장 — 낮은 · 높은 카메라 · 턱 괴기 · 옆모습 · 돌아보기에서도 참고 그림의 얼굴형 · 턱 길이 · 얼굴 길이 대 폭 비율, 원근 · 자세가 하관을 늘이거나 턱을 무겁게 하지 않는다. GPT 구조형(lib/prompt-gpt.js)의 「small, soft chin」 절대 표현도 같은 참고 그림 기준 문장으로(사용자 「래퍼런스 이미지의 얼굴형을 유지한다 이런식으로」).

## 2026-11-06 · claude · 새 화풍 열쇠 kv_kmmo_23d — 기본
- data/style.json — kv_kmmo_lock v6 · v7 을 새 열쇠 kv_kmmo_23d v1 · v2 로 떼어 냈다, 기본 화풍 kv_kmmo_23d(v1). kv_kmmo_lock 은 v5 까지(조조 v5 그림 보존). 검사 prompt-v2 는 기본 판을 읽게. 문서 AGENTS · IMAGE_RULES · IMAGE_AUTOMATION · STYLE_LAB(사용자 「v6는 화풍키 새로해서 올려줘. 기존에 올라가있는건 보존해주고」).

## 2026-11-06 · claude · 기준 판 current v7 → v6
- kv_kmmo_lock current 를 v6 으로 — 일상컷은 v6 꼴(피부 광택 줄 포함). v7 자연판은 기록으로 남김(조조 같은 계획 시험에서 옷이 모두 남색으로 몰림, 사용자 「일상컷은 v6로 가자」).

## 2026-11-06 · claude · 기준 판 v7 — 자연판 일상컷
- kv_kmmo_lock v7(current) — 일상컷 조립을 자연판 꼴로(casualNatural, lib/prompt-sam.js buildCasual): identity-preserve 편집 · 정체성과 화풍 잠금 · 옷 · 장소 · 자세 · 구도만 바꾸기, 옷은 세계 그림 팔레트 허용, 강도 · 노출 축 · 피부 광택 · 각도 강제 줄 없음. 계획기 칸은 SCENE 블록으로, 표정 꼬리 · 크롭 · 시대 · 무기 장신구 줄 유지. GPT 구조형(lib/prompt-gpt.js)은 그대로 낸다. 검사 casual-plan · prompt-gpt · screen 을 새 꼴에 맞춤(사용자 「자연판 꼴로 바꾸고 광택 줄은 빼줘」).

## 2026-11-06 · claude · 기준 판 v6 — 2.3D 세계 그림 꼴 · 역할 × 세계 의상 문장
- kv_kmmo_lock v6(current) — 세계 그림 머리말 · STYLE · CHARACTER · COSTUME AND EQUIPMENT · POSE AND SETTING 꼴(사용자 2.3D 지시문), 역할 × 세계 의상 열두 칸(costumeRole), 노출 줄 유지. lib/prompt-sam.js buildKv — 머리말에 장수 이름 채우기 · costumeRole · 칸 사이 빈 줄(sectionGap). 검사 tests/prompt-v2.cjs · screen.cjs 를 판 틀에 맞춤(사용자 「노출 줄 넣어서 v6으로 생성기에 넣어줘」).

## 2026-11-06 · claude · 기준 판 v5 — user_kv 1절 · 일상컷 피부 광택
- kv_kmmo_lock v5(current) — 머리말 · 1절을 사용자 영문 네 칸(user_kv)으로, 2 · 3 · 4절 틀을 그 말투로. 일상컷에만 촉촉한 피부 광택 줄(casualSkin, lib/prompt-sam.js buildCasual). GPT 구조형 일상컷은 SKIN 줄을 Skin finish 칸으로(lib/prompt-gpt.js). 검사 tests/prompt-v2.cjs — 일상컷엔 있고 세계 그림엔 없다(사용자 「2번으로 생성기 기본 판에 넣어줘」).

## 2026-11-06 · claude · 기준 판 v4 를 기본으로
- kv_kmmo_lock current v3 → v4(볼륨 문장 · 기본 노출 줄). 검사 tests/prompt-v2.cjs 에 v4 줄 확인(사용자 「v4로 생성기 기본 바꿔줘」).

## 2026-11-06 · claude · 기준 판 v4 후보 — 볼륨 · 기본 노출
- kv_kmmo_lock v4(아직 current 아님 — v3) — 2절 체형 뒤 옛 kr_mmorpg 볼륨 문장(bodyTail), 3절에 기본 노출(과감) 줄을 늘(exposureAlways). v1~v3 조립기는 기본 노출이면 노출 줄을 뺐다. 조조 세 세계 시험(사용자 「맘에 드는건 볼륨감이랑, 의상 노출정도」).

## 2026-11-06 · claude · 기준 판 v3 — 머리색만 저채도
- kv_kmmo_lock v3 — v2(전체 저채도)가 뿌옇게 나와 v1 + 머리만 저채도. 1절 머리 줄 + 2절 머리색 낱말에서 vivid · bright · glossy · polished 를 빼고 「muted, low-saturation」(hairMute, lib/prompt-sam.js buildKv). 마량 머리 채도 0.56 → 0.35, 전체는 그대로(사용자 「머리색만 채도를 낮게 해줘. 지금 너무 뿌옇게 됐어」).

## 2026-11-06 · claude · 기준 판 v2 — 저채도
- kv_kmmo_lock v2 — 1절에 COLOUR LOCK(저채도 · 눌린 색, 3절 색도 저채도판, 밝은 · 네온 색 없음). v1 은 기록으로. 마량 2.6 평균 채도 0.26 → 0.20(사용자 「2.6은 색을 좀 밝게 쓰니까 채도를 낮은색 위주로」).

## 2026-11-06 · claude · 기준 판 작은 눈 낱말
- kv_kmmo_lock swap 에 eye_size small → 「small, narrow eyes」 — 설계 문구 「smaller, narrower eyes than usual anime proportion」 이 장수 96명 2절에 anime 낱말을 넣고 있었다(마량 시험에서 찾음). 검사 tests/prompt-v2.cjs 에 2 · 3 · 4절 애니 낱말 없음.

## 2026-11-06 · claude · 도감 화풍 고르개 · 초선 연핑크
- 도감 dex.html — 화풍 고르개(#dex-style). 처음은 기본 화풍(kv_kmmo_lock), 그림 있는 앞 화풍(kr_mmorpg …)은 골라서 따로. 고른 화풍의 그림만 세계 칸 · 일상컷 · 크게 보기 · 진행 수에 — 다른 화풍 덧줄은 뺐다. 즐겨찾기에서 다른 화풍 그림으로 오면 그 화풍으로(사용자 「도감에 옛날 버전은 따로보게 셀렉트박스로 화풍 선택」).
- 설계표 초선 — 장수 몫 palette(연핑크 · 블러시 로즈 · 상아 · 로즈골드, 라일락 포인트) · 메카 설계(worlds.mecha.design). 조립기는 장수 palette 가 무리 · 세력 색을 이긴다, 검사기는 palette 의 en · ko 확인(사용자 「초선은 연핑크 위주로」).

## 2026-11-06 · claude · 기본 화풍 kv_kmmo_lock
- data/style.json 에 kv_kmmo_lock(format kv) — 머리말 · 1절 · 2절 틀 · 세계 장르 · 3 · 4절 틀 · swap(히메컷 · 울프컷 · 한쪽 눈 앞머리 · 버튼 코 · 처진 눈 · 큰 동그란 눈 · 큰 눈) · faceWorld(samguk). 기본 화풍을 kr_mmorpg → kv_kmmo_lock(사용자 「응 생성기에 넣어줘」 「기본 화풍으로」).
- lib/prompt-sam.js buildKv · bodyText, 일상컷은 화풍 글 없는 판도 「첨부 그림 그대로」 STYLE 자리, tools/prompt-pack.cjs 는 kv 세계 그림을 구조형으로 옮기지 않고 그대로. 검사 tests/prompt-v2.cjs(기준 판 837장 — 세 세계 같은 얼굴 · 흔들리는 값 없음 · 네 칸) · prompt-gpt · screen 고침.

## 2026-11-06 · claude · 기준 판 kv_kmmo_lock
- docs/STYLE_LAB.md 에 kv_kmmo_lock — 한국 MMORPG 반실사 1절 + FACIAL DESIGN LOCK + GENRE LOCK, 세 세계 같은 얼굴 · 헤어, 흔들리는 값 바꿔 끼우기, 손에는 지정한 물건만. 조조 · 맹획 전문 예시(사용자 「응 저장해줘」).
- IMAGE_RULES.md 1절 — 이 판으로 그릴 땐 세계마다 2~3장 → 사용자가 고른 뒤 일상컷, GPT 세션도 고른 장만 올림(사용자 「각 세계별로 2~3개씩 생성해서 내가 보고 난 뒤에 일상컷」).

## 2026-11-06 · claude · 맹획 미형 + 태닝 되돌림
- 564d28c(맹획 golden_tan · 미형 값) 되돌림 — 사용자 「원래가 낫네」. 설계표 맹획은 다시 bronze · 큰 눈 · 동그란 코 · 판타지 울프컷 · 메카 히메컷.

## 2026-11-05 · claude · 2D · 3D 갈래 열쇠 넷
- docs/STYLE_LAB.md 에 kv_2d_film(극장판 애니) · kv_2d_thick(두꺼운 칠) · kv_3d_real(실사풍) · kv_3d_paintover(렌더 덧칠 키아트) 1절 — 2D · 3D 여섯 갈래씩 시험 중(사용자 「2d는 2,3 3d는 3,6 추가해줘」).

## 2026-11-05 · claude · 반실사 갈래 열쇠 셋
- docs/STYLE_LAB.md 에 kv_semireal_painterly(회화) · kv_semireal_glossy(글로시) · kv_semireal_cinematic(시네마틱) 1절 — 반실사 여섯 갈래 시험 중 1 · 2 · 5번(사용자 「1,2,5 키로 넣어주고」).

## 2026-11-05 · claude · 조운 기준 화풍 세 갈래 열쇠
- docs/STYLE_LAB.md 에 영문 네 칸 화풍 셋 — kv_2d_anime(2D 애니 키비주얼) · kv_semireal_painted(반실사 페인팅) · kv_3d_stylized(스타일라이즈드 3D 렌더). 1절만 다르고 2절(조운) · 3 · 4절(세계별 의상 · 장면)은 공통(사용자 「각 화풍을 우선 키값으로 저장해줘」).

## 2026-11-05 · claude · 군웅 무리별 세력색
- 설계표 군웅 무리(camp) 열셋에 palette(en · ko) · persona · 메카 설계 문장 — 동탁군 핏빛 진홍 · 여포군 진홍 · 원소군 황금 · 남색 · 원술군 노랑 · 자주 · 공손찬군 흰색 · 은 · 형주 청록 · 익주 숲빛 녹색 · 한중 쪽빛 · 서량 모래색 · 남만 청동금 · 진홍 · 비취 · 황건 노랑 · 한 조정 검정 · 주홍 · 재야 생베 · 대나무. 그 밖의 제후는 군웅 색 그대로(사용자 「군웅들도 각각 세력색을 넣자」).
- 생성기 v1 FACTION 줄 · 메카 FACTION FRAME, v2 3절 색 · 세력 프레임 · 4절 색이 무리 것을 먼저 쓴다(lib/prompt-sam.js card 에 camp). 검사 tests/prompt-v2.cjs 에 무리 색 확인.

## 2026-11-05 · claude · 맹획 피부 bronze
- 설계표 맹획 피부 deep_brown(짙은 갈색) → bronze(청동빛 갈색). 짙은 피부가 그림을 어둡게 끌고 가서(사용자 「bronze로 바꾸고」).

## 2026-11-05 · claude · v2 메카 2D 고침 되돌림
- lib/prompt-spec.js · lib/prompt-sam.js · data/style.json — 0d4c752 · 06cd36e(큰 눈 문구 · 머리 영어 용어 · 메카 광원 · SF 게임 키 비주얼 · 눈꼬리 모순)를 되돌림. 사용자 「방금거 고치기 전으로해서 외형 설계만 판타지에 맞춰서 세계별 컷 만들어줘」

## 2026-11-05 · claude · v2 기본 화풍 glossy_plain · 생성기 실루엣 단계
- data/style.json — glossy_plain: glossy_sf_kv 원문에서 애니메이션 말(일본 애니메이션풍 미형 · 일본 미소녀 조형 · 애니메이션식 이상화 · 단순화)만 지운 판, 반실사 얼굴 문단 · 애니 얼굴 문단 없음. 사용자 「v2 glossy 화풍 … 애니메이션 문구 지운걸로 기본 그림체 해줘」 — lib/studio.js · lib/words.js · prompt2.html · AGENTS.md 의 v2 화풍을 glossy_plain 으로(anime_kv · glossy_kv 는 기록)
- lib/studio.js · lib/words.js — 세계 그림 단계에 「실루엣」(자세·표정 다음): 세계마다 갈래 단추(설명 한글), 자유 · 랜덤 · 여기부터 다시, 자세 칸의 고르개는 뺐다. 사용자 「생성기쪽에 실루엣 선택하는것도 추가해줘」 · IMAGE_RULES.md · tests/prompt-v2.cjs

## 2026-11-05 · claude · 프롬프트 v2 화풍을 얼굴 애니판(anime_kv)으로
- data/style.json — anime_kv: glossy_kv 에서 얼굴 칸만 애니메이션(일본 애니풍 미형 · 깔끔한 색선 · 셀 음영 · 큰 반짝이는 눈 · 콧방울 없는 작은 코 · 볼 홍조), 몸 · 옷 · 배경은 고광택 그대로, 부정 칸은 반실사 · 실사 얼굴을 막음. 사용자 「얼굴만 애니판으로 화풍 판 정리해서 v2에 넣어줘」 — 초선 세계 셋 · 일상컷 아홉 장 시험과 글자까지 같은 지시문
- lib/studio.js · lib/words.js · prompt2.html · AGENTS.md — v2 탭 화풍이 anime_kv, glossy_kv 는 앞 판으로 남김 · tests/prompt-v2.cjs(두 판 다 구조판, anime_kv 얼굴은 애니)

## 2026-11-05 · claude · glossy_kv 형태 언어 문장 고침
- data/style.json — 얼굴 반실사 교체 때 「…반실사 캐릭터 조형한 반실사 표현」 으로 겹쳐 붙은 형태 언어 문장을 「…반실사 캐릭터 조형」 으로(1절 다섯 곳)

## 2026-11-05 · claude · glossy_kv 얼굴을 반실사로
- data/style.json — glossy_kv 1절(기본 · 세계 몫 · 실루엣판 모두): 사용자 표대로 「일본 애니메이션풍 미형 → 반실사 미형」 · 「일본 미소녀 조형 → 눈꺼풀 · 코 · 입술 · 볼 입체를 연속 명암으로 묘사하는 반실사 조형」 · 「애니메이션식 이상화 → 지정 비례 유지한 반실사 정제」, 형태 언어 아래 「얼굴 작화 기준」 한 문단, 부정 칸 다섯(과도하게 단순화된 애니 얼굴 · 코끝만 · 콧방울 · 눈꺼풀 생략 · 선으로만 눈 · 입 · 매끈하기만 한 얼굴)

## 2026-11-05 · claude · 실루엣이면 허벅지 노출은 실루엣이 허락하는 방식으로
- lib/prompt-spec.js — 무협 · 판타지 expoSil: 「허벅지가 보이는 트임」 → 「실루엣이 허락하는 방식 하나로(짧은 하의 · 갑옷 사이 · 원래 있는 트임), 노출을 위해 긴 치마나 끌리는 겉자락을 새로 만들지 않음」. 초선 · 조운 24장이 모두 긴 트임 치마였다 — 이 문구로 야성 전사 · 용비늘 · 망토 장수가 처음으로 제 실루엣이 나왔다(사용자 「응 노출 줄 고쳐서 3장만 뽑아줘」)

## 2026-11-05 · claude · 실루엣이면 1절 천 낱말 · 인물 특징을 낮춘다
- data/style.json — glossy_kv section1_sil(무협 · 판타지): 비단 · 거즈 · 벨벳 · 흐르는 주름 · 비치는 천을 빼고 부정 칸에 「실루엣에 없는 끌리는 겉치마 · 비치는 겉자락」, 1절의 「비치는 천를」 오타도 고침
- lib/prompt-spec.js · lib/prompt-sam.js — 실루엣이면 「캐릭터가 묻어나는 곳」 앞에 「장신구 · 문양 · 색으로만(옷 모양은 실루엣대로)」. 조운 시험(실루엣이 역할 옷은 이겼지만 은빛 갑옷 특징 · 끌리는 겉자락이 남았다) 뒤 사용자 「B로 고쳐서 초선 6장 다시 뽑아줘」 · tests/prompt-v2.cjs

## 2026-11-05 · claude · 실루엣이면 규칙 · 노출에서 옷 종류를 뺀다
- lib/prompt-spec.js · lib/prompt-sam.js — 무협 · 판타지에서 실루엣을 고르면 3절 「지켜야 할 것」 · 「노출 범위」 를 옷 종류(장포 · 치마 자락 · 가운)를 말하지 않는 판(rulesSil · expoSil)으로. 초선 2판에서 이 두 줄이 장포 · 가운을 다시 불렀다(사용자 「응 고쳐서 6장 다시 뽑아줘」) · tests/prompt-v2.cjs

## 2026-11-05 · claude · 실루엣을 고르면 역할 옷보다 먼저
- lib/prompt-sam.js · lib/prompt-spec.js — 무협 · 판타지에서 실루엣을 고르면 3절 프레임 종류의 역할 옷(문관 장포 · 재상 코트 …)을 빼고 실루엣 줄에 「역할 옷 · 특징 · 장비보다 우선」, 판타지 디자인 방식 맨 앞에 「서양 옷만 — 한푸 소매 · 엇갈린 깃 · 동양풍 겉옷 없음」, 영문 OUTFIT SILHOUETTE 줄에도 우선 한 마디. 초선 시험(사용자 「api로 9장 뽑아줘」 — 메카는 실루엣이 먹었고 무협 · 판타지는 문관 장포가 덮었다) · tests/prompt-v2.cjs

## 2026-11-05 · claude · 무협 · 판타지 실루엣 갈래
- lib/prompt-spec.js — SILHOUETTES(세계마다): 무협 열넷(경갑 무희 · 중갑 장군 · 장포 책사 · 궁중 예복 · 기마 무장 · 협객 · 망토 장수 · 털 망토 변방 · 비단 피백 · 겹치마 갑주 · 물소매 무희 · 경장 자객 · 봉관 · 궁수 경장), 판타지 열넷(판금 기사 · 가벼운 정찰 · 망토 마법사 · 드레스 갑주 · 전투 마법사 · 성기사 망토 · 날개 장식 · 흑기사 가시 · 엘프풍 우아 · 야성 전사 · 귀족 장교 코트 · 사제 예복 · 용비늘 갑주 · 왕관 예장). 사용자 「무협, 판타지 실루엣 갈래도 만들어줘」
- lib/prompt-sam.js · lib/studio.js · lib/words.js · lib/prompt-gpt.js · tools/prompt-pack.cjs — 실루엣 고르개가 세 세계 다(프롬프트 · 프롬프트 v2), 무협 · 판타지는 OUTFIT SILHOUETTE 한 줄 · 구조판 3절. 안 고르면 지시문 그대로 · 검사 둘 · IMAGE_RULES.md

## 2026-11-05 · claude · 프롬프트 v2 탭 — 구조판 지시문(glossy · 실루엣 선택)
- prompt2.html · lib/studio.js · lib/workspace-ui.js · lib/words.js — 머리 메뉴에 「프롬프트 v2」, 같은 생성기를 v2 로(화풍 glossy_kv 고정 · 세계 그림만 · 따로 저장). 사용자 「프롬포트 탭 하나 더 만들어서 v2로 glossy1에 실루엣 선택형으로 하나 만들자」 「원소공방 참고하면 될 거 같아」
- lib/prompt-sam.js buildStruct · lib/prompt-spec.js STRUCT — 원소 공방 구조판을 삼국지 꼴로: 공통 규칙 → 1절 → 2절 외형(한글 표, 체형 여덟 칸은 하체 현실 비율) → 3절 의상은 그림이(프레임 · 세력 · 색 · 규칙 · 노출 · 메카 실루엣 한글) → 4절 장면
- data/style.json — glossy_kv(구조판, 무협 · 판타지 1절은 SF 낱말을 갑옷 · 비단 · 판금으로). 기본 화풍 · 프롬프트 탭은 그대로 · tests/prompt-v2.cjs · AGENTS.md

## 2026-11-05 · claude · 메카 실루엣 선택 칸
- lib/prompt-spec.js — MECHA_SILHOUETTES 열여덟(슬림 보디슈트 · 중장갑 강습 · 날개 바인더 · 장갑 치마 · 장갑 롱코트 · 떠 있는 유닛 · 보조 팔 · 대형 등짐 · 경량 고기동 · 후광·관 · 장갑 분리 · 전신 장갑 · 골격 노출 · 대형 팔다리 · 기사 갑주 · 망토판 · 꼬리 유닛 · 부유 링). 사용자 「실루엣 종류를 많이 넣어서 랜덤이든 선택이든」 「장갑 분리형, 전신장갑형 등등」 「옵션으로」
- lib/prompt-sam.js · lib/studio.js · lib/words.js — 메카 세계 그림 자세 칸에 「메카 실루엣」 고르개, 고르면 세계 글 뒤 MECHA SILHOUETTE 한 줄(큰 덩어리만, 세부는 그림이), 안 고르면 지금과 글자까지 같다
- lib/prompt-gpt.js · tools/prompt-pack.cjs — 구조형 옷 칸으로 옮기고 settings 의 shot.frame 을 받는다 · tests/prompt-gpt.cjs · IMAGE_RULES.md

## 2026-11-05 · claude · 화풍 실험 기록 — 글로시 판 · 조운 세 세계
- docs/STYLE_LAB.md — semireal_painterly_gloss: 회화 채색에 얼굴 물광 · 몸 윤기 · 고광택 갑옷. 조운 메카 · 무협 · 판타지 구조형 지시문 셋(사용자 「메카는 된거 같고」 「잘 나온거 같아」) — 창은 몸 옆 거의 수직, 위끝은 뭉툭한 물미
- AGENTS.md — 판 여섯

## 2026-11-05 · claude · 화풍 실험 기록 — 파스텔 판 더하기
- docs/STYLE_LAB.md — 사용자 「원래는 이건데 구조에 맞게 옮겨달라고 했거든」: 받은 구조형 2번이 1번과 글자까지 같게 옮겨져 있어(파스텔이 빠짐) 2번 원문에서 다시 옮겨 pastel_semireal 로 더했다. 1번 · 2번 원문도 같이 적고, 1번이 같은 지시문의 편차라고 적었던 판단을 고쳤다
- AGENTS.md — 판 다섯

## 2026-11-05 · claude · 화풍 실험 기록 — 네 칸 구조형 판 넷
- docs/STYLE_LAB.md — 사용자 「다 적어두고 화풍키 정해줘」: 1번 지시문 → semireal_painterly(추천, 2번 지시문은 1번과 같아 같은 판의 두 번째 장), 3번 → glossy_sf_kv, 조운 메카 첫 판 → semireal_smooth, 문앙 메카 판 → semireal_cinematic. 공통 규칙 · 작화 칸 원문과 시험한 2 · 3 · 4번 칸
- AGENTS.md — 문서 표에 한 줄

## 2026-11-04 · claude · 크게 웃는 입 남은 넷 정리
- data/sam-design.json — 강유 · 육손 · 원소 · 문앙 입술 wide_smile(크게 웃는 입) → full_wide(넓고 도톰한 입술). 11-03 「호탕하게 웃는 얼굴은 빼자」 때 돌림 목록에서만 빠지고 이미 받은 장수에 남아 있었다(사용자 「응 설계값 채워줘」 — 문앙 메카 구조형 대조에서 찾음)
- tools/sam-design.py — check 가 wide_smile 을 막는다

## 2026-11-04 · gpt · 맹획 18장 화풍 v4로 재작업
- sam-atelier-img/img/맹획_* · records/맹획/ — 현재 생성기 화풍 v4의 현실적인 하체 비율로 세계 3장·각 세계 기준 원본을 첨부한 일상 15장 재생성. 1024×1536 WebP 품질 90·method 6, 실제 제출 지시문·원본·결과·참고 해시 및 검수 보존. 배경 인물·의상·구도·손 위치·피부색 등 계획 차이 12장은 qa.passed=false 유지
- sam-atelier-img/records/replacement.json · records/맹획/rework-20261104-626ae.json — 요청한 18개 파일만 교체, 이전 WebP·원본 해시와 기록·계획·설정 보존. 삼국시대 일상5 안전 거절 후 같은 지시문 한 번 재시도로 성공
- data/img.json — 기존 맹획 18개 파일 이름과 최초 등록일 유지, 등록 도구 대조에서 새 후보 0개. 일상 세 세계 계획·중복 검사 통과. 공용 blob:none Git 데이터와 작업별 sparse worktree·브랜치 재사용, 연결된 GitHub로 비강제 fast-forward 반영


## 2026-11-04 · gpt · 맹획 세계 3장·일상 15장 생성 및 도감 등록
- sam-atelier-img/img/맹획_* · records/맹획/ — 생성기 영문 세계 지시문과 구조형 일상 지시문으로 18칸 생성, 일상마다 해당 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6, 실제 제출 지시문·원본·결과·참고 해시와 AI 검수 보존. 장신구 수·머리 길이·시선·자세·노출 등 계획과 다른 17장은 qa.passed=false 유지
- sam-atelier-img/records/맹획/*-casual-plan.json · generation-settings.json · samguk-initial-blocked.json — 세 세계 동시 계획으로 필수 두 갈래·시대 배분·세계 간 장면 중복 검사. 삼국시대 첫 요청 안전 거절 후 생성기 low 노출로 조정해 성공, 원문과 거절 내역 보존
- data/img.json — 등록 도구로 맹획 18개 파일만 추가, 기존 다른 장수 807개 파일·도감 항목·최초 등록일 보존. 공용 blob:none 저장소와 별도 sparse worktree·작업 브랜치 사용. CLI push 인증 부재로 연결된 GitHub를 통한 비강제 fast-forward 반영




## 2026-11-04 · claude · 하체 과장 줄이기 — 화풍 v4 · GPT 구조형 체형 줄
- data/style.json — kr_mmorpg v4: 볼륨은 가슴에, 골반 · 허벅지는 「현실적인 사람 비율 · 긴 다리 · 과장된 허벅지 · 골반 · 하체 쏠림 없게」(사용자 「gpt쪽이 너무 과장되게 나와서 그래」 「하체가 너무 비현실적이야」 — 맹획 GPT 그림)
- lib/prompt-gpt.js — 일상컷 · 세계 구조형 체형 줄도 같은 상한
- IMAGE_RULES.md — 체형 규칙에 하체 현실 비율 한 줄

## 2026-11-04 · gpt · 축융 세 세계 기준컷과 일상 15장 추가
- sam-atelier-img/img/축융_* · records/축융/ — 기존 축융 시안과 기본 kr_mmorpg 생성기 지시문으로 삼국시대·중세 판타지·메카 기준 각 1장, 해당 세계 원본을 첨부한 일상 각 5장, 총 18장. 1024×1536 WebP 품질 90·method 6, 원본·결과·실제 첨부 원본 해시와 제출 지시문·AI 검수 보존
- sam-atelier-img/records/축융/*-casual-plan.json · generation-settings.json — 세 세계 계획 검사 통과. 안전 거절된 삼국시대 일상2는 긴소매·긴바지, 판타지 일상1은 래시가드·수영 레깅스, 판타지 일상5는 목과 팔을 덮는 마녀 의상으로 바꿔 low로 생성. 구도·문양·피부색·프레임 차이는 qa.passed=false로 기록
- data/img.json — 등록 도구로 축융 18장만 추가하며 기존 장수 항목과 등록일 보존. 공용 blob:none 저장소 복구 후 별도 작업 브랜치·sparse worktree 사용, CLI 쓰기 인증 부재로 연결된 GitHub를 통해 비강제 fast-forward로 main 반영

## 2026-11-04 · claude · 택시 뒷좌석에서 서지 않는다
- data/casual-tree-v2.json — 받침 「upright(서서 움직일 만큼 트인 자리)」 을 더해 택시(night_taxi) 말고 모든 장소에 붙이고, 서기 · 걷기 · 기대 서기 · 작업대에 숙이기는 이것을 요구한다. 사용자 「택시 안에 서기 자세가 정상 씬으로 등록되어 있대」 — 서기 · 걷기는 받침 조건이 없어 앉는 자리뿐인 택시에서도 통과했다
- tests/casual-tree-v2.cjs · tests/casual-tree-v2.py — 택시에서 서는 자세 거름 · 앉기는 됨 · 랜덤 · 추천 장소

## 2026-11-04 · gpt · 견씨 세 세계 기본컷과 일상 15장 등록
- sam-atelier-img/img/견씨_* · records/견씨/ — 기본 삼국시대·중세 판타지·메카 각 1장과 세계별 일상 5장, 총 18장. 생성기 기본 kr_mmorpg 지시문 그대로 제출, 일상은 해당 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6과 실제 제출 지시문·원본/결과/참고 해시·AI 검수 기록 보존
- sam-atelier-img/records/견씨/*-casual-plan.json · generation-settings.json — 세 세계 계획기로 필수 두 갈래·시대 배분·장면 중복 검사 통과. 삼국시대 일상2는 bold 두 번 안전 거절 뒤 moderate로 생성, 판타지 일상1·메카 일상1은 동일 지시문 재시도 성공. 은회색에 가까운 머리색·일부 배경 인물·자세/의상 차이는 qa.passed=false로 남김
- data/img.json — 등록 도구로 견씨 18개 파일만 추가. 기존 다른 장수 항목과 최초 등록일 보존. 공용 blob:none 저장소·별도 작업 브랜치와 sparse worktree 재사용, 연결된 GitHub를 통해 비강제 fast-forward로 main 반영

## 2026-11-04 · gpt · 황개 메카 6장 반영 및 18장 구성 완료
- sam-atelier-img/img/황개_mecha_* · records/황개/mecha*.json — 환경 미연결 중 생성했던 메카 기본컷 1장·일상컷 5장 원본을 복구, 원본 크기 1024×1536 확인 후 WebP 품질 90·method 6으로 변환. 재생성 없이 같은 결과를 등록하고 실제 지시문·참고 설정·원본 해시·AI 검수 기록 보존
- data/img.json — 등록 도구로 황개 메카 6개 파일만 추가, 기존 황개 삼국시대·판타지 12장과 다른 장수 도감·등록일 보존. 세 세계 각 기본컷 1장·일상 5장, 총 18장 구성과 필수 갈래·장면 중복 검사 통과
- sam-atelier-img/records/automation/claims/황개.json · records/황개/mecha-resume.json — 사용자 「메카 다시 시도해줘」「메인 올려줘」 승인으로 재개. 앞선 mecha.blocked.json은 중단 이력으로 그대로 남김

## 2026-11-04 · gpt · 황개 삼국시대·판타지 12장 추가, 메카 생성 중단
- sam-atelier-img/img/황개_* · records/황개/ — 삼국시대·판타지 각각 기본컷 1장과 일상컷 5장, 총 12장 신규 생성. 1024×1536 WebP 품질 90·method 6, 기준 원본·지시문·결과 해시와 실제 제출 지시문·AI 검수 저장. 계획과 다른 구도·눈 색·배경 무기/문자는 qa.passed=false 유지
- sam-atelier-img/records/황개/*-casual-plan.json · generation-settings.json · mecha.blocked.json — 세 세계 계획과 재현 설정 보존. 판타지 일상1 안전 거절 뒤 bold 재시도·moderate·low 순서 기록. 메카 기본컷 도구 호출이 사용자에 의해 중단되어 메카 6칸은 미완료, 잠금 blocked로 남김
- data/img.json — 등록 도구로 황개 12개 파일 추가, 기존 다른 장수 735개 파일·도감 항목·최초 등록일 보존. 공용 blob:none 저장소 복구 후 별도 브랜치·sparse worktree 사용, CLI push 인증 부재로 연결된 GitHub를 통한 비강제 fast-forward 반영

## 2026-11-04 · claude · 일상컷 장소 · 의상 · 소품 더하기
- 사용자 「다 넣어줘」 — 대장간처럼 장소 수에 비해 컷이 몰리던 갈래를 풀려고 장소 23곳을 더했다: 역사의 자리 10(관제묘 · 백제성 · 낙봉파 · 오장원 · 장판교 · 형주 해자 · 촬영 세트장 · 경극 분장실 · 서예 교실 · 축제 거리), 세계 안 5(정원 · 나루 · 사당 · 다리 · 숲길 — 세계마다 다른 곳), 무대 · 환상 8(하늘 정원 · 물속 궁 · 거울 방 · 달 연못 · 얼음 궁 · 등불 강 · 구름 누각 · 끝없는 서고).
- 의상 9(신중식 크롭 마면 · 매듭 원피스 · 재킷 미니, 니트 원피스 롱부츠 · 퍼 코트 미니 · 시스루 블라우스, 골프 · 스키 · 발레 연습복) · 하는 일 6(향 올리기 · 붓글씨 · 연 날리기 · 경극 분장 · 퍼레이드 · 연못 먹이 주기) · 소품 10과 쓰임 12(붓 · 고쟁 · 비파 · 바둑판 · 기름종이 우산 · 연 · 향 · 헤드폰 · 노트북 · 아이스 커피).
- 세계 안 갈래 장소는 일곱에서 열둘로 — 새 세계 안 다섯이 갈래 밖이면 세계 안 칸이 늘 갈래라 안 나온다. 처음엔 새 갈래가 덜 쓴 쪽이라 자주 나오고 기록이 쌓이면 고르게 된다.

## 2026-11-04 · claude · 일상컷 — 대장간 · 망치를 뺐다
- data/casual-tree.json · casual-tree-v2.json — 장소 「검 대장간」(heritage_forge), 하는 일 「불꽃 보기」, 소품 「망치」 와 망치 동작 셋(어깨에 메기 · 옆에 들기 · 작업대 내려치기)을 뺐다(받침 · 소품 장소 · 하는 일 장소에서도). 사용자 「대장간 망치랑 대장장이 컷은 없애자. 원소공방에서 그대로 옮겨온거 같은데」 — 원소 공방의 용광로 · 망치질에서 넘어왔다. 다른 원소 몫(시험관 · 염전 · 용광로)은 표에 남아 있지 않다. 이미 그린 일상컷 16장이 대장간 · 망치를 썼다 — 그대로 둔다
- tests/casual-tree-v2.py · casual-tree-v2.cjs — 대장간 · 망치가 없는지 · IMAGE_RULES.md — 역사의 자리 목록

## 2026-11-04 · claude · 노장 · 원로 미시 연령 · 일상컷 동탄룩 계열
- lib/prompt-spec.js FACE_DESIGN.age — late_30s(30대 후반) 더함: 「전성기의 매혹적인 원숙미 — 자신감 있고 관능적인 태도, 아는 듯한 눈빛, 무르익은 여성스러운 몸, 눈가 아주 옅은 선까지만 매끈한 피부, 늙거나 지치거나 아줌마 같지 않게, 작고 부드러운 턱」. 사용자 「미시 느낌(나이대가 있어도 섹시한)으로」. data/sam-design.json — 노장 · 원로 18명(주준 · 황보숭 · 노식 · 왕윤 · 장소 · 장굉 · 정보 · 황개 · 한당 · 엄안 · 유표 · 도겸 · 마등 · 고옹 · 정욱 · 가후 · 종요 · 장제)을 late_30s 로(전엔 20대 중반~30대 초반, look.age_note). 그림 있는 황충 · 손견 · 사마휘는 그대로
- data/casual-tree.json · casual-tree-v2.json — 옷 계열 「동탄룩」(dongtan) 더함: 몸에 붙는 니트 미니 원피스 · 크롭 니트 + 타이트 미니스커트 · 오프숄더 바디콘 원피스 · 터틀넥 + 슬릿 펜슬 스커트 · 튜브탑 + 하이웨이스트 레깅스. 평상복이 되는 시대 · 장소 · 하는 일에 다 붙였다. 사용자 「일상 컷중에 동탄룩 의상도 몇 가지 추가해줘」
- tools/casual-plan.cjs — 새로 더한 옷 계열은 다른 계열의 가운데 횟수에서 시작(안 그러면 72묶음 중 72묶음에 들어갔다 → 14묶음), 묶음 안에서 이미 고른 옷 계열은 다시 덜 고르고, 동탄룩은 묶음마다 한 장까지

## 2026-11-04 · gpt · 사마휘 세계 3장·일상 15장 생성 및 도감 등록
- sam-atelier-img/img/사마휘_* · records/사마휘/ — 생성기 영문 세계 지시문·구조형 일상 지시문으로 18칸 신규 생성, 일상마다 해당 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6, 원본·지시문·참고 그림 해시와 AI 검수 저장. 구도·시선·눈색·의상·배경 차이가 있는 16장은 qa.passed=false 유지
- sam-atelier-img/records/사마휘/*-casual-plan.json — 공용 partial clone·별도 worktree·sparse-checkout과 기존 사용 기록 재사용, 세 세계 동시 계획. 세계별 필수 두 갈래·시대 배분·세계 간 장소와 구도 중복 검사 통과
- data/img.json — 등록 도구로 사마휘 18개 파일 추가. 기존 다른 장수 699개 파일·도감 항목·최초 등록일 보존, prune 미사용. CLI push 인증 부재로 연결된 GitHub의 비강제 fast-forward 갱신 사용

## 2026-11-04 · claude · 방통 — 차갑고 도도하게 다시 설계(시안)
- data/sam-design.json 방통 — 사용자 「방통도 차갑고 도도하게 바꿔줘」: 주근깨 · 앳된 인상 · 장난스러운 표정 · 처진 작은 눈 · 헝클어진 픽시 · 대충 걸친 도포 · 「sly grin」 을 빼고, 차가운 인상 · 치켜 올라간 봉황 눈매(봉추 — 무협은 봉황눈, 판타지 고양이눈, 메카 치켜 올라간 눈) · 날렵한 눈썹 · 날개 아이라인 · 얇은 입술 · 자신만만한 표정 · 얼음빛 눈 · 흰 피부, 성정은 「못난 이를 내려다보며 제 값을 쉽게 보이지 않는 차가운 천재」. 로즈골드 머리(생머리로) · 봉황 깃 부채 · 연환계 · 낙봉파 · 골반 굴곡형은 그대로, 앞 설계는 history. 그림은 아직 없다

## 2026-11-04 · claude · 머리 · 눈 색 — 진영과 상관없이 넓은 팔레트에서 고르게
- lib/look-spec.js VOCAB_EN — 머리색 29 → 45(백금발 · 딸기 금발 · 꿀빛 갈색 · 캐러멜 · 버건디 · 벚꽃 분홍 · 로즈골드 · 마젠타 · 라벤더 · 회보라 · 쪽빛 · 하늘빛 · 민트 · 에메랄드 · 끝이 붉은 검정 · 끝이 푸른 은빛), 눈색 16 → 27(개암 · 꿀 · 짙은 갈색 · 장밋빛 · 라일락 · 마젠타 · 물빛 · 옥빛 · 사파이어 · 은빛 · 흑요석). 사용자 「진영색 상관없이 색팔레트를 많이 다양하게 부탁해」
- data/sam-design.json — 그림 없는 장수 237명의 머리 · 눈 색을 진영과 상관없이 고르게(전체 머리 44가지 · 가장 많은 색 9명, 눈 27가지 · 10~11명씩, 진영마다 머리 43~44 · 눈 24~27가지, 같은 머리+눈 조합 겹침 4). 군웅은 세력 안에서 같은 머리색을 피했고, 청록 머리는 법정 · 부첨 몫으로 뺐다. 요약 글 · look.color_note. 그대로 둔 장수는 앞 칸과 같다

## 2026-11-04 · claude · 머리 · 눈 색을 진영 팔레트 안에서 고르게 다시 나눴다
- data/sam-design.json — 그림 없는 장수 236명의 머리 · 눈 색을 진영 팔레트 갈래 안에서 고르게(사용자 「전체적으로 다양하게 바꿔줘」). 호박색 눈 79 → 23, 칠흑 · 짙은 갈색 머리 81 → 30(그대로 둔 장수 포함). 위는 파랑 · 은 · 검정(머리 13 · 눈 10가지, 최다 8 · 9), 촉은 초록 · 금(15 · 10), 오는 빨강 · 주황(12 · 8), 군웅은 보라 · 금 · 청동에 세력마다 같은 머리색을 피했다(18 · 12). 같은 진영 안 같은 머리+눈 조합은 거의 없다. 요약의 「○○ 머리」 · 「○○ 눈」 도 바꿨고, 까닭은 look.color_note. 그림이 있는 · 그리는 중 · 확정 장수와 사연 있는 장수(황월영 · 조창 · 미방 · 장포)와 오늘 손으로 정한 맹달 · 손건 · 부첨은 그대로

## 2026-11-04 · gpt · 동탁 세계 3장·일상 15장 생성 및 도감 등록
- sam-atelier-img/img/동탁_* · records/동탁/ — 생성기 영문 세계 지시문과 구조형 일상 지시문으로 18칸 신규 생성, 일상마다 해당 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6, 원본·지시문·참고 그림 해시와 AI 검수 저장. 구도·크롭·손 좌우·복식·배경 차이가 있는 13장은 qa.passed=false 유지
- sam-atelier-img/records/동탁/*-casual-plan.json — 공용 Git·별도 worktree·sparse-checkout과 기존 사용 기록 재사용, 세 세계 동시 계획으로 필수 두 갈래·시대 배분·세계 간 장소와 구도 중복 검사 통과. 필터 거절 뒤 같은 지시문 재시도에 성공한 3칸의 시도 이력 저장
- data/img.json — 등록 도구로 동탁 18개 파일 추가, 기존 다른 장수 681개 파일·도감 항목·최초 등록일 보존. CLI push 인증 부재로 연결된 GitHub의 비강제 fast-forward 갱신 사용

## 2026-11-04 · gpt · 여몽 세계 3장·일상 15장 생성 및 도감 등록
- sam-atelier-img/img/여몽_* · records/여몽/ — 기존 그림 없는 18칸 신규 생성. 세계는 생성기 영문 지시문, 일상은 구조형과 각 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6, 원본·지시문·참고 그림 해시와 AI 검수 기록 보존. 얼굴·체형·팔다리 연결 확인; 크롭·손 좌우·시선·배경·소품 등 계획과 다른 12장은 qa.passed=false 유지
- sam-atelier-img/records/여몽/*-casual-plan.json — 기존 로컬 사용 기록을 재사용해 계획기로 세 세계를 함께 구성, 세계별 필수 두 갈래·시대 배분·세계 사이 장소와 구도 중복 검사 통과
- data/img.json — 등록 도구로 여몽 18개 파일 추가. 다른 장수 663개 파일·도감 데이터·최초 등록일 보존, sparse-checkout에 없는 이미지의 prune 미사용

## 2026-11-04 · gpt · 등애 메카 일상2 손 흔드는 팔을 몸 앞으로 수정
- sam-atelier-img/img/등애_mecha_kr_mmorpg_f_casual2.webp · records/등애/mecha-casual2.kr_mmorpg-ui.json — 기존 원본 PNG를 첨부해 가까운 팔은 몸 앞에서 손을 흔들고 반대팔은 아래로 내리도록 부분 편집. 얼굴·체형·의상·까치발·카메라·우주 목욕탕 배경 유지, 1024×1536·양팔 연결·두 손 확인. 요청 수정 검수는 통과, 최초 계획과 다른 기존 몸 방향에 대한 전체 QA 미통과는 유지
- sam-atelier-img/records/replacement.json — 이전 WebP·PNG 해시와 이전 기록 보존. 같은 등록 파일명으로 교체해 도감 주소·최초 등록일 유지, 썸네일은 워크플로에서 갱신

## 2026-11-04 · gpt · 황충 최신 규칙 작업 — 세계 3장 · 일상 15장
- sam-atelier-img/img/황충_* · records/황충/ — 현재 main에 기존 황충 그림이 없어 18칸을 새로 채움. 세계는 생성기 영문 지시문, 일상은 구조형과 각 세계 기준 그림 첨부. 1024×1536 WebP 품질 90, 원본·지시문·참고 그림 sha256과 구체적인 검수 기록 보존
- sam-atelier-img/records/황충/*-casual-plan.json — 기존 로컬 사용 기록을 읽어 계획기로 세계 사이 장소·구도 중복 없는 5컷씩 구성, 필수 갈래·시대 몫 검사 통과. 일부 구도·손 좌우·시선·복식·박물관 진열 무기 차이는 qa.passed=false로 기록
- data/img.json — 등록기로 황충 18개 파일 추가, 다른 장수 등록과 최초 등록일은 보존

## 2026-11-04 · gpt · 등애 세계 3장·일상 15장 생성 및 도감 등록
- sam-atelier-img/img/등애_* · records/등애/ — 기존 등애 그림·기록이 없어 18장 신규 제작. 세계는 최신 생성기 영문 지시문, 일상은 화풍 칸 없는 구조형과 각 세계 원본 첨부. 1024×1536 WebP 품질 90·method 6, 원본·지시문·참조 해시와 검수 결과 기록. 얼굴·체형·팔다리 연결 확인; 구도·의상·앞머리·추가 소품 등 차이가 있는 11장은 qa.passed=false 유지
- sam-atelier-img/records/등애/*-casual-plan.json — 계획기로 세 세계를 함께 계획하고 세계별 필수 두 갈래·시대 배분·세계 사이 장소·구도 중복 검사 통과. 각 세계 일상1의 필터 거절 뒤 동일 지시문 재시도 성공, 시도 이력 보존
- data/img.json — 등록 도구로 세계별 6장씩 총 18개 등록. 기존 다른 장수 627개 파일·도감 항목·등록일 보존, prune 미사용

## 2026-11-04 · gpt · 진궁 최신 규칙 재작업 — 세계 3장 · 일상 15장 교체
- sam-atelier-img/img/진궁_* · records/진궁/ — 세계는 최신 영문 지시문, 일상은 화풍 칸 없는 구조형과 새 세계 그림 첨부. 짧은 중안부·작은 턱·체형 볼륨 확인, 세계 사이 장소·구도 중복 없는 계획 검사 통과. 일부 복식·시선·손 좌우·배경 인물 차이는 qa.passed=false로 사실대로 기록
- sam-atelier-img/records/replacement.json · records/automation/claims/진궁.json — 앞 그림 sha256·기록 보존, 필터 차단 뒤 노출 한 단계 낮춘 3칸의 시도 이력 및 완료 기록. 기존 썸네일은 삭제하지 않고 워크플로가 갱신
- data/img.json — 등록기로 기존 18개 파일명과 등록 유지 확인. 같은 이름 교체라 등록 주소·최초 등록일 변경 없음

## 2026-11-04 · claude · 얼굴 비율 — 짧은 중안부 · 세로비 고정
- lib/prompt-spec.js — 세계 그림 FACE 줄 끝에 「짧고 단정한 중안부(눈이 머리 세로 가운데, 눈~입 짧게), 얼굴은 너비보다 조금만 길게(머리선~턱 약 1.3 : 1), 작고 둥근 턱 — 긴 앞머리 · 옆머리 · 높은 관이 얼굴을 길어 보이게 하지 않게」. 사용자 「진궁 새로만든거 얼굴이 길게 나왔어 … 중안부와 얼굴전체의 세로비를 고정하는게 없다」(진궁 무협 — 히메컷 옆머리 · 한쪽 눈 앞머리 · 높은 관)
- lib/prompt-sam.js REF_FACE · lib/prompt-gpt.js — 일상컷 얼굴 줄에 「첨부 그림과 같은 비율 — 같은 짧은 중안부 · 같은 세로비, 각도 · 앞머리 · 관 때문에 길어지지 않게」

## 2026-11-04 · claude · GPT 세션 일상컷은 구조형(화풍 칸 없이)
- lib/prompt-gpt.js — 일상컷 구조형에서 화풍 칸(ART STYLE)을 빼고 화풍 말이 아닌 배제만 AVOID 한 줄로. 마감 · 얼굴은 0. INPUT(첨부 그림에서 가져올 것), 몸 볼륨은 체형 글 · 어느 각도에서도 작은 턱은 그대로. 사용자 「일상컷 만드는거는 아까 작업한걸로 해볼까? 화풍 지시는 빼고, 체형 정보 남기는 식으로」. tests/prompt-gpt.cjs — 일상엔 화풍 칸 없음
- docs/IMAGE_AUTOMATION.md · IMAGE_RULES.md · AGENTS.md · tools/prompt-pack.cjs(INDEX 안내) — GPT 세션은 세계 그림에 <세계>-prompt.txt, 일상컷에 <세계>-casualN-gpt.md. 기록 prompt_form

## 2026-11-04 · claude · 입술 「크게 웃는 입」 을 돌림에서 빼고 다시 나눴다
- data/sam-design.json · tools/sam-design.py — 입술 wide_smile(wide smiling mouth)이 40명에게 있었다 — 크게 웃는 표정을 뺀 뒤에도 입 모양이 웃음을 밀었다(사용자 「얼굴표정이나 말상얼굴은 안나오는 방향패치는 적용되는건가?」 를 확인하다 진궁 지시문에서). 그림이 없는 35명과 다시 그릴 진궁을 다른 입술로(덜 쓴 쪽부터), 요약의 「웃는 입」 은 「옅은 미소」 로, 까닭은 look.lips_note. 그림이 있는 강유 · 육손 · 원소 · 문앙과 지금 그리는 중인 장수는 그대로. 어휘엔 남는다(game 과 같은 열쇠)

## 2026-11-04 · claude · GPT 세션 지시문 — 구조형을 되돌리고 영문 지시문으로
- docs/IMAGE_AUTOMATION.md · IMAGE_RULES.md · AGENTS.md · tools/prompt-pack.cjs(INDEX 안내) — GPT 세션은 다시 <자리>-prompt.txt(영문 지시문)를 낸다. 사용자 「예전으로 돌아가자」 — 구조형으로 처음 그린 진궁은 선명도 16~19 로 이미 그린 스물다섯(GPT 영문, 22~29)과 그림체가 갈렸고, 화풍 칸을 예전 쪽으로 당긴 시험(2번, 21.6)도 맞지 않았다. 표정 · 얼굴 윤곽 · 작은 턱 · 무기 문구는 영문 지시문에도 들어 있어 그대로. 크기 지정과 검수 다섯 가지 한 번 다시 그리기는 남긴다. lib/prompt-gpt.js · <자리>-gpt.md 는 build 가 만들기만 한다

## 2026-11-04 · claude · 맹달 · 손건 머리색 — 법정과 겹치지 않게
- data/sam-design.json — 청록 머리 넷(법정 · 손건 · 맹달 · 부첨)이 다 촉이라 첫눈에 겹쳤다(사용자 「지금 법정이랑 이미지 비슷한 장수 누가 있을까?」 → 「응 바꿔줘」). 맹달 청록 → 남색(위로 넘어간 장수, 촉 초록 · 위 남색 갑옷), 손건 청록 → 풀빛(잎새 초록 눈 · 밝은 인상). 요약 글도, 까닭은 look.hair_note. 부첨은 호박색 눈 · 무장 차림이라 그대로

## 2026-11-04 · claude · GPT 세션용 구조형 지시문 — 지시문 묶음이 자리마다 <자리>-gpt.md
- lib/prompt-gpt.js(새) — 생성기 지시문(lib/prompt-sam.js)의 줄을 칸으로 옮겨 GPT 세션용 구조형을 만든다. 세계 그림은 API 화풍 줄 대신 고정 화풍 칸(부드러운 3D 렌더 · 작은 턱 · 낮은 미세 대비 · 낮은 채도, 법정 5c 영문), 손에 든 것은 맨 앞(차림 글의 부채 · 두루마리는 그것으로 대신), 일상컷은 화풍 · 얼굴을 첨부 그림에 맡기고 어느 각도에서도 작은 턱 · 몸 볼륨은 그 장수 체형 글에서(첨부 그림의 옷이 몸을 가린다, 법정 일상 4판 영문). 사용자 「응 진행해줘」 — 같은 날 법정 · 반장 시험으로 고른 틀
- tools/prompt-pack.cjs — build 가 자리마다 <자리>-gpt.md 를 쓰고 INDEX 에 구조형 sha256, 못 옮긴 줄이 있으면 아무것도 안 쓴다. tests/prompt-gpt.cjs(새) — 장수 열넷 × 세계 셋 × 일상 다섯이 한 줄도 남김없이 옮겨지나
- docs/IMAGE_AUTOMATION.md · IMAGE_RULES.md · AGENTS.md — GPT 세션은 <자리>-gpt.md 를 내고 도구에서 세로 1024×1536 지정. 검수에서 다섯 가지(긴 얼굴 · 다른 사람 · 마른 몸 · 끊긴 물건 · 팔다리 수)가 걸리면 그 자리만 한 번 다시 그린다(같은 지시문도 장마다 갈렸다), 기록에 prompt_form · prompt_sha256 · redo

## 2026-11-03 · claude · 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다
- lib/prompt-sam.js — 일상컷 지시문 끝에서 refLock: 화풍 문장 → 「STYLE: keep the attached image's rendering exactly …」, 나이 줄 → 「FACE: exactly the face of the attached image …」(없으면 CHARACTER 밑에), 표정 줄 끝에 「눈썹 · 눈꺼풀 · 입꼬리로만」, FINAL CHECK 줄 뺌. 사용자 「일상컷 저거 너무 이상해」 → 「이제 좀 낫네」 → 「응 다 적용해줘」 — 화풍 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 다시 그렸다(헬륨 메카 일상)
- tests/casual-plan.cjs — 일상컷 화풍 · 얼굴 · 표정 줄 검사
- IMAGE_RULES.md — 일상컷 규칙 한 줄
## 2026-11-03 · claude · 얼굴 — 작고 부드러운 턱 · 광대 · 성숙 말 덜기
- lib/prompt-spec.js — FACE 줄 끝에 「작고 부드러운 턱」, 나이 줄의 late_20s · early_30s 에서 「성숙한 · 뚜렷한 광대(와 턱)」 를 「우아하고 부드러운 윤곽」 으로. 사용자가 GPT 세션의 법정 분석을 가져왔다(무협 얼굴이 길고 못생기게, 메카는 예쁘게 — 메카에만 「작은 턱」 이 있었고, 광대 · 성숙 · 높은 아치 눈썹 · 높은 콧대 · 내민 입술이 무협 조합에서 얼굴을 무겁게 했다)
- lib/look-spec.js — 이 공방에서 더한 열쇠 글을 가볍게: 높은 아치 눈썹 → 우아한 아치 눈썹, 높은 콧대 → 날렵하고 섬세한 콧대, 도톰하게 내민 입술 → 부드럽고 도톰한 입술, 역삼각 → 작고 부드러운 턱으로 좁아지는 얼굴(game 과 같은 열쇠는 그대로)

## 2026-11-03 · claude · 손책 — 부드러운 얼굴 설계 확정 · 그림 18장 교체
- data/sam-design.json 손책 — 시안 → 확정(hand). 사용자가 새 세계 그림 셋 · 일상컷 15장을 보고 「응 지금 올려줘」
- 그림 저장소 img/손책_* 18장 · records/손책 · records/replacement.json — 같은 이름으로 교체, 옛 sha256 · 이전 기록을 남기고 옛 썸네일을 지웠다. 일상컷은 계획기 --world all 로 새로 짰다(얼굴 윤곽 줄 · 은은한 표정 · 무기 대신 장신구)

## 2026-11-03 · claude · 크게 웃는 표정을 설계표에서 뺐다 · 손책 얼굴 다시
- data/sam-design.json — 세계 그림 표정이 크게 웃음(laughing)이던 여섯 명을 바꿨다: 조창 자신감 · 허저 자부 · 손책 자부 · 정봉 결연 · 올돌골 결연 · 맹우 옅은 미소(look.expr_note). 사용자 「저렇게 호탕하게 웃는 얼굴은 빼자」. tools/sam-design.py — 무장 표정 돌림에서 laughing 을 빼고 proud
- data/sam-design.json 손책 — 얼굴형 V라인 · 역삼각 · 각진 → 계란 · 하트 · 둥근, 나이 30대 초 → 20대 후반(사용자 「일상컷 얼굴이 길고 각지고 못생기게」), 앞 설계는 history. 그림은 다시 그려 보인 뒤 바꾼다

## 2026-11-03 · claude · 얼굴 윤곽 — 길고 각진 얼굴을 막는다
- lib/prompt-spec.js — 세계 그림 FACE 줄에 「얼굴형이 무엇이든 부드럽고 여성스럽고 매력 있는 윤곽, 길쭉하거나 말상 · 남성적 · 무거운 턱은 안 된다」, 일상컷 AGE 줄에 「클로즈업 · 옆모습 · 낮은 각도에서도 길쭉하거나 홀쭉하거나 각진 턱이 되지 않게」. 사용자 「손책도 뽑아봤는데 일상컷 얼굴이 길고 각지고 못생기게」
- lib/look-spec.js — 얼굴형 글을 턱 · 광대를 미는 말 대신 부드럽게(이 공방에서 더한 셋만: V라인 → 작고 부드러운 턱, 역삼각 → 살짝 올라간 광대, 각진 → 은은한 광대. game 과 같은 열쇠 글은 game 그대로 — tests/look-spec.cjs)
- tools/sam-design.py · data/sam-design.json — 얼굴형 돌림에서 long · square_soft · angular 를 빼고(어휘엔 남김), 그림 없는 장수 215명의 258칸을 계란 · 하트 · 둥근 · 다이아몬드 · V라인 · 역삼각으로 다시 나눴다(아침의 외형 다시 나누기가 길고 각진 쪽을 258칸으로 늘렸다)

## 2026-11-03 · gpt · 손책 세계 셋과 일상 15장 생성·등록
- data/img.json — 등록 도구로 손책 삼국시대·판타지·메카 기준컷 3장과 세계별 일상 5장씩 추가. 기본 kr_mmorpg v3, 1024×1536 WebP 품질 90. 기존 다른 장수 항목 보존.
- 그림 저장소 img/손책_* · records/손책 — 생성기 지시문 묶음 그대로 image_gen으로 생성, 일상컷에는 해당 세계 원본 첨부. 세계별 필수 갈래·시대 배분·장소 및 구도 중복 검사 통과. 판타지 일상1 출력 필터 거절 1회 뒤 같은 지시문 재시도 성공. 프레이밍·배경 인물·의상·배경 무기·자세 편차는 QA 실패로 명시하고 규칙대로 등록. 원본·참고·지시문 해시 기록. 공용 Git 저장소와 sparse worktree 재사용; 셸 push 인증 부재로 GitHub 연결에서 main을 force=false로 전진 갱신.

## 2026-11-03 · claude · 일상컷 표정 — 윙크 · 관능 · 진지 · 호기심을 다시 넣었다
- tools/casual-plan.cjs — 일상컷 표정 후보 열셋에 윙크 · 관능 · 진지 · 호기심을 더해 열일곱(사용자 「윙크, 관능, 진지, 호기심 정도는 일상컷에 넣어줘」)
- lib/prompt-spec.js CASUAL.exprTail · exprTailSkip · lib/prompt-sam.js casualExprTail — 눈 · 눈썹 · 입 줄을 조각으로 나눠, 표정이 그 부분을 정하면 그 조각을 뺀다(윙크 · 관능은 눈, 호기심은 한쪽 눈썹, 뷰파인더 컷은 눈). tests/casual-plan.cjs — 목록

## 2026-11-03 · claude · 일상컷 표정 — 은은한 열셋만 · 눈 · 눈썹 · 입 줄
- tools/casual-plan.cjs — 일상컷 표정을 빼는 목록 대신 고르는 목록으로: 차분 · 옅은 미소 · 다정 · 즐거움 · 생각 · 아련 · 그리움 · 자신감 · 자부 · 집중 · 반쪽 미소 · 자연스러움 · 안도. 사용자 「일상컷쪽이 더 그래」 — GPT 세션 image_gen 이 결연함을 노려봄으로, 으쓱 · 장난을 한쪽 눈썹 + 비웃음으로, 크게 웃음을 벌린 입으로, 호기심을 치켜든 눈썹으로, 관능을 반쯤 감은 눈으로 키웠다(손견 · 강유 · 장합 일상컷 얼굴을 모아 보고)
- lib/prompt-spec.js CASUAL.exprTail · lib/prompt-sam.js — 일상컷 표정 줄 뒤에 「눈은 자연스럽게 뜨고 반쯤 감지 않게, 눈썹은 고르게(한쪽만 치켜들거나 찌푸리지 않게), 입술은 다물거나 살짝만」(뷰파인더를 들여다보는 컷은 빼고). tests/casual-plan.cjs — 고르는 목록 시험

## 2026-11-03 · claude · 표정 세기를 은은하게 — 표정 줄 뒤에 세기 줄
- lib/prompt-spec.js EXPR_TAIL · lib/prompt-sam.js — 세계 그림 · 일상컷의 EXPRESSION 줄 뒤에 「은은하고 자연스럽게, 연기하듯 하지 않게: 비웃음 · 노려봄 · 한쪽 볼을 끄는 비웃음 · 턱을 들어 내려다보기 없이, 얼굴은 편안하고 매력 있게」. 사용자 「gpt 바뀐게 표정 표현이 너무 과해지긴했어」 — GPT 세션의 image_gen 이 같은 표정 글을 크게 키웠다(손견 「턱을 살짝 듦」 → 고개를 젖혀 내려다봄, 장합 「한쪽 입꼬리」 → 비웃음 · 고개 기울임). API 로 그린 장비 · 손상향은 은은했다
- lib/prompt-spec.js EXPRESSION_DETAIL · data/casual-tree-v2.json — confident 의 「턱을 살짝 듦」, half_smile 의 「한쪽으로 기운」, provocative · smug · mischievous 의 비웃음 쪽 말을 뺐다. 화풍(선명도 · 밝기)은 지금대로 둔다(같은 날 GPT 세션 마감 줄 시험 두 번 — 1판은 절반만, 2판은 탁해져서)

## 2026-11-03 · gpt · 손견 새 계획으로 재개하여 세계 셋과 일상 15장 구성 완료
- data/img.json — 기존 삼국시대 기준컷을 보존하고 판타지·메카 기준컷 2장과 세계별 일상 5장씩 15장을 등록 도구로 추가. 손견 총 18장, 모두 1024×1536 WebP 완전 디코딩·원본 및 참고 SHA256 확인.
- 그림 저장소 img/손견_* · records/손견 — 사용자 「다른 계획으로 이어서 진행해줘」에 따라 잠금 해제·재개. 막힌 삼국시대 일상1을 계획기의 의전 교관 역할극 장면으로 변경하고 앞 계획·거절 기록 보존. 세 세계 필수 갈래·시대 배분·장소 및 구도 중복 검사 통과. 판타지 일상4는 출력 필터 두 차례 거절 뒤 moderate 설정에서 생성. 의상·부츠·손 좌우·배경 무기·머리 길이 등 결과 편차는 QA에 명시. 셸 push 인증이 없어 GitHub 앱으로 main을 force=false 전진 갱신.

## 2026-11-03 · gpt · 장합 세 세계 기준컷과 일상컷 15장 등록
- data/img.json — 기존 장합 시안과 최신 kr_mmorpg v3 기준컷 3장·세계별 일상컷 5장씩 총 18장을 등록 도구로 추가. 기존 등록과 다른 작업 보존. 세계별 필수 갈래·시대 구성·세계 사이 장소/자세 중복 검사 통과.
- 그림 저장소 img/장합_* · records/장합 — 생성기 지시문·계획·원본/참조 SHA256·검수 기록. 배경 인물/문자/무기, 헤어와 눈/피부 차이, 손 좌우, 메카 쌍검 대신 장병기, 장신구 잔존은 QA 실패로 기록. 판타지 일상1은 필터 4회 뒤 계획기 재계획 1회와 low로 성공, 메카 일상1은 동일 2회 뒤 moderate로 성공. 판타지 일상3의 0바이트 WebP는 원본에서 재인코딩하고 18장 모두 완전 디코딩 검증. 공용 Git 데이터·별도 worktree·sparse-checkout 사용, 이미 로컬에 있는 소량 기록으로 사용량 집계. Git CLI 쓰기 인증이 없어 연결된 GitHub 기능으로 force=false main 전진 갱신.

## 2026-11-03 · gpt · 손견 삼국시대 기준컷 등록 및 일상 생성 중단 기록
- data/img.json — kr_mmorpg v3 삼국시대 기준컷 한 장을 등록 도구로 추가. 기존 등록 보존. 1024×1536 WebP 완전 디코딩 확인. 허리의 추가 검 형태 가능성은 QA 실패로 기록.
- 그림 저장소 img/손견_samguk_kr_mmorpg_f.webp · records/손견 — 생성기 지시문과 계획기 세 세계 계획, 원본 SHA256, 검수, 삼국시대 일상1 안전 필터 5회 거절 기록. 동일 재시도·노출 moderate/low·재계획 1회 뒤에도 거절되어 IMAGE_AUTOMATION 0/5절에 따라 잠금을 blocked로 남김. 다른 장수 사용량은 이미 로컬에 있는 손상향 작업 기록을 재사용했으며 전체 기록 다운로드는 하지 않음. Git CLI 인증이 없어 GitHub 앱으로 force=false main 전진 갱신.

## 2026-11-03 · claude · 장비 — 미형 설계 확정 · 그림 18장 교체
- data/sam-design.json 장비 — 시안 → 확정(hand). 사용자가 새 세계 그림 셋을 보고 「1번으로 해줘」, 일상컷을 보고 「장비는 이대로 올려줘」
- 그림 저장소 img/장비_* 18장 · records/장비 · records/replacement.json — 같은 이름으로 교체, 옛 sha256 · 이전 기록을 남기고 옛 썸네일을 지웠다. 일상컷은 계획기 --world all 로 새로 짰다(무기 대신 장신구 · 순한 표정 · 지금 현실 둘)

## 2026-11-03 · claude · 설계표 외형 갈래를 늘리고 그림 없는 장수의 외형을 다시 나눴다
- lib/look-spec.js VOCAB_EN · lib/prompt-spec.js FACE_DESIGN.bangs · tools/sam-design.py — 머리 10 → 23(반묶음 · 낮은 포니테일 · 옆 포니테일 · 옆 땋은 머리 · 땋은 왕관 · 히메컷 · 울프컷 · 픽시 · 경단 둘 · 시뇽 · 긴 레이어드 · 롭 · 헝클어진 번) · 앞머리 7 → 12 · 얼굴형 6 → 9 · 눈매 6 → 10(봉황눈 · 속쌍꺼풀 · 고양이눈 · 도화안) · 눈썹 5 → 8 · 코 5 → 7 · 입술 5 → 8 · 체형 8 → 10(골반 · 낭창한 굴곡형). 사용자 「외형관련 분류가 부족하면 더 추가해도 괜찮아 … 돌려쓰는 입장이라 겹치는게 있을 수 밖에」
- data/sam-design.json — 그림이 없는 장수 253명의 많이 쓴 값 · 겹치는 조합을 덜 쓴 값으로(요약 · 설계 까닭에 이름이 나온 값은 그대로 — 장포의 뻗친 머리는 손으로 맞췄다, look.spread). 머리 최다 109 → 37 · 얼굴형 둥근 152 → 95 이하 · 앞머리 옆으로 169 → 78 이하 · 머리색×머리×앞머리 겹침 178 → 43. 그림이 있는 26명 · 손 설계 확정 · 잠금 잡힌 장수는 그대로
- AGENTS.md · IMAGE_RULES.md — 갈래 수

## 2026-11-03 · claude · 장비 — 더 미형으로 다시 설계(시안)
- data/sam-design.json 장비 — 사용자 「조금은 더 미형으로 갔으면 … 지금은 너무 돼지같은 인상」: 눈을 질끈 감고 입을 크게 벌린 웃음 · 둥근 얼굴 · 뭉툭한 코 · 발그레한 볼 · 낮고 짙은 눈썹 · 크고 둥근 눈 → 자신만만한 미소(proud) · 날렵한 눈썹 · 올라간 눈매 · 곧은 코 · 도톰한 하트 입술 · 스모키 눈매 · 갸름한 얼굴. 사나운 인상 · 뻗친 검은 머리 · 호박색 눈 · 장팔사모는 그대로, 앞 설계는 history

## 2026-11-03 · gpt · 강유 세 세계 그림과 일상컷 15장 등록
- data/img.json — 기존 강유 시안의 kr_mmorpg v3 기준컷 3장과 세계별 일상컷 5장씩 18장을 등록 도구로 추가. 1024×1536·세계별 필수 갈래·세계 사이 장소와 자세 중복 검사 통과. 기존 등록과 다른 작업 보존. 창끝 프레임·세계 간 인상 유사성·손 좌우·장식 잔존·의상 문양·구도 차이와 두 컷의 필터 동일 재시도는 records/강유의 QA에 기록. sparse 작업으로 다른 장수 기록을 읽지 못한 계획기 사용량 한계를 계획 기록에 명시. Git CLI push 인증 오류로 연결된 GitHub 기능을 통해 main을 force=false로 전진 갱신. 초기 업로드의 판타지·메카 casual3 0바이트 WebP는 원본으로 재인코딩해 복구하고 18장 모두 완전 디코딩 검사.

## 2026-11-03 · gpt · 곽가 세 세계 기본컷과 세계별 일상컷 다섯 장 등록
- data/img.json — 기존 곽가 시안과 kr_mmorpg v3의 기본 3장·일상 15장을 등록 도구로 추가. 1024×1536 WebP·세계별 필수 갈래·세계 간 장소와 구도 중복 검사 통과. 판타지 기본컷 안전 필터 동일 재시도, 삼국시대 기본컷 원경 병사·일상2 문자와 가운 무늬·판타지 일상3 배경 활과 화살·메카 헤어와 눈 형태 차이는 그림 저장소 records/곽가의 QA에 실패로 기록. 메카 일상2의 0바이트 WebP를 원본에서 다시 인코딩해 완전 디코딩 검증. 공용 Git 데이터·별도 worktree·sparse-checkout 사용, 기존 이미지와 다른 작업 보존.


## 2026-11-03 · claude · 손상향 — 차갑고 도도한 설계 확정 · 그림 18장 교체
- data/sam-design.json 손상향 — 시안 → 확정(hand). 사용자가 새 세계 그림 셋을 보고 「1번으로 해줘」(세계 그림 교체 + 일상컷 15장 새 얼굴로), 일상컷을 보고 「응 올려줘」
- 그림 저장소 img/손상향_* 18장 · records/손상향 · records/replacement.json — 같은 이름으로 교체, 옛 sha256 · 이전 기록을 남기고 옛 썸네일을 지웠다. 일상컷은 계획기 --world all 로 새로 짰다(무기 대신 장신구 · 순한 표정 · 지금 현실 둘)

## 2026-11-03 · claude · 표정 문구를 순하게 · 일상컷 표정 후보 정리 · 손상향 차갑고 도도하게 다시 설계
- lib/prompt-spec.js EXPRESSION_DETAIL · data/casual-tree-v2.json expressions — 표정 서른둘을 단서 두셋으로(사용자 「표정 관련 문구가 과하게」 · 「다 해줘」): 이를 악문 턱(determined · serious) · 웃는 입에 무표정한 눈(cold_smile) · 질끈 감은 눈 · 멍하게 벌어진 입을 뺐다. 세계 그림의 FACE 첫인상과 부딪히던 것
- tools/casual-plan.cjs — 일상컷 표정 후보에서 cold_smile · bored · sleepy · exhausted · mildly_annoyed · unimpressed · laughing 을 빼고, 표정은 덜 쓴 쪽 무게 없이 고르게(무게를 올리자 덜 쓴 극단 표정으로 쏠렸다). tests/casual-plan.cjs — 시험
- data/sam-design.json 손상향 — 시안으로 다시 설계(사용자 「주근깨에 말괄량이 스타일이라 표정도 마음에 안들어. 차갑고 도도한 이미지가 더 맞을거 같아」): 주근깨 · 앳된 인상 · 장난스러운 표정 · 웃는 입 · 들창코 · 둥근 얼굴 · 트윈테일 → 차가운 인상 · 치켜 올라간 눈매 · 날렵한 눈썹 · 날개 아이라인 · 얇은 입술 · 자신만만한 표정. 불꽃 주황 머리 · 호박색 눈 · 차크람은 그대로, 앞 설계는 history


## 2026-11-03 · gpt · 손상향 세 세계 그림과 일상컷 15장 등록
- data/img.json — 시작 시점 규칙 82f406f의 kr_mmorpg v3 세계 그림 3장과 세계별 일상 5장씩 총 18장을 등록 도구로 추가. 1024×1536·필수 갈래·세계 간 장소와 구도 중복 검사 통과. 삼국시대 기준컷 재시도와 일상3의 수위 하향·재계획, 배경 인물·진열 무기·손 좌우·의상·메카 환검 수량 등 시각 검수 편차는 그림 저장소 records/손상향에 실패로 기록. 기존 등록과 다른 작업 보존.

## 2026-11-03 · gpt · 서서 세 세계 기본컷과 세계별 일상컷 다섯 장 등록
- data/img.json — 기존 서서 시안의 kr_mmorpg v3 기본 3장·일상 15장을 등록 도구로 추가. 1024×1536·세계별 필수 갈래·세계 간 장면 중복 검사 통과. 안전 필터 재시도와 메카 일상1 moderate 하향, 일부 눈색·헤어·구도·로고 형태·먼 배경 인물 차이를 그림 저장소 records/서서의 QA에 기록. 기존 이미지와 다른 작업 보존.

## 2026-11-03 · claude · 일상컷 — 지금 현실 비중을 올리고 세계 안 갈래 장소를 넓혔다
- tools/casual-plan.cjs — 한 묶음 다섯 장의 시대 몫(ERA_QUOTA) 지금 현실 둘 · 세계 안 · 역사의 자리 · 무대·환상 하나씩(사용자 「지금 현실 비중을 높여줘」 — 기록 159장 중 지금 현실 19% · 세계 안 55%, 안 쓴 장소 51 곳이 다 지금 현실)
- data/casual-tree.json required.world — 세계 안 갈래 장소 넷(방 · 목욕탕 · 지붕 · 여관)에 서재 · 부엌 · 군영(홈웨어가 되는 곳)을 더해 일곱(「둘 다 해줘」 — 넷에만 쌓였다). 장수 20명 × 세 세계 300컷을 이어 짜 보니 지금 현실 29 → 40%, 가장 많이 쓴 장소 31 → 20 컷, 상위 다섯 장소 28 → 22%
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · tools/casual-check.py — 장소 목록과 시대 몫. tests/casual-plan.cjs — 시대 몫 · 일곱 곳 시험

## 2026-11-03 · gpt · 태사자 세 세계와 세계별 일상컷 등록
- data/img.json — 삼국시대·중세 판타지·메카 기준컷 3장과 각 세계 일상컷 5장씩 총 18장을 등록 도구로 추가. 세계 간 장소·구도 중복 검사 통과, 일상 무기는 작은 장신구로 표현. 생성 지시문·참고 해시·검수·재시도·계획은 그림 저장소 records/태사자에 보관.

## 2026-11-03 · gpt · 장각 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — 기존 장각 시안의 kr_mmorpg v3 세계 그림 3장과 일상컷 15장을 등록 도구로 추가. 1024×1536·세계별 필수 갈래·세계 간 장면 중복 검사 통과. 삼국시대 일상1·메카 일상3의 필터 동일 재시도, 배경 인물·문자·지팡이 원형 유지·일부 의상 및 구도 차이를 그림 저장소 records/장각의 QA에 실패로 기록하고 기존 등록과 다른 작업 보존.

## 2026-11-02 · gpt · 고순 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — 기존 함진영 시안의 kr_mmorpg v3 세계컷 3장·일상컷 15장을 등록 도구로 추가. 1024×1536·세 세계 필수 두 갈래·세계 간 장소와 구도 중복 검사 통과. 삼국시대 기준컷과 판타지 일상2의 필터 재시도·노출 단계 하향 및 글자·의상·프레이밍·대장간 배경 무기 등 시각 QA 차이는 그림 저장소 records/고순에 기록하고 기존 그림과 등록을 보존.

## 2026-11-02 · gpt · 감녕 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 1024×1536·필수 갈래·세계 간 장면 중복 검사 통과. 삼국시대 일상5의 동일 재시도와 판타지 일상2의 필터 재시도·moderate 하향, 배경 인물·손 좌우·의상·구도·박물관 진열 무기 등 시각 QA 차이를 그림 저장소 records/감녕에 기록. 기존 등록과 다른 작업 보존.

## 2026-11-02 · gpt · 순욱 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 기본컷 3장과 일상컷 15장을 등록 도구로 추가. 1024×1536, 필수 갈래·세계 사이 장소·자세 중복 검사 통과. 필터 재시도·메카 일상2 재계획과 기록 경로 교정, 구도·의상·장식·비례·배경 인물·전시 무기 차이를 그림 저장소 records/순욱의 QA에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 마초 세 세계 기준컷과 일상컷 15장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 세계별 일상컷 5장씩 추가. 계획의 필수 갈래·세계 간 장소와 자세 중복 검사 및 18장 1024×1536 검사 통과. 안전 필터 재시도·노출 하향, 창끝 프레임·손 좌우·의상·헤어·배경 무기 등 시각 QA 차이를 records/마초에 기록하고 기존 도감 데이터를 보존.

## 2026-11-02 · gpt · 원소 메카 일상5 팔 연결과 구도 교체
- docs/PATCH.md — 사용자 팔 오류 교정 요청으로 머리 위 수건 동작을 정면에서 팔을 내려 몸 앞에 수건을 받치는 구도로 교체. 이미지·기록·원본 해시·이전 기록을 그림 저장소에 보존하고 썸네일을 갱신. 두 번의 필터 거절 뒤 moderate 단계에서 생성. 1024×1536·양팔 연결 확인. 기존 다른 컷을 보존하여 정면 몸 방향 세 장으로 인한 묶음 검사 예외와 귀걸이 잔존을 기록. 파일명이 같아 도감 등록 수는 18장 유지.

## 2026-11-02 · claude · 일상컷 계획기 — 덜 쓴 쪽 가중치를 올렸다
- tools/casual-plan.cjs — 안 쓴 값 무게 4 → 12, 쓴 값 1/(1+횟수)² → ³(안 쓴 값이 한 번 쓴 값보다 16 배 → 96 배). 길(자세 추천 × 장소) · 옷 계열 횟수도 센다(옷 계열은 전엔 고르게 뽑았다). 사용자 「가중치 올려줘」 — 기록 159장 중 같은 장면 15 가지 67장, 길 3583 중 102 만 썼다. 장수 20명 × 세 세계 300컷을 이어 짜 보니 쓴 길 244 → 382 가지, 옷 223 → 233 벌, 두 번 쓴 길 39 → 33

## 2026-11-02 · gpt · 원소 판타지 일상1 재계획과 남은 11장 등록
- data/img.json — 사용자 재개 지시에 따라 판타지 일상1을 계획기로 마녀 코스튬 클로즈업으로 다시 짜고 판타지 일상5장·메카 세계컷과 일상5장을 추가해 18칸을 채움. 1024×1536·세계별 필수 두 갈래·세계 간 장면 중복 검사 통과. 메카 일상1 필터 재시도, 손 좌우·의상·무기 배경·프레이밍 등 시각 QA 차이와 이전 차단의 해결을 그림 저장소 기록에 남기고 기존 7장·등록을 보존.

## 2026-11-02 · gpt · 장료 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 세계별 필수 갈래·세계 간 장면 중복 및 1024×1536 검사 통과. 안전 필터 단계별 재시도, 삼국시대 목욕 차림 수정과 구도·손 좌우·배경 인물 등 시각 QA 차이를 그림 저장소 records/장료에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 육손 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 세 세계 묶음과 세계 간 중복 검사를 통과. 삼국시대 일상1 재시도와 메카 일상5의 안전 필터 네 차례 거절 뒤 단일 재계획 이력, 의상·구도·손 방향의 시각 QA 차이를 그림 저장소에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 원소 삼국시대 여섯 장과 판타지 기준컷 부분 등록
- data/img.json — 생성기로 만든 kr_mmorpg v3 삼국시대 기본컷·일상컷 5장 및 판타지 기본컷을 등록 도구로 추가. 판타지 일상1이 원본·동일 재시도·노출 두 단계 하향·계획기 재계획 후에도 안전 필터에 거절되어 규칙에 따라 중단. 7장의 크기·원본 해시·참고컷 해시·시각 QA 차이와 차단·미생성 11칸을 그림 저장소 records/원소에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 장비 세 세계 기본컷과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 기본컷 3장과 일상컷 15장을 등록 도구로 추가. 세 세계의 필수 갈래·장소·자세 중복 검사 통과. 판타지 일상3의 필터 재시도·계획기 재계획, 일상4 재시도 및 손 좌우·소품·의상·배경 인물 등 시각 QA 차이를 그림 저장소 기록에 남기고 기존 등록을 보존.

## 2026-11-02 · gpt · 문앙 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 세계별 두 필수 갈래·세계 간 장면 중복 검사와 1024×1536 크기 검사를 통과. 판타지 기준컷의 안전 필터 재시도 및 배경 인물·문자·의상 덮임의 시각 QA 차이를 그림 저장소 records/문앙에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 제갈량 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 세계마다 두 필수 갈래와 세계 간 장소·자세 중복 검사를 통과. 삼국시대·판타지 일상1의 안전 필터 재시도 및 계획 재생성, 입력 파일명 교정 이력과 의상·구도 등 시각 QA 차이를 그림 저장소에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 초선 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 삼국시대 일상1·메카 일상1·3은 안전 필터 절차 뒤 계획기로 재계획했으며 필수 갈래·세계 사이 중복 검사를 통과. 모든 생성본의 손·팔 연결과 계획 차이, 재시도 이력을 그림 저장소 기록에 남기고 기존 등록을 보존.

## 2026-11-02 · gpt · 여포 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계컷 3장과 일상컷 15장을 등록 도구로 추가. 계획 검사 통과, 필터 재시도·메카 일상4 재계획 및 구도·장식·배경 무기 등 시각 QA 차이를 그림 저장소에 기록하고 기존 등록을 보존.

## 2026-11-02 · gpt · 주유 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 기준컷 3장과 일상컷 15장. 세 세계 통합 계획으로 장소·구도 중복을 피했고, 안전 필터 재시도 및 해당 번호 재계획 이력과 시각 QA를 그림 저장소에 기록. 등록 도구로 추가하며 기존 등록과 다른 작업을 보존.

## 2026-11-02 · gpt · 손권 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 기준컷 3장과 일상컷 15장. 생성 도중 추가된 일상 무기 장신구 규칙과의 차이 및 배경 인물을 QA에 기록하고 원본 결과를 보존. 등록 도구로 추가하며 기존 등록과 다른 작업을 보존.

## 2026-11-02 · claude · 일상컷 — 무기는 들지 않고 그 무기를 본뜬 장신구로
- lib/prompt-sam.js · lib/prompt-spec.js — hold 가 무기(검 · 창 · 언월도 · 극 · 활 · 도끼 · 방패 …, isWeapon)면 일상컷에서 손에 드는 물건이 없고, 지시문에 SIGNATURE ACCESSORY 줄(무기 없이 그 모양 · 색의 작은 장신구 하나)을 넣는다(사용자 「무기를 일상컷에선 들고 있는것보단 악세사리류로 대체」 — 조운 창 끊김 · 하후돈 등 뒤 칼). 부채 · 두루마리 · 인장은 그대로 든다. 279명 중 무기 장수 149
- tools/casual-plan.cjs — 장수 카드가 casualHold 를 쓴다(무기 장수는 「그 장수의 물건을 든 컷」 규칙이 없다). tests/casual-plan.cjs — 무기 셋 · 부채 하나로 시험
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md — 규칙과 검수 항목

## 2026-11-02 · claude · GPT 세션은 AI 검수 뒤 묻지 않고 바로 올린다
- docs/IMAGE_AUTOMATION.md — 0절을 원소 공방과 같은 승인으로(사용자 「삼국지도 원소처럼 바로 올리게 바꿔줘」): 검수(qa)를 적고 묻지 않고 올리며, 검수에서 걸린 것도 passed:false 로 적고 올린다. 멈춤(block) 조건 · 덮지 않기 · 강제 push 금지는 그대로
- IMAGE_RULES.md · AGENTS.md — 「올리기 전에 사람이 본다」 에 GPT 세션 예외를 적고 문서를 가리킨다. 사람이 지켜보는 세션은 그대로 「올릴까?」

## 2026-11-02 · claude · 일상컷 계획기 — 칸 몇 개만 다시 짤 때도 그 장수의 물건 컷을 본다
- tools/casual-plan.cjs — 「그 장수의 물건을 든 컷(한두 장)」 을 새로 짠 칸 수(3 이상)가 아니라 묶음 전체로 본다. 하후돈 무협 casual10 한 칸만 다시 짜니 물건 컷이 없는 묶음이 통과됐다(사용자 「등뒤로 칼을 들고 있는데 저 자세는 불가능해」)

## 2026-11-02 · claude · 공용 트리 모듈 복사 — 코스튬 컷의 안 쓰는 프레이밍 칸
- lib/casual-tree.js · lib/casual-tree-v2.js — 공용 트리 모듈(game 원본)을 그대로 복사. 표에 costume_required.not_frames 가 있으면 그 옷 계열 컷에 그 프레이밍을 안 쓴다(이유 code costume). 이 공방 표엔 그 칸이 없어 동작은 그대로

## 2026-11-02 · claude · 일상컷 계획기 — 빈 기록 폴더 검사는 실패로
- tools/casual-plan.cjs — --check 가 기록 0 장(폴더 · --from 잘못)일 때 「통과 — 0 장」 으로 끝나던 것을 걸림으로

## 2026-11-02 · claude · 일상컷: 계획기 필수 · 세계 셋 같은 장면 금지 · GPT 자동화 문서
- IMAGE_RULES.md — 일상컷은 반드시 계획기로, 세계 셋이 같은 장면(장소 · 자세 추천 = 구도)을 쓰지 않는다, 옛 묶음을 두고 더할 땐 --fresh(사용자 「1,2,3 다 해줘」 · 「대체하는건 아니고, 추가로」)
- tools/casual-plan.cjs — --world all(세계 셋 한 번에) · --fresh(옛 묶음 뒤 번호로 새 다섯 장) · --others, 다른 세계 · 옛 묶음과 같은 장면 검사, --fresh 가 다음 인자를 값으로 먹던 것 고침
- tools/casual-check.py — 세계 사이 같은 장면 알림(옛 묶음은 실패로 치지 않는다)
- docs/IMAGE_AUTOMATION.md · tools/image-claim.cjs · tools/prompt-pack.cjs · tests/image-claim.cjs — 원소 공방의 GPT 자동화를 옮겼다. 올리기 전 사람이 보는 것은 그대로(삼국지엔 「묻지 않고 올린다」 승인이 없다)
- tests/casual-plan.cjs — 세계 셋 새 묶음 시험 · AGENTS.md — 문서 연결 · 검사 목록

## 2026-11-02 · gpt · 관우 세 세계의 모자란 일상컷 12장 보충
- data/img.json — 기존 일상1을 보존하고 삼국시대·판타지·메카의 일상2~5를 등록기로 추가해 세계마다 5장 완성. 두 필수 갈래·장면 중복·1024×1536·기준 그림 및 원본 해시를 확인했고, 생성 필터에 막힌 의상은 노출 완화와 장면 재계획 이력을 기록했다.

## 2026-11-02 · gpt · 조운 메카 정면 · 바닥에 짚은 수직 창
- 그림 저장소 img/조운_mecha_kr_mmorpg_f.webp · records/조운/mecha.kr_mmorpg-ui.json · records/replacement.json — 사용자 재수정 요청으로 정면을 보고 두 발로 서서 창을 몸 옆에 수직으로 짚는 자세로 교체. 창날부터 손·바닥 끝까지 한 축으로 드러내고 얼굴·갑옷·메카 배경은 이어 갔다. 이전 이미지 해시·기록 보존, 썸네일 재생성, 도감 파일명 유지.

## 2026-11-02 · gpt · 조조 일상컷 세 세계 각각 다섯 장 보충
- data/img.json — 세계별 기준 그림을 참고한 일상1~5 총 15장을 등록기로 추가. 세계마다 노출 갈래와 세계 안 갈래를 서로 다른 컷으로 확인했고, 생성 기록에 기준 그림·원본 해시와 의상 완화·재시도 이력을 남겼다.

## 2026-11-02 · claude · 지시문 — 창 · 무기는 끊기지 않는 한 자루로
- lib/prompt-spec.js · lib/prompt-sam.js: 세계 그림의 SIGNATURE ITEM 줄과 일상컷에서 그 장수의 물건을 들 때(SIGNATURE ITEM SHAPE 줄)에 「한 번만 그리는 온전한 물건 — 창 · 언월도 · 극 · 지팡이 · 활은 자루 끝에서 날까지 곧은 한 줄, 날은 하나, 몸 앞이나 옆에 — 머리 · 어깨 뒤로 지나가지 않고, 꺾이거나 몸 · 팔에 끊기거나 둘이 되지 않는다, 화면에 잘리면 곧은 한 줄로 나간다」(사용자 「창이나 무기가 잘리지 않도록 지시문 수정」 — 조운 메카 세계 그림의 창이 머리 뒤로 끊기고, 메카 일상컷의 창대가 꺾였다).
- 조운 메카 세계 그림은 일상컷과 얼굴이 이어져야 해서 그대로 둔다(사용자). tests/casual-tree-v2.cjs — 추천 × 장소의 대표 옷을 정해 둔 갈래가 아닌 것 먼저(앞 칸의 클로즈업 규칙과 맞춤).
## 2026-11-02 · gpt · 조운 메카 창대 연결 수정
- 그림 저장소 img/조운_mecha_kr_mmorpg_f.webp · records/조운/mecha.kr_mmorpg-ui.json · records/replacement.json — 사용자 지적대로 창대의 중간 구간을 드러내고 손잡이·용 장식 창날까지 한 축으로 정렬하는 이미지 편집. 얼굴·갑옷·배경은 유지하고 이전 이미지 해시와 기록을 보존. 이전 썸네일은 삭제해 자동 재생성, 도감 파일명은 그대로.

## 2026-11-02 · claude · 일상컷 — 정해 둔 갈래 컷엔 얼굴 클로즈업을 쓰지 않는다
- data/casual-tree.json frame_rules.face_close.not_required — 노출 · 세계 안 갈래 컷이 얼굴 클로즈업으로 짜이면 옷이 안 남아 갈래가 무의미했다(유비 · 조운 노출 갈래 보충을 짜다 보니 계획기가 클로즈업만 냈다). pkm 과 같은 규칙, 공용 모듈이 이미 읽는다.

## 2026-11-02 · claude · 진군 화살표 — 화살촉은 선이 다 그려진 뒤에
- 선을 그리는 동안 화살촉(marker)을 떼었다가 다 그려지면 단다 — 그리기 시작할 때 화살촉이 끝에 먼저 떠 있던 것(사용자 「화살촉은 선 다 그려진 뒤에 나오게」). 움직임 줄이기면 처음부터 화살촉째로.

## 2026-11-02 · gpt · 하후돈 필수 갈래 보충과 사마의 세 세계 그림 등록
- data/img.json — 하후돈은 먼저 등록한 세계별 일상 1~5번을 보존하고 역할극 casual6을 세계마다 추가(총 21장). 사마의는 세계 그림 3장과 세계별 일상 5장(총 18장); casual1 홈웨어와 casual3 역할극으로 서로 다른 두 필수 갈래를 채웠다.
- sam-atelier-img의 img/ · records/ — 생성기 kr_mmorpg v3 지시문, 원본·출력·참고 해시와 재시도 기록을 저장. 39장 전체 디코딩·해시 검증 및 tools/casual-check.py의 두 장수 세 세계 검사를 통과.

## 2026-11-02 · claude · 전장 움직임 — 깃발 꽂기 · 진군 화살표 · 이름표 차례로 · 그림 날아오기
- Framer Motion 은 React 전용이라 같은 팀 Motion 의 작은 판(animate + spring)을 묶어 lib/vendor/motion-mini.mjs(압축 5KB)로 두고, lib/motion-fx.js 에 효과를 모았다(사용자 「Framer Motion 으로 전장에 이펙트」 → 「둘 다 붙여줘」).
- 전장: 자리를 고르면 깃발이 떨어져 꽂히며 튕긴다, 같은 진영이 둘 이상 서면 세운 차례대로 진군 화살표가 그려진다(진영 색, 살짝 휜 길), 진영 · 무리를 바꾸면 이름표가 차례로, 미리 보기 · 크게 보기 그림은 누른 이름표 · 자리에서 날아와 커진다. 위치 · 크기 · 투명도만, 움직임 줄이기면 끈다.
- tests/screen.cjs — 시험 서버가 .mjs 를 자바스크립트로 내준다.

## 2026-11-02 · claude · 일상컷 묶음 계획기 — element 에서 옮김
- tools/casual-plan.cjs · tests/casual-plan.cjs 새로(사용자 「일상컷 계획 도구도 옮겨와줘」). 한 장수의 한 세계 일상컷 다섯 장을 겹치지 않게 한 번에 — 생성기와 같은 lib/casual-tree-v2.js · lib/prompt-sam.js 로 장면을 고르고 기록 · 지시문을 생성기 꼴로 쓴다. 이미 있는 번호는 짜지 않고 겹침 검사에만.
- 삼국지 규칙으로: 정해 둔 두 갈래(노출 갈래 — 장수마다 란제리풍 · 수영복 · 역할극을 돌려 가며, 세계 안 갈래 — 세계 안 시대의 방 · 목욕 · 지붕 · 여관)를 앞 칸부터 · 시대 넷(지금 현실 · 역사의 자리 · 세계 안 · 무대·환상) · 그 장수의 물건(hold) 한두 장 · 그림 저장소의 다른 장수 기록에서 덜 쓴 장소 · 옷 · 자세 · 표정 · 소품 먼저. --check 로 올리기 전 묶음 검사.

## 2026-11-02 · gpt · 하후돈 세 세계 그림과 세계별 일상컷 다섯 장 등록
- data/img.json — kr_mmorpg v3 세계 그림 3장과 각 세계 참고 그림으로 만든 일상컷 15장을 등록 도구로 추가. 기존 그림과 등록 항목을 보존.

## 2026-11-02 · claude · 전장 지도 확대 · 축소
- 지도 오른쪽 아래 − ＋ 맞춤(100~400%), 폰은 두 손가락 벌리기, PC 는 Ctrl(⌘)+휠, 확대하면 끌어서 옮기기 — 손가락 · 마우스 자리를 붙잡고 커진다(사용자 「전장 이미지 확대, 축소 기능도」).
- 자리는 지도 백분율이라 함께 커지고 이름표 글씨는 그대로라 확대하면 겹치던 이름표가 풀린다. 전장 · 세계를 바꾸면 맞춤으로.

## 2026-11-02 · claude · 일상컷 — 세계마다 두 장은 정해 둔 갈래
- IMAGE_RULES.md · data/casual-tree.json(required.note): 세계마다 다섯 장 중 노출 갈래(란제리풍 · 수영복 · 역할극) 한 장 + 세계 안 갈래(방 · 목욕 · 지붕 · 여관) 한 장을 서로 다른 컷으로 확정, 나머지 세 장은 자유(사용자 「각각 1장해서 2장은 확정」 — 전엔 둘 중 하나만 한 장 이상).
- tools/casual-check.py 새로 — 그림 저장소 기록의 scene 으로 세계마다 두 갈래가 채워졌는지, --plan 으로 남은 칸에 넣을 갈래. 지금 유비 · 조운 · 하후돈은 세 세계 모두 노출 갈래가 없다(세계 안 갈래는 casual1).

## 2026-11-02 · claude · 전장 — 일곱 전장 지도에 장수를 세운다 · 군웅은 열넷의 무리로
- battle.html · lib/battle.css · data/battles.json 새로. 호로관 · 장판파 · 한중 · 관도 · 이릉 · 적벽 · 오장원을 삼국시대 · 판타지 · 메카로 각각 다른 구성의 지도 21장(사용자 「21장 따로따로」, 그림 저장소 backgrounds/battles/), 지도마다 이름 붙은 장수 자리 여덟을 그림을 보고 잡았다.
- 진영을 고르면 역할 넷(군주 · 무장 · 책사 · 문관 — 사용자 「역할 넷 그대로」)별 이름표, 누르면 그림 미리 보기 → 배치하기 → 지도의 자리, 선 자리를 누르면 크게 보기 · 다른 자리로 · 빼기. 배치는 전장 × 세계마다 이 브라우저에, 진영을 섞어 세운다. 머리 메뉴 · 타이틀 메뉴에 「전장」.
- 군웅 102명을 소속 무리 열넷(동탁군 · 여포군 · 원소군 · 원술군 · 공손찬군 · 형주 · 익주 · 한중 · 서량 · 남만 · 황건 · 한 조정 · 재야 · 그 밖의 제후)으로 — 설계표 군웅 세력에 camps, 장수에 camp(사용자 「군웅쪽도 각 진영별로」). tools/sam-design.py check 가 군웅마다 camp 를 본다.

## 2026-11-02 · gpt · 조운 일상컷 다섯 장 규칙 보충
- data/img.json — 세 세계의 casual4·5 여섯 장을 등록기로 추가해 세계마다 일상컷 다섯 장을 채웠다. 기존 1~3번과 기준컷을 보존하고, 새 컷은 각 세계 기준컷을 참고한 서재·테라스 휴식. WebP·생성 지시문·참고 해시는 sam-atelier-img에 기록.

## 2026-11-02 · gpt · 유비 일상컷 다섯 장 규칙 보충
- data/img.json — 세 세계의 casual4·5 여섯 장을 등록기로 추가해 세계마다 일상컷 다섯 장을 채웠다. 기존 1~3번과 기준컷을 보존하고, 새 컷은 각 세계 기준컷을 참고한 요리·등불 산책. WebP·생성 지시문·참고 해시는 sam-atelier-img에 기록.

## 2026-11-02 · claude · 화면이 늦게 뜨던 것 — 글꼴을 쓰는 것만 · 그리기를 막지 않게
- 모든 화면이 제목 글꼴 넷(Song Myung · Hahmlet · Orbit · Noto Serif KR)을 한꺼번에 받아 글꼴 목록만 수백 KB, 그걸 받기 전엔 화면이 안 그려졌다(사용자 「화면 로딩이 엄청 느린데」).
- 제목 글꼴은 lib/workspace-theme.js 가 지금 공간의 것 하나만 붙이고, 본문 글꼴은 400 · 700 두 굵기만, 글꼴 줄은 전부 그리기를 막지 않게(media=print → onload). 한자 도장 · 세력 기호 글꼴은 쓰는 112자만(text=) — tests/fonts.cjs 가 빠진 글자를 본다. 군막 첫 그리기 0.37초 → 0.2초 안팎, 받는 글꼴 1.6MB → 0.8MB(도감).

## 2026-11-02 · claude · 타이틀 작은 글씨 12px
- 폰 현판 아랫줄(10~12px)과 공간 넘기기 설명(11px)을 12px로 — 원소 공방 점검에서 같이 걸린 것.

## 2026-11-02 · claude · 그림 규칙 — 일상컷 세계마다 다섯 장
- IMAGE_RULES.md 2절: 일상컷을 세계마다 세 장 → 다섯 장(casual1 ~ casual5)으로. 이미 세 장 있는 세계는 4 · 5 를 더하고 앞 셋은 그대로(사용자 「일상컷은 5장으로 고쳐줘」). 생성기 번호 고르기(1~9) · 도감 · 등록은 장 수를 묶지 않아 그대로.

## 2026-11-02 · claude · 군막 점검 반영 — 세력 카드 전체가 도감 길 · 단추 44px · 글씨 12px
- 세력 카드 이름 링크(25px)만 누를 수 있던 것을 카드 전체가 그 세력의 도감으로 가게(키보드 초점은 카드 테두리로 보임). 공간 고르기 · 배경 끄기 · 패치 기록 단추를 44px로, 최근 그림 · 빈 칸 아랫줄 글씨 11~11.5px → 12px(사용자 「군막도 고쳐줘」).

## 2026-11-02 · claude · 도감 · 프롬프트 점검 반영(frontend-design · ui-ux-pro-max)
- 도감: 폰 단추를 손가락 크기 44px로, 「그림 있는 것만」 체크 상자를 공간 단추로, 거르기 줄은 옆으로 밀되 오른쪽 끝을 흐려 더 있다는 표시, 붙는 판을 평평한 바탕 대신 비치는 막으로, 「세력 설명」에 펼침 표시(▸).
- 글꼴: 한자(魏 蜀 吳 雄 · 성씨 도장)를 고정폭 글꼴 대신 Noto Serif KR로, 능력치 숫자와 빈 칸 「아직 없다」(11px)를 본문 글꼴 12px로, 설계 고르기를 공간 테두리의 선택 상자로. 폰 머리 메뉴 글씨 11→12px, 머리 설명은 한 줄.
- 프롬프트: 폰 붙는 단계 줄이 바탕 장면을 자르던 불투명 띠를 걷고 내려 읽을 때만 비치는 막, 「?」 단추에 「설명 보기」 글씨, 비어 있는 단계는 「—」 대신 이름(세력), PC 본문을 머리 · 메뉴와 왼쪽 줄 맞춤, 판 안 고르기 칸은 틀 대신 얇은 선.

## 2026-11-02 · claude · 군막 머리말 위 작은 「삼국지 공방」 표시 뺌
- 머리 제목과 겹치는 꾸밈 표시라 지움 — 머리말은 「장수 한 명이 여성 한 명이 된다.」부터(사용자 「그 작은 삼국지 공방 표시도 지워줘」).

## 2026-11-02 · claude · 군막 문을 그림 단추로 · 세계마다 제목 글꼴 · ui-ux-pro-max skill
- 군막 문 셋을 타이틀과 같은 공간별 그림 단추로(CSS 상자 · 1px 테 대신), 폰에선 타이틀처럼 위에서 아래로(사용자 「디자인이 촌스럽다 — 폰트도, border 도」).
- 제목 글꼴을 세계마다 — 무협 Song Myung(직지 목판 명조) · 판타지 Hahmlet · 메카 Orbit. 머리 제목 · 섹션 제목 · 타이틀 현판 · 단추가 따르고 본문은 IBM Plex Sans KR 그대로. 굵기가 하나뿐인 글꼴이라 가짜 굵게를 끔.
- 그림 단추 변수(--ui-*)를 타이틀 안에서 lib/material.css 로 옮겨 두 화면이 같이 씀. 디자인 점검 skill ui-ux-pro-max 를 myth-atelier 에서 옮겨 설치(AGENTS 「꾸밈 · 글꼴」).

## 2026-11-02 · claude · 군막 문 설명 줄 뺌
- 군막 첫 칸의 문 셋(드래프트 · 도감 · 프롬프트)에서 아랫줄 설명을 지우고 이름만 — 문 높이를 줄이고 가운데 맞춤, 폰에서도 셋이 한 줄(사용자 「메뉴이동 버튼의 하위 텍스트는 삭제」).

## 2026-11-02 · claude · 군막 문에서도 「오늘의 대국」 뺌 · 타이틀 메뉴를 머리 메뉴 차례로
- 군막 문을 셋(드래프트 · 도감 · 프롬프트)으로 — 드래프트 문 설명에 「오늘의 대국도 여기서」. 좁은 화면에선 드래프트 문이 한 줄을 다 쓰고 둘이 그 아래.
- 타이틀 메뉴 차례를 머리 메뉴와 같게 — 군막 · 드래프트 · 도감 · 프롬프트(사용자 「군막에서도 빼주고 타이틀 메뉴 순서를 헤더랑 동일하게」).

## 2026-11-02 · claude · 타이틀 메뉴에서 「오늘의 대국」 뺌
- 드래프트와 같은 게임이라 타이틀 메뉴를 넷(드래프트 · 도감 · 프롬프트 · 군막)으로(사용자 「드래프트랑 오늘의 판은 같은 메뉴니까 하나는 없애줘」).
- 오늘의 대국은 게임 안 새 대국 설정 단추 · 주소 ?daily 그대로 — 드래프트 단추 아랫줄을 「삼국지 쟁탈전 · 오늘의 대국」으로.

## 2026-11-02 · claude · 타이틀 — 폰 현판 글씨가 판 안에 · 빈 곳 누르면 배경만
- 폰에서 현판 글씨가 장식을 넘던 것 — 제목 화면 너비에 맞춰 19~24px, 아랫줄 10~12px 로(360·414px 아홉 공간 확인).
- 타이틀 빈 곳을 한 번 누르면 메뉴·소개가 사라지고 배경 장면만, 다시 누르면(또는 Esc) 돌아옴. 숨긴 동안에도 ← → 로 공간을 넘겨 장면 구경(사용자 「바탕화면 한 번 탭하면 목록이 없어지게」).

## 2026-11-02 · claude · 타이틀 현판 글씨 조금 작게
- 현판 위 「삼국지 공방」 글씨를 PC 최대 42→34px, 폰 30→26px 로 줄임(사용자 「타이틀 텍스트 크기 좀만 줄여줘」).

## 2026-11-02 · claude · 타이틀 현판·단추를 그림으로 — 공간마다 한 벌
- 현판·주 단추·보통 단추·둥근 단추를 공간 아홉마다 같은 재질의 투명 그림 한 장(그림 저장소 backgrounds/ui/)에서 잘라 씀 — 배경 장면과 따로 놀던 CSS 판·단추를 바꿈(사용자 「버튼이나 타이틀이 너무 따로 노는감」).
- 글씨는 그대로 낱말 표에서 얹고, 주 단추 글씨색은 그림 가운데 밝기로 공간마다 정함. 메뉴를 감싸던 틀 상자는 걷고, 밝은 공간도 메뉴 쪽은 어둡게 깔아 글씨가 섬.

## 2026-11-02 · claude · 타이틀 화면 — 배경 장면을 화면 가득, 공방 안내판은 군막으로
- index.html(새) — 사용자 「너무 배경이 안 보이는데, 첨부했던 UI 처럼 메인화면을 게임 첫 진입화면처럼, 지금 메인은 거기서 버튼 눌러서 들어가는 식으로」. 공간 배경 장면이 화면 가득(메뉴 쪽만 옅은 막), 공간 장식 틀 안에 공방 현판(주 단추 얼굴)과 큰 메뉴 다섯 — 드래프트 · 오늘의 대국 · 도감 · 프롬프트 · 군막, ◀ ▶ · ← → 로 공간 아홉 넘기기, 오른쪽 아래에 공간의 이야기. 폰은 메뉴가 아래, 배경이 위. 예전 게임 주소 넘기기는 여기 그대로.
- hall.html(← index.html) · lib/workspace-ui.js · lib/words.js — 공방 안내판은 「군막」 으로(머리 항해 군막 · 드래프트 · 도감 · 프롬프트, 문양은 타이틀로).
- lib/material.css · tests/screen.cjs · AGENTS.md — 메뉴 단추도 공간별 꾸밈, 타이틀 검사(메뉴 · 공간 넘기기 · 배경)와 군막 검사.

## 2026-11-02 · claude · 공간별 꾸밈 — 장식 틀 · 배경 장면 · 단추 모양을 공간 아홉마다
- lib/material.css — 사용자가 보인 레퍼런스(무협 비취 현판 · 판타지 룬 양피지 · 메카 네온 강판) 「이런 식의 배경이나 버튼 css 로는 어려울까?」 → CSS 만의 시안을 먼저 보이고 「공간별로 따로 적용해줘」. 공간마다 생성한 장식 틀(가운데 투명)을 9칸 틀(border-image, 잰 모서리 14~21%)로 섹션 · 패널 · 공간 고르기 · 세력 카드 · 내비게이션에 — 레이아웃은 그대로 그림 폭만. 단추는 공간마다 모양 · 얼굴 · 테 · 빛: 강호 객잔 등롱 알약 · 도화검무 비취 육각 현판 · 주칠 궁전 계단 모서리 칠기 · 금서고 책 표지 + 자수정 · 요정 숲 잎 · 용의 대장간 화살촉 + 불씨 보석 · 네온 우중 팔각 네온 · 정비 격납고 비스듬한 강판 + 해저드 띠 · 궤도 일출 그라데이션 테 알약. clip-path 가 포커스 테를 자르므로 :focus-visible 에선 모양을 풀고 맞색 테. 버튼 얼굴은 앞서 깐 판 재질 규칙에서 뺐다(고른 칸이 재질에 덮여 글자가 안 보이던 것).
- 그림 저장소 backgrounds/frames/ · backgrounds/room-*.webp · records/backgrounds/ — 틀 아홉(투명, 512px)과 배경 장면 아홉(1536×1024, 쪽 배경 · 공간 고르기 그림 자리), 지시문 · 처리 · 원본 sha256.
- AGENTS.md — 자리.

## 2026-11-02 · claude · 질감 — 판 · 단추 · 내비게이션에 공간마다의 재질
- lib/material.css(새) · index.html · dex.html · prompt.html — 사용자 「버튼이나 div창, 네비게이션 bar 등에도 어울리는 질감 표현을 얻을 수 있을까? 필요하면 이미지 생성 도구」. 공간마다 재질 한 장을 생성해(먹물 번진 닥종이 · 비단 · 금박 든 주칠 · 마도서 가죽 · 이끼와 나무껍질 · 두드린 강철 · 빗방울 유리 · 콘크리트 · 단열 포일) 이음새 없는 타일로 만들어 판 바탕에 바탕색 86% 막 아래 깔았다. 단추는 위 빛 · 아래 그늘(보조), 광택 한 겹 · 공간의 빛(주 — 등롱 · 금테 · 결계 · 용암 · 네온 · 일출). 내비게이션 무늬는 CSS — 대발 · 금실 · 문살 · 금박 점 · 열매 점 · 리벳 · 스캔라인 · 해저드 띠 · 별가루+일출 띠. 쪽 배경과 공간 고르기 그림 자리는 배경 그림이 없으면 재질.
- lib/workspace.css · lib/room.css — 재질 위 글자 대비를 재질의 가장 밝은 · 어두운 2% 까지 섞어 계산해 4.5:1 이 모자란 밝은 공간 셋의 색을 계열 그대로 조금 짙게(도화검무 · 요정 숲 · 정비 격납고의 주색 · 맞색 · 금속 · 흐린 글), 쪽 배경 맨 밑 층에 재질.
- 그림 저장소 backgrounds/textures/ · records/textures/ — 재질 아홉(합 472KB)과 지시문 · 처리 · 원본 sha256.

## 2026-11-02 · claude · 공간 아홉을 다시 짬 — 무협 · 판타지 · 메카, 계열이 다른 색이 부딪히는 팔레트
- lib/workspace.css · lib/workspace-theme.js · lib/room.css · lib/workspace-ui.js · lib/words.js · lib/img.js — 사용자 「콘셉트 비주얼 디렉터로서, 한 색의 명도·채도만 바꾸는 지루한 조합 말고 서로 다른 계열의 색이 부딪히며 독창적인 내러티브를 만드는 팔레트로 — 무협 · 판타지 · 미래 메카와 연상되는 소재로」. 옛 아홉(한 색 계열)을 내리고 새 아홉: 강호 객잔(먹빛 청록 × 등롱 주홍 × 비취 · 금박) · 도화검무(복사꽃 분홍 × 청록 검기 × 먹, 기본) · 주칠 궁전(주칠 × 비취 × 군청 · 금박) · 금서고(자줏빛 결계 × 금박 장정 × 독초 연두) · 요정 숲의 아침(이끼 × 자수정 × 산호) · 용의 대장간(강철 청회 × 용암 주황 × 서리 청) · 네온 우중(남흑 × 핫 마젠타 × 시안 · 산성 노랑) · 정비 격납고(콘크리트 회색 × 경고 주황 × 정비 청) · 궤도 일출(남보라 우주 × 일출 산호 × 오로라 민트). 공간마다 문양(등롱 · 검과 꽃 · 지붕 · 마도서 · 버섯 · 모루와 불 · 간판과 비 · 해저드 줄 · 행성과 해)과 빛 번짐 두 색, 글자 대비는 아홉 모두 4.5:1 이상(계산으로 검사). 공간 열쇠가 바뀌어 저장 칸을 samguk_room_v2 로(옛 값은 새 기본으로).
- lib/sam.css — 세 색이 같이 보이게: 제목 밑 세 띠(주색 · 맞색 · 금속), 머리말 · 문 이름은 맞색, 문을 짚으면 금속 테두리.
- tests/screen.cjs · AGENTS.md — 공간 고르기 검사와 자리.

## 2026-11-02 · gpt · 조운 세계 셋 · 일상컷 아홉 등록
- data/img.json — kr_mmorpg v3의 삼국시대·중세 판타지·메카 기준컷과 세계별 일상컷 셋씩, 총 12장을 등록기로 추가. 유비 등 기존 등록은 보존하고 WebP·지시문·참고 해시·재시도 기록은 sam-atelier-img에 저장.

## 2026-11-02 · claude · 첫 화면 · 게임은 draft.html 로 · 공간 넷 더함
- index.html · lib/sam.css · lib/words.js — 사용자 「공방 처음 진입 화면 만들어줘. 다른 공방처럼」. 새 첫 화면: 문 넷(드래프트 · 오늘의 대국 · 도감 · 프롬프트) · 세력 넷 카드(장수 · 확정 · 시안 · 그림 수, 누르면 그 세력 도감) · 최근 그림 여덟 · 패치 기록 · 공간 고르기. 예전 게임 주소의 몫(?daily · ?local · #sam-transfer)은 draft.html 로 그대로 넘긴다.
- draft.html(← index.html) · sam.webmanifest · tools/sam-design.py · tests/assets.cjs · tests/regression.cjs · tests/dot-screen.cjs · tests/words.cjs — 게임은 한 글자도 안 바꾸고 이름만 옮겼다(게임은 제 주소를 location.pathname 으로만 쓴다). 설치 앱 시작은 그대로 게임(start_url ./draft.html).
- lib/workspace.css · lib/workspace-theme.js · lib/room.css · lib/workspace-ui.js — 사용자 「테마도 몇가지 추가」. 공간 넷 — 적벽의 밤(검붉은 강 · 불배 주황) · 도원(복사꽃 분홍 · 잎 초록) · 북방 설원(눈빛 · 위의 남색) · 동작대(청동 금빛 · 비취), 문양(불배 · 복사꽃 · 눈꽃 · 누대와 참새). 항해에 「드래프트」. 원래 다섯의 주석도 삼국지 말로.
- tests/screen.cjs · AGENTS.md · CLAUDE.md · README.md — 첫 화면 검사(문 · 세력 · 공간 아홉 · 패치 · 옛 주소 넘기기)와 자리.

## 2026-11-02 · gpt · 유비 세계 셋 · 일상컷 아홉 등록
- data/img.json — 기본 kr_mmorpg v3 세계 그림 셋과 세계별 참고 그림으로 만든 일상컷 셋씩, 총 12장을 등록기로 추가. 앞 장수의 등록은 보존했다. WebP와 지시문·참고 해시·생성 기록은 sam-atelier-img에 저장.

## 2026-11-02 · claude · 체형 — 굴곡형 시안 40명을 풍만형 · 모래시계형으로
- data/sam-design.json — 사용자 「굴곡형 일부를 풍만형·모래시계형으로 옮겨줘」. 수수한 굴곡형(curvy) 시안 59명 중 40명을 번갈아 모래시계형 20 · 풍만형 20 으로(요약 · why 도 고침), 확정 장수는 그대로. 이제 풍만형 57 · 탄탄한 굴곡형 53 · 모래시계형 39 · 장신 굴곡형 33 · 가늘고 풍만한 형 32 · 건장한 굴곡형 30 · 굴곡형 20 · 아담한 굴곡형 15.

## 2026-11-02 · claude · 위 · 오 · 군웅 시안 214 — 자동 설계가 하나도 안 남았다
- data/sam-design.json — 사용자 「위·오·군웅 시안부터 다 써줘」. 위 64 · 오 50 · 군웅 100 을 시안으로(이름 설명 · 성정 · 고유 물건 · 머리 · 눈 색 · 인상 · 표정 · 체형 · 한국어 요약 · why). 남만은 그은 · 짙은 피부, 황건은 누런 머리, 사마사는 비단 붕대 한쪽 눈, 여령기는 아버지의 꿩깃. 말을 부를 말(백마장군 · 천리마 · rider · 늑대를 집에 들였다)은 「새하얀 정예 · 재목 · 무인 · 스스로 화를 불렀다」 로 바꿨다. 이제 자동 0 · 시안 266 · 확정 13, 장수 279 × 세계 셋 지시문 837 개가 조립된다. 같은 세력 안 같은 조합(체형 · 머리색 · 인상)은 많아야 셋.

## 2026-11-02 · claude · 촉 시안 52 — 자동 설계를 시안으로
- data/sam-design.json — 사용자 「가로 진행」. 촉의 자동 설계 52명을 시안(draft)으로: 장수마다 이름 설명 · 성정 · 고유 물건(마초 백은 용두 창 · 황충 큰 활 · 방통 봉황 깃 부채 · 위연 초승달 대도 · 황월영 나무 톱니 기계 …) · 머리 · 눈 색 · 인상 · 표정 · 체형 · 한국어 요약. 자동 돌림이 「풍만형 · 밤색 · 날카로움」 을 여섯 명에게 똑같이 줬던 것을 풀었다(같은 조합 많아야 둘). 팔을 잃은 장억은 몸 이상 대신 붕대 감은 팔뚝, 큰 귀 · 말 같은 것은 넣지 않았다. 헤어 · 얼굴형 · 눈 모양(세계마다)은 자동 돌림 그대로.

## 2026-11-02 · claude · 설계 상태 — 자동 · 시안 · 확정, 다시 설계 요청
- tools/sam-design.py · data/sam-design.json — 사용자 「두 가지 같이 하는 방법은? 손 설계가 마음에 안들면 다시 설계」 → 「가(시안 상태로도 그린다)로 진행」. designed 는 auto · draft · hand, 시안 · 확정은 summary.ko · design_by · design_date 가 있어야 한다. approve(시안 → 확정) · redo(다시 설계 요청 — redo {why, date}) · status 명령, 다시 쓸 때 앞 설계는 history 로. 손 설계 열셋은 확정으로 두고 한국어 요약을 적었다.
- dex.html · lib/words.js · lib/sam.css · tests/screen.cjs — 장수 카드에 ✎ 시안 · ★ 확정 · ↺ 다시 설계 표시와 한국어 설계 요약, 다시 설계 까닭. 설계 상태 거르기(전부 · 시안 · 다시 설계 · 확정 · 자동, 주소 ?st=). 그림이 생긴 조조 대신 그림 없는 장수로 빈 칸 검사.
- AGENTS.md · IMAGE_RULES.md — 상태와 흐름.

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
