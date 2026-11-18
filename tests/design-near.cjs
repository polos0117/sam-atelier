/* 비슷한 등록작 찾기(tools/design-near.cjs, 2026-11-18 세계컷 GPT 설계안 3단계) — 셋까지 · 자기 빼고 · 요약 꼴 · GPT 요약 읽기 */
const assert = require('node:assert'), N = require('../tools/design-near.cjs');
const r = N.near('조운', 'samguk');
assert(Array.isArray(r) && r.length <= 3 && r.every(x => / \(samguk\) — face — .*; costume — /.test(x)) && !r.some(x => /^Zhao Yun /.test(x)), '셋까지 · 자기 빼고 · 요약 꼴 ' + JSON.stringify(r));
assert.equal(N.summaryOf({ generation: { free_prompt: 'SUMMARY: oval face; almond eyes\nrest' } }), 'oval face; almond eyes', 'SUMMARY 줄');
assert.equal(N.summaryOf({ generation: { summary: 'x', free_prompt: 'SUMMARY: y' } }), 'x', 'generation.summary 먼저');
console.log('PASS 비슷한 등록작: 셋까지 · 자기 빼고 · 요약 꼴 · GPT 요약(' + r.length + ')');
