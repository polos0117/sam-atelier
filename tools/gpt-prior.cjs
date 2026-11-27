/* 다른 세계 GPT 설계 글 찾기(2026-11-27 사용자 「gpt 설계가 3가지 세계에서 겹치지 않게 해줘」 → 「얼굴 조합만 다르게」).
   한 폴더에서 이 장수의 다른 세계 GPT 설계 글을 읽어 lib/prompt-sam.js buildWorldFree · worldFillErrors 의 opts.prior([{ world, tag, text }])로 준다.
   이름 꼴 둘 — api25 작업 폴더 <세계>-gpt1.txt · GPT 세션 묶음 <세계>.<화풍>-gpt1.txt(tools/free-brief.cjs). 없는 것은 건너뛴다 */
'use strict';
const fs = require('node:fs'), path = require('node:path');
function priorFrom(dir, worlds, world) {
  if (!dir || !fs.existsSync(dir)) return [];
  const names = fs.readdirSync(dir), out = [];
  for (const w of worlds) {
    if (w === world) continue;
    for (const tag of ['gpt1', 'gpt2']) {
      const f = names.find(n => n === w + '-' + tag + '.txt') || names.find(n => n.startsWith(w + '.') && n.endsWith('-' + tag + '.txt'));
      if (f) out.push({ world: w, tag, text: fs.readFileSync(path.join(dir, f), 'utf8') });
    }
  }
  return out;
}
module.exports = { priorFrom };
