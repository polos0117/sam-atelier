---
name: api25
description: 삼국지 장수 그림을 OpenAI 그림 API(gpt-image-2.5-sunburst, 화풍 열쇠 api25)로 뽑는다 — 세계 그림 네 장(우리 설계 둘 + GPT 설계 둘) → 사용자가 고르면 → 일상컷 여섯 장 → 그림 저장소에 올리기. "조조 2.5로 뽑아줘", "<장수> api25", "2.5 API 로 <장수> 그려줘" 처럼 장수 이름과 2.5 · API 가 같이 오면 쓴다.
---

# 2.5 API 로 장수 그림 뽑기

사용자 2026-11-09 「2.5로 해야겠다」 · 「2.5로 이미지 뽑는거 스킬로 만들어둘까?」 → 「응 만들어줘」. 매달 API 크레딧 안에서 나눠 그린다 — **장수와 장수 수는 사용자가 정한다**, 넘겨짚어 더 그리지 않는다.
규칙의 원본은 `IMAGE_RULES.md`(1절 · 7절), `docs/IMAGE_AUTOMATION.md`(6 · 7 · 9절). 손은 `tools/api-draw.cjs`(검사 `tests/api-draw.cjs`). 말은 늘 한국어 반말.

## 0. 시작 전

- 키는 환경 변수 `OPENAI_API_KEY` 로만 쓴다 — 값을 찍거나 파일 · 커밋에 적지 않는다. Node 는 `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_NO_WARNINGS=1` 을 붙인다(클라우드 세션).
- 두 저장소를 받는다: `sam-atelier`(코드) · 옆 `sam-atelier-img`(그림). `git pull --rebase origin main`.
- `node tools/image-claim.cjs status` 로 그 장수가 다른 세션에서 `working` 인지 본다 — 그렇다면 멈추고 묻는다.
- **장수 하나당 30장**(세계 그림 4 × 3 + 일상컷 6 × 3)과 예상 토큰(그림 한 장 출력 약 343)을 먼저 말하고 시작한다. 이미 등록된 `api25` 그림이 있으면 그 자리는 빼고 센다.
- 작업 폴더는 스크래치패드 `api25/<장수>/` (`W`). 원본 PNG 는 여기 두고 그림 저장소엔 올리지 않는다.

## 1. 세계 그림 — 세계마다 네 장

```bash
node tools/api-draw.cjs world <장수> <세계> --out $W --n 2          # 우리 설계 둘 → <세계>-ours1.png · -ours2.png
node tools/api-draw.cjs brief <장수> <세계>                          # GPT 자유 설계 주문(읽기만)
node tools/api-draw.cjs free  <장수> <세계> --text $W/<세계>-gpt1.txt --tag gpt1 --out $W --by claude   # 둘째도 gpt2
```

- **GPT 설계 둘은 Claude 가 쓴다**(대화 토큰 0 — 사용자 「3번은 따로 도구없이 여기다가 얘기하면 되는거잖아」): 주문을 읽고 「fixed」 칸(의상은 그 역할 묶음 실루엣에서 하나 · 무기 · 색 · 머리색 · 노출 · 얼굴 비율 · 구도)은 그대로, 얼굴 · 눈색 · 헤어스타일 · 화장 · 표정 · 자세 · 장면만 새로, 전설에서 딴 아이디어 하나를 의상 구조에. 둘째는 첫째와 확실히 다르게. 글자 · 문구를 그리게 하지 않는다(깃발 한 글자 말고).
- 사용자가 「GPT 세션에 맡겨」 라고 하면 `node tools/free-brief.cjs <장수>` 로 주문을 그림 저장소 `free/<장수>/` 에 올리고 `REQUEST.md` 를 건넨다. 세션이 `-gpt1.txt` · `-gpt2.txt` 를 올리면 그 글로 `free … --by gpt-session`.
- 붙여 보여 주고 **멈춘다** — 세계마다 고를 때까지 일상컷으로 가지 않는다:
  `node tools/api-draw.cjs sheet $W/<세계>-sheet.jpg $W/<세계>-ours1.png $W/<세계>-ours2.png $W/<세계>-gpt1.png $W/<세계>-gpt2.png --labels 1,2,3,4` — 번호는 우리 설계 1 · 2, GPT 설계 3 · 4(사용자 2026-11-09 「gpt 가 만든건 3,4로 할게」). 사용자는 세계 차례(무협 · 판타지 · 메카)로 번호만 말한다 — 「1,1,2」

## 2. 일상컷 — 세계마다 여섯 장

```bash
node tools/casual-plan.cjs <장수> --world all --style api25 --out $W/plan      # plan-<세계>/plan.json (필수 셋 · 상황 · 색 · 데니어 · 옷 자유 한 장)
node tools/api-draw.cjs casual $W/plan/plan-<세계>/plan.json --ref $W/<고른 세계 그림>.png --out $W --free <N>=$W/<세계>-casual<N>-free.txt
```

- 옷 자유 컷(계획에 「옷 자유」)은 Claude 가 그 컷 지시문의 **Outfit 줄만** 우리 옷 목록(`data/casual-tree.json` outfits)에 없는 노출 의상으로 바꿔 쓴 글을 `--free N=` 로 준다. 다른 줄은 한 글자도 바꾸지 않는다.
- 옷 자유 글을 쓰기 전에 그림 저장소 `records/*/*-casual*.api25-ui.json` 의 `generation.free_prompt` 를 훑어 **앞선 옷 자유 컷과 같은 옷 · 같은 결을 다시 쓰지 않는다**. 옷 목록(갈래)에 새 옷을 더하지 않는다 — 목록에 없는 쪽이 옷 자유 컷의 몫이다(사용자 2026-11-09 「이걸 얘기해주면 너가 쓸 자료가 더 없어지잖아」).
- 참고 그림은 그 세계에서 사용자가 고른 그림. 도구가 768×1152 로 줄여 보낸다(기본, 기록 `generation.ref_sent` — 입력 토큰 약 22% 덜, 2026-11-09 시험에서 얼굴 · 화풍 같았다). 원본으로 보내려면 `--ref-size 0`.

## 3. 막히면(IMAGE_RULES 1절)

도구가 같은 지시문으로 한 번 더 한다. 그래도 막힌 자리는 끝에 「막혀 건너뛴 자리」 로 나온다(종료 코드 3) →
세계 그림 `world … --exposure moderate`(그다음 `low`), 일상컷 `casual … --slots N --exposure N=moderate`(그다음 `low`) — 노출 말고 다른 말은 바꾸지 않는다.
적게에서도 막히면 그 칸만 계획을 바꾼다(일상컷 `casual-plan --slots N --seed <다른 수>`, 세계 그림은 장면 · 자세 칸). 그래도 막히면 그 자리는 멈추고 보고한다.

## 4. 올리기

사용자에게 시트로 보이고 「올릴까?」 — 좋다면:

```bash
node tools/api-draw.cjs stage <장수> --img ../sam-atelier-img $W/<세계>-<고른 것>.png=<세계> $W/<세계>-casual1.png=<세계>-casual1 …
```

- webp(품질 90, 1024×1536) + 기록(`records/<장수>/<세계>.api25-ui.json` · `<세계>-casualN.api25-ui.json`, `generation` 에 모델 · 엔드포인트 · 사용량 · png_sha256 · retries · GPT 설계 글)을 둔다. 같은 이름이 있으면 멈춘다 — 덮지 않는다.
- 일상 계획도 `records/<장수>/<세계>-casual-plan.api25.json` 으로 둔다.
- 그림 저장소에 **장수 하나 한 커밋**, `pull --rebase` 뒤 일반 push. 썸네일 · `data/img.json` 은 워크플로가 한다. 코드 저장소 `docs/PATCH.md` 에 한 줄(patch-add).

## 5. 끝에 알린다

`node tools/api-draw.cjs usage $W` — 그림 몇 장 · 막힘 · 출력 토큰 합계, 그리고 대화에서 세어 온 누적 이미지 수.
