/* 그림 저장소 차례 — 도구(Node)가 같이 쓴다(2026-11-12 둘째 저장소를 열며).
   사용자 2026-11-12 「원소쪽은 다른 작업중이라 삼국지 먼저 열자.」 · 「저장소 만들고 토큰 넣었어」 — 첫 저장소 sam-atelier-img 가 GitHub 크기 약 1.0 GB 로 찼다(Pages 권장 1 GB).

   차례는 lib/img.js 의 BASES · tools/register-images.py 의 SHARDS · tools/casual-check.py 의 REPOS 와 같다(tests/img-shards.cjs 가 맞춰 본다).
     0 번 sam-atelier-img    닫힘 — 이미 있는 이름의 교체만. 자동화 상태(잠금 records/automation/claims/ · 설계 주문 free/<장수>/ · records/replacement.json · backgrounds/)는 그대로 여기(STATE)
     1 번 sam-atelier-img-2  열림 — 새 그림 · 새 기록 전부(OPEN)
   쓰는 도구는 새 그림 · 새 기록을 OPEN 에, 읽는 도구는 records 를 받아 둔 저장소 모두에서 읽는다. 저장소를 더할 때는 끝에만 붙인다 */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.join(__dirname, '..');
const REPOS = ['sam-atelier-img', 'sam-atelier-img-2'];
const STATE = REPOS[0], OPEN = REPOS[REPOS.length - 1];
/* 코드 저장소 옆에 받아 둔 저장소 경로(없는 것은 뺀다) */
const sib = r => path.join(ROOT, '..', r);
function dirs() { return REPOS.map(sib).filter(d => fs.existsSync(d)); }
/* 기록 폴더 — 받아 둔 저장소마다 records/<sub>(없는 것은 뺀다). sub 를 비우면 records */
function recordDirs(sub) { return dirs().map(d => path.join(d, 'records', sub || '')).filter(d => fs.existsSync(d)); }
module.exports = { REPOS, STATE, OPEN, sib, dirs, recordDirs, statePath: () => sib(STATE), openPath: () => sib(OPEN) };
