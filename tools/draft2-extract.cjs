#!/usr/bin/env node
/* 새 판(draft2) 결의 자료 뽑기 — 옛 게임 draft.html 의 결의(COMBO) · 진영 결속(SYN) · 군웅 계수(ETC_BASE · ETC)를
   읽어 data/draft2-combos.json 으로 쓴다. draft.html 은 읽기만 한다(CLAUDE.md — 옛 게임은 그대로).
   다시 돌려도 같은 결과(차례 · 모양 고정). 결과 JSON 은 손으로 고치지 않는다 — 새 판의 결의가 옛 표와 갈라지는 날
   이 도구를 걷고 그때부터 JSON 을 원본으로 삼는다.
   Run: node tools/draft2-extract.cjs [--check]   (--check 는 쓰지 않고 지금 파일과 같은지만 본다) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'draft.html'), OUT = path.join(ROOT, 'data/draft2-combos.json');

/* 여는 괄호 자리에서 짝이 맞는 닫는 괄호까지 — 문자열 안의 괄호는 건너뛴다 */
function balanced(src, open) {
  const pair = { '[': ']', '{': '}', '(': ')' }, stack = [];
  let q = null;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; continue; }
    if (pair[ch]) stack.push(pair[ch]);
    else if (ch === ']' || ch === '}' || ch === ')') {
      if (stack.pop() !== ch) throw new Error('괄호가 안 맞는다 @' + i);
      if (!stack.length) return src.slice(open, i + 1);
    }
  }
  throw new Error('닫는 괄호가 없다');
}
const evalLit = s => vm.runInNewContext('(' + s + ')', Object.create(null), { timeout: 1000 });
function grab(src, re, what) {
  const m = re.exec(src);
  if (!m) throw new Error(what + ' 를 draft.html 에서 못 찾았다');
  return m.index + m[0].length - 1;   // 여는 괄호 자리
}

function extract() {
  const src = fs.readFileSync(SRC, 'utf8');
  const combos = evalLit(balanced(src, grab(src, /var COMBO=\[/, 'COMBO')));
  /* 뒤에 붙인 묶음 — COMBO.push( a, b, … ) */
  const pushRe = /COMBO\.push\(/g;
  let m;
  while ((m = pushRe.exec(src))) {
    const inner = balanced(src, m.index + m[0].length - 1);
    combos.push(...evalLit('[' + inner.slice(1, -1) + ']'));
  }
  const syn = evalLit(balanced(src, grab(src, /var SYN=\{/, 'SYN')));
  const etcBase = +(/var ETC_BASE=([\d.]+)/.exec(src) || [])[1];
  const etc = evalLit(balanced(src, grab(src, /ETC=\{/, 'ETC')));
  if (!(etcBase > 0)) throw new Error('ETC_BASE 를 못 찾았다');
  const out = combos.map(c => {
    if (typeof c.n !== 'string' || !Array.isArray(c.m) || !c.t) throw new Error('결의 모양이 이상하다: ' + JSON.stringify(c));
    const t = {};
    Object.keys(c.t).map(Number).sort((a, b) => a - b).forEach(k => { t[k] = c.t[k]; });
    return { n: c.n, k: !!c.k, m: c.m.slice(), t };
  });
  const seen = new Set();
  for (const c of out) { if (seen.has(c.n)) throw new Error('결의 이름이 겹친다: ' + c.n); seen.add(c.n); }
  return { syn, etcBase, etc, combos: out };
}

function render(x) {
  /* 사람이 읽기 좋게 — 결의 한 줄에 하나. 키 차례 고정이라 다시 돌려도 같은 글자 */
  const line = o => JSON.stringify(o);
  return '{\n' +
    ' "version": 1,\n' +
    ' "source": "draft.html — COMBO · COMBO.push · SYN · ETC_BASE · ETC (tools/draft2-extract.cjs 가 뽑는다, 손으로 고치지 않는다)",\n' +
    ' "note": "새 판(draft2) 결의 · 진영 결속. n 이름 · k 혈연 · m 사람 · t {모인 수: 점수} — 음수는 불화. syn 은 같은 진영 n 명의 결속 점수, 군웅은 etcBase 배(etc 의 수 이상 모이면 그 배)",\n' +
    ' "syn": ' + line(x.syn) + ',\n' +
    ' "etcBase": ' + line(x.etcBase) + ',\n' +
    ' "etc": ' + line(x.etc) + ',\n' +
    ' "combos": [\n' + x.combos.map(c => '  ' + line(c)).join(',\n') + '\n ]\n}\n';
}

if (require.main === module) {
  const text = render(extract());
  if (process.argv.includes('--check')) {
    const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (now !== text) { console.error('data/draft2-combos.json 이 draft.html 과 다르다 — node tools/draft2-extract.cjs'); process.exit(1); }
    console.log('draft2-combos 같음');
  } else {
    fs.writeFileSync(OUT, text);
    const j = JSON.parse(text);
    console.log('data/draft2-combos.json — 결의 ' + j.combos.length + ' (혈연 ' + j.combos.filter(c => c.k).length +
      ' · 불화 ' + j.combos.filter(c => Object.values(c.t).some(v => v < 0)).length + ')');
  }
}
module.exports = { extract, render };
