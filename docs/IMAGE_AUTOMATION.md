# GPT 세션 이미지 작업 — 계획기 → 생성 → 검사

원소 공방(element-atelier)의 `docs/IMAGE_AUTOMATION.md` 를 삼국지 꼴로 옮긴 것이다(사용자 2026-11-02 「응 1,2,3 다 해줘」 — 유비 · 조운 · 하후돈 · 사마의의 일상컷이 세계 셋에서 같은 장면을 돌려썼다. GPT 세션이 계획기 없이 손으로 짰기 때문).
GPT 세션이 장수 그림을 채우는 길이다. 사람이 지켜보는 세션도 2 · 3절(계획기 → 지시문 묶음 → 검사)은 똑같이 밟는다.
삼국지의 한 장수 = **사는 세계마다**(삼국시대 `samguk` · 중세 판타지 `fantasy` · 메카 `mecha`) 세계 그림 한 장 + 그 세계 그림을 붙인 **일상컷 다섯 장**(`IMAGE_RULES.md` 2절).

## 0. 승인 — 올리기 전에 사람이 본다

원소 공방은 사용자가 「묻지 않고 AI 검수 뒤 바로 올린다」 를 정했지만, **삼국지 공방에는 그 승인이 없다** — `IMAGE_RULES.md` 1절 그대로 「올리기 전에 사람이 본다」.
그래서 GPT 세션은 4절 검수까지 마친 그림과 기록을 사용자에게 보여 주고 「올릴까?」 를 묻는다. 사용자가 이 공방에도 원소처럼 승인을 주면 이 절을 그 말과 날짜로 바꾼다.

그 자리에서 멈추고(5절 block) 보고하는 것: 안전 필터 거절이 `IMAGE_RULES.md` 1절 순서(같은 지시문 한 번 → 노출 한 단계씩 → 계획 바꾸기 한 번)를 다 밟고도 남을 때,
결과가 불분명한 응답, 원본을 잃음, 도구 오류, 다른 세션의 잠금, 받은 그림이 1024×1536 이 아님(한 번 더 — 그래도 아니면 멈춤), 이미 있는 파일 이름.
이미 올라간 그림을 덮거나 지우는 일, 강제 push, 이력 재작성은 어떤 경우에도 하지 않는다.

## 1. 준비

- `AGENTS.md` · `IMAGE_RULES.md` 를 먼저 읽는다. 코드(`sam-atelier`)와 그림(`sam-atelier-img`) 저장소를 **나란히** 받아 최신 `main` 으로 둔다.
  다른 세션도 같은 저장소에 민다 — push 전에 늘 `git pull --rebase origin main`. 남의 로컬 변경을 reset 하지 않는다.
- Node 와 Python 3 + Pillow 가 있으면 된다. **브라우저는 쓰지 않는다** — 생성기 화면 대신 지시문 묶음(`tools/prompt-pack.cjs`)이 같은 글을 파일로 준다(생성기와 같은 조립부 `lib/prompt-sam.js`).
- 실행 ID 를 **한 번** 정하고 이 실행의 모든 명령에 그대로 쓴다.

```sh
export ATELIER_EXECUTION_ID="sam-$(date -u +%Y%m%dT%H%M%SZ)"
node tools/image-claim.cjs status                      # 잠금 · 다음 차례(읽기만)
```

## 2. 차례와 잠금

```sh
node tools/image-claim.cjs next                         # 다음에 그릴 장수와 빈 자리
node tools/image-claim.cjs claim <장수> --execution $ATELIER_EXECUTION_ID
```

- 차례는 설계표(게임 표) 차례 — **세력 하나를 끝까지 그린 뒤 다음 세력으로**(`IMAGE_RULES.md` 5절). 고르는 것은 도구가 한다. 몫(하루 · 실행마다)은 없다.
- 잠금은 그림 저장소 `records/automation/claims/<장수>.json` 하나다. `claim` 은 그 파일만 커밋해 일반 push 한다 — 다른 세션이 먼저 밀었으면 거절되고 도구가 제 커밋을 되돌린다. 그때는 pull 하고 `status` 부터 다시.
- 잡힌 장수(`working` · `blocked`)는 건드리지 않는다. `blocked` 는 사용자가 정한 뒤 `release --approval '<사용자 말>'` 로만 푼다.
- 한 장수의 빈 자리 = 사는 세계마다 세계 그림 · 일상컷 다섯 장(기본 화풍 `kr_mmorpg`, `data/img.json`). 번호는 세계마다 따로, 비어 있는 가장 작은 것부터(`claim` 이 적어 준 `missing` 그대로).
- **자동 설계(`designed: "auto"`) 장수는 그리기 전에 시안**(`IMAGE_RULES.md` 2절 · `AGENTS.md` 3절).

## 3. 계획과 지시문 묶음 — 일상컷은 반드시 계획기로

작업 폴더(`$W`)는 세션 임시 자리에 둔다. **세계 셋을 한 번에** 짠다(세계끼리 장면을 돌려쓰지 않게 — `IMAGE_RULES.md` 2절):

```sh
node tools/casual-plan.cjs <장수> --world all --records ../sam-atelier-img/records/<장수> --out $W      # $W/plan-<세계>/plan.json · 기록 · 지시문
node tools/prompt-pack.cjs init <장수> --dir $W/pack --plan $W/plan-samguk/plan.json --plan $W/plan-fantasy/plan.json --plan $W/plan-mecha/plan.json
node tools/prompt-pack.cjs build --dir $W/pack                                  # 자리마다 <자리>-prompt.txt · <자리>-ui.json · INDEX.md
```

- 계획기가 묶음 규칙을 지킨다: 세계마다 다섯 장 중 **정해 둔 두 갈래**(노출 갈래 한 장 — 란제리풍 · 수영복 · 역할극, 세계 안 갈래 한 장 — 방 · 목욕탕 · 지붕 · 여관, 서로 다른 컷) · 네 시대 · 장소 · 의상 · 자세 · 소품 ·
  **세계 사이 같은 장면 금지**(같은 장소 — 세계 안 `nation_*` 장소는 옷 계열까지 같을 때만 · 같은 자세 추천 = 같은 구도) · 다른 장수 기록에서 덜 쓴 트리 먼저. `--usage none` 은 쓰지 않는다.
- 세계 하나만 남았으면 `--world <세계>` — 다른 세계의 기록은 `--records` 에서 읽어 겹침에 넣는다. 아직 안 올린 다른 계획은 `--others a.json,b.json`.
- 옛 묶음을 두고 **더 그리라는 말이 있을 때만** `--fresh`(그 세계의 가장 큰 번호 뒤로 다섯 장, 옛 묶음과도 겹치지 않게 — 검사는 `--check … --from <첫 번호>`). 빈 자리 채우기엔 쓰지 않는다.
- 계획을 손으로 바꾸지 않는다. `settings.json` 은 **비워 둔 채** build 하는 것이 기본 — 고칠 때만 칸을 채우고 직접 입력(덧붙임 글)엔 `why` 를 적는다. 고칠 수 있는 칸은 `tools/prompt-pack.cjs` 머리말에.
- **`<자리>-prompt.txt` 를 손으로 고쳐 내지 않는다.** 고칠 것이 있으면 settings 를 고쳐 build 를 다시 돌린다.
- 무기가 그 장수의 물건이면(청룡언월도 · 장팔사모 · 창) 지시문에 「끊기지 않는 한 자루」 줄이 이미 들어간다(`lib/prompt-spec.js` SIGNATURE). 그래도 꺾여 나오면 그 칸의 `custom` 에 덧붙여(`why`) 다시 build.
- 안전 필터로 한 칸이 끝내 막히면 그 칸만 `--slots N --seed <다른 씨앗>` 으로 계획기에 다시 맡긴다 — 한 번만.

## 4. 그리기와 검수

- `INDEX.md` 의 차례대로, `claim` 의 `missing` 에 있는 자리만 그린다. 자리 하나에 생성 호출 한 번.
- 세계 그림은 **기준 그림 없이** 한 장씩(세계마다 다른 사람). 일상컷은 그 세계 그림을 **꼭** 붙인다(이미지 편집 `images/edits` — 첨부 없이 뽑으면 다른 사람이 된다).
  이 세션에서 받은 원본, 이미 등록된 세계 그림이면 그림 저장소의 `img/<파일>.webp`. 세계 그림이 없는 세계는 일상컷을 그리지 않는다.
- 크기는 1024×1536. 도구가 실제로 돌려준 파일만 쓴다.
- **검수**(기록의 `qa` — 7절)를 구체적으로: 1024×1536 · 그녀 한 명(말 · 짐승 · 두 번째 인물 없음) · 깃발 · 인장의 한 글자 말고 읽히는 글자 · 로고 · 워터마크 · 틀 ·
  세계 그림이면 고른 세계대로인가(삼국시대가 일본 옷으로, 판타지가 한푸로 가지 않았나) · 일상컷이면 첨부한 세계 그림과 같은 얼굴 · 머리 · 몸인가, 계획 칸(시대 · 장소 · 의상 · 프레이밍 · 자세 · 두 손 · 소품)대로인가 ·
  **무기 · 물건이 한 자루로 이어졌나(꺾임 · 잘림 없음)** · 팔 · 다리 · 손의 수와 이어짐.
- 올리기 전 `node tools/casual-plan.cjs <장수> --world <세계> --check <새 기록을 넣은 기록 폴더 사본>` 이 세계마다 통과해야 한다(다른 세계와 같은 장면도 본다).

## 5. 멈춤

```sh
node tools/image-claim.cjs block <장수> --execution $ATELIER_EXECUTION_ID --reason '실제 까닭(어느 자리 · 무슨 응답)'
```

- 0절의 멈출 것이면 그 자리는 그리지 않고 block 한다. 거절된 지시문은 sha256 과 함께 `<자리>.blocked.json` 으로 남긴다(지시문 · 시도 수 · 응답 코드).

## 6. 보여 주기 · 올리기 · 끝

1. 자리마다 원본을 WebP(품질 90, method 6, 1024×1536)로 바꾼다. 이름은 `INDEX.md` 의 「올릴 파일」(= `IMAGE_RULES.md` 3절). 같은 이름이 그림 저장소에 이미 있으면 멈춘다 — 덮지 않는다.
2. **사용자에게 보여 주고 「올릴까?」**(0절). 다시 그리라는 칸은 그 칸만 다시.
3. 그림 저장소에 **한 장수 한 커밋**으로 일반 push: `img/<파일>.webp` 들과 `records/<장수>/` 의 기록 — 세계 그림 `<세계>.<화풍>-ui.json`, 일상컷 `<세계>-casualN.<화풍>-ui.json`, 일상 계획 `<세계>-casual-plan.json`.
   기록에 7절 칸을 더한다. **원본 PNG 는 올리지 않는다** — sha256 만. 썸네일 · `data/img.json` 은 손으로 만들지 않는다(워크플로가 한다).
4. push 가 밀리면 `pull --rebase` 한 번. 그 사이 같은 파일 이름이 들어왔으면 멈추고 보고한다.
5. `썸네일` · `그림 등록` 이 돈 뒤 코드 저장소를 pull 하고 `python3 tools/casual-check.py <장수>` 로 본다. 그리고:

```sh
node tools/image-claim.cjs done <장수> --execution $ATELIER_EXECUTION_ID
```

## 7. 기록에 더하는 칸

```json
{"generation": {"tool": "<도구>", "endpoint": "images/generations | images/edits", "ref_sha256": "<일상컷 — 붙인 세계 그림의 sha256>",
                "size": [1024, 1536], "png_sha256": "<원본>", "webp": {"quality": 90}, "retries": [{"n": 1, "status": "<응답>", "exposure": "<노출>"}]},
 "execution": "<실행 ID>", "imported": "<YYYY-MM-DD>",
 "qa": {"reviewer": "<세션>", "image_sha256": "<원본>", "passed": true, "observations": ["<본 것 하나씩>"], "cause": "<어긋났으면 부딪힌 줄>"},
 "review": {"by": "user", "date": "<YYYY-MM-DD>", "words": "<사용자 말 — 「올려줘」>"}}
```

## 8. 하지 않는 것

- 계획기 없이 일상컷 장면을 짜지 않는다 · 세계 셋에 같은 장면을 돌려쓰지 않는다 · 계획 · 지시문을 손으로 고쳐 내지 않는다.
- 남의 잠금 · 기록 · 그림을 고치지 않는다 · 검수 실패를 통과로 바꾸지 않는다 · 화풍을 바꾸지 않는다(늘 기본) · 게임(`draft.html` · `images/`)을 건드리지 않는다.
