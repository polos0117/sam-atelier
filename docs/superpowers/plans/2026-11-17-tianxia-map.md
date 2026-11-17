# 천하 지도 · 진영 막사 · 목록 도감 정리판 — 만들기 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 삼국지 공방의 첫 화면을 천하 지도로 바꾸고(판도 다섯 × 세계 셋), 세력을 누르면 진영 막사로 들어가며, 목록 도감을 그림이 먼저 보이게 정리하고, 그림 없는 장수 · 새 그림 표시를 넣는다.

**Architecture:** 판도 · 막사 셈은 화면과 떨어진 순수 모듈 `lib/tianxia-core.js`(브라우저 `window.Tianxia`, node `require`)가 하고, 세력 나눔은 새 판의 규칙 모듈(`lib/draft2/rules.js` 의 `view` · `facOf`)을 읽기만 해서 다시 쓴다. 지도와 막사는 한 화면(`index.html` + `lib/tianxia.js`, Preact — 도감과 같은 esm.sh 고정판) 안의 두 층이고 주소 · 뒤로 가기로 오간다. 장수 화면은 새로 만들지 않고 목록 도감(`dex.html?card=`)의 지금 것을 연다.

**Tech Stack:** 빌드 없는 정적 사이트(GitHub Pages) · Preact 10.24.3(esm.sh) · 순수 JS/CSS · 검사는 node + playwright(`ESM_DIR` · `CHROMIUM_PATH`, `tests/screen.cjs` 의 서버 · ESM 바꿔치기 방식 그대로).

**Spec:** `docs/superpowers/specs/2026-11-17-tianxia-map-design.md`

## Global Constraints

- 게임 `draft.html` 은 손대지 않는다. `draft2.html` · `battle.html` · `prompt*.html` · `api.html` · `styles.html` 은 내용을 바꾸지 않는다(「공방으로」 길만 맞춘다). `lib/draft2/rules.js` · `data/draft2-*.json` 은 읽기만.
- 사람이 읽는 말은 모두 `lib/words.js`(검사 `node tests/words.cjs`). 화면 코드에 한글 문자열을 적지 않는다. 지도 자료(`data/tianxia.json`)의 성 이름 · 한 줄 사정은 자료라 그대로 둔다.
- 폴드 커버 **344×882** 터치가 기준: 가로 넘침 없음, 양옆 12px, 누르는 자리 **44px** 이상. PC(1280)에서도 깨지지 않는다.
- 움직임 줄이기(`prefers-reduced-motion`)면 판도 넘어가기 · 막사 들어가기 움직임을 끈다.
- 꽃 장식 틀(`lib/material.css` 의 그림 단추 · 장식 틀)은 지도 · 막사 · 정리한 목록 줄에 쓰지 않는다 — 세력 도장 한 글자와 가는 테두리.
- 역사 사실을 지어내지 않는다: 성의 주인 · 세력의 한 줄은 줄마다 `why`(근거 한 줄)와 `src`(출처 주소나 책 · 권)를 적고, 확신이 없으면 주인 없음(`f: null`).
- 「새 그림」 은 그 장수의 가장 늦은 등록 날짜(`data/img.json` `added`)가 오늘 또는 어제(한국 시간)이고, 이 브라우저가 그 날짜를 아직 확인하지 않았을 때. 확인 기록 저장 열쇠 `samguk_seen_v1`.
- 고친 것은 `docs/PATCH.md` 맨 위에 한 칸(`node tests/patch.cjs`). 바꾼 `lib/*.js` · `*.css` 의 `?v=` 를 올린다. 검사는 바꾼 것만 돌린다.
- 그림은 이 저장소에 두지 않는다. 지도 바탕은 그림 저장소 `sam-atelier-img` 의 `backgrounds/tianxia/`. API 키는 사용자 환경 변수에서 읽고 찍지 않는다. **push 는 사용자가 「올려줘」 한 뒤에만.**
- 사용자에게 하는 말은 한국어 반말.

## Review Focus

1. **군웅록 판도에서 막사에 못 드는 장수** — 이력이 비었거나 세력 표에 없는 이름. 279명 모두 어느 막사에든 들어야 한다(Task 2 검사).
2. **연도 판도에서 성은 없는데 장수는 있는 세력**(208 유비 · 떠도는 세력) — 범례에 「떠도는 세력」 으로 나오고 막사에 들어갈 수 있어야 한다(Task 2 · 3 검사).
3. **그림이 하나도 없는 세력 · 장수가 스무 명이 넘는 막사**(조위 67명) — 도장 얼굴만으로도 깨지지 않고, 둘레 밖 장수가 아래 줄로 다 나온다(Task 4 검사).
4. **날짜 경계** — 등록이 그저께인 장수는 표지가 안 켜지고, 확인한 뒤 같은 날짜면 꺼진 채, 더 늦은 날짜가 등록되면 다시 켜진다. `localStorage` 가 막힌 브라우저에서도 화면이 뜬다(Task 2 검사).
5. **옛 주소** — `hall.html` · `dex.html?faction=wei` · `dex.html?card=…&pic=…`(공방 모음 즐겨찾기의 링크)가 계속 열린다(Task 3 · 5 검사).

---

### Task 1: 성 · 판도 자료 `data/tianxia.json`

**Files:**
- Create: `data/tianxia.json`
- Create: `tests/tianxia-data.cjs`
- Create: `docs/TIANXIA_SOURCES.md`(연도별 성의 주인 한 장 — 사용자가 훑어본다)

**Interfaces:**
- Produces — 자료 꼴:
  ```json
  { "version": 1, "note": "…가상 판도(mx)의 땅 넓이는 사실이 아니다…",
    "cities": [ { "key": "luoyang", "ko": "낙양", "x": 48.0, "y": 40.0 } ],
    "eras": { "mx":    { "ko": "군웅록", "line": "모든 영웅이 모인 천하", "virtual": true,
                          "owners": { "luoyang": { "f": "동탁", "why": "…", "src": "…" } },
                          "notes":  { "조위": "…한 줄…" } },
              "w194":  { "ko": "194 군웅할거", "line": "…", "owners": { }, "notes": { } },
              "gd200": { }, "jb208": { }, "end263": { } } }
  ```
  - `eras` 의 열쇠는 `data/draft2-packs.json` 의 팩 열쇠 그대로 다섯(`mx` · `w194` · `gd200` · `jb208` · `end263`).
  - `owners.<성>.f` 는 `data/draft2-factions.json` 의 `factions` 열쇠(조위 · 촉한 · 동오 · 진 · 원소 …) 또는 `null`(다툼 · 주인 없음). 연도 팩의 그해 세력 이름(조조군 · 유비군)이 아니라 그 `alias` 가 가리키는 열쇠로 적는다.
  - `x` · `y` 는 지도 그림의 백분율(왼쪽 위 0 · 0). 그림이 정해지기 전에는 잠정값 — Task 6 에서 맞춘다.

- [ ] **Step 1: 실패하는 검사를 쓴다** — `tests/tianxia-data.cjs`
  ```js
  const T = J('data/tianxia.json'), F = J('data/draft2-factions.json'), P = J('data/draft2-packs.json').packs;
  assert.deepEqual(Object.keys(T.eras), ['mx', 'w194', 'gd200', 'jb208', 'end263']);
  assert(T.cities.length >= 28 && T.cities.length <= 40);
  assert.equal(new Set(T.cities.map(c => c.key)).size, T.cities.length);
  for (const c of T.cities) assert(c.ko && c.x >= 0 && c.x <= 100 && c.y >= 0 && c.y <= 100, c.key);
  for (const [k, e] of Object.entries(T.eras)) {
    assert(e.ko && e.line, k);
    for (const c of T.cities) { const o = e.owners[c.key]; assert(o, k + ' ' + c.key + ' 줄이 없다');
      assert(o.f === null || F.factions[o.f], k + ' ' + c.key + ' 세력 ' + o.f);
      assert(o.why && o.src, k + ' ' + c.key + ' 근거 · 출처'); }
    for (const f of Object.keys(e.notes)) assert(F.factions[f], k + ' notes ' + f);
    const held = new Set(Object.values(e.owners).map(o => o.f).filter(Boolean));
    assert(held.size >= (k === 'end263' ? 2 : 5), k + ' 세력 수 ' + held.size);
  }
  assert.equal(T.eras.mx.virtual, true);
  ```
- [ ] **Step 2: 돌려서 실패를 본다** — `node tests/tianxia-data.cjs` → `Cannot find module …/data/tianxia.json`.
- [ ] **Step 3: 성 서른 안팎을 정한다** — 주(州)마다 고르게, 다섯 판도에서 주인이 갈리는 곳 위주(낙양 · 장안 · 허창 · 업 · 남피 · 북평 · 양평 · 진류 · 복양 · 하비 · 소패 · 수춘 · 건업 · 오 · 회계 · 시상 · 강하 · 양양 · 강릉 · 장사 · 완 · 한중 · 성도 · 강주 · 영안 · 무위 · 천수 · 운남 · 교지 …). 잠정 `x` · `y` 는 실제 위치의 대강.
- [ ] **Step 4: 연도 넷의 주인을 채운다** — 연도마다 웹에서 정사 · 자치통감에 닿는 자료(위키백과의 그 주 · 그 전투 · 그 인물 항목 등)를 찾아 성마다 `f` · `why` · `src`. 못 찾거나 엇갈리면 `f: null` + `why: "그해 주인이 분명치 않다"`. `notes` 에 그해 그 세력의 한 줄.
- [ ] **Step 5: 군웅록(mx) 판도를 채운다** — 세력마다 실제로 근거지로 삼았던 성을 준다(`why` 는 「원소가 기주목으로 근거한 곳」 꼴). 한 성에 둘이 겹치면 더 오래 근거한 쪽, 다른 쪽은 다음 근거지. 땅이 없던 세력(한조정 · 재야)은 성을 주지 않는다. `note` 에 「땅 넓이는 사실이 아니다」.
- [ ] **Step 6: `docs/TIANXIA_SOURCES.md` 를 뽑는다** — 판도마다 표(성 · 주인 · 근거 · 출처), 주인 없음은 따로 모아. 자료에서 스크립트로 만든다(손으로 두 번 적지 않는다).
- [ ] **Step 7: 검사를 돌려 통과를 본다** — `node tests/tianxia-data.cjs` → `PASS`.
- [ ] **Step 8: 커밋** — `git add data/tianxia.json tests/tianxia-data.cjs docs/TIANXIA_SOURCES.md` · `천하 지도 자료 — 성 · 판도 다섯의 주인과 근거`.

### Task 2: 셈 모듈 `lib/tianxia-core.js`

**Files:**
- Create: `lib/tianxia-core.js`
- Create: `tests/tianxia-core.cjs`

**Interfaces:**
- Consumes: `data/tianxia.json`(Task 1) · `data/sam-design.json`(`generals[].key/role/faction/camp/seal`) · `data/draft2-packs.json` · `data/draft2-factions.json` · `data/draft2-combos.json` · `lib/draft2/rules.js`(`view(db, 팩)` · `facOf(db, 장수)` — 세력 나눔은 이 모듈을 불러 쓴다, 다시 짓지 않는다. 그 모듈이 db 를 짓는 함수는 `rules.js` 머리 주석과 `tests/draft2-rules.cjs` 에서 본다).
- Produces(`window.Tianxia` / `module.exports`):
  - `ERAS: ['mx','w194','gd200','jb208','end263']`
  - `make({ design, packs, factions, combos, tianxia }) → doc`
  - `factionOf(doc, era, name) → string | null` — 그 판도에서 그 장수의 세력 열쇠(연도 판도에 없는 장수는 `null`)
  - `members(doc, era, faction) → [{ name, role }]` — 군주 · 무장 · 책사 · 문관 차례, 그 안은 설계표 차례
  - `factionsOf(doc, era) → [{ key, glyph, color, cities: [성 열쇠], landless: boolean, count }]` — 장수가 한 명이라도 있는 세력, 성 많은 차례, 땅 없는 세력은 끝
  - `ownerOf(doc, era, cityKey) → string | null`
  - `bondsOf(doc, names) → [{ n, kind: 'bond' | 'blood' | 'feud', m: [이름] }]` — `names` 안에 둘 이상 든 결의만, `m` 은 그 안에 든 사람
  - `hasArt(imgEntry) → boolean` · `lastAdded(imgEntry, added) → 'YYYY-MM-DD' | ''`
  - `isNew(last, today, seen) → boolean` — `last` 가 `today` 나 그 전날이고 `seen`(확인했을 때의 날짜)보다 늦을 때
  - `today(search) → 'YYYY-MM-DD'` — 주소의 `?today=` 가 있으면 그것, 없으면 한국 시간 오늘
  - `seen: { get(name), mark(name, last), markAll({이름: last}), all() }` — `localStorage['samguk_seen_v1']`, 못 쓰는 환경이면 메모리로

- [ ] **Step 1: 실패하는 검사를 쓴다** — `tests/tianxia-core.cjs`
  ```js
  const C = require('../lib/tianxia-core.js'), doc = C.make({ design, packs, factions, combos, tianxia });
  // 군웅록 — 279명 모두 어느 세력이든
  for (const g of design.generals) assert(C.factionOf(doc, 'mx', g.key), g.key + ' 가 군웅록에서 세력이 없다');
  assert.equal(C.factionsOf(doc, 'mx').reduce((s, f) => s + f.count, 0), 279);
  assert.equal(C.factionOf(doc, 'mx', '유비'), '촉한'); assert.equal(C.factionOf(doc, 'mx', '여포'), '여포');
  // 연도 — 그해 자료에 든 장수만, 별칭이 세력 열쇠로
  assert.equal(C.factionOf(doc, 'jb208', '조조'), '조위'); assert.equal(C.factionOf(doc, 'end263', '여포'), null);
  // 막사 — 군주가 맨 앞
  assert.equal(C.members(doc, 'mx', '촉한')[0].name, '유비');
  // 땅 없는 세력은 끝, landless
  const fs208 = C.factionsOf(doc, 'jb208'); assert(fs208.every(f => f.count > 0));
  assert(fs208.findIndex(f => f.landless) === -1 || fs208.slice(fs208.findIndex(f => f.landless)).every(f => f.landless));
  // 결의
  const b = C.bondsOf(doc, ['유비', '관우', '장비', '조운']); assert(b.some(x => x.n === '도원결의' && x.m.length === 3));
  assert.equal(C.bondsOf(doc, ['유비']).length, 0);
  // 새 그림
  assert.equal(C.isNew('2026-11-17', '2026-11-17', ''), true);  assert.equal(C.isNew('2026-11-16', '2026-11-17', ''), true);
  assert.equal(C.isNew('2026-11-15', '2026-11-17', ''), false); assert.equal(C.isNew('2026-11-17', '2026-11-17', '2026-11-17'), false);
  assert.equal(C.isNew('2026-11-17', '2026-11-17', '2026-11-16'), true); assert.equal(C.isNew('', '2026-11-17', ''), false);
  assert.equal(C.isNew('2026-11-01', '2026-11-01', ''), true); assert.equal(C.isNew('2026-10-31', '2026-11-01', ''), true);   // 달이 넘어가도
  assert.equal(C.today('?today=2026-11-02'), '2026-11-02');
  C.seen.mark('유비', '2026-11-17'); assert.equal(C.seen.get('유비'), '2026-11-17');   // node — 메모리로
  assert.equal(C.lastAdded({ byStyle: { s: { byForm: { samguk: { f: 'a.webp', casual: { f: ['b.webp'] } } } } } }, { 'a.webp': '2026-11-10', 'b.webp': '2026-11-16' }), '2026-11-16');
  assert.equal(C.hasArt({}), false); assert.equal(C.hasArt(undefined), false);
  ```
- [ ] **Step 2: 돌려서 실패를 본다** — `node tests/tianxia-core.cjs` → `Cannot find module`.
- [ ] **Step 3: `lib/tianxia-core.js` 를 쓴다** — 위 꼴 그대로. UMD 한 덩어리(`(function (root) { … })(typeof window !== 'undefined' ? window : globalThis)`, 끝에 `module.exports`). 그 장수의 그림 파일은 `lib/img.js` 의 `allShotsOf` 와 같은 범위(세계 그림 · 일상컷 · 캐릭터만의 컷, 모든 화풍)로 모은다.
- [ ] **Step 4: 통과를 본다** — `node tests/tianxia-core.cjs` → `PASS`.
- [ ] **Step 5: 커밋** — `천하 지도 셈 모듈 — 판도별 세력 · 막사 · 결의 · 새 그림 판정`.

### Task 3: 천하 지도 화면 — `index.html`

**Files:**
- Modify: `index.html`(옛 타이틀을 지도 화면으로 바꾼다) · `hall.html`(지도로 넘긴다 — 주소의 `?` 뒤는 그대로) · `lib/workspace-ui.js`(`PAGES` 의 `hall` 이 지도로, 「공방으로」 길) · `lib/words.js`
- Create: `lib/tianxia.js`(ES 모듈 — 지도 · 막사 화면) · `lib/tianxia.css` · `tests/tianxia-screen.cjs`

**Interfaces:**
- Consumes: `window.Tianxia`(Task 2) · `window.AtelierImg`(`load` · `setShards` · `setAdded` · `added` · `thumbURL` · `portraitOf`) · `window.W`.
- Produces — 주소: `index.html?era=<팩 열쇠>&w=<samguk|fantasy|mecha>[&f=<세력 열쇠>]`. `f` 가 있으면 막사 층. 고른 판도 · 세계는 `localStorage['samguk_tianxia_v1']`(`{ era, w }`), 기본 `era: 'mx'` · `w: 'samguk'`.
- Produces — 검사가 잡는 자리: `.tx-map`(지도) · `.tx-city[data-city]`(`data-f` = 주인 세력, 없으면 빈 값) · `.tx-eras [data-era]` · `.tx-worlds [data-w]` · `.tx-legend [data-f]`(그 세력에 새 그림이 있으면 `data-new="1"`) · `.tx-tools`(도구 상자 단추) · `html[data-layer="map"|"camp"]`.
- 바탕 그림 주소: `IMG` 의 배경 바탕 + `backgrounds/tianxia/<세계>-<light|dark>.webp`. 못 받으면 임시 바탕(CSS 로 그린 종이색 + 강 · 해안 윤곽)으로 — Task 6 전에는 늘 임시 바탕.

- [ ] **Step 1: 실패하는 화면 검사를 쓴다** — `tests/tianxia-screen.cjs`(서버 · ESM 바꿔치기는 `tests/screen.cjs` 방식, 창 344×882 · 터치)
  ```js
  await p.goto(BASE + '/index.html?today=2026-11-17'); await p.waitForSelector('.tx-city');
  assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map');
  assert.equal(await p.locator('.tx-city').count(), T.cities.length);
  assert.equal(await p.locator('.tx-eras [data-era]').count(), 5);
  assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'mx');
  for (const h of await p.locator('.tx-eras [data-era], .tx-worlds [data-w], .tx-legend [data-f], .tx-tools').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(h >= 44, '누르는 자리 ' + h);
  // 판도를 바꾸면 성의 주인이 바뀐다
  const own = () => p.locator('.tx-city').evaluateAll(es => es.map(e => e.dataset.city + '=' + e.dataset.f).join());
  const a = await own(); await p.click('.tx-eras [data-era="jb208"]'); await p.waitForFunction(x => [...document.querySelectorAll('.tx-city')].map(e => e.dataset.city + '=' + e.dataset.f).join() !== x, a);
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('era')), 'jb208');
  // 세계를 바꾸면 바탕이 바뀐다
  await p.click('.tx-worlds [data-w="mecha"]'); assert.equal(await p.evaluate(() => document.documentElement.dataset.world), 'mecha');
  // 기억 · 넘침 · 콘솔
  await p.reload(); await p.waitForSelector('.tx-city'); assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'jb208');
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); assert.deepEqual(errors, []);
  // 떠도는 세력도 범례에(있다면) · 범례의 새 그림 점은 그해 장수만
  // 옛 주소
  await p.goto(BASE + '/hall.html'); await p.waitForSelector('.tx-city');
  // 도구 상자 — 옛 메뉴가 다 있다
  await p.click('.tx-tools'); for (const k of ['draft', 'draft2', 'battle', 'dex', 'prompt']) assert.equal(await p.locator('.tx-sheet [data-go="' + k + '"]').count(), 1);
  ```
- [ ] **Step 2: 돌려서 실패를 본다** — `.tx-city` 를 못 찾는다.
- [ ] **Step 3: `lib/words.js` 에 낱말을 넣는다** — 지도 위 막대 · 판도 다섯 이름은 자료(`eras.<열쇠>.ko`)에서, 그 밖(세계 셋 · 도구 상자 · 도움 한 줄 · 떠도는 세력 · 주인 없음)은 `tx.*` 열쇠로.
- [ ] **Step 4: `index.html` 을 지도 화면으로 바꾼다** — 머리(글꼴 · 공간 · `lib/words.js` · `lib/img.js` · `lib/tianxia-core.js` · `lib/tianxia.css`) + `lib/tianxia.js` 모듈. 옛 타이틀의 배경 장면 · 장식 메뉴 코드는 지운다(공간 고르기는 도구 상자로).
- [ ] **Step 5: `lib/tianxia.js` 지도 층** — `App()`(판도 · 세계 · 세력 상태, 주소 · 기억 · `popstate`) · `MapLayer({ doc, era, world, onFaction })`: 바탕(그림 또는 임시) · 세력의 땅(성마다 세력색 번짐 — 같은 세력끼리 이어 보이게) · 성 표지와 이름 · 범례 · 아래 막대(판도 다섯 · 세계 셋) · 위 막대(공방 이름 · 그 판도의 한 줄 · 도구 상자). 지도는 끌기 · 두 손가락 확대 · 두 번 누르기 확대(포인터 이벤트, 처음엔 전체 맞춤, 밖으로 못 나감).
- [ ] **Step 6: 도구 상자** — 옛 메뉴(게임 · 새 판 · 전장 · 목록 도감 · 프롬프트 · 화풍 비교 …— `PAGES` 차례), 최근 그림 여덟, 패치 기록 가기, 공간 고르기(`ThemeGallery`), 「새 그림 모두 확인」.
- [ ] **Step 7: `hall.html` 을 넘기고 `PAGES` 를 맞춘다** — `hall.html` 은 머리에서 `location.replace('index.html' + location.search)`. 다른 화면 머리의 「군막」 은 지도로 간다.
- [ ] **Step 8: 통과를 본다** — `ESM_DIR=… CHROMIUM_PATH=… node tests/tianxia-screen.cjs` → `PASS`, `node tests/words.cjs` → `PASS`.
- [ ] **Step 9: 커밋** — `첫 화면을 천하 지도로 — 판도 다섯 · 세계 셋 · 도구 상자`.

### Task 4: 진영 막사 층

**Files:**
- Modify: `lib/tianxia.js` · `lib/tianxia.css` · `lib/words.js` · `tests/tianxia-screen.cjs`

**Interfaces:**
- Consumes: `Tianxia.members` · `bondsOf` · `factionsOf` · `isNew` · `lastAdded` · `hasArt` · `seen`(Task 2), Task 3 의 `App` 상태와 주소 `&f=`.
- Produces — 검사가 잡는 자리: `.tx-camp` · `.tx-lord` · `.tx-face[data-name]`(`data-art="0|1"` · `data-new="0|1"`) · `.tx-ring .tx-face`(둘레) · `.tx-rest .tx-face`(아래 줄) · `.tx-bond[data-kind]` · `.tx-roles [data-role]` · `.tx-tolist` · `.tx-back`.
- 장수를 누르면 `dex.html?faction=<설계표 세력>&card=<이름>` 으로(그 장수의 큰 그림 보기가 열린다 — Task 5 가 이 주소에서 확인 기록을 남긴다).

- [ ] **Step 1: 실패하는 검사를 더한다**
  ```js
  await p.goto(BASE + '/index.html?era=mx&today=2026-11-17'); await p.click('.tx-legend [data-f="촉한"]'); await p.waitForSelector('.tx-camp');
  assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'camp');
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('f')), '촉한');
  assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), '유비');
  const n = C.members(doc, 'mx', '촉한').length;
  assert.equal(await p.locator('.tx-face[data-name]').count(), n, '막사의 장수 수');          // 둘레 + 아래 줄 = 모두
  assert(await p.locator('.tx-bond[data-kind="bond"]').count() > 0, '결의 선');
  for (const h of await p.locator('.tx-roles [data-role], .tx-tolist, .tx-back').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(h >= 44);
  await p.click('.tx-roles [data-role="strategist"]');
  assert.equal(await p.locator('.tx-face[data-name]:visible').count(), C.members(doc, 'mx', '촉한').filter(m => m.role === 'strategist' || m.role === 'lord').length);
  // 그림 없는 장수 · 새 그림
  assert(await p.locator('.tx-face[data-art="0"]').count() > 0); assert.equal(await p.locator('.tx-face[data-art="0"] img').count(), 0);
  // 뒤로 — 지도로
  await p.goBack(); await p.waitForSelector('.tx-city'); assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map');
  // 가장 큰 막사 · 그림이 하나도 없는 막사도 넘치지 않는다
  for (const f of [largest, artless]) { await p.goto(BASE + '/index.html?era=mx&f=' + encodeURIComponent(f)); await p.waitForSelector('.tx-camp'); assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
  // 연도 판도의 떠도는 세력에도 들어간다
  ```
  (`largest` · `artless` 는 검사가 `C.factionsOf` 와 `img.json` 으로 고른다.)
- [ ] **Step 2: 실패를 본다.**
- [ ] **Step 3: `CampLayer({ doc, era, faction, world })`** — 머리(도장 · 「<세력> · <판도>」 · 그 판도의 한 줄 · 가진 성), 가운데 군주, 둘레 장수(폰에서 겹치지 않는 수까지 — 그 수는 화면 폭에서 셈한다), 나머지는 아래 줄(옆으로 넘기기), 결의 선(둘레에 든 사이만 — `bond` 붉은 선 · `blood` 금빛 · `feud` 점선), 선이나 얼굴을 누르면 아래 글 칸에 그 결의 이름과 사람, 역할 걸러 보기, 「목록으로 보기」(`dex.html?faction=…`), 「‹ 천하 지도」.
- [ ] **Step 4: 얼굴 조각 `Face({ name, big })`** — 그림 있으면 그 세계 그림의 썸네일(고른 세계 → 없으면 다른 세계), 없으면 세력색 바탕에 성씨 도장 글자(흐리게) + `data-art="0"`. 새 그림이면 작은 점 `data-new="1"`.
- [ ] **Step 5: 움직임** — 지도에서 막사로는 누른 세력의 땅에서 번져 들어오게(`lib/motion-fx.js` 의 것을 쓴다), 움직임 줄이기면 바로.
- [ ] **Step 6: 통과를 본다** — `node tests/tianxia-screen.cjs` · `node tests/words.cjs`.
- [ ] **Step 7: 커밋** — `진영 막사 — 군주와 둘레의 장수 · 결의 선 · 역할 걸러 보기`.

### Task 5: 목록 도감 정리판 · 표시 둘

**Files:**
- Modify: `dex.html` · `lib/sam.css` · `lib/words.js` · `tests/screen.cjs`(도감 몫의 기대값)

**Interfaces:**
- Consumes: `window.Tianxia`(`hasArt` · `lastAdded` · `isNew` · `today` · `seen`).
- Produces — 주소는 지금 그대로(`?faction=&view=&w=&q=&card=&pic=`) + `faction` 값에 군웅의 무리 열쇠(`camp` — `yuanshao` · `dong` …)도 받는다(`qun` 은 군웅 전체로 계속 열린다). 걸러 보기 `&only=new|none`.
- Produces — 검사가 잡는 자리: `.dx-facs [data-f]`(`data-new`) · `.dx-row[data-name]`(`data-art` · `data-new`) · `.dx-tools`(도구 판 단추) · `.dx-sheet` 안의 찾기 · 화풍 고르개(`#dex-style` 그대로) · 설계 걸러 보기 · 「그림 있는 것만」 · 「새 그림만」 · 「그림 없는 것만」 · 「새 그림 모두 확인」.

- [ ] **Step 1: 실패하는 검사를 `tests/screen.cjs` 도감 몫에 더한다**
  ```js
  await p.setViewportSize({ width: 344, height: 882 }); await p.goto(BASE + '/dex.html?faction=wei&today=2026-11-17'); await p.waitForSelector('.dx-row');
  const first = await p.locator('.dx-row >> nth=0').boundingBox(); assert(first.y < 260, '첫 화면에 장수 줄 — y ' + first.y);
  assert(await p.locator('.dx-row >> nth=0 img').count() >= 1 || await p.locator('.dx-row >> nth=0').getAttribute('data-art') === '0');
  assert(await p.locator('.dx-facs [data-f]').count() >= 3 + 10, '위 · 촉 · 오 + 군웅의 무리');
  await p.click('.dx-facs [data-f="yuanshao"]'); assert.equal(await p.locator('.dx-row').count(), D.generals.filter(g => g.camp === 'yuanshao').length);
  await p.goto(BASE + '/dex.html?faction=qun'); await p.waitForSelector('.dx-row'); assert.equal(await p.locator('.dx-row').count(), D.generals.filter(g => g.faction === 'qun').length);
  // 그림 없는 장수
  assert(await p.locator('.dx-row[data-art="0"]').count() > 0);
  await p.click('.dx-tools'); await p.click('.dx-sheet [data-only="none"]'); assert.equal(await p.locator('.dx-row[data-art="1"]').count(), 0);
  // 새 그림 — 열어 보면 꺼진다, 새로 고쳐도 꺼진 채, 날짜가 지나면 처음부터 없다
  await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&today=' + newest); await p.waitForSelector('.dx-row[data-name="' + newName + '"][data-new="1"]');
  await p.click('.dx-row[data-name="' + newName + '"] img >> nth=0'); await p.keyboard.press('Escape');
  await p.waitForSelector('.dx-row[data-name="' + newName + '"][data-new="0"]'); await p.reload(); await p.waitForSelector('.dx-row[data-name="' + newName + '"][data-new="0"]');
  await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&today=2099-01-01'); await p.waitForSelector('.dx-row'); assert.equal(await p.locator('.dx-row[data-new="1"]').count(), 0);
  // 옛 즐겨찾기 주소
  await p.goto(BASE + '/dex.html?card=' + encodeURIComponent(newName) + '&pic=0'); await p.waitForSelector('.dex-viewer, [role="dialog"]');
  ```
  (`newName` · `newest` · `facOfNew` 는 검사가 `img.json` 의 `added` 에서 가장 늦게 등록된 장수로 고른다. 큰 그림 보기의 선택자는 지금 도감 것 그대로 쓴다.)
- [ ] **Step 2: 실패를 본다.**
- [ ] **Step 3: 위 막대 · 세력 줄** — 머리(도감 · 그 세력 · 장수 수 · 그림 수) + 옆으로 넘기는 세력 줄(위 · 촉 · 오 · 군웅의 무리 열넷 — 설계표 `camps` 차례 — 끝에 군웅 전체). 장식 틀 없이 알약 단추.
- [ ] **Step 4: 장수 줄 `Row`** — 세계 셋의 작은 세로 그림(없는 세계는 빈 칸 — 누르면 지금처럼 생성기로) + 이름 · 역할 · 캐릭터만의 컷 직업(`data/casual-own.json` 의 `job_ko`, 세계마다 다르면 고른 세계 것) + 설계 상태 · 능력치는 한 줄로 줄여. 일상컷 접기 · 크게 보기 · 하트는 지금 것 그대로.
- [ ] **Step 5: 도구 판** — 오른쪽 아래 단추(`.dx-tools`) → 아래에서 올라오는 판: 찾기 · 보기 갈래 · 세계 · 화풍 고르개 · 설계 걸러 보기 · 역할로 가기 · 「그림 있는 것만」 · 「새 그림만」 · 「그림 없는 것만」 · 「새 그림 모두 확인」. 왼쪽 아래 「‹ 지도」.
- [ ] **Step 6: 표시 둘과 확인** — 줄에 `data-art` · `data-new`, 세력 줄에 `data-new`. 그 장수의 그림을 크게 열면(`?card=` 로 바로 열린 것 포함) `Tianxia.seen.mark(이름, 그 장수의 가장 늦은 날짜)` 하고 표지를 끈다.
- [ ] **Step 7: 통과를 본다** — `node tests/screen.cjs`(도감 · 생성기 모두) · `node tests/words.cjs`.
- [ ] **Step 8: 커밋** — `목록 도감 정리판 — 그림이 먼저 · 군웅 세력 줄 · 도구 판 · 그림 없음 · 새 그림 표시`.

### Task 6: 바탕 지도 그림 여섯 장

사용자 확인이 두 번 든다 — **기준 한 장을 보이고 멈춘다**, **여섯 장을 보이고 올리기 전에 멈춘다**.

**Files:**
- Create(저장소 밖): `C:\Users\jjshs\sam-map-art\`(지시문 · 원본 · 뽑는 스크립트 — 원소 테마 그림의 `element-theme-art` 와 같은 꼴)
- Modify: `data/tianxia.json`(성 자리 `x` · `y` 를 그림에 맞춘다) · `lib/tianxia.css`/`lib/tianxia.js`(그림 받기 · 밝은 판 · 어두운 판)
- 그림 저장소: `sam-atelier-img/backgrounds/tianxia/<samguk|fantasy|mecha>-<light|dark>.webp`

**Interfaces:**
- Consumes: Task 3 의 바탕 그림 주소 규칙.
- Produces: 여섯 장(세로 2:3, 1024×1536, webp). 그림에 글자 · 국경 · 성 표지 · 사람 없음. 여섯 장의 강 · 산 · 해안선이 같은 자리.

- [ ] **Step 1: 기준 한 장(무협 밝은 판)** — 지시문: 후한 말 중국 땅의 세로 지도(황하 · 장강 · 동쪽 바다 · 서쪽 산지 · 남쪽 산림), 비단에 먹과 옅은 채색으로 그린 고지도, 글자 · 도장 · 국경 · 도시 표지 없음. 두세 장 뽑아 고른다.
- [ ] **Step 2: 사용자에게 보이고 멈춘다** — 지형(강 · 바다 자리)이 괜찮은지.
- [ ] **Step 3: 나머지 다섯 장** — 기준 그림을 참고 그림으로 붙여(편집) 「같은 지도, 강 · 산 · 해안선은 그대로」: 무협 어두운 판(등불 아래 밤), 판타지 밝은 · 어두운 판(양피지), 메카 밝은 · 어두운 판(전술 지도 · 홀로그램).
- [ ] **Step 4: 성 자리를 맞춘다** — 기준 그림 위에 성 표지를 얹은 화면을 찍어 보고 `x` · `y` 를 고친다. 여섯 장 모두에서 성이 강 · 바다 위에 놓이지 않는지 찍어 본다.
- [ ] **Step 5: 화면에 잇는다** — 고른 공간의 밝기(밝은 공간 → `light`)로 판을 고르고, 못 받으면 임시 바탕. `tests/tianxia-screen.cjs` 에 「그림을 받으면 `.tx-map` 의 배경이 그 주소」 한 줄(검사는 그림을 가짜로 내준다).
- [ ] **Step 6: 사용자에게 여섯 장과 화면을 보이고 멈춘다** — 「올려줘」 뒤에 그림 저장소와 코드 저장소에 올린다.

### Task 7: 문서 · 마무리 점검

**Files:**
- Modify: `AGENTS.md`(화면 표 — 타이틀 · 군막 줄을 천하 지도 · 진영 막사로, 도감 줄, 검사 목록) · `docs/PATCH.md` · `sam.webmanifest`(시작 주소가 지도인지 본다)
- Create: `DESIGN.md`

- [ ] **Step 1: `DESIGN.md`** — 이 공방의 길은 「천하 지도 → 진영 막사 → 장수」 이고 목록 도감은 곁길이다 · 다른 공방의 뼈대(머리 + 탭 줄 + 목록)를 복사해 오지 않는다 · 장식 틀은 지도 · 막사 · 목록 줄에 쓰지 않는다 · 새 화면은 폰 시안부터.
- [ ] **Step 2: `AGENTS.md` 화면 표와 검사 줄, `docs/PATCH.md` 한 칸** — `node tests/patch.cjs`.
- [ ] **Step 3: 끝 점검** — 폰(344×882)과 PC(1280)에서 실제로 돌려 본다: 지도 → 판도 다섯 → 세계 셋 → 막사(가장 큰 세력 · 떠도는 세력) → 장수 → 목록 → 지도. 옛 주소 셋. 다른 화면(게임 · 새 판 · 전장 · 프롬프트)에서 「공방으로」 가 지도로 오는지. 검사: `tianxia-data` · `tianxia-core` · `tianxia-screen` · `screen` · `words` · `patch`.
- [ ] **Step 4: 커밋** — `천하 지도 — 문서 · 설계 줄 · 끝 점검`.
