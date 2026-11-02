/* 글꼴 줄 검사(2026-11-02) — 한자 도장 · 세력 기호 글꼴(Noto Serif KR)은 쓰는 글자만(text=) 받는다.
   설계표에 새 세력 hanja · 장수 seal 이 생겼는데 text 에 없으면 그 글자만 기기 글꼴로 나온다 — 여기서 잡는다.
   본문 · 제목 글꼴 줄이 화면 그리기를 막지 않는지(media=print → onload)도 본다.  Run: node tests/fonts.cjs */
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sam-design.json'), 'utf8'));
const want = new Set([...D.factions.map(f => f.hanja || ''), ...(D.generals || []).map(g => g.seal || '')].join('').replace(/\s/g, ''));
for (const pg of ['hall.html', 'dex.html']) {
  const h = fs.readFileSync(path.join(ROOT, pg), 'utf8'), m = h.match(/family=Noto\+Serif\+KR:wght@900&text=([^&"]+)/);
  assert(m, pg + ' — 한자 글꼴 줄이 없다');
  const have = new Set(decodeURIComponent(m[1])), miss = [...want].filter(c => !have.has(c));
  assert.deepEqual(miss, [], pg + ' — text 에 빠진 한자: ' + miss.join(''));
}
for (const pg of ['index.html', 'hall.html', 'dex.html', 'prompt.html']) {
  const h = fs.readFileSync(path.join(ROOT, pg), 'utf8').replace(/<noscript>[\s\S]*?<\/noscript>/g, '');   // 스크립트가 꺼진 기기 몫은 막아도 된다
  for (const l of h.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/g) || []) assert(/media="print" onload=/.test(l), pg + ' — 글꼴 줄이 화면 그리기를 막는다: ' + l.slice(0, 90));
}
console.log('PASS 글꼴: 한자 ' + want.size + '자가 text 에 다 있음 · 글꼴 줄은 그리기를 막지 않음');
