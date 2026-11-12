#!/usr/bin/env node
/* 새 판(draft2) 자료 뽑기 — 옛 게임 draft.html 을 읽기만 해서(CLAUDE.md — 옛 게임은 그대로) 둘을 쓴다.
   data/draft2-combos.json — 결의(COMBO · COMBO.push) · 진영 결속(SYN) · 군웅 계수(ETC_BASE · ETC).
   data/draft2-packs.json  — 확장팩(PACKS — 뒤에 붙인 Object.assign(PACKS.…) 까지): 군웅록 mx(장수마다 거친 세력 career · 기본) ·
   군웅할거 194 · 관도 200 · 적벽 208 · 삼국종결 263(장수 → 세력 facMap). 이름 · 결속 배수 synMul · 적장 기치 bias · 세력 색 · roleMap.
   다시 돌려도 같은 결과(차례 · 모양 고정). 결과 JSON 은 손으로 고치지 않는다 — 새 판의 결의가 옛 표와 갈라지는 날
   이 도구를 걷고 그때부터 JSON 을 원본으로 삼는다.
   Run: node tools/draft2-extract.cjs [--check]   (--check 는 쓰지 않고 지금 파일과 같은지만 본다) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'draft.html'), OUT = path.join(ROOT, 'data/draft2-combos.json'), OUT_PACKS = path.join(ROOT, 'data/draft2-packs.json');

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

/* 확장팩 — PACKS 글자 그대로 + 뒤에 덧붙인 Object.assign(PACKS.<…>, {…}) 들을 같은 차례로 */
function extractPacks() {
  const src = fs.readFileSync(SRC, 'utf8');
  const box = Object.create(null);
  box.PACKS = evalLit(balanced(src, grab(src, /var PACKS=\{/, 'PACKS')));
  const re = /Object\.assign\(PACKS\.[\w.]+,/g;
  let m;
  while ((m = re.exec(src))) {
    const call = balanced(src, m.index + 'Object.assign'.length);
    vm.runInNewContext('Object.assign' + call, box, { timeout: 1000 });
  }
  const def = (/var PACK2=PACKS\.(\w+)/.exec(src) || [])[1];
  if (!def || !box.PACKS[def]) throw new Error('기본 팩(PACK2) 을 못 찾았다');
  const packs = {};
  for (const k of Object.keys(box.PACKS)) {
    const p = box.PACKS[k];
    if (typeof p.n !== 'string' || !p.factions || !(p.career || p.facMap)) throw new Error('팩 모양이 이상하다: ' + k);
    const o = { n: p.n, synMul: p.synMul || 1, bias: p.bias || 0, roleMap: p.roleMap || {}, factions: {} };
    for (const f of Object.keys(p.factions)) o.factions[f] = { h: p.factions[f].h, c: p.factions[f].c };
    if (p.career) { o.career = {}; for (const n of Object.keys(p.career)) o.career[n] = p.career[n].slice(); }
    if (p.facMap) { o.facMap = {}; for (const n of Object.keys(p.facMap)) o.facMap[n] = p.facMap[n]; }
    packs[k] = o;
  }
  return { def, packs };
}
function renderPacks(x) {
  const line = o => JSON.stringify(o), map = (o, ind) => '{\n' + Object.keys(o).map(k => ind + ' ' + line(k) + ': ' + line(o[k])).join(',\n') + '\n' + ind + '}';
  return '{\n' +
    ' "version": 1,\n' +
    ' "source": "draft.html — PACKS · Object.assign(PACKS.…) · PACK2 (tools/draft2-extract.cjs 가 뽑는다, 손으로 고치지 않는다)",\n' +
    ' "note": "새 판(draft2) 진영 셈. career 는 장수가 거친 세력(그 모두에 결속이 센다, 마지막이 카드 색), facMap 은 장수 한 명에 세력 하나. synMul 은 결속 배수, bias 는 적장이 고른 기치 세력 장수에 더하는 값. roleMap 은 옛 판의 역할 바꾸기 — 새 판은 쓰지 않는다(역할 · 기질은 draft2-generals.json)",\n' +
    ' "default": ' + line(x.def) + ',\n' +
    ' "packs": {\n' + Object.keys(x.packs).map(k => {
      const p = x.packs[k], parts = ['   "n": ' + line(p.n), '   "synMul": ' + line(p.synMul), '   "bias": ' + line(p.bias), '   "roleMap": ' + line(p.roleMap), '   "factions": ' + line(p.factions)];
      if (p.career) parts.push('   "career": ' + map(p.career, '   '));
      if (p.facMap) parts.push('   "facMap": ' + map(p.facMap, '   '));
      return '  ' + line(k) + ': {\n' + parts.join(',\n') + '\n  }';
    }).join(',\n') + '\n }\n}\n';
}

if (require.main === module) {
  const outs = [[OUT, render(extract())], [OUT_PACKS, renderPacks(extractPacks())]];
  if (process.argv.includes('--check')) {
    let bad = 0;
    for (const [f, text] of outs) {
      const now = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
      if (now !== text) { console.error(path.relative(ROOT, f) + ' 이 draft.html 과 다르다 — node tools/draft2-extract.cjs'); bad++; }
    }
    if (bad) process.exit(1);
    console.log('draft2-combos · draft2-packs 같음');
  } else {
    for (const [f, text] of outs) fs.writeFileSync(f, text);
    const j = JSON.parse(outs[0][1]), pk = JSON.parse(outs[1][1]);
    console.log('data/draft2-combos.json — 결의 ' + j.combos.length + ' (혈연 ' + j.combos.filter(c => c.k).length +
      ' · 불화 ' + j.combos.filter(c => Object.values(c.t).some(v => v < 0)).length + ')');
    console.log('data/draft2-packs.json — ' + Object.keys(pk.packs).map(k => k + (k === pk.default ? '(기본)' : '') + ' ' + Object.keys(pk.packs[k].career || pk.packs[k].facMap).length + '명').join(' · '));
  }
}
module.exports = { extract, render, extractPacks, renderPacks };
